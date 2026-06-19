import { useState } from 'react';
import { 
  GK_CATEGORIES, 
  GKCategory 
} from './GKQuestionsData';
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
  ArrowLeft,
  Play,
  ClipboardList
} from 'lucide-react';

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
  onStartExam: (category: string, subcategory: string) => void;
}

export default function GKExams({ onStartExam }: GKExamsProps) {
  const [selectedCategory, setSelectedCategory] = useState<GKCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryClick = (category: GKCategory) => {
    setSelectedCategory(category);
    setSearchQuery(''); // reset search on category switch
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Filter logic
  const filteredCategories = GK_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.subcategories.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSubcategories = selectedCategory 
    ? selectedCategory.subcategories.filter(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen pb-20">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {selectedCategory ? (
              <button 
                onClick={handleBack}
                className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100">
                <ClipboardList className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {selectedCategory ? selectedCategory.name : 'General Knowledge Exams'}
              </h1>
              <p className="text-slate-500 font-medium">
                {selectedCategory 
                  ? `Choose a sub-topic under ${selectedCategory.name} to begin your MCQ Exam.` 
                  : 'Challenge yourself across 22 primary GK sections. Pick a category to view sub-topics.'
                }
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={selectedCategory ? "Search subcategories..." : "Search categories or sub-topics..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-sm font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-8 mt-10">
        {!selectedCategory ? (
          /* CATEGORIES GRID */
          filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || Globe;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-6 flex flex-col justify-between h-56 relative overflow-hidden"
                  >
                    {/* Top Accent Gradient Line */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cat.gradient}`} />
                    
                    <div className="space-y-4">
                      {/* Icon container */}
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center shadow-lg shadow-blue-500/10`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors leading-snug">
                          {cat.name}
                        </h3>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                          {cat.subcategories.length} Sub-topics
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors pt-4 border-t border-slate-50">
                      <span>Explore Topics</span>
                      <Play className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold text-lg">No matching categories found</p>
              <p className="text-slate-400 text-sm mt-1">Try searching with a different term.</p>
            </div>
          )
        ) : (
          /* SUBCATEGORIES PAGE */
          <div className="space-y-8 animate-fadeIn">
            {/* Header info */}
            <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${selectedCategory.gradient} text-white shadow-xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white/90">
                    Category Selected
                  </span>
                  <h2 className="text-3xl font-black mt-3 leading-tight">{selectedCategory.name} Sub-Topics</h2>
                  <p className="text-white/80 text-sm mt-2 max-w-xl font-medium">
                    Assess your understanding of specific historical branches, regional characteristics, policies, or current events.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
                  <div className="text-3xl font-black">{selectedCategory.subcategories.length}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white/90 leading-tight">Available<br />Exams</div>
                </div>
              </div>
            </div>

            {/* Subcategories list */}
            {filteredSubcategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredSubcategories.map((sub, idx) => (
                  <div
                    key={idx}
                    onClick={() => onStartExam(selectedCategory.name, sub)}
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-pointer flex flex-col justify-between h-40"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GK Practice Module</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors">
                        {sub}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50/50 group-hover:bg-blue-600 group-hover:text-white px-4 py-2.5 rounded-xl transition-all self-start mt-4">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start MCQ Exam</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-bold text-lg">No subcategories found</p>
                <p className="text-slate-400 text-sm mt-1">Try matching standard keywords.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
