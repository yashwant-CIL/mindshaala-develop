import { TrendingUp, TrendingDown, Award, Target, Calendar, BarChart3, Clock } from 'lucide-react';

export function PerformancePage() {
  const subjectPerformance = [
    { 
      name: 'Physics', 
      current: 92, 
      previous: 88, 
      tests: 12, 
      avgTime: '45 min',
      strength: ['Mechanics', 'Thermodynamics'],
      weak: ['Optics'],
      color: 'purple' 
    },
    { 
      name: 'Mathematics', 
      current: 87, 
      previous: 85, 
      tests: 15, 
      avgTime: '52 min',
      strength: ['Algebra', 'Trigonometry'],
      weak: ['Statistics'],
      color: 'orange' 
    },
    { 
      name: 'Chemistry', 
      current: 78, 
      previous: 82, 
      tests: 10, 
      avgTime: '38 min',
      strength: ['Inorganic'],
      weak: ['Organic Chemistry', 'Mole Concept'],
      color: 'green' 
    },
    { 
      name: 'English', 
      current: 85, 
      previous: 83, 
      tests: 8, 
      avgTime: '40 min',
      strength: ['Grammar', 'Comprehension'],
      weak: ['Literature Analysis'],
      color: 'pink' 
    },
  ];

  const monthlyProgress = [
    { month: 'Sep', score: 72 },
    { month: 'Oct', score: 78 },
    { month: 'Nov', score: 82 },
    { month: 'Dec', score: 84.5 },
  ];

  const maxScore = 100;

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl text-gray-900 mb-1">Performance Analytics</h1>
        <p className="text-sm text-gray-600">
          Detailed insights into your academic progress
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Overall Average</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">84.5%</p>
          <p className="text-xs text-green-600">+2.1% from last month</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Tests Taken</p>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">45</p>
          <p className="text-xs text-gray-500">Across all subjects</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Best Subject</p>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">Physics</p>
          <p className="text-xs text-gray-500">92% average</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">Improvement</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-0.5">+12.5%</p>
          <p className="text-xs text-gray-500">Since September</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main Content - 2 cols */}
        <div className="col-span-2 space-y-5">
          {/* Monthly Progress Chart */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm text-gray-900">Monthly Progress Trend</h3>
              </div>
              <select className="text-xs border border-gray-200 rounded px-2 py-1 outline-none">
                <option>Last 4 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="flex items-end justify-between gap-4 h-48">
              {monthlyProgress.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end items-center flex-1">
                    <div className="text-xs text-gray-600 mb-2">{data.score}%</div>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ height: `${(data.score / maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-900 mb-4">Subject-wise Detailed Performance</h3>

            <div className="space-y-4">
              {subjectPerformance.map((subject, idx) => {
                const change = subject.current - subject.previous;
                const isImproving = change > 0;

                return (
                  <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                          subject.color === 'purple' ? 'bg-purple-100' :
                          subject.color === 'orange' ? 'bg-orange-100' :
                          subject.color === 'green' ? 'bg-green-100' : 'bg-pink-100'
                        }`}>
                          <Award className={`w-4 h-4 ${
                            subject.color === 'purple' ? 'text-purple-600' :
                            subject.color === 'orange' ? 'text-orange-600' :
                            subject.color === 'green' ? 'text-green-600' : 'text-pink-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-sm text-gray-900">{subject.name}</h4>
                          <p className="text-xs text-gray-500">{subject.tests} tests taken</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl text-gray-900">{subject.current}%</p>
                        <div className="flex items-center gap-1">
                          {isImproving ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span className={`text-xs ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
                            {isImproving ? '+' : ''}{change}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${
                          subject.color === 'purple' ? 'bg-purple-500' :
                          subject.color === 'orange' ? 'bg-orange-500' :
                          subject.color === 'green' ? 'bg-green-500' : 'bg-pink-500'
                        }`}
                        style={{ width: `${subject.current}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Strong Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {subject.strength.map((topic, i) => (
                            <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs border border-green-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Needs Practice</p>
                        <div className="flex flex-wrap gap-1">
                          {subject.weak.map((topic, i) => (
                            <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs border border-red-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Avg Time: {subject.avgTime}</span>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-700">
                        View Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Performance Summary */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
            <h3 className="text-sm mb-3">Performance Summary</h3>
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-blue-100">Completed</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-blue-100">In Progress</span>
                  <span>15%</span>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-blue-100">Pending</span>
                  <span>10%</span>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Time Management */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm text-gray-900">Time Management</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Fastest Test</span>
                <span className="text-sm text-gray-900">28 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Average Time</span>
                <span className="text-sm text-gray-900">43 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Slowest Test</span>
                <span className="text-sm text-gray-900">58 min</span>
              </div>
            </div>
          </div>

          {/* Rank & Percentile */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-900 mb-3">Rank & Percentile</h3>
            <div className="space-y-3">
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 mb-1">Class Rank</p>
                <p className="text-2xl text-yellow-600">#2</p>
                <p className="text-xs text-yellow-600">out of 156</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700 mb-1">Percentile</p>
                <p className="text-2xl text-orange-600">98.5</p>
                <p className="text-xs text-orange-600">Top performer</p>
              </div>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-900 mb-3">Consistency Score</h3>
            <div className="relative w-32 h-32 mx-auto">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${(88 / 100) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-2xl text-gray-900">88%</p>
                <p className="text-xs text-gray-500">Consistent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
