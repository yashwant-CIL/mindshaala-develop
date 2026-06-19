import { useState } from 'react';
import { Brain, Calendar, ChevronRight, Info } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface ProfilePageProps {
  phoneNumber: string;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function ProfilePage({ phoneNumber, onComplete, onBack }: ProfilePageProps) {
  // Pre-populate with sample data for quick testing
  const [formData, setFormData] = useState({
    firstName: 'Aarav',
    lastName: 'Patel',
    dateOfBirth: '2009-03-15',
    currentGrade: 'Class 10',
    schoolBoard: 'ICSE',
    mediumOfInstruction: 'English',
    schoolName: 'Delhi Public School',
  });

  const grades = [
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
    'Dropper (JEE)',
    'Dropper (NEET)',
  ];

  const boards = ['CBSE', 'ICSE', 'State Board (Maharashtra)', 'State Board (Other)', 'IB', 'IGCSE'];

  const mediums = ['English', 'Hindi', 'Marathi', 'Both English & Hindi'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.dateOfBirth &&
      formData.currentGrade &&
      formData.schoolBoard &&
      formData.mediumOfInstruction
    );
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar activePage="profile" onNavigate={() => {}} />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-5">
            <h1 className="text-2xl text-gray-900 mb-2">Let's get to know you</h1>
            <p className="text-sm text-gray-600">
              Help us create your personalized learning experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* First Name */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={`+91${phoneNumber}`}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Current Grade */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">
                  Current Grade / Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currentGrade}
                  onChange={(e) => setFormData({ ...formData, currentGrade: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select grade</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* School Board */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">
                  School Board <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.schoolBoard}
                  onChange={(e) => setFormData({ ...formData, schoolBoard: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select board</option>
                  {boards.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medium of Instruction */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5 flex items-center gap-1">
                  <span className="text-sm">🌐</span>
                  Medium of Instruction <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.mediumOfInstruction}
                  onChange={(e) => setFormData({ ...formData, mediumOfInstruction: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select medium</option>
                  {mediums.map((medium) => (
                    <option key={medium} value={medium}>
                      {medium}
                    </option>
                  ))}
                </select>
              </div>

              {/* School Name */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">School Name</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Enter school name"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm text-blue-900 mb-0.5">Why do we need this information?</h4>
                  <p className="text-xs text-blue-800">
                    Your profile helps us customize your learning experience according to your board's syllabus, 
                    preferred language, and grade-appropriate content.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isFormValid()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 group text-sm"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            © 2025 MindShaala • Empowering Indian Students
          </div>
        </div>
      </div>
    </div>
  );
}