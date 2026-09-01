import { useState, useEffect } from 'react';
import { ConceptualVivaService } from '../../services/ConceptualTutorService';
import { useCourse } from '../../context/CourseContext';
import { toast } from 'react-hot-toast';
import { 
  Clock, 
  Award,
  Calendar,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Sparkles,
  ArrowUpRight,
  BrainCircuit,
  LayoutDashboard,
  Mic,
  ArrowRight
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

// Custom Semi-Circular Gauge Component
const PerformanceGauge = ({ value, label, color }: { value: number, label: string, color: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-24 overflow-hidden">
        <div className="w-40 h-40 rounded-full border-[12px] border-slate-100 absolute top-0 left-0"></div>
        <div 
          className="w-40 h-40 rounded-full border-[12px] absolute top-0 left-0 transition-all duration-1000 ease-out"
          style={{ 
            borderColor: color,
            clipPath: `polygon(0 50%, 100% 50%, 100% 100%, 0 100%)`,
            transform: `rotate(${180 + (value * 1.8)}deg)`
          }}
        ></div>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2">
          <span className="text-2xl font-black text-slate-900">{value}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default function ConceptualVivaDashboard() {
  const { subscriptionId } = useCourse();
  const [cardsData, setCardsData] = useState<any>(null);
  const [weakChapters, setWeakChapters] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [subjectRadar, setSubjectRadar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId || !subscriptionId) {
        if (!userId) toast.error("User not logged in");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [cardsRes, chaptersRes, topicsRes, radarRes] = await Promise.all([
          ConceptualVivaService.getConceptualDashboardCards(userId, subscriptionId),
          ConceptualVivaService.getConceptualDashboardWeakChapters(userId, subscriptionId),
          ConceptualVivaService.getConceptualDashboardWeakTopics(userId, subscriptionId),
          ConceptualVivaService.getConceptualDashboardSubjectRadar(userId, subscriptionId),
        ]);

        console.log("Conceptual Tutor Dashboard API Responses:", { cardsRes, chaptersRes, topicsRes, radarRes });

        setCardsData(cardsRes?.data || cardsRes || null);
        setWeakChapters(chaptersRes?.data || (Array.isArray(chaptersRes) ? chaptersRes : []));
        setWeakTopics(topicsRes?.data || (Array.isArray(topicsRes) ? topicsRes : []));
        
        const radarDataArray = radarRes?.data || 
                               radarRes?.subject_radar || 
                               radarRes?.subjectRadar || 
                               radarRes?.subjectRadarData || 
                               (Array.isArray(radarRes) ? radarRes : []);
        setSubjectRadar(radarDataArray);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [subscriptionId]);

  const kpiData = cardsData ? [
    { label: 'Total Vivas', value: cardsData.total_viva || '0', icon: Mic, color: 'text-blue-600', bg: 'bg-blue-50', trend: cardsData.vivas_trend || '' },
    { label: 'Avg Accuracy', value: `${cardsData.avg_viva_accuracy || 0}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: cardsData.accuracy_trend || '' },
    // { label: 'Conceptual Depth', value: cardsData.conceptual_depth || 'Level 0', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50', trend: cardsData.depth_trend || '' },
    // { label: 'Study Hours', value: `${cardsData.study_hours || 0}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: cardsData.study_trend || '' },
  ] : [
    { label: 'Total Vivas', value: '0', icon: Mic, color: 'text-blue-600', bg: 'bg-blue-50', trend: '' },
    { label: 'Avg Accuracy', value: '0%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '' },
    { label: 'Conceptual Depth', value: 'Level 0', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50', trend: '' },
    { label: 'Study Hours', value: '0h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '' },
  ];

  const trendData = [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 72 },
    { name: 'Wed', score: 68 },
    { name: 'Thu', score: 85 },
    { name: 'Fri', score: 82 },
    { name: 'Sat', score: 90 },
    { name: 'Sun', score: 88 },
  ];

  const mappedSubjectData = (() => {
    const list = (subjectRadar || []).map((item: any) => {
      const name = item.subject_name || item.subject || 'Unknown';
      const rawVal = item.weighted_percentage !== undefined ? item.weighted_percentage : (item.percentage !== undefined ? item.percentage : (item.score !== undefined ? item.score : item.accuracy));
      const val = typeof rawVal === 'string' ? parseFloat(rawVal) : Number(rawVal);
      return {
        subject: name,
        value: isNaN(val) ? 0 : val,
        full: 100
      };
    });

    // RadarChart requires at least 3 subjects to render a polygon.
    // If we have fewer, fill with default subjects.
    if (list.length < 3) {
      const defaults = ['Physics', 'Chemistry', 'Biology', 'English', 'Math'];
      for (const def of defaults) {
        if (!list.some(item => item.subject.toLowerCase() === def.toLowerCase())) {
          list.push({ subject: def, value: 0, full: 100 });
        }
        if (list.length >= 5) break;
      }
    }
    return list;
  })();

  const totalVivas = cardsData ? Number(cardsData.total_viva || 0) : 0;
  const hasAttempted = totalVivas > 0;

  const strongestSubject = mappedSubjectData.reduce((prev: any, current: any) => (prev.value > current.value) ? prev : current, { subject: 'Various Subjects', value: 0 });
  const strongestSubjectName = strongestSubject.subject;
  const performanceAdjective = strongestSubject.value >= 80 ? 'excellent' : strongestSubject.value >= 60 ? 'good' : 'developing';
  
  const weakChapterNames = weakChapters.slice(0, 2).map((c: any) => c.chapter_name || c.name || c.subject_name).filter(Boolean).join(' and ');
  const dynamicParagraph = weakChapterNames 
    ? `Based on your recent vivas, you demonstrate solid understanding overall, but could improve specifically in ${weakChapterNames}.`
    : `Based on your recent vivas, you demonstrate growing understanding across your subjects. Keep practicing to maintain your mastery!`;

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen pb-12 sm:pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 sm:py-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl group transition-transform hover:rotate-6 shrink-0">
              <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Conceptual Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">Detailed analytics of your performance and conceptual growth.</p>
            </div>
          </div>

          {/* User's original commented header buttons - Restored */}
          {/* <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 text-sm flex items-center gap-2 border border-slate-200">
                <Calendar className="w-4 h-4" /> Last 30 Days
             </div>
             <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-blue-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Full Insight
             </button>
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content Area (Left Side: Cards & Radar) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {kpiData.map((kpi, i) => (
                <div key={i} className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                  <div className='flex justify-between'> 
                    <div className="relative z-10">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">{kpi.label}</div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{kpi.value}</div>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center mt-2 sm:mt-4 transition-transform group-hover:scale-110`}>
                      <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Momentum Chart - Restored as Commented */}
            {/* <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-amber-500" /> Performance Momentum
                   </h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Daily Accuracy Trend</p>
                </div>
                <div className="flex gap-2">
                   {['W', 'M', 'Y'].map(f => (
                     <button key={f} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${f === 'W' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>{f}</button>
                   ))}
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis 
                      hide={true}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                      cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div> */}

            {/* Subject Mastery Radar */}
            <div className="bg-slate-900 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                  <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                        <Award className="w-3 h-3" /> Mastery Analysis
                     </div>
                     <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                       {hasAttempted ? (
                         <>
                           Your conceptual focus is <span className="text-blue-400">{performanceAdjective}</span> in {strongestSubjectName}.
                         </>
                       ) : (
                         <>
                           Ready to measure your <span className="text-blue-400">conceptual mastery</span>?
                         </>
                       )}
                     </h3>
                     <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                       {hasAttempted 
                         ? dynamicParagraph 
                         : "Attempt a Viva session to view a comprehensive breakdown of your strengths, performance metrics, and key focus areas here."
                       }
                     </p>
                     
                     {/* Restored Commented Button */}
                     {/* <div className="flex gap-4 pt-2">
                        <button className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-blue-400 hover:text-white transition-all">
                           Improve Chemistry <ArrowRight className="w-4 h-4" />
                        </button>
                     </div> */}
                  </div>
 
                  <div className="w-full max-w-[300px] h-[260px] sm:h-[300px] relative mx-auto">
                    {subjectRadar && subjectRadar.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mappedSubjectData}>
                           <PolarGrid stroke="#ffffff20" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar 
                             name="Mastery" 
                             dataKey="value" 
                             stroke="#3B82F6" 
                             fill="#3B82F6" 
                             fillOpacity={0.6}
                             animationDuration={2000}
                           />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center p-6 text-center group-hover:border-blue-400/50 transition-colors">
                        <Mic className="w-10 h-10 text-white/20 mb-4" />
                        <p className="text-white/60 text-sm font-bold">Please attempt the viva first</p>
                        <p className="text-white/30 text-[10px] mt-1 uppercase tracking-widest font-black">No analytics available</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Sidebar (Weak Topics) */}
          <div className="h-full space-y-8">
             {/* Gauges Section - Restored as Commented */}
             {/* <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center gap-8">
                <PerformanceGauge value={cardsData?.consistency || 0} label="Consistency" color="#3B82F6" />
                <PerformanceGauge value={cardsData?.depth_factor || 0} label="Depth Factor" color="#8B5CF6" />
                <div className="w-full pt-6 border-t border-slate-50">
                   <div className="flex items-center justify-between text-xs font-bold mb-3">
                      <span className="text-slate-400 uppercase tracking-widest">Growth Forecast</span>
                      <span className="text-emerald-500">+15% Expected</span>
                   </div>
                   <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                   </div>
                </div>
             </div> */}

             {/* Weak Chapters - Restored as Commented */}
             {/* <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl mb-8">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-rose-500" /> Weak Chapters
                </h3>
                <div className="space-y-4">
                   {weakChapters.slice(0, 3).map((chapter: any, index: number) => (
                     <div key={index} className="group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                           <div>
                              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{chapter.subject_name || 'Subject'}</div>
                              <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{chapter.chapter_name || chapter.name || 'Chapter'}</div>
                           </div>
                           <div className="text-xl font-black text-slate-900">{chapter.score || chapter.accuracy || 0}%</div>
                        </div>
                     </div>
                   ))}
                   {weakChapters.length === 0 && (
                     <div className="text-sm text-slate-500 text-center py-4">No weak chapters found.</div>
                   )}
                </div>
             </div> */}

             {/* Weak Topics */}
             <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl flex flex-col">
                <h3 className="font-black text-slate-900 mb-6 sm:mb-8 flex items-center gap-2">
                   <Target className="w-5 h-5 text-rose-500" /> Weak Topics
                </h3>
                <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px] lg:max-h-none">
                   {weakTopics.slice(0, 8).map((topic: any, index: number) => (
                     <div key={index} className="group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-1">
                           <div>
                              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{topic.chapter_name || 'Chapter'}</div>
                              <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{topic.topic_name || topic.name || 'Topic'}</div>
                           </div>
                           <div className="text-xl font-black text-slate-900">{topic.score || topic.accuracy || 0}%</div>
                        </div>
                     </div>
                   ))}
                    {weakTopics.length === 0 && (
                      <div className="text-sm text-slate-500 text-center py-10 flex flex-col items-center gap-3">
                         <Sparkles className="w-8 h-8 text-slate-200" />
                         {hasAttempted ? "No weak topics found." : "No data available. Attempt a viva to start tracking."}
                      </div>
                    )}
                </div>
             </div>

             {/* Pro Banner - Restored as Commented */}
             {/* <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden group">
                <Sparkles className="absolute -top-2 -right-2 w-16 h-16 text-white/20 group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="font-black text-lg mb-2">Ready for a real challenge?</h4>
                <p className="text-white/80 text-xs mb-6 font-medium">Try our High-Depth Vivas to push your boundaries.</p>
                <button className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-white hover:text-orange-600 transition-all">
                   GO PRO
                </button>
             </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
