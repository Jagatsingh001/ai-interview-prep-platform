import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaudeForJSON } from '@/lib/ai';

interface FeedbackResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  communicationScore: number; // 0-100
  technicalScore: number; // 0-100
  confidenceScore: number; // 0-100
  overallScore: number; // 0-100
}

const FEEDBACK_SYSTEM_PROMPT = `You are a senior interviewer giving honest, specific, constructive feedback
after a mock interview. Base every point on what the candidate actually said — reference their real answers,
don't give generic advice. Score fairly: 100 is exceptional/hire-ready, 70-85 is solid with some gaps,
50-69 is underprepared in places, below 50 is significantly underprepared.
- communicationScore: clarity, structure, and confidence of how they expressed answers
- technicalScore: depth and correctness of their technical/role knowledge (for HR-only interviews, score this on how well they demonstrated role awareness and judgment)
- confidenceScore: how confidently and decisively they answered (not arrogance — assuredness)
- overallScore: your holistic assessment combining all of the above`;

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Reuse existing feedback if already generated for this session
    const existing = await prisma.feedback.findUnique({ where: { sessionId } });
    if (existing) {
      return NextResponse.json({
        summary: existing.summary,
        strengths: JSON.parse(existing.strengths),
        improvements: JSON.parse(existing.improvements),
        communicationScore: existing.communicationScore,
        technicalScore: existing.technicalScore,
        confidenceScore: existing.confidenceScore,
        overallScore: (await prisma.interviewSession.findUnique({ where: { id: sessionId } }))?.overallScore ?? 0,
      });
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const transcript = session.questions
      .map((q, i) => `Q${i + 1} (${q.category}): ${q.questionText}\nA${i + 1}: ${q.answerText ?? '(not answered)'}`)
      .join('\n\n');

    const feedback = await askClaudeForJSON<FeedbackResult>(
      FEEDBACK_SYSTEM_PROMPT,
      `Role: "${session.role}". Mode: ${session.mode}.\n\nFull interview transcript:\n\n${transcript}\n\n
      Give your assessment. Respond as JSON:
      { "summary": string, "strengths": string[], "improvements": string[], "communicationScore": number, "technicalScore": number, "confidenceScore": number, "overallScore": number }`,
      2000
    );

    await prisma.feedback.create({
      data: {
        sessionId,
        summary: feedback.summary,
        strengths: JSON.stringify(feedback.strengths),
        improvements: JSON.stringify(feedback.improvements),
        communicationScore: feedback.communicationScore,
        technicalScore: feedback.technicalScore,
        confidenceScore: feedback.confidenceScore,
      },
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { overallScore: feedback.overallScore },
    });

    return NextResponse.json(feedback);
  } catch (err) {
    console.error('Feedback generation error:', err);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
