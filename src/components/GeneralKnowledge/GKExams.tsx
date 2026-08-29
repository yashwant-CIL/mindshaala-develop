import { useState, useEffect } from 'react';
import { GKService } from '../../services/GKService';
import {
  Flame,
  Library,
  Globe,
  Scale,
  TrendingUp,
  Atom,
  Cpu,
  Trophy,
  Palette,
  Anchor,
  Users,
  Leaf,
  ShieldAlert,
  Rocket,
  Award,
  BookOpen,
  UserCheck,
  Briefcase,
  Coins,
  Compass,
  Brain,
  Map,
  Search,
  Check,
  Sparkles,
  Settings,
  Target,
  Info,
  ClipboardList,
  Play
} from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

const iconMap: Record<string, any> = {
  Flame,
  Library,
  Globe,
  Scale,
  TrendingUp,
  Atom,
  Cpu,
  Trophy,
  Palette,
  Anchor,
  Users,
  Leaf,
  ShieldAlert,
  Rocket,
  Award,
  BookOpen,
  UserCheck,
  Briefcase,
  Coins,
  Compass,
  Brain,
  Map
};

interface GKExamsProps {
  onStartExam: (
    category: string, 
    subcategory: string, 
    initialQuestions?: any[], 
    assessmentId?: number | string,
    totalMarks?: number,
    totalTimeSeconds?: number,
    assessmentName?: string
  ) => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const mapBackendQuestionToFrontend = (q: any): Question => {
  const details = q.question_details || {};
  const options = Array.isArray(q.options) 
    ? q.options 
    : (Array.isArray(q.choices) 
        ? q.choices 
        : (Array.isArray(details.choices)
            ? details.choices
            : [
                q.option1_latex || q.option_1_latex || q.option1 || q.option_a || q.option_a_latex || details.option1_latex || details.option_a,
                q.option2_latex || q.option_2_latex || q.option2 || q.option_b || q.option_b_latex || details.option2_latex || details.option_b,
                q.option3_latex || q.option_3_latex || q.option3 || q.option_c || q.option_c_latex || details.option3_latex || details.option_c,
                q.option4_latex || q.option_4_latex || q.option4 || q.option_d || q.option_d_latex || details.option4_latex || details.option_d,
              ].filter(opt => opt !== undefined && opt !== null && String(opt).trim() !== "")));

  const parseCorrectAnswer = (item: any): number => {
    const itemDetails = item.question_details || {};
    const raw = item.correctAnswer !== undefined ? item.correctAnswer : 
                item.correct_answer !== undefined ? item.correct_answer : 
                item.correct_option !== undefined ? item.correct_option :
                itemDetails.correct_option !== undefined ? itemDetails.correct_option : 
                itemDetails.correct_answer !== undefined ? itemDetails.correct_answer : null;

    if (raw === null || raw === undefined) return 0;
    
    if (typeof raw === 'number') {
      if (raw >= 1 && raw <= 4) return raw - 1;
      return raw;
    }
    
    if (typeof raw === 'string') {
      const clean = raw.toLowerCase().trim();
      if (clean === 'a' || clean === 'option_a' || clean === 'option1' || clean === '1') return 0;
      if (clean === 'b' || clean === 'option_b' || clean === 'option2' || clean === '2') return 1;
      if (clean === 'c' || clean === 'option_c' || clean === 'option3' || clean === '3') return 2;
      if (clean === 'd' || clean === 'option_d' || clean === 'option4' || clean === '4') return 3;
      
      const parsed = parseInt(clean);
      if (!isNaN(parsed)) {
        if (parsed >= 1 && parsed <= 4) return parsed - 1;
        return parsed;
      }
    }
    return 0;
  };

  return {
    id: String(q.id || q.question_id || q.gk_question_id || details.question_id || Math.random()),
    question: q.gk_question || details.gk_question || q.question || q.question_text || q.question_latex || q.que || details.question_latex || details.question_text || '',
    options: options.length > 0 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: parseCorrectAnswer(q),
    explanation: q.gk_answer || details.gk_answer || q.explanation || q.explanation_text || details.explanation || details.explanation_text || '',
    difficulty: q.difficulty || details.difficulty || 'Medium'
  };
};

export default function GKExams({ onStartExam }: GKExamsProps) {
  const [assessmentType, setAssessmentType] = useState<'40M Standard' | '100M Advanced'>('40M Standard');
  const [creationMode, setCreationMode] = useState<'Normal' | 'Custom'>('Normal');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<(string | number)[]>([]);
  const [normalCategoryIds, setNormalCategoryIds] = useState<(string | number)[]>([]);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all GK categories on mount (needed for Custom selection)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await GKService.getGKCategories();
        if (Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
          console.log("Dynamic GK Categories", data.data);
        } 
        // else {
        //   setCategories(GK_CATEGORIES);
        //   console.log("Static GK Categories", GK_CATEGORIES);
        // }
      } catch (error) {
        console.error("Failed to fetch GK categories, falling back to static data:", error);
        setCategories([]);
        // setCategories(GK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch user's profile focus area categories on mount (needed for Normal mode)
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
      if (!userId) return;

      try {
        setProfileLoading(true);
        const response = await GKService.fetchGKProfile(userId);
        if (response && Array.isArray(response.area_of_focus)) {
          const ids = response.area_of_focus.map((f: any) => f.category_id);
          setNormalCategoryIds(ids);
          console.log("User Profile Categories Loaded:", ids);
        }
      } catch (error) {
        console.error("Failed to fetch GK profile focus areas:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleToggleCategory = (catId: string | number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId) 
        : [...prev, catId]
    );
  };

  const handleStartGKAssessment = async () => {
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
    if (!userId) {
      toast.error("User session not found. Please log in.");
      return;
    }

    let finalCategoryIds: (string | number)[] = [];

    if (creationMode === 'Normal') {
      if (profileLoading) {
        toast.error("Still loading focus areas from your profile...");
        return;
      }
      if (normalCategoryIds.length === 0) {
        toast.error("Your focus profile is empty. Please set up your Area of Focus in Profile settings first, or choose 'Custom' creation mode.");
        return;
      }
      finalCategoryIds = normalCategoryIds;
    } else {
      if (selectedCategoryIds.length === 0) {
        toast.error("Please select at least one category for the custom assessment.");
        return;
      }
      finalCategoryIds = selectedCategoryIds;
    }

    try {
      setSubmitting(true);
      const payload = {
        module_type: "GK",
        user_id: userId,
        gk_assessment_type: assessmentType,
        gk_creation_mode: creationMode,
        category_ids: finalCategoryIds.map(id => Number(id))
      };
      
      toast.loading("Preparing assessment questions...", { id: "start-gk-toast" });
      const res = await GKService.startGKAssessment(payload);
      
      const rawQuestions = res?.data?.questions || res?.questions || res?.data || [];
      const assessmentId = res?.data?.gk_user_ass_id || res?.gk_user_ass_id || res?.data?.id || '';
      const totalMarks = res?.data?.total_marks || res?.total_marks || 40;
      const totalTimeSeconds = res?.data?.total_time_seconds || res?.total_time_seconds || 3600;
      
      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        throw new Error("No questions were returned from the assessment engine.");
      }

      toast.success("GK Assessment is ready!", { id: "start-gk-toast" });

      const mappedQuestions = rawQuestions.map(mapBackendQuestionToFrontend);

      // Trigger the parent's start exam method
      onStartExam(
        creationMode === 'Normal' ? 'Normal Profile' : 'Custom Selection',
        assessmentType,
        mappedQuestions,
        assessmentId,
        totalMarks,
        totalTimeSeconds,
        res?.data?.gk_assessment_name || res?.gk_assessment_name || 'GK MCQ Exam'
      );
    } catch (error: any) {
      console.error("Error starting assessment:", error);
      toast.error(error.message || "Failed to start assessment. Please try again.", { id: "start-gk-toast" });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter categories by search query
  const filteredCategories = categories.filter(cat => {
    const name = cat.name || cat.category_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isStartDisabled = submitting || 
    (creationMode === 'Normal' && (profileLoading || normalCategoryIds.length === 0)) ||
    (creationMode === 'Custom' && selectedCategoryIds.length === 0);

  return (
    <div className="flex-1 bg-slate-50/60 min-h-screen pb-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 relative overflow-hidden">
        {/* <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div> */}
        
        <div className=" mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">GK MCQ Exam</h1>
              <p className="text-slate-500 font-medium">Configure and start your general knowledge evaluation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className=" mx-auto px-8 mt-10 space-y-8">
        
        {/* Form panel */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 p-8 md:p-10 space-y-8">
          
          {/* Section 1: Assessment Type Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                1. Select Assessment Type
              </h3>
              <p className="text-slate-500 text-xs font-semibold mt-1">Choose the length and depth of the evaluation module.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: 40M Standard */}
              <button
                type="button"
                onClick={() => setAssessmentType('40M Standard')}
                className={`p-6 rounded-[2rem] border text-left transition-all duration-300 flex items-start gap-4 relative overflow-hidden group cursor-pointer ${
                  assessmentType === '40M Standard'
                    ? 'border-indigo-500 bg-indigo-50/20 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  assessmentType === '40M Standard' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-sm">40M Standard</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Standard rapid assessment featuring up to 40 multiple-choice questions. Great for quick daily revisions.
                  </p>
                </div>
                {assessmentType === '40M Standard' && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full p-1">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                )}
              </button>

              {/* Option B: 100M Advanced */}
              <button
                type="button"
                onClick={() => setAssessmentType('100M Advanced')}
                className={`p-6 rounded-[2rem] border text-left transition-all duration-300 flex items-start gap-4 relative overflow-hidden group cursor-pointer ${
                  assessmentType === '100M Advanced'
                    ? 'border-indigo-500 bg-indigo-50/20 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  assessmentType === '100M Advanced' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-sm">100M Advanced</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Detailed high-tier assessment containing up to 100 questions. Designed for advanced test preparation.
                  </p>
                </div>
                {assessmentType === '100M Advanced' && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full p-1">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                )}
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Creation Mode Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                2. Select Creation Mode
              </h3>
              <p className="text-slate-500 text-xs font-semibold mt-1">Determine how questions should be categorized.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Normal (Profile-based focus areas) */}
              <button
                type="button"
                onClick={() => setCreationMode('Normal')}
                className={`p-6 rounded-[2rem] border text-left transition-all duration-300 flex items-start gap-4 relative overflow-hidden group cursor-pointer ${
                  creationMode === 'Normal'
                    ? 'border-indigo-500 bg-indigo-50/20 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  creationMode === 'Normal' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Target className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-sm">Normal Mode</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Auto-configure categories using the area of focus priorities defined in your Profile settings.
                  </p>
                </div>
                {creationMode === 'Normal' && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full p-1">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                )}
              </button>

              {/* Option B: Custom (Manual Selection) */}
              <button
                type="button"
                onClick={() => setCreationMode('Custom')}
                className={`p-6 rounded-[2rem] border text-left transition-all duration-300 flex items-start gap-4 relative overflow-hidden group cursor-pointer ${
                  creationMode === 'Custom'
                    ? 'border-indigo-500 bg-indigo-50/20 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  creationMode === 'Custom' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-sm">Custom Mode</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Manually select specific topics and categories to assemble a custom general knowledge exam.
                  </p>
                </div>
                {creationMode === 'Custom' && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full p-1">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Normal Mode Alert Details */}
          {creationMode === 'Normal' && (
            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100/50">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider">Normal Mode Config</h5>
                {profileLoading ? (
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed animate-pulse">Loading focus areas from your profile...</p>
                ) : normalCategoryIds.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      We found <strong className="text-slate-700">{normalCategoryIds.length} active focus areas</strong> configured on your profile. Assessment questions will be compiled based on these segments.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {normalCategoryIds.map(id => {
                        const matchedCat = categories.find(c => String(c.id || c.category_id) === String(id));
                        if (!matchedCat) return null;
                        return (
                          <span 
                            key={id}
                            className="inline-flex items-center px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 gap-1.5"
                          >
                            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${matchedCat.gradient || 'from-indigo-500 to-blue-500'}`}></span>
                            {matchedCat.name || matchedCat.category_name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-2xl flex items-start gap-2.5 text-amber-700 text-xs font-bold leading-relaxed">
                    <ShieldAlert className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span>No Area of Focus categories were found on your profile.</span>
                      <p className="text-[10px] font-medium text-amber-600 mt-1">
                        Please set them up in your Profile configuration first, or select "Custom Mode" below to manually check categories.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Mode Categories Grid */}
          {creationMode === 'Custom' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest pl-1">
                    Select GK Topics ({selectedCategoryIds.length} Selected)
                  </h4>
                  <p className="text-slate-400 text-[10px] font-semibold mt-0.5 pl-1">Select one or more topics to build your custom MCQ deck.</p>
                </div>
                
                {/* Search query inside custom */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-[2rem] border border-slate-100 border-dashed">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-xs font-semibold mt-2">Loading categories...</p>
                </div>
              ) : filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-72 overflow-y-auto pr-1.5 custom-scrollbar">
                  {filteredCategories.map(cat => {
                    const catId = cat.id || cat.category_id;
                    const catName = cat.name || cat.category_name || '';
                    const isSelected = selectedCategoryIds.includes(catId);
                    
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => handleToggleCategory(catId)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/10 shadow-sm shadow-indigo-500/5 ring-1 ring-indigo-500'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 bg-gradient-to-r ${cat.gradient || 'from-indigo-500 to-blue-500'}`} />
                          <span className="text-xs font-black text-slate-700 truncate leading-none">{catName}</span>
                        </span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 group-hover:border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-bold text-xs">No categories match your search</p>
                </div>
              )}
            </div>
          )}

          {/* Validation & Launch Footer */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleStartGKAssessment}
              disabled={isStartDisabled}
              className={`w-[250px] py-4.5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2.5 ${
                isStartDisabled
                  ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200/80'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/20 cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating MCQs...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start assessment</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
