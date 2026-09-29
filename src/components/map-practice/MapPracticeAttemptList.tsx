import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  MapPin, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Eye, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Layers, 
  Sparkles,
  Compass,
  Calendar,
  Tag,
  Target
} from 'lucide-react';
import { MapPracticeService } from '../../services/MapPracticeService';

// Standard tool icons and colors from Tools.tsx
const TOOL_META: Record<string, { icon: string; studentColor: string; name: string }> = {
  POINT:     { icon: '📍', studentColor: '#3b82f6', name: 'Point' },
  LINE:      { icon: '📏', studentColor: '#8b5cf6', name: 'Line' },
  POLYLINE:  { icon: '〰️', studentColor: '#2563eb', name: 'Polyline' },
  ARROW:     { icon: '➡️', studentColor: '#f59e0b', name: 'Arrow' },
  AREA:      { icon: '🟦', studentColor: '#3b82f6', name: 'Area' },
  POLYGON:   { icon: '⬡', studentColor: '#8b5cf6', name: 'Polygon' },
  LABEL:     { icon: '🏷️', studentColor: '#10b981', name: 'Label' },
  FREEHAND:  { icon: '✍️', studentColor: '#f59e0b', name: 'Freehand' },
  SYMBOL:    { icon: '⭐', studentColor: '#ef4444', name: 'Symbol' },
  CIRCLE:    { icon: '⭕', studentColor: '#3b82f6', name: 'Circle' },
  RECTANGLE: { icon: '▭', studentColor: '#8b5cf6', name: 'Rectangle' },
};

// Answer Key distinct styling (emerald green & magenta dashed)
const ANSWER_KEY_COLOR = '#059669'; // Emerald green
const ANSWER_KEY_STROKE_DASH = '6,4';

export interface AttemptItem {
  attempt_id: number;
  user_id: number | string;
  assessment_id: number;
  subscription_id?: number;
  status: string;
  total_score: number;
  time_taken_seconds?: number | null;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
  assessment_title?: string;
}

export interface StudentAnswer {
  x?: number;
  y?: number;
  label?: string;
  points?: { x: number; y: number }[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  direction?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface EvaluationItem {
  response_object_id?: number;
  tool_type: string;
  student_answer?: StudentAnswer;
  is_correct: number; // 1 or 0
  score_awarded: number;
  matched_distance?: number | null;
  feedback?: string | null;
  question_id?: number;
}

export interface AnswerKeyItem {
  question_id?: number;
  answer_object_id?: number;
  tool_type: string;
  geometry_data?: {
    label?: string;
    marks?: number;
    points?: { x: number; y: number }[];
  };
}

export interface QuestionAttemptDetail {
  question_id: number;
  map_image_url?: string;
  evaluations: EvaluationItem[];
  answer_keys: AnswerKeyItem[];
}

export interface AttemptDetailResponse {
  attempt: AttemptItem;
  questions: QuestionAttemptDetail[];
}

interface MapPracticeAttemptListProps {
  userId?: string | number;
  initialAttemptId?: number;
  onNavigate?: (pageId: string, params?: any) => void;
  onBack?: () => void;
}

export default function MapPracticeAttemptList({ userId: propUserId, initialAttemptId, onNavigate, onBack }: MapPracticeAttemptListProps) {
  // ---------------------------------------------------------------------------
  // State variables
  // ---------------------------------------------------------------------------
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState<boolean>(true);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  // Selected attempt detail view state
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(initialAttemptId || null);
  const [attemptDetail, setAttemptDetail] = useState<AttemptDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Map inspection state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [showStudentAnswers, setShowStudentAnswers] = useState<boolean>(true);
  const [showAnswerKeys, setShowAnswerKeys] = useState<boolean>(true);
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Determine user_id
  const userId = propUserId || localStorage.getItem('user_id') || '100117';

  // Fallback map image URL
  const defaultMapImage = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80';

  // ---------------------------------------------------------------------------
  // Fetch Attempt List
  // ---------------------------------------------------------------------------
  const fetchAttemptList = async () => {
    setIsLoadingAttempts(true);
    setAttemptsError(null);
    try {
      console.log("Fetching map practice attempts for user_id:", userId);
      const data = await MapPracticeService.getListAttempts(userId);
      console.log("List attempts response:", data);

      const attemptsList = data?.attempts || (Array.isArray(data) ? data : data?.data?.attempts || []);
      setAttempts(attemptsList);
    } catch (err: any) {
      console.error("Error loading attempt list:", err);
      setAttemptsError("Failed to load attempt history. Please check connection and try again.");
    } finally {
      setIsLoadingAttempts(false);
    }
  };

  useEffect(() => {
    fetchAttemptList();
  }, [userId]);

  useEffect(() => {
    if (initialAttemptId) {
      handleSelectAttempt(initialAttemptId);
    }
  }, [initialAttemptId]);

  // ---------------------------------------------------------------------------
  // Fetch Attempt Details when clicking an attempt
  // ---------------------------------------------------------------------------
  const handleSelectAttempt = async (attemptId: number) => {
    setSelectedAttemptId(attemptId);
    setIsLoadingDetail(true);
    setDetailError(null);
    setActiveQuestionIdx(0);
    setZoomLevel(1.0);

    try {
      console.log("Fetching attempted question details for attempt_id:", attemptId);
      const data = await MapPracticeService.getAttemptedQuestionsByAttemptId(attemptId);
      console.log("Attempt details response:", data);

      if (data) {
        setAttemptDetail(data);
      } else {
        setDetailError("No detailed evaluation available for this attempt.");
      }
    } catch (err: any) {
      console.error("Error loading attempt details:", err);
      setDetailError("Failed to fetch detailed evaluation for this attempt.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Date formatting helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Current active question item in detailed view
  const currentQuestionDetail = attemptDetail?.questions?.[activeQuestionIdx];

  // Helper to extract geometry points for SVG rendering
  const getPointsFromStudentAnswer = (evalItem: EvaluationItem) => {
    const ans = evalItem.student_answer;
    if (!ans) return [];
    
    if (ans.points && Array.isArray(ans.points) && ans.points.length > 0) {
      return ans.points;
    }
    if (ans.x !== undefined && ans.y !== undefined) {
      return [{ x: ans.x, y: ans.y }];
    }
    if (ans.start && ans.end) {
      return [ans.start, ans.end];
    }
    if (ans.x1 !== undefined && ans.y1 !== undefined && ans.x2 !== undefined && ans.y2 !== undefined) {
      return [{ x: ans.x1, y: ans.y1 }, { x: ans.x2, y: ans.y2 }];
    }
    return [];
  };

  const getPointsFromAnswerKey = (keyItem: AnswerKeyItem) => {
    const pts = keyItem.geometry_data?.points;
    if (pts && Array.isArray(pts)) return pts;
    return [];
  };

  // Filter evaluations & answer keys based on tool filter
  const filteredEvaluations = (currentQuestionDetail?.evaluations || []).filter(e => 
    selectedToolFilter === 'ALL' || e.tool_type?.toUpperCase() === selectedToolFilter
  );

  const filteredAnswerKeys = (currentQuestionDetail?.answer_keys || []).filter(k => 
    selectedToolFilter === 'ALL' || k.tool_type?.toUpperCase() === selectedToolFilter
  );

  // Calculate statistics for active attempt
  const totalScore = attemptDetail?.attempt?.total_score ?? 0;
  const questionsCount = attemptDetail?.questions?.length || 0;
  let totalCorrect = 0;
  let totalEvaluations = 0;

  attemptDetail?.questions?.forEach(q => {
    q.evaluations?.forEach(ev => {
      totalEvaluations++;
      if (ev.is_correct === 1) totalCorrect++;
    });
  });

  // ---------------------------------------------------------------------------
  // RENDER: Attempt Detail Map Review View
  // ---------------------------------------------------------------------------
  if (selectedAttemptId !== null) {
    return (
      <div className="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-6 font-sans">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedAttemptId(null);
                setAttemptDetail(null);
              }}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 font-bold text-xs cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Attempts</span>
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Attempt #{selectedAttemptId} Review
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {attemptDetail?.attempt?.assessment_title || `Assessment #${attemptDetail?.attempt?.assessment_id || ''}`} • Started: {formatDate(attemptDetail?.attempt?.start_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider">Total Score</span>
                <span className="text-base font-black text-indigo-900">{totalScore.toFixed(1)} Marks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state for details */}
        {isLoadingDetail && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading attempt map evaluations & answer keys...</p>
          </div>
        )}

        {/* Error state for details */}
        {detailError && !isLoadingDetail && (
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-rose-800 space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Could not load evaluation details</span>
            </div>
            <p className="text-xs">{detailError}</p>
            <button
              onClick={() => handleSelectAttempt(selectedAttemptId)}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content when Detail is Loaded */}
        {attemptDetail && !isLoadingDetail && (
          <div className="space-y-6">

            {/* Question Tabs Selector */}
            {questionsCount > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {attemptDetail.questions.map((q, idx) => (
                  <button
                    key={q.question_id || idx}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      activeQuestionIdx === idx
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>Question #{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      activeQuestionIdx === idx ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      QID #{q.question_id}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Main Map & Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Interactive Map Canvas View (8 cols) */}
              <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                
                {/* Map Control Bar & Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  
                  {/* Layer Visibility Toggles */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showStudentAnswers}
                        onChange={(e) => setShowStudentAnswers(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        Student Answers
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showAnswerKeys}
                        onChange={(e) => setShowAnswerKeys(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-dashed border-white"></span>
                        Answer Keys (Official)
                      </span>
                    </label>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(1.0, prev - 0.25))}
                      disabled={zoomLevel <= 1.0}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      title="Zoom Out"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-black text-slate-600 w-10 text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                      disabled={zoomLevel >= 2.5}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      title="Zoom In"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1.0)}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                </div>

                {/* Map Display Container with SVG Drawing Overlay */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group min-h-[350px] sm:min-h-[500px]">
                  
                  {/* Scroll Container for Zoom */}
                  <div 
                    className="w-full h-full overflow-auto transition-transform duration-200 origin-top-left"
                    style={{ transform: `scale(${zoomLevel})`, width: `${100 / zoomLevel}%` }}
                  >
                    <div className="relative w-full aspect-video min-h-[400px]">
                      
                      {/* Base Map Image */}
                      <img 
                        src={currentQuestionDetail?.map_image_url || defaultMapImage}
                        alt="Map Review"
                        className="w-full h-full object-contain select-none pointer-events-none"
                      />

                      {/* SVG Overlay layer for student markings & answer keys */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        
                        {/* ------------------------------------------------------------- */}
                        {/* LAYER 1: STUDENT ANSWERS (evaluations) */}
                        {/* ------------------------------------------------------------- */}
                        {showStudentAnswers && filteredEvaluations.map((ev, idx) => {
                          const pts = getPointsFromStudentAnswer(ev);
                          if (pts.length === 0) return null;

                          const toolType = ev.tool_type?.toUpperCase() || 'POINT';
                          const isCorrect = ev.is_correct === 1;
                          const strokeColor = isCorrect ? '#22c55e' : '#ef4444'; // Green for correct, Red for incorrect
                          const labelText = ev.student_answer?.label || `Response #${idx + 1}`;

                          if (toolType === 'POINT' || toolType === 'SYMBOL' || toolType === 'CIRCLE') {
                            const p = pts[0];
                            return (
                              <g key={`student-pt-${idx}`}>
                                {/* Outer Pulse Ring */}
                                <circle 
                                  cx={`${p.x * 100}%`} 
                                  cy={`${p.y * 100}%`} 
                                  r="14" 
                                  fill={strokeColor} 
                                  fillOpacity="0.25" 
                                  stroke={strokeColor}
                                  strokeWidth="1.5"
                                />
                                {/* Inner Marker Pin */}
                                <circle 
                                  cx={`${p.x * 100}%`} 
                                  cy={`${p.y * 100}%`} 
                                  r="6" 
                                  fill={strokeColor} 
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                />
                                {/* Label Text Tag */}
                                <g transform={`translate(${p.x * 100}%, ${p.y * 100}%)`}>
                                  <rect 
                                    x="10" 
                                    y="-12" 
                                    width={labelText.length * 7 + 34} 
                                    height="20" 
                                    rx="6" 
                                    fill="#1e293b" 
                                    fillOpacity="0.9"
                                    stroke={strokeColor}
                                    strokeWidth="1"
                                  />
                                  <text 
                                    x="18" 
                                    y="2" 
                                    fill="#ffffff" 
                                    fontSize="10" 
                                    fontWeight="bold" 
                                    fontFamily="sans-serif"
                                  >
                                    {isCorrect ? '✓ ' : '✗ '}{labelText}
                                  </text>
                                </g>
                              </g>
                            );
                          }

                          if (toolType === 'ARROW' || toolType === 'LINE') {
                            if (pts.length < 2) return null;
                            const p1 = pts[0];
                            const p2 = pts[1];
                            return (
                              <g key={`student-line-${idx}`}>
                                <line 
                                  x1={`${p1.x * 100}%`} 
                                  y1={`${p1.y * 100}%`} 
                                  x2={`${p2.x * 100}%`} 
                                  y2={`${p2.y * 100}%`} 
                                  stroke={strokeColor} 
                                  strokeWidth="3.5" 
                                  strokeLinecap="round"
                                />
                                <circle cx={`${p1.x * 100}%`} cy={`${p1.y * 100}%`} r="4" fill={strokeColor} />
                                <circle cx={`${p2.x * 100}%`} cy={`${p2.y * 100}%`} r="4" fill={strokeColor} />
                              </g>
                            );
                          }

                          if (toolType === 'RECTANGLE' && pts.length >= 2) {
                            const p1 = pts[0];
                            const p2 = pts[1];
                            const minX = Math.min(p1.x, p2.x);
                            const minY = Math.min(p1.y, p2.y);
                            const width = Math.abs(p2.x - p1.x);
                            const height = Math.abs(p2.y - p1.y);
                            return (
                              <g key={`student-rect-${idx}`}>
                                <rect 
                                  x={`${minX * 100}%`} 
                                  y={`${minY * 100}%`} 
                                  width={`${width * 100}%`} 
                                  height={`${height * 100}%`} 
                                  fill={strokeColor}
                                  fillOpacity="0.15"
                                  stroke={strokeColor} 
                                  strokeWidth="2.5" 
                                  rx="4"
                                />
                              </g>
                            );
                          }

                          // Default Polyline / Polygon / Area
                          if (pts.length >= 2) {
                            const pointsString = pts.map(pt => `${pt.x * 100}%,${pt.y * 100}%`).join(' ');
                            return (
                              <polyline 
                                key={`student-poly-${idx}`}
                                points={pointsString} 
                                fill="none" 
                                stroke={strokeColor} 
                                strokeWidth="3" 
                              />
                            );
                          }

                          return null;
                        })}

                        {/* ------------------------------------------------------------- */}
                        {/* LAYER 2: ANSWER KEYS (Official correct answers - Emerald green dashed) */}
                        {/* ------------------------------------------------------------- */}
                        {showAnswerKeys && filteredAnswerKeys.map((keyItem, idx) => {
                          const pts = getPointsFromAnswerKey(keyItem);
                          if (pts.length === 0) return null;

                          const toolType = keyItem.tool_type?.toUpperCase() || 'POINT';
                          const labelText = keyItem.geometry_data?.label || `Key #${idx + 1}`;
                          const marks = keyItem.geometry_data?.marks;

                          if (toolType === 'POINT' || toolType === 'SYMBOL' || toolType === 'CIRCLE') {
                            const p = pts[0];
                            return (
                              <g key={`key-pt-${idx}`}>
                                {/* Dashed Target Outer Circle */}
                                <circle 
                                  cx={`${p.x * 100}%`} 
                                  cy={`${p.y * 100}%`} 
                                  r="16" 
                                  fill="none" 
                                  stroke={ANSWER_KEY_COLOR}
                                  strokeWidth="2.5"
                                  strokeDasharray={ANSWER_KEY_STROKE_DASH}
                                />
                                {/* Center Star Marker */}
                                <circle 
                                  cx={`${p.x * 100}%`} 
                                  cy={`${p.y * 100}%`} 
                                  r="5" 
                                  fill={ANSWER_KEY_COLOR} 
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                />
                                {/* Answer Key Label Tag */}
                                <g transform={`translate(${p.x * 100}%, ${p.y * 100}%)`}>
                                  <rect 
                                    x="-10" 
                                    y="-32" 
                                    width={labelText.length * 7 + 45} 
                                    height="20" 
                                    rx="6" 
                                    fill="#064e3b" 
                                    fillOpacity="0.95"
                                    stroke={ANSWER_KEY_COLOR}
                                    strokeWidth="1.5"
                                  />
                                  <text 
                                    x="-2" 
                                    y="-18" 
                                    fill="#34d399" 
                                    fontSize="10" 
                                    fontWeight="extrabold" 
                                    fontFamily="sans-serif"
                                  >
                                    🔑 {labelText} {marks ? `(${marks}m)` : ''}
                                  </text>
                                </g>
                              </g>
                            );
                          }

                          if (toolType === 'ARROW' || toolType === 'LINE') {
                            if (pts.length < 2) return null;
                            const p1 = pts[0];
                            const p2 = pts[1];
                            return (
                              <g key={`key-line-${idx}`}>
                                <line 
                                  x1={`${p1.x * 100}%`} 
                                  y1={`${p1.y * 100}%`} 
                                  x2={`${p2.x * 100}%`} 
                                  y2={`${p2.y * 100}%`} 
                                  stroke={ANSWER_KEY_COLOR} 
                                  strokeWidth="3.5" 
                                  strokeDasharray={ANSWER_KEY_STROKE_DASH}
                                  strokeLinecap="round"
                                />
                                <circle cx={`${p1.x * 100}%`} cy={`${p1.y * 100}%`} r="5" fill={ANSWER_KEY_COLOR} />
                                <circle cx={`${p2.x * 100}%`} cy={`${p2.y * 100}%`} r="5" fill={ANSWER_KEY_COLOR} />
                              </g>
                            );
                          }

                          if (toolType === 'RECTANGLE' && pts.length >= 2) {
                            const p1 = pts[0];
                            const p2 = pts[1];
                            const minX = Math.min(p1.x, p2.x);
                            const minY = Math.min(p1.y, p2.y);
                            const width = Math.abs(p2.x - p1.x);
                            const height = Math.abs(p2.y - p1.y);
                            return (
                              <g key={`key-rect-${idx}`}>
                                <rect 
                                  x={`${minX * 100}%`} 
                                  y={`${minY * 100}%`} 
                                  width={`${width * 100}%`} 
                                  height={`${height * 100}%`} 
                                  fill={ANSWER_KEY_COLOR}
                                  fillOpacity="0.2"
                                  stroke={ANSWER_KEY_COLOR} 
                                  strokeWidth="3" 
                                  strokeDasharray={ANSWER_KEY_STROKE_DASH}
                                  rx="4"
                                />
                              </g>
                            );
                          }

                          return null;
                        })}

                      </svg>
                    </div>
                  </div>

                </div>

                {/* Map Legend Footer */}
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      Correct User Mark
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      Incorrect User Mark
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 border border-dashed stroke-emerald-600"></span>
                      Official Answer Key
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Evaluations & Answer Keys Comparison Breakdown (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Summary Score Card */}
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                    Question Evaluation Summary
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] font-black uppercase text-emerald-600 block">Correct Marks</span>
                      <span className="text-2xl font-black text-emerald-900">{totalCorrect}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-500 block">Total Items</span>
                      <span className="text-2xl font-black text-slate-900">{totalEvaluations}</span>
                    </div>
                  </div>
                </div>

                {/* Student Evaluations List */}
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                      Student Responses ({currentQuestionDetail?.evaluations?.length || 0})
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {currentQuestionDetail?.evaluations?.map((ev, idx) => {
                      const meta = TOOL_META[ev.tool_type?.toUpperCase()] || { icon: '📍', name: ev.tool_type };
                      const isCorrect = ev.is_correct === 1;
                      const ans = ev.student_answer;
                      const label = ans?.label || `Marking #${idx + 1}`;

                      return (
                        <div 
                          key={ev.response_object_id || idx}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isCorrect 
                              ? 'bg-emerald-50/60 border-emerald-200' 
                              : 'bg-rose-50/60 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{meta.icon}</span>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">{label}</span>
                                <span className="text-[10px] font-mono text-slate-500">Tool: {meta.name}</span>
                              </div>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              isCorrect 
                                ? 'bg-emerald-200 text-emerald-900' 
                                : 'bg-rose-200 text-rose-900'
                            }`}>
                              {isCorrect ? `+${ev.score_awarded} Mark` : '0 Mark'}
                            </span>
                          </div>

                          {ans?.points?.[0] && (
                            <div className="mt-2 text-[10px] font-mono text-slate-500 bg-white/80 p-1.5 rounded-lg border border-slate-100">
                              Coords: ({ans.points[0].x.toFixed(3)}, {ans.points[0].y.toFixed(3)})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Official Answer Keys List */}
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <span>🔑 Official Answer Keys ({currentQuestionDetail?.answer_keys?.length || 0})</span>
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {currentQuestionDetail?.answer_keys?.map((keyItem, idx) => {
                      const meta = TOOL_META[keyItem.tool_type?.toUpperCase()] || { icon: '📍', name: keyItem.tool_type };
                      const geom = keyItem.geometry_data;
                      const label = geom?.label || `Key #${idx + 1}`;
                      const marks = geom?.marks || 1;

                      return (
                        <div 
                          key={keyItem.answer_object_id || idx}
                          className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{meta.icon}</span>
                              <div>
                                <span className="text-xs font-extrabold text-emerald-950 block">{label}</span>
                                <span className="text-[10px] font-mono text-emerald-700">Tool: {meta.name}</span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-200 text-emerald-900">
                              {marks} {marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                          </div>

                          {geom?.points?.[0] && (
                            <div className="text-[10px] font-mono text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                              Expected Coords: ({geom.points[0].x.toFixed(3)}, {geom.points[0].y.toFixed(3)})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Attempt History List View (Default View)
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-8 font-sans">
      
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-7xl">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Assessment Performance Log</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Map Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Attempt History</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Review all past student map assessment attempts, examine detailed point evaluations, and compare student markings with official answer keys.
            </p>
          </div>

          {/* <button
            onClick={fetchAttemptList}
            disabled={isLoadingAttempts}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md self-start sm:self-auto active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAttempts ? 'animate-spin' : ''}`} />
            <span>Refresh Attempts</span>
          </button> */}
        </div>
      </div>

      {/* Loading state for list */}
      {isLoadingAttempts && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading map practice attempt history...</p>
        </div>
      )}

      {/* Error state for list */}
      {attemptsError && !isLoadingAttempts && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-rose-800 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Failed to load attempt history</span>
          </div>
          <p className="text-xs">{attemptsError}</p>
          <button
            onClick={fetchAttemptList}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty attempts state */}
      {!isLoadingAttempts && !attemptsError && attempts.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Assessment Attempts Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't submitted any map practice assessments yet. Take your first interactive map test to see detailed attempts here!
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('map-practice-selection')}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Start Map Assessment
            </button>
          )}
        </div>
      )}

      {/* Attempts List Grid */}
      {!isLoadingAttempts && !attemptsError && attempts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              Total Attempts ({attempts.length})
            </h2>
            <span className="text-xs text-slate-400 font-medium">User ID: #{userId}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attempts.map((attempt) => {
              const isCompleted = attempt.status?.toUpperCase() === 'COMPLETED';
              const title = attempt.assessment_title || `Map Practice Assessment #${attempt.assessment_id}`;
              const score = attempt.total_score ?? 0;

              return (
                <div 
                  key={attempt.attempt_id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 group relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-100">
                          Attempt #{attempt.attempt_id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {attempt.status || 'SUBMITTED'}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug pt-1">
                        {title}
                      </h3>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-50/80 text-indigo-700 text-right shrink-0">
                      <span className="text-[10px] font-black uppercase block text-indigo-400">Score</span>
                      <span className="text-lg font-black text-indigo-950">{score.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Started: {formatDate(attempt.start_time || attempt.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assessment ID #{attempt.assessment_id}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectAttempt(attempt.attempt_id)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Review Attempt & View Map</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
