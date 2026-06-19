import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  MessageCircle,
  Lightbulb,
  Rocket,
  BookOpen,
  Target,
  Zap,
  Brain,
  TrendingUp,
  CheckCircle2,
  Info,
  AlertCircle
} from 'lucide-react';

// Types
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  relatedTopics?: Array<{
    subject: string;
    chapter: string;
    topic: string;
    importance: 'critical' | 'important' | 'helpful';
    weeklyHours: number;
  }>;
  realWorldUses?: Array<{
    career: string;
    application: string;
    companies: string[];
  }>;
}

// Knowledge Base - Topic to Real World Mapping
const topicToRealWorld: Record<string, Array<{ career: string; application: string; companies: string[] }>> = {
  'fourier transformation': [
    { career: 'Signal Processing Engineer', application: 'Converting audio/video signals from time domain to frequency domain for compression (MP3, JPEG)', companies: ['Qualcomm', 'Intel', 'Sony'] },
    { career: 'Medical Imaging Specialist', application: 'MRI and CT scan image reconstruction from raw frequency data', companies: ['GE Healthcare', 'Siemens', 'Philips'] },
    { career: 'Telecommunications Engineer', application: 'Mobile network signal analysis, 4G/5G frequency modulation', companies: ['Ericsson', 'Nokia', 'Huawei'] },
    { career: 'Audio Engineer', application: 'Music production, equalizers, noise cancellation in headphones', companies: ['Bose', 'JBL', 'Spotify'] },
    { career: 'Quantum Computing Researcher', application: 'Quantum algorithms and state analysis', companies: ['IBM', 'Google Quantum AI', 'IonQ'] }
  ],
  'quadratic equations': [
    { career: 'Game Developer', application: 'Calculating projectile motion, ball trajectories, physics engines', companies: ['Rockstar Games', 'EA Sports', 'Unity'] },
    { career: 'Civil Engineer', application: 'Designing parabolic bridge arches, cable structures, roof curves', companies: ['L&T', 'Tata Projects', 'Shapoorji Pallonji'] },
    { career: 'Financial Analyst', application: 'Profit optimization, finding maximum/minimum values in investment portfolios', companies: ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan'] },
    { career: 'Aerospace Engineer', application: 'Rocket trajectory calculations, satellite orbit paths', companies: ['ISRO', 'NASA', 'SpaceX'] },
    { career: 'Data Scientist', application: 'Machine learning loss function optimization, curve fitting', companies: ['Google', 'Amazon', 'Netflix'] }
  ],
  'calculus': [
    { career: 'AI/ML Engineer', application: 'Gradient descent for training neural networks, backpropagation algorithms', companies: ['OpenAI', 'DeepMind', 'Meta AI'] },
    { career: 'Robotics Engineer', application: 'Robot motion planning, velocity and acceleration calculations', companies: ['Boston Dynamics', 'Tesla Autopilot', 'ABB Robotics'] },
    { career: 'Economics Analyst', application: 'Marginal cost/revenue analysis, optimization in economics', companies: ['World Bank', 'IMF', 'McKinsey'] },
    { career: 'Pharmaceutical Scientist', application: 'Drug concentration rates, pharmacokinetics modeling', companies: ['Pfizer', 'Novartis', 'Sun Pharma'] }
  ],
  'trigonometry': [
    { career: 'Pilot/Aviation', application: 'Navigation calculations, flight path angles, GPS triangulation', companies: ['Air India', 'IndiGo', 'Emirates'] },
    { career: 'Surveyor/Land Developer', application: 'Measuring land areas, building heights, distance calculations', companies: ['Survey of India', 'RITES', 'DLF'] },
    { career: 'Marine Engineer', application: 'Ship navigation, wave patterns, tide calculations', companies: ['Shipping Corporation of India', 'Maersk', 'MSC'] },
    { career: 'Game Graphics Programmer', application: 'Rotating 3D objects, camera angles, animation systems', companies: ['Ubisoft', 'Epic Games', 'Valve'] }
  ],
  'probability': [
    { career: 'Actuary/Insurance Analyst', application: 'Calculating risk, insurance premiums, claim predictions', companies: ['LIC', 'HDFC Life', 'ICICI Prudential'] },
    { career: 'Data Scientist', application: 'Predictive analytics, A/B testing, machine learning models', companies: ['Google', 'Facebook', 'LinkedIn'] },
    { career: 'Weather Forecaster', application: 'Predicting weather patterns, climate modeling', companies: ['IMD', 'NOAA', 'Weather Channel'] },
    { career: 'Casino/Gaming Industry', application: 'Designing fair games, odds calculation, house edge', companies: ['Caesars', 'MGM', 'Online Gaming Platforms'] }
  ],
  'organic chemistry': [
    { career: 'Pharmaceutical Chemist', application: 'Designing new drugs, understanding molecular structures of medicines', companies: ['Dr. Reddy\'s', 'Cipla', 'Biocon'] },
    { career: 'Cosmetics Scientist', application: 'Creating skincare products, fragrances, makeup formulations', companies: ['L\'Oréal', 'Unilever', 'P&G'] },
    { career: 'Food Scientist', application: 'Developing flavors, preservatives, nutritional additives', companies: ['Nestlé', 'PepsiCo', 'ITC Foods'] },
    { career: 'Forensic Scientist', application: 'Analyzing crime scene chemicals, toxicology reports', companies: ['FSL India', 'CBI Labs', 'Private Forensics'] }
  ],
  'newton\'s laws': [
    { career: 'Automotive Engineer', application: 'Car crash safety testing, acceleration performance, braking systems', companies: ['Tata Motors', 'Mahindra', 'Tesla'] },
    { career: 'Aerospace Engineer', application: 'Rocket thrust calculations, satellite motion, space missions', companies: ['ISRO', 'Boeing', 'Airbus'] },
    { career: 'Sports Biomechanist', application: 'Analyzing athlete movements, optimizing performance techniques', companies: ['Sports Authority of India', 'Olympic Training Centers'] }
  ],
  'electricity': [
    { career: 'Electrical Engineer', application: 'Designing circuits, power systems, electrical grids', companies: ['Siemens', 'ABB', 'Schneider Electric'] },
    { career: 'Electronics Engineer', application: 'Creating smartphones, computers, IoT devices', companies: ['Samsung', 'Apple', 'Qualcomm'] },
    { career: 'Renewable Energy Specialist', application: 'Solar panel systems, wind turbine optimization', companies: ['Tata Power Solar', 'Adani Green Energy', 'ReNew Power'] }
  ],
  'genetics': [
    { career: 'Genetic Counselor', application: 'Analyzing hereditary diseases, family planning advice', companies: ['Apollo Hospitals', 'Fortis', 'Max Healthcare'] },
    { career: 'Biotechnology Researcher', application: 'Gene editing (CRISPR), developing GMO crops', companies: ['Illumina', 'Genentech', 'Monsanto'] },
    { career: 'Forensic DNA Analyst', application: 'Criminal investigations, paternity testing', companies: ['FBI Labs', 'CBI Forensics', 'Private DNA Labs'] }
  ]
};

// Career to Required Topics Mapping
const careerToTopics: Record<string, Array<{ subject: string; chapter: string; topic: string; importance: 'critical' | 'important' | 'helpful'; weeklyHours: number; realWorldUse: string }>> = {
  'pilot': [
    { subject: 'Physics', chapter: 'Mechanics', topic: 'Motion & Velocity', importance: 'critical', weeklyHours: 4, realWorldUse: 'Understanding aircraft speed, acceleration during takeoff/landing' },
    { subject: 'Physics', chapter: 'Mechanics', topic: 'Laws of Motion', importance: 'critical', weeklyHours: 3, realWorldUse: 'Forces acting on aircraft: lift, drag, thrust, weight' },
    { subject: 'Physics', chapter: 'Properties of Matter', topic: 'Pressure & Buoyancy', importance: 'critical', weeklyHours: 3, realWorldUse: 'Cabin pressure, altitude effects, air density changes' },
    { subject: 'Mathematics', chapter: 'Trigonometry', topic: 'Angles & Triangles', importance: 'critical', weeklyHours: 5, realWorldUse: 'Navigation, flight path calculations, GPS triangulation' },
    { subject: 'Mathematics', chapter: 'Trigonometry', topic: 'Height & Distance', importance: 'critical', weeklyHours: 4, realWorldUse: 'Calculating altitude, distance to destination, approach angles' },
    { subject: 'Mathematics', chapter: 'Coordinate Geometry', topic: 'Distance Formula', importance: 'important', weeklyHours: 2, realWorldUse: 'Calculating distances between waypoints, fuel planning' },
    { subject: 'Physics', chapter: 'Heat & Thermodynamics', topic: 'Gas Laws', importance: 'important', weeklyHours: 2, realWorldUse: 'Jet engine operation, fuel combustion, air density at altitude' },
    { subject: 'Chemistry', chapter: 'States of Matter', topic: 'Gas Behavior', importance: 'helpful', weeklyHours: 1, realWorldUse: 'Understanding fuel properties, oxygen systems' },
    { subject: 'Mathematics', chapter: 'Vectors', topic: 'Vector Addition', importance: 'important', weeklyHours: 3, realWorldUse: 'Wind correction, ground speed calculations, drift' }
  ],
  'game developer': [
    { subject: 'Mathematics', chapter: 'Algebra', topic: 'Linear Equations', importance: 'critical', weeklyHours: 3, realWorldUse: 'Interpolation in animations, character movement calculations' },
    { subject: 'Mathematics', chapter: 'Algebra', topic: 'Quadratic Equations', importance: 'critical', weeklyHours: 4, realWorldUse: 'Projectile motion physics, ball trajectories, jumping mechanics' },
    { subject: 'Mathematics', chapter: 'Trigonometry', topic: 'Sine, Cosine, Tangent', importance: 'critical', weeklyHours: 5, realWorldUse: 'Rotating objects, camera angles, circular motion' },
    { subject: 'Mathematics', chapter: 'Vectors', topic: 'Vector Operations', importance: 'critical', weeklyHours: 5, realWorldUse: 'Character direction, collision detection, force calculations' },
    { subject: 'Physics', chapter: 'Mechanics', topic: 'Laws of Motion', importance: 'critical', weeklyHours: 4, realWorldUse: 'Physics engines, realistic object movement, gravity simulation' },
    { subject: 'Physics', chapter: 'Mechanics', topic: 'Collision & Momentum', importance: 'important', weeklyHours: 3, realWorldUse: 'Object collisions, damage calculations, bouncing effects' },
    { subject: 'Computer Science', chapter: 'Programming', topic: 'Object-Oriented Programming', importance: 'critical', weeklyHours: 6, realWorldUse: 'Game architecture, character classes, inheritance' },
    { subject: 'Mathematics', chapter: 'Matrices', topic: 'Matrix Transformations', importance: 'important', weeklyHours: 3, realWorldUse: '3D graphics rendering, screen transformations' }
  ],
  'doctor': [
    { subject: 'Biology', chapter: 'Human Physiology', topic: 'Circulatory System', importance: 'critical', weeklyHours: 5, realWorldUse: 'Understanding heart diseases, blood pressure, cardiac emergencies' },
    { subject: 'Biology', chapter: 'Human Physiology', topic: 'Respiratory System', importance: 'critical', weeklyHours: 5, realWorldUse: 'Diagnosing breathing disorders, oxygen therapy, lung diseases' },
    { subject: 'Biology', chapter: 'Human Physiology', topic: 'Nervous System', importance: 'critical', weeklyHours: 6, realWorldUse: 'Neurological disorders, brain function, reflexes' },
    { subject: 'Chemistry', chapter: 'Organic Chemistry', topic: 'Biomolecules', importance: 'critical', weeklyHours: 5, realWorldUse: 'Understanding proteins, enzymes, DNA, drug interactions' },
    { subject: 'Chemistry', chapter: 'Organic Chemistry', topic: 'Pharmaceutical Chemistry', importance: 'critical', weeklyHours: 4, realWorldUse: 'How medicines work, dosage calculations, side effects' },
    { subject: 'Biology', chapter: 'Genetics', topic: 'DNA & Heredity', importance: 'critical', weeklyHours: 4, realWorldUse: 'Genetic diseases, family history, personalized medicine' },
    { subject: 'Physics', chapter: 'Optics', topic: 'Lenses & Mirrors', importance: 'important', weeklyHours: 2, realWorldUse: 'Ophthalmology, eye surgery, corrective lenses' },
    { subject: 'Physics', chapter: 'Modern Physics', topic: 'X-rays & Radioactivity', importance: 'important', weeklyHours: 3, realWorldUse: 'Medical imaging, cancer treatment, diagnostics' },
    { subject: 'Mathematics', chapter: 'Statistics', topic: 'Probability & Data Analysis', importance: 'important', weeklyHours: 2, realWorldUse: 'Clinical trials, disease outbreak patterns, treatment success rates' }
  ],
  'civil engineer': [
    { subject: 'Mathematics', chapter: 'Trigonometry', topic: 'Angles & Triangles', importance: 'critical', weeklyHours: 4, realWorldUse: 'Building angles, roof slopes, structural stability calculations' },
    { subject: 'Mathematics', chapter: 'Coordinate Geometry', topic: 'Lines & Slopes', importance: 'critical', weeklyHours: 3, realWorldUse: 'Road gradients, ramp design, land surveying' },
    { subject: 'Mathematics', chapter: 'Coordinate Geometry', topic: 'Conic Sections (Parabola)', importance: 'critical', weeklyHours: 4, realWorldUse: 'Bridge arch design, cable structures, dome construction' },
    { subject: 'Mathematics', chapter: 'Calculus', topic: 'Integration', importance: 'critical', weeklyHours: 5, realWorldUse: 'Calculate volumes of concrete, area of irregular land, load distribution' },
    { subject: 'Physics', chapter: 'Mechanics', topic: 'Force & Pressure', importance: 'critical', weeklyHours: 5, realWorldUse: 'Structural load calculations, foundation design, safety factors' },
    { subject: 'Physics', chapter: 'Properties of Matter', topic: 'Elasticity & Stress', importance: 'critical', weeklyHours: 4, realWorldUse: 'Material strength analysis, beam bending, structural integrity' },
    { subject: 'Physics', chapter: 'Properties of Matter', topic: 'Fluid Mechanics', importance: 'important', weeklyHours: 3, realWorldUse: 'Water supply systems, drainage design, dam construction' }
  ],
  'data scientist': [
    { subject: 'Mathematics', chapter: 'Statistics', topic: 'Probability Distributions', importance: 'critical', weeklyHours: 5, realWorldUse: 'Foundation of all ML models, predictions, risk analysis' },
    { subject: 'Mathematics', chapter: 'Statistics', topic: 'Statistical Inference', importance: 'critical', weeklyHours: 4, realWorldUse: 'Drawing conclusions from data, hypothesis testing, A/B testing' },
    { subject: 'Mathematics', chapter: 'Statistics', topic: 'Regression Analysis', importance: 'critical', weeklyHours: 5, realWorldUse: 'Predicting sales, stock prices, customer behavior' },
    { subject: 'Mathematics', chapter: 'Linear Algebra', topic: 'Matrices & Vectors', importance: 'critical', weeklyHours: 5, realWorldUse: 'Neural networks core, image processing, recommendation engines' },
    { subject: 'Mathematics', chapter: 'Calculus', topic: 'Partial Derivatives', importance: 'critical', weeklyHours: 4, realWorldUse: 'Training neural networks (backpropagation), optimization algorithms' },
    { subject: 'Mathematics', chapter: 'Calculus', topic: 'Optimization', importance: 'critical', weeklyHours: 4, realWorldUse: 'Minimize loss functions, improve model accuracy' },
    { subject: 'Computer Science', chapter: 'Programming', topic: 'Python Programming', importance: 'critical', weeklyHours: 6, realWorldUse: 'Primary language for data science, pandas, numpy, scikit-learn' }
  ],
  'software engineer': [
    { subject: 'Mathematics', chapter: 'Algebra', topic: 'Linear Equations', importance: 'critical', weeklyHours: 3, realWorldUse: 'Algorithm optimization, solving systems of equations in code' },
    { subject: 'Mathematics', chapter: 'Calculus', topic: 'Differentiation', importance: 'important', weeklyHours: 3, realWorldUse: 'Machine learning algorithms, optimization problems' },
    { subject: 'Mathematics', chapter: 'Statistics', topic: 'Probability', importance: 'critical', weeklyHours: 4, realWorldUse: 'AI/ML models, randomized algorithms, testing' },
    { subject: 'Computer Science', chapter: 'Programming', topic: 'Data Structures', importance: 'critical', weeklyHours: 6, realWorldUse: 'Arrays, trees, graphs - foundation of all software' },
    { subject: 'Computer Science', chapter: 'Programming', topic: 'Algorithms', importance: 'critical', weeklyHours: 6, realWorldUse: 'Sorting, searching, optimization - core of programming' },
    { subject: 'Physics', chapter: 'Mechanics', topic: 'Motion', importance: 'helpful', weeklyHours: 1, realWorldUse: 'Game development, simulations, animations' }
  ]
};

// AI Response Generator
function generateBotResponse(userMessage: string): Message {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check if asking about a specific topic's real-world uses
  let topicMatch = null;
  let topicName = '';
  
  for (const [topic, uses] of Object.entries(topicToRealWorld)) {
    if (lowerMessage.includes(topic.toLowerCase())) {
      topicMatch = uses;
      topicName = topic;
      break;
    }
  }
  
  if (topicMatch) {
    const useCases = topicMatch.map(use => 
      `• **${use.career}**: ${use.application}\n  Companies: ${use.companies.slice(0, 3).join(', ')}`
    ).join('\n\n');
    
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `Great question! **${topicName.charAt(0).toUpperCase() + topicName.slice(1)}** is used in many exciting careers:\n\n${useCases}\n\n💡 This concept is fundamental in modern technology and science!`,
      timestamp: new Date(),
      realWorldUses: topicMatch
    };
  }
  
  // Check if asking about a career path
  let careerMatch = null;
  let careerName = '';
  
  for (const [career, topics] of Object.entries(careerToTopics)) {
    if (lowerMessage.includes(career.toLowerCase())) {
      careerMatch = topics;
      careerName = career;
      break;
    }
  }
  
  if (careerMatch) {
    const criticalTopics = careerMatch.filter(t => t.importance === 'critical');
    const importantTopics = careerMatch.filter(t => t.importance === 'important');
    
    let response = `Excellent! To become a **${careerName.charAt(0).toUpperCase() + careerName.slice(1)}**, here's what you need from your syllabus:\n\n`;
    
    response += `**🔴 CRITICAL TOPICS** (Must master these):\n`;
    criticalTopics.forEach(topic => {
      response += `• ${topic.subject} → ${topic.chapter} → ${topic.topic}\n  ✓ ${topic.realWorldUse}\n  📚 Study: ${topic.weeklyHours}h/week\n\n`;
    });
    
    if (importantTopics.length > 0) {
      response += `\n**🟡 IMPORTANT TOPICS** (Highly recommended):\n`;
      importantTopics.forEach(topic => {
        response += `• ${topic.subject} → ${topic.chapter} → ${topic.topic}\n  ✓ ${topic.realWorldUse}\n\n`;
      });
    }
    
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      relatedTopics: careerMatch
    };
  }
  
  // Generic helpful response
  return {
    id: Date.now().toString(),
    type: 'bot',
    content: `I can help you understand:\n\n• **Where topics are used**: Ask me "Where is [topic] used?" (e.g., "Where is Fourier transformation used?")\n\n• **Career-specific syllabus**: Ask me "What do I need for [career]?" (e.g., "What do I need to become a pilot?")\n\nTry asking something like:\n- "Where is calculus used in real life?"\n- "What topics do I need for game development?"\n- "Is trigonometry useful for pilots?"`,
    timestamp: new Date()
  };
}

// Suggested Questions
const suggestedQuestions = [
  "Where is Fourier transformation used?",
  "What do I need to become a pilot?",
  "Where is calculus used in real life?",
  "What topics for game development?",
  "Is trigonometry useful for doctors?",
  "Where is quadratic equation used?",
  "What do I need for data scientist?",
  "Where is organic chemistry used?",
  "Civil engineer syllabus topics?"
];

export function CareerTopicAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'bot',
      content: `👋 Hi! I'm your **Career & Topic Advisor**.\n\nI can help you understand:\n\n✨ **Where you'll use what you learn**\n"Where is Fourier transformation used in real life?"\n\n🎯 **What to study for your dream career**\n"What topics do I need to become a pilot?"\n\nGo ahead, ask me anything!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-2xl shadow-lg border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Career & Topic Advisor</h1>
                <p className="text-slate-600 mt-1">Ask me anything about topics or careers!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-green-700">AI Online</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white border-x border-slate-200 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl p-5 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                >
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-600">AI Advisor</span>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-line leading-relaxed">
                    {message.content}
                  </div>

                  {message.realWorldUses && message.realWorldUses.length > 0 && (
                    <div className="mt-4 grid gap-3">
                      {message.realWorldUses.slice(0, 3).map((use, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-blue-200">
                          <div className="flex items-start gap-3">
                            <Rocket className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900">{use.career}</p>
                              <p className="text-sm text-slate-600 mt-1">{use.application}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {use.companies.slice(0, 3).map((company) => (
                                  <span key={company} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                                    {company}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-3 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-600">AI Advisor</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="bg-white border-x border-slate-200 px-6 py-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">💡 Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 6).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all text-sm font-medium"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-b-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... (e.g., 'Where is calculus used?')"
              className="flex-1 px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none text-slate-900 text-lg"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Press Enter to send • Powered by MindShaala AI
          </p>
        </div>

      </div>
    </div>
  );
}
