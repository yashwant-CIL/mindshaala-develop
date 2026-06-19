import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Award, CheckCircle2, 
  XCircle, AlertCircle, ChevronRight, BarChart3,
  Clock, BookOpen, Search, Mic, User
} from 'lucide-react';
import { VivaService } from '../services/VivaService';
import { useCourse } from '../context/CourseContext';
import { QuestionMathJax } from '../shared/mathjaxconfig/QuestionMathJax';
import Cookies  from 'js-cookie';

interface VivaHistoryItem {
  session_id: string;
  assessment_name: string;
  started_at: string;
  total_marks: number;
  total_score: number;
  percentage: number;
  status: string;
  assessment_status: string;
  attempted_count: number;
  unattempted_count: number;
  skip_count: number;
}

interface QuestionResult {
  question_id: string;
  question_latex: string;
  ai_score: number;
  user_transcription: string;
  answer_description: string;
  marks_obtained: number;
  total_marks: number;
  ai_feedback: string;
  status: 'Correct' | 'Partial' | 'Incorrect';

}

interface VivaResultDetail {
  session_id: string;
  assessment_name: string;
  started_at: string;
  total_marks: number;
  total_score: number;
  percentage: number;
  student_name: string;
  questions: QuestionResult[];
  assessment_status: string;
  attempted_count: number;
  unattempted_count: number;
  skip_count: number;
  overall_feedback?: string; // Added overall_feedback
}

export default function VivaResult() {
  const { } = useCourse(); // Removed user since it might not exist on context
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [history, setHistory] = useState<VivaHistoryItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<VivaResultDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch History on Mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id'); 
    try {
      // Use actual user ID when available
      const data = await VivaService.getVivaHistory(userId);
      if (data) {
        console.log("Viva History:", data);
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = async (sessionId: string) => {
    setLoading(true);
    try {
      const data = await VivaService.getVivaResult(sessionId);
      if (data) {
        console.log("Viva Result Detail:", data);
        
        // Map API response to Component State structure if needed
        // Assuming API might return different keys or we need to be safe
        const mappedData: VivaResultDetail = {
            session_id: data?.session?.session_id,
            assessment_name: data?.session?.assessment_name || data.exam_name || "Assessment",
            started_at:  data?.session?.started_at || data.date || new Date().toISOString(),
            total_marks: data?.session?.total_marks || 0,
            total_score: data?.session?.total_score || data.obtained_marks || 0,
            percentage: data?.session?.percentage || 0,
            student_name: data?.session?.student_name || "Student",
            assessment_status : data?.session?.status ,
            attempted_count: data?.session?.attempted_count,
            unattempted_count: data?.session?.unattempted_count,
            skip_count: data?.session?.skip_count,
            overall_feedback: data?.session?.overall_feedback || data?.overall_feedback, // Map overall_feedback
            questions: (data.answers || []).map((q: any) => ({
                ...q,
                status: q.status as 'Correct' | 'Partial' | 'Incorrect'
            }))
        };
        
        setSelectedResult(mappedData);
        console.log("Selected Result:", mappedData);
        setView('detail');
      }
    } catch (error) {
      console.error("Failed to fetch result detail", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedResult(null);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const filteredHistory = history.filter((item) => 
    item.assessment_name ? (item.assessment_name).toUpperCase().includes(searchTerm.toUpperCase()) : false
  );

  // ============================================================================
  // VIEW: LIST
  // ============================================================================
  if (view === 'list') {
    return (
      <div className="p-6 md:p-8  mx-auto min-h-screen bg-slate-50">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Viva Results</h1>
            <p className="text-slate-500 mt-1">Track your performance and review AI feedback</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full md:w-64"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHistory.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Results Found</h3>
            <p className="text-slate-500 mt-2">You haven't completed any viva exams yet.</p>
          </div>
        )}

        {/* Grid List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div 
              key={item.session_id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 group cursor-pointer"
              onClick={() => handleViewResult(item.session_id)}
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(item.percentage)}`}>
                    {item.percentage}% 
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.assessment_name}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.started_at)}
                  </div>
                </div>

                {/* <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase font-semibold">Marks</span>
                      <span className="font-bold text-slate-700">{item.total_score} <span className="text-slate-400">/ {item.total_marks}</span></span>
                   </div>
                   <button className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details <ChevronRight className="w-4 h-4" />
                   </button>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW: DETAILS
  // ============================================================================
  if (view === 'detail' && selectedResult) {
    return (
      <div className="p-6 md:p-8 mx-auto min-h-screen bg-slate-50">
        
        {/* Navigation */}
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Results
        </button>

        {/* Score Summary Card */}
        {/* Modern Score Summary Card - Light Theme */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl border border-slate-200 relative overflow-hidden">
           {/* Abstract Background Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-50"></div>
           
           <div className="relative z-10">
              {/* Header Section */}
              <div className="flex flex-row justify-between items-end gap-4 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {formatDate(selectedResult.started_at)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-200">
                       {selectedResult.assessment_status}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
                    {selectedResult?.assessment_name}
                  </h1>
                </div>
                
                {/* Grade Badge */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-200 min-w-[120px] shadow-sm">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Grade</span>
                    <span className={`text-4xl font-black ${
                      selectedResult.percentage >= 80 ? 'text-green-600' :
                      selectedResult.percentage >= 60 ? 'text-orange-500' : 'text-red-500'
                    }`}>
                      {selectedResult.percentage >= 90 ? 'A+' :
                       selectedResult.percentage >= 80 ? 'A' :
                       selectedResult.percentage >= 70 ? 'B' :
                       selectedResult.percentage >= 60 ? 'C' : 'D'}
                    </span>
                </div>
              </div>

              

              <div className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {/* Total Score */}
                 <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-xs font-bold uppercase">Average Score</span>
                       <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                       <span className="text-3xl font-bold text-slate-900">{selectedResult.total_score}</span>
                       {/* <span className="text-slate-400 text-sm ml-1">/ {selectedResult.total_marks || 20}</span> */}
                    </div>
                    {/* <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                       <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(selectedResult.percentage, 100)}%` }}></div>
                    </div> */}
                     <p className="text-xs text-indigo-600 mt-2 font-medium">
                       Based on attempts
                    </p>
                 </div>

                 {/* Questions Attempted */}
                 <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-xs font-bold uppercase">Attempted</span>
                       <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-bold text-slate-900">
                          {/* {selectedResult.questions.filter(q => q.user_answer && q.user_answer.trim() !== '' && q.user_answer !== 'Skipped').length} */}
                          {selectedResult.attempted_count}
                       </span>
                       {/* <span className="text-slate-400 text-sm">/ {selectedResult.questions.length}</span> */}
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                       Questions Answered
                    </p>
                 </div>

                 {/* Questions Skipped/Unattempted */}
                 <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-xs font-bold uppercase">Skipped</span>
                       <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-bold text-slate-900">
                         {/* {selectedResult.questions.filter(q => !q.user_answer || q.user_answer.trim() === '' || q.user_answer === 'Skipped').length} */}
                         {selectedResult.skip_count}
                       </span>
                       {/* <span className="text-slate-400 text-sm">/ {selectedResult.questions.length}</span> */}
                    </div>
                   <p className="text-xs text-rose-600 mt-2 font-medium">
                       Not Answered
                    </p>
                 </div>

                 {/* Accuracy */}
                 <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-xs font-bold uppercase">UnAttempted</span>
                       <BarChart3 className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-bold text-slate-900">
                          {/* {Math.round((selectedResult.questions.filter(q => q.status === 'Correct').length / (selectedResult.questions.filter(q => q.user_answer && q.user_answer.trim() !== '' && q.user_answer !== 'Skipped').length || 1)) * 100)}% */}
                          {selectedResult.unattempted_count}
                       </span>
                    </div>
                     <p className="text-xs text-indigo-600 mt-2 font-medium">
                       Not Visited
                    </p>
                 </div>
              </div>
           </div>
              {/* Overall Feedback Section */}
                       {selectedResult.overall_feedback && (
                         <div className="mt-10 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-6 border border-violet-100 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                             <h3 className="flex items-center gap-2 text-sm font-bold text-violet-600 uppercase tracking-wider mb-3 relative z-10">
                                 <User className="w-4 h-4" /> Overall Performance Feedback
                             </h3>
                             <p className="text-slate-700 leading-relaxed text-lg relative z-10 italic">
                                 "{selectedResult.overall_feedback}"
                             </p>
                         </div>
                       )}
        </div>

        {/* Questions Analysis */}
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <BookOpen className="w-5 h-5 text-blue-600" /> Detailed Analysis
        </h2>

        <div className="space-y-6">
          {selectedResult.questions.map((q, index) => (
            <div key={q.question_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
               
               {/* Question Header */}
               <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
                  <div className="flex gap-4">
                     <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm">
                        {index + 1}
                     </span>
                     <div>
                        <h3 className="font-medium text-slate-800 text-lg">
                        <QuestionMathJax content={q.question_latex} />
                          </h3>
                     </div>
                  </div>
                  <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      q.ai_score >= 8 ? 'bg-green-100 text-green-700' :
                      q.ai_score >= 5 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                  }`}>
                      {q.ai_score >= 8 && <CheckCircle2 className="w-3 h-3" />}
                      {q.ai_score >= 5 && q.ai_score < 8 && <AlertCircle className="w-3 h-3" />}
                      {q.ai_score < 5 && <XCircle className="w-3 h-3" />}
                      {q.status}
                      <span className="ml-1 opacity-75">({q.ai_score}/10)</span>
                  </div>
               </div>

               {/* Comparison Grid */}
               <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* User Answer */}
                  <div className="p-6 relative">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-200 opacity-50"></div>
                     <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                        <Mic className="w-4 h-4 text-purple-500" /> Your Answer
                     </h4>
                     <p className="text-slate-700 leading-relaxed bg-purple-50/50 p-4 rounded-xl border border-purple-100 text-sm">
                        {q.user_transcription ? `"${q.user_transcription}"` : <span className="text-slate-500 italic">This question was not attempted.</span>}
                     </p>
                  </div>

                  {/* Expected Answer */}
                  <div className="p-6 relative">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-200 opacity-50"></div>
                     <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" /> Expected Answer
                     </h4>
                     <p className="text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm">
                      <QuestionMathJax content={q.answer_description} />
                     </p>
                  </div>
               </div>

               {/* Feedback */}
               <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                     <Search className="w-4 h-4 text-green-600" /> AI Feedback
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                     {q.ai_feedback || <span className="text-slate-500 italic">No feedback available as the question was not attempted.</span>}
                  </p>
               </div>

            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div>Unknown Error View</div>;
}
