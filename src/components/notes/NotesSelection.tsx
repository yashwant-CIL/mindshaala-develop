import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Shield, 
  Lock, 
  Search, 
  Layers, 
  CheckCircle2,
  BookMarked,
  ArrowRight
} from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { CommonApiServices } from '../../services/CommonApiServices';
import { NoteService } from '../../services/NoteService';
import { useCourse } from '../../context/CourseContext';
import NotesViewer from './NotesViewer';

export interface SubjectItem {
  subject_id?: number | string;
  id?: number | string;
  subject_name?: string;
  name?: string;
  subject_code?: string;
  code?: string;
  chapter_count?: number;
  chapterCount?: number;
  description?: string;
}

export interface ChapterItem {
  chapter_id?: number | string;
  id?: number | string;
  subject_id?: number | string;
  chapter_name?: string;
  name?: string;
  title?: string;
  chapter_number?: number;
  description?: string;
  notes_pdf_url?: string;
  pdf_url?: string;
  pages_count?: number;
  file_size?: string;
}

interface NotesSelectionProps {
  onNavigate?: (pageId: string, params?: any) => void;
}

export default function NotesSelection({ onNavigate }: NotesSelectionProps) {
  // Obtain subscriptionId and course info directly from CourseContext
  const courseContext = useCourse();
  const contextSubscriptionId = 
    courseContext?.subscriptionId || 
    courseContext?.selectedCourse?.subscription_id || 
    courseContext?.selectedCourse?.subscriptionId || 
    null;

  // Active subscription ID from context, localStorage, Cookies, or fallback
  const subscriptionId = 
    contextSubscriptionId || 
    localStorage.getItem('subscription_id') || 
    localStorage.getItem('selectedCourseId') ||
    Cookies.get('subscription_id') || 
    '100018';

  const userId = localStorage.getItem('user_id') || Cookies.get('user_id') || '100117';

  // State variables
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | string | null>(null);
  const [isMobileSubjectsOpen, setIsMobileSubjectsOpen] = useState<boolean>(false);
  
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Active viewing state for NotesViewer PDF component
  const [activeNotesView, setActiveNotesView] = useState<{
    pdfUrl: string;
    chapterTitle: string;
    subjectName: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // 1. Fetch Subjects whenever subscriptionId changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!subscriptionId) return;

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setError(null);
      try {
        console.log("Fetching subjects for subscriptionId:", subscriptionId);
        const res = await CommonApiServices.GET_ALL_SUBJECTS_BY_SUBSCRIPTION_ID(subscriptionId);
        console.log("Subjects response by subscription_id:", res);

        const subsList = res?.data?.subjects || res?.subjects || res?.data || (Array.isArray(res) ? res : []);
        
        if (Array.isArray(subsList) && subsList.length > 0) {
          setSubjects(subsList);
          const firstSubId = subsList[0].subject_id || subsList[0].id;
          if (firstSubId) {
            setSelectedSubjectId(firstSubId);
          }
        } else {
          // Fallback static subjects catalog if array is empty
          const fallbackSubs: SubjectItem[] = [
            { subject_id: 1, subject_name: 'Physics', subject_code: 'PHYS', description: 'Mechanics, Optics & Thermodynamics' },
            { subject_id: 2, subject_name: 'Chemistry', subject_code: 'CHEM', description: 'Organic, Inorganic & Physical Chemistry' },
            { subject_id: 3, subject_name: 'Mathematics', subject_code: 'MATH', description: 'Algebra, Calculus & Geometry' },
            { subject_id: 4, subject_name: 'Biology', subject_code: 'BIOL', description: 'Cell Biology, Genetics & Physiology' }
          ];
          setSubjects(fallbackSubs);
          setSelectedSubjectId(1);
        }
      } catch (err: any) {
        console.error("Error loading subjects by subscription ID:", err);
        setError("Failed to load subjects for this subscription.");
        // Fallback default subjects
        const fallbackSubs: SubjectItem[] = [
          { subject_id: 1, subject_name: 'Physics', subject_code: 'PHYS', description: 'Mechanics, Optics & Thermodynamics' },
          { subject_id: 2, subject_name: 'Chemistry', subject_code: 'CHEM', description: 'Organic, Inorganic & Physical Chemistry' },
          { subject_id: 3, subject_name: 'Mathematics', subject_code: 'MATH', description: 'Algebra, Calculus & Geometry' },
          { subject_id: 4, subject_name: 'Biology', subject_code: 'BIOL', description: 'Cell Biology, Genetics & Physiology' }
        ];
        setSubjects(fallbackSubs);
        setSelectedSubjectId(1);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [subscriptionId]);

  // ---------------------------------------------------------------------------
  // 2. Fetch Chapters using CommonApiServices.GET_ALL_CHAPTERS(subjectId)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchChapters = async () => {
      setIsLoadingChapters(true);
      try {
        console.log("Fetching chapters for subjectId:", selectedSubjectId);
        const res = await CommonApiServices.GET_ALL_CHAPTERS(selectedSubjectId);
        console.log("Chapters response for subject:", res);

        const chapsList = res?.data?.chapters || res?.chapters || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(chapsList) && chapsList.length > 0) {
          setChapters(chapsList);
        } else {
          // Fallback chapters if empty
          const fallbackChaps: ChapterItem[] = [
            { chapter_id: 101, subject_id: selectedSubjectId, chapter_name: 'Chapter 1: Core Concepts & Principles', description: 'Complete study notes and formula reference guide.' },
            { chapter_id: 102, subject_id: selectedSubjectId, chapter_name: 'Chapter 2: Advanced Applications & Practice', description: 'Solved examples, exercise solutions, and exam preparation.' }
          ];
          setChapters(fallbackChaps);
        }
      } catch (err: any) {
        console.error("Error loading chapters for subjectId:", selectedSubjectId, err);
        const fallbackChaps: ChapterItem[] = [
          { chapter_id: 101, subject_id: selectedSubjectId, chapter_name: 'Chapter 1: Core Concepts & Principles', description: 'Complete study notes and formula reference guide.' },
          { chapter_id: 102, subject_id: selectedSubjectId, chapter_name: 'Chapter 2: Advanced Applications & Practice', description: 'Solved examples, exercise solutions, and exam preparation.' }
        ];
        setChapters(fallbackChaps);
      } finally {
        setIsLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [selectedSubjectId]);

  // ---------------------------------------------------------------------------
  // 3. Fetch Notes PDF using NoteService.GET_NOTES(userId, subjectId, chapterId)
  // ---------------------------------------------------------------------------
  const [loadingChapterId, setLoadingChapterId] = useState<number | string | null>(null);

  // ---------------------------------------------------------------------------
  // 3. Fetch Notes PDF using NoteService.GET_NOTES(userId, subjectId, chapterId)
  // ---------------------------------------------------------------------------
  const handleOpenNotesPDF = async (chapter: ChapterItem) => {
    const chapterId = chapter.chapter_id || chapter.id;
    if (!selectedSubjectId || !chapterId) {
      toast.error("Invalid chapter or subject ID.");
      return;
    }

    setIsLoadingPdf(true);
    setLoadingChapterId(chapterId);
    try {
      console.log("Calling NoteService.GET_NOTES with params:", { userId, subjectId: selectedSubjectId, chapterId });
      const notesData = await NoteService.GET_NOTES(userId, selectedSubjectId, chapterId);
      console.log("NoteService.GET_NOTES response:", notesData);

      // 1. Check for failure status or error message returned by API
      if (
        notesData?.status === false || 
        notesData?.success === false || 
        notesData?.code === 404 || 
        notesData?.status === 404
      ) {
        const errMsg = notesData?.message || notesData?.error || notesData?.detail || "No notes found for this chapter.";
        toast.error(`⚠️ ${errMsg}`);
        return;
      }

      // 2. Extract valid PDF URL candidate
      const candidatePdfUrl = 
        notesData?.pdf_url || 
        notesData?.notes_pdf || 
        notesData?.pdf || 
        notesData?.data?.pdf_url || 
        notesData?.data?.notes_pdf || 
        notesData?.url || 
        notesData?.data?.url || 
        chapter.pdf_url ||
        chapter.notes_pdf_url ||
        (typeof notesData === 'string' && (notesData.includes('.pdf') || notesData.startsWith('http')) ? notesData : null);

      if (!candidatePdfUrl) {
        const errMsg = notesData?.message || notesData?.detail || "No study notes found for this chapter.";
        toast.error(`⚠️ ${errMsg}`);
        return;
      }

      // 3. Valid PDF found -> Navigate to DRM NotesViewer Component
      const activeSubject = subjects.find(s => String(s.subject_id || s.id) === String(selectedSubjectId));
      const subjectName = activeSubject?.subject_name || activeSubject?.name || 'Study Notes';
      const chapterTitle = chapter.chapter_name || chapter.title || chapter.name || `Chapter ${chapterId}`;

      setActiveNotesView({
        pdfUrl: candidatePdfUrl,
        chapterTitle,
        subjectName
      });
    } catch (err: any) {
      console.error("Error fetching notes PDF:", err);
      const apiErrorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.detail || 
        err?.response?.data?.error || 
        err?.message || 
        "No study notes found for this chapter.";

      toast.error(`⚠️ ${apiErrorMessage}`);
      // Stay on selection screen; do NOT navigate to NotesViewer when notes fail to fetch
    } finally {
      setIsLoadingPdf(false);
      setLoadingChapterId(null);
    }
  };

  // Filter chapters by search query
  const filteredChapters = chapters.filter(c => {
    const title = c.chapter_name || c.title || c.name || '';
    const desc = c.description || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) || desc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeSubject = subjects.find(s => String(s.subject_id || s.id) === String(selectedSubjectId));

  // ---------------------------------------------------------------------------
  // RENDER: If Active Notes Viewer is Open -> Render DRM NotesViewer Component
  // ---------------------------------------------------------------------------
  if (activeNotesView) {
    return (
      <NotesViewer 
        pdfUrl={activeNotesView.pdfUrl}
        chapterTitle={activeNotesView.chapterTitle}
        subjectName={activeNotesView.subjectName}
        onBack={() => setActiveNotesView(null)}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Main Compact & Responsive Notes Selection Screen
  // ---------------------------------------------------------------------------
  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 font-sans">
      
      {/* Compact Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-extrabold uppercase tracking-wider">
            <BookMarked className="w-3.5 h-3.5 text-indigo-400" />
            <span>Study Notes Library</span>
            <span className="text-slate-400">• Sub #{subscriptionId}</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
            Digital Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Notes & PDF</span>
          </h1>
        </div>

        {/* Integrated Search Bar inside Header */}
        <div className="relative z-10 w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search chapter notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Loading state for subjects */}
      {isLoadingSubjects && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading your subscribed subjects...</p>
        </div>
      )}

      {/* Main Split View: Master-Detail Layout */}
      {!isLoadingSubjects && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">

          {/* Left Column: Subscribed Subjects Navigation (Horizontal scroll on mobile, Vertical stack on Desktop) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Select Subject ({subjects.length})
              </h2>
            </div>

            {/* Mobile / Tablet Accordion Dropdown Selector (No Horizontal Scroll) */}
            <div className="lg:hidden space-y-2">
              <button
                onClick={() => setIsMobileSubjectsOpen(!isMobileSubjectsOpen)}
                className="w-full p-3.5 rounded-2xl bg-white border border-indigo-200/90 shadow-2xs flex items-center justify-between text-left active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                    {activeSubject?.subject_code || activeSubject?.code || 'SUB'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Subscribed Subject</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {activeSubject?.subject_name || activeSubject?.name || 'Select Subject'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 shrink-0">
                  <span>Change</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileSubjectsOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expandable Mobile Grid Menu */}
              {isMobileSubjectsOpen && (
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xl grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in duration-200">
                  {subjects.map((subject) => {
                    const subId = subject.subject_id || subject.id;
                    const subName = subject.subject_name || subject.name || 'Subject';
                    const subCode = subject.subject_code || subject.code || 'SUB';
                    const isSelected = String(subId) === String(selectedSubjectId);

                    return (
                      <button
                        key={subId}
                        onClick={() => {
                          setSelectedSubjectId(subId!);
                          setIsMobileSubjectsOpen(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-indigo-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {subCode}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="font-extrabold text-xs line-clamp-1">{subName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Vertical Subject List Cards */}
            <div className="hidden lg:flex flex-col gap-2.5">
              {subjects.map((subject) => {
                const subId = subject.subject_id || subject.id;
                const subName = subject.subject_name || subject.name || 'Subject';
                const subCode = subject.subject_code || subject.code || 'SUB';
                const isSelected = String(subId) === String(selectedSubjectId);

                return (
                  <button
                    key={subId}
                    onClick={() => setSelectedSubjectId(subId!)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-95 group ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {subCode}
                        </span> */}
                        <h3 className="font-extrabold text-xs sm:text-sm truncate">
                          {subName}
                        </h3>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0 transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Subject's Chapter Notes Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {/* Active Subject Bar */}
            <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-800">
                  {activeSubject?.subject_name || activeSubject?.name || 'Selected Subject'} Chapter Notes
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {filteredChapters.length} {filteredChapters.length === 1 ? 'Chapter' : 'Chapters'}
              </span>
            </div>

            {/* Chapters Loading state */}
            {isLoadingChapters && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Loading chapters for {activeSubject?.subject_name || activeSubject?.name}...</p>
              </div>
            )}

            {/* Chapter Notes Grid */}
            {!isLoadingChapters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {filteredChapters.map((chapter) => {
                  const chapId = chapter.chapter_id || chapter.id;
                  const chapName = chapter.chapter_name || chapter.title || chapter.name || `Chapter #${chapId}`;

                  return (
                    <div 
                      key={chapId}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-1.5">
                        {/* <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                            Chapter #{chapter.chapter_number || chapId}
                          </span>

                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <Shield className="w-3 h-3 text-emerald-600 shrink-0" /> DRM Protected
                          </span>
                        </div> */}

                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                          {chapName}
                        </h3>

                        {chapter.description && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                            {chapter.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {chapter.pages_count ? `${chapter.pages_count} Pages` : 'PDF Notes'}
                        </span>

                        <button
                          onClick={() => handleOpenNotesPDF(chapter)}
                          disabled={isLoadingPdf}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {loadingChapterId === chapId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          <span>View Notes</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {!isLoadingChapters && filteredChapters.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Chapters Found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No study notes match your search query for {activeSubject?.subject_name || activeSubject?.name}.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
