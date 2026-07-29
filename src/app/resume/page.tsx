'use client';

import { useState } from 'react';

interface ResumeAnalysis {
  atsScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

interface StructuredResume {
  name: string;
  contactLine: string;
  summary: string;
  education: { qualification: string; institution: string; dates: string }[];
  skills: { category: string; items: string[] }[];
  projects: { name: string; bullets: string[] }[];
  experience: { title: string; company: string; dates: string; bullets: string[] }[];
  certifications: string[];
}

function scoreColor(score: number) {
  if (score >= 75) return 'text-studio-success';
  if (score >= 50) return 'text-studio-accent';
  return 'text-studio-danger';
}

// Renders the structured resume as an on-screen "paper" preview, so the
// person sees the actual polished layout before downloading anything.
function ResumePreview({ resume }: { resume: StructuredResume }) {
  return (
    <div className="bg-white text-[#1a1a1a] rounded-lg shadow-2xl p-10 max-w-[700px] mx-auto font-sans">
      <div className="text-center">
        <h2 className="text-2xl font-bold" style={{ color: '#1B3A5C' }}>{resume.name || 'Your Name'}</h2>
        {resume.contactLine && <p className="text-xs text-gray-500 mt-1">{resume.contactLine}</p>}
      </div>

      {resume.summary && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b pb-1" style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}>
            Professional Summary
          </h3>
          <p className="text-sm mt-2 leading-relaxed">{resume.summary}</p>
        </section>
      )}

      {resume.education?.length > 0 && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b pb-1" style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}>
            Education
          </h3>
          {resume.education.map((edu, i) => (
            <p key={i} className="text-sm mt-2">
              <span className="font-semibold">{edu.qualification} — {edu.institution}</span>{'   '}
              <span className="text-xs text-gray-500 italic">{edu.dates}</span>
            </p>
          ))}
        </section>
      )}

      {resume.skills?.length > 0 && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b pb-1" style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}>
            Skills
          </h3>
          <div className="mt-2 space-y-1">
            {resume.skills.map((group, i) => (
              <p key={i} className="text-sm">
                <span className="font-semibold" style={{ color: '#1B3A5C' }}>{group.category}: </span>
                <span>{group.items.join(', ')}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      {resume.projects?.length > 0 && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b pb-1" style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}>
            Projects
          </h3>
          {resume.projects.map((proj, i) => (
            <div key={i} className="mt-3">
              <p className="text-sm font-semibold">{proj.name}</p>
              <ul className="mt-1 space-y-1">
                {proj.bullets?.map((b, j) => (
                  <li key={j} className="text-sm flex gap-2"><span>•</span><span>{b}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b pb-1" style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}>
            Experience
          </h3>
          {resume.experience.map((job, i) => (
            <div key={i} className="mt-3">
              <p className="text-sm font-semibold">{job.title} — {job.company}</p>
              <p className="text-xs text-gray-500 italic">{job.dates}</p>
              <ul className="mt-1 space-y-1">
                {job.bullets?.map((b, j) => (
                  <li key={j} className="text-sm flex gap-2"><span>•</span><span>{b}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.certifications?.length > 0 && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b pb-1" style={{ color: '#1B3A5C', borderColor: '#1B3A5C' }}>
            Certifications
          </h3>
          <ul className="mt-2 space-y-1">
            {resume.certifications.map((c, i) => (
              <li key={i} className="text-sm flex gap-2"><span>•</span><span>{c}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [improving, setImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState<StructuredResume | null>(null);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const userRes = await fetch('/api/demo-user');
      const { userId } = await userRes.json();

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', userId);

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to analyze resume');

      setAnalysis(data.analysis);
      setResumeId(data.resumeId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleImprove() {
    if (!resumeId) return;
    setImproving(true);
    setError(null);
    try {
      const res = await fetch('/api/resume/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to improve resume');
      setImprovedResume(data.resume);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setImproving(false);
    }
  }

  async function downloadAs(format: 'pdf' | 'docx') {
    if (!improvedResume) return;
    setDownloading(format);
    setError(null);
    try {
      const res = await fetch(`/api/resume/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(improvedResume),
      });
      if (!res.ok) throw new Error(`Failed to generate ${format.toUpperCase()}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `improved-resume.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <main className="min-h-screen studio-ambience px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-studio-muted text-sm hover:text-studio-text transition">← Back home</a>

        <h1 className="font-display font-bold text-3xl mt-8">Resume analysis</h1>
        <p className="text-studio-muted mt-2">Upload a PDF resume for an ATS score and specific rewrite suggestions.</p>

        {/* Upload box */}
        <label
          className="mt-8 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-studio-border rounded-xl py-12 cursor-pointer hover:border-studio-accentDim transition"
        >
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className="text-studio-accent text-sm font-mono">PDF only</span>
          <span className="text-studio-text font-medium">
            {file ? file.name : 'Click to choose your resume'}
          </span>
        </label>

        {error && <p className="text-studio-danger text-sm mt-4">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-6 bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Analyze resume'}
        </button>

        {/* Results */}
        {analysis && (
          <div className="mt-12 space-y-8">
            <div className="bg-studio-panel border border-studio-border rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-studio-muted text-sm">ATS Score</p>
                <p className={`font-display font-bold text-4xl mt-1 ${scoreColor(analysis.atsScore)}`}>
                  {analysis.atsScore}<span className="text-lg text-studio-muted">/100</span>
                </p>
              </div>
              <p className="text-studio-text text-sm max-w-xs text-right">{analysis.summary}</p>
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg text-studio-success">Strengths</h3>
              <ul className="mt-3 space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-studio-text text-sm flex gap-2">
                    <span className="text-studio-success">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg text-studio-danger">Gaps</h3>
              <ul className="mt-3 space-y-2">
                {analysis.gaps.map((g, i) => (
                  <li key={i} className="text-studio-text text-sm flex gap-2">
                    <span className="text-studio-danger">−</span> {g}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg text-studio-accent">Suggestions</h3>
              <ul className="mt-3 space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-studio-text text-sm flex gap-2">
                    <span className="text-studio-accent">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resume Auto-Improve */}
            <div className="border-t border-studio-border pt-8">
              {!improvedResume && (
                <button
                  onClick={handleImprove}
                  disabled={improving}
                  className="bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition disabled:opacity-50"
                >
                  {improving ? 'Rebuilding your resume…' : '✨ Auto-improve my resume'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Improved resume preview — full width, outside the narrow column, so the "paper" reads naturally */}
      {improvedResume && (
        <div className="max-w-3xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-xl">Your improved resume</h3>
              <p className="text-studio-muted text-xs mt-1">
                Review before sending — always double-check facts, dates, and numbers.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadAs('pdf')}
                disabled={downloading !== null}
                className="text-sm bg-studio-accent text-studio-bg font-semibold px-4 py-2 rounded-lg hover:shadow-glow transition disabled:opacity-50"
              >
                {downloading === 'pdf' ? 'Generating…' : '⬇ Download PDF'}
              </button>
              <button
                onClick={() => downloadAs('docx')}
                disabled={downloading !== null}
                className="text-sm border border-studio-border px-4 py-2 rounded-lg hover:border-studio-accent hover:text-studio-accent transition disabled:opacity-50"
              >
                {downloading === 'docx' ? 'Generating…' : '⬇ Download DOCX'}
              </button>
            </div>
          </div>
          <ResumePreview resume={improvedResume} />
        </div>
      )}
    </main>
  );
}
