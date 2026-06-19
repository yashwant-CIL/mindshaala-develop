import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Award, Clock, Brain, Zap,
  Calendar, Star, BarChart3, LineChart, AlertCircle, CheckCircle,
  Trophy, Flame, ArrowUp, ArrowDown, Download, Users, Lightbulb,
  BookOpen, FileText, Eye, EyeOff, Sparkles, Activity, ThumbsUp,
  AlertTriangle, Info, ChevronRight, Filter
} from 'lucide-react';

export function PerformanceAnalytics() {
  const [viewMode, setViewMode] = useState<'student' | 'parent'>('student');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Mock data - in real app, fetch from backend
  const overallScore = 85;
  const previousScore = 78;
  const scoreChange = overallScore - previousScore;
  const percentileRank = 92; // Top 8%
  const studyStreak = 15;
  const totalStudyHours = 124;
  const conceptsMastered = 87;
  const totalConcepts = 120;

  // Exam Performance Trend Data
  const examPerformanceTrend = [
    { exam: 'Unit 1', yourScore: 68, classAverage: 58 },
    { exam: 'Unit 2', yourScore: 72, classAverage: 62 },
    { exam: 'Mid-Term', yourScore: 70, classAverage: 64 },
    { exam: 'Unit 3', yourScore: 88, classAverage: 66 },
    { exam: 'Unit 4', yourScore: 85, classAverage: 67 },
    { exam: 'Prelim 1', yourScore: 92, classAverage: 69 },
  ];

  // Subject Strength Analysis - Radar Chart Data
  const subjectStrengthData = [
    { subject: 'Physics', score: 88 },
    { subject: 'Math', score: 90 },
    { subject: 'Chemistry', score: 82 },
    { subject: 'Biology', score: 80 },
    { subject: 'English', score: 85 },
    { subject: 'History', score: 78 },
    { subject: 'Geography', score: 75 },
    { subject: 'Computer', score: 92 },
  ];

  // Topic Proficiency Heatmap Data
  const topicProficiencyData = [
    // Physics topics
    { topic: 'Mechanics', subject: 'Physics', proficiency: 'strong', score: 92 },
    { topic: 'Thermodynamics', subject: 'Physics', proficiency: 'weak', score: 65 },
    { topic: 'Optics', subject: 'Physics', proficiency: 'moderate', score: 75 },
    { topic: 'Electricity', subject: 'Physics', proficiency: 'strong', score: 88 },
    { topic: 'Magnetism', subject: 'Physics', proficiency: 'moderate', score: 72 },
    
    // Chemistry topics
    { topic: 'Organic Chemistry', subject: 'Chemistry', proficiency: 'weak', score: 62 },
    { topic: 'Inorganic Chemistry', subject: 'Chemistry', proficiency: 'moderate', score: 78 },
    { topic: 'Physical Chemistry', subject: 'Chemistry', proficiency: 'strong', score: 85 },
    { topic: 'Electrochemistry', subject: 'Chemistry', proficiency: 'weak', score: 68 },
    { topic: 'Chemical Bonding', subject: 'Chemistry', proficiency: 'strong', score: 90 },
    
    // Mathematics topics
    { topic: 'Calculus', subject: 'Mathematics', proficiency: 'strong', score: 95 },
    { topic: 'Algebra', subject: 'Mathematics', proficiency: 'strong', score: 92 },
    { topic: 'Trigonometry', subject: 'Mathematics', proficiency: 'strong', score: 88 },
    { topic: '3D Geometry', subject: 'Mathematics', proficiency: 'moderate', score: 75 },
    { topic: 'Probability', subject: 'Mathematics', proficiency: 'moderate', score: 82 },
    
    // Biology topics
    { topic: 'Genetics', subject: 'Biology', proficiency: 'weak', score: 70 },
    { topic: 'Ecology', subject: 'Biology', proficiency: 'weak', score: 68 },
    { topic: 'Cell Biology', subject: 'Biology', proficiency: 'strong', score: 86 },
    { topic: 'Human Anatomy', subject: 'Biology', proficiency: 'strong', score: 88 },
    { topic: 'Plant Physiology', subject: 'Biology', proficiency: 'moderate', score: 76 },
  ];

  const learningVelocity = {
    current: 12.5, // concepts per week
    previous: 10.2,
    trend: 'up',
    optimal: 15,
  };

  const studyPatterns = {
    peakProductivityTime: '6:00 PM - 9:00 PM',
    avgSessionDuration: '45 minutes',
    focusScore: 87,
    retentionRate: 82,
    revisionCycles: 3.2,
    optimalRevisionCycles: 4,
  };

  const aiInsights = [
    {
      type: 'success',
      icon: ThumbsUp,
      title: 'Outstanding Progress in Mathematics',
      description: 'Your consistent practice in Calculus has resulted in 15% improvement. Keep up the momentum!',
      action: 'View Study Plan',
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Biology Needs Attention',
      description: 'Time spent on Biology decreased by 23% this week. Recommended: Add 1 hour daily focus on Genetics.',
      action: 'Schedule Study Time',
    },
    {
      type: 'info',
      icon: Lightbulb,
      title: 'Optimal Study Pattern Detected',
      description: 'You perform 32% better during evening study sessions. Consider scheduling difficult topics between 6-9 PM.',
      action: 'Optimize Schedule',
    },
    {
      type: 'success',
      icon: Flame,
      title: '15-Day Study Streak!',
      description: 'Consistency is key to success. Students with 30+ day streaks score 18% higher on average.',
      action: 'Continue Streak',
    },
  ];

  const competitiveReadiness = {
    jee: { score: 78, rank: 'Top 15%', strengths: ['Math', 'Physics'], gaps: ['Physical Chemistry'] },
    neet: { score: 75, rank: 'Top 20%', strengths: ['Chemistry', 'Biology'], gaps: ['Physics Applications'] },
    mhtcet: { score: 82, rank: 'Top 10%', strengths: ['Math', 'Chemistry'], gaps: ['Advanced Physics'] },
  };

  const milestones = [
    { title: 'First Perfect Score', date: 'Dec 15, 2024', subject: 'Mathematics', badge: '💯' },
    { title: 'Completed Wave Optics', date: 'Dec 20, 2024', subject: 'Physics', badge: '🎓' },
    { title: '100 Concepts Mastered', date: 'Dec 22, 2024', subject: 'Overall', badge: '🏆' },
    { title: '30-Day Study Streak', date: 'In Progress', subject: 'Overall', badge: '🔥' },
  ];

  const skillGapAnalysis = [
    { skill: 'Problem Solving Speed', current: 75, required: 90, gap: 15, priority: 'high' },
    { skill: 'Conceptual Clarity', current: 88, required: 95, gap: 7, priority: 'medium' },
    { skill: 'Time Management', current: 82, required: 90, gap: 8, priority: 'medium' },
    { skill: 'Exam Temperament', current: 70, required: 85, gap: 15, priority: 'high' },
    { skill: 'Revision Efficiency', current: 78, required: 88, gap: 10, priority: 'high' },
  ];

  const predictiveAnalytics = {
    projectedScore: 88,
    confidenceInterval: '85-92',
    timeToGoal: '6 weeks',
    requiredEffort: 'Moderate',
    successProbability: 87,
  };

  const subjectPerformance = [
    {
      subject: 'Physics',
      score: 88,
      trend: 'up',
      change: 5,
      mastery: 85,
      timeSpent: 35,
      conceptsCleared: 42,
      totalConcepts: 48,
      weakAreas: ['Thermodynamics', 'Wave Optics'],
      strongAreas: ['Mechanics', 'Electricity'],
      upcomingTopics: ['Electromagnetism', 'Modern Physics'],
      examReadiness: 82,
    },
    {
      subject: 'Chemistry',
      score: 82,
      trend: 'up',
      change: 3,
      mastery: 78,
      timeSpent: 28,
      conceptsCleared: 35,
      totalConcepts: 45,
      weakAreas: ['Organic Reactions', 'Electrochemistry'],
      strongAreas: ['Periodic Table', 'Chemical Bonding'],
      upcomingTopics: ['Coordination Compounds', 'Polymers'],
      examReadiness: 75,
    },
    {
      subject: 'Mathematics',
      score: 90,
      trend: 'up',
      change: 7,
      mastery: 92,
      timeSpent: 42,
      conceptsCleared: 38,
      totalConcepts: 40,
      weakAreas: ['3D Geometry'],
      strongAreas: ['Calculus', 'Algebra', 'Trigonometry'],
      upcomingTopics: ['Probability', 'Vectors'],
      examReadiness: 90,
    },
    {
      subject: 'Biology',
      score: 80,
      trend: 'down',
      change: -2,
      mastery: 75,
      timeSpent: 19,
      conceptsCleared: 28,
      totalConcepts: 42,
      weakAreas: ['Genetics', 'Ecology', 'Plant Physiology'],
      strongAreas: ['Human Anatomy', 'Cell Biology'],
      upcomingTopics: ['Evolution', 'Biotechnology'],
      examReadiness: 70,
    },
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 4.5, tests: 2, score: 85 },
    { day: 'Tue', hours: 5.2, tests: 3, score: 88 },
    { day: 'Wed', hours: 3.8, tests: 1, score: 82 },
    { day: 'Thu', hours: 6.1, tests: 2, score: 90 },
    { day: 'Fri', hours: 4.7, tests: 2, score: 87 },
    { day: 'Sat', hours: 7.3, tests: 4, score: 92 },
    { day: 'Sun', hours: 5.5, tests: 3, score: 89 },
  ];

  const filteredSubjects = selectedSubject === 'all' 
    ? subjectPerformance 
    : subjectPerformance.filter(s => s.subject === selectedSubject);

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl">Performance Analytics</h1>
                  <p className="text-sm text-white/90">Comprehensive insights for data-driven learning</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('student')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  viewMode === 'student'
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Student View
              </button>
              <button
                onClick={() => setViewMode('parent')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  viewMode === 'parent'
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Parent View
              </button>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all">
                <Download className="w-4 h-4 inline mr-1" />
                Export Report
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/80">Overall Score</span>
                <div className={`flex items-center gap-1 text-xs ${scoreChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {scoreChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(scoreChange)}%
                </div>
              </div>
              <p className="text-3xl mb-1">{overallScore}%</p>
              <p className="text-xs text-white/70">Percentile: {percentileRank}th</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-xs text-white/80">Study Streak</span>
              </div>
              <p className="text-3xl mb-1">{studyStreak}</p>
              <p className="text-xs text-white/70">days consecutive</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-300" />
                <span className="text-xs text-white/80">Study Hours</span>
              </div>
              <p className="text-3xl mb-1">{totalStudyHours}</p>
              <p className="text-xs text-white/70">this month</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-300" />
                <span className="text-xs text-white/80">Mastery Rate</span>
              </div>
              <p className="text-3xl mb-1">{Math.round((conceptsMastered/totalConcepts)*100)}%</p>
              <p className="text-xs text-white/70">{conceptsMastered}/{totalConcepts} concepts</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-xs text-white/80">Learning Velocity</span>
              </div>
              <p className="text-3xl mb-1">{learningVelocity.current}</p>
              <p className="text-xs text-white/70">concepts/week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 3 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>

          {/* TOP SECTION: Key Performance Visualizations */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Exam Performance Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="mb-4">
                <h2 className="text-base text-gray-900 mb-1">Exam Performance Trend</h2>
                <p className="text-xs text-gray-500">Your score vs Class Average (Percentile)</p>
              </div>
              
              {/* Line Chart */}
              <div className="relative h-56">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="ml-8 h-full flex items-end justify-between gap-2 border-b border-l border-gray-200 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full border-t border-gray-100" />
                    ))}
                  </div>
                  
                  {/* Data points and lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                    {/* Class Average Line (dashed) */}
                    <polyline
                      points={examPerformanceTrend.map((exam, idx) => 
                        `${(idx / (examPerformanceTrend.length - 1)) * 100}%,${100 - exam.classAverage}%`
                      ).join(' ')}
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      vectorEffect="non-scaling-stroke"
                    />
                    
                    {/* Your Score Line (solid blue) */}
                    <polyline
                      points={examPerformanceTrend.map((exam, idx) => 
                        `${(idx / (examPerformanceTrend.length - 1)) * 100}%,${100 - exam.yourScore}%`
                      ).join(' ')}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                    />
                    
                    {/* Your Score Points */}
                    {examPerformanceTrend.map((exam, idx) => (
                      <circle
                        key={idx}
                        cx={`${(idx / (examPerformanceTrend.length - 1)) * 100}%`}
                        cy={`${100 - exam.yourScore}%`}
                        r="5"
                        fill="#3B82F6"
                        stroke="white"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                  
                  {/* X-axis labels */}
                  {examPerformanceTrend.map((exam, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <div className="h-full" />
                    </div>
                  ))}
                </div>
                
                {/* X-axis exam names */}
                <div className="ml-8 mt-2 flex justify-between">
                  {examPerformanceTrend.map((exam, idx) => (
                    <span key={idx} className="text-xs text-gray-600 flex-1 text-center">
                      {exam.exam}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-600"></div>
                  <span className="text-gray-600">Your Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t-2 border-gray-400"></div>
                  <span className="text-gray-600">Class Average</span>
                </div>
              </div>
            </div>

            {/* Subject Strength Analysis - Radar Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="mb-4">
                <h2 className="text-base text-gray-900 mb-1">Subject Strength Analysis</h2>
                <p className="text-xs text-gray-500">Performance across Board Subjects</p>
              </div>
              
              {/* Radar/Spider Chart - Simplified Octagon */}
              <div className="relative h-56 flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {/* Background octagon grid */}
                  {[1, 0.75, 0.5, 0.25].map((scale, idx) => (
                    <polygon
                      key={idx}
                      points={subjectStrengthData.map((_, i) => {
                        const angle = (i * 2 * Math.PI) / subjectStrengthData.length - Math.PI / 2;
                        const radius = 100 * scale;
                        return `${150 + radius * Math.cos(angle)},${150 + radius * Math.sin(angle)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Axis lines */}
                  {subjectStrengthData.map((_, i) => {
                    const angle = (i * 2 * Math.PI) / subjectStrengthData.length - Math.PI / 2;
                    return (
                      <line
                        key={i}
                        x1="150"
                        y1="150"
                        x2={150 + 100 * Math.cos(angle)}
                        y2={150 + 100 * Math.sin(angle)}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                    );
                  })}
                  
                  {/* Data polygon */}
                  <polygon
                    points={subjectStrengthData.map((subject, i) => {
                      const angle = (i * 2 * Math.PI) / subjectStrengthData.length - Math.PI / 2;
                      const radius = (subject.score / 100) * 100;
                      return `${150 + radius * Math.cos(angle)},${150 + radius * Math.sin(angle)}`;
                    }).join(' ')}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                  
                  {/* Data points */}
                  {subjectStrengthData.map((subject, i) => {
                    const angle = (i * 2 * Math.PI) / subjectStrengthData.length - Math.PI / 2;
                    const radius = (subject.score / 100) * 100;
                    return (
                      <circle
                        key={i}
                        cx={150 + radius * Math.cos(angle)}
                        cy={150 + radius * Math.sin(angle)}
                        r="4"
                        fill="#3B82F6"
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                  
                  {/* Subject labels */}
                  {subjectStrengthData.map((subject, i) => {
                    const angle = (i * 2 * Math.PI) / subjectStrengthData.length - Math.PI / 2;
                    const labelRadius = 120;
                    const x = 150 + labelRadius * Math.cos(angle);
                    const y = 150 + labelRadius * Math.sin(angle);
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-gray-600"
                        style={{ fontSize: '11px' }}
                      >
                        {subject.subject}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Topic Proficiency Heatmap */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="mb-4">
              <h2 className="text-base text-gray-900 mb-1">Topic Proficiency Heatmap</h2>
              <p className="text-xs text-gray-500">Visual overview of strengths and weaknesses across all topics</p>
            </div>
            
            {/* Heatmap by subject */}
            <div className="space-y-4">
              {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map((subject) => {
                const subjectTopics = topicProficiencyData.filter(t => t.subject === subject);
                return (
                  <div key={subject}>
                    <p className="text-xs text-gray-700 mb-2">{subject}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {subjectTopics.map((topic, idx) => {
                        const bgColor = 
                          topic.proficiency === 'strong' ? 'bg-green-500' :
                          topic.proficiency === 'moderate' ? 'bg-yellow-500' :
                          'bg-red-500';
                        const textColor =
                          topic.proficiency === 'strong' ? 'text-green-700' :
                          topic.proficiency === 'moderate' ? 'text-yellow-700' :
                          'text-red-700';
                        
                        return (
                          <div
                            key={idx}
                            className={`${bgColor} rounded-lg px-3 py-2.5 relative group cursor-pointer transition-transform hover:scale-105`}
                            title={`${topic.topic}: ${topic.score}%`}
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              {topic.topic}: {topic.score}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Strong</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-600">Weak</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Subject Performance */}
            <div className="col-span-2 space-y-6">
              
              {/* Subject-wise Analysis */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 p-5">
                  <h2 className="text-base text-gray-900">Subject-wise Performance</h2>
                </div>
                <div className="p-5 space-y-4">
                  {filteredSubjects.map((subject) => (
                    <div key={subject.subject} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-sm text-gray-900">{subject.subject}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${
                              subject.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {subject.trend === 'up' ? '↑' : '↓'} {Math.abs(subject.change)}%
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {subject.examReadiness}% Exam Ready
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Current Score</p>
                              <p className="text-xl text-gray-900">{subject.score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Mastery</p>
                              <p className="text-xl text-gray-900">{subject.mastery}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Time Spent</p>
                              <p className="text-xl text-gray-900">{subject.timeSpent}h</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Concepts Mastered</span>
                              <span>{subject.conceptsCleared}/{subject.totalConcepts}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(subject.conceptsCleared/subject.totalConcepts)*100}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">💪 Strong Areas</p>
                              <div className="flex flex-wrap gap-1">
                                {subject.strongAreas.map((area, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">⚠️ Weak Areas</p>
                              <div className="flex flex-wrap gap-1">
                                {subject.weakAreas.map((area, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
                          Practice Weak Areas
                        </button>
                        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs">
                          View Detailed Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Activity Chart */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 p-5">
                  <h2 className="text-base text-gray-900">Weekly Study Activity</h2>
                </div>
                <div className="p-5">
                  <div className="flex items-end justify-between h-48 gap-2">
                    {weeklyActivity.map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full flex-1 flex flex-col justify-end">
                          <div 
                            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                            style={{ height: `${(day.hours / 8) * 100}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                              {day.hours}h • {day.tests} tests • {day.score}%
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{day.day}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Avg Daily Hours</p>
                      <p className="text-sm text-gray-900">5.3 hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Total Tests</p>
                      <p className="text-sm text-gray-900">17 tests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Avg Score</p>
                      <p className="text-sm text-gray-900">87.6%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Gap Analysis */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 p-5">
                  <h2 className="text-base text-gray-900">Skill Gap Analysis</h2>
                  <p className="text-xs text-gray-500 mt-1">Areas requiring focused improvement</p>
                </div>
                <div className="p-5 space-y-4">
                  {skillGapAnalysis.map((skill, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{skill.skill}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            skill.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {skill.priority} priority
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Gap: {skill.gap}%</span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="absolute left-0 bg-blue-600 h-3 rounded-full"
                          style={{ width: `${skill.current}%` }}
                        />
                        <div 
                          className="absolute left-0 border-2 border-dashed border-green-600 h-3 rounded-full bg-transparent"
                          style={{ width: `${skill.required}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">Current: {skill.current}%</span>
                        <span className="text-xs text-green-600">Target: {skill.required}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column - Additional Insights */}
            <div className="space-y-6">
              
              {/* Predictive Analytics */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h2 className="text-sm text-gray-900">Predictive Analytics</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Projected Score (Next Exam)</p>
                    <p className="text-3xl text-gray-900 mb-1">{predictiveAnalytics.projectedScore}%</p>
                    <p className="text-xs text-gray-500">Confidence: {predictiveAnalytics.confidenceInterval}%</p>
                  </div>
                  <div className="pt-3 border-t border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Success Probability</span>
                      <span className="text-xs text-green-600">{predictiveAnalytics.successProbability}%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${predictiveAnalytics.successProbability}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Time to Goal</span>
                      <span className="text-gray-900">{predictiveAnalytics.timeToGoal}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Required Effort</span>
                      <span className="text-gray-900">{predictiveAnalytics.requiredEffort}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Exam Readiness */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-sm text-gray-900">Competitive Exam Readiness</h2>
                </div>
                <div className="p-4 space-y-3">
                  {Object.entries(competitiveReadiness).map(([exam, data]) => (
                    <div key={exam} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-900 uppercase">{exam}</span>
                        <span className="text-xs text-blue-600">{data.rank}</span>
                      </div>
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                            style={{ width: `${data.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{data.score}% Ready</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          ✅ Strengths: {data.strengths.join(', ')}
                        </p>
                        <p className="text-xs text-gray-600">
                          ⚠️ Gaps: {data.gaps.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Patterns */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-sm text-gray-900">Study Pattern Analysis</h2>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Peak Productivity</span>
                    <span className="text-xs text-gray-900">{studyPatterns.peakProductivityTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Avg Session</span>
                    <span className="text-xs text-gray-900">{studyPatterns.avgSessionDuration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Focus Score</span>
                    <span className="text-xs text-green-600">{studyPatterns.focusScore}%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Retention Rate</span>
                    <span className="text-xs text-green-600">{studyPatterns.retentionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-600">Revision Cycles</span>
                    <span className="text-xs text-orange-600">
                      {studyPatterns.revisionCycles} / {studyPatterns.optimalRevisionCycles} optimal
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestones & Achievements */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-sm text-gray-900">Recent Milestones</h2>
                </div>
                <div className="p-4 space-y-3">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{milestone.badge}</span>
                      <div className="flex-1">
                        <h3 className="text-xs text-gray-900 mb-0.5">{milestone.title}</h3>
                        <p className="text-xs text-gray-500">{milestone.subject} • {milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Insights (Only in Parent View) */}
              {viewMode === 'parent' && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-orange-600" />
                    <h2 className="text-sm text-gray-900">Parent Insights</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-900 mb-2">📊 <strong>Overall Progress:</strong></p>
                      <p className="text-xs text-gray-600">
                        Rohan is performing well with consistent improvement in Math and Physics. Biology needs more attention.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-900 mb-2">⏰ <strong>Study Discipline:</strong></p>
                      <p className="text-xs text-gray-600">
                        Maintains good study schedule with 5.3 hours daily average. Peak performance during evening hours.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-900 mb-2">🎯 <strong>Recommendations:</strong></p>
                      <ul className="text-xs text-gray-600 space-y-1 ml-3">
                        <li>• Schedule 1-on-1 Biology tutor session</li>
                        <li>• Increase revision cycles to 4 per topic</li>
                        <li>• Focus on exam temperament practice</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-base text-gray-900 mb-4">Recommended Action Items</h2>
            <div className="grid grid-cols-3 gap-4">
              <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-all text-left">
                <Target className="w-5 h-5 text-blue-600 mb-2" />
                <h3 className="text-sm text-gray-900 mb-1">Practice Biology Weak Areas</h3>
                <p className="text-xs text-gray-600">Focus on Genetics & Ecology - 3 hours recommended</p>
              </button>
              <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-all text-left">
                <Calendar className="w-5 h-5 text-green-600 mb-2" />
                <h3 className="text-sm text-gray-900 mb-1">Schedule Mentor Session</h3>
                <p className="text-xs text-gray-600">Book 1-on-1 with Biology expert for concept clarity</p>
              </button>
              <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-all text-left">
                <Zap className="w-5 h-5 text-purple-600 mb-2" />
                <h3 className="text-sm text-gray-900 mb-1">Take Mock Test</h3>
                <p className="text-xs text-gray-600">Full syllabus test to assess exam readiness</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}