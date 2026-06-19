import { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Clock, Trophy, Target, Zap, CheckCircle, XCircle, Lightbulb, Code, Terminal, Flame, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';

interface CLIPracticeArenaProps {
  onClose: () => void;
  language: {
    name: string;
    icon: string;
    gradient: string;
    bgGradient: string;
  };
  challenges: Challenge[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: string;
  solution: string;
  expectedOutput: string;
  hints: string[];
}

export function CLIPracticeArena({ onClose, language, challenges }: CLIPracticeArenaProps) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChallenge = challenges[currentChallengeIndex];

  // Initialize with starter code
  useEffect(() => {
    setUserCode(currentChallenge.starterCode);
    setOutput('');
    setStatus('idle');
    setShowHints(false);
  }, [currentChallengeIndex]);

  // Timer
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const runCode = () => {
    setStatus('running');
    setAttempts(prev => prev + 1);
    
    // Simulate code execution (in a real scenario, you'd use a backend)
    setTimeout(() => {
      // Simple check: if code contains key elements from solution
      const isCorrect = userCode.trim().length > 0 && 
                       userCode.toLowerCase().includes(currentChallenge.solution.toLowerCase().split('\n')[0].trim());
      
      if (isCorrect || userCode.trim() === currentChallenge.solution.trim()) {
        setStatus('success');
        setOutput(currentChallenge.expectedOutput);
        setScore(prev => prev + 1);
        if (!completedChallenges.has(currentChallenge.id)) {
          setCompletedChallenges(new Set([...completedChallenges, currentChallenge.id]));
        }
      } else {
        setStatus('error');
        setOutput('Error: Output does not match expected result. Check your code and try again!');
      }
    }, 800);
  };

  const resetCode = () => {
    setUserCode(currentChallenge.starterCode);
    setOutput('');
    setStatus('idle');
  };

  const nextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    }
  };

  const previousChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(prev => prev - 1);
    }
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const progress = (completedChallenges.size / challenges.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${language.gradient} text-white p-4 shadow-2xl shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <Terminal className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <span>{language.icon}</span>
                {language.name} CLI Practice Arena
              </h1>
              <p className="text-sm text-white/90 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Challenge {currentChallengeIndex + 1} of {challenges.length} • {currentChallenge.title}
              </p>
            </div>
            <Badge className={`${getDifficultyColor(currentChallenge.difficulty)} text-white px-3 py-1.5 text-sm shadow-lg`}>
              {currentChallenge.difficulty.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono font-bold">{formatTime(elapsedTime)}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5 mr-1" />
              Exit
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <div>
              <div className="text-xs text-white/80">Score</div>
              <div className="font-bold">{score} / {attempts}</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-300" />
            <div>
              <div className="text-xs text-white/80">Accuracy</div>
              <div className="font-bold">{accuracy}%</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-300" />
            <div>
              <div className="text-xs text-white/80">Completed</div>
              <div className="font-bold">{completedChallenges.size} / {challenges.length}</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-300" />
            <div>
              <div className="text-xs text-white/80">Progress</div>
              <div className="font-bold">{progress.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        
        {/* LEFT: Challenge Description */}
        <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Challenge Details
            </h3>
            <p className="text-sm text-gray-300 mb-4">{currentChallenge.description}</p>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHints(!showHints)}
              className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHints ? 'Hide' : 'Show'} Hints
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Hints */}
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
                >
                  <h4 className="text-sm font-bold text-yellow-400 mb-2">💡 Hints:</h4>
                  <ul className="space-y-2">
                    {currentChallenge.hints.map((hint, idx) => (
                      <li key={idx} className="text-xs text-gray-300">
                        {idx + 1}. {hint}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Challenge List */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-bold text-white mb-2">All Challenges:</h4>
              <div className="space-y-2">
                {challenges.map((challenge, idx) => (
                  <button
                    key={challenge.id}
                    onClick={() => setCurrentChallengeIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                      currentChallengeIndex === idx
                        ? 'bg-blue-600 text-white'
                        : completedChallenges.has(challenge.id)
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{idx + 1}. {challenge.title}</span>
                      {completedChallenges.has(challenge.id) && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={previousChallenge}
                disabled={currentChallengeIndex === 0}
                className="flex-1 border-gray-600 text-gray-300"
              >
                ← Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={nextChallenge}
                disabled={currentChallengeIndex === challenges.length - 1}
                className="flex-1 border-gray-600 text-gray-300"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>

        {/* CENTER: Code Editor */}
        <div className="flex-1 bg-slate-900 flex flex-col border-r border-gray-700">
          <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-white">Code Editor</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={resetCode}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={runCode}
                disabled={status === 'running'}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-1" />
                {status === 'running' ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <textarea
              ref={textareaRef}
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full h-full bg-slate-950 text-green-400 font-mono text-sm p-4 rounded-lg border-2 border-gray-700 focus:border-green-500 focus:outline-none resize-none"
              placeholder="Write your code here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* RIGHT: Terminal Output */}
        <div className="flex-1 bg-slate-950 flex flex-col">
          <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">Terminal Output</span>
            </div>
            {status !== 'idle' && (
              <Badge
                className={`${
                  status === 'success'
                    ? 'bg-green-600'
                    : status === 'error'
                    ? 'bg-red-600'
                    : 'bg-blue-600'
                } text-white`}
              >
                {status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                {status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                {status === 'running' && <Zap className="w-3 h-3 mr-1 animate-pulse" />}
                {status.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-slate-900 rounded-lg p-4 h-full font-mono text-sm">
              {output ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`${
                    status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {status === 'success' && '✓ '}
                  {status === 'error' && '✗ '}
                  {output}
                </motion.div>
              ) : (
                <div className="text-gray-500 italic">
                  Click "Run Code" to see output...
                </div>
              )}
            </div>
          </div>

          {/* Expected Output */}
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <h4 className="text-sm font-bold text-gray-400 mb-2">Expected Output:</h4>
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-sm text-green-400">
              {currentChallenge.expectedOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
