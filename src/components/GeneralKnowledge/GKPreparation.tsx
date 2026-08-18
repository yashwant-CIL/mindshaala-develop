import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  ChevronLeft, 
  Search, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  RotateCcw, 
  Share2, 
  Check, 
  Info, 
  Layers, 
  GraduationCap, 
  Flame, 
  Globe, 
  Scale, 
  Atom, 
  Cpu, 
  Trophy, 
  Compass, 
  Brain, 
  Zap, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { GKService } from '../../services/GKService';
import { toast } from 'react-hot-toast';

interface FactItem {
  id: string;
  statement: string;
  context?: string;
  keyTerms?: string[];
  tag?: string;
}

interface SubCategoryItem {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  facts: FactItem[];
}

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  accentBg: string;
  accentText: string;
  subcategories: SubCategoryItem[];
}

interface GKPreparationProps {
  onNavigate?: (page: string) => void;
}

// Sample enriched data for subcategories and facts (Light theme compatible)
const SAMPLE_CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'cat_history',
    name: 'History & Civilizations',
    description: 'Explore Indian Freedom Movement, Ancient Empires, Medieval Dynasties, and World History facts.',
    iconName: 'Globe',
    color: 'from-amber-500 to-orange-600',
    accentBg: 'bg-amber-50 border-amber-200',
    accentText: 'text-amber-700',
    subcategories: [
      {
        id: 'sub_freedom_struggle',
        name: 'Indian Freedom Movement',
        description: 'Key events, struggles, and pioneers of Indian independence.',
        facts: [
          {
            id: 'f_hist_1',
            statement: 'India gained independence from British colonial rule on August 15, 1947, through the Indian Independence Act passed by the British Parliament.',
            context: 'The Indian Independence Act received Royal Assent on July 18, 1947, dividing British India into India and Pakistan.',
            keyTerms: ['August 15, 1947', 'Indian Independence Act', '1947 Partition'],
            tag: 'Historical Milestone'
          },
          {
            id: 'f_hist_2',
            statement: 'The Sepoy Mutiny of 1857, also recognized as the First War of Indian Independence, initiated in Meerut on May 10, 1857.',
            context: 'It began as a mutiny of sepoys of the East India Company\'s army in Meerut and quickly spread into a widespread rebellion.',
            keyTerms: ['1857 Revolt', 'Meerut', 'First War of Independence'],
            tag: 'Rebellion'
          },
          {
            id: 'f_hist_3',
            statement: 'Mahatma Gandhi launched the Non-Cooperation Movement in August 1920 to resist British rule through non-violent Satyagraha.',
            context: 'The movement aimed to boycott British institutions, goods, courts, and educational centers across India.',
            keyTerms: ['1920', 'Non-Cooperation Movement', 'Satyagraha'],
            tag: 'Mass Movement'
          },
          {
            id: 'f_hist_4',
            statement: 'The Dandi March (Salt Satyagraha) was initiated by Mahatma Gandhi on March 12, 1930, covering 240 miles from Sabarmati Ashram to Dandi.',
            context: 'Gandhi broke the British salt laws at Dandi on April 6, 1930, triggering civil disobedience across India.',
            keyTerms: ['March 12, 1930', 'Salt Satyagraha', 'Dandi'],
            tag: 'Civil Disobedience'
          },
          {
            id: 'f_hist_5',
            statement: 'Subhas Chandra Bose reorganized the Azad Hind Fauj (Indian National Army) in 1943 with the historic motto "Jai Hind" and call "Give me blood, and I will give you freedom!"',
            context: 'Netaji established the Provisional Government of Free India in Singapore in October 1943.',
            keyTerms: ['Subhas Chandra Bose', 'Azad Hind Fauj', 'Jai Hind'],
            tag: 'Revolutionary Leader'
          },
          {
            id: 'f_hist_6',
            statement: 'The Quit India Movement (Bharat Chhodo Andolan) was launched by Mahatma Gandhi on August 8, 1942 at Gowalia Tank Maidan, Bombay.',
            context: 'Gandhi gave the famous battle cry "Do or Die" demanding an immediate end to British rule in India.',
            keyTerms: ['August 8, 1942', 'Quit India Movement', 'Do or Die'],
            tag: 'Historic Call'
          },
          {
            id: 'f_hist_7',
            statement: 'Bhagat Singh, Shivaram Rajguru, and Sukhdev Thapar were executed by British authorities on March 23, 1931 in Lahore Jail.',
            context: 'March 23 is observed annually in India as Shaheed Diwas (Martyrs\' Day) in their memory.',
            keyTerms: ['Bhagat Singh', 'March 23, 1931', 'Shaheed Diwas'],
            tag: 'Martyrs of Freedom'
          },
          {
            id: 'f_hist_8',
            statement: 'The Jallianwala Bagh massacre occurred on April 13, 1919 in Amritsar, Punjab, where General Reginald Dyer ordered troops to fire on an unarmed peaceful gathering.',
            context: 'This tragic event led Rabindranath Tagore to renounce his British Knighthood in protest.',
            keyTerms: ['April 13, 1919', 'Jallianwala Bagh', 'Rabindranath Tagore'],
            tag: 'National Tragedy'
          }
        ]
      },
      {
        id: 'sub_ancient_india',
        name: 'Ancient Indian Empires',
        description: 'Indus Valley, Maurya Dynasty, Gupta Golden Age, and Vedic Culture.',
        facts: [
          {
            id: 'f_anc_1',
            statement: 'The Indus Valley Civilization (Harappan Civilization) flourished around 2500 BCE to 1900 BCE, famous for urban town planning and grid systems.',
            context: 'Major sites include Harappa, Mohenjo-daro, Lothal (dockyard), and Dholavira.',
            keyTerms: ['2500 BCE', 'Harappa & Mohenjo-daro', 'Town Planning'],
            tag: 'Ancient Civilization'
          },
          {
            id: 'f_anc_2',
            statement: 'Emperor Ashoka the Great adopted Buddhism following the devastating Kalinga War in 261 BCE and promoted Ahimsa (non-violence).',
            context: 'Ashoka installed Edicts on Pillars and Rocks across South Asia, inspiring India\'s national symbol (Ashoka Pillar at Sarnath).',
            keyTerms: ['Ashoka', '261 BCE Kalinga War', 'Buddhism', 'Sarnath Lion Capital'],
            tag: 'Mauryan Empire'
          },
          {
            id: 'f_anc_3',
            statement: 'The Gupta Empire (320 CE – 550 CE) is widely referred to as the Golden Age of India due to major breakthroughs in science, mathematics, and arts.',
            context: 'Aryabhata, Varahamihira, and Kalidasa flourished during the Gupta era.',
            keyTerms: ['Gupta Empire', 'Golden Age', 'Aryabhata', 'Kalidasa'],
            tag: 'Golden Era'
          },
          {
            id: 'f_anc_4',
            statement: 'Aryabhata introduced the concept of zero (0) and calculated the value of Pi (π) to four decimal places in his treatise Aryabhatiya in 499 CE.',
            context: 'Aryabhata also explained that lunar and solar eclipses occur due to shadows of Moon and Earth.',
            keyTerms: ['Aryabhata', 'Concept of Zero', 'Value of Pi', '499 CE'],
            tag: 'Ancient Science'
          }
        ]
      },
      {
        id: 'sub_medieval_world',
        name: 'Medieval & World History',
        description: 'Mughals, Chola Dynasty, World Wars, and Renaissance.',
        facts: [
          {
            id: 'f_med_1',
            statement: 'The Chola Dynasty under Rajaraja I and Rajendra I built naval supremacy in South-East Asia and constructed the majestic Brihadeeswarar Temple in Thanjavur (1010 CE).',
            context: 'Brihadeeswarar Temple is a UNESCO World Heritage site constructed completely out of granite.',
            keyTerms: ['Chola Dynasty', 'Brihadeeswarar Temple', 'Rajaraja I'],
            tag: 'Architectural Wonder'
          },
          {
            id: 'f_med_2',
            statement: 'World War I lasted from July 28, 1914 to November 11, 1918, ending with the Signing of the Treaty of Versailles in 1919.',
            context: 'Over 1.3 million Indian soldiers fought for the Allied powers in WWI.',
            keyTerms: ['1914-1918', 'Treaty of Versailles', 'World War I'],
            tag: 'World History'
          }
        ]
      }
    ]
  },
  {
    id: 'cat_polity',
    name: 'Indian Polity & Constitution',
    description: 'Preamble, Fundamental Rights, Articles, Parliament, Judiciary, and Governance.',
    iconName: 'Scale',
    color: 'from-blue-600 to-indigo-700',
    accentBg: 'bg-blue-50 border-blue-200',
    accentText: 'text-blue-700',
    subcategories: [
      {
        id: 'sub_constitution_main',
        name: 'Constitution of India',
        description: 'Structure, Framing, Amendments, and Core Philosophy.',
        facts: [
          {
            id: 'f_pol_1',
            statement: 'The Constitution of India officially came into effect on January 26, 1950, celebrated annually as Republic Day of India.',
            context: 'The Constituent Assembly adopted the Constitution on November 26, 1949 (now celebrated as Constitution Day).',
            keyTerms: ['January 26, 1950', 'Republic Day', 'November 26 Constitution Day'],
            tag: 'Constitutional Origin'
          },
          {
            id: 'f_pol_2',
            statement: 'Dr. B.R. Ambedkar served as the Chairman of the 7-member Drafting Committee of the Constituent Assembly and is revered as the Father of Indian Constitution.',
            context: 'The Constitution took 2 years, 11 months, and 18 days to complete.',
            keyTerms: ['Dr. B.R. Ambedkar', 'Drafting Committee', '2 Years 11 Months 18 Days'],
            tag: 'Architect of Constitution'
          },
          {
            id: 'f_pol_3',
            statement: 'The Constitution of India holds the record of being the longest written constitution of any sovereign nation in the world.',
            context: 'Originally containing 395 Articles in 22 Parts and 8 Schedules, it now has over 448 Articles, 25 Parts, and 12 Schedules.',
            keyTerms: ['Longest Written Constitution', '395 Original Articles', '12 Schedules'],
            tag: 'World Record'
          },
          {
            id: 'f_pol_4',
            statement: 'The words "SOCIALIST", "SECULAR", and "INTEGRITY" were added to the Preamble by the 42nd Constitutional Amendment Act of 1976.',
            context: 'The 42nd Amendment of 1976 is also famously referred to as the "Mini-Constitution".',
            keyTerms: ['42nd Amendment 1976', 'Mini-Constitution', 'Socialist Secular Integrity'],
            tag: 'Preamble Amendment'
          },
          {
            id: 'f_pol_5',
            statement: 'Fundamental Rights are enshrined in Part III of the Constitution from Articles 12 to 35, guaranteeing 6 fundamental freedoms to all citizens.',
            context: 'Originally there were 7 Fundamental Rights, but the Right to Property was made a legal right under Article 300A by 44th Amendment in 1978.',
            keyTerms: ['Part III Articles 12-35', '6 Fundamental Rights', '44th Amendment Property Right'],
            tag: 'Rights & Freedoms'
          },
          {
            id: 'f_pol_6',
            statement: 'Dr. B.R. Ambedkar referred to Article 32 (Right to Constitutional Remedies) as the "Heart and Soul of the Indian Constitution".',
            context: 'Article 32 empowers citizens to move the Supreme Court directly for enforcement of Fundamental Rights via 5 Writs.',
            keyTerms: ['Article 32', 'Heart and Soul', 'Writs', 'Supreme Court'],
            tag: 'Key Constitutional Provision'
          },
          {
            id: 'f_pol_7',
            statement: 'Fundamental Duties were incorporated into Part IV-A (Article 51A) of the Constitution based on recommendations of the Swaran Singh Committee in 1976.',
            context: 'Originally 10 duties were added; the 11th duty regarding child education was added by the 86th Amendment in 2002.',
            keyTerms: ['Article 51A', 'Swaran Singh Committee', '11 Fundamental Duties'],
            tag: 'Civic Responsibilities'
          },
          {
            id: 'f_pol_8',
            statement: 'Right to Education (RTE) was declared a Fundamental Right under Article 21A through the 86th Constitutional Amendment Act of 2002.',
            context: 'It mandates free and compulsory education for all children aged 6 to 14 years.',
            keyTerms: ['Article 21A', '86th Amendment 2002', 'Free & Compulsory Education'],
            tag: 'Education Right'
          }
        ]
      },
      {
        id: 'sub_parliament_exec',
        name: 'Parliament & Governance',
        description: 'Lok Sabha, Rajya Sabha, President, Prime Minister, and Elections.',
        facts: [
          {
            id: 'f_par_1',
            statement: 'The President of India is the First Citizen of India and the Supreme Commander of the Indian Armed Forces.',
            context: 'Article 52 states that there shall be a President of India, elected by an Electoral College.',
            keyTerms: ['First Citizen', 'Supreme Commander', 'Article 52'],
            tag: 'Executive Head'
          },
          {
            id: 'f_par_2',
            statement: 'Rajya Sabha (Upper House) is a permanent body and cannot be dissolved; one-third of its members retire every two years.',
            context: 'The Vice-President of India is the ex-officio Chairman of Rajya Sabha.',
            keyTerms: ['Rajya Sabha', 'Permanent Body', 'Vice-President Chairman'],
            tag: 'Parliament Structure'
          }
        ]
      }
    ]
  },
  {
    id: 'cat_geography',
    name: 'Geography & Environment',
    description: 'Physical Features of India, Rivers, Mountains, Climate, World Geography, and Parks.',
    iconName: 'Compass',
    color: 'from-emerald-500 to-teal-700',
    accentBg: 'bg-emerald-50 border-emerald-200',
    accentText: 'text-emerald-700',
    subcategories: [
      {
        id: 'sub_india_geo',
        name: 'Physical Geography of India',
        description: 'Himalayas, Peninsular Plateau, Western Ghats, and Coastal Plains.',
        facts: [
          {
            id: 'f_geo_1',
            statement: 'Kanchenjunga (8,586 meters), located in Sikkim on the India-Nepal border, is the highest mountain peak located in India.',
            context: 'Mount K2 (Godwin-Austen) at 8,611m is in PoK, while Mount Everest (8,848m) is in Nepal.',
            keyTerms: ['Kanchenjunga (8586m)', 'Sikkim', 'Highest Peak in India'],
            tag: 'Physical Topography'
          },
          {
            id: 'f_geo_2',
            statement: 'The Ganges River (Ganga) is the longest river flowing through India, stretching 2,525 km from Gangotri Glacier to the Bay of Bengal.',
            context: 'Ganga originates as Bhagirathi at Gaumukh and becomes Ganga after meeting Alaknanda at Devprayag.',
            keyTerms: ['Ganga (2525 km)', 'Gangotri Glacier', 'Devprayag'],
            tag: 'Major Rivers'
          },
          {
            id: 'f_geo_3',
            statement: 'Tropic of Cancer (23°30\' N latitude) passes through 8 Indian States: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.',
            context: 'Mahi River in India cuts the Tropic of Cancer twice.',
            keyTerms: ['Tropic of Cancer 23.5° N', '8 States', 'Mahi River'],
            tag: 'Latitudinal Line'
          },
          {
            id: 'f_geo_4',
            statement: 'The Western Ghats (Sahyadri Mountains) are a UNESCO World Heritage site and one of the 8 "Hottest Biodiversity Hotspots" in the world.',
            context: 'Anamudi Peak (2,695m) in Kerala is the highest peak in the Western Ghats and South India.',
            keyTerms: ['Western Ghats / Sahyadri', 'Biodiversity Hotspot', 'Anamudi Peak'],
            tag: 'Ecosystem & Hills'
          },
          {
            id: 'f_geo_5',
            statement: 'Indira Point, located in Great Nicobar Island (6°45\' N), is the southernmost geographical point of India\'s territory.',
            context: 'Kanyakumari (Cape Comorin) is the southernmost point of the main landmass of India.',
            keyTerms: ['Indira Point', 'Great Nicobar', 'Southernmost Point'],
            tag: 'Territorial Boundary'
          },
          {
            id: 'f_geo_6',
            statement: 'Majuli in Assam, located on the Brahmaputra River, is the world\'s largest inhabited river island.',
            context: 'Majuli became the first island district of India in 2016.',
            keyTerms: ['Majuli', 'Brahmaputra River', 'World\'s Largest River Island'],
            tag: 'Geographical Unique Feature'
          }
        ]
      },
      {
        id: 'sub_world_geo',
        name: 'World Oceans & Continents',
        description: 'Global landforms, ocean trenches, deserts, and atmospheric zones.',
        facts: [
          {
            id: 'f_wgeo_1',
            statement: 'The Mariana Trench in the western Pacific Ocean is the deepest oceanic trench on Earth, reaching approximately 10,994 meters at Challenger Deep.',
            context: 'It is deeper than the height of Mount Everest.',
            keyTerms: ['Mariana Trench', 'Challenger Deep 10,994m', 'Pacific Ocean'],
            tag: 'Deepest Point'
          },
          {
            id: 'f_wgeo_2',
            statement: 'The Sahara Desert in North Africa is the world\'s largest hot desert, spanning over 9 million square kilometers.',
            context: 'Antarctica is technically the largest desert in the world overall (cold desert).',
            keyTerms: ['Sahara Desert', 'Largest Hot Desert', 'North Africa'],
            tag: 'Global Deserts'
          }
        ]
      }
    ]
  },
  {
    id: 'cat_science',
    name: 'General Science & Tech',
    description: 'Physics laws, Space Exploration, ISRO missions, Human Biology, Chemistry & Computing.',
    iconName: 'Atom',
    color: 'from-purple-600 to-indigo-700',
    accentBg: 'bg-purple-50 border-purple-200',
    accentText: 'text-purple-700',
    subcategories: [
      {
        id: 'sub_space_isro',
        name: 'Space Exploration & ISRO',
        description: 'Chandrayaan, Mangalyaan, Satellite missions, and Solar observatories.',
        facts: [
          {
            id: 'f_sci_1',
            statement: 'ISRO (Indian Space Research Organisation) was established on August 15, 1969, with headquarters located in Bengaluru, Karnataka.',
            context: 'Dr. Vikram Sarabhai is widely celebrated as the Father of the Indian Space Program.',
            keyTerms: ['ISRO 1969', 'Bengaluru', 'Dr. Vikram Sarabhai'],
            tag: 'Space Agency'
          },
          {
            id: 'f_sci_2',
            statement: 'Aryabhata, launched on April 19, 1975 using a Soviet Kosmos-3M launch vehicle, was India\'s first artificial satellite.',
            context: 'Named after 5th-century Indian mathematician Aryabhata, it was depicted on ₹2 currency notes.',
            keyTerms: ['Aryabhata Satellite', 'April 19, 1975', 'First Satellite of India'],
            tag: 'Satellite History'
          },
          {
            id: 'f_sci_3',
            statement: 'Chandrayaan-3 successfully soft-landed on the Moon\'s Lunar South Pole on August 23, 2023, making India the 1st country to land on lunar South Pole.',
            context: 'India became the 4th country in the world to achieve a soft moon landing after USSR, USA, and China.',
            keyTerms: ['Chandrayaan-3', 'August 23, 2023', 'Lunar South Pole', 'Shiv Shakti Point'],
            tag: 'Historic Space Mission'
          },
          {
            id: 'f_sci_4',
            statement: 'August 23 is officially designated as "National Space Day" in India to commemorate the success of Chandrayaan-3 lunar landing.',
            context: 'The landing site of Vikram lander was officially named "Shiv Shakti Point".',
            keyTerms: ['August 23 National Space Day', 'Shiv Shakti Point'],
            tag: 'National Observance'
          },
          {
            id: 'f_sci_5',
            statement: 'India became the 1st nation in the world to reach Mars orbit on its maiden attempt with Mangalyaan (Mars Orbiter Mission) on Sept 24, 2014.',
            context: 'Mangalyaan was launched using PSLV-C25 on November 5, 2013 from Satish Dhawan Space Centre, Sriharikota.',
            keyTerms: ['Mangalyaan (MOM)', 'September 24, 2014', 'First Attempt Success'],
            tag: 'Interplanetary Flight'
          },
          {
            id: 'f_sci_6',
            statement: 'Aditya-L1 is India\'s first dedicated solar observatory space mission, placed into halo orbit around Lagrangian Point 1 (L1) in January 2024.',
            context: 'L1 is located ~1.5 million km from Earth, allowing continuous unhindered observation of the Sun.',
            keyTerms: ['Aditya-L1', 'Lagrange Point 1', 'Solar Mission'],
            tag: 'Solar Astrophysics'
          }
        ]
      },
      {
        id: 'sub_human_biology',
        name: 'Human Biology & Health',
        description: 'Anatomy, Blood groups, Organs, Vitamins, and Enzymes.',
        facts: [
          {
            id: 'f_bio_1',
            statement: 'The Stapes (located in the middle ear) is the smallest bone in the human body, measuring only about 3 x 2.5 millimeters.',
            context: 'The Femur (thigh bone) is the largest and strongest bone in the human body.',
            keyTerms: ['Stapes (Ear)', 'Smallest Bone', 'Femur Largest Bone'],
            tag: 'Human Skeleton'
          },
          {
            id: 'f_bio_2',
            statement: 'Karl Landsteiner discovered human Blood Groups (A, B, O) in 1900, for which he was awarded the Nobel Prize in Physiology in 1930.',
            context: 'O-Negative is the universal donor, while AB-Positive is the universal recipient blood group.',
            keyTerms: ['Karl Landsteiner 1900', 'O-Negative Universal Donor', 'AB-Positive Recipient'],
            tag: 'Haematology'
          },
          {
            id: 'f_bio_3',
            statement: 'Vitamin C (Ascorbic Acid) is a water-soluble vitamin; its deficiency causes Scurvy characterized by bleeding gums and poor wound healing.',
            context: 'Citrus fruits like lemons, oranges, and Indian gooseberry (Amla) are rich sources of Vitamin C.',
            keyTerms: ['Vitamin C Ascorbic Acid', 'Scurvy Deficiency', 'Citrus Fruits'],
            tag: 'Vitamins & Health'
          }
        ]
      }
    ]
  },
  {
    id: 'cat_sports',
    name: 'Sports, Culture & Awards',
    description: 'Olympics, Cricket, National Sports, Bharat Ratna, Nobel Prizes, and Performing Arts.',
    iconName: 'Trophy',
    color: 'from-rose-500 to-pink-600',
    accentBg: 'bg-rose-50 border-rose-200',
    accentText: 'text-rose-700',
    subcategories: [
      {
        id: 'sub_olympics_awards',
        name: 'Olympics & National Honors',
        description: 'Olympic Gold Medals, Bharat Ratna, and Major Achievements.',
        facts: [
          {
            id: 'f_sp_1',
            statement: 'Neeraj Chopra won India\'s first-ever Olympic Gold Medal in Athletics in Javelin Throw with an 87.58m throw at Tokyo 2020 Olympics.',
            context: 'He became only the 2nd Indian individual Olympic gold medalist after Abhinav Bindra (Shooting, 2008).',
            keyTerms: ['Neeraj Chopra', '87.58m Javelin', 'Tokyo 2020 Gold Medal'],
            tag: 'Olympic Glory'
          },
          {
            id: 'f_sp_2',
            statement: 'The Indian Men\'s Hockey team has won a total of 8 Olympic Gold Medals, the highest by any country in Olympic hockey history.',
            context: 'India won 6 consecutive Olympic gold medals in hockey from 1928 to 1956 under legends like Major Dhyan Chand.',
            keyTerms: ['8 Olympic Gold Medals', 'Field Hockey', 'Major Dhyan Chand'],
            tag: 'Hockey Supremacy'
          },
          {
            id: 'f_sp_3',
            statement: 'August 29 is celebrated as National Sports Day in India to mark the birth anniversary of Hockey Legend Major Dhyan Chand.',
            context: 'Khel Ratna Award is India\'s highest sporting honor, renamed as Major Dhyan Chand Khel Ratna Award.',
            keyTerms: ['August 29 National Sports Day', 'Major Dhyan Chand Khel Ratna'],
            tag: 'Sports Honor'
          },
          {
            id: 'f_sp_4',
            statement: 'Bharat Ratna, instituted in 1954, is the highest civilian award of the Republic of India.',
            context: 'The first recipients in 1954 were C. Rajagopalachari, Dr. S. Radhakrishnan, and Sir C.V. Raman.',
            keyTerms: ['Bharat Ratna 1954', 'Highest Civilian Award', 'C.V. Raman'],
            tag: 'Civilian Honors'
          }
        ]
      }
    ]
  }
];

export default function GKPreparation({ onNavigate }: GKPreparationProps) {
  // State tracking
  const [categories, setCategories] = useState<CategoryItem[]>(SAMPLE_CATEGORIES_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategoryItem | null>(null);
  const [currentFactIndex, setCurrentFactIndex] = useState<number>(0);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [view, setView] = useState<'categories' | 'subcategories' | 'facts'>('categories');
  
  // Interactive 3D Card Animation state
  const [cardFlipDirection, setCardFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Persistence for bookmarks & learned facts
  const [bookmarkedFacts, setBookmarkedFacts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gk_bookmarked_facts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [learnedFacts, setLearnedFacts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gk_learned_facts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch API categories on mount and integrate with sample detailed facts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await GKService.getGKCategories();
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          console.log("GK Categories loaded from API:", response.data);
          
          // Merge API category metadata with sample subcategories & facts if matching names exist
          const merged: CategoryItem[] = SAMPLE_CATEGORIES_DATA.map((sampleCat) => {
            const apiMatch = response.data.find(
              (item: any) =>
                item.category_name?.toLowerCase().includes(sampleCat.name.toLowerCase().split(' ')[0]) ||
                sampleCat.name.toLowerCase().includes(item.category_name?.toLowerCase() || '')
            );
            if (apiMatch) {
              return {
                ...sampleCat,
                id: String(apiMatch.category_id || sampleCat.id),
                name: apiMatch.category_name || sampleCat.name,
                description: apiMatch.description || sampleCat.description,
              };
            }
            return sampleCat;
          });
          setCategories(merged);
        } else {
          setCategories(SAMPLE_CATEGORIES_DATA);
        }
      } catch (err) {
        console.warn("Could not load API categories, using rich predefined facts dataset:", err);
        setCategories(SAMPLE_CATEGORIES_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('gk_bookmarked_facts', JSON.stringify(bookmarkedFacts));
  }, [bookmarkedFacts]);

  useEffect(() => {
    localStorage.setItem('gk_learned_facts', JSON.stringify(learnedFacts));
  }, [learnedFacts]);

  // Handle Keyboard left/right arrow navigation in Fact View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'facts' || !selectedSubcategory) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextFact();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevFact();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, selectedSubcategory, currentFactIndex]);

  // Navigation Handlers
  const handleSelectCategory = (category: CategoryItem) => {
    setSelectedCategory(category);
    setView('subcategories');
    setSearchQuery('');
  };

  const handleSelectSubcategory = (subcategory: SubCategoryItem) => {
    setSelectedSubcategory(subcategory);
    setCurrentFactIndex(0);
    setView('facts');
    // Stop speech if running
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleBackToCategories = () => {
    setView('categories');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleBackToSubcategories = () => {
    setView('subcategories');
    setSelectedSubcategory(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Interactive 3D Mouse Tilt & Flip state
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Mouse Move for 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Calculate tilt angles (max 14 degrees)
    setTilt({
      x: -(y / (rect.height / 2)) * 14,
      y: (x / (rect.width / 2)) * 14
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Reset flip on index change
  useEffect(() => {
    setIsFlipped(false);
  }, [currentFactIndex]);

  // Next Fact with 3D animation
  const handleNextFact = () => {
    if (!selectedSubcategory || isAnimating) return;
    if (currentFactIndex < selectedSubcategory.facts.length - 1) {
      setIsAnimating(true);
      setIsFlipped(false);
      setCardFlipDirection('next');
      setTimeout(() => {
        setCurrentFactIndex((prev) => prev + 1);
        setCardFlipDirection(null);
        setIsAnimating(false);
      }, 250);
    }
  };

  // Prev Fact with 3D animation
  const handlePrevFact = () => {
    if (!selectedSubcategory || isAnimating) return;
    if (currentFactIndex > 0) {
      setIsAnimating(true);
      setIsFlipped(false);
      setCardFlipDirection('prev');
      setTimeout(() => {
        setCurrentFactIndex((prev) => prev - 1);
        setCardFlipDirection(null);
        setIsAnimating(false);
      }, 250);
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (factId: string) => {
    if (bookmarkedFacts.includes(factId)) {
      setBookmarkedFacts((prev) => prev.filter((id) => id !== factId));
      toast.success('Removed from Bookmarks');
    } else {
      setBookmarkedFacts((prev) => [...prev, factId]);
      toast.success('Fact Bookmarked!');
    }
  };

  // Learned Toggle
  const handleToggleLearned = (factId: string) => {
    if (learnedFacts.includes(factId)) {
      setLearnedFacts((prev) => prev.filter((id) => id !== factId));
      toast('Marked as Unread', { icon: '🔄' });
    } else {
      setLearnedFacts((prev) => [...prev, factId]);
      toast.success('Great job! Marked as Learned.');
    }
  };

  // Copy Fact Text
  const handleCopyFact = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Fact text copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-To-Speech Audio
  const handleSpeakFact = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Helper icon getter
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-6 h-6" />;
      case 'Scale': return <Scale className="w-6 h-6" />;
      case 'Compass': return <Compass className="w-6 h-6" />;
      case 'Atom': return <Atom className="w-6 h-6" />;
      case 'Trophy': return <Trophy className="w-6 h-6" />;
      default: return <Brain className="w-6 h-6" />;
    }
  };

  // Filter Categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.subcategories.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Current fact item
  const currentFact: FactItem | undefined = selectedSubcategory?.facts[currentFactIndex];
  const totalSubCategoryFacts = selectedSubcategory?.facts.length || 0;
  const isCurrentBookmarked = currentFact ? bookmarkedFacts.includes(currentFact.id) : false;
  const isCurrentLearned = currentFact ? learnedFacts.includes(currentFact.id) : false;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 font-sans text-slate-800">
      {/* Light Theme Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {view !== 'categories' ? (
              <button
                onClick={view === 'facts' ? handleBackToSubcategories : handleBackToCategories}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">GK Preparation</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
                  Interactive 3D Cards
                </span>
              </div>
              <p className="text-slate-500 text-xs md:text-sm font-medium">
                {view === 'categories' && 'Select a General Knowledge category to explore structured bite-sized facts.'}
                {view === 'subcategories' && `Viewing sub-categories for ${selectedCategory?.name}`}
                {view === 'facts' && `${selectedCategory?.name} › ${selectedSubcategory?.name}`}
              </p>
            </div>
          </div>

          {/* Top Quick Actions / Navigation */}
          {/* <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('gk-dashboard')}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                GK Dashboard
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('gk-exams')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Take GK Exam
              </button>
            )}
          </div> */}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-8">
        
        {/* ========================================================= */}
        {/* VIEW 1: CATEGORIES GRID                                    */}
        {/* ========================================================= */}
        {view === 'categories' && (
          <div className="space-y-6">
            {/* Search & Stats Bar */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search categories or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end text-xs font-semibold text-slate-500 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>{categories.length} Core Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>{bookmarkedFacts.length} Bookmarked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>{learnedFacts.length} Mastered</span>
                </div>
              </div>
            </div>

            {/* Categories Header */}
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Explore Knowledge Categories
              </h2>
              <p className="text-xs text-slate-500 mt-1">Select a category to view its sub-categories and count of facts.</p>
            </div>

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                    <div className="h-4 bg-slate-100 rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-md mx-auto my-12">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Categories Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">No categories match your search term "{searchQuery}".</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              /* Categories Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => {
                  const totalSubCount = category.subcategories.length;
                  const totalFactsCount = category.subcategories.reduce(
                    (acc, sub) => acc + sub.facts.length,
                    0
                  );

                  return (
                    <div
                      key={category.id}
                      onClick={() => handleSelectCategory(category)}
                      className="group bg-white rounded-2xl border border-slate-200/90 p-6 hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top Accent Gradient Line */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${category.color}`} />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} text-white flex items-center justify-center shadow-md shadow-indigo-100`}>
                            {getCategoryIcon(category.iconName)}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${category.accentBg} ${category.accentText}`}>
                            {totalSubCount} Sub-categories
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                          {category.name}
                        </h3>

                        <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                          {category.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>{totalFactsCount} Total Facts</span>
                        </div>

                        <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SUB-CATEGORIES SCREEN                             */}
        {/* ========================================================= */}
        {view === 'subcategories' && selectedCategory && (
          <div className="space-y-6">
            {/* Category Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-md relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${selectedCategory.color} opacity-15 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none`} />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCategory.color} text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0 mt-1`}>
                    {getCategoryIcon(selectedCategory.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-indigo-600">{selectedCategory.subcategories.length} Sub-categories</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-0.5">{selectedCategory.name}</h2>
                    <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">{selectedCategory.description}</p>
                  </div>
                </div>

                <button
                  onClick={handleBackToCategories}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 self-start md:self-center cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All Categories
                </button>
              </div>
            </div>

            {/* Sub-categories List Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Select Sub-category to Learn Facts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any card below to launch interactive 3D fact cards.</p>
              </div>
            </div>

            {/* Sub-categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory.subcategories.map((sub) => {
                const factCount = sub.facts.length;
                const learnedCount = sub.facts.filter((f) => learnedFacts.includes(f.id)).length;
                const progressPct = factCount > 0 ? Math.round((learnedCount / factCount) * 100) : 0;

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubcategory(sub)}
                    className="group bg-white rounded-2xl border border-slate-200/90 p-6 hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        {/* PROMINENT FACT COUNT BADGE */}
                        <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-200">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{factCount} Facts</span>
                        </div>

                        {learnedCount > 0 && (
                          <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                            <CheckCircle2 className="w-3 h-3" />
                            {learnedCount}/{factCount} Mastered
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                        {sub.name}
                      </h4>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>

                    {/* Progress Bar & CTA */}
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                      {factCount > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>MASTERY PROGRESS</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs font-black text-indigo-600 pt-1 group-hover:translate-x-1 transition-transform">
                        <span>Launch 3D Fact Cards</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: ONE-BY-ONE 3D FACT CARD WITH ARROWS & FLIP CARD    */}
        {/* ========================================================= */}
        {view === 'facts' && selectedSubcategory && currentFact && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Top Navigation & Breadcrumb Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-hidden text-xs md:text-sm">
                <button
                  onClick={handleBackToCategories}
                  className="font-bold text-slate-500 hover:text-slate-800 transition-colors truncate"
                >
                  {selectedCategory?.name}
                </button>
                <span className="text-slate-300">/</span>
                <button
                  onClick={handleBackToSubcategories}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors truncate"
                >
                  {selectedSubcategory.name}
                </button>
              </div>

              {/* Counter Pill */}
              <div className="px-3.5 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 font-black text-xs rounded-full shrink-0 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fact {currentFactIndex + 1} of {totalSubCategoryFacts}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentFactIndex + 1) / totalSubCategoryFacts) * 100}%` }}
              />
            </div>

            {/* ULTRA 3D CARD WRAPPER WITH INTERACTIVE PERSPECTIVE */}
            <div className="relative py-6 px-2 md:px-14 flex items-center justify-center">
              
              {/* GLOWING 3D LEFT ARROW BUTTON */}
              <button
                onClick={handlePrevFact}
                disabled={currentFactIndex === 0 || isAnimating}
                className={`absolute left-0 md:-left-3 z-30 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-[0_10px_30px_rgba(79,70,229,0.18)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.3)] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-800 transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  currentFactIndex === 0 ? 'opacity-30' : 'hover:scale-110 active:scale-95'
                }`}
                title="Previous Fact (Left Arrow Key)"
              >
                <ChevronLeft className="w-8 h-8 stroke-[3]" />
              </button>

              {/* GLOWING 3D RIGHT ARROW BUTTON */}
              <button
                onClick={handleNextFact}
                disabled={currentFactIndex === totalSubCategoryFacts - 1 || isAnimating}
                className={`absolute right-0 md:-right-3 z-30 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-[0_10px_30px_rgba(79,70,229,0.18)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.3)] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-800 transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  currentFactIndex === totalSubCategoryFacts - 1 ? 'opacity-30' : 'hover:scale-110 active:scale-95'
                }`}
                title="Next Fact (Right Arrow Key)"
              >
                <ChevronRight className="w-8 h-8 stroke-[3]" />
              </button>

              {/* 3D PERSPECTIVE STACK CONTAINER */}
              <div 
                className="w-full relative perspective-[1400px]"
                style={{ perspective: '1400px' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* 3D STACKED DECK CARDS (Behind Active Card for physical depth) */}
                <div className="absolute inset-0 bg-slate-200/60 rounded-3xl transform scale-[0.93] translate-y-5 opacity-40 border border-slate-300 pointer-events-none shadow-md" />
                <div className="absolute inset-0 bg-indigo-100/50 rounded-3xl transform scale-[0.96] translate-y-2.5 opacity-70 border border-indigo-200 pointer-events-none shadow-lg" />

                {/* MAIN 3D FLIP & TILT CARD */}
                <div
                  className={`w-full relative min-h-[380px] rounded-3xl transition-all duration-500 transform-gpu cursor-grab ${
                    cardFlipDirection === 'next'
                      ? 'rotate-y-25 -translate-x-12 opacity-60 scale-90'
                      : cardFlipDirection === 'prev'
                      ? '-rotate-y-25 translate-x-12 opacity-60 scale-90'
                      : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: cardFlipDirection 
                      ? undefined 
                      : `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg)`,
                    transition: isAnimating || tilt.x !== 0 ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {/* FRONT SIDE OF THE 3D CARD */}
                  <div
                    className="w-full min-h-[380px] bg-gradient-to-b from-white via-slate-50/50 to-indigo-50/20 rounded-3xl border-2 border-indigo-100 p-7 md:p-10 shadow-[0_25px_60px_rgba(79,70,229,0.2)] hover:shadow-[0_30px_70px_rgba(79,70,229,0.28)] flex flex-col justify-between relative overflow-hidden backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Glowing Top Rainbow Bar */}
                    <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                    
                    {/* Watermark Quote Icon */}
                    <span className="absolute -right-6 -bottom-10 text-[180px] font-serif text-indigo-500/5 select-none pointer-events-none leading-none">
                      ”
                    </span>

                    {/* Top Row: Floating Tag & Action Pill Badges */}
                    <div className="flex items-center justify-between gap-2 z-10">
                      <span className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200">
                        <Lightbulb className="w-4 h-4 text-amber-300" />
                        {currentFact.tag || 'GK Fact Highlight'}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Audio TTS Button */}
                        <button
                          onClick={() => handleSpeakFact(currentFact.statement)}
                          className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                            isSpeaking
                              ? 'bg-amber-50 border-amber-400 text-amber-600 animate-pulse scale-105'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                          title="Listen to Fact (Audio)"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => handleToggleBookmark(currentFact.id)}
                          className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                            isCurrentBookmarked
                              ? 'bg-amber-50 border-amber-400 text-amber-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                          title={isCurrentBookmarked ? 'Bookmarked' : 'Bookmark Fact'}
                        >
                          {isCurrentBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-500" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyFact(currentFact.statement, currentFact.id)}
                          className="p-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer shadow-xs"
                          title="Copy Fact Text"
                        >
                          {copiedId === currentFact.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Statement Content */}
                    <div className="my-6 z-10 flex-1 flex flex-col justify-center">
                      <p className="text-2xl md:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                        "{currentFact.statement}"
                      </p>

                      {/* Key Terms */}
                      {currentFact.keyTerms && currentFact.keyTerms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-6">
                          {currentFact.keyTerms.map((term, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-indigo-50/80 border border-indigo-200 text-indigo-800 rounded-lg text-xs font-bold shadow-2xs"
                            >
                              #{term}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Row with 3D Flip Trigger & Master Button */}
                    <div className="pt-5 border-t-2 border-slate-100 flex items-center justify-between z-10">
                      <button
                        onClick={() => handleToggleLearned(currentFact.id)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                          isCurrentLearned
                            ? 'bg-emerald-500 text-white shadow-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isCurrentLearned ? 'text-white' : 'text-slate-500'}`} />
                        <span>{isCurrentLearned ? 'Learned & Mastered ✓' : 'Mark as Learned'}</span>
                      </button>

                      {currentFact.context && (
                        <button
                          onClick={() => setIsFlipped(true)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-200 flex items-center gap-2 cursor-pointer hover:scale-105"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Flip Card for Context</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BACK SIDE OF THE 3D CARD (Context & Explanation) */}
                  <div
                    className="w-full min-h-[380px] bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl border-2 border-purple-400 p-7 md:p-10 shadow-[0_25px_60px_rgba(79,70,229,0.35)] flex flex-col justify-between absolute inset-0 overflow-hidden transform-gpu"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/30 border border-purple-400 text-purple-200 font-extrabold text-xs flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Did You Know? / Detailed Context
                      </span>

                      <button
                        onClick={() => setIsFlipped(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Flip Back
                      </button>
                    </div>

                    <div className="my-6 z-10 flex-1 flex flex-col justify-center">
                      <p className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed">
                        {currentFact.context}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-purple-800/60 flex items-center justify-between text-xs text-purple-200 font-medium z-10">
                      <span>Sub-category: {selectedSubcategory.name}</span>
                      <button
                        onClick={() => setIsFlipped(false)}
                        className="text-amber-300 hover:underline font-bold"
                      >
                        Return to Fact Statement →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DOTS NAVIGATOR / INDEX JUMP STRIP */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-center gap-2 flex-wrap">
              {selectedSubcategory.facts.map((fact, idx) => {
                const isLearned = learnedFacts.includes(fact.id);
                const isCurrent = idx === currentFactIndex;

                return (
                  <button
                    key={fact.id}
                    onClick={() => {
                      setIsAnimating(true);
                      setIsFlipped(false);
                      setCardFlipDirection(idx > currentFactIndex ? 'next' : 'prev');
                      setTimeout(() => {
                        setCurrentFactIndex(idx);
                        setCardFlipDirection(null);
                        setIsAnimating(false);
                      }, 200);
                    }}
                    className={`w-9 h-9 rounded-xl font-black text-xs transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-300 scale-110'
                        : isLearned
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={`Jump to Fact ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

