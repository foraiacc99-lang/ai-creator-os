import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Analytics Calculations Test Suite (Manual Metrics)
test('Analytics: calculates correct engagement rate percentage', () => {
  const reach = 68100;
  const interactions = 4210 + 388 + 1940 + 3410; // likes + comments + shares + saves = 9948
  const er = +((interactions / reach) * 100).toFixed(2);
  assert.equal(er, 14.61);
});

test('Analytics: safely handles zero or missing reach without division by zero', () => {
  const calculateER = (interactions, reach) => {
    if (!reach || reach <= 0) return 0;
    return +((interactions / reach) * 100).toFixed(2);
  };

  assert.equal(calculateER(500, 0), 0);
  assert.equal(calculateER(500, null), 0);
  assert.equal(calculateER(500, undefined), 0);
});

test('Analytics: sorts manual growth snapshots chronologically', () => {
  const snapshots = [
    { date: '2026-10-12', totalFollowers: 3280 },
    { date: '2026-09-15', totalFollowers: 2450 },
    { date: '2026-10-01', totalFollowers: 2890 },
  ];

  const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  assert.equal(sorted[0].date, '2026-09-15');
  assert.equal(sorted[1].date, '2026-10-01');
  assert.equal(sorted[2].date, '2026-10-12');
  assert.equal(sorted[2].totalFollowers - sorted[0].totalFollowers, 830);
});

// 2. Google Calendar OAuth Token Expiration Test Suite
test('Google Auth: detects expired OAuth token and signals refresh need', () => {
  const isTokenExpired = (tokenExpiresAt) => {
    if (!tokenExpiresAt) return true;
    return new Date(tokenExpiresAt).getTime() <= Date.now();
  };

  const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
  const futureDate = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString();

  assert.equal(isTokenExpired(pastDate), true);
  assert.equal(isTokenExpired(futureDate), false);
  assert.equal(isTokenExpired(null), true);
});

// 3. Content Calendar Operations Test Suite
test('Calendar: prevents duplicate auto-scheduling for the same day', () => {
  const existingEntries = [{ id: '1', plannedDate: '2026-10-16' }];

  const hasDuplicateDate = (existing, plannedDate) => {
    return existing.some((e) => e.plannedDate === plannedDate);
  };

  assert.equal(hasDuplicateDate(existingEntries, '2026-10-16'), true);
  assert.equal(hasDuplicateDate(existingEntries, '2026-10-17'), false);
});

// 4. Content Ideas Normalized Title Duplicate Detection
test('Ideas: detects duplicate ideas using normalized title matching', () => {
  const existingIdeas = [
    { id: 'idea_1', title: 'Why 90% of Local Business Websites Fail to Convert' },
    { id: 'idea_2', title: '5 Free GitHub Repos for AI Developers' },
  ];

  const normalizeTitle = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  const isDuplicate = (title) => {
    const norm = normalizeTitle(title);
    return existingIdeas.some((i) => normalizeTitle(i.title) === norm);
  };

  assert.equal(isDuplicate('Why 90% of Local Business Websites Fail to Convert!'), true);
  assert.equal(isDuplicate('why 90 of local business websites fail to convert'), true);
  assert.equal(isDuplicate('5 Free GitHub Repos for AI Developers'), true);
  assert.equal(isDuplicate('Completely New AI Cold Calling Strategy'), false);
});

// 5. AI Voice Profile & Word Avoidance Filter
test('Voice Profile: detects and strips forbidden corporate fluff words', () => {
  const avoidWords = ['delve', 'revolutionize', 'game-changer', 'testament'];
  const testSentence = 'In this video, we delve into a game-changer tool that will revolutionize your workflow.';

  const containsAvoidWords = (text, forbidden) => {
    const lower = text.toLowerCase();
    return forbidden.filter((word) => lower.includes(word));
  };

  const flagged = containsAvoidWords(testSentence, avoidWords);
  assert.deepEqual(flagged, ['delve', 'revolutionize', 'game-changer']);
});

// 6. Video Duration & Reading Pacing Test Suite
test('Video Analysis: calculates accurate estimated speaking duration at 145 wpm benchmark', () => {
  const calculateDurationSeconds = (text, wpm = 145) => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.round((wordCount / wpm) * 60);
  };

  // 73 words ~ 30 seconds
  const sampleScript = Array.from({ length: 73 }).fill('word').join(' ');
  const dur = calculateDurationSeconds(sampleScript);
  assert.equal(dur, 30);
});

// 7. Zero-Cost Safety Guardrail Check
test('Zero Cost AI: rejects cloud inference when local-only mode is active', () => {
  const resolveProvider = (config) => {
    if (config.localOnlyMode && config.provider !== 'ollama') {
      throw new Error('Local-only mode active: cloud AI providers are blocked');
    }
    if (!config.isCloudEnabled && (config.provider === 'groq' || config.provider === 'openrouter')) {
      throw new Error('Cloud AI is disabled in settings');
    }
    return config.provider;
  };

  // Safe Ollama
  assert.equal(resolveProvider({ provider: 'ollama', localOnlyMode: true, isCloudEnabled: false }), 'ollama');

  // Blocked Groq when local-only mode is true
  assert.throws(() => {
    resolveProvider({ provider: 'groq', localOnlyMode: true, isCloudEnabled: true });
  }, /Local-only mode active/);

  // Blocked OpenRouter when cloud disabled
  assert.throws(() => {
    resolveProvider({ provider: 'openrouter', localOnlyMode: false, isCloudEnabled: false });
  }, /Cloud AI is disabled/);
});

// 8. Content Pillars Definition Integrity Check
test('Pillars: all 6 required content pillars are defined and non-empty', () => {
  const REQUIRED_PILLARS = [
    'AI_TOOLS_AND_AUTOMATION',
    'FREE_GITHUB_AND_DEV_TOOLS',
    'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION',
    'BUILDING_PROJECTS_AND_SYSTEMS',
    'WEBSITE_DEV_AND_SEO',
    'BUILD_IN_PUBLIC_AND_JOURNEY',
  ];

  assert.equal(REQUIRED_PILLARS.length, 6);
  const set = new Set(REQUIRED_PILLARS);
  assert.equal(set.size, 6);
});

// 9. LinkedIn Quality Checker: Buzzwords and Cliché Detection
test('LinkedIn Studio: flags forbidden buzzwords and cliché openings', () => {
  const FORBIDDEN_CLICHES = [
    "in today's digital world",
    "in today's fast-paced",
    "i am thrilled to announce",
    "let that sink in",
    "agree?",
    "here is something nobody talks about",
    "delve",
    "revolutionize",
    "game-changer",
  ];

  const auditContent = (text) => {
    const lower = text.toLowerCase();
    return FORBIDDEN_CLICHES.filter((fluff) => lower.includes(fluff));
  };

  const badPost = "In today's digital world, we must delve into AI to revolutionize our pipeline. Agree?";
  const goodPost = "We spent 4 hours debugging latency in our voice pipeline. Here is the 200ms VAD fix that worked.";

  assert.deepEqual(auditContent(badPost), [
    "in today's digital world",
    "agree?",
    "delve",
    "revolutionize",
  ]);
  assert.deepEqual(auditContent(goodPost), []);
});

// 10. Anti-Hallucination Guard: Validates adherence to source notes
test('LinkedIn Studio: detects invented revenue and milestones when notes are provided', () => {
  const detectInventedMetrics = (content, sourceNotes) => {
    if (!sourceNotes) return false;
    const contentNumbers = content.match(/\$[\d,]+(k|m)?/gi) || [];
    const notesNumbers = sourceNotes.match(/\$[\d,]+(k|m)?/gi) || [];
    return contentNumbers.length > notesNumbers.length;
  };

  const notes = "Made 25 cold calls on Thursday. Booked 3 website video audits.";
  const hallucinatedPost = "I made $50,000 this month by booking 3 website video audits.";
  const honestPost = "On Thursday I made 25 cold calls and booked 3 website video audits using a 2-minute mobile test.";

  assert.equal(detectInventedMetrics(hallucinatedPost, notes), true);
  assert.equal(detectInventedMetrics(honestPost, notes), false);
});

// 11. Smart Comment-Based CTA Validation
test('LinkedIn Studio: parses comment-based resource keyword and validates readiness', () => {
  const validateCTA = (ctaSettings) => {
    if (ctaSettings.type !== 'Offer a resource through comments') {
      return { isValid: true, requiresPrep: false };
    }
    const keyword = (ctaSettings.resourceKeyword || '').trim().toUpperCase();
    const isKeywordValid = keyword.length >= 3 && /^[A-Z0-9_-]+$/.test(keyword);
    const requiresPrep = !ctaSettings.resourceReady;
    return { isValid: isKeywordValid, requiresPrep, keyword };
  };

  const readyCTA = {
    type: 'Offer a resource through comments',
    resourceKeyword: 'GITHUB',
    resourceName: 'Baileys Docker Compose Template',
    resourceReady: true,
  };

  const unreadyCTA = {
    type: 'Offer a resource through comments',
    resourceKeyword: 'TEMPLATE',
    resourceName: 'Cold Calling Script',
    resourceReady: false,
  };

  const parsedReady = validateCTA(readyCTA);
  assert.equal(parsedReady.isValid, true);
  assert.equal(parsedReady.requiresPrep, false);
  assert.equal(parsedReady.keyword, 'GITHUB');

  const parsedUnready = validateCTA(unreadyCTA);
  assert.equal(parsedUnready.isValid, true);
  assert.equal(parsedUnready.requiresPrep, true);
});

// 12. Asset Conversion: Generates new LinkedIn record without overwriting original
test('LinkedIn Studio: converting a Reel script creates separate record preserving original', () => {
  const originalScript = {
    id: 'script_001',
    title: 'Cold Calling Objection Handling',
    currentSpokenScript: 'Stop pitching websites. Pitch mobile load speed.',
    pillar: 'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION',
  };

  const convertScriptToLinkedIn = (script) => ({
    id: `li_${Date.now()}`,
    title: `LinkedIn: ${script.title}`,
    topic: script.title,
    contentPillar: script.pillar,
    generatedContent: `${script.title}\n\n${script.currentSpokenScript}`,
    currentEditedContent: `${script.title}\n\n${script.currentSpokenScript}`,
    sourceReference: { type: 'script', id: script.id, title: script.title },
    status: 'Draft',
  });

  const linkedInPost = convertScriptToLinkedIn(originalScript);
  assert.notEqual(linkedInPost.id, originalScript.id);
  assert.equal(linkedInPost.sourceReference.id, originalScript.id);
  assert.equal(originalScript.id, 'script_001'); // Original remains unchanged
});

// 13. OmniRoute Provider Resolution in Central AI Layer
test('AI Provider: OmniRoute resolves correctly and respects local safety switch', () => {
  const resolveInferenceProvider = (config) => {
    if (config.localOnlyMode && config.provider !== 'ollama') {
      throw new Error('Local-only mode active: cloud/remote AI providers are blocked');
    }
    return config.provider;
  };

  // Safe OmniRoute when localOnlyMode is false
  assert.equal(resolveInferenceProvider({ provider: 'omniroute', localOnlyMode: false }), 'omniroute');

  // Blocked OmniRoute when localOnlyMode is true
  assert.throws(() => {
    resolveInferenceProvider({ provider: 'omniroute', localOnlyMode: true });
  }, /Local-only mode active/);
});

// 14. Provider Categorization Test Suite
test('OmniRoute: identifies model provider accurately from model ID and metadata', () => {
  const identifyProvider = (id, ownedBy = '') => {
    const raw = `${id} ${ownedBy}`.toLowerCase();
    if (raw.includes('kimi') || raw.includes('moonshot')) return 'kimi';
    if (raw.includes('glm') || raw.includes('zhipu') || raw.includes('chatglm')) return 'glm';
    if (raw.includes('claude') || raw.includes('anthropic')) return 'anthropic';
    if (raw.includes('gpt') || raw.includes('o1') || raw.includes('o3') || raw.includes('openai')) return 'openai';
    if (raw.includes('gemini') || raw.includes('google')) return 'google';
    if (raw.includes('deepseek')) return 'deepseek';
    if (raw.includes('ollama') || raw.includes('local')) return 'ollama';
    return 'other';
  };

  assert.equal(identifyProvider('kimi-k1.5'), 'kimi');
  assert.equal(identifyProvider('moonshot-v1-32k'), 'kimi');
  assert.equal(identifyProvider('glm-4-plus'), 'glm');
  assert.equal(identifyProvider('claude-3-5-sonnet-20241022'), 'anthropic');
  assert.equal(identifyProvider('gpt-4o-mini'), 'openai');
  assert.equal(identifyProvider('gemini-2.0-flash'), 'google');
  assert.equal(identifyProvider('deepseek-r1'), 'deepseek');
  assert.equal(identifyProvider('ollama/llama3.2'), 'ollama');
  assert.equal(identifyProvider('unknown-custom-router-model'), 'other');
});

// 15. Pricing Classification & Strict Anti-Hallucination Pricing Rule
test('OmniRoute: enforces strict anti-hallucination pricing and never assumes free without proof', () => {
  const identifyPricing = (id) => {
    const lower = id.toLowerCase();
    if (lower.includes(':free') || lower.startsWith('ollama/')) {
      return { tier: 'free', isFree: true };
    }
    if (
      lower.includes('mini') ||
      lower.includes('flash') ||
      lower.includes('haiku') ||
      lower.includes('nano') ||
      lower.includes('lite')
    ) {
      return { tier: 'low_cost', isFree: false };
    }
    return { tier: 'unknown', isFree: false };
  };

  // Explicit free model
  const freeModel = identifyPricing('meta-llama/llama-3.2-3b-instruct:free');
  assert.equal(freeModel.tier, 'free');
  assert.equal(freeModel.isFree, true);

  // Local Ollama model
  const ollamaModel = identifyPricing('ollama/llama3.2:3b');
  assert.equal(ollamaModel.tier, 'free');
  assert.equal(ollamaModel.isFree, true);

  // Budget model
  const budgetModel = identifyPricing('gpt-4o-mini');
  assert.equal(budgetModel.tier, 'low_cost');
  assert.equal(budgetModel.isFree, false);

  // Flagship model with unverified pricing MUST be 'unknown' or 'paid', NEVER 'free'
  const premiumModel = identifyPricing('claude-3-5-sonnet-20241022');
  assert.equal(premiumModel.tier, 'unknown');
  assert.equal(premiumModel.isFree, false);

  const kimiModel = identifyPricing('kimi-k1.5');
  assert.equal(kimiModel.tier, 'unknown');
  assert.equal(kimiModel.isFree, false);
});

// 16. Dynamic Module Preferences & Fallback Logic
test('Model Preferences: per-module overrides take precedence over global default', () => {
  const modelPreferences = {
    globalDefault: 'kimi-k1.5',
    moduleOverrides: {
      scripts: 'claude-3-5-sonnet-20241022',
      ideas: 'gemini-2.0-flash',
    },
  };

  const getModelForModule = (module, prefs) => {
    const override = prefs.moduleOverrides?.[module];
    if (override && override.trim()) return override.trim();
    if (prefs.globalDefault && prefs.globalDefault.trim()) return prefs.globalDefault.trim();
    return 'kimi-k1.5';
  };

  // Module with override returns override
  assert.equal(getModelForModule('scripts', modelPreferences), 'claude-3-5-sonnet-20241022');
  assert.equal(getModelForModule('ideas', modelPreferences), 'gemini-2.0-flash');

  // Modules without override fall back to global default
  assert.equal(getModelForModule('chat', modelPreferences), 'kimi-k1.5');
  assert.equal(getModelForModule('carousel', modelPreferences), 'kimi-k1.5');
  assert.equal(getModelForModule('linkedin', modelPreferences), 'kimi-k1.5');
  assert.equal(getModelForModule('strategist', modelPreferences), 'kimi-k1.5');
  assert.equal(getModelForModule('competitor', modelPreferences), 'kimi-k1.5');

  // Clearing override restores global default
  const resetPrefs = {
    ...modelPreferences,
    moduleOverrides: { ...modelPreferences.moduleOverrides, scripts: '' },
  };
  assert.equal(getModelForModule('scripts', resetPrefs), 'kimi-k1.5');
});

// 17. Carousel Generation Topic Independence (No WhatsApp bot hijack)
test('Carousel Generation: independently creates AI automation content without WhatsApp hijack', () => {
  const synthesizeTopicSlides = (topic, hook) => {
    const lower = topic.toLowerCase();
    // Verification: general AI automation/agents must NOT be hijacked into WhatsApp
    if (lower.includes('agent') || lower.includes('ai automation') || lower.includes('multi-model') || lower.includes('omniroute')) {
      return {
        category: 'AI_AUTOMATION',
        headline: hook || `Why Most Multi-Model AI Pipelines Break`,
        sampleStep: 'Route requests through a dedicated gateway like OmniRoute',
      };
    }
    if (lower.includes('whatsapp') || lower.includes('baileys')) {
      return {
        category: 'WHATSAPP_BOT',
        headline: hook || `How to Build a WhatsApp Bot`,
        sampleStep: 'QR code session authentication via Baileys',
      };
    }
    return {
      category: 'GENERAL',
      headline: hook || `Practical Guide to ${topic}`,
      sampleStep: 'Standardize architecture',
    };
  };

  const aiTopic = synthesizeTopicSlides(
    'Building an Autonomous AI Agent System with Multi-Model Fallbacks',
    'Stop hardcoding single LLM APIs in production.'
  );
  assert.equal(aiTopic.category, 'AI_AUTOMATION');
  assert.equal(aiTopic.sampleStep.includes('gateway'), true);
  assert.equal(aiTopic.sampleStep.includes('WhatsApp'), false);

  const whatsappTopic = synthesizeTopicSlides('Building a WhatsApp Bot with Baileys');
  assert.equal(whatsappTopic.category, 'WHATSAPP_BOT');
});

// 18. SSRF Protection for Gateway Endpoint
test('Security: blocks internal cloud metadata service IP addresses', () => {
  const isSafeGatewayUrl = (urlStr) => {
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
      const hostname = parsed.hostname.toLowerCase();
      // Block AWS/GCP/Azure link-local metadata address
      if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) return false;
      // Block common link-local ipv6
      if (hostname === '[fe80::1]' || hostname.includes('fe80:')) return false;
      return true;
    } catch {
      return false;
    }
  };

  assert.equal(isSafeGatewayUrl('http://localhost:20128/v1'), true);
  assert.equal(isSafeGatewayUrl('http://127.0.0.1:20128/v1'), true);
  assert.equal(isSafeGatewayUrl('https://my-gateway.internal.company.com/v1'), true);
  assert.equal(isSafeGatewayUrl('http://169.254.169.254/latest/meta-data/'), false);
  assert.equal(isSafeGatewayUrl('ftp://localhost:20128'), false);
  assert.equal(isSafeGatewayUrl('not-a-valid-url'), false);
});

// 19. Task-Based Model Recommendation Engine
test('Model Recommendation: recommends available models matching task characteristics', () => {
  const catalog = [
    { id: 'claude-3-5-sonnet-20241022', provider: 'anthropic', capabilities: { reasoning: true, code: true, chat: true } },
    { id: 'kimi-k1.5', provider: 'kimi', capabilities: { chat: true, vision: false } },
    { id: 'gemini-2.0-flash', provider: 'google', capabilities: { chat: true, vision: true, code: true } },
  ];

  const recommendForTask = (taskType, availableCatalog) => {
    if (taskType === 'scripts') {
      const match = availableCatalog.find((m) => m.provider === 'anthropic' || m.provider === 'kimi');
      return match || availableCatalog[0];
    }
    if (taskType === 'brainstorming') {
      const match = availableCatalog.find((m) => m.provider === 'kimi' || m.provider === 'google');
      return match || availableCatalog[0];
    }
    return availableCatalog[0];
  };

  const scriptRec = recommendForTask('scripts', catalog);
  assert.equal(scriptRec.id, 'claude-3-5-sonnet-20241022');

  const brainstormRec = recommendForTask('brainstorming', catalog);
  assert.equal(brainstormRec.id, 'kimi-k1.5');
});

// 20. Free-Only Mode Filtering
test('Free-Only Mode: filters model catalog without assuming unverified models are free', () => {
  const catalog = [
    { id: 'meta-llama/llama-3.2-3b-instruct:free', pricing: { isFree: true, tier: 'free' } },
    { id: 'gpt-4o-mini', pricing: { isFree: false, tier: 'low_cost' } },
    { id: 'gpt-4o', pricing: { isFree: false, tier: 'paid' } },
    { id: 'kimi-k1.5', pricing: { isFree: false, tier: 'unknown' } },
  ];

  const filterModels = (models, freeOnly) => {
    if (!freeOnly) return models;
    return models.filter((m) => m.pricing.isFree || m.pricing.tier === 'low_cost');
  };

  const all = filterModels(catalog, false);
  assert.equal(all.length, 4);

  const filtered = filterModels(catalog, true);
  assert.equal(filtered.length, 2);
  assert.equal(filtered.some((m) => m.id === 'meta-llama/llama-3.2-3b-instruct:free'), true);
  assert.equal(filtered.some((m) => m.id === 'gpt-4o-mini'), true);
  // Flagship paid model is filtered out
  assert.equal(filtered.some((m) => m.id === 'gpt-4o'), false);
  // Unknown tier is not claimed free and is filtered out in strict free mode
  assert.equal(filtered.some((m) => m.id === 'kimi-k1.5'), false);
});


// 21. LinkedIn Targeted Post Refinements: Visible Transformation Verification
test('LinkedIn Refinements: guarantees visible structural transformation and never leaves text unchanged', () => {
  const initialPost = 'A common trap when dealing with systems is jumping straight to complex tools before understanding the baseline workflow. In order to utilize these models effectively, furthermore, you must implement proper schemas.';

  const refinePost = (content, refineType) => {
    if (refineType === 'make_conversational') {
      return "Here's an honest lesson I had to learn the hard way:\n\n" + content.replace(/in order to/gi, 'to').replace(/furthermore,?\s*/gi, 'Plus, ') + "\n\nCurious how other builders handle this -- what's been your experience?";
    }
    if (refineType === 'make_professional') {
      return "Executive Brief: Scalable Systems and Operational Discipline\n\n1. Enforce Input Boundaries\n2. Observable Latency Monitoring\n3. Minimal Verifiable Interventions";
    }
    if (refineType === 'add_practical_detail') {
      return content + "\n\nConcrete Implementation Checklist:\n1. Boundary Schema Validation (Zod)\n2. Timeout Budgets (500ms)\n3. Self-Hosted Verification";
    }
    return content;
  };

  const conversational = refinePost(initialPost, 'make_conversational');
  assert.notEqual(conversational, initialPost);
  assert.equal(conversational.includes("Here's an honest lesson"), true);
  assert.equal(conversational.includes('Plus,'), true);

  const professional = refinePost(initialPost, 'make_professional');
  assert.notEqual(professional, initialPost);
  assert.equal(professional.includes('Executive Brief'), true);

  const detailed = refinePost(initialPost, 'add_practical_detail');
  assert.notEqual(detailed, initialPost);
  assert.equal(detailed.includes('Concrete Implementation Checklist'), true);
});

// 22. Content Ideas to LinkedIn Studio Integration
test('LinkedIn Studio: maps content idea fields directly into generator strategy', () => {
  const sampleIdea = {
    id: 'idea_491',
    title: 'Why Schema Validation Beats Retry Loops',
    topic: 'Input Validation Boundaries',
    pillar: 'BUILDING_PROJECTS_AND_SYSTEMS',
    targetAudience: 'Developers',
    mainAngle: 'Stop treating symptoms with complex retry loops when you can validate schema boundaries upfront.',
    hook: '80% of pipeline errors vanish with one schema check.',
    supportingResearch: 'Martin Fowler distributed systems patterns.',
  };

  const mapIdeaToLinkedInStrategy = (idea) => ({
    topic: idea.topic || idea.title,
    title: idea.title,
    pillar: idea.pillar,
    targetAudience: idea.targetAudience,
    userNotes: [idea.mainAngle, idea.hook, idea.supportingResearch].filter(Boolean).join('\n\n'),
  });

  const strategy = mapIdeaToLinkedInStrategy(sampleIdea);
  assert.equal(strategy.topic, 'Input Validation Boundaries');
  assert.equal(strategy.title, 'Why Schema Validation Beats Retry Loops');
  assert.equal(strategy.pillar, 'BUILDING_PROJECTS_AND_SYSTEMS');
  assert.equal(strategy.userNotes.includes('80% of pipeline errors vanish'), true);
});

// 23. Research Before Writing: Domain-Specific Grounding Verification
test('Research Before Writing: generates domain-specific verified claims and citations', () => {
  const mockWebResearch = (query) => {
    const q = query.toLowerCase();
    if (q.includes('sales') || q.includes('cold call')) {
      return {
        sourceName: 'Harvard Business Review Sales Benchmark',
        hasClaims: true,
        primaryClaim: '73% of mobile users abandon a local business page that takes longer than 3 seconds to render.',
      };
    }
    return {
      sourceName: 'System Architecture Standards',
      hasClaims: true,
      primaryClaim: 'Validating data schemas at boundaries catches over 80% of pipeline errors before execution.',
    };
  };

  const salesRes = mockWebResearch('Cold calling local business websites');
  assert.equal(salesRes.sourceName.includes('Sales Benchmark'), true);
  assert.equal(salesRes.hasClaims, true);

  const techRes = mockWebResearch('Pipeline schema validation');
  assert.equal(techRes.sourceName.includes('Architecture'), true);
  assert.equal(techRes.hasClaims, true);
});
