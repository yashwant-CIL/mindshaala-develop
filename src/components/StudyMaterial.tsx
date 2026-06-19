import { useState } from 'react';
import { 
  FileText, Video, Download, Eye, BookOpen, Folder,
  Search, Filter, Grid, List, Clock, Star, Share2,
  Play, ChevronRight, File, Image as ImageIcon, Link as LinkIcon,
  CheckCircle, Bookmark, Heart, TrendingUp, Calendar, Award,
  Lightbulb, ExternalLink, Zap, Target, Brain, Headphones
} from 'lucide-react';
import { InteractiveStudyMaterial } from './InteractiveStudyMaterial';

interface StudyMaterialProps {
  onNavigateToCourses?: () => void;
}

export function StudyMaterial({ onNavigateToCourses }: StudyMaterialProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [interactiveMaterial, setInteractiveMaterial] = useState<{ id: number; type: 'video' | 'notes' | 'audio'; title: string; subject: string } | null>(null);

  const categories = ['All', 'Notes', 'Videos', 'Practice Papers', 'Reference Books', 'Formulas', 'Mind Maps'];
  const subjects = ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'English'];

  // Recently Accessed Materials
  const recentlyAccessed = [
    {
      id: 1,
      title: 'Mechanics - Complete Notes',
      type: 'PDF',
      subject: 'Physics',
      accessedTime: '2 hours ago',
      size: '12.5 MB',
    },
    {
      id: 3,
      title: 'Calculus Formula Sheet',
      type: 'PDF',
      subject: 'Math',
      accessedTime: '5 hours ago',
      size: '2.3 MB',
    },
    {
      id: 2,
      title: 'Organic Chemistry Reactions',
      type: 'Video',
      subject: 'Chemistry',
      accessedTime: 'Yesterday',
      duration: '2h 45m',
    },
  ];

  const materials = [
    {
      id: 1,
      title: 'Mechanics - Complete Notes with Diagrams',
      subject: 'Physics',
      category: 'Notes',
      type: 'PDF',
      size: '12.5 MB',
      pages: 145,
      downloads: 1234,
      rating: 4.8,
      uploadedBy: 'Dr. Rajesh Kumar',
      uploadDate: '2024-01-15',
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
      description: 'Comprehensive notes covering all mechanics topics with detailed diagrams',
      topics: ['Kinematics', 'Dynamics', 'Work & Energy', 'Momentum'],
      views: 5678,
      bookmarked: true,
      relatedCourse: {
        name: 'Physics - Complete JEE/NEET Course',
        progress: 65,
      },
    },
    {
      id: 2,
      title: 'Organic Chemistry Reaction Mechanisms',
      subject: 'Chemistry',
      category: 'Videos',
      type: 'Video',
      duration: '2h 45m',
      size: '856 MB',
      downloads: 987,
      rating: 4.9,
      uploadedBy: 'Prof. Anita Sharma',
      uploadDate: '2024-02-01',
      thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop',
      description: 'Step-by-step video explanations of all major organic reactions',
      topics: ['Substitution', 'Elimination', 'Addition', 'Redox'],
      views: 3456,
      bookmarked: false,
      relatedCourse: {
        name: 'Chemistry - Organic Chemistry Mastery',
        progress: 82,
      },
    },
    {
      id: 3,
      title: 'Calculus Formula Sheet - JEE Advanced',
      subject: 'Math',
      category: 'Formulas',
      type: 'PDF',
      size: '2.3 MB',
      pages: 12,
      downloads: 2345,
      rating: 4.7,
      uploadedBy: 'Dr. Vikram Singh',
      uploadDate: '2024-01-20',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      description: 'All important calculus formulas in one place',
      topics: ['Differentiation', 'Integration', 'Limits', 'Applications'],
      views: 8901,
      bookmarked: true,
      relatedCourse: {
        name: 'Mathematics - Calculus & Algebra',
        progress: 45,
      },
    },
    {
      id: 4,
      title: 'Cell Biology - Mind Map',
      subject: 'Biology',
      category: 'Mind Maps',
      type: 'Image',
      size: '5.6 MB',
      downloads: 876,
      rating: 4.6,
      uploadedBy: 'Dr. Priya Menon',
      uploadDate: '2024-02-05',
      thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
      description: 'Visual representation of cell structure and functions',
      topics: ['Cell Structure', 'Organelles', 'Cell Division', 'DNA'],
      views: 2345,
      bookmarked: false,
      relatedCourse: {
        name: 'Biology - Cell Biology & Genetics',
        progress: 30,
      },
    },
    {
      id: 5,
      title: 'JEE Main 2023 - Physics Solved Paper',
      subject: 'Physics',
      category: 'Practice Papers',
      type: 'PDF',
      size: '8.9 MB',
      pages: 45,
      downloads: 3456,
      rating: 4.9,
      uploadedBy: 'Dr. Rajesh Kumar',
      uploadDate: '2024-01-10',
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
      description: 'Complete solutions with explanations for JEE Main 2023',
      topics: ['All Topics', 'Step-by-step Solutions', 'Tips & Tricks'],
      views: 6789,
      bookmarked: true,
      relatedCourse: {
        name: 'Physics - Complete JEE/NEET Course',
        progress: 65,
      },
    },
    {
      id: 6,
      title: 'NCERT Chemistry - Complete Solutions',
      subject: 'Chemistry',
      category: 'Reference Books',
      type: 'PDF',
      size: '45.2 MB',
      pages: 456,
      downloads: 1567,
      rating: 4.8,
      uploadedBy: 'Prof. Anita Sharma',
      uploadDate: '2023-12-15',
      thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop',
      description: 'Detailed solutions for all NCERT Chemistry textbook problems',
      topics: ['Class 11 & 12', 'All Chapters', 'Detailed Explanations'],
      views: 4567,
      bookmarked: false,
      relatedCourse: null,
    },
    {
      id: 7,
      title: 'Trigonometry Tricks & Shortcuts',
      subject: 'Math',
      category: 'Videos',
      type: 'Video',
      duration: '1h 30m',
      size: '456 MB',
      downloads: 2134,
      rating: 4.8,
      uploadedBy: 'Dr. Vikram Singh',
      uploadDate: '2024-01-25',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      description: 'Quick methods to solve trigonometry problems faster',
      topics: ['Identities', 'Equations', 'Graphs', 'Applications'],
      views: 5432,
      bookmarked: true,
      relatedCourse: {
        name: 'Mathematics - Calculus & Algebra',
        progress: 45,
      },
    },
    {
      id: 8,
      title: 'Genetics - Complete Chapter Notes',
      subject: 'Biology',
      category: 'Notes',
      type: 'PDF',
      size: '15.3 MB',
      pages: 78,
      downloads: 1876,
      rating: 4.7,
      uploadedBy: 'Dr. Priya Menon',
      uploadDate: '2024-02-08',
      thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
      description: 'Comprehensive genetics notes with Punnett squares and examples',
      topics: ['Mendelian Genetics', 'DNA', 'Inheritance Patterns'],
      views: 3210,
      bookmarked: false,
      relatedCourse: {
        name: 'Biology - Cell Biology & Genetics',
        progress: 30,
      },
    },
    {
      id: 9,
      title: 'Essay Writing Masterclass',
      subject: 'English',
      category: 'Videos',
      type: 'Video',
      duration: '45m',
      size: '234 MB',
      downloads: 1543,
      rating: 4.6,
      uploadedBy: 'Ms. Kavita Nair',
      uploadDate: '2024-01-30',
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
      description: 'Learn to write high-scoring essays for exams',
      topics: ['Structure', 'Vocabulary', 'Examples', 'Tips'],
      views: 2987,
      bookmarked: true,
      relatedCourse: {
        name: 'English - Grammar & Comprehension',
        progress: 90,
      },
    },
  ];

  const filteredMaterials = materials.filter(material => {
    const categoryMatch = selectedCategory === 'all' || material.category === selectedCategory;
    const subjectMatch = selectedSubject === 'all' || material.subject === selectedSubject;
    const bookmarkMatch = !bookmarkedOnly || material.bookmarked;
    return categoryMatch && subjectMatch && bookmarkMatch;
  });

  const stats = {
    totalMaterials: materials.length,
    totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
    bookmarked: materials.filter(m => m.bookmarked).length,
    recentlyAdded: materials.filter(m => {
      const uploadDate = new Date(m.uploadDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length,
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'Video': return <Video className="w-4 h-4" />;
      case 'Image': return <ImageIcon className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Interactive Study Material Modal */}
      {interactiveMaterial && (
        <InteractiveStudyMaterial
          materialId={interactiveMaterial.id}
          materialType={interactiveMaterial.type}
          title={interactiveMaterial.title}
          subject={interactiveMaterial.subject}
          onClose={() => setInteractiveMaterial(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2">Study Material</h1>
              <p className="text-sm text-white/90">Access notes, videos, and resources - linked to your courses</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4" />
                <span className="text-xs">Total Materials</span>
              </div>
              <p className="text-2xl">{stats.totalMaterials}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4" />
                <span className="text-xs">Total Downloads</span>
              </div>
              <p className="text-2xl">{stats.totalDownloads.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="w-4 h-4" />
                <span className="text-xs">Bookmarked</span>
              </div>
              <p className="text-2xl">{stats.bookmarked}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Recently Added</span>
              </div>
              <p className="text-2xl">{stats.recentlyAdded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Recently Accessed - Quick Access */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm text-gray-900">Quick Access - Recently Viewed</h2>
            </div>
            <button
              onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 ${
                bookmarkedOnly
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${bookmarkedOnly ? 'fill-white' : ''}`} />
              Bookmarked Only
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {recentlyAccessed.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs text-gray-900 mb-1 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.subject}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{item.accessedTime}</span>
                    </div>
                    <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      Open
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials... (Try: JEE Mains physics, NEET biology notes)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? 'all' : category)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  (selectedCategory === 'all' && category === 'All') || selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject === 'All' ? 'all' : subject)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  (selectedSubject === 'all' && subject === 'All') || selectedSubject === subject
                    ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-6 mb-8">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-blue-100 to-cyan-100">
                  <img
                    src={material.thumbnail}
                    alt={material.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white flex items-center gap-1">
                    {getIcon(material.type)}
                    <span>{material.type}</span>
                  </div>
                  {material.bookmarked && (
                    <div className="absolute top-3 left-3 p-2 bg-yellow-500 rounded-full">
                      <Bookmark className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {material.subject}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {material.category}
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-900 mb-1 line-clamp-2">{material.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{material.description}</p>
                  </div>

                  {/* Related Course Connection */}
                  {material.relatedCourse && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3 h-3 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-1">Related Course:</p>
                          <p className="text-xs text-indigo-900 mb-1 truncate">{material.relatedCourse.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-indigo-200 rounded-full h-1">
                              <div
                                className="bg-indigo-600 h-1 rounded-full"
                                style={{ width: `${material.relatedCourse.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-indigo-600">{material.relatedCourse.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{material.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{material.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{material.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {material.type === 'Video' ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{material.duration}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3" />
                          <span>{material.pages} pages</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {material.topics.slice(0, 3).map((topic, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1">
                      {material.type === 'Video' ? (
                        <>
                          <Play className="w-3 h-3" />
                          Watch
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          Download
                        </>
                      )}
                    </button>
                    <button className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs transition-all">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs transition-all">
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By {material.uploadedBy}</span>
                      <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4 mb-8">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
                    <img
                      src={material.thumbnail}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                    {material.bookmarked && (
                      <div className="absolute top-2 left-2 p-1 bg-yellow-500 rounded-full">
                        <Bookmark className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {material.subject}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {material.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs">
                            {getIcon(material.type)}
                            <span className="text-gray-600">{material.type}</span>
                          </div>
                        </div>
                        <h3 className="text-sm text-gray-900 mb-1">{material.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{material.description}</p>

                        {/* Related Course in List View */}
                        {material.relatedCourse && (
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <Lightbulb className="w-3 h-3 text-indigo-600" />
                            <span className="text-gray-600">From:</span>
                            <span className="text-indigo-600">{material.relatedCourse.name}</span>
                            <span className="text-gray-500">({material.relatedCourse.progress}% complete)</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-700">{material.rating}</span>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {material.topics.map((topic, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{material.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{material.views.toLocaleString()}</span>
                        </div>
                        {material.type === 'Video' ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{material.duration}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{material.pages} pages • {material.size}</span>
                          </div>
                        )}
                        <span>By {material.uploadedBy}</span>
                      </div>

                      <div className="flex gap-2">
                        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-all flex items-center gap-1">
                          {material.type === 'Video' ? (
                            <>
                              <Play className="w-3 h-3" />
                              Watch
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              Download
                            </>
                          )}
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs transition-all">
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related Courses Suggestion */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg text-gray-900">Want Structured Learning?</h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            These materials are part of comprehensive courses. Enroll for structured learning with progress tracking!
          </p>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h3 className="text-sm text-gray-900 mb-2">Physics - Complete JEE/NEET</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-indigo-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="text-xs text-indigo-600">65%</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">3 materials from this course downloaded</p>
              <button
                onClick={onNavigateToCourses}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs transition-all"
              >
                Continue Course
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h3 className="text-sm text-gray-900 mb-2">Chemistry - Organic Mastery</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-indigo-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '82%' }} />
                </div>
                <span className="text-xs text-indigo-600">82%</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">2 materials from this course downloaded</p>
              <button
                onClick={onNavigateToCourses}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs transition-all"
              >
                Continue Course
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h3 className="text-sm text-gray-900 mb-2">Mathematics - Calculus & Algebra</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-xs text-gray-600">Not Enrolled</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Students who downloaded this material also enrolled</p>
              <button className="w-full bg-white hover:bg-gray-50 text-indigo-600 py-2 rounded-lg text-xs transition-all border-2 border-indigo-200">
                Explore Course
              </button>
            </div>
          </div>

          <button
            onClick={onNavigateToCourses}
            className="w-full bg-white hover:bg-gray-50 text-indigo-600 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 border-2 border-indigo-200"
          >
            View All My Courses
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}