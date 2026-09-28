import React, { useEffect, useState } from 'react';
import {MapPracticeService} from '../../services/MapPracticeService'

interface ToolMeta {
  icon: string;
  color: string;
  use: string;
}

const TOOL_ICONS: Record<string, ToolMeta> = {
  POINT:     { icon: '📍', color: '#4f7ef7', use: 'Cities, capitals, ports, peaks, historical places' },
  LINE:      { icon: '📏', color: '#9b6dff', use: 'Boundaries, straight paths' },
  POLYLINE:  { icon: '〰️', color: '#3ecf8e', use: 'Rivers, mountain ranges, routes' },
  ARROW:     { icon: '➡️', color: '#f5a623', use: 'Winds, currents, directions, movement' },
  AREA:      { icon: '🟦', color: '#4f7ef7', use: 'Regions, plateaus, soil areas, climate zones' },
  POLYGON:   { icon: '⬡', color: '#9b6dff', use: 'Precisely bounded areas' },
  LABEL:     { icon: '🏷️', color: '#3ecf8e', use: 'Place names and annotations' },
  FREEHAND:  { icon: '✍️', color: '#f5a623', use: 'Freehand tracing' },
  SYMBOL:    { icon: '⭐', color: '#f45b69', use: 'Mine, dam, port, capital, airport, crop symbol' },
  CIRCLE:    { icon: '⭕', color: '#4f7ef7', use: 'Circular marking around a place' },
  RECTANGLE: { icon: '▭', color: '#9b6dff', use: 'Rectangular selection or marking' },
};

interface GeometryExample {
  desc: string;
  json: any;
  eval: string;
}

const GEOMETRY_EXAMPLES: Record<string, GeometryExample> = {
  POINT: {
    desc: 'A single normalized coordinate on the map canvas.',
    json: { type: 'POINT', x: 0.4265, y: 0.3187 },
    eval: 'DISTANCE — measures distance from expected point'
  },
  LINE: {
    desc: 'Two end-points forming a straight line.',
    json: { type: 'LINE', start: { x: 0.20, y: 0.30 }, end: { x: 0.55, y: 0.45 } },
    eval: 'PATH_SIMILARITY — compares direction and proximity'
  },
  POLYLINE: {
    desc: 'A sequence of points connected into a continuous path.',
    json: { type: 'POLYLINE', points: [{ x: 0.21, y: 0.18 }, { x: 0.24, y: 0.23 }, { x: 0.31, y: 0.28 }] },
    eval: 'PATH_SIMILARITY — compares overall path shape'
  },
  ARROW: {
    desc: 'A directed line with a defined start point, end point and direction.',
    json: { type: 'ARROW', start: { x: 0.30, y: 0.40 }, end: { x: 0.50, y: 0.25 }, direction: 'NE' },
    eval: 'DIRECTION — checks angle within tolerance'
  },
  AREA: {
    desc: 'A loosely drawn region (does not need to close perfectly).',
    json: { type: 'AREA', points: [{ x: 0.25, y: 0.30 }, { x: 0.45, y: 0.28 }, { x: 0.50, y: 0.45 }, { x: 0.25, y: 0.30 }] },
    eval: 'OVERLAP — checks % area overlap with expected region'
  },
  POLYGON: {
    desc: 'A closed shape with a precisely defined boundary.',
    json: { type: 'POLYGON', rings: [[{ x: 0.20, y: 0.30 }, { x: 0.32, y: 0.28 }, { x: 0.35, y: 0.40 }, { x: 0.20, y: 0.30 }]] },
    eval: 'OVERLAP — checks polygon intersection'
  },
  LABEL: {
    desc: 'A text annotation placed at a specific coordinate.',
    json: { type: 'LABEL', x: 0.42, y: 0.31, text: 'Mumbai' },
    eval: 'TEXT_MATCH + DISTANCE — checks text and placement'
  },
  FREEHAND: {
    desc: 'A free-form path traced by the student.',
    json: { type: 'FREEHAND', points: [{ x: 0.10, y: 0.20 }, { x: 0.12, y: 0.22 }, { x: 0.15, y: 0.25 }] },
    eval: 'PATH_SIMILARITY — compares freehand path shape'
  },
  SYMBOL: {
    desc: 'A predefined symbol placed at a coordinate (dam, port, mine, etc.).',
    json: { type: 'SYMBOL', x: 0.38, y: 0.55, symbol_code: 'PORT' },
    eval: 'DISTANCE — checks placement proximity'
  },
  CIRCLE: {
    desc: 'A circle defined by center point and radius.',
    json: { type: 'CIRCLE', cx: 0.45, cy: 0.35, radius: 0.05 },
    eval: 'CONTAINMENT — checks if target point falls inside'
  },
  RECTANGLE: {
    desc: 'A rectangle defined by two corner points.',
    json: { type: 'RECTANGLE', x1: 0.20, y1: 0.25, x2: 0.50, y2: 0.55 },
    eval: 'OVERLAP — checks rectangular region overlap'
  },
};

export default function Tools() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    MapPracticeService.getMasterTools()
      .then((d: any) => {
        setTools(d.tools || []);
        if (d.tools?.length) setSelected(d.tools[0]);
      })
      .catch(() => setError('Failed to load tools. Is the API running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-slate-400 text-sm">⏳ Loading tools...</div>;
  if (error) return <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs m-8">{error}</div>;

  const ex = selected ? GEOMETRY_EXAMPLES[selected.tool_name] : null;
  const meta = selected ? TOOL_ICONS[selected.tool_name] : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Drawing Tools</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          All {tools.length} available tool types — click any tool to see its geometry format and evaluation method
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tool List Sidebar */}
        <div className="space-y-2">
          {tools.map(tool => {
            const t = TOOL_ICONS[tool.tool_name] || { icon: '🔧', color: '#4f7ef7' };
            const isSelected = selected?.tool_id === tool.tool_id;
            return (
              <div
                key={tool.tool_id}
                onClick={() => setSelected(tool)}
                className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <div>
                  <div className={`font-bold text-xs ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                    {tool.tool_name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID #{tool.tool_id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tool Detail Main Panel */}
        {selected && (
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{meta?.icon || '🔧'}</div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{selected.tool_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selected.usage_description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/20">
                      tool_id: {selected.tool_id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                      {selected.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* {ex && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white font-bold">What it draws:</strong> {ex.desc}
                </div>
              )} */}
            </div>

            {/* Geometry JSON Card */}
            {ex && (
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
                  Geometry JSON Format
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This is the exact JSON structure stored in <code className="font-mono text-indigo-500">geometry_data</code> for both the answer key and the student response.
                </p>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(ex.json, null, 2)}
                </pre>
              </div>
            )}

            {/* Evaluation Method Card */}
            {ex && (
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
                  Evaluation Method
                </h4>
                <div className="flex items-start space-x-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-xl">🎯</span>
                  <div>
                    <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-0.5">
                      {ex.eval.split('—')[0].trim()}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {ex.eval.split('—')[1]?.trim()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tips Card */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
                When to use in a Question
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selected.tool_name === 'POINT' && '✅ Use when the student must mark a specific location — a city, capital, port, peak, or historical site.'}
                {selected.tool_name === 'LINE' && '✅ Use when the student must draw a straight boundary, border, or divide between two regions.'}
                {selected.tool_name === 'POLYLINE' && '✅ Use when the student must trace a river, mountain range, coastline, or travel route.'}
                {selected.tool_name === 'ARROW' && '✅ Use when the student must show direction — wind patterns, ocean currents, monsoon flow, or trade routes.'}
                {selected.tool_name === 'AREA' && '✅ Use when the student must shade a rough geographic region — climate zones, soil types, agricultural areas.'}
                {selected.tool_name === 'POLYGON' && '✅ Use when the student must precisely outline a state, country boundary, or exact geographic shape.'}
                {selected.tool_name === 'LABEL' && '✅ Use when the student must type the name of a place, feature, or region at the correct location.'}
                {selected.tool_name === 'FREEHAND' && '✅ Use for creative or rough sketch questions — tracing coastlines or drawing approximate regions by hand.'}
                {selected.tool_name === 'SYMBOL' && '✅ Use when the student must place a specific map symbol — dam, mine, airport, port, or crop icon.'}
                {selected.tool_name === 'CIRCLE' && '✅ Use when the student must highlight or encircle a region or place on the map.'}
                {selected.tool_name === 'RECTANGLE' && '✅ Use when the student must select or frame a rectangular geographic area.'}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
