import React, { useState } from 'react';
import {
  Calculator,
  Brain,
  Sparkles,
  BookOpen,
  Sliders,
  Info,
  CheckCircle2,
  HelpCircle,
  Activity,
  RotateCcw,
  Compass,
  Zap
} from 'lucide-react';

interface MathGeniusProps {
  onNavigate?: (page: string) => void;
}

export const MathGenius: React.FC<MathGeniusProps> = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('trig-unit-circle');

  // Unit Circle Interactive State
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const angleRad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(angleRad).toFixed(3);
  const sinVal = Math.sin(angleRad).toFixed(3);
  const tanVal = Math.abs(Math.cos(angleRad)) > 0.0001 ? Math.tan(angleRad).toFixed(3) : 'Undefined (∞)';

  // Calculus Integration Slider (f(x) = x^2 from 0 to upperLimit)
  const [upperLimit, setUpperLimit] = useState<number>(4);
  const areaIntegral = ((Math.pow(upperLimit, 3)) / 3).toFixed(2); // ∫ x^2 dx = x^3 / 3

  // Fibonacci Generator
  const [fibN, setFibN] = useState<number>(10);
  const getFibSequence = (n: number) => {
    const seq = [0, 1];
    for (let i = 2; i < n; i++) {
      seq.push(seq[i - 1] + seq[i - 2]);
    }
    return seq.slice(0, n);
  };
  const fibList = getFibSequence(fibN);

  const mathModules = [
    {
      id: 'trig-unit-circle',
      title: 'Unit Circle & Trigonometry',
      category: 'Geometry & Analysis',
      difficulty: 'Beginner',
      tag: 'Visual Trig',
      icon: Compass,
      gradient: 'from-blue-600 to-indigo-600',
      description: 'The unit circle of radius 1 provides the foundation for sine, cosine, tangent, and wave harmonic functions.',
      equation: 'cos²(θ) + sin²(θ) = 1',
      realWorld: 'GPS Navigation, Audio Signal Processing, Wave Motion, Computer Graphics Shaders.',
      explanation: 'For any point on the unit circle at angle θ, the x-coordinate is cos(θ) and the y-coordinate is sin(θ). As θ turns from 0° to 360°, sine generates a continuous smooth wave.',
      funFact: 'Sine functions are used in video game engines to simulate ocean waves, pendulum swings, and character walking animations!'
    },
    {
      id: 'calculus-integrals',
      title: 'Calculus: Area Under Curves',
      category: 'Calculus',
      difficulty: 'Intermediate',
      tag: 'Integrals',
      icon: Activity,
      gradient: 'from-violet-600 to-purple-700',
      description: 'Definite integrals calculate the exact accumulated area under a mathematical function curve.',
      equation: '∫₀ᵃ x² dx = a³ / 3',
      realWorld: 'Rocket Trajectory Analysis, Machine Learning Loss Functions, Structural Stress Modeling.',
      explanation: 'Integration sums infinite infinitely-thin rectangular strips under a curve f(x). The Fundamental Theorem of Calculus links derivatives and integrals as inverse operations.',
      funFact: 'Isaac Newton and Gottfried Wilhelm Leibniz independently developed calculus in the 1670s, leading to a famous 40-year historical controversy over who invented it first!'
    },
    {
      id: 'fibonacci-golden-ratio',
      title: 'Fibonacci Sequence & Golden Ratio',
      category: 'Number Theory',
      difficulty: 'Beginner',
      tag: 'Nature Geometry',
      icon: Brain,
      gradient: 'from-amber-500 to-rose-600',
      description: 'A sequence where each term is the sum of the two preceding terms, converging to the Golden Ratio (Φ ≈ 1.61803).',
      equation: 'Fₙ = Fₙ₋₁ + Fₙ₋₂ | lim(Fₙ₊₁/Fₙ) = Φ = 1.618',
      realWorld: 'Sunflower Seed Spirals, Pinecones, Financial Fibonacci Retracements, UI Design Ratios.',
      explanation: 'As Fibonacci numbers increase, the ratio of successive terms Fₙ₊₁/Fₙ approaches the Golden Ratio Φ = (1 + √5)/2. Nature uses this ratio to pack seeds and leaves without waste.',
      funFact: 'Nautilus shells and spiral galaxies mimic Golden Spirals constructed using logarithmic Fibonacci quarter-circle arcs!'
    },
    {
      id: 'bayes-probability',
      title: 'Bayesian Probability & Inference',
      category: 'Probability & Stats',
      difficulty: 'Advanced',
      tag: 'AI Probability',
      icon: Calculator,
      gradient: 'from-emerald-600 to-teal-700',
      description: 'How to update the probability of a hypothesis as more evidence or information becomes available.',
      equation: 'P(A|B) = [P(B|A) · P(A)] / P(B)',
      realWorld: 'Spam Email Filters, Medical Diagnostic Testing, Self-Driving Car Sensor Fusion.',
      explanation: 'Bayes’ Theorem calculates the posterior probability P(A|B) given prior probability P(A) and likelihood P(B|A). It is the backbone of modern Machine Learning probabilistic classifiers.',
      funFact: 'Spam filters use Naive Bayes classifiers to calculate the mathematical probability that an email containing words like "FREE" or "WINNER" is spam!'
    }
  ];

  const selectedModule = mathModules.find(m => m.id === selectedModuleId) || mathModules[0];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 rounded-3xl p-6 md:p-10 text-white shadow-xl overflow-hidden border border-purple-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5 text-purple-400" /> Activity Hub &bull; Math Arena
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Math <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300">Genius</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Explore visual geometry, calculus integration, trigonometric unit circles, and the Fibonacci Golden Ratio with real-time dynamic calculators.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shrink-0">
            <div className="p-3 bg-purple-600/30 rounded-xl border border-purple-400/40">
              <Brain className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Visual Math Lab</div>
              <div className="text-2xl font-black text-white">4 Genius Solvers</div>
              <div className="text-[11px] text-purple-300 font-medium">Interactive Graphing Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Module List + Interactive Math Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Module List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" /> Math Domains
          </h2>
          
          <div className="space-y-3">
            {mathModules.map(module => {
              const Icon = module.icon;
              const isSelected = module.id === selectedModuleId;
              return (
                <div
                  key={module.id}
                  onClick={() => setSelectedModuleId(module.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-purple-500 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl text-white bg-gradient-to-r ${module.gradient}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{module.title}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">{module.category}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {module.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed View & Interactive Calculator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-purple-600 uppercase tracking-widest">
                  {selectedModule.category}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedModule.title}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                {selectedModule.difficulty}
              </span>
            </div>

            {/* Explanation & Equation */}
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedModule.explanation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 font-mono">
                  <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Key Theorem / Identity</span>
                  <div className="text-lg font-bold text-amber-400">{selectedModule.equation}</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-purple-700 uppercase tracking-wider font-bold">Real World Applications</span>
                  <div className="text-xs font-semibold text-purple-950">{selectedModule.realWorld}</div>
                </div>
              </div>
            </div>

            {/* Interactive Math Sandbox */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Interactive Math Solver: {selectedModule.title}
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-mono">
                  MATH ENGINE
                </span>
              </div>

              {selectedModule.id === 'trig-unit-circle' ? (
                /* Trigonometric Unit Circle Simulator */
                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">Angle θ: {angleDeg}° ({angleRad.toFixed(2)} rad)</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={angleDeg}
                      onChange={(e) => setAngleDeg(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-purple-400 uppercase font-bold block">x = cos(θ)</span>
                      <div className="text-xl font-black text-amber-400 font-mono mt-1">{cosVal}</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-purple-400 uppercase font-bold block">y = sin(θ)</span>
                      <div className="text-xl font-black text-emerald-400 font-mono mt-1">{sinVal}</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-purple-400 uppercase font-bold block">tan(θ) = y/x</span>
                      <div className="text-xl font-black text-cyan-400 font-mono mt-1">{tanVal}</div>
                    </div>
                  </div>
                </div>
              ) : selectedModule.id === 'calculus-integrals' ? (
                /* Calculus Integration Simulator */
                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">Upper Bound (a): {upperLimit}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={upperLimit}
                      onChange={(e) => setUpperLimit(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">Definite Integral: ∫₀^{upperLimit} x² dx</span>
                    <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{areaIntegral} sq units</div>
                    <span className="text-[10px] text-slate-500">Calculated as [{upperLimit}³ / 3] = {areaIntegral}</span>
                  </div>
                </div>
              ) : selectedModule.id === 'fibonacci-golden-ratio' ? (
                /* Fibonacci Generator */
                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">Number of Terms (N): {fibN}</label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={fibN}
                      onChange={(e) => setFibN(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="text-xs text-slate-400 block font-medium">Generated Fibonacci Sequence:</span>
                    <div className="flex flex-wrap gap-2 font-mono">
                      {fibList.map((num, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-purple-950 border border-purple-800 text-purple-300 text-xs">
                          {num}
                        </span>
                      ))}
                    </div>
                    {fibList.length >= 2 && (
                      <div className="text-xs text-emerald-400 font-mono pt-2 border-t border-slate-800">
                        Ratio F_{fibN} / F_{fibN-1} = {(fibList[fibList.length - 1] / fibList[fibList.length - 2]).toFixed(6)} (Golden Ratio Φ ≈ 1.618033)
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Bayes Theorem */
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <Calculator className="w-10 h-10 text-purple-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-200">Bayesian Posterior Solver Active</div>
                  <p className="text-xs text-slate-400">
                    P(A|B) = [P(B|A) × P(A)] / P(B)
                  </p>
                </div>
              )}
            </div>

            {/* Fun Fact Callout */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3 text-purple-900">
              <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block">Math Fact</span>
                <p className="text-xs font-medium leading-relaxed mt-0.5">{selectedModule.funFact}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MathGenius;
