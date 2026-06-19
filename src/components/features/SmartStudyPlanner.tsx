import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  Brain,
  CheckCircle,
  Circle,
  Zap,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  PlayCircle,
  Sparkles
} from 'lucide-react';

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  aiRecommended?: boolean;
  timeSlot: string;
}

export function SmartStudyPlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');

  const todayTasks: StudyTask[] = [
    {
      id: '1',
      subject: 'Physics',
      topic: 'Light Refraction & Lenses',
      duration: 45,
      priority: 'high',
      completed: false,
      aiRecommended: true,
      timeSlot: '06:00 PM - 06:45 PM'
    },
    {
      id: '2',
      subject: 'Mathematics',
      topic: 'Quadratic Equations - Practice',
      duration: 30,
      priority: 'high',
      completed: false,
      aiRecommended: true,
      timeSlot: '06:45 PM - 07:15 PM'
    },
    {
      id: '3',
      subject: 'Chemistry',
      topic: 'Periodic Table Revision',
      duration: 25,
      priority: 'medium',
      completed: true,
      timeSlot: '07:15 PM - 07:40 PM'
    },
    {
      id: '4',
      subject: 'Break',
      topic: 'Relax & Recharge',
      duration: 15,
      priority: 'low',
      completed: false,
      timeSlot: '07:40 PM - 07:55 PM'
    },
    {
      id: '5',
      subject: 'Physics',
      topic: 'Practice MCQs - 20 Questions',
      duration: 30,
      priority: 'medium',
      completed: false,
      timeSlot: '08:00 PM - 08:30 PM'
    }
  ];

  const weeklyGoals = [
    { subject: 'Physics', completed: 12, total: 15, percentage: 80 },
    { subject: 'Chemistry', completed: 10, total: 12, percentage: 83 },
    { subject: 'Mathematics', completed: 8, total: 15, percentage: 53 },
    { subject: 'Biology', completed: 14, total: 15, percentage: 93 }
  ];

  const aiInsights = [
    {
      type: 'recommendation',
      icon: Brain,
      color: 'purple',
      title: 'Best Study Time Detected',
      message: 'Your peak concentration is between 6-8 PM. I\'ve scheduled critical topics in this window.'
    },
    {
      type: 'warning',
      icon: AlertCircle,
      color: 'orange',
      title: 'Attention Needed',
      message: 'Mathematics practice is behind schedule. Consider adding 30 mins extra this week.'
    },
    {
      type: 'achievement',
      icon: TrendingUp,
      color: 'green',
      title: 'Great Progress!',
      message: 'You\'ve maintained a 7-day study streak. Keep it up! 🔥'
    }
  ];

  const upcomingTests = [
    { subject: 'Physics', topic: 'Optics', date: '2 days', type: 'Chapter Test' },
    { subject: 'Chemistry', topic: 'Full Syllabus', date: '5 days', type: 'Mock Test' },
    { subject: 'Math', topic: 'Algebra', date: '1 week', type: 'Practice Test' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const totalMinutesToday = todayTasks.reduce((sum, task) => sum + task.duration, 0);
  const completedMinutes = todayTasks.filter(t => t.completed).reduce((sum, task) => sum + task.duration, 0);
  const progressPercentage = (completedMinutes / totalMinutesToday) * 100;

  return (
    <div className="space-y-5">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl mb-1">Smart Study Planner</h2>
            <p className="text-sm text-purple-100">AI-optimized schedule for maximum productivity</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs text-purple-100">Today's Target</span>
            </div>
            <p className="text-2xl">{totalMinutesToday} min</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs text-purple-100">Tasks Done</span>
            </div>
            <p className="text-2xl">{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs text-purple-100">Study Streak</span>
            </div>
            <p className="text-2xl">7 days 🔥</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column - Today's Schedule */}
        <div className="lg:col-span-2 space-y-5">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-gray-900">Today's Progress</h3>
              <span className="text-sm text-blue-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedMinutes} of {totalMinutesToday} minutes completed
            </p>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm text-gray-900">Today's Schedule</h3>
                <p className="text-xs text-gray-500">Saturday, December 27, 2025</p>
              </div>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Add Task
              </button>
            </div>

            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${
                    task.completed ? 'bg-gray-50 border-gray-300 opacity-75' : getPriorityColor(task.priority)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button 
                        className={`mt-0.5 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.topic}
                          </h4>
                          {task.aiRecommended && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI Pick
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{task.subject}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.duration} min
                          </span>
                          <span className="text-xs text-gray-500">{task.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!task.completed && task.subject !== 'Break' && (
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4">Weekly Goals Progress</h3>
            <div className="space-y-4">
              {weeklyGoals.map((goal, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-700">{goal.subject}</span>
                    <span className="text-xs text-gray-600">{goal.completed}/{goal.total} sessions</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        goal.percentage >= 80 ? 'bg-green-500' : 
                        goal.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Insights & Upcoming */}
        <div className="space-y-5">
          {/* AI Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              AI Insights
            </h3>
            <div className="space-y-3">
              {aiInsights.map((insight, idx) => {
                const Icon = insight.icon;
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border-l-4 border-${insight.color}-500 bg-${insight.color}-50`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 text-${insight.color}-600 mt-0.5`} />
                      <div>
                        <p className="text-xs text-gray-900 mb-1">{insight.title}</p>
                        <p className="text-xs text-gray-600">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Tests */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4">Upcoming Tests</h3>
            <div className="space-y-3">
              {upcomingTests.map((test, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-900">{test.subject}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {test.date}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{test.topic}</p>
                  <p className="text-xs text-gray-500 mt-1">{test.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-5">
            <h3 className="text-sm text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2.5 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center justify-between px-3 border border-gray-200">
                <span>Generate AI Study Plan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full py-2.5 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center justify-between px-3 border border-gray-200">
                <span>Set Study Reminder</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full py-2.5 bg-white rounded-lg text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center justify-between px-3 border border-gray-200">
                <span>Adjust Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
