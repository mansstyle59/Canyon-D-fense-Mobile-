export const SVG_PATH = "M -50 120 C 200 120 250 80 450 150 S 850 200 850 350 S 650 500 450 450 S 150 580 -50 500";

let cachedPathPoints: {x: number, y: number}[] | null = null;
let pathLength = 0;

export function getPathPoints() {
  if (cachedPathPoints) return { points: cachedPathPoints, length: pathLength };
  if (typeof document === 'undefined') return { points: [], length: 0 };
  
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', SVG_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg); // Important for some browsers to calculate length
    
    pathLength = path.getTotalLength();
    const points = [];
    const numSamples = 200;
    
    for (let i = 0; i <= numSamples; i++) {
      const pt = path.getPointAtLength((i / numSamples) * pathLength);
      points.push({ x: pt.x, y: pt.y });
    }
    
    document.body.removeChild(svg);
    cachedPathPoints = points;
  } catch (err) {
    // Fallback static points if something fails with DOM methods
    console.error("SVG Path calculation failed, using fallback points");
    cachedPathPoints = [
      {x: -50, y: 120}, {x: 100, y: 120}, {x: 300, y: 120},
      {x: 400, y: 110}, {x: 500, y: 150}, {x: 650, y: 220},
      {x: 820, y: 250}, {x: 850, y: 350}, {x: 750, y: 450},
      {x: 600, y: 500}, {x: 400, y: 400}, {x: 250, y: 450},
      {x: 150, y: 560}, {x: -50, y: 500}
    ];
    pathLength = 1500; // rough total length
  }
  
  return { points: cachedPathPoints, length: pathLength };
}

export function getPointOnPath(progress: number) {
  const { points, length } = getPathPoints();
  if (points.length === 0) return { x: 0, y: 0 };
  
  // Progress is expected to be distance along the path (0 to length)
  const ratio = Math.max(0, Math.min(1, progress / length));
  const index = ratio * (points.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) return points[lower];
  
  const p1 = points[lower];
  const p2 = points[upper];
  
  return {
    x: p1.x + (p2.x - p1.x) * weight,
    y: p1.y + (p2.y - p1.y) * weight
  }
}
