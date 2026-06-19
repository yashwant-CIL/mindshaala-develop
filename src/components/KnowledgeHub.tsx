import { useState } from 'react';
import { 
  Lightbulb, Search, TrendingUp, BookOpen, Video, FileText, 
  Headphones, Award, Star, Clock, Play, Bookmark, ExternalLink,
  Sparkles, Flame, Brain, Globe, Heart, Users, Zap
} from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  type: 'article' | 'video' | 'podcast' | 'interactive';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  tags: string[];
  views: number;
  rating: number;
  trending?: boolean;
  featured?: boolean;
}

export function KnowledgeHub() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: Lightbulb, color: 'blue' },
    { id: 'science', label: 'Science & Tech', icon: Brain, color: 'purple' },
    { id: 'mathematics', label: 'Mathematics', icon: Zap, color: 'orange' },
    { id: 'general', label: 'General Knowledge', icon: Globe, color: 'green' },
    { id: 'current', label: 'Current Affairs', icon: TrendingUp, color: 'red' },
    { id: 'life', label: 'Life Skills', icon: Heart, color: 'pink' },
    { id: 'career', label: 'Career & College', icon: Award, color: 'indigo' },
  ];

  const knowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'The Science Behind Black Holes',
      category: 'science',
      type: 'video',
      duration: '12 min',
      difficulty: 'intermediate',
      description: 'Explore the fascinating physics of black holes, event horizons, and space-time curvature. Perfect for competitive exam aspirants.',
      tags: ['Physics', 'Astronomy', 'Space Science'],
      views: 12543,
      rating: 4.8,
      trending: true,
      featured: true,
    },
    {
      id: '2',
      title: 'Mental Math Tricks for Competitive Exams',
      category: 'mathematics',
      type: 'article',
      duration: '8 min read',
      difficulty: 'beginner',
      description: 'Learn quick calculation techniques that will save you precious time in JEE, NEET, and other competitive exams.',
      tags: ['Mental Math', 'Tricks', 'Speed Math'],
      views: 18920,
      rating: 4.9,
      trending: true,
    },
    {
      id: '3',
      title: 'Understanding Climate Change: A Scientific Perspective',
      category: 'science',
      type: 'interactive',
      duration: '20 min',
      difficulty: 'intermediate',
      description: 'Interactive module covering greenhouse effect, global warming, and environmental science concepts.',
      tags: ['Environment', 'Climate', 'Ecology'],
      views: 8456,
      rating: 4.7,
    },
    {
      id: '4',
      title: 'India\'s Space Missions: Chandrayaan to Gaganyaan',
      category: 'current',
      type: 'video',
      duration: '15 min',
      difficulty: 'beginner',
      description: 'Comprehensive overview of ISRO\'s achievements and upcoming missions. Essential for current affairs.',
      tags: ['ISRO', 'Space', 'Current Affairs'],
      views: 15234,
      rating: 4.9,
      featured: true,
    },
    {
      id: '5',
      title: 'The Golden Ratio in Nature and Mathematics',
      category: 'mathematics',
      type: 'article',
      duration: '10 min read',
      difficulty: 'intermediate',
      description: 'Discover how the Fibonacci sequence and golden ratio appear in nature, art, and architecture.',
      tags: ['Fibonacci', 'Golden Ratio', 'Patterns'],
      views: 9876,
      rating: 4.8,
    },
    {
      id: '6',
      title: 'Effective Study Techniques: Science-Backed Methods',
      category: 'life',
      type: 'podcast',
      duration: '25 min',
      difficulty: 'beginner',
      description: 'Learn evidence-based study strategies including spaced repetition, active recall, and the Feynman technique.',
      tags: ['Study Skills', 'Learning', 'Productivity'],
      views: 22341,
      rating: 5.0,
      trending: true,
    },
    {
      id: '7',
      title: 'Nobel Prize 2024: Physics & Chemistry Highlights',
      category: 'current',
      type: 'article',
      duration: '6 min read',
      difficulty: 'intermediate',
      description: 'Understanding the groundbreaking discoveries that won the 2024 Nobel Prizes in science.',
      tags: ['Nobel Prize', 'Science', 'Achievements'],
      views: 7823,
      rating: 4.6,
    },
    {
      id: '8',
      title: 'Famous Mathematicians Who Changed the World',
      category: 'general',
      type: 'video',
      duration: '18 min',
      difficulty: 'beginner',
      description: 'Stories of brilliant minds like Ramanujan, Euler, and Gauss who revolutionized mathematics.',
      tags: ['History', 'Mathematicians', 'Inspiration'],
      views: 11234,
      rating: 4.7,
    },
    {
      id: '9',
      title: 'Quantum Computing Explained Simply',
      category: 'science',
      type: 'interactive',
      duration: '15 min',
      difficulty: 'advanced',
      description: 'Demystifying qubits, superposition, and quantum entanglement with interactive examples.',
      tags: ['Quantum', 'Computing', 'Future Tech'],
      views: 6543,
      rating: 4.8,
    },
    {
      id: '10',
      title: 'Engineering College Selection Guide 2025',
      category: 'career',
      type: 'article',
      duration: '12 min read',
      difficulty: 'beginner',
      description: 'Comprehensive guide to choosing the right engineering college, branch, and career path after JEE.',
      tags: ['Engineering', 'College', 'Career'],
      views: 19876,
      rating: 4.9,
      featured: true,
    },
    {
      id: '11',
      title: 'Public Speaking & Communication Skills',
      category: 'life',
      type: 'video',
      duration: '22 min',
      difficulty: 'beginner',
      description: 'Master the art of confident communication and public speaking - essential life skills.',
      tags: ['Communication', 'Public Speaking', 'Confidence'],
      views: 14567,
      rating: 4.8,
    },
    {
      id: '12',
      title: 'World Geography: Countries & Capitals Quiz',
      category: 'general',
      type: 'interactive',
      duration: '10 min',
      difficulty: 'beginner',
      description: 'Test and improve your general knowledge with this interactive geography challenge.',
      tags: ['Geography', 'Quiz', 'GK'],
      views: 20123,
      rating: 4.7,
    },
  ];

  const filteredItems = knowledgeItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesType && matchesSearch;
  });

  const featuredItems = knowledgeItems.filter(item => item.featured);
  const trendingItems = knowledgeItems.filter(item => item.trending);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'podcast': return Headphones;
      case 'interactive': return Play;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl mb-1">Knowledge Hub</h1>
              <p className="text-sm text-white/90">Expand your horizons beyond textbooks</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">Resources</span>
              </div>
              <p className="text-xl">200+</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Learners</span>
              </div>
              <p className="text-xl">50K+</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-xs">Avg Rating</span>
              </div>
              <p className="text-xl">4.8</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">New Today</span>
              </div>
              <p className="text-xl">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics, articles, videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="article">Articles</option>
              <option value="podcast">Podcasts</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                    isActive
                      ? `bg-${category.color}-100 text-${category.color}-700 border border-${category.color}-300`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Featured Section */}
          {activeCategory === 'all' && !searchQuery && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg text-gray-900">Featured Content</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featuredItems.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-5 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 bg-white rounded-lg`}>
                          <TypeIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <Bookmark className="w-5 h-5 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors" />
                      </div>
                      <h3 className="text-sm text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Explore
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trending Section */}
          {activeCategory === 'all' && !searchQuery && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg text-gray-900">Trending Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {trendingItems.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 bg-orange-100 rounded-lg`}>
                          <TypeIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark className="w-4 h-4 text-gray-400 hover:text-orange-600 cursor-pointer transition-colors" />
                        </div>
                      </div>
                      <h3 className="text-sm text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-900">{item.rating}</span>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Content */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-gray-900">
                {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <p className="text-sm text-gray-500">{filteredItems.length} resources</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 bg-gray-100 rounded-lg`}>
                        <TypeIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <Bookmark className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                    </div>

                    <h3 className="text-sm text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">{item.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration}
                      </div>
                      <span className={`px-2 py-0.5 rounded ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-900">{item.rating}</span>
                        <span className="text-xs text-gray-400">({item.views.toLocaleString()} views)</span>
                      </div>
                    </div>

                    <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Start Learning
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-900 mb-1">No resources found</p>
                <p className="text-xs text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Daily Knowledge Nugget */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base mb-2">💡 Daily Knowledge Nugget</h3>
                <p className="text-sm text-white/90 mb-3">
                  Did you know? The speed of light is exactly 299,792,458 meters per second. This value is so fundamental that the meter is now defined based on the speed of light!
                </p>
                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
