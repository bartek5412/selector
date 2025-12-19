const PT_TO_MM = 25.4 / 72.0;

interface BboxResult {
  widthMm: number;
  heightMm: number;
  areaMm2: number;
}

interface PathData {
  path?: {
    items?: Array<[string, ...any[]]>;
  };
}

export function calculateBbox(pathData: PathData | null): BboxResult | null {
  if (!pathData?.path?.items) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const item of pathData.path.items) {
    const points = item.slice(1);
    for (const p of points) {
      if (p?.type === "point") {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      } else if (p?.type === "rect") {
        if (p.x0 < minX) minX = p.x0;
        if (p.y0 < minY) minY = p.y0;
        if (p.x1 > maxX) maxX = p.x1;
        if (p.y1 > maxY) maxY = p.y1;
      }
    }
  }

  if (
    !isFinite(minX) ||
    !isFinite(minY) ||
    !isFinite(maxX) ||
    !isFinite(maxY)
  ) {
    return null;
  }

  const widthPt = Math.max(0, maxX - minX);
  const heightPt = Math.max(0, maxY - minY);
  const areaPt2 = widthPt * heightPt;
  const widthMm = widthPt * PT_TO_MM;
  const heightMm = heightPt * PT_TO_MM;
  const areaMm2 = areaPt2 * PT_TO_MM ** 2;

  return { widthMm, heightMm, areaMm2 };
}

