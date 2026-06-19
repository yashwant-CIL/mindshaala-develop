import { useState } from 'react';
import { X, Play, RotateCcw, Terminal, Code } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface SimpleCodePlaygroundProps {
  onClose: () => void;
  language: {
    name: string;
    icon: string;
    gradient: string;
  };
}

export function SimpleCodePlayground({ onClose, language }: SimpleCodePlaygroundProps) {
  const [code, setCode] = useState(
    language.name === 'Python' 
      ? '# Write your Python code here\nprint("Hello, World!")'
      : language.name === 'Java'
      ? '// Write your Java code here\nSystem.out.println("Hello, World!");'
      : '// Write your JavaScript code here\nconsole.log("Hello, World!");'
  );
  const [output, setOutput] = useState('');

  const runCode = () => {
    try {
      // Simple simulation of code execution
      if (code.includes('print') && language.name === 'Python') {
        const match = code.match(/print\(["'](.*?)["']\)/);
        if (match) {
          setOutput(`>>> ${match[1]}`);
        } else {
          setOutput('>>> Code executed successfully!');
        }
      } else if (code.includes('System.out.println') && language.name === 'Java') {
        const match = code.match(/System\.out\.println\(["'](.*?)["']\)/);
        if (match) {
          setOutput(`> ${match[1]}`);
        } else {
          setOutput('> Code executed successfully!');
        }
      } else if (code.includes('console.log') && language.name === 'JavaScript') {
        const match = code.match(/console\.log\(["'](.*?)["']\)/);
        if (match) {
          setOutput(`> ${match[1]}`);
        } else {
          setOutput('> Code executed successfully!');
        }
      } else {
        setOutput('> Code executed successfully!');
      }
    } catch (error) {
      setOutput('Error: Something went wrong!');
    }
  };

  const resetCode = () => {
    if (language.name === 'Python') {
      setCode('# Write your Python code here\nprint("Hello, World!")');
    } else if (language.name === 'Java') {
      setCode('// Write your Java code here\nSystem.out.println("Hello, World!");');
    } else {
      setCode('// Write your JavaScript code here\nconsole.log("Hello, World!");');
    }
    setOutput('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${language.gradient} text-white p-4 rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-lg rounded-lg p-2">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>{language.icon}</span>
                  {language.name} Code Playground
                </h2>
                <p className="text-sm text-white/90">Type your code and run it instantly</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content - 2 Panel Layout */}
        <div className="flex-1 flex gap-0 overflow-hidden">
          {/* LEFT: Code Editor */}
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
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run Code
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-slate-950 text-green-400 font-mono text-sm p-4 rounded-lg border-2 border-gray-700 focus:border-green-500 focus:outline-none resize-none"
                placeholder="Write your code here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* RIGHT: Terminal Output */}
          <div className="flex-1 bg-slate-950 flex flex-col">
            <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">Terminal Output</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-slate-900 rounded-lg p-4 h-full font-mono text-sm">
                {output ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400"
                  >
                    {output}
                  </motion.div>
                ) : (
                  <div className="text-gray-500 italic">
                    Click "Run Code" to see output...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
