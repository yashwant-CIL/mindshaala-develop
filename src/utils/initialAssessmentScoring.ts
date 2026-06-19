// ============================================================================
// INITIAL ASSESSMENT SCORING SYSTEM
// ============================================================================
// Based on 250-question diagnostic assessment for ICSE Class 10
// Implements TPI (Topper Potential Index) calculation
// ============================================================================

export interface AssessmentResponse {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeTaken?: number; // in seconds
  layerId: 1 | 2 | 3 | 4;
  category: string;
  subcategory: string;
  weightage: number;
}

export interface LikertResponse {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E';
  score: number; // 1-5
  isReversed?: boolean;
}

export interface ScoreBreakdown {
  // Part A: Cognitive Ability (40 questions, 1 mark each = 40 marks)
  cognitive: {
    total: number;
    scored: number;
    percentage: number;
    breakdown: {
      workingMemory: number;
      logicalReasoning: number;
      processingSpeed: number;
      attention: number;
    };
  };
  
  // Part B: Math Foundation (25 questions, 1 mark each = 25 marks)
  mathFoundation: {
    total: number;
    scored: number;
    percentage: number;
  };
  
  // Part C: Science Foundation (40 questions, 1 mark each = 40 marks)
  scienceFoundation: {
    total: number;
    scored: number;
    percentage: number;
    breakdown: {
      physics: number;
      chemistry: number;
      biology: number;
    };
  };
  
  // Part D: English Foundation (25 questions, 1 mark each = 25 marks)
  englishFoundation: {
    total: number;
    scored: number;
    percentage: number;
  };
  
  // Part E: History/Geography Foundation (15 questions, 1 mark each = 15 marks)
  socialFoundation: {
    total: number;
    scored: number;
    percentage: number;
    breakdown: {
      history: number;
      geography: number;
    };
  };
  
  // Part F: Class 10 Readiness (80 questions, 2 marks each = 160 marks)
  class10Readiness: {
    total: number;
    scored: number;
    percentage: number;
    breakdown: {
      math: number;        // 20 questions
      physics: number;     // 15 questions
      chemistry: number;   // 15 questions
      biology: number;     // 15 questions
      english: number;     // 15 questions
    };
  };
  
  // Part G: Psychological & Study Mindset (25 questions, Likert scale)
  mindset: {
    rawScore: number;
    percentage: number;
    breakdown: {
      consistency: number;      // 6 questions
      motivation: number;       // 5 questions
      discipline: number;       // 5 questions
      stressResilience: number; // 5 questions
      selfAwareness: number;    // 4 questions
    };
  };
}

export interface TPIResult {
  TPI: number; // 0-100
  band: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  bandLabel: string;
  
  // Main Indices (0-100)
  CI: number;  // Cognitive Index
  FMI: number; // Foundation Mastery Index
  RDI: number; // Readiness Index
  MBI: number; // Mindset & Behaviour Index
  
  // Detailed breakdown
  scoreBreakdown: ScoreBreakdown;
  
  // Recommendations
  strengths: string[];
  weaknesses: string[];
  priority: string;
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate scores for Likert-scale questions (Part G: Psychological)
 * A=5, B=4, C=3, D=2, E=1
 * Q243 (anxiety) is reverse-scored
 */
function calculateLikertScore(responses: LikertResponse[]): number {
  const scores = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'E': 1
  };
  
  let totalScore = 0;
  
  responses.forEach(response => {
    let score = scores[response.selectedOption];
    
    // Reverse scoring for anxiety/negative questions
    if (response.isReversed) {
      score = 6 - score;
    }
    
    totalScore += score;
  });
  
  return totalScore;
}

/**
 * Normalize Likert score to 0-100 scale
 */
function normalizeLikertScore(score: number, numQuestions: number): number {
  const minPossible = numQuestions * 1;
  const maxPossible = numQuestions * 5;
  return ((score - minPossible) / (maxPossible - minPossible)) * 100;
}

/**
 * Calculate Cognitive Index (CI)
 * Part A: 40 questions, 1 mark each
 */
function calculateCognitiveIndex(responses: AssessmentResponse[]): number {
  const cognitiveResponses = responses.filter(r => r.layerId === 1);
  const totalMarks = cognitiveResponses.length;
  const scoredMarks = cognitiveResponses.filter(r => r.isCorrect).length;
  
  return (scoredMarks / totalMarks) * 100;
}

/**
 * Calculate Foundation Mastery Index (FMI)
 * Weighted combination of Math, Science, English, and Social foundation
 */
function calculateFoundationIndex(responses: AssessmentResponse[]): {
  FMI: number;
  details: {
    math: number;
    science: number;
    english: number;
    social: number;
  };
} {
  // Filter foundation questions (Layer 2)
  const foundationResponses = responses.filter(r => r.layerId === 2);
  
  // Calculate individual subject scores
  const mathResponses = foundationResponses.filter(r => 
    r.category.includes('Math Foundation')
  );
  const mathScore = (mathResponses.filter(r => r.isCorrect).length / 25) * 100;
  
  const scienceResponses = foundationResponses.filter(r => 
    r.category.includes('Science Foundation') || 
    r.category.includes('Physics Foundation') ||
    r.category.includes('Chemistry Foundation') ||
    r.category.includes('Biology Foundation')
  );
  const scienceScore = (scienceResponses.filter(r => r.isCorrect).length / 40) * 100;
  
  const englishResponses = foundationResponses.filter(r => 
    r.category.includes('English Foundation')
  );
  const englishScore = (englishResponses.filter(r => r.isCorrect).length / 25) * 100;
  
  const socialResponses = foundationResponses.filter(r => 
    r.category.includes('History') || r.category.includes('Geography')
  );
  const socialScore = (socialResponses.filter(r => r.isCorrect).length / 15) * 100;
  
  // Weighted FMI calculation
  const FMI = (
    0.35 * mathScore +
    0.35 * scienceScore +
    0.20 * englishScore +
    0.10 * socialScore
  );
  
  return {
    FMI,
    details: {
      math: mathScore,
      science: scienceScore,
      english: englishScore,
      social: socialScore
    }
  };
}

/**
 * Calculate Class 10 Readiness Index (RDI)
 * Part F: 80 questions, 2 marks each = 160 marks
 */
function calculateReadinessIndex(responses: AssessmentResponse[]): {
  RDI: number;
  details: {
    math: number;
    physics: number;
    chemistry: number;
    biology: number;
    english: number;
  };
} {
  // Filter Class 10 readiness questions (Layer 3)
  const readinessResponses = responses.filter(r => r.layerId === 3);
  
  // Calculate individual subject scores (each question worth 2 marks)
  const mathResponses = readinessResponses.filter(r => 
    r.category.includes('Math Readiness')
  );
  const mathScore = (mathResponses.filter(r => r.isCorrect).length / 20) * 100;
  
  const physicsResponses = readinessResponses.filter(r => 
    r.category.includes('Physics Readiness')
  );
  const physicsScore = (physicsResponses.filter(r => r.isCorrect).length / 15) * 100;
  
  const chemistryResponses = readinessResponses.filter(r => 
    r.category.includes('Chemistry Readiness')
  );
  const chemistryScore = (chemistryResponses.filter(r => r.isCorrect).length / 15) * 100;
  
  const biologyResponses = readinessResponses.filter(r => 
    r.category.includes('Biology Readiness')
  );
  const biologyScore = (biologyResponses.filter(r => r.isCorrect).length / 15) * 100;
  
  const englishResponses = readinessResponses.filter(r => 
    r.category.includes('English Readiness')
  );
  const englishScore = (englishResponses.filter(r => r.isCorrect).length / 15) * 100;
  
  // Weighted RDI calculation
  const RDI = (
    0.30 * mathScore +
    0.20 * physicsScore +
    0.20 * chemistryScore +
    0.20 * biologyScore +
    0.10 * englishScore
  );
  
  return {
    RDI,
    details: {
      math: mathScore,
      physics: physicsScore,
      chemistry: chemistryScore,
      biology: biologyScore,
      english: englishScore
    }
  };
}

/**
 * Calculate Mindset & Behaviour Index (MBI)
 * Part G: 25 Likert-scale questions
 */
function calculateMindsetIndex(likertResponses: LikertResponse[]): {
  MBI: number;
  details: {
    consistency: number;
    motivation: number;
    discipline: number;
    stressResilience: number;
    selfAwareness: number;
  };
} {
  // Filter by question ID ranges
  const consistencyResponses = likertResponses.filter(r => 
    ['L4_PSY_11', 'L4_PSY_12', 'L4_PSY_13', 'L4_PSY_14', 'L4_PSY_15', 'L4_PSY_16'].includes(r.questionId)
  );
  const consistencyScore = normalizeLikertScore(
    calculateLikertScore(consistencyResponses), 
    6
  );
  
  const motivationResponses = likertResponses.filter(r => 
    ['L4_PSY_17', 'L4_PSY_18', 'L4_PSY_19', 'L4_PSY_20', 'L4_PSY_21'].includes(r.questionId)
  );
  const motivationScore = normalizeLikertScore(
    calculateLikertScore(motivationResponses), 
    5
  );
  
  const disciplineResponses = likertResponses.filter(r => 
    ['L4_PSY_22', 'L4_PSY_23', 'L4_PSY_24', 'L4_PSY_25', 'L4_PSY_26'].includes(r.questionId)
  );
  const disciplineScore = normalizeLikertScore(
    calculateLikertScore(disciplineResponses), 
    5
  );
  
  const stressResponses = likertResponses.filter(r => 
    ['L4_PSY_27', 'L4_PSY_28', 'L4_PSY_29', 'L4_PSY_30', 'L4_PSY_31'].includes(r.questionId)
  );
  // Mark L4_PSY_27 as reversed (anxiety question)
  stressResponses.forEach(r => {
    if (r.questionId === 'L4_PSY_27') r.isReversed = true;
  });
  const stressScore = normalizeLikertScore(
    calculateLikertScore(stressResponses), 
    5
  );
  
  const awarenessResponses = likertResponses.filter(r => 
    ['L4_PSY_32', 'L4_PSY_33', 'L4_PSY_34', 'L4_PSY_35'].includes(r.questionId)
  );
  const awarenessScore = normalizeLikertScore(
    calculateLikertScore(awarenessResponses), 
    4
  );
  
  // Weighted MBI calculation
  const MBI = (
    0.25 * consistencyScore +
    0.25 * motivationScore +
    0.20 * disciplineScore +
    0.20 * stressScore +
    0.10 * awarenessScore
  );
  
  return {
    MBI,
    details: {
      consistency: consistencyScore,
      motivation: motivationScore,
      discipline: disciplineScore,
      stressResilience: stressScore,
      selfAwareness: awarenessScore
    }
  };
}

/**
 * Calculate final TPI (Topper Potential Index)
 * TPI = 0.20×CI + 0.25×FMI + 0.35×RDI + 0.20×MBI
 */
function calculateTPI(CI: number, FMI: number, RDI: number, MBI: number): number {
  let TPI = (0.20 * CI) + (0.25 * FMI) + (0.35 * RDI) + (0.20 * MBI);
  
  // Apply constraint rules
  if (CI < 40 || MBI < 40) {
    TPI = Math.min(TPI, 80); // Cap at 80 if fundamentals are weak
  }
  
  if (RDI < 50 && TPI > 70) {
    TPI = Math.min(TPI, 70); // Can't be high potential without readiness
  }
  
  if (FMI < 40) {
    TPI = Math.min(TPI, 65); // Weak foundation limits potential
  }
  
  return Math.round(TPI);
}

/**
 * Determine performance band based on TPI
 */
function determineBand(TPI: number): { 
  band: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  label: string;
} {
  if (TPI >= 85) return { band: 'T1', label: 'Topper-Ready' };
  if (TPI >= 70) return { band: 'T2', label: 'High-Potential' };
  if (TPI >= 55) return { band: 'T3', label: 'Growth-Ready' };
  if (TPI >= 40) return { band: 'T4', label: 'Foundation-Weak' };
  return { band: 'T5', label: 'Critical Support Required' };
}

/**
 * Identify strengths and weaknesses
 */
function analyzePerformance(
  CI: number, 
  FMI: number, 
  RDI: number, 
  MBI: number,
  fmiDetails: any,
  rdiDetails: any,
  mbiDetails: any
): {
  strengths: string[];
  weaknesses: string[];
  priority: string;
} {
  const allScores = [
    { name: 'Cognitive Ability', score: CI },
    { name: 'Math Foundation', score: fmiDetails.math },
    { name: 'Science Foundation', score: fmiDetails.science },
    { name: 'English Foundation', score: fmiDetails.english },
    { name: 'Social Foundation', score: fmiDetails.social },
    { name: 'Math Readiness', score: rdiDetails.math },
    { name: 'Physics Readiness', score: rdiDetails.physics },
    { name: 'Chemistry Readiness', score: rdiDetails.chemistry },
    { name: 'Biology Readiness', score: rdiDetails.biology },
    { name: 'English Readiness', score: rdiDetails.english },
    { name: 'Consistency', score: mbiDetails.consistency },
    { name: 'Motivation', score: mbiDetails.motivation },
    { name: 'Discipline', score: mbiDetails.discipline },
    { name: 'Stress Resilience', score: mbiDetails.stressResilience },
    { name: 'Self-Awareness', score: mbiDetails.selfAwareness }
  ];
  
  // Sort by score
  allScores.sort((a, b) => b.score - a.score);
  
  const strengths = allScores.slice(0, 3).map(s => `${s.name} (${Math.round(s.score)}%)`);
  const weaknesses = allScores.slice(-3).reverse().map(s => `${s.name} (${Math.round(s.score)}%)`);
  
  // Determine priority
  let priority = '';
  if (FMI < 60) priority = 'Foundation Strengthening';
  else if (RDI < 70) priority = 'Class 10 Preparation';
  else if (MBI < 60) priority = 'Mindset & Habits Development';
  else priority = 'Excellence Optimization';
  
  return { strengths, weaknesses, priority };
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate complete assessment results and TPI
 */
export function calculateAssessmentResults(
  objectiveResponses: AssessmentResponse[],
  likertResponses: LikertResponse[]
): TPIResult {
  // Calculate individual indices
  const CI = calculateCognitiveIndex(objectiveResponses);
  const { FMI, details: fmiDetails } = calculateFoundationIndex(objectiveResponses);
  const { RDI, details: rdiDetails } = calculateReadinessIndex(objectiveResponses);
  const { MBI, details: mbiDetails } = calculateMindsetIndex(likertResponses);
  
  // Calculate TPI
  const TPI = calculateTPI(CI, FMI, RDI, MBI);
  const { band, label } = determineBand(TPI);
  
  // Analyze performance
  const { strengths, weaknesses, priority } = analyzePerformance(
    CI, FMI, RDI, MBI, fmiDetails, rdiDetails, mbiDetails
  );
  
  // Build detailed score breakdown
  const scoreBreakdown: ScoreBreakdown = {
    cognitive: {
      total: 40,
      scored: objectiveResponses.filter(r => r.layerId === 1 && r.isCorrect).length,
      percentage: CI,
      breakdown: {
        workingMemory: 0, // Can be calculated if needed
        logicalReasoning: 0,
        processingSpeed: 0,
        attention: 0
      }
    },
    mathFoundation: {
      total: 25,
      scored: objectiveResponses.filter(r => 
        r.layerId === 2 && r.category.includes('Math Foundation') && r.isCorrect
      ).length,
      percentage: fmiDetails.math
    },
    scienceFoundation: {
      total: 40,
      scored: objectiveResponses.filter(r => 
        r.layerId === 2 && 
        (r.category.includes('Science') || r.category.includes('Physics') || 
         r.category.includes('Chemistry') || r.category.includes('Biology')) && 
        r.isCorrect
      ).length,
      percentage: fmiDetails.science,
      breakdown: {
        physics: 0, // Can be calculated if needed
        chemistry: 0,
        biology: 0
      }
    },
    englishFoundation: {
      total: 25,
      scored: objectiveResponses.filter(r => 
        r.layerId === 2 && r.category.includes('English Foundation') && r.isCorrect
      ).length,
      percentage: fmiDetails.english
    },
    socialFoundation: {
      total: 15,
      scored: objectiveResponses.filter(r => 
        r.layerId === 2 && 
        (r.category.includes('History') || r.category.includes('Geography')) && 
        r.isCorrect
      ).length,
      percentage: fmiDetails.social,
      breakdown: {
        history: 0, // Can be calculated if needed
        geography: 0
      }
    },
    class10Readiness: {
      total: 160, // 80 questions × 2 marks
      scored: objectiveResponses.filter(r => r.layerId === 3 && r.isCorrect).length * 2,
      percentage: RDI,
      breakdown: {
        math: rdiDetails.math,
        physics: rdiDetails.physics,
        chemistry: rdiDetails.chemistry,
        biology: rdiDetails.biology,
        english: rdiDetails.english
      }
    },
    mindset: {
      rawScore: calculateLikertScore(likertResponses),
      percentage: MBI,
      breakdown: {
        consistency: mbiDetails.consistency,
        motivation: mbiDetails.motivation,
        discipline: mbiDetails.discipline,
        stressResilience: mbiDetails.stressResilience,
        selfAwareness: mbiDetails.selfAwareness
      }
    }
  };
  
  return {
    TPI,
    band,
    bandLabel: label,
    CI,
    FMI,
    RDI,
    MBI,
    scoreBreakdown,
    strengths,
    weaknesses,
    priority
  };
}

// ============================================================================
// HELPER FUNCTIONS FOR DISPLAY
// ============================================================================

export function formatTPIReport(result: TPIResult): string {
  return `
╔══════════════════════════════════════════════════════════╗
║           TOPPER POTENTIAL INDEX (TPI) REPORT            ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  YOUR TPI SCORE: ${result.TPI} / 100                               ║
║  PERFORMANCE BAND: ${result.band} (${result.bandLabel})                  ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║  MAIN INDICES                                            ║
╠══════════════════════════════════════════════════════════╣
║  🧠 Cognitive Index (CI): ${Math.round(result.CI)}/100                        ║
║  📚 Foundation Mastery (FMI): ${Math.round(result.FMI)}/100                    ║
║  🎯 Class 10 Readiness (RDI): ${Math.round(result.RDI)}/100                    ║
║  💪 Mindset & Behaviour (MBI): ${Math.round(result.MBI)}/100                   ║
╠══════════════════════════════════════════════════════════╣
║  🎯 TOP 3 STRENGTHS                                      ║
╠══════════════════════════════════════════════════════════╣
${result.strengths.map((s, i) => `║  ${i + 1}. ${s.padEnd(56)} ║`).join('\n')}
╠══════════════════════════════════════════════════════════╣
║  ⚠️  TOP 3 AREAS FOR IMPROVEMENT                         ║
╠══════════════════════════════════════════════════════════╣
${result.weaknesses.map((w, i) => `║  ${i + 1}. ${w.padEnd(56)} ║`).join('\n')}
╠══════════════════════════════════════════════════════════╣
║  🎯 PRIORITY FOCUS: ${result.priority.padEnd(39)} ║
╚══════════════════════════════════════════════════════════╝
  `.trim();
}
