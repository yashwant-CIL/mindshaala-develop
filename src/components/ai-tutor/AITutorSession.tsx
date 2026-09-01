import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  ChevronRight, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Loader2,
  Brain,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FastForward,
  SkipForward,
  BookOpen,
  Check,
  Info
} from 'lucide-react';
import { AITutorService } from '../../services/AITutorService';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../App';
import QuestionMathJax, { latexToText } from '../../shared/mathjaxconfig/QuestionMathJax';

type FlowState = 
  | 'initializing'
  | 'knowledge_check'
  | 'intro_recording'
  | 'explanation_view'
  | 'question_answering'
  | 'finishing';

interface SessionProps {
  initialParams: any;
  sessionId: string | number | null;
  initialData: any;
  initialQuestion: any;
  onSessionSync: (id: string | number | null, data: any, currentQ: any) => void;
  onFinish: (sessionId: string | number) => void;
  onExit: () => void;
}

export default function AITutorSession({ initialParams, sessionId: propsSessionId, initialData, initialQuestion, onSessionSync, onFinish, onExit }: SessionProps) {
  const { state: userState } = useContext(UserContext) || { state: {} };
  
  // Core Session States
  const [isInitialLoading, setIsInitialLoading] = useState(!propsSessionId);
  const [sessionId, setSessionId] = useState<string | number | null>(propsSessionId);
  const [conceptualVivaData, setConceptualVivaData] = useState<any>(initialData || null);
  const [currentTask, setCurrentTask] = useState<any>(null);
  
  // Custom Flow State
  const [flowState, setFlowState] = useState<FlowState>('initializing');
  const [selectedMCQOption, setSelectedMCQOption] = useState<string | null>(null);
  const [explanationType, setExplanationType] = useState<'subtopic_explanation' | 'level_explanation' | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<any>(null);
  const [hasSubmittedQuestion, setHasSubmittedQuestion] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Recording / Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoTtsEnabled, setIsAutoTtsEnabled] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top on flow state change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [flowState]);

  // Scroll to feedback on submit
  useEffect(() => {
    if (hasSubmittedQuestion && feedbackRef.current) {
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hasSubmittedQuestion]);

  // Sync state to parent on change
  useEffect(() => {
    if (sessionId) {
      onSessionSync(sessionId, conceptualVivaData, currentTask);
    }
  }, [sessionId, conceptualVivaData, currentTask]);

  // Fullscreen toggle on session start
  useEffect(() => {
    const enterFS = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    };
    
    if (sessionId) {
      enterFS();
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.warn("Exit fullscreen failed:", err));
      }
    };
  }, [sessionId]);

  // Initialize session
  useEffect(() => {
    if (!sessionId && initialParams) {
      startSession();
    } else if (initialData) {
      // Restore state
      setConceptualVivaData(initialData);
      if (initialData.next_task) {
        handleNextTaskResponse(initialData.next_task);
      }
    }
  }, []);

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

  const createSubmitFormData = (params: {
    session_id: string | number;
    subtopic_id: string | number;
    question_id?: string | number | null;
    user_answer?: string | null;
    is_intro?: boolean;
    action?: string;
    time_taken?: string | number;
    audio_file?: Blob | File | null;
  }) => {
    const fd = new FormData();
    fd.append('session_id', String(params.session_id));
    fd.append('subtopic_id', String(params.subtopic_id));
    
    if (params.question_id !== undefined && params.question_id !== null && String(params.question_id) !== 'null' && String(params.question_id).trim() !== '') {
      fd.append('question_id', String(params.question_id));
    } else {
      fd.append('question_id', '');
    }
    
    if (params.user_answer !== undefined && params.user_answer !== null && String(params.user_answer) !== 'null' && String(params.user_answer).trim() !== '') {
      fd.append('user_answer', String(params.user_answer));
    } else {
      fd.append('user_answer', '');
    }
    
    if (params.is_intro !== undefined) {
      fd.append('is_intro', params.is_intro ? 'true' : 'false');
    } else {
      fd.append('is_intro', '');
    }
    
    if (params.action !== undefined) {
      fd.append('action', String(params.action));
    } else {
      fd.append('action', '');
    }
    
    if (params.time_taken !== undefined && params.time_taken !== null) {
      fd.append('time_taken', String(params.time_taken));
    } else {
      fd.append('time_taken', '');
    }
    
    if (params.audio_file) {
      const filename = params.is_intro 
        ? `intro_${params.subtopic_id}.wav` 
        : `ans_${params.question_id}.wav`;
      fd.append('audio_file', params.audio_file, filename);
    } else {
      fd.append('audio_file', '');
    }
    
    return fd;
  };

  const startSession = async () => {
    try {
      setIsInitialLoading(true);
      const requiredFields = ['user_id', 'subject_id', 'chapter_id', 'topic_id', 'course_id', 'subscription_id'];
      
      const userIdVal = initialParams.user_id || localStorage.getItem('user_id') || userState?.user_id;
      const userId = userIdVal ? parseInt(String(userIdVal), 10) : 0;
      const subId = initialParams.subscription_id || localStorage.getItem('subscription_id');

      if (!userIdVal || !subId) {
        toast.error("Missing authentication or subscription credentials");
        onExit();
        return;
      }

      const startTime = initialParams.session_start_time || formatBackendTimestamp(new Date());

      const payload = {
        user_id: userId,
        subject_id: parseInt(String(initialParams.subject_id), 10),
        chapter_id: parseInt(String(initialParams.chapter_id), 10),
        topic_id: parseInt(String(initialParams.topic_id), 10),
        subscription_id: parseInt(String(subId), 10),
        session_start_time: startTime
      };

      console.log("startAITutorSession payload:", payload);

      const response = await AITutorService.StartAITutorSession(payload);
      console.log("startAITutorSession response:", response);
      if (response && response.session) {
        const newSessionId = response.session.session_id;
        setSessionId(newSessionId);
        setIsMuted(false);
        setConceptualVivaData(response);
        
        if (response.next_task) {
          handleNextTaskResponse(response.next_task);
        } else {
          toast.error("AI Tutor response missing task details");
        }
      } else {
        toast.error("Failed to initialize tutor session");
        onExit();
      }
    } catch (error: any) {
      console.error("Error starting AI Tutor session: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Error starting tutor session");
      onExit();
    } finally {
      setIsInitialLoading(false);
    }
  };

  const submitExplanationTransition = async (task: any) => {
    if (!sessionId) return;
    const subtopicId = task.subtopic_id || currentTask?.subtopic_id || conceptualVivaData?.session?.subtopic_id;
    if (!subtopicId) {
      console.warn("No subtopic ID available for explanation transition");
      setExplanationType(task.subtopic_explanation ? 'subtopic_explanation' : 'level_explanation');
      setFlowState('explanation_view');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = createSubmitFormData({
        session_id: sessionId,
        subtopic_id: subtopicId,
        is_intro: false,
        action: 'submit'
      });
      const response = await AITutorService.SubmitAITutorAnswer(formData);
      if (response && response.next_task) {
        setConceptualVivaData(response);
        handleNextTaskResponse(response.next_task, true);
      } else {
        setExplanationType(task.subtopic_explanation ? 'subtopic_explanation' : 'level_explanation');
        setFlowState('explanation_view');
      }
    } catch (error) {
      console.error("Error in submitExplanationTransition:", error);
      setExplanationType(task.subtopic_explanation ? 'subtopic_explanation' : 'level_explanation');
      setFlowState('explanation_view');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopAllAudioAndSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Component unmount audio cleanup
  useEffect(() => {
    return () => {
      stopAllAudioAndSpeech();
    };
  }, []);

  // State Machine Transitions
  const handleNextTaskResponse = (task: any, skipExplanations = false) => {
    stopAllAudioAndSpeech();
    setCurrentTask(task);
    setSelectedMCQOption(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setTimer(0);
    setQuestionFeedback(null);
    setHasSubmittedQuestion(false);

    if (!task) return;

    if (task.completed) {
      handleEndSession();
      return;
    }

    if (task.question) {
      setFlowState('question_answering');
      return;
    }

    if (task.ask_knowledge_flag) {
      setFlowState('knowledge_check');
      return;
    }

    // Checking if there is subtopic explanation or level explanation
    if (task.subtopic_explanation) {
      if (skipExplanations) {
        submitExplanationTransition(task);
      } else {
        setExplanationType('subtopic_explanation');
        setFlowState('explanation_view');
      }
      return;
    }

    if (task.explanation) {
      if (skipExplanations) {
        submitExplanationTransition(task);
      } else {
        setExplanationType('level_explanation');
        setFlowState('explanation_view');
      }
      return;
    }

    // In the Yes flow, ask_knowledge_flag has been cleared, subtopic_explanation is null, no questions yet
    if (task.subtopic_id && !task.subtopic_explanation && !task.question) {
      setFlowState('intro_recording');
      return;
    }
  };

  const handleEndSession = async () => {
    stopAllAudioAndSpeech();
    setIsFinishing(true);
    toast.success("AI Tutor Session completed!");
    try {
      const activeSessionId = sessionId || conceptualVivaData?.session?.session_id;
      if (activeSessionId) {
        await AITutorService.EndAITutorSession({ session_id: activeSessionId });
        onFinish(activeSessionId);
      } else {
        onExit();
      }
    } catch (error) {
      const activeSessionId = sessionId || conceptualVivaData?.session?.session_id;
      if (activeSessionId) {
        onFinish(activeSessionId);
      } else {
        onExit();
      }
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExitSession = () => {
    stopAllAudioAndSpeech();
    setShowExitConfirm(true);
  };

  // TTS triggers
  const speakText = (text: string, force = false) => {
    if (!text || (isMuted && !force)) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => voice.lang === 'en-IN' || voice.lang.includes('en-IN') || voice.name.includes('India'));
      
      if (indianVoice) utterance.voice = indianVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto Speak on flow transitions
  useEffect(() => {
    if (!isAutoTtsEnabled || isInitialLoading || !currentTask || isMuted) return;

    if (flowState === 'knowledge_check') {
      speakText(`Do you know about ${currentTask.subtopic_name || 'this topic'}?`);
    } else if (flowState === 'intro_recording') {
      speakText("Explain what you know about this subtopic out loud using your microphone.");
    } else if (flowState === 'explanation_view') {
      const expText = explanationType === 'subtopic_explanation' 
        ? (currentTask.subtopic_explanation_transcribe || currentTask.subtopic_explanation) 
        : (currentTask.explanation_transcribe || currentTask.explanation);
      speakText(expText || '');
    } else if (flowState === 'question_answering' && currentTask.question) {
      speakText(currentTask.question.question_transcribe || currentTask.question.question_text || '');
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [flowState, currentTask?.subtopic_id, currentTask?.question?.question_id, isInitialLoading, isMuted]);

  // Recording Timer
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
    stopAllAudioAndSpeech();
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

  const handlePlayToggle = () => {
    if (!audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
    } else {
      stopAllAudioAndSpeech();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  // Prevent refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionId && !isFinishing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, isFinishing]);

  // Submission Handlers

  // 1. Knowledge query response
  const handleKnowledgeCheckResponse = async (userKnows: boolean) => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = createSubmitFormData({
        session_id: sessionId,
        subtopic_id: currentTask.subtopic_id,
        user_answer: userKnows ? 'yes' : 'no',
        is_intro: false,
        action: 'set_knowledge_flag'
      });
      
      console.log("submitAITutorAnswer (knowledge check) payload:", {
        session_id: sessionId,
        subtopic_id: String(currentTask.subtopic_id),
        question_id: "",
        user_answer: userKnows ? 'yes' : 'no',
        is_intro: false,
        action: 'set_knowledge_flag',
        audio_file: ""
      });
      const response = await AITutorService.SubmitAITutorAnswer(formData);
      console.log("submitAITutorAnswer (knowledge check) response:", response);
      if (response && response.next_task) {
        setConceptualVivaData(response);
        handleNextTaskResponse(response.next_task);
      } else {
        toast.error("Failed to fetch next step from server");
      }
    } catch (error: any) {
      console.error("Error in handleKnowledgeCheckResponse: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Failed to register choice");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit Intro Audio Explanation (User said Yes/Yes I understand)
  const handleSubmitIntroAudio = async () => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }
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

    if (!blobToSubmit) {
      toast.error("Please record your audio explanation first");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = createSubmitFormData({
        session_id: sessionId,
        subtopic_id: currentTask.subtopic_id,
        is_intro: true,
        action: 'submit',
        time_taken: timer,
        audio_file: blobToSubmit
      });

      console.log("submitAITutorAnswer (intro audio) payload:", {
        session_id: sessionId,
        subtopic_id: String(currentTask.subtopic_id),
        question_id: "",
        user_answer: "",
        is_intro: true,
        action: 'submit',
        time_taken: timer,
        audio_file: `intro_${currentTask.subtopic_id}.wav`
      });

      const response = await AITutorService.SubmitAITutorAnswer(formData);
      console.log("submitAITutorAnswer (intro audio) response:", response);
      if (response && response.next_task) {
        setConceptualVivaData(response);
        handleNextTaskResponse(response.next_task);
        toast.success("Intro explanation submitted successfully");
      } else {
        toast.error("Failed to advance to next step");
      }
    } catch (error: any) {
      console.error("Error in handleSubmitIntroAudio: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Failed to submit audio introduction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Continue explanation click
  const handleContinueExplanation = async () => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (explanationType === 'subtopic_explanation' && flowState === 'explanation_view') {
      // In the NO flow, showing subtopic explanation, click "Yes, I understand" goes to record intro
      setFlowState('intro_recording');
      setAudioBlob(null);
      setAudioUrl(null);
      setTimer(0);
      return;
    }

    // In the YES flow (or level explanation check), clicking continue goes directly to question if exists
    if (currentTask.question) {
      setFlowState('question_answering');
      setSelectedMCQOption(null);
      return;
    }

    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }

    // If no question is loaded, fetch next task
    setIsSubmitting(true);
    try {
      const formData = createSubmitFormData({
        session_id: sessionId,
        subtopic_id: currentTask.subtopic_id,
        is_intro: false,
        action: 'submit'
      });

      console.log("submitAITutorAnswer (continue explanation) payload:", {
        session_id: sessionId,
        subtopic_id: String(currentTask.subtopic_id),
        question_id: "",
        user_answer: "",
        is_intro: false,
        action: 'submit',
        audio_file: ""
      });
      const response = await AITutorService.SubmitAITutorAnswer(formData);
      console.log("submitAITutorAnswer (continue explanation) response:", response);
      if (response && response.next_task) {
        setConceptualVivaData(response);
        handleNextTaskResponse(response.next_task);
      } else {
        toast.error("Failed to fetch next task");
      }
    } catch (error: any) {
      console.error("Error in handleContinueExplanation: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Failed to load next stage");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Submit Question Answer (MCQ/TF/Audio)
  const handleSubmitAnswer = async () => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (!currentTask?.question) return;
    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }
    const qType = currentTask.question.type;

    if ((qType === 'MCQ' || qType === 'TF' || qType === 'True/False') && !selectedMCQOption) {
      toast.error("Please select an option first");
      return;
    }

    let blobToSubmit = audioBlob;
    if ((qType === 'audio' || qType === 'Short Answer') && isRecording && mediaRecorder) {
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

    if ((qType === 'audio' || qType === 'Short Answer') && !blobToSubmit) {
      toast.error("Please record your answer first");
      return;
    }

    setIsSubmitting(true);
    try {
      if (qType === 'audio' || qType === 'Short Answer') {
        const formData = createSubmitFormData({
          session_id: sessionId,
          subtopic_id: currentTask.subtopic_id,
          question_id: currentTask.question.question_id,
          is_intro: false,
          action: 'submit',
          time_taken: timer,
          audio_file: blobToSubmit!
        });

        console.log("submitAITutorAnswer (audio question) payload:", {
          session_id: sessionId,
          subtopic_id: String(currentTask.subtopic_id),
          question_id: parseInt(String(currentTask.question.question_id), 10),
          user_answer: "",
          is_intro: false,
          action: 'submit',
          time_taken: timer,
          audio_file: `ans_${currentTask.question.question_id}.wav`
        });

        const response = await AITutorService.SubmitAITutorAnswer(formData);
        console.log("submitAITutorAnswer (audio question) response:", response);
        if (response) {
          setConceptualVivaData(response);
          setQuestionFeedback(response);
          setHasSubmittedQuestion(true);
          toast.success("Response submitted");

          // Trigger speak of explanation transcribe
          const speakContent = response.explanation_transcribe || 
                               response.subtopic_explanation_transcribe || 
                               response.explanation || 
                               response.subtopic_explanation || 
                               response.feedback_data?.explanation_transcribe || 
                               response.feedback_data?.explanation || 
                               response.feedback || 
                               response.ai_feedback;
          if (speakContent) {
            speakText(speakContent);
          }
        } else {
          toast.error("Failed to submit response");
        }
      } else {
        // MCQ or TF
        let answerToSend = selectedMCQOption;
        if (qType === 'MCQ') {
          const optionIndex = currentTask.question.options?.indexOf(selectedMCQOption);
          if (optionIndex !== -1 && optionIndex !== undefined) {
            const alphabet = ["A", "B", "C", "D"];
            answerToSend = alphabet[optionIndex] || selectedMCQOption;
          }
        } else if (qType === 'TF' || qType === 'True/False') {
          if (selectedMCQOption?.toLowerCase() === 'true') {
            answerToSend = 'True';
          } else if (selectedMCQOption?.toLowerCase() === 'false') {
            answerToSend = 'False';
          }
        }

        const formData = createSubmitFormData({
          session_id: sessionId,
          subtopic_id: currentTask.subtopic_id,
          question_id: currentTask.question.question_id,
          user_answer: answerToSend,
          is_intro: false,
          action: 'submit'
        });

        console.log("submitAITutorAnswer (MCQ/TF question) payload:", {
          session_id: sessionId,
          subtopic_id: String(currentTask.subtopic_id),
          question_id: parseInt(String(currentTask.question.question_id), 10),
          user_answer: answerToSend ? String(answerToSend) : "",
          is_intro: false,
          action: 'submit',
          audio_file: ""
        });
        const response = await AITutorService.SubmitAITutorAnswer(formData);
        console.log("submitAITutorAnswer (MCQ/TF question) response:", response);
        if (response) {
          setConceptualVivaData(response);
          setQuestionFeedback(response);
          setHasSubmittedQuestion(true);
          toast.success("Answer submitted");

          // Trigger speak of explanation transcribe
          const speakContent = response.explanation_transcribe || 
                               response.subtopic_explanation_transcribe || 
                               response.explanation || 
                               response.subtopic_explanation || 
                               response.feedback_data?.explanation_transcribe || 
                               response.feedback_data?.explanation || 
                               response.feedback || 
                               response.ai_feedback;
          if (speakContent) {
            speakText(speakContent);
          }
        } else {
          toast.error("Failed to submit answer");
        }
      }
    } catch (error: any) {
      console.error("Error in handleSubmitAnswer: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Error submitting answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToNextQuestion = () => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (questionFeedback && questionFeedback.next_task) {
      handleNextTaskResponse(questionFeedback.next_task, true);
    } else {
      handleEndSession();
    }
  };

  // Skip subtopic
  const handleSkipSubtopic = async () => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = createSubmitFormData({
          session_id: sessionId,
          subtopic_id: currentTask.subtopic_id,
          question_id: currentTask.question?.question_id,
          is_intro: false,
          action: 'skip'
      });

      console.log("submitAITutorAnswer (skip subtopic) payload:", {
        session_id: sessionId,
        subtopic_id: String(currentTask.subtopic_id),
        question_id: currentTask.question?.question_id ? parseInt(String(currentTask.question.question_id), 10) : "",
        user_answer: "",
        is_intro: false,
        action: 'skip',
        audio_file: ""
      });
      const response = await AITutorService.SubmitAITutorAnswer(formData);
      console.log("submitAITutorAnswer (skip subtopic) response:", response);
      if (response && response.next_task) {
        setConceptualVivaData(response);
        handleNextTaskResponse(response.next_task);
        toast.success("Skipped to next subtopic");
      } else {
        toast.error("Failed to skip subtopic");
      }
    } catch (error: any) {
      console.error("Error in handleSkipSubtopic: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Error skipping subtopic");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Repeat subtopic
  const handleRepeatSubtopic = async () => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = createSubmitFormData({
          session_id: sessionId,
          subtopic_id: currentTask.subtopic_id,
          question_id: currentTask.question?.question_id,
          is_intro: false,
          action: 'repeat'
      });

      console.log("submitAITutorAnswer (repeat subtopic) payload:", {
        session_id: sessionId,
        subtopic_id: String(currentTask.subtopic_id),
        question_id: currentTask.question?.question_id ? parseInt(String(currentTask.question.question_id), 10) : "",
        user_answer: "",
        is_intro: false,
        action: 'repeat',
        audio_file: ""
      });
      const response = await AITutorService.SubmitAITutorAnswer(formData);
      console.log("submitAITutorAnswer (repeat subtopic) response:", response);
      if (response && response.next_task) {
        setConceptualVivaData(response);
        handleNextTaskResponse(response.next_task);
        toast.success("Additional practice loaded");
      } else {
        toast.error("Failed to request repeat questions");
      }
    } catch (error: any) {
      console.error("Error in handleRepeatSubtopic: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Error requesting practice questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip single question
  const handleSkipQuestion = async () => {
    stopAllAudioAndSpeech();
    if (isSubmitting) return;
    if (!currentTask?.question) return;
    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = createSubmitFormData({
          session_id: sessionId,
          subtopic_id: currentTask.subtopic_id,
          question_id: currentTask.question.question_id,
          is_intro: false,
          action: 'skip_question'
      });

      console.log("submitAITutorAnswer (skip question) payload:", {
        session_id: sessionId,
        subtopic_id: String(currentTask.subtopic_id),
        question_id: parseInt(String(currentTask.question.question_id), 10),
        user_answer: "",
        is_intro: false,
        action: 'skip_question',
        audio_file: ""
      });
      const response = await AITutorService.SubmitAITutorAnswer(formData);
      console.log("submitAITutorAnswer (skip question) response:", response);
      if (response && response.next_task) {
        setConceptualVivaData(response);
        handleNextTaskResponse(response.next_task);
        toast.success("Question skipped (Score: 0)");
      } else {
        toast.error("Failed to skip question");
      }
    } catch (error: any) {
      console.error("Error in handleSkipQuestion: complete error context", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      toast.error("Error skipping question");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading || (!sessionId && !isFinishing)) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-violet-600/10 border-t-violet-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-9 h-9 text-violet-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500 font-bold tracking-wide animate-pulse">Initializing AI Tutor Session...</p>
      </div>
    );
  }

  if (isFinishing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-fuchsia-600/10 border-t-fuchsia-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <CheckCircle2 className="w-8 h-8 text-fuchsia-600" />
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500 font-bold tracking-wide">Compiling feedback report...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 md:p-6 max-w-6xl mx-auto min-h-screen bg-slate-50/30 pb-12 relative w-full">
      
      {/* Session Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight mt-1 break-words">
            {currentTask?.subtopic_name ? `Subtopic: ${currentTask.subtopic_name}` : "AI Tutor Active Study"}
          </h2>
          {flowState !== 'initializing' && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Skip Subtopic button */}
              <button
                disabled={isSubmitting}
                onClick={handleSkipSubtopic}
                className="px-3 py-1.5 sm:px-4 sm:py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xs cursor-pointer"
                title="Skip entire subtopic"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip Subtopic</span>
              </button>

              {/* Repeat Practice button */}
              <button
                disabled={isSubmitting}
                onClick={handleRepeatSubtopic}
                className="px-3 py-1.5 sm:px-4 sm:py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 hover:text-violet-700 font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xs cursor-pointer"
                title="Request additional practice"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Repeat Practice</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
          <button 
            onClick={() => {
              if (!isMuted) {
                window.speechSynthesis.cancel();
              }
              setIsMuted(!isMuted);
            }} 
            className={`text-xs font-bold transition-all uppercase tracking-wider px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer ${
              isMuted 
                ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50' 
                : 'bg-white text-slate-500 hover:text-violet-600 border-slate-200'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? "Unmute " : "Mute"}</span>
          </button>

          <button 
            onClick={handleExitSession} 
            className="text-xs font-bold text-white bg-rose-600 border border-rose-600 hover:bg-rose-700 transition-colors uppercase tracking-wider px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md shadow-rose-100/50 cursor-pointer"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Main Flow Rendering Panel */}
      <div className="space-y-4 min-h-[40vh]">

        {/* 1. KNOWLEDGE CHECK VIEW */}
        {flowState === 'knowledge_check' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-sm border border-slate-100 text-center space-y-6 sm:space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="w-14 h-14 sm:w-16 sm:h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto border border-violet-100 shrink-0">
               <HelpCircle className="w-7 h-7 sm:w-9 sm:h-9 text-violet-600" />
             </div>

             <div className="space-y-2 sm:space-y-3 px-2">
               <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Pre-Assessment Inquiry</span>
               <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight max-w-md mx-auto break-words leading-tight">
                 Are you aware about <span className="text-violet-600">{currentTask?.subtopic_name}</span>?
               </h3>
               <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                 Choose honestly. The AI Tutor uses this check to either explain the basics or test your knowledge directly.
               </p>
             </div>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto pt-2 sm:pt-4 w-full">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleKnowledgeCheckResponse(true)}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-[1.01] transition-transform text-white font-black rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md shadow-violet-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>YES, I KNOW THIS</span>
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleKnowledgeCheckResponse(false)}
                  className="w-full py-3.5 sm:py-4 bg-white border-2 border-slate-200 hover:border-violet-300 text-slate-600 hover:text-violet-700 transition-colors font-black rounded-xl sm:rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>NO, EXPLAIN FIRST</span>
                </button>
             </div>
          </div>
        )}

        {/* 2. AUDIO RECORDER (INTRO EXPLANATION) */}
        {flowState === 'intro_recording' && (
          <div className="space-y-6">
             <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center border border-fuchsia-100 shrink-0">
                  <Sparkles className="w-5 h-5 text-fuchsia-500" />
               </div>
               <div>
                 <h4 className="font-bold text-slate-800 text-sm leading-tight">Introduce the Concept</h4>
                 <p className="text-slate-400 text-xs mt-0.5">
                   Explain the subtopic in your own words. The AI will evaluate your speech reasoning.
                 </p>
               </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-4 md:p-12 shadow-sm flex flex-col items-center justify-center">
                {/* Visualizer voice block */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 bg-violet-100/50 rounded-full animate-ping [animation-duration:1.5s]"></div>
                      <div className="absolute inset-4 bg-fuchsia-100/50 rounded-full animate-pulse [animation-duration:1s]"></div>
                    </>
                  )}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isSubmitting}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isRecording 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200 hover:scale-[1.02]'
                    }`}
                  >
                    {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-9 h-9" />}
                  </button>
                </div>

                <div className="text-center space-y-2">
                   <h5 className="font-black text-slate-800 text-sm">
                     {isRecording ? "Listening to explanation..." : audioBlob ? "Explanation Captured" : "Click mic to record explanation"}
                   </h5>
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg font-mono text-slate-500 text-xs font-bold">
                     <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></span>
                     <span>{isRecording || audioBlob ? `${timer}s` : "00s"}</span>
                   </div>
                </div>

                {/* Mock wave visualizer bars */}
                <div className="flex items-end justify-center gap-1 h-6 w-48 px-6 mt-5">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-0.5 rounded-full bg-violet-400 transition-all duration-300 ${isRecording ? 'animate-bounce' : 'h-1 opacity-20'}`}
                      style={{ 
                        height: isRecording ? `${Math.random() * 100}%` : '4px',
                        animationDelay: `${i * 0.05}s`
                      }}
                    ></div>
                  ))}
                </div>

                {/* Local replay */}
                {audioUrl && !isRecording && (
                  <button 
                    onClick={handlePlayToggle}
                    disabled={isSubmitting}
                    className={`mt-6 flex items-center gap-2 px-6 py-2 rounded-xl border text-xs font-bold transition-all ${
                      isPlaying ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-150 hover:bg-slate-100'
                    }`}
                  >
                    {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{isPlaying ? "Stop" : "Listen Response"}</span>
                  </button>
                )}

                <div className="mt-8 w-full border-t border-slate-100 pt-6 flex justify-center">
                   <button
                     disabled={isSubmitting || !audioBlob}
                     onClick={handleSubmitIntroAudio}
                     className={`px-12 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                       audioBlob && !isSubmitting
                         ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-100 hover:scale-[1.01]'
                         : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                     }`}
                   >
                     {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                     <span>SUBMIT RESPONSE</span>
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* 3. EXPLANATION PANEL */}
        {flowState === 'explanation_view' && (
          <div className="space-y-4">
             {/* Question/Brief Box */}
             <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                     <span className="text-[10px] font-black text-violet-500 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                       {explanationType === 'subtopic_explanation' ? "Subtopic Introduction" : "Level Brief"}
                     </span>
                     
                     <div className="prose text-slate-700 leading-relaxed font-medium text-xs sm:text-sm md:text-base pt-2 whitespace-pre-line break-words">
                       {explanationType === 'subtopic_explanation' 
                         ? currentTask.subtopic_explanation 
                         : currentTask.explanation
                       }
                     </div>
                  </div>
                  {/* Repeat Audio button */}
                  <button
                    onClick={() => speakText(explanationType === 'subtopic_explanation' ? currentTask.subtopic_explanation : currentTask.explanation, true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-650 hover:text-violet-650 hover:border-violet-300 transition-colors shadow-2xs font-bold text-xs shrink-0 self-start mt-1 cursor-pointer"
                    title="Repeat Audio"
                  >
                    <Volume2 className="w-4 h-4 text-violet-500" />
                    <span>Repeat Audio</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                   <button
                     disabled={isSubmitting}
                     onClick={handleContinueExplanation}
                     className="w-full sm:w-auto px-8 sm:px-10 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-black text-xs shadow-md shadow-violet-100 hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                   >
                     <span>{explanationType === 'subtopic_explanation' ? "YES, I UNDERSTAND" : "CONTINUE"}</span>
                     <ArrowRight className="w-3.5 h-3.5" />
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* 4. QUESTION ANSWER PANEL */}
        {flowState === 'question_answering' && currentTask?.question && (
          <div className="space-y-4">
             
             {/* Question Display Card */}
             <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex flex-col md:flex-row items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                     <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest block">
                       {currentTask.question.type === 'MCQ' ? "Multiple Choice Question" : 
                        (currentTask.question.type === 'TF' || currentTask.question.type === 'True/False') ? "True or False Question" : 
                        currentTask.question.type === 'Short Answer' ? "Short Answer (Record Speech)" : "Conceptual Speech Query"}
                     </span>
                     <div className="text-sm sm:text-base md:text-lg font-bold text-slate-800 leading-relaxed break-words">
                        {currentTask.question.question_transcribe ? (
                          currentTask.question.question_transcribe
                        ) : (
                          latexToText(currentTask.question.question_text || "Study the question:")
                        )}
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start shrink-0 flex-wrap">
                    {/* Repeat Audio button */}
                    <button
                      onClick={() => speakText(currentTask.question.question_transcribe || currentTask.question.question_text || '', true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-650 hover:text-violet-650 hover:border-violet-300 transition-colors shadow-2xs font-bold text-xs shrink-0 cursor-pointer"
                      title="Repeat Audio"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-violet-500" />
                      <span>Repeat Audio</span>
                    </button>

                    {/* Skip Question button */}
                    {!hasSubmittedQuestion && (
                      <button
                        disabled={isSubmitting}
                        onClick={handleSkipQuestion}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 hover:text-rose-750 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-2xs animate-pulse cursor-pointer"
                        title="Skip only the current question"
                      >
                        <FastForward className="w-3 h-3 text-rose-555" />
                        <span>Skip Question</span>
                      </button>
                    )}
                  </div>
                </div>
             </div>

             {/* Dynamic Question Inputs */}

             {/* MCQ Option Choices */}
             {currentTask.question.type === 'MCQ' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentTask.question.options?.map((option: string, i: number) => {
                    const alphabet = ["A", "B", "C", "D"];
                    const optionLetter = alphabet[i];
                    const isSelected = selectedMCQOption === option;
                    
                    let buttonClass = 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/10 text-slate-600 bg-white';
                    let badgeClass = 'border-slate-300 group-hover:border-violet-400';
                    let badgeContent = null;

                    if (hasSubmittedQuestion) {
                      const correctAnsRaw = questionFeedback?.correct_answer || questionFeedback?.correctAnswer || questionFeedback?.correct_ans || questionFeedback?.feedback_data?.correct_answer || '';
                      const isCorrect = (String(correctAnsRaw).toUpperCase() === optionLetter) || 
                                        (String(correctAnsRaw).toLowerCase() === String(option).toLowerCase());
                      
                      if (isCorrect) {
                        buttonClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                        badgeClass = 'bg-emerald-600 border-emerald-600 text-white';
                        badgeContent = <Check className="w-3 h-3 stroke-[3]" />;
                      } else if (isSelected) {
                        buttonClass = 'border-rose-500 bg-rose-50 text-rose-800 font-bold';
                        badgeClass = 'bg-rose-600 border-rose-600 text-white';
                        badgeContent = <span className="text-[10px] font-black leading-none">X</span>;
                      } else {
                        buttonClass = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                        badgeClass = 'border-slate-200';
                      }
                    } else if (isSelected) {
                      buttonClass = 'border-fuchsia-600 bg-fuchsia-50/50 text-fuchsia-700 shadow-sm';
                      badgeClass = 'bg-fuchsia-600 border-fuchsia-600 text-white';
                      badgeContent = <Check className="w-3 h-3 stroke-[3]" />;
                    }

                    return (
                      <button
                        key={i}
                        disabled={hasSubmittedQuestion}
                        onClick={() => setSelectedMCQOption(option)}
                        className={`flex items-center justify-between p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all text-left group cursor-pointer ${buttonClass}`}
                      >
                         <span className="text-xs sm:text-sm font-bold leading-snug break-words">{option}</span>
                         <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors ${badgeClass}`}>
                           {badgeContent}
                         </div>
                      </button>
                    );
                  })}
                </div>
             )}

             {/* True / False Select Options */}
             {(currentTask.question.type === 'TF' || currentTask.question.type === 'True/False') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  {['true', 'false'].map((option) => {
                    const isSelected = selectedMCQOption === option;
                    
                    let buttonClass = 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/10 text-slate-600 bg-white';
                    let badgeClass = 'border-slate-300 group-hover:border-violet-400';
                    let badgeContent = null;

                    if (hasSubmittedQuestion) {
                      const correctAnsRaw = questionFeedback?.correct_answer || questionFeedback?.correctAnswer || questionFeedback?.correct_ans || questionFeedback?.feedback_data?.correct_answer || '';
                      const isCorrect = (String(correctAnsRaw).toLowerCase() === option.toLowerCase());
                      
                      if (isCorrect) {
                        buttonClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                        badgeClass = 'bg-emerald-600 border-emerald-600 text-white';
                        badgeContent = <Check className="w-3.5 h-3.5 stroke-[3]" />;
                      } else if (isSelected) {
                        buttonClass = 'border-rose-500 bg-rose-50 text-rose-800 font-bold';
                        badgeClass = 'bg-rose-600 border-rose-600 text-white';
                        badgeContent = <span className="text-xs font-black leading-none">X</span>;
                      } else {
                        buttonClass = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                        badgeClass = 'border-slate-200';
                      }
                    } else if (isSelected) {
                      buttonClass = 'border-fuchsia-600 bg-fuchsia-50/50 text-fuchsia-700 shadow-sm';
                      badgeClass = 'bg-fuchsia-600 border-fuchsia-600 text-white';
                      badgeContent = <Check className="w-3.5 h-3.5 stroke-[3]" />;
                    }

                    return (
                      <button
                        key={option}
                        disabled={hasSubmittedQuestion}
                        onClick={() => setSelectedMCQOption(option)}
                        className={`py-3 sm:py-3.5 rounded-xl border transition-all font-bold text-xs uppercase flex flex-col items-center gap-1.5 group cursor-pointer ${buttonClass}`}
                      >
                         <span className="tracking-wider">{option}</span>
                         <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${badgeClass}`}>
                           {badgeContent}
                         </div>
                      </button>
                    );
                  })}
                </div>
             )}

             {/* Audio Recorder Visualizer Interface */}
             {(currentTask.question.type === 'audio' || currentTask.question.type === 'Short Answer') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm flex flex-col items-center justify-center">
                  
                  {/* Glowing visuals */}
                  {!hasSubmittedQuestion ? (
                    <>
                      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                        {isRecording && (
                          <>
                            <div className="absolute inset-0 bg-violet-100/50 rounded-full animate-ping [animation-duration:1.5s]"></div>
                            <div className="absolute inset-4 bg-fuchsia-100/50 rounded-full animate-pulse [animation-duration:1s]"></div>
                          </>
                        )}
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={isSubmitting}
                          className={`w-18 h-18 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            isRecording 
                              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200 hover:scale-[1.02]'
                          }`}
                        >
                          {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-7 h-7" />}
                        </button>
                      </div>

                      <div className="text-center space-y-1.5">
                         <h5 className="font-bold text-slate-800 text-sm">
                           {isRecording ? "AI Tutor is recording response..." : audioBlob ? "Recording Saved" : "Click mic to record explanation"}
                         </h5>
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg font-mono text-slate-500 text-[11px] font-bold">
                           <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></span>
                           <span>{isRecording || audioBlob ? `${timer}s` : "00s"}</span>
                         </div>
                      </div>

                      {/* Bouncing wave bars */}
                      <div className="flex items-end justify-center gap-1 h-5 w-48 px-6 mt-4">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-0.5 rounded-full bg-violet-400 transition-all duration-300 ${isRecording ? 'animate-bounce' : 'h-1 opacity-20'}`}
                            style={{ 
                              height: isRecording ? `${Math.random() * 100}%` : '4px',
                              animationDelay: `${i * 0.05}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-1.5 py-2">
                    </div>
                  )}

                  {/* Replay controller */}
                  {audioUrl && !isRecording && (
                    <button 
                      onClick={handlePlayToggle}
                      disabled={isSubmitting}
                      className={`mt-4 flex items-center gap-2 px-5 py-2 rounded-lg border text-xs font-bold transition-all ${
                        isPlaying ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-150 hover:bg-slate-100'
                      }`}
                    >
                      {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isPlaying ? "Stop" : "Listen Response"}</span>
                    </button>
                  )}
                </div>
             )}

             {/* Action trigger submits */}
             <div className="flex justify-center pt-2">
                {!hasSubmittedQuestion ? (
                  <button
                    disabled={isSubmitting || ((currentTask.question.type === 'audio' || currentTask.question.type === 'Short Answer') && !audioBlob) || ((currentTask.question.type === 'MCQ' || currentTask.question.type === 'TF' || currentTask.question.type === 'True/False') && !selectedMCQOption)}
                    onClick={handleSubmitAnswer}
                    className={`w-full sm:w-auto px-8 sm:px-12 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      ((currentTask.question.type === 'audio' || currentTask.question.type === 'Short Answer') ? audioBlob : selectedMCQOption) && !isSubmitting
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-100 hover:scale-[1.01]'
                        : 'bg-slate-150 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>SUBMIT ANSWER</span>
                  </button>
                ) : (
                  <button
                    onClick={handleProceedToNextQuestion}
                    className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-emerald-600 hover:scale-[1.01] text-white shadow-md shadow-emerald-100 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>NEXT QUESTION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
             </div>

             {/* Feedback Details Card */}
             {hasSubmittedQuestion && questionFeedback && (
                <div ref={feedbackRef} className="bg-gradient-to-br from-violet-50 to-indigo-50/50 rounded-2xl p-4 md:p-5 border border-violet-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-600 animate-pulse" />
                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">AI Evaluation & Feedback</h4>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Accuracy Badge */}
                      {(() => {
                        const accuracy = questionFeedback.accuracy !== undefined ? questionFeedback.accuracy : 
                                         questionFeedback.score !== undefined ? questionFeedback.score : 
                                         questionFeedback.ai_score !== undefined ? questionFeedback.ai_score : 
                                         questionFeedback.feedback_data?.score !== undefined ? questionFeedback.feedback_data?.score : null;
                        if (accuracy === null) return null;
                        
                        const numericAccuracy = Number(accuracy);
                        const displayScore = numericAccuracy <= 10 ? `${numericAccuracy}/10` : `${numericAccuracy}%`;
                        const isGood = numericAccuracy >= 5 && numericAccuracy !== 0;
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                              isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {displayScore}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Feedback section */}
                    {(() => {
                      const feedbackText = questionFeedback.feedback || questionFeedback.ai_feedback || questionFeedback.critique || questionFeedback.feedback_data?.feedback;
                      if (!feedbackText) return null;
                      return (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest block">AI Critique</span>
                          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-violet-100/50 text-slate-700 text-xs md:text-sm leading-relaxed font-semibold">
                            {feedbackText}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Explanation section */}
                    {(() => {
                      const explanationText = questionFeedback.explanation || questionFeedback.reason || questionFeedback.answer_explanation || questionFeedback.feedback_data?.explanation;
                      if (!explanationText) return null;
                      return (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest block">Core Explanation</span>
                          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-fuchsia-100/50 text-slate-700 text-xs md:text-sm leading-relaxed font-semibold">
                            {explanationText}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Correct Answer Display */}
                  {/* {(() => {
                    const correctAnsRaw = questionFeedback.correct_answer || questionFeedback.correctAnswer || questionFeedback.correct_ans || questionFeedback.feedback_data?.correct_answer;
                    if (!correctAnsRaw) return null;
                    return (
                      <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100/50 px-5 py-3 rounded-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-xs text-slate-700 font-bold">
                          <span className="text-emerald-700 uppercase tracking-wider text-[10px] font-black mr-2">Correct Answer:</span>
                          {correctAnsRaw}
                        </p>
                      </div>
                    );
                  })()} */}
                </div>
             )}

          </div>
        )}

      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border border-slate-100 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">End Study Session?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Are you sure you want to end this tutor session? Your progress will be saved, and you will return to the selection dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={async () => {
                  setShowExitConfirm(false);
                  setIsFinishing(true);
                  try {
                    if (sessionId) {
                      await AITutorService.EndAITutorSession({ session_id: sessionId });
                      toast.success("Session ended successfully");
                    }
                  } catch (err) {
                    console.error("Failed to end session:", err);
                  } finally {
                    setIsFinishing(false);
                    onExit();
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:scale-[1.01] transition-transform text-white font-black rounded-2xl text-xs tracking-wider uppercase shadow-md shadow-rose-100 flex items-center justify-center gap-2"
              >
                <span>YES, END SESSION</span>
              </button>
              
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors font-black rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <span>CANCEL</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
