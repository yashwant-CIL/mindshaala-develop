import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Clock,
  Trophy,
  Target,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  HelpCircle,
  Layers,
  Award,
  RotateCcw,
  Check,
  X,
  FileText,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicAssessmentService } from "../../../services/DynamicAssessmentService";
import { QuestionMathJax } from "../../../shared/mathjaxconfig/QuestionMathJax";
import { useCourse } from "../../../context/CourseContext";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import Cookies from "js-cookie";

export interface DynamicAssessmentSolutionsProps {
  assessment?: any;
  assessmentId?: number | string;
  userId?: number | string;
  subscriptionId?: number | string;
  onBack?: () => void;
}

interface NormalizedOption {
  letter: string;
  text: string;
  diagram?: string;
  isCorrect: boolean;
  isUserChoice: boolean;
}

interface NormalizedQuestion {
  id: number | string;
  index: number;
  questionText: string;
  diagrams: string[];
  options: NormalizedOption[];
  userAnswer: string | null;
  correctAnswer: string | null;
  status: "CORRECT" | "INCORRECT" | "SKIPPED";
  marks: number;
  negativeMarks: number;
  timeTaken?: number;
  explanation: string;
  explanationDiagrams: string[];
  difficulty?: string;
  subjectName?: string;
}

interface NormalizedSection {
  id: number | string;
  name: string;
  questions: NormalizedQuestion[];
}

export function DynamicAssessmentSolutions({
  assessment,
  assessmentId: propAssessmentId,
  userId: propUserId,
  subscriptionId: propSubscriptionId,
  onBack,
}: DynamicAssessmentSolutionsProps) {
  const routerParams = useParams<{ assessmentId?: string; userAssId?: string }>();
  const navigate = useNavigate();
  const { subscriptionId: contextSubscriptionId } = useCourse();

  // 1. Resolve Assessment ID
  const effectiveAssessmentId = useMemo(() => {
    if (propAssessmentId) return propAssessmentId;
    if (assessment?.assessment_id) return assessment.assessment_id;
    if (assessment?.id) return assessment.id;
    if (assessment?.user_ass_id) return assessment.user_ass_id;
    if (assessment?.dynamic_assessment_id) return assessment.dynamic_assessment_id;
    if (routerParams?.assessmentId) return routerParams.assessmentId;
    if (routerParams?.userAssId) return routerParams.userAssId;
    return null;
  }, [propAssessmentId, assessment, routerParams]);

  // 2. Resolve User ID
  const effectiveUserId = useMemo(() => {
    if (propUserId) return Number(propUserId);
    if (assessment?.user_id) return Number(assessment.user_id);
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("user_id") ||
        localStorage.getItem("userId") ||
        Cookies.get("user_id") ||
        Cookies.get("userId");
      if (stored) return Number(stored);
    }
    return null;
  }, [propUserId, assessment]);

  // 3. Resolve Subscription ID
  const effectiveSubscriptionId = useMemo(() => {
    if (propSubscriptionId) return Number(propSubscriptionId);
    if (assessment?.subscription_id) return Number(assessment.subscription_id);
    if (contextSubscriptionId) return Number(contextSubscriptionId);
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("subscription_id") ||
        localStorage.getItem("subscriptionId") ||
        Cookies.get("subscription_id") ||
        Cookies.get("subscriptionId");
      if (stored) return Number(stored);
    }
    return 100018;
  }, [propSubscriptionId, assessment, contextSubscriptionId]);

  // Component State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);

  // Active section & filter state
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CORRECT" | "INCORRECT" | "SKIPPED">("ALL");
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string | number, boolean>>({});

  // Fetch assessment results on mount
  const fetchSolutionData = useCallback(async () => {
    if (!effectiveAssessmentId) {
      setError("No assessment ID provided.");
      setLoading(false);
      return;
    }
    if (!effectiveUserId) {
      setError("User information not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching dynamic assessment result with:", {
        userId: Number(effectiveUserId),
        subscriptionId: Number(effectiveSubscriptionId),
        assessmentId: Number(effectiveAssessmentId),
      });

      const res = await DynamicAssessmentService.GET_ATTEMPTED_ASSESSMENT_RESULT(
        Number(effectiveUserId),
        Number(effectiveSubscriptionId),
        Number(effectiveAssessmentId)
      );

      console.log("GET_ATTEMPTED_ASSESSMENT_RESULT response:", res);

      const parsed = res?.data || res?.result || res;
      if (!parsed) {
        throw new Error("No assessment result data received from server.");
      }

      setRawData(parsed);
    } catch (err: any) {
      console.error("Error loading dynamic assessment solutions:", err);
      setError(err?.message || "Failed to load dynamic assessment solutions.");
    } finally {
      setLoading(false);
    }
  }, [effectiveAssessmentId, effectiveUserId, effectiveSubscriptionId]);

  useEffect(() => {
    fetchSolutionData();
  }, [fetchSolutionData]);

  // Diagram URL resolver helper
  const getImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL || "";
    return `${baseUrl}/api/v1/cil/images/${url}`;
  };

  // Helper to parse options
  const parseOptions = (q: any, rawUserAns: any, rawCorrectAns: any): NormalizedOption[] => {
    const letters = ["A", "B", "C", "D", "E", "F"];
    const options: NormalizedOption[] = [];

    // Format A: Array of options
    const rawOptionsList = q.options || q.options_latex || q.option_list || q.choices;
    if (Array.isArray(rawOptionsList) && rawOptionsList.length > 0) {
      rawOptionsList.forEach((opt: any, idx: number) => {
        const letter = letters[idx] || `${idx + 1}`;
        const text = typeof opt === "string" ? opt : opt?.option_text || opt?.text || opt?.latex || "";
        const diagram = opt?.option_img || opt?.diagram || (Array.isArray(q.options_diag) ? q.options_diag[idx] : undefined);

        const isUserChoice =
          String(rawUserAns).toUpperCase() === letter ||
          String(rawUserAns).toUpperCase() === String(idx) ||
          String(rawUserAns).trim() === String(text).trim();

        const isCorrect =
          String(rawCorrectAns).toUpperCase() === letter ||
          String(rawCorrectAns).toUpperCase() === String(idx) ||
          opt?.is_correct === true ||
          String(rawCorrectAns).trim() === String(text).trim();

        options.push({
          letter,
          text,
          diagram: diagram ? getImageUrl(diagram) : undefined,
          isCorrect,
          isUserChoice,
        });
      });
      return options;
    }

    // Format B: Explicit properties option1_latex, option2_latex, ...
    for (let i = 1; i <= 6; i++) {
      const optText = q[`option${i}_latex`] ?? q[`option${i}`] ?? q[`option_${i}`];
      if (optText !== undefined && optText !== null) {
        const letter = letters[i - 1];
        const optImg = q[`option${i}_img`] ?? q[`option_${i}_img`] ?? (Array.isArray(q.options_diag) ? q.options_diag[i - 1] : undefined);

        const isUserChoice =
          String(rawUserAns).toUpperCase() === letter ||
          String(rawUserAns).toUpperCase() === String(i - 1) ||
          String(rawUserAns).trim() === String(optText).trim();

        const isCorrect =
          String(rawCorrectAns).toUpperCase() === letter ||
          String(rawCorrectAns).toUpperCase() === String(i - 1) ||
          String(rawCorrectAns).trim() === String(optText).trim();

        options.push({
          letter,
          text: String(optText),
          diagram: optImg ? getImageUrl(optImg) : undefined,
          isCorrect,
          isUserChoice,
        });
      }
    }

    return options;
  };

  // Helper to normalize single question
  const normalizeQuestion = (q: any, idx: number): NormalizedQuestion => {
    const rawUserAns = q.user_answer ?? q.selected_option ?? q.user_attempt ?? null;
    const rawCorrectAns = q.correct_option ?? q.correct_answer ?? q.answer ?? null;

    // Status normalization
    let status: "CORRECT" | "INCORRECT" | "SKIPPED" = "SKIPPED";
    const remark = (q.answer_remark || q.status || q.remark || "").toUpperCase();

    if (remark === "CORRECT" || q.is_correct === true) {
      status = "CORRECT";
    } else if (remark === "INCORRECT" || q.is_correct === false) {
      status = "INCORRECT";
    } else if (rawUserAns !== null && rawUserAns !== undefined && rawUserAns !== "" && rawUserAns !== "None") {
      if (String(rawUserAns).toUpperCase() === String(rawCorrectAns).toUpperCase()) {
        status = "CORRECT";
      } else {
        status = "INCORRECT";
      }
    } else {
      status = "SKIPPED";
    }

    const options = parseOptions(q, rawUserAns, rawCorrectAns);

    // If options marked isCorrect, update correct answer display if missing
    let resolvedCorrectAnswer = rawCorrectAns ? String(rawCorrectAns).toUpperCase() : null;
    if (!resolvedCorrectAnswer) {
      const correctOpt = options.find((o) => o.isCorrect);
      if (correctOpt) resolvedCorrectAnswer = correctOpt.letter;
    }

    const rawDiagrams = q.question_diagrams_url || q.que_diag || q.diagrams || q.images || [];
    const diagrams = (Array.isArray(rawDiagrams) ? rawDiagrams : [rawDiagrams])
      .filter(Boolean)
      .map((d: string) => getImageUrl(d));

    const rawSolDiagrams = q.solution_diagrams_url || q.sol_diag || q.solution_images || [];
    const explanationDiagrams = (Array.isArray(rawSolDiagrams) ? rawSolDiagrams : [rawSolDiagrams])
      .filter(Boolean)
      .map((d: string) => getImageUrl(d));

    const explanation =
      q.solution_latex ||
      q.answer_description ||
      q.solution ||
      q.explanation ||
      q.sol_text ||
      q.solution_text ||
      "";

    return {
      id: q.question_id || q.id || idx + 1,
      index: idx + 1,
      questionText: q.question_latex || q.que || q.question_text || q.question || "Question text not provided.",
      diagrams,
      options,
      userAnswer: rawUserAns ? String(rawUserAns).toUpperCase() : null,
      correctAnswer: resolvedCorrectAnswer,
      status,
      marks: Number(q.marks || q.mark || 1),
      negativeMarks: Number(q.negative_marks || 0),
      timeTaken: q.time_taken ? Number(q.time_taken) : undefined,
      explanation,
      explanationDiagrams,
      difficulty: q.difficulty_level || q.difficulty,
      subjectName: q.subject_name || q.subject,
    };
  };

  // Sections and Questions Normalization
  const sections: NormalizedSection[] = useMemo(() => {
    if (!rawData) return [];

    // Case 1: Multi-section array (sub_division_data / sub_division_details / sections)
    const rawSections =
      rawData.sub_division_data ||
      rawData.sub_division_details ||
      rawData.sections ||
      rawData.sub_divisions;

    if (Array.isArray(rawSections) && rawSections.length > 0) {
      let cumulativeIndex = 0;
      return rawSections.map((sec: any, secIdx: number) => {
        const secQuestions = sec.questions || sec.solution_data || sec.question_list || sec.sub_division_data || [];
        const normalizedQs = (Array.isArray(secQuestions) ? secQuestions : []).map((q: any) => {
          cumulativeIndex++;
          return normalizeQuestion(q, cumulativeIndex - 1);
        });

        return {
          id: sec.sub_div_id || sec.section_id || secIdx + 1,
          name: sec.sub_div_name || sec.section_name || sec.section_heading || `Section ${secIdx + 1}`,
          questions: normalizedQs,
        };
      });
    }

    // Case 2: Flat questions array
    const rawQuestions =
      rawData.questions ||
      rawData.assessment_questions ||
      rawData.question_bank_response_list ||
      rawData.question_data ||
      rawData.data?.questions ||
      [];

    if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
      return [
        {
          id: 1,
          name: rawData.subject_name || rawData.assessment_name || "All Questions",
          questions: rawQuestions.map((q: any, idx: number) => normalizeQuestion(q, idx)),
        },
      ];
    }

    return [];
  }, [rawData]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const allQuestions = sections.flatMap((s) => s.questions);
    const totalQuestions = allQuestions.length || rawData?.total_questions || 0;
    const correctCount = allQuestions.filter((q) => q.status === "CORRECT").length;
    const incorrectCount = allQuestions.filter((q) => q.status === "INCORRECT").length;
    const skippedCount = allQuestions.filter((q) => q.status === "SKIPPED").length;

    const totalMarks =
      rawData?.total_marks ??
      (allQuestions.reduce((acc, q) => acc + q.marks, 0) || totalQuestions);

    const obtainedMarks =
      rawData?.obtained_marks ??
      rawData?.score ??
      rawData?.marks_obtained ??
      allQuestions.reduce((acc, q) => {
        if (q.status === "CORRECT") return acc + q.marks;
        if (q.status === "INCORRECT") return acc - q.negativeMarks;
        return acc;
      }, 0);

    const accuracy =
      totalQuestions > 0 && correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : totalMarks > 0
        ? Math.round((Math.max(0, obtainedMarks) / totalMarks) * 100)
        : 0;

    const timeTaken = rawData?.time_taken ?? rawData?.total_time ?? 0;

    return {
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      totalMarks,
      obtainedMarks,
      accuracy,
      timeTaken,
    };
  }, [sections, rawData]);

  // Current active section
  const currentSection = sections[activeSectionIdx] || sections[0] || null;

  // Filtered questions based on status pill
  const filteredQuestions = useMemo(() => {
    if (!currentSection) return [];
    if (statusFilter === "ALL") return currentSection.questions;
    return currentSection.questions.filter((q) => q.status === statusFilter);
  }, [currentSection, statusFilter]);

  // Toggle individual explanation accordion
  const toggleExplanation = (id: string | number) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle all explanations at once
  const toggleAllExplanations = () => {
    if (!currentSection) return;
    const allExpanded = currentSection.questions.every((q) => expandedSolutions[q.id]);
    const newState: Record<string | number, boolean> = {};
    currentSection.questions.forEach((q) => {
      newState[q.id] = !allExpanded;
    });
    setExpandedSolutions(newState);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Handle navigation back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Assessment title & metadata
  const assessmentTitle =
    rawData?.assessment_name ||
    rawData?.name ||
    assessment?.assessment_name ||
    assessment?.name ||
    "Dynamic Assessment Solution";

  const subjectName =
    rawData?.subject_name ||
    rawData?.subject ||
    assessment?.subject_name ||
    assessment?.category ||
    "Dynamic Assessment";

  const patternType =
    rawData?.pattern_name ||
    rawData?.assessment_type ||
    rawData?.exam_level ||
    assessment?.pattern_name ||
    assessment?.assessment_type ||
    "Standard";

  // Loading View
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-slate-100">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Loading Solutions</h3>
          <p className="text-slate-500 text-sm font-medium">Fetching detailed analysis & step-by-step explanations...</p>
        </div>
      </div>
    );
  }

  // Error View
  if (error || !rawData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">Unable to Load Solutions</h3>
            <p className="text-slate-500 text-sm">{error || "No solution records were found for this assessment."}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleBack} className="rounded-xl font-bold cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={fetchSolutionData} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans animate-in fade-in duration-300">
      {/* Top Floating App Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer shrink-0"
              title="Back to Results"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Solution & Analysis
                </span>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline truncate">{subjectName}</span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 truncate leading-tight mt-0.5">
                {assessmentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="outline" className="hidden md:inline-flex bg-slate-50 border-slate-200 text-slate-700 font-bold px-3 py-1 rounded-xl text-xs">
              {patternType}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllExplanations}
              className="rounded-xl border-slate-200 font-bold text-xs h-9 cursor-pointer hover:border-indigo-200 hover:text-indigo-600"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Toggle All Explanations</span>
              <span className="sm:hidden">Toggle All</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Performance Overview Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle decorative background aura */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400/20">
                <Sparkles className="w-3.5 h-3.5" />
                Performance Report
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{assessmentTitle}</h2>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Review your responses, correct answers, and comprehensive explanations below to reinforce your understanding.
              </p>
            </div>

            {/* Score Highlight Box */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-900 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">Total Score</span>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {metrics.obtainedMarks}
                  <span className="text-base text-indigo-300 font-semibold"> / {metrics.totalMarks}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  {metrics.accuracy}% Accuracy Rate
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 relative z-10">
            {/* Total Questions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Questions</span>
                <HelpCircle className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">{metrics.totalQuestions}</div>
            </div>

            {/* Correct */}
            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Correct</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300">{metrics.correctCount}</div>
            </div>

            {/* Incorrect */}
            <div className="bg-rose-500/10 border border-rose-400/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Incorrect</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-300">{metrics.incorrectCount}</div>
            </div>

            {/* Skipped */}
            <div className="bg-slate-500/10 border border-slate-400/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Skipped</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-200">{metrics.skippedCount}</div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs (if multiple sections exist) */}
        {sections.length > 1 && (
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
            {sections.map((section, sIdx) => {
              const secCorrect = section.questions.filter((q) => q.status === "CORRECT").length;
              const secTotal = section.questions.length;
              const isActive = activeSectionIdx === sIdx;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIdx(sIdx)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-102"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{section.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {secCorrect}/{secTotal}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter Chips Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Filter:
            </span>

            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({currentSection?.questions.length || 0})
            </button>

            <button
              onClick={() => setStatusFilter("CORRECT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === "CORRECT"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <Check className="w-3 h-3" />
              Correct ({currentSection?.questions.filter((q) => q.status === "CORRECT").length || 0})
            </button>

            <button
              onClick={() => setStatusFilter("INCORRECT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === "INCORRECT"
                  ? "bg-rose-600 text-white shadow-xs font-black"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              <X className="w-3 h-3" />
              Incorrect ({currentSection?.questions.filter((q) => q.status === "INCORRECT").length || 0})
            </button>

            <button
              onClick={() => setStatusFilter("SKIPPED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "SKIPPED"
                  ? "bg-slate-700 text-white shadow-xs font-black"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Skipped ({currentSection?.questions.filter((q) => q.status === "SKIPPED").length || 0})
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 text-right">
            Showing <strong className="text-slate-900">{filteredQuestions.length}</strong> of{" "}
            {currentSection?.questions.length || 0} questions
          </div>
        </div>

        {/* Questions Solution List */}
        <div className="space-y-6">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => {
              const isExpanded = Boolean(expandedSolutions[q.id]);

              return (
                <div
                  key={q.id}
                  id={`question-${q.id}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-indigo-200 hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-black text-base shadow-xs">
                        Q{q.index}
                      </span>
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">
                          <QuestionMathJax content={q.questionText} />
                        </div>

                        {/* Question Diagrams if any */}
                        {q.diagrams && q.diagrams.length > 0 && (
                          <div className="pt-3 flex flex-wrap gap-4">
                            {q.diagrams.map((url, dIdx) => (
                              <div
                                key={dIdx}
                                className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow-xs max-w-sm"
                              >
                                <img
                                  src={url}
                                  alt={`Question diagram ${dIdx + 1}`}
                                  className="max-h-48 w-auto object-contain mx-auto rounded-xl"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge & Marks */}
                    <div className="flex items-center md:flex-col items-end gap-2 shrink-0 self-start">
                      <span
                        className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border ${
                          q.status === "CORRECT"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : q.status === "INCORRECT"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {q.status === "CORRECT" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {q.status === "INCORRECT" && <XCircle className="w-4 h-4 text-rose-600" />}
                        {q.status === "SKIPPED" && <Clock className="w-4 h-4 text-slate-500" />}
                        {q.status}
                      </span>

                      <div className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        +{q.marks} Marks {q.negativeMarks > 0 ? `| -${q.negativeMarks}` : ""}
                      </div>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {q.options.map((opt) => {
                      return (
                        <div
                          key={opt.letter}
                          className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                            opt.isCorrect
                              ? "bg-emerald-50/70 border-emerald-400 text-emerald-950 shadow-xs"
                              : opt.isUserChoice
                              ? "bg-rose-50/70 border-rose-400 text-rose-950 shadow-xs"
                              : "bg-white border-slate-100 text-slate-700 hover:border-slate-200"
                          }`}
                        >
                          {/* Option Letter Pill */}
                          <div
                            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
                              opt.isCorrect
                                ? "bg-emerald-600 text-white"
                                : opt.isUserChoice
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {opt.letter}
                          </div>

                          {/* Option Text & MathJax */}
                          <div className="flex-1 text-sm sm:text-base font-semibold leading-relaxed pt-0.5">
                            <QuestionMathJax content={opt.text} />

                            {opt.diagram && (
                              <img
                                src={opt.diagram}
                                alt={`Option ${opt.letter} Diagram`}
                                className="mt-2 max-h-24 w-auto object-contain rounded-lg border border-slate-200"
                              />
                            )}
                          </div>

                          {/* Indicators */}
                          {opt.isCorrect && (
                            <div className="shrink-0 flex items-center gap-1 text-[11px] font-black uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              <Check className="w-3.5 h-3.5" />
                              Correct
                            </div>
                          )}
                          {!opt.isCorrect && opt.isUserChoice && (
                            <div className="shrink-0 flex items-center gap-1 text-[11px] font-black uppercase text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                              <X className="w-3.5 h-3.5" />
                              Your Choice
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Question Bottom Summary & Toggle Solution */}
                  <div className="px-6 sm:px-8 pb-6 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                      <div>
                        Your Answer:{" "}
                        <strong
                          className={
                            q.status === "CORRECT"
                              ? "text-emerald-600 font-black"
                              : q.status === "INCORRECT"
                              ? "text-rose-600 font-black"
                              : "text-slate-500 font-black"
                          }
                        >
                          {q.userAnswer || "Not Attempted"}
                        </strong>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div>
                        Correct Answer:{" "}
                        <strong className="text-emerald-700 font-black">Option {q.correctAnswer || "—"}</strong>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExplanation(q.id)}
                      className={`rounded-xl font-bold text-xs h-9 px-4 transition-all cursor-pointer ${
                        isExpanded
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                      {isExpanded ? "Hide Solution" : "View Solution"}
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-1.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                      )}
                    </Button>
                  </div>

                  {/* Expandable Explanation Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-slate-50/80 border-t border-slate-200"
                      >
                        <div className="p-6 sm:p-8 space-y-4">
                          <div className="flex items-center gap-2 text-indigo-900 font-black text-sm uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            Step-by-Step Explanation
                          </div>

                          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-sm sm:text-base leading-relaxed text-slate-800 font-medium">
                            {q.explanation ? (
                              <QuestionMathJax content={q.explanation} />
                            ) : (
                              <p className="text-slate-400 italic">
                                Detailed explanation is not available for this question. Correct answer is option{" "}
                                <strong>{q.correctAnswer}</strong>.
                              </p>
                            )}

                            {/* Solution Diagrams if any */}
                            {q.explanationDiagrams && q.explanationDiagrams.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-slate-100">
                                {q.explanationDiagrams.map((dUrl, sIdx) => (
                                  <img
                                    key={sIdx}
                                    src={dUrl}
                                    alt={`Solution Diagram ${sIdx + 1}`}
                                    className="max-h-52 w-auto object-contain rounded-xl border border-slate-200 bg-white p-2"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">No questions match filter</h4>
              <p className="text-slate-400 text-xs">Try selecting a different filter option above.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter("ALL")}
                className="rounded-xl font-bold text-xs"
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="w-full sm:w-auto px-8 h-12 rounded-2xl border-slate-200 text-slate-700 font-bold hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessment List
          </Button>

          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-8 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 cursor-pointer"
          >
            Back to Top
          </Button>
        </div>
      </main>
    </div>
  );
}

export default DynamicAssessmentSolutions;
