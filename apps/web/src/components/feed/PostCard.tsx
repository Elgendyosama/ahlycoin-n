'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Tv2, Send } from 'lucide-react';
import { PostDTO } from '@sports-social/types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { fetchApi } from '../../lib/api-client';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';

interface PostCardProps {
  post: PostDTO;
  onPostUpdated?: (updated: Partial<PostDTO> & { id: string }) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated }) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>([]);

  const handleLike = async () => {
    if (!user) return alert('Please login to like posts!');
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      await fetchApi(`/posts/${post.id}/like`, { method: 'POST' });
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount((prev) => (newLikedState ? prev - 1 : prev + 1));
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      const newComment = await fetchApi(`/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText }),
      });
      setCommentsList((prev) => [newComment, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setCommentText('');
    } catch (error: any) {
      alert(error.message || 'Failed to post comment');
    }
  };

  return (
    <article className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm bg-white flex flex-col gap-4 transition-all duration-200 hover:border-slate-300">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 group">
          <Avatar src={post.author.avatarUrl} name={post.author.name} size="md" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                {post.author.name}
              </span>
              {post.author.favoriteTeam && (
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-extrabold border border-rose-200">
                  {post.author.favoriteTeam.code}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">@{post.author.username}</span>
          </div>
        </Link>

        {/* Attached Match Tag */}
        {post.match && (
          <Link href={`/matches/${post.match.id}`}>
            <Badge variant="live" className="cursor-pointer hover:opacity-80">
              <Tv2 className="w-3 h-3" />
              <span>{post.match.homeTeam.code} {t('postActions.versus')} {post.match.awayTeam.code}</span>
            </Badge>
          </Link>
        )}
      </div>

      {/* Main Content */}
      <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{post.content}</p>

      {/* Media Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden max-h-96 bg-slate-100 border border-slate-200">
          <img src={post.mediaUrls[0]} alt="Post Attachment" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-500 text-xs font-semibold">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={handleLike}
            className={`min-h-[44px] px-2 flex items-center gap-2 transition-all active:scale-95 ${
              isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{t('postActions.like')} ({likesCount})</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="min-h-[44px] px-2 flex items-center gap-2 hover:text-rose-600 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('postActions.comment')} ({commentsCount})</span>
          </button>
        </div>

        <button className="min-h-[44px] px-2 flex items-center gap-1.5 hover:text-slate-900 transition-all active:scale-95">
          <Share2 className="w-4 h-4" />
          <span>{t('postActions.share')}</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-slate-200 flex flex-col gap-3">
          {user && (
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('postActions.writeComment')}
                className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {commentsList.map((c: any) => (
              <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Avatar src={c.user?.avatarUrl} name={c.user?.name || 'User'} size="sm" />
                  <span className="font-bold text-xs text-slate-900">{c.user?.name}</span>
                </div>
                <p className="text-xs text-slate-700 ltr:pl-8 rtl:pr-8">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
