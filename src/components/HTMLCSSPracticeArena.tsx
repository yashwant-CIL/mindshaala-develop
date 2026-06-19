import { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Zap, Trophy, Timer, Target, Sparkles, CheckCircle, AlertCircle, Code2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface HTMLCSSPracticeArenaProps {
  onClose: () => void;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hints: string[];
  aiCode: string;
  topic: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Basic HTML Page',
    description: 'Create a simple HTML page with a heading "Welcome to Web Development"',
    difficulty: 'Easy',
    topic: 'HTML Basics',
    hints: ['Use <!DOCTYPE html>', 'Add <html>, <head>, and <body> tags', 'Use <h1> for heading'],
    aiCode: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Welcome to Web Development</h1>\n</body>\n</html>',
  },
  {
    id: 2,
    title: 'Paragraph and Link',
    description: 'Add a paragraph with text and a link to google.com',
    difficulty: 'Easy',
    topic: 'HTML Elements',
    hints: ['Use <p> for paragraph', 'Use <a href="..."> for links', 'Add target="_blank" to open in new tab'],
    aiCode: '<!DOCTYPE html>\n<html>\n<body>\n    <p>This is my first webpage!</p>\n    <a href="https://google.com" target="_blank">Visit Google</a>\n</body>\n</html>',
  },
  {
    id: 3,
    title: 'Styled Heading',
    description: 'Create a blue heading with 24px font size using inline CSS',
    difficulty: 'Medium',
    topic: 'Inline CSS',
    hints: ['Use style attribute', 'Set color: blue', 'Set font-size: 24px'],
    aiCode: '<!DOCTYPE html>\n<html>\n<body>\n    <h1 style="color: blue; font-size: 24px;">Styled Heading</h1>\n</body>\n</html>',
  },
  {
    id: 4,
    title: 'Div with Background',
    description: 'Create a div with text, orange background, and white text color',
    difficulty: 'Medium',
    topic: 'CSS Styling',
    hints: ['Use <div> tag', 'Set background-color: orange', 'Set color: white', 'Add padding for spacing'],
    aiCode: '<!DOCTYPE html>\n<html>\n<body>\n    <div style="background-color: orange; color: white; padding: 20px;">\n        This is a styled div!\n    </div>\n</body>\n</html>',
  },
  {
    id: 5,
    title: 'Internal CSS',
    description: 'Use <style> tag to make all paragraphs have green text and center alignment',
    difficulty: 'Medium',
    topic: 'Internal CSS',
    hints: ['Add <style> in <head>', 'Use p selector', 'Set color and text-align'],
    aiCode: '<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        p {\n            color: green;\n            text-align: center;\n        }\n    </style>\n</head>\n<body>\n    <p>This paragraph is styled!</p>\n</body>\n</html>',
  },
  {
    id: 6,
    title: 'Button with Hover Effect',
    description: 'Create a button that changes color on hover using CSS',
    difficulty: 'Hard',
    topic: 'CSS Hover',
    hints: ['Use <button> tag', 'Style button in <style> tag', 'Use :hover pseudo-class'],
    aiCode: '<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        button {\n            background-color: blue;\n            color: white;\n            padding: 10px 20px;\n            border: none;\n            cursor: pointer;\n        }\n        button:hover {\n            background-color: darkblue;\n        }\n    </style>\n</head>\n<body>\n    <button>Hover Me!</button>\n</body>\n</html>',
  },
  {
    id: 7,
    title: 'Flexbox Layout',
    description: 'Create a flex container with 3 centered boxes',
    difficulty: 'Hard',
    topic: 'CSS Flexbox',
    hints: ['Use display: flex', 'Use justify-content: center', 'Create multiple div children'],
    aiCode: '<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        .container {\n            display: flex;\n            justify-content: center;\n            gap: 10px;\n        }\n        .box {\n            width: 100px;\n            height: 100px;\n            background-color: purple;\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="box"></div>\n        <div class="box"></div>\n        <div class="box"></div>\n    </div>\n</body>\n</html>',
  },
];

export function HTMLCSSPracticeArena({ onClose }: HTMLCSSPracticeArenaProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [studentCode, setStudentCode] = useState('');
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
  const previewRef = useRef<HTMLIFrameElement>(null);

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

  const startAiTyping = () => {
    setAiTypedCode('');
    setAiTypingIndex(0);
    setIsAiTyping(true);
    setIsRunning(true);
  };

  const runStudentCode = () => {
    if (previewRef.current) {
      const iframe = previewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(studentCode);
        doc.close();
        
        // Check completion (simple validation)
        const codeNormalized = studentCode.toLowerCase().replace(/\s+/g, '');
        const requiredElements = challenge.topic === 'HTML Basics' ? ['<!doctype', '<html>', '<body>', '<h1>'] :
                                challenge.topic === 'HTML Elements' ? ['<p>', '<a'] :
                                challenge.topic === 'Inline CSS' ? ['style='] :
                                challenge.topic === 'CSS Styling' ? ['<div', 'style='] :
                                challenge.topic === 'Internal CSS' ? ['<style>', 'p{'] :
                                challenge.topic === 'CSS Hover' ? ['<button', ':hover'] :
                                challenge.topic === 'CSS Flexbox' ? ['display:flex'] : [];
        
        const allPresent = requiredElements.every(el => codeNormalized.includes(el.toLowerCase().replace(/\s+/g, '')));
        
        if (allPresent && !completedChallenges.includes(challenge.id)) {
          setShowSuccess(true);
          setCompletedChallenges([...completedChallenges, challenge.id]);
          setStudentScore(studentScore + 120);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      }
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setStudentCode('');
      setAiTypedCode('');
      setTimeElapsed(0);
      setIsRunning(false);
      setShowHint(false);
      setAiTypingIndex(0);
      setIsAiTyping(false);
      if (previewRef.current) {
        const doc = previewRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write('');
          doc.close();
        }
      }
    }
  };

  const reset = () => {
    setStudentCode('');
    setAiTypedCode('');
    setAiTypingIndex(0);
    setIsAiTyping(false);
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write('');
        doc.close();
      }
    }
    studentInputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 z-50 flex items-center justify-center p-4">
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
                <div className="text-2xl font-bold">Perfect Web Code! 🌐</div>
                <div className="text-sm">+120 points</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col overflow-hidden border-2 border-blue-500">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Code2 className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  🌐 HTML & CSS AI Race - Class 9-10
                  <Badge className="bg-green-500 text-white text-xs">Challenge {currentChallenge + 1}/{challenges.length}</Badge>
                </h2>
                <p className="text-sm text-white/90">Build beautiful websites at AI speed! 🎨</p>
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

        <div className="bg-slate-700 p-4 border-b-2 border-blue-500 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-bold text-lg">{challenge.title}</h3>
                <Badge className={
                  challenge.difficulty === 'Easy' ? 'bg-green-500' :
                  challenge.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }>
                  {challenge.difficulty}
                </Badge>
                <Badge className="bg-blue-500">{challenge.topic}</Badge>
              </div>
              <p className="text-gray-300 text-sm">{challenge.description}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-300 hover:bg-blue-500/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showHint ? 'Hide' : 'Show'} Hints
              </Button>
              
              {showHint && (
                <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-400 max-w-xs">
                  <div className="text-xs text-blue-200 space-y-1">
                    {challenge.hints.map((hint, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
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
                <span className="text-white text-sm font-semibold ml-2">🤖 AI Web Developer</span>
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
                <div className="text-cyan-600 mb-2">{"<!-- AI is coding HTML/CSS... -->"}</div>
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
                {isAiTyping ? 'AI Typing...' : 'Watch AI Code'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col bg-slate-900 rounded-xl border-2 border-blue-500 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-white text-sm font-semibold ml-2">🌐 Your HTML/CSS</span>
              </div>
              <div className="text-xs text-blue-100">
                {studentCode.length} chars
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-slate-950">
              <textarea
                ref={studentInputRef}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-blue-300 font-mono text-sm resize-none outline-none"
                placeholder="<!-- Type your HTML/CSS here... -->
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    
</body>
</html>"
                spellCheck={false}
              />
            </div>
            
            <div className="bg-slate-800 p-3 border-t border-blue-500 flex gap-2 shrink-0">
              <Button
                onClick={reset}
                variant="outline"
                className="flex-1 border-blue-400 text-blue-300 hover:bg-blue-500/20"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={runStudentCode}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview
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
                <span className="text-white text-sm font-semibold ml-2">✅ Live Preview</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-white">
              <iframe
                ref={previewRef}
                className="w-full h-full border-none"
                title="HTML Preview"
                sandbox="allow-same-origin"
              />
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
                        ? 'bg-blue-500 animate-pulse'
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

        <div className="bg-slate-800 p-3 border-t-2 border-blue-500 shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Completed: {completedChallenges.length}/{challenges.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>Accuracy: {completedChallenges.length > 0 ? Math.round((completedChallenges.length / (currentChallenge + 1)) * 100) : 0}%</span>
              </div>
            </div>
            <div className="text-gray-500 text-xs">
              🌐 Tip: Master web development by racing against AI - See your code come to life!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
