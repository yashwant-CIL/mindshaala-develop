import React, { useState } from 'react';
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  Download,
  Share2,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Sparkles,
  BarChart2,
  Check,
  Zap,
  Tag
} from 'lucide-react';

export interface QuestionAttempt {
  id: string;
  questionNumber: number;
  questionText: string;
  options: string[];
  selectedOption: number | null; // 0-indexed option, or null if unattempted
  correctOption: number; // 0-indexed option
  isCorrect: boolean;
  isSkipped: boolean;
  explanation: string;
  timeSpent: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CompetitionAttemptResult {
  attemptId: string;
  competitionTitle: string;
  category: string;
  attemptDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank: number;
  totalParticipants: number;
  percentile: number;
  timeTaken: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  xpEarned: number;
  rewardBadge: string;
  topicBreakdown: { topic: string; total: number; correct: number; percentage: number }[];
  questions: QuestionAttempt[];
}

// Sample Mock Detailed Results for Competitions
export const MOCK_DETAILED_RESULTS: Record<string, CompetitionAttemptResult> = {
  'attempt-101': {
    attemptId: 'attempt-101',
    competitionTitle: 'National Mathematics Speed Cup 2026',
    category: 'mathematics',
    attemptDate: '05 Aug 2026, 10:45 AM',
    score: 925,
    maxScore: 1000,
    percentage: 92.5,
    rank: 4,
    totalParticipants: 1420,
    percentile: 99.7,
    timeTaken: '21m 05s / 45m',
    totalQuestions: 10,
    correctCount: 8,
    incorrectCount: 1,
    skippedCount: 1,
    xpEarned: 1650,
    rewardBadge: 'Gold Medal Merit Certificate',
    topicBreakdown: [
      { topic: 'Algebra & Polynomials', total: 4, correct: 4, percentage: 100 },
      { topic: 'Coordinate Geometry', total: 3, correct: 2, percentage: 66.7 },
      { topic: 'Trigonometry', total: 3, correct: 2, percentage: 66.7 }
    ],
    questions: [
      {
        id: 'q1',
        questionNumber: 1,
        questionText: 'If α and β are the roots of the quadratic equation 2x² - 5x + 3 = 0, find the value of (α² + β²).',
        options: ['13 / 4', '19 / 4', '25 / 4', '7 / 2'],
        selectedOption: 0,
        correctOption: 0,
        isCorrect: true,
        isSkipped: false,
        explanation: 'α + β = 5/2 and αβ = 3/2. Using α² + β² = (α + β)² - 2αβ = (5/2)² - 2(3/2) = 25/4 - 3 = 13/4.',
        timeSpent: '1m 12s',
        topic: 'Algebra & Polynomials',
        difficulty: 'Medium'
      },
      {
        id: 'q2',
        questionNumber: 2,
        questionText: 'Find the distance between the parallel lines 3x - 4y + 7 = 0 and 3x - 4y - 3 = 0.',
        options: ['1 unit', '2 units', '3 units', '4 units'],
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Distance formula between parallel lines Ax + By + C₁ = 0 and Ax + By + C₂ = 0 is d = |C₁ - C₂| / √(A² + B²) = |7 - (-3)| / √(3² + (-4)²) = 10 / 5 = 2 units.',
        timeSpent: '1m 45s',
        topic: 'Coordinate Geometry',
        difficulty: 'Easy'
      },
      {
        id: 'q3',
        questionNumber: 3,
        questionText: 'Evaluate tan(75°) - tan(15°).',
        options: ['2', '2√3', '4', '√3 / 2'],
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        isSkipped: false,
        explanation: 'tan(75°) = 2 + √3 and tan(15°) = 2 - √3. Therefore, tan(75°) - tan(15°) = (2 + √3) - (2 - √3) = 2√3.',
        timeSpent: '2m 10s',
        topic: 'Trigonometry',
        difficulty: 'Medium'
      },
      {
        id: 'q4',
        questionNumber: 4,
        questionText: 'Find the sum of all two-digit numbers which leave a remainder of 1 when divided by 4.',
        options: ['1210', '1221', '1254', '1280'],
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Two-digit numbers leaving remainder 1 modulo 4 form an AP: 13, 17, 21, ..., 97. Number of terms n = ((97 - 13)/4) + 1 = 22. Sum S₂₂ = 22/2 * (13 + 97) = 11 * 110 = 1221.',
        timeSpent: '2m 30s',
        topic: 'Algebra & Polynomials',
        difficulty: 'Hard'
      },
      {
        id: 'q5',
        questionNumber: 5,
        questionText: 'If sin θ + cos θ = √2 cos θ, then what is the value of cos θ - sin θ?',
        options: ['√2 sin θ', '√2 cos θ', 'sin θ', '-√2 sin θ'],
        selectedOption: 0,
        correctOption: 0,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Squaring both sides: sin²θ + cos²θ + 2sinθcosθ = 2cos²θ => 2sinθcosθ = cos²θ - sin²θ. Divide both sides by (cosθ + sinθ) = √2 cosθ to get cosθ - sinθ = 2sinθcosθ / (√2 cosθ) = √2 sinθ.',
        timeSpent: '1m 55s',
        topic: 'Trigonometry',
        difficulty: 'Medium'
      },
      {
        id: 'q6',
        questionNumber: 6,
        questionText: 'Find the area of the triangle formed by the points (0,0), (4,0), and (0,6).',
        options: ['10 sq units', '12 sq units', '24 sq units', '16 sq units'],
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Right-angled triangle at origin with base 4 and height 6. Area = (1/2) * base * height = (1/2) * 4 * 6 = 12 sq units.',
        timeSpent: '0m 50s',
        topic: 'Coordinate Geometry',
        difficulty: 'Easy'
      },
      {
        id: 'q7',
        questionNumber: 7,
        questionText: 'Find the number of real roots of the equation x⁴ + 4x² + 5 = 0.',
        options: ['0', '2', '4', '1'],
        selectedOption: 0,
        correctOption: 0,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Let t = x² ≥ 0. Equation becomes t² + 4t + 5 = 0. Discriminant D = 16 - 20 = -4 < 0. No real values of t exist, so 0 real roots.',
        timeSpent: '1m 10s',
        topic: 'Algebra & Polynomials',
        difficulty: 'Medium'
      },
      {
        id: 'q8',
        questionNumber: 8,
        questionText: 'If the centroid of a triangle with vertices (a, 1), (b, 3), and (4, c) is (2, 2), find (a + b + c).',
        options: ['4', '5', '6', '7'],
        selectedOption: 0,
        correctOption: 0,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Centroid x = (a + b + 4)/3 = 2 => a + b = 2. Centroid y = (1 + 3 + c)/3 = 2 => 4 + c = 6 => c = 2. So a + b + c = 2 + 2 = 4.',
        timeSpent: '2m 05s',
        topic: 'Coordinate Geometry',
        difficulty: 'Medium'
      },
      {
        id: 'q9',
        questionNumber: 9,
        questionText: 'Simplify: (1 + tan²θ) / (1 + cot²θ).',
        options: ['sec²θ', 'tan²θ', 'cot²θ', 'sin²θ'],
        selectedOption: 0,
        correctOption: 1,
        isCorrect: false,
        isSkipped: false,
        explanation: '1 + tan²θ = sec²θ and 1 + cot²θ = cosec²θ. sec²θ / cosec²θ = (1/cos²θ) / (1/sin²θ) = sin²θ / cos²θ = tan²θ.',
        timeSpent: '2m 40s',
        topic: 'Trigonometry',
        difficulty: 'Medium'
      },
      {
        id: 'q10',
        questionNumber: 10,
        questionText: 'If x + 1/x = 3, find the value of x³ + 1/x³.',
        options: ['18', '27', '36', '24'],
        selectedOption: null,
        correctOption: 0,
        isCorrect: false,
        isSkipped: true,
        explanation: 'Formula: (x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x). Substituting x + 1/x = 3: 3³ = x³ + 1/x³ + 3(3) => 27 = x³ + 1/x³ + 9 => x³ + 1/x³ = 18.',
        timeSpent: '0m 00s',
        topic: 'Algebra & Polynomials',
        difficulty: 'Hard'
      }
    ]
  },
  'attempt-102': {
    attemptId: 'attempt-102',
    competitionTitle: 'Physics Mechanics & Optics Championship',
    category: 'physics',
    attemptDate: '01 Aug 2026, 4:15 PM',
    score: 880,
    maxScore: 1000,
    percentage: 88.0,
    rank: 7,
    totalParticipants: 890,
    percentile: 99.2,
    timeTaken: '48m 10s / 60m',
    totalQuestions: 8,
    correctCount: 7,
    incorrectCount: 1,
    skippedCount: 0,
    xpEarned: 1400,
    rewardBadge: 'Silver Medal Certificate',
    topicBreakdown: [
      { topic: 'Kinematics & Laws of Motion', total: 4, correct: 4, percentage: 100 },
      { topic: 'Ray Optics', total: 4, correct: 3, percentage: 75 }
    ],
    questions: [
      {
        id: 'pq1',
        questionNumber: 1,
        questionText: 'A body falls freely from rest. What is the distance covered in the 3rd second of its fall? (g = 10 m/s²)',
        options: ['15 m', '25 m', '45 m', '30 m'],
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Formula for distance in nth second: Sₙ = u + (g/2)(2n - 1). Here u = 0, g = 10, n = 3. S₃ = (10/2)(2(3) - 1) = 5(5) = 25 m.',
        timeSpent: '1m 20s',
        topic: 'Kinematics & Laws of Motion',
        difficulty: 'Easy'
      },
      {
        id: 'pq2',
        questionNumber: 2,
        questionText: 'What is the focal length of a concave mirror having radius of curvature R = 30 cm?',
        options: ['15 cm', '-15 cm', '30 cm', '-30 cm'],
        selectedOption: 1,
        correctOption: 1,
        isCorrect: true,
        isSkipped: false,
        explanation: 'Focal length f = R/2. By sign convention for concave mirror, focal length is negative, so f = -30/2 = -15 cm.',
        timeSpent: '0m 45s',
        topic: 'Ray Optics',
        difficulty: 'Easy'
      }
    ]
  }
};

export const CompetitionResult: React.FC<{
  attemptId: string;
  onBack: () => void;
}> = ({ attemptId, onBack }) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

  const resultData = MOCK_DETAILED_RESULTS[attemptId] || MOCK_DETAILED_RESULTS['attempt-101'];

  // Filtered questions based on selected pill
  const filteredQuestions = resultData.questions.filter((q) => {
    if (filterType === 'correct') return q.isCorrect;
    if (filterType === 'incorrect') return !q.isCorrect && !q.isSkipped;
    if (filterType === 'skipped') return q.isSkipped;
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 space-y-8 font-sans">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          Back to Competition History
        </button>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer">
            <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share Result
          </button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Download Report (PDF)
          </button>
        </div>
      </div>

      {/* Main Result Summary Header Card */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                {resultData.category}
              </span>
              <span className="text-xs text-slate-500">{resultData.attemptDate}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {resultData.competitionTitle}
            </h1>
            <p className="text-xs text-slate-500">
              Detailed performance analysis, topic breakdown, and step-by-step question solutions.
            </p>
          </div>

          {/* Score & Rank Badges */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3.5 shadow-sm">
              <div className="p-3 rounded-xl bg-amber-500 text-white font-black shadow-md shadow-amber-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">National Rank</div>
                <div className="text-xl font-black text-amber-700">Rank #{resultData.rank}</div>
                <div className="text-[10px] text-amber-600 font-bold">Top {resultData.percentile}% Percentile</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-center gap-3.5 shadow-sm">
              <div className="p-3 rounded-xl bg-blue-600 text-white font-black shadow-md shadow-blue-500/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Score</div>
                <div className="text-xl font-black text-slate-900">
                  {resultData.score} <span className="text-xs text-slate-500 font-normal">/ {resultData.maxScore}</span>
                </div>
                <div className="text-[10px] text-blue-700 font-bold">{resultData.percentage}% Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct Answers
            </div>
            <div className="text-2xl font-black text-emerald-800">
              {resultData.correctCount} <span className="text-xs font-semibold text-emerald-600">/ {resultData.totalQuestions}</span>
            </div>
          </div>

          <div className="bg-red-50/80 border border-red-200 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold">
              <XCircle className="w-4 h-4 text-red-600" /> Incorrect Answers
            </div>
            <div className="text-2xl font-black text-red-800">
              {resultData.incorrectCount} <span className="text-xs font-semibold text-red-600">Questions</span>
            </div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Unattempted / Skipped
            </div>
            <div className="text-2xl font-black text-amber-800">
              {resultData.skippedCount} <span className="text-xs font-semibold text-amber-600">Skipped</span>
            </div>
          </div>

          <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold">
              <Clock className="w-4 h-4 text-indigo-600" /> Time Taken
            </div>
            <div className="text-2xl font-black text-indigo-900">{resultData.timeTaken}</div>
          </div>
        </div>
      </div>

      {/* Topic-Wise Performance Breakdown Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Topic-Wise Mastery Breakdown
          </h2>
          <span className="text-xs text-slate-500 font-medium">Performance per syllabus chapter</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resultData.topicBreakdown.map((t, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{t.topic}</span>
                <span className="text-blue-700">{t.correct} / {t.total} Correct</span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  style={{ width: `${t.percentage}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500 font-medium text-right">{t.percentage.toFixed(0)}% Accuracy</div>
            </div>
          ))}
        </div>
      </div>

      {/* Question-By-Question Detailed Review Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Attempted Questions & Answer Solutions
            </h2>
            <p className="text-xs text-slate-500">Review selected choices, correct answers, and step-by-step AI explanations.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({resultData.questions.length})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'correct' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Correct ({resultData.correctCount})
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'incorrect' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incorrect ({resultData.incorrectCount})
            </button>
            <button
              onClick={() => setFilterType('skipped')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'skipped' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skipped ({resultData.skippedCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-slate-700 font-semibold">No questions found matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q) => (
              <QuestionReviewCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-Component: Question Review Card
const QuestionReviewCard: React.FC<{ question: QuestionAttempt }> = ({ question }) => {
  return (
    <div
      className={`bg-white border rounded-3xl p-6 space-y-5 shadow-sm transition-all ${
        question.isCorrect
          ? 'border-emerald-200 hover:border-emerald-300'
          : question.isSkipped
          ? 'border-amber-200 hover:border-amber-300'
          : 'border-red-200 hover:border-red-300'
      }`}
    >
      {/* Question Card Top Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center text-white ${
              question.isCorrect
                ? 'bg-emerald-600 shadow-md shadow-emerald-600/20'
                : question.isSkipped
                ? 'bg-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-red-600 shadow-md shadow-red-600/20'
            }`}
          >
            Q{question.questionNumber}
          </span>

          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
            {question.topic}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
              question.difficulty === 'Easy'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : question.difficulty === 'Medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {question.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {question.timeSpent}
          </span>

          {question.isCorrect ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct
            </span>
          ) : question.isSkipped ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Unattempted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-extrabold">
              <XCircle className="w-3.5 h-3.5 text-red-600" /> Incorrect
            </span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="text-base font-bold text-slate-900 leading-relaxed">
        {question.questionText}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {question.options.map((opt, optIdx) => {
          const isSelected = question.selectedOption === optIdx;
          const isCorrectChoice = question.correctOption === optIdx;

          let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700';

          if (isCorrectChoice) {
            optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm';
          } else if (isSelected && !isCorrectChoice) {
            optionStyle = 'bg-red-50 border-red-300 text-red-900 font-bold';
          }

          return (
            <div
              key={optIdx}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border ${
                    isCorrectChoice
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isSelected && !isCorrectChoice
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm">{opt}</span>
              </div>

              {isCorrectChoice && (
                <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" /> Correct Answer
                </span>
              )}
              {isSelected && !isCorrectChoice && (
                <span className="text-xs font-extrabold text-red-700 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" /> Your Choice
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Solution Explanation Box */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2 mt-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-600" /> AI Solution Explanation
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">{question.explanation}</p>
      </div>
    </div>
  );
};

export default CompetitionResult;
