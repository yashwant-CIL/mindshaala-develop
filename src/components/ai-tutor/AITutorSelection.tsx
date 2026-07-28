import React, { useState, useEffect, useContext } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  Play, 
  BookText, 
  Target,
  Sparkles,
  Search,
  BookMarked,
  Layers,
  Award,
  Brain,
  Lock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { AITutorService } from '../../services/AITutorService';
import { useCourse } from '../../context/CourseContext';
import { UserContext } from '../../App';
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

export default function AITutorSelection({ onStartViva }: SelectionProps) {
  const { subscriptionId, courseId } = useCourse();
  const { state: userState } = useContext(UserContext) || { state: {} };
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const [subjectSearch, setSubjectSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
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

  // Fetch subjects on mount
  useEffect(() => {
    if (subscriptionId) {
      fetchSubjects();
    }
  }, [subscriptionId]);

  const fetchSubjects = async () => {
    setLoading(prev => ({ ...prev, subjects: true }));
    try {
      const data = await AITutorService.GetAllSubjects(subscriptionId!);
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
      const data = await AITutorService.GetAllChapters(subjectId);
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
      const data = await AITutorService.GetAllTopics(chapterId);
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
    fetchChapters(subjectId);
    setCurrentStep(2);
  };

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setSelectedTopic(null);
    setTopics([]);
    fetchTopics(chapterId);
    setCurrentStep(3);
  };

  const handleTopicSelect = (topicId: number) => {
    setSelectedTopic(topicId);
  };

  const formatBackendTimestamp = (date: Date) => {
    const pad = (num: number, size = 2) => num.toString().padStart(size, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const ms = pad(date.getMilliseconds(), 3);
    return `${yyyy}-${MM}-${DD} ${HH}:${mm}:${ss}.${ms}000`;
  };

  const handleStartViva = () => {
    if (!selectedTopic) return;
    
    const userIdVal = localStorage.getItem('user_id') || userState?.user_id;
    const userId = userIdVal ? parseInt(String(userIdVal), 10) : undefined;
    const payload = {
      user_id: userId,
      // course_id: courseId,
      subject_id: selectedSubject,
      chapter_id: selectedChapter,
      topic_id: selectedTopic,
      subscription_id: subscriptionId,
      session_start_time: formatBackendTimestamp(new Date())
    };
    
    onStartViva(payload);
  };

  const getSelectedSubjectName = () => {
    return subjects.find(s => s.subject_id === selectedSubject)?.subject_name || '';
  };

  const getSelectedChapterName = () => {
    return chapters.find(c => c.chapter_id === selectedChapter)?.chapter_name || '';
  };

  const getSelectedTopicName = () => {
    return topics.find(t => t.topic_id === selectedTopic)?.topic_name || '';
  };

  return (
    <div className="p-6 md:p-8 max-w-full mx-auto min-h-screen bg-slate-50/50 pb-20">
      {/* Header banner */}
      <div className="mb-10 text-center relative overflow-hidden p-10 rounded-3xl bg-white shadow-sm border border-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-50/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider mb-4 border border-violet-100">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-500 animate-pulse" /> Concept Setup Wizard
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-tight">
            Launch Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">AI Tutor Session</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            Follow the steps below to choose your subject, chapter, and topic. The AI Tutor will personalize its questions to your choice.
          </p>
        </div>
      </div>

      {/* Accordion Steps Stack */}
      <div className="space-y-6">
        
        {/* Step 1: Choose Subject */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
          {/* Accordion Header */}
          <div 
            onClick={() => setCurrentStep(1)}
            className={`p-6 flex items-center justify-between cursor-pointer border-b ${
              currentStep === 1 ? 'bg-violet-50/30 border-violet-100' : 'border-slate-100 bg-white hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                selectedSubject ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {selectedSubject ? <CheckCircle className="w-5 h-5 text-white" /> : "1"}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Select Subject</h3>
                {selectedSubject && (
                  <span className="text-xs text-violet-600 font-bold bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-md mt-1 inline-block">
                    {getSelectedSubjectName()}
                  </span>
                )}
              </div>
            </div>
            {currentStep !== 1 && <button className="text-xs font-bold text-violet-600 hover:underline">Change</button>}
          </div>

          {/* Accordion Body */}
          {currentStep === 1 && (
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 max-w-md bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-violet-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter subjects..." 
                  className="bg-transparent border-none outline-none text-xs w-full"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                />
              </div>

              {loading.subjects ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {subjects.filter(s => s.subject_name.toLowerCase().includes(subjectSearch.toLowerCase())).map(subject => (
                    <button
                      key={subject.subject_id}
                      onClick={() => handleSubjectSelect(subject.subject_id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                        selectedSubject === subject.subject_id
                          ? 'border-violet-600 bg-violet-50/50 text-violet-700 shadow-sm'
                          : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/10 text-slate-600 bg-white'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedSubject === subject.subject_id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <BookMarked className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm truncate">{subject.subject_name}</span>
                    </button>
                  ))}
                  {subjects.length === 0 && (
                    <p className="text-slate-400 text-sm py-4">No subjects available.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Select Chapter */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
          {/* Accordion Header */}
          <div 
            onClick={() => selectedSubject && setCurrentStep(2)}
            className={`p-6 flex items-center justify-between border-b ${
              !selectedSubject ? 'opacity-50 cursor-not-allowed bg-slate-50/50 border-slate-100' :
              currentStep === 2 ? 'bg-fuchsia-50/30 border-fuchsia-100 cursor-pointer' : 'border-slate-100 bg-white hover:bg-slate-50/50 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                !selectedSubject ? 'bg-slate-100 text-slate-400' :
                selectedChapter ? 'bg-fuchsia-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {!selectedSubject ? <Lock className="w-3.5 h-3.5 text-slate-400" /> :
                 selectedChapter ? <CheckCircle className="w-5 h-5 text-white" /> : "2"}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Select Chapter</h3>
                {selectedChapter && (
                  <span className="text-xs text-fuchsia-600 font-bold bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-0.5 rounded-md mt-1 inline-block">
                    {getSelectedChapterName()}
                  </span>
                )}
              </div>
            </div>
            {selectedSubject && currentStep !== 2 && <button className="text-xs font-bold text-fuchsia-600 hover:underline">Change</button>}
          </div>

          {/* Accordion Body */}
          {selectedSubject && currentStep === 2 && (
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 max-w-md bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-fuchsia-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter chapters..." 
                  className="bg-transparent border-none outline-none text-xs w-full"
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                />
              </div>

              {loading.chapters ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {chapters.filter(c => c.chapter_name.toLowerCase().includes(chapterSearch.toLowerCase())).map(chapter => (
                    <button
                      key={chapter.chapter_id}
                      onClick={() => handleChapterSelect(chapter.chapter_id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        selectedChapter === chapter.chapter_id
                          ? 'border-fuchsia-600 bg-fuchsia-50/50 text-fuchsia-700 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-fuchsia-300 hover:bg-fuchsia-50/10 text-slate-600 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedChapter === chapter.chapter_id ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold leading-tight line-clamp-2">{chapter.chapter_name}</span>
                    </button>
                  ))}
                  {chapters.length === 0 && (
                    <p className="text-slate-400 text-sm py-4">No chapters found for this subject.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Finalize Topic */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
          {/* Accordion Header */}
          <div 
            onClick={() => selectedChapter && setCurrentStep(3)}
            className={`p-6 flex items-center justify-between border-b ${
              !selectedChapter ? 'opacity-50 cursor-not-allowed bg-slate-50/50 border-slate-100' :
              currentStep === 3 ? 'bg-indigo-50/30 border-indigo-100 cursor-pointer' : 'border-slate-100 bg-white hover:bg-slate-50/50 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                !selectedChapter ? 'bg-slate-100 text-slate-400' :
                selectedTopic ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {!selectedChapter ? <Lock className="w-3.5 h-3.5 text-slate-400" /> :
                 selectedTopic ? <CheckCircle className="w-5 h-5 text-white" /> : "3"}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Finalize Topic</h3>
                {selectedTopic && (
                  <span className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md mt-1 inline-block">
                    {getSelectedTopicName()}
                  </span>
                )}
              </div>
            </div>
            {selectedChapter && currentStep !== 3 && <button className="text-xs font-bold text-indigo-600 hover:underline">Change</button>}
          </div>

          {/* Accordion Body */}
          {selectedChapter && currentStep === 3 && (
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 max-w-md bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter topics..." 
                  className="bg-transparent border-none outline-none text-xs w-full"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                />
              </div>

              {loading.topics ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {topics.filter(t => t.topic_name.toLowerCase().includes(topicSearch.toLowerCase())).map(topic => (
                    <button
                      key={topic.topic_id}
                      onClick={() => handleTopicSelect(topic.topic_id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedTopic === topic.topic_id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold shadow-sm'
                          : 'border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10 text-slate-600 bg-white'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        selectedTopic === topic.topic_id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedTopic === topic.topic_id ? 'bg-white' : 'bg-slate-400'}`}></div>
                      </div>
                      <span className="text-xs leading-tight">{topic.topic_name}</span>
                    </button>
                  ))}
                  {topics.length === 0 && (
                    <p className="text-slate-400 text-sm py-4">No topics found for this chapter.</p>
                  )}
                </div>
              )}

              {/* Start Trigger */}
              <div className="pt-4 border-t border-slate-150">
                <button
                  onClick={handleStartViva}
                  disabled={!selectedTopic || loading.starting}
                  className={`w-full max-w-sm mx-auto py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 relative group overflow-hidden ${
                    selectedTopic && !loading.starting
                      ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-md shadow-violet-100 hover:scale-[1.01]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Play className={`w-4 h-4 ${selectedTopic ? 'fill-current' : ''}`} />
                  <span>START AI TUTOR SESSION</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modern Horizontal Info Footer */}
      {/* <div className="mt-12 p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
            <Brain className="w-6 h-6 text-fuchsia-500" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-0.5">How AI Tutor Personalizes Your Session</h4>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
              Once you start, the AI reads the context of your chosen topic and generates conceptual queries. You talk into the mic to answer, and the AI assesses your technical reasoning dynamically.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150 text-center">
            <span className="block text-sm font-black text-slate-700 leading-none">Voice</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Input</span>
          </div>
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150 text-center">
            <span className="block text-sm font-black text-slate-700 leading-none">AI</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Critique</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
