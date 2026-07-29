'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCompanyBySlug, APTITUDE_BANK, type AptitudeQuestion } from '@/data/companies';

type Tab = 'overview' | 'process' | 'questions' | 'aptitude' | 'tips' | 'progress';
type QuestionTab = 'coding' | 'technical' | 'hr';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'process', label: 'Interview Process' },
  { id: 'questions', label: 'Previous Questions' },
  { id: 'aptitude', label: 'Aptitude Practice' },
  { id: 'tips', label: 'Preparation Tips' },
  { id: 'progress', label: 'My Progress' },
];

function difficultyColor(d: string) {
  if (d === 'Easy') return 'text-studio-success';
  if (d === 'Medium') return 'text-studio-accent';
  return 'text-studio-danger';
}

// Simple accordion item used across the Questions tab
function Accordion({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-studio-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-studio-panelLight transition"
      >
        <div>
          <p className="text-studio-text text-sm font-medium">{title}</p>
          {subtitle && <p className="text-studio-muted text-xs mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-studio-muted text-sm">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-studio-border">{children}</div>}
    </div>
  );
}

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const company = getCompanyBySlug(slug);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [questionTab, setQuestionTab] = useState<QuestionTab>('coding');
  const [userId, setUserId] = useState<string | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [mockTestsCompleted, setMockTestsCompleted] = useState(0);

  // Aptitude quiz state
  const [quizCategory, setQuizCategory] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<AptitudeQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/demo-user');
      const { userId: uid } = await res.json();
      setUserId(uid);

      const progRes = await fetch(`/api/company-progress?userId=${uid}&companySlug=${slug}`);
      const prog = await progRes.json();
      setSolvedIds(prog.solvedQuestionIds || []);
      setMockTestsCompleted(prog.mockTestsCompleted || 0);
    }
    init();
  }, [slug]);

  // Quiz countdown timer
  useEffect(() => {
    if (!quizCategory || quizDone) return;
    if (timeLeft <= 0) {
      handleQuizAnswer(null); // auto-advance on timeout
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, quizCategory, quizDone]);

  if (!company) {
    return (
      <main className="min-h-screen studio-ambience px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-studio-text">Company not found.</p>
          <a href="/companies" className="text-studio-accent text-sm mt-4 inline-block">← Back to companies</a>
        </div>
      </main>
    );
  }

  async function toggleSolved(questionKey: string) {
    const next = solvedIds.includes(questionKey)
      ? solvedIds.filter((id) => id !== questionKey)
      : [...solvedIds, questionKey];
    setSolvedIds(next);
    if (userId) {
      await fetch('/api/company-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, companySlug: slug, solvedQuestionIds: next }),
      });
    }
  }

  function startQuiz(categoryName: string) {
    const category = APTITUDE_BANK.find((c) => c.name === categoryName);
    if (!category) return;
    setQuizCategory(categoryName);
    setQuizQuestions(category.questions);
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizScore(0);
    setQuizDone(false);
    setTimeLeft(20);
  }

  function handleQuizAnswer(optionIndex: number | null) {
    const current = quizQuestions[quizIndex];
    const isCorrect = optionIndex !== null && optionIndex === current.correctIndex;
    if (isCorrect) setQuizScore((s) => s + 1);
    setQuizSelected(optionIndex);

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex((i) => i + 1);
        setQuizSelected(null);
        setTimeLeft(20);
      } else {
        setQuizDone(true);
        const nextCount = mockTestsCompleted + 1;
        setMockTestsCompleted(nextCount);
        if (userId) {
          fetch('/api/company-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, companySlug: slug, mockTestsCompleted: nextCount }),
          });
        }
      }
    }, 700);
  }

  const totalTrackable = company.codingQuestions.length + company.technicalQuestions.reduce((sum, s) => sum + s.questions.length, 0);
  const progressPercent = totalTrackable ? Math.round((solvedIds.length / totalTrackable) * 100) : 0;

  return (
    <main className="min-h-screen studio-ambience px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <a href="/companies" className="text-studio-muted text-sm hover:text-studio-text transition">← All companies</a>

        {/* Header */}
        <div className="flex items-center gap-4 mt-6">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center font-display font-bold text-white shrink-0"
            style={{ backgroundColor: company.color }}
          >
            {company.initials}
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl">{company.name}</h1>
            <p className="text-studio-accent text-sm font-mono mt-1">{company.expectedPackage}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-8 border-b border-studio-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-studio-accent text-studio-accent font-semibold'
                  : 'border-transparent text-studio-muted hover:text-studio-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {/* --- Overview --- */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <p className="text-studio-text leading-relaxed">{company.shortDescription}</p>

              <div>
                <h3 className="font-display font-semibold text-lg text-studio-accent">Eligibility Criteria</h3>
                <ul className="mt-3 space-y-1.5">
                  {company.eligibility.map((e, i) => (
                    <li key={i} className="text-studio-text text-sm flex gap-2"><span className="text-studio-accent">•</span> {e}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg text-studio-accent">Selection Process</h3>
                <ol className="mt-3 space-y-1.5">
                  {company.selectionProcess.map((s, i) => (
                    <li key={i} className="text-studio-text text-sm flex gap-2">
                      <span className="text-studio-accent font-mono">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-studio-panel border border-studio-border rounded-lg p-4">
                <p className="text-studio-muted text-xs">Expected Package</p>
                <p className="font-display font-semibold text-xl text-studio-text mt-1">{company.expectedPackage}</p>
              </div>
            </div>
          )}

          {/* --- Interview Process --- */}
          {activeTab === 'process' && (
            <div className="space-y-4">
              {company.interviewRounds.map((round, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-studio-accent text-studio-bg flex items-center justify-center font-display font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    {i < company.interviewRounds.length - 1 && <div className="w-px flex-1 bg-studio-border mt-1" />}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-display font-semibold text-studio-text">{round.name}</h4>
                    <p className="text-studio-muted text-sm mt-1">{round.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- Previous Year Questions --- */}
          {activeTab === 'questions' && (
            <div>
              <div className="flex gap-2 mb-6">
                {(['coding', 'technical', 'hr'] as QuestionTab[]).map((qt) => (
                  <button
                    key={qt}
                    onClick={() => setQuestionTab(qt)}
                    className={`px-4 py-2 rounded-lg text-sm border transition ${
                      questionTab === qt
                        ? 'bg-studio-accent text-studio-bg border-studio-accent font-semibold'
                        : 'border-studio-border text-studio-muted hover:border-studio-accentDim'
                    }`}
                  >
                    {qt === 'coding' ? 'Coding' : qt === 'technical' ? 'Technical' : 'HR'}
                  </button>
                ))}
              </div>

              {questionTab === 'coding' && (
                <div className="space-y-2">
                  {company.codingQuestions.map((q, i) => {
                    const key = `coding:${i}`;
                    const solved = solvedIds.includes(key);
                    return (
                      <div key={i} className="flex items-center justify-between bg-studio-panel border border-studio-border rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={solved} onChange={() => toggleSolved(key)} className="w-4 h-4 accent-[#E8A33D]" />
                          <div>
                            <p className="text-studio-text text-sm">{q.title}</p>
                            <p className="text-xs mt-0.5">
                              <span className={difficultyColor(q.difficulty)}>{q.difficulty}</span>
                              {q.year && <span className="text-studio-muted"> · {q.year} · {company.name}</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {questionTab === 'technical' && (
                <div className="space-y-3">
                  {company.technicalQuestions.map((subject) => (
                    <div key={subject.subject}>
                      <h4 className="text-studio-accent text-sm font-semibold font-mono mb-2">{subject.subject}</h4>
                      <div className="space-y-2">
                        {subject.questions.map((q, i) => {
                          const key = `technical:${subject.subject}:${i}`;
                          const solved = solvedIds.includes(key);
                          return (
                            <Accordion key={i} title={q.q}>
                              <div className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={solved}
                                  onChange={() => toggleSolved(key)}
                                  className="w-4 h-4 mt-0.5 accent-[#E8A33D] shrink-0"
                                />
                                <p className="text-studio-muted text-sm">{q.a}</p>
                              </div>
                            </Accordion>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {questionTab === 'hr' && (
                <div className="space-y-2">
                  {company.hrQuestions.map((q, i) => (
                    <Accordion key={i} title={q.q}>
                      <p className="text-studio-muted text-sm">💡 {q.tip}</p>
                    </Accordion>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- Aptitude Practice --- */}
          {activeTab === 'aptitude' && (
            <div>
              {!quizCategory && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {APTITUDE_BANK.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => startQuiz(cat.name)}
                      className="bg-studio-panel border border-studio-border rounded-lg p-5 text-left hover:border-studio-accentDim transition"
                    >
                      <h4 className="font-display font-semibold text-studio-text">{cat.name}</h4>
                      <p className="text-studio-muted text-xs mt-1">{cat.questions.length} questions · 20s each</p>
                    </button>
                  ))}
                </div>
              )}

              {quizCategory && !quizDone && quizQuestions[quizIndex] && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-studio-muted text-sm font-mono">
                      {quizCategory} · Q{quizIndex + 1}/{quizQuestions.length}
                    </p>
                    <p className={`font-mono text-sm ${timeLeft <= 5 ? 'text-studio-danger' : 'text-studio-accent'}`}>
                      ⏱ {timeLeft}s
                    </p>
                  </div>
                  <div className="bg-studio-panel border border-studio-border rounded-xl p-6">
                    <p className="text-studio-text">{quizQuestions[quizIndex].question}</p>
                    <div className="mt-4 space-y-2">
                      {quizQuestions[quizIndex].options.map((opt, i) => {
                        const isCorrectOpt = i === quizQuestions[quizIndex].correctIndex;
                        const isSelected = quizSelected === i;
                        let style = 'border-studio-border hover:border-studio-accentDim';
                        if (quizSelected !== null) {
                          if (isCorrectOpt) style = 'border-studio-success text-studio-success';
                          else if (isSelected) style = 'border-studio-danger text-studio-danger';
                        }
                        return (
                          <button
                            key={i}
                            disabled={quizSelected !== null}
                            onClick={() => handleQuizAnswer(i)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {quizDone && (
                <div className="text-center bg-studio-panel border border-studio-border rounded-xl p-10">
                  <p className="text-studio-muted text-sm">Your score</p>
                  <p className="font-display font-bold text-4xl text-studio-accent mt-1">
                    {quizScore}/{quizQuestions.length}
                  </p>
                  <button
                    onClick={() => setQuizCategory(null)}
                    className="mt-6 bg-studio-accent text-studio-bg font-semibold px-6 py-2.5 rounded-lg hover:shadow-glow transition"
                  >
                    Try another topic
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- Preparation Tips --- */}
          {activeTab === 'tips' && (
            <ul className="space-y-3">
              {company.preparationTips.map((tip, i) => (
                <li key={i} className="text-studio-text text-sm flex gap-2 bg-studio-panel border border-studio-border rounded-lg px-4 py-3">
                  <span className="text-studio-accent">✦</span> {tip}
                </li>
              ))}
            </ul>
          )}

          {/* --- My Progress --- */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-studio-panel border border-studio-border rounded-lg p-4 text-center">
                  <p className="text-studio-muted text-xs">Questions solved</p>
                  <p className="font-display font-bold text-2xl mt-1 text-studio-text">{solvedIds.length}/{totalTrackable}</p>
                </div>
                <div className="bg-studio-panel border border-studio-border rounded-lg p-4 text-center">
                  <p className="text-studio-muted text-xs">Mock tests completed</p>
                  <p className="font-display font-bold text-2xl mt-1 text-studio-text">{mockTestsCompleted}</p>
                </div>
                <div className="bg-studio-panel border border-studio-border rounded-lg p-4 text-center">
                  <p className="text-studio-muted text-xs">Prep progress</p>
                  <p className="font-display font-bold text-2xl mt-1 text-studio-accent">{progressPercent}%</p>
                </div>
              </div>

              <div>
                <p className="text-studio-muted text-sm mb-2">Overall progress</p>
                <div className="w-full h-3 bg-studio-panel border border-studio-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-studio-accent transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
