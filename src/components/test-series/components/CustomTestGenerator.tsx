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
  Atom
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../../hooks/use-toast";
import { DynamicAssessmentService } from "../../../services/DynamicAssessmentService";
import { CommonApiServices } from "../../../services/CommonApiServices";
import { useCourse } from "../../../context/CourseContext";
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
}

interface CustomTestGeneratorProps {
  onStartTest: (config: TestConfig) => void;
}

// Fallback patterns matching the exact schema specified by the user
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

export function CustomTestGenerator({ onStartTest }: CustomTestGeneratorProps) {
  const { toast } = useToast();
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

  // Pattern state
  const [patterns, setPatterns] = useState<AssessmentPattern[]>([]);
  const [selectedPatternId, setSelectedPatternId] = useState<number | null>(null);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(true);

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
  const [selectedMarks, setSelectedMarks] = useState<number>(20);

  // Difficulty Distribution state
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 30,
    medium: 50,
    hard: 20,
  });

  // Additional settings (commented out in UI as requested)
  const [includePreviousWrong, setIncludePreviousWrong] = useState(false);
  const [randomizeOrder, setRandomizeOrder] = useState(true);

  // Popup Modal State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Fetch Patterns using DynamicAssessmentService.GET_PATTERN
  useEffect(() => {
    let isMounted = true;
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
            setSelectedPatternId(list[0].pattern_id);
          } else {
            console.warn("No patterns returned from backend. Using fallback patterns.");
            setPatterns(FALLBACK_PATTERNS);
            setSelectedPatternId(FALLBACK_PATTERNS[0].pattern_id);
          }
        }
      } catch (error) {
        console.error("Failed to load assessment patterns from backend:", error);
        if (isMounted) {
          setPatterns(FALLBACK_PATTERNS);
          setSelectedPatternId(FALLBACK_PATTERNS[0].pattern_id);
          toast({
            title: "Patterns Loaded",
            description: "Loaded standard assessment patterns catalog.",
          });
        }
      } finally {
        if (isMounted) setIsLoadingPatterns(false);
      }
    };

    fetchPatterns();
    return () => {
      isMounted = false;
    };
  }, [activeSubscriptionId]);

  // Selected pattern object
  const selectedPattern = useMemo(() => {
    return patterns.find((p) => p.pattern_id === selectedPatternId) || patterns[0] || null;
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

  // 2. Fetch Subjects via CommonApiServices.GET_ALL_SUBJECTS_BY_SUBSCRIPTION_ID
  useEffect(() => {
    if (!activeSubscriptionId) return;

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        console.log("Fetching subjects for subscription:", activeSubscriptionId);
        const res = await CommonApiServices.GET_ALL_SUBJECTS_BY_SUBSCRIPTION_ID(activeSubscriptionId);
        const rawList = res?.data?.subjects || res?.subjects || res?.data || (Array.isArray(res) ? res : []);

        if (Array.isArray(rawList) && rawList.length > 0) {
          setSubjectsList(rawList);
          const firstSubId = rawList[0].subject_id || rawList[0].id;
          setSelectedSubjectId(firstSubId);
        } else {
          const defaultSubjects: ApiSubject[] = selectedPattern?.mock_level?.subjects?.map((s) => ({
            subject_id: s.subject_id,
            subject_name: s.subject_name,
            subject_code: s.subject_name.substring(0, 4).toUpperCase(),
          })) || [
            { subject_id: 1026, subject_name: "Physics", subject_code: "PHYS", description: "Mechanics, Heat & Waves" },
            { subject_id: 1027, subject_name: "Chemistry", subject_code: "CHEM", description: "Inorganic, Organic & Physical" },
            { subject_id: 1028, subject_name: "Biology", subject_code: "BIOL", description: "Botany & Zoology" },
            { subject_id: 1029, subject_name: "Mathematics", subject_code: "MATH", description: "Calculus & Geometry" },
          ];
          setSubjectsList(defaultSubjects);
          setSelectedSubjectId(defaultSubjects[0].subject_id || "");
        }
      } catch (err) {
        console.error("Error fetching subjects by subscription id:", err);
        const defaultSubjects: ApiSubject[] = [
          { subject_id: 1026, subject_name: "Physics", subject_code: "PHYS", description: "Mechanics, Heat & Waves" },
          { subject_id: 1027, subject_name: "Chemistry", subject_code: "CHEM", description: "Inorganic, Organic & Physical" },
          { subject_id: 1028, subject_name: "Biology", subject_code: "BIOL", description: "Botany & Zoology" },
          { subject_id: 1029, subject_name: "Mathematics", subject_code: "MATH", description: "Calculus & Geometry" },
        ];
        setSubjectsList(defaultSubjects);
        setSelectedSubjectId(defaultSubjects[0].subject_id || "");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [activeSubscriptionId, selectedPattern]);

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
          const fallbackChaps: ApiChapter[] = [
            { chapter_id: 201, chapter_name: "Laws of Motion & Work Energy" },
            { chapter_id: 202, chapter_name: "Thermodynamics & Kinetic Theory" },
            { chapter_id: 203, chapter_name: "Electrostatics & Magnetism" },
            { chapter_id: 204, chapter_name: "Optics & Modern Physics" },
          ];
          setChaptersList(fallbackChaps);
          setSelectedChapterIds([201]);
        }
      } catch (err) {
        console.error("Error loading chapters:", err);
        const fallbackChaps: ApiChapter[] = [
          { chapter_id: 201, chapter_name: "Chapter 1: Foundational Principles" },
          { chapter_id: 202, chapter_name: "Chapter 2: Analytical Applications" },
        ];
        setChaptersList(fallbackChaps);
        setSelectedChapterIds([201]);
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

  // Allowed Marks Array based on level & pattern
  const currentAllowedMarks: number[] = useMemo(() => {
    if (!selectedPattern) return [20];
    if (selectedExamLevel === "subject") {
      return (
        selectedPattern.subject_level?.allowed_marks ||
        (selectedPattern.subject_level?.default_marks
          ? [selectedPattern.subject_level.default_marks]
          : [20])
      );
    }
    if (selectedExamLevel === "chapter") {
      return (
        selectedPattern.chapter_level?.allowed_marks ||
        (selectedPattern.chapter_level?.default_marks
          ? [selectedPattern.chapter_level.default_marks]
          : [20])
      );
    }
    return [selectedPattern.mock_level?.total_marks || 720];
  }, [selectedPattern, selectedExamLevel]);

  // Initialize/adjust selectedMarks when allowedMarks change
  useEffect(() => {
    if (!selectedPattern) return;

    if (selectedExamLevel === "mock") {
      setSelectedMarks(selectedPattern.mock_level?.total_marks || 720);
      return;
    }

    if (selectedExamLevel === "subject") {
      const subCfg = selectedPattern.subject_level;
      if (isBiologySelected && subCfg?.biology_marks) {
        setSelectedMarks(subCfg.biology_marks);
      } else if (subCfg?.default_marks) {
        setSelectedMarks(subCfg.default_marks);
      } else if (subCfg?.allowed_marks && subCfg.allowed_marks.length > 0) {
        setSelectedMarks(subCfg.allowed_marks[0]);
      }
      return;
    }

    if (selectedExamLevel === "chapter") {
      const chapCfg = selectedPattern.chapter_level;
      if (chapCfg?.default_marks) {
        setSelectedMarks(chapCfg.default_marks);
      } else if (chapCfg?.allowed_marks && chapCfg.allowed_marks.length > 0) {
        setSelectedMarks(chapCfg.allowed_marks[0]);
      }
    }
  }, [selectedPattern, selectedExamLevel, isBiologySelected]);

  // Computed Total Questions & Marks & Duration
  const { computedTotalMarks, computedQuestionsCount, computedDurationMins } = useMemo(() => {
    if (!selectedPattern) {
      return { computedTotalMarks: 20, computedQuestionsCount: 20, computedDurationMins: 30 };
    }

    const marksPerQ = selectedPattern.marks_per_question || 1;
    const timePerQSec = selectedPattern.default_per_question_time || 60;

    if (selectedExamLevel === "mock") {
      const totalM = selectedPattern.mock_level?.total_marks || 720;
      const totalQ = selectedPattern.mock_level?.total_questions || 180;
      const duration = Math.max(15, Math.round((totalQ * timePerQSec) / 60));
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
      } else {
        qCount = Math.max(1, Math.round(totalM / marksPerQ));
      }

      const duration = Math.max(10, Math.round((qCount * timePerQSec) / 60));
      return {
        computedTotalMarks: totalM,
        computedQuestionsCount: qCount,
        computedDurationMins: duration,
      };
    }

    // Chapter Level
    const chapCfg = selectedPattern.chapter_level;
    const totalM = selectedMarks;
    const qCount = chapCfg?.questions_count || Math.max(1, Math.round(totalM / marksPerQ));
    const duration = Math.max(10, Math.round((qCount * timePerQSec) / 60));

    return {
      computedTotalMarks: totalM,
      computedQuestionsCount: qCount,
      computedDurationMins: duration,
    };
  }, [selectedPattern, selectedExamLevel, selectedMarks, isBiologySelected]);

  // -------------------------------------------------------------
  // Complexity Validation & Safe Adjustment (Never exceeds 100%)
  // -------------------------------------------------------------
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

      // Max allowed value so that total NEVER goes above 100
      const maxAllowed = Math.max(0, 100 - otherSum);
      const clampedVal = Math.min(targetVal, maxAllowed);

      return {
        ...prev,
        [key]: clampedVal,
      };
    });
  };

  // Preset distributions (always strictly equal 100%)
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

  // Chapter selection handlers
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

  // -------------------------------------------------------------
  // Validation Check before opening Assessment Summary Modal
  // (Button remains ACTIVE even if selections are incomplete)
  // -------------------------------------------------------------
  const handleGenerateAssessmentClick = () => {
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

    // All steps are completed -> Open Summary Popup Modal!
    setIsSummaryModalOpen(true);
  };

  // Confirmed start from the popup modal (Continue Button)
  const handleConfirmAndStart = () => {
    if (!selectedPattern) return;

    setIsGenerating(true);

    const subjectName =
      selectedExamLevel === "mock"
        ? "Full Syllabus (Mock Exam)"
        : currentSubjectObj?.subject_name || currentSubjectObj?.name || "General";

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

    setTimeout(() => {
      setIsGenerating(false);
      setIsSummaryModalOpen(false);
      toast({
        title: "Assessment Initialized",
        description: `Launching ${selectedPattern.pattern_name} simulation. Good luck!`,
      });
      onStartTest(config);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Custom Assessment Generator
          </h2>
        </div>
        <p className="text-slate-500 text-sm">
          Select an exam pattern from the backend, configure your syllabus & marks, set difficulty balance, and launch your test.
        </p>
      </div>

      {/* Main Configuration Card */}
      <Card className="border-slate-200/80 shadow-xl shadow-slate-100 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border-b border-slate-100 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Step 1: Select Assessment Pattern
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-1">
                Configured patterns for subscription ID: <span className="font-semibold text-slate-700">{activeSubscriptionId}</span>
              </CardDescription>
            </div>
            {selectedPattern && (
              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  selectedPattern.category === "competitive"
                    ? "border-amber-300 bg-amber-50 text-amber-700 shadow-xs"
                    : "border-blue-300 bg-blue-50 text-blue-700 shadow-xs"
                }`}
              >
                {selectedPattern.category.toUpperCase()} PATTERN
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Step 1: Pattern Dropdown */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              Exam Pattern Dropdown
            </Label>

            {isLoadingPatterns ? (
              <div className="flex items-center gap-3 p-4 border rounded-2xl bg-slate-50/50 text-sm text-slate-500 animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Fetching patterns from server...
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedPatternId || ""}
                  onChange={(e) => setSelectedPatternId(Number(e.target.value))}
                  className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3.5 pr-11 text-slate-800 font-semibold text-sm transition-all shadow-xs outline-none cursor-pointer"
                >
                  {patterns.map((p) => (
                    <option key={p.pattern_id} value={p.pattern_id}>
                      {p.pattern_name} • {p.category.toUpperCase()} (+{p.marks_per_question} / -{p.negative_marks_per_question} marks)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            )}

            {/* Pattern Quick Stats */}
            {selectedPattern && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium block">Marks Per Question</span>
                  <span className="text-slate-900 font-bold text-sm">+{selectedPattern.marks_per_question}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium block">Negative Penalty</span>
                  <span className="text-rose-600 font-bold text-sm">-{selectedPattern.negative_marks_per_question}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium block">Allocated Time / Q</span>
                  <span className="text-slate-900 font-bold text-sm">{selectedPattern.default_per_question_time}s</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium block">Category</span>
                  <span className="text-slate-700 font-bold text-sm">{selectedPattern.category}</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Exam Level Selection (3 Options) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Step 2: Choose Exam Level
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select available exam scope based on current pattern.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Mock Level */}
              <div
                onClick={() => {
                  if (isMockAvailable) setSelectedExamLevel("mock");
                }}
                className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  !isMockAvailable
                    ? "opacity-45 bg-slate-50/60 border-dashed border-slate-200 cursor-not-allowed select-none"
                    : selectedExamLevel === "mock"
                    ? "border-blue-600 bg-blue-50/40 shadow-sm ring-4 ring-blue-500/10 cursor-pointer"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                      <GraduationCapIcon className="h-5 w-5" />
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
                  <h4 className="font-bold text-base text-slate-900">Mock Exam</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {isMockAvailable
                      ? `Full syllabus simulation (${selectedPattern?.mock_level?.total_marks} Marks)`
                      : "Not available in this pattern"}
                  </p>
                </div>
                {isMockAvailable && selectedExamLevel === "mock" && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-700">
                    <CheckCircle2 className="h-4 w-4" /> Selected Level
                  </div>
                )}
              </div>

              {/* Option 2: Subject Level */}
              <div
                onClick={() => {
                  if (isSubjectAvailable) setSelectedExamLevel("subject");
                }}
                className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  !isSubjectAvailable
                    ? "opacity-45 bg-slate-50/60 border-dashed border-slate-200 cursor-not-allowed select-none"
                    : selectedExamLevel === "subject"
                    ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-4 ring-indigo-500/10 cursor-pointer"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                      <FlaskConical className="h-5 w-5" />
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
                  <h4 className="font-bold text-base text-slate-900">Subject Level</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {isSubjectAvailable
                      ? "Individual subject comprehensive test"
                      : "Not available in this pattern"}
                  </p>
                </div>
                {isSubjectAvailable && selectedExamLevel === "subject" && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <CheckCircle2 className="h-4 w-4" /> Selected Level
                  </div>
                )}
              </div>

              {/* Option 3: Chapter Level */}
              <div
                onClick={() => {
                  if (isChapterAvailable) setSelectedExamLevel("chapter");
                }}
                className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  !isChapterAvailable
                    ? "opacity-45 bg-slate-50/60 border-dashed border-slate-200 cursor-not-allowed select-none"
                    : selectedExamLevel === "chapter"
                    ? "border-amber-600 bg-amber-50/40 shadow-sm ring-4 ring-amber-500/10 cursor-pointer"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                      <BookOpen className="h-5 w-5" />
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
                  <h4 className="font-bold text-base text-slate-900">Chapter Level</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {isChapterAvailable
                      ? "Target specific chapters and syllabus units"
                      : "Not available in this pattern"}
                  </p>
                </div>
                {isChapterAvailable && selectedExamLevel === "chapter" && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <CheckCircle2 className="h-4 w-4" /> Selected Level
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Level Specific Configuration */}
          <div className="pt-2">
            {/* CASE A: MOCK LEVEL */}
            {selectedExamLevel === "mock" && selectedPattern?.mock_level && (
              <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <GraduationCapIcon className="h-4 w-4 text-blue-600" />
                    Mock Exam Syllabus Breakdown
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none font-bold">
                    {selectedPattern.mock_level.total_questions} Questions • {selectedPattern.mock_level.total_marks} Marks
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedPattern.mock_level.subjects.map((sub) => (
                    <div
                      key={sub.subject_id}
                      className="p-4 rounded-xl border border-white bg-white/90 shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-900">{sub.subject_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{sub.questions_count} Questions</p>
                      </div>
                      <Badge variant="outline" className="text-xs font-bold text-blue-700 bg-blue-50 border-blue-200">
                        {sub.marks} M
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASE B: SUBJECT LEVEL (Redesigned Subject Cards) */}
            {selectedExamLevel === "subject" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-indigo-600" />
                        Select Subject
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose a subject to configure marks & questions.
                      </p>
                    </div>
                    {isLoadingSubjects && (
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" /> Loading subjects...
                      </span>
                    )}
                  </div>

                  {/* Redesigned Subject Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    {subjectsList.map((sub) => {
                      const subId = sub.subject_id || sub.id || "";
                      const isSelected = String(subId) === String(selectedSubjectId);
                      const name = sub.subject_name || sub.name || "Subject";
                      const code = sub.subject_code || name.substring(0, 4).toUpperCase();

                      return (
                        <div
                          key={subId}
                          onClick={() => setSelectedSubjectId(subId)}
                          className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-indigo-600 bg-gradient-to-b from-indigo-50/80 to-white shadow-md ring-4 ring-indigo-500/10"
                              : "border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-xs"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-400"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {name.toLowerCase().includes("math") ? (
                                <Calculator className="h-5 w-5" />
                              ) : name.toLowerCase().includes("phy") ? (
                                <Atom className="h-5 w-5" />
                              ) : name.toLowerCase().includes("chem") ? (
                                <FlaskConical className="h-5 w-5" />
                              ) : name.toLowerCase().includes("bio") ? (
                                <Sparkles className="h-5 w-5" />
                              ) : (
                                <BookOpen className="h-5 w-5" />
                              )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              {code}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-sm text-slate-900 truncate">{name}</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {isSelected ? "Active Selection" : "Click to select"}
                            </p>
                          </div>

                          {isSelected && (
                            <div className="absolute top-3 right-3 text-indigo-600">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subject Allowed Marks Selection */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-slate-800">
                      Allowed Total Marks
                    </Label>
                    <span className="text-xs text-slate-500">
                      Select target marks weightage for this assessment
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {currentAllowedMarks.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMarks(m)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          selectedMarks === m
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-300"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {m} Marks
                      </button>
                    ))}
                  </div>

                  {isBiologySelected && selectedPattern?.subject_level?.biology_questions && (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        Biology Special Configuration: <strong>{selectedPattern.subject_level.biology_questions} Questions</strong> ({selectedPattern.subject_level.biology_marks || selectedMarks} Marks).
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CASE C: CHAPTER LEVEL (With Search Feature) */}
            {selectedExamLevel === "chapter" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* 1. Subject selector for Chapter Test */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-amber-600" />
                    1. Select Subject for Chapter Test
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {subjectsList.map((sub) => {
                      const subId = sub.subject_id || sub.id || "";
                      const isSelected = String(subId) === String(selectedSubjectId);
                      const name = sub.subject_name || sub.name || "Subject";
                      return (
                        <div
                          key={subId}
                          onClick={() => setSelectedSubjectId(subId)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
                </div>

                {/* 2. Chapter selection with Search Option */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
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
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search chapters by keyword..."
                      value={chapterSearchQuery}
                      onChange={(e) => setChapterSearchQuery(e.target.value)}
                      className="pl-10 pr-9 h-10 text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white transition-all"
                    />
                    {chapterSearchQuery && (
                      <button
                        onClick={() => setChapterSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Chapters List */}
                  {isLoadingChapters ? (
                    <div className="h-36 border border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                      Loading chapters for selected subject...
                    </div>
                  ) : (
                    <ScrollArea className="h-52 border border-slate-200 rounded-2xl p-3 bg-slate-50/30">
                      {filteredChapters.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">
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
                                className={`flex items-center space-x-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-amber-100/70 text-slate-900 font-semibold"
                                    : "hover:bg-slate-100/70 text-slate-700"
                                }`}
                              >
                                <Checkbox
                                  id={`chap-${chapId}`}
                                  checked={isChecked}
                                  onCheckedChange={() => handleToggleChapter(chapId)}
                                  className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                />
                                <label
                                  htmlFor={`chap-${chapId}`}
                                  className="text-xs cursor-pointer flex-1 select-none"
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
                    <span>
                      {selectedChapterIds.length} chapter(s) selected
                    </span>
                    <span>
                      Showing {filteredChapters.length} of {chaptersList.length}
                    </span>
                  </div>
                </div>

                {/* Chapter Marks */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-bold text-slate-800">
                    Allowed Chapter Marks
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
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
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Complexity Distribution (Strictly Capped at 100%) */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-purple-600" />
                  Step 3: Complexity Distribution
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure difficulty proportions. The total is capped and cannot exceed 100%.
                </p>
              </div>

              <Badge
                variant="outline"
                className={`text-xs font-bold px-3 py-1 rounded-lg ${
                  isDifficultyValid
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-amber-300 bg-amber-50 text-amber-700"
                }`}
              >
                Total: {totalDifficultyPercent}% / 100%
              </Badge>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={() => applyDifficultyPreset(30, 50, 20)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Balanced (30/50/20)
              </button>
              <button
                type="button"
                onClick={() => applyDifficultyPreset(50, 35, 15)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Foundational (50/35/15)
              </button>
              <button
                type="button"
                onClick={() => applyDifficultyPreset(15, 45, 40)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Advanced (15/45/40)
              </button>
            </div>

            {/* 3 Difficulty Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              {/* Easy */}
              <div className="space-y-2">
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
                      className="h-7 w-14 text-center text-xs font-bold p-1 bg-white"
                    />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <Slider
                  value={[difficultyDistribution.easy]}
                  onValueChange={(val: number[]) => handleComplexityChange("easy", val[0])}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <span className="text-[11px] text-slate-500 block">
                  {difficultyQuestionBreakdown.easyCount} Questions
                </span>
              </div>

              {/* Medium */}
              <div className="space-y-2">
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
                      className="h-7 w-14 text-center text-xs font-bold p-1 bg-white"
                    />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <Slider
                  value={[difficultyDistribution.medium]}
                  onValueChange={(val: number[]) => handleComplexityChange("medium", val[0])}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <span className="text-[11px] text-slate-500 block">
                  {difficultyQuestionBreakdown.mediumCount} Questions
                </span>
              </div>

              {/* Hard */}
              <div className="space-y-2">
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
                      className="h-7 w-14 text-center text-xs font-bold p-1 bg-white"
                    />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <Slider
                  value={[difficultyDistribution.hard]}
                  onValueChange={(val: number[]) => handleComplexityChange("hard", val[0])}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <span className="text-[11px] text-slate-500 block">
                  {difficultyQuestionBreakdown.hardCount} Questions
                </span>
              </div>
            </div>

            {/* Visual Colored Bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
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
            </div>

            {totalDifficultyPercent < 100 && (
              <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800">
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
                  className="px-2.5 py-1 rounded-md bg-amber-200 hover:bg-amber-300 font-bold text-amber-900 transition-all text-[11px]"
                >
                  Allocate to Medium
                </button>
              </div>
            )}
          </div>

          {/* 
            Commented out settings as requested by the user:
            "include previously incorrect question and randomize question order"
          */}
          {/* 
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-700">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prevWrong"
                checked={includePreviousWrong}
                onCheckedChange={(c) => setIncludePreviousWrong(!!c)}
              />
              <Label htmlFor="prevWrong" className="cursor-pointer font-medium">
                Include previously incorrect questions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="randomize"
                checked={randomizeOrder}
                onCheckedChange={(c) => setRandomizeOrder(!!c)}
              />
              <Label htmlFor="randomize" className="cursor-pointer font-medium">
                Randomize question order
              </Label>
            </div>
          </div>
          */}

          {/* 
            Generate Assessment Button:
            Always ACTIVE (clickable), validating all required steps upon click.
          */}
          <div className="pt-4">
            <Button
              onClick={handleGenerateAssessmentClick}
              disabled={isGenerating}
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl shadow-lg shadow-indigo-300/40 transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Zap className="h-5 w-5 fill-current" />
              Generate Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 
        Commented out the sidebar Assessment Summary as requested:
        "and also commnet the Assessment Summary"
      */}
      {/* 
      <div className="md:col-span-4 space-y-6">
        <Card className="border-slate-200 shadow-md shadow-slate-100/50 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50/80 to-white sticky top-6">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
             ...
          </CardContent>
        </Card>
      </div>
      */}

      {/* 
        Popup Modal: Assessment Summary with Continue and Cancel Buttons
      */}
      <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 md:p-8 border-slate-200 bg-white shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <FileText className="h-4 w-4" />
              </span>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Assessment Summary
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Please review your test configuration before starting the assessment session.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Summary Body */}
          <div className="space-y-4 py-3 text-xs">
            {/* Pattern & Exam Level Row */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
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
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
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

            {/* Stats Grid: Marks, Questions, Duration, Marking */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Marks</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {computedTotalMarks} M
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Questions</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {computedQuestionsCount} Qs
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Duration</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {computedDurationMins} Mins
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Marking Scheme</span>
                <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                  +{selectedPattern?.marks_per_question} / -{selectedPattern?.negative_marks_per_question}
                </span>
              </div>
            </div>

            {/* Complexity Breakdown in Popup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                Difficulty Proportions
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                  <span className="text-green-800 font-bold block">Easy: {difficultyDistribution.easy}%</span>
                  <span className="text-[11px] text-slate-500">{difficultyQuestionBreakdown.easyCount} Qs</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-blue-800 font-bold block">Medium: {difficultyDistribution.medium}%</span>
                  <span className="text-[11px] text-slate-500">{difficultyQuestionBreakdown.mediumCount} Qs</span>
                </div>
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                  <span className="text-purple-800 font-bold block">Hard: {difficultyDistribution.hard}%</span>
                  <span className="text-[11px] text-slate-500">{difficultyQuestionBreakdown.hardCount} Qs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popup Action Buttons: Continue or Cancel */}
          <DialogFooter className="flex flex-row justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSummaryModalOpen(false)}
              className="px-5 h-11 text-xs font-bold rounded-xl border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isGenerating}
              onClick={handleConfirmAndStart}
              className="px-6 h-11 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-indigo-300/30"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Starting Test...
                </>
              ) : (
                "Continue & Start Test"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}
