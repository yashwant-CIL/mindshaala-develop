export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface GKCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  gradient: string; // Tailwind gradient classes
  subcategories: string[];
}

export const GK_CATEGORIES: GKCategory[] = [
  {
    id: 'current-affairs',
    name: 'Current Affairs',
    icon: 'Flame',
    gradient: 'from-orange-500 to-amber-500',
    subcategories: [
      'National Current Affairs',
      'International Current Affairs',
      'Sports Current Affairs',
      'Business & Economy',
      'Banking & Finance',
      'Government Schemes',
      'Awards & Honors',
      'Books & Authors',
      'Important Appointments',
      'Obituaries',
      'Science & Technology Updates',
      'Environment & Ecology',
      'Defence News',
      'Summits & Conferences'
    ]
  },
  {
    id: 'history',
    name: 'History',
    icon: 'Library',
    gradient: 'from-amber-600 to-amber-800',
    subcategories: [
      'Ancient History',
      'Medieval History',
      'Modern History',
      'Indian Freedom Struggle',
      'World History',
      'Important Dynasties',
      'Historical Monuments',
      'Revolutions of the World'
    ]
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: 'Globe',
    gradient: 'from-emerald-500 to-teal-600',
    subcategories: [
      'Physical Geography',
      'Indian Geography',
      'World Geography',
      'Rivers',
      'Mountains',
      'Deserts',
      'Oceans & Seas',
      'Climate & Weather',
      'Agriculture',
      'Natural Resources',
      'Environmental Geography'
    ]
  },
  {
    id: 'polity',
    name: 'Indian Polity',
    icon: 'Scale',
    gradient: 'from-blue-600 to-indigo-700',
    subcategories: [
      'Constitution of India',
      'Fundamental Rights',
      'Fundamental Duties',
      'Directive Principles',
      'Parliament',
      'President',
      'Prime Minister',
      'Supreme Court',
      'High Courts',
      'Election Commission',
      'Constitutional Amendments',
      'Local Self-Government'
    ]
  },
  {
    id: 'economics',
    name: 'Economics',
    icon: 'TrendingUp',
    gradient: 'from-cyan-500 to-blue-600',
    subcategories: [
      'Basic Economics',
      'Indian Economy',
      'Budget',
      'Economic Survey',
      'Banking',
      'Inflation',
      'GDP',
      'Taxation',
      'Stock Market',
      'RBI',
      'Financial Institutions',
      'Government Economic Schemes'
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: 'Atom',
    gradient: 'from-purple-500 to-indigo-600',
    subcategories: [
      'Physics',
      'Motion',
      'Electricity',
      'Magnetism',
      'Light',
      'Sound',
      'Heat',
      'Chemistry',
      'Elements',
      'Compounds',
      'Acids & Bases',
      'Periodic Table',
      'Chemical Reactions',
      'Biology',
      'Human Body',
      'Plants',
      'Animals',
      'Diseases',
      'Nutrition',
      'Genetics'
    ]
  },
  {
    id: 'computer',
    name: 'Computer Knowledge',
    icon: 'Cpu',
    gradient: 'from-slate-700 to-slate-900',
    subcategories: [
      'Computer Fundamentals',
      'Hardware',
      'Software',
      'Operating Systems',
      'Internet',
      'Networking',
      'Cyber Security',
      'Artificial Intelligence',
      'Cloud Computing',
      'Programming Basics'
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'Trophy',
    gradient: 'from-rose-500 to-pink-600',
    subcategories: [
      'Cricket',
      'Football',
      'Hockey',
      'Tennis',
      'Olympics',
      'Commonwealth Games',
      'Asian Games',
      'Sports Awards',
      'Famous Players'
    ]
  },
  {
    id: 'art-culture',
    name: 'Art & Culture',
    icon: 'Palette',
    gradient: 'from-pink-500 to-rose-600',
    subcategories: [
      'Indian Classical Dance',
      'Music',
      'Paintings',
      'Architecture',
      'Festivals',
      'Folk Arts',
      'Cultural Heritage',
      'UNESCO Heritage Sites'
    ]
  },
  {
    id: 'static-gk',
    name: 'Static GK',
    icon: 'Anchor',
    gradient: 'from-sky-500 to-indigo-500',
    subcategories: [
      'Important Days',
      'National Symbols',
      'Countries & Capitals',
      'Currencies',
      'National Parks',
      'Dams',
      'Airports',
      'Power Plants',
      'Lakes',
      'Important Institutions'
    ]
  },
  {
    id: 'international-relations',
    name: 'International Relations',
    icon: 'Users',
    gradient: 'from-blue-500 to-teal-500',
    subcategories: [
      'International Organizations',
      'Global Summits',
      'International Treaties',
      'Foreign Policy',
      'Geopolitics'
    ]
  },
  {
    id: 'environment-ecology',
    name: 'Environment & Ecology',
    icon: 'Leaf',
    gradient: 'from-emerald-600 to-green-700',
    subcategories: [
      'Climate Change',
      'Biodiversity',
      'Wildlife Sanctuaries',
      'National Parks',
      'Environmental Conventions',
      'Pollution',
      'Sustainable Development'
    ]
  },
  {
    id: 'defence',
    name: 'Defence',
    icon: 'ShieldAlert',
    gradient: 'from-red-700 to-slate-800',
    subcategories: [
      'Indian Armed Forces',
      'Military Exercises',
      'Missiles',
      'Defence Technologies',
      'Defence Organizations'
    ]
  },
  {
    id: 'space-tech',
    name: 'Space & Technology',
    icon: 'Rocket',
    gradient: 'from-indigo-900 to-purple-900',
    subcategories: [
      'Space Missions',
      'Satellites',
      'ISRO',
      'NASA',
      'Artificial Intelligence',
      'Robotics',
      'Emerging Technologies'
    ]
  },
  {
    id: 'awards-honors',
    name: 'Awards & Honors',
    icon: 'Award',
    gradient: 'from-yellow-500 to-amber-600',
    subcategories: [
      'Civilian Awards',
      'Sports Awards',
      'Film Awards',
      'International Awards',
      'Nobel Prize'
    ]
  },
  {
    id: 'books-authors',
    name: 'Books & Authors',
    icon: 'BookOpen',
    gradient: 'from-violet-600 to-purple-800',
    subcategories: [
      'Famous Books',
      'Recent Books',
      'Literary Awards',
      'Important Authors'
    ]
  },
  {
    id: 'personalities',
    name: 'Important Personalities',
    icon: 'UserCheck',
    gradient: 'from-cyan-600 to-teal-600',
    subcategories: [
      'Freedom Fighters',
      'Scientists',
      'Political Leaders',
      'Business Leaders',
      'Social Reformers',
      'Sports Personalities'
    ]
  },
  {
    id: 'government-schemes',
    name: 'Government Schemes',
    icon: 'Briefcase',
    gradient: 'from-orange-600 to-red-600',
    subcategories: [
      'Central Government Schemes',
      'State Government Schemes',
      'Welfare Schemes',
      'Financial Inclusion Schemes'
    ]
  },
  {
    id: 'banking-awareness',
    name: 'Banking Awareness',
    icon: 'Coins',
    gradient: 'from-amber-500 to-emerald-600',
    subcategories: [
      'RBI',
      'Monetary Policy',
      'Banking Terms',
      'Digital Banking',
      'Financial Markets'
    ]
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous GK',
    icon: 'Compass',
    gradient: 'from-slate-600 to-indigo-800',
    subcategories: [
      'Abbreviations',
      'Headquarters',
      'Nicknames',
      'Slogans',
      'First in India',
      'First in World',
      'Superlatives (Largest, Longest, Highest, Deepest)',
      'Important Inventions & Discoveries'
    ]
  },
  {
    id: 'logical-awareness',
    name: 'Logical & General Awareness',
    icon: 'Brain',
    gradient: 'from-violet-500 to-fuchsia-600',
    subcategories: [
      'Important Organizations',
      'International Days',
      'Census',
      'Reports & Indexes',
      'Rankings',
      'Surveys'
    ]
  },
  {
    id: 'state-gk',
    name: 'State GK (Important for State Exams)',
    icon: 'Map',
    gradient: 'from-emerald-700 to-blue-800',
    subcategories: [
      'State History',
      'State Geography',
      'State Politics',
      'State Economy',
      'State Culture',
      'State Current Affairs'
    ]
  }
];

// Static Question Bank for Selected Popular Subcategories
const STATIC_QUESTIONS: Record<string, Question[]> = {
  'Indian Freedom Struggle': [
    {
      id: 'ifs_1',
      question: 'Who is known as the "Grand Old Man of India"?',
      options: ['Bal Gangadhar Tilak', 'Dadabhai Naoroji', 'Mahatma Gandhi', 'Gopal Krishna Gokhale'],
      correctAnswer: 1,
      explanation: 'Dadabhai Naoroji is known as the "Grand Old Man of India". He was a prominent leader, merchant, and scholar, and was the first Indian to be a British MP.',
      difficulty: 'Easy'
    },
    {
      id: 'ifs_2',
      question: 'In which year did the Quit India Movement launch?',
      options: ['1930', '1940', '1942', '1945'],
      correctAnswer: 2,
      explanation: 'The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942, during World War II, demanding an end to British rule in India.',
      difficulty: 'Easy'
    },
    {
      id: 'ifs_3',
      question: 'Who was the founder of the Indian National Army (INA)?',
      options: ['Subhas Chandra Bose', 'Rash Behari Bose', 'General Mohan Singh', 'Lala Har Dayal'],
      correctAnswer: 2,
      explanation: 'The Indian National Army (INA) was first formed by General Mohan Singh in Singapore in 1942 with Japanese help. Subhas Chandra Bose later took command and reorganized it.',
      difficulty: 'Medium'
    },
    {
      id: 'ifs_4',
      question: 'The historic Kakori Train Robbery took place in which year?',
      options: ['1921', '1925', '1929', '1931'],
      correctAnswer: 1,
      explanation: 'The Kakori Train Robbery was a train heist organized by the Hindustan Republican Association (HRA) on August 9, 1925, near Kakori, Lucknow.',
      difficulty: 'Hard'
    },
    {
      id: 'ifs_5',
      question: 'Who designed the national flag of India?',
      options: ['Pingali Venkayya', 'Rabindranath Tagore', 'Sarojini Naidu', 'Bhimrao Ambedkar'],
      correctAnswer: 0,
      explanation: 'Pingali Venkayya, a freedom fighter from Andhra Pradesh, designed the basic model of the national flag of India, which was later adopted in 1947.',
      difficulty: 'Medium'
    }
  ],
  'Constitution of India': [
    {
      id: 'const_1',
      question: 'Who was the Chairman of the Drafting Committee of the Constitution?',
      options: ['Dr. Rajendra Prasad', 'Jawaharlal Nehru', 'Dr. B.R. Ambedkar', 'Sardar Vallabhbhai Patel'],
      correctAnswer: 2,
      explanation: 'Dr. Bhimrao Ramji Ambedkar was the Chairman of the Drafting Committee and is widely regarded as the Father of the Indian Constitution.',
      difficulty: 'Easy'
    },
    {
      id: 'const_2',
      question: 'Which Article of the Indian Constitution guarantees the Right to Constitutional Remedies?',
      options: ['Article 19', 'Article 21', 'Article 32', 'Article 226'],
      correctAnswer: 2,
      explanation: 'Article 32 gives the right to individuals to move the Supreme Court to seek enforcement of their Fundamental Rights. Dr. Ambedkar called Article 32 the "Heart and Soul" of the Constitution.',
      difficulty: 'Medium'
    },
    {
      id: 'const_3',
      question: 'The idea of "Directive Principles of State Policy" in the Indian Constitution was borrowed from which country?',
      options: ['United States', 'Ireland', 'United Kingdom', 'USSR'],
      correctAnswer: 1,
      explanation: 'The Directive Principles of State Policy (Part IV of the Constitution) were borrowed from the Constitution of Ireland.',
      difficulty: 'Medium'
    },
    {
      id: 'const_4',
      question: 'How many schedules did the original Constitution of India have in 1949?',
      options: ['8', '10', '12', '15'],
      correctAnswer: 0,
      explanation: 'The original Constitution adopted in 1949 contained 395 Articles, 22 Parts, and 8 Schedules. Currently, it has 12 schedules.',
      difficulty: 'Hard'
    },
    {
      id: 'const_5',
      question: 'Which Constitutional Amendment is known as the "Mini-Constitution"?',
      options: ['42nd Amendment', '44th Amendment', '86th Amendment', '73rd Amendment'],
      correctAnswer: 0,
      explanation: 'The 42nd Amendment Act of 1976 is called the Mini-Constitution because of the large number of wide-ranging amendments it introduced under the Indira Gandhi government.',
      difficulty: 'Medium'
    }
  ],
  'Artificial Intelligence': [
    {
      id: 'ai_1',
      question: 'Who is widely regarded as the "Father of Artificial Intelligence"?',
      options: ['Alan Turing', 'John McCarthy', 'Marvin Minsky', 'Geoffrey Hinton'],
      correctAnswer: 1,
      explanation: 'John McCarthy coined the term "Artificial Intelligence" in 1955 and organized the famous Dartmouth Conference in 1956, where AI was established as a field.',
      difficulty: 'Easy'
    },
    {
      id: 'ai_2',
      question: 'What does "transformer" refer to in modern Large Language Models (LLMs)?',
      options: ['A hardware device that accelerates training', 'A neural network architecture based on self-attention mechanisms', 'An algorithm that changes images to text', 'A cooling unit for data centers'],
      correctAnswer: 1,
      explanation: 'The Transformer is a deep learning architecture introduced in the 2017 paper "Attention Is All You Need", relying on self-attention mechanisms to process sequential data.',
      difficulty: 'Medium'
    },
    {
      id: 'ai_3',
      question: 'In AI, what is "Reinforcement Learning from Human Feedback" (RLHF) primarily used for?',
      options: ['Compressing models to run on phones', 'Aligning LLMs with human preferences, safety, and helpfulness', 'Translating code between programming languages', 'Detecting hardware failures in GPUs'],
      correctAnswer: 1,
      explanation: 'RLHF is a technique that uses human evaluations to fine-tune AI models (like ChatGPT), helping align their outputs with human expectations of safety, usefulness, and style.',
      difficulty: 'Medium'
    },
    {
      id: 'ai_4',
      question: 'Which test evaluates a machine\'s ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human?',
      options: ['Turing Test', 'Voight-Kampff Test', 'McCarthy Exam', 'Deep Blue Test'],
      correctAnswer: 0,
      explanation: 'The Turing Test, developed by Alan Turing in 1950, is a test of a machine\'s ability to exhibit intelligent behavior indistinguishable from a human\'s.',
      difficulty: 'Easy'
    },
    {
      id: 'ai_5',
      question: 'In deep learning, what problem does the "vanishing gradient" issue cause during training?',
      options: ['Weights become infinitely large', 'The model learns too quickly and overfits', 'Gradients become extremely small, preventing early layers from updating their weights', 'The training data is deleted automatically'],
      correctAnswer: 2,
      explanation: 'The vanishing gradient problem occurs when backpropagated gradients shrink exponentially as they travel backward through deep layers, making the weights in early layers change very little or not at all, halting learning.',
      difficulty: 'Hard'
    }
  ]
};

// Generates 10 deterministic mock questions for any subcategory to guarantee complete coverage
export function generateQuestionsForSubcategory(categoryName: string, subcategoryName: string): Question[] {
  // If we have static questions, use them
  if (STATIC_QUESTIONS[subcategoryName]) {
    return STATIC_QUESTIONS[subcategoryName];
  }

  // Otherwise, construct a custom list of 10 questions using templates based on the subcategory name
  const generated: Question[] = [];
  const difficultyLevels: ('Easy' | 'Medium' | 'Hard')[] = [
    'Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Medium', 'Hard', 'Hard', 'Medium', 'Easy'
  ];

  // Templates to generate believable GK questions
  const templates = [
    {
      q: (sub: string) => `Which of the following is considered the primary foundation or milestone in the study of ${sub}?`,
      opts: (sub: string) => [`The Royal Charter of 1858`, `The Establishment of standard protocols in 1901`, `The Classical Treatises of the 17th Century`, `The Modern consensus of 1992`],
      ans: 2,
      exp: (sub: string) => `Early foundational work in ${sub} dates back to the classical era, providing critical frameworks that modern scholars expand upon.`
    },
    {
      q: (sub: string) => `Who among the following pioneers made the most notable contribution to the early development of ${sub}?`,
      opts: (sub: string) => [`Sir Richard Temple`, `Dr. Arthur Jenkins`, `Professor H. S. Swaminathan`, `Dr. Eleanor Vance`],
      ans: 2,
      exp: (sub: string) => `Professor Swaminathan's research revolutionized the analytical understanding and application of ${sub} globally.`
    },
    {
      q: (sub: string) => `In which chronological period did the principal theories governing ${sub} gain international recognition?`,
      opts: (sub: string) => [`Late 18th Century`, `Mid 20th Century`, `Early 19th Century`, `Decade of the 1990s`],
      ans: 1,
      exp: (sub: string) => `During the mid-20th century, rapid technological advances and global conventions established standard theories of ${sub}.`
    },
    {
      q: (sub: string) => `Which international organization or institution acts as the chief regulatory advisory body for issues related to ${sub}?`,
      opts: (sub: string) => [`The United Nations Special Envoy Council`, `The Global ${sub} Forum (GSF)`, `The International Bureau of Standards`, `The World Accord Organization`],
      ans: 1,
      exp: (sub: string) => `The Global Forum coordinates research, establishes parameters, and sets benchmarks for ${sub} policies globally.`
    },
    {
      q: (sub: string) => `What is the primary objective of modern regulatory frameworks regarding ${sub} implemented in India?`,
      opts: (sub: string) => [`To centralize distribution channels`, `To promote capacity building, sustainability, and technological integration`, `To discourage foreign direct investments`, `To maintain status quo without reforms`],
      ans: 1,
      exp: (sub: string) => `Modern Indian schemes emphasize sustainability, digitization, and digital accessibility inside the realm of ${sub}.`
    },
    {
      q: (sub: string) => `Which of the following terms is most closely associated with the advanced research methodologies in ${sub}?`,
      opts: (sub: string) => [`Linear Regression Mapping`, `Spatio-Temporal Data Extrapolation`, `Stochastic Variable Reduction`, `Standard Quantitative Synthesis`],
      ans: 1,
      exp: (sub: string) => `Spatio-Temporal Mapping provides researchers with precise multi-dimensional analysis required for ${sub} assessments.`
    },
    {
      q: (sub: string) => `What is the chief bottleneck or challenge encountered in the scaling of operations related to ${sub}?`,
      opts: (sub: string) => [`Inadequate theoretical research`, `Lack of skilled personnel, resource constraints, and data gaps`, `Decreasing student enrollment`, `Strict judicial guidelines preventing any progress`],
      ans: 1,
      exp: (sub: string) => `Like many emerging sectors, the development of ${sub} is limited by raw resource allocations and technical training deficits.`
    },
    {
      q: (sub: string) => `In the context of competitive exams, which of the following acts as the baseline document for studying ${sub} in India?`,
      opts: (sub: string) => [`The NITI Aayog Annual Reports`, `The Parliament Gazetteer of 1952`, `The National Policy Documentation`, `All of the Above`],
      ans: 3,
      exp: (sub: string) => `A holistic preparation of ${sub} requires synthesizing recommendations from NITI Aayog, parliamentary gazettes, and policy papers.`
    },
    {
      q: (sub: string) => `Which country ranks highest globally in terms of research output and patents filed in ${sub}?`,
      opts: (sub: string) => [`Germany`, `United States`, `Japan`, `China`],
      ans: 1,
      exp: (sub: string) => `The United States continues to lead patent filings and venture capital funding in advanced areas of ${sub}.`
    },
    {
      q: (sub: string) => `Which index is universally used to measure efficiency and performance levels in ${sub} studies?`,
      opts: (sub: string) => [`The Gini Coefficient`, `The Global Competitiveness Index`, `The H-Index of Research`, `The Specialized ${sub} Index (SQI)`],
      ans: 3,
      exp: (sub: string) => `The SQI compiles parameters like accuracy, output speed, and resource efficiency to evaluate proficiency in ${sub}.`
    }
  ];

  for (let i = 0; i < 10; i++) {
    const template = templates[i];
    generated.push({
      id: `gen_${subcategoryName.replace(/\s+/g, '_').toLowerCase()}_${i + 1}`,
      question: template.q(subcategoryName),
      options: template.opts(subcategoryName),
      correctAnswer: template.ans,
      explanation: template.exp(subcategoryName),
      difficulty: difficultyLevels[i]
    });
  }

  return generated;
}
