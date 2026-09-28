export const TOOL_CATEGORIES = {
  POINT: 'POINT',
  LINE: 'LINE',
  AREA: 'AREA',
  RECT: 'RECT'
} as const;

export type ToolCategory = typeof TOOL_CATEGORIES[keyof typeof TOOL_CATEGORIES];

export interface ToolConfigItem {
  category: ToolCategory;
  maxPoints: number;
  label: string;
  konvaType: string;
  stroke: string;
  fill?: string;
  strokeWidth: number;
  radius?: number;
  pointerLength?: number;
  pointerWidth?: number;
  dash?: number[];
  fillPattern?: boolean;
}

export const DRAWING_TOOLS: Record<string, ToolConfigItem> = {
  POINT: { category: TOOL_CATEGORIES.POINT, maxPoints: Infinity, label: 'Point', konvaType: 'POINT', stroke: '#fff', fill: '#4f7ef7', strokeWidth: 2, radius: 7 },
  
  LINE: { category: TOOL_CATEGORIES.LINE, maxPoints: 2, label: 'Line', konvaType: 'LINE', stroke: '#4f7ef7', strokeWidth: 3 },
  ARROW: { category: TOOL_CATEGORIES.LINE, maxPoints: 2, label: 'Arrow', konvaType: 'ARROW', stroke: '#e63946', strokeWidth: 3, pointerLength: 12, pointerWidth: 12 },
  
  AREA: { category: TOOL_CATEGORIES.AREA, maxPoints: Infinity, label: 'Area', konvaType: 'AREA', stroke: '#3ecf8e', fill: 'rgba(62,207,142,0.15)', strokeWidth: 2, dash: [5, 3], fillPattern: true },
  
  RECTANGLE: { category: TOOL_CATEGORIES.RECT, maxPoints: 2, label: 'Rectangle', konvaType: 'RECT', stroke: '#4f7ef7', fill: 'rgba(79,126,247,0.15)', strokeWidth: 2, dash: [5, 3] }
};

export function getToolConfig(toolName?: string): ToolConfigItem {
  if (!toolName) return DRAWING_TOOLS.POINT;
  const normalized = toolName.toUpperCase();
  return DRAWING_TOOLS[normalized] || DRAWING_TOOLS.POINT;
}

/**
 * Normalizes a tool name and returns its category.
 * If the tool is not found, defaults to POINT.
 */
export function getToolCategory(toolName?: string): ToolCategory {
  if (!toolName) return TOOL_CATEGORIES.POINT;
  const normalized = toolName.toUpperCase();
  if (DRAWING_TOOLS[normalized]) {
    return DRAWING_TOOLS[normalized].category;
  }
  console.warn(`Tool "${toolName}" not found in DRAWING_TOOLS. Defaulting to POINT.`);
  return TOOL_CATEGORIES.POINT;
}

/**
 * Returns the maximum number of points allowed for a tool.
 */
export function getMaxPoints(toolName?: string): number {
  if (!toolName) return Infinity;
  const normalized = toolName.toUpperCase();
  if (DRAWING_TOOLS[normalized]) {
    return DRAWING_TOOLS[normalized].maxPoints;
  }
  return Infinity;
}

/**
 * Returns a UI hint based on the tool's category and the number of points already placed.
 */
export function getHint(cat: string, count: number): string {
  if (cat === TOOL_CATEGORIES.RECT)    return count === 0 ? 'Click top-left corner' : count === 1 ? 'Click bottom-right corner' : 'Rectangle defined — clear to redo';
  if (cat === TOOL_CATEGORIES.LINE)    return count === 0 ? 'Click start point' : count === 1 ? 'Click end point' : 'Line defined — clear to redo';
  if (cat === TOOL_CATEGORIES.AREA) return 'Click to add vertices · Last click closes the shape';
  return 'Click to place point(s)';
}
