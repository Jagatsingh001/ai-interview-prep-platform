import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// This endpoint originally returned a hardcoded placeholder "demo user" so
// every feature had a userId to work with before real auth existed. It now
// returns the REAL logged-in user's id from the session instead — every page
// that calls this (interview, coding, resume, dashboard, companies) keeps
// working exactly as before with zero changes needed on their end, they just
// now get a real user id instead of the demo one.
//
// The route path/name is kept as "demo-user" on purpose to avoid touching
// every page that calls it — a future cleanup could rename it to
// "current-user" and update the ~5 call sites, but that's purely cosmetic.
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  return NextResponse.json({ userId });
}
