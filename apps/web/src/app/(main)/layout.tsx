'use client';

import React from 'react';
import { FloatingChatWindow } from '../../components/chat/FloatingChatWindow';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingChatWindow />
    </>
  );
}
