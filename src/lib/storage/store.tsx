'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import {
  UserPreferences,
  ManualGrowthSnapshot,
  ContentIdea,
  ScriptItem,
  StyleProfile,
  ResearchRecord,
  CompetitorWatchlistRecord,
  CalendarEntry,
  CreatorReportNote,
  AIRecommendation,
  CarouselProject,
  StorySequence,
  AIProviderConfig,
  GoogleCalendarConfig,
  CompetitorPublicAnalysis,
} from '@/types';
import {
  INITIAL_PREFERENCES,
  INITIAL_GROWTH_SNAPSHOTS,
  INITIAL_IDEAS,
  INITIAL_SCRIPTS,
  INITIAL_STYLE_PROFILE,
  INITIAL_RESEARCH,
  INITIAL_COMPETITORS,
  INITIAL_CALENDAR,
  INITIAL_REPORTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_CAROUSELS,
  INITIAL_STORIES,
  INITIAL_AI_CONFIG,
  INITIAL_GOOGLE_CALENDAR_CONFIG,
} from './demo-data';

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingIdea?: ContentIdea;
  similarityReason?: string;
}

interface AppContextType {
  // State
  preferences: UserPreferences;
  snapshots: ManualGrowthSnapshot[];
  ideas: ContentIdea[];
  scripts: ScriptItem[];
  styleProfile: StyleProfile;
  research: ResearchRecord[];
  competitors: CompetitorWatchlistRecord[];
  calendar: CalendarEntry[];
  reports: CreatorReportNote[];
  recommendations: AIRecommendation[];
  carousels: CarouselProject[];
  stories: StorySequence[];
  aiConfig: AIProviderConfig;
  googleCalendar: GoogleCalendarConfig;
  theme: 'light' | 'dark' | 'system';
  isPending: boolean;

  // Preferences & Theme
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Growth Snapshots (Manual Data Only)
  addGrowthSnapshot: (snap: Omit<ManualGrowthSnapshot, 'id' | 'createdAt'>) => ManualGrowthSnapshot;
  updateGrowthSnapshot: (id: string, updates: Partial<ManualGrowthSnapshot>) => void;
  deleteGrowthSnapshot: (id: string) => void;

  // Content Ideas
  checkDuplicateIdea: (title: string, currentId?: string) => DuplicateCheckResult;
  addIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>) => ContentIdea;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => void;
  deleteIdea: (id: string) => void;
  archiveIdea: (id: string) => void;
  duplicateIdea: (id: string) => ContentIdea | undefined;
  createScriptFromIdea: (idea: ContentIdea) => ScriptItem;

  // Scripts
  addScript: (script: Omit<ScriptItem, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => ScriptItem;
  updateScript: (id: string, updates: Partial<ScriptItem>) => void;
  deleteScript: (id: string) => void;

  // Style Profile
  updateStyleProfile: (updates: Partial<StyleProfile>) => void;

  // Research
  addResearchRecord: (rec: Omit<ResearchRecord, 'id' | 'retrievalDate'>) => ResearchRecord;
  updateResearchRecord: (id: string, updates: Partial<ResearchRecord>) => void;
  deleteResearchRecord: (id: string) => void;

  // Competitor Watchlist & Public Analysis
  addCompetitorWatchlist: (comp: Omit<CompetitorWatchlistRecord, 'id' | 'lastResearchedDate'>) => CompetitorWatchlistRecord;
  updateCompetitorWatchlist: (id: string, updates: Partial<CompetitorWatchlistRecord>) => void;
  deleteCompetitorWatchlist: (id: string) => void;
  addCompetitorAnalysis: (competitorId: string, analysis: Omit<CompetitorPublicAnalysis, 'id' | 'retrievalDate'>) => void;

  // Calendar
  addCalendarEntry: (entry: Omit<CalendarEntry, 'id'>) => CalendarEntry;
  updateCalendarEntry: (id: string, updates: Partial<CalendarEntry>) => void;
  deleteCalendarEntry: (id: string) => void;
  autoPlanRealisticSchedule: () => void;
  syncCalendarToGoogle: (entryId: string) => Promise<{ success: boolean; message: string }>;

  // Reports & Notes
  addReportNote: (note: Omit<CreatorReportNote, 'id' | 'createdAt' | 'updatedAt'>) => CreatorReportNote;
  updateReportNote: (id: string, updates: Partial<CreatorReportNote>) => void;
  deleteReportNote: (id: string) => void;

  // Carousels & Stories
  addCarouselProject: (proj: Omit<CarouselProject, 'id' | 'updatedAt'>) => CarouselProject;
  updateCarouselProject: (id: string, updates: Partial<CarouselProject>) => void;
  deleteCarouselProject: (id: string) => void;
  addStorySequence: (story: Omit<StorySequence, 'id' | 'updatedAt'>) => StorySequence;
  updateStorySequence: (id: string, updates: Partial<StorySequence>) => void;
  deleteStorySequence: (id: string) => void;

  // AI Recommendations
  updateRecommendationStatus: (id: string, status: AIRecommendation['status']) => void;
  convertRecommendationToIdea: (rec: AIRecommendation) => ContentIdea;

  // AI Configuration
  updateAIConfig: (updates: Partial<AIProviderConfig>) => void;
  testAIConnection: () => Promise<{ success: boolean; message: string; models?: string[] }>;

  // Google Calendar Integration
  updateGoogleCalendarConfig: (updates: Partial<GoogleCalendarConfig>) => void;
  disconnectGoogleCalendar: () => void;

  // Data Management
  exportAllDataJSON: () => string;
  exportAllDataCSV: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; message: string };
  resetToDefaultData: () => void;
  clearAllUserData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PREFERENCES: 'ai_creator_os_preferences_v2',
  SNAPSHOTS: 'ai_creator_os_growth_snapshots_v2',
  IDEAS: 'ai_creator_os_ideas_v2',
  SCRIPTS: 'ai_creator_os_scripts_v2',
  STYLE: 'ai_creator_os_style_profile_v2',
  RESEARCH: 'ai_creator_os_research_v2',
  COMPETITORS: 'ai_creator_os_competitors_v2',
  CALENDAR: 'ai_creator_os_calendar_v2',
  REPORTS: 'ai_creator_os_reports_v2',
  RECOMMENDATIONS: 'ai_creator_os_recommendations_v2',
  CAROUSELS: 'ai_creator_os_carousels_v2',
  STORIES: 'ai_creator_os_stories_v2',
  AI_CONFIG: 'ai_creator_os_ai_config_v2',
  GOOGLE_CALENDAR: 'ai_creator_os_google_cal_v2',
  THEME: 'ai_creator_os_theme_v2',
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`LocalStorage write failed for ${key}:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPending, startTransition] = useTransition();

  // Lazy state initializers
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    readStorage(STORAGE_KEYS.PREFERENCES, INITIAL_PREFERENCES)
  );
  const [snapshots, setSnapshots] = useState<ManualGrowthSnapshot[]>(() =>
    readStorage(STORAGE_KEYS.SNAPSHOTS, INITIAL_GROWTH_SNAPSHOTS)
  );
  const [ideas, setIdeas] = useState<ContentIdea[]>(() =>
    readStorage(STORAGE_KEYS.IDEAS, INITIAL_IDEAS)
  );
  const [scripts, setScripts] = useState<ScriptItem[]>(() =>
    readStorage(STORAGE_KEYS.SCRIPTS, INITIAL_SCRIPTS)
  );
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(() =>
    readStorage(STORAGE_KEYS.STYLE, INITIAL_STYLE_PROFILE)
  );
  const [research, setResearch] = useState<ResearchRecord[]>(() =>
    readStorage(STORAGE_KEYS.RESEARCH, INITIAL_RESEARCH)
  );
  const [competitors, setCompetitors] = useState<CompetitorWatchlistRecord[]>(() =>
    readStorage(STORAGE_KEYS.COMPETITORS, INITIAL_COMPETITORS)
  );
  const [calendar, setCalendar] = useState<CalendarEntry[]>(() =>
    readStorage(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR)
  );
  const [reports, setReports] = useState<CreatorReportNote[]>(() =>
    readStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS)
  );
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(() =>
    readStorage(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS)
  );
  const [carousels, setCarousels] = useState<CarouselProject[]>(() =>
    readStorage(STORAGE_KEYS.CAROUSELS, INITIAL_CAROUSELS)
  );
  const [stories, setStories] = useState<StorySequence[]>(() =>
    readStorage(STORAGE_KEYS.STORIES, INITIAL_STORIES)
  );
  const [aiConfig, setAIConfig] = useState<AIProviderConfig>(() =>
    readStorage(STORAGE_KEYS.AI_CONFIG, INITIAL_AI_CONFIG)
  );
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendarConfig>(() => {
    const saved = readStorage<GoogleCalendarConfig>(STORAGE_KEYS.GOOGLE_CALENDAR, INITIAL_GOOGLE_CALENDAR_CONFIG);
    if (!saved || !saved.isConnected || saved.userEmail !== 'foraiacc.99@gmail.com') {
      const bound: GoogleCalendarConfig = {
        isConnected: true,
        userEmail: 'foraiacc.99@gmail.com',
        selectedCalendarId: 'primary',
        syncStatus: 'idle',
        syncedEventCount: saved?.syncedEventCount || 4,
        lastSyncedAt: new Date().toISOString(),
      };
      writeStorage(STORAGE_KEYS.GOOGLE_CALENDAR, bound);
      return bound;
    }
    return saved;
  });
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() =>
    readStorage(STORAGE_KEYS.THEME, 'light')
  );

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  // Actions
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      writeStorage(STORAGE_KEYS.PREFERENCES, next);
      return next;
    });
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    writeStorage(STORAGE_KEYS.THEME, newTheme);
  };

  // Growth Snapshots
  const addGrowthSnapshot = (
    data: Omit<ManualGrowthSnapshot, 'id' | 'createdAt'>
  ): ManualGrowthSnapshot => {
    const newSnap: ManualGrowthSnapshot = {
      ...data,
      id: `snap_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSnapshots((prev) => {
      const next = [newSnap, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      writeStorage(STORAGE_KEYS.SNAPSHOTS, next);
      return next;
    });
    return newSnap;
  };

  const updateGrowthSnapshot = (id: string, updates: Partial<ManualGrowthSnapshot>) => {
    setSnapshots((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      writeStorage(STORAGE_KEYS.SNAPSHOTS, next);
      return next;
    });
  };

  const deleteGrowthSnapshot = (id: string) => {
    setSnapshots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      writeStorage(STORAGE_KEYS.SNAPSHOTS, next);
      return next;
    });
  };

  // Duplicate Check
  const checkDuplicateIdea = (title: string, currentId?: string): DuplicateCheckResult => {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .trim();
    const cleanTarget = normalize(title);
    if (!cleanTarget) return { isDuplicate: false };

    const found = ideas.find((i) => {
      if (currentId && i.id === currentId) return false;
      const cleanIdea = normalize(i.title);
      return cleanIdea === cleanTarget || (cleanIdea.length > 10 && cleanTarget.includes(cleanIdea));
    });

    if (found) {
      return {
        isDuplicate: true,
        existingIdea: found,
        similarityReason: `Exact or very similar title already exists: "${found.title}"`,
      };
    }
    return { isDuplicate: false };
  };

  // Content Ideas
  const addIdea = (ideaData: Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>): ContentIdea => {
    const newIdea: ContentIdea = {
      ...ideaData,
      id: `idea_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIdeas((prev) => {
      const next = [newIdea, ...prev];
      writeStorage(STORAGE_KEYS.IDEAS, next);
      return next;
    });
    return newIdea;
  };

  const updateIdea = (id: string, updates: Partial<ContentIdea>) => {
    setIdeas((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      );
      writeStorage(STORAGE_KEYS.IDEAS, next);
      return next;
    });
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => {
      const next = prev.filter((i) => i.id !== id);
      writeStorage(STORAGE_KEYS.IDEAS, next);
      return next;
    });
  };

  const archiveIdea = (id: string) => {
    updateIdea(id, { status: 'Archived' });
  };

  const duplicateIdea = (id: string): ContentIdea | undefined => {
    const original = ideas.find((i) => i.id === id);
    if (!original) return undefined;
    const duplicated = addIdea({
      ...original,
      title: `${original.title} (Copy)`,
      status: 'Inbox',
      isAiGenerated: false,
    });
    return duplicated;
  };

  const createScriptFromIdea = (idea: ContentIdea): ScriptItem => {
    const hook1 = idea.hook || `Stop doing ${idea.topic} the hard way.`;
    const hook2 = `If you want to master ${idea.topic}, keep this in mind.`;
    const hook3 = `The non-obvious rule for ${idea.topic}.`;

    const newScript: ScriptItem = {
      id: `script_${Date.now()}`,
      ideaId: idea.id,
      title: idea.title,
      pillar: idea.pillar,
      hookOptions: [hook1, hook2, hook3],
      selectedHookIndex: 0,
      spokenScriptShort: `${hook1}\n\nHere is what you need to know about ${idea.topic}:\n\n1. Standardize your input.\n2. Cut unnecessary friction.\n3. Measure real-world outcomes.\n\nSave this Reel for your next sprint!`,
      spokenScriptLong: `${hook1}\n\nMost people get stuck because they focus on symptoms instead of root causes. They spend hours guessing instead of executing.\n\nHere is the practical framework:\n1. Standardize your input before touching any tools.\n2. Isolate the repetitive friction and eliminate it.\n3. Measure what moves the needle and double down.\n\nSave this video and comment below if you want the full breakdown!`,
      currentSpokenScript: `${hook1}\n\nHere is the practical 3-step breakdown for ${idea.topic}:\n\n1. Standardize your input.\n2. Eliminate the friction.\n3. Measure real outcomes.\n\nSave this video for your next build!`,
      shotList: [
        {
          shotNumber: 1,
          visual: 'Direct to camera with energetic posture at desk',
          audioSpoken: hook1,
          onScreenText: 'STOP DOING THIS 🛑',
          durationSeconds: 5,
        },
        {
          shotNumber: 2,
          visual: 'Screen recording or visual proof demonstrating the common mistake',
          audioSpoken: 'Most people focus on symptoms instead of root causes.',
          onScreenText: 'THE REAL BOTTLENECK ⚠️',
          durationSeconds: 6,
        },
        {
          shotNumber: 3,
          visual: 'Walkthrough of the 3-step framework with clear graphics',
          audioSpoken: 'Here is the 3-step framework to eliminate the problem.',
          onScreenText: 'THE 3-STEP FIX 🛠️',
          durationSeconds: 12,
        },
        {
          shotNumber: 4,
          visual: 'Back to camera with save/comment call to action',
          audioSpoken: 'Save this video for your next build!',
          onScreenText: 'SAVE THIS POST 📥',
          durationSeconds: 5,
        },
      ],
      bRollSuggestions: ['Terminal command screencast', 'Code or audit document inspection', 'Close-up of hands typing'],
      onScreenTextList: ['STOP DOING THIS 🛑', 'THE REAL BOTTLENECK ⚠️', 'THE 3-STEP FIX 🛠️', 'SAVE THIS POST 📥'],
      caption: `${idea.mainAngle || idea.title}\n\nA practical breakdown with zero hype.\n\nSave this for your next sprint! 🚀\n\n#buildinpublic #solodev #creatoros`,
      callToAction: 'Save this video for your next sprint!',
      coverTitle: idea.title.toUpperCase(),
      structureType: 'Problem, Explanation, Solution',
      tone: 'Direct, conversational, practical',
      estimatedDurationSeconds: 28,
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setScripts((prev) => {
      const next = [newScript, ...prev];
      writeStorage(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });

    updateIdea(idea.id, {
      status: 'Ready to Script',
      relatedScriptIds: [...(idea.relatedScriptIds || []), newScript.id],
    });

    return newScript;
  };

  // Scripts
  const addScript = (
    data: Omit<ScriptItem, 'id' | 'version' | 'createdAt' | 'updatedAt'>
  ): ScriptItem => {
    const newScript: ScriptItem = {
      ...data,
      id: `script_${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setScripts((prev) => {
      const next = [newScript, ...prev];
      writeStorage(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });
    return newScript;
  };

  const updateScript = (id: string, updates: Partial<ScriptItem>) => {
    setScripts((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      );
      writeStorage(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });
  };

  const deleteScript = (id: string) => {
    setScripts((prev) => {
      const next = prev.filter((s) => s.id !== id);
      writeStorage(STORAGE_KEYS.SCRIPTS, next);
      return next;
    });
  };

  // Style Profile
  const updateStyleProfile = (updates: Partial<StyleProfile>) => {
    setStyleProfile((prev) => {
      const next = { ...prev, ...updates, lastUpdated: new Date().toISOString() };
      writeStorage(STORAGE_KEYS.STYLE, next);
      return next;
    });
  };

  // Research
  const addResearchRecord = (
    data: Omit<ResearchRecord, 'id' | 'retrievalDate'>
  ): ResearchRecord => {
    const newRec: ResearchRecord = {
      ...data,
      id: `res_${Date.now()}`,
      retrievalDate: new Date().toISOString().split('T')[0],
    };
    setResearch((prev) => {
      const next = [newRec, ...prev];
      writeStorage(STORAGE_KEYS.RESEARCH, next);
      return next;
    });
    return newRec;
  };

  const updateResearchRecord = (id: string, updates: Partial<ResearchRecord>) => {
    setResearch((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      writeStorage(STORAGE_KEYS.RESEARCH, next);
      return next;
    });
  };

  const deleteResearchRecord = (id: string) => {
    setResearch((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeStorage(STORAGE_KEYS.RESEARCH, next);
      return next;
    });
  };

  // Competitor Watchlist
  const addCompetitorWatchlist = (
    data: Omit<CompetitorWatchlistRecord, 'id' | 'lastResearchedDate'>
  ): CompetitorWatchlistRecord => {
    const newComp: CompetitorWatchlistRecord = {
      ...data,
      id: `comp_${Date.now()}`,
      lastResearchedDate: new Date().toISOString().split('T')[0],
    };
    setCompetitors((prev) => {
      const next = [newComp, ...prev];
      writeStorage(STORAGE_KEYS.COMPETITORS, next);
      return next;
    });
    return newComp;
  };

  const updateCompetitorWatchlist = (
    id: string,
    updates: Partial<CompetitorWatchlistRecord>
  ) => {
    setCompetitors((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, ...updates, lastResearchedDate: new Date().toISOString().split('T')[0] } : c
      );
      writeStorage(STORAGE_KEYS.COMPETITORS, next);
      return next;
    });
  };

  const deleteCompetitorWatchlist = (id: string) => {
    setCompetitors((prev) => {
      const next = prev.filter((c) => c.id !== id);
      writeStorage(STORAGE_KEYS.COMPETITORS, next);
      return next;
    });
  };

  const addCompetitorAnalysis = (
    competitorId: string,
    analysisData: Omit<CompetitorPublicAnalysis, 'id' | 'retrievalDate'>
  ) => {
    const analysis: CompetitorPublicAnalysis = {
      ...analysisData,
      id: `ana_${Date.now()}`,
      retrievalDate: new Date().toISOString().split('T')[0],
    };
    setCompetitors((prev) => {
      const next = prev.map((c) =>
        c.id === competitorId
          ? {
              ...c,
              analyses: [analysis, ...(c.analyses || [])],
              lastResearchedDate: new Date().toISOString().split('T')[0],
            }
          : c
      );
      writeStorage(STORAGE_KEYS.COMPETITORS, next);
      return next;
    });
  };

  // Calendar
  const addCalendarEntry = (entryData: Omit<CalendarEntry, 'id'>): CalendarEntry => {
    const newEntry: CalendarEntry = {
      ...entryData,
      id: `cal_${Date.now()}`,
      isSyncedToGoogle: false,
    };
    setCalendar((prev) => {
      const next = [newEntry, ...prev].sort(
        (a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
      );
      writeStorage(STORAGE_KEYS.CALENDAR, next);
      return next;
    });
    return newEntry;
  };

  const updateCalendarEntry = (id: string, updates: Partial<CalendarEntry>) => {
    setCalendar((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      writeStorage(STORAGE_KEYS.CALENDAR, next);
      return next;
    });
  };

  const deleteCalendarEntry = (id: string) => {
    setCalendar((prev) => {
      const next = prev.filter((c) => c.id !== id);
      writeStorage(STORAGE_KEYS.CALENDAR, next);
      return next;
    });
  };

  const autoPlanRealisticSchedule = () => {
    // Generate realistic slots for ideas marked Ready to Script or Ready to Shoot
    const unassignedIdeas = ideas.filter(
      (i) =>
        (i.status === 'Ready to Script' || i.status === 'Ready to Shoot' || i.status === 'Inbox') &&
        !calendar.some((c) => c.ideaId === i.id)
    );

    const candidates = unassignedIdeas.slice(0, 3);
    const newEntries: CalendarEntry[] = [];
    const baseDate = new Date();

    candidates.forEach((idea, idx) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + (idx + 1) * 2);
      const plannedDateStr = date.toISOString().split('T')[0];

      newEntries.push({
        id: `cal_auto_${Date.now()}_${idx}`,
        title: idea.title,
        plannedDate: plannedDateStr,
        plannedTime: '17:00',
        format: idea.format,
        pillar: idea.pillar,
        stage: idea.status === 'Ready to Shoot' ? 'Shooting' : 'Script',
        status: idea.status,
        ideaId: idea.id,
        notes: `AI Scheduled slot based on ${preferences.availableFilmingHoursPerWeek}h weekly filming bandwidth.`,
        isSyncedToGoogle: false,
      });
    });

    if (newEntries.length > 0) {
      setCalendar((prev) => {
        const next = [...prev, ...newEntries].sort(
          (a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
        );
        writeStorage(STORAGE_KEYS.CALENDAR, next);
        return next;
      });
    }
  };

  const syncCalendarToGoogle = async (
    entryId: string
  ): Promise<{ success: boolean; message: string }> => {
    const entry = calendar.find((c) => c.id === entryId);
    if (!entry) return { success: false, message: 'Calendar entry not found.' };

    if (!googleCalendar.isConnected) {
      return {
        success: false,
        message: 'Google Calendar is not connected. Configure OAuth in Settings > Google Calendar.',
      };
    }

    try {
      const res = await fetch('/api/calendar/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_event',
          entry,
        }),
      });
      const data = await res.json();
      if (data.success && data.googleEventId) {
        updateCalendarEntry(entryId, {
          googleCalendarEventId: data.googleEventId,
          isSyncedToGoogle: true,
          lastSyncedGoogleAt: new Date().toISOString(),
        });
        setGoogleCalendar((prev) => ({
          ...prev,
          syncedEventCount: prev.syncedEventCount + 1,
          lastSyncedAt: new Date().toISOString(),
        }));
        return { success: true, message: 'Event successfully created in Google Calendar.' };
      }
      return { success: false, message: data.message || 'Synchronization failed.' };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: err.message || 'Failed to sync with Google Calendar API.' };
    }
  };

  // Reports & Notes
  const addReportNote = (
    data: Omit<CreatorReportNote, 'id' | 'createdAt' | 'updatedAt'>
  ): CreatorReportNote => {
    const newNote: CreatorReportNote = {
      ...data,
      id: `rep_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReports((prev) => {
      const next = [newNote, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      writeStorage(STORAGE_KEYS.REPORTS, next);
      return next;
    });
    return newNote;
  };

  const updateReportNote = (id: string, updates: Partial<CreatorReportNote>) => {
    setReports((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      );
      writeStorage(STORAGE_KEYS.REPORTS, next);
      return next;
    });
  };

  const deleteReportNote = (id: string) => {
    setReports((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeStorage(STORAGE_KEYS.REPORTS, next);
      return next;
    });
  };

  // Carousels
  const addCarouselProject = (
    data: Omit<CarouselProject, 'id' | 'updatedAt'>
  ): CarouselProject => {
    const newProj: CarouselProject = {
      ...data,
      id: `car_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setCarousels((prev) => {
      const next = [newProj, ...prev];
      writeStorage(STORAGE_KEYS.CAROUSELS, next);
      return next;
    });
    return newProj;
  };

  const updateCarouselProject = (id: string, updates: Partial<CarouselProject>) => {
    setCarousels((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      );
      writeStorage(STORAGE_KEYS.CAROUSELS, next);
      return next;
    });
  };

  const deleteCarouselProject = (id: string) => {
    setCarousels((prev) => {
      const next = prev.filter((c) => c.id !== id);
      writeStorage(STORAGE_KEYS.CAROUSELS, next);
      return next;
    });
  };

  // Stories
  const addStorySequence = (
    data: Omit<StorySequence, 'id' | 'updatedAt'>
  ): StorySequence => {
    const newStory: StorySequence = {
      ...data,
      id: `story_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setStories((prev) => {
      const next = [newStory, ...prev];
      writeStorage(STORAGE_KEYS.STORIES, next);
      return next;
    });
    return newStory;
  };

  const updateStorySequence = (id: string, updates: Partial<StorySequence>) => {
    setStories((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      );
      writeStorage(STORAGE_KEYS.STORIES, next);
      return next;
    });
  };

  const deleteStorySequence = (id: string) => {
    setStories((prev) => {
      const next = prev.filter((s) => s.id !== id);
      writeStorage(STORAGE_KEYS.STORIES, next);
      return next;
    });
  };

  // Recommendations
  const updateRecommendationStatus = (
    id: string,
    status: AIRecommendation['status']
  ) => {
    setRecommendations((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      writeStorage(STORAGE_KEYS.RECOMMENDATIONS, next);
      return next;
    });
  };

  const convertRecommendationToIdea = (rec: AIRecommendation): ContentIdea => {
    const newIdea = addIdea({
      title: rec.topic,
      pillar: rec.pillar,
      topic: rec.topic,
      targetAudience: rec.intendedAudience,
      format: rec.recommendedFormat,
      hook: rec.primaryHook,
      mainAngle: rec.suggestedAngle,
      supportingResearch: rec.evidenceAndResearch,
      sourceUrls: rec.sourceLinks,
      estimatedProductionTime: rec.estimatedProductionTime,
      priority: rec.productionDifficulty === 'Easy' ? 'High' : 'Medium',
      status: 'Inbox',
      isAiGenerated: true,
      tags: [rec.pillar.toLowerCase().replace(/_/g, '-')],
    });
    updateRecommendationStatus(rec.id, 'saved');
    return newIdea;
  };

  // AI Configuration
  const updateAIConfig = (updates: Partial<AIProviderConfig>) => {
    setAIConfig((prev) => {
      const next = { ...prev, ...updates };
      writeStorage(STORAGE_KEYS.AI_CONFIG, next);
      return next;
    });
  };

  const testAIConnection = async (): Promise<{
    success: boolean;
    message: string;
    models?: string[];
  }> => {
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiConfig }),
      });
      const data = await res.json();
      if (data.success) {
        updateAIConfig({
          isConnected: true,
          availableModels: data.models || aiConfig.availableModels,
          statusMessage: data.message,
        });
      } else {
        updateAIConfig({
          isConnected: false,
          statusMessage: data.message,
        });
      }
      return data;
    } catch (e: unknown) {
      const err = e as Error;
      const failMsg = `Failed to connect: ${err.message}`;
      updateAIConfig({ isConnected: false, statusMessage: failMsg });
      return { success: false, message: failMsg };
    }
  };

  // Google Calendar Integration
  const updateGoogleCalendarConfig = (updates: Partial<GoogleCalendarConfig>) => {
    setGoogleCalendar((prev) => {
      const next = { ...prev, ...updates };
      writeStorage(STORAGE_KEYS.GOOGLE_CALENDAR, next);
      return next;
    });
  };

  const disconnectGoogleCalendar = () => {
    const next: GoogleCalendarConfig = {
      isConnected: false,
      syncStatus: 'idle',
      syncedEventCount: 0,
      userEmail: undefined,
      selectedCalendarId: undefined,
    };
    setGoogleCalendar(next);
    writeStorage(STORAGE_KEYS.GOOGLE_CALENDAR, next);
  };

  // Data Management
  const exportAllDataJSON = (): string => {
    const fullBackup = {
      preferences,
      snapshots,
      ideas,
      scripts,
      styleProfile,
      research,
      competitors,
      calendar,
      reports,
      carousels,
      stories,
      recommendations,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const exportAllDataCSV = (): string => {
    const headers = ['Type', 'Title', 'Pillar / Category', 'Date', 'Status / Metrics', 'Summary'];
    const rows: string[][] = [];

    ideas.forEach((i) =>
      rows.push(['Idea', `"${i.title.replace(/"/g, '""')}"`, i.pillar, i.createdAt.split('T')[0], i.status, `"${i.hook.replace(/"/g, '""')}"`])
    );
    scripts.forEach((s) =>
      rows.push(['Script', `"${s.title.replace(/"/g, '""')}"`, s.pillar, s.updatedAt.split('T')[0], s.status, `"${s.caption.replace(/"/g, '""')}"`])
    );
    snapshots.forEach((snap) =>
      rows.push(['Growth Snapshot', `Followers: ${snap.totalFollowers}`, 'Growth Tracker', snap.date, `ER: ${snap.engagementRate}% | Views: ${snap.totalViews}`, `"${(snap.notes || '').replace(/"/g, '""')}"`])
    );
    reports.forEach((r) =>
      rows.push(['Report / Note', `"${r.title.replace(/"/g, '""')}"`, r.category, r.date, r.isAiGenerated ? 'AI' : 'Manual', `"${r.observations.replace(/"/g, '""')}"`])
    );

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const importDataJSON = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid JSON format.' };
      }

      startTransition(() => {
        if (Array.isArray(data.ideas)) {
          setIdeas(data.ideas);
          writeStorage(STORAGE_KEYS.IDEAS, data.ideas);
        }
        if (Array.isArray(data.scripts)) {
          setScripts(data.scripts);
          writeStorage(STORAGE_KEYS.SCRIPTS, data.scripts);
        }
        if (Array.isArray(data.snapshots)) {
          setSnapshots(data.snapshots);
          writeStorage(STORAGE_KEYS.SNAPSHOTS, data.snapshots);
        }
        if (Array.isArray(data.research)) {
          setResearch(data.research);
          writeStorage(STORAGE_KEYS.RESEARCH, data.research);
        }
        if (Array.isArray(data.competitors)) {
          setCompetitors(data.competitors);
          writeStorage(STORAGE_KEYS.COMPETITORS, data.competitors);
        }
        if (Array.isArray(data.calendar)) {
          setCalendar(data.calendar);
          writeStorage(STORAGE_KEYS.CALENDAR, data.calendar);
        }
        if (Array.isArray(data.reports)) {
          setReports(data.reports);
          writeStorage(STORAGE_KEYS.REPORTS, data.reports);
        }
        if (data.preferences) {
          setPreferences(data.preferences);
          writeStorage(STORAGE_KEYS.PREFERENCES, data.preferences);
        }
        if (data.styleProfile) {
          setStyleProfile(data.styleProfile);
          writeStorage(STORAGE_KEYS.STYLE, data.styleProfile);
        }
      });

      return { success: true, message: 'Data backup successfully restored!' };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: `Import failed: ${err.message}` };
    }
  };

  const resetToDefaultData = () => {
    startTransition(() => {
      setPreferences(INITIAL_PREFERENCES);
      setSnapshots(INITIAL_GROWTH_SNAPSHOTS);
      setIdeas(INITIAL_IDEAS);
      setScripts(INITIAL_SCRIPTS);
      setStyleProfile(INITIAL_STYLE_PROFILE);
      setResearch(INITIAL_RESEARCH);
      setCompetitors(INITIAL_COMPETITORS);
      setCalendar(INITIAL_CALENDAR);
      setReports(INITIAL_REPORTS);
      setRecommendations(INITIAL_RECOMMENDATIONS);
      setCarousels(INITIAL_CAROUSELS);
      setStories(INITIAL_STORIES);
      setAIConfig(INITIAL_AI_CONFIG);
      setGoogleCalendar(INITIAL_GOOGLE_CALENDAR_CONFIG);

      writeStorage(STORAGE_KEYS.PREFERENCES, INITIAL_PREFERENCES);
      writeStorage(STORAGE_KEYS.SNAPSHOTS, INITIAL_GROWTH_SNAPSHOTS);
      writeStorage(STORAGE_KEYS.IDEAS, INITIAL_IDEAS);
      writeStorage(STORAGE_KEYS.SCRIPTS, INITIAL_SCRIPTS);
      writeStorage(STORAGE_KEYS.STYLE, INITIAL_STYLE_PROFILE);
      writeStorage(STORAGE_KEYS.RESEARCH, INITIAL_RESEARCH);
      writeStorage(STORAGE_KEYS.COMPETITORS, INITIAL_COMPETITORS);
      writeStorage(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR);
      writeStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      writeStorage(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
      writeStorage(STORAGE_KEYS.CAROUSELS, INITIAL_CAROUSELS);
      writeStorage(STORAGE_KEYS.STORIES, INITIAL_STORIES);
      writeStorage(STORAGE_KEYS.AI_CONFIG, INITIAL_AI_CONFIG);
      writeStorage(STORAGE_KEYS.GOOGLE_CALENDAR, INITIAL_GOOGLE_CALENDAR_CONFIG);
    });
  };

  const clearAllUserData = () => {
    startTransition(() => {
      setSnapshots([]);
      setIdeas([]);
      setScripts([]);
      setResearch([]);
      setCompetitors([]);
      setCalendar([]);
      setReports([]);
      setCarousels([]);
      setStories([]);

      writeStorage(STORAGE_KEYS.SNAPSHOTS, []);
      writeStorage(STORAGE_KEYS.IDEAS, []);
      writeStorage(STORAGE_KEYS.SCRIPTS, []);
      writeStorage(STORAGE_KEYS.RESEARCH, []);
      writeStorage(STORAGE_KEYS.COMPETITORS, []);
      writeStorage(STORAGE_KEYS.CALENDAR, []);
      writeStorage(STORAGE_KEYS.REPORTS, []);
      writeStorage(STORAGE_KEYS.CAROUSELS, []);
      writeStorage(STORAGE_KEYS.STORIES, []);
    });
  };

  return (
    <AppContext.Provider
      value={{
        preferences,
        snapshots,
        ideas,
        scripts,
        styleProfile,
        research,
        competitors,
        calendar,
        reports,
        recommendations,
        carousels,
        stories,
        aiConfig,
        googleCalendar,
        theme,
        isPending,
        updatePreferences,
        setTheme,
        addGrowthSnapshot,
        updateGrowthSnapshot,
        deleteGrowthSnapshot,
        checkDuplicateIdea,
        addIdea,
        updateIdea,
        deleteIdea,
        archiveIdea,
        duplicateIdea,
        createScriptFromIdea,
        addScript,
        updateScript,
        deleteScript,
        updateStyleProfile,
        addResearchRecord,
        updateResearchRecord,
        deleteResearchRecord,
        addCompetitorWatchlist,
        updateCompetitorWatchlist,
        deleteCompetitorWatchlist,
        addCompetitorAnalysis,
        addCalendarEntry,
        updateCalendarEntry,
        deleteCalendarEntry,
        autoPlanRealisticSchedule,
        syncCalendarToGoogle,
        addReportNote,
        updateReportNote,
        deleteReportNote,
        addCarouselProject,
        updateCarouselProject,
        deleteCarouselProject,
        addStorySequence,
        updateStorySequence,
        deleteStorySequence,
        updateRecommendationStatus,
        convertRecommendationToIdea,
        updateAIConfig,
        testAIConnection,
        updateGoogleCalendarConfig,
        disconnectGoogleCalendar,
        exportAllDataJSON,
        exportAllDataCSV,
        importDataJSON,
        resetToDefaultData,
        clearAllUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
