import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { 
  Clock, 
  Loader2, 
  AlertCircle, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  ChevronRight,
  BookOpen,
  Maximize,
  X,
  MousePointerClick,
  ArrowLeftRight,
  ArrowRight,
  Edit3,
  UploadCloud,
  HelpCircle
} from "lucide-react";
import { useToast } from "../../../../hooks/use-toast";
import { TestService } from "../../../../services/TestServices";
import { useCourse } from "../../../../context/CourseContext";
import QuestionMathJax from "../../../../shared/mathjaxconfig/QuestionMathJax";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { getDeterministicShuffle } from "../../../../shared/utils/ShuffleUtils";

interface TheoryExamScreenProps {
  onComplete: () => void;
  onSkipSubmission?: () => void;
  onExit?: () => void;
}

export function TheoryExamScreen({ onComplete, onSkipSubmission, onExit }: TheoryExamScreenProps) {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const { userAssId } = useCourse();
  const effectiveUserAssId = userAssId || (location.state as any)?.user_ass_id;
  
  const [questionPaperData, setQuestionPaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isTypeset, setIsTypeset] = useState(false);
  
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  
  const [startTime, setStartTime] = useState<string | null>(null);
  const [matchShuffles, setMatchShuffles] = useState<Record<string, string[]>>({});

  const checkTokenAvailability = (): boolean => {
    const token = Cookies.get("token") || localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token || !token.trim() || token === "undefined" || token === "null") {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Session expired please login again.",
      });
      localStorage.clear();
      Cookies.remove("token");
      Cookies.remove("user_id");
      Cookies.remove("username");
      localStorage.setItem("currentStep", JSON.stringify("login"));
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
      return false;
    }
    return true;
  };

  useEffect(() => {
    setStartTime(new Date().toISOString());
  }, []);

  // API Call to fetch questions
  const fetchQuestions = async () => {
    if (!checkTokenAvailability()) {
      setLoading(false);
      return;
    }

    if (!effectiveUserAssId) {
      setError("User Assessment ID not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await TestService.getTheoryExamQuestions(effectiveUserAssId.toString());
      if (data) {
        setQuestionPaperData(data);
        const totalMinutes = parseInt(data.total_time) || 30;
        setHours(Math.floor(totalMinutes / 60));
        setMinutes(totalMinutes % 60);
        setSeconds(0);
        setIsTimerStarted(true);
      } else {
        setError("No question data received from the server.");
      }
    } catch (err: any) {
      console.error("Error fetching theory questions:", err);
      if (err.message === "Network Error") {
        setError("Network Error: Could not reach the server. Please check your WiFi connection, firewall, or try a different network (like a mobile hotspot).");
      } else {
        setError(err.message || "Failed to load question paper. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionPaperData?.section_data) {
        const newShuffles: Record<string, string[]> = {};
        questionPaperData.section_data.forEach((section: any) => {
            if (!section.question_data) return;
            let i = 0;
            const questions = section.question_data;
            while(i < questions.length) {
                if (questions[i].question_type_name === "Match the following") {
                    const groupId = questions[i].question_id;
                    const group = [questions[i]];
                    let j = i + 1;
                    while(j < questions.length && questions[j].question_type_name === "Match the following") {
                        group.push(questions[j]);
                        j++;
                    }
                    if (!matchShuffles[groupId]) {
                        const original = group.map(q => q.answer_description);
                        const seed = `${effectiveUserAssId}-${groupId}`;
                        newShuffles[groupId] = getDeterministicShuffle(original, seed);
                    }
                    i = j;
                } else {
                    i++;
                }
            }
        });
        if (Object.keys(newShuffles).length > 0) {
            setMatchShuffles(prev => ({ ...prev, ...newShuffles }));
        }
    }
  }, [questionPaperData]);

  useEffect(() => {
    fetchQuestions();
  }, [effectiveUserAssId]);

  // Enhance LaTeX rendering synchronization
  useEffect(() => {
    if (!loading && questionPaperData) {
      // Small delay to ensure the hidden DOM is populated before typesetting
      const timer = setTimeout(async () => {
        // @ts-ignore
        if (window.MathJax && window.MathJax.typesetPromise) {
          try {
            const target = hiddenContainerRef.current;
            if (target) {
              // @ts-ignore
              await window.MathJax.typesetPromise([target]);
              console.log("TheoryExam: LaTeX rendering complete.");
            }
          } catch (err) {
            console.error("TheoryExam: LaTeX typesetting failed:", err);
          } finally {
            setIsTypeset(true);
          }
        } else {
          // Fallback if MathJax is not yet loaded or not present
          console.warn("TheoryExam: MathJax not found, skipping sync.");
          setIsTypeset(true);
        }
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [loading, questionPaperData]);

  // Security Restrictions
  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({ title: "Restricted Action", description: "Right-click is disabled during the exam!", variant: "destructive" });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || (e.key >= "F1" && e.key <= "F12")) {
        e.preventDefault();
        toast({ title: "Restricted Action", description: "Keyboard shortcuts are prohibited!", variant: "destructive" });
      }
    };

    const handleBlur = () => {
      toast({ title: "Security Alert", description: "Switching tabs/windows is prohibited!", variant: "destructive" });
    };

    window.addEventListener("contextmenu", disableContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    // Push state to block back button
    window.history.pushState(null, "", window.location.href);
    const blockBack = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
      toast({ title: "Restricted Action", description: "Back button is disabled!", variant: "destructive" });
    };
    window.addEventListener("popstate", blockBack);

    return () => {
      window.removeEventListener("contextmenu", disableContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("popstate", blockBack);
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!isTimerStarted) return;

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(s => s - 1);
      } else if (minutes > 0) {
        setMinutes(m => m - 1);
        setSeconds(59);
      } else if (hours > 0) {
        setHours(h => h - 1);
        setMinutes(59);
        setSeconds(59);
      } else {
        clearInterval(timer);
        autoSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hours, minutes, seconds, isTimerStarted]);

  // Alert at 5 and 1 minute
  useEffect(() => {
    if (isTimerStarted && hours === 0 && seconds === 0) {
      if (minutes === 5) toast({ title: "Time Warning", description: "5 minutes remaining!" });
      if (minutes === 1) toast({ title: "Time Warning", description: "1 minute remaining!", variant: "destructive" });
    }
  }, [minutes, hours, seconds, isTimerStarted]);

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (onExit) {
      onExit();
    } else {
      navigate("/dashboard");
    }
  };

  const enterFullScreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    enterFullScreen();
  }, []);

  // Submission Logic
  const getFormattedTimeTaken = () => {
    if (!startTime) return "0:00";
    const start = new Date(startTime);
    const end = new Date();
    const diffSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
    const m = Math.floor(diffSeconds / 60);
    const s = diffSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleFinalSubmit = async (uploadType: "MANUAL" | "AUTO", isSelfCheck: boolean = false) => {
    console.log(`TheoryExam: handleFinalSubmit started (${uploadType}, selfCheck: ${isSelfCheck}). effectiveUserAssId:`, effectiveUserAssId);
    
    if (!effectiveUserAssId) {
        console.error("TheoryExam: Cannot submit - effectiveUserAssId is missing!");
        if (isSelfCheck && onSkipSubmission) onSkipSubmission();
        else onComplete();
        return;
    }
    
    setSubmitting(true);
    const ass_end_time = new Date().toISOString();
    const formattedTimeTaken = getFormattedTimeTaken();

    const payload = {
        user_ass_id: effectiveUserAssId.toString(),
        assessment_id: (questionPaperData?.assessment_id || "").toString(),
        ass_start_time: startTime || "",
        assessment_status: "SUBMITTED",
        time_taken: formattedTimeTaken,
        ass_end_time: ass_end_time
    };

    console.log("Submission Payload (JSON):", payload);
    try {
      const response = await TestService.submitTheoryExam(payload, effectiveUserAssId.toString());
      console.log("Submission Response:", response);
      if (response) {
        Swal.fire({
          title: "Exam Submitted",
          text: "Your exam has been submitted directly. You can now self-evaluate your performance.",
          icon: "success",
          confirmButtonColor: "#4f46e5"
        }).then(() => {
          if (onSkipSubmission) {
            onSkipSubmission();
          } else {
            onComplete();
          }
        });
      }
    } catch (err) {
      console.error("Submission failed:", err);
      if (onSkipSubmission) {
        onSkipSubmission();
      } else {
        onComplete();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    console.log("TheoryExam: confirmSubmit click detected.");
    
    if (effectiveUserAssId) {
      localStorage.setItem("userAssId", effectiveUserAssId.toString());
    }

    if (typeof Swal === 'undefined') {
        console.error("TheoryExam: Swal is not defined! Navigating to submission portal directly.");
        if (effectiveUserAssId) localStorage.setItem("userAssId", effectiveUserAssId.toString());
        onComplete();
        return;
    }

    Swal.fire({
      title: "Proceed to Submission Portal?",
      text: "You will be redirected to upload your answer sheets or enter your matching/subjective responses.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "Back to Question Paper",
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#64748b",
      returnFocus: true,
    }).then((result: any) => {
      if (result === true || (result && result.isConfirmed)) {
        console.log("TheoryExam: Confirmation received. Navigating to submission portal...");
        if (effectiveUserAssId) localStorage.setItem("userAssId", effectiveUserAssId.toString());
        onComplete();
      }
    });
  };

  const confirmSelfCheckSubmit = () => {
    console.log("TheoryExam: confirmSelfCheckSubmit click detected.");

    if (typeof Swal === 'undefined') {
        console.error("TheoryExam: Swal is not defined! Check imports.");
        return;
    }

    Swal.fire({
      title: "Submit Directly for Self Check?",
      text: "Are you sure you want to finish the exam without submitting answers? You will proceed directly to self-evaluate your responses.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit Directly",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      returnFocus: true,
    }).then((result: any) => {
      if (result === true || (result && result.isConfirmed)) {
        console.log("TheoryExam: Self check confirmation received. Submitting directly...");
        handleFinalSubmit("MANUAL", true);
      }
    });
  };

  const autoSubmit = () => {
    console.log("TheoryExam: autoSubmit triggered (Time Up). Navigating to submission portal.");
    onComplete();
  };

  // Rendering Helpers
  const renderQuestionWrapper = (question: any, index: number) => {
    return (
      <div key={question.question_id} className="bg-white border border-slate-200 rounded-[20px] p-8 mb-8 transition-all duration-300 relative overflow-hidden hover:shadow-xl hover:border-slate-300 group">
        <div className="absolute top-0 left-0 w-1 h-0 bg-gradient-to-b from-indigo-600 to-blue-500 transition-all duration-300 group-hover:h-full"></div>
        
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm shrink-0">
                {index + 1}
              </span>
              {/* <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{question.question_type_name}</span> */}
            <div className="text-lg font-medium text-slate-900 leading-relaxed pt-0.5">
              <QuestionMathJax content={question.question_latex} skipInternalLoading={true} />
            </div>
            </div>
            
            {question.question_diagrams_url && question.question_diagrams_url.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4">
                {question.question_diagrams_url.map((url: string, dIdx: number) => (
                  <img
                    key={`${question.question_id}-diag-${dIdx}`}
                    src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${url}`}
                    alt={`Diagram ${dIdx + 1}`}
                    className="max-w-full h-auto rounded-xl border border-slate-200 shadow-sm"
                    style={{ maxHeight: "300px" }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="bg-slate-100 text-slate-600 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider h-fit whitespace-nowrap">
            {question.marks} {question.marks > 1 ? "Marks" : "Mark"}
          </div>
        </div>

        {question.question_type_name === "Theory mcq 1 marks" && renderMCQOptions(question)}
        {question.question_type_name === "Assertion&Reasoning" && renderMCQOptions(question)}
      </div>
    );
  };

  const renderQuestionList = (questions: any[]) => {
    const rendered: React.ReactNode[] = [];
    let i = 0;
    while (i < questions.length) {
      const q = questions[i];
      if (q.question_type_name === "Match the following") {
        // Find contiguous match questions
        const matchGroup = [q];
        let j = i + 1;
        while (j < questions.length && questions[j].question_type_name === "Match the following") {
          matchGroup.push(questions[j]);
          j++;
        }
        rendered.push(
            <div key={`match-group-${q.question_id}`} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    {/* <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <BookOpen className="w-5 h-5" />
                    </div> */}
                    <div>
                        {/* <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Match the Following</h4> */}
                        <p className="text-[14px] text-slate-900 font-bold tracking-tight">Match Column I with the correct entries in Column A</p>
                    </div>
                </div>
                {renderMatchGroup(matchGroup)}
            </div>
        );
        i = j;
      } else {
        rendered.push(renderQuestionWrapper(q, i));
        i++;
      }
    }
    return rendered;
  };

  const renderMatchGroup = (questions: any[]) => {
    const alphabets = (i: number) => String.fromCharCode(65 + i);
    const groupId = questions[0].question_id;
    // Use persisted shuffle if available, otherwise fallback (should be initialized in useEffect)
    const shuffledAnswers = matchShuffles[groupId] || questions.map(q => q.answer_description);

    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 tracking-[0.1em]">Column I</h4>
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={`left-${idx}`} className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col shadow-sm">
                <div className="flex items-start">
                  <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded text-xs font-bold mr-3 shrink-0">{idx + 1}</span>
                  <div className="text-sm text-slate-700 font-medium pt-0.5">
                     <QuestionMathJax content={q.question_latex} skipInternalLoading={true} />
                  </div>
                </div>
                {q.question_diagrams_url && q.question_diagrams_url.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 ml-9">
                    {q.question_diagrams_url.map((url: string, dIdx: number) => (
                      <img
                        key={`${q.question_id}-diag-${dIdx}`}
                        src={`${import.meta.env.VITE_API_URL}/api/v1/cil/images/${url}`}
                        alt="Diagram"
                        className="max-w-full h-auto rounded-lg border border-slate-100"
                        style={{ maxHeight: "150px" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 tracking-[0.1em]">Column A</h4>
          <div className="space-y-3">
            {shuffledAnswers.map((ans, idx) => (
              <div key={`right-${idx}`} className="bg-white border border-slate-200 p-3 rounded-xl flex items-start shadow-sm">
                <span className="w-6 h-6 flex items-center justify-center bg-slate-100 border border-slate-200 rounded text-xs font-bold mr-3 text-slate-600 shrink-0">{alphabets(idx)}</span>
                <div className="text-sm text-slate-700 font-medium whitespace-pre-wrap pt-0.5">
                  <QuestionMathJax content={ans} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMCQOptions = (question: any) => {
    const options = [
      question.option1_latex,
      question.option2_latex,
      question.option3_latex,
      question.option4_latex,
      question.option5_latex,
    ].filter(Boolean);

    return (
      <div className="mt-6 space-y-3 ml-10">
        {options.map((opt, i) => (
          <div key={`opt-${i}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <span className="font-bold text-blue-600/50">{String.fromCharCode(65 + i)})</span>
            <div className="text-slate-700">
              <QuestionMathJax content={opt} skipInternalLoading={true} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderComprehensionSection = (section: any) => {
    return (
      <div key={section.assessment_section_id} className="mb-16">
        <div className="border-l-4 border-indigo-600 pl-6 mt-12 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800">
              Section {section.section_number}: {section.section_heading}
            </h2>
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-600">Total: {section.section_total_marks} Marks</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[20px] p-8 mb-10 relative overflow-hidden">
          {/* Decorative quote mark */}
          <div className="absolute top-[-10px] right-[30px] text-[80px] text-blue-600 opacity-10 font-serif pointer-events-none">"</div>
          <h3 className="flex items-center gap-2 font-bold text-blue-700 mb-4 uppercase tracking-widest text-sm">
            <BookOpen className="w-4 h-4" /> Reading Passage
          </h3>
          <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed italic">
            <QuestionMathJax content={section.passage_text} />
          </div>
        </div>

        <div className="pl-6 space-y-8 border-l-2 border-slate-100">
          {section.question_data && renderQuestionList(section.question_data)}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const rawApiInstructions = 
      questionPaperData?.instructions || 
      questionPaperData?.instruction_data || 
      questionPaperData?.instructions_data || 
      questionPaperData?.exam_details?.instructions || 
      [];

    const defaultGeneralInstructions = [
      "All questions are mandatory.",
      "Review all questions before submitting.",
      "Keep your handwritten answers ready for upload.",
      "Avoid switching tabs or closing the window."
    ];

    const generalInstructionsList = Array.isArray(rawApiInstructions) && rawApiInstructions.length > 0
      ? rawApiInstructions.map((inst: any) => typeof inst === 'string' ? inst : (inst.instruction_name || inst.instruction_text || inst.description || JSON.stringify(inst)))
      : defaultGeneralInstructions;

    return (
    <div className="fixed inset-0 z-[50] bg-slate-50 font-outfit overflow-y-auto">
        {/* Navbar */}
        <nav className="fixed top-0 w-full z-[100] h-20 flex items-center justify-between px-8 text-white backdrop-blur-xl bg-slate-900/90 border-b border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight truncate max-w-[200px] md:max-w-md">{questionPaperData?.assessment_name || "Theory Exam"}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">{questionPaperData?.exam_details?.subject || "Online Test"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-1.5 font-mono tracking-wider shadow-inner flex items-center gap-3">
              <Clock className={`w-5 h-5 ${minutes < 5 && hours === 0 ? "text-red-400 animate-pulse" : "text-blue-400"}`} />
              <span className="text-xl font-bold tabular-nums">
                {hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-slate-800 rounded-full"
                onClick={handleExit}
                title="Cancel & Exit"
            >
                <X className="w-5 h-5" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-slate-800 rounded-full hidden md:flex"
                onClick={enterFullScreen}
                title="Full Screen"
            >
                <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </nav>

        {/* Content */}
        <div className="pt-32 pb-24 px-4 md:px-12 mx-auto">
          <div className="bg-white border border-slate-200 rounded-[24px] shadow-2xl overflow-hidden transition-all duration-500">
            {/* Exam info header */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 md:p-12 text-white relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <FileText className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-6 px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] font-bold">Official Examination</Badge>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{questionPaperData?.assessment_name}</h2>
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Duration: {questionPaperData?.total_time} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium">Max Marks: {questionPaperData?.total_marks}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium">Read instructions carefully</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-12">
              {/* PREVIOUS ORIGINAL INSTRUCTIONS UI (COMMENTED OUT AS REQUESTED) */}
              {/* 
              <div className="mb-12 bg-blue-50/50 border border-blue-100/50 p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                   <AlertCircle className="w-24 h-24" />
                </div>
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" /> General Instructions
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    "All questions are mandatory.",
                    "Review all questions before submitting.",
                    "Keep your handwritten answers ready for upload.",
                    "Avoid switching tabs or closing the window."
                  ].map((inst, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
                      <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>
              */}

              {/* System Instructions / How to Attempt & General Rules */}
              <div className="mb-12 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-100/80 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <HelpCircle className="w-32 h-32 text-indigo-900" />
                </div>
                
                <h3 className="font-extrabold text-indigo-950 flex items-center gap-2.5 text-lg">
                  <PlayCircle className="w-6 h-6 text-indigo-600" />
                  <span>Exam Instructions & Guidelines</span>
                </h3>

                {/* 1. How to Attempt Questions */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900/70 mb-3">How to Attempt Questions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Guideline 1: Choice / MCQ / T&F */}
                    <div className="bg-white/90 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-indigo-100/80 shadow-sm flex items-start gap-3.5">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                        <MousePointerClick className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm mb-1">MCQ, True/False & Choice</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Select the correct option directly on the <span className="font-semibold text-amber-700">Submission Portal</span>.
                        </p>
                      </div>
                    </div>

                    {/* Guideline 2: Match the Following */}
                    <div className="bg-white/90 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-indigo-100/80 shadow-sm flex items-start gap-3.5">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                        <ArrowLeftRight className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm mb-1">Match the Following</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Write the correct matching answer in the input box provided on the <span className="font-semibold text-amber-700">Submission Portal</span>.
                        </p>
                      </div>
                    </div>

                    {/* Guideline 3: Fill in the blanks */}
                    <div className="bg-white/90 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-indigo-100/80 shadow-sm flex items-start gap-3.5">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0 mt-0.5">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm mb-1">Fill in the Blanks</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Write your answer with the complete sentence.
                        </p>
                      </div>
                    </div>

                    {/* Guideline 4: Theory & Subjective */}
                    <div className="bg-white/90 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-indigo-100/80 shadow-sm flex items-start gap-3.5">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0 mt-0.5">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm mb-1">Theory Questions</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Write your answer on paper and submit a photo of the answer sheet on the <span className="font-semibold text-amber-700">Submission Portal</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. General Exam Rules / API Instructions */}
                <div className="pt-5 border-t border-indigo-100/80">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900/70 mb-3">General Examination Rules</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {generalInstructionsList.map((instText: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-indigo-950 font-medium">
                        <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                        <span>{instText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Questions Area */}
              <div ref={contentRef}>
                {questionPaperData.section_data
                  ?.slice()
                  .sort((a: any, b: any) => (a.section_number ?? 0) - (b.section_number ?? 0))
                  .map((section: any) => {
                    if (section.question_type_name?.toLowerCase() === "comprehension") {
                      return renderComprehensionSection(section);
                    }
                    return (
                      <div key={section.assessment_section_id} className="mb-16">
                        <div className="border-l-4 border-indigo-600 pl-6 mt-12 mb-6">
                          <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-800">
                              Section {section.section_number}: {section.section_heading}
                            </h2>
                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span className="text-xs font-bold text-slate-600">Total: {section.section_total_marks} Marks</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-8">
                          {section.question_data && renderQuestionList(section.question_data)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          
          {/* Action Footer */}
          <div className="mt-12 flex flex-col md:flex-row justify-center gap-6 pb-12">
            <Button
              onClick={confirmSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold h-14 px-10 rounded-2xl shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                  <span>Proceed to Submission Portal</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={confirmSelfCheckSubmit}
              disabled={submitting}
              className="h-14 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-2xl px-10 font-bold transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Submit Directly</span>
            </Button>
          </div>
        </div>
      </div>
  );
};

  return (
    <>
      {/* Loading Overlay - Overlays the entire screen */}
      {(loading || !isTypeset) && (
        <div className="fixed inset-0 z-[9999] bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Preparing your question paper...</p>
            {/* <p className="text-xs text-slate-400 mt-2">Compulsory LaTeX Rendering in progress...</p> */}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="fixed inset-0 z-[9999] bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md bg-white p-8 rounded-[2rem] shadow-xl text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Paper</h3>
            <p className="text-slate-500 mb-8">{error}</p>
            <Button onClick={fetchQuestions} className="w-full h-14 bg-slate-900 text-white rounded-2xl">Retry Loading</Button>
          </div>
        </div>
      )}

      {/* Main Content - Always rendered, but hidden until typeset is ready */}
      <div 
        ref={hiddenContainerRef} 
        aria-hidden={!isTypeset}
        /* @ts-ignore - inert is a valid HTML attribute but may need @ts-ignore in some TS versions */
        inert={!isTypeset ? "true" : undefined}
        className={`transition-opacity duration-300 ${(!loading && isTypeset && !error) ? 'opacity-100' : 'opacity-0 pointer-events-none fixed'}`}
      >
        {questionPaperData && renderContent()}
      </div>
    </>
  );
}
