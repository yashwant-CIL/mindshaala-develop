import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Mic, 
  SkipForward, 
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BrainCircuit,
  Volume2,
  BookOpen,
  X,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Send,
  SkipBackIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { SpeakAlongService } from '../../services/SpeakAlongService';
import QuestionMathJax from '../../shared/mathjaxconfig/QuestionMathJax';
import { speakText } from '../../utils/ttsHelper';
import NotesViewer from '../../components/notes/NotesViewer';


interface SpeakAlongSessionProps {
  courseId: number | string;
  subjectId: number | string;
  chapterIds?: (number | string)[];
  chapterId?: number | string;
  subjectName: string;
  onExit: () => void;
  onFinish: () => void;
}

export default function SpeakAlongSession({ courseId, subjectId, chapterIds, chapterId, subjectName, onExit, onFinish }: SpeakAlongSessionProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIdx, setCurrentChunkIdx] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  
  const [userTranscript, setUserTranscript] = useState('');
  
  const synth = window.speechSynthesis;
  const recognitionRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isQuestionFinished, setIsQuestionFinished] = useState(false);
  const [isSpeakingFull, setIsSpeakingFull] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'chunks' | 'full'>('chunks');
  const [selectedBox, setSelectedBox] = useState<'question' | 'answer'>('question');
  
  const [fullAnswerTokens, setFullAnswerTokens] = useState<string[]>([]);
  const [currentTokenIdx, setCurrentTokenIdx] = useState<number>(-1);
  const tokenRangesRef = useRef<{ start: number; end: number }[]>([]);

  const aiSpeechStartTimeRef = useRef<number>(0);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  // View Notes API & Security States
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [notesData, setNotesData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');
  const [notesError, setNotesError] = useState<string | null>(null);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [isSpeakingNotes, setIsSpeakingNotes] = useState(false);
  const [isPrivacyBlurred, setIsPrivacyBlurred] = useState(false);
  const [selectedNoteImage, setSelectedNoteImage] = useState<string | null>(null);
  const [lastFetchedNotesVivaQId, setLastFetchedNotesVivaQId] = useState<string | number | null>(null);

  // Anti-Screenshot & DRM Security Handlers
  useEffect(() => {
    if (!showNotesPanel) {
      setIsPrivacyBlurred(false);
      return;
    }

    const handleBlur = () => {
      setIsPrivacyBlurred(true);
    };

    const handleFocus = () => {
      setIsPrivacyBlurred(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotesPanel(false);
        setIsPrivacyBlurred(false);
      }
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p') ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        setIsPrivacyBlurred(true);
        toast.error("Screenshots and printing are disabled for security reasons.", { id: 'screenshot-warn' });
        setTimeout(() => setIsPrivacyBlurred(false), 3000);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotesPanel]);

  const handleOpenNotes = async () => {
    if (showNotesPanel) {
      stopAllSpeech();
      setIsSpeakingNotes(false);
      setShowNotesPanel(false);
      return;
    }

    const q = questions?.[currentQuestionIdx];
    const vivaQId = q?.viva_q_id || q?.question_id || q?.id;
    if (!vivaQId) {
      console.warn("No viva_q_id found for current question", q);
      setNotesError("No notes available for this question");
      setShowNotesPanel(true);
      return;
    }

    // REQUIREMENT 1: If user is on the same question and notes were already fetched, DO NOT call API again!
    if (lastFetchedNotesVivaQId === vivaQId && (pdfUrl || notesText || notesError || notesData)) {
      setShowNotesPanel(true);
      return;
    }

    setShowNotesPanel(true);
    setLastFetchedNotesVivaQId(vivaQId);
    setFetchingNotes(true);
    setNotesData(null);
    setPdfUrl(null);
    setNotesText('');
    setNotesError(null);

    try {
      console.log("Fetching Speak Along notes for viva_q_id:", vivaQId);
      const data = await SpeakAlongService.GET_SPEAK_ALONG_NOTES(vivaQId);
      console.log("Speak Along Notes response data:", data);
      setNotesData(data);

      let candidateUrl: string | null = null;

      // 1. If binary Blob returned
      if (data instanceof Blob) {
        candidateUrl = URL.createObjectURL(data);
      }
      // 2. If raw string (URL, relative path, or Base64) returned
      else if (typeof data === 'string' && data.trim().length > 0) {
        let str = data.trim();
        if (str.startsWith('JVBERi0')) {
          candidateUrl = `data:application/pdf;base64,${str}`;
        } else if (str.startsWith('iVBORw0KGgo')) {
          candidateUrl = `data:image/png;base64,${str}`;
        } else if (str.startsWith('/9j/')) {
          candidateUrl = `data:image/jpeg;base64,${str}`;
        } else if (str.startsWith('UklGR')) {
          candidateUrl = `data:image/webp;base64,${str}`;
        } else {
          candidateUrl = str;
        }
      }
      // 3. If JSON object returned
      else if (typeof data === 'object' && data !== null) {
        if (
          data.status === false || 
          data.success === false || 
          data.code === 404 || 
          data.status === 404
        ) {
          const errMsg = data.message || data.error || data.detail || "No notes available for this question.";
          setNotesError(errMsg);
          return;
        }

        const extractUrl = (obj: any): string | null => {
          if (!obj || typeof obj !== 'object') return null;
          const fields = [
            'pdf_url', 'notes_pdf', 'pdf', 'file_url', 'url', 'file', 'path', 
            'notes_url', 'image_url', 'image', 'download_url', 'document_url'
          ];
          for (const f of fields) {
            if (obj[f] && typeof obj[f] === 'string' && obj[f].trim().length > 0) {
              let val = obj[f].trim();
              if (val.startsWith('JVBERi0')) return `data:application/pdf;base64,${val}`;
              if (val.startsWith('iVBORw0KGgo')) return `data:image/png;base64,${val}`;
              if (val.startsWith('/9j/')) return `data:image/jpeg;base64,${val}`;
              if (val.startsWith('UklGR')) return `data:image/webp;base64,${val}`;
              return val;
            }
          }
          return null;
        };

        candidateUrl = 
          extractUrl(data) ||
          extractUrl(data.data) ||
          (Array.isArray(data.data) && extractUrl(data.data[0])) ||
          (Array.isArray(data) && extractUrl(data[0])) ||
          null;

        const textCandidate = 
          data?.note_text || 
          data?.notes_text || 
          data?.text || 
          data?.description || 
          data?.content || 
          data?.data?.note_text || 
          '';

        setNotesText(textCandidate);
      }

      if (candidateUrl) {
        setPdfUrl(candidateUrl);
      } else if (!notesText && getNoteImages().length === 0) {
        setNotesError("No notes available for this question");
      }
    } catch (error: any) {
      console.error("Error fetching notes:", error);
      setNotesError("No notes available for this question");
    } finally {
      setFetchingNotes(false);
    }
  };

  const handleSpeakNotes = () => {
    if (isSpeakingNotes) {
      stopAllSpeech();
      setIsSpeakingNotes(false);
      return;
    }

    const currentQ = questions?.[currentQuestionIdx];
    const textToSpeak = notesText || currentQ?.question_details?.answer_description || currentQ?.answer || "Study notes content";
    if (!textToSpeak) return;

    stopAllSpeech();
    speakText(textToSpeak, {
      rate: speechRate,
      onstart: () => setIsSpeakingNotes(true),
      onend: () => setIsSpeakingNotes(false),
      onerror: () => setIsSpeakingNotes(false)
    });
  };

  // Helper to extract note images from current question object
  const getNoteImages = (): string[] => {
    const currentQ = questions?.[currentQuestionIdx];
    if (!currentQ) return [];
    const images: string[] = [];

    const rawCandidates = [
      currentQ?.note_image,
      currentQ?.note_image_url,
      currentQ?.solution_img_url,
      currentQ?.solution_image,
      currentQ?.diagram_url,
      currentQ?.image_url,
      currentQ?.question_details?.note_image,
      currentQ?.question_details?.note_image_url,
      currentQ?.question_details?.solution_img_url,
      currentQ?.question_details?.solution_image,
      currentQ?.question_details?.diagram_url,
      currentQ?.question_details?.image_url,
      currentQ?.question_details?.image,
    ];

    if (Array.isArray(currentQ?.note_images)) {
      rawCandidates.push(...currentQ.note_images);
    }
    if (Array.isArray(currentQ?.question_details?.note_images)) {
      rawCandidates.push(...currentQ.question_details.note_images);
    }

    rawCandidates.forEach((img) => {
      if (img && typeof img === 'string' && img.trim() !== '') {
        let fullUrl = img.trim();
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('data:')) {
          const baseUrl = import.meta.env.VITE_MINDSHAALA_API_URL || import.meta.env.VITE_API_URL || '';
          fullUrl = `${baseUrl}/api/v1/cil/images/${fullUrl.replace(/^\/+/, '')}`;
        }
        if (!images.includes(fullUrl)) {
          images.push(fullUrl);
        }
      }
    });

    return images;
  };

  // Record Answer & Feedback States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [skipWarningForSession, setSkipWarningForSession] = useState(false);
  const [isRecordingAnswerMode, setIsRecordingAnswerMode] = useState(false);
  const [recordingAnswerState, setRecordingAnswerState] = useState<'idle' | 'recording' | 'recorded' | 'submitted'>('idle');
  const [recordedText, setRecordedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    stage: 'poor' | 'good' | 'excellent';
    text: string;
    wordAnalysis: { word: string; matched: boolean }[];
  } | null>(null);

  const stopAllSpeech = () => {
    if (synth) synth.cancel();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsSpeakingQuestion(false);
    setIsSpeakingFull(false);
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
  };

  const evaluateAnswer = (userText: string, expectedText: string) => {
    const clean = (str: string) =>
      str
        .replace(/\\begin\{[\s\S]*?\\end\{.*?\}|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\(.*?\\\)|\\text\{.*?\}|\$.*?\$/g, ' ')
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’“”—\u0964\u0965]/g, ' ')
        .replace(/\b(um|uh|like|ah|er|hmm|you know)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const userClean = clean(userText);
    const expectedClean = clean(expectedText);

    const userWords = userClean.split(' ').filter(Boolean);
    const expectedWords = expectedClean.split(' ').filter(Boolean);

    if (expectedWords.length === 0) {
      return { stage: 'excellent' as const, text: "Excellent!", wordAnalysis: [] };
    }

    const isMatch = (w1: string, userList: string[]) => {
      return userList.some(w2 => w1 === w2 || (w1.length > 3 && (w2.includes(w1) || w1.includes(w2))));
    };

    let matchedCount = 0;
    const wordAnalysis = expectedWords.map(word => {
      const matched = isMatch(word, userWords);
      if (matched) matchedCount++;
      return { word, matched };
    });

    const ratio = matchedCount / expectedWords.length;

    let stage: 'poor' | 'good' | 'excellent' = 'poor';
    let text = "Needs Practice";

    if (ratio >= 0.75) {
      stage = 'excellent';
      text = "Excellent!";
    } else if (ratio >= 0.40) {
      stage = 'good';
      text = "Good Effort!";
    } else {
      stage = 'poor';
      text = "Needs Practice";
    }

    return {
      stage,
      text,
      wordAnalysis
    };
  };

  const handleTranscribeAudio = async (blobToSubmit?: Blob) => {
    const targetBlob = blobToSubmit || recordedAudioBlob;
    if (!targetBlob || targetBlob.size === 0) {
      toast.error("No recorded audio available to submit.");
      return;
    }
    setIsTranscribing(true);
    setFeedbackData(null);
    try {
      console.log("Audio Blob received for STT:", { size: targetBlob.size, type: targetBlob.type });
      const audioFile = new File([targetBlob], 'recording.mp3', { type: 'audio/mp3' });
      
      const currentQ = questions?.[currentQuestionIdx];
      const qId = currentQ?.question_id || currentQ?.id || 0;

      const formData = new FormData();
      formData.append('session_id', String(sessionId || 0));
      formData.append('question_id', String(qId));
      formData.append('file', audioFile, 'recording.mp3');

      console.log("Submitting Speak Along Audio (FormData entries):", Array.from(formData.entries()));
      const data = await SpeakAlongService.SUBMIT_SPEAK_ALONG_AUDIO(formData);
      console.log("Submit Audio Response data:", data);

      const transcribedText = 
        data?.user_transcription || 
        data?.data?.user_transcription || 
        data?.transcribe || 
        data?.data?.transcribe || 
        data?.text || 
        data?.data?.text || 
        data?.transcribed_text || 
        (typeof data === 'string' ? data : '');

      if (transcribedText) {
        setUserTranscript(transcribedText);
        setRecordedText(transcribedText);

        let expectedText = currentQ?.answer_transcribe || currentQ?.question_details?.answer_description || currentQ?.question_details?.answer_transcribe || currentQ?.answer || '';
        if (practiceMode === 'chunks' && chunks?.[currentChunkIdx]) {
           expectedText = chunks[currentChunkIdx];
        }

        const evalResult = evaluateAnswer(transcribedText, expectedText);
        setFeedbackData(evalResult);
        if (isRecordingAnswerMode) {
          setRecordingAnswerState('submitted');
        }
      } else {
        const errMsg = data?.message || data?.detail || data?.error || "Could not process audio answer. Please try again.";
        toast.error(errMsg);
        setRecordingAnswerState('recorded');
      }
    } catch (error: any) {
      console.error("Submit audio error:", error);
      const errMsg = error?.response?.data?.message || error?.response?.data?.detail || error?.response?.data?.error || error?.message || "Failed to submit audio answer.";
      toast.error(errMsg);
      setRecordingAnswerState('recorded');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start Session API call on mount (restored from cache on refresh)
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      try {
        const userIdRaw = localStorage.getItem('user_id') || Cookies.get('user_id') || '0';
        const userId = Number(userIdRaw) || 0;

        let parsedChapterIds: number[] = [];
        if (Array.isArray(chapterIds) && chapterIds.length > 0) {
          parsedChapterIds = chapterIds.map(id => Number(id));
        } else if (chapterId) {
          parsedChapterIds = [Number(chapterId)];
        }

        const currentCourseId = Number(courseId) || 0;
        const currentSubjectId = Number(subjectId) || 0;

        // Check if an active session is already cached in localStorage
        const cachedSessionRaw = localStorage.getItem('speakalong_active_session');
        if (cachedSessionRaw) {
          try {
            const cachedSession = JSON.parse(cachedSessionRaw);
            const cachedChapters = cachedSession?.chapter_ids || [];
            
            const isMatch = 
              cachedSession?.session_id &&
              Array.isArray(cachedSession?.questions) &&
              cachedSession.questions.length > 0 &&
              cachedSession.course_id === currentCourseId &&
              cachedSession.subject_id === currentSubjectId &&
              JSON.stringify(cachedChapters) === JSON.stringify(parsedChapterIds);

            if (isMatch) {
              console.log("Restoring active Speak Along session from cache (session_id:", cachedSession.session_id, ")");
              setSessionId(cachedSession.session_id);
              setQuestions(cachedSession.questions);
              if (typeof cachedSession.currentQuestionIdx === 'number' && cachedSession.currentQuestionIdx < cachedSession.questions.length) {
                setCurrentQuestionIdx(cachedSession.currentQuestionIdx);
              }
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing cached Speak Along session:", e);
          }
        }

        const payload = {
          user_id: userId,
          course_id: currentCourseId,
          subject_id: currentSubjectId,
          chapter_ids: parsedChapterIds
        };

        console.log("Starting Speak Along Session with payload:", payload);
        const data = await SpeakAlongService.START_SPEAK_ALONG_SESSION(payload);
        console.log("Start Speak Along Session Response:", data);

        const fetchedSessionId = data?.session_id || data?.data?.session_id || data?.id || data?.data?.id || null;
        const fetchedQuestions = data?.questions || data?.data?.questions || data?.viva_questions || (Array.isArray(data) ? data : []);

        if (fetchedSessionId) {
          setSessionId(fetchedSessionId);
        }

        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
          const sessionToCache = {
            session_id: fetchedSessionId,
            questions: fetchedQuestions,
            course_id: currentCourseId,
            subject_id: currentSubjectId,
            chapter_ids: parsedChapterIds,
            currentQuestionIdx: 0
          };
          localStorage.setItem('speakalong_active_session', JSON.stringify(sessionToCache));
        } else {
          const errMsg = data?.message || data?.detail || data?.error || "No questions found for this session.";
          toast.error(errMsg);
          onExit();
        }
      } catch (error: any) {
        console.error("Error starting session:", error);
        const errMsg = error?.response?.data?.message || error?.response?.data?.detail || error?.response?.data?.error || error?.message || "Failed to start Speak Along session.";
        toast.error(errMsg);
        onExit();
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [courseId, subjectId, JSON.stringify(chapterIds)]);

  // Sync currentQuestionIdx to active session cache
  useEffect(() => {
    if (!sessionId) return;
    const cachedRaw = localStorage.getItem('speakalong_active_session');
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        if (cached.session_id === sessionId) {
          cached.currentQuestionIdx = currentQuestionIdx;
          localStorage.setItem('speakalong_active_session', JSON.stringify(cached));
        }
      } catch (e) {}
    }
  }, [currentQuestionIdx, sessionId]);

  // Fullscreen Mode handler
  useEffect(() => {
    const enterFullscreen = async () => {
      const elem = document.documentElement;
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      } catch (err) {
        console.warn("Could not enter fullscreen mode:", err);
      }
    };

    enterFullscreen();

    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
    const floatingActions = document.getElementById('floating-actions-container');
    
    if (sidebar) sidebar.style.display = 'none';
    if (floatingActions) floatingActions.style.display = 'none';

    return () => {
      const exitFullscreen = async () => {
        try {
          if (document.fullscreenElement) {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              await (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
              await (document as any).msExitFullscreen();
            }
          }
        } catch (err) {
          console.warn("Could not exit fullscreen mode:", err);
        }
      };
      exitFullscreen();

      if (sidebar) sidebar.style.display = '';
      if (floatingActions) floatingActions.style.display = '';
    };
  }, []);

  // Initialize Speech Recognition & Media Recorder
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(audioUrl);
          setRecordedAudioBlob(audioBlob);
          setRecordingAnswerState('recorded');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
    }).catch(err => {
      console.error("Microphone access denied", err);
      toast.error("Microphone access is required for audio recording.");
    });
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setUserTranscript(finalTranscript);
        } else {
          setUserTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (!speechTimerRef.current) {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (speechTimerRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart speech recognition:", e);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast.error("Speech recognition is not supported in this browser.");
    }

    return () => {
      stopAllSpeech();
      if (recognitionRef.current) {
        try {
            recognitionRef.current.stop();
        } catch(e) {}
      }
    };
  }, []);

  // Process current question into chunks
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIdx < questions.length) {
      const q = questions[currentQuestionIdx];
      const details = q?.question_details;
      
      const displayText = q?.answer_transcribe || details?.answer_description || details?.answer_transcribe || q?.answer || "";
      const speechText = q?.answer_transcribe || displayText;
      
      const getTokens = (text: string) => {
        const latexRegex = /(\\begin\{[\s\S]*?\\end\{.*?\}|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\(.*?\\\)|\\text\{.*?\}|\$.*?\$)/g;
        const tokens: string[] = [];
        let lastIdx = 0;
        let match;
        while ((match = latexRegex.exec(text)) !== null) {
          const pre = text.substring(lastIdx, match.index);
          if (pre.trim()) tokens.push(...pre.trim().split(/\s+/));
          tokens.push(match[0]);
          lastIdx = latexRegex.lastIndex;
        }
        const post = text.substring(lastIdx);
        if (post.trim()) tokens.push(...post.trim().split(/\s+/));
        return tokens;
      };

      const displayTokens = getTokens(displayText);
      const speechWords = speechText.split(/\s+/);
      
      const newDisplayChunks: string[] = [];
      const newSpeechChunks: string[] = [];
      
      let currentDisplay: string[] = [];
      let currentSpeech: string[] = [];
      
      for (let i = 0; i < displayTokens.length; i++) {
        currentDisplay.push(displayTokens[i]);
        if (speechWords[i]) currentSpeech.push(speechWords[i]);
        
        const isLatex = displayTokens[i].startsWith('\\');
        const isSentenceEnd = displayTokens[i].match(/[.,!?;\u0964\u0965\u06D4\u061F\u3002\uFF01\uFF1F|\uFF0C\u3001\u060C\uFF1B]["')\]}”’]*$/);
        if (isLatex || isSentenceEnd || currentDisplay.length >= 100 || i === displayTokens.length - 1) {
           newDisplayChunks.push(currentDisplay.join(' '));
           newSpeechChunks.push(currentSpeech.join(' '));
           currentDisplay = [];
           currentSpeech = [];
        }
      }
      
      if (currentDisplay.length > 0) {
        newDisplayChunks.push(currentDisplay.join(' '));
        newSpeechChunks.push(currentSpeech.join(' '));
      }

      setChunks(newDisplayChunks);
      setSpeechChunks(newSpeechChunks);
      
      const tokensList = getTokens(speechText);
      setFullAnswerTokens(tokensList);
      
      let sum = 0;
      tokenRangesRef.current = tokensList.map((token) => {
        const start = sum;
        const end = sum + token.length;
        sum = end + 1;
        return { start, end };
      });
      setCurrentTokenIdx(-1);

      setCurrentChunkIdx(0);
      setUserTranscript('');
      setIsQuestionFinished(false);
      setIsSpeakingFull(false);
      setRecordedAudioUrl(null);
      audioChunksRef.current = [];
      setIsRecordingAnswerMode(false);
      setRecordingAnswerState('idle');
      setRecordedText('');
      setFeedbackData(null);
      setShowNotesPanel(false);
      setIsSpeakingNotes(false);
      setSelectedBox('question');
      
      speakQuestion(false);
    }
  }, [currentQuestionIdx, questions]);

  const [speechChunks, setSpeechChunks] = useState<string[]>([]);

  useEffect(() => {
    if (autoPlayNext && chunks.length > 0) {
      speakCurrentChunk();
      setAutoPlayNext(false);
    }
  }, [currentChunkIdx, chunks, autoPlayNext]);

  const getQuestionText = (q: any) => {
    if (!q) return "";
    const rawText = 
      q?.question_transcribe ||
      q?.question_details?.question_transcribe ||
      q?.question_details?.question_description ||
      q?.question_details?.question_latex ||
      q?.question_latex ||
      q?.question_text ||
      q?.question ||
      "";
    if (!rawText) return "";
    return rawText
      .replace(/\\\[|\\\]|\$\$|\$/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .trim();
  };

  const speakQuestion = (autoPlayAnswer: boolean = false) => {
    if (questions.length === 0 || !synth) return;
    const q = questions[currentQuestionIdx];
    
    const text = getQuestionText(q);
    if (!text) {
      console.warn("No transcript text found for question", q);
      toast.error("No audio transcript available for this question.");
      return;
    }

    stopAllSpeech();
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e){}
    }

    setIsSpeakingFull(false);

    speakText(text, {
      rate: speechRate,
      onstart: () => {
        setIsSpeakingQuestion(true);
        setIsPlaying(true);
      },
      onend: () => {
        setIsSpeakingQuestion(false);
        setIsPlaying(false);
        if (autoPlayAnswer) {
          setAutoPlayNext(true);
        }
      },
      onerror: (err) => {
        console.error("Speech question error", err);
        setIsSpeakingQuestion(false);
        setIsPlaying(false);
        if (autoPlayAnswer) {
          setAutoPlayNext(true);
        }
      }
    });
  };

  const speakFullAnswer = () => {
    if (isPlaying && isSpeakingFull) {
      stopAllSpeech();
      return;
    }
    
    const q = questions[currentQuestionIdx];
    const text = q?.answer_transcribe || q?.question_details?.answer_description || q?.question_details?.answer_transcribe || q?.answer || "";
    if (!text || !synth) return;
    
    stopAllSpeech();
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    
    speakText(text, {
      rate: speechRate,
      onstart: () => {
        setIsSpeakingFull(true);
        setIsPlaying(true);
        setCurrentTokenIdx(-1);
        aiSpeechStartTimeRef.current = Date.now();
      },
      onend: () => {
        setIsSpeakingFull(false);
        setIsPlaying(false);
        setCurrentTokenIdx(-1);
        setIsQuestionFinished(true);
      },
      onerror: () => {
        setIsSpeakingFull(false);
        setIsPlaying(false);
        setCurrentTokenIdx(-1);
        setIsQuestionFinished(true);
      },
      onboundary: (event: any) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const ranges = tokenRangesRef.current;
          const tokenIdx = ranges.findIndex(r => charIndex >= r.start && charIndex < r.end);
          if (tokenIdx !== -1) {
            setCurrentTokenIdx(tokenIdx);
          }
        }
      }
    });
  };

  const speakCurrentChunk = () => {
    const textToSpeak = speechChunks[currentChunkIdx] || chunks[currentChunkIdx];
    if (!textToSpeak || !synth) return;
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
       mediaRecorderRef.current.pause();
    }
    
    speakText(textToSpeak, {
      rate: speechRate,
      onstart: () => {
        setIsPlaying(true);
        aiSpeechStartTimeRef.current = Date.now();
        if (recognitionRef.current && isListening) {
           try { recognitionRef.current.stop(); } catch(e){}
        }
      },
      onend: () => {
        setIsPlaying(false);
        if (currentChunkIdx >= chunks.length - 1) {
          setIsQuestionFinished(true);
        }
      },
      onerror: (e) => {
         console.error("TTS Error", e);
         setIsPlaying(false);
         if (currentChunkIdx >= chunks.length - 1) {
           setIsQuestionFinished(true);
         }
      }
    });
  };

  const speakChunkAtIndex = (idx: number) => {
    stopAllSpeech();
    setCurrentChunkIdx(idx);

    const textToSpeak = speechChunks[idx] || chunks[idx];
    if (!textToSpeak || !synth) return;

    speakText(textToSpeak, {
      rate: speechRate,
      onstart: () => {
        setIsPlaying(true);
        aiSpeechStartTimeRef.current = Date.now();
        if (recognitionRef.current && isListening) {
          try { recognitionRef.current.stop(); } catch(e){}
        }
      },
      onend: () => {
        setIsPlaying(false);
        if (idx >= chunks.length - 1) {
          setIsQuestionFinished(true);
        }
      },
      onerror: (e: any) => {
        if (e?.error !== 'interrupted' && e?.error !== 'canceled') {
          console.warn("TTS Error", e);
        }
        setIsPlaying(false);
        if (idx >= chunks.length - 1) {
          setIsQuestionFinished(true);
        }
      }
    });
  };

  const startListening = (duration: number = 3000) => {
    stopAllSpeech();
    setIsListening(true);
    if (recognitionRef.current) {
      setUserTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
    
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start(200); 
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
    }

    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    
    const recordingDuration = Math.max(duration , 2000);

    speechTimerRef.current = setTimeout(() => {
       speechTimerRef.current = null;
       if (recognitionRef.current && isListening) {
         try { recognitionRef.current.stop(); } catch(e){}
       }
       if (practiceMode === 'full' || currentChunkIdx === chunks.length - 1) {
         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsQuestionFinished(true);
         }
       }
    }, recordingDuration);
  };

  const handleNextChunk = () => {
    stopAllSpeech();
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    
    if (currentChunkIdx < chunks.length - 1 && practiceMode === 'chunks') {
      setCurrentChunkIdx(prev => prev + 1);
      setUserTranscript('');
      setAutoPlayNext(true);
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
         mediaRecorderRef.current.stop();
      }
      setIsQuestionFinished(true);
    }
  };

  const handleSelectQuestionBox = () => {
    stopAllSpeech();
    setSelectedBox('question');
  };

  const handleSelectAnswerBox = () => {
    stopAllSpeech();
    setSelectedBox('answer');
    if (practiceMode === 'full') {
      speakFullAnswer();
    } else {
      speakCurrentChunk();
    }
  };

  const handleHeaderReadClick = () => {
    if (selectedBox === 'question') {
      if (isPlaying && isSpeakingQuestion) {
        stopAllSpeech();
      } else {
        speakQuestion(false);
      }
    } else {
      if (isPlaying && (isSpeakingFull || (!isSpeakingQuestion && practiceMode === 'chunks'))) {
        stopAllSpeech();
      } else {
        if (practiceMode === 'chunks') {
          handleNextChunk();
        } else {
          speakFullAnswer();
        }
      }
    }
  };

  const getHeaderReadLabel = () => {
    if (selectedBox === 'question') {
      return isPlaying && isSpeakingQuestion ? 'Stop' : 'Read';
    } else {
      if (isPlaying && (isSpeakingFull || (!isSpeakingQuestion && practiceMode === 'chunks'))) {
        return 'Stop';
      }
      if (practiceMode === 'chunks') {
        return 'Next Chunk';
      }
      return 'Read';
    }
  };

  const handleEndSession = async () => {
    stopAllSpeech();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    if (sessionId) {
      const toastId = toast.loading("Ending session...");
      try {
        console.log("Ending Speak Along session:", sessionId);
        const res = await SpeakAlongService.END_SPEAK_ALONG_SESSION(Number(sessionId));
        console.log("End session API result:", res);
        
        toast.dismiss(toastId);
        toast.success("Session ended successfully!");
        localStorage.removeItem('speakalong_active_session');
        onExit();
      } catch (error: any) {
        console.error("Error ending session on backend:", error);
        toast.dismiss(toastId);
        const errMsg = error?.response?.data?.message || error?.response?.data?.detail || error?.response?.data?.error || error?.message || "Failed to end session. Please try again.";
        toast.error(errMsg);
        return;
      }
    } else {
      localStorage.removeItem('speakalong_active_session');
      onExit();
    }
  };

  const proceedToNextQuestion = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      await handleEndSession();
    }
  };

  const proceedToPreviousQuestion = () => {
    if (currentQuestionIdx > 0) {
      stopAllSpeech();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch(e){}
      }
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handlePlayPause = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      try {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          (elem as any).webkitRequestFullscreen();
        }
      } catch (err) {
        console.warn("Could not request fullscreen on user interaction:", err);
      }
    }

    if (isPlaying) {
      stopAllSpeech();
    } else {
      if (isQuestionFinished) return;
      if (practiceMode === 'full') {
        speakFullAnswer();
      } else {
        if (currentChunkIdx === 0 && !isSpeakingQuestion) {
          speakQuestion();
        } else {
          speakCurrentChunk();
        }
      }
    }
  };

  const handleDiscard = () => {
    stopAllSpeech();
    setIsQuestionFinished(false);
    setIsSpeakingFull(false);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];
    setCurrentChunkIdx(0);
    setUserTranscript('');
    setIsRecordingAnswerMode(false);
    setRecordingAnswerState('idle');
    setRecordedText('');
    setFeedbackData(null);
    speakQuestion();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold">Starting your SpeakAlong Session...</p>
      </div>
    );
  }

  const question = questions?.[currentQuestionIdx];
  const question_text = question?.question_transcribe || question?.question_details?.question_transcribe || question?.question_details?.question_description || question?.question_details?.question_latex || question?.question_latex || question?.question_text || question?.question || "";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base md:text-xl tracking-tight">SpeakAlong <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Viva</span></h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">{subjectName}</p>
            </div>
          </div>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* <button
            onClick={() => setShowNotesPanel(true)}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-500 shrink-0 active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Notes</span>
          </button> */}

          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer border border-red-500 shrink-0"
          >
            <span>End Session</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 ${showNotesPanel ? 'max-w-full' : 'max-w-5xl'} w-full mx-auto p-3 md:p-8 flex flex-col pb-24 lg:pb-8 transition-all duration-300`}>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
            
            {/* Left Column: Question & Target */}
            <div className={`${showNotesPanel ? 'lg:col-span-6 order-2 lg:order-1' : 'lg:col-span-12'} flex flex-col gap-3 md:gap-4 transition-all duration-300`}>
                {/* Question Counter & Controls Header: Buttons between Question count & AI Speed bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {currentQuestionIdx > 0 && (
                      <button
                        onClick={proceedToPreviousQuestion}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                      >
                        {/* <ArrowLeft className="w-4 h-4" /> */}
                        <SkipBackIcon className="w-4 h-4" />
                        {/* <span>Previous</span> */}
                      </button>
                    )}
                    <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider shrink-0 whitespace-nowrap">
                      Question {currentQuestionIdx + 1} of {questions.length}
                    </p>

                    {/* Next Question Button right after Question count */}
                    <button
                      onClick={proceedToNextQuestion}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                    >
                      {/* <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'End Session'}</span> */}
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* View Notes and Read buttons between Question count & AI speed bar */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleOpenNotes}
                        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap ${
                          showNotesPanel
                            ? 'bg-purple-600 text-white border border-purple-600 hover:bg-purple-700'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>{showNotesPanel ? 'Hide' : 'Notes'}</span>
                      </button>

                      <button
                        onClick={handleHeaderReadClick}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap ${
                          isPlaying
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{getHeaderReadLabel()}</span>
                      </button>
                      {/* Record Answer Button between Practice Phrase & Chunks/Full Answer option */}
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 stopAllSpeech();
                                 if (skipWarningForSession) {
                                    setIsRecordingAnswerMode(true);
                                    setRecordingAnswerState('idle');
                                    setRecordedText('');
                                    setFeedbackData(null);
                                 } else {
                                    setShowWarningModal(true);
                                 }
                              }}
                              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                           >
                              <Mic className="w-4 h-4" />
                              <span>Record Answer</span>
                           </button>
                    </div>
                  </div>

                  {/* AI Speed Control */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/90 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
                    <div className="flex items-center gap-1 shrink-0">
                      <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter shrink-0">AI Speed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1" 
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-14 sm:w-20 md:w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-xs font-black text-indigo-600 w-6 sm:w-7 text-right shrink-0">{speechRate.toFixed(1)}x</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-1.5 md:h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                        style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
                    ></div>
                </div>
                
                {/* Question Card - Selectable Box */}
                <div 
                  onClick={handleSelectQuestionBox}
                  className={`rounded-2xl md:rounded-[2rem] p-4 md:p-8 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                    selectedBox === 'question'
                      ? 'bg-white border-2 border-indigo-600 ring-4 ring-indigo-500/15 shadow-[0_20px_50px_rgba(79,70,229,0.1)]'
                      : 'bg-white border-2 border-slate-100 hover:border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.03)]'
                  }`}
                >
                   <div className="flex items-center justify-between gap-3 mb-3 md:mb-5">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
                        <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">Active Question</span>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
                          selectedBox === 'question' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {selectedBox === 'question' ? '✓ Selected Box' : 'Click to Select'}
                        </span>
                        {isSpeakingQuestion && (
                           <span className="flex items-center gap-1.5 text-indigo-500 animate-pulse font-bold text-[9px] md:text-[10px] uppercase whitespace-nowrap">
                              <div className="w-1 h-1 rounded-full bg-indigo-500"></div> AI Speaking
                           </span>
                        )}
                        {isPlaying && isSpeakingFull && (
                           <span className="flex items-center gap-1.5 text-indigo-500 animate-pulse font-bold text-[9px] md:text-[10px] uppercase whitespace-nowrap">
                              <div className="w-1 h-1 rounded-full bg-indigo-500"></div> AI Reading Full
                           </span>
                        )}
                      </div>
                   </div>
                   <div className={`text-base sm:text-2xl md:text-3xl font-bold transition-all duration-500 ${isSpeakingQuestion ? 'text-indigo-600 scale-[1.01]' : 'text-slate-800'} leading-[1.4]`}>
                      <QuestionMathJax content={question_text} />
                   </div>
                </div>

                {/* Target Answer / Chunks Card - Selectable Box */}
                <div 
                  onClick={handleSelectAnswerBox}
                  className={`rounded-2xl md:rounded-[2rem] p-4 md:p-8 transition-all duration-300 flex flex-col cursor-pointer ${
                    selectedBox === 'answer'
                      ? 'bg-white border-2 border-indigo-600 ring-4 ring-indigo-500/15 shadow-[0_20px_50px_rgba(79,70,229,0.1)]'
                      : 'bg-white border-2 border-slate-100 hover:border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.03)]'
                  }`}
                >
                     <div className="flex flex-col gap-3 mb-4 md:mb-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                           <div className="flex items-center gap-2 shrink-0">
                             <h3 className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em]">Practice Phrase</h3>
                             <span className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
                               selectedBox === 'answer' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                             }`}>
                               {selectedBox === 'answer' ? '✓ Selected Box' : 'Click to Select'}
                             </span>
                           </div>

                           {/* Record Answer Button between Practice Phrase & Chunks/Full Answer option */}
                           {/* <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 stopAllSpeech();
                                 if (skipWarningForSession) {
                                    setIsRecordingAnswerMode(true);
                                    setRecordingAnswerState('idle');
                                    setRecordedText('');
                                    setFeedbackData(null);
                                 } else {
                                    setShowWarningModal(true);
                                 }
                              }}
                              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                           >
                              <Mic className="w-4 h-4" />
                              <span>Record Answer</span>
                           </button> */}

                           {/* Segmented Control Mode Selector & Chunk Counter */}
                           <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50 shrink-0">
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     stopAllSpeech();
                                     setPracticeMode('chunks');
                                   }}
                                   disabled={isSpeakingQuestion}
                                   className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                     practiceMode === 'chunks'
                                       ? 'bg-indigo-600 text-white shadow-sm'
                                       : 'text-slate-500 hover:text-slate-700'
                                   }`}
                                 >
                                    Chunks
                                 </button>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     stopAllSpeech();
                                     setPracticeMode('full');
                                   }}
                                   disabled={isSpeakingQuestion}
                                   className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                     practiceMode === 'full'
                                       ? 'bg-indigo-600 text-white shadow-sm'
                                       : 'text-slate-500 hover:text-slate-700'
                                   }`}
                                 >
                                    Full Answer
                                 </button>
                              </div>

                              {practiceMode === 'chunks' && (
                                 <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider shrink-0">
                                    CHUNK {currentChunkIdx + 1} OF {chunks.length}
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Responsive Practice Action Buttons Bar */}
                        {/* <div className="flex items-center gap-2 flex-wrap pt-1 w-full" onClick={(e) => e.stopPropagation()}> */}
                           {/* <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 if (isPlaying && (isSpeakingFull || (!isSpeakingQuestion && practiceMode === 'chunks'))) {
                                    stopAllSpeech();
                                 } else {
                                    if (practiceMode === 'full') {
                                       speakFullAnswer();
                                    } else {
                                       speakCurrentChunk();
                                    }
                                 }
                              }}
                              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap ${
                                 isPlaying && (isSpeakingFull || (!isSpeakingQuestion && practiceMode === 'chunks'))
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                              }`}
                           >
                              <Volume2 className="w-4 h-4" />
                              <span>
                                 {isPlaying && (isSpeakingFull || (!isSpeakingQuestion && practiceMode === 'chunks'))
                                    ? 'Stop Speech'
                                    : practiceMode === 'full'
                                       ? 'Read Full Answer'
                                       : 'Read Chunk'}
                              </span>
                           </button> */}

                           {/* Next Chunk Navigation Button */}
                           {/* {practiceMode === 'chunks' && !isQuestionFinished && currentChunkIdx < chunks.length - 1 && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextChunk();
                                 }}
                                 className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-green-600 text-white hover:bg-slate-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                              >
                                 <span>Next Chunk</span>
                                 <SkipForward className="w-4 h-4" />
                              </button>
                           )} */}

                           {/* Retry Button */}
                           {/* <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleDiscard();
                              }}
                              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                           >
                              Retry
                           </button> */}
                        {/* </div> */}
                     </div>

                      {isRecordingAnswerMode ? (
                        <div className="flex flex-col gap-6 py-2">
                           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Mic className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <h4 className="text-base font-bold text-slate-900">Record Your Answer from Memory</h4>
                                    <p className="text-xs text-slate-400 font-medium">Answer phrase is hidden. Speak your answer clearly.</p>
                                 </div>
                              </div>
                              <button
                                 onClick={() => {
                                    stopAllSpeech();
                                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                                       try { mediaRecorderRef.current.stop(); } catch(e){}
                                    }
                                    setIsRecordingAnswerMode(false);
                                    setRecordingAnswerState('idle');
                                 }}
                                 className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                 Exit Recording
                              </button>
                           </div>

                           {isTranscribing && (
                              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                                 <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                 <p className="text-sm font-semibold text-slate-700">Submitting audio & evaluating answer...</p>
                                 <p className="text-xs text-slate-400">Please wait while your recording is transcribed and processed.</p>
                              </div>
                           )}

                           {!isTranscribing && recordingAnswerState === 'idle' && (
                              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                                 <p className="text-sm font-medium text-slate-600 max-w-md">
                                    Click the button below to start recording your answer.
                                 </p>
                                 <button
                                    onClick={() => {
                                       stopAllSpeech();
                                       setUserTranscript('');
                                       setRecordedText('');
                                       audioChunksRef.current = [];
                                       setRecordingAnswerState('recording');
                                       if (mediaRecorderRef.current) {
                                          try {
                                             if (mediaRecorderRef.current.state === 'inactive') {
                                                mediaRecorderRef.current.start(200);
                                             }
                                          } catch(e) {
                                             console.error("Failed to start media recorder", e);
                                          }
                                       }
                                    }}
                                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                 >
                                    <Mic className="w-5 h-5" />
                                    <span>Start Recording</span>
                                 </button>
                              </div>
                           )}

                           {!isTranscribing && recordingAnswerState === 'recording' && (
                              <div className="flex flex-col items-center gap-5 py-6">
                                 <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest animate-pulse">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Recording Live Audio...
                                 </div>
                                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full min-h-[100px] flex items-center justify-center text-center">
                                    <p className="text-base font-medium text-slate-700 italic">
                                       Recording your audio... Speak your complete answer clearly and click Stop Recording when finished.
                                    </p>
                                 </div>
                                 <button
                                    onClick={() => {
                                       if (mediaRecorderRef.current) {
                                          try {
                                             if (mediaRecorderRef.current.state === 'recording') {
                                                mediaRecorderRef.current.stop();
                                             }
                                          } catch(e) {
                                             console.error("Failed to stop media recorder", e);
                                          }
                                       }
                                    }}
                                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-rose-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                 >
                                    <Square className="w-5 h-5 fill-current" />
                                    <span>Stop Recording</span>
                                 </button>
                              </div>
                           )}

                           {!isTranscribing && recordingAnswerState === 'recorded' && recordedAudioUrl && (
                              <div className="flex flex-col items-center gap-6 py-6 animate-in fade-in duration-300">
                                 <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 w-full flex flex-col gap-3 text-center">
                                    <div className="flex items-center justify-between">
                                       <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                                          <Volume2 className="w-4 h-4 text-indigo-600" /> Listen to Your Recorded Audio
                                       </span>
                                       <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full">
                                          Ready for Review
                                       </span>
                                    </div>
                                    <audio src={recordedAudioUrl} controls className="w-full h-11 rounded-xl outline-none" />
                                 </div>

                                 <div className="flex items-center gap-3 w-full max-w-md pt-2">
                                    <button
                                       onClick={() => {
                                          stopAllSpeech();
                                          setRecordedAudioUrl(null);
                                          setRecordedAudioBlob(null);
                                          audioChunksRef.current = [];
                                          setRecordingAnswerState('idle');
                                       }}
                                       className="flex-1 py-3.5 px-4 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-wider hover:bg-rose-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                       <RotateCcw className="w-4 h-4" />
                                       <span>Record Again</span>
                                    </button>

                                    <button
                                       onClick={() => {
                                          if (recordedAudioBlob) {
                                             handleTranscribeAudio(recordedAudioBlob);
                                          }
                                       }}
                                       className="flex-1 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                    >
                                       <Send className="w-4 h-4" />
                                       <span>Submit Audio</span>
                                    </button>
                                 </div>
                              </div>
                           )}

                           {!isTranscribing && recordingAnswerState === 'submitted' && feedbackData && (
                              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                                 <div className={`p-4 md:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-sm ${
                                    feedbackData.stage === 'excellent'
                                       ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                       : feedbackData.stage === 'good'
                                         ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                                         : 'bg-amber-50 border-amber-200 text-amber-800'
                                 }`}>
                                    <div className="flex items-center gap-3">
                                       {feedbackData.stage === 'excellent' && (
                                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                                             <CheckCircle2 className="w-6 h-6" />
                                          </div>
                                       )}
                                       {feedbackData.stage === 'good' && (
                                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                                             <CheckCircle2 className="w-6 h-6" />
                                          </div>
                                       )}
                                       {feedbackData.stage === 'poor' && (
                                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                                             <AlertCircle className="w-6 h-6" />
                                          </div>
                                       )}
                                       <div>
                                          <span className="text-[10px] font-black uppercase tracking-widest opacity-75">Feedback</span>
                                          <h5 className="text-base font-extrabold capitalize">{feedbackData.text}</h5>
                                       </div>
                                    </div>
                                    
                                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                       feedbackData.stage === 'excellent'
                                          ? 'bg-emerald-200/70 text-emerald-900'
                                          : feedbackData.stage === 'good'
                                            ? 'bg-indigo-200/70 text-indigo-900'
                                            : 'bg-amber-200/70 text-amber-900'
                                    }`}>
                                       {feedbackData.stage}
                                    </span>
                                 </div>

                                 <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                       Expected Answer Coverage:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                       {feedbackData.wordAnalysis.map((item, idx) => (
                                          <span
                                             key={idx}
                                             className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                item.matched
                                                   ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                   : 'bg-rose-50 text-rose-700 border-rose-200 opacity-70'
                                             }`}
                                          >
                                             {item.word}
                                          </span>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="flex flex-col gap-1 text-xs">
                                    <span className="font-bold text-slate-500 uppercase tracking-wider">Your Transcribed Answer:</span>
                                    <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 italic font-medium">
                                       "{recordedText}"
                                    </p>
                                 </div>

                                 <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                       onClick={() => {
                                          stopAllSpeech();
                                          setRecordingAnswerState('idle');
                                          setRecordedText('');
                                          setFeedbackData(null);
                                       }}
                                       className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                       Try Again
                                    </button>
                                    <button
                                       onClick={() => {
                                          stopAllSpeech();
                                          setIsRecordingAnswerMode(false);
                                          setRecordingAnswerState('idle');
                                       }}
                                       className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer"
                                    >
                                       Back to Answer View
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                      ) : (
                        <div className="flex-1 min-h-[120px] md:min-h-[200px] flex flex-col justify-center">
                           <div className="text-base sm:text-2xl md:text-4xl font-medium leading-[1.6] tracking-tight">
                              {isSpeakingFull ? (
                                 fullAnswerTokens.map((token, idx) => (
                                    <div
                                       key={idx}
                                       className={`inline transition-all duration-300 px-0.5 rounded ${
                                          idx === currentTokenIdx
                                             ? 'text-indigo-700 font-extrabold bg-indigo-100 shadow-[0_0_15px_rgba(79,70,229,0.25)] scale-[1.1] border border-indigo-200/50 relative z-10'
                                             : 'text-indigo-600 font-bold bg-indigo-50/50 shadow-[0_0_20px_rgba(79,70,229,0.06)]'
                                       }`}
                                    >
                                       <QuestionMathJax content={token} />
                                       {' '}
                                    </div>
                                 ))
                              ) : (
                                   chunks.map((chunk, idx) => {
                                      const isSelectedChunk = practiceMode === 'chunks' && idx === currentChunkIdx;
                                      const isHighlighted = practiceMode === 'full'
                                         ? (!isQuestionFinished && !isSpeakingQuestion)
                                         : isSelectedChunk;
                                      const isDimmed = isQuestionFinished || (practiceMode === 'chunks' && idx < currentChunkIdx);
                                      return (
                                         <div 
                                            key={idx}
                                            onClick={() => {
                                               speakChunkAtIndex(idx);
                                            }}
                                            className={`inline transition-all duration-300 px-1.5 py-0.5 rounded-lg cursor-pointer select-none ${
                                               isHighlighted
                                                  ? 'text-indigo-700 font-bold bg-indigo-100/80 shadow-[0_0_15px_rgba(79,70,229,0.2)] border border-indigo-200' 
                                                  : isDimmed
                                                     ? 'text-slate-400/70 hover:text-slate-600 hover:bg-slate-100' 
                                                     : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50'
                                            }`}
                                            title={`Click to read Chunk ${idx + 1}`}
                                         >
                                            <QuestionMathJax content={chunk} />
                                            {' '}
                                         </div>
                                      );
                                   })
                              )}
                           </div>
                        </div>
                      )}
                </div>

                {/* Loading state during Speech to Text API request */}
                {/* {isTranscribing && (
                   <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-200/60 text-center mx-auto max-w-2xl w-full flex items-center justify-center gap-3 my-4">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <span className="text-sm font-bold text-indigo-700">Submitting audio & processing response...</span>
                   </div>
                )} */}

                {/* User Feedback */}
                {userTranscript && !isTranscribing && (
                   <div className="flex flex-col gap-3 max-w-2xl w-full mx-auto my-4">
                      {/* <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 text-center">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                            <Mic className="w-3.5 h-3.5 text-rose-500" /> Transcribed Speech:
                         </p>
                         <p className="text-base md:text-lg font-medium text-slate-700 italic">
                            "{userTranscript}"
                         </p>
                      </div> */}

                      {feedbackData && !isRecordingAnswerMode && (
                         <div className={`p-4 md:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-sm ${
                            feedbackData.stage === 'excellent'
                               ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                               : feedbackData.stage === 'good'
                                 ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                                 : 'bg-amber-50 border-amber-200 text-amber-800'
                         }`}>
                            <div className="flex items-center gap-3">
                               {feedbackData.stage === 'excellent' && (
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                                     <CheckCircle2 className="w-6 h-6" />
                                  </div>
                               )}
                               {feedbackData.stage === 'good' && (
                                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                                     <CheckCircle2 className="w-6 h-6" />
                                  </div>
                               )}
                               {feedbackData.stage === 'poor' && (
                                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                                     <AlertCircle className="w-6 h-6" />
                                  </div>
                               )}
                               <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest opacity-75">Feedback</span>
                                  <h5 className="text-base font-extrabold capitalize">{feedbackData.text}</h5>
                               </div>
                            </div>
                            
                            <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                               feedbackData.stage === 'excellent'
                                  ? 'bg-emerald-200/70 text-emerald-900'
                                  : feedbackData.stage === 'good'
                                    ? 'bg-indigo-200/70 text-indigo-900'
                                    : 'bg-amber-200/70 text-amber-900'
                            }`}>
                               {feedbackData.stage}
                            </span>
                         </div>
                      )}
                   </div>
                )}
            </div>

            {/* Right Column: Embedded Notes Panel (Inline in Same Screen Section) */}
            {showNotesPanel && (
              <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-3 md:gap-4 sticky top-20 w-full animate-in fade-in slide-in-from-right duration-300">
                {pdfUrl ? (
                  <NotesViewer 
                    pdfUrl={pdfUrl}
                    chapterTitle={`Speak Along Viva - Question #${currentQuestionIdx + 1}`}
                    subjectName={subjectName || 'Viva Notes'}
                    inline={true}
                    onBack={() => {
                      stopAllSpeech();
                      setIsSpeakingNotes(false);
                      setShowNotesPanel(false);
                    }}
                  />
                ) : (
                  <div 
                    className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-lg flex flex-col overflow-hidden relative select-none min-h-[500px]"
                    onContextMenu={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                  >
                    {/* Anti-Screenshot Overlay Blur */}
                    {isPrivacyBlurred && (
                      <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                          <AlertCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold">Content Protected</h4>
                        <p className="text-sm text-slate-300 max-w-sm">
                          Screenshots, text selection, and screen capturing are prohibited for copyright and study material security.
                        </p>
                        <button
                          onClick={() => setIsPrivacyBlurred(false)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Resume Viewing
                        </button>
                      </div>
                    )}

                    {/* Panel Header */}
                    <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                            Study Notes & Reference
                          </h3>
                          <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Question {currentQuestionIdx + 1} of {questions.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Speaker TTS Button */}
                        <button
                          onClick={handleSpeakNotes}
                          title={isSpeakingNotes ? "Stop Reading Notes" : "Read Notes Aloud"}
                          className={`px-3 py-1.5 sm:px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border cursor-pointer active:scale-95 ${
                            isSpeakingNotes
                              ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-500'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{isSpeakingNotes ? 'Stop' : 'Read'}</span>
                        </button>

                        {/* Hide Notes Button */}
                        <button
                          onClick={() => {
                            stopAllSpeech();
                            setIsSpeakingNotes(false);
                            setShowNotesPanel(false);
                          }}
                          className="px-3 py-1.5 sm:px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer active:scale-95"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Close</span>
                        </button>

                      </div>
                    </div>

                    {/* Panel Content Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50 relative select-none max-h-[600px]">
                      {fetchingNotes ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                          <p className="text-sm font-bold text-slate-600">Loading protected study notes...</p>
                        </div>
                      ) : notesError || (!notesText && getNoteImages().length === 0) ? (
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center my-auto space-y-4 animate-in fade-in duration-300">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                            <BookOpen className="w-8 h-8" />
                          </div>
                          
                          <div className="space-y-1.5 max-w-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100 inline-block">
                              Content Under Preparation
                            </span>
                            <h4 className="text-lg font-bold text-slate-800 pt-2">No Notes Available For This Question</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              Our academic team is currently preparing study notes and visual references for this question. We are working on it, and it will be available soon.
                            </p>
                          </div>

                          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl w-full text-xs text-slate-600 font-medium flex items-center gap-2.5 justify-center">
                            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                            <span>Thank you for your patience as we enhance our learning resources.</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {notesText && (
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                              <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50/80 p-3 rounded-xl border border-indigo-200/60 text-xs font-semibold">
                                <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
                                <span>Study Notes & Concept Breakdown</span>
                              </div>
                              <div className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                                <QuestionMathJax content={notesText} />
                              </div>
                            </div>
                          )}

                          {/* Note Images if available */}
                          {getNoteImages().length > 0 && (
                            <div className="space-y-3 pt-2">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-indigo-600" />
                                <span>Note Diagrams & Images</span>
                              </h4>
                              <div className="grid grid-cols-1 gap-4">
                                {getNoteImages().map((imgUrl, idx) => (
                                  <div key={idx} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                    <div className="p-2 bg-slate-100 flex items-center justify-center relative">
                                      <div className="absolute inset-0 bg-transparent z-10" />
                                      <img 
                                        src={imgUrl} 
                                        alt={`Note diagram ${idx + 1}`} 
                                        className="w-full h-auto object-contain max-h-[350px] rounded-lg"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Panel Footer */}
                    <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Protected Content • Downloading disabled</p>
                      <button
                        onClick={() => {
                          stopAllSpeech();
                          setIsSpeakingNotes(false);
                          setShowNotesPanel(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </main>

      {/* Sticky Bottom Control Bar for Mobile Viewports */}
      {/* {!isQuestionFinished ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5 shrink-0">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Mode</span>
            <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 text-center min-w-[36px]">
              {practiceMode === 'full' ? 'Full' : `${currentChunkIdx + 1} / ${chunks.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              disabled={isListening}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 ${
                isPlaying
                  ? 'bg-amber-500 text-white shadow-amber-100 active:scale-95' 
                  : isListening 
                     ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                     : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 active:scale-95'
              }`}
            >
              {isPlaying ? (
                  <Square className="w-4.5 h-4.5 fill-current" />
              ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          <button
            onClick={handleNextChunk}
            className="px-4 py-3.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 shrink-0"
          >
            <span>{(practiceMode === 'full' || currentChunkIdx >= chunks.length - 1) ? 'Finish' : 'Next'}</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-4 py-3.5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
          <button
            onClick={handleDiscard}
            className="flex-1 py-3.5 bg-rose-50 text-rose-600 border border-rose-100 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-100 transition-all text-center"
          >
            Retry
          </button>

          <button
            onClick={proceedToNextQuestion}
            className="flex-[2] px-4 py-3.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-100"
          >
            <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'End Session'}</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      )} */}

      {/* Warning Popup Modal for Record Answer Mode */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Answer Mode</h3>
                <p className="text-xs text-slate-500 font-medium">Memory Recall Challenge</p>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-amber-900 text-sm font-medium leading-relaxed">
              Do you memorize the complete answer? During recording, the answer text will be hidden.
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={skipWarningForSession}
                onChange={(e) => setSkipWarningForSession(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                  Remember my choice for this session
                </span>
                <span className="text-[10px] text-slate-400">
                  Don't show this popup again until a new session is started.
                </span>
              </div>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  stopAllSpeech();
                  setShowWarningModal(false);
                  setIsRecordingAnswerMode(true);
                  setRecordingAnswerState('idle');
                  setRecordedText('');
                  setFeedbackData(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 cursor-pointer active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Fullscreen Note Image Zoom Modal */}
      {selectedNoteImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={() => setSelectedNoteImage(null)}
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer flex items-center gap-1.5 px-4 font-bold text-sm"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
          </div>
          <img 
            src={selectedNoteImage} 
            alt="Enlarged note image" 
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Global CSS for Anti-Print & Voice Animation */}
      <style>{`
        @media print {
          body {
            display: none !important;
          }
        }
        @keyframes voice-bar {
          0%, 100% { height: 20%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-voice-bar {
          animation: voice-bar 0.6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
