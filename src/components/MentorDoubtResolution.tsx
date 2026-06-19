import { useState } from 'react';
import { ArrowLeft, Save, CheckCircle, ThumbsUp, MessageCircle, Send, X, FileText, Calendar, Info } from 'lucide-react';

interface MentorDoubtResolutionProps {
  onBack: () => void;
  doubtId: string;
}

export function MentorDoubtResolution({ onBack, doubtId }: MentorDoubtResolutionProps) {
  const [mentorReply, setMentorReply] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Form states
  const [requestInfoText, setRequestInfoText] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState('30');
  const [sessionNotes, setSessionNotes] = useState('');

  // Mock doubt data - in real app, fetch based on doubtId
  const doubt = {
    id: doubtId,
    student: {
      name: 'Rahul Sharma',
      initials: 'RS',
      grade: 'Class 10',
    },
    subject: 'Physics',
    topic: 'Wave Optics',
    timestamp: '2 hours ago',
    query: "I'm confused about the difference between interference and diffraction. In the single slit experiment, why do we get a central maximum that is twice as wide?",
    aiResponse: {
      content: `That's a great question, Rahul! Let's break it down:

**Interference** is typically caused by the superposition of waves from two coherent sources (like in Young's Double Slit Experiment).

**Diffraction** is the bending of waves around an obstacle or slit. In the single slit experiment, the light from different parts of the "same" slit interferes with itself.

**Why is the central maximum twice as wide?**

The condition for minima in single slit diffraction is given by:
$a \\sin \\theta = m\\lambda$ 

The first minimum occurs at $\\theta_1$: $a \\sin \\theta_1 = \\lambda$. The angular width of the central maximum extends from the first minimum on one side to the first minimum on the other side. This span is effectively twice the distance from the center to the first minimum, making the central bright fringe twice as wide as subsequent fringes.

The first minimum occurs at $m=±1$ on both sides of the central maximum, giving it an effective angular width of $2\\lambda/a$, making this central bright fringe twice as wide as the secondary maxima.`,
      timestamp: '1 hour ago',
    },
  };

  const handleMarkResolved = () => {
    setIsResolved(true);
    alert('Doubt marked as resolved successfully!');
  };

  const handleSendReply = () => {
    if (!mentorReply.trim()) return;
    alert('Your response has been sent to the student!');
    setMentorReply('');
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{doubt.subject}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">{doubt.topic}</span>
            </div>
            <h1 className="text-xl text-gray-900">Interference vs Diffraction Query</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleMarkResolved}
              disabled={isResolved}
              className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                isResolved
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {isResolved ? 'Resolved' : 'Mark Resolved'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Student Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                {doubt.student.initials}
              </div>
              <div>
                <p className="text-sm text-gray-900">{doubt.student.name}</p>
                <p className="text-xs text-gray-500">{doubt.student.grade} • {doubt.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Student Question */}
          <div className="flex justify-end">
            <div className="max-w-2xl">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-4">
                <p className="text-sm leading-relaxed">{doubt.query}</p>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">{doubt.timestamp}</p>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex justify-start">
            <div className="max-w-3xl">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div>
                  <p className="text-xs text-gray-900 mb-0.5">MindShaala AI</p>
                  <p className="text-xs text-gray-500">{doubt.aiResponse.timestamp}</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 ml-11">
                <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                  {doubt.aiResponse.content}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 ml-11">
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Helpful</span>
                </button>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mentor Reply Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-3">Your Response as Subject Mentor</h3>
            <div className="space-y-3">
              <textarea
                value={mentorReply}
                onChange={(e) => setMentorReply(e.target.value)}
                placeholder="Type your reply to add more context or clarify the AI's response..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  💡 Tip: Review the AI response and add your expert insights if needed
                </p>
                <button
                  onClick={handleSendReply}
                  disabled={!mentorReply.trim()}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setShowRequestInfoModal(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Request More Info
              </button>
              <button
                onClick={() => setShowResourcesModal(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Share Resources
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Schedule Session
              </button>
            </div>
          </div>

          {/* Related Doubts */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm text-gray-900 mb-4">Related Doubts from Other Students</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="text-sm text-gray-900 mb-1">Difference between constructive and destructive interference?</p>
                <p className="text-xs text-gray-500">Asked by Priya Patel • 1 day ago</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="text-sm text-gray-900 mb-1">How to calculate fringe width in Young's experiment?</p>
                <p className="text-xs text-gray-500">Asked by Amit Singh • 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request More Info Modal */}
      {showRequestInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">Request More Information</h3>
                  <p className="text-xs text-gray-500">Ask the student for additional details</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm text-gray-700 mb-2">
                Your Request <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requestInfoText}
                onChange={(e) => setRequestInfoText(e.target.value)}
                placeholder="E.g., Could you please share a photo of the specific problem or diagram you're referring to? Also, let me know which part is most confusing..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Be specific about what information you need
              </p>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowRequestInfoModal(false);
                  setRequestInfoText('');
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!requestInfoText.trim()) {
                    alert('Please enter your request first');
                    return;
                  }
                  alert(`Request sent to ${doubt.student.name}!`);
                  setShowRequestInfoModal(false);
                  setRequestInfoText('');
                }}
                disabled={!requestInfoText.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Resources Modal */}
      {showResourcesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">Share Learning Resources</h3>
                  <p className="text-xs text-gray-500">Provide helpful materials to the student</p>
                </div>
              </div>
              <button
                onClick={() => setShowResourcesModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder="E.g., Comprehensive Guide to Wave Optics"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Resource URL <span className="text-red-500">*</span>
                </label>
                <input
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="https://example.com/resource"
                  type="url"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  placeholder="Brief description of what this resource covers..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  💡 <strong>Quick Tip:</strong> Share video lectures, practice problems, or concept notes that directly relate to their doubt.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowResourcesModal(false);
                  setResourceTitle('');
                  setResourceUrl('');
                  setResourceDescription('');
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!resourceTitle.trim() || !resourceUrl.trim()) {
                    alert('Please fill in the required fields');
                    return;
                  }
                  alert(`Resources shared with ${doubt.student.name}!`);
                  setShowResourcesModal(false);
                  setResourceTitle('');
                  setResourceUrl('');
                  setResourceDescription('');
                }}
                disabled={!resourceTitle.trim() || !resourceUrl.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Share Resources
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">Schedule One-on-One Session</h3>
                  <p className="text-xs text-gray-500">Book a personal tutoring session with {doubt.student.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                  Session Agenda (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="E.g., We'll cover Wave Optics concepts, solve practice problems, and address all your doubts..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-900">
                  📅 <strong>Note:</strong> Both you and the student will receive calendar invites and reminders.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSessionDate('');
                  setSessionTime('');
                  setSessionDuration('30');
                  setSessionNotes('');
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!sessionDate || !sessionTime) {
                    alert('Please select date and time');
                    return;
                  }
                  alert(`Session scheduled with ${doubt.student.name} on ${sessionDate} at ${sessionTime} for ${sessionDuration} minutes!`);
                  setShowScheduleModal(false);
                  setSessionDate('');
                  setSessionTime('');
                  setSessionDuration('30');
                  setSessionNotes('');
                }}
                disabled={!sessionDate || !sessionTime}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}