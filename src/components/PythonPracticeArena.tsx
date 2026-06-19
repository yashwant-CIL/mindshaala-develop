import { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Zap, Trophy, Timer, Target, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface PythonPracticeArenaProps {
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
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Hello World',
    description: 'Print "Hello, Python!" to the console',
    difficulty: 'Easy',
    expectedOutput: 'Hello, Python!',
    hints: ['Use the print() function', 'Put text in quotes'],
    aiCode: 'print("Hello, Python!")',
  },
  {
    id: 2,
    title: 'Sum of Two Numbers',
    description: 'Calculate and print the sum of 15 and 27',
    difficulty: 'Easy',
    expectedOutput: '42',
    hints: ['Use the + operator', 'Store in a variable first'],
    aiCode: 'a = 15\nb = 27\nsum = a + b\nprint(sum)',
  },
  {
    id: 3,
    title: 'Even or Odd',
    description: 'Check if number 24 is even or odd and print the result',
    difficulty: 'Medium',
    expectedOutput: '24 is even',
    hints: ['Use modulo operator %', 'Use if-else condition'],
    aiCode: 'num = 24\nif num % 2 == 0:\n    print(f"{num} is even")\nelse:\n    print(f"{num} is odd")',
  },
  {
    id: 4,
    title: 'Print 1 to 5',
    description: 'Use a loop to print numbers from 1 to 5',
    difficulty: 'Medium',
    expectedOutput: '1\n2\n3\n4\n5',
    hints: ['Use for loop', 'Use range() function'],
    aiCode: 'for i in range(1, 6):\n    print(i)',
  },
  {
    id: 5,
    title: 'Factorial of 5',
    description: 'Calculate and print the factorial of 5 (5! = 120)',
    difficulty: 'Hard',
    expectedOutput: '120',
    hints: ['Use a loop to multiply', 'Start with result = 1'],
    aiCode: 'num = 5\nfactorial = 1\nfor i in range(1, num + 1):\n    factorial = factorial * i\nprint(factorial)',
  },
  {
    id: 6,
    title: 'List Sum',
    description: 'Find sum of numbers in list [10, 20, 30, 40]',
    difficulty: 'Hard',
    expectedOutput: '100',
    hints: ['Use a for loop', 'Add each element to total'],
    aiCode: 'numbers = [10, 20, 30, 40]\ntotal = 0\nfor num in numbers:\n    total = total + num\nprint(total)',
  },
];

export function PythonPracticeArena({ onClose }: PythonPracticeArenaProps) {
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
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiSpeed, setAiSpeed] = useState(50); // milliseconds per character
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const studentInputRef = useRef<HTMLTextAreaElement>(null);

  const challenge = challenges[currentChallenge];

  // Timer
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

  // AI Typing Animation
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

  // Start AI typing
  const startAiTyping = () => {
    setAiTypedCode('');
    setAiTypingIndex(0);
    setIsAiTyping(true);
    setIsRunning(true);
  };

  // Run student code
  const runStudentCode = () => {
    try {
      let result = '';
      
      // Simple Python interpreter simulation
      const lines = studentCode.split('\n');
      const variables: any = {};
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Handle print statements
        if (trimmed.startsWith('print(')) {
          const match = trimmed.match(/print\((.*)\)/);
          if (match) {
            let content = match[1];
            
            // Handle f-strings
            if (content.startsWith('f"') || content.startsWith("f'")) {
              content = content.substring(2, content.length - 1);
              // Replace variables in f-string
              content = content.replace(/\{([^}]+)\}/g, (_, varName) => {
                return variables[varName.trim()] || '';
              });
              result += content + '\n';
            }
            // Handle string literals
            else if (content.startsWith('"') || content.startsWith("'")) {
              result += content.substring(1, content.length - 1) + '\n';
            }
            // Handle variables
            else {
              result += (variables[content] || content) + '\n';
            }
          }
        }
        // Handle variable assignments
        else if (trimmed.includes('=') && !trimmed.includes('==')) {
          const parts = trimmed.split('=');
          if (parts.length === 2) {
            const varName = parts[0].trim();
            let value = parts[1].trim();
            
            // Evaluate simple expressions
            try {
              // Replace variables in expression
              Object.keys(variables).forEach(key => {
                value = value.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
              });
              
              // Handle lists
              if (value.startsWith('[')) {
                variables[varName] = eval(value);
              }
              // Handle numbers and expressions
              else if (!isNaN(Number(value)) || /[\+\-\*\/]/.test(value)) {
                variables[varName] = eval(value);
              }
              // Handle strings
              else if (value.startsWith('"') || value.startsWith("'")) {
                variables[varName] = value.substring(1, value.length - 1);
              }
              // Handle booleans
              else if (value === 'True' || value === 'False') {
                variables[varName] = value === 'True';
              }
            } catch (e) {
              // If eval fails, store as string
              variables[varName] = value;
            }
          }
        }
        // Handle for loops (simplified)
        else if (trimmed.startsWith('for ')) {
          const match = trimmed.match(/for\s+(\w+)\s+in\s+range\((\d+)(?:,\s*(\d+))?\)/);
          if (match) {
            const loopVar = match[1];
            const start = match[3] ? parseInt(match[2]) : 1;
            const end = match[3] ? parseInt(match[3]) : parseInt(match[2]) + 1;
            
            // Find indented lines (loop body)
            let i = lines.indexOf(line) + 1;
            const loopBody: string[] = [];
            while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
              if (lines[i].trim()) {
                loopBody.push(lines[i].trim());
              }
              i++;
            }
            
            // Execute loop
            for (let j = start; j < end; j++) {
              variables[loopVar] = j;
              for (const bodyLine of loopBody) {
                if (bodyLine.startsWith('print(')) {
                  const printMatch = bodyLine.match(/print\((.*)\)/);
                  if (printMatch) {
                    let content = printMatch[1];
                    if (content === loopVar) {
                      result += j + '\n';
                    } else {
                      // Replace variables
                      Object.keys(variables).forEach(key => {
                        content = content.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
                      });
                      try {
                        result += eval(content) + '\n';
                      } catch {
                        result += content + '\n';
                      }
                    }
                  }
                } else if (bodyLine.includes('=')) {
                  const parts = bodyLine.split('=');
                  if (parts.length === 2) {
                    const varName = parts[0].trim();
                    let value = parts[1].trim();
                    Object.keys(variables).forEach(key => {
                      value = value.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
                    });
                    try {
                      variables[varName] = eval(value);
                    } catch {
                      variables[varName] = value;
                    }
                  }
                }
              }
            }
          }
          // Handle for in list
          else {
            const listMatch = trimmed.match(/for\s+(\w+)\s+in\s+(\w+)/);
            if (listMatch) {
              const loopVar = listMatch[1];
              const listVar = listMatch[2];
              const list = variables[listVar];
              
              if (Array.isArray(list)) {
                // Find loop body
                let i = lines.indexOf(line) + 1;
                const loopBody: string[] = [];
                while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
                  if (lines[i].trim()) {
                    loopBody.push(lines[i].trim());
                  }
                  i++;
                }
                
                // Execute loop
                for (const item of list) {
                  variables[loopVar] = item;
                  for (const bodyLine of loopBody) {
                    if (bodyLine.includes('=')) {
                      const parts = bodyLine.split('=');
                      if (parts.length === 2) {
                        const varName = parts[0].trim();
                        let value = parts[1].trim();
                        Object.keys(variables).forEach(key => {
                          value = value.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
                        });
                        try {
                          variables[varName] = eval(value);
                        } catch {
                          variables[varName] = value;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        // Handle if-else
        else if (trimmed.startsWith('if ')) {
          const match = trimmed.match(/if\s+(.+):/);
          if (match) {
            let condition = match[1];
            Object.keys(variables).forEach(key => {
              condition = condition.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
            });
            
            try {
              const conditionResult = eval(condition);
              
              // Find if and else bodies
              let i = lines.indexOf(line) + 1;
              const ifBody: string[] = [];
              const elseBody: string[] = [];
              let inElse = false;
              
              while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === 'else:')) {
                if (lines[i].trim() === 'else:') {
                  inElse = true;
                } else if (lines[i].trim()) {
                  if (inElse) {
                    elseBody.push(lines[i].trim());
                  } else {
                    ifBody.push(lines[i].trim());
                  }
                }
                i++;
              }
              
              const bodyToExecute = conditionResult ? ifBody : elseBody;
              for (const bodyLine of bodyToExecute) {
                if (bodyLine.startsWith('print(')) {
                  const printMatch = bodyLine.match(/print\((.*)\)/);
                  if (printMatch) {
                    let content = printMatch[1];
                    // Handle f-strings
                    if (content.startsWith('f"') || content.startsWith("f'")) {
                      content = content.substring(2, content.length - 1);
                      content = content.replace(/\{([^}]+)\}/g, (_, varName) => {
                        return variables[varName.trim()] || '';
                      });
                      result += content + '\n';
                    } else if (content.startsWith('"') || content.startsWith("'")) {
                      result += content.substring(1, content.length - 1) + '\n';
                    } else {
                      result += (variables[content] || content) + '\n';
                    }
                  }
                }
              }
            } catch (e) {
              // Condition evaluation failed
            }
          }
        }
      }
      
      setOutput(result.trim());
      
      // Check if correct
      if (result.trim() === challenge.expectedOutput) {
        setShowSuccess(true);
        if (!completedChallenges.includes(challenge.id)) {
          setCompletedChallenges([...completedChallenges, challenge.id]);
          setStudentScore(studentScore + 100);
        }
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  // Next challenge
  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setStudentCode('');
      setAiTypedCode('');
      setOutput('');
      setTimeElapsed(0);
      setIsRunning(false);
      setShowHint(false);
      setCurrentHintIndex(0);
      setAiTypingIndex(0);
      setIsAiTyping(false);
    }
  };

  // Reset
  const reset = () => {
    setStudentCode('');
    setAiTypedCode('');
    setOutput('');
    setAiTypingIndex(0);
    setIsAiTyping(false);
    studentInputRef.current?.focus();
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center p-4">
      {/* Success Animation */}
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
                <div className="text-2xl font-bold">Correct! 🎉</div>
                <div className="text-sm">+100 points</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col overflow-hidden border-2 border-purple-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Python Practice Arena - Race Against AI
                  <Badge className="bg-green-500 text-white text-xs">Challenge {currentChallenge + 1}/{challenges.length}</Badge>
                </h2>
                <p className="text-sm text-white/90">Watch AI code, then type your solution! ⚡</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-lg">{studentScore}</span>
                <span className="text-sm">pts</span>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <Timer className="w-5 h-5 text-cyan-300" />
                <span className="font-mono font-bold">{formatTime(timeElapsed)}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Challenge Info */}
        <div className="bg-slate-700 p-4 border-b-2 border-purple-500 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold text-lg">{challenge.title}</h3>
                <Badge className={
                  challenge.difficulty === 'Easy' ? 'bg-green-500' :
                  challenge.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }>
                  {challenge.difficulty}
                </Badge>
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
                className="border-purple-400 text-purple-300 hover:bg-purple-500/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showHint ? 'Hide' : 'Show'} Hints
              </Button>
              
              {showHint && (
                <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-400 max-w-xs">
                  <div className="text-xs text-purple-200 space-y-1">
                    {challenge.hints.map((hint, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Three CLI Windows */}
        <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
          {/* Window 1: AI Typing Demo */}
          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-cyan-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">🤖 AI Student Demo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-100">Speed:</span>
                <select
                  value={aiSpeed}
                  onChange={(e) => setAiSpeed(Number(e.target.value))}
                  className="bg-cyan-700 text-white text-xs rounded px-2 py-1 border-none"
                >
                  <option value="10">Fast</option>
                  <option value="50">Normal</option>
                  <option value="100">Slow</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-slate-950">
              <div className="text-cyan-400">
                <div className="text-cyan-600 mb-2"># AI is typing...</div>
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
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                {isAiTyping ? 'AI Typing...' : 'Watch AI Code'}
              </Button>
            </div>
          </div>

          {/* Window 2: Student Input */}
          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-purple-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">👨‍💻 Your Code</span>
              </div>
              <div className="text-xs text-purple-100">
                {studentCode.length} characters
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-slate-950">
              <textarea
                ref={studentInputRef}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-purple-300 font-mono text-sm resize-none outline-none"
                placeholder="# Type your Python code here...
# Try to match or beat the AI!

"
                spellCheck={false}
              />
            </div>
            
            <div className="bg-slate-800 p-3 border-t border-purple-500 flex gap-2 shrink-0">
              <Button
                onClick={reset}
                variant="outline"
                className="flex-1 border-purple-400 text-purple-300 hover:bg-purple-500/20"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={runStudentCode}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
            </div>
          </div>

          {/* Window 3: Output/Results */}
          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-green-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 flex items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">✅ Output & Status</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-slate-950">
              {output ? (
                <div>
                  <div className="text-green-600 mb-2"># Program Output:</div>
                  <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    {output === challenge.expectedOutput ? (
                      <div className="flex items-start gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">✓ Correct!</div>
                          <div className="text-xs text-green-500">Your output matches expected result</div>
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
                  <div className="text-sm">Run your code to see output</div>
                  <div className="text-xs mt-2">Click "Run Code" button →</div>
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
                        ? 'bg-purple-500 animate-pulse'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <Button
                onClick={nextChallenge}
                disabled={currentChallenge >= challenges.length - 1}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
                size="sm"
              >
                {currentChallenge >= challenges.length - 1 ? 'All Done! 🎉' : 'Next Challenge →'}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Footer */}
        <div className="bg-slate-800 p-3 border-t-2 border-purple-500 shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Completed: {completedChallenges.length}/{challenges.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Accuracy: {completedChallenges.length > 0 ? Math.round((completedChallenges.length / (currentChallenge + 1)) * 100) : 0}%</span>
              </div>
            </div>
            <div className="text-gray-500 text-xs">
              💡 Tip: Watch the AI, learn the pattern, then code your own solution!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
