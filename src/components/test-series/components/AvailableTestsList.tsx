import { Clock, FileText, BarChart, ArrowRight, Trophy, BookOpen, Target, Loader2, CheckCircle2, Lock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useState, useEffect, forwardRef } from "react";
import { TestConfig } from "./CustomTestGenerator";
import { Combobox } from "../../../components/ui/combobox";
import { useToast } from "../../../hooks/use-toast";
import { TestService, AvailableTest } from "../../../services/TestServices"; 
import { useCourse } from "../../../context/CourseContext";
import Cookies from 'js-cookie';

interface AvailableTestsListProps {
    onStartTest: (config: TestConfig) => void;
    onTestSelect: (test: AvailableTest) => void;
    onNavigate: (page: string) => void;
}

export const AvailableTestsList = forwardRef<HTMLDivElement, AvailableTestsListProps>(({ onStartTest, onTestSelect, onNavigate }, ref) => {
    const { toast } = useToast();
    const { selectedCourse, subscriptionId, packageId } = useCourse();
    const [filterMode, setFilterMode] = useState<"mock" | "subject" | "chapter" | "pyq">("mock");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    
    const [tests, setTests] = useState<AvailableTest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [chapterList, setChapterList] = useState<any[]>([]);
     const userId = localStorage.getItem('user_id') || Cookies.get("user_id"); 

    // Initial load for Mock mode
    useEffect(() => {
        if (filterMode === "mock") {
            fetchMockTests();
        } else {
            // Reset for other modes until selection
            setTests([]);
            setSelectedSubject(""); // Reset selection
            setSelectedTopic("");
        }
    }, [filterMode, selectedCourse, subscriptionId, packageId]);

    // Fetch Subjects when subscriptionId is available
    useEffect(() => {
        const fetchSubjects = async () => {
            if (subscriptionId) {
                try {
                    const data = await TestService.getSubjects(subscriptionId);
                    setSubjectList(data);
                } catch (error) {
                    console.error("Failed to fetch subjects", error);
                    toast({
                        title: "Error",
                        description: "Failed to load subjects.",
                        variant: "destructive"
                    });
                }
            }
        };
        fetchSubjects();
    }, [subscriptionId]);


    const fetchMockTests = async () => {
        setIsLoading(true);
        try {
            // const userId = localStorage.getItem('user_id') || Cookies.get("user_id"); 
            
            if (!subscriptionId || !packageId) {
                console.log("No course/package selected in AvailableTestsList:", { subscriptionId, packageId });
                setTests([]);
                setIsLocked(true);
                setIsLoading(false);
                return;
            }
            setIsLocked(false);

            const rawTests = await TestService.getMockTests(userId, subscriptionId, packageId);
            setTests(rawTests);

        } catch (error) {
            console.error("Failed to fetch mock tests", error);
            toast({
                title: "Error fetching tests",
                description: "Could not load mock exams. Using local fallback.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubjectTests = async (subId: string) => {
        setIsLoading(true);
        setTests([]);
        try {
            // const userId = 100087; 
            if (!packageId) return;
            const data = await TestService.getSubjectTests(userId, packageId, subId);
            setTests(data);
        } catch (error) {
             console.error("Failed to fetch subject tests", error);
             toast({ title: "Error", description: "Failed to load subject tests.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChapterTests = async (chapId: string) => {
        setIsLoading(true);
        setTests([]);
        try {
            // const userId = 100087;
            if (!packageId) return;
            const data = await TestService.getChapterTests(userId, packageId, chapId);
            setTests(data);
        } catch (error) {
             console.error("Failed to fetch chapter tests", error);
             toast({ title: "Error", description: "Failed to load chapter tests.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };


    // Effect to trigger fetches based on selection
    useEffect(() => {
        if ((filterMode === 'subject' || filterMode === 'pyq') && selectedSubject) {
             fetchSubjectTests(selectedSubject);
        } else if (filterMode === 'chapter' && selectedSubject && selectedTopic) {
             fetchChapterTests(selectedTopic);
        }
    }, [selectedSubject, selectedTopic, filterMode]);

    const handleSubjectChange = async (subjectId: string) => {
        setSelectedSubject(subjectId);
        setSelectedTopic("");
        setChapterList([]); // Clear previous chapters

        if (subjectId) {
            try {
                const chapters = await TestService.getChapters(subjectId);
                setChapterList(chapters);
            } catch (error) {
                console.error("Failed to fetch chapters", error);
                toast({
                    title: "Error",
                    description: "Failed to load chapters.",
                    variant: "destructive"
                });
            }
        }
    };

    // const currentSubjectData = subjects.find(s => s.id === selectedSubject);

    // Prepare Options for Combobox
    // const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));
    const subjectOptions = subjectList.map((s: any) => ({ value: s.subject_id.toString(), label: s.subject_name }));
    // const topicOptions = currentSubjectData?.chapters.map(c => ({ value: c, label: c })) || [];
    const topicOptions = chapterList.map((c: any) => ({ value: c.chapter_id.toString(), label: c.chapter_name }));

    const handleStartClick = (test: AvailableTest) => {
        // Navigate to instructions page instead of immediate start
        if (onTestSelect) {
            console.log("Navigating to instructions for test:", test.assessment_id);
            onTestSelect(test);
        } else {
             console.warn("onTestSelect not provided, preventing fallback for debug.");
             // Fallback commented out to ensure we don't accidentally skip instructions
             
            const config: TestConfig = {
                testType: "mcq",
                selectedSubject: test.subject,
                selectedChapters: test.topic ? [test.topic] : [], 
                difficultyDistribution: { 
                    easy: test.difficulty === 'Easy' ? 60 : 30, 
                    medium: test.difficulty === 'Medium' ? 60 : 50, 
                    hard: test.difficulty === 'Hard' ? 60 : 20 
                },
                totalMarks: test.marks,
                duration: test.duration,
                includePreviousWrong: false,
                randomizeOrder: true
            };
            onStartTest(config);
            
        }
    };

    const displayTests = (tests || []).filter(test => {
        const name = (test.assessment_name || test.title || "").toUpperCase();
        if (filterMode === 'subject') {
            return !name.startsWith("PYQ");
        }
        if (filterMode === 'pyq') {
            return name.startsWith("PYQ");
        }
        return true;
    });

    return (
        <div ref={ref} className="space-y-8 animate-in fade-in duration-500">
            {/* ... EXISTING HEADER ... */}
            <div className="flex flex-col gap-2 pb-6 ">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Available Tests
                </h2>
                <p className="text-muted-foreground text-base">
                    Select a category below to browse and attempt tests tailored to your preparation.
                </p>
            </div>
            
            {/* ... EXISTING FILTER TYPE SELECTION ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'mock', label: 'Mock Exams', desc: 'Full syllabus simulations', icon: Trophy, from: 'from-orange-500', to: 'to-amber-500', bgHover: 'hover:bg-orange-50/50', iconColor: 'text-orange-600', shadow: 'shadow-orange-500/20' },
                    { id: 'subject', label: 'Subject-wise', desc: 'Focus on specific subjects', icon: BookOpen, from: 'from-blue-500', to: 'to-cyan-500', bgHover: 'hover:bg-blue-50/50', iconColor: 'text-blue-600', shadow: 'shadow-blue-500/20' },
                    { id: 'chapter', label: 'Chapter-wise', desc: 'Master specific topics', icon: Target, from: 'from-purple-500', to: 'to-fuchsia-500', bgHover: 'hover:bg-purple-50/50', iconColor: 'text-purple-600', shadow: 'shadow-purple-500/20' },
                    { id: 'pyq', label: 'PYQ', desc: 'Previous Year Papers', icon: FileText, from: 'from-emerald-500', to: 'to-teal-500', bgHover: 'hover:bg-emerald-50/50', iconColor: 'text-emerald-600', shadow: 'shadow-emerald-500/20' }
                ].map((mode) => {
                    const isActive = filterMode === mode.id;
                    return (
                        <div 
                            key={mode.id}
                            onClick={() => { setFilterMode(mode.id as any); setSelectedSubject(""); setSelectedTopic(""); }}
                            className={`
                                relative group cursor-pointer rounded-2xl p-6 transition-all duration-500 overflow-hidden
                                ${isActive 
                                    ? `bg-white shadow-xl scale-[1.02] ring-2 ring-offset-2 ring-transparent ring-offset-white border-transparent` 
                                    : `bg-white border border-slate-200 shadow-sm ${mode.bgHover} hover:shadow-lg hover:-translate-y-1`
                                }
                            `}
                        >
                            {/* Active State Gradient Border Setup */}
                            {isActive && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${mode.from} ${mode.to} opacity-10`} />
                            )}
                            
                            {/* Animated Background blob on hover */}
                            <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${mode.from} ${mode.to} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />

                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className={`
                                        p-3.5 rounded-2xl transition-all duration-300
                                        ${isActive 
                                            ? `bg-gradient-to-br ${mode.from} ${mode.to} text-white shadow-lg ${mode.shadow}` 
                                            : `bg-slate-50 ${mode.iconColor} group-hover:bg-white group-hover:shadow-md`
                                        }
                                    `}>
                                        <mode.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    
                                    <div className={`
                                        h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300
                                        ${isActive ? `bg-gradient-to-br ${mode.from} ${mode.to} text-white shadow-sm` : 'bg-slate-100 text-slate-300 opacity-0 group-hover:opacity-100'}
                                    `}>
                                        <CheckCircle2 className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className={`font-bold text-lg tracking-tight mb-1 transition-colors duration-300
                                        ${isActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}
                                    `}>
                                        {mode.label}
                                    </h3>
                                    <p className={`text-sm leading-relaxed transition-colors duration-300
                                        ${isActive ? 'text-slate-600 font-medium' : 'text-slate-500'}
                                    `}>
                                        {mode.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${mode.from} ${mode.to}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ... EXISTING DYNAMIC INPUT AREA ... */}
            {(filterMode === 'subject' || filterMode === 'chapter' || filterMode === 'pyq') && (
                <div className="bg-slate-50/80 p-6 rounded-2xl border border-dashed border-slate-200 flex flex-row md:flex-row gap-6 items-end animate-in fade-in slide-in-from-top-4 duration-500 shadow-inner">
                    <div className="w-full md:w-72 ">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Select Subject</label>
                        <Combobox 
                            options={subjectOptions}
                            value={selectedSubject} 
                            onValueChange={handleSubjectChange}
                            placeholder="Select Subject..."
                            searchPlaceholder="Search subject..."
                            className="!bg-white border-slate-200"
                            listClassName="!max-h-[200px] !overflow-y-auto block"
                            avoidCollisions={false}
                        />
                    </div>

                    {filterMode === 'chapter' && (
                        <div className="w-full md:w-72 space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
                             <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Select Chapter</label>
                            <Combobox 
                                options={topicOptions}
                                value={selectedTopic}
                                onValueChange={setSelectedTopic}
                                disabled={!selectedSubject}
                                placeholder={!selectedSubject ? "Select Subject First" : "Select Chapter..."}
                                searchPlaceholder="Search chapter..."
                                className="!bg-white border-slate-200"
                                listClassName="!max-h-[200px] !overflow-y-auto block"
                                avoidCollisions={false}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Test Grid - USING displayTests */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {isLoading ? (
                     <div className="col-span-full py-32 flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-2xl border border-dashed">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/60" />
                        <p className="text-lg font-medium text-slate-600">Finding best tests for you...</p>
                     </div>
                ) : displayTests.length > 0 ? (
                    displayTests.map((test) => (
                        <div 
                            key={test.assessment_id} 
                            className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                        >
                            {/* Card Top Accent */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                 <div className="flex justify-between items-start gap-2">
                                     <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                                        {/* {subjects.find(s => s.id === test.subject)?.name || test.subject} */}
                                        {test.assessment_method}
                                    </span>
                                    {test.completion_status === "SUBMITTED" && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 animate-in fade-in zoom-in duration-300">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Completed
                                        </span>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {test.assessment_name || test.title}
                                    </h3>
                                    {test.topic && (
                                        <p className="text-sm text-slate-500 mt-1 font-medium">{test.topic}</p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="my-1 border-t border-slate-100" />

                                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 font-medium">
                                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                        <FileText className="h-4 w-4 mb-1 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span>{test.total_question} Qs</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                        <Clock className="h-4 w-4 mb-1 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span>{test.total_time} mins</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                        <BarChart className="h-4 w-4 mb-1 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span>{test.total_marks} Marks</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 pt-2 bg-white">
                                {test.completion_status === "SUBMITTED" ? (
                                    <button 
                                        disabled
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-3 px-4 rounded-xl font-semibold border border-emerald-100 cursor-not-allowed"
                                    >
                                        Assessment Completed
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleStartClick(test)}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-indigo-500/25 active:scale-[0.98]"
                                    >
                                        Start Assessment
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : isLocked ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 animate-in zoom-in-95 duration-500">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                            <div className="relative h-24 w-24 bg-amber-50 rounded-2xl flex items-center justify-center border-2 border-amber-100 shadow-lg group">
                                <Lock className="h-12 w-12 text-amber-600 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            Subscription Required
                        </h3>
                        <p className="max-w-md mx-auto text-slate-500 text-base leading-relaxed mb-8 font-medium">
                             This content is exclusive to subscribed students. Subscribe to this course to unlock expert-designed mock exams and practice tests.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                                variant="outline" 
                                className="w-full rounded-xl"
                                onClick={() => {
                                    if (typeof onNavigate === 'function') {
                                        onNavigate('my-courses');
                                    } else {
                                        console.error('onNavigate is not a function');
                                    }
                                }}
                            >
                                View Subscription Plans
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-50/50 to-white rounded-3xl border border-dashed border-slate-200">
                        <div className="relative mb-6 group">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative h-20 w-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300">
                                <BookOpen className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors duration-300" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {(() => {
                                if (!selectedSubject && filterMode !== 'mock') {
                                    return filterMode === 'chapter' ? "Selection Required" : "Subject Required";
                                }
                                if (filterMode === 'chapter' && selectedSubject && !selectedTopic) {
                                    return "Chapter Required";
                                }
                                return "No test found here";
                            })()}
                        </h3>
                        <p className="max-w-md mx-auto text-slate-500 text-sm leading-relaxed mb-6">
                             {(() => {
                                 if (filterMode === 'mock') return "It looks like there are no active tests in this category yet. Try exploring other subjects or check back later!";
                                 
                                 if (!selectedSubject) {
                                     if (filterMode === 'subject') return "please select the subject first";
                                     if (filterMode === 'chapter') return "first select the subject then select the chapter";
                                     if (filterMode === 'pyq') return "select the subject first";
                                 }
                                 
                                 if (filterMode === 'chapter' && !selectedTopic) return "please select the chapter";
                                 
                                 return "No test found here";
                             })()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

AvailableTestsList.displayName = "AvailableTestsList";
