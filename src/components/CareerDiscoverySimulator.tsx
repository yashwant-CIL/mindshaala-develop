import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  Sparkles,
  Target,
  Brain,
  Heart,
  Lightbulb,
  TrendingUp,
  Award,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Zap,
  BookOpen,
  Code,
  Microscope,
  Building2,
  Palette,
  Users,
  Globe,
  Calculator,
  FlaskConical,
  BookMarked,
  Play,
  Trophy,
  Star,
  Eye,
  ThumbsUp,
  MessageCircle,
  Clock
} from 'lucide-react';

// Types
interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'rating' | 'text';
  options?: Array<{
    id: string;
    text: string;
    icon?: React.ElementType;
    keywords: string[];
  }>;
  category: 'interest' | 'strength' | 'preference' | 'personality';
}

interface CareerRecommendation {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
  matchScore: number;
  avgSalary: string;
  growth: string;
  topCompanies: string[];
  requiredSkills: string[];
  personalityFit: string[];
  learningPath: {
    subject: string;
    chapters: Array<{
      chapter: string;
      topics: Array<{
        topic: string;
        importance: 'critical' | 'important' | 'helpful';
        realWorldUse: string;
        weeklyHours: number;
      }>;
    }>;
  }[];
}

interface UserResponse {
  questionId: string;
  answer: string | string[];
}

// Discovery Questions Database
const discoveryQuestions: Question[] = [
  {
    id: 'q1-interests',
    question: "What excites you the most? (Choose all that apply)",
    type: 'multiple',
    category: 'interest',
    options: [
      { 
        id: 'tech', 
        text: 'Building apps, games, or websites', 
        icon: Code,
        keywords: ['software', 'developer', 'game-dev', 'web-dev', 'ai', 'data-science']
      },
      { 
        id: 'science', 
        text: 'Discovering how things work scientifically', 
        icon: Microscope,
        keywords: ['scientist', 'researcher', 'biotech', 'pharma', 'medical']
      },
      { 
        id: 'design', 
        text: 'Creating beautiful designs and art', 
        icon: Palette,
        keywords: ['designer', 'architect', 'artist', 'animator', 'ux-designer']
      },
      { 
        id: 'engineering', 
        text: 'Designing and building structures', 
        icon: Building2,
        keywords: ['engineer', 'civil', 'mechanical', 'construction', 'architect']
      },
      { 
        id: 'space', 
        text: 'Exploring space and astronomy', 
        icon: Rocket,
        keywords: ['space', 'astronaut', 'astrophysics', 'aerospace']
      },
      { 
        id: 'helping', 
        text: 'Helping people and solving their problems', 
        icon: Heart,
        keywords: ['doctor', 'teacher', 'counselor', 'social-work', 'healthcare']
      },
      { 
        id: 'business', 
        text: 'Starting businesses and making money', 
        icon: TrendingUp,
        keywords: ['entrepreneur', 'business', 'finance', 'marketing', 'sales']
      },
      { 
        id: 'environment', 
        text: 'Protecting nature and environment', 
        icon: Globe,
        keywords: ['environment', 'sustainability', 'conservation', 'green-tech']
      }
    ]
  },
  {
    id: 'q2-subjects',
    question: "Which subjects do you enjoy the most?",
    type: 'multiple',
    category: 'interest',
    options: [
      { id: 'math', text: 'Mathematics', icon: Calculator, keywords: ['math', 'calculus', 'statistics'] },
      { id: 'physics', text: 'Physics', icon: Zap, keywords: ['physics', 'mechanics', 'electronics'] },
      { id: 'chemistry', text: 'Chemistry', icon: FlaskConical, keywords: ['chemistry', 'organic', 'biochemistry'] },
      { id: 'biology', text: 'Biology', icon: Microscope, keywords: ['biology', 'medical', 'life-sciences'] },
      { id: 'computer', text: 'Computer Science', icon: Code, keywords: ['programming', 'coding', 'tech'] },
      { id: 'english', text: 'English & Literature', icon: BookMarked, keywords: ['writing', 'communication', 'content'] }
    ]
  },
  {
    id: 'q3-strengths',
    question: "What are you naturally good at?",
    type: 'multiple',
    category: 'strength',
    options: [
      { id: 'problem-solving', text: 'Solving complex problems', icon: Brain, keywords: ['analytical', 'logical'] },
      { id: 'creativity', text: 'Creative thinking and innovation', icon: Lightbulb, keywords: ['creative', 'innovative'] },
      { id: 'communication', text: 'Explaining things to others', icon: MessageCircle, keywords: ['teaching', 'presenting'] },
      { id: 'math-skills', text: 'Quick calculations and patterns', icon: Calculator, keywords: ['quantitative', 'mathematical'] },
      { id: 'hands-on', text: 'Building and experimenting', icon: Building2, keywords: ['practical', 'hands-on'] },
      { id: 'leadership', text: 'Leading teams and organizing', icon: Users, keywords: ['management', 'leadership'] }
    ]
  },
  {
    id: 'q4-work-style',
    question: "How do you prefer to work?",
    type: 'single',
    category: 'preference',
    options: [
      { id: 'solo', text: 'Independently, focusing deeply alone', icon: Brain, keywords: ['independent', 'focused'] },
      { id: 'team', text: 'Collaboratively with teams', icon: Users, keywords: ['collaborative', 'team'] },
      { id: 'mixed', text: 'Mix of both solo and team work', icon: Users, keywords: ['flexible', 'adaptive'] }
    ]
  },
  {
    id: 'q5-impact',
    question: "What kind of impact do you want to make?",
    type: 'single',
    category: 'personality',
    options: [
      { id: 'innovation', text: 'Create new technologies that change the world', icon: Rocket, keywords: ['innovative', 'disruptive'] },
      { id: 'help-people', text: 'Directly help individuals improve their lives', icon: Heart, keywords: ['compassionate', 'caring'] },
      { id: 'solve-big', text: 'Solve big global challenges', icon: Globe, keywords: ['visionary', 'ambitious'] },
      { id: 'create-beauty', text: 'Make the world more beautiful', icon: Palette, keywords: ['artistic', 'aesthetic'] },
      { id: 'wealth', text: 'Build successful businesses and wealth', icon: TrendingUp, keywords: ['entrepreneurial', 'driven'] }
    ]
  }
];

// Career Database with Learning Paths
const careerDatabase: Omit<CareerRecommendation, 'matchScore'>[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer / Developer',
    icon: Code,
    color: 'from-blue-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
    description: 'Design and build software applications, websites, and systems that millions use daily',
    avgSalary: '₹8-50 LPA',
    growth: 'Extremely High 🔥',
    topCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'],
    requiredSkills: ['Programming', 'Problem Solving', 'Algorithms', 'System Design'],
    personalityFit: ['tech', 'problem-solving', 'math', 'computer', 'solo', 'innovation'],
    learningPath: [
      {
        subject: 'Mathematics',
        chapters: [
          {
            chapter: 'Algebra',
            topics: [
              {
                topic: 'Linear Equations',
                importance: 'critical',
                realWorldUse: 'Used in algorithms for solving optimization problems in code',
                weeklyHours: 3
              },
              {
                topic: 'Quadratic Equations',
                importance: 'important',
                realWorldUse: 'Game physics, trajectory calculations, performance optimization',
                weeklyHours: 2
              }
            ]
          },
          {
            chapter: 'Calculus',
            topics: [
              {
                topic: 'Differentiation',
                importance: 'critical',
                realWorldUse: 'Machine learning gradient descent, animation curves, optimization',
                weeklyHours: 4
              },
              {
                topic: 'Integration',
                importance: 'important',
                realWorldUse: 'Computer graphics, area calculations, data analysis',
                weeklyHours: 3
              }
            ]
          },
          {
            chapter: 'Statistics & Probability',
            topics: [
              {
                topic: 'Probability Theory',
                importance: 'critical',
                realWorldUse: 'AI/ML models, prediction systems, game mechanics',
                weeklyHours: 4
              },
              {
                topic: 'Statistical Analysis',
                importance: 'critical',
                realWorldUse: 'Data science, A/B testing, user analytics',
                weeklyHours: 3
              }
            ]
          }
        ]
      },
      {
        subject: 'Physics',
        chapters: [
          {
            chapter: 'Mechanics',
            topics: [
              {
                topic: 'Motion & Kinematics',
                importance: 'important',
                realWorldUse: 'Game development, robotics simulations, animation systems',
                weeklyHours: 2
              },
              {
                topic: 'Laws of Motion',
                importance: 'important',
                realWorldUse: 'Physics engines, game mechanics, VR/AR applications',
                weeklyHours: 2
              }
            ]
          },
          {
            chapter: 'Electricity',
            topics: [
              {
                topic: 'Current & Circuits',
                importance: 'helpful',
                realWorldUse: 'Understanding hardware, IoT devices, embedded systems',
                weeklyHours: 1
              }
            ]
          }
        ]
      },
      {
        subject: 'Computer Science',
        chapters: [
          {
            chapter: 'Programming Fundamentals',
            topics: [
              {
                topic: 'Variables & Data Types',
                importance: 'critical',
                realWorldUse: 'Foundation of all programming - used every single day',
                weeklyHours: 5
              },
              {
                topic: 'Loops & Conditionals',
                importance: 'critical',
                realWorldUse: 'Control flow in every program you write',
                weeklyHours: 4
              },
              {
                topic: 'Functions & Recursion',
                importance: 'critical',
                realWorldUse: 'Code organization, algorithms, problem solving',
                weeklyHours: 4
              }
            ]
          },
          {
            chapter: 'Data Structures',
            topics: [
              {
                topic: 'Arrays & Strings',
                importance: 'critical',
                realWorldUse: 'Most common data structures in every application',
                weeklyHours: 3
              },
              {
                topic: 'Trees & Graphs',
                importance: 'critical',
                realWorldUse: 'Database design, social networks, maps, AI pathfinding',
                weeklyHours: 4
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'civil-engineer',
    title: 'Civil Engineer',
    icon: Building2,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    description: 'Design and build infrastructure like bridges, buildings, roads, and cities',
    avgSalary: '₹6-25 LPA',
    growth: 'High 📈',
    topCompanies: ['L&T', 'Tata Projects', 'Shapoorji Pallonji', 'DLF'],
    requiredSkills: ['Structural Analysis', 'CAD Design', 'Project Management', 'Physics'],
    personalityFit: ['engineering', 'design', 'hands-on', 'math', 'physics', 'mixed'],
    learningPath: [
      {
        subject: 'Mathematics',
        chapters: [
          {
            chapter: 'Trigonometry',
            topics: [
              {
                topic: 'Angles & Triangles',
                importance: 'critical',
                realWorldUse: 'Calculate building angles, roof slopes, bridge supports',
                weeklyHours: 4
              },
              {
                topic: 'Height & Distance',
                importance: 'critical',
                realWorldUse: 'Surveying, land measurement, building heights',
                weeklyHours: 3
              }
            ]
          },
          {
            chapter: 'Coordinate Geometry',
            topics: [
              {
                topic: 'Lines & Slopes',
                importance: 'critical',
                realWorldUse: 'Road gradients, ramp design, structural alignment',
                weeklyHours: 3
              },
              {
                topic: 'Conic Sections (Parabola)',
                importance: 'critical',
                realWorldUse: 'Bridge arch design, cable structures, dome construction',
                weeklyHours: 4
              }
            ]
          },
          {
            chapter: 'Calculus',
            topics: [
              {
                topic: 'Differentiation',
                importance: 'important',
                realWorldUse: 'Optimization of material usage, cost minimization',
                weeklyHours: 3
              },
              {
                topic: 'Integration',
                importance: 'critical',
                realWorldUse: 'Calculate volumes of concrete, area of land, load distribution',
                weeklyHours: 4
              }
            ]
          }
        ]
      },
      {
        subject: 'Physics',
        chapters: [
          {
            chapter: 'Mechanics',
            topics: [
              {
                topic: 'Force & Pressure',
                importance: 'critical',
                realWorldUse: 'Structural load calculations, foundation design, safety factors',
                weeklyHours: 5
              },
              {
                topic: 'Work, Energy, Power',
                importance: 'important',
                realWorldUse: 'Machine efficiency, construction equipment, energy systems',
                weeklyHours: 3
              },
              {
                topic: 'Gravitation',
                importance: 'important',
                realWorldUse: 'Load calculations, structural stability, weight distribution',
                weeklyHours: 2
              }
            ]
          },
          {
            chapter: 'Properties of Matter',
            topics: [
              {
                topic: 'Elasticity & Stress',
                importance: 'critical',
                realWorldUse: 'Material strength analysis, beam design, structural integrity',
                weeklyHours: 4
              },
              {
                topic: 'Fluid Mechanics',
                importance: 'important',
                realWorldUse: 'Water supply systems, drainage design, dam construction',
                weeklyHours: 3
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'doctor',
    title: 'Medical Doctor',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
    description: 'Diagnose and treat patients, save lives, and improve healthcare',
    avgSalary: '₹10-80 LPA',
    growth: 'Very High 🔥',
    topCompanies: ['AIIMS', 'Apollo', 'Fortis', 'Max Healthcare'],
    requiredSkills: ['Biology', 'Chemistry', 'Patient Care', 'Critical Thinking'],
    personalityFit: ['science', 'helping', 'biology', 'chemistry', 'help-people', 'communication'],
    learningPath: [
      {
        subject: 'Biology',
        chapters: [
          {
            chapter: 'Human Physiology',
            topics: [
              {
                topic: 'Circulatory System',
                importance: 'critical',
                realWorldUse: 'Understanding heart diseases, blood pressure, cardiac care',
                weeklyHours: 5
              },
              {
                topic: 'Nervous System',
                importance: 'critical',
                realWorldUse: 'Neurological disorders, brain function, mental health',
                weeklyHours: 5
              },
              {
                topic: 'Digestive System',
                importance: 'critical',
                realWorldUse: 'Gastroenterology, nutrition, metabolic disorders',
                weeklyHours: 4
              }
            ]
          },
          {
            chapter: 'Genetics',
            topics: [
              {
                topic: 'DNA & Heredity',
                importance: 'critical',
                realWorldUse: 'Genetic diseases, personalized medicine, gene therapy',
                weeklyHours: 4
              }
            ]
          }
        ]
      },
      {
        subject: 'Chemistry',
        chapters: [
          {
            chapter: 'Organic Chemistry',
            topics: [
              {
                topic: 'Biomolecules',
                importance: 'critical',
                realWorldUse: 'Understanding drugs, proteins, hormones, body chemistry',
                weeklyHours: 5
              },
              {
                topic: 'Pharmaceutical Chemistry',
                importance: 'critical',
                realWorldUse: 'How medicines work, drug interactions, prescriptions',
                weeklyHours: 4
              }
            ]
          },
          {
            chapter: 'Physical Chemistry',
            topics: [
              {
                topic: 'Chemical Kinetics',
                importance: 'important',
                realWorldUse: 'Reaction rates in body, drug absorption, metabolism',
                weeklyHours: 3
              }
            ]
          }
        ]
      },
      {
        subject: 'Physics',
        chapters: [
          {
            chapter: 'Optics',
            topics: [
              {
                topic: 'Lenses & Vision',
                importance: 'important',
                realWorldUse: 'Ophthalmology, eye surgery, corrective lenses',
                weeklyHours: 2
              }
            ]
          },
          {
            chapter: 'Modern Physics',
            topics: [
              {
                topic: 'X-rays & Radioactivity',
                importance: 'critical',
                realWorldUse: 'Medical imaging, cancer treatment, diagnostics',
                weeklyHours: 3
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist / AI Engineer',
    icon: Brain,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
    description: 'Extract insights from data, build AI models, predict future trends',
    avgSalary: '₹12-60 LPA',
    growth: 'Extremely High 🚀',
    topCompanies: ['Google', 'Amazon', 'Microsoft', 'Netflix', 'Meta'],
    requiredSkills: ['Statistics', 'Machine Learning', 'Python', 'Data Analysis'],
    personalityFit: ['tech', 'math', 'problem-solving', 'computer', 'solo', 'solve-big'],
    learningPath: [
      {
        subject: 'Mathematics',
        chapters: [
          {
            chapter: 'Statistics & Probability',
            topics: [
              {
                topic: 'Probability Distributions',
                importance: 'critical',
                realWorldUse: 'Foundation of all ML models, predictions, A/B testing',
                weeklyHours: 5
              },
              {
                topic: 'Statistical Inference',
                importance: 'critical',
                realWorldUse: 'Drawing conclusions from data, hypothesis testing',
                weeklyHours: 4
              },
              {
                topic: 'Regression Analysis',
                importance: 'critical',
                realWorldUse: 'Predicting values, trend analysis, forecasting',
                weeklyHours: 5
              }
            ]
          },
          {
            chapter: 'Linear Algebra',
            topics: [
              {
                topic: 'Matrices & Vectors',
                importance: 'critical',
                realWorldUse: 'Core of neural networks, image processing, recommendation systems',
                weeklyHours: 5
              },
              {
                topic: 'Eigenvalues',
                importance: 'important',
                realWorldUse: 'Dimensionality reduction (PCA), data compression',
                weeklyHours: 3
              }
            ]
          },
          {
            chapter: 'Calculus',
            topics: [
              {
                topic: 'Partial Derivatives',
                importance: 'critical',
                realWorldUse: 'Training neural networks (backpropagation), optimization',
                weeklyHours: 4
              },
              {
                topic: 'Optimization',
                importance: 'critical',
                realWorldUse: 'Minimize loss functions, improve model accuracy',
                weeklyHours: 4
              }
            ]
          }
        ]
      }
    ]
  }
];

export function CareerDiscoverySimulator() {
  const [step, setStep] = useState<'intro' | 'questions' | 'analyzing' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);

  const currentQuestion = discoveryQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / discoveryQuestions.length) * 100;

  const handleStart = () => {
    setStep('questions');
  };

  const handleOptionToggle = (optionId: string) => {
    if (currentQuestion.type === 'single') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleNext = () => {
    // Save response
    const newResponse: UserResponse = {
      questionId: currentQuestion.id,
      answer: currentQuestion.type === 'single' ? selectedOptions[0] : selectedOptions
    };
    setResponses([...responses, newResponse]);
    setSelectedOptions([]);

    // Move to next question or analyze
    if (currentQuestionIndex < discoveryQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      analyzeResponses([...responses, newResponse]);
    }
  };

  const analyzeResponses = (allResponses: UserResponse[]) => {
    setStep('analyzing');

    // Calculate match scores for each career
    setTimeout(() => {
      const scoredCareers = careerDatabase.map(career => {
        let score = 0;
        let totalKeywords = career.personalityFit.length;

        allResponses.forEach(response => {
          const question = discoveryQuestions.find(q => q.id === response.questionId);
          if (!question) return;

          const answers = Array.isArray(response.answer) ? response.answer : [response.answer];
          
          answers.forEach(answerId => {
            const option = question.options?.find(opt => opt.id === answerId);
            if (option) {
              // Check how many keywords match
              const matches = option.keywords.filter(keyword =>
                career.personalityFit.some(fit => 
                  fit.toLowerCase().includes(keyword.toLowerCase()) ||
                  keyword.toLowerCase().includes(fit.toLowerCase())
                )
              );
              score += matches.length;
            }
          });
        });

        const matchScore = Math.min((score / totalKeywords) * 100, 100);
        return { ...career, matchScore };
      });

      // Sort by match score and get top 4
      const topCareers = scoredCareers
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4);

      setRecommendations(topCareers);
      setStep('results');
    }, 2500);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setResponses(responses.slice(0, -1));
    }
  };

  const handleRestart = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setResponses([]);
    setSelectedOptions([]);
    setRecommendations([]);
    setSelectedCareer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className=" mx-auto">
        
        {/* Intro Screen */}
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>

                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  Discover Your Perfect Career Path
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                  Answer a few questions about yourself, and we'll show you personalized career recommendations 
                  with <span className="font-semibold text-blue-600">exact learning paths</span> from your current syllabus!
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <Target className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-900 mb-2">Personalized</h3>
                    <p className="text-sm text-slate-600">Based on your interests & strengths</p>
                  </div>
                  <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <MapPin className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-900 mb-2">Learning Path</h3>
                    <p className="text-sm text-slate-600">Exact subjects, chapters & topics</p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                    <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-900 mb-2">Real-World</h3>
                    <p className="text-sm text-slate-600">How you'll use each topic in career</p>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-lg flex items-center gap-3 mx-auto"
                >
                  <Rocket className="w-6 h-6" />
                  Start Career Discovery
                  <ArrowRight className="w-6 h-6" />
                </button>

                <p className="text-sm text-slate-500 mt-6">Takes only 2 minutes • 100% Free</p>
              </div>
            </motion.div>
          )}

          {/* Questions Screen */}
          {step === 'questions' && currentQuestion && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Question {currentQuestionIndex + 1} of {discoveryQuestions.length}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 capitalize">{currentQuestion.category}</p>
                      <h2 className="text-2xl font-bold text-slate-900">{currentQuestion.question}</h2>
                    </div>
                  </div>
                  {currentQuestion.type === 'multiple' && (
                    <p className="text-sm text-slate-500 italic">Select all that apply</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {currentQuestion.options?.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedOptions.includes(option.id);

                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleOptionToggle(option.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {Icon && (
                            <div className={`p-3 rounded-lg ${
                              isSelected ? 'bg-blue-500' : 'bg-slate-100'
                            }`}>
                              <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                              {option.text}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={selectedOptions.length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {currentQuestionIndex === discoveryQuestions.length - 1 ? 'Finish' : 'Next'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analyzing Screen */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <Brain className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Analyzing Your Responses...
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Our AI is matching your profile with the perfect career paths
                </p>

                <div className="space-y-3">
                  {[
                    'Evaluating your interests and strengths',
                    'Analyzing personality fit for careers',
                    'Mapping learning paths from your syllabus',
                    'Calculating career match scores'
                  ].map((text, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.3 }}
                      className="flex items-center gap-3 justify-center text-slate-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Screen */}
          {step === 'results' && !selectedCareer && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Perfect Career Matches</h1>
                    <p className="text-slate-600">Based on your unique profile, here are your top career recommendations</p>
                  </div>
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                  >
                    Retake Quiz
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {recommendations.map((career, index) => {
                    const Icon = career.icon;
                    return (
                      <motion.div
                        key={career.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedCareer(career)}
                        className="group cursor-pointer relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-blue-400 hover:shadow-xl transition-all"
                      >
                        {index === 0 && (
                          <div className="absolute top-4 right-4">
                            <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Best Match
                            </div>
                          </div>
                        )}

                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${career.gradient}`} />
                        
                        <div className="relative">
                          <div className={`p-3 bg-gradient-to-br ${career.color} rounded-lg w-fit mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-slate-900">{career.title}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-slate-900">{career.matchScore.toFixed(0)}%</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{career.description}</p>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Avg. Salary:</span>
                              <span className="font-semibold text-green-600">{career.avgSalary}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Growth:</span>
                              <span className="font-semibold text-blue-600">{career.growth}</span>
                            </div>
                          </div>

                          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg group-hover:from-blue-700 group-hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                            View Learning Path
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Detailed Career Learning Path */}
          {selectedCareer && (
            <motion.div
              key="career-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => setSelectedCareer(null)}
                className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Back to Recommendations
              </button>

              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
                <div className="flex items-start gap-6 mb-8">
                  <div className={`p-4 bg-gradient-to-br ${selectedCareer.color} rounded-xl`}>
                    <selectedCareer.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-slate-900">{selectedCareer.title}</h1>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        {selectedCareer.matchScore.toFixed(0)}% Match
                      </div>
                    </div>
                    <p className="text-lg text-slate-600 mb-4">{selectedCareer.description}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-slate-600 mb-1">Salary Range</p>
                        <p className="text-xl font-bold text-green-600">{selectedCareer.avgSalary}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-slate-600 mb-1">Career Growth</p>
                        <p className="text-xl font-bold text-blue-600">{selectedCareer.growth}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-slate-600 mb-1">Top Companies</p>
                        <p className="text-sm font-semibold text-purple-600">{selectedCareer.topCompanies.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <MapPin className="w-7 h-7 text-blue-600" />
                    Your Personalized Learning Path
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Here's exactly what to study from your current syllabus to achieve this career goal:
                  </p>

                  <div className="space-y-8">
                    {selectedCareer.learningPath.map((subject, subjectIndex) => (
                      <div key={subjectIndex} className="border-l-4 border-blue-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                          {subject.subject}
                        </h3>

                        <div className="space-y-6">
                          {subject.chapters.map((chapter, chapterIndex) => (
                            <div key={chapterIndex} className="bg-slate-50 rounded-xl p-6">
                              <h4 className="text-lg font-bold text-slate-800 mb-4">
                                📖 {chapter.chapter}
                              </h4>

                              <div className="space-y-4">
                                {chapter.topics.map((topic, topicIndex) => (
                                  <div
                                    key={topicIndex}
                                    className={`p-4 rounded-lg border-2 ${
                                      topic.importance === 'critical'
                                        ? 'bg-red-50 border-red-200'
                                        : topic.importance === 'important'
                                        ? 'bg-amber-50 border-amber-200'
                                        : 'bg-blue-50 border-blue-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-bold text-slate-900">{topic.topic}</h5>
                                          <span
                                            className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                                              topic.importance === 'critical'
                                                ? 'bg-red-200 text-red-800'
                                                : topic.importance === 'important'
                                                ? 'bg-amber-200 text-amber-800'
                                                : 'bg-blue-200 text-blue-800'
                                            }`}
                                          >
                                            {topic.importance === 'critical' ? '🔴 CRITICAL' : topic.importance === 'important' ? '🟡 IMPORTANT' : '🔵 HELPFUL'}
                                          </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                          <strong className="text-slate-900">Real-world use:</strong> {topic.realWorldUse}
                                        </p>
                                      </div>
                                      <div className="text-right ml-4">
                                        <div className="flex items-center gap-1 text-purple-600">
                                          <Clock className="w-4 h-4" />
                                          <span className="font-semibold text-sm">{topic.weeklyHours}h/week</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
