import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/company-progress?userId=...&companySlug=...
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const companySlug = req.nextUrl.searchParams.get('companySlug');

    if (!userId || !companySlug) {
      return NextResponse.json({ error: 'userId and companySlug are required' }, { status: 400 });
    }

    const progress = await prisma.companyProgress.findUnique({
      where: { userId_companySlug: { userId, companySlug } },
    });

    return NextResponse.json({
      solvedQuestionIds: progress ? JSON.parse(progress.solvedQuestionIds) : [],
      mockTestsCompleted: progress?.mockTestsCompleted ?? 0,
    });
  } catch (err) {
    console.error('Company progress GET error:', err);
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
  }
}

// POST /api/company-progress — upsert progress. Body: { userId, companySlug, solvedQuestionIds?, mockTestsCompleted? }
export async function POST(req: NextRequest) {
  try {
    const { userId, companySlug, solvedQuestionIds, mockTestsCompleted } = await req.json();

    if (!userId || !companySlug) {
      return NextResponse.json({ error: 'userId and companySlug are required' }, { status: 400 });
    }

    const existing = await prisma.companyProgress.findUnique({
      where: { userId_companySlug: { userId, companySlug } },
    });

    const nextSolved = solvedQuestionIds ?? (existing ? JSON.parse(existing.solvedQuestionIds) : []);
    const nextMockTests = mockTestsCompleted ?? existing?.mockTestsCompleted ?? 0;

    const saved = await prisma.companyProgress.upsert({
      where: { userId_companySlug: { userId, companySlug } },
      update: { solvedQuestionIds: JSON.stringify(nextSolved), mockTestsCompleted: nextMockTests },
      create: {
        userId,
        companySlug,
        solvedQuestionIds: JSON.stringify(nextSolved),
        mockTestsCompleted: nextMockTests,
      },
    });

    return NextResponse.json({
      solvedQuestionIds: JSON.parse(saved.solvedQuestionIds),
      mockTestsCompleted: saved.mockTestsCompleted,
    });
  } catch (err) {
    console.error('Company progress POST error:', err);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
