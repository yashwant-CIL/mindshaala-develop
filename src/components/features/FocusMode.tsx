import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X,
  Coffee,
  Brain,
  Target,
  Clock,
  CheckCircle,
  Volume2,
  VolumeX,
  Settings,
  TrendingUp
} from 'lucide-react';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FocusMode({ isOpen, onClose }: FocusModeProps) {
  const [mode, setMode] = useState<'focus' | 'break' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const timers = {
    focus: 25 * 60,
    break: 5 * 60,
    longBreak: 15 * 60
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (soundEnabled) {
      // Play completion sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiV+zPLTgjMGHm7A7+OZSA0PVqzn77BdGAg+mtny0H0pBSd6yvHajDkHGGS57+ilUBELTKXh8bllHAU2jdXzzn4qBSh5yu/giz0JHWW98OmpUxILSqPf8rpmHAU2jdXzzn4qBSh5yu/giz0JHWW98OmpUxILSqPf8rpmHAU2jdXzzn4qBSh5yu/giz0JHWW98OmpUxILSqPf8rpmHAU2jdXzzn4qBSh5yu/giz0JHWW98OmpUxILSqPf8rpmHAU2jdXzzn4qBSh5yu/giz0JHWW98OmpUxIL');
      audio.play().catch(() => {});
    }

    if (mode === 'focus') {
      setSessions(prev => prev + 1);
      if ((sessions + 1) % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(timers.longBreak);
      } else {
        setMode('break');
        setTimeLeft(timers.break);
      }
    } else {
      setMode('focus');
      setTimeLeft(timers.focus);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timers[mode]);
  };

  const switchMode = (newMode: 'focus' | 'break' | 'longBreak') => {
    setMode(newMode);
    setTimeLeft(timers[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((timers[mode] - timeLeft) / timers[mode]) * 100;

  const todayStats = {
    focusSessions: 3,
    totalFocusTime: 75, // minutes
    breaksTaken: 2,
    productivity: 85
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white relative overflow-hidden ${
          mode === 'focus' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
          mode === 'break' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
          'bg-gradient-to-r from-orange-500 to-pink-500'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {mode === 'focus' ? (
                  <Brain className="w-6 h-6" />
                ) : (
                  <Coffee className="w-6 h-6" />
                )}
                <h2 className="text-xl">
                  {mode === 'focus' ? 'Focus Time' :
                   mode === 'break' ? 'Short Break' :
                   'Long Break'}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => switchMode('focus')}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  mode === 'focus' ? 'bg-white/30 backdrop-blur-sm' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Focus
              </button>
              <button
                onClick={() => switchMode('break')}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  mode === 'break' ? 'bg-white/30 backdrop-blur-sm' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Break
              </button>
              <button
                onClick={() => switchMode('longBreak')}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  mode === 'longBreak' ? 'bg-white/30 backdrop-blur-sm' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Long Break
              </button>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="p-8">
          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Circular Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke={mode === 'focus' ? '#3B82F6' : mode === 'break' ? '#10B981' : '#F97316'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl text-gray-900 tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm text-gray-500 mt-2">
                Session {sessions + 1}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={resetTimer}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={toggleTimer}
              className={`p-6 rounded-full shadow-lg transition-all hover:scale-105 ${
                mode === 'focus' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                mode === 'break' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                'bg-gradient-to-r from-orange-500 to-pink-500'
              }`}
            >
              {isRunning ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-gray-700" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Today's Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Today's Progress
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Focus Sessions</p>
                <p className="text-lg text-blue-600">{todayStats.focusSessions}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Time</p>
                <p className="text-lg text-purple-600">{todayStats.totalFocusTime}m</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Breaks Taken</p>
                <p className="text-lg text-green-600">{todayStats.breaksTaken}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Productivity</p>
                <p className="text-lg text-orange-600">{todayStats.productivity}%</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              {mode === 'focus' ? (
                <>💡 <strong>Tip:</strong> Turn off notifications and focus on one task at a time.</>
              ) : (
                <>🌟 <strong>Break Time:</strong> Stand up, stretch, or take a short walk. Stay hydrated!</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating Focus Button
interface FocusButtonProps {
  onClick: () => void;
}

export function FocusButton({ onClick }: FocusButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-30"
      title="Focus Mode"
    >
      <Brain className="w-5 h-5" />
    </button>
  );
}
