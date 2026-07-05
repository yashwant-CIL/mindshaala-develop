import { useState, useEffect, useRef } from 'react';
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: string;
}
import { 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ArrowRight,
  ClipboardCheck,
  TrendingUp,
  Brain,
  Zap,
  BookmarkCheck,
  Info,
  Lock,
  User,
  ShieldAlert,
  Check,
  Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';
import QuestionMathJax from '../../shared/mathjaxconfig/QuestionMathJax';
import { GKService } from '../../services/GKService';
import GKExamSolution from './GKExamSolution';
import Cookies from 'js-cookie';

interface GKExamRunnerProps {
  category: string;
  subcategory: string;
  onExit: () => void;
  onGoToDashboard: () => void;
  onGoToResults: () => void;
  initialQuestions?: Question[];
  assessmentId?: number | string | null;
  totalMarks?: number;
  totalTimeSeconds?: number;
  assessmentName?: string | null;
}

interface UserAnswer {
  questionId: string;
  selectedOption: number | null; // index of option, null if skipped
  isCorrect: boolean;
  timeTaken: number; // in seconds
  markedForReview: boolean;
}

export default function GKExamRunner({ 
  category, 
  subcategory, 
  onExit, 
  onGoToDashboard,
  onGoToResults,
  initialQuestions, 
  assessmentId,
  totalMarks = 40,
  totalTimeSeconds = 3600,
  assessmentName
}: GKExamRunnerProps) {
  // Candidate Info
  const candidateName = Cookies.get('username') || localStorage.getItem('username') || 'Student';

  console.log("GKExamRunner Props:", { category, subcategory, initialQuestions, assessmentId, totalMarks, totalTimeSeconds });

  // Load questions
  const [questions, setQuestions] = useState<Question[]>([]);
  console.log("GKExamRunner Questions State:", questions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  
  // Timer States
  const [timeRemaining, setTimeRemaining] = useState(totalTimeSeconds);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Question tracking timer for speed analysis
  const questionStartTimes = useRef<Record<string, number>>({});

  // Secure Proctoring States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningsCount, setWarningsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));

  // Setup dynamic question bank or backend questions
  useEffect(() => {
    const qList = (initialQuestions && initialQuestions.length > 0)
      ? initialQuestions
      : [];
    setQuestions(qList);

    const initialAnswers: Record<string, UserAnswer> = {};
    qList.forEach(q => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOption: null,
        isCorrect: false,
        timeTaken: 0,
        markedForReview: false
      };
    });
    setAnswers(initialAnswers);
    
    if (qList.length > 0) {
      questionStartTimes.current = { [qList[0].id]: Date.now() };
    }

    setTimeRemaining(totalTimeSeconds);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [category, subcategory, initialQuestions, totalTimeSeconds]);

  // Keep track of visited questions
  useEffect(() => {
    setVisitedQuestions(prev => {
      const next = new Set(prev);
      next.add(currentIdx);
      return next;
    });
  }, [currentIdx]);

  // Enforce fullscreen secure proctoring mode
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setShowWarningModal(false);
      }).catch(err => {
        console.error("Failed to enter fullscreen:", err);
        toast.error("Fullscreen permissions blocked. Please allow fullscreen to proceed with the exam.");
      });
    }
  };

  // Secure Proctoring event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && !examSubmitted && questions.length > 0) {
        setWarningsCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
            handleSubmit(true);
            Swal.fire({
              icon: 'error',
              title: 'Exam Auto-Submitted',
              text: 'The exam was automatically submitted due to exiting fullscreen proctoring mode 3 times.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'rounded-[2rem]'
              }
            });
          } else {
            setWarningReason('exited-fullscreen');
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !examSubmitted && questions.length > 0) {
        setWarningsCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
            handleSubmit(true);
            Swal.fire({
              icon: 'error',
              title: 'Exam Auto-Submitted',
              text: 'The exam was automatically submitted because you switched tabs or minimized the window.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'rounded-[2rem]'
              }
            });
          } else {
            setWarningReason('tab-switched');
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      if (!examSubmitted && questions.length > 0 && !showWarningModal) {
        setWarningsCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
            handleSubmit(true);
            Swal.fire({
              icon: 'error',
              title: 'Exam Auto-Submitted',
              text: 'The exam was automatically submitted because you interacted with other applications.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'rounded-[2rem]'
              }
            });
          } else {
            setWarningReason('window-blurred');
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Right-click context menu is disabled during the secure exam!", { id: 'ctx-toast' });
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Text copy, cut, and paste is disabled during the secure exam!", { id: 'copy-toast' });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      
      if (
        e.key === 'F12' ||
        (isCtrl && isShift && (e.key === 'I' || e.key === 'J' || e.key === 'c' || e.key === 'i' || e.key === 'j')) ||
        (isCtrl && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X' || e.key === 'r' || e.key === 'R')) ||
        e.key === 'F5'
      ) {
        e.preventDefault();
        toast.error("Keyboard shortcuts are disabled during the secure exam!", { id: 'shortcut-toast' });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [questions, examSubmitted, showWarningModal]);

  const handleSelectOption = (optionIdx: number) => {
    if (examSubmitted) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOption: optionIdx,
        isCorrect: optionIdx === currentQ.correctAnswer
      }
    }));
  };

  const handleClearResponse = () => {
    if (examSubmitted) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOption: null,
        isCorrect: false
      }
    }));
  };

  const handleToggleReview = () => {
    if (examSubmitted) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        markedForReview: !prev[currentQ.id].markedForReview
      }
    }));
  };

  const handleIndexChange = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= questions.length) return;
    
    // Save duration spent on old question
    const oldQ = questions[currentIdx];
    if (oldQ) {
      const entryTime = questionStartTimes.current[oldQ.id] || Date.now();
      const seconds = Math.floor((Date.now() - entryTime) / 1000);
      
      setAnswers(prev => ({
        ...prev,
        [oldQ.id]: {
          ...prev[oldQ.id],
          timeTaken: (prev[oldQ.id]?.timeTaken || 0) + seconds
        }
      }));
    }
    
    // Load entry time for new question
    const newQ = questions[newIdx];
    questionStartTimes.current = {
      ...questionStartTimes.current,
      [newQ.id]: Date.now()
    };
    
    setCurrentIdx(newIdx);
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setExamSubmitted(false);
    setTimeRemaining(totalTimeSeconds);
    setTimeSpent(0);
    setShowSubmitModal(false);
    setWarningsCount(0);
    setShowWarningModal(false);
    setVisitedQuestions(new Set([0]));
    
    const qList = (initialQuestions && initialQuestions.length > 0)
      ? initialQuestions
      : [];
    setQuestions(qList);

    const initialAnswers: Record<string, UserAnswer> = {};
    qList.forEach(q => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOption: null,
        isCorrect: false,
        timeTaken: 0,
        markedForReview: false
      };
    });
    setAnswers(initialAnswers);
    
    if (qList.length > 0) {
      questionStartTimes.current = { [qList[0].id]: Date.now() };
    } else {
      questionStartTimes.current = {};
    }
  };

  const handleSubmit = (force = false) => {
    if (examSubmitted) return;
    
    const currentQ = questions[currentIdx];
    if (currentQ) {
      const timeInMs = Date.now() - (questionStartTimes.current[currentQ.id] || Date.now());
      const seconds = Math.floor(timeInMs / 1000);
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          timeTaken: (prev[currentQ.id]?.timeTaken || 0) + seconds
        }
      }));
    }

    if (timerRef.current) clearInterval(timerRef.current);
    
    let score = 0;
    let attempted = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    
    let currentStreak = 0;
    let maxStreak = 0;

    const difficultyStats = {
      Easy: { correct: 0, total: 0 },
      Medium: { correct: 0, total: 0 },
      Hard: { correct: 0, total: 0 }
    };

    questions.forEach(q => {
      const ans = answers[q.id];
      const selected = ans?.selectedOption ?? null;
      const diff = (q.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';
      
      difficultyStats[diff].total += 1;

      if (selected !== null) {
        attempted += 1;
        const correct = selected === q.correctAnswer;
        if (correct) {
          score += 1;
          correctCount += 1;
          currentStreak += 1;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
          difficultyStats[diff].correct += 1;
        } else {
          incorrectCount += 1;
          currentStreak = 0;
        }
      } else {
        skippedCount += 1;
        currentStreak = 0;
      }
    });

    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
    const percentage = Math.round((score / questions.length) * 100);

    const accuracyByDifficulty = {
      Easy: difficultyStats.Easy.total > 0 ? Math.round((difficultyStats.Easy.correct / difficultyStats.Easy.total) * 100) : 0,
      Medium: difficultyStats.Medium.total > 0 ? Math.round((difficultyStats.Medium.correct / difficultyStats.Medium.total) * 100) : 0,
      Hard: difficultyStats.Hard.total > 0 ? Math.round((difficultyStats.Hard.correct / difficultyStats.Hard.total) * 100) : 0
    };

    const averageTime = attempted > 0 ? Math.round(timeSpent / attempted) : 0;

    const historyItem = {
      id: `gk_${Date.now()}`,
      category,
      subcategory,
      score,
      totalQuestions: questions.length,
      percentage,
      timeSpent,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      correctCount,
      incorrectCount,
      skippedCount,
      streak: maxStreak,
      accuracy,
      accuracyByDifficulty,
      averageTime,
      questions,
      answers,
      totalMarks,
      gk_assessment_name: assessmentName || 'GK MCQ Exam'
    };

    const existingHistory = JSON.parse(localStorage.getItem('gk_exam_history') || '[]');
    localStorage.setItem('gk_exam_history', JSON.stringify([historyItem, ...existingHistory]));

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
    }

    if (assessmentId) {
      // Format answers as requested: { answers: [ { gk_question_id, user_answer, time_taken_seconds } ] }
      const answersPayload = {
        answers: questions.map(q => {
          const ans = answers[q.id];
          const selectedOptionIdx = ans?.selectedOption ?? null;
          const userLetter = selectedOptionIdx !== null ? String.fromCharCode(65 + selectedOptionIdx) : "";
          
          return {
            gk_question_id: Number(q.id) || 0,
            user_answer: userLetter,
            time_taken_seconds: ans?.timeTaken || 0
          };
        })
      };

      GKService.endGKAssessment(assessmentId, answersPayload).catch(err => {
        console.error("Failed to end GK assessment on server:", err);
      });
    }

    setExamSubmitted(true);
    setShowSubmitModal(false);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Results panel calculation
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let attempted = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  if (examSubmitted) {
    questions.forEach(q => {
      const ans = answers[q.id];
      if (ans?.selectedOption !== null) {
        attempted += 1;
        if (ans?.isCorrect) {
          correctCount += 1;
          currentStreak += 1;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          incorrectCount += 1;
          currentStreak = 0;
        }
      } else {
        skippedCount += 1;
        currentStreak = 0;
      }
    });
  }

  const scorePercentage = Math.round((correctCount / (questions.length || 1)) * 100);
  const accuracyRate = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
  const speedPerQuestion = attempted > 0 ? Math.round(timeSpent / attempted) : 0;

  const feedbackHeading = scorePercentage >= 80 ? 'Masterful Performance!' : scorePercentage >= 60 ? 'Well Done!' : 'Good Effort!';
  const feedbackSub = scorePercentage >= 80 ? 'You demonstrate outstanding conceptual depth in this category.' : scorePercentage >= 60 ? 'Keep reviewing your weak areas to secure high scores.' : 'Re-take the exam or study the notes to build stronger fundamentals.';

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen select-none">
      {/* 1. SECURE FULLSCREEN GATEWAY BLOCK */}
      {!isFullscreen && !examSubmitted && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl space-y-6 animate-scaleIn text-slate-800">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-100 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Secure Exam Mode</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                This General Knowledge Assessment requires a secure fullscreen environment. Exiting fullscreen or switching tabs will be flagged as cheating.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2.5 text-slate-650 text-xs font-bold leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-0.5" />
                <span>Exiting fullscreen counts as 1 warning.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-0.5" />
                <span>Switching tabs or clicking outside will increment warnings.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 mt-0.5" />
                <span className="text-rose-600">Reaching 3 warnings will auto-submit the exam.</span>
              </div>
            </div>

            <button
              onClick={enterFullscreen}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer hover:shadow-xl shadow-indigo-100 active:translate-y-0.5"
            >
              Start Exam in Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* 2. PROCTOR WARNING POPUP SCREEN */}
      {showWarningModal && !examSubmitted && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[998] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 border border-slate-100 shadow-2xl space-y-6 text-center animate-scaleIn">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-100 animate-pulse">
              <AlertCircle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-800">Proctoring Warning</h4>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                {warningReason === 'exited-fullscreen' ? 'You exited fullscreen mode!' : 
                 warningReason === 'tab-switched' ? 'You switched tabs or minimized the browser!' : 
                 'You clicked outside the secure exam runner window!'}
              </p>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-bold leading-relaxed flex items-center justify-center gap-2">
              <span>Remaining Warnings:</span>
              <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full font-black text-xs leading-none">{3 - warningsCount} / 3</span>
            </div>

            <button
              onClick={enterFullscreen}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              Resume Secure Mode
            </button>
          </div>
        </div>
      )}

      {/* 3. EXAM IN-PROGRESS SCREEN - REAL EXAM STYLE */}
      {!examSubmitted && currentQuestion && (
        <div className="font-[Arial,sans-serif] w-full h-screen bg-white text-black flex flex-col overflow-hidden relative select-none">

          {/* Top Black Bar */}
          <div className="shrink-0 w-full bg-black text-white px-4 py-3 text-base flex justify-between items-center z-[1100]">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">Question Paper</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Secure Proctor Active
              </span>
            </div>
            <span className="text-right font-medium">{candidateName}</span>
          </div>

          {/* Exam Name + Timer Row */}
          <div className="shrink-0 flex justify-between items-center px-4 py-2 sm:px-6 sm:py-4 border-b border-slate-200 bg-white shadow-sm z-10 w-full gap-2">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-0.5">{category} • {subcategory}</span>
              <span className="text-sm sm:text-lg md:text-2xl font-extrabold text-slate-800 tracking-tight truncate">{assessmentName || "GK MCQ Exam"}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pr-0.5">Time Remaining</span>
              <div className={`flex justify-center items-center px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-base md:text-xl font-bold transition-all duration-300 ${
                timeRemaining <= 60
                  ? 'bg-red-50 text-red-700 border border-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : timeRemaining <= 300
                    ? 'bg-orange-50 text-orange-600 border border-orange-400'
                    : 'bg-slate-50 text-slate-700 border border-slate-200'
              }`}>
                <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 opacity-80" />
                <span className="tracking-wider">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Type / Marks / Warnings Row */}
          <div className="shrink-0 text-xs sm:text-sm text-[#e07a05] px-3 py-1.5 sm:px-4 sm:py-2 border-b border-slate-200 bg-white flex justify-between items-center gap-2 w-full">
            <span className="font-semibold flex items-center gap-2">
              {/* {currentQuestion.difficulty && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  currentQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                  currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>{currentQuestion.difficulty}</span>
              )} */}
              Type: MCQ | Marks: {totalMarks}
            </span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border ${
              warningsCount > 0
                ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              Warnings: {warningsCount}/3
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 w-full overflow-hidden relative">

            {/* LEFT: Question + Options */}
            <div className="flex flex-1 flex-col overflow-hidden text-sm w-full">

              {/* Scrollable question area */}
              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 sm:p-6 w-full text-base sm:text-xl">
                <div className="w-full">
                  {/* Question Text */}
                  <div className="text-sm sm:text-lg md:text-xl font-bold m-1 mb-4 sm:m-2.5 sm:mb-6 leading-relaxed flex flex-wrap items-start gap-x-2 gap-y-1">
                    <span className="mr-2 whitespace-nowrap text-blue-800">Question {currentIdx + 1}:</span>
                    <div className="flex-1 min-w-[200px] inline-block whitespace-pre-wrap [&_p]:!m-0 [&_p]:whitespace-normal [&_p]:inline [&_mjx-container]:!inline-block [&_mjx-container]:!m-0 [&_span]:!inline [&_br]:hidden">
                      <QuestionMathJax content={currentQuestion.question} />
                    </div>
                  </div>

                  {/* Radio Options */}
                  <div className="flex flex-col gap-1 mt-2">
                    {currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className="py-2 px-2 sm:py-3 sm:px-3 flex flex-row items-start gap-3 w-full hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        onClick={() => handleSelectOption(idx)}
                      >
                        <input
                          type="radio"
                          id={`gk-opt-${currentQuestion.id}-${idx}`}
                          className="shrink-0 cursor-pointer w-4 h-4 mt-[5px] accent-[#0079D1]"
                          name={`gk-q-${currentQuestion.id}`}
                          value={idx}
                          checked={currentAnswer?.selectedOption === idx}
                          onChange={() => handleSelectOption(idx)}
                        />
                        <label
                          htmlFor={`gk-opt-${currentQuestion.id}-${idx}`}
                          className="cursor-pointer flex-1 flex flex-row items-start gap-1 break-words leading-relaxed text-sm sm:text-lg [&_p]:!m-0 [&_p]:inline [&_mjx-container]:!inline-block [&_mjx-container]:!m-0 [&_mjx-container]:!align-middle [&_span]:!inline [&_br]:hidden"
                        >
                          <span className="font-semibold mr-1 shrink-0 min-w-[1.25rem] sm:min-w-[1.5rem]">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span className="inline-block whitespace-pre-wrap">
                            <QuestionMathJax content={option} />
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Clear Response button */}
                  {currentAnswer?.selectedOption !== null && currentAnswer?.selectedOption !== undefined && (
                    <button
                      className="px-3 py-1.5 sm:px-4 sm:py-2 mt-4 bg-[#ff1e1e] text-white border-none rounded-lg cursor-pointer text-xs sm:text-sm transition-colors hover:bg-[#870505]"
                      onClick={handleClearResponse}
                    >
                      Clear Response
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="shrink-0 flex justify-end items-center border-t border-slate-200 p-3 sm:p-4 bg-slate-50 w-full">
                <div className="flex justify-end items-center w-full gap-2 sm:gap-4">
                  <button
                    className="cursor-pointer px-3 py-2.5 sm:py-3 rounded-lg bg-[#77549A] text-white border-none text-xs sm:text-base font-bold transition-all hover:bg-[#4c3463] hover:scale-[1.02] active:scale-95 flex-1 max-w-[180px] sm:max-w-[220px]"
                    onClick={handleToggleReview}
                  >
                    {currentAnswer?.markedForReview ? 'Remove Review' : 'Mark Review'}
                  </button>
                  {currentIdx > 0 && (
                    <button
                      className="cursor-pointer px-4 py-2.5 sm:px-8 sm:py-3 rounded-lg bg-[#0079D1] text-white border-none text-xs sm:text-base font-bold transition-all hover:bg-[#034d82] hover:scale-[1.02] active:scale-95 flex-1 max-w-[100px] sm:max-w-[150px]"
                      onClick={() => handleIndexChange(currentIdx - 1)}
                    >
                      Prev
                    </button>
                  )}
                  {currentIdx < questions.length - 1 ? (
                    <button
                      className="cursor-pointer px-4 py-2.5 sm:px-8 sm:py-3 rounded-lg bg-[#0079D1] text-white border-none text-xs sm:text-base font-bold transition-all hover:bg-[#034d82] hover:scale-[1.02] active:scale-95 flex-1 max-w-[100px] sm:max-w-[150px]"
                      onClick={() => handleIndexChange(currentIdx + 1)}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="cursor-pointer px-4 py-2.5 sm:px-8 sm:py-3 rounded-lg bg-[#17ab07] text-white border-none text-xs sm:text-base font-bold transition-all hover:bg-[#0f7204] hover:scale-[1.02] active:scale-95 flex-1 max-w-[120px] sm:max-w-[180px]"
                      onClick={() => setShowSubmitModal(true)}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Question Palette Sidebar */}
            <div className="w-[25%] min-w-[280px] max-w-[360px] shrink-0 border-l border-black shadow-sm flex-col bg-white text-lg hidden lg:flex">

              {/* Candidate Info (replaces webcam) */}
              <div className="w-full border-b border-black bg-slate-900 flex items-center justify-center py-5 px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-white shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{candidateName}</p>
                    <p className="text-slate-400 text-xs font-semibold">Exam Candidate</p>
                  </div>
                </div>
              </div>

              {/* 2×2 Legend / Count Grid */}
              <div className="grid grid-cols-2 gap-x-1 gap-y-3 w-full p-2 mt-1 mb-2">
                <div className="flex items-center">
                  <span className="h-10 w-10 bg-[#D6D6D6] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-black shrink-0 font-bold text-sm">
                    {questions.filter((_, idx) => !visitedQuestions.has(idx)).length}
                  </span>
                  <p className="text-[13px] m-0 leading-tight">Not Visited</p>
                </div>
                <div className="flex items-center">
                  <span className="h-10 w-10 bg-[#17ab07] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white shrink-0 font-bold text-sm">
                    {questions.filter(q => answers[q.id]?.selectedOption !== null && answers[q.id]?.selectedOption !== undefined && !answers[q.id]?.markedForReview).length}
                  </span>
                  <p className="text-[13px] m-0 leading-tight">Answered</p>
                </div>
                <div className="flex items-center">
                  <span className="h-10 w-10 bg-[#eb0a0a] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white shrink-0 font-bold text-sm">
                    {questions.filter((q, idx) => (answers[q.id]?.selectedOption === null || answers[q.id]?.selectedOption === undefined) && !answers[q.id]?.markedForReview && visitedQuestions.has(idx)).length}
                  </span>
                  <p className="text-[13px] m-0 leading-tight">Not Answered</p>
                </div>
                <div className="flex items-center">
                  <span className="h-10 w-10 bg-[#77549A] flex items-center justify-center text-center mr-1.5 rounded-[5px] text-white shrink-0 font-bold text-sm">
                    {questions.filter(q => answers[q.id]?.markedForReview).length}
                  </span>
                  <p className="text-[13px] m-0 leading-tight">Marked for Review</p>
                </div>
              </div>

              {/* Blue Section Title Bar */}
              <div className="shrink-0 bg-[#0079D1] w-full p-2.5 flex items-center justify-center text-white border-y border-[#005e8e] font-bold">
                <span className="text-base">{subcategory}</span>
              </div>

              {/* Question Palette */}
              <div className="flex flex-col flex-1 overflow-hidden bg-[#E5F6FD] w-full">
                <div className="flex-1 overflow-y-auto w-full p-4">
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: Math.ceil(questions.length / 5) }, (_, rowIdx) => (
                      <div className="flex flex-wrap w-full justify-start flex-row gap-3 xl:gap-4" key={rowIdx}>
                        {Array.from({ length: 5 }, (_, colIdx) => {
                          const qNum = rowIdx * 5 + colIdx + 1;
                          if (qNum > questions.length) return null;
                          const qIdx = qNum - 1;
                          const q = questions[qIdx];
                          const ans = answers[q?.id];
                          const isActive = currentIdx === qIdx;
                          const isAnswered = ans?.selectedOption !== null && ans?.selectedOption !== undefined;
                          const isMarked = ans?.markedForReview;
                          const isVisited = visitedQuestions.has(qIdx);

                          let bgColor = '#D6D6D6';
                          let textColor = 'text-black';
                          if (isMarked) { bgColor = '#77549A'; textColor = 'text-white'; }
                          else if (isAnswered) { bgColor = '#17ab07'; textColor = 'text-white'; }
                          else if (!isAnswered && isVisited) { bgColor = '#eb0a0a'; textColor = 'text-white'; }

                          return (
                            <div className="flex justify-center shrink-0 w-9 sm:w-[45px]" key={qNum}>
                              <button
                                style={{ backgroundColor: bgColor }}
                                className={`w-9 h-9 sm:w-[45px] sm:h-[45px] flex items-center justify-center rounded-[8px] font-semibold text-sm sm:text-lg hover:opacity-80 transition-opacity border-none cursor-pointer ${textColor} ${isActive ? 'ring-2 ring-black ring-offset-2' : ''}`}
                                onClick={() => handleIndexChange(qIdx)}
                              >
                                {qNum}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Exam Button */}
                <div className="shrink-0 bg-[#E5F6FD] flex justify-center items-center w-full p-4 border-t border-black">
                  <button
                    className="cursor-pointer px-6 py-3 rounded-[10px] bg-[#0079D1] text-white border-none font-bold text-lg w-full max-w-[200px] transition-all hover:bg-[#034d82] hover:scale-105 active:scale-95 shadow-lg"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    Submit Exam
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. CONFIRMATION SUBMIT DIALOG MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 border border-slate-100 shadow-2xl space-y-6 animate-scaleIn text-slate-800">
            <div className="flex items-center gap-4 text-amber-600 bg-amber-50 p-4.5 rounded-2xl border border-amber-100/50">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide">Finish Exam</h4>
                <p className="text-slate-500 text-[10px] font-semibold mt-0.5">Please confirm before locking your response sheet.</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Total Questions</span>
                <span className="font-black text-slate-800">{questions.length}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Total Marks</span>
                <span className="font-black text-indigo-600">{totalMarks}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Answered</span>
                <span className="font-black text-emerald-600">
                  {questions.filter(q => answers[q.id]?.selectedOption !== null).length}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Flagged</span>
                <span className="font-black text-purple-600">
                  {questions.filter(q => answers[q.id]?.markedForReview).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Not Answered</span>
                <span className="font-black text-rose-505 font-bold">
                  {questions.filter(q => answers[q.id]?.selectedOption === null).length}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3.5 border border-slate-200 text-slate-505 font-black rounded-xl text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-colors shadow-md shadow-indigo-100 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. POST-EXAM SCORECARD / PERFORMANCE ANALYTICS */}
      {examSubmitted && !showSolution && (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-fadeIn text-slate-800">
          {/* Performance Summary Banner */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
            
            <div className="space-y-4 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                Exam Successfully Completed
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{feedbackHeading}</h1>
              <p className="text-slate-500 font-medium max-w-xl">{feedbackSub}</p>
              
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                <span>Category:</span>
                <span className="text-slate-800">{category}</span>
                <span className="text-slate-300">•</span>
                <span>Topic:</span>
                <span className="text-slate-800">{subcategory}</span>
                <span className="text-slate-300">•</span>
                <span>Total Marks:</span>
                <span className="text-indigo-600 font-extrabold">{totalMarks}</span>
              </div>
            </div>

            {/* Circular score gauge */}
            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-full border border-slate-100 relative w-44 h-44 shadow-inner">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - scorePercentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800">{correctCount}/{questions.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Correct</span>
              </div>
            </div>
          </div>

          {/* Performance metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{accuracyRate}%</h4>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Taken</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</h4>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pace</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{speedPerQuestion}s / Q</h4>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Streak</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{maxStreak} Correct</h4>
              </div>
            </div>
          </div>

          {/* Performance recommendations */}
          {/* <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                <BookmarkCheck className="w-3.5 h-3.5" /> Study Recommendation
              </span>
              <h3 className="text-2xl font-bold">
                {scorePercentage >= 80 ? 'Exceptional Work! You are ready to explore hard tests.' : 
                 scorePercentage >= 60 ? 'Consistent performance! Review the incorrect questions to hit 100%.' :
                 'Keep practicing! Focus on foundational concepts.'}
              </h3>
              <p className="text-slate-400 text-sm max-w-xl">
                Time-management analysis suggests you spent an average of {speedPerQuestion} seconds per question. 
                {speedPerQuestion < 12 ? ' This indicates highly rapid response times. Ensure you double-check to minimize accidental errors.' : 
                 speedPerQuestion > 30 ? ' You took balanced, comprehensive care with options. This deliberate pacing helps score high in harder modules.' :
                 ' Your pacing is highly optimized and balanced for competition standards.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-400 hover:text-white transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Exam</span>
              </button>
              
              <button
                onClick={onExit}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 transition-all cursor-pointer"
              >
                <span>Back to Exams</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoToDashboard}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
              >
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowSolution(true)}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg shadow-indigo-100 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Eye className="w-4 h-4" />
              View Solution
            </button>
            <button
              onClick={onGoToResults}
              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
              Go to Results List
            </button>
          </div>
        </div>
      )}

      {/* 5b. SOLUTION VIEW */}
      {examSubmitted && showSolution && (
        <GKExamSolution
          questions={questions}
          answers={answers}
          onBack={() => { setShowSolution(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      )}
    </div>
  );
}
