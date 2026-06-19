// ============================================================================
// DIAGNOSTIC ASSESSMENT - PARTS E, F, G (Additional Questions)
// ============================================================================
// Part E: History/Geography Foundation (10 additional questions) - L2_HG_06 to L2_HG_20
// Part F: Class 10 Readiness (80 questions) - L3_MATH_11 to L3_ENG_25
// Part G: Psychological & Study Mindset (25 questions) - L4_PSY_11 to L4_PSY_35
// ============================================================================
// TOTAL: 115 Additional Questions
// To be merged with existing diagnosticQuestions.ts
// ============================================================================

import { Question } from '../types/assessment';

// ============================================================================
// PART E: HISTORY & GEOGRAPHY FOUNDATION - Additional 10 Questions
// Adds to existing L2_HG_01 to L2_HG_05 (making total 15 questions)
// ============================================================================

export const partE_HistoryGeography: Question[] = [
  // Section 1: History Foundation (8 Questions)
  {
    id: 'L2_HG_06',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Indian History',
    questionText: 'Who was the first Mughal emperor of India?',
    options: [
      { label: 'A', text: 'Akbar' },
      { label: 'B', text: 'Babur' },
      { label: 'C', text: 'Humayun' },
      { label: 'D', text: 'Jahangir' }
    ],
    correctAnswer: 'B',
    explanation: 'Babur founded the Mughal Empire in 1526 after the Battle of Panipat',
    difficulty: 'easy',
    skills: ['Indian history', 'Mughal Empire', 'Historical facts'],
    weightage: 1
  },
  {
    id: 'L2_HG_07',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Indian History',
    questionText: 'The Revolt of 1857 is also known as:',
    options: [
      { label: 'A', text: 'The First War of Independence' },
      { label: 'B', text: 'The Sepoy Conspiracy' },
      { label: 'C', text: 'The Battle of Plassey' },
      { label: 'D', text: 'The Delhi Uprising' }
    ],
    correctAnswer: 'A',
    explanation: 'The Revolt of 1857 is also called the First War of Indian Independence',
    difficulty: 'easy',
    skills: ['Indian history', 'Freedom movement', 'Historical events'],
    weightage: 1
  },
  {
    id: 'L2_HG_08',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Ancient India',
    questionText: 'Who founded the Mauryan Empire?',
    options: [
      { label: 'A', text: 'Ashoka' },
      { label: 'B', text: 'Chanakya' },
      { label: 'C', text: 'Chandragupta Maurya' },
      { label: 'D', text: 'Bindusara' }
    ],
    correctAnswer: 'C',
    explanation: 'Chandragupta Maurya founded the Mauryan Empire around 321 BCE with help from Chanakya',
    difficulty: 'medium',
    skills: ['Ancient Indian history', 'Empires', 'Historical figures'],
    weightage: 1
  },
  {
    id: 'L2_HG_09',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Indian History',
    questionText: 'The capital city of the Vijayanagara Empire was:',
    options: [
      { label: 'A', text: 'Mathura' },
      { label: 'B', text: 'Hampi' },
      { label: 'C', text: 'Kalinga' },
      { label: 'D', text: 'Pataliputra' }
    ],
    correctAnswer: 'B',
    explanation: 'Hampi (in present-day Karnataka) was the capital of the Vijayanagara Empire',
    difficulty: 'medium',
    skills: ['Indian history', 'Medieval India', 'Historical geography'],
    weightage: 1
  },
  {
    id: 'L2_HG_10',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Freedom Movement',
    questionText: 'Which movement was launched by Mahatma Gandhi in 1942?',
    options: [
      { label: 'A', text: 'Non-Cooperation Movement' },
      { label: 'B', text: 'Quit India Movement' },
      { label: 'C', text: 'Civil Disobedience Movement' },
      { label: 'D', text: 'Swadeshi Movement' }
    ],
    correctAnswer: 'B',
    explanation: 'The Quit India Movement (Bharat Chhodo Andolan) was launched in 1942',
    difficulty: 'medium',
    skills: ['Freedom movement', 'Gandhi', 'Modern Indian history'],
    weightage: 1
  },
  {
    id: 'L2_HG_11',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Indian History',
    questionText: 'The Indian National Congress was founded in:',
    options: [
      { label: 'A', text: '1875' },
      { label: 'B', text: '1880' },
      { label: 'C', text: '1885' },
      { label: 'D', text: '1900' }
    ],
    correctAnswer: 'C',
    explanation: 'The Indian National Congress was founded in 1885 by A.O. Hume',
    difficulty: 'easy',
    skills: ['Indian history', 'Political movements', 'Historical dates'],
    weightage: 1
  },
  {
    id: 'L2_HG_12',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Ancient India',
    questionText: 'Ashoka embraced Buddhism after:',
    options: [
      { label: 'A', text: 'Battle of Plassey' },
      { label: 'B', text: 'Battle of Haldighati' },
      { label: 'C', text: 'Kalinga War' },
      { label: 'D', text: 'Panipat War' }
    ],
    correctAnswer: 'C',
    explanation: 'Emperor Ashoka embraced Buddhism after witnessing the bloodshed in the Kalinga War',
    difficulty: 'medium',
    skills: ['Ancient history', 'Buddhism', 'Historical events'],
    weightage: 1
  },
  {
    id: 'L2_HG_13',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Freedom Movement',
    questionText: 'What does "Satyagraha" mean?',
    options: [
      { label: 'A', text: 'Peaceful war' },
      { label: 'B', text: 'Truth-force' },
      { label: 'C', text: 'Self-sacrifice' },
      { label: 'D', text: 'Power protest' }
    ],
    correctAnswer: 'B',
    explanation: 'Satyagraha literally means "truth-force" or "insistence on truth"',
    difficulty: 'medium',
    skills: ['Gandhi philosophy', 'Freedom movement', 'Concepts'],
    weightage: 1
  },

  // Section 2: Geography Foundation (7 Questions)
  {
    id: 'L2_HG_14',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Indian Geography',
    questionText: 'The Tropic of Cancer passes through which Indian state?',
    options: [
      { label: 'A', text: 'Tamil Nadu' },
      { label: 'B', text: 'Gujarat' },
      { label: 'C', text: 'Kerala' },
      { label: 'D', text: 'Punjab' }
    ],
    correctAnswer: 'B',
    explanation: 'The Tropic of Cancer passes through Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram',
    difficulty: 'medium',
    skills: ['Indian geography', 'Latitude lines', 'Physical geography'],
    weightage: 1
  },
  {
    id: 'L2_HG_15',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'World Geography',
    questionText: 'The largest continent is:',
    options: [
      { label: 'A', text: 'Africa' },
      { label: 'B', text: 'Asia' },
      { label: 'C', text: 'Europe' },
      { label: 'D', text: 'North America' }
    ],
    correctAnswer: 'B',
    explanation: 'Asia is the largest continent covering about 44.58 million km²',
    difficulty: 'easy',
    skills: ['World geography', 'Continents', 'General knowledge'],
    weightage: 1
  },
  {
    id: 'L2_HG_16',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Climate',
    questionText: 'The "Monsoon" refers to:',
    options: [
      { label: 'A', text: 'Seasonal winds' },
      { label: 'B', text: 'Cyclones' },
      { label: 'C', text: 'Storms' },
      { label: 'D', text: 'Temperature rise' }
    ],
    correctAnswer: 'A',
    explanation: 'Monsoon refers to seasonal reversing winds, especially bringing rain to South Asia',
    difficulty: 'easy',
    skills: ['Climate', 'Weather patterns', 'Indian geography'],
    weightage: 1
  },
  {
    id: 'L2_HG_17',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Indian Geography',
    questionText: 'Which river is known as the "Sorrow of Bengal"?',
    options: [
      { label: 'A', text: 'Ganga' },
      { label: 'B', text: 'Brahmaputra' },
      { label: 'C', text: 'Damodar' },
      { label: 'D', text: 'Hooghly' }
    ],
    correctAnswer: 'C',
    explanation: 'Damodar river was called "Sorrow of Bengal" due to frequent devastating floods (now controlled by dams)',
    difficulty: 'medium',
    skills: ['Indian geography', 'Rivers', 'Regional geography'],
    weightage: 1
  },
  {
    id: 'L2_HG_18',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Resources',
    questionText: 'Which of the following is an example of a renewable resource?',
    options: [
      { label: 'A', text: 'Coal' },
      { label: 'B', text: 'Petroleum' },
      { label: 'C', text: 'Solar energy' },
      { label: 'D', text: 'Natural gas' }
    ],
    correctAnswer: 'C',
    explanation: 'Solar energy is renewable as it is naturally replenished, unlike fossil fuels',
    difficulty: 'easy',
    skills: ['Resources', 'Environment', 'Sustainability'],
    weightage: 1
  },
  {
    id: 'L2_HG_19',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Physical Geography',
    questionText: 'The layer of Earth where earthquakes originate:',
    options: [
      { label: 'A', text: 'Crust' },
      { label: 'B', text: 'Mantle' },
      { label: 'C', text: 'Outer core' },
      { label: 'D', text: 'Lithosphere' }
    ],
    correctAnswer: 'A',
    explanation: 'Most earthquakes originate in the Earth\'s crust (upper lithosphere)',
    difficulty: 'medium',
    skills: ['Physical geography', 'Earth structure', 'Geology'],
    weightage: 1
  },
  {
    id: 'L2_HG_20',
    layerId: 2,
    category: 'History/Geography Foundation',
    subcategory: 'Measurement',
    questionText: 'The instrument used to measure rainfall is:',
    options: [
      { label: 'A', text: 'Thermometer' },
      { label: 'B', text: 'Hygrometer' },
      { label: 'C', text: 'Rain gauge' },
      { label: 'D', text: 'Barometer' }
    ],
    correctAnswer: 'C',
    explanation: 'A rain gauge is used to measure the amount of rainfall',
    difficulty: 'easy',
    skills: ['Meteorology', 'Instruments', 'Measurement'],
    weightage: 1
  }
];

// ============================================================================
// PART F: CLASS 10 READINESS ASSESSMENT (80 Questions)
// ============================================================================
// These are Layer 3 questions - evaluating Class 10 preparedness
// Mathematics: 20 Q, Physics: 15 Q, Chemistry: 15 Q, Biology: 15 Q, English: 15 Q
// ============================================================================

export const partF_Class10Readiness: Question[] = [
  // ====================
  // SECTION 1: CLASS 10 MATHEMATICS (20 Questions)
  // ====================
  {
    id: 'L3_MATH_11',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Linear Equations',
    questionText: 'Solve: 2x – 3 = 17',
    options: [
      { label: 'A', text: '8' },
      { label: 'B', text: '9' },
      { label: 'C', text: '10' },
      { label: 'D', text: '11' }
    ],
    correctAnswer: 'C',
    explanation: '2x = 17 + 3 = 20, so x = 10',
    difficulty: 'easy',
    skills: ['Linear equations', 'Algebra', 'Problem solving'],
    weightage: 2
  },
  {
    id: 'L3_MATH_12',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Quadratic Equations',
    questionText: 'If (x – 3)(x + 5) = 0, the roots are:',
    options: [
      { label: 'A', text: '3, –5' },
      { label: 'B', text: '–3, 5' },
      { label: 'C', text: '–3, –5' },
      { label: 'D', text: '3, 5' }
    ],
    correctAnswer: 'A',
    explanation: 'If (x – 3)(x + 5) = 0, then x – 3 = 0 or x + 5 = 0, giving x = 3 or x = –5',
    difficulty: 'medium',
    skills: ['Quadratic equations', 'Factorization', 'Roots'],
    weightage: 2
  },
  {
    id: 'L3_MATH_13',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Trigonometry',
    questionText: 'Value of sin²30° + cos²30° =',
    options: [
      { label: 'A', text: '0' },
      { label: 'B', text: '1' },
      { label: 'C', text: '2' },
      { label: 'D', text: '1/2' }
    ],
    correctAnswer: 'B',
    explanation: 'Trigonometric identity: sin²θ + cos²θ = 1 for any angle θ',
    difficulty: 'medium',
    skills: ['Trigonometry', 'Identities', 'Trigonometric ratios'],
    weightage: 2
  },
  {
    id: 'L3_MATH_14',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Trigonometry',
    questionText: 'tan 45° × cot 45° =',
    options: [
      { label: 'A', text: '0' },
      { label: 'B', text: '1' },
      { label: 'C', text: 'Undefined' },
      { label: 'D', text: '45' }
    ],
    correctAnswer: 'B',
    explanation: 'tan θ × cot θ = 1 (since cot θ = 1/tan θ)',
    difficulty: 'easy',
    skills: ['Trigonometry', 'Reciprocal ratios', 'Simplification'],
    weightage: 2
  },
  {
    id: 'L3_MATH_15',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Surds',
    questionText: 'The value of √75 is:',
    options: [
      { label: 'A', text: '5√3' },
      { label: 'B', text: '3√5' },
      { label: 'C', text: '√15' },
      { label: 'D', text: '15√3' }
    ],
    correctAnswer: 'A',
    explanation: '√75 = √(25×3) = √25 × √3 = 5√3',
    difficulty: 'medium',
    skills: ['Surds', 'Square roots', 'Simplification'],
    weightage: 2
  },
  {
    id: 'L3_MATH_16',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Algebraic Identities',
    questionText: 'If a = 5, b = –3, find a² – b²',
    options: [
      { label: 'A', text: '16' },
      { label: 'B', text: '25' },
      { label: 'C', text: '34' },
      { label: 'D', text: '16' }
    ],
    correctAnswer: 'A',
    explanation: 'a² – b² = 5² – (–3)² = 25 – 9 = 16',
    difficulty: 'easy',
    skills: ['Algebraic identities', 'Substitution', 'Calculation'],
    weightage: 2
  },
  {
    id: 'L3_MATH_17',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Coordinate Geometry',
    questionText: 'Distance between points (2,3) and (6,3):',
    options: [
      { label: 'A', text: '2' },
      { label: 'B', text: '3' },
      { label: 'C', text: '4' },
      { label: 'D', text: '5' }
    ],
    correctAnswer: 'C',
    explanation: 'Distance = √[(6-2)² + (3-3)²] = √[16 + 0] = 4',
    difficulty: 'easy',
    skills: ['Coordinate geometry', 'Distance formula', 'Calculation'],
    weightage: 2
  },
  {
    id: 'L3_MATH_18',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Coordinate Geometry',
    questionText: 'A line parallel to x-axis has slope:',
    options: [
      { label: 'A', text: '0' },
      { label: 'B', text: '1' },
      { label: 'C', text: 'Undefined' },
      { label: 'D', text: 'Infinite' }
    ],
    correctAnswer: 'A',
    explanation: 'A horizontal line (parallel to x-axis) has slope = 0',
    difficulty: 'easy',
    skills: ['Coordinate geometry', 'Slope', 'Line properties'],
    weightage: 2
  },
  {
    id: 'L3_MATH_19',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Statistics',
    questionText: 'Median of: 12, 15, 20, 25, 30',
    options: [
      { label: 'A', text: '15' },
      { label: 'B', text: '20' },
      { label: 'C', text: '22' },
      { label: 'D', text: '25' }
    ],
    correctAnswer: 'B',
    explanation: 'For odd number of values, median is the middle value = 20',
    difficulty: 'easy',
    skills: ['Statistics', 'Median', 'Central tendency'],
    weightage: 2
  },
  {
    id: 'L3_MATH_20',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Statistics',
    questionText: 'Mean of 6, 9, 12, 15, 18',
    options: [
      { label: 'A', text: '10' },
      { label: 'B', text: '12' },
      { label: 'C', text: '15' },
      { label: 'D', text: '20' }
    ],
    correctAnswer: 'B',
    explanation: 'Mean = (6+9+12+15+18)/5 = 60/5 = 12',
    difficulty: 'easy',
    skills: ['Statistics', 'Mean', 'Average'],
    weightage: 2
  },
  {
    id: 'L3_MATH_21',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Pythagoras Theorem',
    questionText: 'In a right triangle, hypotenuse = 13, one side = 5. Other side =',
    options: [
      { label: 'A', text: '8' },
      { label: 'B', text: '10' },
      { label: 'C', text: '12' },
      { label: 'D', text: '14' }
    ],
    correctAnswer: 'C',
    explanation: 'By Pythagoras theorem: other side = √(13² – 5²) = √(169 – 25) = √144 = 12',
    difficulty: 'medium',
    skills: ['Pythagoras theorem', 'Geometry', 'Square roots'],
    weightage: 2
  },
  {
    id: 'L3_MATH_22',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Financial Math',
    questionText: 'Compound interest depends on:',
    options: [
      { label: 'A', text: 'P only' },
      { label: 'B', text: 'P, R, T' },
      { label: 'C', text: 'R and T only' },
      { label: 'D', text: 'None' }
    ],
    correctAnswer: 'B',
    explanation: 'Compound Interest depends on Principal (P), Rate (R), and Time (T)',
    difficulty: 'easy',
    skills: ['Financial mathematics', 'Compound interest', 'Concepts'],
    weightage: 2
  },
  {
    id: 'L3_MATH_23',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Ratio & Percentage',
    questionText: 'Ratio 3:7 in percentage:',
    options: [
      { label: 'A', text: '30%' },
      { label: 'B', text: '42%' },
      { label: 'C', text: '70%' },
      { label: 'D', text: '75%' }
    ],
    correctAnswer: 'B',
    explanation: 'Part/Total = 3/(3+7) = 3/10 = 0.30 = 30% for first part; or (3/7)×100 ≈ 42.86% ≈ 42%',
    difficulty: 'medium',
    skills: ['Ratios', 'Percentage', 'Conversion'],
    weightage: 2
  },
  {
    id: 'L3_MATH_24',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Matrices',
    questionText: 'If matrix A has order 2×3 and B has order 3×2, AB has order:',
    options: [
      { label: 'A', text: '2×2' },
      { label: 'B', text: '3×3' },
      { label: 'C', text: '2×3' },
      { label: 'D', text: '3×2' }
    ],
    correctAnswer: 'A',
    explanation: 'For matrix multiplication, if A is m×n and B is n×p, then AB is m×p. So 2×3 × 3×2 = 2×2',
    difficulty: 'medium',
    skills: ['Matrices', 'Matrix multiplication', 'Order'],
    weightage: 2
  },
  {
    id: 'L3_MATH_25',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Mensuration',
    questionText: 'Area of triangle with base 10 cm and height 12 cm:',
    options: [
      { label: 'A', text: '60 cm²' },
      { label: 'B', text: '120 cm²' },
      { label: 'C', text: '100 cm²' },
      { label: 'D', text: '80 cm²' }
    ],
    correctAnswer: 'A',
    explanation: 'Area of triangle = ½ × base × height = ½ × 10 × 12 = 60 cm²',
    difficulty: 'easy',
    skills: ['Mensuration', 'Area', 'Triangle'],
    weightage: 2
  },
  {
    id: 'L3_MATH_26',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Logarithms',
    questionText: 'Log₁₀(1) =',
    options: [
      { label: 'A', text: '0' },
      { label: 'B', text: '1' },
      { label: 'C', text: 'Undefined' },
      { label: 'D', text: '10' }
    ],
    correctAnswer: 'A',
    explanation: 'Log₁₀(1) = 0 because 10⁰ = 1',
    difficulty: 'easy',
    skills: ['Logarithms', 'Properties', 'Calculation'],
    weightage: 2
  },
  {
    id: 'L3_MATH_27',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Geometry',
    questionText: 'If two angles of a triangle are 45° and 55°, the third angle is:',
    options: [
      { label: 'A', text: '45°' },
      { label: 'B', text: '55°' },
      { label: 'C', text: '80°' },
      { label: 'D', text: '90°' }
    ],
    correctAnswer: 'C',
    explanation: 'Sum of angles in triangle = 180°. Third angle = 180° – 45° – 55° = 80°',
    difficulty: 'easy',
    skills: ['Geometry', 'Triangle properties', 'Angles'],
    weightage: 2
  },
  {
    id: 'L3_MATH_28',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Number Theory',
    questionText: 'HCF of 36 and 48 =',
    options: [
      { label: 'A', text: '6' },
      { label: 'B', text: '8' },
      { label: 'C', text: '12' },
      { label: 'D', text: '18' }
    ],
    correctAnswer: 'C',
    explanation: 'Factors of 36: 1,2,3,4,6,9,12,18,36; Factors of 48: 1,2,3,4,6,8,12,16,24,48. HCF = 12',
    difficulty: 'medium',
    skills: ['HCF', 'Number theory', 'Factorization'],
    weightage: 2
  },
  {
    id: 'L3_MATH_29',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Exponents',
    questionText: 'Evaluate 3⁻²',
    options: [
      { label: 'A', text: '1/9' },
      { label: 'B', text: '1/3' },
      { label: 'C', text: '3' },
      { label: 'D', text: '9' }
    ],
    correctAnswer: 'A',
    explanation: '3⁻² = 1/3² = 1/9',
    difficulty: 'easy',
    skills: ['Exponents', 'Negative powers', 'Calculation'],
    weightage: 2
  },
  {
    id: 'L3_MATH_30',
    layerId: 3,
    category: 'Class 10 Math Readiness',
    subcategory: 'Probability',
    questionText: 'The probability of getting a 3 on a fair die:',
    options: [
      { label: 'A', text: '1/3' },
      { label: 'B', text: '1/6' },
      { label: 'C', text: '1/2' },
      { label: 'D', text: '1/12' }
    ],
    correctAnswer: 'B',
    explanation: 'Probability = Favorable outcomes / Total outcomes = 1/6',
    difficulty: 'easy',
    skills: ['Probability', 'Basic concepts', 'Calculation'],
    weightage: 2
  },

  // ====================
  // SECTION 2: CLASS 10 PHYSICS (15 Questions)
  // ====================
  {
    id: 'L3_PHY_06',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Optics',
    questionText: 'Refractive index n =',
    options: [
      { label: 'A', text: 'v/c' },
      { label: 'B', text: 'c/v' },
      { label: 'C', text: 'v×c' },
      { label: 'D', text: 'c×v' }
    ],
    correctAnswer: 'B',
    explanation: 'Refractive index n = speed of light in vacuum (c) / speed of light in medium (v)',
    difficulty: 'medium',
    skills: ['Optics', 'Refraction', 'Formulas'],
    weightage: 2
  },
  {
    id: 'L3_PHY_07',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Optics',
    questionText: 'The power of a lens is measured in:',
    options: [
      { label: 'A', text: 'Watts' },
      { label: 'B', text: 'Newtons' },
      { label: 'C', text: 'Dioptres' },
      { label: 'D', text: 'Joules' }
    ],
    correctAnswer: 'C',
    explanation: 'Power of lens is measured in dioptres (D). Power = 1/focal length (in meters)',
    difficulty: 'easy',
    skills: ['Optics', 'Lens', 'Units'],
    weightage: 2
  },
  {
    id: 'L3_PHY_08',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Optics',
    questionText: 'A convex lens is also known as a:',
    options: [
      { label: 'A', text: 'Diverging lens' },
      { label: 'B', text: 'Converging lens' },
      { label: 'C', text: 'Cylindrical lens' },
      { label: 'D', text: 'Plano lens' }
    ],
    correctAnswer: 'B',
    explanation: 'Convex lens converges light rays, hence called converging lens',
    difficulty: 'easy',
    skills: ['Optics', 'Lenses', 'Classification'],
    weightage: 2
  },
  {
    id: 'L3_PHY_09',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Electricity',
    questionText: 'The unit of electric power is:',
    options: [
      { label: 'A', text: 'Volt' },
      { label: 'B', text: 'Watt' },
      { label: 'C', text: 'Ampere' },
      { label: 'D', text: 'Ohm' }
    ],
    correctAnswer: 'B',
    explanation: 'Electric power is measured in Watt (W). Power = Voltage × Current',
    difficulty: 'easy',
    skills: ['Electricity', 'Power', 'Units'],
    weightage: 2
  },
  {
    id: 'L3_PHY_10',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Electricity',
    questionText: 'The SI unit of resistance:',
    options: [
      { label: 'A', text: 'Volt' },
      { label: 'B', text: 'Joule' },
      { label: 'C', text: 'Ohm' },
      { label: 'D', text: 'Ampere' }
    ],
    correctAnswer: 'C',
    explanation: 'Resistance is measured in Ohm (Ω). By Ohm\'s law: R = V/I',
    difficulty: 'easy',
    skills: ['Electricity', 'Resistance', 'Units'],
    weightage: 2
  },
  {
    id: 'L3_PHY_11',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Heat',
    questionText: 'Which material is a good conductor of heat?',
    options: [
      { label: 'A', text: 'Wood' },
      { label: 'B', text: 'Plastic' },
      { label: 'C', text: 'Glass' },
      { label: 'D', text: 'Copper' }
    ],
    correctAnswer: 'D',
    explanation: 'Copper is an excellent conductor of heat (and electricity)',
    difficulty: 'easy',
    skills: ['Heat', 'Conductors', 'Material properties'],
    weightage: 2
  },
  {
    id: 'L3_PHY_12',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Magnetism',
    questionText: 'Magnetic field lines:',
    options: [
      { label: 'A', text: 'Intersect' },
      { label: 'B', text: 'Never intersect' },
      { label: 'C', text: 'Move randomly' },
      { label: 'D', text: 'Are straight only' }
    ],
    correctAnswer: 'B',
    explanation: 'Magnetic field lines never intersect because at any point, there can be only one direction of magnetic field',
    difficulty: 'medium',
    skills: ['Magnetism', 'Field lines', 'Properties'],
    weightage: 2
  },
  {
    id: 'L3_PHY_13',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Electricity',
    questionText: 'A fuse wire is made of:',
    options: [
      { label: 'A', text: 'High melting point alloy' },
      { label: 'B', text: 'Low melting point alloy' },
      { label: 'C', text: 'Steel' },
      { label: 'D', text: 'Carbon' }
    ],
    correctAnswer: 'B',
    explanation: 'Fuse wire is made of low melting point alloy so it melts and breaks circuit when excessive current flows',
    difficulty: 'medium',
    skills: ['Electricity', 'Safety devices', 'Material properties'],
    weightage: 2
  },
  {
    id: 'L3_PHY_14',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Heat',
    questionText: 'Heat travels fastest in:',
    options: [
      { label: 'A', text: 'Solids' },
      { label: 'B', text: 'Liquids' },
      { label: 'C', text: 'Gases' },
      { label: 'D', text: 'Vacuum' }
    ],
    correctAnswer: 'A',
    explanation: 'Heat travels fastest in solids through conduction due to closely packed particles',
    difficulty: 'medium',
    skills: ['Heat', 'Transfer', 'States of matter'],
    weightage: 2
  },
  {
    id: 'L3_PHY_15',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Work & Energy',
    questionText: 'Unit of work:',
    options: [
      { label: 'A', text: 'Newton' },
      { label: 'B', text: 'Watt' },
      { label: 'C', text: 'Joule' },
      { label: 'D', text: 'Dyne' }
    ],
    correctAnswer: 'C',
    explanation: 'Work is measured in Joule (J). Work = Force × Distance',
    difficulty: 'easy',
    skills: ['Work', 'Energy', 'Units'],
    weightage: 2
  },
  {
    id: 'L3_PHY_16',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Optics',
    questionText: 'A real image is always:',
    options: [
      { label: 'A', text: 'Inverted' },
      { label: 'B', text: 'Erect' },
      { label: 'C', text: 'Virtual' },
      { label: 'D', text: 'Small' }
    ],
    correctAnswer: 'A',
    explanation: 'Real images are always inverted and can be projected on a screen',
    difficulty: 'medium',
    skills: ['Optics', 'Image formation', 'Properties'],
    weightage: 2
  },
  {
    id: 'L3_PHY_17',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Electricity',
    questionText: 'Potential difference across a 5-ohm resistor carrying 2A current:',
    options: [
      { label: 'A', text: '2.5V' },
      { label: 'B', text: '5V' },
      { label: 'C', text: '10V' },
      { label: 'D', text: '7.5V' }
    ],
    correctAnswer: 'C',
    explanation: 'By Ohm\'s law: V = IR = 2A × 5Ω = 10V',
    difficulty: 'medium',
    skills: ['Electricity', 'Ohm\'s law', 'Calculation'],
    weightage: 2
  },
  {
    id: 'L3_PHY_18',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Light',
    questionText: 'The speed of light in air is approximately:',
    options: [
      { label: 'A', text: '3×10⁸ m/s' },
      { label: 'B', text: '3×10⁶ m/s' },
      { label: 'C', text: '3×10⁴ m/s' },
      { label: 'D', text: '3×10² m/s' }
    ],
    correctAnswer: 'A',
    explanation: 'Speed of light in air (or vacuum) ≈ 3×10⁸ m/s',
    difficulty: 'easy',
    skills: ['Light', 'Constants', 'Scientific notation'],
    weightage: 2
  },
  {
    id: 'L3_PHY_19',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Scientific Discovery',
    questionText: 'Who discovered X-rays?',
    options: [
      { label: 'A', text: 'Hertz' },
      { label: 'B', text: 'Newton' },
      { label: 'C', text: 'Röntgen' },
      { label: 'D', text: 'Faraday' }
    ],
    correctAnswer: 'C',
    explanation: 'Wilhelm Conrad Röntgen discovered X-rays in 1895',
    difficulty: 'medium',
    skills: ['Scientific history', 'Discoveries', 'General knowledge'],
    weightage: 2
  },
  {
    id: 'L3_PHY_20',
    layerId: 3,
    category: 'Class 10 Physics Readiness',
    subcategory: 'Energy Resources',
    questionText: 'Example of non-renewable source:',
    options: [
      { label: 'A', text: 'Solar' },
      { label: 'B', text: 'Wind' },
      { label: 'C', text: 'Coal' },
      { label: 'D', text: 'Biomass' }
    ],
    correctAnswer: 'C',
    explanation: 'Coal is a non-renewable fossil fuel formed over millions of years',
    difficulty: 'easy',
    skills: ['Energy resources', 'Environment', 'Classification'],
    weightage: 2
  },

  // ====================
  // SECTION 3: CLASS 10 CHEMISTRY (15 Questions)
  // ====================
  {
    id: 'L3_CHEM_06',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Periodic Table',
    questionText: 'Valency of carbon:',
    options: [
      { label: 'A', text: '1' },
      { label: 'B', text: '2' },
      { label: 'C', text: '3' },
      { label: 'D', text: '4' }
    ],
    correctAnswer: 'D',
    explanation: 'Carbon has valency 4 (electronic configuration: 2,4)',
    difficulty: 'easy',
    skills: ['Periodic table', 'Valency', 'Electronic configuration'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_07',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Acids & Bases',
    questionText: 'Which is an alkali?',
    options: [
      { label: 'A', text: 'HCl' },
      { label: 'B', text: 'NaOH' },
      { label: 'C', text: 'H₂SO₄' },
      { label: 'D', text: 'CH₃COOH' }
    ],
    correctAnswer: 'B',
    explanation: 'NaOH (Sodium hydroxide) is an alkali (soluble base)',
    difficulty: 'easy',
    skills: ['Acids and bases', 'Classification', 'Chemical compounds'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_08',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'pH Scale',
    questionText: 'pH < 7 indicates:',
    options: [
      { label: 'A', text: 'Base' },
      { label: 'B', text: 'Acid' },
      { label: 'C', text: 'Neutral' },
      { label: 'D', text: 'Salt' }
    ],
    correctAnswer: 'B',
    explanation: 'pH < 7 indicates acidic solution, pH = 7 is neutral, pH > 7 is basic',
    difficulty: 'easy',
    skills: ['pH scale', 'Acids and bases', 'Classification'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_09',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Periodic Table',
    questionText: 'Element with atomic number 19:',
    options: [
      { label: 'A', text: 'Ca' },
      { label: 'B', text: 'K' },
      { label: 'C', text: 'Na' },
      { label: 'D', text: 'Mg' }
    ],
    correctAnswer: 'B',
    explanation: 'Element with atomic number 19 is Potassium (K)',
    difficulty: 'medium',
    skills: ['Periodic table', 'Elements', 'Atomic number'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_10',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Chemical Reactions',
    questionText: 'Which gas is released when zinc reacts with hydrochloric acid?',
    options: [
      { label: 'A', text: 'O₂' },
      { label: 'B', text: 'CO₂' },
      { label: 'C', text: 'H₂' },
      { label: 'D', text: 'N₂' }
    ],
    correctAnswer: 'C',
    explanation: 'Zn + 2HCl → ZnCl₂ + H₂↑ (Hydrogen gas is released)',
    difficulty: 'medium',
    skills: ['Chemical reactions', 'Acids and metals', 'Gas evolution'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_11',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Acids',
    questionText: 'Vinegar contains:',
    options: [
      { label: 'A', text: 'Acetic acid' },
      { label: 'B', text: 'Hydrochloric acid' },
      { label: 'C', text: 'Sulphuric acid' },
      { label: 'D', text: 'Nitric acid' }
    ],
    correctAnswer: 'A',
    explanation: 'Vinegar contains acetic acid (CH₃COOH), typically 5-8% solution',
    difficulty: 'easy',
    skills: ['Acids', 'Everyday chemistry', 'Compounds'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_12',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Chemical Bonding',
    questionText: 'NaCl is formed by bonding that is:',
    options: [
      { label: 'A', text: 'Covalent' },
      { label: 'B', text: 'Ionic' },
      { label: 'C', text: 'Metallic' },
      { label: 'D', text: 'Hydrogen' }
    ],
    correctAnswer: 'B',
    explanation: 'NaCl is formed by ionic bonding (transfer of electrons from Na to Cl)',
    difficulty: 'medium',
    skills: ['Chemical bonding', 'Ionic compounds', 'Bonding types'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_13',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Organic Chemistry',
    questionText: 'CH₄ is:',
    options: [
      { label: 'A', text: 'Methane' },
      { label: 'B', text: 'Ethane' },
      { label: 'C', text: 'Ethene' },
      { label: 'D', text: 'Ethyne' }
    ],
    correctAnswer: 'A',
    explanation: 'CH₄ is methane, the simplest hydrocarbon (alkane)',
    difficulty: 'easy',
    skills: ['Organic chemistry', 'Hydrocarbons', 'Nomenclature'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_14',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Oxidation-Reduction',
    questionText: 'Example of oxidation:',
    options: [
      { label: 'A', text: 'Gaining hydrogen' },
      { label: 'B', text: 'Loss of oxygen' },
      { label: 'C', text: 'Gain of oxygen' },
      { label: 'D', text: 'Loss of electrons' }
    ],
    correctAnswer: 'C',
    explanation: 'Oxidation is gain of oxygen or loss of hydrogen or loss of electrons',
    difficulty: 'medium',
    skills: ['Redox reactions', 'Oxidation', 'Chemical concepts'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_15',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Electrolysis',
    questionText: 'Electrolysis of water produces:',
    options: [
      { label: 'A', text: 'H₂ + O₂' },
      { label: 'B', text: 'H₂ only' },
      { label: 'C', text: 'O₂ only' },
      { label: 'D', text: 'H₂O₂' }
    ],
    correctAnswer: 'A',
    explanation: 'Electrolysis of water: 2H₂O → 2H₂ + O₂ (produces hydrogen and oxygen)',
    difficulty: 'medium',
    skills: ['Electrolysis', 'Chemical reactions', 'Decomposition'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_16',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Indicators',
    questionText: 'Blue litmus turns red in:',
    options: [
      { label: 'A', text: 'Base' },
      { label: 'B', text: 'Neutral solution' },
      { label: 'C', text: 'Acid' },
      { label: 'D', text: 'Salt' }
    ],
    correctAnswer: 'C',
    explanation: 'Blue litmus turns red in acidic solution',
    difficulty: 'easy',
    skills: ['Indicators', 'Acids and bases', 'Testing'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_17',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Periodic Table',
    questionText: 'Valency of magnesium:',
    options: [
      { label: 'A', text: '1' },
      { label: 'B', text: '2' },
      { label: 'C', text: '3' },
      { label: 'D', text: '4' }
    ],
    correctAnswer: 'B',
    explanation: 'Magnesium has valency 2 (electronic configuration: 2,8,2)',
    difficulty: 'easy',
    skills: ['Periodic table', 'Valency', 'Electronic configuration'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_18',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Chemical Reactions',
    questionText: 'Which substance will produce CO₂ on reacting with acid?',
    options: [
      { label: 'A', text: 'NaCl' },
      { label: 'B', text: 'CaCO₃' },
      { label: 'C', text: 'MgO' },
      { label: 'D', text: 'NaOH' }
    ],
    correctAnswer: 'B',
    explanation: 'CaCO₃ + Acid → Salt + H₂O + CO₂↑ (Carbonates react with acids to produce CO₂)',
    difficulty: 'medium',
    skills: ['Chemical reactions', 'Carbonates', 'Gas evolution'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_19',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Organic Chemistry',
    questionText: 'Chemical formula of ethanol:',
    options: [
      { label: 'A', text: 'CH₄' },
      { label: 'B', text: 'C₂H₄' },
      { label: 'C', text: 'C₂H₅OH' },
      { label: 'D', text: 'C₆H₆' }
    ],
    correctAnswer: 'C',
    explanation: 'Ethanol (alcohol) has formula C₂H₅OH',
    difficulty: 'medium',
    skills: ['Organic chemistry', 'Alcohols', 'Chemical formulas'],
    weightage: 2
  },
  {
    id: 'L3_CHEM_20',
    layerId: 3,
    category: 'Class 10 Chemistry Readiness',
    subcategory: 'Everyday Chemistry',
    questionText: 'Gas used in fire extinguishers:',
    options: [
      { label: 'A', text: 'O₂' },
      { label: 'B', text: 'N₂' },
      { label: 'C', text: 'CO₂' },
      { label: 'D', text: 'Cl₂' }
    ],
    correctAnswer: 'C',
    explanation: 'CO₂ is used in fire extinguishers as it is heavier than air and doesn\'t support combustion',
    difficulty: 'easy',
    skills: ['Everyday chemistry', 'Applications', 'Gases'],
    weightage: 2
  },

  // ====================
  // SECTION 4: CLASS 10 BIOLOGY (15 Questions)
  // ====================
  {
    id: 'L3_BIO_06',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Excretory System',
    questionText: 'The functional unit of the kidney:',
    options: [
      { label: 'A', text: 'Neuron' },
      { label: 'B', text: 'Nephron' },
      { label: 'C', text: 'Alveoli' },
      { label: 'D', text: 'Axon' }
    ],
    correctAnswer: 'B',
    explanation: 'Nephron is the functional unit of kidney responsible for filtration',
    difficulty: 'medium',
    skills: ['Excretory system', 'Human biology', 'Organ systems'],
    weightage: 2
  },
  {
    id: 'L3_BIO_07',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Plant Physiology',
    questionText: 'Photosynthesis occurs in:',
    options: [
      { label: 'A', text: 'Mitochondria' },
      { label: 'B', text: 'Chloroplast' },
      { label: 'C', text: 'Ribosome' },
      { label: 'D', text: 'Nucleus' }
    ],
    correctAnswer: 'B',
    explanation: 'Photosynthesis occurs in chloroplasts which contain chlorophyll',
    difficulty: 'easy',
    skills: ['Plant physiology', 'Cell organelles', 'Photosynthesis'],
    weightage: 2
  },
  {
    id: 'L3_BIO_08',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Endocrine System',
    questionText: 'Hormone responsible for growth:',
    options: [
      { label: 'A', text: 'Insulin' },
      { label: 'B', text: 'Adrenaline' },
      { label: 'C', text: 'Growth hormone' },
      { label: 'D', text: 'Thyroxine' }
    ],
    correctAnswer: 'C',
    explanation: 'Growth hormone (GH) secreted by pituitary gland controls growth',
    difficulty: 'easy',
    skills: ['Endocrine system', 'Hormones', 'Body functions'],
    weightage: 2
  },
  {
    id: 'L3_BIO_09',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Circulatory System',
    questionText: 'Blood plasma is mainly:',
    options: [
      { label: 'A', text: 'Water' },
      { label: 'B', text: 'Protein' },
      { label: 'C', text: 'Iron' },
      { label: 'D', text: 'Calcium' }
    ],
    correctAnswer: 'A',
    explanation: 'Blood plasma is about 90-92% water',
    difficulty: 'easy',
    skills: ['Circulatory system', 'Blood composition', 'Human biology'],
    weightage: 2
  },
  {
    id: 'L3_BIO_10',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Reproduction',
    questionText: 'Pollination is transfer of pollen from:',
    options: [
      { label: 'A', text: 'anther to filament' },
      { label: 'B', text: 'anther to stigma' },
      { label: 'C', text: 'stigma to petal' },
      { label: 'D', text: 'sepal to anther' }
    ],
    correctAnswer: 'B',
    explanation: 'Pollination is transfer of pollen grains from anther to stigma',
    difficulty: 'medium',
    skills: ['Reproduction', 'Plant biology', 'Flower parts'],
    weightage: 2
  },
  {
    id: 'L3_BIO_11',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Nervous System',
    questionText: 'Reflex actions are controlled by:',
    options: [
      { label: 'A', text: 'Brain' },
      { label: 'B', text: 'Spinal cord' },
      { label: 'C', text: 'Heart' },
      { label: 'D', text: 'Liver' }
    ],
    correctAnswer: 'B',
    explanation: 'Reflex actions are controlled by spinal cord for quick response without brain involvement',
    difficulty: 'medium',
    skills: ['Nervous system', 'Reflex arc', 'Body responses'],
    weightage: 2
  },
  {
    id: 'L3_BIO_12',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Cellular Respiration',
    questionText: 'Which process releases energy?',
    options: [
      { label: 'A', text: 'Digestion' },
      { label: 'B', text: 'Excretion' },
      { label: 'C', text: 'Respiration' },
      { label: 'D', text: 'Photosynthesis' }
    ],
    correctAnswer: 'C',
    explanation: 'Cellular respiration releases energy from glucose (C₆H₁₂O₆ + O₂ → CO₂ + H₂O + Energy)',
    difficulty: 'easy',
    skills: ['Cellular respiration', 'Energy', 'Life processes'],
    weightage: 2
  },
  {
    id: 'L3_BIO_13',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Genetics',
    questionText: 'Number of chromosomes in human body cells:',
    options: [
      { label: 'A', text: '23' },
      { label: 'B', text: '46' },
      { label: 'C', text: '22' },
      { label: 'D', text: '44' }
    ],
    correctAnswer: 'B',
    explanation: 'Human body cells have 46 chromosomes (23 pairs)',
    difficulty: 'easy',
    skills: ['Genetics', 'Chromosomes', 'Human biology'],
    weightage: 2
  },
  {
    id: 'L3_BIO_14',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Plant Anatomy',
    questionText: 'Plant tissue responsible for transport of water:',
    options: [
      { label: 'A', text: 'Phloem' },
      { label: 'B', text: 'Xylem' },
      { label: 'C', text: 'Cambium' },
      { label: 'D', text: 'Epidermis' }
    ],
    correctAnswer: 'B',
    explanation: 'Xylem transports water and minerals from roots to other parts of plant',
    difficulty: 'medium',
    skills: ['Plant anatomy', 'Tissues', 'Transport'],
    weightage: 2
  },
  {
    id: 'L3_BIO_15',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Homeostasis',
    questionText: 'The process of maintaining stable internal conditions:',
    options: [
      { label: 'A', text: 'Excretion' },
      { label: 'B', text: 'Homeostasis' },
      { label: 'C', text: 'Respiration' },
      { label: 'D', text: 'Locomotion' }
    ],
    correctAnswer: 'B',
    explanation: 'Homeostasis is the process of maintaining stable internal body conditions',
    difficulty: 'medium',
    skills: ['Homeostasis', 'Physiology', 'Life processes'],
    weightage: 2
  },
  {
    id: 'L3_BIO_16',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Diseases',
    questionText: 'Which disease is caused by lack of insulin?',
    options: [
      { label: 'A', text: 'Anaemia' },
      { label: 'B', text: 'Diabetes' },
      { label: 'C', text: 'Malaria' },
      { label: 'D', text: 'Tuberculosis' }
    ],
    correctAnswer: 'B',
    explanation: 'Diabetes is caused by deficiency or improper function of insulin hormone',
    difficulty: 'easy',
    skills: ['Diseases', 'Endocrine system', 'Health'],
    weightage: 2
  },
  {
    id: 'L3_BIO_17',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Plant Reproduction',
    questionText: 'Filament + anther form the:',
    options: [
      { label: 'A', text: 'Stigma' },
      { label: 'B', text: 'Pistil' },
      { label: 'C', text: 'Ovary' },
      { label: 'D', text: 'Stamen' }
    ],
    correctAnswer: 'D',
    explanation: 'Stamen is the male reproductive part consisting of filament and anther',
    difficulty: 'medium',
    skills: ['Plant reproduction', 'Flower parts', 'Terminology'],
    weightage: 2
  },
  {
    id: 'L3_BIO_18',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Digestive System',
    questionText: 'Most digestion occurs in:',
    options: [
      { label: 'A', text: 'Stomach' },
      { label: 'B', text: 'Small intestine' },
      { label: 'C', text: 'Mouth' },
      { label: 'D', text: 'Large intestine' }
    ],
    correctAnswer: 'B',
    explanation: 'Most digestion and absorption occurs in the small intestine',
    difficulty: 'medium',
    skills: ['Digestive system', 'Organs', 'Life processes'],
    weightage: 2
  },
  {
    id: 'L3_BIO_19',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Genetics',
    questionText: 'Genetics is study of:',
    options: [
      { label: 'A', text: 'Respiration' },
      { label: 'B', text: 'Reproduction' },
      { label: 'C', text: 'Inheritance' },
      { label: 'D', text: 'Movement' }
    ],
    correctAnswer: 'C',
    explanation: 'Genetics is the study of heredity and inheritance of traits',
    difficulty: 'easy',
    skills: ['Genetics', 'Definitions', 'Science branches'],
    weightage: 2
  },
  {
    id: 'L3_BIO_20',
    layerId: 3,
    category: 'Class 10 Biology Readiness',
    subcategory: 'Immunity',
    questionText: 'Vaccination helps prevent disease by:',
    options: [
      { label: 'A', text: 'Killing germs inside body' },
      { label: 'B', text: 'Stimulating antibody formation' },
      { label: 'C', text: 'Providing oxygen' },
      { label: 'D', text: 'Reducing fever' }
    ],
    correctAnswer: 'B',
    explanation: 'Vaccination stimulates the immune system to produce antibodies against specific pathogens',
    difficulty: 'medium',
    skills: ['Immunity', 'Vaccination', 'Disease prevention'],
    weightage: 2
  },

  // ====================
  // SECTION 5: CLASS 10 ENGLISH (15 Questions)
  // ====================
  {
    id: 'L3_ENG_01',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Reported Speech',
    questionText: 'Choose the correct reported speech: He said, "I will help you."',
    options: [
      { label: 'A', text: 'He said that he will help you.' },
      { label: 'B', text: 'He said that he would help me.' },
      { label: 'C', text: 'He said that he would help you.' },
      { label: 'D', text: 'He said he help you.' }
    ],
    correctAnswer: 'B',
    explanation: 'Reported speech: "will" changes to "would", "you" changes to "me" from speaker\'s perspective',
    difficulty: 'medium',
    skills: ['Reported speech', 'Tense conversion', 'Grammar'],
    weightage: 2
  },
  {
    id: 'L3_ENG_02',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Transformation',
    questionText: 'Choose correct transformation: "She is too weak to walk."',
    options: [
      { label: 'A', text: 'She is so weak that she cannot walk.' },
      { label: 'B', text: 'She is weak but walks.' },
      { label: 'C', text: 'She cannot walk because weak.' },
      { label: 'D', text: 'She is weak for walk.' }
    ],
    correctAnswer: 'A',
    explanation: 'Too...to = so...that...cannot (transformation of degrees)',
    difficulty: 'medium',
    skills: ['Transformation', 'Sentence structure', 'Grammar'],
    weightage: 2
  },
  {
    id: 'L3_ENG_03',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Subject-Verb Agreement',
    questionText: 'Choose correct form: Neither of the boys ___ present.',
    options: [
      { label: 'A', text: 'are' },
      { label: 'B', text: 'were' },
      { label: 'C', text: 'is' },
      { label: 'D', text: 'be' }
    ],
    correctAnswer: 'C',
    explanation: 'Neither/Either takes singular verb form "is"',
    difficulty: 'medium',
    skills: ['Subject-verb agreement', 'Grammar', 'Neither/Either'],
    weightage: 2
  },
  {
    id: 'L3_ENG_04',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Comprehension',
    questionText: 'Best summary of: "The sun rose slowly above the horizon, colouring the sky orange."',
    options: [
      { label: 'A', text: 'The sun disappeared.' },
      { label: 'B', text: 'The sky turned dark.' },
      { label: 'C', text: 'The sun rose and brightened the sky.' },
      { label: 'D', text: 'The morning was cloudy.' }
    ],
    correctAnswer: 'C',
    explanation: 'Best summary captures the essence: sunrise brightening the sky',
    difficulty: 'easy',
    skills: ['Comprehension', 'Summarization', 'Reading'],
    weightage: 2
  },
  {
    id: 'L3_ENG_05',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Prepositions',
    questionText: 'Fill blank: She insisted ___ going early.',
    options: [
      { label: 'A', text: 'in' },
      { label: 'B', text: 'for' },
      { label: 'C', text: 'on' },
      { label: 'D', text: 'to' }
    ],
    correctAnswer: 'C',
    explanation: 'Correct preposition: insisted ON (idiomatic usage)',
    difficulty: 'medium',
    skills: ['Prepositions', 'Idiomatic usage', 'Grammar'],
    weightage: 2
  },
  {
    id: 'L3_ENG_06',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Vocabulary',
    questionText: 'Antonym of "Hostile":',
    options: [
      { label: 'A', text: 'Friendly' },
      { label: 'B', text: 'Angry' },
      { label: 'C', text: 'Quiet' },
      { label: 'D', text: 'Silent' }
    ],
    correctAnswer: 'A',
    explanation: 'Hostile (unfriendly/aggressive) is opposite of Friendly',
    difficulty: 'easy',
    skills: ['Vocabulary', 'Antonyms', 'Word meaning'],
    weightage: 2
  },
  {
    id: 'L3_ENG_07',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Vocabulary',
    questionText: 'Meaning of "Relentless":',
    options: [
      { label: 'A', text: 'Gentle' },
      { label: 'B', text: 'Continuous' },
      { label: 'C', text: 'Rare' },
      { label: 'D', text: 'Difficult' }
    ],
    correctAnswer: 'B',
    explanation: 'Relentless means persistent, continuous, or unyielding',
    difficulty: 'medium',
    skills: ['Vocabulary', 'Word meaning', 'Definitions'],
    weightage: 2
  },
  {
    id: 'L3_ENG_08',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Spelling',
    questionText: 'Choose correct spelling:',
    options: [
      { label: 'A', text: 'Embarass' },
      { label: 'B', text: 'Embarrass' },
      { label: 'C', text: 'Embaras' },
      { label: 'D', text: 'Embarasss' }
    ],
    correctAnswer: 'B',
    explanation: 'Correct spelling: Embarrass (double r, double s)',
    difficulty: 'medium',
    skills: ['Spelling', 'English language', 'Word formation'],
    weightage: 2
  },
  {
    id: 'L3_ENG_09',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Tenses',
    questionText: 'Correct tense: By next month, she ___ the project.',
    options: [
      { label: 'A', text: 'will finish' },
      { label: 'B', text: 'will be finishing' },
      { label: 'C', text: 'will have finished' },
      { label: 'D', text: 'finishes' }
    ],
    correctAnswer: 'C',
    explanation: 'Future perfect tense: will have finished (action completed before a future time)',
    difficulty: 'medium',
    skills: ['Tenses', 'Future perfect', 'Grammar'],
    weightage: 2
  },
  {
    id: 'L3_ENG_10',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Connectors',
    questionText: 'Choose appropriate connector: He studied hard ___ he failed.',
    options: [
      { label: 'A', text: 'and' },
      { label: 'B', text: 'but' },
      { label: 'C', text: 'so' },
      { label: 'D', text: 'therefore' }
    ],
    correctAnswer: 'B',
    explanation: 'But shows contrast between studying hard and failing',
    difficulty: 'easy',
    skills: ['Connectors', 'Conjunctions', 'Contrast'],
    weightage: 2
  },
  {
    id: 'L3_ENG_11',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Comprehension',
    questionText: 'Choose the best title for a passage on water scarcity:',
    options: [
      { label: 'A', text: 'Water is Fun' },
      { label: 'B', text: 'Save Water, Save Life' },
      { label: 'C', text: 'River Stories' },
      { label: 'D', text: 'Summer Picnic' }
    ],
    correctAnswer: 'B',
    explanation: 'Best title captures the serious nature of water scarcity issue',
    difficulty: 'easy',
    skills: ['Comprehension', 'Title selection', 'Reading'],
    weightage: 2
  },
  {
    id: 'L3_ENG_12',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Punctuation',
    questionText: 'Choose correct punctuation:',
    options: [
      { label: 'A', text: '"Where are you going" asked Tina.' },
      { label: 'B', text: '"Where are you going?\' asked Tina.' },
      { label: 'C', text: '"Where are you going?" asked Tina.' },
      { label: 'D', text: 'Where "are you going?" asked Tina.' }
    ],
    correctAnswer: 'C',
    explanation: 'Question mark inside double quotes, reporting clause outside',
    difficulty: 'easy',
    skills: ['Punctuation', 'Direct speech', 'Writing mechanics'],
    weightage: 2
  },
  {
    id: 'L3_ENG_13',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Figures of Speech',
    questionText: 'Identify the figure of speech: "The classroom was a zoo today."',
    options: [
      { label: 'A', text: 'Simile' },
      { label: 'B', text: 'Personification' },
      { label: 'C', text: 'Metaphor' },
      { label: 'D', text: 'Hyperbole' }
    ],
    correctAnswer: 'C',
    explanation: 'Metaphor: direct comparison without using "like" or "as"',
    difficulty: 'medium',
    skills: ['Figures of speech', 'Metaphor', 'Literature'],
    weightage: 2
  },
  {
    id: 'L3_ENG_14',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Prepositions',
    questionText: 'Choose correct preposition: They sat ___ the table.',
    options: [
      { label: 'A', text: 'in' },
      { label: 'B', text: 'at' },
      { label: 'C', text: 'on' },
      { label: 'D', text: 'over' }
    ],
    correctAnswer: 'B',
    explanation: 'Correct preposition: sat AT the table (position at furniture)',
    difficulty: 'easy',
    skills: ['Prepositions', 'Usage', 'Grammar'],
    weightage: 2
  },
  {
    id: 'L3_ENG_15',
    layerId: 3,
    category: 'Class 10 English Readiness',
    subcategory: 'Error Spotting',
    questionText: 'Error spotting: "Neither my friends nor my brother like pizza."',
    options: [
      { label: 'A', text: 'Neither' },
      { label: 'B', text: 'friends' },
      { label: 'C', text: 'brother' },
      { label: 'D', text: 'like' }
    ],
    correctAnswer: 'D',
    explanation: 'Should be "likes" (verb agrees with the nearest subject "brother" which is singular)',
    difficulty: 'medium',
    skills: ['Error spotting', 'Subject-verb agreement', 'Neither...nor'],
    weightage: 2
  }
];

// ============================================================================
// PART G: PSYCHOLOGICAL & STUDY MINDSET ASSESSMENT (25 Questions)
// ============================================================================
// These are Layer 4 questions - evaluating student mindset and study habits
// All use 5-point Likert scale (A-E)
// ============================================================================

export const partG_Psychological: Question[] = [
  // Section 1: Study Consistency & Habits (6 Questions)
  {
    id: 'L4_PSY_11',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Study Consistency',
    questionText: 'I revise what I learn regularly without being reminded.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Regular revision is a key habit of successful students',
    difficulty: 'easy',
    skills: ['Self-assessment', 'Study habits', 'Consistency'],
    weightage: 1
  },
  {
    id: 'L4_PSY_12',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Study Consistency',
    questionText: 'I complete my homework and assignments on time.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Timely completion of assignments indicates good time management',
    difficulty: 'easy',
    skills: ['Time management', 'Responsibility', 'Consistency'],
    weightage: 1
  },
  {
    id: 'L4_PSY_13',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Study Consistency',
    questionText: 'I follow a fixed study schedule or routine.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Following a routine helps build strong study habits',
    difficulty: 'easy',
    skills: ['Routine', 'Discipline', 'Planning'],
    weightage: 1
  },
  {
    id: 'L4_PSY_14',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Study Consistency',
    questionText: 'I avoid distractions (phone, games, social media) while studying.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Avoiding distractions is crucial for focused studying',
    difficulty: 'easy',
    skills: ['Focus', 'Self-control', 'Study environment'],
    weightage: 1
  },
  {
    id: 'L4_PSY_15',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Study Consistency',
    questionText: 'I revise mistakes from previous tests and make sure I don\'t repeat them.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Learning from mistakes is essential for improvement',
    difficulty: 'easy',
    skills: ['Error analysis', 'Improvement', 'Learning from mistakes'],
    weightage: 1
  },
  {
    id: 'L4_PSY_16',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Study Consistency',
    questionText: 'I stay consistent even when the topic is difficult or boring.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Persistence through difficult topics shows strong commitment',
    difficulty: 'easy',
    skills: ['Persistence', 'Resilience', 'Commitment'],
    weightage: 1
  },

  // Section 2: Motivation & Goal-Orientation (5 Questions)
  {
    id: 'L4_PSY_17',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Motivation',
    questionText: 'I set specific study goals for myself each week.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Goal-setting is important for tracking progress and staying motivated',
    difficulty: 'easy',
    skills: ['Goal-setting', 'Planning', 'Motivation'],
    weightage: 1
  },
  {
    id: 'L4_PSY_18',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Motivation',
    questionText: 'I feel motivated to improve my performance after doing badly in a test.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Positive response to setbacks indicates growth mindset',
    difficulty: 'easy',
    skills: ['Growth mindset', 'Resilience', 'Motivation'],
    weightage: 1
  },
  {
    id: 'L4_PSY_19',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Motivation',
    questionText: 'Becoming a topper or scoring high marks is an important goal for me.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Having clear academic goals drives performance',
    difficulty: 'easy',
    skills: ['Goal clarity', 'Ambition', 'Academic drive'],
    weightage: 1
  },
  {
    id: 'L4_PSY_20',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Motivation',
    questionText: 'I enjoy learning new concepts even when they require hard work.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Intrinsic motivation and love for learning are key to success',
    difficulty: 'easy',
    skills: ['Intrinsic motivation', 'Learning attitude', 'Curiosity'],
    weightage: 1
  },
  {
    id: 'L4_PSY_21',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Motivation',
    questionText: 'I take responsibility for my studies without depending on parents/teachers to push me.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Self-driven students show ownership and independence',
    difficulty: 'easy',
    skills: ['Self-motivation', 'Ownership', 'Independence'],
    weightage: 1
  },

  // Section 3: Discipline & Time Management (5 Questions)
  {
    id: 'L4_PSY_22',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Time Management',
    questionText: 'I manage my time well between studies, hobbies, and rest.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Good time management balances all aspects of life',
    difficulty: 'easy',
    skills: ['Time management', 'Balance', 'Organization'],
    weightage: 1
  },
  {
    id: 'L4_PSY_23',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Discipline',
    questionText: 'I break long chapters into smaller tasks for easier study.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Breaking tasks into chunks shows good study strategy',
    difficulty: 'easy',
    skills: ['Task management', 'Study strategy', 'Organization'],
    weightage: 1
  },
  {
    id: 'L4_PSY_24',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Discipline',
    questionText: 'I complete planned tasks even when I feel lazy.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Overcoming laziness demonstrates strong self-discipline',
    difficulty: 'easy',
    skills: ['Self-discipline', 'Willpower', 'Commitment'],
    weightage: 1
  },
  {
    id: 'L4_PSY_25',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Discipline',
    questionText: 'I start studying in advance instead of waiting until exams.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Proactive studying prevents last-minute stress',
    difficulty: 'easy',
    skills: ['Planning', 'Proactive behavior', 'Time management'],
    weightage: 1
  },
  {
    id: 'L4_PSY_26',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Discipline',
    questionText: 'I can study without supervision or reminders.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Independent studying shows maturity and self-discipline',
    difficulty: 'easy',
    skills: ['Independence', 'Self-discipline', 'Autonomy'],
    weightage: 1
  },

  // Section 4: Stress, Confidence & Emotional Readiness (5 Questions)
  {
    id: 'L4_PSY_27',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Stress Management',
    questionText: 'I feel anxious or stressed before exams.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'E',
    explanation: 'Lower anxiety levels indicate better stress management (reverse scored)',
    difficulty: 'easy',
    skills: ['Stress management', 'Emotional control', 'Test anxiety'],
    weightage: 1
  },
  {
    id: 'L4_PSY_28',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Confidence',
    questionText: 'I believe I can score 90%+ if I work hard.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Self-belief is essential for achieving high performance',
    difficulty: 'easy',
    skills: ['Self-confidence', 'Self-belief', 'Growth mindset'],
    weightage: 1
  },
  {
    id: 'L4_PSY_29',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Stress Management',
    questionText: 'I stay calm when I encounter difficult questions.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Staying calm under pressure improves problem-solving',
    difficulty: 'easy',
    skills: ['Composure', 'Stress management', 'Problem-solving'],
    weightage: 1
  },
  {
    id: 'L4_PSY_30',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Stress Management',
    questionText: 'I handle exam pressure well without losing focus.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Handling pressure well is key to exam performance',
    difficulty: 'easy',
    skills: ['Pressure management', 'Focus', 'Resilience'],
    weightage: 1
  },
  {
    id: 'L4_PSY_31',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Resilience',
    questionText: 'I remain positive and don\'t give up easily.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Positive attitude and perseverance lead to success',
    difficulty: 'easy',
    skills: ['Positivity', 'Perseverance', 'Resilience'],
    weightage: 1
  },

  // Section 5: Learning Style & Self-Awareness (4 Questions)
  {
    id: 'L4_PSY_32',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Learning Style',
    questionText: 'I understand concepts better when I see diagrams, charts, or visuals.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Visual learning preference (helps tailor study materials)',
    difficulty: 'easy',
    skills: ['Learning style', 'Visual learning', 'Self-awareness'],
    weightage: 1
  },
  {
    id: 'L4_PSY_33',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Learning Style',
    questionText: 'I prefer solving many practice questions to master a topic.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Kinesthetic/practice-based learning preference',
    difficulty: 'easy',
    skills: ['Learning style', 'Practice orientation', 'Self-awareness'],
    weightage: 1
  },
  {
    id: 'L4_PSY_34',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Self-Awareness',
    questionText: 'I easily recall what I learn and connect it to new topics.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Good retention and connection-making indicate deep learning',
    difficulty: 'easy',
    skills: ['Retention', 'Connection-making', 'Deep learning'],
    weightage: 1
  },
  {
    id: 'L4_PSY_35',
    layerId: 4,
    category: 'Psychological & Study Mindset',
    subcategory: 'Self-Awareness',
    questionText: 'I identify my weak areas and actively work on improving them.',
    options: [
      { label: 'A', text: 'Always' },
      { label: 'B', text: 'Often' },
      { label: 'C', text: 'Sometimes' },
      { label: 'D', text: 'Rarely' },
      { label: 'E', text: 'Never' }
    ],
    correctAnswer: 'A',
    explanation: 'Self-awareness and targeted improvement are hallmarks of top performers',
    difficulty: 'easy',
    skills: ['Self-awareness', 'Improvement mindset', 'Target identification'],
    weightage: 1
  }
];

// ============================================================================
// COMPLETE QUESTION BANK EXPORT
// ============================================================================
// Total: 115 additional questions
// Part E: 15 questions (History/Geography)
// Part F: 80 questions (Class 10 Readiness)
// Part G: 25 questions (Psychological & Study Mindset)
// ============================================================================

export const allAdditionalQuestions: Question[] = [
  ...partE_HistoryGeography,
  ...partF_Class10Readiness,
  ...partG_Psychological
];
