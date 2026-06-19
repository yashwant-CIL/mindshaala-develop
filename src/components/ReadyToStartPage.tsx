import { Check, ArrowRight } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface ReadyToStartPageProps {
  onStartLearning: () => void;
  onBack: () => void;
}

export function ReadyToStartPage({ onStartLearning, onBack }: ReadyToStartPageProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar currentStep="plan" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-100 text-center">
            <h1 className="text-3xl text-gray-900 mb-10">Ready to Start!</h1>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl text-gray-900 mb-3">All Set!</h2>
            <p className="text-gray-600 mb-10 max-w-md mx-auto">
              Your personalized learning dashboard is ready. We've created a study plan based on your assessment results.
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                className="px-5 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back
              </button>
              <button
                onClick={onStartLearning}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 group"
              >
                <span>Start Learning Journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}