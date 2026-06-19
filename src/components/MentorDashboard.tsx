import { useState } from 'react';
import { ArrowLeft, Search, AlertCircle, MessageSquare } from 'lucide-react';

interface MentorDashboardProps {
  onOpenResolution: (doubtId: string) => void;
}

type DoubtStatus = 'pending' | 'resolved';
type Priority = 'high' | 'medium' | 'low';

interface Doubt {
  id: string;
  student: {
    name: string;
    initials: string;
    grade: string;
  };
  subject: string;
  topic: string;
  query: string;
  status: DoubtStatus;
  priority: Priority;
  timeAgo: string;
  responseType: 'ai-responded' | 'not-responded';
}

export function MentorDashboard({ onOpenResolution }: MentorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const doubts: Doubt[] = [
    {
      id: '1',
      student: { name: 'Rahul Sharma', initials: 'RS', grade: 'Class 10' },
      subject: 'Physics',
      topic: 'Wave Optics',
      query: "I'm confused about the difference between interference and diffraction. In the single slit experiment, why do we get a central maximum that is twice as wide?",
      status: 'pending',
      priority: 'high',
      timeAgo: '2 hours ago',
      responseType: 'ai-responded',
    },
    {
      id: '2',
      student: { name: 'Priya Patel', initials: 'PP', grade: 'Class 10' },
      subject: 'Chemistry',
      topic: 'Organic Reactions',
      query: 'Can you explain the mechanism for SN1 reaction with an example? I understand SN2 but SN1 is confusing.',
      status: 'pending',
      priority: 'medium',
      timeAgo: '5 hours ago',
      responseType: 'ai-responded',
    },
    {
      id: '3',
      student: { name: 'Amit Singh', initials: 'AS', grade: 'Class 10' },
      subject: 'Math',
      topic: 'Calculus',
      query: 'How to solve this integration problem using substitution method? The limits are confusing me.',
      status: 'resolved',
      priority: 'low',
      timeAgo: '1 day ago',
      responseType: 'ai-responded',
    },
    {
      id: '4',
      student: { name: 'Sneha Desai', initials: 'SD', grade: 'Class 10' },
      subject: 'Physics',
      topic: 'Thermodynamics',
      query: 'What is the difference between isothermal and adiabatic processes? Can you provide real-world examples?',
      status: 'pending',
      priority: 'medium',
      timeAgo: '3 hours ago',
      responseType: 'ai-responded',
    },
    {
      id: '5',
      student: { name: 'Karan Mehta', initials: 'KM', grade: 'Class 10' },
      subject: 'Chemistry',
      topic: 'Electrochemistry',
      query: 'How do you calculate the EMF of a galvanic cell? The Nernst equation is confusing.',
      status: 'resolved',
      priority: 'high',
      timeAgo: '2 days ago',
      responseType: 'ai-responded',
    },
  ];

  const subjects = ['All Subjects', 'Physics', 'Chemistry', 'Math', 'Biology'];

  const filteredDoubts = doubts.filter(doubt => {
    const matchesTab = activeTab === 'pending' ? doubt.status === 'pending' : doubt.status === 'resolved';
    const matchesSubject = selectedSubject === 'all' || doubt.subject === selectedSubject;
    const matchesSearch = doubt.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doubt.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doubt.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSubject && matchesSearch;
  });

  const pendingCount = doubts.filter(d => d.status === 'pending').length;
  const resolvedCount = doubts.filter(d => d.status === 'resolved').length;

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Mentor Dashboard</h1>
            <p className="text-sm text-gray-500">Manage and resolve student doubts assigned to you.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'resolved'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Student Doubts Queue */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 p-5">
              <h2 className="text-base text-gray-900 mb-4">Student Doubts Queue</h2>
              
              {/* Filters */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search doubts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value.toLowerCase())}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject === 'All Subjects' ? 'all' : subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-5 text-xs text-gray-600">Student</th>
                    <th className="text-left py-3 px-5 text-xs text-gray-600">Subject & Topic</th>
                    <th className="text-left py-3 px-5 text-xs text-gray-600">Query Preview</th>
                    <th className="text-left py-3 px-5 text-xs text-gray-600">Priority</th>
                    <th className="text-left py-3 px-5 text-xs text-gray-600">Status</th>
                    <th className="text-left py-3 px-5 text-xs text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoubts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 mb-1">No doubts found</p>
                            <p className="text-xs text-gray-500">Try adjusting your filters</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDoubts.map((doubt) => (
                      <tr key={doubt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                              {doubt.student.initials}
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">{doubt.student.name}</p>
                              <p className="text-xs text-gray-500">{doubt.timeAgo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-sm text-gray-900 mb-1">{doubt.subject}</p>
                          <p className="text-xs text-gray-500">{doubt.topic}</p>
                        </td>
                        <td className="py-4 px-5 max-w-md">
                          <p className="text-sm text-gray-700 line-clamp-2">{doubt.query}</p>
                          {doubt.responseType === 'ai-responded' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              AI Responded
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2 py-1 rounded text-xs capitalize ${getPriorityColor(doubt.priority)}`}>
                            {doubt.priority}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {doubt.status === 'pending' ? (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              Open
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              Resolved
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => onOpenResolution(doubt.id)}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Reply
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">💡 Mentor Guidelines</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Respond to high-priority doubts within 2 hours</li>
                  <li>• Review AI responses before adding your input</li>
                  <li>• Use detailed explanations with examples for better understanding</li>
                  <li>• Mark doubts as resolved only after student confirmation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}