import { useState, useRef, useEffect } from 'react';
import { 
  X, Play, Trash2, RotateCcw, Save, Download, Star, 
  Lightbulb, Volume2, VolumeX, Sparkles, Trophy, Zap,
  ArrowRight, Circle, Square, Triangle, Heart, Music, GripVertical
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface BlockCodingProps {
  onClose: () => void;
}

interface Block {
  id: string;
  type: 'move' | 'turn' | 'repeat' | 'if' | 'wait' | 'say' | 'play' | 'change' | 'set';
  category: 'motion' | 'looks' | 'sound' | 'control' | 'events';
  label: string;
  color: string;
  value?: string | number;
  x: number;
  y: number;
  inWorkspace: boolean;
  children?: Block[];
  icon?: string;
}

interface Sprite {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  visible: boolean;
  message: string;
  costume: number;
}

const blockTemplates: Omit<Block, 'id' | 'x' | 'y' | 'inWorkspace'>[] = [
  // Motion blocks
  { type: 'move', category: 'motion', label: 'move [10] steps', color: '#4C97FF', value: 10, icon: '➜' },
  { type: 'turn', category: 'motion', label: 'turn ↻ [15] degrees', color: '#4C97FF', value: 15, icon: '↻' },
  { type: 'set', category: 'motion', label: 'go to x: [0] y: [0]', color: '#4C97FF', value: '0,0', icon: '📍' },
  
  // Looks blocks
  { type: 'say', category: 'looks', label: 'say [Hello!] for [2] secs', color: '#9966FF', value: 'Hello!', icon: '💬' },
  { type: 'change', category: 'looks', label: 'change size by [10]', color: '#9966FF', value: 10, icon: '⬆️' },
  { type: 'set', category: 'looks', label: 'set size to [100]%', color: '#9966FF', value: 100, icon: '🔧' },
  
  // Sound blocks
  { type: 'play', category: 'sound', label: 'play sound [pop]', color: '#CF63CF', value: 'pop', icon: '🔊' },
  { type: 'play', category: 'sound', label: 'play note [60] for [0.5] beats', color: '#CF63CF', value: 60, icon: '🎵' },
  
  // Control blocks
  { type: 'wait', category: 'control', label: 'wait [1] seconds', color: '#FFAB19', value: 1, icon: '⏱️' },
  { type: 'repeat', category: 'control', label: 'repeat [10]', color: '#FFAB19', value: 10, children: [], icon: '🔁' },
  { type: 'if', category: 'control', label: 'if <touching mouse?> then', color: '#FFAB19', children: [], icon: '❓' },
  
  // Events blocks
  { type: 'play', category: 'events', label: '⚑ when clicked', color: '#FFD500', icon: '🚩' },
  { type: 'play', category: 'events', label: 'when [space] key pressed', color: '#FFD500', value: 'space', icon: '⌨️' },
];

export function BlockCodingPlatform({ onClose }: BlockCodingProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [draggingFromPalette, setDraggingFromPalette] = useState<typeof blockTemplates[0] | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sprite, setSprite] = useState<Sprite>({
    x: 200,
    y: 200,
    rotation: 0,
    scale: 1,
    visible: true,
    message: '',
    costume: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
    gainNode.gain.value = 0.3;
    
    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playPickupSound = () => playSound(800, 0.1, 'sine');
  const playDropSound = () => playSound(600, 0.15, 'triangle');
  const playSuccessSound = () => {
    playSound(523, 0.1);
    setTimeout(() => playSound(659, 0.1), 100);
    setTimeout(() => playSound(784, 0.2), 200);
  };
  const playDeleteSound = () => playSound(300, 0.2, 'square');
  const playClickSound = () => playSound(1000, 0.05);

  // Handle drag start from palette
  const handlePaletteDragStart = (template: typeof blockTemplates[0], e: React.DragEvent) => {
    playPickupSound();
    setDraggingFromPalette(template);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'block');
    
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.backgroundColor = template.color;
    dragImage.style.borderRadius = '12px';
    dragImage.style.padding = '12px 16px';
    dragImage.style.color = 'white';
    dragImage.style.fontWeight = '600';
    dragImage.style.fontSize = '14px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    dragImage.style.border = '3px solid rgba(255,255,255,0.5)';
    dragImage.innerHTML = `<span style="font-size: 20px; margin-right: 8px;">${template.icon}</span>${template.label}`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 25);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handlePaletteDragEnd = () => {
    setDraggingFromPalette(null);
  };

  // Handle workspace block drag
  const handleBlockDragStart = (blockId: string, e: React.DragEvent) => {
    playPickupSound();
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    setDraggingBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('blockId', blockId);
    
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleBlockDragEnd = () => {
    setDraggingBlock(null);
  };

  // Handle drop in workspace
  const handleWorkspaceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const workspace = workspaceRef.current;
    if (!workspace) return;
    
    const rect = workspace.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggingFromPalette) {
      // Dropping from palette - create new block
      playDropSound();
      const newBlock: Block = {
        ...draggingFromPalette,
        id: Date.now().toString(),
        x: x - 100, // Center the block
        y: y - 25,
        inWorkspace: true,
        children: draggingFromPalette.children ? [] : undefined,
      };
      setBlocks([...blocks, newBlock]);
      setScore(score + 10);
      
      if (blocks.filter(b => b.inWorkspace).length < 3) {
        triggerCelebration();
      }
      setDraggingFromPalette(null);
    } else if (draggingBlock) {
      // Moving existing block
      playDropSound();
      setBlocks(blocks.map(block => 
        block.id === draggingBlock
          ? { ...block, x: x - dragOffset.x, y: y - dragOffset.y }
          : block
      ));
      setDraggingBlock(null);
    }
  };

  const handleWorkspaceDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggingFromPalette ? 'copy' : 'move';
    setIsDraggingOver(true);
  };

  const handleWorkspaceDragLeave = (e: React.DragEvent) => {
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Only set to false if we're actually leaving the workspace
    if (e.clientX < rect.left || e.clientX > rect.right || 
        e.clientY < rect.top || e.clientY > rect.bottom) {
      setIsDraggingOver(false);
    }
  };

  // Delete block
  const deleteBlock = (blockId: string) => {
    playDeleteSound();
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  // Clear workspace
  const clearWorkspace = () => {
    playDeleteSound();
    setBlocks(blocks.filter(b => !b.inWorkspace));
    setScore(0);
  };

  // Trigger celebration
  const triggerCelebration = () => {
    setShowCelebration(true);
    playSuccessSound();
    setTimeout(() => setShowCelebration(false), 2000);
  };

  // Execute blocks
  const executeBlocks = async () => {
    setIsRunning(true);
    playSuccessSound();
    
    const workspaceBlocks = blocks
      .filter(b => b.inWorkspace)
      .sort((a, b) => a.y - b.y);
    
    for (const block of workspaceBlocks) {
      await executeBlock(block);
    }
    
    setIsRunning(false);
    triggerCelebration();
  };

  const executeBlock = async (block: Block): Promise<void> => {
    return new Promise(async (resolve) => {
      switch (block.type) {
        case 'move':
          setSprite(s => ({
            ...s,
            x: s.x + (Number(block.value) || 10) * Math.cos((s.rotation * Math.PI) / 180),
            y: s.y + (Number(block.value) || 10) * Math.sin((s.rotation * Math.PI) / 180),
          }));
          playSound(440, 0.1);
          setTimeout(resolve, 300);
          break;
          
        case 'turn':
          setSprite(s => ({ ...s, rotation: s.rotation + (Number(block.value) || 15) }));
          playSound(550, 0.1);
          setTimeout(resolve, 300);
          break;
          
        case 'say':
          setSprite(s => ({ ...s, message: String(block.value) || 'Hello!' }));
          playSound(660, 0.1);
          setTimeout(() => {
            setSprite(s => ({ ...s, message: '' }));
            resolve();
          }, 2000);
          break;
          
        case 'change':
          setSprite(s => ({ ...s, scale: Math.max(0.1, s.scale + (Number(block.value) || 10) / 100) }));
          playSound(770, 0.1);
          setTimeout(resolve, 300);
          break;
          
        case 'play':
          if (block.category === 'sound') {
            const note = Number(block.value) || 60;
            playSound(261.63 * Math.pow(2, (note - 60) / 12), 0.5);
          }
          setTimeout(resolve, 500);
          break;
          
        case 'wait':
          setTimeout(resolve, (Number(block.value) || 1) * 1000);
          break;
          
        case 'repeat':
          const times = Number(block.value) || 10;
          for (let i = 0; i < times; i++) {
            if (block.children) {
              for (const child of block.children) {
                await executeBlock(child);
              }
            }
          }
          resolve();
          break;
          
        default:
          setTimeout(resolve, 100);
      }
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
      costume: 0,
    });
  };

  const categories = [
    { name: 'all', label: 'All Blocks', icon: Sparkles, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { name: 'motion', label: 'Motion', icon: ArrowRight, color: 'bg-blue-500' },
    { name: 'looks', label: 'Looks', icon: Star, color: 'bg-purple-500' },
    { name: 'sound', label: 'Sound', icon: Music, color: 'bg-pink-500' },
    { name: 'control', label: 'Control', icon: Zap, color: 'bg-orange-500' },
    { name: 'events', label: 'Events', icon: Circle, color: 'bg-yellow-500' },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? blockTemplates 
    : blockTemplates.filter(b => b.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 z-50 flex items-center justify-center p-4">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-8xl animate-bounce">
            🎉
          </div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Block Coding Playground</h2>
                <p className="text-sm text-white/90">Drag and drop blocks to create amazing programs! 🚀</p>
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
          {/* Left Sidebar - Block Palette */}
          <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-r-4 border-purple-200 overflow-y-auto shrink-0">
            {/* Category Tabs */}
            <div className="p-3 bg-white border-b-2 border-gray-200 sticky top-0 z-10">
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(cat.name);
                    }}
                    className={`p-2 rounded-lg text-xs font-semibold transition-all transform hover:scale-105 ${
                      selectedCategory === cat.name
                        ? `${cat.color} text-white shadow-lg`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <cat.icon className="w-4 h-4 mx-auto mb-1" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Block Templates */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-gray-700 font-semibold">
                  👉 Drag blocks to workspace →
                </p>
              </div>

              {filteredTemplates.map((template, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handlePaletteDragStart(template, e)}
                  onDragEnd={handlePaletteDragEnd}
                  className="cursor-grab active:cursor-grabbing transition-all transform hover:scale-105 hover:shadow-2xl hover:-translate-y-1"
                  style={{ 
                    backgroundColor: template.color,
                    borderRadius: '12px',
                    padding: '14px 18px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '3px solid rgba(255,255,255,0.4)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 opacity-50" />
                    <span className="text-2xl">{template.icon}</span>
                    <span>{template.label}</span>
                  </div>
                  {template.children !== undefined && (
                    <div className="ml-12 mt-2 border-l-4 border-white/40 pl-3 py-2 text-sm bg-black/10 rounded">
                      <span className="opacity-70">blocks go here...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-t-2 border-blue-200 sticky bottom-0">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Quick Tips 💡
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p className="bg-white p-2 rounded-lg shadow-sm border border-blue-200">
                  🎯 <strong>Drag</strong> blocks to workspace
                </p>
                <p className="bg-white p-2 rounded-lg shadow-sm border border-blue-200">
                  🗑️ <strong>Click X</strong> to delete blocks
                </p>
                <p className="bg-white p-2 rounded-lg shadow-sm border border-blue-200">
                  ▶️ <strong>Run Code</strong> to execute!
                </p>
                <p className="bg-white p-2 rounded-lg shadow-sm border border-blue-200">
                  🎨 <strong>Stack vertically</strong> to connect
                </p>
              </div>
            </div>
          </div>

          {/* Middle - Workspace */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 border-b-2 border-purple-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white shadow-md">
                  {blocks.filter(b => b.inWorkspace).length} blocks
                </Badge>
                <Badge className="bg-blue-500 text-white shadow-md">
                  Workspace
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    playClickSound();
                    executeBlocks();
                  }}
                  disabled={isRunning || blocks.filter(b => b.inWorkspace).length === 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg transform hover:scale-105 transition-all"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetSprite}
                  className="border-2 border-blue-400 hover:bg-blue-50 shadow-md"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearWorkspace}
                  className="border-2 border-red-400 hover:bg-red-50 text-red-600 shadow-md"
                  disabled={blocks.filter(b => b.inWorkspace).length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Workspace Area */}
            <div
              ref={workspaceRef}
              onDrop={handleWorkspaceDrop}
              onDragOver={handleWorkspaceDragOver}
              onDragLeave={handleWorkspaceDragLeave}
              className={`flex-1 relative overflow-hidden transition-all ${
                isDraggingOver 
                  ? 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100' 
                  : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
              }`}
              style={{
                backgroundImage: `
                  linear-gradient(rgba(139, 92, 246, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            >
              {/* Drop Zone Indicator */}
              {isDraggingOver && (
                <div className="absolute inset-4 border-4 border-dashed border-purple-500 rounded-2xl bg-purple-200/40 pointer-events-none animate-pulse flex items-center justify-center">
                  <div className="bg-white/90 rounded-2xl p-6 shadow-2xl">
                    <p className="text-2xl font-bold text-purple-600">Drop Here! 🎯</p>
                  </div>
                </div>
              )}

              {/* Help Text */}
              {blocks.filter(b => b.inWorkspace).length === 0 && !isDraggingOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-4 border-purple-200">
                    <div className="text-7xl mb-4 animate-bounce">👈</div>
                    <p className="text-3xl font-bold text-purple-600 mb-2">Drag blocks here!</p>
                    <p className="text-lg text-gray-600">Create your first program by dragging blocks from the left panel</p>
                  </div>
                </div>
              )}

              {/* Blocks in Workspace */}
              {blocks
                .filter(b => b.inWorkspace)
                .map((block) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleBlockDragStart(block.id, e)}
                    onDragEnd={handleBlockDragEnd}
                    className={`absolute cursor-grab active:cursor-grabbing transition-all transform ${
                      draggingBlock === block.id 
                        ? 'scale-110 shadow-2xl z-50 rotate-2 opacity-70' 
                        : 'shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1'
                    }`}
                    style={{
                      left: block.x,
                      top: block.y,
                      backgroundColor: block.color,
                      borderRadius: '12px',
                      padding: '14px 18px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: '3px solid rgba(255,255,255,0.5)',
                      minWidth: '220px',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-4 h-4 opacity-50 cursor-grab" />
                        <span className="text-2xl">{block.icon}</span>
                        <span>{block.label}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(block.id);
                        }}
                        className="w-7 h-7 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {block.children !== undefined && (
                      <div className="ml-12 mt-3 border-l-4 border-white/40 pl-3 py-3 min-h-[50px] text-sm bg-black/10 rounded">
                        <span className="opacity-70 italic">nested blocks...</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Right Panel - Stage */}
          <div className="w-96 bg-gradient-to-b from-gray-900 to-gray-800 border-l-4 border-purple-200 flex flex-col shrink-0">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b-2 border-purple-300">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-bold">Stage</h3>
              </div>
            </div>
            
            {/* Stage Canvas */}
            <div className="flex-1 bg-white m-4 rounded-xl border-4 border-gray-700 relative overflow-hidden shadow-inner">
              {/* Grid background */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(200, 200, 200, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(200, 200, 200, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                }}
              />
              
              {/* Sprite */}
              <div
                className="absolute transition-all duration-300 ease-in-out"
                style={{
                  left: sprite.x,
                  top: sprite.y,
                  transform: `translate(-50%, -50%) rotate(${sprite.rotation}deg) scale(${sprite.scale})`,
                }}
              >
                <div className="relative">
                  {/* Character */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-3xl">
                    🐱
                  </div>
                  
                  {/* Speech bubble */}
                  {sprite.message && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-xl border-2 border-purple-300 whitespace-nowrap animate-bounce">
                      <div className="font-semibold">{sprite.message}</div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-purple-300"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Center marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full opacity-30"></div>
            </div>
            
            {/* Sprite info */}
            <div className="p-4 bg-gray-800 space-y-2 text-white text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Position:</span>
                <span className="font-mono">x: {sprite.x.toFixed(0)}, y: {sprite.y.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rotation:</span>
                <span className="font-mono">{sprite.rotation.toFixed(0)}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Scale:</span>
                <span className="font-mono">{(sprite.scale * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
