'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEntry, CalendarStage, ContentFormat, ContentPillar, CONTENT_PILLARS } from '@/types';
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
  RefreshCw,
  ExternalLink,
  Radio,
} from 'lucide-react';

const STAGES: CalendarStage[] = [
  'Idea',
  'Research',
  'Script',
  'Shooting',
  'Editing',
  'Caption & Final Prep',
  'Planned Publishing',
  'Published',
];

export default function CalendarPage() {
  const router = useRouter();
  const {
    calendar,
    addCalendarEntry,
    updateCalendarEntry,
    deleteCalendarEntry,
    autoPlanRealisticSchedule,
    syncCalendarToGoogle,
    googleCalendar,
    preferences,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [syncingEntryId, setSyncingEntryId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ id: string; success: boolean; text: string } | null>(null);

  // New entry form state
  const [title, setTitle] = useState('');
  const [plannedDate, setPlannedDate] = useState('2026-10-14');
  const [plannedTime, setPlannedTime] = useState('17:00');
  const [format, setFormat] = useState<ContentFormat>('REELS');
  const [pillar, setPillar] = useState<ContentPillar>('BUILDING_PROJECTS_AND_SYSTEMS');
  const [stage, setStage] = useState<CalendarStage>('Script');
  const [notes, setNotes] = useState('');

  // Filtered calendar items
  const filteredEntries = calendar.filter(
    (e) => filterStage === 'ALL' || e.stage === filterStage
  );

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCalendarEntry({
      title: title.trim(),
      plannedDate,
      plannedTime,
      format,
      pillar,
      stage,
      status: 'Inbox',
      notes,
      isSyncedToGoogle: false,
    });

    setAddModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const handleSyncToGoogle = async (entryId: string) => {
    setSyncingEntryId(entryId);
    setSyncMessage(null);
    const res = await syncCalendarToGoogle(entryId);
    setSyncMessage({ id: entryId, success: res.success, text: res.message });
    setSyncingEntryId(null);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Content Calendar & Workflow
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              8 Production Stages
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Track stages from ideation and research to shooting and editing. Generates realistic schedules based on your {preferences.availableFilmingHoursPerWeek}h weekly filming capacity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => autoPlanRealisticSchedule()}
            variant="outline"
            size="sm"
            className="text-xs"
            title="Auto-plan realistic slots for unscheduled ideas"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
            AI Realistic Auto-Plan
          </Button>

          <Button onClick={() => setAddModalOpen(true)} variant="primary" size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Calendar Task
          </Button>
        </div>
      </div>

      {/* Google Calendar Connection Status Banner */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          <div>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              Google Calendar Integration:
            </span>{' '}
            {googleCalendar.isConnected ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Connected ({googleCalendar.userEmail || 'Primary Calendar'}) • {googleCalendar.syncedEventCount} Synced
              </span>
            ) : (
              <span className="text-neutral-500 dark:text-neutral-400">
                Not connected. Tasks remain local in AI Creator OS until synchronized.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!googleCalendar.isConnected && (
            <Button
              onClick={() => router.push('/settings?tab=google')}
              variant="outline"
              size="sm"
              className="text-xs h-7"
            >
              Configure in Settings
            </Button>
          )}
        </div>
      </div>

      {/* View switch & Stage Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStage('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
              filterStage === 'ALL'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            All Stages ({calendar.length})
          </button>

          {STAGES.map((st) => {
            const count = calendar.filter((c) => c.stage === st).length;
            return (
              <button
                key={st}
                onClick={() => setFilterStage(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                  filterStage === st
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{st}</span>
                {count > 0 && <span className="opacity-75 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded text-xs cursor-pointer ${
              viewMode === 'grid' ? 'bg-white dark:bg-neutral-700 shadow-2xs text-neutral-900 dark:text-neutral-100 font-bold' : 'text-neutral-500'
            }`}
            title="Grid view"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded text-xs cursor-pointer ${
              viewMode === 'list' ? 'bg-white dark:bg-neutral-700 shadow-2xs text-neutral-900 dark:text-neutral-100 font-bold' : 'text-neutral-500'
            }`}
            title="Task list view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            syncMessage.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <span>{syncMessage.text}</span>
          <button onClick={() => setSyncMessage(null)} className="cursor-pointer">&times;</button>
        </div>
      )}

      {/* CALENDAR ENTRIES DISPLAY */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => {
            const pillarInfo = CONTENT_PILLARS.find((p) => p.id === entry.pillar);

            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-neutral-400 font-mono">
                      {formatDate(entry.plannedDate)} • {entry.plannedTime || '17:00'}
                    </span>

                    <Badge
                      variant={entry.isSyncedToGoogle ? 'success' : 'outline'}
                      className="text-[10px] py-0"
                    >
                      {entry.isSyncedToGoogle ? 'Synced with Google' : 'Local App Only'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${pillarInfo?.color}18`, color: pillarInfo?.color }}
                    >
                      {pillarInfo?.shortTitle || entry.pillar}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {entry.format}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug">
                    {entry.title}
                  </h3>

                  {entry.notes && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {entry.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs">
                  {/* Stage Dropdown */}
                  <select
                    value={entry.stage}
                    onChange={(e) => updateCalendarEntry(entry.id, { stage: e.target.value as CalendarStage })}
                    className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-800 dark:text-neutral-200 cursor-pointer"
                  >
                    {STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => handleSyncToGoogle(entry.id)}
                      variant="outline"
                      size="sm"
                      isLoading={syncingEntryId === entry.id}
                      className="text-xs h-7 px-2"
                      title={entry.isSyncedToGoogle ? 'Update in Google Calendar' : 'Sync to Google Calendar'}
                    >
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {entry.isSyncedToGoogle ? 'Re-Sync' : 'Sync GCal'}
                    </Button>

                    <button
                      onClick={() => deleteCalendarEntry(entry.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Task List View */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden text-xs">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-400 text-[11px]">{entry.plannedDate}</span>
                    <Badge variant="outline" className="text-[10px] py-0">{entry.format}</Badge>
                    <Badge variant={entry.isSyncedToGoogle ? 'success' : 'secondary'} className="text-[10px] py-0">
                      {entry.isSyncedToGoogle ? 'Google Synced' : 'Local'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {entry.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={entry.stage}
                    onChange={(e) => updateCalendarEntry(entry.id, { stage: e.target.value as CalendarStage })}
                    className="text-xs font-semibold py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-800 dark:text-neutral-200 cursor-pointer"
                  >
                    {STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={() => handleSyncToGoogle(entry.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                  >
                    Sync
                  </Button>

                  <button
                    onClick={() => deleteCalendarEntry(entry.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD CALENDAR TASK MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Add Calendar Task
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Film Voice Mimicry Masterclass"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Planned Date
                  </label>
                  <input
                    type="date"
                    required
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Planned Time
                  </label>
                  <input
                    type="time"
                    value={plannedTime}
                    onChange={(e) => setPlannedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as CalendarStage)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    {STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ContentFormat)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                  >
                    <option value="REELS">Reels / Shorts</option>
                    <option value="CAROUSEL">Carousel Deck</option>
                    <option value="STORY">Story</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Content Pillar
                </label>
                <select
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value as ContentPillar)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 cursor-pointer"
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
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring microphone to desk, test terminal font size."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
