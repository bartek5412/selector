// Wspólne typy dla ścieżek PDF

export interface PointData {
  type: "point";
  x: number;
  y: number;
}

export interface RectData {
  type: "rect";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export type PathPoint = PointData | RectData;

export interface PathItem {
  items: Array<[string, ...PathPoint[]]>;
}

export interface PathData {
  path?: {
    items?: Array<[string, ...PathPoint[]]>;
    hasHoles?: boolean;
    isClosed?: boolean;
    complexity?: string;
    validation?: {
      valid: boolean;
      issues: string[];
      warnings: string[];
    };
  };
}
