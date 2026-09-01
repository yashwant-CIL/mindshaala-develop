import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { CompetitionItem } from '../Competitions';
import { CompetitionService } from '../../../services/CompetitionService';
import { useNetworkNow } from '../../../utils/networkTime';
import { QuestionMathJax } from '../../../shared/mathjaxconfig/QuestionMathJax';
import { speakText, stopSpeech } from '../../../utils/ttsHelper';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  AlertCircle,
  FileCheck,
  Mic,
  Square,
  RotateCcw,
  SkipForward,
  Send,
  BookOpen,
  HelpCircle,
  Tag
} from 'lucide-react';

export interface ConceptualExamRendererProps {
  comp: CompetitionItem;
  userId?: string | number;
  onExit: () => void;
  onComplete: (resultData?: any) => void;
}

export const ConceptualExamRenderer: React.FC<ConceptualExamRendererProps> = ({
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

  // Exam / Question States
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | number>('');
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState<boolean>(false);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const voiceStartTimeRef = useRef<string>(new Date().toISOString());

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('conceptual_tts_muted') === 'true';
  });

  // Security / Anti-Cheat States
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');

  const competitionId: string | number = comp.competition_id ?? comp.id ?? '';
  const currentUserId: string | number = userId ?? localStorage.getItem('user_id') ?? 'guest';

  // Helper to extract question object from response
  const extractQuestionObj = (res: any) => {
    if (!res) return null;
    if (res.question || res.question_transcrib || res.question_no) return res;
    if (res.data && (res.data.question || res.data.question_transcrib || res.data.question_no)) return res.data;
    if (Array.isArray(res.questions) && res.questions.length > 0) return res.questions[0];
    if (Array.isArray(res) && res.length > 0) return res[0];
    return res.data || res;
  };

  // Helper to extract session_id
  const extractSessionId = (res: any) => {
    return res?.session_id || res?.data?.session_id || res?.competition_session_id || res?.data?.competition_session_id || '';
  };

  const questionText =
    currentQuestion?.question_transcrib ||
    currentQuestion?.question ||
    currentQuestion?.title ||
    currentQuestion?.question_text ||
    '';

  const questionId =
    currentQuestion?.question_id ??
    currentQuestion?.id ??
    currentQuestion?.question_no ??
    (submittedCount + 1);

  // TTS Read Question
  useEffect(() => {
    if (!isMuted && questionText) {
      stopSpeech();
      speakText(questionText, { rate: 0.95 });
    }
    return () => {
      stopSpeech();
    };
  }, [currentQuestion, questionText, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('conceptual_tts_muted', String(nextMuted));
    if (nextMuted) {
      stopSpeech();
    } else {
      stopSpeech();
      if (questionText) {
        speakText(questionText, { rate: 0.95 });
      }
    }
  };

  // Cleanup audio recorder timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // 1. Initialize Conceptual TAM Competition & Start API call
  useEffect(() => {
    let isMounted = true;
    const initConceptualCompetition = async () => {
      setIsLoading(true);
      try {
        const parseNum = (val: any) => {
          if (val === null || val === undefined || val === '') return 0;
          const num = Number(val);
          return isNaN(num) ? val : num;
        };

        const payload: Record<string, any> = {
          module_type: comp.module_type || 'TAM',
          user_id: parseNum(currentUserId),
          competition_id: parseNum(competitionId),
          course_id: parseNum(comp.course_id),
          subject_id: parseNum(comp.subject_id),
          chapter_id: comp.chapter_id ?? '',
          viva_type: comp.viva_type ?? '',
          topic_id: comp.topic_id ? String(comp.topic_id) : ''
        };

        console.log("Submitting Start Conceptual TAM payload:", payload);
        const res = await CompetitionService.StartCompetition(payload);
        console.log("Start Conceptual TAM response:", res);

        const sId = extractSessionId(res) || competitionId;
        const firstQ = extractQuestionObj(res);

        if (isMounted) {
          if (sId) setSessionId(sId);
          if (firstQ && (firstQ.question || firstQ.question_transcrib || firstQ.question_no)) {
            setCurrentQuestion(firstQ);
            voiceStartTimeRef.current = new Date().toISOString();
          } else {
            alert(res?.message || "No initial question received for TAM assessment.");
            onExit();
          }
        }
      } catch (err: any) {
        console.error("Failed to start Conceptual assessment:", err);
        alert("Failed to start Conceptual assessment.");
        if (isMounted) onExit();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initConceptualCompetition();
    return () => { isMounted = false; };
  }, [competitionId, currentUserId, comp]);

  // 2. Auto-Submit on Time Expiry
  useEffect(() => {
    if (isTimeExpired && !isSubmitting && !isLoading) {
      handleFinalSubmitCompetition(true);
    }
  }, [isTimeExpired, isSubmitting, isLoading]);

  // 3. Anti-Cheat Security
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const nextCount = prev + 1;
          setWarningMessage(`Tab switching is prohibited! Warning (${nextCount}/3)`);
          setShowWarningModal(true);
          if (nextCount >= 3) handleFinalSubmitCompetition(true);
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Voice Recording Controls
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
      voiceStartTimeRef.current = new Date().toISOString();

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast.error("Microphone access required to record your response.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingSeconds(0);
    voiceStartTimeRef.current = new Date().toISOString();
  };

  // Submit Answer (Recorded Audio or Empty / Skip)
  const handleSubmitAnswer = async (isEmptyAnswer: boolean = false) => {
    if (isSubmittingAnswer) return;
    setIsSubmittingAnswer(true);

    const endTimeStr = new Date().toISOString();
    const targetSessionId = sessionId || currentQuestion?.session_id || competitionId;

    try {
      let payloadToSend: any;

      const formData = new FormData();
      formData.append('module_type', comp.module_type || 'TAM');
      formData.append('session_id', String(targetSessionId));
      formData.append('question_id', String(questionId));

      if (!isEmptyAnswer && audioBlob) {
        // Recorded audio response
        const audioFile = audioBlob instanceof File
          ? audioBlob
          : new File([audioBlob], `answer_${questionId}.wav`, { type: 'audio/wav' });
        formData.append('audio_file', audioFile);
        formData.append('start_time', voiceStartTimeRef.current);
        formData.append('end_time', endTimeStr);
        formData.append('total_time_taken', String(recordingSeconds));
      } else {
        // Empty Audio / Skip Question response
        formData.append('audio_file', '');
        formData.append('start_time', '');
        formData.append('end_time', '');
        formData.append('total_time_taken', '');
      }

      payloadToSend = formData;
      console.log("Submitting TAM Answer FormData Payload:", Array.from(formData.entries()));

      const res = await CompetitionService.SubmitCompetitionAnswer(payloadToSend);
      console.log("Submit TAM Answer Response:", res);

      const nextSessionId = extractSessionId(res);
      if (nextSessionId) setSessionId(nextSessionId);

      const nextQ = extractQuestionObj(res);

      // Check if next question exists in response
      if (
        nextQ &&
        (nextQ.question || nextQ.question_transcrib || nextQ.question_no) &&
        !res?.is_completed &&
        !res?.completed &&
        !res?.data?.is_completed
      ) {
        setCurrentQuestion(nextQ);
        setAudioBlob(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setRecordingSeconds(0);
        voiceStartTimeRef.current = new Date().toISOString();
        setSubmittedCount((prev) => prev + 1);

        if (!isEmptyAnswer && audioBlob) {
          toast.success("Answer submitted! Loading next question...");
        } else {
          toast.success("Question skipped! Loading next question...");
        }
      } else {
        // No more questions returned -> End assessment
        toast.success("All questions completed!");
        await handleFinalSubmitCompetition(false);
      }
    } catch (err: any) {
      console.error("Failed to submit TAM answer:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to submit answer. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // End Competition (Final Submit)
  const handleFinalSubmitCompetition = async (isAuto: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmEndModal(false);

    try {
      const targetSessionId = sessionId || currentQuestion?.session_id || 0;
      const payload = {
        module_type: comp.module_type || 'TAM',
        session_id: targetSessionId
      };

      console.log("Submitting End Conceptual TAM Competition payload:", payload);
      const res = await CompetitionService.EndCompetition(payload);
      onComplete(res || { competition_id: competitionId });
    } catch (err: any) {
      console.error("Error ending Conceptual competition:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err?.response?.data : null) ||
        err?.message ||
        "Failed to submit Conceptual competition assessment. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const remainingMins = Math.floor((remainingMs / 1000 / 60) % 60);
  const remainingSecs = Math.floor((remainingMs / 1000) % 60);
  const timeRemainingStr = `${String(remainingHours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-slate-50 text-slate-800 font-sans flex flex-col p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-blue-700 font-bold uppercase tracking-wider truncate">
              {currentQuestion?.assessment_name || `${comp.module_type || 'TAM'} Assessment`}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-800 truncate">{comp.title}</div>
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
            disabled={isSubmittingAnswer || isSubmitting}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isSubmittingAnswer || isSubmitting
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                : isMuted
                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-pointer'
                : 'bg-blue-600 text-white border-blue-600 shadow-md cursor-pointer'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3 my-auto">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-semibold">Initializing Conceptual Viva Assessment...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 my-auto relative">
          {/* Active Submitting Answer Overlay */}
          {isSubmittingAnswer && (
            <div className="absolute inset-0 z-50 backdrop-blur-[2px] rounded-3xl flex items-center justify-center p-4 sm:p-6 transition-all animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl text-center space-y-3 max-w-sm w-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900">Submitting Answer...</h4>
                  <p className="text-xs text-slate-500 font-medium">Please wait while we process your response and fetch the next question.</p>
                </div>
              </div>
            </div>
          )}

          {/* Question Header & Context Line */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest px-1">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              Question #{currentQuestion?.question_no ?? (submittedCount + 1)}
            </span>
            <span>Attempted: {submittedCount}</span>
          </div>

          {/* Question Display Card */}
          <div className={`bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 shadow-sm relative ${isSubmittingAnswer || isSubmitting ? 'pointer-events-none opacity-80' : ''}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Conceptual Audio Viva Question
              </span>
              {currentQuestion?.topic_context && (
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] sm:text-xs font-bold border border-indigo-200 flex items-center gap-1">
                  <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {currentQuestion.topic_context}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed break-words">
              <QuestionMathJax content={questionText} />
            </h2>
          </div>

          {/* Audio Recorder Section Below Question */}
          <div className={`bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-sm text-center ${isSubmittingAnswer || isSubmitting ? 'pointer-events-none opacity-80' : ''}`}>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider">
              Audio Response Recorder
            </h3>

            {/* State 1: Recording in Progress */}
            {isRecording ? (
              <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                <div className="inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-base sm:text-xl font-black animate-pulse">
                  <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-600 animate-ping" />
                  <span>Recording: {formatSecs(recordingSeconds)}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Speak clearly into your microphone to record your answer.</p>

                <div>
                  <button
                    onClick={stopRecording}
                    disabled={isSubmittingAnswer || isSubmitting}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> Stop Recording
                  </button>
                </div>
              </div>
            ) : audioUrl ? (
              /* State 2: Audio Recorded - Preview & Re-record */
              <div className="space-y-3 sm:space-y-4 py-2">
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Recorded Answer Preview</span>
                    <span className="text-blue-600">{formatSecs(recordingSeconds)}</span>
                  </div>
                  <audio src={audioUrl} controls className="w-full h-9 sm:h-10 rounded-lg" />
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={resetRecording}
                    disabled={isSubmittingAnswer || isSubmitting}
                    className={`px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 ${
                      isSubmittingAnswer || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Re-record Audio
                  </button>
                </div>
              </div>
            ) : (
              /* State 3: Ready to Record (Idle) */
              <div className="py-4 sm:py-6 space-y-3 sm:space-y-4">
                <button
                  onClick={startRecording}
                  disabled={isSubmittingAnswer || isSubmitting}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full text-white shadow-xl transition-all flex items-center justify-center mx-auto border-4 border-blue-100 ${
                    isSubmittingAnswer || isSubmitting
                      ? 'bg-slate-300 opacity-50 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-600/30 cursor-pointer'
                  }`}
                >
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">Tap to Record Your Answer</p>
                  <p className="text-[11px] sm:text-xs text-slate-400">Click the microphone button to start recording your response.</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
            {/* Skip / Empty Answer Button */}
            <button
              onClick={() => handleSubmitAnswer(true)}
              disabled={isSubmittingAnswer || isSubmitting || isRecording}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSubmittingAnswer || isSubmitting || isRecording
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer'
              }`}
            >
              <SkipForward className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Skip Question (No Audio)</span>
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3 flex-col sm:flex-row w-full sm:w-auto">
              {/* Submit Answer & Next Question Button */}
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={isSubmittingAnswer || isSubmitting || isRecording || !audioBlob}
                className={`px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isSubmittingAnswer || isSubmitting || isRecording || !audioBlob
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 cursor-pointer'
                }`}
              >
                {isSubmittingAnswer ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Send className="w-4 h-4 shrink-0" />
                )}
                <span>Submit Answer</span>
              </button>

              {/* End Assessment Button */}
              <button
                onClick={() => setShowConfirmEndModal(true)}
                disabled={isSubmittingAnswer || isSubmitting}
                className={`px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isSubmittingAnswer || isSubmitting
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                }`}
              >
                <FileCheck className="w-4 h-4 shrink-0" /> End Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to End Assessment */}
      {showConfirmEndModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">End Assessment?</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to finish and submit your Conceptual TAM assessment attempt?
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmEndModal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              >
                Continue Exam
              </button>
              <button
                onClick={() => handleFinalSubmitCompetition(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, End Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Warning Modal */}
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
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
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

export default ConceptualExamRenderer;
