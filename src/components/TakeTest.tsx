import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  HelpCircle,
  PenTool,
  Upload,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Progress } from "../components/ui/progress";
import { useToast } from "../hooks/use-toast";

// Imported Data & Components
import { subjects, mcqQuestions, theoryQuestions } from "./test-series/data";
import { CustomTestGenerator, TestConfig } from "./test-series/components/CustomTestGenerator";
import { AvailableTestsList } from "./test-series/components/AvailableTestsList";
import { TestInstructionPage } from "./test-series/components/TestInstructionPage";
import { AssessmentDashboard } from "./AssessmentDashboard";
import { SectionDetailsPage } from "./test-series/components/SectionDetailsPage";
import { MCQExamScreen } from "./test-series/components/ExamScreens/MCQExamScreen";
import { AvailableTest } from "../services/TestServices";
import { ResultCountdown } from "./test-series/components/ResultCountdown";
import { Result } from "./Result";
import { TheoryExamScreen } from "./test-series/components/ExamScreens/TheoryExamScreen.tsx";
import { TheorySubmissionPage } from "./test-series/components/ExamScreens/TheorySubmissionPage";

export function TakeTest({ onBack, onNavigate }: { onBack: () => void, onNavigate?: (page: string) => void }) {
  const { toast } = useToast();

  // Helper to load state
  const loadLocalState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const [testMode, setTestMode] = useState<"setup" | "instructions" | "mcq" | "theory" | "result" | "section_details" | "section_exam" | "loading_exam" | "result-countdown" | "final-result" | "theory_exam" | "theory_submission" | "theory_result">(() => loadLocalState("takeTest_testMode", "setup"));
  const [activeTestConfig, setActiveTestConfig] = useState<TestConfig | null>(() => loadLocalState("takeTest_activeTestConfig", null));
  const [selectedTestForInstructions, setSelectedTestForInstructions] = useState<AvailableTest | null>(() => loadLocalState("takeTest_selectedTestForInstructions", null));
  const [activeTab, setActiveTab] = useState<"available" | "custom">(() => loadLocalState("takeTest_activeTab", "available"));

  // Persist states
  useEffect(() => {
    localStorage.setItem("takeTest_testMode", JSON.stringify(testMode));
    localStorage.setItem("takeTest_activeTestConfig", JSON.stringify(activeTestConfig));
    localStorage.setItem("takeTest_selectedTestForInstructions", JSON.stringify(selectedTestForInstructions));
    localStorage.setItem("takeTest_activeTab", JSON.stringify(activeTab));
  }, [testMode, activeTestConfig, selectedTestForInstructions, activeTab]);

  // Section Exam State
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [activeSectionName, setActiveSectionName] = useState<string>("");
  const [activeSectionData, setActiveSectionData] = useState<any[]>([]);

  // MCQ State
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isTestActive, setIsTestActive] = useState(false);

  // Theory State
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, boolean>>({});

  // Question Timer State
  const [attemptingQuestionId, setAttemptingQuestionId] = useState<number | null>(null);

  const [questionStartTimes, setQuestionStartTimes] = useState<Record<number, number>>({});
  const [questionDurations, setQuestionDurations] = useState<Record<number, number>>({});

  const handleTestSelect = (test: AvailableTest) => {
      setSelectedTestForInstructions(test);
      setTestMode("instructions");
  };

  const handleInstructionsBack = () => {
      setSelectedTestForInstructions(null);
      setTestMode("setup");
  };

  const handleAttemptStart = (questionId: number) => {
    if (attemptingQuestionId === questionId) return; // Already attempting
    
    // Stop previous attempt if exists
    if (attemptingQuestionId !== null) {
        const startTime = questionStartTimes[attemptingQuestionId];
        if (startTime) {
            const duration = (Date.now() - startTime) / 1000;
            setQuestionDurations(prev => ({ 
                ...prev, 
                [attemptingQuestionId]: (prev[attemptingQuestionId] || 0) + duration 
            }));
        }
    }

    setAttemptingQuestionId(questionId);
    setQuestionStartTimes(prev => ({ ...prev, [questionId]: Date.now() }));
    toast({
        title: "Timer Started",
        description: `Recording time for Question ${questionId}.`,
        duration: 1000
    });
  };

  const handleAttemptEnd = (questionId: number) => {
    if (attemptingQuestionId !== questionId) return;

    const startTime = questionStartTimes[questionId];
    if (startTime) {
        const duration = (Date.now() - startTime) / 1000; // in seconds
        setQuestionDurations(prev => ({ 
            ...prev, 
            [questionId]: (prev[questionId] || 0) + duration 
        }));
    }
    setAttemptingQuestionId(null);
  };

  const handleConfigSubmit = async (config: TestConfig) => {
      setActiveTestConfig(config);
      const method = config.assessmentMethod?.toUpperCase();
      const type = config.assessmentType?.toUpperCase();

      if (method === "MCQ") {
          if (type === "SECTION_WISE") {
              // Instructions -> Section Details
              setTestMode("section_details");
          } else {
              // Instructions -> MCQ Exam Screen (Direct) for STANDARD or other MCQ tests
              // If we have full exam details from the API, we use the premium MCQExamScreen
              if (config.fullExamDetails) {
                  console.log("Routing to MCQExamScreen with Details:", config.fullExamDetails);
                  
                  const firstSection = config.fullExamDetails?.sub_division_data?.[0];
                  setActiveSectionId(Number(firstSection?.sub_div_id || config.fullExamDetails?.user_ass_div_id || 0));
                  setActiveSectionName(firstSection?.sub_div_name || config.fullExamDetails?.assessment_name || "MCQ Assessment");
                  setActiveSectionData(config.fullExamDetails);
                  setTestMode("section_exam");
              } else {
                  // Fallback to internal/mock MCQ mode for custom-generated tests
                  console.log("Falling back to internal MCQ mode (no fullExamDetails)");
                  setTestMode("mcq");
                  setTimeLeft(config.duration * 60);
                  setIsTestActive(true);
              }
          }
      } else if (method === "TH" || config.testType === "theory") {
          // Instructions -> Theory Exam Screen
          setTestMode("theory_exam");
      } else {
          // AI or Fallback
          setTestMode(config.testType === "ai" ? "mcq" : config.testType as any);
          setTimeLeft(config.duration * 60);
          setIsTestActive(true);
      }
      // Reset states
      setCurrentMcqIndex(0);
      setSelectedMcqAnswers({});
      setShowExplanation(false);
      setUploadedFiles({});
      setAttemptingQuestionId(null);
      setQuestionDurations({});
  };

  // Timer and Anti-Cheat Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTestActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTestActive, timeLeft]);

  // Anti-Cheat: Visibility Change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTestActive) {
        // handleSubmitTest();
        console.warn("You switched tabs/windows during the test. This is a security violation.");
      }
    };

    const handleBlur = () => {
       if (isTestActive) {
            // handleSubmitTest();
            console.warn("Window focus lost. This is a security violation.");
       }
    };

    if (isTestActive) {
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isTestActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (questionId: number) => {
    // Simulate upload
    toast({
      title: "Uploading...",
      description: "Scanning and uploading your answer sheet.",
    });
    setTimeout(() => {
      setUploadedFiles(prev => ({ ...prev, [questionId]: true }));
      toast({
        title: "Upload Successful",
        description: "Answer sheet attached to Question " + questionId,
        variant: "default"
      });
    }, 1500);
  };

  const handleSubmitTest = () => {
    setIsTestActive(false);
    toast({
      title: "Test Submitted Successfully",
      description: "AI Evaluation complete. Generating report...",
    });
    
    // Simulate processing delay
    setTimeout(() => {
        setTestMode("result");
    }, 1500);
  };

  const handleCompleteExamMode = () => {
       // Called when a section-wise or mapped exam finishes completely
       // Set state so the countdown can use it
       setTestMode("result-countdown");
  };

  if (testMode === "result") {
      return (
          <Dialog open={true} onOpenChange={() => { setTestMode("setup"); setActiveTestConfig(null); }}>
              <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto">
                  <DialogHeader>
                      <DialogTitle>Evaluation Report</DialogTitle>
                      <DialogDescription>Your AI-generated performance analysis.</DialogDescription>
                  </DialogHeader>
                  <AssessmentDashboard 
                    onBack={() => { setTestMode("setup"); setActiveTestConfig(null); }} 
                  />
              </DialogContent>
          </Dialog>
      );
  }

  if (testMode === "instructions" && selectedTestForInstructions) {
      return (
          <TestInstructionPage 
              test={selectedTestForInstructions}
              onStartTest={handleConfigSubmit}
              onBack={handleInstructionsBack}
          />
      );
  }

  if (testMode === "loading_exam") {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading Secure Exam Environment...</p>
              </div>
          </div>
      );
  }

  if (testMode === "section_details") {
      return (
          <SectionDetailsPage 
              userAssessmentId={activeTestConfig?.userAssessmentId}
              assessmentName={selectedTestForInstructions?.assessment_name || "Section Assessment"}
              onStartSection={(sectionId, sectionName, sections) => {
                  setActiveSectionId(sectionId);
                  setActiveSectionName(sectionName);
                  setActiveSectionData(sections);
                  setTestMode("section_exam");
              }}
              onBack={() => setTestMode("instructions")}
          />
      );
  }

  if (testMode === "theory_exam") {
      return (
          <TheoryExamScreen 
            onComplete={() => setTestMode("theory_submission")}
            onExit={() => {
                setTestMode("setup");
                setActiveTestConfig(null);
            }}
          />
      );
  }

  if (testMode === "theory_submission") {
      return (
          <TheorySubmissionPage 
            onComplete={() => setTestMode("result-countdown")}
            onExit={() => {
                setTestMode("setup");
                setActiveTestConfig(null);
            }}
          />
      );
  }

  if (testMode === "section_exam" && activeSectionId !== null) {
      return (
          <div className="fixed inset-0 z-[9999] bg-white overflow-hidden w-screen h-screen">
            <MCQExamScreen 
                sectionId={activeSectionId}
                sectionName={activeSectionName}
                allSections={activeSectionData}
                userAssessmentId={activeTestConfig?.userAssessmentId}
                onSectionSubmit={(hasNext) => {
                     // If assessment type is STANDARD or MCQ (single section as requested), move to result countdown directly 
                     if (hasNext && activeTestConfig?.assessmentType?.toUpperCase() !== "STANDARD" && activeTestConfig?.assessmentType?.toUpperCase() !== "MCQ") {
                         // Return to section details to pick another section
                         setTestMode("section_details");
                     } else {
                         handleCompleteExamMode();
                     }
                }}
                onCompleteExam={() => handleCompleteExamMode()}
            />
          </div>
      );
  }

  // New Flows for Exam Results
  if (testMode === "result-countdown") {
      return (
          <ResultCountdown 
            userAssId={activeTestConfig?.userAssessmentId || 0} 
            onResultFetched={(data: any) => {
              // Pass the fetched data to next state
              // If assessment method is TH, we go to theory_result
              if (activeTestConfig?.assessmentMethod?.toUpperCase() === "TH") {
                  setTestMode("theory_result");
              } else {
                  setTestMode("final-result");
              }
            }} 
            onCancel={() => {
              setTestMode("setup");
              setActiveTestConfig(null);
            }}
          />
      )
  }

  if (testMode === "final-result" || testMode === "theory_result") {
      return (
          <Result 
            userAssId={activeTestConfig?.userAssessmentId || 0} 
            assessmentMethod={activeTestConfig?.assessmentMethod}
            onExit={() => {
                setTestMode("setup");
                setActiveTestConfig(null);
            }} 
          />
      );
  }

  if (testMode === "mcq") {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">MCQ Assessment</h1>
                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                        Physics: Light
                    </Badge>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className={`font-mono text-lg font-bold tabular-nums ${
                            timeLeft < 300 ? 'text-red-600 animate-pulse' : 
                            timeLeft < 600 ? 'text-amber-600' : 'text-slate-700'
                        }`}>
                            {formatTime(timeLeft)}
                        </span>
                        <Progress value={((currentMcqIndex + 1) / mcqQuestions.length) * 100} className="w-32 h-1.5" />
                    </div>
                    <Button variant="ghost" className="text-muted-foreground hover:text-red-600" onClick={() => {
                        setIsTestActive(false);
                        setTestMode("setup");
                        setActiveTestConfig(null);
                    }}>Exit</Button>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Question Card */}
            <Card className="border-0 shadow-xl shadow-slate-200/40 overflow-hidden ring-1 ring-slate-900/5">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                    <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question {currentMcqIndex + 1} of {mcqQuestions.length}</span>
                            <h2 className="text-xl font-semibold text-slate-900 leading-snug">
                                {mcqQuestions[currentMcqIndex].question}
                            </h2>
                         </div>
                         <div className="flex items-center gap-2">
                             <div 
                                onClick={() => handleAttemptStart(mcqQuestions[currentMcqIndex].id)}
                                className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    attemptingQuestionId === mcqQuestions[currentMcqIndex].id 
                                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-2' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                             >
                                <Clock className="w-3.5 h-3.5" />
                                {attemptingQuestionId === mcqQuestions[currentMcqIndex].id ? 'Recording Time...' : 'Start Timer'}
                             </div>
                         </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {/* Options Column */}
                        <div className="md:col-span-2 p-6 md:p-8 space-y-6">
                             <RadioGroup 
                               value={selectedMcqAnswers[currentMcqIndex]?.toString()} 
                               onValueChange={(val: string) => {
                                   handleAttemptEnd(mcqQuestions[currentMcqIndex].id); // Stop timer on answer
                                   setSelectedMcqAnswers(prev => ({...prev, [currentMcqIndex]: parseInt(val)}));
                                   setShowExplanation(true); // Show explanation immediately for demo
                               }}
                               className="space-y-4"
                            >
                               {mcqQuestions[currentMcqIndex].options.map((option, idx) => (
                                 <label 
                                    key={idx} 
                                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                                     selectedMcqAnswers[currentMcqIndex] === idx 
                                         ? idx === mcqQuestions[currentMcqIndex].correctAnswer 
                                             ? "bg-green-50/50 border-green-500 shadow-sm" 
                                             : "bg-red-50/50 border-red-500 shadow-sm"
                                         : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
                                 }`}
                                 >
                                   <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="sr-only" />
                                   <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors ${
                                        selectedMcqAnswers[currentMcqIndex] === idx
                                        ? idx === mcqQuestions[currentMcqIndex].correctAnswer ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600'
                                        : 'border-slate-300 group-hover:border-blue-500'
                                   }`}>
                                       {selectedMcqAnswers[currentMcqIndex] === idx && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                   </div>
                                   <span className={`text-base font-medium ${
                                        selectedMcqAnswers[currentMcqIndex] === idx ? 'text-slate-900' : 'text-slate-700'
                                   }`}>{option}</span>
                                   
                                   {/* Result Icons */}
                                   {selectedMcqAnswers[currentMcqIndex] !== undefined && idx === mcqQuestions[currentMcqIndex].correctAnswer && (
                                       <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-green-600 animate-in zoom-in" />
                                   )}
                                 </label>
                               ))}
                            </RadioGroup>
                        </div>

                        {/* Explanation / Extras Column */}
                        <div className="md:col-span-1 bg-slate-50/50 p-6 space-y-6">
                            <div className="text-center p-6 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
                                <div className="w-full aspect-square max-w-[140px] mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                    <div className="text-xs text-center p-2">QR Code<br/>Placeholder</div>
                                </div>
                                <p className="text-xs font-semibold text-slate-600">Scan for Video Solution</p>
                                <Button variant="link" className="h-auto p-0 text-xs mt-2 text-blue-600 hover:text-blue-700">
                                    <PlayCircle className="h-3 w-3 mr-1" /> Watch Video
                                </Button>
                            </div>

                            {showExplanation && (
                                <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-xl space-y-2 animate-in fade-in slide-in-from-right-4">
                                     <h4 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                                        <HelpCircle className="h-4 w-4" /> Explanation
                                     </h4>
                                     <p className="text-sm text-blue-800 leading-relaxed">
                                        When light travels from a rarer (less dense) to a denser medium, its speed decreases, causing it to bend towards the normal line.
                                     </p>
                                </div>
                            )}

                            {questionDurations[mcqQuestions[currentMcqIndex].id] && (
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium bg-white py-2 px-3 rounded-full border shadow-sm w-fit mx-auto">
                                    <Clock className="w-3 h-3" />
                                    Time Taken: {Math.round(questionDurations[mcqQuestions[currentMcqIndex].id])}s
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
                    <Button 
                        variant="outline" 
                        size="lg"
                        disabled={currentMcqIndex === 0}
                        onClick={() => {
                            setCurrentMcqIndex(prev => prev - 1);
                            setShowExplanation(selectedMcqAnswers[currentMcqIndex - 1] !== undefined);
                        }}
                        className="rounded-xl border-slate-300 hover:bg-white hover:border-slate-400 hover:text-slate-900"
                    >
                        Previous
                    </Button>
                    
                    {currentMcqIndex < mcqQuestions.length - 1 ? (
                        <Button 
                            size="lg"
                            onClick={() => {
                                setCurrentMcqIndex(prev => prev + 1);
                                setShowExplanation(selectedMcqAnswers[currentMcqIndex + 1] !== undefined);
                            }}
                            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 px-8"
                        >
                            Next Question <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button 
                            size="lg"
                            onClick={handleSubmitTest} 
                            className="rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 px-8"
                        >
                            Submit Test
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
      </div>
    );
  }

  if (testMode === "theory") {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans pb-24">
         {/* Sticky Header */}
         <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <div>
                     <h1 className="text-xl font-bold text-slate-900">Theory Examination</h1>
                     <p className="text-xs text-slate-500 font-medium">Subjective Pattern • Handwritten Uploads</p>
                </div>
                <div className="flex items-center gap-6">
                    <span className={`font-mono text-lg font-bold tabular-nums px-3 py-1 bg-slate-100 rounded-md ${
                        timeLeft < 300 ? 'text-red-600 animate-pulse bg-red-50' : 
                        timeLeft < 600 ? 'text-amber-600 bg-amber-50' : 'text-slate-700'
                    }`}>
                        {formatTime(timeLeft)}
                    </span>
                    <Button variant="ghost" className="text-muted-foreground hover:text-red-600" onClick={() => {
                        setIsTestActive(false);
                        setTestMode("setup");
                        setActiveTestConfig(null);
                    }}>Exit</Button>
                </div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Exam Header similar to board paper */}
            <div className="bg-white border rounded-2xl p-8 shadow-sm text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                
                <div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900">{subjects.find(s => s.id === activeTestConfig?.selectedSubject)?.name || "Subject"}</h2>
                    <p className="text-sm font-semibold text-slate-500 mt-1">Class 10 • {activeTestConfig?.selectedChapters.join(", ") || "Full Syllabus"}</p>
                </div>

                <div className="flex justify-center gap-8 text-sm font-medium text-slate-600 py-4 border-y border-dashed border-slate-200 w-fit mx-auto px-12">
                     <span>Max Marks: 80</span>
                     <span>•</span>
                     <span>Time: 2 Hours</span>
                </div>

                <div className="text-xs text-slate-500 max-w-lg mx-auto text-left bg-slate-50 p-4 rounded-lg">
                   <p className="font-bold mb-2">Instructions:</p>
                   <ul className="list-disc pl-4 space-y-1">
                       <li>Answer to this paper must be written on the paper provided separately.</li>
                       <li>You will not be allowed to write during the first 15 minutes.</li>
                       <li>This time is to be spent in reading the question paper.</li>
                   </ul>
                </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Section A (40 Marks)</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              
              {theoryQuestions.map((q, idx) => (
                  <Card key={q.id} className="border-0 shadow-md ring-1 ring-slate-200 overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                      
                      <CardHeader className="pb-2 pl-8">
                          <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-4 w-full">
                                  <span className="font-serif font-bold text-2xl text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">
                                      {String(idx + 1).padStart(2, '0')}
                                  </span>
                                  <div className="w-full">
                                      <div className="flex justify-between items-start">
                                          <CardTitle className="text-lg font-serif leading-relaxed text-slate-800">{q.question}</CardTitle>
                                          <Badge variant="secondary" className="ml-4 shrink-0 font-serif">
                                              {q.marks} Marks
                                          </Badge>
                                      </div>
                                      
                                      {/* Attempting Control */}
                                      <div className="flex items-center gap-4 mt-6">
                                          <button 
                                              onClick={() => handleAttemptStart(q.id)}
                                              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                                          >
                                             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                 attemptingQuestionId === q.id ? 'border-amber-500' : 'border-slate-300'
                                             }`}>
                                                  {attemptingQuestionId === q.id && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                                             </div>
                                             {attemptingQuestionId === q.id ? 'Recording Time...' : 'Start Attempt'}
                                          </button>

                                          {questionDurations[q.id] && (
                                              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                  {Math.round(questionDurations[q.id])}s
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent className="pl-20 pt-2 pr-8 pb-8">
                          {uploadedFiles[q.id] ? (
                              <div className="flex items-center gap-4 p-4 bg-green-50/50 border border-green-200 rounded-xl animate-in fade-in zoom-in-95">
                                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                      <CheckCircle2 className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-sm font-bold text-green-900">Answer Sheet Uploaded</p>
                                      <p className="text-xs text-green-700">answer_sheet_q{q.id}.jpg • 2.4 MB</p>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setUploadedFiles(prev => ({...prev, [q.id]: false}))}>
                                      Remove
                                  </Button>
                              </div>
                          ) : (
                              <div 
                                  onClick={() => {
                                      handleAttemptEnd(q.id);
                                      handleFileUpload(q.id);
                                  }}
                                  className="group/upload border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer"
                              >
                                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover/upload:scale-110 group-hover/upload:text-blue-500 transition-all">
                                      <Upload className="h-6 w-6" />
                                  </div>
                                  <p className="text-sm font-bold text-slate-700 mb-1">Upload Answer</p>
                                  <p className="text-xs text-slate-500 mb-4">Click to select image or PDF</p>
                                  <Button variant="outline" size="sm" className="rounded-full">
                                      <PenTool className="h-3 w-3 mr-2" /> Browse Files
                                  </Button>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              ))}
              
               <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] flex justify-between items-center z-20 -mx-6 px-6 md:rounded-t-2xl md:mx-0">
                  <div>
                      <p className="font-bold text-slate-900">{Object.keys(uploadedFiles).filter(k => uploadedFiles[Number(k)]).length} Questions Answered</p>
                      <p className="text-xs text-slate-500">Ensure all uploads are clear.</p>
                  </div>
                  <Button size="lg" onClick={handleSubmitTest} className="bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 px-8 hover:bg-slate-800">
                      Submit Paper
                  </Button>
              </div>
            </div>
          </div>
      </div>
    );
  }

  // Setup Mode - Modern Design
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 flex flex-col font-sans">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Take <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Test</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Challenge yourself with curated mock tests or build your own.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl border-slate-300" onClick={onBack}>
            Back to Dashboard
        </Button>
      </div>

      {/* Modern Segmented Tab Control */}
      <div className="space-y-8 flex-1">
        <div className="bg-white p-1.5 rounded-2xl inline-flex w-auto border border-slate-200 shadow-sm">
            <button 
                onClick={() => setActiveTab("available")}
                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 text-sm flex items-center gap-2 ${
                    activeTab === "available" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
                <div className={`w-2 h-2 rounded-full ${activeTab === "available" ? "bg-green-400" : "bg-slate-300"}`} />
                Available Tests
            </button>
            <button 
                onClick={() => setActiveTab("custom")}
                className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 text-sm flex items-center gap-2 ${
                    activeTab === "custom" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
                <div className={`w-2 h-2 rounded-full ${activeTab === "custom" ? "bg-blue-400" : "bg-slate-300"}`} />
                Custom Generator
            </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 min-h-[600px]">
            {activeTab === "available" && (
                <div className="outline-none h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AvailableTestsList 
                        onStartTest={handleConfigSubmit} 
                        onTestSelect={handleTestSelect}
                        onNavigate={onNavigate || (() => {})}
                    />
                </div>
            )}

            {activeTab === "custom" && (
                <div className="outline-none h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CustomTestGenerator onStartTest={handleConfigSubmit} />
                </div>
            )}
        </div>
      </div>
      
    </div>
  );
}