import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaudeForJSON } from '@/lib/ai';

interface CodingQuestion {
  title: string;
  prompt: string; // full problem description
  examples: { input: string; output: string }[];
  constraints: string[];
  starterCode: string; // a small function stub in the chosen language
}

const CODING_QUESTION_SYSTEM_PROMPT = `You are an interviewer creating a realistic coding interview question,
similar to what's asked at real tech companies (think LeetCode-style, but framed as an interview question).
Return a single well-formed problem with clear examples and constraints, plus a short starter code stub
(just a function signature with a comment, not a solution) in the requested language.
CRITICAL: the starterCode value must be valid JSON — escape every newline as \n and every double quote as \" inside it. Keep the starter code short (3-6 lines).`;
export async function POST(req: NextRequest) {
  try {
    const { userId, topic, difficulty, language } = await req.json();

    if (!userId || !topic || !difficulty || !language) {
      return NextResponse.json(
        { error: 'userId, topic, difficulty, and language are required' },
        { status: 400 }
      );
    }

    const generated = await askClaudeForJSON<CodingQuestion>(
      CODING_QUESTION_SYSTEM_PROMPT,
      `Generate a ${difficulty} difficulty coding interview question on the topic "${topic}".
      Provide a starter code stub in ${language}.
      Respond as JSON: { "title": string, "prompt": string, "examples": [{"input": string, "output": string}], "constraints": string[], "starterCode": string }`,
      2000
    );

    const session = await prisma.interviewSession.create({
      data: { userId, role: topic, mode: 'CODING', status: 'IN_PROGRESS' },
    });

    const question = await prisma.interviewQuestion.create({
      data: {
        sessionId: session.id,
        order: 1,
        questionText: JSON.stringify(generated),
        category: difficulty,
      },
    });

    return NextResponse.json({ sessionId: session.id, questionId: question.id, question: generated });
  } catch (err) {
    console.error('Coding question generation error:', err);
    return NextResponse.json({ error: 'Failed to generate coding question' }, { status: 500 });
  }
}
