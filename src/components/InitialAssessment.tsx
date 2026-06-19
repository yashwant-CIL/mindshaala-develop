import { useState } from 'react';
import {
  Brain, BookOpen, Target, Heart, CheckCircle2, Clock,
  ChevronRight, Play, Lock, Award, Sparkles, TrendingUp,
  AlertCircle, Zap, Focus, Puzzle, Calculator, FileText,
  Eye, Edit, Search, Lightbulb, Trophy, Star, Flag
} from 'lucide-react';

interface InitialAssessmentProps {
  onBack: () => void;
}

type AssessmentStep = 'overview' | 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'results';
type LayerStatus = 'locked' | 'ready' | 'in-progress' | 'completed';

interface Layer {
  id: number;
  title: string;
  duration: string;
  description: string;
  icon: any;
  color: string;
  status: LayerStatus;
  weightage: number;
}

export function InitialAssessment({ onBack }: InitialAssessmentProps) {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('overview');
  const [completedLayers, setCompletedLayers] = useState<number[]>([]);

  const layers: Layer[] = [
    {
      id: 1,
      title: 'Cognitive Readiness',
      duration: '25 min',
      description: 'Working memory, processing speed, logical reasoning, attention span.',
      icon: Brain,
      color: 'blue',
      status: 'ready',
      weightage: 20
    },
    {
      id: 2,
      title: 'Academic Foundations',
      duration: '70-90 min',
      description: 'Prerequisites from Classes 6-9 in Math, Science, and English.',
      icon: BookOpen,
      color: 'purple',
      status: completedLayers.includes(1) ? 'ready' : 'locked',
      weightage: 40
    },
    {
      id: 3,
      title: 'Class 10 Readiness',
      duration: '30-40 min',
      description: 'Subject-specific checks for current syllabus entry points.',
      icon: Target,
      color: 'green',
      status: completedLayers.includes(2) ? 'ready' : 'locked',
      weightage: 25
    },
    {
      id: 4,
      title: 'Habits & Mindset',
      duration: '10-12 min',
      description: 'Study consistency, psychological readiness, and grit.',
      icon: Heart,
      color: 'pink',
      status: completedLayers.includes(3) ? 'ready' : 'locked',
      weightage: 15
    }
  ];

  const handleStartLayer = (layerId: number) => {
    setCurrentStep(`layer${layerId}` as AssessmentStep);
  };

  const handleCompleteLayer = (layerId: number) => {
    setCompletedLayers([...completedLayers, layerId]);
    if (layerId === 4) {
      setCurrentStep('results');
    } else {
      setCurrentStep('overview');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 'overview' && (
        <AssessmentOverview
          layers={layers}
          onBack={onBack}
          onStartLayer={handleStartLayer}
          completedLayers={completedLayers}
        />
      )}
      
      {currentStep === 'layer1' && (
        <Layer1CognitiveReadiness
          onComplete={() => handleCompleteLayer(1)}
          onBack={() => setCurrentStep('overview')}
        />
      )}
      
      {currentStep === 'layer2' && (
        <Layer2AcademicFoundations
          onComplete={() => handleCompleteLayer(2)}
          onBack={() => setCurrentStep('overview')}
        />
      )}
      
      {currentStep === 'layer3' && (
        <Layer3Class10Readiness
          onComplete={() => handleCompleteLayer(3)}
          onBack={() => setCurrentStep('overview')}
        />
      )}
      
      {currentStep === 'layer4' && (
        <Layer4HabitsMindset
          onComplete={() => handleCompleteLayer(4)}
          onBack={() => setCurrentStep('overview')}
        />
      )}
      
      {currentStep === 'results' && (
        <AssessmentResults onBack={onBack} />
      )}
    </div>
  );
}

// Assessment Overview Component
function AssessmentOverview({
  layers,
  onBack,
  onStartLayer,
  completedLayers
}: {
  layers: Layer[];
  onBack: () => void;
  onStartLayer: (layerId: number) => void;
  completedLayers: number[];
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assessment Overview & Classification</h1>
            <p className="text-blue-100">A comprehensive diagnostic ecosystem designed for ICSE Class 10</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">App-Based Delivery</span>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">Timed & Adaptive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
          {/* Core Purpose */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Core Purpose</h3>
            </div>
            <p className="text-blue-100 mb-6">
              To accurately measure the student's mental stamina and foundational knowledge gaps from Classes 6-9 that will impact their Class 10 performance.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span className="text-sm">Measure Cognitive Strength</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span className="text-sm">Detect Conceptual Blocks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span className="text-sm">Assess Learning Habits</span>
              </div>
            </div>
          </div>

          {/* The 4-Layer Diagnostic Structure */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">The 4-Layer Diagnostic Structure</h3>
            <div className="space-y-4">
              {layers.map((layer) => {
                const Icon = layer.icon;
                const isCompleted = completedLayers.includes(layer.id);
                const isLocked = layer.status === 'locked';
                
                return (
                  <div
                    key={layer.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCompleted
                        ? 'bg-green-50 border-green-500'
                        : isLocked
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          layer.color === 'blue' ? 'bg-blue-100' :
                          layer.color === 'purple' ? 'bg-purple-100' :
                          layer.color === 'green' ? 'bg-green-100' :
                          'bg-pink-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            layer.color === 'blue' ? 'text-blue-600' :
                            layer.color === 'purple' ? 'text-purple-600' :
                            layer.color === 'green' ? 'text-green-600' :
                            'text-pink-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">Layer {layer.id}: {layer.title}</h4>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{layer.description}</p>
                          {!isLocked && !isCompleted && (
                            <button
                              onClick={() => onStartLayer(layer.id)}
                              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                                layer.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                layer.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                                layer.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                'bg-pink-600 hover:bg-pink-700'
                              } text-white`}
                            >
                              <Play className="w-4 h-4" />
                              Start Assessment
                            </button>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        layer.color === 'blue' ? 'text-blue-600' :
                        layer.color === 'purple' ? 'text-purple-600' :
                        layer.color === 'green' ? 'text-green-600' :
                        'text-pink-600'
                      }`}>
                        {layer.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Classification */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Classification</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-900 mb-1">Topper-Ready</h4>
                  <p className="text-sm text-green-700">High cognitive ability + solid foundations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">B</span>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">Strong but Inconsistent</h4>
                  <p className="text-sm text-blue-700">Good potential, needs discipline/focus.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <h4 className="font-bold text-yellow-900 mb-1">Average with Gaps</h4>
                  <p className="text-sm text-yellow-700">Specific conceptual holes to fill.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">D</span>
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 mb-1">Weak Fundamentals</h4>
                  <p className="text-sm text-orange-700">Needs systematic rebuilding.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">E</span>
                </div>
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Critical Deficit</h4>
                  <p className="text-sm text-red-700">Intensive intervention required.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Mode */}
          <div className="col-span-3 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Delivery Mode</h3>
              </div>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-all"
              >
                ← Back to Dashboard
              </button>
            </div>
            <p className="text-blue-100 mb-4">Device-agnostic platform supporting low-bandwidth environments.</p>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                  </svg>
                </div>
                <div className="font-bold">Tablet</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <div className="font-bold">Laptop</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                  </svg>
                </div>
                <div className="font-bold">Mobile</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Layer 1: Cognitive Readiness
function Layer1CognitiveReadiness({
  onComplete,
  onBack
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">LAYER 1</span>
              <h1 className="text-2xl font-bold text-gray-900">Cognitive Ability & Learning Readiness</h1>
            </div>
            <p className="text-sm text-gray-600">Non-academic assessment to measure brain processing, stamina, and reasoning potential.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">DURATION</div>
              <div className="text-2xl font-bold text-blue-600">25 Mins</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">TOTAL WEIGHTAGE</div>
              <div className="text-2xl font-bold text-purple-600">20%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Working Memory */}
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Working Memory</h3>
                  <p className="text-sm text-gray-600">Retention & Manipulation</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">WEIGHT: 25%</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Digit Span:</div>
                  <div className="text-sm text-gray-600">Recall number sequences forward & backward.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Pattern Recall:</div>
                  <div className="text-sm text-gray-600">Memorize positions in 3×3 / 4×4 visual grids.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Word-List:</div>
                  <div className="text-sm text-gray-600">Immediate retention of 7–10 unrelated words.</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">PRIMARY OUTPUT</span>
                <span className="text-sm font-bold text-blue-600">Working Memory Index (WMI)</span>
              </div>
            </div>
          </div>

          {/* Processing Speed */}
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-purple-500 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Processing Speed</h3>
                  <p className="text-sm text-gray-600">Mental Quickness</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold">WEIGHT: 25%</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Symbol Match:</div>
                  <div className="text-sm text-gray-600">Rapidly identify matching abstract shapes.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Rapid Comparison:</div>
                  <div className="text-sm text-gray-600">Speed drills to verify number/text strings.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Speed Math:</div>
                  <div className="text-sm text-gray-600">Simple 1-step arithmetic under high time pressure.</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">PRIMARY OUTPUT</span>
                <span className="text-sm font-bold text-purple-600">Processing Speed Index (PSI)</span>
              </div>
            </div>
          </div>

          {/* Logical Reasoning */}
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Puzzle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Logical Reasoning</h3>
                  <p className="text-sm text-gray-600">Pattern Recognition</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-bold">WEIGHT: 30%</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Analogies:</div>
                  <div className="text-sm text-gray-600">Identify relationships between word or shape pairs.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Series Completion:</div>
                  <div className="text-sm text-gray-600">Predict the next item in a complex sequence.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Matrix Reasoning:</div>
                  <div className="text-sm text-gray-600">Solve 3×3 visual logic puzzles.</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">PRIMARY OUTPUT</span>
                <span className="text-sm font-bold text-green-600">Reasoning Index (RI)</span>
              </div>
            </div>
          </div>

          {/* Attention & Focus */}
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-pink-500 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Focus className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Attention & Focus</h3>
                  <p className="text-sm text-gray-600">Inhibitory Control</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-sm font-bold">WEIGHT: 20%</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-pink-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Stroop Test:</div>
                  <div className="text-sm text-gray-600">Color-word conflict challenge (cognitive inhibition).</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-pink-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Error Spotting:</div>
                  <div className="text-sm text-gray-600">Find minute differences in dense text/data blocks.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-pink-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sequence Tracking:</div>
                  <div className="text-sm text-gray-600">Follow changing rules in a continuous stream.</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">PRIMARY OUTPUT</span>
                <span className="text-sm font-bold text-pink-600">Focus Stamina Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-bold transition-all"
          >
            ← Back to Overview
          </button>
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
          >
            Complete Layer 1
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Layer 2: Academic Foundations
function Layer2AcademicFoundations({
  onComplete,
  onBack
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">LAYER 2</span>
              <h1 className="text-2xl font-bold text-gray-900">Academic Foundation Assessment</h1>
            </div>
            <p className="text-sm text-gray-600">
              Subject: <span className="font-bold text-purple-600">Mathematics</span> (Classes 6-9 Prerequisites for ICSE Class 10)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">EST. TIME</div>
              <div className="text-2xl font-bold text-purple-600">35-40 Min</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Key Knowledge Units */}
          <div className="bg-purple-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">KEY KNOWLEDGE UNITS</h3>
            </div>

            <div className="space-y-6">
              {/* Number System & Commercial */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5" />
                  <h4 className="font-bold">NUMBER SYSTEM & COMMERCIAL</h4>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Integers, Rational Numbers & Operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Ratio, Proportion & Percentages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Profit/Loss, Simple Interest (Base for Banking)</span>
                  </div>
                </div>
              </div>

              {/* Algebra Core */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">x²</span>
                  <h4 className="font-bold">ALGEBRA CORE</h4>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Algebraic Expressions & Expansion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Factorisation Techniques (Middle-term split)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Linear Equations (One & Two Variables)</span>
                  </div>
                </div>
              </div>

              {/* Geometry & Mensuration */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5" />
                  <h4 className="font-bold">GEOMETRY & MENSURATION</h4>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Triangle Basics (Congruence, Similarity Intro)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Circle Properties & Tangents Intro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Areas (2D) & Volumes (Surface Area logic)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Item Design */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">ITEM DESIGN</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl font-bold text-blue-600">15</span>
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Conceptual MCQs</h4>
                <p className="text-sm text-gray-600">Testing deep understanding of definitions and logic.</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl font-bold text-purple-600">05</span>
                  <Calculator className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Numerical Items</h4>
                <p className="text-sm text-gray-600">Short calculation tasks (Integers/Type-in).</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl font-bold text-orange-600">02</span>
                  <Search className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Error Detection</h4>
                <p className="text-sm text-gray-600">"Spot the mistake" in a solved equation.</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl font-bold text-green-600">01</span>
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Concept Map</h4>
                <p className="text-sm text-gray-600">Drag-drop to link prerequisites.</p>
              </div>
            </div>
          </div>

          {/* Diagnostic Tags */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">DIAGNOSTIC TAGS</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-green-900">Strong Foundation</h4>
                </div>
                <p className="text-sm text-green-700">Ready for advanced Class 10 concepts (e.g., Quadratic Formula, Ratio Theorem).</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-yellow-900">Moderate Gaps</h4>
                </div>
                <p className="text-sm text-yellow-700">Requires specific bridge modules (e.g., re-visiting Factorisation before Polynomials).</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-red-900">Severe Deficit</h4>
                </div>
                <p className="text-sm text-red-700">Critical intervention needed in basic operations before starting current syllabus.</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">SYSTEM ACTION</h4>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-bold">Auto-Generates Bridge Course</p>
                    <p className="text-sm text-blue-600">Maps weak SKUs to Class 10 Ch 1-5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-bold transition-all"
          >
            ← Back to Overview
          </button>
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
          >
            Complete Layer 2
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Layer 3: Class 10 Readiness (Placeholder)
function Layer3Class10Readiness({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Layer 3: Class 10 Readiness</h2>
        <p className="text-gray-600 mb-6">Assessment interface for current syllabus entry points</p>
        <div className="flex gap-4 justify-center">
          <button onClick={onBack} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold">
            Back
          </button>
          <button onClick={onComplete} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">
            Complete Layer 3
          </button>
        </div>
      </div>
    </div>
  );
}

// Layer 4: Habits & Mindset (Placeholder)
function Layer4HabitsMindset({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Layer 4: Habits & Mindset</h2>
        <p className="text-gray-600 mb-6">Study consistency, psychological readiness assessment</p>
        <div className="flex gap-4 justify-center">
          <button onClick={onBack} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold">
            Back
          </button>
          <button onClick={onComplete} className="px-6 py-3 bg-pink-600 text-white rounded-xl font-bold">
            Complete Layer 4
          </button>
        </div>
      </div>
    </div>
  );
}

// Assessment Results (Placeholder)
function AssessmentResults({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Initial Assessment Complete!</h2>
        <p className="text-xl text-gray-600 mb-8">
          Your comprehensive diagnostic report is being generated...
        </p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
        >
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
}
