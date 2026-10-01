import React, { useState, useEffect, useMemo } from 'react';
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
  Target,
  Move
} from 'lucide-react';
import { MapPracticeService } from '../../services/MapPracticeService';
import DrawingCanvas, { pointsToShapes, CanvasShape } from './DrawingCanvas';

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
  canvas_width_px?: number;
  canvas_height_px?: number;
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

  // Drag Panning state
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse & Touch Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1.0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1.0) return;
    e.preventDefault();
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel <= 1.0 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel <= 1.0 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPanOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const resetZoomAndPan = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

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
      if (onNavigate) {
        onNavigate('map-practice-result', { attemptId: initialAttemptId });
      } else {
        handleSelectAttempt(initialAttemptId);
      }
    }
  }, [initialAttemptId]);

  // Map blob image URLs dictionary indexed by map_image_url
  const [mapImageBlobUrls, setMapImageBlobUrls] = useState<Record<string, string>>({});

  const fetchMapImage = async (imgUrl: string) => {
    if (!imgUrl || mapImageBlobUrls[imgUrl]) return;
    if (imgUrl.startsWith('data:') || imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('blob:')) {
      setMapImageBlobUrls(prev => ({ ...prev, [imgUrl]: imgUrl }));
      return;
    }
    try {
      console.log("Fetching map image blob for URL parameter:", imgUrl);
      const resBlob = await MapPracticeService.getMapImage(imgUrl);
      if (resBlob) {
        const blob = resBlob instanceof Blob ? resBlob : new Blob([resBlob], { type: 'image/png' });
        const objectUrl = URL.createObjectURL(blob);
        setMapImageBlobUrls(prev => ({ ...prev, [imgUrl]: objectUrl }));
      }
    } catch (err) {
      console.error("Error fetching map image blob:", imgUrl, err);
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch Attempt Details when clicking an attempt
  // ---------------------------------------------------------------------------
  const handleSelectAttempt = async (attemptId: number, attempt?: AttemptItem) => {
    if (onNavigate) {
      onNavigate('map-practice-result', { 
        attemptId, 
        mapTitle: attempt?.assessment_title || `Assessment #${attempt?.assessment_id || attemptId}`,
        score: attempt?.total_score 
      });
      return;
    }

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
        const qList = data.questions || (Array.isArray(data) ? data : []);
        if (Array.isArray(qList)) {
          qList.forEach((q: any) => {
            if (q.map_image_url) fetchMapImage(q.map_image_url);
          });
        }
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

  // Result shapes computed for DrawingCanvas (matching MapPracticeAssessment 1:1 positioning)
  const resultShapes = useMemo(() => {
    if (!currentQuestionDetail) return [];

    const shapes: CanvasShape[] = [];

    // 1. Student Markings Layer (User's Marked Positions - Same tools used during exam)
    if (showStudentAnswers && currentQuestionDetail.evaluations && Array.isArray(currentQuestionDetail.evaluations)) {
      currentQuestionDetail.evaluations.forEach((ev: any, idx: number) => {
        const ans = ev.student_answer;
        if (!ans) return;

        const isCorrect = ev.is_correct === 1 || ev.is_correct === true;
        const prefix = isCorrect ? '✓ ' : '✗ ';

        const toolType = (ev.tool_type || ans.tool_type || ans.type || 'POINT').toUpperCase();
        const geom = ans.geometry_data || ans;
        const meta = TOOL_META[toolType] || { icon: '📍', name: toolType, studentColor: '#3b82f6' };

        const rawLabel = geom.label || ans.label || ev.label || `Response #${idx + 1}`;
        const labelText = `${prefix}${meta.icon} ${rawLabel}`;

        const isPointLike = ['POINT', 'SYMBOL', 'LABEL'].includes(toolType);
        const studentStroke = isPointLike ? '#ffffff' : (isCorrect ? '#2563eb' : '#dc2626');
        const studentFill = isPointLike ? (isCorrect ? '#2563eb' : '#dc2626') : (isCorrect ? 'rgba(37, 99, 235, 0.25)' : 'rgba(220, 38, 38, 0.25)');

        const parsed = pointsToShapes(Array.isArray(ans) ? ans : [ans], toolType);
        parsed.forEach(s => {
          const sType = (s.type || toolType).toUpperCase();
          const sIsPoint = ['POINT', 'SYMBOL', 'LABEL'].includes(sType);
          shapes.push({
            ...s,
            type: sType, // Preserve exact tool representation
            id: `student_${idx}_${s.id}`,
            label: labelText,
            stroke: sIsPoint ? '#ffffff' : studentStroke,
            fill: sIsPoint ? (isCorrect ? '#2563eb' : '#dc2626') : studentFill,
            dash: []
          });
        });
      });
    }

    // 2. Official Answer Keys Layer (Actual Answer - Same tools, distinct Purple/Violet color & dashed stroke)
    if (showAnswerKeys && currentQuestionDetail.answer_keys && Array.isArray(currentQuestionDetail.answer_keys)) {
      currentQuestionDetail.answer_keys.forEach((keyItem: any, idx: number) => {
        if (!keyItem) return;

        const toolType = (keyItem.tool_type || keyItem.type || 'POINT').toUpperCase();
        const geom = keyItem.geometry_data || keyItem;
        const meta = TOOL_META[toolType] || { icon: '🔑', name: toolType, studentColor: '#8b5cf6' };

        const rawLabel = geom.label || keyItem.label || geom.text || `Key #${idx + 1}`;
        const labelText = `🔑 ${meta.icon} ${rawLabel}`;

        const isPointLike = ['POINT', 'SYMBOL', 'LABEL'].includes(toolType);
        const keyStroke = isPointLike ? '#ffffff' : '#8b5cf6';
        const keyFill = isPointLike ? '#8b5cf6' : 'rgba(139, 92, 246, 0.25)';

        const parsed = pointsToShapes(Array.isArray(keyItem) ? keyItem : [keyItem], toolType);
        parsed.forEach(s => {
          const sType = (s.type || toolType).toUpperCase();
          const sIsPoint = ['POINT', 'SYMBOL', 'LABEL'].includes(sType);
          shapes.push({
            ...s,
            type: sType, // Preserve exact tool representation
            id: `key_${idx}_${s.id}`,
            label: labelText,
            stroke: sIsPoint ? '#ffffff' : keyStroke,
            fill: sIsPoint ? '#8b5cf6' : keyFill,
            dash: sIsPoint ? [] : [6, 4] // Solid border for point dot, dashed stroke for shapes
          });
        });
      });
    }

    return shapes;
  }, [currentQuestionDetail, showStudentAnswers, showAnswerKeys]);

  // Image URL computation without fallback dummy image
  const rawUrl = currentQuestionDetail?.map_image_url;
  const displayMapImageUrl = (rawUrl && mapImageBlobUrls[rawUrl]) || (rawUrl?.startsWith('http') || rawUrl?.startsWith('/') || rawUrl?.startsWith('data:') ? rawUrl : '');

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
      <div className="p-3 md:p-5 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-3 font-sans">
        
        {/* Compact Header Navigation & Total Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedAttemptId(null);
                setAttemptDetail(null);
                resetZoomAndPan();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 font-extrabold text-xs cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Attempts</span>
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Attempt #{selectedAttemptId} Evaluation Review
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {attemptDetail?.attempt?.assessment_title || `Assessment #${attemptDetail?.attempt?.assessment_id || ''}`} • {formatDate(attemptDetail?.attempt?.start_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-400 block tracking-wider">Total Score</span>
                <span className="text-sm font-black text-indigo-900">{totalScore.toFixed(1)} Marks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state for details */}
        {isLoadingDetail && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">Loading attempt map evaluations & answer keys...</p>
          </div>
        )}

        {/* Error state for details */}
        {detailError && !isLoadingDetail && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Could not load evaluation details</span>
            </div>
            <p className="text-xs">{detailError}</p>
            <button
              onClick={() => handleSelectAttempt(selectedAttemptId)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content when Detail is Loaded */}
        {attemptDetail && !isLoadingDetail && (
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            
            {/* Question Selector Tabs Bar */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Interactive Map & Answer Key Review
                </h3>
              </div>

              {questionsCount > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {attemptDetail.questions.map((q, idx) => (
                    <button
                      key={q.question_id || idx}
                      onClick={() => {
                        setActiveQuestionIdx(idx);
                        resetZoomAndPan();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                        activeQuestionIdx === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Question #{idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Side-by-Side Grid: Left Map Canvas (7 cols), Right Answer Key & Student Markings Comparison (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Left Column: Interactive Map Canvas View (7 cols) */}
              <div className="lg:col-span-7 space-y-2">
                
                {/* Map Layer Controls Bar */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showStudentAnswers}
                        onChange={(e) => setShowStudentAnswers(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600"
                      />
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        Student Marking
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showAnswerKeys}
                        onChange={(e) => setShowAnswerKeys(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600"
                      />
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-dashed border-white"></span>
                        Official Answer Key
                      </span>
                    </label>
                  </div>

                  {/* Zoom & Reset Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(1.0, prev - 0.25))}
                      disabled={zoomLevel <= 1.0}
                      title="Zoom Out"
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                      disabled={zoomLevel >= 2.5}
                      title="Zoom In"
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={resetZoomAndPan}
                      disabled={zoomLevel === 1.0 && panOffset.x === 0 && panOffset.y === 0}
                      title="Reset Map Zoom & Position"
                      className="ml-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3 text-indigo-600" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Map Viewport Container matching MapPracticeAssessment */}
                <div 
                  className="w-full relative bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center h-[52vh] min-h-[280px] max-h-[460px] p-2 select-none"
                >
                  {!displayMapImageUrl ? (
                    <div className="flex flex-col items-center gap-2 text-white p-6">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      <span className="text-xs font-bold">Loading map canvas image...</span>
                    </div>
                  ) : (
                    <div 
                      className="w-full flex items-center justify-center transition-transform duration-200"
                      style={{ 
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, 
                        transformOrigin: 'center center',
                        cursor: zoomLevel > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleMouseUpOrLeave}
                    >
                      <DrawingCanvas
                        imageUrl={displayMapImageUrl}
                        shapes={resultShapes}
                        readOnly={true}
                        canvasWidthPx={currentQuestionDetail?.canvas_width_px || 1000}
                        canvasHeightPx={currentQuestionDetail?.canvas_height_px || 1000}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Side-by-Side Comparison Panel for Official Answer Keys vs Student Markings (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Question #{activeQuestionIdx + 1} Comparison</span>
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Q#{activeQuestionIdx + 1}
                    </span>
                  </div>

                  {/* 🔑 Official Answer Keys Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <span>🔑 Official Answer Keys</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 text-[10px]">
                          {currentQuestionDetail?.answer_keys?.length || 0}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                      {currentQuestionDetail?.answer_keys?.map((keyItem: any, idx: number) => {
                        const geom = keyItem.geometry_data || keyItem;
                        const labelText = geom.label || keyItem.label || `Answer Key #${idx + 1}`;
                        const toolType = (keyItem.tool_type || keyItem.type || 'POINT').toUpperCase();
                        const marks = geom.marks || keyItem.marks || 1;
                        const meta = TOOL_META[toolType] || { icon: '📍', name: toolType };

                        return (
                          <div 
                            key={keyItem.answer_object_id || idx}
                            className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm shrink-0">{meta.icon}</span>
                              <div className="truncate">
                                <span className="text-xs font-extrabold text-emerald-950 block truncate">{labelText}</span>
                                <span className="text-[9px] font-mono text-emerald-700 block">Type: {meta.name}</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold shrink-0">
                              {marks} {marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                          </div>
                        );
                      })}

                      {(!currentQuestionDetail?.answer_keys || currentQuestionDetail.answer_keys.length === 0) && (
                        <p className="text-[11px] text-slate-400 font-medium italic p-2 bg-white rounded-lg border border-slate-200">
                          No official answer key defined for this question.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 📍 Student Markings Section */}
                  <div className="space-y-1.5 border-t border-slate-200/80 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                        <span>📍 Student Markings</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-800 text-[10px]">
                          {currentQuestionDetail?.evaluations?.length || 0}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                      {currentQuestionDetail?.evaluations?.map((ev: any, idx: number) => {
                        const ans = ev.student_answer;
                        const isCorrect = ev.is_correct === 1 || ev.is_correct === true;
                        const toolType = (ev.tool_type || ans?.tool_type || ans?.type || 'POINT').toUpperCase();
                        const labelText = ans?.label || ev.label || `Student Marking #${idx + 1}`;
                        const meta = TOOL_META[toolType] || { icon: '📍', name: toolType };

                        return (
                          <div 
                            key={ev.response_object_id || idx}
                            className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                              isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm shrink-0">{meta.icon}</span>
                              <div className="truncate">
                                <span className="text-xs font-bold text-slate-900 block truncate">{labelText}</span>
                                <span className="text-[9px] font-mono text-slate-500 block">Type: {meta.name}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                              isCorrect ? 'bg-emerald-200/60 text-emerald-800' : 'bg-rose-200/60 text-rose-800'
                            }`}>
                              {isCorrect ? '+1 Mark' : '0 Mark'}
                            </span>
                          </div>
                        );
                      })}

                      {(!currentQuestionDetail?.evaluations || currentQuestionDetail.evaluations.length === 0) && (
                        <p className="text-[11px] text-slate-400 font-medium italic p-2 bg-white rounded-lg border border-slate-200">
                          No student markings recorded for this question.
                        </p>
                      )}
                    </div>
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
                  onClick={() => handleSelectAttempt(attempt.attempt_id, attempt)}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 group relative cursor-pointer"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAttempt(attempt.attempt_id, attempt);
                    }}
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
