import { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, Target, Zap, Star, Trophy,
  CheckCircle2, XCircle, Lightbulb, ArrowRight, Flame
} from 'lucide-react';

interface AdaptiveTestEngineProps {
  onComplete: () => void;
}

interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  difficulty: number;
  confidence: number;
  streak: number;
}

export function AdaptiveTestEngine({ onComplete }: AdaptiveTestEngineProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    accuracy: 0,
    speed: 0,
    difficulty: 0.5, // 0-1 scale
    confidence: 0.5,
    streak: 0
  });
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState('');

  // AI dynamically generates next question based on performance
  const getNextQuestion = () => {
    const { accuracy, difficulty, streak } = performance;
    
    // Adaptive logic
    let newDifficulty = difficulty;
    
    if (answers.length > 0) {
      const lastCorrect = answers[answers.length - 1].correct;
      
      if (lastCorrect) {
        // Increase difficulty if answer is correct
        newDifficulty = Math.min(1, difficulty + 0.1);
        if (streak >= 3) {
          setAdaptiveMessage('🔥 Great streak! Increasing difficulty...');
        } else {
          setAdaptiveMessage('✅ Correct! Moving to harder questions...');
        }
      } else {
        // Decrease difficulty if answer is wrong
        newDifficulty = Math.max(0, difficulty - 0.15);
        setAdaptiveMessage('Let\'s try something more manageable...');
      }
    }
    
    return {
      difficulty: newDifficulty,
      question: generateQuestion(newDifficulty)
    };
  };

  const generateQuestion = (difficulty: number) => {
    // AI-generated question based on difficulty level
    const difficultyLevel = difficulty < 0.33 ? 'easy' : difficulty < 0.67 ? 'medium' : 'hard';
    
    // Sample adaptive questions
    const questionBank = {
      easy: [
        {
          id: 1,
          question: 'What is 5 + 3?',
          options: ['6', '7', '8', '9'],
          correct: 2,
          topic: 'Basic Arithmetic'
        },
        {
          id: 2,
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correct: 2,
          topic: 'Geography'
        }
      ],
      medium: [
        {
          id: 3,
          question: 'Solve: 3x + 5 = 20',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'],
          correct: 1,
          topic: 'Linear Equations'
        },
        {
          id: 4,
          question: 'What is the powerhouse of the cell?',
          options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'],
          correct: 1,
          topic: 'Cell Biology'
        }
      ],
      hard: [
        {
          id: 5,
          question: 'Find the derivative of f(x) = x³ - 3x² + 2x',
          options: ['3x² - 6x + 2', '3x² - 3x + 2', 'x² - 6x + 2', '3x² - 6x'],
          correct: 0,
          topic: 'Calculus'
        },
        {
          id: 6,
          question: 'Which element has atomic number 79?',
          options: ['Silver', 'Gold', 'Platinum', 'Mercury'],
          correct: 1,
          topic: 'Chemistry'
        }
      ]
    };
    
    const pool = questionBank[difficultyLevel];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const [currentQ, setCurrentQ] = useState(getNextQuestion().question);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestion]);

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const timeSpent = (Date.now() - startTime) / 1000; // seconds
    const isCorrect = selectedAnswer === currentQ.correct;
    
    // Update performance metrics
    const newAnswers = [...answers, { correct: isCorrect, time: timeSpent }];
    const correctCount = newAnswers.filter(a => a.correct).length;
    const newAccuracy = correctCount / newAnswers.length;
    const avgTime = newAnswers.reduce((sum, a) => sum + a.time, 0) / newAnswers.length;
    const newSpeed = Math.max(0, 1 - (avgTime / 60)); // Normalize to 0-1
    
    const newPerformance = {
      ...performance,
      accuracy: newAccuracy,
      speed: newSpeed,
      streak: isCorrect ? performance.streak + 1 : 0,
      confidence: (newAccuracy + newSpeed) / 2
    };

    setAnswers(newAnswers);
    setQuestionTimes([...questionTimes, timeSpent]);
    setPerformance(newPerformance);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion >= 9) {
      onComplete();
      return;
    }

    const next = getNextQuestion();
    setPerformance({ ...performance, difficulty: next.difficulty });
    setCurrentQ(next.question);
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  return (
    <div className=" mx-auto">
      <div className="grid grid-cols-3 gap-6">
        {/* Main Question Area */}
        <div className="col-span-2">
          {/* Adaptive AI Status */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Adaptive Engine Active</h3>
                <p className="text-sm text-white/80">Questions adapting to your performance in real-time</p>
              </div>
            </div>
            {adaptiveMessage && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm">
                {adaptiveMessage}
              </div>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                  Question {currentQuestion + 1} / 10
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {currentQ.topic}
                </span>
              </div>
              {performance.streak >= 3 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full animate-pulse">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-bold">{performance.streak} Streak!</span>
                </div>
              )}
            </div>

            {/* Difficulty Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Current Difficulty:</span>
                <span className={`font-bold ${
                  performance.difficulty < 0.33 ? 'text-green-600' :
                  performance.difficulty < 0.67 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {performance.difficulty < 0.33 ? 'Easy' :
                   performance.difficulty < 0.67 ? 'Medium' : 'Hard'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    performance.difficulty < 0.33 ? 'bg-green-500' :
                    performance.difficulty < 0.67 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${performance.difficulty * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <p className="text-2xl text-gray-900 font-bold mb-2">{currentQ.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {currentQ.options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showFeedback}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all text-lg ${
                    showFeedback
                      ? idx === currentQ.correct
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : idx === selectedAnswer
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                      : selectedAnswer === idx
                      ? 'bg-purple-100 border-purple-500 text-purple-900'
                      : 'bg-white border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      showFeedback
                        ? idx === currentQ.correct
                          ? 'border-green-500 bg-green-500'
                          : idx === selectedAnswer
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                        : selectedAnswer === idx
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {showFeedback && idx === currentQ.correct && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                      {showFeedback && idx === selectedAnswer && idx !== currentQ.correct && (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="font-bold text-xl">{String.fromCharCode(65 + idx)}.</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className={`rounded-xl p-6 border-2 mb-6 ${
                selectedAnswer === currentQ.correct
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  {selectedAnswer === currentQ.correct ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`text-lg font-bold mb-2 ${
                      selectedAnswer === currentQ.correct ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {selectedAnswer === currentQ.correct
                        ? '✓ Excellent! That\'s correct!'
                        : '✗ Not quite right'}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {selectedAnswer === currentQ.correct
                        ? 'The AI will now present a more challenging question.'
                        : 'Don\'t worry! The AI will adjust to help you learn better.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {!showFeedback ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-bold text-lg"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                >
                  {currentQuestion < 9 ? 'Next Question' : 'Finish Test'}
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Live Performance Analytics */}
        <div className="space-y-6">
          {/* Real-time Performance */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Live Performance
            </h3>

            {/* Accuracy */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-bold text-green-600">
                  {Math.round(performance.accuracy * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${performance.accuracy * 100}%` }}
                />
              </div>
            </div>

            {/* Speed */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Speed</span>
                <span className="font-bold text-blue-600">
                  {Math.round(performance.speed * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                  style={{ width: `${performance.speed * 100}%` }}
                />
              </div>
            </div>

            {/* Confidence */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">AI Confidence Score</span>
                <span className="font-bold text-purple-600">
                  {Math.round(performance.confidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{ width: `${performance.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-green-600 mb-1">Correct</div>
                <div className="text-2xl font-bold text-green-700">
                  {answers.filter(a => a.correct).length}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="text-xs text-red-600 mb-1">Incorrect</div>
                <div className="text-2xl font-bold text-red-700">
                  {answers.filter(a => !a.correct).length}
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              AI Insights
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Strength</div>
                    <div className="text-gray-600">
                      {performance.accuracy > 0.7
                        ? 'Excellent understanding! Keep it up.'
                        : 'Focus on fundamentals to improve.'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Recommendation</div>
                    <div className="text-gray-600">
                      {performance.speed < 0.5
                        ? 'Take your time - accuracy is more important.'
                        : 'Great pace! Maintain this speed.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Test Progress</h3>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                    idx < currentQuestion
                      ? answers[idx]?.correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : idx === currentQuestion
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
