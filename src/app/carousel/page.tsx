'use client';

import React, { useState } from 'react';
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
  MessageSquare,
  ArrowRight,
  Edit,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function CarouselStudioPage() {
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'carousel' | 'stories'>('carousel');
  const [activeCarouselId, setActiveCarouselId] = useState<string>(carousels[0]?.id || '');
  const [activeStoryId, setActiveStoryId] = useState<string>(stories[0]?.id || '');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [copiedCaption, setCopiedCaption] = useState(false);

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
        },
        {
          slideNumber: 2,
          headline: '2. Isolate Latency in Local Testing',
          body: 'Test network requests with throttling to identify render blocking waterfalls early.',
          visualDirection: 'DevTools network waterfall graphic.',
        },
      ],
      finalTakeaway: 'Standardizing inputs saves 10x more time than premature optimization.',
      callToAction: 'Save this carousel for your next project sprint!',
      caption: 'A practical breakdown of web dev bottlenecks. Save this post! 🚀',
      researchReferences: ['Web standards & DevTools documentation'],
      status: 'draft',
    });
    setActiveCarouselId(newProj.id);
    setCurrentSlideIndex(0);
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

        <div className="flex items-center gap-2">
          {activeTab === 'carousel' ? (
            <Button onClick={handleCreateBlankCarousel} variant="primary" size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Carousel
            </Button>
          ) : (
            <Button onClick={() => handleCreateStorySequence('progress')} variant="primary" size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Story Sequence
            </Button>
          )}
        </div>
      </div>

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
      {activeTab === 'carousel' && activeCarousel && (
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
      )}

      {/* TAB 2: STORIES PLANNER */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          {/* Preset Story Sequence Templates */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Quick Story Sequence Frameworks:
            </h3>
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
    </div>
  );
}
