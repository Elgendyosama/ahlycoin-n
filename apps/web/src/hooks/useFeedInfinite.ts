import { useState, useEffect, useCallback } from 'react';
import { PostDTO } from '@sports-social/types';
import { fetchApi } from '../lib/api-client';

export function useFeedInfinite() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  const fetchFeed = useCallback(async (cursor?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const url = cursor ? `/feed?cursor=${cursor}` : '/feed';
      const data = await fetchApi<{ posts: PostDTO[]; nextCursor?: string }>(url);

      setPosts((prev) => (cursor ? [...prev, ...data.posts] : data.posts));
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const addPostToTop = (newPost: PostDTO) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePostInFeed = (updatedPost: Partial<PostDTO> & { id: string }) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
    );
  };

  return {
    posts,
    isLoading,
    error,
    nextCursor,
    fetchMore: () => fetchFeed(nextCursor),
    refresh: () => fetchFeed(),
    addPostToTop,
    updatePostInFeed,
  };
}
