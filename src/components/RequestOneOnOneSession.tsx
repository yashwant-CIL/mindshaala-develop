import { useState } from 'react';
import { Calendar, Clock, User, BookOpen, CheckCircle, Video, Star, Filter, Search } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  subject: string;
  rating: number;
  totalSessions: number;
  initials: string;
  expertise: string[];
  availability: string;
  avatar: string;
}

interface UpcomingSession {
  id: string;
  mentor: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  topic: string;
  status: 'confirmed' | 'pending';
}

export function RequestOneOnOneSession() {
  const [activeTab, setActiveTab] = useState<'book' | 'upcoming' | 'past'>('book');
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      subject: 'Physics',
      rating: 4.9,
      totalSessions: 247,
      initials: 'PS',
      expertise: ['Mechanics', 'Optics', 'Thermodynamics'],
      availability: 'Available Today',
      avatar: 'from-blue-500 to-purple-500',
    },
    {
      id: '2',
      name: 'Prof. Rajesh Kumar',
      subject: 'Chemistry',
      rating: 4.8,
      totalSessions: 312,
      initials: 'RK',
      expertise: ['Organic Chemistry', 'Physical Chemistry'],
      availability: 'Available Tomorrow',
      avatar: 'from-green-500 to-teal-500',
    },
    {
      id: '3',
      name: 'Ms. Anjali Mehta',
      subject: 'Mathematics',
      rating: 5.0,
      totalSessions: 189,
      initials: 'AM',
      expertise: ['Calculus', 'Algebra', 'Trigonometry'],
      availability: 'Available Today',
      avatar: 'from-orange-500 to-red-500',
    },
    {
      id: '4',
      name: 'Dr. Sanjay Patel',
      subject: 'Biology',
      rating: 4.7,
      totalSessions: 156,
      initials: 'SP',
      expertise: ['Genetics', 'Ecology', 'Human Physiology'],
      availability: 'Available This Week',
      avatar: 'from-pink-500 to-purple-500',
    },
  ];

  const upcomingSessions: UpcomingSession[] = [
    {
      id: '1',
      mentor: 'Dr. Priya Sharma',
      subject: 'Physics',
      date: '2025-12-28',
      time: '15:00',
      duration: '60 min',
      topic: 'Wave Optics - Interference & Diffraction',
      status: 'confirmed',
    },
    {
      id: '2',
      mentor: 'Ms. Anjali Mehta',
      subject: 'Mathematics',
      date: '2025-12-30',
      time: '10:00',
      duration: '45 min',
      topic: 'Calculus - Integration Techniques',
      status: 'pending',
    },
  ];

  const pastSessions: UpcomingSession[] = [
    {
      id: '3',
      mentor: 'Prof. Rajesh Kumar',
      subject: 'Chemistry',
      date: '2025-12-20',
      time: '14:00',
      duration: '60 min',
      topic: 'Organic Reactions - SN1 & SN2',
      status: 'confirmed',
    },
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSubject = selectedSubject === 'all' || mentor.subject === selectedSubject;
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const handleBookSession = () => {
    if (!selectedMentor || !sessionDate || !sessionTime || !sessionTopic) {
      alert('Please fill in all required fields');
      return;
    }
    const mentor = mentors.find(m => m.id === selectedMentor);
    alert(`Session request sent to ${mentor?.name}!\n\nDate: ${sessionDate}\nTime: ${sessionTime}\nDuration: ${sessionDuration} minutes\nTopic: ${sessionTopic}`);
    setShowBookingModal(false);
    setSelectedMentor(null);
    setSessionDate('');
    setSessionTime('');
    setSessionDuration('60');
    setSessionTopic('');
    setSessionNotes('');
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl">One-on-One Mentoring</h1>
              <p className="text-sm text-blue-100">Schedule personalized sessions with expert mentors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-5 py-3 text-sm transition-colors border-b-2 ${
                activeTab === 'book'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Book Session
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-3 text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
              {upcomingSessions.length > 0 && (
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                  {upcomingSessions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-3 text-sm transition-colors border-b-2 ${
                activeTab === 'past'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'book' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search mentors by name, subject, or expertise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="all">All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
              </div>

              {/* Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${mentor.avatar} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                        <span className="text-lg">{mentor.initials}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm text-gray-900 mb-1">{mentor.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{mentor.subject}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-900">{mentor.rating}</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{mentor.totalSessions} sessions</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Expertise:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mentor.expertise.map((exp, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">{mentor.availability}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMentor(mentor.id);
                        setShowBookingModal(true);
                      }}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Session
                    </button>
                  </div>
                ))}
              </div>

              {filteredMentors.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-900 mb-1">No mentors found</p>
                  <p className="text-xs text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {session.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {session.subject}
                        </span>
                      </div>
                      <h3 className="text-base text-gray-900 mb-1">{session.topic}</h3>
                      <p className="text-sm text-gray-600 mb-3">with {session.mentor}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(session.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{session.time} • {session.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Reschedule
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Join Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {upcomingSessions.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-900 mb-1">No upcoming sessions</p>
                  <p className="text-xs text-gray-500 mb-4">Book a session with a mentor to get started</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Book Your First Session
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {session.subject}
                        </span>
                      </div>
                      <h3 className="text-base text-gray-900 mb-1">{session.topic}</h3>
                      <p className="text-sm text-gray-600 mb-3">with {session.mentor}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(session.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{session.time} • {session.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        View Notes
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Book Again
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">Book Session</h3>
                  <p className="text-sm text-gray-500">
                    with {mentors.find(m => m.id === selectedMentor)?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedMentor(null);
                    setSessionDate('');
                    setSessionTime('');
                    setSessionDuration('60');
                    setSessionTopic('');
                    setSessionNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1 hour 30 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Topic/Focus Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="E.g., Wave Optics - Interference & Diffraction"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Mention specific doubts or topics you'd like to cover..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900">
                  💡 <strong>Session Guidelines:</strong> Come prepared with specific questions. The mentor will send you a meeting link 15 minutes before the session.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedMentor(null);
                  setSessionDate('');
                  setSessionTime('');
                  setSessionDuration('60');
                  setSessionTopic('');
                  setSessionNotes('');
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSession}
                disabled={!sessionDate || !sessionTime || !sessionTopic}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
