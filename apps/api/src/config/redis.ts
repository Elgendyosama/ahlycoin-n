// In-Memory fallback cache & pubsub service interface for Redis

class InMemoryStore {
  private cache = new Map<string, any>();
  private listeners = new Map<string, Array<(payload: any) => void>>();

  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.cache.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.cache.delete(key), ttlSeconds * 1000);
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  publish(channel: string, message: any): void {
    const subs = this.listeners.get(channel) || [];
    subs.forEach((cb) => cb(message));
  }

  subscribe(channel: string, callback: (payload: any) => void): void {
    const subs = this.listeners.get(channel) || [];
    subs.push(callback);
    this.listeners.set(channel, subs);
  }
}

export const redisService = new InMemoryStore();
