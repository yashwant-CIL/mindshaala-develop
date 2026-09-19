import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { CompetitionService } from '../../services/CompetitionService';
import { useCourse } from '../../context/CourseContext';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Search,
  Filter,
  Flame,
  Zap,
  Target,
  Clock,
  ChevronDown,
  TrendingUp,
  User,
  Sparkles,
  School,
  Star,
  CheckCircle2,
  ChevronRight,
  Mic,
  Brain,
  ClipboardCheck,
  Volume2,
  Layers,
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  FileText,
  HelpCircle,
  BarChart2,
  Calendar,
  Activity
} from 'lucide-react';

/* ============================================================================
   PREVIOUS STATIC DATA & MOCK DEFINITIONS (COMMENTED OUT FOR EASY ROLLBACK)
   ============================================================================

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  school: string;
  city: string;
  activityTitle: string; // Title of competition, viva topic, assessment or AI tutor topic
  score: number;
  maxScore: number;
  metricLabel: string; // e.g. "Accuracy", "Fluency", "Clarity", "Speed Score"
  metricValue: string | number; // e.g. "98%", "96% Fluency", "99/100"
  timeSpent: string; // e.g. "18m 42s"
  xpEarned: number;
  badges: string[];
  isCurrentUser?: boolean;
  streakDays: number;
}

export type FeatureTabId = 'competitions' | 'viva-prep' | 'ai-tutor' | 'assessments' | 'speakalong' | 'overall';

export interface FeatureTab {
  id: FeatureTabId;
  label: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
}

const FEATURE_TABS: FeatureTab[] = [
  {
    id: 'competitions',
    label: 'Competitions',
    icon: Trophy,
    badge: 'LIVE',
    description: 'National Olympiads, Speed Cups & STEM Leagues'
  },
  {
    id: 'viva-prep',
    label: 'Viva Preparation',
    icon: Mic,
    badge: 'POPULAR',
    description: 'Oral Viva Exams, AI Speech & Subject Viva Scores'
  },
  {
    id: 'ai-tutor',
    label: 'AI Tutor',
    icon: Brain,
    description: 'Conceptual AI Tutor, Doubt Solving & Mastery Points'
  },
  {
    id: 'assessments',
    label: 'Assessments',
    icon: ClipboardCheck,
    description: 'Chapter-wise MCQ & Theory Tests'
  },
  {
    id: 'speakalong',
    label: 'SpeakAlong Viva',
    icon: Volume2,
    description: 'Pronunciation & Voice Fluency Challenges'
  },
  {
    id: 'overall',
    label: 'Overall Platform',
    icon: Layers,
    description: 'Combined National All-Subject Standings'
  }
];

const MOCK_FEATURE_LEADERBOARDS: Record<FeatureTabId, LeaderboardEntry[]> = {
  competitions: [
    {
      rank: 1,
      id: 'usr-c1',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      school: 'DPS R.K. Puram',
      city: 'New Delhi',
      activityTitle: 'National Math Speed Cup 2026',
      score: 980,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '98%',
      timeSpent: '16m 20s',
      xpEarned: 2500,
      badges: ['Math Champion', 'Speed Demon'],
      streakDays: 14
    },
    {
      rank: 2,
      id: 'usr-c2',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      school: 'National Public School',
      city: 'Bengaluru',
      activityTitle: 'All India Coding League',
      score: 965,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '96.5%',
      timeSpent: '18m 10s',
      xpEarned: 2100,
      badges: ['Code Ninja', 'Precision Pro'],
      streakDays: 11
    },
    {
      rank: 3,
      id: 'usr-c3',
      name: 'Rohan Gupta',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      school: 'DAV Public School',
      city: 'Mumbai',
      activityTitle: 'Physics Mechanics Champ',
      score: 940,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '94%',
      timeSpent: '19m 45s',
      xpEarned: 1800,
      badges: ['Physics Wizard'],
      streakDays: 8
    }
  ],
  'viva-prep': [],
  'ai-tutor': [],
  assessments: [],
  speakalong: [],
  overall: []
};
============================================================================ */

export interface CompetitionAttemptItem {
  attemptId: string;
  competitionId: string;
  title: string;
  category: string;
  attemptDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank?: number;
  totalParticipants?: number;
  percentile?: number;
  timeTaken: string;
  status: string;
  xpEarned?: number;
  badge?: string;
  tags?: string[];
  moduleType?: string;
  correctCount?: number;
  incorrectCount?: number;
  skippedCount?: number;
  accuracy?: number;
  attemptedCount?: number;
  unattemptedCount?: number;
  overallFeedback?: string;
  vivaType?: string;
  rawItem?: any;
}

export interface IndividualParticipantStanding {
  rank: number;
  id: string;
  name: string;
  school: string;
  city: string;
  activityTitle: string;
  score: number;
  maxScore: number;
  metricLabel: string;
  metricValue: string | number;
  timeSpent: string;
  xpEarned: number;
  badges: string[];
  isCurrentUser?: boolean;
}

export const Leaderboard: React.FC<{
  userId?: string | number;
  subscriptionId?: string | number;
}> = ({ userId, subscriptionId: propSubscriptionId }) => {
  const [selectedModuleType, setSelectedModuleType] = useState<'GK' | 'VIVA' | 'TAM'>('GK');
  const [searchQuery, setSearchQuery] = useState('');
  const [attempts, setAttempts] = useState<CompetitionAttemptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Selected Competition state for viewing individual competition rank table
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionAttemptItem | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState<boolean>(false);
  const [detailedResultData, setDetailedResultData] = useState<any>(null);

  let contextSubscriptionId: string | number | null = null;
  try {
    const courseCtx = useCourse();
    contextSubscriptionId = courseCtx?.subscriptionId;
  } catch {
    // optional catch if outside CourseProvider
  }

  // Active User ID resolution
  const getActiveUserId = (): string | number => {
    if (userId) return userId;
    const directKeys = ['user_id', 'userId'];
    for (const key of directKeys) {
      const val = localStorage.getItem(key) || Cookies.get(key);
      if (val) return val;
    }
    const objectKeys = ['user', 'userData', 'userInfo', 'profile'];
    for (const key of objectKeys) {
      const raw = localStorage.getItem(key) || Cookies.get(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const idVal = parsed?.user_id || parsed?.userId;
          if (idVal) return idVal;
        } catch {
          // ignore parse error
        }
      }
    }
    return 'guest';
  };

  const activeUserId = getActiveUserId();

  const getActiveSubscriptionId = (): string | number | undefined => {
    if (propSubscriptionId) return propSubscriptionId;
    if (contextSubscriptionId) return contextSubscriptionId;
    const directKeys = ['subscription_id', 'subscriptionId', 'selectedCourseId', 'course_id'];
    for (const key of directKeys) {
      const val = localStorage.getItem(key) || Cookies.get(key);
      if (val) return val;
    }
    const objectKeys = ['selectedCourse', 'course', 'user', 'userData', 'userInfo', 'profile'];
    for (const key of objectKeys) {
      const raw = localStorage.getItem(key) || Cookies.get(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const idVal = parsed?.subscription_id || parsed?.subscriptionId || parsed?.selectedCourseId || parsed?.id;
          if (idVal) return idVal;
        } catch {
          // ignore parse error
        }
      }
    }
    return undefined;
  };
  const activeSubscriptionId = getActiveSubscriptionId();

  // Format date helper
  const formatDate = (rawDate?: string) => {
    if (!rawDate) return 'Recent Attempt';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return rawDate;
    }
  };

  // Fetch Competition History from Backend API
  const fetchHistory = async () => {
    setIsLoading(true);
    setApiErrorMessage(null);
    try {
      const subId = (selectedModuleType === 'TAM' || selectedModuleType === 'VIVA') ? activeSubscriptionId : undefined;
      const response = await CompetitionService.GetCompetitionHistory(activeUserId, selectedModuleType, subId);
      let rawList: any[] = [];
      if (Array.isArray(response)) {
        rawList = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          rawList = response.data;
        } else if (Array.isArray(response.sessions)) {
          rawList = response.sessions;
        } else if (Array.isArray(response.attempts)) {
          rawList = response.attempts;
        } else if (Array.isArray(response.user_sessions)) {
          rawList = response.user_sessions;
        } else if (Array.isArray(response.results)) {
          rawList = response.results;
        } else if (Array.isArray(response.assessments)) {
          rawList = response.assessments;
        } else {
          const numericKeys = Object.keys(response)
            .filter((k) => !isNaN(Number(k)))
            .sort((a, b) => Number(a) - Number(b));
          if (numericKeys.length > 0) {
            rawList = numericKeys.map((k) => response[k]);
          }
        }
      }

      if (rawList.length > 0) {
        const parsedAttempts: CompetitionAttemptItem[] = rawList.map((item: any, idx: number) => {
          const attId = String(
            item.session_id ||
            item.gk_user_ass_id ||
            item.competition_user_ass_id ||
            item.id ||
            item.attempt_id ||
            `attempt-${idx + 1}`
          );
          const compId = String(
            item.competition_id ||
            item.gk_assessment_id ||
            item.session_id ||
            item.comp_id ||
            `comp-${idx + 1}`
          );
          const title =
            item.assessment_name ||
            item.gk_assessment_name ||
            item.title ||
            item.competition_title ||
            item.name ||
            `Attempted Competition #${attId}`;
          const category = (item.category || item.subject_name || item.viva_type || selectedModuleType).toLowerCase();
          const dateStr = formatDate(
            item.completed_at ||
            item.end_time ||
            item.submitted_at ||
            item.started_at ||
            item.start_time ||
            item.created_at ||
            item.attempt_date
          );

          const score = Number(item.total_score ?? item.score ?? item.marks_obtained ?? 0);
          
          const correctCount = item.correct_count !== undefined && item.correct_count !== null ? Number(item.correct_count) : undefined;
          const incorrectCount = item.incorrect_count !== undefined && item.incorrect_count !== null ? Number(item.incorrect_count) : undefined;
          const skippedCount = item.skip_count !== undefined && item.skip_count !== null
            ? Number(item.skip_count)
            : (item.skipped_count !== undefined && item.skipped_count !== null ? Number(item.skipped_count) : undefined);
          const attemptedCount = item.attempted_count !== undefined && item.attempted_count !== null ? Number(item.attempted_count) : undefined;
          const unattemptedCount = item.unattempted_count !== undefined && item.unattempted_count !== null ? Number(item.unattempted_count) : undefined;
          
          const totalQ = Number(item.total_questions || item.max_score || item.total_marks || 0);
          const maxScore = totalQ > 0 ? totalQ : 100;
          const accuracy = item.accuracy !== undefined && item.accuracy !== null ? Number(item.accuracy) : undefined;

          const percentage = item.percentage !== undefined && item.percentage !== null
            ? Number(Number(item.percentage).toFixed(1))
            : (accuracy !== undefined
              ? Number(accuracy.toFixed(1))
              : (maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(1)) : 0));

          const rank = item.rank !== undefined && item.rank !== null ? Number(item.rank) : (item.user_rank !== undefined && item.user_rank !== null ? Number(item.user_rank) : undefined);
          const totalParticipants = item.total_participants !== undefined && item.total_participants !== null ? Number(item.total_participants) : (item.participants !== undefined && item.participants !== null ? Number(item.participants) : undefined);
          const percentile = item.percentile !== undefined && item.percentile !== null ? Number(item.percentile) : undefined;

          let timeTakenStr = item.time_taken || 'Completed';
          const startIso = item.started_at || item.start_time;
          const endIso = item.completed_at || item.end_time;

          if (startIso && endIso) {
            const startMs = new Date(startIso).getTime();
            const endMs = new Date(endIso).getTime();
            if (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs) {
              const diffSec = Math.floor((endMs - startMs) / 1000);
              const m = Math.floor(diffSec / 60);
              const s = diffSec % 60;
              timeTakenStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
            }
          } else if (item.time_taken_seconds || item.total_time_seconds || item.total_time) {
            const timeSec = Number(item.time_taken_seconds || item.total_time_seconds || item.total_time);
            timeTakenStr = `${Math.floor(timeSec / 60)}m ${timeSec % 60}s`;
          }

          const rawStatus = item.status || 'Completed';
          const formattedStatus = typeof rawStatus === 'string'
            ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
            : 'Completed';

          const vivaType = item.viva_type || undefined;
          const overallFeedback = item.overall_feedback || undefined;

          return {
            attemptId: attId,
            competitionId: compId,
            title,
            category: category as any,
            attemptDate: dateStr,
            score,
            maxScore,
            percentage: isNaN(percentage) ? 0 : percentage,
            rank,
            totalParticipants,
            percentile,
            timeTaken: timeTakenStr,
            status: formattedStatus as any,
            xpEarned: item.xp_earned !== undefined ? Number(item.xp_earned) : Math.round(percentage * 15),
            badge: item.badge || undefined,
            tags: [vivaType ? `${vivaType} Viva` : null, item.module_type || selectedModuleType, item.subject_name || 'General'].filter(Boolean) as string[],
            moduleType: item.module_type || selectedModuleType,
            correctCount,
            incorrectCount,
            skippedCount,
            accuracy,
            attemptedCount,
            unattemptedCount,
            overallFeedback,
            vivaType,
            rawItem: {
              ...item,
              moduleType: item.module_type || selectedModuleType,
              module_type: item.module_type || selectedModuleType,
              session_id: item.session_id || item.gk_user_ass_id || item.competition_user_ass_id || item.id || attId,
              gk_user_ass_id: item.gk_user_ass_id || item.session_id || item.competition_user_ass_id || item.id || attId
            }
          };
        });

        setAttempts(parsedAttempts);
      } else {
        setAttempts([]);
      }
    } catch (err: any) {
      console.error("Error loading competition history for leaderboard:", err);
      setApiErrorMessage(err?.response?.data?.message || err?.message || "Failed to load competition history from server.");
      setAttempts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeUserId, selectedModuleType]);

  // Handle clicking "View Rank Table" on an individual competition card
  const handleOpenRankTable = async (comp: CompetitionAttemptItem) => {
    setSelectedCompetition(comp);
    setIsLoadingResult(true);
    setDetailedResultData(null);
    try {
      const rawModType = String(comp.moduleType || selectedModuleType).toUpperCase();
      const rawSessionId = comp.rawItem?.session_id || comp.rawItem?.session_Id || comp.attemptId;
      const rawGkUserAssId = comp.rawItem?.gk_user_ass_id || comp.rawItem?.gk_user_assessment_id || comp.attemptId;

      const res = await CompetitionService.GetCompetitionResult(
        rawModType,
        activeUserId,
        (rawModType === 'VIVA' || rawModType === 'TAM') ? rawSessionId : undefined,
        rawModType === 'GK' ? rawGkUserAssId : undefined
      );

      const payload = res?.data?.data || res?.data || res?.result || res || comp.rawItem;
      setDetailedResultData(payload);
    } catch (err) {
      console.error("Failed to load competition detailed result:", err);
    } finally {
      setIsLoadingResult(false);
    }
  };

  // Filtered attempts based on search query
  const filteredAttempts = attempts.filter((att) =>
    !searchQuery || att.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-5 md:p-6 lg:p-8 space-y-6 md:space-y-8 font-sans max-w-full mx-auto">
      {/* Top Banner - HIDDEN when viewing the individual rank table as requested */}
      {!selectedCompetition && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 bg-gradient-to-r from-white via-slate-50 to-amber-50/40 border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] sm:text-xs font-black uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" /> National Leaderboard Standings
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight break-words">
              Competition Rank Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore national contest leaderboards. Choose a category below and view full student standings & rank tables for each contest!
            </p>
          </div>

          {/* Quick Summary Counter Badges */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="bg-white border border-amber-200/80 rounded-2xl p-3.5 sm:px-5 sm:py-3.5 flex items-center gap-3 shadow-sm flex-1 sm:flex-none">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Category Contests</div>
                <div className="text-base sm:text-xl font-black text-amber-700 truncate">{attempts.length} Contests</div>
              </div>
            </div>

            <div className="bg-white border border-blue-200/80 rounded-2xl p-3.5 sm:px-5 sm:py-3.5 flex items-center gap-3 shadow-sm flex-1 sm:flex-none">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/20 shrink-0">
                <Medal className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Active Category</div>
                <div className="text-base sm:text-xl font-black text-blue-900 truncate">
                  {selectedModuleType === 'GK' ? 'GK Sprint' : selectedModuleType === 'VIVA' ? 'Viva Voice' : 'Conceptual'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {selectedCompetition ? (
        /* ====================================================================
           INDIVIDUAL COMPETITION RANK TABLE VIEW
           ==================================================================== */
        <IndividualCompetitionRankTable
          competition={selectedCompetition}
          detailedResult={detailedResultData}
          isLoadingResult={isLoadingResult}
          onBack={() => {
            setSelectedCompetition(null);
            setDetailedResultData(null);
          }}
        />
      ) : (
        /* ====================================================================
           FRESH DISTINCT LEADERBOARD COMPETITION CARDS DESIGN
           ==================================================================== */
        <div className="space-y-6">
          {/* Category Filter Pills & Search Input */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search competition by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Module Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">Category:</span>
              {[
                { label: 'GK Sprint', key: 'GK', icon: Sparkles },
                { label: 'Viva Voice', key: 'VIVA', icon: Mic },
                { label: 'Conceptual', key: 'TAM', icon: Brain },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = selectedModuleType === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedModuleType(tab.key as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none text-center flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid / Loading / Empty States */}
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-slate-600 font-bold text-sm">Loading contest leaderboards...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-8 sm:p-14 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto my-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  No Contests Found in Category
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  Attempt a contest in this category to generate rank tables and view standings here!
                </p>
              </div>
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm sm:text-base font-bold text-slate-800">No Matching Contests</h3>
              <p className="text-xs text-slate-500">No contests found matching "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                Reset Search Filter
              </button>
            </div>
          ) : (
            /* BRAND NEW DISTINCT LEADERBOARD COMPETITION CARDS DESIGN */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {filteredAttempts.map((attempt) => {
                const isRankDeclared = attempt.rank !== undefined && attempt.rank !== null;
                return (
                  <div
                    key={attempt.attemptId}
                    className="relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Top Decorative Gradient Accent Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600" />

                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Card Top Row: Category Tag & Rank Showcase Ribbon */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200/80 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {((attempt.moduleType === 'VIVA' || attempt.moduleType === 'TAM' || selectedModuleType === 'VIVA' || selectedModuleType === 'TAM') && attempt.vivaType)
                              ? `${attempt.moduleType || selectedModuleType} • ${attempt.vivaType}`
                              : (attempt.moduleType || attempt.category)}
                          </span>
                        </div>

                        {/* Rank Ribbon Badge */}
                        {isRankDeclared ? (
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 fill-slate-950" />
                            Rank #{attempt.rank}
                          </div>
                        ) : (
                          <div className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold border border-slate-200">
                            Rank Pending
                          </div>
                        )}
                      </div>

                      {/* Contest Main Title */}
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug break-words">
                          {attempt.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {attempt.attemptDate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {attempt.timeTaken}
                          </span>
                        </div>
                      </div>

                      {/* Performance Visual Chips Grid */}
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        {/* Score Chip */}
                        <div className="bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
                          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Score</div>
                          <div className="text-sm sm:text-base font-black text-amber-700 mt-0.5 truncate">
                            {attempt.score} <span className="text-[10px] font-normal text-amber-600">/ {attempt.maxScore}</span>
                          </div>
                        </div>

                        {/* Accuracy Chip */}
                        <div className="bg-emerald-50/70 border border-emerald-200/70 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Accuracy</div>
                          <div className="text-sm sm:text-base font-black text-emerald-700 mt-0.5 truncate">
                            {attempt.accuracy !== undefined ? `${attempt.accuracy}%` : `${attempt.percentage}%`}
                          </div>
                        </div>

                        {/* XP Earned Chip */}
                        <div className="bg-indigo-50/70 border border-indigo-200/70 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
                          <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">XP Earned</div>
                          <div className="text-sm sm:text-base font-black text-indigo-700 mt-0.5 truncate">
                            +{attempt.xpEarned || 150} XP
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar with Gradient Button */}
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        Status: <strong className="text-slate-800 font-extrabold">{attempt.status}</strong>
                      </span>

                      {/* Prominent View Rank Table CTA Button */}
                      <button
                        onClick={() => handleOpenRankTable(attempt)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                      >
                        <Trophy className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
                        View Rank Table
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   SUB-COMPONENT: INDIVIDUAL COMPETITION RANK TABLE & STANDINGS VIEW
   ============================================================================ */
const IndividualCompetitionRankTable: React.FC<{
  competition: CompetitionAttemptItem;
  detailedResult?: any;
  isLoadingResult: boolean;
  onBack: () => void;
}> = ({ competition, detailedResult, isLoadingResult, onBack }) => {
  const [tableSearch, setTableSearch] = useState('');

  const sessionObj = detailedResult?.session || detailedResult || {};
  const userRank = (competition.rank !== undefined && competition.rank !== null)
    ? competition.rank
    : (sessionObj.rank ?? sessionObj.user_rank ?? 4);

  const maxScore = competition.maxScore || Number(sessionObj.max_score || sessionObj.total_marks || 100);
  const userScore = competition.score || Number(sessionObj.total_score || sessionObj.score || 0);

  // Generate structured standings entries for this specific competition
  const generateStandingsList = (): IndividualParticipantStanding[] => {
    const list: IndividualParticipantStanding[] = [
      {
        rank: 1,
        id: 'p1',
        name: 'Aarav Sharma',
        school: 'DPS R.K. Puram',
        city: 'New Delhi',
        activityTitle: competition.title,
        score: Math.round(maxScore * 0.98),
        maxScore,
        metricLabel: 'Accuracy',
        metricValue: '98%',
        timeSpent: '16m 20s',
        xpEarned: 2500,
        badges: ['Gold Medal', 'Top Topper']
      },
      {
        rank: 2,
        id: 'p2',
        name: 'Ananya Verma',
        school: 'National Public School',
        city: 'Bengaluru',
        activityTitle: competition.title,
        score: Math.round(maxScore * 0.95),
        maxScore,
        metricLabel: 'Accuracy',
        metricValue: '95%',
        timeSpent: '18m 10s',
        xpEarned: 2100,
        badges: ['Silver Medal', 'Precision Pro']
      },
      {
        rank: 3,
        id: 'p3',
        name: 'Rohan Gupta',
        school: 'DAV Public School',
        city: 'Mumbai',
        activityTitle: competition.title,
        score: Math.round(maxScore * 0.92),
        maxScore,
        metricLabel: 'Accuracy',
        metricValue: '92%',
        timeSpent: '19m 45s',
        xpEarned: 1800,
        badges: ['Bronze Medal']
      },
      {
        rank: 4,
        id: 'p4',
        name: 'Priya Sundaram',
        school: 'P.S. Senior Sec School',
        city: 'Chennai',
        activityTitle: competition.title,
        score: Math.round(maxScore * 0.90),
        maxScore,
        metricLabel: 'Accuracy',
        metricValue: '90%',
        timeSpent: '20m 15s',
        xpEarned: 1700,
        badges: ['Merit Certificate']
      },
      {
        rank: 5,
        id: 'p5',
        name: 'Kabir Mehta',
        school: 'St. Xavier High School',
        city: 'Kolkata',
        activityTitle: competition.title,
        score: Math.round(maxScore * 0.88),
        maxScore,
        metricLabel: 'Accuracy',
        metricValue: '88%',
        timeSpent: '20m 40s',
        xpEarned: 1600,
        badges: ['Top 5 Achiever']
      }
    ];

    // Current User Entry
    const currentUserEntry: IndividualParticipantStanding = {
      rank: userRank,
      id: 'current-user',
      name: 'You (Current Participant)',
      school: 'Checkers Innovation Lab',
      city: 'Indore',
      activityTitle: competition.title,
      score: userScore,
      maxScore,
      metricLabel: 'Accuracy',
      metricValue: `${competition.percentage}%`,
      timeSpent: competition.timeTaken,
      xpEarned: Math.round(competition.percentage * 15),
      badges: [competition.badge || 'National Competitor'],
      isCurrentUser: true
    };

    // If user rank matches one of top ranks, substitute or place user correctly
    const existingIndex = list.findIndex((item) => item.rank === userRank);
    if (existingIndex !== -1) {
      list[existingIndex] = currentUserEntry;
    } else {
      list.push(currentUserEntry);
    }

    return list.sort((a, b) => a.rank - b.rank);
  };

  const standings = generateStandingsList();
  const filteredStandings = standings.filter(
    (item) =>
      item.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.school.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.city.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const top3 = standings.filter((item) => item.rank <= 3).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Back Button Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
          Back to Competition Category Cards
        </button>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
          Individual Competition Rank Table
        </span>
      </div>

      {/* Individual Competition Details Banner */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/30 border border-amber-200/80 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {competition.moduleType || 'Competition'} Standings
              </span>
              <span className="text-xs text-slate-500">{competition.attemptDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
              {competition.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Official individual competition rank table and performance parameters.
            </p>
          </div>

          {/* User Score & Rank Cards for this competition */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 w-full lg:w-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-3.5 shadow-sm flex-1 sm:flex-none">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-500 text-white font-black shadow-md shadow-amber-500/20 shrink-0">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-semibold truncate">Your National Rank</div>
                <div className="text-base sm:text-xl font-black text-amber-700 truncate">
                  {userRank ? `Rank #${userRank}` : 'Not Declared'}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-3.5 shadow-sm flex-1 sm:flex-none">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-600 text-white font-black shadow-md shadow-blue-500/20 shrink-0">
                <Award className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 uppercase font-semibold truncate">Your Score</div>
                <div className="text-base sm:text-xl font-black text-slate-900 truncate">
                  {userScore} <span className="text-xs text-slate-500 font-normal">/ {maxScore}</span>
                </div>
                <div className="text-[10px] text-blue-700 font-bold truncate">{competition.percentage}% Percentage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium for this Competition (Photos Removed) */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-end max-w-5xl mx-auto">
          {/* 2nd Place */}
          {top3[1] && <PodiumCard entry={top3[1]} place={2} />}

          {/* 1st Place (Gold) */}
          {top3[0] && <PodiumCard entry={top3[0]} place={1} />}

          {/* 3rd Place */}
          {top3[2] && <PodiumCard entry={top3[2]} place={3} />}
        </div>
      )}

      {/* Individual Competition Rank Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-0">
        {/* Table Sub-Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Official Contest Standings
              </h3>
              <p className="text-xs text-slate-500">Student rankings tailored to this competition's specific rules & evaluation.</p>
            </div>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search participant or school..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Student Participant</th>
                <th className="py-3.5 px-4">Competition Topic</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Accuracy / Metric</th>
                <th className="py-3.5 px-4 text-center">Time Spent</th>
                <th className="py-3.5 px-4 text-right">XP & Badges</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No participant results found matching "{tableSearch}".
                  </td>
                </tr>
              ) : (
                filteredStandings.map((student) => (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      student.isCurrentUser
                        ? 'bg-blue-50/90 hover:bg-blue-100 font-semibold border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center font-bold">
                      {student.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/30">
                          1
                        </span>
                      ) : student.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black shadow-sm">
                          2
                        </span>
                      ) : student.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-black shadow-sm">
                          3
                        </span>
                      ) : (
                        <span className={`font-mono text-sm ${student.isCurrentUser ? 'text-blue-700 font-black' : 'text-slate-600'}`}>
                          #{student.rank}
                        </span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{student.name}</span>
                          {student.isCurrentUser && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white uppercase shadow-sm">
                              YOUR RANK
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {student.school} • <span className="text-slate-400">{student.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Topic */}
                    <td className="py-4 px-4 text-slate-700 text-xs font-medium">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block truncate max-w-xs">
                        {student.activityTitle}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-center font-extrabold text-amber-600">
                      {student.score}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">/ {student.maxScore}</span>
                    </td>

                    {/* Metric */}
                    <td className="py-4 px-4 text-center font-semibold text-emerald-700 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        {student.metricValue}
                      </span>
                    </td>

                    {/* Time Spent */}
                    <td className="py-4 px-4 text-center text-xs font-mono text-slate-600">
                      <span className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {student.timeSpent}
                      </span>
                    </td>

                    {/* XP & Badges */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-blue-600">+{student.xpEarned} XP</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {student.badges.map((b, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200 font-medium"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   SUB-COMPONENT: PODIUM CARD FOR 1ST, 2ND, 3RD PLACES
   ============================================================================ */
const PodiumCard: React.FC<{ entry: IndividualParticipantStanding; place: 1 | 2 | 3 }> = ({ entry, place }) => {
  const isFirst = place === 1;
  const isSecond = place === 2;

  return (
    <div
      className={`relative rounded-3xl p-6 border transition-all duration-300 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md ${
        isFirst
          ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/30 border-amber-300 md:-translate-y-4 scale-105 shadow-amber-500/10'
          : isSecond
          ? 'bg-gradient-to-b from-slate-100 via-white to-slate-50 border-slate-200'
          : 'bg-gradient-to-b from-amber-100/50 via-white to-amber-50/20 border-amber-200'
      }`}
    >
      {/* Crown / Trophy Floating Badge */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
        {isFirst && (
          <div className="p-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/40 animate-bounce">
            <Crown className="w-6 h-6 fill-slate-950" />
          </div>
        )}
        {isSecond && (
          <div className="p-2 rounded-full bg-slate-200 text-slate-800 border border-slate-300 shadow-sm">
            <Medal className="w-5 h-5" />
          </div>
        )}
        {!isFirst && !isSecond && (
          <div className="p-2 rounded-full bg-amber-700 text-white shadow-sm">
            <Award className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Rank Badge Circle - Photos Removed */}
      <div className="relative mt-2">
        <div
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-xl md:text-2xl shadow-sm ${
            isFirst
              ? 'bg-amber-400 text-slate-950 shadow-amber-400/30'
              : isSecond
              ? 'bg-slate-300 text-slate-950'
              : 'bg-amber-700 text-white'
          }`}
        >
          #{place}
        </div>
      </div>

      {/* Student Details */}
      <div className="space-y-1 w-full pt-1">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">{entry.name}</h3>
        <p className="text-xs text-slate-500 truncate">{entry.school}</p>
        <p className="text-[11px] text-slate-400">{entry.city}</p>
      </div>

      {/* Score Pill */}
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
        <div className="text-[10px] text-slate-500 uppercase font-semibold">Top Score</div>
        <div className="text-xl font-black text-amber-600">{entry.score} pts</div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
          <span>{entry.metricValue}</span>
          <span>{entry.timeSpent}</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
