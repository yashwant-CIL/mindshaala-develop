// import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  HelpCircle,
  PenTool,
  Upload,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState, useEffect } from "react";
import { Progress } from "./ui/progress";
// import qrCodeImage from "@assets/generated_images/qr_code_scan_simulation_for_answer_explanation.png";
import { useToast } from "../hooks/use-toast";
import { AssessmentDashboard } from "./AssessmentDashboard";

// Imported Data & Components
import { subjects, mcqQuestions, theoryQuestions } from "../components/test-series/data";
import { CustomTestGenerator, TestConfig } from "../components/test-series/components/CustomTestGenerator";
import { AvailableTestsList } from "../components/test-series/components/AvailableTestsList";
import { TestInstructionPage } from "../components/test-series/components/TestInstructionPage";
import { AvailableTest } from "../services/TestServices";

export default function TestSeries({ onNavigate, initialTest }: { onNavigate: (page: string) => void, initialTest?: AvailableTest | null }) {
  const { toast } = useToast();
  const [testMode, setTestMode] = useState<"setup" | "instructions" | "mcq" | "theory" | "result" | "SECTION_WISE">("setup");
  const [activeTestConfig, setActiveTestConfig] = useState<TestConfig | null>(null);
  const [selectedTestForInstructions, setSelectedTestForInstructions] = useState<AvailableTest | null>(null);

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
  
  useEffect(() => {
    if (initialTest) {
      setSelectedTestForInstructions(initialTest);
      setTestMode("instructions");
    }
  }, [initialTest]);

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

  const handleConfigSubmit = (config: TestConfig) => {
      setActiveTestConfig(config);
      setTestMode(config.testType === "ai" ? "mcq" : config.testType); // AI defaults to MCQ for now
      setTimeLeft(config.duration * 60);
      setIsTestActive(true);
      
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
        handleSubmitTest();
        toast({
          title: "Test Submitted Automatically",
          description: "You switched tabs/windows during the test. This is a security violation.",
          variant: "destructive"
        });
      }
    };

    const handleBlur = () => {
       if (isTestActive) {
            handleSubmitTest();
            toast({
              title: "Test Submitted Automatically",
              description: "Window focus lost. This is a security violation.",
              variant: "destructive"
            });
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

  // Mock Result Data for Modal (MCQ)
  const mockResultData = {
    title: "Physics: Light (MCQ)",
    type: "mcq" as const,
    score: 18,
    totalMarks: 20,
    accuracy: 90,
    percentile: 95,
    timeTaken: "25m 30s",
    totalTime: "30m 00s",
    correct: 18,
    incorrect: 2,
    unattempted: 0,
    topics: [
      { name: "Refraction", score: 8, total: 8 },
      { name: "Snell's Law", score: 6, total: 8 },
      { name: "Lenses", score: 4, total: 4 }
    ],
    retention: [
        { day: "Day 1", recall: 100, classAvg: 90 },
        { day: "Day 3", recall: 92, classAvg: 70 },
        { day: "Day 7", recall: 88, classAvg: 50 }
    ]
  };

  // Mock Result Data for Modal (Theory)
  const mockTheoryResultData = {
    title: "Physics: Light (Theory)",
    type: "theory" as const,
    score: 15,
    totalMarks: 20,
    accuracy: 75,
    percentile: 88,
    timeTaken: "55m 00s",
    totalTime: "1h 00s",
    correct: 0, // Not applicable for theory in same way
    incorrect: 0,
    unattempted: 0,
    topics: [
      { name: "Refraction", score: 5, total: 7 },
      { name: "Lenses", score: 10, total: 13 }
    ],
    retention: [],
    theoryDetails: [
        {
            questionId: 1,
            question: "State Snell's Law of refraction. Define refractive index.",
            maxMarks: 3,
            awardedMarks: 2.5,
            feedback: "Definition of Snell's Law is accurate. The formula for refractive index is correct, but you missed specifying that it is for a given pair of media. Good diagram.",
            tags: ["Concept Clear", "Minor Omission"],
            modelAnswer: "Snell's law states that the ratio of the sine of the angle of incidence to the sine of the angle of refraction is a constant... Refractive index is..."
        },
        {
            questionId: 2,
            question: "Draw a ray diagram to show the formation of image by a convex lens when the object is placed between F and 2F.",
            maxMarks: 4,
            awardedMarks: 3,
            feedback: "Ray diagram is drawn correctly with arrows. The image position is slightly off - it should be beyond 2F. Labeling is neat.",
            tags: ["Diagram Good", "Precision Error"],
            modelAnswer: "Diagram showing object between F and 2F, rays converging beyond 2F on the other side to form a real, inverted and magnified image."
        }
    ]
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

  if (testMode === "mcq") {
    // ... existing mcq render

    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-heading">MCQ Assessment</h1>
            <div className="flex items-center gap-4">
               <span className={`text-sm font-mono px-3 py-1 rounded ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-secondary'}`}>
                   Time Left: {formatTime(timeLeft)}
               </span>
               <Button variant="outline" onClick={() => {
                   setIsTestActive(false);
                   setTestMode("setup");
                   setActiveTestConfig(null);
               }}>Exit Test</Button>
            </div>
          </div>

          <Card className="min-h-[400px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div className="space-y-1">
                 <CardTitle>Question {currentMcqIndex + 1} of {mcqQuestions.length}</CardTitle>
                 <Progress value={((currentMcqIndex + 1) / mcqQuestions.length) * 100} className="w-[200px] h-2" />
               </div>
               <Badge variant="outline">Physics: Light</Badge>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                   {/* Attempting Radio for MCQ */}
                   <div className="flex items-center gap-4 mb-6 p-4 bg-muted/20 rounded-lg border border-dashed">
                       <div className="flex items-center space-x-2">
                           <div 
                                onClick={() => handleAttemptStart(mcqQuestions[currentMcqIndex].id)}
                                className={`h-5 w-5 rounded-full border border-primary flex items-center justify-center cursor-pointer ${attemptingQuestionId === mcqQuestions[currentMcqIndex].id ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                           >
                                {attemptingQuestionId === mcqQuestions[currentMcqIndex].id && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                           </div>
                           <Label className="font-semibold cursor-pointer" onClick={() => handleAttemptStart(mcqQuestions[currentMcqIndex].id)}>
                                Attempting this Question
                           </Label>
                       </div>
                       
                       {attemptingQuestionId === mcqQuestions[currentMcqIndex].id && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                                <Clock className="h-3 w-3" /> Recording Time...
                            </span>
                       )}

                       {questionDurations[mcqQuestions[currentMcqIndex].id] && (
                           <span className="text-xs text-muted-foreground ml-auto">
                               Total time: {Math.round(questionDurations[mcqQuestions[currentMcqIndex].id])}s
                           </span>
                       )}
                   </div>

                   <p className="text-lg font-medium leading-relaxed mb-6">{mcqQuestions[currentMcqIndex].question}</p>

                   <RadioGroup 
                      value={selectedMcqAnswers[currentMcqIndex]?.toString()} 
                      onValueChange={(val: string) => {
                          handleAttemptEnd(mcqQuestions[currentMcqIndex].id); // Stop timer on answer
                          setSelectedMcqAnswers(prev => ({...prev, [currentMcqIndex]: parseInt(val)}));
                          setShowExplanation(true); // Show explanation immediately for demo
                      }}
                      className="space-y-3"
                   >
                      {mcqQuestions[currentMcqIndex].options.map((option, idx) => (
                        <div key={idx} className={`flex items-center space-x-2 border p-4 rounded-lg transition-colors cursor-pointer ${
                            selectedMcqAnswers[currentMcqIndex] === idx 
                                ? idx === mcqQuestions[currentMcqIndex].correctAnswer 
                                    ? "bg-green-50 border-green-200" 
                                    : "bg-red-50 border-red-200"
                                : "hover:bg-secondary/50"
                        }`}>
                          <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                          <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-normal text-base">{option}</Label>
                          {selectedMcqAnswers[currentMcqIndex] !== undefined && idx === mcqQuestions[currentMcqIndex].correctAnswer && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      ))}
                   </RadioGroup>
                </div>

                <div className="border-t pt-8 md:border-t-0 md:pt-0 md:border-l md:pl-8 space-y-6">
                    <div className="text-center p-4 bg-secondary/20 rounded-xl border border-dashed">
                        {/* <img src={qrCodeImage} alt="Scan for Explanation" className="w-32 h-32 mx-auto mb-3 opacity-80 mix-blend-multiply dark:mix-blend-normal dark:invert" /> */}
                        <div className="w-32 h-32 mx-auto mb-3 bg-gray-200 flex items-center justify-center text-xs text-muted-foreground">QR Code Placeholder</div>
                        <p className="text-xs text-muted-foreground font-medium">Scan for Video Explanation</p>
                        <Button variant="link" className="h-auto p-0 text-xs mt-2 gap-1 text-primary">
                            <PlayCircle className="h-3 w-3" /> Watch Video
                        </Button>
                    </div>
                    
                    {showExplanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm space-y-2 animate-in fade-in slide-in-from-right-4">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" /> Explanation
                            </h4>
                            <p className="text-blue-700 dark:text-blue-300">
                                When light travels from a rarer (less dense) to a denser medium, its speed decreases, causing it to bend towards the normal line. This is a fundamental property of refraction.
                            </p>
                        </div>
                    )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
                <Button 
                    variant="outline" 
                    disabled={currentMcqIndex === 0}
                    onClick={() => {
                        setCurrentMcqIndex(prev => prev - 1);
                        setShowExplanation(selectedMcqAnswers[currentMcqIndex - 1] !== undefined);
                    }}
                >
                    Previous
                </Button>
                {currentMcqIndex < mcqQuestions.length - 1 ? (
                    <Button onClick={() => {
                        setCurrentMcqIndex(prev => prev + 1);
                        setShowExplanation(selectedMcqAnswers[currentMcqIndex + 1] !== undefined);
                    }}>
                        Next Question
                    </Button>
                ) : (
                    <Button onClick={handleSubmitTest} className="bg-green-600 hover:bg-green-700">Submit Test</Button>
                )}
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (testMode === "theory") {
    return (
      <div className="p-6">
         <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-heading">Theory Examination</h1>
            <div className="flex items-center gap-4">
               <span className={`text-sm font-mono px-3 py-1 rounded ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-secondary'}`}>
                   Time Left: {formatTime(timeLeft)}
               </span>
               <Button variant="outline" onClick={() => {
                   setIsTestActive(false);
                   setTestMode("setup");
                   setActiveTestConfig(null);
               }}>Exit Test</Button>
            </div>
          </div>
          
          {/* Exam Header similar to board paper */}
          <div className="bg-white dark:bg-zinc-900 border p-8 shadow-sm text-center space-y-2 mb-8">
              <h2 className="text-xl font-bold uppercase tracking-wider">{subjects.find(s => s.id === activeTestConfig?.selectedSubject)?.name || "Subject"} - Class 10</h2>
              <p className="text-sm font-medium text-muted-foreground">Maximum Marks: 80 • Time Allowed: 2 Hours</p>
              <div className="text-xs text-muted-foreground mt-4 max-w-2xl mx-auto text-left list-disc">
                 <p><strong>Instructions:</strong></p>
                 <p>1. Answer to this paper must be written on the paper provided separately.</p>
                 <p>2. You will not be allowed to write during the first 15 minutes.</p>
                 <p>3. This time is to be spent in reading the question paper.</p>
              </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-sm font-bold text-muted-foreground uppercase">Section A (40 Marks)</span>
                <div className="h-px bg-border flex-1"></div>
            </div>
            
            {theoryQuestions.map((q, idx) => (
                <Card key={q.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                                <span className="font-serif font-bold text-lg shrink-0">
                                    {idx + 1}.
                                </span>
                                <div className="w-full">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-serif leading-relaxed">{q.question}</CardTitle>
                                        <CardDescription className="mt-1 font-serif text-xs text-right whitespace-nowrap ml-4">[{q.marks} Marks]</CardDescription>
                                    </div>
                                    
                                    {/* Attempting Radio for Theory */}
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleAttemptStart(q.id)}>
                                           <div 
                                                className={`h-5 w-5 rounded-full border border-primary flex items-center justify-center ${attemptingQuestionId === q.id ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                                           >
                                                {attemptingQuestionId === q.id && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                                           </div>
                                           <Label className="font-semibold cursor-pointer">
                                                Attempting
                                           </Label>
                                        </div>

                                        {attemptingQuestionId === q.id && (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                                                <Clock className="h-3 w-3" /> Recording...
                                            </span>
                                        )}

                                        {questionDurations[q.id] && (
                                            <span className="text-xs text-muted-foreground">
                                                Time taken: {Math.round(questionDurations[q.id])}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-10 pt-2">
                        {uploadedFiles[q.id] ? (
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Answer Sheet Uploaded</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">answer_sheet_q{q.id}.jpg • 2.4 MB</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 h-8 hover:text-red-700" onClick={() => setUploadedFiles(prev => ({...prev, [q.id]: false}))}>
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-secondary rounded-lg p-6 text-center hover:bg-secondary/20 transition-colors">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm font-medium text-muted-foreground mb-4">Upload handwritten answer</p>
                                <Button variant="outline" size="sm" onClick={() => {
                                    handleAttemptEnd(q.id); // Stop timer on upload start/click
                                    handleFileUpload(q.id);
                                }}>
                                    <PenTool className="h-4 w-4 mr-2" /> Select Image / PDF
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            
             <div className="sticky bottom-6 bg-background/80 backdrop-blur-md p-4 border rounded-lg shadow-lg flex justify-between items-center z-10">
                <div>
                    <p className="font-semibold">2 of {theoryQuestions.length} Questions Answered</p>
                    <p className="text-xs text-muted-foreground">Ensure all uploads are clear before submitting.</p>
                </div>
                <Button size="lg" onClick={handleSubmitTest} className="shadow-lg shadow-primary/20">
                    Submit Paper for AI Evaluation
                </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Setup Mode - Tabs Implementation
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Test Series</h1>
          <p className="text-muted-foreground">Practice with mock tests or generate your own.</p>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="available" className="px-8 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!shadow-md transition-all">Available Tests</TabsTrigger>
            <TabsTrigger value="custom" className="px-8 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!shadow-md transition-all">Custom Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="outline-none">
            <AvailableTestsList 
                onStartTest={handleConfigSubmit} 
                onTestSelect={handleTestSelect}
                onNavigate={onNavigate}
            />
        </TabsContent>

        <TabsContent value="custom" className="outline-none">
             <CustomTestGenerator onStartTest={handleConfigSubmit} />
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
