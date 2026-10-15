'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CarouselProject, StorySequence, ContentPillar, CONTENT_PILLARS } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  X,
} from 'lucide-react';

function CarouselStudioContent() {
  const searchParams = useSearchParams();
  const {
    carousels,
    addCarouselProject,
    updateCarouselProject,
    deleteCarouselProject,
    stories,
    addStorySequence,
    updateStorySequence,
    deleteStorySequence,
    addCalendarEntry,
    preferences,
    aiConfig,
    addIdea,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'carousel' | 'stories'>('carousel');
  const [activeCarouselId, setActiveCarouselId] = useState<string>(carousels[0]?.id || '');
  const [activeStoryId, setActiveStoryId] = useState<string>(stories[0]?.id || '');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Generator Modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genType, setGenType] = useState<'carousel' | 'story'>('carousel');
  const [genTopic, setGenTopic] = useState('');
  const [genPillar, setGenPillar] = useState<ContentPillar>('BUILDING_PROJECTS_AND_SYSTEMS');
  const [genSlideCount, setGenSlideCount] = useState<number>(5);
  const [genStoryObjective, setGenStoryObjective] = useState<StorySequence['objective']>('progress');

  // Sync from URL search params (?id=...&tab=...)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const idParam = searchParams.get('id');

    if (tabParam === 'stories') {
      setActiveTab('stories');
    } else if (tabParam === 'carousel') {
      setActiveTab('carousel');
    }

    if (idParam) {
      const foundCarousel = carousels.find((c) => c.id === idParam);
      if (foundCarousel) {
        setActiveCarouselId(idParam);
        setActiveTab('carousel');
        setCurrentSlideIndex(0);
        return;
      }
      const foundStory = stories.find((s) => s.id === idParam);
      if (foundStory) {
        setActiveStoryId(idParam);
        setActiveTab('stories');
        return;
      }
    }
  }, [searchParams, carousels, stories]);

  // Keep active carousel / story valid if items list updates
  useEffect(() => {
    if (carousels.length > 0 && !carousels.some((c) => c.id === activeCarouselId)) {
      setActiveCarouselId(carousels[0].id);
      setCurrentSlideIndex(0);
    }
  }, [carousels, activeCarouselId]);

  useEffect(() => {
    if (stories.length > 0 && !stories.some((s) => s.id === activeStoryId)) {
      setActiveStoryId(stories[0].id);
    }
  }, [stories, activeStoryId]);

  // Carousel builder states
  const activeCarousel = carousels.find((c) => c.id === activeCarouselId) || carousels[0];
  const activeStory = stories.find((s) => s.id === activeStoryId) || stories[0];

  const handleCopyCaption = () => {
    if (!activeCarousel) return;
    navigator.clipboard.writeText(activeCarousel.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCreateBlankCarousel = () => {
    const newProj = addCarouselProject({
      title: '5 Ways to Optimize Your Web Development Workflow',
      pillar: 'BUILDING_PROJECTS_AND_SYSTEMS',
      intendedAudience: 'Software engineers & solo founders',
      coverSlide: {
        headline: '5 High-Friction Web Dev Bottlenecks (And How to Fix Them)',
        subtitle: 'Practical architecture takeaways from building production tools.',
        visualNotes: 'Dark card with high-contrast numbered badges.',
      },
      slides: [
        {
          slideNumber: 1,
          headline: '1. Standardize Data Models First',
          body: 'Never write UI components before standardizing TypeScript interfaces or schema migrations.',
          visualDirection: 'Code snippet showing typed interface vs untyped any.',
          supportingExample: 'Over 80% of edge-case bugs stem from unvalidated inputs or premature complexity.',
        },
        {
          slideNumber: 2,
          headline: '2. Isolate Latency in Local Testing',
          body: 'Test network requests with throttling to identify render blocking waterfalls early.',
          visualDirection: 'DevTools network waterfall graphic.',
          supportingExample: 'Standardizing inputs saves 10x more time than premature optimization.',
        },
      ],
      finalTakeaway: 'Standardizing inputs saves 10x more time than premature optimization.',
      callToAction: 'Save this carousel for your next project sprint!',
      caption: 'A practical breakdown of web dev bottlenecks. Save this post! 🚀\n\n#webdev #buildinpublic #creatoros',
      researchReferences: ['Web standards & DevTools documentation'],
      status: 'draft',
    });
    setActiveCarouselId(newProj.id);
    setCurrentSlideIndex(0);
    setToastMessage(`Created new carousel draft: "${newProj.title}"`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateStorySequence = (objective: StorySequence['objective']) => {
    const titles: Record<StorySequence['objective'], string> = {
      progress: 'Sprint Progress Check-in',
      question: 'Audience Technical Question',
      lesson: 'Sales Call Reflection',
      bts: 'Behind the Scenes Build Sprint',
      research: 'New Open-Source Finding',
      feedback: 'Landing Page Feedback Poll',
      funnel: 'Directing Viewers to New Reel',
    };

    const newStory = addStorySequence({
      title: titles[objective] || 'New Story Sequence',
      objective,
      frames: [
        { frameNumber: 1, type: 'talking_head', content: 'Sharing quick context on what I built today.', stickerText: 'Day 12 Update' },
        { frameNumber: 2, type: 'bts', content: 'Screen capture of the working code or wireframe.', stickerText: 'In Progress 🛠️' },
        { frameNumber: 3, type: 'poll', content: 'Would you rather self-host OR pay a monthly SaaS for this?', stickerText: 'Poll: Self-host vs SaaS' },
      ],
    });
    setActiveStoryId(newStory.id);
    setToastMessage(`Created new story sequence: "${newStory.title}"`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: genType,
          topic: genTopic || 'Practical Web Engineering & Architecture',
          pillar: genPillar,
          slideCount: genSlideCount,
          storyObjective: genStoryObjective,
          targetAudience: preferences.targetAudience,
          aiConfig,
        }),
      });

      const data = await res.json();
      if (data.project) {
        if (genType === 'carousel') {
          const newProj = addCarouselProject(data.project);
          addIdea({
            title: newProj.title,
            pillar: newProj.pillar,
            topic: newProj.title,
            targetAudience: preferences.targetAudience,
            format: 'CAROUSEL',
            hook: newProj.coverSlide.headline,
            mainAngle: newProj.coverSlide.subtitle,
            estimatedProductionTime: 45,
            priority: 'High',
            status: 'Ready to Publish',
            isAiGenerated: true,
            relatedCarouselIds: [newProj.id],
          });
          setActiveCarouselId(newProj.id);
          setCurrentSlideIndex(0);
          setActiveTab('carousel');
          setToastMessage(`Generated ${newProj.slides.length + 1}-slide carousel: "${newProj.title}"`);
        } else {
          const newStory = addStorySequence(data.project);
          addIdea({
            title: newStory.title,
            pillar: 'BUILD_IN_PUBLIC_AND_JOURNEY',
            topic: newStory.title,
            targetAudience: preferences.targetAudience,
            format: 'STORY',
            hook: newStory.frames[0]?.content || 'Story update',
            mainAngle: '5-frame interactive story sequence.',
            estimatedProductionTime: 25,
            priority: 'High',
            status: 'Ready to Publish',
            isAiGenerated: true,
            relatedStoryIds: [newStory.id],
          });
          setActiveStoryId(newStory.id);
          setActiveTab('stories');
          setToastMessage(`Generated ${newStory.frames.length}-frame story sequence: "${newStory.title}"`);
        }
        setGenerateModalOpen(false);
        setGenTopic('');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Could not connect to AI generator. Please check your setup.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleCarousel = () => {
    if (!activeCarousel) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    addCalendarEntry({
      title: activeCarousel.title,
      plannedDate: tomorrow.toISOString().split('T')[0],
      plannedTime: '18:00',
      format: 'CAROUSEL',
      pillar: activeCarousel.pillar,
      stage: 'Editing',
      status: 'Ready to Publish',
      notes: `Cover: "${activeCarousel.coverSlide.headline}"`,
    });
    setToastMessage(`Scheduled "${activeCarousel.title}" in calendar!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteCarousel = (id: string) => {
    const remaining = carousels.filter((c) => c.id !== id);
    deleteCarouselProject(id);
    if (remaining.length > 0) {
      setActiveCarouselId(remaining[0].id);
      setCurrentSlideIndex(0);
    } else {
      setActiveCarouselId('');
    }
    setToastMessage('Deleted carousel project');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteStory = (id: string) => {
    const remaining = stories.filter((s) => s.id !== id);
    deleteStorySequence(id);
    if (remaining.length > 0) {
      setActiveStoryId(remaining[0].id);
    } else {
      setActiveStoryId('');
    }
    setToastMessage('Deleted story sequence');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Carousel & Stories Studio
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              Planning Workspace
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
            Design high-retention slide decks and intentional Instagram Story sequences for behind-the-scenes work, questions, and post funnels. Zero auto-publishing or Meta account access required.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              setGenType(activeTab === 'stories' ? 'story' : 'carousel');
              setGenerateModalOpen(true);
            }}
            variant="outline"
            size="sm"
            className="text-xs border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer font-semibold"
            title="Generate a multi-slide carousel or story sequence with AI"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600 dark:text-purple-400" />
            Generate with AI
          </Button>

          {activeTab === 'carousel' ? (
            <div className="flex items-center gap-2 flex-wrap">
              {carousels.length > 1 && (
                <select
                  value={activeCarousel?.id}
                  onChange={(e) => {
                    setActiveCarouselId(e.target.value);
                    setCurrentSlideIndex(0);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer max-w-[180px] truncate"
                >
                  {carousels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
              <Button onClick={handleCreateBlankCarousel} variant="primary" size="sm" className="text-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Carousel
              </Button>
              {activeCarousel && (
                <Button
                  onClick={() => handleDeleteCarousel(activeCarousel.id)}
                  variant="outline"
                  size="sm"
                  className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 cursor-pointer"
                  title="Delete this carousel project"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" /> Delete
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {stories.length > 1 && (
                <select
                  value={activeStory?.id}
                  onChange={(e) => setActiveStoryId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer max-w-[180px] truncate"
                >
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              )}
              <Button onClick={() => handleCreateStorySequence('progress')} variant="primary" size="sm" className="text-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Story Sequence
              </Button>
              {activeStory && (
                <Button
                  onClick={() => handleDeleteStory(activeStory.id)}
                  variant="outline"
                  size="sm"
                  className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 cursor-pointer"
                  title="Delete this story sequence"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" /> Delete
                </Button>
              )}
            </div>
          )}
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

      {/* Workspace Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('carousel')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'carousel'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Carousel Slide Builder ({carousels.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stories'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Stories Sequence Planner ({stories.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CAROUSEL BUILDER */}
      {activeTab === 'carousel' && (
        activeCarousel ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slide Interactive Preview & Editor (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
                {/* Carousel Title & Pillar selector */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={activeCarousel.title}
                      onChange={(e) => updateCarouselProject(activeCarousel.id, { title: e.target.value })}
                      className="w-full text-base font-bold text-neutral-900 dark:text-neutral-100 bg-transparent border-none focus:outline-none"
                    />
                    <span className="text-[11px] text-neutral-400">
                      Updated {formatDate(activeCarousel.updatedAt)} • Total Slides: {activeCarousel.slides.length + 1}
                    </span>
                  </div>

                  <Button onClick={handleScheduleCarousel} variant="outline" size="sm" className="text-xs">
                    Schedule in Calendar
                  </Button>
                </div>

                {/* Visual Slide Frame Preview (Square / 4:5 simulation) */}
                <div className="bg-neutral-900 text-white rounded-2xl p-8 sm:p-12 aspect-[4/5] sm:aspect-[1/1] max-h-[460px] flex flex-col justify-between shadow-lg relative border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>SWIPE ➔</span>
                    <span>
                      Slide {currentSlideIndex === 0 ? 'COVER' : `${currentSlideIndex} of ${activeCarousel.slides.length}`}
                    </span>
                  </div>

                  {currentSlideIndex === 0 ? (
                    <div className="space-y-4 my-auto text-center px-4">
                      <Badge variant="purple" className="text-xs uppercase tracking-wider mx-auto">
                        Carousel Breakdown
                      </Badge>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
                        {activeCarousel.coverSlide.headline}
                      </h2>
                      <p className="text-sm text-neutral-300 max-w-md mx-auto">
                        {activeCarousel.coverSlide.subtitle}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 my-auto px-4">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                        Slide #{currentSlideIndex}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        {activeCarousel.slides[currentSlideIndex - 1]?.headline}
                      </h3>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {activeCarousel.slides[currentSlideIndex - 1]?.body}
                      </p>
                      {activeCarousel.slides[currentSlideIndex - 1]?.supportingExample && (
                        <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-xs text-neutral-300 mt-2">
                          <span className="font-semibold text-neutral-400 block mb-0.5">Real-World Case / Example:</span>
                          <span>{activeCarousel.slides[currentSlideIndex - 1]?.supportingExample}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer of slide */}
                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-4 border-t border-neutral-800">
                    <span className="font-semibold text-neutral-300">@solo.builder</span>
                    <span>{activeCarousel.callToAction.slice(0, 35)}...</span>
                  </div>
                </div>

                {/* Slide Navigation Controls */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    variant="outline"
                    size="sm"
                    disabled={currentSlideIndex === 0}
                    className="text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Previous Slide
                  </Button>

                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      onClick={() => setCurrentSlideIndex(0)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer ${
                        currentSlideIndex === 0
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      C
                    </button>
                    {activeCarousel.slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlideIndex(i + 1)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer ${
                          currentSlideIndex === i + 1
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentSlideIndex(Math.min(activeCarousel.slides.length, currentSlideIndex + 1))}
                    variant="outline"
                    size="sm"
                    disabled={currentSlideIndex === activeCarousel.slides.length}
                    className="text-xs"
                  >
                    Next Slide
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Slide Text Content Editor (1 col) */}
            <div className="space-y-4 text-xs">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                  {currentSlideIndex === 0 ? 'Edit Cover Slide' : `Edit Slide #${currentSlideIndex}`}
                </h3>

                {currentSlideIndex === 0 ? (
                  <div className="space-y-3">
                    <div>
                      <label className="font-semibold text-neutral-500 block mb-1">Cover Headline:</label>
                      <input
                        type="text"
                        value={activeCarousel.coverSlide.headline}
                        onChange={(e) =>
                          updateCarouselProject(activeCarousel.id, {
                            coverSlide: { ...activeCarousel.coverSlide, headline: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-500 block mb-1">Subtitle / Reason to Read:</label>
                      <textarea
                        rows={2}
                        value={activeCarousel.coverSlide.subtitle}
                        onChange={(e) =>
                          updateCarouselProject(activeCarousel.id, {
                            coverSlide: { ...activeCarousel.coverSlide, subtitle: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="font-semibold text-neutral-500 block mb-1">Slide Headline:</label>
                      <input
                        type="text"
                        value={activeCarousel.slides[currentSlideIndex - 1]?.headline || ''}
                        onChange={(e) => {
                          const updated = [...activeCarousel.slides];
                          updated[currentSlideIndex - 1].headline = e.target.value;
                          updateCarouselProject(activeCarousel.id, { slides: updated });
                        }}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-500 block mb-1">Slide Body Copy:</label>
                      <textarea
                        rows={3}
                        value={activeCarousel.slides[currentSlideIndex - 1]?.body || ''}
                        onChange={(e) => {
                          const updated = [...activeCarousel.slides];
                          updated[currentSlideIndex - 1].body = e.target.value;
                          updateCarouselProject(activeCarousel.id, { slides: updated });
                        }}
                        className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-500 block mb-1">Visual Direction / Example:</label>
                      <textarea
                        rows={2}
                        value={activeCarousel.slides[currentSlideIndex - 1]?.visualDirection || ''}
                        onChange={(e) => {
                          const updated = [...activeCarousel.slides];
                          updated[currentSlideIndex - 1].visualDirection = e.target.value;
                          updateCarouselProject(activeCarousel.id, { slides: updated });
                        }}
                        className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Post Caption & CTA */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Post Caption</h3>
                  <button
                    onClick={handleCopyCaption}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={activeCarousel.caption}
                  onChange={(e) => updateCarouselProject(activeCarousel.id, { caption: e.target.value })}
                  className="w-full p-2.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
            <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">No carousel projects yet</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Create your first multi-slide carousel using AI generation or start from a blank slide template.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => {
                  setGenType('carousel');
                  setGenerateModalOpen(true);
                }}
                variant="primary"
                size="sm"
                className="text-xs cursor-pointer font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate Carousel with AI
              </Button>
              <Button onClick={handleCreateBlankCarousel} variant="outline" size="sm" className="text-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5 mr-1" /> Blank Template
              </Button>
            </div>
          </div>
        )
      )}

      {/* TAB 2: STORIES PLANNER */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          {/* Preset Story Sequence Templates */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Quick Story Sequence Frameworks:
              </h3>
              <Button
                onClick={() => {
                  setGenType('story');
                  setGenerateModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="text-xs border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-pink-600 dark:text-pink-400" />
                Generate Stories with AI
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              {[
                { type: 'progress', label: '1. Project Progress' },
                { type: 'question', label: '2. Ask a Question' },
                { type: 'lesson', label: '3. Explain Lesson' },
                { type: 'bts', label: '4. Behind the Scenes' },
                { type: 'research', label: '5. Share Research' },
                { type: 'feedback', label: '6. Collect Feedback' },
                { type: 'funnel', label: '7. Direct to Reel' },
              ].map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => handleCreateStorySequence(tmpl.type as StorySequence['objective'])}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800 hover:border-neutral-400 text-left cursor-pointer transition-colors"
                >
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-xs">{tmpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Story Sequence Viewer */}
          {activeStory && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {activeStory.title}
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    Objective: {activeStory.objective.toUpperCase()} • {activeStory.frames.length} Story Frames
                  </span>
                </div>

                <button
                  onClick={() => deleteStorySequence(activeStory.id)}
                  className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Delete story sequence"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Story 9:16 Frames Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeStory.frames.map((frame, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-neutral-900 text-white rounded-2xl aspect-[9/16] flex flex-col justify-between border border-neutral-800 shadow-md relative"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Story #{frame.frameNumber}</span>
                      <Badge variant="outline" className="text-[10px] text-neutral-300 border-neutral-700 py-0">
                        {frame.type}
                      </Badge>
                    </div>

                    <div className="space-y-3 my-auto">
                      <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                        {frame.content}
                      </p>
                      {frame.stickerText && (
                        <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-center font-bold text-xs text-purple-300">
                          {frame.stickerText}
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-neutral-500 font-mono text-center">
                      Interactive Element Overlay
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI GENERATION MODAL */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  AI Carousel & Stories Generator
                </h3>
              </div>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGenerateAI} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Format Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenType('carousel')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                      genType === 'carousel'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Carousel Deck (4:5)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenType('story')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                      genType === 'story'
                        ? 'border-pink-600 bg-pink-50/50 dark:bg-pink-950/30 text-pink-900 dark:text-pink-200 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span>Stories Sequence (9:16)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Topic Prompt
                </label>
                <input
                  type="text"
                  placeholder={
                    genType === 'carousel'
                      ? 'e.g. 5 Costly Web Dev Architecture Mistakes'
                      : 'e.g. Behind the Scenes of Today\'s Cold Outreach'
                  }
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Content Pillar
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

              {genType === 'carousel' ? (
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Slide Count
                  </label>
                  <select
                    value={genSlideCount}
                    onChange={(e) => setGenSlideCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value={4}>4 Slides (Fast Takeaway)</option>
                    <option value={5}>5 Slides (Standard Deep-Dive)</option>
                    <option value={7}>7 Slides (Comprehensive Audit)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Story Objective
                  </label>
                  <select
                    value={genStoryObjective}
                    onChange={(e) => setGenStoryObjective(e.target.value as StorySequence['objective'])}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="progress">1. Sprint Progress Check-in</option>
                    <option value="question">2. Ask Audience Technical Question</option>
                    <option value="bts">3. Behind the Scenes Work</option>
                    <option value="lesson">4. Explain Sales / Tech Lesson</option>
                    <option value="feedback">5. Collect Feedback Poll</option>
                    <option value="funnel">6. Direct Viewers to Reel</option>
                  </select>
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
                  {genType === 'carousel' ? 'Generate Carousel Slides' : 'Generate Story Sequence'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CarouselStudioPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400 font-mono">Loading Carousel & Stories Studio...</div>}>
      <CarouselStudioContent />
    </Suspense>
  );
}
