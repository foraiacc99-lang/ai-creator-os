export type ContentPillar =
  | 'AI_TOOLS_AND_AUTOMATION'
  | 'FREE_GITHUB_AND_DEV_TOOLS'
  | 'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION'
  | 'BUILDING_PROJECTS_AND_SYSTEMS'
  | 'WEBSITE_DEV_AND_SEO'
  | 'BUILD_IN_PUBLIC_AND_JOURNEY';

export interface PillarMetadata {
  id: ContentPillar;
  title: string;
  shortTitle: string;
  description: string;
  topics: string[];
  color: string;
  badgeClass: string;
}

export const CONTENT_PILLARS: PillarMetadata[] = [
  {
    id: 'AI_TOOLS_AND_AUTOMATION',
    title: 'Pillar 1: AI Tools, Agents and Automation',
    shortTitle: 'AI & Automation',
    description: 'Practical demonstrations, voice agents, WhatsApp automation, and realistic cost benchmarks over generic hype.',
    topics: ['AI agents', 'WhatsApp automation', 'Voice agents', 'Practical demos', 'API orchestration', 'Cost & limitations'],
    color: '#8b5cf6',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'FREE_GITHUB_AND_DEV_TOOLS',
    title: 'Pillar 2: Free GitHub Repositories & Developer Tools',
    shortTitle: 'GitHub & Dev Tools',
    description: 'Evaluating license, maintenance, setup friction, documentation quality, and distinguishing open-source from paid APIs.',
    topics: ['5 Useful Free Repos', 'Open-source alternatives', 'Self-hosted tools', 'Setup walkthroughs', 'License & cost checks'],
    color: '#06b6d4',
    badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION',
    title: 'Pillar 3: Sales, Psychology & Client Acquisition',
    shortTitle: 'Sales & Psychology',
    description: 'Cold calling breakdowns, objection handling, pricing models, local prospecting, and grounded sales psychology.',
    topics: ['Cold calling scripts', 'Advance payment objections', 'Website sales calls', 'Negotiation', 'Agency owner lessons'],
    color: '#f59e0b',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'BUILDING_PROJECTS_AND_SYSTEMS',
    title: 'Pillar 4: Building Projects and Business Systems',
    shortTitle: 'Building Systems',
    description: 'Internal dashboards, lead management, debugging lessons, project architecture, and authentic technical execution.',
    topics: ['Internal dashboards', 'Debugging lessons', 'AI-assisted coding', 'System architecture', 'Turning ideas into tools'],
    color: '#10b981',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'WEBSITE_DEV_AND_SEO',
    title: 'Pillar 5: Website Development & SEO',
    shortTitle: 'Web Dev & SEO',
    description: 'Static/animated sites, responsive layouts, conversion audits, client handover, Technical & Local SEO without false ranking guarantees.',
    topics: ['Before & after audits', 'Conversion design', 'Google Search Console', 'Local SEO & GBP', 'Client delivery & hosting'],
    color: '#3b82f6',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'BUILD_IN_PUBLIC_AND_JOURNEY',
    title: 'Pillar 6: Build in Public and Personal Journey',
    shortTitle: 'Build in Public',
    description: 'Authentic solo-creator documentation, honest experiments, learning programming, sales call reflections without fabricated milestones.',
    topics: ['Solo founder journey', 'Learning new tech', 'What worked vs failed', 'Workflow audits', 'Transparent sprint notes'],
    color: '#ec4899',
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  },
];

export type ContentFormat = 'REELS' | 'CAROUSEL' | 'STORY' | 'SHORT_VIDEO' | 'POST';

export type IdeaStatus =
  | 'Inbox'
  | 'Research Needed'
  | 'Ready to Script'
  | 'Script in Progress'
  | 'Ready to Shoot'
  | 'Shot'
  | 'Editing'
  | 'Ready to Publish'
  | 'Published'
  | 'Archived';

export type CalendarStage =
  | 'Idea'
  | 'Research'
  | 'Script'
  | 'Shooting'
  | 'Editing'
  | 'Caption & Final Prep'
  | 'Planned Publishing'
  | 'Published';

export interface ContentIdea {
  id: string;
  title: string;
  pillar: ContentPillar;
  topic: string;
  targetAudience: string;
  format: ContentFormat;
  hook: string;
  mainAngle: string;
  supportingResearch?: string;
  sourceUrls?: string[];
  evidenceNotes?: string;
  estimatedProductionTime: number; // in minutes
  priority: 'Low' | 'Medium' | 'High';
  status: IdeaStatus;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  relatedScriptIds?: string[];
  relatedResearchIds?: string[];
  tags?: string[];
  isFavorite?: boolean;
}

export interface ScriptShot {
  shotNumber: number;
  visual: string;
  audioSpoken: string;
  onScreenText?: string;
  bRollPrompt?: string;
  durationSeconds: number;
}

export interface ScriptItem {
  id: string;
  ideaId?: string;
  title: string;
  pillar: ContentPillar;
  hookOptions: string[];
  selectedHookIndex: number;
  spokenScriptShort: string;
  spokenScriptLong: string;
  currentSpokenScript: string;
  shotList: ScriptShot[];
  bRollSuggestions: string[];
  onScreenTextList: string[];
  caption: string;
  callToAction: string;
  coverTitle: string;
  structureType:
    | 'Problem, Explanation, Solution'
    | 'Storytelling'
    | 'Mistake and Lesson'
    | 'Before and After'
    | 'Tutorial'
    | 'Personal Experience'
    | 'Contrarian Opinion'
    | 'Case Study'
    | 'Build-In-Public';
  tone: string;
  estimatedDurationSeconds: number;
  shootingPlan?: string;
  editingNotes?: string;
  researchReferences?: string[];
  claimsRequiringVerification?: string[];
  status: 'draft' | 'in_review' | 'ready_for_filming' | 'shot' | 'edited' | 'published';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptReviewFeedback {
  hookClarity: { score: number; critique: string; suggestions: string[] };
  specificity: { score: number; critique: string };
  audienceRelevance: { score: number; critique: string };
  retentionPotential: { score: number; critique: string };
  clarity: { score: number; critique: string };
  pacing: { score: number; critique: string };
  credibility: { score: number; critique: string };
  usefulness: { score: number; critique: string };
  naturalness: { score: number; critique: string };
  repetitionDetected: string[];
  unsupportedClaims: string[];
  ctaQuality: { score: number; critique: string };
  overallSuggestions: string[];
  reviewedAt: string;
}

export interface StyleProfile {
  id: string;
  speakingRhythm: string;
  sentenceLengthPreference: 'punchy' | 'moderate' | 'nuanced' | 'conversational';
  humorLevel: number; // 1 to 10
  informalityLevel: number; // 1 to 10
  directnessScore: number; // 1 to 10
  vocabularyTraits: string[];
  signatureExpressions: string[];
  preferredOpenings: string[];
  preferredCTAs: string[];
  avoidWords: string[];
  editingPreferences: string;
  topicsEnjoyed: string[];
  sampleTranscripts: string[];
  lastUpdated: string;
}

export interface CarouselSlide {
  slideNumber: number;
  headline: string;
  body: string;
  visualDirection: string;
  supportingExample?: string;
}

export interface CarouselProject {
  id: string;
  title: string;
  pillar: ContentPillar;
  intendedAudience: string;
  coverSlide: {
    headline: string;
    subtitle: string;
    visualNotes: string;
  };
  slides: CarouselSlide[];
  finalTakeaway: string;
  callToAction: string;
  caption: string;
  researchReferences: string[];
  status: 'draft' | 'ready' | 'scheduled' | 'published';
  updatedAt: string;
}

export interface StoryFrame {
  frameNumber: number;
  type: 'poll' | 'question_box' | 'text' | 'talking_head' | 'link' | 'bts';
  content: string;
  stickerText?: string;
}

export interface StorySequence {
  id: string;
  title: string;
  objective: 'progress' | 'question' | 'lesson' | 'bts' | 'research' | 'feedback' | 'funnel';
  frames: StoryFrame[];
  ctaLink?: string;
  updatedAt: string;
}

export interface ManualGrowthSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  totalFollowers: number;
  reach: number;
  totalViews: number;
  engagementRate: number; // percentage e.g. 5.4
  notes?: string;
  reportingPeriod?: string;
  createdAt: string;
}

export interface ResearchRecord {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  pillar: ContentPillar;
  publishedDate?: string;
  retrievalDate: string;
  summary: string;
  relevantClaims: string[];
  confidenceStatus: 'Verified Fact' | 'Official Documentation' | 'Opinion / Experiment' | 'Needs Testing';
  isGithubRepo?: boolean;
  githubData?: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    license: string;
    language: string;
    lastUpdated: string;
    isMaintained: boolean;
    documentationQuality: 'Excellent' | 'Good' | 'Sparse';
    setupDifficulty: 'Easy' | 'Moderate' | 'Complex';
    requiresPaidApis: boolean;
    selfHostingRequired: boolean;
    practicalEvaluation: string;
    demonstrationAngle: string;
  };
  relatedIdeaIds?: string[];
  relatedScriptIds?: string[];
  tags?: string[];
}

export interface CompetitorPublicAnalysis {
  id: string;
  postUrl: string;
  topic: string;
  hook: string;
  mainAngle: string;
  structure: string;
  storytellingApproach: string;
  format: string;
  callToAction: string;
  presentationStyle: string;
  audienceProblem: string;
  usefulTechniques: string[];
  contentGaps: string[];
  originalAdaptationIdea: string;
  publicMetrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  retrievalDate: string;
}

export interface CompetitorWatchlistRecord {
  id: string;
  creatorName: string;
  profileUrl: string;
  pillars: string[];
  topicsOfInterest: string[];
  notes: string;
  savedPostUrls: string[];
  manualObservations: string[];
  lastResearchedDate: string;
  analyses: CompetitorPublicAnalysis[];
}

export interface CalendarEntry {
  id: string;
  title: string;
  plannedDate: string; // YYYY-MM-DD
  plannedTime?: string;
  format: ContentFormat;
  pillar: ContentPillar;
  stage: CalendarStage;
  status: IdeaStatus;
  scriptId?: string;
  ideaId?: string;
  notes?: string;
  googleCalendarEventId?: string;
  isSyncedToGoogle?: boolean;
  lastSyncedGoogleAt?: string;
}

export type ReportCategory =
  | 'Weekly Review'
  | 'Content Performance'
  | 'Sales Lessons'
  | 'Website Projects'
  | 'SEO Experiments'
  | 'AI Automation'
  | 'Learning Notes'
  | 'Personal Reflections';

export interface CreatorReportNote {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: ReportCategory;
  observations: string;
  lessonsLearned: string;
  metrics?: string;
  relatedContent?: string;
  relatedProjects?: string;
  nextActions: string;
  tags: string[];
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIRecommendation {
  id: string;
  topic: string;
  pillar: ContentPillar;
  intendedAudience: string;
  mainProblem: string;
  whyWorthCreating: string;
  evidenceAndResearch: string;
  sourceLinks: string[];
  recommendedFormat: ContentFormat;
  primaryHook: string;
  alternativeHooks: string[];
  suggestedAngle: string;
  mainTakeaway: string;
  recommendedCTA: string;
  productionDifficulty: 'Easy' | 'Moderate' | 'Challenging';
  estimatedProductionTime: number; // minutes
  requiredBRoll: string[];
  suggestedShootingPlan: string;
  recommendedSlot: string;
  nextAction: string;
  status: 'suggested' | 'approved' | 'rejected' | 'saved';
}

export interface AIProviderConfig {
  provider: 'ollama' | 'groq' | 'openrouter';
  // Ollama
  endpoint: string;
  textModel: string;
  availableModels: string[];
  // Groq
  groqApiKey?: string;
  groqModel?: string;
  // OpenRouter
  openRouterApiKey?: string;
  openRouterModel?: string;
  // Safety controls
  localOnlyMode: boolean;
  isCloudEnabled: boolean;
  temperature: number;
  isConnected: boolean;
  statusMessage?: string;
}

export interface GoogleCalendarConfig {
  isConnected: boolean;
  userEmail?: string;
  selectedCalendarId?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncedAt?: string;
  syncedEventCount: number;
  errorMessage?: string;
}

export interface UserPreferences {
  appName: string;
  timeZone: string;
  dateFormat: string;
  defaultFormat: ContentFormat;
  defaultDurationSeconds: number;
  availableFilmingHoursPerWeek: number;
  availableEditingHoursPerWeek: number;
  postingFrequencyPerWeek: number;
  targetAudience: string;
  contentGoals: string[];
  preferredTone: string;
  preferredCTAs: string[];
  avoidWords: string[];
  theme: 'light' | 'dark' | 'system';
  erCalculationMethod: 'manual' | 'views' | 'reach' | 'followers';
  onboardingCompleted: boolean;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  activePillars?: ContentPillar[];
  preferredVideoFormats?: string[];
  githubToken?: string;
  searchProvider?: 'duckduckgo' | 'serper' | 'custom';
  sourcePreferences?: string[];
}

export interface ChatMessageAction {
  type: 'create_idea' | 'generate_script' | 'add_calendar' | 'save_note';
  label: string;
  data: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: ChatMessageAction[];
}
