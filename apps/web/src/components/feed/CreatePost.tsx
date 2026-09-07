'use client';

import React, { useState } from 'react';
import { Image, Tv2, Send } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { fetchApi } from '../../lib/api-client';
import { PostDTO } from '@sports-social/types';

interface CreatePostProps {
  onPostCreated: (newPost: PostDTO) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="glass-card rounded-2xl p-4 text-center border border-slate-200/80 shadow-sm bg-white flex items-center justify-between">
        <span className="text-sm text-slate-600">{t('postActions.joinDiscussion')}</span>
        <Button variant="primary" size="sm" onClick={() => (window.location.href = '/login')}>
          {t('postActions.logInToPost')}
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      const newPost = await fetchApi<PostDTO>('/posts', {
        method: 'POST',
        body: JSON.stringify({
          content,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          matchId: 'match-1', // Link default live match context
        }),
      });

      setContent('');
      setMediaUrl('');
      setShowMediaInput(false);
      onPostCreated(newPost);
    } catch (error: any) {
      alert(error.message || 'Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-200/80 shadow-sm bg-white flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar src={user.avatarUrl} name={user.name} size="md" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('postActions.postCreatorPlaceholder')}
          rows={3}
          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
        />
      </div>

      {showMediaInput && (
        <input
          type="text"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder={t('postActions.mediaUrlPlaceholder')}
          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
        />
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMediaInput(!showMediaInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px]"
          >
            <Image className="w-4 h-4 text-emerald-600" />
            <span>{t('postActions.attachMedia')}</span>
          </button>

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold">
            <Tv2 className="w-3.5 h-3.5" />
            <span>Al Ahly vs Real Madrid</span>
          </span>
        </div>

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!content.trim()}
          size="sm"
          className="gap-2 min-h-[44px]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t('postActions.publish')}</span>
        </Button>
      </div>
    </div>
  );
};
