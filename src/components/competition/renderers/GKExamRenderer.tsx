import React from 'react';
import { QuestionItem } from './VivaExamRenderer';
import { Zap, CheckCircle2, RotateCcw } from 'lucide-react';

export interface GKExamRendererProps {
  question: QuestionItem;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string | number | null;
  onSelectOption: (option: string | number) => void;
  onClearOption: () => void;
}

export const GKExamRenderer: React.FC<GKExamRendererProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onClearOption
}) => {
  const questionText = question.question_text || question.question || question.title || `General Knowledge Question ${questionIndex + 1}`;
  const options = question.options || [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ];

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans">
      {/* Rapid Fire Banner */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">General Knowledge (GK Sprint)</div>
            <div className="text-sm font-extrabold text-slate-900">Question {questionIndex + 1} of {totalQuestions}</div>
          </div>
        </div>

        {selectedOption !== null && (
          <button
            onClick={onClearOption}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer bg-white border border-amber-200 px-3 py-1.5 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-white border border-amber-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider">
            Rapid Speed Quiz
          </span>
        </div>

        <h2 className="text-lg md:text-2xl font-bold text-slate-900 leading-relaxed">
          {questionText}
        </h2>
      </div>

      {/* Grid Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((optText, idx) => {
          const label = optionLabels[idx] || `${idx + 1}`;
          const isSelected = String(selectedOption) === String(optText) || String(selectedOption) === String(idx);

          return (
            <button
              key={idx}
              onClick={() => onSelectOption(optText)}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.01]'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center border ${
                    isSelected ? 'bg-white text-amber-600 border-white' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {label}
                </span>
                <span className="text-sm md:text-base font-bold">{optText}</span>
              </div>

              {isSelected && <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GKExamRenderer;
