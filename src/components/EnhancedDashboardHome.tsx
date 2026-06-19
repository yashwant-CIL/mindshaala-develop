import { 
  Sparkles, 
  Target, 
  Zap, 
  Trophy, 
  Brain,
  Calendar,
  BookOpen,
  TrendingUp,
  Flame,
  Star,
  Clock,
  CheckCircle,
  ChevronRight,
  Play,
  Award,
  Users,
  MessageCircle
} from 'lucide-react';

interface EnhancedDashboardHomeProps {
  profileData: any;
  onNavigate: (page: string) => void;
  onOpenAICompanion: () => void;
  onOpenFocusMode: () => void;
}

export function EnhancedDashboardHome({ profileData, onNavigate, onOpenAICompanion, onOpenFocusMode }: EnhancedDashboardHomeProps) {
  const todayStats = {
    streak: 7,
    studyTime: 125, // minutes
    questionsCompleted: 45,
    accuracy: 88
  };

  const quickActions = [
    {
      id: 'studyplanner',
      title: 'Smart Study Planner',
      description: 'AI-optimized daily schedule',
      icon: Calendar,
      color: 'purple',
      gradient: 'from-purple-500 to-blue-500',
      stat: '5 tasks today'
    },
    {
      id: 'questionbank',
      title: 'Question Bank',
      description: '50,000+ practice questions',
      icon: BookOpen,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      stat: '1,250 attempted'
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'AI predictions & insights',
      icon: TrendingUp,
      color: 'green',
      gradient: 'from-green-500 to-teal-500',
      stat: '78% average'
    },
    {
      id: 'gamification',
      title: 'Achievements & Rewards',
      description: 'Level up your learning',
      icon: Trophy,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
      stat: 'Level 12'
    }
  ];

  const aiFeatures = [
    {
      title: 'AI Study Companion',
      description: 'Get instant help with concepts, doubts, and study strategies',
      icon: Brain,
      action: 'Chat Now',
      onClick: onOpenAICompanion
    },
    {
      title: 'Focus Mode (Pomodoro)',
      description: 'Stay focused with timed study sessions and break reminders',
      icon: Clock,
      action: 'Start Session',
      onClick: onOpenFocusMode
    }
  ];

  const upcomingMilestones = [
    { title: 'Physics Chapter Test', date: 'Tomorrow', progress: 85, color: 'blue' },
    { title: 'MHT-CET Mock Test', date: 'In 3 days', progress: 60, color: 'purple' },
    { title: 'Complete 100 Questions', date: 'This week', progress: 73, color: 'green' }
  ];

  const recentActivity = [
    { type: 'achievement', title: '7-Day Streak Unlocked!', time: '2 hours ago', icon: Flame, color: 'orange' },
    { type: 'test', title: 'Physics Test: 18/20', time: '5 hours ago', icon: CheckCircle, color: 'green' },
    { type: 'practice', title: 'Completed 50 MCQs', time: 'Yesterday', icon: Target, color: 'blue' },
    { type: 'level', title: 'Reached Level 12', time: '2 days ago', icon: Trophy, color: 'yellow' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2">
                Welcome back, {profileData?.firstName || 'Student'}! 👋
              </h1>
              <p className="text-lg text-blue-100">
                Ready to achieve greatness today? Let's make it count!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <Sparkles className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-sm text-blue-100">Study Streak</span>
              </div>
              <p className="text-3xl">{todayStats.streak} days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-300" />
                <span className="text-sm text-blue-100">Study Time</span>
              </div>
              <p className="text-3xl">{todayStats.studyTime}m</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-300" />
                <span className="text-sm text-blue-100">Questions</span>
              </div>
              <p className="text-3xl">{todayStats.questionsCompleted}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-blue-100">Accuracy</span>
              </div>
              <p className="text-3xl">{todayStats.accuracy}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <button
              key={idx}
              onClick={feature.onClick}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI-Powered
                </span>
              </div>
              <h3 className="text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
              <div className="flex items-center gap-2 text-purple-600">
                <span className="text-sm">{feature.action}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-600" />
          Quick Access Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm text-gray-900 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{action.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{action.stat}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Milestones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Upcoming Milestones
          </h3>
          <div className="space-y-4">
            {upcomingMilestones.map((milestone, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">{milestone.title}</p>
                    <p className="text-xs text-gray-500">{milestone.date}</p>
                  </div>
                  <span className="text-sm text-gray-900">{milestone.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${milestone.color}-500 rounded-full transition-all duration-500`}
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Motivational Banner */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl mb-2">🎯 You're on fire!</h3>
            <p className="text-sm text-green-100">
              You're performing {15}% better than last week. Keep up the amazing work!
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <span>View Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}
