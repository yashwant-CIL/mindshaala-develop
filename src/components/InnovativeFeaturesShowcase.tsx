// ============================================================================
// INNOVATIVE FEATURES SHOWCASE
// ============================================================================
// Demonstration of all 4 revolutionary topper-creation features
// ============================================================================

'use client';

import { useState } from 'react';
import { Brain, Calendar, Trophy, Users, ArrowLeft } from 'lucide-react';

// Import the innovative features
import AIStudyCompanion from '../features/AIStudyCompanion';
import SmartRevisionEngine from '../features/SmartRevisionEngine';
import ExamSimulatorPro from '../features/ExamSimulatorPro';
import PeerLearningNetwork from '../features/PeerLearningNetwork';

type FeatureView = 'menu' | 'ai-companion' | 'revision' | 'exam-sim' | 'peer-network';

export default function InnovativeFeaturesShowcase() {
  const [currentView, setCurrentView] = useState<FeatureView>('menu');

  // Mock user data
  const mockUser = {
    id: 'student_001',
    name: 'Aarav Sharma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aarav',
    TPI: 72,
    rank: 45,
    streak: 23,
    points: 4580,
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    status: 'studying' as const,
    studyHoursToday: 3.5
  };

  const features = [
    {
      id: 'ai-companion',
      title: 'AI Study Companion',
      description: 'Your personal topper coach with circadian rhythm scheduling, focus monitoring, and predictive analytics',
      icon: Brain,
      color: 'from-purple-500 to-blue-500',
      benefits: [
        '🧠 Circadian rhythm-based study scheduling',
        '📊 Real-time focus monitoring & alerts',
        '🔮 ML-based performance prediction',
        '⚡ Smart intervention system'
      ]
    },
    {
      id: 'revision',
      title: 'Smart Revision Engine',
      description: 'Scientific spaced repetition using Ebbinghaus curve and Leitner system for 90% retention',
      icon: Calendar,
      color: 'from-green-500 to-teal-500',
      benefits: [
        '📚 Ebbinghaus forgetting curve algorithm',
        '🗂️ Leitner 5-box adaptive system',
        '🧠 Active recall testing',
        '🔄 Interleaved practice for better retention'
      ]
    },
    {
      id: 'exam-sim',
      title: 'Exam Simulator Pro',
      description: 'Realistic board exam practice with AI proctoring, stress monitoring, and instant analytics',
      icon: Trophy,
      color: 'from-orange-500 to-red-500',
      benefits: [
        '👁️ AI proctoring & tab detection',
        '😰 Real-time stress monitoring',
        '⏱️ Time pressure simulation',
        '📊 Instant performance analytics'
      ]
    },
    {
      id: 'peer-network',
      title: 'Peer Learning Network',
      description: 'Collaborative competition with study groups, challenges, and global leaderboards',
      icon: Users,
      color: 'from-pink-500 to-rose-500',
      benefits: [
        '🤝 AI-powered study group matching',
        '💬 Peer doubt solving with rewards',
        '🏆 Competitive challenges',
        '🔥 Study streaks & leaderboards'
      ]
    }
  ];

  const renderFeatureMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className=" mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🚀 Innovative Topper Features
          </h1>
          <p className="text-xl text-gray-600">
            Experience cutting-edge, research-backed features designed to create toppers
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full font-semibold">
            <span className="text-2xl">💎</span>
            <span>Your TPI: {mockUser.TPI}/100</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer"
                onClick={() => setCurrentView(feature.id as FeatureView)}
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} p-4 mb-6`}>
                  <Icon className="w-full h-full text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>

                {/* Benefits */}
                <div className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button className={`w-full py-3 bg-gradient-to-r ${feature.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}>
                  Try It Now →
                </button>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📊 Expected Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">+183%</div>
              <div className="text-sm text-gray-600">Study Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">+350%</div>
              <div className="text-sm text-gray-600">Long-term Retention</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">-64%</div>
              <div className="text-sm text-gray-600">Exam Anxiety</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">+400%</div>
              <div className="text-sm text-gray-600">Topper Rate</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white text-center">
          <p className="text-lg font-medium">
            ✨ These features are based on proven neuroscience research and designed to transform average students into confident toppers!
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentFeature = () => {
    switch (currentView) {
      case 'ai-companion':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b sticky top-0 z-10 shadow-md">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <button
                  onClick={() => setCurrentView('menu')}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Features
                </button>
              </div>
            </div>
            <div className="max-w-6xl mx-auto p-6">
              <AIStudyCompanion studentId={mockUser.id} currentTPI={mockUser.TPI} />
            </div>
          </div>
        );

      case 'revision':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b sticky top-0 z-10 shadow-md">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <button
                  onClick={() => setCurrentView('menu')}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Features
                </button>
              </div>
            </div>
            <SmartRevisionEngine 
              studentId={mockUser.id} 
              subjects={mockUser.subjects}
            />
          </div>
        );

      case 'exam-sim':
        return (
          <div>
            <ExamSimulatorPro examType="full" duration={180} />
          </div>
        );

      case 'peer-network':
        return (
          <div className="min-h-screen bg-gray-50">
            <PeerLearningNetwork currentUser={mockUser} />
          </div>
        );

      default:
        return renderFeatureMenu();
    }
  };

  return renderCurrentFeature();
}
