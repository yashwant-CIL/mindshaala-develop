import { useState, useRef, useEffect } from 'react';
import {
  Mic, Square, Send, Volume2, VolumeX,
  ChevronRight, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  BookOpen, Target, ChevronDown, Search, Check,
  HelpCircle, AlertTriangle, Lock, Unlock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { VivaService } from '../services/VivaService';
import { latexToText } from '../shared/mathjaxconfig/QuestionMathJax';
import { useCourse } from '../context/CourseContext';
import { QuestionMathJax } from '../shared/mathjaxconfig/QuestionMathJax';
import { speakText, unlockSpeech } from '../utils/ttsHelper';


// ============================================================================
// TYPES
// ============================================================================

interface Subject {
  id: string;
  name: string;
  icon: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  totalQuestions: number;
}

interface Question {
  id: string;
  text: string;
}

// ============================================================================
// SAMPLE DATA (Simplified for structure)
// ============================================================================

const subjects: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    chapters: [
      {
        id: 'kinematics',
        name: 'Kinematics',
        topics: [{ id: 'motion', name: 'Motion in a Straight Line', totalQuestions: 5 }]
      },
      {
        id: 'optics',
        name: 'Optics',
        topics: [{ id: 'reflection', name: 'Reflection', totalQuestions: 5 }]
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪',
    chapters: [
      {
        id: 'atomic',
        name: 'Atomic Structure',
        topics: [{ id: 'structure', name: 'Basic Structure', totalQuestions: 5 }]
      }
    ]
  }
];

const sampleQuestions: Question[] = [
  { id: 'q1', text: 'Explain the concept of velocity and how it differs from speed.' },
  { id: 'q2', text: 'State Newton\'s First Law of Motion and give a real-world example.' },
  { id: 'q3', text: 'What is the difference between scalar and vector quantities?' },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface VivaPracticeTestingProps {
  onFinish?: () => void;
}

export default function VivaPracticeTesting({ onFinish }: VivaPracticeTestingProps = {}) {
  // Helper to load initial state
  const getSavedState = (key: string, fallback: any) => {
    try {
      const saved = localStorage.getItem('viva_practice_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[key] !== undefined ? parsed[key] : fallback;
      }
    } catch (e) {
      console.error("Error parsing saved state", e);
    }
    return fallback;
  };

  // State with lazy initialization
  const { subscriptionId, courseId } = useCourse();
  const [selectedSubject, setSelectedSubject] = useState<string>(() => getSavedState('selectedSubject', ''));
  const [selectedChapter, setSelectedChapter] = useState<string>(() => getSavedState('selectedChapter', ''));
  const [sessionStarted, setSessionStarted] = useState(() => getSavedState('sessionStarted', false));

  // ============================================================================
  // SUBSCRIPTION & VIVA TYPE (CIL/PRO) STATES
  // ============================================================================
  // Mock subscription state by default (both CIL and PRO are active).
  // Users can easily change these values to test scenarios:
  // - Both accessible: { hasCIL: true, hasPRO: true }
  // - CIL only:        { hasCIL: true, hasPRO: false }
  // - PRO only:        { hasCIL: false, hasPRO: true }
  const [userSubscriptions, setUserSubscriptions] = useState({
    hasCIL: true,
    hasPRO: true
  });

  const [vivaType, setVivaType] = useState<'CIL' | 'PRO'>(() => getSavedState('vivaType', 'CIL'));

  // Switcher function with restriction checking and toast warning
  const handleToggleSwitch = (type: 'CIL' | 'PRO') => {
    if (vivaType === type) return;

    if (userSubscriptions.hasCIL && userSubscriptions.hasPRO) {
      // Both subscriptions are available, switch permitted
      setVivaType(type);
      toast.success(`Switched to ${type} Mode!`, {
        duration: 500,
        position: 'top-center'
      });
    } else {
      // Restrict toggle switch and show toast
      const currentActive = userSubscriptions.hasCIL ? 'CIL' : 'PRO';
      toast((t) => (
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">🔒</span>
            <span className="text-xs font-semibold text-slate-800">
              Locked! You only have a {currentActive} subscription. Upgrade to access {type} Viva.
            </span>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors font-bold text-[10px] border border-slate-200/50 shrink-0"
          >
            ✕
          </button>
        </div>
      ), {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#fff',
          color: '#333',
          padding: '10px 14px',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          maxWidth: '385px'
        }
      });
    }
  };
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => getSavedState('currentQuestionIndex', 0));

  // Chapter selection dropdown state
  const [isOpenChapterDropdown, setIsOpenChapterDropdown] = useState(false);
  const [chapterSearchQuery, setChapterSearchQuery] = useState('');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(45);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [chaptersData, setChaptersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vivaData, setVivaData] = useState<any>(() => getSavedState('vivaData', null));
  // const [answerFeedback , setAnswerFeedback] = useState<any>(null);

  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(() => {
    const saved = getSavedState('submittedQuestions', []);
    return new Set(saved);
  });

  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(() => {
    const saved = getSavedState('skippedQuestions', []);
    return new Set(saved);
  });

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isFeedbackMuted, setIsFeedbackMuted] = useState(false);
  const [isQuestionMuted, setIsQuestionMuted] = useState(() => getSavedState('isQuestionMuted', false));
  const lastReadFeedbackRef = useRef<string | null>(null);

  // Confirmation Modal States
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);

  // Store results for each question to persist feedback
  const [questionResults, setQuestionResults] = useState<Record<string, any>>(() => getSavedState('questionResults', {}));

  // Save full state to localStorage whenever relevant state changes
  useEffect(() => {
    if (!sessionStarted && currentQuestionIndex === 0 && !vivaData) {
      // Skip saving if we just cleared the state
      return;
    }
    localStorage.setItem('viva_practice_state', JSON.stringify({
      selectedSubject,
      selectedChapter,
      sessionStarted,
      currentQuestionIndex,
      vivaData,
      submittedQuestions: Array.from(submittedQuestions),
      skippedQuestions: Array.from(skippedQuestions),
      questionResults,
      vivaType,
      isQuestionMuted
    }));
  }, [selectedSubject, selectedChapter, sessionStarted, currentQuestionIndex, vivaData, submittedQuestions, skippedQuestions, questionResults, vivaType, isQuestionMuted]);

  // Synchronize selected vivaType with user subscriptions (if subscription restrictions change)
  useEffect(() => {
    if (!userSubscriptions.hasCIL && userSubscriptions.hasPRO && vivaType !== 'PRO') {
      setVivaType('PRO');
    } else if (userSubscriptions.hasCIL && !userSubscriptions.hasPRO && vivaType !== 'CIL') {
      setVivaType('CIL');
    }
  }, [userSubscriptions, vivaType]);

  // Full Screen, Navigation Blocking, and Sidebar Visibility
  useEffect(() => {
    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
    const sidebarMini = document.querySelector('[data-sidebar-mini]') as HTMLElement;
    const floatingActions = document.getElementById('floating-actions-container');

    if (sessionStarted) {
      // ── SESSION ACTIVE: hide sidebar (full + mini strip), enter fullscreen, block navigation ──

      // Request Full Screen
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.error("Error attempting to enable full-screen mode:", err));
      }

      // Block Back Button
      window.history.pushState(null, "", window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
        toast.error("You cannot go back during an active session. Please click 'End Session' to exit.");
      };

      // Warn on Tab Close / Refresh
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Hide full sidebar, mobile mini strip, and floating actions
      if (sidebar) sidebar.style.display = 'none';
      if (sidebarMini) sidebarMini.style.display = 'none';
      if (floatingActions) floatingActions.style.display = 'none';

      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);

        // Restore full sidebar, mobile mini strip, and floating actions
        if (sidebar) sidebar.style.display = '';
        if (sidebarMini) sidebarMini.style.display = '';
        if (floatingActions) floatingActions.style.display = '';

        // Exit Full Screen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error("Error attempting to exit full-screen mode:", err));
        }
      };
    } else {
      // ── SELECTION PAGE: always ensure both sidebar elements are visible ──
      if (sidebar) sidebar.style.display = '';
      if (sidebarMini) sidebarMini.style.display = '';
      if (floatingActions) floatingActions.style.display = '';
    }

    // Cleanup on component unmount — always restore sidebar
    return () => {
      if (sidebar) sidebar.style.display = '';
      if (sidebarMini) sidebarMini.style.display = '';
      if (floatingActions) floatingActions.style.display = '';
    };
  }, [sessionStarted]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null); // Use a ref to keep the instance persistent
  const isAutoSubmittingRef = useRef<boolean>(false);

  useEffect(() => {

    const fetchSubjects = async () => {
      try {
        setSubjectsLoading(true);
        if (!subscriptionId) return;
        const data = await VivaService.getAllSubjects(subscriptionId);
        if (data) {
          console.log("Subject Data", data);
          setSubjects(data);
        }
      } catch (error) {
        console.error("Error navigating to subject:", error);
      } finally {
        setSubjectsLoading(false);
      }
    };

    if (subscriptionId) {
      fetchSubjects();
    }
  }, [subscriptionId]);


  // REMOVED: Load state from localStorage on mount (now handled by lazy init)

  // (Redundant localStorage save removed)

  // Fetch Chapters when Subject Changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedSubject) {
        setChaptersData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await VivaService.getAllChapters(selectedSubject);
        if (data) {
          console.log("Chapters Data:", data);
          setChaptersData(data);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setError("Failed to load chapters. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we didn't just restore from local storage or if we need to refresh
    // For simplicity, we fetch every time subject changes, which is fine.
    fetchChapters();
  }, [selectedSubject]);

  // Initial Setup for Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscription(prev => (prev + ' ' + final).trim());
        }
        setInterimTranscription(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone access denied. Please allow it in settings.");
        } else if (event.error === 'network') {
          setSpeechError("Network error. Speech recognition requires internet connection.");
        } else {
          setSpeechError(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
      setSpeechError("Speech Recognition is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto submit when reach 0
            setTimeout(() => {
              isAutoSubmittingRef.current = true;
              stopRecording();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // TTS Helper
  const speakQuestion = (text: string) => {
    speakText(text, {
      rate: 1.0,
      pitch: 1.0
    });
  };

  // Start Session API Call
  const handleStartApiSession = async () => {
    if (!selectedSubject) return;

    setLoading(true);
    try {
      const payload: any = {
        module_type: 'VIVA',
        user_id: localStorage.getItem('user_id'),
        course_id: courseId,
        subject_id: Number(selectedSubject) || 0,
        viva_type: vivaType // Parameter indicating selected subscription level (CIL/PRO)
      };

      if (selectedChapter) {
        payload.chapter_id = String(selectedChapter);
      }

      console.log("Starting Viva Session with payload:", payload);

      const response = await VivaService.startViva(payload);

      if (response.status === 200) {
        console.log("Session started successfully:", response.data);
        setSessionStarted(true);
        setCurrentQuestionIndex(0);
        setVivaData(response.data);
        setQuestionStartTime(Math.floor(Date.now() / 1000));
        // Auto-read first question
        // if (sampleQuestions.length > 0) {
        //     setTimeout(() => speakQuestion(sampleQuestions[0].text), 1000);
        // }
        // if (response.data.questions.length > 0) {
        //   setTimeout(() => speakQuestion(response.data.questions[0].text), 1000);
        // }
      }
    } catch (error: any) {
      if (error.response.data.detail) {
        toast.error(error.response.data.detail);
        console.log("Error", error.response.data.detail)
        // toast.error("No Viva Questions available for this chapter.");
      } else {
        toast.error("Failed to start session. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };



  // Recording Handlers
  const startRecording = async () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        if (isAutoSubmittingRef.current) {
          isAutoSubmittingRef.current = false;
          handleSubmit(false, false, blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(45);
      setTranscription('');
      setSpeechError(null);

      // Start Speech Recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log("Speech recognition already started, continuing.");
        }
      }

    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);

      // Stop Speech Recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (isNavigation: boolean = false, isEndSession: boolean = false, autoBlob?: Blob) => {

    // Get current question ID
    const qId = vivaData?.questions?.[currentQuestionIndex]?.question_details?.question_id || sampleQuestions[currentQuestionIndex]?.id || 'unknown';

    // Time Parameters
    const endTime = Math.floor(Date.now() / 1000);
    const startTimeValue = questionStartTime || endTime; // Fallback to now if not set
    const totalTimeTaken = endTime - startTimeValue;

    // If already submitted, just proceed with navigation if requested
    if (submittedQuestions.has(qId)) {
      // Allow resubmission if it was previously skipped and we now have an audio recording
      const canResubmit = skippedQuestions.has(qId) && audioBlob;
      if (!canResubmit) {
        if (isNavigation && !isEndSession) {
          handleNext(true); // Move next without submitting
          return;
        }
        if (isEndSession) {
          handleEndSessionApi();
          return;
        }
        return;
      }
    }

    // New Logic for End Session: If ending session and no audio, treat as skip/submit empty
    if (isEndSession && !audioBlob) {
      // Proceed to submit without audio (Skip logic)
      console.log("Ending session on unattempted question. Submitting as skipped.");
    }
    // If NOT ending session, require audio unless explicitly allowed to skip (which we don't have a button for yet, but user asked for "End Session" to submit)
    else if (!audioBlob && !autoBlob && !isNavigation) {
      toast.error("Please record an answer before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const sessionId = vivaData?.session?.session_id;

      formData.append('module_type', 'VIVA');
      if (sessionId) formData.append('session_id', Math.floor(Number(sessionId)) as any);
      formData.append('question_id', Math.floor(Number(qId)) as any);
      
      const blobToSubmit = autoBlob || audioBlob;
      if (blobToSubmit) {
        // Ensure .wav extension is used as requested
        formData.append('audio_file', blobToSubmit, `question_${currentQuestionIndex}.wav`);
      } else {
        formData.append('audio_file', 'null');
      }

      formData.append('start_time', String(startTimeValue));
      formData.append('end_time', String(endTime));
      formData.append('total_time_taken', String(totalTimeTaken));

      console.log("Submitting Answer...", {
        module_type: 'VIVA',
        session_id: Math.floor(Number(sessionId)),
        question_id: Math.floor(Number(qId)),
        start_time: String(startTimeValue),
        end_time: String(endTime),
        total_time_taken: String(totalTimeTaken),
        hasAudio: !!blobToSubmit
      });

      const response = await VivaService.submitAnswer(formData);

      if (response.status === 200 || response.status === 201) {
        console.log("Answer Submitted Successfully", response.data);

        // Mark as submitted
        setSubmittedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.add(qId);
          return newSet;
        });

        // Mark as skipped or remove from skipped based on whether audio was provided
        setSkippedQuestions(prev => {
          const newSet = new Set(prev);
          if (!blobToSubmit) {
            newSet.add(qId);
          } else {
            newSet.delete(qId);
          }
          return newSet;
        });

        // Store Result
        setQuestionResults(prev => ({
          ...prev,
          [qId]: response.data
        }));

        setFeedback(response.data);
        setFeedbackVisible(true);

        if (isNavigation) {
          handleNext(true);
        } else if (isEndSession) {
          // Determine if we should wait or call end session immediately
          // User asked: "when the sumit api get successfully called then the session end api get called"
          handleEndSessionApi();
        }
      }
    } catch (error) {
      console.error("Error submitting before move:", error);
      toast.error("Failed to save answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSessionApi = async () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      setIsEndingSession(true);
      // Stop any ongoing speech immediately
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const sessionId = vivaData?.session?.session_id;
      if (sessionId) {
        await VivaService.endViva(sessionId, 'VIVA');
      }
      toast.success("Session Completed Successfully!");
      // Reset State completely
      handleBack();
      if (onFinish) {
        onFinish();
      }
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Error ending session.");
    } finally {
      setIsEndingSession(false);
      setLoading(false);
    }
  };

  const handleEndSessionClick = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsEndingSession(true); // Set this early to prevent other operations
    const qId = vivaData?.questions?.[currentQuestionIndex]?.question_details?.question_id || sampleQuestions[currentQuestionIndex]?.id || 'unknown';
    if (!submittedQuestions.has(qId)) {
      handleSubmit(false, true);
    } else {
      handleEndSessionApi();
    }
  };

  // Auto-read question when index changes
  useEffect(() => {
    if (sessionStarted && !isQuestionMuted) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const currentQ = vivaData?.questions?.[currentQuestionIndex] || sampleQuestions[currentQuestionIndex];
      // Fallback text to support speech for all questions
      const textToSpeak = currentQ?.question_transcribe ||
        (currentQ?.question_details?.question_latex ? latexToText(currentQ.question_details.question_latex) : "") ||
        (currentQ as any)?.text || "";

      if (textToSpeak) {
        // Small delay to ensure state updates and previous speech cancellation
        const timer = setTimeout(() => speakQuestion(textToSpeak), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentQuestionIndex, sessionStarted, vivaData, isQuestionMuted]);

  // Update Start Time when question changes
  useEffect(() => {
    if (sessionStarted) {
      setQuestionStartTime(Math.floor(Date.now() / 1000));
    }
  }, [currentQuestionIndex, sessionStarted]);

  // Next Question
  const handleNext = (forceMove: boolean = false) => {
    // If called from button (forceMove=false of type event), we try to submit/check first
    const isForceMove = typeof forceMove === 'boolean' ? forceMove : false;

    if (!isForceMove) {
      const isLast = currentQuestionIndex === (vivaData?.questions?.length || sampleQuestions.length) - 1;

      if (isLast) {
        handleSubmit(false, true); // Treat as End Session
      } else {
        handleSubmit(true, false); // Treat as Next Navigation
      }
      return;
    }

    // Normal move logic
    if (vivaData?.questions && currentQuestionIndex < vivaData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetSessionState();
    }
    else if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetSessionState();
    }
  };

  const handlePrevious = () => {
    movePrevious();
  };



  const movePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetSessionState();
    }
  };

  const resetSessionState = () => {
    setFeedbackVisible(false);
    // setAnswerFeedback(null); // If I were using it, but I used setFeedback
    setFeedback(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setRecordingTime(45);

    // Stop any recording if active
    if (isRecording) {
      stopRecording();
    }
  };

  // Format Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSessionStarted(false);
    setVivaData(null);
    setCurrentQuestionIndex(0);
    setSubmittedQuestions(new Set());
    setSkippedQuestions(new Set());
    setQuestionResults({});
    setIsFeedbackMuted(false);
    lastReadFeedbackRef.current = null;
    localStorage.removeItem('viva_practice_state');

    // Explicitly exit full screen if not already handled by cleanup
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Error attempting to exit full-screen mode:", err));
    }
  };

  const currentQuestionData = vivaData?.questions?.[currentQuestionIndex];
  const qId = currentQuestionData?.question_details?.question_id || sampleQuestions[currentQuestionIndex]?.id || 'unknown';

  // Use persistent result if available, otherwise current feedback
  const currentResult = questionResults[qId] || (feedbackVisible && feedback?.question_id === qId ? feedback : null);

  const questionTextToDisplay = currentQuestionData?.question_transcribe ||
    (currentQuestionData?.question_details?.question_latex ? latexToText(currentQuestionData.question_details.question_latex) : "") ||
    sampleQuestions[currentQuestionIndex]?.text || "";
  const questionTextToSpeak = currentQuestionData?.question_transcribe ||
    (currentQuestionData?.question_details?.question_latex ? latexToText(currentQuestionData.question_details.question_latex) : "") ||
    sampleQuestions[currentQuestionIndex]?.text || "";
  const isLastQuestion = currentQuestionIndex === (vivaData?.questions?.length || sampleQuestions.length) - 1;
  const isCurrentSubmitted = submittedQuestions.has(qId);
  const isCurrentSkipped = skippedQuestions.has(qId);

  // Mute toggle effect for feedback
  useEffect(() => {
    if (isFeedbackMuted) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isFeedbackMuted]);

  // Mute toggle effect for question
  useEffect(() => {
    if (isQuestionMuted) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isQuestionMuted]);

  // Auto-read feedback
  useEffect(() => {
    // Don't read feedback if session is ending or muted
    if (isEndingSession) return;

    if (currentResult && currentResult.ai_feedback && !isCurrentSkipped && (isCurrentSubmitted || feedbackVisible)) {
      if (lastReadFeedbackRef.current !== qId) {
        lastReadFeedbackRef.current = qId;
        if (!isFeedbackMuted) {
          const timer = setTimeout(() => {
            speakQuestion(currentResult.ai_feedback);
          }, 500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentResult, isCurrentSkipped, isCurrentSubmitted, feedbackVisible, qId, isFeedbackMuted]);

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-3 sm:p-6 lg:p-8 flex flex-col space-y-4 sm:space-y-6  mx-auto w-full animate-in fade-in duration-500 pb-20">

        {/* Header Section with Toggle (CIL & PRO) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:pb-6 border-b border-slate-200/80 shrink-0 w-full">
          {/* Back Button + Title group */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            {onFinish && (
              <button
                onClick={onFinish}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all duration-200 text-sm font-semibold group shrink-0"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span>Back</span>
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight text-left">
              Viva Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Testing</span>
            </h1>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2.5">
            {/* Premium Sliding Toggle */}
            <div className="relative flex items-center bg-slate-100 p-1.5 rounded-full border border-slate-200 w-56 shadow-inner">
              {/* Sliding Pill Background with Gradient */}
              <div
                className={`absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md transition-all duration-300 ease-out ${vivaType === 'CIL'
                  ? 'left-1 w-[calc(50%-4px)]'
                  : 'left-[calc(50%+2px)] w-[calc(50%-4px)]'
                  }`}
              />

              {/* CIL Switch Button */}
              <button
                onClick={() => handleToggleSwitch('CIL')}
                className={`relative z-10 flex-1 py-1.5 flex items-center justify-center gap-1.5 text-center text-xs font-extrabold uppercase tracking-wider transition-colors duration-300 ${vivaType === 'CIL' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {userSubscriptions.hasCIL ? (
                  <Unlock className="w-3.5 h-3.5 transition-transform duration-300" />
                ) : (
                  <Lock className={`w-3.5 h-3.5 transition-transform duration-300 ${vivaType === 'CIL' ? 'text-white' : 'text-slate-400'}`} />
                )}
                <span>CIL</span>
              </button>

              {/* PRO Switch Button */}
              <button
                onClick={() => handleToggleSwitch('PRO')}
                className={`relative z-10 flex-1 py-1.5 flex items-center justify-center gap-1.5 text-center text-xs font-extrabold uppercase tracking-wider transition-colors duration-300 ${vivaType === 'PRO' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {userSubscriptions.hasPRO ? (
                  <Unlock className="w-3.5 h-3.5 transition-transform duration-300" />
                ) : (
                  <Lock className={`w-3.5 h-3.5 transition-transform duration-300 ${vivaType === 'PRO' ? 'text-white' : 'text-slate-400'}`} />
                )}
                <span>PRO</span>
              </button>
            </div>

            {/* Interactive Subscription Mock Controls (For Testing) */}
            {/* <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[10px] text-slate-500 shadow-sm animate-in fade-in duration-300">
              <span className="font-bold text-slate-400 pl-1 uppercase tracking-wider">Test Sub:</span>
              <button
                onClick={() => setUserSubscriptions({ hasCIL: true, hasPRO: true })}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  userSubscriptions.hasCIL && userSubscriptions.hasPRO 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'hover:bg-slate-200 text-slate-650'
                }`}
                title="Grant access to both CIL and PRO"
              >
                Both Active
              </button>
              <button
                onClick={() => setUserSubscriptions({ hasCIL: true, hasPRO: false })}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  userSubscriptions.hasCIL && !userSubscriptions.hasPRO 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'hover:bg-slate-200 text-slate-650'
                }`}
                title="Grant access to CIL only"
              >
                CIL Only
              </button>
              <button
                onClick={() => setUserSubscriptions({ hasCIL: false, hasPRO: true })}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  !userSubscriptions.hasCIL && userSubscriptions.hasPRO 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'hover:bg-slate-200 text-slate-650'
                }`}
                title="Grant access to PRO only"
              >
                PRO Only
              </button>
            </div> */}
          </div>
        </div>

        {/* Subjects Selection - Modern Cards - Compact */}
        <div className="space-y-3 shrink-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Select Subject
            </h3>
            {selectedSubject && (
              <span className="text-sm font-medium text-slate-500 hidden md:block">
                Showing chapters for <span className="text-purple-600 font-bold">{subjects.find(s => s.subject_id === selectedSubject)?.subject_name}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {subjectsLoading ? (
              // Skeleton cards while fetching from API
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white animate-pulse"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 mb-2" />
                  <div className="h-2.5 w-16 rounded-full bg-slate-200" />
                </div>
              ))
            ) : (
              subjects.map(subject => (
                <button
                  key={subject.subject_id}
                  onClick={() => {
                    setSelectedSubject(subject.subject_id);
                    setSelectedChapter('');
                    setIsOpenChapterDropdown(false);
                    setChapterSearchQuery('');
                  }}
                  className={`group flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-sm focus:outline-none ${selectedSubject === subject.subject_id
                    ? 'border-purple-600 bg-purple-50/80 shadow-lg scale-102 border-2'
                    : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50 hover:shadow-md'
                    }`}
                >
                  {selectedSubject === subject.subject_id && (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                  )}
                  <span className="text-xl sm:text-3xl mb-1 sm:mb-2 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-sm">{subject.icon}</span>
                  <span className={`font-bold text-[10px] sm:text-xs md:text-sm text-center transition-colors ${selectedSubject === subject.subject_id ? 'text-purple-900' : 'text-slate-700 group-hover:text-purple-700'}`}>
                    {subject.subject_name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chapters Selection - Appears below subject selection */}
        {selectedSubject && (
          <div className="flex flex-col space-y-4 animate-in slide-in-from-bottom-6 fade-in duration-500">
            <div className="flex items-center gap-4 py-1 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex justify-start items-center gap-2 px-1">
                <Target className="w-5 h-5 text-blue-600 animate-pulse" /> Available Chapters
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
              </div>
            ) : error ? (
              <div className="flex justify-center py-20 text-red-500 font-medium">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start max-w-7xl mx-auto w-full">
                {/* Left Panel: Scrollable Chapter Grid list */}
                <div className="lg:col-span-2 flex flex-col w-full space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between px-2 shrink-0">
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Choose assessment scope
                    </h3>
                    <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                      {chaptersData.length} Chapters Available
                    </span>
                  </div>

                  {/* Search Chapter Input */}
                  <div className="relative px-1 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search chapters..."
                        value={chapterSearchQuery}
                        onChange={(e) => setChapterSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                      />
                      {chapterSearchQuery && (
                        <button
                          onClick={() => setChapterSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-100/60 border border-slate-200/50 rounded-2xl sm:rounded-3xl p-2 sm:p-3 h-[220px] sm:h-[320px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 w-full">
                    <div className="space-y-2">

                      {/* Full Subject assessment button card */}
                      {(!chapterSearchQuery || 'full subject assessment all chapters'.includes(chapterSearchQuery.toLowerCase())) && (
                        <button
                          onClick={() => setSelectedChapter('')}
                          className={`w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-200 text-left group ${selectedChapter === ''
                            ? 'border-purple-600 bg-purple-50 shadow-sm translate-x-1 border-2'
                            : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50 hover:shadow-sm'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shrink-0 ${selectedChapter === '' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-slate-100 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className={`font-bold block text-xs sm:text-sm ${selectedChapter === '' ? 'text-purple-900' : 'text-slate-855'}`}>
                                Full Subject Assessment
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 block mt-0.5">
                                Assess across all available chapters
                              </span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${selectedChapter === '' ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                            {selectedChapter === '' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      )}

                      {/* Filtered chapters list */}
                      {chaptersData
                        .filter((chapter: any) => {
                          const name = (chapter.chapter_name || chapter.name || '').toLowerCase();
                          return name.includes(chapterSearchQuery.toLowerCase());
                        })
                        .map((chapter: any, idx: number) => {
                          const id = String(chapter.chapter_id || chapter.id);
                          const isSelected = String(selectedChapter) === id;
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedChapter(id)}
                              className={`w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-200 text-left group ${isSelected
                                ? 'border-blue-600 bg-blue-50 shadow-sm translate-x-1 border-2'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm'
                                }`}
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                  {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className={`font-bold block text-xs sm:text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-855'}`}>
                                    {chapter.chapter_name || chapter.name}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium block mt-0.5">
                                    Chapter {idx + 1}
                                  </span>
                                </div>
                              </div>
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          );
                        })}

                      {chaptersData.length > 0 && chaptersData.filter((c: any) => (c.chapter_name || c.name || '').toLowerCase().includes(chapterSearchQuery.toLowerCase())).length === 0 && (
                        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                          <Target className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">No chapters match your search query</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Obsidian Control Card: Subject detail and Live Start Action */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-indigo-950/60 flex flex-col justify-between space-y-3.5 sm:space-y-5 lg:sticky lg:top-6 relative overflow-hidden group shrink-0 w-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-inner border border-white/10 shrink-0">
                        {subjects.find(s => s.subject_id === selectedSubject)?.icon || '📚'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-0.5">Selected Subject</span>
                        <h4 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                          {subjects.find(s => s.subject_id === selectedSubject)?.subject_name}
                        </h4>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-2.5 sm:pt-3 space-y-2.5 sm:space-y-3">
                      {/* Search box commented out as requested */}
                      {/*
                      <div className="relative">
                        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-1 sm:mb-1.5">Search Chapter</span>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-300" />
                          <input
                            type="text"
                            placeholder="Search chapter..."
                            value={chapterSearchQuery}
                            onChange={(e) => setChapterSearchQuery(e.target.value)}
                            className="w-full pl-7.5 pr-8 py-1.5 sm:py-2 bg-white/10 border border-white/15 rounded-lg sm:rounded-xl text-xs text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-slate-900/60"
                          />
                          {chapterSearchQuery && (
                            <button
                              onClick={() => setChapterSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-indigo-300 hover:text-white"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                      */}

                      <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/5">
                        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-0.5">Active Selection</span>
                        <p className="text-[11px] sm:text-xs font-semibold truncate text-white">
                          {selectedChapter === ''
                            ? 'Full Subject Assessment'
                            : (chaptersData.find((c: any) => String(c.chapter_id || c.id) === String(selectedChapter))?.chapter_name || chaptersData.find((c: any) => String(c.chapter_id || c.id) === String(selectedChapter))?.name)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Start Viva Button Integrated in Left Panel */}
                  <div className="pt-1.5 sm:pt-2">
                    <button
                      onClick={() => setIsStartConfirmOpen(true)}
                      disabled={!selectedSubject || loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Starting...</span>
                        </>
                      ) : (
                        <>
                          <span>{selectedChapter ? 'Start Chapter Viva' : 'Start Subject Viva'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedSubject && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40 bg-white rounded-2xl border border-slate-200 shadow-lg animate-pulse shrink-0">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 animate-bounce">
              <Target className="w-8 h-8" />
            </div>
            <p className="p-2 text-slate-500 font-semibold text-base">Select a subject above to view chapters</p>
          </div>
        )}

        {/* Start Session Confirmation Modal */}
        {isStartConfirmOpen && (
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-[6px] z-[99999] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-4 text-purple-600">
                <HelpCircle className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Start Assessment?</h3>

              <p className="text-slate-550 text-sm leading-relaxed mb-6">
                Are you ready to start this assessment? You will be entering full-screen mode.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsStartConfirmOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200/40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsStartConfirmOpen(false);
                    unlockSpeech();
                    handleStartApiSession();
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  Yes, Start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isEndingSession) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-lg flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">

          {/* Animated Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-100 rounded-full blur-3xl animate-pulse" />

          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin shadow-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
            Finalizing Session
          </h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            Please wait while we save your progress and generate your final assessment results...
          </p>

          {/* Progress Dots */}
          <div className="flex gap-2 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce shadow-sm"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8 gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Back button removed as per requirement */}
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-bold text-gray-800 truncate">
              {vivaData?.session?.assessment_name ? vivaData?.session?.assessment_name : 'Viva Practice'}
            </h2>
            <p className="text-[10px] sm:text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {vivaData?.questions?.length || 0}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEndConfirmOpen(true)}
          disabled={isSubmitting || isEndingSession}
          className="px-3.5 py-2 sm:px-6 sm:py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-full font-bold text-[10px] sm:text-sm shadow-md sm:shadow-lg transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2 shrink-0"
        >
          {isSubmitting || isEndingSession ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Square className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />}
          {isEndingSession ? 'Ending...' : 'End Session'}
        </button>
      </div>

      {/* Submission/Ending Loading Overlay */}
      {(isSubmitting || isEndingSession) && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-xs w-full">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {isEndingSession ? 'Ending Session' : 'Submitting Answer'}
            </h3>
            <p className="text-slate-500 text-sm">
              {isEndingSession ? 'Wrapping up your practice session...' : 'Please wait while we process your recording...'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-8">

        {/* Row 1: Question & Recorder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Question Card */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />

            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                Question {currentQuestionIndex + 1}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    const nextMute = !isQuestionMuted;
                    setIsQuestionMuted(nextMute);
                    if (!nextMute) {
                      speakQuestion(questionTextToSpeak);
                    } else {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                    }
                  }}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors border ${
                    isQuestionMuted
                      ? 'text-red-650 bg-red-50 hover:bg-red-100 border-red-100'
                      : 'text-slate-550 hover:text-purple-600 hover:bg-purple-50 border-purple-100 bg-purple-50/50'
                  }`}
                  title={isQuestionMuted ? "Unmute Question Speech" : "Mute Question Speech"}
                >
                  {isQuestionMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div className="text-lg sm:text-2xl font-medium text-slate-800 leading-relaxed mb-3 sm:mb-4">
              <QuestionMathJax content={questionTextToDisplay} />
            </div>

            {isCurrentSubmitted && !isCurrentSkipped && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-green-600 font-medium text-xs sm:text-sm mt-3 sm:mt-4 bg-green-50 p-1.5 sm:p-2 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Already Submitted
              </div>
            )}

            {isCurrentSkipped && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-orange-600 font-medium text-xs sm:text-sm mt-3 sm:mt-4 bg-orange-50 p-1.5 sm:p-2 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                Submitted Without Audio (Provide answer to reattempt)
              </div>
            )}
          </div>

          {/* Recorder Interface */}
          <div className={`bg-slate-900 text-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-4 sm:space-y-8 relative overflow-hidden h-full transition-all duration-300 border-4 ${isRecording && recordingTime <= 10 ? 'border-red-500 animate-[pulse_1s_infinite]' : 'border-transparent'
            }`}>

            {/* Audio Wave Animation */}
            <div className="w-full h-8 sm:h-16 flex items-center justify-center gap-1 opacity-50">
              {isRecording && [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="w-1.5 sm:w-2 bg-purple-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>

            {/* Timer */}
            <div className={`text-3xl sm:text-5xl font-mono font-bold tracking-wider transition-colors duration-300 ${isRecording && recordingTime <= 10 ? 'text-red-500' : 'text-green-400'
              }`}>
              {formatTime(recordingTime)}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 sm:gap-6 z-10">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!!audioBlob || (isCurrentSubmitted && !isCurrentSkipped) || isSubmitting}
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all ${audioBlob || (isCurrentSubmitted && !isCurrentSkipped) || isSubmitting
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 shadow-lg hover:scale-105 text-white'
                    }`}
                >
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-slate-700 hover:bg-slate-600 border-4 border-red-500 flex items-center justify-center text-white transition-all hover:scale-105 animate-pulse"
                >
                  <Square className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                </button>
              )}
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-widest">
              {isRecording ? 'Listening...' : ((isCurrentSubmitted && !isCurrentSkipped) ? 'Submitted' : (audioBlob ? 'Recording Saved' : 'Tap to Record'))}
            </p>
          </div>
        </div>

        {/* Row 2: Playback & Submit & Navigation */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
          {audioBlob && !isCurrentSubmitted && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-600">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                  Recording Ready
                </div>
                <button
                  onClick={() => { setAudioBlob(null); setAudioUrl(null); setRecordingTime(45); }}
                  className="text-[10px] sm:text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Discard
                </button>
              </div>
              {audioUrl && <audio src={audioUrl} controls className="w-full h-8 sm:h-10 text-xs" />}
            </>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            {/* Previous Button - Left column on desktop, Left column on mobile */}
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="col-span-1 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
              Previous
            </button>

            {/* Next / End Button - Right column on mobile, Right column on desktop */}
            <button
              onClick={() => {
                if (isLastQuestion) {
                  setIsEndConfirmOpen(true);
                } else {
                  handleNext();
                }
              }}
              disabled={isSubmitting}
              className={`col-span-1 sm:col-start-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${isLastQuestion
                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
              {isLastQuestion
                ? (!isCurrentSubmitted || (isCurrentSkipped && audioBlob) ? 'Submit & End' : 'End')
                : (!isCurrentSubmitted || (isCurrentSkipped && audioBlob) ? 'Submit & Next' : 'Next')
              }
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Submit Button - Bottom row (col-span-2) on mobile, Middle column (col-span-1) on desktop */}
            {(!isCurrentSubmitted || (isCurrentSkipped && audioBlob)) ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !audioBlob}
                className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                {isCurrentSkipped ? 'Submit Reattempt' : 'Submit Answer'}
              </button>
            ) : (
              <div className="hidden sm:block sm:col-start-2 sm:row-start-1" />
            )}
          </div>

        </div>

        {/* Row 3: Results (Feedback) */}
        {/* Only show if feedback is visible or submitted, and NOT skipped, AND vivaType is PRO */}
        {vivaType === 'PRO' && currentResult && (!isCurrentSkipped && (isCurrentSubmitted || feedbackVisible)) && (
          <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 animate-in slide-in-from-bottom-6 duration-500 shadow-md">

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl font-bold text-slate-900 truncate">Assessment Result</h3>
                <p className="text-slate-500 text-xs">AI Analysis Complete</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-slate-100 shrink-0">
                <span className="text-slate-500 text-xs sm:text-sm font-medium">Score:</span>
                <span className={`text-lg sm:text-2xl font-bold ${currentResult.ai_score >= 8 ? 'text-green-600' :
                  currentResult.ai_score >= 5 ? 'text-orange-500' : 'text-red-500'
                  }`}>
                  {currentResult.ai_score}/10
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
              {/* User Transcription */}
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-500" /> Your Answer (Transcribed)
                </h4>
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg text-slate-600 text-xs sm:text-sm leading-relaxed min-h-[80px] sm:min-h-[100px] border border-slate-100">
                  {currentResult.user_transcription || "No transcription available."}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Expected Answer
                </h4>
                <div className="p-3 sm:p-4 bg-blue-50/50 rounded-lg text-slate-600 text-xs sm:text-sm leading-relaxed min-h-[80px] sm:min-h-[100px] border border-blue-100">
                  <QuestionMathJax content={currentResult.answer_description || "No expected answer provided."} />
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-green-500" /> AI Feedback
                </h4>
                <button
                  onClick={() => {
                    setIsFeedbackMuted(!isFeedbackMuted);
                    if (!isFeedbackMuted) {
                      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    } else {
                      if (currentResult?.ai_feedback) speakQuestion(currentResult.ai_feedback);
                    }
                  }}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all shadow-sm ${isFeedbackMuted ? 'text-red-700 bg-red-100 hover:bg-red-200 border border-red-200' : 'text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200'
                    }`}
                  title={isFeedbackMuted ? "Unmute Feedback" : "Mute Feedback"}
                >
                  {isFeedbackMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {isFeedbackMuted ? "Muted" : "Mute"}
                </button>
              </div>

              <div className="p-4 sm:p-5 bg-green-50/50 rounded-lg sm:rounded-xl border border-green-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
                {currentResult.ai_feedback}
              </div>

              {currentResult.missingPoints && currentResult.missingPoints.length > 0 && (
                <div className="bg-red-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-red-100 mt-3 sm:mt-4">
                  <span className="font-bold text-[10px] sm:text-xs text-red-600 uppercase tracking-wide block mb-1.5 sm:mb-2">Areas for Improvement</span>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {currentResult.missingPoints.map((pt: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      {isEndConfirmOpen && (
        <div className="fixed inset-0 bg-slate-955/45 backdrop-blur-[6px] z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-rose-55 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertTriangle className="w-6 h-6 animate-[bounce_1.2s_infinite]" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">End Session?</h3>

            <p className="text-slate-550 text-sm leading-relaxed mb-6">
              Are you sure you want to exit the current session? Your progress will be saved and assessed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEndConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200/40"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEndConfirmOpen(false);
                  handleEndSessionClick();
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-lg transition-all"
              >
                Yes, End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
