import React, { useState, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import { CompetitionService } from '../../services/CompetitionService';
import Cookies from 'js-cookie';
import { getNetworkNow, useNetworkNow } from '../../utils/networkTime';
import { CompetitionWaitingRoom } from './CompetitionWaitingRoom';
import { CompetitionExamScreen } from './CompetitionExamScreen';
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
  Smartphone,
  Loader2,
  HelpCircle,
  FileText,
  Compass
} from 'lucide-react';

// Reverse display mapping helper for module_type
// Backend "VIVA" -> "Viva", "TAM" -> "Conceptual", "GK" -> "GK"
export const getModuleTypeLabel = (moduleType?: string): string => {
  if (!moduleType) return 'General';
  const upper = moduleType.toUpperCase();
  if (upper === 'VIVA') return 'Viva';
  if (upper === 'TAM') return 'Conceptual';
  if (upper === 'GK') return 'GK';
  return moduleType;
};

// Helper for extracting fee information from backend fields fee_type and fee_amount
export const getFeeInfo = (comp: CompetitionItem) => {
  const isFreeType = comp.fee_type?.toLowerCase() === 'free';
  const amount = comp.fee_amount ?? comp.fee ?? comp.entryFee ?? 0;
  const isFree = isFreeType || amount === 0;
  return { isFree, amount, feeType: comp.fee_type || (isFree ? 'Free' : 'Paid') };
};

// Helper for status badge styling (UNATTEMPTED = Red, IN_PROGRESS = Blue, COMPLETED = Green)
export const getStatusBadgeStyle = (status?: string): string => {
  if (!status) return 'bg-purple-100 text-purple-800 border-purple-300';
  const s = String(status).toUpperCase();
  if (s === 'UNATTEMPTED' || s.includes('UNATTEMPT')) {
    return 'bg-red-100 text-red-800 border-red-300';
  }
  if (s === 'IN_PROGRESS' || s === 'IN PROGRESS' || s.includes('PROGRESS')) {
    return 'bg-blue-100 text-blue-800 border-blue-300';
  }
  if (s === 'COMPLETED' || s.includes('COMPLET') || s.includes('ATTEMPT')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
  if (s.includes('PEND')) {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  return 'bg-purple-100 text-purple-800 border-purple-300';
};

// Date & Time formatting helpers
export const formatCompetitionDate = (dateStr?: string) => {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatCompetitionTime = (dateStr?: string) => {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
};

export const formatCompetitionDateTime = (dateStr?: string) => {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
};

// Types & Interface for Competition
export interface CompetitionItem {
  competition_id?: number | string;
  id?: string;
  title: string;
  module_type?: string; // "VIVA" | "TAM" | "GK"
  course_id?: number | null;
  subject_id?: number;
  subject_name?: string;
  subscription_id?: number | string;
  chapter_id?: string;
  topic_id?: string;
  category_id?: number | string | null;
  viva_type?: string | null;
  start_time?: string;
  end_time?: string;
  total_questions?: number;
  total_marks?: number;
  total_time?: number; // in seconds
  gk_assessment_type?: string | null;
  gk_creation_mode?: string | null;
  category_ids?: (number | string)[];
  created_by?: number;
  fee_type?: string | null;
  fee_amount?: number | null;
  entryFee?: number; // Preserved parameter for fee
  fee?: number;
  is_enrolled?: boolean;
  status?: 'upcoming' | 'live' | 'completed' | string;

  // Parameters NOT currently in backend response (Commented out):
  // category?: 'mathematics' | 'physics' | 'chemistry' | 'coding' | 'science';
  // description?: string;
  // prizePool?: string;
  // prizes?: { rank: string; reward: string }[];
  // registeredCount?: number;
  // maxCapacity?: number;
  // difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  // tags?: string[];
  // syllabus?: string[];

  // isRegistered?: boolean;
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

// const MOCK_REGISTERED: CompetitionItem[] = [
//   {
//     id: 'reg-1',
//     title: 'National Mathematics Speed Cup',
//     category: 'mathematics',
//     description: 'Fast-paced mental math, algebra, geometry & quantitative logic exam.',
//     startDate: 'Tomorrow, 10:00 AM',
//     registrationDeadline: '2026-08-07T10:00:00',
//     startTime: '2026-08-07T10:00:00',
//     duration: '45 mins',
//     entryFee: 0,
//     prizePool: '₹25,000',
//     registeredCount: 1420,
//     maxCapacity: 2000,
//     difficulty: 'Intermediate',
//     tags: ['Algebra', 'Geometry', 'Speed Math'],
//     isRegistered: true,
//     status: 'upcoming',
//     prizes: [
//       { rank: '1st Rank', reward: '₹10,000 + Gold Medal + Trophy' },
//       { rank: '2nd Rank', reward: '₹5,000 + Silver Medal' },
//       { rank: '3rd Rank', reward: '₹2,500 + Bronze Medal' },
//       { rank: 'Top 50', reward: 'Merit Certificate + 500 XP' }
//     ],
//     syllabus: ['Real Numbers', 'Polynomials', 'Coordinate Geometry', 'Triangles', 'Trigonometry']
//   },
//   {
//     id: 'reg-2',
//     title: 'Physics Mechanics & Optics Championship',
//     category: 'physics',
//     description: 'Conceptual and numerical physics battle for High School students.',
//     startDate: '10 Aug 2026, 4:00 PM',
//     registrationDeadline: '2026-08-10T16:00:00',
//     startTime: '2026-08-10T16:00:00',
//     duration: '60 mins',
//     entryFee: 99,
//     prizePool: '₹15,000',
//     registeredCount: 890,
//     maxCapacity: 1000,
//     difficulty: 'Advanced',
//     tags: ['Kinematics', 'Newton Laws', 'Optics'],
//     isRegistered: true,
//     status: 'upcoming',
//     prizes: [
//       { rank: '1st Rank', reward: '₹7,000 + Physics Kit' },
//       { rank: '2nd Rank', reward: '₹4,000' },
//       { rank: 'Top 10%', reward: 'Certificate of Distinction' }
//     ],
//     syllabus: ['Laws of Motion', 'Work Power Energy', 'Ray Optics', 'Gravitation']
//   }
// ];

// const MOCK_UPCOMING: CompetitionItem[] = [
//   {
//     id: 'comp-101',
//     title: 'All India Coding & Logic League 2026',
//     category: 'coding',
//     description: 'Algorithmic problem solving, Python/JS logic puzzles, and block coding challenge.',
//     startDate: '12 Aug 2026, 6:00 PM',
//     registrationDeadline: '2026-08-12T18:00:00',
//     startTime: '2026-08-12T18:00:00',
//     duration: '60 mins',
//     entryFee: 0,
//     prizePool: '₹50,000',
//     registeredCount: 2340,
//     maxCapacity: 3000,
//     difficulty: 'Intermediate',
//     tags: ['Python', 'Logic', 'Algorithms'],
//     isRegistered: false,
//     status: 'upcoming',
//     prizes: [
//       { rank: '1st Rank', reward: 'Smart Tablet + ₹15,000' },
//       { rank: '2nd Rank', reward: 'Smart Watch + ₹8,000' },
//       { rank: '3rd Rank', reward: '₹4,000 + Swag Box' },
//       { rank: 'Top 100', reward: 'Coder Certificate' }
//     ],
//     syllabus: ['Data Structures', 'Loops & Conditionals', 'Pattern Building', 'Logic Puzzles']
//   },
//   {
//     id: 'comp-102',
//     title: 'Organic Chemistry Reactions Sprint',
//     category: 'chemistry',
//     description: 'Identify mechanisms, reagents, and organic conversions under tight time pressure.',
//     startDate: '14 Aug 2026, 5:00 PM',
//     registrationDeadline: '2026-08-14T17:00:00',
//     startTime: '2026-08-14T17:00:00',
//     duration: '40 mins',
//     entryFee: 49,
//     prizePool: '₹10,000',
//     registeredCount: 610,
//     maxCapacity: 1000,
//     difficulty: 'Advanced',
//     tags: ['Hydrocarbons', 'Functional Groups', 'Reactions'],
//     isRegistered: false,
//     status: 'upcoming',
//     prizes: [
//       { rank: '1st Rank', reward: '₹5,000 + Chemistry Lab Kit' },
//       { rank: '2nd Rank', reward: '₹2,500' },
//       { rank: '3rd Rank', reward: '₹1,000' }
//     ],
//     syllabus: ['Alkanes & Alkenes', 'Aldehydes & Ketones', 'Isomerism', 'Named Reactions']
//   },
//   {
//     id: 'comp-103',
//     title: 'Junior Science & Environment Quest',
//     category: 'science',
//     description: 'Fun interactive quiz on General Science, Earth, Solar System, and Biology fundamentals.',
//     startDate: '16 Aug 2026, 11:00 AM',
//     registrationDeadline: '2026-08-16T11:00:00',
//     startTime: '2026-08-16T11:00:00',
//     duration: '30 mins',
//     entryFee: 0,
//     prizePool: '₹12,000',
//     registeredCount: 450,
//     maxCapacity: 800,
//     difficulty: 'Beginner',
//     tags: ['General Science', 'Biology', 'Space'],
//     isRegistered: false,
//     status: 'upcoming',
//     prizes: [
//       { rank: '1st Rank', reward: 'Telescope + ₹4,000' },
//       { rank: '2nd Rank', reward: 'Microscope Kit' },
//       { rank: '3rd Rank', reward: '₹1,500' }
//     ],
//     syllabus: ['Solar System', 'Plant Life', 'Human Body Systems', 'Ecology & Environment']
//   },
//   {
//     id: 'comp-104',
//     title: 'Advanced Calculus & Analytical Geometry',
//     category: 'mathematics',
//     description: 'Challenging calculus problems designed to test deep problem solving skills.',
//     startDate: '18 Aug 2026, 3:00 PM',
//     registrationDeadline: '2026-08-18T15:00:00',
//     startTime: '2026-08-18T15:00:00',
//     duration: '75 mins',
//     entryFee: 149,
//     prizePool: '₹30,000',
//     registeredCount: 320,
//     maxCapacity: 500,
//     difficulty: 'Advanced',
//     tags: ['Limits', 'Derivatives', 'Integration'],
//     isRegistered: false,
//     status: 'upcoming',
//     prizes: [
//       { rank: '1st Rank', reward: '₹12,000 + Trophy' },
//       { rank: '2nd Rank', reward: '₹7,000' },
//       { rank: '3rd Rank', reward: '₹4,000' }
//     ],
//     syllabus: ['Limits & Continuity', 'Differential Calculus', 'Definite Integrals', 'Vectors']
//   }
// ];

// Helper for live countdown calculation using internet network timestamp
function calculateTimeLeft(targetDateStr: string, currentNowMs?: number) {
  if (!targetDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0 };
  }
  const nowMs = currentNowMs ?? getNetworkNow();
  const targetTimeMs = new Date(targetDateStr).getTime();
  const difference = targetTimeMs - nowMs;

  if (isNaN(targetTimeMs) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: difference };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
    totalMs: difference
  };
}

export const Competitions: React.FC = () => {
  const { subscriptionId } = useCourse();
  const activeSubscriptionId = subscriptionId || localStorage.getItem('subscription_id') || localStorage.getItem('subscriptionId');

  // Retrieve user_id from LocalStorage or Cookies
  const getActiveUserId = (): string | number | undefined => {
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
          // ignore json parse failure
        }
      }
    }

    return undefined;
  };

  const activeUserId = getActiveUserId();

  const [activePosterIndex, setActivePosterIndex] = useState(0);
  const [selectedModuleType, setSelectedModuleType] = useState<'VIVA' | 'TAM' | 'GK' | 'SUBSCRIPTION'>('SUBSCRIPTION');
  const [selectedFee, setSelectedFee] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredCompetitions, setRegisteredCompetitions] = useState<CompetitionItem[]>([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<CompetitionItem[]>([]);
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState<boolean>(false);
  const [apiBackendMessage, setApiBackendMessage] = useState<string | null>(null);
  const [selectedModalComp, setSelectedModalComp] = useState<CompetitionItem | null>(null);
  const [confirmModalComp, setConfirmModalComp] = useState<CompetitionItem | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'registered'>('explore');
  const [waitingRoomComp, setWaitingRoomComp] = useState<CompetitionItem | null>(null);
  const [activeExamComp, setActiveExamComp] = useState<CompetitionItem | null>(null);

  // Auto slide poster banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePosterIndex((prev) => (prev + 1) % MOCK_POSTERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch registered competitions for user
  const fetchRegisteredCompetitions = async (uid: string | number | undefined) => {
    if (!uid) return;
    try {
      const response = await CompetitionService.GetAllRegisteredCompetitions(uid);
      let dataList: CompetitionItem[] = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        dataList = response.data;
      }
      const markedList = dataList.map((item: CompetitionItem) => ({ ...item, is_enrolled: true }));
      setRegisteredCompetitions(markedList);
    } catch (err) {
      console.error("Error fetching registered competitions:", err);
    }
  };

  useEffect(() => {
    if (activeUserId) {
      fetchRegisteredCompetitions(activeUserId);
    }
  }, [activeUserId]);

  // Fetch upcoming competitions from backend based on subscriptionId and module filter
  const fetchCompetitions = async (moduleType: string, subId: string | number, uid?: string | number) => {
    setIsLoadingCompetitions(true);
    setApiBackendMessage(null);
    try {
      let response: any;
      const rawUserId = uid || activeUserId || getActiveUserId() || '';
      if (moduleType === 'SUBSCRIPTION') {
        // "My Course" filter: send user_id & subscription_id (no module_type)
        response = await CompetitionService.GetAllUpcomingCompetitions(rawUserId, subId);
      } else if (moduleType === 'GK') {
        // "GK" filter: send user_id & module_type ONLY (no subscription_id)
        response = await CompetitionService.GetUpcomingCompetitionsFiltered(rawUserId, undefined, 'GK');
      } else {
        // "Viva" (VIVA) & "Conceptual" (TAM) filters: send user_id, subscription_id & module_type
        response = await CompetitionService.GetUpcomingCompetitionsFiltered(rawUserId, subId, moduleType);
      }

      let dataList: CompetitionItem[] = [];
      let backendMsg: string | null = null;

      if (Array.isArray(response)) {
        dataList = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          dataList = response.data;
        }
        if (response.detail) {
          backendMsg = response.detail;
        } else if (response.message) {
          backendMsg = response.message;
        }
      }

      setUpcomingCompetitions(dataList);
      setApiBackendMessage(backendMsg || (dataList.length === 0 ? "No upcoming competitions" : null));
    } catch (err: any) {
      console.error("Error fetching competitions:", err);
      setUpcomingCompetitions([]);
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err?.response?.data : null) ||
        err?.message ||
        "No upcoming competitions";
      setApiBackendMessage(errMsg);
    } finally {
      setIsLoadingCompetitions(false);
    }
  };

  // Re-fetch whenever selected subscription context, module type, or user ID changes
  useEffect(() => {
    if (activeSubscriptionId) {
      fetchCompetitions(selectedModuleType, activeSubscriptionId, activeUserId);
    }
  }, [activeSubscriptionId, selectedModuleType, activeUserId]);

  // Callback when any upcoming competition timer expires to refresh API data
  const handleUpcomingTimerEnded = () => {
    if (activeSubscriptionId) {
      console.log("Timer ended for an upcoming competition. Fetching updated competition list from API...");
      fetchCompetitions(selectedModuleType, activeSubscriptionId, activeUserId);
    }
  };

  // Sync isRegistered flag on upcoming competitions when registeredCompetitions updates
  useEffect(() => {
    if (registeredCompetitions.length > 0) {
      const registeredIds = new Set(
        registeredCompetitions.map((rc) => String(rc.competition_id || rc.id))
      );
      setUpcomingCompetitions((prev) =>
        prev.map((c) => {
          const cId = String(c.competition_id || c.id);
          if (registeredIds.has(cId)) {
            return { ...c, is_enrolled: true };
          }
          return c;
        })
      );
    }
  }, [registeredCompetitions]);

  // Auto hide toast after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [toastMessage]);

  // Trigger confirmation box when clicking Register
  const handleRegisterClick = (comp: CompetitionItem) => {
    if (comp.is_enrolled) return;
    setConfirmModalComp(comp);
  };

  // Perform API call when user clicks YES in confirmation box
  const handleConfirmRegistration = async () => {
    if (!confirmModalComp) return;

    setIsRegistering(true);
    try {
      const rawUserId = activeUserId || getActiveUserId();
      const compIdStr = confirmModalComp.competition_id || confirmModalComp.id;

      const payload = {
        user_id: rawUserId,
        competition_id: compIdStr,
        module_type: confirmModalComp.module_type
      };

      console.log("Submitting competition registration payload:", payload);
      const response = await CompetitionService.RegisterForCompetitions(payload);

      const updatedComp = { ...confirmModalComp, is_enrolled: true };

      setUpcomingCompetitions((prev) =>
        prev.map((c) => ((c.competition_id || c.id) === compIdStr ? updatedComp : c))
      );

      setRegisteredCompetitions((prev) => {
        const exists = prev.some((c) => (c.competition_id || c.id) === compIdStr);
        return exists ? prev : [updatedComp, ...prev];
      });

      if ((selectedModalComp?.competition_id || selectedModalComp?.id) === compIdStr) {
        setSelectedModalComp(updatedComp);
      }

      setConfirmModalComp(null);
      setToastMessage({
        type: 'success',
        text: response?.message || `Successfully registered for "${confirmModalComp.title}"!`
      });
    } catch (error: any) {
      console.error("Failed to register for competition:", error);
      setToastMessage({
        type: 'error',
        text: error?.response?.data?.message || error?.message || 'Failed to register for competition. Please try again.'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedOfferId(id);
    setTimeout(() => setCopiedOfferId(null), 2500);
  };

  // Search & Fee Filter logic over backend response list
  const filteredUpcoming = upcomingCompetitions.filter((comp) => {
    const { isFree, amount } = getFeeInfo(comp);
    const matchesFee =
      selectedFee === 'all' ||
      (selectedFee === 'free' && isFree) ||
      (selectedFee === 'paid' && (!isFree || amount > 0));

    const query = searchQuery.trim().toLowerCase();
    const moduleLabel = getModuleTypeLabel(comp.module_type).toLowerCase();
    const matchesSearch =
      !query ||
      comp.title?.toLowerCase().includes(query) ||
      comp.subject_name?.toLowerCase().includes(query) ||
      moduleLabel.includes(query);

    return matchesFee && matchesSearch;
  });

  const totalRegisteredCount = registeredCompetitions.length;
  const currentPoster = MOCK_POSTERS[activePosterIndex];

  // Render Full Screen Waiting Room if Active
  if (waitingRoomComp) {
    return (
      <CompetitionWaitingRoom
        comp={waitingRoomComp}
        onStartExam={() => {
          setActiveExamComp(waitingRoomComp);
          setWaitingRoomComp(null);
        }}
        onExit={() => setWaitingRoomComp(null)}
      />
    );
  }

  // Render Full Screen Competition Exam Screen if Active
  if (activeExamComp) {
    return (
      <CompetitionExamScreen
        comp={activeExamComp}
        userId={activeUserId}
        onExit={() => {
          setActiveExamComp(null);
          if (activeUserId) {
            fetchRegisteredCompetitions(activeUserId);
          }
          if (activeSubscriptionId) {
            fetchCompetitions(selectedModuleType, activeSubscriptionId, activeUserId);
          }
        }}
        onComplete={(result) => {
          setActiveExamComp(null);
          setToastMessage({
            type: 'success',
            text: 'Competition submitted successfully!'
          });
          if (activeUserId) {
            fetchRegisteredCompetitions(activeUserId);
          }
          if (activeSubscriptionId) {
            fetchCompetitions(selectedModuleType, activeSubscriptionId, activeUserId);
          }
        }}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 md:space-y-8 font-sans">
      {/* Top Header & Registration Counter Bar - Light Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-blue-600" /> MindShaala Competition Hub
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
            Compete, Excel & Win Rewards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Test your knowledge in real-time speed challenges, Olympiads, and STEM leagues. Earn medals, cash prizes, and national glory.
          </p>
        </div>

        {/* Live Registered Counter Badge & Stats */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-3 flex-1 min-w-[240px]">
            <div className="p-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">My Active Registrations</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                {totalRegisteredCount} <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Enrolled</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 flex-1 min-w-[240px]">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Prize Money at Stake</div>
              <div className="text-lg sm:text-xl font-black text-amber-600">₹1,42,000+</div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Poster Publicity Carousel Section - Light Theme Container */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className={`p-5 sm:p-8 md:p-12 bg-gradient-to-br ${currentPoster.bgGradient} transition-all duration-700 ease-in-out`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {currentPoster.badge}
              </div>

              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight break-words">
                {currentPoster.title}
              </h2>

              <p className="text-xs sm:text-base md:text-lg text-slate-100 font-normal leading-relaxed max-w-2xl">
                {currentPoster.subtitle}
              </p>

              {/* Highlights pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                {currentPoster.highlights.map((h, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-black/25 border border-white/20 text-[11px] sm:text-xs text-white font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> {h}
                  </span>
                ))}
              </div>

              <div className="pt-2 sm:pt-3 flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white text-blue-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  {currentPoster.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Poster Decorative Graphics */}
            <div className="lg:col-span-4 flex justify-center items-center py-2 lg:py-0">
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full bg-white/10 border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-indigo-500/20 blur-xl animate-pulse" />
                {currentPoster.imageIcon === 'Trophy' && (
                  <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)] transform group-hover:scale-110 transition-transform duration-300" />
                )}
                {currentPoster.imageIcon === 'Smartphone' && (
                  <Smartphone className="w-16 h-16 sm:w-24 sm:h-24 text-cyan-200 drop-shadow-[0_0_25px_rgba(103,232,249,0.5)] transform group-hover:scale-110 transition-transform duration-300" />
                )}
                {currentPoster.imageIcon === 'Zap' && (
                  <Zap className="w-16 h-16 sm:w-24 sm:h-24 text-orange-300 drop-shadow-[0_0_25px_rgba(251,146,60,0.5)] transform group-hover:scale-110 transition-transform duration-300" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-8 flex items-center gap-2">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Current Ongoing Offers & Coupons</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Use promo codes at registration checkout</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onCopy={handleCopyCode} isCopied={copiedOfferId === offer.id} />
          ))}
        </div>
      </div>

      {/* Main Tab Navigation for Registered vs Explore */}
      <div className="bg-slate-100/90 p-1.5 sm:p-2 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-3xl">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 leading-tight ${
            activeTab === 'explore'
              ? 'bg-white text-blue-600 shadow-md shadow-slate-200/80 border border-slate-200/80 ring-1 ring-black/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Compass className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">Explore Upcoming Competitions</span>
          <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-black shrink-0 transition-colors ${
            activeTab === 'explore'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-slate-200 text-slate-600 border border-slate-300/60'
          }`}>
            {upcomingCompetitions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('registered')}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 leading-tight ${
            activeTab === 'registered'
              ? 'bg-white text-blue-600 shadow-md shadow-slate-200/80 border border-slate-200/80 ring-1 ring-black/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">My Registered Competitions</span>
          <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-black shrink-0 transition-colors ${
            activeTab === 'registered'
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-slate-200 text-slate-600 border border-slate-300/60'
          }`}>
            {registeredCompetitions.length}
          </span>
        </button>
      </div>

      {/* 3. Section: Already Registered Competitions */}
      {activeTab === 'registered' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              Registered Competitions ({registeredCompetitions.length})
            </h2>
            <div className="text-xs text-slate-500">
              You are ready for the live battles! Make sure to join 10 mins before start time.
            </div>
          </div>

          {registeredCompetitions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto" />
              <p className="text-slate-700 text-sm sm:text-base font-semibold">You haven't registered for any competitions yet.</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Browse & Register Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {registeredCompetitions.map((comp) => (
                <RegisteredCompCard
                  key={comp.competition_id || comp.id}
                  comp={comp}
                  onViewDetails={() => setSelectedModalComp(comp)}
                  onStart={() => setActiveExamComp(comp)}
                  onEnterWaitingRoom={() => setWaitingRoomComp(comp)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Section: Upcoming Competitions with Filters & Search */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Controls: Search & Category Filters */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search competition by title, subject, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filter Tabs (Viva, Conceptual, GK) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[
                { label: 'My Course', key: 'SUBSCRIPTION' },
                { label: 'Viva', key: 'VIVA' },
                { label: 'Conceptual', key: 'TAM' },
                { label: 'GK', key: 'GK' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedModuleType(tab.key as any)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    selectedModuleType === tab.key
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Fee Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-start lg:self-auto justify-center">
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

          {/* Note for Subscription Based filter */}
          {selectedModuleType === 'SUBSCRIPTION' && (
            <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-xs font-medium shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Note:</strong> When you are in the <strong>My Course</strong> filter, GK competitions will not be visible.
              </span>
            </div>
          )}

          {/* Competitions Grid & Loading / Empty State */}
          {isLoadingCompetitions ? (
            <div className="p-12 sm:p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium text-xs sm:text-sm">Loading competitions...</p>
            </div>
          ) : filteredUpcoming.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  {apiBackendMessage || "No upcoming competitions"}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                  There are currently no upcoming competitions available.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredUpcoming.map((comp, idx) => (
                <UpcomingCompCard
                  key={comp.competition_id || comp.id || idx}
                  comp={comp}
                  onRegister={() => handleRegisterClick(comp)}
                  onViewDetails={() => setSelectedModalComp(comp)}
                  onTimerEnded={handleUpcomingTimerEnded}
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
          onRegister={() => handleRegisterClick(selectedModalComp)}
        />
      )}

      {/* 6. Registration Confirmation Modal Box */}
      {confirmModalComp && (
        <RegistrationConfirmationModal
          comp={confirmModalComp}
          isLoading={isRegistering}
          onClose={() => setConfirmModalComp(null)}
          onConfirm={handleConfirmRegistration}
        />
      )}

      {/* 7. Toast Feedback Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold transition-all animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
              : 'bg-red-600 text-white border-red-500 shadow-red-600/20'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
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
  const nowMs = useNetworkNow(1000);
  const timeLeft = calculateTimeLeft(offer.expiryDate, nowMs);

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
const RegisteredCompCard: React.FC<{
  comp: CompetitionItem;
  onViewDetails: () => void;
  onStart?: () => void;
  onEnterWaitingRoom?: () => void;
}> = ({ comp, onViewDetails, onStart, onEnterWaitingRoom }) => {
  const nowMs = useNetworkNow(1000);

  const startTimeMs = comp.start_time ? new Date(comp.start_time).getTime() : 0;
  const totalDurationMs = comp.total_time ? comp.total_time * 1000 : 3600000;
  const endTimeMs = comp.end_time
    ? new Date(comp.end_time).getTime()
    : (startTimeMs > 0 ? startTimeMs + totalDurationMs : 0);

  const isBeforeStart = startTimeMs > 0 && nowMs < startTimeMs;
  const isLive = startTimeMs > 0 && nowMs >= startTimeMs && (endTimeMs === 0 || nowMs <= endTimeMs);
  const isEnded = endTimeMs > 0 && nowMs > endTimeMs;

  const statusUpper = comp.status ? String(comp.status).toUpperCase().trim() : '';
  const isCompleted = statusUpper === 'COMPLETE' || statusUpper === 'COMPLETED' || (statusUpper.includes('COMPLET') && !statusUpper.includes('UNCOMPLET'));

  const diffToStart = startTimeMs > 0 ? startTimeMs - nowMs : 0;
  const isWaitingRoomActive = isBeforeStart && diffToStart <= 10 * 60 * 1000; // <= 10 minutes

  const targetDateStr = comp.start_time || comp.end_time || '';
  const timeLeft = calculateTimeLeft(targetDateStr, nowMs);

  const moduleLabel = getModuleTypeLabel(comp.module_type);
  const durationMins = comp.total_time ? Math.floor(comp.total_time / 60) : null;
  const compFee = comp.fee ?? comp.entryFee ?? 0;

  return (
    <div className="bg-white border border-emerald-300 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      {/* Card Header: Top Badge Line & Title / Fee */}
      <div className="space-y-2">
        {/* Top Line: Module Type / Badges on Left & Status Badge on Right (Above Entry Fee) */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered
            </span> */}
            {comp.subject_name && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                {comp.subject_name}
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
              {moduleLabel}
            </span>
            {comp.viva_type && (
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-medium">
                {comp.viva_type}
              </span>
            )}
          </div>

          {/* Status Badge positioned above Entry Fee, in line with module type badges */}
          {comp.status && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-sm shrink-0 ${getStatusBadgeStyle(comp.status)}`}>
              <Tag className="w-3 h-3" /> {comp.status}
            </span>
          )}
        </div>

        {/* Title & Entry Fee Row */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <h3 className="text-lg font-bold text-slate-900 leading-snug flex-1">{comp.title}</h3>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Entry Fee</div>
            <div className="text-base font-extrabold text-amber-600">
              {compFee === 0 ? 'FREE' : `₹${compFee}`}
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Date & Start Time Highlight Box (Clear on Front) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Assessment Date</div>
            <div className="font-bold text-slate-800">
              {formatCompetitionDate(comp.start_time || comp.end_time)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Start Time</div>
            <div className="font-bold text-slate-800">
              {formatCompetitionTime(comp.start_time)}
              {comp.end_time && ` - ${formatCompetitionTime(comp.end_time)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Live Timer Banner / Status Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
        {isCompleted ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Assessment Completed</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase">
              Completed
            </div>
          </>
        ) : isBeforeStart ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Timer className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Exam Begins In:</span>
            </div>
            <div className="font-mono text-sm font-black text-amber-600 tracking-wider">
              {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </div>
          </>
        ) : isLive ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span className="font-bold">Competition is NOW LIVE!</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase animate-pulse">
              Live Now
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Exam Status:</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold uppercase">
              Competition Ended
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0" /> {durationMins ? `${durationMins} mins` : 'Timed Exam'}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 shrink-0" /> {comp.total_questions ?? '--'} Questions
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Details button is always rendered */}
          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200 cursor-pointer flex-1 sm:flex-none text-center"
          >
            Details
          </button>

          {/* Condition 1: Timer running -> Show Waiting Room button (active only when <= 10 mins before start) */}
          {isBeforeStart && !isCompleted && (
            <button
              onClick={isWaitingRoomActive ? (onEnterWaitingRoom || onViewDetails) : undefined}
              disabled={!isWaitingRoomActive}
              title={!isWaitingRoomActive ? "Waiting room opens 10 minutes before start time" : "Enter Waiting Room"}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 flex-1 sm:flex-none ${
                isWaitingRoomActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer shadow-emerald-600/20'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
              }`}
            >
              <Play className="w-3.5 h-3.5 shrink-0" /> Waiting Room
              {!isWaitingRoomActive && (
                <span className="text-[9px] bg-slate-300/80 text-slate-600 px-1.5 py-0.5 rounded ml-0.5 font-semibold">
                  (&lt;10m)
                </span>
              )}
            </button>
          )}

          {/* Condition 2: Timer is 0 / Exam Live -> Show Start button until endtime (only if not completed) */}
          {isLive && !isCompleted && (
            <button
              onClick={onStart || onViewDetails}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1 cursor-pointer animate-pulse flex-1 sm:flex-none"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" /> Start
            </button>
          )}
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
  onTimerEnded?: () => void;
}> = ({ comp, onRegister, onViewDetails, onTimerEnded }) => {
  const { isFree, amount } = getFeeInfo(comp);
  const moduleLabel = getModuleTypeLabel(comp.module_type);

  const nowMs = useNetworkNow(1000);
  const targetDateStr = comp.start_time || comp.end_time || '';
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDateStr, nowMs));
  const [hasFiredExpiry, setHasFiredExpiry] = useState(false);

  useEffect(() => {
    if (targetDateStr) {
      const calculated = calculateTimeLeft(targetDateStr, nowMs);
      setTimeLeft(calculated);
      if (calculated.expired && !hasFiredExpiry) {
        setHasFiredExpiry(true);
        if (onTimerEnded) {
          onTimerEnded();
        }
      }
    }
  }, [targetDateStr, nowMs, hasFiredExpiry, onTimerEnded]);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  const durationMins = comp.total_time ? Math.floor(comp.total_time / 60) : null;

  return (
    <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Subject Name */}
            {comp.subject_name && (
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                {comp.subject_name}
              </span>
            )}
            
            {/* Module Type (Viva / Conceptual / GK) */}
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
              {moduleLabel}
            </span>

            {/* Viva Type if present */}
            {comp.viva_type && (
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                {comp.viva_type}
              </span>
            )}

            {/* Status if present */}
            {comp.status && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(comp.status)}`}>
                {comp.status}
              </span>
            )}

            {/* Commented out unsupported parameter: Category */}
            {/* {comp.category && <span className="...">...</span>} */}
            
            {/* Commented out unsupported parameter: Difficulty */}
            {/* {comp.difficulty && <span className="...">...</span>} */}
          </div>

          {/* Fee Display */}
          <div className="text-right">
            {isFree ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase">
                FREE ENTRY
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-600">Fee: ₹{amount}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {comp.title}
          </h3>
          
          {/* Commented out unsupported parameter: Description */}
          {/* {comp.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{comp.description}</p>} */}
        </div>

        {/* Competition Metrics (Questions, Marks, Time) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Questions</div>
            <div className="text-xs font-bold text-slate-800">{comp.total_questions ?? '--'}</div>
          </div>
          <div className="border-x border-slate-200 px-1">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Marks</div>
            <div className="text-xs font-bold text-slate-800">{comp.total_marks ?? '--'}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Duration</div>
            <div className="text-xs font-bold text-slate-800">{durationMins ? `${durationMins} mins` : '--'}</div>
          </div>
        </div>

        {/* Commented out unsupported parameter: Prize Pool */}
        {/*
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Prize Pool</span>
          <span className="text-sm font-extrabold text-amber-600">{comp.prizePool}</span>
        </div>
        */}

        {/* Live Countdown Timer based on start_time / end_time */}
        {targetDateStr && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center justify-center gap-1">
              <Timer className="w-3 h-3 text-blue-600" /> Start: {formatDateTime(comp.start_time || comp.end_time)}
            </div>
            {timeLeft && !timeLeft.expired && (
              <div className="grid grid-cols-4 gap-1 font-mono text-center pt-1">
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
            )}
          </div>
        )}

        {/* Commented out unsupported parameter: Registered Slots & Capacity Progress */}
        {/*
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{comp.registeredCount} registered</span>
            <span>{slotsPercent}% Filled</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${slotsPercent}%` }} />
          </div>
        </div>
        */}

        {/* Commented out unsupported parameter: Tags */}
        {/* {comp.tags && <div className="...">...</div>} */}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={onViewDetails}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex-1 border border-slate-200"
        >
          Details
        </button>

        {comp.is_enrolled ? (
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
  const { isFree, amount } = getFeeInfo(comp);
  const moduleLabel = getModuleTypeLabel(comp.module_type);
  const durationMins = comp.total_time ? Math.floor(comp.total_time / 60) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between relative gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {comp.subject_name && (
                <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase border border-blue-200">
                  {comp.subject_name}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-bold uppercase border border-indigo-200">
                {moduleLabel}
              </span>
              {comp.status && (
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getStatusBadgeStyle(comp.status)}`}>
                  {comp.status}
                </span>
              )}
              {durationMins && <span className="text-xs text-slate-500">{durationMins} mins exam</span>}
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 break-words">{comp.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-sm text-slate-700">
          {/* Key Overview Cards: Start Time, End Time, Questions, Marks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 text-center">
            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Start
              </div>
              <div className="text-xs font-bold text-slate-900">{formatCompetitionDateTime(comp.start_time)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> End
              </div>
              <div className="text-xs font-bold text-slate-900">{formatCompetitionDateTime(comp.end_time)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Questions
              </div>
              <div className="text-xs font-bold text-slate-900">{comp.total_questions ?? '--'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Marks
              </div>
              <div className="text-xs font-bold text-amber-600">{comp.total_marks ?? '--'}</div>
            </div>
          </div>

          {/* Full Competition Parameters Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Competition Parameters & Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Current Status</div>
                {comp.status ? (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${getStatusBadgeStyle(comp.status)}`}>
                    <Tag className="w-3 h-3" /> {comp.status}
                  </span>
                ) : (
                  <div className="text-xs font-bold text-slate-700">N/A</div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Exam Duration</div>
                <div className="text-xs font-bold text-slate-800">
                  {durationMins ? `${durationMins} minutes` : comp.total_time ? `${comp.total_time} seconds` : 'Timed Exam'}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Entry Fee & Type</div>
                <div className="text-xs font-bold text-slate-800">
                  {isFree ? <span className="text-emerald-600">FREE</span> : `₹${amount}`}
                  {comp.fee_type && <span className="text-slate-400 font-normal ml-1">({comp.fee_type})</span>}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Subject Name</div>
                <div className="text-xs font-bold text-slate-800">{comp.subject_name || 'N/A'}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Module Type</div>
                <div className="text-xs font-bold text-slate-800">{moduleLabel} ({comp.module_type || 'General'})</div>
              </div>

              {comp.viva_type && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Viva Type</div>
                  <div className="text-xs font-bold text-slate-800">{comp.viva_type}</div>
                </div>
              )}

              {comp.gk_assessment_type && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">GK Assessment Type</div>
                  <div className="text-xs font-bold text-slate-800">{comp.gk_assessment_type}</div>
                </div>
              )}

              {comp.gk_creation_mode && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Creation Mode</div>
                  <div className="text-xs font-bold text-slate-800">{comp.gk_creation_mode}</div>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Enrollment Status</div>
                <div className="text-xs font-bold text-slate-800">
                  {comp.is_enrolled ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                    </span>
                  ) : (
                    <span className="text-slate-500">Not Registered</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Entry Fee</div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              {isFree ? <span className="text-emerald-600">FREE</span> : `₹${amount}`}
            </div>
          </div>

          {comp.is_enrolled ? (
            <button disabled className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold">
              Already Registered
            </button>
          ) : (
            <button
              onClick={onRegister}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              Confirm Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-Component: Registration Confirmation Modal Box - Light & Modern Theme
const RegistrationConfirmationModal: React.FC<{
  comp: CompetitionItem;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ comp, isLoading, onClose, onConfirm }) => {
  const { isFree, amount } = getFeeInfo(comp);
  const moduleLabel = getModuleTypeLabel(comp.module_type);
  const durationMins = comp.total_time ? Math.floor(comp.total_time / 60) : null;

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 sm:space-y-5 my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-start justify-between relative gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-blue-100">
              <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" /> Confirm Registration
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Register for Competition</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Competition Details */}
        <div className="px-4 sm:px-6 space-y-4 text-slate-700">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {comp.subject_name && (
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                  {comp.subject_name}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold uppercase">
                {moduleLabel}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug break-words">{comp.title}</h3>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Start Time</span>
                <span className="font-semibold text-slate-800">{formatDateTime(comp.start_time || comp.end_time)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Entry Fee</span>
                <span className="font-extrabold text-amber-600">{isFree ? 'FREE' : `₹${amount}`}</span>
              </div>
              {comp.total_questions != null && (
                <div>
                  <span className="text-slate-400 block font-medium">Questions</span>
                  <span className="font-semibold text-slate-800">{comp.total_questions}</span>
                </div>
              )}
              {durationMins != null && (
                <div>
                  <span className="text-slate-400 block font-medium">Duration</span>
                  <span className="font-semibold text-slate-800">{durationMins} mins</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-700 text-center leading-relaxed">
            Are you sure you want to register for <strong className="text-blue-600">{comp.title}</strong>?
          </p>
        </div>

        {/* Modal Footer Action Buttons */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 sm:gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Yes, Register
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Competitions;
