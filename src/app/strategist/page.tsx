'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIRecommendation, ContentPillar, CONTENT_PILLARS } from '@/types';
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
  Layers,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Plus,
  Video,
} from 'lucide-react';

export default function StrategistPage() {
  const router = useRouter();
  const {
    recommendations,
    updateRecommendationStatus,
    convertRecommendationToIdea,
    createScriptFromIdea,
    addCalendarEntry,
    calendar,
    preferences,
    aiConfig,
    ideas,
    snapshots,
    research,
  } = useApp();

  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(recommendations[0]?.id || null);

  const filteredRecs = recommendations.filter(
    (rec) =>
      rec.status !== 'rejected' &&
      (selectedPillar === 'ALL' || rec.pillar === selectedPillar)
  );

  const handleGenerateScript = (rec: AIRecommendation) => {
    const idea = convertRecommendationToIdea(rec);
    createScriptFromIdea(idea);
    router.push('/scripts');
  };

  const handleSaveToIdeas = (rec: AIRecommendation) => {
    convertRecommendationToIdea(rec);
  };

  const handleAddToCalendar = (rec: AIRecommendation) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = calendar.some((c) => c.plannedDate === todayStr);
    const dateToSchedule = hasToday
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + 2);
          return d.toISOString().split('T')[0];
        })()
      : todayStr;

    addCalendarEntry({
      title: rec.topic,
      plannedDate: dateToSchedule,
      plannedTime: '17:00',
      format: rec.recommendedFormat,
      pillar: rec.pillar,
      stage: 'Script',
      status: 'Inbox',
      notes: `Primary Hook: "${rec.primaryHook}"\nCTA: ${rec.recommendedCTA}`,
      isSyncedToGoogle: false,
    });
    updateRecommendationStatus(rec.id, 'approved');
    router.push('/calendar');
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise((res) => setTimeout(res, 1200));
    setIsRegenerating(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Personal Content Strategist
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              Empirical Engine
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Synthesizes your 6 content pillars, available filming bandwidth ({preferences.availableFilmingHoursPerWeek}h/wk), manual growth snapshots, and verified research into 19-point production plans.
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
            Refresh Strategy
          </Button>
        </div>
      </div>

      {/* Strategic Inputs Summary Bar */}
      <div className="p-4 bg-neutral-100/70 dark:bg-neutral-800 rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span>Active Pillars: <strong>6 Configured</strong></span>
          <span>•</span>
          <span>Weekly Bandwidth: <strong>{preferences.availableFilmingHoursPerWeek}h filming, {preferences.availableEditingHoursPerWeek}h editing</strong></span>
          <span>•</span>
          <span>Cadence: <strong>{preferences.postingFrequencyPerWeek} posts / week</strong></span>
          <span>•</span>
          <span>Saved Research: <strong>{research.length} records</strong></span>
        </div>
        <span className="font-mono text-[11px] text-neutral-500">
          Ollama model: {aiConfig.textModel}
        </span>
      </div>

      {/* Pillar Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedPillar('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            selectedPillar === 'ALL'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-bold'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
          }`}
        >
          All Pillars ({recommendations.length})
        </button>

        {CONTENT_PILLARS.map((p) => {
          const count = recommendations.filter((r) => r.pillar === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPillar(p.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedPillar === p.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-bold'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span>{p.shortTitle}</span>
              {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Recommendations List with 19 Structured Output Points */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isExpanded = expandedRecId === rec.id;
          const pillarInfo = CONTENT_PILLARS.find((p) => p.id === rec.pillar);

          return (
            <div
              key={rec.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              {/* Card Header (Summary) */}
              <div
                onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${pillarInfo?.color}20`, color: pillarInfo?.color }}>
                      {pillarInfo?.shortTitle || rec.pillar}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {rec.recommendedFormat}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {rec.productionDifficulty} Difficulty (~{rec.estimatedProductionTime} mins)
                    </Badge>
                    <span className="text-xs text-neutral-400 font-mono">
                      Proposed Slot: {rec.recommendedSlot}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                    {rec.topic}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                    Primary Hook: &ldquo;{rec.primaryHook}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => handleGenerateScript(rec)}
                      variant="primary"
                      size="sm"
                      className="text-xs"
                    >
                      <Video className="w-3.5 h-3.5 mr-1" />
                      Script Studio
                    </Button>
                    <Button
                      onClick={() => handleSaveToIdeas(rec)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Bookmark className="w-3.5 h-3.5 mr-1" />
                      Save Idea
                    </Button>
                  </div>

                  <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Full 19-Point Breakdown Accordion */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-5 text-xs bg-neutral-50/40 dark:bg-neutral-950/40">
                  {/* Grid 1: Audience, Problem & Rationale */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-[11px] uppercase tracking-wider text-neutral-400">
                        Intended Audience & Problem
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 font-medium">{rec.intendedAudience}</p>
                      <p className="text-neutral-500 dark:text-neutral-400 pt-1 text-[11px]">{rec.mainProblem}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-[11px] uppercase tracking-wider text-neutral-400">
                        Why Worth Creating
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{rec.whyWorthCreating}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-[11px] uppercase tracking-wider text-neutral-400">
                        Evidence & Source References
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300">{rec.evidenceAndResearch}</p>
                      {rec.sourceLinks.length > 0 && (
                        <div className="pt-1 space-y-0.5">
                          {rec.sourceLinks.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{url.replace('https://', '').slice(0, 30)}...</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid 2: Hooks & Angles */}
                  <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-xs">
                      Tested Hook Options
                    </span>
                    <div className="space-y-1.5">
                      <div className="p-2.5 rounded-lg bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60">
                        <span className="font-semibold text-purple-900 dark:text-purple-200 block text-[11px]">Primary Hook:</span>
                        <span className="text-neutral-800 dark:text-neutral-200">&ldquo;{rec.primaryHook}&rdquo;</span>
                      </div>
                      {rec.alternativeHooks.map((alt, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-400">
                          <span className="font-semibold text-[10px] uppercase text-neutral-400">Alt Hook {idx + 1}: </span>
                          <span>&ldquo;{alt}&rdquo;</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="font-semibold text-neutral-500 dark:text-neutral-400 block mb-0.5">Suggested Angle:</span>
                        <p className="text-neutral-800 dark:text-neutral-200">{rec.suggestedAngle}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-neutral-500 dark:text-neutral-400 block mb-0.5">Core Takeaway:</span>
                        <p className="text-neutral-800 dark:text-neutral-200">{rec.mainTakeaway}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid 3: Production Plan & Action */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-[11px] uppercase tracking-wider text-neutral-400">
                        Required B-Roll & Visuals
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 pt-1">
                        {rec.requiredBRoll.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-[11px] uppercase tracking-wider text-neutral-400">
                        Shooting Plan & Recommended CTA
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300">{rec.suggestedShootingPlan}</p>
                      <div className="pt-2 text-[11px]">
                        <span className="font-semibold text-neutral-500">CTA: </span>
                        <span className="text-neutral-800 dark:text-neutral-200">{rec.recommendedCTA}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-[11px] uppercase tracking-wider text-neutral-400">
                          Next Action
                        </span>
                        <p className="text-neutral-800 dark:text-neutral-200 font-semibold">{rec.nextAction}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          onClick={() => handleAddToCalendar(rec)}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Schedule Task
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
