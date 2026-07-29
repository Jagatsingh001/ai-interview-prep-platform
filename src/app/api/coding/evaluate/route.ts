import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaudeForJSON } from '@/lib/ai';

interface CodeEvaluation {
  correctness: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT';
  score: number; // 0-100
  timeComplexity: string;
  spaceComplexity: string;
  codeQualityNotes: string[];
  bugsOrEdgeCasesMissed: string[];
  improvementSuggestions: string[];
  overallFeedback: string;
}

const CODE_EVALUATOR_SYSTEM_PROMPT = `You are a senior software engineer conducting a technical interview code review.
Evaluate the candidate's code against the problem they were given. Be specific and honest — reference their
actual code and logic, not generic advice. Assess correctness, time/space complexity, code quality, and any
bugs or missed edge cases. Give constructive, actionable improvement suggestions.`;

export async function POST(req: NextRequest) {
  try {
    const { sessionId, questionId, code, language } = await req.json();

    if (!sessionId || !questionId || !code) {
      return NextResponse.json({ error: 'sessionId, questionId, and code are required' }, { status: 400 });
    }

    const question = await prisma.interviewQuestion.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const problem = JSON.parse(question.questionText);

    await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: { answerText: code },
    });

    const evaluation = await askClaudeForJSON<CodeEvaluation>(
      CODE_EVALUATOR_SYSTEM_PROMPT,
      `Problem:\n${problem.prompt}\n\nExamples: ${JSON.stringify(problem.examples)}\nConstraints: ${JSON.stringify(problem.constraints)}\n\n
      Candidate's ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n
      Evaluate it. Respond as JSON:
      { "correctness": "CORRECT"|"PARTIALLY_CORRECT"|"INCORRECT", "score": number, "timeComplexity": string, "spaceComplexity": string,
        "codeQualityNotes": string[], "bugsOrEdgeCasesMissed": string[], "improvementSuggestions": string[], "overallFeedback": string }`,
      1500
    );

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', completedAt: new Date(), overallScore: evaluation.score },
    });

    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error('Code evaluation error:', err);
    return NextResponse.json({ error: 'Failed to evaluate code' }, { status: 500 });
  }
}
