'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CarouselProject,
  CarouselSlide,
  CarouselContentBrief,
  StorySequence,
  ContentPillar,
  CONTENT_PILLARS,
} from '@/types';
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
  ExternalLink,
  Edit3,
  AlertTriangle,
  RotateCcw,
  FileText,
  Calendar,
  Search,
  Eye,
  RefreshCw,
  Globe,
  CheckCircle,
} from 'lucide-react';
import { ModelSelector } from '@/components/ai/model-selector';

type CreationStage =
  | 'idle'
  | 'understanding'
  | 'researching'
  | 'briefing'
  | 'generating'
  | 'checking'
  | 'completed'
  | 'failed';

const CREATION_STAGES: Array<{ key: CreationStage; label: string; desc: string }> = [
  { key: 'understanding', label: '1. Understanding Topic', desc: 'Analyzing topic nuances and target audience constraints' },
  { key: 'researching', label: '2. Researching Sources', desc: 'Querying public documentation and extracting verifiable findings' },
  { key: 'briefing', label: '3. Building Content Brief', desc: 'Constructing narrative angle and proposed slide outline' },
  { key: 'generating', label: '4. Writing Slides', desc: 'Composing slide headlines, body, visual cues, and examples' },
  { key: 'checking', label: '5. Checking Repetition', desc: 'Comparing against library to prevent accidental duplication' },
  { key: 'saving', label: '6. Saving Carousel', desc: 'Writing isolated carousel project record' },
] as unknown as Array<{ key: CreationStage; label: string; desc: string }>;

function CarouselStudioContent() {
  const searchParams = useSearchParams();
  const {
    carousels,
    addCarouselProject,
    updateCarouselProject,
    duplicateCarouselProject,
    renameCarouselProject,
    deleteCarouselProject,
    stories,
    addStorySequence,
    deleteStorySequence,
    addCalendarEntry,
    preferences,
    aiConfig,
    getModelForModule,
    addIdea,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'carousel' | 'stories'>('carousel');
  const [carouselViewMode, setCarouselViewMode] = useState<'editor' | 'library'>('editor');
  const [activeCarouselId, setActiveCarouselId] = useState<string>(carousels[0]?.id || '');
  const [activeStoryId, setActiveStoryId] = useState<string>(stories[0]?.id || '');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Library search & filter
  const [searchFilter, setSearchFilter] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');

  // Intake / Creation Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genPillar, setGenPillar] = useState<ContentPillar>('BUILDING_PROJECTS_AND_SYSTEMS');
  const [genAudience, setGenAudience] = useState(preferences.targetAudience || 'Developers, builders, and technical creators');
  const [genGoal, setGenGoal] = useState('Educate and provide actionable implementation steps');
  const [genAngle, setGenAngle] = useState('');
  const [genSlideCount, setGenSlideCount] = useState<number>(5);
  const [genRefUrl, setGenRefUrl] = useState('');
  const [genInstructions, setGenInstructions] = useState('');
  const [genStructure, setGenStructure] = useState<CarouselProject['structureType']>('Problem, Explanation, Solution');
  const [genWorkflowMode, setGenWorkflowMode] = useState<'direct' | 'review_brief'>('direct');

  // Pipeline Stepper State
  const [currentStage, setCurrentStage] = useState<CreationStage>('idle');
  const [pipelineProgressOpen, setPipelineProgressOpen] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Brief Review Modal State
  const [briefReviewOpen, setBriefReviewOpen] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<CarouselContentBrief | null>(null);
  const [pendingResearchSources, setPendingResearchSources] = useState<string[]>([]);
  const [pendingResearchSummary, setPendingResearchSummary] = useState<string>('');

  // Duplicate Overlap Warning Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    overlappingTitle?: string;
    similarityScore?: number;
    reason?: string;
    candidateProject?: CarouselProject;
  } | null>(null);

  // Research Details Drawer Modal
  const [researchDrawerOpen, setResearchDrawerOpen] = useState(false);

  // Rename Modal State
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Delete Confirm Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Regenerating single slide indicator
  const [isRegeneratingSlide, setIsRegeneratingSlide] = useState(false);

  // Stories generator state
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyTopic, setStoryTopic] = useState('');
  const [storyObjective, setStoryObjective] = useState<StorySequence['objective']>('progress');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

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
        setCarouselViewMode('editor');
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

  // Keep active carousel / story valid
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

  const activeCarousel = carousels.find((c) => c.id === activeCarouselId) || carousels[0];
  const activeStory = stories.find((s) => s.id === activeStoryId) || stories[0];

  const handleCopyCaption = () => {
    if (!activeCarousel) return;
    navigator.clipboard.writeText(activeCarousel.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Open creation modal with fresh clean form
  const handleOpenCreateModal = () => {
    setGenTopic('');
    setGenPillar('BUILDING_PROJECTS_AND_SYSTEMS');
    setGenAudience(preferences.targetAudience || 'Developers, builders, and technical creators');
    setGenGoal('Educate and provide actionable implementation steps');
    setGenAngle('');
    setGenSlideCount(5);
    setGenRefUrl('');
    setGenInstructions('');
    setGenStructure('Problem, Explanation, Solution');
    setGenWorkflowMode('direct');
    setCreateModalOpen(true);
  };

  // FULL PIPELINE GENERATOR (Steps 1 to 6)
  const handleExecutePipeline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!genTopic.trim()) {
      setToastMessage('Please enter a carousel topic or subject.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setCreateModalOpen(false);
    setPipelineProgressOpen(true);
    setStageError(null);
    setOfflineNotice(null);

    try {
      // Stage 1: Understanding topic
      setCurrentStage('understanding');
      await new Promise((r) => setTimeout(r, 600));

      // Stage 2: Researching sources
      setCurrentStage('researching');
      const selectedModel = getModelForModule('carousel');
      const carouselAiConfig = {
        ...aiConfig,
        model: selectedModel,
        omniRouteModel: selectedModel,
      };

      const researchRes = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'research',
          topic: genTopic,
          pillar: genPillar,
          targetAudience: genAudience,
          referenceUrl: genRefUrl,
          additionalInstructions: genInstructions,
          aiConfig: carouselAiConfig,
        }),
      });

      if (!researchRes.ok) {
        throw new Error(`Research step returned HTTP ${researchRes.status}`);
      }
      const researchData = await researchRes.json();
      const findings = researchData.research?.findings || [];
      const sources = researchData.research?.sources || [];
      const isLive = Boolean(researchData.research?.isResearched);

      if (!isLive) {
        setOfflineNotice('AI/Web Search is currently offline. Generating topic-specific content from verified domain patterns.');
      }
      setPendingResearchSources(sources);
      setPendingResearchSummary(researchData.research?.summary || findings.join('\n'));

      // Stage 3: Building Content Brief
      setCurrentStage('briefing');
      const briefRes = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'brief',
          topic: genTopic,
          pillar: genPillar,
          targetAudience: genAudience,
          goal: genGoal,
          angle: genAngle,
          slideCount: genSlideCount,
          referenceUrl: genRefUrl,
          additionalInstructions: genInstructions,
          structureType: genStructure,
          aiConfig: carouselAiConfig,
        }),
      });

      const briefData = await briefRes.json();
      const brief: CarouselContentBrief = briefData.contentBrief || {
        mainTopic: genTopic,
        specificAngle: genAngle || `A practical breakdown of ${genTopic}`,
        targetAudience: genAudience,
        intendedTakeaway: `Key principles and verified practices for ${genTopic}`,
        researchFindings: findings,
        sources,
        proposedOutline: Array.from({ length: genSlideCount }, (_, i) => `Step ${i + 1}: Strategy`),
      };
      setCurrentBrief(brief);

      // If user selected "Review Brief First", pause pipeline here and open brief editor
      if (genWorkflowMode === 'review_brief') {
        setPipelineProgressOpen(false);
        setBriefReviewOpen(true);
        return;
      }

      // Stage 4: Writing slides & visual cues
      await generateSlidesFromBrief(brief, sources, isLive);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Carousel creation pipeline failed:', error);
      setCurrentStage('failed');
      setStageError(error.message || 'Generation pipeline encountered an error.');
    }
  };

  // Continue generation from Content Brief
  const generateSlidesFromBrief = async (
    brief: CarouselContentBrief,
    sources: string[],
    isLiveResearched: boolean
  ) => {
    setCurrentStage('generating');
    setBriefReviewOpen(false);
    setPipelineProgressOpen(true);

    const selectedModel = getModelForModule('carousel');
    const carouselAiConfig = {
      ...aiConfig,
      model: selectedModel,
      omniRouteModel: selectedModel,
    };

    const generateRes = await fetch('/api/ai/generate-carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        topic: brief.mainTopic,
        pillar: genPillar,
        targetAudience: brief.targetAudience,
        goal: genGoal,
        angle: brief.specificAngle,
        slideCount: genSlideCount,
        referenceUrl: genRefUrl,
        additionalInstructions: genInstructions,
        structureType: genStructure,
        contentBrief: brief,
        existingCarousels: carousels,
        aiConfig: carouselAiConfig,
      }),
    });

    if (!generateRes.ok) {
      throw new Error(`Slide generation failed with HTTP ${generateRes.status}`);
    }

    const genData = await generateRes.json();
    const candidateProject: CarouselProject = genData.project;

    // Stage 5: Checking Repetition & Duplicates
    setCurrentStage('checking');
    await new Promise((r) => setTimeout(r, 400));

    if (genData.duplicateCheck && genData.duplicateCheck.isDuplicate) {
      setPipelineProgressOpen(false);
      setDuplicateWarning({
        overlappingTitle: genData.duplicateCheck.overlappingTitle,
        similarityScore: genData.duplicateCheck.similarityScore,
        reason: genData.duplicateCheck.reason,
        candidateProject,
      });
      setDuplicateModalOpen(true);
      return;
    }

    // Stage 6: Saving Carousel Project
    await saveNewCarouselProject(candidateProject);
  };

  const saveNewCarouselProject = async (project: CarouselProject) => {
    setCurrentStage('saving' as unknown as CreationStage);
    await new Promise((r) => setTimeout(r, 300));

    const newProj = addCarouselProject(project);

    // Also add to ideas repository so ideas & strategist stay synchronized
    addIdea({
      title: newProj.title,
      pillar: newProj.pillar,
      topic: newProj.topic || newProj.title,
      targetAudience: newProj.intendedAudience,
      format: 'CAROUSEL',
      hook: newProj.coverSlide.headline,
      mainAngle: newProj.coverSlide.subtitle,
      supportingResearch: newProj.researchSummary,
      sourceUrls: newProj.researchSources,
      estimatedProductionTime: 45,
      priority: 'High',
      status: 'Ready to Publish',
      isAiGenerated: true,
      relatedCarouselIds: [newProj.id],
    });

    setActiveCarouselId(newProj.id);
    setCurrentSlideIndex(0);
    setActiveTab('carousel');
    setCarouselViewMode('editor');
    setCurrentStage('completed');

    setToastMessage(`Created fresh carousel: "${newProj.title}"`);
    setTimeout(() => {
      setPipelineProgressOpen(false);
      setToastMessage(null);
    }, 1500);
  };

  // Regenerate Entire Active Carousel
  const handleRegenerateEntireDeck = async () => {
    if (!activeCarousel) return;
    setGenTopic(activeCarousel.topic || activeCarousel.title);
    setGenPillar(activeCarousel.pillar);
    setGenAudience(activeCarousel.intendedAudience);
    setGenGoal(activeCarousel.goal || 'Educate and provide actionable implementation steps');
    setGenAngle(activeCarousel.angle || '');
    setGenSlideCount(activeCarousel.slides.length);
    setGenRefUrl(activeCarousel.referenceUrl || '');
    setGenInstructions(activeCarousel.additionalInstructions || '');
    setGenStructure(activeCarousel.structureType || 'Problem, Explanation, Solution');
    setGenWorkflowMode('direct');

    setPipelineProgressOpen(true);
    setStageError(null);
    try {
      setCurrentStage('understanding');
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStage('researching');
      await new Promise((r) => setTimeout(r, 500));
      setCurrentStage('generating');

      const res = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pipeline',
          topic: activeCarousel.topic || activeCarousel.title,
          pillar: activeCarousel.pillar,
          targetAudience: activeCarousel.intendedAudience,
          goal: activeCarousel.goal,
          angle: activeCarousel.angle,
          slideCount: activeCarousel.slides.length,
          referenceUrl: activeCarousel.referenceUrl,
          additionalInstructions: activeCarousel.additionalInstructions,
          structureType: activeCarousel.structureType,
          existingCarousels: carousels.filter((c) => c.id !== activeCarousel.id),
          aiConfig,
        }),
      });

      const data = await res.json();
      if (data.project) {
        updateCarouselProject(activeCarousel.id, {
          title: data.project.title,
          topic: data.project.topic,
          coverSlide: data.project.coverSlide,
          slides: data.project.slides,
          finalTakeaway: data.project.finalTakeaway,
          callToAction: data.project.callToAction,
          caption: data.project.caption,
          researchReferences: data.project.researchReferences,
          researchSummary: data.project.researchSummary,
          researchSources: data.project.researchSources,
          contentBrief: data.project.contentBrief,
          isResearched: data.project.isResearched,
          researchOffline: data.project.researchOffline,
          updatedAt: new Date().toISOString(),
        });
        setCurrentSlideIndex(0);
        setCurrentStage('completed');
        setToastMessage(`Regenerated carousel deck: "${data.project.title}"`);
        setTimeout(() => {
          setPipelineProgressOpen(false);
          setToastMessage(null);
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setCurrentStage('failed');
      setStageError(error.message || 'Regeneration failed');
    }
  };

  // Regenerate a Single Slide
  const handleRegenerateCurrentSlide = async () => {
    if (!activeCarousel || currentSlideIndex === 0) return;
    setIsRegeneratingSlide(true);
    try {
      const res = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate-slide',
          topic: activeCarousel.topic || activeCarousel.title,
          pillar: activeCarousel.pillar,
          targetAudience: activeCarousel.intendedAudience,
          goal: activeCarousel.goal,
          slideNumber: currentSlideIndex,
          currentSlides: activeCarousel.slides,
          contentBrief: activeCarousel.contentBrief,
          aiConfig,
        }),
      });

      const data = await res.json();
      if (data.slide) {
        const updatedSlides = [...activeCarousel.slides];
        updatedSlides[currentSlideIndex - 1] = data.slide;
        updateCarouselProject(activeCarousel.id, { slides: updatedSlides });
        setToastMessage(`Regenerated Slide #${currentSlideIndex}!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Could not regenerate slide. Check connection.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsRegeneratingSlide(false);
    }
  };

  // Duplicate Carousel Intentionally
  const handleDuplicateCarousel = (id: string) => {
    try {
      const duplicated = duplicateCarouselProject(id);
      setActiveCarouselId(duplicated.id);
      setCurrentSlideIndex(0);
      setCarouselViewMode('editor');
      setToastMessage(`Duplicated carousel as "${duplicated.title}"`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  // Rename Carousel with explicit modal
  const handleOpenRenameModal = (id: string, currentTitle: string) => {
    setRenameTargetId(id);
    setRenameValue(currentTitle);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = () => {
    if (renameTargetId && renameValue.trim()) {
      renameCarouselProject(renameTargetId, renameValue.trim());
      setToastMessage(`Renamed carousel to "${renameValue.trim()}"`);
      setTimeout(() => setToastMessage(null), 3000);
    }
    setRenameModalOpen(false);
    setRenameTargetId(null);
  };

  // Delete with Confirmation
  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const remaining = carousels.filter((c) => c.id !== deleteConfirmId);
    deleteCarouselProject(deleteConfirmId);
    if (remaining.length > 0) {
      setActiveCarouselId(remaining[0].id);
      setCurrentSlideIndex(0);
    } else {
      setActiveCarouselId('');
    }
    setDeleteConfirmId(null);
    setToastMessage('Deleted carousel project.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calendar Scheduling
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

  // Story sequence generator
  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingStory(true);
    try {
      const selectedModel = getModelForModule('carousel');
      const res = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'story',
          topic: storyTopic || 'Practical Engineering Update',
          storyObjective,
          targetAudience: preferences.targetAudience,
          aiConfig: {
            ...aiConfig,
            model: selectedModel,
            omniRouteModel: selectedModel,
          },
        }),
      });

      const data = await res.json();
      if (data.project) {
        const newStory = addStorySequence(data.project);
        setActiveStoryId(newStory.id);
        setActiveTab('stories');
        setStoryModalOpen(false);
        setToastMessage(`Generated ${newStory.frames.length}-frame story sequence: "${newStory.title}"`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Could not generate story sequence.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Filtered Carousels for Library Grid
  const filteredCarousels = carousels.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.topic && c.topic.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesPillar = pillarFilter === 'all' || c.pillar === pillarFilter;
    return matchesSearch && matchesPillar;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Carousel Studio
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              Research-Backed Decks
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
            Design original, non-repetitive Instagram Carousels backed by topic-specific research, content briefs, and duplicate detection. Zero recycled templates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ModelSelector currentModule="carousel" />

          {activeTab === 'carousel' ? (
            <>
              <Button
                onClick={handleOpenCreateModal}
                variant="primary"
                size="sm"
                className="text-xs font-semibold cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create New Carousel
              </Button>

              <Button
                onClick={() => setCarouselViewMode(carouselViewMode === 'editor' ? 'library' : 'editor')}
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
              >
                {carouselViewMode === 'editor' ? (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1 text-purple-600" />
                    Library View ({carousels.length})
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5 mr-1 text-purple-600" />
                    Editor View
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setStoryModalOpen(true)}
              variant="primary"
              size="sm"
              className="text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Generate Story Sequence
            </Button>
          )}
        </div>
      </div>

      {/* Toast Alert Banner */}
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

      {/* Main Mode Tabs (Carousel Studio vs Stories Planner) */}
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
            <span>Carousel Slide Studio ({carousels.length})</span>
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

        {activeTab === 'carousel' && (
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setCarouselViewMode('editor')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                carouselViewMode === 'editor'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Slide Editor
            </button>
            <button
              onClick={() => setCarouselViewMode('library')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                carouselViewMode === 'library'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Library Grid
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAROUSEL STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'carousel' && (
        <>
          {/* LIBRARY GRID VIEW */}
          {carouselViewMode === 'library' ? (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-4 rounded-xl shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by topic or title..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={pillarFilter}
                    onChange={(e) => setPillarFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="all">All Content Pillars</option>
                    {CONTENT_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.shortTitle}
                      </option>
                    ))}
                  </select>

                  <Button onClick={handleOpenCreateModal} variant="primary" size="sm" className="text-xs shrink-0 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 mr-1" /> New
                  </Button>
                </div>
              </div>

              {/* Cards Grid */}
              {filteredCarousels.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
                  <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">No matching carousels found</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Try adjusting your search filters or click "Create New Carousel" to generate a fresh deck.
                  </p>
                  <Button onClick={handleOpenCreateModal} variant="primary" size="sm" className="text-xs font-semibold cursor-pointer">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Carousel
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCarousels.map((c) => {
                    const pillarMeta = CONTENT_PILLARS.find((p) => p.id === c.pillar);
                    const isSelected = c.id === activeCarouselId;
                    return (
                      <div
                        key={c.id}
                        className={`bg-white dark:bg-neutral-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-purple-500 dark:border-purple-600 ring-1 ring-purple-500/30'
                            : 'border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillarMeta?.badgeClass || 'bg-neutral-100 text-neutral-800'}`}>
                              {pillarMeta?.shortTitle || 'General'}
                            </span>
                            {c.isResearched ? (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Verified Research
                              </span>
                            ) : c.researchOffline ? (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Offline Knowledge Draft
                              </span>
                            ) : null}
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
                              {c.title}
                            </h3>
                            {c.topic && (
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                                Topic: {c.topic}
                              </p>
                            )}
                          </div>

                          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 space-y-1">
                            <div className="font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                              Cover: "{c.coverSlide.headline}"
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              Total Slides: <span className="font-bold text-neutral-700 dark:text-neutral-300">{c.slides.length + 1}</span> (Cover + {c.slides.length})
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 font-mono text-[10px]">
                            {c.createdAt ? formatDate(c.createdAt) : formatDate(c.updatedAt)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setActiveCarouselId(c.id);
                                setCurrentSlideIndex(0);
                                setCarouselViewMode('editor');
                              }}
                              className="px-2.5 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold cursor-pointer text-xs"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => handleOpenRenameModal(c.id, c.title)}
                              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
                              title="Rename Carousel"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateCarousel(c.id)}
                              className="p-1 text-neutral-400 hover:text-purple-600 rounded cursor-pointer"
                              title="Duplicate Carousel"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(c.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete Carousel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* SLIDE EDITOR VIEW */
            activeCarousel ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Slide Interactive Preview & Editor (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
                    {/* Header: Title, Pillar Badge, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                            {activeCarousel.title}
                          </h3>
                          <button
                            onClick={() => handleOpenRenameModal(activeCarousel.id, activeCarousel.title)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                            title="Rename carousel"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                          <span>Topic: {activeCarousel.topic || activeCarousel.title}</span>
                          <span>•</span>
                          <span>Total Slides: {activeCarousel.slides.length + 1}</span>
                          {activeCarousel.isResearched && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">• Researched</span>
                          )}
                          {activeCarousel.researchOffline && (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">• Offline Draft</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          onClick={() => setResearchDrawerOpen(true)}
                          variant="outline"
                          size="sm"
                          className="text-xs cursor-pointer"
                          title="View Research Findings & Content Brief"
                        >
                          <Globe className="w-3.5 h-3.5 mr-1 text-purple-600" />
                          Research & Brief
                        </Button>
                        <Button
                          onClick={handleRegenerateEntireDeck}
                          variant="outline"
                          size="sm"
                          className="text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
                          title="Regenerate whole carousel with fresh AI content"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          Regenerate Deck
                        </Button>
                        <Button
                          onClick={handleScheduleCarousel}
                          variant="outline"
                          size="sm"
                          className="text-xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Schedule
                        </Button>
                      </div>
                    </div>

                    {/* Visual Slide Frame Preview (4:5 simulation) */}
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
                        className="text-xs cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                          onClick={() => setCurrentSlideIndex(0)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
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
                            className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
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
                        className="text-xs cursor-pointer"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Slide Text Content Editor (1 col) */}
                <div className="space-y-4 text-xs">
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                        {currentSlideIndex === 0 ? 'Edit Cover Slide' : `Edit Slide #${currentSlideIndex}`}
                      </h3>

                      {currentSlideIndex > 0 && (
                        <button
                          onClick={handleRegenerateCurrentSlide}
                          disabled={isRegeneratingSlide}
                          className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                          title="Regenerate this specific slide with fresh angle"
                        >
                          <RotateCcw className={`w-3 h-3 ${isRegeneratingSlide ? 'animate-spin' : ''}`} />
                          <span>Regenerate Slide</span>
                        </button>
                      )}
                    </div>

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
                          <label className="font-semibold text-neutral-500 block mb-1">Subtitle / Value Hook:</label>
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
                          <label className="font-semibold text-neutral-500 block mb-1">Supporting Real-World Example:</label>
                          <textarea
                            rows={2}
                            value={activeCarousel.slides[currentSlideIndex - 1]?.supportingExample || ''}
                            onChange={(e) => {
                              const updated = [...activeCarousel.slides];
                              updated[currentSlideIndex - 1].supportingExample = e.target.value;
                              updateCarouselProject(activeCarousel.id, { slides: updated });
                            }}
                            className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-neutral-500 block mb-1">Visual Direction / Layout Cue:</label>
                          <input
                            type="text"
                            value={activeCarousel.slides[currentSlideIndex - 1]?.visualDirection || ''}
                            onChange={(e) => {
                              const updated = [...activeCarousel.slides];
                              updated[currentSlideIndex - 1].visualDirection = e.target.value;
                              updateCarouselProject(activeCarousel.id, { slides: updated });
                            }}
                            className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Caption & CTA */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Post Caption & Hashtags</h3>
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
              <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
                <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">No carousel selected</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click below to research and generate a brand-new carousel deck.
                </p>
                <Button onClick={handleOpenCreateModal} variant="primary" size="sm" className="text-xs font-semibold cursor-pointer">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create New Carousel
                </Button>
              </div>
            )
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STORIES PLANNER */}
      {/* ========================================================================= */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Quick Story Sequence Frameworks:
              </h3>
              <Button
                onClick={() => setStoryModalOpen(true)}
                variant="outline"
                size="sm"
                className="text-xs border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-pink-600 dark:text-pink-400" />
                Generate Story Sequence
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              {[
                { type: 'progress', label: '1. Project Progress' },
                { type: 'question', label: '2. Ask Question' },
                { type: 'lesson', label: '3. Explain Lesson' },
                { type: 'bts', label: '4. Behind Scenes' },
                { type: 'research', label: '5. Share Research' },
                { type: 'feedback', label: '6. Poll Feedback' },
                { type: 'funnel', label: '7. Direct to Reel' },
              ].map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => {
                    const newStory = addStorySequence({
                      title: `New ${tmpl.label} Sequence`,
                      objective: tmpl.type as StorySequence['objective'],
                      frames: [
                        { frameNumber: 1, type: 'talking_head', content: 'Sharing quick context on what I built today.', stickerText: 'Day 1 Update' },
                        { frameNumber: 2, type: 'bts', content: 'Screen capture of the working setup.', stickerText: 'In Progress 🛠️' },
                        { frameNumber: 3, type: 'poll', content: 'Would you rather self-host OR use a hosted API?', stickerText: 'Poll: Self-host vs SaaS' },
                      ],
                    });
                    setActiveStoryId(newStory.id);
                    setToastMessage(`Created story sequence: "${newStory.title}"`);
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800 hover:border-neutral-400 text-left cursor-pointer transition-colors"
                >
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-xs">{tmpl.label}</span>
                </button>
              ))}
            </div>
          </div>

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
                  onClick={() => {
                    deleteStorySequence(activeStory.id);
                    setToastMessage('Deleted story sequence');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Delete story sequence"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

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

      {/* ========================================================================= */}
      {/* MODAL 1: NEW CAROUSEL INTAKE FORM (Step 1 of Workflow) */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Create New Carousel Deck
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecutePipeline} className="space-y-3 text-xs">
              {/* Topic / Subject (Required) */}
              <div>
                <label className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                  Topic or Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Three repetitive tasks small businesses can automate using AI"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Any topic or content pillar: Cold calling, SEO, WhatsApp bot, Open-source tools, etc.
                </span>
              </div>

              {/* Content Pillar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Slide Count
                  </label>
                  <select
                    value={genSlideCount}
                    onChange={(e) => setGenSlideCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value={4}>4 Slides (Punchy Teardown)</option>
                    <option value={5}>5 Slides (Standard Deep-Dive)</option>
                    <option value={6}>6 Slides (Step-by-Step Tutorial)</option>
                    <option value={7}>7 Slides (Comprehensive Audit)</option>
                  </select>
                </div>
              </div>

              {/* Target Audience & Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Target Audience (Optional)
                  </label>
                  <input
                    type="text"
                    value={genAudience}
                    onChange={(e) => setGenAudience(e.target.value)}
                    placeholder="e.g. Small business owners, solo developers"
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Carousel Goal (Optional)
                  </label>
                  <select
                    value={genGoal}
                    onChange={(e) => setGenGoal(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="Educate and provide actionable implementation steps">Educate & Actionable Steps</option>
                    <option value="Overcome client objection on pricing or value">Overcome Pricing Objection</option>
                    <option value="Highlight common mistakes and provide practical fixes">Mistakes & Corrections</option>
                    <option value="Step-by-step tutorial walkthrough">Step-by-Step Tutorial</option>
                    <option value="Compare architectural trade-offs">Comparative Trade-offs</option>
                    <option value="Transparent build in public lesson">Build in Public Lesson</option>
                  </select>
                </div>
              </div>

              {/* Preferred Angle */}
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Preferred Angle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on ROI of inaction and phased milestone scopes"
                  value={genAngle}
                  onChange={(e) => setGenAngle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Reference URL & Additional Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Reference URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs... or https://github..."
                    value={genRefUrl}
                    onChange={(e) => setGenRefUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Narrative Structure
                  </label>
                  <select
                    value={genStructure}
                    onChange={(e) => setGenStructure(e.target.value as CarouselProject['structureType'])}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="Problem, Explanation, Solution">Problem → Explanation → Solution</option>
                    <option value="Mistake, Why it happens, Correction">Mistake → Why It Happens → Correction</option>
                    <option value="Tutorial, Prerequisites, Steps, Verification">Tutorial → Prerequisites → Verification</option>
                    <option value="Observation, Explanation, Practical Implication">Observation → Practical Implication</option>
                    <option value="Myth, Reality, Evidence, Lesson">Myth → Reality → Evidence → Lesson</option>
                  </select>
                </div>
              </div>

              {/* Workflow Mode Radio */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block">Creation Workflow:</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="workflowMode"
                      checked={genWorkflowMode === 'direct'}
                      onChange={() => setGenWorkflowMode('direct')}
                    />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">Direct Full Generation</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="workflowMode"
                      checked={genWorkflowMode === 'review_brief'}
                      onChange={() => setGenWorkflowMode('review_brief')}
                    />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">Review Brief First</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {genWorkflowMode === 'direct' ? 'Research & Generate Deck' : 'Start Research & Build Brief'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LIVE MULTI-STAGE PIPELINE PROGRESS STEPPER */}
      {/* ========================================================================= */}
      {pipelineProgressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-purple-600 ${currentStage !== 'completed' && currentStage !== 'failed' ? 'animate-spin' : ''}`} />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {currentStage === 'completed'
                    ? 'Carousel Successfully Created!'
                    : currentStage === 'failed'
                    ? 'Generation Encountered an Error'
                    : 'Generating Fresh Carousel Deck'}
                </h3>
              </div>
              {(currentStage === 'completed' || currentStage === 'failed') && (
                <button
                  onClick={() => setPipelineProgressOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="space-y-3">
              {CREATION_STAGES.map((s, idx) => {
                const stageOrder = ['understanding', 'researching', 'briefing', 'generating', 'checking', 'saving', 'completed'];
                const currentIndex = stageOrder.indexOf(currentStage);
                const itemIndex = stageOrder.indexOf(s.key);
                const isPassed = currentIndex > itemIndex || currentStage === 'completed';
                const isCurrent = currentStage === s.key;

                return (
                  <div
                    key={s.key}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs transition-colors ${
                      isCurrent
                        ? 'border-purple-500/80 bg-purple-50/50 dark:bg-purple-950/20 text-neutral-900 dark:text-neutral-100'
                        : isPassed
                        ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 text-neutral-700 dark:text-neutral-300'
                        : 'border-neutral-100 dark:border-neutral-800/80 text-neutral-400'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isPassed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700" />
                      )}
                    </div>

                    <div>
                      <span className={`font-bold block ${isCurrent ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                        {s.label}
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {s.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {offlineNotice && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                <span className="font-bold block mb-0.5">Offline Knowledge Draft:</span>
                <span>{offlineNotice}</span>
              </div>
            )}

            {stageError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-2">
                <span className="font-bold block">Error Encountered:</span>
                <p>{stageError}</p>
                <Button
                  onClick={() => handleExecutePipeline()}
                  variant="primary"
                  size="sm"
                  className="text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry Operation
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONTENT BRIEF REVIEW & EDIT (Step 4 of Workflow) */}
      {/* ========================================================================= */}
      {briefReviewOpen && currentBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Review & Refine Content Brief
                </h3>
              </div>
              <button
                onClick={() => setBriefReviewOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-600 block mb-1">Main Topic:</label>
                <input
                  type="text"
                  value={currentBrief.mainTopic}
                  onChange={(e) => setCurrentBrief({ ...currentBrief, mainTopic: e.target.value })}
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-600 block mb-1">Specific Content Angle:</label>
                <textarea
                  rows={2}
                  value={currentBrief.specificAngle}
                  onChange={(e) => setCurrentBrief({ ...currentBrief, specificAngle: e.target.value })}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-600 block mb-1">Target Audience:</label>
                  <input
                    type="text"
                    value={currentBrief.targetAudience}
                    onChange={(e) => setCurrentBrief({ ...currentBrief, targetAudience: e.target.value })}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-600 block mb-1">Intended Takeaway:</label>
                  <input
                    type="text"
                    value={currentBrief.intendedTakeaway}
                    onChange={(e) => setCurrentBrief({ ...currentBrief, intendedTakeaway: e.target.value })}
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-600 block mb-1">Key Research Findings:</label>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                  {currentBrief.researchFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-600 block mb-1">Authoritative Sources:</label>
                <div className="flex flex-wrap gap-1.5">
                  {currentBrief.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-purple-700 dark:text-purple-300 text-[10px] flex items-center gap-1 hover:underline font-mono"
                    >
                      <span>{src.replace(/^https?:\/\//, '').slice(0, 32)}...</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  onClick={() => setBriefReviewOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => generateSlidesFromBrief(currentBrief, pendingResearchSources, true)}
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Approve Brief & Write Slides
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DUPLICATE / OVERLAP WARNING MODAL */}
      {/* ========================================================================= */}
      {duplicateModalOpen && duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">Content Overlap Warning</h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {duplicateWarning.reason || 'This candidate carousel has significant content or headline similarity with a previously saved deck.'}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <span className="font-semibold block">Overlapping Deck:</span>
              <span className="font-bold">"{duplicateWarning.overlappingTitle}"</span>
              {duplicateWarning.similarityScore && (
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                  Similarity Score: {Math.round(duplicateWarning.similarityScore * 100)}%
                </span>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
              <Button
                onClick={() => setDuplicateModalOpen(false)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs cursor-pointer"
              >
                Discard Draft
              </Button>
              <Button
                onClick={() => {
                  setDuplicateModalOpen(false);
                  setGenAngle(`Different strategic perspective on ${genTopic}`);
                  handleExecutePipeline();
                }}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs border-purple-300 text-purple-700 dark:text-purple-300 cursor-pointer"
              >
                Change Angle & Regenerate
              </Button>
              {duplicateWarning.candidateProject && (
                <Button
                  onClick={() => {
                    setDuplicateModalOpen(false);
                    saveNewCarouselProject(duplicateWarning.candidateProject!);
                  }}
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
                >
                  Save Anyway
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RESEARCH & CONTENT BRIEF DETAILS DRAWER */}
      {/* ========================================================================= */}
      {researchDrawerOpen && activeCarousel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Research Findings & Content Brief
                </h3>
              </div>
              <button
                onClick={() => setResearchDrawerOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Topic & Narrative Angle:
                </span>
                <p className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {activeCarousel.contentBrief?.specificAngle || activeCarousel.angle || activeCarousel.coverSlide.subtitle}
                </p>
              </div>

              <div>
                <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Research Summary & Verifiable Claims:
                </span>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                  {activeCarousel.researchSummary ||
                    activeCarousel.contentBrief?.researchFindings?.join('\n• ') ||
                    'Generated from topic-specific domain principles.'}
                </div>
              </div>

              <div>
                <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Authoritative Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(activeCarousel.researchSources || activeCarousel.researchReferences || []).map((src, i) => (
                    <a
                      key={i}
                      href={src.startsWith('http') ? src : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono text-[10px] flex items-center gap-1 hover:underline"
                    >
                      <span>{src.replace(/^https?:\/\//, '').slice(0, 40)}</span>
                      {src.startsWith('http') && <ExternalLink className="w-2.5 h-2.5" />}
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setResearchDrawerOpen(false)}
                  variant="primary"
                  size="sm"
                  className="text-xs cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EXPLICIT RENAME MODAL */}
      {/* ========================================================================= */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Rename Carousel
            </h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold focus:outline-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <Button onClick={() => setRenameModalOpen(false)} variant="outline" size="sm" className="text-xs cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleConfirmRename} variant="primary" size="sm" className="text-xs font-semibold cursor-pointer">
                Save Name
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-4 h-4" />
              <h3 className="text-sm font-bold">Delete Carousel?</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this carousel project? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 text-xs">
              <Button onClick={() => setDeleteConfirmId(null)} variant="outline" size="sm" className="text-xs cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer">
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: STORIES GENERATOR MODAL */}
      {/* ========================================================================= */}
      {storyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Generate Stories Sequence
                </h3>
              </div>
              <button
                onClick={() => setStoryModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGenerateStory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Topic or Sprint Update
                </label>
                <input
                  type="text"
                  placeholder="e.g. Behind the scenes of testing local models"
                  value={storyTopic}
                  onChange={(e) => setStoryTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Story Objective
                </label>
                <select
                  value={storyObjective}
                  onChange={(e) => setStoryObjective(e.target.value as StorySequence['objective'])}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                >
                  <option value="progress">1. Sprint Progress Check-in</option>
                  <option value="question">2. Ask Audience Technical Question</option>
                  <option value="bts">3. Behind the Scenes Work</option>
                  <option value="lesson">4. Explain Sales / Tech Lesson</option>
                  <option value="feedback">5. Collect Feedback Poll</option>
                  <option value="funnel">6. Direct Viewers to Reel / Carousel</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isGeneratingStory}
                  className="text-xs font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate 5-Frame Story
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400 font-mono">Loading Carousel Studio...</div>}>
      <CarouselStudioContent />
    </Suspense>
  );
}
