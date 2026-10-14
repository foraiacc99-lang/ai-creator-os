'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Bookmark,
  Star,
  FileEdit,
  ArrowRight,
  Lightbulb,
  Video,
  Search,
  BookOpen,
  Layers,
  FileText,
  ExternalLink,
  Target,
  Download,
  Tag,
} from 'lucide-react';

export default function SavedContentPage() {
  const { ideas, scripts, research, competitors, reports, carousels, exportAllDataJSON } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'ideas' | 'scripts' | 'research' | 'competitors' | 'reports'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteIdeas = ideas.filter((i) => i.isFavorite);
  const readyScripts = scripts.filter((s) => s.status === 'ready_for_filming');

  const filteredIdeas = ideas.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScripts = scripts.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResearch = research.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReports = reports.filter(
    (rp) =>
      rp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rp.observations.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadBackup = () => {
    const json = exportAllDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_creator_os_knowledge_base_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Saved Content & Knowledge Base
            </h2>
            <Badge variant="secondary" className="text-xs font-mono">
              Central Repository
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Unified index cross-referencing your ideas, scripts, verified research findings, competitor breakdowns, and sprint notes.
          </p>
        </div>

        <Button onClick={handleDownloadBackup} variant="outline" size="sm" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1" /> Export Knowledge Base (JSON)
        </Button>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entire knowledge base across all records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'ideas', label: `Ideas (${ideas.length})` },
              { id: 'scripts', label: `Scripts (${scripts.length})` },
              { id: 'research', label: `Research (${research.length})` },
              { id: 'competitors', label: `Competitors (${competitors.length})` },
              { id: 'reports', label: `Reports & Notes (${reports.length})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as 'all' | 'ideas' | 'scripts' | 'research' | 'competitors' | 'reports')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTIONS */}
      <div className="space-y-6">
        {/* IDEAS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'ideas') && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Content Ideas ({filteredIdeas.length})
                </h3>
              </div>
              <Link href="/ideas" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                View Ideas Library &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">{idea.title}</span>
                      <Badge variant="outline" className="text-[10px] py-0">{idea.format}</Badge>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] line-clamp-2">
                      &ldquo;{idea.hook}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-200/60 dark:border-neutral-800">
                    <span>Status: {idea.status}</span>
                    <Link href="/scripts" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
                      Script Studio &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESEARCH SECTION */}
        {(activeCategory === 'all' || activeCategory === 'research') && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Verified Research Findings ({filteredResearch.length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {filteredResearch.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{res.title}</h4>
                    <Badge variant="outline" className="text-[10px] shrink-0">{res.confidenceStatus}</Badge>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px] line-clamp-3 leading-relaxed">
                    {res.summary}
                  </p>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[11px] pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{res.sourceName}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS & NOTES SECTION */}
        {(activeCategory === 'all' || activeCategory === 'reports') && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Sprint Reports & Reflection Notes ({filteredReports.length})
                </h3>
              </div>
              <Link href="/reports" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                View All Reports &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {filteredReports.map((rp) => (
                <div
                  key={rp.id}
                  className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{rp.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{rp.category}</Badge>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px] line-clamp-3 leading-relaxed">
                    {rp.observations}
                  </p>
                  <div className="text-[11px] text-neutral-400 pt-1 font-mono">
                    Date: {formatDate(rp.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
