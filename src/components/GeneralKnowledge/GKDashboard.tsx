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
  XCircle,
  HelpCircle,
  GraduationCap
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
  BarChart,
  Bar
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
  accuracyByDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
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
      // Use premium default/demo data for first time view
      const demoHistory: GKHistoryItem[] = [
        {
          id: 'demo_1',
          category: 'History',
          subcategory: 'Indian Freedom Struggle',
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          timeSpent: 180,
          date: '19 Jun, 2026 12:30 PM',
          correctCount: 8,
          incorrectCount: 2,
          skippedCount: 0,
          streak: 5,
          accuracy: 80,
          accuracyByDifficulty: { Easy: 100, Medium: 80, Hard: 50 },
          averageTime: 18
        },
        {
          id: 'demo_2',
          category: 'Indian Polity',
          subcategory: 'Constitution of India',
          score: 6,
          totalQuestions: 10,
          percentage: 60,
          timeSpent: 210,
          date: '18 Jun, 2026 04:15 PM',
          correctCount: 6,
          incorrectCount: 3,
          skippedCount: 1,
          streak: 3,
          accuracy: 66,
          accuracyByDifficulty: { Easy: 80, Medium: 50, Hard: 33 },
          averageTime: 21
        },
        {
          id: 'demo_3',
          category: 'Computer Knowledge',
          subcategory: 'Artificial Intelligence',
          score: 9,
          totalQuestions: 10,
          percentage: 90,
          timeSpent: 120,
          date: '17 Jun, 2026 10:00 AM',
          correctCount: 9,
          incorrectCount: 1,
          skippedCount: 0,
          streak: 8,
          accuracy: 90,
          accuracyByDifficulty: { Easy: 100, Medium: 100, Hard: 66 },
          averageTime: 12
        },
        {
          id: 'demo_4',
          category: 'Sports',
          subcategory: 'Cricket',
          score: 7,
          totalQuestions: 10,
          percentage: 70,
          timeSpent: 150,
          date: '15 Jun, 2026 06:45 PM',
          correctCount: 7,
          incorrectCount: 3,
          skippedCount: 0,
          streak: 4,
          accuracy: 70,
          accuracyByDifficulty: { Easy: 100, Medium: 60, Hard: 0 },
          averageTime: 15
        }
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

  // Aggregated Stats Calculation
  const totalExams = history.length;
  const avgPercentage = totalExams > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams) 
    : 0;
  
  const totalQuestions = history.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const totalCorrect = history.reduce((acc, curr) => acc + curr.correctCount, 0);
  const totalIncorrect = history.reduce((acc, curr) => acc + curr.incorrectCount, 0);
  const totalSkipped = history.reduce((acc, curr) => acc + curr.skippedCount, 0);
  const totalTimeSpent = history.reduce((acc, curr) => acc + curr.timeSpent, 0);
  const avgTimePerQuestion = totalCorrect + totalIncorrect > 0
    ? Math.round(totalTimeSpent / (totalCorrect + totalIncorrect))
    : 0;

  // Category wise scores grouping
  const categoryScores: Record<string, { total: number; correct: number; count: number }> = {};
  history.forEach(item => {
    if (!categoryScores[item.category]) {
      categoryScores[item.category] = { total: 0, correct: 0, count: 0 };
    }
    categoryScores[item.category].total += item.totalQuestions;
    categoryScores[item.category].correct += item.correctCount;
    categoryScores[item.category].count += 1;
  });

  const categoryRadarData = Object.keys(categoryScores).map(cat => ({
    subject: cat,
    value: Math.round((categoryScores[cat].correct / categoryScores[cat].total) * 100),
    full: 100
  }));

  // Fallback radar nodes if less than 3 categories
  const mappedRadarData = categoryRadarData.length >= 3 
    ? categoryRadarData 
    : [
        { subject: 'History', value: 80, full: 100 },
        { subject: 'Indian Polity', value: 60, full: 100 },
        { subject: 'Science', value: 75, full: 100 },
        { subject: 'Geography', value: 65, full: 100 },
        { subject: 'Sports', value: 70, full: 100 }
      ];

  // Strength and Weakness determination
  let strongestCategory = 'Not Analyzed';
  let strongestValue = -1;
  let weakestCategory = 'Not Analyzed';
  let weakestValue = 101;

  Object.keys(categoryScores).forEach(cat => {
    const pct = (categoryScores[cat].correct / categoryScores[cat].total) * 100;
    if (pct > strongestValue) {
      strongestValue = pct;
      strongestCategory = cat;
    }
    if (pct < weakestValue) {
      weakestValue = pct;
      weakestCategory = cat;
    }
  });

  // Default values if no history exists or single test
  if (totalExams === 0) {
    strongestCategory = 'None';
    weakestCategory = 'None';
  } else if (Object.keys(categoryScores).length === 1) {
    // If only one category attempted, populate placeholders or use that one
    strongestCategory = Object.keys(categoryScores)[0];
    weakestCategory = 'None';
  }

  // Trend analysis (up to 7 items in chronological order)
  const trendChartData = [...history]
    .slice(0, 7)
    .reverse()
    .map((item, idx) => ({
      name: `Ex ${idx + 1}`,
      score: item.percentage,
      subcategory: item.subcategory
    }));

  // Difficulty wise accuracy
  let totalEasyCorrect = 0, totalEasyCount = 0;
  let totalMediumCorrect = 0, totalMediumCount = 0;
  let totalHardCorrect = 0, totalHardCount = 0;

  history.forEach(item => {
    // Sum weights or assume standard count
    totalEasyCorrect += (item.accuracyByDifficulty?.Easy || 0);
    totalEasyCount += 100;
    totalMediumCorrect += (item.accuracyByDifficulty?.Medium || 0);
    totalMediumCount += 100;
    totalHardCorrect += (item.accuracyByDifficulty?.Hard || 0);
    totalHardCount += 100;
  });

  const easyAccuracy = totalEasyCount > 0 ? Math.round((totalEasyCorrect / totalEasyCount) * 100) : 80;
  const mediumAccuracy = totalMediumCount > 0 ? Math.round((totalMediumCorrect / totalMediumCount) * 100) : 60;
  const hardAccuracy = totalHardCount > 0 ? Math.round((totalHardCorrect / totalHardCount) * 100) : 40;

  // Pace descriptor
  const paceDescriptor = avgTimePerQuestion <= 15 ? 'Fast (Speed-focused)' : avgTimePerQuestion <= 25 ? 'Steady (Balanced)' : 'Careful (Detail-focused)';

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen pb-20">
      
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">GK Analytical Dashboard</h1>
              <p className="text-slate-500 font-medium">Detailed metrics, time efficiency analysis, and category strengths.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDemoData && (
              <span className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs rounded-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Demo Insights Active
              </span>
            )}
            <button 
              onClick={() => onNavigate('gk-exams')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-blue-200 flex items-center gap-2 hover:scale-[1.02]"
            >
              Take Practice Exam
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-10 space-y-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Exams */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exams Attempted</span>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{totalExams}</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Practice modules</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          {/* Average Accuracy */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Accuracy</span>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{avgPercentage}%</h3>
              <p className="text-xs text-emerald-500 font-bold mt-1">Passing standard: 60%</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* Time spent */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Practice Duration</span>
              <h3 className="text-3xl font-black text-slate-800 mt-1">
                {Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Total minutes active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Questions metrics */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Matrix</span>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{totalQuestions}</h3>
              <p className="text-xs text-indigo-500 font-bold mt-1">
                {totalCorrect} R / {totalIncorrect} W / {totalSkipped} S
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Charts & Key Diagnostics */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Radar Chart: Category Mastery (Left side - 2 cols) */}
          <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-5">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                  <Trophy className="w-3.5 h-3.5" /> Category Mastery
                </span>
                <h3 className="text-2xl font-black leading-snug">
                  {totalExams > 0 ? (
                    strongestCategory !== 'None' ? (
                      <>Your strongest conceptual focus is <span className="text-blue-400">{strongestCategory}</span>.</>
                    ) : (
                      <>Take a few more exams to map your category strengths.</>
                    )
                  ) : (
                    <>Analyze your strengths and weaknesses in real-time.</>
                  )}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                  The radar chart maps your accuracy across GK modules. 
                  {weakestCategory !== 'None' && weakestCategory !== 'Not Analyzed' ? (
                    <> Focus your study plan on <span className="text-rose-400 font-bold">{weakestCategory}</span> to improve your average score.</>
                  ) : (
                    ' Take exams in History, Polity, Geography, and Science to construct a balanced scoring profile.'
                  )}
                </p>
                
                <div className="flex gap-4 pt-2 border-t border-white/10 mt-4 text-xs font-semibold text-slate-400">
                  <div>
                    <span className="text-emerald-400 font-black block text-base">{strongestCategory !== 'None' ? strongestCategory : 'N/A'}</span>
                    <span>Top Strength</span>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <span className="text-rose-400 font-black block text-base">{weakestCategory !== 'None' ? weakestCategory : 'N/A'}</span>
                    <span>Area to Improve</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[320px] h-[300px] flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mappedRadarData}>
                    <PolarGrid stroke="#ffffff15" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                    <Radar 
                      name="Accuracy" 
                      dataKey="value" 
                      stroke="#4F46E5" 
                      fill="#4F46E5" 
                      fillOpacity={0.5}
                      animationDuration={1500}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Difficulty and Pace Index (Right side - 1 col) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
                <Target className="w-5 h-5 text-indigo-500" />
                Difficulty Metrics
              </h3>

              {/* Easy Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Easy Questions</span>
                  <span className="text-slate-900 font-black">{easyAccuracy}% Accuracy</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${easyAccuracy}%` }}></div>
                </div>
              </div>

              {/* Medium Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Medium Questions</span>
                  <span className="text-slate-900 font-black">{mediumAccuracy}% Accuracy</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mediumAccuracy}%` }}></div>
                </div>
              </div>

              {/* Hard Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Hard Questions</span>
                  <span className="text-slate-900 font-black">{hardAccuracy}% Accuracy</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hardAccuracy}%` }}></div>
                </div>
              </div>
            </div>

            {/* Time Management advice */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Pacing Index</h4>
              <div className="text-sm font-bold text-slate-800">{paceDescriptor}</div>
              <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">
                Avg time per question is <strong className="text-slate-800">{avgTimePerQuestion} seconds</strong>. 
                {avgTimePerQuestion <= 15 
                  ? ' Quick response rate. Keep taking tests to maintain recall speed!' 
                  : ' Optimal speed for reflecting on difficult statements.'}
              </p>
            </div>
          </div>

        </div>

        {/* Score Trends Chart & Recent History Log */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Trend Area Chart (Left side - 2 cols) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-current" /> Performance Momentum
              </h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Score Trend over recent exams</p>
            </div>

            <div className="h-[240px] w-full">
              {trendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="colorGkScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', padding: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#4F46E5" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorGkScore)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm font-bold">No exam attempts logged yet</p>
                  <p className="text-slate-400 text-xs mt-0.5">Attempt tests to map accuracy charts.</p>
                </div>
              )}
            </div>
          </div>

          {/* History log panel (Right side - 1 col) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-[345px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Exam History
              </h3>
              
              {!isDemoData && history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-wider hover:underline"
                >
                  Clear Logs
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {history.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 transition-colors flex justify-between items-center"
                >
                  <div className="overflow-hidden pr-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block truncate">{log.category}</span>
                    <h5 className="font-bold text-slate-800 text-xs truncate mt-0.5">{log.subcategory}</h5>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">{log.date}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 text-xs font-black rounded-lg ${
                      log.percentage >= 80 ? 'bg-emerald-50 text-emerald-700' :
                      log.percentage >= 60 ? 'bg-blue-50 text-blue-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {log.percentage}%
                    </span>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 py-12">
                  <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-xs font-bold">No history available</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Start an exam to populate logs.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
