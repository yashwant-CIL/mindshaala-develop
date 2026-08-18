import React, { useState, useEffect } from 'react';
import { QuestionItem } from './VivaExamRenderer';
import { CheckCircle2, Bookmark, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeech } from '../../../utils/ttsHelper';

export interface ConceptualExamRendererProps {
  question: QuestionItem;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string | number | null;
  isMarkedForReview: boolean;
  onSelectOption: (option: string | number) => void;
  onClearOption: () => void;
  onToggleMarkReview: () => void;
}

export const ConceptualExamRenderer: React.FC<ConceptualExamRendererProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  isMarkedForReview,
  onSelectOption,
  onClearOption,
  onToggleMarkReview
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('conceptual_tts_muted') === 'true';
  });

  const questionText =
    question.question_transcrib ||
    question.question_text ||
    question.question ||
    question.title ||
    `Question ${question.question_no || questionIndex + 1}`;

  const options = question.options || [
    "Option A: Conceptual theory breakdown",
    "Option B: Fundamental rule analysis",
    "Option C: Scientific principle application",
    "Option D: Systemic proof synthesis"
  ];

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Auto speech on question render if not muted
  useEffect(() => {
    if (!isMuted && questionText) {
      stopSpeech();
      speakText(questionText, { rate: 0.95 });
    }
    return () => {
      stopSpeech();
    };
  }, [questionIndex, questionText, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('conceptual_tts_muted', String(nextMuted));
    if (nextMuted) {
      stopSpeech();
    } else {
      stopSpeech();
      speakText(questionText, { rate: 0.95 });
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-blue-700 font-bold uppercase tracking-wider">Conceptual Assessment</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute / Read Question Button */}
          <button
            onClick={toggleMute}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isMuted
                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                : 'bg-blue-600 text-white border-blue-600 shadow-md'
            }`}
            title={isMuted ? "Unmute TTS" : "Mute TTS"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Audio On</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleMarkReview}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isMarkedForReview
                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {isMarkedForReview ? 'Marked for Review' : 'Mark Review'}
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider">
            Multiple Choice Question
          </span>
          {selectedOption !== null && (
            <button
              onClick={onClearOption}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Selection
            </button>
          )}
        </div>

        <h2 className="text-lg md:text-2xl font-bold text-slate-900 leading-relaxed">
          {questionText}
        </h2>
      </div>

      {/* Option Selection List */}
      <div className="space-y-3">
        {options.map((optText, idx) => {
          const label = optionLabels[idx] || `${idx + 1}`;
          const isSelected = String(selectedOption) === String(optText) || String(selectedOption) === String(idx);

          return (
            <button
              key={idx}
              onClick={() => onSelectOption(optText)}
              className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-600 shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {label}
                </span>
                <span className={`text-sm md:text-base font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                  {optText}
                </span>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConceptualExamRenderer;
