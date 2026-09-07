'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '../../../../components/layout/Sidebar';
import { RightSidebar } from '../../../../components/layout/RightSidebar';
import { Avatar } from '../../../../components/ui/Avatar';
import { Button } from '../../../../components/ui/Button';
import { fetchApi } from '../../../../lib/api-client';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { UserDTO } from '@sports-social/types';
import { Users, Trophy, MessageSquare } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = (params?.username as string) || '';
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchApi<any>(`/users/${username}`);
        setProfile(data);
        setIsFollowing(data.isFollowing || false);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (username) loadProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!currentUser) return alert('Please login to follow creators');
    const targetState = !isFollowing;
    setIsFollowing(targetState);

    try {
      const endpoint = targetState ? `/users/${username}/follow` : `/users/${username}/unfollow`;
      const method = targetState ? 'POST' : 'DELETE';
      await fetchApi(endpoint, { method });
    } catch (error) {
      setIsFollowing(!targetState);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-8 items-start py-6">
        <Sidebar />
        <main className="flex-1 min-w-0 glass-card rounded-3xl p-8 h-96 animate-pulse bg-slate-800/40" />
        <RightSidebar />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex gap-8 items-start py-6">
        <Sidebar />
        <main className="flex-1 min-w-0 glass-card rounded-3xl p-8 text-center text-slate-400">
          User profile not found.
        </main>
        <RightSidebar />
      </div>
    );
  }

  const isSelf = currentUser?.username.toLowerCase() === username.toLowerCase();

  return (
    <div className="flex gap-8 items-start py-6">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Banner Header Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col gap-6 relative overflow-hidden bg-gradient-to-br from-slate-900 to-card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <Avatar src={profile.avatarUrl} name={profile.name} size="xl" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black text-slate-100">{profile.name}</h1>
                  {profile.favoriteTeam && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-extrabold border border-rose-500/20">
                      {profile.favoriteTeam.name} Fan
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">@{profile.username}</span>
                <p className="text-xs text-slate-300 max-w-md mt-2 leading-relaxed">
                  {profile.bio || 'Sports media creator & analyst.'}
                </p>
              </div>
            </div>

            {!isSelf && (
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                size="md"
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Following' : 'Follow Fan'}
              </Button>
            )}
          </div>

          {/* User Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-center">
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-100">{profile._count?.posts || 0}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Posts</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-100">{profile._count?.followers || 0}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-100">{profile._count?.following || 0}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">Following</span>
            </div>
          </div>
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}
