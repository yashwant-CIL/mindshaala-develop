import { X, Target, TrendingUp, TrendingDown, Award, CheckCircle, Brain, Sparkles, BarChart3, Trophy, Zap, Activity } from 'lucide-react';

interface AssessmentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: any;
  profileData: any;
}

export function AssessmentProgressModal({ isOpen, onClose, results, profileData }: AssessmentProgressModalProps) {
  if (!isOpen || !results) return null;

  // Calculate assessment performance classification
  const getPerformanceClassification = () => {
    const percentage = results.percentage;
    
    if (percentage >= 85) {
      return { 
        grade: 'A', 
        label: 'Topper-Ready', 
        color: 'green', 
        description: 'High cognitive ability + solid foundations',
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-300',
        textColor: 'text-green-900',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-800',
        buttonBg: 'bg-green-600 hover:bg-green-700'
      };
    } else if (percentage >= 70) {
      return { 
        grade: 'B', 
        label: 'Strong but Inconsistent', 
        color: 'blue', 
        description: 'Good potential, needs discipline/focus',
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-900',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
        buttonBg: 'bg-blue-600 hover:bg-blue-700'
      };
    } else if (percentage >= 55) {
      return { 
        grade: 'C', 
        label: 'Average with Gaps', 
        color: 'yellow', 
        description: 'Specific conceptual holes to fill',
        bgGradient: 'from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-900',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-800',
        buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
      };
    } else if (percentage >= 40) {
      return { 
        grade: 'D', 
        label: 'Weak Fundamentals', 
        color: 'orange', 
        description: 'Needs systematic rebuilding',
        bgGradient: 'from-orange-50 to-red-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-900',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800',
        buttonBg: 'bg-orange-600 hover:bg-orange-700'
      };
    } else {
      return { 
        grade: 'E', 
        label: 'Critical Deficit', 
        color: 'red', 
        description: 'Intensive intervention required',
        bgGradient: 'from-red-50 to-pink-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-900',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800',
        buttonBg: 'bg-red-600 hover:bg-red-700'
      };
    }
  };

  const classification = getPerformanceClassification();

  // Get weak topics from assessment
  const getWeakTopics = () => {
    if (!results.detailedResults) return [];
    return results.detailedResults
      .filter((r: any) => !r.isCorrect)
      .map((r: any) => r.question.category)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
      .slice(0, 5);
  };

  const weakTopics = getWeakTopics();

  // Subject-wise performance
  const subjectColors: Record<string, { bg: string; text: string; bar: string }> = {
    Mathematics: { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
    Physics: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
    Chemistry: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
    English: { bg: 'bg-pink-50', text: 'text-pink-700', bar: 'bg-pink-500' },
    Aptitude: { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl  w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${classification.bgGradient} border-b-2 ${classification.borderColor} p-6 sticky top-0 z-10`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Initial Assessment & Progress Report</h2>
              <p className="text-sm text-gray-600">Your journey from day one to now</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Initial Assessment Classification */}
          <div className={`mb-6 rounded-xl p-6 border-2 ${classification.borderColor} bg-gradient-to-br ${classification.bgGradient}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ${classification.buttonBg} text-white shadow-lg`}>
                {classification.grade}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-2xl font-bold ${classification.textColor}`}>
                    {classification.label}
                  </h3>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${classification.badgeBg} ${classification.badgeText}`}>
                    INITIAL ASSESSMENT
                  </span>
                </div>
                <p className={`text-sm ${classification.textColor} opacity-80`}>
                  {classification.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-gray-900">{results.percentage}%</div>
                <div className="text-sm text-gray-600">{results.correctAnswers}/{results.totalQuestions} correct</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/50 rounded-full h-3">
              <div
                className={`${classification.buttonBg} h-3 rounded-full transition-all`}
                style={{ width: `${results.percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Subject-wise Performance */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-gray-900">Initial Subject Performance</h4>
                </div>
                <div className="space-y-3">
                  {results.subjectWise && Object.entries(results.subjectWise).map(([subject, data]: [string, any]) => {
                    const subjectPercentage = Math.round((data.correct / data.total) * 100);
                    const colors = subjectColors[subject] || subjectColors.Mathematics;

                    return (
                      <div key={subject}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-gray-900">{subject}</span>
                          <span className="text-xs text-gray-600">
                            {data.correct}/{data.total} ({subjectPercentage}%)
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colors.bar} h-2 rounded-full transition-all`}
                            style={{ width: `${subjectPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Topics */}
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-orange-700" />
                  <h4 className="text-sm font-bold text-orange-900">Priority Topics for Improvement</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakTopics.length > 0 ? weakTopics.map((topic: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-orange-200 text-orange-800 rounded-lg text-xs font-bold"
                    >
                      {topic}
                    </span>
                  )) : (
                    <span className="text-xs text-orange-700">Great! No critical gaps found.</span>
                  )}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-indigo-700" />
                  <h4 className="text-sm font-bold text-indigo-900">AI Recommended Path</h4>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p>Current Grade Syllabus - Stay on track with your class curriculum</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>Focus on Bridge Modules to fill conceptual gaps</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Trophy className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p>Daily Practice Tests to improve speed and accuracy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Current Progress */}
            <div className="space-y-6">
              {/* Progress Metrics */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                  <h4 className="text-sm font-bold text-green-900">Your Growth Journey</h4>
                </div>
                <div className="space-y-4">
                  {/* Initial vs Current */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Initial Assessment</span>
                      <span className="text-lg font-bold text-gray-900">{results.percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Current Average</span>
                      <span className="text-lg font-bold text-green-600">84.5%</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">Net Improvement</span>
                      <span className="text-xl font-bold text-green-600">
                        +{Math.abs(84.5 - results.percentage).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Growth Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">156</div>
                      <div className="text-xs text-gray-600">Tests Taken</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <Zap className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-gray-900">42</div>
                      <div className="text-xs text-gray-600">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject-wise Improvement */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                  <h4 className="text-sm font-bold text-blue-900">Subject-wise Improvement</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <div className="text-xs font-bold text-gray-900">Mathematics</div>
                      <div className="text-xs text-gray-500">80% → 88%</div>
                    </div>
                    <div className="text-sm font-bold text-green-600">+8%</div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <div className="text-xs font-bold text-gray-900">Physics</div>
                      <div className="text-xs text-gray-500">100% → 95%</div>
                    </div>
                    <div className="text-sm font-bold text-orange-600">-5%</div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <div className="text-xs font-bold text-gray-900">Chemistry</div>
                      <div className="text-xs text-gray-500">80% → 89%</div>
                    </div>
                    <div className="text-sm font-bold text-green-600">+9%</div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <div className="text-xs font-bold text-gray-900">English</div>
                      <div className="text-xs text-gray-500">80% → 85%</div>
                    </div>
                    <div className="text-sm font-bold text-green-600">+5%</div>
                  </div>
                </div>
              </div>

              {/* Achievements Unlocked */}
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-purple-700" />
                  <h4 className="text-sm font-bold text-purple-900">Achievements Unlocked</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-xs text-gray-900 font-bold">Week Warrior</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-xs text-gray-900 font-bold">Speed Master</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-xs text-gray-900 font-bold">Accuracy Pro</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-700" />
              <h4 className="text-sm font-bold text-gray-900">Key Insights</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Consistent Performer</p>
                  <p className="text-xs text-gray-600">You've maintained a steady upward trajectory across all subjects</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Gap Analysis Complete</p>
                  <p className="text-xs text-gray-600">Initial weak areas have shown 67% improvement on average</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">AI Path Working</p>
                  <p className="text-xs text-gray-600">Your personalized learning path is yielding excellent results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Ready for Next Level</p>
                  <p className="text-xs text-gray-600">You're on track to achieve your academic goals this year</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-bold"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
