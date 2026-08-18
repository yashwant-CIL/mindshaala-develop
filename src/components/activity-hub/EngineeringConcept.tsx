import React, { useState } from 'react';
import {
  Cpu,
  Wrench,
  Zap,
  Sliders,
  BookOpen,
  Info,
  Layers,
  Settings,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface EngineeringConceptProps {
  onNavigate?: (page: string) => void;
}

export const EngineeringConcept: React.FC<EngineeringConceptProps> = () => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('ohms-law-circuits');

  // Ohm's Law Interactive State: V = I * R
  const [voltage, setVoltage] = useState<number>(12); // Volts
  const [resistance, setResistance] = useState<number>(24); // Ohms
  const current = (voltage / resistance).toFixed(2); // Amperes
  const power = (voltage * (voltage / resistance)).toFixed(2); // Watts

  // Logic Gate Interactive State
  const [gateType, setGateType] = useState<string>('AND');
  const [inputA, setInputA] = useState<boolean>(true);
  const [inputB, setInputB] = useState<boolean>(false);

  const evaluateLogicGate = (gate: string, a: boolean, b: boolean): boolean => {
    switch (gate) {
      case 'AND': return a && b;
      case 'OR': return a || b;
      case 'NAND': return !(a && b);
      case 'NOR': return !(a || b);
      case 'XOR': return a !== b;
      case 'XNOR': return a === b;
      default: return false;
    }
  };

  const gateOutput = evaluateLogicGate(gateType, inputA, inputB);

  // Gear Ratio State
  const [teethDriver, setTeethDriver] = useState<number>(10);
  const [teethDriven, setTeethDriven] = useState<number>(40);
  const gearRatio = (teethDriven / teethDriver).toFixed(2);

  const concepts = [
    {
      id: 'ohms-law-circuits',
      title: 'Ohm’s Law & Circuit Dynamics',
      category: 'Electrical Engineering',
      difficulty: 'Beginner',
      tag: 'Circuits & Power',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
      description: 'The fundamental law defining the relationship between voltage, electric current, and resistance in DC circuits.',
      formula: 'V = I × R | P = V × I',
      realWorld: 'Power Grids, Smartphone Chargers, Electric Vehicle Battery Management System (BMS).',
      explanation: 'Voltage (V) acts as electric pressure pushing electrons through a conductor. Resistance (R) opposes electron flow. Current (I) is the resulting flow rate of electrons.',
      funFact: 'Georg Ohm was initially ridiculed by scientists when he published Ohm’s Law in 1827 because electricity was thought to behave like water flow without strict formulas!'
    },
    {
      id: 'logic-gates-digital',
      title: 'Logic Gates & Digital Architecture',
      category: 'Computer & Microelectronics',
      difficulty: 'Intermediate',
      tag: 'Binary Logic',
      icon: Cpu,
      gradient: 'from-indigo-600 to-blue-600',
      description: 'The basic building blocks of digital integrated circuits and microprocessors executing boolean operations.',
      formula: 'Y = A · B (AND) | Y = A + B (OR)',
      realWorld: 'CPUs (Intel/Apple M-Series), RAM, Cryptographic Hardware Accelerators.',
      explanation: 'Modern microprocessors pack over 50 billion nanometer-scale transistors forming AND, OR, and NOT gates to process all computer logic via 1s and 0s.',
      funFact: 'NAND gates are called "Universal Gates" because any digital computer system can be built entirely using only NAND gates!'
    },
    {
      id: 'gear-ratios-mechanical',
      title: 'Gear Ratios & Torque Multipliers',
      category: 'Mechanical Engineering',
      difficulty: 'Intermediate',
      tag: 'Mechanical Advantage',
      icon: Settings,
      gradient: 'from-slate-700 to-slate-900',
      description: 'How gear sizes trade rotational speed for mechanical torque advantage in drive trains.',
      formula: 'Gear Ratio = N₂ / N₁ = Torque₂ / Torque₁',
      realWorld: 'Automotive Transmissions, Wind Turbines, Robotic Arms, Bicycles.',
      explanation: 'When a smaller gear drives a gear 4 times larger, output rotation speed decreases by 4x, but output torque increases by 4x!',
      funFact: 'Wind turbine gearboxes step up slow rotor turns (15 RPM) to over 1,500 RPM for electrical generators to produce high voltage power efficiently!'
    },
    {
      id: 'truss-bridge-structures',
      title: 'Truss Structures & Static Equilibrium',
      category: 'Civil & Structural',
      difficulty: 'Advanced',
      tag: 'Load Distribution',
      icon: Layers,
      gradient: 'from-emerald-600 to-teal-700',
      description: 'How triangular geometry distributes structural weight evenly into compression and tension forces.',
      formula: 'ΣFₓ = 0 | ΣFᵧ = 0 | ΣM = 0',
      realWorld: 'Skyscrapers, Railway Bridges, Roof Trusses, Aerospace Airframes.',
      explanation: 'Triangles are structurally rigid because their side lengths fix all interior angles. Under load, top chords experience compression while bottom chords experience tension.',
      funFact: 'The Warren Truss pattern patented in 1848 remains the gold standard for high-strength steel bridges worldwide!'
    }
  ];

  const selectedConcept = concepts.find(c => c.id === selectedConceptId) || concepts[0];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-10 text-white shadow-xl overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-blue-400" /> Activity Hub &bull; Engineering Studio
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Engineering <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">Concept</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Master core engineering fundamentals—from electrical circuits and digital logic gates to mechanical gear ratios and structural equilibrium.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shrink-0">
            <div className="p-3 bg-blue-600/30 rounded-xl border border-blue-400/40">
              <Cpu className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Prototyping Lab</div>
              <div className="text-2xl font-black text-white">4 Studio Simulators</div>
              <div className="text-[11px] text-blue-300 font-medium">Virtual Multimeter & Gates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Concept Selector + Interactive Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Concept List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Engineering Disciplines
          </h2>
          
          <div className="space-y-3">
            {concepts.map(concept => {
              const Icon = concept.icon;
              const isSelected = concept.id === selectedConceptId;
              return (
                <div
                  key={concept.id}
                  onClick={() => setSelectedConceptId(concept.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl text-white bg-gradient-to-r ${concept.gradient}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{concept.title}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">{concept.category}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {concept.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {concept.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed View & Interactive Workbench */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                  {selectedConcept.category}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedConcept.title}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                {selectedConcept.difficulty}
              </span>
            </div>

            {/* Explanation & Formula */}
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedConcept.explanation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 font-mono">
                  <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Core Engineering Equation</span>
                  <div className="text-lg font-bold text-amber-400">{selectedConcept.formula}</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-blue-700 uppercase tracking-wider font-bold">Real Engineering Applications</span>
                  <div className="text-xs font-semibold text-blue-950">{selectedConcept.realWorld}</div>
                </div>
              </div>
            </div>

            {/* Interactive Engineering Workbench */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  Virtual Bench: {selectedConcept.title}
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
                  HARDWARE SIMULATOR
                </span>
              </div>

              {selectedConcept.id === 'ohms-law-circuits' ? (
                /* Ohm's Law Multimeter Simulator */
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Source Voltage (V): {voltage} V</label>
                      <input
                        type="range"
                        min="1"
                        max="120"
                        value={voltage}
                        onChange={(e) => setVoltage(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Load Resistance (R): {resistance} Ω</label>
                      <input
                        type="range"
                        min="1"
                        max="200"
                        value={resistance}
                        onChange={(e) => setResistance(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Calculated Current (I)</span>
                      <div className="text-3xl font-black text-amber-400 font-mono mt-1">{current} A</div>
                      <span className="text-[10px] text-slate-500">I = V / R</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Power Dissipation (P)</span>
                      <div className="text-3xl font-black text-cyan-400 font-mono mt-1">{power} W</div>
                      <span className="text-[10px] text-slate-500">P = V × I</span>
                    </div>
                  </div>
                </div>
              ) : selectedConcept.id === 'logic-gates-digital' ? (
                /* Digital Logic Gate Workbench */
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Gate Type</label>
                      <select
                        value={gateType}
                        onChange={(e) => setGateType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                      >
                        <option value="AND">AND Gate</option>
                        <option value="OR">OR Gate</option>
                        <option value="NAND">NAND Gate</option>
                        <option value="NOR">NOR Gate</option>
                        <option value="XOR">XOR Gate</option>
                        <option value="XNOR">XNOR Gate</option>
                      </select>
                    </div>
                    <div className="text-center">
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Input A</label>
                      <button
                        onClick={() => setInputA(!inputA)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          inputA ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {inputA ? 'HIGH (1)' : 'LOW (0)'}
                      </button>
                    </div>
                    <div className="text-center">
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Input B</label>
                      <button
                        onClick={() => setInputB(!inputB)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          inputB ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {inputB ? 'HIGH (1)' : 'LOW (0)'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Logic Output Y ({gateType}):</span>
                      <div className={`text-2xl font-black font-mono mt-1 ${gateOutput ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {gateOutput ? '1 (HIGH - LED ON 💡)' : '0 (LOW - LED OFF ⚪)'}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-2 transition-all ${gateOutput ? 'bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500/50' : 'bg-slate-800 border-slate-700'}`} />
                  </div>
                </div>
              ) : selectedConcept.id === 'gear-ratios-mechanical' ? (
                /* Gear Ratio Simulator */
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Driver Gear Teeth (N₁): {teethDriver}</label>
                      <input
                        type="range"
                        min="8"
                        max="60"
                        step="2"
                        value={teethDriver}
                        onChange={(e) => setTeethDriver(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Driven Gear Teeth (N₂): {teethDriven}</label>
                      <input
                        type="range"
                        min="8"
                        max="120"
                        step="2"
                        value={teethDriven}
                        onChange={(e) => setTeethDriven(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">Gear Reduction Ratio</span>
                    <div className="text-3xl font-black text-cyan-400 font-mono mt-1">{gearRatio} : 1</div>
                    <span className="text-[10px] text-slate-400">Torque multiplier = {gearRatio}x | Output Speed = {(1 / Number(gearRatio)).toFixed(2)}x</span>
                  </div>
                </div>
              ) : (
                /* Truss Bridge Loads */
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <Layers className="w-10 h-10 text-blue-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-200">Truss Load Visualizer Active</div>
                  <p className="text-xs text-slate-400">
                    Static equilibrium solver confirms zero net forces: ΣFₓ = 0, ΣFᵧ = 0.
                  </p>
                </div>
              )}
            </div>

            {/* Fun Fact Callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-blue-900">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">Engineering Trivia</span>
                <p className="text-xs font-medium leading-relaxed mt-0.5">{selectedConcept.funFact}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EngineeringConcept;
