import { useState } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

interface AssessmentPageProps {
  onComplete: (results: any) => void;
  profileData: any;
}

interface Question {
  id: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    category: 'Algebra Basics',
    difficulty: 'easy',
    subject: 'Mathematics',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '5', '7', '15'],
    correctAnswer: 1,
  },
  {
    id: 2,
    category: 'Geometry',
    difficulty: 'medium',
    subject: 'Mathematics',
    question: 'What is the area of a circle with radius 7 cm? (Use π = 22/7)',
    options: ['44 cm²', '154 cm²', '308 cm²', '616 cm²'],
    correctAnswer: 1,
  },
  {
    id: 3,
    category: 'Motion',
    difficulty: 'easy',
    subject: 'Physics',
    question: 'If a car travels 60 km in 1 hour, what is its speed?',
    options: ['30 km/h', '60 km/h', '90 km/h', '120 km/h'],
    correctAnswer: 1,
  },
  {
    id: 4,
    category: 'Atomic Structure',
    difficulty: 'medium',
    subject: 'Chemistry',
    question: 'What is the atomic number of Carbon?',
    options: ['4', '6', '8', '12'],
    correctAnswer: 1,
  },
  {
    id: 5,
    category: 'Logical Reasoning',
    difficulty: 'easy',
    subject: 'Aptitude',
    question: 'If all roses are flowers and some flowers fade quickly, which statement is true?',
    options: [
      'All roses fade quickly',
      'Some roses may fade quickly',
      'No roses fade quickly',
      'All flowers are roses',
    ],
    correctAnswer: 1,
  },
  {
    id: 6,
    category: 'Equations',
    difficulty: 'hard',
    subject: 'Mathematics',
    question: 'Solve for x: x² - 5x + 6 = 0',
    options: ['x = 1, 6', 'x = 2, 3', 'x = -2, -3', 'x = 1, -6'],
    correctAnswer: 1,
  },
  {
    id: 7,
    category: 'Grammar',
    difficulty: 'easy',
    subject: 'English',
    question: 'Choose the correct sentence:',
    options: [
      'He don\'t like apples',
      'He doesn\'t likes apples',
      'He doesn\'t like apples',
      'He not like apples',
    ],
    correctAnswer: 2,
  },
  {
    id: 8,
    category: 'Forces',
    difficulty: 'medium',
    subject: 'Physics',
    question: 'What is Newton\'s Second Law of Motion?',
    options: ['F = ma', 'E = mc²', 'V = IR', 'PV = nRT'],
    correctAnswer: 0,
  },
  {
    id: 9,
    category: 'Percentage',
    difficulty: 'medium',
    subject: 'Mathematics',
    question: 'What is 25% of 80?',
    options: ['15', '20', '25', '30'],
    correctAnswer: 1,
  },
  {
    id: 10,
    category: 'Chemical Reactions',
    difficulty: 'hard',
    subject: 'Chemistry',
    question: 'What is the pH of a neutral solution at 25°C?',
    options: ['0', '7', '14', '1'],
    correctAnswer: 1,
  },
];

export function AssessmentPage({ onComplete, profileData }: AssessmentPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(mockQuestions.length).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Calculate results
    const results = mockQuestions.map((q, idx) => ({
      question: q,
      userAnswer: answers[idx],
      isCorrect: answers[idx] === q.correctAnswer,
    }));

    const correctCount = results.filter((r) => r.isCorrect).length;
    const subjectWise = results.reduce((acc, r) => {
      const subject = r.question.subject;
      if (!acc[subject]) {
        acc[subject] = { correct: 0, total: 0 };
      }
      acc[subject].total++;
      if (r.isCorrect) acc[subject].correct++;
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    setTimeout(() => {
      onComplete({
        totalQuestions: mockQuestions.length,
        correctAnswers: correctCount,
        percentage: Math.round((correctCount / mockQuestions.length) * 100),
        subjectWise,
        detailedResults: results,
      });
    }, 1000);
  };

  const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        <div className=" mx-auto w-full flex-1 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl text-gray-900 mb-1">Readiness Assessment</h1>
            <p className="text-sm text-gray-600">
              This helps us understand your current academic level
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 flex-1 flex flex-col">
            {/* Progress Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-900">Readiness Assessment</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {currentQuestion.subject}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                <span>Question {currentQuestionIndex + 1} of {mockQuestions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col">
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1.5">{currentQuestion.category}</div>
                    <h3 className="text-lg text-gray-900">{currentQuestion.question}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    currentQuestion.difficulty === 'easy'
                      ? 'bg-green-100 text-green-700'
                      : currentQuestion.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        answers[currentQuestionIndex] === idx
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            answers[currentQuestionIndex] === idx
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {answers[currentQuestionIndex] === idx && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-sm text-gray-900">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={answers[currentQuestionIndex] === null}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 group text-sm"
                >
                  <span>{isLastQuestion ? 'Submit Assessment' : 'Next Question'}</span>
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm text-yellow-900 mb-0.5">Important</h4>
                <p className="text-xs text-yellow-800">
                  Answer honestly! This assessment helps us create a personalized learning path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}