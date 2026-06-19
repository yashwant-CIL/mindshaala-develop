import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Target, Award, TrendingUp, Calendar, CheckCircle2, Lock, Zap, Gift, Crown, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';

interface DailyChallengeStreakProps {
  onBack?: () => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  xp: number;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  completed: boolean;
  locked: boolean;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  streakRequired: number;
  unlocked: boolean;
}

export function DailyChallengeStreak({ onBack }: DailyChallengeStreakProps) {
  const [currentStreak, setCurrentStreak] = useState(7);
  const [longestStreak, setLongestStreak] = useState(15);
  const [totalPoints, setTotalPoints] = useState(1250);
  const [totalXP, setTotalXP] = useState(3450);
  const [level, setLevel] = useState(8);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Today\'s Quick Quiz',
      description: '5 rapid-fire questions across all subjects',
      subject: 'Mixed',
      difficulty: 'Medium',
      points: 50,
      xp: 100,
      questions: [
        {
          question: 'What is the powerhouse of the cell?',
          options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'],
          correctAnswer: 1,
          explanation: 'Mitochondria are called the powerhouse of the cell because they produce ATP (energy) through cellular respiration.'
        },
        {
          question: 'Solve: 2x + 5 = 15',
          options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 20'],
          correctAnswer: 0,
          explanation: '2x + 5 = 15 → 2x = 10 → x = 5'
        },
        {
          question: 'Which gas is most abundant in Earth\'s atmosphere?',
          options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
          correctAnswer: 2,
          explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere, while oxygen is about 21%.'
        },
        {
          question: 'What is Newton\'s First Law of Motion?',
          options: ['F = ma', 'Law of Inertia', 'Action-Reaction', 'Conservation of Energy'],
          correctAnswer: 1,
          explanation: 'Newton\'s First Law, also called the Law of Inertia, states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.'
        },
        {
          question: 'What is the chemical formula for water?',
          options: ['H₂O', 'CO₂', 'O₂', 'H₂O₂'],
          correctAnswer: 0,
          explanation: 'Water consists of 2 hydrogen atoms and 1 oxygen atom, hence H₂O.'
        }
      ],
      completed: false,
      locked: false
    },
    {
      id: '2',
      title: 'Physics Power Hour',
      description: 'Master mechanics concepts',
      subject: 'Physics',
      difficulty: 'Hard',
      points: 100,
      xp: 200,
      questions: [],
      completed: false,
      locked: false
    },
    {
      id: '3',
      title: 'Math Marathon',
      description: 'Solve challenging algebra problems',
      subject: 'Mathematics',
      difficulty: 'Hard',
      points: 100,
      xp: 200,
      questions: [],
      completed: false,
      locked: false
    },
    {
      id: '4',
      title: 'Weekly Champion Challenge',
      description: 'Complete 20 questions to claim weekly rewards',
      subject: 'Mixed',
      difficulty: 'Hard',
      points: 500,
      xp: 1000,
      questions: [],
      completed: false,
      locked: true
    }
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    { id: '1', title: 'Streak Starter', description: 'Complete 3 days streak', icon: '🔥', streakRequired: 3, unlocked: true },
    { id: '2', title: 'Week Warrior', description: 'Complete 7 days streak', icon: '⚔️', streakRequired: 7, unlocked: true },
    { id: '3', title: 'Study Champion', description: 'Complete 14 days streak', icon: '🏆', streakRequired: 14, unlocked: false },
    { id: '4', title: 'Consistency King', description: 'Complete 30 days streak', icon: '👑', streakRequired: 30, unlocked: false },
    { id: '5', title: 'Legend', description: 'Complete 50 days streak', icon: '⭐', streakRequired: 50, unlocked: false }
  ]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completedDays = [true, true, true, true, true, true, true]; // Current week

  const handleStartChallenge = (challenge: Challenge) => {
    if (challenge.locked) return;
    setSelectedChallenge(challenge);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !selectedChallenge) return;

    const currentQuestion = selectedChallenge.questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!selectedChallenge) return;

    if (currentQuestionIndex < selectedChallenge.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Challenge completed
      const updatedChallenges = challenges.map(c =>
        c.id === selectedChallenge.id ? { ...c, completed: true } : c
      );
      setChallenges(updatedChallenges);
      setTotalPoints(totalPoints + selectedChallenge.points);
      setTotalXP(totalXP + selectedChallenge.xp);
      setSelectedChallenge(null);
    }
  };

  const xpForNextLevel = level * 500;
  const xpProgress = (totalXP % 500) / 500 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {!selectedChallenge ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                {onBack && (
                  <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Daily Challenge & Streak</h1>
                  <p className="text-sm text-gray-500">Build consistency and earn amazing rewards!</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white border-none shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-white/80">Current Streak</p>
                      <p className="text-2xl font-bold">{currentStreak} days</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-white/80">Longest Streak</p>
                      <p className="text-2xl font-bold">{longestStreak} days</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-none shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-white/80">Total Points</p>
                      <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white border-none shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-white/80">Level</p>
                      <p className="text-2xl font-bold">Level {level}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* XP Progress */}
              <Card className="p-5 bg-white/90 backdrop-blur border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      {totalXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {xpForNextLevel - (totalXP % 500)} XP to Level {level + 1}
                  </span>
                </div>
                <Progress value={xpProgress} className="h-3" />
              </Card>

              {/* Week Streak Calendar */}
              <Card className="p-6 bg-white/90 backdrop-blur border-gray-200 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  This Week's Streak
                </h3>
                <div className="grid grid-cols-7 gap-3">
                  {weekDays.map((day, index) => (
                    <div key={day} className="text-center">
                      <p className="text-xs text-gray-500 mb-2">{day}</p>
                      <div className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                        completedDays[index]
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg'
                          : 'bg-gray-100 border-2 border-dashed border-gray-300'
                      }`}>
                        {completedDays[index] ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Daily Challenges */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Challenges</h2>
              <div className="grid grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className={`p-5 bg-white hover:shadow-lg transition-all ${
                      challenge.locked ? 'opacity-60' : 'cursor-pointer'
                    } ${challenge.completed ? 'border-2 border-green-500' : ''}`}
                    onClick={() => handleStartChallenge(challenge)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                          {challenge.locked && <Lock className="w-4 h-4 text-gray-400" />}
                          {challenge.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{challenge.subject}</Badge>
                          <Badge className={`${
                            challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-orange-600">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-semibold">+{challenge.points}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <Zap className="w-4 h-4 fill-current" />
                          <span className="text-sm font-semibold">+{challenge.xp} XP</span>
                        </div>
                      </div>
                      {!challenge.locked && !challenge.completed && (
                        <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                          Start <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-600" />
                Streak Rewards
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {rewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className={`p-4 text-center ${
                      reward.unlocked
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none shadow-lg'
                        : 'bg-white border-2 border-dashed border-gray-300'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
                      reward.unlocked ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {reward.unlocked ? reward.icon : '🔒'}
                    </div>
                    <h3 className={`font-semibold mb-1 ${reward.unlocked ? 'text-white' : 'text-gray-900'}`}>
                      {reward.title}
                    </h3>
                    <p className={`text-xs mb-2 ${reward.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                      {reward.description}
                    </p>
                    <Badge className={reward.unlocked ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}>
                      {reward.streakRequired} days
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Challenge Quiz Interface */
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 bg-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedChallenge.title}</h2>
                  <p className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of {selectedChallenge.questions.length}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{score}/{selectedChallenge.questions.length}</div>
                  <p className="text-xs text-gray-500">Correct Answers</p>
                </div>
              </div>

              <Progress
                value={((currentQuestionIndex + 1) / selectedChallenge.questions.length) * 100}
                className="mb-6 h-2"
              />

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedChallenge.questions[currentQuestionIndex].question}
                </h3>

                <div className="space-y-3">
                  {selectedChallenge.questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showExplanation && handleAnswerSelect(index)}
                      disabled={showExplanation}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? showExplanation
                            ? index === selectedChallenge.questions[currentQuestionIndex].correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-blue-500 bg-blue-50'
                          : showExplanation && index === selectedChallenge.questions[currentQuestionIndex].correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? showExplanation
                              ? index === selectedChallenge.questions[currentQuestionIndex].correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : 'border-red-500 bg-red-500'
                              : 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {showExplanation && index === selectedChallenge.questions[currentQuestionIndex].correctAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-gray-700">{selectedChallenge.questions[currentQuestionIndex].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedChallenge(null)}
                  className="flex-1"
                >
                  Exit Challenge
                </Button>
                {!showExplanation ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {currentQuestionIndex < selectedChallenge.questions.length - 1 ? 'Next Question' : 'Complete Challenge'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
