import { CheckCircle, XCircle, Info, ArrowLeft, BookOpen } from 'lucide-react';
import QuestionMathJax from '../../shared/mathjaxconfig/QuestionMathJax';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: string;
}

interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  timeTaken: number;
  markedForReview: boolean;
}

interface GKExamSolutionProps {
  questions: Question[];
  answers: Record<string, UserAnswer>;
  onBack?: () => void;
}

const DIFF_STYLE: Record<string, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100',
  Hard: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function GKExamSolution({ questions, answers, onBack }: GKExamSolutionProps) {
  const totalCorrect = questions.filter(q => answers[q.id]?.selectedOption === q.correctAnswer).length;
  const totalSkipped = questions.filter(q => answers[q.id]?.selectedOption == null).length;
  const totalIncorrect = questions.length - totalCorrect - totalSkipped;

  return (
    <div className="min-h-screen bg-slate-50 pb-20" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Solution Review</h1>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{questions.length} Questions • Detailed Explanations</p>
              </div>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
              <CheckCircle className="w-3.5 h-3.5" />
              {totalCorrect} Correct
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
              {totalIncorrect} Wrong
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500">
              <Info className="w-3.5 h-3.5" />
              {totalSkipped} Skipped
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 mt-8 space-y-5">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          const selected = ans?.selectedOption ?? null;
          const correct = selected === q.correctAnswer;
          const isSkipped = selected === null || selected === undefined;

          const statusBadge = isSkipped
            ? { label: 'Skipped', icon: Info, bg: 'bg-amber-50 border-amber-200 text-amber-700' }
            : correct
              ? { label: 'Correct', icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
              : { label: 'Incorrect', icon: XCircle, bg: 'bg-rose-50 border-rose-200 text-rose-700' };

          const cardBorder = isSkipped ? 'border-l-amber-400' : correct ? 'border-l-emerald-500' : 'border-l-rose-500';

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 ${cardBorder} overflow-hidden`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-700 text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {q.difficulty && (
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-2 ${DIFF_STYLE[q.difficulty] || DIFF_STYLE.Medium}`}>
                        {q.difficulty}
                      </span>
                    )}
                    <div className="font-bold text-slate-800 text-sm leading-relaxed">
                      <QuestionMathJax content={q.question} />
                    </div>
                  </div>
                </div>

                <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${statusBadge.bg}`}>
                  <statusBadge.icon className="w-3.5 h-3.5" />
                  {statusBadge.label}
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-6 py-4">
                {q.options.map((opt, oIdx) => {
                  const isCorrectOpt = oIdx === q.correctAnswer;
                  const isSelectedOpt = oIdx === selected;

                  let optStyle = 'border-slate-100 bg-slate-50/50 text-slate-600';
                  let badgeStyle = 'bg-slate-200 text-slate-600';

                  if (isCorrectOpt) {
                    optStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-200';
                    badgeStyle = 'bg-emerald-600 text-white';
                  } else if (isSelectedOpt && !correct) {
                    optStyle = 'border-rose-300 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-200';
                    badgeStyle = 'bg-rose-600 text-white';
                  }

                  return (
                    <div key={oIdx} className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm transition-colors ${optStyle}`}>
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${badgeStyle}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-snug flex-1">
                        <QuestionMathJax content={opt} />
                      </span>
                      {isCorrectOpt && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                      {isSelectedOpt && !correct && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="mx-6 mb-5 p-4 rounded-xl bg-blue-50/40 border border-blue-100/60">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block mb-1.5">💡 Explanation</span>
                <div className="text-slate-600 text-sm leading-relaxed font-medium">
                  <QuestionMathJax content={q.explanation} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom back button */}
        {onBack && (
          <div className="flex justify-center pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
