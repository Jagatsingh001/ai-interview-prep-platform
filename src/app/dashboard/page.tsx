'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

interface DashboardData {
  totalSessions: number;
  averageScore: number;
  scoreTrend: { session: string; date: string; score: number; mode: string; role: string }[];
  modeBreakdown: { mode: string; count: number; averageScore: number }[];
  skillAverages: { communication: number; technical: number; confidence: number } | null;
  latestResumeScore: number | null;
  recentSessions: { id: string; role: string; mode: string; score: number | null; completedAt: string }[];
}

const CHART_COLORS = {
  accent: '#E8A33D',
  success: '#4C9A6A',
  danger: '#C4573B',
  muted: '#9AA5BD',
  grid: '#2C3856',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const userRes = await fetch('/api/demo-user');
        const { userId } = await userRes.json();

        const res = await fetch(`/api/dashboard?userId=${userId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load dashboard');
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen studio-ambience px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-studio-muted text-sm hover:text-studio-text transition">← Back home</a>

        <h1 className="font-display font-bold text-3xl mt-8">Performance dashboard</h1>
        <p className="text-studio-muted mt-2">Your progress across every mock interview and coding round.</p>

        {loading && <p className="text-studio-accent text-sm mt-8 font-mono">Loading your data…</p>}
        {error && <p className="text-studio-danger text-sm mt-8">{error}</p>}

        {data && data.totalSessions === 0 && (
          <div className="mt-12 bg-studio-panel border border-studio-border rounded-xl p-8 text-center">
            <p className="text-studio-text font-display text-lg">No completed sessions yet</p>
            <p className="text-studio-muted text-sm mt-2">
              Finish a mock interview or coding round and your progress will show up here.
            </p>
            <a
              href="/interview"
              className="inline-block mt-6 bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition"
            >
              Start your first interview
            </a>
          </div>
        )}

        {data && data.totalSessions > 0 && (
          <div className="mt-8 space-y-10">
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
                <p className="text-studio-muted text-xs">Sessions completed</p>
                <p className="font-display font-bold text-3xl mt-1 text-studio-text">{data.totalSessions}</p>
              </div>
              <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
                <p className="text-studio-muted text-xs">Average score</p>
                <p className="font-display font-bold text-3xl mt-1 text-studio-accent">{data.averageScore}</p>
              </div>
              <div className="bg-studio-panel border border-studio-border rounded-lg p-5">
                <p className="text-studio-muted text-xs">Latest resume ATS score</p>
                <p className="font-display font-bold text-3xl mt-1 text-studio-text">
                  {data.latestResumeScore ?? '—'}
                </p>
              </div>
            </div>

            {/* Score trend line chart */}
            <div className="bg-studio-panel border border-studio-border rounded-xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Score over time</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.scoreTrend}>
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="session" stroke={CHART_COLORS.muted} fontSize={12} />
                  <YAxis domain={[0, 100]} stroke={CHART_COLORS.muted} fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#1B2436', border: '1px solid #2C3856', borderRadius: 8 }}
                    labelStyle={{ color: '#F1EEE6' }}
                  />
                  <Line type="monotone" dataKey="score" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Mode breakdown bar chart */}
            <div className="bg-studio-panel border border-studio-border rounded-xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Average score by session type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.modeBreakdown}>
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="mode" stroke={CHART_COLORS.muted} fontSize={12} />
                  <YAxis domain={[0, 100]} stroke={CHART_COLORS.muted} fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#1B2436', border: '1px solid #2C3856', borderRadius: 8 }}
                    labelStyle={{ color: '#F1EEE6' }}
                  />
                  <Bar dataKey="averageScore" fill={CHART_COLORS.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skill averages */}
            {data.skillAverages && (
              <div>
                <h3 className="font-display font-semibold text-lg mb-4">Skill averages (interview sessions)</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Communication', value: data.skillAverages.communication },
                    { label: 'Technical / Judgment', value: data.skillAverages.technical },
                    { label: 'Confidence', value: data.skillAverages.confidence },
                  ].map((m) => (
                    <div key={m.label} className="bg-studio-panel border border-studio-border rounded-lg p-4 text-center">
                      <p className="text-studio-muted text-xs">{m.label}</p>
                      <p className="font-display font-semibold text-2xl mt-1 text-studio-text">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent sessions list */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-4">Recent sessions</h3>
              <div className="space-y-2">
                {data.recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-studio-panel border border-studio-border rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-studio-text text-sm font-medium">{s.role}</p>
                      <p className="text-studio-muted text-xs font-mono">{s.mode}</p>
                    </div>
                    <p className="font-display font-semibold text-studio-accent">{s.score ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
