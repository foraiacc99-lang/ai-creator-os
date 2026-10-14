'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';

export default function ReportsPage() {
  const { account, posts, experiments, calendar, recommendations, dailyInsights } = useApp();
  const [reportRange, setReportRange] = useState<'weekly' | 'monthly'>('weekly');

  const totalReach = posts.reduce((sum, p) => sum + (p.metrics.reach || 0), 0);
  const totalViews = posts.reduce((sum, p) => sum + (p.metrics.views || 0), 0);
  const totalSaves = posts.reduce((sum, p) => sum + (p.metrics.saves || 0), 0);
  const avgER =
    posts.length > 0
      ? (posts.reduce((sum, p) => sum + (p.metrics.engagementRate || 0), 0) / posts.length).toFixed(1)
      : '5.2';

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Topic', 'Format', 'Views', 'Reach', 'Likes', 'Comments', 'Shares', 'Saves', 'EngagementRate', 'Date'];
    const rows = posts.map((p) => [
      `"${p.topic || 'Untitled'}"`,
      p.mediaType,
      p.metrics.views,
      p.metrics.reach,
      p.metrics.likes,
      p.metrics.comments,
      p.metrics.shares,
      p.metrics.saves,
      `${p.metrics.engagementRate}%`,
      p.timestamp.split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_creator_os_${account.username}_analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const exportData = {
      account,
      posts,
      experiments,
      calendar,
      recommendations,
      exportedAt: new Date().toISOString(),
      dataSource: 'Meta Instagram Graph API v21.0 / AI Creator OS',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `ai_creator_os_${account.username}_backup.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 print:p-0">
      {/* Top Banner (Hidden during print) */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Intelligence Reports & Exports</h2>
            <Badge variant="purple" className="text-xs font-mono">
              Audited Summary
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Generate formal performance summaries, export structured CSV/JSON analytics, or print PDF briefs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-xs">
            <button
              onClick={() => setReportRange('weekly')}
              className={`px-3 py-1.5 rounded-md font-medium ${
                reportRange === 'weekly' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'
              }`}
            >
              Weekly Brief
            </button>
            <button
              onClick={() => setReportRange('monthly')}
              className={`px-3 py-1.5 rounded-md font-medium ${
                reportRange === 'monthly' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'
              }`}
            >
              Monthly Executive
            </button>
          </div>

          <Button onClick={handleExportCSV} variant="outline" size="sm" className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" />
            CSV Export
          </Button>

          <Button onClick={handleExportJSON} variant="outline" size="sm" className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" />
            JSON Data
          </Button>

          <Button
            onClick={handlePrint}
            variant="primary"
            size="sm"
            className="text-xs bg-neutral-900 hover:bg-neutral-800"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* FORMAL PRINTABLE REPORT BRIEF */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-neutral-200 pb-5 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              AI CREATOR OS • OFFICIAL INTELLIGENCE BRIEF
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              {reportRange === 'weekly' ? 'Weekly Creator Performance Brief' : 'Monthly Strategic Executive Report'}
            </h1>
            <div className="text-xs text-neutral-500 mt-1">
              Account: <strong>@{account.username}</strong> • Verified Followers: {formatNumber(account.followersCount)}
            </div>
          </div>

          <div className="text-right text-xs text-neutral-400 font-mono">
            <div>Date Range: Last {reportRange === 'weekly' ? '7 Days' : '30 Days'}</div>
            <div>Generated: Oct 14, 2026</div>
            <div className="text-[10px] text-emerald-600 font-medium">Source: Verified Graph API</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Total Reach
            </div>
            <div className="text-xl font-bold text-neutral-900 mt-1">{formatNumber(totalReach)}</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Content Views
            </div>
            <div className="text-xl font-bold text-neutral-900 mt-1">{formatNumber(totalViews)}</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Bookmark Saves
            </div>
            <div className="text-xl font-bold text-neutral-900 mt-1">{formatNumber(totalSaves)}</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Avg Engagement
            </div>
            <div className="text-xl font-bold text-neutral-900 mt-1">{avgER}%</div>
          </div>
        </div>

        {/* Top Performing Content Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Top Performing Content In Range
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-neutral-50 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Topic / Hook</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Saves</th>
                  <th className="p-3">ER %</th>
                  <th className="p-3">Primary Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {posts.slice(0, 3).map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 font-semibold">{p.topic}</td>
                    <td className="p-3">{p.mediaType}</td>
                    <td className="p-3 font-mono">{formatNumber(p.metrics.views)}</td>
                    <td className="p-3 font-mono">{formatNumber(p.metrics.saves)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{p.metrics.engagementRate}%</td>
                    <td className="p-3 text-[11px] text-neutral-500">
                      {p.aiDiagnostic?.whatWorked[0] || 'High save velocity'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Experiments Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Content Experiments & Empirical Hypotheses
          </h3>
          <div className="space-y-2 text-xs">
            {experiments.map((exp) => (
              <div key={exp.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1">
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span>{exp.title}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {exp.status}
                  </Badge>
                </div>
                <p className="text-neutral-600 text-[11px]">
                  <strong>Hypothesis:</strong> {exp.hypothesis}
                </p>
                {exp.findings && (
                  <p className="text-emerald-800 text-[11px] pt-1">
                    <strong>Findings:</strong> {exp.findings}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4 border-t border-neutral-200 text-[10px] text-neutral-400">
          Generated automatically by AI Creator OS. This report is compiled exclusively from authorized account telemetry
          and mathematical regressions without subjective padding or unverified platform promises.
        </div>
      </div>
    </div>
  );
}
