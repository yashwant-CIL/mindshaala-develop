import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { CompetitionItem } from '../Competitions';
import { CompetitionService } from '../../../services/CompetitionService';
import { useNetworkNow } from '../../../utils/networkTime';
import { QuestionMathJax } from '../../../shared/mathjaxconfig/QuestionMathJax';

export interface QuestionDetails {
  answer_description?: string;
  description_diagrams_url?: string | null;
  question_id?: string | number;
  question_latex?: string;
}

export interface QuestionItem {
  id?: string | number;
  question_id?: string | number;
  viva_q_id?: string | number;
  viva_question_id?: string | number;
  gk_question_id?: string | number;
  conceptual_question_id?: string | number;
  question_no?: number;
  question?: string;
  question_text?: string;
  question_transcribe?: string;
  answer_transcribe?: string;
  question_details?: QuestionDetails;
  time_per_question?: number;
  chapter_id?: string | number;
  course_id?: string | number;
  subject_id?: string | number;
  gk_question?: string;
  conceptual_question?: string;
  viva_question?: string;
  title?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  options?: string[];
  [key: string]: any;
}

export interface VivaSessionData {
  assessment_name?: string;
  chapter_id?: string | number;
  course_id?: string | number;
  session_id?: string | number;
  started_at?: string;
  status?: string;
  subject_id?: string | number;
  total_questions?: number;
  total_time?: number;
  total_time_seconds?: number | string;
  user_id?: string | number;
  viva_type?: string;
}
import { speakText, stopSpeech } from '../../../utils/ttsHelper';
import {
  Mic,
  Square,
  RefreshCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  Loader2,
  AlertCircle,
  FileCheck,
  SkipForward
} from 'lucide-react';

export interface VivaExamRendererProps {
  comp: CompetitionItem;
  userId?: string | number;
  initialData?: any;
  onExit: () => void;
  onComplete: (resultData?: any) => void;
}

const getNowLocalISO = (d: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const VivaExamRenderer: React.FC<VivaExamRendererProps> = ({
  comp,
  userId,
  initialData,
  onExit,
  onComplete
}) => {
  const nowMs = useNetworkNow(1000);

  // Refs for tracking timestamps
  const examStartMsRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<string>(getNowLocalISO());
  const questionStartMsRef = useRef<number>(Date.now());

  // Exam States
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, any>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAutoSubmit, setIsAutoSubmit] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | number>('');
  const [sessionData, setSessionData] = useState<VivaSessionData | null>(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('viva_tts_muted') === 'true';
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const voiceStartTimeRef = useRef<string>(getNowLocalISO());

  // Security / Anti-Cheat States
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');

  const competitionId: string | number = comp.competition_id ?? comp.id ?? '';
  const currentUserId: string | number = userId ?? localStorage.getItem('user_id') ?? 'guest';
  const candidateUsername: string = Cookies.get('username') || localStorage.getItem('username') || 'Student';

  const currentQ = questions[currentQuestionIndex] || {};
  const questionText =
    currentQ.question_transcribe ||
    currentQ.question_details?.question_latex ||
    currentQ.question_transcrib ||
    currentQ.question_text ||
    currentQ.question ||
    currentQ.title ||
    '';

  const totalQuestions = sessionData?.total_questions || questions.length;

  // Dynamic Exam Countdown calculation
  const actualExamStartMs = (sessionData?.started_at && !isNaN(new Date(sessionData.started_at).getTime()))
    ? new Date(sessionData.started_at).getTime()
    : examStartMsRef.current;

  const totalExamSeconds = (() => {
    const rawTotalTime =
      sessionData?.total_time ??
      (sessionData as any)?.session?.total_time ??
      initialData?.session?.total_time ??
      initialData?.total_time ??
      initialData?.data?.session?.total_time ??
      initialData?.data?.total_time ??
      sessionData?.total_time_seconds ??
      comp.total_time;

    if (rawTotalTime != null && Number(rawTotalTime) > 0) {
      const num = Number(rawTotalTime);
      return num < 100 ? num * 60 : num;
    }
    if (questions.length > 0) {
      const sum = questions.reduce((acc, q) => acc + (Number(q.time_per_question) || 120), 0);
      if (sum > 0) return sum;
    }
    return 1800;
  })();

  const actualExamEndMs = actualExamStartMs + (totalExamSeconds * 1000);
  const remainingMs = Math.max(0, actualExamEndMs - nowMs);
  const isTimeExpired = remainingMs <= 0;

  const questionIdVal = currentQ.question_id ?? currentQ.id ?? '';
  const vivaQIdVal = currentQ.viva_q_id ?? currentQ.viva_question_id ?? '';
  const qTrackingKey = vivaQIdVal || questionIdVal || (currentQuestionIndex + 1);

  useEffect(() => {
    setVisitedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    setAudioBlob(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    
    const nowIso = getNowLocalISO();
    questionStartTimeRef.current = nowIso;
    questionStartMsRef.current = Date.now();
    voiceStartTimeRef.current = nowIso;

    if (timerRef.current) clearInterval(timerRef.current);

    const existingAns = userAnswers[qTrackingKey] || userAnswers[currentQuestionIndex];
    if (existingAns?.audioUrl) {
      setAudioUrl(existingAns.audioUrl);
    } else {
      setAudioUrl(null);
    }
  }, [currentQuestionIndex]);

  // TTS Read Question
  useEffect(() => {
    if (!isMuted && questionText) {
      stopSpeech();
      speakText(questionText, { rate: 0.95 });
    }
    return () => {
      stopSpeech();
    };
  }, [currentQuestionIndex, questionText, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('viva_tts_muted', String(nextMuted));
    if (nextMuted) {
      stopSpeech();
    } else {
      stopSpeech();
      if (questionText) {
        speakText(questionText, { rate: 0.95 });
      }
    }
  };

  // 1. Initialize Viva Competition & Start API call
  useEffect(() => {
    let isMounted = true;
    const initVivaCompetition = async () => {
      setIsLoading(true);
      try {
        let res: any = initialData;
        if (!res) {
          const parseNum = (val: any) => {
            if (val === null || val === undefined || val === '') return 0;
            const num = Number(val);
            return isNaN(num) ? val : num;
          };

          const payload: Record<string, any> = {
            module_type: comp.module_type || 'VIVA',
            user_id: parseNum(currentUserId),
            competition_id: parseNum(competitionId),
            course_id: parseNum(comp.course_id),
            subject_id: parseNum(comp.subject_id),
            chapter_id: comp.chapter_id ?? '',
            topic_id: comp.topic_id ? String(comp.topic_id) : '',
            ...(comp.viva_type ? { viva_type: comp.viva_type } : {})
          };

          console.log("Submitting Start Viva Competition payload:", payload);
          res = await CompetitionService.StartCompetition(payload);
          console.log("Start Viva Competition response:", res);
        } else {
          console.log("Using pre-fetched Start Viva Competition initialData:", res);
        }

        const sId =
          res?.session?.session_id ||
          res?.session_id ||
          res?.competition_session_id ||
          res?.data?.session_id ||
          res?.data?.session?.session_id ||
          competitionId;

        if (isMounted && sId) {
          setSessionId(sId);
        }

        if (isMounted && res) {
          const sData = res?.session || res?.data?.session || res?.data || res;
          setSessionData(sData);
        }

        let qList: QuestionItem[] = [];
        const rawObj = res?.data || res;

        if (rawObj && typeof rawObj === 'object') {
          if (Array.isArray(rawObj.questions)) {
            qList = rawObj.questions;
          } else if (Array.isArray(rawObj)) {
            qList = rawObj;
          } else if (rawObj.data && Array.isArray(rawObj.data)) {
            qList = rawObj.data;
          } else {
            const numericKeys = Object.keys(rawObj)
              .filter((k) => !isNaN(Number(k)))
              .sort((a, b) => Number(a) - Number(b));

            if (numericKeys.length > 0) {
              qList = numericKeys.map((k) => rawObj[k]);
            } else if (
              rawObj.question ||
              rawObj.question_transcrib ||
              rawObj.question_transcribe ||
              rawObj.question_text ||
              rawObj.question_no ||
              rawObj.session_id ||
              rawObj.viva_q_id ||
              (rawObj.data && (rawObj.data.question || rawObj.data.question_transcrib || rawObj.data.session_id))
            ) {
              qList = [rawObj.question || rawObj.question_transcrib ? rawObj : (rawObj.data || rawObj)];
            }
          }
        }

        if (isMounted) {
          if (!qList || qList.length === 0) {
            const msg =
              res?.response?.data?.detail ||
              res?.response?.data?.message ||
              res?.detail ||
              res?.message ||
              res?.error ||
              res?.data?.detail ||
              res?.data?.message ||
              "No viva questions found for this competition.";
            toast.error(msg);
            onExit();
            return;
          }
          setQuestions(qList);
        }
      } catch (err: any) {
        console.error("Error starting Viva competition:", err);
        const errorMsg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          (typeof err?.response?.data === 'string' ? err?.response?.data : null) ||
          err?.message ||
          "Failed to start Viva competition assessment.";
        toast.error(errorMsg);
        if (isMounted) {
          onExit();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initVivaCompetition();
    return () => {
      isMounted = false;
    };
  }, [competitionId, currentUserId, comp, initialData]);

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [competitionId, currentUserId, comp]);

  // 2. Auto-Submit on Time Expiry
  useEffect(() => {
    if (isTimeExpired && !isSubmitting && !isLoading) {
      console.warn("Viva Competition time expired! Auto-submitting...");
      handleFinalSubmitCompetition(true);
    }
  }, [isTimeExpired, isSubmitting, isLoading]);

  // 3. Anti-Cheat Security Listeners
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyCutPaste = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V'))
      ) {
        e.preventDefault();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const nextCount = prev + 1;
          setWarningMessage(`Tab switching is prohibited! Warning (${nextCount}/3)`);
          setShowWarningModal(true);

          if (nextCount >= 3) {
            handleFinalSubmitCompetition(true);
          }
          return nextCount;
        });
      }
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setTabSwitchWarnings((prev) => {
          const nextCount = prev + 1;
          setWarningMessage(`Exited fullscreen mode! Warning (${nextCount}/3).`);
          setShowWarningModal(true);

          if (nextCount >= 3) {
            handleFinalSubmitCompetition(true);
          }
          return nextCount;
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Voice Recording Functions
  const startRecording = async () => {
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
        const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(recordedBlob);
        setAudioBlob(recordedBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to record your viva response.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleConfirmVoiceSubmit = async () => {
    if (!audioBlob || isSubmittingAnswer) return;
    setIsSubmittingAnswer(true);

    const endTimeStr = getNowLocalISO();
    const endMs = Date.now();
    const startTimeStr = questionStartTimeRef.current || voiceStartTimeRef.current || getNowLocalISO();
    const startMs = questionStartMsRef.current || endMs;
    const totalSecs = Math.max(1, Math.round((endMs - startMs) / 1000));

    const qIdParam = currentQ.question_id ?? currentQ.id ?? '';
    const vivaQIdParam = currentQ.viva_q_id ?? currentQ.viva_question_id ?? '';

    try {
      const formData = new FormData();
      formData.append('module_type', comp.module_type || 'VIVA');
      formData.append('session_id', String(sessionId || competitionId));

      if (qIdParam !== '' && qIdParam !== null && qIdParam !== undefined) {
        formData.append('question_id', String(qIdParam));
      }
      if (vivaQIdParam !== '' && vivaQIdParam !== null && vivaQIdParam !== undefined) {
        formData.append('viva_q_id', String(vivaQIdParam));
      }

      const audioFile = audioBlob instanceof File
        ? audioBlob
        : new File([audioBlob], `answer_${vivaQIdParam || qIdParam || currentQuestionIndex}.wav`, { type: 'audio/wav' });
      formData.append('audio_file', audioFile);

      formData.append('start_time', startTimeStr);
      formData.append('end_time', endTimeStr);
      formData.append('total_time_taken', String(totalSecs));

      console.log("Submitting Viva voice answer FormData:", Array.from(formData.entries()));
      const res = await CompetitionService.SubmitCompetitionAnswer(formData);

      toast.success(res?.message || res?.detail || "Voice answer submitted successfully!");

      const savedAudioUrl = audioUrl;
      const trackingKey = vivaQIdParam || qIdParam || currentQuestionIndex;

      setUserAnswers((prev) => ({
        ...prev,
        [trackingKey]: {
          type: 'audio',
          recorded: true,
          submitted: true,
          duration: totalSecs,
          audioUrl: savedAudioUrl
        },
        [currentQuestionIndex]: {
          type: 'audio',
          recorded: true,
          submitted: true,
          duration: totalSecs,
          audioUrl: savedAudioUrl
        }
      }));

      setQuestions((prevQ) =>
        prevQ.map((q, idx) =>
          idx === currentQuestionIndex ? { ...q, is_submitted: true, submitted: true } : q
        )
      );

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowConfirmEndModal(true);
      }
    } catch (err: any) {
      console.error("Failed to submit Viva voice answer:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to upload audio response. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (isSubmittingAnswer) return;
    if (isRecording) {
      stopRecording();
    }
    stopSpeech();

    setIsSubmittingAnswer(true);

    const endTimeStr = getNowLocalISO();
    const endMs = Date.now();
    const startTimeStr = questionStartTimeRef.current || voiceStartTimeRef.current || getNowLocalISO();
    const startMs = questionStartMsRef.current || endMs;
    const totalSecs = Math.max(1, Math.round((endMs - startMs) / 1000));

    const qIdParam = currentQ.question_id ?? currentQ.id ?? '';
    const vivaQIdParam = currentQ.viva_q_id ?? currentQ.viva_question_id ?? '';

    try {
      const formData = new FormData();
      formData.append('module_type', comp.module_type || 'VIVA');
      formData.append('session_id', String(sessionId || competitionId));

      if (qIdParam !== '' && qIdParam !== null && qIdParam !== undefined) {
        formData.append('question_id', String(qIdParam));
      }
      if (vivaQIdParam !== '' && vivaQIdParam !== null && vivaQIdParam !== undefined) {
        formData.append('viva_q_id', String(vivaQIdParam));
      }

      formData.append('audio_file', '');
      formData.append('start_time', startTimeStr);
      formData.append('end_time', endTimeStr);
      formData.append('total_time_taken', String(totalSecs));

      console.log("Submitting Viva Skip Answer FormData:", Array.from(formData.entries()));
      const res = await CompetitionService.SubmitCompetitionAnswer(formData);

      toast.success(res?.message || "Question skipped");

      const trackingKey = vivaQIdParam || qIdParam || currentQuestionIndex;

      setUserAnswers((prev) => ({
        ...prev,
        [trackingKey]: { type: 'audio', skipped: true, submitted: true },
        [currentQuestionIndex]: { type: 'audio', skipped: true, submitted: true }
      }));

      setQuestions((prevQ) =>
        prevQ.map((q, idx) =>
          idx === currentQuestionIndex ? { ...q, is_submitted: true, submitted: true } : q
        )
      );

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowConfirmEndModal(true);
      }
    } catch (err: any) {
      console.error("Failed to submit Viva skip answer API call:", err);
      toast.error("Failed to skip question. Please try again.");
    } finally {
      setIsSubmittingAnswer(false);
      setAudioBlob(null);
      setAudioUrl(null);
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (isSubmittingAnswer) return;
    if (isRecording) stopRecording();
    stopSpeech();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (isSubmittingAnswer) return;
    if (isRecording) stopRecording();
    stopSpeech();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleFinalSubmitCompetition = async (isAuto: boolean = false) => {
    if (isSubmitting) return;
    if (isAuto || isTimeExpired) {
      setIsAutoSubmit(true);
    }
    setIsSubmitting(true);
    setShowConfirmEndModal(false);

    try {
      const payload = {
        module_type: comp.module_type || 'VIVA',
        session_id: Number(sessionId || competitionId) || 0
      };

      console.log("Submitting End Viva Competition payload:", payload);
      const res = await CompetitionService.EndCompetition(payload);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      onComplete(res || { competition_id: competitionId, score: 0 });
    } catch (err: any) {
      console.error("Error ending Viva competition:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err?.response?.data : null) ||
        err?.message ||
        "Failed to submit Viva competition assessment. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs / (1000 * 60)) % 60);
  const remainingSecs = Math.floor((remainingMs / 1000) % 60);
  const timeRemainingStr = `${String(remainingHours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

  const answerRecord = userAnswers[qTrackingKey] ?? userAnswers[currentQuestionIndex];
  const isQuestionSubmitted = Boolean(
    answerRecord?.submitted ||
    answerRecord?.recorded ||
    answerRecord?.skipped ||
    currentQ.is_submitted ||
    currentQ.submitted ||
    currentQ.user_answer ||
    currentQ.status === 'submitted'
  );

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-slate-50 text-slate-800 font-sans flex flex-col p-4 md:p-8 space-y-6">
      {isSubmitting && (
        <div className="fixed inset-0 z-[99999] backdrop-blur-md bg-black/60 flex flex-col items-center justify-center pointer-events-auto">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md w-[90%] mx-auto transform animate-in fade-in zoom-in duration-300 border border-slate-100 text-center space-y-4">
            <div className="relative mb-2">
              <div className="w-16 h-16 border-4 border-purple-100 border-solid rounded-full"></div>
              <div className="w-16 h-16 border-4 border-purple-600 border-solid rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {isAutoSubmit || isTimeExpired ? (
                  <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
                ) : (
                  <FileCheck className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isAutoSubmit || isTimeExpired ? "Time is Over!" : "Submitting Viva Competition"}
            </h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              {isAutoSubmit || isTimeExpired
                ? "Time is over, so the competition is auto submitting. Please wait..."
                : "Please wait while we process your responses securely..."}
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-md">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-purple-700 font-bold uppercase tracking-wider">
              {comp.viva_type ? `${comp.viva_type} Voice Examination` : 'Viva Voice Examination'}
            </div>
            <div className="text-base font-extrabold text-slate-800">
              {sessionData?.assessment_name || comp.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-black">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            <span>Warnings: {tabSwitchWarnings}/3</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm font-mono font-bold text-slate-700 border border-slate-200">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{timeRemainingStr}</span>
          </div>

          <button
            onClick={toggleMute}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isMuted
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-purple-600 text-white border-purple-600 shadow-md'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3 my-auto">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-semibold">Initializing Viva Voice Examination...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Question Palette / Header Bar */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-extrabold text-slate-500 uppercase tracking-widest px-1">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>Completed: {Object.keys(userAnswers).length} / {totalQuestions}</span>
            </div>

            {/* Questions Jump Palette */}
            {totalQuestions > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {questions.map((q, idx) => {
                  const qNumId = q.viva_q_id || q.viva_question_id || q.question_id || q.id || q.question_no || (idx + 1);
                  const qAns = userAnswers[qNumId] || userAnswers[idx];
                  const qSub = Boolean(qAns?.submitted || qAns?.recorded || qAns?.skipped || q.is_submitted || q.submitted);
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!isSubmittingAnswer) {
                          if (isRecording) stopRecording();
                          stopSpeech();
                          setCurrentQuestionIndex(idx);
                        }
                      }}
                      disabled={isSubmittingAnswer}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                        isCurrent
                          ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400'
                          : qSub
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {qSub && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      Q{idx + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wider">
                Oral Voice Question
              </span>
              {currentQ.time_per_question && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 border border-slate-200">
                  <Clock className="w-3 h-3 text-purple-600" /> {currentQ.time_per_question}s time limit
                </span>
              )}
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 leading-relaxed">
              <QuestionMathJax content={questionText} />
            </h2>
            {currentQ.question_details?.description_diagrams_url && (
              <div className="mt-4">
                <img
                  src={currentQ.question_details.description_diagrams_url}
                  alt="Question Diagram"
                  className="max-h-64 rounded-xl border border-slate-200 object-contain mx-auto"
                />
              </div>
            )}
          </div>

          {/* Answer Studio / Submitted Status */}
          {isQuestionSubmitted ? (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-emerald-900">
                  This question is already submitted
                </h3>
                <p className="text-xs text-emerald-700 font-medium">
                  {answerRecord?.skipped
                    ? 'You skipped this question.'
                    : 'Your audio response for this question has been recorded and saved successfully.'}
                </p>
              </div>

              {(answerRecord?.audioUrl || audioUrl || currentQ.audio_url || currentQ.user_answer_url) && !answerRecord?.skipped && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-600 mb-2">Submitted Recording Preview:</p>
                  <audio
                    controls
                    src={answerRecord?.audioUrl || audioUrl || currentQ.audio_url || currentQ.user_answer_url}
                    className="mx-auto max-w-md w-full rounded-xl"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Voice Studio Container (Not Attempted) */
            <div className="bg-white text-slate-800 border-2 border-purple-100 rounded-3xl p-8 text-center space-y-6 shadow-sm">
              <div className="space-y-1">
                <div className="text-xs uppercase font-extrabold tracking-widest text-purple-700">
                  Voice Answer Studio
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Speak clearly into your microphone to record your response.
                </p>
              </div>

              {/* Waveform & Timer */}
              <div className="py-4">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-1.5 h-12">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-purple-600 rounded-full animate-pulse"
                          style={{
                            height: `${Math.max(15, Math.floor(Math.random() * 45))}px`,
                            animationDuration: `${0.3 + (i % 5) * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-2xl font-mono font-black text-red-600 animate-pulse">
                      Recording: {recordingSeconds}s
                    </div>
                  </div>
                ) : audioUrl ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Answer Recorded ({recordingSeconds}s)
                    </div>
                    <div className="pt-2">
                      <audio controls src={audioUrl} className="mx-auto max-w-md w-full rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs font-medium">
                    Click the microphone button below to start recording
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording && !audioUrl && (
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <button
                      onClick={startRecording}
                      disabled={isSubmittingAnswer}
                      className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                      <Mic className="w-5 h-5" /> Start Recording Voice
                    </button>
                    <button
                      onClick={handleSkipQuestion}
                      disabled={isSubmittingAnswer}
                      className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingAnswer ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      ) : (
                        <SkipForward className="w-4 h-4 text-slate-600" />
                      )}
                      <span>Skip Question</span>
                    </button>
                  </div>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-3 cursor-pointer animate-pulse"
                  >
                    <Square className="w-5 h-5 fill-current" /> Stop Recording
                  </button>
                )}

                {audioUrl && !isRecording && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                      }}
                      disabled={isSubmittingAnswer}
                      className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-200 disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-600" /> Re-record Answer
                    </button>

                    <button
                      onClick={handleConfirmVoiceSubmit}
                      disabled={isSubmittingAnswer}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingAnswer ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Submitting Answer...</span>
                        </>
                      ) : (
                        <>
                          <span>Save & Submit Voice Answer</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || isSubmittingAnswer}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs border border-slate-300 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" /> Previous Question
              </button>

              {isQuestionSubmitted && currentQuestionIndex < totalQuestions - 1 && (
                <button
                  onClick={handleNextQuestion}
                  disabled={isSubmittingAnswer}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {!isQuestionSubmitted && (
                <button
                  onClick={handleSkipQuestion}
                  disabled={isSubmittingAnswer}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAnswer ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  ) : (
                    <SkipForward className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Skip Question</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowConfirmEndModal(true)}
              disabled={isSubmittingAnswer || isSubmitting}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" /> End Viva Examination
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmEndModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">End Viva Exam?</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to complete your Viva Examination session?
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmEndModal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              >
                Back to Exam
              </button>
              <button
                onClick={() => handleFinalSubmitCompetition(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, End Viva Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white border border-red-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-red-600">Proctoring Alert</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {warningMessage}
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Return to Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VivaExamRenderer;

