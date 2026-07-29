import Link from 'next/link';

const features = [
  { label: 'Mock Interviewer', desc: 'AI asks, follows up, and adapts to your answers — HR or technical.' },
  { label: 'Voice or Text', desc: 'Speak your answers naturally; we transcribe and score delivery.' },
  { label: 'Resume Analysis', desc: 'Upload your resume for an ATS score and targeted rewrite suggestions.' },
  { label: 'Coding Round', desc: 'DSA and role-specific coding questions with live evaluation.' },
  { label: 'HR Simulation', desc: 'Behavioral questions calibrated to the role and seniority you pick.' },
  { label: 'Performance Dashboard', desc: 'Track scores across sessions and see exactly where to improve.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen studio-ambience">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="font-display font-bold text-xl tracking-tight">PrepRoom</span>
        <div className="flex items-center gap-6 text-sm text-studio-muted">
          <Link href="/interview" className="hover:text-studio-text transition">Interview</Link>
          <Link href="/coding" className="hover:text-studio-text transition">Coding</Link>
          <Link href="/resume" className="hover:text-studio-text transition">Resume</Link>
          <Link href="/companies" className="hover:text-studio-text transition">Companies</Link>
          <Link href="/dashboard" className="hover:text-studio-text transition">Dashboard</Link>
        </div>
      </nav>

      {/* Hero — the "on-air" signature moment */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-24 flex flex-col items-start">
        <div className="flex items-center gap-2 mb-6 text-studio-accent text-sm font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-studio-accent recording-pulse" />
          ON AIR
        </div>
        <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.05] max-w-3xl">
          Walk into your next interview like you&apos;ve already done it a dozen times.
        </h1>
        <p className="text-studio-muted text-lg mt-6 max-w-xl">
          PrepRoom runs full mock interviews — HR and technical — listens to your voice,
          reads your resume, and tells you exactly what to fix before the real thing.
        </p>
        <div className="flex gap-4 mt-10">
          <Link
            href="/interview"
            className="bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition"
          >
            Start a mock interview
          </Link>
          <Link
            href="/resume"
            className="border border-studio-border text-studio-text px-6 py-3 rounded-lg hover:border-studio-accent transition"
          >
            Analyze my resume
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.label}
              className="bg-studio-panel border border-studio-border rounded-xl p-6 hover:border-studio-accentDim transition"
            >
              <span className="font-mono text-xs text-studio-accent">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-display font-semibold text-lg mt-2">{f.label}</h3>
              <p className="text-studio-muted text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
