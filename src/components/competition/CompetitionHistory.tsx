import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { CompetitionService } from '../../services/CompetitionService';
import { useCourse } from '../../context/CourseContext';
import {
  Trophy,
  Calendar,
  Clock,
  Award,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
  FileText,
  BarChart2,
  Medal,
  Zap,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export interface AttemptSummary {
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
  status: 'Completed' | 'Qualified' | 'Winner';
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

// Static mock data commented out - competition history relies strictly on API data
const MOCK_ATTEMPTS: AttemptSummary[] = [
  /*
  {
    attemptId: 'attempt-101',
    competitionId: 'comp-1',
    title: 'National Mathematics Speed Cup 2026',
    category: 'mathematics',
    attemptDate: '05 Aug 2026, 10:45 AM',
    score: 925,
    maxScore: 1000,
    percentage: 92.5,
    rank: 4,
    totalParticipants: 1420,
    percentile: 99.7,
    timeTaken: '21m 05s / 45m',
    status: 'Winner',
    xpEarned: 1650,
    badge: 'Gold Medal Merit Certificate',
    tags: ['Algebra', 'Geometry', 'Speed Math'],
    moduleType: 'GK'
  },
  {
    attemptId: 'attempt-102',
    competitionId: 'comp-2',
    title: 'Physics Mechanics & Optics Championship',
    category: 'physics',
    attemptDate: '01 Aug 2026, 4:15 PM',
    score: 880,
    maxScore: 1000,
    percentage: 88.0,
    rank: 7,
    totalParticipants: 890,
    percentile: 99.2,
    timeTaken: '48m 10s / 60m',
    status: 'Qualified',
    xpEarned: 1400,
    badge: 'Silver Medal Certificate',
    tags: ['Kinematics', 'Optics', 'Laws of Motion'],
    moduleType: 'VIVA'
  },
  {
    attemptId: 'attempt-103',
    competitionId: 'comp-3',
    title: 'All India Coding & Logic League 2026',
    category: 'coding',
    attemptDate: '25 Jul 2026, 6:00 PM',
    score: 950,
    maxScore: 1000,
    percentage: 95.0,
    rank: 2,
    totalParticipants: 2340,
    percentile: 99.9,
    timeTaken: '42m 15s / 60m',
    status: 'Winner',
    xpEarned: 2100,
    badge: 'National Rank #2 Trophy',
    tags: ['Python', 'Logic', 'Algorithms'],
    moduleType: 'TAM'
  },
  {
    attemptId: 'attempt-104',
    competitionId: 'comp-4',
    title: 'Organic Chemistry Reactions Sprint',
    category: 'chemistry',
    attemptDate: '18 Jul 2026, 5:30 PM',
    score: 850,
    maxScore: 1000,
    percentage: 85.0,
    rank: 12,
    totalParticipants: 610,
    percentile: 98.0,
    timeTaken: '32m 00s / 40m',
    status: 'Completed',
    xpEarned: 1200,
    badge: 'Distinction Certificate',
    tags: ['Reactions', 'Isomerism', 'Hydrocarbons'],
    moduleType: 'GK'
  }
  */
];

export interface CompetitionHistoryProps {
  userId?: string | number;
  subscriptionId?: string | number;
  onSelectCompetition: (attemptId: string, attemptData?: any) => void;
  onExploreCompetitions?: () => void;
}

export const CompetitionHistory: React.FC<CompetitionHistoryProps> = ({
  userId,
  subscriptionId: propSubscriptionId,
  onSelectCompetition,
  onExploreCompetitions
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModuleType, setSelectedModuleType] = useState<'GK' | 'VIVA' | 'TAM' | 'ALL'>('GK');
  const [searchQuery, setSearchQuery] = useState('');
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

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

  // Fetch Attempt History from Backend API
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
        const parsedAttempts: AttemptSummary[] = rawList.map((item: any, idx: number) => {
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
            xpEarned: item.xp_earned !== undefined ? Number(item.xp_earned) : undefined,
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
      console.error("Error loading competition history:", err);
      setApiErrorMessage(err?.response?.data?.message || err?.message || "Failed to load competition history from server.");
      setAttempts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeUserId, selectedModuleType]);

  // Filtered attempts based on search by assessment name (title)
  const filteredAttempts = attempts.filter((att) => {
    const matchesCat = selectedCategory === 'all' || att.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      att.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const totalAttempted = attempts.length;
  const avgScore = totalAttempted > 0
    ? (attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempted).toFixed(1)
    : '0';
  const totalXp = attempts.reduce((acc, curr) => acc + (curr.xpEarned || 0), 0);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 space-y-8 font-sans">
      {/* Top Header & Overview Stats Bar - Light Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-blue-600" /> My Competition Scorecards
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Attempted Competition History
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Review all contests you have attempted till now, check detailed scorecards, national rank standings, and attempted question-answer lists.
          </p>
        </div>

        {/* Overview Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Competitions</div>
              <div className="text-xl font-black text-slate-900">{totalAttempted} Attempted</div>
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Average Score</div>
              <div className="text-xl font-black text-emerald-700">{avgScore}%</div>
            </div>
          </div>

          {/* <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total XP Earned</div>
              <div className="text-xl font-black text-amber-700">{totalXp.toLocaleString()} XP</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Module Type & Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attempted competition by assessment name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Module Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Module:</span>
          {[
            { label: 'GK Sprint', key: 'GK' },
            { label: 'Viva Voice', key: 'VIVA' },
            { label: 'Conceptual', key: 'TAM' },
            // { label: 'All Modules', key: 'ALL' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedModuleType(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedModuleType === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Empty States */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium text-sm">Fetching attempted competition history...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="p-12 md:p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              No Competition Attempted Yet
            </h3>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              There is no competition attempted yet. Go ahead, register for an active competition and attempt it to view your performance scorecards and national ranks here!
            </p>
          </div>
          {onExploreCompetitions && (
            <button
              onClick={onExploreCompetitions}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              Explore & Register Competitions <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Matching Attempted Competitions</h3>
          <p className="text-xs text-slate-500">No attempted competitions found matching your search term "{searchQuery}".</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedModuleType('GK');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            Reset Search Filter
          </button>
        </div>
      ) : (
        /* Attempt History Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAttempts.map((attempt) => (
            <div
              key={attempt.attemptId}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-6 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="space-y-2">
                  {/* Top Row: Module & Viva Type (Left) and Date/Time (Right) */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                      {((attempt.moduleType === 'VIVA' || attempt.moduleType === 'TAM' || selectedModuleType === 'VIVA' || selectedModuleType === 'TAM') && attempt.vivaType)
                        ? `${attempt.moduleType || selectedModuleType} - ${attempt.vivaType}`
                        : (attempt.moduleType || attempt.category)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {attempt.attemptDate}
                    </span>
                  </div>

                  {/* Title & Status Row: Assessment Name (Left) and Status (Right / Same line) */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {attempt.title}
                    </h3>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 border ${
                      String(attempt.status).toUpperCase().includes('UNATTEMPT')
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : String(attempt.status).toUpperCase().includes('PROGRESS')
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {attempt.status}
                    </span>
                  </div>
                </div>

                {/* Score, Accuracy, Rank & Percentile Overview Box */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {/* My Score */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">My Score</div>
                    <div className="text-base font-extrabold text-slate-900">
                      {attempt.score} <span className="text-[10px] text-slate-400 font-normal">/ {attempt.maxScore}</span>
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div className="border-l border-slate-200 pl-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                    {attempt.accuracy !== undefined && attempt.accuracy !== null ? (
                      <>
                        <div className="text-base font-extrabold text-blue-600">
                          {attempt.accuracy}%
                        </div>
                        <div className="text-[10px] text-blue-700 font-bold">Precision</div>
                      </>
                    ) : (
                      <div className="text-xs font-semibold text-slate-400 py-1">
                        Not Calculated
                      </div>
                    )}
                  </div>

                  {/* National Rank */}
                  <div className="border-l border-slate-200 pl-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">National Rank</div>
                    {attempt.rank !== undefined && attempt.rank !== null ? (
                      <>
                        <div className="text-base font-extrabold text-amber-600">
                          Rank #{attempt.rank}
                        </div>
                        {attempt.totalParticipants !== undefined && (
                          <div className="text-[10px] text-slate-500">{attempt.totalParticipants} Candidates</div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs font-semibold text-slate-400 py-1">
                        Not Declared
                      </div>
                    )}
                  </div>

                  {/* Percentage */}
                  <div className="border-l border-slate-200 pl-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Percentage</div>
                    {attempt.percentage !== undefined && attempt.percentage !== null ? (
                      <>
                        <div className="text-base font-extrabold text-emerald-600">
                          {attempt.percentage}%
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold">Overall Score</div>
                      </>
                    ) : (
                      <div className="text-xs font-semibold text-slate-400 py-1">
                        Not Calculated
                      </div>
                    )}
                  </div>
                </div>

                {/* Correct / Incorrect / Skipped / Attempted Breakdown if available */}
                {(attempt.attemptedCount !== undefined || attempt.correctCount !== undefined || attempt.skippedCount !== undefined) && (
                  <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600 font-medium flex-wrap gap-2">
                    {attempt.correctCount !== undefined && (
                      <span className="text-emerald-700 font-bold">✓ {attempt.correctCount} Correct</span>
                    )}
                    {attempt.incorrectCount !== undefined && (
                      <span className="text-red-600 font-bold">✗ {attempt.incorrectCount} Incorrect</span>
                    )}
                    {attempt.attemptedCount !== undefined && (
                      <span className="text-blue-700 font-bold">🎙 {attempt.attemptedCount} Attempted</span>
                    )}
                    {attempt.skippedCount !== undefined && (
                      <span className="text-amber-600 font-bold">⊘ {attempt.skippedCount} Skipped</span>
                    )}
                    {attempt.unattemptedCount !== undefined && (
                      <span className="text-slate-500 font-bold">… {attempt.unattemptedCount} Unattempted</span>
                    )}
                    {attempt.accuracy !== undefined && (
                      <span className="text-blue-700 font-extrabold">{attempt.accuracy}% Accuracy</span>
                    )}
                  </div>
                )}


                {/* Tags & Reward Badge */}
                {/* <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {attempt.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-amber-50/70 border border-amber-200 px-3 py-1.5 rounded-xl">
                    <Medal className="w-4 h-4 text-amber-500" />
                    <span>Reward: {attempt.badge}</span>
                  </div>
                </div> */}
              </div>

              {/* Action Footer Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                <div className="text-xs text-slate-400 font-mono">
                  Time: {attempt.timeTaken}
                </div>

                <button
                  onClick={() => onSelectCompetition(attempt.attemptId, {
                    ...(attempt.rawItem || {}),
                    ...attempt,
                    moduleType: attempt.moduleType || selectedModuleType,
                    module_type: attempt.moduleType || selectedModuleType,
                    session_id: attempt.rawItem?.session_id || attempt.rawItem?.gk_user_ass_id || attempt.attemptId,
                    gk_user_ass_id: attempt.rawItem?.gk_user_ass_id || attempt.rawItem?.session_id || attempt.attemptId
                  })}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  View Detailed Result & Questions <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitionHistory;
