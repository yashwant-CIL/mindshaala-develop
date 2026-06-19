import { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Send, Volume2, VolumeX,
  ChevronRight, ArrowRight, Loader2, CheckCircle2, 
  BookOpen, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { VivaService } from '../services/VivaService';
import { latexToText } from '../shared/mathjaxconfig/QuestionMathJax';
import { useCourse } from '../context/CourseContext';
import { QuestionMathJax } from '../shared/mathjaxconfig/QuestionMathJax';


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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => getSavedState('currentQuestionIndex', 0));
  
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
  const [chaptersData , setChaptersData] = useState<any[]>([]);
  const [loading  , setLoading] = useState(false);
  const [error , setError] = useState<string | null>(null);
  const [vivaData , setVivaData] = useState<any>(() => getSavedState('vivaData', null));
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
  const lastReadFeedbackRef = useRef<string | null>(null);
  
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
        questionResults
    }));
  }, [selectedSubject, selectedChapter, sessionStarted, currentQuestionIndex, vivaData, submittedQuestions, skippedQuestions, questionResults]);

  // Full Screen and Navigation Blocking
  useEffect(() => {
    if (sessionStarted) {
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
        e.returnValue = ''; // Chrome requires returnValue to be set
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Hide Sidebar and Floating Actions
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
      const floatingActions = document.getElementById('floating-actions-container');
      
      if (sidebar) sidebar.style.display = 'none';
      if (floatingActions) floatingActions.style.display = 'none';

      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Restore Sidebar and Floating Actions
        if (sidebar) sidebar.style.display = '';
        if (floatingActions) floatingActions.style.display = '';
        
        // Exit Full Screen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error("Error attempting to exit full-screen mode:", err));
        }
      };
    }
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
        if (!subscriptionId) return;
        const data = await VivaService.getAllSubjects(subscriptionId);
        if (data) {
          console.log("Subject Data", data);
          setSubjects(data);
        }
      } catch (error) {
        console.error("Error navigating to subject:", error);
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find an Indian English voice
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN' || v.name.includes('India'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Session API Call
  const handleStartApiSession = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    try {
      const payload: any = {
        user_id: localStorage.getItem('user_id'),
        course_id: courseId,
        subject_id: Number(selectedSubject) || 0
      };

      if (selectedChapter) {
        payload.chapter_id = Number(selectedChapter);
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
        if (response.data.questions.length > 0) {
            setTimeout(() => speakQuestion(response.data.questions[0].text), 1000);
        }
      }
    } catch (error: any) {
      if(error.response.data.detail){
        // toast.error(error.response.data.detail);
        toast.error("No Viva Questions available for this chapter.");
      }else{
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

        if (sessionId) formData.append('session_id', sessionId);
        formData.append('question_id', qId); 
        formData.append('start_time', String(startTimeValue));
        formData.append('end_time', String(endTime));
        formData.append('total_time_taken', String(totalTimeTaken));
        
        const blobToSubmit = autoBlob || audioBlob;
        if (blobToSubmit) {
            // Ensure .wav extension is used as requested
            formData.append('audio_file', blobToSubmit, `question_${currentQuestionIndex}.wav`);
        } else if (isEndSession) {
             // If skipping/ending without audio, maybe send a flag or just empty file if backend requires it?
             // For now assuming backend handles missing audio as "skipped" or "no answer"
             // Using a dummy empty blob if backend strictly requires a file, but let's try without first or append empty if needed.
             // formData.append('audio_file', new Blob([], { type: 'audio/wav' }), 'skipped.wav');
        }

        console.log("Submitting Answer...", { qId, sessionId, hasAudio: !!audioBlob });

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
              await VivaService.endViva(sessionId);
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
    if (sessionStarted) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        const currentQ = vivaData?.questions?.[currentQuestionIndex] || sampleQuestions[currentQuestionIndex];
        // Strictly use transcribed text for TTS as per user policy
        const textToSpeak = currentQ?.question_transcribe || "";
        
        if (textToSpeak) {
            // Small delay to ensure state updates and previous speech cancellation
            const timer = setTimeout(() => speakQuestion(textToSpeak), 500);
            return () => clearTimeout(timer);
        }
    }
  }, [currentQuestionIndex, sessionStarted, vivaData]);

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
  const questionTextToSpeak = currentQuestionData?.question_transcribe || "";
  const isLastQuestion = currentQuestionIndex === (vivaData?.questions?.length || sampleQuestions.length) - 1;
  const isCurrentSubmitted = submittedQuestions.has(qId);
  const isCurrentSkipped = skippedQuestions.has(qId);

  // Mute toggle effect
  useEffect(() => {
      if (isFeedbackMuted) {
          if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
          }
      }
  }, [isFeedbackMuted]);

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
      <div className="p-8 mx-auto space-y-12 animate-in fade-in duration-500 min-h-screen bg-slate-50/50">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Viva Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Testing</span>
          </h1>
        </div>

        {/* Subjects Selection - Modern Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Select Subject
            </h3>
            {selectedSubject && (
              <span className="text-sm font-medium text-slate-500 hidden md:block">
                Showing chapters for <span className="text-purple-600 font-bold">{subjects.find(s => s.subject_id === selectedSubject)?.subject_name}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {subjects.map(subject => (
              <button
                key={subject.subject_id}
                onClick={() => { setSelectedSubject(subject.subject_id); setSelectedChapter(''); }}
                className={`group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-sm focus:outline-none ${
                   selectedSubject === subject.subject_id 
                    ? 'border-purple-600 bg-purple-50/80 shadow-lg scale-105 border-2' 
                    : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50 hover:shadow-md'
                }`}
              >
                {selectedSubject === subject.subject_id && (
                  <div className="absolute top-3 right-3 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                <span className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{subject.icon}</span>
                <span className={`font-bold text-center transition-colors ${selectedSubject === subject.subject_id ? 'text-purple-900' : 'text-slate-700 group-hover:text-purple-700'}`}>
                  {subject.subject_name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chapters Selection - Appears below subject selection */}
        {selectedSubject && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 fade-in duration-500">
            <div className="flex items-center gap-4 py-4">
              <h3 className="text-xl font-bold text-slate-800 flex justify-start items-center gap-2 px-4 py-1">
                <Target className="w-5 h-5 text-blue-600" /> Available Chapters
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chaptersData.length > 0 ? (
                    <>
                    {/* Full Subject Option */}
                    <button
                      onClick={() => setSelectedChapter('')}
                      className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 text-left group ${
                         selectedChapter === ''
                          ? 'border-purple-600 bg-purple-50 shadow-md translate-x-1 border-2 ring-1 ring-purple-100' 
                          : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <span className={`font-bold block mb-1 text-lg ${selectedChapter === '' ? 'text-purple-900' : 'text-slate-800 group-hover:text-purple-700'}`}>
                          Full Subject Assessment
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          All Chapters Included
                        </span>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                         selectedChapter === ''
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                          : 'bg-slate-50 text-slate-300 group-hover:bg-purple-100 group-hover:text-purple-500'
                      }`}>
                        {selectedChapter === '' ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </button>

                    {chaptersData.map((chapter: any) => (
                    <button
                      key={chapter.chapter_id || chapter.id}
                      onClick={() => {
                        const id = chapter.chapter_id || chapter.id;
                        setSelectedChapter(prev => prev === id ? '' : id);
                      }}
                      className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 text-left group ${
                         selectedChapter === (chapter.chapter_id || chapter.id)
                          ? 'border-blue-600 bg-blue-50 shadow-md translate-x-1 border-2' 
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <span className={`font-bold block mb-1 text-lg ${selectedChapter === (chapter.chapter_id || chapter.id) ? 'text-blue-900' : 'text-slate-800 group-hover:text-blue-700'}`}>
                          {chapter.chapter_name || chapter.name}
                        </span>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                         selectedChapter === (chapter.chapter_id || chapter.id)
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-slate-50 text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-500'
                      }`}>
                        {selectedChapter === (chapter.chapter_id || chapter.id) ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </button>
                    ))}
                    </>
                  ) : (
                     <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                       <p className="text-lg">No chapters found for this subject.</p>
                     </div>
                  )}
                </div>
            )}
            {/* Start Button */}
            <div className="flex justify-center pt-12 pb-8">
              <button
                onClick={handleStartApiSession}
                disabled={!selectedSubject || loading}
                className="group relative px-10 py-5 bg-transparent rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                
                <span className="relative flex items-center gap-3 text-white">
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Starting Session...
                    </>
                  ) : (
                    <>
                      {selectedChapter ? 'Start Chapter Viva' : 'Start Subject Viva'} 
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-200" />
              </button>
            </div>
          </div>
        )}

        {!selectedSubject && (
          <div className="text-center py-20 opacity-40 bg-white rounded-2xl border border-slate-200 shadow-lg animate-pulse">
             <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
               <Target className="w-10 h-10" />
             </div>
             <p className="text-slate-500 font-medium text-lg">Select a subject above to view chapters</p>
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
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
        <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Back button removed as per requirement */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
               {vivaData?.session?.assessment_name ? vivaData?.session?.assessment_name : 'Viva Practice'}
            </h2>
            <p className="text-gray-500">
              Question {currentQuestionIndex + 1} of {vivaData?.questions?.length || 0}
            </p>
          </div>
        </div>
        <button
          onClick={handleEndSessionClick}
          disabled={isSubmitting || isEndingSession}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
        >
            {isSubmitting || isEndingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
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

      <div className="space-y-8">
        
        {/* Row 1: Question & Recorder */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Question Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wide">
                Question {currentQuestionIndex + 1}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => speakQuestion(questionTextToSpeak)}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                  title="Read Question"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="text-2xl font-medium text-slate-800 leading-relaxed mb-4">
               <QuestionMathJax content={questionTextToDisplay} />
            </div>
            
            {isCurrentSubmitted && !isCurrentSkipped && (
                 <div className="flex items-center gap-2 text-green-600 font-medium text-sm mt-4 bg-green-50 p-2 rounded">
                    <CheckCircle2 className="w-4 h-4" />
                    Already Submitted
                 </div>
            )}
            
            {isCurrentSkipped && (
                 <div className="flex items-center gap-2 text-orange-600 font-medium text-sm mt-4 bg-orange-50 p-2 rounded">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    Submitted Without Audio (Provide answer to reattempt)
                 </div>
            )}
          </div>

          {/* Recorder Interface */}
          <div className={`bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-8 relative overflow-hidden h-full transition-all duration-300 border-4 ${
            isRecording && recordingTime <= 10 ? 'border-red-500 animate-[pulse_1s_infinite]' : 'border-transparent'
          }`}>
            
            {/* Audio Wave Animation */}
            <div className="w-full h-16 flex items-center justify-center gap-1 opacity-50">
              {isRecording && [1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="w-2 bg-purple-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>

            {/* Timer */}
            <div className={`text-5xl font-mono font-bold tracking-wider transition-colors duration-300 ${
              isRecording && recordingTime <= 10 ? 'text-red-500' : 'text-green-400'
            }`}>
               {formatTime(recordingTime)}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 z-10">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!!audioBlob || (isCurrentSubmitted && !isCurrentSkipped) || isSubmitting} 
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    audioBlob || (isCurrentSubmitted && !isCurrentSkipped) || isSubmitting
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 shadow-lg hover:scale-105 text-white'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-slate-700 hover:bg-slate-600 border-4 border-red-500 flex items-center justify-center text-white transition-all hover:scale-105 animate-pulse"
                >
                  <Square className="w-8 h-8 fill-current" />
                </button>
              )}
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
              {isRecording ? 'Listening...' : ((isCurrentSubmitted && !isCurrentSkipped) ? 'Submitted' : (audioBlob ? 'Recording Saved' : 'Tap to Record'))}
            </p>
          </div>
        </div>

        {/* Row 2: Playback & Submit & Navigation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
             {audioBlob && !isCurrentSubmitted && (
                <>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Recording Ready
                    </div>
                    <button 
                    onClick={() => { setAudioBlob(null); setAudioUrl(null); setRecordingTime(45); }}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                    Discard
                    </button>
                </div>
                {audioUrl && <audio src={audioUrl} controls className="w-full h-10" />}
                </>
             )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-3">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg font-bold flex items-center gap-2 transition-all"
                >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Previous
                </button>

                {(!isCurrentSubmitted || (isCurrentSkipped && audioBlob)) && (
                <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || !audioBlob}
                    className="flex-1 max-w-md py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all mx-auto"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isCurrentSkipped ? 'Submit Reattempt' : 'Submit Answer'}
                </button>
                )}
                
                <button 
                    onClick={() => handleNext()}
                    disabled={isSubmitting}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                        isLastQuestion 
                        ? 'bg-red-100 hover:bg-red-200 text-red-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                >
                    {isLastQuestion 
                        ? (!isCurrentSubmitted || (isCurrentSkipped && audioBlob) ? 'Submit & End Session' : 'End Session') 
                        : (!isCurrentSubmitted || (isCurrentSkipped && audioBlob) ? 'Submit & Next' : 'Next')
                    }
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            
        </div>

        {/* Row 3: Results (Feedback) */}
        {/* Only show if feedback is visible or submitted, and NOT skipped */}
        {currentResult && (!isCurrentSkipped && (isCurrentSubmitted || feedbackVisible)) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 animate-in slide-in-from-bottom-6 duration-500 shadow-md">
                 
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Assessment Result</h3>
                        <p className="text-slate-500 text-sm">AI Analysis Complete</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-medium">Score:</span>
                        <span className={`text-2xl font-bold ${
                            currentResult.ai_score >= 8 ? 'text-green-600' : 
                            currentResult.ai_score >= 5 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                            {currentResult.ai_score}/10
                        </span>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* User Transcription */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Mic className="w-4 h-4 text-purple-500" /> Your Answer (Transcribed)
                        </h4>
                        <div className="p-4 bg-slate-50 rounded-lg text-slate-600 text-sm leading-relaxed min-h-[100px] border border-slate-100">
                            {currentResult.user_transcription || "No transcription available."}
                        </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" /> Expected Answer
                        </h4>
                        <div className="p-4 bg-blue-50/50 rounded-lg text-slate-600 text-sm leading-relaxed min-h-[100px] border border-blue-100">
                          <QuestionMathJax content={currentResult.answer_description || "No expected answer provided."} />
                        </div>
                    </div>
                 </div>
                 
                 {/* Feedback Section */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-500" /> AI Feedback
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
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm ${
                                isFeedbackMuted ? 'text-red-700 bg-red-100 hover:bg-red-200 border border-red-200' : 'text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200'
                            }`}
                            title={isFeedbackMuted ? "Unmute Feedback" : "Mute Feedback"}
                        >
                            {isFeedbackMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            {isFeedbackMuted ? "Muted" : "Mute"}
                        </button>
                    </div>
                    
                    <div className="p-5 bg-green-50/50 rounded-xl border border-green-100 text-slate-700 leading-relaxed">
                        {currentResult.ai_feedback}
                    </div>

                    {currentResult.missingPoints && currentResult.missingPoints.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                            <span className="font-bold text-xs text-red-600 uppercase tracking-wide block mb-2">Areas for Improvement</span>
                            <ul className="space-y-2">
                                {currentResult.missingPoints.map((pt: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
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
    </div>
  );
}
