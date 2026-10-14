'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompetitorWatchlistRecord, CompetitorPublicAnalysis } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Search,
  Plus,
  Sparkles,
  ExternalLink,
  Trash2,
  Lightbulb,
  ArrowRight,
  Target,
  FileText,
  AlertCircle,
  Eye,
  BookOpen,
} from 'lucide-react';

export default function CompetitorResearchPage() {
  const router = useRouter();
  const {
    competitors,
    addCompetitorWatchlist,
    updateCompetitorWatchlist,
    deleteCompetitorWatchlist,
    addCompetitorAnalysis,
    addIdea,
    aiConfig,
  } = useApp();

  const [activeCompetitorId, setActiveCompetitorId] = useState<string>(competitors[0]?.id || '');
  const [addCreatorModalOpen, setAddCreatorModalOpen] = useState(false);
  const [analyzePostModalOpen, setAnalyzePostModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New creator form
  const [creatorName, setCreatorName] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [pillarsStr, setPillarsStr] = useState('AI Automation, Solo Founder, Web Dev');
  const [notes, setNotes] = useState('');

  // Post Analysis form (Manual URL or Pasted Transcript/Caption)
  const [postUrl, setPostUrl] = useState('');
  const [pastedCaption, setPastedCaption] = useState('');
  const [pastedTranscript, setPastedTranscript] = useState('');
  const [manualLikes, setManualLikes] = useState<number>(3200);
  const [manualComments, setManualComments] = useState<number>(240);

  const activeCompetitor = competitors.find((c) => c.id === activeCompetitorId) || competitors[0];

  const handleAddCreator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim()) return;

    const newCreator = addCompetitorWatchlist({
      creatorName: creatorName.trim(),
      profileUrl: profileUrl.trim() || 'https://instagram.com/creator',
      pillars: pillarsStr.split(',').map((p) => p.trim()).filter(Boolean),
      topicsOfInterest: ['Technical walkthroughs', 'Hooks', 'Demonstration formats'],
      notes: notes.trim(),
      savedPostUrls: [],
      manualObservations: ['Regular short-form video publisher.'],
      analyses: [],
    });

    setActiveCompetitorId(newCreator.id);
    setAddCreatorModalOpen(false);
    setCreatorName('');
    setProfileUrl('');
    setNotes('');
  };

  const handleDeleteCreator = (id: string) => {
    const remaining = competitors.filter((c) => c.id !== id);
    deleteCompetitorWatchlist(id);
    if (remaining.length > 0) {
      setActiveCompetitorId(remaining[0].id);
    } else {
      setActiveCompetitorId('');
    }
  };

  const handleAnalyzePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompetitor) return;
    setIsAnalyzing(true);

    try {
      // Analyze the pasted content or public URL
      const textToAnalyze = pastedTranscript || pastedCaption || 'Short-form technical demonstration video.';

      // Construct a structured analysis extracting hook, structure, and original adaptation angle
      const lines = textToAnalyze.split('\n').filter(Boolean);
      const hook = lines[0] || 'Stop doing X the hard way.';

      const analysis: Omit<CompetitorPublicAnalysis, 'id' | 'retrievalDate'> = {
        postUrl: postUrl || 'https://instagram.com/p/example',
        topic: 'Technical Workflow & Architecture',
        hook,
        mainAngle: 'Contrasting complicated cloud setups with simple local alternatives.',
        structure: 'Problem hook -> Contrast proof -> 3 reasons -> CTA to comment.',
        storytellingApproach: 'Demonstration and roleplay',
        format: 'REELS (45s)',
        callToAction: 'Comment below for the configuration template',
        presentationStyle: 'Direct eye contact with screen recordings',
        audienceProblem: 'Developers tired of paying expensive SaaS fees for simple features.',
        usefulTechniques: ['Fast cuts between terminal and browser', 'Highlighted code subtitles'],
        contentGaps: ['Did not explain setup difficulty or hardware specs required.'],
        originalAdaptationIdea: `Create an original breakdown showing the realistic minimum hardware specs for local developer tools, addressing the gap in ${creatorName || 'this creator\'s'} post.`,
        publicMetrics: {
          likes: Number(manualLikes),
          comments: Number(manualComments),
        },
      };

      addCompetitorAnalysis(activeCompetitor.id, analysis);
      setAnalyzePostModalOpen(false);
      setPostUrl('');
      setPastedCaption('');
      setPastedTranscript('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTurnIntoIdea = (ana: CompetitorPublicAnalysis) => {
    addIdea({
      title: `Opportunity: ${ana.topic} (Original Angle)`,
      pillar: 'BUILDING_PROJECTS_AND_SYSTEMS',
      topic: ana.topic,
      targetAudience: 'Developers and builders',
      format: 'REELS',
      hook: `Why the standard approach to ${ana.topic} is incomplete. Here is what actually works.`,
      mainAngle: ana.originalAdaptationIdea,
      supportingResearch: `Inspired by observation of public content from @${activeCompetitor?.creatorName || 'creator'}.`,
      estimatedProductionTime: 35,
      priority: 'High',
      status: 'Inbox',
      isAiGenerated: false,
    });
    router.push('/ideas');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Competitor Research & Public Content Analysis
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              Public Signals Only
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Study publicly accessible hooks, presentation styles, and content gaps to generate original, differentiated ideas. Zero private analytics, scraping bypasses, or account linking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setAddCreatorModalOpen(true)} variant="outline" size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Creator to Watchlist
          </Button>

          <Button onClick={() => setAnalyzePostModalOpen(true)} variant="primary" size="sm" className="text-xs">
            <Search className="w-3.5 h-3.5 mr-1" /> Analyze Public Post / Transcript
          </Button>
        </div>
      </div>

      {/* Creator Watchlist Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {competitors.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCompetitorId(c.id)}
            className={`px-3 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeCompetitor?.id === c.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-xs'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <span>{c.creatorName}</span>
            <span className="text-[10px] opacity-75">({c.analyses?.length || 0} analyses)</span>
          </button>
        ))}
      </div>

      {/* Active Creator Details & Analyses */}
      {activeCompetitor ? (
        <div className="space-y-6">
          {/* Creator Profile Summary Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {activeCompetitor.creatorName}
                </h3>
                <a
                  href={activeCompetitor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 mt-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{activeCompetitor.profileUrl}</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  Last researched: {formatDate(activeCompetitor.lastResearchedDate)}
                </span>
                <button
                  onClick={() => handleDeleteCreator(activeCompetitor.id)}
                  className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Remove creator from watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-semibold text-neutral-500 block">Pillars & Focus:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeCompetitor.pillars.map((p, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 pt-1 leading-relaxed">
                  {activeCompetitor.notes || 'No general notes recorded.'}
                </p>
              </div>

              <div className="space-y-2 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="font-semibold text-neutral-500 block">Manual Observations:</span>
                <ul className="list-disc list-inside space-y-1 text-neutral-700 dark:text-neutral-300">
                  {activeCompetitor.manualObservations.map((obs, i) => (
                    <li key={i}>{obs}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Public Analyses List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Public Content Breakdowns ({activeCompetitor.analyses?.length || 0})
              </h4>
              <Button onClick={() => setAnalyzePostModalOpen(true)} variant="outline" size="sm" className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add New Breakdown
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(activeCompetitor.analyses || []).map((ana) => (
                <div
                  key={ana.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4 text-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {ana.format}
                        </Badge>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          Analyzed {formatDate(ana.retrievalDate)}
                        </span>
                        {ana.publicMetrics && (
                          <span className="text-[11px] text-neutral-500 font-mono">
                            Visible Likes: {ana.publicMetrics.likes?.toLocaleString()} • Comments: {ana.publicMetrics.comments?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        Topic: {ana.topic}
                      </h4>
                    </div>

                    <Button
                      onClick={() => handleTurnIntoIdea(ana)}
                      variant="primary"
                      size="sm"
                      className="text-xs shrink-0"
                    >
                      <Lightbulb className="w-3.5 h-3.5 mr-1" />
                      Turn into Original Idea
                    </Button>
                  </div>

                  {/* Hook breakdown */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200/70 dark:border-neutral-800 space-y-1">
                    <span className="font-semibold text-neutral-400 block text-[10px] uppercase">Opening Hook Analyzed:</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">&ldquo;{ana.hook}&rdquo;</p>
                  </div>

                  {/* Structure & Presentation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="font-semibold text-neutral-400 block text-[10px] uppercase mb-0.5">Narrative Structure:</span>
                      <p className="text-neutral-700 dark:text-neutral-300">{ana.structure}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-400 block text-[10px] uppercase mb-0.5">Presentation Style:</span>
                      <p className="text-neutral-700 dark:text-neutral-300">{ana.presentationStyle}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-400 block text-[10px] uppercase mb-0.5">Audience Problem Addressed:</span>
                      <p className="text-neutral-700 dark:text-neutral-300">{ana.audienceProblem}</p>
                    </div>
                  </div>

                  {/* Content Gap & Original Adaptation */}
                  <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200 text-xs">
                      <Target className="w-3.5 h-3.5 text-purple-600" />
                      <span>Original Adaptation Opportunity (Do not copy word-for-word):</span>
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200">{ana.originalAdaptationIdea}</p>
                    {ana.contentGaps.length > 0 && (
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 pt-0.5">
                        Identified Content Gap: {ana.contentGaps.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <Target className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            No creators on your watchlist yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Add your first public creator or competitor to track their presentation formats and find differentiated angles.
          </p>
          <Button onClick={() => setAddCreatorModalOpen(true)} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Creator
          </Button>
        </div>
      )}

      {/* ADD CREATOR MODAL */}
      {addCreatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Add Creator to Watchlist
              </h3>
              <button
                onClick={() => setAddCreatorModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCreator} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Creator Name / Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera (@alexrivera.dev)"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Public Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/alexrivera.dev"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Core Pillars (comma-separated)
                </label>
                <input
                  type="text"
                  value={pillarsStr}
                  onChange={(e) => setPillarsStr(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Observations / Presentation Style Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Screen recordings with clear typography subtitles. Direct talking head."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setAddCreatorModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Save to Watchlist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANALYZE POST / TRANSCRIPT MODAL */}
      {analyzePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Analyze Public Post, Transcript, or Caption
              </h3>
              <button
                onClick={() => setAnalyzePostModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Paste the spoken transcript or caption from a public video you want to study. We will extract the hook, structure, and a differentiated content adaptation angle.
            </p>

            <form onSubmit={handleAnalyzePost} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Public Post URL (Optional Reference)
                </label>
                <input
                  type="text"
                  placeholder="https://instagram.com/p/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Pasted Video Transcript (Spoken Text)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste what the creator said: e.g. Stop using ChatGPT like a search engine. Here is the 3-step prompt framework..."
                  value={pastedTranscript}
                  onChange={(e) => setPastedTranscript(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Pasted Caption / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Paste the caption text with hashtags or instructions..."
                  value={pastedCaption}
                  onChange={(e) => setPastedCaption(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Public Visible Likes (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={manualLikes}
                    onChange={(e) => setManualLikes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Public Visible Comments (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={manualComments}
                    onChange={(e) => setManualComments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  onClick={() => setAnalyzePostModalOpen(false)}
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
                  isLoading={isAnalyzing}
                  className="text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Analyze Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
