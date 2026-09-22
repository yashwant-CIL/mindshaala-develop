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
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SpeakAlongService } from '../../services/SpeakAlongService';
import QuestionMathJax from '../../shared/mathjaxconfig/QuestionMathJax';
import { speakText } from '../../utils/ttsHelper';


interface SpeakAlongSessionProps {
  courseId: number;
  subjectId: number;
  chapterId?: number;
  subjectName: string;
  onExit: () => void;
  onFinish: () => void;
}

export default function SpeakAlongSession({ courseId, subjectId, chapterId, subjectName, onExit, onFinish }: SpeakAlongSessionProps) {
  const [questions, setQuestions] = useState<any[]>([]);
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
  const [isQuestionFinished, setIsQuestionFinished] = useState(false);
  const [isSpeakingFull, setIsSpeakingFull] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'chunks' | 'full'>('chunks');
  
  const [fullAnswerTokens, setFullAnswerTokens] = useState<string[]>([]);
  const [currentTokenIdx, setCurrentTokenIdx] = useState<number>(-1);
  const tokenRangesRef = useRef<{ start: number; end: number }[]>([]);

  const aiSpeechStartTimeRef = useRef<number>(0);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  // View Notes Side Panel States
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [selectedNoteImage, setSelectedNoteImage] = useState<string | null>(null);

  // Keyboard shortcut: close notes panel on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNotesPanel) {
        setShowNotesPanel(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNotesPanel]);

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
  const [feedbackData, setFeedbackData] = useState<{
    score: number;
    wordAnalysis: { word: string; matched: boolean }[];
    feedback: string;
  } | null>(null);

  const evaluateAnswer = (userText: string, expectedText: string) => {
    const clean = (str: string) =>
      str
        .toLowerCase()
        .replace(/\\\[|\\\]|\$\$|\$/g, '')
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const userClean = clean(userText);
    const expectedClean = clean(expectedText);

    const userWords = userClean.split(' ').filter(Boolean);
    const expectedWords = expectedClean.split(' ').filter(Boolean);

    if (expectedWords.length === 0) {
      return { score: 100, wordAnalysis: [], feedback: "Great effort!" };
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

    const score = Math.min(100, Math.round((matchedCount / expectedWords.length) * 100));

    let feedback = "";
    if (score >= 85) {
      feedback = "Outstanding! You recalled almost the exact answer cleanly!";
    } else if (score >= 65) {
      feedback = "Good job! You captured most of the key concepts correctly.";
    } else if (score >= 40) {
      feedback = "Fair attempt. Review the missing key terms and try again.";
    } else {
      feedback = "Needs practice. Try reading the phrase a few more times.";
    }

    return {
      score,
      wordAnalysis,
      feedback
    };
  };

  /* Original Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const payload = {
          course_id: courseId,
          subject_id: subjectId,
          chapter_id: chapterId
        };
        const data = await SpeakAlongService.getSpeakAlongQuestions(payload);
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          toast.error("No questions found for this selection.");
          onExit();
        }
      } catch (error) {
        toast.error("Failed to fetch questions.");
        onExit();
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId, subjectId, chapterId]);
  */

  // NEW: Persistent Fetch Questions & BeforeUnload Protection
  useEffect(() => {
    const sessionKey = `speakalong_session_${courseId}_${subjectId}_${chapterId}`;
    
    const fetchQuestions = async () => {
      // Try to load from localStorage first
      const savedSession = localStorage.getItem(sessionKey);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.questions && parsed.questions.length > 0) {
            setQuestions(parsed.questions);
            setCurrentQuestionIdx(parsed.currentQuestionIdx || 0);
            setCurrentChunkIdx(parsed.currentChunkIdx || 0);
            setSpeechRate(parsed.speechRate || 1.0);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved session", e);
        }
      }

      setLoading(true);
      try {
        const payload = {
          course_id: courseId,
          subject_id: subjectId,
          chapter_id: chapterId
        };
        const data = await SpeakAlongService.getSpeakAlongQuestions(payload);
        if (data && data.length > 0) {
          setQuestions(data);
          // Save initial session
          localStorage.setItem(sessionKey, JSON.stringify({
            questions: data,
            currentQuestionIdx: 0,
            currentChunkIdx: 0,
            speechRate: 1.0
          }));
        } else {
          toast.error("No questions found for this selection.");
          onExit();
        }
      } catch (error) {
        toast.error("Failed to fetch questions.");
        onExit();
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [courseId, subjectId, chapterId]);

  // NEW: Persist state changes
  useEffect(() => {
    if (questions.length > 0) {
      const sessionKey = `speakalong_session_${courseId}_${subjectId}_${chapterId}`;
      const sessionData = {
        questions,
        currentQuestionIdx,
        currentChunkIdx,
        speechRate
      };
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
  }, [questions, currentQuestionIdx, currentChunkIdx, speechRate]);

  // NEW: Handle Fullscreen Mode and hide layout decorations (sidebar, floating tools)
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

    // Hide Sidebar and Floating Actions dynamically for true screen takeover
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

      // Restore Sidebar and Floating Actions
      if (sidebar) sidebar.style.display = '';
      if (floatingActions) floatingActions.style.display = '';
    };
  }, []);

  // Initialize Speech Recognition & Media Recorder
  useEffect(() => {
    // Request microphone for media recorder
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
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
        // If our recording timer is still active, restart recognition to keep listening!
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
      if (synth) synth.cancel();
      if (recognitionRef.current) {
        try {
            recognitionRef.current.stop();
        } catch(e) {}
      }
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    };
  }, []);

  // Process current question into chunks
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIdx < questions.length) {
      const q = questions[currentQuestionIdx];
      const details = q?.question_details;
      
      // const displayText = details?.answer_description || "";
      const displayText = q?.answer_transcribe || "";
      const speechText = q?.answer_transcribe || displayText;
      
      // Helper to identify LaTeX blocks vs normal text
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
      
      // Group tokens into chunks
      for (let i = 0; i < displayTokens.length; i++) {
        currentDisplay.push(displayTokens[i]);
        // Simple mapping for speech: try to take one word from speechWords for each token
        // This is imperfect but usually better than nothing
        if (speechWords[i]) currentSpeech.push(speechWords[i]);
        
        // Chunk triggers: LaTeX block, punctuation (comma, semicolon, full stops for all languages), or safety length limit
        const isLatex = displayTokens[i].startsWith('\\');
        const isSentenceEnd = displayTokens[i].match(/[.,!?;\u0964\u0965\u06D4\u061F\u3002\uFF01\uFF1F|\uFF0C\u3001\u060C\uFF1B]["')\]}”’]*$/);
        if (isLatex || isSentenceEnd || currentDisplay.length >= 100 || i === displayTokens.length - 1) {
           newDisplayChunks.push(currentDisplay.join(' '));
           newSpeechChunks.push(currentSpeech.join(' '));
           currentDisplay = [];
           currentSpeech = [];
        }
      }
      
      // Final cleanup of any remaining
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
        sum = end + 1; // plus 1 for space
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
      
      speakQuestion(false);
    }
  }, [currentQuestionIdx, questions]);

  const [speechChunks, setSpeechChunks] = useState<string[]>([]);

  // Handle Auto-Play Chunks
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

    // Cancel any active speech or recognition before speaking question
    if (synth) synth.cancel();
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
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
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsSpeakingFull(false);
      return;
    }
    
    const q = questions[currentQuestionIdx];
    const text = q?.answer_transcribe || q?.question_details?.answer_description || q?.question_details?.answer_transcribe || "";
    if (!text || !synth) return;
    
    // Stop listening if we were listening
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
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
    
    // Pause MediaRecorder if it was recording
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
      },
      onerror: (e) => {
         console.error("TTS Error", e);
         setIsPlaying(false);
      }
    });
  };

  const speakChunkAtIndex = (idx: number) => {
    if (synth) synth.cancel();
    setIsPlaying(false);
    setIsSpeakingQuestion(false);
    setIsSpeakingFull(false);
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
      },
      onerror: (e: any) => {
        if (e?.error !== 'interrupted' && e?.error !== 'canceled') {
          console.warn("TTS Error", e);
        }
        setIsPlaying(false);
      }
    });
  };


  /* Original startListening
  const startListening = (duration: number = 3000) => {
    if (recognitionRef.current) {
      setUserTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
    
    // Start or resume MediaRecorder
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = []; // Reset chunks
        mediaRecorderRef.current.start(200); 
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
    }

    // Set auto-advance timer strictly based on AI speech duration
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    
    // Add a tiny 500ms buffer just for comfort, otherwise it cuts off too abruptly
    speechTimerRef.current = setTimeout(() => {
       handleNextChunk();
    }, duration + 500);
  };
  */

  // NEW: Updated startListening with dynamic comfortable duration
  const startListening = (duration: number = 3000) => {
    setIsListening(true); // Force listening state to true immediately
    if (recognitionRef.current) {
      setUserTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
    
    // Start or resume MediaRecorder
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = []; // Reset chunks
        mediaRecorderRef.current.start(200); 
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
    }

    // Set auto-advance timer strictly based on AI speech duration
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    
    // PER USER REQUEST: The recording duration is exactly 2x the time taken by the speech, with a safe 5-second minimum
    const recordingDuration = Math.max(duration , 2000);
    
    /* 
    // AUTO-NEXT FUNCTIONALITY: Commented out as per user request.
    // To reactivate, simply uncomment this block.
    speechTimerRef.current = setTimeout(() => {
       handleNextChunk();
    }, recordingDuration); 
    */

    // Since auto-next is disabled, we automatically stop recognition/recording after the calculated duration
    speechTimerRef.current = setTimeout(() => {
       speechTimerRef.current = null;
       if (recognitionRef.current && isListening) {
         try { recognitionRef.current.stop(); } catch(e){}
       }
       // If it's the last chunk or practice mode is full, we stop the media recorder to finalize the audio
       if (practiceMode === 'full' || currentChunkIdx === chunks.length - 1) {
         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsQuestionFinished(true);
         }
       }
    }, recordingDuration);
  };

  const handleNextChunk = () => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }

    if (synth) synth.cancel();
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    
    if (currentChunkIdx < chunks.length - 1 && practiceMode === 'chunks') {
      setCurrentChunkIdx(prev => prev + 1);
      setUserTranscript('');
      setAutoPlayNext(true); // Trigger auto-play
    } else {
      // Question is fully finished, stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
         mediaRecorderRef.current.stop();
      }
      setIsQuestionFinished(true);
    }
  };

  const proceedToNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Clear session on finish
      const sessionKey = `speakalong_session_${courseId}_${subjectId}_${chapterId}`;
      localStorage.removeItem(sessionKey);
      onFinish();
    }
  };

  const handlePlayPause = () => {
    // Request fullscreen on user interaction to bypass browser gesture security constraints
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
      synth.cancel();
      setIsPlaying(false);
      setIsSpeakingQuestion(false);
      setIsSpeakingFull(false);
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
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
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

  const handleEndSession = () => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    if (synth) synth.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    const sessionKey = `speakalong_session_${courseId}_${subjectId}_${chapterId}`;
    localStorage.removeItem(sessionKey);
    onExit();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold">Preparing your session...</p>
      </div>
    );
  }

  const question = questions?.[currentQuestionIdx];
  const question_text = question?.question_details?.question_latex;
  console.log("question_text", question_text);
  
  // NEW: Revamped Premium Light Theme UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Back arrow button - commented out as requested so user uses explicit End Session */}
          {/*
          <button 
            onClick={onExit}
            className="group w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-5 sm:h-6 md:h-10 w-[1px] bg-slate-200"></div>
          */}
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
          <button
            onClick={() => setShowNotesPanel(true)}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-500 shrink-0 active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Notes</span>
          </button>

          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer border border-red-500 shrink-0"
          >
            <span>End Session</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 md:p-8 flex flex-col  pb-24 lg:pb-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
            
            {/* Left Column: Question & Target */}
            <div className="lg:col-span-12 flex flex-col gap-3 md:gap-4">

                {/* Question Counter & AI Speed Control on Same Line */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </p>

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

                {/* Progress Bar (Aligned with Question Section Width on Desktop) */}
                <div className="w-full bg-slate-200 h-1.5 md:h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                        style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
                    ></div>
                </div>
                
                {/* Question Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BrainCircuit className="w-24 h-24 md:w-32 md:h-32 text-indigo-600" />
                   </div>
                   <div className="flex items-center justify-between gap-3 mb-3 md:mb-6">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Active Question</span>
                        {isSpeakingQuestion && (
                           <span className="flex items-center gap-1.5 text-indigo-500 animate-pulse font-bold text-[9px] md:text-[10px] uppercase">
                              <div className="w-1 h-1 rounded-full bg-indigo-500"></div> AI Speaking
                           </span>
                        )}
                        {isPlaying && isSpeakingFull && (
                           <span className="flex items-center gap-1.5 text-indigo-500 animate-pulse font-bold text-[9px] md:text-[10px] uppercase">
                              <div className="w-1 h-1 rounded-full bg-indigo-500"></div> AI Reading Full
                           </span>
                        )}
                      </div>

                      {/* Question Control Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowNotesPanel(true)}
                          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span>View Notes</span>
                        </button>

                        <button
                           onClick={() => {
                              if (isPlaying && isSpeakingQuestion) {
                                 if (synth) synth.cancel();
                                 setIsPlaying(false);
                                 setIsSpeakingQuestion(false);
                              } else {
                                 if (synth) synth.cancel();
                                 setIsPlaying(false);
                                 setIsSpeakingFull(false);
                                 speakQuestion(false);
                              }
                           }}
                           className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                              isPlaying && isSpeakingQuestion
                                 ? 'bg-amber-500 text-white hover:bg-amber-600'
                                 : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                           }`}
                        >
                           <Volume2 className="w-4 h-4" />
                           <span>{isPlaying && isSpeakingQuestion ? 'Stop Question' : 'Read Question'}</span>
                        </button>
                      </div>
                   </div>
                   <div className={`text-base sm:text-2xl md:text-3xl font-bold transition-all duration-500 ${isSpeakingQuestion ? 'text-indigo-600 scale-[1.01]' : 'text-slate-800'} leading-[1.4]`}>
                     <QuestionMathJax content={question?.question_details?.question_latex} />
                   </div>
                </div>

                {/* Target Answer / Chunks Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-10">
                        <div className="flex flex-col gap-0.5">
                           <h3 className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em]">Practice Phrase</h3>
                           {/* <p className="text-xs md:text-sm font-bold text-slate-600">Listen carefully and repeat the highlighted part</p> */}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
                            {/* Segmented Control Practice Mode Selector */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50 shrink-0">
                               <button
                                 onClick={() => {
                                   synth.cancel();
                                   setIsPlaying(false);
                                   setIsSpeakingFull(false);
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
                                 onClick={() => {
                                   synth.cancel();
                                   setIsPlaying(false);
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
                               <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider shrink-0">
                                  CHUNK {currentChunkIdx + 1} OF {chunks.length}
                               </div>
                            )}

                            {/* Answer Speech Button */}
                            <button
                               onClick={() => {
                                  if (isPlaying && (isSpeakingFull || (!isSpeakingQuestion && practiceMode === 'chunks'))) {
                                     if (synth) synth.cancel();
                                     setIsPlaying(false);
                                     setIsSpeakingFull(false);
                                  } else {
                                     if (synth) synth.cancel();
                                     setIsPlaying(false);
                                     setIsSpeakingQuestion(false);
                                     if (practiceMode === 'full') {
                                        speakFullAnswer();
                                     } else {
                                        speakCurrentChunk();
                                     }
                                  }
                               }}
                               className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
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
                                        ? 'Read Answer'
                                        : 'Read Answer'}
                               </span>
                            </button>

                            {/* Next Chunk Navigation Button */}
                            {practiceMode === 'chunks' && !isQuestionFinished && (
                               <button
                                  onClick={handleNextChunk}
                                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-green-600 text-white hover:bg-slate-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                               >
                                  <span>{currentChunkIdx >= chunks.length - 1 ? 'Finish Question' : 'Next Chunk'}</span>
                                  <SkipForward className="w-4 h-4" />
                               </button>
                            )}

                            {/* Question Completion Navigation */}
                            {isQuestionFinished && (
                               <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                     onClick={() => {
                                        if (skipWarningForSession) {
                                           setIsRecordingAnswerMode(true);
                                           setRecordingAnswerState('idle');
                                           setRecordedText('');
                                           setFeedbackData(null);
                                        } else {
                                           setShowWarningModal(true);
                                        }
                                     }}
                                     className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                                  >
                                     <Mic className="w-4 h-4" />
                                     <span>Record Answer</span>
                                  </button>

                                  <button
                                     onClick={handleDiscard}
                                     className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                                  >
                                     Retry
                                  </button>

                                  <button
                                     onClick={proceedToNextQuestion}
                                     className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                                  >
                                     <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'End Session'}</span>
                                     <SkipForward className="w-4 h-4" />
                                  </button>
                               </div>
                            )}
                         </div>
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
                                    if (recognitionRef.current && isListening) {
                                       try { recognitionRef.current.stop(); } catch(e){}
                                    }
                                    setIsRecordingAnswerMode(false);
                                    setRecordingAnswerState('idle');
                                 }}
                                 className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                 Exit Recording
                              </button>
                           </div>

                           {recordingAnswerState === 'idle' && (
                              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                                 <p className="text-sm font-medium text-slate-600 max-w-md">
                                    Click the button below to start recording your answer.
                                 </p>
                                 <button
                                    onClick={() => {
                                       setUserTranscript('');
                                       setRecordedText('');
                                       setRecordingAnswerState('recording');
                                       if (recognitionRef.current) {
                                          try { recognitionRef.current.start(); } catch(e){}
                                       }
                                    }}
                                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                 >
                                    <Mic className="w-5 h-5" />
                                    <span>Start Recording</span>
                                 </button>
                              </div>
                           )}

                           {recordingAnswerState === 'recording' && (
                              <div className="flex flex-col items-center gap-5 py-6">
                                 <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest animate-pulse">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Recording Live Audio...
                                 </div>
                                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full min-h-[100px] flex items-center justify-center text-center">
                                    <p className="text-base font-medium text-slate-700 italic">
                                       {userTranscript ? `"${userTranscript}"` : "Listening... Speak your complete answer."}
                                    </p>
                                 </div>
                                 <button
                                    onClick={() => {
                                       if (recognitionRef.current) {
                                          try { recognitionRef.current.stop(); } catch(e){}
                                       }
                                       setRecordedText(userTranscript);
                                       setRecordingAnswerState('recorded');
                                    }}
                                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-rose-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                 >
                                    <Square className="w-5 h-5 fill-current" />
                                    <span>Stop Recording</span>
                                 </button>
                              </div>
                           )}

                           {recordingAnswerState === 'recorded' && (
                              <div className="flex flex-col gap-4">
                                 <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                       Your Transcribed Answer (Editable):
                                    </label>
                                    <p className="text-xs text-slate-400">
                                       If any word was misheard or mispronounced, you can correct it below before submitting.
                                    </p>
                                 </div>

                                 <textarea
                                    value={recordedText}
                                    onChange={(e) => setRecordedText(e.target.value)}
                                    placeholder="Your recorded answer will appear here..."
                                    className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                                 />

                                 <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                       onClick={() => {
                                          setIsRecordingAnswerMode(false);
                                          setRecordingAnswerState('idle');
                                       }}
                                       className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                       Cancel
                                    </button>

                                    <button
                                       onClick={() => {
                                          const expected = questions[currentQuestionIdx]?.answer_transcribe || questions[currentQuestionIdx]?.question_details?.answer_description || questions[currentQuestionIdx]?.question_details?.answer_transcribe || "";
                                          const evalResult = evaluateAnswer(recordedText, expected);
                                          setFeedbackData(evalResult);
                                          setRecordingAnswerState('submitted');
                                       }}
                                       disabled={!recordedText.trim()}
                                       className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 cursor-pointer active:scale-95 flex items-center gap-1.5"
                                    >
                                       <CheckCircle2 className="w-4 h-4" />
                                       <span>Submit Answer</span>
                                    </button>
                                 </div>
                              </div>
                           )}

                           {recordingAnswerState === 'submitted' && feedbackData && (
                              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                                 <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl">
                                    <div>
                                       <h4 className="text-sm font-extrabold text-indigo-950">Evaluation Summary</h4>
                                       <p className="text-xs text-indigo-600 font-bold mt-0.5">{feedbackData.feedback}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-indigo-600 text-white font-black text-lg rounded-xl shadow-md">
                                       {feedbackData.score}%
                                    </div>
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
                                    <span className="font-bold text-slate-500 uppercase tracking-wider">Your Submitted Answer:</span>
                                    <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 italic">
                                       "{recordedText}"
                                    </p>
                                 </div>

                                 <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                       onClick={() => {
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

                {/* User Feedback */}
                {userTranscript && !isQuestionFinished && (
                   <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 text-center mx-auto max-w-2xl w-full">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                         <Mic className="w-3 h-3 text-rose-500" /> You said:
                      </p>
                      <p className="text-base md:text-lg font-medium text-slate-700 italic">
                         "{userTranscript}"
                      </p>
                   </div>
                )}
            </div>

            {/* Right Column: Interaction & Feedback - Session Control (Commented Out) */}
            {/* 
            <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-28">
                <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Session Control</span>
                           <h4 className="text-xl font-bold">Interactive Hub</h4>
                        </div>

                        {!isQuestionFinished ? (
                           <div className="flex flex-col items-center gap-4 w-full">
                              <button
                                onClick={handlePlayPause}
                                disabled={isListening}
                                className={`group w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl relative overflow-hidden ${
                                  isPlaying
                                    ? 'bg-white text-indigo-600' 
                                    : isListening 
                                       ? 'bg-indigo-500/50 text-indigo-300 cursor-not-allowed border-2 border-indigo-400/20'
                                       : 'bg-white text-indigo-600 hover:scale-110 active:scale-95'
                                }`}
                              >
                                {isPlaying ? (
                                    <Square className="w-8 h-8 fill-current" />
                                ) : (
                                    <Play className="w-10 h-10 fill-current ml-1" />
                                )}
                              </button>
                              
                              <p className="text-xs font-medium text-indigo-100 h-4">
                                 {isPlaying ? "Tap to Pause" : isListening ? "Listening to you..." : "Tap to Start AI Speech"}
                              </p>

                              <button
                                onClick={handleNextChunk}
                                className="w-full py-4.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 group"
                              >
                                 <span>{(practiceMode === 'full' || currentChunkIdx >= chunks.length - 1) ? 'Finish Question' : 'Next Chunk'}</span>
                                 <SkipForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                           </div>
                        ) : (
                           <div className="flex flex-col gap-4 w-full">
                              <button
                                onClick={proceedToNextQuestion}
                                className="w-full py-5 bg-white text-indigo-600 font-black text-sm uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 hover:-translate-y-1"
                              >
                                 <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'End Session'}</span>
                                 <SkipForward className="w-5 h-5" />
                              </button>

                              <button
                                onClick={handleDiscard}
                                className="w-full py-3.5 bg-transparent border border-white/30 text-white font-bold text-xs rounded-2xl hover:bg-white/10 transition-all"
                              >
                                 Retry This Question
                              </button>
                           </div>
                        )}
                    </div>
                </div>
            </div>
            */}
        </div>
      </main>

      {/* Sticky Bottom Control Bar for Mobile Viewports */}
      {!isQuestionFinished ? (
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
      )}

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

      {/* Right-Side Slide-Over Notes Panel */}
      {showNotesPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setShowNotesPanel(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md sm:max-w-lg md:max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Panel Header */}
              <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                      Study Notes & Diagrams
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Question {currentQuestionIdx + 1} of {questions.length}</p>
                  </div>
                </div>

                {/* Hide Notes Button */}
                <button
                  onClick={() => setShowNotesPanel(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Hide Notes</span>
                </button>
              </div>

              {/* Panel Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50">
                {/* Question context summary */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    Question Summary
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-800 leading-relaxed">
                    <QuestionMathJax content={question?.question_details?.question_latex} />
                  </p>
                </div>

                {/* Note Images Gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>Note Images ({getNoteImages().length})</span>
                    </h4>
                  </div>

                  {getNoteImages().length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {getNoteImages().map((imgUrl, idx) => (
                        <div key={idx} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <div className="p-2 bg-slate-100 flex items-center justify-center">
                            <img 
                              src={imgUrl} 
                              alt={`Note diagram ${idx + 1}`} 
                              className="w-full h-auto object-contain max-h-[350px] rounded-lg"
                              onError={(e) => {
                                // Fallback image layout if network fails to fetch
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Note Image {idx + 1}</span>
                            <button
                              onClick={() => setSelectedNoteImage(imgUrl)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Enlarge Note</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50/80 p-3 rounded-xl border border-indigo-200/60 text-xs font-semibold">
                        <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
                        <span>Visual Study Note & Concept Reference</span>
                      </div>

                      {/* Styled Visual Concept Card */}
                      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <FileText className="w-28 h-28 text-white" />
                        </div>
                        <h5 className="font-extrabold text-xs text-indigo-300 uppercase tracking-widest">Key Concept & Formula Notes</h5>
                        <div className="text-sm text-slate-100 leading-relaxed font-medium bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                          <QuestionMathJax content={question?.question_details?.answer_latex || question?.answer || "Study the formula breakdown and key definitions for this topic."} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Answer Explanation Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Full Explanation & Target Answer</span>
                  </h4>
                  <div className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                    <QuestionMathJax content={question?.question_details?.answer_latex} />
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                <p className="text-xs text-slate-400 font-medium">Click Hide Notes or press Esc to close</p>
                <button
                  onClick={() => setShowNotesPanel(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hide Notes</span>
                </button>
              </div>

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

      {/* Global CSS for Voice Animation */}
      <style>{`
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
