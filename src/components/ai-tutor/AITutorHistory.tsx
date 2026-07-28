import { useState, useEffect, useContext } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  TrendingUp,
  History,
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { AITutorService } from '../../services/AITutorService';
import { toast } from 'react-hot-toast';
import { useCourse } from '../../context/CourseContext';
import { UserContext } from '../../App';

interface HistoryProps {
  onViewResult: (sessionId: string | number) => void;
  onStartNew?: () => void;
}

export default function AITutorHistory({ onViewResult, onStartNew }: HistoryProps) {
  const { subscriptionId } = useCourse();
  const { state: userState } = useContext(UserContext) || { state: {} };
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || userState?.user_id;
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
  }, [subscriptionId, userState?.user_id]);

  const fetchHistory = async (userId: string | number, subId: string | number) => {
    setLoading(true);
    try {
      const data = await AITutorService.GetAITutorHistory(userId, subId);
      console.log("AI Tutor History Reports:", data.sessions);
      
      if (data && Array.isArray(data.sessions)) {
        setHistory(data.sessions);
      } else if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && Array.isArray(data.data)) {
        setHistory(data.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      toast.error("Failed to load AI Tutor history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };
 
  const filteredHistory = Array.isArray(history) ? history.filter(item => 
    item.session_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getDateDetails = (dateStr?: string) => {
    if (!dateStr) return { day: '--', month: '---' };
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const formatStartDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      
      const dd = date.getDate().toString().padStart(2, '0');
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const yy = date.getFullYear().toString().slice(-2);
      
      let hours = date.getHours();
      const mins = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour converts to 12
      const hh = hours.toString().padStart(2, '0');

      return `${dd}-${mm}-${yy} ${hh}:${mins} ${ampm}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const getSessionDuration = (startTime: string | null | undefined, endTime: string | null | undefined) => {
    if (!startTime) return 'N/A';
    if (!endTime || endTime === 'null') return 'In Progress';
    
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = Math.abs(end.getTime() - start.getTime());
      
      const totalSeconds = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      
      const mm = mins.toString().padStart(2, '0');
      const ss = secs.toString().padStart(2, '0');

      if (hrs > 0) {
        const hh = hrs.toString().padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }
      return `${mm}:${ss}`;
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="p-4 sm:p-8 md:p-10 max-w-full mx-auto space-y-8 min-h-screen bg-slate-50/20">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shrink-0">
               <History className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight">AI Session History</h1>
               <p className="text-slate-500 font-bold text-xs mt-0.5">{history.length} 
                {history.length > 1 ? " Sessions" : " Session"}</p>
            </div>
         </div>

         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search reports..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 transition-all outline-none shadow-sm"
               />
            </div>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <div className="w-10 h-10 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold text-sm">Retrieving your timeline...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="space-y-4">
           {filteredHistory.map((item, i) => {
             const { day, month } = getDateDetails(item.session_start_time || item.started_at);
             const score = item.overall_accuracy || 0;
             const isInProgress = !item.session_end_time || item.session_end_time === 'null';
             return (
               <div 
                 key={item.user_ass_id || item.session_id || i}
                 onClick={() => {
                   if (isInProgress) {
                     toast.error("This session is currently in progress");
                   } else {
                     onViewResult(item.session_id);
                   }
                 }}
                 className="group bg-white rounded-2xl border border-slate-150 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300 hover:border-violet-300 hover:bg-violet-50/5 cursor-pointer shadow-sm hover:shadow-md"
               >
                  {/* Left: Date Block & Description */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                     {/* Calendar Widget */}
                     <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-xl p-2.5 flex flex-col items-center justify-center min-w-[64px] shrink-0 group-hover:bg-violet-50 group-hover:border-violet-100 transition-colors">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 group-hover:text-violet-500">{month}</span>
                        <span className="text-lg font-black text-slate-700 leading-none mt-0.5 group-hover:text-violet-700">{day}</span>
                     </div>
                     
                     <div className="min-w-0">
                        <h4 className="text-md font-bold text-slate-800 truncate mt-2 leading-tight group-hover:text-violet-700 transition-colors">
                           {item.session_name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[8px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                            {item.topic_name || item.course_name || 'Subject'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatStartDateTime(item.session_start_time || item.started_at)}
                          </span>
                        </div>
                     </div>
                  </div>

                  {/* Right: Accuracy Metrics & Duration */}
                  <div className="flex flex-wrap items-center gap-6 shrink-0 md:justify-end">
                     {/* Score Progress Bar */}
                     {isInProgress ? (
                       <div className="w-36 flex justify-start items-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 animate-pulse">
                             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                             In Progress
                          </span>
                       </div>
                     ) : (
                       <div className="w-36">
                          <div className="flex items-center justify-between text-xs font-semibold mb-1">
                             <span className="text-slate-400">Score</span>
                             <span className="text-slate-800 font-bold">{score}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" 
                               style={{ width: `${score}%` }}
                             ></div>
                          </div>
                       </div>
                     )}

                     {/* Duration Badge */}
                     {/* <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{getSessionDuration(item.session_start_time, item.session_end_time)}</span>
                     </div> */}

                     {/* Action Arrow */}
                     <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all shadow-sm">
                        <ChevronRight className="w-4 h-4" />
                     </div>
                  </div>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
           <ClipboardCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <h2 className="text-lg font-black text-slate-800 mb-1">No reports recorded</h2>
           <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">Complete a practice session first to see your chronological AI reviews here.</p>
           <button 
             onClick={onStartNew}
             className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-violet-100 transition-transform"
           >
             Start New Session
           </button>
        </div>
      )}
    </div>
  );
}
