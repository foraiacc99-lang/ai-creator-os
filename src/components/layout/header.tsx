'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  RefreshCw,
  Sparkles,
  Cpu,
  Flame,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Creator Command Center', subtitle: 'Daily priorities & account telemetry' },
  '/analytics': { title: 'Instagram Analytics', subtitle: 'Growth velocity, retention, and content benchmarks' },
  '/strategist': { title: 'Your Personal Content Strategist', subtitle: 'Data-driven content recommendations & evidence' },
  '/ideas': { title: 'Content Ideas Library', subtitle: 'Searchable, filterable idea catalog' },
  '/scripts': { title: 'Script Studio', subtitle: 'AI short-form teleprompter & shot-by-shot writing' },
  '/reel-analyzer': { title: 'Reel Analyzer', subtitle: 'Video breakdown, hook score & narrative audit' },
  '/competitor': { title: 'Competitor Research', subtitle: 'Reverse-engineer top hooks and discover opportunities' },
  '/calendar': { title: 'Content Calendar', subtitle: 'Weekly & monthly schedule with AI auto-planner' },
  '/publishing': { title: 'Publishing Studio', subtitle: 'Post preparation, safe zones, and direct publishing' },
  '/coach': { title: 'Performance Coach', subtitle: 'Baseline audits, hypothesis testing & diagnostic coaching' },
  '/audience': { title: 'Audience Insights', subtitle: 'Demographics, active hours, and engagement signals' },
  '/chat': { title: 'AI Content Strategist Chat', subtitle: 'Conversational assistant with authorized data access' },
  '/saved': { title: 'Saved Content', subtitle: 'Bookmarked scripts, ideas, and high-performing posts' },
  '/reports': { title: 'Intelligence Reports', subtitle: 'Weekly & monthly summary exports' },
  '/settings': { title: 'Platform Settings', subtitle: 'AI models, Instagram authentication & style profile' },
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { account, isDemoMode, toggleDemoMode, syncInstagramData, autoPlanNext7Days, aiConfig } = useApp();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const pageInfo = PAGE_TITLES[pathname] || {
    title: 'AI Creator OS',
    subtitle: 'Instagram Content Strategist',
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncInstagramData();
    setIsSyncing(false);
  };

  const handleGeneratePlan = () => {
    autoPlanNext7Days();
    router.push('/calendar');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left title & mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-neutral-600 hover:text-neutral-900 rounded-lg lg:hidden hover:bg-neutral-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-neutral-900 tracking-tight leading-none">
              {pageInfo.title}
            </h1>
            {isDemoMode && (
              <Badge variant="warning" className="text-[10px] py-0 px-2 font-mono">
                DEMO DATA
              </Badge>
            )}
          </div>
          <p className="hidden sm:block text-xs text-neutral-400 mt-0.5 leading-none">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Toggle */}
        <button
          onClick={() => toggleDemoMode(!isDemoMode)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          title="Switch between live Instagram account and pre-seeded demo telemetry"
        >
          <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className="font-medium text-[11px]">{isDemoMode ? 'Demo Mode' : 'Live IG Mode'}</span>
        </button>

        {/* AI Model Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/60 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-neutral-500" />
          <span>{aiConfig.textModel}</span>
        </div>

        {/* Sync button */}
        <Button
          onClick={handleSync}
          variant="outline"
          size="sm"
          isLoading={isSyncing}
          className="text-xs h-8 px-2.5"
          title="Synchronize Instagram media and insights"
        >
          {!isSyncing && <RefreshCw className="w-3.5 h-3.5 mr-1" />}
          <span className="hidden sm:inline">Sync</span>
        </Button>

        {/* Quick Action: Generate Plan */}
        <Button
          onClick={handleGeneratePlan}
          variant="primary"
          size="sm"
          className="text-xs h-8 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
          <span className="hidden sm:inline">Generate My Next Content Plan</span>
          <span className="sm:hidden">Next Plan</span>
        </Button>
      </div>
    </header>
  );
};
