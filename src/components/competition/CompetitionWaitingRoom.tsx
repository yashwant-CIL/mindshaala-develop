import React, { useEffect } from 'react';
import { CompetitionItem, getModuleTypeLabel, getFeeInfo } from './Competitions';
import { useNetworkNow } from '../../utils/networkTime';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Lock,
  Loader2
} from 'lucide-react';

export interface CompetitionWaitingRoomProps {
  comp: CompetitionItem;
  onStartExam: () => void;
  onExit: () => void;
}

export const CompetitionWaitingRoom: React.FC<CompetitionWaitingRoomProps> = ({
  comp,
  onStartExam,
  onExit
}) => {
  const nowMs = useNetworkNow(1000);

  const startTimeMs = comp.start_time ? new Date(comp.start_time).getTime() : 0;
  const diffMs = startTimeMs > 0 ? startTimeMs - nowMs : 0;
  const isStarted = startTimeMs > 0 && diffMs <= 0;

  // Attempt browser fullscreen on mount for true full screen experience
  useEffect(() => {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // ignore gesture restrictions
      });
    }
  }, []);

  // Auto-launch exam screen when countdown hits 0
  useEffect(() => {
    if (isStarted) {
      console.log("Waiting room timer reached 0! Auto-launching Competition Exam Screen...");
      onStartExam();
    }
  }, [isStarted, onStartExam]);

  // Time calculations
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diffMs / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diffMs / 1000 / 60) % 60));
  const seconds = Math.max(0, Math.floor((diffMs / 1000) % 60));

  const moduleLabel = getModuleTypeLabel(comp.module_type);
  const { isFree, amount } = getFeeInfo(comp);
  const durationMins = comp.total_time ? Math.floor(comp.total_time / 60) : null;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation - Compact Height */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-2.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" /> Leave Waiting Room
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              OFFICIAL CONTEST
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
              {moduleLabel} MODULE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono font-bold text-emerald-700 text-[11px]">SERVER TIME SYNCED</span>
        </div>
      </header>

      {/* Main Content Body - Perfectly Proportioned & Fit To Screen (No Scroll) */}
      <main className="max-w-5xl w-full mx-auto px-4 md:px-6 py-2 flex-1 flex flex-col justify-evenly space-y-2 overflow-hidden">
        
        {/* Top Waiting Banner */}
        <div className="text-center space-y-1 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold tracking-wide shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Live Security Check & Internet Time Synchronized
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">
            {comp.title}
          </h1>

          {comp.subject_name && (
            <p className="text-slate-500 text-xs font-semibold">
              Subject: <span className="text-slate-900 font-bold">{comp.subject_name}</span> &bull; {durationMins ? `${durationMins} Minutes Exam` : 'Timed Contest'}
            </p>
          )}
        </div>

        {/* Central Digital Timer Card - Compact Heights */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-md text-center space-y-4 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="space-y-0.5">
            <div className="text-[11px] uppercase font-extrabold tracking-widest text-slate-400">
              Exam Starts Automatically In
            </div>
            <p className="text-slate-500 text-[11px] font-medium">
              Stay on this page. You will be redirected to the exam screen automatically without clicking!
            </p>
          </div>

          {/* Digital Timer Blocks */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xl mx-auto font-mono">
            {/* Days */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 md:p-3 shadow-sm flex flex-col items-center">
              <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-wider">
                {String(days).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                DAYS
              </span>
            </div>

            {/* Hours */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 md:p-3 shadow-sm flex flex-col items-center">
              <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-wider">
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                HOURS
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 md:p-3 shadow-sm flex flex-col items-center">
              <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-wider">
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                MINS
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 md:p-3 shadow-sm flex flex-col items-center">
              <span className="text-2xl md:text-4xl font-black text-blue-600 tracking-wider animate-pulse">
                {String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-blue-700 mt-1 uppercase tracking-widest">
                SECS
              </span>
            </div>
          </div>

          {/* Auto Launch Status Pill */}
          <div className="pt-1 flex items-center justify-center">
            {isStarted ? (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 animate-bounce">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                Time Up! Launching Exam Screen Now...
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                <Lock className="w-3 h-3 text-slate-500" />
                Waiting Room Active &bull; Auto-start enabled
              </div>
            )}
          </div>
        </div>

        {/* Exam Specifications & System Check Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
          {/* Competition Summary Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> Contest Specifications
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-medium">Questions</span>
                <span className="text-xs font-bold text-slate-900 block">{comp.total_questions ?? '--'} Items</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-medium">Total Marks</span>
                <span className="text-xs font-bold text-slate-900 block">{comp.total_marks ?? '--'} Marks</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-medium">Module Format</span>
                <span className="text-xs font-bold text-indigo-700 block">{moduleLabel}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-medium">Entry Fee</span>
                <span className="text-xs font-bold text-emerald-600 block">{isFree ? 'FREE' : `₹${amount}`}</span>
              </div>
            </div>
          </div>

          {/* Security & System Check Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Proctoring System Check
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Internet Clock Sync
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 uppercase">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tab-Switch Monitor
                </span>
                <span className="text-[9px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded border border-slate-300 uppercase">3 Warnings Allowed</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Auto-Submit Protection
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 uppercase">ENABLED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rules & Guidelines - Compact */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1 shadow-sm shrink-0">
          <div className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-amber-800 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Competition Guidelines
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-tight font-medium">
            <li>Do not switch tabs, minimize browser, or exit fullscreen during the competition.</li>
            <li>You can manually end the competition at any time using the <strong>"End Competition"</strong> button in the top bar.</li>
            <li>When the total contest time expires, your answers will be automatically submitted.</li>
          </ul>
        </div>
      </main>

      {/* Footer - Compact */}
      <footer className="w-full border-t border-slate-200 py-2 text-center text-[11px] text-slate-500 font-medium shrink-0">
        MindShaala Competition Engine &bull; Internet Time Protection &bull; Single Viewport Fit Screen
      </footer>
    </div>
  );
};

export default CompetitionWaitingRoom;
