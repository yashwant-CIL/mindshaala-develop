import React, { useState } from 'react';
import {
  Zap,
  Atom,
  Flame,
  Activity,
  Compass,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Sliders,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';

interface PhysicsPhenomenonProps {
  onNavigate?: (page: string) => void;
}

export const PhysicsPhenomenon: React.FC<PhysicsPhenomenonProps> = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhenomenonId, setSelectedPhenomenonId] = useState<string>('quantum-entanglement');
  
  // Interactive Simulation States
  // 1. Refraction Simulation
  const [incidentAngle, setIncidentAngle] = useState<number>(30);
  const [n1, setN1] = useState<number>(1.0); // Air
  const [n2, setN2] = useState<number>(1.5); // Glass

  // 2. Doppler Shift Simulation
  const [sourceSpeed, setSourceSpeed] = useState<number>(50); // m/s
  const [baseFreq, setBaseFreq] = useState<number>(440); // Hz

  // Quiz state
  const [selectedQuizAns, setSelectedQuizAns] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  // Refraction calculations
  const sinR = (n1 * Math.sin((incidentAngle * Math.PI) / 180)) / n2;
  const refractionAngle = sinR <= 1 ? Math.round((Math.asin(sinR) * 180) / Math.PI * 10) / 10 : 'Total Internal Reflection';
  
  // Doppler calculations (approaching source v_sound = 343 m/s)
  const vSound = 343;
  const freqApproaching = Math.round(baseFreq * (vSound / (vSound - sourceSpeed)));
  const freqReceding = Math.round(baseFreq * (vSound / (vSound + sourceSpeed)));

  const phenomena = [
    {
      id: 'quantum-entanglement',
      title: 'Quantum Entanglement',
      category: 'Quantum Physics',
      difficulty: 'Advanced',
      tag: 'Spooky Action',
      icon: Atom,
      gradient: 'from-purple-600 to-indigo-600',
      description: 'When two or more particles become interconnected such that one particle’s quantum state instantly influences another, regardless of distance.',
      keyFormula: 'Ψ = 1/√2 (|00⟩ + |11⟩)',
      realWorld: 'Quantum Cryptography, Quantum Computing, Superdense Coding.',
      explanation: 'Einstein famously called this "spooky action at a distance". Measuring the spin of particle A immediately determines the spin of particle B in the opposite or correlated direction without light-speed delay.',
      funFact: 'In 2022, Nobel Prize in Physics was awarded to Aspect, Clauser, and Zeilinger for proving Quantum Entanglement with Bell inequality tests!'
    },
    {
      id: 'refraction-optics',
      title: 'Refraction & Total Internal Reflection',
      category: 'Optics',
      difficulty: 'Intermediate',
      tag: 'Light Bending',
      icon: Eye,
      gradient: 'from-blue-600 to-cyan-600',
      description: 'The bending of light as it passes from one medium to another due to change in light velocity, governed by Snell’s Law.',
      keyFormula: 'n₁ sin(θ₁) = n₂ sin(θ₂)',
      realWorld: 'Fiber Optic Internet Cables, Rainbows, Lenses, Camera Optics.',
      explanation: 'When light travels from an optically denser medium to a rarer medium beyond the critical angle, 100% of light is reflected back inside. This principle powers global high-speed fiber internet.',
      funFact: 'Diamonds sparkle so intensely because they have an extraordinarily high refractive index (n = 2.42) and a tiny critical angle of just 24.4°!'
    },
    {
      id: 'doppler-effect',
      title: 'Doppler Shift in Waves',
      category: 'Waves & Sound',
      difficulty: 'Beginner',
      tag: 'Pitch Shift',
      icon: Activity,
      gradient: 'from-amber-500 to-rose-500',
      description: 'The apparent change in frequency of a wave caused by relative motion between the wave source and the observer.',
      keyFormula: 'f\' = f (v ± vₒ) / (v ∓ vₛ)',
      realWorld: 'Police Radar Guns, Echocardiograms, Measuring Expanding Universe (Redshift).',
      explanation: 'As a siren speeds toward you, sound waves get compressed into shorter wavelengths (higher pitch). As it moves away, waves stretch out (lower pitch).',
      funFact: 'Astronomers used the Doppler Redshift of distant galaxies to prove that the Universe is expanding!'
    },
    {
      id: 'bernoulli-principle',
      title: 'Bernoulli’s Principle & Fluid Dynamics',
      category: 'Fluid Mechanics',
      difficulty: 'Intermediate',
      tag: 'Aerodynamics',
      icon: Flame,
      gradient: 'from-emerald-600 to-teal-600',
      description: 'An increase in the speed of a fluid occurs simultaneously with a decrease in static pressure or fluid potential energy.',
      keyFormula: 'P + ½ρv² + ρgh = Constant',
      realWorld: 'Airplane Wing Lift (Airfoils), Carburetors, Perfume Atomizers.',
      explanation: 'Air travels faster over the curved top surface of an aircraft wing, creating a low-pressure zone above the wing. Higher pressure beneath pushes the plane upward, generating aerodynamic lift.',
      funFact: 'Curveballs in baseball work because of the Magnus Effect—a spinning ball creates Bernoulli pressure differences in the surrounding air!'
    },
    {
      id: 'superconductivity',
      title: 'Superconductivity & Meissner Effect',
      category: 'Condensed Matter',
      difficulty: 'Advanced',
      tag: 'Zero Resistance',
      icon: Zap,
      gradient: 'from-sky-500 to-indigo-600',
      description: 'The property of zero electrical resistance and expulsion of magnetic flux fields occurring in certain materials below a critical temperature.',
      keyFormula: 'B = 0 (Inside Superconductor)',
      realWorld: 'Maglev Bullet Trains, MRI Scanners, Particle Accelerators (CERN).',
      explanation: 'Superconductors expel magnetic field lines (Meissner Effect), causing magnetic levitation where a magnet floats stably above a superconductor frozen in liquid nitrogen.',
      funFact: 'Maglev trains in Japan use superconducting magnets to float 10 cm above tracks, reaching record speeds over 603 km/h (375 mph)!'
    }
  ];

  const filteredPhenomena = activeCategory === 'all'
    ? phenomena
    : phenomena.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const selectedPhenomenon = phenomena.find(p => p.id === selectedPhenomenonId) || phenomena[0];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 md:p-10 text-white shadow-xl overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Activity Hub &bull; Physics Lab
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Physics <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300">Phenomenon</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Explore the universe's most captivating physical phenomena through interactive visual simulations, mathematical models, and real-world engineering applications.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shrink-0">
            <div className="p-3 bg-purple-600/30 rounded-xl border border-purple-400/40">
              <Sparkles className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Interactive Modules</div>
              <div className="text-2xl font-black text-white">5 Explorer Labs</div>
              <div className="text-[11px] text-purple-300 font-medium">Real-time Simulation Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'All Phenomena' },
          { id: 'quantum', label: 'Quantum Physics' },
          { id: 'optics', label: 'Optics & Light' },
          { id: 'waves', label: 'Waves & Sound' },
          { id: 'fluid', label: 'Fluid Dynamics' },
          { id: 'condensed', label: 'Condensed Matter' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-md shadow-slate-950/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left List + Right Interactive Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Phenomenon Selector Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" /> Choose Phenomenon
          </h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredPhenomena.map(item => {
              const Icon = item.icon;
              const isSelected = item.id === selectedPhenomenonId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhenomenonId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-purple-500 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl text-white bg-gradient-to-r ${item.gradient}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">{item.category}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed View & Interactive Simulator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* Top Title & Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-purple-600 uppercase tracking-widest">
                  {selectedPhenomenon.category}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedPhenomenon.title}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                Difficulty: {selectedPhenomenon.difficulty}
              </span>
            </div>

            {/* Explanation & Formula */}
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {selectedPhenomenon.explanation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 font-mono">
                  <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Governing Formula</span>
                  <div className="text-lg font-bold text-emerald-400">{selectedPhenomenon.keyFormula}</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-purple-700 uppercase tracking-wider font-bold">Real-World Tech</span>
                  <div className="text-xs font-semibold text-purple-950">{selectedPhenomenon.realWorld}</div>
                </div>
              </div>
            </div>

            {/* Interactive Simulation Sandbox */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Interactive Simulator: {selectedPhenomenon.id === 'refraction-optics' ? "Snell's Law Refraction" : selectedPhenomenon.id === 'doppler-effect' ? "Doppler Frequency Shift" : "Parameter Sandbox"}
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-mono">
                  LIVE MODEL
                </span>
              </div>

              {selectedPhenomenon.id === 'refraction-optics' ? (
                /* Snell's Law Interactive Calculator & Visualizer */
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Incident Angle (θ₁): {incidentAngle}°</label>
                      <input
                        type="range"
                        min="0"
                        max="89"
                        value={incidentAngle}
                        onChange={(e) => setIncidentAngle(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Medium 1 Refractive Index (n₁): {n1}</label>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.1"
                        value={n1}
                        onChange={(e) => setN1(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Medium 2 Refractive Index (n₂): {n2}</label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={n2}
                        onChange={(e) => setN2(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Refracted Angle (θ₂):</span>
                      <div className="text-2xl font-black text-cyan-400">
                        {typeof refractionAngle === 'number' ? `${refractionAngle}°` : refractionAngle}
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <div>n₁ sin(θ₁) = {(n1 * Math.sin((incidentAngle * Math.PI) / 180)).toFixed(3)}</div>
                      <div>n₂ sin(θ₂) = {(n2 * (typeof refractionAngle === 'number' ? Math.sin((refractionAngle * Math.PI) / 180) : 1)).toFixed(3)}</div>
                    </div>
                  </div>
                </div>
              ) : selectedPhenomenon.id === 'doppler-effect' ? (
                /* Doppler Effect Interactive Simulator */
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Source Velocity (vₛ): {sourceSpeed} m/s ({Math.round(sourceSpeed * 3.6)} km/h)</label>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={sourceSpeed}
                        onChange={(e) => setSourceSpeed(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Base Frequency (f): {baseFreq} Hz</label>
                      <input
                        type="range"
                        min="200"
                        max="1000"
                        step="10"
                        value={baseFreq}
                        onChange={(e) => setBaseFreq(Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-center">
                      <span className="text-[11px] text-emerald-400 uppercase font-bold">Approaching Observer</span>
                      <div className="text-2xl font-black text-emerald-300">{freqApproaching} Hz</div>
                      <span className="text-[10px] text-slate-400">Higher Pitch (Compressed)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-center">
                      <span className="text-[11px] text-rose-400 uppercase font-bold">Receding Observer</span>
                      <div className="text-2xl font-black text-rose-300">{freqReceding} Hz</div>
                      <span className="text-[10px] text-slate-400">Lower Pitch (Stretched)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic Quantum / Phenomenon Visualizer */
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <Atom className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-slate-200">Quantum State Correlation Matrix Active</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Entangled qubits maintain superposition. Collapsing Qubit A to state |1⟩ instantaneously collapses Qubit B to state |0⟩ across light years.
                  </p>
                </div>
              )}
            </div>

            {/* Fun Fact Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">MindShaala Physics Fact</span>
                <p className="text-xs font-medium leading-relaxed mt-0.5">{selectedPhenomenon.funFact}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PhysicsPhenomenon;
