export function getRawPathForLevel(level: number) {
  // Use level to create a repeatable but unique seed for this level
  const seed = (level * 1337) % 1000;
  
  // Base patterns (we define 8 distinct architectural archetypes)
  const pattern = (level - 1) % 8;
  
  // Variation factors based on level (subtle shifts so every level 1, 9, 17 feel slightly different)
  const shiftX = (Math.sin(level * 0.5) * 30);
  const shiftY = (Math.cos(level * 0.7) * 20);
  const intensity = 0.8 + (Math.sin(level) * 0.2);

  switch(pattern) {
    case 0: // The Grand Corridor (S-Curve)
      return `M 512 -120 L 512 100 C ${300 + shiftX} 100 ${300 + shiftX} 400 512 400 C ${724 + shiftY} 400 ${724 + shiftY} 700 512 700 L 512 1120`;
    
    case 1: // The Iron Zig-Zag
      return `M 512 -120 L 512 150 L ${200 + shiftX} 150 L ${200 + shiftX} 500 L ${824 - shiftX} 500 L ${824 - shiftX} 850 L 512 850 L 512 1120`;
    
    case 2: // The Horseshoe Bypass
      return `M 512 -120 L 512 100 L ${150 + shiftY} 100 L ${150 + shiftY} 900 L ${874 - shiftY} 900 L ${874 - shiftY} 100 L 512 100 L 512 1120`;
    
    case 3: // The Serpent's Coil
      return `M 512 -120 C 512 200 ${100 + shiftX} 200 ${100 + shiftX} 400 C ${100 + shiftX} 600 924 600 924 800 C 924 1000 512 1000 512 1120`;
    
    case 4: // The Tactical Square
      return `M 512 -120 L 512 200 L ${800 + shiftX} 200 L ${800 + shiftX} 800 L ${224 - shiftX} 800 L ${224 - shiftX} 500 L 512 500 L 512 1120`;
    
    case 5: // The Double Helix (Mirrored S)
      return `M 512 -120 L 512 100 C ${100 + shiftX} 100 ${100 + shiftX} 300 512 300 C ${924 + shiftY} 300 ${924 + shiftY} 500 512 500 C ${100 + shiftX} 500 ${100 + shiftX} 700 512 700 C ${924 + shiftY} 700 ${924 + shiftY} 900 512 900 L 512 1120`;

    case 6: // The Blitz Lane (Direct with sharp turns)
      return `M 512 -120 L 512 250 L ${100 + shiftY} 250 L ${100 + shiftY} 350 L ${924 - shiftY} 350 L ${924 - shiftY} 650 L ${100 + shiftY} 650 L ${100 + shiftY} 750 L 512 750 L 512 1120`;

    case 7: // The Omega Loop
      return `M 512 -120 L 512 150 C ${900 + shiftX} 150 ${900 + shiftX} 850 512 850 C ${124 - shiftX} 850 ${124 - shiftX} 150 512 150 L 512 1120`;

    default:
      return "M 512 -120 L 512 1120";
  }
}

let cachedPathPoints: { [level: number]: { points: {x: number, y: number}[], length: number } } = {};

export function getPathPoints(level: number = 1) {
  if (cachedPathPoints[level]) return cachedPathPoints[level];
  if (typeof document === 'undefined') return { points: [], length: 0 };
  
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = getRawPathForLevel(level);
    path.setAttribute('d', d);
    svg.appendChild(path);
    document.body.appendChild(svg);
    
    const length = path.getTotalLength();
    const points = [];
    const numSamples = 500;
    
    for (let i = 0; i <= numSamples; i++) {
      const pt = path.getPointAtLength((i / numSamples) * length);
      points.push({ x: pt.x, y: pt.y });
    }
    
    document.body.removeChild(svg);
    cachedPathPoints[level] = { points, length };
    return cachedPathPoints[level];
  } catch (err) {
    console.error("SVG Path calculation failed, using fallback points");
    const fallback = {
      points: [
        {x: 512, y: -50}, {x: 512, y: 850}
      ],
      length: 900
    };
    return fallback;
  }
}

export function getPointOnPath(progress: number, level: number = 1) {
  const { points, length } = getPathPoints(level);
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
