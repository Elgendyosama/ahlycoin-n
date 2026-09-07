'use client';

import React from 'react';
import { useFeedInfinite } from '../../hooks/useFeedInfinite';
import { PostCard } from './PostCard';
import { CreatePost } from './CreatePost';
import { Button } from '../ui/Button';

export const FeedList: React.FC = () => {
  const { posts, isLoading, error, nextCursor, fetchMore, addPostToTop, updatePostInFeed } =
    useFeedInfinite();

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Create Post composer */}
      <CreatePost onPostCreated={addPostToTop} />

      {/* Feed Stream */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sports-red text-center text-sm">
          {error}
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onPostUpdated={updatePostInFeed} />
      ))}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-48 animate-pulse bg-slate-800/40" />
          ))}
        </div>
      )}

      {nextCursor && !isLoading && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" size="md" onClick={fetchMore}>
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
};
