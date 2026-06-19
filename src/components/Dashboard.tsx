import { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import { 
  Search, 
  Bell, 
  LayoutDashboard, 
  TrendingUp, 
  BookOpen, 
  FileText, 
  ClipboardCheck, 
  HelpCircle, 
  CreditCard, 
  Settings, 
  Users,
  Share2,
  LogOut,
  Target,
  Clock,
  Trophy,
  Sparkles,
  Calendar,
  ChevronRight,
  Lock,
  Play,
  Brain,
  ChevronDown,
  Award,
  Activity,
  Zap,
  Flame,
  Star,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Medal,
  BookMarked,
  Video,
  Headphones,
  FileQuestion,
  Timer
} from 'lucide-react';
import { PerformancePage } from './dashboard/PerformancePage';
import { MyCoursesPage } from './dashboard/MyCoursesPage';
import { NotificationsPage } from './dashboard/NotificationsPage';
import { SettingsPage } from './dashboard/SettingsPage';
import { AssessmentProgressModal } from './AssessmentProgressModal';
import Cookies from 'js-cookie';

interface DashboardProps {
  profileData: any;
  results: any;
  onStartCourse: () => void;
  onOpenTestGen: () => void;
  onOpenTestResults: () => void;
  onOpenAskDoubt: () => void;
  onNavigate: (page: string) => void;
}

export type DashboardPage = 'dashboard' | 'performance' | 'courses' | 'notifications' | 'settings';

export function Dashboard({ profileData, results, onStartCourse, onOpenTestGen, onOpenTestResults, onOpenAskDoubt }: DashboardProps) {
  const [activePage, setActivePage] = useState<DashboardPage>('dashboard');
  const [activeBoard, setActiveBoard] = useState('ICSE');

  // Return only the content, no sidebar
  return (
    <>
      {activePage === 'dashboard' && (
        <DashboardContent 
          profileData={profileData}
          results={results}
          onStartCourse={onStartCourse}
          onOpenTestGen={onOpenTestGen}
          onOpenTestResults={onOpenTestResults}
          onOpenAskDoubt={onOpenAskDoubt}
          onNavigate={setActivePage}
        />
      )}
      {activePage === 'performance' && (
        <PerformancePage />
      )}
      {activePage === 'courses' && (
        <MyCoursesPage onStartCourse={onStartCourse} />
      )}
      {activePage === 'notifications' && (
        <NotificationsPage />
      )}
      {activePage === 'settings' && (
        <SettingsPage profileData={profileData} />
      )}
    </>
  );
}

interface DashboardContentProps {
  profileData: any;
  results: any;
  onStartCourse: () => void;
  onOpenTestGen: () => void;
  onOpenTestResults: () => void;
  onOpenAskDoubt: () => void;
  onNavigate: (page: DashboardPage) => void;
}

function DashboardContent({ profileData, results, onStartCourse, onOpenTestGen, onOpenTestResults, onOpenAskDoubt, onNavigate }: DashboardContentProps) {
  const username = profileData?.username || profileData?.firstName || localStorage.getItem('username') || Cookies.get('username') || "Student";
  const { courses, selectedCourse, selectCourse, fetchCourses } = useCourse();
  const [selectedWeek, setSelectedWeek] = useState('This Week');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  
  useEffect(() => {
    const userId = localStorage.getItem('user_id') || Cookies.get("user_id");
    console.log("Dashboard userId check:", userId);
    // Ensure courses are loaded if not already
    if (userId && courses.length === 0) {
        fetchCourses(userId);
    }
  }, []);

  // Calculate assessment performance classification
  const getPerformanceClassification = () => {
    if (!results || !results.percentage) return null;
    const percentage = results.percentage;
    
    if (percentage >= 85) {
      return { grade: 'A', label: 'Topper-Ready', color: 'green', description: 'High cognitive ability + solid foundations' };
    } else if (percentage >= 70) {
      return { grade: 'B', label: 'Strong but Inconsistent', color: 'blue', description: 'Good potential, needs discipline/focus' };
    } else if (percentage >= 55) {
      return { grade: 'C', label: 'Average with Gaps', color: 'yellow', description: 'Specific conceptual holes to fill' };
    } else if (percentage >= 40) {
      return { grade: 'D', label: 'Weak Fundamentals', color: 'orange', description: 'Needs systematic rebuilding' };
    } else {
      return { grade: 'E', label: 'Critical Deficit', color: 'red', description: 'Intensive intervention required' };
    }
  };

  const classification = getPerformanceClassification();

  // Get weak topics from assessment
  const getWeakTopics = () => {
    if (!results || !results.detailedResults) return [];
    return results.detailedResults
      .filter((r: any) => !r.isCorrect)
      .map((r: any) => r.question.category)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
      .slice(0, 3);
  };

  const weakTopics = getWeakTopics();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', active: true },
    { icon: TrendingUp, label: 'Performance', id: 'performance' },
    { icon: BookOpen, label: 'My Courses', id: 'courses' },
    { icon: FileText, label: 'Study Material', id: 'material' },
    { icon: ClipboardCheck, label: 'Take Test', id: 'test', onClick: onOpenTestGen },
    { icon: FileText, label: 'Test Results', id: 'results', onClick: onOpenTestResults },
    { icon: HelpCircle, label: 'Ask a Doubt', id: 'doubt', onClick: onOpenAskDoubt },
    { icon: CreditCard, label: 'Subscription', id: 'subscription' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Users, label: 'Mentor Dashboard', id: 'mentor' },
    { icon: Share2, label: 'Content Mgmt', id: 'content' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const boards = ['ICSE Class 10', 'MHT-CET'];

  const studyPlan = [
    {
      time: '2:00 PM',
      subject: 'Physics: Newton Numericals',
      status: 'Done',
      color: 'green',
      duration: '45 min',
      icon: Video
    },
    {
      time: '4:30 PM',
      subject: 'Math: Quadratic Equations',
      subtitle: 'Focus on Word Problems (Type 2)',
      status: 'Start',
      color: 'blue',
      duration: '60 min',
      icon: BookOpen
    },
    {
      time: '7:00 PM',
      subject: 'History: Gandhi Era Revision',
      status: 'Locked',
      color: 'gray',
      duration: '30 min',
      icon: Headphones
    },
  ];

  const examSchedule = [
    {
      subject: 'Maths: Commercial Mathematics',
      date: 'Tomorrow, 10:00 AM',
      tag: 'MOCK TEST',
      color: 'orange',
      duration: '2 hours',
      totalMarks: 100
    },
    {
      subject: 'Physics: Full Syllabus Mock',
      date: 'Thu 28, 09:00 AM',
      tag: 'TRIAL TEST',
      color: 'blue',
      duration: '3 hours',
      totalMarks: 100
    },
    {
      subject: 'English Lit: Merchant of Venice',
      date: 'Sat 30, 11:00 AM',
      tag: 'CHAPTER TEST',
      color: 'purple',
      duration: '1 hour',
      totalMarks: 50
    },
  ];

  const recentActivity = [
    {
      title: 'Completed: Organic Chemistry Test',
      time: '2 hours ago',
      score: '45/50',
      type: 'test'
    },
    {
      title: 'Watched: Newton\'s Laws - Advanced',
      time: '5 hours ago',
      progress: '100%',
      type: 'video'
    },
    {
      title: 'Asked Doubt: Quadratic Formula',
      time: 'Yesterday',
      status: 'Answered',
      type: 'doubt'
    }
  ];

  const leaderboard = [
    { name: 'Aarav Patel', score: 2847, rank: 1, avatar: 'AP' },
    { name: 'You (Rohan Sharma)', score: 2635, rank: 2, avatar: 'RS', isYou: true },
    { name: 'Priya Desai', score: 2598, rank: 3, avatar: 'PD' },
    { name: 'Arjun Kumar', score: 2542, rank: 4, avatar: 'AK' },
    { name: 'Meera Singh', score: 2501, rank: 5, avatar: 'MS' },
  ];

  const achievements = [
    { icon: Flame, label: '12 Day Streak', color: 'orange' },
    { icon: Trophy, label: 'Top 5%', color: 'yellow' },
    { icon: Target, label: '95% Accuracy', color: 'green' },
    { icon: Zap, label: 'Speed Master', color: 'blue' },
  ];

  const weeklyProgress = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 5.2 },
    { day: 'Wed', hours: 3.8 },
    { day: 'Thu', hours: 6.1 },
    { day: 'Fri', hours: 4.7 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun', hours: 3.2 },
  ];

  const maxHours = Math.max(...weeklyProgress.map(d => d.hours));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        {/* <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <select 
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none cursor-pointer max-w-[200px] truncate"
                value={selectedCourse?.subscription_id || ""}
                onChange={(e) => selectCourse(e.target.value)}
              >
                  {courses && courses.length > 0 ? (
                      courses.map((c: any) => (
                          <option key={c.subscription_id || c.id} value={c.subscription_id || c.id}>
                              {c.subscription_name}
                          </option>
                      ))
                  ) : (
                      <option value="">Loading Courses...</option>
                  )}
              </select>
              
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, tests, topics..."
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-1.5 hover:bg-gray-50 rounded-md">
                <Bell className="w-4 h-4 text-gray-600" />
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div> */}

        {/* Dashboard Content */}
        <div className="p-6">
          {/* 🚀 INNOVATIVE TOPPER FEATURES BANNER */}
          <div className="mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      🚀 Revolutionary Topper Features Now Live!
                    </h3>
                    <p className="text-white/90 text-sm">
                      AI-powered tools based on neuroscience research to transform you into a topper
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
                  NEW
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <Brain className="w-5 h-5 mb-1" />
                  <div className="text-sm font-semibold">AI Study Coach</div>
                  <div className="text-xs text-white/80">+183% efficiency</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <Calendar className="w-5 h-5 mb-1" />
                  <div className="text-sm font-semibold">Smart Revision</div>
                  <div className="text-xs text-white/80">90% retention</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <Trophy className="w-5 h-5 mb-1" />
                  <div className="text-sm font-semibold">Exam Simulator</div>
                  <div className="text-xs text-white/80">-64% anxiety</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <Users className="w-5 h-5 mb-1" />
                  <div className="text-sm font-semibold">Peer Network</div>
                  <div className="text-xs text-white/80">+400% toppers</div>
                </div>
              </div>

              <button 
                onClick={() => {
                  const sidebar = document.querySelector('[data-sidebar]');
                  if (sidebar) {
                    const innovativeBtn = sidebar.querySelector('[data-page="innovative-features"]') as HTMLElement;
                    if (innovativeBtn) innovativeBtn.click();
                  }
                }}
                className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                Explore All Features →
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Initial Assessment Classification Banner */}
          {classification && (
            <div className={`mb-5 rounded-xl p-5 border-2 shadow-lg ${
              classification.color === 'green' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' :
              classification.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300' :
              classification.color === 'yellow' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300' :
              classification.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300' :
              'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold ${
                    classification.color === 'green' ? 'bg-green-500 text-white' :
                    classification.color === 'blue' ? 'bg-blue-500 text-white' :
                    classification.color === 'yellow' ? 'bg-yellow-500 text-white' :
                    classification.color === 'orange' ? 'bg-orange-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {classification.grade}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-xl font-bold ${
                        classification.color === 'green' ? 'text-green-900' :
                        classification.color === 'blue' ? 'text-blue-900' :
                        classification.color === 'yellow' ? 'text-yellow-900' :
                        classification.color === 'orange' ? 'text-orange-900' :
                        'text-red-900'
                      }`}>
                        {classification.label}
                      </h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        classification.color === 'green' ? 'bg-green-200 text-green-800' :
                        classification.color === 'blue' ? 'bg-blue-200 text-blue-800' :
                        classification.color === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                        classification.color === 'orange' ? 'bg-orange-200 text-orange-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        INITIAL ASSESSMENT
                      </span>
                    </div>
                    <p className={`text-sm ${
                      classification.color === 'green' ? 'text-green-700' :
                      classification.color === 'blue' ? 'text-blue-700' :
                      classification.color === 'yellow' ? 'text-yellow-700' :
                      classification.color === 'orange' ? 'text-orange-700' :
                      'text-red-700'
                    }`}>
                      {classification.description}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onOpenTestResults}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    classification.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    classification.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                    classification.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                    classification.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                    'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  View Full Report
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* AI Recommended Path */}
                <div className={`bg-white rounded-lg p-4 border ${
                  classification.color === 'green' ? 'border-green-200' :
                  classification.color === 'blue' ? 'border-blue-200' :
                  classification.color === 'yellow' ? 'border-yellow-200' :
                  classification.color === 'orange' ? 'border-orange-200' :
                  'border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className={`w-5 h-5 ${
                      classification.color === 'green' ? 'text-green-600' :
                      classification.color === 'blue' ? 'text-blue-600' :
                      classification.color === 'yellow' ? 'text-yellow-600' :
                      classification.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`} />
                    <h4 className="text-sm font-bold text-gray-900">AI Recommended Path</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-700">Current Grade Syllabus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-700">Focus: Bridge Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-700">Daily Practice Tests</span>
                    </div>
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div className={`bg-white rounded-lg p-4 border ${
                  classification.color === 'green' ? 'border-green-200' :
                  classification.color === 'blue' ? 'border-blue-200' :
                  classification.color === 'yellow' ? 'border-yellow-200' :
                  classification.color === 'orange' ? 'border-orange-200' :
                  'border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className={`w-5 h-5 ${
                      classification.color === 'green' ? 'text-green-600' :
                      classification.color === 'blue' ? 'text-blue-600' :
                      classification.color === 'yellow' ? 'text-yellow-600' :
                      classification.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`} />
                    <h4 className="text-sm font-bold text-gray-900">Priority Topics</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {weakTopics.length > 0 ? weakTopics.map((topic: any, idx: any) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs"
                      >
                        {topic}
                      </span>
                    )) : (
                      <span className="text-xs text-gray-500">Great! No critical gaps found.</span>
                    )}
                  </div>
                </div>

                {/* Progress Since Onboarding */}
                <div className={`bg-white rounded-lg p-4 border ${
                  classification.color === 'green' ? 'border-green-200' :
                  classification.color === 'blue' ? 'border-blue-200' :
                  classification.color === 'yellow' ? 'border-yellow-200' :
                  classification.color === 'orange' ? 'border-orange-200' :
                  'border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className={`w-5 h-5 ${
                      classification.color === 'green' ? 'text-green-600' :
                      classification.color === 'blue' ? 'text-blue-600' :
                      classification.color === 'yellow' ? 'text-yellow-600' :
                      classification.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`} />
                    <h4 className="text-sm font-bold text-gray-900">Your Growth</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Initial Score</span>
                      <span className="text-xs font-bold text-gray-900">{results?.percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Current Avg</span>
                      <span className="text-xs font-bold text-green-600">84.5% ↑</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Improvement</span>
                      <span className="text-xs font-bold text-green-600">+{Math.abs(84.5 - (results?.percentage || 0)).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Header with Quick Actions */}
          <div className="mb-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-2xl text-gray-900 mb-1">
                  Namaste, {username}! 🙏
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {selectedCourse?.subscription_name || "Preparation for your goal"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={onStartCourse}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Continue Learning</span>
                </button>
                <button 
                  onClick={onOpenTestGen}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Take Test</span>
                </button>
                <button 
                  onClick={() => setShowAssessmentModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Brain className="w-4 h-4" />
                  <span>Assessment & Progress</span>
                </button>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="flex items-center gap-2">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                      achievement.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                      achievement.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      achievement.color === 'green' ? 'bg-green-50 border-green-200 text-green-700' :
                      'bg-blue-50 border-blue-200 text-blue-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{achievement.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Tests Attempted</p>
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl text-gray-900 mb-0.5">24</p>
              <div className="flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: '80%' }} />
                </div>
                <span className="text-xs text-gray-500">of 30</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Overall Aggregate</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl text-gray-900 mb-0.5">84.5%</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+2.1% this week</span>
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Study Time</p>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl text-gray-900 mb-0.5">32h 45m</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-orange-100">Class Rank</p>
                <Trophy className="w-4 h-4 text-orange-100" />
              </div>
              <p className="text-2xl mb-0.5">#2</p>
              <p className="text-xs text-orange-100">98.5 percentile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column - 2 cols */}
            <div className="lg:col-span-2 space-y-5">
              {/* AI Daily Study Plan */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm text-gray-900">AI Daily Study Plan</h3>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700">Customize Plan</button>
                </div>

                <p className="text-xs text-gray-600 mb-3">
                  Your personalized timeline for today, Saturday.
                </p>

                <div className="space-y-2">
                  {studyPlan.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 py-2.5 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                          item.color === 'green' ? 'bg-green-100' :
                          item.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <ItemIcon className={`w-4 h-4 ${
                            item.color === 'green' ? 'text-green-600' :
                            item.color === 'blue' ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{item.subject}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{item.time}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{item.duration}</span>
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                        
                        <button
                          disabled={item.status === 'Locked'}
                          className={`px-4 py-1.5 rounded-md text-xs transition-colors ${
                            item.status === 'Done'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : item.status === 'Start'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                          onClick={() => item.status === 'Start' && onStartCourse()}
                        >
                          {item.status === 'Locked' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            item.status
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Study Progress Chart */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm text-gray-900">Weekly Study Progress</h3>
                  </div>
                  <select 
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 outline-none cursor-pointer"
                  >
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>Last Month</option>
                  </select>
                </div>

                <div className="flex items-end justify-between gap-2 h-32">
                  {weeklyProgress.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col justify-end items-center flex-1">
                        <div className="text-xs text-gray-600 mb-1">{day.hours}h</div>
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                          style={{ height: `${(day.hours / maxHours) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{day.day}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Total Hours</p>
                    <p className="text-sm text-gray-900">33h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Avg/Day</p>
                    <p className="text-sm text-gray-900">4.7h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Target</p>
                    <p className="text-sm text-green-600">On Track ✓</p>
                  </div>
                </div>
              </div>

              {/* Subject Performance */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm text-gray-900">Subject Performance</h3>
                  <button className="text-xs text-blue-600 hover:text-blue-700" onClick={onOpenTestResults}>View All</button>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Physics', score: 92, total: 100, tests: 8, trend: 'up', color: 'purple' },
                    { name: 'Mathematics', score: 87, total: 100, tests: 10, trend: 'up', color: 'orange' },
                    { name: 'Chemistry', score: 78, total: 100, tests: 7, trend: 'down', color: 'green' },
                    { name: 'English', score: 85, total: 100, tests: 6, trend: 'up', color: 'pink' },
                  ].map((subject, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{subject.name}</span>
                          {subject.trend === 'up' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{subject.tests} tests</span>
                          <span className="text-sm text-gray-900">{subject.score}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            subject.color === 'purple' ? 'bg-purple-500' :
                            subject.color === 'orange' ? 'bg-orange-500' :
                            subject.color === 'green' ? 'bg-green-500' : 'bg-pink-500'
                          }`}
                          style={{ width: `${subject.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm text-gray-900">Recent Activity</h3>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700">View All</button>
                </div>

                <div className="space-y-2">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'test' ? 'bg-blue-100' :
                        activity.type === 'video' ? 'bg-purple-100' : 'bg-green-100'
                      }`}>
                        {activity.type === 'test' ? (
                          <FileQuestion className={`w-4 h-4 text-blue-600`} />
                        ) : activity.type === 'video' ? (
                          <Video className={`w-4 h-4 text-purple-600`} />
                        ) : (
                          <HelpCircle className={`w-4 h-4 text-green-600`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{activity.time}</span>
                          {activity.score && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-green-600">{activity.score}</span>
                            </>
                          )}
                          {activity.status && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-green-600">{activity.status}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - 1 col */}
            <div className="space-y-5">
              {/* Leaderboard */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <h3 className="text-sm text-gray-900">Class Leaderboard</h3>
                </div>

                <div className="space-y-2">
                  {leaderboard.map((user, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        user.isYou ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          user.rank === 1 ? 'bg-yellow-500 text-white' :
                          user.rank === 2 ? 'bg-gray-400 text-white' :
                          user.rank === 3 ? 'bg-orange-600 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {user.rank}
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          user.isYou ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-900">{user.name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">{user.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Areas Alert */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm text-red-900">Focus Areas</h3>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {weakTopics.map((topic: any, idx: any) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-600 text-xs mt-0.5">•</span>
                      <span className="text-xs text-red-900">{topic}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors" onClick={onStartCourse}>
                  Start Practice
                </button>
              </div>

              {/* Exam Schedule */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm text-gray-900">Upcoming Tests</h3>
                </div>
                <p className="text-xs text-gray-600 mb-3">Don't miss these important exams</p>

                <div className="space-y-2">
                  {examSchedule.map((exam, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex-1">
                          <p className="text-xs text-gray-900">{exam.subject}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{exam.date}</span>
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          exam.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          exam.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {exam.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          <span>{exam.duration}</span>
                        </div>
                        <span>•</span>
                        <span>{exam.totalMarks} marks</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors" onClick={onOpenTestGen}>
                  View All Tests
                </button>
              </div>

              {/* Target Exams */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" />
                  <h3 className="text-sm">Target Exams 2025</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>ICSE 10th Boards</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Mar 2025</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>MHT-CET</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">May 2025</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>JEE Foundation</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Apr 2025</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-indigo-100">Days to ICSE</span>
                    <span>78 days</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm text-gray-900 mb-3">This Week</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Questions Solved</span>
                    <span className="text-sm text-gray-900">247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Average Accuracy</span>
                    <span className="text-sm text-green-600">84.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Learning Streak</span>
                    <span className="text-sm text-orange-600">12 days 🔥</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Doubts Resolved</span>
                    <span className="text-sm text-gray-900">8/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Progress Modal */}
      <AssessmentProgressModal 
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        results={results}
        profileData={profileData}
      />
    </div>
  );
}