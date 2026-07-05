import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  TrendingUp,
  History,
  ArrowRight
} from 'lucide-react';
import { ConceptualVivaService } from '../../services/ConceptualTutorService';
import { toast } from 'react-hot-toast';
import { useCourse } from '../../context/CourseContext';

interface HistoryProps {
  onViewResult: (sessionId: string | number) => void;
  onStartNew?: () => void;
}

export default function ConceptualVivaHistory({ onViewResult, onStartNew }: HistoryProps) {
  const { subscriptionId } = useCourse();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      if (subscriptionId) {
        fetchHistory(userId, subscriptionId);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
      toast.error("User not logged in");
    }
  }, [subscriptionId]);

  const fetchHistory = async (userId: string | number, subId: string | number) => {
    setLoading(true);
    try {
      const data = await ConceptualVivaService.getConceptualVivaHistory(userId, subId);
      console.log("History API Response Data:", data.assessments);
      
      // Map to the correct property: 'assessments' according to the API structure
      if (data && Array.isArray(data.assessments)) {
        setHistory(data.assessments);
      } else if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && Array.isArray(data.data)) {
        setHistory(data.data);
      } else {
        console.warn("Could not find assessment array in response:", data);
        setHistory([]);
      }
    } catch (error) {
      toast.error("Failed to load viva history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };
 
  const filteredHistory = Array.isArray(history) ? history.filter(item => 
    item.assessment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];
  console.log("Filtered History:", filteredHistory);

  return (
    <div className="p-4 sm:p-8 md:p-10  mx-auto space-y-6 sm:space-y-10 min-h-screen bg-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shrink-0">
               <History className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Conceptual Tutor Reports</h1>
               <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-500 font-bold text-xs sm:text-sm mt-0.5">
                  <span>Track your progress</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <span>{history.length} Attempts recorded</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search by subject or topic..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-sm outline-none"
               />
            </div>
            <button className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
               <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 sm:py-40 gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold text-sm sm:text-base">Loading your history...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
           {filteredHistory.map((item, i) => (
             <div 
               key={item.user_ass_id || item.session_id || i}
               className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer flex flex-col"
               onClick={() => onViewResult(item.session_id)}
             >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
                
                <div className="p-4 sm:p-6 relative z-10 flex flex-col justify-between flex-1">
                   <div>
                     <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           <Calendar className="w-2.5 h-2.5" /> {item.started_at ? new Date(item.started_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-bold text-[10px] sm:text-xs uppercase shrink-0">
                           <TrendingUp className="w-3 h-3 text-blue-600" /> {item.subject_name || item.course_name || 'N/A'}
                        </div>
                     </div>
  
                     <h4 className="text-base sm:text-xl font-black text-slate-800 line-clamp-2 leading-snug sm:leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                        {item.assessment_name}
                     </h4>
                   </div>
 
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center justify-between sm:flex-col sm:items-start">
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest uppercase">Score</span>
                            <span className="text-sm sm:text-lg font-black text-slate-800">{item.percentage}%</span>
                         </div>
                         <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center justify-between sm:flex-col sm:items-start">
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest uppercase">Time</span>
                            <span className="text-sm sm:text-lg font-black text-slate-800">{item.total_time}</span>
                         </div>
                      </div>
  
                      <button 
                        className="w-full py-2.5 sm:py-3.5 bg-slate-900 group-hover:bg-blue-600 transition-colors text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-950/5 hover:shadow-blue-500/10"
                      >
                        <span>VIEW REPORT</span> <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="text-center py-24 sm:py-32 px-6 bg-white rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-slate-150">
           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-5 sm:mb-6">
              <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10" />
           </div>
           <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">No attempts yet!</h2>
           <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-8 sm:mb-10 font-medium leading-relaxed">You haven't completed any conceptual viva sessions. Start your first practice session to see insights here.</p>
           <button 
             onClick={onStartNew}
             className="px-8 py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase shadow-xl shadow-blue-200 hover:scale-[1.03] transition-all cursor-pointer"
           >
             START FIRST CONCEPTUAL TUTOR
           </button>
        </div>
      )}

      {/* Summary Footer */}
      {/* {!loading && history.length > 0 && (
        <div className="p-5 sm:p-8 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
           <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-indigo-50 flex items-center justify-center shrink-0">
                 <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
              </div>
              <div>
                 <h4 className="text-lg sm:text-xl font-black text-slate-900">Learning Momentum</h4>
                 <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">Your accuracy has increased by <span className="text-green-500 font-black">+12%</span> this week.</p>
              </div>
           </div>
           <div className="flex gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="flex-1 lg:flex-none p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl text-center min-w-[100px] sm:min-w-[120px]">
                 <div className="text-lg sm:text-2xl font-black text-slate-800">8.5</div>
                 <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Avg Detail</div>
              </div>
              <div className="flex-1 lg:flex-none p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl text-center min-w-[100px] sm:min-w-[120px]">
                 <div className="text-lg sm:text-2xl font-black text-slate-800">92%</div>
                 <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Completion</div>
              </div>
           </div>
        </div>
      )} */}
    </div>
  );
}
