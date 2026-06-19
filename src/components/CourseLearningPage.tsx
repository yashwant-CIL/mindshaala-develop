import { useState } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Headphones,
  CheckCircle,
  Lock,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface CourseLearningPageProps {
  onBack: () => void;
}

interface Topic {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  locked?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
}

const courseContent: Chapter[] = [
  {
    id: 'physics',
    title: 'Physics',
    topics: [
      { id: 'p1', title: 'Force, Work, Power & Energy', duration: '3h 35m', completed: true },
      { id: 'p2', title: 'Light, Refraction & Lenses', duration: '2h 48m' },
      { id: 'p3', title: 'Sound', duration: '1h 52m', locked: true },
    ],
  },
  {
    id: 'chemistry',
    title: 'Chemistry',
    topics: [
      { id: 'c1', title: 'Periodic Properties', duration: '2h 15m', locked: true },
      { id: 'c2', title: 'Chemical Bonding', duration: '3h 20m', locked: true },
      { id: 'c3', title: 'Mole Concept', duration: '2h 45m', locked: true },
    ],
  },
];

export function CourseLearningPage({ onBack }: CourseLearningPageProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'audio'>('video');
  const [expandedChapters, setExpandedChapters] = useState<string[]>(['physics']);
  const [selectedTopic, setSelectedTopic] = useState<string>('p2');
  const [sessionTime, setSessionTime] = useState('0m 3s');

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const getCurrentTopic = () => {
    for (const chapter of courseContent) {
      const topic = chapter.topics.find(t => t.id === selectedTopic);
      if (topic) return topic;
    }
    return courseContent[0].topics[0];
  };

  const currentTopic = getCurrentTopic();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Course Content */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </button>
          <h2 className="text-sm text-gray-900">ICSE Physics Class 10</h2>
          <p className="text-xs text-gray-500 mt-0.5">Continue where you left off</p>
        </div>

        {/* Course Content Tree */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-xs text-gray-500 mb-2 px-2">COURSE CONTENT</h3>
          
          <div className="space-y-1">
            {courseContent.map((chapter) => {
              const isExpanded = expandedChapters.includes(chapter.id);
              
              return (
                <div key={chapter.id}>
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>{chapter.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {chapter.topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => !topic.locked && setSelectedTopic(topic.id)}
                          disabled={topic.locked}
                          className={`w-full flex items-start gap-2 px-2 py-2 text-xs rounded-md transition-colors ${
                            selectedTopic === topic.id
                              ? 'bg-blue-50 text-blue-700'
                              : topic.locked
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="mt-0.5">
                            {topic.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : topic.locked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="leading-tight">{topic.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{topic.duration}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Course Progress</span>
            <span>73% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '73%' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-gray-900">ICSE Physics Class 10</h1>
              <p className="text-sm text-gray-500">Continue where you left off</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span>Session Time: {sessionTime}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className=" mx-auto">
            {/* Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'video'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Notes</span>
                </button>
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'audio'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Audio</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" />
                <span>Repetitions: 2</span>
              </div>
            </div>

            {/* Video Player */}
            {activeTab === 'video' && (
              <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <p className="text-white text-lg">Playing: {currentTopic.title}</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-white text-sm">
                    <div className="w-64 bg-white/20 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full" style={{ width: '35%' }} />
                    </div>
                    <span className="text-xs">12:30 / 35:45</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes View */}
            {activeTab === 'notes' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg text-gray-900 mb-4">{currentTopic.title} - Study Notes</h2>
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-gray-900">Introduction to Refraction</h3>
                  <p className="text-gray-700">
                    Refraction is the bending of light as it passes from one transparent medium to another. 
                    This phenomenon occurs because light travels at different speeds in different media.
                  </p>
                  
                  <h3 className="text-gray-900 mt-4">Laws of Refraction</h3>
                  <ul className="text-gray-700">
                    <li>The incident ray, refracted ray, and normal all lie in the same plane</li>
                    <li>The ratio of sine of angle of incidence to sine of angle of refraction is constant (Snell's Law)</li>
                  </ul>

                  <h3 className="text-gray-900 mt-4">Key Formula</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-gray-900">n₁ sin θ₁ = n₂ sin θ₂</p>
                    <p className="text-sm text-gray-600 mt-2">Where n is the refractive index and θ is the angle</p>
                  </div>

                  <h3 className="text-gray-900 mt-4">Lenses</h3>
                  <p className="text-gray-700">
                    A lens is a transparent optical device that focuses or disperses light rays by means of refraction.
                  </p>
                  <ul className="text-gray-700">
                    <li><strong>Convex Lens:</strong> Converges light rays to a focal point</li>
                    <li><strong>Concave Lens:</strong> Diverges light rays away from a focal point</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Audio View */}
            {activeTab === 'audio' && (
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-12 mb-6 text-white text-center">
                <div className="max-w-md mx-auto">
                  <Headphones className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl mb-2">{currentTopic.title}</h2>
                  <p className="text-blue-100 mb-6">Audio Lecture</p>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-6">
                    <div className="flex items-center justify-center gap-4">
                      <button className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors">
                        <Play className="w-6 h-6 ml-1" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div className="bg-white h-1.5 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>15:20</span>
                      <span>34:10</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter Assessment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">Chapter Assessment</h3>
                  <p className="text-sm text-gray-600">
                    Test your understanding of "Light, Refraction & Lenses"
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  Pending
                </span>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>10 Questions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>20 Mins</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  Complete all video and notes sections to unlock the full potential of this assessment. 
                  Score above 80% to proceed to the next chapter.
                </p>
              </div>

              <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Take Assessment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
