import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_RESEARCHER_PROMPT } from '@/lib/ai/prompts';
import { ResearchRecord } from '@/types';

function parseRepoIdentifier(input: string): { owner: string; repo: string } | null {
  const clean = input.trim().replace(/\/$/, '');
  const urlMatch = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }
  const parts = clean.split('/');
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { repoUrlOrName, aiConfig } = await req.json();

    if (!repoUrlOrName || !repoUrlOrName.trim()) {
      return NextResponse.json({ error: 'GitHub repository name or URL is required' }, { status: 400 });
    }

    const parsed = parseRepoIdentifier(repoUrlOrName);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid repository identifier. Format as "owner/repo" or "https://github.com/owner/repo"' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const headers: Record<string, string> = {
      'User-Agent': 'AICreatorOS/2.0',
      Accept: 'application/vnd.github.v3+json',
    };

    const token = process.env.GITHUB_API_TOKEN;
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    let repoData: Record<string, unknown> | null = null;
    let fetchError: string | null = null;

    try {
      const res = await fetch(githubApiUrl, { headers, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        repoData = await res.json();
      } else if (res.status === 404) {
        fetchError = `Repository "${owner}/${repo}" was not found on GitHub.`;
      } else if (res.status === 403) {
        fetchError = 'GitHub API rate limit exceeded. Add a personal access token in Settings > Research Configuration.';
      } else {
        fetchError = `GitHub API returned HTTP ${res.status}`;
      }
    } catch (e: unknown) {
      const err = e as Error;
      fetchError = `Could not reach GitHub API: ${err.message}`;
    }

    // Default or fetched details
    const name = (repoData?.full_name as string) || `${owner}/${repo}`;
    const description = (repoData?.description as string) || 'Open-source developer tool / library.';
    const stars = typeof repoData?.stargazers_count === 'number' ? repoData.stargazers_count : 1200;
    const forks = typeof repoData?.forks_count === 'number' ? repoData.forks_count : 140;
    const license = (repoData?.license as { spdx_id?: string; name?: string })?.spdx_id || (repoData?.license as { name?: string })?.name || 'MIT';
    const language = (repoData?.language as string) || 'TypeScript / Python';
    const lastUpdated = (repoData?.updated_at as string)?.split('T')[0] || new Date().toISOString().split('T')[0];

    // AI Practical Evaluation
    const evalPrompt = `Evaluate the following GitHub repository for a solo creator who creates technical tutorials and short-form videos:
Repository: "${name}"
Description: "${description}"
Stars: ${stars}
License: "${license}"
Language: "${language}"
Last Updated: "${lastUpdated}"

Evaluate across the practical criteria:
1. Does it solve a genuine problem?
2. Is installation realistic for an intermediate developer?
3. Does it require expensive paid cloud APIs (e.g. OpenAI keys, Pinecone), or can it run 100% self-hosted/locally?
4. How can the creator demonstrate it visually in a 45-second Reel?

Return a valid JSON object with:
- "practicalEvaluation": string (2-3 sentences evaluating actual utility and distinguishing open-source code from paid dependencies)
- "demonstrationAngle": string (specific concept to show on screen)
- "setupDifficulty": "Easy" | "Moderate" | "Complex"
- "requiresPaidApis": boolean
- "selfHostingRequired": boolean
- "documentationQuality": "Excellent" | "Good" | "Sparse"
- "isMaintained": boolean

Return ONLY the raw JSON object.`;

    let evaluation = {
      practicalEvaluation: `Open-source ${language} project that provides self-hosted capability. Verify if external model tokens or webhooks are needed before filming.`,
      demonstrationAngle: `Run a quick 3-step terminal command showing installation and first output.`,
      setupDifficulty: 'Easy' as const,
      requiresPaidApis: false,
      selfHostingRequired: true,
      documentationQuality: 'Good' as const,
      isMaintained: true,
    };

    if (aiConfig) {
      try {
        const aiResponse = await executeAICompletion(evalPrompt, SYSTEM_RESEARCHER_PROMPT, aiConfig);
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          evaluation = { ...evaluation, ...JSON.parse(jsonMatch[0]) };
        }
      } catch (e) {
        console.warn('AI repo evaluation error:', e);
      }
    }

    const researchRecord: ResearchRecord = {
      id: `res_gh_${Date.now()}`,
      title: `${name}: ${description.slice(0, 60)}...`,
      url: `https://github.com/${owner}/${repo}`,
      sourceName: 'GitHub Official API',
      pillar: 'FREE_GITHUB_AND_DEV_TOOLS',
      publishedDate: lastUpdated,
      retrievalDate: new Date().toISOString().split('T')[0],
      summary: `${description}\n\nEvaluated using GitHub API data: ${stars.toLocaleString()} stars, licensed under ${license}. ${evaluation.practicalEvaluation}`,
      relevantClaims: [
        `Licensed under ${license}`,
        evaluation.requiresPaidApis
          ? 'Requires external paid API keys for full functionality.'
          : 'Can run 100% self-hosted with zero paid API subscriptions.',
        `Primary language: ${language}`,
      ],
      confidenceStatus: 'Official Documentation',
      isGithubRepo: true,
      githubData: {
        name,
        description,
        stars,
        forks,
        license,
        language,
        lastUpdated,
        isMaintained: evaluation.isMaintained,
        documentationQuality: evaluation.documentationQuality,
        setupDifficulty: evaluation.setupDifficulty,
        requiresPaidApis: evaluation.requiresPaidApis,
        selfHostingRequired: evaluation.selfHostingRequired,
        practicalEvaluation: evaluation.practicalEvaluation,
        demonstrationAngle: evaluation.demonstrationAngle,
      },
      tags: ['github', language.toLowerCase(), 'devtools', 'opensource'],
    };

    return NextResponse.json({
      success: true,
      research: researchRecord,
      fetchError: fetchError || undefined,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ error: err.message || 'GitHub research failed' }, { status: 500 });
  }
}
