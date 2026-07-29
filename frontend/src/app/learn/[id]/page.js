'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function ModuleQuizPage() {
  const { id } = useParams();
  const router = useRouter();

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [phase, setPhase] = useState('lesson'); // lesson | quiz | results
  const [questions, setQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!id) return;
    api.getModule(id)
      .then(data => setModule(data.module))
      .catch(err => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const startQuiz = async () => {
    setQuizLoading(true);
    setLoadError('');
    try {
      const data = await api.getQuiz(id);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrent(0);
      setPhase('quiz');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setQuizLoading(false);
    }
  };

  const selectAnswer = (optionIndex) => {
    setAnswers(prev => { const next = [...prev]; next[current] = optionIndex; return next; });
  };

  const goNext = async () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.submitQuiz(id, answers);
      setResults(data);
      setPhase('results');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => { if (current > 0) setCurrent(c => c - 1); };

  const retake = () => {
    setResults(null);
    setAnswers(new Array(questions.length).fill(null));
    setCurrent(0);
    setPhase('quiz');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (loadError && !module) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-error font-semibold mb-4">{loadError}</p>
            <Link href="/learn" className="text-primary font-semibold hover:underline">Back to Learning Hub</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/learn" className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 mb-6 w-fit">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Learning Hub
          </Link>

          {phase === 'lesson' && (
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 md:p-8 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-primary">{module.icon}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-on-surface">{module.title}</h1>
                  <p className="text-sm text-on-surface-variant">{module.category} · {module.difficulty} · {module.duration_minutes} min</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">{module.description}</p>
              {module.content && (
                <div className="bg-surface-container rounded-2xl p-5 mb-6 space-y-2">
                  {module.content.split('\n').map((line, i) => (
                    <p key={i} className="text-sm text-on-surface-variant leading-relaxed">{line}</p>
                  ))}
                </div>
              )}
              {module.userProgress?.completed && (
                <div className="bg-success/10 text-success rounded-xl p-3 text-sm font-semibold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg icon-fill">emoji_events</span>
                  Previously completed — Score: {module.userProgress.score}%
                </div>
              )}
              {loadError && <div className="bg-error-container/20 text-error rounded-xl p-3 text-xs mb-4">{loadError}</div>}
              <button onClick={startQuiz} disabled={quizLoading}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {quizLoading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading quiz...</> : <><span className="material-symbols-outlined">quiz</span>{module.userProgress?.completed ? 'Retake Quiz' : 'Start Quiz'}</>}
              </button>
            </div>
          )}

          {phase === 'quiz' && questions.length > 0 && (
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 md:p-8 animate-fade-in-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-on-surface-variant">Question {current + 1} of {questions.length}</span>
                <span className="text-xs font-semibold text-primary">{Math.round(((current) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full mb-6 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }}></div>
              </div>

              <h2 className="text-lg font-semibold text-on-surface mb-6">{questions[current].question}</h2>

              <div className="space-y-3 mb-8">
                {questions[current].options.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all flex items-center gap-3 ${answers[current] === i ? 'border-primary bg-primary/5 font-semibold text-on-surface' : 'border-outline-variant/20 hover:border-primary/40 text-on-surface-variant'}`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[current] === i ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                      {answers[current] === i && <span className="material-symbols-outlined text-on-primary text-sm">check</span>}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              {loadError && <div className="bg-error-container/20 text-error rounded-xl p-3 text-xs mb-4">{loadError}</div>}

              <div className="flex gap-3">
                {current > 0 && (
                  <button onClick={goBack} className="px-5 py-3 rounded-xl text-sm font-bold border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors">Back</button>
                )}
                <button onClick={goNext} disabled={answers[current] === null || submitting}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Submitting...</> : current === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                </button>
              </div>
            </div>
          )}

          {phase === 'results' && results && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 md:p-8 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${results.passed ? 'bg-success/10' : 'bg-error-container/20'}`}>
                  <span className={`material-symbols-outlined text-4xl icon-fill ${results.passed ? 'text-success' : 'text-error'}`}>{results.passed ? 'emoji_events' : 'refresh'}</span>
                </div>
                <div className={`text-4xl font-bold mb-1 ${results.passed ? 'text-success' : 'text-error'}`}>{results.score}%</div>
                <p className="text-sm text-on-surface-variant mb-1">{results.correctCount} of {results.totalQuestions} correct</p>
                <p className={`text-sm font-semibold ${results.passed ? 'text-success' : 'text-error'}`}>{results.passed ? 'Module passed! Great work.' : 'Not quite — review the explanations below and try again.'}</p>
                {!results.saved && (
                  <p className="text-xs text-on-surface-variant mt-3 bg-surface-container rounded-lg p-2 inline-block">
                    <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> to save your progress and level up.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {results.review.map((r, i) => (
                  <div key={i} className={`bg-surface-container-lowest rounded-2xl border p-5 ${r.isCorrect ? 'border-success/20' : 'border-error/20'}`}>
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`material-symbols-outlined text-lg shrink-0 ${r.isCorrect ? 'text-success' : 'text-error'}`}>{r.isCorrect ? 'check_circle' : 'cancel'}</span>
                      <p className="text-sm font-semibold text-on-surface">{r.question}</p>
                    </div>
                    <p className="text-xs text-on-surface-variant ml-8 mb-1">Correct answer: <span className="font-semibold text-on-surface">{r.options[r.correctIndex]}</span></p>
                    {!r.isCorrect && r.selectedIndex !== null && (
                      <p className="text-xs text-error ml-8 mb-2">Your answer: {r.options[r.selectedIndex]}</p>
                    )}
                    <p className="text-xs text-on-surface-variant ml-8 leading-relaxed">{r.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={retake} className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-3 rounded-xl text-sm font-bold transition-colors">Retake Quiz</button>
                <Link href="/learn" className="flex-1 bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center">Back to Learning Hub</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
