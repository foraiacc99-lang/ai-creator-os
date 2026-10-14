'use client';

import React from 'react';
import { AppProvider } from '@/lib/storage/store';
import { AppShell } from '@/components/layout/app-shell';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
};
