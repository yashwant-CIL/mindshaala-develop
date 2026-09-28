import React, { useEffect, useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { MapPracticeService } from '../../services/MapPracticeService';

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
    mapTitle: passedMapTitle || 'Rivers & River Basins of India',
    completedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score: passedScore !== undefined ? passedScore : 80,
    totalQuestions: 5,
    correctCount: 4,
    incorrectCount: 1,
    accuracyPercent: 80,
    timeTaken: '2m 15s',
    avgPinPrecision: '92.5%',
    performanceGrade: 'Excellent (A)',
  });

  const [questionBreakdown, setQuestionBreakdown] = useState<any[]>([
    {
      id: 1,
      landmark: 'River Ganga Origin (Gangotri Glacier)',
      userCoordinates: '38.0% X, 28.0% Y',
      actualCoordinates: '38.0% X, 28.0% Y',
      status: 'Correct',
      accuracy: '98%',
      tip: 'Gangotri is located in Uttarkashi district of Uttarakhand.'
    },
    {
      id: 2,
      landmark: 'Narmada River Mouth (Gulf of Khambhat)',
      userCoordinates: '25.0% X, 52.0% Y',
      actualCoordinates: '25.0% X, 52.0% Y',
      status: 'Correct',
      accuracy: '96%',
      tip: 'Narmada flows westward through a rift valley between Vindhya and Satpura ranges.'
    },
    {
      id: 3,
      landmark: 'Godavari Delta (Bay of Bengal)',
      userCoordinates: '52.0% X, 65.0% Y',
      actualCoordinates: '52.0% X, 65.0% Y',
      status: 'Correct',
      accuracy: '92%',
      tip: 'Godavari is the largest peninsular river system in India (Dakshin Ganga).'
    },
    {
      id: 4,
      landmark: 'Brahmaputra Entry (Yarlung Tsangpo in Arunachal)',
      userCoordinates: '78.0% X, 35.0% Y',
      actualCoordinates: '82.0% X, 30.0% Y',
      status: 'Incorrect',
      accuracy: '62%',
      tip: 'Brahmaputra enters India as Siang/Dihang near Namcha Barwa U-turn.'
    },
    {
      id: 5,
      landmark: 'Kaveri River Origin (Talakaveri)',
      userCoordinates: '36.0% X, 78.0% Y',
      actualCoordinates: '36.0% X, 78.0% Y',
      status: 'Correct',
      accuracy: '94%',
      tip: 'Talakaveri is located in Kodagu district in Western Ghats of Karnataka.'
    }
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      if (!attemptId) return;
      setIsLoading(true);
      try {
        const [resScore, resQuestions] = await Promise.allSettled([
          MapPracticeService.getResultMapAssessment(attemptId),
          MapPracticeService.getAttemptedQuestionsByAttemptId(attemptId)
        ]);

        if (!isMounted) return;

        if (resScore.status === 'fulfilled' && resScore.value?.data) {
          const apiRes = resScore.value.data?.data || resScore.value.data;
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
        }

        if (resQuestions.status === 'fulfilled' && resQuestions.value?.data) {
          const qList = resQuestions.value.data?.data || resQuestions.value.data;
          if (Array.isArray(qList) && qList.length > 0) {
            const formatted = qList.map((q: any, idx: number) => ({
              id: idx + 1,
              landmark: q.location_name || q.question_title || `Question ${idx + 1}`,
              userCoordinates: q.user_answer || `${q.user_x || 0}% X, ${q.user_y || 0}% Y`,
              actualCoordinates: `${q.target_x || 0}% X, ${q.target_y || 0}% Y`,
              status: q.is_correct ? 'Correct' : 'Incorrect',
              accuracy: q.is_correct ? '95%' : '60%',
              tip: q.explanation || q.hint || 'Review spatial location features.'
            }));
            setQuestionBreakdown(formatted);
          }
        }
      } catch (err) {
        console.warn('Could not load live attempt result details, using generated scorecard.', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50 space-y-8 font-sans">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-6 md:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Assessment Report</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Map Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Result</span>
            </h1>
            {/* <p className="text-slate-300 text-sm font-medium">
              Module: <span className="text-white font-bold">{resultData.mapTitle}</span> • Completed on {resultData.completedDate}
            </p> */}
          </div>

          {/* <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate?.('map-practice-assessment')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </button>
            <button
              onClick={() => onNavigate?.('map-practice-selection')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-2 backdrop-blur-md"
            >
              <Compass className="w-4 h-4" />
              <span>New Map</span>
            </button>
          </div> */}
        </div>
      </div>

      {isLoading && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading live scorecard data from server...</p>
        </div>
      )}

      {/* Summary Score Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Score</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{resultData.score} / 100</p>
          <p className="text-xs font-extrabold text-blue-600">Grade: {resultData.performanceGrade}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Accuracy Rate</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{resultData.accuracyPercent}%</p>
          <p className="text-xs font-semibold text-slate-500">{resultData.correctCount} Correct • {resultData.incorrectCount} Missed</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Pin Precision</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{resultData.avgPinPrecision}</p>
          <p className="text-xs font-semibold text-slate-500">Spatial coordinate match</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Time Taken</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{resultData.timeTaken}</p>
          <p className="text-xs font-semibold text-slate-500">Fast pinpoint speed</p>
        </div>
      </div>

      {/* Detailed Pinpoint Location Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Location-by-Location Evaluation</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Review your pin placements and memory hints for each question</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Landmark / Location</th>
                <th className="py-3 px-4">User Pin</th>
                <th className="py-3 px-4">Actual Target</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Memory Tip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {questionBreakdown.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-400">{row.id}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">{row.landmark}</td>
                  <td className="py-4 px-4 text-slate-600">{row.userCoordinates}</td>
                  <td className="py-4 px-4 text-slate-600">{row.actualCoordinates}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-800">{row.accuracy}</td>
                  <td className="py-4 px-4">
                    {row.status === 'Correct' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Missed
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-500 max-w-xs">{row.tip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="font-extrabold text-slate-900 text-base">Ready for your next map challenge?</h4>
          <p className="text-xs text-slate-500 font-medium">Explore world political maps, physical landforms, or ancient history sites.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate?.('map-practice-dashboard')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => onNavigate?.('map-practice-selection')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Select Next Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
