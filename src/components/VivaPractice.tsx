import { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Clock, Award, TrendingUp, BookOpen, Target, CheckCircle2, XCircle,
  Volume2, ArrowLeft, Brain, Sparkles, AlertCircle, Info, BarChart3,
  Timer, Zap, Star, ThumbsUp, ThumbsDown, MessageSquare, FileText,
  Trophy, Calendar, Eye, EyeOff, Settings, Lightbulb
} from 'lucide-react';

// ============================================================================
// GEMINI AI CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual Gemini API key
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface Subject {
  id: string;
  name: string;
  icon: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  totalQuestions: number;
}

interface Question {
  id: string;
  question: string;
  type: 'definition' | 'explanation' | 'application' | 'comparison' | 'diagram' | 'numerical';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedPoints: string[];
  perfectAnswer: string;
  hints: string[];
  relatedConcepts: string[];
  marks: number;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioURL: string | null;
  transcription: string;
}

interface QuestionResponse {
  questionId: string;
  question: string;
  recordedAnswer: Blob | null;
  transcription: string;
  timeTaken: number;
  aiScore: number; // 0-10
  feedback: AIFeedback;
  submitted: boolean;
}

interface AIFeedback {
  score: number; // 0-10
  grade: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' | 'Poor';
  correctPoints: string[];
  missedPoints: string[];
  suggestions: string[];
  keywordsIdentified: string[];
  clarity: number; // 0-10
  completeness: number; // 0-10
  accuracy: number; // 0-10
  overallComment: string;
}

interface VivaSession {
  id: string;
  date: number;
  subject: string;
  chapter: string;
  topic: string;
  mode: VivaMode;
  totalQuestions: number;
  questionsAttempted: number;
  averageScore: number;
  totalTimeTaken: number;
  responses: QuestionResponse[];
  overallGrade: string;
}

type VivaMode = 'quick' | 'standard' | 'full' | 'mock';
type ViewState = 'home' | 'selection' | 'viva' | 'results';

// ============================================================================
// SAMPLE DATA
// ============================================================================

const subjects: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    chapters: [
      {
        id: 'kinematics',
        name: 'Kinematics',
        topics: [
          { id: 'motion', name: 'Motion in a Straight Line', totalQuestions: 25 },
          { id: 'projectile', name: 'Projectile Motion', totalQuestions: 20 },
          { id: 'circular', name: 'Circular Motion', totalQuestions: 18 },
        ]
      },
      {
        id: 'laws-of-motion',
        name: 'Laws of Motion',
        topics: [
          { id: 'newton-laws', name: "Newton's Laws", totalQuestions: 30 },
          { id: 'friction', name: 'Friction', totalQuestions: 22 },
          { id: 'momentum', name: 'Momentum & Impulse', totalQuestions: 20 },
        ]
      },
      {
        id: 'optics',
        name: 'Optics',
        topics: [
          { id: 'reflection', name: 'Reflection of Light', totalQuestions: 25 },
          { id: 'refraction', name: 'Refraction of Light', totalQuestions: 28 },
          { id: 'lenses', name: 'Lenses & Mirrors', totalQuestions: 30 },
        ]
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪',
    chapters: [
      {
        id: 'atomic-structure',
        name: 'Atomic Structure',
        topics: [
          { id: 'atoms', name: 'Atoms & Molecules', totalQuestions: 25 },
          { id: 'periodic', name: 'Periodic Table', totalQuestions: 30 },
          { id: 'bonding', name: 'Chemical Bonding', totalQuestions: 28 },
        ]
      },
      {
        id: 'organic',
        name: 'Organic Chemistry',
        topics: [
          { id: 'hydrocarbons', name: 'Hydrocarbons', totalQuestions: 22 },
          { id: 'functional-groups', name: 'Functional Groups', totalQuestions: 25 },
          { id: 'reactions', name: 'Organic Reactions', totalQuestions: 30 },
        ]
      }
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: '🧬',
    chapters: [
      {
        id: 'cell-biology',
        name: 'Cell Biology',
        topics: [
          { id: 'cell-structure', name: 'Cell Structure', totalQuestions: 28 },
          { id: 'cell-division', name: 'Cell Division', totalQuestions: 24 },
          { id: 'biomolecules', name: 'Biomolecules', totalQuestions: 26 },
        ]
      },
      {
        id: 'human-physiology',
        name: 'Human Physiology',
        topics: [
          { id: 'digestion', name: 'Digestive System', totalQuestions: 25 },
          { id: 'circulation', name: 'Circulatory System', totalQuestions: 28 },
          { id: 'respiration', name: 'Respiratory System', totalQuestions: 22 },
        ]
      }
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '📐',
    chapters: [
      {
        id: 'calculus',
        name: 'Calculus',
        topics: [
          { id: 'limits', name: 'Limits & Continuity', totalQuestions: 30 },
          { id: 'derivatives', name: 'Derivatives', totalQuestions: 35 },
          { id: 'integration', name: 'Integration', totalQuestions: 32 },
        ]
      },
      {
        id: 'algebra',
        name: 'Algebra',
        topics: [
          { id: 'quadratic', name: 'Quadratic Equations', totalQuestions: 25 },
          { id: 'matrices', name: 'Matrices', totalQuestions: 28 },
          { id: 'determinants', name: 'Determinants', totalQuestions: 24 },
        ]
      }
    ]
  }
];

// Sample questions for demonstration
const sampleQuestions: { [key: string]: Question[] } = {
  'reflection': [
    {
      id: 'q1',
      question: 'Define the law of reflection. State both laws clearly.',
      type: 'definition',
      difficulty: 'easy',
      expectedPoints: [
        'The angle of incidence equals the angle of reflection',
        'The incident ray, reflected ray, and normal all lie in the same plane',
        'Both angles are measured from the normal'
      ],
      perfectAnswer: 'The law of reflection states that: (1) The angle of incidence is equal to the angle of reflection, and (2) The incident ray, reflected ray, and the normal to the surface all lie in the same plane. Both angles are measured from the normal to the reflecting surface.',
      hints: [
        'Think about angles and the normal line',
        'Consider what happens when light bounces off a surface',
        'Remember there are TWO laws'
      ],
      relatedConcepts: ['Normal', 'Plane Mirror', 'Specular Reflection'],
      marks: 3
    },
    {
      id: 'q2',
      question: 'Explain the difference between regular reflection and diffuse reflection. Give examples.',
      type: 'explanation',
      difficulty: 'medium',
      expectedPoints: [
        'Regular reflection occurs on smooth surfaces',
        'Diffuse reflection occurs on rough surfaces',
        'Regular gives clear images, diffuse does not',
        'Examples: mirror vs paper'
      ],
      perfectAnswer: 'Regular reflection occurs when light reflects off a smooth, polished surface like a mirror, producing a clear image because all reflected rays are parallel. Diffuse reflection occurs when light reflects off a rough surface like paper or cloth, where the reflected rays scatter in different directions due to surface irregularities, preventing clear image formation. Example: A mirror shows regular reflection (clear image), while a wall shows diffuse reflection (no clear image).',
      hints: [
        'Think about smooth vs rough surfaces',
        'Consider what you see in a mirror vs a wall',
        'Focus on how reflected rays behave'
      ],
      relatedConcepts: ['Surface Texture', 'Image Formation', 'Scattering'],
      marks: 4
    },
    {
      id: 'q3',
      question: 'A ray of light strikes a plane mirror at an angle of 30° to the mirror surface. What is the angle of reflection?',
      type: 'application',
      difficulty: 'medium',
      expectedPoints: [
        'First find angle of incidence',
        'Angle of incidence = 90° - 30° = 60°',
        'By law of reflection, angle of reflection = 60°',
        'Measured from the normal'
      ],
      perfectAnswer: 'First, we need to find the angle of incidence. Since the ray strikes at 30° to the mirror surface, the angle of incidence measured from the normal is 90° - 30° = 60°. According to the law of reflection, the angle of incidence equals the angle of reflection. Therefore, the angle of reflection is also 60° from the normal.',
      hints: [
        'Remember: angles are measured from the normal, not the surface',
        'If given angle to surface, find angle to normal first',
        'Use: angle to normal = 90° - angle to surface'
      ],
      relatedConcepts: ['Normal', 'Angle Measurement', 'Law of Reflection'],
      marks: 5
    },
    {
      id: 'q4',
      question: 'Compare reflection in a plane mirror with reflection in a spherical mirror.',
      type: 'comparison',
      difficulty: 'hard',
      expectedPoints: [
        'Plane mirror: normal perpendicular at each point, image same size',
        'Spherical mirror: curved surface, normal points toward center of curvature',
        'Plane mirror: virtual, erect, same size image',
        'Spherical mirror: can form real/virtual, magnified/diminished images',
        'Applications differ: plane for dressing, spherical for telescopes/headlights'
      ],
      perfectAnswer: 'Plane mirrors have a flat reflecting surface where the normal is perpendicular at every point, always producing virtual, erect, and same-sized images. Spherical mirrors have a curved surface (concave or convex) where normals point toward or away from the center of curvature, and can form both real and virtual images that may be magnified or diminished depending on object position. Plane mirrors are used for everyday purposes like dressing mirrors, while spherical mirrors have specialized applications like car headlights, telescopes, and dental mirrors due to their ability to converge or diverge light.',
      hints: [
        'Think about surface shape',
        'Consider image characteristics',
        'Compare practical applications'
      ],
      relatedConcepts: ['Image Formation', 'Center of Curvature', 'Magnification', 'Real vs Virtual Images'],
      marks: 6
    },
    {
      id: 'q5',
      question: 'Why does an ambulance write "AMBULANCE" in reverse on its front?',
      type: 'application',
      difficulty: 'easy',
      expectedPoints: [
        'So it appears correct in rear-view mirrors of vehicles ahead',
        'Mirror produces laterally inverted image',
        'Allows drivers to quickly identify it as an ambulance',
        'Helps in giving way immediately'
      ],
      perfectAnswer: 'The word "AMBULANCE" is written in reverse on the front of an ambulance so that when drivers ahead look in their rear-view mirrors, the laterally inverted image will appear as "AMBULANCE" in the correct readable form. This is because mirrors produce laterally inverted images. This allows drivers to quickly identify the emergency vehicle behind them and give way immediately, potentially saving lives.',
      hints: [
        'Think about what you see in your car\'s rear-view mirror',
        'Consider lateral inversion property of mirrors',
        'Think about the purpose - emergency response'
      ],
      relatedConcepts: ['Lateral Inversion', 'Plane Mirror', 'Practical Applications'],
      marks: 3
    }
  ],
  'newton-laws': [
    {
      id: 'q1',
      question: 'State Newton\'s First Law of Motion and explain what it tells us about inertia.',
      type: 'definition',
      difficulty: 'easy',
      expectedPoints: [
        'An object at rest stays at rest',
        'An object in motion continues in motion with constant velocity',
        'Unless acted upon by external force',
        'This property is called inertia',
        'Inertia is tendency to resist change in state of motion'
      ],
      perfectAnswer: 'Newton\'s First Law of Motion states that an object at rest will remain at rest, and an object in motion will continue to move with constant velocity in a straight line, unless acted upon by an external unbalanced force. This law introduces the concept of inertia, which is the natural tendency of an object to resist any change in its state of motion. The greater the mass of an object, the greater its inertia.',
      hints: [
        'Think about objects staying still or moving',
        'What makes them change?',
        'What property resists change?'
      ],
      relatedConcepts: ['Inertia', 'Force', 'Velocity', 'Mass'],
      marks: 4
    }
  ],
  'atoms': [
    {
      id: 'q1',
      question: 'Define an atom and describe its basic structure.',
      type: 'definition',
      difficulty: 'easy',
      expectedPoints: [
        'Smallest unit of matter',
        'Cannot be divided by chemical means',
        'Contains nucleus (protons and neutrons)',
        'Electrons orbit the nucleus',
        'Mostly empty space'
      ],
      perfectAnswer: 'An atom is the smallest unit of an element that retains the chemical properties of that element and cannot be divided by ordinary chemical means. It consists of a dense central nucleus containing positively charged protons and neutral neutrons, surrounded by negatively charged electrons that orbit the nucleus in specific energy levels. An atom is mostly empty space, with the nucleus occupying a tiny fraction of the total volume.',
      hints: [
        'Think about the smallest particle of an element',
        'What are the three main subatomic particles?',
        'Where are they located?'
      ],
      relatedConcepts: ['Nucleus', 'Protons', 'Neutrons', 'Electrons', 'Energy Levels'],
      marks: 3
    }
  ]
};

const vivaModes = [
  {
    id: 'quick' as VivaMode,
    name: 'Quick Viva',
    description: 'Short practice session',
    questions: 5,
    duration: 15,
    icon: Zap,
    color: 'blue'
  },
  {
    id: 'standard' as VivaMode,
    name: 'Standard Viva',
    description: 'Regular practice session',
    questions: 10,
    duration: 30,
    icon: Target,
    color: 'green'
  },
  {
    id: 'full' as VivaMode,
    name: 'Full Chapter Viva',
    description: 'Comprehensive practice',
    questions: 20,
    duration: 60,
    icon: BookOpen,
    color: 'purple'
  },
  {
    id: 'mock' as VivaMode,
    name: 'Mock Viva',
    description: 'Exam simulation',
    questions: 15,
    duration: 45,
    icon: Trophy,
    color: 'red'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VivaPractice() {
  // ========== STATE MANAGEMENT ==========
  const [viewState, setViewState] = useState<ViewState>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedMode, setSelectedMode] = useState<VivaMode | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioBlob: null,
    audioURL: null,
    transcription: ''
  });
  
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showHints, setShowHints] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [sessionHistory, setSessionHistory] = useState<VivaSession[]>([]);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(GEMINI_API_KEY);
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const [aiHint, setAiHint] = useState<string>('');
  const [generatingHint, setGeneratingHint] = useState(false);
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ========== CHECK MICROPHONE PERMISSION ON MOUNT ==========
  useEffect(() => {
    checkMicrophonePermission();
    
    // Check if Gemini API is configured and show helpful tip
    const hasShownGeminiTip = localStorage.getItem('hasShownGeminiTip');
    if (!hasShownGeminiTip && (!geminiApiKey || geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE')) {
      setTimeout(() => {
        const tip = document.createElement('div');
        tip.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-md animate-slide-in';
        tip.innerHTML = `
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <div>
              <p class="font-bold mb-1">💡 Pro Tip: Enable Gemini AI!</p>
              <p class="text-sm text-white/90 mb-3">Get intelligent, personalized feedback on your answers. Click the Settings ⚙️ icon to add your free Gemini API key.</p>
              <button onclick="this.closest('div').parentElement.remove(); localStorage.setItem('hasShownGeminiTip', 'true');" class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">Got it!</button>
            </div>
          </div>
        `;
        document.body.appendChild(tip);
        setTimeout(() => {
          if (document.body.contains(tip)) {
            tip.style.opacity = '0';
            tip.style.transition = 'opacity 0.3s';
            setTimeout(() => {
              if (document.body.contains(tip)) {
                document.body.removeChild(tip);
                localStorage.setItem('hasShownGeminiTip', 'true');
              }
            }, 300);
          }
        }, 10000); // Auto-dismiss after 10 seconds
      }, 2000); // Show after 2 seconds
    }
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      // Check if browser supports permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        // Listen for permission changes
        result.onchange = () => {
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
        };
      } else {
        // Fallback for browsers that don't support permissions API
        setMicPermission('prompt');
      }
    } catch (error) {
      console.log('Permission check not supported, will prompt on first use');
      setMicPermission('prompt');
    }
  };

  // ========== RECORDING TIMER ==========
  useEffect(() => {
    if (recording.isRecording && !recording.isPaused) {
      recordingTimerRef.current = setInterval(() => {
        setRecording(prev => ({
          ...prev,
          recordingTime: prev.recordingTime + 1
        }));
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recording.isRecording, recording.isPaused]);

  // ========== HELPER FUNCTIONS ==========
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Satisfactory': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Needs Improvement': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // ========== PERMISSION MODAL COMPONENT ==========
  const PermissionModal = () => {
    if (!showPermissionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Microphone Access Required
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              To practice viva with voice recording, MindShaala needs access to your microphone. 
              Your recordings are processed securely and never shared without your permission.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                How to Enable Microphone:
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Click the <strong>🔒 lock icon</strong> or <strong>🎤 microphone icon</strong> in your browser's address bar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Select <strong>"Allow"</strong> for microphone access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Reload the page if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Click <strong>"Try Again"</strong> below</span>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Troubleshooting:
              </h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Make sure your microphone is connected</li>
                <li>• Check if another app is using your microphone</li>
                <li>• Try using a different browser (Chrome, Edge, Firefox)</li>
                <li>• Check your system microphone settings</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-bold text-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setTimeout(() => startRecording(), 300);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== START VIVA SESSION ==========
  const startVivaSession = () => {
    if (!selectedTopic || !selectedMode) return;

    // Get questions for selected topic
    const topicQuestions = sampleQuestions[selectedTopic.id] || sampleQuestions['reflection'];
    const modeConfig = vivaModes.find(m => m.id === selectedMode);
    const numQuestions = Math.min(modeConfig?.questions || 5, topicQuestions.length);
    
    const selectedQuestions = topicQuestions.slice(0, numQuestions);
    setQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setSessionStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setViewState('viva');
  };

  // ========== RECORDING FUNCTIONS ==========
  const startRecording = async () => {
    try {
      // Check if microphone is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setShowPermissionModal(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        
        setRecording(prev => ({
          ...prev,
          audioBlob,
          audioURL,
          isRecording: false
        }));
        
        // Simulate transcription (in real app, send to speech-to-text API)
        simulateTranscription(audioBlob);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0
      }));
      setQuestionStartTime(Date.now());
      setMicPermission('granted');
    } catch (error: any) {
      // Handle different error types
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        // Permission denied is expected behavior - show helpful modal
        console.log('Microphone permission not granted. Showing permission instructions.');
        setMicPermission('denied');
        setShowPermissionModal(true);
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        console.error('No microphone device found:', error);
        alert('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        console.error('Microphone already in use:', error);
        alert('Microphone is already in use by another application. Please close other apps and try again.');
      } else {
        console.error('Unexpected microphone error:', error);
        alert('Error accessing microphone. Please check your browser settings and try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording.isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && recording.isRecording) {
      mediaRecorder.pause();
      setRecording(prev => ({ ...prev, isPaused: true }));
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && recording.isRecording && recording.isPaused) {
      mediaRecorder.resume();
      setRecording(prev => ({ ...prev, isPaused: false }));
    }
  };

  const resetRecording = () => {
    if (recording.audioURL) {
      URL.revokeObjectURL(recording.audioURL);
    }
    setRecording({
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      audioBlob: null,
      audioURL: null,
      transcription: ''
    });
    audioChunksRef.current = [];
  };

  // ========== GEMINI AI INTEGRATION ==========
  
  // Call Gemini API
  const callGeminiAPI = async (prompt: string): Promise<string> => {
    try {
      const apiKey = geminiApiKey || GEMINI_API_KEY;
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  // Transcribe audio using Web Speech API (simulated for now)
  const simulateTranscription = (audioBlob: Blob) => {
    // Note: For real audio transcription, you would need to:
    // 1. Use Web Speech API for browser-based transcription
    // 2. Or send audio to Google Speech-to-Text API
    // 3. Or use Gemini's multimodal capabilities (when available for audio)
    
    // For this demo, we'll simulate transcription but with Gemini-powered improvement
    setTimeout(async () => {
      const mockTranscriptions = [
        "The law of reflection states that the angle of incidence is equal to the angle of reflection. Both the incident ray and reflected ray lie in the same plane as the normal to the surface.",
        "Regular reflection happens on smooth surfaces like mirrors and produces clear images. Diffuse reflection occurs on rough surfaces like paper where light scatters in many directions.",
        "An atom is the smallest unit of matter that has the properties of an element. It consists of a nucleus containing protons and neutrons, surrounded by electrons.",
        "Newton's first law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force. This is called inertia."
      ];
      
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      setRecording(prev => ({
        ...prev,
        transcription: randomTranscription
      }));
    }, 1500);
  };

  const analyzeAnswer = async (transcription: string, question: Question): Promise<AIFeedback> => {
    // Use Gemini AI for intelligent answer evaluation
    try {
      const prompt = `You are an expert teacher evaluating a student's viva answer. Analyze the following response and provide detailed feedback.

Question: ${question.question}
Question Type: ${question.type}
Difficulty: ${question.difficulty}
Expected Points: ${question.expectedPoints.join(', ')}
Perfect Answer Reference: ${question.perfectAnswer}

Student's Answer: "${transcription}"

Provide your evaluation in the following JSON format:
{
  "accuracy": <score out of 10>,
  "completeness": <score out of 10>,
  "clarity": <score out of 10>,
  "correctPoints": [<list of correct points covered>],
  "missedPoints": [<list of important points missed>],
  "keywordsIdentified": [<key scientific terms used correctly>],
  "suggestions": [<3-5 specific improvement suggestions>],
  "overallComment": "<encouraging feedback with specific praise and guidance>"
}

Be constructive, encouraging, and specific in your feedback. Focus on what the student did well and provide actionable suggestions for improvement.`;

      const geminiResponse = await callGeminiAPI(prompt);
      
      // Parse Gemini's response
      // Extract JSON from the response (Gemini might wrap it in markdown)
      let jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse Gemini response');
      }
      
      const evaluation = JSON.parse(jsonMatch[0]);
      
      // Calculate average score
      const averageScore = Math.round((evaluation.accuracy + evaluation.completeness + evaluation.clarity) / 3);
      
      // Determine grade
      let grade: AIFeedback['grade'];
      if (averageScore >= 9) grade = 'Excellent';
      else if (averageScore >= 7) grade = 'Good';
      else if (averageScore >= 5) grade = 'Satisfactory';
      else if (averageScore >= 3) grade = 'Needs Improvement';
      else grade = 'Poor';
      
      return {
        score: averageScore,
        grade,
        correctPoints: evaluation.correctPoints || [],
        missedPoints: evaluation.missedPoints || [],
        suggestions: evaluation.suggestions || [],
        keywordsIdentified: evaluation.keywordsIdentified || [],
        clarity: evaluation.clarity,
        completeness: evaluation.completeness,
        accuracy: evaluation.accuracy,
        overallComment: evaluation.overallComment
      };
    } catch (error) {
      console.error('Error analyzing answer with Gemini:', error);
      
      // Fallback to basic analysis if Gemini fails
      return analyzAnswerFallback(transcription, question);
    }
  };

  // Fallback analysis method (used when Gemini API is unavailable)
  const analyzAnswerFallback = (transcription: string, question: Question): AIFeedback => {
    const words = transcription.toLowerCase().split(' ');
    const expectedKeywords = question.expectedPoints.flatMap(p => p.toLowerCase().split(' '));
    
    const keywordsFound = expectedKeywords.filter(keyword => 
      words.some(word => word.includes(keyword) || keyword.includes(word))
    );
    
    const coverageRatio = keywordsFound.length / expectedKeywords.length;
    const wordCount = words.length;
    
    let accuracy = Math.min(10, Math.round(coverageRatio * 10));
    let completeness = Math.min(10, Math.round((wordCount / 30) * 10));
    let clarity = Math.round(Math.random() * 3 + 7);
    
    const averageScore = Math.round((accuracy + completeness + clarity) / 3);
    
    let grade: AIFeedback['grade'];
    if (averageScore >= 9) grade = 'Excellent';
    else if (averageScore >= 7) grade = 'Good';
    else if (averageScore >= 5) grade = 'Satisfactory';
    else if (averageScore >= 3) grade = 'Needs Improvement';
    else grade = 'Poor';
    
    const correctPoints: string[] = [];
    const missedPoints: string[] = [];
    
    question.expectedPoints.forEach(point => {
      const pointWords = point.toLowerCase().split(' ');
      const covered = pointWords.some(word => words.includes(word));
      if (covered) {
        correctPoints.push(point);
      } else {
        missedPoints.push(point);
      }
    });
    
    const suggestions: string[] = [];
    if (completeness < 7) {
      suggestions.push('Try to provide more detailed explanations');
    }
    if (missedPoints.length > 0) {
      suggestions.push(`Include key points: ${missedPoints[0]}`);
    }
    if (accuracy < 7) {
      suggestions.push('Focus on the core concepts mentioned in the question');
    }
    
    const overallComment = grade === 'Excellent' 
      ? 'Outstanding answer! You covered all key points with clarity.'
      : grade === 'Good'
      ? 'Good answer! You covered most important points.'
      : grade === 'Satisfactory'
      ? 'Satisfactory answer. Could be improved with more details.'
      : 'Needs more work. Review the concepts and try again.';
    
    return {
      score: averageScore,
      grade,
      correctPoints,
      missedPoints,
      suggestions,
      keywordsIdentified: keywordsFound.slice(0, 5),
      clarity,
      completeness,
      accuracy,
      overallComment
    };
  };

  // ========== GEMINI-POWERED SMART HINTS ==========
  const generateSmartHint = async (question: Question) => {
    if (!geminiApiKey || geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      // Fallback to regular hints if no API key
      setShowHints(true);
      return;
    }

    setGeneratingHint(true);
    try {
      const prompt = `You are a helpful tutor guiding a student during a viva examination. The student is stuck on this question:

Question: ${question.question}
Type: ${question.type}
Difficulty: ${question.difficulty}

Provide a helpful hint that:
1. Guides the student toward the answer without giving it away directly
2. Encourages critical thinking
3. Is encouraging and supportive
4. Is concise (2-3 sentences max)

Hint:`;

      const hint = await callGeminiAPI(prompt);
      setAiHint(hint.trim());
      setShowHints(true);
    } catch (error) {
      console.error('Error generating hint:', error);
      // Fallback to regular hints
      setShowHints(true);
    } finally {
      setGeneratingHint(false);
    }
  };

  // ========== SUBMIT ANSWER ==========
  const submitAnswer = async () => {
    if (!recording.audioBlob || !recording.transcription) {
      alert('Please record your answer first!');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    
    // Show loading state while analyzing with Gemini AI
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3';
    loadingToast.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div><span>Analyzing your answer with AI...</span>';
    document.body.appendChild(loadingToast);
    
    try {
      // Get AI analysis from Gemini
      const feedback = await analyzeAnswer(recording.transcription, currentQuestion);
      
      const response: QuestionResponse = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        recordedAnswer: recording.audioBlob,
        transcription: recording.transcription,
        timeTaken,
        aiScore: feedback.score,
        feedback,
        submitted: true
      };
      
      setResponses(prev => [...prev, response]);
      
      // Remove loading toast
      document.body.removeChild(loadingToast);
      
      // Show success toast
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3';
      successToast.innerHTML = '<span>✓ Answer analyzed successfully!</span>';
      document.body.appendChild(successToast);
      setTimeout(() => document.body.removeChild(successToast), 2000);
      
      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        resetRecording();
        setQuestionStartTime(Date.now());
        setShowHints(false);
      } else {
        finishVivaSession([...responses, response]);
      }
    } catch (error) {
      // Remove loading toast
      if (document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }
      
      console.error('Error submitting answer:', error);
      alert('Error analyzing answer. Please try again.');
    }
  };

  // ========== FINISH SESSION ==========
  const finishVivaSession = (allResponses: QuestionResponse[]) => {
    const totalTimeTaken = Math.round((Date.now() - sessionStartTime) / 1000);
    const averageScore = allResponses.reduce((sum, r) => sum + r.aiScore, 0) / allResponses.length;
    
    let overallGrade: string;
    if (averageScore >= 9) overallGrade = 'Excellent';
    else if (averageScore >= 7) overallGrade = 'Good';
    else if (averageScore >= 5) overallGrade = 'Satisfactory';
    else if (averageScore >= 3) overallGrade = 'Needs Improvement';
    else overallGrade = 'Poor';
    
    const session: VivaSession = {
      id: `session-${Date.now()}`,
      date: Date.now(),
      subject: selectedSubject?.name || '',
      chapter: selectedChapter?.name || '',
      topic: selectedTopic?.name || '',
      mode: selectedMode!,
      totalQuestions: questions.length,
      questionsAttempted: allResponses.length,
      averageScore: Math.round(averageScore * 10) / 10,
      totalTimeTaken,
      responses: allResponses,
      overallGrade
    };
    
    setSessionHistory(prev => [...prev, session]);
    setViewState('results');
  };

  // ========== NAVIGATION ==========
  const goBack = () => {
    if (viewState === 'viva') {
      if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        resetRecording();
        setViewState('selection');
      }
    } else if (viewState === 'results') {
      setViewState('home');
    } else if (viewState === 'selection') {
      if (selectedTopic) {
        setSelectedTopic(null);
      } else if (selectedChapter) {
        setSelectedChapter(null);
      } else if (selectedSubject) {
        setSelectedSubject(null);
      } else {
        setViewState('home');
      }
    }
  };

  // ========== RENDER FUNCTIONS ==========

  // HOME VIEW
  if (viewState === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl text-white">AI Viva Practice</h1>
                    {geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE' ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Gemini Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Basic Mode
                      </span>
                    )}
                  </div>
                  <p className="text-white/90 text-lg">
                    Master your concepts with {geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE' ? 'Gemini AI-powered' : 'AI-enhanced'} oral examination practice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeySettings(true)}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                title="Configure Gemini API Key"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl mb-2">Voice Recording</h3>
              <p className="text-gray-600 text-sm">
                Record your answers using voice. Just like a real viva examination.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl mb-2">Gemini AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Get intelligent feedback from Google's Gemini AI on accuracy, completeness, and clarity.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                Monitor your improvement over time with detailed analytics.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setViewState('selection')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl p-8 shadow-xl transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl mb-2">Start New Viva</h3>
                  <p className="text-white/90">
                    Choose subject, topic, and begin practice
                  </p>
                </div>
                <ChevronRight className="w-8 h-8" />
              </div>
            </button>

            <button
              onClick={() => {/* Show history */}}
              className="bg-white hover:bg-gray-50 rounded-2xl p-8 shadow-xl border-2 border-gray-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl mb-2 text-gray-900">View History</h3>
                  <p className="text-gray-600">
                    {sessionHistory.length} sessions completed
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-gray-600" />
              </div>
            </button>
          </div>

          {/* Recent Sessions */}
          {sessionHistory.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Recent Sessions
              </h2>
              <div className="space-y-3">
                {sessionHistory.slice(-3).reverse().map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h4 className="font-bold text-gray-900">{session.subject} - {session.topic}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()} • {session.questionsAttempted} questions • {formatTime(session.totalTimeTaken)}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 font-bold ${getGradeColor(session.overallGrade)}`}>
                      {session.overallGrade}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SELECTION VIEW
  if (viewState === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className=" mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Back</span>
            </button>
            
            <h1 className="text-3xl mb-2">Configure Your Viva Session</h1>
            <p className="text-gray-600">
              Select subject, chapter, topic, and viva mode to begin
            </p>
          </div>

          {/* Selection Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Step indicators */}
            <div className={`p-4 rounded-xl border-2 ${selectedSubject ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${selectedSubject ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="font-bold text-gray-900">Subject</span>
              </div>
              {selectedSubject && (
                <p className="text-sm text-purple-600 ml-8">{selectedSubject.icon} {selectedSubject.name}</p>
              )}
            </div>

            <div className={`p-4 rounded-xl border-2 ${selectedChapter ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${selectedChapter ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="font-bold text-gray-900">Chapter</span>
              </div>
              {selectedChapter && (
                <p className="text-sm text-purple-600 ml-8">{selectedChapter.name}</p>
              )}
            </div>

            <div className={`p-4 rounded-xl border-2 ${selectedTopic ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${selectedTopic ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
                <span className="font-bold text-gray-900">Topic</span>
              </div>
              {selectedTopic && (
                <p className="text-sm text-purple-600 ml-8">{selectedTopic.name}</p>
              )}
            </div>

            <div className={`p-4 rounded-xl border-2 ${selectedMode ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${selectedMode ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  4
                </div>
                <span className="font-bold text-gray-900">Mode</span>
              </div>
              {selectedMode && (
                <p className="text-sm text-purple-600 ml-8">{vivaModes.find(m => m.id === selectedMode)?.name}</p>
              )}
            </div>
          </div>

          {/* Selection Content */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            {/* SUBJECT SELECTION */}
            {!selectedSubject && (
              <div>
                <h2 className="text-2xl mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Select Subject
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{subject.icon}</span>
                        <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {subject.chapters.length} chapters available
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CHAPTER SELECTION */}
            {selectedSubject && !selectedChapter && (
              <div>
                <h2 className="text-2xl mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Select Chapter from {selectedSubject.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSubject.chapters.map(chapter => (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{chapter.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {chapter.topics.length} topics available
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TOPIC SELECTION */}
            {selectedChapter && !selectedTopic && (
              <div>
                <h2 className="text-2xl mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  Select Topic from {selectedChapter.name}
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {selectedChapter.topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{topic.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {topic.totalQuestions} questions available
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MODE SELECTION */}
            {selectedTopic && !selectedMode && (
              <div>
                <h2 className="text-2xl mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-purple-600" />
                  Select Viva Mode
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vivaModes.map(mode => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`p-6 border-2 rounded-xl hover:border-${mode.color}-400 hover:bg-${mode.color}-50 transition-all text-left border-gray-200`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 bg-${mode.color}-100 rounded-xl flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 text-${mode.color}-600`} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{mode.name}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{mode.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📝 {mode.questions} questions</span>
                          <span>⏱️ ~{mode.duration} mins</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* START BUTTON */}
            {selectedTopic && selectedMode && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={startVivaSession}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-6 h-6" />
                  Start Viva Session
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VIVA VIEW (Recording Interface)
  if (viewState === 'viva') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Fixed Header */}
        <div className="bg-white border-b-2 border-gray-200 shadow-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Exit Viva
              </button>
              
              <div className="flex items-center gap-6">
                <div className="text-sm">
                  <span className="text-gray-600">Question </span>
                  <span className="font-bold text-purple-600">{currentQuestionIndex + 1}/{questions.length}</span>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-600">
                    {formatTime(Math.round((Date.now() - questionStartTime) / 1000))}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Question */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question Card */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                        currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {currentQuestion.difficulty.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                        {currentQuestion.marks} MARKS
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                        {currentQuestion.type.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl text-gray-900 leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                  </div>
                </div>

                {/* Hints */}
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold transition-colors"
                    >
                      {showHints ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      {showHints ? 'Hide Hints' : 'Show Hints'}
                    </button>
                    
                    <button
                      onClick={() => generateSmartHint(currentQuestion)}
                      disabled={generatingHint}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
                    >
                      {generatingHint ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span className="text-sm">Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm">AI Smart Hint</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showHints && (
                    <div className="mt-4 space-y-2">
                      {aiHint && (
                        <div className="flex items-start gap-2 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 mb-3">
                          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-purple-600 mb-1">AI-Generated Smart Hint</p>
                            <p className="text-sm text-gray-700">{aiHint}</p>
                          </div>
                        </div>
                      )}
                      {currentQuestion.hints.map((hint, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{hint}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recording Interface */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <h3 className="text-xl mb-6 flex items-center gap-2">
                  <Mic className="w-6 h-6 text-purple-600" />
                  Record Your Answer
                </h3>

                {/* Recording Status */}
                {!recording.isRecording && !recording.audioBlob && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mic className="w-12 h-12 text-purple-600" />
                    </div>
                    
                    {micPermission === 'denied' && (
                      <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <p className="text-red-600 font-bold mb-1">Microphone Access Denied</p>
                        <p className="text-sm text-red-600">Please allow microphone access in your browser settings</p>
                      </div>
                    )}
                    
                    {micPermission === 'checking' && (
                      <p className="text-gray-600 mb-6">
                        Checking microphone permissions...
                      </p>
                    )}
                    
                    {micPermission !== 'checking' && (
                      <p className="text-gray-600 mb-6">
                        Click the button below to start recording your answer
                      </p>
                    )}
                    
                    <button
                      onClick={startRecording}
                      disabled={micPermission === 'checking'}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2 mx-auto"
                    >
                      <Mic className="w-6 h-6" />
                      {micPermission === 'checking' ? 'Checking...' : 'Start Recording'}
                    </button>
                    
                    {micPermission === 'prompt' && (
                      <p className="text-xs text-gray-500 mt-4">
                        You'll be asked to allow microphone access
                      </p>
                    )}
                  </div>
                )}

                {/* Recording in Progress */}
                {recording.isRecording && (
                  <div className="text-center py-12">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-red-600 rounded-full animate-pulse opacity-20"></div>
                      <div className="absolute inset-4 bg-red-600 rounded-full flex items-center justify-center">
                        {recording.isPaused ? (
                          <Pause className="w-12 h-12 text-white" />
                        ) : (
                          <Mic className="w-12 h-12 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-4xl font-bold text-red-600 mb-6">
                      {formatTime(recording.recordingTime)}
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                      {recording.isPaused ? 'Recording Paused' : 'Recording in progress...'}
                    </p>
                    
                    <div className="flex items-center justify-center gap-4">
                      {!recording.isPaused ? (
                        <button
                          onClick={pauseRecording}
                          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                          <Pause className="w-5 h-5" />
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={resumeRecording}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Resume
                        </button>
                      )}
                      
                      <button
                        onClick={stopRecording}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                      >
                        <MicOff className="w-5 h-5" />
                        Stop Recording
                      </button>
                    </div>
                  </div>
                )}

                {/* Recording Complete - Transcription */}
                {recording.audioBlob && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <span className="font-bold text-green-600">Recording Complete</span>
                      </div>
                      <span className="text-sm text-green-600 font-bold">
                        {formatTime(recording.recordingTime)}
                      </span>
                    </div>

                    {/* Audio Playback */}
                    {recording.audioURL && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <audio src={recording.audioURL} controls className="w-full" />
                      </div>
                    )}

                    {/* Transcription */}
                    {recording.transcription ? (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          Your Answer (Transcribed):
                        </h4>
                        <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                          <p className="text-gray-700 leading-relaxed">{recording.transcription}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-blue-600 font-bold">Transcribing your answer...</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={resetRecording}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Re-record
                      </button>
                      
                      <button
                        onClick={submitAnswer}
                        disabled={!recording.transcription}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Submit Answer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Info Panel */}
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-600" />
                  Session Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-bold text-gray-900">{selectedSubject?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chapter:</span>
                    <span className="font-bold text-gray-900">{selectedChapter?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topic:</span>
                    <span className="font-bold text-gray-900">{selectedTopic?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-bold text-gray-900">
                      {vivaModes.find(m => m.id === selectedMode)?.name}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-bold text-purple-600">
                      {responses.length}/{questions.length} completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Expected Points */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Key Points to Cover
                </h3>
                <div className="space-y-2">
                  {currentQuestion.expectedPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Concepts */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Related Concepts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.relatedConcepts.map((concept, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold border border-purple-200"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Permission Modal */}
        {showPermissionModal && <PermissionModal />}
      </div>
    );
  }

  // RESULTS VIEW
  if (viewState === 'results') {
    const lastSession = sessionHistory[sessionHistory.length - 1];
    const averageScore = lastSession.averageScore;
    const totalTime = lastSession.totalTimeTaken;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className=" mx-auto">
          {/* Header */}
          <div className={`rounded-2xl shadow-xl p-8 mb-8 ${
            lastSession.overallGrade === 'Excellent' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
            lastSession.overallGrade === 'Good' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
            lastSession.overallGrade === 'Satisfactory' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
            'bg-gradient-to-r from-red-600 to-rose-600'
          }`}>
            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-12 h-12 text-purple-600" />
              </div>
              <h1 className="text-4xl text-white mb-2">Viva Complete!</h1>
              <p className="text-white/90 text-xl">
                {lastSession.overallGrade} Performance
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-purple-600" />
                <span className="text-gray-600 text-sm">Average Score</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{averageScore}/10</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-blue-600" />
                <span className="text-gray-600 text-sm">Questions</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{lastSession.questionsAttempted}/{lastSession.totalQuestions}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-green-600" />
                <span className="text-gray-600 text-sm">Time Taken</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{formatTime(totalTime)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-yellow-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
                <span className="text-gray-600 text-sm">Grade</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{lastSession.overallGrade}</p>
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
            <h2 className="text-2xl mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Detailed Feedback
            </h2>
            
            <div className="space-y-6">
              {lastSession.responses.map((response, index) => {
                const question = questions.find(q => q.id === response.questionId)!;
                return (
                  <div key={response.questionId} className="border-2 border-gray-200 rounded-xl p-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-600">Q{index + 1}.</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getGradeColor(response.feedback.grade)}`}>
                            {response.feedback.grade}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold">
                            {response.aiScore}/10
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">{response.question}</p>
                      </div>
                      <span className="text-sm text-gray-600 ml-4">
                        {formatTime(response.timeTaken)}
                      </span>
                    </div>

                    {/* Your Answer */}
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        Your Answer:
                      </h4>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-gray-700">{response.transcription}</p>
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Accuracy</span>
                          <span className="font-bold text-blue-600">{response.feedback.accuracy}/10</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${response.feedback.accuracy * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Completeness</span>
                          <span className="font-bold text-green-600">{response.feedback.completeness}/10</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${response.feedback.completeness * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Clarity</span>
                          <span className="font-bold text-purple-600">{response.feedback.clarity}/10</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${response.feedback.clarity * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Correct Points */}
                    {response.feedback.correctPoints.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Points Covered:
                        </h4>
                        <ul className="space-y-1">
                          {response.feedback.correctPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missed Points */}
                    {response.feedback.missedPoints.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Points Missed:
                        </h4>
                        <ul className="space-y-1">
                          {response.feedback.missedPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {response.feedback.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Suggestions:
                        </h4>
                        <ul className="space-y-1">
                          {response.feedback.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Overall Comment */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <p className="text-gray-700 italic">
                        <strong>AI Comment:</strong> {response.feedback.overallComment}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setViewState('home');
                setSelectedSubject(null);
                setSelectedChapter(null);
                setSelectedTopic(null);
                setSelectedMode(null);
              }}
              className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-6 h-6" />
              Back to Home
            </button>

            <button
              onClick={() => {
                setViewState('selection');
                setSelectedSubject(null);
                setSelectedChapter(null);
                setSelectedTopic(null);
                setSelectedMode(null);
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              Start New Viva
            </button>
          </div>
        </div>
      </div>
    );
  }

  // API KEY SETTINGS MODAL
  if (showApiKeySettings) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Gemini AI Settings</h2>
            </div>
            <button
              onClick={() => setShowApiKeySettings(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-purple-900 mb-2">About Gemini AI Integration</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  MindShaala's Viva Practice uses Google's Gemini AI to provide intelligent, personalized feedback on your answers. 
                  The AI evaluates your responses for accuracy, completeness, and clarity, just like a real examiner would.
                </p>
                <div className="bg-white/70 rounded-lg p-3 text-xs text-gray-600">
                  <p className="font-bold mb-1">Features powered by Gemini:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Smart answer evaluation with detailed feedback</li>
                    <li>AI-generated hints tailored to your learning needs</li>
                    <li>Personalized improvement suggestions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored locally and never shared. It's only used to communicate with Google's Gemini API.
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How to get your Gemini API key:
            </h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google AI Studio</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Sign in with your Google account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Click "Create API Key" to generate a new key</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Copy the key and paste it above</span>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Important Notes:
            </h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Gemini API is free for moderate use (60 requests per minute)</li>
              <li>• Without an API key, the system will use basic fallback analysis</li>
              <li>• Keep your API key secure and don't share it publicly</li>
              <li>• API key is required for AI Smart Hints and advanced feedback</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setGeminiApiKey('YOUR_GEMINI_API_KEY_HERE');
                setShowApiKeySettings(false);
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-bold text-gray-700 transition-all"
            >
              Reset to Default
            </button>
            <button
              onClick={() => setShowApiKeySettings(false)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              {geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE' ? 'Save & Close' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
