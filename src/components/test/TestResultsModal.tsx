import { useState, useEffect } from 'react';
import {
  Trophy, TrendingUp, Clock, CheckCircle2, XCircle,
  AlertCircle, Award, Target, Brain, Flame, Star,
  Download, Share2, BarChart3, Eye, ChevronRight,
  BookOpen, Lightbulb, RefreshCw, Home
} from 'lucide-react';

interface TestResultsModalProps {
  isOpen: boolean;
  testType: 'theory-exam' | 'custom-mcq' | 'ai-recommended';
  onClose: () => void;
  onRetake: () => void;
  onViewFullReport: () => void;
}

export function TestResultsModal({
  isOpen,
  testType,
  onClose,
  onRetake,
  onViewFullReport
}: TestResultsModalProps) {
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [showResults, setShowResults] = useState(false);

  // Sample test data (would come from props in real implementation)
  const testResults = {
    title: testType === 'theory-exam' ? 'Physics Theory Exam' : 
           testType === 'custom-mcq' ? 'Custom MCQ Test - Mathematics' :
           'AI Recommended Test',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    totalScore: 68,
    maxScore: 80,
    percentage: 85,
    accuracy: 85,
    timeSpent: '1h 45m',
    timeAllotted: '2h 00m',
    rank: 247,
    totalStudents: 15000,
    percentile: 92,
    questionAnalysis: {
      total: 40,
      correct: 34,
      incorrect: 4,
      skipped: 2,
      partiallyCorrect: 0
    },
    topicBreakdown: [
      { topic: 'Refraction & Lenses', score: 15, max: 20, percentage: 75 },
      { topic: 'Reflection', score: 18, max: 20, percentage: 90 },
      { topic: 'Light Spectrum', score: 15, max: 15, percentage: 100 },
      { topic: 'Sound Waves', score: 20, max: 25, percentage: 80 }
    ],
    difficultyBreakdown: [
      { level: 'Easy', attempted: 12, correct: 11, total: 12 },
      { level: 'Medium', attempted: 20, correct: 18, total: 20 },
      { level: 'Hard', attempted: 8, correct: 5, total: 8 }
    ],
    weakAreas: [
      {
        title: "Snell's Law Numericals",
        description: "You struggled with numerical problems involving refractive index calculations.",
        suggestion: "Practice more numerical problems on refraction"
      },
      {
        title: "Lens Formula Sign Convention",
        description: "2 incorrect answers were due to sign convention errors in lens formula.",
        suggestion: "Review sign convention rules for lens formula"
      }
    ],
    strongConcepts: [
      {
        title: "Ray Diagrams",
        description: "Perfect score in all ray diagram and image formation questions."
      },
      {
        title: "Wave Properties",
        description: "Excellent understanding of wave nature and properties of light."
      }
    ],
    recommendations: [
      "Focus on numerical problem-solving in refraction",
      "Practice lens formula with different object positions",
      "Review concepts: Total Internal Reflection",
      "Attempt 5 more practice tests on Optics"
    ]
  };

  // Countdown effect
  useEffect(() => {
    if (!isOpen || !showCountdown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, show results
      setShowCountdown(false);
      setShowResults(true);
    }
  }, [isOpen, showCountdown, countdown]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowCountdown(true);
      setCountdown(10);
      setShowResults(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Countdown Screen */}
      {showCountdown && (
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Evaluating Your Performance
            </h2>
            <p className="text-gray-600">AI is analyzing your answers...</p>
          </div>

          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (countdown / 10)}`}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-gray-900">{countdown}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">Results ready in {countdown} seconds...</p>
        </div>
      )}

      {/* Results Screen */}
      {showResults && (
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Test Results</h2>
                  <p className="text-white/80 text-sm">{testResults.title} • {testResults.date}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-6 border-2 border-green-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">Test Completed Successfully!</span>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <div className="text-6xl font-bold text-green-600 mb-2">
                      {testResults.totalScore}<span className="text-3xl text-gray-600">/{testResults.maxScore}</span>
                    </div>
                    <div className="text-lg text-gray-600">Total Score</div>
                  </div>
                  <div className="w-px h-20 bg-gray-300"></div>
                  <div>
                    <div className="text-6xl font-bold text-blue-600 mb-2">{testResults.percentage}%</div>
                    <div className="text-lg text-gray-600">Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">#{testResults.rank}</div>
                  <div className="text-xs text-gray-600">Your Rank</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{testResults.percentile}%</div>
                  <div className="text-xs text-gray-600">Percentile</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{testResults.timeSpent}</div>
                  <div className="text-xs text-gray-600">Time Taken</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">{testResults.questionAnalysis.correct}</div>
                  <div className="text-xs text-gray-600">Correct</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Question Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Question Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700">Correct</span>
                    </div>
                    <span className="font-bold text-green-600">{testResults.questionAnalysis.correct}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(testResults.questionAnalysis.correct / testResults.questionAnalysis.total) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-700">Incorrect</span>
                    </div>
                    <span className="font-bold text-red-600">{testResults.questionAnalysis.incorrect}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(testResults.questionAnalysis.incorrect / testResults.questionAnalysis.total) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span className="text-sm text-gray-700">Skipped</span>
                    </div>
                    <span className="font-bold text-gray-600">{testResults.questionAnalysis.skipped}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: `${(testResults.questionAnalysis.skipped / testResults.questionAnalysis.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Difficulty Breakdown
                </h3>
                <div className="space-y-4">
                  {testResults.difficultyBreakdown.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-bold ${
                          item.level === 'Easy' ? 'text-green-600' :
                          item.level === 'Medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {item.level}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.correct}/{item.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.level === 'Easy' ? 'bg-green-500' :
                            item.level === 'Medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(item.correct / item.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Topic-wise Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Topic-wise Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {testResults.topicBreakdown.map((topic, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">{topic.topic}</span>
                      <span className="text-sm text-gray-600">{topic.score}/{topic.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{topic.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {testResults.weakAreas.map((area, idx) => (
                  <div key={idx} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="font-bold text-orange-900 mb-1">{area.title}</h4>
                    <p className="text-sm text-orange-700 mb-2">{area.description}</p>
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Lightbulb className="w-4 h-4" />
                      <span className="font-bold">{area.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong Concepts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Strong Concepts
              </h3>
              <div className="space-y-3">
                {testResults.strongConcepts.map((concept, idx) => (
                  <div key={idx} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-bold text-green-900 mb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {concept.title}
                    </h4>
                    <p className="text-sm text-green-700">{concept.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Recommendations
              </h3>
              <ul className="space-y-2">
                {testResults.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => {/* Download report */}}
                  className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
                <button
                  onClick={() => {/* Share */}}
                  className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onViewFullReport}
                  className="px-6 py-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Full Analysis
                </button>
                <button
                  onClick={onRetake}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake Test
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
