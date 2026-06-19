import { useState } from 'react';
import {
  Brain, BookOpen, Target, Heart, Clock, Award,
  CheckCircle2, AlertCircle, Sparkles, ChevronRight,
  Zap, Focus, TrendingUp, Info
} from 'lucide-react';

interface AssessmentIntroModalProps {
  isOpen: boolean;
  onStart: () => void;
  onSkip?: () => void;
  studentName: string;
}

export function AssessmentIntroModal({
  isOpen,
  onStart,
  onSkip,
  studentName
}: AssessmentIntroModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const assessmentLayers = [
    {
      id: 1,
      title: 'Cognitive Readiness',
      duration: '25 min',
      description: 'Working memory, processing speed, logical reasoning, attention span',
      icon: Brain,
      color: 'blue',
      weightage: 20,
      components: [
        'Working Memory (Digit Span, Pattern Recall)',
        'Processing Speed (Symbol Match, Rapid Comparison)',
        'Logical Reasoning (Analogies, Series)',
        'Attention & Focus (Stroop Test, Error Spotting)'
      ]
    },
    {
      id: 2,
      title: 'Academic Foundations',
      duration: '70-90 min',
      description: 'Prerequisites from Classes 6-9 in Math, Science, and English',
      icon: BookOpen,
      color: 'purple',
      weightage: 40,
      components: [
        'Mathematics (Number System, Algebra, Geometry)',
        'Science (Physics, Chemistry, Biology basics)',
        'English (Grammar, Comprehension, Vocabulary)',
        'Critical Thinking & Problem Solving'
      ]
    },
    {
      id: 3,
      title: 'Class 10 Readiness',
      duration: '30-40 min',
      description: 'Subject-specific checks for current syllabus entry points',
      icon: Target,
      color: 'green',
      weightage: 25,
      components: [
        'Current Syllabus Understanding',
        'Topic-wise Readiness Check',
        'Prerequisite Concept Mapping',
        'Learning Gap Identification'
      ]
    },
    {
      id: 4,
      title: 'Habits & Mindset',
      duration: '10-12 min',
      description: 'Study consistency, psychological readiness, and grit',
      icon: Heart,
      color: 'pink',
      weightage: 15,
      components: [
        'Study Habits Assessment',
        'Time Management Skills',
        'Motivation & Goal Setting',
        'Stress Management & Resilience'
      ]
    }
  ];

  const slides = [
    // Slide 0: Welcome
    {
      title: `Welcome, ${studentName}!`,
      subtitle: 'Let\'s understand your learning profile',
      content: (
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Initial Diagnostic Assessment
          </h3>
          <p className="text-lg text-gray-600 mb-8  mx-auto">
            We'll conduct a comprehensive assessment to understand your cognitive abilities, 
            academic foundation, and learning readiness. This helps us create a personalized 
            learning path just for you!
          </p>
          <div className="grid grid-cols-4 gap-4  mx-auto">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-blue-900">Cognitive</div>
              <div className="text-xs text-blue-700">25 min</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-purple-900">Academic</div>
              <div className="text-xs text-purple-700">70-90 min</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-green-900">Class 10</div>
              <div className="text-xs text-green-700">30-40 min</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-200">
              <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-pink-900">Habits</div>
              <div className="text-xs text-pink-700">10-12 min</div>
            </div>
          </div>
          <div className="mt-8 bg-orange-50 rounded-lg p-4 border border-orange-200  mx-auto">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <div className="font-bold text-orange-900 mb-1">Total Time: 2.5 - 3 Hours</div>
                <div className="text-sm text-orange-700">
                  You can take breaks between layers. Progress is auto-saved.
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Slide 1: Layer Details
    {
      title: 'Assessment Layers',
      subtitle: 'Four comprehensive layers to map your learning profile',
      content: (
        <div className="py-6">
          <div className="space-y-4">
            {assessmentLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.id}
                  className={`bg-white rounded-xl p-6 border-2 shadow-sm ${
                    layer.color === 'blue' ? 'border-blue-200' :
                    layer.color === 'purple' ? 'border-purple-200' :
                    layer.color === 'green' ? 'border-green-200' :
                    'border-pink-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      layer.color === 'blue' ? 'bg-blue-100' :
                      layer.color === 'purple' ? 'bg-purple-100' :
                      layer.color === 'green' ? 'bg-green-100' :
                      'bg-pink-100'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        layer.color === 'blue' ? 'text-blue-600' :
                        layer.color === 'purple' ? 'text-purple-600' :
                        layer.color === 'green' ? 'text-green-600' :
                        'text-pink-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          Layer {layer.id}: {layer.title}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            layer.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                            layer.color === 'purple' ? 'bg-purple-50 text-purple-700' :
                            layer.color === 'green' ? 'bg-green-50 text-green-700' :
                            'bg-pink-50 text-pink-700'
                          }`}>
                            {layer.duration}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">
                            {layer.weightage}% weight
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{layer.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {layer.components.map((component, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                              layer.color === 'blue' ? 'text-blue-600' :
                              layer.color === 'purple' ? 'text-purple-600' :
                              layer.color === 'green' ? 'text-green-600' :
                              'text-pink-600'
                            }`} />
                            <span className="text-xs text-gray-700">{component}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    },
    // Slide 2: What to Expect
    {
      title: 'What to Expect',
      subtitle: 'Understanding how the assessment works',
      content: (
        <div className="py-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">Adaptive Testing</h4>
                    <p className="text-sm text-blue-700">
                      Questions adjust based on your responses. The AI makes the test easier or harder based on your performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Focus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">Timed Sections</h4>
                    <p className="text-sm text-green-700">
                      Each layer has a time limit. This helps us measure your processing speed and time management skills.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900 mb-1">Progressive Unlock</h4>
                    <p className="text-sm text-purple-700">
                      Complete each layer to unlock the next. You can take breaks and resume anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900 mb-1">Performance Classification</h4>
                    <p className="text-sm text-orange-700">
                      You'll be classified from A (Topper-Ready) to E (Needs Support) based on your overall performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-xl p-5 border-2 border-pink-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-pink-900 mb-1">Personalized Report</h4>
                    <p className="text-sm text-pink-700">
                      Get a detailed report with strengths, weaknesses, and a custom learning path designed just for you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border-2 border-gray-700 text-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Important Tips</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-gray-300">
                      <li>Find a quiet space</li>
                      <li>Use headphones if needed</li>
                      <li>Keep water nearby</li>
                      <li>Give honest answers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-6">
          <h2 className="text-3xl font-bold mb-2">{currentSlideData.title}</h2>
          <p className="text-white/90">{currentSlideData.subtitle}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8">
          {currentSlideData.content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-8 bg-blue-600'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide(currentSlide - 1)}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-bold transition-all"
                >
                  Previous
                </button>
              )}
              
              {currentSlide < slides.length - 1 ? (
                <button
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onStart}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Assessment
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
            {/* Skip Button */}
            {onSkip && (
              <button
                onClick={onSkip}
                className="ml-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
