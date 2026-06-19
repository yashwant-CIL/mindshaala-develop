import { BookOpen, Play, Lock, Clock, CheckCircle, Award, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MyCoursesPageProps {
  onStartCourse: () => void;
}

export function MyCoursesPage({ onStartCourse }: MyCoursesPageProps) {
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);

  const activeCourses = [
    {
      id: 1,
      title: 'ICSE Physics - Complete Course',
      subtitle: 'Class 10 • Light, Sound & Mechanics',
      progress: 68,
      totalLessons: 45,
      completedLessons: 31,
      duration: '24h 30m',
      nextLesson: 'Refraction of Light',
      gradient: 'from-purple-600 to-pink-600',
      status: 'active'
    },
    {
      id: 2,
      title: 'Mathematics - Quadratic Equations',
      subtitle: 'Class 10 • Advanced Problems',
      progress: 45,
      totalLessons: 32,
      completedLessons: 14,
      duration: '18h 45m',
      nextLesson: 'Word Problems Type 2',
      gradient: 'from-orange-600 to-red-600',
      status: 'active'
    },
    {
      id: 3,
      title: 'Organic Chemistry Basics',
      subtitle: 'Class 10 • IUPAC Nomenclature',
      progress: 30,
      totalLessons: 28,
      completedLessons: 8,
      duration: '15h 20m',
      nextLesson: 'Alkanes & Alkenes',
      gradient: 'from-green-600 to-teal-600',
      status: 'active'
    },
    {
      id: 4,
      title: 'English Literature - Drama',
      subtitle: 'Merchant of Venice',
      progress: 85,
      totalLessons: 20,
      completedLessons: 17,
      duration: '12h 15m',
      nextLesson: 'Character Analysis',
      gradient: 'from-blue-600 to-cyan-600',
      status: 'active'
    },
  ];

  const recommendedCourses = [
    {
      id: 5,
      title: 'MHT-CET Foundation',
      subtitle: 'Physics, Chemistry & Math',
      progress: 0,
      totalLessons: 120,
      completedLessons: 0,
      duration: '60h 00m',
      nextLesson: 'Introduction to MHT-CET',
      gradient: 'from-indigo-600 to-purple-600',
      status: 'recommended'
    },
    {
      id: 6,
      title: 'Advanced Mathematics',
      subtitle: 'Calculus & Trigonometry',
      progress: 0,
      totalLessons: 85,
      completedLessons: 0,
      duration: '45h 30m',
      nextLesson: 'Limits and Continuity',
      gradient: 'from-yellow-600 to-orange-600',
      status: 'recommended'
    },
    {
      id: 7,
      title: 'JEE Main Preparation',
      subtitle: 'Complete Syllabus Coverage',
      progress: 0,
      totalLessons: 150,
      completedLessons: 0,
      duration: '80h 00m',
      nextLesson: 'JEE Exam Pattern',
      gradient: 'from-rose-600 to-pink-600',
      status: 'recommended'
    },
    {
      id: 8,
      title: 'NEET Biology Foundation',
      subtitle: 'Botany & Zoology Basics',
      progress: 0,
      totalLessons: 95,
      completedLessons: 0,
      duration: '52h 15m',
      nextLesson: 'Cell Biology Introduction',
      gradient: 'from-emerald-600 to-green-600',
      status: 'recommended'
    },
  ];

  const recentlyWatched = [
    {
      title: 'Newton\'s Laws of Motion - Part 3',
      course: 'Physics',
      duration: '12:45',
      watchedAt: '2 hours ago',
      thumbnail: 'purple'
    },
    {
      title: 'Solving Quadratic Equations',
      course: 'Mathematics',
      duration: '18:30',
      watchedAt: '5 hours ago',
      thumbnail: 'orange'
    },
    {
      title: 'Organic Compounds Classification',
      course: 'Chemistry',
      duration: '15:20',
      watchedAt: 'Yesterday',
      thumbnail: 'green'
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl text-gray-900 mb-1">My Courses</h1>
        <p className="text-sm text-gray-600">
          Continue learning and track your progress
        </p>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Enrolled Courses</p>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">5</p>
          <p className="text-xs text-gray-500">4 active, 1 locked</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Lessons Completed</p>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">70</p>
          <p className="text-xs text-gray-500">out of 145 total</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Learning Hours</p>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">70h 50m</p>
          <p className="text-xs text-gray-500">Total time spent</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Certificates</p>
            <Award className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">2</p>
          <p className="text-xs text-gray-500">Earned so far</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main Content - 2 cols */}
        <div className="col-span-2 space-y-5">
          {/* Active Courses */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-900">My Active Courses</h3>
              {activeCourses.length > 1 && (
                <button
                  onClick={() => setShowAllActive(!showAllActive)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>{showAllActive ? 'Show Less' : `View All (${activeCourses.length})`}</span>
                  {showAllActive ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(showAllActive ? activeCourses : activeCourses.slice(0, 1)).map((course) => (
                <div
                  key={course.id}
                  className={`border-2 rounded-lg overflow-hidden transition-all ${
                    course.status === 'locked' 
                      ? 'border-gray-200 opacity-60' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`bg-gradient-to-r ${course.gradient} p-3 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm mb-0.5">{course.title}</h4>
                        <p className="text-xs text-white/90">{course.subtitle}</p>
                      </div>
                      {course.status === 'locked' && (
                        <Lock className="w-4 h-4 text-white/80" />
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-white/90">Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-white h-1.5 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Next Lesson:</p>
                        <p className="text-xs text-gray-900">{course.nextLesson}</p>
                      </div>
                      <button
                        onClick={onStartCourse}
                        disabled={course.status === 'locked'}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs transition-colors ${
                          course.status === 'locked'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{course.status === 'locked' ? 'Locked' : 'Continue'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-900">Recommended Courses</h3>
              {recommendedCourses.length > 1 && (
                <button
                  onClick={() => setShowAllRecommended(!showAllRecommended)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>{showAllRecommended ? 'Show Less' : `View All (${recommendedCourses.length})`}</span>
                  {showAllRecommended ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(showAllRecommended ? recommendedCourses : recommendedCourses.slice(0, 1)).map((course) => (
                <div
                  key={course.id}
                  className={`border-2 rounded-lg overflow-hidden transition-all ${
                    course.status === 'locked' 
                      ? 'border-gray-200 opacity-60' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`bg-gradient-to-r ${course.gradient} p-3 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm mb-0.5">{course.title}</h4>
                        <p className="text-xs text-white/90">{course.subtitle}</p>
                      </div>
                      {course.status === 'locked' && (
                        <Lock className="w-4 h-4 text-white/80" />
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-white/90">Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-white h-1.5 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Next Lesson:</p>
                        <p className="text-xs text-gray-900">{course.nextLesson}</p>
                      </div>
                      <button
                        onClick={onStartCourse}
                        disabled={course.status === 'locked'}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs transition-colors ${
                          course.status === 'locked'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{course.status === 'locked' ? 'Locked' : 'Continue'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Recently Watched */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-900 mb-3">Recently Watched</h3>
            <div className="space-y-2">
              {recentlyWatched.map((video, idx) => (
                <div
                  key={idx}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${
                      video.thumbnail === 'purple' ? 'bg-purple-100' :
                      video.thumbnail === 'orange' ? 'bg-orange-100' : 'bg-green-100'
                    }`}>
                      <Play className={`w-4 h-4 ${
                        video.thumbnail === 'purple' ? 'text-purple-600' :
                        video.thumbnail === 'orange' ? 'text-orange-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-900 mb-0.5">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.course}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{video.duration}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{video.watchedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Streak */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <div>
                <h3 className="text-sm">Learning Streak</h3>
                <p className="text-xs text-orange-100">Keep it up!</p>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-4xl mb-1">12</p>
              <p className="text-sm text-orange-100">Days in a row</p>
            </div>
          </div>

          {/* Certificates Earned */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-yellow-600" />
              <h3 className="text-sm text-gray-900">Certificates</h3>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-900">Physics Chapter 1-3</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-900">Math Basics</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-900 mb-3">Weekly Goal</h3>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Lessons Watched</span>
                  <span className="text-gray-900">8/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Study Hours</span>
                  <span className="text-gray-900">32/35h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '91%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}