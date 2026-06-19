import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, XCircle, 
  ChevronRight, BookOpen, Clock, Award,
  Loader2, AlertCircle, Sparkles, MessageSquare,
  HelpCircle, BarChart3, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SolutionService, AssessmentSolution, SectionSolutions, SolutionQuestion } from '../../../services/SolutionService';
import { QuestionMathJax, latexToText } from '../../../shared/mathjaxconfig/QuestionMathJax';
import { MathJaxContext } from 'better-react-mathjax';
import { QuestionMathJaxConfig } from '../../../shared/mathjaxconfig/QuestionMathJax';

/**
 * SolutionScreen Component
 * Displays detailed solutions for an assessment with LaTeX support and a modern UI.
 * Uses URL parameters for robust and secure data retrieval.
 */
export default function MCQsolutionScreen() {
  const { userAssId } = useParams<{ userAssId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentSolution | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});

  // Parse assessment ID - supports raw numbers or simple obfuscation if needed
  const decodedAssId = userAssId ? (isNaN(Number(userAssId)) ? atob(userAssId) : userAssId) : null;

  // Use sessionStorage to persist selected tab based on Assessment ID
  const sessionStorageKey = `SolutionScreenTab_${decodedAssId}`;
  
  useEffect(() => {
    const savedIndex = sessionStorage.getItem(sessionStorageKey);
    if (savedIndex !== null) {
      setActiveSectionIndex(parseInt(savedIndex, 10));
    }
  }, [sessionStorageKey]);

  const handleSectionTabClick = (idx: number) => {
    setActiveSectionIndex(idx);
    sessionStorage.setItem(sessionStorageKey, idx.toString());
  };

  const fetchSolutions = useCallback(async () => {
    if (!decodedAssId) {
      setError("No assessment ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await SolutionService.getSolutions(decodedAssId);
      
      if (!response) {
        throw new Error("No data received from service");
      }

      // Map API response to internal structure (similar to Solutions.jsx but with TS)
      // Calculate some metrics for the header if they aren't provided
      const allQuestions = (response.sub_division_details || []).flatMap((s: any) => s.solution_data || []);
      const totalQs = allQuestions.length;
      const correctQs = allQuestions.filter((q: any) => q.answer_remark?.toUpperCase() === 'CORRECT' || q.user_answer === q.correct_option).length;
      const skippedQs = allQuestions.filter((q: any) => !q.user_answer).length;
      const incorrectQs = totalQs - correctQs - skippedQs;
      const accuracy = totalQs > 0 ? Math.round((correctQs / (totalQs - skippedQs)) * 100) : 0;

      // Map API response to internal structure
      const mappedData: AssessmentSolution = {
        assessment_name: response.assessment_name || "Assessment Solution",
        sub_division_details: response.sub_division_details || [],
        total_marks: response.total_marks || allQuestions.reduce((acc: number, q: any) => acc + (parseFloat(q.marks) || 0), 0),
        obtained_marks: response.obtained_marks || allQuestions.reduce((acc: number, q: any) => acc + (isUserCorrectManual(q) ? (parseFloat(q.marks) || 0) : 0), 0),
        correct_count: response.correct_count ?? correctQs,
        incorrect_count: response.incorrect_count ?? incorrectQs,
        unattempted_count: response.unattempted_count ?? skippedQs,
        accuracy: response.accuracy ?? accuracy,
        sections: (response.sub_division_details || []).map((section: any) => ({
          id: section.sub_div_id || section.section_id || Math.random(),
          name: section.sub_div_name || section.section_heading || "Section",
          questions: (section.solution_data || []).map((q: any) => ({
            id: q.question_id,
            que: q.question_latex || q.que_text || "",
            que_diag: (q.question_diagrams_url || []).filter((url: string) => url && url.length > 0),
            options: [
              q.option1_latex,
              q.option2_latex,
              q.option3_latex,
              q.option4_latex,
            ].filter(opt => opt !== undefined && opt !== null),
            options_diag: [
              q.option1_img,
              q.option2_img,
              q.option3_img,
              q.option4_img,
            ],
            user_answer: q.user_answer,
            answer_remark: q.answer_remark,
            correct_option: q.correct_option,
            answer_description: q.answer_description || "No detailed explanation available for this question.",
            marks: q.marks,
            attempt_status: q.attempt_status,
          }))
        }))
      };

      setAssessmentData(mappedData);
    } catch (err: any) {
      console.error("Error fetching solutions:", err);
      setError(err.message || "Failed to load solutions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [decodedAssId]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const toggleSolution = (id: string | number) => {
    setShowSolution(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  const getStatusColor = (question: SolutionQuestion) => {
    if (!question.user_answer) return 'text-slate-400 bg-slate-50 border-slate-200';
    if (question.answer_remark?.toUpperCase() === 'CORRECT' || question.user_answer === question.correct_option) {
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Gathering solutions...</p>
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

  const activeSection = assessmentData.sections[activeSectionIndex];

  return (
      <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* Header Section */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className=" mx-auto px-4 md:px-6 h-auto py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all hover:scale-105"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight line-clamp-1 leading-none">
                  {assessmentData.assessment_name} 
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  Detailed Intelligent Solution Analysis
                </p>
              </div>
            </div>

            {/* Assessment Parameters Grid */}
            {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 items-center">
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
                label="Correct" 
                value={assessmentData.correct_count ?? 0} 
                color="emerald"
              />
              <HeaderMetric 
                icon={HelpCircle} 
                label="Unattended" 
                value={assessmentData.unattempted_count ?? 0} 
                color="slate"
              />
            </div> */}
          </div>

          {/* Section Navigation Tab Bar */}
          <div className="bg-white border-b border-slate-100 px-4 md:px-6">
            <div className="mx-auto">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                {assessmentData.sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionTabClick(idx)}
                    className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-black transition-all ${
                      idx === activeSectionIndex 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {section.name} 
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className=" mx-auto px-4 md:px-6 mt-10 space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-12"
            >
              {activeSection?.questions.map((question, idx) => (
                <div 
                  key={question.id} 
                  className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group transition-all hover:border-blue-100"
                >
                  {/* Card Header: Question Info */}
                  <div className="p-8 md:p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <span className="shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-black text-lg shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {/* <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Text</h3>
                          <div className="h-px w-8 bg-slate-200"></div> */}
                        </div>
                        <div className="text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                          <QuestionMathJax content={question.que} />
                        </div>
                        
                        {/* Diagrams */}
                        {question.que_diag && question.que_diag.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-4">
                            {question.que_diag.map((url, i) => (
                              <div key={i} className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
                                <img 
                                   src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${url}`} 
                                  alt={`Diagram ${i+1}`}
                                  className=" min-h-44 h-auto object-contain bg-white mx-auto"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`shrink-0 px-4 py-2 rounded-2xl border font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 ${getStatusColor(question)}`}>
                      {question.answer_remark?.toUpperCase() === 'CORRECT' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {question.answer_remark || (question.user_answer ? 'Incorrect' : 'Skipped')}
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((opt, oIdx) => {
                      const letter = getOptionLetter(oIdx);
                      const isCorrect = letter === question.correct_option;
                      const isUserChoice = letter === question.user_answer;
                      
                      return (
                        <div 
                          key={oIdx}
                          className={`relative p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                              : isUserChoice 
                                ? 'bg-rose-50 border-rose-200 text-rose-900'
                                : 'bg-white border-slate-100 text-slate-600'
                          }`}
                        >
                          <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            isCorrect ? 'bg-emerald-600 text-white' : isUserChoice ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {letter}
                          </div>
                          
                          <div className="flex-1 font-bold text-sm whitespace-pre-wrap">
                            <QuestionMathJax content={opt} />
                          </div>

                          {isCorrect && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {!isCorrect && isUserChoice && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg">
                              <XCircle className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Result Summary Bar */}
                  <div className="px-8 md:px-10 pb-10 flex flex-col md:flex-row items-center gap-4">
                    {/* <div className="flex-1 w-full bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Your Answer</span>
                          <span className={`text-sm font-black ${isUserCorrect(question) ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {question.user_answer || "Not Attempted"}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Correct Answer</span>
                          <span className="text-sm font-black text-green-600">
                            {question.correct_option}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weightage</span>
                        <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black">
                          {question.marks} Points
                        </div>
                      </div>
                    </div> */}

                    <button 
                      onClick={() => toggleSolution(question.id)}
                      className={`shrink-0 w-full md:w-auto h-20 px-10 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${
                        showSolution[question.id] 
                          ? 'bg-blue-600 text-white shadow-blue-200' 
                          : 'bg-white text-slate-900 border border-slate-200 shadow-slate-100 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                      {showSolution[question.id] ? 'Hide Explanation' : 'View Explanation'}
                    </button>
                  </div>

                  {/* Expandable Solution Section */}
                  <AnimatePresence>
                    {showSolution[question.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden bg-slate-50 border-t border-slate-100"
                      >
                        <div className="p-10 space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                 <Sparkles className="w-5 h-5" />
                              </div>
                              <h4 className="text-lg font-black text-slate-900 tracking-tight">Step-by-Step Explanation</h4>
                           </div>
                           
                           <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm text-slate-700 font-medium leading-relaxed italic relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                 <MessageSquare className="w-20 h-20 text-blue-600" />
                              </div>
                              <div className="relative z-10 text-lg whitespace-pre-wrap">
                                 <QuestionMathJax content={question.answer_description} />
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation / Actions */}
          <div className="pt-10 flex flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Target className="w-6 h-6" />
               </div>
               <p className="text-slate-500 font-medium">Ready to test your knowledge further?</p>
            </div>
            <div className="flex gap-4">
               <button 
                  onClick={() => navigate(-1)}
                  className="px-10 py-4 bg-white border border-slate-200 text-slate-900 rounded-3xl font-black text-sm shadow-xl shadow-slate-100 hover:border-blue-500 transition-all"
               >
                  Back to Results
               </button>
               <button 
                  onClick={() => navigate('/')}
                  className="px-10 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95"
               >
                  Go to Dashboard
               </button>
            </div>
          </div>
        </main>
      </div>
  );
}

// Helper: Check if user's answer is correct
function isUserCorrect(question: SolutionQuestion) {
  if (!question.user_answer) return false;
  return question.answer_remark?.toUpperCase() === 'CORRECT' || question.user_answer === question.correct_option;
}

function isUserCorrectManual(q: any) {
  if (!q.user_answer) return false;
  return q.answer_remark?.toUpperCase() === 'CORRECT' || q.user_answer === q.correct_option;
}

// Header Metric Sub-component
function HeaderMetric({ icon: Icon, label, value, total, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${colors[color]} min-w-[120px]`}>
      <div className={`p-1.5 rounded-xl bg-white shadow-sm`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <span className="text-[9px] font-black uppercase tracking-widest block leading-none mb-1 opacity-70">{label}</span>
        <span className="text-sm font-black leading-none flex items-baseline gap-1">
          {value}
          {total !== undefined && <span className="text-[10px] opacity-50">/ {total}</span>}
        </span>
      </div>
    </div>
  );
}
