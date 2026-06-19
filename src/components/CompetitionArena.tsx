import { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Zap, Target, Clock, Award, Flame, Crown, Bot,
  User, ChevronRight, Play, Pause, RotateCcw, Star, Medal,
  TrendingUp, Activity, CheckCircle, XCircle, Timer, Brain,
  Sparkles, Code, Blocks, GitBranch, Settings, Volume2, VolumeX, Wand2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { LiveRaceMode } from './LiveRaceMode';
import { ChallengeCreator } from './ChallengeCreator';

interface CompetitionArenaProps {
  onClose: () => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'flowchart' | 'block-coding' | 'algorithm' | 'debugging';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: number; // in seconds
  maxScore: number;
  icon: any;
}

interface AIOpponent {
  id: string;
  name: string;
  avatar: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  speed: number; // 0.5 to 2.0 multiplier
  accuracy: number; // 0-100
  personality: string;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface RaceState {
  studentProgress: number;
  aiProgress: number;
  studentScore: number;
  aiScore: number;
  isRunning: boolean;
  winner: 'student' | 'ai' | null;
  timeElapsed: number;
}

const aiOpponents: AIOpponent[] = [
  {
    id: 'rookie',
    name: 'Rookie Bot',
    avatar: '🤖',
    difficulty: 'easy',
    speed: 0.6,
    accuracy: 70,
    personality: 'Learning alongside you',
    color: '#22c55e'
  },
  {
    id: 'challenger',
    name: 'Challenger AI',
    avatar: '🎯',
    difficulty: 'medium',
    speed: 1.0,
    accuracy: 85,
    personality: 'Balanced competitor',
    color: '#3b82f6'
  },
  {
    id: 'master',
    name: 'Master Mind',
    avatar: '🧠',
    difficulty: 'hard',
    speed: 1.4,
    accuracy: 92,
    personality: 'Tough opponent',
    color: '#f59e0b'
  },
  {
    id: 'legend',
    name: 'Legend Genius',
    avatar: '👑',
    difficulty: 'expert',
    speed: 1.8,
    accuracy: 98,
    personality: 'Ultimate challenge',
    color: '#ef4444'
  }
];

const challenges: Challenge[] = [
  {
    id: 'fc-1',
    title: 'Sum of Two Numbers',
    description: 'Create a flowchart to add two numbers',
    type: 'flowchart',
    difficulty: 'easy',
    estimatedTime: 120,
    maxScore: 1000,
    icon: GitBranch
  },
  {
    id: 'fc-2',
    title: 'Find Maximum Number',
    description: 'Build a flowchart to find the largest of three numbers',
    type: 'flowchart',
    difficulty: 'medium',
    estimatedTime: 180,
    maxScore: 1500,
    icon: GitBranch
  },
  {
    id: 'bc-1',
    title: 'Move and Draw Pattern',
    description: 'Create a block program to draw a square pattern',
    type: 'block-coding',
    difficulty: 'easy',
    estimatedTime: 150,
    maxScore: 1200,
    icon: Blocks
  },
  {
    id: 'bc-2',
    title: 'Loop Challenge',
    description: 'Use loops to create a spiral pattern',
    type: 'block-coding',
    difficulty: 'medium',
    estimatedTime: 200,
    maxScore: 1600,
    icon: Blocks
  },
  {
    id: 'algo-1',
    title: 'Bubble Sort',
    description: 'Implement bubble sort algorithm',
    type: 'algorithm',
    difficulty: 'hard',
    estimatedTime: 240,
    maxScore: 2000,
    icon: Code
  },
  {
    id: 'debug-1',
    title: 'Fix the Bug',
    description: 'Debug a faulty flowchart logic',
    type: 'debugging',
    difficulty: 'medium',
    estimatedTime: 160,
    maxScore: 1400,
    icon: Activity
  }
];

const achievements: Achievement[] = [
  { id: 'first-win', title: 'First Victory', description: 'Win your first race against AI', icon: Trophy, unlocked: false, progress: 0, maxProgress: 1 },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Complete 5 challenges in record time', icon: Zap, unlocked: false, progress: 2, maxProgress: 5 },
  { id: 'perfect-score', title: 'Perfectionist', description: 'Score 100% accuracy in a challenge', icon: Star, unlocked: false, progress: 0, maxProgress: 1 },
  { id: 'beat-master', title: 'Master Beater', description: 'Defeat Master Mind AI', icon: Crown, unlocked: false, progress: 0, maxProgress: 1 },
  { id: 'streak-5', title: 'Hot Streak', description: 'Win 5 challenges in a row', icon: Flame, unlocked: false, progress: 3, maxProgress: 5 },
  { id: 'legend-slayer', title: 'Legend Slayer', description: 'Beat Legend Genius AI', icon: Award, unlocked: true, progress: 1, maxProgress: 1 },
];

export function CompetitionArena({ onClose }: CompetitionArenaProps) {
  const [currentView, setCurrentView] = useState<'home' | 'select-challenge' | 'select-opponent' | 'race' | 'results'>('home');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<AIOpponent | null>(null);
  const [showLiveRaceMode, setShowLiveRaceMode] = useState(false);
  const [raceState, setRaceState] = useState<RaceState>({
    studentProgress: 0,
    aiProgress: 0,
    studentScore: 0,
    aiScore: 0,
    isRunning: false,
    winner: null,
    timeElapsed: 0
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalRaces: 47,
    wins: 32,
    losses: 15,
    winRate: 68,
    avgScore: 1847,
    bestScore: 2000,
    totalPoints: 59240,
    rank: 'Gold',
    level: 12
  });

  const raceIntervalRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  const startRace = () => {
    setRaceState({
      studentProgress: 0,
      aiProgress: 0,
      studentScore: 0,
      aiScore: 0,
      isRunning: true,
      winner: null,
      timeElapsed: 0
    });

    // Start timer
    timeIntervalRef.current = window.setInterval(() => {
      setRaceState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    // AI automatic progress
    if (selectedOpponent) {
      raceIntervalRef.current = window.setInterval(() => {
        setRaceState(prev => {
          if (prev.winner) return prev;

          const aiIncrement = (selectedOpponent.speed * 0.8) + (Math.random() * 0.6);
          const newAiProgress = Math.min(100, prev.aiProgress + aiIncrement);
          
          // Check if AI finished
          if (newAiProgress >= 100 && !prev.winner) {
            const aiScore = Math.floor((selectedOpponent.accuracy / 100) * (selectedChallenge?.maxScore || 1000));
            if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
            if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
            return {
              ...prev,
              aiProgress: 100,
              aiScore,
              winner: 'ai',
              isRunning: false
            };
          }

          return { ...prev, aiProgress: newAiProgress };
        });
      }, 500);
    }
  };

  const simulateStudentProgress = (amount: number) => {
    setRaceState(prev => {
      if (prev.winner || !prev.isRunning) return prev;

      const newProgress = Math.min(100, prev.studentProgress + amount);
      
      // Check if student finished
      if (newProgress >= 100 && !prev.winner) {
        const timeBonus = Math.max(0, 1 - (prev.timeElapsed / (selectedChallenge?.estimatedTime || 180)));
        const baseScore = selectedChallenge?.maxScore || 1000;
        const finalScore = Math.floor(baseScore * (0.7 + timeBonus * 0.3));
        
        if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
        if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
        
        return {
          ...prev,
          studentProgress: 100,
          studentScore: finalScore,
          winner: 'student',
          isRunning: false
        };
      }

      return { ...prev, studentProgress: newProgress };
    });
  };

  const resetRace = () => {
    setCurrentView('select-challenge');
    setSelectedChallenge(null);
    setSelectedOpponent(null);
    if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-blue-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold">Competition Arena</h1>
              <p className="text-purple-100">Race Against AI • Prove Your Skills • Earn Rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-sm text-purple-100">Your Rank</div>
              <div className="text-xl font-bold">{stats.rank} - Level {stats.level}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-sm text-purple-100">Win Rate</div>
              <div className="text-xl font-bold">{stats.winRate}%</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-sm text-purple-100">Total Points</div>
              <div className="text-xl font-bold">{stats.totalPoints.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-green-600" />
            <Badge className="bg-green-600">{stats.wins}</Badge>
          </div>
          <div className="text-sm text-gray-600">Victories</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-600" />
            <Badge className="bg-blue-600">{stats.totalRaces}</Badge>
          </div>
          <div className="text-sm text-gray-600">Total Races</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-orange-600" />
            <Badge className="bg-orange-600">{stats.bestScore}</Badge>
          </div>
          <div className="text-sm text-gray-600">Best Score</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <Badge className="bg-purple-600">{stats.avgScore}</Badge>
          </div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </Card>
      </div>

      {/* Daily Challenge */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 rounded-full p-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">Daily Challenge</h3>
                <Badge className="bg-amber-500">2x Points</Badge>
              </div>
              <p className="text-sm text-gray-600">Complete today's challenge to earn bonus rewards!</p>
              <p className="text-xs text-gray-500 mt-1">⏰ Resets in 8h 23m</p>
            </div>
          </div>
          <Button className="bg-amber-500 hover:bg-amber-600">
            <Play className="w-4 h-4 mr-2" />
            Start Challenge
          </Button>
        </div>
      </Card>

      {/* Recent Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Achievements</h2>
          <Button variant="ghost" className="text-sm">View All</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {achievements.slice(0, 3).map((achievement) => (
            <Card key={achievement.id} className={`p-4 ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300' : 'bg-gray-50 opacity-60'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                  <achievement.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1" />
                      <p className="text-xs text-gray-500 mt-1">{achievement.progress}/{achievement.maxProgress}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-4">
        <Button 
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-14 text-lg"
          onClick={() => setCurrentView('select-challenge')}
        >
          <Zap className="w-5 h-5 mr-2" />
          Start New Race
        </Button>
        <Button 
          variant="outline" 
          className="h-14 px-6"
          onClick={() => {/* View achievements */}}
        >
          <Award className="w-5 h-5 mr-2" />
          Achievements
        </Button>
      </div>
    </motion.div>
  );

  const renderChallengeSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Select Your Challenge</h2>
        <Button variant="ghost" onClick={() => setCurrentView('home')}>Back</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`p-6 cursor-pointer transition-all ${selectedChallenge?.id === challenge.id ? 'border-2 border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
              onClick={() => setSelectedChallenge(challenge)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <challenge.icon className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </div>
              <h3 className="font-bold mb-2">{challenge.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(challenge.estimatedTime / 60)}m {challenge.estimatedTime % 60}s
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {challenge.maxScore} pts
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            onClick={() => setCurrentView('select-opponent')}
          >
            Continue to Opponent Selection
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );

  const renderOpponentSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Choose Your Opponent</h2>
          <p className="text-sm text-gray-600">Each AI has different speed and accuracy</p>
        </div>
        <Button variant="ghost" onClick={() => setCurrentView('select-challenge')}>Back</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {aiOpponents.map((opponent) => (
          <motion.div
            key={opponent.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`p-6 cursor-pointer transition-all ${selectedOpponent?.id === opponent.id ? 'border-2 border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
              onClick={() => setSelectedOpponent(opponent)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{opponent.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold">{opponent.name}</h3>
                  <p className="text-xs text-gray-600">{opponent.personality}</p>
                </div>
                <Badge className={getDifficultyColor(opponent.difficulty)}>
                  {opponent.difficulty}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Speed</span>
                    <span className="font-semibold">{(opponent.speed * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={opponent.speed * 50} className="h-2" style={{ '--progress-background': opponent.color } as any} />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-semibold">{opponent.accuracy}%</span>
                  </div>
                  <Progress value={opponent.accuracy} className="h-2" style={{ '--progress-background': opponent.color } as any} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedOpponent && selectedChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200"
        >
          <h3 className="font-bold mb-4">Race Preview</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">Challenge</div>
              <div className="font-semibold">{selectedChallenge.title}</div>
              <div className="text-xs text-gray-500">{selectedChallenge.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Opponent</div>
              <div className="font-semibold">{selectedOpponent.name}</div>
              <div className="text-xs text-gray-500">{selectedOpponent.difficulty} difficulty</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
              onClick={() => {
                setCurrentView('race');
                setTimeout(() => startRace(), 1000);
              }}
            >
              <Play className="w-5 h-5 mr-2" />
              Quick Race
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12"
              onClick={() => setShowLiveRaceMode(true)}
            >
              <GitBranch className="w-5 h-5 mr-2" />
              3-Panel Live Race
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderRace = () => {
    if (!selectedChallenge || !selectedOpponent) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{selectedChallenge.title}</h2>
            <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
              {selectedChallenge.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-mono font-bold">
                {Math.floor(raceState.timeElapsed / 60)}:{(raceState.timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Race Track */}
        <div className="space-y-8">
          {/* Student Lane */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold">You</div>
                  <div className="text-xs text-gray-500">Student</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{raceState.studentProgress.toFixed(1)}%</div>
                {raceState.studentScore > 0 && (
                  <div className="text-sm text-gray-600">Score: {raceState.studentScore}</div>
                )}
              </div>
            </div>
            <div className="relative h-16 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border-2 border-blue-300 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${raceState.studentProgress}%` }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 text-3xl filter drop-shadow-lg"
                initial={{ left: '0%' }}
                animate={{ left: `${raceState.studentProgress}%` }}
                transition={{ duration: 0.3 }}
                style={{ marginLeft: '-20px' }}
              >
                🚀
              </motion.div>
              {/* Checkpoints */}
              <div className="absolute top-0 left-1/4 h-full w-px bg-blue-300" />
              <div className="absolute top-0 left-1/2 h-full w-px bg-blue-300" />
              <div className="absolute top-0 left-3/4 h-full w-px bg-blue-300" />
            </div>
          </div>

          {/* AI Lane */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2" style={{ backgroundColor: selectedOpponent.color }}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold">{selectedOpponent.name}</div>
                  <div className="text-xs text-gray-500">{selectedOpponent.difficulty} AI</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: selectedOpponent.color }}>
                  {raceState.aiProgress.toFixed(1)}%
                </div>
                {raceState.aiScore > 0 && (
                  <div className="text-sm text-gray-600">Score: {raceState.aiScore}</div>
                )}
              </div>
            </div>
            <div className="relative h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border-2 border-gray-300 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full"
                style={{ background: `linear-gradient(to right, ${selectedOpponent.color}, ${selectedOpponent.color}80)` }}
                initial={{ width: 0 }}
                animate={{ width: `${raceState.aiProgress}%` }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 text-3xl filter drop-shadow-lg"
                initial={{ left: '0%' }}
                animate={{ left: `${raceState.aiProgress}%` }}
                transition={{ duration: 0.3 }}
                style={{ marginLeft: '-20px' }}
              >
                {selectedOpponent.avatar}
              </motion.div>
              {/* Checkpoints */}
              <div className="absolute top-0 left-1/4 h-full w-px bg-gray-300" />
              <div className="absolute top-0 left-1/2 h-full w-px bg-gray-300" />
              <div className="absolute top-0 left-3/4 h-full w-px bg-gray-300" />
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        <AnimatePresence>
          {raceState.winner && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`p-8 rounded-xl text-center ${raceState.winner === 'student' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} text-white`}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4"
              >
                {raceState.winner === 'student' ? (
                  <Trophy className="w-16 h-16" />
                ) : (
                  <Bot className="w-16 h-16" />
                )}
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">
                {raceState.winner === 'student' ? '🎉 Victory!' : '💪 Keep Trying!'}
              </h2>
              <p className="text-lg mb-6">
                {raceState.winner === 'student' 
                  ? `You scored ${raceState.studentScore} points!`
                  : `AI scored ${raceState.aiScore} points. You can beat them next time!`
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  className="bg-white text-gray-900 hover:bg-gray-100"
                  onClick={resetRace}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Challenge
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                  onClick={() => setCurrentView('home')}
                >
                  Back to Arena
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Buttons - Simulate Student Progress */}
        {!raceState.winner && raceState.isRunning && (
          <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="font-bold mb-4 text-center">Work on Your Challenge</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => simulateStudentProgress(5)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Step (+5%)
              </Button>
              <Button
                onClick={() => simulateStudentProgress(15)}
                className="bg-green-600 hover:bg-green-700"
              >
                Big Progress (+15%)
              </Button>
              <Button
                onClick={() => simulateStudentProgress(100)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Complete ✓
              </Button>
            </div>
            <p className="text-xs text-center text-gray-600 mt-3">
              In real mode, progress would be tracked automatically as you work on the flowchart/code
            </p>
          </div>
        )}

        {!raceState.isRunning && !raceState.winner && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Race starting...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full  max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Competition Arena</h2>
              <p className="text-sm text-purple-100">Race • Compete • Win</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentView === 'home' && renderHome()}
          {currentView === 'select-challenge' && renderChallengeSelection()}
          {currentView === 'select-opponent' && renderOpponentSelection()}
          {currentView === 'race' && renderRace()}
        </div>
      </motion.div>

      {/* Live Race Mode Modal */}
      {showLiveRaceMode && selectedChallenge && selectedOpponent && (
        <LiveRaceMode
          onClose={() => setShowLiveRaceMode(false)}
          challengeType={selectedChallenge.type === 'block-coding' ? 'block-coding' : 'flowchart'}
          difficulty={selectedOpponent.difficulty}
        />
      )}
    </div>
  );
}