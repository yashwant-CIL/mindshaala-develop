import { 
  ArrowLeft, Calendar, Award, CheckCircle2, 
  XCircle, AlertCircle, ChevronRight, ChevronDown, BarChart3,
  Clock, BookOpen, Search, Mic, User, Download
} from 'lucide-react';
import { VivaService } from '../services/VivaService';
import { useCourse } from '../context/CourseContext';
import { QuestionMathJax } from '../shared/mathjaxconfig/QuestionMathJax';
import Cookies  from 'js-cookie';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

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
  viva_type?: 'CIL' | 'PRO';
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
  const { subscriptionId } = useCourse();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [history, setHistory] = useState<VivaHistoryItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<VivaResultDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  // Collapsible Question Analysis & Filtering State (reduces vertical scrolling)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [questionFilter, setQuestionFilter] = useState<'all' | 'Correct' | 'Partial' | 'Incorrect'>('all');

  const toggleQuestionExpand = (qId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleExpandAll = (expand: boolean) => {
    if (!selectedResult) return;
    const newExpandedState: Record<string, boolean> = {};
    selectedResult.questions.forEach(q => {
      newExpandedState[q.question_id] = expand;
    });
    setExpandedQuestions(newExpandedState);
  };

  useEffect(() => {
    if (selectedResult?.questions?.length) {
      // Default expand the first question, collapse the rest to save scroll space
      const initialExpanded: Record<string, boolean> = {};
      selectedResult.questions.forEach((q, idx) => {
        initialExpanded[q.question_id] = idx === 0;
      });
      setExpandedQuestions(initialExpanded);
    }
  }, [selectedResult]);

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    if (selectedResult?.assessment_name) {
      document.title = selectedResult.assessment_name;
    }
    window.print();
    document.title = originalTitle;
  };

  // Fetch History on Mount and when subscriptionId is available
  useEffect(() => {
    if (subscriptionId) {
      fetchHistory();
    }
  }, [subscriptionId]);

  const fetchHistory = async () => {
    if (!subscriptionId) return;
    setLoading(true);
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id'); 
    try {
      // Use actual user ID when available
      const data = await VivaService.getVivaHistory(userId, subscriptionId);
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
    setProcessingMessage(null);
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id'); 
    
    try {
      const data = await VivaService.getVivaResult(sessionId,userId);
      if (data) {
        console.log("Viva Result Detail:", data);
        
        // Check if there is an API message about processing or status is not completed
        const apiMessage = data?.message || data?.detail || (typeof data === 'string' ? data : '');
        const isApiCompleted = data?.status?.toLowerCase() === 'completed' || data?.session?.status?.toLowerCase() === 'completed';
        if (
          (apiMessage && (
            apiMessage.toLowerCase().includes("come back in") || 
            apiMessage.toLowerCase().includes("process your responses") || 
            apiMessage.toLowerCase().includes("patience")
          )) ||
          (!isApiCompleted && (data?.status || data?.session?.status))
        ) {
          setProcessingMessage(apiMessage || "Come back in  3-5mins till we process your responses , Thanks for your patience...");
          setView('detail');
          return;
        }
        
        // Map API response to Component State structure if needed
        const mappedData: VivaResultDetail = {
            session_id: data?.session?.session_id || sessionId,
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
      } else {
        setView('list');
        setSelectedResult(null);
        setProcessingMessage(null);
        toast.error("Failed to load result detail. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to fetch result detail", error);
      const errorMsg = error?.response?.data?.message || error?.response?.data?.detail || error?.message || "";
      if (
        errorMsg.toLowerCase().includes("come back in") || 
        errorMsg.toLowerCase().includes("process your responses") || 
        errorMsg.toLowerCase().includes("patience")
      ) {
        setProcessingMessage(errorMsg);
        setView('detail');
      } else {
        setView('list');
        setSelectedResult(null);
        setProcessingMessage(null);
        toast.error(errorMsg || "Failed to fetch result detail");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedResult(null);
    setProcessingMessage(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
     if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

    const formatStartTime = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
      <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Viva Results</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Track your performance and review AI feedback</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 sm:px-4 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all w-full sm:w-auto">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHistory.length === 0 && (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 p-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-700">No Results Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">You haven't completed any viva exams yet.</p>
          </div>
        )}

        {/* Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredHistory.map((item) => {
            const isCompleted = item.status?.toLowerCase() === 'completed' || item.assessment_status?.toLowerCase() === 'completed';
            const isProcessing = !isCompleted;
            return (
              <div 
                key={item.session_id}
                className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer ${
                  isProcessing 
                    ? 'border-amber-200 hover:border-amber-300' 
                    : 'border-slate-200 hover:border-blue-200'
                }`}
                onClick={() => handleViewResult(item.session_id)}
              >
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                      {item.viva_type && (
                        <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                          item.viva_type === 'PRO'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {item.viva_type}
                        </span>
                      )}
                      
                      {isProcessing ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 animate-pulse flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          Processing
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getScoreColor(item.percentage)}`}>
                          {item.percentage}% 
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.assessment_name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm mt-2">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>{formatDate(item.started_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // ============================================================================
  // VIEW: DETAILS (PROCESSING)
  // ============================================================================
  if (view === 'detail' && processingMessage) {
    return (
      <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 w-full">
        
        {/* Navigation */}
        <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 no-print">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Results
          </button>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl border border-slate-200 text-center max-w-2xl mx-auto my-4 sm:my-10 relative overflow-hidden">
          {/* Abstract Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-60"></div>
          
          <div className="relative z-10 space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-amber-50 border border-amber-200 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 animate-pulse" />
              <span className="absolute top-0 right-0 flex h-3 w-3 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-amber-500"></span>
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Result Under Evaluation
            </h2>
            
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100 max-w-md mx-auto">
              <p className="text-slate-700 font-semibold text-sm sm:text-base md:text-lg leading-relaxed italic">
                "{processingMessage}"
              </p>
            </div>

            <div className="pt-1 text-xs sm:text-sm text-slate-400 font-medium max-w-sm mx-auto">
              Please check back in a few minutes. We are working hard to evaluate your performance!
            </div>

            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <button 
                onClick={handleBack}
                className="px-5 sm:px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer"
              >
                View Other Results
              </button>
              <button 
                onClick={fetchHistory}
                className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW: DETAILS (COMPLETED)
  // ============================================================================
  if (view === 'detail' && selectedResult) {
    return (
      <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 w-full">
        
        {/* Navigation */}
        <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 no-print">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Results
          </button>

          {/* TO DISABLE/COMMENT THE DOWNLOAD BUTTON, COMMENT OUT THE BUTTON ELEMENT BELOW */}
          {/* <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button> */}
        </div>

        {/* Print Content Wrapper */}
        <div id="viva-result-pdf-content">
          
          {/* Printable Style Injector */}
          <style>{`
            @media print {
              /* Hide all external elements including sidebars, navbars, and buttons */
              body * {
                visibility: hidden !important;
              }
              /* Show only the specific result content container and its children */
              #viva-result-pdf-content,
              #viva-result-pdf-content * {
                visibility: visible !important;
              }
              /* Position container perfectly in the print margin space */
              #viva-result-pdf-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                box-shadow: none !important;
              }
              /* Avoid awkward question split across printed pages */
              .bg-white.rounded-2xl {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `}</style>

        {/* Score Summary Card */}
        {/* Modern Score Summary Card - Light Theme */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-xl border border-slate-200 relative overflow-hidden">
           {/* Abstract Background Elements */}
           <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
           <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-50"></div>
           
           <div className="relative z-10">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {formatDate(selectedResult.started_at)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-green-200">
                       {selectedResult.assessment_status}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 leading-tight break-words">
                    {selectedResult?.assessment_name}
                  </h1>
                </div>
                
                {/* Grade Badge */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 min-w-[100px] sm:min-w-[120px] shadow-sm self-start sm:self-auto shrink-0">
                    <span className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5 sm:mb-1">Grade</span>
                    <span className={`text-3xl sm:text-4xl font-black ${
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

              <div className="mb-6 sm:mb-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                 {/* Total Score */}
                 <div className="bg-slate-50/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase">Average Score</span>
                       <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                    </div>
                    <div>
                       <span className="text-2xl sm:text-3xl font-bold text-slate-900">{selectedResult.total_score}</span>
                    </div>
                     <p className="text-[10px] sm:text-xs text-indigo-600 mt-1.5 sm:mt-2 font-medium">
                       Based on attempts
                    </p>
                 </div>

                 {/* Questions Attempted */}
                 <div className="bg-slate-50/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase">Attempted</span>
                       <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {selectedResult.attempted_count}
                       </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-blue-600 mt-1.5 sm:mt-2 font-medium">
                       Questions Answered
                    </p>
                 </div>

                 {/* Questions Skipped/Unattempted */}
                 <div className="bg-slate-50/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase">Skipped</span>
                       <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                         {selectedResult.skip_count}
                       </span>
                    </div>
                   <p className="text-[10px] sm:text-xs text-rose-600 mt-1.5 sm:mt-2 font-medium">
                       Not Answered
                    </p>
                 </div>

                 {/* Accuracy */}
                 <div className="bg-slate-50/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase">UnAttempted</span>
                       <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {selectedResult.unattempted_count}
                       </span>
                    </div>
                     <p className="text-[10px] sm:text-xs text-indigo-600 mt-1.5 sm:mt-2 font-medium">
                       Not Visited
                    </p>
                 </div>
              </div>
           </div>
               {/* Overall Feedback Section */}
               {selectedResult.overall_feedback && (
                 <div className="mt-6 sm:mt-10 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-violet-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                     <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-violet-600 uppercase tracking-wider mb-2 sm:mb-3 relative z-10">
                         <User className="w-4 h-4 shrink-0" /> Overall Performance Feedback
                     </h3>
                     <p className="text-slate-700 leading-relaxed text-sm sm:text-base md:text-lg relative z-10 italic">
                         "{selectedResult.overall_feedback}"
                     </p>
                 </div>
               )}
        </div>
        {/**comment this code if you want the questions and answers in the pdf */}
        </div>

        {/* Questions Analysis Header + Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
             <BookOpen className="w-5 h-5 text-blue-600 shrink-0" /> Detailed Analysis
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Question Status Filter Pills */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setQuestionFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${questionFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({selectedResult.questions.length})
              </button>
              <button
                onClick={() => setQuestionFilter('Correct')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${questionFilter === 'Correct' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'}`}
              >
                Correct ({selectedResult.questions.filter(q => q.status === 'Correct' || q.ai_score >= 8).length})
              </button>
              <button
                onClick={() => setQuestionFilter('Partial')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${questionFilter === 'Partial' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:text-amber-900'}`}
              >
                Partial ({selectedResult.questions.filter(q => q.status === 'Partial' || (q.ai_score >= 5 && q.ai_score < 8)).length})
              </button>
              <button
                onClick={() => setQuestionFilter('Incorrect')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${questionFilter === 'Incorrect' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-700 hover:text-rose-900'}`}
              >
                Incorrect ({selectedResult.questions.filter(q => q.status === 'Incorrect' || q.ai_score < 5).length})
              </button>
            </div>

            {/* Expand / Collapse All buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleExpandAll(true)}
                className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={() => handleExpandAll(false)}
                className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Questions List */}
        <div className="space-y-3">
          {selectedResult.questions
            .filter(q => {
              if (questionFilter === 'all') return true;
              if (questionFilter === 'Correct') return q.status === 'Correct' || q.ai_score >= 8;
              if (questionFilter === 'Partial') return q.status === 'Partial' || (q.ai_score >= 5 && q.ai_score < 8);
              if (questionFilter === 'Incorrect') return q.status === 'Incorrect' || q.ai_score < 5;
              return true;
            })
            .map((q, index) => {
              const isExpanded = !!expandedQuestions[q.question_id];
              return (
                <div key={q.question_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all">
                   {/* Interactive Question Header Bar */}
                   <div 
                      onClick={() => toggleQuestionExpand(q.question_id)}
                      className="p-3.5 sm:p-4 bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer select-none flex items-center justify-between gap-3 transition-colors"
                   >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                         <span className="shrink-0 w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {index + 1}
                         </span>
                         <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                            <QuestionMathJax content={q.question_latex} />
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                         <div className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ${
                             q.ai_score >= 8 ? 'bg-green-100 text-green-700 border border-green-200' :
                             q.ai_score >= 5 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                             'bg-red-100 text-red-700 border border-red-200'
                         }`}>
                             {q.ai_score >= 8 && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                             {q.ai_score >= 5 && q.ai_score < 8 && <AlertCircle className="w-3 h-3 shrink-0" />}
                             {q.ai_score < 5 && <XCircle className="w-3 h-3 shrink-0" />}
                             <span>{q.status}</span>
                             <span className="opacity-75">({q.ai_score}/10)</span>
                         </div>

                         <div className={`p-1 rounded-lg bg-slate-200/60 text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-4 h-4" />
                         </div>
                      </div>
                   </div>

                   {/* Expandable Question Details */}
                   {isExpanded && (
                     <div className="border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                           {/* User Answer */}
                           <div className="p-4 sm:p-5 relative">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-200 opacity-50"></div>
                              <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                 <Mic className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Your Answer
                              </h4>
                              <div className="text-slate-700 leading-relaxed bg-purple-50/50 p-3 rounded-xl border border-purple-100 text-xs sm:text-sm">
                                 {q.user_transcription ? `"${q.user_transcription}"` : <span className="text-slate-500 italic">This question was not attempted.</span>}
                              </div>
                           </div>

                           {/* Expected Answer */}
                           <div className="p-4 sm:p-5 relative">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-200 opacity-50"></div>
                              <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                 <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Expected Answer
                              </h4>
                              <div className="text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs sm:text-sm">
                                 <QuestionMathJax content={q.answer_description} />
                              </div>
                           </div>
                        </div>

                        {/* Feedback */}
                        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100">
                           <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              <Search className="w-3.5 h-3.5 text-green-600 shrink-0" /> AI Feedback
                           </h4>
                           <div className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                              {q.ai_feedback || <span className="text-slate-500 italic">No feedback available as the question was not attempted.</span>}
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              );
            })}
        </div>
        {/* </div> */}
      </div>
    );
  }

  return <div>Unknown Error View</div>;
}
