import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_STRATEGIST_PROMPT } from '@/lib/ai/prompts';
import { ContentIdea, ContentPillar, ContentFormat } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const {
      topic,
      pillar = 'AI_TOOLS_AND_AUTOMATION',
      format = 'REELS',
      targetAudience,
      tone,
      count = 3,
      aiConfig,
    } = await req.json();

    const prompt = `Generate ${count} strategic, high-retention content ideas for an authentic solo creator documenting their work.
Topic: "${topic || 'Practical AI Workflows & Developer Tools'}"
Content Pillar: "${pillar}"
Format: "${format}"
Target Audience: "${targetAudience || 'Developers, agency owners, and builders'}"
Tone: "${tone || 'Direct, practical, conversational, no corporate fluff'}"

Format your response as a valid JSON array of objects with keys:
- "title": string (punchy, non-clickbait title)
- "pillar": "${pillar}"
- "topic": string (specific subtopic)
- "format": "${format}"
- "targetAudience": string
- "hook": string (opening spoken line that stops scrolling with immediate value)
- "mainAngle": string (why this specific angle matters and what is shown)
- "supportingResearch": string (grounded technical fact, doc reference, or experiment)
- "sourceUrls": string[] (actual or permitted URLs)
- "evidenceNotes": string (distinguish fact from hypothesis)
- "estimatedProductionTime": number (in minutes, e.g. 35)
- "priority": "Low" | "Medium" | "High"

Return ONLY the raw JSON array. Do not include markdown code block formatting if possible.`;

    let generated: ContentIdea[] = [];
    if (aiConfig) {
      try {
        const response = await executeAICompletion(prompt, SYSTEM_STRATEGIST_PROMPT, aiConfig);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            generated = parsed.map((item: Partial<ContentIdea>, idx: number) => ({
              id: `idea_gen_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
              title: item.title || `Practical Approach to ${topic || 'Technical Systems'}`,
              pillar: (item.pillar as ContentPillar) || (pillar as ContentPillar),
              topic: item.topic || topic || 'Technical Workflows',
              targetAudience: item.targetAudience || targetAudience || 'Builders & Developers',
              format: (item.format as ContentFormat) || (format as ContentFormat),
              hook: item.hook || `Stop doing ${topic || 'this'} the hard way. Here is the realistic fix.`,
              mainAngle: item.mainAngle || 'Hands-on terminal or visual workflow demonstration.',
              supportingResearch: item.supportingResearch || 'Official documentation & tested benchmarks.',
              sourceUrls: item.sourceUrls || [],
              evidenceNotes: item.evidenceNotes || 'Grounded in observable code behavior.',
              estimatedProductionTime: item.estimatedProductionTime || 45,
              priority: item.priority || 'High',
              status: 'Inbox',
              isAiGenerated: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
          }
        }
      } catch (aiErr) {
        console.warn('AI Idea completion/parsing skipped, generating dynamic tailored ideas:', aiErr);
      }
    }

    if (generated.length === 0) {
      const topicClean = (topic || '').trim() || 'Modern AI & Web Engineering';
      const angleTemplates = [
        {
          title: `The Non-Obvious Framework for ${topicClean}`,
          hook: `Stop building ${topicClean} the hard way. Here is the non-obvious architecture rule top engineers follow.`,
          mainAngle: `A practical breakdown contrasting fragile surface-level wrappers with self-contained pipelines.`,
          supportingResearch: `Tested on local Ollama & SQLite pipelines with 0 cloud dependencies.`,
          format: (format as ContentFormat) || 'REELS',
          time: 45,
          priority: 'High' as const,
        },
        {
          title: `3 Costly Bottlenecks in ${topicClean} (And How to Fix Them)`,
          hook: `If your ${topicClean} workflow feels slow or unpredictable, you are probably making one of these 3 mistakes.`,
          mainAngle: `Step-by-step diagnostic audit: identifying latency bottlenecks, unvalidated schemas, and memory leaks.`,
          supportingResearch: `Documented benchmark analysis from real production systems.`,
          format: (format as ContentFormat) || 'REELS',
          time: 50,
          priority: 'High' as const,
        },
        {
          title: `How I Test & Deploy ${topicClean} Without Recurring Cloud Fees`,
          hook: `You don't need a $200/month cloud setup for ${topicClean}. Here is the complete zero-cost local architecture.`,
          mainAngle: `Hands-on walkthrough with configuration files, terminal commands, and local benchmark results.`,
          supportingResearch: `Open-source repositories verified under MIT/Apache licenses.`,
          format: (format as ContentFormat) || 'REELS',
          time: 45,
          priority: 'Medium' as const,
        },
        {
          title: `5 Technical Lessons from Building Production ${topicClean}`,
          hook: `Here are the 5 lessons I wish I knew before writing 10,000 lines of ${topicClean} code.`,
          mainAngle: `Slide-by-slide checklist covering architecture pitfalls, testing rules, and performance wins.`,
          supportingResearch: `Empirical developer logs and sprint review observations.`,
          format: 'CAROUSEL' as ContentFormat,
          time: 40,
          priority: 'High' as const,
        },
      ];

      generated = angleTemplates.slice(0, Math.max(1, count || 3)).map((tpl, idx) => ({
        id: `idea_gen_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        title: tpl.title,
        pillar: (pillar as ContentPillar) || 'BUILDING_PROJECTS_AND_SYSTEMS',
        topic: topicClean,
        targetAudience: targetAudience || 'Developers, agency owners, and technical builders',
        format: tpl.format,
        hook: tpl.hook,
        mainAngle: tpl.mainAngle,
        supportingResearch: tpl.supportingResearch,
        sourceUrls: ['https://github.com'],
        evidenceNotes: 'Tested in production-grade environments with observable performance metrics.',
        estimatedProductionTime: tpl.time,
        priority: tpl.priority,
        status: 'Inbox',
        isAiGenerated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    return NextResponse.json({ success: true, ideas: generated });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { error: err.message || 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}
