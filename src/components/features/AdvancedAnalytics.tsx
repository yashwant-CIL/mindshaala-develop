import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  Brain,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const overallStats = {
    averageScore: 78,
    scoreChange: +5.2,
    totalTests: 24,
    studyHours: 42.5,
    hoursChange: +3.5,
    accuracy: 82,
    accuracyChange: +2.1,
    speed: 85,
    speedChange: -1.3
  };

  const subjectPerformance = [
    {
      subject: 'Physics',
      score: 85,
      trend: 'up',
      change: 8,
      tests: 8,
      strengths: ['Mechanics', 'Thermodynamics'],
      weaknesses: ['Optics', 'Modern Physics'],
      prediction: 88,
      color: 'blue'
    },
    {
      subject: 'Chemistry',
      score: 72,
      trend: 'up',
      change: 3,
      tests: 6,
      strengths: ['Organic Chemistry'],
      weaknesses: ['Physical Chemistry', 'Inorganic'],
      prediction: 75,
      color: 'green'
    },
    {
      subject: 'Mathematics',
      score: 68,
      trend: 'down',
      change: -2,
      tests: 7,
      strengths: ['Algebra'],
      weaknesses: ['Calculus', 'Trigonometry'],
      prediction: 72,
      color: 'purple'
    },
    {
      subject: 'Biology',
      score: 88,
      trend: 'up',
      change: 6,
      tests: 3,
      strengths: ['Genetics', 'Ecology'],
      weaknesses: ['Human Physiology'],
      prediction: 92,
      color: 'orange'
    }
  ];

  const weeklyProgress = [
    { week: 'Week 1', score: 72, studyHours: 8 },
    { week: 'Week 2', score: 75, studyHours: 10 },
    { week: 'Week 3', score: 73, studyHours: 9 },
    { week: 'Week 4', score: 78, studyHours: 12 }
  ];

  const topicMastery = [
    { topic: 'Newton\'s Laws', mastery: 95, category: 'Mastered', color: 'green' },
    { topic: 'Thermodynamics', mastery: 88, category: 'Proficient', color: 'blue' },
    { topic: 'Light & Optics', mastery: 62, category: 'Learning', color: 'yellow' },
    { topic: 'Modern Physics', mastery: 45, category: 'Needs Work', color: 'red' },
    { topic: 'Electromagnetic', mastery: 78, category: 'Proficient', color: 'blue' },
    { topic: 'Sound Waves', mastery: 91, category: 'Mastered', color: 'green' }
  ];

  const studyPatterns = {
    bestStudyTime: '6:00 PM - 8:00 PM',
    averageSessionDuration: '45 minutes',
    peakConcentrationDay: 'Wednesday',
    consistencyScore: 85,
    focusScore: 78
  };

  const aiPredictions = [
    {
      type: 'warning',
      title: 'Mathematics Needs Attention',
      message: 'Based on current trajectory, you might score 68% in upcoming Math test. Recommended: 2 extra hours of practice.',
      impact: 'high',
      action: 'Create Math Study Plan'
    },
    {
      type: 'success',
      title: 'Physics Performance Excellent',
      message: 'You\'re on track to score 88%+ in Physics. Keep up the current pace!',
      impact: 'positive',
      action: 'View Progress'
    },
    {
      type: 'insight',
      title: 'Optimal Study Window Detected',
      message: 'Your concentration peaks at 6-8 PM. Schedule difficult topics during this time for 25% better retention.',
      impact: 'medium',
      action: 'Optimize Schedule'
    }
  ];

  const compareWithPeers = {
    yourRank: 145,
    totalStudents: 2500,
    percentile: 94,
    nationalAverage: 65,
    yourScore: 78,
    topPerformer: 95
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl mb-1">Advanced Analytics</h2>
            <p className="text-sm text-blue-100">AI-powered insights to accelerate your growth</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                timeRange === 'week' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                timeRange === 'month' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                timeRange === 'quarter' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Quarter
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Average Score</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl text-gray-900">{overallStats.averageScore}%</span>
            <span className="text-sm text-green-600 flex items-center mb-1">
              <ArrowUp className="w-3 h-3" />
              {overallStats.scoreChange}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">vs last {timeRange}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Study Hours</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl text-gray-900">{overallStats.studyHours}h</span>
            <span className="text-sm text-green-600 flex items-center mb-1">
              <ArrowUp className="w-3 h-3" />
              {overallStats.hoursChange}h
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{overallStats.totalTests} tests taken</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Accuracy</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl text-gray-900">{overallStats.accuracy}%</span>
            <span className="text-sm text-green-600 flex items-center mb-1">
              <ArrowUp className="w-3 h-3" />
              {overallStats.accuracyChange}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Correct answers</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Speed Score</span>
            <Zap className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl text-gray-900">{overallStats.speed}%</span>
            <span className="text-sm text-red-600 flex items-center mb-1">
              <ArrowDown className="w-3 h-3" />
              {Math.abs(overallStats.speedChange)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Questions/minute</p>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Predictions & Recommendations
        </h3>
        <div className="space-y-3">
          {aiPredictions.map((prediction, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                prediction.type === 'warning' ? 'border-red-500 bg-red-50' :
                prediction.type === 'success' ? 'border-green-500 bg-green-50' :
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {prediction.type === 'warning' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    {prediction.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {prediction.type === 'insight' && <Sparkles className="w-4 h-4 text-blue-600" />}
                    <h4 className="text-sm text-gray-900">{prediction.title}</h4>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{prediction.message}</p>
                </div>
                <button className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                  prediction.type === 'warning' ? 'bg-red-600 text-white hover:bg-red-700' :
                  prediction.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                  'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {prediction.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subject Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm text-gray-900 mb-4">Subject-wise Performance</h3>
          <div className="space-y-4">
            {subjectPerformance.map((subject, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{subject.subject}</span>
                    {subject.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-900">{subject.score}%</span>
                    <span className={`text-xs ml-2 ${subject.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {subject.trend === 'up' ? '+' : ''}{subject.change}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${subject.color}-500 rounded-full transition-all duration-500`}
                    style={{ width: `${subject.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{subject.tests} tests</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-blue-600">Predicted: {subject.prediction}%</span>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-xs pt-1">
                  <div className="flex-1">
                    <span className="text-gray-500">Strong:</span>
                    <p className="text-green-700">{subject.strengths.join(', ')}</p>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-500">Weak:</span>
                    <p className="text-red-700">{subject.weaknesses.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm text-gray-900 mb-4">Topic Mastery Level</h3>
          <div className="space-y-3">
            {topicMastery.map((topic, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{topic.topic}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    topic.color === 'green' ? 'bg-green-100 text-green-700' :
                    topic.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    topic.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {topic.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        topic.color === 'green' ? 'bg-green-500' :
                        topic.color === 'blue' ? 'bg-blue-500' :
                        topic.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-10 text-right">{topic.mastery}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Patterns & Peer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Study Patterns */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-5">
          <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Your Study Patterns
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Best Study Time</p>
              <p className="text-sm text-gray-900">{studyPatterns.bestStudyTime}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Average Session Duration</p>
              <p className="text-sm text-gray-900">{studyPatterns.averageSessionDuration}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Peak Concentration Day</p>
              <p className="text-sm text-gray-900">{studyPatterns.peakConcentrationDay}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Consistency</p>
                <p className="text-lg text-green-600">{studyPatterns.consistencyScore}%</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Focus Score</p>
                <p className="text-lg text-blue-600">{studyPatterns.focusScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Peer Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Compare with Peers
          </h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Your Percentile</p>
              <p className="text-3xl text-blue-600 mb-1">{compareWithPeers.percentile}%</p>
              <p className="text-xs text-gray-500">
                Rank {compareWithPeers.yourRank} out of {compareWithPeers.totalStudents.toLocaleString()} students
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Your Score</span>
                <span className="text-sm text-gray-900">{compareWithPeers.yourScore}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${compareWithPeers.yourScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">National Average</span>
                <span className="text-sm text-gray-900">{compareWithPeers.nationalAverage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${compareWithPeers.nationalAverage}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Top Performer</span>
                <span className="text-sm text-gray-900">{compareWithPeers.topPerformer}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${compareWithPeers.topPerformer}%` }}
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-900">
                <strong>Great job!</strong> You're performing {compareWithPeers.yourScore - compareWithPeers.nationalAverage}% above the national average!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
