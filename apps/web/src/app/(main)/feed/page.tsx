'use client';

import React from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { RightSidebar } from '../../../components/layout/RightSidebar';
import { FeedList } from '../../../components/feed/FeedList';

export default function FeedPage() {
  return (
    <div className="flex gap-8 items-start py-6">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <FeedList />
      </main>
      <RightSidebar />
    </div>
  );
}
