import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_STRATEGIST_PROMPT } from '@/lib/ai/prompts';
import { ContentIdea, ContentObjective, ContentFormat } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { topic, objective, format, targetAudience, tone, count = 3, aiConfig } = await req.json();

    const prompt = `Generate ${count} strategic, high-retention content ideas for an Instagram creator.
Topic Focus: ${topic || 'AI & Tech Productivity'}
Objective: ${objective || 'Authority'}
Format: ${format || 'REELS'}
Target Audience: ${targetAudience || 'Developers, Solopreneurs, Creators'}
Tone: ${tone || 'Direct, practical, conversational'}

Format your response as a valid JSON array of objects with keys:
- "title": string (punchy title)
- "description": string (clear summary)
- "topic": string
- "format": "REELS" | "CAROUSEL" | "IMAGE"
- "targetAudience": string
- "hook": string (the opening line)
- "objective": "${objective || 'Authority'}"
- "estimatedFilmingMinutes": number
- "difficulty": "Easy" | "Medium" | "Advanced"
- "source": "AI Recommendation"

Return ONLY the raw JSON array.`;

    let generated: ContentIdea[] = [];
    if (aiConfig) {
      const response = await executeAICompletion(prompt, SYSTEM_STRATEGIST_PROMPT, aiConfig);
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          generated = parsed.map((item: any, idx: number) => ({
            ...item,
            id: `idea_gen_${Date.now()}_${idx}`,
            status: 'idea',
            createdAt: new Date().toISOString(),
          }));
        }
      } catch {
        // Fallback below
      }
    }

    if (generated.length === 0) {
      // High-grade fallback ideas based on provided inputs
      generated = [
        {
          id: `idea_gen_${Date.now()}_1`,
          title: `Why Most Builders Fail at ${topic || 'AI Workflows'}`,
          description: `A critical breakdown contrasting surface-level automation with standardized decision engines.`,
          topic: topic || 'Workflow Engineering',
          format: (format as ContentFormat) || 'REELS',
          targetAudience: targetAudience || 'Founders & Engineers',
          hook: `If you are trying to automate ${topic || 'your workflow'} without standardizing your inputs first, stop.`,
          objective: (objective as ContentObjective) || 'Authority',
          estimatedFilmingMinutes: 25,
          difficulty: 'Easy',
          source: 'AI Recommendation',
          status: 'idea',
          createdAt: new Date().toISOString(),
        },
        {
          id: `idea_gen_${Date.now()}_2`,
          title: `The 3-Step Framework for ${topic || 'Rapid Prototyping'}`,
          description: `Tactical walkthrough showing the exact tooling sequence to ship in hours instead of days.`,
          topic: topic || 'System Architecture',
          format: (format as ContentFormat) || 'CAROUSEL',
          targetAudience: targetAudience || 'Indie Hackers',
          hook: `How to build and deploy a working prototype in 45 minutes using open-source tools.`,
          objective: (objective as ContentObjective) || 'Engagement',
          estimatedFilmingMinutes: 35,
          difficulty: 'Medium',
          source: 'AI Recommendation',
          status: 'idea',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return NextResponse.json({ success: true, ideas: generated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to generate ideas' }, { status: 500 });
  }
}
