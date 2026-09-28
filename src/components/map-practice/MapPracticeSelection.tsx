import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Compass, 
  Search, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  AlertTriangle,
  Loader2,
  X,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';
import { MapPracticeService } from '../../services/MapPracticeService';
import Cookies from 'js-cookie';

interface MapPracticeSelectionProps {
  onNavigate?: (pageId: string, params?: any) => void;
}

export default function MapPracticeSelection({ onNavigate }: MapPracticeSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMapId, setSelectedMapId] = useState<string | number | null>(null);

  // API State
  const [apiAssessments, setApiAssessments] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal State
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [activeModalAssessment, setActiveModalAssessment] = useState<any | null>(null);
  const [isStartingAttempt, setIsStartingAttempt] = useState<boolean>(false);
  const [startAttemptError, setStartAttemptError] = useState<string | null>(null);

  // const categories = [
  //   { id: 'all', label: 'All Maps' },
  //   { id: 'india-physical', label: 'India Physical' },
  //   { id: 'india-political', label: 'India Political' },
  //   { id: 'world-physical', label: 'World Physical' },
  //   { id: 'world-political', label: 'World Political' },
  //   { id: 'history', label: 'Historical & Heritage' },
  // ];

  // const defaultMapList = [
  //   {
  //     id: 1,
  //     mapId: 'india-rivers',
  //     title: 'Rivers & River Basins of India',
  //     category: 'india-physical',
  //     categoryLabel: 'India Physical',
  //     difficulty: 'Intermediate',
  //     pinCount: 14,
  //     description: 'Himalayan rivers (Ganga, Indus, Brahmaputra) and Peninsular rivers (Godavari, Krishna, Narmada, Tapti).',
  //     image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80',
  //     popular: true
  //   },
  //   {
  //     id: 2,
  //     mapId: 'india-mountains',
  //     title: 'Mountain Ranges & Peaks of India',
  //     category: 'india-physical',
  //     categoryLabel: 'India Physical',
  //     difficulty: 'Intermediate',
  //     pinCount: 12,
  //     description: 'Himalayas, Western Ghats, Eastern Ghats, Aravalli, Vindhya, Satpura, K2, Kanchenjunga & Anamudi.',
  //     image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
  //     popular: false
  //   },
  //   {
  //     id: 3,
  //     mapId: 'india-states-capitals',
  //     title: '28 States & 8 Union Territories',
  //     category: 'india-political',
  //     categoryLabel: 'India Political',
  //     difficulty: 'Beginner',
  //     pinCount: 36,
  //     description: 'Identify state locations, capital cities, international boundary states, and coastal states.',
  //     image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
  //     popular: true
  //   },
  //   {
  //     id: 4,
  //     mapId: 'world-continents-oceans',
  //     title: 'Continents, Oceans & Seas',
  //     category: 'world-physical',
  //     categoryLabel: 'World Physical',
  //     difficulty: 'Beginner',
  //     pinCount: 15,
  //     description: 'Major continents, oceans, seas, gulfs, straits, and equator/tropics markers.',
  //     image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80',
  //     popular: false
  //   },
  //   {
  //     id: 5,
  //     mapId: 'world-countries-capitals',
  //     title: 'World Countries & Major Cities',
  //     category: 'world-political',
  //     categoryLabel: 'World Political',
  //     difficulty: 'Advanced',
  //     pinCount: 40,
  //     description: 'G20 countries, major world capitals, landlocked nations, and island states.',
  //     image: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=600&auto=format&fit=crop&q=80',
  //     popular: true
  //   },
  //   {
  //     id: 6,
  //     mapId: 'historical-sites-india',
  //     title: 'Harappan & Ancient History Sites',
  //     category: 'history',
  //     categoryLabel: 'Historical & Heritage',
  //     difficulty: 'Advanced',
  //     pinCount: 18,
  //     description: 'Indus Valley Civilisation sites (Harappa, Mohenjo-daro, Lothal, Kalibangan, Dholavira).',
  //     image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
  //     popular: false
  //   }
  // ];

  // Fetch assessments from MapPracticeService
  useEffect(() => {
    let isMounted = true;
    const fetchAssessments = async () => {
      setIsLoadingApi(true);
      setApiError(null);
      try {
        const response = await MapPracticeService.getMapAssessments();
        const assessmentsList = 
          response?.assessments || 
          response?.data?.assessments || 
          response?.data || 
          (Array.isArray(response) ? response : []);

        if (isMounted) {
          if (Array.isArray(assessmentsList) && assessmentsList.length > 0) {
            setApiAssessments(assessmentsList);
            setSelectedMapId(assessmentsList[0].assessment_id || assessmentsList[0].id);
          } else {
            setApiAssessments([]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load map assessments:', err);
        if (isMounted) {
          setApiError(err.message || 'Failed to load assessments from server.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingApi(false);
        }
      }
    };

    fetchAssessments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map API data parameters to UI fields
  const mergedMaps = apiAssessments.map((item: any, idx: number) => {
    const durationMin = item.duration_seconds ? Math.round(item.duration_seconds / 60) : 60;
    return {
      id: item.assessment_id || item.id || idx + 1,
      assessment_id: item.assessment_id || item.id,
      title: item.title || item.name || `Map Assessment #${item.assessment_id || idx + 1}`,
      description: item.description && item.description.trim() !== '' 
        ? item.description 
        : 'Interactive map practice assessment module to test your geographical spatial pin precision.',
      duration_seconds: item.duration_seconds || 3600,
      durationText: `${durationMin} Mins`,
      max_marks: item.max_marks !== undefined && item.max_marks !== null ? item.max_marks : 1.0,
      status: item.status || 'PUBLISHED',
      category: item.category || 'Map Practice',
      categoryLabel: item.category_label || item.status || 'Assessment',
      difficulty: item.difficulty || (item.max_marks > 50 ? 'Advanced' : 'Intermediate'),
      pinCount: item.question_count || item.total_questions || 10,
      image: item.image || item.thumbnail || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80',
      popular: idx % 2 === 0,
      rawApiData: item
    };
  });

  const filteredMaps = mergedMaps.filter(m => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || m.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Open Warning Popup Modal
  const openWarningPopup = (mapItem: any) => {
    setActiveModalAssessment(mapItem);
    setStartAttemptError(null);
    setShowWarningModal(true);
  };

  // Trigger startMapAssessment API and Navigate
  const handleConfirmStartAssessment = async () => {
    if (!activeModalAssessment) return;
    
    setIsStartingAttempt(true);
    setStartAttemptError(null);

    const rawUserId = Cookies.get('user_id') || localStorage.getItem('user_id');
    const userId = rawUserId ? (isNaN(Number(rawUserId)) ? rawUserId : Number(rawUserId)) : undefined;
    const assessmentId = activeModalAssessment.assessment_id || activeModalAssessment.id;

    const payload = {
      assessment_id: Number(assessmentId),
      user_id: userId
    };

    console.log("Start Assessment Payload:", payload);

    try {
      // Call MapPracticeService.startMapAssessment(payload)
      const resData = await MapPracticeService.startMapAssessment(payload);

      const attemptId = resData?.attempt_id || resData?.id || resData?.data?.attempt_id || resData?.data?.id;

      // Close modal and navigate to assessment page with params
      setShowWarningModal(false);
      onNavigate?.('map-practice-assessment', {
        attemptId: attemptId,
        attemptData: resData,
        assessmentId: assessmentId,
        mapId: activeModalAssessment.id,
        mapTitle: activeModalAssessment.title,
        assessment: activeModalAssessment
      });
    } catch (error: any) {
      console.error('Error starting map assessment:', error);
      setStartAttemptError(
        error?.response?.data?.message || error?.message || 'Failed to start assessment attempt. Please try again.'
      );
    } finally {
      setIsStartingAttempt(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" /> Map Module Selection
          </div> */}
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Select Map Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Module</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Choose an available map assessment module to begin your interactive location practice session.</p>
        </div>

        {/* {selectedMapId && (
          <button
            onClick={() => {
              const currentSelected = mergedMaps.find(m => String(m.id) === String(selectedMapId)) || mergedMaps[0];
              if (currentSelected) openWarningPopup(currentSelected);
            }}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Practice Session</span>
          </button>
        )} */}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search assessment title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoadingApi && (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <Loader2 className="w-9 h-9 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-slate-700">Loading map practice assessments...</p>
        </div>
      )}

      {/* Error / Empty State */}
      {!isLoadingApi && filteredMaps.length === 0 && (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">No Map Assessments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {apiError ? `Error: ${apiError}` : 'There are currently no active map practice assessments available.'}
            </p>
          </div>
        </div>
      )}

      {/* Map Cards Grid */}
      {!isLoadingApi && filteredMaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaps.map(map => {
            const isSelected = String(selectedMapId) === String(map.id);
            return (
              <div
                key={map.id}
                onClick={() => openWarningPopup(map)}
                className="group bg-white rounded-3xl border border-slate-200/80 hover:border-2 hover:border-blue-600 hover:ring-4 hover:ring-blue-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden shadow-xs cursor-pointer flex flex-col justify-between"
              >
                {/* Header Image / Badge View */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img 
                    src={map.image} 
                    alt={map.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-black text-white leading-snug drop-shadow-sm">{map.title}</h3>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {map.description}
                  </p>
                  
                  {/* Detailed Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{map.durationText}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{map.max_marks} Max Marks</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openWarningPopup(map);
                    }}
                    className="w-full py-3 rounded-2xl bg-gray-200 group-hover:bg-blue-600 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-blue-600/30 group-hover:text-white"
                  >
                    <span>Start Assessment</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WARNING POPUP MODAL */}
      {showWarningModal && activeModalAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
              <button 
                onClick={() => !isStartingAttempt && setShowWarningModal(false)}
                disabled={isStartingAttempt}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Start Confirmation</span>
                  <h3 className="text-xl font-black text-white leading-tight">Map Assessment Rules</h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Assessment Details</p>
                <h4 className="text-base font-black text-slate-900">{activeModalAssessment.title}</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Duration: <strong>{activeModalAssessment.durationText}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Max Marks: <strong>{activeModalAssessment.max_marks}</strong></span>
                  </div>
                </div>
              </div>

              {/* Guidelines / Warning items */}
              <div className="space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Important Attempt Guidelines:</p>
                <ul className="space-y-2.5 text-xs font-medium text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span><strong>Attempt Registration:</strong> Once confirmed, an official student attempt session for Assessment #{activeModalAssessment.assessment_id} will be registered.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span><strong>Timer Limit:</strong> You have {activeModalAssessment.durationText} to complete all location questions.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span><strong>Submit & Evaluation:</strong> Answers are sent dynamically. The final question will end and evaluate the test.</span>
                  </li>
                </ul>
              </div>

              {startAttemptError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{startAttemptError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowWarningModal(false)}
                disabled={isStartingAttempt}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStartAssessment}
                disabled={isStartingAttempt}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isStartingAttempt ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Starting Attempt...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Confirm & Start</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
