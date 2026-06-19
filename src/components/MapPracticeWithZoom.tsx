import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Check, X, ChevronRight, RotateCcw, Send, 
  Target, Award, TrendingUp, BookOpen, Info, Lightbulb,
  Clock, Star, Zap, ArrowLeft, ZoomIn, ZoomOut, Maximize2,
  Move, Edit2, Trash2, Tag, Timer, BarChart3, TrendingDown, 
  Calendar, Brain, AlertCircle, Palette, Waves, Square, ArrowRight
} from 'lucide-react';

// Import the political outline map
import indiaMapPolitical from 'figma:asset/bbf5e6562cf787017510fce774320f259c84f740.png';

interface Coordinate {
  x: number;
  y: number;
  id: string;
  label?: string;
}

interface Question {
  id: string;
  question: string;
  mapImage: string;
  type?: 'point' | 'area' | 'river' | 'direction' | 'combo'; // NEW: Added 'combo' for mixed questions
  correctAnswers: Array<{ 
    x: number; 
    y: number; 
    label: string; 
    tolerance: number;
    explanation?: string; // NEW: Detailed explanation for this answer
  }>;
  // NEW: For area drawing questions
  correctArea?: Array<{ x: number; y: number }>; // Polygon points defining the correct area
  areaLabel?: string; // Label for the area (e.g., "Deccan Plateau")
  areaTolerance?: number; // How close the drawn area needs to be (default: 50px)
  // NEW: For river/path tracing questions
  correctPath?: Array<{ x: number; y: number }>; // Points defining the correct river path
  pathLabel?: string; // Label for the river (e.g., "River Ganga")
  pathTolerance?: number; // How close the drawn path needs to be (default: 0.05)
  minPathPoints?: number; // Minimum points required (default: 5)
  // NEW: For directional arrow questions (wind, currents, etc.)
  correctDirections?: Array<{
    x: number; // Starting position x (0-1)
    y: number; // Starting position y (0-1)
    angle: number; // Direction in degrees (0 = East, 90 = South, 180 = West, 270 = North)
    label: string; // e.g., "SW Monsoon", "Trade Winds"
    positionTolerance: number; // How close the arrow position needs to be
    angleTolerance: number; // How close the angle needs to be (in degrees)
    explanation?: string;
  }>;
  minDirections?: number; // Minimum number of arrows required
  // NEW: For combo questions (multiple interaction types in one question)
  comboTasks?: Array<{
    type: 'point' | 'area' | 'river' | 'direction';
    instruction: string; // e.g., "Trace River Ganga"
    marks: number;
  }>;
  totalMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint: string;
  requireLabels?: boolean;
  detailedExplanation?: string; // NEW: Overall question explanation
  learningTips?: string[]; // NEW: Tips to identify correct answers
}

interface PerformanceRecord {
  id: string;
  date: number;
  subject: string;
  mode: 'chapter' | 'random' | 'revision' | 'smart'; // NEW: Added revision and smart modes
  chapterName?: string;
  questionsAttempted: number;
  correctAnswers: number;
  totalMarks: number;
  score: number;
  accuracy: number;
  timeSpent: number; // in seconds
  timedMode: boolean;
  wrongAnswers?: WrongAnswer[]; // NEW: Track wrong answers for revision
}

// NEW: Wrong answer tracking for Revision Mode
interface WrongAnswer {
  questionId: string;
  question: string;
  subject: string;
  chapterName: string;
  date: number;
  userAnswers: Coordinate[];
  correctAnswers: Array<{ x: number; y: number; label: string; tolerance: number; explanation?: string }>;
  mapImage: string;
  bookmarked?: boolean; // NEW: Bookmark feature
}

// NEW: Achievement system
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'accuracy' | 'streak' | 'volume' | 'speed' | 'mastery';
  unlocked: boolean;
  unlockedDate?: number;
  progress: number; // 0-100
  requirement: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// NEW: User progress tracking
interface UserProgress {
  totalXP: number;
  level: number;
  achievements: Achievement[];
  streak: {
    current: number;
    longest: number;
    lastPracticeDate: number;
  };
}

const subjects = [
  { id: 'geography', name: 'Geography', icon: '🌍' },
  { id: 'biology', name: 'Biology', icon: '🧬' },
  { id: 'botany', name: 'Botany', icon: '🌿' },
];

const geographyChapters = [
  { 
    id: 'minerals-india', 
    name: 'Mineral Resources of India',
    topics: 15,
    questions: 8,
  },
  { 
    id: 'rivers-india', 
    name: 'Major Rivers of India',
    topics: 12,
    questions: 10,
  },
  { 
    id: 'mountains-world', 
    name: 'Mountain Ranges - World',
    topics: 20,
    questions: 12,
  },
  { 
    id: 'capitals-asia', 
    name: 'Capital Cities - Asia',
    topics: 25,
    questions: 15,
  },
];

const biologyChapters = [
  { 
    id: 'human-heart', 
    name: 'Human Heart Anatomy',
    topics: 8,
    questions: 5,
  },
  { 
    id: 'digestive-system', 
    name: 'Digestive System',
    topics: 12,
    questions: 6,
  },
  { 
    id: 'brain-structure', 
    name: 'Human Brain Structure',
    topics: 10,
    questions: 5,
  },
  { 
    id: 'respiratory-system', 
    name: 'Respiratory System',
    topics: 9,
    questions: 4,
  },
];

const botanyChapters = [
  { 
    id: 'flower-parts', 
    name: 'Parts of a Flower',
    topics: 6,
    questions: 4,
  },
  { 
    id: 'leaf-structure', 
    name: 'Leaf Structure & Anatomy',
    topics: 8,
    questions: 5,
  },
  { 
    id: 'plant-cell', 
    name: 'Plant Cell Organelles',
    topics: 10,
    questions: 6,
  },
  { 
    id: 'root-system', 
    name: 'Root System Structure',
    topics: 7,
    questions: 4,
  },
];

// Sample questions with correct answer coordinates
const sampleQuestions: Record<string, Question[]> = {
  'minerals-india': [
    {
      id: 'q1',
      question: 'Mark all the major Uranium deposit locations in India',
      mapImage: indiaMapPolitical,
      correctAnswers: [
        { x: 0.545, y: 0.32, label: 'Jharkhand (Jaduguda)', tolerance: 0.04 },
        { x: 0.485, y: 0.62, label: 'Andhra Pradesh (Tummalapalle)', tolerance: 0.04 },
        { x: 0.42, y: 0.58, label: 'Karnataka (Gogi)', tolerance: 0.04 },
        { x: 0.68, y: 0.28, label: 'Meghalaya (Domiasiat)', tolerance: 0.04 },
      ],
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'Look in Jharkhand (eastern region), Andhra Pradesh (southeast), Karnataka (southwest), and Meghalaya (northeast)',
    },
    {
      id: 'q2',
      question: 'Pinpoint the Coal mining regions in Eastern India',
      mapImage: indiaMapPolitical,
      correctAnswers: [
        { x: 0.545, y: 0.32, label: 'Jharia (Jharkhand)', tolerance: 0.04 },
        { x: 0.575, y: 0.34, label: 'Raniganj (West Bengal)', tolerance: 0.04 },
        { x: 0.56, y: 0.42, label: 'Talcher (Odisha)', tolerance: 0.04 },
      ],
      totalMarks: 6,
      difficulty: 'Easy',
      hint: 'Focus on Jharkhand, West Bengal (eastern border), and Odisha (east coast)',
    },
    {
      id: 'q2-area',
      type: 'area',
      question: 'Draw the outline of the Chhota Nagpur Plateau (major mineral belt)',
      mapImage: indiaMapPolitical,
      correctAnswers: [],
      correctArea: [
        { x: 0.50, y: 0.28 }, // North
        { x: 0.58, y: 0.30 }, // Northeast
        { x: 0.60, y: 0.36 }, // East
        { x: 0.56, y: 0.42 }, // Southeast
        { x: 0.48, y: 0.40 }, // South
        { x: 0.46, y: 0.34 }, // Southwest
        { x: 0.47, y: 0.30 }, // West
      ],
      areaLabel: 'Chhota Nagpur Plateau',
      areaTolerance: 0.06,
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'This plateau covers most of Jharkhand and parts of Odisha, West Bengal, and Chhattisgarh. It is rich in minerals like coal, iron ore, and mica.',
      detailedExplanation: 'The Chhota Nagpur Plateau is a continental plateau in eastern India. It is known for its rich mineral deposits including coal, iron ore, copper, mica, and uranium. Major cities like Ranchi and Jamshedpur are located here.',
      learningTips: [
        'Located primarily in Jharkhand state',
        'Extends into parts of Odisha, West Bengal, and Chhattisgarh',
        'Known as the "Ruhr of India" due to vast mineral resources',
        'Home to major industrial cities'
      ]
    },
  ],
  'rivers-india': [
    {
      id: 'q3',
      question: 'Mark the origin points of major rivers: Ganga, Brahmaputra, and Narmada',
      mapImage: indiaMapPolitical,
      correctAnswers: [
        { x: 0.42, y: 0.18, label: 'Gangotri (Ganga)', tolerance: 0.04 },
        { x: 0.72, y: 0.22, label: 'Tibet (Brahmaputra)', tolerance: 0.05 },
        { x: 0.50, y: 0.40, label: 'Amarkantak (Narmada)', tolerance: 0.04 },
      ],
      totalMarks: 6,
      difficulty: 'Medium',
      hint: 'Ganga originates in Uttarakhand (north), Brahmaputra from Tibet (northeast), Narmada from Madhya Pradesh (central India)',
    },
    {
      id: 'q3-area',
      type: 'area',
      question: 'Draw the boundary of the Deccan Plateau region',
      mapImage: indiaMapPolitical,
      correctAnswers: [], // Not used for area questions
      correctArea: [
        { x: 0.35, y: 0.45 }, // Northwest corner
        { x: 0.50, y: 0.38 }, // North
        { x: 0.62, y: 0.42 }, // Northeast
        { x: 0.68, y: 0.55 }, // East
        { x: 0.65, y: 0.72 }, // Southeast
        { x: 0.42, y: 0.78 }, // South
        { x: 0.30, y: 0.65 }, // Southwest
        { x: 0.32, y: 0.52 }, // West
      ],
      areaLabel: 'Deccan Plateau',
      areaTolerance: 0.08,
      totalMarks: 10,
      difficulty: 'Hard',
      hint: 'The Deccan Plateau is bounded by Western Ghats on the west, Eastern Ghats on the east, and extends from central India to southern peninsula',
      detailedExplanation: 'The Deccan Plateau is a large plateau in western and southern India. It is triangular in shape and covers most of the southern part of the country. It is bounded by the Western Ghats on the west, Eastern Ghats on the east, and the Satpura and Vindhya ranges on the north.',
      learningTips: [
        'Start from Maharashtra-Karnataka border (northwest)',
        'Trace along the Satpura-Vindhya ranges in the north',
        'Follow the Eastern Ghats down the east coast',
        'Trace the southern tip near Tamil Nadu',
        'Return along the Western Ghats on the west coast'
      ]
    },
    {
      id: 'q4-river',
      type: 'river',
      question: 'Trace the complete flow of River Ganga from its origin to the Bay of Bengal',
      mapImage: indiaMapPolitical,
      correctAnswers: [],
      correctPath: [
        { x: 0.42, y: 0.18 }, // Origin - Gangotri, Uttarakhand
        { x: 0.44, y: 0.20 }, // Upper Himalayas
        { x: 0.46, y: 0.23 }, // Haridwar region
        { x: 0.48, y: 0.26 }, // Entering plains
        { x: 0.51, y: 0.28 }, // Western UP
        { x: 0.54, y: 0.29 }, // Central UP
        { x: 0.56, y: 0.30 }, // Eastern UP (Varanasi region)
        { x: 0.58, y: 0.31 }, // Bihar entry
        { x: 0.60, y: 0.32 }, // Central Bihar
        { x: 0.62, y: 0.33 }, // Eastern Bihar
        { x: 0.64, y: 0.34 }, // West Bengal entry
        { x: 0.66, y: 0.36 }, // Kolkata region
        { x: 0.67, y: 0.40 }, // Ganges Delta
        { x: 0.68, y: 0.44 }, // Bay of Bengal
      ],
      pathLabel: 'River Ganga',
      pathTolerance: 0.06,
      minPathPoints: 8,
      totalMarks: 10,
      difficulty: 'Hard',
      hint: 'Start from Gangotri in the Himalayas (Uttarakhand), flow through the plains of UP and Bihar, then through West Bengal to the Bay of Bengal',
      detailedExplanation: 'The Ganga is the longest river in India, flowing 2,525 km from the Gangotri Glacier in Uttarakhand through the Indo-Gangetic plains to the Bay of Bengal in West Bengal. It is a lifeline for millions and considered sacred in Hinduism.',
      learningTips: [
        'Originates from Gangotri Glacier in Uttarakhand',
        'Flows southeast through the plains',
        'Passes through major cities: Haridwar, Kanpur, Varanasi, Patna, Kolkata',
        'Forms the world\'s largest delta (Sundarbans) before meeting the Bay of Bengal',
        'Total length: approximately 2,525 km'
      ]
    },
    {
      id: 'q5-river',
      type: 'river',
      question: 'Trace the flow of River Narmada from source to Arabian Sea',
      mapImage: indiaMapPolitical,
      correctAnswers: [],
      correctPath: [
        { x: 0.50, y: 0.40 }, // Origin - Amarkantak, MP
        { x: 0.48, y: 0.41 }, // Eastern MP
        { x: 0.46, y: 0.42 }, // Central MP
        { x: 0.44, y: 0.43 }, // Western MP
        { x: 0.42, y: 0.44 }, // MP-Gujarat border
        { x: 0.40, y: 0.45 }, // Eastern Gujarat
        { x: 0.38, y: 0.46 }, // Central Gujarat
        { x: 0.36, y: 0.47 }, // Western Gujarat
        { x: 0.34, y: 0.48 }, // Approaching coast
        { x: 0.32, y: 0.49 }, // Arabian Sea (Bharuch)
      ],
      pathLabel: 'River Narmada',
      pathTolerance: 0.05,
      minPathPoints: 6,
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'Narmada flows westward from Amarkantak in Madhya Pradesh through the Narmada Valley to the Arabian Sea in Gujarat',
      detailedExplanation: 'The Narmada is one of the few major rivers in India that flows westward. It originates from Amarkantak plateau in Madhya Pradesh and flows through a rift valley between the Vindhya and Satpura ranges, eventually draining into the Gulf of Khambhat (Arabian Sea).',
      learningTips: [
        'Flows WEST (unlike most Indian rivers that flow east)',
        'Originates from Amarkantak in Madhya Pradesh',
        'Flows through a rift valley',
        'Forms the boundary between North and South India',
        'Length: approximately 1,312 km'
      ]
    },
    {
      id: 'q6-direction',
      type: 'direction',
      question: 'Draw arrows showing the direction of Indian Monsoon winds: Southwest Monsoon (summer) and Northeast Monsoon (winter)',
      mapImage: indiaMapPolitical,
      correctAnswers: [],
      correctDirections: [
        {
          x: 0.25, y: 0.55, // Arabian Sea (Southwest)
          angle: 45, // Northeast direction (SW monsoon blows TO northeast)
          label: 'SW Monsoon (June-Sep)',
          positionTolerance: 0.10,
          angleTolerance: 30,
          explanation: 'Southwest Monsoon brings moisture-laden winds from the Arabian Sea towards the Indian mainland from June to September, causing heavy rainfall.'
        },
        {
          x: 0.70, y: 0.55, // Bay of Bengal (Southwest)
          angle: 315, // Northwest direction (SW monsoon from Bay of Bengal)
          label: 'SW Monsoon - Bay Branch',
          positionTolerance: 0.10,
          angleTolerance: 30,
          explanation: 'The Bay of Bengal branch of SW Monsoon moves northwest, bringing rainfall to eastern and northeastern India.'
        },
        {
          x: 0.50, y: 0.30, // Central-North India
          angle: 225, // Southwest direction (NE monsoon blows FROM northeast)
          label: 'NE Monsoon (Oct-Dec)',
          positionTolerance: 0.10,
          angleTolerance: 30,
          explanation: 'Northeast Monsoon winds blow from land to sea during winter months, bringing rainfall to Tamil Nadu and coastal Andhra Pradesh.'
        },
      ],
      minDirections: 2,
      totalMarks: 10,
      difficulty: 'Hard',
      hint: 'SW Monsoon (summer): winds blow FROM Arabian Sea and Bay of Bengal TOWARDS India. NE Monsoon (winter): winds blow FROM land TOWARDS southeast coast',
      detailedExplanation: 'India experiences two monsoon seasons: Southwest Monsoon (June-September) brings moisture from oceans towards land, causing widespread rainfall. Northeast Monsoon (October-December) brings dry continental winds, with rainfall limited to southeastern coast.',
      learningTips: [
        'SW Monsoon: Winds blow from southwest to northeast (June-Sep)',
        'Carries moisture from Arabian Sea and Bay of Bengal',
        'NE Monsoon: Winds blow from northeast to southwest (Oct-Dec)',
        'Affects mainly Tamil Nadu and coastal regions',
        'Arrow direction shows WHERE the wind is GOING'
      ]
    },
    {
      id: 'q7-direction',
      type: 'direction',
      question: 'Show the direction of major ocean currents around India: Somali Current and Equatorial Current',
      mapImage: indiaMapPolitical,
      correctAnswers: [],
      correctDirections: [
        {
          x: 0.20, y: 0.60, // Arabian Sea - Somali Current
          angle: 0, // East direction (flows northward along coast during summer)
          label: 'Somali Current (Summer)',
          positionTolerance: 0.12,
          angleTolerance: 35,
          explanation: 'The Somali Current flows northward along the western coast of India during summer monsoon, bringing warm water from the equator.'
        },
        {
          x: 0.45, y: 0.80, // South of India - Equatorial Current
          angle: 90, // South direction (westward flow)
          label: 'Equatorial Current',
          positionTolerance: 0.12,
          angleTolerance: 35,
          explanation: 'The South Equatorial Current flows westward across the Indian Ocean, influencing the climate of southern India.'
        },
      ],
      minDirections: 2,
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'Somali Current flows along the western (Arabian Sea) coast. Equatorial Current flows from east to west in the southern Indian Ocean',
      detailedExplanation: 'Ocean currents around India are influenced by monsoon winds. The Somali Current reverses direction seasonally, flowing strongly northward during summer. The Equatorial Current flows westward year-round, affecting sea surface temperatures.',
      learningTips: [
        'Somali Current: Flows along Arabian Sea coast',
        'Reverses direction with monsoons',
        'Equatorial Current: Flows westward (east to west)',
        'Ocean currents affect coastal climate and fishing'
      ]
    },
    {
      id: 'q8-combo',
      type: 'combo',
      question: 'Complete Geography Challenge: (1) Trace River Ganga, (2) Draw the Deccan Plateau boundary, (3) Show SW Monsoon wind direction, (4) Mark the Indian Standard Time line (82.5°E longitude)',
      mapImage: indiaMapPolitical,
      // Point marking - IST line
      correctAnswers: [
        { x: 0.52, y: 0.20, label: 'IST Line (82.5°E) - North', tolerance: 0.03 },
        { x: 0.52, y: 0.40, label: 'IST Line (82.5°E) - Central', tolerance: 0.03 },
        { x: 0.52, y: 0.60, label: 'IST Line (82.5°E) - South', tolerance: 0.03 },
      ],
      // River path - Ganga
      correctPath: [
        { x: 0.42, y: 0.18 }, // Gangotri
        { x: 0.44, y: 0.20 },
        { x: 0.46, y: 0.23 },
        { x: 0.48, y: 0.26 },
        { x: 0.51, y: 0.28 },
        { x: 0.54, y: 0.29 },
        { x: 0.56, y: 0.30 },
        { x: 0.58, y: 0.31 },
        { x: 0.60, y: 0.32 },
        { x: 0.62, y: 0.33 },
        { x: 0.64, y: 0.34 },
        { x: 0.66, y: 0.36 },
        { x: 0.67, y: 0.40 },
        { x: 0.68, y: 0.44 },
      ],
      pathLabel: 'River Ganga',
      pathTolerance: 0.06,
      minPathPoints: 8,
      // Area - Deccan Plateau
      correctArea: [
        { x: 0.35, y: 0.45 },
        { x: 0.50, y: 0.38 },
        { x: 0.62, y: 0.42 },
        { x: 0.68, y: 0.55 },
        { x: 0.65, y: 0.72 },
        { x: 0.42, y: 0.78 },
        { x: 0.30, y: 0.65 },
        { x: 0.32, y: 0.52 },
      ],
      areaLabel: 'Deccan Plateau',
      areaTolerance: 0.08,
      // Direction - SW Monsoon
      correctDirections: [
        {
          x: 0.25, y: 0.55,
          angle: 45,
          label: 'SW Monsoon',
          positionTolerance: 0.10,
          angleTolerance: 30,
        },
      ],
      minDirections: 1,
      comboTasks: [
        { type: 'river', instruction: 'Trace River Ganga from source to Bay of Bengal', marks: 8 },
        { type: 'area', instruction: 'Draw the Deccan Plateau boundary', marks: 8 },
        { type: 'direction', instruction: 'Show SW Monsoon wind direction', marks: 6 },
        { type: 'point', instruction: 'Mark 3 points along Indian Standard Time line (82.5°E)', marks: 6 },
      ],
      totalMarks: 28,
      difficulty: 'Hard',
      hint: 'Use the palette to switch between drawing modes. Complete each task: River (blue), Area (purple), Wind Arrow (orange), IST markers (red)',
      detailedExplanation: 'This comprehensive question tests multiple geography concepts: river systems, plateau boundaries, monsoon patterns, and longitude lines. The IST line at 82.5°E passes through Mirzapur (near Allahabad) and determines India\'s standard time.',
      learningTips: [
        'River Ganga: Start from Uttarakhand, flow through plains to Bay of Bengal',
        'Deccan Plateau: Triangular plateau in southern India',
        'SW Monsoon: Winds blow from Arabian Sea towards land (June-Sep)',
        'IST Line: 82.5°E longitude runs through central India'
      ]
    },
  ],
  'human-heart': [
    {
      id: 'bio-q1',
      question: 'Identify and mark the following chambers: Right Atrium, Left Ventricle, and Aorta',
      mapImage: 'https://images.unsplash.com/photo-1715111965920-b6d4b4fc579f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGhlYXJ0JTIwYW5hdG9teSUyMGRpYWdyYW18ZW58MXx8fHwxNzY2OTI1MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { 
          x: 0.60, 
          y: 0.35, 
          label: 'Right Atrium', 
          tolerance: 0.06,
          explanation: 'The right atrium receives deoxygenated blood from the body through the superior and inferior vena cava. It is located in the upper right portion of the heart.'
        },
        { 
          x: 0.40, 
          y: 0.65, 
          label: 'Left Ventricle', 
          tolerance: 0.06,
          explanation: 'The left ventricle pumps oxygenated blood to the entire body through the aorta. It has the thickest muscular walls of all four chambers.'
        },
        { 
          x: 0.45, 
          y: 0.25, 
          label: 'Aorta', 
          tolerance: 0.06,
          explanation: 'The aorta is the largest artery in the body. It carries oxygenated blood from the left ventricle to the entire body. It curves upward from the heart.'
        },
      ],
      totalMarks: 6,
      difficulty: 'Medium',
      hint: 'Right Atrium is on the upper right, Left Ventricle is lower left, Aorta curves from the top',
      requireLabels: true,
      detailedExplanation: 'The heart has four chambers: two atria (upper chambers) and two ventricles (lower chambers). The right side receives deoxygenated blood and pumps it to the lungs, while the left side receives oxygenated blood from the lungs and pumps it to the body.',
      learningTips: [
        'Right Atrium: Upper right chamber, receives blood from body',
        'Left Ventricle: Lower left chamber, has thickest walls, strongest pump',
        'Aorta: Large artery curving upward from left ventricle'
      ]
    },
    {
      id: 'bio-q1b',
      question: 'Label the four heart valves: Tricuspid, Pulmonary, Mitral, and Aortic',
      mapImage: 'https://images.unsplash.com/photo-1715111965920-b6d4b4fc579f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGhlYXJ0JTIwYW5hdG9teSUyMGRpYWdyYW18ZW58MXx8fHwxNzY2OTI1MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.58, y: 0.48, label: 'Tricuspid Valve', tolerance: 0.05, explanation: 'Between right atrium and right ventricle' },
        { x: 0.52, y: 0.32, label: 'Pulmonary Valve', tolerance: 0.05, explanation: 'Between right ventricle and pulmonary artery' },
        { x: 0.42, y: 0.48, label: 'Mitral Valve', tolerance: 0.05, explanation: 'Between left atrium and left ventricle' },
        { x: 0.45, y: 0.30, label: 'Aortic Valve', tolerance: 0.05, explanation: 'Between left ventricle and aorta' },
      ],
      totalMarks: 8,
      difficulty: 'Hard',
      hint: 'Valves are located between chambers and major blood vessels',
      requireLabels: true,
      detailedExplanation: 'Heart valves ensure one-way blood flow. Tricuspid and Mitral are AV valves (between atria and ventricles). Pulmonary and Aortic are semilunar valves (to major arteries).',
      learningTips: [
        'Tricuspid: Right side, has 3 cusps',
        'Mitral (Bicuspid): Left side, has 2 cusps',
        'Pulmonary: Controls blood to lungs',
        'Aortic: Controls blood to body'
      ]
    },
    {
      id: 'bio-q1c',
      question: 'Trace the path of blood flow: Mark Superior Vena Cava → Right Atrium → Right Ventricle → Pulmonary Artery',
      mapImage: 'https://images.unsplash.com/photo-1715111965920-b6d4b4fc579f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGhlYXJ0JTIwYW5hdG9teSUyMGRpYWdyYW18ZW58MXx8fHwxNzY2OTI1MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      type: 'river',
      correctPath: [
        { x: 0.62, y: 0.15 },  // Superior Vena Cava
        { x: 0.60, y: 0.35 },  // Right Atrium
        { x: 0.58, y: 0.55 },  // Right Ventricle
        { x: 0.52, y: 0.25 },  // Pulmonary Artery
      ],
      pathLabel: 'Deoxygenated Blood Flow',
      correctAnswers: [],
      totalMarks: 8,
      difficulty: 'Hard',
      hint: 'Start from top-right (SVC), flow down to right chambers, then up to pulmonary artery',
      detailedExplanation: 'This path shows deoxygenated blood returning from the body, entering the heart, and being pumped to the lungs for oxygenation.',
      learningTips: [
        'SVC brings blood from upper body',
        'Blood flows: Atrium → Ventricle → Artery',
        'Pulmonary artery carries blood TO lungs'
      ]
    },
  ],
  'digestive-system': [
    {
      id: 'bio-q2',
      question: 'Mark the positions of: Stomach, Small Intestine, and Liver',
      mapImage: 'https://images.unsplash.com/photo-1715529134960-b49e99668dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGRpZ2VzdGl2ZSUyMHN5c3RlbSUyMGFuYXRvbXl8ZW58MXx8fHwxNzY2OTI1MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.35, y: 0.35, label: 'Stomach', tolerance: 0.07, explanation: 'Muscular organ that churns and breaks down food with gastric juices' },
        { x: 0.50, y: 0.60, label: 'Small Intestine', tolerance: 0.08, explanation: 'Main site of nutrient absorption, about 6 meters long' },
        { x: 0.55, y: 0.28, label: 'Liver', tolerance: 0.07, explanation: 'Largest internal organ, produces bile for fat digestion' },
      ],
      totalMarks: 6,
      difficulty: 'Easy',
      hint: 'Stomach is upper left abdomen, Small Intestine in center-lower, Liver is upper right',
      requireLabels: true,
    },
    {
      id: 'bio-q2b',
      question: 'Identify all digestive organs: Esophagus, Stomach, Pancreas, Liver, Gallbladder, Small Intestine, Large Intestine',
      mapImage: 'https://images.unsplash.com/photo-1715529134960-b49e99668dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGRpZ2VzdGl2ZSUyMHN5c3RlbSUyMGFuYXRvbXl8ZW58MXx8fHwxNzY2OTI1MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.42, y: 0.20, label: 'Esophagus', tolerance: 0.06, explanation: 'Tube connecting mouth to stomach' },
        { x: 0.35, y: 0.35, label: 'Stomach', tolerance: 0.07, explanation: 'J-shaped digestive organ' },
        { x: 0.48, y: 0.42, label: 'Pancreas', tolerance: 0.06, explanation: 'Produces digestive enzymes and insulin' },
        { x: 0.55, y: 0.28, label: 'Liver', tolerance: 0.07, explanation: 'Produces bile, detoxifies blood' },
        { x: 0.52, y: 0.32, label: 'Gallbladder', tolerance: 0.05, explanation: 'Stores and concentrates bile' },
        { x: 0.48, y: 0.55, label: 'Small Intestine', tolerance: 0.08, explanation: 'Nutrient absorption site' },
        { x: 0.42, y: 0.72, label: 'Large Intestine', tolerance: 0.08, explanation: 'Water absorption, waste formation' },
      ],
      totalMarks: 14,
      difficulty: 'Hard',
      hint: 'Trace the digestive path from mouth to exit',
      requireLabels: true,
      detailedExplanation: 'The digestive system breaks down food into nutrients. Food travels: Mouth → Esophagus → Stomach → Small Intestine → Large Intestine. Helper organs (liver, pancreas, gallbladder) aid digestion.',
      learningTips: [
        'Esophagus: Food pipe from throat to stomach',
        'Stomach: Acids and enzymes break down food',
        'Pancreas: Behind stomach, produces enzymes',
        'Liver: Upper right, largest gland',
        'Gallbladder: Below liver, stores bile',
        'Small Intestine: Long coiled tube, absorbs nutrients',
        'Large Intestine: Frames the small intestine'
      ]
    },
    {
      id: 'bio-q2c',
      question: 'Trace the complete digestive pathway from mouth to rectum',
      mapImage: 'https://images.unsplash.com/photo-1715529134960-b49e99668dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGRpZ2VzdGl2ZSUyMHN5c3RlbSUyMGFuYXRvbXl8ZW58MXx8fHwxNzY2OTI1MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      type: 'river',
      correctPath: [
        { x: 0.42, y: 0.10 },  // Mouth
        { x: 0.42, y: 0.20 },  // Esophagus
        { x: 0.35, y: 0.35 },  // Stomach
        { x: 0.40, y: 0.48 },  // Duodenum
        { x: 0.48, y: 0.58 },  // Jejunum
        { x: 0.52, y: 0.65 },  // Ileum
        { x: 0.38, y: 0.72 },  // Colon
        { x: 0.45, y: 0.85 },  // Rectum
      ],
      pathLabel: 'Food Pathway',
      correctAnswers: [],
      totalMarks: 10,
      difficulty: 'Hard',
      hint: 'Follow the natural path of food through the digestive tract',
      detailedExplanation: 'Food takes 24-72 hours to travel through the entire digestive system. The journey: Mouth (chewing) → Esophagus (swallowing) → Stomach (3-4 hours) → Small Intestine (3-5 hours) → Large Intestine (12-48 hours).',
    },
  ],
  'brain-structure': [
    {
      id: 'bio-q3',
      question: 'Label the major brain regions: Cerebrum, Cerebellum, Brain Stem, and Corpus Callosum',
      mapImage: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFpbiUyMGFuYXRvbXl8ZW58MXx8fHwxNzY2OTI1MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.35, label: 'Cerebrum', tolerance: 0.08, explanation: 'Largest part, controls thinking, memory, voluntary movements' },
        { x: 0.65, y: 0.70, label: 'Cerebellum', tolerance: 0.07, explanation: 'Coordinates balance and smooth movements' },
        { x: 0.50, y: 0.75, label: 'Brain Stem', tolerance: 0.06, explanation: 'Controls breathing, heart rate, blood pressure' },
        { x: 0.50, y: 0.48, label: 'Corpus Callosum', tolerance: 0.06, explanation: 'Connects left and right hemispheres' },
      ],
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'Cerebrum is the large upper part, Cerebellum is at the back-bottom, Brain Stem connects to spinal cord',
      requireLabels: true,
      detailedExplanation: 'The brain has three main parts: Cerebrum (thinking), Cerebellum (coordination), and Brain Stem (automatic functions). The corpus callosum is a thick band of nerve fibers connecting the brain\'s two hemispheres.',
      learningTips: [
        'Cerebrum: Wrinkled outer layer, 85% of brain weight',
        'Cerebellum: "Little brain" at the back',
        'Brain Stem: Connects brain to spinal cord',
        'Corpus Callosum: Information highway between hemispheres'
      ]
    },
    {
      id: 'bio-q3b',
      question: 'Identify brain lobes: Frontal, Parietal, Temporal, and Occipital lobes',
      mapImage: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFpbiUyMGFuYXRvbXl8ZW58MXx8fHwxNzY2OTI1MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.35, y: 0.30, label: 'Frontal Lobe', tolerance: 0.08, explanation: 'Decision making, problem solving, planning' },
        { x: 0.58, y: 0.28, label: 'Parietal Lobe', tolerance: 0.07, explanation: 'Processing sensory information, spatial awareness' },
        { x: 0.40, y: 0.52, label: 'Temporal Lobe', tolerance: 0.07, explanation: 'Hearing, memory, language comprehension' },
        { x: 0.72, y: 0.42, label: 'Occipital Lobe', tolerance: 0.06, explanation: 'Visual processing center' },
      ],
      totalMarks: 8,
      difficulty: 'Hard',
      hint: 'Frontal (front), Parietal (top), Temporal (sides), Occipital (back)',
      requireLabels: true,
      detailedExplanation: 'The cerebrum is divided into four lobes on each hemisphere, each responsible for different functions. Damage to specific lobes affects corresponding abilities.',
      learningTips: [
        'Frontal: Front of brain, personality and movement',
        'Parietal: Top center, touch and temperature',
        'Temporal: Sides near temples, hearing and smell',
        'Occipital: Back of brain, vision only'
      ]
    },
  ],
  'respiratory-system': [
    {
      id: 'bio-q4',
      question: 'Label respiratory organs: Trachea, Bronchi, Lungs, Diaphragm, and Alveoli',
      mapImage: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNwaXJhdG9yeSUyMHN5c3RlbXxlbnwxfHx8fDE3NjY5MjUwMjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.25, label: 'Trachea', tolerance: 0.06, explanation: 'Windpipe connecting nose/mouth to lungs' },
        { x: 0.48, y: 0.42, label: 'Bronchi', tolerance: 0.07, explanation: 'Two main tubes branching from trachea to each lung' },
        { x: 0.60, y: 0.55, label: 'Right Lung', tolerance: 0.10, explanation: 'Has 3 lobes, slightly larger' },
        { x: 0.40, y: 0.55, label: 'Left Lung', tolerance: 0.10, explanation: 'Has 2 lobes, makes room for heart' },
        { x: 0.50, y: 0.78, label: 'Diaphragm', tolerance: 0.08, explanation: 'Muscle that controls breathing' },
      ],
      totalMarks: 10,
      difficulty: 'Medium',
      hint: 'Air flows: Trachea → Bronchi → Lungs. Diaphragm is the breathing muscle below',
      requireLabels: true,
      detailedExplanation: 'The respiratory system brings oxygen into the body and removes carbon dioxide. Air travels through nose/mouth → trachea → bronchi → lungs (alveoli for gas exchange). The diaphragm contracts/relaxes to control breathing.',
      learningTips: [
        'Trachea: Reinforced with C-shaped cartilage rings',
        'Bronchi: Left and right main airways',
        'Lungs: Spongy, pink organs in chest cavity',
        'Diaphragm: Dome-shaped muscle, contracts during inhalation'
      ]
    },
    {
      id: 'bio-q4b',
      question: 'Trace the airflow pathway: Nose → Trachea → Bronchi → Bronchioles → Alveoli',
      mapImage: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNwaXJhdG9yeSUyMHN5c3RlbXxlbnwxfHx8fDE3NjY5MjUwMjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      type: 'river',
      correctPath: [
        { x: 0.50, y: 0.10 },  // Nose
        { x: 0.50, y: 0.25 },  // Trachea
        { x: 0.48, y: 0.40 },  // Bronchi
        { x: 0.55, y: 0.52 },  // Bronchioles
        { x: 0.58, y: 0.62 },  // Alveoli
      ],
      pathLabel: 'Oxygen Pathway',
      correctAnswers: [],
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'Air flows downward from nose through progressively smaller tubes',
      detailedExplanation: 'Inhaled air travels through increasingly smaller passages: Nose/Mouth → Pharynx → Larynx → Trachea → Bronchi → Bronchioles → Alveoli (tiny air sacs where oxygen enters blood).',
    },
  ],
  'flower-parts': [
    {
      id: 'bot-q1',
      question: 'Identify and label: Petals, Stamen, and Pistil',
      mapImage: 'https://images.unsplash.com/photo-1714929818826-583ce7c11422?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjBwYXJ0cyUyMGRpYWdyYW18ZW58MXx8fHwxNzY2OTI1MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.45, label: 'Petals', tolerance: 0.08, explanation: 'Colorful parts that attract pollinators' },
        { x: 0.48, y: 0.35, label: 'Stamen', tolerance: 0.06, explanation: 'Male reproductive part containing pollen' },
        { x: 0.50, y: 0.30, label: 'Pistil', tolerance: 0.06, explanation: 'Female reproductive part' },
      ],
      totalMarks: 6,
      difficulty: 'Easy',
      hint: 'Petals are the colorful outer parts, Stamen (male) surrounds Pistil (female) in center',
      requireLabels: true,
    },
    {
      id: 'bot-q1b',
      question: 'Label ALL flower parts: Sepals, Petals, Stamen (Anther & Filament), Pistil (Stigma, Style, Ovary), and Receptacle',
      mapImage: 'https://images.unsplash.com/photo-1714929818826-583ce7c11422?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjBwYXJ0cyUyMGRpYWdyYW18ZW58MXx8fHwxNzY2OTI1MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.65, label: 'Sepals', tolerance: 0.07, explanation: 'Green leaf-like structures protecting the bud' },
        { x: 0.50, y: 0.50, label: 'Petals', tolerance: 0.08, explanation: 'Brightly colored to attract insects' },
        { x: 0.52, y: 0.32, label: 'Anther', tolerance: 0.05, explanation: 'Top of stamen, produces pollen' },
        { x: 0.52, y: 0.40, label: 'Filament', tolerance: 0.05, explanation: 'Stalk supporting anther' },
        { x: 0.48, y: 0.28, label: 'Stigma', tolerance: 0.05, explanation: 'Sticky top of pistil, receives pollen' },
        { x: 0.48, y: 0.35, label: 'Style', tolerance: 0.05, explanation: 'Connects stigma to ovary' },
        { x: 0.48, y: 0.52, label: 'Ovary', tolerance: 0.06, explanation: 'Contains ovules, becomes fruit' },
        { x: 0.50, y: 0.72, label: 'Receptacle', tolerance: 0.06, explanation: 'Base supporting all flower parts' },
      ],
      totalMarks: 16,
      difficulty: 'Hard',
      hint: 'From bottom to top: Receptacle → Sepals → Petals → Reproductive organs (Stamen & Pistil)',
      requireLabels: true,
      detailedExplanation: 'A complete flower has four whorls: Calyx (sepals), Corolla (petals), Androecium (stamens - male), and Gynoecium (pistil - female). The receptacle holds everything together.',
      learningTips: [
        'Sepals: Usually green, protect flower bud',
        'Petals: Colorful, attract pollinators',
        'Stamen = Anther + Filament (male parts)',
        'Pistil = Stigma + Style + Ovary (female parts)',
        'Receptacle: Swollen tip of flower stalk'
      ]
    },
    {
      id: 'bot-q1c',
      question: 'Show pollination process: Pollen from Anther → Stigma → Style → Ovary',
      mapImage: 'https://images.unsplash.com/photo-1714929818826-583ce7c11422?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjBwYXJ0cyUyMGRpYWdyYW18ZW58MXx8fHwxNzY2OTI1MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      type: 'river',
      correctPath: [
        { x: 0.52, y: 0.32 },  // Anther
        { x: 0.48, y: 0.28 },  // Stigma
        { x: 0.48, y: 0.35 },  // Style
        { x: 0.48, y: 0.48 },  // Ovary
      ],
      pathLabel: 'Pollen Tube Pathway',
      correctAnswers: [],
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'Pollen travels from male (anther) to female parts (stigma → style → ovary)',
      detailedExplanation: 'After pollination, pollen grains land on stigma, germinate, and grow a pollen tube down through the style to reach the ovary for fertilization. This leads to seed formation.',
    },
  ],
  'plant-cell': [
    {
      id: 'bot-q2',
      question: 'Mark the following organelles: Cell Wall, Chloroplast, and Nucleus',
      mapImage: 'https://images.unsplash.com/photo-1698892289193-eb8b082ecce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGNlbGwlMjBkaWFncmFtfGVufDF8fHx8MTc2NjkyNTAyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.15, y: 0.50, label: 'Cell Wall', tolerance: 0.07, explanation: 'Rigid outer layer made of cellulose, unique to plant cells' },
        { x: 0.60, y: 0.40, label: 'Chloroplast', tolerance: 0.07, explanation: 'Green organelles where photosynthesis occurs' },
        { x: 0.45, y: 0.50, label: 'Nucleus', tolerance: 0.07, explanation: 'Control center containing DNA' },
      ],
      totalMarks: 6,
      difficulty: 'Medium',
      hint: 'Cell Wall is the outermost layer, Chloroplasts are green oval structures, Nucleus is the central round structure',
      requireLabels: true,
    },
    {
      id: 'bot-q2b',
      question: 'Label ALL plant cell organelles: Cell Wall, Cell Membrane, Chloroplasts, Nucleus, Vacuole, Mitochondria, Cytoplasm',
      mapImage: 'https://images.unsplash.com/photo-1698892289193-eb8b082ecce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGNlbGwlMjBkaWFncmFtfGVufDF8fHx8MTc2NjkyNTAyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.12, y: 0.50, label: 'Cell Wall', tolerance: 0.06, explanation: 'Outermost rigid layer, provides shape and protection' },
        { x: 0.18, y: 0.50, label: 'Cell Membrane', tolerance: 0.06, explanation: 'Inside cell wall, controls what enters/exits cell' },
        { x: 0.58, y: 0.35, label: 'Chloroplast', tolerance: 0.07, explanation: 'Contains chlorophyll, performs photosynthesis' },
        { x: 0.42, y: 0.48, label: 'Nucleus', tolerance: 0.07, explanation: 'Contains genetic material (DNA)' },
        { x: 0.68, y: 0.58, label: 'Vacuole', tolerance: 0.08, explanation: 'Large central storage sac, stores water, nutrients, waste' },
        { x: 0.35, y: 0.38, label: 'Mitochondria', tolerance: 0.06, explanation: 'Powerhouse of cell, produces energy (ATP)' },
        { x: 0.50, y: 0.65, label: 'Cytoplasm', tolerance: 0.08, explanation: 'Jelly-like substance filling the cell' },
      ],
      totalMarks: 14,
      difficulty: 'Hard',
      hint: 'Start from outside: Cell Wall → Cell Membrane → Interior organelles',
      requireLabels: true,
      detailedExplanation: 'Plant cells have unique features: cell wall (rigid structure), chloroplasts (photosynthesis), and large central vacuole (storage). They also share organelles with animal cells like nucleus, mitochondria, and cell membrane.',
      learningTips: [
        'Cell Wall: Only in plants, made of cellulose',
        'Cell Membrane: Present in all cells',
        'Chloroplasts: Make plants green, convert sunlight to sugar',
        'Nucleus: Brain of the cell',
        'Vacuole: Much larger in plant cells than animal cells',
        'Mitochondria: Present in both plant and animal cells'
      ]
    },
    {
      id: 'bot-q2c',
      question: 'Identify the THREE unique features that distinguish plant cells from animal cells',
      mapImage: 'https://images.unsplash.com/photo-1698892289193-eb8b082ecce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGNlbGwlMjBkaWFncmFtfGVufDF8fHx8MTc2NjkyNTAyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.12, y: 0.50, label: 'Cell Wall', tolerance: 0.06, explanation: 'Rigid layer outside cell membrane - UNIQUE TO PLANTS' },
        { x: 0.60, y: 0.40, label: 'Chloroplast', tolerance: 0.07, explanation: 'Photosynthesis organelle - UNIQUE TO PLANTS' },
        { x: 0.68, y: 0.58, label: 'Large Central Vacuole', tolerance: 0.08, explanation: 'Massive storage sac - UNIQUE TO PLANTS (animal cells have small vacuoles)' },
      ],
      totalMarks: 6,
      difficulty: 'Medium',
      hint: 'Look for structures that animal cells do NOT have',
      requireLabels: true,
      detailedExplanation: 'Three key differences: 1) Cell Wall (structural support), 2) Chloroplasts (food production), 3) Large Central Vacuole (storage and rigidity). Animal cells have cell membrane, no chloroplasts, and small vacuoles.',
    },
  ],
  'leaf-structure': [
    {
      id: 'bot-q3',
      question: 'Identify: Midrib, Veins, and Lamina on the leaf',
      mapImage: 'https://images.unsplash.com/photo-1577111243992-0e9c9286d601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWFmJTIwc3RydWN0dXJlJTIwZGlhZ3JhbXxlbnwxfHx8fDE3NjY5MjUwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.50, label: 'Midrib', tolerance: 0.08, explanation: 'Central vein, provides support' },
        { x: 0.65, y: 0.45, label: 'Veins', tolerance: 0.08, explanation: 'Network of vascular bundles' },
        { x: 0.70, y: 0.35, label: 'Lamina', tolerance: 0.08, explanation: 'Flat green blade for photosynthesis' },
      ],
      totalMarks: 6,
      difficulty: 'Easy',
      hint: 'Midrib is the central vein running down the middle, Veins branch from midrib, Lamina is the flat green blade',
      requireLabels: true,
    },
    {
      id: 'bot-q3b',
      question: 'Label all external leaf parts: Petiole, Lamina, Midrib, Veins, Leaf Margin, Leaf Apex, Leaf Base',
      mapImage: 'https://images.unsplash.com/photo-1577111243992-0e9c9286d601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWFmJTIwc3RydWN0dXJlJTIwZGlhZ3JhbXxlbnwxfHx8fDE3NjY5MjUwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.28, y: 0.65, label: 'Petiole', tolerance: 0.07, explanation: 'Leaf stalk connecting blade to stem' },
        { x: 0.62, y: 0.45, label: 'Lamina', tolerance: 0.10, explanation: 'Flat expanded leaf blade' },
        { x: 0.50, y: 0.50, label: 'Midrib', tolerance: 0.08, explanation: 'Central vein, continuation of petiole' },
        { x: 0.58, y: 0.42, label: 'Veins', tolerance: 0.08, explanation: 'Branching vascular bundles' },
        { x: 0.75, y: 0.45, label: 'Leaf Margin', tolerance: 0.07, explanation: 'Edge of the leaf blade' },
        { x: 0.70, y: 0.25, label: 'Leaf Apex', tolerance: 0.06, explanation: 'Pointed tip of the leaf' },
        { x: 0.42, y: 0.62, label: 'Leaf Base', tolerance: 0.06, explanation: 'Where lamina meets petiole' },
      ],
      totalMarks: 14,
      difficulty: 'Medium',
      hint: 'Start from the stalk (petiole) and identify features on the blade (lamina)',
      requireLabels: true,
      detailedExplanation: 'A complete leaf has: Petiole (stalk), Lamina (blade with midrib and veins), Margin (edge), Apex (tip), and Base (attachment point). Veins transport water, minerals, and food.',
      learningTips: [
        'Petiole: Leaf stem, flexible to catch sunlight',
        'Lamina: Main photosynthetic surface',
        'Midrib: Thick central vein',
        'Veins: Reticulate (net-like) or parallel',
        'Margin: Can be smooth, toothed, or lobed',
        'Apex: Shape helps identify plant species'
      ]
    },
    {
      id: 'bot-q3c',
      question: 'Identify leaf internal structure layers: Upper Epidermis, Palisade Mesophyll, Spongy Mesophyll, Lower Epidermis, Stomata',
      mapImage: 'https://images.unsplash.com/photo-1577111243992-0e9c9286d601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWFmJTIwc3RydWN0dXJlJTIwZGlhZ3JhbXxlbnwxfHx8fDE3NjY5MjUwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.28, label: 'Upper Epidermis', tolerance: 0.08, explanation: 'Protective top layer, covered with waxy cuticle' },
        { x: 0.50, y: 0.38, label: 'Palisade Mesophyll', tolerance: 0.08, explanation: 'Column-like cells, main photosynthesis site' },
        { x: 0.50, y: 0.55, label: 'Spongy Mesophyll', tolerance: 0.08, explanation: 'Loosely packed cells with air spaces' },
        { x: 0.50, y: 0.72, label: 'Lower Epidermis', tolerance: 0.08, explanation: 'Protective bottom layer' },
        { x: 0.58, y: 0.75, label: 'Stomata', tolerance: 0.06, explanation: 'Pores for gas exchange, surrounded by guard cells' },
      ],
      totalMarks: 10,
      difficulty: 'Hard',
      hint: 'From top to bottom: Epidermis → Palisade (dense) → Spongy (loose) → Epidermis → Stomata (pores)',
      requireLabels: true,
      detailedExplanation: 'Leaf cross-section shows layers: Upper epidermis (protection), Palisade layer (photosynthesis), Spongy layer (gas exchange), Lower epidermis with stomata (CO₂ intake, O₂ release).',
      learningTips: [
        'Upper Epidermis: Waterproof waxy cuticle',
        'Palisade Cells: Packed with chloroplasts, face sunlight',
        'Spongy Mesophyll: Air spaces for CO₂ circulation',
        'Stomata: Open during day, close at night',
        'Guard Cells: Control stomatal opening/closing'
      ]
    },
  ],
  'root-system': [
    {
      id: 'bot-q4',
      question: 'Label root parts: Root Cap, Root Hairs, Primary Root, Lateral Roots',
      mapImage: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb290JTIwc3lzdGVtfGVufDF8fHx8MTc2NjkyNTAyNXww&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.85, label: 'Root Cap', tolerance: 0.06, explanation: 'Protective covering at root tip' },
        { x: 0.55, y: 0.68, label: 'Root Hairs', tolerance: 0.07, explanation: 'Tiny extensions that absorb water and minerals' },
        { x: 0.50, y: 0.52, label: 'Primary Root', tolerance: 0.10, explanation: 'Main central root (tap root)' },
        { x: 0.42, y: 0.58, label: 'Lateral Roots', tolerance: 0.08, explanation: 'Side branches from primary root' },
      ],
      totalMarks: 8,
      difficulty: 'Medium',
      hint: 'Root cap at the very tip, root hairs in the zone above it, lateral roots branch off from primary root',
      requireLabels: true,
      detailedExplanation: 'Root system anchors plant and absorbs water/nutrients. Root cap protects growing tip, root hairs increase surface area for absorption, lateral roots spread for stability.',
      learningTips: [
        'Root Cap: Like a helmet protecting the tip',
        'Root Hairs: Increase absorption area 10-20 times',
        'Primary Root: Grows downward due to gravity',
        'Lateral Roots: Form root system network'
      ]
    },
    {
      id: 'bot-q4b',
      question: 'Identify root zones (from tip upward): Root Cap, Meristematic Zone, Elongation Zone, Maturation Zone',
      mapImage: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb290JTIwc3lzdGVtfGVufDF8fHx8MTc2NjkyNTAyNXww&ixlib=rb-4.1.0&q=80&w=1080',
      correctAnswers: [
        { x: 0.50, y: 0.85, label: 'Root Cap', tolerance: 0.06, explanation: 'Protects root tip during soil penetration' },
        { x: 0.50, y: 0.78, label: 'Meristematic Zone', tolerance: 0.06, explanation: 'Region of active cell division' },
        { x: 0.50, y: 0.70, label: 'Elongation Zone', tolerance: 0.06, explanation: 'Cells grow longer, root extends' },
        { x: 0.50, y: 0.60, label: 'Maturation Zone', tolerance: 0.08, explanation: 'Cells differentiate, root hairs develop' },
      ],
      totalMarks: 8,
      difficulty: 'Hard',
      hint: 'From tip upward: Cap → Division → Elongation → Maturation',
      requireLabels: true,
      detailedExplanation: 'Root growth occurs in zones: Cap (protection), Meristematic (new cells), Elongation (cells lengthen), Maturation (cells specialize, form root hairs for absorption).',
    },
  ],
};

// NEW: Achievement Definitions
const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedDate' | 'progress'>[] = [
  // Accuracy Achievements
  { id: 'perfect-score', name: 'Perfect Score', description: 'Score 100% in a test', icon: '🎯', category: 'accuracy', requirement: 100, rarity: 'rare' },
  { id: 'ace-shooter', name: 'Ace Shooter', description: 'Maintain 80%+ accuracy across 10 tests', icon: '🏹', category: 'accuracy', requirement: 10, rarity: 'epic' },
  { id: 'sharpshooter', name: 'Sharpshooter', description: 'Score 90%+ in 5 tests', icon: '🎪', category: 'accuracy', requirement: 5, rarity: 'rare' },
  
  // Streak Achievements
  { id: 'on-fire', name: 'On Fire!', description: 'Practice for 3 days in a row', icon: '🔥', category: 'streak', requirement: 3, rarity: 'common' },
  { id: 'unstoppable', name: 'Unstoppable', description: 'Practice for 7 days in a row', icon: '⚡', category: 'streak', requirement: 7, rarity: 'rare' },
  { id: 'legendary-streak', name: 'Legendary Streak', description: 'Practice for 30 days in a row', icon: '👑', category: 'streak', requirement: 30, rarity: 'legendary' },
  
  // Volume Achievements
  { id: 'getting-started', name: 'Getting Started', description: 'Complete your first test', icon: '🌱', category: 'volume', requirement: 1, rarity: 'common' },
  { id: 'practice-warrior', name: 'Practice Warrior', description: 'Complete 50 tests', icon: '⚔️', category: 'volume', requirement: 50, rarity: 'epic' },
  { id: 'master-student', name: 'Master Student', description: 'Complete 100 tests', icon: '🎓', category: 'volume', requirement: 100, rarity: 'legendary' },
  
  // Speed Achievements
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete 10 timed tests', icon: '⏱️', category: 'speed', requirement: 10, rarity: 'rare' },
  { id: 'lightning-fast', name: 'Lightning Fast', description: 'Complete a test in under 1 minute', icon: '⚡', category: 'speed', requirement: 60, rarity: 'epic' },
  
  // Mastery Achievements
  { id: 'geography-master', name: 'Geography Master', description: 'Complete 20 Geography tests', icon: '🌍', category: 'mastery', requirement: 20, rarity: 'epic' },
  { id: 'biology-master', name: 'Biology Master', description: 'Complete 20 Biology tests', icon: '🧬', category: 'mastery', requirement: 20, rarity: 'epic' },
  { id: 'botany-master', name: 'Botany Master', description: 'Complete 20 Botany tests', icon: '🌿', category: 'mastery', requirement: 20, rarity: 'epic' },
  { id: 'all-rounder', name: 'All-Rounder', description: 'Complete 10 tests in each subject', icon: '🌟', category: 'mastery', requirement: 10, rarity: 'legendary' },
];

// NEW: Calculate XP from performance
const calculateXP = (record: PerformanceRecord): number => {
  let xp = record.questionsAttempted * 10; // Base XP
  xp += record.correctAnswers * 15; // Bonus for correct answers
  if (record.accuracy >= 90) xp += 50; // Accuracy bonus
  if (record.timedMode) xp += 20; // Timed mode bonus
  return xp;
};

// NEW: Calculate level from XP
const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / 500) + 1; // Every 500 XP = 1 level
};

// NEW: Check and unlock achievements
const checkAchievements = (
  performanceHistory: PerformanceRecord[],
  currentAchievements: Achievement[],
  userProgress: UserProgress
): Achievement[] => {
  return achievementDefinitions.map(def => {
    const existing = currentAchievements.find(a => a.id === def.id);
    let progress = 0;
    let unlocked = existing?.unlocked || false;
    
    if (!unlocked) {
      switch (def.id) {
        case 'perfect-score':
          const perfectTests = performanceHistory.filter(r => r.accuracy === 100);
          progress = perfectTests.length > 0 ? 100 : 0;
          unlocked = perfectTests.length > 0;
          break;
        
        case 'ace-shooter':
          const highAccuracyTests = performanceHistory.filter(r => r.accuracy >= 80);
          progress = Math.min(100, (highAccuracyTests.length / def.requirement) * 100);
          unlocked = highAccuracyTests.length >= def.requirement;
          break;
        
        case 'sharpshooter':
          const veryHighAccuracyTests = performanceHistory.filter(r => r.accuracy >= 90);
          progress = Math.min(100, (veryHighAccuracyTests.length / def.requirement) * 100);
          unlocked = veryHighAccuracyTests.length >= def.requirement;
          break;
        
        case 'on-fire':
        case 'unstoppable':
        case 'legendary-streak':
          progress = Math.min(100, (userProgress.streak.current / def.requirement) * 100);
          unlocked = userProgress.streak.current >= def.requirement;
          break;
        
        case 'getting-started':
        case 'practice-warrior':
        case 'master-student':
          progress = Math.min(100, (performanceHistory.length / def.requirement) * 100);
          unlocked = performanceHistory.length >= def.requirement;
          break;
        
        case 'speed-demon':
          const timedTests = performanceHistory.filter(r => r.timedMode);
          progress = Math.min(100, (timedTests.length / def.requirement) * 100);
          unlocked = timedTests.length >= def.requirement;
          break;
        
        case 'lightning-fast':
          const fastTests = performanceHistory.filter(r => r.timeSpent <= def.requirement);
          progress = fastTests.length > 0 ? 100 : 0;
          unlocked = fastTests.length > 0;
          break;
        
        case 'geography-master':
          const geoTests = performanceHistory.filter(r => r.subject === 'geography');
          progress = Math.min(100, (geoTests.length / def.requirement) * 100);
          unlocked = geoTests.length >= def.requirement;
          break;
        
        case 'biology-master':
          const bioTests = performanceHistory.filter(r => r.subject === 'biology');
          progress = Math.min(100, (bioTests.length / def.requirement) * 100);
          unlocked = bioTests.length >= def.requirement;
          break;
        
        case 'botany-master':
          const botTests = performanceHistory.filter(r => r.subject === 'botany');
          progress = Math.min(100, (botTests.length / def.requirement) * 100);
          unlocked = botTests.length >= def.requirement;
          break;
        
        case 'all-rounder':
          const geoCount = performanceHistory.filter(r => r.subject === 'geography').length;
          const bioCount = performanceHistory.filter(r => r.subject === 'biology').length;
          const botCount = performanceHistory.filter(r => r.subject === 'botany').length;
          const minCount = Math.min(geoCount, bioCount, botCount);
          progress = Math.min(100, (minCount / def.requirement) * 100);
          unlocked = minCount >= def.requirement;
          break;
      }
    }
    
    return {
      ...def,
      unlocked,
      unlockedDate: unlocked && !existing?.unlocked ? Date.now() : existing?.unlockedDate,
      progress: unlocked ? 100 : progress,
    };
  });
};

// NEW: Analytics Dashboard Component
function AnalyticsDashboard({ 
  performanceHistory,
  userProgress 
}: { 
  performanceHistory: PerformanceRecord[];
  userProgress: UserProgress;
}) {
  // Calculate overall statistics
  const totalTests = performanceHistory.length;
  const totalQuestions = performanceHistory.reduce((sum, r) => sum + r.questionsAttempted, 0);
  const totalCorrect = performanceHistory.reduce((sum, r) => sum + r.correctAnswers, 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const totalScore = performanceHistory.reduce((sum, r) => sum + r.score, 0);
  const totalPossibleMarks = performanceHistory.reduce((sum, r) => sum + r.totalMarks, 0);
  const averageScore = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0;

  // Subject-wise stats
  const subjectStats = ['geography', 'biology', 'botany'].map(subjectId => {
    const subjectRecords = performanceHistory.filter(r => r.subject === subjectId);
    const questions = subjectRecords.reduce((sum, r) => sum + r.questionsAttempted, 0);
    const correct = subjectRecords.reduce((sum, r) => sum + r.correctAnswers, 0);
    const accuracy = questions > 0 ? (correct / questions) * 100 : 0;
    
    return {
      id: subjectId,
      name: subjects.find(s => s.id === subjectId)?.name || subjectId,
      icon: subjects.find(s => s.id === subjectId)?.icon || '',
      tests: subjectRecords.length,
      questions,
      accuracy,
    };
  }).filter(s => s.tests > 0);

  // Recent activity (last 10)
  const recentActivity = [...performanceHistory]
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  // Time stats
  const timedTests = performanceHistory.filter(r => r.timedMode);
  const avgTimePerQuestion = timedTests.length > 0
    ? timedTests.reduce((sum, r) => sum + r.timeSpent, 0) / timedTests.length
    : 0;

  // Streak calculation
  const last7Days = performanceHistory.filter(r => {
    const daysDiff = (Date.now() - r.date) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });
  const currentStreak = last7Days.length;

  // Strengths and weaknesses
  const chapterPerformance = performanceHistory.reduce((acc, record) => {
    const chapterName = record.chapterName || 'General Practice';
    if (!acc[chapterName]) {
      acc[chapterName] = { correct: 0, total: 0, subject: record.subject };
    }
    acc[chapterName].correct += record.correctAnswers;
    acc[chapterName].total += record.questionsAttempted;
    return acc;
  }, {} as Record<string, { correct: number; total: number; subject: string }>);

  const chapterStats = Object.entries(chapterPerformance).map(([name, stats]) => ({
    name,
    accuracy: (stats.correct / stats.total) * 100,
    subject: stats.subject,
  })).sort((a, b) => b.accuracy - a.accuracy);

  const strengths = chapterStats.slice(0, 3);
  const weaknesses = chapterStats.slice(-3).reverse();

  if (totalTests === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl text-gray-900 mb-2">No Performance Data Yet</h3>
        <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
          Start practicing to see your performance analytics, progress tracking, and personalized insights!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm transition-all"
        >
          Start Practicing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Total Tests</div>
              <div className="text-2xl text-gray-900">{totalTests}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Avg Accuracy</div>
              <div className="text-2xl text-green-600">{overallAccuracy.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Avg Score</div>
              <div className="text-2xl text-purple-600">{averageScore.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">7-Day Streak</div>
              <div className="text-2xl text-orange-600">{currentStreak}</div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: XP & Level Progress */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm text-white/90 mb-1">Your Level</h3>
            <div className="flex items-center gap-3">
              <div className="text-4xl">Level {userProgress.level}</div>
              <div className="text-sm text-white/80">{userProgress.totalXP} XP</div>
            </div>
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
            <Star className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/90">
            <span>Progress to Level {userProgress.level + 1}</span>
            <span>{userProgress.totalXP % 500}/500 XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${((userProgress.totalXP % 500) / 500) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* NEW: Achievements Section */}
      <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Achievements ({userProgress.achievements.filter(a => a.unlocked).length}/{userProgress.achievements.length})
          </h3>
        </div>
        
        {/* Unlocked Achievements */}
        {userProgress.achievements.filter(a => a.unlocked).length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs text-gray-700 mb-3">🏆 Unlocked</h4>
            <div className="grid grid-cols-4 gap-3">
              {userProgress.achievements
                .filter(a => a.unlocked)
                .map(achievement => (
                  <div
                    key={achievement.id}
                    className={`rounded-lg p-4 border-2 text-center transition-all ${
                      achievement.rarity === 'legendary'
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400'
                        : achievement.rarity === 'epic'
                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400'
                        : achievement.rarity === 'rare'
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400'
                        : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-xs text-gray-900 mb-1">{achievement.name}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                    {achievement.unlockedDate && (
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* In Progress Achievements */}
        {userProgress.achievements.filter(a => !a.unlocked && a.progress > 0).length > 0 && (
          <div>
            <h4 className="text-xs text-gray-700 mb-3">🎯 In Progress</h4>
            <div className="space-y-3">
              {userProgress.achievements
                .filter(a => !a.unlocked && a.progress > 0)
                .sort((a, b) => b.progress - a.progress)
                .slice(0, 5)
                .map(achievement => (
                  <div key={achievement.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl opacity-50">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-900 mb-1">{achievement.name}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{achievement.progress.toFixed(0)}% Complete</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                          achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                          achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{achievement.rarity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Locked Achievements Preview */}
        {userProgress.achievements.filter(a => !a.unlocked && a.progress === 0).length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs text-gray-700 mb-3">🔒 Locked (Coming Soon)</h4>
            <div className="grid grid-cols-6 gap-2">
              {userProgress.achievements
                .filter(a => !a.unlocked && a.progress === 0)
                .slice(0, 6)
                .map(achievement => (
                  <div
                    key={achievement.id}
                    className="bg-gray-100 rounded-lg p-3 border border-gray-200 text-center opacity-40"
                    title={`${achievement.name}: ${achievement.description}`}
                  >
                    <div className="text-2xl grayscale">{achievement.icon}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
        <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          Subject-wise Performance
        </h3>
        <div className="space-y-4">
          {subjectStats.map(subject => (
            <div key={subject.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{subject.icon}</span>
                  <span className="text-sm text-gray-900">{subject.name}</span>
                  <span className="text-xs text-gray-500">({subject.tests} tests)</span>
                </div>
                <span className="text-sm text-green-600">{subject.accuracy.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${subject.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
          <h3 className="text-sm text-green-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Your Strengths
          </h3>
          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((chapter, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-900">{chapter.name}</span>
                    <span className="text-sm text-green-600">{chapter.accuracy.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${chapter.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-green-800">Complete more tests to identify strengths</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border-2 border-orange-200">
          <h3 className="text-sm text-orange-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            Areas to Improve
          </h3>
          {weaknesses.length > 0 ? (
            <div className="space-y-3">
              {weaknesses.map((chapter, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-900">{chapter.name}</span>
                    <span className="text-sm text-orange-600">{chapter.accuracy.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-orange-600 h-1.5 rounded-full"
                      style={{ width: `${chapter.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-orange-800">Complete more tests to identify areas for improvement</p>
          )}
        </div>
      </div>

      {/* Time Analytics */}
      {timedTests.length > 0 && (
        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
          <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Time Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-blue-900 mb-1">Timed Tests</div>
              <div className="text-2xl text-blue-600">{timedTests.length}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-blue-900 mb-1">Avg Time/Question</div>
              <div className="text-2xl text-blue-600">
                {Math.floor(avgTimePerQuestion / 60)}:{(avgTimePerQuestion % 60).toFixed(0).padStart(2, '0')}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-blue-900 mb-1">Total Practice Time</div>
              <div className="text-2xl text-blue-600">
                {Math.floor(timedTests.reduce((sum, r) => sum + r.timeSpent, 0) / 60)}m
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
        <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity.map((activity, idx) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">
                  {subjects.find(s => s.id === activity.subject)?.icon}
                </div>
                <div>
                  <div className="text-xs text-gray-900">{activity.chapterName || 'General Practice'}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()} • {activity.mode === 'random' ? 'Random Test' : 'Chapter Practice'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600">{activity.accuracy.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">{activity.score.toFixed(1)}/{activity.totalMarks}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <h3 className="text-sm text-purple-900 mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Personalized Recommendations
        </h3>
        <div className="space-y-2 text-xs text-purple-800">
          {overallAccuracy < 60 && (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Your accuracy is below 60%. Focus on understanding concepts before attempting more tests.</p>
            </div>
          )}
          {weaknesses.length > 0 && (
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Practice more on: <strong>{weaknesses[0].name}</strong> to improve your weak areas.</p>
            </div>
          )}
          {currentStreak < 3 && (
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Build consistency! Try to practice at least once daily to build a strong learning streak.</p>
            </div>
          )}
          {timedTests.length === 0 && (
            <div className="flex items-start gap-2">
              <Timer className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Try Timed Test Mode to simulate exam conditions and improve time management.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MapPractice() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'chapter' | 'random' | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userMarkers, setUserMarkers] = useState<Coordinate[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [randomTestQuestions, setRandomTestQuestions] = useState<Question[]>([]);
  
  // NEW: Area drawing states
  const [userAreaPoints, setUserAreaPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const [areaDrawingComplete, setAreaDrawingComplete] = useState(false);
  
  // NEW: River/path tracing states
  const [userPathPoints, setUserPathPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isTracingPath, setIsTracingPath] = useState(false);
  const [pathTracingComplete, setPathTracingComplete] = useState(false);
  
  // NEW: Directional arrow states
  const [userArrows, setUserArrows] = useState<Array<{ x: number; y: number; angle: number; id: string }>>([]);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowEnd, setArrowEnd] = useState<{ x: number; y: number } | null>(null);
  
  // NEW: Combo question drawing mode
  const [drawingMode, setDrawingMode] = useState<'point' | 'area' | 'river' | 'direction'>('point');
  
  // NEW: Performance and Analytics States
  const [viewMode, setViewMode] = useState<'practice' | 'analytics'>('practice');
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceRecord[]>([]);
  
  // NEW: Feature #5 - Achievement System States
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalXP: 0,
    level: 1,
    achievements: [],
    streak: { current: 0, longest: 0, lastPracticeDate: 0 },
  });
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]); // For notifications
  
  // NEW: Feature #6 - Revision Mode States
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  
  // NEW: Timer States  
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes per question
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  
  // Zoom and Pan states
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Marker editing states
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  
  // Loading state
  const [isMapLoading, setIsMapLoading] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestions = selectedMode === 'random' 
    ? randomTestQuestions 
    : (selectedChapter ? sampleQuestions[selectedChapter] || [] : []);
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // NEW: Load all data from localStorage on mount
  useEffect(() => {
    // Load performance history
    const saved = localStorage.getItem('mapPracticePerformance');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setPerformanceHistory(history);
        
        // Calculate and load user progress
        const totalXP = history.reduce((sum: number, r: PerformanceRecord) => sum + calculateXP(r), 0);
        const level = calculateLevel(totalXP);
        
        // Calculate streak
        const sortedHistory = [...history].sort((a, b) => b.date - a.date);
        let currentStreak = 0;
        let longestStreak = 0;
        let lastDate = 0;
        
        if (sortedHistory.length > 0) {
          lastDate = sortedHistory[0].date;
          const today = new Date().setHours(0, 0, 0, 0);
          const lastPracticeDay = new Date(lastDate).setHours(0, 0, 0, 0);
          
          if (today === lastPracticeDay || today - lastPracticeDay === 86400000) {
            currentStreak = 1;
            let checkDate = lastPracticeDay;
            
            for (let i = 1; i < sortedHistory.length; i++) {
              const recordDay = new Date(sortedHistory[i].date).setHours(0, 0, 0, 0);
              if (checkDate - recordDay === 86400000) {
                currentStreak++;
                checkDate = recordDay;
              } else if (checkDate !== recordDay) {
                break;
              }
            }
          }
          
          longestStreak = currentStreak; // Simplified, could track historically
        }
        
        // Load or initialize achievements
        const savedAchievements = localStorage.getItem('mapPracticeAchievements');
        const achievements = savedAchievements ? JSON.parse(savedAchievements) : [];
        
        const progress: UserProgress = {
          totalXP,
          level,
          achievements: checkAchievements(history, achievements, {
            totalXP,
            level,
            achievements: [],
            streak: { current: currentStreak, longest: longestStreak, lastPracticeDate: lastDate }
          }),
          streak: { current: currentStreak, longest: longestStreak, lastPracticeDate: lastDate },
        };
        
        setUserProgress(progress);
        
        // Check for new achievements
        const newlyUnlocked = progress.achievements.filter(a => 
          a.unlocked && !achievements.find((old: Achievement) => old.id === a.id && old.unlocked)
        );
        if (newlyUnlocked.length > 0) {
          setNewAchievements(newlyUnlocked);
          localStorage.setItem('mapPracticeAchievements', JSON.stringify(progress.achievements));
        }
      } catch (e) {
        console.error('Failed to load performance history:', e);
      }
    }
    
    // Load wrong answers for revision mode
    const savedWrong = localStorage.getItem('mapPracticeWrongAnswers');
    if (savedWrong) {
      try {
        setWrongAnswers(JSON.parse(savedWrong));
      } catch (e) {
        console.error('Failed to load wrong answers:', e);
      }
    }
    
    // Load bookmarks
    const savedBookmarks = localStorage.getItem('mapPracticeBookmarks');
    if (savedBookmarks) {
      try {
        setBookmarkedQuestions(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    }
  }, []);

  // NEW: Save performance record with achievements and XP
  const savePerformanceRecord = (record: PerformanceRecord) => {
    const updated = [...performanceHistory, record];
    setPerformanceHistory(updated);
    localStorage.setItem('mapPracticePerformance', JSON.stringify(updated));
    
    // Update XP and level
    const xpGained = calculateXP(record);
    const newTotalXP = userProgress.totalXP + xpGained;
    const newLevel = calculateLevel(newTotalXP);
    
    // Update streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastPracticeDay = new Date(userProgress.streak.lastPracticeDate).setHours(0, 0, 0, 0);
    let newStreak = userProgress.streak.current;
    
    if (today - lastPracticeDay === 86400000) {
      newStreak++; // Consecutive day
    } else if (today !== lastPracticeDay) {
      newStreak = 1; // Streak broken, start new
    }
    
    const newProgress: UserProgress = {
      totalXP: newTotalXP,
      level: newLevel,
      achievements: userProgress.achievements,
      streak: {
        current: newStreak,
        longest: Math.max(newStreak, userProgress.streak.longest),
        lastPracticeDate: Date.now(),
      },
    };
    
    // Check for new achievements
    const updatedAchievements = checkAchievements(updated, userProgress.achievements, newProgress);
    newProgress.achievements = updatedAchievements;
    
    const newlyUnlocked = updatedAchievements.filter(a => 
      a.unlocked && !userProgress.achievements.find(old => old.id === a.id && old.unlocked)
    );
    
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
    }
    
    setUserProgress(newProgress);
    localStorage.setItem('mapPracticeAchievements', JSON.stringify(updatedAchievements));
  };

  // NEW: Save wrong answer for revision
  const saveWrongAnswer = (wrongAnswer: WrongAnswer) => {
    const updated = [...wrongAnswers, wrongAnswer];
    setWrongAnswers(updated);
    localStorage.setItem('mapPracticeWrongAnswers', JSON.stringify(updated));
  };

  // NEW: Toggle bookmark
  const toggleBookmark = (questionId: string) => {
    const updated = bookmarkedQuestions.includes(questionId)
      ? bookmarkedQuestions.filter(id => id !== questionId)
      : [...bookmarkedQuestions, questionId];
    setBookmarkedQuestions(updated);
    localStorage.setItem('mapPracticeBookmarks', JSON.stringify(updated));
  };

  // Load and draw map image
  useEffect(() => {
    if (!currentQuestion || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsMapLoading(true);

    // Load map image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onerror = () => {
      console.error('Failed to load image:', currentQuestion.mapImage);
      setIsMapLoading(false);
      // Draw placeholder if image fails to load
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Map image failed to load', canvas.width / 2, canvas.height / 2);
    };
    
    img.onload = () => {
      mapImageRef.current = img;
      
      // Get container dimensions for responsive sizing
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth || 800;
      const containerHeight = container.clientHeight || 600;
      
      // Calculate canvas size to fill container while maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      
      let width = containerWidth;
      let height = containerWidth / aspectRatio;
      
      if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * aspectRatio;
      }
      
      // Ensure minimum size
      width = Math.max(width, 400);
      height = Math.max(height, 300);
      
      setCanvasSize({ width, height });
      canvas.width = width;
      canvas.height = height;
      
      // Reset zoom and pan when loading new question
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      
      drawCanvas();
      setIsMapLoading(false);
    };
    
    img.src = currentQuestion.mapImage;
  }, [currentQuestion]);

  // Redraw canvas when markers, zoom, or pan changes
  useEffect(() => {
    drawCanvas();
  }, [userMarkers, userAreaPoints, userPathPoints, userArrows, isDrawingArrow, arrowStart, arrowEnd, isSubmitted, results, zoom, panOffset, canvasSize, areaDrawingComplete, pathTracingComplete]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !mapImageRef.current || !canvas) return;

    // Save context state
    ctx.save();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw map image
    ctx.drawImage(mapImageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw user area (for area drawing questions)
    if (userAreaPoints.length > 0 && currentQuestion?.type === 'area') {
      ctx.beginPath();
      const firstPoint = userAreaPoints[0];
      ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
      
      userAreaPoints.forEach((point, index) => {
        if (index > 0) {
          ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
      });
      
      // Close the path if drawing is complete
      if (areaDrawingComplete && userAreaPoints.length > 2) {
        ctx.closePath();
      }
      
      // Fill the area with semi-transparent color
      if (isSubmitted) {
        // Show different color based on correctness (will be calculated)
        ctx.fillStyle = results?.areaCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      } else {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      }
      
      if (areaDrawingComplete) {
        ctx.fill();
      }
      
      // Draw the outline
      ctx.strokeStyle = isSubmitted 
        ? (results?.areaCorrect ? '#10b981' : '#ef4444')
        : '#3b82f6';
      ctx.lineWidth = 3 / zoom;
      ctx.stroke();
      
      // Draw points
      userAreaPoints.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 6 / zoom, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        
        // Draw point number
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${10 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), x, y);
      });
    }

    // Draw user river path (for river tracing questions)
    if (userPathPoints.length > 0 && currentQuestion?.type === 'river') {
      // Draw the path as a smooth flowing line
      if (userPathPoints.length >= 2) {
        ctx.beginPath();
        const firstPoint = userPathPoints[0];
        ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
        
        // Draw smooth curve through points
        for (let i = 1; i < userPathPoints.length; i++) {
          const point = userPathPoints[i];
          ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
        
        // Style the river path
        const pathColor = isSubmitted 
          ? (results?.pathCorrect ? '#10b981' : '#ef4444')
          : '#3b82f6';
        
        // Draw outer glow effect
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = 8 / zoom;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        
        // Draw main path
        ctx.globalAlpha = 1;
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = 4 / zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Add flowing water effect with gradient
        const gradient = ctx.createLinearGradient(
          firstPoint.x * canvas.width, 
          firstPoint.y * canvas.height,
          userPathPoints[userPathPoints.length - 1].x * canvas.width,
          userPathPoints[userPathPoints.length - 1].y * canvas.height
        );
        gradient.addColorStop(0, pathColor);
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, pathColor);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
      }
      
      // Draw points along the path
      userPathPoints.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        
        // Larger circles for start and end
        const isStartOrEnd = index === 0 || index === userPathPoints.length - 1;
        const radius = isStartOrEnd ? 8 / zoom : 5 / zoom;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        
        if (index === 0) {
          // Start point - green
          ctx.fillStyle = '#22c55e';
        } else if (index === userPathPoints.length - 1 && pathTracingComplete) {
          // End point - red
          ctx.fillStyle = '#ef4444';
        } else {
          // Middle points - blue
          ctx.fillStyle = '#3b82f6';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        
        // Draw number on start/end points
        if (isStartOrEnd) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${10 / zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(index === 0 ? 'S' : 'E', x, y);
        }
      });
    }

    // Draw user arrows (for direction questions)
    if (currentQuestion?.type === 'direction') {
      // Helper function to draw arrow
      const drawArrow = (startX: number, startY: number, angle: number, length: number, color: string, label?: string) => {
        const endX = startX + length * Math.cos(angle * Math.PI / 180);
        const endY = startY + length * Math.sin(angle * Math.PI / 180);
        
        // Draw arrow shaft
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4 / zoom;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw arrowhead
        const headLength = 15 / zoom;
        const headAngle = 25; // degrees
        
        const angle1 = (angle + 180 - headAngle) * Math.PI / 180;
        const angle2 = (angle + 180 + headAngle) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX + headLength * Math.cos(angle1), endY + headLength * Math.sin(angle1));
        ctx.lineTo(endX + headLength * Math.cos(angle2), endY + headLength * Math.sin(angle2));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Draw start circle
        ctx.beginPath();
        ctx.arc(startX, startY, 6 / zoom, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        
        // Draw label if provided
        if (label) {
          ctx.font = `bold ${11 / zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = color;
          ctx.lineWidth = 3 / zoom;
          ctx.strokeText(label, startX, startY - 10 / zoom);
          ctx.fillText(label, startX, startY - 10 / zoom);
        }
      };
      
      // Draw user's arrows
      userArrows.forEach((arrow, index) => {
        const startX = arrow.x * canvas.width;
        const startY = arrow.y * canvas.height;
        const arrowLength = 80 / zoom;
        const arrowColor = isSubmitted 
          ? (results?.arrowResults?.[index]?.correct ? '#10b981' : '#ef4444')
          : '#3b82f6';
        
        drawArrow(startX, startY, arrow.angle, arrowLength, arrowColor, `${index + 1}`);
      });
      
      // Draw arrow being drawn
      if (isDrawingArrow && arrowStart && arrowEnd) {
        const dx = arrowEnd.x - arrowStart.x;
        const dy = arrowEnd.y - arrowStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        
        if (length > 10) {
          drawArrow(arrowStart.x, arrowStart.y, angle, length, '#3b82f6');
        }
      }
    }

    // Draw user markers (red dots - for point marking questions)
    userMarkers.forEach((marker, index) => {
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 8 / zoom, 0, 2 * Math.PI); // Scale marker size inversely with zoom
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();

      // Draw number
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${12 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), marker.x, marker.y);
    });

    // If submitted, show correct answers
    if (isSubmitted && currentQuestion && results) {
      // For area questions, show the correct area overlay
      if (currentQuestion.type === 'area' && currentQuestion.correctArea) {
        ctx.beginPath();
        const firstPoint = currentQuestion.correctArea[0];
        ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
        
        currentQuestion.correctArea.forEach((point, index) => {
          if (index > 0) {
            ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
          }
        });
        ctx.closePath();
        
        // Fill with semi-transparent green
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fill();
        
        // Draw green outline for correct area
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3 / zoom;
        ctx.setLineDash([10 / zoom, 5 / zoom]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw label for the correct area
        if (currentQuestion.areaLabel) {
          // Calculate center of polygon for label placement
          const centerX = currentQuestion.correctArea.reduce((sum, p) => sum + p.x, 0) / currentQuestion.correctArea.length * canvas.width;
          const centerY = currentQuestion.correctArea.reduce((sum, p) => sum + p.y, 0) / currentQuestion.correctArea.length * canvas.height;
          
          ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
          ctx.font = `bold ${14 / zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Background for label
          const labelWidth = ctx.measureText(currentQuestion.areaLabel).width + 20;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(centerX - labelWidth / 2, centerY - 15 / zoom, labelWidth, 30 / zoom);
          
          // Label text
          ctx.fillStyle = '#10b981';
          ctx.fillText(currentQuestion.areaLabel, centerX, centerY);
        }
      }
      
      // For river questions, show the correct path overlay
      if (currentQuestion.type === 'river' && currentQuestion.correctPath && currentQuestion.correctPath.length >= 2) {
        ctx.beginPath();
        const firstPoint = currentQuestion.correctPath[0];
        ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
        
        for (let i = 1; i < currentQuestion.correctPath.length; i++) {
          const point = currentQuestion.correctPath[i];
          ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
        
        // Draw correct path with dashed green line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6 / zoom;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        
        // Dashed overlay
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3 / zoom;
        ctx.setLineDash([10 / zoom, 5 / zoom]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw start and end markers for correct path
        const startPoint = currentQuestion.correctPath[0];
        const endPoint = currentQuestion.correctPath[currentQuestion.correctPath.length - 1];
        
        // Start marker
        ctx.beginPath();
        ctx.arc(startPoint.x * canvas.width, startPoint.y * canvas.height, 10 / zoom, 0, 2 * Math.PI);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${12 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', startPoint.x * canvas.width, startPoint.y * canvas.height);
        
        // End marker
        ctx.beginPath();
        ctx.arc(endPoint.x * canvas.width, endPoint.y * canvas.height, 10 / zoom, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText('E', endPoint.x * canvas.width, endPoint.y * canvas.height);
        
        // Draw label for the correct path
        if (currentQuestion.pathLabel) {
          const midIndex = Math.floor(currentQuestion.correctPath.length / 2);
          const midPoint = currentQuestion.correctPath[midIndex];
          const labelX = midPoint.x * canvas.width;
          const labelY = midPoint.y * canvas.height;
          
          ctx.font = `bold ${14 / zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Background for label
          const labelWidth = ctx.measureText(currentQuestion.pathLabel).width + 20;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(labelX - labelWidth / 2, labelY - 15 / zoom, labelWidth, 30 / zoom);
          
          // Border
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2 / zoom;
          ctx.strokeRect(labelX - labelWidth / 2, labelY - 15 / zoom, labelWidth, 30 / zoom);
          
          // Label text
          ctx.fillStyle = '#10b981';
          ctx.fillText(currentQuestion.pathLabel, labelX, labelY);
        }
      }
      
      // For direction questions, show the correct arrows
      if (currentQuestion.type === 'direction' && currentQuestion.correctDirections) {
        // Helper function already defined above
        const drawArrow = (startX: number, startY: number, angle: number, length: number, color: string, label?: string) => {
          const endX = startX + length * Math.cos(angle * Math.PI / 180);
          const endY = startY + length * Math.sin(angle * Math.PI / 180);
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 5 / zoom;
          ctx.setLineDash([10 / zoom, 5 / zoom]);
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Arrowhead
          const headLength = 18 / zoom;
          const headAngle = 25;
          const angle1 = (angle + 180 - headAngle) * Math.PI / 180;
          const angle2 = (angle + 180 + headAngle) * Math.PI / 180;
          
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX + headLength * Math.cos(angle1), endY + headLength * Math.sin(angle1));
          ctx.lineTo(endX + headLength * Math.cos(angle2), endY + headLength * Math.sin(angle2));
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          
          // Start circle
          ctx.beginPath();
          ctx.arc(startX, startY, 8 / zoom, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 / zoom;
          ctx.stroke();
          
          // Label
          if (label) {
            ctx.font = `bold ${12 / zoom}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            const labelWidth = ctx.measureText(label).width + 10;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(startX - labelWidth / 2, startY + 12 / zoom, labelWidth, 20 / zoom);
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 / zoom;
            ctx.strokeRect(startX - labelWidth / 2, startY + 12 / zoom, labelWidth, 20 / zoom);
            
            ctx.fillStyle = color;
            ctx.fillText(label, startX, startY + 15 / zoom);
          }
        };
        
        // Draw correct arrows with green dashed lines
        currentQuestion.correctDirections.forEach((dir, index) => {
          const startX = dir.x * canvas.width;
          const startY = dir.y * canvas.height;
          const arrowLength = 100 / zoom;
          
          drawArrow(startX, startY, dir.angle, arrowLength, '#10b981', dir.label);
        });
      }
      
      // For point marking questions, show correct points
      currentQuestion.correctAnswers.forEach((answer, index) => {
        const x = answer.x * canvas.width;
        const y = answer.y * canvas.height;

        // Draw correct answer markers (green)
        ctx.beginPath();
        ctx.arc(x, y, 10 / zoom, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        // Draw checkmark
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.moveTo(x - 3 / zoom, y);
        ctx.lineTo(x - 1 / zoom, y + 3 / zoom);
        ctx.lineTo(x + 4 / zoom, y - 3 / zoom);
        ctx.stroke();

        // Draw label
        const labelWidth = answer.label.length * 6 + 10;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 15 / zoom, y - 12 / zoom, labelWidth / zoom, 24 / zoom);
        ctx.fillStyle = '#10b981';
        ctx.font = `bold ${11 / zoom}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(answer.label, x + 20 / zoom, y + 2 / zoom);
      });

      // Draw lines connecting user markers to nearest correct answers if wrong (point questions only)
      results.details.forEach((detail: any) => {
        if (!detail.correct && detail.userMarker && detail.nearestCorrect) {
          const userX = detail.userMarker.x;
          const userY = detail.userMarker.y;
          const correctX = detail.nearestCorrect.x * canvas.width;
          const correctY = detail.nearestCorrect.y * canvas.height;

          ctx.beginPath();
          ctx.moveTo(userX, userY);
          ctx.lineTo(correctX, correctY);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([5 / zoom, 5 / zoom]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw X mark on wrong marker
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 / zoom;
          ctx.beginPath();
          ctx.moveTo(userX - 4 / zoom, userY - 4 / zoom);
          ctx.lineTo(userX + 4 / zoom, userY + 4 / zoom);
          ctx.moveTo(userX + 4 / zoom, userY - 4 / zoom);
          ctx.lineTo(userX - 4 / zoom, userY + 4 / zoom);
          ctx.stroke();
        }
      });
    }

    // Restore context state
    ctx.restore();
  };

  const screenToCanvasCoords = (screenX: number, screenY: number) => {
    // Convert screen coordinates to canvas coordinates accounting for zoom and pan
    const x = (screenX - panOffset.x) / zoom;
    const y = (screenY - panOffset.y) / zoom;
    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSubmitted || isDragging) return; // Don't allow marking after submission or while dragging

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Convert to canvas coordinates
    const { x, y } = screenToCanvasCoords(screenX, screenY);

    // Check if click is within canvas bounds
    if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) return;

    // Get current question
    const currentQuestions = selectedMode === 'random' ? randomTestQuestions : (sampleQuestions[selectedChapter || ''] || []);
    const currentQuestion = currentQuestions[currentQuestionIndex];

    // For combo questions, use the selected drawing mode
    if (currentQuestion?.type === 'combo') {
      if (drawingMode === 'area' && !areaDrawingComplete) {
        const normalizedPoint = {
          x: x / canvas.width,
          y: y / canvas.height,
        };
        setUserAreaPoints([...userAreaPoints, normalizedPoint]);
        setIsDrawingArea(true);
      } else if (drawingMode === 'river' && !pathTracingComplete) {
        const normalizedPoint = {
          x: x / canvas.width,
          y: y / canvas.height,
        };
        setUserPathPoints([...userPathPoints, normalizedPoint]);
        setIsTracingPath(true);
      } else if (drawingMode === 'point') {
        const newMarker: Coordinate = {
          x,
          y,
          id: `marker-${Date.now()}`,
        };
        setUserMarkers([...userMarkers, newMarker]);
      }
      // direction mode is handled in mouseDown/mouseUp
      return;
    }

    // Check if this is an area drawing question
    if (currentQuestion?.type === 'area' && !areaDrawingComplete) {
      // Add point to area
      const normalizedPoint = {
        x: x / canvas.width,
        y: y / canvas.height,
      };
      setUserAreaPoints([...userAreaPoints, normalizedPoint]);
      setIsDrawingArea(true);
    } else if (currentQuestion?.type === 'river' && !pathTracingComplete) {
      // Add point to river path
      const normalizedPoint = {
        x: x / canvas.width,
        y: y / canvas.height,
      };
      setUserPathPoints([...userPathPoints, normalizedPoint]);
      setIsTracingPath(true);
    } else {
      // Regular point marking
      const newMarker: Coordinate = {
        x,
        y,
        id: `marker-${Date.now()}`,
      };
      setUserMarkers([...userMarkers, newMarker]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Get current question
    const currentQuestions = selectedMode === 'random' ? randomTestQuestions : (sampleQuestions[selectedChapter || ''] || []);
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    // For direction questions OR combo with direction mode, start drawing arrow
    const shouldDrawArrow = (currentQuestion?.type === 'direction' || 
                            (currentQuestion?.type === 'combo' && drawingMode === 'direction')) &&
                            !isSubmitted && zoom <= 1;
    
    if (shouldDrawArrow) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = screenToCanvasCoords(screenX, screenY);
      
      if (x >= 0 && y >= 0 && x <= canvas.width && y <= canvas.height) {
        setIsDrawingArrow(true);
        setArrowStart({ x, y });
        setArrowEnd({ x, y });
      }
      return;
    }
    
    // Regular pan behavior when zoomed
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If drawing arrow, update arrow end point
    if (isDrawingArrow && arrowStart) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = screenToCanvasCoords(screenX, screenY);
      
      setArrowEnd({ x, y });
      return;
    }
    
    // Regular pan behavior
    if (isDragging && zoom > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    // If drawing arrow, finalize it
    if (isDrawingArrow && arrowStart && arrowEnd) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Calculate angle
      const dx = arrowEnd.x - arrowStart.x;
      const dy = arrowEnd.y - arrowStart.y;
      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360; // Convert to 0-360 degrees
      
      // Only add arrow if it has meaningful length
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 20) { // Minimum 20 pixels
        const newArrow = {
          x: arrowStart.x / canvas.width,
          y: arrowStart.y / canvas.height,
          angle,
          id: `arrow-${Date.now()}`,
        };
        setUserArrows([...userArrows, newArrow]);
      }
      
      setIsDrawingArrow(false);
      setArrowStart(null);
      setArrowEnd(null);
      return;
    }
    
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(zoom + delta, 1), 5);
    setZoom(newZoom);

    // Reset pan if zoom is back to 1
    if (newZoom === 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 5));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.25, 1);
    setZoom(newZoom);
    
    // Reset pan if zoom is back to 1
    if (newZoom === 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleRemoveLastMarker = () => {
    if (userMarkers.length > 0) {
      setUserMarkers(userMarkers.slice(0, -1));
    }
  };

  const handleDeleteMarker = (markerId: string) => {
    setUserMarkers(userMarkers.filter(m => m.id !== markerId));
  };

  const handleUpdateLabel = (markerId: string, label: string) => {
    setUserMarkers(userMarkers.map(m => 
      m.id === markerId ? { ...m, label } : m
    ));
  };

  const handleReset = () => {
    setUserMarkers([]);
    setUserAreaPoints([]);
    setIsDrawingArea(false);
    setAreaDrawingComplete(false);
    setUserPathPoints([]);
    setIsTracingPath(false);
    setPathTracingComplete(false);
    setUserArrows([]);
    setIsDrawingArrow(false);
    setArrowStart(null);
    setArrowEnd(null);
    setIsSubmitted(false);
    setResults(null);
    setShowHint(false);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setEditingMarkerId(null);
    setEditingLabel('');
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;
    
    // Check if it's an area question
    if (currentQuestion.type === 'area') {
      if (userAreaPoints.length < 3) return; // Need at least 3 points for an area
      
      // Evaluate area drawing
      const areaCorrect = evaluateAreaDrawing();
      const score = areaCorrect ? currentQuestion.totalMarks : 0;
      const percentage = areaCorrect ? 100 : 0;
      
      const timeSpent = isTimedMode && questionStartTime > 0 
        ? Math.floor((Date.now() - questionStartTime) / 1000)
        : null;
      
      setResults({
        correctCount: areaCorrect ? 1 : 0,
        totalPossible: 1,
        score,
        totalMarks: currentQuestion.totalMarks,
        percentage,
        areaCorrect,
        details: [],
        timeSpent,
      });
      setIsSubmitted(true);
      return;
    }
    
    // Check if it's a river path question
    if (currentQuestion.type === 'river') {
      const minPoints = currentQuestion.minPathPoints || 5;
      if (userPathPoints.length < minPoints) return; // Need minimum points for a path
      
      // Evaluate path tracing
      const pathEvaluation = evaluatePathTracing();
      const score = pathEvaluation.score;
      const percentage = pathEvaluation.percentage;
      
      const timeSpent = isTimedMode && questionStartTime > 0 
        ? Math.floor((Date.now() - questionStartTime) / 1000)
        : null;
      
      setResults({
        correctCount: pathEvaluation.pathCorrect ? 1 : 0,
        totalPossible: 1,
        score,
        totalMarks: currentQuestion.totalMarks,
        percentage,
        pathCorrect: pathEvaluation.pathCorrect,
        pathAccuracy: pathEvaluation.accuracy,
        pathCoverage: pathEvaluation.coverage,
        details: [],
        timeSpent,
      });
      setIsSubmitted(true);
      return;
    }
    
    // Check if it's a combo question (multiple tasks)
    if (currentQuestion.type === 'combo') {
      // Evaluate all components
      const comboEvaluation = evaluateComboQuestion();
      
      const timeSpent = isTimedMode && questionStartTime > 0 
        ? Math.floor((Date.now() - questionStartTime) / 1000)
        : null;
      
      setResults({
        correctCount: comboEvaluation.tasksCompleted,
        totalPossible: comboEvaluation.totalTasks,
        score: comboEvaluation.totalScore,
        totalMarks: currentQuestion.totalMarks,
        percentage: comboEvaluation.percentage,
        comboResults: comboEvaluation.taskResults,
        details: comboEvaluation.pointDetails || [],
        timeSpent,
      });
      setIsSubmitted(true);
      return;
    }
    
    // Check if it's a direction/arrow question
    if (currentQuestion.type === 'direction') {
      const minDirections = currentQuestion.minDirections || 1;
      if (userArrows.length < minDirections) return; // Need minimum arrows
      
      // Evaluate arrows
      const arrowEvaluation = evaluateArrows();
      const score = arrowEvaluation.score;
      const percentage = arrowEvaluation.percentage;
      
      const timeSpent = isTimedMode && questionStartTime > 0 
        ? Math.floor((Date.now() - questionStartTime) / 1000)
        : null;
      
      setResults({
        correctCount: arrowEvaluation.correctCount,
        totalPossible: arrowEvaluation.totalPossible,
        score,
        totalMarks: currentQuestion.totalMarks,
        percentage,
        arrowResults: arrowEvaluation.arrowResults,
        details: [],
        timeSpent,
      });
      setIsSubmitted(true);
      return;
    }
    
    // Regular point marking question
    if (userMarkers.length === 0) return;

    // Convert user markers to relative coordinates (0-1 range)
    const canvas = canvasRef.current;
    if (!canvas) return;

    const relativeMarkers = userMarkers.map(marker => ({
      x: marker.x / canvas.width,
      y: marker.y / canvas.height,
    }));

    // Check each user marker against correct answers
    const details = relativeMarkers.map((userMarker, index) => {
      let correct = false;
      let nearestCorrect = null;
      let minDistance = Infinity;

      currentQuestion.correctAnswers.forEach(correctAnswer => {
        const distance = Math.sqrt(
          Math.pow(userMarker.x - correctAnswer.x, 2) +
          Math.pow(userMarker.y - correctAnswer.y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestCorrect = correctAnswer;
        }

        if (distance <= correctAnswer.tolerance) {
          correct = true;
        }
      });

      return {
        correct,
        userMarker: userMarkers[index],
        nearestCorrect,
        distance: minDistance,
      };
    });

    const correctCount = details.filter(d => d.correct).length;
    const totalPossible = currentQuestion.correctAnswers.length;
    const score = (correctCount / totalPossible) * currentQuestion.totalMarks;
    const percentage = (correctCount / totalPossible) * 100;

    // NEW: Calculate time spent
    const timeSpent = isTimedMode && questionStartTime > 0 
      ? Math.floor((Date.now() - questionStartTime) / 1000)
      : null;

    setResults({
      correctCount,
      totalPossible,
      score,
      totalMarks: currentQuestion.totalMarks,
      percentage,
      details,
      timeSpent, // NEW: Add time spent to results
    });
    setIsSubmitted(true);
  };
  
  // Function to evaluate area drawing
  const evaluateAreaDrawing = () => {
    if (!currentQuestion?.correctArea || userAreaPoints.length < 3) return false;
    
    // Simple evaluation: Check if user's area overlaps significantly with correct area
    // This is a simplified approach - checking if most user points are close to correct polygon
    const tolerance = currentQuestion.areaTolerance || 0.08;
    
    // Check if user drew approximately the right number of points
    const pointCountDiff = Math.abs(userAreaPoints.length - currentQuestion.correctArea.length);
    if (pointCountDiff > 3) return false; // Too many or too few points
    
    // Check if user points are generally in the correct area
    let matchingPoints = 0;
    userAreaPoints.forEach(userPoint => {
      const nearCorrectPoint = currentQuestion.correctArea?.some(correctPoint => {
        const distance = Math.sqrt(
          Math.pow(userPoint.x - correctPoint.x, 2) +
          Math.pow(userPoint.y - correctPoint.y, 2)
        );
        return distance <= tolerance;
      });
      if (nearCorrectPoint) matchingPoints++;
    });
    
    // Consider correct if at least 60% of points match
    const matchPercentage = matchingPoints / userAreaPoints.length;
    return matchPercentage >= 0.6;
  };
  
  // Function to evaluate river path tracing
  const evaluatePathTracing = () => {
    if (!currentQuestion?.correctPath || userPathPoints.length < 2) {
      return { pathCorrect: false, accuracy: 0, coverage: 0, score: 0, percentage: 0 };
    }
    
    const tolerance = currentQuestion.pathTolerance || 0.06;
    
    // 1. Check path coverage - how well user traced the entire river
    let coverageScore = 0;
    currentQuestion.correctPath.forEach(correctPoint => {
      const nearUserPoint = userPathPoints.some(userPoint => {
        const distance = Math.sqrt(
          Math.pow(userPoint.x - correctPoint.x, 2) +
          Math.pow(userPoint.y - correctPoint.y, 2)
        );
        return distance <= tolerance;
      });
      if (nearUserPoint) coverageScore++;
    });
    const coverage = coverageScore / currentQuestion.correctPath.length;
    
    // 2. Check path accuracy - how many user points are on the correct path
    let accuracyScore = 0;
    userPathPoints.forEach(userPoint => {
      const nearCorrectPoint = currentQuestion.correctPath?.some(correctPoint => {
        const distance = Math.sqrt(
          Math.pow(userPoint.x - correctPoint.x, 2) +
          Math.pow(userPoint.y - correctPoint.y, 2)
        );
        return distance <= tolerance;
      });
      if (nearCorrectPoint) accuracyScore++;
    });
    const accuracy = accuracyScore / userPathPoints.length;
    
    // 3. Calculate overall score (average of coverage and accuracy)
    const overallScore = (coverage + accuracy) / 2;
    
    // 4. Determine if path is correct (need at least 70% overall)
    const pathCorrect = overallScore >= 0.7;
    
    // 5. Calculate marks
    const score = overallScore * currentQuestion.totalMarks;
    const percentage = overallScore * 100;
    
    return {
      pathCorrect,
      accuracy: accuracy * 100,
      coverage: coverage * 100,
      score,
      percentage
    };
  };
  
  // Function to evaluate directional arrows
  const evaluateArrows = () => {
    if (!currentQuestion?.correctDirections || userArrows.length === 0) {
      return { correctCount: 0, totalPossible: 0, score: 0, percentage: 0, arrowResults: [] };
    }
    
    const arrowResults: Array<{ correct: boolean; positionMatch: boolean; angleMatch: boolean; nearestCorrect?: any }> = [];
    let correctCount = 0;
    
    // Check each user arrow
    userArrows.forEach(userArrow => {
      let bestMatch: any = null;
      let bestMatchScore = 0;
      let positionMatch = false;
      let angleMatch = false;
      
      currentQuestion.correctDirections?.forEach(correctDir => {
        // Check position
        const posDistance = Math.sqrt(
          Math.pow(userArrow.x - correctDir.x, 2) +
          Math.pow(userArrow.y - correctDir.y, 2)
        );
        const positionTolerance = correctDir.positionTolerance || 0.10;
        const isPosCorrect = posDistance <= positionTolerance;
        
        // Check angle - normalize to 0-360 range
        const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
        const userAngleNorm = normalizeAngle(userArrow.angle);
        const correctAngleNorm = normalizeAngle(correctDir.angle);
        
        // Calculate angle difference (shortest path)
        let angleDiff = Math.abs(userAngleNorm - correctAngleNorm);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        const angleTolerance = correctDir.angleTolerance || 30;
        const isAngleCorrect = angleDiff <= angleTolerance;
        
        // Calculate match score (both position and angle must match)
        const matchScore = (isPosCorrect ? 0.5 : 0) + (isAngleCorrect ? 0.5 : 0);
        
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          bestMatch = correctDir;
          positionMatch = isPosCorrect;
          angleMatch = isAngleCorrect;
        }
      });
      
      // Arrow is correct if BOTH position and angle match
      const isCorrect = positionMatch && angleMatch;
      if (isCorrect) correctCount++;
      
      arrowResults.push({
        correct: isCorrect,
        positionMatch,
        angleMatch,
        nearestCorrect: bestMatch
      });
    });
    
    const totalPossible = currentQuestion.correctDirections.length;
    const percentage = totalPossible > 0 ? (correctCount / totalPossible) * 100 : 0;
    const score = totalPossible > 0 ? (correctCount / totalPossible) * currentQuestion.totalMarks : 0;
    
    return {
      correctCount,
      totalPossible,
      score,
      percentage,
      arrowResults
    };
  };
  
  // Function to evaluate combo questions (multiple tasks)
  const evaluateComboQuestion = () => {
    if (!currentQuestion?.comboTasks) {
      return { tasksCompleted: 0, totalTasks: 0, totalScore: 0, percentage: 0, taskResults: [] };
    }
    
    const taskResults: Array<{
      type: string;
      instruction: string;
      completed: boolean;
      score: number;
      maxMarks: number;
      details?: any;
    }> = [];
    
    let totalScore = 0;
    let tasksCompleted = 0;
    let pointDetails: any[] = [];
    
    currentQuestion.comboTasks.forEach(task => {
      let taskScore = 0;
      let taskCompleted = false;
      let taskDetails = null;
      
      if (task.type === 'point') {
        // Evaluate point markers
        if (currentQuestion.correctAnswers && userMarkers.length > 0) {
          const canvas = canvasRef.current;
          if (canvas) {
            const relativeMarkers = userMarkers.map(m => ({
              x: m.x / canvas.width,
              y: m.y / canvas.height
            }));
            
            let correctMarkers = 0;
            const details: any[] = [];
            
            relativeMarkers.forEach(userMarker => {
              let isCorrect = false;
              currentQuestion.correctAnswers.forEach(correctAnswer => {
                const distance = Math.sqrt(
                  Math.pow(userMarker.x - correctAnswer.x, 2) +
                  Math.pow(userMarker.y - correctAnswer.y, 2)
                );
                if (distance <= correctAnswer.tolerance) {
                  isCorrect = true;
                }
              });
              if (isCorrect) correctMarkers++;
              details.push({ correct: isCorrect });
            });
            
            taskCompleted = correctMarkers >= currentQuestion.correctAnswers.length * 0.7;
            taskScore = (correctMarkers / currentQuestion.correctAnswers.length) * task.marks;
            taskDetails = { correctMarkers, totalMarkers: currentQuestion.correctAnswers.length };
            pointDetails = details;
          }
        }
      } else if (task.type === 'river') {
        // Evaluate river path
        if (currentQuestion.correctPath && userPathPoints.length > 0) {
          const pathEval = evaluatePathTracing();
          taskCompleted = pathEval.pathCorrect;
          taskScore = (pathEval.percentage / 100) * task.marks;
          taskDetails = { coverage: pathEval.coverage, accuracy: pathEval.accuracy };
        }
      } else if (task.type === 'area') {
        // Evaluate area
        if (currentQuestion.correctArea && userAreaPoints.length >= 3) {
          const areaCorrect = evaluateAreaDrawing();
          taskCompleted = areaCorrect;
          taskScore = areaCorrect ? task.marks : 0;
          taskDetails = { areaMatch: areaCorrect };
        }
      } else if (task.type === 'direction') {
        // Evaluate arrows
        if (currentQuestion.correctDirections && userArrows.length > 0) {
          const arrowEval = evaluateArrows();
          taskCompleted = arrowEval.correctCount >= currentQuestion.correctDirections.length * 0.7;
          taskScore = (arrowEval.percentage / 100) * task.marks;
          taskDetails = { correctArrows: arrowEval.correctCount, totalArrows: arrowEval.totalPossible };
        }
      }
      
      if (taskCompleted) tasksCompleted++;
      totalScore += taskScore;
      
      taskResults.push({
        type: task.type,
        instruction: task.instruction,
        completed: taskCompleted,
        score: taskScore,
        maxMarks: task.marks,
        details: taskDetails
      });
    });
    
    const percentage = currentQuestion.totalMarks > 0 ? (totalScore / currentQuestion.totalMarks) * 100 : 0;
    
    return {
      tasksCompleted,
      totalTasks: currentQuestion.comboTasks.length,
      totalScore,
      percentage,
      taskResults,
      pointDetails
    };
  };

  const handleNextQuestion = () => {
    // NEW: Save performance record before moving to next question
    if (results && isSubmitted) {
      const chapterName = selectedMode === 'random'
        ? 'Random Test'
        : [...geographyChapters, ...biologyChapters, ...botanyChapters].find(c => c.id === selectedChapter)?.name || 'Unknown';
      
      // NEW: Track wrong answers for revision mode
      const wrongDetails = results.details.filter((d: any) => !d.correct);
      if (wrongDetails.length > 0) {
        const wrongAnswer: WrongAnswer = {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          subject: selectedSubject || 'unknown',
          chapterName,
          date: Date.now(),
          userAnswers: userMarkers,
          correctAnswers: currentQuestion.correctAnswers,
          mapImage: currentQuestion.mapImage,
          bookmarked: false,
        };
        saveWrongAnswer(wrongAnswer);
      }
      
      const performanceRecord: PerformanceRecord = {
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: Date.now(),
        subject: selectedSubject || 'unknown',
        mode: selectedMode || 'chapter',
        chapterName,
        questionsAttempted: 1,
        correctAnswers: results.correctCount,
        totalMarks: results.totalMarks,
        score: results.score,
        accuracy: results.percentage,
        timeSpent: results.timeSpent || 0,
        timedMode: isTimedMode,
      };
      
      savePerformanceRecord(performanceRecord);
    }
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      handleReset();
      
      // Reset timer for next question
      if (isTimedMode) {
        setTimeRemaining(180);
        setQuestionStartTime(Date.now());
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      handleReset();
      
      // Reset timer for previous question
      if (isTimedMode) {
        setTimeRemaining(180);
        setQuestionStartTime(Date.now());
      }
    }
  };

  // NEW: Timer Countdown Effect
  useEffect(() => {
    if (!isTimedMode || isSubmitted || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedMode, isSubmitted, currentQuestion]);

  // NEW: Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Subject Selection Screen
  if (!selectedSubject) {
    return (
      <>
        {/* NEW: Achievement Unlock Notifications */}
        {newAchievements.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-3">
            {newAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`bg-gradient-to-r ${
                  achievement.rarity === 'legendary'
                    ? 'from-yellow-500 to-orange-500'
                    : achievement.rarity === 'epic'
                    ? 'from-purple-500 to-pink-500'
                    : achievement.rarity === 'rare'
                    ? 'from-blue-500 to-cyan-500'
                    : 'from-gray-500 to-slate-500'
                } text-white rounded-lg shadow-2xl p-4 animate-bounce max-w-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="text-xs text-white/80 mb-1">Achievement Unlocked!</div>
                    <div className="text-sm mb-1">{achievement.name}</div>
                    <div className="text-xs text-white/90">{achievement.description}</div>
                  </div>
                  <button
                    onClick={() => setNewAchievements(newAchievements.filter(a => a.id !== achievement.id))}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="min-h-screen bg-gray-50 p-6">
          <div className=" mx-auto">
            {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8" />
                <h1 className="text-3xl">Map Practice</h1>
              </div>
              {/* NEW: View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={() => setViewMode('practice')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    viewMode === 'practice'
                      ? 'bg-white text-green-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Practice</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    viewMode === 'analytics'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                </button>
              </div>
            </div>
            <p className="text-sm text-white/90">
              {viewMode === 'practice' 
                ? 'Practice pinpointing locations on maps for Geography, Biology, Botany and more!'
                : 'Track your progress and analyze your performance across all subjects'
              }
            </p>
          </div>

          {/* Conditional Content: Practice or Analytics */}
          {viewMode === 'practice' ? (
            <>
              {/* Subject Selection */}
              <div>
                <h2 className="text-lg text-gray-900 mb-4">Choose a Subject</h2>
                <div className="grid grid-cols-3 gap-6">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className="bg-white rounded-lg p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg cursor-pointer transition-all text-left"
                    >
                      <div className="text-4xl mb-4">{subject.icon}</div>
                      <h3 className="text-lg text-gray-900 mb-2">{subject.name}</h3>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Section */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm text-blue-900 mb-2">How Map Practice Works</h3>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Select a subject and chapter to start practicing</li>
                      <li>• Use zoom controls to get closer to specific regions</li>
                      <li>• Click on the map to mark locations as answers</li>
                      <li>• Drag to pan when zoomed in for better accuracy</li>
                      <li>• Your clicks are recorded as coordinates (X, Y positions)</li>
                      <li>• Submit your answers to see if you marked correctly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ANALYTICS DASHBOARD */
            <AnalyticsDashboard 
              performanceHistory={performanceHistory}
              userProgress={userProgress}
            />
          )}
        </div>
      </div>
      </>
    );
  }

  // Mode Selection Screen (NEW!)
  if (!selectedMode) {
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || '';
    const subjectIcon = subjects.find(s => s.id === selectedSubject)?.icon || '';
    
    // Get all chapters for the selected subject
    let chapters = geographyChapters;
    if (selectedSubject === 'biology') {
      chapters = biologyChapters;
    } else if (selectedSubject === 'botany') {
      chapters = botanyChapters;
    }
    
    // Calculate total questions available
    const totalQuestions = chapters.reduce((sum, chapter) => {
      const chapterQuestions = sampleQuestions[chapter.id] || [];
      return sum + chapterQuestions.length;
    }, 0);
    
    const handleStartRandomTest = () => {
      // Collect all questions from all chapters in this subject
      const allQuestions: Question[] = [];
      chapters.forEach(chapter => {
        const chapterQuestions = sampleQuestions[chapter.id] || [];
        allQuestions.push(...chapterQuestions);
      });
      
      // Shuffle questions randomly
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      
      // Take random subset (e.g., 5 questions or all if less than 5)
      const testSize = Math.min(5, shuffled.length);
      const randomTest = shuffled.slice(0, testSize);
      
      setRandomTestQuestions(randomTest);
      setSelectedMode('random');
      setCurrentQuestionIndex(0);
      
      // Initialize timer if timed mode is enabled
      if (isTimedMode) {
        setQuestionStartTime(Date.now());
        setTestStartTime(Date.now());
        setTimeRemaining(180); // 3 minutes per question
      }
    };
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white rounded-lg p-6 mb-8">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setSelectedMode(null);
              }}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Subjects
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{subjectIcon}</span>
              <h1 className="text-2xl">{subjectName}</h1>
            </div>
            <p className="text-sm text-white/90">
              Choose how you want to practice
            </p>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-6">
            {/* Practice by Chapter */}
            <button
              onClick={() => setSelectedMode('chapter')}
              className="bg-white rounded-lg p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-all">
                <BookOpen className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Practice by Chapter</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose specific chapters and practice targeted questions. Perfect for focused learning.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{chapters.length} Chapters</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>Focused Practice</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 group-hover:gap-3 transition-all">
                <span>Select Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Random Test */}
            <button
              onClick={handleStartRandomTest}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-all">
                <Zap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Random Test Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get a randomized set of questions from all chapters. Great for comprehensive assessment!
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{totalQuestions} Questions Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Mixed Topics</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600 group-hover:gap-3 transition-all">
                <span>Start Random Test</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* NEW: Smart Practice Mode */}
            <button
              onClick={() => {
                // Calculate weak areas from performance
                const chapterPerformance = performanceHistory.reduce((acc, record) => {
                  if (record.subject === selectedSubject && record.chapterName) {
                    if (!acc[record.chapterName]) {
                      acc[record.chapterName] = { correct: 0, total: 0 };
                    }
                    acc[record.chapterName].correct += record.correctAnswers;
                    acc[record.chapterName].total += record.questionsAttempted;
                  }
                  return acc;
                }, {} as Record<string, { correct: number; total: number }>);

                const chapterStats = Object.entries(chapterPerformance).map(([name, stats]) => ({
                  name,
                  accuracy: (stats.correct / stats.total) * 100,
                })).sort((a, b) => a.accuracy - b.accuracy);

                // Get weak chapters (below 70% accuracy)
                const weakChapters = chapterStats.filter(c => c.accuracy < 70);
                
                if (weakChapters.length === 0) {
                  // No performance data yet, start random test
                  handleStartRandomTest();
                } else {
                  // Create a test from weak areas
                  const weakChapterIds = weakChapters.map(wc => {
                    const chapter = chapters.find(c => c.name === wc.name);
                    return chapter?.id;
                  }).filter(Boolean);

                  const weakQuestions: Question[] = [];
                  weakChapterIds.forEach(chapterId => {
                    const chapterQuestions = sampleQuestions[chapterId as string] || [];
                    weakQuestions.push(...chapterQuestions);
                  });

                  if (weakQuestions.length > 0) {
                    const shuffled = weakQuestions.sort(() => Math.random() - 0.5);
                    const testSize = Math.min(5, shuffled.length);
                    const smartTest = shuffled.slice(0, testSize);

                    setRandomTestQuestions(smartTest);
                    setSelectedMode('smart' as any);
                    setCurrentQuestionIndex(0);

                    if (isTimedMode) {
                      setQuestionStartTime(Date.now());
                      setTestStartTime(Date.now());
                      setTimeRemaining(180);
                    }
                  } else {
                    handleStartRandomTest();
                  }
                }
              }}
              disabled={performanceHistory.length === 0}
              className={`bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 border-2 border-blue-200 transition-all text-left group ${
                performanceHistory.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-blue-400 hover:shadow-lg cursor-pointer'
              }`}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-all">
                <Brain className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2 flex items-center gap-2">
                Smart Practice
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">AI</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {performanceHistory.length === 0
                  ? 'Complete some tests first to unlock AI-powered recommendations'
                  : 'AI-recommended questions from your weak areas. Adaptive learning at its best!'}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Adaptive</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm group-hover:gap-3 transition-all ${
                performanceHistory.length === 0 ? 'text-gray-400' : 'text-blue-600'
              }`}>
                <span>{performanceHistory.length === 0 ? 'Locked' : 'Start Smart Practice'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* NEW: Revision Mode */}
            <button
              onClick={() => {
                if (wrongAnswers.length > 0) {
                  // Create test from wrong answers
                  const revisionQuestions: Question[] = wrongAnswers.map(wa => ({
                    id: wa.questionId,
                    question: wa.question,
                    mapImage: wa.mapImage,
                    correctAnswers: wa.correctAnswers,
                    totalMarks: wa.correctAnswers.length,
                    difficulty: 'Medium' as const,
                    hint: 'Review your previous attempt and try again!',
                  }));

                  const shuffled = revisionQuestions.sort(() => Math.random() - 0.5);
                  const testSize = Math.min(5, shuffled.length);
                  const revisionTest = shuffled.slice(0, testSize);

                  setRandomTestQuestions(revisionTest);
                  setSelectedMode('revision' as any);
                  setCurrentQuestionIndex(0);

                  if (isTimedMode) {
                    setQuestionStartTime(Date.now());
                    setTestStartTime(Date.now());
                    setTimeRemaining(180);
                  }
                }
              }}
              disabled={wrongAnswers.length === 0}
              className={`bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8 border-2 border-orange-200 transition-all text-left group ${
                wrongAnswers.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-orange-400 hover:shadow-lg cursor-pointer'
              }`}
            >
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-all">
                <RotateCcw className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Revision Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                {wrongAnswers.length === 0
                  ? 'No mistakes yet! Make some attempts to build your revision list'
                  : `Review and retry your ${wrongAnswers.length} incorrect answers. Learn from mistakes!`}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  <span>{wrongAnswers.length} to Review</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>Master Mistakes</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm group-hover:gap-3 transition-all ${
                wrongAnswers.length === 0 ? 'text-gray-400' : 'text-orange-600'
              }`}>
                <span>{wrongAnswers.length === 0 ? 'No Mistakes Yet' : 'Start Revision'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm text-blue-900 mb-3">Mode Comparison</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-blue-900 mb-1">📚 Practice by Chapter:</p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Select specific topics</li>
                      <li>• Deep dive into one area</li>
                      <li>• Master concepts step-by-step</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-blue-900 mb-1">⚡ Random Test:</p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Mixed question set</li>
                      <li>• Test overall knowledge</li>
                      <li>• Simulates real exams</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-blue-900 mb-1">🧠 Smart Practice:</p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• AI-recommended questions</li>
                      <li>• Focus on weak areas</li>
                      <li>• Adaptive difficulty</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-blue-900 mb-1">🔄 Revision Mode:</p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Review incorrect answers</li>
                      <li>• Learn from mistakes</li>
                      <li>• Build confidence</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEW: Timer Configuration */}
          <div className="mt-6 bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Timer className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-900 mb-1">Timed Test Mode</h3>
                  <p className="text-xs text-gray-600">
                    Challenge yourself with 3 minutes per question
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTimedMode(!isTimedMode)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  isTimedMode ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isTimedMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {isTimedMode && (
              <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-orange-800">
                    <p className="mb-2"><strong>Timed Mode Enabled:</strong></p>
                    <ul className="space-y-1">
                      <li>• You'll have <strong>3 minutes</strong> per question</li>
                      <li>• Timer counts down automatically</li>
                      <li>• Question auto-submits when time expires</li>
                      <li>• Time statistics will be tracked</li>
                      <li>• Warning appears when &lt;30 seconds remain</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Chapter Selection Screen
  if (!selectedChapter && selectedMode === 'chapter') {
    // Get chapters based on selected subject
    let chapters = geographyChapters;
    let subjectName = 'Geography';
    
    if (selectedSubject === 'biology') {
      chapters = biologyChapters;
      subjectName = 'Biology';
    } else if (selectedSubject === 'botany') {
      chapters = botanyChapters;
      subjectName = 'Botany';
    }
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className=" mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white rounded-lg p-8 mb-8">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setSelectedMode(null);
              }}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Subjects
            </button>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-3xl">{subjectName} - Select Chapter</h1>
            </div>
            <p className="text-sm text-white/90">
              Choose a chapter to practice map-based questions
            </p>
          </div>

          {/* Chapter Selection */}
          <div>
            <h2 className="text-lg text-gray-900 mb-4">Available Chapters</h2>
            <div className="grid grid-cols-2 gap-6">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    setSelectedChapter(chapter.id);
                    // Initialize timer if timed mode is enabled
                    if (isTimedMode) {
                      setQuestionStartTime(Date.now());
                      setTestStartTime(Date.now());
                      setTimeRemaining(180);
                    }
                  }}
                  className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left"
                >
                  <h3 className="text-sm text-gray-900 mb-3">{chapter.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{chapter.topics} Topics</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{chapter.questions} Questions</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
                    <span>Start Practicing</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice Screen
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto" style={{ maxWidth: '100vw' }}>
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedChapter(null);
                  setCurrentQuestionIndex(0);
                  handleReset();
                }}
                className="flex items-center gap-2 text-white/90 hover:text-white text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="border-l border-white/30 pl-4">
                <h1 className="text-lg">
                  {selectedMode === 'random' 
                    ? 'Random Test Mode' 
                    : [...geographyChapters, ...biologyChapters, ...botanyChapters].find(c => c.id === selectedChapter)?.name
                  }
                </h1>
                <p className="text-xs text-white/80">
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* NEW: Timer Display */}
              {isTimedMode && !isSubmitted && (
                <div className={`backdrop-blur-sm rounded px-3 py-1 transition-all ${
                  timeRemaining <= 30 
                    ? 'bg-red-500/90 animate-pulse' 
                    : timeRemaining <= 60 
                    ? 'bg-orange-500/80' 
                    : 'bg-white/10'
                }`}>
                  <div className="text-xs text-white/90 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    <span>Time</span>
                  </div>
                  <div className="text-lg flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-sm rounded px-3 py-1">
                <div className="text-xs text-white/70">Difficulty</div>
                <div className="text-sm">{currentQuestion?.difficulty}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded px-3 py-1">
                <div className="text-xs text-white/70">Marks</div>
                <div className="text-sm">{currentQuestion?.totalMarks}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Left Panel - Fixed Width */}
          <div className="flex-shrink-0 space-y-4 overflow-y-auto" style={{ width: '340px' }}>
            {/* Question */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-green-600" />
                <h2 className="text-sm text-gray-900">Question</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentQuestion?.question}
              </p>
            </div>

            {/* Markers List - Fixed Height */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-xs text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Your Markers ({userMarkers.length})
              </h3>
              {userMarkers.length === 0 ? (
                <p className="text-xs text-gray-500">No markers placed yet</p>
              ) : (
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '240px' }}>
                  {userMarkers.map((marker, index) => (
                    <div
                      key={marker.id}
                      className="bg-gray-50 rounded p-2 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={marker.label || ''}
                          onChange={(e) => handleUpdateLabel(marker.id, e.target.value)}
                          placeholder="Enter name (e.g., Ganga)"
                          disabled={isSubmitted}
                          className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                        />
                        <button
                          onClick={() => handleDeleteMarker(marker.id)}
                          disabled={isSubmitted}
                          className="p-1 hover:bg-red-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete marker"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 ml-7">
                        Position: ({Math.round(marker.x)}, {Math.round(marker.y)})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawing Mode Palette - For Combo Questions */}
            {currentQuestion?.type === 'combo' && !isSubmitted && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm text-purple-900">Drawing Palette</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDrawingMode('point')}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                      drawingMode === 'point'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-red-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Point</span>
                  </button>
                  <button
                    onClick={() => setDrawingMode('river')}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                      drawingMode === 'river'
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-cyan-50'
                    }`}
                  >
                    <Waves className="w-4 h-4" />
                    <span>River</span>
                  </button>
                  <button
                    onClick={() => setDrawingMode('area')}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                      drawingMode === 'area'
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    <span>Area</span>
                  </button>
                  <button
                    onClick={() => setDrawingMode('direction')}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                      drawingMode === 'direction'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Arrow</span>
                  </button>
                </div>
                <div className="mt-3 text-xs text-purple-700 bg-white/70 rounded p-2">
                  <strong>Active:</strong> {drawingMode.charAt(0).toUpperCase() + drawingMode.slice(1)} Mode
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-xs text-blue-900">Instructions</h3>
              </div>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Zoom in/out using buttons or scroll</li>
                <li>• Drag to pan when zoomed in</li>
                {currentQuestion?.type === 'combo' ? (
                  <>
                    <li>• <strong>Use palette to switch drawing modes</strong></li>
                    <li>• Complete all {currentQuestion.comboTasks?.length} tasks</li>
                    <li>• Each task has specific requirements</li>
                  </>
                ) : currentQuestion?.type === 'area' ? (
                  <>
                    <li>• <strong>Click points to draw the area boundary</strong></li>
                    <li>• Click "Done Drawing" to close the area</li>
                    <li>• Minimum 3 points required</li>
                  </>
                ) : currentQuestion?.type === 'river' ? (
                  <>
                    <li>• <strong>Click points along the river's flow path</strong></li>
                    <li>• Start from origin, trace to destination</li>
                    <li>• Click "Done Tracing" when finished</li>
                    <li>• Minimum {currentQuestion.minPathPoints || 5} points required</li>
                  </>
                ) : currentQuestion?.type === 'direction' ? (
                  <>
                    <li>• <strong>Click and DRAG to draw direction arrows</strong></li>
                    <li>• Arrow shows wind/current direction</li>
                    <li>• Draw from start point in the flow direction</li>
                    <li>• Minimum {currentQuestion.minDirections || 1} arrow(s) required</li>
                  </>
                ) : (
                  <>
                    <li>• Click on map to mark locations</li>
                    <li>• Label each marker with its name</li>
                  </>
                )}
              </ul>
            </div>

            {/* Hint */}
            {!isSubmitted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 text-xs text-yellow-900 mb-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
                {showHint && (
                  <p className="text-xs text-yellow-800">{currentQuestion?.hint}</p>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="space-y-2">
              {/* Area Drawing Controls */}
              {currentQuestion?.type === 'area' && !isSubmitted && (
                <>
                  {!areaDrawingComplete && userAreaPoints.length >= 3 && (
                    <button
                      onClick={() => setAreaDrawingComplete(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <Check className="w-4 h-4" />
                      Done Drawing (Close Area)
                    </button>
                  )}
                  {userAreaPoints.length > 0 && (
                    <div className="text-xs text-center text-gray-600 bg-blue-50 py-1 rounded">
                      {userAreaPoints.length} points plotted
                      {!areaDrawingComplete && userAreaPoints.length >= 3 && ' • Click "Done" when finished'}
                    </div>
                  )}
                </>
              )}
              
              {/* River Path Tracing Controls */}
              {currentQuestion?.type === 'river' && !isSubmitted && (
                <>
                  {!pathTracingComplete && userPathPoints.length >= (currentQuestion.minPathPoints || 5) && (
                    <button
                      onClick={() => setPathTracingComplete(true)}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <Check className="w-4 h-4" />
                      Done Tracing River Path
                    </button>
                  )}
                  {userPathPoints.length > 0 && (
                    <div className="text-xs text-center text-gray-600 bg-cyan-50 py-1 rounded">
                      {userPathPoints.length} points traced
                      {!pathTracingComplete && userPathPoints.length >= (currentQuestion.minPathPoints || 5) && ' • Click "Done" to finish'}
                      {userPathPoints.length < (currentQuestion.minPathPoints || 5) && ` • Need ${(currentQuestion.minPathPoints || 5) - userPathPoints.length} more points`}
                    </div>
                  )}
                </>
              )}
              
              {/* Direction Arrow Controls */}
              {currentQuestion?.type === 'direction' && !isSubmitted && (
                <>
                  {userArrows.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-xs text-orange-900 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Arrows Drawn ({userArrows.length})
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {userArrows.map((arrow, index) => (
                          <div key={arrow.id} className="flex items-center justify-between text-xs bg-white rounded p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">
                                {Math.round(arrow.angle)}° 
                                <span className="text-gray-500 ml-1">
                                  ({arrow.angle >= 315 || arrow.angle < 45 ? 'E' : 
                                    arrow.angle >= 45 && arrow.angle < 135 ? 'S' :
                                    arrow.angle >= 135 && arrow.angle < 225 ? 'W' : 'N'})
                                </span>
                              </span>
                            </div>
                            <button
                              onClick={() => setUserArrows(userArrows.filter(a => a.id !== arrow.id))}
                              className="p-1 hover:bg-red-50 rounded transition-all"
                              title="Delete arrow"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-center text-gray-600 mt-2">
                        {userArrows.length < (currentQuestion.minDirections || 1) 
                          ? `Need ${(currentQuestion.minDirections || 1) - userArrows.length} more arrow(s)`
                          : 'Ready to submit!'}
                      </div>
                    </div>
                  )}
                  {userArrows.length === 0 && (
                    <div className="text-xs text-center text-gray-500 bg-orange-50 py-2 rounded border border-orange-200">
                      Click and drag on map to draw direction arrows
                    </div>
                  )}
                </>
              )}
              
              {/* Point Marking Controls */}
              {currentQuestion?.type !== 'area' && (
                <button
                  onClick={handleRemoveLastMarker}
                  disabled={userMarkers.length === 0 || isSubmitted}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  Remove Last
                </button>
              )}
              
              <button
                onClick={handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={
                    currentQuestion?.type === 'area' 
                      ? !areaDrawingComplete || userAreaPoints.length < 3
                      : currentQuestion?.type === 'river'
                      ? !pathTracingComplete || userPathPoints.length < (currentQuestion.minPathPoints || 5)
                      : currentQuestion?.type === 'direction'
                      ? userArrows.length < (currentQuestion.minDirections || 1)
                      : userMarkers.length === 0
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Submit Answer
                </button>
              ) : (
                <div className="space-y-2">
                  {currentQuestionIndex < currentQuestions.length - 1 && (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                    >
                      Next Question
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            {isSubmitted && results && (
              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm text-gray-900">Results</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Score</span>
                    <span className="text-lg text-green-600">
                      {results.score.toFixed(1)} / {results.totalMarks}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Accuracy</span>
                    <span className="text-lg text-green-600">
                      {results.percentage.toFixed(0)}%
                    </span>
                  </div>

                  {currentQuestion?.type !== 'river' && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Correct Markers</span>
                      <span className="text-sm text-gray-900">
                        {results.correctCount} / {results.totalPossible}
                      </span>
                    </div>
                  )}
                  
                  {/* River Path Specific Metrics */}
                  {currentQuestion?.type === 'river' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Path Coverage</span>
                        <span className="text-sm text-gray-900">
                          {results.pathCoverage?.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Path Accuracy</span>
                        <span className="text-sm text-gray-900">
                          {results.pathAccuracy?.toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded">
                        <strong>Coverage:</strong> How much of the river you traced<br/>
                        <strong>Accuracy:</strong> How precise your path was
                      </div>
                    </>
                  )}
                  
                  {/* Combo Question Task Breakdown */}
                  {currentQuestion?.type === 'combo' && results.comboResults && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600 mb-2">
                        <strong>Task Completion:</strong> {results.correctCount} / {results.totalPossible} tasks
                      </div>
                      {results.comboResults.map((task: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-2 rounded-lg border ${
                            task.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {task.type === 'point' && <MapPin className="w-3 h-3" />}
                                {task.type === 'river' && <Waves className="w-3 h-3" />}
                                {task.type === 'area' && <Square className="w-3 h-3" />}
                                {task.type === 'direction' && <ArrowRight className="w-3 h-3" />}
                                <span className="text-xs font-semibold capitalize">{task.type}</span>
                                {task.completed ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <X className="w-3 h-3 text-red-600" />
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                {task.instruction}
                              </div>
                              {task.details && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {task.type === 'river' && `Coverage: ${task.details.coverage?.toFixed(0)}%, Accuracy: ${task.details.accuracy?.toFixed(0)}%`}
                                  {task.type === 'point' && `${task.details.correctMarkers}/${task.details.totalMarkers} points correct`}
                                  {task.type === 'direction' && `${task.details.correctArrows}/${task.details.totalArrows} arrows correct`}
                                  {task.type === 'area' && (task.details.areaMatch ? 'Area matched!' : 'Area needs work')}
                                </div>
                              )}
                            </div>
                            <div className="text-xs font-semibold">
                              {task.score.toFixed(1)}/{task.maxMarks}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NEW: Time Spent Display */}
                  {results.timeSpent !== null && results.timeSpent !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time Taken
                      </span>
                      <span className="text-sm text-blue-600">
                        {formatTime(results.timeSpent)}
                      </span>
                    </div>
                  )}

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${results.percentage}%` }}
                    />
                  </div>

                  {/* NEW: Detailed Explanations Section */}
                  {currentQuestion?.detailedExplanation && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs text-gray-900">Detailed Explanation</h4>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed mb-3">
                        {currentQuestion.detailedExplanation}
                      </p>
                      
                      {currentQuestion.learningTips && currentQuestion.learningTips.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 mt-3">
                          <h5 className="text-xs text-blue-900 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" />
                            How to Identify:
                          </h5>
                          <ul className="text-xs text-blue-800 space-y-1">
                            {currentQuestion.learningTips.map((tip, idx) => (
                              <li key={idx}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* NEW: Individual Answer Explanations */}
                  {currentQuestion?.correctAnswers.some(ans => ans.explanation) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-green-600" />
                        Answer Details:
                      </h4>
                      <div className="space-y-2">
                        {currentQuestion.correctAnswers.map((answer, idx) => (
                          answer.explanation && (
                            <div key={idx} className="bg-green-50 rounded p-2 border border-green-200">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                                  ✓
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-green-900 mb-1">{answer.label}</p>
                                  <p className="text-xs text-green-800">{answer.explanation}</p>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Legend:</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <span className="text-gray-600">Your markers</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-green-500 rounded-full" />
                        <span className="text-gray-600">Correct locations</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-8 h-0.5 bg-red-500" style={{ borderStyle: 'dashed' }} />
                        <span className="text-gray-600">Error lines</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Map Canvas - Larger */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg p-4 border border-gray-200 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm text-gray-900">Interactive Map</h2>
                <div className="flex items-center gap-3">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 1}
                      className="p-1 hover:bg-white rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4 text-gray-700" />
                    </button>
                    
                    <span className="text-xs text-gray-700 min-w-[3rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 5}
                      className="p-1 hover:bg-white rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-700" />
                    </button>
                    
                    <button
                      onClick={handleResetZoom}
                      className="p-1 hover:bg-white rounded transition-all ml-1"
                      title="Reset Zoom"
                    >
                      <Maximize2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {zoom > 1 ? (
                      <>
                        <Move className="w-3 h-3" />
                        <span>Drag to pan</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>Click to mark</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex items-start justify-start">
                <div 
                  ref={containerRef} 
                  className="relative overflow-hidden rounded-lg border-2 border-gray-300"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    className={`${
                      !isSubmitted && zoom <= 1
                        ? 'cursor-crosshair'
                        : zoom > 1 && !isSubmitted
                        ? isDragging
                          ? 'cursor-grabbing'
                          : 'cursor-grab'
                        : 'cursor-default'
                    }`}
                    style={{
                      display: 'block',
                    }}
                  />
                  
                  {/* Loading Indicator */}
                  {isMapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  )}
                  
                  {!isSubmitted && userMarkers.length === 0 && zoom === 1 && !isMapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-sm">
                        Zoom in for precision, then click to mark locations
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}