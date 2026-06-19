import { useState } from 'react';
import { 
  ArrowLeft,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';

interface TheoryTestPageProps {
  onBack: () => void;
  onSubmit: () => void;
}

interface Question {
  id: number;
  text: string;
  marks: number;
  section: string;
  uploadedImages: File[];
  status: 'not-attempted' | 'attempting' | 'completed';
}

export function TheoryTestPage({ onBack, onSubmit }: TheoryTestPageProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "State Snell's Law of refraction. Define refractive index.",
      marks: 3,
      section: 'SECTION A (40 MARKS)',
      uploadedImages: [],
      status: 'attempting',
    },
    {
      id: 2,
      text: 'Draw a ray diagram to show the formation of image by a convex lens when the object is placed between F and 2F.',
      marks: 5,
      section: 'SECTION A (40 MARKS)',
      uploadedImages: [],
      status: 'not-attempted',
    },
    {
      id: 3,
      text: 'Explain the concept of work-energy theorem. Derive the formula for kinetic energy.',
      marks: 5,
      section: 'SECTION B (30 MARKS)',
      uploadedImages: [],
      status: 'not-attempted',
    },
  ]);

  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  const handleImageUpload = (questionId: number, files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files);
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          uploadedImages: [...q.uploadedImages, ...newImages],
          status: 'attempting' as const,
        };
      }
      return q;
    }));
  };

  const removeImage = (questionId: number, imageIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newImages = q.uploadedImages.filter((_, idx) => idx !== imageIndex);
        return {
          ...q,
          uploadedImages: newImages,
          status: newImages.length > 0 ? ('attempting' as const) : ('not-attempted' as const),
        };
      }
      return q;
    }));
  };

  const markAsComplete = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.uploadedImages.length > 0) {
        return { ...q, status: 'completed' as const };
      }
      return q;
    }));
  };

  const answeredCount = questions.filter(q => q.uploadedImages.length > 0).length;
  const totalQuestions = questions.length;

  const handleSubmit = () => {
    if (answeredCount < totalQuestions) {
      setShowSubmitWarning(true);
      setTimeout(() => setShowSubmitWarning(false), 3000);
    } else {
      onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Test</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>28:45 remaining</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg text-gray-900">Physics: Light & Refraction (Theory)</h1>
              <p className="text-sm text-gray-500">ICSE Class 10 • Total Marks: 40</p>
            </div>

            <div className="text-sm text-gray-600">
              <span className="text-blue-600">{answeredCount}</span> of {totalQuestions} Questions Answered
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className=" mx-auto space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm text-blue-900 mb-1">Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Write your answers on paper and upload clear images</li>
                  <li>• You can upload multiple images for each question</li>
                  <li>• Ensure handwriting is legible for accurate AI evaluation</li>
                  <li>• Mark diagrams clearly with labels</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Questions */}
          {questions.map((question, idx) => {
            const showSection = idx === 0 || questions[idx - 1].section !== question.section;
            
            return (
              <div key={question.id}>
                {showSection && (
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-500 uppercase tracking-wide">{question.section}</h2>
                  </div>
                )}

                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <div className="p-5">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{question.id}.</span>
                          <div className="flex-1">
                            <p className="text-gray-900">{question.text}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {question.marks} Marks
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {question.status === 'not-attempted' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            <span>Not Attempted</span>
                          </div>
                        )}
                        {question.status === 'attempting' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span>Attempting</span>
                          </div>
                        )}
                        {question.status === 'completed' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload Area */}
                    <div className="space-y-3">
                      {/* Uploaded Images */}
                      {question.uploadedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {question.uploadedImages.map((image, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Answer ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                onClick={() => removeImage(question.id, imgIdx)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <p className="text-xs text-gray-500 mt-1 text-center">Page {imgIdx + 1}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Button */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={(e) => handleImageUpload(question.id, e.target.files)}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">Upload handwritten answer</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {question.uploadedImages.length > 0 
                                  ? 'Add more pages (PNG, JPG, or PDF)'
                                  : 'Select Image / PDF • Multiple pages supported'}
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Mark as Complete Button */}
                      {question.uploadedImages.length > 0 && question.status !== 'completed' && (
                        <button
                          onClick={() => markAsComplete(question.id)}
                          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Submit Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky bottom-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900 mb-1">
                  {answeredCount} of {totalQuestions} Questions Answered
                </p>
                <p className="text-xs text-gray-500">
                  {answeredCount < totalQuestions 
                    ? 'Please answer all questions before submitting'
                    : 'All questions answered! Ready to submit.'}
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>Submit Paper for AI Evaluation</span>
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Warning Toast */}
      {showSubmitWarning && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl animate-slide-up">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Test Submitted Automatically</p>
              <p className="text-sm text-red-100">Window focus lost. This is a security violation.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
