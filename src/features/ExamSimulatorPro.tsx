// ============================================================================
// EXAM SIMULATOR PRO - Realistic ICSE Board Exam Practice
// ============================================================================
// Revolutionary Features:
// 1. AI Proctoring - Tab switch detection, focus monitoring
// 2. Real-time stress monitoring - Detect exam anxiety
// 3. Time pressure simulation - Builds exam temperament
// 4. Adaptive difficulty - Adjusts based on performance
// 5. Instant analytics - Compare with toppers
// 6. Exam strategy coaching - Time management tips
// ============================================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Eye, AlertTriangle, TrendingUp, Award, Target, Zap } from 'lucide-react';

interface ExamQuestion {
  id: string;
  subject: string;
  topic: string;
  questionText: string;
  options: { label: string; text: string; }[];
  correctAnswer: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  avgTimeTopper: number; // seconds - how long toppers take
}

interface ExamAttempt {
  questionId: string;
  selectedAnswer: string;
  timeTaken: number;
  isCorrect: boolean;
  confidence: number; // 1-5
  flagged: boolean;
}

interface ProctorEvent {
  type: 'tab_switch' | 'idle' | 'low_focus' | 'copy_paste' | 'right_click';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export default function ExamSimulatorPro({ examType = 'full', duration = 180 }: {
  examType: 'full' | 'subject' | 'chapter';
  duration: number; // minutes
}) {
  const [examState, setExamState] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // seconds
  const [proctorEvents, setProctorEvents] = useState<ProctorEvent[]>([]);
  const [stressLevel, setStressLevel] = useState(0); // 0-100
  const [focusScore, setFocusScore] = useState(100); // 100 = perfect focus
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);

  const questionStartTimeRef = useRef<Date>(new Date());
  const tabSwitchCountRef = useRef(0);
  const idleTimeRef = useRef(0);

  // ============================================================================
  // 1. AI PROCTORING SYSTEM
  // ============================================================================

  useEffect(() => {
    if (examState !== 'in_progress') return;

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        
        const event: ProctorEvent = {
          type: 'tab_switch',
          timestamp: new Date(),
          severity: tabSwitchCountRef.current > 3 ? 'high' : 'medium'
        };
        
        setProctorEvents(prev => [...prev, event]);
        setFocusScore(prev => Math.max(0, prev - 10));
        
        // Show warning
        if (tabSwitchCountRef.current === 1) {
          alert('⚠️ Tab switching detected! This happens in real exams too - stay focused!');
        } else if (tabSwitchCountRef.current === 3) {
          alert('🚨 Multiple tab switches! In real exams, this could raise concerns. Stay on this page.');
        }
      }
    };

    // Copy-paste detection
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setProctorEvents(prev => [...prev, {
        type: 'copy_paste',
        timestamp: new Date(),
        severity: 'medium'
      }]);
      alert('📋 Copy-paste not allowed during exam!');
    };

    // Right-click detection (prevent inspection)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setProctorEvents(prev => [...prev, {
        type: 'right_click',
        timestamp: new Date(),
        severity: 'low'
      }]);
    };

    // Idle detection
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimeRef.current = 0;
      
      idleTimer = setTimeout(() => {
        idleTimeRef.current += 30;
        setProctorEvents(prev => [...prev, {
          type: 'idle',
          timestamp: new Date(),
          severity: 'low'
        }]);
        setFocusScore(prev => Math.max(0, prev - 5));
      }, 30000); // 30 seconds idle
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);

    resetIdleTimer();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mousemove', resetIdleTimer);
      document.removeEventListener('keypress', resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, [examState]);

  // ============================================================================
  // 2. REAL-TIME STRESS MONITORING
  // ============================================================================

  useEffect(() => {
    if (examState !== 'in_progress') return;

    const stressInterval = setInterval(() => {
      // Calculate stress based on multiple factors
      const timeStress = (1 - (timeRemaining / (duration * 60))) * 40; // Max 40 points
      const performanceStress = calculatePerformanceStress(); // Max 30 points
      const paceStress = calculatePaceStress(); // Max 30 points
      
      const totalStress = Math.min(100, timeStress + performanceStress + paceStress);
      setStressLevel(Math.round(totalStress));

      // Provide stress management suggestions
      if (totalStress > 70 && totalStress < 75) {
        showStressAlert('moderate');
      } else if (totalStress >= 75) {
        showStressAlert('high');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(stressInterval);
  }, [examState, timeRemaining, attempts]);

  const calculatePerformanceStress = (): number => {
    if (attempts.length === 0) return 0;
    
    const recentAttempts = attempts.slice(-5); // Last 5 questions
    const correctCount = recentAttempts.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / recentAttempts.length) * 100;
    
    // Lower accuracy = higher stress
    return accuracy < 50 ? 30 : accuracy < 70 ? 15 : 0;
  };

  const calculatePaceStress = (): number => {
    const questionsAnswered = attempts.length;
    const expectedProgress = (questions.length * ((duration * 60 - timeRemaining) / (duration * 60)));
    
    // Behind pace = higher stress
    const gap = expectedProgress - questionsAnswered;
    return gap > 5 ? 30 : gap > 2 ? 15 : 0;
  };

  const showStressAlert = (level: 'moderate' | 'high') => {
    const tips = {
      moderate: [
        '🧘 Take 3 deep breaths',
        '💧 Drink some water',
        '⏸️ Pause and reread the question slowly'
      ],
      high: [
        '🛑 STOP: Take a 30-second break',
        '🧠 Close your eyes and count to 10',
        '✋ Skip this question and come back later',
        '🎯 Focus on what you KNOW, not what you don\'t'
      ]
    };

    console.log(`Stress Alert (${level}):`, tips[level]);
    // Could show a modal or notification here
  };

  // ============================================================================
  // 3. TIMER & EXAM CONTROL
  // ============================================================================

  useEffect(() => {
    if (examState !== 'in_progress') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleExamEnd();
          return 0;
        }
        
        // Warnings at critical times
        if (prev === 600) { // 10 minutes left
          alert('⏰ 10 minutes remaining! Review flagged questions.');
        } else if (prev === 300) { // 5 minutes left
          alert('🚨 5 minutes left! Focus on completing unanswered questions.');
        } else if (prev === 60) { // 1 minute left
          alert('⚠️ FINAL MINUTE! Submit your best answers now.');
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // 4. ADAPTIVE DIFFICULTY
  // ============================================================================

  const selectNextQuestion = (): ExamQuestion | null => {
    // Analyze recent performance
    const recentAttempts = attempts.slice(-3);
    const recentAccuracy = recentAttempts.length > 0
      ? (recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100
      : 50;

    // Adjust difficulty based on performance
    const targetDifficulty = 
      recentAccuracy > 80 ? 'hard' :
      recentAccuracy > 50 ? 'medium' :
      'easy';

    // Find unanswered questions of target difficulty
    const answeredIds = new Set(attempts.map(a => a.questionId));
    const unansweredQuestions = questions.filter(q => !answeredIds.has(q.id));
    
    const targetQuestions = unansweredQuestions.filter(q => q.difficulty === targetDifficulty);
    
    // If no questions of target difficulty, pick any unanswered
    return targetQuestions.length > 0 
      ? targetQuestions[0] 
      : unansweredQuestions[0] || null;
  };

  // ============================================================================
  // 5. EXAM FLOW CONTROL
  // ============================================================================

  const startExam = () => {
    // Load questions (mock data for now)
    const mockQuestions: ExamQuestion[] = Array.from({ length: 50 }, (_, i) => ({
      id: `q_${i + 1}`,
      subject: ['Math', 'Physics', 'Chemistry'][i % 3],
      topic: `Topic ${i + 1}`,
      questionText: `Sample question ${i + 1} text here...`,
      options: [
        { label: 'A', text: 'Option A' },
        { label: 'B', text: 'Option B' },
        { label: 'C', text: 'Option C' },
        { label: 'D', text: 'Option D' }
      ],
      correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      marks: 2,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any,
      avgTimeTopper: 60 + Math.random() * 60 // 60-120 seconds
    }));

    setQuestions(mockQuestions);
    setExamState('in_progress');
    setExamStartTime(new Date());
    questionStartTimeRef.current = new Date();
  };

  const handleAnswerSelect = (answer: string, confidence: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = (new Date().getTime() - questionStartTimeRef.current.getTime()) / 1000;

    const attempt: ExamAttempt = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      timeTaken,
      isCorrect: answer === currentQuestion.correctAnswer,
      confidence,
      flagged: false
    };

    setAttempts(prev => [...prev, attempt]);

    // Provide instant feedback on pacing
    if (timeTaken > currentQuestion.avgTimeTopper * 1.5) {
      console.log('⏱️ Pacing Alert: You\'re spending too much time on this question');
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      questionStartTimeRef.current = new Date();
    } else {
      handleExamEnd();
    }
  };

  const handleExamEnd = () => {
    setExamState('completed');
    generateDetailedReport();
  };

  // ============================================================================
  // 6. PERFORMANCE ANALYTICS
  // ============================================================================

  const generateDetailedReport = () => {
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;

    // Calculate topper comparison
    const avgTimeTaken = attempts.reduce((sum, a) => sum + a.timeTaken, 0) / attempts.length;
    const topperAvgTime = questions.reduce((sum, q) => sum + q.avgTimeTopper, 0) / questions.length;
    const speedComparison = (avgTimeTaken / topperAvgTime) * 100;

    // Subject-wise breakdown
    const subjectWise = attempts.reduce((acc, attempt) => {
      const question = questions.find(q => q.id === attempt.questionId);
      if (!question) return acc;

      if (!acc[question.subject]) {
        acc[question.subject] = { correct: 0, total: 0 };
      }
      
      acc[question.subject].total += 1;
      if (attempt.isCorrect) acc[question.subject].correct += 1;

      return acc;
    }, {} as Record<string, { correct: number; total: number; }>);

    console.log('📊 Exam Report:', {
      accuracy: `${accuracy.toFixed(1)}%`,
      score: `${correctAnswers}/${totalQuestions}`,
      speedVsTopper: speedComparison < 100 ? 'Faster ⚡' : 'Slower 🐌',
      stressLevel: `${stressLevel}%`,
      focusScore: `${focusScore}%`,
      proctorViolations: proctorEvents.filter(e => e.severity === 'high').length,
      subjectWise
    });
  };

  // ============================================================================
  // UI COMPONENTS
  // ============================================================================

  if (examState === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Exam Simulator Pro
            </h1>
            <p className="text-gray-600">
              Experience real ICSE board exam conditions
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Exam Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Questions:</span>
                <span className="font-medium">50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Marks:</span>
                <span className="font-medium">100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Negative Marking:</span>
                <span className="font-medium">No</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Exam Rules:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• No tab switching allowed</li>
              <li>• No copy-paste operations</li>
              <li>• AI proctoring will monitor your activity</li>
              <li>• Timer cannot be paused once started</li>
              <li>• Treat this like a real board exam!</li>
            </ul>
          </div>

          <button
            onClick={startExam}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
          >
            Start Exam 🚀
          </button>
        </div>
      </div>
    );
  }

  if (examState === 'in_progress') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-600'}`} />
                  <span className={`font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Focus: {focusScore}%</span>
                </div>

                {stressLevel > 50 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-orange-600">Stress: {stressLevel}%</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="max-w-4xl mx-auto p-6 py-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {currentQuestion.subject}
                </div>
                <div className="text-sm text-gray-600">{currentQuestion.marks} marks</div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentQuestion.difficulty}
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.questionText}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map(option => (
                <button
                  key={option.label}
                  onClick={() => handleAnswerSelect(option.label, 3)}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <span className="font-semibold text-purple-600 mr-3">{option.label}.</span>
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Exam Completed! 🎉
          </h1>
          <p className="text-gray-600">
            Here's your detailed performance report
          </p>
        </div>

        {/* Performance cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Your Score</div>
            <div className="text-4xl font-bold">
              {attempts.filter(a => a.isCorrect).length}/{attempts.length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Accuracy</div>
            <div className="text-4xl font-bold">
              {attempts.length > 0 
                ? Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100)
                : 0}%
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Focus Score</div>
            <div className="text-4xl font-bold">{focusScore}%</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Proctor Alerts</div>
            <div className="text-4xl font-bold">{proctorEvents.length}</div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
        >
          View Detailed Analysis →
        </button>
      </div>
    </div>
  );
}
