import { useState, useEffect, useRef } from 'react';
import { Trophy, Clock, User, Calendar, Target, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { TestService } from '../../../services/TestServices';
import { Button } from '../../../components/ui/button';

interface TheoryResultProps {
  userAssId: number | string;
  onExit: () => void;
}

export function TheoryResult({ userAssId, onExit }: TheoryResultProps) {
  const [resultData, setResultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animateScore, setAnimateScore] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTheoryResult = async () => {
    setIsLoading(true);
    try {
      const response = await TestService.getTheoryResult(userAssId);
      
      // The API response structure from TestServices.tsx: response.data
      // Based on JSX logic: if (response.data?.output?.status === "active")
      const output = response?.output;
      
      if (output?.status === "ACTIVE") {
        setResultData(output);
        setIsLoading(false);
        setAnimateScore(true);
      } else {
        // If not active, retry after 5 seconds
        retryTimeoutRef.current = setTimeout(fetchTheoryResult, 5000);
      }
    } catch (err: any) {
      console.error("Error fetching theory result:", err);
      // Check for specific retry-able errors if needed, but for now just show error or retry
      if (err?.response?.data?.message?.includes("1213")) {
          retryTimeoutRef.current = setTimeout(fetchTheoryResult, 5000);
      } else {
          setError("Failed to fetch theory evaluation. Please try again later.");
          setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTheoryResult();
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [userAssId]);

  if (isLoading || !resultData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="flex space-x-2 mb-6">
          <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce"></div>
        </div>
        <p className="text-xl font-bold text-slate-700 animate-pulse">Calculating AI Evaluation...</p>
        <p className="text-slate-500 mt-2">This may take a moment while our AI reviews your answers.</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={onExit} variant="outline">Back to Dashboard</Button>
        </div>
    );
  }

  const name = Cookies.get('username') || "Student";
  const examTitle = resultData.assessment_name || "Theory Assessment";
  const examDate = resultData.ass_end_time ? new Date(resultData.ass_end_time).toLocaleDateString() : "N/A";
  const duration = resultData.total_time ? `${resultData.total_time} min` : "N/A";
  const totalMarks = resultData.total_marks || 0;
  const obtainedMarks = resultData.obtained_marks || 0;
  const percentage = resultData.obtained_percentage || 0;
  const feedback = resultData.overall_feedback || "No feedback available.";
  const timeSpent = resultData.time_taken || "N/A";
  const attemptedQuestions = resultData.attempted_question || 0;
  const totalQuestions = resultData.total_question || 0;
  const accuracy = resultData.accuracy || 0;

  const getPerformanceMessage = (pct: number) => {
    if (pct >= 90) return "Exceptional Performance! 🎉";
    if (pct >= 80) return "Excellent Work! 👏";
    if (pct >= 70) return "Good Job! 👍";
    if (pct >= 60) return "Fair Performance 📚";
    return "Needs Improvement 💪";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100 transition-all duration-500">
        
        {/* Premium Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight">{name}</h1>
                  <div className="flex items-center gap-3 mt-1 text-indigo-100 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{examDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 text-indigo-100">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-lg">{timeSpent} <span className="text-white/50 font-normal">/ {duration}</span></span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Total Duration</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{examTitle}</h2>
              <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <p className="text-2xl font-medium text-emerald-300 tracking-wide">{getPerformanceMessage(percentage)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="p-10">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            
            {/* Main Score Card */}
            <div className="md:col-span-2 group">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] p-8 border border-emerald-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100/50 relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full translate-y-[-50%] translate-x-[50%]"></div>
                
                <div className="relative flex flex-col items-center text-center">
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Total Score</span>
                    <div className={`flex items-baseline gap-2 text-8xl font-black text-emerald-600 transition-all duration-1000 ${animateScore ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                        {obtainedMarks}
                        <span className="text-3xl text-slate-400 font-normal">/ {totalMarks}</span>
                    </div>
                    <div className="mt-4 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-sm font-bold">
                        Verified by AI Engine
                    </div>
                </div>
              </div>
            </div>

            {/* Percentage Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-8 border border-amber-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/50 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center">
                <Target className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Percentage</span>
                <p className="text-5xl font-black text-slate-900 mt-1">{percentage}%</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Attempted</span>
                <p className="text-2xl font-black text-slate-900">{attemptedQuestions} <span className="text-slate-400 font-bold text-lg">/ {totalQuestions}</span></p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Unattempted</span>
                <p className="text-2xl font-black text-slate-900">{Math.max(0, totalQuestions - attemptedQuestions)}</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Accuracy</span>
                <p className="text-2xl font-black text-slate-900">{accuracy}%</p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Comprehensive Analysis
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-100 shadow-lg relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 transition-all duration-300 group-hover:w-4"></div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-indigo-600" />
                    Overall Feedback & Insights
                </h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-lg text-slate-700 leading-relaxed italic font-medium">
                        "{feedback}"
                    </p>
                </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-8">
            <div className="text-slate-500 font-medium">
                Keep up the excellent work! Our AI evaluation considers accuracy, expression and technical depth.
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button 
                    onClick={onExit}
                    className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xl shadow-slate-200"
                >
                    Back to Dashboard
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
