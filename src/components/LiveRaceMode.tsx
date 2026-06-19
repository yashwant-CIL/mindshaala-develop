import { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Clock, Bot, User, Star, Play, RotateCcw,
  GitBranch, Activity, Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';

interface LiveRaceModeProps {
  onClose: () => void;
  challengeType: 'flowchart' | 'block-coding';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
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
  built: boolean;
}

interface AIAction {
  type: 'thinking' | 'placing' | 'connecting' | 'verifying' | 'complete';
  message: string;
  duration: number;
}

const nodeTemplates = {
  start: { width: 80, height: 40, color: '#22c55e', shape: 'oval' },
  end: { width: 80, height: 40, color: '#ef4444', shape: 'oval' },
  process: { width: 100, height: 50, color: '#3b82f6', shape: 'rect' },
  decision: { width: 90, height: 90, color: '#f59e0b', shape: 'diamond' },
  input: { width: 110, height: 50, color: '#8b5cf6', shape: 'parallelogram' },
  output: { width: 110, height: 50, color: '#06b6d4', shape: 'parallelogram' },
};

// Sample challenge: Add Two Numbers
const sampleChallenge = {
  title: 'Add Two Numbers',
  description: 'Create a flowchart to input two numbers and output their sum',
  nodes: [
    { id: '1', type: 'start' as const, x: 150, y: 30, text: 'Start' },
    { id: '2', type: 'input' as const, x: 135, y: 100, text: 'Input A, B' },
    { id: '3', type: 'process' as const, x: 125, y: 180, text: 'Sum = A + B' },
    { id: '4', type: 'output' as const, x: 135, y: 260, text: 'Output Sum' },
    { id: '5', type: 'end' as const, x: 150, y: 340, text: 'End' },
  ],
  connections: [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4' },
    { from: '4', to: '5' },
  ]
};

export function LiveRaceMode({ onClose, challengeType, difficulty }: LiveRaceModeProps) {
  const [studentNodes, setStudentNodes] = useState<FlowNode[]>([]);
  const [aiNodes, setAiNodes] = useState<FlowNode[]>([]);
  const [systemNodes, setSystemNodes] = useState<FlowNode[]>([]);
  const [aiCurrentAction, setAiCurrentAction] = useState<AIAction | null>(null);
  const [systemCurrentAction, setSystemCurrentAction] = useState<AIAction | null>(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [studentProgress, setStudentProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [systemProgress, setSystemProgress] = useState(0);
  const [winner, setWinner] = useState<'student' | 'ai' | null>(null);
  const [studentScore, setStudentScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  const aiIntervalRef = useRef<number | null>(null);
  const systemIntervalRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);

  const aiSpeed = difficulty === 'easy' ? 3000 : difficulty === 'medium' ? 2000 : difficulty === 'hard' ? 1500 : 1000;
  const systemSpeed = 2500; // System builds at steady educational pace

  useEffect(() => {
    return () => {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
      if (systemIntervalRef.current) clearInterval(systemIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  const startRace = () => {
    setRaceStarted(true);
    setTimeElapsed(0);
    setStudentNodes([]);
    setAiNodes([]);
    setSystemNodes([]);
    setStudentProgress(0);
    setAiProgress(0);
    setSystemProgress(0);
    setWinner(null);
    setStudentScore(0);
    setAiScore(0);

    // Start timer
    timeIntervalRef.current = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Start AI building
    startAIBuilding();
    // Start System building
    startSystemBuilding();
  };

  const startAIBuilding = () => {
    const totalSteps = sampleChallenge.nodes.length + 2;
    let stepCount = 0;

    const aiActions: AIAction[] = [
      { type: 'thinking', message: 'AI analyzing...', duration: aiSpeed * 0.5 },
      ...sampleChallenge.nodes.map(node => ({
        type: 'placing' as const,
        message: `AI placing ${node.text}...`,
        duration: aiSpeed
      })),
      { type: 'verifying', message: 'AI verifying...', duration: aiSpeed * 0.8 },
    ];

    let actionIndex = 0;

    const executeNextAction = () => {
      if (actionIndex >= aiActions.length) {
        const finalScore = 1000 + (difficulty === 'expert' ? 500 : difficulty === 'hard' ? 300 : difficulty === 'medium' ? 200 : 100);
        setAiScore(finalScore);
        setAiProgress(100);
        if (!winner) setWinner('ai');
        setAiCurrentAction({ type: 'complete', message: '✅ AI finished!', duration: 0 });
        if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
        if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
        return;
      }

      const action = aiActions[actionIndex];
      setAiCurrentAction(action);

      if (action.type === 'placing' && stepCount - 1 < sampleChallenge.nodes.length) {
        const nodeData = sampleChallenge.nodes[stepCount - 1];
        const template = nodeTemplates[nodeData.type];
        
        setTimeout(() => {
          setAiNodes(prev => [...prev, {
            ...nodeData,
            ...template,
            built: true
          }]);
          
          stepCount++;
          const progress = (stepCount / totalSteps) * 100;
          setAiProgress(progress);
          
          actionIndex++;
          executeNextAction();
        }, action.duration);
      } else {
        setTimeout(() => {
          stepCount++;
          const progress = (stepCount / totalSteps) * 100;
          setAiProgress(progress);
          
          actionIndex++;
          executeNextAction();
        }, action.duration);
      }
    };

    executeNextAction();
  };

  const startSystemBuilding = () => {
    const totalSteps = sampleChallenge.nodes.length + 2;
    let stepCount = 0;

    const systemActions: AIAction[] = [
      { type: 'thinking', message: 'System analyzing...', duration: systemSpeed * 0.5 },
      ...sampleChallenge.nodes.map(node => ({
        type: 'placing' as const,
        message: `System placing ${node.text}...`,
        duration: systemSpeed
      })),
      { type: 'verifying', message: 'System verifying...', duration: systemSpeed * 0.8 },
    ];

    let actionIndex = 0;

    const executeNextAction = () => {
      if (actionIndex >= systemActions.length) {
        setSystemProgress(100);
        setSystemCurrentAction({ type: 'complete', message: '✅ System complete!', duration: 0 });
        if (systemIntervalRef.current) clearInterval(systemIntervalRef.current);
        return;
      }

      const action = systemActions[actionIndex];
      setSystemCurrentAction(action);

      if (action.type === 'placing' && stepCount - 1 < sampleChallenge.nodes.length) {
        const nodeData = sampleChallenge.nodes[stepCount - 1];
        const template = nodeTemplates[nodeData.type];
        
        setTimeout(() => {
          setSystemNodes(prev => [...prev, {
            ...nodeData,
            ...template,
            built: true
          }]);
          
          stepCount++;
          const progress = (stepCount / totalSteps) * 100;
          setSystemProgress(progress);
          
          actionIndex++;
          executeNextAction();
        }, action.duration);
      } else {
        setTimeout(() => {
          stepCount++;
          const progress = (stepCount / totalSteps) * 100;
          setSystemProgress(progress);
          
          actionIndex++;
          executeNextAction();
        }, action.duration);
      }
    };

    executeNextAction();
  };

  const addStudentNode = (type: FlowNode['type']) => {
    if (winner) return;

    const template = nodeTemplates[type];
    const newNode: FlowNode = {
      id: `student-${studentNodes.length + 1}`,
      type,
      x: 150,
      y: 30 + studentNodes.length * 80,
      width: template.width,
      height: template.height,
      text: type.charAt(0).toUpperCase() + type.slice(1),
      color: template.color,
      built: true
    };

    setStudentNodes(prev => [...prev, newNode]);
    
    const newProgress = ((studentNodes.length + 1) / sampleChallenge.nodes.length) * 100;
    setStudentProgress(newProgress);

    // Check if student completed
    if (studentNodes.length + 1 >= sampleChallenge.nodes.length) {
      if (!winner) {
        if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
        if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
        
        const timeBonus = Math.max(0, 1 - (timeElapsed / 120));
        const baseScore = 1000;
        const finalScore = Math.floor(baseScore * (0.7 + timeBonus * 0.3));
        
        setStudentScore(finalScore);
        setStudentProgress(100);
        setWinner('student');
      }
    }
  };

  const resetRace = () => {
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    if (systemIntervalRef.current) clearInterval(systemIntervalRef.current);
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    
    setRaceStarted(false);
    setTimeElapsed(0);
    setStudentNodes([]);
    setAiNodes([]);
    setSystemNodes([]);
    setStudentProgress(0);
    setAiProgress(0);
    setSystemProgress(0);
    setWinner(null);
    setStudentScore(0);
    setAiScore(0);
    setAiCurrentAction(null);
    setSystemCurrentAction(null);
  };

  const renderFlowNode = (node: FlowNode) => {
    const style = {
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height,
      backgroundColor: node.color + '20',
      borderColor: node.color,
    };

    return (
      <motion.div
        key={node.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute border-2 rounded-lg flex items-center justify-center text-xs font-medium"
        style={style}
      >
        {node.text}
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Live Race Mode - Three Panel View</h2>
              <p className="text-xs text-purple-100">{sampleChallenge.title} • {difficulty}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>
        </div>

        {/* Challenge Info */}
        {!raceStarted && (
          <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="font-bold mb-2">{sampleChallenge.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{sampleChallenge.description}</p>
            <div className="flex gap-4 mb-4">
              <Badge className="bg-purple-600">Difficulty: {difficulty}</Badge>
              <Badge className="bg-blue-600">{sampleChallenge.nodes.length} nodes required</Badge>
              <Badge className="bg-green-600">Max Score: 1000 pts</Badge>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h4 className="font-bold text-yellow-900">Three Panel Race</h4>
              </div>
              <p className="text-sm text-yellow-800">
                <strong>Left:</strong> Your workspace (compete here!) • 
                <strong> Middle:</strong> AI Opponent (race against!) • 
                <strong> Right:</strong> System Demo (learn from!)
              </p>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={startRace}
            >
              <Play className="w-5 h-5 mr-2" />
              Start 3-Way Race!
            </Button>
          </div>
        )}

        {/* THREE PANEL RACING AREA */}
        {raceStarted && (
          <div className="flex-1 grid grid-cols-3 gap-1 p-2 overflow-hidden bg-gray-200">
            
            {/* PANEL 1: STUDENT (LEFT - BLUE) */}
            <Card className="flex flex-col overflow-hidden border-4 border-blue-600 shadow-2xl bg-white">
              <div className="p-4 bg-blue-600 text-white border-b-2 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <User className="w-6 h-6" />
                  <span className="font-bold text-lg">YOU (STUDENT)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{studentProgress.toFixed(0)}%</span>
                  {studentScore > 0 && (
                    <Badge className="bg-white text-blue-600 px-2 py-1">
                      {studentScore} pts
                    </Badge>
                  )}
                </div>
              </div>
              
              <Progress value={studentProgress} className="h-3 rounded-none bg-blue-200" />
              
              <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-cyan-50 overflow-auto">
                <div className="min-w-[600px] min-h-[600px] relative p-4">
                  {studentNodes.map(node => renderFlowNode(node))}
                  {studentNodes.length === 0 && !winner && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-400">Start adding nodes below...</p>
                    </div>
                  )}
                  {winner === 'student' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm"
                    >
                      <div className="text-center bg-white p-6 rounded-xl shadow-2xl">
                        <Trophy className="w-20 h-20 text-green-600 mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-green-900">You Win!</h3>
                        <p className="text-green-700 text-xl">{studentScore} pts</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {!winner && (
                <div className="p-3 bg-white border-t">
                  <p className="text-xs text-gray-600 mb-2 font-semibold">Add Nodes:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['start', 'process', 'input', 'output', 'decision', 'end'] as const).map(type => (
                      <Button
                        key={type}
                        size="sm"
                        onClick={() => addStudentNode(type)}
                        className="text-xs h-8"
                        style={{ backgroundColor: nodeTemplates[type].color }}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* PANEL 2: AI OPPONENT (MIDDLE - ORANGE) */}
            <Card className="flex flex-col overflow-hidden border-4 border-orange-600 shadow-2xl bg-white">
              <div className="p-4 bg-orange-600 text-white border-b-2 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <Bot className="w-6 h-6" />
                  <span className="font-bold text-lg">AI OPPONENT</span>
                  <Badge className="bg-white text-orange-600 px-2 py-1 text-xs">{difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{aiProgress.toFixed(0)}%</span>
                  {aiScore > 0 && (
                    <Badge className="bg-white text-orange-600 px-2 py-1">
                      {aiScore} pts
                    </Badge>
                  )}
                </div>
              </div>
              
              <Progress value={aiProgress} className="h-3 rounded-none bg-orange-200" />
              
              <div className="flex-1 relative bg-gradient-to-br from-orange-50 to-amber-50 overflow-auto">
                <div className="min-w-[600px] min-h-[600px] relative p-4">
                  {aiNodes.map(node => renderFlowNode(node))}
                  {winner === 'ai' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-orange-500/20 backdrop-blur-sm"
                    >
                      <div className="text-center bg-white p-6 rounded-xl shadow-2xl">
                        <Bot className="w-20 h-20 text-orange-600 mx-auto mb-2" />
                        <h3 className="text-3xl font-bold text-orange-900">AI Wins!</h3>
                        <p className="text-orange-700 text-xl">{aiScore} pts</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-orange-600 animate-pulse" />
                  <span className="font-medium text-gray-700 truncate">
                    {aiCurrentAction?.message || 'Waiting...'}
                  </span>
                </div>
              </div>
            </Card>

            {/* PANEL 3: SYSTEM DEMONSTRATION (RIGHT - PURPLE) */}
            <Card className="flex flex-col overflow-hidden border-4 border-purple-600 shadow-2xl bg-white">
              <div className="p-4 bg-purple-600 text-white border-b-2 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  <span className="font-bold text-lg">SYSTEM DEMO</span>
                  <Badge className="bg-white text-purple-600 px-2 py-1 text-xs">Learn</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{systemProgress.toFixed(0)}%</span>
                </div>
              </div>
              
              <Progress value={systemProgress} className="h-3 rounded-none bg-purple-200" />
              
              <div className="flex-1 relative bg-gradient-to-br from-purple-50 to-pink-50 overflow-auto">
                <div className="min-w-[600px] min-h-[600px] relative p-4">
                  {systemNodes.map(node => renderFlowNode(node))}
                  {systemNodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-400">System will demonstrate...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span className="font-medium text-gray-700 truncate">
                    {systemCurrentAction?.message || 'Waiting...'}
                  </span>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* Winner Screen */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 border-t bg-gradient-to-r from-purple-50 to-blue-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${winner === 'student' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {winner === 'student' ? (
                      <Trophy className="w-8 h-8 text-white" />
                    ) : (
                      <Bot className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {winner === 'student' ? '🎉 Congratulations! You Won!' : '💪 AI Won This Round!'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {winner === 'student' 
                        ? `You completed in ${timeElapsed}s with ${studentScore} points!`
                        : `AI scored ${aiScore} points. Watch the System panel to learn!`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={resetRace}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Race Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Back to Arena
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}