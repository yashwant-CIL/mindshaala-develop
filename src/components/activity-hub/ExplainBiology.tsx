import React, { useState } from 'react';
import {
  Dna,
  Activity,
  Microscope,
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Zap,
  Info,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface ExplainBiologyProps {
  onNavigate?: (page: string) => void;
}

export const ExplainBiology: React.FC<ExplainBiologyProps> = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('crispr-gene-editing');

  // Interactive DNA Codon Translator State
  const [dnaInput, setDnaInput] = useState<string>('ATGGCATTT');
  
  // Interactive Punnett Square State
  const [parent1, setParent1] = useState<string>('Bb');
  const [parent2, setParent2] = useState<string>('Bb');

  // Codon Map Helper
  const translateDnaToCodons = (seq: string) => {
    const cleaned = seq.toUpperCase().replace(/[^ATGC]/g, '');
    const rna = cleaned.replace(/T/g, 'U');
    const codons: string[] = [];
    for (let i = 0; i < rna.length; i += 3) {
      if (i + 3 <= rna.length) {
        codons.push(rna.substring(i, i + 3));
      }
    }
    const aminoMap: Record<string, string> = {
      AUG: 'Methionine (Start)',
      GCA: 'Alanine',
      GCC: 'Alanine',
      GCG: 'Alanine',
      GCU: 'Alanine',
      UUU: 'Phenylalanine',
      UUC: 'Phenylalanine',
      UAA: 'STOP',
      UAG: 'STOP',
      UGA: 'STOP',
      CGA: 'Arginine',
      CGC: 'Arginine',
      CGG: 'Arginine',
      CGU: 'Arginine',
      AAA: 'Lysine',
      AAG: 'Lysine'
    };
    return {
      rna,
      translated: codons.map(c => ({ codon: c, amino: aminoMap[c] || 'Amino Acid' }))
    };
  };

  const codonResult = translateDnaToCodons(dnaInput);

  // Punnett Cross calculation
  const p1 = parent1.split('');
  const p2 = parent2.split('');
  const punnettGrid = p1.length === 2 && p2.length === 2 ? [
    [p1[0] + p2[0], p1[0] + p2[1]],
    [p1[1] + p2[0], p1[1] + p2[1]]
  ] : [];

  const bioTopics = [
    {
      id: 'crispr-gene-editing',
      title: 'CRISPR-Cas9 Gene Editing',
      category: 'Molecular Genetics',
      difficulty: 'Advanced',
      tag: 'Gene Scissors',
      icon: Dna,
      gradient: 'from-emerald-600 to-teal-600',
      description: 'A revolutionary bio-technology allowing scientists to precisely alter DNA sequences and modify gene function.',
      mechanism: 'Guide RNA (gRNA) directs the Cas9 endonuclease enzyme to a specific 20-base pair target sequence in the genome. Cas9 makes a double-strand break (DSB), triggering cell repair mechanisms to insert or knock out genes.',
      realWorld: 'Curing Sickle Cell Disease, Targeted Cancer Immunotherapies, Pest-Resistant Crops.',
      funFact: 'CRISPR originally evolved in bacteria as an adaptive immune system to destroy invading viral DNA!'
    },
    {
      id: 'photosynthesis',
      title: 'Photosynthesis & Carbon Fixation',
      category: 'Cellular Energetics',
      difficulty: 'Intermediate',
      tag: 'Solar Energy',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-700',
      description: 'The biochemical process by which green plants convert light energy into chemical energy stored in glucose.',
      mechanism: 'Light-dependent reactions in thylakoids split H₂O releasing O₂ and generating ATP/NADPH. The Calvin Cycle in stroma uses ATP/NADPH to fix CO₂ into 3-carbon sugars.',
      realWorld: 'Global Atmospheric Oxygen Production, Biofuel Synthetic Photosynthesis, Agriculture Yields.',
      funFact: 'Every single oxygen atom we breathe was once part of a water molecule split by plant chloroplasts during light reactions!'
    },
    {
      id: 'synaptic-transmission',
      title: 'Neural Action Potential & Synapses',
      category: 'Neurobiology',
      difficulty: 'Advanced',
      tag: 'Brain Signals',
      icon: Zap,
      gradient: 'from-violet-600 to-purple-700',
      description: 'Electrical and chemical signal propagation across neurons via Na+/K+ voltage-gated ion channels and neurotransmitter release.',
      mechanism: 'Depolarization opens voltage-gated Na+ channels causing a spike (+30mV). At the axon terminal, Ca2+ influx triggers exocytosis of neurotransmitters (e.g. Dopamine, Acetylcholine) across the 20nm synaptic cleft.',
      realWorld: 'Neurological Medicines, Artificial Neural Network Design, Brain-Computer Interfaces.',
      funFact: 'An electrical action potential travels along myelinated nerve fibers at speeds up to 120 meters per second (270 mph)!'
    },
    {
      id: 'mendelian-genetics',
      title: 'Mendelian & Non-Mendelian Inheritance',
      category: 'Genetics',
      difficulty: 'Beginner',
      tag: 'Heredity',
      icon: Microscope,
      gradient: 'from-blue-600 to-indigo-600',
      description: 'The transmission of genetic traits from parents to offspring governed by dominant and recessive allele combinations.',
      mechanism: 'The Law of Segregation states that allele pairs separate during gamete formation. Punnett squares predict monohybrid ratios (3:1 phenotypic, 1:2:1 genotypic).',
      realWorld: 'Predicting Genetic Inheritance, Agriculture Selective Breeding, Ancestry DNA Analysis.',
      funFact: 'Gregor Mendel discovered genetics by meticulously cross-breeding over 29,000 pea plants in his monastery garden!'
    }
  ];

  const selectedTopic = bioTopics.find(t => t.id === selectedTopicId) || bioTopics[0];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl overflow-hidden border border-emerald-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Dna className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> Activity Hub &bull; Biology Lab
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Explain <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Biology</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Deconstruct complex biological mechanisms, molecular genetics, cellular respiration, and DNA translation with interactive visual tools.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shrink-0">
            <div className="p-3 bg-emerald-600/30 rounded-xl border border-emerald-400/40">
              <Microscope className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Molecular Models</div>
              <div className="text-2xl font-black text-white">DNA & Gene Workbench</div>
              <div className="text-[11px] text-emerald-300 font-medium">Interactive Translation Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Topic List + Interactive Bio Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Topic Selector */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Biological Topics
          </h2>
          
          <div className="space-y-3">
            {bioTopics.map(topic => {
              const Icon = topic.icon;
              const isSelected = topic.id === selectedTopicId;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl text-white bg-gradient-to-r ${topic.gradient}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{topic.title}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">{topic.category}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {topic.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Bio Lab & Simulator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">
                  {selectedTopic.category}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedTopic.title}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                {selectedTopic.difficulty}
              </span>
            </div>

            {/* Detailed Explanation */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Molecular Mechanism
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {selectedTopic.mechanism}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Medical & Biotech Impact</span>
                <div className="text-xs font-semibold text-emerald-950">{selectedTopic.realWorld}</div>
              </div>
            </div>

            {/* Interactive Bio Widget */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  {selectedTopic.id === 'mendelian-genetics' ? 'Punnett Square Calculator' : 'DNA to Amino Acid Codon Translator'}
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono">
                  BIO-LAB SIMULATOR
                </span>
              </div>

              {selectedTopic.id === 'mendelian-genetics' ? (
                /* Punnett Square Interactive Calculator */
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Parent 1 Genotype</label>
                      <select
                        value={parent1}
                        onChange={(e) => setParent1(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                      >
                        <option value="BB">BB (Homozygous Dominant)</option>
                        <option value="Bb">Bb (Heterozygous)</option>
                        <option value="bb">bb (Homozygous Recessive)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Parent 2 Genotype</label>
                      <select
                        value={parent2}
                        onChange={(e) => setParent2(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                      >
                        <option value="BB">BB (Homozygous Dominant)</option>
                        <option value="Bb">Bb (Heterozygous)</option>
                        <option value="bb">bb (Homozygous Recessive)</option>
                      </select>
                    </div>
                  </div>

                  {punnettGrid.length === 2 && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center">
                      <div className="grid grid-cols-2 gap-2 text-center font-mono">
                        {punnettGrid.map((row, rIdx) =>
                          row.map((cell, cIdx) => (
                            <div key={`${rIdx}-${cIdx}`} className="p-3 bg-slate-900 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold text-sm">
                              {cell}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* DNA Codon Translator */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">
                      Enter DNA Strand (A, T, G, C):
                    </label>
                    <input
                      type="text"
                      value={dnaInput}
                      onChange={(e) => setDnaInput(e.target.value)}
                      placeholder="e.g. ATGGCATTT"
                      className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-sm rounded-xl p-3 uppercase tracking-widest focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>mRNA Codons: <strong className="text-teal-300 font-mono">{codonResult.rna}</strong></span>
                      <span>Amino Acid Chain</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {codonResult.translated.length > 0 ? (
                        codonResult.translated.map((item, idx) => (
                          <div key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-xs font-mono">
                            <span className="text-[10px] text-slate-400 block">{item.codon}</span>
                            <strong>{item.amino}</strong>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Enter valid 3-base triplets (e.g., ATG GCA TTT)</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fun Fact Callout */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-900">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">Biology Fact</span>
                <p className="text-xs font-medium leading-relaxed mt-0.5">{selectedTopic.funFact}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ExplainBiology;
