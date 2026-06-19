import { useState } from 'react';
import { Upload, X, Sparkles } from 'lucide-react';

interface AskDoubtProps {
  onBack: () => void;
}

export function AskDoubt({ onBack }: AskDoubtProps) {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [doubtType, setDoubtType] = useState<'conceptual' | 'question-help' | 'exam-strategy'>('conceptual');
  const [question, setQuestion] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);

  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    setAttachments([...attachments, ...Array.from(files)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Your doubt has been submitted to our AI Tutor and Expert Mentors!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl text-gray-900 mb-1">Ask a Doubt</h1>
          <p className="text-xs text-gray-500">Get instant help from our AI Tutor or Expert Mentors.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
          {/* Describe Your Problem */}
          <div className="mb-4">
            <h3 className="text-xs text-gray-900 mb-1">Describe your problem</h3>
            <p className="text-xs text-gray-500 mb-3">The more details you provide, the better answer you'll get.</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Subject */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Chapter</label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Chapter</option>
                  {chapters.map((ch) => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Doubt Type */}
          <div className="mb-4">
            <label className="block text-xs text-gray-700 mb-2">Doubt Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDoubtType('conceptual')}
                className={`p-2 rounded-md border-2 transition-all text-xs ${
                  doubtType === 'conceptual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Conceptual
              </button>
              <button
                type="button"
                onClick={() => setDoubtType('question-help')}
                className={`p-2 rounded-md border-2 transition-all text-xs ${
                  doubtType === 'question-help'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Question Help
              </button>
              <button
                type="button"
                onClick={() => setDoubtType('exam-strategy')}
                className={`p-2 rounded-md border-2 transition-all text-xs ${
                  doubtType === 'exam-strategy'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Exam Strategy
              </button>
            </div>
          </div>

          {/* Your Question */}
          <div className="mb-4">
            <label className="block text-xs text-gray-700 mb-1.5">Your Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your doubt here... (e.g., I don't understand how conservation of momentum applies when...)"
              rows={5}
              className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Attachments */}
          <div className="mb-4">
            <label className="block text-xs text-gray-700 mb-1.5">Attachments (Optional)</label>
            
            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                      <p className="text-xs text-gray-600 px-1 text-center truncate">{file.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                <p className="text-xs text-gray-600 mb-0.5">Click to upload image</p>
                <p className="text-xs text-gray-500">Screenshots or photos of problems</p>
              </label>
            </div>
          </div>

          {/* Mark as Urgent */}
          <div className="mb-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-3.5 h-3.5 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <span className="text-xs text-gray-700">Mark as Urgent</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-xs text-blue-900 mb-1.5">💡 How it works</h4>
          <ul className="space-y-0.5 text-xs text-blue-800">
            <li>• AI Tutor responds instantly with detailed explanations</li>
            <li>• Expert Mentors review within 2 hours for complex doubts</li>
            <li>• Get step-by-step solutions with diagrams</li>
            <li>• All doubts saved for future reference</li>
          </ul>
        </div>
      </div>
    </div>
  );
}