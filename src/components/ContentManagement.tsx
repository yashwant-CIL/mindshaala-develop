import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Video, 
  StickyNote, 
  Mic, 
  Sparkles, 
  FileCheck,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Save,
  X,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { LaTeXRenderer } from './LaTeXRenderer';

type TabType = 'questions' | 'videos' | 'notes' | 'audio' | 'ai-extract' | 'templates';
type CategoryType = 'School' | 'Board Exam' | '';

interface HierarchySelection {
  categoryType: CategoryType;
  board: string;
  classGrade: string;
  subject: string;
  chapter: string;
  topic: string;
}

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [hierarchy, setHierarchy] = useState<HierarchySelection>({
    categoryType: '',
    board: '',
    classGrade: '',
    subject: '',
    chapter: '',
    topic: ''
  });

  // Question form state
  const [questionType, setQuestionType] = useState<'MCQ' | 'Theory'>('MCQ');
  const [difficulty, setDifficulty] = useState('Medium');
  const [marks, setMarks] = useState('1');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [explanation, setExplanation] = useState('');
  const [questionImage, setQuestionImage] = useState<File | null>(null);

  // Video form state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [sourceType, setSourceType] = useState('Direct Upload (MP4)');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Notes form state
  const [notesTitle, setNotesTitle] = useState('');
  const [notesDescription, setNotesDescription] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [notesFile, setNotesFile] = useState<File | null>(null);

  // Audio form state
  const [audioTitle, setAudioTitle] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // AI Extract form state
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [answerImage, setAnswerImage] = useState<File | null>(null);
  const [diagramImage, setDiagramImage] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedQuestion, setExtractedQuestion] = useState('');
  const [extractedAnswer, setExtractedAnswer] = useState('');
  const [showExtractedContent, setShowExtractedContent] = useState(false);

  const tabs = [
    { id: 'questions' as TabType, label: 'Questions', icon: FileText },
    { id: 'videos' as TabType, label: 'Videos', icon: Video },
    { id: 'notes' as TabType, label: 'Notes', icon: StickyNote },
    { id: 'audio' as TabType, label: 'Audio', icon: Mic },
    { id: 'ai-extract' as TabType, label: 'AI Extract', icon: Sparkles },
    { id: 'templates' as TabType, label: 'Templates', icon: FileCheck }
  ];

  const handleSaveQuestion = () => {
    console.log('Saving question:', {
      hierarchy,
      questionType,
      difficulty,
      marks,
      questionText,
      options: { optionA, optionB, optionC, optionD },
      correctOption,
      explanation,
      questionImage
    });
    // TODO: Implement actual save logic
    alert('Question saved successfully!');
  };

  const handleUploadVideo = () => {
    console.log('Uploading video:', {
      hierarchy,
      videoTitle,
      videoDescription,
      sourceType,
      videoDuration,
      videoFile
    });
    // TODO: Implement actual upload logic
    alert(`Video uploaded successfully!\n\nConnected to:\nBoard: ${hierarchy.board}\nClass: ${hierarchy.classGrade}\nSubject: ${hierarchy.subject}\nChapter: ${hierarchy.chapter}${hierarchy.topic ? `\nTopic: ${hierarchy.topic}` : ''}`);
  };

  const handleUploadNotes = () => {
    console.log('Uploading notes:', {
      hierarchy,
      notesTitle,
      notesDescription,
      allowDownload,
      notesFile
    });
    // TODO: Implement actual upload logic
    alert(`Notes uploaded successfully!\n\nConnected to:\nBoard: ${hierarchy.board}\nClass: ${hierarchy.classGrade}\nSubject: ${hierarchy.subject}\nChapter: ${hierarchy.chapter}${hierarchy.topic ? `\nTopic: ${hierarchy.topic}` : ''}`);
  };

  const handleUploadAudio = () => {
    console.log('Uploading audio:', {
      hierarchy,
      audioTitle,
      audioFile
    });
    // TODO: Implement actual upload logic
    alert(`Audio uploaded successfully!\n\nConnected to:\nBoard: ${hierarchy.board}\nClass: ${hierarchy.classGrade}\nSubject: ${hierarchy.subject}\nChapter: ${hierarchy.chapter}${hierarchy.topic ? `\nTopic: ${hierarchy.topic}` : ''}`);
  };

  const handleExtractWithAI = async () => {
    if (!questionImageFile && !answerImage) {
      alert('Please upload at least a question or answer image');
      return;
    }

    setIsExtracting(true);
    
    // Simulate AI extraction (replace with actual API call)
    setTimeout(() => {
      // Mock extracted content with LaTeX
      setExtractedQuestion(`Calculate the gravitational force between two objects if $m_1$ and $m_2$ objects are of mass $80kg$ and $50kg$ separated by distance $8c = 60°$.

(Given: $G = 6.67 \\times 10^{-11} Nm^2/kg^2$)`);
      
      setExtractedAnswer(`Using Newton's Law of Gravitation:
$$F = G \\times \\frac{m_1 \\times m_2}{r^2}$$

Substituting values:
$$F = 6.67 \\times 10^{-11} \\times \\frac{80 \\times 50}{8^2}$$
$$F = 6.67 \\times 10^{-11} \\times \\frac{4000}{64}$$
$$F = 6.67 \\times 10^{-11} \\times 62.5$$
$$F = 4.17 \\times 10^{-9} N$$

Therefore, the gravitational force is $4.17 \\times 10^{-9} N$`);
      
      setShowExtractedContent(true);
      setIsExtracting(false);
    }, 3000);
  };

  const handleResetExtraction = () => {
    setQuestionImageFile(null);
    setAnswerImage(null);
    setDiagramImage(null);
    setExtractedQuestion('');
    setExtractedAnswer('');
    setShowExtractedContent(false);
  };

  const handleSaveToQuestionBank = () => {
    if (!isHierarchyComplete) {
      alert('Please complete the hierarchy selection first!');
      return;
    }

    console.log('Saving extracted content to question bank:', {
      hierarchy,
      extractedQuestion,
      extractedAnswer,
      questionImage: questionImageFile,
      answerImage,
      diagramImage
    });

    alert(`Content saved to Question Bank!\n\nBoard: ${hierarchy.board}\nClass: ${hierarchy.classGrade}\nSubject: ${hierarchy.subject}\nChapter: ${hierarchy.chapter}${hierarchy.topic ? `\nTopic: ${hierarchy.topic}` : ''}`);
    
    handleResetExtraction();
  };

  const isHierarchyComplete = 
    hierarchy.categoryType && 
    hierarchy.board && 
    hierarchy.classGrade && 
    hierarchy.subject && 
    hierarchy.chapter;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <div className="flex items-center gap-2 text-sm">
            <Select>
              <option>ICSE Class 10</option>
              <option>CBSE Class 10</option>
              <option>MHT-CET</option>
            </Select>
          </div>
        </div>
        <p className="text-sm text-gray-600">Upload and manage course materials for students.</p>
      </div>

      <div className="flex gap-6 p-8">
        {/* Left Panel - Hierarchy Selector */}
        <Card className="w-[400px] bg-white p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Select Hierarchy</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Choose where to attach this content.</p>

          <div className="space-y-4">
            {/* 1. Category Type */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                1. Category Type
              </Label>
              <select
                value={hierarchy.categoryType}
                onChange={(e) => setHierarchy({ ...hierarchy, categoryType: e.target.value as CategoryType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="School">School / Board Exam</option>
              </select>
            </div>

            {/* 2. Board */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                2. Board
              </Label>
              <select
                value={hierarchy.board}
                onChange={(e) => setHierarchy({ ...hierarchy, board: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!hierarchy.categoryType}
              >
                <option value="">Select Board</option>
                <option value="ICSE">ICSE</option>
                <option value="CBSE">CBSE</option>
                <option value="State Board">State Board</option>
              </select>
            </div>

            {/* 3. Class / Grade */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                3. Class / Grade
              </Label>
              <select
                value={hierarchy.classGrade}
                onChange={(e) => setHierarchy({ ...hierarchy, classGrade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!hierarchy.board}
              >
                <option value="">Select Class</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Subject
              </Label>
              <select
                value={hierarchy.subject}
                onChange={(e) => setHierarchy({ ...hierarchy, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!hierarchy.classGrade}
              >
                <option value="">Select Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            {/* Chapter */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Chapter
              </Label>
              <select
                value={hierarchy.chapter}
                onChange={(e) => setHierarchy({ ...hierarchy, chapter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!hierarchy.subject}
              >
                <option value="">Select Chapter</option>
                <option value="Chapter 1">Chapter 1 - Introduction</option>
                <option value="Chapter 2">Chapter 2 - Fundamentals</option>
                <option value="Chapter 3">Chapter 3 - Advanced Concepts</option>
              </select>
            </div>

            {/* Topic (Optional) */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Topic (Optional)
              </Label>
              <input
                type="text"
                value={hierarchy.topic}
                onChange={(e) => setHierarchy({ ...hierarchy, topic: e.target.value })}
                placeholder="e.g. Refraction through Prism"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Current Selection Summary */}
          {isHierarchyComplete && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-green-900">Current Selection</h3>
              </div>
              <div className="text-xs text-green-800 space-y-1">
                <p><strong>Type:</strong> {hierarchy.categoryType}</p>
                <p><strong>Board:</strong> {hierarchy.board}</p>
                <p><strong>Subject:</strong> {hierarchy.subject}</p>
                <p><strong>Chapter:</strong> {hierarchy.chapter}</p>
                {hierarchy.topic && <p><strong>Topic:</strong> {hierarchy.topic}</p>}
              </div>
            </div>
          )}
        </Card>

        {/* Right Panel - Content Forms */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-t-lg">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <Card className="bg-white rounded-t-none border-t-0 p-6">
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Add Question Bank</h2>
                <p className="text-sm text-gray-600 mb-6">Add MCQ or Theory questions to this chapter.</p>

                <div className="space-y-6">
                  {/* Question Type, Difficulty, Marks */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Question Type
                      </Label>
                      <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as 'MCQ' | 'Theory')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="Theory">Theory</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Difficulty
                      </Label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Marks
                      </Label>
                      <input
                        type="number"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Question Text
                    </Label>
                    <Textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Type your question here..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Options (only for MCQ) */}
                  {questionType === 'MCQ' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Option A
                          </Label>
                          <input
                            type="text"
                            value={optionA}
                            onChange={(e) => setOptionA(e.target.value)}
                            placeholder="Option A text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Option B
                          </Label>
                          <input
                            type="text"
                            value={optionB}
                            onChange={(e) => setOptionB(e.target.value)}
                            placeholder="Option B text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Option C
                          </Label>
                          <input
                            type="text"
                            value={optionC}
                            onChange={(e) => setOptionC(e.target.value)}
                            placeholder="Option C text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Option D
                          </Label>
                          <input
                            type="text"
                            value={optionD}
                            onChange={(e) => setOptionD(e.target.value)}
                            placeholder="Option D text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* Correct Option */}
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Correct Option
                        </Label>
                        <select
                          value={correctOption}
                          onChange={(e) => setCorrectOption(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select correct answer</option>
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Explanation / Solution */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Explanation / Solution
                    </Label>
                    <Textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Explain the answer..."
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Attach Diagram / Image */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Attach Diagram / Image (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setQuestionImage(e.target.files?.[0] || null)}
                        className="hidden"
                        id="question-image"
                      />
                      <label htmlFor="question-image" className="cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {questionImage ? questionImage.name : 'Click to browse files'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" className="px-6">
                      + Add Another
                    </Button>
                    <Button
                      onClick={handleSaveQuestion}
                      disabled={!isHierarchyComplete || !questionText}
                      className="px-8 bg-blue-600 hover:bg-blue-700"
                    >
                      Save Question
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Video Lecture</h2>
                <p className="text-sm text-gray-600 mb-6">Add video content to this topic.</p>

                {/* Hierarchy Display */}
                {isHierarchyComplete && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📌 This video will be attached to:</p>
                    <div className="text-xs text-blue-800 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.board}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.classGrade}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.subject}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.chapter}</span>
                      {hierarchy.topic && <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.topic}</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Video Title */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Video Title
                    </Label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Introduction to Refraction"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Brief summary of what this video covers..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Source Type and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Source Type
                      </Label>
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="Direct Upload (MP4)">Direct Upload (MP4)</option>
                        <option value="YouTube Link">YouTube Link</option>
                        <option value="Vimeo Link">Vimeo Link</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Duration (mins)
                      </Label>
                      <input
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="15"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Video File Upload */}
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="video-file"
                      />
                      <label htmlFor="video-file" className="cursor-pointer">
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {videoFile ? videoFile.name : 'Drag & Drop Video File'}
                        </p>
                        <p className="text-xs text-gray-500">
                          or click to browse from your computer
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Max file size: 500MB, Formats: MP4, WebM
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleUploadVideo}
                      disabled={!isHierarchyComplete || !videoTitle}
                      className="px-8 bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Add Study Notes</h2>
                <p className="text-sm text-gray-600 mb-6">Upload PDF notes or cheatsheets.</p>

                {/* Hierarchy Display */}
                {isHierarchyComplete && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📌 These notes will be attached to:</p>
                    <div className="text-xs text-blue-800 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.board}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.classGrade}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.subject}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.chapter}</span>
                      {hierarchy.topic && <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.topic}</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Title
                    </Label>
                    <input
                      type="text"
                      value={notesTitle}
                      onChange={(e) => setNotesTitle(e.target.value)}
                      placeholder="e.g. Chapter 1 Summary Notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      value={notesDescription}
                      onChange={(e) => setNotesDescription(e.target.value)}
                      placeholder="Optional description..."
                      className="min-h-[60px]"
                    />
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setNotesFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="notes-file"
                      />
                      <label htmlFor="notes-file" className="cursor-pointer">
                        <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {notesFile ? notesFile.name : 'Upload PDF Document'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to browse files
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Allow Download Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <Label className="text-sm font-semibold text-gray-900">
                        Allow students to download PDF
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Students can save this file offline
                      </p>
                    </div>
                    <Switch
                      checked={allowDownload}
                      onCheckedChange={setAllowDownload}
                    />
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleUploadNotes}
                      disabled={!isHierarchyComplete || !notesTitle}
                      className="px-8 bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Notes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Tab */}
            {activeTab === 'audio' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Add Audio / Podcast</h2>
                <p className="text-sm text-gray-600 mb-6">Upload audio explanations or revision summaries.</p>

                {/* Hierarchy Display */}
                {isHierarchyComplete && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📌 This audio will be attached to:</p>
                    <div className="text-xs text-blue-800 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.board}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.classGrade}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.subject}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.chapter}</span>
                      {hierarchy.topic && <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.topic}</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Title
                    </Label>
                    <input
                      type="text"
                      value={audioTitle}
                      onChange={(e) => setAudioTitle(e.target.value)}
                      placeholder="e.g. Quick Revision Audio"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Audio File Upload */}
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="audio-file"
                      />
                      <label htmlFor="audio-file" className="cursor-pointer">
                        <Mic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {audioFile ? audioFile.name : 'Upload Audio File'}
                        </p>
                        <p className="text-xs text-gray-500">
                          MP3, WAV, M4A supported
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleUploadAudio}
                      disabled={!isHierarchyComplete || !audioTitle}
                      className="px-8 bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Audio
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Extract Tab */}
            {activeTab === 'ai-extract' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">AI Extract</h2>
                <p className="text-sm text-gray-600 mb-6">Use AI to extract key concepts and create questions from images.</p>

                {/* Hierarchy Display */}
                {isHierarchyComplete && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📌 This content will be attached to:</p>
                    <div className="text-xs text-blue-800 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.board}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.classGrade}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.subject}</span>
                      <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.chapter}</span>
                      {hierarchy.topic && <span className="px-2 py-1 bg-blue-100 rounded">{hierarchy.topic}</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Upload Question Image */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Upload Question Image
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setQuestionImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="question-image"
                      />
                      <label htmlFor="question-image" className="cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {questionImageFile ? questionImageFile.name : 'Click to browse files'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Upload Answer Image */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Upload Answer Image (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAnswerImage(e.target.files?.[0] || null)}
                        className="hidden"
                        id="answer-image"
                      />
                      <label htmlFor="answer-image" className="cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {answerImage ? answerImage.name : 'Click to browse files'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Upload Diagram Image */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Upload Diagram Image (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDiagramImage(e.target.files?.[0] || null)}
                        className="hidden"
                        id="diagram-image"
                      />
                      <label htmlFor="diagram-image" className="cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {diagramImage ? diagramImage.name : 'Click to browse files'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Extract Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleExtractWithAI}
                      disabled={(!questionImageFile && !answerImage) || isExtracting}
                      className="px-8 bg-blue-600 hover:bg-blue-700"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Extracting with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Extract with AI
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Extracted Content Modal */}
                  {showExtractedContent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Smart Content Digitizer</h2>
                          </div>
                          <button
                            onClick={handleResetExtraction}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          {/* Question Section */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Question
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Left: LaTeX Code */}
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  Extracted Question (LaTeX)
                                </Label>
                                <Textarea
                                  value={extractedQuestion}
                                  onChange={(e) => setExtractedQuestion(e.target.value)}
                                  placeholder="Extracted question with LaTeX..."
                                  className="min-h-[150px] font-mono text-sm border-2 border-gray-300 focus:border-blue-500"
                                />
                              </div>

                              {/* Right: Live Preview */}
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Live Preview
                                </Label>
                                <div className="min-h-[150px] p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 overflow-auto">
                                  <LaTeXRenderer content={extractedQuestion} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Answer Section */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              Answer/Solution
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Left: LaTeX Code */}
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Extracted Answer (LaTeX)
                                </Label>
                                <Textarea
                                  value={extractedAnswer}
                                  onChange={(e) => setExtractedAnswer(e.target.value)}
                                  placeholder="Extracted answer with LaTeX..."
                                  className="min-h-[200px] font-mono text-sm border-2 border-gray-300 focus:border-green-500"
                                />
                              </div>

                              {/* Right: Live Preview */}
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Live Preview
                                </Label>
                                <div className="min-h-[200px] p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200 overflow-auto">
                                  <LaTeXRenderer content={extractedAnswer} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                          <Button
                            onClick={handleResetExtraction}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                          <Button
                            onClick={handleSaveToQuestionBank}
                            disabled={!isHierarchyComplete}
                            className="px-8 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save to Question Bank
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="text-center py-12">
                <FileCheck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Templates</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Save time by using pre-made templates for questions, assessments, and study materials.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Browse Templates
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}