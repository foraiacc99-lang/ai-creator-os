'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber } from '@/lib/utils';
import { Bookmark, Star, FileEdit, ArrowRight, Lightbulb, Video } from 'lucide-react';

export default function SavedContentPage() {
  const { ideas, scripts, posts } = useApp();

  const favoriteIdeas = ideas.filter((i) => i.isFavorite);
  const readyScripts = scripts.filter((s) => s.status === 'ready_for_filming');
  const topSavedPosts = [...posts].sort((a, b) => b.metrics.saves - a.metrics.saves).slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Saved Content</h2>
            <Badge variant="secondary" className="text-xs font-mono">
              Knowledge Base
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl">
            Quick access to your starred ideas, ready-to-film scripts, and historical benchmark posts.
          </p>
        </div>
      </div>

      {/* Starred Ideas */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900">Starred Content Ideas ({favoriteIdeas.length})</h3>
          </div>
          <Link href="/ideas" className="text-xs text-neutral-500 hover:text-neutral-900">
            View All Ideas &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {favoriteIdeas.map((idea) => (
            <div key={idea.id} className="p-4 bg-neutral-50/70 border border-neutral-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">{idea.title}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {idea.format}
                </Badge>
              </div>
              <p className="text-neutral-500 text-[11px] line-clamp-2">{idea.description}</p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400">
                <span>{idea.objective}</span>
                <Link href="/scripts" className="font-semibold text-neutral-900 hover:underline">
                  Script Studio &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ready to Film Scripts */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-neutral-900">Scripts Ready for Filming ({readyScripts.length})</h3>
          </div>
          <Link href="/scripts" className="text-xs text-neutral-500 hover:text-neutral-900">
            Open Script Studio &rarr;
          </Link>
        </div>

        <div className="space-y-3 text-xs">
          {readyScripts.map((s) => (
            <div
              key={s.id}
              className="p-4 bg-neutral-50/70 border border-neutral-200/80 rounded-xl flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-neutral-900 block">{s.title}</span>
                <p className="text-neutral-500 text-[11px] mt-0.5 line-clamp-1">
                  &ldquo;{s.hookOptions[s.selectedHookIndex]}&rdquo;
                </p>
              </div>
              <Link href="/scripts">
                <Button variant="outline" size="sm" className="text-xs">
                  <FileEdit className="w-3 h-3 mr-1" />
                  Teleprompter
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
