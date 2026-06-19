import { useState, useEffect } from "react";
import { 
    Search, Calendar, ClipboardList, 
    Trophy, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { TestService } from "../services/TestServices";
import Cookies from "js-cookie";

interface TestResultListPageProps {
    onViewResult: (userAssId: number | string, assessmentMethod?: string) => void;
    onStartTest?: (test: any) => void;
}

export function TestResultListPage({ onViewResult, onStartTest }: TestResultListPageProps) {
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
            if (!userId) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await TestService.getSubmittedExams(userId);
                // Ensure results is an array
                const data = Array.isArray(response) ? response : (response.data || []);
                setResults(data);
            } catch (error) {
                console.error("Failed to fetch test history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredResults = results.filter(res => 
        (res.assessment_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback to raw string if invalid
        
        const datePart = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        const timePart = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        return `${datePart} • ${timePart}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading your test history...</p>
            </div>
        );
    }

    return (
        <div className="p-6 mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Test Results</h1>
                    <p className="text-slate-500 text-sm mt-1">Review your performance from past assessments.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by exam name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Exam Name</div>
                <div className="col-span-2 text-center">Exam Type</div>
                <div className="col-span-2 text-center">Date</div>
                <div className="col-span-1 text-center">Score</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                {filteredResults.length > 0 ? (
                    filteredResults.map((result, index) => (
                        <motion.div 
                            key={result.user_ass_id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onViewResult(result.user_ass_id, result.assessment_method)}
                            className="bg-white border border-slate-100 p-4 md:px-6 md:py-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                {/* Index */}
                                <div className="hidden md:block col-span-1 text-sm font-bold text-slate-400">
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>

                                {/* Name & Type */}
                                <div className="col-span-3 flex flex-col">
                                    <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                        {result.assessment_name}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                                        {result.assessment_type || "Standard Test"}
                                    </span>
                                </div>

                                {/* Method */}
                                <div className="md:col-span-2 flex items-center md:justify-center">
                                    <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                                        {result.assessment_method || "Mock"}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="md:col-span-2 flex items-center md:justify-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                                    <span className="text-sm font-medium text-slate-600">
                                        {formatDate(result.ass_start_time)}
                                    </span>
                                </div>

                                {/* Score */}
                                <div className="md:col-span-1 flex items-center md:justify-center">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                        (result.obtained_marks / result.total_marks) >= 0.4 
                                        ? 'bg-emerald-50 text-emerald-700' 
                                        : 'bg-rose-50 text-rose-700'
                                    }`}>
                                        <Trophy className={`w-3.5 h-3.5 ${
                                            (result.obtained_marks / result.total_marks) >= 0.4 
                                            ? 'text-emerald-600' 
                                            : 'text-rose-600'
                                        }`} />
                                        <span className="text-sm font-black">
                                            {result.obtained_marks || 0}/{result.total_marks || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2 flex items-center md:justify-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                        result.assessment_status === 'SUBMITTED' 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : result.assessment_status === 'INITIALIZED' || result.assessment_status === 'IN_PROGRESS'
                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {result.assessment_status || "In Progress"}
                                    </span>
                                </div>

                                {/* Action Button */}
                                <div className="md:col-span-1 flex justify-end">
                                    {(result.assessment_status === 'INITIALIZED' || result.assessment_status === 'IN_PROGRESS') ? (
                                        // <Button 
                                        //     variant="default"
                                        //     size="lg"
                                        //     className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold h-8 px-4 transition-all shadow-sm"
                                        //     onClick={(e) => {
                                        //         e.stopPropagation();
                                        //         onStartTest?.(result);
                                        //     }}
                                        // >
                                        //     Start Test
                                        // </Button>
                                        ""
                                    ) : (
                                        <Button 
                                            variant="default"
                                            size="lg"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold h-8 px-4 transition-all shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewResult(result.user_ass_id, result.assessment_method);
                                            }}
                                        >
                                            View Result
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2rem] p-20 text-center space-y-4">
                        <div className="inline-flex p-4 bg-slate-50 rounded-full">
                            <ClipboardList className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No assessments found</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            Finish a test to see your performance analysis here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
