'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExperimentItem, MediaPost } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  Trophy,
  Sparkles,
  Plus,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  Scale,
  ArrowRight,
  X,
  Target,
} from 'lucide-react';

export default function PerformanceCoachPage() {
  const { posts, experiments, addExperiment, updateExperiment } = useApp();
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'coaching' | 'experiments'>('coaching');
  const [newExpModalOpen, setNewExpModalOpen] = useState(false);

  // New experiment state
  const [expTitle, setExpTitle] = useState('');
  const [expHypothesis, setExpHypothesis] = useState('');
  const [expVariable, setExpVariable] = useState<ExperimentItem['variableTested']>('Hook Style');
  const [expVariantA, setExpVariantA] = useState('');
  const [expVariantB, setExpVariantB] = useState('');
  const [expMetric, setExpMetric] = useState<ExperimentItem['metricObserved']>('Engagement Rate');

  const selectedPost = posts.find((p) => p.id === selectedPostId) || posts[0];

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expHypothesis) return;

    addExperiment({
      title: expTitle,
      hypothesis: expHypothesis,
      variableTested: expVariable,
      variantA: { description: expVariantA || 'Variant A' },
      variantB: { description: expVariantB || 'Variant B' },
      metricObserved: expMetric,
      status: 'Active',
    });

    setNewExpModalOpen(false);
    setExpTitle('');
    setExpHypothesis('');
    setExpVariantA('');
    setExpVariantB('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">AI Performance Coach</h2>
            <Badge variant="purple" className="text-xs font-mono">
              Diagnostic Analysis
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Compare published posts against historical baselines, isolate causative variables, and track
            hypotheses through structured creator experiments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('coaching')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'coaching'
                  ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Post Diagnostics
            </button>
            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'experiments'
                  ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Experiment Lab ({experiments.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Post Diagnostic & Coaching */}
      {activeTab === 'coaching' && selectedPost && (
        <div className="space-y-6">
          {/* Post selector bar */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900">Select Post to Audit:</span>
              <select
                value={selectedPost.id}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 bg-white"
              >
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.topic} ({p.metrics.engagementRate}% ER)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span>{formatNumber(selectedPost.metrics.views)} views</span>
              <span>•</span>
              <span>{formatNumber(selectedPost.metrics.saves)} saves</span>
              <span>•</span>
              <Badge variant="secondary">{selectedPost.mediaType}</Badge>
            </div>
          </div>

          {/* 5-Section Rigorous Coaching Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. What Worked */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                1. What Worked (Validated Factors)
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                {(selectedPost.aiDiagnostic?.whatWorked || [
                  'Hook addressed concrete pain in first 1.8 seconds.',
                  'On-screen prompt template drove disproportionately high saves.',
                ]).map((point, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. What May Have Limited Performance */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                2. What May Have Limited Performance
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                {(selectedPost.aiDiagnostic?.whatLimited || [
                  'Outro CTA was slightly rushed.',
                  'Comments could have been doubled with an open-ended question.',
                ]).map((point, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 bg-rose-50/50 rounded-lg border border-rose-100">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. What Remains Uncertain (Correlation vs Causation) */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                3. What Remains Uncertain (No Causation Presumed)
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                While the post performed on Sunday evening, we cannot determine whether the lift was caused by posting
                time or by the contrarian hook phrasing. An isolated A/B test is required to verify.
              </p>
            </div>

            {/* 4. Useful Comparison Post Benchmark */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Scale className="w-4 h-4 text-neutral-700" />
                4. Benchmark Comparison Post
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-600 space-y-1">
                <div className="font-semibold text-neutral-900">
                  Compared against: &ldquo;My 2026 Solo Founder Tech Stack&rdquo;
                </div>
                <p className="text-[11px] leading-relaxed">
                  Both posts shared technical templates, but the Solo Founder post had 43% higher saves due to radical
                  revenue transparency in the cover title.
                </p>
              </div>
            </div>

            {/* 5. What to Test Next */}
            <div className="md:col-span-2 bg-neutral-900 text-white rounded-2xl p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                5. What to Test Next (Hypothesis for Next Post)
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {selectedPost.aiDiagnostic?.recommendation ||
                  'Create a Part 2 testing split-screen code execution against pure talking head to measure watch-time retention impact.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Experiment Lab */}
      {activeTab === 'experiments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Hypothesis & Experiment Tracker</h3>
              <p className="text-xs text-neutral-500">
                Run controlled experiments comparing hook styles, video formats, and posting times.
              </p>
            </div>

            <Button
              onClick={() => setNewExpModalOpen(true)}
              variant="primary"
              size="sm"
              className="text-xs bg-neutral-900 hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Experiment
            </Button>
          </div>

          <div className="space-y-4">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <h4 className="text-sm font-bold text-neutral-900">{exp.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      Variable: {exp.variableTested}
                    </Badge>
                    <Badge
                      variant={exp.status === 'Completed' ? 'success' : 'default'}
                      className="text-[10px]"
                    >
                      {exp.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-700">
                  <strong className="text-neutral-900 block mb-0.5">Hypothesis:</strong>
                  {exp.hypothesis}
                </div>

                {/* Variant A vs Variant B */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50/70 border border-neutral-200/80 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-neutral-500 text-[10px]">VARIANT A</span>
                    <p className="text-neutral-800 font-medium">{exp.variantA.description}</p>
                    {exp.variantA.resultMetric !== undefined && (
                      <div className="text-[11px] font-bold text-neutral-900 pt-1">
                        Result: {exp.variantA.resultMetric}% {exp.metricObserved}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-neutral-50/70 border border-neutral-200/80 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-neutral-500 text-[10px]">VARIANT B</span>
                    <p className="text-neutral-800 font-medium">{exp.variantB.description}</p>
                    {exp.variantB.resultMetric !== undefined && (
                      <div className="text-[11px] font-bold text-neutral-900 pt-1">
                        Result: {exp.variantB.resultMetric}% {exp.metricObserved}
                      </div>
                    )}
                  </div>
                </div>

                {/* Findings */}
                {exp.findings && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs space-y-0.5">
                    <strong className="text-emerald-900">Observed Evaluation & Findings:</strong>
                    <p className="text-emerald-800 leading-relaxed text-[11px]">{exp.findings}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE EXPERIMENT MODAL */}
      {newExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Create New Content Experiment</h3>
              <button
                onClick={() => setNewExpModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700">Experiment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Split-Screen Terminal vs Talking Head"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Hypothesis *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Showing continuous terminal action will improve watch time by +25% compared to pure talking head."
                  value={expHypothesis}
                  onChange={(e) => setExpHypothesis(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Variable Tested</label>
                  <select
                    value={expVariable}
                    onChange={(e) => setExpVariable(e.target.value as any)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Hook Style">Hook Style</option>
                    <option value="Format">Format</option>
                    <option value="Posting Time">Posting Time</option>
                    <option value="Video Length">Video Length</option>
                    <option value="CTA">CTA</option>
                    <option value="Topic">Topic</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700">Target Metric</label>
                  <select
                    value={expMetric}
                    onChange={(e) => setExpMetric(e.target.value as any)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Engagement Rate">Engagement Rate</option>
                    <option value="Saves">Saves</option>
                    <option value="Shares">Shares</option>
                    <option value="Retention">Retention</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Variant A</label>
                  <input
                    type="text"
                    placeholder="Description of Variant A"
                    value={expVariantA}
                    onChange={(e) => setExpVariantA(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700">Variant B</label>
                  <input
                    type="text"
                    placeholder="Description of Variant B"
                    value={expVariantB}
                    onChange={(e) => setExpVariantB(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewExpModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Start Experiment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
