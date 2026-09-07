'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { fetchApi } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [emailOrUsername, setEmailOrUsername] = useState('ahmed_red');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchApi<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
      });

      setAuth(data.user, data.token);
      router.push('/feed');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <img src="/logo.png" alt="Ahly Coin Logo" className="w-16 h-16 object-contain drop-shadow-xl" />
          <h1 className="text-2xl font-black text-slate-100">Welcome Back to Ahly Coin</h1>
          <p className="text-xs text-slate-400">
            Log in to join real-time match discussions and fan streams
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-sports-red/10 border border-sports-red/30 text-sports-red text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email or Username"
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="e.g. ahmed_red"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full gap-2">
            <span>Log In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
