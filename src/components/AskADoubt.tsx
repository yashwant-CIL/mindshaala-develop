import { useState, useRef } from 'react';
import { ArrowLeft, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AskADoubtProps {
  onBack: () => void;
}

export function AskADoubt({ onBack }: AskADoubtProps) {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [doubtType, setDoubtType] = useState<'conceptual' | 'question' | 'strategy'>('conceptual');
  const [question, setQuestion] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'English',
  ];

  const chapters = {
    Mathematics: ['Algebra', 'Trigonometry', 'Calculus', 'Geometry', 'Statistics'],
    Physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity', 'Magnetism'],
    Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Periodic Table'],
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Your doubt has been submitted! Our AI Tutor will respond shortly.');
    // Reset form
    setSubject('');
    setChapter('');
    setQuestion('');
    setAttachments([]);
    setIsUrgent(false);
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
          <span>Back</span>
        </button>
        <div>
          <h1 className="text-2xl text-gray-900">Ask a Doubt</h1>
          <p className="text-sm text-gray-500">Get instant help from our AI Tutor or Expert Mentors.</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className=" mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base text-gray-900 mb-1">Describe your problem</h3>
              <p className="text-xs text-gray-500">The more details you provide, the better answer you'll get.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Subject and Chapter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setChapter('');
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Chapter <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    disabled={!subject}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Chapter</option>
                    {subject && chapters[subject as keyof typeof chapters]?.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doubt Type */}
              <div>
                <label className="block text-sm text-gray-700 mb-3">
                  Doubt Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="doubtType"
                      value="conceptual"
                      checked={doubtType === 'conceptual'}
                      onChange={(e) => setDoubtType(e.target.value as any)}
                      className="peer sr-only"
                    />
                    <div className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50">
                      <p className="text-sm text-gray-900">Conceptual</p>
                    </div>
                  </label>

                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="doubtType"
                      value="question"
                      checked={doubtType === 'question'}
                      onChange={(e) => setDoubtType(e.target.value as any)}
                      className="peer sr-only"
                    />
                    <div className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50">
                      <p className="text-sm text-gray-900">Question Help</p>
                    </div>
                  </label>

                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="doubtType"
                      value="strategy"
                      checked={doubtType === 'strategy'}
                      onChange={(e) => setDoubtType(e.target.value as any)}
                      className="peer sr-only"
                    />
                    <div className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50">
                      <p className="text-sm text-gray-900">Exam Strategy</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Your Question */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Your Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., I didn't understand how conservation of momentum applies when..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                  required
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-blue-600">Click to upload image</p>
                    <p className="text-xs text-gray-500">Screenshots or photos of textbook problems</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                        <Upload className="w-4 h-4" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mark as Urgent */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mark as Urgent</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!subject || !chapter || !question}
                  className="flex-1 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask AI Tutor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
