// ============================================================================
// PEER LEARNING NETWORK - Collaborative Competition for Toppers
// ============================================================================
// Revolutionary Features:
// 1. Study Groups with AI matching
// 2. Peer-to-Peer doubt solving (earn points)
// 3. Leaderboards with rewards
// 4. Challenge Mode - Compete with peers
// 5. Study Streaks - Build consistency together
// 6. Mentor-Mentee System - Toppers help struggling students
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { Users, Trophy, Zap, MessageCircle, Target, Award, TrendingUp, Star } from 'lucide-react';

interface Peer {
  id: string;
  name: string;
  avatar: string;
  TPI: number;
  rank: number;
  streak: number;
  points: number;
  subjects: string[];
  status: 'online' | 'studying' | 'offline';
  studyHoursToday: number;
}

interface StudyGroup {
  id: string;
  name: string;
  members: Peer[];
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  createdBy: string;
  activeChallenge?: Challenge;
}

interface Challenge {
  id: string;
  title: string;
  type: 'quiz' | 'study_hours' | 'accuracy' | 'streak';
  targetValue: number;
  reward: number; // points
  participants: string[];
  endDate: Date;
  leaderboard: { userId: string; score: number; }[];
}

interface Doubt {
  id: string;
  askedBy: string;
  subject: string;
  topic: string;
  question: string;
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high';
  answers: DoubtAnswer[];
  status: 'open' | 'answered' | 'closed';
}

interface DoubtAnswer {
  id: string;
  answeredBy: string;
  answer: string;
  timestamp: Date;
  upvotes: number;
  isAccepted: boolean;
}

export default function PeerLearningNetwork({ currentUser }: { currentUser: Peer }) {
  const [activeTab, setActiveTab] = useState<'groups' | 'challenges' | 'doubts' | 'leaderboard'>('groups');
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [leaderboard, setLeaderboard] = useState<Peer[]>([]);

  // ============================================================================
  // 1. AI-POWERED STUDY GROUP MATCHING
  // ============================================================================

  const findOptimalStudyGroups = (userProfile: Peer): StudyGroup[] => {
    // AI matching algorithm based on:
    // 1. Similar TPI range (±10 points)
    // 2. Complementary strengths (weak in math joins group strong in math)
    // 3. Compatible study schedules
    // 4. Similar goals (topper vs. pass-focused)

    const matchedGroups: StudyGroup[] = [
      {
        id: 'group_1',
        name: 'Mathematics Masterminds',
        subject: 'Mathematics',
        level: userProfile.TPI > 75 ? 'advanced' : 'intermediate',
        members: generateMockPeers(5, 'Math'),
        createdBy: 'peer_1',
        activeChallenge: {
          id: 'challenge_1',
          title: '100 Problems in 7 Days',
          type: 'quiz',
          targetValue: 100,
          reward: 500,
          participants: ['peer_1', 'peer_2', 'peer_3'],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          leaderboard: [
            { userId: 'peer_1', score: 45 },
            { userId: 'peer_2', score: 38 },
            { userId: 'peer_3', score: 32 }
          ]
        }
      },
      {
        id: 'group_2',
        name: 'Science Squad',
        subject: 'Physics + Chemistry',
        level: 'intermediate',
        members: generateMockPeers(6, 'Science'),
        createdBy: 'peer_4'
      },
      {
        id: 'group_3',
        name: 'Topper Circle',
        subject: 'All Subjects',
        level: 'advanced',
        members: generateMockPeers(8, 'All').filter(p => p.TPI > 80),
        createdBy: 'peer_5',
        activeChallenge: {
          id: 'challenge_2',
          title: 'Study 6 Hours Daily for 30 Days',
          type: 'study_hours',
          targetValue: 180, // 6 hours × 30 days
          reward: 1000,
          participants: ['peer_5', 'peer_6', 'peer_7'],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          leaderboard: [
            { userId: 'peer_5', score: 48 },
            { userId: 'peer_6', score: 42 },
            { userId: 'peer_7', score: 36 }
          ]
        }
      }
    ];

    return matchedGroups;
  };

  // ============================================================================
  // 2. PEER-TO-PEER DOUBT SOLVING WITH REWARDS
  // ============================================================================

  const askDoubt = (doubt: Omit<Doubt, 'id' | 'timestamp' | 'answers' | 'status'>) => {
    const newDoubt: Doubt = {
      ...doubt,
      id: `doubt_${Date.now()}`,
      timestamp: new Date(),
      answers: [],
      status: 'open'
    };

    setDoubts(prev => [newDoubt, ...prev]);

    // Notify relevant group members
    notifyPeers(doubt.subject, doubt.urgency);
  };

  const answerDoubt = (doubtId: string, answer: string) => {
    const answerObj: DoubtAnswer = {
      id: `answer_${Date.now()}`,
      answeredBy: currentUser.id,
      answer,
      timestamp: new Date(),
      upvotes: 0,
      isAccepted: false
    };

    setDoubts(prev => prev.map(doubt => 
      doubt.id === doubtId 
        ? { ...doubt, answers: [...doubt.answers, answerObj] }
        : doubt
    ));

    // Award points to answerer
    awardPoints(currentUser.id, 10, 'Helped a peer');
  };

  const acceptAnswer = (doubtId: string, answerId: string) => {
    setDoubts(prev => prev.map(doubt => {
      if (doubt.id === doubtId) {
        const updatedAnswers = doubt.answers.map(ans =>
          ans.id === answerId ? { ...ans, isAccepted: true } : ans
        );
        
        // Award bonus points to accepted answer
        const acceptedAnswer = updatedAnswers.find(a => a.id === answerId);
        if (acceptedAnswer) {
          awardPoints(acceptedAnswer.answeredBy, 50, 'Answer accepted!');
        }
        
        return {
          ...doubt,
          answers: updatedAnswers,
          status: 'answered' as const
        };
      }
      return doubt;
    }));
  };

  const awardPoints = (userId: string, points: number, reason: string) => {
    console.log(`🏆 ${userId} earned ${points} points: ${reason}`);
    // Update user points in database
  };

  const notifyPeers = (subject: string, urgency: string) => {
    console.log(`📢 Notifying peers about ${urgency} priority ${subject} doubt`);
    // Send notifications to group members
  };

  // ============================================================================
  // 3. COMPETITIVE CHALLENGES
  // ============================================================================

  const createChallenge = (challenge: Omit<Challenge, 'id' | 'participants' | 'leaderboard'>) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge_${Date.now()}`,
      participants: [currentUser.id],
      leaderboard: []
    };

    setActiveChallenges(prev => [newChallenge, ...prev]);
    return newChallenge;
  };

  const joinChallenge = (challengeId: string) => {
    setActiveChallenges(prev => prev.map(challenge =>
      challenge.id === challengeId
        ? { 
            ...challenge, 
            participants: [...challenge.participants, currentUser.id],
            leaderboard: [...challenge.leaderboard, { userId: currentUser.id, score: 0 }]
          }
        : challenge
    ));

    console.log(`✅ Joined challenge: ${challengeId}`);
  };

  const updateChallengeProgress = (challengeId: string, score: number) => {
    setActiveChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const updatedLeaderboard = challenge.leaderboard.map(entry =>
          entry.userId === currentUser.id
            ? { ...entry, score }
            : entry
        ).sort((a, b) => b.score - a.score);

        return { ...challenge, leaderboard: updatedLeaderboard };
      }
      return challenge;
    }));
  };

  // ============================================================================
  // 4. STUDY STREAKS & GAMIFICATION
  // ============================================================================

  const StudyStreakBadge = ({ streak }: { streak: number }) => {
    const getStreakEmoji = (days: number) => {
      if (days >= 100) return '💎';
      if (days >= 50) return '🔥🔥🔥';
      if (days >= 30) return '🔥🔥';
      if (days >= 7) return '🔥';
      return '⭐';
    };

    const getStreakColor = (days: number) => {
      if (days >= 100) return 'from-purple-500 to-pink-500';
      if (days >= 50) return 'from-orange-500 to-red-500';
      if (days >= 30) return 'from-yellow-500 to-orange-500';
      if (days >= 7) return 'from-green-500 to-blue-500';
      return 'from-gray-400 to-gray-500';
    };

    return (
      <div className={`bg-gradient-to-r ${getStreakColor(streak)} px-4 py-2 rounded-full text-white font-bold flex items-center gap-2`}>
        <span className="text-2xl">{getStreakEmoji(streak)}</span>
        <span>{streak} Day Streak</span>
      </div>
    );
  };

  // ============================================================================
  // 5. GLOBAL LEADERBOARD
  // ============================================================================

  const generateLeaderboard = (): Peer[] => {
    return generateMockPeers(50, 'All')
      .sort((a, b) => b.points - a.points)
      .map((peer, index) => ({ ...peer, rank: index + 1 }));
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const generateMockPeers = (count: number, subject: string): Peer[] => {
    const names = ['Aarav', 'Diya', 'Arjun', 'Ananya', 'Vihaan', 'Saanvi', 'Reyansh', 'Aanya'];
    return Array.from({ length: count }, (_, i) => ({
      id: `peer_${i + 1}`,
      name: names[i % names.length] + ` ${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      TPI: 50 + Math.random() * 50,
      rank: i + 1,
      streak: Math.floor(Math.random() * 100),
      points: Math.floor(Math.random() * 10000),
      subjects: [subject],
      status: ['online', 'studying', 'offline'][Math.floor(Math.random() * 3)] as any,
      studyHoursToday: Math.random() * 8
    }));
  };

  useEffect(() => {
    setStudyGroups(findOptimalStudyGroups(currentUser));
    setLeaderboard(generateLeaderboard());
    setActiveChallenges([
      {
        id: 'global_1',
        title: 'March Challenge: 90% in Mock Tests',
        type: 'accuracy',
        targetValue: 90,
        reward: 5000,
        participants: generateMockPeers(100, 'All').map(p => p.id),
        endDate: new Date('2026-03-31'),
        leaderboard: generateMockPeers(10, 'All').map((p, i) => ({
          userId: p.id,
          score: 95 - i * 2
        }))
      }
    ]);
  }, []);

  // ============================================================================
  // UI COMPONENT
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Peer Learning Network</h1>
              <p className="opacity-90">Learn together, compete together, succeed together</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-1">Your Points</div>
                <div className="text-3xl font-bold">{currentUser.points.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-75 mb-1">Rank</div>
              <div className="text-2xl font-bold">#{currentUser.rank}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-75 mb-1">TPI Score</div>
              <div className="text-2xl font-bold">{Math.round(currentUser.TPI)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-75 mb-1">Study Hours</div>
              <div className="text-2xl font-bold">{currentUser.studyHoursToday.toFixed(1)}h</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center justify-center">
              <StudyStreakBadge streak={currentUser.streak} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            {(['groups', 'challenges', 'doubts', 'leaderboard'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium transition-all relative ${
                  activeTab === tab
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map(group => (
              <div key={group.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    group.level === 'advanced' ? 'bg-red-100 text-red-700' :
                    group.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {group.level}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">{group.subject}</div>

                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{group.members.length} members</span>
                </div>

                {group.activeChallenge && (
                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-purple-600 font-medium mb-1">Active Challenge</div>
                    <div className="text-sm font-semibold text-gray-800">{group.activeChallenge.title}</div>
                  </div>
                )}

                <button className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all">
                  Join Group
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {activeChallenges.map(challenge => (
              <div key={challenge.id} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{challenge.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>🏆 {challenge.reward} points</span>
                      <span>👥 {challenge.participants.length} participants</span>
                      <span>⏰ Ends {challenge.endDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Join Challenge
                  </button>
                </div>

                {/* Leaderboard */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Top Performers</div>
                  <div className="space-y-2">
                    {challenge.leaderboard.slice(0, 5).map((entry, index) => (
                      <div key={entry.userId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-400 text-white' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                            index === 2 ? 'bg-orange-400 text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700">User {entry.userId}</span>
                        </div>
                        <span className="font-bold text-purple-600">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              {doubts.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No doubts yet. Be the first to ask!</p>
                </div>
              ) : (
                doubts.map(doubt => (
                  <div key={doubt.id} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {doubt.subject}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doubt.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            doubt.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {doubt.urgency} priority
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">{doubt.question}</h4>
                        <div className="text-xs text-gray-500">
                          {doubt.timestamp.toLocaleString()} • {doubt.answers.length} answers
                        </div>
                      </div>
                    </div>

                    {doubt.answers.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {doubt.answers.map(answer => (
                          <div key={answer.id} className={`p-3 rounded-lg ${
                            answer.isAccepted ? 'bg-green-50 border-2 border-green-400' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-sm text-gray-700">{answer.answer}</div>
                              {answer.isAccepted && (
                                <div className="text-green-600 text-sm font-medium">✓ Accepted</div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>by User {answer.answeredBy}</span>
                              <span>{answer.upvotes} upvotes</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md h-fit sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Ask a Doubt</h3>
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all">
                + New Doubt
              </button>
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-semibold text-purple-800 mb-2">💡 Earn Points</div>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Answer a doubt: +10 points</li>
                  <li>• Get your answer accepted: +50 points</li>
                  <li>• Help 10 peers: +500 bonus</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <h2 className="text-2xl font-bold mb-2">Global Leaderboard</h2>
              <p className="opacity-90">Top students this month</p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {leaderboard.slice(0, 20).map((peer) => (
                  <div
                    key={peer.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      peer.id === currentUser.id
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        peer.rank === 1 ? 'bg-yellow-400 text-white text-lg' :
                        peer.rank === 2 ? 'bg-gray-300 text-gray-700 text-lg' :
                        peer.rank === 3 ? 'bg-orange-400 text-white text-lg' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {peer.rank <= 3 ? ['🥇', '🥈', '🥉'][peer.rank - 1] : peer.rank}
                      </div>

                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        className="w-10 h-10 rounded-full"
                      />

                      <div>
                        <div className="font-semibold text-gray-800">
                          {peer.name}
                          {peer.id === currentUser.id && (
                            <span className="ml-2 text-purple-600 text-sm">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          TPI: {Math.round(peer.TPI)} • {peer.streak} day streak
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {peer.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
