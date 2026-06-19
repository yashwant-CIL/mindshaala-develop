import { useState, useEffect } from 'react';
import { ArrowLeft, Keyboard, Zap, Trophy, FolderOpen, HelpCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface PracticalSkillsProps {
  onBack: () => void;
}

export function PracticalSkills({ onBack }: PracticalSkillsProps) {
  const [typingText, setTypingText] = useState('');
  const [currentText, setCurrentText] = useState('the quick brown fox jumps over the lazy dog');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const handleTypingStart = () => {
    setIsTyping(true);
    setStartTime(Date.now());
    setTypingText('');
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value;
    setTypingText(typed);

    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      const wordsTyped = typed.split(' ').length;
      setWpm(Math.round(wordsTyped / timeElapsed) || 0);

      // Calculate accuracy
      let correct = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === currentText[i]) correct++;
      }
      setAccuracy(typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl text-gray-900">Practical Skills</h1>
                <p className="text-sm text-gray-500">Master typing, shortcuts, and file management</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Module 8/8</Badge>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Typing Tutor */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg">Typing Tutor</h2>
              <p className="text-sm text-gray-500">Improve your typing speed and accuracy</p>
            </div>
          </div>

          {!isTyping ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-4">Practice sentence:</p>
              <p className="text-lg mb-6 font-mono bg-gray-100 p-4 rounded">{currentText}</p>
              <Button onClick={handleTypingStart}>
                <Zap className="w-4 h-4 mr-2" />
                Start Typing Practice
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Words Per Minute</p>
                  <p className="text-2xl">{wpm}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Accuracy</p>
                  <p className="text-2xl">{accuracy}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Characters</p>
                  <p className="text-2xl">{typingText.length}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg font-mono text-sm">
                {currentText}
              </div>

              <input
                type="text"
                value={typingText}
                onChange={handleTypingChange}
                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Start typing here..."
                autoFocus
              />

              <Button variant="outline" onClick={() => {
                setIsTyping(false);
                setTypingText('');
                setWpm(0);
                setAccuracy(100);
              }}>
                Reset
              </Button>
            </div>
          )}
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="p-6">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Essential Keyboard Shortcuts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Windows Shortcuts */}
            <div>
              <h3 className="text-sm mb-3 text-blue-600">Windows Shortcuts:</h3>
              <div className="space-y-2">
                {[
                  { keys: 'Ctrl + C', action: 'Copy selected text/file' },
                  { keys: 'Ctrl + V', action: 'Paste copied item' },
                  { keys: 'Ctrl + X', action: 'Cut selected item' },
                  { keys: 'Ctrl + Z', action: 'Undo last action' },
                  { keys: 'Ctrl + Y', action: 'Redo action' },
                  { keys: 'Ctrl + A', action: 'Select all' },
                  { keys: 'Ctrl + S', action: 'Save file' },
                  { keys: 'Ctrl + P', action: 'Print' },
                  { keys: 'Alt + Tab', action: 'Switch between apps' },
                  { keys: 'Win + D', action: 'Show desktop' },
                  { keys: 'Win + E', action: 'Open File Explorer' },
                  { keys: 'Ctrl + Alt + Del', action: 'Task Manager' },
                ].map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                      {shortcut.keys}
                    </kbd>
                    <span className="text-xs text-gray-600">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mac Shortcuts */}
            <div>
              <h3 className="text-sm mb-3 text-gray-600">Mac Shortcuts:</h3>
              <div className="space-y-2">
                {[
                  { keys: 'Cmd + C', action: 'Copy' },
                  { keys: 'Cmd + V', action: 'Paste' },
                  { keys: 'Cmd + X', action: 'Cut' },
                  { keys: 'Cmd + Z', action: 'Undo' },
                  { keys: 'Cmd + Shift + Z', action: 'Redo' },
                  { keys: 'Cmd + A', action: 'Select all' },
                  { keys: 'Cmd + S', action: 'Save' },
                  { keys: 'Cmd + P', action: 'Print' },
                  { keys: 'Cmd + Tab', action: 'Switch apps' },
                  { keys: 'Cmd + Space', action: 'Spotlight search' },
                  { keys: 'Cmd + Q', action: 'Quit app' },
                  { keys: 'Cmd + W', action: 'Close window' },
                ].map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                      {shortcut.keys}
                    </kbd>
                    <span className="text-xs text-gray-600">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* File Management */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg">File Management</h2>
              <p className="text-sm text-gray-500">Organize your files and folders effectively</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm mb-2">File Operations:</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-mono bg-white px-2 py-1 rounded border border-green-300">Create</div>
                    <span className="text-gray-600">Right-click → New → Folder/File</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-mono bg-white px-2 py-1 rounded border border-green-300">Copy</div>
                    <span className="text-gray-600">Ctrl+C or Right-click → Copy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-mono bg-white px-2 py-1 rounded border border-green-300">Move</div>
                    <span className="text-gray-600">Ctrl+X then Ctrl+V or Drag & Drop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-mono bg-white px-2 py-1 rounded border border-green-300">Delete</div>
                    <span className="text-gray-600">Delete key or Right-click → Delete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-mono bg-white px-2 py-1 rounded border border-green-300">Rename</div>
                    <span className="text-gray-600">F2 or Right-click → Rename</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm mb-2">File Extensions:</h3>
                <div className="space-y-1 text-xs">
                  {[
                    { ext: '.txt', type: 'Text file' },
                    { ext: '.pdf', type: 'PDF document' },
                    { ext: '.docx', type: 'Word document' },
                    { ext: '.xlsx', type: 'Excel spreadsheet' },
                    { ext: '.jpg/.png', type: 'Image file' },
                    { ext: '.mp4/.mp3', type: 'Video/Audio' },
                    { ext: '.zip', type: 'Compressed file' },
                  ].map((item) => (
                    <div key={item.ext} className="flex items-center justify-between p-1">
                      <code className="bg-white px-2 py-0.5 rounded border border-blue-300">{item.ext}</code>
                      <span className="text-gray-600">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-sm mb-2">Best Practices:</h3>
                <ul className="text-xs space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Use descriptive file names (Report_2024.pdf)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Create folders by category/project</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Regular backup important files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Delete unnecessary files regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>Don't use special characters in names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>Don't save everything on Desktop</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="text-sm mb-2">Search Tips:</h3>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• <strong>Windows:</strong> Win + S or search box in Explorer</li>
                  <li>• <strong>Mac:</strong> Cmd + Space (Spotlight)</li>
                  <li>• Use filters: type:pdf, date:today</li>
                  <li>• Use wildcards: *.txt finds all text files</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Basic Troubleshooting */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg">Basic Troubleshooting</h2>
              <p className="text-sm text-gray-500">Fix common computer problems</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                problem: 'Computer is slow', 
                solutions: ['Close unused programs', 'Clear temporary files', 'Restart computer', 'Check for updates', 'Run antivirus scan'] 
              },
              { 
                problem: 'No internet connection', 
                solutions: ['Check Wi-Fi is on', 'Restart router', 'Forget & reconnect to network', 'Check cables', 'Contact ISP'] 
              },
              { 
                problem: 'Program not responding', 
                solutions: ['Wait a few seconds', 'Task Manager → End Task', 'Restart program', 'Update the program', 'Reinstall if needed'] 
              },
              { 
                problem: 'Can\'t find a file', 
                solutions: ['Use search function', 'Check Recycle Bin', 'Look in Downloads folder', 'Check recent files', 'Use advanced search'] 
              },
            ].map((item) => (
              <div key={item.problem} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm mb-2 text-red-700">Problem: {item.problem}</h3>
                <p className="text-xs text-gray-600 mb-2">Solutions to try:</p>
                <ol className="text-xs space-y-1 text-gray-700">
                  {item.solutions.map((solution, idx) => (
                    <li key={idx}>{idx + 1}. {solution}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm mb-2 text-blue-900">Universal Fix: "Restart"</h3>
            <p className="text-xs text-gray-700">
              Many computer problems can be fixed by simply restarting. It clears memory, stops stuck processes, and resets connections. 
              Always try restarting before complex troubleshooting!
            </p>
          </div>
        </Card>

        {/* Practice Challenges */}
        <Card className="p-6">
          <h2 className="text-lg mb-4">Practice Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Typing Speed Test', desc: '1-minute typing challenge', icon: Keyboard },
              { title: 'Shortcut Master', desc: 'Learn all essential shortcuts', icon: Zap },
              { title: 'File Organization', desc: 'Virtual file management tasks', icon: FolderOpen },
            ].map((challenge) => {
              const Icon = challenge.icon;
              return (
                <div key={challenge.title} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Icon className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="text-sm mb-1">{challenge.title}</h3>
                  <p className="text-xs text-gray-600 mb-3">{challenge.desc}</p>
                  <Button size="sm" className="w-full">
                    <Trophy className="w-3 h-3 mr-2" />
                    Start Challenge
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
