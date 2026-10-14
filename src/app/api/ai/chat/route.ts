import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_STRATEGIST_PROMPT } from '@/lib/ai/prompts';
import { ChatMessageAction } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { message, history, contextData, aiConfig } = await req.json();

    const ideas = contextData?.ideas || [];
    const scripts = contextData?.scripts || [];
    const snapshots = contextData?.snapshots || [];
    const research = contextData?.research || [];
    const reports = contextData?.reports || [];
    const competitors = contextData?.competitors || [];
    const preferences = contextData?.preferences || {};

    const latestSnapshot = snapshots[0] || null;

    const contextSummary = `
CREATOR OS SAVED CONTEXT:
- App Name: ${preferences.appName || 'AI Creator OS'}
- Available Filming Hours: ${preferences.availableFilmingHoursPerWeek || 4}h/week
- Target Audience: ${preferences.targetAudience || 'Developers, agency owners, and builders'}
- Goals: ${(preferences.contentGoals || []).join(', ')}
- Avoid Words: ${(preferences.avoidWords || []).join(', ')}

LATEST MANUALLY ENTERED METRICS (${latestSnapshot ? latestSnapshot.date : 'No snapshots yet'}):
- Total Followers: ${latestSnapshot ? latestSnapshot.totalFollowers.toLocaleString() : 'N/A'}
- Reach: ${latestSnapshot ? latestSnapshot.reach.toLocaleString() : 'N/A'}
- Total Content Views: ${latestSnapshot ? latestSnapshot.totalViews.toLocaleString() : 'N/A'}
- Engagement Rate: ${latestSnapshot ? latestSnapshot.engagementRate + '%' : 'N/A'}
- Notes: ${latestSnapshot ? latestSnapshot.notes : 'None'}

RECENT SAVED CONTENT IDEAS (${ideas.length} total):
${ideas.slice(0, 4).map((i: { title: string; pillar: string; status: string }) => `- [${i.status}] ${i.title} (${i.pillar})`).join('\n')}

RECENT SAVED SCRIPTS (${scripts.length} total):
${scripts.slice(0, 3).map((s: { title: string; status: string; estimatedDurationSeconds: number }) => `- [${s.status}] ${s.title} (~${s.estimatedDurationSeconds}s)`).join('\n')}

RECENT RESEARCH DISCOVERIES (${research.length} total):
${research.slice(0, 3).map((r: { title: string; pillar: string; sourceName: string }) => `- ${r.title} (${r.sourceName})`).join('\n')}

RECENT CREATOR REPORTS & LESSONS (${reports.length} total):
${reports.slice(0, 2).map((rp: { title: string; category: string; observations: string }) => `- [${rp.category}] ${rp.title}: ${rp.observations.slice(0, 100)}...`).join('\n')}

COMPETITOR WATCHLIST (${competitors.length} creators):
${competitors.slice(0, 2).map((c: { creatorName: string; pillars: string[] }) => `- ${c.creatorName} (Focus: ${c.pillars.join(', ')})`).join('\n')}
`;

    const fullSystemPrompt = `${SYSTEM_STRATEGIST_PROMPT}\n\n${contextSummary}\n\nYou are answering the creator's question. Reference their actual saved ideas, scripts, manual metrics, or research where relevant. If you suggest a concrete idea or plan, make it clear and grounded.`;

    let aiResponse = '';
    const suggestedActions: ChatMessageAction[] = [];

    if (aiConfig) {
      aiResponse = await executeAICompletion(message, fullSystemPrompt, aiConfig);
    }

    if (!aiResponse) {
      const lower = message.toLowerCase();

      if (lower.includes('today') || lower.includes('shoot') || lower.includes('film')) {
        const readyScript = scripts.find((s: { status: string }) => s.status === 'ready_for_filming') || scripts[0];
        if (readyScript) {
          aiResponse = `Here is your top priority for today:

**Shoot:** "${readyScript.title}"
- **Current Stage:** Ready for Filming
- **Estimated Speaking Time:** ~${readyScript.estimatedDurationSeconds || 28} seconds
- **Opening Hook:** "${readyScript.hookOptions?.[readyScript.selectedHookIndex] || readyScript.currentSpokenScript?.slice(0, 60)}..."
- **Recommended Action:** Open Script Studio, rehearse 2 takes of the hook, and record your desk talking-head shot.`;

          suggestedActions.push({
            type: 'generate_script',
            label: 'Open in Script Studio',
            data: { scriptId: readyScript.id },
          });
        } else {
          aiResponse = `You don't have any scripts marked as "Ready to Shoot" yet. Let's move an idea into Script Studio or generate a new concept based on your **Sales & Client Acquisition** pillar!`;
        }
      } else if (lower.includes('sales') || lower.includes('cold call') || lower.includes('client')) {
        aiResponse = `Here are 2 practical content angles for your **Sales, Psychology & Client Acquisition** pillar:

1. **"The 45-Second Cold Call Script for Selling Website Audits"** (Reel)
   - *Opening Hook:* "Never call a business owner and ask if they need a website. Ask them this instead."
   - *Core Angle:* Roleplay pointing out an unclickable phone number on mobile. Reframe price as customer lifetime value.

2. **"Why Sending a Price Quote Over Email Kills Web Dev Deals"** (Carousel)
   - *Core Angle:* Explaining why quotes should always be walked through on a 5-minute video or call to address scope objections before they freeze.

Would you like me to save angle #1 directly into your **Content Ideas Library**?`;

        suggestedActions.push({
          type: 'create_idea',
          label: 'Save "45-Second Cold Call Script" Idea',
          data: {
            title: 'The 45-Second Cold Call Script for Website Audits',
            pillar: 'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION',
            topic: 'Cold calling scripts for local businesses',
            format: 'REELS',
            hook: 'Never call a business owner and ask if they need a website. Ask them this instead.',
          },
        });
      } else if (lower.includes('repo') || lower.includes('github') || lower.includes('open source')) {
        aiResponse = `Based on your saved research on **Crawl4AI** and **LiveKit Agents**:

**Concept:** "Stop Paying Cloud Scraping APIs: Self-Host Crawl4AI"
- **Pillar:** Free GitHub Repos & Dev Tools
- **Format:** 45-second Reel
- **Hook:** "If you are paying $30/month for an AI web scraper, here is an open-source GitHub repo you can run locally with 3 lines of Python."
- **Why It Works:** It directly solves developer friction with zero recurring API costs.

Should I create a script draft for this in **Script Studio**?`;

        suggestedActions.push({
          type: 'create_idea',
          label: 'Save Crawl4AI Repo Idea',
          data: {
            title: 'Stop Paying Cloud Scraping APIs: Self-Host Crawl4AI',
            pillar: 'FREE_GITHUB_AND_DEV_TOOLS',
            topic: 'Open-source web crawlers for LLMs',
            format: 'REELS',
            hook: 'If you are paying $30/month for an AI web scraper, here is an open-source GitHub repo you can run locally.',
          },
        });
      } else if (lower.includes('metric') || lower.includes('growth') || lower.includes('followers') || lower.includes('reach')) {
        if (latestSnapshot) {
          aiResponse = `Looking at your latest manual growth snapshot from **${latestSnapshot.date}**:
- **Total Followers:** ${latestSnapshot.totalFollowers.toLocaleString()}
- **Reach:** ${latestSnapshot.reach.toLocaleString()}
- **Total Views:** ${latestSnapshot.totalViews.toLocaleString()}
- **Engagement Rate:** ${latestSnapshot.engagementRate}%

**Strategic Observation:** Your engagement rate trend shows that tactical, terminal-based walkthroughs and realistic cold call roleplay correlate with higher comment volume.
*Note:* As per platform guidelines, we observe this pattern as a useful working hypothesis for future experiments rather than an absolute rule.`;
        } else {
          aiResponse = `You haven't recorded any growth snapshots yet. Head over to **Growth Tracker** to log your first manual follower and reach snapshot!`;
        }
      } else {
        aiResponse = `I have analyzed your saved content records:
- **${ideas.length} Content Ideas** across your 6 pillars.
- **${scripts.length} Scripts** in your workspace.
- **${research.length} Saved Research Findings** (including GitHub repos and SEO docs).
- **${reports.length} Creator Reports & Notes**.

How can I assist your content sprint today? I can help you draft a script, review a hook, find new research angles, or schedule your calendar.`;
      }
    }

    return NextResponse.json({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      suggestedActions,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 });
  }
}
