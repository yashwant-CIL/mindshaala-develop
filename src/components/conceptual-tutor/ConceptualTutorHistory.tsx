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

interface HistoryProps {
  onViewResult: (sessionId: string | number) => void;
}

export default function ConceptualVivaHistory({ onViewResult }: HistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetchHistory(userId);
    } else {
      setLoading(false);
      toast.error("User not logged in");
    }
  }, []);

  const fetchHistory = async (userId: string | number) => {
    setLoading(true);
    try {
      const data = await ConceptualVivaService.getConceptualVivaHistory(userId);
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 min-h-screen bg-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
               <History className="w-7 h-7" />
            </div>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Viva Reports</h1>
               <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
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
                 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all shadow-sm outline-none"
               />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
               <Filter className="w-5 h-5" />
            </button>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold">Loading your history...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredHistory.map((item, i) => (
             <div 
               key={item.user_ass_id || item.session_id || i}
               className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative cursor-pointer"
               onClick={() => onViewResult(item.session_id)}
             >
                {/* Visual Accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150`}></div>
                
                <div className="p-6 relative z-10">
                   <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         <Calendar className="w-3 h-3" /> {item.started_at ? new Date(item.started_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform`}>
                         <Award className="w-5 h-5" />
                      </div>
                   </div>
 
                   <div className="mb-8">
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase mb-1">
                         <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> {item.subject_name || item.course_name || 'N/A'}
                      </div>
                      <h4 className="text-xl font-black text-slate-800 line-clamp-2 leading-tight">
                         {item.assessment_name}
                      </h4>
                   </div>
 
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Score</div>
                         <div className="text-lg font-black text-slate-800">{item.percentage}%</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Time</div>
                         <div className="text-lg font-black text-slate-800">{item.total_time }</div>
                      </div>
                   </div>
 
                   <button 
                     className="w-full py-4 bg-slate-900 group-hover:bg-blue-600 transition-colors text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2"
                   >
                     VIEW REPORT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="text-center py-40 px-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
              <ClipboardCheck className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">No attempts yet!</h2>
           <p className="text-slate-400 max-w-sm mx-auto mb-10 font-medium">You haven't completed any conceptual viva sessions. Start your first practice session to see insights here.</p>
           <button 
             className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 hover:scale-[1.05] transition-all"
           >
             START FIRST VIVA
           </button>
        </div>
      )}

      {/* Summary Footer */}
      {!loading && history.length > 0 && (
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center">
                 <TrendingUp className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                 <h4 className="text-xl font-black text-slate-900">Learning Momentum</h4>
                 <p className="text-slate-500 font-medium">Your accuracy has increased by <span className="text-green-500 font-black">+12%</span> this week.</p>
              </div>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none p-4 bg-slate-50 rounded-2xl text-center min-w-[120px]">
                 <div className="text-2xl font-black text-slate-800">8.5</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Detail</div>
              </div>
              <div className="flex-1 md:flex-none p-4 bg-slate-50 rounded-2xl text-center min-w-[120px]">
                 <div className="text-2xl font-black text-slate-800">92%</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
