import { useState } from 'react';
import { X, RotateCcw, Code, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface SimpleHTMLCSSPlaygroundProps {
  onClose: () => void;
}

export function SimpleHTMLCSSPlayground({ onClose }: SimpleHTMLCSSPlaygroundProps) {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    h1 {
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Start building your webpage here!</p>
</body>
</html>`);

  const resetCode = () => {
    setHtmlCode(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    h1 {
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Start building your webpage here!</p>
</body>
</html>`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-lg rounded-lg p-2">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🌐</span>
                  HTML & CSS Code Playground
                </h2>
                <p className="text-sm text-white/90">Build and preview your webpage instantly</p>
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
                <Code className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-white">HTML & CSS Editor</span>
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
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="w-full h-full bg-slate-950 text-blue-400 font-mono text-sm p-4 rounded-lg border-2 border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Write your HTML & CSS here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="flex-1 bg-white flex flex-col">
            <div className="p-3 bg-gray-100 border-b border-gray-300 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-gray-900">Live Preview</span>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={htmlCode}
                title="preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
