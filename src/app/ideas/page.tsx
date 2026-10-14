'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentIdea, ContentFormat, ContentObjective, IdeaStatus } from '@/types';
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
  Layers,
  ArrowRight,
  X,
  Sliders,
} from 'lucide-react';

export default function IdeasPage() {
  const router = useRouter();
  const { ideas, addIdea, updateIdea, deleteIdea, createScriptFromIdea, addCalendarEntry, preferences, aiConfig } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('ALL');
  const [filterFormat, setFilterFormat] = useState('ALL');
  const [filterObjective, setFilterObjective] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generator form state
  const [genTopic, setGenTopic] = useState('');
  const [genGoal, setGenGoal] = useState<ContentObjective>('Authority');
  const [genFormat, setGenFormat] = useState<ContentFormat>('REELS');
  const [genCount, setGenCount] = useState(3);

  // Manual create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newHook, setNewHook] = useState('');
  const [newFormat, setNewFormat] = useState<ContentFormat>('REELS');
  const [newObjective, setNewObjective] = useState<ContentObjective>('Authority');

  // Unique topics from ideas
  const uniqueTopics = Array.from(new Set(ideas.map((i) => i.topic)));

  // Filter ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.hook.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = filterTopic === 'ALL' || idea.topic === filterTopic;
    const matchesFormat = filterFormat === 'ALL' || idea.format === filterFormat;
    const matchesObjective = filterObjective === 'ALL' || idea.objective === filterObjective;
    const matchesStatus = filterStatus === 'ALL' || idea.status === filterStatus;
    return matchesSearch && matchesTopic && matchesFormat && matchesObjective && matchesStatus;
  });

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: genTopic || preferences.niche,
          objective: genGoal,
          format: genFormat,
          targetAudience: preferences.targetAudience,
          tone: preferences.speakingStyle,
          count: genCount,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (data.ideas && data.ideas.length > 0) {
        data.ideas.forEach((item: any) => addIdea(item));
        setGenerateModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addIdea({
      title: newTitle,
      description: newDesc,
      topic: newTopic || 'Custom Research',
      format: newFormat,
      targetAudience: preferences.targetAudience,
      hook: newHook,
      objective: newObjective,
      estimatedFilmingMinutes: 30,
      difficulty: 'Medium',
      source: 'User Created',
      status: 'idea',
    });
    setCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewHook('');
  };

  const handleCreateScript = (idea: ContentIdea) => {
    createScriptFromIdea(idea);
    router.push('/scripts');
  };

  const handleSchedule = (idea: ContentIdea) => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    addCalendarEntry({
      title: idea.title,
      plannedDate: d.toISOString().split('T')[0],
      format: idea.format,
      status: 'planned',
      ideaId: idea.id,
      objective: idea.objective,
    });
    updateIdea(idea.id, { status: 'planned' });
    router.push('/calendar');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Action Buttons */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Content Ideas Library</h2>
            <Badge variant="secondary" className="text-xs font-mono">
              {ideas.length} Saved
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Search, filter, generate and convert strategic content hooks into filmed assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setCreateModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Idea
          </Button>

          <Button
            onClick={() => setGenerateModalOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            Generate Ideas
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, description, or opening hook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Format */}
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-700 focus:outline-none"
          >
            <option value="ALL">All Formats</option>
            <option value="REELS">Reels</option>
            <option value="CAROUSEL">Carousel</option>
          </select>

          {/* Objective */}
          <select
            value={filterObjective}
            onChange={(e) => setFilterObjective(e.target.value)}
            className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-700 focus:outline-none"
          >
            <option value="ALL">All Objectives</option>
            <option value="Authority">Authority</option>
            <option value="Reach">Reach</option>
            <option value="Engagement">Engagement</option>
            <option value="Audience Growth">Audience Growth</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="idea">Idea</option>
            <option value="planned">Planned</option>
            <option value="script_ready">Script Ready</option>
            <option value="filming">Filming</option>
          </select>

          {/* Topic */}
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-700 focus:outline-none"
          >
            <option value="ALL">All Topics</option>
            {uniqueTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {(filterFormat !== 'ALL' ||
            filterObjective !== 'ALL' ||
            filterStatus !== 'ALL' ||
            filterTopic !== 'ALL' ||
            searchQuery) && (
            <button
              onClick={() => {
                setFilterFormat('ALL');
                setFilterObjective('ALL');
                setFilterStatus('ALL');
                setFilterTopic('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-neutral-400 hover:text-neutral-900 underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Idea Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px]">
                  {idea.format}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-400">{idea.source}</span>
                  <button
                    onClick={() => updateIdea(idea.id, { isFavorite: !idea.isFavorite })}
                    className="text-neutral-300 hover:text-amber-500"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        idea.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
                {idea.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-3 leading-relaxed">
                {idea.description}
              </p>

              {/* Hook preview */}
              {idea.hook && (
                <div className="mt-3 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
                  <span className="text-[10px] font-semibold uppercase text-neutral-400 block mb-0.5">
                    Opening Hook:
                  </span>
                  <p className="text-neutral-800 text-[11px] italic line-clamp-2">
                    &ldquo;{idea.hook}&rdquo;
                  </p>
                </div>
              )}

              {/* Badges metadata */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                  {idea.objective}
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                  {idea.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                  ~{idea.estimatedFilmingMinutes}m film
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-white font-medium capitalize">
                  {idea.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <Button
                onClick={() => handleCreateScript(idea)}
                variant="primary"
                size="sm"
                className="text-xs h-7 px-2.5"
              >
                <FileEdit className="w-3 h-3 mr-1" />
                Script Studio
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handleSchedule(idea)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  title="Schedule on calendar"
                >
                  <Calendar className="w-3 h-3" />
                </Button>
                <button
                  onClick={() => deleteIdea(idea.id)}
                  className="p-1.5 text-neutral-300 hover:text-rose-600 rounded transition-colors"
                  title="Delete idea"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="p-12 text-center bg-white border border-dashed border-neutral-300 rounded-2xl">
          <Lightbulb className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-neutral-900">No content ideas found</h4>
          <p className="text-xs text-neutral-500 mt-1">
            Try adjusting your search filters or click &ldquo;Generate Ideas&rdquo; to prompt the AI.
          </p>
        </div>
      )}

      {/* GENERATE IDEAS MODAL */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900">Generate Ideas with AI</h3>
              </div>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateIdeas} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700">Specific Topic / Angle</label>
                <input
                  type="text"
                  placeholder="e.g. Local Ollama Benchmarks, Solopreneur Agent Stacks"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Goal / Objective</label>
                  <select
                    value={genGoal}
                    onChange={(e) => setGenGoal(e.target.value as ContentObjective)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="Authority">Authority</option>
                    <option value="Reach">Reach</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Audience Growth">Audience Growth</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700">Content Format</label>
                  <select
                    value={genFormat}
                    onChange={(e) => setGenFormat(e.target.value as ContentFormat)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="REELS">Reels (Short-form video)</option>
                    <option value="CAROUSEL">Carousel (Multi-slide graphic)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Number of Ideas</label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-neutral-900"
                >
                  <option value={3}>3 Ideas</option>
                  <option value={5}>5 Ideas</option>
                </select>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg text-[11px] text-neutral-500">
                Inference provider: <strong>{aiConfig.provider}</strong> ({aiConfig.textModel})
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGenerateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isGenerating}>
                  Generate Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MANUAL IDEA MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Content Idea</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700">Idea Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Why You Should Stop Using Cloud Postgres"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Topic / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Software Architecture"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Opening Hook Line</label>
                <input
                  type="text"
                  placeholder="e.g. Stop paying $40/mo for database latency..."
                  value={newHook}
                  onChange={(e) => setNewHook(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Description & Key Points</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the core argument or tutorial steps..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as ContentFormat)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="REELS">Reels</option>
                    <option value="CAROUSEL">Carousel</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700">Objective</label>
                  <select
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value as ContentObjective)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Authority">Authority</option>
                    <option value="Reach">Reach</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Audience Growth">Audience Growth</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Idea
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
