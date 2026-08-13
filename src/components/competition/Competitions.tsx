import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Zap,
  Tag,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Gift,
  Share2,
  Download,
  Flame,
  Award,
  BookOpen,
  ChevronLeft,
  Percent,
  Timer,
  Play,
  ShieldCheck,
  X,
  Star,
  Check,
  TrendingUp,
  Smartphone
} from 'lucide-react';

// Types
export interface CompetitionItem {
  id: string;
  title: string;
  category: 'mathematics' | 'physics' | 'chemistry' | 'coding' | 'science';
  description: string;
  bannerImage?: string;
  startDate: string;
  registrationDeadline: string; // ISO string for live timer
  startTime: string;
  duration: string;
  entryFee: number; // 0 for free
  prizePool: string;
  registeredCount: number;
  maxCapacity: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  isRegistered?: boolean;
  status: 'upcoming' | 'live' | 'completed';
  prizes: { rank: string; reward: string }[];
  syllabus: string[];
}

export interface OfferItem {
  id: string;
  title: string;
  code: string;
  discount: string;
  description: string;
  expiryDate: string;
  badge: string;
  gradient: string;
}

export interface PosterItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bgGradient: string;
  ctaText: string;
  ctaAction: string;
  imageIcon: string;
  highlights: string[];
}

// Sample Mock Data
const MOCK_POSTERS: PosterItem[] = [
  {
    id: 'p1',
    title: 'MindShaala National STEM Olympiad 2026',
    subtitle: 'Compete with 50,000+ students nationwide & win up to ₹5,00,000 in Scholarships!',
    badge: 'GRAND CHAMPIONSHIP',
    bgGradient: 'from-blue-700 via-indigo-700 to-purple-800',
    ctaText: 'Explore & Register Now',
    ctaAction: 'stem-2026',
    imageIcon: 'Trophy',
    highlights: ['Laptops & Tablets for Top 10', 'National Certificate', '100% Scholarship']
  },
  {
    id: 'p2',
    title: 'Download MindShaala App & Get 2 Free Entry Passes',
    subtitle: 'Practice anywhere, track live rank analytics & get instant AI doubt resolution.',
    badge: 'MOBILE EXCLUSIVE',
    bgGradient: 'from-sky-700 via-blue-800 to-indigo-900',
    ctaText: 'Download App',
    ctaAction: 'download-app',
    imageIcon: 'Smartphone',
    highlights: ['Offline Exam Practice', 'Real-time Push Alerts', 'Daily Quiz Streak']
  },
  {
    id: 'p3',
    title: 'Speed Physics Hackathon - Super League',
    subtitle: '30 Questions in 20 Minutes. High precision & fast response challenge!',
    badge: 'LIVE THIS WEEKEND',
    bgGradient: 'from-amber-600 via-orange-700 to-red-800',
    ctaText: 'Join Battle',
    ctaAction: 'physics-speed',
    imageIcon: 'Zap',
    highlights: ['Instant Leaderboard', 'Double XP Coins', 'Gold Medal Badge']
  }
];

const MOCK_OFFERS: OfferItem[] = [
  {
    id: 'off-1',
    title: 'Early Bird Pass - 50% OFF',
    code: 'OLYMPIAD50',
    discount: '50% OFF',
    description: 'Get half price on all paid Olympiad entry fees this month.',
    expiryDate: '2026-08-15T23:59:59',
    badge: 'HOT DEAL',
    gradient: 'from-amber-500 to-red-500'
  },
  {
    id: 'off-2',
    title: 'Free Olympiad Pass for Top Performers',
    code: 'STREAKPRO',
    discount: '100% FREE',
    description: 'Maintained 5-day study streak? Claim 1 free premium contest entry.',
    expiryDate: '2026-08-20T23:59:59',
    badge: 'LIMITED TIME',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'off-3',
    title: 'Double XP & Bonus Coins',
    code: '2XBOOST',
    discount: '2x XP COINS',
    description: 'Earn 2x rewards on all registered weekend competitions.',
    expiryDate: '2026-08-12T23:59:59',
    badge: 'WEEKEND SPECIAL',
    gradient: 'from-purple-500 to-indigo-600'
  }
];

const MOCK_REGISTERED: CompetitionItem[] = [
  {
    id: 'reg-1',
    title: 'National Mathematics Speed Cup',
    category: 'mathematics',
    description: 'Fast-paced mental math, algebra, geometry & quantitative logic exam.',
    startDate: 'Tomorrow, 10:00 AM',
    registrationDeadline: '2026-08-07T10:00:00',
    startTime: '2026-08-07T10:00:00',
    duration: '45 mins',
    entryFee: 0,
    prizePool: '₹25,000',
    registeredCount: 1420,
    maxCapacity: 2000,
    difficulty: 'Intermediate',
    tags: ['Algebra', 'Geometry', 'Speed Math'],
    isRegistered: true,
    status: 'upcoming',
    prizes: [
      { rank: '1st Rank', reward: '₹10,000 + Gold Medal + Trophy' },
      { rank: '2nd Rank', reward: '₹5,000 + Silver Medal' },
      { rank: '3rd Rank', reward: '₹2,500 + Bronze Medal' },
      { rank: 'Top 50', reward: 'Merit Certificate + 500 XP' }
    ],
    syllabus: ['Real Numbers', 'Polynomials', 'Coordinate Geometry', 'Triangles', 'Trigonometry']
  },
  {
    id: 'reg-2',
    title: 'Physics Mechanics & Optics Championship',
    category: 'physics',
    description: 'Conceptual and numerical physics battle for High School students.',
    startDate: '10 Aug 2026, 4:00 PM',
    registrationDeadline: '2026-08-10T16:00:00',
    startTime: '2026-08-10T16:00:00',
    duration: '60 mins',
    entryFee: 99,
    prizePool: '₹15,000',
    registeredCount: 890,
    maxCapacity: 1000,
    difficulty: 'Advanced',
    tags: ['Kinematics', 'Newton Laws', 'Optics'],
    isRegistered: true,
    status: 'upcoming',
    prizes: [
      { rank: '1st Rank', reward: '₹7,000 + Physics Kit' },
      { rank: '2nd Rank', reward: '₹4,000' },
      { rank: 'Top 10%', reward: 'Certificate of Distinction' }
    ],
    syllabus: ['Laws of Motion', 'Work Power Energy', 'Ray Optics', 'Gravitation']
  }
];

const MOCK_UPCOMING: CompetitionItem[] = [
  {
    id: 'comp-101',
    title: 'All India Coding & Logic League 2026',
    category: 'coding',
    description: 'Algorithmic problem solving, Python/JS logic puzzles, and block coding challenge.',
    startDate: '12 Aug 2026, 6:00 PM',
    registrationDeadline: '2026-08-12T18:00:00',
    startTime: '2026-08-12T18:00:00',
    duration: '60 mins',
    entryFee: 0,
    prizePool: '₹50,000',
    registeredCount: 2340,
    maxCapacity: 3000,
    difficulty: 'Intermediate',
    tags: ['Python', 'Logic', 'Algorithms'],
    isRegistered: false,
    status: 'upcoming',
    prizes: [
      { rank: '1st Rank', reward: 'Smart Tablet + ₹15,000' },
      { rank: '2nd Rank', reward: 'Smart Watch + ₹8,000' },
      { rank: '3rd Rank', reward: '₹4,000 + Swag Box' },
      { rank: 'Top 100', reward: 'Coder Certificate' }
    ],
    syllabus: ['Data Structures', 'Loops & Conditionals', 'Pattern Building', 'Logic Puzzles']
  },
  {
    id: 'comp-102',
    title: 'Organic Chemistry Reactions Sprint',
    category: 'chemistry',
    description: 'Identify mechanisms, reagents, and organic conversions under tight time pressure.',
    startDate: '14 Aug 2026, 5:00 PM',
    registrationDeadline: '2026-08-14T17:00:00',
    startTime: '2026-08-14T17:00:00',
    duration: '40 mins',
    entryFee: 49,
    prizePool: '₹10,000',
    registeredCount: 610,
    maxCapacity: 1000,
    difficulty: 'Advanced',
    tags: ['Hydrocarbons', 'Functional Groups', 'Reactions'],
    isRegistered: false,
    status: 'upcoming',
    prizes: [
      { rank: '1st Rank', reward: '₹5,000 + Chemistry Lab Kit' },
      { rank: '2nd Rank', reward: '₹2,500' },
      { rank: '3rd Rank', reward: '₹1,000' }
    ],
    syllabus: ['Alkanes & Alkenes', 'Aldehydes & Ketones', 'Isomerism', 'Named Reactions']
  },
  {
    id: 'comp-103',
    title: 'Junior Science & Environment Quest',
    category: 'science',
    description: 'Fun interactive quiz on General Science, Earth, Solar System, and Biology fundamentals.',
    startDate: '16 Aug 2026, 11:00 AM',
    registrationDeadline: '2026-08-16T11:00:00',
    startTime: '2026-08-16T11:00:00',
    duration: '30 mins',
    entryFee: 0,
    prizePool: '₹12,000',
    registeredCount: 450,
    maxCapacity: 800,
    difficulty: 'Beginner',
    tags: ['General Science', 'Biology', 'Space'],
    isRegistered: false,
    status: 'upcoming',
    prizes: [
      { rank: '1st Rank', reward: 'Telescope + ₹4,000' },
      { rank: '2nd Rank', reward: 'Microscope Kit' },
      { rank: '3rd Rank', reward: '₹1,500' }
    ],
    syllabus: ['Solar System', 'Plant Life', 'Human Body Systems', 'Ecology & Environment']
  },
  {
    id: 'comp-104',
    title: 'Advanced Calculus & Analytical Geometry',
    category: 'mathematics',
    description: 'Challenging calculus problems designed to test deep problem solving skills.',
    startDate: '18 Aug 2026, 3:00 PM',
    registrationDeadline: '2026-08-18T15:00:00',
    startTime: '2026-08-18T15:00:00',
    duration: '75 mins',
    entryFee: 149,
    prizePool: '₹30,000',
    registeredCount: 320,
    maxCapacity: 500,
    difficulty: 'Advanced',
    tags: ['Limits', 'Derivatives', 'Integration'],
    isRegistered: false,
    status: 'upcoming',
    prizes: [
      { rank: '1st Rank', reward: '₹12,000 + Trophy' },
      { rank: '2nd Rank', reward: '₹7,000' },
      { rank: '3rd Rank', reward: '₹4,000' }
    ],
    syllabus: ['Limits & Continuity', 'Differential Calculus', 'Definite Integrals', 'Vectors']
  }
];

// Helper for live countdown calculation
function calculateTimeLeft(targetDateStr: string) {
  const difference = +new Date(targetDateStr) - +new Date();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false
  };
}

export const Competitions: React.FC = () => {
  const [activePosterIndex, setActivePosterIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFee, setSelectedFee] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredCompetitions, setRegisteredCompetitions] = useState<CompetitionItem[]>(MOCK_REGISTERED);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<CompetitionItem[]>(MOCK_UPCOMING);
  const [selectedModalComp, setSelectedModalComp] = useState<CompetitionItem | null>(null);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'registered'>('explore');

  // Auto slide poster banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePosterIndex((prev) => (prev + 1) % MOCK_POSTERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Handle registration action
  const handleRegister = (comp: CompetitionItem) => {
    if (comp.isRegistered) return;

    const updatedComp = { ...comp, isRegistered: true, registeredCount: comp.registeredCount + 1 };

    setUpcomingCompetitions((prev) =>
      prev.map((c) => (c.id === comp.id ? updatedComp : c))
    );

    setRegisteredCompetitions((prev) => [updatedComp, ...prev]);

    if (selectedModalComp?.id === comp.id) {
      setSelectedModalComp(updatedComp);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedOfferId(id);
    setTimeout(() => setCopiedOfferId(null), 2500);
  };

  // Filtered upcoming competitions
  const filteredUpcoming = upcomingCompetitions.filter((comp) => {
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesFee =
      selectedFee === 'all' ||
      (selectedFee === 'free' && comp.entryFee === 0) ||
      (selectedFee === 'paid' && comp.entryFee > 0);
    const matchesSearch =
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesFee && matchesSearch;
  });

  const totalRegisteredCount = registeredCompetitions.length;
  const currentPoster = MOCK_POSTERS[activePosterIndex];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 space-y-8 font-sans">
      {/* Top Header & Registration Counter Bar - Light Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-blue-600" /> MindShaala Competition Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Compete, Excel & Win Rewards
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Test your knowledge in real-time speed challenges, Olympiads, and STEM leagues. Earn medals, cash prizes, and national glory.
          </p>
        </div>

        {/* Live Registered Counter Badge & Stats */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-3">
            <div className="p-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">My Active Registrations</div>
              <div className="text-xl font-black text-slate-900 flex items-center gap-2">
                {totalRegisteredCount} <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Enrolled</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Prize Money at Stake</div>
              <div className="text-xl font-black text-amber-600">₹1,42,000+</div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Poster Publicity Carousel Section - Light Theme Container */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className={`p-8 md:p-12 bg-gradient-to-br ${currentPoster.bgGradient} transition-all duration-700 ease-in-out`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {currentPoster.badge}
              </div>

              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {currentPoster.title}
              </h2>

              <p className="text-base md:text-lg text-slate-100 font-normal leading-relaxed max-w-2xl">
                {currentPoster.subtitle}
              </p>

              {/* Highlights pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {currentPoster.highlights.map((h, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/25 border border-white/20 text-xs text-white font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> {h}
                  </span>
                ))}
              </div>

              <div className="pt-3 flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-3.5 rounded-xl bg-white text-blue-900 hover:bg-slate-100 font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  {currentPoster.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Poster Decorative Graphics */}
            <div className="lg:col-span-4 flex justify-center items-center">
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/10 border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-indigo-500/20 blur-xl animate-pulse" />
                {currentPoster.imageIcon === 'Trophy' && (
                  <Trophy className="w-24 h-24 text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)] transform group-hover:scale-110 transition-transform duration-300" />
                )}
                {currentPoster.imageIcon === 'Smartphone' && (
                  <Smartphone className="w-24 h-24 text-cyan-200 drop-shadow-[0_0_25px_rgba(103,232,249,0.5)] transform group-hover:scale-110 transition-transform duration-300" />
                )}
                {currentPoster.imageIcon === 'Zap' && (
                  <Zap className="w-24 h-24 text-orange-300 drop-shadow-[0_0_25px_rgba(251,146,60,0.5)] transform group-hover:scale-110 transition-transform duration-300" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Dots */}
        <div className="absolute bottom-4 left-8 flex items-center gap-2">
          {MOCK_POSTERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActivePosterIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activePosterIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Ongoing Offers & Promo Discounts - Light Theme */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Current Ongoing Offers & Coupons</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Use promo codes at registration checkout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onCopy={handleCopyCode} isCopied={copiedOfferId === offer.id} />
          ))}
        </div>
      </div>

      {/* Main Tab Navigation for Registered vs Explore */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-4 text-base font-bold transition-all relative cursor-pointer ${
            activeTab === 'explore'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Explore Upcoming Competitions
        </button>
        <button
          onClick={() => setActiveTab('registered')}
          className={`pb-4 text-base font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
            activeTab === 'registered'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Registered Competitions
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            {registeredCompetitions.length}
          </span>
        </button>
      </div>

      {/* 3. Section: Already Registered Competitions */}
      {activeTab === 'registered' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Registered Competitions ({registeredCompetitions.length})
            </h2>
            <div className="text-xs text-slate-500">
              You are ready for the live battles! Make sure to join 10 mins before start time.
            </div>
          </div>

          {registeredCompetitions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <Trophy className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-slate-700 font-semibold">You haven't registered for any competitions yet.</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
              >
                Browse & Register Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredCompetitions.map((comp) => (
                <RegisteredCompCard key={comp.id} comp={comp} onViewDetails={() => setSelectedModalComp(comp)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Section: Upcoming Competitions with Filters & Search */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Controls: Search & Category Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search competition by title, subject, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'mathematics', 'physics', 'chemistry', 'coding', 'science'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Fee Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
              <button
                onClick={() => setSelectedFee('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFee === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFee('free')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFee === 'free' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setSelectedFee('paid')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFee === 'paid' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Competitions Grid */}
          {filteredUpcoming.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <Search className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-700 font-semibold">No competitions found matching your search filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedFee('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUpcoming.map((comp) => (
                <UpcomingCompCard
                  key={comp.id}
                  comp={comp}
                  onRegister={() => handleRegister(comp)}
                  onViewDetails={() => setSelectedModalComp(comp)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Detail & Registration Modal */}
      {selectedModalComp && (
        <CompetitionDetailModal
          comp={selectedModalComp}
          onClose={() => setSelectedModalComp(null)}
          onRegister={() => handleRegister(selectedModalComp)}
        />
      )}
    </div>
  );
};

// Sub-Component: Offer Card - Light Theme
const OfferCard: React.FC<{ offer: OfferItem; onCopy: (id: string, code: string) => void; isCopied: boolean }> = ({
  offer,
  onCopy,
  isCopied
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(offer.expiryDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(offer.expiryDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [offer.expiryDate]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white bg-gradient-to-r ${offer.gradient}`}>
          {offer.badge}
        </span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">{offer.title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{offer.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="bg-slate-50 border border-dashed border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-blue-700 tracking-wider">
          {offer.code}
        </div>

        <button
          onClick={() => onCopy(offer.id, offer.code)}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
            </>
          ) : (
            'Copy Code'
          )}
        </button>
      </div>
    </div>
  );
};

// Sub-Component: Registered Competition Card with Admit Card & Launch Timer - Light Theme
const RegisteredCompCard: React.FC<{ comp: CompetitionItem; onViewDetails: () => void }> = ({ comp, onViewDetails }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(comp.registrationDeadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(comp.registrationDeadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [comp.registrationDeadline]);

  return (
    <div className="bg-white border border-emerald-300 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium capitalize">
              {comp.category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{comp.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Prize Pool</div>
          <div className="text-base font-extrabold text-amber-600">{comp.prizePool}</div>
        </div>
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{comp.description}</p>

      {/* Timer Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Timer className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Exam Begins In:</span>
        </div>
        <div className="font-mono text-sm font-black text-amber-600 tracking-wider">
          {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {comp.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {comp.registeredCount} Candidates
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
          >
            Rules & Syllabus
          </button>
          <button className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1">
            <Play className="w-3.5 h-3.5" /> Waiting Room
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-Component: Upcoming Competition Card with Live Countdown Timer - Light Theme
const UpcomingCompCard: React.FC<{
  comp: CompetitionItem;
  onRegister: () => void;
  onViewDetails: () => void;
}> = ({ comp, onRegister, onViewDetails }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(comp.registrationDeadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(comp.registrationDeadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [comp.registrationDeadline]);

  const slotsPercent = Math.round((comp.registeredCount / comp.maxCapacity) * 100);

  return (
    <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
              {comp.category}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                comp.difficulty === 'Beginner'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : comp.difficulty === 'Intermediate'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {comp.difficulty}
            </span>
          </div>

          <div className="text-right">
            {comp.entryFee === 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase">
                FREE ENTRY
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-600">Fee: ₹{comp.entryFee}</span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {comp.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{comp.description}</p>
        </div>

        {/* Prize Pool Display */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500 font-medium">Prize Pool</span>
          </div>
          <span className="text-sm font-extrabold text-amber-600">{comp.prizePool}</span>
        </div>

        {/* Live Countdown Timer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center justify-center gap-1">
            <Timer className="w-3 h-3 text-blue-600" /> Registration Closes In
          </div>
          <div className="grid grid-cols-4 gap-1 font-mono text-center">
            <div className="bg-white border border-slate-200 rounded p-1 shadow-sm">
              <div className="text-xs font-bold text-slate-900">{timeLeft.days}</div>
              <div className="text-[9px] text-slate-400">DAYS</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1 shadow-sm">
              <div className="text-xs font-bold text-slate-900">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[9px] text-slate-400">HRS</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1 shadow-sm">
              <div className="text-xs font-bold text-slate-900">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[9px] text-slate-400">MINS</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1 shadow-sm">
              <div className="text-xs font-bold text-amber-600">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[9px] text-slate-400">SECS</div>
            </div>
          </div>
        </div>

        {/* Registration Slots Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{comp.registeredCount} registered</span>
            <span>{slotsPercent}% Filled</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${slotsPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={onViewDetails}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex-1 border border-slate-200"
        >
          Details
        </button>

        {comp.isRegistered ? (
          <button
            disabled
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex-1 flex items-center justify-center gap-1 cursor-default"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered
          </button>
        ) : (
          <button
            onClick={onRegister}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all flex-1 flex items-center justify-center gap-1 cursor-pointer"
          >
            Register Now <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Sub-Component: Competition Detail Modal - Light Theme
const CompetitionDetailModal: React.FC<{
  comp: CompetitionItem;
  onClose: () => void;
  onRegister: () => void;
}> = ({ comp, onClose, onRegister }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase border border-blue-200">
                {comp.category}
              </span>
              <span className="text-xs text-slate-500">{comp.duration} exam</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{comp.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
            <p className="leading-relaxed text-slate-600">{comp.description}</p>
          </div>

          {/* Schedule info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-medium">Start Date & Time</div>
              <div className="text-sm font-bold text-slate-900">{comp.startDate}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Prize Pool</div>
              <div className="text-sm font-extrabold text-amber-600">{comp.prizePool}</div>
            </div>
          </div>

          {/* Prize breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prize Structure</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {comp.prizes.map((p, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-amber-700">{p.rank}</span>
                  <span className="text-xs text-slate-700 font-medium">{p.reward}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Topics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syllabus Covered</h4>
            <div className="flex flex-wrap gap-2">
              {comp.syllabus.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                  • {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Entry Fee</div>
            <div className="text-lg font-black text-slate-900">
              {comp.entryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${comp.entryFee}`}
            </div>
          </div>

          {comp.isRegistered ? (
            <button disabled className="px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold">
              Already Registered
            </button>
          ) : (
            <button
              onClick={onRegister}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              Confirm Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Competitions;
