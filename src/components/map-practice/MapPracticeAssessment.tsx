import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  HelpCircle, 
  Award, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MapPin,
  Compass,
  Trash2,
  Tag,
  Send,
  Eye,
  MinusCircle,
  CircleDot,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { MapPracticeService } from '../../services/MapPracticeService';
import DrawingCanvas, { CanvasShape, shapesToPoints, buildResponsesArray } from './DrawingCanvas';

interface MapPracticeAssessmentProps {
  onNavigate?: (pageId: string, params?: any) => void;
  params?: any;
}

export interface ToolConfigItem {
  tool_id: number;
  tool_name: string;
  is_required?: boolean;
  target_entity?: string;
  maximum_objects?: number;
  minimum_objects?: number;
}

export interface QuestionItem {
  id: number;
  attempt_question_id: number;
  question_id?: number;
  questionText?: string;
  question_text?: string;
  question_mode?: string;
  tool_config?: ToolConfigItem[];
  map_name?: string;
  render_file_uri?: string;
  canvas_width_px?: number;
  canvas_height_px?: number;
  locationName?: string;
  targetX?: number;
  targetY?: number;
  toleranceRadius?: number;
  hint?: string;
  explanation?: string;
  image?: string;
}

const TOOL_ICONS: Record<string, { icon: string; color: string; use: string }> = {
  POINT:     { icon: '📍', color: '#3b82f6', use: 'Cities, capitals, ports, peaks' },
  LINE:      { icon: '📏', color: '#6366f1', use: 'Boundaries, straight paths' },
  POLYLINE:  { icon: '〰️', color: '#2563eb', use: 'Rivers, mountain ranges, routes' },
  ARROW:     { icon: '➡️', color: '#f59e0b', use: 'Winds, currents, directions, movement' },
  AREA:      { icon: '🟦', color: '#3b82f6', use: 'Regions, plateaus, soil areas' },
  POLYGON:   { icon: '⬡', color: '#6366f1', use: 'Precisely bounded areas' },
  LABEL:     { icon: '🏷️', color: '#2563eb', use: 'Place names and annotations' },
  FREEHAND:  { icon: '✍️', color: '#f59e0b', use: 'Freehand tracing' },
  SYMBOL:    { icon: '⭐', color: '#ef4444', use: 'Mines, dams, ports, airports' },
  CIRCLE:    { icon: '⭕', color: '#3b82f6', use: 'Circular markings' },
  RECTANGLE: { icon: '▭', color: '#6366f1', use: 'Rectangular selection or marking' },
  SELECT:    { icon: '🖐️', color: '#64748b', use: 'Select & edit shapes' }
};

// Helper function to resolve stored attemptId from props or sessionStorage across page refresh
const getStoredAttemptId = (params?: any): number | null => {
  const paramAttempt = params?.attemptId || params?.attemptData?.attempt_id || params?.attemptData?.id;
  if (paramAttempt) return Number(paramAttempt);

  try {
    const savedParams = sessionStorage.getItem('mapPracticeParams');
    if (savedParams) {
      const parsed = JSON.parse(savedParams);
      const savedId = parsed?.attemptId || parsed?.attemptData?.attempt_id || parsed?.attemptData?.id;
      if (savedId) return Number(savedId);
    }
  } catch {}

  const savedAttemptId = sessionStorage.getItem('current_map_attempt_id');
  if (savedAttemptId) return Number(savedAttemptId);

  return null;
};

export default function MapPracticeAssessment({ onNavigate, params }: MapPracticeAssessmentProps) {
  const attemptId = getStoredAttemptId(params);

  // Questions state initialized from params or sessionStorage cache
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    if (params?.attemptData?.questions && Array.isArray(params.attemptData.questions) && params.attemptData.questions.length > 0) {
      return params.attemptData.questions;
    }
    if (attemptId) {
      try {
        const cached = sessionStorage.getItem(`map_questions_${attemptId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [loadQuestionsError, setLoadQuestionsError] = useState<string | null>(null);

  // Restore currentQuestionIdx from sessionStorage
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(() => {
    if (attemptId) {
      const savedIdx = sessionStorage.getItem(`map_idx_${attemptId}`);
      if (savedIdx !== null && !isNaN(Number(savedIdx))) return Number(savedIdx);
    }
    return 0;
  });

  // Restore shapesByQuestion from sessionStorage
  const [shapesByQuestion, setShapesByQuestion] = useState<Record<number, CanvasShape[]>>(() => {
    if (attemptId) {
      const savedShapes = sessionStorage.getItem(`map_shapes_${attemptId}`);
      if (savedShapes) {
        try { return JSON.parse(savedShapes); } catch {}
      }
    }
    return {};
  });

  // Restore submittedQuestions from sessionStorage
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, 'SUBMITTED' | 'SKIPPED'>>(() => {
    if (attemptId) {
      const savedSub = sessionStorage.getItem(`map_submitted_${attemptId}`);
      if (savedSub) {
        try { return JSON.parse(savedSub); } catch {}
      }
    }
    return {};
  });

  // Restore timerSeconds from sessionStorage
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    if (attemptId) {
      const savedTime = sessionStorage.getItem(`map_timer_${attemptId}`);
      if (savedTime !== null && !isNaN(Number(savedTime))) return Number(savedTime);
    }
    // return 600;
    
    // Extract duration_seconds passed from selection page assessment module
    const assessmentDuration = 
      params?.assessment?.duration_seconds || 
      params?.attemptData?.duration_seconds ||
      params?.attemptData?.duration ||
      params?.attemptData?.data?.duration_seconds;

    if (assessmentDuration && !isNaN(Number(assessmentDuration))) {
      return Number(assessmentDuration);
    }

    try {
      const savedParams = sessionStorage.getItem('mapPracticeParams');
      if (savedParams) {
        const parsed = JSON.parse(savedParams);
        const savedDuration = 
          parsed?.assessment?.duration_seconds || 
          parsed?.attemptData?.duration_seconds || 
          parsed?.attemptData?.duration ||
          parsed?.attemptData?.data?.duration_seconds;
        if (savedDuration && !isNaN(Number(savedDuration))) return Number(savedDuration);
      }
    } catch {}

    return 3600;
  });

  // Sync duration from params if refreshed or initialized without active timer
  useEffect(() => {
    const duration = 
      params?.assessment?.duration_seconds || 
      params?.attemptData?.duration_seconds ||
      params?.attemptData?.duration;
    if (duration && !isNaN(Number(duration))) {
      if (attemptId) {
        const savedTime = sessionStorage.getItem(`map_timer_${attemptId}`);
        if (!savedTime) setTimerSeconds(Number(duration));
      } else {
        setTimerSeconds(Number(duration));
      }
    }
  }, [params, attemptId]);


  // Active canvas state for current question
  const [activeTool, setActiveTool] = useState<string>('POINT');
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [selectedFilterTool, setSelectedFilterTool] = useState<string>('ALL');
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Browser Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Assessment flow & feedback state
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);
  const [score, setScore] = useState(0);

  // API submitting state
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isEndingAssessment, setIsEndingAssessment] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIdx] || questions[0];
  const isFirstQuestion = currentQuestionIdx === 0;
  const isLastQuestion = questions.length > 0 && currentQuestionIdx === questions.length - 1;

  // Toggle Browser HTML5 Native Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch((err) => {
        console.warn("Fullscreen request denied or blocked by browser:", err);
      });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Attempt auto-fullscreen on mount & monitor fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    // Auto-enter fullscreen mode when component mounts
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {
        // Browsers require user interaction to trigger fullscreen automatically
        console.log("Auto-fullscreen requires user gesture. User can click 'Full Screen' button.");
      });
    }

    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  /* =========================================================================
   * PROCTORED EXAM RESTRICTIONS (COMMENTED OUT FOR TESTING AS REQUESTED)
   * 
   * TO ENABLE FULL EXAM SECURITY AFTER TESTING:
   * Simply remove the comment block standard delimiters (/* and *\/) below!
   * ========================================================================= */
  /*
  useEffect(() => {
    // 1. Prevent Right Click / Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Prevent Copy, Paste, Cut & Text Selection
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 3. Tab Switch & Window Focus Loss Monitor
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn("Proctoring Alert: User switched tabs or minimized window!");
        alert("Warning: Leaving the exam tab is prohibited during test!");
      }
    };

    const handleWindowBlur = () => {
      console.warn("Proctoring Alert: Exam window lost focus!");
    };

    // 4. Prevent DevTools & Shortcut Keys (F12, Ctrl+Shift+I/C/J, Ctrl+U, Ctrl+S, Ctrl+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Attach exam security listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  */

  // Persist attemptId to sessionStorage
  useEffect(() => {
    if (attemptId) {
      sessionStorage.setItem('current_map_attempt_id', String(attemptId));
    }
  }, [attemptId]);

  // Persist currentQuestionIdx to sessionStorage
  useEffect(() => {
    if (attemptId) {
      sessionStorage.setItem(`map_idx_${attemptId}`, String(currentQuestionIdx));
    }
  }, [currentQuestionIdx, attemptId]);

  // Persist shapesByQuestion to sessionStorage
  useEffect(() => {
    if (attemptId) {
      sessionStorage.setItem(`map_shapes_${attemptId}`, JSON.stringify(shapesByQuestion));
    }
  }, [shapesByQuestion, attemptId]);

  // Persist submittedQuestions to sessionStorage
  useEffect(() => {
    if (attemptId) {
      sessionStorage.setItem(`map_submitted_${attemptId}`, JSON.stringify(submittedQuestions));
    }
  }, [submittedQuestions, attemptId]);

  // Persist timerSeconds to sessionStorage
  useEffect(() => {
    if (attemptId) {
      sessionStorage.setItem(`map_timer_${attemptId}`, String(timerSeconds));
    }
  }, [timerSeconds, attemptId]);

  // Resolve questions directly from startMapAssessment attemptData payload or sessionStorage
  useEffect(() => {
    let rawQuestions: QuestionItem[] = [];

    if (params?.attemptData?.questions && Array.isArray(params.attemptData.questions) && params.attemptData.questions.length > 0) {
      rawQuestions = params.attemptData.questions;
    } else {
      try {
        const savedParams = sessionStorage.getItem('mapPracticeParams');
        if (savedParams) {
          const parsed = JSON.parse(savedParams);
          const qList = parsed?.attemptData?.questions || parsed?.questions || parsed?.attemptData?.data?.questions;
          if (Array.isArray(qList) && qList.length > 0) {
            rawQuestions = qList;
          }
        }
      } catch {}
    }

    if (rawQuestions.length === 0 && attemptId) {
      try {
        const cached = sessionStorage.getItem(`map_questions_${attemptId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawQuestions = parsed;
          }
        }
      } catch {}
    }

    if (rawQuestions.length > 0) {
      setQuestions(rawQuestions);
      if (attemptId) {
        sessionStorage.setItem(`map_questions_${attemptId}`, JSON.stringify(rawQuestions));
      }
      setIsLoadingQuestions(false);
      setLoadQuestionsError(null);
    } else {
      setIsLoadingQuestions(false);
      setLoadQuestionsError("No active map assessment questions found. Please start an assessment from the module selection screen.");
    }
  }, [params, attemptId]);

  // Load active question state when question index or questions list changes
  useEffect(() => {
    if (!currentQuestion) return;

    const savedShapes = shapesByQuestion[currentQuestionIdx] || [];
    setShapes(savedShapes);
    setSelectedFilterTool('ALL');

    if (currentQuestion?.tool_config && currentQuestion.tool_config.length > 0) {
      setActiveTool((currentQuestion.tool_config[0].tool_name || 'POINT').toUpperCase());
    } else {
      setActiveTool('POINT');
    }

    setIsAnswerSubmitted(submittedQuestions[currentQuestionIdx] === 'SUBMITTED');
    setShowHint(false);
    setApiError(null);
  }, [currentQuestionIdx, questions]);

  // Handle updates to canvas shapes
  const handleShapesChange = (newShapes: CanvasShape[]) => {
    setShapes(newShapes);
    setShapesByQuestion(prev => ({
      ...prev,
      [currentQuestionIdx]: newShapes
    }));
    setApiError(null);
  };

  // Fetch Map Image using MapPracticeService.getMapImage directly from server
  useEffect(() => {
    let isMounted = true;
    let createdObjectUrl: string | null = null;

    const fetchMapImage = async () => {
      setImageError(false);
      const fileUri = currentQuestion?.render_file_uri;

      if (!fileUri) {
        if (currentQuestion?.image || params?.assessment?.image) {
          setMapImageUrl(currentQuestion?.image || params?.assessment?.image);
        } else {
          setImageError(true);
        }
        return;
      }

      setLoadingImage(true);
      try {
        const blobData = await MapPracticeService.getMapImage(fileUri);
        if (isMounted) {
          if (blobData instanceof Blob) {
            createdObjectUrl = URL.createObjectURL(blobData);
            setMapImageUrl(createdObjectUrl);
          } else if (typeof blobData === 'string') {
            setMapImageUrl(blobData);
          } else {
            setImageError(true);
          }
        }
      } catch (error) {
        console.error('Error fetching map image from getMapImage API:', error);
        if (isMounted) {
          if (currentQuestion?.image || params?.assessment?.image) {
            setMapImageUrl(currentQuestion?.image || params?.assessment?.image);
          } else {
            setImageError(true);
          }
        }
      } finally {
        if (isMounted) setLoadingImage(false);
      }
    };

    fetchMapImage();
    return () => {
      isMounted = false;
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [currentQuestion?.render_file_uri, currentQuestionIdx, questions]);

  // Timer countdown effect
  useEffect(() => {
    if (isEndingAssessment || isLoadingQuestions) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEndingAssessment, isLoadingQuestions]);

  // Helper function to update label name from Right-Hand Side
  const updateShapeLabel = (shapeId: string, newLabel: string) => {
    const updated = shapes.map(s => {
      if (s.id !== shapeId) return s;
      return { ...s, label: newLabel };
    });
    handleShapesChange(updated);
  };

  const deleteShape = (shapeId: string) => {
    const updated = shapes.filter(s => s.id !== shapeId);
    handleShapesChange(updated);
  };

  const assignQuickLabel = (shapeId: string, targetEntity: string) => {
    updateShapeLabel(shapeId, targetEntity);
  };

  // Submits the current question answer to MapPracticeService.submitUserAnswer
  // Sends responses array containing tool_type and geometry_data for each marked shape
  const submitCurrentQuestionAnswer = async (): Promise<boolean> => {
    const responses = buildResponsesArray(shapes);

    const payload = {
      attempt_id: Number(attemptId || 0),
      attempt_question_id: Number(currentQuestion?.attempt_question_id || currentQuestion?.id || 0),
      responses: responses
    };

    console.log(`Submitting Q${currentQuestionIdx + 1} Payload:`, payload);

    try {
      if (attemptId) {
        await MapPracticeService.submitUserAnswer(payload);
      }
      setIsAnswerSubmitted(true);
      setSubmittedQuestions(prev => ({
        ...prev,
        [currentQuestionIdx]: responses.length > 0 ? 'SUBMITTED' : 'SKIPPED'
      }));
      if (responses.length > 0) setScore(prev => prev + 10);
      return true;
    } catch (error: any) {
      console.error(`Error submitting answer for Q${currentQuestionIdx + 1}:`, error);
      setIsAnswerSubmitted(true);
      setSubmittedQuestions(prev => ({
        ...prev,
        [currentQuestionIdx]: responses.length > 0 ? 'SUBMITTED' : 'SKIPPED'
      }));
      return true;
    }
  };

  // Next button click handler:
  // Submits current question (with geometry_data if points set, or null if no points set), then advances
  const handleNextQuestion = async () => {
    if (isSubmittingAnswer || isEndingAssessment) return;

    setIsSubmittingAnswer(true);
    setApiError(null);

    try {
      const ok = await submitCurrentQuestionAnswer();
      if (ok) {
        setCurrentQuestionIdx(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('Error proceeding to next question:', err);
      setApiError('Failed to submit question answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Last Question Submit Assessment click handler:
  // Submits the last question first, and when successfully submitted calls endAssessment
  const handleFinalSubmitAndEnd = async () => {
    if (isSubmittingAnswer || isEndingAssessment) return;

    setIsSubmittingAnswer(true);
    setIsEndingAssessment(true);
    setApiError(null);

    try {
      // 1. Submit last question (with geometry_data if points set, or null if no points set)
      await submitCurrentQuestionAnswer();

      // 2. Call endAssessment when last question is successfully submitted
      const endPayload = { attempt_id: Number(attemptId || 0) };
      console.log("Ending Assessment Payload:", endPayload);

      if (attemptId) {
        await MapPracticeService.endMapAssessment(endPayload);
      }
    } catch (err: any) {
      console.error('Error during final assessment submission:', err);
    } finally {
      setIsSubmittingAnswer(false);
      setIsEndingAssessment(false);
      // onNavigate?.('map-practice-result', {
      onNavigate?.('map-practice-attempts', {
        attemptId: attemptId,
        assessmentId: params?.assessmentId,
        score: score,
        mapTitle: currentQuestion?.map_name || params?.mapTitle || 'Map Assessment'
      });
    }
  };

  // Previous Question handler
  const handlePreviousQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  // End Assessment manually via top header button
  const handleEndAssessmentManual = async () => {
    setIsEndingAssessment(true);
    const endPayload = { attempt_id: Number(attemptId || 0) };
    console.log("Manual End Assessment Payload:", endPayload);

    try {
      if (attemptId) {
        await MapPracticeService.endMapAssessment(endPayload);
      }
    } catch (err: any) {
      console.error('Error ending map assessment:', err);
    } finally {
      setIsEndingAssessment(false);
      onNavigate?.('map-practice-result', {
        attemptId: attemptId,
        assessmentId: params?.assessmentId,
        score: score,
        mapTitle: currentQuestion?.map_name || params?.mapTitle || 'Map Assessment'
      });
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const configuredTools = currentQuestion?.tool_config || [];
  const activeToolConfig = configuredTools.find(tc => tc.tool_name === activeTool);

  // Generate payload preview object matching exact backend schema with responses array
  const samplePayload = {
    attempt_id: Number(attemptId || 0),
    attempt_question_id: Number(currentQuestion?.attempt_question_id || currentQuestion?.id || 0),
    responses: buildResponsesArray(shapes)
  };

  // RENDER LOADING VIEW while fetching questions from server
  if (isLoadingQuestions) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-white space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <div className="text-center space-y-1">
          <h3 className="text-base font-extrabold tracking-wide">Loading Assessment Data...</h3>
          <p className="text-xs text-slate-400">Fetching attempt details directly from server</p>
        </div>
      </div>
    );
  }

  // RENDER ERROR VIEW if questions could not be loaded and no questions are available
  if (loadQuestionsError && questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="p-4 rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-extrabold text-slate-900">Assessment Data Unavailable</h2>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">{loadQuestionsError}</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Sync</span>
          </button>
          <button
            onClick={() => onNavigate?.('map-practice-selection')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Selection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col h-screen w-screen overflow-hidden font-sans select-none">
      {/* Exam Mode Top Header */}
      <header className="min-h-[3.5rem] py-1.5 shrink-0 bg-white border-b border-slate-200 px-2.5 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 z-40 shadow-xs select-none">
        {/* Left Side: Back button & Title info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={() => onNavigate?.('map-practice-selection')}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0"
            title="Exit Exam"
            aria-label="Exit Exam"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-none inline-block">
                {currentQuestion?.map_name || 'Map Assessment Exam'}
              </span>
            </div>
            <h2 className="font-extrabold text-slate-900 text-[11px] sm:text-xs md:text-sm tracking-tight leading-tight truncate">
              Attempt #{attemptId || '1'} <span className="hidden xs:inline">— Question {currentQuestionIdx + 1} of {questions.length}</span>
            </h2>
          </div>
        </div>

        {/* Right Side: Tools, Timer, Question Counter & End Exam */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
          {/* Fullscreen Toggle Button */}
          {/* <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 shrink-0" />}
            <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Full Screen"}</span>
          </button> */}

          {/* Live Timer */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-black shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="tabular-nums">{formatTimer(timerSeconds)}</span>
          </div>

          {/* Question Counter */}
          <div className="hidden xs:flex items-center px-2 sm:px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[11px] sm:text-xs font-black shrink-0">
            Q {currentQuestionIdx + 1} / {questions.length}
          </div>

          {/* Score Badge */}
          {/* <div className="hidden lg:flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black shrink-0">
            <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Score: {score}</span>
          </div> */}

          {/* End Assessment Button */}
          <button
            onClick={handleEndAssessmentManual}
            disabled={isEndingAssessment}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            End Exam
          </button>
        </div>
      </header>

      {/* Main Assessment Body - Full Screen Flex Container */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        
        {/* Left Column: Drawing Canvas Viewport */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 flex flex-col h-full overflow-hidden justify-between min-h-0">
          
          {/* Tools Bar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80 mb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">Tools:</span>
              
              {/* Select Tool */}
              <button
                onClick={() => setActiveTool('SELECT')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTool === 'SELECT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>🖐️</span>
                <span>SELECT</span>
              </button>

              {/* Tools defined in question tool_config */}
              {configuredTools.map(t => {
                const toolUpper = (t.tool_name || '').toUpperCase();
                const meta = TOOL_ICONS[toolUpper] || { icon: '📍', color: '#3b82f6' };
                const isSelected = activeTool.toUpperCase() === toolUpper;
                return (
                  <button
                    key={t.tool_id || t.tool_name}
                    onClick={() => setActiveTool(toolUpper)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{t.tool_name}</span>
                    {t.target_entity && (
                      <span className={`text-[9px] px-1 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {t.target_entity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Configured objects limit badge for active tool */}
            {activeToolConfig && activeToolConfig.maximum_objects && (
              <div className="text-[10px] font-extrabold text-blue-700 px-2.5 py-0.5 bg-blue-50 rounded-lg border border-blue-200/80 flex items-center gap-1">
                <span>{activeTool}:</span>
                <span className="font-black">
                  {shapes.filter(s => (s.type || '').toUpperCase() === activeTool.toUpperCase()).length} / {activeToolConfig.maximum_objects}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Canvas Container - Takes remaining height seamlessly */}
          <div className="flex-1 w-full relative bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center min-h-[320px]">
            {loadingImage ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                <span className="text-xs font-bold">Loading map canvas...</span>
              </div>
            ) : imageError ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 p-4 text-center">
                <AlertTriangle className="w-7 h-7 text-amber-500" />
                <span className="text-xs font-bold text-slate-300">Map Image Unavailable</span>
                <span className="text-[10px] text-slate-500">Could not fetch rendering image from server.</span>
              </div>
            ) : (
              <DrawingCanvas
                imageUrl={mapImageUrl}
                activeTool={activeTool}
                shapes={shapes}
                onChange={handleShapesChange}
                maxObjects={activeToolConfig?.maximum_objects || null}
                canvasWidthPx={currentQuestion?.canvas_width_px || 800}
                canvasHeightPx={currentQuestion?.canvas_height_px || 600}
              />
            )}
          </div>

          {/* Canvas Footer Status bar */}
          <div className="shrink-0 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1 pt-2">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Mark using <strong>{activeTool}</strong> tool</span>
            </span>
            {shapes.length > 0 && (
              <button
                onClick={() => handleShapesChange([])}
                className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear Canvas
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Display, Labels Input & Fixed Action Navigation */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden justify-between gap-3 min-h-0">

          {/* Read-Only Question Navigator Section */}
          <div className="shrink-0 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Question Status:</span>
              <span className="text-[9px] text-slate-400">Use Next/Previous to navigate</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const status = submittedQuestions[idx];

                return (
                  <div
                    key={q.id || idx}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : status === 'SUBMITTED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : status === 'SKIPPED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {status === 'SUBMITTED' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : status === 'SKIPPED' ? (
                      <MinusCircle className="w-3 h-3 text-amber-600" />
                    ) : isCurrent ? (
                      <CircleDot className="w-3 h-3 text-white" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    )}
                    <span>Q{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Container for Question Details & Label Inputs */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
            
            {/* Question Task Details Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Task #{currentQuestionIdx + 1} • {currentQuestion?.question_mode || 'MAP_MARKING'}
                </span>
                {submittedQuestions[currentQuestionIdx] === 'SUBMITTED' && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Submitted
                  </span>
                )}
                {submittedQuestions[currentQuestionIdx] === 'SKIPPED' && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <MinusCircle className="w-3 h-3" /> Skipped
                  </span>
                )}
              </div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-snug">
                {currentQuestion?.question_text || currentQuestion?.questionText || 'Mark the required locations on the map.'}
              </h3>

              {/* Hint Drawer */}
              {currentQuestion?.hint && (
                showHint ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium space-y-1">
                    <div className="font-extrabold uppercase text-[9px] tracking-wider text-amber-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Clue Hint
                    </div>
                    <p>{currentQuestion.hint}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer pt-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Need a memory clue? Click for hint</span>
                  </button>
                )
              )}
            </div>

            {/* Right-Hand Side Label Input Panel (Compact 1-line rows & Tool filter tabs) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs md:text-sm">
                    Markings & Labels ({shapes.length})
                  </h4>
                </div>

                {/* Tool Filter Tabs */}
                {shapes.length > 0 && configuredTools.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <button
                      onClick={() => setSelectedFilterTool('ALL')}
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                        selectedFilterTool === 'ALL'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ALL ({shapes.length})
                    </button>
                    {configuredTools.map(t => {
                      const toolUpper = (t.tool_name || '').toUpperCase();
                      const count = shapes.filter(s => (s.type || '').toUpperCase() === toolUpper).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={t.tool_id || t.tool_name}
                          onClick={() => setSelectedFilterTool(toolUpper)}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                            selectedFilterTool === toolUpper
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {toolUpper} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {shapes.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-0.5">
                  <MapPin className="w-5 h-5 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No markings placed on map</p>
                  <p className="text-[10px] text-slate-400">
                    Select a tool on the left and click on the map to place markings.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {shapes
                    .filter(s => selectedFilterTool === 'ALL' || (s.type || '').toUpperCase() === selectedFilterTool.toUpperCase())
                    .map((shape, idx) => {
                      const meta = TOOL_ICONS[shape.type.toUpperCase()] || { icon: '📍', color: '#3b82f6' };
                      const toolConfigMatch = configuredTools.find(t => (t.tool_name || '').toUpperCase() === (shape.type || '').toUpperCase());
                      const targetEntity = toolConfigMatch?.target_entity;

                      return (
                        <div 
                          key={shape.id || idx}
                          className="flex items-center gap-2 p-1.5 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all text-xs"
                        >
                          {/* Tool Icon & Type Badge */}
                          <div className="flex items-center gap-1 shrink-0 w-24">
                            <span className="text-xs">{meta.icon}</span>
                            <span className="font-extrabold text-slate-700 uppercase text-[10px] truncate" title={`${shape.type} #${idx + 1}`}>
                              {shape.type} #{idx + 1}
                            </span>
                          </div>

                          {/* Compact Label Input Box */}
                          <input
                            type="text"
                            placeholder="Enter label"
                            value={shape.label || ''}
                            onChange={(e) => updateShapeLabel(shape.id, e.target.value)}
                            className="flex-1 min-w-[120px] px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                          />

                          {/* Quick set chip */}
                          {targetEntity && (
                            <button
                              onClick={() => assignQuickLabel(shape.id, targetEntity)}
                              className="shrink-0 text-[9px] font-bold px-1.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 cursor-pointer"
                              title={`Set label to ${targetEntity}`}
                            >
                              + {targetEntity}
                            </button>
                          )}

                          {/* Delete Icon */}
                          <button
                            onClick={() => deleteShape(shape.id)}
                            className="shrink-0 p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete shape"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Feedback toast */}
              {isAnswerSubmitted && (
                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Answer Saved for Q{currentQuestionIdx + 1}</span>
                  </div>
                  <p className="font-medium text-slate-600 text-[10px]">
                    {currentQuestion?.explanation || 'Markings successfully submitted.'}
                  </p>
                </div>
              )}

              {apiError && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
            </div>

          </div>

          {/* Fixed Action Navigation Bar at bottom of right panel */}
          <div className="shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-md p-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Previous Button */}
              <button
                onClick={handlePreviousQuestion}
                disabled={isFirstQuestion || isSubmittingAnswer || isEndingAssessment}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {/* Next / Submit Assessment Button */}
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={isSubmittingAnswer || isEndingAssessment}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  {isSubmittingAnswer ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmitAndEnd}
                  disabled={isSubmittingAnswer || isEndingAssessment}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-600/20"
                >
                  {isSubmittingAnswer || isEndingAssessment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting & Ending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Assessment</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Live Payload Inspector Toggle */}
          {/* <div className="shrink-0 bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs">
            <button
              onClick={() => setShowPayloadPreview(!showPayloadPreview)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-600" />
                <span>{showPayloadPreview ? 'Hide API Payload Preview' : 'Show API Payload Preview'}</span>
              </span>
              <span className="text-[9px] text-slate-400">{showPayloadPreview ? '▲' : '▼'}</span>
            </button>

            {showPayloadPreview && (
              <pre className="mt-2 p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[9px] leading-relaxed overflow-x-auto max-h-36 border border-slate-800">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            )}
          </div> */}

        </div>
      </main>
    </div>
  );
}
