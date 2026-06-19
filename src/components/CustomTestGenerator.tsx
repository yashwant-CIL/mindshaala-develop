import { useState } from 'react';
import { 
  ArrowLeft,
  Brain,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  Calculator,
  Atom,
  Beaker,
  BookOpen,
  ChevronRight,
  Search,
  Home,
  TrendingUp,
  BookMarked,
  FileQuestion,
  LogOut
} from 'lucide-react';

interface CustomTestGeneratorProps {
  onBack: () => void;
  onGenerateTheoryTest: () => void;
}

export function CustomTestGenerator({ onBack, onGenerateTheoryTest }: CustomTestGeneratorProps) {
  const [testType, setTestType] = useState<'ai' | 'mcq' | 'theory'>('mcq');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Physics']);
  const [selectedChapters, setSelectedChapters] = useState<{ [key: string]: string[] }>({
    Physics: [],
  });
  const [difficultyEasy, setDifficultyEasy] = useState(30);
  const [difficultyMedium, setDifficultyMedium] = useState(50);
  const [difficultyHard, setDifficultyHard] = useState(20);
  const [totalMarks, setTotalMarks] = useState(20);
  const [duration, setDuration] = useState(30);
  const [includePreviousWrong, setIncludePreviousWrong] = useState(false);
  const [randomizeOrder, setRandomizeOrder] = useState(false);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'orange' },
    { id: 'physics', name: 'Physics', icon: Atom, color: 'blue' },
    { id: 'chemistry', name: 'Chemistry', icon: Beaker, color: 'green' },
    { id: 'history', name: 'History', icon: BookOpen, color: 'purple' },
  ];

  const recentTests = [
    { name: 'Physics: Light (MCQ)', date: 'Yesterday', score: '18/20' },
    { name: 'Math: Algebra (Theory)', date: '2 days ago', status: 'Pending' },
    { name: 'Chem: Periodic Table', date: 'Dec 08', score: '25/30' },
  ];

  const physicsChapters = [
    'Force, Work, Power & Energy',
    'Light, Refraction & Lenses',
    'Sound',
    'Current Electricity',
    'Magnetism',
  ];

  const toggleSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleGenerateTest = () => {
    alert('Test generation in progress! Your custom test will be ready in a moment.');
  };

  // Calculate total percentage
  const totalPercentage = difficultyEasy + difficultyMedium + difficultyHard;
  const isValidPercentage = totalPercentage === 100;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div>
          <h1 className="text-2xl text-gray-900">Custom Test Generator</h1>
          <p className="text-sm text-gray-500">Create personalized tests to target your weak areas.</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Test Configuration */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-1">Configure Your Test</h3>
                <p className="text-xs text-gray-500 mb-4">Select subjects, chapters, and format.</p>

                {/* 1. Choose Test Type */}
                <div className="mb-5">
                  <h4 className="text-sm text-gray-900 mb-3">1. Choose Test Type</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTestType('ai')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        testType === 'ai'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Sparkles className={`w-5 h-5 mb-2 ${testType === 'ai' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-900 mb-0.5">AI Recommended</p>
                      <p className="text-xs text-gray-500">Personalized based on your learning history and performance</p>
                    </button>

                    <button
                      onClick={() => setTestType('mcq')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        testType === 'mcq'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircle className={`w-5 h-5 mb-2 ${testType === 'mcq' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-900 mb-0.5">Custom MCQ</p>
                      <p className="text-xs text-gray-500">Build your own objective test by selecting chapters</p>
                    </button>

                    <button
                      onClick={() => setTestType('theory')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        testType === 'theory'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className={`w-5 h-5 mb-2 ${testType === 'theory' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-900 mb-0.5">Theory Exam</p>
                      <p className="text-xs text-gray-500">Subjective pattern with handwritten answer uploads</p>
                    </button>
                  </div>

                  {testType === 'ai' && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-900">
                        <strong>AI Analysis:</strong> The system will analyze your learning history, previous exam performance, 
                        current educational level, and weak areas to generate an optimized test that targets your improvement areas.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Select Subject */}
                <div className="mb-5">
                  <h4 className="text-sm text-gray-900 mb-3">2. Select Subject</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {subjects.map((subject) => {
                      const Icon = subject.icon;
                      const isSelected = selectedSubjects.includes(subject.id);
                      
                      return (
                        <button
                          key={subject.id}
                          onClick={() => toggleSubject(subject.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            isSelected
                              ? `border-${subject.color}-500 bg-${subject.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                            isSelected ? `bg-${subject.color}-100` : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              isSelected ? `text-${subject.color}-600` : 'text-gray-400'
                            }`} />
                          </div>
                          <p className="text-xs text-gray-900">{subject.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Select Chapters */}
                {selectedSubjects.includes('physics') && (
                  <div className="mb-5">
                    <h4 className="text-sm text-gray-900 mb-2">3. Select Chapters (Optional)</h4>
                    <p className="text-xs text-gray-500 mb-3">Leave empty to include all chapters</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <div className="space-y-1.5">
                        {physicsChapters.map((chapter) => (
                          <label key={chapter} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700">{chapter}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Difficulty Distribution */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm text-gray-900">4. Difficulty Distribution</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isValidPercentage 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      Total: {totalPercentage}%
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-600">Easy %</label>
                        <span className="text-xs text-gray-900">{difficultyEasy}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={difficultyEasy}
                        onChange={(e) => setDifficultyEasy(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-600">Medium %</label>
                        <span className="text-xs text-gray-900">{difficultyMedium}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={difficultyMedium}
                        onChange={(e) => setDifficultyMedium(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-600">Hard %</label>
                        <span className="text-xs text-gray-900">{difficultyHard}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={difficultyHard}
                        onChange={(e) => setDifficultyHard(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                    </div>
                  </div>

                  {!isValidPercentage && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-700">
                        ⚠️ The total percentage must equal exactly 100%. Currently: {totalPercentage}%
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Additional Options */}
                <div className="mb-5">
                  <h4 className="text-sm text-gray-900 mb-3">5. Additional Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePreviousWrong}
                        onChange={(e) => setIncludePreviousWrong(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">Include previously wrong questions</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={randomizeOrder}
                        onChange={(e) => setRandomizeOrder(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">Randomize question order</span>
                    </label>
                  </div>
                </div>

                {/* 6. Total Marks */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-gray-900">6. Total Marks</h4>
                    <span className="text-sm text-blue-600">{totalMarks} Marks</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* 7. Test Duration */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-gray-900">7. Test Duration</h4>
                    <span className="text-sm text-blue-600">{duration} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5m</span>
                    <span>1h</span>
                    <span>3h</span>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateTest}
                disabled={!isValidPercentage}
                className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group ${
                  isValidPercentage
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Test</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Column - AI Info & Recent Tests */}
            <div className="space-y-5">
              {/* AI Evaluation Engine */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm">AI Evaluation Engine</h3>
                </div>

                <p className="text-xs text-blue-100 mb-4">
                  Our advanced AI model evaluates your handwritten answers for:
                </p>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Keyword recognition</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Diagram labeling</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Step-by-step logic (for Math)</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Handwriting legibility</span>
                  </li>
                </ul>

                <p className="text-xs text-blue-100">
                  <strong>Note:</strong> Evaluation typically takes 2-5 minutes after submission.
                </p>
              </div>

              {/* Recent Custom Tests */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm text-gray-900 mb-4">Recent Custom Tests</h3>

                <div className="space-y-3">
                  {recentTests.map((test, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{test.name}</p>
                        <p className="text-xs text-gray-500">{test.date}</p>
                      </div>
                      <div className="text-right">
                        {test.score ? (
                          <p className="text-sm text-gray-900">{test.score}</p>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                            {test.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm text-blue-900 mb-2">💡 Pro Tips</h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• Mix difficulty levels for better assessment</li>
                  <li>• Focus on weak chapters identified in analysis</li>
                  <li>• Take tests regularly to build exam stamina</li>
                  <li>• Review wrong answers immediately after test</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}