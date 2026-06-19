import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Play, 
  Layout, 
  Sparkles,
  BookMarked,
  Target,
  Search,
  Layers,
  Award
} from 'lucide-react';
import { SpeakAlongService } from '../../services/SpeakAlongService';
import { useCourse } from '../../context/CourseContext';
import { toast } from 'react-hot-toast';

interface SelectionProps {
  onStartSession: (params: any) => void;
}

interface Subject {
  subject_id: number;
  subject_name: string;
  icon?: string;
}

interface Chapter {
  chapter_id: number;
  chapter_name: string;
}

export default function SpeakAlongSelection({ onStartSession }: SelectionProps) {
  const { subscriptionId, courseId } = useCourse();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const [subjectSearch, setSubjectSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  
  const [loading, setLoading] = useState({
    subjects: false,
    chapters: false
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
      const data = await SpeakAlongService.getAllSubjects(subscriptionId!);
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
      const data = await SpeakAlongService.getAllChapters(subjectId);
      setChapters(data || []);
    } catch (error) {
      toast.error("Failed to load chapters");
    } finally {
      setLoading(prev => ({ ...prev, chapters: false }));
    }
  };

  const handleSubjectSelect = (subjectId: number) => {
    setSelectedSubject(subjectId);
    setSelectedChapter(null);
    setChapters([]);
    setChapterSearch('');
    fetchChapters(subjectId);
  };

  const handleStart = () => {
    if (!selectedSubject) return;
    
    const subjectName = subjects.find(s => s.subject_id === selectedSubject)?.subject_name || '';
    const chapterName = chapters.find(c => c.chapter_id === selectedChapter)?.chapter_name || '';

    const payload = {
      course_id: courseId,
      subject_id: selectedSubject,
      chapter_id: selectedChapter || undefined, // Not compulsory
      subjectName,
      chapterName
    };
    
    onStartSession(payload);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-10 text-center relative overflow-hidden p-10 rounded-3xl bg-white shadow-xl border border-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold uppercase tracking-wider mb-4 border border-indigo-100">
            <Sparkles className="w-4 h-4" /> Fluency Training
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Practice Topic</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Select a subject and optionally a chapter to start your SpeakAlong session. Improve your speaking skills with AI-powered feedback.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Step 1: Subject Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-200">1</div>
             <h2 className="text-xl font-bold text-slate-800">Select Subject</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[500px] flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-slate-400 text-sm">Loading subjects...</p>
                </div>
              ) : subjects.length > 0 ? (
                subjects.filter(s => s.subject_name.toLowerCase().includes(subjectSearch.toLowerCase())).map(subject => (
                  <button
                    key={subject.subject_id}
                    onClick={() => handleSubjectSelect(subject.subject_id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group ${
                      selectedSubject === subject.subject_id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      selectedSubject === subject.subject_id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
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
             <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-200">2</div>
             <h2 className="text-xl font-bold text-slate-800">Select Chapter</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[500px] flex flex-col">
             {!selectedSubject ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-600 font-bold mb-1">Pick a subject first</h3>
                  <p className="text-slate-400 text-sm">Select a subject to see available chapters for practice.</p>
               </div>
             ) : (
               <>
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500 transition-all mb-2">
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
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chapters (Optional)</span>
                       {loading.chapters && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>}
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {chapters.length > 0 ? (
                      chapters.filter(c => c.chapter_name.toLowerCase().includes(chapterSearch.toLowerCase())).map(chapter => (
                        <button
                          key={chapter.chapter_id}
                          onClick={() => setSelectedChapter(chapter.chapter_id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group ${
                            selectedChapter === chapter.chapter_id 
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            selectedChapter === chapter.chapter_id ? 'bg-white/20' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                          }`}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-left flex-1 text-sm">{chapter.chapter_name}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${selectedChapter === chapter.chapter_id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                        </button>
                      ))
                    ) : !loading.chapters && (
                      <div className="text-center py-20 px-4">
                        <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">No chapters found for this subject.</p>
                      </div>
                    )}
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Step 3: Ready to Start */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-200">3</div>
             <h2 className="text-xl font-bold text-slate-800">Ready to Start?</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[500px] flex flex-col p-8 justify-center text-center relative">
            {!selectedSubject ? (
              <div className="flex flex-col items-center justify-center opacity-50">
                <Target className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-600">Waiting for selection</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-[200px]">Pick a subject to activate your SpeakAlong session.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Great Choice!</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 w-full text-left">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selection Summary</div>
                   <div className="flex items-center gap-2 mb-1">
                      <BookMarked className="w-3 h-3 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700">{subjects.find(s => s.subject_id === selectedSubject)?.subject_name}</span>
                   </div>
                   {selectedChapter && (
                     <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-purple-500" />
                        <span className="text-xs font-bold text-slate-700">{chapters.find(c => c.chapter_id === selectedChapter)?.chapter_name}</span>
                     </div>
                   )}
                </div>
                
                <button
                  onClick={handleStart}
                  className="w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden relative group bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-right text-white shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Play className="w-5 h-5 fill-current" />
                  <span>START PRACTICE</span>
                </button>
                <p className="text-slate-400 text-[10px] mt-6 uppercase font-black tracking-widest">Ensure your microphone is ready</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
