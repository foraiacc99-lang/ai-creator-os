'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentIdea, ContentFormat, ContentPillar, IdeaStatus, CONTENT_PILLARS } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Lightbulb,
  Plus,
  Sparkles,
  Search,
  Filter,
  FileEdit,
  Calendar,
  Star,
  Trash2,
  Clock,
  ArrowRight,
  X,
  Copy,
  Archive,
  AlertTriangle,
  ExternalLink,
  Bot,
  User,
  CheckCircle2,
  Layers,
  BookOpen,
} from 'lucide-react';

const STATUS_OPTIONS: IdeaStatus[] = [
  'Inbox',
  'Research Needed',
  'Ready to Script',
  'Script in Progress',
  'Ready to Shoot',
  'Shot',
  'Editing',
  'Ready to Publish',
  'Published',
  'Archived',
];

export default function IdeasPage() {
  const router = useRouter();
  const {
    ideas,
    addIdea,
    updateIdea,
    deleteIdea,
    duplicateIdea,
    createScriptFromIdea,
    createCarouselFromIdea,
    createStoryFromIdea,
    carousels,
    stories,
    addCalendarEntry,
    calendar,
    checkDuplicateIdea,
    preferences,
    aiConfig,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPillar, setFilterPillar] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [autoAddToStudio, setAutoAddToStudio] = useState(true);

  // Manual Form State
  const [title, setTitle] = useState('');
  const [pillar, setPillar] = useState<ContentPillar>('AI_TOOLS_AND_AUTOMATION');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState(preferences.targetAudience);
  const [format, setFormat] = useState<ContentFormat>('REELS');
  const [hook, setHook] = useState('');
  const [mainAngle, setMainAngle] = useState('');
  const [supportingResearch, setSupportingResearch] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [productionMinutes, setProductionMinutes] = useState(35);

  // Generator form
  const [genTopic, setGenTopic] = useState('');
  const [genPillar, setGenPillar] = useState<ContentPillar>('FREE_GITHUB_AND_DEV_TOOLS');
  const [genFormat, setGenFormat] = useState<ContentFormat>('REELS');

  // Filter ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.hook.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = filterPillar === 'ALL' || idea.pillar === filterPillar;
    const matchesStatus = filterStatus === 'ALL' || idea.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || idea.priority === filterPriority;
    return matchesSearch && matchesPillar && matchesStatus && matchesPriority;
  });

  const handleCreateIdea = (e: React.FormEvent, openInStudio: boolean = false) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Check duplicate detection
    const dup = checkDuplicateIdea(title);
    if (dup.isDuplicate) {
      setDuplicateWarning(dup.similarityReason || 'A similar title already exists in your library.');
      return;
    }

    const savedIdea = addIdea({
      title: title.trim(),
      pillar,
      topic: topic || title,
      targetAudience: targetAudience || 'Developers & Builders',
      format,
      hook: hook || `Stop doing ${topic || title} the hard way.`,
      mainAngle: mainAngle || 'Practical step-by-step demonstration.',
      supportingResearch,
      estimatedProductionTime: productionMinutes,
      priority,
      status: 'Inbox',
      isAiGenerated: false,
    });

    let studioTarget = '';
    if (format === 'CAROUSEL' && autoAddToStudio) {
      const newProj = createCarouselFromIdea(savedIdea);
      studioTarget = `/carousel?id=${newProj.id}&tab=carousel`;
      setToastMessage(`Added idea and automatically created in Carousel Studio!`);
    } else if (format === 'STORY' && autoAddToStudio) {
      const newStory = createStoryFromIdea(savedIdea);
      studioTarget = `/carousel?id=${newStory.id}&tab=stories`;
      setToastMessage(`Added idea and automatically created in Stories Studio!`);
    } else if (format === 'REELS' && openInStudio) {
      const newScript = createScriptFromIdea(savedIdea);
      studioTarget = '/scripts';
      setToastMessage(`Added idea and initialized video script!`);
    } else {
      setToastMessage(`Added new idea: "${title.trim()}"`);
    }

    setTimeout(() => setToastMessage(null), 3500);
    setCreateModalOpen(false);
    resetForm();

    if (openInStudio && studioTarget) {
      router.push(studioTarget);
    }
  };

  const handleForceSaveDuplicate = (openInStudio: boolean = false) => {
    const savedIdea = addIdea({
      title: title.trim(),
      pillar,
      topic: topic || title,
      targetAudience: targetAudience || 'Developers & Builders',
      format,
      hook: hook || `Stop doing ${topic || title} the hard way.`,
      mainAngle: mainAngle || 'Practical step-by-step demonstration.',
      supportingResearch,
      estimatedProductionTime: productionMinutes,
      priority,
      status: 'Inbox',
      isAiGenerated: false,
    });

    let studioTarget = '';
    if (format === 'CAROUSEL' && autoAddToStudio) {
      const newProj = createCarouselFromIdea(savedIdea);
      studioTarget = `/carousel?id=${newProj.id}&tab=carousel`;
      setToastMessage(`Saved idea & created project in Carousel Studio!`);
    } else if (format === 'STORY' && autoAddToStudio) {
      const newStory = createStoryFromIdea(savedIdea);
      studioTarget = `/carousel?id=${newStory.id}&tab=stories`;
      setToastMessage(`Saved idea & created sequence in Stories Studio!`);
    } else {
      setToastMessage(`Saved idea: "${title.trim()}"`);
    }

    setTimeout(() => setToastMessage(null), 3500);
    setDuplicateWarning(null);
    setCreateModalOpen(false);
    resetForm();

    if (openInStudio && studioTarget) {
      router.push(studioTarget);
    }
  };

  const resetForm = () => {
    setTitle('');
    setTopic('');
    setHook('');
    setMainAngle('');
    setSupportingResearch('');
    setDuplicateWarning(null);
  };

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: genTopic || 'Practical AI & Web Engineering',
          pillar: genPillar,
          format: genFormat,
          targetAudience: preferences.targetAudience,
          tone: preferences.preferredTone,
          count: 3,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (data.ideas && data.ideas.length > 0) {
        let addedCount = 0;
        data.ideas.forEach((item: Partial<ContentIdea>, idx: number) => {
          // If title duplicates an existing item, differentiate rather than dropping
          const dup = checkDuplicateIdea(item.title || '');
          const finalTitle = dup.isDuplicate
            ? `${item.title || 'Practical Workflow'} (Angle ${idx + 1})`
            : (item.title || `Content Idea #${idx + 1}`);

          const newIdea = addIdea({
            ...(item as Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>),
            title: finalTitle,
            format: genFormat,
            isAiGenerated: true,
          });

          // Automatically add into the respective studio when Carousel or Story is chosen!
          if (genFormat === 'CAROUSEL') {
            createCarouselFromIdea(newIdea);
          } else if (genFormat === 'STORY') {
            createStoryFromIdea(newIdea);
          }

          addedCount++;
        });

        setGenerateModalOpen(false);
        if (genFormat === 'CAROUSEL') {
          setToastMessage(`Generated ${addedCount} ideas and automatically added them to Carousel Studio!`);
        } else if (genFormat === 'STORY') {
          setToastMessage(`Generated ${addedCount} ideas and automatically added them to Stories Studio!`);
        } else {
          setToastMessage(`Successfully generated ${addedCount} new ideas into your library!`);
        }
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setToastMessage('Idea generation completed. Check filters if not immediately visible.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Could not connect to idea generation. Using offline generator.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScriptIdea = (idea: ContentIdea) => {
    createScriptFromIdea(idea);
    router.push('/scripts');
  };

  const handleCarouselIdea = (idea: ContentIdea) => {
    const existing = carousels.find(
      (c) => (idea.relatedCarouselIds && idea.relatedCarouselIds.includes(c.id)) || c.title === idea.title
    );
    if (existing) {
      router.push(`/carousel?id=${existing.id}&tab=carousel`);
    } else {
      const newCarousel = createCarouselFromIdea(idea);
      router.push(`/carousel?id=${newCarousel.id}&tab=carousel`);
    }
  };

  const handleStoryIdea = (idea: ContentIdea) => {
    const existing = stories.find(
      (s) => (idea.relatedStoryIds && idea.relatedStoryIds.includes(s.id)) || s.title === idea.title
    );
    if (existing) {
      router.push(`/carousel?id=${existing.id}&tab=stories`);
    } else {
      const newStory = createStoryFromIdea(idea);
      router.push(`/carousel?id=${newStory.id}&tab=stories`);
    }
  };

  const handleScheduleIdea = (idea: ContentIdea) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = calendar.some((c) => c.plannedDate === todayStr);
    const dateToSchedule = hasToday
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          return d.toISOString().split('T')[0];
        })()
      : todayStr;

    addCalendarEntry({
      title: idea.title,
      plannedDate: dateToSchedule,
      plannedTime: '17:00',
      format: idea.format,
      pillar: idea.pillar,
      stage: 'Script',
      status: idea.status,
      ideaId: idea.id,
      notes: `Hook: "${idea.hook}"`,
      isSyncedToGoogle: false,
    });
    updateIdea(idea.id, { status: 'Ready to Script' });
    router.push('/calendar');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Content Ideas Library
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              {ideas.length} Saved
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Searchable, multi-pillar idea catalog with duplicate detection, priority ratings, and clear distinction between manual entries and AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setGenerateModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
            AI Generator
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
            variant="primary"
            size="sm"
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Content Idea
          </Button>
        </div>
      </div>

      {/* Action Toast Alert Banner */}
      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ideas by title, topic, or hook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Pillar Filter */}
            <select
              value={filterPillar}
              onChange={(e) => setFilterPillar(e.target.value)}
              className="px-2.5 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              <option value="ALL">All Pillars</option>
              {CONTENT_PILLARS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortTitle}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => {
          const pillarInfo = CONTENT_PILLARS.find((p) => p.id === idea.pillar);

          return (
            <div
              key={idea.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
            >
              <div className="space-y-2.5">
                {/* Meta header */}
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className="font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${pillarInfo?.color}18`, color: pillarInfo?.color }}
                  >
                    {pillarInfo?.shortTitle || idea.pillar}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {idea.isAiGenerated ? (
                      <span className="flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded font-medium">
                        <Bot className="w-3 h-3" /> AI
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-medium">
                        <User className="w-3 h-3" /> Manual
                      </span>
                    )}

                    <button
                      onClick={() => updateIdea(idea.id, { isFavorite: !idea.isFavorite })}
                      className="p-0.5 text-neutral-400 hover:text-amber-500 cursor-pointer"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          idea.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Title & Format */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {idea.format}
                    </Badge>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      ~{idea.estimatedProductionTime}m
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug">
                    {idea.title}
                  </h3>
                </div>

                {/* Opening Hook preview */}
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-700/80 text-xs text-neutral-700 dark:text-neutral-200">
                  <span className="font-semibold text-neutral-400 dark:text-neutral-400 block text-[10px] uppercase mb-0.5">Opening Hook:</span>
                  <p className="line-clamp-2 text-neutral-800 dark:text-neutral-200">&ldquo;{idea.hook}&rdquo;</p>
                </div>

                {/* Supporting research preview if present */}
                {idea.supportingResearch && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                    Research: {idea.supportingResearch}
                  </p>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <select
                  value={idea.status}
                  onChange={(e) => updateIdea(idea.id, { status: e.target.value as IdeaStatus })}
                  className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  {idea.format === 'CAROUSEL' ? (
                    <Button
                      onClick={() => handleCarouselIdea(idea)}
                      variant="primary"
                      size="sm"
                      className="text-xs h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs"
                      title="Open & build in Carousel Studio"
                    >
                      <Layers className="w-3 h-3 mr-1" />
                      Carousel Studio
                    </Button>
                  ) : idea.format === 'STORY' ? (
                    <Button
                      onClick={() => handleStoryIdea(idea)}
                      variant="primary"
                      size="sm"
                      className="text-xs h-7 px-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold cursor-pointer shadow-xs"
                      title="Open & plan in Stories Studio"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Stories Studio
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleScriptIdea(idea)}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 cursor-pointer"
                      title="Write Script"
                    >
                      <FileEdit className="w-3 h-3 mr-1 text-purple-600" />
                      Script
                    </Button>
                  )}

                  <Button
                    onClick={() => handleScheduleIdea(idea)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    title="Add to Calendar"
                  >
                    <Calendar className="w-3 h-3 text-neutral-500" />
                  </Button>

                  <button
                    onClick={() => {
                      duplicateIdea(idea.id);
                      setToastMessage(`Duplicated idea: "${idea.title}"`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
                    title="Duplicate Idea"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      deleteIdea(idea.id);
                      setToastMessage(`Deleted idea: "${idea.title}"`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Delete Idea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <Lightbulb className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            No content ideas match your current filter
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Try adjusting your search criteria, or click &ldquo;Add Content Idea&rdquo; to log your next topic.
          </p>
        </div>
      )}

      {/* CREATE MANUAL IDEA MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Add Content Idea (Manual)
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Duplicate Title Detected</span>
                </div>
                <p className="text-amber-700 dark:text-amber-300">{duplicateWarning}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => handleForceSaveDuplicate(false)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Save Anyway
                  </Button>
                  <Button
                    onClick={() => setDuplicateWarning(null)}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Change Title
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateIdea} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Free GitHub Repos for Local AI Developers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Content Pillar
                  </label>
                  <select
                    value={pillar}
                    onChange={(e) => setPillar(e.target.value as ContentPillar)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    {CONTENT_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.shortTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ContentFormat)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="REELS">Reels / Shorts (Vertical)</option>
                    <option value="CAROUSEL">Carousel (Slide Deck)</option>
                    <option value="STORY">Stories Sequence</option>
                  </select>
                </div>
              </div>

              {/* Studio Integration Info for Carousel & Story */}
              {format === 'CAROUSEL' && (
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Carousel & Stories Studio Integration</span>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                    A multi-slide deck with cover hook, problem analysis, architecture breakdown, and action CTA will be automatically created in your Carousel & Stories Studio.
                  </p>
                  <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={autoAddToStudio}
                      onChange={(e) => setAutoAddToStudio(e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Automatically add to Carousel & Stories Studio</span>
                  </label>
                </div>
              )}

              {format === 'STORY' && (
                <div className="p-3 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/80 dark:border-pink-800/60 text-xs text-pink-900 dark:text-pink-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <BookOpen className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span>Stories Sequence Planner Integration</span>
                  </div>
                  <p className="text-[11px] text-pink-700 dark:text-pink-300 leading-relaxed">
                    An interactive 5-frame sequence (talking head, behind the scenes, poll, Q&A box, resources link) will be automatically created in your Stories Studio.
                  </p>
                  <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={autoAddToStudio}
                      onChange={(e) => setAutoAddToStudio(e.target.checked)}
                      className="rounded border-pink-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                    />
                    <span>Automatically add to Carousel & Stories Studio</span>
                  </label>
                </div>
              )}

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Opening Hook
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stop paying $20/month for AI wrappers. Here is the local alternative."
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Main Angle & What is Demonstrated
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this angle is unique and what terminal/visual proof will appear on screen."
                  value={mainAngle}
                  onChange={(e) => setMainAngle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Est. Production Minutes
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={productionMinutes}
                    onChange={(e) => setProductionMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 flex-wrap">
                <Button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleCreateIdea(e, true)}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold"
                >
                  {format === 'CAROUSEL'
                    ? 'Save & Open in Carousel Studio ➔'
                    : format === 'STORY'
                    ? 'Save & Open in Stories Studio ➔'
                    : 'Save & Open in Script Studio ➔'}
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs font-semibold">
                  Save Idea
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI GENERATOR MODAL */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  AI Content Idea Generator
                </h3>
              </div>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGenerateIdeas} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Topic Prompt
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free local LLM tools for voice agents"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Pillar
                </label>
                <select
                  value={genPillar}
                  onChange={(e) => setGenPillar(e.target.value as ContentPillar)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                >
                  {CONTENT_PILLARS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.shortTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Format
                </label>
                <select
                  value={genFormat}
                  onChange={(e) => setGenFormat(e.target.value as ContentFormat)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                >
                  <option value="REELS">Reels / Shorts (Vertical)</option>
                  <option value="CAROUSEL">Carousel (Slide Deck)</option>
                  <option value="STORY">Stories Sequence</option>
                </select>
              </div>

              {genFormat === 'CAROUSEL' && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Generated ideas will automatically create slide decks in your Carousel Studio.</span>
                </div>
              )}

              {genFormat === 'STORY' && (
                <div className="p-2.5 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/80 dark:border-pink-800/60 text-[11px] text-pink-900 dark:text-pink-200 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Generated ideas will automatically create sequences in your Stories Studio.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isGenerating}
                  className="text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {genFormat === 'CAROUSEL'
                    ? 'Generate & Add to Carousel Studio'
                    : genFormat === 'STORY'
                    ? 'Generate & Add to Stories Studio'
                    : 'Generate 3 Ideas'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
