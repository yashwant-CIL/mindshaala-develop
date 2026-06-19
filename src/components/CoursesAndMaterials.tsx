import { useState } from 'react';
import { 
  BookOpen, Clock, CheckCircle, Play, Lock, ChevronRight, 
  Trophy, Star, TrendingUp, Calendar, Download, Share2,
  Filter, Search, Grid, List, Award, Target, BarChart3,
  FileText, Video, Link as LinkIcon, ExternalLink, Lightbulb,
  ChevronDown, ChevronUp, Folder, File, Eye, Bookmark,
  Headphones, Image as ImageIcon, Brain, Zap
} from 'lucide-react';

interface CoursesAndMaterialsProps {
  onStartCourse?: () => void;
}

export function CoursesAndMaterials({ onStartCourse }: CoursesAndMaterialsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');
  const [expandedCourse, setExpandedCourse] = useState<number | null>(1);
  const [selectedSubject, setSelectedSubject] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Physics - Complete JEE/NEET Course',
      subject: 'Physics',
      level: 'Advanced',
      progress: 65,
      totalChapters: 35,
      completedChapters: 23,
      totalVideos: 420,
      watchedVideos: 273,
      instructor: 'Dr. Rajesh Kumar',
      rating: 4.8,
      enrolled: '2024-01-15',
      lastAccessed: '2 hours ago',
      status: 'in-progress',
      nextTopic: 'Electromagnetic Induction',
      estimatedCompletion: '2 weeks',
      certificateEligible: true,
      color: 'purple',
      chapters: [
        {
          id: 1,
          title: 'Mechanics',
          progress: 100,
          materials: [
            { name: 'Mechanics Complete Notes', type: 'PDF', size: '12.5 MB', downloads: 1234, icon: FileText },
            { name: 'Kinematics Video Lecture', type: 'Video', duration: '45 min', views: 567, icon: Video },
            { name: 'Dynamics Practice Problems', type: 'PDF', size: '5.6 MB', downloads: 987, icon: FileText },
          ]
        },
        {
          id: 2,
          title: 'Electromagnetism',
          progress: 60,
          materials: [
            { name: 'EM Theory Notes', type: 'PDF', size: '8.9 MB', downloads: 876, icon: FileText },
            { name: 'Maxwell Equations Explained', type: 'Video', duration: '1h 20m', views: 432, icon: Video },
            { name: 'EM Formula Sheet', type: 'PDF', size: '1.2 MB', downloads: 3456, icon: File },
          ]
        },
        {
          id: 3,
          title: 'Optics',
          progress: 30,
          materials: [
            { name: 'Optics Complete Guide', type: 'PDF', size: '6.7 MB', downloads: 654, icon: FileText },
            { name: 'Ray Optics Animations', type: 'Video', duration: '35 min', views: 321, icon: Video },
          ]
        }
      ],
      additionalResources: [
        { name: 'Physics Formulas JEE - Complete', type: 'PDF', size: '2.3 MB', downloads: 3456, icon: File },
        { name: 'Previous Year Questions (2010-2023)', type: 'PDF', size: '15.4 MB', downloads: 2341, icon: FileText },
        { name: 'Quick Revision Notes', type: 'PDF', size: '4.5 MB', downloads: 1987, icon: FileText },
      ]
    },
    {
      id: 2,
      title: 'Chemistry - Organic Chemistry Mastery',
      subject: 'Chemistry',
      level: 'Intermediate',
      progress: 82,
      totalChapters: 28,
      completedChapters: 23,
      totalVideos: 350,
      watchedVideos: 287,
      instructor: 'Prof. Anita Sharma',
      rating: 4.9,
      enrolled: '2024-01-10',
      lastAccessed: '1 day ago',
      status: 'in-progress',
      nextTopic: 'Carboxylic Acids',
      estimatedCompletion: '1 week',
      certificateEligible: true,
      color: 'green',
      chapters: [
        {
          id: 1,
          title: 'Basic Concepts',
          progress: 100,
          materials: [
            { name: 'Organic Chemistry Basics', type: 'PDF', size: '8.9 MB', downloads: 2341, icon: FileText },
            { name: 'IUPAC Nomenclature Guide', type: 'PDF', size: '3.2 MB', downloads: 1876, icon: FileText },
          ]
        },
        {
          id: 2,
          title: 'Reaction Mechanisms',
          progress: 85,
          materials: [
            { name: 'Organic Reaction Mechanisms', type: 'PDF', size: '8.9 MB', downloads: 2341, icon: FileText },
            { name: 'Named Reactions Cheat Sheet', type: 'PDF', size: '1.2 MB', downloads: 4567, icon: File },
            { name: 'Mechanism Animation Videos', type: 'Video', duration: '2h 45m', views: 987, icon: Video },
          ]
        },
        {
          id: 3,
          title: 'Functional Groups',
          progress: 70,
          materials: [
            { name: 'Alcohols & Phenols Notes', type: 'PDF', size: '5.4 MB', downloads: 765, icon: FileText },
            { name: 'Aldehydes & Ketones', type: 'PDF', size: '6.7 MB', downloads: 654, icon: FileText },
          ]
        }
      ],
      additionalResources: [
        { name: 'Organic Chemistry Mind Maps', type: 'Image', size: '12.3 MB', downloads: 3210, icon: ImageIcon },
        { name: 'Reaction Summary Chart', type: 'PDF', size: '3.4 MB', downloads: 2876, icon: File },
      ]
    },
    {
      id: 3,
      title: 'Mathematics - Calculus & Algebra',
      subject: 'Math',
      level: 'Advanced',
      progress: 45,
      totalChapters: 40,
      completedChapters: 18,
      totalVideos: 480,
      watchedVideos: 216,
      instructor: 'Dr. Vikram Singh',
      rating: 4.7,
      enrolled: '2024-02-01',
      lastAccessed: '3 hours ago',
      status: 'in-progress',
      nextTopic: 'Differential Equations',
      estimatedCompletion: '3 weeks',
      certificateEligible: true,
      color: 'orange',
      chapters: [
        {
          id: 1,
          title: 'Limits & Continuity',
          progress: 100,
          materials: [
            { name: 'Limits Theory Notes', type: 'PDF', size: '4.5 MB', downloads: 1234, icon: FileText },
            { name: 'Continuity Explained', type: 'Video', duration: '50 min', views: 765, icon: Video },
          ]
        },
        {
          id: 2,
          title: 'Differentiation',
          progress: 80,
          materials: [
            { name: 'Calculus Formula Sheet', type: 'PDF', size: '2.3 MB', downloads: 8901, icon: File },
            { name: 'Integration Techniques', type: 'PDF', size: '6.7 MB', downloads: 3210, icon: FileText },
            { name: 'Solved Examples - Advanced', type: 'PDF', size: '15.4 MB', downloads: 1876, icon: FileText },
          ]
        },
        {
          id: 3,
          title: 'Integration',
          progress: 20,
          materials: [
            { name: 'Integration Methods', type: 'PDF', size: '7.8 MB', downloads: 987, icon: FileText },
            { name: 'Definite Integrals Video', type: 'Video', duration: '1h 15m', views: 543, icon: Video },
          ]
        }
      ],
      additionalResources: [
        { name: 'JEE Advanced Math Papers (Last 10 Years)', type: 'PDF', size: '25.6 MB', downloads: 5432, icon: FileText },
        { name: 'Shortcut Formulas & Tricks', type: 'PDF', size: '3.2 MB', downloads: 4321, icon: File },
      ]
    },
  ];

  const filteredCourses = courses.filter(course => {
    if (filterStatus !== 'all' && course.status !== filterStatus) return false;
    if (selectedSubject !== 'all' && course.subject.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    return true;
  });

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          badge: 'bg-purple-100 text-purple-700',
          progress: 'bg-purple-500',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-700',
          progress: 'bg-green-500',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-700',
          progress: 'bg-orange-500',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700',
          progress: 'bg-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl text-gray-900 mb-2"> Study Materials</h1>
          <p className="text-sm text-gray-600">
            Access all your enrolled courses and related study materials in one place
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5 border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
              >
                <option value="all">All Subjects</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="math">Mathematics</option>
                <option value="biology">Biology</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
              >
                <option value="all">All Subjects</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Enrolled Courses</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">6</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">Study Materials</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">142</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-gray-600">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">64%</p>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const colors = getColorClasses(course.color);
            const isExpanded = expandedCourse === course.id;

            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Course Header */}
                <div className={`${colors.bg} border-b ${colors.border} p-5`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${colors.badge}`}>
                          {course.level}
                        </span>
                        {course.certificateEligible && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs">
                            <Award className="w-3 h-3" />
                            <span>Certificate</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.totalChapters} Chapters</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          <span>{course.totalVideos} Videos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Last accessed: {course.lastAccessed}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Overall Progress</span>
                            <span className={`text-xs font-bold ${colors.text}`}>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colors.progress} h-2 rounded-full transition-all`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        <span className="font-bold">Next:</span> {course.nextTopic} • Est. completion: {course.estimatedCompletion}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <button 
                        onClick={onStartCourse}
                        className={`px-4 py-2 ${colors.button} text-white rounded-lg transition-all flex items-center gap-2 text-sm font-bold`}
                      >
                        <Play className="w-4 h-4" />
                        Continue Learning
                      </button>
                      <button
                        onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                        className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-all flex items-center gap-2 text-sm font-bold"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Materials
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View All Materials
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Course Materials */}
                {isExpanded && (
                  <div className="p-5">
                    {/* Chapters with Materials */}
                    <div className="mb-5">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-600" />
                        Course Chapters & Materials
                      </h4>
                      <div className="space-y-3">
                        {course.chapters.map((chapter) => (
                          <div key={chapter.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="text-sm font-bold text-gray-900 mb-1">{chapter.title}</h5>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 max-w-xs">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className={`${colors.progress} h-1.5 rounded-full`}
                                        style={{ width: `${chapter.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-600">{chapter.progress}%</span>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                chapter.progress === 100 ? 'bg-green-100 text-green-700' :
                                chapter.progress > 50 ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {chapter.progress === 100 ? 'Completed' : 
                                 chapter.progress > 0 ? 'In Progress' : 'Not Started'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {chapter.materials.map((material, idx) => {
                                const Icon = material.icon;
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all cursor-pointer group"
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      material.type === 'Video' ? 'bg-red-100' : 'bg-blue-100'
                                    }`}>
                                      <Icon className={`w-4 h-4 ${
                                        material.type === 'Video' ? 'text-red-600' : 'text-blue-600'
                                      }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-gray-900 truncate">{material.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {material.size || material.duration} • {material.downloads || material.views} {material.type === 'Video' ? 'views' : 'downloads'}
                                      </p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Download className="w-4 h-4 text-gray-600" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Resources */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        Additional Resources & Reference Materials
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {course.additionalResources.map((resource, idx) => {
                          const Icon = resource.icon;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-3 border border-gray-200 hover:border-blue-300 rounded-lg transition-all cursor-pointer group"
                            >
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{resource.name}</p>
                                <p className="text-xs text-gray-500">
                                  {resource.type} • {resource.size}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {resource.downloads} downloads
                                </p>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try adjusting your filters or explore new courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
