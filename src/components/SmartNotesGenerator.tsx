import { useState } from 'react';
import { Brain, BookOpen, Image, Sparkles, Download, Bookmark, Share2, Plus, Zap, Target, ChevronDown, ChevronRight, Lightbulb, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface SmartNotesGeneratorProps {
  onBack?: () => void;
}

interface Note {
  id: string;
  topic: string;
  subject: string;
  summary: string;
  keyPoints: string[];
  mindMap: {
    central: string;
    branches: { title: string; subtopics: string[] }[];
  };
  flashcards: { question: string; answer: string }[];
  createdAt: string;
}

export function SmartNotesGenerator({ onBack }: SmartNotesGeneratorProps) {
  const [searchTopic, setSearchTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<Note | null>(null);
  const [savedNotes, setSavedNotes] = useState<Note[]>([
    {
      id: '1',
      topic: 'Photosynthesis',
      subject: 'Biology',
      summary: 'Photosynthesis is the process by which green plants convert light energy into chemical energy stored in glucose. This occurs in chloroplasts using chlorophyll.',
      keyPoints: [
        'Takes place in chloroplasts of plant cells',
        'Requires light energy, water, and carbon dioxide',
        'Produces glucose and oxygen as byproducts',
        'Light-dependent and light-independent reactions',
        'Critical for oxygen production on Earth'
      ],
      mindMap: {
        central: 'Photosynthesis',
        branches: [
          {
            title: 'Requirements',
            subtopics: ['Light Energy', 'Water (H₂O)', 'Carbon Dioxide (CO₂)', 'Chlorophyll']
          },
          {
            title: 'Process',
            subtopics: ['Light Reactions', 'Calvin Cycle', 'Electron Transport']
          },
          {
            title: 'Products',
            subtopics: ['Glucose (C₆H₁₂O₆)', 'Oxygen (O₂)', 'Energy Storage']
          }
        ]
      },
      flashcards: [
        {
          question: 'What is the primary function of chlorophyll in photosynthesis?',
          answer: 'Chlorophyll absorbs light energy (mainly blue and red wavelengths) and converts it into chemical energy to drive the photosynthesis process.'
        },
        {
          question: 'What is the overall equation for photosynthesis?',
          answer: '6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂'
        }
      ],
      createdAt: '2024-01-10'
    }
  ]);
  const [activeTab, setActiveTab] = useState<'summary' | 'mindmap' | 'flashcards'>('summary');
  const [selectedFlashcard, setSelectedFlashcard] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const subjects = ['All', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'];

  const handleGenerateNotes = async () => {
    if (!searchTopic.trim()) return;

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const newNote: Note = {
        id: Date.now().toString(),
        topic: searchTopic,
        subject: selectedSubject === 'All' ? 'Physics' : selectedSubject,
        summary: `${searchTopic} is a fundamental concept that plays a crucial role in understanding advanced topics. This comprehensive overview covers the essential principles, applications, and real-world implications. The concept connects multiple subtopics and provides a foundation for deeper learning in this subject area.`,
        keyPoints: [
          `Core principle: ${searchTopic} involves systematic study of underlying mechanisms`,
          'Historical development and key discoveries in this field',
          'Mathematical formulations and theoretical frameworks',
          'Practical applications in technology and industry',
          'Common misconceptions and how to avoid them',
          'Connections to other related topics and concepts'
        ],
        mindMap: {
          central: searchTopic,
          branches: [
            {
              title: 'Fundamental Concepts',
              subtopics: ['Basic Principles', 'Key Definitions', 'Core Theory']
            },
            {
              title: 'Applications',
              subtopics: ['Real World Uses', 'Technology', 'Industry Examples']
            },
            {
              title: 'Advanced Topics',
              subtopics: ['Complex Scenarios', 'Research Areas', 'Future Trends']
            },
            {
              title: 'Practice & Problems',
              subtopics: ['Sample Questions', 'Common Mistakes', 'Exam Tips']
            }
          ]
        },
        flashcards: [
          {
            question: `What is the primary concept behind ${searchTopic}?`,
            answer: `${searchTopic} represents a fundamental principle that explains how specific mechanisms work in this domain. It provides the foundation for understanding more complex topics.`
          },
          {
            question: `What are the main applications of ${searchTopic}?`,
            answer: 'This concept finds applications in various fields including technology, engineering, and research. It helps solve real-world problems and drives innovation.'
          },
          {
            question: `Why is ${searchTopic} important for competitive exams?`,
            answer: 'This topic frequently appears in exams like JEE, NEET, and MHT-CET. Understanding it deeply helps solve both theoretical and application-based questions.'
          }
        ],
        createdAt: new Date().toISOString().split('T')[0]
      };

      setGeneratedNote(newNote);
      setIsGenerating(false);
      setActiveTab('summary');
    }, 2000);
  };

  const handleSaveNote = () => {
    if (generatedNote) {
      setSavedNotes([generatedNote, ...savedNotes]);
      setGeneratedNote(null);
      setSearchTopic('');
    }
  };

  const filteredNotes = selectedSubject === 'All' 
    ? savedNotes 
    : savedNotes.filter(note => note.subject === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Smart Notes Generator</h1>
              <p className="text-sm text-gray-500">Generate comprehensive study notes with AI</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white/80 backdrop-blur border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Notes</p>
                  <p className="text-xl font-bold text-gray-900">{savedNotes.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Flashcards</p>
                  <p className="text-xl font-bold text-gray-900">{savedNotes.reduce((sum, note) => sum + note.flashcards.length, 0)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Topics Covered</p>
                  <p className="text-xl font-bold text-gray-900">{savedNotes.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Key Points</p>
                  <p className="text-xl font-bold text-gray-900">{savedNotes.reduce((sum, note) => sum + note.keyPoints.length, 0)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search Section */}
          <Card className="p-6 bg-white/90 backdrop-blur border-gray-200 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter any topic... (e.g., 'Quadratic Equations', 'Newton's Laws', 'Cell Division')"
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  className="h-12 text-base"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateNotes()}
                />
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 border rounded-lg bg-white text-sm"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <Button
                onClick={handleGenerateNotes}
                disabled={!searchTopic.trim() || isGenerating}
                className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Notes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Generated Note Preview */}
        <AnimatePresence>
          {generatedNote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="p-6 bg-white border-2 border-purple-200 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{generatedNote.topic}</h2>
                      <Badge variant="secondary" className="mt-1">{generatedNote.subject}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button onClick={handleSaveNote} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save Note
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'summary'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Summary & Key Points
                  </button>
                  <button
                    onClick={() => setActiveTab('mindmap')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'mindmap'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Mind Map
                  </button>
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'flashcards'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Flashcards ({generatedNote.flashcards.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {activeTab === 'summary' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                        <p className="text-gray-700 leading-relaxed">{generatedNote.summary}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Key Points to Remember</h3>
                        <div className="space-y-2">
                          {generatedNote.keyPoints.map((point, index) => (
                            <div key={index} className="flex gap-3 items-start">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                              </div>
                              <p className="text-gray-700 flex-1">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'mindmap' && (
                    <div className="flex flex-col items-center py-6">
                      {/* Central Topic */}
                      <div className="w-48 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mb-8">
                        <span className="text-white font-bold text-center px-4">{generatedNote.mindMap.central}</span>
                      </div>

                      {/* Branches */}
                      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                        {generatedNote.mindMap.branches.map((branch, branchIndex) => (
                          <div key={branchIndex} className="space-y-3">
                            <div className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold text-center shadow-md">
                              {branch.title}
                            </div>
                            <div className="space-y-2 pl-4">
                              {branch.subtopics.map((subtopic, subIndex) => (
                                <div key={subIndex} className="p-2 bg-gray-100 rounded-lg text-sm text-gray-700 border-l-4 border-purple-400">
                                  {subtopic}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'flashcards' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-4">Click on any flashcard to reveal the answer</p>
                      <div className="grid gap-4">
                        {generatedNote.flashcards.map((card, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              if (selectedFlashcard === index) {
                                setShowAnswer(!showAnswer);
                              } else {
                                setSelectedFlashcard(index);
                                setShowAnswer(false);
                              }
                            }}
                            className="cursor-pointer"
                          >
                            <Card className="p-5 hover:shadow-lg transition-all border-2 hover:border-purple-300">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-purple-600">Q{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-2">{card.question}</p>
                                  <AnimatePresence>
                                    {selectedFlashcard === index && showAnswer && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 pt-3 border-t border-gray-200"
                                      >
                                        <p className="text-sm text-gray-600 font-medium mb-1">Answer:</p>
                                        <p className="text-gray-700">{card.answer}</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  {selectedFlashcard === index && (
                                    <Button variant="ghost" size="sm" className="mt-2 text-purple-600">
                                      {showAnswer ? 'Hide Answer' : 'Show Answer'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Notes */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Saved Notes ({filteredNotes.length})</h2>
          <div className="grid gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="p-5 bg-white hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {note.topic}
                      </h3>
                      <Badge variant="secondary">{note.subject}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{note.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        {note.keyPoints.length} Key Points
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {note.flashcards.length} Flashcards
                      </span>
                      <span>Created: {note.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <BookOpen className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
