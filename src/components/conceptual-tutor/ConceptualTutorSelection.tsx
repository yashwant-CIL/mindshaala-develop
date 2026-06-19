import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Play, 
  Layout, 
  BookText, 
  Target,
  Sparkles,
  Search,
  BookMarked,
  Layers,
  Award
} from 'lucide-react';
import { ConceptualVivaService } from '../../services/ConceptualTutorService';
import { useCourse } from '../../context/CourseContext';
import { toast } from 'react-hot-toast';

interface Subject {
  subject_id: number;
  subject_name: string;
  icon?: string;
}

interface Chapter {
  chapter_id: number;
  chapter_name: string;
}

interface Topic {
  topic_id: number;
  topic_name: string;
}

interface SelectionProps {
  onStartViva: (params: any) => void;
}

export default function ConceptualVivaSelection({ onStartViva }: SelectionProps) {
  const { subscriptionId, courseId, userAssId } = useCourse();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const [subjectSearch, setSubjectSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  
  const [loading, setLoading] = useState<{
    subjects: boolean;
    chapters: boolean;
    topics: boolean;
    starting: boolean;
  }>({
    subjects: false,
    chapters: false,
    topics: false,
    starting: false
  });

  // Fetch subjects on mount or subscriptionId change
  useEffect(() => {
    if (subscriptionId) {
      fetchSubjects();
    }
  }, [subscriptionId]);

  const fetchSubjects = async () => {
    setLoading(prev => ({ ...prev, subjects: true }));
    try {
      const data = await ConceptualVivaService.getAllSubjects(subscriptionId!);
      setSubjects(data || []);
    } catch (error) {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  const fetchChapters = async (subjectId: number) => {
    setLoading(prev => ({ ...prev, chapters: true }));
    try {
      const data = await ConceptualVivaService.getAllChapters(subjectId);
      setChapters(data || []);
    } catch (error) {
      toast.error("Failed to load chapters");
    } finally {
      setLoading(prev => ({ ...prev, chapters: false }));
    }
  };

  const fetchTopics = async (chapterId: number) => {
    setLoading(prev => ({ ...prev, topics: true }));
    try {
      const data = await ConceptualVivaService.getAllTopics(chapterId);
      setTopics(data || []);
    } catch (error) {
      toast.error("Failed to load topics");
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  };

  const handleSubjectSelect = (subjectId: number) => {
    setSelectedSubject(subjectId);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setChapters([]);
    setTopics([]);
    setChapterSearch('');
    setTopicSearch('');
    fetchChapters(subjectId);
  };

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setSelectedTopic(null);
    setTopics([]);
    setTopicSearch('');
    fetchTopics(chapterId);
  };

  const handleTopicSelect = (topicId: number) => {
    setSelectedTopic(topicId);
  };

  const handleStartViva = () => {
    if (!selectedTopic) return;
    
    const subjectName = subjects.find(s => s.subject_id === selectedSubject)?.subject_name || '';
    const chapterName = chapters.find(c => c.chapter_id === selectedChapter)?.chapter_name || '';
    const topicName = topics.find(t => t.topic_id === selectedTopic)?.topic_name || '';

    const userId = localStorage.getItem('user_id');
    const payload = {
      user_id: userId,
      course_id: courseId,
      subject_id: selectedSubject,
      chapter_id: selectedChapter,
      topic_id: selectedTopic,
      subjectName,
      chapterName,
      topicName
    };
    
    onStartViva(payload);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-10 text-center relative overflow-hidden p-10 rounded-3xl bg-white shadow-xl border border-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold uppercase tracking-wider mb-4 border border-blue-100">
            <Sparkles className="w-4 h-4" /> Conceptual Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Core Concepts</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Personalized AI-powered viva practice to deepen your understanding and identify gaps in your conceptual knowledge.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Step 1: Subject Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200">1</div>
             <h2 className="text-xl font-bold text-slate-800">Choose Subject</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[500px] flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search subjects..." 
                    className="bg-transparent border-none outline-none text-sm w-full" 
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                  />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {loading.subjects ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-slate-400 text-sm">Loading subjects...</p>
                </div>
              ) : subjects.length > 0 ? (
                subjects.filter(s => s.subject_name.toLowerCase().includes(subjectSearch.toLowerCase())).map(subject => (
                  <button
                    key={subject.subject_id}
                    onClick={() => handleSubjectSelect(subject.subject_id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group ${
                      selectedSubject === subject.subject_id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      selectedSubject === subject.subject_id ? 'bg-white/20' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-left flex-1">{subject.subject_name}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedSubject === subject.subject_id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </button>
                ))
              ) : (
                <div className="text-center py-20 px-4">
                  <Layout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">No subjects found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Chapter Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-200">2</div>
             <h2 className="text-xl font-bold text-slate-800">Select Chapter</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[500px] flex flex-col">
             {!selectedSubject ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-600 font-bold mb-1">Pick a subject first</h3>
                  <p className="text-slate-400 text-sm">Select a subject from the left panel to see its chapters.</p>
               </div>
             ) : (
               <>
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all mb-2">
                       <Search className="w-4 h-4 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search chapters..." 
                         className="bg-transparent border-none outline-none text-sm w-full"
                         value={chapterSearch}
                         onChange={(e) => setChapterSearch(e.target.value)}
                       />
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Chapters</span>
                       {loading.chapters && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>}
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {chapters.length > 0 ? (
                      chapters.filter(c => c.chapter_name.toLowerCase().includes(chapterSearch.toLowerCase())).map(chapter => (
                        <button
                          key={chapter.chapter_id}
                          onClick={() => handleChapterSelect(chapter.chapter_id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group ${
                            selectedChapter === chapter.chapter_id 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            selectedChapter === chapter.chapter_id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-left flex-1 text-sm">{chapter.chapter_name}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${selectedChapter === chapter.chapter_id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                        </button>
                      ))
                    ) : !loading.chapters && (
                      <div className="text-center py-20 px-4">
                        <BookText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">Chapters will appear here</p>
                      </div>
                    )}
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Step 3: Topic Selection & Start */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-200">3</div>
             <h2 className="text-xl font-bold text-slate-800">Finalize Topic</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[500px] flex flex-col">
             {!selectedChapter ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-600 font-bold mb-1">Select a chapter</h3>
                  <p className="text-slate-400 text-sm">Pick a chapter to view specific topics for practice.</p>
               </div>
             ) : (
               <>
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500 transition-all mb-2">
                       <Search className="w-4 h-4 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search topics..." 
                         className="bg-transparent border-none outline-none text-sm w-full"
                         value={topicSearch}
                         onChange={(e) => setTopicSearch(e.target.value)}
                       />
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose Topic</span>
                       {loading.topics && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>}
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {topics.length > 0 ? (
                      topics.filter(t => t.topic_name.toLowerCase().includes(topicSearch.toLowerCase())).map(topic => (
                        <button
                          key={topic.topic_id}
                          onClick={() => handleTopicSelect(topic.topic_id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group ${
                            selectedTopic === topic.topic_id 
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            selectedTopic === topic.topic_id ? 'bg-white/20' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${selectedTopic === topic.topic_id ? 'bg-white' : 'bg-purple-600 group-hover:bg-white'}`}></div>
                          </div>
                          <span className="font-bold text-left flex-1 text-sm">{topic.topic_name}</span>
                        </button>
                      ))
                    ) : !loading.topics && (
                       <div className="text-center py-20 px-4">
                        <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">Select a chapter to see topics</p>
                      </div>
                    )}
                 </div>
                 
                 {/* Start Button Container */}
                 <div className="p-4 border-t border-slate-100 bg-white">
                    <button
                      onClick={handleStartViva}
                      disabled={!selectedTopic || loading.starting}
                      className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden relative group overflow-hidden ${
                        selectedTopic && !loading.starting
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {loading.starting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Preparing Session...</span>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                          <Play className={`w-5 h-5 ${selectedTopic ? 'fill-current' : ''}`} />
                          <span>START VIVA SESSION</span>
                        </>
                      )}
                    </button>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-blue-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" /> How it works?
          </h3>
          <p className="text-blue-100 max-w-xl text-sm leading-relaxed opacity-80">
            Our AI will ask you conceptual questions based on your selection. Record your audio response, and our advanced evaluation engine will analyze your conceptual depth, technical accuracy, and provide personalized feedback.
          </p>
        </div>
        <div className="flex gap-4 relative z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
             <div className="text-2xl font-black mb-1">100%</div>
             <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">AI Analysis</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
             <div className="text-2xl font-black mb-1">Voice</div>
             <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Interaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
