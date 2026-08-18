import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Square, RefreshCw, Volume2, VolumeX, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { speakText, stopSpeech } from '../../../utils/ttsHelper';

export interface QuestionItem {
  id?: string | number;
  question_id?: string | number;
  question_no?: string | number;
  question_text?: string;
  question_transcrib?: string;
  question?: string;
  title?: string;
  options?: string[];
  correct_option?: string | number;
  audio_url?: string;
}

export interface VivaExamRendererProps {
  question: QuestionItem;
  questionIndex: number;
  totalQuestions: number;
  moduleType?: string;
  onSaveAnswer: (questionId: string | number, answerData: any) => void;
  onNext: () => void;
}

export const VivaExamRenderer: React.FC<VivaExamRendererProps> = ({
  question,
  questionIndex,
  totalQuestions,
  moduleType,
  onSaveAnswer,
  onNext
}) => {
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
  const startTimeRef = useRef<string>(new Date().toISOString());

  const questionText =
    question.question_transcrib ||
    question.question_text ||
    question.question ||
    question.title ||
    '';
  const qId = question.question_id || question.id || question.question_no || (questionIndex + 1);

  // Clear state when question changes and reset startTime
  useEffect(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    startTimeRef.current = new Date().toISOString();
    if (timerRef.current) clearInterval(timerRef.current);
  }, [questionIndex]);

  // Auto speech on question render if not muted
  useEffect(() => {
    if (!isMuted && questionText) {
      stopSpeech();
      speakText(questionText, { rate: 0.95 });
    }
    return () => {
      stopSpeech();
    };
  }, [questionIndex, questionText, isMuted]);

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

  // Start recording voice answer
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
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
      alert("Please allow microphone access to record your answer.");
    }
  };

  // Stop recording voice answer
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleConfirmVoiceSubmit = () => {
    if (!audioBlob) return;
    const endTimeStr = new Date().toISOString();
    onSaveAnswer(qId, {
      type: 'audio',
      audioBlob,
      audioUrl,
      timeRecorded: recordingSeconds,
      startTime: startTimeRef.current,
      endTime: endTimeStr,
      totalTimeTaken: recordingSeconds
    });
    onNext();
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans">
      {/* Header Badge */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-purple-700 font-bold uppercase tracking-wider">
              {moduleType ? `${moduleType} Voice Examination` : 'Viva Voice Examination'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute / Read Question Button */}
          <button
            onClick={toggleMute}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isMuted
                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                : 'bg-purple-600 text-white border-purple-600 shadow-md'
            }`}
            title={isMuted ? "Unmute TTS" : "Mute TTS"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Audio On</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wider">
          Oral Voice Question
        </span>
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 leading-relaxed">
          {questionText}
        </h2>
      </div>

      {/* Voice Recorder & Answer Container - Light Theme */}
      <div className="bg-white text-slate-800 border-2 border-purple-100 rounded-3xl p-8 text-center space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="text-xs uppercase font-extrabold tracking-widest text-purple-700">
            Voice Answer Studio
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Speak clearly into your microphone to record your viva examination response.
          </p>
        </div>

        {/* Dynamic Waveform Visualizer & Timer */}
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

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-3 cursor-pointer"
            >
              <Mic className="w-5 h-5" /> Start Recording Voice
            </button>
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
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" /> Re-record Answer
              </button>

              <button
                onClick={handleConfirmVoiceSubmit}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VivaExamRenderer;
