import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Award, Clock, Brain, Zap,
  Calendar, Star, BarChart3, LineChart, AlertCircle, CheckCircle,
  Trophy, Flame, ArrowUp, ArrowDown, Download, Users, Lightbulb,
  BookOpen, FileText, Eye, EyeOff, Sparkles, Activity, ThumbsUp,
  AlertTriangle, Info, ChevronRight, Filter, Heart, Battery,
  Smile, Meh, Frown, Sun, Moon, Coffee, Sunrise, Sunset,
  Play, Pause, SkipForward, Rewind, Share2, MessageSquare,
  TrendingDown as Decrease, GitBranch, Network, Route, MapPin,
  Percent, Timer, Focus, Volume2, Headphones, Video, 
  ChevronDown, ChevronUp, Minus, Plus, X, Check, Sparkle,
  ExternalLink, RefreshCw, Settings, Bell, Mail, Phone
} from 'lucide-react';

interface PerformanceAnalyticsAdvancedProps {
  onNavigate?: (page: string) => void;
}

export function PerformanceAnalyticsAdvanced({ onNavigate }: PerformanceAnalyticsAdvancedProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [viewMode, setViewMode] = useState<'student' | 'parent'>('student');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['insights', 'radar']));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Handle action clicks
  const handleActionClick = (action: string) => {
    switch(action) {
      case 'View Rankings':
        alert("🏆 Overall Ranking:\n\n📊 Class Rank: 5/120\n🏫 School Rank: 12/450\n🌍 State Rank: Top 2%\n\nKeep up the excellent work!");
        break;
      case 'Schedule Time':
        setShowScheduleModal(true);
        break;
      case 'Continue':
        alert("🎯 Next Study Session:\n\n📚 Chemistry - Chapter 5\n⏰ Suggested time: 6 PM today\n📈 Expected improvement: +5%");
        break;
      case 'View Strategy':
        alert("📊 Top Performer Strategy:\n\n1️⃣ Daily problem-solving: 30 min\n2️⃣ Concept revision: 20 min\n3️⃣ Mock tests: 2x per week\n4️⃣ Doubt clearing: Same day\n\nWant to apply this?");
        break;
      default:
        console.log('Action:', action);
    }
  };

  // Gamification data
  const studentLevel = {
    current: 12,
    xp: 8750,
    nextLevelXp: 10000,
    title: 'Advanced Scholar',
    nextTitle: 'Master Scholar',
  };

  const badges = [
    { id: 1, name: 'Week Warrior', icon: '🔥', earned: true, description: '7-day study streak' },
    { id: 2, name: 'Perfect Score', icon: '💯', earned: true, description: '100% in any test' },
    { id: 3, name: 'Speed Demon', icon: '⚡', earned: true, description: 'Complete 50 questions in 30 min' },
    { id: 4, name: 'Night Owl', icon: '🦉', earned: false, description: 'Study after midnight' },
    { id: 5, name: 'Early Bird', icon: '🌅', earned: true, description: 'Study before 6 AM' },
    { id: 6, name: 'Comeback King', icon: '👑', earned: true, description: 'Improve score by 20%' },
  ];

  // Smart Insights Feed
  const insightsFeed = [
    {
      id: 1,
      type: 'achievement',
      icon: Trophy,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: "You've entered Top 15% in your cohort!",
      description: "Your consistent effort in Mathematics has pushed you into the elite tier.",
      time: '2 hours ago',
      action: 'View Rankings',
    },
    {
      id: 2,
      type: 'warning',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      title: 'Biology study time decreased 30% this week',
      description: 'To maintain your current trajectory, add 1.5 hours of Biology study this week.',
      time: '5 hours ago',
      action: 'Schedule Time',
    },
    {
      id: 3,
      type: 'success',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: "7-day improvement streak in Chemistry!",
      description: 'Your scores have improved daily for a full week. Keep the momentum!',
      time: '1 day ago',
      action: 'Continue',
    },
    {
      id: 4,
      type: 'insight',
      icon: Lightbulb,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'Students who improved 70→85 in Math',
      description: 'Spent 40% more time on problem-solving practice. Consider adding 30 min daily.',
      time: '2 days ago',
      action: 'View Strategy',
    },
  ];

  // Radar Chart Data - Subject Strength Analysis
  const subjectRadarData = {
    subjects: ['Physics', 'Chemistry', 'Math', 'Biology', 'English'],
    metrics: {
      currentScore: [88, 82, 90, 75, 85],
      targetScore: [95, 92, 96, 88, 90],
      practiceLevel: [85, 78, 95, 65, 80],
      conceptClarity: [90, 85, 92, 70, 88],
      speedAccuracy: [82, 80, 88, 68, 82],
    },
    colors: {
      currentScore: '#3B82F6',
      targetScore: '#10B981',
      practiceLevel: '#F59E0B',
      conceptClarity: '#8B5CF6',
      speedAccuracy: '#EC4899',
    }
  };

  // Render radar chart
  const renderRadarChart = () => {
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;
    const subjects = subjectRadarData.subjects;
    const angleStep = (2 * Math.PI) / subjects.length;

    // Calculate points for a metric
    const getPoints = (values: number[]) => {
      return values.map((value, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const radius = (value / 100) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
    };

    // Concentric circles for scale
    const circles = [20, 40, 60, 80, 100];

    return (
      <svg width="400" height="450" className="mx-auto">
        {/* Background concentric circles */}
        {circles.map((percent) => (
          <circle
            key={percent}
            cx={centerX}
            cy={centerY}
            r={(percent / 100) * maxRadius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray={percent === 100 ? '0' : '3,3'}
          />
        ))}

        {/* Axis lines */}
        {subjects.map((subject, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const x = centerX + maxRadius * Math.cos(angle);
          const y = centerY + maxRadius * Math.sin(angle);
          return (
            <line
              key={subject}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#D1D5DB"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygons */}
        <polygon
          points={getPoints(subjectRadarData.metrics.currentScore)}
          fill="#3B82F6"
          fillOpacity="0.1"
          stroke="#3B82F6"
          strokeWidth="2"
        />
        <polygon
          points={getPoints(subjectRadarData.metrics.targetScore)}
          fill="#10B981"
          fillOpacity="0.1"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <polygon
          points={getPoints(subjectRadarData.metrics.practiceLevel)}
          fill="#F59E0B"
          fillOpacity="0.1"
          stroke="#F59E0B"
          strokeWidth="2"
        />

        {/* Data points */}
        {subjects.map((subject, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const currentRadius = (subjectRadarData.metrics.currentScore[index] / 100) * maxRadius;
          const x = centerX + currentRadius * Math.cos(angle);
          const y = centerY + currentRadius * Math.sin(angle);
          return (
            <circle
              key={`point-${subject}`}
              cx={x}
              cy={y}
              r="4"
              fill="#3B82F6"
            />
          );
        })}

        {/* Labels */}
        {subjects.map((subject, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const labelRadius = maxRadius + 30;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          return (
            <text
              key={`label-${subject}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-700"
            >
              {subject}
            </text>
          );
        })}

        {/* Score labels */}
        {subjects.map((subject, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const labelRadius = maxRadius + 50;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle) + 12;
          return (
            <text
              key={`score-${subject}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-blue-600"
            >
              {subjectRadarData.metrics.currentScore[index]}%
            </text>
          );
        })}
      </svg>
    );
  };

  // Circadian Performance Data
  const circadianData = {
    timeSlots: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'],
    subjects: ['Physics', 'Chemistry', 'Math', 'Biology'],
    performance: [
      [72, 78, 68, 65, 88, 92, 58],
      [65, 70, 82, 78, 85, 88, 62],
      [85, 90, 88, 82, 95, 90, 70],
      [68, 75, 80, 85, 82, 78, 65],
    ],
  };

  // Peer Comparison
  const peerComparison = {
    yourScore: 85,
    cohortAverage: 72,
    top10Percent: 92,
    top25Percent: 85,
    similarStudents: {
      averageScore: 83,
      studyHours: 5.8,
      improvementRate: 12,
    },
    insights: [
      "You're performing 18% above cohort average",
      "Students in top 10% spend 2.3 hours more per week",
      "Your improvement rate (15%) exceeds similar students (12%)",
    ],
  };

  // Study Quality Metrics
  const studyQuality = {
    totalHours: 35,
    effectiveHours: 28.5,
    focusScore: 87,
    retentionScore: 82,
    engagementScore: 90,
    qualityTrend: 'up',
    breakdown: [
      { metric: 'Deep Focus Sessions', score: 92, status: 'excellent' },
      { metric: 'Note-Taking Quality', score: 85, status: 'good' },
      { metric: 'Active Recall Practice', score: 78, status: 'good' },
      { metric: 'Distraction Management', score: 88, status: 'excellent' },
    ],
  };

  // Learning Path Roadmap
  const learningPath = [
    {
      id: 1,
      topic: 'Mechanics',
      status: 'completed',
      score: 92,
      children: [2, 3],
      position: { x: 150, y: 50 },
    },
    {
      id: 2,
      topic: 'Thermodynamics',
      status: 'in-progress',
      score: 65,
      children: [4],
      position: { x: 100, y: 150 },
    },
    {
      id: 3,
      topic: 'Electrostatics',
      status: 'completed',
      score: 88,
      children: [5],
      position: { x: 200, y: 150 },
    },
    {
      id: 4,
      topic: 'Heat Transfer',
      status: 'locked',
      score: 0,
      children: [],
      position: { x: 100, y: 250 },
    },
    {
      id: 5,
      topic: 'Magnetism',
      status: 'recommended',
      score: 0,
      children: [6],
      position: { x: 200, y: 250 },
    },
    {
      id: 6,
      topic: 'EM Waves',
      status: 'locked',
      score: 0,
      children: [],
      position: { x: 200, y: 350 },
    },
  ];

  // Spaced Repetition Schedule
  const revisionSchedule = [
    { topic: 'Calculus', nextReview: 'Today', interval: 'Review now', priority: 'high', mastery: 85 },
    { topic: 'Kinematics', nextReview: 'Tomorrow', interval: '1 day', priority: 'medium', mastery: 78 },
    { topic: 'Organic Reactions', nextReview: 'In 3 days', interval: '3 days', priority: 'high', mastery: 65 },
    { topic: 'Cell Biology', nextReview: 'In 7 days', interval: '7 days', priority: 'low', mastery: 90 },
  ];

  // Mental Wellness Data
  const mentalWellness = {
    currentMood: 'good',
    stressLevel: 45,
    burnoutRisk: 'low',
    weeklyMoods: [
      { day: 'Mon', mood: 'happy', stress: 30 },
      { day: 'Tue', mood: 'neutral', stress: 50 },
      { day: 'Wed', mood: 'happy', stress: 35 },
      { day: 'Thu', mood: 'stressed', stress: 70 },
      { day: 'Fri', mood: 'neutral', stress: 55 },
      { day: 'Sat', mood: 'happy', stress: 25 },
      { day: 'Sun', mood: 'happy', stress: 30 },
    ],
    recommendations: [
      'Schedule a 15-minute break every 90 minutes',
      'Consider meditation before high-stress study sessions',
      'Thursday shows elevated stress - plan lighter topics',
    ],
  };

  // Dream College Goal
  const dreamGoal = {
    college: 'IIT Bombay - Computer Science',
    requiredRank: 100,
    currentProjectedRank: 2500,
    successProbability: 45,
    gap: {
      physics: { current: 88, required: 95, gap: 7 },
      chemistry: { current: 82, required: 92, gap: 10 },
      math: { current: 90, required: 96, gap: 6 },
    },
    milestones: [
      { title: 'Reach 90% in Chemistry', deadline: '2 weeks', progress: 82 },
      { title: 'Master all Math topics', deadline: '1 month', progress: 75 },
      { title: 'Achieve 95% in Physics', deadline: '1 month', progress: 88 },
    ],
  };

  // Multi-Exam Strategy
  const multiExamStrategy = {
    exams: [
      { name: 'JEE Mains', readiness: 78, targetDate: '2025-04-15', daysLeft: 109 },
      { name: 'NEET', readiness: 75, targetDate: '2025-05-05', daysLeft: 129 },
      { name: 'MHT-CET', readiness: 82, targetDate: '2025-05-10', daysLeft: 134 },
    ],
  };

  // Video Learning Analytics
  const videoAnalytics = {
    totalWatched: 124,
    avgCompletionRate: 87,
    mostRewatched: [
      { topic: 'Organic Mechanisms', rewatches: 3.2, avgOthers: 1.5 },
      { topic: 'Calculus Derivation', rewatches: 2.8, avgOthers: 1.3 },
    ],
    engagementPatterns: {
      pauses: 45,
      skips: 12,
      rewinds: 8,
    },
  };

  // Question Pattern Analysis
  const questionPatterns = {
    byType: [
      { type: 'MCQ', accuracy: 85, count: 450 },
      { type: 'Numerical', accuracy: 72, count: 180 },
      { type: 'Theory', accuracy: 78, count: 95 },
    ],
    timeBasedAccuracy: [
      { timeSlot: '0-15 min', accuracy: 88 },
      { timeSlot: '15-30 min', accuracy: 85 },
      { timeSlot: '30-45 min', accuracy: 78 },
      { timeSlot: '45-60 min', accuracy: 65 },
    ],
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'stressed': return '😰';
      default: return '😊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'recommended': return 'bg-blue-500';
      case 'locked': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleExportReport = () => {
    alert("📊 Generating PDF Report...\n\n✅ Performance Analytics\n✅ Subject-wise Analysis\n✅ Peer Comparison\n✅ Study Quality Metrics\n✅ Mental Wellness Report\n\nDownload will start shortly!");
  };

  const handleRefreshData = () => {
    alert("🔄 Refreshing analytics data...\n\nLatest test scores, study hours, and performance metrics will be updated.");
  };

  const handleNodeClick = (node: any) => {
    if (node.status === 'locked') {
      alert(`🔒 ${node.topic} is locked!\n\nComplete prerequisites first:\n${node.id === 4 ? '• Thermodynamics (Currently 65%)' : '• Electrostatics'}`);
    } else if (node.status === 'recommended') {
      const proceed = confirm(`✨ Start ${node.topic}?\n\nThis is your AI-recommended next topic.\n\n📚 Estimated time: 2 weeks\n🎯 Expected mastery: 85%\n\nClick OK to begin!`);
      if (proceed && onNavigate) {
        onNavigate('learning');
      }
    } else if (node.status === 'in-progress') {
      const proceed = confirm(`⏱ Continue ${node.topic}?\n\nCurrent progress: ${node.score}%\n\nClick OK to resume learning!`);
      if (proceed && onNavigate) {
        onNavigate('learning');
      }
    } else {
      alert(`✅ ${node.topic} - Completed!\n\nScore: ${node.score}%\nStatus: Mastered\n\nGreat work! 🎉`);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl">AI-Powered Performance Analytics</h1>
                  <p className="text-sm text-white/90">World-class insights for accelerated learning</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('student')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  viewMode === 'student' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Student View
              </button>
              <button
                onClick={() => setViewMode('parent')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  viewMode === 'parent' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Parent View
              </button>
              <button 
                onClick={handleRefreshData}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all"
              >
                <RefreshCw className="w-4 h-4 inline mr-1" />
                Refresh
              </button>
              <button 
                onClick={handleExportReport}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Export Report
              </button>
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Level {studentLevel.current}</span>
                </div>
                <span className="text-xs text-white/80">{studentLevel.title}</span>
              </div>
              <div className="mb-2">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all"
                    style={{ width: `${(studentLevel.xp / studentLevel.nextLevelXp) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>{studentLevel.xp} XP</span>
                <span>{studentLevel.nextLevelXp - studentLevel.xp} to {studentLevel.nextTitle}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-all" onClick={() => handleActionClick('View Rankings')}>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-xs text-white/80">Rank</span>
              </div>
              <p className="text-2xl">Top 15%</p>
              <p className="text-xs text-white/70">in cohort</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-xs text-white/80">Streak</span>
              </div>
              <p className="text-2xl">15 days</p>
              <p className="text-xs text-white/70">consecutive</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-all" onClick={() => toggleSection('badges')}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-purple-300" />
                <span className="text-xs text-white/80">Badges</span>
              </div>
              <p className="text-2xl">{badges.filter(b => b.earned).length}/{badges.length}</p>
              <p className="text-xs text-white/70">earned</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-all" onClick={() => toggleSection('wellness')}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-300" />
                <span className="text-xs text-white/80">Wellness</span>
              </div>
              <p className="text-2xl">{getMoodEmoji(mentalWellness.currentMood)}</p>
              <p className="text-xs text-white/70">{mentalWellness.burnoutRisk} risk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* Subject Strength Radar Chart - NEW! */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 p-5">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('radar')}>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base text-gray-900">Subject Strength Analysis (Radar View)</h2>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  Comprehensive Overview
                </span>
              </div>
              {expandedSections.has('radar') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>

            {expandedSections.has('radar') && (
              <div>
                <p className="text-xs text-gray-600 mb-4">Visual representation of your overall preparedness across all subjects</p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    {renderRadarChart()}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-700 mb-3">Legend:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-blue-600"></div>
                          <span className="text-xs text-gray-700">Current Score</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-green-600 border-2 border-green-600" style={{ borderStyle: 'dashed' }}></div>
                          <span className="text-xs text-gray-700">Target Score</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-yellow-600"></div>
                          <span className="text-xs text-gray-700">Practice Level</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-700 mb-2">Subject-wise Scores:</p>
                      <div className="space-y-2">
                        {subjectRadarData.subjects.map((subject, idx) => (
                          <div key={subject} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{subject}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-blue-600">{subjectRadarData.metrics.currentScore[idx]}%</span>
                              <span className="text-xs text-gray-400">→</span>
                              <span className="text-xs text-green-600">{subjectRadarData.metrics.targetScore[idx]}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-900 mb-1">Focus Areas:</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            <li>• Biology needs 13% improvement</li>
                            <li>• Chemistry gap: 10%</li>
                            <li>• Practice Biology more</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-green-900 mb-1">Strong Subjects:</p>
                          <ul className="text-xs text-green-700 space-y-1">
                            <li>• Math: 90% (Excellent!)</li>
                            <li>• Physics: 88% (Very Good)</li>
                            <li>• Maintain momentum</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Insights Feed */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-5">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('insights')}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-base text-gray-900">Smart Insights Feed</h2>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {insightsFeed.length} new
                </span>
              </div>
              {expandedSections.has('insights') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.has('insights') && (
              <div className="space-y-3">
                {insightsFeed.map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div key={insight.id} className={`${insight.bg} border ${insight.border} rounded-lg p-4 transition-all hover:shadow-md`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 bg-white rounded-lg flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${insight.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-sm text-gray-900">{insight.title}</h3>
                            <span className="text-xs text-gray-500">{insight.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                          <button 
                            onClick={() => handleActionClick(insight.action)}
                            className={`text-xs ${insight.color} hover:underline flex items-center gap-1 transition-all`}
                          >
                            {insight.action}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">

              {/* Dream College Goal Tracker */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-orange-600" />
                      <h2 className="text-base text-gray-900">Dream Goal Tracker</h2>
                    </div>
                    <p className="text-sm text-gray-700">{dreamGoal.college}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Success Probability</p>
                    <p className="text-2xl text-orange-600">{dreamGoal.successProbability}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Required Rank</p>
                    <p className="text-lg text-gray-900">AIR {dreamGoal.requiredRank}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Current Trajectory</p>
                    <p className="text-lg text-gray-900">AIR {dreamGoal.currentProjectedRank}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Gap to Close</p>
                    <p className="text-lg text-red-600">{dreamGoal.currentProjectedRank - dreamGoal.requiredRank}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-700 mb-2">Subject-wise Gap Analysis</p>
                  <div className="space-y-2">
                    {Object.entries(dreamGoal.gap).map(([subject, data]) => (
                      <div key={subject}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="capitalize text-gray-700">{subject}</span>
                          <span className="text-gray-600">{data.current}% → {data.required}% (Gap: {data.gap}%)</span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="absolute left-0 bg-blue-600 h-2 rounded-full"
                            style={{ width: `${data.current}%` }}
                          />
                          <div 
                            className="absolute left-0 border-2 border-dashed border-green-600 h-2 rounded-full bg-transparent"
                            style={{ width: `${data.required}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-2">Key Milestones</p>
                  <div className="space-y-2">
                    {dreamGoal.milestones.map((milestone, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-900">{milestone.title}</span>
                          <span className="text-xs text-gray-500">{milestone.deadline}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Path Roadmap */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Route className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base text-gray-900">AI-Powered Learning Path</h2>
                  <span className="text-xs text-gray-500">(Physics - Interactive Roadmap)</span>
                </div>
                
                <div className="relative bg-gray-50 rounded-lg p-6 h-[400px] overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full">
                    {learningPath.map(node => 
                      node.children.map(childId => {
                        const child = learningPath.find(n => n.id === childId);
                        if (!child) return null;
                        return (
                          <line
                            key={`${node.id}-${childId}`}
                            x1={node.position.x}
                            y1={node.position.y}
                            x2={child.position.x}
                            y2={child.position.y}
                            stroke="#D1D5DB"
                            strokeWidth="2"
                            strokeDasharray={node.status === 'completed' ? '0' : '5,5'}
                          />
                        );
                      })
                    )}
                  </svg>
                  
                  {learningPath.map(node => (
                    <div
                      key={node.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: node.position.x, top: node.position.y }}
                    >
                      <div 
                        className={`w-20 h-20 ${getStatusColor(node.status)} rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer hover:scale-110 transition-transform`}
                        onClick={() => handleNodeClick(node)}
                      >
                        {node.status === 'completed' && <CheckCircle className="w-8 h-8 text-white" />}
                        {node.status === 'in-progress' && <Clock className="w-8 h-8 text-white animate-pulse" />}
                        {node.status === 'recommended' && <Sparkle className="w-8 h-8 text-white animate-pulse" />}
                        {node.status === 'locked' && <X className="w-8 h-8 text-white" />}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs text-gray-900 whitespace-nowrap">{node.topic}</p>
                        {node.score > 0 && <p className="text-xs text-gray-600">{node.score}%</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>Recommended Next</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span>Locked</span>
                  </div>
                </div>
              </div>

              {/* Circadian Performance Heatmap */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-5 h-5 text-orange-600" />
                    <h2 className="text-base text-gray-900">Circadian Performance Analytics</h2>
                  </div>
                  <p className="text-xs text-gray-500">Discover your peak performance times for each subject</p>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="flex gap-2 mb-2 ml-24">
                      {circadianData.timeSlots.map((time, idx) => (
                        <div key={idx} className="flex-1 text-center text-xs text-gray-600">
                          {time}
                        </div>
                      ))}
                    </div>

                    {circadianData.subjects.map((subject, subjectIdx) => (
                      <div key={subject} className="flex gap-2 mb-2 items-center">
                        <div className="w-20 text-xs text-gray-700">{subject}</div>
                        {circadianData.performance[subjectIdx].map((score, timeIdx) => (
                          <div
                            key={timeIdx}
                            className="flex-1 h-12 rounded flex items-center justify-center text-white text-xs cursor-pointer hover:scale-105 transition-transform"
                            style={{
                              backgroundColor: score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : score >= 50 ? '#F97316' : '#EF4444'
                            }}
                            title={`${subject} at ${circadianData.timeSlots[timeIdx]}: ${score}%`}
                          >
                            {score}%
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-900">
                        <strong>Peak Performance Times:</strong> Math (6PM - 95%), Physics (9PM - 92%), Chemistry (9PM - 88%), Biology (3PM - 85%)
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        💡 Schedule difficult topics during your peak hours for maximum retention!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Quality Score */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Focus className="w-5 h-5 text-purple-600" />
                      <h2 className="text-base text-gray-900">Study Session Quality</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Effectiveness:</span>
                      <span className="text-lg text-purple-600">{Math.round((studyQuality.effectiveHours / studyQuality.totalHours) * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Beyond hours - measure what truly matters</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Hours</p>
                    <p className="text-2xl text-gray-900">{studyQuality.totalHours}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Effective Hours</p>
                    <p className="text-2xl text-green-600">{studyQuality.effectiveHours}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Quality Score</p>
                    <p className="text-2xl text-blue-600">{studyQuality.focusScore}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {studyQuality.breakdown.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-900">{item.score}%</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.status === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${item.status === 'excellent' ? 'bg-green-600' : 'bg-blue-600'}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peer Comparison */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base text-gray-900">Peer Comparison Analytics</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Anonymous benchmarking with similar students</p>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Your Score</p>
                    <p className="text-xl text-blue-600">{peerComparison.yourScore}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Cohort Avg</p>
                    <p className="text-xl text-gray-900">{peerComparison.cohortAverage}%</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Top 25%</p>
                    <p className="text-xl text-yellow-600">{peerComparison.top25Percent}%</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Top 10%</p>
                    <p className="text-xl text-green-600">{peerComparison.top10Percent}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-700 mb-2">Students Similar to You</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Average Score</p>
                      <p className="text-sm text-gray-900">{peerComparison.similarStudents.averageScore}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Study Hours/Week</p>
                      <p className="text-sm text-gray-900">{peerComparison.similarStudents.studyHours}h</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Improvement Rate</p>
                      <p className="text-sm text-gray-900">{peerComparison.similarStudents.improvementRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {peerComparison.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 bg-blue-50 rounded p-2">
                      <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Pattern Analysis */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h2 className="text-base text-gray-900">Question-Level Pattern Analysis</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Identify exactly where you struggle</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-700 mb-3">Accuracy by Question Type</p>
                    <div className="space-y-3">
                      {questionPatterns.byType.map((pattern, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">{pattern.type}</span>
                            <span className="text-xs text-gray-900">{pattern.accuracy}% ({pattern.count} qs)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getPerformanceColor(pattern.accuracy)}`}
                              style={{ width: `${pattern.accuracy}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-700 mb-3">Time-Based Accuracy Drop</p>
                    <div className="space-y-3">
                      {questionPatterns.timeBasedAccuracy.map((pattern, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">{pattern.timeSlot}</span>
                            <span className="text-xs text-gray-900">{pattern.accuracy}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getPerformanceColor(pattern.accuracy)}`}
                              style={{ width: `${pattern.accuracy}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-900">
                      Your accuracy drops 23% after 45 minutes. Consider taking a 5-minute break every 45 minutes!
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Mental Wellness Tracker */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border-2 border-pink-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <h2 className="text-sm text-gray-900">Mental Wellness</h2>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Current Mood</span>
                    <span className="text-2xl">{getMoodEmoji(mentalWellness.currentMood)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Stress Level</span>
                    <span className="text-xs text-gray-900">{mentalWellness.stressLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${mentalWellness.stressLevel > 70 ? 'bg-red-500' : mentalWellness.stressLevel > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${mentalWellness.stressLevel}%` }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-700 mb-2">Weekly Mood Tracking</p>
                  <div className="flex items-end justify-between h-24 gap-1">
                    {mentalWellness.weeklyMoods.map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-pink-400 to-pink-200 rounded-t transition-all hover:from-pink-500 hover:to-pink-300 cursor-pointer"
                          style={{ height: `${100 - day.stress}%` }}
                          title={`${day.day}: ${getMoodEmoji(day.mood)} (${day.stress}% stress)`}
                        />
                        <span className="text-xs text-gray-600 mt-1">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-700">Recommendations:</p>
                  {mentalWellness.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 bg-white rounded p-2">
                      <CheckCircle className="w-3 h-3 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spaced Repetition Schedule */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm text-gray-900">Spaced Repetition</h2>
                </div>

                <div className="space-y-3">
                  {revisionSchedule.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                        item.priority === 'high' ? 'border-red-200 bg-red-50' :
                        item.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}
                      onClick={() => {
                        if(item.priority === 'high' && onNavigate) {
                          if(confirm(`Start reviewing ${item.topic}?\n\nThis topic needs attention (${item.mastery}% mastery).\n\nClick OK to begin revision!`)) {
                            onNavigate('learning');
                          }
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-900">{item.topic}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Next: {item.nextReview}</span>
                        <span className="text-gray-600">Mastery: {item.mastery}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Exam Strategy */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h2 className="text-sm text-gray-900">Multi-Exam Strategy</h2>
                </div>

                <div className="space-y-3 mb-4">
                  {multiExamStrategy.exams.map((exam, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-900">{exam.name}</span>
                        <span className="text-xs text-gray-500">{exam.daysLeft} days</span>
                      </div>
                      <div className="mb-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${exam.readiness}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{exam.readiness}% Ready</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 mb-2">Syllabus Overlap Optimization</p>
                  <p className="text-xs text-gray-600">
                    📊 Study Chemistry & Math for all 3 exams. Physics for JEE & MHT-CET. Biology for NEET only.
                  </p>
                </div>
              </div>

              {/* Video Learning Analytics */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-red-600" />
                  <h2 className="text-sm text-gray-900">Video Learning</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Videos Watched</p>
                    <p className="text-lg text-gray-900">{videoAnalytics.totalWatched}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
                    <p className="text-lg text-green-600">{videoAnalytics.avgCompletionRate}%</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-700">Most Rewatched Topics:</p>
                  {videoAnalytics.mostRewatched.map((topic, idx) => (
                    <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <p className="text-xs text-gray-900">{topic.topic}</p>
                      <p className="text-xs text-gray-600">
                        You: {topic.rewatches}x | Average: {topic.avgOthers}x
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Pause className="w-3 h-3 text-gray-600" />
                    <span>{videoAnalytics.engagementPatterns.pauses}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <SkipForward className="w-3 h-3 text-gray-600" />
                    <span>{videoAnalytics.engagementPatterns.skips}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Rewind className="w-3 h-3 text-gray-600" />
                    <span>{videoAnalytics.engagementPatterns.rewinds}</span>
                  </div>
                </div>
              </div>

              {/* Badges Collection */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h2 className="text-sm text-gray-900">Achievement Badges</h2>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`rounded-lg p-3 text-center cursor-pointer transition-all ${
                        badge.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 hover:shadow-md' : 'bg-gray-50 opacity-50'
                      }`}
                      title={badge.description}
                      onClick={() => {
                        if(badge.earned) {
                          alert(`🏆 ${badge.name}\n\n${badge.description}\n\nEarned! Keep it up! 🎉`);
                        } else {
                          alert(`🔒 ${badge.name}\n\n${badge.description}\n\nNot yet earned. Keep working towards it!`);
                        }
                      }}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-xs text-gray-900">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Schedule Time Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Schedule Biology Study Time</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Add 1.5 hours of Biology to maintain your trajectory</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-700 mb-1 block">Select Day</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Today</option>
                  <option>Tomorrow</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-700 mb-1 block">Select Time</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>3:00 PM - 4:30 PM (Peak time for Biology)</option>
                  <option>6:00 PM - 7:30 PM</option>
                  <option>8:00 PM - 9:30 PM</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowScheduleModal(false);
                    alert("✅ Biology study session scheduled!\n\nYou'll receive a reminder 15 minutes before.");
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-all"
                >
                  Schedule
                </button>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
