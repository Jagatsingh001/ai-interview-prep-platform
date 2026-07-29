import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaudeForJSON } from '@/lib/ai';

interface ResumeAnalysis {
  atsScore: number; // 0-100
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

const RESUME_ANALYST_SYSTEM_PROMPT = `You are an expert technical recruiter and ATS (Applicant Tracking System) specialist.
Analyze the given resume text and return a structured, honest assessment:
- atsScore: 0-100, how well this resume would parse and rank in a typical ATS system (formatting clarity, keyword density, structure)
- summary: 2-3 sentence overall impression
- strengths: 3-5 specific things the candidate does well (be concrete, cite real content from the resume)
- gaps: 3-5 specific weaknesses or missing elements (e.g. no quantified impact, missing keywords for common roles, unclear formatting)
- suggestions: 3-5 concrete, actionable rewrite suggestions the candidate can apply immediately
Be honest and specific — generic feedback is not useful. Reference actual details from their resume.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'resume file and userId are required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Extract text from the PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse is CommonJS; dynamic import keeps it happy inside the Next.js server bundle
    const pdfParse = (await import('pdf-parse')).default;
    const parsed = await pdfParse(buffer);
    const rawText = parsed.text.trim();

    if (!rawText || rawText.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this PDF. Try a text-based (not scanned/image) resume.' },
        { status: 422 }
      );
    }

    // Ask the AI for a structured analysis
    const analysis = await askClaudeForJSON<ResumeAnalysis>(
      RESUME_ANALYST_SYSTEM_PROMPT,
      `Here is the candidate's resume text:\n\n${rawText}\n\nAnalyze it as instructed. Respond as JSON:
      { "atsScore": number, "summary": string, "strengths": string[], "gaps": string[], "suggestions": string[] }`,
      3000
    );

    const saved = await prisma.resume.create({
      data: {
        userId,
        fileName: file.name,
        rawText,
        analysis: JSON.stringify(analysis),
        atsScore: analysis.atsScore,
      },
    });

    return NextResponse.json({ resumeId: saved.id, analysis });
  } catch (err) {
    console.error('Resume analysis error:', err);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}
