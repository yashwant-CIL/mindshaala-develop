import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Target, Zap, Clock,
  Brain, Star, Award, BarChart3, PieChart, Activity
} from 'lucide-react';

interface LiveAnalyticsDashboardProps {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
}

export function LiveAnalyticsDashboard({
  currentQuestion,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  timeSpent
}: LiveAnalyticsDashboardProps) {
  const [predictions, setPredictions] = useState({
    estimatedScore: 0,
    projectedRank: 0,
    timeToFinish: 0,
    difficultyTrend: 'stable' as 'up' | 'down' | 'stable'
  });

  useEffect(() => {
    // AI predictions based on current performance
    const totalAnswered = correctAnswers + incorrectAnswers;
    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
    const avgTimePerQ = totalAnswered > 0 ? timeSpent / totalAnswered : 0;
    const remaining = totalQuestions - currentQuestion;
    
    setPredictions({
      estimatedScore: Math.round((accuracy / 100) * totalQuestions * 4), // assuming 4 marks each
      projectedRank: Math.max(1, Math.round(10000 - (accuracy * 98))),
      timeToFinish: Math.round(avgTimePerQ * remaining / 60), // in minutes
      difficultyTrend: accuracy > 75 ? 'up' : accuracy < 50 ? 'down' : 'stable'
    });
  }, [currentQuestion, correctAnswers, incorrectAnswers, timeSpent, totalQuestions]);

  const accuracy = correctAnswers + incorrectAnswers > 0
    ? (correctAnswers / (correctAnswers + incorrectAnswers)) * 100
    : 0;

  const avgTimePerQuestion = correctAnswers + incorrectAnswers > 0
    ? timeSpent / (correctAnswers + incorrectAnswers)
    : 0;

  return (
    <div className="fixed bottom-6 left-6 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Live Analytics</h3>
            <p className="text-xs text-white/80">Real-time performance tracking</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600 mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-blue-700">{Math.round(accuracy)}%</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              {accuracy > 75 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>Excellent</span>
                </>
              ) : accuracy > 50 ? (
                <>
                  <Target className="w-3 h-3" />
                  <span>Good</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>Improve</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-purple-600 mb-1">Speed</div>
            <div className="text-2xl font-bold text-purple-700">
              {Math.round(avgTimePerQuestion)}s
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
              <Clock className="w-3 h-3" />
              <span>per question</span>
            </div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-200">
          <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-yellow-600" />
            AI Predictions
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Score:</span>
              <span className="font-bold text-yellow-700">{predictions.estimatedScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Projected Rank:</span>
              <span className="font-bold text-orange-700">#{predictions.projectedRank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time to Finish:</span>
              <span className="font-bold text-green-700">{predictions.timeToFinish} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty Trend:</span>
              <span className={`font-bold flex items-center gap-1 ${
                predictions.difficultyTrend === 'up' ? 'text-red-600' :
                predictions.difficultyTrend === 'down' ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {predictions.difficultyTrend === 'up' && <TrendingUp className="w-3 h-3" />}
                {predictions.difficultyTrend === 'down' && <TrendingDown className="w-3 h-3" />}
                {predictions.difficultyTrend === 'stable' && <Target className="w-3 h-3" />}
                {predictions.difficultyTrend}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-bold text-gray-900 mb-3">Performance Breakdown</h4>
          <div className="space-y-2">
            {/* Correct */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-600 font-bold">Correct</span>
                <span className="font-bold text-green-700">{correctAnswers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Incorrect */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-600 font-bold">Incorrect</span>
                <span className="font-bold text-red-700">{incorrectAnswers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(incorrectAnswers / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Unanswered */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-bold">Remaining</span>
                <span className="font-bold text-gray-700">
                  {totalQuestions - correctAnswers - incorrectAnswers}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${((totalQuestions - correctAnswers - incorrectAnswers) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
          <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            Quick Insights
          </h4>
          <div className="space-y-1 text-xs text-gray-700">
            {accuracy > 80 && (
              <div className="flex items-start gap-2">
                <Star className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>Outstanding performance! Keep it up!</span>
              </div>
            )}
            {avgTimePerQuestion < 60 && (
              <div className="flex items-start gap-2">
                <Zap className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Great speed! You're managing time well.</span>
              </div>
            )}
            {accuracy < 50 && (
              <div className="flex items-start gap-2">
                <Target className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Focus on accuracy. Take your time!</span>
              </div>
            )}
            {avgTimePerQuestion > 120 && (
              <div className="flex items-start gap-2">
                <Clock className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Try to speed up to complete on time.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
