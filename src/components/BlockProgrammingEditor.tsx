import { useState, useRef, useEffect } from 'react';
import { 
  X, Play, RotateCcw, Volume2, VolumeX, Trophy, 
  Code2, Eye, Download, Upload, Lightbulb, Sparkles,
  Zap, FileCode, Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface BlockProgrammingEditorProps {
  onClose: () => void;
}

interface Block {
  id: string;
  type: string;
  params: any;
  children?: Block[];
}

interface Sprite {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  visible: boolean;
  message: string;
  trail: { x: number; y: number }[];
}

export function BlockProgrammingEditor({ onClose }: BlockProgrammingEditorProps) {
  const stageCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  
  const [sprite, setSprite] = useState<Sprite>({
    x: 200,
    y: 200,
    rotation: 0,
    scale: 1,
    visible: true,
    message: '',
    trail: [],
  });

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Sound effects
  const playSound = (frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = 0.2;
    
    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playSuccessSound = () => {
    playSound(523, 0.1);
    setTimeout(() => playSound(659, 0.1), 100);
    setTimeout(() => playSound(784, 0.2), 200);
  };
  const playClickSound = () => playSound(1000, 0.05);

  // Block templates
  const blockTemplates = {
    move: { name: 'Move', icon: '➜', color: 'bg-blue-500', params: [{ name: 'steps', type: 'number', default: 10 }] },
    turn: { name: 'Turn', icon: '↻', color: 'bg-blue-500', params: [{ name: 'degrees', type: 'number', default: 15 }] },
    goto: { name: 'Go To', icon: '📍', color: 'bg-blue-500', params: [{ name: 'x', type: 'number', default: 0 }, { name: 'y', type: 'number', default: 0 }] },
    say: { name: 'Say', icon: '💬', color: 'bg-purple-500', params: [{ name: 'text', type: 'text', default: 'Hello!' }, { name: 'duration', type: 'number', default: 2 }] },
    changeSize: { name: 'Change Size', icon: '⬆️', color: 'bg-purple-500', params: [{ name: 'amount', type: 'number', default: 10 }] },
    setSize: { name: 'Set Size', icon: '📏', color: 'bg-purple-500', params: [{ name: 'percent', type: 'number', default: 100 }] },
    show: { name: 'Show', icon: '👁️', color: 'bg-purple-500', params: [] },
    hide: { name: 'Hide', icon: '🙈', color: 'bg-purple-500', params: [] },
    playSound: { name: 'Play Sound', icon: '🔊', color: 'bg-pink-500', params: [{ name: 'sound', type: 'select', options: ['pop', 'meow', 'beep', 'ding'], default: 'pop' }] },
    wait: { name: 'Wait', icon: '⏱️', color: 'bg-yellow-500', params: [{ name: 'seconds', type: 'number', default: 1 }] },
    repeat: { name: 'Repeat', icon: '🔁', color: 'bg-yellow-500', params: [{ name: 'times', type: 'number', default: 10 }], hasChildren: true },
  };

  // Add block
  const addBlock = (type: string) => {
    const template = blockTemplates[type as keyof typeof blockTemplates];
    if (!template) return;
    
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      params: template.params.reduce((acc, p) => ({ ...acc, [p.name]: p.default }), {}),
      children: template.hasChildren ? [] : undefined,
    };
    
    setBlocks([...blocks, newBlock]);
    setScore((score) => score + 10);
    playClickSound();
  };

  // Update block param
  const updateBlockParam = (blockId: string, paramName: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, params: { ...block.params, [paramName]: value } }
        : block
    ));
  };

  // Delete block
  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    setScore((score) => Math.max(0, score - 10));
    playClickSound();
  };

  // Move block
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      setBlocks(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
    }
    playClickSound();
  };

  // Draw stage
  useEffect(() => {
    const canvas = stageCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8C8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Center crosshair
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw trail
    if (sprite.trail.length > 1) {
      ctx.strokeStyle = '#FF1493';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sprite.trail[0].x, sprite.trail[0].y);
      sprite.trail.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    
    // Draw sprite
    if (sprite.visible) {
      ctx.save();
      ctx.translate(sprite.x, sprite.y);
      ctx.rotate((sprite.rotation * Math.PI) / 180);
      ctx.scale(sprite.scale, sprite.scale);
      
      // Cat sprite
      ctx.font = '40px Arial';
      ctx.fillText('🐱', -20, 20);
      
      ctx.restore();
      
      // Speech bubble
      if (sprite.message) {
        const bubbleWidth = Math.max(ctx.measureText(sprite.message).width + 20, 80);
        const bubbleHeight = 40;
        const bubbleX = sprite.x + 30;
        const bubbleY = sprite.y - 50;
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#9966FF';
        ctx.lineWidth = 3;
        
        // Bubble
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
        ctx.fill();
        ctx.stroke();
        
        // Bubble pointer
        ctx.beginPath();
        ctx.moveTo(bubbleX, bubbleY + 30);
        ctx.lineTo(bubbleX - 10, bubbleY + 35);
        ctx.lineTo(bubbleX, bubbleY + 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(sprite.message, bubbleX + 10, bubbleY + 25);
      }
    }
    
    // Draw coordinates
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, canvas.height - 30, 200, 25);
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`X:${Math.round(sprite.x)} Y:${Math.round(sprite.y)} ∠${Math.round(sprite.rotation)}°`, 10, canvas.height - 10);
    
  }, [sprite]);

  // Generate and run code
  const runCode = async () => {
    if (blocks.length === 0) return;
    
    playClickSound();
    setIsRunning(true);
    
    // Generate code
    let code = '// Generated Code\n';
    blocks.forEach(block => {
      const template = blockTemplates[block.type as keyof typeof blockTemplates];
      code += `// ${template.icon} ${template.name}\n`;
    });
    setGeneratedCode(code);
    
    // Execute blocks
    for (const block of blocks) {
      if (!isRunning) break;
      
      try {
        switch (block.type) {
          case 'move':
            await moveSprite(block.params.steps);
            break;
          case 'turn':
            await turnSprite(block.params.degrees);
            break;
          case 'goto':
            await gotoPosition(block.params.x, block.params.y);
            break;
          case 'say':
            await sayMessage(block.params.text, block.params.duration);
            break;
          case 'changeSize':
            await changeSize(block.params.amount);
            break;
          case 'setSize':
            await setSizeValue(block.params.percent);
            break;
          case 'show':
            await showSprite();
            break;
          case 'hide':
            await hideSprite();
            break;
          case 'playSound':
            await playSoundEffect(block.params.sound);
            break;
          case 'wait':
            await wait(block.params.seconds);
            break;
          case 'repeat':
            for (let i = 0; i < block.params.times; i++) {
              // In a full implementation, would execute children blocks
            }
            break;
        }
      } catch (error) {
        console.error('Block execution error:', error);
      }
    }
    
    playSuccessSound();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    setIsRunning(false);
  };

  // Sprite control functions
  const moveSprite = async (steps: number) => {
    return new Promise<void>((resolve) => {
      setSprite(s => {
        const rad = (s.rotation * Math.PI) / 180;
        const newX = s.x + steps * Math.cos(rad);
        const newY = s.y + steps * Math.sin(rad);
        return {
          ...s,
          x: Math.max(20, Math.min(380, newX)),
          y: Math.max(20, Math.min(380, newY)),
          trail: [...s.trail, { x: s.x, y: s.y }],
        };
      });
      playSound(440, 0.1);
      setTimeout(resolve, 300);
    });
  };

  const turnSprite = async (degrees: number) => {
    return new Promise<void>((resolve) => {
      setSprite(s => ({ ...s, rotation: s.rotation + degrees }));
      playSound(550, 0.1);
      setTimeout(resolve, 300);
    });
  };

  const gotoPosition = async (x: number, y: number) => {
    return new Promise<void>((resolve) => {
      setSprite(s => ({
        ...s,
        x: Math.max(20, Math.min(380, x + 200)),
        y: Math.max(20, Math.min(380, 200 - y)),
        trail: [...s.trail, { x: s.x, y: s.y }],
      }));
      playSound(660, 0.1);
      setTimeout(resolve, 300);
    });
  };

  const sayMessage = async (message: string, duration: number) => {
    return new Promise<void>((resolve) => {
      setSprite(s => ({ ...s, message }));
      playSound(660, 0.1);
      setTimeout(() => {
        setSprite(s => ({ ...s, message: '' }));
        resolve();
      }, duration * 1000);
    });
  };

  const changeSize = async (amount: number) => {
    return new Promise<void>((resolve) => {
      setSprite(s => ({ ...s, scale: Math.max(0.1, Math.min(3, s.scale + amount / 100)) }));
      playSound(770, 0.1);
      setTimeout(resolve, 300);
    });
  };

  const setSizeValue = async (percent: number) => {
    return new Promise<void>((resolve) => {
      setSprite(s => ({ ...s, scale: Math.max(0.1, Math.min(3, percent / 100)) }));
      playSound(770, 0.1);
      setTimeout(resolve, 300);
    });
  };

  const showSprite = async () => {
    return new Promise<void>((resolve) => {
      setSprite(s => ({ ...s, visible: true }));
      playSound(880, 0.1);
      setTimeout(resolve, 200);
    });
  };

  const hideSprite = async () => {
    return new Promise<void>((resolve) => {
      setSprite(s => ({ ...s, visible: false }));
      playSound(440, 0.1);
      setTimeout(resolve, 200);
    });
  };

  const playSoundEffect = async (sound: string) => {
    return new Promise<void>((resolve) => {
      const frequencies: any = { pop: 440, meow: 330, beep: 880, ding: 1320 };
      playSound(frequencies[sound] || 440, 0.3);
      setTimeout(resolve, 300);
    });
  };

  const wait = async (seconds: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
  };

  // Reset sprite
  const resetSprite = () => {
    playClickSound();
    setSprite({
      x: 200,
      y: 200,
      rotation: 0,
      scale: 1,
      visible: true,
      message: '',
      trail: [],
    });
  };

  // Save/Load
  const saveWorkspace = () => {
    const data = JSON.stringify(blocks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindShaala_blocks.json';
    a.click();
    playClickSound();
  };

  const loadWorkspace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setBlocks(data);
          setScore(data.length * 10);
          playClickSound();
        } catch (error) {
          console.error('Failed to load workspace:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 flex items-center justify-center p-4">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="text-8xl animate-bounce">🎉</div>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2, y: -100 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                className="absolute text-4xl"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
              >
                ⭐
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Code2 className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Block Programming Technical Editor
                  <Badge className="bg-green-500 text-white text-xs">Custom Implementation</Badge>
                </h2>
                <p className="text-sm text-white/90">Build programs with visual code blocks! 🚀</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-lg">{score}</span>
                <span className="text-sm">points</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playClickSound();
                  setSoundEnabled(!soundEnabled);
                }}
                className="text-white hover:bg-white/20"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Block Palette */}
          <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r-4 border-purple-300 flex flex-col shrink-0 overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 border-b-2 border-purple-400 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h3 className="text-white font-bold">Block Palette</h3>
              </div>
            </div>
            
            <div className="p-3 space-y-2">
              <div className="text-xs font-bold text-gray-600 uppercase mb-2">➜ Motion</div>
              {['move', 'turn', 'goto'].map(type => {
                const template = blockTemplates[type as keyof typeof blockTemplates];
                return (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className={`w-full ${template.color} text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm`}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span className="font-semibold">{template.name}</span>
                    <Plus className="w-4 h-4 ml-auto" />
                  </button>
                );
              })}
              
              <div className="text-xs font-bold text-gray-600 uppercase mb-2 mt-4">💬 Looks</div>
              {['say', 'changeSize', 'setSize', 'show', 'hide'].map(type => {
                const template = blockTemplates[type as keyof typeof blockTemplates];
                return (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className={`w-full ${template.color} text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm`}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span className="font-semibold">{template.name}</span>
                    <Plus className="w-4 h-4 ml-auto" />
                  </button>
                );
              })}
              
              <div className="text-xs font-bold text-gray-600 uppercase mb-2 mt-4">🔊 Sound & Control</div>
              {['playSound', 'wait', 'repeat'].map(type => {
                const template = blockTemplates[type as keyof typeof blockTemplates];
                return (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className={`w-full ${template.color} text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm`}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span className="font-semibold">{template.name}</span>
                    <Plus className="w-4 h-4 ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Panel - Workspace */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 border-b-2 border-purple-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg px-3 py-1.5">
                  <Lightbulb className="w-4 h-4 text-yellow-600 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-700">
                    👉 Click blocks on the left to add them
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveWorkspace}
                  className="border-2 border-blue-400 hover:bg-blue-50 shadow-md"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadWorkspace}
                  className="border-2 border-green-400 hover:bg-green-50 shadow-md"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Load
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCode(!showCode)}
                  className="border-2 border-purple-400 hover:bg-purple-50 shadow-md"
                >
                  <FileCode className="w-4 h-4 mr-2" />
                  {showCode ? 'Hide' : 'Show'} Code
                </Button>
                
                <Button
                  size="sm"
                  onClick={resetSprite}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <Button
                  size="sm"
                  onClick={runCode}
                  disabled={isRunning || blocks.length === 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
              </div>
            </div>

            {/* Workspace */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 p-6">
              {blocks.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Code2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No blocks yet!</p>
                    <p className="text-sm">Click blocks from the left palette to start coding</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-w-2xl mx-auto">
                  {blocks.map((block, index) => {
                    const template = blockTemplates[block.type as keyof typeof blockTemplates];
                    return (
                      <motion.div
                        key={block.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${template.color} text-white p-4 rounded-lg shadow-lg`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <div className="font-bold mb-2">{template.name}</div>
                            <div className="space-y-2">
                              {template.params.map(param => (
                                <div key={param.name} className="flex items-center gap-2">
                                  <label className="text-xs opacity-90 min-w-[60px]">{param.name}:</label>
                                  {param.type === 'select' ? (
                                    <select
                                      value={block.params[param.name]}
                                      onChange={(e) => updateBlockParam(block.id, param.name, e.target.value)}
                                      className="flex-1 bg-white/20 border border-white/30 rounded px-2 py-1 text-sm"
                                    >
                                      {param.options?.map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : param.type === 'text' ? (
                                    <input
                                      type="text"
                                      value={block.params[param.name]}
                                      onChange={(e) => updateBlockParam(block.id, param.name, e.target.value)}
                                      className="flex-1 bg-white/20 border border-white/30 rounded px-2 py-1 text-sm"
                                    />
                                  ) : (
                                    <input
                                      type="number"
                                      value={block.params[param.name]}
                                      onChange={(e) => updateBlockParam(block.id, param.name, parseFloat(e.target.value) || 0)}
                                      className="flex-1 bg-white/20 border border-white/30 rounded px-2 py-1 text-sm w-24"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveBlock(block.id, 'up')}
                              disabled={index === 0}
                              className="bg-white/20 hover:bg-white/30 disabled:opacity-30 p-1 rounded"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveBlock(block.id, 'down')}
                              disabled={index === blocks.length - 1}
                              className="bg-white/20 hover:bg-white/30 disabled:opacity-30 p-1 rounded"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => deleteBlock(block.id)}
                              className="bg-red-500/50 hover:bg-red-500 p-1 rounded mt-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Generated Code Panel */}
            {showCode && (
              <div className="h-48 bg-gray-900 text-green-400 font-mono text-sm p-4 overflow-auto border-t-4 border-purple-400">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">Code Preview:</span>
                </div>
                <pre className="text-xs">{generatedCode || '// Your code will appear here...'}</pre>
              </div>
            )}
          </div>

          {/* Right Panel - Stage */}
          <div className="w-96 bg-gradient-to-b from-gray-900 to-gray-800 border-l-4 border-purple-300 flex flex-col shrink-0">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b-2 border-purple-400">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-bold">Stage Output</h3>
              </div>
            </div>
            
            {/* Stage Canvas */}
            <div className="flex-1 p-4 flex items-center justify-center">
              <canvas
                ref={stageCanvasRef}
                width={400}
                height={400}
                className="rounded-xl border-4 border-gray-700 shadow-2xl"
              />
            </div>
            
            {/* Sprite info */}
            <div className="p-4 bg-gray-800 space-y-2 text-white text-sm border-t-2 border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-yellow-400">Sprite Status</span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-900 p-3 rounded-lg">
                <div>
                  <span className="text-gray-400 text-xs">X Position:</span>
                  <div className="font-mono font-bold">{(sprite.x - 200).toFixed(0)}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Y Position:</span>
                  <div className="font-mono font-bold">{(200 - sprite.y).toFixed(0)}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Rotation:</span>
                  <div className="font-mono font-bold">{sprite.rotation.toFixed(0)}°</div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Size:</span>
                  <div className="font-mono font-bold">{(sprite.scale * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Visible:</span>
                  <div className="font-mono font-bold">{sprite.visible ? '✓ Yes' : '✗ No'}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Trail:</span>
                  <div className="font-mono font-bold">{sprite.trail.length} pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
