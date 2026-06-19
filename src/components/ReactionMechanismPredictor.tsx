import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Sparkles, Play, Pause, RotateCw, Zap, MessageCircle,
  Send, Lightbulb, Target, Award, ChevronRight, Info, Beaker,
  FlaskConical, Flame, Droplet, Wind, ArrowRight, Eye, CheckCircle2,
  XCircle, HelpCircle, BookOpen, Layers, TrendingUp, Brain, Atom
} from 'lucide-react';

interface Molecule {
  id: string;
  structure: string; // Simplified structure notation
  name: string;
  functional_group: string;
  x: number;
  y: number;
}

interface Reagent {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'nucleophile' | 'electrophile' | 'catalyst' | 'oxidizer' | 'reducer';
  icon: string;
  color: string;
}

interface Condition {
  id: string;
  name: string;
  icon: string;
}

interface MechanismStep {
  id: number;
  description: string;
  curvedArrows: CurvedArrow[];
  molecules: string[];
  explanation: string;
  electronMovement: string;
}

interface CurvedArrow {
  from: { x: number; y: number; type: 'lone_pair' | 'bond' | 'atom' };
  to: { x: number; y: number; type: 'atom' | 'bond' };
  electrons: 1 | 2; // Single or double arrow
  color: string;
}

interface ChatMessage {
  id: string;
  role: 'student' | 'ai';
  content: string;
  timestamp: Date;
}

interface QuizQuestion {
  id: number;
  reactant: string;
  reagent: string;
  condition: string;
  correctAnswer: string;
  options: string[];
  mechanismType: string;
  hint: string;
}

const COMMON_REAGENTS: Reagent[] = [
  { id: 'oh-', name: 'Hydroxide', formula: 'OH⁻', type: 'base', icon: '⚛️', color: '#3B82F6' },
  { id: 'h2so4', name: 'Sulfuric Acid', formula: 'H₂SO₄', type: 'acid', icon: '🔴', color: '#DC2626' },
  { id: 'h2o', name: 'Water', formula: 'H₂O', type: 'nucleophile', icon: '💧', color: '#06B6D4' },
  { id: 'br2', name: 'Bromine', formula: 'Br₂', type: 'electrophile', icon: '🟤', color: '#92400E' },
  { id: 'kmno4', name: 'Potassium Permanganate', formula: 'KMnO₄', type: 'oxidizer', icon: '🟣', color: '#7C3AED' },
  { id: 'nabh4', name: 'Sodium Borohydride', formula: 'NaBH₄', type: 'reducer', icon: '🔵', color: '#2563EB' },
  { id: 'alcl3', name: 'Aluminum Chloride', formula: 'AlCl₃', type: 'catalyst', icon: '⚡', color: '#F59E0B' },
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', icon: '🔴', color: '#EF4444' },
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', icon: '🔵', color: '#3B82F6' },
  { id: 'h2-pd', name: 'H₂/Pd', formula: 'H₂/Pd', type: 'reducer', icon: '⚪', color: '#6B7280' },
];

const CONDITIONS: Condition[] = [
  { id: 'heat', name: 'Heat (Δ)', icon: '🔥' },
  { id: 'reflux', name: 'Reflux', icon: '♨️' },
  { id: 'cold', name: 'Cold (0°C)', icon: '❄️' },
  { id: 'light', name: 'Light (hν)', icon: '💡' },
  { id: 'pressure', name: 'High Pressure', icon: '⬇️' },
  { id: 'inert', name: 'Inert Atmosphere', icon: '🌫️' },
];

const REACTION_TYPES = [
  { id: 'sn1', name: 'SN1 Substitution', description: 'Unimolecular nucleophilic substitution', color: '#3B82F6' },
  { id: 'sn2', name: 'SN2 Substitution', description: 'Bimolecular nucleophilic substitution', color: '#10B981' },
  { id: 'e1', name: 'E1 Elimination', description: 'Unimolecular elimination', color: '#F59E0B' },
  { id: 'e2', name: 'E2 Elimination', description: 'Bimolecular elimination', color: '#EF4444' },
  { id: 'addition', name: 'Electrophilic Addition', description: 'Addition to double/triple bonds', color: '#8B5CF6' },
  { id: 'oxidation', name: 'Oxidation', description: 'Increase in oxidation state', color: '#EC4899' },
  { id: 'reduction', name: 'Reduction', description: 'Decrease in oxidation state', color: '#06B6D4' },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    reactant: 'CH₃CH₂Br',
    reagent: 'OH⁻ (aq)',
    condition: 'Room temperature',
    correctAnswer: 'CH₃CH₂OH',
    options: ['CH₃CH₂OH', 'CH₂=CH₂', 'CH₃CH₃', 'CH₃CHO'],
    mechanismType: 'SN2',
    hint: 'OH⁻ is a strong nucleophile. Primary alkyl halides favor SN2.'
  },
  {
    id: 2,
    reactant: 'CH₃CH₂Br',
    reagent: 'OH⁻ in ethanol',
    condition: 'Heat',
    correctAnswer: 'CH₂=CH₂',
    options: ['CH₃CH₂OH', 'CH₂=CH₂', 'CH₃CH₃', 'CH₃CHO'],
    mechanismType: 'E2',
    hint: 'Strong base + heat + ethanol favors elimination (E2).'
  },
  {
    id: 3,
    reactant: '(CH₃)₃CBr',
    reagent: 'H₂O',
    condition: 'Room temperature',
    correctAnswer: '(CH₃)₃COH',
    options: ['(CH₃)₃COH', '(CH₃)₂C=CH₂', '(CH₃)₄C', '(CH₃)₃CHO'],
    mechanismType: 'SN1',
    hint: 'Tertiary alkyl halide + weak nucleophile favors SN1.'
  },
  {
    id: 4,
    reactant: 'CH₂=CH₂',
    reagent: 'Br₂',
    condition: 'Room temperature',
    correctAnswer: 'CH₂BrCH₂Br',
    options: ['CH₂BrCH₂Br', 'CHBr=CHBr', 'CH₃CH₂Br', 'CH₃CHBr₂'],
    mechanismType: 'Addition',
    hint: 'Br₂ adds across the double bond via electrophilic addition.'
  },
  {
    id: 5,
    reactant: 'CH₃CH₂OH',
    reagent: 'KMnO₄/H⁺',
    condition: 'Heat',
    correctAnswer: 'CH₃COOH',
    options: ['CH₃COOH', 'CH₃CHO', 'CH₃CH₃', 'CO₂ + H₂O'],
    mechanismType: 'Oxidation',
    hint: 'KMnO₄ is a strong oxidizing agent. Primary alcohols → carboxylic acids.'
  },
];

export function ReactionMechanismPredictor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mechanismCanvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // State
  const [viewMode, setViewMode] = useState<'builder' | 'mechanism' | 'quiz'>('builder');
  const [reactant, setReactant] = useState<string>('CH₃CH₂Br');
  const [selectedReagents, setSelectedReagents] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [predictedProduct, setPredictedProduct] = useState<string>('');
  const [reactionType, setReactionType] = useState<string>('');
  const [mechanismSteps, setMechanismSteps] = useState<MechanismStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCurvedArrows, setShowCurvedArrows] = useState(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      content: '👋 Hi! I\'m your AI Chemistry Tutor. Draw a molecule, add reagents, and I\'ll predict the reaction mechanism! Ask me anything about organic chemistry! 🧪',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    drawReactant();
  }, [reactant]);

  useEffect(() => {
    if (mechanismSteps.length > 0) {
      drawMechanism();
    }
  }, [currentStep, mechanismSteps, showCurvedArrows]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const drawReactant = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw reactant
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(reactant, 150, 200);

    // Draw arrow with reagents
    if (selectedReagents.length > 0) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(250, 200);
      ctx.lineTo(450, 200);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(450, 200);
      ctx.lineTo(440, 195);
      ctx.lineTo(440, 205);
      ctx.closePath();
      ctx.fillStyle = '#3B82F6';
      ctx.fill();

      // Reagents above arrow
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#DC2626';
      const reagentText = selectedReagents.map(id => {
        const reagent = COMMON_REAGENTS.find(r => r.id === id);
        return reagent?.formula || '';
      }).join(', ');
      ctx.fillText(reagentText, 350, 180);

      // Conditions below arrow
      if (selectedConditions.length > 0) {
        ctx.fillStyle = '#F59E0B';
        const conditionText = selectedConditions.map(id => {
          const condition = CONDITIONS.find(c => c.id === id);
          return condition?.name || '';
        }).join(', ');
        ctx.fillText(conditionText, 350, 220);
      }
    }

    // Draw product if predicted
    if (predictedProduct) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(predictedProduct, 550, 200);

      // Draw reaction type badge with complete equation info
      if (reactionType) {
        // Reaction type badge at bottom
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(50, 280, 700, 80);
        ctx.strokeStyle = '#1E40AF';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 280, 700, 80);
        
        // Title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('✓ Reaction Predicted:', 70, 305);
        
        // Reaction type
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FCD34D';
        ctx.fillText(reactionType, 70, 335);
        
        // Step count
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#DBEAFE';
        ctx.fillText(`${mechanismSteps.length} Steps | View in Mechanism Mode →`, 70, 355);
        
        // Complete equation summary
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        
        // Get by-products based on reaction type
        let byProducts = '';
        if (reactionType === 'SN2 Substitution') {
          byProducts = '+ Br⁻';
        } else if (reactionType === 'E2 Elimination') {
          byProducts = '+ H₂O + Br⁻';
        } else if (reactionType === 'SN1 Substitution') {
          byProducts = '+ H₃O⁺ + Br⁻';
        }
        
        // Draw complete balanced equation at top
        ctx.fillStyle = '#EFF6FF';
        ctx.fillRect(50, 40, 700, 50);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 40, 700, 50);
        
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        
        const reagentNames = selectedReagents.map(id => {
          const reagent = COMMON_REAGENTS.find(r => r.id === id);
          return reagent?.formula || '';
        }).join(' + ');
        
        const conditions = selectedConditions.map(id => {
          const condition = CONDITIONS.find(c => c.id === id);
          return condition?.name || '';
        }).join(', ');
        
        // Full equation
        ctx.fillText(`${reactant} + ${reagentNames}`, 250, 58);
        ctx.fillStyle = '#3B82F6';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('→', 400, 58);
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${predictedProduct} ${byProducts}`, 550, 58);
        
        // Conditions below equation
        if (conditions) {
          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 11px Arial';
          ctx.fillText(`[${conditions}]`, 400, 75);
        }
      }
    }
  };

  const drawMechanism = () => {
    const canvas = mechanismCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mechanismSteps.length === 0) return;

    const step = mechanismSteps[currentStep];

    // Draw step title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Step ${currentStep + 1}: ${step.description}`, 20, 40);

    // Draw molecules for this step
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    step.molecules.forEach((molecule, index) => {
      ctx.fillStyle = '#374151';
      ctx.fillText(molecule, 200 + (index * 300), 150);
    });

    // Draw curved arrows if enabled
    if (showCurvedArrows) {
      step.curvedArrows.forEach(arrow => {
        drawCurvedArrow(ctx, arrow);
      });
    }

    // Draw explanation box
    ctx.fillStyle = '#EFF6FF';
    ctx.fillRect(20, 220, canvas.width - 40, 140);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 220, canvas.width - 40, 140);

    // Explanation text
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Explanation:', 35, 245);

    ctx.font = '13px Arial';
    const words = step.explanation.split(' ');
    let line = '';
    let y = 270;
    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 80) {
        ctx.fillText(line, 35, y);
        line = word + ' ';
        y += 20;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, 35, y);

    // Electron movement
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`⚡ ${step.electronMovement}`, 35, y + 30);
  };

  const drawCurvedArrow = (ctx: CanvasRenderingContext2D, arrow: CurvedArrow) => {
    const { from, to, electrons, color } = arrow;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Draw curved path
    const cp1x = from.x + (to.x - from.x) * 0.3;
    const cp1y = from.y - 50;
    const cp2x = from.x + (to.x - from.x) * 0.7;
    const cp2y = to.y - 50;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(to.y - cp2y, to.x - cp2x);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - 15 * Math.cos(angle - Math.PI / 6), to.y - 15 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - 15 * Math.cos(angle + Math.PI / 6), to.y - 15 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Double arrow if 2 electrons
    if (electrons === 2) {
      ctx.beginPath();
      ctx.moveTo(from.x + 5, from.y);
      ctx.bezierCurveTo(cp1x + 5, cp1y, cp2x + 5, cp2y, to.x + 5, to.y);
      ctx.stroke();
    }
  };

  const predictReaction = () => {
    if (selectedReagents.length === 0) {
      addAIMessage('Please select at least one reagent to predict the reaction! 🧪');
      return;
    }

    // AI prediction logic
    const hasBase = selectedReagents.some(id => {
      const reagent = COMMON_REAGENTS.find(r => r.id === id);
      return reagent?.type === 'base';
    });

    const hasHeat = selectedConditions.includes('heat');
    const isEthanol = selectedReagents.includes('oh-') && hasHeat;

    let product = '';
    let mechanism = '';
    let steps: MechanismStep[] = [];

    // SN2 vs E2 logic
    if (reactant === 'CH₃CH₂Br') {
      if (hasBase && !hasHeat) {
        // SN2
        product = 'CH₃CH₂OH';
        mechanism = 'SN2 Substitution';
        steps = [
          {
            id: 1,
            description: 'Nucleophilic Attack',
            curvedArrows: [
              { from: { x: 100, y: 150, type: 'lone_pair' }, to: { x: 200, y: 150, type: 'atom' }, electrons: 2, color: '#3B82F6' }
            ],
            molecules: ['OH⁻', '→', 'CH₃CH₂Br'],
            explanation: 'OH⁻ (nucleophile) attacks the electrophilic carbon from the backside, opposite to the leaving group Br.',
            electronMovement: 'Lone pair from OH⁻ → C-Br σ* antibonding orbital'
          },
          {
            id: 2,
            description: 'Leaving Group Departure',
            curvedArrows: [
              { from: { x: 200, y: 150, type: 'bond' }, to: { x: 300, y: 150, type: 'atom' }, electrons: 2, color: '#DC2626' }
            ],
            molecules: ['CH₃CH₂OH', '+', 'Br⁻'],
            explanation: 'As OH⁻ forms a new bond with carbon, the C-Br bond breaks, and Br leaves as Br⁻. This is a concerted mechanism (one step).',
            electronMovement: 'C-Br bonding electrons → Br⁻ lone pair'
          }
        ];
      } else if (isEthanol) {
        // E2
        product = 'CH₂=CH₂';
        mechanism = 'E2 Elimination';
        steps = [
          {
            id: 1,
            description: 'β-Hydrogen Abstraction',
            curvedArrows: [
              { from: { x: 100, y: 150, type: 'lone_pair' }, to: { x: 180, y: 150, type: 'atom' }, electrons: 2, color: '#3B82F6' }
            ],
            molecules: ['OH⁻', '→', 'H-CH₂-CH₂-Br'],
            explanation: 'Strong base OH⁻ abstracts the β-hydrogen (hydrogen on carbon adjacent to C-Br). This weakens the C-H bond.',
            electronMovement: 'Lone pair from OH⁻ → β C-H σ* antibonding orbital'
          },
          {
            id: 2,
            description: 'Simultaneous π-Bond Formation & Br⁻ Departure',
            curvedArrows: [
              { from: { x: 200, y: 130, type: 'bond' }, to: { x: 250, y: 130, type: 'bond' }, electrons: 2, color: '#10B981' },
              { from: { x: 280, y: 150, type: 'bond' }, to: { x: 330, y: 150, type: 'atom' }, electrons: 2, color: '#DC2626' }
            ],
            molecules: ['CH₂=CH₂', '+', 'H₂O', '+', 'Br⁻'],
            explanation: 'As C-H breaks, electrons form a π-bond between the two carbons. Simultaneously, Br⁻ leaves. This is concerted (all happens at once).',
            electronMovement: 'C-H bonding electrons → π bond; C-Br electrons → Br⁻'
          }
        ];
      }
    } else if (reactant === '(CH₃)₃CBr') {
      // Tertiary - SN1
      product = '(CH₃)₃COH';
      mechanism = 'SN1 Substitution';
      steps = [
        {
          id: 1,
          description: 'Carbocation Formation',
          curvedArrows: [
            { from: { x: 200, y: 150, type: 'bond' }, to: { x: 280, y: 150, type: 'atom' }, electrons: 2, color: '#DC2626' }
          ],
          molecules: ['(CH₃)₃C⁺', '+', 'Br⁻'],
          explanation: 'The C-Br bond breaks, with both electrons going to Br. This forms a stable tertiary carbocation. This is the slow (rate-determining) step.',
          electronMovement: 'C-Br bonding electrons → Br⁻ (heterolytic cleavage)'
        },
        {
          id: 2,
          description: 'Nucleophilic Attack on Carbocation',
          curvedArrows: [
            { from: { x: 100, y: 150, type: 'lone_pair' }, to: { x: 200, y: 150, type: 'atom' }, electrons: 2, color: '#3B82F6' }
          ],
          molecules: ['(CH₃)₃COH₂⁺'],
          explanation: 'Water (weak nucleophile) attacks the planar carbocation from either side. The carbocation is sp² hybridized and planar.',
          electronMovement: 'Lone pair from H₂O → empty p-orbital on C⁺'
        },
        {
          id: 3,
          description: 'Deprotonation',
          curvedArrows: [
            { from: { x: 150, y: 120, type: 'bond' }, to: { x: 100, y: 100, type: 'atom' }, electrons: 2, color: '#10B981' }
          ],
          molecules: ['(CH₃)₃COH', '+', 'H₃O⁺'],
          explanation: 'Another water molecule acts as a base and removes a proton from the oxonium ion to give the final alcohol product.',
          electronMovement: 'O-H bonding electrons → H₂O (proton transfer)'
        }
      ];
    }

    setPredictedProduct(product);
    setReactionType(mechanism);
    setMechanismSteps(steps);
    setCurrentStep(0);

    // AI message
    addAIMessage(
      `🎯 **Reaction Predicted!**\n\n` +
      `**Product:** ${product}\n` +
      `**Mechanism:** ${mechanism}\n\n` +
      `This reaction proceeds through ${steps.length} step(s). ` +
      `Switch to Mechanism View to see the detailed step-by-step mechanism with electron movement! ⚡`
    );
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // Add student message
    const studentMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'student',
      content: chatInput,
      timestamp: new Date()
    };
    setChatMessages([...chatMessages, studentMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(chatInput.toLowerCase());
      addAIMessage(response);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    // Simple AI response logic
    if (question.includes('sn1') || question.includes('sn2')) {
      return `Great question! 🎓\n\n**SN1 vs SN2:**\n\n**SN1:**\n• Two-step mechanism\n• Forms carbocation intermediate\n• Favored by tertiary substrates\n• Weak nucleophiles (H₂O, ROH)\n• Racemization (both R and S products)\n\n**SN2:**\n• One-step concerted mechanism\n• No intermediate\n• Favored by primary substrates\n• Strong nucleophiles (OH⁻, CN⁻)\n• Inversion of configuration (backside attack)\n\nKey difference: SN1 = unimolecular (rate depends on [substrate]), SN2 = bimolecular (rate depends on [substrate] and [nucleophile])`;
    } else if (question.includes('e1') || question.includes('e2')) {
      return `Excellent! Let me explain elimination reactions! 🔥\n\n**E1:**\n• Two-step: carbocation formation → H⁺ loss\n• Weak base needed\n• Tertiary substrates preferred\n• Follows Zaitsev's rule (more substituted alkene)\n\n**E2:**\n• One-step concerted mechanism\n• Strong base required (OH⁻, RO⁻)\n• Anti-periplanar geometry required\n• Can form Zaitsev or Hofmann product\n\nTip: High temperature + strong base = E2 favored over SN2!`;
    } else if (question.includes('nucleophile')) {
      return `🎯 **Nucleophiles** are electron-rich species that donate electrons!\n\nStrong nucleophiles: OH⁻, CN⁻, RS⁻, NH₂⁻\nWeak nucleophiles: H₂O, ROH, NH₃\n\nGood nucleophiles:\n✓ Have negative charge\n✓ Less electronegative atoms (I⁻ > Br⁻ > Cl⁻ > F⁻)\n✓ Less hindered (CH₃O⁻ > (CH₃)₃CO⁻)\n\nRemember: Basicity ≠ Nucleophilicity!`;
    } else if (question.includes('leaving group')) {
      return `🚪 **Leaving Groups** must stabilize negative charge!\n\nBest leaving groups: I⁻, Br⁻, Cl⁻, TsO⁻, H₂O\nPoor leaving groups: OH⁻, NH₂⁻, H⁻\n\nGood leaving groups are:\n✓ Weak bases (stable anions)\n✓ Large, polarizable (I⁻ is best halide)\n✓ Can be protonated (OH → OH₂⁺ → leaves as H₂O)\n\nRule: Strong bases = poor leaving groups!`;
    } else if (question.includes('carbocation')) {
      return `⚡ **Carbocations** are C⁺ ions - electron deficient!\n\nStability order: Tertiary > Secondary > Primary > Methyl\n\nWhy?\n✓ Hyperconjugation: More alkyl groups = more stabilization\n✓ Inductive effect: Electron-donating groups stabilize +\n✓ Resonance: Allylic/benzylic carbocations very stable\n\nCarbocations are:\n• sp² hybridized\n• Planar geometry\n• Electrophilic (want electrons!)\n\nThey're key intermediates in SN1 and E1!`;
    } else if (question.includes('why') || question.includes('how')) {
      return `That's a thoughtful question! 🤔\n\nChemical reactions occur because:\n1. **Thermodynamics**: Products are more stable (ΔG < 0)\n2. **Kinetics**: Activation energy is achievable\n3. **Electron flow**: Electrons move from high → low energy\n\nMechanisms show:\n• Where electrons come from (nucleophile, base)\n• Where they go (electrophile, acid)\n• What bonds break/form\n• Any intermediates formed\n\nCurved arrows = electron movement! Each arrow = 2 electrons (or 1 for radicals).\n\nWant me to explain a specific mechanism?`;
    } else if (question.includes('predict') || question.includes('product')) {
      return `🎯 To predict products:\n\n1. Identify functional groups\n2. Classify the reagent (nucleophile? base? electrophile?)\n3. Determine reaction type:\n   - Primary RX + strong Nu⁻ = SN2\n   - Tertiary RX + weak Nu = SN1\n   - RX + strong base + heat = E2\n   - Alkene + X₂ = Addition\n4. Draw the mechanism\n5. Consider stereochemistry!\n\nTry the quiz mode to practice! 🎓`;
    } else {
      return `Interesting question! 🧪\n\nOrganic chemistry is all about understanding:\n• **Electron movement** (follow the electrons!)\n• **Functional group reactivity**\n• **Reaction conditions** (temp, solvent, reagents)\n• **Stereochemistry** (3D structure matters!)\n\nFeel free to ask about:\n- Specific mechanisms (SN1, SN2, E1, E2)\n- Reaction prediction\n- Why certain conditions are used\n- Functional group chemistry\n\nWhat would you like to explore? 🔬`;
    }
  };

  const addAIMessage = (content: string) => {
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };

  const handleQuizSubmit = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }

    setQuizSubmitted(true);

    // AI feedback
    if (isCorrect) {
      addAIMessage(
        `🎉 **Correct!** Excellent work!\n\n` +
        `The reaction is **${currentQuestion.mechanismType}**.\n\n` +
        `${currentQuestion.hint}\n\n` +
        `You're mastering organic chemistry! 🌟`
      );
    } else {
      addAIMessage(
        `❌ Not quite! The correct answer is **${currentQuestion.correctAnswer}**.\n\n` +
        `**Explanation:** ${currentQuestion.hint}\n\n` +
        `This is a **${currentQuestion.mechanismType}** reaction. Review the mechanism to understand why! 📚`
      );
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setQuizSubmitted(false);
      setShowHint(false);
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const nextStep = () => {
    if (currentStep < mechanismSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetMechanism = () => {
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-5 py-3 shadow-lg">
        <div className="max-w-[1900px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="border-l border-white/30 pl-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <div>
                <h1 className="text-base font-bold">AI Reaction Mechanism Predictor</h1>
                <p className="text-[10px] text-white/70">Powered by AI • Interactive Learning • Step-by-Step Mechanisms</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('builder')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'builder' 
                  ? 'bg-white text-purple-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              🧪 Reaction Builder
            </button>
            <button
              onClick={() => setViewMode('mechanism')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'mechanism' 
                  ? 'bg-white text-purple-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              ⚡ Mechanism View
            </button>
            <button
              onClick={() => setViewMode('quiz')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'quiz' 
                  ? 'bg-white text-purple-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              🎯 Quiz Mode
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1900px] mx-auto p-4">
        <div className="flex gap-4">
          {/* Left Sidebar - Controls */}
          <div className="w-80 space-y-3">
            {/* Reactant Input */}
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                  <Beaker className="w-3.5 h-3.5" />
                  Reactant
                </h3>
                <input
                  type="text"
                  value={reactant}
                  onChange={(e) => setReactant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., CH₃CH₂Br"
                />
                <div className="mt-2 text-[10px] text-gray-600">
                  💡 Try: CH₃CH₂Br, (CH₃)₃CBr, CH₂=CH₂
                </div>
              </div>
            )}

            {/* Reagent Selector */}
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5" />
                  Reagents
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {COMMON_REAGENTS.map(reagent => (
                    <button
                      key={reagent.id}
                      onClick={() => {
                        if (selectedReagents.includes(reagent.id)) {
                          setSelectedReagents(selectedReagents.filter(id => id !== reagent.id));
                        } else {
                          setSelectedReagents([...selectedReagents, reagent.id]);
                        }
                      }}
                      className={`w-full px-2 py-1.5 rounded text-xs font-bold transition-all text-left flex items-center gap-2 ${
                        selectedReagents.includes(reagent.id)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      style={{
                        borderLeft: selectedReagents.includes(reagent.id) ? `4px solid ${reagent.color}` : 'none'
                      }}
                    >
                      <span>{reagent.icon}</span>
                      <div className="flex-1">
                        <div>{reagent.name}</div>
                        <div className="text-[9px] opacity-80">{reagent.formula}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions */}
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  Conditions
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {CONDITIONS.map(condition => (
                    <button
                      key={condition.id}
                      onClick={() => {
                        if (selectedConditions.includes(condition.id)) {
                          setSelectedConditions(selectedConditions.filter(id => id !== condition.id));
                        } else {
                          setSelectedConditions([...selectedConditions, condition.id]);
                        }
                      }}
                      className={`px-2 py-1.5 rounded text-xs font-bold transition-all ${
                        selectedConditions.includes(condition.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-700'
                      }`}
                    >
                      <div>{condition.icon}</div>
                      <div className="text-[9px]">{condition.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Predict Button */}
            {viewMode === 'builder' && (
              <button
                onClick={predictReaction}
                disabled={selectedReagents.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Predict Reaction
              </button>
            )}

            {/* Mechanism Controls */}
            {viewMode === 'mechanism' && mechanismSteps.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <h3 className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Mechanism Controls
                </h3>
                
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-purple-600 rounded text-xs font-bold"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={currentStep === mechanismSteps.length - 1}
                      className="flex-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-purple-600 rounded text-xs font-bold"
                    >
                      Next →
                    </button>
                  </div>

                  <button
                    onClick={resetMechanism}
                    className="w-full px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Reset to Step 1
                  </button>

                  <div className="text-center text-xs text-gray-600 font-bold">
                    Step {currentStep + 1} of {mechanismSteps.length}
                  </div>

                  <label className="flex items-center justify-between bg-purple-50 p-2 rounded">
                    <span className="text-xs">Show Curved Arrows</span>
                    <input
                      type="checkbox"
                      checked={showCurvedArrows}
                      onChange={(e) => setShowCurvedArrows(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Reaction Type Guide */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <h3 className="text-xs uppercase text-purple-800 font-bold mb-2">Reaction Types</h3>
              <div className="space-y-1 text-[10px] text-gray-700">
                {REACTION_TYPES.map(type => (
                  <div key={type.id} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: type.color }}></div>
                    <div>
                      <strong>{type.name}:</strong> {type.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
              <h3 className="text-xs uppercase text-orange-800 font-bold mb-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Pro Tips
              </h3>
              <div className="text-[10px] text-gray-700 space-y-1">
                <div>💡 Strong base + heat = Elimination</div>
                <div>⚡ Tertiary substrate = SN1/E1</div>
                <div>🎯 Primary substrate = SN2/E2</div>
                <div>🔴 Curved arrow = electron movement</div>
                <div>📚 Ask AI tutor anything!</div>
              </div>
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1">
            {viewMode === 'builder' && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700">Reaction Equation</h2>
                  {predictedProduct && (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                      ✓ Predicted
                    </span>
                  )}
                </div>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={400}
                  className="w-full border-2 border-gray-300 rounded-lg"
                />
                <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-700">
                      <strong className="text-purple-900">How to use:</strong> Enter your reactant, select reagents and conditions, 
                      then click "Predict Reaction". Our AI will analyze and show you the product and mechanism! 🧪
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'mechanism' && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700">Step-by-Step Mechanism</h2>
                  {reactionType && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                      {reactionType}
                    </span>
                  )}
                </div>
                {mechanismSteps.length > 0 ? (
                  <>
                    <canvas
                      ref={mechanismCanvasRef}
                      width={900}
                      height={400}
                      className="w-full border-2 border-gray-300 rounded-lg"
                    />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <div className="text-xs text-blue-900 font-bold mb-1">Nucleophile</div>
                        <div className="text-[10px] text-gray-600">Electron donor (blue arrows)</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded border border-red-200">
                        <div className="text-xs text-red-900 font-bold mb-1">Electrophile</div>
                        <div className="text-[10px] text-gray-600">Electron acceptor</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <div className="text-xs text-green-900 font-bold mb-1">Leaving Group</div>
                        <div className="text-[10px] text-gray-600">Departs with electrons</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Atom className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <div className="text-sm">No mechanism to display</div>
                      <div className="text-xs">Go to Reaction Builder and predict a reaction first!</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'quiz' && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-700">Mechanism Quiz</h2>
                    <p className="text-xs text-gray-500">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</p>
                  </div>
                  <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
                    <div className="text-xs">Score</div>
                    <div className="text-2xl font-bold">{quizScore}/{QUIZ_QUESTIONS.length}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <div className="text-sm font-bold text-gray-800 mb-3">
                    Predict the major product:
                  </div>
                  <div className="bg-white p-3 rounded-lg border-2 border-purple-300 text-center">
                    <div className="text-2xl font-bold text-gray-800 mb-2">{currentQuestion.reactant}</div>
                    <div className="text-sm text-purple-600 font-bold mb-1">
                      + {currentQuestion.reagent}
                    </div>
                    <div className="text-xs text-orange-600 font-bold">{currentQuestion.condition}</div>
                    <div className="text-3xl my-3">↓</div>
                    <div className="text-2xl font-bold text-green-600">?</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !quizSubmitted && setSelectedAnswer(option)}
                      disabled={quizSubmitted}
                      className={`w-full px-4 py-3 rounded-lg border-2 text-left font-bold transition-all ${
                        quizSubmitted
                          ? option === currentQuestion.correctAnswer
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : option === selectedAnswer
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-gray-50 border-gray-300 text-gray-400'
                          : selectedAnswer === option
                          ? 'bg-purple-100 border-purple-500 text-purple-700'
                          : 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {quizSubmitted && option === currentQuestion.correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {quizSubmitted && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {!quizSubmitted && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 text-yellow-700 px-4 py-2 rounded-lg font-bold"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!selectedAnswer}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Answer
                    </button>
                  </div>
                )}

                {showHint && !quizSubmitted && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-yellow-800 mb-1">Hint</div>
                        <div className="text-xs text-yellow-700">{currentQuestion.hint}</div>
                      </div>
                    </div>
                  </div>
                )}

                {quizSubmitted && (
                  <div className="mt-3">
                    {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold shadow-lg"
                      >
                        Next Question
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg text-center">
                        <Award className="w-12 h-12 mx-auto mb-2" />
                        <div className="text-xl font-bold mb-1">Quiz Complete!</div>
                        <div className="text-3xl font-bold mb-2">{quizScore}/{QUIZ_QUESTIONS.length}</div>
                        <div className="text-sm">
                          {quizScore === QUIZ_QUESTIONS.length ? '🎉 Perfect Score!' : 
                           quizScore >= 3 ? '👏 Great job!' : '📚 Keep practicing!'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - AI Chat */}
          <div className="w-96">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 h-[calc(100vh-140px)] flex flex-col">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  <div>
                    <h3 className="text-sm font-bold">AI Chemistry Tutor</h3>
                    <p className="text-[10px] text-white/80">Ask me anything about mechanisms!</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-2.5 ${
                        message.role === 'student'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-xs whitespace-pre-line">{message.content}</div>
                      <div className={`text-[9px] mt-1 ${
                        message.role === 'student' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.role === 'student' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2.5">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about mechanisms..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button
                    onClick={() => setChatInput('Explain SN1 vs SN2')}
                    className="text-[10px] px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded font-bold"
                  >
                    SN1 vs SN2
                  </button>
                  <button
                    onClick={() => setChatInput('What makes a good nucleophile?')}
                    className="text-[10px] px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded font-bold"
                  >
                    Nucleophiles
                  </button>
                  <button
                    onClick={() => setChatInput('Why are carbocations stable?')}
                    className="text-[10px] px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded font-bold"
                  >
                    Carbocations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}