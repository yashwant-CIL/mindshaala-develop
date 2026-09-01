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
import { unlockSpeech } from '../../utils/ttsHelper';


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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

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
    setActiveStep(2); // Auto-advance to Step 2 on mobile/tablet
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
    
    unlockSpeech();
    onStartSession(payload);
  };


  return (
    <div className="p-2 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full h-[100dvh] lg:h-screen overflow-hidden flex flex-col bg-slate-50">
      {/* Header */}
      <div className="mb-2 sm:mb-6 text-center relative overflow-hidden py-2.5 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-3xl bg-white shadow-md border border-slate-100 shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 border border-indigo-100">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" /> Fluency Training
          </div>
          <h1 className="text-lg sm:text-3xl md:text-4xl font-black text-slate-900 mb-0.5 sm:mb-2 tracking-tight leading-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Practice Topic</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-[10px] sm:text-sm leading-relaxed hidden sm:block">
            Select a subject and optionally a chapter to start your SpeakAlong session.
          </p>
        </div>
      </div>

      {/* Mobile Step Indicator */}
      <div className="flex lg:hidden items-center justify-between bg-white px-2.5 py-2 rounded-xl border border-slate-200 mb-3 shadow-sm gap-1 sm:gap-2 shrink-0">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
            activeStep === 1
              ? 'bg-blue-50 text-blue-600 border border-blue-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Subject
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <button
          onClick={() => selectedSubject && setActiveStep(2)}
          disabled={!selectedSubject}
          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
            activeStep === 2
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              : selectedSubject
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          2. Chapter
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <button
          onClick={() => selectedSubject && setActiveStep(3)}
          disabled={!selectedSubject}
          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
            activeStep === 3
              ? 'bg-purple-50 text-purple-600 border border-purple-100'
              : selectedSubject
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          3. Ready
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-8 flex-1 min-h-0 pb-2 sm:pb-4 overflow-hidden">
        {/* Step 1: Subject Selection */}
        <div className={`space-y-2 sm:space-y-4 flex flex-col flex-1 h-full min-h-0 ${activeStep === 1 ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center gap-3 px-1 shrink-0">
             <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-indigo-200">1</div>
             <h2 className="text-base sm:text-lg font-bold text-slate-800">Select Subject</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
               <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search subjects..." 
                    className="bg-transparent border-none outline-none text-xs sm:text-sm w-full" 
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                  />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
              {loading.subjects ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <p className="text-slate-400 text-xs">Loading subjects...</p>
                </div>
              ) : subjects.length > 0 ? (
                subjects.filter(s => s.subject_name.toLowerCase().includes(subjectSearch.toLowerCase())).map(subject => (
                  <button
                    key={subject.subject_id}
                    onClick={() => handleSubjectSelect(subject.subject_id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group ${
                      selectedSubject === subject.subject_id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      selectedSubject === subject.subject_id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}>
                      <BookMarked className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-left flex-1 text-xs sm:text-sm">{subject.subject_name}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedSubject === subject.subject_id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </button>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <Layout className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">No subjects found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Chapter Selection */}
        <div className={`space-y-2 sm:space-y-4 flex flex-col flex-1 h-full min-h-0 ${activeStep === 2 ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center gap-3 px-1 shrink-0">
             <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-purple-200">2</div>
             <h2 className="text-base sm:text-lg font-bold text-slate-800">Select Chapter</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
             {!selectedSubject ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <BookOpen className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-slate-600 font-bold mb-1 text-xs sm:text-sm">Pick a subject first</h3>
                  <p className="text-slate-400 text-[10px] sm:text-xs max-w-[200px] mx-auto leading-relaxed">Select a subject to see available chapters for practice.</p>
               </div>
             ) : (
               <>
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                     <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500 transition-all mb-1.5">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Search chapters..." 
                          className="bg-transparent border-none outline-none text-xs sm:text-sm w-full"
                          value={chapterSearch}
                          onChange={(e) => setChapterSearch(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chapters (Optional)</span>
                        {loading.chapters && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 shrink-0"></div>}
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
                     {chapters.length > 0 ? (
                       chapters.filter(c => c.chapter_name.toLowerCase().includes(chapterSearch.toLowerCase())).map(chapter => (
                         <button
                           key={chapter.chapter_id}
                           onClick={() => {
                             setSelectedChapter(chapter.chapter_id);
                             setActiveStep(3); // Auto-advance to Step 3 on mobile/tablet
                           }}
                           className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group ${
                             selectedChapter === chapter.chapter_id 
                               ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                               : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                           }`}
                         >
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                             selectedChapter === chapter.chapter_id ? 'bg-white/20' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                           }`}>
                             <Layers className="w-4 h-4" />
                           </div>
                           <span className="font-bold text-left flex-1 text-xs sm:text-sm leading-snug">{chapter.chapter_name}</span>
                           <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedChapter === chapter.chapter_id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                         </button>
                       ))
                     ) : !loading.chapters && (
                       <div className="text-center py-12 px-4">
                         <Award className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                         <p className="text-slate-400 text-xs">No chapters found</p>
                       </div>
                     )}
                  </div>
               </>
             )}
          </div>
        </div>

        {/* Step 3: Ready to Start */}
        <div className={`space-y-2 sm:space-y-4 flex flex-col flex-1 h-full min-h-0 ${activeStep === 3 ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center gap-3 px-1 shrink-0">
             <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-200">3</div>
             <h2 className="text-base sm:text-lg font-bold text-slate-800">Ready to Start?</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0 p-4 sm:p-8 justify-center text-center relative">
            {!selectedSubject ? (
              <div className="flex flex-col items-center justify-center opacity-50 my-auto">
                <Target className="w-12 h-12 text-slate-300 mb-2" />
                <h3 className="text-sm sm:text-base font-bold text-slate-600">Waiting for selection</h3>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-1 max-w-[180px] mx-auto leading-relaxed">Pick a subject to activate your SpeakAlong session.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full my-auto">
                <h3 className="text-lg sm:text-2xl font-black text-slate-800 mb-1.5 shrink-0">Great Choice!</h3>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 mb-4 sm:mb-6 w-full text-left shrink-0">
                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Selection Summary</div>
                   <div className="flex items-center gap-2 mb-1.5">
                      <BookMarked className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{subjects.find(s => s.subject_id === selectedSubject)?.subject_name}</span>
                   </div>
                   {selectedChapter && (
                     <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 truncate">{chapters.find(c => c.chapter_id === selectedChapter)?.chapter_name}</span>
                     </div>
                   )}
                </div>
                
                <button
                  onClick={handleStart}
                  className="w-full py-3 sm:py-3.5 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden relative group bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-right text-white shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
                  <span>START PRACTICE</span>
                </button>
                <p className="text-slate-400 text-[9px] mt-3 sm:mt-4 uppercase font-black tracking-widest shrink-0">Ensure your microphone is ready</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
