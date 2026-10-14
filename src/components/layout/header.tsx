'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Sparkles,
  Cpu,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Home Dashboard', subtitle: 'Today\'s content focus and execution workflow' },
  '/strategist': { title: 'AI Strategist', subtitle: 'Empirical recommendations across your 6 content pillars' },
  '/ideas': { title: 'Content Ideas Library', subtitle: 'Searchable, multi-pillar idea catalog with duplicate detection' },
  '/scripts': { title: 'Script Studio', subtitle: 'Short-form video writing, teleprompter, and automated reviewer' },
  '/carousel': { title: 'Carousel & Stories Studio', subtitle: 'Visual slide builder and story sequence planner' },
  '/competitor': { title: 'Competitor Research', subtitle: 'Public signals, transcript analysis, and opportunity engine' },
  '/calendar': { title: 'Content Calendar', subtitle: 'Realistic production stages and Google Calendar sync' },
  '/chat': { title: 'AI Chat Workspace', subtitle: 'Assistant answering using your real saved ideas and research' },
  '/saved': { title: 'Saved Content & Knowledge Base', subtitle: 'Interconnected ideas, scripts, repos, and research findings' },
  '/analytics': { title: 'Growth Tracker', subtitle: 'Manual growth snapshots and trend observations' },
  '/reports': { title: 'Reports & Notes', subtitle: 'Personal sprint reviews, cold call lessons, and experiments' },
  '/settings': { title: 'Settings', subtitle: 'Content pillars, Ollama/Groq AI, Google Calendar, and themes' },
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { aiConfig, autoPlanRealisticSchedule } = useApp();

  const pageInfo = PAGE_TITLES[pathname] || {
    title: 'AI Creator OS',
    subtitle: 'Personal Content Intelligence',
  };

  const handlePlanWeek = () => {
    autoPlanRealisticSchedule();
    router.push('/calendar');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left title & mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg lg:hidden hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {pageInfo.title}
            </h1>
          </div>
          <p className="hidden sm:block text-xs text-neutral-400 dark:text-neutral-500 mt-1 leading-none">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Provider Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-neutral-500" />
          <span>{aiConfig.provider === 'ollama' ? `Ollama (${aiConfig.textModel})` : aiConfig.provider}</span>
        </div>

        {/* Quick Add Idea */}
        <Button
          onClick={() => router.push('/ideas')}
          variant="outline"
          size="sm"
          className="text-xs h-8 px-2.5"
          title="Add a new content idea"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">New Idea</span>
        </Button>

        {/* Realistic Auto-Plan */}
        <Button
          onClick={handlePlanWeek}
          variant="primary"
          size="sm"
          className="text-xs h-8 px-3"
          title="Plan achievable slots based on your weekly filming bandwidth"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
          <span>Auto-Plan Week</span>
        </Button>
      </div>
    </header>
  );
};
