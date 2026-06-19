import { useState } from 'react';
import {
  Sparkles, Brain, Target, TrendingUp, Clock, BarChart3, 
  AlertCircle, CheckCircle, BookOpen, Activity, Award, Flame,
  ChevronLeft
} from 'lucide-react';

interface AIRecommendedConfigProps {
  onTypeChange: (type: 'ai-recommended' | 'custom-mcq' | 'theory-exam') => void;
  onStart: () => void;
}

export function AIRecommendedConfig({ onTypeChange, onStart }: AIRecommendedConfigProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [chapterSelection, setChapterSelection] = useState<'ai-auto' | 'manual'>('ai-auto');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  // Subject data with performance metrics
  const subjects = [
    {
      id: 'physics',
      name: 'Physics',
      icon: '⚛️',
      color: 'purple',
      currentLevel: 'Advanced',
      overallProgress: 78,
      lastTest: '92%',
      testsAttempted: 45,
      averageScore: 87.5,
      weakTopics: ['Electromagnetic Induction', 'Modern Physics'],
      strongTopics: ['Mechanics', 'Thermodynamics'],
      chapters: [
        { name: 'Mechanics', progress: 95, status: 'Mastered', lastScore: 94, recommended: false },
        { name: 'Thermodynamics', progress: 88, status: 'Strong', lastScore: 90, recommended: false },
        { name: 'Electromagnetism', progress: 65, status: 'Developing', lastScore: 72, recommended: true },
        { name: 'Optics', progress: 92, status: 'Mastered', lastScore: 95, recommended: false },
        { name: 'Modern Physics', progress: 58, status: 'Needs Work', lastScore: 65, recommended: true },
      ],
      aiInsight: 'Based on your recent tests, you need focused practice on Electromagnetic Induction and Modern Physics. AI will prioritize these chapters with 70% questions from weak areas.',
      suggestedQuestions: 15,
      estimatedDuration: '30 min',
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      icon: '⚗️',
      color: 'green',
      currentLevel: 'Intermediate',
      overallProgress: 72,
      lastTest: '78%',
      testsAttempted: 38,
      averageScore: 75.2,
      weakTopics: ['Organic Reactions', 'Electrochemistry'],
      strongTopics: ['Periodic Table', 'Chemical Bonding'],
      chapters: [
        { name: 'Physical Chemistry', progress: 82, status: 'Strong', lastScore: 85, recommended: false },
        { name: 'Organic Chemistry', progress: 58, status: 'Needs Work', lastScore: 62, recommended: true },
        { name: 'Inorganic Chemistry', progress: 75, status: 'Developing', lastScore: 78, recommended: false },
      ],
      aiInsight: 'Your Organic Chemistry needs improvement. AI will focus 60% questions on reaction mechanisms and name reactions.',
      suggestedQuestions: 18,
      estimatedDuration: '35 min',
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: '📐',
      color: 'orange',
      currentLevel: 'Advanced',
      overallProgress: 85,
      lastTest: '88%',
      testsAttempted: 52,
      averageScore: 86.8,
      weakTopics: ['Probability', 'Vectors'],
      strongTopics: ['Calculus', 'Algebra', 'Trigonometry'],
      chapters: [
        { name: 'Algebra', progress: 93, status: 'Mastered', lastScore: 95, recommended: false },
        { name: 'Calculus', progress: 90, status: 'Mastered', lastScore: 92, recommended: false },
        { name: 'Trigonometry', progress: 87, status: 'Strong', lastScore: 88, recommended: false },
        { name: 'Coordinate Geometry', progress: 82, status: 'Strong', lastScore: 84, recommended: false },
        { name: 'Probability', progress: 68, status: 'Developing', lastScore: 70, recommended: true },
        { name: 'Vectors', progress: 72, status: 'Developing', lastScore: 75, recommended: true },
      ],
      aiInsight: 'Strong foundation! AI will challenge you with advanced problems while strengthening Probability and Vectors (40% questions from these topics).',
      suggestedQuestions: 20,
      estimatedDuration: '40 min',
    },
    {
      id: 'biology',
      name: 'Biology',
      icon: '🧬',
      color: 'blue',
      currentLevel: 'Beginner',
      overallProgress: 62,
      lastTest: '68%',
      testsAttempted: 21,
      averageScore: 66.5,
      weakTopics: ['Genetics', 'Evolution', 'Ecology'],
      strongTopics: ['Cell Biology'],
      chapters: [
        { name: 'Cell Biology', progress: 80, status: 'Strong', lastScore: 82, recommended: false },
        { name: 'Genetics', progress: 52, status: 'Needs Work', lastScore: 58, recommended: true },
        { name: 'Evolution', progress: 48, status: 'Needs Work', lastScore: 55, recommended: true },
        { name: 'Ecology', progress: 55, status: 'Needs Work', lastScore: 60, recommended: true },
      ],
      aiInsight: 'Foundation building mode activated. AI will provide easier questions (50% easy, 40% medium) focusing on Genetics and Evolution.',
      suggestedQuestions: 12,
      estimatedDuration: '25 min',
    },
  ];

  // Overall stats
  const overallStats = {
    totalTests: 156,
    averageScore: 84.5,
    studyHours: 342,
    streak: 42,
  };

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, any> = {
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-700',
        button: 'bg-purple-600 hover:bg-purple-700',
        gradient: 'from-purple-500 to-purple-600',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700',
        button: 'bg-green-600 hover:bg-green-700',
        gradient: 'from-green-500 to-green-600',
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-700',
        button: 'bg-orange-600 hover:bg-orange-700',
        gradient: 'from-orange-500 to-orange-600',
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700',
        gradient: 'from-blue-500 to-blue-600',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleChapterToggle = (chapterName: string) => {
    if (selectedChapters.includes(chapterName)) {
      setSelectedChapters(selectedChapters.filter(c => c !== chapterName));
    } else {
      setSelectedChapters([...selectedChapters, chapterName]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Recommended Test</h2>
            <p className="text-sm text-gray-600">AI analyzes your performance to create the perfect test</p>
          </div>
        </div>
        <button
          onClick={() => onTypeChange('custom-mcq')}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Change Test Type
        </button>
      </div>

      {!selectedSubject ? (
        <>
          {/* Overall Performance */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Your Overall Performance
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{overallStats.totalTests}</div>
                <div className="text-xs text-gray-600">Tests Taken</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{overallStats.averageScore}%</div>
                <div className="text-xs text-gray-600">Avg Score</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{overallStats.studyHours}h</div>
                <div className="text-xs text-gray-600">Study Time</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Flame className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{overallStats.streak}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">1. Select Subject</h3>
            <div className="grid grid-cols-2 gap-4">
              {subjects.map((subject) => {
                const colors = getColorClasses(subject.color);
                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 text-left hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{subject.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-gray-900">{subject.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${colors.badge}`}>
                            {subject.currentLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>{subject.testsAttempted} tests</span>
                          <span>•</span>
                          <span>Avg: {subject.averageScore}%</span>
                          <span>•</span>
                          <span>Last: {subject.lastTest}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className={`text-xs font-bold ${colors.text}`}>{subject.overallProgress}%</span>
                      </div>
                      <div className="bg-white rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full`}
                          style={{ width: `${subject.overallProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">Focus:</span>
                      <div className="flex flex-wrap gap-1">
                        {subject.weakTopics.slice(0, 2).map((topic, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : selectedSubjectData ? (
        <>
          {/* Subject Detail */}
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Subject Selection</span>
          </button>

          {/* Subject Header */}
          <div className={`${getColorClasses(selectedSubjectData.color).bg} border-2 ${getColorClasses(selectedSubjectData.color).border} rounded-xl p-5 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{selectedSubjectData.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedSubjectData.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getColorClasses(selectedSubjectData.color).badge}`}>
                    {selectedSubjectData.currentLevel}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedSubjectData.testsAttempted} Tests</span>
                  <span>•</span>
                  <span>Avg: {selectedSubjectData.averageScore}%</span>
                  <span>•</span>
                  <span>Last: {selectedSubjectData.lastTest}</span>
                </div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">AI Analysis & Strategy</h4>
                  <p className="text-sm text-purple-100">{selectedSubjectData.aiInsight}</p>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span>📝 {selectedSubjectData.suggestedQuestions} Questions</span>
                    <span>⏱️ {selectedSubjectData.estimatedDuration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Selection Mode */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">2. Chapter Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setChapterSelection('ai-auto')}
                className={`p-5 rounded-xl border-2 transition-all ${
                  chapterSelection === 'ai-auto'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    chapterSelection === 'ai-auto' ? 'border-purple-600' : 'border-gray-300'
                  }`}>
                    {chapterSelection === 'ai-auto' && (
                      <div className="w-3 h-3 bg-purple-600 rounded-full" />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900">AI Auto-Select (Recommended)</h4>
                </div>
                <p className="text-sm text-gray-600 ml-8">
                  AI will automatically select chapters based on your weak areas and performance history
                </p>
              </button>

              <button
                onClick={() => setChapterSelection('manual')}
                className={`p-5 rounded-xl border-2 transition-all ${
                  chapterSelection === 'manual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    chapterSelection === 'manual' ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {chapterSelection === 'manual' && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900">Manually Select Chapters</h4>
                </div>
                <p className="text-sm text-gray-600 ml-8">
                  Choose specific chapters you want to practice
                </p>
              </button>
            </div>
          </div>

          {/* Manual Chapter Selection */}
          {chapterSelection === 'manual' && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Select Chapters</h3>
              <div className="space-y-2">
                {selectedSubjectData.chapters.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChapterToggle(chapter.name)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedChapters.includes(chapter.name)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedChapters.includes(chapter.name) 
                          ? 'border-blue-600 bg-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {selectedChapters.includes(chapter.name) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{chapter.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            chapter.status === 'Mastered' ? 'bg-green-100 text-green-700' :
                            chapter.status === 'Strong' ? 'bg-blue-100 text-blue-700' :
                            chapter.status === 'Developing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {chapter.status}
                          </span>
                          {chapter.recommended && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                              AI Recommended
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>Progress: {chapter.progress}%</span>
                          <span>•</span>
                          <span>Last Score: {chapter.lastScore}%</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Performance Standing */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Performance Standing - {selectedSubjectData.name} (AI Context)
            </h3>
            
            {/* Subject Performance Overview */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 mb-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                {selectedSubjectData.name} Performance History
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <Target className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-gray-900">{selectedSubjectData.testsAttempted}</div>
                  <div className="text-xs text-gray-600">Tests</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-gray-900">{selectedSubjectData.averageScore}%</div>
                  <div className="text-xs text-gray-600">Avg Score</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <Award className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-gray-900">{selectedSubjectData.lastTest}</div>
                  <div className="text-xs text-gray-600">Last Test</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <BarChart3 className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-gray-900">{selectedSubjectData.overallProgress}%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Left: Chapter Progress */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Chapter-wise Assessment
                </h4>
                <div className="space-y-2">
                  {selectedSubjectData.chapters.map((chapter, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">{chapter.name}</span>
                        <span className="text-xs text-gray-600">{chapter.progress}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            chapter.status === 'Mastered' ? 'bg-green-500' :
                            chapter.status === 'Strong' ? 'bg-blue-500' :
                            chapter.status === 'Developing' ? 'bg-yellow-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${chapter.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Weak vs Strong */}
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                  <h4 className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Weak Areas (AI Focus)
                  </h4>
                  <div className="space-y-1">
                    {selectedSubjectData.weakTopics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-orange-900">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <div className="text-xs text-orange-800">
                      <strong>AI Strategy:</strong> Prioritize these topics with higher question density
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                  <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strong Areas
                  </h4>
                  <div className="space-y-1">
                    {selectedSubjectData.strongTopics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-green-900">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="text-xs text-green-800">
                      <strong>AI Strategy:</strong> Include fewer revision questions from these
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Test Button */}
          <div className="flex justify-end">
            <button
              onClick={onStart}
              disabled={chapterSelection === 'manual' && selectedChapters.length === 0}
              className={`px-8 py-4 bg-gradient-to-r ${getColorClasses(selectedSubjectData.color).gradient} text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Test</span>
            </button>
          </div>

          {chapterSelection === 'manual' && selectedChapters.length === 0 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <strong>Please select at least one chapter</strong> to generate the test, or switch to AI Auto-Select mode.
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}