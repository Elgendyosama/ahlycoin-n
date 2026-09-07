'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Shield, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/useAuthStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchApi<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, username, email, password }),
      });

      setAuth(data.user, data.token);
      router.push('/feed');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <img src="/logo.png" alt="Ahly Coin Logo" className="w-16 h-16 object-contain drop-shadow-xl" />
          <h1 className="text-2xl font-black text-slate-100">Create Ahly Coin Account</h1>
          <p className="text-xs text-slate-400">
            Join thousands of sports fans sharing live match coverage
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-sports-red/10 border border-sports-red/30 text-sports-red text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hassan Omar"
            required
          />

          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. hassan_tactics"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hassan@example.com"
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
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
