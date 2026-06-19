import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Trophy, Zap, Timer, Target, Star, Award, Flame,
  CheckCircle2, XCircle, Sparkles, TrendingUp, Medal, Crown,
  Atom, Brain, Rocket, Gift, PartyPopper, AlertCircle, ChevronRight
} from 'lucide-react';

interface GameElement {
  id: string;
  formula: string;
  name: string;
  type: 'reactant' | 'reagent' | 'product' | 'condition';
  x?: number;
  y?: number;
  isDragging?: boolean;
}

interface ReactionChallenge {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'missing-product' | 'missing-reagent' | 'missing-reactant' | 'balance-equation';
  reactants: string[];
  reagents: string[];
  conditions: string[];
  products: string[];
  missingItem: string; // What the student needs to identify
  options: string[]; // Available options to choose from
  correctAnswer: string;
  explanation: string;
  points: number;
  timeLimit: number; // seconds
}

const CHALLENGES: ReactionChallenge[] = [
  // EASY - Missing Product
  {
    id: 1,
    difficulty: 'easy',
    gameMode: 'missing-product',
    reactants: ['CH₃CH₂Br'],
    reagents: ['OH⁻'],
    conditions: ['Room temp'],
    products: ['?'],
    missingItem: 'product',
    options: ['CH₃CH₂OH', 'CH₂=CH₂', 'CH₃CH₃', 'CH₃CHO'],
    correctAnswer: 'CH₃CH₂OH',
    explanation: 'SN2 reaction: Primary alkyl halide + strong nucleophile → alcohol',
    points: 10,
    timeLimit: 30
  },
  {
    id: 2,
    difficulty: 'easy',
    gameMode: 'missing-product',
    reactants: ['CH₂=CH₂'],
    reagents: ['Br₂'],
    conditions: [],
    products: ['?'],
    missingItem: 'product',
    options: ['CH₂BrCH₂Br', 'CHBr=CHBr', 'CH₃CH₂Br', 'CH₃Br'],
    correctAnswer: 'CH₂BrCH₂Br',
    explanation: 'Electrophilic addition: Br₂ adds across the double bond',
    points: 10,
    timeLimit: 30
  },
  {
    id: 3,
    difficulty: 'easy',
    gameMode: 'missing-reagent',
    reactants: ['CH₃CH₂Br'],
    reagents: ['?'],
    conditions: ['Heat'],
    products: ['CH₂=CH₂'],
    missingItem: 'reagent',
    options: ['OH⁻', 'H₂O', 'Br₂', 'H₂'],
    correctAnswer: 'OH⁻',
    explanation: 'E2 elimination requires strong base (OH⁻) + heat',
    points: 10,
    timeLimit: 30
  },
  
  // MEDIUM - Missing Reagent & Products
  {
    id: 4,
    difficulty: 'medium',
    gameMode: 'missing-reagent',
    reactants: ['CH₃CH₂OH'],
    reagents: ['?'],
    conditions: ['Heat'],
    products: ['CH₃COOH'],
    missingItem: 'reagent',
    options: ['KMnO₄/H⁺', 'NaBH₄', 'Br₂', 'H₂SO₄'],
    correctAnswer: 'KMnO₄/H⁺',
    explanation: 'Oxidation: KMnO₄ oxidizes primary alcohol → carboxylic acid',
    points: 20,
    timeLimit: 25
  },
  {
    id: 5,
    difficulty: 'medium',
    gameMode: 'missing-product',
    reactants: ['(CH₃)₃CBr'],
    reagents: ['H₂O'],
    conditions: [],
    products: ['?'],
    missingItem: 'product',
    options: ['(CH₃)₃COH', '(CH₃)₂C=CH₂', '(CH₃)₄C', 'CH₃Br'],
    correctAnswer: '(CH₃)₃COH',
    explanation: 'SN1 reaction: Tertiary halide + weak nucleophile → alcohol via carbocation',
    points: 20,
    timeLimit: 25
  },
  {
    id: 6,
    difficulty: 'medium',
    gameMode: 'missing-reactant',
    reactants: ['?'],
    reagents: ['H₂/Pd'],
    conditions: [],
    products: ['CH₃CH₃'],
    missingItem: 'reactant',
    options: ['CH₂=CH₂', 'CH₃CH₃', 'CH₃OH', 'CH₄'],
    correctAnswer: 'CH₂=CH₂',
    explanation: 'Reduction: H₂/Pd catalyst reduces alkene → alkane',
    points: 20,
    timeLimit: 25
  },
  
  // HARD - Complex reactions
  {
    id: 7,
    difficulty: 'hard',
    gameMode: 'missing-product',
    reactants: ['C₆H₆', 'CH₃Cl'],
    reagents: ['AlCl₃'],
    conditions: [],
    products: ['?'],
    missingItem: 'product',
    options: ['C₆H₅CH₃', 'C₆H₅Cl', 'C₆H₁₂', 'CH₄'],
    correctAnswer: 'C₆H₅CH₃',
    explanation: 'Friedel-Crafts alkylation: Benzene + alkyl halide + AlCl₃ → alkylbenzene',
    points: 30,
    timeLimit: 20
  },
  {
    id: 8,
    difficulty: 'hard',
    gameMode: 'missing-reagent',
    reactants: ['CH₃COOH', 'CH₃OH'],
    reagents: ['?'],
    conditions: ['Heat'],
    products: ['CH₃COOCH₃'],
    missingItem: 'reagent',
    options: ['H₂SO₄', 'NaOH', 'KMnO₄', 'Br₂'],
    correctAnswer: 'H₂SO₄',
    explanation: 'Esterification: Acid + alcohol + H₂SO₄ catalyst → ester + water',
    points: 30,
    timeLimit: 20
  },
  {
    id: 9,
    difficulty: 'hard',
    gameMode: 'missing-product',
    reactants: ['CH₃CHO'],
    reagents: ['NaBH₄'],
    conditions: [],
    products: ['?'],
    missingItem: 'product',
    options: ['CH₃CH₂OH', 'CH₃COOH', 'CH₃CH₃', 'CH₄'],
    correctAnswer: 'CH₃CH₂OH',
    explanation: 'Reduction: NaBH₄ reduces aldehyde → primary alcohol',
    points: 30,
    timeLimit: 20
  },
  {
    id: 10,
    difficulty: 'hard',
    gameMode: 'missing-reactant',
    reactants: ['?', 'Cl₂'],
    reagents: [],
    conditions: ['Light (hν)'],
    products: ['CH₃Cl', 'HCl'],
    missingItem: 'reactant',
    options: ['CH₄', 'CH₃OH', 'CH₂=CH₂', 'C₂H₆'],
    correctAnswer: 'CH₄',
    explanation: 'Free radical halogenation: Alkane + Cl₂ + light → alkyl halide + HCl',
    points: 30,
    timeLimit: 20
  },
];

export function ReactionGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [combo, setCombo] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Dragging state
  const [draggedElement, setDraggedElement] = useState<GameElement | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);

  // Particle effects
  const [particles, setParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  const currentChallenge = CHALLENGES[currentChallengeIndex];

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameOver || isAnswerChecked) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, isAnswerChecked, currentChallengeIndex]);

  // Reset timer when challenge changes
  useEffect(() => {
    if (currentChallenge) {
      setTimeRemaining(currentChallenge.timeLimit);
    }
  }, [currentChallengeIndex]);

  // Canvas animation for particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw reaction equation
      drawReactionEquation(ctx);

      // Draw and update particles
      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // gravity
            life: p.life - 1
          }))
          .filter(p => p.life > 0);

        updated.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life / 60;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentChallenge, selectedAnswer, isAnswerChecked]);

  const drawReactionEquation = (ctx: CanvasRenderingContext2D) => {
    if (!currentChallenge) return;

    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const centerY = 200;
    let x = 100;

    // Draw reactants
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    currentChallenge.reactants.forEach((reactant, i) => {
      if (reactant === '?') {
        // Missing reactant box
        const boxWidth = 120;
        const boxHeight = 60;
        ctx.fillStyle = dropZoneActive && currentChallenge.gameMode === 'missing-reactant' 
          ? '#DBEAFE' 
          : selectedAnswer && currentChallenge.gameMode === 'missing-reactant'
          ? '#D1FAE5'
          : '#FEF3C7';
        ctx.fillRect(x - boxWidth/2, centerY - boxHeight/2, boxWidth, boxHeight);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - boxWidth/2, centerY - boxHeight/2, boxWidth, boxHeight);
        
        ctx.fillStyle = '#92400E';
        ctx.font = 'bold 20px Arial';
        if (selectedAnswer && currentChallenge.gameMode === 'missing-reactant') {
          ctx.fillText(selectedAnswer, x, centerY);
        } else {
          ctx.fillText('?', x, centerY - 10);
          ctx.font = 'bold 12px Arial';
          ctx.fillText('Drag here', x, centerY + 15);
        }
      } else {
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(reactant, x, centerY);
      }
      
      if (i < currentChallenge.reactants.length - 1) {
        x += 150;
        ctx.fillStyle = '#6B7280';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('+', x, centerY);
        x += 150;
      } else {
        x += 180;
      }
    });

    // Draw arrow with reagents
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + 120, centerY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x + 120, centerY);
    ctx.lineTo(x + 110, centerY - 8);
    ctx.lineTo(x + 110, centerY + 8);
    ctx.closePath();
    ctx.fillStyle = '#3B82F6';
    ctx.fill();

    // Reagents above arrow
    if (currentChallenge.reagents.length > 0) {
      const reagentY = centerY - 40;
      currentChallenge.reagents.forEach((reagent, i) => {
        if (reagent === '?') {
          // Missing reagent box
          const boxWidth = 100;
          const boxHeight = 40;
          ctx.fillStyle = dropZoneActive && currentChallenge.gameMode === 'missing-reagent'
            ? '#DBEAFE'
            : selectedAnswer && currentChallenge.gameMode === 'missing-reagent'
            ? '#D1FAE5'
            : '#FEF3C7';
          ctx.fillRect(x + 60 - boxWidth/2, reagentY - boxHeight/2, boxWidth, boxHeight);
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 60 - boxWidth/2, reagentY - boxHeight/2, boxWidth, boxHeight);
          
          ctx.fillStyle = '#92400E';
          ctx.font = 'bold 16px Arial';
          if (selectedAnswer && currentChallenge.gameMode === 'missing-reagent') {
            ctx.fillText(selectedAnswer, x + 60, reagentY);
          } else {
            ctx.fillText('?', x + 60, reagentY);
          }
        } else {
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 18px Arial';
          ctx.fillText(reagent, x + 60, reagentY);
        }
      });
    }

    // Conditions below arrow
    if (currentChallenge.conditions.length > 0) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(currentChallenge.conditions.join(', '), x + 60, centerY + 35);
    }

    x += 180;

    // Draw products
    currentChallenge.products.forEach((product, i) => {
      if (product === '?') {
        // Missing product box - HIGHLIGHT
        const boxWidth = 140;
        const boxHeight = 70;
        ctx.fillStyle = dropZoneActive && currentChallenge.gameMode === 'missing-product'
          ? '#DBEAFE'
          : selectedAnswer && currentChallenge.gameMode === 'missing-product'
          ? '#D1FAE5'
          : '#FEF3C7';
        ctx.fillRect(x - boxWidth/2, centerY - boxHeight/2, boxWidth, boxHeight);
        ctx.strokeStyle = isAnswerChecked 
          ? (isCorrect ? '#10B981' : '#EF4444')
          : '#F59E0B';
        ctx.lineWidth = 4;
        ctx.strokeRect(x - boxWidth/2, centerY - boxHeight/2, boxWidth, boxHeight);
        
        ctx.fillStyle = isAnswerChecked
          ? (isCorrect ? '#059669' : '#DC2626')
          : '#92400E';
        ctx.font = 'bold 24px Arial';
        if (selectedAnswer && currentChallenge.gameMode === 'missing-product') {
          ctx.fillText(selectedAnswer, x, centerY);
        } else {
          ctx.fillText('?', x, centerY - 10);
          ctx.font = 'bold 14px Arial';
          ctx.fillText('Select below', x, centerY + 15);
        }
      } else {
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(product, x, centerY);
      }
      
      if (i < currentChallenge.products.length - 1) {
        x += 150;
        ctx.fillStyle = '#6B7280';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('+', x, centerY);
        x += 150;
      }
    });
  };

  const createParticles = (isSuccess: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newParticles = [];
    const color = isSuccess ? '#10B981' : '#EF4444';
    const centerX = canvas.width / 2;
    const centerY = 200;

    for (let i = 0; i < 30; i++) {
      newParticles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 60,
        color
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  const handleTimeout = () => {
    setLives(prev => prev - 1);
    setStreak(0);
    setCombo(1);
    setIsAnswerChecked(true);
    setIsCorrect(false);
    setShowExplanation(true);
    createParticles(false);
    
    if (lives <= 1) {
      setGameOver(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || isAnswerChecked) return;

    setTotalQuestions(prev => prev + 1);
    const correct = selectedAnswer === currentChallenge.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    setShowExplanation(true);

    if (correct) {
      const bonusPoints = Math.floor(timeRemaining / 5) * combo;
      const totalPoints = currentChallenge.points + bonusPoints;
      setScore(prev => prev + totalPoints);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      setCombo(prev => Math.min(prev + 0.5, 5));
      createParticles(true);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      setCombo(1);
      createParticles(false);
      
      if (lives <= 1) {
        setGameOver(true);
      }
    }
  };

  const handleNext = () => {
    if (currentChallengeIndex < CHALLENGES.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswerChecked(false);
      setShowExplanation(false);
      setTimeRemaining(CHALLENGES[currentChallengeIndex + 1].timeLimit);
    } else {
      setGameOver(true);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setStreak(0);
    setCombo(1);
    setCurrentChallengeIndex(0);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setGameOver(false);
    setSelectedAnswer('');
    setIsAnswerChecked(false);
    setShowExplanation(false);
    setTimeRemaining(CHALLENGES[0].timeLimit);
  };

  const restartGame = () => {
    startGame();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeColor = () => {
    if (timeRemaining > 15) return 'text-green-600';
    if (timeRemaining > 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                <Rocket className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Chemistry Reaction Game
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Master chemical reactions through fun, interactive challenges!
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎮 How to Play</h3>
              <div className="text-left space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <div>
                    <strong>Complete the Reaction:</strong> Fill in missing reactants, reagents, or products
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <div>
                    <strong>Beat the Clock:</strong> Answer before time runs out!
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <div>
                    <strong>Build Combos:</strong> Correct streaks multiply your score!
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                  <div>
                    <strong>3 Lives:</strong> Wrong answers or timeouts cost a life!
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
              <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                <div className="text-green-700 font-bold">Easy</div>
                <div className="text-xs text-green-600">10 points</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
                <div className="text-yellow-700 font-bold">Medium</div>
                <div className="text-xs text-yellow-600">20 points</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border-2 border-red-200">
                <div className="text-red-700 font-bold">Hard</div>
                <div className="text-xs text-red-600">30 points</div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Start Game
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const grade = accuracy >= 90 ? 'A+' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : 'D';

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full animate-bounce">
                {score >= 150 ? <Crown className="w-16 h-16 text-white" /> : <Trophy className="w-16 h-16 text-white" />}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {score >= 150 ? '🎉 Amazing!' : score >= 100 ? '👏 Great Job!' : '📚 Keep Practicing!'}
            </h1>
            <p className="text-gray-600 mb-6">Game Over</p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-3xl font-bold text-purple-600">{score}</div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-3xl font-bold text-pink-600">{grade}</div>
                  <div className="text-sm text-gray-600">Grade</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between bg-white p-3 rounded-lg">
                  <span className="text-gray-700">Questions Answered:</span>
                  <span className="font-bold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between bg-white p-3 rounded-lg">
                  <span className="text-gray-700">Correct Answers:</span>
                  <span className="font-bold text-green-600">{correctAnswers}</span>
                </div>
                <div className="flex justify-between bg-white p-3 rounded-lg">
                  <span className="text-gray-700">Accuracy:</span>
                  <span className="font-bold text-blue-600">{accuracy}%</span>
                </div>
                <div className="flex justify-between bg-white p-3 rounded-lg">
                  <span className="text-gray-700">Best Streak:</span>
                  <span className="font-bold text-orange-600">{streak} 🔥</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={restartGame}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-5 py-3 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Game
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{streak} Streak</span>
            </div>
            {combo > 1 && (
              <div className="flex items-center gap-2 bg-yellow-400 text-purple-900 px-3 py-1.5 rounded-lg animate-pulse">
                <Zap className="w-4 h-4" />
                <span className="font-bold">{combo}x Combo</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i < lives ? 'bg-red-500' : 'bg-white/20'
                }`}>
                  ❤️
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Challenge Info */}
          <div className="w-80 space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">Challenge {currentChallengeIndex + 1} / {CHALLENGES.length}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getDifficultyColor(currentChallenge.difficulty)}`}>
                  {currentChallenge.difficulty.toUpperCase()}
                </span>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg mb-3">
                <div className="text-xs text-gray-600 mb-1">Task:</div>
                <div className="text-sm font-bold text-gray-800">
                  {currentChallenge.gameMode === 'missing-product' && '🎯 Identify the Product'}
                  {currentChallenge.gameMode === 'missing-reagent' && '⚗️ Find the Missing Reagent'}
                  {currentChallenge.gameMode === 'missing-reactant' && '🧪 Identify the Reactant'}
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Timer className={`w-5 h-5 ${getTimeColor()}`} />
                  <span className="text-sm font-bold">Time:</span>
                </div>
                <span className={`text-2xl font-bold ${getTimeColor()}`}>
                  {timeRemaining}s
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-lg p-4 border-2 border-yellow-200">
              <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Scoring
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Base Points:</span>
                  <span className="font-bold">{currentChallenge.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Bonus:</span>
                  <span className="font-bold text-green-600">+{Math.floor(timeRemaining / 5)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combo Multiplier:</span>
                  <span className="font-bold text-purple-600">×{combo}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="font-bold">Potential:</span>
                  <span className="font-bold text-orange-600">
                    {Math.floor((currentChallenge.points + Math.floor(timeRemaining / 5)) * combo)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-4 border-2 border-blue-200">
              <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Quick Tips
              </h3>
              <div className="text-xs text-gray-700 space-y-1">
                <div>💡 Think about reaction type</div>
                <div>⚡ Check reagent strength</div>
                <div>🎯 Consider conditions</div>
                <div>🔥 Speed = Bonus points!</div>
              </div>
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 mb-4">
              <canvas
                ref={canvasRef}
                width={900}
                height={400}
                className="w-full border-2 border-gray-300 rounded-lg"
              />
            </div>

            {/* Answer Options */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Select Your Answer:
              </h3>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {currentChallenge.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswerChecked}
                    className={`px-4 py-6 rounded-xl border-3 font-bold text-lg transition-all transform hover:scale-105 ${
                      selectedAnswer === option
                        ? isAnswerChecked
                          ? isCorrect
                            ? 'bg-green-100 border-green-500 text-green-700 shadow-lg'
                            : 'bg-red-100 border-red-500 text-red-700 shadow-lg'
                          : 'bg-purple-100 border-purple-500 text-purple-700 shadow-lg'
                        : isAnswerChecked && option === currentChallenge.correctAnswer
                        ? 'bg-green-50 border-green-300 text-green-600'
                        : 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    } ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {!isAnswerChecked ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Next Challenge
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className={`mt-4 rounded-lg shadow-lg p-6 border-2 ${
                isCorrect 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className={`text-lg font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                    </h4>
                    {!isCorrect && (
                      <p className="text-sm text-red-700 mb-2">
                        <strong>Correct Answer:</strong> {currentChallenge.correctAnswer}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">
                      <strong>Explanation:</strong> {currentChallenge.explanation}
                    </p>
                    {isCorrect && (
                      <div className="mt-3 flex gap-2">
                        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          +{currentChallenge.points} points
                        </span>
                        {Math.floor(timeRemaining / 5) > 0 && (
                          <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                            +{Math.floor(timeRemaining / 5)} time bonus
                          </span>
                        )}
                        {combo > 1 && (
                          <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
                            ×{combo} combo
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}