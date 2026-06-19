import { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Zap, Trophy, Timer, Target, Sparkles, CheckCircle, AlertCircle, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface JavaPracticeArenaProps {
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
    title: 'Hello World Program',
    description: 'Write a Java program to print "Hello, Java!"',
    difficulty: 'Easy',
    expectedOutput: 'Hello, Java!',
    topic: 'Basic Syntax',
    hints: ['Use System.out.println()', 'Every Java program needs a main method', 'Class name should match'],
    aiCode: 'class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
  },
  {
    id: 2,
    title: 'Variable Declaration',
    description: 'Declare variables: name="Rohan", age=15, and print them',
    difficulty: 'Easy',
    expectedOutput: 'Name: Rohan\nAge: 15',
    topic: 'Variables',
    hints: ['Use String for text', 'Use int for numbers', 'Use + for concatenation'],
    aiCode: 'class Variables {\n    public static void main(String[] args) {\n        String name = "Rohan";\n        int age = 15;\n        System.out.println("Name: " + name);\n        System.out.println("Age: " + age);\n    }\n}',
  },
  {
    id: 3,
    title: 'Sum Calculator',
    description: 'Calculate and print sum of two numbers: 25 and 35',
    difficulty: 'Easy',
    expectedOutput: 'Sum: 60',
    topic: 'Arithmetic',
    hints: ['Declare two int variables', 'Add them and store in sum', 'Print the result'],
    aiCode: 'class SumCalculator {\n    public static void main(String[] args) {\n        int a = 25;\n        int b = 35;\n        int sum = a + b;\n        System.out.println("Sum: " + sum);\n    }\n}',
  },
  {
    id: 4,
    title: 'Even or Odd Checker',
    description: 'Check if number 42 is even or odd',
    difficulty: 'Medium',
    expectedOutput: '42 is even',
    topic: 'Conditionals',
    hints: ['Use if-else statement', 'Use modulo operator %', 'Check if num % 2 == 0'],
    aiCode: 'class EvenOdd {\n    public static void main(String[] args) {\n        int num = 42;\n        if (num % 2 == 0) {\n            System.out.println(num + " is even");\n        } else {\n            System.out.println(num + " is odd");\n        }\n    }\n}',
  },
  {
    id: 5,
    title: 'For Loop - Print 1 to 5',
    description: 'Use a for loop to print numbers from 1 to 5',
    difficulty: 'Medium',
    expectedOutput: '1\n2\n3\n4\n5',
    topic: 'Loops',
    hints: ['Use for(int i=1; i<=5; i++)', 'Print i in each iteration', 'Loop runs 5 times'],
    aiCode: 'class ForLoop {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            System.out.println(i);\n        }\n    }\n}',
  },
  {
    id: 6,
    title: 'Array Sum',
    description: 'Find sum of array elements: {10, 20, 30, 40, 50}',
    difficulty: 'Hard',
    expectedOutput: 'Sum: 150',
    topic: 'Arrays',
    hints: ['Declare int array', 'Use for loop to iterate', 'Add each element to sum'],
    aiCode: 'class ArraySum {\n    public static void main(String[] args) {\n        int[] numbers = {10, 20, 30, 40, 50};\n        int sum = 0;\n        for (int i = 0; i < numbers.length; i++) {\n            sum = sum + numbers[i];\n        }\n        System.out.println("Sum: " + sum);\n    }\n}',
  },
  {
    id: 7,
    title: 'Maximum in Array',
    description: 'Find maximum element in array: {45, 12, 78, 23, 67}',
    difficulty: 'Hard',
    expectedOutput: 'Maximum: 78',
    topic: 'Arrays & Logic',
    hints: ['Initialize max with first element', 'Compare each element', 'Update max if element is greater'],
    aiCode: 'class MaxArray {\n    public static void main(String[] args) {\n        int[] arr = {45, 12, 78, 23, 67};\n        int max = arr[0];\n        for (int i = 1; i < arr.length; i++) {\n            if (arr[i] > max) {\n                max = arr[i];\n            }\n        }\n        System.out.println("Maximum: " + max);\n    }\n}',
  },
  {
    id: 8,
    title: 'Factorial Calculator',
    description: 'Calculate factorial of 5 (5! = 120)',
    difficulty: 'Hard',
    expectedOutput: 'Factorial: 120',
    topic: 'Loops & Math',
    hints: ['Start with factorial = 1', 'Multiply factorial by each number 1 to 5', 'Use for loop'],
    aiCode: 'class Factorial {\n    public static void main(String[] args) {\n        int num = 5;\n        int factorial = 1;\n        for (int i = 1; i <= num; i++) {\n            factorial = factorial * i;\n        }\n        System.out.println("Factorial: " + factorial);\n    }\n}',
  },
];

export function JavaPracticeArena({ onClose }: JavaPracticeArenaProps) {
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

  // Run student code - Simple Java simulator
  const runStudentCode = () => {
    try {
      let result = '';
      const lines = studentCode.split('\n').map(line => line.trim());
      
      // Extract main method content
      let inMain = false;
      const mainContent: string[] = [];
      
      for (const line of lines) {
        if (line.includes('public static void main')) {
          inMain = true;
          continue;
        }
        if (inMain && line === '}') {
          break;
        }
        if (inMain && line && line !== '{') {
          mainContent.push(line);
        }
      }
      
      // Execute main content
      const variables: any = {};
      const arrays: any = {};
      
      for (let i = 0; i < mainContent.length; i++) {
        const line = mainContent[i];
        
        // System.out.println
        if (line.includes('System.out.println')) {
          const match = line.match(/System\.out\.println\((.*)\);?/);
          if (match) {
            let content = match[1].trim();
            
            // Handle string concatenation
            if (content.includes('+')) {
              const parts = content.split('+').map(p => p.trim());
              let output = '';
              for (const part of parts) {
                if (part.startsWith('"') && part.endsWith('"')) {
                  output += part.substring(1, part.length - 1);
                } else if (variables[part] !== undefined) {
                  output += variables[part];
                } else {
                  output += part;
                }
              }
              result += output + '\n';
            }
            // Handle simple string
            else if (content.startsWith('"') && content.endsWith('"')) {
              result += content.substring(1, content.length - 1) + '\n';
            }
            // Handle variable
            else if (variables[content] !== undefined) {
              result += variables[content] + '\n';
            }
          }
        }
        
        // Variable declarations
        else if (line.includes('int ') || line.includes('String ') || line.includes('double ')) {
          const parts = line.replace(';', '').split('=').map(p => p.trim());
          if (parts.length === 2) {
            const declaration = parts[0].trim();
            let value = parts[1].trim();
            
            const varName = declaration.split(' ')[1].replace('[]', '');
            
            // Handle arrays
            if (declaration.includes('[]') && value.includes('{')) {
              const arrayMatch = value.match(/\{([^}]+)\}/);
              if (arrayMatch) {
                arrays[varName] = arrayMatch[1].split(',').map(v => parseInt(v.trim()));
                variables[varName + '.length'] = arrays[varName].length;
              }
            }
            // Handle string
            else if (value.startsWith('"') && value.endsWith('"')) {
              variables[varName] = value.substring(1, value.length - 1);
            }
            // Handle expressions with variables
            else {
              // Replace variables in expression
              Object.keys(variables).forEach(key => {
                if (!key.includes('.')) {
                  value = value.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
                }
              });
              try {
                variables[varName] = eval(value);
              } catch {
                variables[varName] = value;
              }
            }
          }
        }
        
        // For loops
        else if (line.startsWith('for')) {
          const forMatch = line.match(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\w+\s*([<>=!]+)\s*([^;]+)\s*;\s*(\w+\+\+|\w+--)/);
          if (forMatch) {
            const loopVar = forMatch[1];
            const start = parseInt(forMatch[2]);
            const operator = forMatch[3];
            let endExpr = forMatch[4].trim();
            
            // Replace array.length
            Object.keys(arrays).forEach(arrName => {
              endExpr = endExpr.replace(`${arrName}.length`, arrays[arrName].length.toString());
            });
            
            const end = eval(endExpr);
            
            // Find loop body
            let j = i + 1;
            const loopBody: string[] = [];
            let braceCount = 0;
            while (j < mainContent.length) {
              const bodyLine = mainContent[j].trim();
              if (bodyLine === '{') braceCount++;
              else if (bodyLine === '}') {
                if (braceCount === 0) break;
                braceCount--;
              } else if (bodyLine) {
                loopBody.push(bodyLine);
              }
              j++;
            }
            
            // Execute loop
            const condition = operator.includes('<') ? (a: number, b: number) => a < b : 
                            operator.includes('<=') ? (a: number, b: number) => a <= b :
                            operator.includes('>') ? (a: number, b: number) => a > b : 
                            (a: number, b: number) => a >= b;
            
            for (let idx = start; condition(idx, end); idx++) {
              variables[loopVar] = idx;
              
              for (const bodyLine of loopBody) {
                // Print in loop
                if (bodyLine.includes('System.out.println')) {
                  const printMatch = bodyLine.match(/System\.out\.println\((.*)\);?/);
                  if (printMatch) {
                    let content = printMatch[1].trim();
                    if (variables[content] !== undefined) {
                      result += variables[content] + '\n';
                    } else if (content.startsWith('"')) {
                      result += content.substring(1, content.length - 1) + '\n';
                    }
                  }
                }
                // Assignment in loop
                else if (bodyLine.includes('=') && !bodyLine.includes('==')) {
                  const assignParts = bodyLine.replace(';', '').split('=').map(p => p.trim());
                  if (assignParts.length === 2) {
                    let varName = assignParts[0].trim();
                    let value = assignParts[1].trim();
                    
                    // Handle array access
                    if (varName.includes('[')) {
                      // skip for now
                    } else {
                      // Replace variables
                      Object.keys(variables).forEach(key => {
                        if (!key.includes('.')) {
                          value = value.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
                        }
                      });
                      
                      // Replace array access
                      Object.keys(arrays).forEach(arrName => {
                        const arrAccessMatch = value.match(new RegExp(`${arrName}\\[(\\w+)\\]`));
                        if (arrAccessMatch) {
                          const indexVar = arrAccessMatch[1];
                          const index = variables[indexVar];
                          value = value.replace(arrAccessMatch[0], arrays[arrName][index]);
                        }
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
            
            i = j;
          }
        }
        
        // If-else statements
        else if (line.startsWith('if')) {
          const ifMatch = line.match(/if\s*\((.*)\)/);
          if (ifMatch) {
            let condition = ifMatch[1].trim();
            
            // Replace variables
            Object.keys(variables).forEach(key => {
              if (!key.includes('.')) {
                condition = condition.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
              }
            });
            
            try {
              const conditionResult = eval(condition);
              
              // Find if and else bodies
              let j = i + 1;
              const ifBody: string[] = [];
              const elseBody: string[] = [];
              let inElse = false;
              let braceCount = 0;
              
              while (j < mainContent.length) {
                const bodyLine = mainContent[j].trim();
                if (bodyLine === '{') braceCount++;
                else if (bodyLine === '}') {
                  if (braceCount === 0) break;
                  braceCount--;
                  if (braceCount === 0) {
                    // Check if next is else
                    if (j + 1 < mainContent.length && mainContent[j + 1].trim() === 'else {') {
                      inElse = true;
                      j++;
                      continue;
                    } else {
                      break;
                    }
                  }
                } else if (bodyLine === 'else {') {
                  inElse = true;
                } else if (bodyLine) {
                  if (inElse) {
                    elseBody.push(bodyLine);
                  } else {
                    ifBody.push(bodyLine);
                  }
                }
                j++;
              }
              
              const bodyToExecute = conditionResult ? ifBody : elseBody;
              for (const bodyLine of bodyToExecute) {
                if (bodyLine.includes('System.out.println')) {
                  const printMatch = bodyLine.match(/System\.out\.println\((.*)\);?/);
                  if (printMatch) {
                    let content = printMatch[1].trim();
                    
                    // Handle concatenation
                    if (content.includes('+')) {
                      const parts = content.split('+').map(p => p.trim());
                      let output = '';
                      for (const part of parts) {
                        if (part.startsWith('"') && part.endsWith('"')) {
                          output += part.substring(1, part.length - 1);
                        } else if (variables[part] !== undefined) {
                          output += variables[part];
                        } else {
                          output += part;
                        }
                      }
                      result += output + '\n';
                    } else if (content.startsWith('"')) {
                      result += content.substring(1, content.length - 1) + '\n';
                    }
                  }
                }
              }
              
              i = j;
            } catch (e) {
              // Condition failed
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
          setStudentScore(studentScore + 150);
        }
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
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
    <div className="fixed inset-0 bg-gradient-to-br from-orange-900 via-red-900 to-orange-900 z-50 flex items-center justify-center p-4">
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
                <div className="text-2xl font-bold">Perfect Java Code! ☕</div>
                <div className="text-sm">+150 points</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col overflow-hidden border-2 border-orange-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Coffee className="w-6 h-6 text-orange-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  ☕ Java AI Race Arena - CBSE Class 11-12
                  <Badge className="bg-green-500 text-white text-xs">Challenge {currentChallenge + 1}/{challenges.length}</Badge>
                </h2>
                <p className="text-sm text-white/90">Master Java at AI speed! Perfect for CBSE Board Exams 🎓</p>
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
        <div className="bg-slate-700 p-4 border-b-2 border-orange-500 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-bold text-lg">{challenge.title}</h3>
                <Badge className={
                  challenge.difficulty === 'Easy' ? 'bg-green-500' :
                  challenge.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }>
                  {challenge.difficulty}
                </Badge>
                <Badge className="bg-orange-500">{challenge.topic}</Badge>
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
                className="border-orange-400 text-orange-300 hover:bg-orange-500/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showHint ? 'Hide' : 'Show'} Hints
              </Button>
              
              {showHint && (
                <div className="bg-orange-900/50 p-3 rounded-lg border border-orange-400 max-w-xs">
                  <div className="text-xs text-orange-200 space-y-1">
                    {challenge.hints.map((hint, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-orange-400">•</span>
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
                <span className="text-white text-sm font-semibold ml-2">🤖 AI Java Expert</span>
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
                <div className="text-cyan-600 mb-2">// AI is coding Java...</div>
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
                {isAiTyping ? 'AI Typing...' : 'Watch AI Code Java'}
              </Button>
            </div>
          </div>

          {/* Window 2: Student Input */}
          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-orange-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">☕ Your Java Code</span>
              </div>
              <div className="text-xs text-orange-100">
                {studentCode.length} chars
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-slate-950">
              <textarea
                ref={studentInputRef}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-orange-300 font-mono text-sm resize-none outline-none"
                placeholder="// Type your Java code here...
// Try to match or beat the AI!

class Solution {
    public static void main(String[] args) {
        
    }
}"
                spellCheck={false}
              />
            </div>
            
            <div className="bg-slate-800 p-3 border-t border-orange-500 flex gap-2 shrink-0">
              <Button
                onClick={reset}
                variant="outline"
                className="flex-1 border-orange-400 text-orange-300 hover:bg-orange-500/20"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={runStudentCode}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Java
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
                          <div className="font-bold">✓ Perfect Java Code!</div>
                          <div className="text-xs text-green-500">Output matches expected result ☕</div>
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
                  <div className="text-4xl mb-2">☕</div>
                  <div className="text-sm">Compile & run your Java code</div>
                  <div className="text-xs mt-2">Click "Run Java" button →</div>
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
                        ? 'bg-orange-500 animate-pulse'
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
        <div className="bg-slate-800 p-3 border-t-2 border-orange-500 shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Completed: {completedChallenges.length}/{challenges.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-400" />
                <span>Accuracy: {completedChallenges.length > 0 ? Math.round((completedChallenges.length / (currentChallenge + 1)) * 100) : 0}%</span>
              </div>
            </div>
            <div className="text-gray-500 text-xs">
              ☕ Tip: Master Java syntax by racing against AI - Perfect for CBSE Board Exams!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
