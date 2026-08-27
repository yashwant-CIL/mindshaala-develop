import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';

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

// Rich Mock datasets containing 10+ entries per feature tab
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
    },
    {
      rank: 4,
      id: 'usr-c4',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      school: 'P.S. Senior Sec School',
      city: 'Chennai',
      activityTitle: 'Organic Chemistry Sprint',
      score: 930,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '93%',
      timeSpent: '20m 15s',
      xpEarned: 1700,
      badges: ['Chem Master'],
      streakDays: 9
    },
    {
      rank: 5,
      id: 'usr-c5',
      name: 'Kabir Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      school: 'St. Xavier High School',
      city: 'Kolkata',
      activityTitle: 'All India Coding League',
      score: 920,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '92%',
      timeSpent: '20m 40s',
      xpEarned: 1600,
      badges: ['Algo Ace'],
      streakDays: 7
    },
    {
      rank: 6,
      id: 'usr-c6',
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      school: 'Hyderabad Public School',
      city: 'Hyderabad',
      activityTitle: 'National Math Speed Cup',
      score: 915,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '91.5%',
      timeSpent: '21m 00s',
      xpEarned: 1550,
      badges: ['Math Genius'],
      streakDays: 6
    },
    {
      rank: 7,
      id: 'usr-c7',
      name: 'Aditya Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      school: 'Zydus School of Excellence',
      city: 'Ahmedabad',
      activityTitle: 'Physics Mechanics Champ',
      score: 910,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '91%',
      timeSpent: '21m 15s',
      xpEarned: 1500,
      badges: ['Kinematics Pro'],
      streakDays: 5
    },
    {
      rank: 8,
      id: 'usr-c8',
      name: 'Drishya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Chinmaya Vidyalaya',
      city: 'Kochi',
      activityTitle: 'Organic Chemistry Sprint',
      score: 905,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '90.5%',
      timeSpent: '21m 30s',
      xpEarned: 1450,
      badges: ['Reagent Star'],
      streakDays: 8
    },
    {
      rank: 9,
      id: 'usr-c9',
      name: 'Kavya Singhania',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      school: 'Modern School Barakhamba',
      city: 'New Delhi',
      activityTitle: 'All India Coding League',
      score: 900,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '90%',
      timeSpent: '21m 45s',
      xpEarned: 1400,
      badges: ['Logic Master'],
      streakDays: 10
    },
    {
      rank: 10,
      id: 'usr-c10',
      name: 'Siddharth Joshi',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      school: 'The Heritage School',
      city: 'Gurugram',
      activityTitle: 'National Math Speed Cup',
      score: 895,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '89.5%',
      timeSpent: '22m 00s',
      xpEarned: 1350,
      badges: ['Top 10 Achiever'],
      streakDays: 4
    },
    // User is outside Top 10 at Rank 14 -> Appended at 11th position in table!
    {
      rank: 14,
      id: 'usr-current',
      name: 'Yashwant (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Checkers Innovation Lab',
      city: 'Indore',
      activityTitle: 'National Math Speed Cup',
      score: 885,
      maxScore: 1000,
      metricLabel: 'Accuracy',
      metricValue: '88.5%',
      timeSpent: '22m 30s',
      xpEarned: 1250,
      badges: ['Rising Star', 'STEM Pioneer'],
      isCurrentUser: true,
      streakDays: 7
    }
  ],

  'viva-prep': [
    {
      rank: 1,
      id: 'usr-v1',
      name: 'Drishya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Chinmaya Vidyalaya',
      city: 'Kochi',
      activityTitle: 'Physics Electrostatics Oral Viva',
      score: 99,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '99% Fluency',
      timeSpent: '12m 15s',
      xpEarned: 2400,
      badges: ['Orator Star', 'Viva Ace'],
      streakDays: 12
    },
    {
      rank: 2,
      id: 'usr-v2',
      name: 'Kavya Singhania',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      school: 'Modern School Barakhamba',
      city: 'New Delhi',
      activityTitle: 'Chemistry Coordination Compounds',
      score: 97,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '97% Fluency',
      timeSpent: '14m 00s',
      xpEarned: 2050,
      badges: ['Eloquent Voice'],
      streakDays: 9
    },
    {
      rank: 3,
      id: 'usr-v3',
      name: 'Siddharth Joshi',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      school: 'The Heritage School',
      city: 'Gurugram',
      activityTitle: 'Biology Genetics & DNA Viva',
      score: 95,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '95% Fluency',
      timeSpent: '13m 45s',
      xpEarned: 1850,
      badges: ['Bio Speaker'],
      streakDays: 10
    },
    // In Viva Prep, User is inside Top 10 at Rank 4
    {
      rank: 4,
      id: 'usr-current',
      name: 'Yashwant (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Checkers Innovation Lab',
      city: 'Indore',
      activityTitle: 'Physics Magnetism Viva',
      score: 93,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '93% Fluency',
      timeSpent: '15m 10s',
      xpEarned: 1600,
      badges: ['Viva Practitioner'],
      isCurrentUser: true,
      streakDays: 7
    },
    {
      rank: 5,
      id: 'usr-v5',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      school: 'DPS R.K. Puram',
      city: 'New Delhi',
      activityTitle: 'Mathematics Calculus Viva',
      score: 92,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '92% Fluency',
      timeSpent: '15m 30s',
      xpEarned: 1500,
      badges: ['Fluent Speaker'],
      streakDays: 8
    },
    {
      rank: 6,
      id: 'usr-v6',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      school: 'National Public School',
      city: 'Bengaluru',
      activityTitle: 'Computer Science Logic Viva',
      score: 91,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '91% Fluency',
      timeSpent: '15m 45s',
      xpEarned: 1450,
      badges: ['Logic Communicator'],
      streakDays: 7
    },
    {
      rank: 7,
      id: 'usr-v7',
      name: 'Rohan Gupta',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      school: 'DAV Public School',
      city: 'Mumbai',
      activityTitle: 'Chemistry Organic Viva',
      score: 90,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '90% Fluency',
      timeSpent: '16m 00s',
      xpEarned: 1400,
      badges: ['Chem Speaker'],
      streakDays: 6
    },
    {
      rank: 8,
      id: 'usr-v8',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      school: 'P.S. Senior Sec School',
      city: 'Chennai',
      activityTitle: 'Physics Wave Optics Viva',
      score: 89,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '89% Fluency',
      timeSpent: '16m 15s',
      xpEarned: 1350,
      badges: ['Optics Viva Pro'],
      streakDays: 5
    },
    {
      rank: 9,
      id: 'usr-v9',
      name: 'Kabir Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      school: 'St. Xavier High School',
      city: 'Kolkata',
      activityTitle: 'Mathematics Algebra Viva',
      score: 88,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '88% Fluency',
      timeSpent: '16m 30s',
      xpEarned: 1300,
      badges: ['Algebra Viva Star'],
      streakDays: 4
    },
    {
      rank: 10,
      id: 'usr-v10',
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      school: 'Hyderabad Public School',
      city: 'Hyderabad',
      activityTitle: 'Biology Human Physiology',
      score: 87,
      maxScore: 100,
      metricLabel: 'Voice Fluency',
      metricValue: '87% Fluency',
      timeSpent: '16m 45s',
      xpEarned: 1250,
      badges: ['Physiology Speaker'],
      streakDays: 3
    }
  ],

  'ai-tutor': [
    {
      rank: 1,
      id: 'usr-a1',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      school: 'National Public School',
      city: 'Bengaluru',
      activityTitle: 'AI Calculus Companion Sessions',
      score: 995,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '99.5% Mastered',
      timeSpent: '45m 00s',
      xpEarned: 3100,
      badges: ['AI Enthusiast', 'Concept Guru'],
      streakDays: 21
    },
    {
      rank: 2,
      id: 'usr-a2',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      school: 'DPS R.K. Puram',
      city: 'New Delhi',
      activityTitle: 'AI Physics Problem Solver',
      score: 980,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '98% Mastered',
      timeSpent: '40m 30s',
      xpEarned: 2800,
      badges: ['Active Learner'],
      streakDays: 16
    },
    {
      rank: 3,
      id: 'usr-a3',
      name: 'Rohan Gupta',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      school: 'DAV Public School',
      city: 'Mumbai',
      activityTitle: 'AI Chemistry Predictor',
      score: 970,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '97% Mastered',
      timeSpent: '42m 10s',
      xpEarned: 2600,
      badges: ['AI Scholar'],
      streakDays: 14
    },
    {
      rank: 4,
      id: 'usr-a4',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      school: 'P.S. Senior Sec School',
      city: 'Chennai',
      activityTitle: 'AI Biology Tutor',
      score: 960,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '96% Mastered',
      timeSpent: '39m 00s',
      xpEarned: 2450,
      badges: ['Bio Explorer'],
      streakDays: 12
    },
    {
      rank: 5,
      id: 'usr-a5',
      name: 'Kabir Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      school: 'St. Xavier High School',
      city: 'Kolkata',
      activityTitle: 'AI Python Tutor',
      score: 955,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '95.5% Mastered',
      timeSpent: '41m 20s',
      xpEarned: 2400,
      badges: ['Code Tutor Pro'],
      streakDays: 10
    },
    {
      rank: 6,
      id: 'usr-a6',
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      school: 'Hyderabad Public School',
      city: 'Hyderabad',
      activityTitle: 'AI Geometry Master',
      score: 950,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '95% Mastered',
      timeSpent: '37m 45s',
      xpEarned: 2350,
      badges: ['Geometry Ace'],
      streakDays: 9
    },
    {
      rank: 7,
      id: 'usr-a7',
      name: 'Aditya Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      school: 'Zydus School of Excellence',
      city: 'Ahmedabad',
      activityTitle: 'AI Thermodynamics Tutor',
      score: 945,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '94.5% Mastered',
      timeSpent: '36m 10s',
      xpEarned: 2300,
      badges: ['Thermo Master'],
      streakDays: 8
    },
    {
      rank: 8,
      id: 'usr-a8',
      name: 'Drishya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Chinmaya Vidyalaya',
      city: 'Kochi',
      activityTitle: 'AI Optics Companion',
      score: 940,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '94% Mastered',
      timeSpent: '35m 50s',
      xpEarned: 2250,
      badges: ['Light Ray Expert'],
      streakDays: 7
    },
    {
      rank: 9,
      id: 'usr-a9',
      name: 'Kavya Singhania',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      school: 'Modern School Barakhamba',
      city: 'New Delhi',
      activityTitle: 'AI Trigonometry Solver',
      score: 935,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '93.5% Mastered',
      timeSpent: '34m 30s',
      xpEarned: 2200,
      badges: ['Trigo Wizard'],
      streakDays: 6
    },
    {
      rank: 10,
      id: 'usr-a10',
      name: 'Siddharth Joshi',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      school: 'The Heritage School',
      city: 'Gurugram',
      activityTitle: 'AI Electrochemistry Tutor',
      score: 930,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '93% Mastered',
      timeSpent: '33m 15s',
      xpEarned: 2150,
      badges: ['Cell Chem Pro'],
      streakDays: 5
    },
    // User is outside Top 10 at Rank 12 -> Appended at 11th position in table!
    {
      rank: 12,
      id: 'usr-current',
      name: 'Yashwant (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Checkers Innovation Lab',
      city: 'Indore',
      activityTitle: 'AI Organic Reaction Tutor',
      score: 920,
      maxScore: 1000,
      metricLabel: 'Concept Clarity',
      metricValue: '92% Mastered',
      timeSpent: '38m 20s',
      xpEarned: 2000,
      badges: ['AI Power User', 'Curious Mind'],
      isCurrentUser: true,
      streakDays: 7
    }
  ],

  assessments: [
    {
      rank: 1,
      id: 'usr-ass1',
      name: 'Rohan Gupta',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      school: 'DAV Public School',
      city: 'Mumbai',
      activityTitle: 'Full Mock Assessment #4',
      score: 356,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '98.8%',
      timeSpent: '2h 10m',
      xpEarned: 3500,
      badges: ['Mock Topper', '100% Accuracy'],
      streakDays: 15
    },
    // In Assessments, User is inside Top 10 at Rank 2
    {
      rank: 2,
      id: 'usr-current',
      name: 'Yashwant (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Checkers Innovation Lab',
      city: 'Indore',
      activityTitle: 'Physics & Chemistry Chapter Test',
      score: 342,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '95.0%',
      timeSpent: '2h 15m',
      xpEarned: 2900,
      badges: ['Test Series Pro'],
      isCurrentUser: true,
      streakDays: 7
    },
    {
      rank: 3,
      id: 'usr-ass3',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      school: 'P.S. Senior Sec School',
      city: 'Chennai',
      activityTitle: 'Mathematics Chapter Test',
      score: 338,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '93.8%',
      timeSpent: '2h 20m',
      xpEarned: 2700,
      badges: ['Consistent Performer'],
      streakDays: 8
    },
    {
      rank: 4,
      id: 'usr-ass4',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      school: 'DPS R.K. Puram',
      city: 'New Delhi',
      activityTitle: 'Physics Electrostatics Test',
      score: 335,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '93.0%',
      timeSpent: '2h 22m',
      xpEarned: 2600,
      badges: ['Physics Test Pro'],
      streakDays: 10
    },
    {
      rank: 5,
      id: 'usr-ass5',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      school: 'National Public School',
      city: 'Bengaluru',
      activityTitle: 'Computer Science Test',
      score: 330,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '91.6%',
      timeSpent: '2h 25m',
      xpEarned: 2500,
      badges: ['Code Tester'],
      streakDays: 9
    },
    {
      rank: 6,
      id: 'usr-ass6',
      name: 'Kabir Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      school: 'St. Xavier High School',
      city: 'Kolkata',
      activityTitle: 'Chemistry Organic Test',
      score: 325,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '90.2%',
      timeSpent: '2h 28m',
      xpEarned: 2400,
      badges: ['Organic Tester'],
      streakDays: 7
    },
    {
      rank: 7,
      id: 'usr-ass7',
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      school: 'Hyderabad Public School',
      city: 'Hyderabad',
      activityTitle: 'Mathematics Algebra Test',
      score: 320,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '88.8%',
      timeSpent: '2h 30m',
      xpEarned: 2300,
      badges: ['Math Tester'],
      streakDays: 6
    },
    {
      rank: 8,
      id: 'usr-ass8',
      name: 'Aditya Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      school: 'Zydus School of Excellence',
      city: 'Ahmedabad',
      activityTitle: 'Physics Magnetism Test',
      score: 315,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '87.5%',
      timeSpent: '2h 32m',
      xpEarned: 2200,
      badges: ['Physics Test Ace'],
      streakDays: 5
    },
    {
      rank: 9,
      id: 'usr-ass9',
      name: 'Drishya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Chinmaya Vidyalaya',
      city: 'Kochi',
      activityTitle: 'Biology Genetics Test',
      score: 310,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '86.1%',
      timeSpent: '2h 35m',
      xpEarned: 2100,
      badges: ['Bio Tester'],
      streakDays: 4
    },
    {
      rank: 10,
      id: 'usr-ass10',
      name: 'Kavya Singhania',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      school: 'Modern School Barakhamba',
      city: 'New Delhi',
      activityTitle: 'Chemistry Inorganics Test',
      score: 305,
      maxScore: 360,
      metricLabel: 'Accuracy',
      metricValue: '84.7%',
      timeSpent: '2h 38m',
      xpEarned: 2000,
      badges: ['Chem Tester'],
      streakDays: 3
    }
  ],

  speakalong: [
    {
      rank: 1,
      id: 'usr-s1',
      name: 'Kavya Singhania',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      school: 'Modern School Barakhamba',
      city: 'New Delhi',
      activityTitle: 'Pronunciation & Passage Reading',
      score: 98,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '98% Native',
      timeSpent: '08m 10s',
      xpEarned: 1900,
      badges: ['Voice Maestro'],
      streakDays: 10
    },
    {
      rank: 2,
      id: 'usr-s2',
      name: 'Drishya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Chinmaya Vidyalaya',
      city: 'Kochi',
      activityTitle: 'Scientific Terminology Reading',
      score: 96,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '96% Native',
      timeSpent: '09m 00s',
      xpEarned: 1750,
      badges: ['Speech Champion'],
      streakDays: 8
    },
    {
      rank: 3,
      id: 'usr-s3',
      name: 'Siddharth Joshi',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      school: 'The Heritage School',
      city: 'Gurugram',
      activityTitle: 'Physics Recitation Challenge',
      score: 95,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '95% Native',
      timeSpent: '09m 15s',
      xpEarned: 1650,
      badges: ['Voice Champion'],
      streakDays: 7
    },
    {
      rank: 4,
      id: 'usr-s4',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      school: 'DPS R.K. Puram',
      city: 'New Delhi',
      activityTitle: 'Math Proof Voice Recitation',
      score: 94,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '94% Native',
      timeSpent: '09m 30s',
      xpEarned: 1600,
      badges: ['Clear Orator'],
      streakDays: 9
    },
    {
      rank: 5,
      id: 'usr-s5',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      school: 'National Public School',
      city: 'Bengaluru',
      activityTitle: 'CS Algorithm Explanation',
      score: 93,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '93% Native',
      timeSpent: '09m 40s',
      xpEarned: 1550,
      badges: ['Fluent Speaker'],
      streakDays: 8
    },
    {
      rank: 6,
      id: 'usr-s6',
      name: 'Rohan Gupta',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      school: 'DAV Public School',
      city: 'Mumbai',
      activityTitle: 'Chemistry Mechanism Voiceover',
      score: 92,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '92% Native',
      timeSpent: '09m 50s',
      xpEarned: 1500,
      badges: ['Speech Star'],
      streakDays: 6
    },
    {
      rank: 7,
      id: 'usr-s7',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      school: 'P.S. Senior Sec School',
      city: 'Chennai',
      activityTitle: 'Bio Nomenclature Reading',
      score: 91,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '91% Native',
      timeSpent: '10m 00s',
      xpEarned: 1450,
      badges: ['Bio Voice'],
      streakDays: 5
    },
    {
      rank: 8,
      id: 'usr-s8',
      name: 'Kabir Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      school: 'St. Xavier High School',
      city: 'Kolkata',
      activityTitle: 'Physics Formula Explanation',
      score: 90,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '90% Native',
      timeSpent: '10m 10s',
      xpEarned: 1400,
      badges: ['Formula Reader'],
      streakDays: 4
    },
    {
      rank: 9,
      id: 'usr-s9',
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      school: 'Hyderabad Public School',
      city: 'Hyderabad',
      activityTitle: 'Math Definitions Voice Test',
      score: 89,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '89% Native',
      timeSpent: '10m 20s',
      xpEarned: 1350,
      badges: ['Definitions Star'],
      streakDays: 3
    },
    {
      rank: 10,
      id: 'usr-s10',
      name: 'Aditya Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      school: 'Zydus School of Excellence',
      city: 'Ahmedabad',
      activityTitle: 'Scientific Terms Passage',
      score: 88,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '88% Native',
      timeSpent: '10m 30s',
      xpEarned: 1300,
      badges: ['Passage Speaker'],
      streakDays: 2
    },
    // User is outside Top 10 at Rank 15 -> Appended at 11th position in table!
    {
      rank: 15,
      id: 'usr-current',
      name: 'Yashwant (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Checkers Innovation Lab',
      city: 'Indore',
      activityTitle: 'Physics Concept Recitation',
      score: 85,
      maxScore: 100,
      metricLabel: 'Pronunciation',
      metricValue: '85% Native',
      timeSpent: '11m 15s',
      xpEarned: 1200,
      badges: ['Clear Speaker'],
      isCurrentUser: true,
      streakDays: 7
    }
  ],

  overall: [
    {
      rank: 1,
      id: 'usr-o1',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      school: 'DPS R.K. Puram',
      city: 'New Delhi',
      activityTitle: 'All Modules Combined',
      score: 4850,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '97.0%',
      timeSpent: '18h 40m',
      xpEarned: 14500,
      badges: ['National Rank #1', 'MindShaala Scholar'],
      streakDays: 30
    },
    {
      rank: 2,
      id: 'usr-o2',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      school: 'National Public School',
      city: 'Bengaluru',
      activityTitle: 'All Modules Combined',
      score: 4720,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '94.4%',
      timeSpent: '20h 15m',
      xpEarned: 13200,
      badges: ['Top Performer'],
      streakDays: 24
    },
    {
      rank: 3,
      id: 'usr-o3',
      name: 'Rohan Gupta',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      school: 'DAV Public School',
      city: 'Mumbai',
      activityTitle: 'All Modules Combined',
      score: 4680,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '93.6%',
      timeSpent: '19h 30m',
      xpEarned: 12800,
      badges: ['Polymath'],
      streakDays: 20
    },
    {
      rank: 4,
      id: 'usr-o4',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      school: 'P.S. Senior Sec School',
      city: 'Chennai',
      activityTitle: 'All Modules Combined',
      score: 4620,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '92.4%',
      timeSpent: '19h 50m',
      xpEarned: 12400,
      badges: ['Top 5 Scholar'],
      streakDays: 18
    },
    {
      rank: 5,
      id: 'usr-o5',
      name: 'Kabir Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      school: 'St. Xavier High School',
      city: 'Kolkata',
      activityTitle: 'All Modules Combined',
      score: 4580,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '91.6%',
      timeSpent: '20h 00m',
      xpEarned: 12000,
      badges: ['Consistent Ranker'],
      streakDays: 16
    },
    {
      rank: 6,
      id: 'usr-o6',
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      school: 'Hyderabad Public School',
      city: 'Hyderabad',
      activityTitle: 'All Modules Combined',
      score: 4520,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '90.4%',
      timeSpent: '20h 20m',
      xpEarned: 11600,
      badges: ['All Rounder'],
      streakDays: 14
    },
    {
      rank: 7,
      id: 'usr-o7',
      name: 'Aditya Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      school: 'Zydus School of Excellence',
      city: 'Ahmedabad',
      activityTitle: 'All Modules Combined',
      score: 4490,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '89.8%',
      timeSpent: '20h 35m',
      xpEarned: 11200,
      badges: ['STEM Explorer'],
      streakDays: 12
    },
    {
      rank: 8,
      id: 'usr-o8',
      name: 'Drishya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Chinmaya Vidyalaya',
      city: 'Kochi',
      activityTitle: 'All Modules Combined',
      score: 4450,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '89.0%',
      timeSpent: '20h 50m',
      xpEarned: 10800,
      badges: ['Top 10 Achiever'],
      streakDays: 10
    },
    {
      rank: 9,
      id: 'usr-o9',
      name: 'Kavya Singhania',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      school: 'Modern School Barakhamba',
      city: 'New Delhi',
      activityTitle: 'All Modules Combined',
      score: 4410,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '88.2%',
      timeSpent: '21h 05m',
      xpEarned: 10400,
      badges: ['Speech & STEM Star'],
      streakDays: 9
    },
    {
      rank: 10,
      id: 'usr-o10',
      name: 'Siddharth Joshi',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      school: 'The Heritage School',
      city: 'Gurugram',
      activityTitle: 'All Modules Combined',
      score: 4380,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '87.6%',
      timeSpent: '21m 20s',
      xpEarned: 10000,
      badges: ['National Top 10'],
      streakDays: 8
    },
    // User is outside Top 10 at Rank 18 -> Appended at 11th position in table!
    {
      rank: 18,
      id: 'usr-current',
      name: 'Yashwant (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      school: 'Checkers Innovation Lab',
      city: 'Indore',
      activityTitle: 'All Modules Combined',
      score: 4150,
      maxScore: 5000,
      metricLabel: 'Overall Mastery',
      metricValue: '83.0%',
      timeSpent: '22h 10m',
      xpEarned: 8900,
      badges: ['National Competitor'],
      isCurrentUser: true,
      streakDays: 7
    }
  ]
};

export const Leaderboard: React.FC = () => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<FeatureTabId>('competitions');
  const [timeframe, setTimeframe] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [searchQuery, setSearchQuery] = useState('');

  const currentLeaderboard = MOCK_FEATURE_LEADERBOARDS[activeFeatureTab] || MOCK_FEATURE_LEADERBOARDS.competitions;
  const currentTabInfo = FEATURE_TABS.find((t) => t.id === activeFeatureTab) || FEATURE_TABS[0];

  // Filter based on search query
  const filteredLeaderboard = currentLeaderboard.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activityTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = currentLeaderboard.filter(item => item.rank <= 3).sort((a, b) => a.rank - b.rank);
  const currentUser = currentLeaderboard.find((item) => item.isCurrentUser);

  // Function to prepare table rows: Show Top 10, and if current user is not in top 10, append current user at 11th position with actual rank!
  const getTableRows = () => {
    // If search query active, show search results
    if (searchQuery.trim() !== '') {
      return filteredLeaderboard;
    }

    // Sort all candidates by rank ascending
    const sorted = [...currentLeaderboard].sort((a, b) => a.rank - b.rank);
    const top10 = sorted.filter(item => item.rank <= 10 || sorted.indexOf(item) < 10).slice(0, 10);
    const isUserInTop10 = top10.some(item => item.isCurrentUser);

    if (isUserInTop10) {
      return top10;
    }

    // If user is NOT in top 10, append user at 11th position
    const userEntry = currentLeaderboard.find(item => item.isCurrentUser);
    if (userEntry) {
      return [...top10, userEntry];
    }

    return top10;
  };

  const tableRows = getTableRows();

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 space-y-8 font-sans">
      {/* Header Banner & Stats Overview - Light Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Hall of Fame & National Standings
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Leaderboard Arena
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Compare scores, speed precision, and performance across Competitions, Viva Prep, AI Tutor sessions, and Assessments.
          </p>
        </div>

        {/* Current User Quick Stats Bar */}
        {currentUser && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500 text-white font-black shadow-md shadow-amber-500/20 text-lg">
                #{currentUser.rank}
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">My Actual Rank ({currentTabInfo.label})</div>
                <div className="text-sm font-extrabold text-amber-700">
                  {currentUser.rank <= 10 ? 'Top 10 Nationwide' : `Rank #${currentUser.rank}`}
                </div>
              </div>
            </div>

            <div className="bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600 text-white font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">{currentUser.metricLabel}</div>
                <div className="text-sm font-black text-slate-900">{currentUser.metricValue}</div>
              </div>
            </div>

            <div className="bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-600 text-white font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">XP Earned</div>
                <div className="text-sm font-black text-emerald-600">{currentUser.xpEarned} XP</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium Showcase Section */}
      {top3.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end max-w-5xl mx-auto">
          {/* 2nd Place (Silver) */}
          <PodiumCard entry={top3[1]} place={2} />

          {/* 1st Place (Gold - Center & Elevated) */}
          <PodiumCard entry={top3[0]} place={1} />

          {/* 3rd Place (Bronze) */}
          <PodiumCard entry={top3[2]} place={3} />
        </div>
      )}

      {/* Feature Tabs Bar Just Above the Leaderboard Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Select Feature Leaderboard Category
            </h2>
            <p className="text-xs text-slate-500">Click a tab to view student standings for that specific learning module.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
            Current Category: <strong className="text-blue-900">{currentTabInfo.label}</strong>
          </span>
        </div>

        {/* Feature Tab Chips Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between gap-3 cursor-pointer group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600 group-hover:text-blue-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white text-blue-900'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <div>
                  <div className={`text-sm font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-0">
        {/* Table Sub-Header Controls */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
              <currentTabInfo.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {currentTabInfo.label} Top Rankings
                <span className="text-xs font-normal text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  Showing Top 10 {currentUser && currentUser.rank > 10 ? '+ Your Position (#11)' : ''}
                </span>
              </h3>
              <p className="text-xs text-slate-500">{currentTabInfo.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe Filter Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {(['all-time', 'monthly', 'weekly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    timeframe === tf ? 'bg-amber-500 text-white font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tf.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Attempted Activity / Topic</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Primary Metric</th>
                <th className="py-3.5 px-4 text-center">Time Spent</th>
                <th className="py-3.5 px-4 text-right">XP & Badges</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No student results found matching "{searchQuery}" in {currentTabInfo.label}.
                  </td>
                </tr>
              ) : (
                tableRows.map((student, idx) => {
                  const is11thPositionOutsideTop10 = student.isCurrentUser && student.rank > 10;

                  return (
                    <React.Fragment key={student.id}>
                      {/* Divider separator when 11th row is outside top 10 */}
                      {is11thPositionOutsideTop10 && !searchQuery && (
                        <tr className="bg-indigo-50/50">
                          <td colSpan={7} className="py-2 px-4 text-center text-xs font-semibold text-indigo-600 border-t-2 border-b-2 border-indigo-200">
                            • • • Your Personal Standing Below • • •
                          </td>
                        </tr>
                      )}

                      <tr
                        className={`transition-colors ${
                          student.isCurrentUser
                            ? 'bg-blue-50/90 hover:bg-blue-100 font-semibold border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Rank Column */}
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
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                            />
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
                          </div>
                        </td>

                        {/* Activity Title */}
                        <td className="py-4 px-4 text-slate-700 text-xs font-medium">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block">
                            {student.activityTitle}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-4 text-center font-extrabold text-amber-600">
                          {student.score}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">/ {student.maxScore}</span>
                        </td>

                        {/* Primary Metric (e.g. Accuracy, Fluency, Clarity) */}
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
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-Component: Podium Card for 1st, 2nd, 3rd places
const PodiumCard: React.FC<{ entry: LeaderboardEntry; place: 1 | 2 | 3 }> = ({ entry, place }) => {
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

      {/* Avatar with Glow */}
      <div className="relative mt-2">
        <div
          className={`w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-4 overflow-hidden shadow-sm ${
            isFirst
              ? 'border-amber-400 shadow-amber-400/30'
              : isSecond
              ? 'border-slate-300'
              : 'border-amber-600'
          }`}
        >
          <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover rounded-full" />
        </div>
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-black uppercase text-slate-950 ${
            isFirst ? 'bg-amber-400' : isSecond ? 'bg-slate-300' : 'bg-amber-600 text-white'
          }`}
        >
          #{place}
        </div>
      </div>

      {/* Student Details */}
      <div className="space-y-1 w-full pt-1">
        <h3 className="text-base font-bold text-slate-900 truncate">{entry.name}</h3>
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
