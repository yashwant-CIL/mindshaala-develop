import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Zap, Download, RotateCcw, Sparkles, Info,
  Plus, Minus, Circle, Target, CheckCircle2, XCircle,
  Award, ChevronRight, Eye, RefreshCw, Play, Atom as AtomIcon,
  Layers, TrendingUp, Hash
} from 'lucide-react';

interface Electron {
  id: string;
  shell: number;
  angle: number;
  isAnimating?: boolean;
}

interface NucleusParticle {
  type: 'proton' | 'neutron';
  x: number;
  y: number;
}

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  massNumber: number;
  electronConfig: number[]; // electrons per shell
  color: string;
  category: string;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint: string;
  targetElement: string;
  targetProtons: number;
  targetNeutrons: number;
  targetElectrons: number;
}

const SHELL_RADII = [60, 100, 140, 180, 220];
const MAX_ELECTRONS_PER_SHELL = [2, 8, 18, 32, 50];
const NUCLEUS_RADIUS = 35;

export function AtomicStructureEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const answerCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Atom state
  const [protons, setProtons] = useState(6);
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState<Electron[]>([]);
  const [selectedShell, setSelectedShell] = useState<number | null>(null);
  const [draggedElectron, setDraggedElectron] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // UI state
  const [showLabels, setShowLabels] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [viewMode, setViewMode] = useState<'builder' | 'quiz'>('builder');

  // Quiz state
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Periodic table elements (first 20 for now)
  const elements: Element[] = [
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, massNumber: 1, electronConfig: [1], color: '#FF6B6B', category: 'nonmetal' },
    { symbol: 'He', name: 'Helium', atomicNumber: 2, massNumber: 4, electronConfig: [2], color: '#4ECDC4', category: 'noble' },
    { symbol: 'Li', name: 'Lithium', atomicNumber: 3, massNumber: 7, electronConfig: [2, 1], color: '#95E1D3', category: 'alkali' },
    { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, massNumber: 9, electronConfig: [2, 2], color: '#F38181', category: 'alkaline' },
    { symbol: 'B', name: 'Boron', atomicNumber: 5, massNumber: 11, electronConfig: [2, 3], color: '#AA96DA', category: 'metalloid' },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6, massNumber: 12, electronConfig: [2, 4], color: '#2C3E50', category: 'nonmetal' },
    { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, massNumber: 14, electronConfig: [2, 5], color: '#3498DB', category: 'nonmetal' },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8, massNumber: 16, electronConfig: [2, 6], color: '#E74C3C', category: 'nonmetal' },
    { symbol: 'F', name: 'Fluorine', atomicNumber: 9, massNumber: 19, electronConfig: [2, 7], color: '#1ABC9C', category: 'halogen' },
    { symbol: 'Ne', name: 'Neon', atomicNumber: 10, massNumber: 20, electronConfig: [2, 8], color: '#9B59B6', category: 'noble' },
    { symbol: 'Na', name: 'Sodium', atomicNumber: 11, massNumber: 23, electronConfig: [2, 8, 1], color: '#F39C12', category: 'alkali' },
    { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, massNumber: 24, electronConfig: [2, 8, 2], color: '#16A085', category: 'alkaline' },
    { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, massNumber: 27, electronConfig: [2, 8, 3], color: '#7F8C8D', category: 'metal' },
    { symbol: 'Si', name: 'Silicon', atomicNumber: 14, massNumber: 28, electronConfig: [2, 8, 4], color: '#34495E', category: 'metalloid' },
    { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, massNumber: 31, electronConfig: [2, 8, 5], color: '#E67E22', category: 'nonmetal' },
    { symbol: 'S', name: 'Sulfur', atomicNumber: 16, massNumber: 32, electronConfig: [2, 8, 6], color: '#F1C40F', category: 'nonmetal' },
    { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, massNumber: 35, electronConfig: [2, 8, 7], color: '#27AE60', category: 'halogen' },
    { symbol: 'Ar', name: 'Argon', atomicNumber: 18, massNumber: 40, electronConfig: [2, 8, 8], color: '#8E44AD', category: 'noble' },
    { symbol: 'K', name: 'Potassium', atomicNumber: 19, massNumber: 39, electronConfig: [2, 8, 8, 1], color: '#C0392B', category: 'alkali' },
    { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, massNumber: 40, electronConfig: [2, 8, 8, 2], color: '#2ECC71', category: 'alkaline' },
  ];

  const problems: Problem[] = [
    {
      id: 1,
      title: 'Build a Carbon Atom',
      description: 'Create a neutral Carbon atom with the correct number of protons, neutrons, and electrons.',
      difficulty: 'Easy',
      hint: 'Carbon has atomic number 6 and mass number 12',
      targetElement: 'C',
      targetProtons: 6,
      targetNeutrons: 6,
      targetElectrons: 6
    },
    {
      id: 2,
      title: 'Build an Oxygen Atom',
      description: 'Create a neutral Oxygen atom with proper electron configuration.',
      difficulty: 'Easy',
      hint: 'Oxygen has 8 protons and 8 neutrons',
      targetElement: 'O',
      targetProtons: 8,
      targetNeutrons: 8,
      targetElectrons: 8
    },
    {
      id: 3,
      title: 'Build a Sodium Atom',
      description: 'Create a Sodium atom with 3 electron shells.',
      difficulty: 'Medium',
      hint: 'Sodium has 11 protons and 12 neutrons',
      targetElement: 'Na',
      targetProtons: 11,
      targetNeutrons: 12,
      targetElectrons: 11
    },
    {
      id: 4,
      title: 'Build a Neon Atom',
      description: 'Create a Neon atom with a complete outer shell.',
      difficulty: 'Medium',
      hint: 'Neon is a noble gas with 10 protons',
      targetElement: 'Ne',
      targetProtons: 10,
      targetNeutrons: 10,
      targetElectrons: 10
    },
    {
      id: 5,
      title: 'Build a Chlorine Atom',
      description: 'Create a Chlorine atom with 7 electrons in the outer shell.',
      difficulty: 'Hard',
      hint: 'Chlorine has 17 protons and 18 neutrons',
      targetElement: 'Cl',
      targetProtons: 17,
      targetNeutrons: 18,
      targetElectrons: 17
    }
  ];

  const currentProblem = problems[currentProblemIndex];

  // Initialize electrons based on protons
  useEffect(() => {
    const totalElectrons = viewMode === 'quiz' ? 0 : protons;
    distributeElectrons(totalElectrons);
  }, [protons, viewMode]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setElectrons(prev => prev.map(e => ({
        ...e,
        angle: e.angle + (rotationSpeed * 0.02)
      })));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (rotationSpeed > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotationSpeed]);

  // Draw canvas
  useEffect(() => {
    draw();
  }, [electrons, protons, neutrons, showLabels, showOrbits, selectedShell]);

  // Draw answer canvas when shown
  useEffect(() => {
    if (showAnswer && answerCanvasRef.current) {
      drawAnswerStructure();
    }
  }, [showAnswer, currentProblemIndex]);

  const distributeElectrons = (total: number) => {
    const newElectrons: Electron[] = [];
    let remaining = total;
    let shellIndex = 0;

    while (remaining > 0 && shellIndex < MAX_ELECTRONS_PER_SHELL.length) {
      const maxInShell = MAX_ELECTRONS_PER_SHELL[shellIndex];
      const electronsInShell = Math.min(remaining, maxInShell);
      
      for (let i = 0; i < electronsInShell; i++) {
        newElectrons.push({
          id: `e-${shellIndex}-${i}-${Date.now()}`,
          shell: shellIndex,
          angle: (i / electronsInShell) * Math.PI * 2
        });
      }
      
      remaining -= electronsInShell;
      shellIndex++;
    }

    setElectrons(newElectrons);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw electron shells (orbits)
    if (showOrbits) {
      SHELL_RADII.forEach((radius, index) => {
        const isSelected = selectedShell === index;
        ctx.strokeStyle = isSelected ? '#3B82F6' : '#E5E7EB';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.setLineDash(isSelected ? [] : [5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Shell labels
        if (showLabels) {
          ctx.fillStyle = '#6B7280';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Shell ${index + 1}`, centerX + radius + 25, centerY);
        }
      });
    }

    // Draw nucleus
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, NUCLEUS_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw protons and neutrons in nucleus
    const totalNucleons = protons + neutrons;
    const particleRadius = 5;
    const nucleusParticles: NucleusParticle[] = [];

    // Arrange particles in a grid pattern within nucleus
    const particlesPerRow = Math.ceil(Math.sqrt(totalNucleons));
    const spacing = (NUCLEUS_RADIUS * 1.6) / particlesPerRow;

    let particleIndex = 0;
    for (let row = 0; row < particlesPerRow; row++) {
      for (let col = 0; col < particlesPerRow; col++) {
        if (particleIndex >= totalNucleons) break;
        
        const x = centerX - (particlesPerRow * spacing) / 2 + col * spacing;
        const y = centerY - (particlesPerRow * spacing) / 2 + row * spacing;
        
        // Distance from center check
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distFromCenter < NUCLEUS_RADIUS - 5) {
          nucleusParticles.push({
            type: particleIndex < protons ? 'proton' : 'neutron',
            x,
            y
          });
          particleIndex++;
        }
      }
    }

    nucleusParticles.forEach(particle => {
      ctx.fillStyle = particle.type === 'proton' ? '#EF4444' : '#6B7280';
      ctx.strokeStyle = particle.type === 'proton' ? '#DC2626' : '#4B5563';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Nucleus label
    if (showLabels) {
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${protons}p⁺ ${neutrons}n⁰`, centerX, centerY);
    }

    // Draw electrons
    electrons.forEach(electron => {
      const radius = SHELL_RADII[electron.shell];
      const x = centerX + radius * Math.cos(electron.angle);
      const y = centerY + radius * Math.sin(electron.angle);

      // Electron glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(0.5, '#60A5FA');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Electron core
      ctx.fillStyle = '#1E40AF';
      ctx.strokeStyle = '#DBEAFE';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Electron label
      if (showLabels) {
        ctx.fillStyle = '#1E3A8A';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('e⁻', x, y - 12);
      }
    });

    // Element info overlay
    if (selectedElement) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = selectedElement.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(20, 20, 140, 100, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = selectedElement.color;
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(selectedElement.symbol, 35, 55);

      ctx.font = 'bold 14px Arial';
      ctx.fillText(selectedElement.name, 35, 75);

      ctx.fillStyle = '#4B5563';
      ctx.font = '11px Arial';
      ctx.fillText(`Atomic #: ${selectedElement.atomicNumber}`, 35, 92);
      ctx.fillText(`Mass: ${selectedElement.massNumber}`, 35, 106);
    }
  };

  const drawAnswerStructure = () => {
    const canvas = answerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw electron shells (orbits)
    if (showOrbits) {
      SHELL_RADII.forEach((radius, index) => {
        const isSelected = selectedShell === index;
        ctx.strokeStyle = isSelected ? '#3B82F6' : '#E5E7EB';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.setLineDash(isSelected ? [] : [5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Shell labels
        if (showLabels) {
          ctx.fillStyle = '#6B7280';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Shell ${index + 1}`, centerX + radius + 25, centerY);
        }
      });
    }

    // Draw nucleus
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, NUCLEUS_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw protons and neutrons in nucleus
    const totalNucleons = currentProblem.targetProtons + currentProblem.targetNeutrons;
    const particleRadius = 5;
    const nucleusParticles: NucleusParticle[] = [];

    // Arrange particles in a grid pattern within nucleus
    const particlesPerRow = Math.ceil(Math.sqrt(totalNucleons));
    const spacing = (NUCLEUS_RADIUS * 1.6) / particlesPerRow;

    let particleIndex = 0;
    for (let row = 0; row < particlesPerRow; row++) {
      for (let col = 0; col < particlesPerRow; col++) {
        if (particleIndex >= totalNucleons) break;
        
        const x = centerX - (particlesPerRow * spacing) / 2 + col * spacing;
        const y = centerY - (particlesPerRow * spacing) / 2 + row * spacing;
        
        // Distance from center check
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distFromCenter < NUCLEUS_RADIUS - 5) {
          nucleusParticles.push({
            type: particleIndex < currentProblem.targetProtons ? 'proton' : 'neutron',
            x,
            y
          });
          particleIndex++;
        }
      }
    }

    nucleusParticles.forEach(particle => {
      ctx.fillStyle = particle.type === 'proton' ? '#EF4444' : '#6B7280';
      ctx.strokeStyle = particle.type === 'proton' ? '#DC2626' : '#4B5563';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Nucleus label
    if (showLabels) {
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentProblem.targetProtons}p⁺ ${currentProblem.targetNeutrons}n⁰`, centerX, centerY);
    }

    // Draw electrons
    const answerElectrons: Electron[] = [];
    let remainingElectrons = currentProblem.targetElectrons;
    let shellIndex = 0;

    while (remainingElectrons > 0 && shellIndex < MAX_ELECTRONS_PER_SHELL.length) {
      const maxInShell = MAX_ELECTRONS_PER_SHELL[shellIndex];
      const electronsInShell = Math.min(remainingElectrons, maxInShell);
      
      for (let i = 0; i < electronsInShell; i++) {
        answerElectrons.push({
          id: `e-${shellIndex}-${i}-${Date.now()}`,
          shell: shellIndex,
          angle: (i / electronsInShell) * Math.PI * 2
        });
      }
      
      remainingElectrons -= electronsInShell;
      shellIndex++;
    }

    answerElectrons.forEach(electron => {
      const radius = SHELL_RADII[electron.shell];
      const x = centerX + radius * Math.cos(electron.angle);
      const y = centerY + radius * Math.sin(electron.angle);

      // Electron glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(0.5, '#60A5FA');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Electron core
      ctx.fillStyle = '#1E40AF';
      ctx.strokeStyle = '#DBEAFE';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Electron label
      if (showLabels) {
        ctx.fillStyle = '#1E3A8A';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('e⁻', x, y - 12);
      }
    });

    // Element info overlay
    const element = elements.find(e => e.symbol === currentProblem.targetElement);
    if (element) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = element.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(20, 20, 140, 100, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = element.color;
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(element.symbol, 35, 55);

      ctx.font = 'bold 14px Arial';
      ctx.fillText(element.name, 35, 75);

      ctx.fillStyle = '#4B5563';
      ctx.font = '11px Arial';
      ctx.fillText(`Atomic #: ${element.atomicNumber}`, 35, 92);
      ctx.fillText(`Mass: ${element.massNumber}`, 35, 106);
    }
  };

  const quickBuildElement = (element: Element) => {
    setSelectedElement(element);
    setProtons(element.atomicNumber);
    setNeutrons(element.massNumber - element.atomicNumber);
    distributeElectrons(element.atomicNumber);
    setIsAnimating(true);
  };

  const addElectron = () => {
    const totalElectrons = electrons.length;
    let targetShell = 0;

    // Find the shell to add electron to
    for (let i = 0; i < MAX_ELECTRONS_PER_SHELL.length; i++) {
      const electronsInShell = electrons.filter(e => e.shell === i).length;
      if (electronsInShell < MAX_ELECTRONS_PER_SHELL[i]) {
        targetShell = i;
        break;
      }
    }

    const electronsInTargetShell = electrons.filter(e => e.shell === targetShell).length;
    const newElectron: Electron = {
      id: `e-${Date.now()}`,
      shell: targetShell,
      angle: (electronsInTargetShell / (electronsInTargetShell + 1)) * Math.PI * 2
    };

    setElectrons([...electrons, newElectron]);
  };

  const removeElectron = () => {
    if (electrons.length > 0) {
      setElectrons(electrons.slice(0, -1));
    }
  };

  const resetAtom = () => {
    setProtons(6);
    setNeutrons(6);
    distributeElectrons(6);
    setSelectedElement(null);
  };

  const handleSubmitQuiz = () => {
    const correctProtons = protons === currentProblem.targetProtons;
    const correctNeutrons = neutrons === currentProblem.targetNeutrons;
    const correctElectrons = electrons.length === currentProblem.targetElectrons;

    const totalScore = (correctProtons ? 33 : 0) + (correctNeutrons ? 33 : 0) + (correctElectrons ? 34 : 0);
    setScore(totalScore);
    setIsSubmitted(true);
    setShowAnswer(true);
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setProtons(0);
      setNeutrons(0);
      setElectrons([]);
      setIsSubmitted(false);
      setShowAnswer(false);
      setScore(null);
    }
  };

  const handleTryAgain = () => {
    setProtons(0);
    setNeutrons(0);
    setElectrons([]);
    setIsSubmitted(false);
    setShowAnswer(false);
    setScore(null);
  };

  const getElectronConfiguration = () => {
    const config: number[] = [];
    SHELL_RADII.forEach((_, index) => {
      const count = electrons.filter(e => e.shell === index).length;
      if (count > 0) config.push(count);
    });
    return config.join(', ');
  };

  const getValenceElectrons = () => {
    const outerShell = Math.max(...electrons.map(e => e.shell), 0);
    return electrons.filter(e => e.shell === outerShell).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-3 shadow-lg">
        <div className=" mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="border-l border-white/30 pl-3 flex items-center gap-2">
              <AtomIcon className="w-5 h-5" />
              <div>
                <h1 className="text-base font-bold">Atomic Structure Editor</h1>
                <p className="text-[10px] text-white/70">Build atoms with protons, neutrons & electrons</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('builder')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'builder' 
                  ? 'bg-white text-indigo-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              🔨 Builder Mode
            </button>
            <button
              onClick={() => setViewMode('quiz')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'quiz' 
                  ? 'bg-white text-indigo-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              🎯 Quiz Mode
            </button>
          </div>
        </div>
      </div>

      <div className=" mx-auto p-4">
        {/* Quiz Problem Header */}
        {viewMode === 'quiz' && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg shadow-lg p-4 mb-4 border-2 border-indigo-400">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Problem {currentProblemIndex + 1} of {problems.length}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    currentProblem.difficulty === 'Easy' ? 'bg-green-500' :
                    currentProblem.difficulty === 'Medium' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {currentProblem.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{currentProblem.title}</h3>
                <p className="text-white/90 text-sm">{currentProblem.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/75">
                  <Info className="w-3.5 h-3.5" />
                  <span><strong>Hint:</strong> {currentProblem.hint}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={protons === 0}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Answer
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleTryAgain}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                    {currentProblemIndex < problems.length - 1 && (
                      <button
                        onClick={handleNextProblem}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
                      >
                        Next Problem
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {/* Left Sidebar - Controls */}
          <div className="w-72 space-y-3">
            {/* Quick Element Picker */}
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Build
                </h3>
                <div className="grid grid-cols-5 gap-1.5 max-h-80 overflow-y-auto">
                  {elements.map(element => (
                    <button
                      key={element.symbol}
                      onClick={() => quickBuildElement(element)}
                      title={element.name}
                      className="p-2 rounded-lg text-xs font-bold transition-all hover:scale-110 hover:shadow-lg"
                      style={{
                        backgroundColor: `${element.color}20`,
                        color: element.color,
                        border: `2px solid ${element.color}`,
                      }}
                    >
                      {element.symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nucleus Controls */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                <Circle className="w-3.5 h-3.5" />
                Nucleus
              </h3>
              <div className="space-y-2">
                {/* Protons */}
                <div>
                  <label className="text-xs font-semibold text-red-600 flex items-center justify-between mb-1">
                    <span>Protons (p⁺)</span>
                    <span className="text-lg">{protons}</span>
                  </label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setProtons(Math.max(0, protons - 1))}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-bold"
                    >
                      <Minus className="w-3 h-3 mx-auto" />
                    </button>
                    <button
                      onClick={() => setProtons(Math.min(20, protons + 1))}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-bold"
                    >
                      <Plus className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Neutrons */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 flex items-center justify-between mb-1">
                    <span>Neutrons (n⁰)</span>
                    <span className="text-lg">{neutrons}</span>
                  </label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setNeutrons(Math.max(0, neutrons - 1))}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold"
                    >
                      <Minus className="w-3 h-3 mx-auto" />
                    </button>
                    <button
                      onClick={() => setNeutrons(Math.min(25, neutrons + 1))}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold"
                    >
                      <Plus className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Electron Controls */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Electrons
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600">Total Electrons</span>
                  <span className="text-xl font-bold text-blue-600">{electrons.length}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={removeElectron}
                    disabled={electrons.length === 0}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-700 px-2 py-1.5 rounded text-xs font-bold"
                  >
                    <Minus className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={addElectron}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1.5 rounded text-xs font-bold"
                  >
                    <Plus className="w-3 h-3 mx-auto" />
                  </button>
                </div>
                {viewMode === 'builder' && (
                  <button
                    onClick={() => distributeElectrons(protons)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Auto-Fill (Match Protons)
                  </button>
                )}
              </div>
            </div>

            {/* Display Controls */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <h3 className="text-xs uppercase text-gray-500 mb-2">Display Options</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-xs">Show Labels</span>
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-xs">Show Orbits</span>
                  <input
                    type="checkbox"
                    checked={showOrbits}
                    onChange={(e) => setShowOrbits(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>
                <div>
                  <label className="text-xs font-semibold mb-1 block">
                    Rotation Speed: {rotationSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2">Actions</h3>
                <div className="space-y-1">
                  <button
                    onClick={resetAtom}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center - Canvas */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <canvas
                ref={canvasRef}
                width={800}
                height={700}
                className="w-full border-2 border-gray-300 rounded-lg"
              />

              {/* Instructions */}
              <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700">
                    <div className="font-semibold text-blue-900 mb-1">How to Use:</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>🔴 <strong>Protons:</strong> Define the element</div>
                      <div>⚪ <strong>Neutrons:</strong> Define isotopes</div>
                      <div>🔵 <strong>Electrons:</strong> Equal to protons for neutral atoms</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Info */}
          <div className="w-72 space-y-3">
            {/* Atom Properties */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow-md p-3 border-2 border-purple-300">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Atom Properties
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between bg-white/20 rounded px-2 py-1">
                  <span>Atomic Number:</span>
                  <span className="font-bold">{protons}</span>
                </div>
                <div className="flex justify-between bg-white/20 rounded px-2 py-1">
                  <span>Mass Number:</span>
                  <span className="font-bold">{protons + neutrons}</span>
                </div>
                <div className="flex justify-between bg-white/20 rounded px-2 py-1">
                  <span>Net Charge:</span>
                  <span className="font-bold">{protons - electrons.length > 0 ? '+' : ''}{protons - electrons.length}</span>
                </div>
                <div className="flex justify-between bg-white/20 rounded px-2 py-1">
                  <span>Valence e⁻:</span>
                  <span className="font-bold">{getValenceElectrons()}</span>
                </div>
              </div>
            </div>

            {/* Electron Configuration */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Electron Configuration
              </h3>
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                <div className="font-mono text-sm text-blue-900 text-center">
                  {getElectronConfiguration() || 'No electrons'}
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {SHELL_RADII.map((_, index) => {
                  const count = electrons.filter(e => e.shell === index).length;
                  const max = MAX_ELECTRONS_PER_SHELL[index];
                  if (count === 0) return null;
                  return (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between mb-0.5">
                        <span className="font-semibold">Shell {index + 1}:</span>
                        <span className="text-blue-600 font-bold">{count}/{max}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Element Identity */}
            {selectedElement && viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border-2 border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2">Current Element</h3>
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: `${selectedElement.color}15`, borderColor: selectedElement.color, borderWidth: '2px' }}
                >
                  <div className="text-4xl font-bold" style={{ color: selectedElement.color }}>
                    {selectedElement.symbol}
                  </div>
                  <div className="text-sm font-bold mt-1" style={{ color: selectedElement.color }}>
                    {selectedElement.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <div>Atomic #: {selectedElement.atomicNumber}</div>
                    <div>Mass: {selectedElement.massNumber}</div>
                    <div className="capitalize mt-1 text-[10px] bg-white/50 rounded px-2 py-0.5">
                      {selectedElement.category}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Reference */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
              <h3 className="text-xs uppercase text-yellow-800 font-bold mb-2">Quick Reference</h3>
              <div className="text-[10px] text-gray-700 space-y-1">
                <div>🔴 <strong>Protons</strong> = Atomic Number</div>
                <div>⚪ <strong>Neutrons</strong> = Mass - Atomic #</div>
                <div>🔵 <strong>Electrons</strong> = Protons (neutral)</div>
                <div className="pt-1 border-t border-yellow-300">
                  <strong>Max per shell:</strong> 2, 8, 18, 32...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Answer Comparison */}
      {viewMode === 'quiz' && showAnswer && score !== null && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border-2 z-50 overflow-hidden">
          <div className={`p-4 text-white ${score === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {score === 100 ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {score === 100 ? '🎉 Perfect!' : '❌ Not Quite'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {score === 100 ? 'Your atom is correct!' : 'Check your atom structure'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAnswer(false)}
                className="text-white/80 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{score}%</div>
                <div className="text-xs text-gray-600">Your Score</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`flex items-center justify-between p-2 rounded-lg ${protons === currentProblem.targetProtons ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-sm font-semibold flex items-center gap-2">
                  {protons === currentProblem.targetProtons ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  Protons
                </span>
                <span className={`text-xs font-bold ${protons === currentProblem.targetProtons ? 'text-green-700' : 'text-red-700'}`}>
                  {protons} / {currentProblem.targetProtons}
                </span>
              </div>

              <div className={`flex items-center justify-between p-2 rounded-lg ${neutrons === currentProblem.targetNeutrons ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-sm font-semibold flex items-center gap-2">
                  {neutrons === currentProblem.targetNeutrons ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  Neutrons
                </span>
                <span className={`text-xs font-bold ${neutrons === currentProblem.targetNeutrons ? 'text-green-700' : 'text-red-700'}`}>
                  {neutrons} / {currentProblem.targetNeutrons}
                </span>
              </div>

              <div className={`flex items-center justify-between p-2 rounded-lg ${electrons.length === currentProblem.targetElectrons ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-sm font-semibold flex items-center gap-2">
                  {electrons.length === currentProblem.targetElectrons ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  Electrons
                </span>
                <span className={`text-xs font-bold ${electrons.length === currentProblem.targetElectrons ? 'text-green-700' : 'text-red-700'}`}>
                  {electrons.length} / {currentProblem.targetElectrons}
                </span>
              </div>
            </div>

            {score < 100 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-yellow-800 mb-1">Hint</div>
                    <div className="text-xs text-yellow-700">{currentProblem.hint}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Correct Answer Visual */}
            <div className="mt-3 border-t border-purple-200 pt-3">
              <div className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Correct Atomic Structure
              </div>
              <div className="bg-white rounded-lg border-2 border-purple-300 p-2">
                <canvas
                  ref={answerCanvasRef}
                  width={320}
                  height={280}
                  className="w-full rounded"
                />
              </div>
              <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded p-2 text-[10px] text-gray-700">
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <div className="font-bold text-red-600">{currentProblem.targetProtons}</div>
                    <div>Protons</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-600">{currentProblem.targetNeutrons}</div>
                    <div>Neutrons</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">{currentProblem.targetElectrons}</div>
                    <div>Electrons</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}