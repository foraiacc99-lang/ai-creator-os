import {
  ConnectedAccount,
  MediaPost,
  DailyInsight,
  ContentIdea,
  ScriptItem,
  StyleProfile,
  VideoAnalysis,
  CompetitorReference,
  CalendarEntry,
  ExperimentItem,
  AIRecommendation,
  UserPreferences,
} from '@/types';

export const INITIAL_PREFERENCES: UserPreferences = {
  niche: 'AI Tools & Solopreneur Workflows',
  targetAudience: 'Software engineers, designers, and creators building with AI',
  primaryPlatforms: ['Instagram Reels', 'Instagram Carousels'],
  mainGoals: ['Audience Growth', 'Authority', 'Newsletter Leads'],
  preferredFormats: ['REELS', 'CAROUSEL'],
  postingFrequencyPerWeek: 4,
  language: 'English',
  speakingStyle: 'High-signal, punchy, conversational, no corporate fluff',
  editingLimitations: 'Fast-paced cuts, typography callouts, screen-recordings with face bubble',
  availableFilmingHoursPerWeek: 4.5,
  onboardingCompleted: true,
};

export const DEMO_ACCOUNT: ConnectedAccount = {
  id: 'acc_demo_creator_01',
  username: 'swaraj.creates',
  name: 'Swaraj Talekar | AI Builder',
  profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
  accountType: 'CREATOR',
  followersCount: 28450,
  followingCount: 412,
  mediaCount: 164,
  biography: 'Shipping AI tools in public ⚡ 0 to 100k builder journey 🛠️ DM "PLAYBOOK" for my free prompt library',
  isConnected: true,
  isDemoMode: true,
  tokenExpiresAt: new Date(1760438400000 + 55 * 24 * 60 * 60 * 1000).toISOString(),
  lastSyncedAt: new Date(1760438400000 - 35 * 60 * 1000).toISOString(),
  syncStatus: 'idle',
};

export const DEMO_POSTS: MediaPost[] = [
  {
    id: 'post_01',
    accountId: 'acc_demo_creator_01',
    instagramId: '180293817263541',
    caption: 'Stop using ChatGPT like a search engine. Here is the 3-step prompt framework top engineers use to write entire micro-SaaS backends in 15 minutes. Save this for your next weekend sprint! 👇',
    mediaType: 'REELS',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=600&fit=crop',
    permalink: 'https://instagram.com/p/C4x89L_demo1',
    timestamp: new Date(1760438400000 - 2 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 42,
    metrics: {
      views: 74200,
      reach: 68100,
      impressions: 89400,
      likes: 4210,
      comments: 388,
      shares: 1940,
      saves: 3410,
      engagementRate: 8.42,
      watchTimeSeconds: 31,
      averageWatchPercent: 73.8,
    },
    topic: 'Prompt Engineering Frameworks',
    hookType: 'Contrarian Command ("Stop doing X")',
    callToAction: 'Save for your next weekend sprint',
    aiDiagnostic: {
      summary: 'Top 5% performer across saves and shares. The contrarian opening hook created immediate pattern interruption.',
      whatWorked: [
        'Hook explicitly targeted builder pain in the first 1.8 seconds',
        'Visible prompt template on screen drove 3.4k saves',
        'Pacing maintained 74% retention through the 25-second mark',
      ],
      whatLimited: [
        'Outro CTA was slightly rushed (last 3 seconds)',
        'Comments could have been doubled with an open question',
      ],
      hookStrengthScore: 94,
      recommendation: 'Create a direct follow-up Part 2 dissecting the exact debugging prompt referenced at 0:28.',
    },
  },
  {
    id: 'post_02',
    accountId: 'acc_demo_creator_01',
    instagramId: '180293817263542',
    caption: '5 open-source AI tools that feel illegal to know in 2026. Slide 4 will replace 3 paid subscriptions you are probably paying for right now.',
    mediaType: 'CAROUSEL',
    mediaUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop',
    permalink: 'https://instagram.com/p/C4x89L_demo2',
    timestamp: new Date(1760438400000 - 5 * 24 * 3600 * 1000).toISOString(),
    metrics: {
      views: 52100,
      reach: 48900,
      impressions: 61200,
      likes: 2980,
      comments: 214,
      shares: 1120,
      saves: 2890,
      engagementRate: 6.84,
    },
    topic: 'Open Source AI Tools',
    hookType: 'High Curiosity Listicle ("Feels illegal to know")',
    callToAction: 'Comment TOOLS for the direct GitHub repositories',
    aiDiagnostic: {
      summary: 'Strong authority builder with exceptionally high save-to-reach ratio (5.9%).',
      whatWorked: [
        'High contrast carousel cover with large bold title',
        'Specific curation of non-obvious GitHub tools rather than standard consumer apps',
      ],
      whatLimited: [
        'Slide 7 had dense text blocks reducing final slide swipe-through rate',
      ],
      hookStrengthScore: 88,
      recommendation: 'Re-format slide 4 into a standalone deep-dive Reel demonstration.',
    },
  },
  {
    id: 'post_03',
    accountId: 'acc_demo_creator_01',
    instagramId: '180293817263543',
    caption: 'I built an automated newsletter engine using local Ollama models on a MacBook Air. Here is the hardware reality and benchmarks nobody talks about.',
    mediaType: 'REELS',
    mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=600&fit=crop',
    permalink: 'https://instagram.com/p/C4x89L_demo3',
    timestamp: new Date(1760438400000 - 8 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 58,
    metrics: {
      views: 31200,
      reach: 29400,
      impressions: 37500,
      likes: 1420,
      comments: 195,
      shares: 410,
      saves: 980,
      engagementRate: 4.12,
      watchTimeSeconds: 24,
      averageWatchPercent: 41.4,
    },
    topic: 'Local AI & Hardware Specs',
    hookType: 'Personal Case Study ("I built X on Y")',
    callToAction: 'Drop your laptop specs below and I will tell you which model to run',
    aiDiagnostic: {
      summary: 'Performs on par with baseline. Great comment engagement, but drop-off occurred around 0:18 during terminal output explanation.',
      whatWorked: [
        'High technical credibility and relatable hardware (MacBook Air)',
        'Comment question triggered active community benchmarking conversation',
      ],
      whatLimited: [
        'Terminal screen was slightly small on mobile devices',
        'Mid-video technical jargon slowed narrative momentum',
      ],
      hookStrengthScore: 78,
      recommendation: 'Use larger zoom-ins on terminal outputs and overlay animated tokens/sec counters.',
    },
  },
  {
    id: 'post_04',
    accountId: 'acc_demo_creator_01',
    instagramId: '180293817263544',
    caption: 'Why most creators fail at building AI automations: they automate the output before they standardize the thinking. Unpopular truth inside.',
    mediaType: 'REELS',
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop',
    permalink: 'https://instagram.com/p/C4x89L_demo4',
    timestamp: new Date(1760438400000 - 12 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 34,
    metrics: {
      views: 18400,
      reach: 17100,
      impressions: 21900,
      likes: 810,
      comments: 64,
      shares: 145,
      saves: 320,
      engagementRate: 2.94,
      watchTimeSeconds: 14,
      averageWatchPercent: 41.2,
    },
    topic: 'Philosophy of Automation',
    hookType: 'Negative Provocation ("Why most fail")',
    callToAction: 'Agree or disagree?',
    aiDiagnostic: {
      summary: 'Underperformed baseline by 32%. The concept was too abstract without a concrete walkthrough or visual demo.',
      whatWorked: [
        'Strong philosophical point that resonated with senior engineers',
      ],
      whatLimited: [
        'Talking head without visual B-roll or supporting diagram',
        'Hook was too vague ("automation" without specifying which tool)',
        'CTA was generic ("Agree or disagree?")',
      ],
      hookStrengthScore: 61,
      recommendation: 'Avoid purely conceptual rants. Anchor every critique in a specific, tangible example.',
    },
  },
  {
    id: 'post_05',
    accountId: 'acc_demo_creator_01',
    instagramId: '180293817263545',
    caption: 'My complete 2026 Solo Founder Tech Stack. 1 dev, 4 AI agents, $42/month overhead, $12k MRR. Breakdown of every tool and integration.',
    mediaType: 'CAROUSEL',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
    permalink: 'https://instagram.com/p/C4x89L_demo5',
    timestamp: new Date(1760438400000 - 15 * 24 * 3600 * 1000).toISOString(),
    metrics: {
      views: 89300,
      reach: 81400,
      impressions: 112000,
      likes: 5410,
      comments: 492,
      shares: 2410,
      saves: 4890,
      engagementRate: 9.32,
    },
    topic: 'Solo Founder Architecture & Numbers',
    hookType: 'Transparent Metrics ("1 dev, $42/mo, $12k MRR")',
    callToAction: 'Save this blueprint for your next SaaS architecture',
    aiDiagnostic: {
      summary: 'All-time best performing carousel. Transparency + specific numbers generated massive trust and virality.',
      whatWorked: [
        'Radical financial and architectural transparency in title',
        'Diagram of AI agent routing on slide 3 had highest screenshot rate',
        'Clean, minimalist visual aesthetic',
      ],
      whatLimited: [
        'Could have linked directly to a newsletter subscription in bio',
      ],
      hookStrengthScore: 98,
      recommendation: 'Turn this architecture breakdown into a recurring monthly or quarterly series.',
    },
  },
  {
    id: 'post_06',
    accountId: 'acc_demo_creator_01',
    instagramId: '180293817263546',
    caption: 'Testing 4 different vision models on handwritten wireframes. Gemini vs Claude vs GPT-4o vs Qwen 2.5-VL. The winner was surprising.',
    mediaType: 'REELS',
    mediaUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=600&fit=crop',
    permalink: 'https://instagram.com/p/C4x89L_demo6',
    timestamp: new Date(1760438400000 - 18 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 48,
    metrics: {
      views: 63400,
      reach: 58200,
      impressions: 74100,
      likes: 3820,
      comments: 310,
      shares: 1680,
      saves: 2640,
      engagementRate: 7.91,
      watchTimeSeconds: 36,
      averageWatchPercent: 75.0,
    },
    topic: 'Vision Models Comparison',
    hookType: 'Direct Head-to-Head Benchmark ("Model X vs Model Y")',
    callToAction: 'Which one are you using in production?',
    aiDiagnostic: {
      summary: 'Exceptional retention (75%). Fast split-screen visual test kept viewers watching until the final reveal.',
      whatWorked: [
        'Side-by-side comparison eliminated boredom',
        'Objective benchmark with side-by-side code generation speed',
      ],
      whatLimited: [
        'Font on the code output screen was slightly small',
      ],
      hookStrengthScore: 91,
      recommendation: 'Run similar head-to-head comparisons for audio transcription (Whisper vs Nova).',
    },
  },
];

export const DEMO_DAILY_INSIGHTS: DailyInsight[] = Array.from({ length: 30 }).map((_, i) => {
  const d = new Date(1760438400000);
  d.setDate(d.getDate() - (29 - i));
  const baseReach = 8500 + Math.sin(i / 3) * 3200 + (i > 20 ? 4500 : 0);
  const baseViews = baseReach * 1.34;
  return {
    date: d.toISOString().split('T')[0],
    reach: Math.round(baseReach),
    views: Math.round(baseViews),
    impressions: Math.round(baseViews * 1.2),
    engagementRate: +(5.2 + Math.cos(i / 2) * 1.8).toFixed(2),
    followerGrowth: Math.round(45 + Math.sin(i / 2) * 35 + (i % 7 === 0 ? 80 : 0)),
    profileViews: Math.round(baseReach * 0.08),
  };
});

export const DEMO_IDEAS: ContentIdea[] = [
  {
    id: 'idea_01',
    title: 'The "Ghost Mode" Prompt: How to Make AI Mimic Your Exact Writing Voice',
    description: 'A walkthrough on feeding 5 writing samples into an LLM and using few-shot meta-prompting to lock in sentence cadence and vocabulary.',
    topic: 'Personal AI Workflows',
    format: 'REELS',
    targetAudience: 'Content creators, copywriters, founders writing newsletters',
    hook: 'If your AI content sounds like a robotic McKinsey consultant, you are missing this single prompt line.',
    objective: 'Authority',
    estimatedFilmingMinutes: 25,
    difficulty: 'Easy',
    source: 'AI Recommendation',
    status: 'script_ready',
    createdAt: new Date(1760438400000 - 24 * 3600 * 1000).toISOString(),
    isFavorite: true,
  },
  {
    id: 'idea_02',
    title: 'I Replaced 6 Figma Plugins with One Local AI Agent',
    description: 'Screen recording demonstration of taking hand-drawn sketches directly into React code with Tailwind classes in real time.',
    topic: 'Design Engineering',
    format: 'REELS',
    targetAudience: 'Frontend developers and UI/UX designers',
    hook: 'I have not opened a Figma plugin in three weeks, and my frontend velocity just doubled.',
    objective: 'Reach',
    estimatedFilmingMinutes: 40,
    difficulty: 'Medium',
    source: 'Historical Pattern',
    status: 'planned',
    createdAt: new Date(1760438400000 - 48 * 3600 * 1000).toISOString(),
    isFavorite: true,
  },
  {
    id: 'idea_03',
    title: 'The 2026 Developer Salary Paradox: Why AI Specialists Are Getting Less While "System Integrators" Get More',
    description: 'Data-driven carousel breaking down compensation trends from recent tech hiring reports.',
    topic: 'Career & Industry Trends',
    format: 'CAROUSEL',
    targetAudience: 'Software engineers navigating AI transition',
    hook: 'Knowing how to fine-tune a model is no longer your competitive edge. Here is what companies are actually paying $250k+ for in 2026.',
    objective: 'Engagement',
    estimatedFilmingMinutes: 30,
    difficulty: 'Medium',
    source: 'Competitor Analysis',
    status: 'idea',
    createdAt: new Date(1760438400000 - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'idea_04',
    title: 'Why I Stopped Hosting Postgres in the Cloud for Small AI Apps',
    description: 'Contrarian architecture post showing embedded SQLite / DuckDB performance benchmarks versus remote DB connection latency for agentic loops.',
    topic: 'Software Architecture',
    format: 'REELS',
    targetAudience: 'Full-stack developers and indie hackers',
    hook: 'Cloud database latency is quietly killing your AI agent apps. Watch this 10x latency drop.',
    objective: 'Audience Growth',
    estimatedFilmingMinutes: 35,
    difficulty: 'Advanced',
    source: 'Research Note',
    status: 'filming',
    createdAt: new Date(1760438400000 - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'idea_05',
    title: '5 Git Commands Every AI Engineer Needs That Aren\'t In Standard Tutorials',
    description: 'Git worktrees, bisecting large model checkpoints, and submodule management for local AI repositories.',
    topic: 'Developer Tools',
    format: 'CAROUSEL',
    targetAudience: 'Developers working with ML repos',
    hook: 'If you are still cloning separate repos to test AI experiments, stop. Git worktree does this in 1 second.',
    objective: 'Authority',
    estimatedFilmingMinutes: 20,
    difficulty: 'Easy',
    source: 'User Created',
    status: 'idea',
    createdAt: new Date(1760438400000 - 6 * 24 * 3600 * 1000).toISOString(),
  },
];

export const DEMO_SCRIPTS: ScriptItem[] = [
  {
    id: 'script_01',
    ideaId: 'idea_01',
    title: 'The "Ghost Mode" Prompt: Voice Mimicry Masterclass',
    hookOptions: [
      'If your AI content sounds like a robotic McKinsey consultant, you are missing this single prompt line.',
      'Stop telling ChatGPT to "act like a copywriter." It writes fluff. Do this 3-minute sample injection instead.',
      'Here is the exact meta-prompt I used to make an offline open-source model write identically to my personal voice.',
    ],
    selectedHookIndex: 0,
    spokenScriptShort: `If your AI content sounds like a robotic McKinsey consultant, you are missing this single prompt line.

Most people tell AI: "Write in a casual, engaging tone." That results in generic LinkedIn buzzwords.

Instead, use what prompt researchers call stylistic anchor few-shotting.

Step one: Take the last 300 words you wrote manually—a newsletter, a tweet, or a script.
Step two: Do NOT ask it to write yet. Ask it to extract your structural fingerprint: average sentence length, punctuation habits, and words you NEVER use.
Step three: Pass that extracted fingerprint back as the constraint wrapper.

Look at this side-by-side output. Left is generic ChatGPT. Right is with the stylistic anchor. Notice the cadence?

Comment "ANCHOR" and I will send you the exact prompt template.`,
    spokenScriptLong: `If your AI content sounds like a robotic McKinsey consultant, you are missing this single prompt line.

Most people tell AI: "Write in a casual, engaging tone." That results in generic LinkedIn buzzwords like "delve into" and "testament to."

Instead, use what prompt researchers call stylistic anchor few-shotting.

Here is the exact 3-step system:
Step one: Take the last 300 words you wrote manually—a newsletter, a tweet, or a script you actually liked.
Step two: Do NOT ask it to write your new content yet. Ask the model to extract your structural fingerprint:
Specifically:
1. Sentence length variance
2. Punctuation cadence
3. Signature transitional words
4. Words you NEVER use.

Step three: Once it outputs your fingerprint, lock it into system instructions before feeding your raw outline.

Look at this side-by-side output on my screen. Left is standard zero-shot prompting. Right is with our stylistic anchor. Notice how the right side sounds like an actual human having a conversation over coffee?

Save this Reel and comment "ANCHOR" below—I will DM you the entire markdown template for free.`,
    currentSpokenScript: `If your AI content sounds like a robotic McKinsey consultant, you are missing this single prompt line.

Most people tell AI: "Write in a casual, engaging tone." That results in generic LinkedIn buzzwords like "delve into" and "testament to."

Instead, use what prompt researchers call stylistic anchor few-shotting.

Here is the exact 3-step system:
Step one: Take the last 300 words you wrote manually—a newsletter, a tweet, or a script you actually liked.
Step two: Do NOT ask it to write your new content yet. Ask the model to extract your structural fingerprint.
Step three: Lock that fingerprint into system instructions before feeding your raw outline.

Look at this side-by-side comparison on screen. Left is generic. Right is anchored. Notice the punchy cadence?

Comment "ANCHOR" below and I'll send you the copy-paste prompt.`,
    shotList: [
      {
        shotNumber: 1,
        visual: 'Talking head, punchy zoom-in on face at 0:01, holding phone or looking direct into camera',
        audioSpoken: 'If your AI content sounds like a robotic McKinsey consultant, you are missing this single prompt line.',
        onScreenText: 'STOP USING GENERIC PROMPTS 🚨',
        bRollPrompt: 'Close up talking head with red accent highlight',
        durationSeconds: 4,
      },
      {
        shotNumber: 2,
        visual: 'Over-the-shoulder screen recording of ChatGPT writing generic fluff full of "delve into"',
        audioSpoken: 'Most people tell AI: "Write in a casual tone." That results in corporate buzzwords.',
        onScreenText: 'The "Corporate Fluff" Problem 📉',
        bRollPrompt: 'Terminal / ChatGPT window with red highlight over generic text',
        durationSeconds: 6,
      },
      {
        shotNumber: 3,
        visual: 'Split screen: Left showing 3 sample writings, Right showing the extracted style fingerprint schema',
        audioSpoken: 'Step one: Feed 300 words of your real writing. Step two: Extract your structural fingerprint.',
        onScreenText: 'Step 1 & 2: Extract Stylistic Anchor 🧬',
        bRollPrompt: 'Clean split screen graphic with JSON/Markdown schema',
        durationSeconds: 12,
      },
      {
        shotNumber: 4,
        visual: 'Screen demo comparing zero-shot output vs anchored output side by side with yellow text highlights',
        audioSpoken: 'Look at this side-by-side comparison. Left is generic. Right is anchored.',
        onScreenText: 'Side-by-Side Reality Check 🔥',
        bRollPrompt: 'Fast visual comparison with highlighting cursor',
        durationSeconds: 10,
      },
      {
        shotNumber: 5,
        visual: 'Talking head cutback, pointing down to comment section',
        audioSpoken: 'Comment "ANCHOR" below and I\'ll send you the copy-paste prompt.',
        onScreenText: 'Comment "ANCHOR" for the template 📥',
        bRollPrompt: 'Clean outro frame with animated DM arrow',
        durationSeconds: 5,
      },
    ],
    bRollSuggestions: [
      'Screen capture of ChatGPT generating the word "delve"',
      'Side by side diff view in VS Code showing prompt comparison',
      'Animated diagram of prompt wrapping the context window',
    ],
    onScreenTextList: [
      'STOP USING GENERIC PROMPTS 🚨',
      'The "Corporate Fluff" Problem',
      'Extract Stylistic Fingerprint 🧬',
      'Side-by-Side Reality Check',
      'Comment "ANCHOR" for template 📥',
    ],
    caption: `Stop letting AI make you sound like a corporate robot. 🤖❌

Most people fail at using LLMs for writing because they give vague adjectives: "make it punchy", "make it engaging".

The model has no idea what that means for YOUR voice.

Instead, extract your "Stylistic Anchor" using few-shot structural parameters:
1. Sentence length variance
2. Punctuation rhythm
3. Vocabulary exclusion list (e.g. banning "delve", "testament", "tapestry")

Drop a comment with "ANCHOR" and I'll send you the exact markdown meta-prompt so you can clone your voice in 3 minutes!

#promptengineering #aitools #solopreneur #buildinpublic #creatortech #softwareengineer`,
    callToAction: 'Comment "ANCHOR" for the free template link',
    coverTitle: 'HOW TO CLONE YOUR REAL WRITING VOICE WITH AI',
    structureType: 'Problem, Explanation, Solution',
    tone: 'Direct, technical, authoritative yet approachable',
    estimatedDurationSeconds: 37,
    status: 'ready_for_filming',
    version: 2,
    updatedAt: new Date(1760438400000 - 4 * 3600 * 1000).toISOString(),
  },
];

export const DEMO_STYLE_PROFILE: StyleProfile = {
  id: 'style_profile_01',
  speakingRhythm: 'Brisk cadence, pauses after key takeaways for visual emphasis, average 145 words per minute',
  sentenceLengthPreference: 'punchy',
  humorLevel: 4,
  directnessScore: 9,
  vocabularyTraits: [
    'Uses specific technical nouns (architecture, latency, framework, vector)',
    'Prefers active verbs (ship, break, isolate, deploy, measure)',
    'Avoids passive corporate euphemisms',
  ],
  signatureExpressions: [
    'Here is the reality nobody is talking about',
    'Stop doing X, do Y instead',
    'Let me show you the receipts',
    'Here is the breakdown',
  ],
  preferredHookStyles: [
    'Contrarian command ("Stop doing X")',
    'Transparent metric revelation ("1 dev, $42/mo, $12k MRR")',
    'Immediate before/after contrast',
  ],
  preferredCTAs: [
    'Comment keyword for the direct code/template',
    'Save this for your next weekend sprint',
    'Drop your specs below',
  ],
  storytellingAngle: 'The pragmatic practitioner who tests things with real code before believing hype',
  avoidWords: [
    'delve',
    'game-changer',
    'testament to',
    'in today\'s fast-paced digital world',
    'revolutionize',
    'synergy',
    'tapestry',
  ],
  sampleTranscripts: [
    'If your AI content sounds like a robotic McKinsey consultant, you are missing this single prompt line.',
    'I built an automated newsletter engine using local Ollama models on a MacBook Air. Here is the hardware reality and benchmarks nobody talks about.',
  ],
  lastUpdated: new Date(1760438400000 - 2 * 24 * 3600 * 1000).toISOString(),
};

export const DEMO_VIDEO_ANALYSIS: VideoAnalysis = {
  id: 'va_01',
  filename: 'ollama_local_benchmark_v2.mp4',
  fileSizeBytes: 24580210,
  durationSeconds: 42.5,
  resolution: '1080x1920 (9:16 Vertical)',
  fps: 30,
  aspectRatio: '9:16',
  transcript: `Stop spending forty dollars a month on cloud API credits just to test small AI experiments. In this video, I am going to show you how to run Llama 3.2 locally on any laptop with zero fan noise and instant response times. Step one is installing Ollama with one curl command. Step two is pulling the quantized model. And step three is plugging it into your favorite editor with a free local extension. Notice how fast this completion generates right here on my local machine without sending a single byte to an external server. If you want my configuration dotfiles, comment LOCAL below.`,
  hookScore: 92,
  hookCritique: 'The financial pain hook ($40/month API credits) immediately captures attention within the first 2.1 seconds.',
  suggestedHooks: [
    'You are wasting $40/month on cloud AI APIs when your laptop can run this offline for $0.',
    'How to run Llama 3.2 on a MacBook with zero cloud bills and zero lag.',
  ],
  narrativeSections: [
    {
      title: 'Hook & Problem',
      startSec: 0,
      endSec: 4.5,
      summary: 'Addresses unnecessary cloud API expenses for small developer experiments.',
      flowScore: 95,
    },
    {
      title: 'Step 1-3 Fast Breakdown',
      startSec: 4.5,
      endSec: 24,
      summary: 'Concise explanation of curl install, model pull, and editor extension hookup.',
      flowScore: 88,
    },
    {
      title: 'Live Proof / Demonstration',
      startSec: 24,
      endSec: 36,
      summary: 'Shows real-time token stream on local machine with zero external latency.',
      flowScore: 92,
    },
    {
      title: 'Call to Action',
      startSec: 36,
      endSec: 42.5,
      summary: 'Asks viewer to comment "LOCAL" for setup dotfiles.',
      flowScore: 90,
    },
  ],
  clarityScore: 94,
  repetitionDetected: [
    'Mentioned "local machine" three times in a 12-second window (0:22 - 0:34)',
  ],
  coreTakeaway: 'Running small LLMs locally on standard consumer hardware is frictionless, cost-free, and private.',
  ctaPlacementFeedback: 'CTA starts at 0:36 which gives 6.5 seconds for response without dead air.',
  visualVarietyScore: 86,
  pacingFeedback: 'Excellent tempo (approx 150 wpm). Visual switches every 4.2 seconds maintain viewer retention.',
  revisedScript: `You are wasting $40 a month on cloud AI APIs for small test projects.

Here is how to run Llama 3.2 locally on any laptop with zero lag:

1. Install Ollama via the terminal.
2. Pull the 3-billion parameter quantized model.
3. Hook it into VS Code using the free Continue extension.

Watch this completion stream right now on my screen. Zero network latency, completely offline, zero dollars.

Comment "LOCAL" and I will DM you my setup dotfiles.`,
  bRollRecommendations: [
    'Add an animated token speed counter overlay at 0:28 (e.g., "48 tokens/sec")',
    'Zoom in 25% on terminal during the curl command execution',
  ],
  prePublishChecklist: [
    { item: 'First 3 seconds contains clear visual or auditory hook', passed: true },
    { item: 'No corporate buzzwords or filler phrases', passed: true },
    { item: 'On-screen captions placed inside Instagram safe zones (above bottom 20%)', passed: true },
    { item: 'Clear single Call to Action with keyword trigger', passed: true },
    { item: 'Cover frame selected with readable high-contrast title', passed: true },
  ],
  analyzedAt: new Date(1760438400000 - 14 * 3600 * 1000).toISOString(),
};

export const DEMO_COMPETITOR_REFERENCES: CompetitorReference[] = [
  {
    id: 'comp_01',
    competitorHandle: 'ai_systems_engineer',
    postUrl: 'https://instagram.com/reel/C3mK91_ref1',
    mediaType: 'REELS',
    visibleEngagement: {
      views: 240000,
      likes: 18400,
      comments: 1420,
    },
    hook: 'Do not learn Python in 2026. Learn this instead.',
    topic: 'Developer Skills Shift',
    captionExcerpt: 'The syntax battle is over. The new game is architecture and orchestration...',
    structuralBreakdown: 'Polarizing statement hook -> 3 real industry examples -> practical recommended skill stack -> save CTA.',
    whyItWorked: 'High polarization on programming languages always triggers passionate debate in comments.',
    contentOpportunity: 'Create an alternative, nuanced take: "Why Python is NOT dead, but how you write it has fundamentally shifted."',
    savedAt: new Date(1760438400000 - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'comp_02',
    competitorHandle: 'founder_hacks',
    postUrl: 'https://instagram.com/p/C3mK91_ref2',
    mediaType: 'CAROUSEL',
    visibleEngagement: {
      likes: 9840,
      comments: 610,
    },
    hook: 'The 7-step blueprint I used to automate 80% of my client acquisition.',
    topic: 'Client Acquisition Systems',
    captionExcerpt: 'Manual outreach is dead. Here is how inbound intent data routes leads straight to my calendar...',
    structuralBreakdown: 'System flowchart cover -> Step-by-step tool breakdown -> exact Zapier/n8n triggers -> conversion stats.',
    whyItWorked: 'Actionable workflow diagrams perform exceptionally well for bookmarking and saves.',
    contentOpportunity: 'Show a 100% open-source alternative using self-hosted n8n and local Ollama without subscription costs.',
    savedAt: new Date(1760438400000 - 9 * 24 * 3600 * 1000).toISOString(),
  },
];

export const DEMO_CALENDAR: CalendarEntry[] = [
  {
    id: 'cal_01',
    title: 'Ghost Mode Prompt: Voice Mimicry Masterclass',
    plannedDate: new Date(1760438400000 + 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    format: 'REELS',
    status: 'ready',
    scriptId: 'script_01',
    ideaId: 'idea_01',
    objective: 'Authority',
    captionPreview: 'Stop letting AI make you sound like a corporate robot...',
    notes: 'Reel is filmed and captioned. Audio leveled.',
  },
  {
    id: 'cal_02',
    title: 'Developer Salary Paradox: What Companies Pay $250k For',
    plannedDate: new Date(1760438400000 + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    format: 'CAROUSEL',
    status: 'script_ready',
    ideaId: 'idea_03',
    objective: 'Engagement',
    notes: 'Figma carousel slides 1-5 drafted. Need final proof check on slide 6.',
  },
  {
    id: 'cal_03',
    title: 'Why Cloud Postgres Latency Kills AI Agents (SQLite vs Cloud)',
    plannedDate: new Date(1760438400000 + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    format: 'REELS',
    status: 'filming',
    ideaId: 'idea_04',
    objective: 'Audience Growth',
    notes: 'Need terminal benchmark screen capture showing latency delta.',
  },
  {
    id: 'cal_04',
    title: '5 Git Worktree Secrets for AI Engineers',
    plannedDate: new Date(1760438400000 + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    format: 'CAROUSEL',
    status: 'planned',
    ideaId: 'idea_05',
    objective: 'Authority',
    notes: 'Draft code examples and terminal animations.',
  },
  {
    id: 'cal_05',
    title: 'Weekend Build: Autonomous Web Research Agent in 60 Lines of Python',
    plannedDate: new Date(1760438400000 + 9 * 24 * 3600 * 1000).toISOString().split('T')[0],
    format: 'REELS',
    status: 'idea',
    objective: 'Reach',
    notes: 'Test code snippet first to ensure 60 lines limit holds.',
  },
];

export const DEMO_EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'exp_01',
    title: 'Contrarian Command Hook vs Transparent Number Hook',
    hypothesis: 'Contrarian command hooks ("Stop doing X") will generate higher initial 3-second retention, while transparent financial numbers ("1 dev, $42/mo") will drive 2x higher saves and shares.',
    variableTested: 'Hook Style',
    variantA: {
      description: 'Contrarian Command: "Stop using ChatGPT like a search engine"',
      mediaId: 'post_01',
      resultMetric: 8.42, // Engagement Rate %
    },
    variantB: {
      description: 'Transparent Financial Metric: "1 dev, 4 AI agents, $42/month overhead"',
      mediaId: 'post_05',
      resultMetric: 9.32, // Engagement Rate %
    },
    metricObserved: 'Engagement Rate',
    status: 'Completed',
    findings: 'Both variants outperformed historical average (5.2%). Transparent numbers generated 43% more saves (4.8k vs 3.4k), proving that concrete proof-of-work resonates strongest with developer audiences.',
    createdAt: new Date(1760438400000 - 20 * 24 * 3600 * 1000).toISOString(),
    completedAt: new Date(1760438400000 - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'exp_02',
    title: 'Direct Code Screen-Record vs Talking Head with B-Roll',
    hypothesis: 'Direct split screen showing live terminal completions will sustain higher average watch-time compared to pure talking-head format.',
    variableTested: 'Format',
    variantA: {
      description: 'Split screen terminal demonstration (post_06)',
      mediaId: 'post_06',
      resultMetric: 75.0, // Avg watch %
    },
    variantB: {
      description: 'Pure talking head with minimal overlays (post_04)',
      mediaId: 'post_04',
      resultMetric: 41.2, // Avg watch %
    },
    metricObserved: 'Retention',
    status: 'Completed',
    findings: 'Split screen generated a +33.8% lift in average watch time percentage. Viewers dropped off rapidly on conceptual talking head without continuous visual progression.',
    createdAt: new Date(1760438400000 - 25 * 24 * 3600 * 1000).toISOString(),
    completedAt: new Date(1760438400000 - 7 * 24 * 3600 * 1000).toISOString(),
  },
];

export const DEMO_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec_01',
    title: 'The 3-Minute Voice Anchor Prompt for AI Writing',
    topic: 'Prompt Engineering & Workflow',
    format: 'REELS',
    targetAudience: 'Founders and creators using AI for content',
    objective: 'Authority',
    suggestedHook: 'If your AI content sounds like a robotic consultant, you are missing this single prompt line.',
    mainArgument: 'Generic adjectives fail because LLMs lack your structural baseline. Extracting your sentence length variance and forbidden words creates authentic mimicry in 3 minutes.',
    recommendedDurationSeconds: 42,
    suggestedCTA: 'Comment "ANCHOR" for the copy-paste prompt template',
    supportingEvidence: 'Your prompt engineering Reels have achieved an 8.4% average engagement rate—61% higher than your general tech rants.',
    confidenceScore: 94,
    productionEffort: 'Low',
    status: 'suggested',
  },
  {
    id: 'rec_02',
    title: 'Why Cloud DB Latency Kills AI Agents (SQLite vs Remote Postgres)',
    topic: 'Software Architecture & Latency',
    format: 'REELS',
    targetAudience: 'Software developers building agentic workflows',
    objective: 'Reach',
    suggestedHook: 'Cloud database latency is quietly making your AI agent 10x slower than it should be.',
    mainArgument: 'In an agent loop making 15 round trips, 80ms cloud network latency adds 1.2s of dead air. Embedded local DBs drop this to under 5ms.',
    recommendedDurationSeconds: 48,
    suggestedCTA: 'Save this architecture rule for your next agent prototype',
    supportingEvidence: 'Your previous hardware/benchmark Reel reached 63.4k views and had 75% retention.',
    confidenceScore: 89,
    productionEffort: 'Medium',
    status: 'suggested',
  },
  {
    id: 'rec_03',
    title: 'The 2026 AI Developer Salary Paradox',
    topic: 'Tech Careers & Industry Reality',
    format: 'CAROUSEL',
    targetAudience: 'Engineers wanting to know where compensation is shifting',
    objective: 'Engagement',
    suggestedHook: 'Knowing how to fine-tune a model is no longer rare. Here is what companies are actually paying $250k for.',
    mainArgument: 'Model weights are commoditized. The real value has shifted to data pipeline hygiene, prompt orchestration, and evaluation harnesses.',
    recommendedDurationSeconds: 0,
    suggestedCTA: 'Save this career roadmap before your next review',
    supportingEvidence: 'Carousel formats on high-stakes career topics average 4.8k saves on your profile.',
    confidenceScore: 86,
    productionEffort: 'Medium',
    status: 'suggested',
  },
  {
    id: 'rec_04',
    title: 'Testing 3 Local Vision Models on Real UI Mockups',
    topic: 'Open Source Vision AI',
    format: 'REELS',
    targetAudience: 'Designers & Developers',
    objective: 'Audience Growth',
    suggestedHook: 'I gave the same messy napkin sketch to 3 open-source vision models. Here is who generated usable Tailwind code.',
    mainArgument: 'Demonstrate Qwen2.5-VL vs Llama 3.2 Vision on a realistic napkin UI sketch.',
    recommendedDurationSeconds: 52,
    suggestedCTA: 'Drop a sketch in my DMs and I will test it in Part 2',
    supportingEvidence: 'Side-by-side benchmark posts have a 75% average completion rate and 1.6k shares.',
    confidenceScore: 92,
    productionEffort: 'High',
    status: 'suggested',
  },
  {
    id: 'rec_05',
    title: 'My Solo Founder Agentic Stack: How 4 Local Agents Run My Operations',
    topic: 'Indie Hacking & Solopreneurship',
    format: 'CAROUSEL',
    targetAudience: 'Solo founders and indie hackers',
    objective: 'Authority',
    suggestedHook: '1 founder. 4 autonomous local agents. $0 additional SaaS overhead. Full breakdown inside.',
    mainArgument: 'Detailing routing: Research Agent -> Drafting Agent -> Quality Checker -> Formatter.',
    recommendedDurationSeconds: 0,
    suggestedCTA: 'Comment "STACK" to receive the architecture diagram',
    supportingEvidence: 'Your previous Solo Founder tech stack post hit 89.3k views with 4.8k saves.',
    confidenceScore: 96,
    productionEffort: 'Medium',
    status: 'suggested',
  },
];
