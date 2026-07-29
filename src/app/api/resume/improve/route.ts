import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaudeForJSON } from '@/lib/ai';

// Structured resume — shared shape with the DOCX/PDF export routes.
// Order here matches the intended display order: Header -> Summary -> Education -> Skills -> Projects -> Experience -> Certifications
export interface StructuredResume {
  name: string;
  contactLine: string; // "email | phone | city | linkedin.com/in/..."
  summary: string;
  education: { qualification: string; institution: string; dates: string }[]; // degree AND 10th/12th if present in the original
  skills: { category: string; items: string[] }[]; // e.g. { category: "Frontend", items: ["React", "CSS"] }
  projects: { name: string; bullets: string[] }[]; // 2-4 concise bullets each
  experience: { title: string; company: string; dates: string; bullets: string[] }[]; // 2-4 concise bullets each
  certifications: string[];
}

const RESUME_REWRITER_SYSTEM_PROMPT = `You are an expert resume writer and ATS specialist restructuring a resume
into a clean, one-page-friendly, ATS-optimized format. You will be given the candidate's original resume text plus
an analysis of its strengths, gaps, and suggestions.

STRICT RULES:
1. CONCISENESS: Every project and every job in "experience" gets AT MOST 2-4 short, punchy bullet points — never
   long paragraphs. Each bullet: objective/action + technologies or method + concrete outcome, in one line. Cut
   filler words ruthlessly.
2. SKILLS: Group skills into categories (e.g. "Programming Languages", "Frontend", "Backend", "Database", "Tools",
   "Cloud/DevOps") based on what's actually in the resume — never a single flat paragraph.
3. EDUCATION: Include the degree AND, if present anywhere in the original resume, Class 12 / Class 10 (or
   equivalent) — each as a separate entry, most recent first. Do not invent qualifications that aren't in the
   original.
4. NO AUTO JOB TITLE: Do not invent or guess a job title/headline for the candidate (e.g. do not label them "Java
   Full Stack Developer"). Candidates target different roles with the same resume — leave this out entirely.
5. ONE PAGE: Favor brevity everywhere so the final resume reasonably fits one page — trim anything not essential.
6. FACTS: Never invent employers, dates, degrees, or fabricate metrics that weren't reasonably implied by the
   original.
CRITICAL: Every string value must be valid JSON — escape newlines as \\n and quotes as \\".`;

export async function POST(req: NextRequest) {
  try {
    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const analysis = resume.analysis ? JSON.parse(resume.analysis) : null;

    const structured = await askClaudeForJSON<StructuredResume>(
      RESUME_REWRITER_SYSTEM_PROMPT,
      `Original resume:\n\n${resume.rawText}\n\n
      Analysis of gaps and suggestions to address:\n${JSON.stringify(analysis, null, 2)}\n\n
      Restructure and rewrite it now, following all the strict rules. Respond as JSON:
      { "name": string, "contactLine": string, "summary": string,
        "education": [{"qualification": string, "institution": string, "dates": string}],
        "skills": [{"category": string, "items": string[]}],
        "projects": [{"name": string, "bullets": string[]}],
        "experience": [{"title": string, "company": string, "dates": string, "bullets": string[]}],
        "certifications": string[] }`,
      3500
    );

    return NextResponse.json({ resume: structured });
  } catch (err) {
    console.error('Resume improvement error:', err);
    return NextResponse.json({ error: 'Failed to improve resume' }, { status: 500 });
  }
}
