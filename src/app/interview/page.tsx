'use client';

import { useEffect, useRef, useState } from 'react';

type Stage = 'SETUP' | 'IN_PROGRESS' | 'DONE';

interface CurrentQuestion {
  id: string;
  text: string;
  category: string;
  order: number;
}

interface FeedbackResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  overallScore: number;
}

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Product Manager',
];

const SENIORITY_LEVELS = ['Entry', 'Mid', 'Senior'];

export default function InterviewPage() {
  const [stage, setStage] = useState<Stage>('SETUP');
  const [role, setRole] = useState(ROLES[0]);
  const [mode, setMode] = useState<'HR' | 'TECHNICAL'>('TECHNICAL');
  const [seniority, setSeniority] = useState('Mid');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<CurrentQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [transcript, setTranscript] = useState<{ q: string; a: string; category: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // --- Voice-to-text state ---
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [answeredVia, setAnsweredVia] = useState<'TEXT' | 'VOICE'>('TEXT');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const baseAnswerRef = useRef(''); // text that existed before this recording session started

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += chunk + ' ';
        } else {
          interimTranscript += chunk;
        }
      }

      const separator = baseAnswerRef.current.trim() ? ' ' : '';
      setAnswer(baseAnswerRef.current + separator + finalTranscript + interimTranscript);

      if (finalTranscript) {
        baseAnswerRef.current = baseAnswerRef.current + separator + finalTranscript;
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      baseAnswerRef.current = answer;
      setAnsweredVia('VOICE');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }

  async function startInterview() {
    setLoading(true);
    setError(null);
    try {
      const userRes = await fetch('/api/demo-user');
      const { userId } = await userRes.json();

      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, mode, seniority }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to start interview');

      setSessionId(data.sessionId);
      setQuestion(data.question);
      setStage('IN_PROGRESS');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim() || !question || !sessionId) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/interview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          answerText: answer,
          answeredVia,
          seniority,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit answer');

      setTranscript((t) => [...t, { q: question.text, a: answer, category: question.category }]);
      setAnswer('');
      baseAnswerRef.current = '';
      setAnsweredVia('TEXT');

      if (data.done) {
        setStage('DONE');
        fetchFeedback();
      } else {
        setQuestion(data.question);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeedback() {
    if (!sessionId) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate feedback');
      setFeedback(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate feedback');
    } finally {
      setFeedbackLoading(false);
    }
  }

  function startOver() {
    setStage('SETUP');
    setQuestion(null);
    setSessionId(null);
    setTranscript([]);
    setFeedback(null);
    setAnswer('');
  }

  return (
    <main className="min-h-screen studio-ambience px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-studio-muted text-sm hover:text-studio-text transition">← Back home</a>

        {stage === 'SETUP' && (
          <div className="mt-8">
            <h1 className="font-display font-bold text-3xl">Set up your mock interview</h1>
            <p className="text-studio-muted mt-2">Pick a role and mode — the interviewer adapts as you go.</p>

            <label className="block mt-8 text-sm text-studio-muted">Target role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-2 bg-studio-panel border border-studio-border rounded-lg px-4 py-3 text-studio-text focus:outline-none focus:border-studio-accent"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <label className="block mt-6 text-sm text-studio-muted">Interview mode</label>
            <div className="flex gap-3 mt-2">
              {(['TECHNICAL', 'HR'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2.5 rounded-lg border transition ${
                    mode === m
                      ? 'bg-studio-accent text-studio-bg border-studio-accent font-semibold'
                      : 'border-studio-border text-studio-muted hover:border-studio-accentDim'
                  }`}
                >
                  {m === 'TECHNICAL' ? 'Technical' : 'HR / Behavioral'}
                </button>
              ))}
            </div>

            <label className="block mt-6 text-sm text-studio-muted">Seniority level</label>
            <div className="flex gap-3 mt-2">
              {SENIORITY_LEVELS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeniority(s)}
                  className={`px-5 py-2.5 rounded-lg border transition ${
                    seniority === s
                      ? 'bg-studio-accent text-studio-bg border-studio-accent font-semibold'
                      : 'border-studio-border text-studio-muted hover:border-studio-accentDim'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {error && <p className="text-studio-danger text-sm mt-4">{error}</p>}

            <button
              onClick={startInterview}
              disabled={loading}
              className="mt-10 bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition disabled:opacity-50"
            >
              {loading ? 'Starting…' : 'Start interview'}
            </button>
          </div>
        )}

        {stage === 'IN_PROGRESS' && question && (
          <div className="mt-8">
            <div className="flex items-center gap-2 text-studio-accent text-sm font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-studio-accent recording-pulse" />
              Question {question.order} · {question.category} · {seniority} level
            </div>

            <div className="bg-studio-panel border border-studio-border rounded-xl p-6">
              <p className="font-display text-xl leading-relaxed">{question.text}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-studio-muted">Your answer</span>
              {voiceSupported ? (
                <button
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition ${
                    isRecording
                      ? 'border-studio-danger text-studio-danger'
                      : 'border-studio-border text-studio-muted hover:border-studio-accent hover:text-studio-accent'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRecording ? 'bg-studio-danger recording-pulse' : 'bg-studio-muted'
                    }`}
                  />
                  {isRecording ? 'Stop recording' : '🎤 Speak your answer'}
                </button>
              ) : (
                <span className="text-xs text-studio-muted">
                  Voice input needs Chrome or Edge
                </span>
              )}
            </div>

            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                baseAnswerRef.current = e.target.value;
                setAnsweredVia('TEXT');
              }}
              placeholder="Type your answer, or use the mic above…"
              rows={6}
              className="w-full mt-2 bg-studio-panel border border-studio-border rounded-lg px-4 py-3 text-studio-text placeholder:text-studio-muted focus:outline-none focus:border-studio-accent resize-none"
            />

            {error && <p className="text-studio-danger text-sm mt-2">{error}</p>}

            <button
              onClick={submitAnswer}
              disabled={loading || !answer.trim()}
              className="mt-4 bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition disabled:opacity-50"
            >
              {loading ? 'Thinking…' : 'Submit answer'}
            </button>

            {transcript.length > 0 && (
              <div className="mt-10">
                <p className="text-studio-muted text-sm mb-3">Earlier in this interview</p>
                <div className="space-y-3">
                  {transcript.map((t, i) => (
                    <div key={i} className="text-sm border-l-2 border-studio-border pl-4">
                      <p className="text-studio-muted">{t.category}</p>
                      <p className="text-studio-text mt-1">{t.q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {stage === 'DONE' && (
          <div className="mt-8">
            <h1 className="font-display font-bold text-3xl">Interview complete 🎬</h1>
            <p className="text-studio-muted mt-2">
              You answered {transcript.length} questions. Here&apos;s your feedback.
            </p>

            {feedbackLoading && (
              <p className="text-studio-accent text-sm mt-8 font-mono">Analyzing your interview…</p>
            )}

            {error && <p className="text-studio-danger text-sm mt-4">{error}</p>}

            {feedback && (
              <div className="mt-8 space-y-8">
                <div className="bg-studio-panel border border-studio-border rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-studio-muted text-sm">Overall score</p>
                    <p className="font-display font-bold text-4xl mt-1 text-studio-accent">
                      {feedback.overallScore}<span className="text-lg text-studio-muted">/100</span>
                    </p>
                  </div>
                  <p className="text-studio-text text-sm max-w-xs text-right">{feedback.summary}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Communication', value: feedback.communicationScore },
                    { label: mode === 'HR' ? 'Role judgment' : 'Technical', value: feedback.technicalScore },
                    { label: 'Confidence', value: feedback.confidenceScore },
                  ].map((m) => (
                    <div key={m.label} className="bg-studio-panel border border-studio-border rounded-lg p-4 text-center">
                      <p className="text-studio-muted text-xs">{m.label}</p>
                      <p className="font-display font-semibold text-2xl mt-1 text-studio-text">{m.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-display font-semibold text-lg text-studio-success">Strengths</h3>
                  <ul className="mt-3 space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-studio-text text-sm flex gap-2"><span className="text-studio-success">+</span> {s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-lg text-studio-accent">Areas to improve</h3>
                  <ul className="mt-3 space-y-2">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-studio-text text-sm flex gap-2"><span className="text-studio-accent">→</span> {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={startOver}
              className="inline-block mt-8 bg-studio-accent text-studio-bg font-semibold px-6 py-3 rounded-lg hover:shadow-glow transition"
            >
              Try another interview
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
