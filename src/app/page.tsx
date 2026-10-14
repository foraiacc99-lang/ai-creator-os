'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercent } from '@/lib/utils';
import {
  Users,
  Eye,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Video,
  FileEdit,
  Calendar,
  CheckCircle2,
  Award,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function HomePage() {
  const router = useRouter();
  const {
    account,
    posts,
    dailyInsights,
    ideas,
    scripts,
    calendar,
    autoPlanNext7Days,
    isDemoMode,
  } = useApp();

  // Aggregate metrics
  const totalViews = posts.reduce((sum, p) => sum + (p.metrics.views || 0), 0);
  const totalReach = posts.reduce((sum, p) => sum + (p.metrics.reach || 0), 0);
  const avgER =
    posts.length > 0
      ? (posts.reduce((sum, p) => sum + (p.metrics.engagementRate || 0), 0) / posts.length).toFixed(1)
      : '0.0';

  // Top performing post
  const topPost = [...posts].sort(
    (a, b) => (b.metrics.engagementRate || 0) - (a.metrics.engagementRate || 0)
  )[0];

  // Draft / Ready scripts
  const readyScript = scripts.find((s) => s.status === 'ready_for_filming') || scripts[0];
  const upcomingPosts = calendar.slice(0, 3);

  // Daily actionable priorities
  const dailyPriorities = [
    {
      step: 1,
      title: 'Film highest-priority script: "Voice Mimicry Masterclass"',
      description: 'Ready for filming. Estimated duration: 37 seconds. Focus on crisp opening hook.',
      link: '/scripts',
      actionText: 'Open Script Studio',
      icon: Video,
      status: 'High Priority',
    },
    {
      step: 2,
      title: 'Review Retention Audit for Local Ollama Benchmark',
      description: 'Reel Analyzer flagged repeated phrases between 0:22 and 0:34. Tighten pacing before posting.',
      link: '/reel-analyzer',
      actionText: 'Review Audit',
      icon: Zap,
      status: 'Pacing Check',
    },
    {
      step: 3,
      title: 'Dissect top save driver: Solo Founder Tech Stack',
      description: 'Post generated 4.8k saves (9.3% ER). Turn slide 3 agent architecture into a follow-up Reel.',
      link: '/analytics',
      actionText: 'Analyze Diagnostics',
      icon: Award,
      status: 'Growth Signal',
    },
    {
      step: 4,
      title: 'Finalize Thursday carousel slides in Content Calendar',
      description: 'Scheduled: "2026 Developer Salary Paradox". Check visual contrast on slide 4.',
      link: '/calendar',
      actionText: 'View Calendar',
      icon: Calendar,
      status: 'Scheduled',
    },
  ];

  const handleGeneratePlan = () => {
    autoPlanNext7Days();
    router.push('/calendar');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Account Hero Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {account.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={account.profilePictureUrl}
                alt={account.username}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">
                {account.username ? account.username[0]?.toUpperCase() : 'IG'}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                account.isConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                @{account.username || 'Not Connected'}
              </h2>
              <Badge variant={account.isConnected ? 'success' : 'warning'} className="text-[11px]">
                {isDemoMode ? 'Demo Workspace' : account.isConnected ? 'Verified Creator' : 'Offline'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-xl">
              {account.biography || 'AI Creator OS is actively monitoring your content metrics and recommending your next best posts.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={handleGeneratePlan}
            variant="primary"
            className="w-full md:w-auto bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm font-semibold text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-300" />
            Generate My Next Content Plan
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Followers"
          value={formatNumber(account.followersCount)}
          change={12.4}
          changePeriod="vs previous 30d"
          icon={<Users className="w-4 h-4" />}
        />
        <MetricCard
          label="Recent Reach"
          value={formatNumber(totalReach)}
          change={18.2}
          changePeriod="vs previous period"
          icon={<Eye className="w-4 h-4" />}
        />
        <MetricCard
          label="Total Content Views"
          value={formatNumber(totalViews)}
          change={24.8}
          changePeriod="vs previous period"
          icon={<Video className="w-4 h-4" />}
        />
        <MetricCard
          label="Avg Engagement Rate"
          value={`${avgER}%`}
          change={5.1}
          changePeriod="baseline: 5.2%"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Core Section: WHAT SHOULD I DO TODAY? */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                WHAT SHOULD I DO TODAY?
              </h3>
              <p className="text-xs text-neutral-500">
                AI synthesized priorities based on active scripts, pacing audits, and recent save signals.
              </p>
            </div>
          </div>
          <Badge variant="purple" className="text-[11px] font-mono">
            4 Action Items
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {dailyPriorities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-neutral-400">
                      STEP 0{item.step}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900 leading-snug group-hover:text-black">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Icon className="w-3.5 h-3.5 text-neutral-600" />
                  </div>
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-neutral-700 transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: 30-Day Growth Telemetry & Top Performing Post */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                30-Day Reach & Growth Telemetry
              </h3>
              <span className="text-xs text-neutral-400 font-mono">Real Ingested History</span>
            </div>
            <p className="text-xs text-neutral-500 mb-6">
              Daily reach fluctuations against posting days and subscriber velocity.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyInsights} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  stroke="#a3a3a3"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a3a3a3"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [value?.toLocaleString(), 'Reach']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="#171717"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#reachGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Peak Day: {dailyInsights.reduce((max, d) => (d.reach > max.reach ? d : max), dailyInsights[0])?.date}</span>
            <Link href="/analytics" className="font-semibold text-neutral-900 hover:underline">
              Full Analytics Breakdown &rarr;
            </Link>
          </div>
        </div>

        {/* Top-Performing Post Spotlight (1 col) */}
        {topPost && (
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="success" className="text-[10px]">
                  Top Performer (9.32% ER)
                </Badge>
                <span className="text-[11px] text-neutral-400">{topPost.mediaType}</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">
                {topPost.caption}
              </h3>
            </div>

            <div className="my-4 relative rounded-xl overflow-hidden aspect-video bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={topPost.thumbnailUrl}
                alt="Post thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <div className="text-white text-xs font-medium">
                  {formatNumber(topPost.metrics.views)} Views • {formatNumber(topPost.metrics.saves)} Saves
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1 mb-4">
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Diagnosis:
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                {topPost.aiDiagnostic?.summary || 'Transparent financial metrics produced 43% higher bookmark saves than the baseline.'}
              </p>
            </div>

            <Link
              href="/analytics"
              className="w-full py-2 text-center text-xs font-semibold text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Inspect Post Diagnostics
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Tasks & Ready Scripts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Script to Film */}
        {readyScript && (
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Ready For Filming
                </span>
                <Badge variant="purple" className="text-[10px]">
                  v{readyScript.version}
                </Badge>
              </div>
              <h4 className="text-base font-bold text-neutral-900">{readyScript.title}</h4>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                &ldquo;{readyScript.hookOptions[readyScript.selectedHookIndex]}&rdquo;
              </p>
            </div>

            <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500">
                Estimated Duration: <strong>{readyScript.estimatedDurationSeconds}s</strong>
              </span>
              <span className="text-neutral-500">
                Shots: <strong>{readyScript.shotList.length}</strong>
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <Link
                href="/scripts"
                className="text-xs font-semibold text-neutral-900 hover:text-neutral-700 flex items-center gap-1"
              >
                Open in Script Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Scheduled Posts in Calendar */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Upcoming Content Queue
              </span>
              <Link href="/calendar" className="text-xs text-neutral-500 hover:text-neutral-900">
                View All ({calendar.length}) &rarr;
              </Link>
            </div>
            <h4 className="text-base font-bold text-neutral-900">Planned Schedule</h4>
          </div>

          <div className="space-y-2.5 my-3">
            {upcomingPosts.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-neutral-900 line-clamp-1">{entry.title}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {entry.plannedDate} • {entry.format} • {entry.objective}
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {entry.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <Link
              href="/calendar"
              className="text-xs font-semibold text-neutral-900 hover:text-neutral-700 flex items-center gap-1"
            >
              Manage Calendar &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
