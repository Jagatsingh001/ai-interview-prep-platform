'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Auto sign-in right after signup
      const signInRes = await signIn('credentials', { redirect: false, email, password });
      setLoading(false);

      if (signInRes?.error) {
        setError('Account created, but automatic login failed. Please log in manually.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen studio-ambience flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-3xl text-center">Create your account</h1>
        <p className="text-studio-muted text-sm text-center mt-2">Start practicing with PrepRoom.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm text-studio-muted mb-1.5">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-studio-panel border border-studio-border rounded-lg px-4 py-2.5 text-studio-text focus:outline-none focus:border-studio-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-studio-muted mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-studio-panel border border-studio-border rounded-lg px-4 py-2.5 text-studio-text focus:outline-none focus:border-studio-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-studio-muted mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-studio-panel border border-studio-border rounded-lg px-4 py-2.5 text-studio-text focus:outline-none focus:border-studio-accent"
            />
            <p className="text-studio-muted text-xs mt-1">At least 6 characters.</p>
          </div>

          {error && <p className="text-studio-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-studio-accent text-studio-bg font-semibold py-2.5 rounded-lg hover:shadow-glow transition disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-studio-muted text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-studio-accent hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
