import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaudeForJSON } from '@/lib/ai';

// ---- Types for what Claude must return ----
interface NextQuestionResponse {
  question: string;
  category: string; // e.g. "Behavioral", "System Design", "DSA", "Leadership", "Conflict Resolution"
  isFinal: boolean; // true when the AI decides the interview should end
}

// Builds a mode-aware, seniority-aware system prompt.
// HR mode leans into STAR-method behavioral questions; Technical mode leans into role/skill depth.
function buildSystemPrompt(mode: 'HR' | 'TECHNICAL', seniority: string) {
  const shared = `You are an experienced interviewer conducting a realistic mock interview for a ${seniority}-level candidate.
Ask ONE question at a time. Adapt your next question based on the candidate's previous answer:
- If their answer was shallow, ask a deeper follow-up on the SAME topic.
- If their answer was strong, move to a NEW topic relevant to the role and seniority level.
- Keep questions realistic, concise, and specific — the way a real interviewer at a company would ask them.
- Calibrate difficulty and depth to the seniority level (e.g. Senior candidates should get questions about ownership, mentoring, and tradeoffs; Entry-level candidates should get more fundamentals-focused questions).
- After 6-8 questions, set isFinal to true to wrap up the interview.
Never break character or explain what you're doing — just ask the next question.`;

  if (mode === 'HR') {
    return `${shared}

This is an HR / Behavioral interview. Focus on behavioral questions that invite STAR-method answers
(Situation, Task, Action, Result) — e.g. teamwork, conflict resolution, leadership, handling failure,
prioritization, and culture fit. Use category values like "Behavioral", "Conflict Resolution", "Leadership",
"Culture Fit", "Growth & Feedback". Do NOT ask technical/coding questions in this mode.`;
  }

  return `${shared}

This is a Technical interview. Mix conceptual and role-specific technical questions with occasional
behavioral-technical questions (e.g. "tell me about a technical decision you disagreed with"). Use category
values like "System Design", "Core Concepts", "Debugging", "Architecture", "Technical Behavioral".`;
}

// POST /api/interview  — start a new interview session
export async function POST(req: NextRequest) {
  try {
    const { userId, role, mode, seniority } = await req.json();

    if (!userId || !role || !mode) {
      return NextResponse.json({ error: 'userId, role, and mode are required' }, { status: 400 });
    }

    const seniorityLevel = seniority || 'Mid';
    const systemPrompt = buildSystemPrompt(mode, seniorityLevel);

    const session = await prisma.interviewSession.create({
      data: { userId, role, mode, status: 'IN_PROGRESS' },
    });

    const first = await askClaudeForJSON<NextQuestionResponse>(
      systemPrompt,
      `Start a ${mode} mock interview for the role: "${role}" at ${seniorityLevel} level. Ask your first question.
      Respond as JSON: { "question": string, "category": string, "isFinal": boolean }`
    );

    const savedQuestion = await prisma.interviewQuestion.create({
      data: {
        sessionId: session.id,
        order: 1,
        questionText: first.question,
        category: first.category,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      question: { id: savedQuestion.id, text: first.question, category: first.category, order: 1 },
    });
  } catch (err) {
    console.error('Interview start error:', err);
    return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
  }
}

// PATCH /api/interview — submit an answer, get the next question (or end the interview)
export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, questionId, answerText, answeredVia, seniority } = await req.json();

    if (!sessionId || !questionId || !answerText) {
      return NextResponse.json({ error: 'sessionId, questionId, and answerText are required' }, { status: 400 });
    }

    // Save the candidate's answer to the current question
    await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: { answerText, answeredVia: answeredVia || 'TEXT' },
    });

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const seniorityLevel = seniority || 'Mid';
    const systemPrompt = buildSystemPrompt(session.mode as 'HR' | 'TECHNICAL', seniorityLevel);

    // Build the running transcript so Claude has full context
    const transcript = session.questions
      .map((q, i) => `Q${i + 1} (${q.category}): ${q.questionText}\nA${i + 1}: ${q.answerText ?? '(no answer yet)'}`)
      .join('\n\n');

    const nextOrder = session.questions.length + 1;

    const next = await askClaudeForJSON<NextQuestionResponse>(
      systemPrompt,
      `Role: "${session.role}" at ${seniorityLevel} level. Mode: ${session.mode}.
      Interview so far:\n\n${transcript}\n\n
      Based on the candidate's most recent answer, ask the next question (or wrap up if enough ground has been covered — this would be question #${nextOrder}).
      Respond as JSON: { "question": string, "category": string, "isFinal": boolean }`
    );

    if (next.isFinal) {
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
      return NextResponse.json({ done: true, sessionId });
    }

    const savedQuestion = await prisma.interviewQuestion.create({
      data: {
        sessionId,
        order: nextOrder,
        questionText: next.question,
        category: next.category,
      },
    });

    return NextResponse.json({
      done: false,
      question: { id: savedQuestion.id, text: next.question, category: next.category, order: nextOrder },
    });
  } catch (err) {
    console.error('Interview next-question error:', err);
    return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
  }
}
