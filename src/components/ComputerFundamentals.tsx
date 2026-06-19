import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Trophy, Target, Clock, Zap, Star, Award, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ComputerFundamentalsProps {
  onBack: () => void;
}

interface HardwarePart {
  id: string;
  name: string;
  x: number;
  y: number;
  category: 'input' | 'output' | 'processing' | 'storage' | 'memory';
}

const computerParts: HardwarePart[] = [
  { id: 'keyboard', name: 'Keyboard', x: 45, y: 75, category: 'input' },
  { id: 'mouse', name: 'Mouse', x: 65, y: 70, category: 'input' },
  { id: 'monitor', name: 'Monitor', x: 50, y: 15, category: 'output' },
  { id: 'cpu', name: 'CPU', x: 25, y: 45, category: 'processing' },
  { id: 'speaker', name: 'Speaker', x: 15, y: 25, category: 'output' },
  { id: 'printer', name: 'Printer', x: 80, y: 40, category: 'output' },
  { id: 'scanner', name: 'Scanner', x: 85, y: 60, category: 'input' },
  { id: 'usb', name: 'USB Drive', x: 35, y: 65, category: 'storage' },
];

type GameMode = 'practice' | 'timed' | 'assembly';

export function ComputerFundamentals({ onBack }: ComputerFundamentalsProps) {
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'quiz'>('learn');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [answeredParts, setAnsweredParts] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null, message: string }>({ type: null, message: '' });
  const [showHint, setShowHint] = useState(false);

  // Timer for timed mode
  useEffect(() => {
    if (gameMode === 'timed' && isGameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isGameActive) {
      endGame();
    }
  }, [gameMode, isGameActive, timeLeft]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setIsGameActive(true);
    setScore(0);
    setAttempts(0);
    setCurrentPartIndex(0);
    setAnsweredParts(new Set());
    setTimeLeft(60);
    setFeedback({ type: null, message: '' });
    setShowHint(false);
  };

  const endGame = () => {
    setIsGameActive(false);
    // Save stats to localStorage
    const stats = {
      mode: gameMode,
      score,
      attempts,
      accuracy: attempts > 0 ? Math.round((score / attempts) * 100) : 0,
      date: new Date().toISOString(),
    };
    const existingStats = JSON.parse(localStorage.getItem('computerFundamentalsStats') || '[]');
    localStorage.setItem('computerFundamentalsStats', JSON.stringify([...existingStats, stats]));
  };

  const handlePartClick = (part: HardwarePart) => {
    if (!isGameActive || answeredParts.has(part.id)) return;

    setAttempts(attempts + 1);
    
    const currentPart = computerParts[currentPartIndex];
    
    if (part.id === currentPart.id) {
      // Correct answer
      setScore(score + 1);
      setAnsweredParts(new Set([...answeredParts, part.id]));
      setFeedback({ type: 'correct', message: `Correct! ${part.name} is an ${part.category} device.` });
      
      // Move to next part after delay
      setTimeout(() => {
        if (currentPartIndex < computerParts.length - 1) {
          setCurrentPartIndex(currentPartIndex + 1);
          setFeedback({ type: null, message: '' });
          setShowHint(false);
        } else {
          endGame();
        }
      }, 1500);
    } else {
      // Wrong answer
      setFeedback({ type: 'wrong', message: `Wrong! That's ${part.name}, not ${currentPart.name}.` });
      setTimeout(() => {
        setFeedback({ type: null, message: '' });
      }, 2000);
    }
  };

  const resetGame = () => {
    setGameMode(null);
    setIsGameActive(false);
    setScore(0);
    setAttempts(0);
    setCurrentPartIndex(0);
    setAnsweredParts(new Set());
    setTimeLeft(60);
    setFeedback({ type: null, message: '' });
    setShowHint(false);
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl text-gray-900">Computer Fundamentals</h1>
                <p className="text-sm text-gray-500">Learn hardware components and computer basics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Trophy className="w-3 h-3 mr-1" />
                Module 1/8
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-4 border-t border-gray-100">
          {(['learn', 'practice', 'quiz'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'learn' ? '📚 Learn' : tab === 'practice' ? '🎮 Practice' : '📝 Quiz'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6  mx-auto">
        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg mb-4">Parts of Computer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Devices */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm mb-2 text-blue-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs">⌨️</div>
                    Input Devices
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">Devices used to give data/instructions to computer</p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Keyboard - Type text and commands</li>
                    <li>• Mouse - Point, click, and select</li>
                    <li>• Scanner - Convert documents to digital</li>
                    <li>• Microphone - Record audio input</li>
                    <li>• Webcam - Capture video input</li>
                  </ul>
                </div>

                {/* Output Devices */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm mb-2 text-green-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center text-xs">🖥️</div>
                    Output Devices
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">Devices that display/produce results</p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Monitor - Display visual output</li>
                    <li>• Printer - Print documents on paper</li>
                    <li>• Speaker - Produce sound output</li>
                    <li>• Headphones - Personal audio output</li>
                    <li>• Projector - Display on large screen</li>
                  </ul>
                </div>

                {/* Processing Unit */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-sm mb-2 text-purple-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center text-xs">⚙️</div>
                    Processing Unit
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">The brain of the computer</p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• CPU (Central Processing Unit)</li>
                    <li>• ALU - Arithmetic Logic Unit</li>
                    <li>• CU - Control Unit</li>
                    <li>• Registers - Fast memory storage</li>
                    <li>• Motherboard - Main circuit board</li>
                  </ul>
                </div>

                {/* Storage Devices */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="text-sm mb-2 text-orange-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded flex items-center justify-center text-xs">💾</div>
                    Storage Devices
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">Store data permanently or temporarily</p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Hard Disk (HDD) - Magnetic storage</li>
                    <li>• SSD - Solid State Drive (faster)</li>
                    <li>• USB/Pen Drive - Portable storage</li>
                    <li>• CD/DVD - Optical storage</li>
                    <li>• Memory Card - Flash storage</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* How Computer Works */}
            <Card className="p-6">
              <h2 className="text-lg mb-4">How Computer Works</h2>
              <div className="flex items-center justify-center gap-4 py-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">⌨️</span>
                  </div>
                  <p className="text-sm">INPUT</p>
                  <p className="text-xs text-gray-500">Data Entry</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <p className="text-sm">PROCESS</p>
                  <p className="text-xs text-gray-500">CPU Works</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">🖥️</span>
                  </div>
                  <p className="text-sm">OUTPUT</p>
                  <p className="text-xs text-gray-500">Result Display</p>
                </div>
              </div>
            </Card>

            {/* Computer Generations */}
            <Card className="p-6">
              <h2 className="text-lg mb-4">Computer Generations</h2>
              <div className="space-y-3">
                {[
                  { gen: '1st Gen (1940-56)', tech: 'Vacuum Tubes', example: 'ENIAC, UNIVAC', size: 'Room-sized' },
                  { gen: '2nd Gen (1956-63)', tech: 'Transistors', example: 'IBM 1401', size: 'Cabinet-sized' },
                  { gen: '3rd Gen (1964-71)', tech: 'Integrated Circuits (IC)', example: 'IBM 360', size: 'Desk-sized' },
                  { gen: '4th Gen (1971-Present)', tech: 'Microprocessors', example: 'PC, Laptop', size: 'Portable' },
                  { gen: '5th Gen (Present-Future)', tech: 'AI & Quantum', example: 'AI systems, Quantum computers', size: 'Advanced' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.gen}</p>
                      <p className="text-xs text-gray-600">Technology: {item.tech}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Example: {item.example}</p>
                      <p className="text-xs text-gray-500">{item.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {!gameMode ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Practice Mode */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startGame('practice')}>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg mb-2">Practice Mode</h3>
                  <p className="text-sm text-gray-600 mb-4">Identify computer parts at your own pace. No time pressure!</p>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                </Card>

                {/* Timed Challenge */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startGame('timed')}>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg mb-2">Timed Challenge</h3>
                  <p className="text-sm text-gray-600 mb-4">60 seconds to identify as many parts as possible!</p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Challenge
                  </Button>
                </Card>

                {/* Assembly Game */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startGame('assembly')}>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg mb-2">Assembly Game</h3>
                  <p className="text-sm text-gray-600 mb-4">Assemble computer parts in correct order!</p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Award className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Game Stats */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-xl">{score}/{computerParts.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Accuracy</p>
                        <p className="text-xl">{accuracy}%</p>
                      </div>
                      {gameMode === 'timed' && (
                        <div>
                          <p className="text-xs text-gray-500">Time Left</p>
                          <p className={`text-xl ${timeLeft < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                            {timeLeft}s
                          </p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={resetGame}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <Progress value={(score / computerParts.length) * 100} className="mt-3" />
                </Card>

                {/* Current Question */}
                {isGameActive && (
                  <Card className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg mb-2">Find: {computerParts[currentPartIndex]?.name}</h3>
                      <p className="text-sm text-gray-600">Click on the correct part in the diagram below</p>
                      {showHint && (
                        <p className="text-sm text-blue-600 mt-2">
                          💡 Hint: It's an {computerParts[currentPartIndex]?.category} device
                        </p>
                      )}
                      {!showHint && (
                        <Button variant="link" size="sm" onClick={() => setShowHint(true)} className="mt-2">
                          Show Hint
                        </Button>
                      )}
                    </div>

                    {/* Feedback */}
                    {feedback.type && (
                      <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                        feedback.type === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {feedback.type === 'correct' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm">{feedback.message}</span>
                      </div>
                    )}

                    {/* Computer Diagram (Interactive) */}
                    <div className="relative bg-gray-100 rounded-lg p-8" style={{ minHeight: '400px' }}>
                      {/* Simple computer setup illustration */}
                      <svg viewBox="0 0 800 600" className="w-full h-full">
                        {/* Monitor */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'monitor')!)} className="cursor-pointer hover:opacity-80">
                          <rect x="300" y="50" width="200" height="150" fill="#1e293b" stroke="#475569" strokeWidth="4" rx="8" />
                          <rect x="310" y="60" width="180" height="120" fill="#3b82f6" opacity="0.3" />
                          <circle cx="400" cy="190" r="5" fill="#94a3b8" />
                          {answeredParts.has('monitor') && <text x="400" y="125" textAnchor="middle" fill="#22c55e" fontSize="24">✓</text>}
                        </g>

                        {/* CPU */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'cpu')!)} className="cursor-pointer hover:opacity-80">
                          <rect x="100" y="250" width="100" height="150" fill="#1e293b" stroke="#475569" strokeWidth="3" rx="4" />
                          <circle cx="130" cy="280" r="8" fill="#ef4444" opacity="0.7" />
                          <rect x="110" y="300" width="80" height="3" fill="#64748b" />
                          <rect x="110" y="310" width="80" height="3" fill="#64748b" />
                          <rect x="110" y="320" width="80" height="3" fill="#64748b" />
                          {answeredParts.has('cpu') && <text x="150" y="330" textAnchor="middle" fill="#22c55e" fontSize="24">✓</text>}
                        </g>

                        {/* Keyboard */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'keyboard')!)} className="cursor-pointer hover:opacity-80">
                          <rect x="280" y="450" width="240" height="60" fill="#334155" stroke="#475569" strokeWidth="3" rx="6" />
                          {[...Array(12)].map((_, i) => (
                            <rect key={i} x={290 + i * 18} y="460" width="15" height="15" fill="#64748b" rx="2" />
                          ))}
                          {answeredParts.has('keyboard') && <text x="400" y="490" textAnchor="middle" fill="#22c55e" fontSize="24">✓</text>}
                        </g>

                        {/* Mouse */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'mouse')!)} className="cursor-pointer hover:opacity-80">
                          <ellipse cx="550" cy="480" rx="30" ry="40" fill="#334155" stroke="#475569" strokeWidth="2" />
                          <path d="M 550 460 L 550 490" stroke="#475569" strokeWidth="2" />
                          {answeredParts.has('mouse') && <text x="550" y="485" textAnchor="middle" fill="#22c55e" fontSize="20">✓</text>}
                        </g>

                        {/* Speaker */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'speaker')!)} className="cursor-pointer hover:opacity-80">
                          <path d="M 80 130 L 120 150 L 120 200 L 80 220 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                          <circle cx="95" cy="175" r="15" fill="#64748b" opacity="0.5" />
                          {answeredParts.has('speaker') && <text x="100" y="180" textAnchor="middle" fill="#22c55e" fontSize="20">✓</text>}
                        </g>

                        {/* Printer */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'printer')!)} className="cursor-pointer hover:opacity-80">
                          <rect x="600" y="220" width="120" height="80" fill="#334155" stroke="#475569" strokeWidth="3" rx="4" />
                          <rect x="610" y="240" width="100" height="3" fill="#64748b" />
                          <rect x="650" y="270" width="40" height="20" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" />
                          {answeredParts.has('printer') && <text x="660" y="265" textAnchor="middle" fill="#22c55e" fontSize="20">✓</text>}
                        </g>

                        {/* Scanner */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'scanner')!)} className="cursor-pointer hover:opacity-80">
                          <rect x="600" y="350" width="140" height="100" fill="#1e293b" stroke="#475569" strokeWidth="3" rx="4" />
                          <rect x="610" y="370" width="120" height="60" fill="#3b82f6" opacity="0.2" />
                          {answeredParts.has('scanner') && <text x="670" y="405" textAnchor="middle" fill="#22c55e" fontSize="24">✓</text>}
                        </g>

                        {/* USB Drive */}
                        <g onClick={() => handlePartClick(computerParts.find(p => p.id === 'usb')!)} className="cursor-pointer hover:opacity-80">
                          <rect x="240" y="380" width="50" height="20" fill="#6366f1" stroke="#475569" strokeWidth="2" rx="3" />
                          <rect x="230" y="385" width="10" height="10" fill="#94a3b8" />
                          {answeredParts.has('usb') && <text x="265" y="395" textAnchor="middle" fill="#22c55e" fontSize="16">✓</text>}
                        </g>
                      </svg>
                    </div>
                  </Card>
                )}

                {/* Game Over */}
                {!isGameActive && gameMode && (
                  <Card className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl mb-2">Game Complete!</h3>
                    <p className="text-gray-600 mb-4">
                      You scored {score} out of {computerParts.length} with {accuracy}% accuracy
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => startGame(gameMode)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Play Again
                      </Button>
                      <Button variant="outline" onClick={resetGame}>
                        Choose Different Mode
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <Card className="p-6">
            <h2 className="text-lg mb-4">Knowledge Check</h2>
            <p className="text-sm text-gray-600">Quiz feature coming soon! Test your knowledge of computer fundamentals.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
