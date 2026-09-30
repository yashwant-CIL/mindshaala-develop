import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Compass, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Target, 
  Loader2,
  Maximize2,
  Minimize2,
  Layers,
  Shield,
  Eye,
  AlertCircle
} from 'lucide-react';
import { MapPracticeService } from '../../services/MapPracticeService';
import DrawingCanvas, { pointsToShapes, CanvasShape } from './DrawingCanvas';

const TOOL_META: Record<string, { icon: string; name: string; color: string }> = {
  POINT:     { icon: '📍', name: 'Point', color: '#3b82f6' },
  LINE:      { icon: '📏', name: 'Line', color: '#6366f1' },
  POLYLINE:  { icon: '〰️', name: 'Polyline', color: '#2563eb' },
  ARROW:     { icon: '➡️', name: 'Arrow', color: '#f59e0b' },
  AREA:      { icon: '🟦', name: 'Area', color: '#3b82f6' },
  POLYGON:   { icon: '⬡', name: 'Polygon', color: '#6366f1' },
  LABEL:     { icon: '🏷️', name: 'Label', color: '#2563eb' },
  FREEHAND:  { icon: '✍️', name: 'Freehand', color: '#f59e0b' },
  SYMBOL:    { icon: '⭐', name: 'Symbol', color: '#ef4444' },
  CIRCLE:    { icon: '⭕', name: 'Circle', color: '#3b82f6' },
  RECTANGLE: { icon: '▭', name: 'Rectangle', color: '#6366f1' }
};

interface MapPracticeResultProps {
  onNavigate?: (pageId: string, params?: any) => void;
  params?: any;
}

export default function MapPracticeResult({ onNavigate, params }: MapPracticeResultProps) {
  const attemptId = params?.attemptId;
  const passedMapTitle = params?.mapTitle || params?.assessment?.title;
  const passedScore = params?.score;

  const [isLoading, setIsLoading] = useState<boolean>(!!attemptId);
  const [resultData, setResultData] = useState<any>({
    mapTitle: passedMapTitle || 'Map Practice Assessment',
    completedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score: passedScore !== undefined ? passedScore : 0,
    totalQuestions: 1,
    correctCount: 0,
    incorrectCount: 0,
    accuracyPercent: 0,
    timeTaken: 'N/A',
    performanceGrade: 'Good',
  });

  const [questionsData, setQuestionsData] = useState<any[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  
  // Map blob image URLs dictionary indexed by map_image_url or question_id
  const [mapImageBlobUrls, setMapImageBlobUrls] = useState<Record<string, string>>({});
  const [loadingMapImages, setLoadingMapImages] = useState<Record<string, boolean>>({});

  // Canvas View state
  const [showStudentAnswers, setShowStudentAnswers] = useState<boolean>(true);
  const [showAnswerKeys, setShowAnswerKeys] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const mapViewportRef = useRef<HTMLDivElement | null>(null);

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
    if (mapViewportRef.current) {
      mapViewportRef.current.scrollLeft = 0;
      mapViewportRef.current.scrollTop = 0;
    }
  };

  // Reset zoom and viewport whenever the active question changes
  useEffect(() => {
    handleResetZoom();
  }, [activeQuestionIdx]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1.0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1.0) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ---------------------------------------------------------------------------
  // Helper: Fetch Map Image Blob using MapPracticeService.getMapImage(imageUrl)
  // ---------------------------------------------------------------------------
  const fetchMapImage = async (imgUrl: string) => {
    if (!imgUrl || mapImageBlobUrls[imgUrl] || loadingMapImages[imgUrl]) return;
    
    // If it's already an absolute http/https/data URL, no need to query binary blob
    if (imgUrl.startsWith('data:') || imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('blob:')) {
      setMapImageBlobUrls(prev => ({ ...prev, [imgUrl]: imgUrl }));
      return;
    }

    setLoadingMapImages(prev => ({ ...prev, [imgUrl]: true }));
    try {
      console.log("Fetching map image blob for parameter map_image_url:", imgUrl);
      const resBlob = await MapPracticeService.getMapImage(imgUrl);
      if (resBlob) {
        let objectUrl = '';
        if (resBlob instanceof Blob) {
          objectUrl = URL.createObjectURL(resBlob);
        } else {
          const blob = new Blob([resBlob], { type: 'image/png' });
          objectUrl = URL.createObjectURL(blob);
        }
        console.log("Created map image Blob URL:", objectUrl, "for path:", imgUrl);
        setMapImageBlobUrls(prev => ({ ...prev, [imgUrl]: objectUrl }));
      }
    } catch (err) {
      console.error("Error loading map image for url parameter:", imgUrl, err);
    } finally {
      setLoadingMapImages(prev => ({ ...prev, [imgUrl]: false }));
    }
  };

  // ---------------------------------------------------------------------------
  // Load Attempt Scorecard & Questions Data
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      if (!attemptId) return;
      setIsLoading(true);
      try {
        const resQuestions = await MapPracticeService.getAttemptedQuestionsByAttemptId(attemptId);

        if (!isMounted) return;

        if (resQuestions) {
          const apiRes = resQuestions?.data || resQuestions;

          // Parse summary score
          setResultData((prev: any) => ({
            ...prev,
            mapTitle: apiRes.assessment_title || apiRes.title || prev.mapTitle,
            score: apiRes.total_score !== undefined ? apiRes.total_score : (apiRes.score !== undefined ? apiRes.score : prev.score),
            totalQuestions: apiRes.total_questions || prev.totalQuestions,
            correctCount: apiRes.correct_answers || apiRes.correct_count || prev.correctCount,
            incorrectCount: apiRes.incorrect_answers || apiRes.incorrect_count || prev.incorrectCount,
            accuracyPercent: apiRes.accuracy !== undefined ? Math.round(apiRes.accuracy) : prev.accuracyPercent,
            performanceGrade: apiRes.grade || prev.performanceGrade,
            timeTaken: apiRes.time_taken || prev.timeTaken
          }));

          // Parse questions payload
          const qList = apiRes?.questions || (Array.isArray(apiRes) ? apiRes : []);
          
          if (Array.isArray(qList) && qList.length > 0) {
            setQuestionsData(qList);
            
            // Trigger blob fetching for each question's map_image_url
            qList.forEach((qItem: any) => {
              if (qItem.map_image_url) {
                fetchMapImage(qItem.map_image_url);
              }
            });
          }
        }
      } catch (err) {
        console.warn('Error loading map result details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  // Current question item
  const currentQuestion = questionsData[activeQuestionIdx];
  const activeMapImageUrlParam = currentQuestion?.map_image_url || currentQuestion?.render_file_uri || currentQuestion?.image;
  
  // Resolved map image URL (Blob object URL or raw parameter) - No dummy fallback image!
  const displayMapImageUrl = 
    (activeMapImageUrlParam && mapImageBlobUrls[activeMapImageUrlParam]) || 
    (activeMapImageUrlParam && (activeMapImageUrlParam.startsWith('http') || activeMapImageUrlParam.startsWith('blob:') || activeMapImageUrlParam.startsWith('data:')) ? activeMapImageUrlParam : '');

  // Transform student answers and official answer keys to CanvasShape objects for DrawingCanvas
  const resultShapes = useMemo(() => {
    const shapes: CanvasShape[] = [];

    // 1. Student Answers Layer (User's Marked Positions - Same tools used during exam)
    if (showStudentAnswers && currentQuestion?.evaluations && Array.isArray(currentQuestion.evaluations)) {
      currentQuestion.evaluations.forEach((ev: any, idx: number) => {
        const ans = ev.student_answer;
        if (!ans) return;

        const isCorrect = ev.is_correct === 1 || ev.is_correct === true;
        const prefix = isCorrect ? '✓ ' : '✗ ';

        const toolType = (ans.tool_type || ans.type || ev.tool_type || 'POINT').toUpperCase();
        const geom = ans.geometry_data || ans;
        const meta = TOOL_META[toolType] || { icon: '📍', name: toolType, color: '#3b82f6' };

        const rawLabel = geom.label || ans.label || geom.text || `Response #${idx + 1}`;
        const labelText = `${prefix}${meta.icon} ${rawLabel}`;

        const isPointLike = ['POINT', 'SYMBOL', 'LABEL'].includes(toolType);
        const studentStroke = isPointLike ? '#ffffff' : (isCorrect ? '#2563eb' : '#dc2626');
        const studentFill = isPointLike ? (isCorrect ? '#2563eb' : '#dc2626') : (isCorrect ? 'rgba(37, 99, 235, 0.25)' : 'rgba(220, 38, 38, 0.25)');

        const rawArray = Array.isArray(ans) ? ans : [ans];
        const parsed = pointsToShapes(rawArray, toolType);
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
    if (showAnswerKeys && currentQuestion?.answer_keys && Array.isArray(currentQuestion.answer_keys)) {
      currentQuestion.answer_keys.forEach((keyItem: any, idx: number) => {
        if (!keyItem) return;

        const toolType = (keyItem.tool_type || keyItem.type || 'POINT').toUpperCase();
        const geom = keyItem.geometry_data || keyItem;
        const meta = TOOL_META[toolType] || { icon: '🔑', name: toolType, color: '#8b5cf6' };

        const rawLabel = geom.label || keyItem.label || geom.text || `Key #${idx + 1}`;
        const labelText = `🔑 ${meta.icon} ${rawLabel}`;

        const isPointLike = ['POINT', 'SYMBOL', 'LABEL'].includes(toolType);
        const keyStroke = isPointLike ? '#ffffff' : '#8b5cf6';
        const keyFill = isPointLike ? '#8b5cf6' : 'rgba(139, 92, 246, 0.25)';

        const rawArray = Array.isArray(keyItem) ? keyItem : [keyItem];
        const parsed = pointsToShapes(rawArray, toolType);
        parsed.forEach(s => {
          const sType = (s.type || toolType).toUpperCase();
          const sIsPoint = ['POINT', 'SYMBOL', 'LABEL'].includes(sType);
          shapes.push({
            ...s,
            type: sType, // Preserve exact tool representation for Answer Key
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
  }, [currentQuestion, showStudentAnswers, showAnswerKeys]);

  return (
    <div className="p-3 md:p-5 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-3 font-sans">
      
      {/* Top Banner Header + Summary Metrics in a single compact row */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-3 md:p-4 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Module Title info */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                  Map Practice Evaluation
                </h1>
                {attemptId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold">Attempt #{attemptId}</span>}
              </div>
              <p className="text-slate-300 text-xs font-medium">
                Module: <span className="text-white font-bold">{resultData.mapTitle}</span>
              </p>
            </div>
          </div>

          {/* Compact Inline Summary Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">Score:</span>
              <span className="text-blue-300 font-extrabold">{resultData.score} Marks</span>
              <span className="text-[10px] text-blue-400">({resultData.performanceGrade})</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">Accuracy:</span>
              <span className="text-emerald-400 font-extrabold">{resultData.accuracyPercent}%</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">Questions:</span>
              <span className="text-indigo-300 font-extrabold">{questionsData.length || resultData.totalQuestions}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">Time:</span>
              <span className="text-amber-300 font-extrabold">{resultData.timeTaken}</span>
            </div>
          </div>

        </div>
      </div>

      {isLoading && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1 shadow-xs">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading map scorecard...</p>
        </div>
      )}

      {/* Main Map Viewer & Side-by-Side Comparison Panel */}
      {questionsData.length > 0 && (
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          
          {/* Question Selector Tabs */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Interactive Map & Answer Key Review
              </h3>
            </div>

            {/* Question Selector Pills */}
            {questionsData.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {questionsData.map((q, idx) => (
                  <button
                    key={q.question_id || idx}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                      activeQuestionIdx === idx
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Question #{idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Controls & Comparison Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Left: Map Display Container (7 cols) */}
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
                      className="w-3.5 h-3.5 rounded text-purple-600 accent-purple-600"
                    />
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 border border-dashed border-white"></span>
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
                    onClick={handleResetZoom}
                    disabled={zoomLevel === 1.0 && panPosition.x === 0 && panPosition.y === 0}
                    title="Reset Map Zoom & Position"
                    className="ml-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3 text-blue-600" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Map Viewport Container matching MapPracticeAssessment */}
              <div 
                ref={mapViewportRef}
                className="w-full relative bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center h-[52vh] min-h-[280px] max-h-[460px] p-2 select-none"
              >
                {(!displayMapImageUrl || (activeMapImageUrlParam && loadingMapImages[activeMapImageUrlParam])) ? (
                  <div className="flex flex-col items-center gap-2 text-white p-6">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="text-xs font-bold">Loading map canvas image...</span>
                  </div>
                ) : (
                  <div 
                    className="w-full flex items-center justify-center transition-transform duration-200"
                    style={{ 
                      transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`, 
                      transformOrigin: 'center center',
                      cursor: zoomLevel > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <DrawingCanvas
                      imageUrl={displayMapImageUrl}
                      shapes={resultShapes}
                      readOnly={true}
                      canvasWidthPx={currentQuestion?.canvas_width_px || 800}
                      canvasHeightPx={currentQuestion?.canvas_height_px || 600}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Side-by-Side Comparison Panel for Official Answer Keys vs Student Markings (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Question #{activeQuestionIdx + 1} Comparison</span>
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Q#{activeQuestionIdx + 1}
                  </span>
                </div>

                <div className="space-y-3 h-[52vh] min-h-[280px] max-h-[460px] overflow-y-auto pr-1">
                  
                  {/* 1. Official Answer Keys List */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-black uppercase tracking-wider text-purple-700 flex items-center justify-between">
                      <span>🔑 Official Answer Keys</span>
                      <span className="text-[10px] text-purple-800 font-bold">({currentQuestion?.answer_keys?.length || 0})</span>
                    </div>
                    
                    {(currentQuestion?.answer_keys || []).map((keyItem: any, idx: number) => {
                      const toolType = (keyItem.tool_type || keyItem.type || 'POINT').toUpperCase();
                      const meta = TOOL_META[toolType] || { icon: '🔑', name: toolType, color: '#8b5cf6' };
                      const geom = keyItem.geometry_data || keyItem;
                      const labelText = geom.label || keyItem.label || geom.text || `Key #${idx + 1}`;
                      return (
                        <div key={`key-card-${idx}`} className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/90 flex items-center justify-between text-xs font-bold text-purple-950 shadow-2xs">
                          <span className="flex items-center gap-1.5">
                            <span className="text-purple-600 text-sm">{meta.icon}</span>
                            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-purple-200/70 text-purple-800">{meta.name}</span>
                            <span>{labelText}</span>
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-200/70 text-purple-800">
                            Answer Key
                          </span>
                        </div>
                      );
                    })}

                    {(!currentQuestion?.answer_keys || currentQuestion.answer_keys.length === 0) && (
                      <p className="text-[11px] text-slate-400 font-medium italic p-2 bg-white rounded-lg border border-slate-200">
                        No official answer key defined for this question.
                      </p>
                    )}
                  </div>

                  {/* 2. Student Markings List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center justify-between">
                      <span>📍 Student Markings</span>
                      <span className="text-[10px] text-blue-800 font-bold">({currentQuestion?.evaluations?.length || 0})</span>
                    </div>

                    {(currentQuestion?.evaluations || []).map((ev: any, idx: number) => {
                      const isCorrect = ev.is_correct === 1 || ev.is_correct === true;
                      const ans = ev.student_answer || {};
                      const toolType = (ans.tool_type || ans.type || ev.tool_type || 'POINT').toUpperCase();
                      const meta = TOOL_META[toolType] || { icon: '📍', name: toolType, color: '#3b82f6' };
                      const geom = ans.geometry_data || ans;
                      const labelText = geom.label || ans.label || geom.text || `Response #${idx + 1}`;
                      return (
                        <div key={`student-card-${idx}`} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold shadow-2xs ${isCorrect ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                          <span className="flex items-center gap-1.5">
                            <span>{isCorrect ? '✓' : '✗'}</span>
                            <span className="text-sm">{meta.icon}</span>
                            <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${isCorrect ? 'bg-emerald-200/60 text-emerald-800' : 'bg-rose-200/60 text-rose-800'}`}>{meta.name}</span>
                            <span>{labelText}</span>
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${isCorrect ? 'bg-emerald-200/60 text-emerald-800' : 'bg-rose-200/60 text-rose-800'}`}>
                            {isCorrect ? '+1 Mark' : '0 Mark'}
                          </span>
                        </div>
                      );
                    })}

                    {(!currentQuestion?.evaluations || currentQuestion.evaluations.length === 0) && (
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

      {/* Footer Navigation CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="font-extrabold text-slate-900 text-xs">Ready for your next map challenge?</h4>
          <p className="text-[11px] text-slate-500 font-medium">Explore world political maps, physical landforms, or ancient history sites.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigate?.('map-practice-attempts')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
          >
            Attempt History
          </button>
          <button
            onClick={() => onNavigate?.('map-practice-selection')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Select Next Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
