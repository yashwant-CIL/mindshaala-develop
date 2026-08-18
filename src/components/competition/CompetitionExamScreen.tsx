import React, { useState, useEffect } from 'react';
import { CompetitionItem, getModuleTypeLabel } from './Competitions';
import { CompetitionService } from '../../services/CompetitionService';
import { useNetworkNow } from '../../utils/networkTime';
import { VivaExamRenderer, QuestionItem } from './renderers/VivaExamRenderer';
import { ConceptualExamRenderer } from './renderers/ConceptualExamRenderer';
import { GKExamRenderer } from './renderers/GKExamRenderer';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bookmark,
  FileCheck,
  LogOut,
  Maximize2
} from 'lucide-react';

export interface CompetitionExamScreenProps {
  comp: CompetitionItem;
  userId?: string | number;
  onExit: () => void;
  onComplete: (resultData?: any) => void;
}

export const CompetitionExamScreen: React.FC<CompetitionExamScreenProps> = ({
  comp,
  userId,
  onExit,
  onComplete
}) => {
  const nowMs = useNetworkNow(1000);

  // End time calculations
  const totalDurationMs = comp.total_time ? comp.total_time * 1000 : 3600000;
  const startTimeMs = comp.start_time ? new Date(comp.start_time).getTime() : nowMs;
  const endTimeMs = comp.end_time
    ? new Date(comp.end_time).getTime()
    : startTimeMs + totalDurationMs;

  const remainingMs = Math.max(0, endTimeMs - nowMs);
  const isTimeExpired = remainingMs <= 0;

  // Exam States
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, any>>({});
  const [reviewMarked, setReviewMarked] = useState<Record<string | number, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | number>('');

  // Security / Anti-Cheat States
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(true);

  const competitionId: string | number = comp.competition_id ?? comp.id ?? '';
  const currentUserId: string | number = userId ?? localStorage.getItem('user_id') ?? 'guest';
  const moduleTypeUpper = (comp.module_type || 'TAM').toUpperCase();

  // 1. Initialize Competition & Start API call
  useEffect(() => {
    let isMounted = true;
    const initCompetition = async () => {
      setIsLoading(true);
      try {
        const parseNum = (val: any) => {
          if (val === null || val === undefined || val === '') return 0;
          const num = Number(val);
          return isNaN(num) ? val : num;
        };

        const compIdVal = parseNum(competitionId);
        const userIdVal = parseNum(currentUserId);

        const payload: Record<string, any> = {
          module_type: comp.module_type || 'TAM',
          user_id: userIdVal,
          competition_id: compIdVal,
          course_id: parseNum(comp.course_id),
          subject_id: parseNum(comp.subject_id),
          chapter_id: comp.chapter_id ?? ''
        };

        // Conditional: topic_id if present
        if (comp.topic_id != null && comp.topic_id !== '') {
          payload.topic_id = comp.topic_id;
        }

        // Conditional: viva_type if VIVA or TAM (or if present on comp)
        const upperModule = (comp.module_type || '').toUpperCase();
        if (comp.viva_type || upperModule === 'VIVA' || upperModule === 'TAM') {
          if (comp.viva_type != null && comp.viva_type !== '') {
            payload.viva_type = comp.viva_type;
          }
        }

        // Conditional: GK specific parameters
        if (upperModule === 'GK') {
          payload.gk_assessment_type = comp.gk_assessment_type || '40M Standard';
          payload.gk_creation_mode = comp.gk_creation_mode || 'Normal';

          let catIds: any[] = [];
          if (Array.isArray(comp.category_ids) && comp.category_ids.length > 0) {
            catIds = comp.category_ids.map(parseNum);
          } else if (comp.category_id != null && String(comp.category_id) !== '') {
            catIds = [parseNum(comp.category_id)];
          }
          payload.category_ids = catIds;
        }

        console.log("Submitting Start Competition payload:", payload);
        const res = await CompetitionService.StartCompetition(payload);

        const sId: string | number = res?.session_id || res?.competition_session_id || res?.data?.session_id || competitionId;
        if (isMounted && sId) {
          setSessionId(sId);
        }

        let qList: QuestionItem[] = [];
        if (res && Array.isArray(res.questions)) {
          qList = res.questions;
        } else if (res && res.data && Array.isArray(res.data.questions)) {
          qList = res.data.questions;
        } else if (Array.isArray(res)) {
          qList = res;
        }

        if (isMounted) {
          setQuestions(qList);
        }
      } catch (err) {
        console.error("Error starting competition:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initCompetition();

    return () => {
      isMounted = false;
    };
  }, [competitionId, currentUserId, comp]);

  // 2. Auto-Submit on Time Expiry
  useEffect(() => {
    if (isTimeExpired && !isSubmitting && !isLoading) {
      console.warn("Competition time expired! Auto-submitting...");
      handleFinalSubmitCompetition(true);
    }
  }, [isTimeExpired, isSubmitting, isLoading]);

  // 3. Security & Anti-Cheat Protection Listeners
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyCutPaste = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V'))
      ) {
        e.preventDefault();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const nextCount = prev + 1;
          setWarningMessage(`Tab switching or window minimization is strictly prohibited during competition! Warning (${nextCount}/3)`);
          setShowWarningModal(true);

          if (nextCount >= 3) {
            console.error("Exceeded 3 tab switch warnings! Force submitting competition...");
            handleFinalSubmitCompetition(true);
          }
          return nextCount;
        });
      }
    };

    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      if (!isFull) {
        setWarningMessage("Exited fullscreen mode. Please click 'Re-enter Fullscreen' to continue the exam cleanly.");
        setShowWarningModal(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Save / Answer option selection handler
  const handleSaveAnswer = async (questionId: string | number, answerData: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerData
    }));

    try {
      if (moduleTypeUpper === 'VIVA' || moduleTypeUpper === 'TAM') {
        const formData = new FormData();
        formData.append('module_type', comp.module_type || moduleTypeUpper);
        formData.append('session_id', String(sessionId || competitionId));
        formData.append('question_id', String(questionId));

        if (answerData && answerData.audioBlob) {
          const audioFile = answerData.audioBlob instanceof File
            ? answerData.audioBlob
            : new File([answerData.audioBlob], `answer_${questionId}.wav`, { type: 'audio/wav' });
          formData.append('audio_file', audioFile);
        }

        const sTime = answerData?.startTime || new Date().toISOString();
        const eTime = answerData?.endTime || new Date().toISOString();
        const tTaken = answerData?.totalTimeTaken ?? answerData?.timeRecorded ?? 0;

        formData.append('start_time', String(sTime));
        formData.append('end_time', String(eTime));
        formData.append('total_time_taken', String(tTaken));

        console.log("Submitting VIVA/TAM audio answer payload (FormData entries):", Array.from(formData.entries()));
        await CompetitionService.SubmitCompetitionAnswer(formData);
      } else {
        await CompetitionService.SubmitCompetitionAnswer({
          user_id: currentUserId,
          competition_id: competitionId,
          question_id: questionId,
          user_answer: typeof answerData === 'object' ? JSON.stringify(answerData) : answerData
        });
      }
    } catch (e) {
      console.error("Failed to submit individual answer:", e);
    }
  };

  // Final Submit / End Competition API Handler
  const handleFinalSubmitCompetition = async (isAuto: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmEndModal(false);

    try {
      const payload = {
        user_id: currentUserId,
        competition_id: competitionId,
        total_answered: Object.keys(userAnswers).length,
        is_auto_submitted: isAuto
      };

      console.log("Submitting End Competition payload:", payload);
      const res = await CompetitionService.EndCompetition(payload);
      onComplete(res || { competition_id: competitionId, score: 0 });
    } catch (err) {
      console.error("Error ending competition:", err);
      onComplete({ competition_id: competitionId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestionIndex] || { id: 'q1', question_text: '' };
  const currentQId = currentQ.question_id || currentQ.id || currentQ.question_no || (currentQuestionIndex + 1);

  const currentAnswer = userAnswers[currentQId] ?? null;
  const isCurrentMarkedReview = !!reviewMarked[currentQId];

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  const remainingHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const remainingMins = Math.floor((remainingMs / 1000 / 60) % 60);
  const remainingSecs = Math.floor((remainingMs / 1000) % 60);

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* 1. Top Proctoring Header Bar - Light Theme */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-white" /> OFFICIAL EXAM
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-sm font-extrabold text-slate-900">{comp.title}</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Module: <strong className="text-blue-700">{getModuleTypeLabel(comp.module_type)}</strong> &bull; User ID: {currentUserId}
            </span>
          </div>
        </div>

        {/* Center Live Internet Network Countdown */}
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          <span className="text-xs text-amber-900 font-bold uppercase hidden sm:inline">Time Remaining:</span>
          <span className="font-mono text-sm md:text-base font-black text-amber-700 tracking-widest">
            {String(remainingHours).padStart(2, '0')}:{String(remainingMins).padStart(2, '0')}:{String(remainingSecs).padStart(2, '0')}
          </span>
        </div>

        {/* Action Buttons: Tab Warning Badge & Manual End Competition */}
        <div className="flex items-center gap-3">
          {tabSwitchWarnings > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-extrabold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Warnings: {tabSwitchWarnings}/3
            </span>
          )}

          {/* Manual End Competition Button */}
          <button
            onClick={() => setShowConfirmEndModal(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> End Competition
          </button>
        </div>
      </header>

      {/* 2. Main Exam Body Layout - Light Theme */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Column: Exam Renderer (Viva / TAM / GK) */}
        <div className="lg:col-span-12 max-w-4xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
              <p className="text-slate-600 text-sm font-semibold">Initializing Competition Assessment...</p>
            </div>
          ) : (moduleTypeUpper === 'VIVA' || moduleTypeUpper === 'TAM') ? (
            <VivaExamRenderer
              question={currentQ}
              questionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              moduleType={comp.module_type || moduleTypeUpper}
              onSaveAnswer={handleSaveAnswer}
              onNext={() => {
                if (currentQuestionIndex < totalQuestions - 1) {
                  setCurrentQuestionIndex((prev) => prev + 1);
                }
              }}
            />
          ) : moduleTypeUpper === 'GK' ? (
            <GKExamRenderer
              question={currentQ}
              questionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              selectedOption={currentAnswer}
              onSelectOption={(opt) => handleSaveAnswer(currentQId, opt)}
              onClearOption={() => {
                const nextAnswers = { ...userAnswers };
                delete nextAnswers[currentQId];
                setUserAnswers(nextAnswers);
              }}
            />
          ) : (
            /* Default: Conceptual MCQ */
            <ConceptualExamRenderer
              question={currentQ}
              questionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              selectedOption={currentAnswer}
              isMarkedForReview={isCurrentMarkedReview}
              onSelectOption={(opt) => handleSaveAnswer(currentQId, opt)}
              onClearOption={() => {
                const nextAnswers = { ...userAnswers };
                delete nextAnswers[currentQId];
                setUserAnswers(nextAnswers);
              }}
              onToggleMarkReview={() => {
                setReviewMarked((prev) => ({
                  ...prev,
                  [currentQId]: !prev[currentQId]
                }));
              }}
            />
          )}

          {/* Navigation Control Bar */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-3">
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmEndModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" /> Submit Contest
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Status Palette & Summary (Commented out per user request for sequential single-question flow) */}
        {/*
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Question Palette</h3>
              <p className="text-xs text-slate-500 font-medium">
                Answered: <strong className="text-emerald-600">{answeredCount}</strong> / {totalQuestions}
              </p>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const id = q.question_id || q.id;
                const isAns = userAnswers[id] !== undefined;
                const isRev = !!reviewMarked[id];
                const isCurrent = idx === currentQuestionIndex;

                let btnClass = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                if (isCurrent) {
                  btnClass = 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/30 font-black';
                } else if (isAns) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                } else if (isRev) {
                  btnClass = 'bg-amber-500 text-white border-amber-500 font-bold';
                }

                return (
                  <button
                    key={id || idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl text-xs border font-mono transition-all cursor-pointer flex items-center justify-center ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Marked Review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" /> Unanswered
              </span>
            </div>
          </div>
        </div>
        */}
      </main>

      {/* 3. Confirmation Modal for Manual End Competition - Light Theme */}
      {showConfirmEndModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">End Competition Manually?</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to end and submit your competition attempt now?
                <br />
                Answered Questions: <strong className="text-emerald-600">{answeredCount}</strong> of <strong>{totalQuestions}</strong>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmEndModal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              >
                Continue Exam
              </button>
              <button
                onClick={() => handleFinalSubmitCompetition(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Yes, End Competition'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Warning Modal for Tab Switching / Fullscreen Exiting - Light Theme */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-red-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-red-600">Proctoring Alert</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {warningMessage}
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                I Understand, Return to Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionExamScreen;
