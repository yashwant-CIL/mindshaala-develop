import { Target, TrendingUp, TrendingDown, Award, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface AnalysisPageProps {
  results: any;
  profileData: any;
  onContinue: () => void;
}

const subjectIcons: Record<string, string> = {
  Mathematics: '📐',
  Physics: '⚛️',
  Chemistry: '🧪',
  English: '📖',
  Aptitude: '💡',
};

const subjectColors: Record<string, { bg: string; text: string; bar: string }> = {
  Mathematics: { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
  Physics: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
  Chemistry: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
  English: { bg: 'bg-pink-50', text: 'text-pink-700', bar: 'bg-pink-500' },
  Aptitude: { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' },
};

export function AnalysisPage({ results, profileData, onContinue }: AnalysisPageProps) {
  const { totalQuestions, correctAnswers, percentage, subjectWise, detailedResults } = results;

  // Identify strong and weak areas
  const topicsNeedingRevision = detailedResults
    .filter((r: any) => !r.isCorrect)
    .map((r: any) => r.question.category)
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .slice(0, 4);

  const strongAreas = detailedResults
    .filter((r: any) => r.isCorrect)
    .map((r: any) => r.question.category)
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .slice(0, 2);

  return (
    <div className="min-h-screen flex">
      <Sidebar currentStep="analysis" />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className=" mx-auto">
          <div className="mb-5">
            <h1 className="text-2xl text-gray-900 mb-2">Your Learning Profile</h1>
            <p className="text-sm text-gray-600">
              Based on your assessment, here's what we discovered
            </p>
          </div>

          {/* Overall Performance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl p-6 text-white mb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5" />
                  <h2 className="text-xl">At Grade Level</h2>
                </div>
                <p className="text-sm text-blue-100">Based on your assessment performance</p>
              </div>
              <div className="text-right">
                <div className="text-5xl mb-1">{percentage}%</div>
                <div className="text-sm text-blue-100">{correctAnswers}/{totalQuestions} correct</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-blue-400/30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {/* Subject-wise Analysis */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm text-gray-900">Subject-wise Analysis</h3>
              </div>

              <div className="space-y-4">
                {Object.entries(subjectWise).map(([subject, data]: [string, any]) => {
                  const subjectPercentage = Math.round((data.correct / data.total) * 100);
                  const colors = subjectColors[subject] || subjectColors.Mathematics;

                  return (
                    <div key={subject}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{subjectIcons[subject] || '📚'}</span>
                          <span className="text-sm text-gray-900">{subject}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {data.correct}/{data.total} ({subjectPercentage}%)
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colors.bar} h-2 rounded-full transition-all duration-1000`}
                          style={{ width: `${subjectPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
                <Award className="w-6 h-6 mb-2" />
                <div className="text-2xl mb-1">{correctAnswers}</div>
                <div className="text-sm text-green-100">Questions Mastered</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-5 text-white">
                <BookOpen className="w-6 h-6 mb-2" />
                <div className="text-2xl mb-1">{totalQuestions - correctAnswers}</div>
                <div className="text-sm text-purple-100">Areas to Improve</div>
              </div>
            </div>
          </div>

          {/* Topics Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Topics Needing Revision */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-orange-700" />
                <h3 className="text-sm text-orange-900">Topics Needing Revision</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topicsNeedingRevision.map((topic: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-orange-200 text-orange-800 rounded-lg text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Strong Areas */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-700" />
                <h3 className="text-sm text-green-900">Strong Areas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {strongAreas.map((topic: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded-lg text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg text-gray-900">Personalized Recommendations</h3>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <div className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  ✓
                </div>
                <p>
                  You're on track! Continue with current grade syllabus to maintain your strong foundation.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  ✓
                </div>
                <p>
                  Focus on <strong>{topicsNeedingRevision[0]}</strong> and <strong>{topicsNeedingRevision[1]}</strong> to strengthen your weak areas.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  ✓
                </div>
                <p>
                  Practice daily test series to improve speed and accuracy for {profileData.currentGrade === 'Class 11' || profileData.currentGrade === 'Class 12' ? 'JEE/NEET' : 'Board Exams'}.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg text-gray-900 mb-3">Ready to Start Your Journey?</h3>
            <p className="text-sm text-gray-600 mb-4">
              We've created a personalized learning plan based on your profile and assessment. 
              Click below to unlock your AI-recommended path and begin your personalized learning journey!
            </p>

            <button 
              onClick={onContinue}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 group shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span>Unlock My Personalized Learning Path</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            © 2025 MindShaala • Empowering Indian Students
          </div>
        </div>
      </div>
    </div>
  );
}