import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_SCRIPTWRITER_PROMPT } from '@/lib/ai/prompts';
import { ScriptItem, ScriptShot } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { idea, styleProfile, action, selectedText, script, aiConfig } = await req.json();

    if (action && script) {
      // Script Refinement action
      const refinePrompt = `Refine the following short-form video script according to action: "${action}".
Target section: "${selectedText || 'Entire script'}"

Current Script:
"""
${script.currentSpokenScript}
"""

Creator Voice Profile:
- Speaking rhythm: ${styleProfile?.speakingRhythm || 'Direct, conversational, natural pauses'}
- Sentence length: ${styleProfile?.sentenceLengthPreference || 'punchy'}
- Words to strictly avoid: ${(styleProfile?.avoidWords || []).join(', ') || 'corporate buzzwords'}
- Signature phrases: ${(styleProfile?.signatureExpressions || []).join(', ') || 'practical breakdown'}

Action Specifics:
${
  action === 'naturalize'
    ? 'Make this sound completely spoken, like a creator talking directly to a friend at a desk. Remove any literary words, artificial corporate polish, or textbook phrasing.'
    : action === 'shorten'
    ? 'Cut 25-30% of unnecessary filler words while preserving 100% of the core tactical value.'
    : action === 'expand'
    ? 'Add a concrete 1-sentence real-world demonstration, terminal command, or measurable result to enhance credibility.'
    : action === 'change_hook'
    ? 'Provide a radically different, ultra-scroll-stopping opening hook sentence that immediately states a problem or non-obvious observation.'
    : `Execute: ${action}`
}

Return ONLY the refined script text directly. Do not include markdown preamble or conversational intros.`;

      let revisedText = '';
      if (aiConfig) {
        revisedText = await executeAICompletion(refinePrompt, SYSTEM_SCRIPTWRITER_PROMPT, aiConfig);
      }

      if (!revisedText) {
        if (action === 'naturalize') {
          revisedText = script.currentSpokenScript
            .replace(/in today's digital world/gi, 'right now')
            .replace(/delve into/gi, 'look at')
            .replace(/revolutionize/gi, 'fix')
            .replace(/game-changer/gi, 'useful tool')
            .replace(/testament/gi, 'proof')
            .replace(/supercharge/gi, 'speed up');
        } else if (action === 'shorten') {
          revisedText = script.spokenScriptShort || script.currentSpokenScript;
        } else {
          revisedText = `${script.currentSpokenScript}\n\nNotice the difference? This one change cuts your execution time in half.`;
        }
      }

      return NextResponse.json({ success: true, revisedText });
    }

    // New Script Generation from Idea
    const prompt = `Write a complete, high-retention short-form video script for Instagram Reels / YouTube Shorts:
Title: "${idea?.title || 'Creator Workflow'}"
Pillar: "${idea?.pillar || 'BUILDING_PROJECTS_AND_SYSTEMS'}"
Topic: "${idea?.topic || 'Tech & Productivity'}"
Target Audience: "${idea?.targetAudience || 'Developers & Builders'}"
Main Angle: "${idea?.mainAngle || 'Practical demonstration'}"
Supporting Research / Evidence: "${idea?.supportingResearch || 'Tested on live project'}"

Creator Style:
- Sentence length: ${styleProfile?.sentenceLengthPreference || 'punchy'}
- Directness: ${styleProfile?.directnessScore || 9}/10
- Avoid words: ${(styleProfile?.avoidWords || []).join(', ')}

DURATION & PACING REQUIREMENT (MANDATORY):
- Target Duration: 45 to 60 seconds (strictly 120 to 150 spoken words at 145 WPM speaking pace).
- DO NOT generate short 20-30 second scripts. Provide rich, actionable, step-by-step depth so that speaking it takes at least 45 to 55 seconds.

Output a valid JSON object with keys:
- "hookOptions": [string, string, string] (3 distinct hook styles: Problem-first, Contrarian, and Metric/Outcome)
- "spokenScriptShort": string (approx 45s version, ~115 words)
- "spokenScriptLong": string (approx 60s version, ~145-155 words)
- "currentSpokenScript": string (recommended full version, approx 50-55s, 125-145 words, structured into: Hook, Core Problem Setup, 3-Step Practical Solution, Proof/Measurable Outcome, and Call to Action)
- "shotList": Array of objects: { "shotNumber": number, "visual": string, "audioSpoken": string, "onScreenText": string, "durationSeconds": number } (at least 4-5 shots totaling 48-55 seconds)
- "bRollSuggestions": string[]
- "onScreenTextList": string[]
- "caption": string
- "callToAction": string
- "coverTitle": string
- "structureType": "Problem, Explanation, Solution"
- "tone": string
- "shootingPlan": string
- "editingNotes": string
- "estimatedDurationSeconds": number (between 45 and 60)

Return ONLY raw JSON.`;

    let generatedScript: Partial<ScriptItem> | null = null;
    if (aiConfig) {
      const response = await executeAICompletion(prompt, SYSTEM_SCRIPTWRITER_PROMPT, aiConfig);
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedScript = JSON.parse(jsonMatch[0]);
        }
      } catch (parseErr) {
        console.warn('Could not parse generated script JSON:', parseErr);
      }
    }

    if (!generatedScript) {
      const hook1 = idea?.hook || `Stop doing ${idea?.topic || 'this'} the hard way. Here is the realistic fix.`;
      const hook2 = `If you want to master ${idea?.topic || 'this'}, avoid this common beginner mistake.`;
      const hook3 = `The non-obvious framework top 1% builders use for ${idea?.topic || 'projects'}.`;

      const spoken = `${hook1}\n\nMost creators and technical builders get stuck on ${idea?.topic || 'this workflow'} because they focus on surface-level symptoms instead of the underlying architecture. They spend hours guessing and debugging rather than executing a proven workflow.\n\nHere is the realistic 3-step framework that actually fixes it:\n\nStep 1: Standardize your core data models and requirements before touching any tools or external code. Unvalidated inputs cause over 80% of edge case failures.\n\nStep 2: Isolate the repetitive manual friction in your current pipeline and eliminate it with a self-contained, automated script.\n\nStep 3: Measure execution latency and double down strictly on what produces verifiable outcomes.\n\nNotice the key difference: you stop wasting time on brittle workarounds and take back full control of your technical systems.\n\nSave this video for your next build sprint, and comment below if you want the full implementation template!`;

      const shotList: ScriptShot[] = [
        {
          shotNumber: 1,
          visual: 'Direct eye contact to camera with energetic forward lean at desk',
          audioSpoken: hook1,
          onScreenText: 'STOP DOING THIS 🛑',
          durationSeconds: 8,
        },
        {
          shotNumber: 2,
          visual: 'Screen recording highlighting the common error or friction point',
          audioSpoken: `Most builders get stuck on ${idea?.topic || 'this workflow'} because they focus on surface-level symptoms instead of root architecture.`,
          onScreenText: 'THE REAL BOTTLENECK ⚠️',
          durationSeconds: 11,
        },
        {
          shotNumber: 3,
          visual: 'Visual walkthrough of the 3-step fix with terminal or diagram overlays',
          audioSpoken: 'Step 1: Standardize inputs. Step 2: Eliminate friction with a script. Step 3: Measure real execution speed.',
          onScreenText: 'THE 3-STEP FIX 🛠️',
          durationSeconds: 18,
        },
        {
          shotNumber: 4,
          visual: 'Visual proof showing the latency or output improvement side-by-side',
          audioSpoken: 'Notice the difference: you eliminate fragile workarounds and take back full control of your systems.',
          onScreenText: 'MEASURABLE OUTCOMES ⚡',
          durationSeconds: 9,
        },
        {
          shotNumber: 5,
          visual: 'Talking head cutback with comment / save CTA overlay',
          audioSpoken: 'Save this video for your next build sprint, and comment below if you want the full implementation template!',
          onScreenText: 'SAVE THIS POST 📥',
          durationSeconds: 6,
        },
      ];

      generatedScript = {
        title: idea?.title || 'New Script',
        pillar: idea?.pillar || 'BUILDING_PROJECTS_AND_SYSTEMS',
        ideaId: idea?.id,
        hookOptions: [hook1, hook2, hook3],
        selectedHookIndex: 0,
        spokenScriptShort: `${hook1}\n\nHere is the realistic 3-step fix for ${idea?.topic || 'this'}:\n1. Standardize your input models.\n2. Isolate friction with automated scripts.\n3. Measure real execution speed.\n\nSave this video for your next sprint!`,
        spokenScriptLong: spoken,
        currentSpokenScript: spoken,
        shotList,
        bRollSuggestions: ['Screen recording of terminal execution', 'Close-up of hands typing', 'Flowchart diagram'],
        onScreenTextList: ['STOP DOING THIS 🛑', 'THE REAL BOTTLENECK ⚠️', 'THE 3-STEP FIX 🛠️', 'MEASURABLE OUTCOMES ⚡', 'SAVE THIS POST 📥'],
        caption: `${idea?.mainAngle || 'A practical breakdown of content workflows.'}\n\nSave this Reel for your next build sprint! 🚀\n\n#buildinpublic #solodev #creatoros`,
        callToAction: 'Save this video for your next build sprint!',
        coverTitle: (idea?.title || 'PRACTICAL PLAYBOOK').toUpperCase(),
        structureType: 'Problem, Explanation, Solution',
        tone: 'Direct, insightful, conversational',
        estimatedDurationSeconds: 52,
        shootingPlan: 'Record 3 takes of the opening hook first. Keep energy consistent.',
        editingNotes: 'Tight cuts on breath pauses. Ensure subtitle words highlight on beat.',
        status: 'draft',
        version: 1,
      };
    }

    // Ensure estimated duration accurately reflects the spoken script length (minimum 48s)
    const scriptWords = (generatedScript.currentSpokenScript || '').trim().split(/\s+/).filter(Boolean).length;
    const computedDuration = Math.max(48, Math.round((scriptWords / 145) * 60));
    generatedScript.estimatedDurationSeconds = Math.max(computedDuration, generatedScript.estimatedDurationSeconds || 48);

    return NextResponse.json({
      success: true,
      script: {
        ...generatedScript,
        id: `script_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ error: err.message || 'Script generation failed' }, { status: 500 });
  }
}
