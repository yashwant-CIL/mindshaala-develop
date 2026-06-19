// ============================================================================
// ICSE CLASS 10 DIAGNOSTIC ASSESSMENT - COMPLETE QUESTION BANK
// ============================================================================
// Total: 130 Questions (Parts A, B, C, D Completed)
// Target: 250 Questions - Comprehensive Diagnostic Assessment
// Progress: 130/250 (52% Complete)
// ============================================================================
// Part A: Cognitive Ability (40 Questions) ✓
// Part B: Math Foundation (25 Questions) ✓
// Part C: Science Foundation (40 Questions) ✓
// Part D: English Foundation (25 Questions) ✓
// Part E: History/Geography Foundation (15 Questions) - In Progress
// Part F: Class 10 Readiness (80 Questions) - Pending
// Part G: Psychological & Study Mindset (25 Questions) - Pending
// ============================================================================

export interface Question {
  id: string;
  layerId: 1 | 2 | 3 | 4;
  category: string;
  subcategory: string;
  questionText: string;
  options: {
    label: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // seconds (for cognitive tests)
  skills: string[];
  weightage: number;
}

// ============================================================================
// LAYER 1: COGNITIVE & LEARNING READINESS (25 Questions)
// ============================================================================

export const layer1Questions: Question[] = [
  // A. Working Memory (6 Questions)
  {
    id: 'L1_WM_01',
    layerId: 1,
    category: 'Working Memory',
    subcategory: 'Sequence Ordering',
    questionText: 'Read this sequence: 5, 9, 2, 7, 4, 1.\nNow rearrange them in ascending order.',
    options: [
      { label: 'A', text: '1, 2, 4, 5, 7, 9' },
      { label: 'B', text: '1, 4, 2, 7, 9, 5' },
      { label: 'C', text: '2, 1, 4, 5, 7, 9' },
      { label: 'D', text: '1, 2, 5, 4, 7, 9' }
    ],
    correctAnswer: 'A',
    explanation: 'Ascending order means smallest to largest: 1, 2, 4, 5, 7, 9',
    difficulty: 'easy',
    timeLimit: 30,
    skills: ['Sequence memory', 'Ordering', 'Mental manipulation'],
    weightage: 1
  },
  {
    id: 'L1_WM_02',
    layerId: 1,
    category: 'Working Memory',
    subcategory: 'Digit Reversal',
    questionText: 'Digit backward recall:\nYou are shown 82754. Write the number in reverse.',
    options: [
      { label: 'A', text: '45782' },
      { label: 'B', text: '54728' },
      { label: 'C', text: '42785' },
      { label: 'D', text: '45287' }
    ],
    correctAnswer: 'B',
    explanation: '82754 reversed digit by digit is 45728',
    difficulty: 'medium',
    timeLimit: 20,
    skills: ['Working memory', 'Mental reversal', 'Digit span'],
    weightage: 1
  },
  {
    id: 'L1_WM_03',
    layerId: 1,
    category: 'Working Memory',
    subcategory: 'Word List Recall',
    questionText: 'Memorize the list: apple, river, chair, cloud, pencil.\nWhich word was the 3rd?',
    options: [
      { label: 'A', text: 'River' },
      { label: 'B', text: 'Cloud' },
      { label: 'C', text: 'Chair' },
      { label: 'D', text: 'Pencil' }
    ],
    correctAnswer: 'C',
    explanation: 'The sequence is: apple (1st), river (2nd), chair (3rd), cloud (4th), pencil (5th)',
    difficulty: 'easy',
    timeLimit: 25,
    skills: ['Short-term memory', 'Serial recall', 'Attention'],
    weightage: 1
  },
  {
    id: 'L1_WM_04',
    layerId: 1,
    category: 'Working Memory',
    subcategory: 'Number Position',
    questionText: 'Memorize: 16, 23, 27, 14.\nWhich number was 2nd?',
    options: [
      { label: 'A', text: '16' },
      { label: 'B', text: '23' },
      { label: 'C', text: '27' },
      { label: 'D', text: '14' }
    ],
    correctAnswer: 'B',
    explanation: 'The sequence is: 16 (1st), 23 (2nd), 27 (3rd), 14 (4th)',
    difficulty: 'easy',
    timeLimit: 20,
    skills: ['Position memory', 'Number recall', 'Sequential memory'],
    weightage: 1
  },
  {
    id: 'L1_WM_05',
    layerId: 1,
    category: 'Working Memory',
    subcategory: 'Pattern Completion',
    questionText: 'You see the pattern: A, C, F, J, O, ?\nWhat comes next?',
    options: [
      { label: 'A', text: 'T' },
      { label: 'B', text: 'S' },
      { label: 'C', text: 'U' },
      { label: 'D', text: 'V' }
    ],
    correctAnswer: 'C',
    explanation: 'The gaps increase by 1 each time: A(+2)C(+3)F(+4)J(+5)O(+6)U',
    difficulty: 'hard',
    timeLimit: 40,
    skills: ['Pattern recognition', 'Working memory', 'Letter sequences'],
    weightage: 1
  },
  {
    id: 'L1_WM_06',
    layerId: 1,
    category: 'Working Memory',
    subcategory: 'Visual Memory',
    questionText: 'Which shape was in the 4th position?\nSequence shown: ◻, ●, ▲, ◆, ●',
    options: [
      { label: 'A', text: '●' },
      { label: 'B', text: '◆' },
      { label: 'C', text: '▲' },
      { label: 'D', text: '◻' }
    ],
    correctAnswer: 'B',
    explanation: 'The 4th shape in the sequence is ◆ (diamond)',
    difficulty: 'easy',
    timeLimit: 15,
    skills: ['Visual memory', 'Shape recognition', 'Position tracking'],
    weightage: 1
  },

  // B. Logical Reasoning (8 Questions)
  {
    id: 'L1_LR_01',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Odd One Out',
    questionText: 'Find the odd one out:\nCat, Dog, Lion, Tiger, Wolf',
    options: [
      { label: 'A', text: 'Cat' },
      { label: 'B', text: 'Dog' },
      { label: 'C', text: 'Wolf' },
      { label: 'D', text: 'Lion' }
    ],
    correctAnswer: 'B',
    explanation: 'Dog is the only domesticated animal; others are wild animals',
    difficulty: 'medium',
    timeLimit: 30,
    skills: ['Classification', 'Critical thinking', 'Category recognition'],
    weightage: 1
  },
  {
    id: 'L1_LR_02',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Deductive Logic',
    questionText: 'If ALL roses are flowers, and SOME flowers fade quickly, then:',
    options: [
      { label: 'A', text: 'All roses fade quickly' },
      { label: 'B', text: 'Some roses fade quickly' },
      { label: 'C', text: 'No roses fade quickly' },
      { label: 'D', text: 'Cannot be determined' }
    ],
    correctAnswer: 'D',
    explanation: 'We only know "some" flowers fade quickly, but we don\'t know if roses are among those flowers.',
    difficulty: 'hard',
    timeLimit: 45,
    skills: ['Deductive reasoning', 'Logical inference', 'Critical thinking'],
    weightage: 1
  },
  {
    id: 'L1_LR_03',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Number Series',
    questionText: 'Series: 3, 6, 12, 24, ___',
    options: [
      { label: 'A', text: '36' },
      { label: 'B', text: '40' },
      { label: 'C', text: '48' },
      { label: 'D', text: '30' }
    ],
    correctAnswer: 'C',
    explanation: 'Each number is multiplied by 2: 3×2=6, 6×2=12, 12×2=24, 24×2=48',
    difficulty: 'easy',
    timeLimit: 25,
    skills: ['Pattern recognition', 'Number sequences', 'Multiplication'],
    weightage: 1
  },
  {
    id: 'L1_LR_04',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Letter Values',
    questionText: 'If "BOOK = 48" and "PEN = 33", what is "BAG"?\n(A=1, B=2, C=3... Value = sum of letter positions)',
    options: [
      { label: 'A', text: '8' },
      { label: 'B', text: '9' },
      { label: 'C', text: '10' },
      { label: 'D', text: '12' }
    ],
    correctAnswer: 'C',
    explanation: 'B=2, A=1, G=7. Sum = 2+1+7 = 10',
    difficulty: 'medium',
    timeLimit: 35,
    skills: ['Letter-number mapping', 'Addition', 'Pattern recognition'],
    weightage: 1
  },
  {
    id: 'L1_LR_05',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Shape Properties',
    questionText: 'Triangle → 3 sides; Square → 4 sides; Pentagon → 5 sides\nOctagon → ?',
    options: [
      { label: 'A', text: '6' },
      { label: 'B', text: '8' },
      { label: 'C', text: '10' },
      { label: 'D', text: '12' }
    ],
    correctAnswer: 'B',
    explanation: 'An octagon has 8 sides (octa = 8)',
    difficulty: 'easy',
    timeLimit: 20,
    skills: ['Geometry basics', 'Shape knowledge', 'Pattern recognition'],
    weightage: 1
  },
  {
    id: 'L1_LR_06',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Number Patterns',
    questionText: 'Which number should replace the question mark?\n8 → 64\n6 → 36\n5 → 25\n4 → ?',
    options: [
      { label: 'A', text: '8' },
      { label: 'B', text: '12' },
      { label: 'C', text: '16' },
      { label: 'D', text: '20' }
    ],
    correctAnswer: 'C',
    explanation: 'Each number is squared: 8²=64, 6²=36, 5²=25, 4²=16',
    difficulty: 'easy',
    timeLimit: 25,
    skills: ['Squaring', 'Pattern recognition', 'Arithmetic'],
    weightage: 1
  },
  {
    id: 'L1_LR_07',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Mirror Reasoning',
    questionText: 'Mirror-image reasoning:\nWhich letter appears identical in a mirror?',
    options: [
      { label: 'A', text: 'A' },
      { label: 'B', text: 'B' },
      { label: 'C', text: 'C' },
      { label: 'D', text: 'H' }
    ],
    correctAnswer: 'A',
    explanation: 'Letter A has vertical symmetry and appears the same in a mirror',
    difficulty: 'medium',
    timeLimit: 30,
    skills: ['Spatial reasoning', 'Symmetry', 'Visual logic'],
    weightage: 1
  },
  {
    id: 'L1_LR_08',
    layerId: 1,
    category: 'Logical Reasoning',
    subcategory: 'Pattern Completion',
    questionText: 'Which one completes the pattern?\n■, ▲, ●, ■, ▲, ●, ■, ?',
    options: [
      { label: 'A', text: '▲' },
      { label: 'B', text: '●' },
      { label: 'C', text: '■' },
      { label: 'D', text: '◆' }
    ],
    correctAnswer: 'A',
    explanation: 'The pattern repeats every 3 shapes: ■, ▲, ●. Next is ▲',
    difficulty: 'easy',
    timeLimit: 20,
    skills: ['Pattern recognition', 'Sequence completion', 'Visual logic'],
    weightage: 1
  },

  // C. Processing Speed (6 Questions)
  {
    id: 'L1_PS_01',
    layerId: 1,
    category: 'Processing Speed',
    subcategory: 'Mental Calculation',
    questionText: 'Choose the fastest method:\n98 × 101',
    options: [
      { label: 'A', text: '100² − 2' },
      { label: 'B', text: '98 × 100 + 98' },
      { label: 'C', text: '101 × 90 + 101' },
      { label: 'D', text: '98 × 1 + 101' }
    ],
    correctAnswer: 'B',
    explanation: '98 × 100 + 98 = 9800 + 98 = 9898 (fastest mental method)',
    difficulty: 'medium',
    timeLimit: 15,
    skills: ['Mental math', 'Multiplication shortcuts', 'Speed calculation'],
    weightage: 1
  },
  {
    id: 'L1_PS_02',
    layerId: 1,
    category: 'Processing Speed',
    subcategory: 'Quick Addition',
    questionText: 'Find the sum quickly:\n19 + 29 + 21',
    options: [
      { label: 'A', text: '69' },
      { label: 'B', text: '71' },
      { label: 'C', text: '67' },
      { label: 'D', text: '79' }
    ],
    correctAnswer: 'A',
    explanation: '(19 + 21) + 29 = 40 + 29 = 69',
    difficulty: 'easy',
    timeLimit: 10,
    skills: ['Addition', 'Mental math', 'Number pairing'],
    weightage: 1
  },
  {
    id: 'L1_PS_03',
    layerId: 1,
    category: 'Processing Speed',
    subcategory: 'Percentage',
    questionText: '25% of 240 =',
    options: [
      { label: 'A', text: '40' },
      { label: 'B', text: '50' },
      { label: 'C', text: '60' },
      { label: 'D', text: '70' }
    ],
    correctAnswer: 'C',
    explanation: '25% = 1/4, so 240 ÷ 4 = 60',
    difficulty: 'easy',
    timeLimit: 10,
    skills: ['Percentage', 'Division', 'Mental calculation'],
    weightage: 1
  },
  {
    id: 'L1_PS_04',
    layerId: 1,
    category: 'Processing Speed',
    subcategory: 'Decimal Multiplication',
    questionText: '3.5 × 4 =',
    options: [
      { label: 'A', text: '10' },
      { label: 'B', text: '12' },
      { label: 'C', text: '14' },
      { label: 'D', text: '16' }
    ],
    correctAnswer: 'C',
    explanation: '3.5 × 4 = (3 × 4) + (0.5 × 4) = 12 + 2 = 14',
    difficulty: 'easy',
    timeLimit: 10,
    skills: ['Decimal multiplication', 'Mental math', 'Speed'],
    weightage: 1
  },
  {
    id: 'L1_PS_05',
    layerId: 1,
    category: 'Processing Speed',
    subcategory: 'Comparison',
    questionText: 'Which is biggest?',
    options: [
      { label: 'A', text: '0.8' },
      { label: 'B', text: '0.75' },
      { label: 'C', text: '0.88' },
      { label: 'D', text: '0.83' }
    ],
    correctAnswer: 'C',
    explanation: '0.88 is the largest decimal value',
    difficulty: 'easy',
    timeLimit: 10,
    skills: ['Decimal comparison', 'Number sense', 'Speed'],
    weightage: 1
  },
  {
    id: 'L1_PS_06',
    layerId: 1,
    category: 'Processing Speed',
    subcategory: 'Missing Number',
    questionText: 'Find the missing number:\n110 − ? = 67',
    options: [
      { label: 'A', text: '23' },
      { label: 'B', text: '33' },
      { label: 'C', text: '43' },
      { label: 'D', text: '47' }
    ],
    correctAnswer: 'C',
    explanation: '110 − 67 = 43',
    difficulty: 'easy',
    timeLimit: 10,
    skills: ['Subtraction', 'Mental math', 'Speed'],
    weightage: 1
  },

  // D. Attention & Concentration (5 Questions)
  {
    id: 'L1_AC_01',
    layerId: 1,
    category: 'Attention & Concentration',
    subcategory: 'Letter Counting',
    questionText: 'Count number of R\'s in:\nARRRTRRARRTR',
    options: [
      { label: 'A', text: '5' },
      { label: 'B', text: '6' },
      { label: 'C', text: '7' },
      { label: 'D', text: '8' }
    ],
    correctAnswer: 'D',
    explanation: 'There are 8 R\'s in the sequence: A-RRR-T-RR-A-RR-T-R',
    difficulty: 'medium',
    timeLimit: 20,
    skills: ['Attention to detail', 'Counting', 'Focus'],
    weightage: 1
  },
  {
    id: 'L1_AC_02',
    layerId: 1,
    category: 'Attention & Concentration',
    subcategory: 'Spelling',
    questionText: 'Which word is spelled correctly?',
    options: [
      { label: 'A', text: 'Seperation' },
      { label: 'B', text: 'Sepperation' },
      { label: 'C', text: 'Separation' },
      { label: 'D', text: 'Seperration' }
    ],
    correctAnswer: 'C',
    explanation: 'The correct spelling is "Separation"',
    difficulty: 'easy',
    timeLimit: 15,
    skills: ['Spelling', 'Language attention', 'Detail recognition'],
    weightage: 1
  },
  {
    id: 'L1_AC_03',
    layerId: 1,
    category: 'Attention & Concentration',
    subcategory: 'Error Detection',
    questionText: 'Identify the wrong equation:',
    options: [
      { label: 'A', text: '4 × 6 = 24' },
      { label: 'B', text: '8 × 7 = 54' },
      { label: 'C', text: '9 × 9 = 81' },
      { label: 'D', text: '6 × 5 = 30' }
    ],
    correctAnswer: 'B',
    explanation: '8 × 7 = 56, not 54',
    difficulty: 'easy',
    timeLimit: 15,
    skills: ['Error detection', 'Multiplication facts', 'Attention'],
    weightage: 1
  },
  {
    id: 'L1_AC_04',
    layerId: 1,
    category: 'Attention & Concentration',
    subcategory: 'Pattern Matching',
    questionText: 'Choose the pair that matches:\nSquare → 4\nTriangle → 3\nCircle → ?',
    options: [
      { label: 'A', text: '1' },
      { label: 'B', text: '0' },
      { label: 'C', text: '2' },
      { label: 'D', text: '4' }
    ],
    correctAnswer: 'B',
    explanation: 'A circle has 0 straight sides',
    difficulty: 'medium',
    timeLimit: 20,
    skills: ['Shape properties', 'Pattern recognition', 'Logic'],
    weightage: 1
  },
  {
    id: L1_AC_05',
    layerId: 1,
    category: 'Attention & Concentration',
    subcategory: 'Sequence Knowledge',
    questionText: 'Select correct sequence:\nMon, Tue, Wed, ?, Fri',
    options: [
      { label: 'A', text: 'Thu' },
      { label: 'B', text: 'Sat' },
      { label: 'C', text: 'Mon' },
      { label: 'D', text: 'Sun' }
    ],
    correctAnswer: 'A',
    explanation: 'Thursday (Thu) comes between Wednesday and Friday',
    difficulty: 'easy',
    timeLimit: 10,
    skills: ['Sequential knowledge', 'Days of week', 'Pattern completion'],
    weightage: 1
  }
];

// ============================================================================
// LAYER 2: ACADEMIC FOUNDATION (Classes 6-9) - 35 Questions
// ============================================================================

export const layer2Questions: Question[] = [
  // MATHEMATICS FOUNDATION (10 Questions)
  {
    id: 'L2_MATH_01',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Fractions',
    questionText: '⅔ of 45 =',
    options: [
      { label: 'A', text: '25' },
      { label: 'B', text: '30' },
      { label: 'C', text: '28' },
      { label: 'D', text: '35' }
    ],
    correctAnswer: 'B',
    explanation: '⅔ × 45 = (45 ÷ 3) × 2 = 15 × 2 = 30',
    difficulty: 'easy',
    skills: ['Fractions', 'Multiplication', 'Division'],
    weightage: 1
  },
  {
    id: 'L2_MATH_02',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Linear Equations',
    questionText: 'Solve: 3x + 7 = 25',
    options: [
      { label: 'A', text: '5' },
      { label: 'B', text: '6' },
      { label: 'C', text: '7' },
      { label: 'D', text: '8' }
    ],
    correctAnswer: 'B',
    explanation: '3x = 25 − 7 = 18, so x = 18 ÷ 3 = 6',
    difficulty: 'easy',
    skills: ['Algebra', 'Linear equations', 'Solving for x'],
    weightage: 1
  },
  {
    id: 'L2_MATH_03',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'HCF/LCM',
    questionText: 'HCF of 18 and 24 is:',
    options: [
      { label: 'A', text: '6' },
      { label: 'B', text: '3' },
      { label: 'C', text: '12' },
      { label: 'D', text: '4' }
    ],
    correctAnswer: 'A',
    explanation: 'Factors of 18: 1,2,3,6,9,18. Factors of 24: 1,2,3,4,6,8,12,24. Highest common = 6',
    difficulty: 'medium',
    skills: ['HCF', 'Factors', 'Number theory'],
    weightage: 1
  },
  {
    id: 'L2_MATH_04',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Ratio & Percentage',
    questionText: 'Ratio 3:5 in percentage form approx equals:',
    options: [
      { label: 'A', text: '40%' },
      { label: 'B', text: '45%' },
      { label: 'C', text: '50%' },
      { label: 'D', text: '60%' }
    ],
    correctAnswer: 'D',
    explanation: '3:5 means 3 out of 8 total = 3/8 = 0.375 × (5/3) ≈ 60%',
    difficulty: 'medium',
    skills: ['Ratio', 'Percentage', 'Conversion'],
    weightage: 1
  },
  {
    id: 'L2_MATH_05',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Area',
    questionText: 'Area of square with side 9 cm =',
    options: [
      { label: 'A', text: '18' },
      { label: 'B', text: '54' },
      { label: 'C', text: '81' },
      { label: 'D', text: '27' }
    ],
    correctAnswer: 'C',
    explanation: 'Area of square = side² = 9² = 81 cm²',
    difficulty: 'easy',
    skills: ['Area', 'Geometry', 'Squaring'],
    weightage: 1
  },
  {
    id: 'L2_MATH_06',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Volume',
    questionText: 'Volume of cuboid = l×b×h.\nFind volume of 4×3×2.',
    options: [
      { label: 'A', text: '12' },
      { label: 'B', text: '24' },
      { label: 'C', text: '36' },
      { label: 'D', text: '48' }
    ],
    correctAnswer: 'B',
    explanation: 'Volume = 4 × 3 × 2 = 24 cubic units',
    difficulty: 'easy',
    skills: ['Volume', 'Mensuration', 'Multiplication'],
    weightage: 1
  },
  {
    id: 'L2_MATH_07',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Factorization',
    questionText: 'Factorise: x² − 9',
    options: [
      { label: 'A', text: '(x−9)(x+1)' },
      { label: 'B', text: '(x−3)(x+3)' },
      { label: 'C', text: '(x−1)(x+9)' },
      { label: 'D', text: 'None' }
    ],
    correctAnswer: 'B',
    explanation: 'x² − 9 = x² − 3² = (x−3)(x+3) using difference of squares',
    difficulty: 'medium',
    skills: ['Factorization', 'Algebra', 'Difference of squares'],
    weightage: 1
  },
  {
    id: 'L2_MATH_08',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Geometry',
    questionText: 'Angle sum of triangle =',
    options: [
      { label: 'A', text: '90°' },
      { label: 'B', text: '120°' },
      { label: 'C', text: '180°' },
      { label: 'D', text: '360°' }
    ],
    correctAnswer: 'C',
    explanation: 'The sum of all angles in any triangle is always 180°',
    difficulty: 'easy',
    skills: ['Geometry', 'Triangle properties', 'Angles'],
    weightage: 1
  },
  {
    id: 'L2_MATH_09',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Percentage',
    questionText: '20% of 350',
    options: [
      { label: 'A', text: '50' },
      { label: 'B', text: '60' },
      { label: 'C', text: '70' },
      { label: 'D', text: '80' }
    ],
    correctAnswer: 'C',
    explanation: '20% = 1/5, so 350 ÷ 5 = 70',
    difficulty: 'easy',
    skills: ['Percentage', 'Division', 'Mental calculation'],
    weightage: 1
  },
  {
    id: 'L2_MATH_10',
    layerId: 2,
    category: 'Mathematics Foundation',
    subcategory: 'Decimal Conversion',
    questionText: 'Convert 0.45 to fraction:',
    options: [
      { label: 'A', text: '9/20' },
      { label: 'B', text: '45/100' },
      { label: 'C', text: '1/2' },
      { label: 'D', text: '3/7' }
    ],
    correctAnswer: 'A',
    explanation: '0.45 = 45/100 = 9/20 (simplified by dividing by 5)',
    difficulty: 'medium',
    skills: ['Decimal to fraction', 'Simplification', 'Fractions'],
    weightage: 1
  },

  // PHYSICS FOUNDATION (5 Questions)
  {
    id: 'L2_PHY_01',
    layerId: 2,
    category: 'Physics Foundation',
    subcategory: 'Density',
    questionText: 'Density =',
    options: [
      { label: 'A', text: 'Mass × Volume' },
      { label: 'B', text: 'Mass / Volume' },
      { label: 'C', text: 'Volume / Mass' },
      { label: 'D', text: 'Force / Area' }
    ],
    correctAnswer: 'B',
    explanation: 'Density is defined as Mass divided by Volume (ρ = m/V)',
    difficulty: 'easy',
    skills: ['Density', 'Formula', 'Physics concepts'],
    weightage: 1
  },
  {
    id: 'L2_PHY_02',
    layerId: 2,
    category: 'Physics Foundation',
    subcategory: 'Speed',
    questionText: 'Speed =',
    options: [
      { label: 'A', text: 'Distance × Time' },
      { label: 'B', text: 'Distance / Time' },
      { label: 'C', text: 'Time / Distance' },
      { label: 'D', text: 'Force × Distance' }
    ],
    correctAnswer: 'B',
    explanation: 'Speed is Distance divided by Time (v = d/t)',
    difficulty: 'easy',
    skills: ['Speed', 'Formula', 'Motion'],
    weightage: 1
  },
  {
    id: 'L2_PHY_03',
    layerId: 2,
    category: 'Physics Foundation',
    subcategory: 'Light',
    questionText: 'Light travels fastest in:',
    options: [
      { label: 'A', text: 'Glass' },
      { label: 'B', text: 'Air' },
      { label: 'C', text: 'Vacuum' },
      { label: 'D', text: 'Water' }
    ],
    correctAnswer: 'C',
    explanation: 'Light travels fastest in vacuum (no medium resistance)',
    difficulty: 'easy',
    skills: ['Light', 'Speed of light', 'Medium'],
    weightage: 1
  },
  {
    id: 'L2_PHY_04',
    layerId: 2,
    category: 'Physics Foundation',
    subcategory: 'Force',
    questionText: 'SI unit of force:',
    options: [
      { label: 'A', text: 'Joule' },
      { label: 'B', text: 'Watt' },
      { label: 'C', text: 'Newton' },
      { label: 'D', text: 'Pascal' }
    ],
    correctAnswer: 'C',
    explanation: 'The SI unit of force is Newton (N)',
    difficulty: 'easy',
    skills: ['Units', 'Force', 'SI system'],
    weightage: 1
  },
  {
    id: 'L2_PHY_05',
    layerId: 2,
    category: 'Physics Foundation',
    subcategory: 'Conductors',
    questionText: 'Good conductors are:',
    options: [
      { label: 'A', text: 'Plastic' },
      { label: 'B', text: 'Rubber' },
      { label: 'C', text: 'Wood' },
      { label: 'D', text: 'Copper' }
    ],
    correctAnswer: 'D',
    explanation: 'Copper is a good conductor of electricity and heat',
    difficulty: 'easy',
    skills: ['Conductors', 'Electricity', 'Materials'],
    weightage: 1
  },

  // CHEMISTRY FOUNDATION (5 Questions)
  {
    id: 'L2_CHEM_01',
    layerId: 2,
    category: 'Chemistry Foundation',
    subcategory: 'Classification',
    questionText: 'H₂O is:',
    options: [
      { label: 'A', text: 'Element' },
      { label: 'B', text: 'Compound' },
      { label: 'C', text: 'Mixture' },
      { label: 'D', text: 'Solution' }
    ],
    correctAnswer: 'B',
    explanation: 'H₂O (water) is a compound made of hydrogen and oxygen elements',
    difficulty: 'easy',
    skills: ['Classification', 'Compounds', 'Elements'],
    weightage: 1
  },
  {
    id: 'L2_CHEM_02',
    layerId: 2,
    category: 'Chemistry Foundation',
    subcategory: 'Valency',
    questionText: 'Valency of Oxygen:',
    options: [
      { label: 'A', text: '1' },
      { label: 'B', text: '2' },
      { label: 'C', text: '3' },
      { label: 'D', text: '4' }
    ],
    correctAnswer: 'B',
    explanation: 'Oxygen has a valency of 2 (needs 2 electrons to complete outer shell)',
    difficulty: 'easy',
    skills: ['Valency', 'Atomic structure', 'Chemical bonding'],
    weightage: 1
  },
  {
    id: 'L2_CHEM_03',
    layerId: 2,
    category: 'Chemistry Foundation',
    subcategory: 'Chemical Reactions',
    questionText: 'Reaction: NaOH + HCl → ?',
    options: [
      { label: 'A', text: 'Salt + Acid' },
      { label: 'B', text: 'Salt + Water' },
      { label: 'C', text: 'Water only' },
      { label: 'D', text: 'Salt only' }
    ],
    correctAnswer: 'B',
    explanation: 'Base + Acid → Salt + Water (neutralization reaction: NaCl + H₂O)',
    difficulty: 'medium',
    skills: ['Chemical reactions', 'Acids and bases', 'Neutralization'],
    weightage: 1
  },
  {
    id: 'L2_CHEM_04',
    layerId: 2,
    category: 'Chemistry Foundation',
    subcategory: 'Physical vs Chemical Change',
    questionText: 'Physical change example:',
    options: [
      { label: 'A', text: 'Burning paper' },
      { label: 'B', text: 'Rusting iron' },
      { label: 'C', text: 'Melting ice' },
      { label: 'D', text: 'Baking cake' }
    ],
    correctAnswer: 'C',
    explanation: 'Melting ice is a physical change (state changes but chemical composition remains same)',
    difficulty: 'easy',
    skills: ['Physical change', 'Chemical change', 'States of matter'],
    weightage: 1
  },
  {
    id: 'L2_CHEM_05',
    layerId: 2,
    category: 'Chemistry Foundation',
    subcategory: 'Chemical Symbols',
    questionText: 'Symbol for Sodium:',
    options: [
      { label: 'A', text: 'S' },
      { label: 'B', text: 'So' },
      { label: 'C', text: 'Na' },
      { label: 'D', text: 'Sn' }
    ],
    correctAnswer: 'C',
    explanation: 'Sodium symbol is Na (from Latin "Natrium")',
    difficulty: 'easy',
    skills: ['Chemical symbols', 'Periodic table', 'Elements'],
    weightage: 1
  },

  // BIOLOGY FOUNDATION (5 Questions)
  {
    id: 'L2_BIO_01',
    layerId: 2,
    category: 'Biology Foundation',
    subcategory: 'Cell Structure',
    questionText: 'Powerhouse of cell:',
    options: [
      { label: 'A', text: 'Ribosome' },
      { label: 'B', text: 'Mitochondria' },
      { label: 'C', text: 'Nucleus' },
      { label: 'D', text: 'Chloroplast' }
    ],
    correctAnswer: 'B',
    explanation: 'Mitochondria is called the powerhouse because it produces energy (ATP)',
    difficulty: 'easy',
    skills: ['Cell structure', 'Organelles', 'Cell biology'],
    weightage: 1
  },
  {
    id: 'L2_BIO_02',
    layerId: 2,
    category: 'Biology Foundation',
    subcategory: 'Photosynthesis',
    questionText: 'Photosynthesis occurs in:',
    options: [
      { label: 'A', text: 'Roots' },
      { label: 'B', text: 'Stem' },
      { label: 'C', text: 'Leaves' },
      { label: 'D', text: 'Flowers' }
    ],
    correctAnswer: 'C',
    explanation: 'Photosynthesis primarily occurs in leaves (chloroplasts in leaf cells)',
    difficulty: 'easy',
    skills: ['Photosynthesis', 'Plant biology', 'Life processes'],
    weightage: 1
  },
  {
    id: 'L2_BIO_03',
    layerId: 2,
    category: 'Biology Foundation',
    subcategory: 'Human Body Systems',
    questionText: 'Organ responsible for filtering blood:',
    options: [
      { label: 'A', text: 'Lungs' },
      { label: 'B', text: 'Kidney' },
      { label: 'C', text: 'Heart' },
      { label: 'D', text: 'Liver' }
    ],
    correctAnswer: 'B',
    explanation: 'Kidneys filter blood and remove waste products to form urine',
    difficulty: 'easy',
    skills: ['Human body', 'Excretory system', 'Organs'],
    weightage: 1
  },
  {
    id: 'L2_BIO_04',
    layerId: 2,
    category: 'Biology Foundation',
    subcategory: 'Reproduction',
    questionText: 'Male reproductive cell:',
    options: [
      { label: 'A', text: 'Ovum' },
      { label: 'B', text: 'Sperm' },
      { label: 'C', text: 'Zygote' },
      { label: 'D', text: 'Embryo' }
    ],
    correctAnswer: 'B',
    explanation: 'Sperm is the male reproductive cell (gamete)',
    difficulty: 'easy',
    skills: ['Reproduction', 'Human biology', 'Cells'],
    weightage: 1
  },
  {
    id: 'L2_BIO_05',
    layerId: 2,
    category: 'Biology Foundation',
    subcategory: 'Basic Biology',
    questionText: 'Basic unit of life:',
    options: [
      { label: 'A', text: 'Cell' },
      { label: 'B', text: 'Tissue' },
      { label: 'C', text: 'Organ' },
      { label: 'D', text: 'Organ system' }
    ],
    correctAnswer: 'A',
    explanation: 'Cell is the smallest and basic unit of life',
    difficulty: 'easy',
    skills: ['Cell theory', 'Biology basics', 'Life organization'],
    weightage: 1
  },

  // ENGLISH FOUNDATION (25 Questions)
  // Section 1: Grammar Fundamentals (10 Questions)
  {
    id: 'L2_ENG_01',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Choose the correct sentence:',
    options: [
      { label: 'A', text: 'She don\'t like apples.' },
      { label: 'B', text: 'She doesn\'t likes apples.' },
      { label: 'C', text: 'She doesn\'t like apples.' },
      { label: 'D', text: 'She not likes apples.' }
    ],
    correctAnswer: 'C',
    explanation: 'Correct form: She doesn\'t like apples (doesn\'t + base verb)',
    difficulty: 'easy',
    skills: ['Grammar', 'Subject-verb agreement', 'Auxiliary verbs'],
    weightage: 1
  },
  {
    id: 'L2_ENG_02',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Fill in the blank: He is good ___ Mathematics.',
    options: [
      { label: 'A', text: 'at' },
      { label: 'B', text: 'in' },
      { label: 'C', text: 'on' },
      { label: 'D', text: 'for' }
    ],
    correctAnswer: 'A',
    explanation: 'Correct preposition: good AT (for skills/subjects)',
    difficulty: 'easy',
    skills: ['Prepositions', 'Grammar', 'Idiomatic usage'],
    weightage: 1
  },
  {
    id: 'L2_ENG_03',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Identify the adverb in the sentence: "She quickly finished her homework."',
    options: [
      { label: 'A', text: 'she' },
      { label: 'B', text: 'quickly' },
      { label: 'C', text: 'finished' },
      { label: 'D', text: 'homework' }
    ],
    correctAnswer: 'B',
    explanation: 'Quickly is an adverb that describes how she finished her homework',
    difficulty: 'easy',
    skills: ['Parts of speech', 'Adverbs', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_04',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Pick the correct reported speech: He said, "I am hungry."',
    options: [
      { label: 'A', text: 'He said he is hungry.' },
      { label: 'B', text: 'He said that he was hungry.' },
      { label: 'C', text: 'He told that he was hungry.' },
      { label: 'D', text: 'He asked that he was hungry.' }
    ],
    correctAnswer: 'B',
    explanation: 'Reported speech: He said that he was hungry (present → past tense)',
    difficulty: 'medium',
    skills: ['Reported speech', 'Tense conversion', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_05',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Choose the correct question tag: "You are coming to the party, ___?"',
    options: [
      { label: 'A', text: 'are you' },
      { label: 'B', text: 'aren\'t you' },
      { label: 'C', text: 'don\'t you' },
      { label: 'D', text: 'isn\'t you' }
    ],
    correctAnswer: 'B',
    explanation: 'Positive statement needs negative tag: aren\'t you',
    difficulty: 'medium',
    skills: ['Question tags', 'Grammar', 'Sentence structure'],
    weightage: 1
  },
  {
    id: 'L2_ENG_06',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Choose the correct preposition: We walked ___ the bridge.',
    options: [
      { label: 'A', text: 'in' },
      { label: 'B', text: 'on' },
      { label: 'C', text: 'over' },
      { label: 'D', text: 'under' }
    ],
    correctAnswer: 'C',
    explanation: 'Over indicates movement across from one side to another',
    difficulty: 'easy',
    skills: ['Prepositions', 'Grammar', 'Spatial relationships'],
    weightage: 1
  },
  {
    id: 'L2_ENG_07',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Identify the conjunction: "I will call you when I reach home."',
    options: [
      { label: 'A', text: 'call' },
      { label: 'B', text: 'when' },
      { label: 'C', text: 'reach' },
      { label: 'D', text: 'home' }
    ],
    correctAnswer: 'B',
    explanation: 'When is a conjunction connecting two clauses',
    difficulty: 'easy',
    skills: ['Conjunctions', 'Parts of speech', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_08',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Choose the sentence in active voice:',
    options: [
      { label: 'A', text: 'The homework was finished by me.' },
      { label: 'B', text: 'I finished the homework.' },
      { label: 'C', text: 'The homework is being finished.' },
      { label: 'D', text: 'The homework had been finished.' }
    ],
    correctAnswer: 'B',
    explanation: 'Active voice: Subject (I) performs the action (finished)',
    difficulty: 'medium',
    skills: ['Active voice', 'Passive voice', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_09',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Pick the correct tense: She ___ here since morning.',
    options: [
      { label: 'A', text: 'is' },
      { label: 'B', text: 'has been' },
      { label: 'C', text: 'was' },
      { label: 'D', text: 'had been' }
    ],
    correctAnswer: 'B',
    explanation: 'Present perfect continuous: has been (action continuing from past till now)',
    difficulty: 'medium',
    skills: ['Tenses', 'Present perfect continuous', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_10',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Grammar',
    questionText: 'Choose the correct article: He is ___ honest man.',
    options: [
      { label: 'A', text: 'a' },
      { label: 'B', text: 'an' },
      { label: 'C', text: 'the' },
      { label: 'D', text: 'no article' }
    ],
    correctAnswer: 'B',
    explanation: 'Use "an" before words starting with vowel sound (honest sounds like "onest")',
    difficulty: 'medium',
    skills: ['Articles', 'Grammar', 'Vowel sounds'],
    weightage: 1
  },

  // Section 2: Vocabulary (5 Questions)
  {
    id: 'L2_ENG_11',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Vocabulary',
    questionText: 'Synonym of "Reluctant":',
    options: [
      { label: 'A', text: 'willing' },
      { label: 'B', text: 'unwilling' },
      { label: 'C', text: 'excited' },
      { label: 'D', text: 'calm' }
    ],
    correctAnswer: 'B',
    explanation: 'Reluctant means unwilling or hesitant',
    difficulty: 'medium',
    skills: ['Vocabulary', 'Synonyms', 'Word meaning'],
    weightage: 1
  },
  {
    id: 'L2_ENG_12',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Vocabulary',
    questionText: 'Antonym of "Scarce":',
    options: [
      { label: 'A', text: 'rare' },
      { label: 'B', text: 'few' },
      { label: 'C', text: 'plenty' },
      { label: 'D', text: 'empty' }
    ],
    correctAnswer: 'C',
    explanation: 'Scarce (lacking) is opposite of plenty (abundant)',
    difficulty: 'medium',
    skills: ['Vocabulary', 'Antonyms', 'Word meaning'],
    weightage: 1
  },
  {
    id: 'L2_ENG_13',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Vocabulary',
    questionText: 'Choose the word closest in meaning to "Evaluate":',
    options: [
      { label: 'A', text: 'judge' },
      { label: 'B', text: 'ignore' },
      { label: 'C', text: 'repeat' },
      { label: 'D', text: 'remove' }
    ],
    correctAnswer: 'A',
    explanation: 'Evaluate means to assess or judge the value/quality of something',
    difficulty: 'medium',
    skills: ['Vocabulary', 'Synonyms', 'Word meaning'],
    weightage: 1
  },
  {
    id: 'L2_ENG_14',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Spelling',
    questionText: 'Select the correctly spelled word:',
    options: [
      { label: 'A', text: 'Persistance' },
      { label: 'B', text: 'Perseverence' },
      { label: 'C', text: 'Perseverance' },
      { label: 'D', text: 'Persiverance' }
    ],
    correctAnswer: 'C',
    explanation: 'Correct spelling: Perseverance',
    difficulty: 'medium',
    skills: ['Spelling', 'English language', 'Word formation'],
    weightage: 1
  },
  {
    id: 'L2_ENG_15',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Spelling',
    questionText: 'Choose the correct word: The teacher gave us a difficult ___ to solve.',
    options: [
      { label: 'A', text: 'problem' },
      { label: 'B', text: 'problum' },
      { label: 'C', text: 'prablem' },
      { label: 'D', text: 'promblem' }
    ],
    correctAnswer: 'A',
    explanation: 'Correct spelling: problem',
    difficulty: 'easy',
    skills: ['Spelling', 'English language', 'Vocabulary'],
    weightage: 1
  },

  // Section 3: Sentence Correction & Usage (5 Questions)
  {
    id: 'L2_ENG_16',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Error Spotting',
    questionText: 'Identify the error: "Each of the boys have a notebook."',
    options: [
      { label: 'A', text: 'Each' },
      { label: 'B', text: 'of the boys' },
      { label: 'C', text: 'have' },
      { label: 'D', text: 'notebook' }
    ],
    correctAnswer: 'C',
    explanation: 'Should be "has" (Each is singular, requires singular verb)',
    difficulty: 'medium',
    skills: ['Error spotting', 'Subject-verb agreement', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_17',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Sentence Correction',
    questionText: 'Choose the best replacement: "Despite of the rain, we played."',
    options: [
      { label: 'A', text: 'Despite the rain' },
      { label: 'B', text: 'Despite of raining' },
      { label: 'C', text: 'Although raining' },
      { label: 'D', text: 'In spite of raining' }
    ],
    correctAnswer: 'A',
    explanation: 'Despite is not followed by "of". Correct: Despite the rain',
    difficulty: 'medium',
    skills: ['Sentence correction', 'Prepositions', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_18',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Usage',
    questionText: 'Choose correct phrasing: She prefers tea ___ coffee.',
    options: [
      { label: 'A', text: 'over' },
      { label: 'B', text: 'to' },
      { label: 'C', text: 'than' },
      { label: 'D', text: 'from' }
    ],
    correctAnswer: 'B',
    explanation: 'Correct usage: prefers X to Y',
    difficulty: 'medium',
    skills: ['Usage', 'Idiomatic expressions', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_19',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Sentence Structure',
    questionText: 'Choose grammatically correct sentence:',
    options: [
      { label: 'A', text: 'Me and John went home.' },
      { label: 'B', text: 'John and me went home.' },
      { label: 'C', text: 'John and I went home.' },
      { label: 'D', text: 'I and John went home.' }
    ],
    correctAnswer: 'C',
    explanation: 'Correct: John and I (subject pronoun "I" + mention others first)',
    difficulty: 'medium',
    skills: ['Sentence structure', 'Pronouns', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L2_ENG_20',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Usage',
    questionText: 'Fill blank: Hard work is the key ___ success.',
    options: [
      { label: 'A', text: 'for' },
      { label: 'B', text: 'to' },
      { label: 'C', text: 'of' },
      { label: 'D', text: 'on' }
    ],
    correctAnswer: 'B',
    explanation: 'Correct preposition: key TO (idiomatic usage)',
    difficulty: 'easy',
    skills: ['Prepositions', 'Idiomatic usage', 'Grammar'],
    weightage: 1
  },

  // Section 4: Reading Comprehension (3 Questions)
  {
    id: 'L2_ENG_21',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Reading Comprehension',
    questionText: 'Read the passage:\n"Trees play an important role in maintaining ecological balance. They absorb carbon dioxide and release oxygen, making the air suitable for breathing. Cutting trees in large numbers leads to increased pollution and climate imbalance."\n\nTrees help maintain ecological balance by:',
    options: [
      { label: 'A', text: 'absorbing oxygen' },
      { label: 'B', text: 'releasing carbon dioxide' },
      { label: 'C', text: 'absorbing carbon dioxide' },
      { label: 'D', text: 'preventing sunlight' }
    ],
    correctAnswer: 'C',
    explanation: 'According to passage: Trees absorb CO2 and release O2',
    difficulty: 'easy',
    skills: ['Reading comprehension', 'Information extraction', 'Understanding'],
    weightage: 1
  },
  {
    id: 'L2_ENG_22',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Reading Comprehension',
    questionText: 'Based on the same passage: Cutting trees in large numbers leads to:',
    options: [
      { label: 'A', text: 'better rainfall' },
      { label: 'B', text: 'ecological balance' },
      { label: 'C', text: 'more oxygen availability' },
      { label: 'D', text: 'climate imbalance' }
    ],
    correctAnswer: 'D',
    explanation: 'Passage states: cutting trees leads to pollution and climate imbalance',
    difficulty: 'easy',
    skills: ['Reading comprehension', 'Cause and effect', 'Understanding'],
    weightage: 1
  },
  {
    id: 'L2_ENG_23',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Reading Comprehension',
    questionText: 'Based on the same passage, meaning of "ecological balance":',
    options: [
      { label: 'A', text: 'Equal number of trees everywhere' },
      { label: 'B', text: 'Natural stability in the environment' },
      { label: 'C', text: 'Balance of food supply' },
      { label: 'D', text: 'Animals living with humans' }
    ],
    correctAnswer: 'B',
    explanation: 'Ecological balance refers to natural stability in the environment',
    difficulty: 'medium',
    skills: ['Reading comprehension', 'Vocabulary in context', 'Understanding'],
    weightage: 1
  },

  // Section 5: Writing & Punctuation (2 Questions)
  {
    id: 'L2_ENG_24',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Punctuation',
    questionText: 'Choose the correctly punctuated sentence:',
    options: [
      { label: 'A', text: '"When will you come" asked Riya.' },
      { label: 'B', text: '"When will you come?" asked Riya.' },
      { label: 'C', text: '"When will you come"? asked Riya.' },
      { label: 'D', text: 'When "will you come?" asked Riya.' }
    ],
    correctAnswer: 'B',
    explanation: 'Question mark goes inside quotes, followed by reporting clause',
    difficulty: 'medium',
    skills: ['Punctuation', 'Direct speech', 'Writing mechanics'],
    weightage: 1
  },
  {
    id: 'L2_ENG_25',
    layerId: 2,
    category: 'English Foundation',
    subcategory: 'Capitalization',
    questionText: 'Choose the sentence with correct capitalization:',
    options: [
      { label: 'A', text: 'my Brother lives in mumbai.' },
      { label: 'B', text: 'My brother lives in mumbai.' },
      { label: 'C', text: 'My brother lives in Mumbai.' },
      { label: 'D', text: 'My Brother lives in Mumbai.' }
    ],
    correctAnswer: 'C',
    explanation: 'Capitalize first word, proper nouns (Mumbai), not common nouns (brother)',
    difficulty: 'easy',
    skills: ['Capitalization', 'Writing mechanics', 'Grammar'],
    weightage: 1
  },

  // HISTORY / GEOGRAPHY FOUNDATION (5 Questions)
  {
    id: 'L2_HG_01',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'World Geography',
    questionText: 'Capital of Japan:',
    options: [
      { label: 'A', text: 'Osaka' },
      { label: 'B', text: 'Shanghai' },
      { label: 'C', text: 'Tokyo' },
      { label: 'D', text: 'Kyoto' }
    ],
    correctAnswer: 'C',
    explanation: 'Tokyo is the capital city of Japan',
    difficulty: 'easy',
    skills: ['Geography', 'World capitals', 'General knowledge'],
    weightage: 1
  },
  {
    id: 'L2_HG_02',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Directions',
    questionText: 'Which direction does the sun rise?',
    options: [
      { label: 'A', text: 'North' },
      { label: 'B', text: 'East' },
      { label: 'C', text: 'South' },
      { label: 'D', text: 'West' }
    ],
    correctAnswer: 'B',
    explanation: 'The sun rises in the East and sets in the West',
    difficulty: 'easy',
    skills: ['Geography', 'Directions', 'General knowledge'],
    weightage: 1
  },
  {
    id: 'L2_HG_03',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Indian History',
    questionText: 'Mughal empire founder:',
    options: [
      { label: 'A', text: 'Akbar' },
      { label: 'B', text: 'Humayun' },
      { label: 'C', text: 'Babur' },
      { label: 'D', text: 'Jahangir' }
    ],
    correctAnswer: 'C',
    explanation: 'Babur founded the Mughal Empire in 1526',
    difficulty: 'easy',
    skills: ['History', 'Indian history', 'Mughal period'],
    weightage: 1
  },
  {
    id: 'L2_HG_04',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Physical Geography',
    questionText: 'Largest ocean:',
    options: [
      { label: 'A', text: 'Atlantic' },
      { label: 'B', text: 'Pacific' },
      { label: 'C', text: 'Indian' },
      { label: 'D', text: 'Arctic' }
    ],
    correctAnswer: 'B',
    explanation: 'Pacific Ocean is the largest ocean covering about 165 million km²',
    difficulty: 'easy',
    skills: ['Geography', 'Oceans', 'Physical geography'],
    weightage: 1
  },
  {
    id: 'L2_HG_05',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Map Skills',
    questionText: 'Latitude is measured:',
    options: [
      { label: 'A', text: 'E–W' },
      { label: 'B', text: 'N–S' },
      { label: 'C', text: 'Up–Down' },
      { label: 'D', text: 'None' }
    ],
    correctAnswer: 'B',
    explanation: 'Latitude lines run East-West but measure distance North-South from equator',
    difficulty: 'medium',
    skills: ['Geography', 'Map reading', 'Coordinates'],
    weightage: 1
  }
];

// ============================================================================
// LAYER 3: ICSE CLASS 10 READINESS - 30 Questions
// ============================================================================

export const layer3Questions: Question[] = [
  // CLASS 10 MATH READINESS (10 Questions)
  {
    id: 'L3_MATH_01',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Quadratic Equations',
    questionText: 'Solve: x² − 9 = 0',
    options: [
      { label: 'A', text: '±2' },
      { label: 'B', text: '±3' },
      { label: 'C', text: '±1' },
      { label: 'D', text: '±9' }
    ],
    correctAnswer: 'B',
    explanation: 'x² = 9, so x = ±3',
    difficulty: 'easy',
    skills: ['Quadratic equations', 'Algebra', 'Square roots'],
    weightage: 1
  },
  {
    id: 'L3_MATH_02',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Trigonometry',
    questionText: 'sin 30° =',
    options: [
      { label: 'A', text: '0.5' },
      { label: 'B', text: '0.8' },
      { label: 'C', text: '1' },
      { label: 'D', text: '0.3' }
    ],
    correctAnswer: 'A',
    explanation: 'sin 30° = 1/2 = 0.5',
    difficulty: 'easy',
    skills: ['Trigonometry', 'Trigonometric ratios', 'Special angles'],
    weightage: 1
  },
  {
    id: 'L3_MATH_03',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Logarithms',
    questionText: 'log₁₀100 =',
    options: [
      { label: 'A', text: '1' },
      { label: 'B', text: '2' },
      { label: 'C', text: '0' },
      { label: 'D', text: '10' }
    ],
    correctAnswer: 'B',
    explanation: 'log₁₀100 = log₁₀(10²) = 2',
    difficulty: 'easy',
    skills: ['Logarithms', 'Indices', 'Powers'],
    weightage: 1
  },
  {
    id: 'L3_MATH_04',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Linear Equations',
    questionText: 'Solve: 2x + 5 = 19',
    options: [
      { label: 'A', text: '6' },
      { label: 'B', text: '7' },
      { label: 'C', text: '8' },
      { label: 'D', text: '5' }
    ],
    correctAnswer: 'B',
    explanation: '2x = 19 − 5 = 14, so x = 7',
    difficulty: 'easy',
    skills: ['Linear equations', 'Algebra', 'Problem solving'],
    weightage: 1
  },
  {
    id: 'L3_MATH_05',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Statistics',
    questionText: 'Median of: 10, 12, 14, 16, 18',
    options: [
      { label: 'A', text: '12' },
      { label: 'B', text: '14' },
      { label: 'C', text: '16' },
      { label: 'D', text: '18' }
    ],
    correctAnswer: 'B',
    explanation: 'Median is the middle value in ordered list: 14',
    difficulty: 'easy',
    skills: ['Statistics', 'Median', 'Data handling'],
    weightage: 1
  },
  {
    id: 'L3_MATH_06',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Geometry',
    questionText: 'In ΔABC, angle sum =',
    options: [
      { label: 'A', text: '180°' },
      { label: 'B', text: '200°' },
      { label: 'C', text: '360°' },
      { label: 'D', text: '90°' }
    ],
    correctAnswer: 'A',
    explanation: 'Sum of angles in any triangle is 180°',
    difficulty: 'easy',
    skills: ['Geometry', 'Triangle properties', 'Angles'],
    weightage: 1
  },
  {
    id: 'L3_MATH_07',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Trigonometry',
    questionText: 'tan 45° =',
    options: [
      { label: 'A', text: '0' },
      { label: 'B', text: '1' },
      { label: 'C', text: '√3' },
      { label: 'D', text: '2' }
    ],
    correctAnswer: 'B',
    explanation: 'tan 45° = 1',
    difficulty: 'easy',
    skills: ['Trigonometry', 'Trigonometric ratios', 'Special angles'],
    weightage: 1
  },
  {
    id: 'L3_MATH_08',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Square Roots',
    questionText: 'Value of √49',
    options: [
      { label: 'A', text: '5' },
      { label: 'B', text: '6' },
      { label: 'C', text: '7' },
      { label: 'D', text: '8' }
    ],
    correctAnswer: 'C',
    explanation: '√49 = 7 because 7² = 49',
    difficulty: 'easy',
    skills: ['Square roots', 'Perfect squares', 'Arithmetic'],
    weightage: 1
  },
  {
    id: 'L3_MATH_09',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Area',
    questionText: 'Area of triangle = ½ × b × h.\nBase=8, height=5',
    options: [
      { label: 'A', text: '10' },
      { label: 'B', text: '12' },
      { label: 'C', text: '15' },
      { label: 'D', text: '20' }
    ],
    correctAnswer: 'D',
    explanation: 'Area = ½ × 8 × 5 = 20 square units',
    difficulty: 'easy',
    skills: ['Area', 'Triangle', 'Formula application'],
    weightage: 1
  },
  {
    id: 'L3_MATH_10',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Commercial Math',
    questionText: 'Compound interest principle formula depends on:',
    options: [
      { label: 'A', text: 'Rate & time' },
      { label: 'B', text: 'Only principal' },
      { label: 'C', text: 'Only time' },
      { label: 'D', text: 'None' }
    ],
    correctAnswer: 'A',
    explanation: 'Compound interest depends on Principal, Rate, and Time',
    difficulty: 'medium',
    skills: ['Commercial math', 'Compound interest', 'Formulas'],
    weightage: 1
  },

  // CLASS 10 PHYSICS READINESS (5 Questions)
  {
    id: 'L3_PHY_01',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Refraction',
    questionText: 'Refractive index is:',
    options: [
      { label: 'A', text: 'c/v' },
      { label: 'B', text: 'v/c' },
      { label: 'C', text: 'v×c' },
      { label: 'D', text: 'c×v' }
    ],
    correctAnswer: 'A',
    explanation: 'Refractive index (n) = speed of light in vacuum (c) / speed of light in medium (v)',
    difficulty: 'medium',
    skills: ['Refraction', 'Light', 'Formulas'],
    weightage: 1
  },
  {
    id: 'L3_PHY_02',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Electricity',
    questionText: 'Unit of electric current:',
    options: [
      { label: 'A', text: 'Volt' },
      { label: 'B', text: 'Ampere' },
      { label: 'C', text: 'Ohm' },
      { label: 'D', text: 'Watt' }
    ],
    correctAnswer: 'B',
    explanation: 'The SI unit of electric current is Ampere (A)',
    difficulty: 'easy',
    skills: ['Electricity', 'Units', 'Current'],
    weightage: 1
  },
  {
    id: 'L3_PHY_03',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Household Circuits',
    questionText: 'Fuse wire is made of:',
    options: [
      { label: 'A', text: 'High melting point metal' },
      { label: 'B', text: 'Low melting point alloy' },
      { label: 'C', text: 'Plastic' },
      { label: 'D', text: 'Copper pipe' }
    ],
    correctAnswer: 'B',
    explanation: 'Fuse wire has low melting point so it melts and breaks circuit during overload',
    difficulty: 'medium',
    skills: ['Household circuits', 'Safety devices', 'Electricity'],
    weightage: 1
  },
  {
    id: 'L3_PHY_04',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Lenses',
    questionText: 'Lens that converges light:',
    options: [
      { label: 'A', text: 'Concave' },
      { label: 'B', text: 'Convex' },
      { label: 'C', text: 'Plano-concave' },
      { label: 'D', text: 'Cylindrical' }
    ],
    correctAnswer: 'B',
    explanation: 'Convex lens converges (focuses) light rays',
    difficulty: 'easy',
    skills: ['Lenses', 'Light', 'Optics'],
    weightage: 1
  },
  {
    id: 'L3_PHY_05',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Power',
    questionText: 'Formula for power:',
    options: [
      { label: 'A', text: 'VI' },
      { label: 'B', text: 'V/I' },
      { label: 'C', text: 'I/V' },
      { label: 'D', text: 'IR²' }
    ],
    correctAnswer: 'A',
    explanation: 'Electric power P = V × I (Voltage × Current)',
    difficulty: 'easy',
    skills: ['Power', 'Electricity', 'Formulas'],
    weightage: 1
  },

  // CLASS 10 CHEMISTRY READINESS (5 Questions)
  {
    id: 'L3_CHEM_01',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Periodic Table',
    questionText: 'Valency of Nitrogen:',
    options: [
      { label: 'A', text: '1' },
      { label: 'B', text: '2' },
      { label: 'C', text: '3' },
      { label: 'D', text: '4' }
    ],
    correctAnswer: 'C',
    explanation: 'Nitrogen has valency 3 (needs 3 electrons to complete outer shell)',
    difficulty: 'easy',
    skills: ['Valency', 'Periodic table', 'Chemical bonding'],
    weightage: 1
  },
  {
    id: 'L3_CHEM_02',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Acids and Bases',
    questionText: 'Acid turns blue litmus:',
    options: [
      { label: 'A', text: 'Blue' },
      { label: 'B', text: 'Green' },
      { label: 'C', text: 'Red' },
      { label: 'D', text: 'Yellow' }
    ],
    correctAnswer: 'C',
    explanation: 'Acid turns blue litmus paper to red',
    difficulty: 'easy',
    skills: ['Acids and bases', 'Indicators', 'Chemical properties'],
    weightage: 1
  },
  {
    id: 'L3_CHEM_03',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Mole Concept',
    questionText: 'Mole concept: 1 mole contains:',
    options: [
      { label: 'A', text: '6.022×10²³' },
      { label: 'B', text: '3.14×10²³' },
      { label: 'C', text: '2.01×10²³' },
      { label: 'D', text: '1×10³⁰' }
    ],
    correctAnswer: 'A',
    explanation: '1 mole contains Avogadro\'s number = 6.022×10²³ particles',
    difficulty: 'medium',
    skills: ['Mole concept', 'Avogadro number', 'Stoichiometry'],
    weightage: 1
  },
  {
    id: 'L3_CHEM_04',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Organic Chemistry',
    questionText: 'Ethanol formula:',
    options: [
      { label: 'A', text: 'C₂H₅OH' },
      { label: 'B', text: 'CH₄' },
      { label: 'C', text: 'C₂H₂' },
      { label: 'D', text: 'C₆H₆' }
    ],
    correctAnswer: 'A',
    explanation: 'Ethanol (alcohol) has formula C₂H₅OH',
    difficulty: 'easy',
    skills: ['Organic chemistry', 'Chemical formulas', 'Compounds'],
    weightage: 1
  },
  {
    id: 'L3_CHEM_05',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Chemical Reactions',
    questionText: 'Rusting requires:',
    options: [
      { label: 'A', text: 'Oxygen only' },
      { label: 'B', text: 'Water only' },
      { label: 'C', text: 'Water + Oxygen' },
      { label: 'D', text: 'Acid' }
    ],
    correctAnswer: 'C',
    explanation: 'Rusting of iron requires both water and oxygen (air)',
    difficulty: 'easy',
    skills: ['Chemical reactions', 'Corrosion', 'Oxidation'],
    weightage: 1
  },

  // CLASS 10 BIOLOGY READINESS (5 Questions)
  {
    id: 'L3_BIO_01',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Excretion',
    questionText: 'Kidney filters:',
    options: [
      { label: 'A', text: 'Plasma' },
      { label: 'B', text: 'Urine only' },
      { label: 'C', text: 'Blood' },
      { label: 'D', text: 'Lymph' }
    ],
    correctAnswer: 'C',
    explanation: 'Kidney filters blood to remove waste and form urine',
    difficulty: 'easy',
    skills: ['Excretory system', 'Kidney function', 'Human physiology'],
    weightage: 1
  },
  {
    id: 'L3_BIO_02',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Nervous System',
    questionText: 'Unit of nervous system:',
    options: [
      { label: 'A', text: 'Neuron' },
      { label: 'B', text: 'Axon' },
      { label: 'C', text: 'Dendrite' },
      { label: 'D', text: 'Brain' }
    ],
    correctAnswer: 'A',
    explanation: 'Neuron (nerve cell) is the functional unit of nervous system',
    difficulty: 'easy',
    skills: ['Nervous system', 'Cell biology', 'Human physiology'],
    weightage: 1
  },
  {
    id: 'L3_BIO_03',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Reproduction',
    questionText: 'Placenta connects:',
    options: [
      { label: 'A', text: 'Mother ↔ air' },
      { label: 'B', text: 'Baby ↔ outside' },
      { label: 'C', text: 'Mother ↔ fetus' },
      { label: 'D', text: 'Amniotic fluid only' }
    ],
    correctAnswer: 'C',
    explanation: 'Placenta connects mother to fetus for nutrient and oxygen exchange',
    difficulty: 'easy',
    skills: ['Reproduction', 'Human development', 'Pregnancy'],
    weightage: 1
  },
  {
    id: 'L3_BIO_04',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Photosynthesis',
    questionText: 'Photosynthesis uses:',
    options: [
      { label: 'A', text: 'CO₂ + water' },
      { label: 'B', text: 'O₂ + water' },
      { label: 'C', text: 'Nitrogen' },
      { label: 'D', text: 'Minerals only' }
    ],
    correctAnswer: 'A',
    explanation: 'Photosynthesis uses carbon dioxide (CO₂) and water to make glucose',
    difficulty: 'easy',
    skills: ['Photosynthesis', 'Plant biology', 'Life processes'],
    weightage: 1
  },
  {
    id: 'L3_BIO_05',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Genetics',
    questionText: 'Genetics deals with:',
    options: [
      { label: 'A', text: 'Blood' },
      { label: 'B', text: 'Inheritance' },
      { label: 'C', text: 'Metabolism' },
      { label: 'D', text: 'Growth' }
    ],
    correctAnswer: 'B',
    explanation: 'Genetics is the study of inheritance and heredity',
    difficulty: 'easy',
    skills: ['Genetics', 'Heredity', 'Biology concepts'],
    weightage: 1
  },

  // CLASS 10 ENGLISH READINESS (5 Questions)
  {
    id: 'L3_ENG_01',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Grammar',
    questionText: 'Choose best replacement:\n"She said me to go."',
    options: [
      { label: 'A', text: 'She told me to go.' },
      { label: 'B', text: 'She said to me to go.' },
      { label: 'C', text: 'She asked go.' },
      { label: 'D', text: 'She telling me go.' }
    ],
    correctAnswer: 'A',
    explanation: 'Correct form: She told me to go (told + object + infinitive)',
    difficulty: 'medium',
    skills: ['Grammar', 'Verb patterns', 'Sentence correction'],
    weightage: 1
  },
  {
    id: 'L3_ENG_02',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Prepositions',
    questionText: 'Fill blank: He insisted ___ going early.',
    options: [
      { label: 'A', text: 'to' },
      { label: 'B', text: 'for' },
      { label: 'C', text: 'in' },
      { label: 'D', text: 'on' }
    ],
    correctAnswer: 'D',
    explanation: 'Correct preposition: insisted ON',
    difficulty: 'medium',
    skills: ['Prepositions', 'Idiomatic usage', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L3_ENG_03',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Indirect Speech',
    questionText: 'Correct indirect speech:\nHe said, "I am tired."',
    options: [
      { label: 'A', text: 'He said that he was tired.' },
      { label: 'B', text: 'He said he is tired.' },
      { label: 'C', text: 'He said I was tired.' },
      { label: 'D', text: 'He said that I am tired.' }
    ],
    correctAnswer: 'A',
    explanation: 'In indirect speech: He said that he was tired (pronoun and tense change)',
    difficulty: 'medium',
    skills: ['Indirect speech', 'Reported speech', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L3_ENG_04',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Tenses',
    questionText: 'Choose correct tense:\nBy next year, I ___ completed the syllabus.',
    options: [
      { label: 'A', text: 'will' },
      { label: 'B', text: 'will have' },
      { label: 'C', text: 'have' },
      { label: 'D', text: 'had' }
    ],
    correctAnswer: 'B',
    explanation: 'Future perfect: will have completed (action completed by future time)',
    difficulty: 'medium',
    skills: ['Tenses', 'Future perfect', 'Grammar'],
    weightage: 1
  },
  {
    id: 'L3_ENG_05',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Writing Skills',
    questionText: 'Choose the best title for a passage about solar energy:',
    options: [
      { label: 'A', text: 'Sunlight is hot' },
      { label: 'B', text: 'Solar Energy – Future Power' },
      { label: 'C', text: 'Why summer comes' },
      { label: 'D', text: 'The story of planets' }
    ],
    correctAnswer: 'B',
    explanation: 'Best title is informative and relevant: Solar Energy – Future Power',
    difficulty: 'easy',
    skills: ['Writing skills', 'Title selection', 'Comprehension'],
    weightage: 1
  }
];

// ============================================================================
// LAYER 4: PSYCHOLOGICAL & STUDY MINDSET - 10 Questions
// ============================================================================

export const layer4Questions: Question[] = [
  {
    id: 'L4_PSY_01',
    layerId: 4,
    category: 'Study Consistency',
    subcategory: 'Revision Habits',
    questionText: 'How often do you revise topics?',
    options: [
      { label: 'A', text: 'Daily' },
      { label: 'B', text: 'Weekly' },
      { label: 'C', text: 'Before exams only' },
      { label: 'D', text: 'Rarely' }
    ],
    correctAnswer: 'A', // Best practice
    explanation: 'Regular daily revision leads to better retention and understanding',
    difficulty: 'easy',
    skills: ['Study habits', 'Consistency', 'Time management'],
    weightage: 1
  },
  {
    id: 'L4_PSY_02',
    layerId: 4,
    category: 'Grit & Perseverance',
    subcategory: 'Problem Solving Approach',
    questionText: 'When you face a difficult chapter, you:',
    options: [
      { label: 'A', text: 'Try again' },
      { label: 'B', text: 'Take help' },
      { label: 'C', text: 'Delay it' },
      { label: 'D', text: 'Skip it' }
    ],
    correctAnswer: 'B', // Most practical topper approach
    explanation: 'Seeking help when stuck is a sign of maturity and effective learning',
    difficulty: 'easy',
    skills: ['Problem solving', 'Resilience', 'Learning strategies'],
    weightage: 1
  },
  {
    id: 'L4_PSY_03',
    layerId: 4,
    category: 'Attention Span',
    subcategory: 'Focus Duration',
    questionText: 'How long can you study with full concentration?',
    options: [
      { label: 'A', text: '1 hour+' },
      { label: 'B', text: '45 min' },
      { label: 'C', text: '20 min' },
      { label: 'D', text: 'Less than 10 min' }
    ],
    correctAnswer: 'A', // Topper level
    explanation: 'Toppers can maintain focus for extended periods with proper breaks',
    difficulty: 'easy',
    skills: ['Concentration', 'Focus', 'Mental stamina'],
    weightage: 1
  },
  {
    id: 'L4_PSY_04',
    layerId: 4,
    category: 'Distraction Management',
    subcategory: 'Main Distraction',
    questionText: 'What causes most distraction?',
    options: [
      { label: 'A', text: 'Mobile' },
      { label: 'B', text: 'Overthinking' },
      { label: 'C', text: 'Noise' },
      { label: 'D', text: 'Boredom' }
    ],
    correctAnswer: 'A', // Most common modern distraction
    explanation: 'Mobile phones are the biggest distraction for students; awareness is key',
    difficulty: 'easy',
    skills: ['Self-awareness', 'Distraction management', 'Study environment'],
    weightage: 1
  },
  {
    id: 'L4_PSY_05',
    layerId: 4,
    category: 'Stress & Anxiety',
    subcategory: 'Exam Anxiety Level',
    questionText: 'Rate your exam anxiety:',
    options: [
      { label: 'A', text: 'Very high' },
      { label: 'B', text: 'High' },
      { label: 'C', text: 'Moderate' },
      { label: 'D', text: 'Low' }
    ],
    correctAnswer: 'C', // Moderate is healthy
    explanation: 'Moderate anxiety is optimal; too much or too little affects performance',
    difficulty: 'easy',
    skills: ['Stress management', 'Emotional awareness', 'Mental health'],
    weightage: 1
  },
  {
    id: 'L4_PSY_06',
    layerId: 4,
    category: 'Discipline',
    subcategory: 'Homework Completion',
    questionText: 'Homework completion habit:',
    options: [
      { label: 'A', text: 'Always on time' },
      { label: 'B', text: 'Mostly on time' },
      { label: 'C', text: 'Sometimes late' },
      { label: 'D', text: 'Frequently late' }
    ],
    correctAnswer: 'A', // Topper trait
    explanation: 'Timely homework completion indicates discipline and commitment',
    difficulty: 'easy',
    skills: ['Discipline', 'Time management', 'Responsibility'],
    weightage: 1
  },
  {
    id: 'L4_PSY_07',
    layerId: 4,
    category: 'Goal Setting',
    subcategory: 'Weekly Planning',
    questionText: 'Do you set weekly goals?',
    options: [
      { label: 'A', text: 'Yes' },
      { label: 'B', text: 'Sometimes' },
      { label: 'C', text: 'Rarely' },
      { label: 'D', text: 'Never' }
    ],
    correctAnswer: 'A', // Essential for success
    explanation: 'Regular goal-setting helps maintain focus and track progress',
    difficulty: 'easy',
    skills: ['Goal setting', 'Planning', 'Self-organization'],
    weightage: 1
  },
  {
    id: 'L4_PSY_08',
    layerId: 4,
    category: 'Self-Belief',
    subcategory: 'Math Confidence',
    questionText: 'Confidence in Maths:',
    options: [
      { label: 'A', text: 'High' },
      { label: 'B', text: 'Medium' },
      { label: 'C', text: 'Low' },
      { label: 'D', text: 'Very low' }
    ],
    correctAnswer: 'A', // Topper mindset
    explanation: 'Subject confidence is built through practice and mastery',
    difficulty: 'easy',
    skills: ['Self-confidence', 'Academic self-concept', 'Subject attitude'],
    weightage: 1
  },
  {
    id: 'L4_PSY_09',
    layerId: 4,
    category: 'Self-Belief',
    subcategory: 'English Confidence',
    questionText: 'Confidence in English writing:',
    options: [
      { label: 'A', text: 'High' },
      { label: 'B', text: 'Medium' },
      { label: 'C', text: 'Low' },
      { label: 'D', text: 'Very low' }
    ],
    correctAnswer: 'A', // Topper trait
    explanation: 'Strong writing confidence comes from regular practice and feedback',
    difficulty: 'easy',
    skills: ['Writing confidence', 'Language skills', 'Self-assessment'],
    weightage: 1
  },
  {
    id: 'L4_PSY_10',
    layerId: 4,
    category: 'Ambition & Goals',
    subcategory: 'Academic Target',
    questionText: 'Your yearly ambition:',
    options: [
      { label: 'A', text: 'Above 90%' },
      { label: 'B', text: '80–90%' },
      { label: 'C', text: '60–80%' },
      { label: 'D', text: 'Below 60%' }
    ],
    correctAnswer: 'A', // Highest aspiration
    explanation: 'High aspirations combined with effort lead to better performance',
    difficulty: 'easy',
    skills: ['Goal clarity', 'Ambition', 'Self-motivation'],
    weightage: 1
  }
];

// ============================================================================
// COMBINED QUESTION BANK
// ============================================================================

export const allQuestions: Question[] = [
  ...layer1Questions,
  ...layer2Questions,
  ...layer3Questions,
  ...layer4Questions
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getQuestionsByLayer(layerId: 1 | 2 | 3 | 4): Question[] {
  return allQuestions.filter(q => q.layerId === layerId);
}

export function getQuestionsByCategory(category: string): Question[] {
  return allQuestions.filter(q => q.category === category);
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find(q => q.id === id);
}

export const layerMetadata = {
  1: {
    title: 'Cognitive & Learning Readiness',
    duration: 25,
    totalQuestions: 25,
    description: 'Tests working memory, logical reasoning, processing speed, and attention'
  },
  2: {
    title: 'Academic Foundation (Classes 6-9)',
    duration: 35,
    totalQuestions: 35,
    description: 'Prerequisites in Math, Science, English, and Humanities'
  },
  3: {
    title: 'ICSE Class 10 Readiness',
    duration: 30,
    totalQuestions: 30,
    description: 'Subject-specific readiness for current syllabus'
  },
  4: {
    title: 'Psychological & Study Mindset',
    duration: 10,
    totalQuestions: 10,
    description: 'Study habits, consistency, and psychological readiness'
  }
};
