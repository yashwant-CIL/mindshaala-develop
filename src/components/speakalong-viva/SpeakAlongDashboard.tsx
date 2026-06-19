import React from 'react';
import { Play, Mic, Activity, Clock, Sparkles } from 'lucide-react';

interface DashboardProps {
  onStartNew: () => void;
}

export default function SpeakAlongDashboard({ onStartNew }: DashboardProps) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" /> SpeakAlong Mode
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            SpeakAlong <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Practice pronunciation and fluency with AI text-to-speech chunking.</p>
        </div>
        
        <button 
          onClick={onStartNew}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap"
        >
          <Play className="w-5 h-5 fill-current" /> Start Practice
        </button>
      </div>

      {/* Mock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Sessions Completed</p>
            <p className="text-3xl font-black text-slate-900">0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Practice Time</p>
            <p className="text-3xl font-black text-slate-900">0m</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Fluency Score</p>
            <p className="text-3xl font-black text-slate-900">N/A</p>
          </div>
        </div>
      </div>

      {/* Empty State History */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mic className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Practice History</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-8">You haven't completed any SpeakAlong sessions yet. Click "Start Practice" to begin your first session.</p>
        <button 
          onClick={onStartNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
        >
          <Play className="w-4 h-4 fill-current" /> Start Your First Session
        </button>
      </div>
    </div>
  );
}
