import React, { useState, useEffect } from 'react';
import { CompetitionService } from '../../services/CompetitionService';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  Download,
  Share2,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Sparkles,
  BarChart2,
  Check,
  Zap,
  Tag,
  Loader2,
  MessageSquareText
} from 'lucide-react';

export interface QuestionAttempt {
  id: string;
  questionNumber: number;
  questionText: string;
  options: string[];
  selectedOption: number | null; // 0-indexed option, or null if unattempted
  correctOption: number; // 0-indexed option
  userLetter?: string;
  correctLetter?: string;
  isCorrect: boolean;
  isSkipped: boolean;
  isUnattempted: boolean;
  explanation: string;
  aiFeedback?: string;
  timeSpent: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  userTranscription?: string;
  aiScore?: number;
  ai_score?: number;
}

export interface CompetitionAttemptResult {
  attemptId: string;
  competitionTitle: string;
  category: string;
  moduleType?: string;
  attemptDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank?: number;
  totalParticipants?: number;
  percentile: number;
  timeTaken: string;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  skippedCount: number;
  xpEarned: number;
  rewardBadge: string;
  topicBreakdown: { topic: string; total: number; correct: number; percentage: number }[];
  questions: QuestionAttempt[];
}

/*
// Sample Fallback Mock Detailed Results commented out - Competition result relies strictly on API data
export const MOCK_DETAILED_RESULTS: Record<string, CompetitionAttemptResult> = {
  'attempt-101': {
    attemptId: 'attempt-101',
    competitionTitle: 'National Mathematics Speed Cup 2026',
    category: 'mathematics',
    moduleType: 'GK',
    attemptDate: '05 Aug 2026, 10:45 AM',
    score: 925,
    maxScore: 1000,
    percentage: 92.5,
    rank: 4,
    totalParticipants: 1420,
    percentile: 99.7,
    timeTaken: '21m 05s / 45m',
    totalQuestions: 10,
    correctCount: 8,
    incorrectCount: 1,
    skippedCount: 1,
    xpEarned: 1650,
    rewardBadge: 'Gold Medal Merit Certificate',
    topicBreakdown: [
      { topic: 'Algebra & Polynomials', total: 4, correct: 4, percentage: 100 },
      { topic: 'Coordinate Geometry', total: 3, correct: 2, percentage: 66.7 },
      { topic: 'Trigonometry', total: 3, correct: 2, percentage: 66.7 }
    ],
    questions: [
      {
        id: 'q1',
        questionNumber: 1,
        questionText: 'If α and β are the roots of the quadratic equation 2x² - 5x + 3 = 0, find the value of (α² + β²).',
        options: ['13 / 4', '19 / 4', '25 / 4', '7 / 2'],
        selectedOption: 0,
        correctOption: 0,
        userLetter: 'A',
        correctLetter: 'A',
        isCorrect: true,
        isSkipped: false,
        explanation: 'α + β = 5/2 and αβ = 3/2. Using α² + β² = (α + β)² - 2αβ = (5/2)² - 2(3/2) = 25/4 - 3 = 13/4.',
        aiFeedback: 'Great accuracy! Quick mental calculation of roots demonstrated high proficiency.',
        timeSpent: '1m 12s',
        topic: 'Algebra & Polynomials',
        difficulty: 'Medium'
      },
      {
        id: 'q2',
        questionNumber: 2,
        questionText: 'Find the distance between the parallel lines 3x - 4y + 7 = 0 and 3x - 4y - 3 = 0.',
        options: ['1 unit', '2 units', '3 units', '4 units'],
        selectedOption: 1,
        correctOption: 1,
        userLetter: 'B',
        correctLetter: 'B',
        isCorrect: true,
        isSkipped: false,
        explanation: 'Distance formula between parallel lines Ax + By + C₁ = 0 and Ax + By + C₂ = 0 is d = |C₁ - C₂| / √(A² + B²) = |7 - (-3)| / √(3² + (-4)²) = 10 / 5 = 2 units.',
        aiFeedback: 'Accurate application of standard distance formula.',
        timeSpent: '1m 45s',
        topic: 'Coordinate Geometry',
        difficulty: 'Easy'
      },
      {
        id: 'q3',
        questionNumber: 3,
        questionText: 'Evaluate tan(75°) - tan(15°).',
        options: ['2', '2√3', '4', '√3 / 2'],
        selectedOption: 1,
        correctOption: 1,
        userLetter: 'B',
        correctLetter: 'B',
        isCorrect: true,
        isSkipped: false,
        explanation: 'tan(75°) = 2 + √3 and tan(15°) = 2 - √3. Therefore, tan(75°) - tan(15°) = (2 + √3) - (2 - √3) = 2√3.',
        aiFeedback: 'Good knowledge of trigonometric values.',
        timeSpent: '2m 10s',
        topic: 'Trigonometry',
        difficulty: 'Medium'
      },
      {
        id: 'q4',
        questionNumber: 4,
        questionText: 'Find the sum of all two-digit numbers which leave a remainder of 1 when divided by 4.',
        options: ['1210', '1221', '1254', '1280'],
        selectedOption: 1,
        correctOption: 1,
        userLetter: 'B',
        correctLetter: 'B',
        isCorrect: true,
        isSkipped: false,
        explanation: 'Two-digit numbers leaving remainder 1 modulo 4 form an AP: 13, 17, 21, ..., 97. Number of terms n = ((97 - 13)/4) + 1 = 22. Sum S₂₂ = 22/2 * (13 + 97) = 11 * 110 = 1221.',
        aiFeedback: 'Excellent arithmetic progression calculation under time pressure.',
        timeSpent: '2m 30s',
        topic: 'Algebra & Polynomials',
        difficulty: 'Hard'
      },
      {
        id: 'q5',
        questionNumber: 5,
        questionText: 'If sin θ + cos θ = √2 cos θ, then what is the value of cos θ - sin θ?',
        options: ['√2 sin θ', '√2 cos θ', 'sin θ', '-√2 sin θ'],
        selectedOption: 0,
        correctOption: 0,
        userLetter: 'A',
        correctLetter: 'A',
        isCorrect: true,
        isSkipped: false,
        explanation: 'Squaring both sides: sin²θ + cos²θ + 2sinθcosθ = 2cos²θ => 2sinθcosθ = cos²θ - sin²θ. Divide both sides by (cosθ + sinθ) = √2 cosθ to get cosθ - sinθ = 2sinθcosθ / (√2 cosθ) = √2 sinθ.',
        aiFeedback: 'Clever trigonometric identity simplification!',
        timeSpent: '1m 55s',
        topic: 'Trigonometry',
        difficulty: 'Medium'
      }
    ]
  }
};
*/

export interface CompetitionResultProps {
  attemptId: string;
  attemptData?: any;
  moduleType?: string;
  onBack: () => void;
}

export const CompetitionResult: React.FC<CompetitionResultProps> = ({
  attemptId,
  attemptData,
  moduleType = 'GK',
  onBack
}) => {
  const [filterType, setFilterType] = useState<'all' | 'attempted' | 'unattempted' | 'skipped'>('all');
  const [resultData, setResultData] = useState<CompetitionAttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to map letter string ('A', 'B', 'C', 'D') to index (0, 1, 2, 3)
  const letterToIdx = (letter?: string | number): number | null => {
    if (letter === null || letter === undefined || letter === '') return null;
    if (typeof letter === 'number') return letter;
    const upper = String(letter).trim().toUpperCase();
    if (upper === 'A' || upper === 'OPTION A' || upper === '1') return 0;
    if (upper === 'B' || upper === 'OPTION B' || upper === '2') return 1;
    if (upper === 'C' || upper === 'OPTION C' || upper === '3') return 2;
    if (upper === 'D' || upper === 'OPTION D' || upper === '4') return 3;
    if (upper === 'E' || upper === 'OPTION E' || upper === '5') return 4;
    const num = Number(upper);
    return isNaN(num) ? null : num;
  };

  // Fetch Result API
  useEffect(() => {
    let isMounted = true;
    const fetchResult = async () => {
      setIsLoading(true);
      try {
        const rawModType = String(moduleType || attemptData?.moduleType || attemptData?.module_type || 'GK').toUpperCase();
        const rawUserId = attemptData?.user_id || localStorage.getItem('user_id') || Cookies.get('user_id') || '';
        const rawSessionId = attemptData?.session_id || attemptData?.session_Id || attemptId;
        const rawGkUserAssId = attemptData?.gk_user_ass_id || attemptData?.gk_user_assessment_id || attemptData?.gk_user_assId || attemptId;

        console.log("Fetching result details:", { rawModType, rawUserId, rawSessionId, rawGkUserAssId });
        const res = await CompetitionService.GetCompetitionResult(
          rawModType,
          rawUserId,
          (rawModType === 'VIVA' || rawModType === 'TAM') ? rawSessionId : undefined,
          rawModType === 'GK' ? rawGkUserAssId : undefined
        );
        
        const payload = res?.data?.data || res?.data || res?.result || res || attemptData;
        const sessionObj = payload?.session || payload;
        
        const rawQList: any[] = Array.isArray(payload?.answers)
          ? payload.answers
          : (Array.isArray(payload?.details)
            ? payload.details
            : (Array.isArray(payload?.questions)
              ? payload.questions
              : (Array.isArray(payload?.gk_answers)
                ? payload.gk_answers
                : (Array.isArray(payload?.question_attempts)
                  ? payload.question_attempts
                  : (Array.isArray(payload) ? payload : [])))));

        if (payload && (rawQList.length > 0 || payload.session || payload.details || payload.questions || payload.gk_answers || payload.answers || payload.session_id || payload.gk_user_ass_id)) {
          let correct = 0;
          let incorrect = 0;
          let skipped = 0;
          let unattempted = 0;

          const parsedQuestions: QuestionAttempt[] = rawQList.map((q: any, idx: number) => {
            const qText = q.question_latex || q.gk_question || q.question_text || q.question || q.title || `Question ${idx + 1}`;
            
            let opts: string[] = [];
            if (Array.isArray(q.options) && q.options.length > 0) {
              opts = q.options;
            } else if (q.option_a !== undefined || q.option_b !== undefined || q.option_c !== undefined || q.option_d !== undefined) {
              opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter((opt) => opt !== undefined && opt !== null && opt !== '');
            } else {
              opts = [];
            }

            const rawUserAns = q.user_transcription || (q.user_answer ?? q.selected_option ?? q.selectedOption);
            const rawCorrAns = q.answer_description || (q.correct_answer ?? q.correct_option ?? q.correctOption ?? '');

            const userIdx = letterToIdx(q.user_answer ?? q.selected_option ?? q.selectedOption);
            const corrIdx = letterToIdx(q.correct_answer ?? q.correct_option ?? q.correctOption);

            const rawStatus = String(q.status || '').toUpperCase();
            const isSkipped = rawStatus === 'SKIPPED' || rawStatus === 'SKIP';
            const isUnattempted = !isSkipped && (rawStatus === 'UNATTEMPTED' || rawStatus === 'UN_ATTEMPTED' || (!q.user_transcription && (q.user_answer === null || q.user_answer === undefined || q.user_answer === '' || String(q.user_answer).toUpperCase() === 'NONE')));
            const isNotAttempted = isSkipped || isUnattempted;

            const isCorrect = !isNotAttempted && (
              rawStatus === 'CORRECT' ||
              rawStatus === 'COMPLETED' ||
              q.is_correct === true ||
              Number(q.ai_score || 0) > 0 ||
              (userIdx !== null && corrIdx !== null && userIdx === corrIdx)
            );

            if (isSkipped) skipped++;
            else if (isUnattempted) unattempted++;
            else if (isCorrect) correct++;
            else incorrect++;

            const timeSec = Number(q.total_time_taken || q.time_taken_seconds || q.time_taken || q.timeSpent);
            const questionAiScore = q.ai_score !== undefined && q.ai_score !== null
              ? Number(q.ai_score)
              : (rawModType === 'TAM' ? 10 : (q.score !== undefined ? Number(q.score) : undefined));

            return {
              id: String(q.question_id || q.gk_question_id || q.v_ans_id || q.id || `q-${idx + 1}`),
              questionNumber: idx + 1,
              questionText: qText,
              options: opts,
              selectedOption: userIdx,
              correctOption: corrIdx ?? 0,
              userLetter: isSkipped ? 'Skipped' : (isUnattempted ? 'Unattempted' : (userIdx !== null ? String.fromCharCode(65 + userIdx) : 'Recorded Response')),
              correctLetter: corrIdx !== null ? String.fromCharCode(65 + corrIdx) : 'Model Answer',
              isCorrect,
              isSkipped,
              isUnattempted,
              explanation: (rawModType === 'TAM' && (q.reference_answer || q.reference_answers))
                ? (q.reference_answer || q.reference_answers)
                : (q.answer_description || q.gk_answer || q.answer_explanation || q.explanation || q.gk_explanation || q.solution || 'Detailed solution for this question.'),
              aiFeedback: q.ai_feedback || q.speech_transcript || q.feedback_text || (isCorrect ? 'Strong response precision!' : (isSkipped ? 'Question was skipped.' : (isUnattempted ? 'Question was not attempted.' : 'Review fundamental concepts for this question.'))),
              timeSpent: timeSec > 0 ? `${timeSec}s` : (q.time_taken_seconds),
              topic: q.topic_name || q.subject || q.topic || sessionObj.subject_name || sessionObj.assessment_name || sessionObj.gk_assessment_name || 'General Knowledge',
              difficulty: q.difficulty || (idx % 3 === 0 ? 'Easy' : idx % 3 === 1 ? 'Medium' : 'Hard'),
              userTranscription: q.user_transcription || undefined,
              aiScore: questionAiScore,
              ai_score: questionAiScore
            };
          });

          const totalQ = parsedQuestions.length > 0 ? parsedQuestions.length : Number(sessionObj.total_questions || sessionObj.total_marks || sessionObj.gk_total_marks || 10);
          const score = Number(sessionObj.total_score ?? sessionObj.score ?? sessionObj.marks_obtained ?? correct);
          const maxScore = Number(sessionObj.gk_total_marks ?? sessionObj.max_score ?? sessionObj.total_marks ?? sessionObj.maxScore ?? (rawModType === 'TAM' ? totalQ * 10 : totalQ * 1));
          
          const percentage = sessionObj.percentage !== undefined && sessionObj.percentage !== null
            ? Number(sessionObj.percentage)
            : (sessionObj.accuracy !== undefined && sessionObj.accuracy !== null
              ? Number(sessionObj.accuracy)
              : (maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(1)) : 0));

          const finalAttempted = sessionObj.attempted_count !== undefined && sessionObj.attempted_count !== null
            ? Number(sessionObj.attempted_count)
            : (correct + incorrect);

          const finalCorrect = sessionObj.correct_count !== undefined && sessionObj.correct_count !== null
            ? Number(sessionObj.correct_count)
            : correct;

          const finalIncorrect = sessionObj.incorrect_count !== undefined && sessionObj.incorrect_count !== null
            ? Number(sessionObj.incorrect_count)
            : incorrect;

          const finalUnattempted = sessionObj.unattempted_count !== undefined && sessionObj.unattempted_count !== null
            ? Number(sessionObj.unattempted_count)
            : unattempted;

          const finalSkipped = sessionObj.skip_count !== undefined && sessionObj.skip_count !== null
            ? Number(sessionObj.skip_count)
            : (sessionObj.skipped_count !== undefined && sessionObj.skipped_count !== null
              ? Number(sessionObj.skipped_count)
              : (sessionObj.skipCount !== undefined ? Number(sessionObj.skipCount) : skipped));

          let timeTakenStr = '';

          // 1. Check numeric total_time / total_time_taken / time_taken_seconds from sessionObj or payload
          const rawTotalSecs =
            sessionObj?.total_time_taken ??
            payload?.total_time_taken ??
            sessionObj?.total_time ??
            payload?.total_time ??
            sessionObj?.time_taken_seconds ??
            payload?.time_taken_seconds ??
            sessionObj?.gk_total_time;

          if (rawTotalSecs !== undefined && rawTotalSecs !== null && rawTotalSecs !== '') {
            const numSecs = Number(rawTotalSecs);
            if (!isNaN(numSecs) && numSecs >= 0) {
              const m = Math.floor(numSecs / 60);
              const s = numSecs % 60;
              timeTakenStr = m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m}m`) : `${s}s`;
            }
          }

          // 2. Fallback to sessionObj.time_taken / sessionObj.timeTaken if present
          if (!timeTakenStr && (sessionObj.time_taken || sessionObj.timeTaken)) {
            const rawStr = String(sessionObj.time_taken || sessionObj.timeTaken).trim();
            const numSecs = Number(rawStr);
            if (!isNaN(numSecs) && numSecs >= 0) {
              const m = Math.floor(numSecs / 60);
              const s = numSecs % 60;
              timeTakenStr = m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m}m`) : `${s}s`;
            } else {
              timeTakenStr = rawStr;
            }
          }

          // 3. Fallback to sum of question timeSpent from questions array
          if (!timeTakenStr && parsedQuestions.length > 0) {
            const sumSecs = parsedQuestions.reduce((acc, q) => {
              const val = Number(String(q.timeSpent || '').replace(/[^0-9.]/g, ''));
              return acc + (isNaN(val) ? 0 : val);
            }, 0);

            if (sumSecs > 0) {
              const m = Math.floor(sumSecs / 60);
              const s = sumSecs % 60;
              timeTakenStr = m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m}m`) : `${s}s`;
            }
          }

          // 4. Fallback to completed_at - started_at timestamp difference
          if (!timeTakenStr && (sessionObj.completed_at || sessionObj.end_time) && (sessionObj.started_at || sessionObj.start_time)) {
            const startMs = new Date(sessionObj.started_at || sessionObj.start_time).getTime();
            const endMs = new Date(sessionObj.completed_at || sessionObj.end_time).getTime();
            if (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs) {
              const diffSec = Math.floor((endMs - startMs) / 1000);
              const m = Math.floor(diffSec / 60);
              const s = diffSec % 60;
              timeTakenStr = m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m}m`) : `${s}s`;
            }
          }

          if (!timeTakenStr) {
            timeTakenStr = `${Math.round(totalQ * 1.5)} mins`;
          }

          const formattedResult: CompetitionAttemptResult = {
            attemptId: String(attemptId),
            competitionTitle: sessionObj.assessment_name || sessionObj.gk_assessment_name || sessionObj.competition_title || sessionObj.title || attemptData?.title || 'Competition Assessment Result',
            category: (sessionObj.module_type || rawModType || moduleType || 'VIVA').toLowerCase(),
            moduleType: sessionObj.module_type || rawModType || moduleType || 'VIVA',
            attemptDate: sessionObj.completed_at || sessionObj.end_time || sessionObj.submitted_at || sessionObj.created_at || sessionObj.started_at || attemptData?.attemptDate || 'Today',
            score,
            maxScore,
            percentage,
            rank: (sessionObj.rank !== undefined && sessionObj.rank !== null && sessionObj.rank !== '') 
              ? Number(sessionObj.rank) 
              : ((sessionObj.user_rank !== undefined && sessionObj.user_rank !== null && sessionObj.user_rank !== '') 
                ? Number(sessionObj.user_rank) 
                : (attemptData?.rank !== undefined && attemptData?.rank !== null ? Number(attemptData.rank) : undefined)),
            totalParticipants: Number(sessionObj.total_participants || sessionObj.participants || 100),
            percentile: Number(sessionObj.percentile || (percentage >= 90 ? 98.5 : percentage)),
            timeTaken: timeTakenStr,
            totalQuestions: totalQ,
            attemptedCount: finalAttempted,
            correctCount: finalCorrect,
            incorrectCount: finalIncorrect,
            unattemptedCount: finalUnattempted,
            skippedCount: finalSkipped,
            xpEarned: Math.round(percentage * 15),
            rewardBadge: percentage >= 90 ? 'Gold Medal Merit Certificate' : 'Merit Certificate',
            topicBreakdown: sessionObj.topicBreakdown || [
              { topic: 'Viva Oral & Concepts', total: totalQ, correct: finalCorrect, percentage }
            ],
            questions: parsedQuestions
          };

          if (isMounted) setResultData(formattedResult);
        } else {
          const errorMsg = res?.message || "Competition result details not found on server.";
          console.error(errorMsg);
          toast.error(errorMsg);
          if (isMounted) onBack();
        }
      } catch (err: any) {
        console.error("Failed to load result from API:", err);
        const errorMsg = err?.response?.data?.message || err?.message || "Failed to load competition result from server.";
        toast.error(errorMsg);
        if (isMounted) onBack();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchResult();
    return () => {
      isMounted = false;
    };
  }, [attemptId, attemptData]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 p-8">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-600 font-bold text-base">Loading detailed competition report & AI feedback...</p>
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

  const activeResult = resultData;

  const attemptedCount = activeResult.attemptedCount ?? (activeResult.questions.length > 0 ? activeResult.questions.filter((q) => !q.isSkipped && !q.isUnattempted).length : activeResult.correctCount);
  const unattemptedCount = activeResult.unattemptedCount ?? (activeResult.questions.length > 0 ? activeResult.questions.filter((q) => q.isUnattempted).length : 0);
  const skippedCount = activeResult.skippedCount ?? (activeResult.questions.length > 0 ? activeResult.questions.filter((q) => q.isSkipped).length : 0);

  // Filtered questions based on selected pill
  const filteredQuestions = activeResult.questions.filter((q) => {
    if (filterType === 'attempted') return !q.isSkipped && !q.isUnattempted;
    if (filterType === 'unattempted') return q.isUnattempted;
    if (filterType === 'skipped') return q.isSkipped;
    return true;
  });

  const activeModuleUpper = (activeResult.moduleType || moduleType || 'GK').toUpperCase();

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-5 md:p-6 lg:p-8 space-y-6 md:space-y-8 font-sans max-w-7xl mx-auto">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
          Back to Competition History
        </button>
      </div>

      {/* Main Result Summary Header Card */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border border-slate-200 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {activeModuleUpper} Module
              </span>
              <span className="text-xs text-slate-500">{activeResult.attemptDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
              {activeResult.competitionTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Detailed performance analysis, topic breakdown, AI feedback, and step-by-step question solutions.
            </p>
          </div>

          {/* Score & Rank Badges */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 w-full lg:w-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-3.5 shadow-sm flex-1 sm:flex-none">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-500 text-white font-black shadow-md shadow-amber-500/20 shrink-0">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-semibold truncate">National Rank</div>
                {activeResult.rank !== undefined && activeResult.rank !== null ? (
                  <div className="text-base sm:text-xl font-black text-amber-700 truncate">Rank #{activeResult.rank}</div>
                ) : (
                  <div className="text-xs sm:text-sm font-bold text-slate-400 py-0.5 truncate">Not Declared</div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-3.5 shadow-sm flex-1 sm:flex-none">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-600 text-white font-black shadow-md shadow-blue-500/20 shrink-0">
                <Award className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-semibold truncate">Total Score</div>
                <div className="text-base sm:text-xl font-black text-slate-900 truncate">
                  {activeResult.score} <span className="text-xs text-slate-500 font-normal">/ {activeResult.maxScore}</span>
                </div>
                <div className="text-[10px] text-blue-700 font-bold truncate">{activeResult.percentage}% Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stat Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-4 border-t border-slate-200">
          {/* KPI 1: Attempted Questions / Total Questions */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-3 sm:p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold truncate">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Attempted Questions
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">
              {attemptedCount} <span className="text-xs font-semibold text-emerald-600">/ {activeResult.totalQuestions}</span>
            </div>
          </div>

          {/* KPI 2: Unattempted Questions */}
          <div className="bg-red-50/80 border border-red-200 p-3 sm:p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold truncate">
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 shrink-0" /> Unattempted Questions
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-800">
              {unattemptedCount} <span className="text-xs font-semibold text-red-600">Questions</span>
            </div>
          </div>

          {/* KPI 3: Skipped Questions */}
          <div className="bg-amber-50/80 border border-amber-200 p-3 sm:p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold truncate">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" /> Skipped Questions
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-800">
              {skippedCount} <span className="text-xs font-semibold text-amber-600">Skipped</span>
            </div>
          </div>

          {/* KPI 4: Time Taken */}
          <div className="bg-indigo-50/80 border border-indigo-200 p-3 sm:p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold truncate">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" /> Time Taken
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-900">{activeResult.timeTaken}</div>
          </div>
        </div>
      </div>

      {/* Question-By-Question Detailed Review Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
              Attempted Questions, AI Feedback & Solutions
            </h2>
            <p className="text-xs text-slate-500">Review selected choices, correct answers, step-by-step reasoning, and AI feedback.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar scrollbar-none max-w-full">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterType === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({activeResult.questions.length})
            </button>
            <button
              onClick={() => setFilterType('attempted')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterType === 'attempted' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attempted ({attemptedCount})
            </button>
            <button
              onClick={() => setFilterType('unattempted')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterType === 'unattempted' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unattempted ({unattemptedCount})
            </button>
            <button
              onClick={() => setFilterType('skipped')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterType === 'skipped' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skipped ({skippedCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mx-auto" />
            <p className="text-xs sm:text-sm text-slate-700 font-semibold">No questions found matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredQuestions.map((q) => (
              <QuestionReviewCard key={q.id} question={q} moduleType={activeModuleUpper} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-Component: Question Review Card with AI Feedback & GK Answer Explanation
const QuestionReviewCard: React.FC<{ question: QuestionAttempt; moduleType?: string }> = ({ question, moduleType = 'GK' }) => {
  return (
    <div
      className={`bg-white border rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm transition-all ${
        question.isCorrect
          ? 'border-emerald-200 hover:border-emerald-300'
          : question.isSkipped
          ? 'border-amber-200 hover:border-amber-300'
          : 'border-red-200 hover:border-red-300'
      }`}
    >
      {/* Question Card Top Bar: Question Number + Question Text on left, Status & Time on right */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-[11px] sm:text-xs flex items-center justify-center text-white shrink-0 mt-0.5 ${
              question.isCorrect
                ? 'bg-emerald-600 shadow-md shadow-emerald-600/20'
                : question.isSkipped
                ? 'bg-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-red-600 shadow-md shadow-red-600/20'
            }`}
          >
            Q{question.questionNumber}
          </span>

          <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words flex-1 pt-0.5">
            {question.questionText}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto flex-wrap">
          {question.timeSpent && (
            <span className="text-[11px] sm:text-xs text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {question.timeSpent}
            </span>
          )}

          {(question.aiScore !== undefined || moduleType === 'TAM') && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] sm:text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" /> AI Score: {question.aiScore ?? 10} / 10
            </span>
          )}

          {question.isCorrect ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] sm:text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Correct
            </span>
          ) : question.isSkipped ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] sm:text-xs font-extrabold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Skipped
            </span>
          ) : question.isUnattempted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] sm:text-xs font-extrabold">
              <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Unattempted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] sm:text-xs font-extrabold">
              <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Incorrect
            </span>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
        {question.options.map((opt, optIdx) => {
          const isSelected = question.selectedOption === optIdx;
          const isCorrectChoice = question.correctOption === optIdx;

          let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700';

          if (isCorrectChoice) {
            optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm';
          } else if (isSelected && !isCorrectChoice) {
            optionStyle = 'bg-red-50 border-red-300 text-red-900 font-bold';
          }

          return (
            <div
              key={optIdx}
              className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${optionStyle}`}
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1 break-words">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border shrink-0 mt-0.5 sm:mt-0 ${
                    isCorrectChoice
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isSelected && !isCorrectChoice
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-xs sm:text-sm leading-snug break-words">{opt}</span>
              </div>

              {isCorrectChoice && (
                ""
                // <span className="text-[11px] sm:text-xs font-extrabold text-emerald-700 flex items-center gap-1 shrink-0 self-start sm:self-auto">
                //   <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Correct Answer
                // </span>
              )}
              {isSelected && !isCorrectChoice && (
                ""
                // <span className="text-[11px] sm:text-xs font-extrabold text-red-700 flex items-center gap-1 shrink-0 self-start sm:self-auto">
                //   <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 shrink-0" /> Your Choice
                // </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Transcribed Spoken Response (for Viva) */}
      {question.userTranscription && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-1 mt-3">
          <div className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Your Recorded Answer</div>
          <p className="text-xs text-slate-700 italic font-sans break-words">"{question.userTranscription}"</p>
        </div>
      )}

      {/* AI Feedback Section */}
      {question.aiFeedback && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3.5 sm:p-4 space-y-1.5 mt-3">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-extrabold text-indigo-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" /> AI Feedback & Evaluation
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans break-words">{question.aiFeedback}</p>
        </div>
      )}

      {/* Answer Explanation / Model Solution Box */}
      {question.explanation && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 sm:p-4 space-y-1.5 mt-2">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-extrabold text-amber-900 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
            {moduleType === 'GK' ? 'GK Answer Explanation' : 'Expected Answer'}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans break-words">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default CompetitionResult;
