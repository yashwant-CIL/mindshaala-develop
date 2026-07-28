import { useState, useEffect, useContext } from 'react';
import { AITutorService } from '../../services/AITutorService';
import { useCourse } from '../../context/CourseContext';
import { UserContext } from '../../App';
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
  Brain,
  LayoutDashboard,
  Mic,
  ArrowRight
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

// Custom Full-Circular Progress Ring Component
const PerformanceCircle = ({ value, label, color }: { value: number, label: string, color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1 min-w-[140px] hover:shadow-md transition-shadow">
      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="56" cy="56" r={radius} className="stroke-slate-100 fill-none" strokeWidth="8" />
          <circle 
            cx="56" 
            cy="56" 
            r={radius} 
            className="fill-none transition-all duration-1000 ease-out" 
            strokeWidth="8" 
            stroke={color} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-2xl font-black text-slate-800">{value}%</span>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
};

export default function AITutorDashboard() {
  const { subscriptionId } = useCourse();
  const { state: userState } = useContext(UserContext) || { state: {} };
  const [cardsData, setCardsData] = useState<any>(null);
  const [weakChapters, setWeakChapters] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [subjectRadar, setSubjectRadar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userIdVal = localStorage.getItem('user_id') || userState?.user_id;
      const userId = userIdVal ? parseInt(String(userIdVal), 10) : 0;
      if (!userId || !subscriptionId) {
        if (!userId) toast.error("User not logged in");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [cardsRes, chaptersRes, topicsRes, radarRes] = await Promise.all([
          AITutorService.DashboardCards(userId, subscriptionId),
          AITutorService.DashboardWeakChapters(userId, subscriptionId),
          AITutorService.DashboardWeakTopics(userId, subscriptionId),
          AITutorService.DashboardSubjectRadar(userId, subscriptionId),
        ]);

        setCardsData(cardsRes?.data || cardsRes || null);
        setWeakChapters(chaptersRes?.data || (Array.isArray(chaptersRes) ? chaptersRes : []));
        setWeakTopics(topicsRes?.data || (Array.isArray(topicsRes) ? topicsRes : []));
        setSubjectRadar(radarRes?.data || (Array.isArray(radarRes) ? radarRes : []));
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
    { label: 'Total Sessions', value: cardsData.total_viva || '0', icon: Brain, color: 'text-violet-600', bg: 'bg-violet-50', trend: cardsData.vivas_trend || '' },
    { label: 'Avg Accuracy', value: `${cardsData.avg_viva_accuracy || 0}%`, icon: Target, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', trend: cardsData.accuracy_trend || '' },
  ] : [
    { label: 'Total Sessions', value: '0', icon: Brain, color: 'text-violet-600', bg: 'bg-violet-50', trend: '' },
    { label: 'Avg Accuracy', value: '0%', icon: Target, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', trend: '' },
  ];

  const mappedSubjectData = subjectRadar && subjectRadar.length > 0 
    ? subjectRadar.map((item: any) => ({
        subject: item.subject_name || item.subject || 'Unknown',
        value: item.weighted_percentage || item.value || item.mastery || 0,
        full: 100
      }))
    : [
        { subject: 'Physics', value: 0, full: 100 },
        { subject: 'Chemistry', value: 0, full: 100 },
        { subject: 'Biology', value: 0, full: 100 },
        { subject: 'English', value: 0, full: 100 },
        { subject: 'Math', value: 0, full: 100 },
      ];

  const strongestSubject = mappedSubjectData.reduce((prev: any, current: any) => (prev.value > current.value) ? prev : current, { subject: 'Various Subjects', value: 0 });
  const strongestSubjectName = strongestSubject.subject;
  const performanceAdjective = strongestSubject.value >= 80 ? 'excellent' : strongestSubject.value >= 60 ? 'good' : 'developing';
  
  const weakChapterNames = weakChapters.slice(0, 2).map((c: any) => c.chapter_name || c.name || c.subject_name).filter(Boolean).join(' and ');
  const dynamicParagraph = weakChapterNames 
    ? `Based on your recent AI Tutor sessions, you demonstrate solid understanding overall, but could improve specifically in ${weakChapterNames}.`
    : `Based on your recent AI Tutor sessions, you demonstrate growing understanding across your subjects. Keep practicing to maintain your mastery!`;

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen pb-20">
      {/* Premium Banner Header */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-violet-100 via-fuchsia-50 to-indigo-100 rounded-[2.5rem] p-8 md:p-10 border border-violet-100 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm text-violet-600 flex items-center justify-center shadow-md">
                <Brain className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome to AI Tutor!</h1>
                <p className="text-slate-600 font-medium mt-1">Let's clear your conceptual doubts and check your accuracy today.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl text-xs font-bold text-violet-700 border border-violet-200 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-4 h-4 text-fuchsia-500" /> AI Coach Active
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          {/* Left Area: KPIs, Dials, & Radar */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kpiData.map((kpi, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</div>
                    <div className="text-3xl font-black text-slate-800">{kpi.value}</div>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <kpi.icon className="w-7 h-7" />
                  </div>
                </div>
              ))}
            </div>

            {/* Circular Dials Section */}
            <div className="flex flex-col sm:flex-row gap-6">
              <PerformanceCircle value={cardsData?.consistency || 0} label="Consistency Score" color="#8B5CF6" />
              <PerformanceCircle value={cardsData?.depth_factor || 0} label="Conceptual Depth" color="#EC4899" />
            </div>

            {/* Radar Card - White themed */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm group">
               <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-full text-[10px] font-black uppercase tracking-widest text-violet-600 border border-violet-100">
                        <Award className="w-3 h-3" /> Subject Mastery
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 leading-tight">
                       Your focus is <span className="text-violet-600">{performanceAdjective}</span> in {strongestSubjectName}.
                     </h3>
                     <p className="text-slate-400 text-sm leading-relaxed">{dynamicParagraph}</p>
                  </div>

                  <div className="w-full md:w-[260px] h-[260px] flex items-center justify-center bg-slate-50/50 rounded-3xl p-4">
                    {subjectRadar && subjectRadar.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mappedSubjectData}>
                           <PolarGrid stroke="#E2E8F0" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} />
                           <Radar 
                             name="Mastery" 
                             dataKey="value" 
                             stroke="#8B5CF6" 
                             fill="#C084FC" 
                             fillOpacity={0.3}
                             animationDuration={1500}
                           />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                        <Brain className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-slate-400 text-xs font-bold">No Radar Analytics Yet</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Sidebar: Weak Chapters and Weak Topics */}
          <div className="space-y-8">
             {/* Weak Chapters Accordion-styled list */}
             <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-fuchsia-500" /> Focus Chapters
                </h3>
                <div className="space-y-3">
                   {weakChapters.slice(0, 3).map((chapter: any, index: number) => (
                     <div key={index} className="p-4 bg-slate-50/50 hover:bg-violet-50/30 rounded-2xl border border-slate-100 transition-colors">
                        <div className="flex items-start justify-between">
                           <div>
                              <div className="text-[9px] font-black text-violet-500 uppercase tracking-widest">{chapter.subject_name || 'Subject'}</div>
                              <div className="font-bold text-slate-700 text-sm mt-0.5">{chapter.chapter_name || chapter.name || 'Chapter'}</div>
                           </div>
                           <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md">{chapter.score || chapter.accuracy || 0}%</span>
                        </div>
                     </div>
                   ))}
                   {weakChapters.length === 0 && (
                     <div className="text-sm text-slate-400 text-center py-4">All chapters in good standing!</div>
                   )}
                </div>
             </div>

             {/* Weak Topics */}
             <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                   <Target className="w-5 h-5 text-rose-500" /> Focus Topics
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                   {weakTopics.slice(0, 6).map((topic: any, index: number) => (
                     <div key={index} className="p-4 bg-slate-50/50 hover:bg-fuchsia-50/30 rounded-2xl border border-slate-100 transition-colors">
                        <div className="flex items-start justify-between">
                           <div className="flex-1 min-w-0">
                              <div className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest truncate">{topic.chapter_name || 'Chapter'}</div>
                              <div className="font-bold text-slate-700 text-xs mt-0.5 truncate">{topic.topic_name || topic.name || 'Topic'}</div>
                           </div>
                           <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md shrink-0 ml-2">{topic.score || topic.accuracy || 0}%</span>
                        </div>
                     </div>
                   ))}
                   {weakTopics.length === 0 && (
                     <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
                        <Sparkles className="w-6 h-6 text-slate-200" />
                        No focus topics. Excellent!
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
