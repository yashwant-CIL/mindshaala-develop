import { useState } from 'react';
import { ArrowLeft, Code, Play, Terminal, Shapes, GitBranch, CheckCircle, Wand2, Trophy, Lightbulb, Zap, Sparkles, Coffee, Code2, Braces, Star, Award, TrendingUp, Target, Flame, Crown, Rocket, Brain, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FlowchartBuilder } from './FlowchartBuilder';
import { FlowchartBuilderPractice } from './FlowchartBuilderPractice';
import { BlockCodingPlatform } from './BlockCodingPlatform';
import { BlockProgrammingEditor } from './BlockProgrammingEditor';
import { CompetitionArena } from './CompetitionArena';
import { PythonPracticeArena } from './PythonPracticeArena';
import { JavaPracticeArena } from './JavaPracticeArena';
import { HTMLCSSPracticeArena } from './HTMLCSSPracticeArena';
import { JavaScriptPracticeArena } from './JavaScriptPracticeArena';
import { SimpleCodePlayground } from './SimpleCodePlayground';
import { SimpleHTMLCSSPlayground } from './SimpleHTMLCSSPlayground';
import { motion } from 'motion/react';

interface ProgrammingFundamentalsProps {
  onBack: () => void;
}

export function ProgrammingFundamentals({ onBack }: ProgrammingFundamentalsProps) {
  const [activeTab, setActiveTab] = useState<'flowchart' | 'blockcode' | 'python' | 'java' | 'htmlcss' | 'javascript'>('python');
  const [showFlowchartBuilder, setShowFlowchartBuilder] = useState(false);
  const [showFlowchartPractice, setShowFlowchartPractice] = useState(false);
  const [showBlockCoding, setShowBlockCoding] = useState(false);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [showCompetitionArena, setShowCompetitionArena] = useState(false);
  const [showPythonPracticeArena, setShowPythonPracticeArena] = useState(false);
  const [showJavaPracticeArena, setShowJavaPracticeArena] = useState(false);
  const [showHTMLCSSPracticeArena, setShowHTMLCSSPracticeArena] = useState(false);
  const [showJavaScriptPracticeArena, setShowJavaScriptPracticeArena] = useState(false);
  const [showCLIPracticeArena, setShowCLIPracticeArena] = useState(false);
  const [showSimpleCodePlayground, setShowSimpleCodePlayground] = useState(false);
  const [showSimpleHTMLCSSPlayground, setShowSimpleHTMLCSSPlayground] = useState(false);

  const languages = [
    {
      id: 'python',
      icon: '🐍',
      name: 'Python',
      subtitle: 'Class 9-12 • Most Popular',
      gradient: 'from-purple-600 via-pink-600 to-purple-600',
      bgGradient: 'from-purple-50 via-pink-50 to-purple-50',
      borderColor: 'border-purple-400',
      challenges: 6,
      difficulty: 'Easy to Medium',
      examRelevance: 'CBSE, ICSE, JEE',
      description: 'Master Python with AI-powered real-time coding races',
      popular: true,
    },
    {
      id: 'java',
      icon: '☕',
      name: 'Java',
      subtitle: 'Class 11-12 • Board Exams',
      gradient: 'from-orange-600 via-red-600 to-orange-600',
      bgGradient: 'from-orange-50 via-yellow-50 to-orange-50',
      borderColor: 'border-orange-400',
      challenges: 8,
      difficulty: 'Medium to Hard',
      examRelevance: 'CBSE Class 12',
      description: 'Race against AI to master Java for Board Exams',
      featured: true,
    },
    {
      id: 'htmlcss',
      icon: '🌐',
      name: 'HTML & CSS',
      subtitle: 'Class 9-10 • Web Design',
      gradient: 'from-blue-600 via-indigo-600 to-blue-600',
      bgGradient: 'from-blue-50 via-indigo-50 to-blue-50',
      borderColor: 'border-blue-400',
      challenges: 7,
      difficulty: 'Easy',
      examRelevance: 'Web Development',
      description: 'Build beautiful websites with live preview',
    },
    {
      id: 'javascript',
      icon: '⚡',
      name: 'JavaScript',
      subtitle: 'Class 10-12 • Modern Web',
      gradient: 'from-yellow-600 via-amber-600 to-yellow-600',
      bgGradient: 'from-yellow-50 via-amber-50 to-yellow-50',
      borderColor: 'border-yellow-400',
      challenges: 7,
      difficulty: 'Medium',
      examRelevance: 'Advanced Web',
      description: 'Learn modern programming with instant execution',
      trending: true,
    },
    {
      id: 'flowchart',
      icon: '📊',
      name: 'Flowcharts',
      subtitle: 'Foundation • Logic Building',
      gradient: 'from-emerald-600 via-teal-600 to-emerald-600',
      bgGradient: 'from-emerald-50 via-teal-50 to-emerald-50',
      borderColor: 'border-emerald-400',
      challenges: 4,
      difficulty: 'Beginner',
      examRelevance: 'All Boards',
      description: 'Visual programming with drag-and-drop builder',
    },
    {
      id: 'blockcode',
      icon: '🧩',
      name: 'Block Coding',
      subtitle: 'Beginner • Scratch-like',
      gradient: 'from-violet-600 via-purple-600 to-violet-600',
      bgGradient: 'from-violet-50 via-purple-50 to-violet-50',
      borderColor: 'border-violet-400',
      challenges: 5,
      difficulty: 'Beginner',
      examRelevance: 'Foundation',
      description: 'No-code programming for beginners',
    },
  ];

  const stats = [
    { icon: Trophy, label: 'Total Challenges', value: '37+', color: 'text-yellow-600' },
    { icon: Target, label: 'Success Rate', value: '94%', color: 'text-green-600' },
    { icon: Flame, label: 'Active Learners', value: '12.5K', color: 'text-orange-600' },
    { icon: Crown, label: 'World Rank #1', value: 'AI Race', color: 'text-purple-600' },
  ];

  const selectedLanguage = languages.find(l => l.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Animated Header */}
      <div className="bg-white border-b-2 border-blue-200 sticky top-0 z-10 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="hover:bg-blue-100 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Programming Fundamentals
                    </h1>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-orange-500" />
                      Race Against AI • Learn at Light Speed ⚡
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 shadow-lg">
                <Star className="w-4 h-4 mr-1" />
                Module 3/8
              </Badge>
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 shadow-lg animate-pulse">
                <Flame className="w-4 h-4 mr-1" />
                Hot 🔥
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100 rounded-xl p-4">
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow"
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language Selection Cards */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            Choose Your Programming Journey
          </h2>
          <p className="text-gray-600">Select a language and start racing against AI! 🚀</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {languages.map((lang, idx) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative"
            >
              <Card
                onClick={() => setActiveTab(lang.id as any)}
                className={`p-6 cursor-pointer transition-all duration-300 border-2 ${
                  activeTab === lang.id 
                    ? `${lang.borderColor} shadow-2xl ring-4 ring-blue-200` 
                    : 'border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                } bg-white overflow-hidden`}
              >
                {/* Badge Overlays */}
                {lang.popular && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                {lang.featured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                      <Award className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                {lang.trending && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${lang.bgGradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-4xl">{lang.icon}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{lang.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{lang.subtitle}</p>
                  
                  <p className="text-sm text-gray-700 mb-4 min-h-[40px]">{lang.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Challenges:
                      </span>
                      <span className="font-bold text-gray-900">{lang.challenges}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Difficulty:
                      </span>
                      <span className="font-bold text-gray-900">{lang.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Exams:
                      </span>
                      <span className="font-bold text-gray-900">{lang.examRelevance}</span>
                    </div>
                  </div>

                  {activeTab === lang.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4"
                    >
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTab === 'python' || activeTab === 'java' || activeTab === 'javascript') {
                            setShowSimpleCodePlayground(true);
                          }
                          if (activeTab === 'htmlcss') setShowSimpleHTMLCSSPlayground(true);
                          if (activeTab === 'flowchart') setShowFlowchartBuilder(true);
                          if (activeTab === 'blockcode') setShowBlockCoding(true);
                        }}
                        className={`w-full bg-gradient-to-r ${lang.gradient} hover:shadow-2xl text-white py-3 text-base font-bold rounded-lg shadow-lg transition-all duration-300`}
                      >
                        <Play className="w-5 h-5 inline mr-2" />
                        Practice
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Language Content */}
        {selectedLanguage && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Hero Section for Selected Language */}
            <Card className={`p-8 bg-gradient-to-br ${selectedLanguage.bgGradient} border-2 ${selectedLanguage.borderColor} shadow-2xl overflow-hidden relative`}>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 bg-gradient-to-br ${selectedLanguage.gradient} rounded-2xl flex items-center justify-center shadow-xl`}>
                      <span className="text-5xl">{selectedLanguage.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">
                        {selectedLanguage.name} AI Race Arena
                      </h2>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600 animate-pulse" />
                        Revolutionary 3-Window Learning System
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${selectedLanguage.gradient} bg-clip-text text-transparent mb-1`}>
                      {selectedLanguage.challenges}
                    </div>
                    <div className="text-sm text-gray-700">Progressive Challenges</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${selectedLanguage.gradient} bg-clip-text text-transparent mb-1`}>
                      ⚡
                    </div>
                    <div className="text-sm text-gray-700">AI Racing Mode</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${selectedLanguage.gradient} bg-clip-text text-transparent mb-1`}>
                      100%
                    </div>
                    <div className="text-sm text-gray-700">Instant Feedback</div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-xl mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Why Students Love This System
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: '🏃', text: 'Race AI Speed', color: 'from-red-500 to-orange-500' },
                      { icon: '🎯', text: 'Instant Validation', color: 'from-green-500 to-emerald-500' },
                      { icon: '💡', text: 'Smart Hints', color: 'from-yellow-500 to-amber-500' },
                      { icon: '⏱️', text: 'Live Timer', color: 'from-blue-500 to-cyan-500' },
                      { icon: '🏆', text: 'Score Tracking', color: 'from-purple-500 to-pink-500' },
                      { icon: '📊', text: 'Progress Stats', color: 'from-indigo-500 to-purple-500' },
                      { icon: '🎨', text: 'CLI Interface', color: 'from-teal-500 to-green-500' },
                      { icon: '⚡', text: 'Real-time Code', color: 'from-yellow-500 to-orange-500' },
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`bg-gradient-to-br ${feature.color} p-3 rounded-lg text-white text-center shadow-lg`}
                      >
                        <div className="text-2xl mb-1">{feature.icon}</div>
                        <div className="text-xs font-semibold">{feature.text}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      if (activeTab === 'python') setShowPythonPracticeArena(true);
                      if (activeTab === 'java') setShowJavaPracticeArena(true);
                      if (activeTab === 'htmlcss') setShowHTMLCSSPracticeArena(true);
                      if (activeTab === 'javascript') setShowJavaScriptPracticeArena(true);
                      if (activeTab === 'flowchart') setShowFlowchartPractice(true);
                      if (activeTab === 'blockcode') setShowBlockEditor(true);
                    }}
                    className={`w-full bg-gradient-to-r ${selectedLanguage.gradient} hover:shadow-2xl text-white py-6 text-xl font-bold rounded-xl shadow-xl transition-all duration-300`}
                  >
                    <Rocket className="w-6 h-6 mr-3" />
                    Launch {selectedLanguage.name} AI Race Arena
                    <Sparkles className="w-6 h-6 ml-3" />
                  </Button>
                </motion.div>
              </div>
            </Card>

            {/* Competition Arena Teaser */}
            <Card className="p-6 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 border-2 border-orange-300 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-orange-600" />
                    🏆 Multiplayer Competition Arena
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Compete with students worldwide • Real-time battles • Global leaderboard
                  </p>
                  <div className="flex gap-2">
                    {['🏆 Leaderboard', '⚡ Live Battles', '🎯 Skill Matching', '💬 Chat'].map((feature) => (
                      <Badge key={feature} className="bg-orange-600 text-white">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => setShowCompetitionArena(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-xl text-white px-8 py-6 text-lg font-bold"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Enter Arena
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showFlowchartBuilder && <FlowchartBuilder onClose={() => setShowFlowchartBuilder(false)} />}
      {showFlowchartPractice && <FlowchartBuilderPractice onClose={() => setShowFlowchartPractice(false)} />}
      {showBlockCoding && <BlockCodingPlatform onClose={() => setShowBlockCoding(false)} />}
      {showBlockEditor && <BlockProgrammingEditor onClose={() => setShowBlockEditor(false)} />}
      {showCompetitionArena && <CompetitionArena onClose={() => setShowCompetitionArena(false)} />}
      {showPythonPracticeArena && <PythonPracticeArena onClose={() => setShowPythonPracticeArena(false)} />}
      {showJavaPracticeArena && <JavaPracticeArena onClose={() => setShowJavaPracticeArena(false)} />}
      {showHTMLCSSPracticeArena && <HTMLCSSPracticeArena onClose={() => setShowHTMLCSSPracticeArena(false)} />}
      {showJavaScriptPracticeArena && <JavaScriptPracticeArena onClose={() => setShowJavaScriptPracticeArena(false)} />}
      {showSimpleCodePlayground && selectedLanguage && (
        <SimpleCodePlayground 
          onClose={() => setShowSimpleCodePlayground(false)} 
          language={selectedLanguage}
        />
      )}
      {showSimpleHTMLCSSPlayground && (
        <SimpleHTMLCSSPlayground 
          onClose={() => setShowSimpleHTMLCSSPlayground(false)} 
        />
      )}
    </div>
  );
}