'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Sparkles,
  Lightbulb,
  FileEdit,
  Layers,
  Search,
  Calendar,
  MessageSquare,
  Bookmark,
  TrendingUp,
  FileText,
  Settings,
  Radio,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

const XTwitterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { ideas, calendar, scripts, linkedinPosts, xPosts, aiConfig, theme, setTheme, preferences } = useApp();

  const scriptReadyCount = scripts.filter((s) => s.status === 'ready_for_filming').length;
  const scheduledCount = calendar.filter((c) => c.status === 'Ready to Publish' || c.stage === 'Shooting').length;
  const ideasInboxCount = ideas.filter((i) => i.status === 'Inbox').length;
  const linkedInCount = (linkedinPosts || []).filter((p) => p.status === 'Ready to Publish' || p.status === 'Draft').length;
  const xPostsCount = (xPosts || []).filter((p) => p.status === 'Ready to Publish' || p.status === 'Draft').length;

  const workspaceNav = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'AI Strategist', href: '/strategist', icon: Sparkles, badge: 'AI' },
    { name: 'Content Ideas', href: '/ideas', icon: Lightbulb, count: ideasInboxCount > 0 ? ideasInboxCount : ideas.length },
    { name: 'Script Studio', href: '/scripts', icon: FileEdit, count: scriptReadyCount > 0 ? scriptReadyCount : undefined },
    { name: 'X Posts', href: '/x', icon: XTwitterIcon, count: xPostsCount > 0 ? xPostsCount : undefined },
    { name: 'LinkedIn Posts', href: '/linkedin', icon: LinkedInIcon, count: linkedInCount > 0 ? linkedInCount : undefined },
    { name: 'Carousel & Stories', href: '/carousel', icon: Layers },
    { name: 'Competitor Research', href: '/competitor', icon: Search },
    { name: 'Content Calendar', href: '/calendar', icon: Calendar, count: scheduledCount > 0 ? scheduledCount : undefined },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  ];

  const managementNav = [
    { name: 'Saved Content', href: '/saved', icon: Bookmark },
    { name: 'Growth Tracker', href: '/analytics', icon: TrendingUp },
    { name: 'Reports & Notes', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-neutral-950 border-r border-neutral-200/90 dark:border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-xs border border-neutral-200/60 dark:border-neutral-800 shrink-0 bg-[#2f374a] flex items-center justify-center transition-transform group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="AI Creator OS Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {preferences.appName || 'AI Creator OS'}
              </div>
              <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                Personal Content OS
              </div>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-sm">
          {/* Workspace group */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
              Workspace
            </div>
            <nav className="space-y-0.5">
              {workspaceNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-white dark:text-neutral-950' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded font-semibold',
                            isActive ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-900' : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded font-medium',
                            isActive ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-900' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          )}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Management group */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
              Management & Intel
            </div>
            <nav className="space-y-0.5">
              {managementNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-white dark:text-neutral-950' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Theme toggle & AI status footer */}
        <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-2">
          {/* Theme switcher buttons */}
          <div className="flex items-center justify-between bg-neutral-200/60 dark:bg-neutral-800/80 p-1 rounded-lg text-xs">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all text-[11px] font-medium cursor-pointer',
                theme === 'light' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
              )}
              title="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all text-[11px] font-medium cursor-pointer',
                theme === 'dark' ? 'bg-neutral-900 text-white shadow-2xs font-semibold' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
              title="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all text-[11px] font-medium cursor-pointer',
                theme === 'system' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs font-semibold' : 'text-neutral-500 dark:text-neutral-400'
              )}
              title="System preference"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Auto</span>
            </button>
          </div>

          {/* AI Provider Status */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Radio className={cn('w-3 h-3', aiConfig.isConnected ? 'text-emerald-500 animate-pulse' : 'text-neutral-400')} />
              <span>{aiConfig.provider === 'ollama' ? 'Local Ollama' : aiConfig.provider}</span>
            </span>
            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              {aiConfig.textModel}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
