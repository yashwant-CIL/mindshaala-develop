import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  MessageSquare, 
  BookOpen, 
  Target, 
  Zap,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { ConceptualVivaService } from '../../services/ConceptualTutorService';
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

export default function ConceptualVivaResultDetails({ sessionId, onBack, onGoToDashboard }: ResultDetailsProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (sessionId && userId) {
      fetchResult(userId);
    } else {
      setLoading(false);
      if (!userId) toast.error("User ID not found");
    }
  }, [sessionId]);

  const fetchResult = async (userId: string | number) => {
    setLoading(true);
    try {
      const data = await ConceptualVivaService.getConceptualVivaResult(sessionId, userId);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
         <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
        
        <div className="relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4 font-bold text-sm group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO REPORT
          </button>
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                < Award className="w-8 h-8" />
             </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {result.session?.assessment_name || 'Viva Performance Report'}
                </h1>
                <p className="text-slate-500 font-medium">
                  Date: {result.session?.started_at ? new Date(result.session.started_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </p>
              </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
           {/* <button 
             onClick={onGoToDashboard}
             className="px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs tracking-widest uppercase transition-all shadow-xl flex items-center gap-2 group whitespace-nowrap"
           >
              GO TO DASHBOARD <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button> */}
           <div className="bg-slate-900 text-white p-6 rounded-3xl min-w-[180px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                 <Zap className="w-12 h-12" />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Score</div>
              <div className="text-5xl font-black">{result.session?.total_score || '0'}
               {/* <span className="text-xl text-blue-400">/{result.session?.total_questions * 10 || 100}</span> */}
               </div>
              <div className="text-xs font-bold text-blue-400 mt-1">{result.session?.percentage || '0'}% Accuracy</div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Questions', value: result.session?.total_questions || '0', icon: HelpCircle, color: 'blue' },
           { label: 'Attempted', value: result.session?.attempted_count || '0', icon: CheckCircle2, color: 'indigo' },
           { label: 'Skipped', value: result.session?.skip_count || '0', icon: XCircle, color: 'purple' },
           { label: 'Total Time', value: formatDuration(result.session?.total_time), icon: Clock, color: 'green' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-shadow duration-500">
              <div className={`w-10 h-10 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                 <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-xl font-black text-slate-800">{stat.value}</div>
           </div>
         ))}
      </div>

      {/* Main Analysis Section */}
      {/* Overall Feedback Section - Slim Executive Summary */}
      <div className="bg-blue-50/50 rounded-3xl p-5 md:p-6 border border-blue-100 shadow-sm relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
               <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 mt-1">
                  <BrainCircuit className="w-5 h-5" />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Strategic Performance Insight</h3>
                     <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase">AI Analysis</span>
                  </div>
                  <p className="text-md text-slate-600 leading-relaxed font-medium italic">
                     {result.session?.overall_feedback} 
                  </p>
               </div>
            </div>
            
            {/* <div className="flex gap-2 shrink-0 self-center md:self-auto">
               <div className="px-4 py-2 bg-white rounded-xl border border-blue-100 text-center min-w-[90px] shadow-sm">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Focus</div>
                  <div className="text-xs font-bold text-slate-800">{result.session?.precent >= 80 ? 'Optimization' : 'Foundation'}</div>
               </div>
               <div className="px-4 py-2 bg-white rounded-xl border border-blue-100 text-center min-w-[90px] shadow-sm">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Accuracy</div>
                  <div className="text-xs font-bold text-blue-600">{result.session?.precent}%</div>
               </div>
            </div> */}
         </div>
      </div>

      {/* Question Breakdown Section */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
               <Target className="w-7 h-7 text-blue-600" /> Detailed Question Analysis
            </h3>
            <span className="text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
               {result.answers?.length || 0} Questions Attempted
            </span>
         </div>
         
         <div className="grid gap-6">
            {((result.answers && Array.isArray(result.answers)) ? result.answers : []).map((q: any, i: number) => (
               <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg overflow-hidden transition-all hover:border-blue-200 group">
                  <div className="p-8 md:p-10">
                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div className="flex items-start gap-5">
                           <span className="shrink-0 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-slate-200">
                              {q.questionno || i+1}
                           </span>
                           <div>
                              <h4 className="text-xl font-bold text-slate-800 leading-tight mb-2">
                                 {q.question_transcib ? (
                                    <span>{q.question_transcib}</span>
                                 ) : (
                                    <span>{latexToText(q.question || 'Question text missing')}</span>
                                 )}
                              </h4>
                              <div className="flex items-center gap-4">
                                 <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> Time: <span className="text-slate-900">{q.time_taken || '0:00'} seconds</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                         <div className="flex flex-col items-end gap-3 min-w-[200px]">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              q.status === 'SKIPPED' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                              (q.ai_score) >= 5 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                            }`}>
                               {q.status === 'SKIPPED' ? <XCircle className="w-3 h-3" /> : (q.ai_score) >= 5 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                               {q.status === 'SKIPPED' ? 'SKIPPED' : (q.ai_score) >= 5 ? 'CONCEPT CLEAR' : 'NEEDS FOCUS'}
                            </div>
                            <div className="flex items-baseline gap-1">
                               <span className="text-3xl font-black text-slate-900">{q.ai_score || 0}</span>
                               <span className="text-sm font-bold text-slate-400">/10</span>
                            </div>
                         </div>
                     </div>
                     
                     {/* Per-Question Feedback Section */}
                     {q.ai_feedback && (
                        <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-start gap-5 transition-all duration-500 hover:bg-white border-l-4 border-l-blue-600 shadow-sm">
                           <div className="shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-md">
                              <MessageSquare className="w-6 h-6" />
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback</span>
                                 <div className="flex gap-1">
                                    <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                                    <Sparkles className="w-3 h-3 text-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                                 </div>
                              </div>
                              <div className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                 {q.ai_feedback}
                              </div>
                           </div>
                        </div>
                     )}

                     <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* User Answer */}
                        <div className="rounded-[2rem] p-6 bg-slate-50 border border-slate-100 relative group-hover:bg-white transition-colors duration-500">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <MessageSquare className="w-3 h-3" /> Your Explanation
                           </div>
                           <p className="text-slate-600 text-sm italic leading-relaxed">"{q.user_transcription || 'No response recorded'}"</p>
                        </div>

                        {/* Ideal Answer */}
                        <div className="bg-blue-50/30 rounded-[2rem] p-6 border border-blue-100/50">
                           <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Lightbulb className="w-3 h-3" /> Reference Concept
                           </div>
                           <div className="text-slate-700 text-sm leading-relaxed">
                              {q.reference_answer_transcribe ? (
                                 <span>{q.reference_answer_transcribe}</span>
                              ) : (
                                 <span>{latexToText(q.reference_answer || 'No reference answer provided')}</span>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* AI Feedback */}
                     {/* {(q.ai_feedback) && (
                        <div className="flex gap-5 p-6 bg-blue-600 rounded-[2rem] text-white relative overflow-hidden shadow-xl shadow-blue-100 group-hover:scale-[1.01] transition-transform">
                           <div className="absolute top-0 right-0 p-4 opacity-10">
                              <Sparkles className="w-16 h-16" />
                           </div>
                           <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                              <BrainCircuit className="w-6 h-6 text-yellow-300" />
                           </div>
                           <div>
                              <div className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">AI Strategic Feedback</div>
                              <div className="text-sm font-medium leading-relaxed">
                                 <QuestionMathJax content={q.aifeedback} />
                              </div>
                           </div>
                        </div>
                     )} */}
                  </div>
               </div>
            ))}
            
            {(!result.answers || result.answers.length === 0) && (
               <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic text-lg">No questions were attempted in this session.</p>
               </div>
            )}
         </div>
      </div>
      
      <div className="flex justify-center pt-10">
         <button onClick={onGoToDashboard} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm tracking-[0.2em] uppercase hover:bg-black transition-all shadow-2xl flex items-center gap-3 group">
            BACK TO DASHBOARD <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
         </button>
      </div>
    </div>
  );
}
