import { useState } from 'react';
import { 
  Trophy, Calendar, Clock, Users, Coins, Star, Crown, Medal,
  Zap, Target, Award, TrendingUp, CheckCircle, AlertCircle,
  ChevronRight, Flame, Sparkles, Gift, Timer, Play, Lock,
  ArrowRight, Info
} from 'lucide-react';

interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'live' | 'upcoming' | 'past';
  category: 'physics' | 'chemistry' | 'mathematics' | 'biology' | 'all-subjects';
  format: 'speed-test' | 'accuracy-challenge' | '综合考试' | 'topic-mastery';
  difficulty: 'easy' | 'medium' | 'hard';
  entryFee: number;
  prizePool: number;
  totalParticipants: number;
  maxParticipants: number;
  duration: string;
  startTime: string;
  endTime: string;
  questions: number;
  prizes: {
    rank: string;
    reward: string;
    credits: number;
  }[];
  winners?: {
    rank: number;
    name: string;
    score: number;
    credits: number;
  }[];
  isRegistered?: boolean;
  status?: 'open' | 'full' | 'closed' | 'completed';
}

export function CompetePlatform() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('upcoming');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userCredits, setUserCredits] = useState(2500); // Student's credit balance

  const competitions: Competition[] = [
    {
      id: 'comp-1',
      title: 'Physics Speed Challenge',
      description: 'Test your physics problem-solving speed! 30 questions in 30 minutes. Topics: Mechanics, Electricity & Magnetism.',
      type: 'live',
      category: 'physics',
      format: 'speed-test',
      difficulty: 'medium',
      entryFee: 100,
      prizePool: 5000,
      totalParticipants: 847,
      maxParticipants: 1000,
      duration: '30 min',
      startTime: '2025-12-27 18:00',
      endTime: '2025-12-27 18:30',
      questions: 30,
      prizes: [
        { rank: '1st', reward: 'Gold Trophy + Credits', credits: 2000 },
        { rank: '2nd', reward: 'Silver Trophy + Credits', credits: 1200 },
        { rank: '3rd', reward: 'Bronze Trophy + Credits', credits: 800 },
        { rank: 'Top 10', reward: 'Credits', credits: 400 },
        { rank: 'Top 50', reward: 'Credits', credits: 150 },
      ],
      isRegistered: true,
      status: 'open',
    },
    {
      id: 'comp-2',
      title: 'Mathematics Olympiad - Weekly',
      description: 'Challenging mathematics problems covering Algebra, Calculus, Trigonometry, and Coordinate Geometry.',
      type: 'upcoming',
      category: 'mathematics',
      format: 'accuracy-challenge',
      difficulty: 'hard',
      entryFee: 150,
      prizePool: 8000,
      totalParticipants: 234,
      maxParticipants: 500,
      duration: '60 min',
      startTime: '2025-12-28 16:00',
      endTime: '2025-12-28 17:00',
      questions: 40,
      prizes: [
        { rank: '1st', reward: 'Gold Trophy + Premium Credits', credits: 3500 },
        { rank: '2nd', reward: 'Silver Trophy + Credits', credits: 2000 },
        { rank: '3rd', reward: 'Bronze Trophy + Credits', credits: 1200 },
        { rank: 'Top 10', reward: 'Credits', credits: 600 },
        { rank: 'Top 25', reward: 'Credits', credits: 250 },
      ],
      status: 'open',
    },
    {
      id: 'comp-3',
      title: 'Chemistry Quick Fire',
      description: 'Rapid-fire chemistry questions! Organic, Inorganic, and Physical Chemistry. Perfect for JEE/NEET aspirants.',
      type: 'upcoming',
      category: 'chemistry',
      format: 'speed-test',
      difficulty: 'medium',
      entryFee: 100,
      prizePool: 4500,
      totalParticipants: 512,
      maxParticipants: 800,
      duration: '45 min',
      startTime: '2025-12-29 15:00',
      endTime: '2025-12-29 15:45',
      questions: 35,
      prizes: [
        { rank: '1st', reward: 'Gold Trophy + Credits', credits: 2000 },
        { rank: '2nd', reward: 'Silver Trophy + Credits', credits: 1100 },
        { rank: '3rd', reward: 'Bronze Trophy + Credits', credits: 700 },
        { rank: 'Top 10', reward: 'Credits', credits: 350 },
      ],
      status: 'open',
    },
    {
      id: 'comp-4',
      title: 'All-Subjects Mega Competition',
      description: 'The ultimate test! All 4 subjects - Physics, Chemistry, Mathematics, and Biology. Compete for massive prizes!',
      type: 'upcoming',
      category: 'all-subjects',
      format: '综合考试',
      difficulty: 'hard',
      entryFee: 250,
      prizePool: 15000,
      totalParticipants: 89,
      maxParticipants: 300,
      duration: '120 min',
      startTime: '2025-12-30 10:00',
      endTime: '2025-12-30 12:00',
      questions: 100,
      prizes: [
        { rank: '1st', reward: 'Platinum Trophy + Mega Credits + 1 Month Premium', credits: 7500 },
        { rank: '2nd', reward: 'Gold Trophy + Credits + 2 Weeks Premium', credits: 4500 },
        { rank: '3rd', reward: 'Silver Trophy + Credits + 1 Week Premium', credits: 2500 },
        { rank: 'Top 5', reward: 'Bronze Trophy + Credits', credits: 1200 },
        { rank: 'Top 20', reward: 'Credits', credits: 500 },
      ],
      status: 'open',
    },
    {
      id: 'comp-5',
      title: 'Biology Mastery Challenge',
      description: 'Deep dive into Biology! Genetics, Ecology, Human Physiology, and Plant Science. NEET preparation special.',
      type: 'upcoming',
      category: 'biology',
      format: 'accuracy-challenge',
      difficulty: 'medium',
      entryFee: 120,
      prizePool: 5500,
      totalParticipants: 299,
      maxParticipants: 600,
      duration: '50 min',
      startTime: '2025-12-31 14:00',
      endTime: '2025-12-31 14:50',
      questions: 40,
      prizes: [
        { rank: '1st', reward: 'Gold Trophy + Credits', credits: 2500 },
        { rank: '2nd', reward: 'Silver Trophy + Credits', credits: 1400 },
        { rank: '3rd', reward: 'Bronze Trophy + Credits', credits: 900 },
        { rank: 'Top 15', reward: 'Credits', credits: 400 },
      ],
      status: 'open',
    },
    {
      id: 'comp-6',
      title: 'JEE Mains Mock Championship',
      description: 'Previous Week\'s Competition - Full JEE Mains pattern test with 75 questions across PCM.',
      type: 'past',
      category: 'all-subjects',
      format: '综合考试',
      difficulty: 'hard',
      entryFee: 200,
      prizePool: 10000,
      totalParticipants: 456,
      maxParticipants: 500,
      duration: '90 min',
      startTime: '2025-12-20 10:00',
      endTime: '2025-12-20 11:30',
      questions: 75,
      prizes: [
        { rank: '1st', reward: 'Platinum Trophy + Credits', credits: 5000 },
        { rank: '2nd', reward: 'Gold Trophy + Credits', credits: 3000 },
        { rank: '3rd', reward: 'Silver Trophy + Credits', credits: 1800 },
      ],
      winners: [
        { rank: 1, name: 'Aarav Patel', score: 285, credits: 5000 },
        { rank: 2, name: 'Priya Singh', score: 278, credits: 3000 },
        { rank: 3, name: 'Arjun Kumar', score: 271, credits: 1800 },
        { rank: 4, name: 'Ananya Sharma', score: 265, credits: 1000 },
        { rank: 5, name: 'Rohan Sharma', score: 258, credits: 600 },
        { rank: 6, name: 'Ishita Verma', score: 254, credits: 600 },
        { rank: 7, name: 'Kabir Malhotra', score: 249, credits: 600 },
        { rank: 8, name: 'Diya Gupta', score: 245, credits: 600 },
        { rank: 9, name: 'Vihaan Reddy', score: 241, credits: 600 },
        { rank: 10, name: 'Saanvi Joshi', score: 237, credits: 600 },
      ],
      status: 'completed',
    },
  ];

  const liveCompetitions = competitions.filter(c => c.type === 'live');
  const upcomingCompetitions = competitions.filter(c => c.type === 'upcoming');
  const pastCompetitions = competitions.filter(c => c.type === 'past');

  const handleRegister = (competition: Competition) => {
    if (userCredits < competition.entryFee) {
      alert('Insufficient credits! Earn more credits by studying, completing tests, and achieving milestones.');
      return;
    }
    
    setUserCredits(prev => prev - competition.entryFee);
    alert(`Successfully registered for ${competition.title}!\n\nEntry Fee: ${competition.entryFee} credits\nRemaining Balance: ${userCredits - competition.entryFee} credits\n\nYou'll receive a reminder 15 minutes before the competition starts. Good luck! 🎯`);
    setShowRegistrationModal(false);
    setSelectedCompetition(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'physics': return 'blue';
      case 'chemistry': return 'green';
      case 'mathematics': return 'orange';
      case 'biology': return 'pink';
      case 'all-subjects': return 'purple';
      default: return 'gray';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Easy' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' };
      case 'hard': return { bg: 'bg-red-100', text: 'text-red-700', label: 'Hard' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h`;
    return 'Starting soon';
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl">Compete & Win</h1>
                  <p className="text-sm text-white/90">Compete with thousands of students nationwide</p>
                </div>
              </div>
            </div>
            
            {/* Credit Balance */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/30">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-yellow-200" />
                <span className="text-xs text-white/80">Your Credits</span>
              </div>
              <p className="text-2xl">{userCredits.toLocaleString()}</p>
              <button className="text-xs text-white/90 hover:text-white mt-1 flex items-center gap-1">
                Earn More <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs">Competitions Won</span>
              </div>
              <p className="text-2xl">3</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs">Total Participated</span>
              </div>
              <p className="text-2xl">12</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-xs">Best Rank</span>
              </div>
              <p className="text-2xl">5th</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs">Credits Earned</span>
              </div>
              <p className="text-2xl">1850</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-5 py-3 text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'live'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Live Now
              {liveCompetitions.length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                  {liveCompetitions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-3 text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
              {upcomingCompetitions.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {upcomingCompetitions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-3 text-sm transition-colors border-b-2 ${
                activeTab === 'past'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Results
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Live Competitions */}
          {activeTab === 'live' && (
            <div className="space-y-5">
              {liveCompetitions.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-900 mb-1">No live competitions right now</p>
                  <p className="text-xs text-gray-500 mb-4">Check upcoming competitions to register</p>
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Upcoming
                  </button>
                </div>
              )}
              
              {liveCompetitions.map((comp) => (
                <div key={comp.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-300 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white rounded text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE NOW
                        </div>
                        <span className={`px-2 py-1 bg-${getCategoryColor(comp.category)}-100 text-${getCategoryColor(comp.category)}-700 rounded text-xs capitalize`}>
                          {comp.category.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 ${getDifficultyBadge(comp.difficulty).bg} ${getDifficultyBadge(comp.difficulty).text} rounded text-xs`}>
                          {getDifficultyBadge(comp.difficulty).label}
                        </span>
                      </div>
                      <h2 className="text-lg text-gray-900 mb-2">{comp.title}</h2>
                      <p className="text-sm text-gray-600 mb-3">{comp.description}</p>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{comp.totalParticipants.toLocaleString()} competing</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{comp.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          <span>{comp.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Gift className="w-4 h-4" />
                          <span>{comp.prizePool.toLocaleString()} credits pool</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {comp.isRegistered ? (
                      <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Enter Competition Now
                      </button>
                    ) : (
                      <button className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm">
                        Not Registered
                      </button>
                    )}
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      View Leaderboard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Competitions */}
          {activeTab === 'upcoming' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingCompetitions.map((comp) => {
                const color = getCategoryColor(comp.category);
                const difficulty = getDifficultyBadge(comp.difficulty);
                const spotsLeft = comp.maxParticipants - comp.totalParticipants;
                
                return (
                  <div key={comp.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 rounded text-xs capitalize`}>
                            {comp.category.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 ${difficulty.bg} ${difficulty.text} rounded text-xs`}>
                            {difficulty.label}
                          </span>
                        </div>
                        <h3 className="text-base text-gray-900 mb-2">{comp.title}</h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{comp.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(comp.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-orange-600">
                          <Timer className="w-3 h-3" />
                          <span>{getTimeRemaining(comp.startTime)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{comp.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Target className="w-3 h-3" />
                          <span>{comp.questions} Qs</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-3 h-3 text-yellow-600" />
                          <span className="text-gray-600">Entry:</span>
                          <span className="text-gray-900">{comp.entryFee} credits</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Gift className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">{comp.prizePool.toLocaleString()} pool</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Registrations</span>
                          <span className={`${spotsLeft < 50 ? 'text-red-600' : 'text-gray-600'}`}>
                            {spotsLeft} spots left
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${spotsLeft < 50 ? 'bg-red-600' : 'bg-blue-600'}`}
                            style={{ width: `${(comp.totalParticipants / comp.maxParticipants) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCompetition(comp);
                          setShowRegistrationModal(true);
                        }}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Register Now
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCompetition(comp);
                        }}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past Competitions */}
          {activeTab === 'past' && (
            <div className="space-y-5">
              {pastCompetitions.map((comp) => (
                <div key={comp.id} className="bg-white rounded-lg border border-gray-200">
                  <div className="border-b border-gray-200 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600">Completed</span>
                          <span className={`px-2 py-1 bg-${getCategoryColor(comp.category)}-100 text-${getCategoryColor(comp.category)}-700 rounded text-xs capitalize`}>
                            {comp.category.replace('-', ' ')}
                          </span>
                        </div>
                        <h3 className="text-base text-gray-900 mb-1">{comp.title}</h3>
                        <p className="text-xs text-gray-500">{formatDate(comp.startTime)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total Participants</p>
                        <p className="text-xl text-gray-900">{comp.totalParticipants.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Winners */}
                  <div className="p-5">
                    <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      Top 10 Winners
                    </h4>
                    <div className="space-y-2">
                      {comp.winners?.slice(0, 10).map((winner, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            winner.rank <= 3 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              winner.rank === 1 ? 'bg-yellow-500 text-white' :
                              winner.rank === 2 ? 'bg-gray-400 text-white' :
                              winner.rank === 3 ? 'bg-orange-600 text-white' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {winner.rank <= 3 ? (
                                winner.rank === 1 ? <Crown className="w-4 h-4" /> :
                                winner.rank === 2 ? <Medal className="w-4 h-4" /> :
                                <Award className="w-4 h-4" />
                              ) : (
                                <span className="text-xs">#{winner.rank}</span>
                              )}
                            </div>
                            <div>
                              <p className={`text-sm ${winner.name === 'Rohan Sharma' ? 'text-blue-600' : 'text-gray-900'}`}>
                                {winner.name} {winner.name === 'Rohan Sharma' && '(You)'}
                              </p>
                              <p className="text-xs text-gray-500">Score: {winner.score}/300</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-green-600">
                            <Coins className="w-4 h-4" />
                            <span className="text-sm">+{winner.credits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">Register for Competition</h3>
                  <p className="text-sm text-gray-500">{selectedCompetition.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowRegistrationModal(false);
                    setSelectedCompetition(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Competition Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm text-gray-900 mb-3">Competition Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Start Time</p>
                    <p className="text-gray-900">{formatDate(selectedCompetition.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Duration</p>
                    <p className="text-gray-900">{selectedCompetition.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Total Questions</p>
                    <p className="text-gray-900">{selectedCompetition.questions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Difficulty</p>
                    <p className="text-gray-900 capitalize">{selectedCompetition.difficulty}</p>
                  </div>
                </div>
              </div>

              {/* Prize Distribution */}
              <div>
                <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  Prize Distribution
                </h4>
                <div className="space-y-2">
                  {selectedCompetition.prizes.map((prize, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Crown className="w-4 h-4 text-yellow-600" />}
                        {idx === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                        {idx === 2 && <Award className="w-4 h-4 text-orange-600" />}
                        <span className="text-sm text-gray-700">{prize.rank} Place</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{prize.reward}</p>
                        <p className="text-xs text-green-600">{prize.credits} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm text-gray-900 mb-3">Payment Summary</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Entry Fee</span>
                  <span className="text-sm text-gray-900">{selectedCompetition.entryFee} credits</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Your Balance</span>
                  <span className="text-sm text-gray-900">{userCredits.toLocaleString()} credits</span>
                </div>
                <div className="pt-2 border-t border-yellow-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Balance After Registration</span>
                    <span className={`text-sm ${userCredits - selectedCompetition.entryFee >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(userCredits - selectedCompetition.entryFee).toLocaleString()} credits
                    </span>
                  </div>
                </div>
              </div>

              {userCredits < selectedCompetition.entryFee && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-900 mb-1">Insufficient Credits</p>
                    <p className="text-xs text-red-700">You need {selectedCompetition.entryFee - userCredits} more credits to register. Complete tests, study sessions, and achieve milestones to earn more credits!</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-1">Important Notes</p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-3">
                    <li>• You'll receive a reminder 15 minutes before the competition starts</li>
                    <li>• Make sure you have a stable internet connection</li>
                    <li>• Once started, the timer cannot be paused</li>
                    <li>• Entry fee is non-refundable</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRegistrationModal(false);
                  setSelectedCompetition(null);
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegister(selectedCompetition)}
                disabled={userCredits < selectedCompetition.entryFee}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competition Detail View (when selected but not in modal) */}
      {selectedCompetition && !showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">{selectedCompetition.title}</h3>
                  <p className="text-sm text-gray-500">{selectedCompetition.description}</p>
                </div>
                <button
                  onClick={() => setSelectedCompetition(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Start Time</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedCompetition.startTime)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Duration</p>
                  <p className="text-sm text-gray-900">{selectedCompetition.duration}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Questions</p>
                  <p className="text-sm text-gray-900">{selectedCompetition.questions}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Prize Pool</p>
                  <p className="text-sm text-green-600">{selectedCompetition.prizePool.toLocaleString()} credits</p>
                </div>
              </div>

              <button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Register for Competition
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
