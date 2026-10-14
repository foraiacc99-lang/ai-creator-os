'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreatorReportNote, ReportCategory } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Search,
  BookOpen,
  Lightbulb,
  Tag,
  ArrowRight,
  Bot,
  User,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES: ReportCategory[] = [
  'Weekly Review',
  'Content Performance',
  'Sales Lessons',
  'Website Projects',
  'SEO Experiments',
  'AI Automation',
  'Learning Notes',
  'Personal Reflections',
];

export default function ReportsPage() {
  const router = useRouter();
  const { reports, addReportNote, updateReportNote, deleteReportNote, addIdea } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-14');
  const [category, setCategory] = useState<ReportCategory>('Sales Lessons');
  const [observations, setObservations] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [metrics, setMetrics] = useState('');
  const [relatedContent, setRelatedContent] = useState('');
  const [relatedProjects, setRelatedProjects] = useState('');
  const [nextActions, setNextActions] = useState('');
  const [tagsStr, setTagsStr] = useState('sales, cold-calling');

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.observations.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lessonsLearned.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || r.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingReportId(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Sales Lessons');
    setObservations('');
    setLessonsLearned('');
    setMetrics('');
    setRelatedContent('');
    setRelatedProjects('');
    setNextActions('');
    setTagsStr('');
    setModalOpen(true);
  };

  const handleOpenEdit = (r: CreatorReportNote) => {
    setEditingReportId(r.id);
    setTitle(r.title);
    setDate(r.date);
    setCategory(r.category);
    setObservations(r.observations);
    setLessonsLearned(r.lessonsLearned);
    setMetrics(r.metrics || '');
    setRelatedContent(r.relatedContent || '');
    setRelatedProjects(r.relatedProjects || '');
    setNextActions(r.nextActions || '');
    setTagsStr((r.tags || []).join(', '));
    setModalOpen(true);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingReportId) {
      updateReportNote(editingReportId, {
        title: title.trim(),
        date,
        category,
        observations,
        lessonsLearned,
        metrics,
        relatedContent,
        relatedProjects,
        nextActions,
        tags,
      });
    } else {
      addReportNote({
        title: title.trim(),
        date,
        category,
        observations,
        lessonsLearned,
        metrics,
        relatedContent,
        relatedProjects,
        nextActions,
        tags,
        isAiGenerated: false,
      });
    }

    setModalOpen(false);
  };

  const handleTurnReportIntoIdea = (r: CreatorReportNote) => {
    addIdea({
      title: `Lesson: ${r.title}`,
      pillar: 'BUILD_IN_PUBLIC_AND_JOURNEY',
      topic: r.category,
      targetAudience: 'Developers and small business owners',
      format: 'REELS',
      hook: `I documented this exact lesson so you don't have to make the same mistake.`,
      mainAngle: r.lessonsLearned || r.observations,
      supportingResearch: `Direct observation from personal creator log: ${r.title}`,
      estimatedProductionTime: 30,
      priority: 'High',
      status: 'Inbox',
      isAiGenerated: false,
      tags: r.tags,
    });
    router.push('/ideas');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Reports, Observations & Sprint Notes
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              Personal Logs
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Manual workspace for weekly reviews, cold call experiments, and website delivery lessons. Turn real sprint reflections into authentic content ideas.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Report / Note
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by observations, lessons, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                filterCategory === 'ALL'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
              }`}
            >
              All Categories ({reports.length})
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <Badge variant="secondary" className="text-[10px]">
                  {r.category}
                </Badge>
                <span className="font-mono text-neutral-400">
                  {formatDate(r.date)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug">
                {r.title}
              </h3>

              <div className="space-y-1.5">
                <span className="font-semibold text-neutral-500 block text-[10px] uppercase">Main Observations:</span>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-3">
                  {r.observations}
                </p>
              </div>

              {r.lessonsLearned && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-800 space-y-1">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-[11px]">
                    Lessons Learned:
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {r.lessonsLearned}
                  </p>
                </div>
              )}

              {r.metrics && (
                <div className="text-[11px] text-neutral-500">
                  <span className="font-semibold">Metrics: </span>
                  <span>{r.metrics}</span>
                </div>
              )}

              {r.tags && r.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {r.tags.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
              <Button
                onClick={() => handleTurnReportIntoIdea(r)}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5"
              >
                <Lightbulb className="w-3 h-3 mr-1 text-amber-500" />
                Turn into Content Idea
              </Button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(r)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
                  title="Edit report"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteReportNote(r.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Delete report"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            No reports or sprint notes recorded yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Document your cold call reflections, client delivery learnings, or weekly sprint progress.
          </p>
          <Button onClick={handleOpenAdd} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Note
          </Button>
        </div>
      )}

      {/* ADD / EDIT REPORT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingReportId ? 'Edit Report / Note' : 'Add Report or Note'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Review: 25 Cold Calls to Local Dentists"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Main Observations
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What specifically happened? (e.g. 25 calls, 14 voicemails, 8 answered, 3 video audits accepted)"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Lessons Learned
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the key takeaway? What will you do differently next time?"
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Metrics / Outcome (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 video reviews requested, $350 booked"
                    value={metrics}
                    onChange={(e) => setMetrics(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="sales, dentists, cold-calling"
                    value={tagsStr}
                    onChange={(e) => setTagsStr(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Save Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
