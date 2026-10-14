'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/storage/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Lightbulb,
  FileEdit,
  Video,
  Search,
  Calendar,
  Send,
  Trophy,
  Users,
  MessageSquare,
  Bookmark,
  FileText,
  Settings,
  Flame,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { account, isDemoMode, ideas, calendar, scripts } = useApp();

  const scriptReadyCount = scripts.filter((s) => s.status === 'ready_for_filming').length;
  const scheduledCount = calendar.filter((c) => c.status === 'scheduled' || c.status === 'ready').length;

  const workspaceNav = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Instagram Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Strategist', href: '/strategist', icon: Sparkles, badge: 'AI' },
    { name: 'Content Ideas', href: '/ideas', icon: Lightbulb, count: ideas.length },
    { name: 'Script Studio', href: '/scripts', icon: FileEdit, count: scriptReadyCount > 0 ? scriptReadyCount : undefined },
    { name: 'Reel Analyzer', href: '/reel-analyzer', icon: Video },
    { name: 'Competitor Research', href: '/competitor', icon: Search },
    { name: 'Content Calendar', href: '/calendar', icon: Calendar, count: scheduledCount > 0 ? scheduledCount : undefined },
    { name: 'Publishing Studio', href: '/publishing', icon: Send },
    { name: 'Performance Coach', href: '/coach', icon: Trophy },
    { name: 'Audience Insights', href: '/audience', icon: Users },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare, badge: 'Active' },
  ];

  const managementNav = [
    { name: 'Saved Content', href: '/saved', icon: Bookmark },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#fbfbfb] border-r border-neutral-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-neutral-200/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              OS
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-neutral-900">AI Creator OS</div>
              <div className="text-[11px] font-medium text-neutral-400">Content Intelligence</div>
            </div>
          </Link>
        </div>

        {/* Account indicator card */}
        <div className="px-3 pt-3">
          <Link
            href="/settings"
            className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/80 bg-white hover:bg-neutral-50 transition-colors shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                {account.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={account.profilePictureUrl}
                    alt={account.username}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-semibold text-xs">
                    {account.username ? account.username[0]?.toUpperCase() : 'IG'}
                  </div>
                )}
                <span
                  className={cn(
                    'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white',
                    account.isConnected ? 'bg-emerald-500' : 'bg-amber-400'
                  )}
                />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-neutral-900 truncate">
                  @{account.username || 'Not Connected'}
                </div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                  {isDemoMode ? (
                    <span className="text-amber-600 font-medium">Demo Mode</span>
                  ) : account.isConnected ? (
                    <span className="text-emerald-600 font-medium">Live Account</span>
                  ) : (
                    <span>Offline</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-sm">
          {/* Workspace group */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
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
                      'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group',
                      isActive
                        ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded font-semibold',
                            isActive ? 'bg-neutral-800 text-neutral-200' : 'bg-purple-100 text-purple-700'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded font-medium',
                            isActive ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-700'
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
            <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              Management
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
                      'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group',
                      isActive
                        ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700'
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

        {/* Footer info & quick sync */}
        <div className="p-3 border-t border-neutral-200/80 bg-neutral-50/50">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Ollama Ready</span>
            </span>
            <span className="font-mono text-[10px] text-neutral-400">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
