import { useState } from 'react';
import { 
  Search,
  Download,
  Share2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Award
} from 'lucide-react';

interface AssessmentDashboardProps {
  onBack: () => void;
}

interface PastTest {
  id: string;
  subject: string;
  title: string;
  date: string;
  score: string;
  maxScore: string;
  status: 'Evaluated' | 'Pending';
  tag: string;
}

export function AssessmentDashboard({ onBack }: AssessmentDashboardProps) {
  const [selectedTest, setSelectedTest] = useState<string | null>('test1');
  const [searchQuery, setSearchQuery] = useState('');

  const pastTests: PastTest[] = [
    {
      id: 'test1',
      subject: 'Physics',
      title: 'Physics: Light & Sound (Prelims)',
      date: 'Dec 20, 2024',
      score: '68',
      maxScore: '80',
      status: 'Evaluated',
      tag: 'Physics'
    },
    {
      id: 'test2',
      subject: 'Mathematics',
      title: 'Maths: Commercial Mathematics',
      date: 'Dec 18, 2024',
      score: '35',
      maxScore: '40',
      status: 'Evaluated',
      tag: 'Mathematics'
    },
    {
      id: 'test3',
      subject: 'Chemistry',
      title: 'Chemistry: Periodic Table',
      date: 'Dec 10, 2024',
      score: '72',
      maxScore: '80',
      status: 'Evaluated',
      tag: 'Chemistry'
    },
    {
      id: 'test4',
      subject: 'History',
      title: 'History: The National Movement',
      date: 'Dec 05, 2024',
      score: '48',
      maxScore: '50',
      status: 'Evaluated',
      tag: 'History'
    },
  ];

  const selectedTestData = {
    title: 'Physics: Light & Sound (Prelims)',
    subtitle: 'Detailed performance analysis & retention insights.',
    totalScore: 68,
    maxScore: 80,
    accuracy: 85,
    percentileBetter: 75,
    timeManagement: '1h 45m',
    timeAllotted: '2h 00m',
    classPercentile: 92,
    questionAnalysis: {
      total: 40,
      correct: 34,
      incorrect: 4,
      skipped: 2,
    },
    retentionCurve: [
      { day: 'Day 1', retention: 100 },
      { day: 'Day 3', retention: 85 },
      { day: 'Day 7', retention: 72 },
      { day: 'Day 14', retention: 65 },
      { day: 'Day 30', retention: 58 },
    ],
    topicBreakdown: [
      { topic: 'Refraction', score: 15, max: 20 },
      { topic: 'Lenses', score: 18, max: 20 },
      { topic: 'Spectrum', score: 15, max: 15 },
      { topic: 'Echoes & Vibrations', score: 20, max: 25 },
    ],
    weakAreas: [
      {
        title: "Snell's Law Application",
        description: "You struggled with numericals involving refractive index."
      },
      {
        title: "Lens Formula Sign Convention",
        description: "2 incorrect answers were due to sign errors."
      }
    ],
    strongConcepts: [
      {
        title: "Ray Diagrams",
        description: "Perfect score in image formation questions."
      },
      {
        title: "Nature of Light",
        description: "Strong theoretical understanding shown."
      }
    ]
  };

  const filteredTests = pastTests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Past Tests */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-xs text-gray-900 mb-2">Past Tests</h3>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredTests.map((test) => (
            <button
              key={test.id}
              onClick={() => setSelectedTest(test.id)}
              className={`w-full p-2.5 rounded-md border transition-all text-left ${
                selectedTest === test.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  test.tag === 'Physics' ? 'bg-purple-100 text-purple-700' :
                  test.tag === 'Mathematics' ? 'bg-orange-100 text-orange-700' :
                  test.tag === 'Chemistry' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {test.tag}
                </span>
                <span className="text-xs text-gray-500">{test.date}</span>
              </div>
              
              <p className="text-xs text-gray-900 mb-1.5">{test.title}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Score: {test.score}/{test.maxScore}</span>
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                  {test.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Test Analysis */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className=" mx-auto">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg text-gray-900">{selectedTestData.title}</h1>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      AI Evaluated
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedTestData.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs">
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Total Score</p>
                <p className="text-2xl text-blue-600 mb-0.5">
                  {selectedTestData.totalScore} <span className="text-sm text-gray-500">/ {selectedTestData.maxScore}</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Accuracy</p>
                <p className="text-2xl text-gray-900 mb-0.5">{selectedTestData.accuracy}%</p>
                <p className="text-xs text-gray-500">Better than {selectedTestData.percentileBetter}%</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Time</p>
                <p className="text-2xl text-gray-900 mb-0.5">{selectedTestData.timeManagement}</p>
                <p className="text-xs text-gray-500">vs {selectedTestData.timeAllotted}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-orange-700 mb-1">Percentile</p>
                <p className="text-2xl text-orange-600 mb-0.5">{selectedTestData.classPercentile}th</p>
                <p className="text-xs text-orange-600">Top Performer!</p>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Question Analysis */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h3 className="text-xs text-gray-900 mb-3">Question Analysis</h3>
                
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {/* Correct - Green */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="20"
                        strokeDasharray={`${(selectedTestData.questionAnalysis.correct / selectedTestData.questionAnalysis.total) * 251.2} 251.2`}
                      />
                      {/* Incorrect - Red */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray={`${(selectedTestData.questionAnalysis.incorrect / selectedTestData.questionAnalysis.total) * 251.2} 251.2`}
                        strokeDashoffset={`-${(selectedTestData.questionAnalysis.correct / selectedTestData.questionAnalysis.total) * 251.2}`}
                      />
                      {/* Skipped - Gray */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="20"
                        strokeDasharray={`${(selectedTestData.questionAnalysis.skipped / selectedTestData.questionAnalysis.total) * 251.2} 251.2`}
                        strokeDashoffset={`-${((selectedTestData.questionAnalysis.correct + selectedTestData.questionAnalysis.incorrect) / selectedTestData.questionAnalysis.total) * 251.2}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-2xl text-gray-900">{selectedTestData.questionAnalysis.total}</p>
                      <p className="text-xs text-gray-500">Questions</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-gray-600">Correct</span>
                    </div>
                    <p className="text-gray-900">{selectedTestData.questionAnalysis.correct}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-xs text-gray-600">Incorrect</span>
                    </div>
                    <p className="text-gray-900">{selectedTestData.questionAnalysis.incorrect}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-xs text-gray-600">Skipped</span>
                    </div>
                    <p className="text-gray-900">{selectedTestData.questionAnalysis.skipped}</p>
                  </div>
                </div>
              </div>

              {/* Retention Curve Analysis */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                  <h3 className="text-xs text-gray-900">Retention Curve Analysis</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">AI prediction of memory retention over time.</p>

                <div className="relative h-36">
                  <svg viewBox="0 0 300 150" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="30" y1="20" x2="30" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="30" y1="130" x2="290" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Y-axis labels */}
                    <text x="10" y="25" fontSize="10" fill="#9ca3af">100%</text>
                    <text x="15" y="58" fontSize="10" fill="#9ca3af">75%</text>
                    <text x="15" y="91" fontSize="10" fill="#9ca3af">50%</text>
                    <text x="15" y="124" fontSize="10" fill="#9ca3af">25%</text>

                    {/* Retention curve - solid line */}
                    <polyline
                      points="30,20 90,35 150,50 210,60 270,68"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                    />

                    {/* Predicted curve - dashed line */}
                    <polyline
                      points="270,68 290,75"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      opacity="0.5"
                    />

                    {/* Data points */}
                    {selectedTestData.retentionCurve.map((point, idx) => {
                      const x = 30 + (idx * 60);
                      const y = 130 - ((point.retention / 100) * 110);
                      return (
                        <circle key={idx} cx={x} cy={y} r="3" fill="#8b5cf6" />
                      );
                    })}

                    {/* X-axis labels */}
                    <text x="20" y="145" fontSize="10" fill="#9ca3af">Day 1</text>
                    <text x="80" y="145" fontSize="10" fill="#9ca3af">Day 3</text>
                    <text x="140" y="145" fontSize="10" fill="#9ca3af">Day 7</text>
                    <text x="195" y="145" fontSize="10" fill="#9ca3af">Day 14</text>
                    <text x="255" y="145" fontSize="10" fill="#9ca3af">Day 30</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Topic-wise Breakdown */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
              <h3 className="text-xs text-gray-900 mb-3 flex items-center gap-1.5">
                📊 Topic-wise Breakdown
              </h3>

              <div className="space-y-2">
                {selectedTestData.topicBreakdown.map((topic, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700">{topic.topic}</span>
                      <span className="text-xs text-gray-600">{topic.score}/{topic.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${(topic.score / topic.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak & Strong Areas */}
            <div className="grid grid-cols-2 gap-4">
              {/* Weak Areas */}
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-1.5 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs text-red-900">Weak Areas</h3>
                </div>

                <div className="space-y-2">
                  {selectedTestData.weakAreas.map((area, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-red-900 mb-0.5">• {area.title}</p>
                      <p className="text-xs text-red-700 ml-2">{area.description}</p>
                    </div>
                  ))}
                  <button className="text-xs text-red-600 hover:text-red-700 mt-2">
                    View Practice →
                  </button>
                </div>
              </div>

              {/* Strong Concepts */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-1.5 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h3 className="text-xs text-green-900">Strong Concepts</h3>
                </div>

                <div className="space-y-2">
                  {selectedTestData.strongConcepts.map((concept, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-green-900 mb-0.5">• {concept.title}</p>
                      <p className="text-xs text-green-700 ml-2">{concept.description}</p>
                    </div>
                  ))}
                  <button className="text-xs text-green-600 hover:text-green-700 mt-2">
                    Take Quiz →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}