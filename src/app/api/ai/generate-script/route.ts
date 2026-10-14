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

Output a valid JSON object with keys:
- "hookOptions": [string, string, string] (3 distinct hook styles: Problem-first, Contrarian, and Metric/Outcome)
- "spokenScriptShort": string (approx 30s version)
- "spokenScriptLong": string (approx 55s version)
- "currentSpokenScript": string (recommended starting version, approx 35-40s)
- "shotList": Array of objects: { "shotNumber": number, "visual": string, "audioSpoken": string, "onScreenText": string, "durationSeconds": number }
- "bRollSuggestions": string[]
- "onScreenTextList": string[]
- "caption": string
- "callToAction": string
- "coverTitle": string
- "structureType": "Problem, Explanation, Solution"
- "tone": string
- "shootingPlan": string
- "editingNotes": string
- "estimatedDurationSeconds": number

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

      const spoken = `${hook1}\n\nMost people get stuck because they focus on symptoms instead of root causes. They spend hours guessing instead of building.\n\nHere is the 3-step fix:\n1. Standardize your input before touching any tools.\n2. Isolate the repetitive friction and automate it with a simple script.\n3. Measure what moves the needle.\n\nSave this Reel for your next build sprint!`;

      const shotList: ScriptShot[] = [
        {
          shotNumber: 1,
          visual: 'Direct eye contact to camera with energetic forward lean at desk',
          audioSpoken: hook1,
          onScreenText: 'STOP DOING THIS 🛑',
          durationSeconds: 5,
        },
        {
          shotNumber: 2,
          visual: 'Screen recording highlighting the common error or friction point',
          audioSpoken: 'Most people get stuck because they focus on symptoms instead of root causes.',
          onScreenText: 'THE COMMON MISTAKE ⚠️',
          durationSeconds: 6,
        },
        {
          shotNumber: 3,
          visual: 'Visual walkthrough of the 3-step fix with terminal or diagram overlays',
          audioSpoken: 'Here is the 3-step fix: 1. Standardize input. 2. Isolate friction. 3. Measure results.',
          onScreenText: 'THE 3-STEP FIX 🛠️',
          durationSeconds: 14,
        },
        {
          shotNumber: 4,
          visual: 'Talking head cutback with comment / save CTA overlay',
          audioSpoken: 'Save this Reel for your next build sprint!',
          onScreenText: 'SAVE THIS POST 📥',
          durationSeconds: 5,
        },
      ];

      generatedScript = {
        title: idea?.title || 'New Script',
        pillar: idea?.pillar || 'BUILDING_PROJECTS_AND_SYSTEMS',
        ideaId: idea?.id,
        hookOptions: [hook1, hook2, hook3],
        selectedHookIndex: 0,
        spokenScriptShort: `${hook1}\n\n1. Standardize your input.\n2. Cut the friction.\n3. Measure outcomes.\n\nSave this for your next sprint!`,
        spokenScriptLong: spoken,
        currentSpokenScript: spoken,
        shotList,
        bRollSuggestions: ['Screen recording of terminal execution', 'Close-up of hands typing', 'Flowchart diagram'],
        onScreenTextList: ['STOP DOING THIS 🛑', 'THE COMMON MISTAKE ⚠️', 'THE 3-STEP FIX 🛠️', 'SAVE THIS POST 📥'],
        caption: `${idea?.mainAngle || 'A practical breakdown of content workflows.'}\n\nSave this Reel for your next build sprint! 🚀\n\n#buildinpublic #solodev #creatoros`,
        callToAction: 'Save this video for your next build sprint!',
        coverTitle: (idea?.title || 'PRACTICAL PLAYBOOK').toUpperCase(),
        structureType: 'Problem, Explanation, Solution',
        tone: 'Direct, insightful, conversational',
        estimatedDurationSeconds: 30,
        shootingPlan: 'Record 3 takes of the opening hook first. Keep energy consistent.',
        editingNotes: 'Tight cuts on breath pauses. Ensure subtitle words highlight on beat.',
        status: 'draft',
        version: 1,
      };
    }

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
