import { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Zap, Trophy, Timer, Target, Sparkles, CheckCircle, AlertCircle, Braces } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface JavaScriptPracticeArenaProps {
  onClose: () => void;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedOutput: string;
  hints: string[];
  aiCode: string;
  topic: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Hello JavaScript',
    description: 'Print "Hello, JavaScript!" to console',
    difficulty: 'Easy',
    expectedOutput: 'Hello, JavaScript!',
    topic: 'Console Output',
    hints: ['Use console.log()', 'Put text in quotes', 'End with semicolon'],
    aiCode: 'console.log("Hello, JavaScript!");',
  },
  {
    id: 2,
    title: 'Variable Declaration',
    description: 'Declare variables: name="Priya", age=16, and log them',
    difficulty: 'Easy',
    expectedOutput: 'Name: Priya\nAge: 16',
    topic: 'Variables',
    hints: ['Use let or const', 'Use template literals', 'Log each variable'],
    aiCode: 'let name = "Priya";\nlet age = 16;\nconsole.log("Name: " + name);\nconsole.log("Age: " + age);',
  },
  {
    id: 3,
    title: 'Addition Function',
    description: 'Create function add(a, b) that returns sum and call it with 15, 25',
    difficulty: 'Medium',
    expectedOutput: '40',
    topic: 'Functions',
    hints: ['Use function keyword', 'Return a + b', 'Call function and log result'],
    aiCode: 'function add(a, b) {\n    return a + b;\n}\nlet result = add(15, 25);\nconsole.log(result);',
  },
  {
    id: 4,
    title: 'Array Sum',
    description: 'Find sum of array [10, 20, 30, 40] using loop',
    difficulty: 'Medium',
    expectedOutput: '100',
    topic: 'Arrays & Loops',
    hints: ['Declare array', 'Use for loop', 'Add each element to sum'],
    aiCode: 'let numbers = [10, 20, 30, 40];\nlet sum = 0;\nfor (let i = 0; i < numbers.length; i++) {\n    sum += numbers[i];\n}\nconsole.log(sum);',
  },
  {
    id: 5,
    title: 'Even Numbers Filter',
    description: 'Filter even numbers from [1,2,3,4,5,6,7,8,9,10]',
    difficulty: 'Hard',
    expectedOutput: '2,4,6,8,10',
    topic: 'Array Methods',
    hints: ['Use filter() method', 'Check num % 2 === 0', 'Join with comma'],
    aiCode: 'let numbers = [1,2,3,4,5,6,7,8,9,10];\nlet evens = numbers.filter(num => num % 2 === 0);\nconsole.log(evens.join(","));',
  },
  {
    id: 6,
    title: 'String Reversal',
    description: 'Reverse the string "JavaScript" and log it',
    difficulty: 'Hard',
    expectedOutput: 'tpircSavaJ',
    topic: 'String Methods',
    hints: ['Convert to array with split()', 'Use reverse() method', 'Join back with join()'],
    aiCode: 'let str = "JavaScript";\nlet reversed = str.split("").reverse().join("");\nconsole.log(reversed);',
  },
  {
    id: 7,
    title: 'Object Properties',
    description: 'Create student object with name, age, grade and log "Name: value, Age: value"',
    difficulty: 'Hard',
    expectedOutput: 'Name: Rahul, Age: 17',
    topic: 'Objects',
    hints: ['Create object with properties', 'Access using dot notation', 'Concatenate in log'],
    aiCode: 'let student = {\n    name: "Rahul",\n    age: 17,\n    grade: "A"\n};\nconsole.log("Name: " + student.name + ", Age: " + student.age);',
  },
];

export function JavaScriptPracticeArena({ onClose }: JavaScriptPracticeArenaProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [studentCode, setStudentCode] = useState('');
  const [output, setOutput] = useState('');
  const [aiTypedCode, setAiTypedCode] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiTypingIndex, setAiTypingIndex] = useState(0);
  const [studentScore, setStudentScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiSpeed, setAiSpeed] = useState(50);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const studentInputRef = useRef<HTMLTextAreaElement>(null);

  const challenge = challenges[currentChallenge];

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (isAiTyping && aiTypingIndex < challenge.aiCode.length) {
      aiTypingTimeoutRef.current = setTimeout(() => {
        setAiTypedCode(challenge.aiCode.substring(0, aiTypingIndex + 1));
        setAiTypingIndex(aiTypingIndex + 1);
      }, aiSpeed);
    } else if (aiTypingIndex >= challenge.aiCode.length) {
      setIsAiTyping(false);
    }
    return () => {
      if (aiTypingTimeoutRef.current) clearTimeout(aiTypingTimeoutRef.current);
    };
  }, [isAiTyping, aiTypingIndex, challenge.aiCode, aiSpeed]);

  const startAiTyping = () => {
    setAiTypedCode('');
    setAiTypingIndex(0);
    setIsAiTyping(true);
    setIsRunning(true);
  };

  const runStudentCode = () => {
    try {
      const logs: string[] = [];
      const originalLog = console.log;
      
      console.log = (...args: any[]) => {
        logs.push(args.join(' '));
      };
      
      eval(studentCode);
      
      console.log = originalLog;
      
      const result = logs.join('\n');
      setOutput(result);
      
      if (result === challenge.expectedOutput) {
        setShowSuccess(true);
        if (!completedChallenges.includes(challenge.id)) {
          setCompletedChallenges([...completedChallenges, challenge.id]);
          setStudentScore(studentScore + 130);
        }
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setStudentCode('');
      setAiTypedCode('');
      setOutput('');
      setTimeElapsed(0);
      setIsRunning(false);
      setShowHint(false);
      setAiTypingIndex(0);
      setIsAiTyping(false);
    }
  };

  const reset = () => {
    setStudentCode('');
    setAiTypedCode('');
    setOutput('');
    setAiTypingIndex(0);
    setIsAiTyping(false);
    studentInputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-yellow-900 via-amber-900 to-yellow-900 z-50 flex items-center justify-center p-4">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">Perfect JS Code! ⚡</div>
                <div className="text-sm">+130 points</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col overflow-hidden border-2 border-yellow-500">
        <div className="bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-600 text-white p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Braces className="w-6 h-6 text-yellow-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  ⚡ JavaScript AI Race - Class 10-12
                  <Badge className="bg-green-500 text-white text-xs">Challenge {currentChallenge + 1}/{challenges.length}</Badge>
                </h2>
                <p className="text-sm text-white/90">Master modern web programming at AI speed! 🚀</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-lg">{studentScore}</span>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <Timer className="w-5 h-5 text-cyan-300" />
                <span className="font-mono font-bold">{formatTime(timeElapsed)}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 border-b-2 border-yellow-500 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-bold text-lg">{challenge.title}</h3>
                <Badge className={
                  challenge.difficulty === 'Easy' ? 'bg-green-500' :
                  challenge.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }>
                  {challenge.difficulty}
                </Badge>
                <Badge className="bg-yellow-500">{challenge.topic}</Badge>
              </div>
              <p className="text-gray-300 text-sm mb-2">{challenge.description}</p>
              <div className="text-xs text-gray-400">
                <span className="font-semibold">Expected Output:</span>
                <code className="ml-2 bg-slate-900 px-2 py-1 rounded text-green-400">
                  {challenge.expectedOutput.split('\n').join(' → ')}
                </code>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
                className="border-yellow-400 text-yellow-300 hover:bg-yellow-500/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showHint ? 'Hide' : 'Show'} Hints
              </Button>
              
              {showHint && (
                <div className="bg-yellow-900/50 p-3 rounded-lg border border-yellow-400 max-w-xs">
                  <div className="text-xs text-yellow-200 space-y-1">
                    {challenge.hints.map((hint, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-cyan-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">🤖 AI JS Developer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-100">Speed:</span>
                <select
                  value={aiSpeed}
                  onChange={(e) => setAiSpeed(Number(e.target.value))}
                  className="bg-cyan-700 text-white text-xs rounded px-2 py-1"
                >
                  <option value="10">Fast</option>
                  <option value="50">Normal</option>
                  <option value="100">Slow</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-slate-950">
              <div className="text-cyan-400">
                <div className="text-cyan-600 mb-2">// AI is coding JavaScript...</div>
                <pre className="whitespace-pre-wrap">
                  {aiTypedCode}
                  {isAiTyping && <span className="animate-pulse bg-cyan-400 text-cyan-400">_</span>}
                </pre>
              </div>
            </div>
            
            <div className="bg-slate-800 p-3 border-t border-cyan-500 shrink-0">
              <Button
                onClick={startAiTyping}
                disabled={isAiTyping}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                {isAiTyping ? 'AI Typing...' : 'Watch AI Code JS'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-yellow-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">⚡ Your JS Code</span>
              </div>
              <div className="text-xs text-yellow-100">
                {studentCode.length} chars
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-slate-950">
              <textarea
                ref={studentInputRef}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-yellow-300 font-mono text-sm resize-none outline-none"
                placeholder="// Type your JavaScript code here...
// Try to match or beat the AI!

"
                spellCheck={false}
              />
            </div>
            
            <div className="bg-slate-800 p-3 border-t border-yellow-500 flex gap-2 shrink-0">
              <Button
                onClick={reset}
                variant="outline"
                className="flex-1 border-yellow-400 text-yellow-300 hover:bg-yellow-500/20"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={runStudentCode}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Run JS
              </Button>
            </div>
          </div>

          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-green-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 flex items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">✅ Console Output</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-slate-950">
              {output ? (
                <div>
                  <div className="text-green-600 mb-2">// Program Output:</div>
                  <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    {output === challenge.expectedOutput ? (
                      <div className="flex items-start gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">✓ Perfect JavaScript!</div>
                          <div className="text-xs text-green-500">Output matches perfectly ⚡</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-yellow-400">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">⚠ Not quite right</div>
                          <div className="text-xs text-yellow-500">Expected: {challenge.expectedOutput}</div>
                          <div className="text-xs text-yellow-500">Got: {output}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center mt-20">
                  <div className="text-4xl mb-2">⚡</div>
                  <div className="text-sm">Run your JavaScript code</div>
                  <div className="text-xs mt-2">Click "Run JS" button →</div>
                </div>
              )}
            </div>
            
            <div className="bg-slate-800 p-3 border-t border-green-500 shrink-0">
              <div className="text-xs text-gray-400 mb-2">Challenge Progress:</div>
              <div className="flex gap-1 mb-2">
                {challenges.map((c, idx) => (
                  <div
                    key={c.id}
                    className={`flex-1 h-2 rounded ${
                      completedChallenges.includes(c.id)
                        ? 'bg-green-500'
                        : idx === currentChallenge
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <Button
                onClick={nextChallenge}
                disabled={currentChallenge >= challenges.length - 1}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                size="sm"
              >
                {currentChallenge >= challenges.length - 1 ? 'All Done! 🎉' : 'Next Challenge →'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-3 border-t-2 border-yellow-500 shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Completed: {completedChallenges.length}/{challenges.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400" />
                <span>Accuracy: {completedChallenges.length > 0 ? Math.round((completedChallenges.length / (currentChallenge + 1)) * 100) : 0}%</span>
              </div>
            </div>
            <div className="text-gray-500 text-xs">
              ⚡ Tip: Master JavaScript by racing against AI - Essential for modern web development!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
