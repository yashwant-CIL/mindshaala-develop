import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Lock, Clock, FileText, CheckCircle2, PlayCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { TestService } from '../../../services/TestServices';
import { useCourse } from '../../../context/CourseContext'

interface SubDivision {
    sub_div_id: number;
    sub_div_name: string;
    total_marks: string;
    total_time: string;
    unlock_status: string | boolean;
    total_question?: number;
}

interface SectionDetailsPageProps {
    userAssessmentId?: number | string;
    assessmentName: string;
    onStartSection: (sectionId: number, sectionName: string, prefetchedData: any) => void;
    onBack?: () => void;
}

export function SectionDetailsPage({ userAssessmentId, assessmentName, onStartSection, onBack }: SectionDetailsPageProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [sections, setSections] = useState<SubDivision[]>([]);
    const [assName, setAssName] = useState(assessmentName || "Section-Wise Assessment");
    const [startingSectionId, setStartingSectionId] = useState<number | null>(null);
    const { userAssId } = useCourse();
    
    useEffect(() => {
        console.log("userAssId", userAssId);
        const fetchSections = async () => {
            try {
                // const storedToken = Cookies.get('token') || localStorage.getItem('token');
                // const storedUserId = Cookies.get('user_id') || localStorage.getItem('user_id');

                // if (!storedToken || !storedUserId) {
                //     toast({
                //         title: "Authentication Required",
                //         description: "Please login to view assessment details.",
                //         variant: "destructive"
                //     });
                //     return;
                // }

                // Get user_ass_id
                const userAssIdToUse = userAssId;
                if (!userAssIdToUse) {
                    toast({
                        title: "Error",
                        description: "Assessment ID not found.",
                        variant: "destructive"
                    });
                    setIsLoading(false);
                    return;
                }

                const data = await TestService.getSectionDetails(userAssIdToUse);
                console.log("Section Details API Response:", data);

                if (data) {
                    setAssName(data.assessment_name);
                    
                    if (data.section_details) {
                         const formattedSections: SubDivision[] = data.section_details.map((sec: any) => ({
                             sub_div_id: sec.ass_div_id,
                             sub_div_name: sec.ass_div_name,
                             section_details: sec.ass_div_desc,
                             total_marks: sec.total_marks,
                             total_question: sec.total_questions,
                             total_time: sec.total_time,
                             unlock_status: sec.unlock_status // Default to locked if undefined
                         }));
                         console.log("formattedSections", formattedSections);
                         // Determine unlock logic: If API doesn't return unlock_status, manually unlock first
                        //  if (formattedSections.length > 0 && formattedSections[0].unlock_status === undefined) {
                        //      formattedSections[0].unlock_status = 1;
                        //  }

                         setSections(formattedSections);
                    }
                }
            } catch (error) {
                console.error("Error fetching section details:", error);
                // Fallback mock data for demonstration purposes if API fails
                // setSections([
                //     { sub_div_id: 1, sub_div_name: "Physics", total_marks: "50", total_time: "60", unlock_status: 1 },
                //     { sub_div_id: 2, sub_div_name: "Chemistry", total_marks: "50", total_time: "60", unlock_status: 0 },
                //     { sub_div_id: 3, sub_div_name: "Mathematics", total_marks: "100", total_time: "90", unlock_status: 0 }
                // ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSections();
    }, [userAssessmentId]);

    const handleStart = async (section: SubDivision) => {
        const isUnlocked = section.unlock_status === true ;
        if (!isUnlocked) {
            toast({
                title: "Section Locked",
                description: "You must complete previous sections to unlock this one.",
                variant: "destructive"
            });
            return;
        }

        try {
            setStartingSectionId(section.sub_div_id);
            if (!userAssessmentId) {
                 throw new Error("Missing Assessment ID");
            }
            // Fetch live API data before transitioning
            const response = await TestService.getExamQuestions(userAssessmentId);
            console.log("getQuestions API Response (Pre-fetched):", response);
            
            // Pass the API response payload downstream to SectionExamScreen
            onStartSection(section.sub_div_id, section.sub_div_name, response);
        } catch (error) {
            console.error("Error starting exam section:", error);
            toast({
                title: "Error Starting Section",
                description: "Failed to load exam questions. Please try again.",
                variant: "destructive"
            });
        } finally {
            setStartingSectionId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-lg font-medium text-slate-600">Loading your examination details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500 font-sans flex flex-col">
            {/* Elegant Dark Header Area */}
            <div className="bg-slate-900 pt-8 pb-32 px-6 md:px-8 relative overflow-hidden shrink-0">
                {/* Subtle Header Accents */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-900 to-slate-900 pointer-events-none"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-8">
                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        {onBack && (
                            <Button variant="link" className="text-slate-400 hover:text-white pl-0 transition-colors tracking-wide text-sm font-medium" onClick={onBack}>
                                &larr; Return to Instructions
                            </Button>
                        )}
                        <span className="text-teal-400 uppercase tracking-[0.2em] text-[10px] font-bold border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 rounded-sm">
                            Examination Structure
                        </span>
                    </div>

                    {/* Titles */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl">
                                {assName}
                            </h1>
                            <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
                                Review the sections below. You must complete each module sequentially to advance through the assessment.
                            </p>
                        </div>
                        
                        {/* Status Summary */}
                        <div className="flex bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden shrink-0 backdrop-blur-sm">
                            <div className="px-5 py-4 flex flex-col items-center justify-center border-r border-slate-700/50 min-w-[100px]">
                                <span className="text-2xl font-black text-white">{sections.length}</span>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Modules</span>
                            </div>
                            <div className="px-5 py-4 flex flex-col items-center justify-center min-w-[100px]">
                                <span className="text-2xl font-black text-teal-400">{sections.filter(s => s.unlock_status === true).length}</span>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Unlocked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Overlapping the Header */}
            <div className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-8 -mt-20 relative z-20 pb-20">
                <div className="flex flex-col space-y-6 md:space-y-8">
                    {sections.map((section, index) => {
                        const isUnlocked = section.unlock_status === true;
                        const isCompleted = false; // Logic for completed needs implementation based on actual API data
                        const isLocked = !isUnlocked && !isCompleted;

                        return (
                            <div 
                                key={section.sub_div_id}
                                className={`group relative bg-white rounded-2xl md:rounded-[2rem] overflow-hidden transition-all duration-300 ${
                                    isUnlocked ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 hover:-translate-y-1" :
                                    isCompleted ? "shadow-sm ring-1 ring-emerald-900/5 bg-emerald-50/10" :
                                    "shadow-sm ring-1 ring-slate-900/5 opacity-80"
                                }`}
                            >
                                {/* Top Status Bar indicator */}
                                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                                    isUnlocked ? "bg-teal-500" :
                                    isCompleted ? "bg-emerald-500" :
                                    "bg-slate-200"
                                }`}></div>

                                <div className="p-6 md:p-8 md:pl-10">
                                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 lg:items-center">
                                        
                                        {/* Left Area: Title & Number */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black ${
                                                    isUnlocked ? "bg-teal-100 text-teal-700" :
                                                    isCompleted ? "bg-emerald-100 text-emerald-700" :
                                                    "bg-slate-100 text-slate-500"
                                                }`}>
                                                    {index + 1}
                                                </span>
                                                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                                                    isUnlocked ? "text-teal-600" :
                                                    isCompleted ? "text-emerald-600" :
                                                    "text-slate-400"
                                                }`}>
                                                    {isUnlocked ? "Active Module" : isCompleted ? "Completed Module" : "Locked Module"}
                                                </span>
                                            </div>
                                            
                                            <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${isUnlocked || isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                                                {section.sub_div_name}
                                            </h3>
                                        </div>

                                        {/* Center Area: Clean Stats */}
                                        <div className="grid grid-cols-2 lg:flex gap-4 lg:gap-8 grow-0 shrink-0">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 opacity-70" /> Duration
                                                </span>
                                                <span className={`text-lg md:text-xl font-bold ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                                    {section.total_time} <span className="text-sm font-medium opacity-60">min</span>
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                                    <FileText className="w-3.5 h-3.5 opacity-70" /> Marks
                                                </span>
                                                <span className={`text-lg md:text-xl font-bold ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                                    {section.total_marks} <span className="text-sm font-medium opacity-60"></span>
                                                </span>
                                            </div>

                                            {section.total_question && (
                                                <div className="flex flex-col gap-1 col-span-2 lg:col-span-1 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                                        <CheckCircle2 className="w-3.5 h-3.5 opacity-70" /> Questions
                                                    </span>
                                                    <span className={`text-lg md:text-xl font-bold ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {section.total_question} <span className="text-sm font-medium opacity-60"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Area: Large Action */}
                                        <div className="w-full lg:w-48 shrink-0 mt-4 lg:mt-0">
                                            {isUnlocked ? (
                                                <Button 
                                                    size="lg" 
                                                    onClick={() => handleStart(section)}
                                                    disabled={startingSectionId === section.sub_div_id}
                                                    className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl transition-all duration-300 shadow-md shadow-teal-600/20"
                                                >
                                                    {startingSectionId === section.sub_div_id ? (
                                                        <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Preparing</span>
                                                    ) : (
                                                        <span className="flex items-center justify-between w-full px-2">
                                                            Start Module <PlayCircle className="w-5 h-5 opacity-90" />
                                                        </span>
                                                    )}
                                                </Button>
                                            ) : isCompleted ? (
                                                <Button size="lg" variant="outline" className="w-full h-14 bg-emerald-50 text-emerald-700 border border-emerald-200 pointer-events-none rounded-xl font-bold text-sm shadow-sm">
                                                    <CheckCircle2 className="mr-2 w-4 h-4 text-emerald-600" /> Passed
                                                </Button>
                                            ) : (
                                                <Button size="lg" variant="outline" className="w-full h-14 bg-slate-50 border border-slate-200 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed pointer-events-none">
                                                    <Lock className="mr-2 w-4 h-4 opacity-50" /> Locked Module
                                                </Button>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {sections.length === 0 && !isLoading && (
                        <div className="bg-white rounded-[2rem] ring-1 ring-slate-900/5 shadow-sm p-16 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Modules Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">This examination currently has no assigned modules. Please contact an administrator.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
