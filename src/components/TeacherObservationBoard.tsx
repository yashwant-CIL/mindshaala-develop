import { useState } from 'react';
import { Plus, Search, User, Calendar, Tag, Edit2, Trash2, Eye, Brain, Clock, BookOpen, Bell, Target, Filter, X, Save, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import mindshaalLogo from 'figma:asset/mindshaalaNew-logoCrop.png';
interface Student {
  id: string;
  name: string;
  class: string;
  avatar: string;
}

interface Observation {
  id: string;
  studentId: string;
  studentName: string;
  category: 'test-series' | 'study-schedule' | 'alerts' | 'reminders' | 'learning-style' | 'strengths' | 'weaknesses' | 'general';
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  lastUpdated: string;
  priority: 'high' | 'medium' | 'low';
}

const categoryConfig = {
  'test-series': { label: 'Test Series', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  'study-schedule': { label: 'Study Schedule', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
  'alerts': { label: 'Alerts & Notifications', icon: Bell, color: 'bg-orange-100 text-orange-700' },
  'reminders': { label: 'Reminders', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  'learning-style': { label: 'Learning Style', icon: Brain, color: 'bg-pink-100 text-pink-700' },
  'strengths': { label: 'Strengths', icon: Target, color: 'bg-green-100 text-green-700' },
  'weaknesses': { label: 'Areas to Improve', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  'general': { label: 'General Notes', icon: Edit2, color: 'bg-gray-100 text-gray-700' },
};

export function TeacherObservationBoard() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<Observation['category']>('general');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Mock data
  const [students] = useState<Student[]>([
    { id: '1', name: 'Priya Sharma', class: 'ICSE Class 10', avatar: 'PS' },
    { id: '2', name: 'Arjun Patel', class: 'ICSE Class 10', avatar: 'AP' },
    { id: '3', name: 'Ananya Desai', class: 'ICSE Class 9', avatar: 'AD' },
    { id: '4', name: 'Rohan Kumar', class: 'ICSE Class 10', avatar: 'RK' },
    { id: '5', name: 'Meera Singh', class: 'ICSE Class 9', avatar: 'MS' },
  ]);

  const [observations, setObservations] = useState<Observation[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'Priya Sharma',
      category: 'test-series',
      title: 'Focus on Application-Based Questions',
      content: 'Priya excels at theoretical concepts but struggles with application-based questions. AI should include more real-world problem scenarios in her test series, especially in Physics and Chemistry.',
      tags: ['physics', 'chemistry', 'application'],
      timestamp: '2024-01-20 10:30 AM',
      lastUpdated: '2024-01-20 10:30 AM',
      priority: 'high'
    },
    {
      id: '2',
      studentId: '1',
      studentName: 'Priya Sharma',
      category: 'study-schedule',
      title: 'Morning Study Sessions Work Best',
      content: 'Observed that Priya is most productive between 6 AM - 9 AM. Schedule intensive subjects like Mathematics during morning hours. Avoid scheduling difficult topics after 8 PM.',
      tags: ['timing', 'productivity'],
      timestamp: '2024-01-19 03:15 PM',
      lastUpdated: '2024-01-19 03:15 PM',
      priority: 'medium'
    },
    {
      id: '3',
      studentId: '2',
      studentName: 'Arjun Patel',
      category: 'learning-style',
      title: 'Visual Learner - Prefers Diagrams',
      content: 'Arjun retains information better through visual aids. AI should recommend more video content, mind maps, and diagram-based explanations. Written text-heavy content should be minimized.',
      tags: ['visual', 'learning-style', 'videos'],
      timestamp: '2024-01-18 11:20 AM',
      lastUpdated: '2024-01-18 11:20 AM',
      priority: 'high'
    },
    {
      id: '4',
      studentId: '2',
      studentName: 'Arjun Patel',
      category: 'weaknesses',
      title: 'Time Management in Exams',
      content: 'Arjun often runs out of time in tests despite knowing the content. AI should include timed practice sessions and teach time management strategies. Focus on quick problem-solving techniques.',
      tags: ['time-management', 'practice'],
      timestamp: '2024-01-17 02:45 PM',
      lastUpdated: '2024-01-17 02:45 PM',
      priority: 'high'
    },
    {
      id: '5',
      studentId: '3',
      studentName: 'Ananya Desai',
      category: 'strengths',
      title: 'Excellent at Organic Chemistry',
      content: 'Ananya has exceptional understanding of organic chemistry mechanisms. AI can assign advanced level problems in this area and use her strength to build confidence for weaker topics.',
      tags: ['chemistry', 'organic', 'strength'],
      timestamp: '2024-01-16 09:00 AM',
      lastUpdated: '2024-01-16 09:00 AM',
      priority: 'medium'
    },
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentObservations = (studentId: string) => {
    let filtered = observations.filter(obs => obs.studentId === studentId);
    if (filterCategory !== 'all') {
      filtered = filtered.filter(obs => obs.category === filterCategory);
    }
    return filtered;
  };

  const handleAddObservation = () => {
    if (!selectedStudent || !formTitle.trim() || !formContent.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newObservation: Observation = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      category: formCategory,
      title: formTitle,
      content: formContent,
      tags: formTags.split(',').map(t => t.trim()).filter(t => t),
      timestamp: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      lastUpdated: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      priority: formPriority
    };

    setObservations([newObservation, ...observations]);
    resetForm();
    setShowAddObservation(false);
  };

  const handleUpdateObservation = () => {
    if (!editingObservation || !formTitle.trim() || !formContent.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setObservations(observations.map(obs => 
      obs.id === editingObservation.id 
        ? {
            ...obs,
            category: formCategory,
            title: formTitle,
            content: formContent,
            tags: formTags.split(',').map(t => t.trim()).filter(t => t),
            lastUpdated: new Date().toLocaleString('en-US', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            priority: formPriority
          }
        : obs
    ));
    resetForm();
    setEditingObservation(null);
  };

  const handleDeleteObservation = (id: string) => {
    if (confirm('Are you sure you want to delete this observation?')) {
      setObservations(observations.filter(obs => obs.id !== id));
    }
  };

  const handleEditObservation = (observation: Observation) => {
    setEditingObservation(observation);
    setFormCategory(observation.category);
    setFormTitle(observation.title);
    setFormContent(observation.content);
    setFormTags(observation.tags.join(', '));
    setFormPriority(observation.priority);
    setShowAddObservation(true);
  };

  const resetForm = () => {
    setFormCategory('general');
    setFormTitle('');
    setFormContent('');
    setFormTags('');
    setFormPriority('medium');
  };

  const handleCancelForm = () => {
    resetForm();
    setShowAddObservation(false);
    setEditingObservation(null);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
        {/* <img src={mindshaalLogo} alt="MindShaala" className="h-8" /> */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Teacher Observation Board</h1>
          <p className="text-sm text-gray-600">AI-Powered Student Insights & Personalization</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
          <Brain className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-xs text-purple-600 font-medium">AI Integration Active</p>
            <p className="text-xs text-gray-600">Notes are synced with AI models</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Student List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredStudents.map((student) => {
              const studentObs = observations.filter(obs => obs.studentId === student.id);
              const isSelected = selectedStudent?.id === student.id;
              
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-600">{student.class}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {studentObs.length} notes
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedStudent ? (
            <>
              {/* Student Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedStudent.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                      <p className="text-gray-600">{selectedStudent.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={filterCategory === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilterCategory('all')}
                      >
                        All
                      </Button>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={() => setShowAddObservation(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Observation
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add/Edit Observation Form */}
              {showAddObservation && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b-2 border-blue-200 p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingObservation ? 'Edit Observation' : 'New Observation'}
                      </h3>
                      <Button size="sm" variant="ghost" onClick={handleCancelForm}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value as Observation['category'])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Object.entries(categoryConfig).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <select
                            value={formPriority}
                            onChange={(e) => setFormPriority(e.target.value as 'high' | 'medium' | 'low')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="Brief title for this observation..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observation Details <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={formContent}
                          onChange={(e) => setFormContent(e.target.value)}
                          placeholder="Detailed observation that AI will use to personalize learning..."
                          className="min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 This information will be used by AI to customize test series, study schedules, and recommendations
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formTags}
                          onChange={(e) => setFormTags(e.target.value)}
                          placeholder="e.g., mathematics, visual-learning, morning-study"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCancelForm}>
                          Cancel
                        </Button>
                        <Button onClick={editingObservation ? handleUpdateObservation : handleAddObservation}>
                          <Save className="w-4 h-4 mr-2" />
                          {editingObservation ? 'Update Observation' : 'Save Observation'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observations List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {getStudentObservations(selectedStudent.id).length === 0 ? (
                    <Card className="p-12 text-center">
                      <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Observations Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Add your first observation to help AI personalize learning for {selectedStudent.name}
                      </p>
                      <Button onClick={() => setShowAddObservation(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Observation
                      </Button>
                    </Card>
                  ) : (
                    getStudentObservations(selectedStudent.id).map((observation) => {
                      const config = categoryConfig[observation.category];
                      const Icon = config.icon;
                      
                      return (
                        <Card key={observation.id} className="p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">{observation.title}</h3>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={config.color}>{config.label}</Badge>
                                    <Badge 
                                      className={
                                        observation.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        observation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                      }
                                    >
                                      {observation.priority.toUpperCase()}
                                    </Badge>
                                    {observation.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleEditObservation(observation)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleDeleteObservation(observation.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-700 leading-relaxed mb-3">{observation.content}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Created: {observation.timestamp}
                                </span>
                                {observation.timestamp !== observation.lastUpdated && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Updated: {observation.lastUpdated}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <User className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">
                  Choose a student from the left to view and manage observations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
