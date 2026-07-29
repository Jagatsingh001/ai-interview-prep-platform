import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { feedback: true },
      orderBy: { completedAt: 'asc' },
    });

    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalSessions = sessions.length;
    const averageScore = totalSessions
      ? Math.round(sessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / totalSessions)
      : 0;

    // Score trend for the line chart — one point per completed session, in order
    const scoreTrend = sessions.map((s, i) => ({
      session: `#${i + 1}`,
      date: s.completedAt ? s.completedAt.toISOString().slice(0, 10) : '',
      score: s.overallScore ?? 0,
      mode: s.mode,
      role: s.role,
    }));

    // Mode breakdown — how many sessions of each type, and their average score
    const modeMap: Record<string, { count: number; totalScore: number }> = {};
    for (const s of sessions) {
      if (!modeMap[s.mode]) modeMap[s.mode] = { count: 0, totalScore: 0 };
      modeMap[s.mode].count += 1;
      modeMap[s.mode].totalScore += s.overallScore ?? 0;
    }
    const modeBreakdown = Object.entries(modeMap).map(([mode, v]) => ({
      mode,
      count: v.count,
      averageScore: Math.round(v.totalScore / v.count),
    }));

    // Skill breakdown averaged across sessions that have full feedback (interview sessions, not coding)
    const withFeedback = sessions.filter((s) => s.feedback);
    const skillAverages = withFeedback.length
      ? {
          communication: Math.round(
            withFeedback.reduce((sum, s) => sum + (s.feedback?.communicationScore ?? 0), 0) / withFeedback.length
          ),
          technical: Math.round(
            withFeedback.reduce((sum, s) => sum + (s.feedback?.technicalScore ?? 0), 0) / withFeedback.length
          ),
          confidence: Math.round(
            withFeedback.reduce((sum, s) => sum + (s.feedback?.confidenceScore ?? 0), 0) / withFeedback.length
          ),
        }
      : null;

    return NextResponse.json({
      totalSessions,
      averageScore,
      scoreTrend,
      modeBreakdown,
      skillAverages,
      latestResumeScore: latestResume?.atsScore ?? null,
      recentSessions: sessions
        .slice(-5)
        .reverse()
        .map((s) => ({
          id: s.id,
          role: s.role,
          mode: s.mode,
          score: s.overallScore,
          completedAt: s.completedAt,
        })),
    });
  } catch (err) {
    console.error('Dashboard data error:', err);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
