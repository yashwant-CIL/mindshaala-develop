import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, XCircle, 
  ChevronRight, BookOpen, Clock, Award,
  Loader2, AlertCircle, Sparkles, MessageSquare,
  HelpCircle, BarChart3, Target, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SolutionService, AssessmentSolution } from '../../../services/SolutionService';
import { QuestionMathJax } from '../../../shared/mathjaxconfig/QuestionMathJax';
import { MathJaxContext } from 'better-react-mathjax';
import { QuestionMathJaxConfig } from '../../../shared/mathjaxconfig/QuestionMathJax';
import { getDeterministicShuffle } from '../../../shared/utils/ShuffleUtils';
import { Badge } from '../../../components/ui/badge'; 

const sanitizeLatex = (val: string | null | undefined): string => {
    if (!val) return "";
    return val
        .replace(/\\\\n/g, "\n")
        .replace(/\\\\r/g, "\r")
        .replace(/\\\\t/g, "\t")
        .replace(/\\\\\\/g, "\\")
        .trim();
};

const HeaderMetric = ({ icon: Icon, label, value, total, color }: any) => {
  const theme: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-50 text-slate-500',
  };

  return (
    <div className={`flex items-center gap-4 py-3 px-5 rounded-2xl border border-slate-100 ${theme[color]}`}>
      <div className="p-2 border border-current rounded-xl opacity-80 backdrop-blur-sm">
        <Icon className="w-5 h-5 flex-shrink-0" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight mb-0.5">{label}</p>
        <p className="text-xl font-extrabold leading-none tracking-tight tabular-nums">
          {value}{total ? <span className="opacity-50 text-sm">/{total}</span> : ''}
        </p>
      </div>
    </div>
  );
};

export default function TheorySolutionScreen() {
  const { userAssId } = useParams<{ userAssId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  const decodedAssId = userAssId ? (isNaN(Number(userAssId)) ? atob(userAssId) : userAssId) : null;

  const fetchSolutions = useCallback(async () => {
    if (!decodedAssId) {
      setError("No assessment ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await SolutionService.getTheorySolutions(decodedAssId);
      
      if (!response) {
        throw new Error("No data received from service");
      }

      const allQuestions = (response.section_details || []).flatMap((s: any) => s.solution_details || []);
      const totalQs = allQuestions.length;
      
      const correctQs = allQuestions.filter((q: any) => q.answer_remark?.toUpperCase() === 'CORRECT' || (q.user_answer && (q.user_answer === q.correct_option || q.user_answer === q.answer_latex || q.user_answer === q.answer_description))).length;
      const skippedQs = allQuestions.filter((q: any) => !q.user_answer && !q.user_answer_image).length;
      const incorrectQs = totalQs - correctQs - skippedQs;
      const accuracy = totalQs > 0 ? Math.round((correctQs / (totalQs - skippedQs)) * 100) : 0;

      const mappedData = {
        assessment_name: response.assessment_name || "Assessment Solution",
        sections: (response.section_details || []).slice().sort((a: any, b: any) => (a.section_number ?? 0) - (b.section_number ?? 0)).map((section: any) => ({
          id: section.section_id || Math.random(),
          name: section.section_heading || "Untitled Section",
          questions: (section.solution_details || []).map((q: any) => ({
            id: q.question_id,
            que: sanitizeLatex(q.question_latex),
            question_type_name: q.question_type_name?.toLowerCase().trim() || "",
            que_diag: (q.question_diagrams_url || []).filter((url: string) => url && url.length > 0),
            options: (q.question_type_name?.toLowerCase().includes("true or false")) ? ["True", "False"] : [
              q.option1_latex,
              q.option2_latex,
              q.option3_latex,
              q.option4_latex,
              q.option5_latex
            ].filter(opt => opt !== undefined && opt !== null),
            options_diag: [
              q.option1_img,
              q.option2_img,
              q.option3_img,
              q.option4_img,
            ],
            user_answer: q.user_answer,
            user_answer_image: q.user_answer_image,
            answer_remark: q.answer_remark,
            correct_option: q.answer_latex || q.correct_option,
            answer_description: q.answer_description,
            marks: q.total_marks,
            obtained_marks: q.obtained_marks,
            attempt_status: q.attempt_status,
            similarity_score: q.similarity_score,
            feedback: q.feedback
          }))
        })),
        total_marks: response.total_marks || allQuestions.reduce((acc: number, q: any) => acc + (parseFloat(q.total_marks) || 0), 0),
        obtained_marks: response.obtained_marks || allQuestions.reduce((acc: number, q: any) => acc + (parseFloat(q.obtained_marks) || 0), 0),
        correct_count: response.correct_count ?? correctQs,
        incorrect_count: response.incorrect_count ?? incorrectQs,
        unattempted_count: response.unattempted_count ?? skippedQs,
        accuracy: response.accuracy ?? accuracy,
      };

      setAssessmentData(mappedData);
    } catch (err: any) {
      console.error("Error fetching solutions:", err);
      setError(err.message || "Failed to load solutions.");
    } finally {
      setLoading(false);
    }
  }, [decodedAssId]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Generating detailed report...</p>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-500 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 shadow-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  const renderMatchGroupUI = (group: any[], startIdx: number) => {
    const groupId = group[0].id;
    const seed = `${decodedAssId}-${groupId}`;
    const original = group.map(q => q.answer_description || "N/A");
    const shuffled = getDeterministicShuffle(original, seed);
    const totalMarks = group.reduce((acc, q) => acc + (parseFloat(q.marks) || 0), 0);

    return (
      <div key={`match-group-${groupId}`} className="mb-12 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm transition-all hover:shadow-xl group/match mt-8">
        <div className="mb-8 flex justify-between items-end border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                  {startIdx + 1}-{startIdx + group.length}
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">Match the Following</h3>
              <Badge variant="outline" className="rounded-lg border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-50/50">
                  {totalMarks} Marks Group
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium ml-14">Review your evaluated match associations</p>
          </div>
        </div>

        {/* Shuffled Reference Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
           <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-6">Column I</h4>
               {group.map((q, idx) => (
                   <div key={`left-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                       <span className="bg-slate-900 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{startIdx + idx + 1}</span>
                       <div className="text-sm font-medium leading-relaxed text-slate-700 break-words w-full">{q.que}</div>
                   </div>
               ))}
           </div>
           <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-6">Column A</h4>
               {shuffled.map((ans, idx) => (
                   <div key={`right-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                       <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{String.fromCharCode(65 + idx)}</span>
                       <div className="text-sm font-medium leading-relaxed text-slate-700 break-words w-full">{ans}</div>
                   </div>
               ))}
           </div>
        </div>

        {/* Mapping Display */}
        <div className="space-y-4 px-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detailed Evaluation Matrix</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.map((q, idx) => {
               // The user_answer is evaluated text. e.g "Aluminium"
               let isCorrect = false;
               if (q.answer_remark?.toUpperCase() === 'CORRECT') isCorrect = true;
               if (q.user_answer && typeof q.user_answer === 'string' && typeof q.answer_description === 'string') {
                   // Compare trimmed to avoid minor whitespace issues
                   if (q.user_answer.trim() === q.answer_description.trim()) isCorrect = true;
               }

               const userIndex = q.user_answer ? shuffled.indexOf(q.user_answer) : -1;
               const correctIndex = q.answer_description ? shuffled.indexOf(q.answer_description) : -1;

               const userLetter = userIndex !== -1 ? String.fromCharCode(65 + userIndex) : "-";
               const correctLetter = correctIndex !== -1 ? String.fromCharCode(65 + correctIndex) : "-";

               return (
                   <div key={`map-eval-${q.id}`} className={`p-4 rounded-xl border-2 flex flex-col gap-3 relative overflow-hidden ${isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                       <div className="flex justify-between items-center z-10">
                           <span className="font-black text-slate-500 text-xs">Row {startIdx + idx + 1}</span>
                           {isCorrect ? <CheckCircle2 className="text-emerald-500 w-5 h-5"/> : <XCircle className="text-rose-500 w-5 h-5"/>}
                       </div>
                       <div className="flex items-center gap-3 mt-1 z-10">
                           <div className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border ${isCorrect ? 'bg-emerald-100/50 border-emerald-200' : 'bg-rose-100/50 border-rose-200'}`}>
                               <span className="uppercase tracking-widest text-[8px] font-bold opacity-60 mb-0.5">Your Match</span>
                               <span className={`text-base font-black ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{userLetter}</span>
                           </div>
                           <div className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border bg-emerald-100/50 border-emerald-200">
                               <span className="uppercase tracking-widest text-[8px] font-bold text-emerald-900/60 mb-0.5">Correct</span>
                               <span className="text-base font-black text-emerald-700">{correctLetter}</span>
                           </div>
                       </div>
                   </div>
               );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStandardQuestionUI = (question: any, idx: number) => {
    const qType = question.question_type_name || "";
    const isMcqLike = qType === "theory mcq 1 marks" || qType === "assertion&reasoning" || qType.includes("true or false");

    // Handle string matching properly for letters vs actual contents
    const normalizeCheck = (val: string) => (val || "").trim().toLowerCase();

    return (
        <div key={question.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all duration-300 relative group animate-in slide-in-from-bottom-4 mt-8">
            {/* Question Header Area */}
            <div className="bg-slate-50/50 p-4 md:p-8 border-b border-slate-100">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-lg shadow-indigo-200 shrink-0">
                    {idx + 1}
                </span>
                  <div className="text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                {question.que}
            </div>
                {/* <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-full bg-indigo-50">
                    {question.question_type_name || "Theory Question"}
                </span> */}
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                <div className="bg-white border border-slate-200 text-slate-600 font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-wider h-fit shadow-sm">
                    {question.obtained_marks !== undefined ? `${question.obtained_marks} / ` : ''}{question.marks} {question.marks > 1 ? "Marks" : "Mark"}
                </div>
                {question.answer_remark && (
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    question.answer_remark.toUpperCase() === 'CORRECT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                    {question.answer_remark}
                    </div>
                )}
                </div>
            </div>

            {/* <div className="text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                {question.que}
            </div> */}

            {question.que_diag && question.que_diag.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-4">
                {question.que_diag.map((diag: string, i: number) => (
                    <img 
                    key={i} 
                    src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${diag.trim()}`} 
                    alt="Question Diagram" 
                    className="max-h-60 rounded-xl border border-slate-200 shadow-sm"
                    />
                ))}
                </div>
            )}
            </div>

            {/* MCQ Options UI for relevant Theory Types */}
            {isMcqLike && question.options && question.options.length > 0 && (
            <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt: string, optIdx: number) => {
                    const optLetter = String.fromCharCode(65 + optIdx).toLowerCase();
                    
                    const userVal = normalizeCheck(question.user_answer);
                    const isUserAnswer = userVal === optLetter || userVal === normalizeCheck(opt);
                    
                    const correctVal1 = normalizeCheck(question.correct_option);
                    const correctVal2 = normalizeCheck(question.answer_description);
                    const isCorrectAnswer = correctVal1 === optLetter || correctVal1 === normalizeCheck(opt) || correctVal2 === optLetter || correctVal2 === normalizeCheck(opt);
                    
                    let optionClass = "bg-slate-50 border-slate-100 text-slate-700";
                    let icon = null;

                    if (isCorrectAnswer && isUserAnswer) {
                        optionClass = "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-md ring-2 ring-emerald-500/20";
                        icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
                    } else if (isCorrectAnswer && !isUserAnswer) {
                        optionClass = "bg-emerald-50 border-emerald-200 text-emerald-900 border-dashed";
                        icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 opacity-50" />;
                    } else if (!isCorrectAnswer && isUserAnswer) {
                        optionClass = "bg-rose-50 border-rose-200 text-rose-900 shadow-md ring-2 ring-rose-500/20";
                        icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
                    }

                    return (
                        <div key={optIdx} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${optionClass}`}>
                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${
                                isUserAnswer ? (isCorrectAnswer ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "bg-white border border-slate-200 text-slate-500"
                            }`}>
                                {String.fromCharCode(65 + optIdx)}
                            </div>
                            <div className="flex-1 font-medium">{opt}</div>
                            {icon}
                        </div>
                    );
                })}
                </div>
            </div>
            )}

            {/* Side by Side Evaluation Area */}
            <div className="p-6 md:p-8 bg-slate-50/30 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Your Answer */}
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-slate-500 bg-white w-fit px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <MessageSquare className="w-3.5 h-3.5" />
                Your Evaluation
                </h4>
                
                <div className={`bg-white rounded-2xl p-6 min-h-[150px] border shadow-sm ${question.user_answer || question.user_answer_image ? 'border-indigo-100 hover:border-indigo-300' : 'border-slate-200'} transition-colors`}>
                {!question.user_answer && !question.user_answer_image ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 mt-4">
                        <XCircle className="w-8 h-8 opacity-20" />
                        <span className="font-bold text-sm uppercase tracking-wide">Not Attempted</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                    {question.user_answer && (
                        <div className="text-slate-700 font-medium whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                        {question.user_answer}
                        </div>
                    )}
                    {question.user_answer_image && (
                        <div className="flex flex-wrap gap-4">
                        {question.user_answer_image.split(',').map((imgUrl: string, idx: number) => (
                            <a href={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${imgUrl.trim()}`} target="_blank" rel="noreferrer" key={idx}>
                            <img 
                                src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${imgUrl.trim()}`} 
                                className="h-40 rounded-xl shadow-md border-[3px] border-white ring-1 ring-slate-200 object-cover cursor-zoom-in hover:ring-indigo-400 transition-all"
                                alt="User Upload"
                            />
                            </a>
                        ))}
                        </div>
                    )}
                    </div>
                )}
                </div>
            </div>

            {/* Actual Answer */}
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Model Rubric Correct Answer
                </h4>
                <div className="bg-emerald-50/50 rounded-2xl p-6 min-h-[150px] border border-emerald-100/60 shadow-sm flex flex-col justify-between">
                    {!question.answer_description && !question.correct_option ? (
                    <div className="text-slate-500 italic font-medium mt-4">No rubric provided by the examiner.</div>
                    ) : (
                    <div className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed text-[15px] [&_img]:max-w-full [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:border [&_img]:border-slate-200 break-words">
                      {question.answer_description || question.correct_option}
                    </div>
                    )}
                </div>
            </div>

            </div>

            {/* AI Feedback & Similarity Score Area */}
            {(question.feedback || (question.similarity_score !== null && question.similarity_score !== undefined)) && (
                <div className="p-6 md:p-8 bg-white border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h4 className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-indigo-600 bg-indigo-50 w-fit px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Feedback
                        </h4>
                        {question.similarity_score !== null && question.similarity_score !== undefined && (
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                                question.similarity_score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                question.similarity_score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                                <TrendingUp className="w-3.5 h-3.5" />
                                Similarity Score: {question.similarity_score}%
                            </div>
                        )}
                    </div>
                    {question.feedback && (
                        <div className="bg-indigo-50/30 rounded-2xl p-6 border border-indigo-100/50 text-slate-700 font-medium whitespace-pre-wrap leading-relaxed text-[15px] mt-4">
                            <QuestionMathJax content={question.feedback} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
  };


  return (
      <div className="min-h-screen bg-slate-50/50 pb-24 font-outfit">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="mx-auto px-4 md:px-8 h-auto py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 transition-all hover:scale-105 shrink-0 shadow-sm"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight line-clamp-1 leading-none">
                  {assessmentData.assessment_name}
                </h1>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Theory Evaluation Analytics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-center">
              <HeaderMetric 
                icon={Target} 
                label="Score" 
                value={assessmentData.obtained_marks ?? 0} 
                total={assessmentData.total_marks}
                color="blue"
              />
              <HeaderMetric 
                icon={BarChart3} 
                label="Accuracy" 
                value={`${assessmentData.accuracy ?? 0}%`} 
                color="emerald"
              />
              <HeaderMetric 
                icon={CheckCircle2} 
                label="Attempted" 
                value={((assessmentData.correct_count ?? 0) + (assessmentData.incorrect_count ?? 0))} 
                color="emerald"
              />
              <HeaderMetric 
                icon={HelpCircle} 
                label="Unattempted" 
                value={assessmentData.unattempted_count ?? 0} 
                color="slate"
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 mt-12 space-y-16">
          {assessmentData.sections.map((section: any, sectionIdx: number) => (
            <div key={section.id} className="space-y-12">
              <div className="flex items-center gap-5 pb-4 border-b-2 border-indigo-100">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                  {sectionIdx + 1}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 leading-none">
                     {section.name}
                   </h2>
                   <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Section Deep Dive</div>
                </div>
              </div>

              <div className="space-y-6">
                {(() => {
                    const rendered = [];
                    const questions = section.questions || [];
                    let i = 0;
                    while (i < questions.length) {
                        const q = questions[i];
                        const qType = q.question_type_name;

                        // Match The Following Group Logic
                        if (qType === "match the following") {
                            const group = [q];
                            let j = i + 1;
                            while (j < questions.length && questions[j].question_type_name === "match the following") {
                                group.push(questions[j]);
                                j++;
                            }
                            rendered.push(renderMatchGroupUI(group, i));
                            i = j;
                        } else {
                            // Standard UI
                            rendered.push(renderStandardQuestionUI(q, i));
                            i++;
                        }
                    }
                    return rendered;
                })()}
              </div>

            </div>
          ))}
        </main>
      </div>
  );
}
