'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { ManualGrowthSnapshot } from '@/types';
import {
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  HelpCircle,
  Eye,
  Users,
  Award,
  Layers,
  Edit,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function GrowthTrackerPage() {
  const {
    snapshots,
    addGrowthSnapshot,
    updateGrowthSnapshot,
    deleteGrowthSnapshot,
    preferences,
    updatePreferences,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSnapId, setEditingSnapId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState('2026-10-14');
  const [totalFollowers, setTotalFollowers] = useState<number>(5200);
  const [reach, setReach] = useState<number>(42000);
  const [totalViews, setTotalViews] = useState<number>(65000);
  const [engagementRate, setEngagementRate] = useState<number>(6.8);
  const [notes, setNotes] = useState('');
  const [reportingPeriod, setReportingPeriod] = useState('Weekly');

  const latestSnapshot = snapshots[0] || null;
  const prevSnapshot = snapshots[1] || null;

  // Chart telemetry data (chronological ascending)
  const chartData = [...snapshots]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((s) => ({
      date: s.date.slice(5), // MM-DD
      followers: s.totalFollowers,
      reach: s.reach,
      views: s.totalViews,
      er: s.engagementRate,
    }));

  const handleOpenAdd = () => {
    setEditingSnapId(null);
    setDate(new Date().toISOString().split('T')[0]);
    if (latestSnapshot) {
      setTotalFollowers(latestSnapshot.totalFollowers);
      setReach(latestSnapshot.reach);
      setTotalViews(latestSnapshot.totalViews);
      setEngagementRate(latestSnapshot.engagementRate);
    }
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (snap: ManualGrowthSnapshot) => {
    setEditingSnapId(snap.id);
    setDate(snap.date);
    setTotalFollowers(snap.totalFollowers);
    setReach(snap.reach);
    setTotalViews(snap.totalViews);
    setEngagementRate(snap.engagementRate);
    setNotes(snap.notes || '');
    setReportingPeriod(snap.reportingPeriod || 'Weekly');
    setModalOpen(true);
  };

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSnapId) {
      updateGrowthSnapshot(editingSnapId, {
        date,
        totalFollowers: Number(totalFollowers),
        reach: Number(reach),
        totalViews: Number(totalViews),
        engagementRate: Number(engagementRate),
        notes,
        reportingPeriod,
      });
    } else {
      addGrowthSnapshot({
        date,
        totalFollowers: Number(totalFollowers),
        reach: Number(reach),
        totalViews: Number(totalViews),
        engagementRate: Number(engagementRate),
        notes,
        reportingPeriod,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Growth Tracker — 100% Manual Data
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              Zero Meta API
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            You manually enter 4 core metrics: Total Followers, Reach, Total Content Views, and Engagement Rate. No Instagram account connection or private API scraping is ever performed.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Log Snapshot
        </Button>
      </div>

      {/* Latest Metrics Summary Cards */}
      {latestSnapshot ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Followers"
            value={latestSnapshot.totalFollowers.toLocaleString()}
            subtitle={`Snapshot: ${formatDate(latestSnapshot.date)}`}
          />
          <MetricCard
            label="Reach"
            value={latestSnapshot.reach.toLocaleString()}
            subtitle={`Period: ${latestSnapshot.reportingPeriod || 'Weekly'}`}
          />
          <MetricCard
            label="Total Content Views"
            value={latestSnapshot.totalViews.toLocaleString()}
            subtitle="Aggregate Views"
          />
          <MetricCard
            label="Engagement Rate"
            value={`${latestSnapshot.engagementRate}%`}
            subtitle="Preserved Value"
          />
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
          <p className="text-xs text-neutral-500">No snapshots entered yet.</p>
          <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs">
            Log First Snapshot
          </Button>
        </div>
      )}

      {/* TREND VISUALIZATIONS */}
      {snapshots.length > 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Followers & Reach Trend */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Follower Growth & Reach Trend
                </h3>
                <span className="text-[11px] text-neutral-400">Based on your manually logged milestones</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#followerGrad)" name="Followers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Views & Engagement Rate Trend */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Engagement Rate Trend (%)
                </h3>
                <span className="text-[11px] text-neutral-400">Preserved manual engagement rates over time</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="erGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="er" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#erGrad)" name="Engagement Rate %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* AI OBSERVATIONS (Separating correlation from causation) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            AI Analytical Observations & Working Hypotheses
          </h3>
          <Badge variant="outline" className="text-[10px]">
            Empirical Rules
          </Badge>
        </div>

        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {latestSnapshot && prevSnapshot ? (
            <>
              Between <strong>{formatDate(prevSnapshot.date)}</strong> and <strong>{formatDate(latestSnapshot.date)}</strong>, your manually recorded reach moved from <strong>{prevSnapshot.reach.toLocaleString()}</strong> to <strong>{latestSnapshot.reach.toLocaleString()}</strong>.
              <br /><br />
              <strong>Observation:</strong> During this interval, you tested technical walkthroughs and cold-calling roleplays. While higher comment interaction correlates with practical code topics, we treat this as a hypothesis for your next sprint rather than guaranteed virality.
            </>
          ) : (
            'Log at least 2 manual snapshots over time to allow the AI to highlight observable trends between sprint periods.'
          )}
        </p>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-500 space-y-1">
          <span className="font-bold text-neutral-800 dark:text-neutral-200 block">Configurable ER Definition</span>
          <span>
            Current mode: <strong>Manual Preservation</strong>. When you enter engagement rate, the system preserves your exact calculation without inventing post-level interaction counts.
          </span>
        </div>
      </div>

      {/* SNAPSHOTS HISTORY TABLE */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden text-xs">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
            Manual Snapshot History ({snapshots.length})
          </h3>
          <Button onClick={handleOpenAdd} variant="outline" size="sm" className="text-xs h-7">
            <Plus className="w-3 h-3 mr-1" /> Log Snapshot
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200/80 dark:border-neutral-800 text-neutral-500 text-[11px]">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Followers</th>
                <th className="px-4 py-3 font-semibold">Reach</th>
                <th className="px-4 py-3 font-semibold">Total Views</th>
                <th className="px-4 py-3 font-semibold">Engagement Rate</th>
                <th className="px-6 py-3 font-semibold">Notes / Period</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50">
                  <td className="px-6 py-3.5 font-mono text-neutral-900 dark:text-neutral-100 font-semibold">
                    {formatDate(snap.date)}
                  </td>
                  <td className="px-4 py-3.5 font-mono">{snap.totalFollowers.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono">{snap.reach.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono">{snap.totalViews.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {snap.engagementRate}%
                  </td>
                  <td className="px-6 py-3.5 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                    {snap.notes || snap.reportingPeriod || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(snap)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                      title="Edit snapshot"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGrowthSnapshot(snap.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer"
                      title="Delete snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT SNAPSHOT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingSnapId ? 'Edit Growth Snapshot' : 'Log Manual Growth Snapshot'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
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
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
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
                    value={totalFollowers}
                    onChange={(e) => setTotalFollowers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
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
                    value={reach}
                    onChange={(e) => setReach(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
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
                    value={totalViews}
                    onChange={(e) => setTotalViews(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
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
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Reporting Period / Context Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Launched cold calling series; tested contrarian commands."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100"
                />
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
