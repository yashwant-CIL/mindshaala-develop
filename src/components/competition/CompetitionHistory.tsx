import React, { useState } from 'react';
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
  ArrowUpRight
} from 'lucide-react';

export interface AttemptSummary {
  attemptId: string;
  competitionId: string;
  title: string;
  category: 'mathematics' | 'physics' | 'chemistry' | 'coding' | 'science';
  attemptDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank: number;
  totalParticipants: number;
  percentile: number;
  timeTaken: string;
  status: 'Completed' | 'Qualified' | 'Winner';
  xpEarned: number;
  badge: string;
  tags: string[];
}

const MOCK_ATTEMPTS: AttemptSummary[] = [
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
    tags: ['Algebra', 'Geometry', 'Speed Math']
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
    tags: ['Kinematics', 'Optics', 'Laws of Motion']
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
    tags: ['Python', 'Logic', 'Algorithms']
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
    tags: ['Reactions', 'Isomerism', 'Hydrocarbons']
  }
];

export const CompetitionHistory: React.FC<{
  onSelectCompetition: (attemptId: string) => void;
}> = ({ onSelectCompetition }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered attempts based on search and category
  const filteredAttempts = MOCK_ATTEMPTS.filter((att) => {
    const matchesCat = selectedCategory === 'all' || att.category === selectedCategory;
    const matchesSearch =
      att.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const totalAttempted = MOCK_ATTEMPTS.length;
  const avgScore = (
    MOCK_ATTEMPTS.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempted
  ).toFixed(1);
  const totalXp = MOCK_ATTEMPTS.reduce((acc, curr) => acc + curr.xpEarned, 0);

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

          <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total XP Earned</div>
              <div className="text-xl font-black text-amber-700">{totalXp.toLocaleString()} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attempted competition by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'mathematics', 'physics', 'chemistry', 'coding'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Attempt History Grid */}
      {filteredAttempts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-700 font-semibold">No attempted competitions found matching your search filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAttempts.map((attempt) => (
            <div
              key={attempt.attemptId}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-6 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                        {attempt.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {attempt.attemptDate}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {attempt.title}
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {attempt.status}
                  </span>
                </div>

                {/* Score & Rank Overview Box */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">My Score</div>
                    <div className="text-base font-extrabold text-slate-900">
                      {attempt.score} <span className="text-[10px] text-slate-400 font-normal">/ {attempt.maxScore}</span>
                    </div>
                    <div className="text-[10px] text-blue-700 font-bold">{attempt.percentage}%</div>
                  </div>

                  <div className="border-x border-slate-200 px-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">National Rank</div>
                    <div className="text-base font-extrabold text-amber-600">
                      Rank #{attempt.rank}
                    </div>
                    <div className="text-[10px] text-slate-500">{attempt.totalParticipants} Candidates</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Percentile</div>
                    <div className="text-base font-extrabold text-emerald-600">
                      {attempt.percentile}%
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">Top { (100 - attempt.percentile).toFixed(1) }%</div>
                  </div>
                </div>

                {/* Tags & Reward Badge */}
                <div className="space-y-2">
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
                </div>
              </div>

              {/* Action Footer Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                <div className="text-xs text-slate-400 font-mono">
                  Time: {attempt.timeTaken}
                </div>

                <button
                  onClick={() => onSelectCompetition(attempt.attemptId)}
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
