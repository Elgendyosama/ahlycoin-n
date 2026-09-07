'use client';

import React from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { RightSidebar } from '../../../components/layout/RightSidebar';
import { MatchesHub } from '../../../components/match/MatchesHub';

export default function MatchesPage() {
  return (
    <div className="flex gap-8 items-start py-6">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <MatchesHub />
      </main>
      <RightSidebar />
    </div>
  );
}
