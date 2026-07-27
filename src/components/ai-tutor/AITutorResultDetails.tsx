import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  MessageSquare, 
  BookOpen, 
  Target, 
  Zap,
  TrendingUp,
  Brain,
  Lightbulb,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  History,
  FileText
} from 'lucide-react';
import { AITutorService } from '../../services/AITutorService';
import { toast } from 'react-hot-toast';
import QuestionMathJax, { latexToText } from '../../shared/mathjaxconfig/QuestionMathJax';

const formatDuration = (time: any) => {
  if (!time || time === 'N/A') return 'N/A';
  
  let h = 0, m = 0, s = 0;

  if (typeof time === 'string' && time.includes(':')) {
    const parts = time.split(':').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      [h, m, s] = parts;
    } else if (parts.length === 2) {
      [m, s] = parts;
    }
  } else {
    const totalSeconds = parseInt(time, 10);
    if (!isNaN(totalSeconds)) {
      h = Math.floor(totalSeconds / 3600);
      m = Math.floor((totalSeconds % 3600) / 60);
      s = totalSeconds % 60;
    } else {
      return time;
    }
  }
  
  const hStr = h > 0 ? `${h.toString().padStart(2, '0')} hr ` : '';
  const mStr = `${m.toString().padStart(2, '0')} min `;
  const sStr = `${s.toString().padStart(2, '0')} sec`;
  
  return `${hStr}${mStr}${sStr}`.trim();
};

interface ResultDetailsProps {
  sessionId: string | number;
  onBack: () => void;
  onGoToDashboard: () => void;
}

export default function AITutorResultDetails({ sessionId, onBack, onGoToDashboard }: ResultDetailsProps) {
  const { state: userState } = useContext(UserContext) || { state: {} };
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'critique' | 'reference'>('overview');
  const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const toggleSubtopic = (subtopicId: string) => {
    setExpandedSubtopics(prev => ({
      ...prev,
      [subtopicId]: prev[subtopicId] === undefined ? false : !prev[subtopicId]
    }));
  };

  const toggleHistory = (subtopicId: string) => {
    setExpandedHistory(prev => ({
      ...prev,
      [subtopicId]: !prev[subtopicId]
    }));
  };

  useEffect(() => {
    const userIdVal = localStorage.getItem('user_id') || userState?.user_id;
    const userId = userIdVal ? parseInt(String(userIdVal), 10) : 0;
    if (sessionId && userId) {
      fetchResult(userId);
    } else {
      setLoading(false);
      if (!userId) toast.error("User ID not found");
    }
  }, [sessionId, userState?.user_id]);

  const fetchResult = async (userId: string | number) => {
    setLoading(true);
    try {
      const data = await AITutorService.getAITutorResult(sessionId);
      setResult(data);
    } catch (error) {
      toast.error("Failed to load result details");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-bold">Fetching your results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl m-8">
         <XCircle className="w-16 h-16 text-red-100 mx-auto mb-4" />
         <h2 className="text-2xl font-black text-slate-800 mb-2">Result not found</h2>
         <p className="text-slate-400 mb-6">We couldn't retrieve the details for this session.</p>
         <button onClick={onBack} className="px-6 py-2 bg-indigo-600 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  const checkOptionMatch = (target: string | undefined | null, optionText: string, idx: number) => {
    if (!target) return false;
    const t = String(target).trim().toLowerCase();
    const opt = String(optionText).trim().toLowerCase();
    const letter = ['a', 'b', 'c', 'd'][idx] || '';

    if (t === letter) return true;
    if (t === opt) return true;

    if (letter && (opt.startsWith(letter + '.') || opt.startsWith(letter + ')') || opt.startsWith(letter + ':'))) {
      const optBody = opt.slice(2).trim();
      if (t === optBody) return true;
    }

    if (letter && (t.startsWith(letter + '.') || t.startsWith(letter + ')') || t.startsWith(letter + ':'))) {
      const tBody = t.slice(2).trim();
      if (tBody === opt || t === opt) return true;
    }

    return false;
  };

  const renderQuestionCard = (q: any, index: number) => {
    const qType = q.type || (q.question_id ? `Question #${q.question_id}` : 'Question');
    const isMCQ = qType === 'MCQ';
    const isTF = qType === 'TF' || qType === 'True/False';
    const isShortAnswer = qType === 'Short Answer' || qType === 'audio';

    const typeLabel = 
      qType === 'intro_explanation' ? 'Intro Explanation' :
      isMCQ ? 'Multiple Choice' :
      isTF ? 'True / False' :
      isShortAnswer ? 'Short Answer (Speech)' :
      qType;

    const qText = q.question_text || q.question_transcribe || q.question_transcib || q.question;
    const userAnswer = q.user_answer || q.user_transcription || q.user_speech;
    const feedbackText = q.feedback || q.ai_feedback || q.critique;
    const correctAnswer = q.correct_answer || q.reference_answer || q.explanation;
    const optionsList: string[] = isMCQ ? (Array.isArray(q.options) && q.options.length > 0 ? q.options : []) : isTF ? ['True', 'False'] : [];

    return (
      <div key={q.question_id || index} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 shadow-2xs">
        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {index + 1}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              {typeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {q.is_correct === true && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct
              </span>
            )}
            {q.is_correct === false && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect
              </span>
            )}
            {q.marks_obtained !== undefined && (
              <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {q.marks_obtained}{q.total_marks ? `/${q.total_marks}` : ''} marks
              </span>
            )}
            {q.accuracy !== undefined && (
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {q.accuracy}%
              </span>
            )}
          </div>
        </div>

        {/* Question Prompt */}
        {qText && (
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Question Prompt</span>
            <p className="text-xs md:text-sm font-bold text-slate-800 leading-relaxed">
              {latexToText(qText)}
            </p>
          </div>
        )}

        {/* MCQ & True/False Options Rendering */}
        {(isMCQ || isTF) && optionsList.length > 0 && (
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">Options & Selection</span>
            <div className={`grid ${isTF ? 'grid-cols-2 max-w-xs' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5`}>
              {optionsList.map((opt, optIdx) => {
                const isUserSel = checkOptionMatch(userAnswer, opt, optIdx);
                const isCorrectOpt = checkOptionMatch(correctAnswer, opt, optIdx);

                let cardStyle = "bg-slate-50/80 border-slate-200/80 text-slate-700";
                let badgeNode = null;

                if (isUserSel && isCorrectOpt) {
                  cardStyle = "bg-emerald-50/90 border-emerald-300 text-emerald-900 font-bold shadow-2xs";
                  badgeNode = (
                    <span className="text-[10px] font-black bg-emerald-600 text-white p-1 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  );
                } else if (isUserSel && !isCorrectOpt) {
                  cardStyle = "bg-rose-50/90 border-rose-300 text-rose-900 font-bold shadow-2xs";
                  badgeNode = (
                    <span className="text-[10px] font-black bg-rose-600 text-white p-1 rounded-full flex items-center justify-center shrink-0">
                      <XCircle className="w-3.5 h-3.5" />
                    </span>
                  );
                } else if (!isUserSel && isCorrectOpt) {
                  cardStyle = "bg-emerald-50/90 border-emerald-300 text-emerald-900 font-bold shadow-2xs";
                  badgeNode = (
                    <span className="text-[10px] font-black bg-emerald-600 text-white p-1 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  );
                }

                return (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs leading-relaxed transition-all ${cardStyle}`}
                  >
                    <span className="font-semibold">{latexToText(opt)}</span>
                    {badgeNode}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Short Answer / Speech Cards */}
        {isShortAnswer && (
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              {/* User Spoken Transcription */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> User Spoken Answer / Transcription
                </span>
                <p className="text-xs text-slate-800 font-semibold italic leading-relaxed bg-white p-3 rounded-lg border border-slate-150">
                  {userAnswer ? `"${userAnswer}"` : <span className="text-slate-400 italic font-normal">No audio transcription recorded</span>}
                </p>
              </div>

              {/* Model / Actual Answer */}
              {correctAnswer && (
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-150">
                  <span className="text-[9px] font-bold text-emerald-700 block uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Model / Actual Answer
                  </span>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                    {latexToText(correctAnswer)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Intro Explanation / Generic User Answer (when not MCQ, TF, or Short Answer) */}
        {!isMCQ && !isTF && !isShortAnswer && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">User Answer</span>
            <p className="text-xs text-slate-700 font-semibold italic leading-relaxed">
              {userAnswer ? `"${userAnswer}"` : <span className="text-slate-400 italic font-normal">No answer provided</span>}
            </p>
          </div>
        )}

        {/* AI Feedback / Critique Card */}
        {feedbackText && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 space-y-1">
            <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI Feedback & Critique
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              {feedbackText}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (result && result.subtopic_stats) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 bg-slate-50/30 min-h-screen">
        {/* Back to reports & Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-50/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-extrabold text-[10px] tracking-widest uppercase transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> BACK TO REPORTS
            </button>
            
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6" />
               </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                    {result.topic_name || result.session_name || 'AI Tutor Session Report'}
                  </h1>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    Conceptual Learning & Assessment
                  </p>
                </div>
            </div>
          </div>

          <div className="relative z-10 self-stretch sm:self-auto flex items-center">
             <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-center gap-6 w-full sm:w-auto">
               <div className="flex-1 sm:flex-initial">
                 <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Marks Score</span>
                 <span className="text-2xl font-black text-slate-800 leading-none block mt-1">
                   {result.total_marks_obtained !== undefined ? `${result.total_marks_obtained}/${result.total_marks_possible}` : '0'}
                 </span>
               </div>
               <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
               <div className="flex-1 sm:flex-initial">
                 <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Overall Accuracy</span>
                 <span className="text-2xl font-black text-indigo-600 block leading-none mt-1">
                   {result.overall_accuracy !== undefined ? `${parseFloat(String(result.overall_accuracy)).toFixed(1)}%` : '0%'}
                 </span>
               </div>
             </div>
          </div>
        </div>

        {/* List of subtopics stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800">
                Subtopic performance analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-bold mb-8">
              A comprehensive breakdown of your progress, scores, and evaluation feedback across the concepts covered.
            </p>

            <div className="space-y-5">
              {(result.subtopic_stats || []).map((subtopic: any, index: number) => {
                const subtopicAcc = subtopic.accuracy !== undefined ? parseFloat(String(subtopic.accuracy)) : 0;
                const subtopicName = subtopic.subtopic_name || `Subtopic ${subtopic.subtopic_id}`;
                const subtopicQuestions = subtopic.subtopic_questions || [];
                const historyList = subtopic.history || [];
                const isExpanded = !!expandedSubtopics[subtopic.subtopic_id]; // Default collapsed (hidden)
                const isHistoryOpen = !!expandedHistory[subtopic.subtopic_id];

                // Color mapping for accuracy
                let barColor = 'bg-indigo-600';
                let textColor = 'text-indigo-600 font-bold';
                let bgColor = 'bg-slate-50/50 hover:bg-slate-50/80';
                let progressBg = 'bg-indigo-100/50';

                if (subtopicAcc >= 75) {
                  barColor = 'bg-emerald-500';
                  textColor = 'text-emerald-600 font-bold';
                  bgColor = 'bg-emerald-50/10 hover:bg-emerald-50/20';
                  progressBg = 'bg-emerald-100';
                } else if (subtopicAcc >= 40) {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-600 font-bold';
                  bgColor = 'bg-amber-50/10 hover:bg-amber-50/20';
                  progressBg = 'bg-amber-100';
                } else if (subtopic.questions_answered > 0) {
                  barColor = 'bg-rose-500';
                  textColor = 'text-rose-600 font-bold';
                  bgColor = 'bg-rose-50/10 hover:bg-rose-50/20';
                  progressBg = 'bg-rose-100';
                }

                const statusColor = 
                  subtopic.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  subtopic.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  subtopic.status === 'skipped' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                  'bg-slate-50 text-slate-500 border-slate-200';

                return (
                  <div 
                    key={subtopic.subtopic_id || index}
                    className={`rounded-3xl border border-slate-200 p-6 ${bgColor} transition-all duration-300 space-y-5`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-indigo-100">
                          {index + 1}
                        </div> */}
                        <div>
                          <h3 className="text-base font-black text-slate-800 leading-snug">
                            {subtopicName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-500 font-bold">
                            <span>Questions Answered: <span className="text-slate-800">{subtopic.questions_answered}</span></span>
                            <span className="text-slate-300">•</span>
                            <span>Score: <span className="text-slate-800">{subtopic.marks_obtained}/{subtopic.total_marks}</span></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 self-start md:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Accuracy</span>
                          <span className={`text-base font-black ${textColor}`}>
                            {subtopicAcc.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <span className={`text-[10px] font-extrabold px-3.5 py-1.5 rounded-xl border ${statusColor} uppercase tracking-wider`}>
                          {subtopic.status || 'pending'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {subtopic.questions_answered > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          <span>Subtopic accuracy</span>
                          <span>{subtopicAcc.toFixed(1)}%</span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${progressBg} overflow-hidden`}>
                          <div 
                            className={`h-full ${barColor} rounded-full transition-all duration-500`} 
                            style={{ width: `${Math.min(100, Math.max(0, subtopicAcc))}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Attempted Questions List */}
                    {subtopicQuestions.length > 0 && (
                      <div className="pt-4 border-t border-slate-200/50 space-y-4">
                        <button
                          onClick={() => toggleSubtopic(subtopic.subtopic_id)}
                          className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="block font-black text-slate-800 group-hover:text-indigo-950 text-xs">
                                {isExpanded ? "Attempted Questions" : "View Attempted Questions"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                {subtopicQuestions.length} {subtopicQuestions.length === 1 ? 'question recorded' : 'questions recorded'} • Click to {isExpanded ? "hide" : "expand"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50/50 px-3.5 py-2 rounded-xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                            <span>{isExpanded ? "Collapse" : "Expand"}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="space-y-4 pt-2">
                            {subtopicQuestions.map((q: any, qIdx: number) => renderQuestionCard(q, qIdx))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Previous Attempt History Section */}
                    {historyList.length > 0 && (
                      <div className="pt-4 border-t border-slate-200/50 space-y-4">
                        <button
                          onClick={() => toggleHistory(subtopic.subtopic_id)}
                          className="w-full flex items-center justify-between p-3.5 bg-indigo-50/10 hover:bg-indigo-50/30 border border-indigo-100 hover:border-indigo-200 rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <History className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <span className="block font-black text-indigo-950 text-xs">
                                Previous Attempt History
                              </span>
                              <span className="text-[10px] text-indigo-400 font-bold block mt-0.5">
                                {historyList.length} {historyList.length === 1 ? 'previous attempt set' : 'previous attempt sets'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-white px-3.5 py-2 rounded-xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <span>{isHistoryOpen ? "Collapse" : "View Sets"}</span>
                            {isHistoryOpen ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </button>

                        {isHistoryOpen && (
                          <div className="space-y-4 pt-2 pl-3 border-l-2 border-indigo-150">
                            {historyList.map((hItem: any, hIdx: number) => {
                              const hQuestions = hItem.subtopic_questions || hItem.questions || [];
                              return (
                                <div key={hIdx} className="bg-indigo-50/10 rounded-3xl p-5 border border-indigo-100 space-y-4">
                                  <div className="flex items-center justify-between border-b border-indigo-100/50 pb-3">
                                    <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5 uppercase tracking-wide">
                                      <History className="w-3.5 h-3.5 text-indigo-500" /> Attempt Set #{hIdx + 1}
                                    </span>
                                    {hItem.accuracy !== undefined && (
                                      <span className="text-[10px] font-black text-indigo-700 bg-white px-3 py-1 rounded-xl border border-indigo-100 uppercase tracking-wider">
                                        Accuracy: {hItem.accuracy}%
                                      </span>
                                    )}
                                  </div>

                                  {hQuestions.length > 0 ? (
                                    <div className="space-y-4">
                                      {hQuestions.map((hq: any, hqIdx: number) => renderQuestionCard(hq, hqIdx))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-indigo-400 italic">No question details available for this history set.</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Return to Dashboard Button */}
        <div className="flex justify-center pt-10">
           <button 
             onClick={onGoToDashboard} 
             className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-750 hover:to-teal-750 text-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.99] flex items-center gap-2 shadow-lg shadow-indigo-100"
           >
              <span>BACK TO DASHBOARD</span> 
              <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    );
  }

  if (Array.isArray(result)) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20 bg-slate-50/30 min-h-screen">
        {/* Back to reports & Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-50/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-extrabold text-[10px] tracking-widest uppercase transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> BACK TO REPORTS
            </button>
            
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-650 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Brain className="w-7 h-7" />
               </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                    AI Tutor Assessment Report
                  </h1>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    Multi-Topic Assessment Summary
                  </p>
                </div>
            </div>
          </div>
        </div>

        {/* List of subtopic sessions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800">
                Attempted Subtopics
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-bold mb-8">
              The following subtopics were covered and assessed by the AI Tutor during this session:
            </p>

            <div className="space-y-4">
              {result.map((session: any, index: number) => {
                const cleanName = session.session_name ? session.session_name.replace(/\s*Session\s*$/i, '') : 'Unknown Topic';
                return (
                  <div 
                    key={session.session_id || index}
                    className="bg-slate-50/50 hover:bg-slate-50 border border-slate-150 p-6 rounded-3xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800 leading-snug">
                            {cleanName}
                          </h3>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-black px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 self-start sm:self-auto uppercase tracking-wider">
                        Attempted
                      </span>
                    </div>

                    {/* Future placeholder for question/answer & feedbacks */}
                    <div className="mt-5 pt-4 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                        <span>Curriculum Insights</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold italic bg-white border border-slate-100 rounded-2xl p-4">
                        "In a future update, you will be able to expand this section to view the specific questions asked, your responses, and the AI Tutor's direct feedback for this subtopic."
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Return to Dashboard Button */}
        <div className="flex justify-center pt-10">
           <button 
             onClick={onGoToDashboard} 
             className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-750 hover:to-teal-750 text-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.99] flex items-center gap-2 shadow-lg shadow-indigo-100"
           >
              <span>BACK TO DASHBOARD</span> 
              <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20 bg-slate-50/30 min-h-screen">
      
      {/* Back to reports & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-50/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-extrabold text-[10px] tracking-widest uppercase transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> BACK TO REPORTS
          </button>
          
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-650 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                <Brain className="w-7 h-7" />
             </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  {result.session?.assessment_name || 'AI Tutor Session Report'}
                </h1>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                  Date: {result.session?.started_at ? new Date(result.session.started_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </p>
              </div>
          </div>
        </div>

        <div className="relative z-10 self-stretch sm:self-auto flex items-center">
           <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-center gap-6 w-full sm:w-auto">
             <div className="flex-1 sm:flex-initial">
               <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Score</span>
               <span className="text-2xl font-black text-slate-800 leading-none block mt-1">{result.session?.total_score || '0'}</span>
             </div>
             <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
             <div className="flex-1 sm:flex-initial">
               <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Accuracy</span>
               <span className="text-2xl font-black text-indigo-600 block leading-none mt-1">{result.session?.percentage || '0'}%</span>
             </div>
           </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs gap-1.5">
        {[
          { id: 'overview', label: 'Overview & Insight' },
          { id: 'critique', label: 'Detailed Critique' },
          { id: 'reference', label: 'Reference Concepts' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Qs', value: result.session?.total_questions || '0', icon: HelpCircle, bg: 'bg-indigo-50 text-indigo-600' },
                { label: 'Attempted', value: result.session?.attempted_count || '0', icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600' },
                { label: 'Skipped', value: result.session?.skip_count || '0', icon: XCircle, bg: 'bg-rose-50 text-rose-600' },
                { label: 'Time Spent', value: formatDuration(result.session?.total_time), icon: Clock, bg: 'bg-blue-50 text-blue-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center hover:scale-[1.01] transition-transform duration-200">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3.5 ${stat.bg}`}>
                    <stat.icon className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">{stat.label}</span>
                  <span className="text-base font-black text-slate-800 mt-1 block">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Strategic Insight Box */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-teal-50/10 rounded-3xl p-6 border border-indigo-100 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-650 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-100 mt-0.5">
                  <Award className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    Strategic AI Feedback <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-semibold italic">
                    "{result.session?.overall_feedback || "No feedback compiled for this session yet."}"
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Detailed Critique */}
        {activeTab === 'critique' && (
          <div className="space-y-6">
            {((result.answers && Array.isArray(result.answers)) ? result.answers : []).map((q: any, i: number) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4 hover:border-indigo-300 transition-colors duration-200">
                
                {/* Question Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {q.questionno || i+1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">
                        {q.question_transcib ? q.question_transcib : latexToText(q.question || 'Missing question text')}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold mt-1.5 block">Time Taken: {q.time_taken || '0'} seconds</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-xl border uppercase tracking-wider ${
                      q.status === 'SKIPPED' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      (q.ai_score) >= 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {q.status === 'SKIPPED' ? 'SKIPPED' : (q.ai_score) >= 5 ? 'CLEAR' : 'NEEDS FOCUS'}
                    </span>
                    <span className="text-sm font-black text-slate-800">{q.ai_score || 0}/10 score</span>
                  </div>
                </div>

                {/* Sub-Layout Side by Side Responses */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {/* Your Answer Card */}
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest mb-2">Your Explanation</span>
                    <p className="text-xs text-slate-700 italic leading-relaxed font-semibold">
                      "{q.user_transcription || 'No answer transcription captured'}"
                    </p>
                  </div>

                  {/* AI Tutor Feedback Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-600">
                    <span className="text-[9px] font-black text-indigo-500 block uppercase tracking-widest mb-2">AI Critique</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {q.ai_feedback || "No specific critique recorded."}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Reference Concepts */}
        {activeTab === 'reference' && (
          <div className="space-y-6">
            {((result.answers && Array.isArray(result.answers)) ? result.answers : []).map((q: any, i: number) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {q.questionno || i+1}
                  </span>
                  <div>
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question</h4>
                    <p className="text-sm font-bold text-slate-800 leading-snug mt-1">
                      {q.question_transcib ? q.question_transcib : latexToText(q.question || 'Missing question text')}
                    </p>
                  </div>
                </div>

                {/* Ideal / Reference Explanation */}
                <div className="bg-teal-50/20 p-5 rounded-2xl border border-teal-100/30 mt-2">
                  <h5 className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Core Reference Concept
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {q.reference_answer_transcribe ? (
                      q.reference_answer_transcribe
                    ) : (
                      latexToText(q.reference_answer || 'No reference answer was provided by the curriculum')
                    )}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
      
      {/* Return to Dashboard Button */}
      <div className="flex justify-center pt-10">
         <button 
           onClick={onGoToDashboard} 
           className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-750 hover:to-teal-750 text-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.99] flex items-center gap-2 shadow-lg shadow-indigo-100"
         >
            <span>BACK TO DASHBOARD</span> 
            <ArrowRight className="w-4 h-4" />
         </button>
      </div>

    </div>
  );
}
