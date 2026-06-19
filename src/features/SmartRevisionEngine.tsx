// ============================================================================
// SMART REVISION ENGINE - AI-Powered Spaced Repetition System
// ============================================================================
// Revolutionary Features:
// 1. Ebbinghaus Forgetting Curve - Scientific spaced repetition
// 2. Leitner System - Adaptive flashcard scheduling
// 3. Active Recall Testing - Force memory retrieval
// 4. Interleaved Practice - Mix subjects for better retention
// 5. Confidence-based repetition - Smart difficulty adjustment
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { Brain, Calendar, Zap, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface RevisionItem {
  id: string;
  topic: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  confidenceLevel: number; // 1-5
  masteryLevel: number; // 0-100
  box: number; // Leitner box (1-5)
  timeSpent: number; // seconds
  correctAnswers: number;
  totalAttempts: number;
}

interface RevisionSession {
  date: Date;
  itemsReviewed: number;
  avgConfidence: number;
  totalTime: number;
  subjects: string[];
}

export default function SmartRevisionEngine({ studentId, subjects }: {
  studentId: string;
  subjects: string[];
}) {
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>([]);
  const [todaysDue, setTodaysDue] = useState<RevisionItem[]>([]);
  const [currentItem, setCurrentItem] = useState<RevisionItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    mastered: 0,
    needsWork: 0,
    timeSpent: 0
  });

  // ============================================================================
  // 1. EBBINGHAUS FORGETTING CURVE - OPTIMAL SPACING
  // ============================================================================

  /**
   * Calculate next review date based on Ebbinghaus forgetting curve
   * Intervals: 1 day → 3 days → 7 days → 14 days → 30 days → 90 days
   */
  const calculateNextReview = (
    reviewCount: number, 
    confidenceLevel: number,
    performance: 'forgot' | 'hard' | 'good' | 'easy'
  ): Date => {
    const now = new Date();
    let intervalDays = 1;

    // Base intervals based on review count
    const baseIntervals = [1, 3, 7, 14, 30, 90];
    
    // Adjust based on performance
    const performanceMultiplier = {
      'forgot': 0.5,    // Review sooner
      'hard': 0.75,     // Slightly sooner
      'good': 1.0,      // On schedule
      'easy': 1.5       // Can wait longer
    };

    // Adjust based on confidence (1-5)
    const confidenceMultiplier = confidenceLevel / 3; // Higher confidence = longer interval

    // Calculate interval
    const baseInterval = baseIntervals[Math.min(reviewCount, baseIntervals.length - 1)];
    intervalDays = Math.round(
      baseInterval * 
      performanceMultiplier[performance] * 
      confidenceMultiplier
    );

    // Minimum 1 day, maximum 90 days
    intervalDays = Math.max(1, Math.min(90, intervalDays));

    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + intervalDays);
    
    return nextReview;
  };

  // ============================================================================
  // 2. LEITNER SYSTEM - BOX-BASED SCHEDULING
  // ============================================================================

  /**
   * Move items between Leitner boxes based on performance
   * Box 1: Daily review (weak concepts)
   * Box 2: Every 2 days
   * Box 3: Every 4 days
   * Box 4: Every 7 days
   * Box 5: Every 14 days (mastered)
   */
  const moveLeitnerBox = (
    item: RevisionItem, 
    correct: boolean
  ): RevisionItem => {
    let newBox = item.box;
    
    if (correct) {
      // Move to next box (promote)
      newBox = Math.min(5, item.box + 1);
    } else {
      // Move back to box 1 (demote)
      newBox = 1;
    }

    // Calculate next review based on box
    const boxIntervals = [1, 2, 4, 7, 14]; // days
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + boxIntervals[newBox - 1]);

    return {
      ...item,
      box: newBox,
      nextReview,
      reviewCount: item.reviewCount + 1,
      masteryLevel: calculateMasteryLevel(item, correct)
    };
  };

  const calculateMasteryLevel = (item: RevisionItem, correct: boolean): number => {
    const newCorrect = item.correctAnswers + (correct ? 1 : 0);
    const newTotal = item.totalAttempts + 1;
    
    // Mastery = (% correct) * (review consistency bonus)
    const accuracyScore = (newCorrect / newTotal) * 100;
    const consistencyBonus = Math.min(20, item.reviewCount * 2); // Max 20 bonus
    
    return Math.min(100, accuracyScore + consistencyBonus);
  };

  // ============================================================================
  // 3. ACTIVE RECALL TESTING
  // ============================================================================

  const ActiveRecallCard = ({ item }: { item: RevisionItem }) => {
    const [selectedConfidence, setSelectedConfidence] = useState<number>(3);

    const handleReveal = () => {
      setShowAnswer(true);
    };

    const handleResponse = (performance: 'forgot' | 'hard' | 'good' | 'easy') => {
      const correct = performance !== 'forgot';
      
      // Update item using Leitner system
      const updatedItem = moveLeitnerBox(item, correct);
      
      // Calculate next review using Ebbinghaus curve
      updatedItem.nextReview = calculateNextReview(
        updatedItem.reviewCount,
        selectedConfidence,
        performance
      );
      
      updatedItem.confidenceLevel = selectedConfidence;
      updatedItem.lastReviewed = new Date();

      // Update state
      updateRevisionItem(updatedItem);
      
      // Move to next card
      moveToNextCard();
      setShowAnswer(false);
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        mastered: correct ? prev.mastered + 1 : prev.mastered,
        needsWork: !correct ? prev.needsWork + 1 : prev.needsWork
      }));
    };

    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {item.difficulty}
            </div>
            <div className="text-sm text-gray-600">{item.subject}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">Box {item.box}/5</div>
            <div className={`w-3 h-3 rounded-full ${
              item.box === 5 ? 'bg-green-500' :
              item.box >= 3 ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📚 {item.topic}
          </h3>
          
          {!showAnswer ? (
            <div className="bg-purple-50 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
              <button
                onClick={handleReveal}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                🧠 Try to Recall → Click to Reveal
              </button>
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-6 min-h-[200px]">
              <div className="text-gray-800 mb-4">
                {/* This would be the actual answer/explanation */}
                <p className="font-medium mb-2">Key Concepts:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Main concept explanation...</li>
                  <li>Important formula or rule...</li>
                  <li>Common mistake to avoid...</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {showAnswer && (
          <>
            {/* Confidence Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How confident are you?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedConfidence(level)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedConfidence === level
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not at all</span>
                <span>Very confident</span>
              </div>
            </div>

            {/* Response Buttons */}
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => handleResponse('forgot')}
                className="py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all"
              >
                😰 Forgot
              </button>
              <button
                onClick={() => handleResponse('hard')}
                className="py-3 bg-yellow-100 text-yellow-700 rounded-xl font-medium hover:bg-yellow-200 transition-all"
              >
                😅 Hard
              </button>
              <button
                onClick={() => handleResponse('good')}
                className="py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all"
              >
                😊 Good
              </button>
              <button
                onClick={() => handleResponse('easy')}
                className="py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-all"
              >
                😎 Easy
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
              Next review in: {calculateNextReviewText(selectedConfidence, 'good')}
            </div>
          </>
        )}

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Mastery Level</span>
            <span className="font-semibold">{item.masteryLevel}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${item.masteryLevel}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 4. INTERLEAVED PRACTICE - SUBJECT MIXING
  // ============================================================================

  /**
   * Mix subjects to improve long-term retention
   * Don't review same subject consecutively
   */
  const generateInterleavedQueue = (items: RevisionItem[]): RevisionItem[] => {
    const itemsBySubject = items.reduce((acc, item) => {
      if (!acc[item.subject]) acc[item.subject] = [];
      acc[item.subject].push(item);
      return acc;
    }, {} as Record<string, RevisionItem[]>);

    const interleaved: RevisionItem[] = [];
    const subjects = Object.keys(itemsBySubject);
    let maxLength = Math.max(...Object.values(itemsBySubject).map(arr => arr.length));

    // Round-robin selection from different subjects
    for (let i = 0; i < maxLength; i++) {
      for (const subject of subjects) {
        if (itemsBySubject[subject][i]) {
          interleaved.push(itemsBySubject[subject][i]);
        }
      }
    }

    return interleaved;
  };

  // ============================================================================
  // 5. SMART DUE DATE CALCULATION
  // ============================================================================

  const loadTodaysDue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueItems = revisionItems.filter(item => {
      const reviewDate = new Date(item.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    });

    // Apply interleaved practice
    const interleaved = generateInterleavedQueue(dueItems);
    setTodaysDue(interleaved);
    
    if (interleaved.length > 0) {
      setCurrentItem(interleaved[0]);
    }
  };

  const moveToNextCard = () => {
    const currentIndex = todaysDue.findIndex(item => item.id === currentItem?.id);
    if (currentIndex < todaysDue.length - 1) {
      setCurrentItem(todaysDue[currentIndex + 1]);
    } else {
      setCurrentItem(null); // Session complete
    }
  };

  const updateRevisionItem = (updatedItem: RevisionItem) => {
    setRevisionItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const calculateNextReviewText = (confidence: number, performance: string): string => {
    // Simplified calculation for display
    const days = {
      'forgot': 1,
      'hard': confidence === 5 ? 2 : 1,
      'good': confidence >= 4 ? 7 : 3,
      'easy': confidence === 5 ? 14 : 7
    }[performance] || 1;

    return days === 1 ? 'Tomorrow' : `${days} days`;
  };

  // Initialize
  useEffect(() => {
    loadTodaysDue();
  }, [revisionItems]);

  // ============================================================================
  // UI COMPONENT
  // ============================================================================

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Due Today</div>
          <div className="text-3xl font-bold">{todaysDue.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Mastered</div>
          <div className="text-3xl font-bold">{sessionStats.mastered}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Needs Work</div>
          <div className="text-3xl font-bold">{sessionStats.needsWork}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Reviewed</div>
          <div className="text-3xl font-bold">{sessionStats.reviewed}</div>
        </div>
      </div>

      {/* Main Card Area */}
      {currentItem ? (
        <ActiveRecallCard item={currentItem} />
      ) : todaysDue.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            🎉 All Caught Up!
          </h3>
          <p className="text-gray-600 mb-6">
            You've reviewed all items due today. Great job!
          </p>
          <button className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all">
            Preview Tomorrow's Topics
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Session Complete! 🎊
          </h3>
          <p className="text-gray-600 mb-6">
            You've reviewed {sessionStats.reviewed} topics today.
            Your brain is building long-term memories!
          </p>
          
          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <div className="text-sm text-gray-600 mb-3">Today's Performance</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mastered</span>
                <span className="font-semibold text-green-600">
                  {sessionStats.mastered} / {sessionStats.reviewed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Accuracy</span>
                <span className="font-semibold text-purple-600">
                  {sessionStats.reviewed > 0 
                    ? Math.round((sessionStats.mastered / sessionStats.reviewed) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Upcoming Reviews Calendar */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Upcoming Reviews
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const dueCount = revisionItems.filter(item => {
              const reviewDate = new Date(item.nextReview);
              return reviewDate.toDateString() === date.toDateString();
            }).length;

            return (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-600 mb-1">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`rounded-lg p-2 ${
                  dueCount > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-400'
                }`}>
                  <div className="text-xs">{date.getDate()}</div>
                  {dueCount > 0 && (
                    <div className="text-xs font-bold">{dueCount}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
