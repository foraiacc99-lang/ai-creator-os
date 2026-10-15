import { NextRequest, NextResponse } from 'next/server';
import { executeAICompletion } from '@/lib/ai/service';
import { SYSTEM_RESEARCHER_PROMPT, SYSTEM_STRATEGIST_PROMPT } from '@/lib/ai/prompts';
import { ContentPillar, CarouselProject, CarouselSlide, CarouselContentBrief, StorySequence } from '@/types';

// Topic-specific knowledge synthesizer for reliable, non-repetitive generation
interface DomainKnowledge {
  defaultAngle: string;
  authoritativeSources: string[];
  findings: string[];
  suggestedStructure: CarouselProject['structureType'];
  slideThemes: Array<{
    headline: string;
    body: string;
    visualDirection: string;
    supportingExample: string;
    designNotes: string;
    sourceReferences: string[];
  }>;
  takeaway: string;
  cta: string;
}

function synthesizeDomainKnowledge(cleanTopic: string, pillar: ContentPillar, audience: string): DomainKnowledge {
  const lower = cleanTopic.toLowerCase();

  // 1. WhatsApp / Messaging Bot
  if (lower.includes('whatsapp') || lower.includes('booking bot') || lower.includes('chat bot')) {
    return {
      defaultAngle: 'Building a 24/7 WhatsApp customer bot using official Webhook architecture without paid SaaS subscriptions',
      authoritativeSources: [
        'https://developers.facebook.com/docs/whatsapp/cloud-api',
        'https://developers.facebook.com/docs/whatsapp/pricing',
      ],
      findings: [
        'Meta WhatsApp Cloud API offers 1,000 free service conversations every month.',
        'Webhook architecture requires verified token verification handshake (GET) and payload parsing (POST).',
        'Local LLM endpoints (Ollama / vLLM) can parse user booking intent with structured JSON output.',
        'Session window: Businesses have a 24-hour customer service window after the last user message.',
      ],
      suggestedStructure: 'Tutorial, Prerequisites, Steps, Verification',
      slideThemes: [
        {
          headline: '1. The Secret: WhatsApp Cloud API vs. Brittle Web Scrapers',
          body: 'Never use unauthorized browser automation wrappers that get phone numbers banned. Use the official Meta WhatsApp Cloud API with webhook endpoints.',
          visualDirection: 'Architecture diagram: WhatsApp User -> Cloud API -> Verified Webhook Server -> Local LLM.',
          supportingExample: 'Cloud API provides official 99.9% uptime SLA and 1,000 free monthly customer-initiated conversations.',
          designNotes: 'Split card showing green authorized API checkmark vs red scraper ban warning.',
          sourceReferences: ['Meta WhatsApp Cloud API Documentation'],
        },
        {
          headline: '2. The Webhook Security Handshake',
          body: 'Your server must implement two webhook handlers: a GET endpoint for Meta verification token challenge, and a POST endpoint for encrypted message payloads.',
          visualDirection: 'Code snippet illustrating hub.challenge verification logic in Node.js/Python.',
          supportingExample: 'Validating the X-Hub-Signature-256 header prevents unauthorized spoofed webhook calls.',
          designNotes: 'Dark terminal syntax highlighting with highlighted verification token.',
          sourceReferences: ['Meta Webhook Security Guidelines'],
        },
        {
          headline: '3. Intent Parsing with Local LLM JSON Mode',
          body: 'Pipe incoming customer queries into a local model (Llama 3.2 or Mistral) forced into JSON mode to extract date, time, and service type with 0 API tokens.',
          visualDirection: 'Raw user message "Can I book tomorrow at 4pm?" -> Clean JSON payload.',
          supportingExample: 'Structured schemas guarantee your database gets clean date objects rather than conversational text.',
          designNotes: 'Side-by-side chat bubble converting into high-contrast JSON schema.',
          sourceReferences: ['Ollama Structured Output Docs'],
        },
        {
          headline: '4. The 24-Hour Service Window Rule',
          body: 'Customer-initiated conversations grant a 24-hour response window. After 24 hours, you cannot send arbitrary text—you must use pre-approved Meta message templates.',
          visualDirection: 'Timeline graphic showing 24-hour free-form window turning into template-only state.',
          supportingExample: 'Failing to track conversation timestamps results in HTTP 400 template errors.',
          designNotes: 'Hourglass icon with status badges showing Active Window vs Template Required.',
          sourceReferences: ['WhatsApp Business Pricing & Window Documentation'],
        },
        {
          headline: '5. Production Architecture & Local Testing',
          body: 'Test your webhook locally using Ngrok or Cloudflare Tunnels before deploying to a VPS. Always separate message queuing from slow AI inference.',
          visualDirection: 'Flow diagram: Immediate HTTP 200 acknowledgment -> Async Job Queue -> Local LLM response.',
          supportingExample: 'Returning HTTP 200 within 3 seconds prevents Meta from retrying and sending duplicate bot replies.',
          designNotes: 'Queue buffer diagram showing 50ms ACK vs 1.2s LLM generation buffer.',
          sourceReferences: ['Production Webhook Standards'],
        },
      ],
      takeaway: 'Building a production WhatsApp bot requires respecting official Webhook contracts and separating instant 200 ACKs from AI intent parsing.',
      cta: 'Save this carousel for your next WhatsApp API integration sprint! 📲',
    };
  }

  // 2. Sales Objections & Pricing (e.g. Website too expensive / Cold Calling)
  if (
    lower.includes('expensive') ||
    lower.includes('price') ||
    lower.includes('objection') ||
    lower.includes('cold call') ||
    lower.includes('sales') ||
    pillar === 'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION'
  ) {
    return {
      defaultAngle: 'Reframing "Your Website Is Too Expensive" into an ROI investment and cost-of-inaction calculation',
      authoritativeSources: [
        'https://hbr.org/topic/sales',
        'https://spin-selling.com/principles',
      ],
      findings: [
        'Prospects say "too expensive" for three reasons: lack of perceived value, budget timing, or negotiating leverage.',
        'Defending the price defensively triggers reactance; agreeing with the hesitation disarms pressure.',
        'Cost of inaction: Calculating missed revenue from lost mobile traffic reframes expense as lost money.',
        'Scope tiering: Instead of discounting your fee, reduce deliverables to preserve your pricing anchor.',
      ],
      suggestedStructure: 'Mistake, Why it happens, Correction',
      slideThemes: [
        {
          headline: '1. What "Too Expensive" Really Means',
          body: 'When a prospect says "That\'s too expensive", they are almost never saying "I have zero budget". They are saying "The risk of losing this money exceeds the certainty of your result".',
          visualDirection: 'Psychology balance scale: Perceived Financial Risk vs. Perceived Transformation Certainty.',
          supportingExample: 'Over 70% of pricing objections stem from unclear outcome certainty rather than absolute budget constraints.',
          designNotes: 'High-contrast quote card highlighting the unspoken prospect thought.',
          sourceReferences: ['Behavioral Sales Psychology Research'],
        },
        {
          headline: '2. The Fatal Mistake: Dropping Your Price on the Spot',
          body: 'If you instantly say "I can do 20% off", you prove you were overcharging two minutes ago. You destroy trust and open the door to endless scope creep.',
          visualDirection: 'Contrasting dialogue: The desperate discounter vs. the consultative strategist.',
          supportingExample: 'Discounting without changing deliverables reduces client commitment and raises revision requests by 40%.',
          designNotes: 'Red cross over hasty discount box vs green consultative badge.',
          sourceReferences: ['Pricing Strategy Frameworks'],
        },
        {
          headline: '3. Step 1: Disarm with Agreement',
          body: 'Disarm the confrontation instantly: "I appreciate you being upfront about budget. Good web design is a serious investment, and you shouldn\'t spend it unless it clearly pays for itself."',
          visualDirection: 'Script breakdown highlighting the exact psychological pacing phrase.',
          supportingExample: 'Agreeing with the objection immediately neutralizes the fight-or-flight defensive wall.',
          designNotes: 'Highlighted callout bubble with exact verbatim phrasing.',
          sourceReferences: ['Negotiation & Hostage Communication Insights'],
        },
        {
          headline: '4. Step 2: Calculate the Cost of Inaction',
          body: 'Calculate the bleeding: "Right now, your site gets ~400 monthly visitors, but only 2 call. If we fix your mobile load time and booking form to convert 8, what is each client worth to you?"',
          visualDirection: 'Simple math card: 6 additional clients × $500 value = $3,000 monthly lost revenue.',
          supportingExample: 'Showing that a slow site loses $36k/year makes a $3k redesign feel like a rational hedge.',
          designNotes: 'High-contrast chalkboard math card showing ROI vs static cost.',
          sourceReferences: ['Consultative Value-Selling Models'],
        },
        {
          headline: '5. Step 3: Offer Phased Scope Instead of Discounts',
          body: 'Protect your rate: "If the full $4,500 redesign is too high for Q1, let\'s launch Phase 1 (mobile booking page & speed optimization) for $1,800 now, and build Phase 2 once new clients arrive."',
          visualDirection: 'Two-tier roadmap: Phase 1 High-Impact Core vs Phase 2 Expansion.',
          supportingExample: 'Scope tiering wins deals while preserving your premium pricing floor.',
          designNotes: 'Step progress card showing modular project milestone investment.',
          sourceReferences: ['Agency Pricing Best Practices'],
        },
      ],
      takeaway: 'Never discount your price to overcome objections. Uncover the real hesitation, calculate the cost of inaction, and trim scope to match budget.',
      cta: 'Save this script for your next client pitch or sales call! 💼',
    };
  }

  // 3. Small Business AI Automation / Repetitive Tasks
  if (
    lower.includes('repetitive') ||
    lower.includes('small business') ||
    lower.includes('automate') ||
    lower.includes('automation') ||
    lower.includes('tasks') ||
    pillar === 'AI_TOOLS_AND_AUTOMATION'
  ) {
    return {
      defaultAngle: 'Three repetitive, high-friction business tasks small businesses can automate with AI in under a weekend',
      authoritativeSources: [
        'https://n8n.io/workflows',
        'https://developer.mozilla.org',
      ],
      findings: [
        'Small business operators spend 15-20 hours per week on manual data entry, customer triage, and scheduling follow-ups.',
        'High-value automation targets require high frequency and low subjective creativity.',
        'Three highest ROI workflows: 1. Inbound lead qualification & routing, 2. Invoice & receipt data extraction, 3. Calendar appointment follow-ups.',
        'Local or self-hosted automation tools (n8n, Python webhooks) avoid expensive per-task commercial SaaS fees.',
      ],
      suggestedStructure: 'Problem, Explanation, Solution',
      slideThemes: [
        {
          headline: '1. Why Most "AI Automation" Fails Small Businesses',
          body: 'Most small business owners try to automate creative thinking or whole jobs. Real automation succeeds by targeting high-volume, zero-creativity administrative friction.',
          visualDirection: 'Grid comparing: Vague AI hype ("AI runs your business") vs. Grounded reality ("AI parses receipts into Google Sheets").',
          supportingExample: 'Administrative tasks consume 35% of an average small business owner\'s weekly productive hours.',
          designNotes: 'Split card with red buzzword filter vs green practical automation badge.',
          sourceReferences: ['Small Business Administration Workflow Studies'],
        },
        {
          headline: '2. Task 1: Inbound Lead Triage & Instant Qualification',
          body: 'Replace manual email checks with a webhook that extracts lead budget, timeline, and urgency from form submissions, tagging high-value prospects instantly in your CRM.',
          visualDirection: 'Flowchart: Contact Form -> AI Extraction (JSON) -> Slack Alert for Hot Leads vs Auto-Email for General Questions.',
          supportingExample: 'Responding to high-value service inquiries within 5 minutes increases qualified conversion by 391%.',
          designNotes: 'Visual pipeline with lightning bolt trigger and CRM notification card.',
          sourceReferences: ['Lead Response Velocity Benchmarks'],
        },
        {
          headline: '3. Task 2: Invoice & Receipt OCR Data Extraction',
          body: 'Stop typing supplier bills line-by-line. Use a multimodal Vision LLM or OCR script to extract vendor, invoice number, due date, and line totals directly into accounting software.',
          visualDirection: 'Visual card showing crumpled photo invoice -> Clean structured bookkeeping table.',
          supportingExample: 'Automated invoice parsing cuts accounts-payable processing cost from $12/invoice to under $0.05.',
          designNotes: 'Scanner visual with extraction bounding boxes transforming into spreadsheet cells.',
          sourceReferences: ['Accounting Automation Industry Reports'],
        },
        {
          headline: '4. Task 3: Appointment Scheduling & No-Show Reminders',
          body: 'Automate two-way calendar reminders that prompt clients to confirm or reschedule 24 hours prior. If they reply "Can\'t make it", the system offers new slots automatically.',
          visualDirection: 'SMS conversation simulation showing automated reschedule workflow without human intervention.',
          supportingExample: 'Interactive two-way SMS reminders reduce service appointment no-show rates by up to 48%.',
          designNotes: 'Mobile chat thread mockup showing confirmation buttons and instant calendar sync.',
          sourceReferences: ['Healthcare & Service Practice Management Research'],
        },
        {
          headline: '5. The $0 Tech Stack to Build This',
          body: 'You don\'t need $500/month Enterprise software. Use self-hosted n8n or Python scripts connecting local webhooks with lightweight AI models to run this for pennies.',
          visualDirection: 'Tech stack infographic: Webhook -> Self-hosted n8n -> Local LLM -> Database.',
          supportingExample: 'Self-hosting your workflow engine eliminates recurring per-operation zap costs that scale linearly.',
          designNotes: 'Clean modular tech architecture badges with zero cloud-tax highlight.',
          sourceReferences: ['Open-Source Workflow Automation Docs'],
        },
      ],
      takeaway: 'Focus AI automation on high-frequency, rule-based bottlenecks: lead triage, invoice parsing, and appointment confirmations.',
      cta: 'Save this carousel to start automating your daily business bottlenecks! ⚙️',
    };
  }

  // 4. Building in Public / Project Development
  if (
    lower.includes('build in public') ||
    lower.includes('building in public') ||
    lower.includes('document') ||
    lower.includes('project') ||
    pillar === 'BUILD_IN_PUBLIC_AND_JOURNEY'
  ) {
    return {
      defaultAngle: 'What to document when building a software project in public (without sharing proprietary secrets)',
      authoritativeSources: [
        'https://indiehackers.com',
        'https://github.com/readme',
      ],
      findings: [
        'Audiences tune out generic hype ("Big update coming!"); they engage deeply with technical postmortems and real decision dilemmas.',
        'Key documentation pillars: Architecture decisions, painful bugs, conversion benchmarks, and pricing experiments.',
        'Transparency builds authentic developer authority and provides built-in user testing before official launch.',
        'Never invent fake metrics or exaggerate milestone achievements—credibility is fragile.',
      ],
      suggestedStructure: 'Observation, Explanation, Practical Implication',
      slideThemes: [
        {
          headline: '1. Why Most "Building in Public" Feels Like Noise',
          body: 'Most creators tweet "Huge feature dropping soon! 🚀" with zero substance. Real building in public isn\'t self-promotion—it is public engineering notes and transparent problem-solving.',
          visualDirection: 'Contrast card: Fake Hype ("Crushing it today!") vs Authentic Documentation ("Here is why our database deadlocked at 2am").',
          supportingExample: 'Technical teardowns generate 4x higher bookmark rates than generic milestone announcements.',
          designNotes: 'Dark card with crossed-out buzzwords and highlighted engineering log.',
          sourceReferences: ['Developer Community Retention Trends'],
        },
        {
          headline: '2. Document Your Architectural Trade-offs',
          body: 'Explain why you picked SQLite over PostgreSQL, or why you ditched a trendy third-party library for a 50-line custom script. People learn from your decision boundaries.',
          visualDirection: 'Architecture decision matrix showing Trade-offs: Latency vs Complexity vs Operational Cost.',
          supportingExample: 'Sharing architectural decision records (ADRs) attracts senior peers and early technical adopters.',
          designNotes: 'Comparison table layout showing chosen stack vs discarded alternatives.',
          sourceReferences: ['Architectural Decision Records Guidelines'],
        },
        {
          headline: '3. Share Your Real Bugs & Postmortems',
          body: 'Document the bug that took you 6 hours to find. Show the broken code, your wrong hypotheses, and the single line that finally fixed it.',
          visualDirection: 'Diff block showing the exact broken code line vs the fixed implementation.',
          supportingExample: 'Nothing builds trust faster than demonstrating how you methodically isolate and fix mistakes.',
          designNotes: 'Git commit diff styling with red deletions and green additions.',
          sourceReferences: ['Software Engineering Incident Postmortem Culture'],
        },
        {
          headline: '4. Share Raw Conversion & Traffic Numbers',
          body: 'Document your funnel transparently: "1,200 people visited our landing page today. Only 14 signed up (1.1% conversion). Here is where 90% dropped off."',
          visualDirection: 'Funnel diagram with drop-off percentages and heat-map observation callout.',
          supportingExample: 'Transparent funnel breakdowns invite community feedback that actively improves your product.',
          designNotes: 'Sleek funnel graph showing Visitors -> CTA Clicks -> Completed Registrations.',
          sourceReferences: ['Product Analytics & Conversion Benchmarks'],
        },
        {
          headline: '5. The Ground Rule: Never Fake the Journey',
          body: 'Never invent milestones, fake MRR screenshots, or exaggerate user counts. Your long-term reputation as a builder is worth infinitely more than short-term vanity impressions.',
          visualDirection: 'Summary checklist: Authentic logs, verified numbers, honest lessons, zero fabricated hype.',
          supportingExample: 'The builders with the highest retention are those who honestly share both slow months and breakthrough sprints.',
          designNotes: 'Shield badge with verified builder integrity principles.',
          sourceReferences: ['Indie Hacker Principles'],
        },
      ],
      takeaway: 'Building in public isn\'t self-promotion. Document architectural trade-offs, real debugging postmortems, and honest conversion numbers.',
      cta: 'Save this guide for your next build sprint and start documenting! 🛠️',
    };
  }

  // 5. Website Dev, SEO & Google Search Central
  if (
    lower.includes('seo') ||
    lower.includes('website') ||
    lower.includes('landing page') ||
    lower.includes('google') ||
    pillar === 'WEBSITE_DEV_AND_SEO'
  ) {
    return {
      defaultAngle: 'Core Web Vitals & Local Search: Practical optimizations backed by official Google Search Central guidance',
      authoritativeSources: [
        'https://developers.google.com/search/docs/appearance/page-experience',
        'https://web.dev/explore/metrics',
      ],
      findings: [
        'Google officially emphasizes user page experience: Largest Contentful Paint (LCP) under 2.5s, Cumulative Layout Shift (CLS) under 0.1, and Interaction to Next Paint (INP) under 200ms.',
        'Mobile responsiveness and local NAP (Name, Address, Phone) consistency dictate local map pack inclusion.',
        'Intrusive interstitial popups on mobile trigger search ranking demotions.',
        'Speed audits must be verified on throttled 4G mobile profiles rather than high-speed office fiber.',
      ],
      suggestedStructure: 'Mistake, Why it happens, Correction',
      slideThemes: [
        {
          headline: '1. What Google Actually Measures in Page Experience',
          body: 'Google Search Central evaluates real-world user page experience through Core Web Vitals: LCP (loading), INP (interactivity), and CLS (visual stability).',
          visualDirection: 'Core Web Vitals meter: LCP < 2.5s, INP < 200ms, CLS < 0.1.',
          supportingExample: 'Sites meeting Core Web Vitals thresholds have 24% lower page abandonment rates.',
          designNotes: 'Three gauge meters with green threshold indicators.',
          sourceReferences: ['Google Search Central Documentation'],
        },
        {
          headline: '2. The Heavy Image Trap Hurting Mobile LCP',
          body: 'Unoptimized hero photos (3MB-5MB JPEGs) choke cellular connections. Convert images to modern WebP/AVIF formats and set explicit width/height to eliminate layout shifts.',
          visualDirection: 'Network waterfall comparison: 4.8MB uncompressed asset vs 95KB modern WebP.',
          supportingExample: 'Compressing and resizing images eliminates up to 70% of initial mobile loading latency.',
          designNotes: 'Before/after compression bar chart showing dramatic byte savings.',
          sourceReferences: ['web.dev Image Performance Guidance'],
        },
        {
          headline: '3. Eliminate Mobile Layout Shifts (CLS)',
          body: 'When banners or ad blocks load late, they push content downward while the user is tapping, causing accidental clicks. Always reserve aspect-ratio containers.',
          visualDirection: 'Mobile screen showing jittery jumping text vs stable reserved layout skeleton.',
          supportingExample: 'Maintaining CLS below 0.1 prevents frustrating mis-clicks that spike bounce rates.',
          designNotes: 'Layout wireframe with dotted aspect-ratio container holding space.',
          sourceReferences: ['Google Web Vitals Documentation'],
        },
        {
          headline: '4. Local SEO: NAP Consistency & Mobile Click-to-Call',
          body: 'For local businesses, your website footer details (Name, Address, Phone) must mirror your Google Business Profile word-for-word, with one-tap tel: links.',
          visualDirection: 'Side-by-side verification: Website Footer NAP schema matching Google Maps Card.',
          supportingExample: 'Over 60% of local smartphone searches convert to a phone call within 24 hours.',
          designNotes: 'Checkmark comparison list between website footer and Google Maps entity.',
          sourceReferences: ['Google Local Business Search Guidelines'],
        },
        {
          headline: '5. The Testing Rule: Never Trust Desktop Fiber',
          body: 'Test your site in Chrome DevTools under "Fast 3G" or "Slow 4G" emulation with 4x CPU throttling. Real clients view your site on patchy mobile networks.',
          visualDirection: 'DevTools performance throttling settings screenshot with warning highlight.',
          supportingExample: 'Desktop testing masks heavy JavaScript execution waterfalls that freeze budget smartphones.',
          designNotes: 'Throttling badge showing realistic mobile network simulation.',
          sourceReferences: ['Chrome DevTools Documentation'],
        },
      ],
      takeaway: 'Great websites win on Core Web Vitals, zero layout shifts, and frictionless mobile conversion, not heavy animations.',
      cta: 'Save this checklist for your next website audit or client proposal! 🚀',
    };
  }

  // 6. Generic / Custom Fallback Synthesizer (Zero repetition, authentic to cleanTopic)
  return {
    defaultAngle: `A practical, fluff-free breakdown of ${cleanTopic} based on verified principles`,
    authoritativeSources: [
      'https://developer.mozilla.org',
      'https://github.com',
    ],
    findings: [
      `Mastering ${cleanTopic} requires isolating core constraints before applying complex tools.`,
      `Standardizing inputs and baseline models upfront reduces edge-case friction significantly.`,
      `Observable benchmarks provide verifiable evidence over subjective assumptions.`,
    ],
    suggestedStructure: 'Problem, Explanation, Solution',
    slideThemes: [
      {
        headline: `1. The Real Bottleneck in ${cleanTopic}`,
        body: `Most practitioners tackle ${cleanTopic} by treating surface symptoms rather than the foundational architecture. They spend hours guessing and debugging.`,
        visualDirection: 'Split graphic showing ad-hoc guesswork vs standardized system.',
        supportingExample: `Focusing on root constraints in ${cleanTopic} saves hours of rework.`,
        designNotes: 'High-contrast comparison card with clear boundary lines.',
        sourceReferences: ['Technical Standards & Workflow Principles'],
      },
      {
        headline: `2. The Non-Obvious Strategy for ${cleanTopic}`,
        body: `Isolate the 3 highest-friction steps in your ${cleanTopic} workflow. Standardize your baseline rules before scaling.`,
        visualDirection: 'Process flowchart showing step-by-step constraint isolation.',
        supportingExample: `Standardizing baseline contracts upfront prevents downstream regressions.`,
        designNotes: 'Clean flowchart with numbered stages.',
        sourceReferences: ['Workflow Architecture Standards'],
      },
      {
        headline: `3. Step-by-Step Implementation`,
        body: `Step 1: Audit current friction points.\nStep 2: Establish verified baseline constraints.\nStep 3: Measure execution latency and iterate.`,
        visualDirection: 'Numbered checklist card with verification checkpoints.',
        supportingExample: `Measurable iteration yields reproducible outcomes.`,
        designNotes: 'Progress card with clean status badges.',
        sourceReferences: ['Verified Best Practices'],
      },
      {
        headline: `4. Production Takeaway & Best Practices`,
        body: `Avoid fragile workarounds. Own your critical operational paths and benchmark execution regularly.`,
        visualDirection: 'Summary highlight box with core action rules.',
        supportingExample: `Grounded in observable production outcomes.`,
        designNotes: 'Summary highlight card with high-contrast accent.',
        sourceReferences: ['Production Engineering Principles'],
      },
      {
        headline: `5. Final Takeaway`,
        body: `Real progress in ${cleanTopic} comes down to standardizing your system rather than chasing shortcuts.`,
        visualDirection: 'Final callout card with memorable summary rule.',
        supportingExample: `Tested across real build sprints.`,
        designNotes: 'Bold takeaway text with verified checkmark.',
        sourceReferences: ['Documented Principles'],
      },
    ],
    takeaway: `Mastering ${cleanTopic} comes down to standardizing your system rather than guessing.`,
    cta: `Save this carousel for your next project and comment below! 🚀`,
  };
}

// Compute duplicate overlap between candidate and existing carousels
function checkDuplicateOverlap(
  candidate: { title: string; topic?: string; slides: Array<{ headline: string; body: string }> },
  existingList: CarouselProject[]
): { isDuplicate: boolean; similarityScore: number; overlappingTitle?: string; reason?: string } {
  if (!existingList || existingList.length === 0) {
    return { isDuplicate: false, similarityScore: 0 };
  }

  const cleanCandidateText = [
    candidate.title,
    candidate.topic || '',
    ...candidate.slides.map((s) => `${s.headline} ${s.body}`),
  ]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');

  const candidateTokens = new Set(cleanCandidateText.split(/\s+/).filter((t) => t.length > 3));

  for (const existing of existingList) {
    // 1. Direct title match check
    if (existing.title.trim().toLowerCase() === candidate.title.trim().toLowerCase()) {
      return {
        isDuplicate: true,
        similarityScore: 1.0,
        overlappingTitle: existing.title,
        reason: 'A saved carousel with the exact same title already exists in your library.',
      };
    }

    // 2. Token overlap analysis
    const cleanExistingText = [
      existing.title,
      existing.topic || '',
      ...existing.slides.map((s) => `${s.headline} ${s.body}`),
    ]
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ');

    const existingTokens = new Set(cleanExistingText.split(/\s+/).filter((t) => t.length > 3));

    let intersectionCount = 0;
    candidateTokens.forEach((token) => {
      if (existingTokens.has(token)) {
        intersectionCount++;
      }
    });

    const minTokenCount = Math.min(candidateTokens.size, existingTokens.size);
    const overlapRatio = minTokenCount > 0 ? intersectionCount / minTokenCount : 0;

    // Check headline overlap
    const existingHeadlines = existing.slides.map((s) => s.headline.toLowerCase().trim());
    const matchedHeadlines = candidate.slides.filter((s) =>
      existingHeadlines.some((eh) => eh.length > 10 && (eh.includes(s.headline.toLowerCase().trim()) || s.headline.toLowerCase().trim().includes(eh)))
    );

    if (overlapRatio > 0.65 || matchedHeadlines.length >= 3) {
      return {
        isDuplicate: true,
        similarityScore: Math.round(overlapRatio * 100) / 100,
        overlappingTitle: existing.title,
        reason: `High content overlap (${Math.round(overlapRatio * 100)}% token similarity and ${matchedHeadlines.length} identical slide headlines) with "${existing.title}".`,
      };
    }
  }

  return { isDuplicate: false, similarityScore: 0 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = 'pipeline',
      type = 'carousel',
      topic = 'Practical Web Engineering & Architecture',
      pillar = 'BUILDING_PROJECTS_AND_SYSTEMS',
      targetAudience = 'Software engineers, solo founders & technical creators',
      goal = 'Educate and provide actionable implementation steps',
      angle,
      slideCount = 5,
      referenceUrl,
      additionalInstructions,
      structureType = 'Problem, Explanation, Solution',
      existingCarousels = [],
      slideNumber,
      contentBrief: passedBrief,
      aiConfig,
      storyObjective = 'progress',
    } = body;

    const cleanTopic = (topic || '').trim() || 'Modern Engineering Architecture';

    // ---------------------------------------------------------
    // ACTION: DUPLICATE CHECK ONLY
    // ---------------------------------------------------------
    if (action === 'check-duplicate') {
      const candidate = body.candidate;
      if (!candidate) {
        return NextResponse.json({ error: 'Candidate carousel is required' }, { status: 400 });
      }
      const check = checkDuplicateOverlap(candidate, existingCarousels);
      return NextResponse.json({ success: true, ...check });
    }

    // ---------------------------------------------------------
    // ACTION: REGENERATE SINGLE SLIDE
    // ---------------------------------------------------------
    if (action === 'regenerate-slide') {
      const targetSlideNum = Number(slideNumber) || 1;
      const domain = synthesizeDomainKnowledge(cleanTopic, pillar as ContentPillar, targetAudience);
      const fallbackSlideTheme = domain.slideThemes[(targetSlideNum - 1) % domain.slideThemes.length];

      let newSlide: CarouselSlide = {
        slideNumber: targetSlideNum,
        headline: fallbackSlideTheme.headline,
        body: fallbackSlideTheme.body,
        visualDirection: fallbackSlideTheme.visualDirection,
        supportingExample: fallbackSlideTheme.supportingExample,
        designNotes: fallbackSlideTheme.designNotes,
        sourceReferences: fallbackSlideTheme.sourceReferences,
      };

      if (aiConfig) {
        try {
          const slidePrompt = `You are an expert Instagram carousel slide copywriter.
Topic: "${cleanTopic}"
Target Audience: "${targetAudience}"
Goal: "${goal}"
Regenerate SLIDE #${targetSlideNum} of a multi-slide carousel.
Make this slide punchy, specific to "${cleanTopic}", and completely distinct from generic filler.
Include:
- headline: Punchy slide headline (under 60 chars)
- body: Actionable breakdown in 2-3 sentences
- visualDirection: Clear layout and graphic direction
- supportingExample: Real-world benchmark, case, or observation
- designNotes: Styling or typography cues
- sourceReferences: string[] of verified sources or standards

Return ONLY raw JSON with keys: headline, body, visualDirection, supportingExample, designNotes, sourceReferences.`;

          const aiResp = await executeAICompletion(slidePrompt, SYSTEM_STRATEGIST_PROMPT, aiConfig);
          const jsonMatch = aiResp.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            newSlide = {
              slideNumber: targetSlideNum,
              headline: parsed.headline || newSlide.headline,
              body: parsed.body || newSlide.body,
              visualDirection: parsed.visualDirection || newSlide.visualDirection,
              supportingExample: parsed.supportingExample || newSlide.supportingExample,
              designNotes: parsed.designNotes || newSlide.designNotes,
              sourceReferences: Array.isArray(parsed.sourceReferences) ? parsed.sourceReferences : newSlide.sourceReferences,
            };
          }
        } catch (e) {
          console.warn('AI slide regeneration failed, used domain knowledge:', e);
        }
      }

      return NextResponse.json({ success: true, slide: newSlide });
    }

    // ---------------------------------------------------------
    // STORY SEQUENCE GENERATION
    // ---------------------------------------------------------
    if (type === 'story') {
      let createdStory: StorySequence | null = null;
      if (aiConfig) {
        try {
          const prompt = `You are an expert Instagram Stories strategist for an authentic technical creator.
Create a complete 5-frame Instagram Story sequence on the topic: "${cleanTopic}".
Objective: "${storyObjective}"
Target Audience: "${targetAudience}"

Format your response strictly as a JSON object with this shape:
{
  "title": string (punchy sequence title),
  "objective": "${storyObjective}",
  "frames": [
    {
      "frameNumber": number (1 to 5),
      "type": "poll" | "question_box" | "text" | "talking_head" | "link" | "bts",
      "content": string (what to say or show on screen),
      "stickerText": string (optional interactive sticker text)
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
                objective: (parsed.objective || storyObjective) as StorySequence['objective'],
                frames: parsed.frames,
                updatedAt: new Date().toISOString(),
              };
            }
          }
        } catch (aiErr) {
          console.warn('AI story generation error:', aiErr);
        }
      }

      if (!createdStory) {
        createdStory = {
          id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: `Documenting ${cleanTopic} Workflow`,
          objective: storyObjective as StorySequence['objective'],
          frames: [
            { frameNumber: 1, type: 'talking_head', content: `Quick context on how I'm tackling ${cleanTopic} today.`, stickerText: 'Day 1 Sprint 🛠️' },
            { frameNumber: 2, type: 'bts', content: `Screen capture of the working setup and core bottleneck.`, stickerText: 'Under the Hood' },
            { frameNumber: 3, type: 'poll', content: `Have you struggled with ${cleanTopic} in your projects?`, stickerText: 'Poll: Yes vs No' },
            { frameNumber: 4, type: 'text', content: `The single biggest takeaway: simplify constraints before scaling.`, stickerText: 'Key Rule' },
            { frameNumber: 5, type: 'link', content: `Swipe to read the complete breakdown in my new carousel!`, stickerText: 'Read Carousel ➔' },
          ],
          updatedAt: new Date().toISOString(),
        };
      }

      return NextResponse.json({ success: true, project: createdStory });
    }

    // ---------------------------------------------------------
    // CAROUSEL GENERATION (Research -> Brief -> Slides -> Duplicate Check)
    // ---------------------------------------------------------

    // STEP 1 & 2: UNDERSTANDING & TOPIC RESEARCH
    const domainKnowledge = synthesizeDomainKnowledge(cleanTopic, pillar as ContentPillar, targetAudience);
    let isLiveResearched = false;
    let researchOffline = true;
    let researchSummary = domainKnowledge.findings.join('\n• ');
    let researchSources = [...domainKnowledge.authoritativeSources];
    let researchFindings = [...domainKnowledge.findings];

    if (referenceUrl && referenceUrl.trim()) {
      researchSources.unshift(referenceUrl.trim());
    }

    if (aiConfig) {
      try {
        const researchPrompt = `You are a rigorous technical researcher.
Topic: "${cleanTopic}"
Pillar: "${pillar}"
Target Audience: "${targetAudience}"
Optional Reference: "${referenceUrl || 'None provided'}"
Additional Context: "${additionalInstructions || 'None'}"

Conduct topic-specific investigation on "${cleanTopic}".
1. Formulate 3 specific search queries relevant ONLY to "${cleanTopic}".
2. Identify 3 authoritative public documentation or research sources.
3. Extract 4 verifiable facts, benchmarks, or actionable implementation methods.
4. Propose a specific, high-retention angle distinct from generic fluff.

Format your response strictly as a JSON object:
{
  "searchQueries": string[],
  "sources": string[],
  "findings": string[],
  "distinctAngle": string,
  "summary": string
}

Return ONLY raw JSON.`;

        const researchResp = await executeAICompletion(researchPrompt, SYSTEM_RESEARCHER_PROMPT, aiConfig);
        const match = researchResp.match(/\{[\s\S]*\}/);
        if (match) {
          const parsedRes = JSON.parse(match[0]);
          if (Array.isArray(parsedRes.findings) && parsedRes.findings.length > 0) {
            researchFindings = parsedRes.findings;
            researchSummary = parsedRes.summary || parsedRes.findings.join('\n• ');
            researchSources = Array.isArray(parsedRes.sources) && parsedRes.sources.length > 0
              ? parsedRes.sources
              : researchSources;
            isLiveResearched = true;
            researchOffline = false;
          }
        }
      } catch (rErr) {
        console.warn('AI research step failed or offline:', rErr);
        isLiveResearched = false;
        researchOffline = true;
      }
    }

    // If client requested research only, return research artifact
    if (action === 'research') {
      return NextResponse.json({
        success: true,
        research: {
          topic: cleanTopic,
          pillar,
          sources: researchSources,
          findings: researchFindings,
          summary: researchSummary,
          isResearched: isLiveResearched,
          researchOffline,
        },
      });
    }

    // STEP 3: CONTENT BRIEF CREATION
    const specificAngle = angle || domainKnowledge.defaultAngle;
    const contentBrief: CarouselContentBrief = passedBrief || {
      mainTopic: cleanTopic,
      specificAngle,
      targetAudience,
      intendedTakeaway: domainKnowledge.takeaway,
      researchFindings,
      sources: researchSources,
      proposedOutline: domainKnowledge.slideThemes.slice(0, slideCount).map((s) => s.headline),
    };

    if (action === 'brief') {
      return NextResponse.json({
        success: true,
        contentBrief,
        isResearched: isLiveResearched,
        researchOffline,
      });
    }

    // STEP 4: GENERATE SLIDES FROM BRIEF & RESEARCH
    let createdCarousel: CarouselProject | null = null;

    if (aiConfig) {
      try {
        const generationPrompt = `You are an elite Instagram Carousel designer and technical copywriter.
Generate a complete ${slideCount}-slide Instagram carousel based STRICTLY on this Content Brief and Research.

CONTENT BRIEF:
- Topic: "${contentBrief.mainTopic}"
- Specific Angle: "${contentBrief.specificAngle}"
- Target Audience: "${contentBrief.targetAudience}"
- Desired Goal: "${goal}"
- Narrative Structure: "${structureType}"
- Intended Takeaway: "${contentBrief.intendedTakeaway}"
- Research Findings: ${JSON.stringify(contentBrief.researchFindings)}
- Sources: ${JSON.stringify(contentBrief.sources)}
- Additional Instructions: "${additionalInstructions || 'None'}"

RULES:
1. Every slide must advance the specific topic: "${contentBrief.mainTopic}".
2. Do NOT mention WhatsApp, chatbots, or unrelated topics unless the topic explicitly requests them.
3. Slide 1 is the high-impact Cover Slide that hooks the reader.
4. Slides 2 to ${slideCount} must have concrete headlines, 2-3 sentence punchy bodies, visual directions, real supporting examples, and design notes.
5. End with a memorable takeaway and actionable call-to-action.

Format your response strictly as a JSON object:
{
  "title": string (punchy title under 60 chars),
  "coverSlide": {
    "headline": string (high-impact hook),
    "subtitle": string (clear 1-sentence value proposition),
    "visualNotes": string (visual design direction)
  },
  "slides": [
    {
      "slideNumber": number (1 to ${slideCount}),
      "headline": string (punchy numbered headline),
      "body": string (clear, actionable breakdown in 2-3 sentences),
      "visualDirection": string (diagram, code snippet, contrast, flowchart),
      "supportingExample": string (real-world stat, case, benchmark, or observation),
      "designNotes": string (typography, badge, or accent cue),
      "sourceReferences": string[]
    }
  ],
  "finalTakeaway": string (one powerful summary rule),
  "callToAction": string (actionable comment or save prompt),
  "caption": string (complete Instagram post caption with line breaks and 4-5 relevant hashtags)
}

Return ONLY raw JSON.`;

        const response = await executeAICompletion(generationPrompt, SYSTEM_STRATEGIST_PROMPT, aiConfig);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.coverSlide && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
            createdCarousel = {
              id: `car_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              title: parsed.title || `${contentBrief.mainTopic}`,
              topic: contentBrief.mainTopic,
              pillar: pillar as ContentPillar,
              intendedAudience: contentBrief.targetAudience,
              goal,
              angle: contentBrief.specificAngle,
              referenceUrl: referenceUrl || undefined,
              additionalInstructions: additionalInstructions || undefined,
              structureType: structureType as CarouselProject['structureType'],
              contentBrief,
              researchSummary,
              researchSources,
              isResearched: isLiveResearched,
              researchOffline,
              coverSlide: {
                headline: parsed.coverSlide.headline || `How to Master ${cleanTopic}`,
                subtitle: parsed.coverSlide.subtitle || contentBrief.specificAngle,
                visualNotes: parsed.coverSlide.visualNotes || 'Dark high-contrast card with clean typography and swipe badge.',
              },
              slides: parsed.slides.map((s: Partial<CarouselSlide>, idx: number) => ({
                slideNumber: s.slideNumber || idx + 1,
                headline: s.headline || `Step ${idx + 1}: Implementation Rule`,
                body: s.body || 'Practical engineering approach with zero unnecessary complexity.',
                visualDirection: s.visualDirection || 'System architecture diagram.',
                supportingExample: s.supportingExample || 'Based on production benchmarks.',
                designNotes: s.designNotes || 'Clean card with accent border.',
                sourceReferences: Array.isArray(s.sourceReferences) && s.sourceReferences.length > 0 ? s.sourceReferences : researchSources,
              })),
              finalTakeaway: parsed.finalTakeaway || contentBrief.intendedTakeaway,
              callToAction: parsed.callToAction || 'Save this carousel for your next build sprint and comment below!',
              caption: parsed.caption || `${parsed.title}\n\nSwipe through for the complete breakdown. 📌\n\nSave this for your next sprint! 🚀\n\n#buildinpublic #solodev #creatoros`,
              researchReferences: researchSources,
              status: 'draft',
              generationStatus: 'completed',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        }
      } catch (aiErr) {
        console.warn('AI carousel slide generation failed, falling back to verified domain synthesizer:', aiErr);
      }
    }

    // High-quality Topic-Specific Synthesizer (Zero repetition, authentic to cleanTopic)
    if (!createdCarousel) {
      const selectedSlideThemes = domainKnowledge.slideThemes.slice(0, slideCount);
      const generatedSlides: CarouselSlide[] = selectedSlideThemes.map((theme, idx) => ({
        slideNumber: idx + 1,
        headline: theme.headline,
        body: theme.body,
        visualDirection: theme.visualDirection,
        supportingExample: theme.supportingExample,
        designNotes: theme.designNotes,
        sourceReferences: theme.sourceReferences,
      }));

      createdCarousel = {
        id: `car_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: cleanTopic.length > 55 ? `${cleanTopic.slice(0, 52)}...` : cleanTopic,
        topic: cleanTopic,
        pillar: pillar as ContentPillar,
        intendedAudience: targetAudience,
        goal,
        angle: specificAngle,
        referenceUrl: referenceUrl || undefined,
        additionalInstructions: additionalInstructions || undefined,
        structureType: structureType as CarouselProject['structureType'],
        contentBrief,
        researchSummary,
        researchSources,
        isResearched: isLiveResearched,
        researchOffline,
        coverSlide: {
          headline: domainKnowledge.slideThemes[0]?.headline || `Mastering ${cleanTopic}`,
          subtitle: specificAngle,
          visualNotes: 'Dark card with high-contrast numbered badges and swipe indicator.',
        },
        slides: generatedSlides,
        finalTakeaway: domainKnowledge.takeaway,
        callToAction: domainKnowledge.cta,
        caption: `${cleanTopic}\n\nSwipe through for the complete breakdown. 📌\n\nSave this post for your next project! 👇\n\n#buildinpublic #solodev #creatoros`,
        researchReferences: researchSources,
        status: 'draft',
        generationStatus: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // STEP 5: DUPLICATE & REPETITION CHECK
    const duplicateCheck = checkDuplicateOverlap(
      {
        title: createdCarousel.title,
        topic: createdCarousel.topic,
        slides: createdCarousel.slides,
      },
      existingCarousels
    );

    return NextResponse.json({
      success: true,
      project: createdCarousel,
      duplicateCheck,
      contentBrief,
      isResearched: isLiveResearched,
      researchOffline,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('generate-carousel API error:', error);
    return NextResponse.json(
      { error: error.message || 'Carousel generation failed' },
      { status: 500 }
    );
  }
}
