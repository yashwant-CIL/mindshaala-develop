import React, { useState, useEffect } from 'react';
import { Competitions } from './Competitions';
import { Leaderboard } from './Leaderboard';
import { CompetitionHistory } from './CompetitionHistory';
import { CompetitionResult } from './CompetitionResult';
import { Trophy, Medal, Award, FileText } from 'lucide-react';

export type CompetitionTabType = 'competitions' | 'leaderboard' | 'competition-history' | 'competition-result';

export const CompetitionArenaHub: React.FC<{ initialTab?: CompetitionTabType }> = ({
  initialTab = 'leaderboard'
}) => {
  const [activeTab, setActiveTab] = useState<CompetitionTabType>(initialTab);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>('attempt-101');
  const [selectedAttemptData, setSelectedAttemptData] = useState<any>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSelectAttempt = (attemptId: string, attemptData?: any) => {
    setSelectedAttemptId(attemptId);
    setSelectedAttemptData(attemptData);
    setActiveTab('competition-result');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Arena Navigation Bar - Light Theme */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 pl-14 pr-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              MindShaala Competition Arena
            </div>
            <div className="text-xs text-slate-500">National Contests, Olympiads, Leaderboards & Attempted Results</div>
          </div>
        </div>

        {/* Tab Navigation Pills */}
        {/* <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Medal className={`w-4 h-4 ${activeTab === 'leaderboard' ? 'text-amber-300' : 'text-amber-500'}`} />
            Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'competitions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Trophy className={`w-4 h-4 ${activeTab === 'competitions' ? 'text-amber-300' : 'text-amber-500'}`} />
            Competitions
          </button>

          <button
            onClick={() => setActiveTab('competition-history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'competition-history' || activeTab === 'competition-result'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'competition-history' || activeTab === 'competition-result' ? 'text-amber-300' : 'text-blue-600'}`} />
            Result
          </button>
        </div> */}
      </div>

      {/* Tab Content Rendering */}
      <div className="flex-1">
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'competitions' && <Competitions />}
        {activeTab === 'competition-history' && (
          <CompetitionHistory
            onSelectCompetition={handleSelectAttempt}
            onExploreCompetitions={() => setActiveTab('competitions')}
          />
        )}
        {activeTab === 'competition-result' && (
          <CompetitionResult
            attemptId={selectedAttemptId}
            attemptData={selectedAttemptData}
            moduleType={selectedAttemptData?.moduleType || selectedAttemptData?.module_type}
            onBack={() => setActiveTab('competition-history')}
          />
        )}
      </div>
    </div>
  );
};

export default CompetitionArenaHub;
