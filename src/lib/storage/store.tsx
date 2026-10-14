'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  AIProviderConfig,
  ContentFormat,
  ContentObjective,
} from '@/types';
import {
  DEMO_ACCOUNT,
  DEMO_POSTS,
  DEMO_DAILY_INSIGHTS,
  DEMO_IDEAS,
  DEMO_SCRIPTS,
  DEMO_STYLE_PROFILE,
  DEMO_VIDEO_ANALYSIS,
  DEMO_COMPETITOR_REFERENCES,
  DEMO_CALENDAR,
  DEMO_EXPERIMENTS,
  DEMO_RECOMMENDATIONS,
  INITIAL_PREFERENCES,
} from './demo-data';

interface AppContextType {
  // State
  preferences: UserPreferences;
  account: ConnectedAccount;
  posts: MediaPost[];
  dailyInsights: DailyInsight[];
  ideas: ContentIdea[];
  scripts: ScriptItem[];
  styleProfile: StyleProfile;
  videoAnalyses: VideoAnalysis[];
  competitors: CompetitorReference[];
  calendar: CalendarEntry[];
  experiments: ExperimentItem[];
  recommendations: AIRecommendation[];
  aiConfig: AIProviderConfig;
  isDemoMode: boolean;
  isLoading: boolean;

  // Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  toggleDemoMode: (enabled: boolean) => void;
  connectInstagram: (username: string, accountType?: 'CREATOR' | 'BUSINESS') => void;
  disconnectInstagram: () => void;
  syncInstagramData: () => Promise<void>;
  
  // Ideas
  addIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => ContentIdea;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => void;
  deleteIdea: (id: string) => void;
  
  // Scripts
  addScript: (script: Omit<ScriptItem, 'id' | 'version' | 'updatedAt'>) => ScriptItem;
  updateScript: (id: string, updates: Partial<ScriptItem>) => void;
  deleteScript: (id: string) => void;
  createScriptFromIdea: (idea: ContentIdea) => ScriptItem;

  // Style Profile
  updateStyleProfile: (updates: Partial<StyleProfile>) => void;

  // Video Analysis
  addVideoAnalysis: (analysis: Omit<VideoAnalysis, 'id' | 'analyzedAt'>) => VideoAnalysis;
  deleteVideoAnalysis: (id: string) => void;

  // Competitor References
  addCompetitorReference: (ref: Omit<CompetitorReference, 'id' | 'savedAt'>) => CompetitorReference;
  deleteCompetitorReference: (id: string) => void;

  // Calendar
  addCalendarEntry: (entry: Omit<CalendarEntry, 'id'>) => CalendarEntry;
  updateCalendarEntry: (id: string, updates: Partial<CalendarEntry>) => void;
  deleteCalendarEntry: (id: string) => void;
  autoPlanNext7Days: () => void;

  // Experiments
  addExperiment: (exp: Omit<ExperimentItem, 'id' | 'createdAt'>) => ExperimentItem;
  updateExperiment: (id: string, updates: Partial<ExperimentItem>) => void;

  // AI Recommendations
  updateRecommendationStatus: (id: string, status: AIRecommendation['status']) => void;
  convertRecommendationToIdea: (rec: AIRecommendation) => ContentIdea;

  // AI Configuration
  updateAIConfig: (config: Partial<AIProviderConfig>) => void;
  testAIConnection: () => Promise<{ success: boolean; message: string; models?: string[] }>;
  
  // Reset / Data Management
  resetToDemoData: () => void;
  clearUserData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PREFERENCES: 'ai_creator_os_preferences',
  ACCOUNT: 'ai_creator_os_account',
  POSTS: 'ai_creator_os_posts',
  INSIGHTS: 'ai_creator_os_insights',
  IDEAS: 'ai_creator_os_ideas',
  SCRIPTS: 'ai_creator_os_scripts',
  STYLE: 'ai_creator_os_style',
  VIDEO_ANALYSES: 'ai_creator_os_video_analyses',
  COMPETITORS: 'ai_creator_os_competitors',
  CALENDAR: 'ai_creator_os_calendar',
  EXPERIMENTS: 'ai_creator_os_experiments',
  RECOMMENDATIONS: 'ai_creator_os_recommendations',
  AI_CONFIG: 'ai_creator_os_ai_config',
  DEMO_MODE: 'ai_creator_os_demo_mode',
};

const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: 'ollama',
  endpoint: 'http://localhost:11434',
  textModel: 'llama3.2',
  visionModel: 'llava',
  transcriptionModel: 'whisper-1',
  temperature: 0.7,
  isConnected: false,
  availableModels: ['llama3.2', 'mistral', 'qwen2.5', 'deepseek-r1:8b'],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const [account, setAccount] = useState<ConnectedAccount>(DEMO_ACCOUNT);
  const [posts, setPosts] = useState<MediaPost[]>(DEMO_POSTS);
  const [dailyInsights, setDailyInsights] = useState<DailyInsight[]>(DEMO_DAILY_INSIGHTS);
  const [ideas, setIdeas] = useState<ContentIdea[]>(DEMO_IDEAS);
  const [scripts, setScripts] = useState<ScriptItem[]>(DEMO_SCRIPTS);
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(DEMO_STYLE_PROFILE);
  const [videoAnalyses, setVideoAnalyses] = useState<VideoAnalysis[]>([DEMO_VIDEO_ANALYSIS]);
  const [competitors, setCompetitors] = useState<CompetitorReference[]>(DEMO_COMPETITOR_REFERENCES);
  const [calendar, setCalendar] = useState<CalendarEntry[]>(DEMO_CALENDAR);
  const [experiments, setExperiments] = useState<ExperimentItem[]>(DEMO_EXPERIMENTS);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(DEMO_RECOMMENDATIONS);
  const [aiConfig, setAIConfig] = useState<AIProviderConfig>(DEFAULT_AI_CONFIG);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedDemo = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      if (storedDemo !== null) setIsDemoMode(JSON.parse(storedDemo));

      const storedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (storedPrefs) setPreferences(JSON.parse(storedPrefs));

      const storedAccount = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
      if (storedAccount) setAccount(JSON.parse(storedAccount));

      const storedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (storedPosts) setPosts(JSON.parse(storedPosts));

      const storedInsights = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
      if (storedInsights) setDailyInsights(JSON.parse(storedInsights));

      const storedIdeas = localStorage.getItem(STORAGE_KEYS.IDEAS);
      if (storedIdeas) setIdeas(JSON.parse(storedIdeas));

      const storedScripts = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
      if (storedScripts) setScripts(JSON.parse(storedScripts));

      const storedStyle = localStorage.getItem(STORAGE_KEYS.STYLE);
      if (storedStyle) setStyleProfile(JSON.parse(storedStyle));

      const storedVideos = localStorage.getItem(STORAGE_KEYS.VIDEO_ANALYSES);
      if (storedVideos) setVideoAnalyses(JSON.parse(storedVideos));

      const storedCompetitors = localStorage.getItem(STORAGE_KEYS.COMPETITORS);
      if (storedCompetitors) setCompetitors(JSON.parse(storedCompetitors));

      const storedCal = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (storedCal) setCalendar(JSON.parse(storedCal));

      const storedExp = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
      if (storedExp) setExperiments(JSON.parse(storedExp));

      const storedRec = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
      if (storedRec) setRecommendations(JSON.parse(storedRec));

      const storedAI = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      if (storedAI) setAIConfig(JSON.parse(storedAI));
    } catch (e) {
      console.warn('Error reading from storage, initialized defaults:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to LocalStorage helpers
  const saveState = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      saveState(STORAGE_KEYS.PREFERENCES, next);
      return next;
    });
  };

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    saveState(STORAGE_KEYS.DEMO_MODE, enabled);
    if (enabled) {
      setAccount(DEMO_ACCOUNT);
      setPosts(DEMO_POSTS);
      setDailyInsights(DEMO_DAILY_INSIGHTS);
      saveState(STORAGE_KEYS.ACCOUNT, DEMO_ACCOUNT);
      saveState(STORAGE_KEYS.POSTS, DEMO_POSTS);
      saveState(STORAGE_KEYS.INSIGHTS, DEMO_DAILY_INSIGHTS);
    } else {
      // Empty actual account until connected
      const emptyAccount: ConnectedAccount = {
        id: 'acc_live_empty',
        username: '',
        name: '',
        accountType: 'CREATOR',
        followersCount: 0,
        followingCount: 0,
        mediaCount: 0,
        isConnected: false,
        isDemoMode: false,
        syncStatus: 'idle',
      };
      setAccount(emptyAccount);
      setPosts([]);
      setDailyInsights([]);
      saveState(STORAGE_KEYS.ACCOUNT, emptyAccount);
      saveState(STORAGE_KEYS.POSTS, []);
      saveState(STORAGE_KEYS.INSIGHTS, []);
    }
  };

  const connectInstagram = (username: string, accountType: 'CREATOR' | 'BUSINESS' = 'CREATOR') => {
    const newAccount: ConnectedAccount = {
      id: `acc_real_${Date.now()}`,
      username: username.replace('@', ''),
      name: `${username} (Official)`,
      accountType,
      followersCount: 1420,
      followingCount: 380,
      mediaCount: 12,
      isConnected: true,
      isDemoMode: false,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'success',
    };
    setAccount(newAccount);
    setIsDemoMode(false);
    saveState(STORAGE_KEYS.ACCOUNT, newAccount);
    saveState(STORAGE_KEYS.DEMO_MODE, false);
  };

  const disconnectInstagram = () => {
    const disconnected: ConnectedAccount = {
      ...account,
      isConnected: false,
      tokenExpiresAt: undefined,
      lastSyncedAt: undefined,
      syncStatus: 'idle',
    };
    setAccount(disconnected);
    saveState(STORAGE_KEYS.ACCOUNT, disconnected);
  };

  const syncInstagramData = async () => {
    setAccount((prev) => ({ ...prev, syncStatus: 'syncing' }));
    await new Promise((res) => setTimeout(res, 1200));
    setAccount((prev) => {
      const synced = {
        ...prev,
        syncStatus: 'success' as const,
        lastSyncedAt: new Date().toISOString(),
      };
      saveState(STORAGE_KEYS.ACCOUNT, synced);
      return synced;
    });
  };

  // Ideas
  const addIdea = (ideaData: Omit<ContentIdea, 'id' | 'createdAt'>): ContentIdea => {
    const newIdea: ContentIdea = {
      ...ideaData,
      id: `idea_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setIdeas((prev) => {
      const next = [newIdea, ...prev];
      saveState(STORAGE_KEYS.IDEAS, next);
      return next;
    });
    return newIdea;
  };

  const updateIdea = (id: string, updates: Partial<ContentIdea>) => {
    setIdeas((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      saveState(STORAGE_KEYS.IDEAS, next);
      return next;
    });
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveState(STORAGE_KEYS.IDEAS, next);
      return next;
    });
  };

  // Scripts
  const addScript = (scriptData: Omit<ScriptItem, 'id' | 'version' | 'updatedAt'>): ScriptItem => {
    const newScript: ScriptItem = {
      ...scriptData,
      id: `script_${Date.now()}`,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    setScripts((prev) => {
      const next = [newScript, ...prev];
      saveState(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });
    return newScript;
  };

  const updateScript = (id: string, updates: Partial<ScriptItem>) => {
    setScripts((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      );
      saveState(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });
  };

  const deleteScript = (id: string) => {
    setScripts((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveState(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });
  };

  const createScriptFromIdea = (idea: ContentIdea): ScriptItem => {
    const hook1 = idea.hook || `Here is why most people fail at ${idea.topic}.`;
    const hook2 = `Stop doing ${idea.topic} the hard way. Do this instead.`;
    const hook3 = `The non-obvious framework top builders use for ${idea.topic}.`;

    const newScript: ScriptItem = {
      id: `script_${Date.now()}`,
      ideaId: idea.id,
      title: idea.title,
      hookOptions: [hook1, hook2, hook3],
      selectedHookIndex: 0,
      spokenScriptShort: `${hook1}\n\nHere is the exact breakdown: First, identify your bottleneck. Second, standardize the input. Third, automate the execution.\n\nSave this for later and drop a comment below!`,
      spokenScriptLong: `${hook1}\n\nMost people believe that ${idea.topic} requires endless trial and error. That is simply not true.\n\nHere is the 3-step reality:\n1. Isolate the core friction point before building anything.\n2. Create a standardized template that eliminates guesswork.\n3. Deploy the solution and measure retention.\n\nDrop a comment with "${idea.topic.toUpperCase().slice(0, 5)}" and I will send you the complete blueprint.`,
      currentSpokenScript: `${hook1}\n\nHere is the 3-step system:\n1. Isolate the core friction point.\n2. Create a standardized template.\n3. Deploy the solution and measure the results.\n\nComment below to get the free template!`,
      shotList: [
        {
          shotNumber: 1,
          visual: 'Close up talking head directly to camera',
          audioSpoken: hook1,
          onScreenText: idea.title.toUpperCase(),
          durationSeconds: 4,
        },
        {
          shotNumber: 2,
          visual: 'B-roll screen recording illustrating the problem',
          audioSpoken: 'Most people struggle because their workflow is disorganized.',
          onScreenText: 'THE REAL BOTTLENECK ⚠️',
          durationSeconds: 8,
        },
        {
          shotNumber: 3,
          visual: 'Split screen showing solution and checklist',
          audioSpoken: 'Here is the 3-step breakdown to fix it once and for all.',
          onScreenText: 'STEP-BY-STEP FIX 🛠️',
          durationSeconds: 15,
        },
        {
          shotNumber: 4,
          visual: 'Talking head pointing to caption callout',
          audioSpoken: 'Comment below to get the full free template!',
          onScreenText: 'COMMENT FOR TEMPLATE 📥',
          durationSeconds: 5,
        },
      ],
      bRollSuggestions: [
        'Close up of keyboard typing',
        'Screen capture demonstrating the solution',
        'Clean animated workflow diagram',
      ],
      onScreenTextList: [
        idea.title.toUpperCase(),
        'THE REAL BOTTLENECK ⚠️',
        'STEP-BY-STEP FIX 🛠️',
        'COMMENT FOR TEMPLATE 📥',
      ],
      caption: `${idea.description}\n\nHere is the 3-step framework:\n1. Isolate the bottleneck\n2. Standardize inputs\n3. Deploy & measure\n\nSave this Reel and follow for daily actionable creator systems! 🚀\n\n#${idea.topic.toLowerCase().replace(/\\s+/g, '')} #creatoros #solopreneur #workflow`,
      callToAction: 'Save this post and comment below for the free resource',
      coverTitle: idea.title.toUpperCase(),
      structureType: 'Problem, Explanation, Solution',
      tone: 'Direct, insightful, conversational',
      estimatedDurationSeconds: 32,
      status: 'draft',
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    setScripts((prev) => {
      const next = [newScript, ...prev];
      saveState(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });

    // Update idea status
    updateIdea(idea.id, { status: 'script_ready' });
    return newScript;
  };

  // Style Profile
  const updateStyleProfile = (updates: Partial<StyleProfile>) => {
    setStyleProfile((prev) => {
      const next = { ...prev, ...updates, lastUpdated: new Date().toISOString() };
      saveState(STORAGE_KEYS.STYLE, next);
      return next;
    });
  };

  // Video Analysis
  const addVideoAnalysis = (analysisData: Omit<VideoAnalysis, 'id' | 'analyzedAt'>): VideoAnalysis => {
    const newAnalysis: VideoAnalysis = {
      ...analysisData,
      id: `va_${Date.now()}`,
      analyzedAt: new Date().toISOString(),
    };
    setVideoAnalyses((prev) => {
      const next = [newAnalysis, ...prev];
      saveState(STORAGE_KEYS.VIDEO_ANALYSES, next);
      return next;
    });
    return newAnalysis;
  };

  const deleteVideoAnalysis = (id: string) => {
    setVideoAnalyses((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveState(STORAGE_KEYS.VIDEO_ANALYSES, next);
      return next;
    });
  };

  // Competitor References
  const addCompetitorReference = (refData: Omit<CompetitorReference, 'id' | 'savedAt'>): CompetitorReference => {
    const newRef: CompetitorReference = {
      ...refData,
      id: `comp_${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    setCompetitors((prev) => {
      const next = [newRef, ...prev];
      saveState(STORAGE_KEYS.COMPETITORS, next);
      return next;
    });
    return newRef;
  };

  const deleteCompetitorReference = (id: string) => {
    setCompetitors((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveState(STORAGE_KEYS.COMPETITORS, next);
      return next;
    });
  };

  // Calendar
  const addCalendarEntry = (entryData: Omit<CalendarEntry, 'id'>): CalendarEntry => {
    const newEntry: CalendarEntry = {
      ...entryData,
      id: `cal_${Date.now()}`,
    };
    setCalendar((prev) => {
      const next = [...prev, newEntry].sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
      saveState(STORAGE_KEYS.CALENDAR, next);
      return next;
    });
    return newEntry;
  };

  const updateCalendarEntry = (id: string, updates: Partial<CalendarEntry>) => {
    setCalendar((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      saveState(STORAGE_KEYS.CALENDAR, next);
      return next;
    });
  };

  const deleteCalendarEntry = (id: string) => {
    setCalendar((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveState(STORAGE_KEYS.CALENDAR, next);
      return next;
    });
  };

  const autoPlanNext7Days = () => {
    const today = new Date();
    const plannedDates: string[] = [];
    // Plan 3-4 posts across next 7 days (e.g. Day 1, Day 3, Day 5, Day 7)
    [1, 3, 5, 7].forEach((offset) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      plannedDates.push(d.toISOString().split('T')[0]);
    });

    const newEntries: CalendarEntry[] = [
      {
        id: `cal_auto_${Date.now()}_1`,
        title: 'The "Ghost Mode" Prompt: Voice Mimicry Masterclass',
        plannedDate: plannedDates[0],
        format: 'REELS',
        status: 'script_ready',
        objective: 'Authority',
        notes: 'AI proposed schedule based on high save velocity on prompt engineering topics.',
      },
      {
        id: `cal_auto_${Date.now()}_2`,
        title: '2026 Developer Salary Paradox (Carousel Breakdown)',
        plannedDate: plannedDates[1],
        format: 'CAROUSEL',
        status: 'planned',
        objective: 'Engagement',
        notes: 'AI proposed for Thursday carousel evening posting window.',
      },
      {
        id: `cal_auto_${Date.now()}_3`,
        title: 'Why Cloud DB Latency Kills AI Agents (SQLite vs Remote)',
        plannedDate: plannedDates[2],
        format: 'REELS',
        status: 'idea',
        objective: 'Reach',
        notes: 'AI proposed for weekend builder audience.',
      },
      {
        id: `cal_auto_${Date.now()}_4`,
        title: 'My Solo Founder Agentic Stack (4 Local Agents)',
        plannedDate: plannedDates[3],
        format: 'CAROUSEL',
        status: 'planned',
        objective: 'Audience Growth',
        notes: 'Proven high-converting format for Sunday recap.',
      },
    ];

    setCalendar((prev) => {
      // Filter out overlapping dates or append
      const existingDates = new Set(prev.map((p) => p.plannedDate));
      const filteredNew = newEntries.filter((e) => !existingDates.has(e.plannedDate));
      const combined = [...prev, ...filteredNew].sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
      saveState(STORAGE_KEYS.CALENDAR, combined);
      return combined;
    });
  };

  // Experiments
  const addExperiment = (expData: Omit<ExperimentItem, 'id' | 'createdAt'>): ExperimentItem => {
    const newExp: ExperimentItem = {
      ...expData,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExperiments((prev) => {
      const next = [newExp, ...prev];
      saveState(STORAGE_KEYS.EXPERIMENTS, next);
      return next;
    });
    return newExp;
  };

  const updateExperiment = (id: string, updates: Partial<ExperimentItem>) => {
    setExperiments((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      saveState(STORAGE_KEYS.EXPERIMENTS, next);
      return next;
    });
  };

  // Recommendations
  const updateRecommendationStatus = (id: string, status: AIRecommendation['status']) => {
    setRecommendations((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, status } : item));
      saveState(STORAGE_KEYS.RECOMMENDATIONS, next);
      return next;
    });
  };

  const convertRecommendationToIdea = (rec: AIRecommendation): ContentIdea => {
    const newIdea = addIdea({
      title: rec.title,
      description: rec.mainArgument,
      topic: rec.topic,
      format: rec.format,
      targetAudience: rec.targetAudience,
      hook: rec.suggestedHook,
      objective: rec.objective,
      estimatedFilmingMinutes: rec.recommendedDurationSeconds > 0 ? 30 : 20,
      difficulty: rec.productionEffort === 'Low' ? 'Easy' : rec.productionEffort === 'Medium' ? 'Medium' : 'Advanced',
      source: 'AI Recommendation',
      status: 'idea',
      isFavorite: true,
    });
    updateRecommendationStatus(rec.id, 'saved');
    return newIdea;
  };

  // AI Configuration
  const updateAIConfig = (updates: Partial<AIProviderConfig>) => {
    setAIConfig((prev) => {
      const next = { ...prev, ...updates };
      saveState(STORAGE_KEYS.AI_CONFIG, next);
      return next;
    });
  };

  const testAIConnection = async (): Promise<{ success: boolean; message: string; models?: string[] }> => {
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig),
      });
      const data = await res.json();
      if (data.success) {
        updateAIConfig({ isConnected: true, availableModels: data.models || aiConfig.availableModels });
        return { success: true, message: data.message, models: data.models };
      } else {
        updateAIConfig({ isConnected: false });
        return { success: false, message: data.message || 'Connection failed.' };
      }
    } catch (e: any) {
      updateAIConfig({ isConnected: false });
      return { success: false, message: `Could not reach ${aiConfig.provider} at ${aiConfig.endpoint}: ${e.message}` };
    }
  };

  const resetToDemoData = () => {
    setPreferences(INITIAL_PREFERENCES);
    setAccount(DEMO_ACCOUNT);
    setPosts(DEMO_POSTS);
    setDailyInsights(DEMO_DAILY_INSIGHTS);
    setIdeas(DEMO_IDEAS);
    setScripts(DEMO_SCRIPTS);
    setStyleProfile(DEMO_STYLE_PROFILE);
    setVideoAnalyses([DEMO_VIDEO_ANALYSIS]);
    setCompetitors(DEMO_COMPETITOR_REFERENCES);
    setCalendar(DEMO_CALENDAR);
    setExperiments(DEMO_EXPERIMENTS);
    setRecommendations(DEMO_RECOMMENDATIONS);
    setIsDemoMode(true);

    saveState(STORAGE_KEYS.PREFERENCES, INITIAL_PREFERENCES);
    saveState(STORAGE_KEYS.ACCOUNT, DEMO_ACCOUNT);
    saveState(STORAGE_KEYS.POSTS, DEMO_POSTS);
    saveState(STORAGE_KEYS.INSIGHTS, DEMO_DAILY_INSIGHTS);
    saveState(STORAGE_KEYS.IDEAS, DEMO_IDEAS);
    saveState(STORAGE_KEYS.SCRIPTS, DEMO_SCRIPTS);
    saveState(STORAGE_KEYS.STYLE, DEMO_STYLE_PROFILE);
    saveState(STORAGE_KEYS.VIDEO_ANALYSES, [DEMO_VIDEO_ANALYSIS]);
    saveState(STORAGE_KEYS.COMPETITORS, DEMO_COMPETITOR_REFERENCES);
    saveState(STORAGE_KEYS.CALENDAR, DEMO_CALENDAR);
    saveState(STORAGE_KEYS.EXPERIMENTS, DEMO_EXPERIMENTS);
    saveState(STORAGE_KEYS.RECOMMENDATIONS, DEMO_RECOMMENDATIONS);
    saveState(STORAGE_KEYS.DEMO_MODE, true);
  };

  const clearUserData = () => {
    const emptyAccount: ConnectedAccount = {
      id: 'acc_cleared',
      username: '',
      name: '',
      accountType: 'CREATOR',
      followersCount: 0,
      followingCount: 0,
      mediaCount: 0,
      isConnected: false,
      isDemoMode: false,
      syncStatus: 'idle',
    };
    setAccount(emptyAccount);
    setPosts([]);
    setDailyInsights([]);
    setIdeas([]);
    setScripts([]);
    setVideoAnalyses([]);
    setCompetitors([]);
    setCalendar([]);
    setExperiments([]);
    setRecommendations([]);
    setIsDemoMode(false);

    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  return (
    <AppContext.Provider
      value={{
        preferences,
        account,
        posts,
        dailyInsights,
        ideas,
        scripts,
        styleProfile,
        videoAnalyses,
        competitors,
        calendar,
        experiments,
        recommendations,
        aiConfig,
        isDemoMode,
        isLoading,
        updatePreferences,
        toggleDemoMode,
        connectInstagram,
        disconnectInstagram,
        syncInstagramData,
        addIdea,
        updateIdea,
        deleteIdea,
        addScript,
        updateScript,
        deleteScript,
        createScriptFromIdea,
        updateStyleProfile,
        addVideoAnalysis,
        deleteVideoAnalysis,
        addCompetitorReference,
        deleteCompetitorReference,
        addCalendarEntry,
        updateCalendarEntry,
        deleteCalendarEntry,
        autoPlanNext7Days,
        addExperiment,
        updateExperiment,
        updateRecommendationStatus,
        convertRecommendationToIdea,
        updateAIConfig,
        testAIConnection,
        resetToDemoData,
        clearUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
