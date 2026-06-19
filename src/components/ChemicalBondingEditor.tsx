import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Zap, Share2, Link2, Atom, Info,
  CheckCircle2, XCircle, Award, ChevronRight, Eye,
  RefreshCw, Target, Sparkles, TrendingUp, Layers,
  Play, Pause, RotateCw, RotateCcw, Download, Lightbulb, ArrowRight
} from 'lucide-react';

interface Atom {
  id: string;
  symbol: string;
  name: string;
  atomicNumber: number;
  valenceElectrons: number;
  electronegativity: number;
  x: number;
  y: number;
  color: string;
  electrons: ElectronDot[];
}

interface ElectronDot {
  id: string;
  angle: number;
  isPaired: boolean;
  isShared: boolean;
  bondId?: string;
}

interface Bond {
  id: string;
  atom1Id: string;
  atom2Id: string;
  type: 'single' | 'double' | 'triple';
  bondType: 'covalent' | 'ionic' | 'polar';
  sharedElectrons: number;
  polarity: number;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint: string;
  atoms: { symbol: string; count: number }[];
  targetBondType: 'covalent' | 'ionic' | 'polar';
  targetFormula: string;
  targetBonds: number;
}

const ELEMENT_DATA = {
  'H': { name: 'Hydrogen', atomicNumber: 1, valence: 1, electronegativity: 2.20, color: '#FF6B6B' },
  'C': { name: 'Carbon', atomicNumber: 6, valence: 4, electronegativity: 2.55, color: '#2C3E50' },
  'N': { name: 'Nitrogen', atomicNumber: 7, valence: 5, electronegativity: 3.04, color: '#3498DB' },
  'O': { name: 'Oxygen', atomicNumber: 8, valence: 6, electronegativity: 3.44, color: '#E74C3C' },
  'F': { name: 'Fluorine', atomicNumber: 9, valence: 7, electronegativity: 3.98, color: '#1ABC9C' },
  'Cl': { name: 'Chlorine', atomicNumber: 17, valence: 7, electronegativity: 3.16, color: '#27AE60' },
  'Na': { name: 'Sodium', atomicNumber: 11, valence: 1, electronegativity: 0.93, color: '#F39C12' },
  'Mg': { name: 'Magnesium', atomicNumber: 12, valence: 2, electronegativity: 1.31, color: '#16A085' },
  'S': { name: 'Sulfur', atomicNumber: 16, valence: 6, electronegativity: 2.58, color: '#F1C40F' },
  'P': { name: 'Phosphorus', atomicNumber: 15, valence: 5, electronegativity: 2.19, color: '#E67E22' },
};

export function ChemicalBondingEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const answerCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // State
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);
  const [hoveredAtom, setHoveredAtom] = useState<string | null>(null);
  const [bondingMode, setBondingMode] = useState<'single' | 'double' | 'triple'>('single');
  const [viewMode, setViewMode] = useState<'builder' | 'quiz'>('builder');
  const [showElectrons, setShowElectrons] = useState(true);
  const [showPolarity, setShowPolarity] = useState(true);
  const [animateTransfer, setAnimateTransfer] = useState(false);

  // Drag state
  const [draggingAtom, setDraggingAtom] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Quiz state
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const problems: Problem[] = [
    {
      id: 1,
      title: 'Water Molecule (H₂O)',
      description: 'Create a water molecule by bonding 2 hydrogen atoms with 1 oxygen atom.',
      difficulty: 'Easy',
      hint: 'Oxygen needs 2 bonds to complete its octet. Each hydrogen needs 1 bond.',
      atoms: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }],
      targetBondType: 'polar',
      targetFormula: 'H2O',
      targetBonds: 2
    },
    {
      id: 2,
      title: 'Methane (CH₄)',
      description: 'Build a methane molecule with carbon at the center bonded to 4 hydrogens.',
      difficulty: 'Easy',
      hint: 'Carbon forms 4 single bonds in methane.',
      atoms: [{ symbol: 'C', count: 1 }, { symbol: 'H', count: 4 }],
      targetBondType: 'covalent',
      targetFormula: 'CH4',
      targetBonds: 4
    },
    {
      id: 3,
      title: 'Sodium Chloride (NaCl)',
      description: 'Create an ionic bond between sodium and chlorine atoms.',
      difficulty: 'Medium',
      hint: 'Sodium loses 1 electron, chlorine gains 1 electron. This is an ionic bond.',
      atoms: [{ symbol: 'Na', count: 1 }, { symbol: 'Cl', count: 1 }],
      targetBondType: 'ionic',
      targetFormula: 'NaCl',
      targetBonds: 1
    },
    {
      id: 4,
      title: 'Oxygen Molecule (O₂)',
      description: 'Form a double bond between two oxygen atoms.',
      difficulty: 'Medium',
      hint: 'Each oxygen needs 2 more electrons. They share 4 electrons (2 pairs).',
      atoms: [{ symbol: 'O', count: 2 }],
      targetBondType: 'covalent',
      targetFormula: 'O2',
      targetBonds: 1
    },
    {
      id: 5,
      title: 'Nitrogen Molecule (N₂)',
      description: 'Create a triple bond between two nitrogen atoms.',
      difficulty: 'Hard',
      hint: 'Nitrogen needs 3 more electrons to complete its octet. Triple bond required.',
      atoms: [{ symbol: 'N', count: 2 }],
      targetBondType: 'covalent',
      targetFormula: 'N2',
      targetBonds: 1
    }
  ];

  const currentProblem = problems[currentProblemIndex];

  // Initialize atoms for quiz mode
  useEffect(() => {
    if (viewMode === 'quiz') {
      resetForQuiz();
    }
  }, [viewMode, currentProblemIndex]);

  // Draw canvas
  useEffect(() => {
    draw();
  }, [atoms, bonds, selectedAtom, hoveredAtom, showElectrons, showPolarity]);

  // Draw answer canvas
  useEffect(() => {
    if (showAnswer && answerCanvasRef.current) {
      drawAnswerStructure();
    }
  }, [showAnswer, currentProblemIndex]);

  const resetForQuiz = () => {
    const newAtoms: Atom[] = [];
    let xOffset = 200;
    const yCenter = 250;

    currentProblem.atoms.forEach((atomType, typeIndex) => {
      for (let i = 0; i < atomType.count; i++) {
        const element = ELEMENT_DATA[atomType.symbol as keyof typeof ELEMENT_DATA];
        const atom = createAtom(
          atomType.symbol,
          xOffset + (typeIndex * 150) + (i * 80),
          yCenter + (i % 2 === 0 ? -40 : 40)
        );
        newAtoms.push(atom);
      }
    });

    setAtoms(newAtoms);
    setBonds([]);
    setSelectedAtom(null);
    setIsSubmitted(false);
    setShowAnswer(false);
    setScore(null);
  };

  const createAtom = (symbol: string, x: number, y: number): Atom => {
    const element = ELEMENT_DATA[symbol as keyof typeof ELEMENT_DATA];
    const electrons: ElectronDot[] = [];
    
    // Create valence electrons as dots (Lewis structure)
    for (let i = 0; i < element.valence; i++) {
      electrons.push({
        id: `e-${Date.now()}-${i}`,
        angle: (i * 45),
        isPaired: i < (element.valence - 4) || (i >= 4 && i < element.valence),
        isShared: false
      });
    }

    return {
      id: `atom-${Date.now()}-${Math.random()}`,
      symbol,
      name: element.name,
      atomicNumber: element.atomicNumber,
      valenceElectrons: element.valence,
      electronegativity: element.electronegativity,
      x,
      y,
      color: element.color,
      electrons
    };
  };

  const addAtom = (symbol: string) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = 150 + atoms.length * 100;
    const y = 300;
    const newAtom = createAtom(symbol, x, y);
    setAtoms([...atoms, newAtom]);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle bonding if not dragging
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicked on an atom
    const clickedAtom = atoms.find(atom => {
      const distance = Math.sqrt((atom.x - x) ** 2 + (atom.y - y) ** 2);
      return distance < 40;
    });

    if (clickedAtom) {
      if (!selectedAtom) {
        // First atom selected
        setSelectedAtom(clickedAtom.id);
      } else if (selectedAtom === clickedAtom.id) {
        // Deselect
        setSelectedAtom(null);
      } else {
        // Create bond between selected and clicked
        createBond(selectedAtom, clickedAtom.id);
        setSelectedAtom(null);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicked on an atom
    const clickedAtom = atoms.find(atom => {
      const distance = Math.sqrt((atom.x - x) ** 2 + (atom.y - y) ** 2);
      return distance < 40;
    });

    if (clickedAtom) {
      setDraggingAtom(clickedAtom.id);
      setDragOffset({
        x: x - clickedAtom.x,
        y: y - clickedAtom.y
      });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingAtom && !isDragging) {
      // This was a click, not a drag - handle bonding
      handleCanvasClick(e);
    }

    setDraggingAtom(null);
    setIsDragging(false);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Handle dragging
    if (draggingAtom) {
      setIsDragging(true);
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;

      // Constrain to canvas bounds
      const constrainedX = Math.max(50, Math.min(canvas.width - 50, newX));
      const constrainedY = Math.max(50, Math.min(canvas.height - 50, newY));

      setAtoms(atoms.map(atom => 
        atom.id === draggingAtom 
          ? { ...atom, x: constrainedX, y: constrainedY }
          : atom
      ));
      return;
    }

    // Check if hovering over an atom
    const hoveredAtom = atoms.find(atom => {
      const distance = Math.sqrt((atom.x - x) ** 2 + (atom.y - y) ** 2);
      return distance < 40;
    });

    setHoveredAtom(hoveredAtom?.id || null);
  };

  const createBond = (atom1Id: string, atom2Id: string) => {
    const atom1 = atoms.find(a => a.id === atom1Id);
    const atom2 = atoms.find(a => a.id === atom2Id);
    if (!atom1 || !atom2) return;

    // Check if bond already exists
    const existingBond = bonds.find(
      b => (b.atom1Id === atom1Id && b.atom2Id === atom2Id) ||
           (b.atom1Id === atom2Id && b.atom2Id === atom1Id)
    );

    if (existingBond) {
      // Upgrade bond type
      if (existingBond.type === 'single') {
        setBonds(bonds.map(b => b.id === existingBond.id ? { ...b, type: 'double' as const, sharedElectrons: 4 } : b));
      } else if (existingBond.type === 'double') {
        setBonds(bonds.map(b => b.id === existingBond.id ? { ...b, type: 'triple' as const, sharedElectrons: 6 } : b));
      }
      return;
    }

    // Calculate bond type based on electronegativity difference
    const enDiff = Math.abs(atom1.electronegativity - atom2.electronegativity);
    let bondType: 'covalent' | 'ionic' | 'polar';
    
    if (enDiff > 1.7) {
      bondType = 'ionic';
    } else if (enDiff > 0.4) {
      bondType = 'polar';
    } else {
      bondType = 'covalent';
    }

    const newBond: Bond = {
      id: `bond-${Date.now()}`,
      atom1Id,
      atom2Id,
      type: bondingMode,
      bondType,
      sharedElectrons: bondingMode === 'single' ? 2 : bondingMode === 'double' ? 4 : 6,
      polarity: enDiff
    };

    setBonds([...bonds, newBond]);
  };

  const deleteBond = (bondId: string) => {
    setBonds(bonds.filter(b => b.id !== bondId));
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bonds
    bonds.forEach(bond => {
      const atom1 = atoms.find(a => a.id === bond.atom1Id);
      const atom2 = atoms.find(a => a.id === bond.atom2Id);
      if (!atom1 || !atom2) return;

      drawBond(ctx, atom1, atom2, bond);
    });

    // Draw atoms
    atoms.forEach(atom => {
      drawAtom(ctx, atom);
    });

    // Draw bond preview
    if (selectedAtom) {
      const atom = atoms.find(a => a.id === selectedAtom);
      if (atom) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  };

  const drawAtom = (ctx: CanvasRenderingContext2D, atom: Atom) => {
    const isSelected = selectedAtom === atom.id;
    const isHovered = hoveredAtom === atom.id;

    // Glow effect
    if (isSelected || isHovered) {
      const gradient = ctx.createRadialGradient(atom.x, atom.y, 0, atom.x, atom.y, 60);
      gradient.addColorStop(0, `${atom.color}40`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(atom.x - 60, atom.y - 60, 120, 120);
    }

    // Atom circle
    ctx.fillStyle = `${atom.color}20`;
    ctx.strokeStyle = atom.color;
    ctx.lineWidth = isSelected ? 4 : 3;
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Symbol
    ctx.fillStyle = atom.color;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(atom.symbol, atom.x, atom.y);

    // Draw Lewis dot electrons
    if (showElectrons) {
      const unsharedElectrons = atom.electrons.filter(e => !e.isShared);
      const dotPositions = [
        { x: atom.x + 45, y: atom.y },      // right
        { x: atom.x, y: atom.y - 45 },      // top
        { x: atom.x - 45, y: atom.y },      // left
        { x: atom.x, y: atom.y + 45 },      // bottom
        { x: atom.x + 35, y: atom.y - 35 }, // top-right
        { x: atom.x - 35, y: atom.y - 35 }, // top-left
        { x: atom.x - 35, y: atom.y + 35 }, // bottom-left
        { x: atom.x + 35, y: atom.y + 35 }, // bottom-right
      ];

      unsharedElectrons.forEach((electron, index) => {
        if (index < dotPositions.length) {
          const pos = dotPositions[index];
          ctx.fillStyle = '#1E40AF';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Electronegativity label
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px Arial';
    ctx.fillText(`EN: ${atom.electronegativity}`, atom.x, atom.y + 55);
  };

  const drawBond = (ctx: CanvasRenderingContext2D, atom1: Atom, atom2: Atom, bond: Bond) => {
    const dx = atom2.x - atom1.x;
    const dy = atom2.y - atom1.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Start and end points (adjusted for atom radius)
    const startX = atom1.x + 35 * Math.cos(angle);
    const startY = atom1.y + 35 * Math.sin(angle);
    const endX = atom2.x - 35 * Math.cos(angle);
    const endY = atom2.y - 35 * Math.sin(angle);

    // Bond color based on type
    let bondColor = '#2563EB';
    if (bond.bondType === 'ionic') {
      bondColor = '#DC2626';
    } else if (bond.bondType === 'polar') {
      bondColor = '#F59E0B';
    }

    ctx.strokeStyle = bondColor;
    ctx.lineWidth = 4;

    if (bond.type === 'single') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (bond.type === 'double') {
      const perpX = -Math.sin(angle) * 5;
      const perpY = Math.cos(angle) * 5;
      
      ctx.beginPath();
      ctx.moveTo(startX + perpX, startY + perpY);
      ctx.lineTo(endX + perpX, endY + perpY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX - perpX, startY - perpY);
      ctx.lineTo(endX - perpX, endY - perpY);
      ctx.stroke();
    } else if (bond.type === 'triple') {
      const perpX = -Math.sin(angle) * 6;
      const perpY = Math.cos(angle) * 6;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX + perpX, startY + perpY);
      ctx.lineTo(endX + perpX, endY + perpY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX - perpX, startY - perpY);
      ctx.lineTo(endX - perpX, endY - perpY);
      ctx.stroke();
    }

    // Polarity arrow
    if (showPolarity && bond.bondType === 'polar') {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Determine direction (toward more electronegative)
      const direction = atom2.electronegativity > atom1.electronegativity ? 1 : -1;
      
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('δ−', direction > 0 ? endX : startX, direction > 0 ? endY - 15 : startY - 15);
      ctx.fillText('δ+', direction > 0 ? startX : endX, direction > 0 ? startY - 15 : endY - 15);
    }

    // Ionic transfer indicator
    if (bond.bondType === 'ionic') {
      const midX = (atom1.x + atom2.x) / 2;
      const midY = (atom1.y + atom2.y) / 2;
      
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ e⁻', midX, midY - 10);
    }

    // Bond label
    const midX = (atom1.x + atom2.x) / 2;
    const midY = (atom1.y + atom2.y) / 2;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = bondColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(midX, midY + 20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = bondColor;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bond.type[0].toUpperCase(), midX, midY + 20);
  };

  const drawAnswerStructure = () => {
    const canvas = answerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw answer based on problem
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Correct: ${currentProblem.targetFormula}`, canvas.width / 2, 30);
    ctx.font = '12px Arial';
    ctx.fillText(`${currentProblem.targetBonds} ${currentProblem.targetBondType} bond(s)`, canvas.width / 2, 50);

    // Draw simplified molecular structure
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 20;

    // Example: Draw for H2O
    if (currentProblem.targetFormula === 'H2O') {
      // Oxygen
      drawAnswerAtom(ctx, 'O', centerX, centerY, ELEMENT_DATA.O.color);
      // Hydrogens
      drawAnswerAtom(ctx, 'H', centerX - 60, centerY - 40, ELEMENT_DATA.H.color);
      drawAnswerAtom(ctx, 'H', centerX + 60, centerY - 40, ELEMENT_DATA.H.color);
      // Bonds
      drawAnswerBond(ctx, centerX, centerY, centerX - 60, centerY - 40, 'single', 'polar');
      drawAnswerBond(ctx, centerX, centerY, centerX + 60, centerY - 40, 'single', 'polar');
    } else if (currentProblem.targetFormula === 'CH4') {
      // Carbon center
      drawAnswerAtom(ctx, 'C', centerX, centerY, ELEMENT_DATA.C.color);
      // 4 Hydrogens
      drawAnswerAtom(ctx, 'H', centerX, centerY - 60, ELEMENT_DATA.H.color);
      drawAnswerAtom(ctx, 'H', centerX + 60, centerY, ELEMENT_DATA.H.color);
      drawAnswerAtom(ctx, 'H', centerX, centerY + 60, ELEMENT_DATA.H.color);
      drawAnswerAtom(ctx, 'H', centerX - 60, centerY, ELEMENT_DATA.H.color);
      // Bonds
      drawAnswerBond(ctx, centerX, centerY, centerX, centerY - 60, 'single', 'covalent');
      drawAnswerBond(ctx, centerX, centerY, centerX + 60, centerY, 'single', 'covalent');
      drawAnswerBond(ctx, centerX, centerY, centerX, centerY + 60, 'single', 'covalent');
      drawAnswerBond(ctx, centerX, centerY, centerX - 60, centerY, 'single', 'covalent');
    } else if (currentProblem.targetFormula === 'NaCl') {
      // Sodium
      drawAnswerAtom(ctx, 'Na', centerX - 50, centerY, ELEMENT_DATA.Na.color);
      // Chlorine
      drawAnswerAtom(ctx, 'Cl', centerX + 50, centerY, ELEMENT_DATA.Cl.color);
      // Ionic bond
      drawAnswerBond(ctx, centerX - 50, centerY, centerX + 50, centerY, 'single', 'ionic');
    } else if (currentProblem.targetFormula === 'O2') {
      // Two oxygens
      drawAnswerAtom(ctx, 'O', centerX - 40, centerY, ELEMENT_DATA.O.color);
      drawAnswerAtom(ctx, 'O', centerX + 40, centerY, ELEMENT_DATA.O.color);
      // Double bond
      drawAnswerBond(ctx, centerX - 40, centerY, centerX + 40, centerY, 'double', 'covalent');
    } else if (currentProblem.targetFormula === 'N2') {
      // Two nitrogens
      drawAnswerAtom(ctx, 'N', centerX - 40, centerY, ELEMENT_DATA.N.color);
      drawAnswerAtom(ctx, 'N', centerX + 40, centerY, ELEMENT_DATA.N.color);
      // Triple bond
      drawAnswerBond(ctx, centerX - 40, centerY, centerX + 40, centerY, 'triple', 'covalent');
    }
  };

  const drawAnswerAtom = (ctx: CanvasRenderingContext2D, symbol: string, x: number, y: number, color: string) => {
    ctx.fillStyle = `${color}20`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);
  };

  const drawAnswerBond = (
    ctx: CanvasRenderingContext2D, 
    x1: number, y1: number, 
    x2: number, y2: number, 
    type: string, 
    bondType: string
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    const startX = x1 + 25 * Math.cos(angle);
    const startY = y1 + 25 * Math.sin(angle);
    const endX = x2 - 25 * Math.cos(angle);
    const endY = y2 - 25 * Math.sin(angle);

    ctx.strokeStyle = bondType === 'ionic' ? '#DC2626' : bondType === 'polar' ? '#F59E0B' : '#2563EB';
    ctx.lineWidth = 3;

    if (type === 'single') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (type === 'double') {
      const perpX = -Math.sin(angle) * 4;
      const perpY = Math.cos(angle) * 4;
      
      ctx.beginPath();
      ctx.moveTo(startX + perpX, startY + perpY);
      ctx.lineTo(endX + perpX, endY + perpY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX - perpX, startY - perpY);
      ctx.lineTo(endX - perpX, endY - perpY);
      ctx.stroke();
    } else if (type === 'triple') {
      const perpX = -Math.sin(angle) * 5;
      const perpY = Math.cos(angle) * 5;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX + perpX, startY + perpY);
      ctx.lineTo(endX + perpX, endY + perpY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX - perpX, startY - perpY);
      ctx.lineTo(endX - perpX, endY - perpY);
      ctx.stroke();
    }
  };

  const handleSubmitQuiz = () => {
    let totalScore = 0;
    const maxScore = 100;

    // Check number of bonds
    const bondsCorrect = bonds.length === currentProblem.targetBonds;
    if (bondsCorrect) totalScore += 40;

    // Check bond types
    const bondTypesCorrect = bonds.every(b => b.bondType === currentProblem.targetBondType);
    if (bondTypesCorrect) totalScore += 30;

    // Check atom connectivity
    const allAtomsConnected = atoms.every(atom => 
      bonds.some(b => b.atom1Id === atom.id || b.atom2Id === atom.id)
    );
    if (allAtomsConnected) totalScore += 30;

    setScore(totalScore);
    setIsSubmitted(true);
    setShowAnswer(true);
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };

  const handleTryAgain = () => {
    resetForQuiz();
  };

  const resetBuilder = () => {
    setAtoms([]);
    setBonds([]);
    setSelectedAtom(null);
  };

  const getMolecularFormula = () => {
    const counts: { [key: string]: number } = {};
    atoms.forEach(atom => {
      counts[atom.symbol] = (counts[atom.symbol] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([a], [b]) => {
        if (a === 'C') return -1;
        if (b === 'C') return 1;
        if (a === 'H') return 1;
        if (b === 'H') return -1;
        return a.localeCompare(b);
      })
      .map(([symbol, count]) => `${symbol}${count > 1 ? count : ''}`)
      .join('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white px-5 py-3 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="border-l border-white/30 pl-3 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              <div>
                <h1 className="text-base font-bold">Chemical Bonding Editor</h1>
                <p className="text-[10px] text-white/70">Build molecules & understand bonding</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('builder')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'builder' 
                  ? 'bg-white text-teal-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              🔨 Builder Mode
            </button>
            <button
              onClick={() => setViewMode('quiz')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'quiz' 
                  ? 'bg-white text-teal-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              🎯 Quiz Mode
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-4">
        {/* Quiz Problem Header */}
        {viewMode === 'quiz' && (
          <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white rounded-lg shadow-lg p-4 mb-4 border-2 border-teal-400">
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
              </div>
              <div className="flex flex-col gap-2">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={bonds.length === 0}
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
          {/* Left Sidebar */}
          <div className="w-72 space-y-3">
            {/* Element Selector */}
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Add Atoms
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ELEMENT_DATA).map(([symbol, data]) => (
                    <button
                      key={symbol}
                      onClick={() => addAtom(symbol)}
                      className="p-2 rounded-lg text-sm font-bold transition-all hover:scale-110"
                      style={{
                        backgroundColor: `${data.color}20`,
                        color: data.color,
                        border: `2px solid ${data.color}`,
                      }}
                      title={data.name}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bond Type Selector */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" />
                Bond Type
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setBondingMode('single')}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    bondingMode === 'single'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  Single Bond (—)
                </button>
                <button
                  onClick={() => setBondingMode('double')}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    bondingMode === 'double'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  Double Bond (═)
                </button>
                <button
                  onClick={() => setBondingMode('triple')}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    bondingMode === 'triple'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  Triple Bond (≡)
                </button>
              </div>
            </div>

            {/* Display Options */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <h3 className="text-xs uppercase text-gray-500 mb-2">Display Options</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-xs">Show Electrons</span>
                  <input
                    type="checkbox"
                    checked={showElectrons}
                    onChange={(e) => setShowElectrons(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-xs">Show Polarity</span>
                  <input
                    type="checkbox"
                    checked={showPolarity}
                    onChange={(e) => setShowPolarity(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2">Actions</h3>
                <button
                  onClick={resetBuilder}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-bold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-3 border border-cyan-200">
              <h3 className="text-xs uppercase text-cyan-800 font-bold mb-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                How to Use
              </h3>
              <div className="text-[10px] text-gray-700 space-y-1">
                <div>🖱️ <strong>Drag atoms</strong> to position</div>
                <div>1️⃣ Click atoms to select</div>
                <div>2️⃣ Click another to form bond</div>
                <div>3️⃣ Click existing bond to upgrade</div>
                <div className="pt-1 border-t border-cyan-300">
                  <strong>Bond Types:</strong><br/>
                  🔵 Covalent • 🟡 Polar • 🔴 Ionic
                </div>
              </div>
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <canvas
                ref={canvasRef}
                width={900}
                height={600}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseUp={handleCanvasMouseUp}
                onMouseMove={handleCanvasMouseMove}
                className="w-full border-2 border-gray-300 rounded-lg cursor-pointer"
              />

              {/* Instructions */}
              <div className="mt-3 bg-gradient-to-r from-teal-50 to-cyan-50 p-3 rounded-lg border border-teal-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700 flex-1">
                    {viewMode === 'builder' ? (
                      <div>
                        <strong className="text-teal-900">Builder Mode:</strong> Add atoms from the sidebar, 
                        then click two atoms to create a bond. The bond type is determined by electronegativity difference.
                      </div>
                    ) : (
                      <div>
                        <strong className="text-teal-900">Quiz Mode:</strong> {currentProblem.hint}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Info */}
          <div className="w-72 space-y-3">
            {/* Molecule Info */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-lg shadow-md p-3 border-2 border-teal-300">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                <Atom className="w-4 h-4" />
                Molecule Info
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between bg-white/20 rounded px-2 py-1">
                  <span>Formula:</span>
                  <span className="font-bold">{getMolecularFormula() || 'None'}</span>
                </div>
                <div className="flex justify-between bg-white/20 rounded px-2 py-1">
                  <span>Atoms:</span>
                  <span className="font-bold">{atoms.length}</span>
                </div>
                <div className="flex justify-between bg-white/20 rounded px-2 py-1">
                  <span>Bonds:</span>
                  <span className="font-bold">{bonds.length}</span>
                </div>
              </div>
            </div>

            {/* Bond Analysis */}
            {bonds.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Bond Analysis
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bonds.map((bond, index) => {
                    const atom1 = atoms.find(a => a.id === bond.atom1Id);
                    const atom2 = atoms.find(a => a.id === bond.atom2Id);
                    if (!atom1 || !atom2) return null;

                    return (
                      <div key={bond.id} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">
                            {atom1.symbol}—{atom2.symbol}
                          </span>
                          <button
                            onClick={() => deleteBond(bond.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-[10px] space-y-0.5">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className={`font-bold ${
                              bond.bondType === 'ionic' ? 'text-red-600' :
                              bond.bondType === 'polar' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`}>
                              {bond.bondType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Order:</span>
                            <span className="font-bold">{bond.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ΔEN:</span>
                            <span className="font-bold">{bond.polarity.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bond Type Guide */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
              <h3 className="text-xs uppercase text-yellow-800 font-bold mb-2">Bond Classification</h3>
              <div className="text-[10px] text-gray-700 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <strong>Covalent:</strong> ΔEN &lt; 0.4
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <strong>Polar:</strong> 0.4 ≤ ΔEN ≤ 1.7
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <strong>Ionic:</strong> ΔEN &gt; 1.7
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <h3 className="text-xs uppercase text-purple-800 font-bold mb-2">Quick Facts</h3>
              <div className="text-[10px] text-gray-700 space-y-1">
                <div>⚡ <strong>Single Bond:</strong> 2 shared e⁻</div>
                <div>⚡⚡ <strong>Double Bond:</strong> 4 shared e⁻</div>
                <div>⚡⚡⚡ <strong>Triple Bond:</strong> 6 shared e⁻</div>
                <div className="pt-1 border-t border-purple-300">
                  δ+ = partial positive<br/>
                  δ− = partial negative
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Answer Comparison */}
      {viewMode === 'quiz' && showAnswer && score !== null && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border-2 z-50 overflow-hidden">
          <div className={`p-4 text-white ${score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {score >= 80 ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {score >= 80 ? '🎉 Great Job!' : '❌ Keep Trying'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {score >= 80 ? 'Your molecule is correct!' : 'Check your bonding'}
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

          <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600">{score}%</div>
                <div className="text-xs text-gray-600">Your Score</div>
              </div>
            </div>

            {/* Correct Answer Visual */}
            <div className="mt-3 border-t border-teal-200 pt-3">
              <div className="text-xs font-bold text-teal-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Correct Structure
              </div>
              <div className="bg-white rounded-lg border-2 border-teal-300 p-2">
                <canvas
                  ref={answerCanvasRef}
                  width={320}
                  height={240}
                  className="w-full rounded"
                />
              </div>
              <div className="mt-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded p-2 text-[10px] text-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-bold text-teal-600">{currentProblem.targetBonds}</div>
                    <div>Required Bonds</div>
                  </div>
                  <div>
                    <div className="font-bold text-cyan-600 capitalize">{currentProblem.targetBondType}</div>
                    <div>Bond Type</div>
                  </div>
                </div>
              </div>
            </div>

            {score < 80 && (
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
          </div>
        </div>
      )}
    </div>
  );
}