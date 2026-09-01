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
  onExit: () => void;
  onComplete: (resultData?: any) => void;
}

export const VivaExamRenderer: React.FC<VivaExamRendererProps> = ({
  comp,
  userId,
  onExit,
  onComplete
}) => {
  const nowMs = useNetworkNow(1000);

  const totalDurationMs = comp.total_time ? comp.total_time * 1000 : 3600000;
  const startTimeMs = comp.start_time ? new Date(comp.start_time).getTime() : nowMs;
  const endTimeMs = comp.end_time
    ? new Date(comp.end_time).getTime()
    : startTimeMs + totalDurationMs;

  const remainingMs = Math.max(0, endTimeMs - nowMs);
  const isTimeExpired = remainingMs <= 0;

  // Exam States
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, any>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
  const voiceStartTimeRef = useRef<string>(new Date().toISOString());

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
  const qId =
    currentQ.viva_q_id ||
    currentQ.viva_question_id ||
    currentQ.question_id ||
    currentQ.id ||
    currentQ.question_no ||
    (currentQuestionIndex + 1);

  useEffect(() => {
    setVisitedQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    voiceStartTimeRef.current = new Date().toISOString();
    if (timerRef.current) clearInterval(timerRef.current);
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
        const res = await CompetitionService.StartCompetition(payload);
        console.log("Start Viva Competition response:", res);

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

        if (isMounted && res?.session) {
          setSessionData(res.session);
        }

        let qList: QuestionItem[] = [];
        const rawObj = res?.data || res;

        if (rawObj) {
          if (Array.isArray(rawObj.questions)) {
            qList = rawObj.questions;
          } else if (Array.isArray(rawObj)) {
            qList = rawObj;
          } else if (typeof rawObj === 'object') {
            const numericKeys = Object.keys(rawObj)
              .filter((k) => !isNaN(Number(k)))
              .sort((a, b) => Number(a) - Number(b));

            if (numericKeys.length > 0) {
              qList = numericKeys.map((k) => rawObj[k]);
            } else if (rawObj.data && Array.isArray(rawObj.data)) {
              qList = rawObj.data;
            }
          }
        }

        if (isMounted) {
          if (!qList || qList.length === 0) {
            const msg = res?.message || res?.detail || "No viva questions found for this competition.";
            alert(msg);
            onExit();
            return;
          }
          setQuestions(qList);
        }
      } catch (err: any) {
        console.error("Error starting Viva competition:", err);
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to start Viva competition assessment.";
        alert(errorMsg);
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
  }, [competitionId, currentUserId, comp]);

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
    if (!audioBlob) return;
    const endTimeStr = new Date().toISOString();
    const currentQId = qId;

    try {
      const formData = new FormData();
      formData.append('module_type', comp.module_type || 'VIVA');
      formData.append('session_id', String(sessionId || competitionId));
      formData.append('question_id', String(currentQId));
      if (currentQ.viva_q_id) {
        formData.append('viva_q_id', String(currentQ.viva_q_id));
      }

      const audioFile = audioBlob instanceof File
        ? audioBlob
        : new File([audioBlob], `answer_${currentQId}.wav`, { type: 'audio/wav' });
      formData.append('audio_file', audioFile);

      formData.append('start_time', voiceStartTimeRef.current);
      formData.append('end_time', endTimeStr);
      formData.append('total_time_taken', String(recordingSeconds));

      console.log("Submitting Viva voice answer FormData:", Array.from(formData.entries()));
      await CompetitionService.SubmitCompetitionAnswer(formData);

      setUserAnswers((prev) => ({
        ...prev,
        [currentQId]: { type: 'audio', recorded: true, duration: recordingSeconds }
      }));

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowConfirmEndModal(true);
      }
    } catch (err) {
      console.error("Failed to submit Viva voice answer:", err);
      alert("Failed to upload audio response. Please try again.");
    }
  };

  const handleSkipQuestion = async () => {
    if (isRecording) {
      stopRecording();
    }
    stopSpeech();

    const currentQId = qId;

    try {
      const formData = new FormData();
      formData.append('module_type', comp.module_type || 'VIVA');
      formData.append('session_id', String(sessionId || competitionId));
      formData.append('question_id', String(currentQId));
      if (currentQ.viva_q_id) {
        formData.append('viva_q_id', String(currentQ.viva_q_id));
      }
      formData.append('audio_file', '');
      formData.append('start_time', '');
      formData.append('end_time', '');
      formData.append('total_time_taken', '');

      console.log("Submitting Viva Skip Answer FormData:", Array.from(formData.entries()));
      await CompetitionService.SubmitCompetitionAnswer(formData);

      setUserAnswers((prev) => ({
        ...prev,
        [currentQId]: { type: 'audio', skipped: true }
      }));
    } catch (err) {
      console.error("Failed to submit Viva skip answer API call:", err);
    } finally {
      setAudioBlob(null);
      setAudioUrl(null);
      setIsRecording(false);
      setRecordingSeconds(0);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        toast.success("Question skipped");
      } else {
        setShowConfirmEndModal(true);
      }
    }
  };

  const handleFinalSubmitCompetition = async (isAuto: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmEndModal(false);

    try {
      const payload = {
        module_type: comp.module_type || 'VIVA',
        session_id: Number(sessionId || competitionId) || 0
      };

      console.log("Submitting End Viva Competition payload:", payload);
      const res = await CompetitionService.EndCompetition(payload);
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

  const totalQuestions = questions.length;
  const remainingHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const remainingMins = Math.floor((remainingMs / 1000 / 60) % 60);
  const remainingSecs = Math.floor((remainingMs / 1000) % 60);
  const timeRemainingStr = `${String(remainingHours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-slate-50 text-slate-800 font-sans flex flex-col p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-md shrink-0">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-purple-700 font-bold uppercase tracking-wider truncate">
              {comp.viva_type ? `${comp.viva_type} Voice Examination` : 'Viva Voice Examination'}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
              {sessionData?.assessment_name || comp.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[11px] sm:text-xs font-black">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 animate-pulse shrink-0" />
            <span>Warnings: {tabSwitchWarnings}/3</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
            <span>{timeRemainingStr}</span>
          </div>

          <button
            onClick={toggleMute}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isMuted
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-purple-600 text-white border-purple-600 shadow-md'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />}
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
        <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
          {/* Question Counter */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest px-1">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>Completed: {Object.keys(userAnswers).length} / {totalQuestions}</span>
          </div>

          {/* Question Card */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                Oral Voice Question
              </span>
              {currentQ.time_per_question && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 border border-slate-200">
                  <Clock className="w-3 h-3 text-purple-600 shrink-0" /> {currentQ.time_per_question}s time limit
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed break-words">
              <QuestionMathJax content={questionText} />
            </h2>
            {currentQ.question_details?.description_diagrams_url && (
              <div className="mt-3 sm:mt-4">
                <img
                  src={currentQ.question_details.description_diagrams_url}
                  alt="Question Diagram"
                  className="max-h-48 sm:max-h-64 max-w-full rounded-xl border border-slate-200 object-contain mx-auto"
                />
              </div>
            )}
          </div>

          {/* Voice Studio Container */}
          <div className="bg-white text-slate-800 border-2 border-purple-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center space-y-4 sm:space-y-6 shadow-sm">
            <div className="space-y-1">
              <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-purple-700">
                Voice Answer Studio
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Speak clearly into your microphone to record your response.
              </p>
            </div>

            {/* Waveform & Timer */}
            <div className="py-2 sm:py-4">
              {isRecording ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-10 sm:h-12">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-purple-600 rounded-full animate-pulse"
                        style={{
                          height: `${Math.max(12, Math.floor(Math.random() * 40))}px`,
                          animationDuration: `${0.3 + (i % 5) * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-lg sm:text-2xl font-mono font-black text-red-600 animate-pulse">
                    Recording: {recordingSeconds}s
                  </div>
                </div>
              ) : audioUrl ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> Answer Recorded ({recordingSeconds}s)
                  </div>
                  <div className="pt-2">
                    <audio controls src={audioUrl} className="mx-auto max-w-md w-full h-9 sm:h-10 rounded-xl" />
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-[11px] sm:text-xs font-medium">
                  Click the microphone button below to start recording
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isRecording && !audioUrl && (
                <div className="flex items-center gap-2.5 sm:gap-3 flex-col sm:flex-row w-full sm:w-auto justify-center">
                  <button
                    onClick={startRecording}
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer w-full sm:w-auto"
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Start Recording Voice
                  </button>
                  <button
                    onClick={handleSkipQuestion}
                    className="px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <SkipForward className="w-4 h-4 text-slate-600 shrink-0" /> Skip Question
                  </button>
                </div>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer animate-pulse w-full sm:w-auto"
                >
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" /> Stop Recording
                </button>
              )}

              {audioUrl && !isRecording && (
                <div className="flex items-center gap-2.5 sm:gap-3 flex-col sm:flex-row w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200 w-full sm:w-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" /> Re-record Answer
                  </button>

                  <button
                    onClick={handleConfirmVoiceSubmit}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    Save & Submit Voice Answer <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={handleSkipQuestion}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <SkipForward className="w-4 h-4 text-slate-600 shrink-0" /> Skip Question
            </button>
            <button
              onClick={() => setShowConfirmEndModal(true)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 shrink-0" /> End Viva Examination
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

