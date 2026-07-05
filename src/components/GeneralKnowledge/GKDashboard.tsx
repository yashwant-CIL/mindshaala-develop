import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  Sparkles,
  BookOpen,
  Calendar,
  AlertCircle,
  GraduationCap,
  BarChart2,
  CheckCircle2,
  XCircle,
  Minus
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
  Area,
} from 'recharts';

interface GKDashboardProps {
  onNavigate: (page: string) => void;
  onSelectSubcategoryForExam?: (category: string, subcategory: string) => void;
}

interface GKHistoryItem {
  id: string;
  category: string;
  subcategory: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  date: string;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  streak: number;
  accuracy: number;
  accuracyByDifficulty: { Easy: number; Medium: number; Hard: number };
  averageTime: number;
}

export default function GKDashboard({ onNavigate }: GKDashboardProps) {
  const [history, setHistory] = useState<GKHistoryItem[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);

  useEffect(() => {
    const rawHistory = localStorage.getItem('gk_exam_history');
    if (rawHistory) {
      setHistory(JSON.parse(rawHistory));
      setIsDemoData(false);
    } else {
      const demoHistory: GKHistoryItem[] = [
        { id: 'demo_1', category: 'History', subcategory: 'Indian Freedom Struggle', score: 8, totalQuestions: 10, percentage: 80, timeSpent: 180, date: '19 Jun, 2026 12:30 PM', correctCount: 8, incorrectCount: 2, skippedCount: 0, streak: 5, accuracy: 80, accuracyByDifficulty: { Easy: 100, Medium: 80, Hard: 50 }, averageTime: 18 },
        { id: 'demo_2', category: 'Indian Polity', subcategory: 'Constitution of India', score: 6, totalQuestions: 10, percentage: 60, timeSpent: 210, date: '18 Jun, 2026 04:15 PM', correctCount: 6, incorrectCount: 3, skippedCount: 1, streak: 3, accuracy: 66, accuracyByDifficulty: { Easy: 80, Medium: 50, Hard: 33 }, averageTime: 21 },
        { id: 'demo_3', category: 'Computer Knowledge', subcategory: 'Artificial Intelligence', score: 9, totalQuestions: 10, percentage: 90, timeSpent: 120, date: '17 Jun, 2026 10:00 AM', correctCount: 9, incorrectCount: 1, skippedCount: 0, streak: 8, accuracy: 90, accuracyByDifficulty: { Easy: 100, Medium: 100, Hard: 66 }, averageTime: 12 },
        { id: 'demo_4', category: 'Sports', subcategory: 'Cricket', score: 7, totalQuestions: 10, percentage: 70, timeSpent: 150, date: '15 Jun, 2026 06:45 PM', correctCount: 7, incorrectCount: 3, skippedCount: 0, streak: 4, accuracy: 70, accuracyByDifficulty: { Easy: 100, Medium: 60, Hard: 0 }, averageTime: 15 },
      ];
      setHistory(demoHistory);
      setIsDemoData(true);
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your GK exam history? This cannot be undone.")) {
      localStorage.removeItem('gk_exam_history');
      setHistory([]);
      setIsDemoData(false);
    }
  };

  const totalExams = history.length;
  const avgPercentage = totalExams > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams) : 0;
  const totalQuestions = history.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const totalCorrect = history.reduce((acc, curr) => acc + curr.correctCount, 0);
  const totalIncorrect = history.reduce((acc, curr) => acc + curr.incorrectCount, 0);
  const totalSkipped = history.reduce((acc, curr) => acc + curr.skippedCount, 0);
  const totalTimeSpent = history.reduce((acc, curr) => acc + curr.timeSpent, 0);
  const avgTimePerQuestion = totalCorrect + totalIncorrect > 0 ? Math.round(totalTimeSpent / (totalCorrect + totalIncorrect)) : 0;

  const categoryScores: Record<string, { total: number; correct: number; count: number }> = {};
  history.forEach(item => {
    if (!categoryScores[item.category]) categoryScores[item.category] = { total: 0, correct: 0, count: 0 };
    categoryScores[item.category].total += item.totalQuestions;
    categoryScores[item.category].correct += item.correctCount;
    categoryScores[item.category].count += 1;
  });

  const categoryRadarData = Object.keys(categoryScores).map(cat => ({
    subject: cat,
    value: Math.round((categoryScores[cat].correct / categoryScores[cat].total) * 100),
    full: 100
  }));

  const mappedRadarData = categoryRadarData.length >= 3 ? categoryRadarData : [
    { subject: 'History', value: 80, full: 100 },
    { subject: 'Indian Polity', value: 60, full: 100 },
    { subject: 'Science', value: 75, full: 100 },
    { subject: 'Geography', value: 65, full: 100 },
    { subject: 'Sports', value: 70, full: 100 },
  ];

  let strongestCategory = 'Not Analyzed', strongestValue = -1;
  let weakestCategory = 'Not Analyzed', weakestValue = 101;
  Object.keys(categoryScores).forEach(cat => {
    const pct = (categoryScores[cat].correct / categoryScores[cat].total) * 100;
    if (pct > strongestValue) { strongestValue = pct; strongestCategory = cat; }
    if (pct < weakestValue) { weakestValue = pct; weakestCategory = cat; }
  });
  if (totalExams === 0) { strongestCategory = 'None'; weakestCategory = 'None'; }
  else if (Object.keys(categoryScores).length === 1) { strongestCategory = Object.keys(categoryScores)[0]; weakestCategory = 'None'; }

  const trendChartData = [...history].slice(0, 7).reverse().map((item, idx) => ({ name: `Ex ${idx + 1}`, score: item.percentage, subcategory: item.subcategory }));

  let totalEasyCorrect = 0, totalEasyCount = 0, totalMediumCorrect = 0, totalMediumCount = 0, totalHardCorrect = 0, totalHardCount = 0;
  history.forEach(item => {
    totalEasyCorrect += (item.accuracyByDifficulty?.Easy || 0); totalEasyCount += 100;
    totalMediumCorrect += (item.accuracyByDifficulty?.Medium || 0); totalMediumCount += 100;
    totalHardCorrect += (item.accuracyByDifficulty?.Hard || 0); totalHardCount += 100;
  });
  const easyAccuracy = totalEasyCount > 0 ? Math.round((totalEasyCorrect / totalEasyCount) * 100) : 80;
  const mediumAccuracy = totalMediumCount > 0 ? Math.round((totalMediumCorrect / totalMediumCount) * 100) : 60;
  const hardAccuracy = totalHardCount > 0 ? Math.round((totalHardCorrect / totalHardCount) * 100) : 40;
  const paceDescriptor = avgTimePerQuestion <= 15 ? 'Fast (Speed-focused)' : avgTimePerQuestion <= 25 ? 'Steady (Balanced)' : 'Careful (Detail-focused)';

  const kpiCards = [
    { label: 'Exams Attempted', value: totalExams, sub: 'Practice modules', icon: BookOpen, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', accent: 'border-l-indigo-500' },
    { label: 'Avg Accuracy', value: `${avgPercentage}%`, sub: 'Passing: 60%', icon: Target, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', accent: 'border-l-emerald-500' },
    { label: 'Practice Duration', value: `${Math.floor(totalTimeSpent / 60)}m ${totalTimeSpent % 60}s`, sub: 'Total time active', icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', accent: 'border-l-amber-500' },
    { label: 'Questions Solved', value: totalQuestions, sub: `${totalCorrect}✓  ${totalIncorrect}✗  ${totalSkipped}–`, icon: Activity, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', accent: 'border-l-purple-500' },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-20" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/40 via-white to-blue-50/30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">GK Analytical Dashboard</h1>
                {isDemoData && (
                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[9px] uppercase tracking-widest rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Demo
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm font-medium">Performance metrics, category mastery, and time efficiency analysis.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('gk-exams')}
            className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-widest uppercase transition-all shadow-md shadow-indigo-200 flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            Take New Exam
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 mt-8 space-y-8 max-w-screen-xl mx-auto">

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {kpiCards.map((card, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 p-5 border-l-4 ${card.accent}`}>
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{card.label}</span>
                <span className="text-2xl font-black text-slate-800 block leading-tight mt-0.5">{card.value}</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{card.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-7">

          {/* Radar Chart: Category Mastery — light theme */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="font-black text-slate-800 text-sm uppercase tracking-wide">Category Mastery</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-snug">
                  {totalExams > 0 && strongestCategory !== 'None'
                    ? <> Strongest: <span className="text-indigo-600">{strongestCategory}</span></>
                    : 'Take exams to map your strengths'}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {weakestCategory !== 'None' && weakestCategory !== 'Not Analyzed'
                    ? <> Focus on <span className="text-rose-500 font-bold">{weakestCategory}</span> to boost your average.</>
                    : 'Attempt History, Polity, Geography & Science to build a balanced profile.'}
                </p>
                <div className="flex gap-5 pt-2 border-t border-slate-100 text-xs font-bold text-slate-400">
                  <div>
                    <span className="text-emerald-600 font-black block text-sm">{strongestCategory !== 'None' ? strongestCategory : 'N/A'}</span>
                    <span>Top Strength</span>
                  </div>
                  <div className="border-l border-slate-200 pl-5">
                    <span className="text-rose-500 font-black block text-sm">{weakestCategory !== 'None' ? weakestCategory : 'N/A'}</span>
                    <span>Area to Improve</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-[280px] h-[260px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={mappedRadarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Radar name="Accuracy" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.18} animationDuration={1200} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Difficulty Metrics */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">Difficulty Metrics</span>
              </div>

              {[
                { label: 'Easy Questions', value: easyAccuracy, color: '#10b981', bg: 'bg-emerald-500' },
                { label: 'Medium Questions', value: mediumAccuracy, color: '#f59e0b', bg: 'bg-amber-400' },
                { label: 'Hard Questions', value: hardAccuracy, color: '#f43f5e', bg: 'bg-rose-500' },
              ].map(({ label, value, bg }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>{label}</span>
                    <span className="text-slate-800 font-black">{value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${bg} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pacing Index</span>
              <div className="text-sm font-black text-slate-800">{paceDescriptor}</div>
              <p className="text-slate-500 text-[11px] mt-1 font-medium leading-relaxed">
                Avg <strong className="text-slate-700">{avgTimePerQuestion}s</strong> per question.{' '}
                {avgTimePerQuestion <= 15 ? 'Quick responses — keep up the recall speed!' : 'Optimal pacing for careful evaluation.'}
              </p>
            </div>
          </div>
        </div>

        {/* Trend Chart + History Log */}
        <div className="grid lg:grid-cols-3 gap-7">

          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide block">Performance Momentum</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Score trend over recent exams</span>
              </div>
            </div>
            <div className="h-[220px] w-full">
              {trendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="colorGkScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '10px 14px' }} />
                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGkScore)" animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-center">
                  <TrendingUp className="w-8 h-8 text-slate-200" />
                  <p className="text-slate-500 text-sm font-bold">No exam attempts logged yet</p>
                  <p className="text-slate-400 text-xs">Attempt tests to map accuracy charts.</p>
                </div>
              )}
            </div>
          </div>

          {/* History Log */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex flex-col" style={{ maxHeight: 380 }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">Exam History</span>
              </div>
              {!isDemoData && history.length > 0 && (
                <button onClick={handleClearHistory} className="text-[10px] font-black text-rose-500 uppercase tracking-wider hover:underline cursor-pointer">
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
              {history.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-100 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block truncate">{log.category}</span>
                    <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">{log.subcategory}</span>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">{log.date}</span>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`inline-block px-2.5 py-1 text-xs font-black rounded-lg ${
                      log.percentage >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      log.percentage >= 60 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {log.percentage}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">{log.score}/{log.totalQuestions}</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 py-10">
                  <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-xs font-bold">No history available</p>
                  <p className="text-[10px] mt-0.5">Start an exam to populate logs.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Question Breakdown Summary */}
        {totalQuestions > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-800 text-sm uppercase tracking-wide">Overall Question Breakdown</span>
            </div>
            <div className="grid grid-cols-3 gap-5 text-center">
              {[
                { label: 'Correct', value: totalCorrect, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Incorrect', value: totalIncorrect, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                { label: 'Skipped', value: totalSkipped, icon: Minus, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className={`p-5 rounded-2xl border ${bg} ${border} flex flex-col items-center gap-2`}>
                  <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center border ${border}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-3xl font-black ${color}`}>{value}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
