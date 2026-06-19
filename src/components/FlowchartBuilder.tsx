import { useState, useRef, useEffect } from 'react';
import { 
  X, Play, Download, Save, Upload, Trash2, Undo, Redo, 
  ZoomIn, ZoomOut, Maximize2, Grid, Wand2, Code, Eye, Lightbulb,
  Circle, Square, Diamond, Hexagon, ArrowRight, ChevronRight, MousePointer, Link, CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface FlowchartBuilderProps {
  onClose: () => void;
}

interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'input' | 'output';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  labelX?: number;
  labelY?: number;
}

interface ContextMenu {
  x: number;
  y: number;
  type: 'node' | 'connection' | 'canvas';
  targetId?: string;
  connectionIndex?: number;
}

interface HistoryState {
  nodes: FlowNode[];
  connections: Connection[];
}

const nodeTemplates = {
  start: { width: 120, height: 60, color: '#22c55e', shape: 'oval', label: 'Start' },
  end: { width: 120, height: 60, color: '#ef4444', shape: 'oval', label: 'End' },
  process: { width: 150, height: 70, color: '#3b82f6', shape: 'rect', label: 'Process' },
  decision: { width: 140, height: 140, color: '#f59e0b', shape: 'diamond', label: 'Decision?' },
  input: { width: 160, height: 70, color: '#8b5cf6', shape: 'parallelogram', label: 'Input' },
  output: { width: 160, height: 70, color: '#06b6d4', shape: 'parallelogram', label: 'Output' },
};

const algorithmTemplates = [
  {
    name: 'Add Two Numbers',
    nodes: [
      { id: '1', type: 'start' as const, x: 300, y: 50, text: 'Start' },
      { id: '2', type: 'input' as const, x: 280, y: 150, text: 'Input A, B' },
      { id: '3', type: 'process' as const, x: 275, y: 260, text: 'Sum = A + B' },
      { id: '4', type: 'output' as const, x: 280, y: 370, text: 'Output Sum' },
      { id: '5', type: 'end' as const, x: 300, y: 480, text: 'End' },
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' },
    ],
  },
  {
    name: 'Check Even/Odd',
    nodes: [
      { id: '1', type: 'start' as const, x: 300, y: 50, text: 'Start' },
      { id: '2', type: 'input' as const, x: 280, y: 150, text: 'Input N' },
      { id: '3', type: 'decision' as const, x: 280, y: 270, text: 'N % 2 == 0?' },
      { id: '4', type: 'output' as const, x: 140, y: 420, text: 'Print "Even"' },
      { id: '5', type: 'output' as const, x: 420, y: 420, text: 'Print "Odd"' },
      { id: '6', type: 'end' as const, x: 300, y: 540, text: 'End' },
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4', label: 'Yes' },
      { from: '3', to: '5', label: 'No' },
      { from: '4', to: '6' },
      { from: '5', to: '6' },
    ],
  },
  {
    name: 'Find Maximum',
    nodes: [
      { id: '1', type: 'start' as const, x: 300, y: 50, text: 'Start' },
      { id: '2', type: 'input' as const, x: 280, y: 150, text: 'Input A, B' },
      { id: '3', type: 'decision' as const, x: 280, y: 270, text: 'A > B?' },
      { id: '4', type: 'process' as const, x: 140, y: 420, text: 'Max = A' },
      { id: '5', type: 'process' as const, x: 420, y: 420, text: 'Max = B' },
      { id: '6', type: 'output' as const, x: 280, y: 540, text: 'Output Max' },
      { id: '7', type: 'end' as const, x: 300, y: 640, text: 'End' },
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4', label: 'Yes' },
      { from: '3', to: '5', label: 'No' },
      { from: '4', to: '6' },
      { from: '5', to: '6' },
      { from: '6', to: '7' },
    ],
  },
];

const practiceProblems = [
  {
    title: 'Calculate Area of Rectangle',
    description: 'Write a flowchart to input length and width, calculate area (length × width), and display the result.',
    difficulty: 'Easy',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input Length, Width' },
        { id: 'p3', type: 'process' as const, x: 175, y: 210, text: 'Area = Length × Width' },
        { id: 'p4', type: 'output' as const, x: 180, y: 300, text: 'Display Area' },
        { id: 'p5', type: 'end' as const, x: 200, y: 390, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
      ],
    },
  },
  {
    title: 'Check Positive or Negative',
    description: 'Write a flowchart to input a number and check if it is positive, negative, or zero.',
    difficulty: 'Medium',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input Number' },
        { id: 'p3', type: 'decision' as const, x: 180, y: 220, text: 'Number > 0?' },
        { id: 'p4', type: 'output' as const, x: 60, y: 370, text: 'Print "Positive"' },
        { id: 'p5', type: 'decision' as const, x: 320, y: 370, text: 'Number < 0?' },
        { id: 'p6', type: 'output' as const, x: 240, y: 500, text: 'Print "Negative"' },
        { id: 'p7', type: 'output' as const, x: 400, y: 500, text: 'Print "Zero"' },
        { id: 'p8', type: 'end' as const, x: 200, y: 610, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4', label: 'Yes' },
        { from: 'p3', to: 'p5', label: 'No' },
        { from: 'p5', to: 'p6', label: 'Yes' },
        { from: 'p5', to: 'p7', label: 'No' },
        { from: 'p4', to: 'p8' },
        { from: 'p6', to: 'p8' },
        { from: 'p7', to: 'p8' },
      ],
    },
  },
  {
    title: 'Find Largest of Three Numbers',
    description: 'Write a flowchart to input three numbers A, B, C and find the largest among them.',
    difficulty: 'Hard',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 250, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 230, y: 120, text: 'Input A, B, C' },
        { id: 'p3', type: 'decision' as const, x: 230, y: 220, text: 'A > B?' },
        { id: 'p4', type: 'decision' as const, x: 100, y: 370, text: 'A > C?' },
        { id: 'p5', type: 'decision' as const, x: 360, y: 370, text: 'B > C?' },
        { id: 'p6', type: 'process' as const, x: 25, y: 500, text: 'Max = A' },
        { id: 'p7', type: 'process' as const, x: 175, y: 500, text: 'Max = C' },
        { id: 'p8', type: 'process' as const, x: 285, y: 500, text: 'Max = B' },
        { id: 'p9', type: 'process' as const, x: 435, y: 500, text: 'Max = C' },
        { id: 'p10', type: 'output' as const, x: 230, y: 610, text: 'Display Max' },
        { id: 'p11', type: 'end' as const, x: 250, y: 700, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4', label: 'Yes' },
        { from: 'p3', to: 'p5', label: 'No' },
        { from: 'p4', to: 'p6', label: 'Yes' },
        { from: 'p4', to: 'p7', label: 'No' },
        { from: 'p5', to: 'p8', label: 'Yes' },
        { from: 'p5', to: 'p9', label: 'No' },
        { from: 'p6', to: 'p10' },
        { from: 'p7', to: 'p10' },
        { from: 'p8', to: 'p10' },
        { from: 'p9', to: 'p10' },
        { from: 'p10', to: 'p11' },
      ],
    },
  },
  {
    title: 'Sum of First N Natural Numbers',
    description: 'Write a flowchart using a loop to calculate the sum of first N natural numbers.',
    difficulty: 'Medium',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input N' },
        { id: 'p3', type: 'process' as const, x: 175, y: 210, text: 'Sum = 0, i = 1' },
        { id: 'p4', type: 'decision' as const, x: 180, y: 320, text: 'i <= N?' },
        { id: 'p5', type: 'process' as const, x: 50, y: 470, text: 'Sum = Sum + i' },
        { id: 'p6', type: 'process' as const, x: 50, y: 560, text: 'i = i + 1' },
        { id: 'p7', type: 'output' as const, x: 320, y: 470, text: 'Display Sum' },
        { id: 'p8', type: 'end' as const, x: 200, y: 640, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5', label: 'Yes' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'p4' },
        { from: 'p4', to: 'p7', label: 'No' },
        { from: 'p7', to: 'p8' },
      ],
    },
  },
  {
    title: 'Calculate Factorial',
    description: 'Write a flowchart to calculate the factorial of a given number N (N!).',
    difficulty: 'Medium',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input N' },
        { id: 'p3', type: 'process' as const, x: 175, y: 210, text: 'Fact = 1, i = 1' },
        { id: 'p4', type: 'decision' as const, x: 180, y: 320, text: 'i <= N?' },
        { id: 'p5', type: 'process' as const, x: 50, y: 470, text: 'Fact = Fact × i' },
        { id: 'p6', type: 'process' as const, x: 50, y: 560, text: 'i = i + 1' },
        { id: 'p7', type: 'output' as const, x: 320, y: 470, text: 'Display Fact' },
        { id: 'p8', type: 'end' as const, x: 200, y: 640, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5', label: 'Yes' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'p4' },
        { from: 'p4', to: 'p7', label: 'No' },
        { from: 'p7', to: 'p8' },
      ],
    },
  },
  {
    title: 'Check Prime Number',
    description: 'Write a flowchart to check if a given number is prime or not.',
    difficulty: 'Hard',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 220, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 200, y: 120, text: 'Input N' },
        { id: 'p3', type: 'decision' as const, x: 200, y: 220, text: 'N <= 1?' },
        { id: 'p4', type: 'output' as const, x: 60, y: 350, text: 'Not Prime' },
        { id: 'p5', type: 'process' as const, x: 320, y: 350, text: 'i = 2' },
        { id: 'p6', type: 'decision' as const, x: 320, y: 460, text: 'i < N?' },
        { id: 'p7', type: 'decision' as const, x: 180, y: 580, text: 'N % i == 0?' },
        { id: 'p8', type: 'output' as const, x: 60, y: 700, text: 'Not Prime' },
        { id: 'p9', type: 'process' as const, x: 300, y: 700, text: 'i = i + 1' },
        { id: 'p10', type: 'output' as const, x: 440, y: 580, text: 'Prime' },
        { id: 'p11', type: 'end' as const, x: 220, y: 810, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4', label: 'Yes' },
        { from: 'p3', to: 'p5', label: 'No' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'p7', label: 'Yes' },
        { from: 'p6', to: 'p10', label: 'No' },
        { from: 'p7', to: 'p8', label: 'Yes' },
        { from: 'p7', to: 'p9', label: 'No' },
        { from: 'p9', to: 'p6' },
        { from: 'p4', to: 'p11' },
        { from: 'p8', to: 'p11' },
        { from: 'p10', to: 'p11' },
      ],
    },
  },
  {
    title: 'Swap Two Numbers',
    description: 'Write a flowchart to swap two numbers using a temporary variable.',
    difficulty: 'Easy',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input A, B' },
        { id: 'p3', type: 'process' as const, x: 175, y: 210, text: 'Temp = A' },
        { id: 'p4', type: 'process' as const, x: 175, y: 300, text: 'A = B' },
        { id: 'p5', type: 'process' as const, x: 175, y: 390, text: 'B = Temp' },
        { id: 'p6', type: 'output' as const, x: 180, y: 480, text: 'Display A, B' },
        { id: 'p7', type: 'end' as const, x: 200, y: 570, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'p7' },
      ],
    },
  },
  {
    title: 'Find Average of Three Numbers',
    description: 'Write a flowchart to input three numbers and calculate their average.',
    difficulty: 'Easy',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input A, B, C' },
        { id: 'p3', type: 'process' as const, x: 175, y: 210, text: 'Sum = A + B + C' },
        { id: 'p4', type: 'process' as const, x: 175, y: 300, text: 'Avg = Sum / 3' },
        { id: 'p5', type: 'output' as const, x: 180, y: 390, text: 'Display Avg' },
        { id: 'p6', type: 'end' as const, x: 200, y: 480, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6' },
      ],
    },
  },
  {
    title: 'Print Multiplication Table',
    description: 'Write a flowchart to print the multiplication table of a given number N up to 10.',
    difficulty: 'Medium',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input N' },
        { id: 'p3', type: 'process' as const, x: 175, y: 210, text: 'i = 1' },
        { id: 'p4', type: 'decision' as const, x: 180, y: 320, text: 'i <= 10?' },
        { id: 'p5', type: 'output' as const, x: 50, y: 470, text: 'Print N × i' },
        { id: 'p6', type: 'process' as const, x: 50, y: 560, text: 'i = i + 1' },
        { id: 'p7', type: 'end' as const, x: 320, y: 470, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5', label: 'Yes' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'p4' },
        { from: 'p4', to: 'p7', label: 'No' },
      ],
    },
  },
  {
    title: 'Calculate Simple Interest',
    description: 'Write a flowchart to calculate simple interest (SI = P × R × T / 100).',
    difficulty: 'Easy',
    solution: {
      nodes: [
        { id: 'p1', type: 'start' as const, x: 200, y: 30, text: 'Start' },
        { id: 'p2', type: 'input' as const, x: 180, y: 120, text: 'Input P, R, T' },
        { id: 'p3', type: 'process' as const, x: 175, y: 210, text: 'SI = P × R × T / 100' },
        { id: 'p4', type: 'output' as const, x: 180, y: 300, text: 'Display SI' },
        { id: 'p5', type: 'end' as const, x: 200, y: 390, text: 'End' },
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
      ],
    },
  },
];

export function FlowchartBuilder({ onClose }: FlowchartBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ from: string; mouseX: number; mouseY: number } | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [connectingFromContext, setConnectingFromContext] = useState<string | null>(null);
  const [connectionContextMenu, setConnectionContextMenu] = useState<{ x: number; y: number; connectionIndex: number } | null>(null);
  const [draggingShape, setDraggingShape] = useState<keyof typeof nodeTemplates | null>(null);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceSpeed, setPracticeSpeed] = useState(1);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [systemNodes, setSystemNodes] = useState<FlowNode[]>([]);
  const [systemConnections, setSystemConnections] = useState<Connection[]>([]);
  const [buildingStep, setBuildingStep] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const systemCanvasRef = useRef<HTMLCanvasElement>(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [systemCompleted, setSystemCompleted] = useState(false);
  const [currentSystemAction, setCurrentSystemAction] = useState<string>('');
  const [nodeAnimations, setNodeAnimations] = useState<Map<string, number>>(new Map());

  // Initialize with a start node
  useEffect(() => {
    if (nodes.length === 0 && !practiceMode) {
      addNode('start', 350, 100);
    }
  }, [practiceMode]);

  // Timer for practice mode
  useEffect(() => {
    if (!practiceMode || !timerRunning) return;

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [practiceMode, timerRunning]);

  // Practice mode auto-building animation with realistic human-like timing
  useEffect(() => {
    if (!practiceMode || !isBuilding) return;

    const problem = practiceProblems[currentProblem];
    const totalSteps = problem.solution.nodes.length + problem.solution.connections.length;

    if (buildingStep >= totalSteps) {
      setIsBuilding(false);
      setSystemCompleted(true);
      setCurrentSystemAction('✓ Flowchart Complete!');
      setTimeout(() => setCurrentSystemAction(''), 2000);
      return;
    }

    // More realistic human-like timing
    const baseDelay = 1000 / practiceSpeed;
    let variableDelay = baseDelay;
    
    const timer = setTimeout(() => {
      if (buildingStep < problem.solution.nodes.length) {
        // Placing a node
        const node = problem.solution.nodes[buildingStep];
        const template = nodeTemplates[node.type];
        
        // Add thinking delay for decision and complex shapes (humans think more)
        const thinkingDelay = node.type === 'decision' ? 300 : node.type === 'process' ? 200 : 100;
        variableDelay = baseDelay + thinkingDelay + (Math.random() * 200); // Add slight randomness
        
        // Update action status
        setCurrentSystemAction(`📍 Placing ${template.label} node...`);
        
        const newNode: FlowNode = {
          ...node,
          width: template.width,
          height: template.height,
          color: template.color,
        };
        
        // Trigger animation for this node
        setNodeAnimations(prev => {
          const newMap = new Map(prev);
          newMap.set(node.id, Date.now());
          return newMap;
        });
        
        setSystemNodes(prev => [...prev, newNode]);
      } else {
        // Creating a connection
        const connIndex = buildingStep - problem.solution.nodes.length;
        const conn = problem.solution.connections[connIndex];
        
        // Connection takes less time but still has slight variation
        variableDelay = baseDelay * 0.6 + (Math.random() * 150);
        
        // Update action status
        const fromNode = problem.solution.nodes.find(n => n.id === conn.from);
        const toNode = problem.solution.nodes.find(n => n.id === conn.to);
        setCurrentSystemAction(`🔗 Connecting ${fromNode?.text || 'node'} → ${toNode?.text || 'node'}...`);
        
        setSystemConnections(prev => [...prev, conn]);
      }
      setBuildingStep(prev => prev + 1);
    }, variableDelay);

    return () => clearTimeout(timer);
  }, [practiceMode, isBuilding, buildingStep, practiceSpeed, currentProblem]);

  // Draw system canvas with animation frame for smooth animations
  useEffect(() => {
    if (!practiceMode) return;
    
    const canvas = systemCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;

    let animationFrameId: number;
    
    const drawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    systemConnections.forEach((conn) => {
      const fromNode = systemNodes.find((n) => n.id === conn.from);
      const toNode = systemNodes.find((n) => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y;

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#64748b';

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      
      const midY = (fromY + toY) / 2;
      ctx.bezierCurveTo(fromX, midY, toX, midY, toX, toY - 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY - 10);
      ctx.lineTo(toX - 8, toY - 20);
      ctx.lineTo(toX + 8, toY - 20);
      ctx.closePath();
      ctx.fill();

      if (conn.label) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.fillText(conn.label, (fromX + toX) / 2 + 10, (fromY + toY) / 2);
      }
    });

    systemNodes.forEach((node) => {
      // Calculate animation progress (fade-in and scale effect)
      const animationStart = nodeAnimations.get(node.id) || 0;
      const elapsed = Date.now() - animationStart;
      const animationDuration = 500; // 500ms animation
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Apply easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const scale = 0.3 + (easeOutCubic * 0.7); // Scale from 30% to 100%
      const opacity = easeOutCubic; // Fade from 0 to 1
      
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Apply scaling transform from center of node
      const centerX = node.x + node.width / 2;
      const centerY = node.y + node.height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      
      ctx.fillStyle = node.color;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;

      const template = nodeTemplates[node.type];
      
      ctx.beginPath();
      
      if (template.shape === 'oval') {
        ctx.ellipse(
          node.x + node.width / 2,
          node.y + node.height / 2,
          node.width / 2,
          node.height / 2,
          0,
          0,
          Math.PI * 2
        );
      } else if (template.shape === 'diamond') {
        ctx.moveTo(node.x + node.width / 2, node.y);
        ctx.lineTo(node.x + node.width, node.y + node.height / 2);
        ctx.lineTo(node.x + node.width / 2, node.y + node.height);
        ctx.lineTo(node.x, node.y + node.height / 2);
        ctx.closePath();
      } else if (template.shape === 'parallelogram') {
        const skew = 20;
        ctx.moveTo(node.x + skew, node.y);
        ctx.lineTo(node.x + node.width, node.y);
        ctx.lineTo(node.x + node.width - skew, node.y + node.height);
        ctx.lineTo(node.x, node.y + node.height);
        ctx.closePath();
      } else {
        ctx.roundRect(node.x, node.y, node.width, node.height, 8);
      }

      ctx.fill();
      ctx.stroke();
      
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const words = node.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > node.width - 20) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);

      const lineHeight = 16;
      const startY = node.y + node.height / 2 - ((lines.length - 1) * lineHeight) / 2;
      
      lines.forEach((line, i) => {
        ctx.fillText(line, node.x + node.width / 2, startY + i * lineHeight);
      });
    });
    
    // Check if any animations are still in progress
    const hasActiveAnimations = Array.from(nodeAnimations.values()).some(
      startTime => Date.now() - startTime < 500
    );
    
    if (hasActiveAnimations || isBuilding) {
      animationFrameId = requestAnimationFrame(drawCanvas);
    }
  };
  
  drawCanvas();
  
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}, [practiceMode, systemNodes, systemConnections, nodeAnimations, isBuilding]);

  // Save to history
  const saveHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], connections: [...connections] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Drawing functions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to large size for scrolling
    canvas.width = 4000;
    canvas.height = 4000;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      const gridSize = 20 * zoom;
      for (let x = pan.x % gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = pan.y % gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    connections.forEach((conn, index) => {
      const fromNode = nodes.find((n) => n.id === conn.from);
      const toNode = nodes.find((n) => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y;

      const isSelectedConnection = selectedConnection === index;

      // Draw curved arrow
      ctx.strokeStyle = animating && connections.indexOf(conn) === animationStep 
        ? '#f59e0b' 
        : isSelectedConnection 
        ? '#ef4444' 
        : '#64748b';
      ctx.lineWidth = animating && connections.indexOf(conn) === animationStep 
        ? 4 
        : isSelectedConnection 
        ? 4 
        : 2;
      ctx.fillStyle = ctx.strokeStyle;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      
      // Bezier curve for smooth connection
      const midY = (fromY + toY) / 2;
      ctx.bezierCurveTo(fromX, midY, toX, midY, toX, toY - 10);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(toY - midY, toX - toX);
      ctx.beginPath();
      ctx.moveTo(toX, toY - 10);
      ctx.lineTo(toX - 8, toY - 20);
      ctx.lineTo(toX + 8, toY - 20);
      ctx.closePath();
      ctx.fill();

      // Draw label
      if (conn.label) {
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.fillText(conn.label, (fromX + toX) / 2 + 10, (fromY + toY) / 2);
      }

      // Draw selection indicator (small circle at midpoint)
      if (isSelectedConnection) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc((fromX + toX) / 2, (fromY + toY) / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw connecting line while dragging
    if (connecting) {
      const fromNode = nodes.find((n) => n.id === connecting.from);
      if (fromNode) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(fromNode.x + fromNode.width / 2, fromNode.y + fromNode.height / 2);
        ctx.lineTo((connecting.mouseX - pan.x) / zoom, (connecting.mouseY - pan.y) / zoom);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode === node.id;
      const isAnimating = animating && nodes.indexOf(node) === Math.floor(animationStep / 2);
      
      ctx.fillStyle = isAnimating ? '#fbbf24' : node.color;
      ctx.strokeStyle = isSelected ? '#1e40af' : '#64748b';
      ctx.lineWidth = isSelected ? 4 : 2;

      // Add glow effect for selected/animating
      if (isSelected || isAnimating) {
        ctx.shadowColor = isAnimating ? '#fbbf24' : '#3b82f6';
        ctx.shadowBlur = 20;
      }

      const template = nodeTemplates[node.type];
      
      ctx.beginPath();
      
      if (template.shape === 'oval') {
        // Oval shape
        ctx.ellipse(
          node.x + node.width / 2,
          node.y + node.height / 2,
          node.width / 2,
          node.height / 2,
          0,
          0,
          Math.PI * 2
        );
      } else if (template.shape === 'diamond') {
        // Diamond shape
        ctx.moveTo(node.x + node.width / 2, node.y);
        ctx.lineTo(node.x + node.width, node.y + node.height / 2);
        ctx.lineTo(node.x + node.width / 2, node.y + node.height);
        ctx.lineTo(node.x, node.y + node.height / 2);
        ctx.closePath();
      } else if (template.shape === 'parallelogram') {
        // Parallelogram shape
        const skew = 20;
        ctx.moveTo(node.x + skew, node.y);
        ctx.lineTo(node.x + node.width, node.y);
        ctx.lineTo(node.x + node.width - skew, node.y + node.height);
        ctx.lineTo(node.x, node.y + node.height);
        ctx.closePath();
      } else {
        // Rectangle
        ctx.roundRect(node.x, node.y, node.width, node.height, 8);
      }

      ctx.fill();
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Word wrap for long text
      const words = node.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > node.width - 20) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);

      const lineHeight = 18;
      const startY = node.y + node.height / 2 - ((lines.length - 1) * lineHeight) / 2;
      
      lines.forEach((line, i) => {
        ctx.fillText(line, node.x + node.width / 2, startY + i * lineHeight);
      });

      // Draw connection points
      if (isSelected) {
        const points = [
          { x: node.x + node.width / 2, y: node.y }, // top
          { x: node.x + node.width / 2, y: node.y + node.height }, // bottom
          { x: node.x, y: node.y + node.height / 2 }, // left
          { x: node.x + node.width, y: node.y + node.height / 2 }, // right
        ];

        points.forEach((point) => {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    });

    ctx.restore();
  }, [nodes, connections, selectedNode, selectedConnection, zoom, pan, showGrid, connecting, animating, animationStep]);

  const addNode = (type: keyof typeof nodeTemplates, x: number, y: number) => {
    const template = nodeTemplates[type];
    const newNode: FlowNode = {
      id: Date.now().toString(),
      type: type as any,
      x: (x - pan.x) / zoom - template.width / 2,
      y: (y - pan.y) / zoom - template.height / 2,
      width: template.width,
      height: template.height,
      text: template.label,
      color: template.color,
    };
    setNodes([...nodes, newNode]);
    saveHistory();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Close context menus if open
    setContextMenu(null);
    setConnectionContextMenu(null);
    setConnectingFromContext(null);

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check if clicking on a node
    const clickedNode = nodes.find(
      (node) =>
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
    );

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      setSelectedConnection(null);
      
      // If in connecting mode from context menu, complete the connection
      if (connectingFromContext && connectingFromContext !== clickedNode.id) {
        const newConnection: Connection = {
          from: connectingFromContext,
          to: clickedNode.id,
        };
        setConnections([...connections, newConnection]);
        setConnectingFromContext(null);
        saveHistory();
      }
    } else {
      // Check if clicking near a connection
      let clickedConnectionIndex = -1;
      connections.forEach((conn, index) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const fromX = fromNode.x + fromNode.width / 2;
        const fromY = fromNode.y + fromNode.height;
        const toX = toNode.x + toNode.width / 2;
        const toY = toNode.y;
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        // Check if click is near the midpoint of the connection
        const distance = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);
        if (distance < 15) {
          clickedConnectionIndex = index;
        }
      });

      if (clickedConnectionIndex >= 0) {
        setSelectedConnection(clickedConnectionIndex);
        setSelectedNode(null);
      } else {
        setSelectedNode(null);
        setSelectedConnection(null);
        setConnectingFromContext(null);
      }
    }
  };

  const handleCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clickedNode = nodes.find(
      (node) =>
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
    );

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: clickedNode.id });
      setConnectionContextMenu(null);
    } else {
      // Check if right-clicking near a connection
      let clickedConnectionIndex = -1;
      connections.forEach((conn, index) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const fromX = fromNode.x + fromNode.width / 2;
        const fromY = fromNode.y + fromNode.height;
        const toX = toNode.x + toNode.width / 2;
        const toY = toNode.y;
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        // Check if click is near the midpoint of the connection
        const distance = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);
        if (distance < 15) {
          clickedConnectionIndex = index;
        }
      });

      if (clickedConnectionIndex >= 0) {
        setSelectedConnection(clickedConnectionIndex);
        setConnectionContextMenu({ x: e.clientX, y: e.clientY, connectionIndex: clickedConnectionIndex });
        setContextMenu(null);
      } else {
        setContextMenu(null);
        setConnectionContextMenu(null);
      }
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clickedNode = nodes.find(
      (node) =>
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
    );

    if (clickedNode) {
      setEditingNode(clickedNode.id);
      setEditText(clickedNode.text);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clickedNode = nodes.find(
      (node) =>
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
    );

    if (clickedNode) {
      if (e.shiftKey) {
        // Shift + click to start connection
        setConnecting({ from: clickedNode.id, mouseX: e.clientX, mouseY: e.clientY });
      } else {
        // Start dragging
        setDraggingNode(clickedNode.id);
        setDragOffset({ x: x - clickedNode.x, y: y - clickedNode.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (draggingNode) {
      setNodes(
        nodes.map((node) =>
          node.id === draggingNode
            ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y }
            : node
        )
      );
    }

    if (connecting) {
      setConnecting({ ...connecting, mouseX: e.clientX, mouseY: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (connecting) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      const targetNode = nodes.find(
        (node) =>
          node.id !== connecting.from &&
          x >= node.x &&
          x <= node.x + node.width &&
          y >= node.y &&
          y <= node.y + node.height
      );

      if (targetNode) {
        const newConnection: Connection = {
          from: connecting.from,
          to: targetNode.id,
        };
        setConnections([...connections, newConnection]);
        saveHistory();
      }
      setConnecting(null);
    }

    if (draggingNode) {
      saveHistory();
      setDraggingNode(null);
    }
  };

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes(nodes.filter((n) => n.id !== selectedNode));
      setConnections(
        connections.filter((c) => c.from !== selectedNode && c.to !== selectedNode)
      );
      setSelectedNode(null);
      saveHistory();
    }
  };

  const autoArrange = () => {
    // Simple top-to-bottom auto-arrange
    const sorted = [...nodes].sort((a, b) => a.y - b.y);
    const arranged = sorted.map((node, index) => ({
      ...node,
      x: 300,
      y: 100 + index * 150,
    }));
    setNodes(arranged);
    saveHistory();
  };

  const generateCode = () => {
    let code = '# Generated Python Code\n\n';
    
    nodes.forEach((node) => {
      if (node.type === 'start') {
        code += '# Start\n';
      } else if (node.type === 'input') {
        const vars = node.text.match(/[A-Za-z]+/g) || [];
        vars.forEach((v) => {
          if (v.toLowerCase() !== 'input') {
            code += `${v} = input("Enter ${v}: ")\n`;
          }
        });
      } else if (node.type === 'process') {
        code += `${node.text}\n`;
      } else if (node.type === 'decision') {
        code += `if ${node.text}:\n    # True path\nelse:\n    # False path\n`;
      } else if (node.type === 'output') {
        const match = node.text.match(/[A-Za-z]+/g);
        if (match) {
          code += `print(${match[match.length - 1]})\n`;
        }
      } else if (node.type === 'end') {
        code += '# End\n';
      }
    });

    return code;
  };

  const animateFlow = () => {
    setAnimating(true);
    setAnimationStep(0);
    
    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        if (prev >= connections.length * 2 + nodes.length) {
          clearInterval(interval);
          setAnimating(false);
          return 0;
        }
        return prev + 1;
      });
    }, 800);
  };

  const loadTemplate = (template: typeof algorithmTemplates[0]) => {
    setNodes(template.nodes.map((n) => ({ ...n, ...nodeTemplates[n.type], text: n.text })));
    setConnections(template.connections);
    saveHistory();
  };

  const saveToFile = () => {
    const data = { nodes, connections };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.json';
    a.click();
  };

  const loadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setNodes(data.nodes);
        setConnections(data.connections);
        saveHistory();
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const startPracticeMode = () => {
    setPracticeMode(true);
    setNodes([]);
    setConnections([]);
    setSystemNodes([]);
    setSystemConnections([]);
    setBuildingStep(0);
    setIsBuilding(false);
    setCurrentProblem(0);
    setTimer(0);
    setTimerRunning(false);
    setScore(0);
    setAttempts(0);
  };

  const exitPracticeMode = () => {
    setPracticeMode(false);
    setNodes([]);
    setConnections([]);
    setSystemNodes([]);
    setSystemConnections([]);
    setBuildingStep(0);
    setIsBuilding(false);
    setTimer(0);
    setTimerRunning(false);
  };

  const startBuilding = () => {
    setSystemNodes([]);
    setSystemConnections([]);
    setBuildingStep(0);
    setIsBuilding(true);
    setSystemCompleted(false);
    if (!timerRunning) {
      setTimer(0);
      setTimerRunning(true);
    }
  };

  const resetBuilding = () => {
    setSystemNodes([]);
    setSystemConnections([]);
    setBuildingStep(0);
    setIsBuilding(false);
    setSystemCompleted(false);
  };

  const changeProblem = (index: number) => {
    setCurrentProblem(index);
    setSystemNodes([]);
    setSystemConnections([]);
    setBuildingStep(0);
    setIsBuilding(false);
    setSystemCompleted(false);
    setNodes([]);
    setConnections([]);
    setTimer(0);
    setTimerRunning(false);
  };

  const checkSolution = () => {
    const problem = practiceProblems[currentProblem];
    const requiredNodes = problem.solution.nodes.length;
    const requiredConnections = problem.solution.connections.length;
    
    let nodeScore = 0;
    let connectionScore = 0;

    // Check if user has correct number of nodes
    if (nodes.length === requiredNodes) {
      nodeScore = 50;
    } else {
      nodeScore = Math.max(0, 50 - Math.abs(nodes.length - requiredNodes) * 10);
    }

    // Check if user has correct number of connections
    if (connections.length === requiredConnections) {
      connectionScore = 50;
    } else {
      connectionScore = Math.max(0, 50 - Math.abs(connections.length - requiredConnections) * 10);
    }

    const totalScore = nodeScore + connectionScore;
    
    // Time bonus: if completed faster, add bonus points
    const expectedTime = requiredNodes * 10; // 10 seconds per node
    const timeBonus = timer < expectedTime ? Math.floor((expectedTime - timer) / 5) : 0;
    
    const finalScore = Math.min(100, totalScore + timeBonus);
    
    setScore(finalScore);
    setAttempts(prev => prev + 1);
    setTimerRunning(false);

    if (bestTime === null || timer < bestTime) {
      setBestTime(timer);
    }

    const resultMessage = finalScore >= 80 
      ? `🎉 Excellent! Score: ${finalScore}/100\nTime: ${Math.floor(timer / 60)}m ${timer % 60}s`
      : finalScore >= 60
      ? `👍 Good effort! Score: ${finalScore}/100\nTime: ${Math.floor(timer / 60)}m ${timer % 60}s\nKeep practicing!`
      : `💪 Keep trying! Score: ${finalScore}/100\nTime: ${Math.floor(timer / 60)}m ${timer % 60}s\nReview the solution and try again!`;

    alert(resultMessage);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              Flowchart Builder Pro
            </h2>
            <p className="text-xs text-gray-500">Drag, connect, and create amazing flowcharts</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {nodes.length} Nodes
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {connections.length} Connections
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Node Palette */}
          <div className="w-72 border-r-2 border-gray-200 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Flowchart Shapes</h3>
            <div className="space-y-2">
              {(Object.keys(nodeTemplates) as Array<keyof typeof nodeTemplates>).map((type) => {
                const template = nodeTemplates[type];
                return (
                  <button
                    key={type}
                    draggable
                    onDragStart={(e) => {
                      setDraggingShape(type);
                      e.dataTransfer.effectAllowed = 'copy';
                      
                      // Create SVG drag preview with correct shape
                      const dragPreview = document.createElement('div');
                      dragPreview.style.position = 'absolute';
                      dragPreview.style.top = '-1000px';
                      dragPreview.style.width = '100px';
                      dragPreview.style.height = '70px';
                      
                      // Create SVG with proper shape
                      const svgNS = 'http://www.w3.org/2000/svg';
                      const svg = document.createElementNS(svgNS, 'svg');
                      svg.setAttribute('viewBox', '0 0 100 70');
                      svg.setAttribute('width', '100');
                      svg.setAttribute('height', '70');
                      svg.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))';
                      
                      if (template.shape === 'oval') {
                        const ellipse = document.createElementNS(svgNS, 'ellipse');
                        ellipse.setAttribute('cx', '50');
                        ellipse.setAttribute('cy', '35');
                        ellipse.setAttribute('rx', '45');
                        ellipse.setAttribute('ry', '30');
                        ellipse.setAttribute('fill', template.color);
                        ellipse.setAttribute('stroke', 'white');
                        ellipse.setAttribute('stroke-width', '3');
                        svg.appendChild(ellipse);
                      } else if (template.shape === 'rect') {
                        const rect = document.createElementNS(svgNS, 'rect');
                        rect.setAttribute('x', '5');
                        rect.setAttribute('y', '10');
                        rect.setAttribute('width', '90');
                        rect.setAttribute('height', '50');
                        rect.setAttribute('rx', '5');
                        rect.setAttribute('fill', template.color);
                        rect.setAttribute('stroke', 'white');
                        rect.setAttribute('stroke-width', '3');
                        svg.appendChild(rect);
                      } else if (template.shape === 'diamond') {
                        const path = document.createElementNS(svgNS, 'path');
                        path.setAttribute('d', 'M 50 5 L 95 35 L 50 65 L 5 35 Z');
                        path.setAttribute('fill', template.color);
                        path.setAttribute('stroke', 'white');
                        path.setAttribute('stroke-width', '3');
                        svg.appendChild(path);
                      } else if (template.shape === 'parallelogram') {
                        const path = document.createElementNS(svgNS, 'path');
                        path.setAttribute('d', 'M 20 10 L 95 10 L 80 60 L 5 60 Z');
                        path.setAttribute('fill', template.color);
                        path.setAttribute('stroke', 'white');
                        path.setAttribute('stroke-width', '3');
                        svg.appendChild(path);
                      }
                      
                      // Add text
                      const text = document.createElementNS(svgNS, 'text');
                      text.setAttribute('x', '50');
                      text.setAttribute('y', '40');
                      text.setAttribute('text-anchor', 'middle');
                      text.setAttribute('fill', 'white');
                      text.setAttribute('font-size', '12');
                      text.setAttribute('font-weight', 'bold');
                      text.textContent = type.toUpperCase();
                      svg.appendChild(text);
                      
                      dragPreview.appendChild(svg);
                      document.body.appendChild(dragPreview);
                      e.dataTransfer.setDragImage(dragPreview, 50, 35);
                      
                      // Clean up after a moment
                      setTimeout(() => {
                        if (document.body.contains(dragPreview)) {
                          document.body.removeChild(dragPreview);
                        }
                      }, 0);
                    }}
                    onDragEnd={() => {
                      setDraggingShape(null);
                      setDragPreview(null);
                    }}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group cursor-move"
                  >
                    {/* SVG Shape Preview */}
                    <div className="flex items-center justify-center mb-2 h-14">
                      <svg viewBox="0 0 100 60" className="w-full h-full">
                        <defs>
                          <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: template.color, stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: template.color, stopOpacity: 0.7 }} />
                          </linearGradient>
                        </defs>
                        
                        {template.shape === 'oval' && (
                          <ellipse
                            cx="50"
                            cy="30"
                            rx="45"
                            ry="25"
                            fill={`url(#grad-${type})`}
                            stroke="#374151"
                            strokeWidth="2"
                          />
                        )}
                        
                        {template.shape === 'rect' && (
                          <rect
                            x="10"
                            y="10"
                            width="80"
                            height="40"
                            rx="4"
                            fill={`url(#grad-${type})`}
                            stroke="#374151"
                            strokeWidth="2"
                          />
                        )}
                        
                        {template.shape === 'diamond' && (
                          <path
                            d="M 50 5 L 95 30 L 50 55 L 5 30 Z"
                            fill={`url(#grad-${type})`}
                            stroke="#374151"
                            strokeWidth="2"
                          />
                        )}
                        
                        {template.shape === 'parallelogram' && (
                          <path
                            d="M 20 10 L 90 10 L 80 50 L 10 50 Z"
                            fill={`url(#grad-${type})`}
                            stroke="#374151"
                            strokeWidth="2"
                          />
                        )}
                        
                        <text
                          x="50"
                          y="35"
                          textAnchor="middle"
                          fill="white"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {type === 'start' ? 'START' : 
                           type === 'end' ? 'END' : 
                           type === 'process' ? 'PROCESS' : 
                           type === 'decision' ? '?' : 
                           type === 'input' ? 'INPUT' : 'OUTPUT'}
                        </text>
                      </svg>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-700 capitalize mb-0.5">{type}</p>
                      <p className="text-xs text-gray-500">
                        {type === 'start' ? 'Begin program' : 
                         type === 'end' ? 'End program' : 
                         type === 'process' ? 'Operations' : 
                         type === 'decision' ? 'Yes/No' : 
                         type === 'input' ? 'User input' : 'Display output'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Templates */}
            <h3 className="text-xs font-semibold text-gray-700 mb-3 mt-5 uppercase tracking-wide">Quick Templates</h3>
            <div className="space-y-2">
              {algorithmTemplates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => loadTemplate(template)}
                  className="w-full p-2.5 bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg hover:shadow-lg hover:border-purple-400 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-gray-800">{template.name}</p>
                  </div>
                  <p className="text-xs text-gray-600">{template.nodes.length} nodes</p>
                </button>
              ))}
            </div>

            {showSuggestions && selectedNode && (
              <>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 mt-5 uppercase tracking-wide flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Quick Tips
                </h3>
                <div className="space-y-2">
                  <div className="p-2 bg-yellow-50 border border-yellow-300 rounded-lg text-xs">
                    <p className="text-gray-700 font-medium">💡 Double-click any node to edit its text</p>
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-300 rounded-lg text-xs">
                    <p className="text-gray-700 font-medium">🔗 Hold Shift + Click to connect nodes</p>
                  </div>
                  <div className="p-2 bg-green-50 border border-green-300 rounded-lg text-xs">
                    <p className="text-gray-700 font-medium">🎯 Drag nodes to reposition them</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Practice Mode Problem Statement Banner */}
            {practiceMode && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 border-b-2 border-orange-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-white/20 text-white border-white/40">
                        Problem {currentProblem + 1} of {practiceProblems.length}
                      </Badge>
                      <Badge className={`${
                        practiceProblems[currentProblem].difficulty === 'Easy' ? 'bg-green-500' :
                        practiceProblems[currentProblem].difficulty === 'Medium' ? 'bg-yellow-500' :
                        'bg-red-600'
                      } text-white`}>
                        {practiceProblems[currentProblem].difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{practiceProblems[currentProblem].title}</h3>
                    <p className="text-sm opacity-90">{practiceProblems[currentProblem].description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exitPracticeMode}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Exit Practice
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Mode Controls */}
            {practiceMode && (
              <div className="bg-gray-100 p-3 border-b border-gray-200">
                {/* Top Row - Timer, Score, Check Solution */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className="bg-white px-4 py-2 rounded-lg border-2 border-blue-500 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⏱️</span>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">TIME</p>
                          <p className="text-lg font-bold text-blue-600">
                            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="bg-white px-4 py-2 rounded-lg border-2 border-green-500 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">SCORE</p>
                          <p className="text-lg font-bold text-green-600">{score}/100</p>
                        </div>
                      </div>
                    </div>

                    {/* Attempts */}
                    <div className="bg-white px-4 py-2 rounded-lg border-2 border-purple-500 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">ATTEMPTS</p>
                          <p className="text-lg font-bold text-purple-600">{attempts}</p>
                        </div>
                      </div>
                    </div>

                    {bestTime !== null && (
                      <div className="bg-white px-4 py-2 rounded-lg border-2 border-yellow-500 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold">BEST TIME</p>
                            <p className="text-lg font-bold text-yellow-600">
                              {Math.floor(bestTime / 60)}:{(bestTime % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={checkSolution}
                    disabled={nodes.length === 0}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 px-6 py-3 shadow-lg"
                  >
                    <Badge className="bg-white/20 text-white mr-2">✓</Badge>
                    Check My Solution
                  </Button>
                </div>

                {/* Bottom Row - Speed Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-semibold">System Speed:</span>
                    {[1, 1.5, 2, 3].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPracticeSpeed(speed)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          practiceSpeed === speed
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startBuilding}
                      disabled={isBuilding}
                      className={`${
                        isBuilding 
                          ? 'bg-gray-400 text-white' 
                          : 'bg-green-500 text-white hover:bg-green-600 animate-pulse shadow-lg'
                      }`}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {isBuilding ? '🏁 Race Started!' : '🚀 Start Building'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetBuilding}
                      disabled={!isBuilding && systemNodes.length === 0}
                    >
                      <Undo className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Change Problem:</span>
                    {practiceProblems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => changeProblem(index)}
                        className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                          currentProblem === index
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
                {isBuilding && (
                  <div className="mt-3 space-y-2">
                    {/* System Progress */}
                    <div className="bg-white p-2 rounded-lg border-2 border-orange-500">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-orange-700">🤖 System Progress:</span>
                        <span className="text-xs text-orange-600 font-bold">
                          Step {buildingStep} of {practiceProblems[currentProblem].solution.nodes.length + practiceProblems[currentProblem].solution.connections.length}
                        </span>
                      </div>
                      <div className="w-full bg-orange-100 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(buildingStep / (practiceProblems[currentProblem].solution.nodes.length + practiceProblems[currentProblem].solution.connections.length)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Student Progress */}
                    <div className="bg-white p-2 rounded-lg border-2 border-blue-500">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-700">👨‍💻 Your Progress:</span>
                        <span className="text-xs text-blue-600 font-bold">
                          {nodes.length} / {practiceProblems[currentProblem].solution.nodes.length} nodes
                          {nodes.length >= practiceProblems[currentProblem].solution.nodes.length && ' ✓'}
                        </span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((nodes.length / practiceProblems[currentProblem].solution.nodes.length) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Race Status Indicator */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg text-center">
                      <p className="text-xs font-bold">
                        {nodes.length > systemNodes.length 
                          ? '🔥 You\'re AHEAD! Keep going!' 
                          : nodes.length === systemNodes.length 
                          ? '⚡ Neck and neck! You can do it!' 
                          : '🚀 System is ahead! Speed up!'}
                      </p>
                      <p className="text-[10px] opacity-80 mt-0.5">
                        Gap: {Math.abs(nodes.length - systemNodes.length)} node{Math.abs(nodes.length - systemNodes.length) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                  <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                  <Redo className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (confirm('Clear entire canvas? This cannot be undone.')) {
                      setNodes([]);
                      setConnections([]);
                      saveHistory();
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  <span className="text-xs">Clear All</span>
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={autoArrange}>
                  <Wand2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(zoom + 0.1, 2))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-600 ml-1">{Math.round(zoom * 100)}%</span>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={deleteSelected} disabled={!selectedNode}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={saveToFile}>
                  <Save className="w-4 h-4" />
                </Button>
                <label>
                  <Button variant="ghost" size="sm" as="span">
                    <Upload className="w-4 h-4" />
                  </Button>
                  <input type="file" accept=".json" onChange={loadFromFile} className="hidden" />
                </label>
                <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
                  <Code className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={animateFlow} disabled={animating}>
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Canvas - Split in Practice Mode */}
            <div className={`flex-1 flex ${practiceMode ? 'flex-row' : 'flex-col'}`}>
              {/* User Canvas */}
              <div 
                className={`${
                  practiceMode 
                    ? isBuilding 
                      ? 'flex-1 border-r-4 border-orange-500' 
                      : 'w-full border-r-4 border-orange-500' 
                    : 'flex-1'
                } relative overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-500`}
                ref={containerRef}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggingShape) {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const rect = canvas.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      addNode(draggingShape, x, y);
                    }
                  }
                }}
              >
                <div className="relative" style={{ width: '4000px', height: '4000px' }}>
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onContextMenu={handleCanvasRightClick}
                    onDoubleClick={handleCanvasDoubleClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="absolute top-0 left-0"
                  style={{ cursor: draggingNode ? 'grabbing' : connecting || connectingFromContext ? 'crosshair' : 'default' }}
                />

                {/* Floating Help */}
                {!practiceMode ? (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs space-y-1 z-10">
                    <p className="text-gray-600">🎨 Drag & Drop shapes from sidebar</p>
                    <p className="text-gray-600">🖱️ Click: Select node</p>
                    <p className="text-gray-600">🖱️ Double-click: Edit text</p>
                    <p className="text-gray-600">🖱️ Right-click: Context menu</p>
                    <p className="text-gray-600">⇧ + Click: Connect nodes</p>
                    <p className="text-gray-600">🗑️ Del: Delete selected</p>
                  </div>
                ) : !isBuilding ? (
                  <div className="absolute top-4 left-4 bg-gradient-to-br from-blue-500 to-purple-500 text-white p-4 rounded-lg shadow-2xl text-xs space-y-2 z-10 border-2 border-white animate-pulse">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <span className="text-lg">🚦</span>
                      READY TO RACE?
                    </p>
                    <p className="opacity-90">Press "Start Building" below to begin!</p>
                    <div className="border-t border-white/30 pt-2 space-y-1">
                      <p>🏁 System will build on the right →</p>
                      <p>⚡ Your goal: Match its speed!</p>
                      <p>🎯 Complete the flowchart correctly</p>
                    </div>
                  </div>
                ) : systemCompleted && nodes.length < practiceProblems[currentProblem].solution.nodes.length ? (
                  <div className="absolute top-4 left-4 bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-4 rounded-lg shadow-2xl text-xs space-y-2 z-10 border-2 border-white animate-pulse">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <span className="text-lg">⏰</span>
                      SYSTEM FINISHED!
                    </p>
                    <p className="opacity-90">Keep going! Complete your solution!</p>
                    <div className="border-t border-white/30 pt-2 space-y-1">
                      <p>✓ System done: {systemNodes.length} nodes</p>
                      <p>⚡ You have: {nodes.length} nodes</p>
                      <p>🎯 Target: {practiceProblems[currentProblem].solution.nodes.length} nodes</p>
                    </div>
                  </div>
                ) : systemCompleted ? (
                  <div className="absolute top-4 left-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white p-4 rounded-lg shadow-2xl text-xs space-y-2 z-10 border-2 border-white animate-bounce">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <span className="text-lg">🏆</span>
                      GREAT JOB!
                    </p>
                    <p className="opacity-90">You kept up with the system!</p>
                    <div className="border-t border-white/30 pt-2 space-y-1">
                      <p>✓ Both completed!</p>
                      <p>🎯 Now click \"Check My Solution\"</p>
                      <p>🌟 See how you did!</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-4 left-4 bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-2xl text-xs space-y-2 z-10 border-2 border-white">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <span className="text-lg">👨‍💻</span>
                      YOUR CANVAS - GO GO GO!
                    </p>
                    <p className="opacity-90">The system is building now!</p>
                    <div className="border-t border-white/30 pt-2 space-y-1">
                      <p>🎨 Drag shapes from left sidebar</p>
                      <p>🔗 Connect with Shift + Click</p>
                      <p>⚡ Match the system speed at {practiceSpeed}x!</p>
                    </div>
                  </div>
                )}

                {/* Animation Indicator */}
                {animating && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-10">
                    🎬 Animating Flow...
                  </div>
                )}
              </div>
            </div>

            {/* System Canvas Placeholder - Waiting to start */}
            {practiceMode && !isBuilding && !systemCompleted && (
              <div className="w-16 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-dashed border-orange-400 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-60">
                  <div className="text-4xl rotate-90">👉</div>
                  <div className="text-xs text-gray-500 font-semibold -rotate-90 whitespace-nowrap">
                    System Canvas Will Appear Here
                  </div>
                  <div className="text-2xl rotate-90 animate-pulse">🚀</div>
                </div>
              </div>
            )}

            {/* System Canvas - Only visible when building starts in Practice Mode */}
            {practiceMode && (isBuilding || systemCompleted) && (
              <div className="flex-1 flex flex-col bg-gradient-to-br from-orange-50 to-red-50 animate-slide-in-right">
                <div className={`${systemCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-orange-500'} text-white p-3 text-center border-b-2 ${systemCompleted ? 'border-green-600' : 'border-orange-600'} transition-all duration-500`}>
                  <h3 className="font-semibold flex items-center justify-center gap-2">
                    {systemCompleted ? (
                      <>
                        <CheckCircle className="w-5 h-5 animate-bounce" />
                        System Completed! 🎉
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5" />
                        System Building... 🚀
                      </>
                    )}
                  </h3>
                  <p className="text-xs opacity-90 mt-1">
                    {systemCompleted 
                      ? '✓ Now complete your solution and press "Check My Solution"!' 
                      : '🏁 Try to match the system speed at ' + practiceSpeed + 'x!'}
                  </p>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-start justify-center relative">
                  <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200">
                    <canvas
                      ref={systemCanvasRef}
                      className="rounded-lg"
                    />
                  </div>
                  {isBuilding && !systemCompleted && (
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-2xl z-10 border-2 border-white/50 animate-pulse">
                      <p className="text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                        System Building Live...
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-white border-t-2 border-orange-200 p-3">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                      <strong>Your Task:</strong> Build the same flowchart on the left canvas
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <strong>Challenge:</strong> Try to match the speed at {practiceSpeed}x!
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <strong>Nodes:</strong> {practiceProblems[currentProblem].solution.nodes.length} shapes required
                    </p>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Right Sidebar - Code & Properties */}
        {showCode && !practiceMode && (
            <div className="w-80 border-l border-gray-200 p-3 overflow-y-auto bg-gray-50">
              <h3 className="text-xs text-gray-500 mb-2">GENERATED CODE</h3>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {generateCode()}
              </pre>

              <h3 className="text-xs text-gray-500 mb-2 mt-4">TEST YOUR ALGORITHM</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter test input..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs"
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setTestOutput(`Output: Processing "${testInput}"...`);
                    setTimeout(() => setTestOutput('Result calculated!'), 1000);
                  }}
                >
                  <Play className="w-3 h-3 mr-2" />
                  Run Test
                </Button>
                {testOutput && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                    {testOutput}
                  </div>
                )}
              </div>

              {selectedNode && (
                <>
                  <h3 className="text-xs text-gray-500 mb-2 mt-4">NODE PROPERTIES</h3>
                  <div className="space-y-2">
                    {nodes
                      .filter((n) => n.id === selectedNode)
                      .map((node) => (
                        <div key={node.id} className="p-2 bg-white border border-gray-200 rounded text-xs">
                          <p className="text-gray-600 mb-1">Type: <span className="capitalize">{node.type}</span></p>
                          <p className="text-gray-600 mb-1">Position: ({Math.round(node.x)}, {Math.round(node.y)})</p>
                          <p className="text-gray-600">Text: {node.text}</p>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingNode && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg mb-3">Edit Node Text</h3>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setNodes(nodes.map((n) => (n.id === editingNode ? { ...n, text: editText } : n)));
                    setEditingNode(null);
                    saveHistory();
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingNode(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setNodes(nodes.map((n) => (n.id === editingNode ? { ...n, text: editText } : n)));
                    setEditingNode(null);
                    saveHistory();
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-white rounded-lg shadow-2xl border-2 border-gray-200 py-1 z-[60] min-w-[180px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors"
              onClick={() => {
                setEditingNode(contextMenu.nodeId);
                const node = nodes.find((n) => n.id === contextMenu.nodeId);
                if (node) setEditText(node.text);
                setContextMenu(null);
              }}
            >
              <Wand2 className="w-4 h-4 text-blue-600" />
              <span>Edit Text</span>
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
              onClick={() => {
                setConnectingFromContext(contextMenu.nodeId);
                setContextMenu(null);
              }}
            >
              <Link className="w-4 h-4 text-green-600" />
              <span>Connect to...</span>
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors text-red-600"
              onClick={() => {
                setNodes(nodes.filter((n) => n.id !== contextMenu.nodeId));
                setConnections(
                  connections.filter((c) => c.from !== contextMenu.nodeId && c.to !== contextMenu.nodeId)
                );
                setSelectedNode(null);
                setContextMenu(null);
                saveHistory();
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Node</span>
            </button>
          </div>
        )}

        {/* Connecting From Context Indicator */}
        {connectingFromContext && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-10 flex items-center gap-2">
            <Link className="w-5 h-5 animate-pulse" />
            <span>Click on another node to create a connection</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConnectingFromContext(null)}
              className="text-white hover:bg-green-600 ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Connection Context Menu */}
        {connectionContextMenu && (
          <div
            className="fixed bg-white rounded-lg shadow-2xl border-2 border-gray-200 py-1 z-[60] min-w-[180px]"
            style={{
              left: `${connectionContextMenu.x}px`,
              top: `${connectionContextMenu.y}px`,
            }}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors text-red-600"
              onClick={() => {
                const newConnections = connections.filter((_, index) => index !== connectionContextMenu.connectionIndex);
                setConnections(newConnections);
                setSelectedConnection(null);
                setConnectionContextMenu(null);
                saveHistory();
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Connection</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}