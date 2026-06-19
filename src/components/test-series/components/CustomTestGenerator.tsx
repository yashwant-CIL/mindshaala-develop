import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import { Slider } from "../../ui/slider";
// import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { 
  CheckCircle2, 
  FlaskConical, 
  Calculator, 
  Globe, 
  PenTool,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useToast } from "../../../hooks/use-toast";
import { subjects } from "../data";

export interface TestConfig {
    testType: "mcq" | "theory" | "ai" | "SECTION_WISE";
    selectedSubject: string;
    selectedChapters: string[];
    difficultyDistribution: { easy: number, medium: number, hard: number };
    totalMarks: number;
    duration: number;
    includePreviousWrong: boolean;
    randomizeOrder: boolean;
    userAssessmentId?: number | string;
    assessmentType?: string;
    assessmentMethod?: string;
    userImage?: string | null;
    fullExamDetails?: any;
}

interface CustomTestGeneratorProps {
    onStartTest: (config: TestConfig) => void;
}

export function CustomTestGenerator({ onStartTest }: CustomTestGeneratorProps) {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [testType, setTestType] = useState<"mcq" | "theory" | "ai" | "">("");
  
  // Configuration State
  const [difficultyDistribution, setDifficultyDistribution] = useState({ easy: 30, medium: 50, hard: 20 });
  const [totalMarks, setTotalMarks] = useState([20]);
  const [duration, setDuration] = useState([30]); // minutes
  const [includePreviousWrong, setIncludePreviousWrong] = useState(false);
  const [randomizeOrder, setRandomizeOrder] = useState(false);

  const handleStart = () => {
    if (testType === "ai") {
         onStartTest({
             testType: "ai",
             selectedSubject: "",
             selectedChapters: [],
             difficultyDistribution,
             totalMarks: totalMarks[0],
             duration: 30, // Default 30 mins for AI
             includePreviousWrong,
             randomizeOrder
         });
         return;
    }

    if (!selectedSubject || selectedChapters.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a subject and at least one chapter.",
        variant: "destructive"
      });
      return;
    }
    
    onStartTest({
        testType: testType as "mcq" | "theory",
        selectedSubject,
        selectedChapters,
        difficultyDistribution,
        totalMarks: totalMarks[0],
        duration: duration[0],
        includePreviousWrong,
        randomizeOrder
    });
  };

  return (
      <div className="grid gap-8 md:grid-cols-12">
         <div>
                     <h2 className="text-xl font-bold">Custom Generator Tests</h2>
                     <p className="text-muted-foreground text-sm">Configure your own test by selecting subjects, chapters, and format.</p>
                </div>
        <Card className="md:col-span-8">
            <CardHeader>
                <CardTitle>Configure Your Test</CardTitle>
                <CardDescription>Select subjects, chapters, and format.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* 1. Test Type Selection (including AI) */}
                <div className="space-y-3">
                    <Label className="text-base">1. Choose Test Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div 
                           onClick={() => setTestType("ai")}
                           className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${testType === "ai" ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/50"}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                               <Sparkles className="h-5 w-5 text-purple-500" />
                               <span className="font-semibold">AI Recommended</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Personalized test based on your weak areas and past performance.
                            </p>
                        </div>
                        <div 
                           onClick={() => setTestType("mcq")}
                           className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${testType === "mcq" ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/50"}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                               <CheckCircle2 className="h-5 w-5 text-blue-500" />
                               <span className="font-semibold">Custom MCQ</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Build your own objective test by selecting chapters.
                            </p>
                        </div>
                        <div 
                           onClick={() => setTestType("theory")}
                           className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${testType === "theory" ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/50"}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                               <PenTool className="h-5 w-5 text-orange-500" />
                               <span className="font-semibold">Theory Exam</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Subjective pattern with handwritten answer uploads.
                            </p>
                        </div>
                    </div>
                </div>

                {testType !== "ai" && (
                <>
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                        <Label className="text-base">2. Select Subject</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {subjects.map(sub => (
                                <div 
                                    key={sub.id} 
                                    onClick={() => {
                                        setSelectedSubject(sub.id);
                                        setSelectedChapters([]);
                                    }}
                                    className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${
                                        selectedSubject === sub.id 
                                        ? "bg-primary/10 border-primary ring-1 ring-primary" 
                                        : "hover:bg-secondary/50 border-input"
                                    }`}
                                >
                                    <div className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                                        selectedSubject === sub.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                                    }`}>
                                        {sub.id === "math" && <Calculator className="h-5 w-5" />}
                                        {sub.id === "phy" && <FlaskConical className="h-5 w-5" />}
                                        {sub.id === "chem" && <FlaskConical className="h-5 w-5" />}
                                        {sub.id === "hist" && <Globe className="h-5 w-5" />}
                                    </div>
                                    <span className="font-medium text-sm">{sub.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedSubject && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                            <Label className="text-base">3. Select Chapters & Topics</Label>
                            <ScrollArea className="h-[200px] border rounded-md p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {subjects.find(s => s.id === selectedSubject)?.chapters.map(chapter => (
                                        <div key={chapter} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={chapter} 
                                                checked={selectedChapters.includes(chapter)}
                                                onCheckedChange={(checked: any) => {
                                                    if (checked) setSelectedChapters([...selectedChapters, chapter]);
                                                    else setSelectedChapters(selectedChapters.filter(c => c !== chapter));
                                                }}
                                            />
                                            <Label htmlFor={chapter} className="font-normal cursor-pointer">{chapter}</Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-4">
                            <Label className="text-base flex justify-between">
                                4. Difficulty Distribution
                                <span className="text-xs text-muted-foreground font-normal">
                                    Total: {difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard}%
                                </span>
                            </Label>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Easy %</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            min={0} 
                                            max={100}
                                            value={difficultyDistribution.easy}
                                            onChange={(e) => setDifficultyDistribution(prev => ({...prev, easy: parseInt(e.target.value) || 0}))}
                                            className="h-8"
                                        />
                                    </div>
                                    <Slider 
                                        value={[difficultyDistribution.easy]} 
                                        onValueChange={(val: any) => setDifficultyDistribution(prev => ({...prev, easy: val[0]}))}
                                        max={100} 
                                        className="py-2"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Medium %</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            min={0} 
                                            max={100}
                                            value={difficultyDistribution.medium}
                                            onChange={(e) => setDifficultyDistribution(prev => ({...prev, medium: parseInt(e.target.value) || 0}))}
                                            className="h-8"
                                        />
                                    </div>
                                    <Slider 
                                        value={[difficultyDistribution.medium]} 
                                        onValueChange={(val: any) => setDifficultyDistribution(prev => ({...prev, medium: val[0]}))}
                                        max={100} 
                                        className="py-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Hard %</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            min={0} 
                                            max={100}
                                            value={difficultyDistribution.hard}
                                            onChange={(e) => setDifficultyDistribution(prev => ({...prev, hard: parseInt(e.target.value) || 0}))}
                                            className="h-8"
                                        />
                                    </div>
                                    <Slider 
                                        value={[difficultyDistribution.hard]} 
                                        onValueChange={(val: any) => setDifficultyDistribution(prev => ({...prev, hard: val[0]}))}
                                        max={100} 
                                        className="py-2"
                                    />
                                </div>
                            </div>

                            {(difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard) !== 100 && (
                                <p className="text-xs text-red-500 font-medium animate-pulse">
                                    Total percentage must equal 100% (Current: {difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard}%)
                                </p>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <Label className="text-base flex justify-between">
                                5. Exam Configuration
                            </Label>
                            <div className="space-y-4 border rounded-lg p-4 bg-secondary/10">
                                <div className="space-y-2">
                                   <div className="flex justify-between">
                                      <Label>Total Marks: {totalMarks}</Label>
                                   </div>
                                   <Slider 
                                        value={totalMarks} 
                                        onValueChange={setTotalMarks}
                                        min={10} 
                                        max={100} 
                                        step={10}
                                   />
                                </div>
                                <div className="space-y-2">
                                   <div className="flex justify-between">
                                      <Label>Duration: {duration} mins</Label>
                                   </div>
                                   <Slider 
                                        value={duration} 
                                        onValueChange={setDuration}
                                        min={10} 
                                        max={180} 
                                        step={10}
                                   />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="prevWrong" checked={includePreviousWrong} onCheckedChange={(c: any) => setIncludePreviousWrong(!!c)}/>
                                    <Label htmlFor="prevWrong" className="font-normal">Include previously incorrect questions</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="randomize" checked={randomizeOrder} onCheckedChange={(c: any) => setRandomizeOrder(!!c)}/>
                                    <Label htmlFor="randomize" className="font-normal">Randomize question order</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                )}

                <Button 
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-[0.98]" 
                    onClick={handleStart}
                    disabled={(testType !== "ai" && !selectedSubject) || (difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard) !== 100}
                >
                    Start Test Simulation
                </Button>
            </CardContent>
        </Card>

        {/* Sidebar Panel for Recommendations/Stats */}
        <div className="md:col-span-4 space-y-6">
             <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg">AI Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-background/50 rounded-lg border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-1">Strong Topics</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Force</Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Algebra</Badge>
                        </div>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-1">Needs Improvement</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">Trigonometry</Badge>
                            <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">Light</Badge>
                        </div>
                    </div>
                    <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                            "You tend to spend 20% more time on Trigonometry questions. We recommend a focused 15-min drill."
                        </p>
                        <Button variant="link" className="p-0 h-auto font-semibold text-primary mt-2">Create Drill &rarr;</Button>
                    </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-sm">Physics: Full Syllabus</p>
                                    <p className="text-xs text-muted-foreground">2 days ago • Score: 18/20</p>
                                </div>
                                <Badge>90%</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
             </Card>
        </div>
      </div>
  );
}
