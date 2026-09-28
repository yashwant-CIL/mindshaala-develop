import React from 'react';
import { 
  MapPin, 
  Compass, 
  Award, 
  Play, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles,
  ArrowRight,
  Target,
  BarChart3
} from 'lucide-react';

interface MapPracticeDashboardProps {
  onNavigate?: (pageId: string) => void;
}

export default function MapPracticeDashboard({ onNavigate }: MapPracticeDashboardProps) {
  // Performance data
  const stats = [
    {
      title: 'Maps Mastered',
      value: '12 / 18',
      subtitle: '66% completion',
      icon: MapPin,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Accuracy Rate',
      value: '88.5%',
      subtitle: '+4.2% this week',
      icon: Target,
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Pinpoint Speed',
      value: '4.2s',
      subtitle: 'Avg time per location',
      icon: Clock,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Total Assessments',
      value: '24',
      subtitle: '18 high scores',
      icon: Award,
      color: 'from-blue-500 to-sky-600',
      bgColor: 'bg-sky-50 text-blue-600'
    }
  ];

  const mapCategories = [
    {
      id: 'india-physical',
      title: 'India Physical & Rivers',
      description: 'Major mountain ranges, river basins, plateaus & coastal plains',
      locationsCount: 45,
      difficulty: 'Intermediate',
      completedPercent: 85,
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'world-political',
      title: 'World Political Boundaries',
      description: 'Continents, country capitals, major gulfs and ocean routes',
      locationsCount: 120,
      difficulty: 'Advanced',
      completedPercent: 60,
      image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'indian-states',
      title: 'States & Union Territories',
      description: '28 States, 8 Union Territories and state capitals recognition',
      locationsCount: 36,
      difficulty: 'Beginner',
      completedPercent: 100,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'historical-sites',
      title: 'Ancient Indian Civilizations',
      description: 'Harappan sites, Ashokan edicts, UNESCO heritage locations',
      locationsCount: 28,
      difficulty: 'Expert',
      completedPercent: 40,
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const recentActivity = [
    { mapName: 'Rivers & Water Bodies of India', score: '92%', time: '2 mins ago', status: 'Passed' },
    { mapName: 'World Mountain Ranges', score: '78%', time: 'Yesterday', status: 'Passed' },
    { mapName: 'National Parks & Wildlife Sanctuaries', score: '95%', time: '3 days ago', status: 'Mastered' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-8 font-sans">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-6 md:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-7xl">
            {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Interactive Spatial Geography</span>
            </div> */}
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Map Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Dashboard</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
              Master geographical coordinates, physical features, river systems, and political borders through high-precision interactive map modules.
            </p>
          </div>

          {/* <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate?.('map-practice-selection')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-blue-900/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Maps</span>
            </button>
            <button
              onClick={() => onNavigate?.('map-practice-assessment')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm border border-white/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Play className="w-5 h-5 fill-current text-blue-400" />
              <span>Take Assessment</span>
            </button>
          </div> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">{stat.title}</span>
                <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access & Map Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Featured Map Practice Modules</h2>
            <p className="text-xs text-slate-500 font-medium">Select a category to practice pinpointing locations on maps</p>
          </div>
          <button
            onClick={() => onNavigate?.('map-practice-selection')}
            className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View All Maps</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mapCategories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => onNavigate?.('map-practice-selection')}
              className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest border border-white/20">
                  {cat.difficulty}
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-black text-white leading-snug drop-shadow-sm">{cat.title}</h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{cat.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{cat.locationsCount} Locations</span>
                    <span className="text-blue-600 font-extrabold">{cat.completedPercent}% Progress</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${cat.completedPercent}%` }}
                    />
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2">
                  <span>Practice Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards & Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Action Cards */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Map Learning Workflow</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => onNavigate?.('map-practice-selection')}
              className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/60 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">1. Map Selection</h4>
              <p className="text-xs text-slate-500 font-medium">Choose region, topic, or state map to study pinpoint landmarks.</p>
            </div>

            <div 
              onClick={() => onNavigate?.('map-practice-assessment')}
              className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">2. Assessment</h4>
              <p className="text-xs text-slate-500 font-medium">Test spatial precision with live timer and coordinate checking.</p>
            </div>

            <div 
              onClick={() => onNavigate?.('map-practice-result')}
              className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/60 hover:border-sky-400 hover:bg-sky-50 transition-all cursor-pointer space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">3. Detailed Result</h4>
              <p className="text-xs text-slate-500 font-medium">Review score breakdown, spatial accuracy & missed locations.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>Recent Activity</span>
            </h3>
            <button 
              onClick={() => onNavigate?.('map-practice-result')}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              View Report
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={index} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{item.mapName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{item.time}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-black text-xs">
                    {item.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
