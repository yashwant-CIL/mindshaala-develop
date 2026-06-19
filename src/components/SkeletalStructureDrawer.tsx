import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Save, Download, RotateCcw, Undo, Redo, Activity,
  Minus, Plus, Hash, Triangle, ZapOff, Trash2, Hexagon, Pentagon,
  Info, MousePointer2, CheckCircle2, XCircle, Award, ChevronRight,
  Target, Eye, RefreshCw
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Atom {
  id: string;
  x: number;
  y: number;
  element: string;
}

interface Bond {
  id: string;
  from: string;
  to: string;
  type: 'single' | 'double' | 'triple' | 'wedge' | 'dash';
}

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint: string;
  correctAnswer: {
    atoms: Array<{ element: string; position: number }>;
    bonds: Array<{ type: string; positions: [number, number] }>;
  };
}

const BOND_LENGTH = 45;
const SNAP_RADIUS = 25;
const DRAG_THRESHOLD = 5;

export function SkeletalStructureDrawer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Core state
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [history, setHistory] = useState<Array<{atoms: Atom[], bonds: Bond[]}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Interaction state
  const [mouseDownPos, setMouseDownPos] = useState<Point | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isDraggingAtom, setIsDraggingAtom] = useState(false);
  const [draggedAtomId, setDraggedAtomId] = useState<string | null>(null);
  const [isDrawingBond, setIsDrawingBond] = useState(false);
  const [bondStartAtomId, setBondStartAtomId] = useState<string | null>(null);
  const [hoveredAtomId, setHoveredAtomId] = useState<string | null>(null);
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [isRightClick, setIsRightClick] = useState(false);
  
  // Settings
  const [bondType, setBondType] = useState<'single' | 'double' | 'triple' | 'wedge' | 'dash'>('single');
  const [currentElement, setCurrentElement] = useState('C');
  const [structureName, setStructureName] = useState('My Structure');
  const [eraseMode, setEraseMode] = useState(false);
  const [showElementPicker, setShowElementPicker] = useState(false);
  const [elementPickerPos, setElementPickerPos] = useState<Point>({ x: 0, y: 0 });
  const [elementPage, setElementPage] = useState(0);

  // Problem/Quiz state
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{ 
    correct: boolean;
    atomsMatch: boolean;
    bondsMatch: boolean;
    score: number;
  } | null>(null);

  // Problem Database
  const problems: Problem[] = [
    {
      id: 1,
      title: "Draw Ethanol (Ethyl Alcohol)",
      description: "Draw the skeletal structure of Ethanol (C₂H₅OH). It has 2 carbon atoms, with an OH group attached to one carbon.",
      difficulty: "Easy",
      hint: "Start with 2 carbon atoms in a line, add OH group to one end",
      correctAnswer: {
        atoms: [
          { element: 'C', position: 0 },
          { element: 'C', position: 1 },
          { element: 'OH', position: 2 }
        ],
        bonds: [
          { type: 'single', positions: [0, 1] },
          { type: 'single', positions: [1, 2] }
        ]
      }
    },
    {
      id: 2,
      title: "Draw Acetic Acid",
      description: "Draw the skeletal structure of Acetic Acid (CH₃COOH). It contains 2 carbons, one with a carboxylic acid group (COOH).",
      difficulty: "Medium",
      hint: "2 carbons connected, attach COOH to second carbon",
      correctAnswer: {
        atoms: [
          { element: 'CH3', position: 0 },
          { element: 'COOH', position: 1 }
        ],
        bonds: [
          { type: 'single', positions: [0, 1] }
        ]
      }
    },
    {
      id: 3,
      title: "Draw Benzene Ring",
      description: "Draw the skeletal structure of Benzene (C₆H₆). It's a hexagonal ring with alternating double bonds.",
      difficulty: "Medium",
      hint: "6 carbons in hexagon, alternating single-double bonds",
      correctAnswer: {
        atoms: [
          { element: 'C', position: 0 },
          { element: 'C', position: 1 },
          { element: 'C', position: 2 },
          { element: 'C', position: 3 },
          { element: 'C', position: 4 },
          { element: 'C', position: 5 }
        ],
        bonds: [
          { type: 'single', positions: [0, 1] },
          { type: 'double', positions: [1, 2] },
          { type: 'single', positions: [2, 3] },
          { type: 'double', positions: [3, 4] },
          { type: 'single', positions: [4, 5] },
          { type: 'double', positions: [5, 0] }
        ]
      }
    },
    {
      id:4,
      title: "Draw Formaldehyde",
      description: "Draw the skeletal structure of Formaldehyde (HCHO). One carbon with double bond to oxygen, and aldehyde group.",
      difficulty: "Easy",
      hint: "Single carbon with CHO group",
      correctAnswer: {
        atoms: [
          { element: 'CHO', position: 0 }
        ],
        bonds: []
      }
    },
    {
      id: 5,
      title: "Draw Propane",
      description: "Draw the skeletal structure of Propane (C₃H₈). It's a straight chain of 3 carbon atoms.",
      difficulty: "Easy",
      hint: "3 carbons in a straight line",
      correctAnswer: {
        atoms: [
          { element: 'C', position: 0 },
          { element: 'C', position: 1 },
          { element: 'C', position: 2 }
        ],
        bonds: [
          { type: 'single', positions: [0, 1] },
          { type: 'single', positions: [1, 2] }
        ]
      }
    }
  ];

  const elements = [
    { symbol: 'C', name: 'Carbon', color: '#2c3e50' },
    { symbol: 'N', name: 'Nitrogen', color: '#3b82f6' },
    { symbol: 'O', name: 'Oxygen', color: '#ef4444' },
    { symbol: 'S', name: 'Sulfur', color: '#eab308' },
    { symbol: 'P', name: 'Phosphorus', color: '#f97316' },
    { symbol: 'F', name: 'Fluorine', color: '#22c55e' },
    { symbol: 'Cl', name: 'Chlorine', color: '#14b8a6' },
    { symbol: 'Br', name: 'Bromine', color: '#b45309' },
    { symbol: 'I', name: 'Iodine', color: '#7c3aed' },
    { symbol: 'H', name: 'Hydrogen', color: '#6b7280' },
    { symbol: 'B', name: 'Boron', color: '#f59e0b' },
    { symbol: 'Si', name: 'Silicon', color: '#64748b' },
    { symbol: 'Se', name: 'Selenium', color: '#92400e' },
    { symbol: 'Al', name: 'Aluminum', color: '#71717a' },
    { symbol: 'As', name: 'Arsenic', color: '#78716c' },
    { symbol: 'Li', name: 'Lithium', color: '#a855f7' },
    { symbol: 'Na', name: 'Sodium', color: '#8b5cf6' },
    { symbol: 'K', name: 'Potassium', color: '#7c3aed' },
    { symbol: 'Ca', name: 'Calcium', color: '#6366f1' },
    { symbol: 'Mg', name: 'Magnesium', color: '#4f46e5' },
    { symbol: 'Fe', name: 'Iron', color: '#dc2626' },
    { symbol: 'Cu', name: 'Copper', color: '#ea580c' },
    { symbol: 'Zn', name: 'Zinc', color: '#737373' },
    { symbol: 'Ag', name: 'Silver', color: '#9ca3af' },
    { symbol: 'Au', name: 'Gold', color: '#fbbf24' },
  ];

  const functionalGroups = [
    { symbol: 'OH', name: 'Hydroxyl' },
    { symbol: 'NH2', name: 'Amine' },
    { symbol: 'COOH', name: 'Carboxyl' },
    { symbol: 'CHO', name: 'Aldehyde' },
    { symbol: 'CH3', name: 'Methyl' },
    { symbol: 'NO2', name: 'Nitro' },
  ];

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ atoms: [], bonds: [] }]);
      setHistoryIndex(0);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
      
      // Quick element switch (1-9, 0)
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (elements[idx]) setCurrentElement(elements[idx].symbol);
      }
      if (e.key === '0' && elements[9]) setCurrentElement(elements[9].symbol);
      
      // Bond types
      if (e.key === 's') setBondType('single');
      if (e.key === 'd') setBondType('double');
      if (e.key === 't') setBondType('triple');
      if (e.key === 'w') setBondType('wedge');
      if (e.key === 'h') setBondType('dash');
      
      // Tools
      if (e.key === 'e') setEraseMode(!eraseMode);
      
      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAtomId) {
        deleteAtom(selectedAtomId);
      }

      // Escape
      if (e.key === 'Escape') {
        setEraseMode(false);
        setSelectedAtomId(null);
        setShowElementPicker(false);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [eraseMode, selectedAtomId, elements]);

  // Draw canvas
  useEffect(() => {
    draw();
  }, [atoms, bonds, mousePos, isDrawingBond, bondStartAtomId, hoveredAtomId, selectedAtomId, eraseMode, isDraggingAtom, draggedAtomId, bondType]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Light grid
    ctx.strokeStyle = '#f8f8f8';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw bonds
    bonds.forEach(bond => {
      const fromAtom = atoms.find(a => a.id === bond.from);
      const toAtom = atoms.find(a => a.id === bond.to);
      if (!fromAtom || !toAtom) return;
      drawBond(ctx, fromAtom, toAtom, bond.type, false);
    });

    // Draw preview bond while drawing
    if (isDrawingBond && bondStartAtomId && mousePos) {
      const startAtom = atoms.find(a => a.id === bondStartAtomId);
      if (startAtom) {
        const targetAtom = findAtomAt(mousePos);
        const endPos = targetAtom && targetAtom.id !== bondStartAtomId 
          ? { x: targetAtom.x, y: targetAtom.y }
          : mousePos;
        
        // Preview bond line with selected bond type
        drawBond(ctx, 
          { id: 'preview', x: startAtom.x, y: startAtom.y, element: 'C' },
          { id: 'preview', x: endPos.x, y: endPos.y, element: 'C' },
          bondType,
          true
        );

        // Highlight target atom if hovering over one
        if (targetAtom && targetAtom.id !== bondStartAtomId) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(targetAtom.x, targetAtom.y, 16, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Draw atoms
    atoms.forEach(atom => {
      const isHovered = hoveredAtomId === atom.id;
      const isSelected = selectedAtomId === atom.id;
      const isBeingDragged = draggedAtomId === atom.id && isDraggingAtom;
      const isBondStart = bondStartAtomId === atom.id && isDrawingBond;
      
      drawAtom(ctx, atom, isHovered, isSelected, isBeingDragged, isBondStart);
    });

    // Erase mode cursor
    if (eraseMode && mousePos) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 18, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mousePos.x - 10, mousePos.y - 10);
      ctx.lineTo(mousePos.x + 10, mousePos.y + 10);
      ctx.moveTo(mousePos.x + 10, mousePos.y - 10);
      ctx.lineTo(mousePos.x - 10, mousePos.y + 10);
      ctx.stroke();
    }

    // Placement preview (when not on atom)
    if (!eraseMode && !isDrawingBond && !isDraggingAtom && mousePos && !hoveredAtomId) {
      const elem = elements.find(e => e.symbol === currentElement);
      const color = elem?.color || '#3b82f6';
      
      // Show preview for ALL elements including carbon
      ctx.fillStyle = `${color}30`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = color;
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentElement, mousePos.x, mousePos.y);
      
      // Add "Click to place" tooltip
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(mousePos.x + 15, mousePos.y - 10, 85, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Click to place', mousePos.x + 20, mousePos.y + 1);
    }

    // Bond type indicator when drawing
    if (isDrawingBond && mousePos) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(mousePos.x + 20, mousePos.y - 25, 100, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${bondType.toUpperCase()} bond`, mousePos.x + 25, mousePos.y - 10);
    }
  };

  const drawBond = (
    ctx: CanvasRenderingContext2D,
    from: Atom,
    to: Atom,
    type: string,
    isPreview: boolean
  ) => {
    ctx.strokeStyle = isPreview ? '#3b82f6' : '#1f2937';
    ctx.lineWidth = isPreview ? 2.5 : 2;
    ctx.lineCap = 'round';
    
    if (isPreview) {
      ctx.setLineDash([6, 4]);
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;

    if (type === 'single') {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (type === 'double') {
      const offset = 3.5;
      ctx.beginPath();
      ctx.moveTo(
        from.x + Math.cos(perpAngle) * offset,
        from.y + Math.sin(perpAngle) * offset
      );
      ctx.lineTo(
        to.x + Math.cos(perpAngle) * offset,
        to.y + Math.sin(perpAngle) * offset
      );
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(
        from.x - Math.cos(perpAngle) * offset,
        from.y - Math.sin(perpAngle) * offset
      );
      ctx.lineTo(
        to.x - Math.cos(perpAngle) * offset,
        to.y - Math.sin(perpAngle) * offset
      );
      ctx.stroke();
    } else if (type === 'triple') {
      const offset = 5;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(
        from.x + Math.cos(perpAngle) * offset,
        from.y + Math.sin(perpAngle) * offset
      );
      ctx.lineTo(
        to.x + Math.cos(perpAngle) * offset,
        to.y + Math.sin(perpAngle) * offset
      );
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(
        from.x - Math.cos(perpAngle) * offset,
        from.y - Math.sin(perpAngle) * offset
      );
      ctx.lineTo(
        to.x - Math.cos(perpAngle) * offset,
        to.y - Math.sin(perpAngle) * offset
      );
      ctx.stroke();
    } else if (type === 'wedge') {
      const offset = 6;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(
        to.x + Math.cos(perpAngle) * offset,
        to.y + Math.sin(perpAngle) * offset
      );
      ctx.lineTo(
        to.x - Math.cos(perpAngle) * offset,
        to.y - Math.sin(perpAngle) * offset
      );
      ctx.closePath();
      ctx.fillStyle = isPreview ? '#3b82f6' : '#1f2937';
      ctx.fill();
    } else if (type === 'dash') {
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isPreview) {
      ctx.setLineDash([]);
    }
  };

  const drawAtom = (
    ctx: CanvasRenderingContext2D,
    atom: Atom,
    isHovered: boolean,
    isSelected: boolean,
    isBeingDragged: boolean,
    isBondStart: boolean
  ) => {
    const element = elements.find(e => e.symbol === atom.element);
    const color = element?.color || '#2c3e50';
    // Always show label for all elements including carbon
    const showLabel = true;

    // Outer glow for dragging
    if (isBeingDragged) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Selection ring
    if (isSelected || isHovered || isBondStart) {
      const ringColor = isBondStart ? '#3b82f6' : isSelected ? '#8b5cf6' : '#60a5fa';
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // White background circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Element text - ALWAYS show including C
    ctx.fillStyle = color;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(atom.element, atom.x, atom.y);

    // Hover tooltip
    if (isHovered && !isDrawingBond && !isDraggingAtom) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(atom.x + 15, atom.y - 28, 115, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${element?.name || atom.element}`, atom.x + 20, atom.y - 18);
      ctx.font = '9px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Left-click: change', atom.x + 20, atom.y - 8);
      ctx.fillText('Right-drag: draw bond', atom.x + 20, atom.y + 2);
    }
  };

  const getMousePos = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const findAtomAt = (pos: Point): Atom | null => {
    for (let i = atoms.length - 1; i >= 0; i--) {
      const atom = atoms[i];
      const dist = Math.sqrt((atom.x - pos.x) ** 2 + (atom.y - pos.y) ** 2);
      if (dist < SNAP_RADIUS) return atom;
    }
    return null;
  };

  const findBondAt = (pos: Point): Bond | null => {
    for (const bond of bonds) {
      const from = atoms.find(a => a.id === bond.from);
      const to = atoms.find(a => a.id === bond.to);
      if (!from || !to) continue;

      const dist = distToSegment(pos, from, to);
      if (dist < 10) return bond;
    }
    return null;
  };

  const distToSegment = (p: Point, a: Atom, b: Atom): number => {
    const l2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    if (l2 === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    return Math.sqrt(
      (p.x - (a.x + t * (b.x - a.x))) ** 2 +
      (p.y - (a.y + t * (b.y - a.y))) ** 2
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const isRightButton = e.button === 2;
    
    setMouseDownPos(pos);
    setShowElementPicker(false);
    setIsRightClick(isRightButton);

    // Prevent context menu on right click
    if (isRightButton) {
      e.preventDefault();
    }

    const clickedAtom = findAtomAt(pos);
    const clickedBond = findBondAt(pos);

    // Erase mode
    if (eraseMode) {
      if (clickedAtom) {
        deleteAtom(clickedAtom.id);
      } else if (clickedBond) {
        deleteBond(clickedBond.id);
      }
      return;
    }

    // Right click on atom - start bond drawing
    if (isRightButton && clickedAtom) {
      setIsDrawingBond(true);
      setBondStartAtomId(clickedAtom.id);
      setSelectedAtomId(clickedAtom.id);
      return;
    }

    // Left click on atom - prepare for element change or move
    if (!isRightButton && clickedAtom) {
      setSelectedAtomId(clickedAtom.id);
      setDraggedAtomId(clickedAtom.id);
      return;
    }

    // Clicked on empty space
    if (!clickedAtom) {
      setSelectedAtomId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    setMousePos(pos);

    if (!mouseDownPos) {
      // Just hovering
      const hoveredAtom = findAtomAt(pos);
      setHoveredAtomId(hoveredAtom?.id || null);
      return;
    }

    // Check if we've moved enough to be considered dragging
    const dist = Math.sqrt(
      (pos.x - mouseDownPos.x) ** 2 + (pos.y - mouseDownPos.y) ** 2
    );

    // If drawing bond (right click), just update preview
    if (isDrawingBond) {
      return;
    }

    // If left click and dragging
    if (!isRightClick && dist > DRAG_THRESHOLD && draggedAtomId) {
      setIsDraggingAtom(true);
      const newAtoms = atoms.map(a =>
        a.id === draggedAtomId ? { ...a, x: pos.x, y: pos.y } : a
      );
      setAtoms(newAtoms);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (!mouseDownPos) return;

    const dist = Math.sqrt(
      (pos.x - mouseDownPos.x) ** 2 + (pos.y - mouseDownPos.y) ** 2
    );

    // If we were drawing a bond (right click)
    if (isDrawingBond && bondStartAtomId) {
      const startAtom = atoms.find(a => a.id === bondStartAtomId);
      const targetAtom = findAtomAt(pos);

      if (startAtom && targetAtom && targetAtom.id !== bondStartAtomId) {
        // Check if bond exists
        const bondExists = bonds.some(
          b => (b.from === bondStartAtomId && b.to === targetAtom.id) ||
               (b.from === targetAtom.id && b.to === bondStartAtomId)
        );

        if (!bondExists) {
          // Create bond with selected type
          const newBond: Bond = {
            id: `bond-${Date.now()}`,
            from: bondStartAtomId,
            to: targetAtom.id,
            type: bondType,
          };
          
          const newBonds = [...bonds, newBond];
          setBonds(newBonds);
          saveState(atoms, newBonds);
        }
      }

      setIsDrawingBond(false);
      setBondStartAtomId(null);
    }
    // If we were dragging an atom (left click)
    else if (isDraggingAtom && draggedAtomId) {
      saveState(atoms, bonds);
      setIsDraggingAtom(false);
    }
    // If it was just a click (not a drag)
    else if (dist < DRAG_THRESHOLD) {
      const clickedAtom = findAtomAt(mouseDownPos);
      
      if (clickedAtom && !isRightClick) {
        // Left clicked on atom - show element picker
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          setElementPickerPos({
            x: rect.left + clickedAtom.x,
            y: rect.top + clickedAtom.y,
          });
          setShowElementPicker(true);
          setSelectedAtomId(clickedAtom.id);
        }
      } else if (!clickedAtom && !isRightClick) {
        // Left clicked on empty space - place atom
        const newAtom: Atom = {
          id: `atom-${Date.now()}`,
          x: pos.x,
          y: pos.y,
          element: currentElement,
        };
        const newAtoms = [...atoms, newAtom];
        setAtoms(newAtoms);
        setSelectedAtomId(newAtom.id);
        saveState(newAtoms, bonds);
      }
    }

    setMouseDownPos(null);
    setDraggedAtomId(null);
    setIsRightClick(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent browser context menu
  };

  const changeAtomElement = (atomId: string, element: string) => {
    const newAtoms = atoms.map(a =>
      a.id === atomId ? { ...a, element } : a
    );
    setAtoms(newAtoms);
    saveState(newAtoms, bonds);
    setShowElementPicker(false);
  };

  const deleteAtom = (atomId: string) => {
    const newAtoms = atoms.filter(a => a.id !== atomId);
    const newBonds = bonds.filter(b => b.from !== atomId && b.to !== atomId);
    setAtoms(newAtoms);
    setBonds(newBonds);
    setSelectedAtomId(null);
    saveState(newAtoms, newBonds);
  };

  const deleteBond = (bondId: string) => {
    const newBonds = bonds.filter(b => b.id !== bondId);
    setBonds(newBonds);
    saveState(atoms, newBonds);
  };

  const saveState = (newAtoms: Atom[], newBonds: Bond[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ atoms: newAtoms, bonds: newBonds });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setAtoms(history[idx].atoms);
      setBonds(history[idx].bonds);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setAtoms(history[idx].atoms);
      setBonds(history[idx].bonds);
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear everything?')) {
      setAtoms([]);
      setBonds([]);
      setHistory([{ atoms: [], bonds: [] }]);
      setHistoryIndex(0);
      setSelectedAtomId(null);
    }
  };

  const addTemplate = (type: string) => {
    const centerX = 450;
    const centerY = 350;
    let newAtoms: Atom[] = [];
    let newBonds: Bond[] = [];

    if (type === 'benzene') {
      const r = 50;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) - Math.PI / 2;
        newAtoms.push({
          id: `atom-${Date.now()}-${i}`,
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
          element: 'C',
        });
      }
      for (let i = 0; i < 6; i++) {
        newBonds.push({
          id: `bond-${Date.now()}-${i}`,
          from: newAtoms[i].id,
          to: newAtoms[(i + 1) % 6].id,
          type: i % 2 === 0 ? 'double' : 'single',
        });
      }
    } else if (type === 'cyclohexane') {
      const r = 50;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) - Math.PI / 2;
        newAtoms.push({
          id: `atom-${Date.now()}-${i}`,
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
          element: 'C',
        });
      }
      for (let i = 0; i < 6; i++) {
        newBonds.push({
          id: `bond-${Date.now()}-${i}`,
          from: newAtoms[i].id,
          to: newAtoms[(i + 1) % 6].id,
          type: 'single',
        });
      }
    } else if (type === 'cyclopentane') {
      const r = 45;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        newAtoms.push({
          id: `atom-${Date.now()}-${i}`,
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
          element: 'C',
        });
      }
      for (let i = 0; i < 5; i++) {
        newBonds.push({
          id: `bond-${Date.now()}-${i}`,
          from: newAtoms[i].id,
          to: newAtoms[(i + 1) % 5].id,
          type: 'single',
        });
      }
    }

    const allAtoms = [...atoms, ...newAtoms];
    const allBonds = [...bonds, ...newBonds];
    setAtoms(allAtoms);
    setBonds(allBonds);
    saveState(allAtoms, allBonds);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${structureName}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Problem solving functions
  const handleSubmitAnswer = () => {
    const problem = problems[currentProblemIndex];
    
    // Simple comparison based on atom count and bond count
    const atomsMatch = atoms.length === problem.correctAnswer.atoms.length;
    const bondsMatch = bonds.length === problem.correctAnswer.bonds.length;
    
    // Check element types
    const userElements = atoms.map(a => a.element).sort();
    const correctElements = problem.correctAnswer.atoms.map(a => a.element).sort();
    const elementsMatch = JSON.stringify(userElements) === JSON.stringify(correctElements);
    
    const correct = atomsMatch && bondsMatch && elementsMatch;
    const score = correct ? 100 : Math.round(((atomsMatch ? 33 : 0) + (bondsMatch ? 33 : 0) + (elementsMatch ? 34 : 0)));
    
    setComparisonResult({
      correct,
      atomsMatch,
      bondsMatch,
      score
    });
    setIsSubmitted(true);
    setShowAnswer(true);
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setAtoms([]);
      setBonds([]);
      setHistory([{ atoms: [], bonds: [] }]);
      setHistoryIndex(0);
      setIsSubmitted(false);
      setShowAnswer(false);
      setComparisonResult(null);
    }
  };

  const handleTryAgain = () => {
    setAtoms([]);
    setBonds([]);
    setHistory([{ atoms: [], bonds: [] }]);
    setHistoryIndex(0);
    setIsSubmitted(false);
    setShowAnswer(false);
    setComparisonResult(null);
  };

  const currentProblem = problems[currentProblemIndex];

  // Draw correct answer structure on a separate canvas
  useEffect(() => {
    if (showAnswer && comparisonResult) {
      drawCorrectAnswer();
    }
  }, [showAnswer, comparisonResult, currentProblemIndex]);

  const drawCorrectAnswer = () => {
    const canvas = document.getElementById('answer-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const problem = problems[currentProblemIndex];
    const centerX = 180;
    const centerY = 100;

    // Create visual atoms based on correct answer
    const visualAtoms: Array<{ x: number; y: number; element: string }> = [];
    
    // Simple layout logic based on problem type
    if (problem.id === 1) { // Ethanol - linear
      visualAtoms.push({ x: centerX - 50, y: centerY, element: 'C' });
      visualAtoms.push({ x: centerX + 10, y: centerY, element: 'C' });
      visualAtoms.push({ x: centerX + 70, y: centerY, element: 'OH' });
    } else if (problem.id === 2) { // Acetic Acid - linear
      visualAtoms.push({ x: centerX - 40, y: centerY, element: 'CH3' });
      visualAtoms.push({ x: centerX + 40, y: centerY, element: 'COOH' });
    } else if (problem.id === 3) { // Benzene - hexagon
      const r = 45;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) - Math.PI / 2;
        visualAtoms.push({
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
          element: 'C'
        });
      }
    } else if (problem.id === 4) { // Formaldehyde - single
      visualAtoms.push({ x: centerX, y: centerY, element: 'CHO' });
    } else if (problem.id === 5) { // Propane - linear 3 carbons
      visualAtoms.push({ x: centerX - 60, y: centerY, element: 'C' });
      visualAtoms.push({ x: centerX, y: centerY, element: 'C' });
      visualAtoms.push({ x: centerX + 60, y: centerY, element: 'C' });
    }

    // Draw bonds first
    problem.correctAnswer.bonds.forEach(bond => {
      const fromAtom = visualAtoms[bond.positions[0]];
      const toAtom = visualAtoms[bond.positions[1]];
      if (!fromAtom || !toAtom) return;

      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      const dx = toAtom.x - fromAtom.x;
      const dy = toAtom.y - fromAtom.y;
      const angle = Math.atan2(dy, dx);
      const perpAngle = angle + Math.PI / 2;

      if (bond.type === 'single') {
        ctx.beginPath();
        ctx.moveTo(fromAtom.x, fromAtom.y);
        ctx.lineTo(toAtom.x, toAtom.y);
        ctx.stroke();
      } else if (bond.type === 'double') {
        const offset = 3.5;
        ctx.beginPath();
        ctx.moveTo(
          fromAtom.x + Math.cos(perpAngle) * offset,
          fromAtom.y + Math.sin(perpAngle) * offset
        );
        ctx.lineTo(
          toAtom.x + Math.cos(perpAngle) * offset,
          toAtom.y + Math.sin(perpAngle) * offset
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(
          fromAtom.x - Math.cos(perpAngle) * offset,
          fromAtom.y - Math.sin(perpAngle) * offset
        );
        ctx.lineTo(
          toAtom.x - Math.cos(perpAngle) * offset,
          toAtom.y - Math.sin(perpAngle) * offset
        );
        ctx.stroke();
      }
    });

    // Draw atoms
    visualAtoms.forEach(atom => {
      const element = elements.find(e => e.symbol === atom.element);
      const color = element?.color || '#2c3e50';

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Element text
      ctx.fillStyle = color;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atom.element, atom.x, atom.y);
    });

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Correct Structure', canvas.width / 2, 20);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="border-l border-white/30 pl-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <div>
                <h1 className="text-base">Skeletal Structure Builder</h1>
                <p className="text-[10px] text-white/70">Simple & intuitive molecule drawing</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
              className="px-3 py-1.5 rounded bg-white/10 border border-white/20 text-white text-sm w-36"
              placeholder="Name"
            />
            <button
              onClick={exportImage}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4">
        {/* Problem Statement Window - Horizontal at Top */}
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
                  onClick={handleSubmitAnswer}
                  disabled={atoms.length === 0}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold shadow-lg transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Done - Submit Answer
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
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                disabled={!isSubmitted}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
              >
                <Eye className="w-4 h-4" />
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left Sidebar */}
          <div className="w-56 space-y-2">
            {/* Compact Info Bar - Element & Bond */}
            <div className="grid grid-cols-2 gap-2">
              {/* Current Element - Compact */}
              <div className="bg-blue-600 text-white rounded-lg p-2 border border-blue-400">
                <div className="text-[9px] uppercase opacity-75 mb-0.5">Element</div>
                <div className="text-xl font-bold">{currentElement}</div>
              </div>
              
              {/* Selected Bond - Compact */}
              <div className="bg-purple-600 text-white rounded-lg p-2 border border-purple-400">
                <div className="text-[9px] uppercase opacity-75 mb-0.5">Bond</div>
                <div className="text-xl font-bold capitalize">{bondType}</div>
              </div>
            </div>

            {/* Bond Types */}
            <div className="bg-white rounded-lg shadow-md p-2.5 border border-gray-200">
              <h3 className="text-[10px] uppercase text-gray-500 mb-1.5">Bond Types</h3>
              <div className="space-y-1">
                {[
                  { type: 'single', label: 'Single', icon: Minus, symbol: '─', key: 'S' },
                  { type: 'double', label: 'Double', icon: Plus, symbol: '═', key: 'D' },
                  { type: 'triple', label: 'Triple', icon: Hash, symbol: '≡', key: 'T' },
                  { type: 'wedge', label: 'Wedge', icon: Triangle, symbol: '▸', key: 'W' },
                  { type: 'dash', label: 'Dash', icon: ZapOff, symbol: '┄', key: 'H' },
                ].map(({ type, label, icon: Icon, symbol, key }) => (
                  <button
                    key={type}
                    onClick={() => setBondType(type as any)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      bondType === type
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                    <span className={`text-base ${bondType === type ? 'opacity-100' : 'opacity-50'}`}>
                      {symbol}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Elements Grid with Pagination */}
            <div className="bg-white rounded-lg shadow-md p-2.5 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-[10px] uppercase text-gray-500">Elements</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setElementPage(Math.max(0, elementPage - 1))}
                    disabled={elementPage === 0}
                    className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-xs font-bold"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setElementPage(Math.min(Math.ceil(elements.length / 10) - 1, elementPage + 1))}
                    disabled={elementPage >= Math.ceil(elements.length / 10) - 1}
                    className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-xs font-bold"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {elements.slice(elementPage * 10, (elementPage + 1) * 10).map(({ symbol, name, color }) => (
                  <button
                    key={symbol}
                    onClick={() => setCurrentElement(symbol)}
                    title={name}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentElement === symbol
                        ? 'text-white shadow-md ring-2 ring-offset-1'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: currentElement === symbol ? color : undefined,
                      color: currentElement === symbol ? 'white' : color,
                      ringColor: color,
                    }}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
              <div className="text-center text-[9px] text-gray-400 mt-1">
                Page {elementPage + 1} of {Math.ceil(elements.length / 10)}
              </div>
            </div>

            {/* Functional Groups */}
            <div className="bg-white rounded-lg shadow-md p-2.5 border border-gray-200">
              <h3 className="text-[10px] uppercase text-gray-500 mb-1.5">Groups</h3>
              <div className="grid grid-cols-2 gap-1">
                {functionalGroups.map(({ symbol, name }) => (
                  <button
                    key={symbol}
                    onClick={() => setCurrentElement(symbol)}
                    title={name}
                    className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                      currentElement === symbol
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="bg-white rounded-lg shadow-md p-2.5 border border-gray-200">
              <h3 className="text-[10px] uppercase text-gray-500 mb-1.5">Quick Add</h3>
              <div className="space-y-1">
                <button
                  onClick={() => addTemplate('benzene')}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 text-xs"
                >
                  <Hexagon className="w-3.5 h-3.5" />
                  Benzene
                </button>
                <button
                  onClick={() => addTemplate('cyclohexane')}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 text-xs"
                >
                  <Hexagon className="w-3.5 h-3.5" />
                  Cyclohexane
                </button>
                <button
                  onClick={() => addTemplate('cyclopentane')}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 text-xs"
                >
                  <Pentagon className="w-3.5 h-3.5" />
                  Cyclopentane
                </button>
              </div>
            </div>

            {/* Tools */}
            <div className="bg-white rounded-lg shadow-md p-2.5 border border-gray-200">
              <h3 className="text-[10px] uppercase text-gray-500 mb-1.5">Tools</h3>
              <button
                onClick={() => setEraseMode(!eraseMode)}
                className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  eraseMode
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Erase (E)
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-2.5 border border-gray-200">
              <h3 className="text-[10px] uppercase text-gray-500 mb-1.5">Actions</h3>
              <div className="space-y-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg text-xs"
                >
                  <Undo className="w-3.5 h-3.5" />
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg text-xs"
                >
                  <Redo className="w-3.5 h-3.5" />
                  Redo
                </button>
                <button
                  onClick={clearAll}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-200">
              <div className="text-xs space-y-0.5">
                <div className="flex justify-between text-gray-600">
                  <span>Atoms:</span>
                  <span className="font-bold text-blue-600">{atoms.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Bonds:</span>
                  <span className="font-bold text-purple-600">{bonds.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <canvas
                ref={canvasRef}
                width={1100}
                height={700}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setMousePos(null)}
                onContextMenu={handleContextMenu}
                className="border-2 border-gray-300 rounded-lg w-full cursor-crosshair"
                style={{
                  cursor: eraseMode ? 'not-allowed' : 'crosshair',
                }}
              />
              
              {/* Clear Instructions */}
              <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="font-semibold text-blue-900 text-base">How to Draw Bonds:</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border-2 border-purple-300">
                        <div className="font-semibold text-purple-700 mb-1">1️⃣ Select Bond Type</div>
                        <div className="text-xs text-gray-600">Click a bond type on the left (Single, Double, Triple, Wedge, Dash)</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-pink-300">
                        <div className="font-semibold text-pink-700 mb-1">2️⃣ Right-Click & Drag</div>
                        <div className="text-xs text-gray-600"><strong>Right-click</strong> on first atom, keep clicked, and drag to second atom</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-green-300">
                        <div className="font-semibold text-green-700 mb-1">3️⃣ Release</div>
                        <div className="text-xs text-gray-600">Release on target atom - bond is created with selected type!</div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 mt-2">
                      <div className="font-semibold text-blue-700 mb-1">Placing Atoms:</div>
                      <div className="text-xs text-gray-600"><strong>Left-click</strong> empty space to place • <strong>Left-click</strong> atom to change element • <strong>Left-drag</strong> atom to move it</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs pt-2 border-t border-blue-200">
                      <div><strong>Shortcuts:</strong> Press S/D/T/W/H to select bond types quickly</div>
                      <div><strong>Erase:</strong> Toggle erase mode (E) then click to delete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Element Picker Popup */}
      {showElementPicker && selectedAtomId && (
        <div
          className="fixed bg-white rounded-xl shadow-2xl border-2 border-blue-300 p-3 z-50"
          style={{
            left: elementPickerPos.x - 120,
            top: elementPickerPos.y - 180,
          }}
        >
          <div className="text-xs text-gray-500 mb-2 text-center">Change Element</div>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {elements.map(({ symbol, color, name }) => (
              <button
                key={symbol}
                onClick={() => changeAtomElement(selectedAtomId, symbol)}
                title={name}
                className="p-2 rounded-lg text-sm font-bold hover:ring-2 ring-offset-1 transition-all"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  borderWidth: '2px',
                  borderColor: color,
                }}
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {functionalGroups.map(({ symbol, name }) => (
              <button
                key={symbol}
                onClick={() => changeAtomElement(selectedAtomId, symbol)}
                title={name}
                className="px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-mono"
              >
                {symbol}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowElementPicker(false)}
            className="w-full mt-2 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Answer Comparison Window - Bottom Right Corner */}
      {showAnswer && comparisonResult && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border-2 z-50 overflow-hidden">
          {/* Header */}
          <div className={`p-4 text-white ${comparisonResult.correct ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {comparisonResult.correct ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {comparisonResult.correct ? '🎉 Perfect!' : '❌ Not Quite'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {comparisonResult.correct ? 'Your structure is correct!' : 'Try again or check the hints'}
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

          {/* Correct Structure Visualization */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-b-2 border-green-200">
            <div className="bg-white rounded-lg border-2 border-green-300 overflow-hidden">
              <canvas
                id="answer-canvas"
                width={360}
                height={200}
                className="w-full"
              />
            </div>
            <p className="text-xs text-center text-green-700 mt-2 font-semibold">
              ⬆️ This is what you should draw
            </p>
          </div>

          {/* Score Display */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{comparisonResult.score}%</div>
                <div className="text-xs text-gray-600">Your Score</div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-2 rounded-lg ${comparisonResult.atomsMatch ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-sm font-semibold flex items-center gap-2">
                  {comparisonResult.atomsMatch ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  Atom Count
                </span>
                <span className={`text-xs font-bold ${comparisonResult.atomsMatch ? 'text-green-700' : 'text-red-700'}`}>
                  {atoms.length} / {currentProblem.correctAnswer.atoms.length}
                </span>
              </div>

              <div className={`flex items-center justify-between p-2 rounded-lg ${comparisonResult.bondsMatch ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-sm font-semibold flex items-center gap-2">
                  {comparisonResult.bondsMatch ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  Bond Count
                </span>
                <span className={`text-xs font-bold ${comparisonResult.bondsMatch ? 'text-green-700' : 'text-red-700'}`}>
                  {bonds.length} / {currentProblem.correctAnswer.bonds.length}
                </span>
              </div>

              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                  <Info className="w-4 h-4" />
                  Expected Structure
                </span>
                <div className="mt-1 text-xs text-blue-600">
                  <div><strong>Atoms:</strong> {currentProblem.correctAnswer.atoms.map(a => a.element).join(', ')}</div>
                  <div><strong>Bonds:</strong> {currentProblem.correctAnswer.bonds.length} connections</div>
                </div>
              </div>
            </div>

            {/* Hint for incorrect answers */}
            {!comparisonResult.correct && (
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