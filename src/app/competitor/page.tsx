'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompetitorReference, ContentFormat } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  Search,
  Plus,
  Sparkles,
  ExternalLink,
  Trash2,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  X,
  Target,
  ShieldCheck,
} from 'lucide-react';

export default function CompetitorResearchPage() {
  const router = useRouter();
  const { competitors, addCompetitorReference, deleteCompetitorReference, addIdea } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [formatInput, setFormatInput] = useState<ContentFormat>('REELS');
  const [hookInput, setHookInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [likesInput, setLikesInput] = useState<number>(4500);
  const [commentsInput, setCommentsInput] = useState<number>(320);

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput) return;

    addCompetitorReference({
      competitorHandle: handleInput.replace('@', ''),
      postUrl: urlInput || 'https://instagram.com/p/example',
      mediaType: formatInput,
      visibleEngagement: {
        likes: likesInput,
        comments: commentsInput,
      },
      hook: hookInput || 'High curiosity opening line',
      topic: topicInput || 'Tech Industry Trends',
      captionExcerpt: notesInput || 'Interesting storytelling angle with workflow demonstration...',
      structuralBreakdown: 'Polarizing problem hook -> 3 industry examples -> save CTA.',
      whyItWorked: 'High debate trigger in comments and clear save incentive for reference.',
      contentOpportunity: `Create a counter-perspective or open-source practical alternative to ${topicInput || 'this topic'}.`,
    });

    setAddModalOpen(false);
    setHandleInput('');
    setUrlInput('');
    setHookInput('');
    setTopicInput('');
    setNotesInput('');
  };

  const handleConvertOpportunityToIdea = (ref: CompetitorReference) => {
    addIdea({
      title: `Opportunity: ${ref.topic} (Original Angle)`,
      description: `Inspired by @${ref.competitorHandle}: ${ref.contentOpportunity}`,
      topic: ref.topic,
      format: ref.mediaType,
      targetAudience: 'Tech creators and developers',
      hook: `Why the standard advice on ${ref.topic} is flawed. Here is what actually works.`,
      objective: 'Authority',
      estimatedFilmingMinutes: 30,
      difficulty: 'Medium',
      source: 'Competitor Analysis',
      status: 'idea',
    });
    router.push('/ideas');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Competitor Research & Opportunity Engine</h2>
            <Badge variant="purple" className="text-xs font-mono">
              Public Signals
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Analyze publicly visible engagement signals, reverse-engineer high-performing hooks, and discover
            differentiated content opportunities without copying.
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          variant="primary"
          size="sm"
          className="text-xs bg-neutral-900 hover:bg-neutral-800 font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Reference Post
        </Button>
      </div>

      {/* Compliance / Privacy Note */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>Platform Compliance Notice:</strong> Analysis is conducted exclusively on publicly observable signals
          and creator-uploaded reference notes. AI never claims access to private competitor insights or reproduces scripts verbatim.
        </p>
      </div>

      {/* Reference Library Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitors.map((ref) => (
          <div
            key={ref.id}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Top Handle & Badges */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900">@{ref.competitorHandle}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {ref.mediaType}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">
                    {formatNumber(ref.visibleEngagement.likes)} likes • {ref.visibleEngagement.comments} comments
                  </span>
                  <button
                    onClick={() => deleteCompetitorReference(ref.id)}
                    className="p-1 text-neutral-300 hover:text-rose-600 rounded"
                    title="Remove reference"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Observed Hook */}
              <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                <span className="text-[10px] font-semibold uppercase text-neutral-400 block mb-0.5">
                  Observed Scroll-Stopping Hook:
                </span>
                <p className="text-neutral-800 italic font-medium">&ldquo;{ref.hook}&rdquo;</p>
              </div>

              {/* Reverse-Engineered Narrative */}
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <strong className="text-neutral-900">Why It Worked:</strong>
                  <p className="text-neutral-600 text-[11px] mt-0.5">{ref.whyItWorked}</p>
                </div>
                <div>
                  <strong className="text-neutral-900">Structural Breakdown:</strong>
                  <p className="text-neutral-600 text-[11px] mt-0.5">{ref.structuralBreakdown}</p>
                </div>
              </div>

              {/* Differentiated Content Opportunity */}
              <div className="mt-4 p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs space-y-1">
                <div className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Original Content Opportunity:
                </div>
                <p className="text-purple-800 text-[11px] leading-relaxed">
                  {ref.contentOpportunity}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 font-mono">
                Saved {formatDate(ref.savedAt)}
              </span>
              <Button
                onClick={() => handleConvertOpportunityToIdea(ref)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Convert to Content Idea
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD REFERENCE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Public Competitor Reference</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReference} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Competitor Handle *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ai_systems_engineer"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700">Format</label>
                  <select
                    value={formatInput}
                    onChange={(e) => setFormatInput(e.target.value as ContentFormat)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="REELS">Reels</option>
                    <option value="CAROUSEL">Carousel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Public Post URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/reel/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Opening Hook Observed</label>
                <input
                  type="text"
                  placeholder="e.g. Do not learn Python in 2026. Learn this instead."
                  value={hookInput}
                  onChange={(e) => setHookInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Topic / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Developer Skills & AI Careers"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Visible Likes</label>
                  <input
                    type="number"
                    value={likesInput}
                    onChange={(e) => setLikesInput(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700">Visible Comments</label>
                  <input
                    type="number"
                    value={commentsInput}
                    onChange={(e) => setCommentsInput(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Reference
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
