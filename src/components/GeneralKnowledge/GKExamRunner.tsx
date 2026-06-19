import { useState, useEffect, useRef } from 'react';
import { 
  generateQuestionsForSubcategory, 
  Question 
} from './GKQuestionsData';
import { 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ArrowRight,
  ClipboardCheck,
  TrendingUp,
  Brain,
  Zap,
  BookmarkCheck,
  Info
} from 'lucide-react';

interface GKExamRunnerProps {
  category: string;
  subcategory: string;
  onExit: () => void;
  onGoToDashboard: () => void;
}

interface UserAnswer {
  questionId: string;
  selectedOption: number | null; // index of option, null if skipped
  isCorrect: boolean;
  timeTaken: number; // in seconds
  markedForReview: boolean;
}

export default function GKExamRunner({ category, subcategory, onExit, onGoToDashboard }: GKExamRunnerProps) {
  // Load questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Timer States
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Question tracking timer for speed analysis
  const questionStartTimes = useRef<Record<string, number>>({});

  useEffect(() => {
    // Generate questions on mount
    const qList = generateQuestionsForSubcategory(category, subcategory);
    setQuestions(qList);

    // Initialize answer records
    const initialAnswers: Record<string, UserAnswer> = {};
    qList.forEach(q => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOption: null,
        isCorrect: false,
        timeTaken: 0,
        markedForReview: false
      };
    });
    setAnswers(initialAnswers);

    // Track question entry time for first question
    if (qList.length > 0) {
      questionStartTimes.current[qList[0].id] = Date.now();
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true); // force submit on timeout
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [category, subcategory]);

  // Track time spent per question on index change
  const handleIndexChange = (newIdx: number) => {
    const currentQ = questions[currentIdx];
    const newQ = questions[newIdx];
    
    if (currentQ) {
      const timeInMs = Date.now() - (questionStartTimes.current[currentQ.id] || Date.now());
      const seconds = Math.floor(timeInMs / 1000);
      
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          timeTaken: (prev[currentQ.id]?.timeTaken || 0) + seconds
        }
      }));
    }

    // Set start time for next question
    questionStartTimes.current[newQ.id] = Date.now();
    setCurrentIdx(newIdx);
  };

  const handleSelectOption = (optionIdx: number) => {
    if (examSubmitted) return;
    const currentQ = questions[currentIdx];
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOption: optionIdx,
        isCorrect: optionIdx === currentQ.correctAnswer
      }
    }));
  };

  const handleClearResponse = () => {
    if (examSubmitted) return;
    const currentQ = questions[currentIdx];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOption: null,
        isCorrect: false
      }
    }));
  };

  const handleToggleReview = () => {
    if (examSubmitted) return;
    const currentQ = questions[currentIdx];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        markedForReview: !prev[currentQ.id].markedForReview
      }
    }));
  };

  const handleSubmit = (force = false) => {
    if (examSubmitted) return;
    
    // Flush current question timer
    const currentQ = questions[currentIdx];
    if (currentQ) {
      const timeInMs = Date.now() - (questionStartTimes.current[currentQ.id] || Date.now());
      const seconds = Math.floor(timeInMs / 1000);
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          timeTaken: (prev[currentQ.id]?.timeTaken || 0) + seconds
        }
      }));
    }

    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate parameters
    let score = 0;
    let attempted = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    
    // Streak calculations
    let currentStreak = 0;
    let maxStreak = 0;

    // Difficulty wise metrics
    const difficultyStats = {
      Easy: { correct: 0, total: 0 },
      Medium: { correct: 0, total: 0 },
      Hard: { correct: 0, total: 0 }
    };

    questions.forEach(q => {
      const ans = answers[q.id];
      const selected = ans?.selectedOption ?? null;
      const diff = q.difficulty;
      
      difficultyStats[diff].total += 1;

      if (selected !== null) {
        attempted += 1;
        const correct = selected === q.correctAnswer;
        if (correct) {
          score += 1;
          correctCount += 1;
          currentStreak += 1;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
          difficultyStats[diff].correct += 1;
        } else {
          incorrectCount += 1;
          currentStreak = 0; // reset streak
        }
      } else {
        skippedCount += 1;
        currentStreak = 0; // reset streak
      }
    });

    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
    const percentage = Math.round((score / questions.length) * 100);

    // Calculate accuracy by difficulty level
    const accuracyByDifficulty = {
      Easy: difficultyStats.Easy.total > 0 ? Math.round((difficultyStats.Easy.correct / difficultyStats.Easy.total) * 100) : 0,
      Medium: difficultyStats.Medium.total > 0 ? Math.round((difficultyStats.Medium.correct / difficultyStats.Medium.total) * 100) : 0,
      Hard: difficultyStats.Hard.total > 0 ? Math.round((difficultyStats.Hard.correct / difficultyStats.Hard.total) * 100) : 0
    };

    // Calculate dynamic parameters: Speed and guess-factor
    const averageTime = attempted > 0 ? Math.round(timeSpent / attempted) : 0;
    
    // Save to local storage history
    const historyItem = {
      id: `gk_${Date.now()}`,
      category,
      subcategory,
      score,
      totalQuestions: questions.length,
      percentage,
      timeSpent,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      correctCount,
      incorrectCount,
      skippedCount,
      streak: maxStreak,
      accuracy,
      accuracyByDifficulty,
      averageTime
    };

    const existingHistory = JSON.parse(localStorage.getItem('gk_exam_history') || '[]');
    localStorage.setItem('gk_exam_history', JSON.stringify([historyItem, ...existingHistory]));

    setExamSubmitted(true);
    setShowSubmitModal(false);
  };

  const handleRetry = () => {
    // Reset states
    setCurrentIdx(0);
    setExamSubmitted(false);
    setTimeRemaining(600);
    setTimeSpent(0);
    setShowSubmitModal(false);
    
    // Re-generate questions
    const qList = generateQuestionsForSubcategory(category, subcategory);
    setQuestions(qList);

    const initialAnswers: Record<string, UserAnswer> = {};
    qList.forEach(q => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOption: null,
        isCorrect: false,
        timeTaken: 0,
        markedForReview: false
      };
    });
    setAnswers(initialAnswers);
    questionStartTimes.current = { [qList[0].id]: Date.now() };

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);
  };

  // Helper formatting for timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Parameters calculated for results page
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let attempted = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  if (examSubmitted) {
    questions.forEach(q => {
      const ans = answers[q.id];
      if (ans?.selectedOption !== null) {
        attempted += 1;
        if (ans?.isCorrect) {
          correctCount += 1;
          currentStreak += 1;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          incorrectCount += 1;
          currentStreak = 0;
        }
      } else {
        skippedCount += 1;
        currentStreak = 0;
      }
    });
  }

  const scorePercentage = Math.round((correctCount / questions.length) * 100);
  const accuracyRate = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
  const speedPerQuestion = attempted > 0 ? Math.round(timeSpent / attempted) : 0;

  // Feedback adjective
  const feedbackHeading = scorePercentage >= 80 ? 'Masterful Performance!' : scorePercentage >= 60 ? 'Well Done!' : 'Good Effort!';
  const feedbackSub = scorePercentage >= 80 ? 'You demonstrate outstanding conceptual depth in this category.' : scorePercentage >= 60 ? 'Keep reviewing your weak areas to secure high scores.' : 'Re-take the exam or study the notes to build stronger fundamentals.';

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen pb-20">
      {/* EXAM IN-PROGRESS SCREEN */}
      {!examSubmitted && currentQuestion && (
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
          
          {/* Question Interface Container */}
          <div className="flex-1 space-y-6">
            
            {/* Top Stats and Timer bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{category}</span>
                <h2 className="text-xl font-black text-slate-800 mt-1">{subcategory}</h2>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5 px-5 py-2.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                </div>
                
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-blue-200"
                >
                  Submit Exam
                </button>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative min-h-[400px] flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Question Info Header */}
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  
                  <span className={`px-4 py-1.5 font-bold text-xs rounded-full ${
                    currentQuestion.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                    currentQuestion.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                {/* Question text */}
                <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-4 pt-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = currentAnswer?.selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100 shadow-md shadow-blue-500/5' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={`font-semibold text-sm mt-0.5 ${
                          isSelected ? 'text-blue-900' : 'text-slate-700'
                        }`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-8">
                <div className="flex gap-3">
                  <button
                    onClick={handleToggleReview}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                      currentAnswer?.markedForReview
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {currentAnswer?.markedForReview ? '★ Marked for Review' : '☆ Mark for Review'}
                  </button>
                  
                  <button
                    onClick={handleClearResponse}
                    disabled={currentAnswer?.selectedOption === null}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:border-slate-200"
                  >
                    Clear Response
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleIndexChange(currentIdx - 1)}
                    disabled={currentIdx === 0}
                    className="p-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleIndexChange(currentIdx + 1)}
                    disabled={currentIdx === questions.length - 1}
                    className="p-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Question Navigation Matrix Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="font-black text-slate-900 border-b border-slate-100 pb-3 uppercase text-xs tracking-wider">
                Question Grid
              </h4>

              <div className="grid grid-cols-5 gap-3">
                {questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isActive = currentIdx === idx;
                  const isAnswered = ans?.selectedOption !== null;
                  const isMarked = ans?.markedForReview;

                  let cellClass = 'border-slate-200 hover:bg-slate-50 text-slate-600';
                  if (isAnswered) cellClass = 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10';
                  if (isMarked) cellClass = 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/10';
                  if (isActive) cellClass += ' ring-2 ring-indigo-600 ring-offset-2';

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleIndexChange(idx)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold transition-all ${cellClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Labels */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-md bg-blue-600"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-md bg-purple-600"></div>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-md border border-slate-200"></div>
                  <span>Not Visited / Skipped</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Finish Test</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 border border-slate-100 shadow-2xl space-y-6 animate-scaleIn">
            <div className="flex items-center gap-4 text-amber-600 bg-amber-50 p-4 rounded-2xl">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900">Are you sure?</h4>
                <p className="text-slate-500 text-xs mt-0.5">Please confirm before submitting your response sheet.</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold text-slate-900">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Attempted:</span>
                <span className="font-bold text-slate-900">
                  {questions.filter(q => answers[q.id]?.selectedOption !== null).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Marked for Review:</span>
                <span className="font-bold text-purple-700">
                  {questions.filter(q => answers[q.id]?.markedForReview).length}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-200"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-EXAM DETAILED SCORECARD / ANALYTICS */}
      {examSubmitted && (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-fadeIn">
          
          {/* Header Banner card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
            
            <div className="space-y-4 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                Exam Successfully Completed
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{feedbackHeading}</h1>
              <p className="text-slate-500 font-medium max-w-xl">{feedbackSub}</p>
              
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>Category:</span>
                <span className="text-slate-800">{category}</span>
                <span className="mx-1">•</span>
                <span>Topic:</span>
                <span className="text-slate-800">{subcategory}</span>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-full border border-slate-100 relative w-44 h-44 shadow-inner">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-blue-600 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - scorePercentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800">{correctCount}/{questions.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Correct</span>
              </div>
            </div>
          </div>

          {/* Core Analytics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Accuracy */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{accuracyRate}%</h4>
              </div>
            </div>

            {/* Time Taken */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Taken</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</h4>
              </div>
            </div>

            {/* Speed */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pace</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{speedPerQuestion}s / Q</h4>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Streak</span>
                <h4 className="text-2xl font-black text-slate-800 mt-0.5">{maxStreak} Correct</h4>
              </div>
            </div>

          </div>

          {/* Dynamic Performance analysis insights */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                <BookmarkCheck className="w-3.5 h-3.5" /> Study Recommendation
              </span>
              <h3 className="text-2xl font-bold">
                {scorePercentage >= 80 ? 'Exceptional Work! You are ready to explore hard tests.' : 
                 scorePercentage >= 60 ? 'Consistent performance! Review the incorrect questions to hit 100%.' :
                 'Keep practicing! Focus on foundational concepts.'}
              </h3>
              <p className="text-slate-400 text-sm max-w-xl">
                Time-management analysis suggests you spent an average of {speedPerQuestion} seconds per question. 
                {speedPerQuestion < 12 ? ' This indicates highly rapid response times. Ensure you double-check to minimize accidental errors.' : 
                 speedPerQuestion > 30 ? ' You took balanced, comprehensive care with options. This deliberate pacing helps score high in harder modules.' :
                 ' Your pacing is highly optimized and balanced for competition standards.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-400 hover:text-white transition-all shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Exam</span>
              </button>
              
              <button
                onClick={onExit}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
              >
                <span>Back to Exams</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoToDashboard}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/30"
              >
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Question Explanations & Key Review */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 text-xl border-b border-slate-100 pb-4">
              Detailed Question Review
            </h3>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const selected = ans?.selectedOption ?? null;
                const correct = selected === q.correctAnswer;
                const isSkipped = selected === null;

                return (
                  <div 
                    key={q.id} 
                    className={`p-6 rounded-2xl border ${
                      isSkipped ? 'bg-amber-50/30 border-amber-200' :
                      correct ? 'bg-emerald-50/20 border-emerald-200' :
                      'bg-rose-50/20 border-rose-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm">
                          {idx + 1}
                        </span>
                        
                        <span className={`px-3 py-1 font-bold text-[10px] uppercase rounded-full ${
                          q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                          q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>

                      {isSkipped ? (
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                          <Info className="w-5 h-5" />
                          <span>Skipped</span>
                        </div>
                      ) : correct ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <CheckCircle className="w-5 h-5" />
                          <span>Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                          <XCircle className="w-5 h-5" />
                          <span>Incorrect</span>
                        </div>
                      )}
                    </div>

                    {/* Question text */}
                    <p className="font-bold text-slate-800 text-base mt-4 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options list showing selections */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOpt = oIdx === q.correctAnswer;
                        const isSelectedOpt = oIdx === selected;

                        let borderClass = 'border-slate-100 bg-white';
                        let badgeClass = 'bg-slate-100 text-slate-500';

                        if (isCorrectOpt) {
                          borderClass = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold';
                          badgeClass = 'bg-emerald-600 text-white';
                        } else if (isSelectedOpt && !correct) {
                          borderClass = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                          badgeClass = 'bg-rose-600 text-white';
                        }

                        return (
                          <div 
                            key={oIdx} 
                            className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${borderClass}`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badgeClass}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="mt-0.5 leading-snug">{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="mt-5 pt-4 border-t border-dashed border-slate-200">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        Explanation
                      </h5>
                      <p className="text-slate-600 text-sm mt-1.5 leading-relaxed font-medium">
                        {q.explanation}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
