export type ContentFormat = 'REELS' | 'CAROUSEL' | 'IMAGE' | 'STORY';

export type IdeaStatus = 'idea' | 'planned' | 'script_ready' | 'filming' | 'editing' | 'ready' | 'scheduled' | 'published';

export type ContentObjective = 
  | 'Reach' 
  | 'Engagement' 
  | 'Audience Growth' 
  | 'Authority' 
  | 'Community Building' 
  | 'Leads' 
  | 'Portfolio' 
  | 'Personal Storytelling';

export interface UserPreferences {
  niche: string;
  targetAudience: string;
  primaryPlatforms: string[];
  mainGoals: string[];
  preferredFormats: ContentFormat[];
  postingFrequencyPerWeek: number;
  language: string;
  speakingStyle: string;
  editingLimitations: string;
  availableFilmingHoursPerWeek: number;
  onboardingCompleted: boolean;
}

export interface ConnectedAccount {
  id: string;
  username: string;
  name: string;
  profilePictureUrl?: string;
  accountType: 'BUSINESS' | 'CREATOR' | 'PERSONAL_DEMO';
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  biography?: string;
  isConnected: boolean;
  isDemoMode: boolean;
  tokenExpiresAt?: string;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface MediaMetrics {
  views: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number; // percentage e.g. 5.4
  watchTimeSeconds?: number;
  averageWatchPercent?: number;
}

export interface MediaPost {
  id: string;
  accountId: string;
  instagramId: string;
  caption: string;
  mediaType: ContentFormat;
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
  timestamp: string; // ISO
  durationSeconds?: number;
  metrics: MediaMetrics;
  topic?: string;
  hookType?: string;
  callToAction?: string;
  aiDiagnostic?: {
    summary: string;
    whatWorked: string[];
    whatLimited: string[];
    hookStrengthScore: number; // 1-100
    recommendation: string;
  };
}

export interface DailyInsight {
  date: string;
  reach: number;
  views: number;
  impressions: number;
  engagementRate: number;
  followerGrowth: number;
  profileViews: number;
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  topic: string;
  format: ContentFormat;
  targetAudience: string;
  hook: string;
  objective: ContentObjective;
  estimatedFilmingMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  source: 'AI Recommendation' | 'User Created' | 'Historical Pattern' | 'Competitor Analysis' | 'Research Note';
  status: IdeaStatus;
  createdAt: string;
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
  status: 'draft' | 'in_review' | 'ready_for_filming' | 'filmed';
  version: number;
  updatedAt: string;
}

export interface StyleProfile {
  id: string;
  speakingRhythm: string;
  sentenceLengthPreference: 'punchy' | 'moderate' | 'nuanced' | 'conversational';
  humorLevel: number; // 1 to 10
  directnessScore: number; // 1 to 10
  vocabularyTraits: string[];
  signatureExpressions: string[];
  preferredHookStyles: string[];
  preferredCTAs: string[];
  storytellingAngle: string;
  avoidWords: string[];
  sampleTranscripts: string[];
  lastUpdated: string;
}

export interface VideoAnalysis {
  id: string;
  filename: string;
  fileSizeBytes: number;
  durationSeconds: number;
  resolution: string;
  fps: number;
  aspectRatio: string;
  transcript: string;
  hookScore: number; // 0-100
  hookCritique: string;
  suggestedHooks: string[];
  narrativeSections: {
    title: string;
    startSec: number;
    endSec: number;
    summary: string;
    flowScore: number;
  }[];
  clarityScore: number; // 0-100
  repetitionDetected: string[];
  coreTakeaway: string;
  ctaPlacementFeedback: string;
  visualVarietyScore: number;
  pacingFeedback: string;
  revisedScript: string;
  bRollRecommendations: string[];
  prePublishChecklist: { item: string; passed: boolean }[];
  analyzedAt: string;
}

export interface CompetitorReference {
  id: string;
  competitorHandle: string;
  postUrl: string;
  mediaType: ContentFormat;
  visibleEngagement: {
    views?: number;
    likes: number;
    comments: number;
  };
  hook: string;
  topic: string;
  captionExcerpt: string;
  structuralBreakdown: string;
  whyItWorked: string;
  contentOpportunity: string;
  savedAt: string;
}

export interface CalendarEntry {
  id: string;
  title: string;
  plannedDate: string; // YYYY-MM-DD
  format: ContentFormat;
  status: IdeaStatus;
  scriptId?: string;
  ideaId?: string;
  captionPreview?: string;
  objective: ContentObjective;
  notes?: string;
}

export interface ExperimentItem {
  id: string;
  title: string;
  hypothesis: string;
  variableTested: 'Hook Style' | 'Format' | 'Posting Time' | 'Video Length' | 'CTA' | 'Topic';
  variantA: {
    description: string;
    mediaId?: string;
    resultMetric?: number;
  };
  variantB: {
    description: string;
    mediaId?: string;
    resultMetric?: number;
  };
  metricObserved: 'Engagement Rate' | 'Shares' | 'Saves' | 'Retention' | 'Follower Gain';
  status: 'Draft' | 'Active' | 'Completed' | 'Inconclusive';
  findings?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  topic: string;
  format: ContentFormat;
  targetAudience: string;
  objective: ContentObjective;
  suggestedHook: string;
  mainArgument: string;
  recommendedDurationSeconds: number;
  suggestedCTA: string;
  supportingEvidence: string;
  confidenceScore: number; // 0 - 100%
  productionEffort: 'Low' | 'Medium' | 'High';
  status: 'suggested' | 'saved' | 'scheduled' | 'dismissed' | 'filmed';
}

export interface AIProviderConfig {
  provider: 'ollama' | 'openai' | 'custom';
  endpoint: string;
  textModel: string;
  visionModel: string;
  transcriptionModel: string;
  apiKey?: string;
  temperature: number;
  isConnected: boolean;
  availableModels: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    type: 'create_idea' | 'generate_script' | 'add_calendar' | 'create_experiment';
    label: string;
    data: any;
  }[];
}
