import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock,
  Calendar, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff,
  BookOpen,
  ArrowLeft,
  Zap,
  Info,
  CheckCircle,
  TrendingUp,
  // BarChart2
} from 'lucide-react';
import { GKService } from '../../services/GKService';
import QuestionMathJax from '../../shared/mathjaxconfig/QuestionMathJax';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: string;
}

interface GKHistoryItem {
  id: string;
  category: string;
  subcategory: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  date: string;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  streak: number;
  accuracy: number;
  accuracyByDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  averageTime: number;
  questions?: Question[];
  answers?: Record<string, {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
    timeTaken: number;
    markedForReview: boolean;
  }>;
}

export default function GKResult() {
  const [history, setHistory] = useState<GKHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExamDetails, setSelectedExamDetails] = useState<GKHistoryItem | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id') || '';
        if (userId) {
          const res = await GKService.getListGKAssessment(userId);
          const rawList = res?.assessments || res?.data?.assessments || (Array.isArray(res) ? res : (res?.data || []));
          const mapped = rawList.map(mapBackendAssessmentToListItem);
          setHistory(mapped);
        }
      } catch (err) {
        console.error("Failed to load GK assessment list:", err);
        toast.error("Failed to fetch assessment history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const mapBackendAssessmentToListItem = (item: any): GKHistoryItem => {
    const scoreVal = item.correct_count ?? item.total_score ?? item.score ?? 0;
    const incorrectVal = item.incorrect_count ?? 0;
    const skippedVal = item.skipped_count ?? 0;
    const totalQuestions = (item.total_questions ?? (scoreVal + incorrectVal + skippedVal)) || 10;
    const accuracyNum = typeof item.accuracy === 'number' ? item.accuracy : (typeof item.accuracy === 'string' && !isNaN(parseFloat(item.accuracy)) ? parseFloat(item.accuracy) : null);
    const percentage = accuracyNum !== null ? Math.round(accuracyNum) : (totalQuestions > 0 ? Math.round((scoreVal / totalQuestions) * 100) : 0);
    let timeSpent = 0;
    if (item.start_time && item.end_time) {
      const start = new Date(item.start_time).getTime();
      const end = new Date(item.end_time).getTime();
      if (!isNaN(start) && !isNaN(end)) timeSpent = Math.max(0, Math.floor((end - start) / 1000));
    } else {
      timeSpent = item.time_spent ?? item.time_spent_seconds ?? 0;
    }
    const dateStr = item.end_time || item.start_time || item.created_at || item.date || new Date().toLocaleString();
    return {
      id: String(item.gk_user_ass_id || item.id || Math.random()),
      category: item.gk_assessment_name || item.category || item.category_name || item.assessment_type || 'GK Assessment',
      subcategory: item.subcategory || item.subcategory_name || item.creation_mode || 'Attempt',
      score: scoreVal, totalQuestions, percentage, timeSpent,
      date: new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      correctCount: scoreVal, incorrectCount: incorrectVal, skippedCount: skippedVal,
      streak: item.streak ?? item.max_streak ?? 0, accuracy: percentage,
      accuracyByDifficulty: { Easy: item.accuracy_easy ?? percentage, Medium: item.accuracy_medium ?? percentage, Hard: item.accuracy_hard ?? percentage },
      averageTime: item.average_time ?? (timeSpent > 0 && (scoreVal + incorrectVal) > 0 ? Math.round(timeSpent / (scoreVal + incorrectVal)) : 0)
    };
  };

  const parseBackendResult = (res: any): GKHistoryItem => {
    const data = res?.data || res;
    const summary = data.assessment_summary || data;
    const rawQuestions = data.details || data.questions || [];
    const mappedQuestions = rawQuestions.map((q: any) => {
      const details = q.question_details || {};
      const options: string[] = [];
      if (q.option_a) options.push(q.option_a);
      if (q.option_b) options.push(q.option_b);
      if (q.option_c) options.push(q.option_c);
      if (q.option_d) options.push(q.option_d);
      if (options.length === 0) {
        if (q.option1_latex || q.option1) options.push(q.option1_latex || q.option1);
        if (q.option2_latex || q.option2) options.push(q.option2_latex || q.option2);
        if (q.option3_latex || q.option3) options.push(q.option3_latex || q.option3);
        if (q.option4_latex || q.option4) options.push(q.option4_latex || q.option4);
      }
      if (options.length === 0) {
        if (details.option1_latex || details.option1) options.push(details.option1_latex || details.option1);
        if (details.option2_latex || details.option2) options.push(details.option2_latex || details.option2);
        if (details.option3_latex || details.option3) options.push(details.option3_latex || details.option3);
        if (details.option4_latex || details.option4) options.push(details.option4_latex || details.option4);
      }
      const parseCorrectAnswerIdx = (item: any): number => {
        const raw = item.correct_option || item.correct_answer || item.answer || details.correct_option || '';
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string') {
          const clean = raw.toLowerCase().trim();
          if (clean === 'a' || clean === 'option_a' || clean === 'option1' || clean === '1') return 0;
          if (clean === 'b' || clean === 'option_b' || clean === 'option2' || clean === '2') return 1;
          if (clean === 'c' || clean === 'option_c' || clean === 'option3' || clean === '3') return 2;
          if (clean === 'd' || clean === 'option_d' || clean === 'option4' || clean === '4') return 3;
        }
        return 0;
      };
      return {
        id: String(q.id || q.question_id || q.gk_question_id || details.question_id || Math.random()),
        question: q.gk_question || details.gk_question || q.question || q.question_text || q.question_latex || q.que || details.question_latex || details.question_text || '',
        options: options.length > 0 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: parseCorrectAnswerIdx(q),
        explanation: q.explanation ||q.gk_answer || details.gk_answer || q.explanation_text || details.explanation || details.explanation_text || '',
        difficulty: q.difficulty || details.difficulty || 'Medium'
      };
    });
    const rawAnswers = data.answers || data.user_answers || data.details || [];
    const mappedAnswers: Record<string, any> = {};
    mappedQuestions.forEach((q: any) => {
      const ansObj = rawAnswers.find((a: any) => String(a.gk_question_id || a.question_id || a.id) === String(q.id));
      let selectedOption: number | null = null;
      if (ansObj) {
        const rawAns = ansObj.user_answer || ansObj.selectedOption || ansObj.user_selected_option || '';
        if (rawAns !== undefined && rawAns !== null && rawAns !== '') {
          if (typeof rawAns === 'number') { selectedOption = rawAns; }
          else {
            const clean = String(rawAns).toLowerCase().trim();
            if (clean === 'a' || clean === 'option_a' || clean === '0') selectedOption = 0;
            else if (clean === 'b' || clean === 'option_b' || clean === '1') selectedOption = 1;
            else if (clean === 'c' || clean === 'option_c' || clean === '2') selectedOption = 2;
            else if (clean === 'd' || clean === 'option_d' || clean === '3') selectedOption = 3;
          }
        }
      }
      mappedAnswers[q.id] = { questionId: q.id, selectedOption, isCorrect: selectedOption === q.correctAnswer, timeTaken: ansObj?.time_taken_seconds || ansObj?.time_taken || 0, markedForReview: false };
    });
    const scoreVal = summary.total_score ?? summary.correct_count ?? summary.score ?? 0;
    const incorrectVal = summary.incorrect_count ?? 0;
    const skippedVal = summary.skipped_count ?? 0;
    const totalQuestionsVal = (summary.gk_total_questions ?? summary.total_questions ?? (scoreVal + incorrectVal + skippedVal)) || mappedQuestions.length || 10;
    const pct = summary.accuracy !== undefined ? Math.round(parseFloat(summary.accuracy)) : (summary.percentage ?? summary.score_percentage ?? (totalQuestionsVal > 0 ? Math.round((scoreVal / totalQuestionsVal) * 100) : 0));
    let timeSpent = 0;
    if (summary.start_time && summary.end_time) {
      const start = new Date(summary.start_time).getTime(); const end = new Date(summary.end_time).getTime();
      if (!isNaN(start) && !isNaN(end)) timeSpent = Math.max(0, Math.floor((end - start) / 1000));
    } else { timeSpent = summary.time_spent ?? summary.time_spent_seconds ?? 0; }
    const dateStr = summary.end_time || summary.start_time || summary.created_at || summary.date || new Date().toLocaleString();
    return {
      id: String(summary.gk_user_ass_id || summary.id || Math.random()),
      category: summary.gk_assessment_name || summary.category || summary.category_name || summary.assessment_type || 'GK Assessment',
      subcategory: summary.subcategory || summary.subcategory_name || summary.creation_mode || 'Attempt',
      score: scoreVal, totalQuestions: totalQuestionsVal, percentage: pct, timeSpent,
      date: new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      correctCount: scoreVal, incorrectCount: incorrectVal, skippedCount: skippedVal,
      streak: summary.streak ?? summary.max_streak ?? 0, accuracy: pct,
      accuracyByDifficulty: { Easy: summary.accuracy_easy ?? pct, Medium: summary.accuracy_medium ?? pct, Hard: summary.accuracy_hard ?? pct },
      averageTime: summary.average_time ?? summary.avg_time ?? (timeSpent > 0 && (scoreVal + incorrectVal) > 0 ? Math.round(timeSpent / (scoreVal + incorrectVal)) : 0),
      questions: mappedQuestions, answers: mappedAnswers
    };
  };

  const handleExamSelect = async (id: string) => {
    setSelectedExamId(id); setSelectedExamDetails(null); setIsLoadingDetails(true); setShowSolution(false);
    try {
      const userId = localStorage.getItem('user_id') || Cookies.get('user_id') || '';
      const res = await GKService.getResultGKAssessment(userId, id);
      setSelectedExamDetails(parseBackendResult(res));
    } catch (err) {
      console.error("Failed to load GK assessment details:", err);
      toast.error("Failed to load detailed report.");
      setSelectedExamId(null);
    } finally { setIsLoadingDetails(false); }
  };

  const handleBackToList = () => { setSelectedExamId(null); setSelectedExamDetails(null); setShowSolution(false); };

  const getPctStyle = (pct: number) =>
    pct >= 80 ? { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', circle: 'from-emerald-400 to-teal-500 shadow-emerald-100' }
    : pct >= 60 ? { badge: 'bg-blue-50 text-blue-700 border-blue-100', circle: 'from-indigo-500 to-blue-600 shadow-indigo-100' }
    : { badge: 'bg-rose-50 text-rose-700 border-rose-100', circle: 'from-rose-500 to-pink-600 shadow-rose-100' };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-20 select-none" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      {!selectedExamId ? (
        /* ── LIST VIEW ── */
        <>
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/40 via-white to-blue-50/30 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">GK Results</h1>
                <p className="text-slate-500 text-sm font-medium">Review your exam attempts, detailed metrics, and solutions.</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-10 mt-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-700 uppercase tracking-widest">Attempted Exams</h2>
              {!isLoading && history.length > 0 && (
                <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-xs font-black">{history.length} attempts</span>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Loading exam history...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((exam) => {
                  const style = getPctStyle(exam.percentage);
                  return (
                    <div
                      key={exam.id}
                      onClick={() => handleExamSelect(exam.id)}
                      className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">{exam.category}</span>
                        <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-indigo-600 transition-colors truncate">{exam.category}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{exam.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className={`inline-block px-4 py-1.5 text-sm font-black rounded-xl border ${style.badge}`}>
                            {exam.percentage}% Score
                          </span>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            {exam.score} / {exam.totalQuestions} Correct
                          </div>
                        </div>
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${style.circle} flex items-center justify-center text-white shadow-lg`}>
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-600 font-bold text-lg">No exam attempts logged yet</p>
                <p className="text-slate-400 text-sm mt-1">Take a GK exam to view your scorecard here.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── DETAIL VIEW ── */
        (() => {
          if (isLoadingDetails) {
            return (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-bold text-sm">Fetching detailed report...</p>
              </div>
            );
          }
          if (!selectedExamDetails) return null;
          const exam = selectedExamDetails;
          const questions = exam.questions || [];
          const answers = exam.answers || {};
          const style = getPctStyle(exam.percentage);

          const DIFF_STYLE: Record<string, string> = {
            Easy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            Medium: 'bg-amber-50 text-amber-700 border-amber-100',
            Hard: 'bg-rose-50 text-rose-700 border-rose-100',
          };

          return (
            <div className="animate-fadeIn">
              {/* Detail Header */}
              <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-white to-blue-50/20 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button onClick={handleBackToList} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm cursor-pointer shrink-0">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">{exam.category}</h1>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Attempted on {exam.date}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={`shrink-0 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all border cursor-pointer ${
                      showSolution ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-md shadow-indigo-100'
                    }`}
                  >
                    {showSolution ? <><EyeOff className="w-4 h-4" /> Hide Solutions</> : <><Eye className="w-4 h-4" /> Show Solutions</>}
                  </button>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 md:px-10 mt-8 space-y-6">

                {/* Score Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex flex-col md:flex-row items-center gap-7 justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center gap-6 z-10">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${style.circle} text-white flex flex-col items-center justify-center shadow-xl shrink-0`}>
                      <span className="text-2xl font-black">{exam.percentage}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/80 -mt-1">Accuracy</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-800 text-xl">
                        {exam.percentage >= 80 ? 'Mastery Achieved! 🎉' : exam.percentage >= 60 ? 'Passing Standard Met!' : 'Focus Required!'}
                      </h3>
                      <p className="text-slate-500 text-sm font-semibold max-w-sm leading-relaxed">
                        Scored <strong className="text-slate-800">{exam.score} of {exam.totalQuestions}</strong> correct.
                      </p>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Correct', value: `${exam.correctCount} / ${exam.totalQuestions}`, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-l-emerald-500' },
                    { label: 'Duration', value: `${Math.floor(exam.timeSpent / 60)}m ${exam.timeSpent % 60}s`, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-l-amber-500' },
                    { label: 'Avg Pace', value: `${exam.averageTime}s / Q`, icon: Zap, bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-l-purple-500' },
                    { label: 'Max Streak', value: `${exam.streak} Qs`, icon: Activity, bg: 'bg-rose-50', color: 'text-rose-600', border: 'border-l-rose-500' },
                  ].map(({ label, value, icon: Icon, bg, color, border }) => (
                    <div key={label} className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 ${border}`}>
                      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
                        <span className="text-base font-black text-slate-800">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Difficulty breakdown */}
                {/* <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-800 text-sm uppercase tracking-wide">Accuracy by Difficulty</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Easy', value: exam.accuracyByDifficulty.Easy, color: 'bg-emerald-500' },
                      { label: 'Medium', value: exam.accuracyByDifficulty.Medium, color: 'bg-amber-400' },
                      { label: 'Hard', value: exam.accuracyByDifficulty.Hard, color: 'bg-rose-500' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>{label} Modules</span>
                          <span className="text-slate-700">{value}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}

                {/* Solution Panel */}
                {showSolution && questions.length > 0 && (
                  <div className="space-y-4 pt-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-800 text-base uppercase tracking-widest">Question Explanations</h4>
                      <button
                        onClick={() => { setShowSolution(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider transition-all cursor-pointer border border-slate-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Summary
                      </button>
                    </div>

                    {questions.map((q, idx) => {
                      const ans = answers[q.id];
                      const userSel = ans ? ans.selectedOption : null;
                      const isCorrect = ans ? ans.selectedOption === q.correctAnswer : false;
                      const isSkipped = userSel === null || userSel === undefined;
                      const cardBorder = isSkipped ? 'border-l-amber-400' : isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500';

                      return (
                        <div key={q.id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 ${cardBorder} overflow-hidden`}>
                          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-700 text-sm shrink-0">{idx + 1}</span>
                              <div>
                                {q.difficulty && (
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-2 ${DIFF_STYLE[q.difficulty] || DIFF_STYLE.Medium}`}>{q.difficulty}</span>
                                )}
                                <div className="font-bold text-slate-800 text-sm leading-relaxed">
                                  <QuestionMathJax content={q.question} />
                                </div>
                              </div>
                            </div>
                            <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${
                              isSkipped ? 'bg-amber-50 border-amber-200 text-amber-700' : isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}>
                              {isSkipped ? <Info className="w-3.5 h-3.5" /> : isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-6 py-4">
                            {q.options.map((opt, oIdx) => {
                              const isCorrectOpt = oIdx === q.correctAnswer;
                              const isSelectedOpt = oIdx === userSel;
                              let optStyle = 'border-slate-100 bg-slate-50/50 text-slate-600';
                              let badgeStyle = 'bg-slate-200 text-slate-600';
                              if (isCorrectOpt) { optStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-200'; badgeStyle = 'bg-emerald-600 text-white'; }
                              else if (isSelectedOpt && !isCorrect) { optStyle = 'border-rose-300 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-200'; badgeStyle = 'bg-rose-600 text-white'; }
                              return (
                                <div key={oIdx} className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${optStyle}`}>
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${badgeStyle}`}>{String.fromCharCode(65 + oIdx)}</span>
                                  <span className="leading-snug flex-1"><QuestionMathJax content={opt} /></span>
                                  {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                                  {isSelectedOpt && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                                </div>
                              );
                            })}
                          </div>

                          <div className="mx-6 mb-5 p-4 rounded-xl bg-blue-50/40 border border-blue-100/60">
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block mb-1.5">💡 Explanation</span>
                            <div className="text-slate-600 text-sm leading-relaxed font-medium">
                              <QuestionMathJax content={q.explanation} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
