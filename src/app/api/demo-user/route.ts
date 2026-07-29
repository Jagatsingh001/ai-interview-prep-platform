import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Temporary helper: since auth (login/signup) hasn't been built yet,
// this finds-or-creates a single demo user so the interview/resume/dashboard
// features have a userId to attach data to. Safe to delete once real auth exists.
export async function GET() {
  const DEMO_EMAIL = 'demo@preproom.local';

  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: DEMO_EMAIL,
        passwordHash: 'not-a-real-password', // replaced once real auth is added
      },
    });
  }

  return NextResponse.json({ userId: user.id });
}
