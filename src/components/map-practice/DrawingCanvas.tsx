import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Transformer, Arrow, Text } from 'react-konva';
import { getToolConfig } from './utils/toolConfig';
// import { useTheme } from 'next-themes';

export interface Point {
  x: number;
  y: number;
}

export interface ShapePointPayload {
  points: Point[];
  label?: string;
}

export interface CanvasShape {
  id: string;
  type: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  points?: Point[];
  label?: string;
}

export interface ResponseItem {
  tool_type: string;
  geometry_data: any;
}

export function shapesToPoints(shapes: CanvasShape[]): ShapePointPayload[] {
  return shapes.map(s => {
    let points: Point[] = [];
    if (s.type === 'POINT' || s.type === 'SYMBOL') {
      if (s.startX !== undefined && s.startY !== undefined) {
        points = [{ x: Number(s.startX.toFixed(5)), y: Number(s.startY.toFixed(5)) }];
      }
    } else if (s.type === 'RECTANGLE' || s.type === 'CIRCLE' || s.type === 'LINE' || s.type === 'ARROW') {
      if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
        points = [
          { x: Number(s.startX.toFixed(5)), y: Number(s.startY.toFixed(5)) },
          { x: Number(s.endX.toFixed(5)), y: Number(s.endY.toFixed(5)) }
        ];
      }
    } else if (s.type === 'AREA' || s.type === 'POLYGON' || s.type === 'POLYLINE' || s.type === 'FREEHAND') {
      points = (s.points || []).map(p => ({ x: Number(p.x.toFixed(5)), y: Number(p.y.toFixed(5)) }));
    }

    let label = s.label || '';
    let marks: number | undefined = undefined;
    if (label) {
      const match = label.match(/^(.*?)(?:\s*\(([0-9.]+)m\))?$/);
      if (match) {
        if (match[1]) label = match[1].trim();
        if (match[2]) marks = parseFloat(match[2]);
      }
    }

    return { points, label, ...(marks !== undefined ? { marks } : {}) };
  }).filter(obj => obj.points.length > 0);
}

function getCardinalDirection(startX: number, startY: number, endX: number, endY: number): string {
  const dx = endX - startX;
  const dy = -(endY - startY); // Canvas y increases downwards
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  if (angleDeg >= -22.5 && angleDeg < 22.5) return 'E';
  if (angleDeg >= 22.5 && angleDeg < 67.5) return 'NE';
  if (angleDeg >= 67.5 && angleDeg < 112.5) return 'N';
  if (angleDeg >= 112.5 && angleDeg < 157.5) return 'NW';
  if (angleDeg >= 157.5 || angleDeg < -157.5) return 'W';
  if (angleDeg >= -157.5 && angleDeg < -112.5) return 'SW';
  if (angleDeg >= -112.5 && angleDeg < -67.5) return 'S';
  if (angleDeg >= -67.5 && angleDeg < -22.5) return 'SE';
  return 'E';
}

export function buildResponsesArray(shapes: CanvasShape[]): ResponseItem[] {
  return shapes.map(s => {
    const toolType = (s.type || 'POINT').toUpperCase();
    let label = s.label || '';
    if (label) {
      const match = label.match(/^(.*?)(?:\s*\(([0-9.]+)m\))?$/);
      if (match && match[1]) {
        label = match[1].trim();
      }
    }

    const geometry_data: any = {
      label: label,
      points: []
    };

    if (toolType === 'POINT') {
      if (s.startX !== undefined && s.startY !== undefined) {
        const x = Number(s.startX.toFixed(5));
        const y = Number(s.startY.toFixed(5));
        // geometry_data.x = x;
        // geometry_data.y = y;
        geometry_data.points = [{ x, y }];
      }
    } else if (toolType === 'RECTANGLE') {
      if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
        const x1 = Number(s.startX.toFixed(5));
        const y1 = Number(s.startY.toFixed(5));
        const x2 = Number(s.endX.toFixed(5));
        const y2 = Number(s.endY.toFixed(5));
        // geometry_data.x1 = x1;
        // geometry_data.y1 = y1;
        // geometry_data.x2 = x2;
        // geometry_data.y2 = y2;
        geometry_data.points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      }
    } else if (toolType === 'LINE') {
      if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
        const x1 = Number(s.startX.toFixed(5));
        const y1 = Number(s.startY.toFixed(5));
        const x2 = Number(s.endX.toFixed(5));
        const y2 = Number(s.endY.toFixed(5));
        geometry_data.start = { x: x1, y: y1 };
        geometry_data.end = { x: x2, y: y2 };
        geometry_data.points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      }
    } else if (toolType === 'ARROW') {
      if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
        const x1 = Number(s.startX.toFixed(5));
        const y1 = Number(s.startY.toFixed(5));
        const x2 = Number(s.endX.toFixed(5));
        const y2 = Number(s.endY.toFixed(5));
        // geometry_data.start = { x: x1, y: y1 };
        // geometry_data.end = { x: x2, y: y2 };
        geometry_data.direction = getCardinalDirection(x1, y1, x2, y2);
        geometry_data.points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      }
    } else if (toolType === 'CIRCLE') {
      if (s.startX !== undefined && s.startY !== undefined && s.endX !== undefined && s.endY !== undefined) {
        const cx = Number(s.startX.toFixed(5));
        const cy = Number(s.startY.toFixed(5));
        const endX = Number(s.endX.toFixed(5));
        const endY = Number(s.endY.toFixed(5));
        const radius = Number(Math.sqrt(Math.pow(endX - cx, 2) + Math.pow(endY - cy, 2)).toFixed(5));
        // geometry_data.cx = cx;
        // geometry_data.cy = cy;
        geometry_data.radius = radius;
        geometry_data.points = [{ x: cx, y: cy }, { x: endX, y: endY }];
      }
    } else if (toolType === 'POLYGON') {
      const pts = (s.points || []).map(p => ({ x: Number(p.x.toFixed(5)), y: Number(p.y.toFixed(5)) }));
      // geometry_data.rings = pts.length > 0 ? [pts] : [];
      geometry_data.points = pts;
    } else if (toolType === 'LABEL') {
      if (s.startX !== undefined && s.startY !== undefined) {
        const x = Number(s.startX.toFixed(5));
        const y = Number(s.startY.toFixed(5));
        // geometry_data.x = x;
        // geometry_data.y = y;
        geometry_data.text = label;
        geometry_data.points = [{ x, y }];
      }
    } else if (toolType === 'SYMBOL') {
      if (s.startX !== undefined && s.startY !== undefined) {
        const x = Number(s.startX.toFixed(5));
        const y = Number(s.startY.toFixed(5));
        // geometry_data.x = x;
        // geometry_data.y = y;
        geometry_data.symbol_code = label || 'SYMBOL';
        geometry_data.points = [{ x, y }];
      }
    } else {
      // AREA, POLYLINE, FREEHAND, etc.
      const pts = (s.points || []).map(p => ({ x: Number(p.x.toFixed(5)), y: Number(p.y.toFixed(5)) }));
      if (pts.length === 0 && s.startX !== undefined && s.startY !== undefined) {
        const x1 = Number(s.startX.toFixed(5));
        const y1 = Number(s.startY.toFixed(5));
        if (s.endX !== undefined && s.endY !== undefined) {
          const x2 = Number(s.endX.toFixed(5));
          const y2 = Number(s.endY.toFixed(5));
          pts.push({ x: x1, y: y1 }, { x: x2, y: y2 });
        } else {
          pts.push({ x: x1, y: y1 });
        }
      }
      geometry_data.points = pts;
    }

    return {
      tool_type: toolType,
      geometry_data: geometry_data
    };
  }).filter(obj => obj.geometry_data.points && obj.geometry_data.points.length > 0);
}

export function pointsToShapes(coordsArray: any[], type: string): CanvasShape[] {
  const shapes: CanvasShape[] = [];
  if (!coordsArray || coordsArray.length === 0) return shapes;
  
  // Detect if old flat array format (first item is a point {x, y})
  const isOldFormat = coordsArray[0] && coordsArray[0].x !== undefined;

  if (isOldFormat) {
    if (type === 'POINT' || type === 'SYMBOL') {
      coordsArray.forEach((p: Point, i: number) => {
        shapes.push({ id: `${type}_${i}_${Date.now()}`, type, startX: p.x, startY: p.y, endX: p.x, endY: p.y, label: `Point ${i + 1}` });
      });
    } else if (type === 'AREA') {
      shapes.push({ id: `${type}_0_${Date.now()}`, type, points: [...coordsArray], label: `Area 1` });
    } else {
      for (let i = 0; i < coordsArray.length; i += 2) {
        if (coordsArray[i] && coordsArray[i + 1]) {
          shapes.push({
            id: `${type}_${i}_${Date.now()}`, type,
            startX: coordsArray[i].x, startY: coordsArray[i].y,
            endX: coordsArray[i + 1].x, endY: coordsArray[i + 1].y,
            label: `${type} ${Math.floor(i / 2) + 1}`
          });
        }
      }
    }
  } else {
    // New response/geometry_data nested format
    coordsArray.forEach((rawObj: any, i: number) => {
      const toolType = (rawObj.tool_type || type).toUpperCase();
      const geom = rawObj.geometry_data || rawObj;
      const id = `${toolType}_${i}_${Date.now()}`;
      const labelText = geom.label || rawObj.label || `${toolType} ${i + 1}`;

      // Extract points array fallback
      let p: Point[] = [];
      if (geom.points && Array.isArray(geom.points)) {
        p = geom.points;
      } else if (geom.rings && Array.isArray(geom.rings) && geom.rings[0]) {
        p = geom.rings[0];
      }

      if (toolType === 'POINT' || toolType === 'SYMBOL' || toolType === 'LABEL') {
        const x = geom.x !== undefined ? geom.x : (p[0]?.x ?? 0);
        const y = geom.y !== undefined ? geom.y : (p[0]?.y ?? 0);
        shapes.push({ id, type: toolType, startX: x, startY: y, endX: x, endY: y, label: labelText });
      } else if (toolType === 'RECTANGLE') {
        const x1 = geom.x1 !== undefined ? geom.x1 : (p[0]?.x ?? 0);
        const y1 = geom.y1 !== undefined ? geom.y1 : (p[0]?.y ?? 0);
        const x2 = geom.x2 !== undefined ? geom.x2 : (p[1]?.x ?? 0);
        const y2 = geom.y2 !== undefined ? geom.y2 : (p[1]?.y ?? 0);
        shapes.push({ id, type: toolType, startX: x1, startY: y1, endX: x2, endY: y2, label: labelText });
      } else if (toolType === 'LINE' || toolType === 'ARROW') {
        const x1 = geom.start?.x !== undefined ? geom.start.x : (p[0]?.x ?? 0);
        const y1 = geom.start?.y !== undefined ? geom.start.y : (p[0]?.y ?? 0);
        const x2 = geom.end?.x !== undefined ? geom.end.x : (p[1]?.x ?? 0);
        const y2 = geom.end?.y !== undefined ? geom.end.y : (p[1]?.y ?? 0);
        shapes.push({ id, type: toolType, startX: x1, startY: y1, endX: x2, endY: y2, label: labelText });
      } else if (toolType === 'CIRCLE') {
        const cx = geom.cx !== undefined ? geom.cx : (p[0]?.x ?? 0);
        const cy = geom.cy !== undefined ? geom.cy : (p[0]?.y ?? 0);
        const r = geom.radius !== undefined ? geom.radius : 0.05;
        shapes.push({ id, type: toolType, startX: cx, startY: cy, endX: cx + r, endY: cy, label: labelText });
      } else {
        // AREA, POLYGON, POLYLINE, FREEHAND
        shapes.push({ id, type: toolType, points: [...p], label: labelText });
      }
    });
  }
  return shapes;
}

const hatchCache: Record<string, HTMLCanvasElement> = {};
function getHatchPattern(color: string): HTMLCanvasElement {
  if (hatchCache[color]) return hatchCache[color];
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(16, 0);
    ctx.moveTo(-4, 4);
    ctx.lineTo(4, -4);
    ctx.moveTo(12, 20);
    ctx.lineTo(20, 12);
    ctx.stroke();
  }
  hatchCache[color] = canvas;
  return canvas;
}

function useSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

export interface DrawingCanvasProps {
  imageUrl: string;
  activeTool?: string;
  shapes?: CanvasShape[];
  onChange?: (shapes: CanvasShape[]) => void;
  readOnly?: boolean;
  maxObjects?: number | null;
  canvasWidthPx?: number | null;
  canvasHeightPx?: number | null;
}

export default function DrawingCanvas({
  imageUrl,
  activeTool = 'SELECT',
  shapes = [],
  onChange,
  readOnly = false,
  maxObjects = null,
  canvasWidthPx = 1000,
  canvasHeightPx = 1000
}: DrawingCanvasProps) {
  // const { theme } = useTheme();
  const isDark = false; // Always use light theme

  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(containerRef);
  const [drawingShape, setDrawingShape] = useState<CanvasShape | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (activeTool !== 'SELECT' || readOnly) {
      setSelectedId(null);
    } else if (activeTool === 'SELECT' && !selectedId && shapes.length > 0) {
      setSelectedId(shapes[0].id);
    }
  }, [activeTool, readOnly, shapes]);

  useEffect(() => {
    if (selectedId && trRef.current && layerRef.current && !readOnly) {
      const node = layerRef.current.findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, shapes, readOnly]);

  const [limitModalData, setLimitModalData] = useState<{ tool: string; max: number } | null>(null);

  const handleMouseDown = (e: any) => {
    if (readOnly) return;
    if (activeTool === 'SELECT') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) setSelectedId(null);
      return;
    }

    const currentToolShapes = shapes.filter(s => (s.type || '').toUpperCase() === activeTool.toUpperCase());
    if (maxObjects !== null && currentToolShapes.length >= maxObjects && !drawingShape) {
      setLimitModalData({ tool: activeTool, max: maxObjects });
      return;
    }

    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    const nx = pos.x / size.width;
    const ny = pos.y / size.height;
    const config = getToolConfig(activeTool);

    if (config.konvaType === 'AREA') {
      if (!drawingShape) {
        setDrawingShape({
          id: `shape_${Date.now()}`,
          type: activeTool,
          points: [{ x: nx, y: ny }, { x: nx, y: ny }]
        });
      } else {
        const currentPoints = drawingShape.points || [];
        const firstPoint = currentPoints[0];
        const lastFixedPoint = currentPoints[currentPoints.length - 2];

        const distToFirst = Math.sqrt(Math.pow(nx - firstPoint.x, 2) + Math.pow(ny - firstPoint.y, 2));
        const distToLast = lastFixedPoint 
          ? Math.sqrt(Math.pow(nx - lastFixedPoint.x, 2) + Math.pow(ny - lastFixedPoint.y, 2))
          : 999;

        if (distToFirst < 0.02 && currentPoints.length > 3) {
          // Close shape by clicking near the start
          const finalPoints = currentPoints.slice(0, -1);
          onChange?.([...shapes, { ...drawingShape, points: finalPoints }]);
          setDrawingShape(null);
          return;
        }

        if (distToLast < 0.005) {
          return; // Ignore accidental double clicks in place
        }

        setDrawingShape(prev => ({
          ...prev!,
          points: [...(prev?.points || []).slice(0, -1), { x: nx, y: ny }, { x: nx, y: ny }]
        }));
      }
    } else {
      if (drawingShape) return;
      setDrawingShape({
        id: `shape_${Date.now()}`,
        type: activeTool,
        startX: nx,
        startY: ny,
        endX: nx,
        endY: ny,
      });
    }
  };

  const handleMouseMove = (e: any) => {
    if (!drawingShape) return;

    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    const nx = pos.x / size.width;
    const ny = pos.y / size.height;
    const config = getToolConfig(activeTool);

    if (config.konvaType === 'AREA') {
      setDrawingShape(prev => {
        if (!prev) return null;
        const newPoints = [...(prev.points || [])];
        newPoints[newPoints.length - 1] = { x: nx, y: ny };
        return { ...prev, points: newPoints };
      });
    } else {
      setDrawingShape(prev => prev ? ({ ...prev, endX: nx, endY: ny }) : null);
    }
  };

  const handleMouseUp = () => {
    if (!drawingShape) return;
    const config = getToolConfig(activeTool);

    if (config.konvaType === 'AREA') return;

    const startX = drawingShape.startX ?? 0;
    const startY = drawingShape.startY ?? 0;
    const endX = drawingShape.endX ?? 0;
    const endY = drawingShape.endY ?? 0;

    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (config.konvaType === 'POINT' || dist > 0.005) {
      onChange?.([...shapes, { ...drawingShape }]);
    }
    setDrawingShape(null);
  };

  const handleDoubleClick = (e: any) => {
    if (!drawingShape) return;
    const config = getToolConfig(activeTool);

    if (config.konvaType === 'AREA') {
      const currentPoints = drawingShape.points || [];
      const finalPoints = currentPoints.slice(0, -1);
      if (finalPoints.length >= 2) {
        onChange?.([...shapes, { ...drawingShape, points: finalPoints }]);
      }
      setDrawingShape(null);
    }
  };

  const handleShapeClick = (id: string) => (e: any) => {
    if (activeTool === 'SELECT') {
      e.cancelBubble = true;
      setSelectedId(id);
    }
  };

  const handleTransformEnd = (e: any, index: number, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const newShapes = [...shapes];
    const shape = { ...newShapes[index] };
    const config = getToolConfig(shape.type);

    if (config.konvaType === 'RECT' || config.konvaType === 'CIRCLE') {
      shape.startX = node.x() / size.width;
      shape.startY = node.y() / size.height;
      shape.endX = (shape.startX || 0) + (node.width() * scaleX) / size.width;
      shape.endY = (shape.startY || 0) + (node.height() * scaleY) / size.height;
    } else if (config.konvaType === 'LINE' || config.konvaType === 'ARROW') {
      const points = node.points();
      const nx1 = (node.x() + points[0] * scaleX) / size.width;
      const ny1 = (node.y() + points[1] * scaleY) / size.height;
      const nx2 = (node.x() + points[2] * scaleX) / size.width;
      const ny2 = (node.y() + points[3] * scaleY) / size.height;
      shape.startX = nx1; shape.startY = ny1; shape.endX = nx2; shape.endY = ny2;
      node.x(0); node.y(0);
      node.points([nx1 * size.width, ny1 * size.height, nx2 * size.width, ny2 * size.height]);
    } else if (config.konvaType === 'AREA') {
      const points = node.points();
      const newPts: Point[] = [];
      for (let i = 0; i < points.length; i += 2) {
        newPts.push({
          x: (node.x() + points[i] * scaleX) / size.width,
          y: (node.y() + points[i + 1] * scaleY) / size.height
        });
      }
      shape.points = newPts;
      node.x(0); node.y(0);
      node.points(newPts.flatMap(p => [p.x * size.width, p.y * size.height]));
    }

    newShapes[index] = shape;
    onChange?.(newShapes);
  };

  const handleDragEnd = (e: any, index: number) => {
    const node = e.target;
    const newShapes = [...shapes];
    const shape = { ...newShapes[index] };
    const config = getToolConfig(shape.type);

    const dx = node.x() / size.width;
    const dy = node.y() / size.height;

    if (config.konvaType === 'LINE' || config.konvaType === 'ARROW' || config.konvaType === 'AREA') {
      const points = node.points();
      if (config.konvaType === 'AREA') {
        const newPts: Point[] = [];
        for (let i = 0; i < points.length; i += 2) {
          newPts.push({ x: (node.x() + points[i]) / size.width, y: (node.y() + points[i + 1]) / size.height });
        }
        shape.points = newPts;
        node.points(newPts.flatMap(p => [p.x * size.width, p.y * size.height]));
      } else {
        shape.startX = (node.x() + points[0]) / size.width;
        shape.startY = (node.y() + points[1]) / size.height;
        shape.endX = (node.x() + points[2]) / size.width;
        shape.endY = (node.y() + points[3]) / size.height;
        node.points([(shape.startX || 0) * size.width, (shape.startY || 0) * size.height, (shape.endX || 0) * size.width, (shape.endY || 0) * size.height]);
      }
      node.x(0); node.y(0);
    } else {
      const w = (shape.endX || 0) - (shape.startX || 0);
      const h = (shape.endY || 0) - (shape.startY || 0);
      shape.startX = dx; shape.startY = dy; shape.endX = dx + w; shape.endY = dy + h;
    }

    newShapes[index] = shape;
    onChange?.(newShapes);
  };

  const renderShape = (shape: CanvasShape, index: number, isDrawing = false) => {
    const sW = size.width;
    const sH = size.height;
    const isSelected = shape.id === selectedId;
    const draggable = !readOnly && activeTool === 'SELECT';
    const config = getToolConfig(shape.type);

    const commonProps = {
      id: shape.id,
      onClick: readOnly ? undefined : handleShapeClick(shape.id),
      onTap: readOnly ? undefined : handleShapeClick(shape.id),
      draggable,
      onDragEnd: (e: any) => handleDragEnd(e, index),
      onTransformEnd: (e: any) => handleTransformEnd(e, index, shape.id)
    };

    const strokeColor = isSelected ? "#3ecf8e" : config.stroke;

    let shapeNode: React.ReactNode = null;
    let labelX = 0, labelY = 0;

    if (config.konvaType === 'RECT') {
      const x1 = (shape.startX || 0) * sW; const y1 = (shape.startY || 0) * sH;
      const x2 = (shape.endX || 0) * sW; const y2 = (shape.endY || 0) * sH;
      labelX = Math.min(x1, x2) + 5; labelY = Math.min(y1, y2) + 5;
      shapeNode = (
        <Rect {...commonProps}
          x={Math.min(x1, x2)} y={Math.min(y1, y2)}
          width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)}
          fill={config.fill} stroke={strokeColor}
          strokeWidth={config.strokeWidth} dash={config.dash}
        />
      );
    }

    else if (config.konvaType === 'CIRCLE') {
      const x1 = (shape.startX || 0) * sW; const y1 = (shape.startY || 0) * sH;
      const x2 = (shape.endX || 0) * sW; const y2 = (shape.endY || 0) * sH;
      const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      labelX = x1 + r + 5; labelY = y1 - 10;
      shapeNode = (
        <Circle {...commonProps}
          x={x1} y={y1} radius={r}
          fill={config.fill} stroke={strokeColor}
          strokeWidth={config.strokeWidth} dash={config.dash}
        />
      );
    }

    else if (config.konvaType === 'LINE' || config.konvaType === 'ARROW') {
      const x1 = (shape.startX || 0) * sW; const y1 = (shape.startY || 0) * sH;
      const x2 = (shape.endX || 0) * sW; const y2 = (shape.endY || 0) * sH;
      labelX = x1 + 10; labelY = y1 + 10;
      const ShapeComp = config.konvaType === 'ARROW' ? Arrow : Line;
      shapeNode = (
        <ShapeComp {...commonProps}
          points={[x1, y1, x2, y2]}
          stroke={strokeColor} strokeWidth={config.strokeWidth}
          pointerLength={config.pointerLength} pointerWidth={config.pointerWidth}
          fill={strokeColor} hitStrokeWidth={10}
        />
      );
    }

    else if (config.konvaType === 'AREA') {
      const currentPoints = shape.points || [];
      const flatPoints = currentPoints.flatMap(p => [p.x * sW, p.y * sH]);
      const isClosed = config.konvaType === 'AREA' && !isDrawing;
      if (currentPoints.length > 0) {
        labelX = currentPoints[0].x * sW + 5;
        labelY = currentPoints[0].y * sH + 5;
      }
      shapeNode = (
        <Line {...commonProps}
          points={flatPoints}
          closed={isClosed}
          stroke={strokeColor} strokeWidth={config.strokeWidth}
          fill={isClosed && !config.fillPattern ? config.fill : undefined}
          fillPatternImage={isClosed && config.fillPattern ? (getHatchPattern(config.stroke) as unknown as HTMLImageElement) : undefined}
          dash={config.dash}
          hitStrokeWidth={10}
        />
      );
    }

    else if (config.konvaType === 'POINT') {
      const x1 = (shape.startX || 0) * sW; const y1 = (shape.startY || 0) * sH;
      const radius = config.radius || 7;
      labelX = x1 + radius + 5; labelY = y1 - 10;
      shapeNode = (
        <Circle {...commonProps}
          x={x1} y={y1} radius={radius}
          fill={isSelected ? "#3ecf8e" : config.fill}
          stroke={config.stroke} strokeWidth={config.strokeWidth}
        />
      );
    }

    if (!shapeNode) return null;

    return (
      <React.Fragment key={shape.id || `temp_${index}`}>
        {shapeNode}
        {shape.label && (
          <Text
            x={labelX} y={labelY}
            text={shape.label}
            fontSize={13}
            fontWeight="bold"
            fill="white"
            shadowColor="black"
            shadowBlur={4}
            shadowOffset={{ x: 1, y: 1 }}
            shadowOpacity={1}
            listening={false}
          />
        )}
      </React.Fragment>
    );
  };

  const stageStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, zIndex: 10,
    cursor: activeTool === 'SELECT' ? 'default' : 'crosshair',
  };

  const activeConfig = getToolConfig(activeTool);
  const isMultiClick = drawingShape && (activeConfig.konvaType === 'POLYGON' || activeConfig.konvaType === 'POLYLINE');

  const canvasBg = isDark ? '#1a1f2e' : '#f8fafc';
  const containerBorder = isDark ? '1px solid #334155' : '1px solid #e2e8f0';
  const bottomBarBg = isDark ? '#0a0e17' : '#ffffff';
  const bottomBarBorder = isDark ? '1px solid #1e293b' : '1px solid #e2e8f0';
  const helpTextColor = isDark ? '#94a3b8' : '#64748b';
  const labelTextColor = isDark ? '#64748b' : '#475569';
  const inputBg = isDark ? '#121827' : '#f8fafc';
  const inputBorder = isDark ? '1px solid #334155' : '1px solid #cbd5e1';
  const inputTextColor = isDark ? '#f8fafc' : '#0f172a';

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: canvasBg, borderRadius: 8, border: containerBorder, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
        <div 
          ref={containerRef} 
          style={{ 
            position: 'relative', 
            display: 'inline-block',
            lineHeight: 0
          }}
        >
          <img 
            src={imageUrl} 
            alt="Map Background" 
            draggable={false}
            style={{ 
              display: 'block', 
              maxWidth: '100%', 
              maxHeight: '60vh', 
              width: 'auto', 
              height: 'auto', 
              opacity: 0.9 
            }} 
          />

          {size.width > 0 && (
            <div style={stageStyle}>
              <Stage width={size.width} height={size.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDblClick={handleDoubleClick}
              >
                <Layer ref={layerRef}>
                  {shapes.map((s, i) => renderShape(s, i))}
                  {drawingShape && renderShape(drawingShape, -1, true)}
                  <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) return oldBox;
                    return newBox;
                  }} />
                </Layer>
              </Stage>
            </div>
          )}
        </div>
      </div>
      {!readOnly && (
        <div style={{ padding: '10px 14px', fontSize: 12, background: bottomBarBg, borderTop: bottomBarBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: helpTextColor, fontWeight: 500 }}>
            {activeTool === 'SELECT'
              ? '✅ Click a shape to select, drag to move, or use handles to resize.'
              : isMultiClick
                ? '🖌️ Click to add points. Double-click to finish shape.'
                : '🖌️ Click and drag on the map to draw.'}
          </span>
          {activeTool === 'SELECT' && shapes.length > 0 && (() => {
            const currentShape = shapes.find(s => s.id === selectedId) || shapes[0];
            const activeId = selectedId || currentShape.id;

            let rawLabel = currentShape?.label || '';

            const updateShapeLabelText = (newLabel: string) => {
              const newShapes = shapes.map(s => s.id === activeId ? { ...s, label: newLabel } : s);
              onChange?.(newShapes);
            };

            return (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: labelTextColor, fontSize: 11, fontWeight: 600 }}>Point:</span>
                  <select 
                    value={activeId} 
                    onChange={e => setSelectedId(e.target.value)}
                    style={{ padding: '4px 10px', fontSize: 12, background: inputBg, border: inputBorder, color: inputTextColor, borderRadius: 8, maxWidth: 160, cursor: 'pointer' }}
                  >
                    {shapes.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        {s.label || `Point ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: labelTextColor, fontSize: 11, fontWeight: 600 }}>Label:</span>
                  <input 
                    type="text" 
                    placeholder="Enter Label" 
                    value={rawLabel}
                    onChange={(e) => updateShapeLabelText(e.target.value)}
                    style={{ padding: '4px 10px', fontSize: 12, background: inputBg, border: inputBorder, color: inputTextColor, borderRadius: 8, width: 160 }}
                  />
                </div>
                <button 
                  style={{ 
                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)', 
                    color: isDark ? '#f87171' : '#dc2626', 
                    border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)', 
                    padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 
                  }}
                  onClick={() => { onChange?.(shapes.filter(s => s.id !== activeId)); setSelectedId(null); }}
                >
                  ✕ Delete Selected
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Custom Limit Reached Modal Popup */}
      {limitModalData && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: 24, maxWidth: 360, width: '100%',
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 24
            }}>
              ⚠️
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                Limit Reached for {limitModalData.tool}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: '1.5' }}>
                You have already placed the maximum limit of <strong>{limitModalData.max} {limitModalData.tool}(s)</strong> allowed for this question.
              </p>
            </div>
            <button
              onClick={() => setLimitModalData(null)}
              style={{
                marginTop: 8, padding: '10px 16px', borderRadius: 12, backgroundColor: '#2563eb',
                color: '#ffffff', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
