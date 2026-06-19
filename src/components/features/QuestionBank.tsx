import { useState } from 'react';
import { 
  Search, 
  Filter,
  BookOpen,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Star,
  TrendingUp,
  Play,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';

export function QuestionBank() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const types = ['All', 'MCQ', 'True/False', 'Numerical', 'Theory'];

  const stats = {
    totalQuestions: 50000,
    attempted: 1250,
    correct: 1025,
    accuracy: 82,
    streak: 5
  };

  const questionCategories = [
    {
      id: 1,
      subject: 'Physics',
      chapter: 'Newton\'s Laws of Motion',
      questions: 450,
      completed: 120,
      accuracy: 85,
      difficulty: 'Medium',
      recommended: true,
      icon: '⚛️'
    },
    {
      id: 2,
      subject: 'Physics',
      chapter: 'Light & Optics',
      questions: 380,
      completed: 45,
      accuracy: 62,
      difficulty: 'Hard',
      recommended: true,
      icon: '🔬'
    },
    {
      id: 3,
      subject: 'Chemistry',
      chapter: 'Periodic Table',
      questions: 520,
      completed: 200,
      accuracy: 78,
      difficulty: 'Easy',
      recommended: false,
      icon: '🧪'
    },
    {
      id: 4,
      subject: 'Mathematics',
      chapter: 'Quadratic Equations',
      questions: 680,
      completed: 150,
      accuracy: 71,
      difficulty: 'Medium',
      recommended: true,
      icon: '📐'
    },
    {
      id: 5,
      subject: 'Biology',
      chapter: 'Human Physiology',
      questions: 420,
      completed: 95,
      accuracy: 88,
      difficulty: 'Medium',
      recommended: false,
      icon: '🧬'
    },
    {
      id: 6,
      subject: 'Physics',
      chapter: 'Thermodynamics',
      questions: 340,
      completed: 180,
      accuracy: 91,
      difficulty: 'Hard',
      recommended: false,
      icon: '🌡️'
    }
  ];

  const previousYearPapers = [
    { year: 2024, exam: 'MHT-CET', questions: 150, attempted: false },
    { year: 2023, exam: 'MHT-CET', questions: 150, attempted: true, score: 125 },
    { year: 2022, exam: 'MHT-CET', questions: 150, attempted: true, score: 118 },
    { year: 2024, exam: 'JEE Mains', questions: 90, attempted: false },
    { year: 2023, exam: 'JEE Mains', questions: 90, attempted: false }
  ];

  const practiceMode = [
    {
      id: 1,
      title: 'Quick Practice',
      description: '10 random questions from selected topics',
      duration: '15 min',
      icon: Zap,
      color: 'yellow'
    },
    {
      id: 2,
      title: 'Timed Practice',
      description: 'Race against time with 30 questions',
      duration: '30 min',
      icon: Clock,
      color: 'blue'
    },
    {
      id: 3,
      title: 'Adaptive Practice',
      description: 'AI adjusts difficulty based on performance',
      duration: 'Flexible',
      icon: Brain,
      color: 'purple'
    },
    {
      id: 4,
      title: 'Weak Areas Focus',
      description: 'Target your weakest topics only',
      duration: '20 min',
      icon: Target,
      color: 'red'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl mb-1">Question Bank</h2>
            <p className="text-sm text-blue-100">Unlimited practice questions from all subjects</p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 mb-1">Total Questions</p>
            <p className="text-xl">{stats.totalQuestions.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 mb-1">Attempted</p>
            <p className="text-xl">{stats.attempted.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 mb-1">Correct</p>
            <p className="text-xl">{stats.correct.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 mb-1">Accuracy</p>
            <p className="text-xl">{stats.accuracy}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-blue-100 mb-1">Streak 🔥</p>
            <p className="text-xl">{stats.streak} days</p>
          </div>
        </div>
      </div>

      {/* Practice Modes */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Choose Practice Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {practiceMode.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                className={`p-4 rounded-lg border-2 border-${mode.color}-200 hover:border-${mode.color}-400 bg-${mode.color}-50 transition-all text-left group`}
              >
                <div className={`w-10 h-10 bg-${mode.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${mode.color}-600`} />
                </div>
                <h4 className="text-sm text-gray-900 mb-1">{mode.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{mode.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{mode.duration}</span>
                  <ChevronRight className={`w-4 h-4 text-${mode.color}-600 group-hover:translate-x-1 transition-transform`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject.toLowerCase()}>{subject}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff.toLowerCase()}>{diff}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Question Categories */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-900">Browse by Chapter</h3>
              <button className="text-xs text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {questionCategories.map((category) => (
                <div 
                  key={category.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    category.recommended 
                      ? 'border-purple-200 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm text-gray-900">{category.chapter}</h4>
                          {category.recommended && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{category.subject}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(category.difficulty)}`}>
                      {category.difficulty}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Questions</p>
                      <p className="text-sm text-gray-900">{category.questions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-sm text-gray-900">{category.completed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Accuracy</p>
                      <p className="text-sm text-gray-900">{category.accuracy}%</p>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(category.completed / category.questions) * 100}%` }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                      <Play className="w-4 h-4" />
                      Practice Now
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Previous Year Papers */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Previous Year Papers
            </h3>
            <div className="space-y-2">
              {previousYearPapers.map((paper, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-900">{paper.exam}</p>
                      <p className="text-xs text-gray-500">{paper.year}</p>
                    </div>
                    {paper.attempted ? (
                      <div className="text-right">
                        <p className="text-sm text-green-600">{paper.score}/{paper.questions}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                    ) : (
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                        Start
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{paper.questions} Questions</p>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4">Today's Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Questions Solved</span>
                <span className="text-sm text-gray-900">45 / 50</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '90%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Accuracy Today</span>
                <span className="text-sm text-green-600">88%</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Time Spent</span>
                <span className="text-sm text-purple-600">1h 25m</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm text-yellow-900 mb-2">💡 Pro Tip</h4>
            <p className="text-xs text-yellow-800">
              Practice 20-30 questions daily to build consistency. Mix easy and hard questions for balanced learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
