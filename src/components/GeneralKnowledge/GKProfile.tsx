import { useState, useEffect, useRef } from 'react';
import { GKService } from '../../services/GKService';
import { 
  User, 
  BookOpen, 
  School, 
  Phone, 
  Globe, 
  Check, 
  Award, 
  Target, 
  Sparkles,
  Settings,
  ChevronDown,
  Search,
  X,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function GKProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<{ id: string; percentage: number }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendAreaOfFocusNull, setBackendAreaOfFocusNull] = useState<boolean>(false);
  const [initialSelectedCategories, setInitialSelectedCategories] = useState<{ id: string; percentage: number }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await GKService.getGKCategories();
        if (Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
          console.log("GK Categories", data.data);
        }
      } catch (error) {
        console.error("Failed to fetch GK categories from API:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    // Load Plus Jakarta Sans Google Font
    const fontId = 'google-font-plus-jakarta';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }

    // Fetch GK profile from API
    const fetchProfileFromBackend = async () => {
      const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
      if (!userId) return;

      try {
        const response = await GKService.fetchGKProfile(userId);
        if (response) {
          if (response.user_name) {
            setProfile({ user_name: response.user_name });
          }
          if (response.area_of_focus === null) {
            setBackendAreaOfFocusNull(true);
            setSelectedCategories([]);
            setInitialSelectedCategories([]);
          } else if (Array.isArray(response.area_of_focus)) {
            setBackendAreaOfFocusNull(false);
            const mapped = response.area_of_focus.map((f: any) => ({
              id: String(f.category_id),
              percentage: f.percentage
            }));
            setSelectedCategories(mapped);
            setInitialSelectedCategories(mapped);
          }
        }
      } catch (error) {
        console.error("Failed to fetch GK profile from API, falling back to localStorage:", error);
        
        // Fallback to local storage
        const savedConfig = localStorage.getItem('gk_selected_categories');
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            setSelectedCategories(parsed);
            setInitialSelectedCategories(parsed);
          } catch (e) {
            console.error("Failed to parse gk_selected_categories:", e);
          }
        } else {
          const savedFav = localStorage.getItem('gk_favourite_category_id');
          if (savedFav) {
            const initialFav = [{ id: savedFav, percentage: 100 }];
            setSelectedCategories(initialFav);
            setInitialSelectedCategories(initialFav);
          }
        }
      }
    };

    fetchProfileFromBackend();
  }, []);

  const handleToggleCategory = (catId: string | number) => {
    const exists = selectedCategories.some(c => String(c.id) === String(catId));
    if (exists) {
      setSelectedCategories(prev => prev.filter(c => String(c.id) !== String(catId)));
    } else {
      if (selectedCategories.length >= 3) {
        toast.error("You can select a maximum of 3 focus areas.");
        return;
      }
      
      const newPercentage = selectedCategories.length === 0 ? 100 : 0;
      setSelectedCategories(prev => [...prev, { id: String(catId), percentage: newPercentage }]);
    }
  };

  const handleRemoveCategory = (catId: string | number) => {
    setSelectedCategories(prev => prev.filter(c => String(c.id) !== String(catId)));
  };



  const handlePercentageChange = (catId: string, value: number) => {
    const clampedVal = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
    setSelectedCategories(prev => {
      const otherTotal = prev.filter(c => c.id !== catId).reduce((sum, c) => sum + c.percentage, 0);
      const maxAllowed = 100 - otherTotal;
      const targetVal = Math.min(clampedVal, maxAllowed);
      return prev.map(c => c.id === catId ? { ...c, percentage: targetVal } : c);
    });
  };

  const handleQuickTune = (catId: string, delta: number) => {
    setSelectedCategories(prev => 
      prev.map(c => {
        if (c.id === catId) {
          const newVal = Math.min(100, Math.max(0, c.percentage + delta));
          return { ...c, percentage: newVal };
        }
        return c;
      })
    );
  };

  const handleAutoBalance = () => {
    const len = selectedCategories.length;
    if (len === 0) return;
    
    if (len === 1) {
      setSelectedCategories(prev => prev.map(c => ({ ...c, percentage: 100 })));
    } else if (len === 2) {
      setSelectedCategories(prev => 
        prev.map((c, idx) => ({ ...c, percentage: 50 }))
      );
    } else if (len === 3) {
      setSelectedCategories(prev => 
        prev.map((c, idx) => ({ 
          ...c, 
          percentage: idx === 0 ? 34 : 33 
        }))
      );
    }
    toast.success("Focus weights distributed evenly!");
  };

  const totalWeight = selectedCategories.reduce((sum, c) => sum + c.percentage, 0);
  const isBalanced = totalWeight === 100;

  const hasChanges = (() => {
    if (selectedCategories.length !== initialSelectedCategories.length) return true;
    for (const item of selectedCategories) {
      const match = initialSelectedCategories.find(o => String(o.id) === String(item.id));
      if (!match || match.percentage !== item.percentage) return true;
    }
    return false;
  })();

  const handleSave = () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one focus area.");
      return;
    }
    if (totalWeight !== 100) {
      toast.error(`Total weight must be exactly 100% (currently ${totalWeight}%).`);
      return;
    }

    const payload = {
      area_of_focus: selectedCategories.map(c => ({
        category_id: parseInt(c.id),
        percentage: c.percentage
      }))
    };
    console.log("payload to update the GK Profie", payload);
    
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id');

    if (userId) {
      toast.promise(
        GKService.updateGKProfile(userId, payload).then(() => {
          localStorage.setItem('gk_selected_categories', JSON.stringify(selectedCategories));
          
          const sorted = [...selectedCategories].sort((a, b) => b.percentage - a.percentage);
          if (sorted.length > 0) {
            localStorage.setItem('gk_favourite_category_id', sorted[0].id);
          } else {
            localStorage.removeItem('gk_favourite_category_id');
          }
          setBackendAreaOfFocusNull(false);
          setInitialSelectedCategories(selectedCategories);
        }),
        {
          loading: 'Saving focus setup...',
          success: 'GK Area of Focus configuration saved successfully!',
          error: 'Failed to save configuration.'
        }
      );
    } else {
      toast.error("User ID not found.");
    }
  };

  const getCategoryColor = (gradient: string) => {
    if (gradient.includes('from-orange-500')) return '#f97316';
    if (gradient.includes('from-amber-600')) return '#d97706';
    if (gradient.includes('from-emerald-500')) return '#10b981';
    if (gradient.includes('from-blue-600')) return '#2563eb';
    if (gradient.includes('from-cyan-500')) return '#06b6d4';
    if (gradient.includes('from-purple-500')) return '#a855f7';
    if (gradient.includes('from-slate-700')) return '#334155';
    if (gradient.includes('from-rose-500')) return '#f43f5e';
    if (gradient.includes('from-pink-500')) return '#ec4899';
    if (gradient.includes('from-sky-500')) return '#0ea5e9';
    return '#6366f1';
  };

  const donutGradient = (() => {
    if (selectedCategories.length === 0) {
      return 'conic-gradient(#f1f5f9 0% 100%)';
    }
    
    let currentOffset = 0;
    const segments: string[] = [];
    
    selectedCategories.forEach(item => {
      const cat = categories.find(c => String(c.category_id || c.id) === String(item.id));
      const color = cat ? getCategoryColor(cat.gradient || '') : '#3b82f6';
      const start = currentOffset;
      const end = Math.min(100, currentOffset + item.percentage);
      currentOffset = end;
      segments.push(`${color} ${start}% ${end}%`);
    });
    
    if (currentOffset < 100) {
      segments.push(`#f1f5f9 ${currentOffset}% 100%`);
    }
    
    return `conic-gradient(${segments.join(', ')})`;
  })();

  const getInitials = () => {
    if (!profile) return 'ST';
    if (profile.user_name) {
      const parts = profile.user_name.trim().split(/\s+/);
      const first = parts[0] ? parts[0].charAt(0) : '';
      const last = parts[1] ? parts[1].charAt(0) : '';
      return first || last ? (first + last).toUpperCase() : 'ST';
    }
    const first = (profile.firstName || profile.first_name || '').charAt(0);
    const last = (profile.lastName || profile.last_name || '').charAt(0);
    return first || last ? (first + last).toUpperCase() : 'ST';
  };

  return (
    <div 
      className="flex-1 bg-slate-50 min-h-screen pb-20 transition-all duration-300 ease-out" 
      style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Professional Header */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/40 via-white to-purple-50/30 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">GK Profile</h1>
            <p className="text-slate-500 text-sm font-medium">Configure your area of focus and personal learning weights.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 mt-8 space-y-8">
        {/* Username Header */}
        <div className="flex items-center gap-5 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/30 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-200/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sky-200/10 rounded-full blur-2xl"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 p-[3px] shadow-lg shadow-indigo-100 flex-shrink-0">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center font-black text-xl tracking-wide text-slate-800">
              {getInitials()}
            </div>
          </div>
          <div className="min-w-0">
            {/* <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Welcome back,</span> */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {profile ? (profile.user_name || `${profile.firstName || profile.first_name || ''} ${profile.lastName || profile.last_name || ''}`.trim() || 'User Profile') : 'Loading...'}
              </h2>
              {/* <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100/30">
                {profile?.currentGrade || profile?.current_grade || profile?.standard_name || profile?.standardName || 'Class 10'}
              </span> */}
            </div>
          </div>
        </div>

        {/* Profile Card & Settings Grid */}
        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Personal Details Panel (Left - 2 Cols) - Commented out for now. Change false to true to restore. */}
          {false && (
            <div className="md:col-span-2 bg-gradient-to-tr from-slate-50 via-white to-indigo-50/30 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 flex flex-col items-center text-center relative overflow-hidden">
              {/* Elegant light glowing blobs */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl"></div>
              
              {/* Avatar with premium light gradient ring */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 p-[3px] shadow-xl shadow-indigo-100 relative z-10 mt-4 mb-4">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-3xl tracking-wide text-slate-800">
                  {getInitials()}
                </div>
              </div>
              
              <div className="relative z-10 space-y-2">
                <h3 className="font-black text-xl tracking-tight text-slate-900 leading-snug">
                  {profile ? `${profile.firstName || profile.first_name || ''} ${profile.lastName || profile.last_name || ''}`.trim() || 'User Profile' : 'Loading...'}
                </h3>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100/30">
                  {profile?.currentGrade || profile?.current_grade || profile?.standard_name || profile?.standardName || 'Class 10'}
                </span>
              </div>

              {/* Info items styled as clean, white cards */}
              <div className="w-full mt-8 border-t border-slate-100/80 pt-6 space-y-4.5 text-left relative z-10">
                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center gap-3.5 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-500">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Board</span>
                    <span className="text-sm font-black text-slate-700">
                      {profile?.schoolBoard || profile?.school_board || profile?.board_or_university || profile?.boardOrUniversity || 'ICSE'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center gap-3.5 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-500">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">School</span>
                    <span className="text-sm font-black text-slate-700 truncate block">
                      {profile?.schoolName || profile?.school_name || profile?.institute_name || profile?.instituteName || "St. Xavier's High School"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center gap-3.5 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Mobile</span>
                    <span className="text-sm font-black text-slate-700">
                      {profile?.phoneNumber || profile?.phone_number || profile?.mobile_no || profile?.mobileNo || '9764696566'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Premium Learning Stats Widget */}
              {/* <div className="w-full mt-8 border-t border-slate-100/80 pt-6 text-left relative z-10 space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Learning Metrics</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl text-center space-y-1">
                    <span className="text-xl font-black text-emerald-600 block">85%</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Accuracy</span>
                  </div>
                  <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl text-center space-y-1">
                    <span className="text-xl font-black text-indigo-600 block">42</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Solved</span>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {/* Area of Focus Settings Panel (Right - 3 Cols -> Expanded to col-span-5 to take full width) */}
          <div className="md:col-span-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
                <Target className="w-5 h-5 text-indigo-500" />
                Area of Focus Setup
              </h3>
              
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Configure your preference profile by selecting **up to 3 categories** and adjusting their interest weights. The sum of weights must equal **exactly 100%** to save.
              </p>

              {backendAreaOfFocusNull && selectedCategories.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-xs font-bold flex items-center gap-2.5 animate-pulse">
                  <Target className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>Please select your area of focus (min 1, max 3) to configure your profile.</span>
                </div>
              )}

              {/* Custom Searchable Dropdown Selector */}
              <div ref={dropdownRef} className="space-y-3 relative">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block pl-1">
                  Focus Categories (Max 3)
                </label>
                
                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 text-sm font-bold flex justify-between items-center hover:border-slate-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span>
                      {selectedCategories.length === 0 
                        ? 'Select focus areas...' 
                        : `Selected Categories (${selectedCategories.length}/3)`}
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Popover Menu */}
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 space-y-3 animate-fadeIn">
                    {/* Search bar inside popover */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search focus categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Scrollable list of categories */}
                    <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                      {categories.filter(cat => {
                        const name = cat.category_name || '';
                        const subs = cat.subcategories || cat.sub_categories || [];
                        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          subs.some((sub:any) => sub && typeof sub === 'string' && sub.toLowerCase().includes(searchQuery.toLowerCase()));
                      }).map(cat => {
                        const catId = cat.category_id || cat.id;
                        const catName = cat.category_name || cat.name || '';
                        const isSelected = selectedCategories.some(c => String(c.id) === String(catId));
                        const isLimitReached = selectedCategories.length >= 3 && !isSelected;
                        
                        return (
                          <button
                            key={catId}
                            type="button"
                            disabled={isLimitReached}
                            onClick={() => handleToggleCategory(catId)}
                            className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                              isSelected 
                                ? 'bg-indigo-50/50 text-indigo-600' 
                                : (isLimitReached 
                                    ? 'opacity-40 cursor-not-allowed text-slate-400' 
                                    : 'hover:bg-slate-50 text-slate-700'
                                  )
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {/* Small color dot/badge */}
                              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cat.gradient || 'from-indigo-500 to-blue-500'}`}></span>
                              <span>{catName}</span>
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Badges display below the dropdown trigger */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pl-1">
                    {selectedCategories.map(item => {
                      const cat = categories.find(c => String(c.category_id || c.id) === String(item.id));
                      if (!cat) return null;
                      const catName = cat.category_name || cat.name || '';
                      const isFetched = initialSelectedCategories.some(initial => String(initial.id) === String(item.id));
                      return (
                        <span 
                          key={item.id}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2 animate-fadeIn"
                        >
                          <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cat.gradient || 'from-indigo-500 to-blue-500'}`}></span>
                          <span>{catName}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveCategory(item.id)}
                            className="text-slate-400 hover:text-rose-500 font-bold ml-1 transition-colors cursor-pointer flex items-center justify-center"
                            title={isFetched ? "Delete fetched focus area" : "Remove focus area"}
                          >
                            {isFetched ? (
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Categories Weights Section */}
            <div className="space-y-6">
              {selectedCategories.length > 0 ? (
                <div className="space-y-4">
                  {/* Equally Distribute Button placed elegantly at the top of weights list */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Distribute Weights
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoBalance}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Distribute Equally
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Donut Chart Visualizer & Auto-Balance (Commented out for now) */}
                    {/* 
                    <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/40 rounded-[2rem] border border-slate-100/60 shadow-inner space-y-5">
                      <div 
                        className="w-32 h-32 rounded-full shadow-lg relative flex items-center justify-center transition-all duration-500"
                        style={{ 
                          background: donutGradient,
                          boxShadow: '0 8px 30px rgb(0 0 0 / 0.04), inset 0 2px 4px rgb(255 255 255 / 0.8)'
                        }}
                      >
                        <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center shadow-md relative z-10">
                          <span className={`text-2xl font-black ${isBalanced ? 'text-emerald-500' : 'text-slate-800'}`}>
                            {totalWeight}%
                          </span>
                          <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase mt-0.5">
                            {isBalanced ? 'Balanced' : 'Allocated'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleAutoBalance}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200/80 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        Distribute Equally
                      </button>
                    </div>
                    */}

                    {/* Right Column: Custom Weight Sliders */}
                    <div className="lg:col-span-12 w-full space-y-4">
                    {selectedCategories.map(item => {
                      const cat = categories.find(c => String(c.category_id || c.id) === String(item.id));
                      if (!cat) return null;
                      
                      const themeColor = getCategoryColor(cat.gradient || '');
                      const catName = cat.category_name || cat.name || '';
                      const isFetched = initialSelectedCategories.some(initial => String(initial.id) === String(item.id));
                      
                      return (
                        <div 
                          key={item.id} 
                          className="p-5 bg-white border border-slate-100 rounded-[2rem] space-y-4 relative group transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50"
                          style={{
                            boxShadow: `0 10px 30px -10px ${themeColor}08`
                          }}
                        >
                          {/* Accent left border using theme color */}
                          <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-[2rem]" style={{ backgroundColor: themeColor }}></div>
                          
                          <div className="flex justify-between items-center pl-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                              <span className="text-sm font-black text-slate-800 tracking-tight">
                                {catName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(item.id)}
                              className="font-black transition-colors uppercase tracking-widest cursor-pointer flex items-center gap-1 text-[10px]"
                            >
                              {isFetched ? (
                                <span className="text-rose-500 flex items-center gap-1 hover:text-rose-600">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </span>
                              ) : (
                                <span className="text-slate-400 hover:text-rose-500">Remove</span>
                              )}
                            </button>
                          </div>

                          {/* Dynamic Range Slider (Movable track) */}
                          <div className="space-y-2 pl-3">
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={item.percentage}
                                onChange={(e) => handlePercentageChange(item.id, parseInt(e.target.value))}
                                style={{
                                  accentColor: themeColor
                                }}
                                className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer outline-none transition-all duration-150"
                              />
                              <div className="flex items-center gap-1 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={item.percentage}
                                  onChange={(e) => handlePercentageChange(item.id, parseInt(e.target.value))}
                                  className="w-10 text-center font-mono font-black text-sm bg-transparent text-slate-800 focus:outline-none"
                                />
                                <span className="text-xs font-black text-slate-400">%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100/80 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-500 flex items-center justify-center shrink-0 shadow-inner">
                    <Settings className="w-7 h-7 animate-spin-slow" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-slate-800 text-sm">No Focus Segment Configured</h5>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
                      Select categories above and adjust handles to distribute 100% weight.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Validation & Save Footer */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-black pl-1">
                <span className="text-slate-400 uppercase tracking-widest">Alignment Status</span>
                <span className={isBalanced ? 'text-emerald-500' : 'text-amber-500'}>
                  {isBalanced 
                    ? 'Perfect! Focus weight balanced' 
                    : (totalWeight < 100 
                        ? `${100 - totalWeight}% more interest required` 
                        : `${totalWeight - 100}% excess interest allocated`
                      )
                  }
                </span>
              </div>
              
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner p-[2px]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBalanced 
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' 
                      : (totalWeight > 100 ? 'bg-rose-500' : 'bg-amber-400')
                  }`}
                  style={{ width: `${Math.min(totalWeight, 100)}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={!isBalanced || selectedCategories.length === 0 || !hasChanges}
                className={`w-full py-4.5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl ${
                  isBalanced && selectedCategories.length > 0 && hasChanges
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/20 cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200/80'
                }`}
              >
                {backendAreaOfFocusNull ? 'Save Focus Setup' : 'Update the Focus Setup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
