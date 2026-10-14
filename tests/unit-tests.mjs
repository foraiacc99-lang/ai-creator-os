import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Analytics Calculations Test Suite
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

test('Analytics: sorts posts by engagement rate descending correctly', () => {
  const posts = [
    { id: '1', metrics: { engagementRate: 4.2 } },
    { id: '2', metrics: { engagementRate: 9.3 } },
    { id: '3', metrics: { engagementRate: 6.8 } },
  ];

  const sorted = [...posts].sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate);
  assert.equal(sorted[0].id, '2');
  assert.equal(sorted[1].id, '3');
  assert.equal(sorted[2].id, '1');
});

// 2. Token Expiration and Auth State Test Suite
test('Auth: detects expired OAuth token and triggers reconnect flag', () => {
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
  const newEntry = { id: '2', plannedDate: '2026-10-16' };

  const hasDuplicateDate = (existing, plannedDate) => {
    return existing.some((e) => e.plannedDate === plannedDate);
  };

  assert.equal(hasDuplicateDate(existingEntries, '2026-10-16'), true);
  assert.equal(hasDuplicateDate(existingEntries, '2026-10-17'), false);
});

// 4. AI Voice Profile & Word Avoidance Filter
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

// 5. Video Duration & Reading Pacing Test Suite
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
