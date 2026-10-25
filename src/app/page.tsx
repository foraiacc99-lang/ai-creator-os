'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Sparkles,
  ArrowRight,
  Video,
  FileEdit,
  Calendar,
  CheckCircle2,
  Clock,
  Lightbulb,
  Search,
  Plus,
  BookOpen,
  TrendingUp,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const {
    snapshots,
    ideas,
    scripts,
    calendar,
    research,
    reports,
    autoPlanRealisticSchedule,
    preferences,
    addGrowthSnapshot,
  } = useApp();

  const [addSnapshotOpen, setAddSnapshotOpen] = useState(false);
  const [newDate, setNewDate] = useState('2026-10-25');
  const [newFollowers, setNewFollowers] = useState<number>(76);
  const [newReach, setNewReach] = useState<number>(1579);
  const [newViews, setNewViews] = useState<number>(2420);
  const [newER, setNewER] = useState<number>(5.57);
  const [newNonFollowerReach, setNewNonFollowerReach] = useState<number>(61);
  const [newInteractions, setNewInteractions] = useState<number>(88);
  const [newAccountsEngaged, setNewAccountsEngaged] = useState<number>(28);
  const [newNotes, setNewNotes] = useState('');

  // Latest manual snapshot (chronologically latest)
  const sortedSnapshots = [...snapshots].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestSnapshot = sortedSnapshots[0] || null;
  const prevSnapshot = sortedSnapshots[1] || null;

  const followerChange =
    latestSnapshot && prevSnapshot && prevSnapshot.totalFollowers > 0
      ? +(((latestSnapshot.totalFollowers - prevSnapshot.totalFollowers) / prevSnapshot.totalFollowers) * 100).toFixed(1)
      : undefined;

  const reachChange =
    latestSnapshot && prevSnapshot && prevSnapshot.reach > 0
      ? +(((latestSnapshot.reach - prevSnapshot.reach) / prevSnapshot.reach) * 100).toFixed(1)
      : undefined;

  const viewsChange =
    latestSnapshot && prevSnapshot && prevSnapshot.totalViews > 0
      ? +(((latestSnapshot.totalViews - prevSnapshot.totalViews) / prevSnapshot.totalViews) * 100).toFixed(1)
      : undefined;

  // Real Weekly Progress from application records
  const contentPlannedCount = calendar.filter((c) => c.status !== 'Archived').length;
  const scriptsCompletedCount = scripts.filter((s) => s.status !== 'draft').length;
  const videosShotCount = calendar.filter((c) => c.stage === 'Shooting' || c.status === 'Shot').length;
  const videosEditedCount = calendar.filter((c) => c.stage === 'Editing' || c.status === 'Editing').length;
  const contentPublishedCount = calendar.filter((c) => c.status === 'Published').length;
  const remainingWorkCount = calendar.filter((c) => c.status !== 'Published').length;

  // Today's Focus determination
  const scriptReadyToShoot = scripts.find((s) => s.status === 'ready_for_filming');
  const ideaReadyToScript = ideas.find((i) => i.status === 'Ready to Script');
  const todayCalendarTask = calendar.find((c) => c.plannedDate === newDate);

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    addGrowthSnapshot({
      date: newDate,
      totalFollowers: Number(newFollowers),
      reach: Number(newReach),
      totalViews: Number(newViews),
      engagementRate: Number(newER),
      nonFollowerReachPercent: Number(newNonFollowerReach),
      totalInteractions: Number(newInteractions),
      nonFollowerInteractionRate: 25,
      accountsEngaged: Number(newAccountsEngaged),
      notes: newNotes,
      reportingPeriod: 'Monthly',
    });
    setAddSnapshotOpen(false);
    setNewNotes('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: Creator Focus & Persona */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Solo Creator Command Center
            </h2>
            <Badge variant="purple" className="text-xs font-mono">
              Empirical OS
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Documenting projects, learning sales, building automation systems, and growing without social media vanity metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              autoPlanRealisticSchedule();
              router.push('/calendar');
            }}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Calendar className="w-3.5 h-3.5 mr-1 text-neutral-500" />
            Plan Week
          </Button>

          <Button
            onClick={() => setAddSnapshotOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Log Growth Snapshot
          </Button>
        </div>
      </div>

      {/* TODAY'S FOCUS (Prompt Section 5) */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white dark:from-neutral-900 dark:to-neutral-950 dark:border dark:border-neutral-800 rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">
                Today&apos;s Recommended Production Focus
              </span>
            </div>
            <Badge variant="secondary" className="text-[11px] bg-neutral-800 text-neutral-200 border-neutral-700">
              Allocated: {preferences.availableFilmingHoursPerWeek}h / week
            </Badge>
          </div>

          {scriptReadyToShoot ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Shoot
                </span>
                <span className="text-xs text-neutral-300 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-neutral-400" /> ~{scriptReadyToShoot.estimatedDurationSeconds || 30}s speaking time
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {scriptReadyToShoot.title}
              </h3>
              <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                Opening Hook: &ldquo;{scriptReadyToShoot.hookOptions?.[scriptReadyToShoot.selectedHookIndex] || scriptReadyToShoot.currentSpokenScript.slice(0, 80)}...&rdquo;
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link href="/scripts">
                  <Button variant="primary" size="sm" className="bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-bold">
                    <Video className="w-3.5 h-3.5 mr-1.5 text-neutral-900" />
                    Open Teleprompter in Script Studio
                  </Button>
                </Link>
                <Link href="/calendar" className="text-xs text-neutral-300 hover:text-white flex items-center gap-1">
                  View in Content Calendar &rarr;
                </Link>
              </div>
            </div>
          ) : ideaReadyToScript ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Ready to Script
                </span>
                <span className="text-xs text-neutral-300 font-mono">
                  Est. Production: {ideaReadyToScript.estimatedProductionTime || 30} mins
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {ideaReadyToScript.title}
              </h3>
              <p className="text-xs text-neutral-300 max-w-2xl">
                Angle: {ideaReadyToScript.mainAngle || ideaReadyToScript.hook}
              </p>
              <div className="pt-2">
                <Link href="/scripts">
                  <Button variant="primary" size="sm" className="bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-bold">
                    <FileEdit className="w-3.5 h-3.5 mr-1.5 text-neutral-900" />
                    Write Script Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">No active script backlog for today!</h3>
              <p className="text-xs text-neutral-300 max-w-xl">
                Choose a recommendation from your AI Strategist or turn a saved research finding into your next video.
              </p>
              <div className="pt-2">
                <Link href="/strategist">
                  <Button variant="primary" size="sm" className="bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-700" />
                    Explore AI Strategist Recommendations
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MANUAL GROWTH METRICS (Prompt Section 5 & 15) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Manual Growth Metrics
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono">
                100% Manually Entered Data
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Latest snapshot date: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{latestSnapshot ? formatDate(latestSnapshot.date) : 'No snapshots'}</span>. Zero Instagram API dependencies.
            </p>
          </div>

          <Link href="/analytics" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:underline">
            Growth Tracker &rarr;
          </Link>
        </div>

        {latestSnapshot ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              label="Total Followers"
              value={latestSnapshot.totalFollowers.toLocaleString()}
              change={followerChange}
              changePeriod="vs previous snapshot"
            />
            <MetricCard
              label="Accounts Reached"
              value={latestSnapshot.reach.toLocaleString()}
              subtitle={latestSnapshot.nonFollowerReachPercent ? `${latestSnapshot.nonFollowerReachPercent}% non-followers` : undefined}
              change={reachChange}
              changePeriod="vs previous snapshot"
            />
            <MetricCard
              label="Total Views"
              value={latestSnapshot.totalViews.toLocaleString()}
              subtitle={latestSnapshot.totalInteractions ? `${latestSnapshot.totalInteractions} interactions` : undefined}
              change={viewsChange}
              changePeriod="vs previous snapshot"
            />
            <MetricCard
              label="Engagement Rate"
              value={`${latestSnapshot.engagementRate}%`}
              subtitle={latestSnapshot.accountsEngaged ? `${latestSnapshot.accountsEngaged} accounts engaged` : latestSnapshot.reportingPeriod || 'Configured ER'}
            />
          </div>
        ) : (
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center space-y-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">No growth snapshots recorded yet.</p>
            <Button onClick={() => setAddSnapshotOpen(true)} variant="outline" size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Log Your First Snapshot
            </Button>
          </div>
        )}
      </div>

      {/* WEEKLY PROGRESS (Prompt Section 5) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Weekly Execution Progress (Real Records)
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {remainingWorkCount} tasks remaining
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-medium">Planned</span>
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 block">{contentPlannedCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-medium">Scripted</span>
            <span className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1 block">{scriptsCompletedCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-medium">Shot</span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1 block">{videosShotCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-medium">Edited</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 block">{videosEditedCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-medium">Published</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">{contentPublishedCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-medium">Remaining</span>
            <span className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mt-1 block">{remainingWorkCount}</span>
          </div>
        </div>
      </div>

      {/* RESEARCH DISCOVERIES & QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Research Discoveries Feed (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Recent Saved Research Discoveries
              </h3>
            </div>
            <Link href="/saved" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              View Knowledge Base &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {research.slice(0, 3).map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800 space-y-2 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                      {res.title}
                    </h4>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 block">
                      {res.sourceName} • Retrieved {formatDate(res.retrievalDate)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {res.confidenceStatus}
                  </Badge>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {res.summary}
                </p>

                {res.url && (
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Source Link</span>
                    </a>

                    <Link
                      href={`/ideas?researchId=${res.id}`}
                      className="font-semibold text-neutral-900 dark:text-neutral-200 hover:underline text-[11px]"
                    >
                      Turn into Idea &rarr;
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (1 col) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Quick Creator Actions
            </h3>

            <div className="space-y-2 text-xs">
              <Link
                href="/ideas"
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Add Content Idea</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/scripts"
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <FileEdit className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Review a Script</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/carousel"
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Build Carousel Slides</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/competitor"
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Analyze Competitor Post</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/reports"
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-pink-600" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Add Report or Note</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/80 text-[11px] text-neutral-500 dark:text-neutral-400 mt-4">
            <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-0.5">Authenticity Notice</span>
            All metrics and reports are entered directly by you. The AI operates on verified saved facts with zero external profile scraping.
          </div>
        </div>
      </div>

      {/* LOG GROWTH SNAPSHOT MODAL */}
      {addSnapshotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Log Manual Growth Snapshot
              </h3>
              <button
                onClick={() => setAddSnapshotOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSnapshot} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Snapshot Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Total Followers
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newFollowers}
                    onChange={(e) => setNewFollowers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Total Reach
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newReach}
                    onChange={(e) => setNewReach(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Total Content Views
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newViews}
                    onChange={(e) => setNewViews(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Engagement Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    max={100}
                    value={newER}
                    onChange={(e) => setNewER(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 text-[11px]">
                    Non-Followers %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newNonFollowerReach}
                    onChange={(e) => setNewNonFollowerReach(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 text-[11px]">
                    Interactions
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newInteractions}
                    onChange={(e) => setNewInteractions(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 text-[11px]">
                    Accounts Engaged
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newAccountsEngaged}
                    onChange={(e) => setNewAccountsEngaged(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Context / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tested cold call video; saw spike in saved bookmarks."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setAddSnapshotOpen(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Save Snapshot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


