import { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Home,
  TrendingUp,
  BookMarked,
  BookOpen,
  Library,
  MapPin,
  ClipboardCheck,
  Bell,
  Settings,
  LogOut,
  Monitor,
  Code,
  Globe,
  Shield,
  Binary,
  Sparkles,
  Keyboard,
  Cpu,
  Activity,
  Beaker,
  ChevronRight,
  ChevronDown,
  CreditCard,
  FolderKanban,
  Brain,
  HelpCircle,
  Flame,
  Rocket,
  Mic,
  Volume2,
  MessageCircle,
  Eye,
  FileText,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  Menu,
  X,
  Download,
  Medal,
  Trophy,
  Award,
  Zap,
  Dna,
  Wrench,
  Calculator
} from 'lucide-react';
import mindshaalLogo from '../assets/Mindshaala.png';
import Cookies from 'js-cookie';
import { getInitials } from '../utils/userUtils';

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  isOnboardingComplete?: boolean;
  currentStep?: string;
}

export function Sidebar({ activePage, onNavigate, onLogout, isOnboardingComplete = true, currentStep }: SidebarProps) {
  /* Course Context Integration */
  const { courses, selectedCourse, selectCourse, fetchCourses } = useCourse();
  const username = localStorage.getItem('username') || Cookies.get('username');

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id'); 
      if (userId) {
          fetchCourses(userId);
      }
  }, []);

  // Safety check: ensure activePage is always a string
  const currentPage = activePage || currentStep || 'dashboard';

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'innovative-features', label: 'Topper Features', icon: Sparkles, badge: 'NEW', highlight: true },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
  ];
   const competitionSubmodules = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'competition-history', label: 'Result', icon: Award },
  ];

  const learningResources = [
    { id: 'courses', label: 'Study Material', icon: BookMarked },
    { id: 'smart-notes', label: 'Smart Notes', icon: Brain, badge: 'NEW' },
  ];

  const activityHub = [
    { id: 'mappractice', label: 'Map Practice', icon: MapPin },
    { id: 'physics-phenomenon', label: 'Physics Phenomenon', icon: Zap },
    { id: 'explain-biology', label: 'Explain Biology', icon: Dna },
    { id: 'engineering-concept', label: 'Engineering Concept', icon: Wrench },
    { id: 'math-genius', label: 'Math Genius', icon: Calculator },
  ];

  const computerSubmodules = [
    { id: 'computer-fundamentals', label: 'Computer Fundamentals', icon: Cpu },
    { id: 'software-applications', label: 'Software & Applications', icon: Monitor },
    { id: 'programming-fundamentals', label: 'Programming Basics', icon: Code },
    { id: 'internet-networking', label: 'Internet & Networking', icon: Globe },
    { id: 'cyber-safety', label: 'Cyber Safety & Ethics', icon: Shield },
    { id: 'number-systems', label: 'Number Systems & Data', icon: Binary },
    { id: 'emerging-tech', label: 'Emerging Technologies', icon: Sparkles },
    { id: 'practical-skills', label: 'Practical Skills', icon: Keyboard },
  ];

  const chemistrySubmodules = [
    { id: 'skeletal-structure', label: 'Skeletal Structure', icon: Activity },
    { id: 'atomic-structure', label: 'Atomic Structure', icon: Beaker },
    { id: 'chemical-bonding', label: 'Chemical Bonding', icon: Activity },
    { id: 'reaction-mechanism', label: 'Reaction Predictor', icon: Activity },
    { id: 'reaction-game', label: 'Reaction Game', icon: Beaker },
  ];

  const vivaPreparation = [
    { id: 'viva-dashboard', label: 'Viva Dashboard', icon: LayoutDashboard, badge: 'NEW' },
    { id: 'viva-practice-testing', label: 'Viva Practice', icon: Mic, badge: 'TEST' },
    { id: 'viva-result', label: 'Viva Report', icon: ClipboardCheck, badge: 'NEW' },
  ];

  const speakAlongVivaItems = [
    { id: 'speakalong-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'speakalong-selection', label: 'Practice', icon: Volume2 },
  ];

  const examZone = [
    { id: 'take-test', label: 'Take Test', icon: ClipboardCheck },
    { id: 'test-history', label: 'Scorecard', icon: FileText, badge: 'HISTORY' },
  ];

  const generalKnowledgeItems = [
    { id: 'gk-profile', label: 'GK Profile', icon: UserCheck, badge: 'NEW' },
    { id: 'gk-preparation', label: 'GK Preparation', icon: BookOpen, badge: 'FACTS' },
    { id: 'gk-dashboard', label: 'GK Dashboard', icon: LayoutDashboard },
    { id: 'gk-exams', label: 'GK Exams', icon: ClipboardCheck, badge: 'NEW' },
    { id: 'gk-result', label: 'GK Results', icon: FileText, badge: 'NEW' },
  ];

  const conceptualVivaItems = [
    { id: 'conceptual-tutor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'conceptual-tutor-selection', label: 'Conceptual Tutor', icon: Mic },
    { id: 'conceptual-tutor-report', label: 'Report', icon: ClipboardCheck },
  ];

  const aiTutorItems = [
    { id: 'ai-tutor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-tutor-selection', label: 'AI Tutor', icon: Brain },
    { id: 'ai-tutor-report', label: 'Report', icon: ClipboardCheck },
  ];

  const doubtSupport = [
    { id: 'doubt-hub', label: 'Doubt Hub', icon: HelpCircle, badge: 'NEW' },
    { id: 'doubt-hub-workbench', label: 'Workbench', icon: MessageCircle, badge: 'TEACHER' },
  ];

  const librarySubscriptionItems = [
    { id: 'library-subscription', label: 'Library Subscription', icon: Library, badge: 'NEW' },
  ];

  const bottomMenuItems = [
    { id: 'teacher-observation-board', label: 'Teacher Observations', icon: Eye, badge: 'AI' },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Helper logic for active groups
  const isGroupActive = (items: any[]) => items.some(item => item.id === currentPage);
  const isComputersActive = isGroupActive(computerSubmodules);
  const isChemistryActive = isGroupActive(chemistrySubmodules);
  
  const [isComputersExpanded, setIsComputersExpanded] = useState(isComputersActive);
  const [isChemistryExpanded, setIsChemistryExpanded] = useState(isChemistryActive);

  const isCompetitionActive = isGroupActive(competitionSubmodules) || currentPage === 'competition';

  // Group expansion states - Auto expand if active
  const [isLearningResourcesExpanded, setIsLearningResourcesExpanded] = useState(isGroupActive(learningResources));
  const [isActivityHubExpanded, setIsActivityHubExpanded] = useState(isGroupActive(activityHub) || isComputersActive || isChemistryActive);
  const [isVivaPrepExpanded, setIsVivaPrepExpanded] = useState(isGroupActive(vivaPreparation) || currentPage === 'viva-preparation');
  const [isExamZoneExpanded, setIsExamZoneExpanded] = useState(isGroupActive(examZone));
  const [isGeneralKnowledgeExpanded, setIsGeneralKnowledgeExpanded] = useState(isGroupActive(generalKnowledgeItems));
  const [isConceptualVivaExpanded, setIsConceptualVivaExpanded] = useState(isGroupActive(conceptualVivaItems));
  const [isAITutorExpanded, setIsAITutorExpanded] = useState(isGroupActive(aiTutorItems));
  const [isSpeakAlongVivaExpanded, setIsSpeakAlongVivaExpanded] = useState(isGroupActive(speakAlongVivaItems));
  const [isDoubtSupportExpanded, setIsDoubtSupportExpanded] = useState(isGroupActive(doubtSupport));
  const [isOthersExpanded, setIsOthersExpanded] = useState(isGroupActive(bottomMenuItems));
  // Expanded states for Viva, Exam, and Competition groups
  const [isCompetitionExpanded, setIsCompetitionExpanded] = useState(isCompetitionActive);


  // Auto-expand groups when currentPage changes
  useEffect(() => {
    if (isGroupActive(learningResources)) setIsLearningResourcesExpanded(true);
    if (isGroupActive(activityHub) || isComputersActive || isChemistryActive) setIsActivityHubExpanded(true);
    if (isGroupActive(vivaPreparation)) setIsVivaPrepExpanded(true);
    if (isGroupActive(examZone)) setIsExamZoneExpanded(true);
    if (isGroupActive(generalKnowledgeItems)) setIsGeneralKnowledgeExpanded(true);
    if (isGroupActive(conceptualVivaItems)) setIsConceptualVivaExpanded(true);
    if (isGroupActive(aiTutorItems)) setIsAITutorExpanded(true);
    if (isGroupActive(speakAlongVivaItems)) setIsSpeakAlongVivaExpanded(true);
    if (isGroupActive(doubtSupport)) setIsDoubtSupportExpanded(true);
    if (isGroupActive(bottomMenuItems)) setIsOthersExpanded(true);
    if (isComputersActive) setIsComputersExpanded(true);
    if (isChemistryActive) setIsChemistryExpanded(true);
    if(isGroupActive(competitionSubmodules || currentPage === 'competition')) setIsCompetitionExpanded(true);
  }, [currentPage]);

  // Mobile sidebar state
  const [isOpen, setIsOpen] = useState(false);
  
  // Scroll detection for Dashboard hamburger background
  const [isScrolled, setIsScrolled] = useState(false);
  const isDashboard = currentPage === 'dashboard';

  useEffect(() => {
    const handleScroll = () => {
      let scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 15;
      if (!scrolled) {
        const containers = document.querySelectorAll('.overflow-y-auto');
        containers.forEach((el) => {
          if (el.scrollTop > 15) {
            scrolled = true;
          }
        });
      }
      setIsScrolled(scrolled);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [currentPage]);

  // Close sidebar on mobile when navigating
  const handleMobileNavigate = (pageId: string) => {
    onNavigate?.(pageId);
    setIsOpen(false);
  };

  // Helper toggle handlers to close other groups when one is opened (Accordion behavior)
  const toggleVivaPrep = () => {
    if (isVivaPrepExpanded) {
      setIsVivaPrepExpanded(false);
    } else {
      setIsVivaPrepExpanded(true);
      setIsCompetitionExpanded(false);
      setIsConceptualVivaExpanded(false);
      setIsSpeakAlongVivaExpanded(false);
      setIsExamZoneExpanded(false);
      setIsAITutorExpanded(false);
      setIsGeneralKnowledgeExpanded(false);
      setIsDoubtSupportExpanded(false);
      handleMobileNavigate('viva-dashboard');
    }
  };

  const toggleConceptualViva = () => {
    if (isConceptualVivaExpanded) {
      setIsConceptualVivaExpanded(false);
    } else {
      setIsConceptualVivaExpanded(true);
      setIsCompetitionExpanded(false);
      setIsVivaPrepExpanded(false);
      setIsSpeakAlongVivaExpanded(false);
      setIsExamZoneExpanded(false);
      setIsAITutorExpanded(false);
      setIsGeneralKnowledgeExpanded(false);
      setIsDoubtSupportExpanded(false);
      handleMobileNavigate('conceptual-tutor-dashboard');
    }
  };

  const toggleSpeakAlongViva = () => {
    if (isSpeakAlongVivaExpanded) {
      setIsSpeakAlongVivaExpanded(false);
    } else {
      setIsSpeakAlongVivaExpanded(true);
      setIsCompetitionExpanded(false);
      setIsVivaPrepExpanded(false);
      setIsConceptualVivaExpanded(false);
      setIsExamZoneExpanded(false);
      setIsAITutorExpanded(false);
      setIsGeneralKnowledgeExpanded(false);
      setIsDoubtSupportExpanded(false);
      handleMobileNavigate('speakalong-dashboard');
    }
  };

  const toggleExamZone = () => {
    if (isExamZoneExpanded) {
      setIsExamZoneExpanded(false);
    } else {
      setIsExamZoneExpanded(true);
      setIsCompetitionExpanded(false);
      setIsVivaPrepExpanded(false);
      setIsConceptualVivaExpanded(false);
      setIsSpeakAlongVivaExpanded(false);
      setIsAITutorExpanded(false);
      setIsGeneralKnowledgeExpanded(false);
      setIsDoubtSupportExpanded(false);
      handleMobileNavigate('take-test');
    }
  };

  const toggleAITutor = () => {
    if (isAITutorExpanded) {
      setIsAITutorExpanded(false);
    } else {
      setIsAITutorExpanded(true);
      setIsCompetitionExpanded(false);
      setIsVivaPrepExpanded(false);
      setIsConceptualVivaExpanded(false);
      setIsSpeakAlongVivaExpanded(false);
      setIsExamZoneExpanded(false);
      setIsGeneralKnowledgeExpanded(false);
      setIsDoubtSupportExpanded(false);
      handleMobileNavigate('ai-tutor-dashboard');
    }
  };

  const toggleGeneralKnowledge = () => {
    if (isGeneralKnowledgeExpanded) {
      setIsGeneralKnowledgeExpanded(false);
    } else {
      setIsGeneralKnowledgeExpanded(true);
      setIsCompetitionExpanded(false);
      setIsVivaPrepExpanded(false);
      setIsConceptualVivaExpanded(false);
      setIsSpeakAlongVivaExpanded(false);
      setIsExamZoneExpanded(false);
      setIsAITutorExpanded(false);
      setIsDoubtSupportExpanded(false);
      handleMobileNavigate('gk-dashboard');
    }
  };

  const toggleDoubtSupport = () => {
    if (isDoubtSupportExpanded) {
      setIsDoubtSupportExpanded(false);
    } else {
      setIsDoubtSupportExpanded(true);
      setIsCompetitionExpanded(false);
      setIsVivaPrepExpanded(false);
      setIsConceptualVivaExpanded(false);
      setIsSpeakAlongVivaExpanded(false);
      setIsExamZoneExpanded(false);
      setIsAITutorExpanded(false);
      setIsGeneralKnowledgeExpanded(false);
      handleMobileNavigate('doubt-hub');
    }
  };

  // Toggle handler for Competition: default opens leaderboard!
  const toggleCompetition = () => {
    if (isCompetitionExpanded) {
      setIsCompetitionExpanded(false);
    } else {
      setIsCompetitionExpanded(true);
      setIsVivaPrepExpanded(false);
      setIsDoubtSupportExpanded(false);
      setIsConceptualVivaExpanded(false);
      setIsSpeakAlongVivaExpanded(false);
      setIsExamZoneExpanded(false);
      setIsAITutorExpanded(false);
      setIsGeneralKnowledgeExpanded(false);
      handleMobileNavigate('leaderboard'); // By default leaderboard is selected and opened!
    }
  };

  const hasNavbar = ['dashboard', 'my-courses', 'courses', 'wishlist', 'cart', 'notifications'].includes(currentPage);

  const isExamSessionPage = [
    'conceptual-tutor-session',
    'conceptual-viva-session',
    'speakalong-session',
    'ai-tutor-session',
    'gk-exam-runner',
    'theorytest'
  ].includes(currentPage);

  // CSS classes for different levels
  const parentMenuClass = (isActive: boolean, isExpanded: boolean) => 
    `w-[90%] mx-auto flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-xl transition-all duration-200 text-[15px] font-semibold ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50'
        : isExpanded 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
    
  const childMenuClass = (isActive: boolean) =>
    `w-[85%] mx-auto flex items-center gap-3 px-4 py-2 my-0.5 rounded-xl transition-all duration-200 text-sm font-medium ml-6 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const grandChildMenuClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-4 py-2 my-0.5 rounded-lg transition-all duration-200 text-[13px] font-medium ${
      isActive 
        ? 'bg-blue-100 text-blue-700 font-semibold border-l-2 border-blue-600' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
    }`;

  return (
    <>
      {/* Mobile Top Header Strip */}
      {!hasNavbar && !isExamSessionPage && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-slate-200 z-20 shadow-sm transition-all duration-200" />
      )}

      {/* Mobile Hamburger Button */}
      {!isExamSessionPage && (
        <button
          data-sidebar-mini
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-0 left-0 z-40 w-14 h-[60px] flex items-center justify-center border-0 text-black hover:text-black focus:outline-none transition-all duration-200 bg-transparent shadow-none"
        >
          <Menu className="w-6 h-6 text-black stroke-black" strokeWidth={2.5} />
        </button>
      )}

      {/* Mobile Right Avatar for non-Navbar pages */}
      {!hasNavbar && !isExamSessionPage && (
        <button
          data-sidebar-avatar
          onClick={() => onNavigate?.('settings')}
          className="md:hidden fixed top-2.5 right-3.5 z-40 w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white cursor-pointer active:scale-95 transition-all"
          title="Profile Settings"
        >
          <span>{getInitials(username)}</span>
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-[100dvh] shadow-2xl transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-[100dvh] md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-sidebar
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <img src={mindshaalLogo} alt="MindShaala" className="h-10 w-auto" />
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-hide">
          {mainMenuItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMobileNavigate(item.id)}
                className={parentMenuClass(isActive, false)}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {/* {item.highlight && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">PRO</span>} */}
              </button>
            );
          })}

          {/* Competition Expandable Accordion Menu just below Dashboard */}
          <button
            onClick={toggleCompetition}
            className={parentMenuClass(false, isCompetitionExpanded || isCompetitionActive)}
          >
            <Trophy className={`w-5 h-5 ${(isCompetitionExpanded || isCompetitionActive) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Competition</span>
            {isCompetitionExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isCompetitionExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {competitionSubmodules.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="my-4 border-t border-slate-100"></div>

          {/* SpeakAlong Viva */}
          <button
            onClick={toggleSpeakAlongViva}
            className={parentMenuClass(false, isSpeakAlongVivaExpanded || isGroupActive(speakAlongVivaItems))}
          >
            <Volume2 className={`w-5 h-5 ${(isSpeakAlongVivaExpanded || isGroupActive(speakAlongVivaItems)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">SpeakAlong Viva</span>
            {isSpeakAlongVivaExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isSpeakAlongVivaExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {speakAlongVivaItems.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id || (currentPage === 'speakalong-session' && item.id === 'speakalong-selection');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Viva Preparation */}
          <button
            onClick={toggleVivaPrep}
            className={parentMenuClass(false, isVivaPrepExpanded || isGroupActive(vivaPreparation))}
          >
            <Volume2 className={`w-5 h-5 ${(isVivaPrepExpanded || isGroupActive(vivaPreparation)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Viva Preparation</span>
            {isVivaPrepExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isVivaPrepExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {vivaPreparation.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Conceptual Viva */}
          <button
            onClick={toggleConceptualViva}
            className={parentMenuClass(false, isConceptualVivaExpanded || isGroupActive(conceptualVivaItems))}
          >
            <Mic className={`w-5 h-5 ${(isConceptualVivaExpanded || isGroupActive(conceptualVivaItems)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Conceptual Tutor</span>
            {isConceptualVivaExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isConceptualVivaExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {conceptualVivaItems.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* AI Tutor */}
          <button
            onClick={toggleAITutor}
            className={parentMenuClass(false, isAITutorExpanded || isGroupActive(aiTutorItems))}
          >
            <Brain className={`w-5 h-5 ${(isAITutorExpanded || isGroupActive(aiTutorItems)) ? 'text-violet-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">AI Tutor</span>
            {isAITutorExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isAITutorExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {aiTutorItems.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id || 
                  (item.id === 'ai-tutor-selection' && currentPage === 'ai-tutor-session') ||
                  (item.id === 'ai-tutor-report' && currentPage === 'ai-tutor-result-detail');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Exam Zone */}
          <button
            onClick={toggleExamZone}
            className={parentMenuClass(false, isExamZoneExpanded || isGroupActive(examZone))}
          >
            <ClipboardList className={`w-5 h-5 ${(isExamZoneExpanded || isGroupActive(examZone)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Exam Zone</span>
            {isExamZoneExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isExamZoneExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {examZone.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* General Knowledge */}
          <button
            onClick={toggleGeneralKnowledge}
            className={parentMenuClass(false, isGeneralKnowledgeExpanded || isGroupActive(generalKnowledgeItems))}
          >
            <Globe className={`w-5 h-5 ${(isGeneralKnowledgeExpanded || isGroupActive(generalKnowledgeItems)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">General Knowledge</span>
            {isGeneralKnowledgeExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isGeneralKnowledgeExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {generalKnowledgeItems.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id || (item.id === 'gk-exams' && currentPage === 'gk-exam-runner');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Learning Zone */}
          <button
            onClick={() => setIsLearningResourcesExpanded(!isLearningResourcesExpanded)}
            className={parentMenuClass(false, isLearningResourcesExpanded || isGroupActive(learningResources))}
          >
            <BookOpen className={`w-5 h-5 ${(isLearningResourcesExpanded || isGroupActive(learningResources)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Learning Zone</span>
            {isLearningResourcesExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isLearningResourcesExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {learningResources.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Activity Hub */}
          <button
            onClick={() => setIsActivityHubExpanded(!isActivityHubExpanded)}
            className={parentMenuClass(false, isActivityHubExpanded || isGroupActive(activityHub) || isComputersActive || isChemistryActive)}
          >
            <Activity className={`w-5 h-5 ${(isActivityHubExpanded || isGroupActive(activityHub) || isComputersActive || isChemistryActive) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Activity Hub</span>
            {isActivityHubExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isActivityHubExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {activityHub.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}

              {/* Computer Lab Collapsible */}
              <div className="w-[85%] mx-auto ml-6">
                <button
                  onClick={() => setIsComputersExpanded(!isComputersExpanded)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isComputersActive || isComputersExpanded ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Monitor className={`w-4 h-4 ${isComputersActive || isComputersExpanded ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">Computer Lab</span>
                  {isComputersExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                </button>
                {isComputersExpanded && (
                  <div className="mt-1 ml-4 border-l-2 border-slate-100 pl-2 space-y-0.5">
                    {computerSubmodules.map((submodule) => {
                      const SubIcon = submodule.icon;
                      const isActive = currentPage === submodule.id;
                      return (
                        <button
                          key={submodule.id}
                          onClick={() => handleMobileNavigate(submodule.id)}
                          className={grandChildMenuClass(isActive)}
                        >
                          <SubIcon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>{submodule.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chemistry Lab Collapsible */}
              <div className="w-[85%] mx-auto ml-6 mt-1">
                <button
                  onClick={() => setIsChemistryExpanded(!isChemistryExpanded)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isChemistryActive || isChemistryExpanded ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Beaker className={`w-4 h-4 ${isChemistryActive || isChemistryExpanded ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">Chemistry Lab</span>
                  {isChemistryExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                </button>
                {isChemistryExpanded && (
                  <div className="mt-1 ml-4 border-l-2 border-slate-100 pl-2 space-y-0.5">
                    {chemistrySubmodules.map((submodule) => {
                      const SubIcon = submodule.icon;
                      const isActive = currentPage === submodule.id;
                      return (
                        <button
                          key={submodule.id}
                          onClick={() => handleMobileNavigate(submodule.id)}
                          className={grandChildMenuClass(isActive)}
                        >
                          <SubIcon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>{submodule.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doubt Support */}
          <button
            onClick={toggleDoubtSupport}
            className={parentMenuClass(false, isDoubtSupportExpanded || isGroupActive(doubtSupport))}
          >
            <HelpCircle className={`w-5 h-5 ${(isDoubtSupportExpanded || isGroupActive(doubtSupport)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Doubt Support</span>
            {isDoubtSupportExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isDoubtSupportExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {doubtSupport.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Library Subscription */}
          {librarySubscriptionItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMobileNavigate(item.id)}
                className={parentMenuClass(isActive, false)}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-4 border-t border-slate-100"></div>

          {/* Others/Settings */}
          <button
            onClick={() => setIsOthersExpanded(!isOthersExpanded)}
            className={parentMenuClass(false, isOthersExpanded || isGroupActive(bottomMenuItems))}
          >
            <Settings className={`w-5 h-5 ${(isOthersExpanded || isGroupActive(bottomMenuItems)) ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Settings</span>
            {isOthersExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>
          {isOthersExpanded && (
            <div className="mt-1 mb-2 space-y-1">
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.id)}
                    className={childMenuClass(isActive)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Profile - Sticky at bottom */}
        <div 
          onClick={() => handleMobileNavigate('profile')}
          className="border-t border-slate-200 p-4 bg-slate-50/50 cursor-pointer hover:bg-slate-100/80 transition-colors"
          title="View & Edit Profile"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm shrink-0 overflow-hidden font-bold shadow-sm">
              {getInitials(username)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[15px] font-bold text-slate-900 truncate">{username}</p>
              <div className="flex items-center gap-1 mt-0.5">
                   <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate">
                      {selectedCourse?.subscription_name || selectedCourse?.course_name || selectedCourse?.title || selectedCourse?.name || "No Course Selected"}
                   </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-4 h-4 group-hover:text-rose-600 transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}