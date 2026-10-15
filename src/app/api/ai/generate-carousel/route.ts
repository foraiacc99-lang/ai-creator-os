import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_STRATEGIST_PROMPT } from '@/lib/ai/prompts';
import { ContentPillar, CarouselProject, StorySequence } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const {
      type = 'carousel',
      topic = 'Practical Web Engineering & Architecture',
      pillar = 'BUILDING_PROJECTS_AND_SYSTEMS',
      targetAudience = 'Software engineers, solo founders & technical creators',
      slideCount = 5,
      storyObjective = 'progress',
      aiConfig,
    } = await req.json();

    const cleanTopic = (topic || '').trim() || 'Modern Web Dev Architecture';

    if (type === 'carousel') {
      let createdCarousel: CarouselProject | null = null;

      if (aiConfig) {
        try {
          const prompt = `You are an expert Instagram Carousel strategist for an authentic technical builder.
Create a complete ${slideCount}-slide Instagram carousel on the topic: "${cleanTopic}".
Content Pillar: "${pillar}"
Target Audience: "${targetAudience}"

Format your response strictly as a JSON object with this exact shape:
{
  "title": string (punchy title under 60 chars),
  "coverSlide": {
    "headline": string (high-impact hook stopping scrolling),
    "subtitle": string (why this matters in 1 sentence),
    "visualNotes": string (layout and visual design cues)
  },
  "slides": [
    {
      "slideNumber": number (1 to ${slideCount}),
      "headline": string (punchy slide headline, e.g. "1. Standardize Data Contracts"),
      "body": string (clear, actionable breakdown in 2-3 sentences),
      "visualDirection": string (diagram, split contrast, code snippet, etc.),
      "supportingExample": string (real-world stat, benchmark, or case)
    }
  ],
  "finalTakeaway": string (one powerful summary rule),
  "callToAction": string (actionable comment or save prompt),
  "caption": string (complete Instagram post caption with line breaks and 4-5 relevant hashtags)
}

Return ONLY raw JSON.`;

          const response = await executeAICompletion(prompt, SYSTEM_STRATEGIST_PROMPT, aiConfig);
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.coverSlide && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
              createdCarousel = {
                id: `car_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                title: parsed.title || `Mastering ${cleanTopic}`,
                pillar: pillar as ContentPillar,
                intendedAudience: targetAudience,
                coverSlide: {
                  headline: parsed.coverSlide.headline || `5 Ways to Optimize ${cleanTopic}`,
                  subtitle: parsed.coverSlide.subtitle || `Fluff-free architectural breakdown from real projects.`,
                  visualNotes: parsed.coverSlide.visualNotes || 'Dark high-contrast card with clean typography.',
                },
                slides: parsed.slides.map((s: { slideNumber?: number; headline?: string; body?: string; visualDirection?: string; supportingExample?: string }, idx: number) => ({
                  slideNumber: s.slideNumber || idx + 1,
                  headline: s.headline || `Step ${idx + 1}: Implementation Rule`,
                  body: s.body || 'Practical engineering approach with zero unnecessary complexity.',
                  visualDirection: s.visualDirection || 'System architecture diagram.',
                  supportingExample: s.supportingExample || 'Based on production developer benchmarks.',
                })),
                finalTakeaway: parsed.finalTakeaway || 'Standardizing your system saves 10x more time than guessing.',
                callToAction: parsed.callToAction || 'Save this carousel for your next build sprint!',
                caption: parsed.caption || `${parsed.title}\n\nSwipe through for the complete breakdown. 📌\n\nSave this for your next sprint! 🚀\n\n#buildinpublic #solodev #creatoros`,
                researchReferences: ['Grounded technical standards & production workflows'],
                status: 'draft',
                updatedAt: new Date().toISOString(),
              };
            }
          }
        } catch (aiErr) {
          console.warn('AI carousel generation error, using dynamic generator:', aiErr);
        }
      }

      if (!createdCarousel) {
        // High-quality dynamic fallback carousel
        createdCarousel = {
          id: `car_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: `5 Bottlenecks in ${cleanTopic} (And How to Fix Them)`,
          pillar: pillar as ContentPillar,
          intendedAudience: targetAudience,
          coverSlide: {
            headline: `5 High-Friction Bottlenecks in ${cleanTopic}`,
            subtitle: `A fluff-free architectural breakdown based on production build sprints.`,
            visualNotes: 'Dark card with high-contrast numbered badges and swipe indicator.',
          },
          slides: [
            {
              slideNumber: 1,
              headline: `1. The Surface Symptom vs. Root Architecture`,
              body: `Most builders waste hours treating surface symptoms in ${cleanTopic}. They add makeshift wrappers instead of fixing core data boundaries.`,
              visualDirection: 'Side-by-side contrast: Fragile ad-hoc setup vs. clean decoupled contract.',
              supportingExample: 'Over 80% of edge-case bugs originate from unvalidated input payloads.',
            },
            {
              slideNumber: 2,
              headline: `2. Standardize Data Models First`,
              body: `Never touch UI or complex libraries before writing strict TypeScript schemas and database contracts for ${cleanTopic}.`,
              visualDirection: 'Code snippet contrasting typed schemas with fragile any-types.',
              supportingExample: 'Standardizing inputs upfront cuts regression debugging time by 10x.',
            },
            {
              slideNumber: 3,
              headline: `3. Isolate Repetitive Friction with Local Scripts`,
              body: `Identify the 3 manual steps you perform repeatedly in ${cleanTopic}. Replace them with standalone local CLI scripts.`,
              visualDirection: 'Terminal screenshot executing self-contained verification command.',
              supportingExample: 'Automating local test runs eliminates 30+ minutes of context switching daily.',
            },
            {
              slideNumber: 4,
              headline: `4. Benchmark Execution Latency Early`,
              body: `Test your ${cleanTopic} pipeline under simulated throttling. Catch waterfalls and unoptimized queries before shipping to users.`,
              visualDirection: 'Network waterfall comparison showing 4.2s vs. 380ms load times.',
              supportingExample: 'Local benchmarking reliably catches memory leaks prior to deployment.',
            },
            {
              slideNumber: 5,
              headline: `5. Build Self-Contained Systems`,
              body: `Stop relying on dozens of brittle third-party cloud APIs. Own your critical application paths with reproducible code.`,
              visualDirection: 'System architecture diagram highlighting decoupled service boundaries.',
              supportingExample: 'Self-hosted and modular architectures eliminate recurring vendor lock-in.',
            },
          ],
          finalTakeaway: `Mastering ${cleanTopic} comes down to standardizing your system rather than guessing.`,
          callToAction: `Save this carousel for your next build sprint and comment below! 🚀`,
          caption: `5 High-Friction Bottlenecks in ${cleanTopic} (And How to Fix Them)\n\nStop wasting time on brittle workarounds. Swipe through for the complete 5-slide breakdown.\n\nSave this post for your next project! 👇\n\n#webdev #buildinpublic #solodev #softwareengineering #creatoros`,
          researchReferences: ['Production benchmarks and verified engineering principles'],
          status: 'draft',
          updatedAt: new Date().toISOString(),
        };
      }

      return NextResponse.json({ success: true, project: createdCarousel });
    } else {
      // Story sequence generation
      let createdStory: StorySequence | null = null;

      if (aiConfig) {
        try {
          const prompt = `You are an expert Instagram Stories strategist for an authentic technical creator.
Create a complete 5-frame Instagram Story sequence on the topic: "${cleanTopic}".
Objective: "${storyObjective}"
Target Audience: "${targetAudience}"

Format your response strictly as a JSON object with this shape:
{
  "title": string (short title),
  "objective": "${storyObjective}",
  "frames": [
    {
      "frameNumber": number (1 to 5),
      "type": "talking_head" | "bts" | "poll" | "question_box" | "link",
      "content": string (what is spoken or shown on the story frame),
      "stickerText": string (text for interactive sticker / poll / badge)
    }
  ]
}

Return ONLY raw JSON.`;

          const response = await executeAICompletion(prompt, SYSTEM_STRATEGIST_PROMPT, aiConfig);
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed.frames) && parsed.frames.length > 0) {
              createdStory = {
                id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                title: parsed.title || `Sprint Update: ${cleanTopic}`,
                objective: storyObjective as StorySequence['objective'],
                frames: parsed.frames.map((f: { frameNumber?: number; type?: string; content?: string; stickerText?: string }, idx: number) => ({
                  frameNumber: f.frameNumber || idx + 1,
                  type: (f.type as StorySequence['frames'][0]['type']) || 'talking_head',
                  content: f.content || 'Sharing daily sprint progress on this build.',
                  stickerText: f.stickerText || 'Daily Update',
                })),
                ctaLink: '/carousel',
                updatedAt: new Date().toISOString(),
              };
            }
          }
        } catch (aiErr) {
          console.warn('AI story generation error, using fallback:', aiErr);
        }
      }

      if (!createdStory) {
        createdStory = {
          id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: `Behind the Scenes: Tackling ${cleanTopic}`,
          objective: (storyObjective as StorySequence['objective']) || 'progress',
          frames: [
            {
              frameNumber: 1,
              type: 'talking_head',
              content: `Day 14 build check-in: Tackling ${cleanTopic} today without any cloud dependencies.`,
              stickerText: 'Daily Sprint ⚡',
            },
            {
              frameNumber: 2,
              type: 'bts',
              content: `Here is the realistic architecture setup running locally in terminal right now.`,
              stickerText: 'Behind the Scenes 🛠️',
            },
            {
              frameNumber: 3,
              type: 'poll',
              content: `When dealing with ${cleanTopic}, what is your biggest bottleneck? Finding reliable tools OR setting up the initial pipeline?`,
              stickerText: 'Poll: Tools vs Pipeline',
            },
            {
              frameNumber: 4,
              type: 'question_box',
              content: `Have questions about how to structure this without paying monthly SaaS subscriptions? Ask below!`,
              stickerText: 'Q&A: Ask Me Anything 💬',
            },
            {
              frameNumber: 5,
              type: 'link',
              content: `I published the complete slide breakdown and notes in my new Carousel. Swipe or tap to view.`,
              stickerText: 'View Carousel ➔',
            },
          ],
          ctaLink: '/carousel',
          updatedAt: new Date().toISOString(),
        };
      }

      return NextResponse.json({ success: true, project: createdStory });
    }
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { error: err.message || 'Failed to generate carousel / story' },
      { status: 500 }
    );
  }
}
