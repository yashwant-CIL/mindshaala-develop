import { useState, useEffect } from 'react';
import { VivaService } from '../services/VivaService';
import { useCourse } from '../context/CourseContext';
import { 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  CircleSlash, 
  Award,
  Calendar,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

interface VivaDashboardProps {
  onNavigate: (page: string) => void;
}

// Custom Semi-Circular Gauge Component
const ModernGauge = ({ value, label, color, subLabel }: { value: number, label: string, color: string, subLabel?: string }) => {
  const data = [
    { value: value, fill: color },
    { value: 100 - value, fill: '#F3F4F6' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28 overflow-hidden">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={65}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center">
          <span className="text-xl font-bold text-gray-900 tracking-tight">{value}%</span>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.1em]">{label}</span>
        </div>
      </div>
      {subLabel && <p className="text-xs text-gray-400 mt-1 font-medium italic">{subLabel}</p>}
    </div>
  );
};

export function VivaDashboard({ onNavigate }: VivaDashboardProps) {
  const { subscriptionId } = useCourse();
  const [cardsData, setCardsData] = useState<any>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId || !subscriptionId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [cardsRes, subjectRes, historyRes] = await Promise.all([
          VivaService.getVivaDashboardCards(userId, subscriptionId),
          VivaService.getVivaDashboardSubjectwisePerformance(userId, subscriptionId),
          VivaService.getVivaHistory(userId),
        ]);

        setCardsData(cardsRes?.data || cardsRes || null);
        setSubjectPerformance(subjectRes?.data || (Array.isArray(subjectRes) ? subjectRes : []));
        setHistory(historyRes?.data || (Array.isArray(historyRes) ? historyRes : []));
      } catch (error) {
        console.error("Error fetching viva dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [subscriptionId]);

const formatTime = (seconds:any) => {
  if (!seconds) return '0s';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let result = '';

  if (hrs > 0) result += `${hrs}h `;
  if (mins > 0 || hrs > 0) result += `${mins}m `;
  result += `${secs}s`;

  return result.trim();
};

const formatScore = (score:any) => {
  if (score === null || score === undefined) return '0.00';
  return Number(score).toFixed(2);
};

const formatDate = (dateString: any) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTimeFromDate = (dateString: any) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
};


  // Sample Data for KPIs
  /*
  const kpiData = [
    { 
      label: 'Engagement Time', 
      value: '12h 45m', 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      trend: '+12%', 
      trendColor: 'text-green-600',
      description: 'Active learning duration'
    },
    { 
      label: 'Curriculum Depth', 
      value: '450', 
      icon: HelpCircle, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50', 
      trend: '+45', 
      trendColor: 'text-green-600',
      description: 'Questions encountered'
    },
    { 
      label: 'Critical Gaps', 
      value: '45', 
      icon: CircleSlash, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50', 
      trend: '-8%', 
      trendColor: 'text-green-600',
      description: 'Unattempted concepts'
    },
    { 
      label: 'Mastery Rate', 
      value: '405', 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      trend: 'Top 5%', 
      trendColor: 'text-blue-600',
      description: 'Successfully solved'
    },
    { 
      label: 'Focus Penalty', 
      value: '12', 
      icon: Zap, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      trend: '+2', 
      trendColor: 'text-red-600',
      description: 'Skipped items'
    },
    { 
      label: 'Aggregated Score', 
      value: '382/500', 
      icon: Award, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      trend: 'Gold', 
      trendColor: 'text-purple-600',
      description: 'Overall point tally'
    },
  ];
  */

  const defaultKpiData = [
    { label: 'Engagement Time', value: '0h 0m', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', trend: '', trendColor: 'text-green-600', description: 'Active learning duration' },
    { label: 'Curriculum Depth', value: '0', icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '', trendColor: 'text-green-600', description: 'Questions encountered' },
    { label: 'Critical Gaps', value: '0', icon: CircleSlash, color: 'text-rose-600', bg: 'bg-rose-50', trend: '', trendColor: 'text-green-600', description: 'Unattempted concepts' },
    { label: 'Mastery Rate', value: '0', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '', trendColor: 'text-blue-600', description: 'Successfully solved' },
    { label: 'Focus Penalty', value: '0', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', trend: '', trendColor: 'text-red-600', description: 'Skipped items' },
    { label: 'Aggregated Score', value: '0/0', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', trend: '', trendColor: 'text-purple-600', description: 'Overall point tally' },
  ];

  const kpiData = cardsData ? [
    { label: 'Total Test Time',  value: formatTime(cardsData.TEST_TIME) || '0h 0m', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', trend: cardsData.engagement_trend || '', trendColor: 'text-green-600', description: 'Active learning duration' },
    { label: 'Total Questions', value: cardsData.OVERALL_QUESTION_COUNT || '0', icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: cardsData.curriculum_trend || '', trendColor: 'text-green-600', description: 'Questions encountered' },
    { label: 'Average Score', value: formatScore(cardsData.OBTAINED_SCORE) || '0', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', trend: cardsData.gaps_trend || '', trendColor: 'text-green-600', description: 'Unattempted concepts' },
    { label: 'Total Attempted', value: cardsData.TOTAL_ATTEMPTED || '0', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: cardsData.mastery_trend || '', trendColor: 'text-blue-600', description: 'Successfully solved' },
    { label: 'Total Unattempted', value: cardsData.TOTAL_UNATTEMPTED || '0', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', trend: cardsData.penalty_trend || '', trendColor: 'text-red-600', description: 'Skipped items' },
    { label: 'Total Skipped', value: cardsData.TOTAL_SKIPPED || '0', icon: CircleSlash, color: 'text-rose-600', bg: 'bg-rose-50', trend: cardsData.score_trend || '', trendColor: 'text-purple-600', description: 'Overall point tally' },
  ] : defaultKpiData;


  

  // Subject-wise Accuracy
  /*
  const subjectAccuracyData = [
    { name: 'Physics', value: 88, fill: '#4F46E5', full: 100 },
    { name: 'Chemistry', value: 75, fill: '#EC4899', full: 100 },
    { name: 'Biology', value: 92, fill: '#10B981', full: 100 },
    { name: 'Mathematics', value: 80, fill: '#F59E0B', full: 100 },
  ];
  */

  const colors = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#14B8A6'];
  const subjectAccuracyData = subjectPerformance && subjectPerformance.length > 0 
    ? subjectPerformance.map((item: any, idx: number) => ({
        subject_name: item.subject_name || item.name || 'Unknown',
        value: formatScore(item.total_score),
        fill: colors[idx % colors.length],
        full: 100
      }))
    : [];

  // Radar Data
  const radarData = [
    { subject: 'Physics', time: 85, score: 90 },
    { subject: 'Chemistry', time: 70, score: 75 },
    { subject: 'Biology', time: 95, score: 92 },
    { subject: 'Mathematics', time: 60, score: 80 },
    { subject: 'English', time: 80, score: 85 },
  ];

  // Exam History
  /*
  const examHistory = [
    { id: 1, date: '2024-03-25', subject: 'Physics', questions: 50, score: '45/50', accuracy: '90%', status: 'Exceptional' },
    { id: 2, date: '2024-03-24', subject: 'Chemistry', questions: 40, score: '32/40', accuracy: '80%', status: 'Good' },
    { id: 3, date: '2024-03-22', subject: 'Biology', questions: 60, score: '58/60', accuracy: '96%', status: 'Exceptional' },
    { id: 4, date: '2024-03-20', subject: 'Mathematics', questions: 45, score: '38/45', accuracy: '84%', status: 'Good' },
    { id: 5, date: '2024-03-18', subject: 'Physics', questions: 50, score: '42/50', accuracy: '84%', status: 'Good' },
    { id: 6, date: '2024-03-15', subject: 'English', questions: 30, score: '28/30', accuracy: '93%', status: 'Great' },
  ];
  */

  const examHistory = history && history.length > 0
    ? history.map((item: any, idx: number) => {
        let computedStatus = 'Good';
        const percent = item.percentage || item.accuracy || 0;
        if (percent > 90) computedStatus = 'Exceptional';
        else if (percent > 80) computedStatus = 'Great';
        else if (percent > 60) computedStatus = 'Good';
        else computedStatus = 'Needs Work';

        return {
          id: item.session_id || idx,
          date: formatDate(item.started_at || item.created_at),
          time: formatTimeFromDate(item.started_at || item.created_at),
          subject: item.assessment_name || item.exam_name || item.subject_name || 'Unknown',
          questions: item.total_questions,
          score: item.total_score,
          accuracy: `${percent}%`,
          status: item.status || computedStatus
        };
      })
    : [];

   
  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-12">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800 px-8 py-4 mb-8 shadow-xl relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl" />
        
        <div className=" mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Viva Performance Analytics</h1>
              <p className="text-blue-100 font-medium text-sm">Elevate your readiness for oral assessments</p>
            </div>
          </div>
          {/* <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/20 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Month
            </button>
            <button className="px-5 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all shadow-lg text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Download Report
            </button>
          </div> */}
        </div>
      </div>

      <div className=" mx-auto px-8 space-y-8">
        
        {/* Row 1: KPI Grid & Gauges Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left: KPI Cards (3 columns x 2 rows) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kpiData.map((kpi, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform duration-300`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center gap-0.5 ${kpi.trendColor} font-bold text-xs`}>
                    {kpi.trend}
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{kpi.label}</p>
                  <div className="h-1 w-8 bg-gray-100 rounded-full group-hover:w-full transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Modern Performance Gauges */}
          {/* <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600" />
                Vital Stat
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">Live Update</span>
            </div>
            
            <div className="flex flex-col gap-6 w-full items-center">
              <ModernGauge 
                value={85} 
                label="Accuracy" 
                color="#6366F1" 
                subLabel="Above Class Avg"
              />
              <ModernGauge 
                value={92} 
                label="Attempt" 
                color="#10B981" 
                subLabel="Steady Progress"
              />
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl w-full border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 text-center font-medium leading-relaxed">
                You're in the <span className="text-indigo-600 font-bold">top 12%</span> of students. Your accuracy pulse is exceptionally strong this week.
              </p>
            </div>
          </div>*/}
        </div> 

        {/* Row 2: Subject Pulse & Efficiency Radar Side-by-Side (2/3 vs 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Subject-wise Bar Visualization (2/3 width) */}
          <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-500" />
              Subject Pulse
            </h3>
            <div className="space-y-6">
              {subjectAccuracyData.map((subject, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">{subject.subject_name}</span>
                    <span className="text-xs font-bold text-gray-900" style={{ color: subject.fill }}>{subject.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${subject.value}%`, 
                        backgroundColor: subject.fill,
                        boxShadow: `0 0 10px ${subject.fill}40`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Consistency</p>
                <p className="text-sm font-bold text-indigo-600 font-mono">High</p>
              </div>
              <div className="text-center border-x border-gray-100 px-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Top Subject</p>
                <p className="text-sm font-bold text-emerald-600 font-mono">Biology</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Alerts</p>
                <p className="text-sm font-bold text-rose-500 font-mono">0</p>
              </div>
            </div> */}
          </div>

          {/* Right: Efficiency Radar (1/3 width) */}
          {/* <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Readiness Radar
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#F1F5F9" strokeWidth={2} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Mastery"
                    dataKey="score"
                    stroke="#6366F1"
                    strokeWidth={3}
                    fill="#6366F1"
                    fillOpacity={0.15}
                  />
                  <Radar
                    name="Time Utility"
                    dataKey="time"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="#10B981"
                    fillOpacity={0.1}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div> */}
        </div>

        {/* History Table - Structured Professional Look */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="px-10 py-7 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Latest Viva Logs
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Historical audit trail of your performance</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Data Fetching</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Assessment Name</th>
                  <th className="px-10 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Started At</th>
                  <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Obtained Marks</th>
                  <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Percentage</th>
                  <th className="px-10 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-10 py-8 text-center text-gray-500 font-medium">
                      No history found.
                    </td>
                  </tr>
                )}
                {examHistory.slice(0, 5).map((exam) => (
                  <tr key={exam.id} className="hover:bg-blue-50/50 transition-all duration-200 group">
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-[11px] group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors inline-block">
                        {exam.subject}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{exam.date}</span>
                        <span className="text-[11px] text-gray-500 font-medium">{exam.time}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">{exam.score}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-4">
                        {/* <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden shrink-0 border border-gray-200/50">
                          <div 
                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                            style={{ width: exam.accuracy }}
                          />
                        </div> */}
                        <span className="text-xs font-bold text-gray-700 min-w-[35px]">{exam.accuracy}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                        exam.status === 'Exceptional' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        exam.status === 'Great' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-10 py-7 bg-gray-50/50 flex justify-center border-t border-gray-100">
            <button 
              onClick={() => onNavigate('viva-result')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all group py-2.5 px-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5"
            >
              Analyze Full Performance History
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
