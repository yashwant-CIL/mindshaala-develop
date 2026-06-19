import { useState } from 'react';
import { HelpCircle, Search, Image as ImageIcon, Send, Sparkles, TrendingUp, Users, BookOpen, ThumbsUp, MessageCircle, Filter, ArrowLeft, Upload, X, Check, Clock, Star, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface DoubtResolutionHubProps {
  onBack?: () => void;
}

interface Doubt {
  id: string;
  question: string;
  subject: string;
  topic: string;
  studentName: string;
  timestamp: string;
  imageUrl?: string;
  aiAnswer: string;
  likes: number;
  replies: number;
  isResolved: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function DoubtResolutionHub({ onBack }: DoubtResolutionHubProps) {
  const [activeTab, setActiveTab] = useState<'ask' | 'browse' | 'my-doubts'>('ask');
  const [doubtText, setDoubtText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'];
  const topicsBySubject: Record<string, string[]> = {
    'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Modern Physics'],
    'Chemistry': ['Organic', 'Inorganic', 'Physical', 'Analytical'],
    'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology'],
    'Mathematics': ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics'],
    'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Networks', 'Databases']
  };

  const [communityDoubts, setCommunityDoubts] = useState<Doubt[]>([
    {
      id: '1',
      question: 'Why does water have a high specific heat capacity compared to other substances?',
      subject: 'Chemistry',
      topic: 'Physical Chemistry',
      studentName: 'Priya K.',
      timestamp: '2 hours ago',
      aiAnswer: 'Water has a high specific heat capacity (4.18 J/g°C) due to extensive hydrogen bonding between water molecules. These hydrogen bonds require significant energy to break, meaning water can absorb a lot of heat energy before its temperature rises significantly. This property is crucial for:\n\n1. Temperature regulation in living organisms\n2. Climate moderation near large bodies of water\n3. Industrial cooling systems\n\nThe strong intermolecular forces in water make it an excellent thermal buffer, which is why it\'s used in many practical applications.',
      likes: 24,
      replies: 5,
      isResolved: true,
      difficulty: 'Medium'
    },
    {
      id: '2',
      question: 'How do I solve quadratic equations when the discriminant is negative?',
      subject: 'Mathematics',
      topic: 'Algebra',
      studentName: 'Rahul M.',
      timestamp: '5 hours ago',
      aiAnswer: 'When the discriminant (b² - 4ac) is negative, the quadratic equation has no real solutions but has two complex solutions. Here\'s how to solve:\n\n1. Calculate discriminant: Δ = b² - 4ac\n2. If Δ < 0, solutions are complex numbers\n3. Use formula: x = (-b ± √Δ) / 2a where √Δ = i√|Δ|\n\nExample: x² + 2x + 5 = 0\nΔ = 4 - 20 = -16\nx = (-2 ± √(-16)) / 2 = (-2 ± 4i) / 2 = -1 ± 2i\n\nSolutions: x = -1 + 2i and x = -1 - 2i (complex conjugates)',
      likes: 18,
      replies: 3,
      isResolved: true,
      difficulty: 'Hard'
    },
    {
      id: '3',
      question: 'What is the difference between mitosis and meiosis?',
      subject: 'Biology',
      topic: 'Cell Biology',
      studentName: 'Anjali S.',
      timestamp: '1 day ago',
      aiAnswer: 'Mitosis and meiosis are both cell division processes but serve different purposes:\n\n**MITOSIS:**\n- Produces 2 identical daughter cells\n- Maintains same chromosome number (diploid → diploid)\n- Used for growth, repair, and asexual reproduction\n- One division cycle\n- Occurs in somatic (body) cells\n\n**MEIOSIS:**\n- Produces 4 non-identical daughter cells (gametes)\n- Reduces chromosome number by half (diploid → haploid)\n- Used for sexual reproduction\n- Two division cycles (Meiosis I and II)\n- Occurs only in reproductive cells\n- Introduces genetic variation through crossing over\n\nKey for exams: Mitosis = Same, Meiosis = Half!',
      likes: 32,
      replies: 7,
      isResolved: true,
      difficulty: 'Medium'
    }
  ]);

  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDoubt = async () => {
    if (!doubtText.trim()) return;

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiAnswer = `Great question! Let me help you understand this step by step.

**Analysis:**
Your question about "${doubtText}" is related to ${selectedTopic || selectedSubject}. This is a commonly tested concept in competitive exams.

**Detailed Explanation:**
1. First, let's understand the fundamental principle involved here
2. The key concept connects to [related topics in ${selectedSubject}]
3. This often appears in problems involving [practical applications]

**Step-by-Step Solution:**
- Start by identifying the given information
- Apply the relevant formula/theorem: [formula]
- Simplify and solve systematically
- Verify your answer makes physical/logical sense

**Quick Tips for Exams:**
✓ Remember the key formula: [relevant formula]
✓ Watch out for common mistakes like [typical error]
✓ Similar questions appeared in JEE 2023, NEET 2024

**Practice Problems:**
I recommend solving questions #15-20 from your textbook chapter on ${selectedTopic || selectedSubject} to reinforce this concept.

Need more clarification on any specific step? Feel free to ask!`;

      setAiResponse(aiAnswer);
      
      const newDoubt: Doubt = {
        id: Date.now().toString(),
        question: doubtText,
        subject: selectedSubject,
        topic: selectedTopic || 'General',
        studentName: 'You',
        timestamp: 'Just now',
        imageUrl: uploadedImage || undefined,
        aiAnswer: aiAnswer,
        likes: 0,
        replies: 0,
        isResolved: true,
        difficulty: 'Medium'
      };

      setMyDoubts([newDoubt, ...myDoubts]);
      setIsProcessing(false);
    }, 2500);
  };

  const handleSaveDoubt = () => {
    setDoubtText('');
    setSelectedTopic('');
    setUploadedImage(null);
    setAiResponse(null);
  };

  const filteredCommunityDoubts = communityDoubts.filter(doubt => {
    const matchesSearch = doubt.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doubt.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doubt.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || doubt.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'All' || doubt.difficulty === filterDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doubt Resolution Hub</h1>
              <p className="text-sm text-gray-500">Get instant AI-powered answers to your questions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white/80 backdrop-blur border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">My Doubts</p>
                  <p className="text-xl font-bold text-gray-900">{myDoubts.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Resolved</p>
                  <p className="text-xl font-bold text-gray-900">{myDoubts.filter(d => d.isResolved).length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Community Help</p>
                  <p className="text-xl font-bold text-gray-900">{communityDoubts.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Helped Others</p>
                  <p className="text-xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('ask')}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'ask'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ask AI Doubt
              </span>
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Browse Community ({communityDoubts.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('my-doubts')}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'my-doubts'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                My Doubts ({myDoubts.length})
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'ask' && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-white shadow-lg border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Subject
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {subjects.map(subject => (
                      <button
                        key={subject}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setSelectedTopic('');
                        }}
                        className={`p-3 rounded-lg font-medium transition-all ${
                          selectedSubject === subject
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSubject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic (Optional)
                    </label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg bg-white"
                    >
                      <option value="">Select a topic...</option>
                      {topicsBySubject[selectedSubject]?.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Question
                  </label>
                  <Textarea
                    placeholder="Type your doubt here... Be as specific as possible for better AI answers."
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {uploadedImage ? (
                        <div className="relative inline-block">
                          <img src={uploadedImage} alt="Uploaded" className="max-h-48 rounded-lg" />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setUploadedImage(null);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload image of question/diagram</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitDoubt}
                  disabled={!doubtText.trim() || isProcessing}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      AI is analyzing your doubt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get AI Answer
                    </>
                  )}
                </Button>
              </div>

              {/* AI Response */}
              <AnimatePresence>
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-6 border-t"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">AI Answer</h3>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Instant Response
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                        {aiResponse}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSaveDoubt} className="bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4 mr-2" />
                        Save & Ask Another
                      </Button>
                      <Button variant="outline">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Helpful
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask Follow-up
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        )}

        {activeTab === 'browse' && (
          <div>
            {/* Search and Filters */}
            <Card className="p-4 mb-6 bg-white shadow-sm">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search community doubts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-4 border rounded-lg bg-white"
                >
                  <option value="All">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-4 border rounded-lg bg-white"
                >
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </Card>

            {/* Community Doubts */}
            <div className="space-y-4">
              {filteredCommunityDoubts.map((doubt) => (
                <Card key={doubt.id} className="p-5 bg-white hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {doubt.studentName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{doubt.studentName}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{doubt.timestamp}</span>
                        <Badge variant="secondary" className="ml-2">{doubt.subject}</Badge>
                        <Badge className={`${
                          doubt.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          doubt.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {doubt.difficulty}
                        </Badge>
                        {doubt.isResolved && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{doubt.question}</h3>
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">AI Answer</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{doubt.aiAnswer}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{doubt.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{doubt.replies} replies</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <BookOpen className="w-4 h-4" />
                          Study this
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-doubts' && (
          <div>
            {myDoubts.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No doubts asked yet</h3>
                <p className="text-gray-500 mb-6">Start asking questions to get instant AI-powered answers!</p>
                <Button onClick={() => setActiveTab('ask')} className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask Your First Doubt
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {myDoubts.map((doubt) => (
                  <Card key={doubt.id} className="p-5 bg-white hover:shadow-lg transition-all border-l-4 border-blue-500">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{doubt.subject}</Badge>
                          {doubt.topic && <Badge className="bg-purple-100 text-purple-700">{doubt.topic}</Badge>}
                          {doubt.isResolved && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <Check className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{doubt.question}</h3>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {doubt.timestamp}
                      </span>
                    </div>
                    {doubt.imageUrl && (
                      <img src={doubt.imageUrl} alt="Question" className="max-h-32 rounded-lg mb-3" />
                    )}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">AI Answer</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{doubt.aiAnswer}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Helpful
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask Follow-up
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
