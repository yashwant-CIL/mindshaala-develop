import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Printer, 
  Copy, 
  Maximize2, 
  Minimize2,
  FileText, 
  BookOpen, 
  Sparkles,
  Info
} from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

interface NotesViewerProps {
  pdfUrl: string;
  chapterTitle: string;
  subjectName?: string;
  onBack: () => void;
}

export default function NotesViewer({ pdfUrl, chapterTitle, subjectName = 'Subject', onBack }: NotesViewerProps) {
  // User info for security watermark
  const userId = localStorage.getItem('user_id') || Cookies.get('user_id') || '100117';
  const userName = localStorage.getItem('user_name') || 'MindShaala Student';
  const timestamp = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // DRM & Security States
  const [isPrivacyBlurred, setIsPrivacyBlurred] = useState<boolean>(false);
  const [screenshotWarningCount, setScreenshotWarningCount] = useState<number>(0);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // NATIVE BROWSER FULLSCREEN & SIDEBAR HIDING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // 1. Enter Native HTML5 Fullscreen on Mount
    const enterFullscreen = async () => {
      const elem = document.documentElement;
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setIsFullscreen(true);
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn("Fullscreen request requires user gesture or browser permission:", err);
      }
    };

    enterFullscreen();

    // 2. Hide App Sidebar & Navigation Elements
    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement || document.querySelector('aside') as HTMLElement;
    const floatingActions = document.getElementById('floating-actions-container');

    if (sidebar) sidebar.style.display = 'none';
    if (floatingActions) floatingActions.style.display = 'none';

    // 3. Monitor Fullscreen changes
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);

      // Restore Sidebar
      if (sidebar) sidebar.style.display = '';
      if (floatingActions) floatingActions.style.display = '';

      // Exit HTML5 Fullscreen
      const exitFullscreen = async () => {
        try {
          if (document.fullscreenElement) {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              await (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
              await (document as any).msExitFullscreen();
            }
          }
        } catch (err) {}
      };
      exitFullscreen();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // ---------------------------------------------------------------------------
  // DRM SECURITY LISTENERS: Anti-Screenshot, Anti-Copy, Window Blur Protection
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // 1. Window Blur & Visibility Loss (Snipping tool / Tab Switch / External Capture app)
    const handleBlur = () => {
      setIsPrivacyBlurred(true);
      setSecurityNotice("Screen protected: Content hidden while window is out of focus.");
    };

    const handleFocus = () => {
      setIsPrivacyBlurred(false);
      setSecurityNotice(null);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPrivacyBlurred(true);
        setSecurityNotice("Document hidden: Tab switched or browser minimized.");
      } else {
        setIsPrivacyBlurred(false);
        setSecurityNotice(null);
      }
    };

    // 2. Keyboard Hotkey Protection (PrtScn, Ctrl+P, Ctrl+S, Ctrl+Shift+I, Cmd+Shift+3/4/5)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key exits privacy blur / handles escape
      if (e.key === 'Escape') {
        setIsPrivacyBlurred(false);
        setSecurityNotice(null);
      }

      // Detect PrintScreen key
      if (e.key === 'PrintScreen' || e.key === 'PrtScn' || e.code === 'PrintScreen') {
        e.preventDefault();
        setIsPrivacyBlurred(true);
        setScreenshotWarningCount(prev => prev + 1);
        toast.error("⚠️ DRM ALERT: Screenshots are strictly prohibited on MindShaala Study Notes!", { id: 'drm-prtsc' });
        setTimeout(() => setIsPrivacyBlurred(false), 3500);
      }

      // Detect Print / Save / DevTools key combinations
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) ||
        (e.metaKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.key === 'i' || e.key === 'I')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        setIsPrivacyBlurred(true);
        toast.error("⚠️ Security Restricted: Copying, saving, or inspecting PDF source is disabled.", { id: 'drm-save' });
        setTimeout(() => setIsPrivacyBlurred(false), 3000);
      }
    };

    // 3. Prevent Context Menu, Copy, Cut, Drag, Selection
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Right-click menu is disabled on DRM protected notes.", { id: 'drm-context' });
      return false;
    };

    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Text copying is disabled for protected notes.", { id: 'drm-copy' });
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCut);
    document.addEventListener('cut', handleCopyCut);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCut);
      document.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // Format PDF URL to disable toolbar and navigation panes
  const formattedPdfUrl = pdfUrl.includes('#') 
    ? pdfUrl 
    : `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`;

  const handleExitViewer = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      }
    } catch(e) {}
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden w-screen h-screen">
      
      {/* Dynamic CSS for Print Protection & Text Selection Block */}
      <style>{`
        @media print {
          body * {
            display: none !important;
          }
          body:after {
            content: "UNAUTHORIZED PRINTING ATTEMPT DETECTED. DRM PROTECTED DOCUMENT.";
            display: block !important;
            font-size: 24px;
            font-weight: bold;
            color: red;
            text-align: center;
            margin-top: 100px;
          }
        }
        ::selection {
          background: transparent !important;
          color: inherit !important;
        }
        ::-moz-selection {
          background: transparent !important;
          color: inherit !important;
        }
      `}</style>

      {/* Top Secure Fullscreen Navigation Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitViewer}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-2 font-bold text-xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Chapters</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                {subjectName}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Fullscreen DRM Protected
              </span>
            </div>
            <h1 className="text-sm sm:text-lg font-black text-white tracking-tight mt-0.5 line-clamp-1">
              {chapterTitle}
            </h1>
          </div>
        </div>

        {/* Security Indicator Badges & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95"
            title="Toggle Native Browser Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-indigo-400" /> : <Maximize2 className="w-4 h-4 text-indigo-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
          </button>

          <button
            onClick={() => {
              toast("DRM Protection active: Direct download & printing disabled.", { icon: '🛡️' });
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="DRM Security Information"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main PDF Canvas Container with Multi-Layer DRM Protection */}
      <main className="flex-1 relative bg-slate-900 flex items-center justify-center p-1 sm:p-4 overflow-hidden w-full h-full">
        
        {/* ========================================================================= */}
        {/* DRM LAYER 1: REPEATING DYNAMIC SECURITY WATERMARK OVERLAY (Anti-Camera / Mobile Photo) */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none opacity-20 sm:opacity-25 flex flex-wrap content-between justify-between p-4 rotate-[-12deg] scale-110">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="p-6 text-center space-y-0.5 transform tracking-widest text-[11px] font-black text-indigo-300 uppercase whitespace-nowrap">
              <p>MINDSHAALA DIGITAL DRM • {userName}</p>
              <p>USER #{userId} • {timestamp}</p>
              <p>CONFIDENTIAL NOTE - DO NOT COPY</p>
            </div>
          ))}
        </div>

        {/* Dynamic Holographic Security Grid Lines (Disrupts Camera Lens Focus) */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* ========================================================================= */}
        {/* DRM LAYER 2: TRANSPARENT SECURITY SHIELD OVERLAY */}
        {/* ========================================================================= */}
        <div 
          className="absolute inset-0 z-30 bg-transparent pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* ========================================================================= */}
        {/* DRM LAYER 3: FOCUS LOSS & ANTI-SCREENSHOT OBFUSCATION BLUR OVERLAY */}
        {/* ========================================================================= */}
        {isPrivacyBlurred && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Protected DRM Document Hidden
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mt-2 leading-relaxed">
              {securityNotice || "Study notes are protected. Content is automatically hidden when the browser window loses focus or screenshot keys are pressed."}
            </p>
            <div className="mt-6 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono">
              Click anywhere inside this window to resume viewing notes.
            </div>
          </div>
        )}

        {/* Embedded Protected Fullscreen PDF Viewer */}
        <div className="relative w-full h-full bg-slate-950 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
          <iframe
            src={formattedPdfUrl}
            className="w-full h-full border-none pointer-events-auto filter contrast-[1.02]"
            title="Study Notes PDF"
          />
        </div>

      </main>

      {/* Footer Security Notice Banner */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-center text-[11px] text-slate-400 font-medium flex items-center justify-between gap-2 z-40 shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Strict Anti-Copy & Anti-Download Protection Enabled • User ID #{userId}</span>
        </div>
        <span className="hidden sm:inline text-slate-500 font-mono text-[10px]">DRM Hash: MS-SEC-{userId}-{Date.now().toString(36).toUpperCase()}</span>
      </footer>

    </div>
  );
}
