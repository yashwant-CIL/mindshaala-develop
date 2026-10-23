import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { ScrollArea } from "../../ui/scroll-area";
import { Slider } from "../../ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { 
  CheckCircle2, 
  FlaskConical, 
  Calculator, 
  Globe, 
  BookOpen,
  Sparkles,
  Layers,
  Award,
  Clock,
  ChevronDown,
  Sliders,
  ShieldCheck,
  Loader2,
  Search,
  X,
  FileText,
  Target,
  Zap,
  Atom,
  Plus,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  BarChart,
  Calendar,
  AlertCircle
} from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast as toastify, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DynamicAssessmentService } from "../../../services/DynamicAssessmentService";
import { CommonApiServices } from "../../../services/CommonApiServices";
import { useCourse } from "../../../context/CourseContext";
import { SectionDetailsPage } from "./SectionDetailsPage";
import { MCQExamScreen } from "./ExamScreens/MCQExamScreen";
import Cookies from "js-cookie";

export interface PatternSubject {
  subject_id: number;
  subject_name: string;
  questions_count: number;
  marks: number;
}

export interface MockLevelConfig {
  total_marks: number;
  total_questions: number;
  subjects: PatternSubject[];
}

export interface SubjectLevelConfig {
  allowed_marks?: number[];
  default_marks?: number;
  default_questions?: number;
  questions_count?: number;
  biology_questions?: number;
  biology_marks?: number;
  [key: string]: any;
}

export interface ChapterLevelConfig {
  allowed_marks?: number[];
  default_marks?: number;
  questions_count?: number;
  [key: string]: any;
}

export interface AssessmentPattern {
  pattern_id: number;
  category: "academics" | "competitive" | string;
  pattern_name: string;
  default_per_question_time: number;
  marks_per_question: number;
  negative_marks_per_question: number;
  question_type_id: string;
  subscription_ids?: number[];
  created_by?: string;
  is_admin?: boolean;
  user_id?: number | null;
  mock_level: MockLevelConfig | null;
  subject_level: SubjectLevelConfig | null;
  chapter_level: ChapterLevelConfig | null;
}

export interface ApiSubject {
  subject_id?: number | string;
  id?: number | string;
  subject_name?: string;
  name?: string;
  subject_code?: string;
  description?: string;
}

export interface ApiChapter {
  chapter_id?: number | string;
  id?: number | string;
  chapter_name?: string;
  name?: string;
  subject_id?: number | string;
  description?: string;
}

export interface TestConfig {
  testType: "mcq" | "theory" | "ai" | "SECTION_WISE";
  selectedSubject: string;
  selectedChapters: string[];
  difficultyDistribution: { easy: number; medium: number; hard: number };
  totalMarks: number;
  duration: number;
  includePreviousWrong: boolean;
  randomizeOrder: boolean;
  userAssessmentId?: number | string;
  assessmentType?: string;
  assessmentMethod?: string;
  userImage?: string | null;
  fullExamDetails?: any;
  patternId?: number;
  patternName?: string;
  examLevel?: "mock" | "subject" | "chapter";
  patternDetails?: any;
  isDynamic?: boolean;
  source?: "dynamic" | "available" | string;
  user_id?: number | string | null;
  userId?: number | string | null;
  subscription_id?: number | string | null;
  subscriptionId?: number | string | null;
}

export interface GeneratedAssessment {
  assessment_id?: number | string;
  id?: number | string;
  user_ass_id?: number | string;
  dynamic_assessment_id?: number | string;
  assessment_name?: string;
  name?: string;
  title?: string;
  assessment_status?: string;
  status?: string;
  completion_status?: string;
  subject_name?: string;
  subject?: string;
  topic?: string;
  description?: string;
  chapters?: string[];
  chapter_name?: string;
  pattern_name?: string;
  pattern_id?: number;
  assessment_type?: string;
  assessmentType?: string;
  exam_level?: string;
  assessment_method?: string;
  assessmentMethod?: string;
  total_marks?: number;
  marks?: number;
  total_question?: number;
  total_questions?: number;
  questions_count?: number;
  total_time?: number;
  duration?: number;
  time_duration?: number;
  created_at?: string;
  start_time?: string;
  ass_start_time?: string;
  submitted_at?: string;
  difficulty_distribution?: { easy: number; medium: number; hard: number };
  score?: number;
  obtained_marks?: number;
  full_exam_details?: any;
  [key: string]: any;
}

export interface DynamicTestGeneratorProps {
  onStartTest: (config: TestConfig) => void;
  onNavigate?: (page: string, params?: any) => void;
}

export type CustomTestGeneratorProps = DynamicTestGeneratorProps;

/*
// Static fallback patterns commented out - only real API patterns are used
const FALLBACK_PATTERNS: AssessmentPattern[] = [
  {
    pattern_id: 1000,
    category: "academics",
    pattern_name: "ICSE 7th Academics Pattern",
    default_per_question_time: 60,
    marks_per_question: 1,
    negative_marks_per_question: 0.0,
    question_type_id: "100012",
    subscription_ids: [100018],
    created_by: "admin",
    is_admin: true,
    user_id: null,
    mock_level: null,
    subject_level: {
      allowed_marks: [20, 50],
      default_marks: 20,
    },
    chapter_level: {
      allowed_marks: [20, 50],
      default_marks: 20,
    },
  },
  {
    pattern_id: 1001,
    category: "competitive",
    pattern_name: "NEET",
    default_per_question_time: 60,
    marks_per_question: 4,
    negative_marks_per_question: 1.0,
    question_type_id: "100024",
    subscription_ids: [100019],
    created_by: "admin",
    is_admin: true,
    user_id: null,
    mock_level: {
      total_marks: 720,
      total_questions: 180,
      subjects: [
        {
          subject_id: 1026,
          subject_name: "Physics",
          questions_count: 45,
          marks: 180,
        },
        {
          subject_id: 1027,
          subject_name: "Chemistry",
          questions_count: 45,
          marks: 180,
        },
        {
          subject_id: 1028,
          subject_name: "Biology",
          questions_count: 90,
          marks: 360,
        },
      ],
    },
    subject_level: {
      allowed_marks: [180, 360],
      default_questions: 45,
      biology_questions: 90,
      default_marks: 180,
      biology_marks: 360,
    },
    chapter_level: {
      allowed_marks: [180],
      questions_count: 45,
      default_marks: 180,
    },
  },
];
*/

export function DynamicTestGenerator({ onStartTest, onNavigate }: DynamicTestGeneratorProps) {
  // Toast notification helper using react-toastify with reverse countdown progress bar
  const toast = useMemo(() => {
    const notify = (args: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive" | "success" | "warning" | string;
      duration?: number;
    } | string) => {
      if (typeof args === "string") {
        return toastify.info(args, {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }

      const { title, description, variant = "default", duration = 3000 } = args;
      const isDestructive = variant === "destructive" || variant === "error";
      const isSuccess = variant === "success" || (title && /success/i.test(title));
      const isWarning = variant === "warning" || variant === "warn";

      const content = (
        <div className="flex flex-col gap-0.5 text-left">
          {title && (
            <div className="text-sm font-semibold text-slate-900 leading-tight">
              {title}
            </div>
          )}
          {description && (
            <div className="text-xs text-slate-600 leading-snug mt-0.5">
              {description}
            </div>
          )}
        </div>
      );

      const options: ToastOptions = {
        autoClose: duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      };

      if (isDestructive) {
        return toastify.error(content, options);
      }
      if (isSuccess) {
        return toastify.success(content, options);
      }
      if (isWarning) {
        return toastify.warn(content, options);
      }
      return toastify.info(content, options);
    };

    notify.success = (msg: string | React.ReactNode, opts?: ToastOptions) =>
      toastify.success(msg, { autoClose: 3000, hideProgressBar: false, ...opts });
    notify.error = (msg: string | React.ReactNode, opts?: ToastOptions) =>
      toastify.error(msg, { autoClose: 3000, hideProgressBar: false, ...opts });
    notify.info = (msg: string | React.ReactNode, opts?: ToastOptions) =>
      toastify.info(msg, { autoClose: 3000, hideProgressBar: false, ...opts });
    notify.warn = (msg: string | React.ReactNode, opts?: ToastOptions) =>
      toastify.warn(msg, { autoClose: 3000, hideProgressBar: false, ...opts });
    notify.dismiss = (id?: string | number) => toastify.dismiss(id);

    return notify;
  }, []);
  const { subscriptionId: contextSubscriptionId } = useCourse();

  // Resolved active user id
  const activeUserId = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("user_id") ||
        localStorage.getItem("userId") ||
        Cookies.get("user_id") ||
        Cookies.get("userId");
      if (stored) return Number(stored);
    }
    return null;
  }, []);

  // Resolved active subscription id
  const activeSubscriptionId = useMemo(() => {
    if (contextSubscriptionId) return Number(contextSubscriptionId);
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("subscription_id") ||
        localStorage.getItem("subscriptionId") ||
        Cookies.get("subscription_id") ||
        Cookies.get("subscriptionId");
      if (stored) return Number(stored);
    }
    return null;
  }, [contextSubscriptionId]);

  // -------------------------------------------------------------
  // LIST OF ALREADY GENERATED ASSESSMENTS STATE
  // -------------------------------------------------------------
  const [generatedAssessments, setGeneratedAssessments] = useState<GeneratedAssessment[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "READY" | "SUBMITTED">("ALL");
  const [selectedSectionAssessment, setSelectedSectionAssessment] = useState<GeneratedAssessment | null>(null);
  const [activeMCQExam, setActiveMCQExam] = useState<{
    userAssessmentId?: number | string;
    user_ass_id?: number | string;
    userId?: number | string | null;
    user_id?: number | string | null;
    subscriptionId?: number | string | null;
    subscription_id?: number | string | null;
    sectionId?: number;
    user_ass_div_id?: number | string;
    sectionName?: string;
    allSections?: any;
  } | null>(null);

  // Fetch already generated dynamic assessments using GET_GENERATED_DYNAMIC_ASSESSMENT
  const fetchGeneratedAssessments = useCallback(async () => {
    if (!activeUserId || !activeSubscriptionId) return;
    setIsLoadingAssessments(true);
    try {
      console.log("Fetching generated dynamic assessments for user_id:", activeUserId, "subscription_id:", activeSubscriptionId);
      const res = await DynamicAssessmentService.GET_GENERATED_DYNAMIC_ASSESSMENT(
        Number(activeUserId),
        Number(activeSubscriptionId)
      );
      console.log("Response from GET_GENERATED_DYNAMIC_ASSESSMENT:", res);

      const list: GeneratedAssessment[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.assessments)
        ? res.assessments
        : Array.isArray(res?.data?.assessments)
        ? res.data.assessments
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.results)
        ? res.results
        : [];

      setGeneratedAssessments(list);
    } catch (error) {
      console.error("Failed to fetch already generated dynamic assessments:", error);
      setGeneratedAssessments([]);
    } finally {
      setIsLoadingAssessments(false);
    }
  }, [activeUserId, activeSubscriptionId]);

  useEffect(() => {
    fetchGeneratedAssessments();
  }, [fetchGeneratedAssessments]);

  // Filter & Search generated assessments
  const filteredAssessments = useMemo(() => {
    return generatedAssessments.filter((item) => {
      const name = (item.assessment_name || item.name || item.title || item.pattern_name || "").toLowerCase();
      const subject = (item.subject_name || item.subject || "").toLowerCase();
      const type = (item.assessment_type || item.assessmentType || item.exam_level || "").toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || name.includes(q) || subject.includes(q) || type.includes(q);

      const status = (item.assessment_status || item.status || item.completion_status || "").toUpperCase();
      const isSubmitted = status === "SUBMITTED" || status === "COMPLETED";

      if (statusFilter === "SUBMITTED") return matchesSearch && isSubmitted;
      if (statusFilter === "READY") return matchesSearch && !isSubmitted;
      return matchesSearch;
    });
  }, [generatedAssessments, searchQuery, statusFilter]);

  // Counts for filter pills
  const { readyCount, submittedCount } = useMemo(() => {
    let ready = 0;
    let submitted = 0;
    generatedAssessments.forEach((item) => {
      const s = (item.assessment_status || item.status || item.completion_status || "").toUpperCase();
      if (s === "SUBMITTED" || s === "COMPLETED") {
        submitted++;
      } else {
        ready++;
      }
    });
    return { readyCount: ready, submittedCount: submitted };
  }, [generatedAssessments]);

  // Handler to start an already generated assessment
  const handleStartExistingAssessment = (item: GeneratedAssessment) => {
    const rawType = (item.assessment_type || item.assessmentType || item.exam_level || "").toLowerCase();
    const isSectionWise = rawType === "section_wise" || rawType === "sectionwise" || rawType.includes("section");
    const isStandard = rawType === "standard" || !isSectionWise;

    const userAssId = item.user_ass_id || item.assessment_id || item.id || item.dynamic_assessment_id;
    if (userAssId && typeof window !== "undefined") {
      localStorage.setItem("user_ass_id", String(userAssId));
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("is_dynamic_assessment", "true");
    }

    const subjectName =
      item.subject_name ||
      item.subject ||
      (isStandard
        ? item.pattern_name || item.assessment_name || "Standard Assessment"
        : isSectionWise
        ? "Section-Wise Assessment"
        : "Dynamic Assessment");

    const singleChapter = item.topic || item.chapter_name;
    const chapterNames: string[] = Array.isArray(item.chapters)
      ? item.chapters.filter((c): c is string => Boolean(c))
      : singleChapter
      ? [singleChapter]
      : [];

    const rawDurationSeconds = Number(item.total_time || item.duration || item.time_duration || 0);
    const durationInMinutes = rawDurationSeconds > 0 ? Math.max(1, Math.round(rawDurationSeconds / 60)) : 0;

    const config: TestConfig = {
      testType: isSectionWise ? "SECTION_WISE" : "mcq",
      selectedSubject: subjectName,
      selectedChapters: chapterNames,
      difficultyDistribution: item.difficulty_distribution || { easy: 30, medium: 50, hard: 20 },
      totalMarks: Number(item.total_marks || item.marks || 0),
      duration: durationInMinutes,
      includePreviousWrong: false,
      randomizeOrder: true,
      userAssessmentId: userAssId,
      assessmentType: isSectionWise ? "SECTION_WISE" : "STANDARD",
      assessmentMethod: "MCQ",
      patternId: item.pattern_id,
      patternName: item.pattern_name || item.assessment_name,
      fullExamDetails: {
        ...(item.full_exam_details || item),
        assessment_type: isSectionWise ? "SECTION_WISE" : "STANDARD",
        isDynamic: true,
        source: "dynamic",
        user_ass_id: userAssId,
        user_id: activeUserId,
        subscription_id: activeSubscriptionId,
      },
      isDynamic: true,
      source: "dynamic",
    };

    console.log("Starting existing dynamic assessment:", { isStandard, isSectionWise, userAssId, config });

    if (isStandard) {
      // STANDARD: Direct navigate on MCQExamScreen with user_ass_id parameter
      setSelectedSectionAssessment(null);
      setActiveMCQExam({
        userAssessmentId: userAssId,
        user_ass_id: userAssId,
        userId: activeUserId,
        user_id: activeUserId,
        subscriptionId: activeSubscriptionId,
        subscription_id: activeSubscriptionId,
        sectionId: 0,
        sectionName: item.assessment_name || item.pattern_name || "Standard Assessment",
        allSections: {
          ...(item.full_exam_details || item),
          assessment_type: "STANDARD",
          isDynamic: true,
          source: "dynamic",
          user_ass_id: userAssId,
          user_id: activeUserId,
          subscription_id: activeSubscriptionId,
        },
      });
      if (onStartTest) {
        onStartTest(config);
      }
    } else {
      // SECTION_WISE: ONLY navigate on the section details first
      setActiveMCQExam(null);
      setSelectedSectionAssessment(item);
      if (onStartTest) {
        onStartTest(config);
      }
    }
  };

  // Helper date formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper to convert time in seconds (from API) into minutes for display
  const formatSecondsToMinutes = (secondsVal?: number | string | null): string | number => {
    if (secondsVal === undefined || secondsVal === null || secondsVal === "" || secondsVal === "-") {
      return "-";
    }
    const sec = Number(secondsVal);
    if (isNaN(sec)) return secondsVal;
    if (sec <= 0) return 0;
    return Math.max(1, Math.round(sec / 60));
  };

  // -------------------------------------------------------------
  // GENERATOR POPUP MODAL STATE & FORM LOGIC
  // -------------------------------------------------------------
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"form" | "summary">("form");

  // Pattern state
  const [patterns, setPatterns] = useState<AssessmentPattern[]>([]);
  const [selectedPatternId, setSelectedPatternId] = useState<number | null>(null);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);

  // Exam Level: Mock | Subject Level | Chapter Level
  const [selectedExamLevel, setSelectedExamLevel] = useState<"mock" | "subject" | "chapter">("subject");

  // Subjects & Chapters State
  const [subjectsList, setSubjectsList] = useState<ApiSubject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | number>("");

  const [chaptersList, setChaptersList] = useState<ApiChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [selectedChapterIds, setSelectedChapterIds] = useState<(string | number)[]>([]);
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");

  // Marks configuration
  const [selectedMarks, setSelectedMarks] = useState<number>(0);

  // Difficulty Distribution state
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 30,
    medium: 50,
    hard: 20,
  });

  // Additional settings
  const [includePreviousWrong, setIncludePreviousWrong] = useState(false);
  const [randomizeOrder, setRandomizeOrder] = useState(true);

  // Generating loading state
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Fetch Patterns using DynamicAssessmentService.GET_PATTERN only when create modal form is opened
  useEffect(() => {
    let isMounted = true;
    if (!isCreateModalOpen || !activeSubscriptionId) {
      return;
    }

    if (patterns.length > 0) {
      return;
    }

    const fetchPatterns = async () => {
      setIsLoadingPatterns(true);
      try {
        console.log("Fetching dynamic assessment patterns for subscriptionId:", activeSubscriptionId);
        const res = await DynamicAssessmentService.GET_PATTERN(activeSubscriptionId);
        console.log("Dynamic patterns response:", res);

        const list: AssessmentPattern[] =
          res?.patterns || (Array.isArray(res) ? res : res?.data?.patterns || []);

        if (isMounted) {
          if (Array.isArray(list) && list.length > 0) {
            setPatterns(list);
            setSelectedPatternId((prev) => prev || list[0].pattern_id);
          } else {
            console.warn("No patterns returned from backend.");
            setPatterns([]);
            setSelectedPatternId(null);
          }
        }
      } catch (error) {
        console.error("Failed to load assessment patterns from backend:", error);
        if (isMounted) {
          setPatterns([]);
          setSelectedPatternId(null);
        }
      } finally {
        if (isMounted) setIsLoadingPatterns(false);
      }
    };

    fetchPatterns();
    return () => {
      isMounted = false;
    };
  }, [isCreateModalOpen, activeSubscriptionId, patterns.length]);

  // Selected pattern object
  const selectedPattern = useMemo(() => {
    return patterns.find((p) => p.pattern_id === selectedPatternId) || null;
  }, [patterns, selectedPatternId]);

  // Exam Level Availability Flags
  const isMockAvailable = Boolean(selectedPattern?.mock_level);
  const isSubjectAvailable = Boolean(selectedPattern?.subject_level);
  const isChapterAvailable = Boolean(selectedPattern?.chapter_level);

  // Sync selected exam level when pattern changes
  useEffect(() => {
    if (!selectedPattern) return;

    if (selectedExamLevel === "mock" && !isMockAvailable) {
      if (isSubjectAvailable) setSelectedExamLevel("subject");
      else if (isChapterAvailable) setSelectedExamLevel("chapter");
    } else if (selectedExamLevel === "subject" && !isSubjectAvailable) {
      if (isMockAvailable) setSelectedExamLevel("mock");
      else if (isChapterAvailable) setSelectedExamLevel("chapter");
    } else if (selectedExamLevel === "chapter" && !isChapterAvailable) {
      if (isMockAvailable) setSelectedExamLevel("mock");
      else if (isSubjectAvailable) setSelectedExamLevel("subject");
    }
  }, [selectedPattern, isMockAvailable, isSubjectAvailable, isChapterAvailable, selectedExamLevel]);

  // 2. Fetch Subjects via CommonApiServices.GET_ALL_SUBJECTS_BY_SUBSCRIPTION_ID only when create modal is open
  useEffect(() => {
    if (!isCreateModalOpen || !activeSubscriptionId) {
      return;
    }

    if (subjectsList.length > 0) {
      return;
    }

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        console.log("Fetching subjects for subscription:", activeSubscriptionId);
        const res = await CommonApiServices.GET_ALL_SUBJECTS_BY_SUBSCRIPTION_ID(activeSubscriptionId);
        const rawList = res?.data?.subjects || res?.subjects || res?.data || (Array.isArray(res) ? res : []);

        if (Array.isArray(rawList) && rawList.length > 0) {
          setSubjectsList(rawList);
          const firstSubId = rawList[0].subject_id || rawList[0].id;
          setSelectedSubjectId(firstSubId || "");
        } else {
          setSubjectsList([]);
          setSelectedSubjectId("");
        }
      } catch (err) {
        console.error("Error fetching subjects by subscription id:", err);
        setSubjectsList([]);
        setSelectedSubjectId("");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [isCreateModalOpen, activeSubscriptionId, subjectsList.length]);

  // 3. Fetch Chapters when subject changes and Chapter Level is active
  useEffect(() => {
    if (!selectedSubjectId || selectedExamLevel !== "chapter") {
      setChaptersList([]);
      setSelectedChapterIds([]);
      setChapterSearchQuery("");
      return;
    }

    const fetchChapters = async () => {
      setIsLoadingChapters(true);
      try {
        console.log("Fetching chapters for subject:", selectedSubjectId);
        const res = await CommonApiServices.GET_ALL_CHAPTERS(selectedSubjectId);
        const rawList = res?.data?.chapters || res?.chapters || res?.data || (Array.isArray(res) ? res : []);

        if (Array.isArray(rawList) && rawList.length > 0) {
          setChaptersList(rawList);
          const firstChapId = rawList[0].chapter_id || rawList[0].id;
          setSelectedChapterIds(firstChapId ? [firstChapId] : []);
        } else {
          setChaptersList([]);
          setSelectedChapterIds([]);
        }
      } catch (err) {
        console.error("Error loading chapters:", err);
        setChaptersList([]);
        setSelectedChapterIds([]);
      } finally {
        setIsLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [selectedSubjectId, selectedExamLevel]);

  // Current Subject Object
  const currentSubjectObj = useMemo(() => {
    return (
      subjectsList.find(
        (s) => String(s.subject_id || s.id) === String(selectedSubjectId)
      ) || null
    );
  }, [subjectsList, selectedSubjectId]);

  const isBiologySelected = useMemo(() => {
    const name = currentSubjectObj?.subject_name || currentSubjectObj?.name || "";
    return name.toLowerCase().includes("bio");
  }, [currentSubjectObj]);

  // Allowed Marks Array based on level & pattern (only real allowed marks from API pattern)
  const currentAllowedMarks: number[] = useMemo(() => {
    if (!selectedPattern) return [];
    if (selectedExamLevel === "subject") {
      return (
        selectedPattern.subject_level?.allowed_marks ||
        (selectedPattern.subject_level?.default_marks
          ? [selectedPattern.subject_level.default_marks]
          : [])
      );
    }
    if (selectedExamLevel === "chapter") {
      return (
        selectedPattern.chapter_level?.allowed_marks ||
        (selectedPattern.chapter_level?.default_marks
          ? [selectedPattern.chapter_level.default_marks]
          : [])
      );
    }
    return [];
  }, [selectedPattern, selectedExamLevel]);

  // Auto-sync selectedMarks with allowed marks
  useEffect(() => {
    if (currentAllowedMarks.length > 0) {
      if (!currentAllowedMarks.includes(selectedMarks)) {
        setSelectedMarks(currentAllowedMarks[0]);
      }
    } else {
      setSelectedMarks(0);
    }
  }, [currentAllowedMarks, selectedMarks]);

  // Computed questions, duration, and marks strictly based on pattern
  const { computedTotalMarks, computedQuestionsCount, computedDurationMins } = useMemo(() => {
    if (!selectedPattern) {
      return {
        computedTotalMarks: 0,
        computedQuestionsCount: 0,
        computedDurationMins: 0,
      };
    }

    const marksPerQ = selectedPattern.marks_per_question || 1;
    const timePerQSec = selectedPattern.default_per_question_time || 60;

    if (selectedExamLevel === "mock") {
      const totalM = selectedPattern.mock_level?.total_marks || 0;
      const totalQ = selectedPattern.mock_level?.total_questions || 0;
      const duration = totalQ > 0 ? Math.max(1, Math.round((totalQ * timePerQSec) / 60)) : 0;
      return {
        computedTotalMarks: totalM,
        computedQuestionsCount: totalQ,
        computedDurationMins: duration,
      };
    }

    if (selectedExamLevel === "subject") {
      const subCfg = selectedPattern.subject_level;
      let qCount = 0;
      let totalM = selectedMarks;

      if (isBiologySelected && subCfg?.biology_questions) {
        qCount = subCfg.biology_questions;
        totalM = subCfg.biology_marks || selectedMarks;
      } else if (subCfg?.questions_count) {
        qCount = subCfg.questions_count;
      } else if (subCfg?.default_questions) {
        qCount = subCfg.default_questions;
      } else if (totalM > 0 && marksPerQ > 0) {
        qCount = Math.max(1, Math.round(totalM / marksPerQ));
      }

      const duration = qCount > 0 ? Math.max(1, Math.round((qCount * timePerQSec) / 60)) : 0;
      return {
        computedTotalMarks: totalM,
        computedQuestionsCount: qCount,
        computedDurationMins: duration,
      };
    }

    // Chapter Level
    const chapCfg = selectedPattern.chapter_level;
    const totalM = selectedMarks;
    const qCount = chapCfg?.questions_count || (totalM > 0 && marksPerQ > 0 ? Math.max(1, Math.round(totalM / marksPerQ)) : 0);
    const duration = qCount > 0 ? Math.max(1, Math.round((qCount * timePerQSec) / 60)) : 0;

    return {
      computedTotalMarks: totalM,
      computedQuestionsCount: qCount,
      computedDurationMins: duration,
    };
  }, [selectedPattern, selectedExamLevel, selectedMarks, isBiologySelected]);

  // Complexity Validation & Safe Adjustment (Never exceeds 100%)
  const totalDifficultyPercent =
    difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;
  const isDifficultyValid = totalDifficultyPercent === 100;

  // Question counts by difficulty
  const difficultyQuestionBreakdown = useMemo(() => {
    const totalQ = computedQuestionsCount;
    const easyCount = Math.round((totalQ * difficultyDistribution.easy) / 100);
    const hardCount = Math.round((totalQ * difficultyDistribution.hard) / 100);
    const mediumCount = Math.max(0, totalQ - easyCount - hardCount);
    return { easyCount, mediumCount, hardCount };
  }, [computedQuestionsCount, difficultyDistribution]);

  // Handler to guarantee complexity NEVER exceeds 100%
  const handleComplexityChange = (key: "easy" | "medium" | "hard", inputVal: number) => {
    const targetVal = Math.max(0, Math.min(100, isNaN(inputVal) ? 0 : inputVal));
    setDifficultyDistribution((prev) => {
      const otherSum =
        key === "easy"
          ? prev.medium + prev.hard
          : key === "medium"
          ? prev.easy + prev.hard
          : prev.easy + prev.medium;

      const maxAllowed = Math.max(0, 100 - otherSum);
      const clampedVal = Math.min(targetVal, maxAllowed);

      return {
        ...prev,
        [key]: clampedVal,
      };
    });
  };

  const applyDifficultyPreset = (easy: number, medium: number, hard: number) => {
    setDifficultyDistribution({ easy, medium, hard });
  };

  // Filtered chapters for Chapter Level
  const filteredChapters = useMemo(() => {
    if (!chapterSearchQuery.trim()) return chaptersList;
    const q = chapterSearchQuery.toLowerCase();
    return chaptersList.filter((c) =>
      (c.chapter_name || c.name || "").toLowerCase().includes(q)
    );
  }, [chaptersList, chapterSearchQuery]);

  const handleToggleChapter = (chapterId: string | number) => {
    setSelectedChapterIds((prev) => {
      if (prev.includes(chapterId)) {
        return prev.filter((id) => id !== chapterId);
      } else {
        return [...prev, chapterId];
      }
    });
  };

  const handleSelectAllFilteredChapters = () => {
    const filteredIds = filteredChapters.map((c) => c.chapter_id || c.id || "");
    const allFilteredSelected = filteredIds.every((id) => selectedChapterIds.includes(id));

    if (allFilteredSelected) {
      setSelectedChapterIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const union = Array.from(new Set([...selectedChapterIds, ...filteredIds]));
      setSelectedChapterIds(union);
    }
  };

  // Validation Check before opening Assessment Summary Modal
  const handleGenerateAssessmentClick = () => {
    if (!activeUserId || !activeSubscriptionId) {
      toast({
        title: "Session Missing",
        description: "Active user ID or subscription could not be detected. Please ensure you are logged in with an active course.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPattern) {
      toast({
        title: "Pattern Selection Required",
        description: "Please select an exam pattern from the dropdown first.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedExamLevel) {
      toast({
        title: "Exam Level Required",
        description: "Please select an exam level (Mock, Subject Level, or Chapter Level).",
        variant: "destructive",
      });
      return;
    }

    if (selectedExamLevel === "subject" && !selectedSubjectId) {
      toast({
        title: "Subject Required",
        description: "Please select a subject to continue.",
        variant: "destructive",
      });
      return;
    }

    if (selectedExamLevel === "chapter") {
      if (!selectedSubjectId) {
        toast({
          title: "Subject Required",
          description: "Please select a subject for the chapter level test.",
          variant: "destructive",
        });
        return;
      }
      if (selectedChapterIds.length === 0) {
        toast({
          title: "Chapter Required",
          description: "Please select at least one chapter.",
          variant: "destructive",
        });
        return;
      }
    }

    if (totalDifficultyPercent !== 100) {
      toast({
        title: "Complexity Distribution Incomplete",
        description: `Difficulty percentages must total exactly 100% (currently ${totalDifficultyPercent}%).`,
        variant: "destructive",
      });
      return;
    }

    // Move to summary view inside responsive modal
    setModalStep("summary");
  };

  // Confirmed start from the popup modal (Continue Button)
  const handleConfirmAndStart = async () => {
    if (!selectedPattern) return;
    if (!activeUserId || !activeSubscriptionId) {
      toast({
        title: "Session Missing",
        description: "Cannot generate assessment without active user and subscription ID.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    const subjectName =
      selectedExamLevel === "mock"
        ? "Full Syllabus (Mock Exam)"
        : currentSubjectObj?.subject_name || currentSubjectObj?.name || "";

    const chapterNames =
      selectedExamLevel === "chapter"
        ? chaptersList
            .filter((c) => selectedChapterIds.includes(c.chapter_id || c.id || ""))
            .map((c) => c.chapter_name || c.name || "")
        : [];

    const config: TestConfig = {
      testType: "mcq",
      selectedSubject: subjectName,
      selectedChapters: chapterNames,
      difficultyDistribution,
      totalMarks: computedTotalMarks,
      duration: computedDurationMins,
      includePreviousWrong,
      randomizeOrder,
      patternId: selectedPattern.pattern_id,
      patternName: selectedPattern.pattern_name,
      examLevel: selectedExamLevel,
      patternDetails: selectedPattern,
      assessmentType:
        selectedExamLevel === "mock"
          ? "MOCK"
          : selectedExamLevel === "subject"
          ? "SUBJECT_WISE"
          : "CHAPTER_WISE",
      assessmentMethod: "MCQ",
    };

    console.log("Confirmed assessment generation:", config);

    try {
      // Trigger backend generation with strictly dynamic parameters
      const genPayload = {
        user_id: Number(activeUserId),
        subscription_id: Number(activeSubscriptionId),
        pattern_id: Number(selectedPattern.pattern_id),
        exam_level: selectedExamLevel,
        assessment_type: config.assessmentType,
        assessment_method: "MCQ",
        subject_id: selectedExamLevel !== "mock" && selectedSubjectId ? Number(selectedSubjectId) : undefined,
        chapter_ids: selectedExamLevel === "chapter" && selectedChapterIds.length > 0 ? selectedChapterIds.map(Number) : undefined,
        total_marks: computedTotalMarks,
        duration: computedDurationMins,
        difficulty_distribution: difficultyDistribution,
      };

      const genRes = await DynamicAssessmentService.GENERATE_DYNAMIC_ASSESSMENT(genPayload);
      console.log("Assessment generation response:", genRes);

      toast({
        title: "Assessment Generated Successfully!",
        description: `Assessment "${selectedPattern.pattern_name}" has been generated. You can now see it in your dynamic assessments list below.`,
      });
    } catch (err) {
      console.warn("Backend dynamic assessment generation warning:", err);
      toast({
        title: "Generation Request Processed",
        description: "Checking updated assessments list...",
      });
    } finally {
      setIsGenerating(false);
      setIsCreateModalOpen(false);
      setModalStep("form");
      // Refresh list to display newly generated assessment on the dynamic assessment section
      fetchGeneratedAssessments();
    }
  };

  if (activeMCQExam) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white overflow-hidden w-screen h-screen">
        <MCQExamScreen
          userAssessmentId={activeMCQExam.userAssessmentId}
          user_ass_id={activeMCQExam.user_ass_id}
          userId={activeMCQExam.userId}
          user_id={activeMCQExam.user_id}
          subscriptionId={activeMCQExam.subscriptionId}
          subscription_id={activeMCQExam.subscription_id}
          sectionId={activeMCQExam.sectionId || 0}
          user_ass_div_id={activeMCQExam.user_ass_div_id}
          sectionName={activeMCQExam.sectionName || "Assessment"}
          allSections={activeMCQExam.allSections || {}}
          isDynamic={true}
          source="dynamic"
          onNavigate={onNavigate}
          onSectionSubmit={(hasNext) => {
            if (hasNext && selectedSectionAssessment) {
              setActiveMCQExam(null);
            } else {
              setActiveMCQExam(null);
              setSelectedSectionAssessment(null);
              sessionStorage.setItem("test_result_active_tab", "custom");
              localStorage.setItem("test_result_active_tab", "custom");
              fetchGeneratedAssessments();
              if (onNavigate) {
                onNavigate("test-history", { tab: "custom" });
              }
            }
          }}
          onCompleteExam={() => {
            setActiveMCQExam(null);
            setSelectedSectionAssessment(null);
            sessionStorage.setItem("test_result_active_tab", "custom");
            localStorage.setItem("test_result_active_tab", "custom");
            fetchGeneratedAssessments();
            if (onNavigate) {
              onNavigate("test-history", { tab: "custom" });
            }
          }}
        />
      </div>
    );
  }

  if (selectedSectionAssessment) {
    const rawUserAssId =
      selectedSectionAssessment.user_ass_id ||
      selectedSectionAssessment.assessment_id ||
      selectedSectionAssessment.id ||
      selectedSectionAssessment.dynamic_assessment_id;

    const assName =
      selectedSectionAssessment.assessment_name ||
      selectedSectionAssessment.name ||
      selectedSectionAssessment.pattern_name ||
      "Section-Wise Assessment";

    return (
      <SectionDetailsPage
        userAssessmentId={rawUserAssId}
        assessmentName={assName}
        isDynamic={true}
        source="dynamic"
        subscriptionId={activeSubscriptionId ?? undefined}
        userId={activeUserId ?? undefined}
        onStartSection={(sectionId, sectionName, prefetchedData) => {
          // Navigate to MCQExamScreen with user_ass_div_id parameter
          setActiveMCQExam({
            userAssessmentId: rawUserAssId,
            user_ass_id: rawUserAssId,
            userId: activeUserId,
            user_id: activeUserId,
            subscriptionId: activeSubscriptionId,
            subscription_id: activeSubscriptionId,
            sectionId: Number(sectionId),
            user_ass_div_id: sectionId,
            sectionName: sectionName,
            allSections: {
              ...(prefetchedData || {}),
              user_ass_div_id: sectionId,
              sub_div_id: sectionId,
              sub_div_name: sectionName,
              assessment_type: "SECTION_WISE",
              isDynamic: true,
              source: "dynamic",
              user_ass_id: rawUserAssId,
              user_id: activeUserId,
              subscription_id: activeSubscriptionId,
            },
          });
          if (onStartTest) {
            const rawSectionSeconds = Number(selectedSectionAssessment.total_time || selectedSectionAssessment.duration || selectedSectionAssessment.time_duration || 0);
            const sectionDurationInMinutes = rawSectionSeconds > 0 ? Math.max(1, Math.round(rawSectionSeconds / 60)) : 0;

            onStartTest({
              testType: "mcq",
              selectedSubject: selectedSectionAssessment.subject_name || assName,
              selectedChapters: [],
              difficultyDistribution: selectedSectionAssessment.difficulty_distribution || { easy: 30, medium: 50, hard: 20 },
              totalMarks: Number(selectedSectionAssessment.total_marks || 0),
              duration: sectionDurationInMinutes,
              includePreviousWrong: false,
              randomizeOrder: true,
              userAssessmentId: rawUserAssId,
              assessmentType: "SECTION_WISE",
              assessmentMethod: "MCQ",
              fullExamDetails: {
                ...(prefetchedData || {}),
                user_ass_div_id: sectionId,
                sub_div_id: sectionId,
                sub_div_name: sectionName,
                assessment_type: "SECTION_WISE",
                isDynamic: true,
                source: "dynamic",
                user_ass_id: rawUserAssId,
                user_id: activeUserId,
                subscription_id: activeSubscriptionId,
              },
              isDynamic: true,
              source: "dynamic",
            });
          }
        }}
        onBack={() => {
          setSelectedSectionAssessment(null);
          setActiveMCQExam(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* PAGE HEADER & TOP ACTION BANNER                           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Dynamic Assessments
            </h2>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Attempt your generated dynamic assessments or create a new personalized test anytime.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGeneratedAssessments}
            disabled={isLoadingAssessments}
            className="h-10 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-semibold text-xs flex items-center gap-1.5"
            title="Refresh Assessments List"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingAssessments ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>

          <Button
            onClick={() => {
              setModalStep("form");
              setIsCreateModalOpen(true);
            }}
            className="h-10 px-4 sm:px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-300/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Generate New Assessment</span>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH & STATUS FILTER BAR                                */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search assessments by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 sm:h-10 text-xs sm:text-sm bg-white rounded-xl border-slate-200 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All ({generatedAssessments.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("READY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === "READY"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Ready to Start ({readyCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("SUBMITTED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === "SUBMITTED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Submitted ({submittedCount})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ASSESSMENTS LIST / GRID                                   */}
      {/* ========================================================= */}
      {isLoadingAssessments ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading your generated assessments...</p>
          <p className="text-xs text-slate-400 mt-1">Checking records for subscription {activeSubscriptionId}</p>
        </div>
      ) : filteredAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((assessment, index) => {
            const rawStatus = (
              assessment.assessment_status ||
              assessment.status ||
              assessment.completion_status ||
              ""
            ).toUpperCase();

            // Check if status is SUBMITTED
            const isSubmitted = rawStatus === "SUBMITTED" || rawStatus === "COMPLETED";

            const title =
              assessment.assessment_name ||
              assessment.name ||
              assessment.title ||
              assessment.pattern_name ||
              `Dynamic Assessment #${index + 1}`;

            const subject =
              assessment.subject_name ||
              assessment.subject ||
              assessment.pattern_name ||
              assessment.category ||
              "";

            const totalQ =
              assessment.total_question ||
              assessment.total_questions ||
              assessment.questions_count ||
              "-";

            const rawDuration =
              assessment.total_time ??
              assessment.duration ??
              assessment.time_duration;

            const duration = formatSecondsToMinutes(rawDuration);

            const totalM =
              assessment.total_marks ||
              assessment.marks ||
              "-";

            const dateStr =
              assessment.created_at ||
              assessment.start_time ||
              assessment.ass_start_time ||
              assessment.submitted_at;

            const rawAssessmentType =
              assessment.assessment_type ||
              assessment.assessmentType ||
              assessment.exam_level ||
              "";

            const assessmentMethod =
              assessment.assessment_method ||
              assessment.assessmentMethod ||
              "";

            return (
              <div
                key={assessment.assessment_id || assessment.id || assessment.user_ass_id || index}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
              >
                {/* Top accent bar */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${
                    isSubmitted
                      ? "from-emerald-500 to-teal-500"
                      : "from-blue-600 via-indigo-600 to-purple-600"
                  }`}
                />

                <div className="p-5 flex-1 flex flex-col gap-3">
                  {/* Category, Assessment Type & Status Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/60 truncate max-w-[150px]">
                        {subject}
                      </span> */}
                      {rawAssessmentType && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                            rawAssessmentType.toUpperCase() === "SECTION_WISE"
                              ? "bg-purple-50 text-purple-700 border-purple-200 shadow-xs"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200/70"
                          }`}
                        >
                          <Layers className="w-3 h-3 mr-1" />
                          {rawAssessmentType}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    {isSubmitted ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 animate-in fade-in duration-300">
                        <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        {rawStatus || "Ready to Start"}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h3>
                    {(assessment.topic || assessment.chapter_name) && (
                      <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-1">
                        Topic: {assessment.topic || assessment.chapter_name}
                      </p>
                    )}
                  </div>

                  {/* Assessment Parameters (assessment_type / method) */}
                  {/* {(rawAssessmentType || assessmentMethod) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {rawAssessmentType && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Assessment Type:
                          </span>
                          <span
                            className={`font-bold ${
                              rawAssessmentType.toUpperCase() === "SECTION_WISE"
                                ? "text-purple-700"
                                : "text-indigo-600"
                            }`}
                          >
                            {rawAssessmentType}
                          </span>
                        </div>
                      )}
                      {assessmentMethod && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Method:
                          </span>
                          <span className="font-bold text-slate-700">
                            {assessmentMethod}
                          </span>
                        </div>
                      )}
                    </div>
                  )} */}

                  {/* Metric Tiles */}
                  <div className="grid grid-cols-3 gap-2 mt-auto pt-2 text-xs text-slate-600 font-medium">
                    <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/70 transition-colors text-center">
                      <FileText className="h-3.5 w-3.5 mb-1 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="font-bold text-slate-800">{totalQ}</span>
                      <span className="text-[10px] text-slate-400">Questions</span>
                    </div>

                    <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/70 transition-colors text-center">
                      <Clock className="h-3.5 w-3.5 mb-1 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="font-bold text-slate-800">{duration}</span>
                      <span className="text-[10px] text-slate-400">Mins</span>
                    </div>

                    <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/70 transition-colors text-center">
                      <BarChart className="h-3.5 w-3.5 mb-1 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="font-bold text-slate-800">{totalM}</span>
                      <span className="text-[10px] text-slate-400">Marks</span>
                    </div>
                  </div>

                  {/* Date footer note if available */}
                  {dateStr && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(dateStr)}</span>
                    </div>
                  )}
                </div>

                {/* =================================================== */}
                {/* ACTION AREA: SUBMITTED (NO START BTN) vs START BTN */}
                {/* =================================================== */}
                <div className="p-4 pt-2 bg-slate-50/50 border-t border-slate-100">
                  {isSubmitted ? (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 cursor-default">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Submitted</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleStartExistingAssessment(assessment)}
                      className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-300/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <span>Start Assessment</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : generatedAssessments.length === 0 ? (
        /* Empty State: No assessments generated yet */
        <div className="py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            No Assessments Generated Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Create your first dynamic assessment tailored to your preferred exam pattern, syllabus subjects, and difficulty proportions.
          </p>
          <Button
            onClick={() => {
              setModalStep("form");
              setIsCreateModalOpen(true);
            }}
            className="h-11 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-300/30 flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Generate Your First Assessment</span>
          </Button>
        </div>
      ) : (
        /* Empty State: Filter/search returned 0 */
        <div className="py-12 px-6 text-center bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <Search className="h-8 w-8 text-slate-300 mb-2" />
          <h4 className="text-base font-bold text-slate-800">No matching assessments found</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different status filter.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="mt-4 text-xs font-semibold rounded-xl border-slate-200"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP MODAL: RESPONSIVE GENERATOR FORM FOR ALL DEVICES    */}
      {/* ========================================================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          className="w-[96vw] sm:w-[92vw] md:w-[88vw] lg:max-w-4xl xl:max-w-5xl max-h-[92vh] sm:max-h-[90vh] p-0 flex flex-col bg-white rounded-2xl sm:rounded-3xl border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="shrink-0 bg-white/95 backdrop-blur-md px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {modalStep === "form" ? "Generate Dynamic Assessment" : "Assessment Summary"}
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-slate-500">
                  {modalStep === "form"
                    ? "Select an exam pattern, configure syllabus & marks, set difficulty balance, and launch."
                    : "Please review your test configuration before starting the assessment session."}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCreateModalOpen(false)}
              className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Modal Body: Scrollable & Fully Responsive */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-7 space-y-6 sm:space-y-8">
            {modalStep === "form" ? (
              <>
                {/* Step 1: Pattern Dropdown */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      Step 1: Select Assessment Pattern
                    </Label>
                    {selectedPattern && (
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg ${
                          selectedPattern.category === "competitive"
                            ? "border-amber-300 bg-amber-50 text-amber-700"
                            : "border-blue-300 bg-blue-50 text-blue-700"
                        }`}
                      >
                        {selectedPattern.category.toUpperCase()} PATTERN
                      </Badge>
                    )}
                  </div>

                  {isLoadingPatterns ? (
                    <div className="flex items-center gap-3 p-4 border rounded-2xl bg-slate-50/50 text-xs text-slate-500 animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      Fetching patterns from server...
                    </div>
                  ) : patterns.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/70 text-xs text-slate-500 flex items-center justify-between">
                      <span>No dynamic assessment patterns found for your subscription.</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedPatternId || ""}
                        onChange={(e) => setSelectedPatternId(Number(e.target.value))}
                        className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3 pr-10 text-slate-800 font-semibold text-xs sm:text-sm transition-all shadow-xs outline-none cursor-pointer"
                      >
                        {patterns.map((p) => (
                          <option key={p.pattern_id} value={p.pattern_id}>
                            {p.pattern_name} • {p.category.toUpperCase()} (+{p.marks_per_question} / -{p.negative_marks_per_question} marks)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  )}

                  {/* Pattern Quick Stats */}
                  {selectedPattern && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Marks Per Question</span>
                        <span className="text-slate-900 font-bold text-xs sm:text-sm">+{selectedPattern.marks_per_question}</span>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Negative Penalty</span>
                        <span className="text-rose-600 font-bold text-xs sm:text-sm">-{selectedPattern.negative_marks_per_question}</span>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Allocated Time / Q</span>
                        <span className="text-slate-900 font-bold text-xs sm:text-sm">{selectedPattern.default_per_question_time}s</span>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Category</span>
                        <span className="text-slate-700 font-bold text-xs sm:text-sm">{selectedPattern.category}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Choose Exam Level */}
                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-600" />
                      Step 2: Choose Exam Level
                    </Label>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      Select available exam scope based on the current pattern.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Mock Level */}
                    <div
                      onClick={() => {
                        if (isMockAvailable) setSelectedExamLevel("mock");
                      }}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        !isMockAvailable
                          ? "opacity-45 bg-slate-50/60 border-dashed border-slate-200 cursor-not-allowed select-none"
                          : selectedExamLevel === "mock"
                          ? "border-blue-600 bg-blue-50/40 shadow-xs ring-4 ring-blue-500/10 cursor-pointer"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                            <Award className="h-4 w-4" />
                          </div>
                          {isMockAvailable ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Mock Exam</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isMockAvailable
                            ? `Full syllabus simulation (${selectedPattern?.mock_level?.total_marks} Marks)`
                            : "Not available in this pattern"}
                        </p>
                      </div>
                      {isMockAvailable && selectedExamLevel === "mock" && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                        </div>
                      )}
                    </div>

                    {/* Subject Level */}
                    <div
                      onClick={() => {
                        if (isSubjectAvailable) setSelectedExamLevel("subject");
                      }}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        !isSubjectAvailable
                          ? "opacity-45 bg-slate-50/60 border-dashed border-slate-200 cursor-not-allowed select-none"
                          : selectedExamLevel === "subject"
                          ? "border-indigo-600 bg-indigo-50/40 shadow-xs ring-4 ring-indigo-500/10 cursor-pointer"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                            <FlaskConical className="h-4 w-4" />
                          </div>
                          {isSubjectAvailable ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Subject Level</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isSubjectAvailable
                            ? "Individual subject comprehensive test"
                            : "Not available in this pattern"}
                        </p>
                      </div>
                      {isSubjectAvailable && selectedExamLevel === "subject" && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                        </div>
                      )}
                    </div>

                    {/* Chapter Level */}
                    <div
                      onClick={() => {
                        if (isChapterAvailable) setSelectedExamLevel("chapter");
                      }}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        !isChapterAvailable
                          ? "opacity-45 bg-slate-50/60 border-dashed border-slate-200 cursor-not-allowed select-none"
                          : selectedExamLevel === "chapter"
                          ? "border-amber-600 bg-amber-50/40 shadow-xs ring-4 ring-amber-500/10 cursor-pointer"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          {isChapterAvailable ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">Chapter Level</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isChapterAvailable
                            ? "Target specific chapters and syllabus units"
                            : "Not available in this pattern"}
                        </p>
                      </div>
                      {isChapterAvailable && selectedExamLevel === "chapter" && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Level Specific Details */}
                <div className="pt-2">
                  {/* CASE A: MOCK LEVEL */}
                  {selectedExamLevel === "mock" && selectedPattern?.mock_level && (
                    <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-blue-600" />
                          Mock Syllabus Breakdown
                        </span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {selectedPattern.mock_level.total_questions} Questions • {selectedPattern.mock_level.total_marks} Marks
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {selectedPattern.mock_level.subjects.map((sub) => (
                          <div
                            key={sub.subject_id}
                            className="p-3 rounded-xl border border-white bg-white/95 shadow-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-xs text-slate-900">{sub.subject_name}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{sub.questions_count} Questions</p>
                            </div>
                            <Badge variant="outline" className="text-xs font-bold text-blue-700 bg-blue-50 border-blue-200">
                              {sub.marks} M
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CASE B: SUBJECT LEVEL */}
                  {selectedExamLevel === "subject" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <FlaskConical className="h-4 w-4 text-indigo-600" />
                            Select Subject
                          </Label>
                          {isLoadingSubjects && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin text-indigo-600" /> Loading...
                            </span>
                          )}
                        </div>

                        {subjectsList.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                            {isLoadingSubjects ? "Loading subjects..." : "No subjects available for this subscription."}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {subjectsList.map((sub) => {
                              const subId = sub.subject_id || sub.id || "";
                              const isSelected = String(subId) === String(selectedSubjectId);
                              const name = sub.subject_name || sub.name || "Subject";
                              const code = sub.subject_code || name.substring(0, 4).toUpperCase();

                              return (
                                <div
                                  key={subId}
                                  onClick={() => setSelectedSubjectId(subId)}
                                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/10 font-bold"
                                      : "border-slate-200 hover:border-slate-300 bg-white"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                      {code}
                                    </span>
                                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
                                  </div>
                                  <h5 className="font-bold text-xs text-slate-900 truncate">{name}</h5>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Marks Selection */}
                      <div className="space-y-2 pt-1">
                        <Label className="text-xs sm:text-sm font-bold text-slate-800">
                          Allowed Total Marks
                        </Label>
                        {currentAllowedMarks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No specific allowed marks configured for this pattern.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {currentAllowedMarks.map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setSelectedMarks(m)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  selectedMarks === m
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {m} Marks
                              </button>
                            ))}
                          </div>
                        )}

                        {isBiologySelected && selectedPattern?.subject_level?.biology_questions && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>
                              Biology Special Configuration: <strong>{selectedPattern.subject_level.biology_questions} Questions</strong> ({selectedPattern.subject_level.biology_marks || selectedMarks} Marks).
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CASE C: CHAPTER LEVEL */}
                  {selectedExamLevel === "chapter" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {/* Subject selector */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <FlaskConical className="h-4 w-4 text-amber-600" />
                          1. Select Subject for Chapter Test
                        </Label>
                        {subjectsList.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                            {isLoadingSubjects ? "Loading subjects..." : "No subjects available for this subscription."}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {subjectsList.map((sub) => {
                              const subId = sub.subject_id || sub.id || "";
                              const isSelected = String(subId) === String(selectedSubjectId);
                              const name = sub.subject_name || sub.name || "Subject";
                              return (
                                <div
                                  key={subId}
                                  onClick={() => setSelectedSubjectId(subId)}
                                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-amber-600 bg-amber-50/60 shadow-xs ring-2 ring-amber-500/20 font-bold"
                                      : "border-slate-200 hover:border-slate-300 bg-white font-medium text-slate-700"
                                  }`}
                                >
                                  <span className="text-xs block truncate">{name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Chapters selection with Search */}
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-amber-600" />
                            2. Select Chapters & Topics
                          </Label>

                          {filteredChapters.length > 0 && (
                            <button
                              type="button"
                              onClick={handleSelectAllFilteredChapters}
                              className="text-xs text-blue-600 hover:underline font-semibold"
                            >
                              {filteredChapters.every((c) => selectedChapterIds.includes(c.chapter_id || c.id || ""))
                                ? "Deselect All Filtered"
                                : "Select All Filtered"}
                            </button>
                          )}
                        </div>

                        {/* Chapter Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            placeholder="Search chapters by keyword..."
                            value={chapterSearchQuery}
                            onChange={(e) => setChapterSearchQuery(e.target.value)}
                            className="pl-9 pr-8 h-9 text-xs rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                          />
                          {chapterSearchQuery && (
                            <button
                              onClick={() => setChapterSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Chapters List */}
                        {isLoadingChapters ? (
                          <div className="h-32 border border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400 gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                            Loading chapters...
                          </div>
                        ) : (
                          <ScrollArea className="h-44 sm:h-52 border border-slate-200 rounded-2xl p-2.5 bg-slate-50/30">
                            {filteredChapters.length === 0 ? (
                              <div className="text-center py-8 text-xs text-slate-400">
                                {chapterSearchQuery
                                  ? `No chapters found matching "${chapterSearchQuery}"`
                                  : "No chapters available for this subject."}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {filteredChapters.map((chap) => {
                                  const chapId = chap.chapter_id || chap.id || "";
                                  const isChecked = selectedChapterIds.includes(chapId);
                                  const name = chap.chapter_name || chap.name || "Chapter";
                                  return (
                                    <div
                                      key={chapId}
                                      onClick={() => handleToggleChapter(chapId)}
                                      className={`flex items-center space-x-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                                        isChecked
                                          ? "bg-amber-100/70 text-slate-900 font-semibold"
                                          : "hover:bg-slate-100/70 text-slate-700"
                                      }`}
                                    >
                                      <Checkbox
                                        id={`popup-chap-${chapId}`}
                                        checked={isChecked}
                                        onCheckedChange={() => handleToggleChapter(chapId)}
                                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                      />
                                      <label
                                        htmlFor={`popup-chap-${chapId}`}
                                        className="text-xs cursor-pointer flex-1 select-none leading-tight"
                                      >
                                        {name}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </ScrollArea>
                        )}

                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>{selectedChapterIds.length} chapter(s) selected</span>
                          <span>Showing {filteredChapters.length} of {chaptersList.length}</span>
                        </div>
                      </div>

                      {/* Chapter Marks */}
                      <div className="space-y-2 pt-1">
                        <Label className="text-xs sm:text-sm font-bold text-slate-800">
                          Allowed Chapter Marks
                        </Label>
                        {currentAllowedMarks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No specific allowed marks configured for this pattern.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {currentAllowedMarks.map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setSelectedMarks(m)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  selectedMarks === m
                                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {m} Marks
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Complexity Distribution */}
                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-purple-600" />
                        Step 3: Complexity Distribution
                      </Label>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        Difficulty proportions strictly capped at 100%.
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                        isDifficultyValid
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-amber-300 bg-amber-50 text-amber-700"
                      }`}
                    >
                      Total: {totalDifficultyPercent}% / 100%
                    </Badge>
                  </div>

                  {/* Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyDifficultyPreset(30, 50, 20)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Balanced (30/50/20)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDifficultyPreset(50, 35, 15)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Foundational (50/35/15)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDifficultyPreset(15, 45, 40)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Advanced (15/45/40)
                    </button>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    {/* Easy */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-green-700 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Easy Level
                        </span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={difficultyDistribution.easy}
                            onChange={(e) => handleComplexityChange("easy", parseInt(e.target.value) || 0)}
                            className="h-6 w-12 text-center text-xs font-bold p-0.5 bg-white"
                          />
                          <span className="text-slate-400 font-bold text-xs">%</span>
                        </div>
                      </div>
                      <Slider
                        value={[difficultyDistribution.easy]}
                        onValueChange={(val: number[]) => handleComplexityChange("easy", val[0])}
                        max={100}
                        step={5}
                        className="py-1"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        {difficultyQuestionBreakdown.easyCount} Questions
                      </span>
                    </div>

                    {/* Medium */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-700 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Medium Level
                        </span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={difficultyDistribution.medium}
                            onChange={(e) => handleComplexityChange("medium", parseInt(e.target.value) || 0)}
                            className="h-6 w-12 text-center text-xs font-bold p-0.5 bg-white"
                          />
                          <span className="text-slate-400 font-bold text-xs">%</span>
                        </div>
                      </div>
                      <Slider
                        value={[difficultyDistribution.medium]}
                        onValueChange={(val: number[]) => handleComplexityChange("medium", val[0])}
                        max={100}
                        step={5}
                        className="py-1"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        {difficultyQuestionBreakdown.mediumCount} Questions
                      </span>
                    </div>

                    {/* Hard */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-700 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          Hard Level
                        </span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={difficultyDistribution.hard}
                            onChange={(e) => handleComplexityChange("hard", parseInt(e.target.value) || 0)}
                            className="h-6 w-12 text-center text-xs font-bold p-0.5 bg-white"
                          />
                          <span className="text-slate-400 font-bold text-xs">%</span>
                        </div>
                      </div>
                      <Slider
                        value={[difficultyDistribution.hard]}
                        onValueChange={(val: number[]) => handleComplexityChange("hard", val[0])}
                        max={100}
                        step={5}
                        className="py-1"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        {difficultyQuestionBreakdown.hardCount} Questions
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      style={{ width: `${difficultyDistribution.easy}%` }}
                      className="bg-green-500 transition-all duration-300"
                    />
                    <div
                      style={{ width: `${difficultyDistribution.medium}%` }}
                      className="bg-blue-500 transition-all duration-300"
                    />
                    <div
                      style={{ width: `${difficultyDistribution.hard}%` }}
                      className="bg-purple-500 transition-all duration-300"
                    />
                  </div>

                  {totalDifficultyPercent < 100 && (
                    <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800">
                      <span>
                        Remaining unallocated percentage: <strong>{100 - totalDifficultyPercent}%</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDifficultyDistribution((prev) => ({
                            ...prev,
                            medium: prev.medium + (100 - totalDifficultyPercent),
                          }))
                        }
                        className="px-2.5 py-0.5 rounded-md bg-amber-200 hover:bg-amber-300 font-bold text-amber-900 transition-all text-[11px]"
                      >
                        Allocate to Medium
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Summary View Step inside Modal */
              <div className="space-y-4 py-1 text-xs animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Selected Pattern
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                      {selectedPattern?.pattern_name}
                    </span>
                    <Badge variant="secondary" className="mt-1 text-[10px] font-bold">
                      {selectedPattern?.category.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Exam Scope
                    </span>
                    <span className="text-sm font-bold text-indigo-700 mt-0.5 block capitalize">
                      {selectedExamLevel === "mock"
                        ? "Mock Level (Full Syllabus)"
                        : selectedExamLevel === "subject"
                        ? "Subject Level"
                        : "Chapter Level"}
                    </span>
                    {selectedExamLevel !== "mock" && (
                      <span className="text-slate-600 font-medium mt-1 block truncate">
                        Subject: {currentSubjectObj?.subject_name || currentSubjectObj?.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chapters list if chapter level */}
                {selectedExamLevel === "chapter" && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                    <span className="text-[11px] text-amber-800 font-bold block mb-1">
                      Selected Chapters ({selectedChapterIds.length}):
                    </span>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {chaptersList
                        .filter((c) => selectedChapterIds.includes(c.chapter_id || c.id || ""))
                        .map((c) => c.chapter_name || c.name)
                        .join(", ")}
                    </p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Marks</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {computedTotalMarks} M
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Questions</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {computedQuestionsCount} Qs
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Duration</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {computedDurationMins} Mins
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Marking Scheme</span>
                    <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                      +{selectedPattern?.marks_per_question} / -{selectedPattern?.negative_marks_per_question}
                    </span>
                  </div>
                </div>

                {/* Complexity Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                    Difficulty Proportions
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                      <span className="text-green-800 font-bold block">Easy: {difficultyDistribution.easy}%</span>
                      <span className="text-[10px] text-slate-500">{difficultyQuestionBreakdown.easyCount} Qs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="text-blue-800 font-bold block">Medium: {difficultyDistribution.medium}%</span>
                      <span className="text-[10px] text-slate-500">{difficultyQuestionBreakdown.mediumCount} Qs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                      <span className="text-purple-800 font-bold block">Hard: {difficultyDistribution.hard}%</span>
                      <span className="text-[10px] text-slate-500">{difficultyQuestionBreakdown.hardCount} Qs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Sticky Footer */}
          <div className="shrink-0 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 flex items-center justify-between gap-3 z-10">
            {modalStep === "form" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-10 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm font-semibold rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateAssessmentClick}
                  className="h-10 sm:h-11 px-5 sm:px-6 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md shadow-indigo-300/30 flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Review & Generate</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalStep("form")}
                  className="h-10 sm:h-11 px-4 sm:px-5 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Edit</span>
                </Button>
                <Button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleConfirmAndStart}
                  className="h-10 sm:h-11 px-5 sm:px-6 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-indigo-300/30 flex items-center gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Assessment...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Assessment</span>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const CustomTestGenerator = DynamicTestGenerator;
export default DynamicTestGenerator;
