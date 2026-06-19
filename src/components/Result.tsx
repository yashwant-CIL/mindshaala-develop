import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Clock, Target, CheckCircle2, XCircle, 
    AlertCircle, 
    BarChart3, 
    TrendingUp, Zap, HelpCircle,
    ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { TestService } from "../services/TestServices";

interface ResultProps {
    userAssId: number | string;
    assessmentMethod?: string | null;
    onExit: () => void;
}

const DonutChart = ({ percentage }: { percentage: number }) => {
    const size = 220;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const safePercentage = Math.min(Math.max(0, percentage || 0), 100);
    const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center p-2 rounded-2xl" style={{ width: size + 40, height: size + 40 }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent"
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="url(#resultGradientV4Final)" strokeWidth={strokeWidth} fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="resultGradientV4Final" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Proficiency</span>
                <span className="text-4xl font-extrabold text-slate-900 leading-none">{Math.round(safePercentage)}%</span>
            </div>
        </div>
    );
};

export function Result({ userAssId, assessmentMethod, onExit }: ResultProps) {
    const navigate = useNavigate();
    const [resultData, setResultData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [complexityDetails, setComplexityDetails] = useState<any>(null);

    useEffect(() => {
        const fetchResult = async () => {
            if (!userAssId) return;
            try {
                const response = await TestService.getExamResult(userAssId);
                const data = Array.isArray(response) ? response[0] : (response.data || response);
                setResultData(data);
            } catch (error) {
                console.error("Failed to fetch exam result:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchComplexityDetails = async () => {
            try {
                const response = await TestService.getComplexityDetails(userAssId);
                // The complexity details should be the array directly
                setComplexityDetails(Array.isArray(response) ? response : (response.data || []));
            } catch (error) {
                console.error("Failed to fetch complexity details:", error);
            }
        };
        fetchResult();
        fetchComplexityDetails();
    }, [userAssId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating Report...</p>
            </div>
        );
    }

    if (!resultData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="bg-white max-w-md w-full rounded-2xl p-8 text-center shadow-sm space-y-6">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-900">Report Unavailable</h2>
                    <p className="text-slate-500">We couldn't retrieve your report at this time.</p>
                    <Button onClick={onExit} className="w-full bg-indigo-600 text-white rounded-xl h-12">Return</Button>
                </div>
            </div>
        );
    }

    const percentage = Number(resultData.obtained_percentage || resultData.percentage || 0);

    // Destructure resultData for easier access
    const {
        obtained_marks = 0,
        total_marks = 0,
        accuracy = 0,
        correct_count = 0,
        incorrect_count = 0,
        attempted_question = 0,
        un_attempted_question = 0,
        assessment_name = "Exam Summary",
        time_taken = 0,
        ass_start_time = "N/A",
        overall_feedback = ""
    } = resultData;

    // Table data (fallback to static sample data if missing)
    // const tableData = (complexityDetails).length > 0
    //     ? (complexityDetails)
    //     : [
    //         { complexity: 'Easy', question_count: 10, total_time_spent_in_seconds: 300, avg_time_spent_in_seconds: 30, correct_responses: 9, total_time_correct_responses: 240, incorrect_responses: 1, total_time_in_correct_responses: 60 },
    //         { complexity: 'Average', question_count: 15, total_time_spent_in_seconds: 900, avg_time_spent_in_seconds: 60, correct_responses: 11, total_time_correct_responses: 600, incorrect_responses: 4, total_time_in_correct_responses: 300 },
    //         { complexity: 'Difficult', question_count: 5, total_time_spent_in_seconds: 600, avg_time_spent_in_seconds: 120, correct_responses: 3, total_time_correct_responses: 300, incorrect_responses: 2, total_time_in_correct_responses: 300 },
    //     ];

    // console.log("Table Data",tableData);

    // Helper to convert seconds to minutes string
    const toMinutes = (seconds: number | string | undefined): string => {
        const secs = typeof seconds === 'string' ? parseFloat(seconds) : (seconds || 0);
        if (isNaN(secs) || secs === 0) return "0s";
        
        const minutes = Math.floor(secs / 60);
        const remainingSeconds = Math.round(secs % 60);
        
        if (minutes > 0) {
            return `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds} sec` : ""}`;
        }
        return `${remainingSeconds} sec`;
    };

    // Helper to format ISO date string
    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === "N/A") return "Date Not Available";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + 
                   " at " + 
                   date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans p-6 md:p-8 animate-in fade-in duration-700">
            <div className="mx-auto space-y-4">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-6">
                    <div className="flex items-start gap-4">
                        <button 
                            onClick={onExit}
                            className="mt-1 w-12 h-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all hover:scale-105 shadow-sm"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="space-y-3">
                            <div className="space-y-1 mt-1">
                                <h1 className="text-3xl md:text-3xl font-extrabold text-slate-900 tracking-tighter leading-none group">
                                    {assessment_name}
                                </h1>
                                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">
                                    {formatDate(ass_start_time)}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm font-bold">
                                <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm text-xs mt-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {toMinutes(time_taken)} taken
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            className="rounded-2xl font-black text-sm h-14 px-8 border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 gap-3 shadow-sm transition-all"
                            onClick={() => {
                                const encodedId = btoa(userAssId.toString());
                                if (assessmentMethod?.toUpperCase() === "TH") {
                                    navigate(`/test-series/theory-solutions/${encodedId}`);
                                } else {
                                    navigate(`/test-series/solutions/${encodedId}`);
                                }
                            }}
                        >
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            View Solution
                        </Button>
                    </div>
                </div>

                {/* Status Bar: Grade, Efficiency, Modified (Simple & Clear above the cards) */}
                {/* <div className="bg-white border border-slate-100 rounded-3xl p-6 px-10 flex flex-wrap gap-x-12 gap-y-6 items-center justify-between shadow-sm">
                     <div className="flex items-center gap-12">
                         <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Letter Grade</span>
                            <span className="text-3xl font-black text-indigo-600 leading-none">{getGrade(percentage)}</span>
                         </div>
                         <div className="w-px h-8 bg-slate-100" />
                         <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Efficiency Status</span>
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-tight">Performance Validated</span>
                         </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Last Modified</span>
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-tight whitespace-nowrap">Generated Moments Ago</span>
                     </div>
                </div> */}

                {/* Main Content: Middle Section */}
                <div className="grid lg:grid-cols-12 gap-4 items-center">
                    {/* Parameter Cards Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-2 items-start">
                        <AnalysisCardV4 icon={Target} label="Marks Obtained" value={obtained_marks} total={total_marks} color="indigo" />
                        <AnalysisCardV4 icon={Zap} label="Accuracy" value={`${accuracy}%`} color="emerald" />
                        <AnalysisCardV4 icon={CheckCircle2} label="Correct" value={correct_count} color="emerald" />
                        <AnalysisCardV4 icon={XCircle} label="Incorrect" value={incorrect_count} color="rose" />
                        <AnalysisCardV4 icon={Clock} label="Attempted" value={attempted_question} color="slate" />
                        <AnalysisCardV4 icon={HelpCircle} label="Unattempted" value={un_attempted_question} color="slate" />
                    </div>

                    {/* Donut Chart - Matching height of Left Column */}
                    <div className="lg:col-span-5 flex items-center justify-center p-4">
                        <DonutChart percentage={percentage} />
                    </div>
                </div>

                {/* Overall Feedback (Theory Only) */}
                {assessmentMethod?.toUpperCase() === "TH" && overall_feedback && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-8 border border-indigo-100 shadow-sm"
                    >
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-indigo-600" />
                            AI-Powered Evaluation Feedback
                        </h3>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-inner">
                            <p className="text-slate-700 leading-relaxed font-medium italic text-lg">
                                "{overall_feedback}"
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Time Analysis Detail Table (MCQ Only) */}
                {assessmentMethod?.toUpperCase() !== "TH" && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Complexity Calibration</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Difficulty-Wise Response Matrix</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Qs</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Time</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Time</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct Response</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time (Correct)</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incorrect Response</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time (Incorrect)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Array.isArray(complexityDetails) && complexityDetails.map((row: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                                row.complexity?.toLowerCase() === "easy" ? 'bg-emerald-50 text-emerald-600' :
                                                row.complexity?.toLowerCase() === "average" ? 'bg-amber-50 text-amber-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                                {row.complexity || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center text-sm font-bold text-slate-900">{row.question_count}</td>
                                        <td className="px-6 py-6 text-center text-sm font-medium text-slate-600">{toMinutes(row.total_time_spent_in_seconds)}</td>
                                        <td className="px-6 py-6 text-center text-sm font-bold text-slate-900">{toMinutes(row.avg_time_spent_in_seconds)}</td>
                                        <td className="px-6 py-6 text-center text-sm font-bold text-emerald-600">{row.correct_responses}</td>
                                        <td className="px-6 py-6 text-center text-sm font-medium text-emerald-600/80">{toMinutes(row.total_time_correct_responses)}</td>
                                        <td className="px-6 py-6 text-center text-sm font-bold text-rose-600">{row.incorrect_responses}</td>
                                        <td className="px-6 py-6 text-center text-sm font-medium text-rose-600/80">{toMinutes(row.total_time_in_correct_responses)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}

const AnalysisCardV4 = ({ icon: Icon, label, value, total, color }: any) => {
    const theme: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        slate: 'bg-slate-50 text-slate-500',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-1.5">
                <div className={`p-1 rounded-md inline-flex items-center justify-center ${theme[color]}`}>
                     <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate">{label}</p>
            </div>
            <p className="pl-1 text-xl font-extrabold text-slate-900 tabular-nums">
                {value}
                {total !== undefined && total !== null && total !== "" && (
                    <span className="text-[10px] font-bold text-slate-300 ml-1">/ {total}</span>
                )}
            </p>
        </div>
    );
};
