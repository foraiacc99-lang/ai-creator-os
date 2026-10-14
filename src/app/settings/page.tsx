'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONTENT_PILLARS, ContentPillar, ContentFormat } from '@/types';
import {
  Settings,
  Cpu,
  Sliders,
  Database,
  Calendar,
  SunMoon,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  Lock,
  ExternalLink,
  Check,
  Plus,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    preferences,
    updatePreferences,
    aiConfig,
    updateAIConfig,
    testAIConnection,
    googleCalendar,
    updateGoogleCalendarConfig,
    disconnectGoogleCalendar,
    theme,
    setTheme,
    exportAllDataJSON,
    exportAllDataCSV,
    importDataJSON,
    resetToDefaultData,
    clearAllUserData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'general' | 'content' | 'ai' | 'research' | 'calendar' | 'appearance' | 'data'
  >('general');

  // General Form
  const [appName, setAppName] = useState(preferences.appName || 'AI Creator OS');
  const [timeZone, setTimeZone] = useState(preferences.timeZone || 'UTC');
  const [dateFormat, setDateFormat] = useState(preferences.dateFormat || 'YYYY-MM-DD');
  const [defaultFormat, setDefaultFormat] = useState<ContentFormat>(preferences.defaultFormat || 'REELS');
  const [defaultDuration, setDefaultDuration] = useState(preferences.defaultDurationSeconds || 45);
  const [workingHoursStart, setWorkingHoursStart] = useState(preferences.workingHoursStart || '09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(preferences.workingHoursEnd || '18:00');

  // Content Preferences Form
  const [targetAudience, setTargetAudience] = useState(preferences.targetAudience || '');
  const [preferredTone, setPreferredTone] = useState(preferences.preferredTone || '');
  const [postingFrequency, setPostingFrequency] = useState(preferences.postingFrequencyPerWeek || 3);
  const [filmingHours, setFilmingHours] = useState(preferences.availableFilmingHoursPerWeek || 4);
  const [editingHours, setEditingHours] = useState(preferences.availableEditingHoursPerWeek || 6);
  const [activePillars, setActivePillars] = useState<ContentPillar[]>(
    preferences.activePillars || [
      'AI_TOOLS_AND_AUTOMATION',
      'FREE_GITHUB_AND_DEV_TOOLS',
      'SALES_PSYCHOLOGY_AND_CLIENT_ACQUISITION',
      'BUILDING_PROJECTS_AND_SYSTEMS',
      'WEBSITE_DEV_AND_SEO',
      'BUILD_IN_PUBLIC_AND_JOURNEY',
    ]
  );
  const [contentGoals, setContentGoals] = useState<string[]>(preferences.contentGoals || []);
  const [newGoal, setNewGoal] = useState('');
  const [preferredCTAs, setPreferredCTAs] = useState<string[]>(preferences.preferredCTAs || []);
  const [newCTA, setNewCTA] = useState('');
  const [avoidWords, setAvoidWords] = useState<string[]>(preferences.avoidWords || []);
  const [newAvoidWord, setNewAvoidWord] = useState('');

  // AI Inference Form
  const [aiProvider, setAiProvider] = useState(aiConfig.provider);
  const [endpoint, setEndpoint] = useState(aiConfig.endpoint);
  const [textModel, setTextModel] = useState(aiConfig.textModel);
  const [localOnlyMode, setLocalOnlyMode] = useState(aiConfig.localOnlyMode);
  const [isCloudEnabled, setIsCloudEnabled] = useState(aiConfig.isCloudEnabled);
  const [groqApiKey, setGroqApiKey] = useState(aiConfig.groqApiKey || '');
  const [groqModel, setGroqModel] = useState(aiConfig.groqModel || 'llama-3.3-70b-versatile');
  const [openRouterApiKey, setOpenRouterApiKey] = useState(aiConfig.openRouterApiKey || '');
  const [openRouterModel, setOpenRouterModel] = useState(aiConfig.openRouterModel || 'meta-llama/llama-3.2-3b-instruct:free');
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string; models?: string[] } | null>(null);

  // Research Form
  const [githubToken, setGithubToken] = useState(preferences.githubToken || '');
  const [searchProvider, setSearchProvider] = useState(preferences.searchProvider || 'duckduckgo');
  const [sourcePreferences, setSourcePreferences] = useState<string[]>(
    preferences.sourcePreferences || ['Official Docs', 'GitHub Readmes', 'Technical Blogs', 'Google Search Central']
  );
  const [newSource, setNewSource] = useState('');

  // Notifications & Modals
  const [saveToast, setSaveToast] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Save General
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      appName,
      timeZone,
      dateFormat,
      defaultFormat,
      defaultDurationSeconds: defaultDuration,
      workingHoursStart,
      workingHoursEnd,
    });
    triggerSaved();
  };

  // Save Content
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      targetAudience,
      preferredTone,
      postingFrequencyPerWeek: postingFrequency,
      availableFilmingHoursPerWeek: filmingHours,
      availableEditingHoursPerWeek: editingHours,
      activePillars,
      contentGoals,
      preferredCTAs,
      avoidWords,
    });
    triggerSaved();
  };

  // Save AI Config
  const handleSaveAI = () => {
    updateAIConfig({
      provider: aiProvider,
      endpoint,
      textModel,
      localOnlyMode,
      isCloudEnabled,
      groqApiKey,
      groqModel,
      openRouterApiKey,
      openRouterModel,
    });
    triggerSaved();
  };

  // Test AI Connection
  const handleTestAI = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    const res = await testAIConnection();
    setAiTestResult(res);
    setTestingAi(false);
  };

  // Save Research
  const handleSaveResearch = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      githubToken,
      searchProvider,
      sourcePreferences,
    });
    triggerSaved();
  };

  const triggerSaved = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  // Tag helper
  const addTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string, clear: () => void) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      clear();
    }
  };

  const removeTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(list.filter((t) => t !== item));
  };

  const togglePillar = (pillarId: ContentPillar) => {
    if (activePillars.includes(pillarId)) {
      if (activePillars.length === 1) return; // keep at least 1
      setActivePillars(activePillars.filter((p) => p !== pillarId));
    } else {
      setActivePillars([...activePillars, pillarId]);
    }
  };

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = exportAllDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-creator-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = exportAllDataCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-creator-os-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importDataJSON(importJsonText);
    setImportResult(res);
    if (res.success) {
      setTimeout(() => {
        setImportModalOpen(false);
        setImportResult(null);
        setImportJsonText('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">System Settings</h1>
            <Badge variant="secondary" className="text-xs">
              Config & Privacy
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Control local AI inference (zero cost by default), content pillars, research sources, Google Calendar, and data persistence.
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            Settings Updated
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 text-xs overflow-x-auto pb-0.5">
        {[
          { id: 'general', label: 'General', icon: Settings },
          { id: 'content', label: 'Content Preferences', icon: Sliders },
          { id: 'ai', label: 'AI Inference (Zero Cost)', icon: Cpu },
          { id: 'research', label: 'Research & Sources', icon: Search },
          { id: 'calendar', label: 'Google Calendar', icon: Calendar },
          { id: 'appearance', label: 'Appearance', icon: SunMoon },
          { id: 'data', label: 'Data Management', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'general' | 'content' | 'ai' | 'research' | 'calendar' | 'appearance' | 'data')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors shrink-0 ${
                isActive
                  ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Application & Schedule Parameters</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Basic application labels, time format, and your standard working windows.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Application Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Time Zone</label>
              <input
                type="text"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg text-neutral-900 dark:text-neutral-100"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK/IN)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Default Content Format</label>
              <select
                value={defaultFormat}
                onChange={(e) => setDefaultFormat(e.target.value as ContentFormat)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg text-neutral-900 dark:text-neutral-100"
              >
                <option value="REELS">Reels / Shorts (9:16)</option>
                <option value="CAROUSEL">Multi-Slide Carousel (4:5 / 1:1)</option>
                <option value="STORY">Story Sequence</option>
                <option value="SHORT_VIDEO">Short Video (Under 3 mins)</option>
                <option value="POST">Text / Single Image Post</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Default Target Duration (Seconds)</label>
              <input
                type="number"
                min={15}
                max={180}
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
              />
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">Short-form Reels standard is between 30 and 60 seconds.</span>
            </div>
          </div>

          <div className="pt-2 text-xs">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Standard Daily Working Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-0.5">Start Time</span>
                <input
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-0.5">End Time</span>
                <input
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save General Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: Content Preferences */}
      {activeTab === 'content' && (
        <form onSubmit={handleSaveContent} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Content Pillars & Strategy Profile</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Configure the 6 foundational pillars, voice tone, production capacity, and strict word bans.
            </p>
          </div>

          {/* Active Pillars Toggle */}
          <div className="space-y-2">
            <label className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs block">
              Active Content Pillars (Select which to prioritize)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {CONTENT_PILLARS.map((p) => {
                const isActive = activePillars.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => togglePillar(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50/70 dark:bg-neutral-800/60 ring-1 ring-neutral-900 dark:ring-neutral-100'
                        : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{p.shortTitle}</span>
                      <Badge className={p.badgeClass}>{isActive ? 'Active' : 'Muted'}</Badge>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Audience & Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Target Audience</label>
              <textarea
                rows={3}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Solo developers, indie hackers, agency owners, small businesses..."
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Preferred Voice & Tone</label>
              <textarea
                rows={3}
                value={preferredTone}
                onChange={(e) => setPreferredTone(e.target.value)}
                placeholder="e.g. Practical, direct, conversational, speaking to a friend at a desk..."
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Production Hours & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Weekly Target Posts</label>
              <input
                type="number"
                min={1}
                max={14}
                value={postingFrequency}
                onChange={(e) => setPostingFrequency(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Available Filming Hours/Week</label>
              <input
                type="number"
                min={0.5}
                max={40}
                step={0.5}
                value={filmingHours}
                onChange={(e) => setFilmingHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Available Editing Hours/Week</label>
              <input
                type="number"
                min={0.5}
                max={40}
                step={0.5}
                value={editingHours}
                onChange={(e) => setEditingHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Content Goals Tags */}
          <div className="space-y-2 text-xs pt-2">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">Content Goals</label>
            <div className="flex flex-wrap gap-1.5">
              {contentGoals.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs"
                >
                  {g}
                  <button type="button" onClick={() => removeTag(contentGoals, setContentGoals, g)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new goal (e.g. Authority in AI)"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(contentGoals, setContentGoals, newGoal, () => setNewGoal(''));
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(contentGoals, setContentGoals, newGoal, () => setNewGoal(''))}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Preferred CTAs */}
          <div className="space-y-2 text-xs pt-2">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">Preferred Calls to Action (CTAs)</label>
            <div className="flex flex-wrap gap-1.5">
              {preferredCTAs.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs"
                >
                  {c}
                  <button type="button" onClick={() => removeTag(preferredCTAs, setPreferredCTAs, c)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add CTA (e.g. Comment REPO for link)"
                value={newCTA}
                onChange={(e) => setNewCTA(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(preferredCTAs, setPreferredCTAs, newCTA, () => setNewCTA(''));
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(preferredCTAs, setPreferredCTAs, newCTA, () => setNewCTA(''))}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Words to Avoid */}
          <div className="space-y-2 text-xs pt-2">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">
              Words & Phrases to Avoid (Strictly banned in scripts)
            </label>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Corporate clichés and repetitive AI filler words.</p>
            <div className="flex flex-wrap gap-1.5">
              {avoidWords.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-lg text-xs"
                >
                  &ldquo;{w}&rdquo;
                  <button type="button" onClick={() => removeTag(avoidWords, setAvoidWords, w)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ban phrase (e.g. delve, game-changer)"
                value={newAvoidWord}
                onChange={(e) => setNewAvoidWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(avoidWords, setAvoidWords, newAvoidWord, () => setNewAvoidWord(''));
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(avoidWords, setAvoidWords, newAvoidWord, () => setNewAvoidWord(''))}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Ban Word
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Content Preferences
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: AI Inference */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Zero-Cost Safety Controls Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className="font-bold text-emerald-900 dark:text-emerald-200">Zero-Cost Safety Guarantee Active</h3>
            </div>
            <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed text-[11px]">
              Ollama is configured as the default provider. Cloud AI providers (Groq and OpenRouter) remain completely disabled until you explicitly turn them on. The system never silently falls back to paid models, never auto-purchases tokens, and keeps all API keys strictly on your local machine.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">AI Provider Selection & Connectivity</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select your active engine. Ollama runs 100% offline at zero cost.
                </p>
              </div>

              <Button onClick={handleTestAI} variant="outline" size="sm" isLoading={testingAi}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Test Connection
              </Button>
            </div>

            {aiTestResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
                  aiTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}
              >
                {aiTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div className="space-y-0.5">
                  <div className="font-semibold">{aiTestResult.message}</div>
                  {aiTestResult.models && aiTestResult.models.length > 0 && (
                    <div className="text-[11px] opacity-80">
                      Discovered models: {aiTestResult.models.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'ollama',
                  title: 'Ollama (Local Offline)',
                  badge: 'Zero Cost • Primary',
                  desc: 'Runs open-weight models (Llama 3.2, Mistral, Qwen) on your CPU/GPU. Total privacy, no internet required.',
                },
                {
                  id: 'groq',
                  title: 'Groq Cloud (Optional)',
                  badge: 'Fast LPU Inference',
                  desc: 'Ultra-fast inference via Groq cloud API. Free tiers available with rate limits. Requires user API key.',
                },
                {
                  id: 'openrouter',
                  title: 'OpenRouter (Optional)',
                  badge: 'Multi-Model Router',
                  desc: 'Access hundreds of open and commercial models. Free tier models clearly filtered. Requires user API key.',
                },
              ].map((p) => {
                const isSelected = aiProvider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setAiProvider(p.id as 'ollama' | 'groq' | 'openrouter')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/80 ring-1 ring-neutral-900 dark:ring-neutral-100'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{p.title}</span>
                      <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">{p.badge}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Safety Switches */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 block">Strict Local-Only Mode</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Hard blocks all outbound cloud AI calls. Only local Ollama can be queried.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localOnlyMode}
                  onChange={(e) => setLocalOnlyMode(e.target.checked)}
                  className="w-4 h-4 rounded text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 block">Enable Optional Cloud AI Providers</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Allows selecting Groq or OpenRouter when local Ollama is paused or resource-constrained.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isCloudEnabled}
                  onChange={(e) => setIsCloudEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Ollama Configuration Fields */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
                Ollama Local Server Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Ollama Base URL</label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
                  />
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">Default: http://localhost:11434</span>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Local Text Model</label>
                  <input
                    type="text"
                    value={textModel}
                    onChange={(e) => setTextModel(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
                  />
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">e.g. llama3.2, mistral, qwen2.5, deepseek-r1:8b</span>
                </div>
              </div>
            </div>

            {/* Optional Groq Fields */}
            <div className={`space-y-4 pt-2 ${!isCloudEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
                Optional Groq API Settings {!isCloudEnabled && <span className="text-[10px] font-normal text-amber-600">(Disabled by Cloud Safety Switch)</span>}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Groq API Key</label>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Groq Model Identifier</label>
                  <input
                    type="text"
                    value={groqModel}
                    onChange={(e) => setGroqModel(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
                  />
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">e.g. llama-3.3-70b-versatile, llama-3.1-8b-instant</span>
                </div>
              </div>
            </div>

            {/* Optional OpenRouter Fields */}
            <div className={`space-y-4 pt-2 ${!isCloudEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
                Optional OpenRouter Settings {!isCloudEnabled && <span className="text-[10px] font-normal text-amber-600">(Disabled by Cloud Safety Switch)</span>}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">OpenRouter API Key</label>
                  <input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={openRouterApiKey}
                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">OpenRouter Model</label>
                  <input
                    type="text"
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
                  />
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">Free models end in :free</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <Button onClick={handleSaveAI} variant="primary" size="sm">
                Save AI Configuration
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Research & Sources */}
      {activeTab === 'research' && (
        <form onSubmit={handleSaveResearch} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Public Web & GitHub Research Engine</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Configure search engine preferences, GitHub evaluation credentials, and verified source authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Default Web Search Engine</label>
              <select
                value={searchProvider}
                onChange={(e) => setSearchProvider(e.target.value as 'duckduckgo' | 'serper' | 'custom')}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg text-neutral-900 dark:text-neutral-100"
              >
                <option value="duckduckgo">DuckDuckGo Public Search (Free, No Auth)</option>
                <option value="serper">SerpAPI / Serper (Optional Token)</option>
                <option value="custom">Custom HTML Scraper Service</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                GitHub Personal Access Token (Optional)
              </label>
              <input
                type="password"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
              />
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                Increases GitHub API rate limit from 60 to 5,000 requests/hour.
              </span>
            </div>
          </div>

          {/* Trusted Sources */}
          <div className="space-y-2 pt-2">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">
              Trusted Authority Domains & Sources
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sourcePreferences.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs"
                >
                  {s}
                  <button type="button" onClick={() => removeTag(sourcePreferences, setSourcePreferences, s)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add source (e.g. Google Search Central, Next.js Docs)"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(sourcePreferences, setSourcePreferences, newSource, () => setNewSource(''));
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(sourcePreferences, setSourcePreferences, newSource, () => setNewSource(''))}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Platform Compliance Policy Card */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
              Platform Compliance & Privacy Standard
            </span>
            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
              All web and competitor investigations operate strictly on lawful, public data or manually provided transcripts. The application never bypasses platform CAPTCHAs, never accesses private Instagram insights, and never claims to retrieve private creator telemetry.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Research Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 5: Google Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Official Google Calendar Synchronization</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Authorized one-way sync from AI Creator OS to your Google Calendar.
              </p>
            </div>
            <Badge variant={googleCalendar.isConnected ? 'success' : 'secondary'}>
              {googleCalendar.isConnected ? 'Connected & Authorized' : 'Not Connected'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Google Account</span>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                {googleCalendar.userEmail || 'No account linked'}
              </div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Sync Status</span>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 capitalize">
                {googleCalendar.syncStatus}
              </div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Synced Events</span>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {googleCalendar.syncedEventCount} events
              </div>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Safe One-Way Calendar Push</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
              When you approve a filming or editing task in the Content Calendar, AI Creator OS pushes the time-slot into your Google Calendar. The application tracks the Google Event ID against the calendar entry to prevent duplicate event creation. External personal events on your calendar are never read, stored, or deleted.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800">
            {googleCalendar.isConnected ? (
              <>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Last synchronized: {googleCalendar.lastSyncedAt || 'Just now'}
                </div>
                <Button onClick={disconnectGoogleCalendar} variant="danger" size="sm">
                  Disconnect Google Calendar
                </Button>
              </>
            ) : (
              <>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Click below to authorize calendar access via official Google OAuth consent.
                </div>
                <a
                  href="/api/calendar/google"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Connect Google Calendar
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Appearance */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Theme & Visual Experience</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select your preferred color scheme. Seamless light and dark mode with neutral contrast.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'light',
                title: 'Clean Light',
                desc: 'Warm neutral surfaces with crisp typography and subtle borders.',
                bgClass: 'bg-white border-neutral-200 text-neutral-900',
              },
              {
                id: 'dark',
                title: 'Deep Dark',
                desc: 'High-contrast dark neutrals for low eye strain during evening writing.',
                bgClass: 'bg-neutral-950 border-neutral-800 text-neutral-100',
              },
              {
                id: 'system',
                title: 'System Automatic',
                desc: 'Automatically matches your operating system preference.',
                bgClass: 'bg-gradient-to-r from-neutral-100 to-neutral-900 border-neutral-300 text-neutral-800',
              },
            ].map((th) => {
              const isSelected = theme === th.id;
              return (
                <div
                  key={th.id}
                  onClick={() => setTheme(th.id as 'light' | 'dark' | 'system')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900 dark:ring-neutral-100 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className={`h-16 rounded-lg mb-3 border ${th.bgClass} flex items-center justify-center font-bold text-xs`}>
                    {th.title} Preview
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">{th.title}</div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">{th.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Data Persistence, Export & Backups</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                You own 100% of your data. Export everything to JSON/CSV or restore from a backup.
              </p>
            </div>

            {/* Export & Import Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Export Full Database (JSON)</div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                    Complete backup including ideas, scripts, research records, style profile, and growth snapshots.
                  </p>
                </div>
                <Button onClick={handleExportJSON} variant="outline" size="sm">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download JSON
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Export Summary (CSV)</div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                    Tabular summary of ideas, pillars, production times, and manual growth snapshots.
                  </p>
                </div>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download CSV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Import from Backup (JSON)</div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                    Restore previous workspaces or load shared templates into your system.
                  </p>
                </div>
                <Button onClick={() => setImportModalOpen(true)} variant="outline" size="sm">
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Import JSON
                </Button>
              </div>
            </div>

            {/* Destructive Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">Danger Zone</h3>

              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">Reset to Starter Demo Dataset</span>
                  <p className="text-amber-700 dark:text-amber-400 text-[11px] mt-0.5">
                    Restores initial curated ideas, sample scripts, and research records across all 6 content pillars.
                  </p>
                </div>
                <Button onClick={() => setConfirmResetOpen(true)} variant="outline" size="sm" className="border-amber-300 text-amber-900">
                  Reset Starter Data
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-200 block">Purge All Workspace Data</span>
                  <p className="text-rose-700 dark:text-rose-400 text-[11px] mt-0.5">
                    Permanently wipes all local scripts, ideas, competitor observations, and manual snapshots. Requires confirmation.
                  </p>
                </div>
                <Button onClick={() => setConfirmClearOpen(true)} variant="danger" size="sm">
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete All Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Import Workspace JSON</h3>
              <button onClick={() => setImportModalOpen(false)}>
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Paste the exported JSON backup text below to restore your records.
            </p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent rounded-lg font-mono text-xs"
            />
            {importResult && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  importResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {importResult.message}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setImportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleImportSubmit}>
                Confirm Import
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Reset to Starter Data?</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              This will overwrite current records with the clean starter template covering all 6 content pillars. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmResetOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  resetToDefaultData();
                  setConfirmResetOpen(false);
                  triggerSaved();
                }}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Purge All Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-rose-600">Purge All Workspace Data?</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              This action cannot be undone. All your ideas, scripts, manual metrics, research notes, and calendars will be deleted from browser storage.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmClearOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  clearAllUserData();
                  setConfirmClearOpen(false);
                  triggerSaved();
                }}
              >
                Yes, Permanently Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
