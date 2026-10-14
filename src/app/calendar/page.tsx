'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEntry, ContentFormat, ContentObjective, IdeaStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  List,
  Grid,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileEdit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const STATUS_COLORS: Record<IdeaStatus, string> = {
  idea: 'bg-neutral-100 text-neutral-700',
  planned: 'bg-blue-50 text-blue-700 border-blue-200',
  script_ready: 'bg-purple-50 text-purple-700 border-purple-200',
  filming: 'bg-amber-50 text-amber-700 border-amber-200',
  editing: 'bg-orange-50 text-orange-700 border-orange-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  published: 'bg-neutral-900 text-white',
};

export default function CalendarPage() {
  const router = useRouter();
  const {
    calendar,
    addCalendarEntry,
    updateCalendarEntry,
    deleteCalendarEntry,
    autoPlanNext7Days,
    scripts,
    preferences,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [planModalOpen, setPlanModalOpen] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

  // New entry form
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-10-15');
  const [newFormat, setNewFormat] = useState<ContentFormat>('REELS');
  const [newStatus, setNewStatus] = useState<IdeaStatus>('planned');
  const [newObjective, setNewObjective] = useState<ContentObjective>('Authority');

  // Filtered calendar items
  const filteredEntries = calendar.filter(
    (e) => filterStatus === 'ALL' || e.status === filterStatus
  );

  // Propose 7-day schedule preview for approval
  const proposedSchedule = [
    {
      title: 'Voice Mimicry Meta-Prompt Masterclass',
      plannedDate: '2026-10-16',
      format: 'REELS' as ContentFormat,
      objective: 'Authority' as ContentObjective,
      rationale: 'High save velocity for Tuesday prime-time slot.',
    },
    {
      title: '2026 Developer Salary Paradox Breakdown',
      plannedDate: '2026-10-18',
      format: 'CAROUSEL' as ContentFormat,
      objective: 'Engagement' as ContentObjective,
      rationale: 'Deep-dive carousel for Thursday evening bookmarking.',
    },
    {
      title: 'Why Cloud DB Latency Kills AI Agents (SQLite vs Cloud)',
      plannedDate: '2026-10-20',
      format: 'REELS' as ContentFormat,
      objective: 'Reach' as ContentObjective,
      rationale: 'Weekend builder benchmark video.',
    },
  ];

  const handleApproveAutoPlan = () => {
    autoPlanNext7Days();
    setPlanModalOpen(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addCalendarEntry({
      title: newTitle,
      plannedDate: newDate,
      format: newFormat,
      status: newStatus,
      objective: newObjective,
    });
    setAddModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Content Calendar</h2>
            <Badge variant="secondary" className="text-xs font-mono">
              {calendar.length} Scheduled
            </Badge>
          </div>
          <p className="text-xs text-neutral-500">
            Plan, schedule, and track production status across weekly and monthly publishing cycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid vs List toggle */}
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setAddModalOpen(true)} variant="outline" size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Entry
          </Button>

          <Button
            onClick={() => setPlanModalOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs bg-neutral-900 hover:bg-neutral-800 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            Plan My Next 7 Days
          </Button>
        </div>
      </div>

      {/* Filter by Status */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <span className="text-neutral-400 font-medium shrink-0">Filter Status:</span>
        {['ALL', 'planned', 'script_ready', 'filming', 'ready', 'scheduled', 'published'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 capitalize ${
              filterStatus === s
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 hover:bg-neutral-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex flex-col items-center justify-center font-mono text-[11px] text-neutral-700 shrink-0">
                    <span className="text-[9px] uppercase text-neutral-400">
                      {new Date(entry.plannedDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <strong className="text-xs leading-none">
                      {new Date(entry.plannedDate).getDate()}
                    </strong>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 leading-snug">
                      {entry.title}
                    </h4>
                    <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                      <span>{entry.format}</span>
                      <span>•</span>
                      <span>{entry.objective}</span>
                      {entry.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs">{entry.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    value={entry.status}
                    onChange={(e) =>
                      updateCalendarEntry(entry.id, { status: e.target.value as IdeaStatus })
                    }
                    className="px-2.5 py-1 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-700 font-medium"
                  >
                    <option value="idea">Idea</option>
                    <option value="planned">Planned</option>
                    <option value="script_ready">Script Ready</option>
                    <option value="filming">Filming</option>
                    <option value="ready">Ready</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>

                  <Link href="/scripts">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                      <FileEdit className="w-3 h-3" />
                    </Button>
                  </Link>

                  <button
                    onClick={() => deleteCalendarEntry(entry.id)}
                    className="p-1.5 text-neutral-300 hover:text-rose-600 rounded"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-neutral-500 font-medium flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                    {formatDate(entry.plannedDate)}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {entry.format}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
                  {entry.title}
                </h3>

                {entry.notes && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {entry.notes}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase border ${
                      STATUS_COLORS[entry.status] || 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {entry.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-neutral-400">{entry.objective}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <Link
                  href="/scripts"
                  className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
                >
                  <FileEdit className="w-3 h-3 mr-0.5" />
                  Edit Script
                </Link>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={entry.plannedDate}
                    onChange={(e) =>
                      updateCalendarEntry(entry.id, { plannedDate: e.target.value })
                    }
                    className="text-[11px] border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-600 bg-white"
                  />
                  <button
                    onClick={() => deleteCalendarEntry(entry.id)}
                    className="text-neutral-300 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AUTO-PLAN NEXT 7 DAYS APPROVAL MODAL */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900">
                  AI Proposed 7-Day Content Schedule
                </h3>
              </div>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Based on your weekly posting goal of <strong>{preferences.postingFrequencyPerWeek} posts</strong> and
                optimal historical engagement windows, the AI proposes this schedule:
              </p>

              <div className="space-y-2.5">
                {proposedSchedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{item.title}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.format}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      Planned: {formatDate(item.plannedDate)} • Goal: {item.objective}
                    </div>
                    <p className="text-[11px] text-emerald-700 pt-0.5">
                      <strong>AI Rationale:</strong> {item.rationale}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-neutral-100 rounded-lg text-[11px] text-neutral-500">
                You can drag, re-order, or modify any date after approval.
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlanModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApproveAutoPlan}
                className="text-xs bg-neutral-900 hover:bg-neutral-800 font-semibold"
              >
                Approve & Schedule Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CALENDAR ENTRY MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Calendar Entry</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700">Content Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Open-Source AI Tools You Must Know"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Planned Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IdeaStatus)}
                    className="w-full mt-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="planned">Planned</option>
                    <option value="script_ready">Script Ready</option>
                    <option value="filming">Filming</option>
                    <option value="ready">Ready</option>
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
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Add to Calendar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
