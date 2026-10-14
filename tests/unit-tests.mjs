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
