import { motion, AnimatePresence } from 'motion/react';
import React, { useMemo, useState, useRef, useCallback } from 'react';
import { GameState, TowerType, Enemy, PlacedTurret } from '../types';
import { TOWER_CONFIGS } from '../constants';
import { Crosshair, Target, AlertTriangle } from 'lucide-react';
import { getRawPathForLevel, getPathPoints } from '../utils/path';

// Deterministic random generator for static decorative battlefield features
const getSeededRandom = (seed: number) => {
    return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
};

const getTurretSlotsForLevel = (level: number) => {
  const { points } = getPathPoints(level);
  
  // If points are empty or fallback, return standard static slots
  if (!points || points.length < 10) {
    return [
      { id: '1', x: 200, y: 150 }, { id: '2', x: 824, y: 150 }, { id: '3', x: 512, y: 250 }, { id: '4', x: 512, y: 550 },
      { id: '5', x: 100, y: 400 }, { id: '6', x: 924, y: 400 }, { id: '7', x: 100, y: 700 }, { id: '8', x: 924, y: 700 },
      { id: '9', x: 400, y: 850 }, { id: '10', x: 624, y: 850 }, { id: '11', x: 750, y: 250 }, { id: '12', x: 274, y: 550 },
      { id: '13', x: 150, y: 50 }, { id: '14', x: 874, y: 50 }, { id: '15', x: 80, y: 250 }, { id: '16', x: 944, y: 850 },
      { id: '17', x: 400, y: 100 }, { id: '18', x: 624, y: 100 }
    ];
  }

  const generateWithConstraints = (minDistToPath: number, maxDistToPath: number, minDistBetweenSlots: number) => {
    const list: { x: number; y: number }[] = [];
    const stepCount = 28; // Increase density to maximize coverage
    
    for (let i = 1; i <= stepCount; i++) {
      // Progress between 8% and 92% along the path length
      const progressRatio = 0.08 + (i / (stepCount + 1)) * 0.84;
      const index = Math.floor(progressRatio * (points.length - 1));
      const p = points[index];
      
      // Calculate tangent vector
      const pPrev = points[Math.max(0, index - 5)];
      const pNext = points[Math.min(points.length - 1, index + 5)];
      const dx = pNext.x - pPrev.x;
      const dy = pNext.y - pPrev.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      
      if (len === 0) continue;
      
      const tx = dx / len;
      const ty = dy / len;
      const nx = -ty; // Normal vector on one side
      const ny = tx;
      
      // Test both left and right sides of the track
      const distances = [74, -74];
      for (const dist of distances) {
        const cx = p.x + nx * dist;
        const cy = p.y + ny * dist;
        
        // 1. Boundary check: leave padding around the SVG margins
        if (cx < 55 || cx > 969 || cy < -60 || cy > 930) {
          continue;
        }
        
        // 2. Clear of other parts of the track check
        // We ensure that this slot doesn't sit on top of any other part of the winding track.
        let overlapsTrack = false;
        // Sample every 4th point of the path for high speed and accuracy
        for (let j = 0; j < points.length; j += 4) {
          const distToTrack = Math.hypot(cx - points[j].x, cy - points[j].y);
          if (distToTrack < minDistToPath) {
            overlapsTrack = true;
            break;
          }
        }
        if (overlapsTrack) continue;
        
        // 3. Clear of previously placed slots check
        let tooCloseToSlot = false;
        for (const existing of list) {
          const distToSlot = Math.hypot(cx - existing.x, cy - existing.y);
          if (distToSlot < minDistBetweenSlots) {
            tooCloseToSlot = true;
            break;
          }
        }
        if (tooCloseToSlot) continue;
        
        // Standard slot candidate matches!
        list.push({ x: Math.round(cx), y: Math.round(cy) });
      }
    }
    return list;
  };

  // PASS 1: Tactical high-quality spacing constraints
  let generatedCoords = generateWithConstraints(62, 85, 105);
  
  // PASS 2: If we didn't find enough slots (below 14), relax spacing constraints to fit more
  if (generatedCoords.length < 14) {
    generatedCoords = generateWithConstraints(56, 90, 85);
  }
  
  // PASS 3: Fallback if still too low (extremely wild path shapes)
  if (generatedCoords.length < 10) {
    generatedCoords = generateWithConstraints(48, 100, 70);
  }

  // Convert to formatted objects with stable IDs
  return generatedCoords.slice(0, 18).map((coord, idx) => ({
    id: String(idx + 1),
    x: coord.x,
    y: coord.y
  }));
};

const StaticBackground = React.memo(({ level, theme, isNight }: { level: number, theme: any, isNight: boolean }) => {
    const pathD = getRawPathForLevel(level);

    // Generate deterministic battlefield structures
    const battleDecorations = useMemo(() => {
        const random = getSeededRandom(level * 22 + 91);
        const decs = [];
        // Ruined buildings, command posts, crash sites
        for (let i = 0; i < 5; i++) {
            decs.push({
                type: 'bunker',
                x: Math.floor(random() * 800) + 110,
                y: Math.floor(random() * 800) + 100,
                w: Math.floor(random() * 45) + 35,
                h: Math.floor(random() * 40) + 30,
                rot: Math.floor(random() * 360)
            });
        }
        // Sandbag wall blocks
        for (let i = 0; i < 4; i++) {
            decs.push({
                type: 'sandbag',
                x: Math.floor(random() * 820) + 100,
                y: Math.floor(random() * 810) + 100,
                len: Math.floor(random() * 35) + 25,
                rot: Math.floor(random() * 180)
            });
        }
        // Shell Crates / Camo tents
        for (let i = 0; i < 4; i++) {
            decs.push({
                type: 'tent',
                x: Math.floor(random() * 820) + 100,
                y: Math.floor(random() * 810) + 100,
                size: Math.floor(random() * 25) + 15,
                rot: Math.floor(random() * 360)
            });
        }
        // Shell/Explosion Craters from artillery fire
        for (let i = 0; i < 5; i++) {
            decs.push({
                type: 'crater',
                cx: Math.floor(random() * 840) + 90,
                cy: Math.floor(random() * 820) + 90,
                rx: Math.floor(random() * 18) + 10,
                ry: Math.floor(random() * 12) + 6,
                angle: Math.floor(random() * 360)
            });
        }
        // Anti-tank metal hedgehogs (les barrières en croix métalliques)
        for (let i = 0; i < 6; i++) {
            decs.push({
                type: 'hedgehog',
                x: Math.floor(random() * 800) + 110,
                y: Math.floor(random() * 800) + 110,
                scale: 0.6 + random() * 0.4
            });
        }
        return decs;
    }, [level]);

    return (
        <g>
            {/* Battlefield mud/charcoal soil */}
            <rect x="0" y="-120" width="1024" height="1240" fill={theme.floor} />

            {/* Tactical grid markings for warfare screen feel */}
            <g opacity={isNight ? "0.12" : "0.06"}>
                {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`lh-${i}`} x1="0" y1={-100 + i * 110} x2="1024" y2={-100 + i * 110} stroke="#94a3b8" strokeWidth="1" />
                ))}
                {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`lv-${i}`} x1={i * 102.4} y1="-100" x2={i * 102.4} y2="1100" stroke="#94a3b8" strokeWidth="1" />
                ))}
            </g>

            {/* Scorched shell craters from heavy bombardment */}
            {battleDecorations.filter(d => d.type === 'crater').map((crater: any, idx) => (
                <g key={`crater-${idx}`} transform={`translate(${crater.cx}, ${crater.cy}) rotate(${crater.angle})`}>
                    {/* Ring burn mark */}
                    <ellipse cx="0" cy="0" rx={crater.rx + 6} ry={crater.ry + 5} fill="none" stroke="#18130e" strokeWidth="3" opacity="0.3" />
                    {/* Center deep indentation */}
                    <ellipse cx="0" cy="0" rx={crater.rx} ry={crater.ry} fill="#14110f" opacity="0.75" />
                    <ellipse cx="0" cy="0" rx={crater.rx * 0.4} ry={crater.ry * 0.4} fill="#090807" />
                </g>
            ))}

            {/* Military tactical tents / crates with camo nets */}
            {battleDecorations.filter(d => d.type === 'tent').map((tent: any, idx) => (
                <g key={`tent-${idx}`} transform={`translate(${tent.x}, ${tent.y}) rotate(${tent.rot})`}>
                    {/* Camouflage shadow */}
                    <rect x={-tent.size - 4} y={-tent.size / 2 - 2} width={tent.size * 2 + 8} height={tent.size + 4} rx="2" fill="rgba(0,0,0,0.22)" />
                    {/* Main tactical container or shelter */}
                    <rect x={-tent.size} y={-tent.size / 2} width={tent.size * 2} height={tent.size} rx="1.5" fill="#3f4e3c" stroke="#252d23" strokeWidth="2" />
                    {/* Camo netting lines */}
                    <path d={`M ${-tent.size} ${-tent.size/2} L ${tent.size} ${tent.size/2} M ${-tent.size} ${tent.size/2} L ${tent.size} ${-tent.size/2}`} stroke="#5c7157" strokeWidth="1.5" strokeDasharray="3 3" />
                    {/* Ammo stencil */}
                    <line x1={-tent.size * 0.4} y1="0" x2={tent.size * 0.4} y2="0" stroke="#fbbf24" strokeWidth="1.2" />
                </g>
            ))}

            {/* Fortified military concrete bunkers / headquarters coordinates */}
            {battleDecorations.filter(d => d.type === 'bunker').map((bunker: any, idx) => (
                <g key={`bunker-${idx}`} transform={`translate(${bunker.x}, ${bunker.y}) rotate(${bunker.rot})`}>
                    {/* Drop shadow */}
                    <rect x={-bunker.w/2 - 3} y={-bunker.h/2 - 2} width={bunker.w + 6} height={bunker.h + 5} rx="4" fill="rgba(0,0,0,0.3)" />
                    {/* Concrete plate block */}
                    <rect x={-bunker.w/2} y={-bunker.h/2} width={bunker.w} height={bunker.h} rx="3" fill="#4d535e" stroke="#282a30" strokeWidth="2.5" />
                    {/* Bullet slits and metal hatch */}
                    <rect x={-bunker.w * 0.35} y={-bunker.h * 0.15} width={bunker.w * 0.7} height={bunker.h * 0.3} rx="1" fill="#18191c" />
                    {/* Warning yellow and black hazard lines */}
                    <path d={`M ${-bunker.w/2 + 4} ${bunker.h/2 - 3} L ${-bunker.w/2 + 12} ${bunker.h/2 - 3}`} stroke="#facc15" strokeWidth="2" />
                    <path d={`M ${bunker.w/2 - 12} ${bunker.h/2 - 3} L ${bunker.w/2 - 4} ${bunker.h/2 - 3}`} stroke="#facc15" strokeWidth="2" />
                </g>
            ))}

            {/* Czech Hedgehog anti-tank barrières */}
            {battleDecorations.filter(d => d.type === 'hedgehog').map((hedg: any, idx) => (
                <g key={`hedgehog-${idx}`} transform={`translate(${hedg.x}, ${hedg.y}) scale(${hedg.scale})`}>
                    {/* Soft under-shadow */}
                    <ellipse cx="0" cy="4" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
                    {/* Cross steel profiles */}
                    <line x1="-12" y1="-8" x2="12" y2="8" stroke="#1f242e" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="12" y1="-8" x2="-12" y2="8" stroke="#1f242e" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#2e3545" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Small center weld rivet */}
                    <circle cx="0" cy="0" r="2.5" fill="#3f485c" />
                </g>
            ))}

            {/* Sandbag barricade protection lines */}
            {battleDecorations.filter(d => d.type === 'sandbag').map((sandbg: any, idx) => (
                <g key={`sandbag-${idx}`} transform={`translate(${sandbg.x}, ${sandbg.y}) rotate(${sandbg.rot})`}>
                    <path
                        d={`M ${-sandbg.len/2} 0 Q 0 -5 ${sandbg.len/2} 0`}
                        stroke="#8c7853"
                        strokeWidth="7"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.95"
                    />
                    <path
                        d={`M ${-sandbg.len/2} 0 Q 0 -5 ${sandbg.len/2} 0`}
                        stroke="#605135"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="4 4"
                        fill="none"
                        opacity="0.4"
                    />
                </g>
            ))}

            {/* Broad combat warway supply track underlay (asphalt/dust concrete route) */}
            <path
                d={pathD}
                stroke={isNight ? '#0b0c0f' : '#1e1c18'}
                strokeWidth="116"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* The main reinforced war road structure */}
            <path
                d={pathD}
                stroke="#453d34"
                strokeWidth="102"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Tactical grid asphalt center plate track */}
            <path
                d={pathD}
                stroke="#252424"
                strokeWidth="88"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Military caution stripe hazard margins on tracks */}
            <path
                d={pathD}
                stroke="#eab308"
                strokeWidth="84"
                fill="none"
                strokeDasharray="14 45"
                strokeLinecap="butt"
                strokeLinejoin="round"
                opacity="0.55"
            />
            {/* Tank tires tread marks carved in the concrete road */}
            <path
                d={pathD}
                stroke="#121212"
                strokeWidth="72"
                fill="none"
                strokeDasharray="4 8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.65"
            />
        </g>
    );
});

const EnemyEntity = React.memo(({ enemy }: { enemy: Enemy }) => {
    const rotation = enemy.rotation || 0;
    const progress = enemy.progress;

    return (
        <g 
            transform={`translate(${enemy.x}, ${enemy.y}) rotate(${rotation})`}
            opacity={progress < 100 ? progress / 100 : 1}
        >
            {/* Soft metallic real shadow layout */}
            <ellipse cx="0" cy="14" rx={enemy.isBoss ? "34" : "15"} ry={enemy.isBoss ? "12" : "6"} fill="rgba(10, 10, 10, 0.45)" />
            
            {/* Highly Realistic 100% Military Warfare Units */}
            {enemy.isBoss || enemy.type === 'mech' ? (
                // 1. HUGE BIPEDAL WALKER MECH OR MAMMOTH SIEGE FORTRESS
                <g transform="scale(1.3)">
                    {/* Shadow footprint plates */}
                    <rect x="-24" y="-20" width="48" height="40" fill="none" />
                    {/* Bipedal heavy armored leg hinges */}
                    <line x1="-16" y1="0" x2="-22" y2="12" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="16" y1="0" x2="22" y2="12" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="-22" cy="12" r="5" fill="#374151" stroke="#111827" strokeWidth="2" />
                    <circle cx="22" cy="12" r="5" fill="#374151" stroke="#111827" strokeWidth="2" />
                    
                    {/* Huge reinforced steel hull chassis */}
                    <path d="M-20,-16 L20,-16 L24,2 L18,12 L-18,12 L-24,2 Z" fill="#4b5563" stroke="#111827" strokeWidth="2.5" />
                    {/* Dark camouflage patterns */}
                    <path d="M-14,-13 L-1, -12 L-6, 4 L-15, 6 Z" fill="#2d3748" opacity="0.4" />
                    <path d="M4,-4 L15, -6 L18, 10 L8, 9 Z" fill="#1a202c" opacity="0.4" />
                    
                    {/* Glowing yellow hazard paint and rivets */}
                    <rect x="-18" y="-12" width="4" height="6" fill="#f59e0b" />
                    <rect x="14" y="-12" width="4" height="6" fill="#f59e0b" />
                    
                    {/* Shoulder rocket battery module left */}
                    <rect x="-25" y="-10" width="8" height="15" rx="1.5" fill="#374151" stroke="#111827" strokeWidth="1.5" />
                    <circle cx="-21" cy="-6" r="1.5" fill="#ef4444" />
                    <circle cx="-21" cy="-1" r="1.5" fill="#ef4444" />
                    {/* Shoulder gatling cannon module right */}
                    <rect x="17" y="-10" width="8" height="15" rx="1.5" fill="#374151" stroke="#111827" strokeWidth="1.5" />
                    <line x1="21" y1="-8" x2="21" y2="12" stroke="#111827" strokeWidth="2.5" />

                    {/* Central glowing electronic eye */}
                    <circle cx="0" cy="-2" r="4" fill="#1e293b" stroke="#111827" strokeWidth="1.5" />
                    <circle cx="0" cy="-2" r="2" fill="#ef4444" className="animate-pulse" />
                    
                    {/* Massive double battle barrels sticking forward */}
                    <line x1="-5" y1="-14" x2="-5" y2="-32" stroke="#111827" strokeWidth="3.5" />
                    <line x1="5" y1="-14" x2="5" y2="-32" stroke="#111827" strokeWidth="3.5" />
                    {/* Muzzle brakes */}
                    <rect x="-7" y="-34" width="4" height="3" fill="#111827" />
                    <rect x="3" y="-34" width="4" height="3" fill="#111827" />
                </g>
            ) : enemy.type === 'tank' || enemy.type === 'heavy_tank' ? (
                // 2. MAIN REALISTIC BATTLE TANK
                <g transform="scale(1.22)">
                    {/* Left and right caterpillar track systems */}
                    <rect x="-16" y="-18" width="7" height="36" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="2" />
                    <rect x="9" y="-18" width="7" height="36" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="2" />
                    {/* Track rib markings */}
                    {Array.from({ length: 9 }).map((_, i) => (
                        <g key={`tr-${i}`}>
                            <line x1="-15" y1={-15 + i * 4} x2="-10" y2={-15 + i * 4} stroke="#111827" strokeWidth="1.2" />
                            <line x1="10" y1={-15 + i * 4} x2="15" y2={-15 + i * 4} stroke="#111827" strokeWidth="1.2" />
                        </g>
                    ))}
                    {/* Massive armored hull */}
                    <rect x="-11" y="-17" width="22" height="32" rx="3.5" fill="#374151" stroke="#111827" strokeWidth="2.2" />
                    {/* Camouflage layout */}
                    <path d="M-8,-12 L2, -6 L-10, 10 Z" fill="#20293a" opacity="0.45" />
                    <path d="M5,-12 L11, -8 L3, 6 L6, 12 Z" fill="#111827" opacity="0.4" />
                    
                    {/* Armor plate bolts */}
                    <circle cx="-8" cy="-14" r="0.8" fill="#9ca3af" />
                    <circle cx="8" cy="-14" r="0.8" fill="#9ca3af" />
                    <circle cx="-8" cy="12" r="0.8" fill="#9ca3af" />
                    <circle cx="8" cy="12" r="0.8" fill="#9ca3af" />

                    {/* Highly-detailed rotating main turret center hatch */}
                    <circle cx="0" cy="-2" r="7.5" fill="#1f2937" stroke="#111827" strokeWidth="2" />
                    <rect x="-4.5" y="-5" width="9" height="5.5" rx="1.5" fill="#374151" stroke="#111827" strokeWidth="1.5" />
                    
                    {/* Super thick tank artillery barrel barrel */}
                    <line x1="0" y1="-4" x2="0" y2="-28" stroke="#111827" strokeWidth="3.2" strokeLinecap="butt" />
                    {/* Muzzle tip blast suppressor */}
                    <rect x="-2.2" y="-31" width="4.4" height="4.2" fill="#111827" rx="1" />
                    {/* Active target searchlight */}
                    <polygon points="-4,-12 -12,-30 4,-30" fill="rgba(252,211,77,0.08)" pointerEvents="none" />
                </g>
            ) : enemy.type === 'stealth_heli' || enemy.type === 'jet' || enemy.type === 'bomber' || enemy.isFlying ? (
                // 3. STEALTH MILITARY STRIKE COMBAT FLYING UNIT (JET / COPTER / DRONE)
                <g transform="scale(1.2)">
                    {/* Big swept stealth charcoal wings */}
                    <polygon points="0,-22 -32,2 -4,12 0,16" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                    <polygon points="0,-22 32,2 4,12 0,16" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                    {/* Jet thrust vectoring body */}
                    <path d="M-6,-22 L6,-22 L8,14 L4,22 L-4,22 L-8,14 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
                    
                    {/* Under-wing rocket pods */}
                    <rect x="-22" y="-5" width="4.5" height="11" fill="#475569" stroke="#0f172a" strokeWidth="1" />
                    <rect x="17.5" y="-5" width="4.5" height="11" fill="#475569" stroke="#0f172a" strokeWidth="1" />
                    {/* Red threat markers on rockets */}
                    <circle cx="-19.75" cy="8" r="1.2" fill="#ef4444" />
                    <circle cx="19.75" cy="8" r="1.2" fill="#ef4444" />

                    {/* Cockpit safety glass (Neon cyan visor) */}
                    <polygon points="0,-16 -3,-5 3,-5" fill="#06b6d4" opacity="0.8" />
                    {/* Twin jet afterburners */}
                    <circle cx="-3" cy="23" r="3" fill="#ea580c" className="animate-pulse" />
                    <circle cx="3" cy="23" r="3" fill="#ea580c" className="animate-pulse" />
                    <circle cx="-3" cy="23" r="1.5" fill="#facc15" />
                    <circle cx="3" cy="23" r="1.5" fill="#facc15" />

                    {/* Helicopter spinning blade silhouettes overlay if helicopter */}
                    {(enemy.type === 'stealth_heli' || enemy.isFlying) && (
                        <g className="animate-spin" style={{ transformOrigin: '0px -5px', animationDuration: '0.15s' }}>
                            <line x1="-38" y1="-5" x2="38" y2="-5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                            <line x1="0" y1="-43" x2="0" y2="33" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </g>
                    )}
                </g>
            ) : enemy.type === 'apc' || enemy.type === 'medic_truck' || enemy.isArmored ? (
                // 4. MULTI-WHEELED (8X8) HEAVY ARMORED PERSONNEL CARRIER / MEDIC TRUCK
                <g transform="scale(1.15)">
                    {/* 8 tactical heavy wheels */}
                    {[-14, -5, 4, 13].map((v) => (
                        <g key={`wh-${v}`}>
                            <rect x="-12.5" y={v - 2.5} width="4" height="5" rx="1.2" fill="#111827" />
                            <rect x="8.5" y={v - 2.5} width="4" height="5" rx="1.2" fill="#111827" />
                        </g>
                    ))}
                    {/* Armored angular chassis */}
                    <polygon points="-9,-18 9,-18 10,18 -10,18" fill={enemy.type === 'medic_truck' ? "#d1d5db" : "#2e3b2e"} stroke="#111827" strokeWidth="2.2" />
                    
                    {/* Camouflage patterning */}
                    {enemy.type !== 'medic_truck' && (
                        <path d="M-6,-12 L4, -10 L1, 4 L-8, 6 Z" fill="#111827" opacity="0.35" />
                    )}

                    {/* White steel panels with cross if Medic, steel hatch with machine gun if APC */}
                    {enemy.type === 'medic_truck' ? (
                        <g>
                            {/* Medical red / orange cruz shield */}
                            <rect x="-4" y="-3" width="8" height="8" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                            <path d="M-2,1 L2,1 M0,-1 L0,3" stroke="#ef4444" strokeWidth="2" strokeLinecap="square" />
                            {/* Blue beacon sirens */}
                            <circle cx="-5" cy="-14" r="2.5" fill="#3b82f6" className="animate-ping" />
                            <circle cx="-5" cy="-14" r="1.8" fill="#2563eb" />
                            <circle cx="5" cy="-14" r="1.8" fill="#ef4444" />
                        </g>
                    ) : (
                        <g>
                            {/* Small offensive gun mount */}
                            <circle cx="0" cy="2" r="5" fill="#1e293b" stroke="#111827" strokeWidth="1.5" />
                            <line x1="0" y1="2" x2="0" y2="-12" stroke="#111827" strokeWidth="2.4" />
                            {/* Anti-RPG fence armor slats on the tail */}
                            <rect x="-7.5" y="14" width="15" height="5" fill="none" stroke="#111827" strokeWidth="1.2" strokeDasharray="2 2" />
                        </g>
                    )}

                    {/* Windshield protection hatches */}
                    <rect x="-6" y="-15" width="4" height="2" fill="#1e293b" />
                    <rect x="2" y="-15" width="4" height="2" fill="#1e293b" />
                </g>
            ) : enemy.type === 'jeep' || enemy.type === 'buggy' ? (
                // 5. CAMOUFLAGE LIGHT COMBAT SCOUT JEEP / RECON BUGGY
                <g transform="scale(1.12)">
                    {/* Dirt knobby tires */}
                    <rect x="-11" y="-14" width="4" height="7" rx="1.5" fill="#0f172a" />
                    <rect x="7" y="-14" width="4" height="7" rx="1.5" fill="#0f172a" />
                    <rect x="-11" y="7" width="4" height="7" rx="1.5" fill="#0f172a" />
                    <rect x="7" y="7" width="4" height="7" rx="1.5" fill="#0f172a" />
                    
                    {/* Jeep sand camo body */}
                    <rect x="-8.5" y="-11" width="17" height="22" rx="3" fill="#78716c" stroke="#1c1917" strokeWidth="1.8" />
                    <path d="M-6,-8 L2, -6 L-4, 5 Z" fill="#44403c" opacity="0.45" />

                    {/* Roll bars cage tubing */}
                    <line x1="-6.5" y1="-8" x2="-6.5" y2="6" stroke="#1c1917" strokeWidth="1.8" />
                    <line x1="6.5" y1="-8" x2="6.5" y2="6" stroke="#1c1917" strokeWidth="1.8" />
                    <line x1="-6.5" y1="-2" x2="6.5" y2="-2" stroke="#1c1917" strokeWidth="1.5" />
                    
                    {/* Machine gunner barrel on back */}
                    <circle cx="0" cy="3" r="3" fill="#1c1917" />
                    <line x1="0" y1="3" x2="0" y2="-15" stroke="#1c1917" strokeWidth="2" />
                    <rect x="-1" y="-17" width="2" height="3" fill="#facc15" /> {/* Muzzle spark */}
                </g>
            ) : (
                // 6. TACTICAL INFANTRY SQUAD (3 SOLDIERS WALKING EN FORMATION)
                <g>
                    {/* Soldier 1 (Center Front) */}
                    <g transform="translate(0, -6)">
                        <circle cx="0" cy="0" r="4.2" fill="#455a64" stroke="#1a237e" strokeWidth="1" />
                        <rect x="-3" y="1" width="6" height="6" rx="1.5" fill="#37474f" />
                        {/* Camo helmet cover and gun barrel */}
                        <path d="M-2,-3 L2,-3 L1,-4 C0.5,-5.5 -0.5,-5.5 -1,-4 Z" fill="#1b5e20" />
                        <line x1="2" y1="3" x2="7" y2="3" stroke="#212121" strokeWidth="1.5" />
                    </g>
                    {/* Soldier 2 (Back Left) */}
                    <g transform="translate(-10, 4) scale(0.9)">
                        <circle cx="0" cy="0" r="4.2" fill="#455a64" stroke="#1a237e" strokeWidth="1" />
                        <rect x="-3" y="1" width="6" height="6" rx="1.5" fill="#37474f" />
                        <path d="M-2,-3 L2,-3 L1,-4 C0.5,-5.5 -0.5,-5.5 -1,-4 Z" fill="#1b5e20" />
                    </g>
                    {/* Soldier 3 (Back Right) */}
                    <g transform="translate(10, 4) scale(0.9)">
                        <circle cx="0" cy="0" r="4.2" fill="#455a64" stroke="#1a237e" strokeWidth="1" />
                        <rect x="-3" y="1" width="6" height="6" rx="1.5" fill="#37474f" />
                        <path d="M-2,-3 L2,-3 L1,-4 C0.5,-5.5 -0.5,-5.5 -1,-4 Z" fill="#1b5e20" />
                    </g>
                </g>
            )}

            {/* Glowing Tactical Health HUD with sleek war-game aesthetics */}
            <g transform={`rotate(${-rotation}) translate(-16, -24)`}>
                <rect width="32" height="3.5" fill="#1f2937" rx="1.5" stroke="#4b5563" strokeWidth="0.8" />
                <rect width={32 * (enemy.hp / enemy.maxHp)} height="3.5" fill={enemy.hp/enemy.maxHp < 0.35 ? "#ef4444" : "#22c55e"} rx="1" />
            </g>
        </g>
    );
});

const TurretEntity = React.memo(({ slot, tower }: { slot: {x: number, y: number}, tower: PlacedTurret }) => {
    // Beautiful, highly color-coherent metal military color themes 
    let baseSteel = "#4b5563"; // Medium grey steel
    let primaryTint = "#16a34a"; // Army Green tactical (mitrailleuse)
    let secondaryTint = "#15803d"; // Secondary darker green
    
    if (tower.type === 'mitrailleuse') {
        primaryTint = "#16a34a"; // Green matching selection UI
        secondaryTint = "#15803d";
    } else if (tower.type === 'canon') {
        primaryTint = "#c2410c"; // Rust Orange matching selection UI
        secondaryTint = "#9a3412";
    } else if (tower.type === 'dca') {
        primaryTint = "#0e7490"; // Deep Cyan matching selection UI
        secondaryTint = "#0891b2";
    } else if (tower.type === 'plasma') {
        primaryTint = "#9333ea"; // Magnetic Dark Purple matching selection UI
        secondaryTint = "#6b21a8";
    } else if (tower.type === 'mortier') {
        primaryTint = "#dc2626"; // Crimson Red matching selection UI
        secondaryTint = "#991b1b";
    } else if (tower.type === 'missile') {
        primaryTint = "#db2677"; // Hot Precision Pink matching selection UI
        secondaryTint = "#9d174d";
    }

    return (
        <g transform={`translate(${slot.x}, ${slot.y})`}>
            {/* Reinforced concrete bunker installation underlay */}
            <circle r="40" fill="rgba(24, 24, 27, 0.45)" stroke="#111827" strokeWidth="1" />
            
            {/* Dark steel circular foundation with hazard stripes */}
            <circle r="34" fill="#2d3748" stroke="#0f172a" strokeWidth="3" />
            <circle r="29" fill="none" stroke={`${primaryTint}aa`} strokeWidth="1.8" strokeDasharray="4 8" opacity="0.9" />
            <circle r="26" fill="#1e293b" />

            {/* Status light LED indicating energy level / online */}
            <circle cx="-16" cy="-16" r="3.2" fill={primaryTint} className="animate-pulse" />
            <circle cx="-16" cy="-16" r="1.3" fill="#fff" />

            {/* Static protective sandbags circling the front and sides of the turret slot */}
            <path d="M -23 20 Q 0 35 23 20" fill="none" stroke="#78350f" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
            <path d="M -23 20 Q 0 35 23 20" fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 3" opacity="0.95" />

            {/* Rotated Gun-Specific Weapon Station Tracking Group */}
            <g transform={`rotate(${(tower.rotation ?? -90) + 90})`}>
                {tower.type === 'mitrailleuse' ? (
                    // Dual Heavy .50cal Gatling platform
                    <g>
                        {/* Armor plate box */}
                        <rect x="-10" y="-12" width="20" height="20" rx="2" fill={primaryTint} stroke="#111827" strokeWidth="2" />
                        <line x1="-5" y1="-12" x2="-5" y2="-28" stroke="#111827" strokeWidth="2.8" />
                        <line x1="5" y1="-12" x2="5" y2="-28" stroke="#111827" strokeWidth="2.8" />
                        {/* Ammo chain feeds */}
                        <path d="M -16 6 C -14 0 -8 -5 -5 -1" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="2 1" />
                        <circle cx="0" cy="4" r="3.5" fill={secondaryTint} />
                    </g>
                ) : tower.type === 'canon' ? (
                    // Heavy Steel Recoil Tank-Buster Artillery
                    <g>
                        {/* Hexagonal heavy rotating shield */}
                        <polygon points="-12,11 12,11 14,-7 0,-13 -14,-7" fill={primaryTint} stroke="#0f172a" strokeWidth="2" />
                        {/* Hydraulic piston recoil bars */}
                        <line x1="-4" y1="-12" x2="-4" y2="-32" stroke={secondaryTint} strokeWidth="4.5" />
                        <line x1="0" y1="-4" x2="0" y2="-34" stroke="#0f172a" strokeWidth="4" />
                        {/* Big artillery muzzle brake */}
                        <rect x="-3" y="-36" width="6" height="4.5" rx="1.2" fill="#0f172a" />
                    </g>
                ) : tower.type === 'dca' ? (
                    // High-Angle Twin FLAK cannons plus radar scanner dish
                    <g>
                        <rect x="-11" y="-10" width="22" height="18" rx="3" fill={primaryTint} stroke="#0f172a" strokeWidth="2" />
                        {/* Twin extra long cannons */}
                        <line x1="-5" y1="-8" x2="-5" y2="-33" stroke="#0f172a" strokeWidth="2.6" />
                        <line x1="5" y1="-8" x2="5" y2="-33" stroke="#0f172a" strokeWidth="2.6" />
                        <rect x="-6.5" y="-35" width="3" height="4" fill="#000" />
                        <rect x="3.5" y="-35" width="3" height="4" fill="#000" />
                        {/* Anti-aircraft tracking radar dome on right side */}
                        <path d="M 6 -4 A 5 5 0 0 1 14 4" fill="none" stroke={secondaryTint} strokeWidth="2.2" className="animate-[pulse_1.5s_infinite]" />
                    </g>
                ) : tower.type === 'plasma' ? (
                    // Electromagnetic Railgun coils
                    <g>
                        <circle cx="0" cy="0" r="11" fill={primaryTint} stroke="#1e1b4b" strokeWidth="2" />
                        {/* Plasma discharge capacitor rings */}
                        <circle cx="0" cy="0" r="6" fill="#d8b4fe" className="animate-pulse" />
                        <line x1="0" y1="0" x2="0" y2="-28" stroke="#1e1b4b" strokeWidth="4" />
                        {/* Violet conductive wires wrapping the railgun barrel */}
                        {[-10, -16, -22].map((yHeight) => (
                            <circle key={`cl-${yHeight}`} cx="0" cy={yHeight} r="3.2" fill="none" stroke="#c084fc" strokeWidth="1.6" />
                        ))}
                        <ellipse cx="0" cy="-30" rx="3" ry="1.5" fill="#d8b4fe" />
                    </g>
                ) : tower.type === 'mortier' ? (
                    // Extra Fat Trench Mortar angle Tube
                    <g>
                        <circle cx="0" cy="0" r="12" fill={primaryTint} stroke={secondaryTint} strokeWidth="2.2" />
                        {/* Giant mortar barrel mouth facing upwards/angled */}
                        <circle cx="0" cy="-3" r="5.5" fill="#111827" stroke={secondaryTint} strokeWidth="3" />
                        <line x1="0" y1="2" x2="0" y2="-18" stroke="#374151" strokeWidth="7" strokeLinecap="round" />
                        <circle cx="0" cy="-18" r="4.2" fill="#ef4444" />
                    </g>
                ) : (
                    // Tactical Surface-to-Air quad Missiles
                    <g transform="scale(0.95)">
                        <rect x="-12" y="-10" width="24" height="20" rx="2" fill={primaryTint} stroke={secondaryTint} strokeWidth="2.2" />
                        {/* 3 highly detailed rocket nosecones ready to fly */}
                        {[-7, 0, 7].map((offset) => (
                            <g key={`ms-${offset}`} transform={`translate(${offset}, 0)`}>
                                <rect x="-2" y="-22" width="4" height="22" fill="#fbcfe8" rx="1" />
                                {/* Detailed magenta/pink tip of rocket warheads */}
                                <path d="M-2,-22 L2,-22 L0,-29 Z" fill={primaryTint} />
                                {/* Fin stabilisers */}
                                <line x1="-3.5" y1="-4" x2="3.5" y2="-4" stroke={secondaryTint} strokeWidth="1.5" />
                            </g>
                        ))}
                    </g>
                )}

                {/* Tactical Pointer Laser sight line projecting from muzzle when target active */}
                {tower.targetId && (
                    <g>
                        <line x1="0" y1="-32" x2="0" y2="-100" stroke={primaryTint} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.65" />
                        <circle cx="0" cy="-100" r="2.5" fill={primaryTint} opacity="0.85" className="animate-ping" />
                    </g>
                )}
            </g>

            {/* Tactical Level-Badge speech balloon panel */}
            <g transform="translate(0, -48)" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))' }}>
                <rect x="-19" y="-8" width="38" height="15" rx="4" fill="#111827" stroke="#374151" strokeWidth="1" />
                <polygon points="-3,7 0,10 3,7" fill="#111827" stroke="#374151" strokeWidth="1" />
                <polygon points="-2.5,6 2.5,6 0,8.5" fill="#111827" />
                <text y="3" textAnchor="middle" fill="#22c55e" fontSize="7.8" fontWeight="bold" style={{ fontFamily: 'monospace' }}>
                    LVL {tower.level}
                </text>
            </g>

            {/* Armor / HP structural bars */}
            {tower.hp < tower.maxHp && (
                <g transform="translate(0, 24)">
                    <rect x="-18" y="0" width="36" height="3" rx="1" fill="rgba(0,0,0,0.4)" />
                    <rect x="-18" y="0" width={36 * (tower.hp / tower.maxHp)} height="3" rx="1" fill="#ef4444" />
                </g>
            )}
        </g>
    );
});

interface GameBoardProps {
    gameState: GameState;
    buildTurret: (slotId: string, x: number, y: number, type: TowerType) => void;
    selectedTower: TowerType | null;
    setSelectedTower: (type: TowerType | null) => void;
    selectedTurretId: string | null;
    setSelectedTurretId: (id: string | null) => void;
    isAirstrikeMode: boolean;
    setIsAirstrikeMode: (val: boolean) => void;
    onCallAirstrike: (x: number, y: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
    gameState, 
    buildTurret,
    selectedTower,
    setSelectedTower,
    selectedTurretId,
    setSelectedTurretId,
    isAirstrikeMode,
    setIsAirstrikeMode,
    onCallAirstrike
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const isNight = useMemo(() => {
        return gameState.activeModifier?.type === 'fog' || (gameState.level % 2 === 1);
    }, [gameState.activeModifier, gameState.level]);

    // Grim battle map themes 
    const theme = useMemo(() => {
        if (isNight) {
            return {
                floor: '#111317', // Midnight tactical charcoal
                road: '#1a1f26',
                accent: '#ef4444'
            };
        }
        return {
            floor: '#2c2923', // Muddy, sand gravel battlefield
            road: '#1c1a17',
            accent: '#f59e0b'
        };
    }, [isNight]);

    const TURRET_SLOTS = useMemo(() => getTurretSlotsForLevel(gameState.level), [gameState.level]);

    const handleBoardClick = useCallback((e: React.MouseEvent) => {
        if (!svgRef.current) return;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        
        if (isAirstrikeMode) {
            onCallAirstrike(cursorPoint.x, cursorPoint.y);
            setIsAirstrikeMode(false);
        } else {
            // Check if player clicked near an existing slot
            const slot = TURRET_SLOTS.find(s => {
                const dist = Math.hypot(s.x - cursorPoint.x, s.y - cursorPoint.y);
                return dist < 45;
            });

            if (slot) {
                const existingTower = gameState.turrets[slot.id];
                if (existingTower) {
                    setSelectedTurretId(slot.id);
                    setSelectedTower(null);
                } else {
                    if (selectedTower) {
                        buildTurret(slot.id, slot.x, slot.y, selectedTower);
                        setSelectedTower(null);
                    } else {
                        setSelectedTurretId(null);
                    }
                }
            } else {
                setSelectedTurretId(null);
            }
        }
    }, [
        isAirstrikeMode, 
        onCallAirstrike, 
        setIsAirstrikeMode, 
        TURRET_SLOTS, 
        gameState.turrets, 
        selectedTower, 
        buildTurret, 
        setSelectedTower, 
        setSelectedTurretId
    ]);

    return (
        <div className="relative w-full h-full overflow-hidden border border-neutral-800 shadow-2xl font-mono transition-colors duration-1000">
            {/* Vector battlefield Map svg */}
            <svg
                ref={svgRef}
                viewBox="0 -100 1024 1100"
                className="w-full h-full object-contain cursor-crosshair touch-none select-none"
                onClick={handleBoardClick}
                onTouchStart={(e) => {
                    if (e.touches.length > 1) e.preventDefault();
                }}
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <radialGradient id="neonGlow">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="wazeBoom">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.95" />
                        <stop offset="40%" stopColor="#ef4444" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Vector Map Tiles & Roads */}
                <StaticBackground level={gameState.level} theme={theme} isNight={isNight} />

                {/* HQ Allie / Base defensive citadel at the end of track */}
                <g transform="translate(512, 955)">
                    {/* Shadow outline */}
                    <ellipse cx="0" cy="18" rx="42" ry="12" fill="rgba(0,0,0,0.5)" />
                    {/* Fortified headquarters complex concrete blast shields */}
                    <path d="M -35 15 L -45 -18 L -20 -33 L 20 -33 L 45 -18 L 35 15 Z" fill="#3f444e" stroke="#111827" strokeWidth="3" />
                    <rect x="-18" y="-12" width="36" height="26" fill="#1e293b" stroke="#111827" strokeWidth="2" />
                    {/* Command hatch door */}
                    <rect x="-8" y="0" width="16" height="14" fill="#020617" />
                    
                    {/* Hazard warning lines */}
                    <path d="M-18,-20 L18,-20" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="3 3" />
                    
                    {/* Pulsing red beacon lights */}
                    <circle cx="-35" cy="-18" r="4.5" fill="#f43f5e" className="animate-ping" />
                    <circle cx="-35" cy="-18" r="3" fill="#ef4444" />
                    <circle cx="35" cy="-18" r="3" fill="#ef4444" />

                    <g transform="translate(0, -42)">
                        <rect x="-42" y="-8" width="84" height="15" rx="3" fill="#1e293b" stroke="#374151" strokeWidth="1.2" />
                        <text y="3" textAnchor="middle" fill="#22c55e" fontSize="7.8" fontWeight="bold">HQ ALLIÉ</text>
                    </g>
                </g>

                {/* Visual range indicator ring for placed/selected or placing preview slots */}
                {TURRET_SLOTS.map(slot => {
                    const tower = gameState.turrets[slot.id];
                    const isSelected = selectedTurretId === slot.id;
                    const isPlacing = selectedTower && !tower; // hovered slot while holding a selected tower
                    
                    let range = 0;
                    let color = "#eab308";
                    
                    if (isSelected && tower) {
                        range = tower.range;
                        if (tower.type === 'mitrailleuse') color = "#16a34a";
                        else if (tower.type === 'canon') color = "#ea580c";
                        else if (tower.type === 'dca') color = "#00cbff";
                        else if (tower.type === 'plasma') color = "#a855f7";
                        else if (tower.type === 'mortier') color = "#ef4444";
                        else if (tower.type === 'missile') color = "#ec4899";
                    } else if (isPlacing && selectedTower) {
                         const config = TOWER_CONFIGS[selectedTower];
                         range = config.range;
                         if (selectedTower === 'mitrailleuse') color = "#16a34a";
                         else if (selectedTower === 'canon') color = "#ea580c";
                         else if (selectedTower === 'dca') color = "#00cbff";
                         else if (selectedTower === 'plasma') color = "#a855f7";
                         else if (selectedTower === 'mortier') color = "#ef4444";
                         else if (selectedTower === 'missile') color = "#ec4899";
                    }
                    
                    if (range <= 0) return null;
                    
                    return (
                        <g key={`range-ring-${slot.id}`} transform={`translate(${slot.x}, ${slot.y})`} style={{ pointerEvents: 'none' }}>
                            {/* Animated tactical sonar range ring */}
                            <circle 
                                r={range} 
                                fill={`${color}06`} 
                                stroke={color} 
                                strokeWidth="2" 
                                strokeDasharray="6 8" 
                                className="animate-[pulse_2.2s_infinite]" 
                                opacity="0.4" 
                            />
                            <circle 
                                r={range} 
                                fill="none" 
                                stroke={`${color}33`} 
                                strokeWidth="0.8" 
                                opacity="0.25" 
                            />
                        </g>
                    );
                })}

                {/* Slots and Turrets placement */}
                {TURRET_SLOTS.map(slot => {
                    const tower = gameState.turrets[slot.id];
                    return tower ? (
                        <TurretEntity key={slot.id} slot={slot} tower={tower} />
                    ) : (
                        <g 
                            key={slot.id} 
                            transform={`translate(${slot.x}, ${slot.y})`} 
                            className="cursor-pointer group"
                        >
                            {/* Inner targeting radar circle */}
                            <circle r="36" fill="rgba(239, 68, 68, 0.03)" stroke="rgba(239, 68, 68, 0.09)" strokeDasharray="2 4" />
                            {/* Heavy base outline */}
                            <circle 
                                r="22" 
                                fill="none" 
                                stroke={isNight ? '#374151' : '#52525b'} 
                                strokeWidth="2" 
                                className="group-hover:stroke-amber-500 group-hover:stroke-[2px] transition-all" 
                            />
                            {/* Inner slot crosshair placement */}
                            <path 
                                d="M -6 0 L 6 0 M 0 -6 L 0 6" 
                                stroke={isNight ? '#9ca3af' : '#27272a'} 
                                strokeWidth="2" 
                                opacity="0.6" 
                                className="group-hover:opacity-100 transition-opacity" 
                            />
                        </g>
                    );
                })}

                {/* Enemies drawing */}
                {gameState.enemies.map(enemy => (
                    <EnemyEntity key={enemy.id} enemy={enemy} />
                ))}

                {/* Dynamic, type-matched, high coherence bullet tracers */}
                {gameState.projectiles.map(p => {
                    let tracerColor = "#f59e0b";
                    let glowColor = "#ef4444";
                    let thickness = "1.8";
                    
                    if (p.towerType === 'mitrailleuse') {
                        tracerColor = "#22c55e";
                        glowColor = "#15803d";
                        thickness = "1.5";
                    } else if (p.towerType === 'canon') {
                        tracerColor = "#ea580c";
                        glowColor = "#c2410c";
                        thickness = "2.4";
                    } else if (p.towerType === 'dca') {
                        tracerColor = "#06b6d4";
                        glowColor = "#0e7490";
                        thickness = "1.8";
                    } else if (p.towerType === 'plasma') {
                        tracerColor = "#c084fc";
                        glowColor = "#9333ea";
                        thickness = "3.2";
                    } else if (p.towerType === 'mortier') {
                        tracerColor = "#ef4444";
                        glowColor = "#b91c1c";
                        thickness = "3.8";
                    } else if (p.towerType === 'missile') {
                        tracerColor = "#ec4899";
                        glowColor = "#be185d";
                        thickness = "2.8";
                    }

                    return (
                        <g key={p.id}>
                            {/* Dynamic tracer tail line */}
                            <line 
                                x1={p.x} 
                                y1={p.y} 
                                x2={p.x - (p.targetX - p.x) * (p.towerType === 'mortier' ? 0.05 : 0.12)} 
                                y2={p.y - (p.targetY - p.y) * (p.towerType === 'mortier' ? 0.05 : 0.12)} 
                                stroke={tracerColor} 
                                strokeWidth={thickness} 
                                opacity="0.85" 
                            />
                            {/* Inner energy bolt core */}
                            <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r={p.towerType === 'mortier' ? "3.8" : p.towerType === 'canon' ? "3.0" : "2.2"} 
                                fill="#fff" 
                                style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }} 
                            />
                        </g>
                    );
                })}

                {/* Perfectly color-coherent Blast Explosions */}
                <AnimatePresence>
                    {gameState.explosions.map(exp => (
                        <motion.g key={exp.id}>
                            <defs>
                                <radialGradient id={`expGrad-${exp.id}`}>
                                    <stop offset="0%" stopColor={exp.color || "#f97316"} stopOpacity="0.95" />
                                    <stop offset="42%" stopColor={exp.color || "#ef4444"} stopOpacity="0.65" />
                                    <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                            <motion.circle
                                initial={{ r: 0, opacity: 1 }}
                                animate={{ r: exp.radius * 1.8, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                cx={exp.x}
                                cy={exp.y}
                                fill={`url(#expGrad-${exp.id})`}
                            />
                            <motion.circle
                                initial={{ r: 0, opacity: 1 }}
                                animate={{ r: exp.radius, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                cx={exp.x}
                                cy={exp.y}
                                fill="#ffffff"
                                opacity="0.7"
                            />
                        </motion.g>
                    ))}
                </AnimatePresence>

                {/* Airstrike Reticle warning */}
                {isAirstrikeMode && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                         <circle cx="512" cy="512" r="1500" fill="rgba(239, 68, 68, 0.09)" pointerEvents="none" />
                    </motion.g>
                )}
            </svg>

            {/* Atmosphere Tactical Command HUD Banner */}
            <div className="absolute top-3 left-3 right-3 z-40 flex justify-between pointer-events-none gap-2">
                {/* Tactical radar scanner readout */}
                <div className="bg-[#111317]/95 text-[#e2e8f0] px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md border border-neutral-700 pointer-events-auto max-w-[280px] transition-transform">
                    <div className="bg-red-950 text-red-500 p-1.5 rounded-lg flex items-center justify-center border border-red-900 shrink-0">
                        {/* High fidelity tactical scope indicator */}
                        <Crosshair className="w-5 h-5 animate-[spin_5s_linear_infinite]" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[8px] opacity-75 font-semibold font-mono tracking-widest uppercase">SYSTÈME DE RADAR v9.12</span>
                        <span className="text-[10px] font-black leading-tight tracking-tight text-red-400">
                            {gameState.enemies.length > 0 
                              ? `${gameState.enemies.length} MENACES HOSTILES EN PLAN ACCÈS !` 
                              : "ZONE SOUS CONTROLE. AUCUN ENGAGEMENT."}
                        </span>
                    </div>
                </div>

                {/* Military HQ Shield indicator */}
                <div className="bg-[#111317] text-white p-2 rounded-xl shadow-2xl flex flex-col items-center justify-center border-2 border-red-700 w-14 h-14 pointer-events-auto shrink-0 select-none">
                    <span className="text-[6px] font-bold tracking-wider leading-none text-neutral-400 uppercase">BASE PV</span>
                    <span className="text-lg font-black text-red-500 leading-tight">
                        {gameState.lives}
                    </span>
                    <span className="text-[6px] font-semibold tracking-widest text-[#22c55e]">ONLINE</span>
                </div>
            </div>

            {/* Bottom battlefield status drawer */}
            <div className="absolute bottom-3 left-3 right-3 z-40 flex justify-between pointer-events-none gap-2 items-end">
                {/* Intel reports box */}
                <div className="bg-[#111317]/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl border border-neutral-800 pointer-events-auto flex items-center gap-2 font-mono">
                    <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center shadow-md text-white font-black text-[9px] relative shrink-0">
                        <AlertTriangle className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[7px] text-zinc-500 font-extrabold uppercase tracking-widest leading-none">Rapport Intel</span>
                        <span className="text-[9px] font-bold text-zinc-300 tracking-tight">
                            {gameState.activeModifier ? `${gameState.activeModifier.name} activé` : "RAS - Grille opérationnelle"}
                        </span>
                    </div>
                </div>

                {/* Sector locator bubble */}
                <div className="bg-[#111317]/95 backdrop-blur-md text-slate-300 px-3 py-2 rounded-xl shadow-2xl border border-neutral-800 pointer-events-auto flex flex-col items-start min-w-[120px] text-left leading-none">
                    <div className="flex items-center gap-1.5 leading-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        <span className="text-[9px] font-black tracking-widest text-red-500 uppercase">COMBAT</span>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-mono mt-1 uppercase">
                        SEC: {gameState.level} • {gameState.mode.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
};
