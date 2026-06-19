import { useState, useRef, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Lightbulb, User, 
  Play, Pause, RotateCcw, Circle, Square, Diamond, 
  ArrowRight, Zap, MonitorPlay, Edit2, Trash2, Gauge,
  Timer, Award, Target, TrendingUp, Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';

interface FlowchartBuilderPracticeProps {
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
  displayText?: string;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solution: {
    nodes: FlowNode[];
    connections: Connection[];
  };
  hints: string[];
}

const nodeTemplates = {
  start: { width: 100, height: 50, color: '#22c55e', shape: 'oval' },
  end: { width: 100, height: 50, color: '#ef4444', shape: 'oval' },
  process: { width: 120, height: 60, color: '#3b82f6', shape: 'rect' },
  decision: { width: 100, height: 100, color: '#f59e0b', shape: 'diamond' },
  input: { width: 130, height: 60, color: '#8b5cf6', shape: 'parallelogram' },
  output: { width: 130, height: 60, color: '#06b6d4', shape: 'parallelogram' },
};

// Helper function to create SVG drag preview
const createDragPreview = (type: keyof typeof nodeTemplates, label: string) => {
  const template = nodeTemplates[type];
  const dragPreview = document.createElement('div');
  dragPreview.style.position = 'absolute';
  dragPreview.style.top = '-1000px';
  dragPreview.style.width = '100px';
  dragPreview.style.height = '70px';
  
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
  
  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', '50');
  text.setAttribute('y', '40');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', 'white');
  text.setAttribute('font-size', '11');
  text.setAttribute('font-weight', 'bold');
  text.textContent = label;
  svg.appendChild(text);
  
  dragPreview.appendChild(svg);
  document.body.appendChild(dragPreview);
  
  return dragPreview;
};

const problems: Problem[] = [
  {
    id: 'p1',
    title: 'Add Two Numbers',
    description: 'Create a flowchart to input two numbers and output their sum',
    difficulty: 'easy',
    solution: {
      nodes: [
        { id: '1', type: 'start', x: 150, y: 30, width: 100, height: 50, text: 'Start', color: '#22c55e' },
        { id: '2', type: 'input', x: 135, y: 110, width: 130, height: 60, text: 'Input A, B', color: '#8b5cf6' },
        { id: '3', type: 'process', x: 140, y: 200, width: 120, height: 60, text: 'Sum = A + B', color: '#3b82f6' },
        { id: '4', type: 'output', x: 135, y: 290, width: 130, height: 60, text: 'Output Sum', color: '#06b6d4' },
        { id: '5', type: 'end', x: 150, y: 380, width: 100, height: 50, text: 'End', color: '#ef4444' },
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '3', to: '4' },
        { from: '4', to: '5' },
      ]
    },
    hints: [
      'Start with a Start node',
      'Input A and B',
      'Calculate Sum',
      'Output the result'
    ]
  },
  {
    id: 'p2',
    title: 'Check Even or Odd',
    description: 'Create a flowchart to check if a number is even or odd',
    difficulty: 'medium',
    solution: {
      nodes: [
        { id: '1', type: 'start', x: 200, y: 30, width: 100, height: 50, text: 'Start', color: '#22c55e' },
        { id: '2', type: 'input', x: 185, y: 110, width: 130, height: 60, text: 'Input N', color: '#8b5cf6' },
        { id: '3', type: 'decision', x: 200, y: 210, width: 100, height: 100, text: 'N % 2 = 0?', color: '#f59e0b' },
        { id: '4', type: 'output', x: 65, y: 350, width: 130, height: 60, text: 'Even', color: '#06b6d4' },
        { id: '5', type: 'output', x: 305, y: 350, width: 130, height: 60, text: 'Odd', color: '#06b6d4' },
        { id: '6', type: 'end', x: 200, y: 460, width: 100, height: 50, text: 'End', color: '#ef4444' },
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '3', to: '4', label: 'Yes' },
        { from: '3', to: '5', label: 'No' },
        { from: '4', to: '6' },
        { from: '5', to: '6' },
      ]
    },
    hints: [
      'Use Decision node',
      'Check N % 2 = 0',
      'Two branches',
      'Both end at End node'
    ]
  },
  {
    id: 'p3',
    title: 'Find Maximum',
    description: 'Find the largest of three numbers',
    difficulty: 'hard',
    solution: {
      nodes: [
        { id: '1', type: 'start', x: 200, y: 30, width: 100, height: 50, text: 'Start', color: '#22c55e' },
        { id: '2', type: 'input', x: 185, y: 110, width: 130, height: 60, text: 'Input A,B,C', color: '#8b5cf6' },
        { id: '3', type: 'decision', x: 200, y: 210, width: 100, height: 100, text: 'A > B?', color: '#f59e0b' },
        { id: '4', type: 'decision', x: 80, y: 350, width: 100, height: 100, text: 'A > C?', color: '#f59e0b' },
        { id: '5', type: 'decision', x: 320, y: 350, width: 100, height: 100, text: 'B > C?', color: '#f59e0b' },
        { id: '6', type: 'output', x: 5, y: 490, width: 130, height: 60, text: 'Max = A', color: '#06b6d4' },
        { id: '7', type: 'output', x: 155, y: 490, width: 130, height: 60, text: 'Max = C', color: '#06b6d4' },
        { id: '8', type: 'output', x: 245, y: 490, width: 130, height: 60, text: 'Max = B', color: '#06b6d4' },
        { id: '9', type: 'output', x: 395, y: 490, width: 130, height: 60, text: 'Max = C', color: '#06b6d4' },
        { id: '10', type: 'end', x: 200, y: 590, width: 100, height: 50, text: 'End', color: '#ef4444' },
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '3', to: '4', label: 'Yes' },
        { from: '3', to: '5', label: 'No' },
        { from: '4', to: '6', label: 'Yes' },
        { from: '4', to: '7', label: 'No' },
        { from: '5', to: '8', label: 'Yes' },
        { from: '5', to: '9', label: 'No' },
        { from: '6', to: '10' },
        { from: '7', to: '10' },
        { from: '8', to: '10' },
        { from: '9', to: '10' },
      ]
    },
    hints: [
      'Compare A and B first',
      'Then compare with C',
      'Nested decisions',
      'All paths end together'
    ]
  },
  {
    id: 'p4',
    title: 'Calculate Factorial',
    description: 'Calculate factorial using a loop',
    difficulty: 'hard',
    solution: {
      nodes: [
        { id: '1', type: 'start', x: 150, y: 30, width: 100, height: 50, text: 'Start', color: '#22c55e' },
        { id: '2', type: 'input', x: 135, y: 110, width: 130, height: 60, text: 'Input N', color: '#8b5cf6' },
        { id: '3', type: 'process', x: 140, y: 200, width: 120, height: 60, text: 'F=1, i=1', color: '#3b82f6' },
        { id: '4', type: 'decision', x: 150, y: 300, width: 100, height: 100, text: 'i <= N?', color: '#f59e0b' },
        { id: '5', type: 'process', x: 140, y: 440, width: 120, height: 60, text: 'F = F * i', color: '#3b82f6' },
        { id: '6', type: 'process', x: 140, y: 530, width: 120, height: 60, text: 'i = i + 1', color: '#3b82f6' },
        { id: '7', type: 'output', x: 305, y: 350, width: 130, height: 60, text: 'Output F', color: '#06b6d4' },
        { id: '8', type: 'end', x: 335, y: 450, width: 100, height: 50, text: 'End', color: '#ef4444' },
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '3', to: '4' },
        { from: '4', to: '5', label: 'Yes' },
        { from: '5', to: '6' },
        { from: '6', to: '4' },
        { from: '4', to: '7', label: 'No' },
        { from: '7', to: '8' },
      ]
    },
    hints: [
      'Initialize F=1, i=1',
      'Loop while i <= N',
      'Multiply F by i',
      'Increment i each time'
    ]
  }
];

export function FlowchartBuilderPractice({ onClose }: FlowchartBuilderPracticeProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [studentNodes, setStudentNodes] = useState<FlowNode[]>([]);
  const [systemNodes, setSystemNodes] = useState<FlowNode[]>([]);
  const [studentConnections, setStudentConnections] = useState<Connection[]>([]);
  const [systemConnections, setSystemConnections] = useState<Connection[]>([]);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoSpeed, setDemoSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showHints, setShowHints] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [dragConnection, setDragConnection] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);
  const [draggingShape, setDraggingShape] = useState<keyof typeof nodeTemplates | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [inlineEditingNode, setInlineEditingNode] = useState<{ id: string; x: number; y: number; width: number; height: number } | null>(null);
  const [inlineEditText, setInlineEditText] = useState('');
  const [draggingNode, setDraggingNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  
  const studentCanvasRef = useRef<HTMLCanvasElement>(null);
  const systemCanvasRef = useRef<HTMLCanvasElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const currentProblem = problems[currentProblemIndex];

  const speedSettings = {
    slow: { nodeDelay: 3000, typingSpeed: 150, defaultTextDelay: 800 },
    normal: { nodeDelay: 2000, typingSpeed: 80, defaultTextDelay: 500 },
    fast: { nodeDelay: 1000, typingSpeed: 40, defaultTextDelay: 300 }
  };

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Auto-start timer when first node is added
  useEffect(() => {
    if (studentNodes.length > 0 && !isTimerRunning) {
      setIsTimerRunning(true);
    }
  }, [studentNodes.length]);

  // Auto-play system demonstration with realistic workflow
  useEffect(() => {
    if (isDemoPlaying && demoStep < currentProblem.solution.nodes.length) {
      const timer = setTimeout(() => {
        const solutionNode = currentProblem.solution.nodes[demoStep];
        
        // Get default text based on node type
        const defaultText = solutionNode.type === 'start' ? 'Start' : 
                           solutionNode.type === 'end' ? 'End' : 
                           solutionNode.type === 'process' ? 'Process' :
                           solutionNode.type === 'decision' ? 'Decision?' :
                           solutionNode.type === 'input' ? 'Input' : 'Output';
        
        // Step 1: Add node with default text
        const newNode = { 
          ...solutionNode, 
          displayText: defaultText,
          text: solutionNode.text // Keep final text
        };
        setSystemNodes(prev => [...prev, newNode]);
        
        // Step 2: Wait a bit, then start typing the actual text
        const editDelay = setTimeout(() => {
          const fullText = solutionNode.text;
          let charIndex = 0;
          
          // First clear to empty
          setSystemNodes(prev => 
            prev.map((node, idx) => 
              idx === prev.length - 1 
                ? { ...node, displayText: '' }
                : node
            )
          );
          
          // Then type the actual text
          const typingInterval = setInterval(() => {
            if (charIndex <= fullText.length) {
              setSystemNodes(prev => 
                prev.map((node, idx) => 
                  idx === prev.length - 1 
                    ? { ...node, displayText: fullText.substring(0, charIndex) }
                    : node
                )
              );
              charIndex++;
            } else {
              clearInterval(typingInterval);
              
              // Add connections for this node
              const nodeConnections = currentProblem.solution.connections.filter(
                conn => conn.from === solutionNode.id
              );
              if (nodeConnections.length > 0) {
                setSystemConnections(prev => [...prev, ...nodeConnections]);
              }
              
              setDemoStep(prev => prev + 1);
            }
          }, speedSettings[demoSpeed].typingSpeed);

          return () => clearInterval(typingInterval);
        }, speedSettings[demoSpeed].defaultTextDelay);

        return () => {
          clearTimeout(editDelay);
        };
      }, speedSettings[demoSpeed].nodeDelay);
      
      return () => clearTimeout(timer);
    } else if (demoStep >= currentProblem.solution.nodes.length) {
      setIsDemoPlaying(false);
    }
  }, [isDemoPlaying, demoStep, currentProblem, demoSpeed]);

  // Draw flowchart
  useEffect(() => {
    drawFlowchart(studentCanvasRef.current, studentNodes, studentConnections, dragConnection, false, selectedNodeId);
  }, [studentNodes, studentConnections, dragConnection, selectedNodeId]);

  useEffect(() => {
    drawFlowchart(systemCanvasRef.current, systemNodes, systemConnections, null, true);
  }, [systemNodes, systemConnections]);

  const drawFlowchart = (
    canvas: HTMLCanvasElement | null, 
    nodes: FlowNode[], 
    connections: Connection[],
    dragConn: { fromX: number; fromY: number; toX: number; toY: number } | null = null,
    useDisplayText = false,
    selectedNodeId: string | null = null
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw drag connection
    if (dragConn) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(dragConn.fromX, dragConn.fromY);
      ctx.lineTo(dragConn.toX, dragConn.toY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw connections
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x + fromNode.width / 2, fromNode.y + fromNode.height);
        ctx.lineTo(toNode.x + toNode.width / 2, toNode.y);
        ctx.stroke();

        // Arrow
        const angle = Math.atan2(toNode.y - (fromNode.y + fromNode.height), toNode.x - fromNode.x);
        ctx.save();
        ctx.translate(toNode.x + toNode.width / 2, toNode.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -6);
        ctx.lineTo(-12, 6);
        ctx.closePath();
        ctx.fillStyle = '#64748b';
        ctx.fill();
        ctx.restore();

        // Label
        if (conn.label) {
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 13px sans-serif';
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const textWidth = ctx.measureText(conn.label).width;
          ctx.fillStyle = 'white';
          ctx.fillRect(midX - textWidth / 2 - 3, midY - 10, textWidth + 6, 20);
          ctx.fillStyle = '#1e293b';
          ctx.fillText(conn.label, midX - textWidth / 2, midY + 5);
        }
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.fillStyle = node.color + '40';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 3;

      if (node.type === 'start' || node.type === 'end') {
        ctx.beginPath();
        ctx.ellipse(node.x + node.width / 2, node.y + node.height / 2, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (node.type === 'decision') {
        ctx.beginPath();
        ctx.moveTo(node.x + node.width / 2, node.y);
        ctx.lineTo(node.x + node.width, node.y + node.height / 2);
        ctx.lineTo(node.x + node.width / 2, node.y + node.height);
        ctx.lineTo(node.x, node.y + node.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (node.type === 'input' || node.type === 'output') {
        ctx.beginPath();
        ctx.moveTo(node.x + 20, node.y);
        ctx.lineTo(node.x + node.width, node.y);
        ctx.lineTo(node.x + node.width - 20, node.y + node.height);
        ctx.lineTo(node.x, node.y + node.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(node.x, node.y, node.width, node.height);
        ctx.strokeRect(node.x, node.y, node.width, node.height);
      }

      // Text
      const textToShow = useDisplayText && node.displayText !== undefined ? node.displayText : node.text;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textToShow, node.x + node.width / 2, node.y + node.height / 2);
      
      // Typing cursor
      if (useDisplayText && node.displayText !== undefined && node.displayText !== node.text) {
        ctx.fillText('|', node.x + node.width / 2 + ctx.measureText(textToShow).width / 2 + 3, node.y + node.height / 2);
      }

      // Highlight selected node
      if (selectedNodeId === node.id) {
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 5;
        if (node.type === 'start' || node.type === 'end') {
          ctx.beginPath();
          ctx.ellipse(node.x + node.width / 2, node.y + node.height / 2, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (node.type === 'decision') {
          ctx.beginPath();
          ctx.moveTo(node.x + node.width / 2, node.y);
          ctx.lineTo(node.x + node.width, node.y + node.height / 2);
          ctx.lineTo(node.x + node.width / 2, node.y + node.height);
          ctx.lineTo(node.x, node.y + node.height / 2);
          ctx.closePath();
          ctx.stroke();
        } else if (node.type === 'input' || node.type === 'output') {
          ctx.beginPath();
          ctx.moveTo(node.x + 20, node.y);
          ctx.lineTo(node.x + node.width, node.y);
          ctx.lineTo(node.x + node.width - 20, node.y + node.height);
          ctx.lineTo(node.x, node.y + node.height);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.strokeRect(node.x, node.y, node.width, node.height);
        }
      }
    });
  };

  const addStudentNode = (type: FlowNode['type'], x?: number, y?: number) => {
    const template = nodeTemplates[type];
    const defaultText = type === 'start' ? 'Start' : 
                       type === 'end' ? 'End' : 
                       type === 'process' ? 'Process' :
                       type === 'decision' ? 'Decision?' :
                       type === 'input' ? 'Input' : 'Output';
    
    const newNode: FlowNode = {
      id: `student-${Date.now()}`,
      type,
      x: x !== undefined ? x : 150,
      y: y !== undefined ? y : 50 + studentNodes.length * 90,
      width: template.width,
      height: template.height,
      text: defaultText,
      color: template.color
    };
    setStudentNodes(prev => [...prev, newNode]);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = studentCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = studentNodes.find(node => 
      x >= node.x && x <= node.x + node.width &&
      y >= node.y && y <= node.y + node.height
    );
    
    if (clickedNode) {
      // Single click just selects the node
      setSelectedNodeId(clickedNode.id);
    } else {
      setSelectedNodeId(null);
      setInlineEditingNode(null);
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = studentCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = studentNodes.find(node => 
      x >= node.x && x <= node.x + node.width &&
      y >= node.y && y <= node.y + node.height
    );
    
    if (clickedNode) {
      // Double click opens inline editor
      setInlineEditingNode({ 
        id: clickedNode.id, 
        x: rect.left + clickedNode.x, 
        y: rect.top + clickedNode.y, 
        width: clickedNode.width, 
        height: clickedNode.height 
      });
      setInlineEditText(clickedNode.text);
    }
  };

  const handleCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = studentCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = studentNodes.find(node => 
      x >= node.x && x <= node.x + node.width &&
      y >= node.y && y <= node.y + node.height
    );
    
    if (clickedNode) {
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: clickedNode.id });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = studentCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = studentNodes.find(node => 
      x >= node.x && x <= node.x + node.width &&
      y >= node.y && y <= node.y + node.height
    );
    
    if (clickedNode) {
      if (e.button === 2) {
        // Right click - start connection
        setConnectingFrom(clickedNode.id);
        const centerX = clickedNode.x + clickedNode.width / 2;
        const centerY = clickedNode.y + clickedNode.height;
        setDragConnection({ fromX: centerX, fromY: centerY, toX: x, toY: y });
        setContextMenu(null);
      } else {
        // Left click - start dragging node
        setDraggingNode({
          id: clickedNode.id,
          offsetX: x - clickedNode.x,
          offsetY: y - clickedNode.y
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = studentCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle node dragging
    if (draggingNode) {
      setStudentNodes(prev =>
        prev.map(node =>
          node.id === draggingNode.id
            ? { ...node, x: x - draggingNode.offsetX, y: y - draggingNode.offsetY }
            : node
        )
      );
      return;
    }
    
    // Handle connection dragging
    if (connectingFrom && dragConnection) {
      setDragConnection({ ...dragConnection, toX: x, toY: y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Handle node drop
    if (draggingNode) {
      setDraggingNode(null);
      return;
    }
    
    // Handle connection completion
    if (!connectingFrom) return;
    const rect = studentCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const targetNode = studentNodes.find(node => 
      x >= node.x && x <= node.x + node.width &&
      y >= node.y && y <= node.y + node.height &&
      node.id !== connectingFrom
    );
    
    if (targetNode) {
      setStudentConnections(prev => [...prev, { from: connectingFrom, to: targetNode.id }]);
    }
    
    setConnectingFrom(null);
    setDragConnection(null);
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!draggingShape) return;

    const rect = studentCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left - nodeTemplates[draggingShape].width / 2;
    const y = e.clientY - rect.top - nodeTemplates[draggingShape].height / 2;

    addStudentNode(draggingShape, x, y);
    setDraggingShape(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const connectNodes = (toNodeId: string) => {
    if (contextMenu) {
      setStudentConnections(prev => [...prev, { from: contextMenu.nodeId, to: toNodeId }]);
      setContextMenu(null);
    }
  };

  const startEditNode = (nodeId: string) => {
    const node = studentNodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNodeId(nodeId);
      setEditingText(node.text);
    }
  };

  const saveEditNode = () => {
    if (editingNodeId) {
      setStudentNodes(prev => 
        prev.map(node => 
          node.id === editingNodeId ? { ...node, text: editingText } : node
        )
      );
      setEditingNodeId(null);
      setEditingText('');
    }
  };

  const deleteStudentNode = (nodeId: string) => {
    setStudentNodes(prev => prev.filter(node => node.id !== nodeId));
    setStudentConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    setContextMenu(null);
  };

  const startDemo = () => {
    setSystemNodes([]);
    setSystemConnections([]);
    setDemoStep(0);
    setIsDemoPlaying(true);
  };

  const resetDemo = () => {
    setSystemNodes([]);
    setSystemConnections([]);
    setDemoStep(0);
    setIsDemoPlaying(false);
  };

  const loadSolution = () => {
    setSystemNodes(currentProblem.solution.nodes.map(node => ({ ...node, displayText: node.text })));
    setSystemConnections(currentProblem.solution.connections);
    setIsDemoPlaying(false);
  };

  const clearStudent = () => {
    setStudentNodes([]);
    setStudentConnections([]);
  };

  const nextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setStudentNodes([]);
      setStudentConnections([]);
      setSystemNodes([]);
      setSystemConnections([]);
      setDemoStep(0);
      setIsDemoPlaying(false);
      setElapsedTime(0);
      setIsTimerRunning(false);
    }
  };

  const previousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(prev => prev - 1);
      setStudentNodes([]);
      setStudentConnections([]);
      setSystemNodes([]);
      setSystemConnections([]);
      setDemoStep(0);
      setIsDemoPlaying(false);
      setElapsedTime(0);
      setIsTimerRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const accuracy = Math.min(100, (studentNodes.length / currentProblem.solution.nodes.length) * 100);

  // Auto-focus inline input when it appears
  useEffect(() => {
    if (inlineEditingNode && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [inlineEditingNode]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 z-50 flex flex-col">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 shadow-2xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <MonitorPlay className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Practice Flowchart Building</h1>
              <p className="text-sm text-purple-100 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {currentProblem.title}
              </p>
            </div>
            <Badge className={`${getDifficultyColor(currentProblem.difficulty)} text-white px-3 py-1.5 text-sm shadow-lg`}>
              {currentProblem.difficulty.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono font-bold">{formatTime(elapsedTime)}</span>
            </div>
            
            {/* Navigation */}
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={previousProblem}
              disabled={currentProblemIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="bg-white/20 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="font-bold">{currentProblemIndex + 1} / {problems.length}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={nextProblem}
              disabled={currentProblemIndex === problems.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5 mr-1" />
              Exit
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-300" />
            <div>
              <div className="text-xs text-purple-100">Accuracy</div>
              <div className="font-bold">{accuracy.toFixed(0)}%</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-300" />
            <div>
              <div className="text-xs text-purple-100">Nodes</div>
              <div className="font-bold">{studentNodes.length} / {currentProblem.solution.nodes.length}</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-300" />
            <div>
              <div className="text-xs text-purple-100">Connections</div>
              <div className="font-bold">{studentConnections.length}</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <Timer className="w-5 h-5 text-pink-300" />
            <div>
              <div className="text-xs text-purple-100">Status</div>
              <div className="font-bold text-xs">{isTimerRunning ? 'Active' : 'Paused'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="bg-white border-b border-gray-200 p-3 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">{currentProblem.description}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowHints(!showHints)}
            className="border-purple-300"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            {showHints ? 'Hide' : 'Show'} Hints
          </Button>
        </div>
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3"
            >
              <div className="flex flex-wrap gap-3">
                {currentProblem.hints.map((hint, idx) => (
                  <span key={idx} className="text-xs bg-white px-3 py-1.5 rounded-full border border-yellow-200">
                    💡 {hint}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Three Panel Layout */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        
        {/* LEFT PANEL - Student Workspace */}
        <div className="flex-1 flex flex-col bg-white border-r-2 border-blue-300 shadow-xl">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6" />
              <span className="font-bold text-lg">YOUR WORKSPACE</span>
            </div>
            <Progress value={accuracy} className="w-32 h-2 bg-white/30" />
          </div>
          <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
            <canvas
              ref={studentCanvasRef}
              width={600}
              height={800}
              className="cursor-pointer border-2 border-blue-100"
              onClick={handleCanvasClick}
              onDoubleClick={handleCanvasDoubleClick}
              onContextMenu={handleCanvasRightClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
            />
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-t-2 border-blue-200 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={clearStudent}
              className="w-full border-blue-400 text-blue-700 hover:bg-blue-100"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* CENTER PANEL - Flowchart Blocks */}
        <div className="w-80 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 border-r-2 border-gray-300 shadow-xl">
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white shrink-0">
            <h3 className="font-bold text-lg">FLOWCHART BLOCKS</h3>
            <p className="text-xs text-gray-300 mt-1">Drag to canvas • Right-click to connect</p>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            
            {/* Terminal Blocks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Terminal</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  draggable
                  onDragStart={(e) => {
                    setDraggingShape('start');
                    e.dataTransfer.effectAllowed = 'copy';
                    const preview = createDragPreview('start', 'START');
                    e.dataTransfer.setDragImage(preview, 50, 35);
                    setTimeout(() => {
                      if (document.body.contains(preview)) {
                        document.body.removeChild(preview);
                      }
                    }, 0);
                  }}
                  onDragEnd={() => setDraggingShape(null)}
                  className="p-3 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center cursor-move"
                >
                  <Circle className="w-6 h-6 text-green-700 mb-1" />
                  <span className="text-xs font-bold text-green-800">Start</span>
                </button>
                <button
                  draggable
                  onDragStart={(e) => {
                    setDraggingShape('end');
                    e.dataTransfer.effectAllowed = 'copy';
                    const preview = createDragPreview('end', 'END');
                    e.dataTransfer.setDragImage(preview, 50, 35);
                    setTimeout(() => {
                      if (document.body.contains(preview)) {
                        document.body.removeChild(preview);
                      }
                    }, 0);
                  }}
                  onDragEnd={() => setDraggingShape(null)}
                  className="p-3 bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center cursor-move"
                >
                  <Circle className="w-6 h-6 text-red-700 mb-1" />
                  <span className="text-xs font-bold text-red-800">End</span>
                </button>
              </div>
            </div>

            {/* Process */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Process</h4>
              <button
                draggable
                onDragStart={(e) => {
                  setDraggingShape('process');
                  e.dataTransfer.effectAllowed = 'copy';
                  const preview = createDragPreview('process', 'PROCESS');
                  e.dataTransfer.setDragImage(preview, 50, 35);
                  setTimeout(() => {
                    if (document.body.contains(preview)) {
                      document.body.removeChild(preview);
                    }
                  }, 0);
                }}
                onDragEnd={() => setDraggingShape(null)}
                className="w-full p-3 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center cursor-move"
              >
                <Square className="w-6 h-6 text-blue-700 mb-1" />
                <span className="text-xs font-bold text-blue-800">Process</span>
              </button>
            </div>

            {/* Decision */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Decision</h4>
              <button
                draggable
                onDragStart={(e) => {
                  setDraggingShape('decision');
                  e.dataTransfer.effectAllowed = 'copy';
                  const preview = createDragPreview('decision', 'DECISION');
                  e.dataTransfer.setDragImage(preview, 50, 35);
                  setTimeout(() => {
                    if (document.body.contains(preview)) {
                      document.body.removeChild(preview);
                    }
                  }, 0);
                }}
                onDragEnd={() => setDraggingShape(null)}
                className="w-full p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center cursor-move"
              >
                <Diamond className="w-6 h-6 text-yellow-700 mb-1" />
                <span className="text-xs font-bold text-yellow-800">Decision</span>
              </button>
            </div>

            {/* Input/Output */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Input/Output</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  draggable
                  onDragStart={(e) => {
                    setDraggingShape('input');
                    e.dataTransfer.effectAllowed = 'copy';
                    const preview = createDragPreview('input', 'INPUT');
                    e.dataTransfer.setDragImage(preview, 50, 35);
                    setTimeout(() => {
                      if (document.body.contains(preview)) {
                        document.body.removeChild(preview);
                      }
                    }, 0);
                  }}
                  onDragEnd={() => setDraggingShape(null)}
                  className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center cursor-move"
                >
                  <ArrowRight className="w-6 h-6 text-purple-700 mb-1" />
                  <span className="text-xs font-bold text-purple-800">Input</span>
                </button>
                <button
                  draggable
                  onDragStart={(e) => {
                    setDraggingShape('output');
                    e.dataTransfer.effectAllowed = 'copy';
                    const preview = createDragPreview('output', 'OUTPUT');
                    e.dataTransfer.setDragImage(preview, 50, 35);
                    setTimeout(() => {
                      if (document.body.contains(preview)) {
                        document.body.removeChild(preview);
                      }
                    }, 0);
                  }}
                  onDragEnd={() => setDraggingShape(null)}
                  className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-200 border-2 border-cyan-500 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center cursor-move"
                >
                  <ArrowRight className="w-6 h-6 text-cyan-700 mb-1" />
                  <span className="text-xs font-bold text-cyan-800">Output</span>
                </button>
              </div>
            </div>

            {/* Node Management */}
            {studentNodes.length > 0 && (
              <div className="border-t-2 border-gray-300 pt-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Your Nodes</h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {studentNodes.map((node) => (
                    <div key={node.id} className="bg-white border-2 border-gray-200 rounded-lg p-2 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: node.color }}>
                          {node.type.toUpperCase()}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditNode(node.id)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteStudentNode(node.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 truncate font-medium">{node.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-3 shadow-md">
              <h4 className="font-bold text-sm text-blue-900 mb-2">📖 How to Use:</h4>
              <ul className="text-xs text-blue-800 space-y-1.5">
                <li>• <strong>Drag</strong> blocks to canvas</li>
                <li>• <strong>Click</strong> to select node</li>
                <li>• <strong>Double-click</strong> to edit text</li>
                <li>• <strong>Drag selected</strong> to move</li>
                <li>• <strong>Right-click & drag</strong> to connect</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - System Demonstration */}
        <div className="flex-1 flex flex-col bg-white shadow-xl">
          <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              <span className="font-bold text-lg">SYSTEM DEMO</span>
            </div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5">
              {isDemoPlaying && <span className="animate-pulse">● Building...</span>}
              {!isDemoPlaying && systemNodes.length > 0 && '✓ Complete'}
              {!isDemoPlaying && systemNodes.length === 0 && 'Ready'}
            </Badge>
          </div>
          <div className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
            <canvas
              ref={systemCanvasRef}
              width={600}
              height={800}
              className="border-2 border-purple-100"
            />
          </div>
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200 shrink-0 space-y-3">
            {systemNodes.length > 0 && (
              <Progress 
                value={(systemNodes.length / currentProblem.solution.nodes.length) * 100} 
                className="h-2"
              />
            )}
            
            {/* Speed Controls */}
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
              <Gauge className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold">Speed:</span>
              <div className="flex gap-1 flex-1">
                {(['slow', 'normal', 'fast'] as const).map(speed => (
                  <button
                    key={speed}
                    onClick={() => setDemoSpeed(speed)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      demoSpeed === speed 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isDemoPlaying}
                  >
                    {speed === 'slow' ? '🐢 Slow' : speed === 'normal' ? '⚡ Normal' : '🚀 Fast'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                onClick={startDemo}
                disabled={isDemoPlaying}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetDemo}
                className="border-purple-400"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={loadSolution}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Zap className="w-4 h-4 mr-1" />
                Show All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Node Modal */}
      <AnimatePresence>
        {editingNodeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setEditingNodeId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 w-96 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4">Edit Node Text</h3>
              <Input
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                placeholder="Enter node text..."
                className="mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditNode();
                  if (e.key === 'Escape') setEditingNodeId(null);
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingNodeId(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveEditNode}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border-2 border-gray-200 py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">Actions</div>
          <button
            onClick={() => {
              startEditNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
            <span>Edit Text</span>
          </button>
          <button
            onClick={() => deleteStudentNode(contextMenu.nodeId)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Delete Node</span>
          </button>
        </div>
      )}

      {/* Inline Edit Input */}
      {inlineEditingNode && (
        <div
          className="absolute bg-white border-2 border-gray-300 rounded-lg shadow-md p-2"
          style={{ left: inlineEditingNode.x, top: inlineEditingNode.y }}
        >
          <Input
            ref={inlineInputRef}
            value={inlineEditText}
            onChange={(e) => setInlineEditText(e.target.value)}
            placeholder="Enter node text..."
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setStudentNodes(prev => 
                  prev.map(node => 
                    node.id === inlineEditingNode?.id ? { ...node, text: inlineEditText } : node
                  )
                );
                setInlineEditingNode(null);
              }
              if (e.key === 'Escape') setInlineEditingNode(null);
            }}
          />
        </div>
      )}
    </div>
  );
}