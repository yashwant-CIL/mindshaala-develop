import { useState } from 'react';
import { 
  X,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Eye,
  Flag,
  TrendingUp,
  Clock,
  Award,
  Target
} from 'lucide-react';

interface EvaluationReportProps {
  onClose: () => void;
}

interface QuestionEvaluation {
  id: number;
  question: string;
  maxMarks: number;
  scoredMarks: number;
  answerSnapshot: string;
  feedback: {
    text: string;
    tags: string[];
  };
}

export function EvaluationReport({ onClose }: EvaluationReportProps) {
  const [showModelAnswer, setShowModelAnswer] = useState<number | null>(null);

  const evaluationData = {
    testName: 'Physics: Light (Theory)',
    totalScore: 15,
    maxScore: 20,
    accuracy: 75,
    percentileBetter: 85,
    timeTaken: '55m 00s',
    timeAllotted: '1h 00s',
    classPercentile: 88,
    isTopPerformer: true,
  };

  const questions: QuestionEvaluation[] = [
    {
      id: 1,
      question: "State Snell's Law of refraction. Define refractive index.",
      maxMarks: 3,
      scoredMarks: 2.5,
      answerSnapshot: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzIj4xLiBuxIEgc2luKM61MSkgPSBzaW4ozrUyKTwvdGV4dD48dGV4dCB4PSIyMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+Mi4gMi9mID0gZG8vZGkgICBJZiA9IGRvL2RpPC90ZXh0Pjx0ZXh0IHg9IjM1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2U1MzQzNSIgZm9udC13ZWlnaHQ9ImJvbGQiPjMvNDwvdGV4dD48cGF0aCBkPSJNIDIwMCAxMDAgTCAyNTAgNzAgTCAzMDAgMTAwIE0gMjAwIDEwMCBMIDE1MCAxMjAgTSAyMDAgMTAwIEwgMjUwIDEzMCBNIDIwMCAxMDAgTCAyMjAgMTUwIiBzdHJva2U9IiM0MjY1ZTgiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjx0ZXh0IHg9IjMyMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM0MjY1ZTgiPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
      feedback: {
        text: "Definition of Snell's Law is accurate. The formula for refractive index is correct, but you missed specifying that it is for a given pair of media. Good diagram.",
        tags: ['Concept Clear', 'Minor Omission']
      }
    },
    {
      id: 2,
      question: 'Draw a ray diagram to show the formation of image by a convex lens when the object is placed between F and 2F.',
      maxMarks: 4,
      scoredMarks: 3,
      answerSnapshot: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjxlbGxpcHNlIGN4PSIyMDAiIGN5PSIxMDAiIHJ4PSIxNSIgcnk9IjgwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIyMCIgeTE9IjEwMCIgeDI9IjM4MCIgeTI9IjEwMCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMTAwIiB5MT0iNjAiIHgyPSIxMDAiIHkyPSIxMDAiIHN0cm9rZT0iI2U1MzQzNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTSAxMDAgNjAgTCAzMDAgMTQwIiBzdHJva2U9IiM0MjY1ZTgiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjx0ZXh0IHg9IjM1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzIxOTY1MyIgZm9udC13ZWlnaHQ9ImJvbGQiPjMvNDwvdGV4dD48L3N2Zz4=',
      feedback: {
        text: "Diagram shows correct ray paths and image formation. Labels are missing for focal points (F, 2F). The object height and image characteristics could be more clearly marked.",
        tags: ['Diagram Correct', 'Missing Labels']
      }
    },
    {
      id: 3,
      question: 'Explain the concept of work-energy theorem. Derive the formula for kinetic energy.',
      maxMarks: 5,
      scoredMarks: 4.5,
      answerSnapshot: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIj5Xb3JrLWVuZXJneSB0aGVvcmVtIHN0YXRlcyB0aGF0Li4uPC90ZXh0Pjx0ZXh0IHg9IjIwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIj5XZXQgPSBGID0gbWEgPSBtKHYyLXUyKS8ydDwvdGV4dD48dGV4dCB4PSIyMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzMzMyI+V2V0ID0gbSh2Mi11MikkdmltZXM7cy8ydDwvdGV4dD48dGV4dCB4PSIyMCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMzMzMiPldldCA9ICgxLzIpbXYyIC0gKDEvMiltdTI8L3RleHQ+PHRleHQgeD0iMzUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMjE5NjUzIiBmb250LXdlaWdodD0iYm9sZCI+NC41LzU8L3RleHQ+PC9zdmc+',
      feedback: {
        text: "Excellent explanation and derivation! All steps are logically presented. The mathematical derivation is complete and correct. Minor: Could have mentioned the work-energy theorem application example.",
        tags: ['Excellent', 'Complete Derivation']
      }
    },
  ];

  const handleShare = () => {
    alert('Share functionality - Report link copied to clipboard!');
  };

  const handleDownloadPDF = () => {
    alert('Downloading PDF report...');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-lg text-gray-900 mb-0.5">Evaluation Report</h2>
              <p className="text-xs text-gray-500">Your AI-generated performance analysis.</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-blue-600">{evaluationData.testName}</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                AI Evaluated
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
              >
                Close
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Detailed performance analysis & retention insights.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-3">
            {/* Total Score */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Total Score</p>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-2xl text-blue-600">{evaluationData.totalScore}</span>
                <span className="text-sm text-gray-500">/ {evaluationData.maxScore}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full" 
                  style={{ width: `${(evaluationData.totalScore / evaluationData.maxScore) * 100}%` }}
                />
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Accuracy</p>
              <p className="text-2xl text-gray-900 mb-0.5">{evaluationData.accuracy}%</p>
              <p className="text-xs text-gray-500">Better than {evaluationData.percentileBetter}%</p>
            </div>

            {/* Time Management */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Time</p>
              <p className="text-2xl text-gray-900 mb-0.5">{evaluationData.timeTaken}</p>
              <p className="text-xs text-gray-500">vs {evaluationData.timeAllotted}</p>
            </div>

            {/* Class Percentile */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-700 mb-1">Percentile</p>
              <p className="text-2xl text-orange-600 mb-0.5">{evaluationData.classPercentile}th</p>
              <p className="text-xs text-orange-600">Top Performer!</p>
            </div>
          </div>
        </div>

        {/* Questions Evaluation - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-purple-600" />
            </div>
            <h3 className="text-sm text-gray-900">Subjective Answer Evaluation</h3>
          </div>

          <div className="space-y-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-gray-900 flex-1">
                      Q{question.id}. {question.question}
                    </p>
                    <div className="flex items-baseline gap-0.5 ml-3">
                      <span className="text-xl text-blue-600">{question.scoredMarks}</span>
                      <span className="text-sm text-gray-500">/{question.maxMarks}</span>
                    </div>
                  </div>
                </div>

                {/* Answer & Feedback */}
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left: Answer Snapshot */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1.5">Your Answer Snapshot</p>
                      <div className="bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                        <img
                          src={question.answerSnapshot}
                          alt={`Answer ${question.id}`}
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    </div>

                    {/* Right: AI Feedback */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1.5">AI Feedback Analysis</p>
                      <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                        <p className="text-xs text-blue-900 mb-2">{question.feedback.text}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {question.feedback.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white border border-blue-300 text-blue-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setShowModelAnswer(question.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Model Answer</span>
                          </button>
                          <button className="flex items-center gap-1 px-2 py-1 bg-white border border-red-300 text-red-600 rounded text-xs hover:bg-red-50 transition-colors">
                            <Flag className="w-3 h-3" />
                            <span>Dispute</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Insights */}
          <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
            <h4 className="text-xs text-blue-900 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Overall Performance Insights
            </h4>
            <div className="space-y-1.5 text-xs text-blue-800">
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>Strong conceptual understanding in work-energy theorem.</p>
              </div>
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p>Practice labeling diagrams more carefully.</p>
              </div>
              <div className="flex items-start gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Provide complete definitions with all conditions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}