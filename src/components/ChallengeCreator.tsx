import { useState } from 'react';
import { 
  Wand2, Save, Play, Eye, Share2, Trophy, Star, Clock,
  GitBranch, Blocks, Code, Activity, Plus, Trash2, Edit,
  CheckCircle, AlertCircle, Info, Sparkles, Target
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion, AnimatePresence } from 'motion/react';

interface ChallengeCreatorProps {
  onClose: () => void;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
}

interface ChallengeData {
  title: string;
  description: string;
  type: 'flowchart' | 'block-coding' | 'algorithm' | 'debugging';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  estimatedTime: number;
  maxScore: number;
  instructions: string;
  hints: string[];
  testCases: TestCase[];
  tags: string[];
}

export function ChallengeCreator({ onClose }: ChallengeCreatorProps) {
  const [currentStep, setCurrentStep] = useState<'basic' | 'details' | 'tests' | 'preview'>('basic');
  const [challenge, setChallenge] = useState<ChallengeData>({
    title: '',
    description: '',
    type: 'flowchart',
    difficulty: 'medium',
    category: 'Logic',
    estimatedTime: 180,
    maxScore: 1500,
    instructions: '',
    hints: [''],
    testCases: [{ id: '1', input: '', expectedOutput: '', description: '' }],
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const updateChallenge = (field: keyof ChallengeData, value: any) => {
    setChallenge(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const addHint = () => {
    setChallenge(prev => ({ ...prev, hints: [...prev.hints, ''] }));
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...challenge.hints];
    newHints[index] = value;
    setChallenge(prev => ({ ...prev, hints: newHints }));
  };

  const removeHint = (index: number) => {
    if (challenge.hints.length > 1) {
      setChallenge(prev => ({ 
        ...prev, 
        hints: prev.hints.filter((_, i) => i !== index) 
      }));
    }
  };

  const addTestCase = () => {
    const newId = (challenge.testCases.length + 1).toString();
    setChallenge(prev => ({
      ...prev,
      testCases: [...prev.testCases, {
        id: newId,
        input: '',
        expectedOutput: '',
        description: ''
      }]
    }));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const newTestCases = [...challenge.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setChallenge(prev => ({ ...prev, testCases: newTestCases }));
  };

  const removeTestCase = (index: number) => {
    if (challenge.testCases.length > 1) {
      setChallenge(prev => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index)
      }));
    }
  };

  const addTag = () => {
    if (newTag && !challenge.tags.includes(newTag)) {
      setChallenge(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setChallenge(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateChallenge = (): boolean => {
    const errors: string[] = [];

    if (!challenge.title.trim()) errors.push('Title is required');
    if (!challenge.description.trim()) errors.push('Description is required');
    if (!challenge.instructions.trim()) errors.push('Instructions are required');
    if (challenge.estimatedTime < 30) errors.push('Estimated time must be at least 30 seconds');
    if (challenge.maxScore < 100) errors.push('Max score must be at least 100 points');
    
    const validHints = challenge.hints.filter(h => h.trim());
    if (validHints.length === 0) errors.push('At least one hint is required');

    const validTestCases = challenge.testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim());
    if (validTestCases.length === 0) errors.push('At least one test case is required');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const publishChallenge = () => {
    if (validateChallenge()) {
      // In production, this would send to backend
      console.log('Publishing challenge:', challenge);
      setPublishSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-blue-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flowchart': return GitBranch;
      case 'block-coding': return Blocks;
      case 'algorithm': return Code;
      case 'debugging': return Activity;
      default: return Target;
    }
  };

  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <Label>Challenge Title *</Label>
        <Input
          placeholder="e.g., Find the Largest Number"
          value={challenge.title}
          onChange={(e) => updateChallenge('title', e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Description *</Label>
        <Textarea
          placeholder="Brief description of what students will learn..."
          value={challenge.description}
          onChange={(e) => updateChallenge('description', e.target.value)}
          className="mt-2 h-24"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Challenge Type *</Label>
          <Select value={challenge.type} onValueChange={(value) => updateChallenge('type', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flowchart">🔀 Flowchart</SelectItem>
              <SelectItem value="block-coding">🧩 Block Coding</SelectItem>
              <SelectItem value="algorithm">💻 Algorithm</SelectItem>
              <SelectItem value="debugging">🐛 Debugging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Difficulty *</Label>
          <Select value={challenge.difficulty} onValueChange={(value) => updateChallenge('difficulty', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">🟢 Easy</SelectItem>
              <SelectItem value="medium">🔵 Medium</SelectItem>
              <SelectItem value="hard">🟠 Hard</SelectItem>
              <SelectItem value="expert">🔴 Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Estimated Time (seconds) *</Label>
          <Input
            type="number"
            placeholder="180"
            value={challenge.estimatedTime}
            onChange={(e) => updateChallenge('estimatedTime', parseInt(e.target.value) || 0)}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            {Math.floor(challenge.estimatedTime / 60)}m {challenge.estimatedTime % 60}s
          </p>
        </div>

        <div>
          <Label>Max Score (points) *</Label>
          <Input
            type="number"
            placeholder="1500"
            value={challenge.maxScore}
            onChange={(e) => updateChallenge('maxScore', parseInt(e.target.value) || 0)}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>Category</Label>
        <Input
          placeholder="e.g., Logic, Loops, Conditionals"
          value={challenge.category}
          onChange={(e) => updateChallenge('category', e.target.value)}
          className="mt-2"
        />
      </div>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <Label>Detailed Instructions *</Label>
        <Textarea
          placeholder="Step-by-step instructions for solving the challenge..."
          value={challenge.instructions}
          onChange={(e) => updateChallenge('instructions', e.target.value)}
          className="mt-2 h-40"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Hints *</Label>
          <Button size="sm" onClick={addHint}>
            <Plus className="w-4 h-4 mr-2" />
            Add Hint
          </Button>
        </div>
        <div className="space-y-3">
          {challenge.hints.map((hint, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Hint ${index + 1}`}
                value={hint}
                onChange={(e) => updateHint(index, e.target.value)}
                className="flex-1"
              />
              {challenge.hints.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHint(index)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="w-40"
            />
            <Button size="sm" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {challenge.tags.map(tag => (
            <Badge key={tag} className="bg-purple-600 cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} ✕
            </Badge>
          ))}
          {challenge.tags.length === 0 && (
            <p className="text-sm text-gray-500">No tags added yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderTestCases = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <Label>Test Cases *</Label>
          <p className="text-sm text-gray-500 mt-1">Define inputs and expected outputs to verify solutions</p>
        </div>
        <Button size="sm" onClick={addTestCase}>
          <Plus className="w-4 h-4 mr-2" />
          Add Test Case
        </Button>
      </div>

      <div className="space-y-4">
        {challenge.testCases.map((testCase, index) => (
          <Card key={testCase.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Test Case {index + 1}</h4>
              {challenge.testCases.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestCase(index)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Input</Label>
                <Input
                  placeholder="e.g., 5, 3, 9"
                  value={testCase.input}
                  onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Expected Output</Label>
                <Input
                  placeholder="e.g., 9"
                  value={testCase.expectedOutput}
                  onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Description (Optional)</Label>
                <Input
                  placeholder="e.g., Finding maximum from three numbers"
                  value={testCase.description}
                  onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );

  const renderPreview = () => {
    const TypeIcon = getTypeIcon(challenge.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-600 rounded-lg p-2">
                  <TypeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{challenge.title || 'Untitled Challenge'}</h3>
                  <p className="text-sm text-gray-600">{challenge.category}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{challenge.description || 'No description provided'}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge className="bg-blue-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.floor(challenge.estimatedTime / 60)}m {challenge.estimatedTime % 60}s
                </Badge>
                <Badge className="bg-green-600">
                  <Star className="w-3 h-3 mr-1" />
                  {challenge.maxScore} pts
                </Badge>
                {challenge.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <h4 className="font-semibold mb-2">📋 Instructions</h4>
              <div className="bg-white/80 rounded-lg p-3 text-sm whitespace-pre-wrap">
                {challenge.instructions || 'No instructions provided'}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">💡 Hints ({challenge.hints.filter(h => h.trim()).length})</h4>
              <div className="space-y-2">
                {challenge.hints.filter(h => h.trim()).map((hint, i) => (
                  <div key={i} className="bg-white/80 rounded-lg p-3 text-sm flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">✓ Test Cases ({challenge.testCases.filter(tc => tc.input && tc.expectedOutput).length})</h4>
              <div className="space-y-2">
                {challenge.testCases.filter(tc => tc.input && tc.expectedOutput).map((tc, i) => (
                  <div key={tc.id} className="bg-white/80 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Input:</span> <code className="bg-gray-100 px-2 py-1 rounded">{tc.input}</code>
                      </div>
                      <div>
                        <span className="text-gray-600">Output:</span> <code className="bg-gray-100 px-2 py-1 rounded">{tc.expectedOutput}</code>
                      </div>
                    </div>
                    {tc.description && (
                      <p className="text-gray-600 mt-2 text-xs">{tc.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {validationErrors.length > 0 && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    );
  };

  const steps = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'details', label: 'Details', icon: Edit },
    { id: 'tests', label: 'Test Cases', icon: CheckCircle },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Wand2 className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Challenge Creator</h2>
              <p className="text-sm text-purple-100">Design your own custom challenge</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            ✕
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive ? 'bg-purple-600 text-white' : 
                      isCompleted ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'basic' && renderBasicInfo()}
          {currentStep === 'details' && renderDetails()}
          {currentStep === 'tests' && renderTestCases()}
          {currentStep === 'preview' && renderPreview()}
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {publishSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <Card className="p-8 bg-white text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Challenge Published!</h3>
                <p className="text-gray-600">Your challenge is now available for students to compete</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = steps.findIndex(s => s.id === currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1].id as any);
              }
            }}
            disabled={currentStep === 'basic'}
          >
            ← Previous
          </Button>

          <div className="flex gap-3">
            {currentStep === 'preview' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('basic')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={publishChallenge}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Publish Challenge
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1].id as any);
                  }
                }}
              >
                Next →
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
