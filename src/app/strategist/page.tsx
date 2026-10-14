'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIRecommendation, ContentObjective } from '@/types';
import {
  Sparkles,
  ArrowRight,
  FileEdit,
  Bookmark,
  Calendar,
  CheckCircle2,
  RefreshCw,
  X,
  Target,
  Clock,
  Award,
  Video,
  Layers,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

const OBJECTIVES: ContentObjective[] = [
  'Authority',
  'Reach',
  'Engagement',
  'Audience Growth',
  'Community Building',
  'Leads',
  'Portfolio',
  'Personal Storytelling',
];

export default function StrategistPage() {
  const router = useRouter();
  const {
    recommendations,
    updateRecommendationStatus,
    convertRecommendationToIdea,
    createScriptFromIdea,
    addCalendarEntry,
    preferences,
    aiConfig,
  } = useApp();

  const [selectedObjective, setSelectedObjective] = useState<string>('ALL');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const filteredRecs = recommendations.filter(
    (rec) =>
      rec.status !== 'dismissed' &&
      (selectedObjective === 'ALL' || rec.objective === selectedObjective)
  );

  const handleGenerateScript = (rec: AIRecommendation) => {
    const idea = convertRecommendationToIdea(rec);
    const script = createScriptFromIdea(idea);
    router.push('/scripts');
  };

  const handleSaveIdea = (rec: AIRecommendation) => {
    convertRecommendationToIdea(rec);
  };

  const handleAddToCalendar = (rec: AIRecommendation) => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    addCalendarEntry({
      title: rec.title,
      plannedDate: today.toISOString().split('T')[0],
      format: rec.format,
      status: 'planned',
      objective: rec.objective,
      notes: `Suggested Hook: "${rec.suggestedHook}"`,
    });
    updateRecommendationStatus(rec.id, 'scheduled');
    router.push('/calendar');
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise((res) => setTimeout(res, 1200));
    setIsRegenerating(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Context Header */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              YOUR PERSONAL CONTENT STRATEGIST
            </h2>
            <Badge variant="purple" className="text-[11px] font-mono">
              Empirical Engine
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            Synthesizes your verified analytics, past transcript pacing, audience save habits, and current niche goals
            to answer: What should I post next, why, and how should I evaluate it?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRegenerate}
            variant="outline"
            size="sm"
            isLoading={isRegenerating}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Regenerate Strategy
          </Button>
        </div>
      </div>

      {/* Filter by Strategic Objective */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-neutral-400 font-medium shrink-0 flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-neutral-500" />
          Goal Filter:
        </span>
        <button
          onClick={() => setSelectedObjective('ALL')}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
            selectedObjective === 'ALL'
              ? 'bg-neutral-900 text-white'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          All Objectives
        </button>
        {OBJECTIVES.map((obj) => (
          <button
            key={obj}
            onClick={() => setSelectedObjective(obj)}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
              selectedObjective === obj
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {obj}
          </button>
        ))}
      </div>

      {/* 5 Empirical Content Recommendations */}
      <div className="space-y-6">
        {filteredRecs.map((rec, index) => (
          <div
            key={rec.id}
            className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs hover:border-neutral-300 transition-all space-y-5"
          >
            {/* Top row: Header, Confidence, Effort, Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    {rec.title}
                  </h3>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Topic: <strong className="text-neutral-700">{rec.topic}</strong> • Target:{' '}
                    <span className="text-neutral-600">{rec.targetAudience}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">
                  {rec.format}
                </Badge>
                <Badge variant="purple" className="text-[10px]">
                  {rec.objective}
                </Badge>
                <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {rec.confidenceScore}% Confidence
                </div>
                <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Effort: {rec.productionEffort}
                </div>
              </div>
            </div>

            {/* Structured 4-Quadrant Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Hook & Concept */}
              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-100 space-y-2">
                <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  What to Say (Opening Hook)
                </div>
                <p className="text-neutral-800 font-medium italic text-xs leading-relaxed">
                  &ldquo;{rec.suggestedHook}&rdquo;
                </p>
                <div className="text-neutral-500 text-[11px] pt-1">
                  <strong>Core Argument:</strong> {rec.mainArgument}
                </div>
              </div>

              {/* Format & Execution */}
              <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-100 space-y-2">
                <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-500" />
                  What the Video Shows & Duration
                </div>
                <p className="text-neutral-600 leading-relaxed text-[11px]">
                  {rec.format === 'REELS'
                    ? `Recommended video duration: ~${rec.recommendedDurationSeconds} seconds. Split screen or fast talking head with kinetic code overlays.`
                    : '6-8 slide high contrast carousel. Cover title in 36pt font. Flowchart or matrix diagram on slide 3.'}
                </p>
                <div className="text-neutral-700 text-[11px] pt-1">
                  <strong>Suggested CTA:</strong> {rec.suggestedCTA}
                </div>
              </div>

              {/* Supporting Historical Evidence */}
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-1.5 md:col-span-2">
                <div className="font-semibold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Why This Post? (Empirical Platform Evidence)
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  {rec.supportingEvidence}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleGenerateScript(rec)}
                  variant="primary"
                  size="sm"
                  className="text-xs bg-neutral-900 hover:bg-neutral-800"
                >
                  <FileEdit className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                  Generate Script
                </Button>

                <Button
                  onClick={() => handleSaveIdea(rec)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Bookmark className="w-3.5 h-3.5 mr-1" />
                  {rec.status === 'saved' ? 'Saved in Ideas' : 'Save Idea'}
                </Button>

                <Button
                  onClick={() => handleAddToCalendar(rec)}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Add to Calendar
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateRecommendationStatus(rec.id, 'filmed')}
                  className="text-xs text-neutral-500 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                >
                  Mark as Filmed
                </button>
                <button
                  onClick={() => updateRecommendationStatus(rec.id, 'dismissed')}
                  className="text-xs text-neutral-400 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                  title="Dismiss recommendation"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRecs.length === 0 && (
          <div className="p-12 text-center bg-white border border-dashed border-neutral-300 rounded-2xl">
            <h4 className="text-sm font-semibold text-neutral-900">No active recommendations for this goal</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Select &ldquo;All Objectives&rdquo; or click Regenerate to query fresh content angles.
            </p>
            <Button onClick={() => setSelectedObjective('ALL')} variant="secondary" size="sm" className="mt-4">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
