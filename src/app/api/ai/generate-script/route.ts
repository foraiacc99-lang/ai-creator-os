import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_SCRIPTWRITER_PROMPT } from '@/lib/ai/prompts';
import { ScriptItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { idea, styleProfile, action, selectedText, script, aiConfig } = await req.json();

    if (action && script) {
      // Script Refinement action
      const refinePrompt = `Refine the following script according to action: "${action}".
Selected text / target: "${selectedText || 'Entire script'}"
Full Script:
${script.currentSpokenScript}

Creator Style Constraints:
- Rhythm: ${styleProfile?.speakingRhythm || 'Punchy, conversational'}
- Words to avoid: ${(styleProfile?.avoidWords || []).join(', ')}
- Signature expressions: ${(styleProfile?.signatureExpressions || []).join(', ')}

Action Instruction:
${
  action === 'naturalize'
    ? 'Make this sound completely spoken and casual, like an authentic creator talking to a colleague over coffee. Remove any literary words.'
    : action === 'shorten'
    ? 'Cut 30% of the words while keeping 100% of the core message punchy and fast.'
    : action === 'expand'
    ? 'Add a concrete 1-sentence real-world example or visual proof to elevate credibility.'
    : action === 'change_hook'
    ? 'Provide a radically different, ultra-scroll-stopping hook.'
    : `Execute: ${action}`
}

Return the revised text directly.`;

      let revisedText = '';
      if (aiConfig) {
        revisedText = await executeAICompletion(refinePrompt, SYSTEM_SCRIPTWRITER_PROMPT, aiConfig);
      }

      if (!revisedText) {
        if (action === 'naturalize') {
          revisedText = script.currentSpokenScript
            .replace(/in today's world/gi, 'right now')
            .replace(/delve into/gi, 'look at')
            .replace(/revolutionize/gi, 'fix')
            .replace(/testament/gi, 'proof');
        } else if (action === 'shorten') {
          revisedText = script.spokenScriptShort || script.currentSpokenScript;
        } else {
          revisedText = `${script.currentSpokenScript}\n\nNotice the difference? This one change cuts your execution time in half.`;
        }
      }

      return NextResponse.json({ success: true, revisedText });
    }

    // New Script Generation
    const prompt = `Write a complete, high-retention short-form video script for Instagram Reel:
Title: "${idea?.title || 'Creator Workflow'}"
Topic: "${idea?.topic || 'Tech & Productivity'}"
Goal: "${idea?.objective || 'Authority'}"

Creator Style:
- Sentence length: ${styleProfile?.sentenceLengthPreference || 'punchy'}
- Directness: ${styleProfile?.directnessScore || 8}/10
- Avoid words: ${(styleProfile?.avoidWords || []).join(', ')}

Output a valid JSON object with keys:
- "hookOptions": [string, string, string] (3 distinct hook options)
- "spokenScriptShort": string (approx 30s)
- "spokenScriptLong": string (approx 60s)
- "currentSpokenScript": string (recommended starting version)
- "shotList": Array of objects: { "shotNumber": number, "visual": string, "audioSpoken": string, "onScreenText": string, "durationSeconds": number }
- "bRollSuggestions": string[]
- "onScreenTextList": string[]
- "caption": string
- "callToAction": string
- "coverTitle": string
- "structureType": "Problem, Explanation, Solution"
- "tone": string
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
      } catch {
        // Fallback
      }
    }

    if (!generatedScript) {
      const hook1 = idea?.hook || `Stop doing ${idea?.topic || 'this'} the hard way.`;
      const hook2 = `If you want to master ${idea?.topic || 'this'}, you need to know this one rule.`;
      const hook3 = `The non-obvious framework top 1% builders use for ${idea?.topic || 'content'}.`;

      generatedScript = {
        title: idea?.title || 'New Script',
        ideaId: idea?.id,
        hookOptions: [hook1, hook2, hook3],
        selectedHookIndex: 0,
        spokenScriptShort: `${hook1}\n\nMost people get stuck because they focus on symptoms instead of root causes.\n\nHere is the 3-step fix:\n1. Standardize your input.\n2. Automate the friction.\n3. Measure what moves the needle.\n\nSave this post for your next sprint!`,
        spokenScriptLong: `${hook1}\n\nMost people get stuck because they focus on symptoms instead of root causes. They spend hours guessing instead of building.\n\nHere is the 3-step blueprint:\n1. Standardize your input before touching any tools.\n2. Isolate the repetitive friction and automate it with a simple script.\n3. Measure what moves the needle and double down.\n\nSave this post and comment "BLUEPRINT" below—I will DM you the template!`,
        currentSpokenScript: `${hook1}\n\nMost people get stuck because they focus on symptoms instead of root causes.\n\nHere is the 3-step blueprint:\n1. Standardize your input before touching any tools.\n2. Isolate the repetitive friction and automate it.\n3. Measure what moves the needle.\n\nComment below to get the free template!`,
        shotList: [
          {
            shotNumber: 1,
            visual: 'Direct to camera with energetic forward lean',
            audioSpoken: hook1,
            onScreenText: 'STOP DOING THIS 🚨',
            durationSeconds: 4,
          },
          {
            shotNumber: 2,
            visual: 'Screen recording highlighting the common mistake',
            audioSpoken: 'Most people focus on the wrong problem.',
            onScreenText: 'THE REAL MISTAKE ❌',
            durationSeconds: 6,
          },
          {
            shotNumber: 3,
            visual: 'Visual walkthrough of the 3-step fix',
            audioSpoken: 'Here is the 3-step fix to eliminate the headache.',
            onScreenText: 'THE 3-STEP FIX 🛠️',
            durationSeconds: 14,
          },
          {
            shotNumber: 4,
            visual: 'Talking head cutback with comment CTA',
            audioSpoken: 'Comment below to get the free template!',
            onScreenText: 'COMMENT FOR LINK 📥',
            durationSeconds: 5,
          },
        ],
        bRollSuggestions: ['Screen recording of workspace', 'Close up of hands typing', 'Flowchart diagram'],
        onScreenTextList: ['STOP DOING THIS 🚨', 'THE REAL MISTAKE ❌', 'THE 3-STEP FIX 🛠️', 'COMMENT FOR LINK 📥'],
        caption: `${idea?.description || 'A practical breakdown of content workflows.'}\n\nSave this Reel and follow for daily actionable creator playbooks! 🚀\n\n#creatoros #productivity #workflow`,
        callToAction: 'Comment below for the free blueprint',
        coverTitle: idea?.title?.toUpperCase() || 'PRACTICAL PLAYBOOK',
        structureType: 'Problem, Explanation, Solution',
        tone: 'Direct, insightful, conversational',
        estimatedDurationSeconds: 29,
        status: 'draft',
        version: 1,
      };
    }

    return NextResponse.json({
      success: true,
      script: {
        ...generatedScript,
        id: `script_${Date.now()}`,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Script generation failed' }, { status: 500 });
  }
}
