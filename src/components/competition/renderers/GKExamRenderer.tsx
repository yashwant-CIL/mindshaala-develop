import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { CompetitionItem } from '../Competitions';
import { CompetitionService } from '../../../services/CompetitionService';
import { useNetworkNow } from '../../../utils/networkTime';
import { QuestionItem } from './VivaExamRenderer';
import { QuestionMathJax } from '../../../shared/mathjaxconfig/QuestionMathJax';
import {
  Clock,
  AlertTriangle,
  User,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

export interface GKExamRendererProps {
  comp: CompetitionItem;
  userId?: string | number;
  onExit: () => void;
  onComplete: (resultData?: any) => void;
}

export const GKExamRenderer: React.FC<GKExamRendererProps> = ({
  comp,
  userId,
  onExit,
  onComplete
}) => {
  const nowMs = useNetworkNow(1000);

  const totalDurationMs = comp.total_time ? comp.total_time * 1000 : 3600000;
  const startTimeMs = comp.start_time ? new Date(comp.start_time).getTime() : nowMs;
  const endTimeMs = comp.end_time
    ? new Date(comp.end_time).getTime()
    : startTimeMs + totalDurationMs;

  const remainingMs = Math.max(0, endTimeMs - nowMs);
  const isTimeExpired = remainingMs <= 0;

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, any>>({});
  const [reviewMarked, setReviewMarked] = useState<Record<string | number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | number>('');
  const [gkUserAssId, setGkUserAssId] = useState<string | number>('');
  const [assessmentTitle, setAssessmentTitle] = useState<string>(comp.title || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');

  const [questionTimes, setQuestionTimes] = useState<Record<string | number, number>>({});
  const questionStartTimeRef = useRef<number>(Date.now());

  const competitionId: string | number = comp.competition_id ?? comp.id ?? '';
  const currentUserId: string | number = userId ?? localStorage.getItem('user_id') ?? 'guest';
  const candidateUsername: string = Cookies.get('username') || localStorage.getItem('username') || 'Student';

  useEffect(() => {
    setVisitedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    questionStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  const recordCurrentQuestionTime = (qIdx: number = currentQuestionIndex) => {
    if (!questions || questions.length === 0) return;
    const q = questions[qIdx];
    if (!q) return;
    const qId = q.gk_question_id || q.question_id || q.id || q.question_no || (qIdx + 1);
    const now = Date.now();
    const elapsedSecs = Math.max(1, Math.round((now - questionStartTimeRef.current) / 1000));
    questionStartTimeRef.current = now;

    setQuestionTimes((prev) => ({
      ...prev,
      [qId]: (prev[qId] || 0) + elapsedSecs
    }));
  };

  const handleNavigateQuestion = (newIndex: number) => {
    if (newIndex === currentQuestionIndex) return;
    recordCurrentQuestionTime(currentQuestionIndex);
    setCurrentQuestionIndex(newIndex);
  };

  useEffect(() => {
    let isMounted = true;
    const initGKCompetition = async () => {
      setIsLoading(true);
      try {
        const parseNum = (val: any) => {
          if (val === null || val === undefined || val === '') return 0;
          const num = Number(val);
          return isNaN(num) ? val : num;
        };

        const toInt = (val: any): number => {
          const num = parseInt(String(val), 10);
          return isNaN(num) ? 0 : num;
        };

        let catIds: number[] = [];
        if (Array.isArray(comp.category_ids) && comp.category_ids.length > 0) {
          catIds = comp.category_ids.map(toInt);
        } else if (comp.category_id != null && String(comp.category_id) !== '') {
          catIds = [toInt(comp.category_id)];
        }

        const payload: Record<string, any> = {
          module_type: comp.module_type || 'GK',
          user_id: parseNum(currentUserId),
          competition_id: parseNum(competitionId),
          ...(comp.gk_assessment_type ? { gk_assessment_type: comp.gk_assessment_type } : {}),
          ...(comp.gk_creation_mode ? { gk_creation_mode: comp.gk_creation_mode } : {}),
          ...(catIds.length > 0 ? { category_ids: catIds } : {})
        };

        const res = await CompetitionService.StartCompetition(payload);

        const gkAssId: string | number = res?.gk_user_ass_id || res?.data?.gk_user_ass_id || res?.gk_assessment_id || '';
        const sId: string | number = res?.session_id || res?.competition_session_id || res?.data?.session_id || competitionId;
        const gkAssName: string = res?.gk_assessment_name || res?.data?.gk_assessment_name || comp.title || '';

        if (isMounted) {
          if (gkAssId) setGkUserAssId(gkAssId);
          if (sId) setSessionId(sId);
          if (gkAssName) setAssessmentTitle(gkAssName);
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
          if (!qList || qList.length === 0) {
            const msg = res?.message || res?.detail || "No questions found for this GK competition assessment.";
            alert(msg);
            onExit();
            return;
          }
          setQuestions(qList);
        }
      } catch (err: any) {
        console.error("Error starting GK competition:", err);
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          (typeof err?.response?.data === 'string' ? err?.response?.data : null) ||
          err?.message ||
          "Failed to start GK competition assessment.";
        alert(errorMsg);
        if (isMounted) {
          onExit();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initGKCompetition();

    return () => {
      isMounted = false;
    };
  }, [competitionId, currentUserId, comp]);

  useEffect(() => {
    if (isTimeExpired && !isSubmitting && !isLoading) {
      handleFinalSubmitCompetition(true);
    }
  }, [isTimeExpired, isSubmitting, isLoading]);

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
            handleFinalSubmitCompetition(true);
          }
          return nextCount;
        });
      }
    };

    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      if (!isFull) {
        setTabSwitchWarnings((prev) => {
          const nextCount = prev + 1;
          setWarningMessage(`Exited fullscreen mode! Warning (${nextCount}/3). Please re-enter fullscreen to continue.`);
          setShowWarningModal(true);

          if (nextCount >= 3) {
            handleFinalSubmitCompetition(true);
          }
          return nextCount;
        });
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

  const getOptionLetter = (userAns: any, options: string[] = []): string => {
    if (userAns === undefined || userAns === null || userAns === '') return '';
    const strAns = String(userAns).trim();
    const optionLabels = ['A', 'B', 'C', 'D', 'E'];

    if (optionLabels.includes(strAns.toUpperCase())) {
      return strAns.toUpperCase();
    }

    const num = Number(userAns);
    if (!isNaN(num) && num >= 0 && num < optionLabels.length) {
      return optionLabels[num];
    }

    if (Array.isArray(options)) {
      const idx = options.findIndex((opt) => String(opt).trim() === strAns);
      if (idx >= 0 && idx < optionLabels.length) {
        return optionLabels[idx];
      }
    }

    return strAns;
  };

  const handleFinalSubmitCompetition = async (isAuto: boolean = false) => {
    if (isSubmitting) return;
    recordCurrentQuestionTime(currentQuestionIndex);
    setIsSubmitting(true);
    setShowConfirmEndModal(false);

    try {
      const gkAnswersPayload = questions.map((q, idx) => {
        const rawQId = q.gk_question_id || q.question_id || q.id || q.question_no || (idx + 1);
        const rawAns = userAnswers[rawQId] ?? userAnswers[String(rawQId)] ?? userAnswers[Number(rawQId)] ?? userAnswers[idx + 1] ?? '';
        
        const optionsList = (q.option_a !== undefined || q.option_b !== undefined)
          ? [q.option_a, q.option_b, q.option_c, q.option_d].filter((opt): opt is string => opt !== undefined && opt !== null)
          : (q.options || []);

        const userLetter = getOptionLetter(rawAns, optionsList);
        const qIdNum = Number(rawQId);
        const timeTaken = questionTimes[rawQId] ?? questionTimes[String(rawQId)] ?? questionTimes[Number(rawQId)] ?? questionTimes[idx + 1] ?? 0;

        return {
          gk_question_id: isNaN(qIdNum) ? (idx + 1) : qIdNum,
          user_answer: userLetter,
          time_taken_seconds: timeTaken
        };
      });

      const gkAssIdNum = Number(gkUserAssId);
      const targetSessionId = isNaN(gkAssIdNum)
        ? (gkUserAssId || sessionId || competitionId)
        : gkAssIdNum;

      const payload = {
        module_type: comp.module_type || 'GK',
        session_id: targetSessionId,
        gk_user_ass_id: targetSessionId,
        gk_answers: gkAnswersPayload
      };

      console.log("Submitting End GK Competition payload:", payload);
      const res = await CompetitionService.EndCompetition(payload);
      onComplete(res || { competition_id: competitionId, score: 0 });
    } catch (err: any) {
      console.error("Error ending GK competition:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err?.response?.data : null) ||
        err?.message ||
        "Failed to submit GK competition assessment. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestionIndex] || { id: 'q1', question_text: '' };
  const currentQId = currentQ.gk_question_id || currentQ.question_id || currentQ.id || currentQ.question_no || (currentQuestionIndex + 1);
  const currentAnswer = userAnswers[currentQId] ?? userAnswers[String(currentQId)] ?? userAnswers[Number(currentQId)] ?? null;

  const totalQuestions = questions.length;
  const qCount = totalQuestions;

  const getQText = (q: QuestionItem) => q.gk_question || q.question_text || q.question || q.title || '';
  const getQId = (q: QuestionItem, fallbackIdx: number) => q.gk_question_id || q.question_id || q.id || q.question_no || (fallbackIdx + 1);
  const getQOptions = (q: QuestionItem): string[] => {
    if (q.option_a !== undefined || q.option_b !== undefined || q.option_c !== undefined || q.option_d !== undefined) {
      const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter((opt): opt is string => opt !== undefined && opt !== null);
      if (opts.length > 0) return opts;
    }
    if (Array.isArray(q.options) && q.options.length > 0) return q.options as string[];
    return ['Option A', 'Option B', 'Option C', 'Option D'];
  };

  const checkAnswered = (dict: Record<string | number, any>, qId: any) => {
    if (!dict || qId === undefined || qId === null) return false;
    const val = dict[qId] ?? dict[String(qId)] ?? dict[Number(qId)];
    return val !== undefined && val !== null && val !== '';
  };

  const checkReview = (dict: Record<string | number, boolean>, qId: any) => {
    if (!dict || qId === undefined || qId === null) return false;
    return !!(dict[qId] || dict[String(qId)] || dict[Number(qId)]);
  };

  const currentQText = getQText(currentQ) || `Question ${currentQuestionIndex + 1}`;
  const currentQOptions = getQOptions(currentQ);
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const isCurrentMarkedReview = checkReview(reviewMarked, currentQId);
  const hasSelection = currentAnswer !== null && currentAnswer !== undefined && currentAnswer !== '';

  const remainingHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const remainingMins = Math.floor((remainingMs / 1000 / 60) % 60);
  const remainingSecs = Math.floor((remainingMs / 1000) % 60);
  const timeRemainingStr = `${String(remainingHours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

  let answeredCount = 0;
  let reviewCount = 0;
  let reviewAnsweredCount = 0;
  let unansweredCount = 0;
  let notVisitedCount = 0;

  questions.forEach((q, idx) => {
    const id = getQId(q, idx);
    const isAns = checkAnswered(userAnswers, id);
    const isRev = checkReview(reviewMarked, id);
    const isVisited = visitedQuestions.has(idx);

    if (isRev) {
      if (isAns) reviewAnsweredCount++;
      else reviewCount++;
    } else if (isAns) answeredCount++;
    else if (isVisited) unansweredCount++;
    else notVisitedCount++;
  });

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-hidden bg-white text-slate-800 font-sans flex flex-col justify-between select-none font-[Arial,sans-serif]">
      {isSubmitting && (
        <div className="fixed inset-0 z-[99999] backdrop-blur-md bg-black/40 flex flex-col items-center justify-center pointer-events-auto">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-[90%] mx-auto transform animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-100 border-solid rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#0079D1] border-solid rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-[#0079D1]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Submitting GK Exam</h3>
            <p className="text-slate-500 text-center font-medium">Please wait while we process your responses securely...</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-24 text-center space-y-3 my-auto">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-semibold">Initializing GK Competition Assessment...</p>
        </div>
      ) : (
        <>
          <div className="shrink-0 w-full bg-black text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex justify-between items-center z-[1100]">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button onClick={() => setIsMenuOpen((prev) => !prev)} className="hidden max-md:flex items-center justify-center text-xl sm:text-2xl bg-transparent border-none text-white cursor-pointer leading-none relative p-1">
                ☰
              </button>
              <span className="font-semibold text-xs sm:text-sm md:text-base truncate">Question Paper</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="text-right font-medium text-xs sm:text-sm truncate">Candidate: {candidateUsername}</span>
            </div>
          </div>

          <div className="flex flex-1 w-full overflow-hidden select-none relative">
            <div className="flex flex-1 flex-col overflow-hidden text-xs sm:text-sm max-md:overflow-y-auto w-full">
              <div className="shrink-0 flex justify-between items-center px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-200 bg-white max-md:flex-col max-md:items-start max-md:gap-2 shadow-sm z-10 w-full">
                <div className="flex flex-col gap-0.5 min-w-0 w-full max-md:w-auto">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Exam Name</span>
                  <span className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-800 m-0 tracking-tight break-words max-w-[800px] max-md:max-w-full">
                    <QuestionMathJax content={assessmentTitle || comp.title} />
                  </span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-4 max-md:w-full max-md:justify-between shrink-0 flex-wrap">
                  <div className="flex flex-col items-start sm:items-end gap-0.5">
                    <span className="text-[9px] font-extrabold text-red-600 uppercase tracking-widest">Tab Switch Count</span>
                    <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg bg-red-50 text-red-700 border border-red-400 font-black text-xs shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse shrink-0" />
                      <span>Warnings: <strong className="text-red-700 font-black text-xs sm:text-sm">{tabSwitchWarnings} / 3</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-0.5 shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Remaining</span>
                    <div className={`
                      flex justify-center items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-mono text-xs sm:text-base md:text-lg font-bold transition-all duration-300
                      ${remainingMs <= 60000
                        ? 'bg-red-50 text-red-700 border-2 border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : remainingMs <= 300000
                          ? 'bg-orange-50 text-orange-600 border-2 border-orange-400'
                          : 'bg-slate-50 text-slate-700 border border-slate-200'}
                    `}>
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 opacity-80 shrink-0" />
                      <span className="tracking-wider">{timeRemainingStr}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-xs sm:text-sm text-[#e07a05] px-3 sm:px-4 py-1.5 border-b border-slate-300 flex justify-between items-center gap-2 flex-wrap bg-slate-50">
                <div className="flex-1 overflow-hidden max-w-full flex items-center gap-2">
                  <button className="px-3 py-1 rounded-full font-semibold bg-[#0079D1] text-white border border-[#0079D1] shadow-sm cursor-default text-xs truncate">
                    <QuestionMathJax content="General Knowledge (GK)" />
                  </button>
                </div>
                <div className="shrink-0 flex items-center gap-2 sm:gap-4">
                  <p className="font-bold m-0 whitespace-nowrap text-right max-md:text-left text-slate-800 text-xs">
                    Type: MCQ | Marks: {comp.total_marks || (qCount * 10)} | Question {currentQuestionIndex + 1} of {qCount}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto text-xs sm:text-sm md:text-base px-3 sm:px-5 py-2.5 sm:py-4">
                <div className="w-full max-w-5xl mx-auto">
                  <div className="text-xs sm:text-base md:text-lg font-bold m-0 mb-3 sm:mb-4 leading-normal flex flex-wrap items-start gap-x-2 gap-y-1 relative">
                    <span className="mr-1 whitespace-nowrap text-blue-800 shrink-0">Question {currentQuestionIndex + 1}:</span>
                    <div className="flex-1 min-w-[200px] inline-block whitespace-pre-wrap break-words [&_p]:!m-0 [&_p]:whitespace-normal [&_p]:inline [&_mjx-container]:!inline-block [&_mjx-container]:!m-0 [&_span]:!inline [&_br]:hidden">
                      <QuestionMathJax content={currentQText} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                    {currentQOptions.map((optText: string, optIdx: number) => {
                      const label = optionLabels[optIdx] || `${optIdx + 1}`;
                      const isSelectedOpt =
                        String(currentAnswer) === String(optText) ||
                        String(currentAnswer).toUpperCase() === label ||
                        String(currentAnswer) === String(optIdx);

                      return (
                        <div
                          key={optIdx}
                          onClick={() => {
                            setUserAnswers((prev) => ({
                              ...prev,
                              [currentQId]: label
                            }));
                          }}
                          className={`py-2 sm:py-2.5 px-3 flex flex-row items-start gap-2 sm:gap-2.5 w-full rounded-lg transition-colors cursor-pointer border ${
                            isSelectedOpt ? 'bg-blue-50 border-blue-400 font-bold shadow-sm' : 'hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            id={`gk-opt-${currentQId}-${optIdx}`}
                            className="shrink-0 cursor-pointer w-3.5 h-3.5 sm:w-4 sm:h-4 mt-[3px] accent-[#0079D1]"
                            name={`gk-q-${currentQId}`}
                            checked={isSelectedOpt}
                            onChange={() => {
                              setUserAnswers((prev) => ({
                                ...prev,
                                [currentQId]: label
                              }));
                            }}
                          />
                          <label
                            htmlFor={`gk-opt-${currentQId}-${optIdx}`}
                            className="cursor-pointer flex-1 flex flex-row items-start gap-1 break-words leading-snug text-xs sm:text-sm md:text-base [&_p]:!m-0 [&_p]:inline [&_mjx-container]:!inline-block [&_mjx-container]:!m-0 [&_mjx-container]:!align-middle [&_span]:!inline [&_br]:hidden"
                          >
                            <span className="font-semibold mr-0.5 shrink-0 min-w-[1.1rem]">
                              {label}.
                            </span>
                            <span className="inline-block whitespace-pre-wrap break-words">
                              <QuestionMathJax content={optText} />
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {hasSelection && (
                    <button
                      className="px-3 py-1 sm:px-3.5 sm:py-1.5 mt-2.5 bg-[#ff1e1e] hover:bg-[#870505] text-white border-none rounded-lg cursor-pointer transition-colors font-bold text-xs"
                      onClick={() => {
                        const nextAnswers = { ...userAnswers };
                        delete nextAnswers[currentQId];
                        setUserAnswers(nextAnswers);
                      }}
                    >
                      Clear Response
                    </button>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex justify-end items-center border-t border-slate-200 p-2 sm:p-3 bg-white">
                <div className="flex justify-between sm:justify-end items-center w-full gap-2 sm:gap-3 flex-wrap">
                  <button
                    className="cursor-pointer px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#77549A] text-white border-none text-xs sm:text-base font-bold transition-all hover:bg-[#4c3463] flex-1 max-w-none sm:max-w-[180px] text-center"
                    onClick={() => {
                      setReviewMarked((prev) => ({
                        ...prev,
                        [currentQId]: !prev[currentQId]
                      }));
                    }}
                  >
                    {isCurrentMarkedReview ? "Remove Review" : "Mark for Review"}
                  </button>

                  {currentQuestionIndex > 0 && (
                    <button
                      className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#0079D1] text-white border-none text-xs sm:text-base font-bold transition-all hover:bg-[#034d82] flex-1 max-w-none sm:max-w-[120px] text-center"
                      onClick={() => handleNavigateQuestion(Math.max(0, currentQuestionIndex - 1))}
                    >
                      Prev
                    </button>
                  )}

                  {currentQuestionIndex < qCount - 1 && (
                    <button
                      className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#0079D1] text-white border-none text-xs sm:text-base font-bold transition-all hover:bg-[#034d82] flex-1 max-w-none sm:max-w-[120px] text-center"
                      onClick={() => handleNavigateQuestion(Math.min(qCount - 1, currentQuestionIndex + 1))}
                    >
                      Next
                    </button>
                  )}

                  <button
                    className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#17ab07] hover:bg-[#118005] text-white border-none text-xs sm:text-base font-extrabold transition-all flex items-center justify-center gap-1.5 flex-1 max-w-none sm:max-w-[140px] text-center shadow-md"
                    onClick={() => setShowConfirmEndModal(true)}
                  >
                    <FileCheck className="w-4 h-4 shrink-0" /> Submit
                  </button>
                </div>
              </div>
            </div>

            <div className={`w-[25%] min-w-[280px] max-w-[360px] shrink-0 border-l border-slate-200 shadow-sm flex flex-col bg-white text-sm max-md:w-full max-md:border-none ${isMenuOpen ? 'max-md:flex max-md:absolute max-md:inset-0 max-md:z-[1050] max-md:h-full' : 'max-md:hidden'}`}>
              <div className="w-full border-b border-slate-200 p-3.5 sm:p-4 bg-slate-900 text-white shrink-0 space-y-3 relative">
                {isMenuOpen && (
                  <button onClick={() => setIsMenuOpen(false)} className="hidden max-md:block absolute top-2 right-2 bg-white text-black text-xl w-7 h-7 rounded-full z-10 font-bold border-0 cursor-pointer shadow-lg leading-none">
                    ×
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0079D1] text-white font-bold flex items-center justify-center text-base border-2 border-white/20 shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">{candidateUsername}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-white/10 p-2.5 rounded-lg border border-white/15">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Questions</span>
                    <span className="text-white font-extrabold text-xs sm:text-sm">{qCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Marks</span>
                    <span className="text-amber-400 font-extrabold text-xs sm:text-sm">{comp.total_marks || (qCount * 10)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Warnings</span>
                    <span className={`font-extrabold text-xs sm:text-sm ${tabSwitchWarnings > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>{tabSwitchWarnings}/3</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-1 gap-y-2.5 w-full p-2.5 border-b border-slate-200 bg-white">
                <div className="flex items-center">
                  <span className="h-7 w-7 sm:h-8 sm:w-8 bg-[#17ab07] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white font-bold text-xs shrink-0">{answeredCount}</span>
                  <p className="text-[11px] sm:text-[12px] m-0 leading-tight font-medium">Answered</p>
                </div>
                <div className="flex items-center">
                  <span className="h-7 w-7 sm:h-8 sm:w-8 bg-[#eb0a0a] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white font-bold text-xs shrink-0">{unansweredCount}</span>
                  <p className="text-[11px] sm:text-[12px] m-0 leading-tight font-medium">Not Answered</p>
                </div>
                <div className="flex items-center">
                  <span className="h-7 w-7 sm:h-8 sm:w-8 bg-[#77549A] relative flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white font-bold text-xs shrink-0">
                    {reviewCount}
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eb0a0a] border border-white absolute -top-1 -right-1 flex items-center justify-center text-[7px] font-black leading-none">✕</span>
                  </span>
                  <p className="text-[11px] sm:text-[12px] m-0 leading-tight font-medium">Marked for Review</p>
                </div>
                <div className="flex items-center">
                  <span className="h-7 w-7 sm:h-8 sm:w-8 bg-[#77549A] relative flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white font-bold text-xs shrink-0">
                    {reviewAnsweredCount}
                    <span className="w-2.5 h-2.5 rounded-full bg-[#17ab07] border border-white absolute -top-1 -right-1 flex items-center justify-center text-[7px] font-black leading-none">✓</span>
                  </span>
                  <p className="text-[11px] sm:text-[12px] m-0 leading-tight font-medium">Ans & Marked Review</p>
                </div>
                <div className="flex items-center col-span-2">
                  <span className="h-7 w-7 bg-[#D6D6D6] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-black font-bold text-xs shrink-0">{notVisitedCount}</span>
                  <p className="text-[11px] sm:text-[12px] m-0 leading-tight font-medium">Not Visited</p>
                </div>
              </div>

              <div className="shrink-0 bg-[#0079D1] w-full p-2.5 flex items-center justify-center text-white border-y border-[#005e8e] font-bold">
                <div className="m-0 text-sm sm:text-base">General Knowledge (GK)</div>
              </div>

              <div className="flex flex-col flex-1 overflow-hidden bg-[#E5F6FD] w-full">
                <div className="flex-1 overflow-y-auto w-full p-3 sm:p-4">
                  <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-start">
                    {questions.map((q, idx) => {
                      const qId = getQId(q, idx);
                      const isAns = checkAnswered(userAnswers, qId);
                      const isRev = checkReview(reviewMarked, qId);
                      const isCurr = idx === currentQuestionIndex;
                      const isVisited = visitedQuestions.has(idx);

                      let bgClass = 'bg-[#D6D6D6] text-black';
                      let isAnsAndRev = false;
                      let isRevOnly = false;

                      if (isRev) {
                        bgClass = 'bg-[#77549A] text-white';
                        if (isAns) {
                          isAnsAndRev = true;
                        } else {
                          isRevOnly = true;
                        }
                      } else if (isAns) bgClass = 'bg-[#17ab07] text-white';
                      else if (isVisited) bgClass = 'bg-[#eb0a0a] text-white';

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavigateQuestion(idx);
                            setIsMenuOpen(false);
                          }}
                          className={`
                            h-8 w-8 sm:h-9 sm:w-9 rounded-[6px] font-bold text-xs sm:text-sm flex items-center justify-center relative cursor-pointer border-none transition-all
                            ${bgClass}
                            ${isCurr ? 'ring-2 ring-[#0079D1] ring-offset-2 scale-105 shadow-md font-black' : 'hover:opacity-90'}
                          `}
                        >
                          {idx + 1}
                          {isAnsAndRev && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#17ab07] border border-white absolute -top-1 -right-1 flex items-center justify-center text-[7px] font-black leading-none">✓</span>
                          )}
                          {isRevOnly && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#eb0a0a] border border-white absolute -top-1 -right-1 flex items-center justify-center text-[7px] font-black leading-none">✕</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="shrink-0 flex justify-center items-center border-t border-slate-200 p-3 sm:p-4 bg-white">
                  <button
                    className="cursor-pointer px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#17ab07] text-white border-none text-sm sm:text-lg font-bold transition-all hover:bg-[#118005] w-full flex items-center justify-center gap-2"
                    onClick={() => setShowConfirmEndModal(true)}
                  >
                    <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showConfirmEndModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">End GK Competition Manually?</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to submit your GK competition attempt now?
                <br />
                Answered Questions: <strong className="text-emerald-600">{Object.keys(userAnswers).length}</strong> of <strong>{qCount}</strong>
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
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, End Competition'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
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

export default GKExamRenderer;
