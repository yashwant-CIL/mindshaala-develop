import { useState, useEffect, useMemo } from "react";
import { 
    Search, Calendar, ClipboardList, 
    Trophy, Loader2, Eye, RefreshCw, FileText 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { TestService } from "../../../services/TestServices";
import Cookies from "js-cookie";

export interface TestResultListPageProps {
    onViewResult: (userAssId: number | string, assessmentMethod?: string) => void;
    onStartTest?: (test: any) => void;
    hideHeader?: boolean;
}

export function MCQResultList({ 
    onViewResult, 
    onStartTest: _onStartTest, 
    hideHeader = false 
}: TestResultListPageProps) {
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const fetchHistory = async () => {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (!userId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await TestService.getSubmittedExams(userId);
            // Ensure results is an array
            const data = Array.isArray(response) ? response : (response?.data || []);
            setResults(data);
        } catch (error) {
            console.error("Failed to fetch test history:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Counts for filter chips
    const { submittedCount, inProgressCount } = useMemo(() => {
        let submitted = 0;
        let inProgress = 0;
        results.forEach((r) => {
            const s = (r.assessment_status || "").toUpperCase();
            if (s === "SUBMITTED" || s === "COMPLETED") {
                submitted++;
            } else if (s === "IN_PROGRESS" || s === "INITIALIZED") {
                inProgress++;
            }
        });
        return { submittedCount: submitted, inProgressCount: inProgress };
    }, [results]);

    // Filtering logic (search + status)
    const filteredResults = useMemo(() => {
        return results.filter((res) => {
            const name = (res.assessment_name || "").toLowerCase();
            const type = (res.assessment_type || "").toLowerCase();
            const method = (res.assessment_method || "").toLowerCase();
            const q = searchQuery.toLowerCase();
            const matchesSearch = name.includes(q) || type.includes(q) || method.includes(q);

            const status = (res.assessment_status || "SUBMITTED").toUpperCase();
            const matchesStatus = 
                statusFilter === "ALL" || 
                (statusFilter === "SUBMITTED" && (status === "SUBMITTED" || status === "COMPLETED")) ||
                (statusFilter === "IN_PROGRESS" && (status === "IN_PROGRESS" || status === "INITIALIZED"));

            return matchesSearch && matchesStatus;
        });
    }, [results, searchQuery, statusFilter]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
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
        <div className={`${hideHeader ? 'space-y-6' : 'p-6 mx-auto space-y-8'} animate-in fade-in duration-500 font-sans`}>
            {/* Header & Controls Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {!hideHeader && (
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Assessments</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Review your performance from past assessments.</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Status Filter Chips */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                statusFilter === "ALL" 
                                ? "bg-white text-indigo-600 shadow-xs font-black" 
                                : "hover:text-slate-900"
                            }`}
                        >
                            All ({results.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter("SUBMITTED")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                statusFilter === "SUBMITTED" 
                                ? "bg-white text-emerald-600 shadow-xs font-black" 
                                : "hover:text-slate-900"
                            }`}
                        >
                            Completed ({submittedCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter("IN_PROGRESS")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                statusFilter === "IN_PROGRESS" 
                                ? "bg-white text-blue-600 shadow-xs font-black" 
                                : "hover:text-slate-900"
                            }`}
                        >
                            In Progress ({inProgressCount})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by exam name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xs"
                        />
                    </div>

                    {/* Refresh Button */}
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={fetchHistory}
                        title="Refresh"
                        className="rounded-xl border-slate-200 shrink-0 h-9 w-9 text-slate-600 hover:text-indigo-600 cursor-pointer"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* List Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Exam Name</div>
                <div className="col-span-2 text-center">Exam Type</div>
                <div className="col-span-2 text-center">Date & Time</div>
                <div className="col-span-1 text-center">Score</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                {filteredResults.length > 0 ? (
                    filteredResults.map((result, index) => {
                        const totalM = result.total_marks || 100;
                        const obtainedM = result.obtained_marks ?? 0;
                        const scoreRatio = totalM > 0 ? obtainedM / totalM : 0;
                        const status = (result.assessment_status || "SUBMITTED").toUpperCase();
                        const isSubmitted = status === "SUBMITTED" || status === "COMPLETED";
                        const isInProgress = status === "INITIALIZED" || status === "IN_PROGRESS";

                        return (
                            <motion.div 
                                key={result.user_ass_id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                onClick={() => onViewResult(result.user_ass_id, result.assessment_method)}
                                className="bg-white border border-slate-100 p-4 md:px-6 md:py-5 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    {/* Index */}
                                    <div className="hidden md:block col-span-1 text-sm font-bold text-slate-400">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>

                                    {/* Name & Type */}
                                    <div className="col-span-3 flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                {result.assessment_name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                                            {result.assessment_type || "Standard Test"}
                                        </span>
                                    </div>

                                    {/* Method / Type Badge */}
                                    <div className="md:col-span-2 flex items-center md:justify-center">
                                        <Badge variant="outline" className="px-3 py-1 bg-slate-50 text-slate-600 border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {result.assessment_method || "Mock"}
                                        </Badge>
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
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                                            scoreRatio >= 0.4 
                                            ? 'bg-emerald-50 text-emerald-700' 
                                            : 'bg-rose-50 text-rose-700'
                                        }`}>
                                            <Trophy className={`w-3.5 h-3.5 ${
                                                scoreRatio >= 0.4 
                                                ? 'text-emerald-600' 
                                                : 'text-rose-600'
                                            }`} />
                                            <span className="text-sm font-black">
                                                {obtainedM}/{totalM}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="md:col-span-2 flex items-center md:justify-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                            isSubmitted 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                            : isInProgress
                                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {result.assessment_status || "In Progress"}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button 
                                            variant="default"
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold h-8 px-3.5 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewResult(result.user_ass_id, result.assessment_method);
                                            }}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Result
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center space-y-4">
                        <div className="inline-flex p-4 bg-blue-50 rounded-2xl text-blue-600">
                            <ClipboardList className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No assessments found</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto">
                            {searchQuery 
                                ? "No assessments match your search criteria. Try a different query." 
                                : "Finish a test from Available Tests to see your performance analysis here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export const TestResultListPage = MCQResultList;
