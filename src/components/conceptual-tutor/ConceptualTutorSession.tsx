import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  ChevronRight, 
  HelpCircle,
  Timer as TimerIcon,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Loader2,
  Waves,
  BrainCircuit,
  Settings2,
  Infinity,
  Sparkles,
  Target,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ConceptualVivaService } from '../../services/ConceptualTutorService';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import QuestionMathJax, { latexToText } from '../../shared/mathjaxconfig/QuestionMathJax';
import { speakText, stopSpeech } from '../../utils/ttsHelper';


interface SessionProps {
  initialParams: any;
  sessionId: string | number | null;
  initialData: any;
  initialQuestion: any;
  onSessionSync: (id: string | number | null, data: any, currentQ: any) => void;
  onFinish: (sessionId: string | number) => void;
  onExit: () => void;
}

export default function ConceptualVivaSession({ initialParams, sessionId: propsSessionId, initialData, initialQuestion, onSessionSync, onFinish, onExit }: SessionProps) {
  // console.log("ConceptualVivaSession initialParams:", initialParams,propsSessionId,initialQuestion);
  const [isInitialLoading, setIsInitialLoading] = useState(!propsSessionId);
  const [sessionId, setSessionId] = useState<string | number | null>(propsSessionId);
  const [currentQuestion, setCurrentQuestion] = useState<any>(initialQuestion || null);
  const [conceptualVivaData, setConceptualVivaData] = useState<any>(initialData || null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [canEnd, setCanEnd] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [assessmentName, setAssessmentName] = useState<string>(initialQuestion?.assessment_name || '');
  const [isAutoTtsEnabled, setIsAutoTtsEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const questionStartTimeRef = useRef<string | null>(new Date().toISOString());

  useEffect(() => {
    questionStartTimeRef.current = new Date().toISOString();
  }, [currentQuestion?.question_no]);

  // Session initialization is now handled pre-navigation in App.tsx

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Attempt to enter fullscreen on start if we have a session
    if (sessionId && !isInitialLoading && !document.fullscreenElement) {
      enterFullscreen();
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Exit fullscreen failed:", err));
      }
    };
  }, [sessionId, isInitialLoading]);

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen request failed. This often requires a user gesture.", error);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    }
  };

  // Sync state to parent for persistence
  useEffect(() => {
    if (sessionId) {
      onSessionSync(sessionId, conceptualVivaData, currentQuestion);
    }
  }, [sessionId, conceptualVivaData, currentQuestion]);

  // Session initialization logic
  useEffect(() => {
    if (!sessionId && initialParams) {
      startSession();
    }
  }, []);

  const startSession = async () => {
    try {
      setIsInitialLoading(true);
      
      // Validate required parameters
      const requiredFields = ['user_id', 'subject_id', 'chapter_id', 'topic_id', 'course_id'];
      const missingFields = requiredFields.filter(field => !initialParams[field] || initialParams[field] === 'null' || initialParams[field] === 'undefined');
      
      if (missingFields.length > 0) {
        console.error("Missing required fields for viva session:", missingFields);
        console.log("Current initialParams:", initialParams);
        toast.error(`Missing session data: ${missingFields.join(', ')}`);
        onExit();
        return;
      }

      const payload: any = {
        user_id: Number(initialParams.user_id),
        subject_id: Number(initialParams.subject_id),
        course_id: Number(initialParams.course_id),
        chapter_id: String(initialParams.chapter_id),
        topic_id: String(initialParams.topic_id),
        module_type: "TAM"
      };
      if (initialParams.viva_type) {
        payload.viva_type = String(initialParams.viva_type);
      }

      console.log("ConceptualVivaSession start payload:", payload);
      
      const response = await ConceptualVivaService.startConceptualVivaSession(payload);
      console.log("ConceptualVivaSession initialization response:", response);

      if (response) {
        // The user specified response fields: assessment_name, question, question_no, question_transcrib, session_id, topic_context
        const newSessionId = response.session_id;
        
        // We store the whole response as currentQuestion to access assessment_name, etc.
        const newQuestionData = response;
        
        console.log("Extracted session_id:", newSessionId);
        console.log("Extracted question_data:", newQuestionData);

        if (newSessionId && response.question) {
          setSessionId(newSessionId);
          setCurrentQuestion(newQuestionData);
          setConceptualVivaData(response); 
          if (response.assessment_name) {
            setAssessmentName(response.assessment_name);
          }
          
          // Sync to parent
          onSessionSync(newSessionId, response, newQuestionData);
        } else {
          console.warn("Could not find session_id or question in response. Check the keys above.");
          toast.error("Failed to initialize session: Data missing from response");
        }
      } else {
        toast.error("Failed to initialize session: No response from server");
        onExit();
      }
    } catch (error: any) {
      console.error("Error starting viva session:", error);
      const isCil = initialParams?.viva_type === 'CIL' || initialParams?.vivaType === 'CIL';
      
      if (error.response) {
        console.error("Server error response data:", error.response.data);
        console.error("Server error response status:", error.response.status);
        
        const apiMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.response.data?.detail || 
                           (typeof error.response.data === 'string' ? error.response.data : null);

        if (isCil) {
          if (apiMessage) {
            toast.error(apiMessage);
          } else {
            toast.error(`Error starting CIL viva: ${error.response.status}`);
          }
        } else {
          if (error.response.status === 403) {
            toast.error(apiMessage || "Access Denied");
          } else {
            toast.error(`Error starting viva: ${error.response?.status || 'Unknown error'}`);
          }
        }
      } else {
        toast.error(`Error starting viva: ${error.message || 'Unknown error'}`);
      }
      onExit();
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Text to Speech logic
  const speakQuestion = (text?: string) => {
    // Strictly use transcribed text for TTS as per user requirement
    const speechText = text || currentQuestion?.question_transcrib;
    if (!speechText) return;

    speakText(speechText, {
      rate: 0.9, // Slightly slower for better clarity
      pitch: 1
    });
  };

  useEffect(() => {
    if (currentQuestion?.question_transcrib && !isInitialLoading && isAutoTtsEnabled) {
      // Small delay to ensure UI is ready and browser allows speech
      const timer = setTimeout(() => {
        speakQuestion();
      }, 700);
      return () => clearTimeout(timer);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion?.question_no, isInitialLoading]);

  // Handle timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    // Stop TTS when recording starts
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTimer(0);
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayToggle = () => {
    if (!audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  // Prevent page refresh when exam is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionId && !isFinishing) {
        e.preventDefault();
        e.returnValue = ''; // Trigger browser's default confirm dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, isFinishing]);

  const handleSubmit = async () => {
    if (!sessionId) return;
    
    let blobToSubmit = audioBlob;
    if (isRecording && mediaRecorder) {
        setIsSubmitting(true);
        blobToSubmit = await new Promise<Blob>((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                resolve(blob);
            };
            mediaRecorder.stop();
            setIsRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });
    }

    setIsSubmitting(true);
    try {
      const startTimeStr = questionStartTimeRef.current;
      const endTimeStr = new Date().toISOString();

      // Create FormData with required parameters: question_no, audio_file, time_taken, start_time, end_time
      const formData = new FormData();
      formData.append('module_type',"TAM");
      formData.append('question_id', Math.floor(Number(currentQuestion?.question_no || 0)) as any);
      formData.append('user_id', Math.floor(Number(initialParams?.user_id || localStorage.getItem('user_id'))) as any);
      formData.append('session_id', Math.floor(Number(sessionId)) as any);
      if (blobToSubmit) {
        formData.append('audio_file', blobToSubmit, `viva_${sessionId}_q${currentQuestion?.question_no}.wav`);
      } else {
        formData.append('audio_file', 'null');
      }
      formData.append('time_taken', String(timer));
      formData.append('start_time', startTimeStr || '');
      formData.append('end_time', endTimeStr);
      
      console.log("Submitting Payload:", {
        module_type:"TAM",
        question_id: Math.floor(Number(currentQuestion?.question_no || 0)),
        user_id: Math.floor(Number(initialParams?.user_id || localStorage.getItem('user_id'))),
        session_id: Math.floor(Number(sessionId)),
        time_taken: String(timer),
        start_time: startTimeStr,
        end_time: endTimeStr,
        audio_file: blobToSubmit ? `viva_${sessionId}_q${currentQuestion?.question_no}.wav` : null
      });
      
      const response = await ConceptualVivaService.submitConceptualAnswer(formData);
      
      if (response) {
        setCanEnd(response.can_end || false);
        setAudioBlob(null);
        setAudioUrl(null);
        
        
        if (response.can_end) {
          // Show "Thank you" state then finish
          setIsFinishing(true);
          toast.success("Session ended. Thank you for your attempts!");
          
          // Small delay for the loader/message then finish
          setTimeout(async () => {
             try {
                await ConceptualVivaService.endConceptualViva({ session_id: sessionId, module_type: "TAM" });
                onFinish(sessionId);
             } catch (error) {
                console.error("Error ending viva:", error);
                onFinish(sessionId); // Navigate anyway
             }
          }, 2000);
        } else {
          // The response for the next question follows the same structure as the initial one
          const nextQ = response;
          console.log("Next Question API Response:", response);

          if (nextQ && nextQ.question) {
            // Sync both states.
            setCurrentQuestion(nextQ);
            setConceptualVivaData(nextQ);
            if (nextQ.assessment_name) {
              setAssessmentName(nextQ.assessment_name);
            }
            toast.success("Ready for the next question!");
          } else {
             // Specific error handling for null question mid-session
             console.error("Next question was null or missing:", nextQ);
             toast.error("Something went wrong, sorry for the inconvenience. Please try again after some time", {
               duration: 5000
             });
             
             try {
                await ConceptualVivaService.endConceptualViva({ session_id: sessionId, module_type: "TAM" });
             } catch (error) {
                console.error("Error ending viva after null question:", error);
             }
             onFinish(sessionId);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishViva = async () => {
    if (!sessionId) return;

    const result = await Swal.fire({
      title: "End Session?",
      text: "Are you sure you want to end this conceptual tutor session? Your current progress will be saved.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, End",
      cancelButtonText: "Cancel",
      customClass: {
        container: "!z-[99999]",
        popup: "!z-[99999] rounded-2xl",
        confirmButton: "text-sm px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold min-w-[100px] hover:bg-red-700 transition-colors shadow-lg shadow-red-100 cursor-pointer",
        cancelButton: "text-sm px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold min-w-[100px] hover:bg-slate-200 transition-colors ml-3 cursor-pointer"
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      stopSpeech();
      setIsFinishing(true);
      try {
        await ConceptualVivaService.endConceptualViva({ session_id: sessionId, module_type: "TAM" });
        await exitFullscreen();
        onFinish(sessionId);
      } catch (error) {
        toast.error("Failed to end viva session");
      } finally {
        setIsFinishing(false);
      }
    }
  };

  // We are ready if we have a sessionId and we have the concept data.
  // We check specifically for null/undefined to avoid issues with falsy IDs or empty objects.
  const isDataLoaded = sessionId !== null && sessionId !== undefined;
  const isQuestionLoaded = currentQuestion !== null;
  const isReady = isDataLoaded && isQuestionLoaded;

  // If it's loading, show the initializing session loader
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="mt-8 text-center px-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Initializing Session</h2>
          <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">
            Please wait while we initialize your personalized conceptual viva experience
          </p>
        </div>
        <div className="mt-6 flex gap-1">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
        </div>
      </div>
    );
  }

  // If we are not loading and we are not ready (and not finishing), it means we failed to start the session
  if (!isReady && !isFinishing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-8">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Failed to start the session</h2>
          <p className="text-slate-500 max-w-sm mb-8">Please try again after some time or contact support if the issue persists.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              Retry Session
            </button>
            <button 
              onClick={async () => {
                await exitFullscreen();
                onExit();
              }}
              className="w-full sm:w-auto px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Exit Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinishing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-600/10 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-pulse" />
          </div>
        </div>
        <div className="mt-8 text-center px-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Viva Session Complete</h2>
          <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">
            Thank you for your attempts! Please wait while our AI engine analyzes your responses and generates your detailed report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8  mx-auto">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
              {assessmentName || currentQuestion?.assessment_name}
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">
              {currentQuestion?.topic_context || `${initialParams?.subjectName} • ${initialParams?.chapterName} • ${initialParams?.topicName}`}
            </p>
          </div>
        </div>

        {/* <div className="flex items-center gap-4">
           <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xl shadow-slate-200/50">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="font-mono font-black text-xl text-slate-700 tracking-wider">
                 {formatTime(timer)}
              </span>
           </div>
        </div> */}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Question Card */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 relative overflow-hidden flex-1 flex flex-col min-h-[400px]">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight flex-1">
                  <span className="text-blue-600 mr-2">{currentQuestion?.question_no}.</span>
                  {currentQuestion?.question_transcrib ? (
                    <span>{currentQuestion.question_transcrib}</span>
                  ) : (
                    <span>{latexToText(currentQuestion?.question || "Loading question...")}</span>
                  )}
                </h2>
                <div className="flex gap-2">
                  <div className={`flex items-center rounded-2xl transition-all shadow-sm ${
                    isAutoTtsEnabled ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <button 
                      onClick={() => {
                        if (!isAutoTtsEnabled) {
                          setIsAutoTtsEnabled(true);
                        }
                        speakQuestion();
                      }}
                      className="p-4 flex items-center gap-2 hover:bg-black/10 rounded-l-2xl transition-all active:scale-95"
                      title={isAutoTtsEnabled ? "Speak Again" : "Unmute & Speak"}
                      disabled={isSubmitting}
                    >
                      {isAutoTtsEnabled ? <Volume2 className="w-5 h-5" /> : <Square className="w-5 h-5 opacity-50" />}
                      <span className="text-xs font-bold uppercase tracking-tight">
                        {isAutoTtsEnabled ? "Speak" : "Muted"}
                      </span>
                    </button>
                    
                    {isAutoTtsEnabled && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAutoTtsEnabled(false);
                          if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                          }
                        }}
                        className="p-4 hover:bg-black/10 rounded-r-2xl border-l border-white/10 transition-all active:scale-95"
                        title="Mute Auto-TTS"
                        disabled={isSubmitting}
                      >
                        <Square className="w-3 h-3 text-white/70" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Optional Hints or Context */}
              {/* <div className="mt-8 flex gap-3">
                 <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                    <BrainCircuit className="w-4 h-4" />
                    Focus on the core principle and real-world applications.
                 </div>
              </div> */}
            </div>
          </div>
        </div>
 
        {/* Right: Audio Response Controls */}
        <div className="flex flex-col h-full">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group flex-1 flex flex-col justify-center">
            {/* Pulsing rings when recording */}
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 bg-red-500/20 rounded-full animate-ping"></div>
                <div className="w-48 h-48 bg-red-500/10 rounded-full animate-pulse"></div>
              </div>
            )}
            
            <div className="relative z-10 flex flex-col items-center gap-8">
               <div className="text-center">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {isRecording ? "Listening to your response..." : audioBlob ? "Response Captured" : "Ready to provide your answer?"}
                  </h3>
                  <div className="flex justify-center mb-4">
                    <div className="px-5 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}></div>
                      <span className="font-mono font-bold text-lg text-white tracking-widest leading-none">
                        {isRecording || audioBlob ? `${timer.toString().padStart(2, '0')}s` : "00s"}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {isRecording ? "Speak clearly and explain the concept in your own words." : audioBlob ? "Review your answer or record again if needed." : "Tap the microphone to start recording your explanation."}
                  </p>
               </div>

               {/* Visualizer (Mock) */}
               <div className="flex items-end justify-center gap-1 h-12 w-full px-12">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full bg-blue-500 transition-all duration-300 ${
                        isRecording ? 'animate-bounce' : 'h-2 opacity-30'
                      }`}
                      style={{ 
                        height: isRecording ? `${Math.random() * 100}%` : '8px',
                        animationDelay: `${i * 0.05}s`
                      }}
                    ></div>
                  ))}
               </div>

               <div className="flex items-center justify-center gap-6">
                   {audioUrl && !isRecording && (
                    <div className="relative group/play flex justify-center items-center">
                      <button 
                        onClick={handlePlayToggle}
                        disabled={isSubmitting}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          isPlaying 
                          ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30' 
                          : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                        }`}
                      >
                        {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                      </button>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/play:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-20">
                        {isPlaying ? "Stop playback" : "Play last recording"}
                      </div>
                    </div>
                  )}
 
                  <div className="relative group/record flex justify-center items-center">
                    {!isRecording ? (
                      <button 
                        onClick={startRecording}
                        disabled={isSubmitting}
                        className={`w-24 h-24 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30 group-hover/record:rotate-6 duration-500 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed grayscale' : ''
                        }`}
                      >
                        <Mic className="w-10 h-10" />
                      </button>
                    ) : (
                      <button 
                        onClick={stopRecording}
                        className="w-24 h-24 rounded-[2rem] bg-red-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/30 animate-pulse"
                      >
                        <Square className="w-8 h-8 fill-current" />
                      </button>
                    )}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/record:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-20">
                      {isRecording ? "Stop recording" : "Start recording"}
                    </div>
                  </div>

                  {/* <button 
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      !isSubmitting
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20' 
                        : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                  </button> */}
               </div>
               
               {isSubmitting && (
                  <div className="text-white/60 text-xs font-bold animate-pulse uppercase tracking-[0.2em]">
                     Processing Answer...
                  </div>
                )}
             </div>
           </div>
         </div>
       </div>
       
       {/* Footer Nav */}
       <div className="mt-8 flex justify-center items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-full">
          {canEnd ? (
            <button 
              onClick={handleFinishViva}
              disabled={isFinishing}
              className="flex items-center gap-2 px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest cursor-pointer"
            >
               {isFinishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>FINISH SESSION <Target className="w-4 h-4" /></>}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-12 py-4 font-black text-sm rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest cursor-pointer ${
                  !isSubmitting 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>SUBMIT & NEXT <ChevronRight className="w-4 h-4" /></>}
              </button>
              <div className="relative group w-full sm:w-auto flex justify-center">
                <button 
                  onClick={handleFinishViva}
                  disabled={isSubmitting || isFinishing || Number(currentQuestion?.question_no) === 1}
                  className={`flex items-center justify-center gap-2 px-12 py-4 font-black text-sm rounded-2xl transition-all shadow-md uppercase tracking-widest w-full sm:w-auto ${
                    Number(currentQuestion?.question_no) === 1
                      ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:scale-105 active:scale-95 cursor-pointer'
                  }`}
                >
                  {isFinishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>END SESSION <Square className="w-4 h-4 text-slate-500 fill-slate-500" /></>}
                </button>
                {Number(currentQuestion?.question_no) === 1 && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl whitespace-nowrap z-50 shadow-xl font-bold border border-slate-800 text-center animate-in fade-in zoom-in duration-200">
                    You need to submit at least one question
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                  </div>
                )}
              </div>
            </div>
          )}
       </div>
    </div>
  );
}
