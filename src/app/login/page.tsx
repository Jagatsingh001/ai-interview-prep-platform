'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn('credentials', { redirect: false, email, password });

    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen studio-ambience flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-3xl text-center">Log in</h1>
        <p className="text-studio-muted text-sm text-center mt-2">Welcome back to PrepRoom.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-studio-panel border border-studio-border rounded-lg px-4 py-2.5 text-studio-text focus:outline-none focus:border-studio-accent"
            />
          </div>

          {error && <p className="text-studio-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-studio-accent text-studio-bg font-semibold py-2.5 rounded-lg hover:shadow-glow transition disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-studio-muted text-sm text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-studio-accent hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
