// ============================================================================
// DIAGNOSTIC ASSESSMENT - TYPES & INTERFACES
// ============================================================================

export interface TestSession {
  sessionId: string;
  studentId: string;
  startTime: number;
  currentLayerId: 1 | 2 | 3 | 4;
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  layerScores: LayerScores;
  isPaused: boolean;
  timeSpent: number;
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // seconds
  confidence?: 'sure' | 'unsure';
  flaggedForReview: boolean;
  attemptedAt: number;
}

export interface LayerScores {
  layer1?: LayerScore;
  layer2?: LayerScore;
  layer3?: LayerScore;
  layer4?: LayerScore;
}

export interface LayerScore {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number; // 0-100
  timeSpent: number;
  categoryBreakdown: CategoryScore[];
}

export interface CategoryScore {
  category: string;
  subcategory: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface AssessmentResult {
  sessionId: string;
  studentId: string;
  completedAt: number;
  totalTimeSpent: number;
  
  // Layer-wise results
  layer1: LayerResult;
  layer2: LayerResult;
  layer3: LayerResult;
  layer4: LayerResult;
  
  // Overall metrics
  overallScore: number;
  topperPotentialIndex: number; // TPI
  band: 'A' | 'B' | 'C' | 'D' | 'E';
  classification: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  
  // Analysis
  strengths: string[];
  weaknesses: string[];
  gaps: GapAnalysis[];
  recommendations: Recommendation[];
  
  // Predictions
  predictions: PredictiveAnalytics;
}

export interface LayerResult {
  layerId: number;
  layerName: string;
  score: number;
  grade: string;
  timeTaken: number;
  accuracy: number;
  speedScore: number;
  categoryScores: CategoryScore[];
  insights: string[];
}

export interface GapAnalysis {
  subject: string;
  topic: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  prerequisiteClass: string;
  remedialAction: string;
  estimatedTime: string;
}

export interface Recommendation {
  type: 'immediate' | 'short-term' | 'long-term';
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  rationale: string;
}

export interface PredictiveAnalytics {
  currentTrajectory: string;
  expectedScore4Weeks: number;
  expectedBoardScore: {
    min: number;
    max: number;
  };
  timeToAchieve90Percent: string;
  distinctionProbability: number;
  topperProbability: number;
  criticalFactors: string[];
}

// Adaptive Testing
export interface AdaptiveTestingConfig {
  enableAdaptive: boolean;
  performanceThreshold: number;
  maxExtraQuestionsPerCategory: number;
  minCorrectToSkip: number;
}

// Scoring Weights
export const scoringWeights = {
  layer1: 0.20, // Cognitive = 20%
  layer2: 0.40, // Foundation = 40%
  layer3: 0.25, // Class 10 Readiness = 25%
  layer4: 0.15  // Mindset = 15%
};

// Band Classification Thresholds
export const bandThresholds = {
  A: { minScore: 85, minMindset: 80, description: 'Topper-Ready' },
  B: { minScore: 75, minCognitive: 70, description: 'Strong but Inconsistent' },
  C: { minScore: 60, description: 'Average with Gaps' },
  D: { minScore: 40, description: 'Weak Fundamentals' },
  E: { minScore: 0, description: 'Critical Foundation Deficit' }
};

// Topper Potential Classification
export const topperPotentialThresholds = {
  T1: { minTPI: 85, description: 'Topper-ready' },
  T2: { minTPI: 75, description: 'Can become topper with guided plan' },
  T3: { minTPI: 60, description: 'Can reach 85-90% with systematic work' },
  T4: { minTPI: 45, description: 'Needs 3-6 months foundation rebuilding' },
  T5: { minTPI: 0, description: 'High-risk requiring long-term support' }
};
