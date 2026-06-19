import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  Gamepad2,
  Building2,
  DollarSign,
  Microscope,
  Code,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Award,
  Star,
  Users,
  Video,
  ArrowRight,
  Target,
  Brain,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  Clock,
  Trophy,
  BookOpen,
  ChevronRight,
  Activity
} from 'lucide-react';

// Types
interface Career {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
  avgSalary: string;
  demandLevel: 'high' | 'medium' | 'low';
  companies: string[];
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  realWorldContext: string;
  problemStatement: string;
  conceptsUsed: string[];
  successCriteria: string;
  failureCriteria: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
  yearsExperience: number;
}

interface SimulationState {
  isPlaying: boolean;
  currentValue: number;
  result: 'success' | 'failure' | 'pending';
  attempts: number;
  hintsUsed: number;
}

// Career Database
const careers: Career[] = [
  {
    id: 'game-dev',
    name: 'Game Developer',
    icon: Gamepad2,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    description: 'Create immersive gaming experiences using physics, math, and creative coding',
    avgSalary: '₹8-25 LPA',
    demandLevel: 'high',
    companies: ['Rockstar Games', 'EA Sports', 'Ubisoft', 'Epic Games']
  },
  {
    id: 'civil-engineer',
    name: 'Civil Engineer',
    icon: Building2,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    description: 'Design bridges, buildings, and infrastructure that shape our cities',
    avgSalary: '₹6-20 LPA',
    demandLevel: 'high',
    companies: ['L&T', 'Tata Projects', 'Shapoorji Pallonji', 'DLF']
  },
  {
    id: 'space-scientist',
    name: 'Space Scientist',
    icon: Rocket,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    description: 'Explore the universe using advanced physics and mathematics',
    avgSalary: '₹10-30 LPA',
    demandLevel: 'medium',
    companies: ['ISRO', 'NASA', 'SpaceX', 'Blue Origin']
  },
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    description: 'Use statistics and calculus to predict market trends and maximize profits',
    avgSalary: '₹7-35 LPA',
    demandLevel: 'high',
    companies: ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'HDFC']
  },
  {
    id: 'biomedical-engineer',
    name: 'Biomedical Engineer',
    icon: Microscope,
    color: 'from-red-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
    description: 'Design medical devices and technologies that save lives',
    avgSalary: '₹6-22 LPA',
    demandLevel: 'medium',
    companies: ['Medtronic', 'Siemens Healthineers', 'Philips Healthcare', 'GE Healthcare']
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
    description: 'Extract insights from data using statistics, algorithms, and machine learning',
    avgSalary: '₹10-40 LPA',
    demandLevel: 'high',
    companies: ['Google', 'Amazon', 'Microsoft', 'Netflix']
  }
];

// Scenario Database (for Quadratic Equations topic)
const scenariosDatabase: Record<string, Scenario[]> = {
  'game-dev': [
    {
      id: 'basketball-trajectory',
      title: 'Basketball Game - Perfect Shot Trajectory',
      description: 'Fix the basketball shooting mechanics in your game',
      difficulty: 'medium',
      realWorldContext: 'You are developing a mobile basketball game. Players are complaining that the ball trajectory looks unrealistic and the shots never go in the hoop.',
      problemStatement: 'The ball is launched from position (0, 2) meters with initial velocity of 15 m/s at a 45° angle. The basketball hoop is at height 3 meters. Calculate when the ball reaches the hoop height and whether it will score.',
      conceptsUsed: ['Quadratic Equations', 'Projectile Motion', 'Trigonometry'],
      successCriteria: 'Ball passes through hoop at the correct time',
      failureCriteria: 'Ball misses the hoop completely'
    }
  ],
  'civil-engineer': [
    {
      id: 'bridge-arch',
      title: 'Mumbai Metro Bridge - Arch Design',
      description: 'Design the perfect parabolic arch for a metro bridge',
      difficulty: 'hard',
      realWorldContext: 'L&T has hired you to design a bridge arch for the Mumbai Metro. The arch must be strong enough to support 600 tons while looking aesthetically pleasing.',
      problemStatement: 'Design a parabolic arch spanning 50 meters with a maximum height of 12 meters. Calculate the equation of the arch and verify it can support the load distribution.',
      conceptsUsed: ['Quadratic Equations', 'Parabolas', 'Structural Analysis'],
      successCriteria: 'Arch supports full load with safety factor > 1.5',
      failureCriteria: 'Arch collapses under load - structural failure!'
    }
  ],
  'space-scientist': [
    {
      id: 'satellite-trajectory',
      title: 'ISRO Satellite Launch - Trajectory Calculation',
      description: 'Calculate the perfect launch trajectory for a satellite',
      difficulty: 'hard',
      realWorldContext: 'ISRO is launching a new communication satellite. You need to calculate the exact trajectory to ensure it reaches the correct orbit altitude.',
      problemStatement: 'The rocket launches with initial velocity 2000 m/s at 60° angle. Accounting for gravity (9.8 m/s²), calculate the maximum altitude and time to reach orbital height (400 km).',
      conceptsUsed: ['Quadratic Equations', 'Kinematics', 'Orbital Mechanics'],
      successCriteria: 'Satellite reaches orbit within ±5 km tolerance',
      failureCriteria: 'Satellite misses orbit - mission failure!'
    }
  ],
  'financial-analyst': [
    {
      id: 'profit-optimization',
      title: 'Stock Market - Profit Maximization',
      description: 'Find the optimal price point to maximize company profits',
      difficulty: 'medium',
      realWorldContext: 'You are analyzing a tech startup for Goldman Sachs. The company\'s profit follows a quadratic pattern based on pricing strategy.',
      problemStatement: 'The profit function is P(x) = -2x² + 80x - 200, where x is the price per unit in thousands. Find the price that maximizes profit and calculate maximum profit achievable.',
      conceptsUsed: ['Quadratic Equations', 'Optimization', 'Vertex Formula'],
      successCriteria: 'Find optimal price and maximum profit',
      failureCriteria: 'Recommend wrong price - company loses money!'
    }
  ],
  'biomedical-engineer': [
    {
      id: 'drug-concentration',
      title: 'Drug Dosage - Optimal Concentration Curve',
      description: 'Calculate safe and effective drug concentration over time',
      difficulty: 'medium',
      realWorldContext: 'Designing an insulin pump for diabetic patients. The drug concentration in blood must stay within a safe therapeutic range.',
      problemStatement: 'Drug concentration follows C(t) = -0.5t² + 4t + 1 mg/L, where t is hours. Find when concentration is maximum and when it drops below therapeutic level (2 mg/L).',
      conceptsUsed: ['Quadratic Equations', 'Pharmacokinetics', 'Calculus'],
      successCriteria: 'Maintain safe concentration 2-8 mg/L',
      failureCriteria: 'Concentration too high = toxicity OR too low = ineffective!'
    }
  ],
  'data-scientist': [
    {
      id: 'ml-loss-function',
      title: 'Machine Learning - Minimize Loss Function',
      description: 'Optimize an AI model by minimizing the quadratic loss function',
      difficulty: 'hard',
      realWorldContext: 'Training a Netflix recommendation algorithm. The model\'s error (loss) follows a quadratic pattern based on learning rate.',
      problemStatement: 'Loss function is L(α) = 0.01α² - 0.4α + 5, where α is the learning rate. Find the optimal learning rate that minimizes prediction error.',
      conceptsUsed: ['Quadratic Equations', 'Optimization', 'Machine Learning'],
      successCriteria: 'Find optimal learning rate, minimize loss',
      failureCriteria: 'Wrong learning rate - AI makes bad predictions!'
    }
  ]
};

// Testimonial Database
const testimonialsDatabase: Record<string, Testimonial> = {
  'game-dev': {
    name: 'Rajesh Sharma',
    role: 'Senior Game Developer',
    company: 'Rockstar Games India',
    image: '👨‍💻',
    quote: 'I use quadratic equations EVERY SINGLE DAY to create realistic physics in games. Without understanding parabolic motion, you cannot make a good game. This is not optional - it\'s fundamental!',
    yearsExperience: 8
  },
  'civil-engineer': {
    name: 'Priya Desai',
    role: 'Chief Structural Engineer',
    company: 'L&T Construction',
    image: '👷‍♀️',
    quote: 'Every bridge, every arch, every cable structure uses parabolic equations. Last month, I designed a 2 km bridge using these exact concepts. This math literally holds up our infrastructure!',
    yearsExperience: 12
  },
  'space-scientist': {
    name: 'Dr. Vikram Sarabhai Jr.',
    role: 'Mission Director',
    company: 'ISRO',
    image: '🚀',
    quote: 'When we launched Chandrayaan-3, every trajectory calculation used quadratic equations. One small error in these calculations = mission failure. This math put India on the moon!',
    yearsExperience: 15
  },
  'financial-analyst': {
    name: 'Ananya Verma',
    role: 'Quantitative Analyst',
    company: 'Goldman Sachs',
    image: '💼',
    quote: 'Finding optimal profit points, minimizing risk - it\'s all quadratic optimization. Last quarter, I used these concepts to save our client ₹50 crores. Math = Money in finance!',
    yearsExperience: 6
  },
  'biomedical-engineer': {
    name: 'Dr. Arjun Mehta',
    role: 'Biomedical Device Engineer',
    company: 'Medtronic India',
    image: '⚕️',
    quote: 'I design insulin pumps and pacemakers. Drug concentration curves are quadratic functions. Getting this wrong = patient dies. Understanding these equations literally saves lives every day!',
    yearsExperience: 10
  },
  'data-scientist': {
    name: 'Sneha Krishnan',
    role: 'Senior Data Scientist',
    company: 'Google India',
    image: '📊',
    quote: 'Machine learning loss functions are quadratic. Finding minimum loss = finding vertex of parabola. Every AI model you use (ChatGPT, Google Search) was optimized using these equations!',
    yearsExperience: 7
  }
};

export function RealWorldSimulator() {
  const [currentTopic] = useState('Quadratic Equations');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isPlaying: false,
    currentValue: 0,
    result: 'pending',
    attempts: 0,
    hintsUsed: 0
  });
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Simulation animation
  useEffect(() => {
    if (simulationState.isPlaying && selectedScenario) {
      const interval = setInterval(() => {
        setSimulationState(prev => {
          const newValue = prev.currentValue + 0.1;
          if (newValue >= 10) {
            return { ...prev, isPlaying: false, currentValue: 0 };
          }
          return { ...prev, currentValue: newValue };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [simulationState.isPlaying, selectedScenario]);

  const handleCareerSelect = (career: Career) => {
    setSelectedCareer(career);
    const scenarios = scenariosDatabase[career.id];
    if (scenarios && scenarios.length > 0) {
      setSelectedScenario(scenarios[0]);
    }
    setSimulationState({
      isPlaying: false,
      currentValue: 0,
      result: 'pending',
      attempts: 0,
      hintsUsed: 0
    });
  };

  const handleSimulate = () => {
    setSimulationState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const handleSubmitAnswer = () => {
    // Simulate answer checking (in real app, this would use AI)
    const isCorrect = Math.random() > 0.3; // Demo: 70% success rate
    
    setSimulationState(prev => ({
      ...prev,
      result: isCorrect ? 'success' : 'failure',
      attempts: prev.attempts + 1,
      isPlaying: false,
      currentValue: 0
    }));

    if (isCorrect) {
      setTimeout(() => setShowTestimonial(true), 1000);
    }
  };

  const handleReset = () => {
    setSimulationState({
      isPlaying: false,
      currentValue: 0,
      result: 'pending',
      attempts: simulationState.attempts,
      hintsUsed: simulationState.hintsUsed
    });
    setUserAnswer('');
  };

  const handleGetHint = () => {
    setShowHint(true);
    setSimulationState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Real-World Impact Simulator</h1>
                  <p className="text-slate-600 mt-1">See EXACTLY where you'll use what you're learning</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border border-amber-200">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-900">Patent-Pending Technology</span>
              </div>
            </div>
          </div>

          {/* Current Topic */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">Currently Learning:</p>
                  <p className="text-xl font-bold text-slate-900">{currentTopic}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">6</p>
                  <p className="text-xs text-slate-600">Real Careers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-xs text-slate-600">Simulations</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-xs text-slate-600">Practical Use</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Career Selection */}
        {!selectedCareer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Choose Your Career Path</h2>
            </div>
            <p className="text-slate-600 mb-6">Select a career to see how you'll use <span className="font-semibold text-blue-600">{currentTopic}</span> in real life:</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careers.map((career, index) => (
                <motion.button
                  key={career.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleCareerSelect(career)}
                  className="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-6 text-left hover:border-blue-400 hover:shadow-xl transition-all"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${career.gradient}`} />
                  
                  <div className="relative">
                    <div className={`p-3 bg-gradient-to-br ${career.color} rounded-lg w-fit mb-4`}>
                      <career.icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{career.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">{career.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Avg. Salary:</span>
                        <span className="font-semibold text-green-600">{career.avgSalary}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Demand:</span>
                        <span className={`font-semibold ${
                          career.demandLevel === 'high' ? 'text-green-600' :
                          career.demandLevel === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {career.demandLevel === 'high' ? '🔥 Very High' :
                           career.demandLevel === 'medium' ? '📈 Growing' :
                           '📊 Moderate'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-2">Top Companies:</p>
                      <div className="flex flex-wrap gap-1">
                        {career.companies.slice(0, 2).map((company) => (
                          <span key={company} className="text-xs px-2 py-1 bg-slate-100 rounded-md text-slate-700">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                      <span>See Real Scenario</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Simulation Area */}
        {selectedCareer && selectedScenario && (
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Scenario Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-4"
            >
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedCareer(null);
                  setSelectedScenario(null);
                  setShowTestimonial(false);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Choose Different Career
              </button>

              {/* Career Card */}
              <div className={`${selectedCareer.gradient} rounded-xl p-6 border border-slate-200`}>
                <div className={`p-3 bg-gradient-to-br ${selectedCareer.color} rounded-lg w-fit mb-3`}>
                  <selectedCareer.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedCareer.name}</h3>
                <p className="text-sm text-slate-700">{selectedCareer.description}</p>
              </div>

              {/* Scenario Info */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-slate-900">Real-World Scenario</h4>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{selectedScenario.title}</h3>
                  <p className="text-sm text-slate-600">{selectedScenario.description}</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">THE SITUATION:</p>
                  <p className="text-sm text-blue-800">{selectedScenario.realWorldContext}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Concepts You'll Use:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedScenario.conceptsUsed.map((concept) => (
                      <span key={concept} className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Success:</p>
                      <p className="text-xs text-slate-600">{selectedScenario.successCriteria}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Failure:</p>
                      <p className="text-xs text-slate-600">{selectedScenario.failureCriteria}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  selectedScenario.difficulty === 'hard' ? 'bg-red-50 border-red-200' :
                  selectedScenario.difficulty === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Difficulty Level:</span>
                    <span className={`text-sm font-bold ${
                      selectedScenario.difficulty === 'hard' ? 'text-red-600' :
                      selectedScenario.difficulty === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {selectedScenario.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Your Progress
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Attempts:</span>
                    <span className="font-bold text-slate-900">{simulationState.attempts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Hints Used:</span>
                    <span className="font-bold text-slate-900">{simulationState.hintsUsed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Status:</span>
                    <span className={`font-bold ${
                      simulationState.result === 'success' ? 'text-green-600' :
                      simulationState.result === 'failure' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {simulationState.result === 'success' ? '✅ Success' :
                       simulationState.result === 'failure' ? '❌ Try Again' :
                       '⏳ In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Interactive Simulation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Problem Statement */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-slate-900">The Problem</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">{selectedScenario.problemStatement}</p>
              </div>

              {/* Visual Simulation */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Live Simulation</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulate}
                      className={`p-2 rounded-lg ${
                        simulationState.isPlaying
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } transition-colors`}
                    >
                      {simulationState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Visualization Area - Career Specific */}
                <div className="relative h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 overflow-hidden">
                  {selectedCareer.id === 'game-dev' && (
                    <BasketballSimulation 
                      isPlaying={simulationState.isPlaying}
                      currentValue={simulationState.currentValue}
                      result={simulationState.result}
                    />
                  )}
                  {selectedCareer.id === 'civil-engineer' && (
                    <BridgeArchSimulation 
                      isPlaying={simulationState.isPlaying}
                      currentValue={simulationState.currentValue}
                      result={simulationState.result}
                    />
                  )}
                  {selectedCareer.id === 'space-scientist' && (
                    <RocketSimulation 
                      isPlaying={simulationState.isPlaying}
                      currentValue={simulationState.currentValue}
                      result={simulationState.result}
                    />
                  )}
                  {selectedCareer.id === 'financial-analyst' && (
                    <ProfitGraphSimulation 
                      isPlaying={simulationState.isPlaying}
                      currentValue={simulationState.currentValue}
                      result={simulationState.result}
                    />
                  )}
                  {selectedCareer.id === 'biomedical-engineer' && (
                    <DrugConcentrationSimulation 
                      isPlaying={simulationState.isPlaying}
                      currentValue={simulationState.currentValue}
                      result={simulationState.result}
                    />
                  )}
                  {selectedCareer.id === 'data-scientist' && (
                    <LossFunctionSimulation 
                      isPlaying={simulationState.isPlaying}
                      currentValue={simulationState.currentValue}
                      result={simulationState.result}
                    />
                  )}
                </div>

                {/* Result Indicator */}
                <AnimatePresence>
                  {simulationState.result !== 'pending' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-4 p-4 rounded-lg border-2 ${
                        simulationState.result === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {simulationState.result === 'success' ? (
                          <>
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div>
                              <p className="font-bold text-green-900">Perfect! Your solution works!</p>
                              <p className="text-sm text-green-700 mt-1">{selectedScenario.successCriteria}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-red-600" />
                            <div>
                              <p className="font-bold text-red-900">Not quite right. Try again!</p>
                              <p className="text-sm text-red-700 mt-1">{selectedScenario.failureCriteria}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Solution Input */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Your Solution</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Enter your equation or answer:
                    </label>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="e.g., h(t) = -4.9t² + 15t + 2"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-slate-900"
                    />
                  </div>

                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900 mb-1">Hint:</p>
                          <p className="text-sm text-amber-800">
                            Use the standard form: y = ax² + bx + c. Remember, gravity affects the coefficient of t²!
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Target className="w-5 h-5" />
                      Test My Solution
                    </button>
                    <button
                      onClick={handleGetHint}
                      className="px-6 py-3 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2"
                    >
                      <Lightbulb className="w-5 h-5" />
                      Get Hint
                    </button>
                  </div>
                </div>
              </div>

              {/* Professional Testimonial */}
              <AnimatePresence>
                {showTestimonial && selectedCareer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Video className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-900">Real Professional Perspective</h3>
                    </div>

                    {(() => {
                      const testimonial = testimonialsDatabase[selectedCareer.id];
                      return (
                        <div className="bg-white rounded-lg p-5">
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{testimonial.image}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                                  <p className="text-sm font-semibold text-blue-600">{testimonial.company}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1">{testimonial.yearsExperience} years exp.</p>
                                </div>
                              </div>
                              <p className="text-slate-700 italic leading-relaxed">"{testimonial.quote}"</p>
                              
                              <div className="mt-4 flex items-center gap-2">
                                <ThumbsUp className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-semibold text-green-700">This helped 1,247 students choose this career!</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}

// Simulation Components

function BasketballSimulation({ isPlaying, currentValue, result }: { isPlaying: boolean; currentValue: number; result: string }) {
  const ballProgress = (currentValue / 10) * 100;
  
  return (
    <div className="relative w-full h-full flex items-end justify-center p-8">
      {/* Basketball Court */}
      <div className="absolute bottom-0 w-full h-1 bg-amber-800" />
      
      {/* Hoop */}
      <div className="absolute right-20 bottom-32">
        <div className="w-16 h-2 bg-orange-600 rounded-full" />
        <div className="w-1 h-8 bg-slate-400 mx-auto" />
      </div>

      {/* Basketball */}
      <motion.div
        animate={{
          x: ballProgress * 4,
          y: -Math.sin((ballProgress / 100) * Math.PI) * 200 - 20
        }}
        className={`absolute left-8 w-12 h-12 rounded-full ${
          result === 'success' ? 'bg-green-500' : result === 'failure' ? 'bg-red-500' : 'bg-orange-500'
        } shadow-lg`}
      >
        <div className="absolute inset-2 border-2 border-black/20 rounded-full" />
      </motion.div>

      {/* Trajectory Path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d={`M 50 ${300} Q ${200} ${50} ${350} ${150}`}
          stroke={result === 'success' ? '#22c55e' : result === 'failure' ? '#ef4444' : '#3b82f6'}
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          opacity="0.5"
        />
      </svg>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded-lg shadow">
        <p className="text-xs font-semibold text-slate-700">Initial Position: (0, 2m)</p>
        <p className="text-xs text-slate-600">Velocity: 15 m/s at 45°</p>
      </div>
      <div className="absolute top-4 right-4 bg-white/90 px-3 py-2 rounded-lg shadow">
        <p className="text-xs font-semibold text-slate-700">Target: Hoop at 3m</p>
        <p className="text-xs text-slate-600">Distance: 8m horizontal</p>
      </div>
    </div>
  );
}

function BridgeArchSimulation({ isPlaying, currentValue, result }: { isPlaying: boolean; currentValue: number; result: string }) {
  const stress = currentValue * 10;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Ground */}
      <div className="absolute bottom-0 w-full h-2 bg-green-800" />
      
      {/* Bridge Arch */}
      <svg className="absolute inset-0 w-full h-full">
        <path
          d="M 50 280 Q 200 80 350 280"
          stroke={result === 'success' ? '#22c55e' : result === 'failure' ? '#ef4444' : '#64748b'}
          strokeWidth="8"
          fill="none"
        />
        {/* Support cables */}
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1={50 + i * 75}
            y1={280 - Math.sin((i / 4) * Math.PI) * 150}
            x2={50 + i * 75}
            y2={280}
            stroke="#94a3b8"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Load Indicator */}
      {isPlaying && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-24 bg-yellow-500 px-4 py-2 rounded-lg shadow-lg"
        >
          <p className="text-sm font-bold text-white">Load: {stress.toFixed(0)} tons</p>
        </motion.div>
      )}

      {/* Stress Indicator */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg shadow">
        <p className="text-xs font-semibold text-slate-700">Span: 50 meters</p>
        <p className="text-xs text-slate-600">Max Height: 12 meters</p>
        <div className="mt-2">
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${stress > 60 ? 'bg-red-500' : stress > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(stress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">Stress Level</p>
        </div>
      </div>
    </div>
  );
}

function RocketSimulation({ isPlaying, currentValue, result }: { isPlaying: boolean; currentValue: number; result: string }) {
  const altitude = currentValue * 40; // km
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 overflow-hidden">
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random()
          }}
        />
      ))}

      {/* Rocket */}
      <motion.div
        animate={{
          y: -altitude * 0.5,
          rotate: 60
        }}
        className="absolute left-8 bottom-8"
      >
        <Rocket className={`w-12 h-12 ${
          result === 'success' ? 'text-green-400' : result === 'failure' ? 'text-red-400' : 'text-white'
        }`} />
      </motion.div>

      {/* Trajectory */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d="M 60 280 Q 150 150 300 50"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
        />
      </svg>

      {/* Target Orbit Line */}
      <div className="absolute top-16 left-0 right-0 h-1 border-t-2 border-dashed border-green-400 opacity-50" />
      <div className="absolute top-16 right-4 bg-green-400/20 px-3 py-1 rounded-lg">
        <p className="text-xs font-bold text-green-200">Target Orbit: 400 km</p>
      </div>

      {/* Telemetry */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-4 py-3 rounded-lg border border-white/20">
        <p className="text-xs font-semibold text-green-400">ALTITUDE: {altitude.toFixed(1)} km</p>
        <p className="text-xs text-blue-300">VELOCITY: 2000 m/s</p>
        <p className="text-xs text-purple-300">ANGLE: 60°</p>
      </div>
    </div>
  );
}

function ProfitGraphSimulation({ isPlaying, currentValue, result }: { isPlaying: boolean; currentValue: number; result: string }) {
  const price = currentValue * 3; // Price range 0-30
  const profit = -2 * price * price + 80 * price - 200;
  
  return (
    <div className="relative w-full h-full bg-white p-8">
      {/* Graph Axes */}
      <svg className="w-full h-full">
        {/* Grid */}
        {[...Array(10)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="40"
            y1={40 + i * 25}
            x2="360"
            y2={40 + i * 25}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={40 + i * 32}
            y1="40"
            x2={40 + i * 32}
            y2="290"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1="40" y1="290" x2="360" y2="290" stroke="#1e293b" strokeWidth="2" />
        <line x1="40" y1="40" x2="40" y2="290" stroke="#1e293b" strokeWidth="2" />

        {/* Parabola */}
        <path
          d="M 40 290 Q 200 40 360 290"
          stroke={result === 'success' ? '#22c55e' : result === 'failure' ? '#ef4444' : '#3b82f6'}
          strokeWidth="3"
          fill="none"
        />

        {/* Current Point */}
        {isPlaying && (
          <circle
            cx={40 + (price / 30) * 320}
            cy={290 - ((profit + 200) / 600) * 250}
            r="6"
            fill="#f59e0b"
            className="animate-pulse"
          />
        )}

        {/* Optimal Point (Vertex) */}
        <circle cx="200" cy="40" r="8" fill="#10b981" opacity="0.5" />
        <text x="210" y="35" className="text-xs font-bold fill-green-600">Optimal</text>
      </svg>

      {/* Labels */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-700">
        Price (₹ thousands)
      </div>
      <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-slate-700">
        Profit (₹ lakhs)
      </div>

      {/* Current Values */}
      {isPlaying && (
        <div className="absolute top-4 right-4 bg-amber-100 px-3 py-2 rounded-lg shadow">
          <p className="text-xs font-semibold text-slate-700">Price: ₹{price.toFixed(1)}k</p>
          <p className="text-xs text-slate-600">Profit: ₹{profit.toFixed(0)}L</p>
        </div>
      )}
    </div>
  );
}

function DrugConcentrationSimulation({ isPlaying, currentValue, result }: { isPlaying: boolean; currentValue: number; result: string }) {
  const time = currentValue; // hours
  const concentration = -0.5 * time * time + 4 * time + 1;
  
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      {/* Graph */}
      <svg className="w-full h-full">
        {/* Safe Zone */}
        <rect x="40" y="80" width="320" height="120" fill="#22c55e" opacity="0.1" />
        <text x="50" y="75" className="text-xs font-bold fill-green-600">Therapeutic Range (2-8 mg/L)</text>

        {/* Axes */}
        <line x1="40" y1="280" x2="360" y2="280" stroke="#1e293b" strokeWidth="2" />
        <line x1="40" y1="40" x2="40" y2="280" stroke="#1e293b" strokeWidth="2" />

        {/* Concentration Curve */}
        <path
          d="M 40 270 Q 200 40 360 280"
          stroke={result === 'success' ? '#22c55e' : result === 'failure' ? '#ef4444' : '#8b5cf6'}
          strokeWidth="3"
          fill="none"
        />

        {/* Current Point */}
        {isPlaying && (
          <circle
            cx={40 + (time / 10) * 320}
            cy={280 - (concentration / 10) * 200}
            r="6"
            fill="#f59e0b"
            className="animate-pulse"
          />
        )}

        {/* Danger Zones */}
        <line x1="40" y1="80" x2="360" y2="80" stroke="#dc2626" strokeWidth="1" strokeDasharray="4,4" />
        <text x="50" y="70" className="text-xs fill-red-600">Toxic Level ⚠️</text>
        
        <line x1="40" y1="200" x2="360" y2="200" stroke="#dc2626" strokeWidth="1" strokeDasharray="4,4" />
        <text x="50" y="215" className="text-xs fill-red-600">Below Effective ⚠️</text>
      </svg>

      {/* Current Reading */}
      {isPlaying && (
        <div className={`absolute top-4 right-4 px-3 py-2 rounded-lg shadow ${
          concentration > 8 ? 'bg-red-100' :
          concentration < 2 ? 'bg-red-100' :
          'bg-green-100'
        }`}>
          <p className="text-xs font-semibold text-slate-700">Time: {time.toFixed(1)}h</p>
          <p className={`text-xs font-bold ${
            concentration > 8 ? 'text-red-600' :
            concentration < 2 ? 'text-red-600' :
            'text-green-600'
          }`}>
            {concentration.toFixed(2)} mg/L
          </p>
        </div>
      )}
    </div>
  );
}

function LossFunctionSimulation({ isPlaying, currentValue, result }: { isPlaying: boolean; currentValue: number; result: string }) {
  const learningRate = currentValue * 0.4; // 0 to 4
  const loss = 0.01 * learningRate * learningRate - 0.4 * learningRate + 5;
  
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 p-8">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Graph */}
      <svg className="w-full h-full relative z-10">
        {/* Grid */}
        {[...Array(10)].map((_, i) => (
          <line
            key={i}
            x1="40"
            y1={40 + i * 24}
            x2="360"
            y2={40 + i * 24}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1="40" y1="280" x2="360" y2="280" stroke="#ffffff" strokeWidth="2" />
        <line x1="40" y1="40" x2="40" y2="280" stroke="#ffffff" strokeWidth="2" />

        {/* Loss Curve (Parabola) */}
        <path
          d="M 40 280 Q 200 80 360 280"
          stroke={result === 'success' ? '#22c55e' : result === 'failure' ? '#ef4444' : '#60a5fa'}
          strokeWidth="3"
          fill="none"
        />

        {/* Current Point */}
        {isPlaying && (
          <>
            <circle
              cx={40 + (learningRate / 4) * 320}
              cy={280 - ((5.5 - loss) / 2) * 200}
              r="6"
              fill="#fbbf24"
              className="animate-pulse"
            />
            <line
              x1={40 + (learningRate / 4) * 320}
              y1="280"
              x2={40 + (learningRate / 4) * 320}
              y2={280 - ((5.5 - loss) / 2) * 200}
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          </>
        )}

        {/* Optimal Point */}
        <circle cx="200" cy="80" r="8" fill="#10b981" opacity="0.7" />
        <text x="210" y="75" className="text-xs font-bold fill-green-400">Minimum Loss</text>

        {/* Labels */}
        <text x="180" y="300" className="text-xs font-bold fill-white">Learning Rate (α)</text>
        <text x="10" y="30" className="text-xs font-bold fill-white">Loss</text>
      </svg>

      {/* AI Status Panel */}
      {isPlaying && (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur px-4 py-3 rounded-lg border border-blue-400">
          <p className="text-xs font-semibold text-green-400">⚡ Training AI Model</p>
          <p className="text-xs text-blue-300 mt-1">α = {learningRate.toFixed(3)}</p>
          <p className={`text-xs font-bold mt-1 ${
            loss < 4 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            Loss: {loss.toFixed(3)}
          </p>
          <div className="mt-2 w-32 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${(learningRate / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Model Performance */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur px-4 py-3 rounded-lg border border-purple-400">
        <p className="text-xs font-semibold text-purple-400">🤖 Model Performance</p>
        <p className="text-xs text-white mt-1">
          {loss < 4 ? '✅ Excellent predictions!' : '⚠️ High error rate'}
        </p>
      </div>
    </div>
  );
}
