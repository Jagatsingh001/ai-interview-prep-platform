'use client';

import { useState } from 'react';

type Stage = 'SETUP' | 'SOLVING' | 'EVALUATED';

interface CodingQuestion {
  title: string;
  prompt: string;
  examples: { input: string; output: string }[];
  constraints: string[];
  starterCode: string;
}

interface CodeEvaluation {
  correctness: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT';
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQualityNotes: string[];
  bugsOrEdgeCasesMissed: string[];
  improvementSuggestions: string[];
  overallFeedback: string;
}

const TOPICS = ['Arrays', 'Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++'];

function correctnessColor(c: string) {
  if (c === 'CORRECT') return 'text-studio-success';
  if (c === 'PARTIALLY_CORRECT') return 'text-studio-accent';
  return 'text-studio-danger';
}

export default function CodingPage() {
  const [stage, setStage] = useState<Stage>('SETUP');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateQuestion() {
    setLoading(true);
    setError(null);
    try {
      const userRes = await fetch('/api/demo-user');
      const { userId } = await userRes.json();

      const res = await fetch('/api/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic, difficulty, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate question');

      setSessionId(data.sessionId);
      setQuestionId(data.questionId);
      setQuestion(data.question);
      setCode(data.question.starterCode || '');
      setStage('SOLVING');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function submitCode() {
    if (!sessionId || !questionId || !code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coding/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionId, code, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to evaluate code');

      setEvaluation(data.evaluation);
      setStage('EVALUATED');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setStage('SETUP');
    setQuestion(null);
    setEvaluation(null);
    setCode('');
    setSessionId(null);
    setQuestionId(null);
  }

  return (
    <main className="min-h-screen studio-ambience px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-studio-muted text-sm hover:text-studio-text transition">← Back home</a>

        {stage === 'SETUP' && (
          <div className="mt-8 max-w-xl">
            <h1 className="font-display font-bold text-3xl">Coding round</h1>
            <p className="text-studio-muted mt-2">Pick a topic, difficulty, and language.</p>

            <label className="block mt-8 text-sm text-studio-muted">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full mt-2 bg-studio-panel border border-studio-border rounded-lg px-4 py-3 text-studio-text focus:outline-none focus:border-studio-accent"
            >
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <label className="block mt-6 text-sm text-studio-muted">Difficulty</label>
            <div className="flex gap-3 mt-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-5 py-2.5 rounded-lg border transition ${
                    difficulty === d
                      ? 'bg-studio-accent text-studio-bg border-studio-accent font-semibold'
                      : 'border-studio-border text-studio-muted hover:border-studio-accentDim'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <label className="block mt-6 text-sm text-studio-muted">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full mt-2 bg-studio-panel border border-studio-border rounded-lg px-4 py-3 text-studio-text focus:outline-none focus:border-studio-accent"
            >
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>

            {error && <p className="text-studio-danger text-sm mt-4">{error}</p>}

            <button
              onClick={generateQuestion}
              disabled={loading}
              className="mt-10 bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition disabled:opacity-50"
            >
              {loading ? 'Generating…' : 'Get a question'}
            </button>
          </div>
        )}

        {stage === 'SOLVING' && question && (
          <div className="mt-8">
            <div className="flex items-center gap-2 text-studio-accent text-sm font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-studio-accent recording-pulse" />
              {difficulty} · {topic}
            </div>

            <div className="bg-studio-panel border border-studio-border rounded-xl p-6">
              <h2 className="font-display font-semibold text-xl">{question.title}</h2>
              <p className="text-studio-text text-sm mt-3 leading-relaxed whitespace-pre-wrap">{question.prompt}</p>

              {question.examples?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {question.examples.map((ex, i) => (
                    <div key={i} className="font-mono text-xs bg-studio-bg rounded-lg p-3 border border-studio-border">
                      <p className="text-studio-muted">Input: <span className="text-studio-text">{ex.input}</span></p>
                      <p className="text-studio-muted">Output: <span className="text-studio-text">{ex.output}</span></p>
                    </div>
                  ))}
                </div>
              )}

              {question.constraints?.length > 0 && (
                <ul className="mt-4 text-xs text-studio-muted list-disc list-inside space-y-1">
                  {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
            </div>

            <label className="block mt-6 text-sm text-studio-muted">Your solution ({language})</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              spellCheck={false}
              className="w-full mt-2 bg-studio-panel border border-studio-border rounded-lg px-4 py-3 text-studio-text font-mono text-sm placeholder:text-studio-muted focus:outline-none focus:border-studio-accent resize-y"
            />

            {error && <p className="text-studio-danger text-sm mt-2">{error}</p>}

            <button
              onClick={submitCode}
              disabled={loading || !code.trim()}
              className="mt-4 bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition disabled:opacity-50"
            >
              {loading ? 'Evaluating…' : 'Submit for review'}
            </button>
          </div>
        )}

        {stage === 'EVALUATED' && evaluation && (
          <div className="mt-8 space-y-8">
            <div className="bg-studio-panel border border-studio-border rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-studio-muted text-sm">Score</p>
                <p className="font-display font-bold text-4xl mt-1 text-studio-accent">
                  {evaluation.score}<span className="text-lg text-studio-muted">/100</span>
                </p>
              </div>
              <p className={`font-display font-semibold ${correctnessColor(evaluation.correctness)}`}>
                {evaluation.correctness.replace('_', ' ')}
              </p>
            </div>

            <p className="text-studio-text">{evaluation.overallFeedback}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-studio-panel border border-studio-border rounded-lg p-4">
                <p className="text-studio-muted text-xs">Time complexity</p>
                <p className="font-mono text-studio-accent mt-1">{evaluation.timeComplexity}</p>
              </div>
              <div className="bg-studio-panel border border-studio-border rounded-lg p-4">
                <p className="text-studio-muted text-xs">Space complexity</p>
                <p className="font-mono text-studio-accent mt-1">{evaluation.spaceComplexity}</p>
              </div>
            </div>

            {evaluation.bugsOrEdgeCasesMissed?.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-lg text-studio-danger">Bugs / missed edge cases</h3>
                <ul className="mt-3 space-y-2">
                  {evaluation.bugsOrEdgeCasesMissed.map((b, i) => (
                    <li key={i} className="text-studio-text text-sm flex gap-2"><span className="text-studio-danger">−</span> {b}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-display font-semibold text-lg text-studio-accent">Improvement suggestions</h3>
              <ul className="mt-3 space-y-2">
                {evaluation.improvementSuggestions.map((s, i) => (
                  <li key={i} className="text-studio-text text-sm flex gap-2"><span className="text-studio-accent">→</span> {s}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={startOver}
              className="bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition"
            >
              Try another question
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
