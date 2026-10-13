import { useState, useEffect, useMemo } from "react";
import { 
    Search, Calendar, Trophy, Loader2, 
    Sparkles, BarChart3, Eye, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { DynamicAssessmentService } from "../../../services/DynamicAssessmentService";
import { useCourse } from "../../../context/CourseContext";
import Cookies from "js-cookie";

export interface DynamicAssessmentResultListProps {
    onViewResult?: (assessmentId: number | string, assessmentMethod?: string) => void;
    onStartTest?: (test: any) => void;
    hideHeader?: boolean;
}

export function DynamicAssessmentResultList({ 
    onViewResult, 
    onStartTest: _onStartTest, 
    hideHeader = false 
}: DynamicAssessmentResultListProps) {
    const { subscriptionId: contextSubscriptionId } = useCourse();

    // Resolved active subscription id
    const activeSubscriptionId = useMemo(() => {
        if (contextSubscriptionId) return contextSubscriptionId;
        if (typeof window !== "undefined") {
            const stored =
                localStorage.getItem("subscription_id") ||
                localStorage.getItem("subscriptionId") ||
                Cookies.get("subscription_id") ||
                Cookies.get("subscriptionId");
            if (stored) return stored;
        }
        return 100018;
    }, [contextSubscriptionId]);

    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Modal state for detailed result
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [detailData, setDetailData] = useState<any>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchHistory = async () => {
        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        if (!userId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            console.log("Fetching dynamic assessments for:", { userId, activeSubscriptionId });
            const response = await DynamicAssessmentService.GET_ATTEMPTED_ASSESSMENTS(
                Number(userId), 
                Number(activeSubscriptionId)
            );
            console.log("Dynamic assessments response:", response);

            // Defensively extract results array
            const data = Array.isArray(response)
                ? response
                : Array.isArray(response?.assessments)
                ? response.assessments
                : Array.isArray(response?.data?.assessments)
                ? response.data.assessments
                : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.results)
                ? response.results
                : [];

            setResults(data);
        } catch (error) {
            console.error("Failed to fetch custom assessment history:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [activeSubscriptionId]);

    // Counts for filter chips
    const { submittedCount, inProgressCount } = useMemo(() => {
        let submitted = 0;
        let inProgress = 0;
        results.forEach((r) => {
            const s = (r.assessment_status || r.status || "").toUpperCase();
            if (s === "SUBMITTED" || s === "COMPLETED") {
                submitted++;
            } else if (s === "IN_PROGRESS" || s === "INITIALIZED") {
                inProgress++;
            }
        });
        return { submittedCount: submitted, inProgressCount: inProgress };
    }, [results]);

    // Handle view result click
    const handleViewResult = async (item: any) => {
        const assessmentId = item.assessment_id || item.id || item.user_ass_id || item.dynamic_assessment_id;
        setSelectedAssessment(item);
        setIsDetailModalOpen(true);
        setIsLoadingDetail(true);
        setDetailData(null);

        const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
        try {
            if (userId && assessmentId) {
                const res = await DynamicAssessmentService.GET_ATTEMPTED_ASSESSMENT_RESULT(
                    Number(userId),
                    Number(activeSubscriptionId),
                    Number(assessmentId)
                );
                console.log("Dynamic assessment result details:", res);
                const parsed = res?.data || res?.result || res || null;
                setDetailData(parsed);
            }
        } catch (err) {
            console.error("Failed to fetch dynamic assessment result details:", err);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    // Filter logic
    const filteredResults = results.filter((res) => {
        const name = (res.assessment_name || res.name || res.title || res.pattern_name || "").toLowerCase();
        const category = (res.category || res.subject_name || res.pattern_type || "").toLowerCase();
        const matchesSearch = name.includes(searchQuery.toLowerCase()) || category.includes(searchQuery.toLowerCase());

        const status = (res.assessment_status || res.status || "SUBMITTED").toUpperCase();
        const matchesStatus = 
            statusFilter === "ALL" || 
            (statusFilter === "SUBMITTED" && (status === "SUBMITTED" || status === "COMPLETED")) ||
            (statusFilter === "IN_PROGRESS" && (status === "IN_PROGRESS" || status === "INITIALIZED"));

        return matchesSearch && matchesStatus;
    });

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
                <p className="text-slate-500 font-medium">Loading your custom assessment history...</p>
            </div>
        );
    }

    return (
        <div className={`${hideHeader ? 'space-y-6' : 'p-6 mx-auto space-y-8'} animate-in fade-in duration-500`}>
            {/* Header & Controls Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {!hideHeader && (
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Assessments</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Review your custom generated dynamic assessment attempts.</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Status Filter Chips */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
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
                            placeholder="Search by test or subject..."
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
                        className="rounded-xl border-slate-200 shrink-0 h-9 w-9 text-slate-600 hover:text-indigo-600"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* List Header (Desktop Only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Assessment Name</div>
                <div className="col-span-2 text-center">Type / Level</div>
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
                        const obtainedM = result.obtained_marks ?? result.score ?? result.marks_obtained ?? 0;
                        const scoreRatio = totalM > 0 ? obtainedM / totalM : 0;
                        const status = (result.assessment_status || result.status || "SUBMITTED").toUpperCase();
                        const isSubmitted = status === "SUBMITTED" || status === "COMPLETED";
                        const isInProgress = status === "INITIALIZED" || status === "IN_PROGRESS";
                        const dateStr = result.ass_start_time || result.created_at || result.submitted_at || result.start_time;

                        const name = result.assessment_name || result.name || result.title || `Custom Test #${index + 1}`;
                        const levelType = result.assessment_type || result.exam_level || result.pattern_type || result.pattern_name || "Custom Pattern";

                        return (
                            <motion.div 
                                key={result.assessment_id || result.id || result.user_ass_id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                onClick={() => handleViewResult(result)}
                                className="bg-white border border-slate-100 p-4 md:px-6 md:py-5 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    {/* Index */}
                                    <div className="hidden md:block col-span-1 text-sm font-bold text-slate-400">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>

                                    {/* Name & Subtitle */}
                                    <div className="col-span-3 flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                            <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                {name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                {result.subject_name || result.category || "Dynamic MCQ"}
                                            </span>
                                            {result.total_questions && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    • {result.total_questions} Qs
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Level / Pattern */}
                                    <div className="md:col-span-2 flex items-center md:justify-center">
                                        <Badge variant="outline" className="px-3 py-1 bg-indigo-50/50 text-indigo-700 border-indigo-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {levelType}
                                        </Badge>
                                    </div>

                                    {/* Date */}
                                    <div className="md:col-span-2 flex items-center md:justify-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                                        <span className="text-sm font-medium text-slate-600">
                                            {formatDate(dateStr)}
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
                                                scoreRatio >= 0.4 ? 'text-emerald-600' : 'text-rose-600'
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
                                            {status}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button 
                                            variant="default"
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold h-8 px-3.5 transition-all shadow-xs flex items-center gap-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewResult(result);
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
                        <div className="inline-flex p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No custom assessments found</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto">
                            {searchQuery 
                                ? "No results match your search criteria. Try a different query." 
                                : "Generate and attempt tests from the Custom Assessments tab to view your performance analytics here."}
                        </p>
                    </div>
                )}
            </div>

            {/* Detailed Result Dialog Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl">
                    <DialogHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    {selectedAssessment?.assessment_name || selectedAssessment?.name || "Custom Assessment Result"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-xs">
                                    {selectedAssessment?.subject_name || selectedAssessment?.category || "Dynamic MCQ"} • Attempted on {formatDate(selectedAssessment?.ass_start_time || selectedAssessment?.created_at)}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {isLoadingDetail ? (
                        <div className="py-16 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-slate-500 text-sm font-semibold">Loading detailed report...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pt-2">
                            {/* Summary Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Score */}
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-center">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Score</span>
                                    <div className="text-2xl font-black text-slate-900">
                                        {detailData?.obtained_marks ?? selectedAssessment?.obtained_marks ?? selectedAssessment?.score ?? 0}
                                        <span className="text-sm text-slate-400 font-semibold">/{detailData?.total_marks ?? selectedAssessment?.total_marks ?? 100}</span>
                                    </div>
                                </div>

                                {/* Accuracy */}
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-center">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Accuracy</span>
                                    <div className="text-2xl font-black text-emerald-700">
                                        {(() => {
                                            const total = detailData?.total_marks ?? selectedAssessment?.total_marks ?? 100;
                                            const obt = detailData?.obtained_marks ?? selectedAssessment?.obtained_marks ?? selectedAssessment?.score ?? 0;
                                            return total > 0 ? `${Math.round((obt / total) * 100)}%` : "0%";
                                        })()}
                                    </div>
                                </div>

                                {/* Questions */}
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-center">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Total Questions</span>
                                    <div className="text-2xl font-black text-slate-900">
                                        {detailData?.total_questions ?? selectedAssessment?.total_questions ?? detailData?.questions?.length ?? "N/A"}
                                    </div>
                                </div>

                                {/* Correct vs Incorrect */}
                                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-center">
                                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Correct / Total</span>
                                    <div className="text-2xl font-black text-purple-700">
                                        {detailData?.correct_questions ?? detailData?.correct_count ?? "0"}
                                        <span className="text-sm text-slate-400 font-semibold"> / {detailData?.total_questions ?? selectedAssessment?.total_questions ?? "—"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional metadata if available */}
                            {(detailData?.difficulty_distribution || detailData?.complexity_breakdown) && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                                        Difficulty Breakdown
                                    </h4>
                                    <div className="flex gap-4 text-xs font-semibold text-slate-600">
                                        <span className="text-emerald-600">
                                            Easy: {detailData.difficulty_distribution?.easy || detailData.complexity_breakdown?.easy || 0}%
                                        </span>
                                        <span className="text-blue-600">
                                            Medium: {detailData.difficulty_distribution?.medium || detailData.complexity_breakdown?.medium || 0}%
                                        </span>
                                        <span className="text-purple-600">
                                            Hard: {detailData.difficulty_distribution?.hard || detailData.complexity_breakdown?.hard || 0}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Question review list if questions exist */}
                            {Array.isArray(detailData?.questions) && detailData.questions.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-900">Question-wise Analysis</h4>
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                        {detailData.questions.map((q: any, idx: number) => {
                                            const isCorrect = q.is_correct || q.status === "CORRECT";
                                            const isSkipped = q.status === "SKIPPED" || (!q.user_answer && !q.selected_option);

                                            return (
                                                <div 
                                                    key={q.question_id || idx}
                                                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                                                        isCorrect 
                                                        ? 'bg-emerald-50/30 border-emerald-100' 
                                                        : isSkipped
                                                        ? 'bg-slate-50 border-slate-200'
                                                        : 'bg-rose-50/30 border-rose-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-slate-700">Q{idx + 1}</span>
                                                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                                                            isCorrect 
                                                            ? 'bg-emerald-100 text-emerald-700' 
                                                            : isSkipped
                                                            ? 'bg-slate-200 text-slate-700'
                                                            : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                            {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect'}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-slate-800">{q.question_text || q.question}</p>
                                                    <div className="flex gap-4 text-[11px]">
                                                        <span className="text-slate-500">
                                                            Your answer: <strong className="text-slate-800">{q.user_answer || q.selected_option || "None"}</strong>
                                                        </span>
                                                        {q.correct_answer && (
                                                            <span className="text-emerald-600 font-semibold">
                                                                Correct: {q.correct_answer}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                {onViewResult && (
                                    <Button 
                                        variant="outline"
                                        className="rounded-xl border-slate-200 text-xs font-bold"
                                        onClick={() => {
                                            const id = selectedAssessment?.assessment_id || selectedAssessment?.id || selectedAssessment?.user_ass_id;
                                            setIsDetailModalOpen(false);
                                            onViewResult(id, "DYNAMIC");
                                        }}
                                    >
                                        Full Page View
                                    </Button>
                                )}
                                <Button 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                                    onClick={() => setIsDetailModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
