import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  ChevronRight, 
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
import { NoteService, NoteSubject, NoteChapter } from '../../services/NoteService';
import NotesViewer from './NotesViewer';

interface NotesSelectionProps {
  onNavigate?: (pageId: string, params?: any) => void;
}

export default function NotesSelection({ onNavigate }: NotesSelectionProps) {
  // Selected course from localStorage / Cookies or default
  const [courseId, setCourseId] = useState<number | string>(() => {
    return localStorage.getItem('course_id') || Cookies.get('course_id') || '1';
  });

  // State variables
  const [subjects, setSubjects] = useState<NoteSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | string | null>(null);
  
  const [chapters, setChapters] = useState<NoteChapter[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Active viewing state for NotesViewer PDF component
  const [activeNotesView, setActiveNotesView] = useState<{
    pdfUrl: string;
    chapterTitle: string;
    subjectName: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Load Subjects on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setError(null);
      try {
        const subs = await NoteService.getSubjectsByCourse(courseId);
        setSubjects(subs);
        if (subs && subs.length > 0) {
          setSelectedSubjectId(subs[0].id);
        }
      } catch (err) {
        console.error("Error loading note subjects:", err);
        setError("Failed to load subjects catalog.");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [courseId]);

  // ---------------------------------------------------------------------------
  // Load Chapters when selectedSubjectId changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchChapters = async () => {
      setIsLoadingChapters(true);
      try {
        const chaps = await NoteService.getChaptersBySubject(selectedSubjectId);
        setChapters(chaps);
      } catch (err) {
        console.error("Error loading note chapters:", err);
      } finally {
        setIsLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [selectedSubjectId]);

  // Handle clicking "View Notes" on a chapter card
  const handleOpenNotesPDF = async (chapter: NoteChapter) => {
    try {
      const activeSubject = subjects.find(s => String(s.id) === String(selectedSubjectId));
      const details = await NoteService.getNotesByChapter(chapter.id);
      
      const pdfUrlToUse = details.pdf_url || chapter.pdf_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

      setActiveNotesView({
        pdfUrl: pdfUrlToUse,
        chapterTitle: chapter.title,
        subjectName: activeSubject?.name || 'Study Notes'
      });
    } catch (err) {
      console.error("Error opening notes PDF:", err);
    }
  };

  // Filter chapters by search query
  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSubject = subjects.find(s => String(s.id) === String(selectedSubjectId));

  // ---------------------------------------------------------------------------
  // RENDER: If Active Notes Viewer is Open -> Render NotesViewer Component
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
  // RENDER: Main Notes Selection Screen
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-8 font-sans">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
            <BookMarked className="w-4 h-4 text-indigo-400" />
            <span>Digital Study Notes Library</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Digital Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Notes & PDF</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            Access chapter-wise DRM protected study material, revision formula sheets, and solved exercises. Select your subject below to start reading.
          </p>
        </div>
      </div>

      {/* Loading state for subjects */}
      {isLoadingSubjects && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading your course subjects catalog...</p>
        </div>
      )}

      {/* Main Selection Area */}
      {!isLoadingSubjects && (
        <div className="space-y-6">

          {/* Subject Selector Tabs */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Select Subject
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {subjects.map((subject) => {
                const isSelected = String(subject.id) === String(selectedSubjectId);
                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubjectId(subject.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {subject.code || 'SUB'}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>

                    <h3 className="font-extrabold text-sm leading-snug line-clamp-1">
                      {subject.name}
                    </h3>
                    <p className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {subject.chapterCount ? `${subject.chapterCount} Chapters` : 'Study Notes'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>{activeSubject?.name || 'Subject'} Chapter Notes</span>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search chapter title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Chapters Loading state */}
          {isLoadingChapters && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Loading chapters for {activeSubject?.name}...</p>
            </div>
          )}

          {/* Chapter Notes Grid */}
          {!isLoadingChapters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChapters.map((chapter) => (
                <div 
                  key={chapter.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                        Chapter #{chapter.chapter_number || chapter.id}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        <Shield className="w-3 h-3 text-emerald-600" /> DRM Protected
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {chapter.title}
                    </h3>

                    {chapter.description && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {chapter.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-medium text-slate-400">
                      {chapter.pages_count ? `${chapter.pages_count} Pages` : 'Digital PDF'} • {chapter.file_size || '3.5 MB'}
                    </div>

                    <button
                      onClick={() => handleOpenNotesPDF(chapter)}
                      className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Notes</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoadingChapters && filteredChapters.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Chapters Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No study notes match your search query for {activeSubject?.name}. Try clearing search filters.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
