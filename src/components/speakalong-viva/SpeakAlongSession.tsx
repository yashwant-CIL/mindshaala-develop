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
  Volume2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SpeakAlongService } from '../../services/SpeakAlongService';
import QuestionMathJax from '../../shared/mathjaxconfig/QuestionMathJax';

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
  const [speechRate, setSpeechRate] = useState(0.9);
  
  const [userTranscript, setUserTranscript] = useState('');
  
  const synth = window.speechSynthesis;
  const recognitionRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isQuestionFinished, setIsQuestionFinished] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  const aiSpeechStartTimeRef = useRef<number>(0);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            setSpeechRate(parsed.speechRate || 0.9);
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
            speechRate: 0.9
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
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
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
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
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
        
        // Chunk triggers: LaTeX block, punctuation, or count
        const isLatex = displayTokens[i].startsWith('\\');
        if (isLatex || displayTokens[i].match(/[.,!?]/) || currentDisplay.length >= 7 || i === displayTokens.length - 1) {
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
      setCurrentChunkIdx(0);
      setUserTranscript('');
      setIsQuestionFinished(false);
      setRecordedAudioUrl(null);
      audioChunksRef.current = [];
      
      speakQuestion();
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

  const speakQuestion = () => {
    if (questions.length === 0 || !synth) return;
    const q = questions[currentQuestionIdx];
    // const details = q?.question_details;
    
    // As per user request: question_transcribe for speech
    const text = q?.question_transcribe || q.question_transcribe || "";
    if (!text) return;

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    
    utterance.onstart = () => {
      setIsSpeakingQuestion(true);
      setIsPlaying(true);
    };
    
    utterance.onend = () => {
      setIsSpeakingQuestion(false);
      setIsPlaying(false);
      // After question finishes, start first chunk
      setAutoPlayNext(true);
    };

    utterance.onerror = () => {
      setIsSpeakingQuestion(false);
      setIsPlaying(false);
      setAutoPlayNext(true);
    };
    
    synth.speak(utterance);
  };

  const speakCurrentChunk = () => {
    const textToSpeak = speechChunks[currentChunkIdx] || chunks[currentChunkIdx];
    if (!textToSpeak || !synth) return;
    
    // Cancel any ongoing speech
    synth.cancel();
    
    // Pause MediaRecorder if it was recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
       mediaRecorderRef.current.pause();
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      aiSpeechStartTimeRef.current = Date.now();
      if (recognitionRef.current && isListening) {
         try { recognitionRef.current.stop(); } catch(e){}
      }
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      const speechDuration = Date.now() - aiSpeechStartTimeRef.current;
      // Automatically start listening after speaking, passing the exact duration
      startListening(speechDuration);
    };
    
    utterance.onerror = (e) => {
       console.error("TTS Error", e);
       setIsPlaying(false);
    }
    
    synth.speak(utterance);
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

  // NEW: Updated startListening with timing sync and commented auto-next
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
    
    // PER USER REQUEST: The time taken by the AI to speak the chunk is used to determine the user's turn.
    // MODIFICATION: We add a 1-second buffer (1000ms) to the duration. 
    // This is because humans need a moment to process the speech and start talking. 
    // Without this buffer, short chunks (less than 1s) feel "instant" and cut off the user.
    const recordingDuration = Math.max(duration + 1000, 2000); // Give at least 2 seconds for any chunk
    
    /* 
    // AUTO-NEXT FUNCTIONALITY: Commented out as per user request.
    // To reactivate, simply uncomment this block.
    speechTimerRef.current = setTimeout(() => {
       handleNextChunk();
    }, recordingDuration); 
    */

    // Since auto-next is disabled, we automatically stop recognition/recording after the calculated duration
    speechTimerRef.current = setTimeout(() => {
       if (recognitionRef.current && isListening) {
         try { recognitionRef.current.stop(); } catch(e){}
       }
       // If it's the last chunk, we stop the media recorder to finalize the audio
       if (currentChunkIdx === chunks.length - 1) {
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
    
    if (currentChunkIdx < chunks.length - 1) {
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
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      setIsSpeakingQuestion(false);
    } else {
      if (isQuestionFinished) return;
      if (currentChunkIdx === 0 && !isSpeakingQuestion) {
          speakQuestion();
      } else {
          speakCurrentChunk();
      }
    }
  };

  const handleDiscard = () => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    setIsQuestionFinished(false);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];
    setCurrentChunkIdx(0);
    setUserTranscript('');
    speakQuestion();
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
  // Original UI
  // return (
  //   <div className="min-h-screen bg-slate-50 flex flex-col">
  //     {/* Header */}
  //     <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
  //       <div className="flex items-center gap-4">
  //         <button 
  //           onClick={onExit}
  //           className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
  //         >
  //           <ArrowLeft className="w-5 h-5" />
  //         </button>
  //         <div>
  //           <h2 className="font-bold text-slate-800 text-lg">SpeakAlong Practice</h2>
  //           <p className="text-xs text-slate-500 font-medium">{subjectName} • Question {currentQuestionIdx + 1} of {questions.length}</p>
  //         </div>
  //       </div>
  //       
  //       {/* Speed Control */}
  //       <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
  //          <Settings className="w-4 h-4 text-slate-400" />
  //          <span className="text-xs font-bold text-slate-500 uppercase">Speed: {speechRate}x</span>
  //          <input 
  //            type="range" 
  //            min="0.5" max="1.5" step="0.1" 
  //            value={speechRate}
  //            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
  //            className="w-24 accent-indigo-600"
  //          />
  //       </div>
  //     </div>
  //
  //     {/* Main Content Area */}
  //     <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
  //       
  //       {/* Question Card */}
  //       <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
  //          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
  //          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block">Question {currentQuestionIdx + 1}</span>
  //          <div className={`text-2xl font-black transition-colors duration-500 ${isSpeakingQuestion ? 'text-indigo-600' : 'text-slate-800'} leading-snug`}>
  //            <QuestionMathJax content={question?.question_details?.question_latex} />
  //          </div>
  //       </div>
  //
  //       <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col">
  //            
  //            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
  //               <div className="flex items-center gap-2">
  //                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
  //                     Chunk {currentChunkIdx + 1} of {chunks.length}
  //                  </span>
  //               </div>
  //               
  //               {/* Status Indicator */}
  //               <div className="flex items-center gap-2">
  //                  {isSpeakingQuestion ? (
  //                     <span className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-full">
  //                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
  //                        AI is reading question...
  //                     </span>
  //                  ) : isPlaying ? (
  //                     <span className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-full">
  //                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
  //                        AI is speaking...
  //                     </span>
  //                  ) : isListening ? (
  //                     <span className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 px-4 py-2 rounded-full">
  //                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
  //                        Listening to you...
  //                     </span>
  //                  ) : isQuestionFinished ? (
  //                     <span className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full">
  //                        <CheckCircle2 className="w-4 h-4" /> Finished
  //                     </span>
  //                  ) : (
  //                     <span className="flex items-center gap-2 text-slate-500 font-bold text-sm bg-slate-100 px-4 py-2 rounded-full">
  //                        <CheckCircle2 className="w-4 h-4" /> Ready
  //                     </span>
  //                  )}
  //               </div>
  //            </div>
  //
  //            <div className="flex-1 flex flex-col justify-center gap-10">
  //               {/* Target Text */}
  //               <div className="text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
  //                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Listen & Repeat</p>
  //                  <div className="text-2xl md:text-3xl font-medium leading-relaxed">
  //                     {chunks.map((chunk, idx) => (
  //                        <div 
  //                           key={idx} 
  //                           className={`inline-block transition-all duration-300 ${
  //                              idx === currentChunkIdx && !isQuestionFinished && !isSpeakingQuestion
  //                                 ? 'text-indigo-600 font-bold' 
  //                                 : idx < currentChunkIdx || isQuestionFinished
  //                                    ? 'text-slate-600' 
  //                                   : 'text-slate-300'
  //                           }`}
  //                        >
  //                           <QuestionMathJax content={chunk} />
  //                           {' '}
  //                        </div>
  //                     ))}
  //                  </div>
  //               </div>
  //
  //               {/* User Feedback */}
  //               {userTranscript && !isQuestionFinished && (
  //                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center mx-auto max-w-2xl w-full">
  //                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
  //                        <Mic className="w-3 h-3 text-rose-500" /> You said:
  //                     </p>
  //                     <p className="text-lg font-medium text-slate-700 italic">
  //                        "{userTranscript}"
  //                     </p>
  //                  </div>
  //               )}
  //
  //               {/* Playback UI when finished */}
  //               {isQuestionFinished && (
  //                  <div className="bg-green-50 p-6 rounded-2xl border border-green-200 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
  //                     <div className="flex flex-col items-center gap-4">
  //                        <div className="text-center">
  //                           <h4 className="font-bold text-green-800 text-lg mb-1">Great Job!</h4>
  //                           <p className="text-sm text-green-600">Listen to your complete response to analyze your fluency.</p>
  //                        </div>
  //                        <div className="w-full max-w-md bg-white p-4 rounded-xl border border-green-100 shadow-sm">
  //                           {recordedAudioUrl ? (
  //                              <audio src={recordedAudioUrl} controls className="w-full" />
  //                           ) : (
  //                              <div className="flex items-center justify-center h-12 text-slate-400">Processing audio...</div>
  //                           )}
  //                        </div>
  //                     </div>
  //                  </div>
  //               )}
  //            </div>
  //
  //            {/* Controls */}
  //            <div className="mt-8 flex items-center justify-center gap-6">
  //               {!isQuestionFinished ? (
  //                  <>
  //                     <button
  //                       onClick={handlePlayPause}
  //                       disabled={isListening}
  //                       className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
  //                         isPlaying 
  //                           ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 shadow-amber-200' 
  //                           : isListening 
  //                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
  //                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-1'
  //                       }`}
  //                     >
  //                       {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
  //                     </button>
  //
  //                     <button
  //                       onClick={handleNextChunk}
  //                       className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2 active:scale-95"
  //                     >
  //                        <span>{currentChunkIdx < chunks.length - 1 ? 'Next Chunk' : 'Finish Question'}</span>
  //                        <SkipForward className="w-5 h-5" />
  //                     </button>
  //                  </>
  //               ) : (
  //                  <>
  //                     <button
  //                       onClick={handleDiscard}
  //                       className="px-6 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 hover:-translate-y-1 transition-all active:scale-95"
  //                     >
  //                        Discard & Retry
  //                     </button>
  //
  //                     <button
  //                       onClick={proceedToNextQuestion}
  //                       className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:-translate-y-1 transition-all flex items-center gap-2 active:scale-95"
  //                     >
  //                        <span>{currentQuestionIdx < questions.length - 1 ? 'Proceed to Next Question' : 'End Session'}</span>
  //                        <SkipForward className="w-5 h-5" />
  //                     </button>
  //                  </>
  //               )}
  //            </div>
  //       </div>
  //     </div>
  //   </div>
  // );


  // NEW: Revamped Premium Light Theme UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-5">
          <button 
            onClick={onExit}
            className="group w-12 h-12 rounded-2xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-10 w-[1px] bg-slate-200"></div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">SpeakAlong <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Viva</span></h2>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{subjectName} • {currentQuestionIdx + 1} / {questions.length}</p>
            </div>
          </div>
        </div>
        
        {/* Settings/Controls */}
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 bg-slate-100/50 px-5 py-2.5 rounded-2xl border border-slate-200/50 min-w-[280px]">
               <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AI Speed</span>
               </div>
               <div className="flex-1 flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3.0" 
                    step="0.1" 
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-black text-indigo-600 w-8">{speechRate.toFixed(1)}x</span>
               </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2 shadow-inner">
            <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
            ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Question & Target */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Question Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BrainCircuit className="w-32 h-32 text-indigo-600" />
                   </div>
                   <div className="flex items-center gap-3 mb-6">
                      <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">Active Question</span>
                      {isSpeakingQuestion && (
                         <span className="flex items-center gap-1.5 text-indigo-500 animate-pulse font-bold text-[10px] uppercase">
                            <div className="w-1 h-1 rounded-full bg-indigo-500"></div> AI Speaking
                         </span>
                      )}
                   </div>
                   <div className={`text-2xl md:text-3xl font-bold transition-all duration-500 ${isSpeakingQuestion ? 'text-indigo-600 scale-[1.01]' : 'text-slate-800'} leading-[1.4]`}>
                     <QuestionMathJax content={question?.question_details?.question_latex} />
                   </div>
                </div>

                {/* Target Answer / Chunks Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col">
                     <div className="flex items-center justify-between mb-10">
                        <div className="flex flex-col gap-1">
                           <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Practice Phrase</h3>
                           <p className="text-sm font-bold text-slate-600">Listen carefully and repeat the highlighted part</p>
                        </div>
                        <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 text-xs font-black">
                           CHUNK {currentChunkIdx + 1} OF {chunks.length}
                        </div>
                     </div>

                     <div className="flex-1 min-h-[200px] flex flex-col justify-center">
                        <div className="text-2xl md:text-4xl font-medium leading-[1.6] tracking-tight">
                           {chunks.map((chunk, idx) => (
                              <div 
                                 key={idx} 
                                 className={`inline transition-all duration-500 px-1 rounded-lg ${
                                    idx === currentChunkIdx && !isQuestionFinished && !isSpeakingQuestion
                                       ? 'text-indigo-600 font-bold bg-indigo-50/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]' 
                                       : idx < currentChunkIdx || isQuestionFinished
                                          ? 'text-slate-400/60' 
                                          : 'text-slate-200'
                                 }`}
                              >
                                 <QuestionMathJax content={chunk} />
                                 {' '}
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Micro-Interaction for Voice */}
                     <div className="mt-10 h-12 flex items-center justify-center gap-1">
                        {isListening ? (
                           Array.from({ length: 12 }).map((_, i) => (
                              <div 
                                key={i}
                                className="w-1.5 bg-indigo-500 rounded-full animate-voice-bar"
                                style={{ 
                                    height: `${Math.random() * 100 + 20}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                              ></div>
                           ))
                        ) : isPlaying ? (
                           <div className="flex items-center gap-3 text-indigo-500 font-bold text-sm tracking-wide bg-indigo-50/50 px-6 py-2 rounded-full border border-indigo-100/50">
                              <Volume2 className="w-4 h-4 animate-bounce" />
                              AI is speaking...
                           </div>
                        ) : (
                           <div className="w-full h-[1px] bg-slate-100 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                           </div>
                        )}
                     </div>
                </div>
            </div>

            {/* Right Column: Interaction & Feedback */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
                
                {/* Control Center */}
                <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Session Control</span>
                           <h4 className="text-xl font-bold">Interactive Hub</h4>
                        </div>

                        {!isQuestionFinished ? (
                           <div className="flex flex-col items-center gap-5 w-full">
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
                                className="w-full py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 group"
                              >
                                 <span>{currentChunkIdx < chunks.length - 1 ? 'Next Chunk' : 'Finish Question'}</span>
                                 <SkipForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                           </div>
                        ) : (
                           <div className="flex flex-col gap-4 w-full">
                              <button
                                onClick={proceedToNextQuestion}
                                className="w-full py-6 bg-white text-indigo-600 font-black text-sm uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 hover:-translate-y-1"
                              >
                                 <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'End Session'}</span>
                                 <SkipForward className="w-5 h-5" />
                              </button>

                              <button
                                onClick={handleDiscard}
                                className="w-full py-4 bg-transparent border border-white/30 text-white font-bold text-xs rounded-2xl hover:bg-white/10 transition-all"
                              >
                                 Retry This Question
                              </button>
                           </div>
                        )}
                    </div>
                </div>

                {/* Status & Feedback Card */}
                <div className={`bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all duration-500 ${isListening ? 'ring-2 ring-rose-100' : ''}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Status</h5>
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : isPlaying ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`}></div>
                    </div>

                    <div className="min-h-[120px] flex flex-col justify-center gap-4">
                        {isListening ? (
                           <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                 <Mic className="w-5 h-5 text-rose-500" />
                                 <p className="text-sm font-bold text-rose-600">Recording your voice...</p>
                              </div>
                              <p className="text-lg font-medium text-slate-700 italic leading-relaxed">
                                 {userTranscript ? `"${userTranscript}"` : "Waiting for speech..."}
                              </p>
                           </div>
                        ) : isQuestionFinished ? (
                           <div className="flex flex-col items-center text-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 mb-2">
                                 <CheckCircle2 className="w-8 h-8" />
                              </div>
                              <div className="flex flex-col gap-1">
                                 <h6 className="font-black text-slate-800 uppercase tracking-tighter">Analysis Ready</h6>
                                 <p className="text-xs text-slate-500 font-medium">Listen to your complete response below</p>
                              </div>
                              {recordedAudioUrl && (
                                <div className="w-full bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <audio src={recordedAudioUrl} controls className="w-full h-10" />
                                </div>
                              )}
                           </div>
                        ) : (
                           <div className="flex flex-col items-center text-center text-slate-400 gap-3">
                              <AlertCircle className="w-10 h-10 opacity-20" />
                              <p className="text-sm font-medium">System is ready.<br/>AI will guide your practice.</p>
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>

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
