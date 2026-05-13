
import { motion } from 'motion/react';
import { useState } from 'react';
import { GameState, TowerType, Enemy } from '../types';
import { TOWER_CONFIGS } from '../constants';

export const GameBoard = ({ 
  gameState, 
  buildTurret, 
  selectedTower, 
  setSelectedTower,
  selectedTurretId,
  setSelectedTurretId
}: { 
  gameState: GameState, 
  buildTurret: (id: string, x: number, y: number, type: TowerType) => void,
  selectedTower: TowerType | null,
  setSelectedTower: (type: TowerType | null) => void,
  selectedTurretId: string | null,
  setSelectedTurretId: (id: string | null) => void
}) => {
    const TURRET_SLOTS = [
      { id: '1',  x: 45,  y: 52  },
      { id: '2',  x: 148, y: 113 },
      { id: '3',  x: 258, y: 42  },
      { id: '4',  x: 315, y: 70  },
      { id: '5',  x: 352, y: 182 },
      { id: '6',  x: 345, y: 268 },
      { id: '7',  x: 305, y: 295 },
      { id: '8',  x: 248, y: 308 },
      { id: '9',  x: 132, y: 455 },
      { id: '10', x: 62,  y: 440 },
      { id: '11', x: 180, y: 475 },
      { id: '12', x: 252, y: 493 },
      { id: '13', x: 365, y: 530 },
      { id: '14', x: 280, y: 583 },
      { id: '15', x: 88,  y: 630 },
    ];

    const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full bg-[#1b1712] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a241c] via-[#1b1712] to-[#0a0806] overflow-hidden flex items-center justify-center touch-none select-none" onClick={() => { setSelectedTower(null); setSelectedTurretId(null); }}>
            
            {/* SVG Interactive Ground Layer */}
            <svg 
              className="w-full h-full max-w-full max-h-full pointer-events-none relative z-10"
              viewBox="0 0 420 780"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="groundShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="3" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.8"/>
                </filter>
                <filter id="blackShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.7"/>
                </filter>
                <filter id="unitShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="5" dy="8" stdDeviation="4" floodColor="#000000" floodOpacity="0.7"/>
                </filter>
                
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />
                </pattern>
                
                <pattern id="camoDesert" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#d4b886" />
                  <path d="M 0 5 Q 5 10 10 0 T 20 5" fill="none" stroke="#a3824f" strokeWidth="4" />
                  <path d="M 0 15 Q 8 20 15 10 T 20 20" fill="none" stroke="#6e5734" strokeWidth="3" />
                  <circle cx="5" cy="5" r="3" fill="#8c7348" opacity="0.8" />
                  <circle cx="15" cy="15" r="4" fill="#a3824f" opacity="0.6" />
                </pattern>
                
                <pattern id="camoJungle" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                  <rect width="20" height="20" fill="#2a3d2e" />
                  <path d="M 0 5 Q 5 10 10 0 T 20 5" fill="none" stroke="#1c291f" strokeWidth="5" />
                  <path d="M 0 15 Q 8 20 15 10 T 20 20" fill="none" stroke="#324a38" strokeWidth="4" />
                  <circle cx="2" cy="18" r="4" fill="#141c16" opacity="0.6" />
                </pattern>
                
                <pattern id="camoUrban" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
                  <rect width="20" height="20" fill="#475569" />
                  <path d="M 0 5 Q 5 10 10 0 T 20 5" fill="none" stroke="#1e293b" strokeWidth="5" />
                  <path d="M 0 15 Q 8 20 15 10 T 20 20" fill="none" stroke="#334155" strokeWidth="4" />
                </pattern>
                
                <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="leftShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#050200" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#050200" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rightShadow" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#050200" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#050200" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="craterGrad" cx="50%" cy="60%" r="50%">
                  <stop offset="0%" stopColor="#0a0400" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1a0a02" stopOpacity="0.7" />
                </radialGradient>
                <path id="topo1" d="M -50 88 Q 80 48 220 108 T 470 75" fill="none" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1.5" />
                <path id="topo2" d="M -50 160 Q 100 120 245 178 T 470 142" fill="none" stroke="rgba(249, 115, 22, 0.06)" strokeWidth="1" />
                <path id="topo3" d="M -50 338 Q 115 298 265 352 T 470 315" fill="none" stroke="rgba(249, 115, 22, 0.07)" strokeWidth="1" />
                <path id="topo4" d="M -50 432 Q 100 395 255 448 T 470 412" fill="none" stroke="rgba(249, 115, 22, 0.09)" strokeWidth="1.5" />
                <path id="topo5" d="M -50 698 Q 125 660 275 708 T 470 675" fill="none" stroke="rgba(249, 115, 22, 0.06)" strokeWidth="1" />
              </defs>

              <rect x="0" y="0" width="420" height="780" fill="url(#grid)" />

              <use href="#topo1" />
              <use href="#topo2" />
              <use href="#topo3" />
              <use href="#topo4" />
              <use href="#topo5" />

              <rect x="0" y="0" width="48" height="780" fill="url(#leftShadow)" pointerEvents="none" />
              <rect x="372" y="0" width="48" height="780" fill="url(#rightShadow)" pointerEvents="none" />

              <g filter="url(#blackShadow)" opacity="0.82">
                <g transform="translate(22, 178)">
                  <ellipse cx="0" cy="9" rx="22" ry="12" fill="#7a6045" />
                  <ellipse cx="16" cy="4" rx="16" ry="9" fill="#6a5035" />
                  <ellipse cx="-14" cy="6" rx="14" ry="8" fill="#8a7055" />
                  <ellipse cx="5" cy="-1" rx="10" ry="6" fill="#5a4025" />
                  <ellipse cx="-6" cy="-3" rx="7" ry="4" fill="#4a3018" />
                </g>
                <g transform="translate(402, 228)">
                  <ellipse cx="0" cy="8" rx="18" ry="10" fill="#7a6045" />
                  <ellipse cx="-14" cy="4" rx="13" ry="7" fill="#6a5035" />
                  <ellipse cx="10" cy="3" rx="11" ry="6" fill="#8a7055" />
                </g>
                <g transform="translate(15, 395)">
                  <ellipse cx="0" cy="9" rx="20" ry="11" fill="#7a6045" />
                  <ellipse cx="15" cy="4" rx="15" ry="8" fill="#6a5035" />
                  <ellipse cx="-10" cy="5" rx="13" ry="7" fill="#8a7055" />
                  <ellipse cx="6" cy="-1" rx="9" ry="5" fill="#5a4025" />
                </g>
                <g transform="translate(404, 618)">
                  <ellipse cx="0" cy="8" rx="16" ry="9" fill="#7a6045" />
                  <ellipse cx="-12" cy="4" rx="12" ry="7" fill="#6a5035" />
                  <ellipse cx="9" cy="2" rx="11" ry="6" fill="#8a7055" />
                </g>
                <g transform="translate(18, 718)">
                  <ellipse cx="0" cy="8" rx="18" ry="10" fill="#7a6045" />
                  <ellipse cx="14" cy="3" rx="14" ry="8" fill="#6a5035" />
                  <ellipse cx="-11" cy="5" rx="12" ry="7" fill="#8a7055" />
                </g>
                <g transform="translate(402, 118)">
                  <ellipse cx="0" cy="7" rx="15" ry="8" fill="#7a6045" />
                  <ellipse cx="-11" cy="3" rx="11" ry="6" fill="#6a5035" />
                  <ellipse cx="8" cy="2" rx="9" ry="5" fill="#8a7055" />
                </g>
              </g>

              <g opacity="0.72">
                <g transform="translate(200, 158)">
                  <ellipse cx="0" cy="5" rx="28" ry="19" fill="url(#craterGrad)" />
                  <ellipse cx="0" cy="5" rx="28" ry="19" fill="none" stroke="#5a3810" strokeWidth="3" opacity="0.55" />
                  <ellipse cx="0" cy="5" rx="36" ry="24" fill="none" stroke="#3a2208" strokeWidth="1.5" opacity="0.3" />
                </g>
                <g transform="translate(388, 390)">
                  <ellipse cx="0" cy="4" rx="22" ry="15" fill="url(#craterGrad)" />
                  <ellipse cx="0" cy="4" rx="22" ry="15" fill="none" stroke="#5a3810" strokeWidth="2.5" opacity="0.55" />
                  <ellipse cx="0" cy="4" rx="29" ry="20" fill="none" stroke="#3a2208" strokeWidth="1.5" opacity="0.28" />
                </g>
                <g transform="translate(178, 636)">
                  <ellipse cx="0" cy="5" rx="25" ry="17" fill="url(#craterGrad)" />
                  <ellipse cx="0" cy="5" rx="25" ry="17" fill="none" stroke="#5a3810" strokeWidth="2.5" opacity="0.55" />
                  <ellipse cx="0" cy="5" rx="32" ry="22" fill="none" stroke="#3a2208" strokeWidth="1.5" opacity="0.28" />
                </g>
                <g transform="translate(28, 560)">
                  <ellipse cx="0" cy="4" rx="19" ry="13" fill="url(#craterGrad)" />
                  <ellipse cx="0" cy="4" rx="19" ry="13" fill="none" stroke="#5a3810" strokeWidth="2" opacity="0.5" />
                  <ellipse cx="0" cy="4" rx="25" ry="17" fill="none" stroke="#3a2208" strokeWidth="1" opacity="0.25" />
                </g>
              </g>

              <g stroke="#5a4828" strokeLinecap="round" opacity="0.55">
                <g transform="translate(390, 52)" strokeWidth="1.5">
                  <line x1="0" y1="0" x2="-9" y2="-15" />
                  <line x1="0" y1="0" x2="7" y2="-17" />
                  <line x1="0" y1="0" x2="-15" y2="-8" />
                  <line x1="0" y1="0" x2="13" y2="-7" />
                  <line x1="0" y1="0" x2="1" y2="-20" />
                  <circle cx="0" cy="0" r="3.5" fill="#3a2a0a" stroke="none" />
                </g>
                <g transform="translate(30, 318)" strokeWidth="1.5">
                  <line x1="0" y1="0" x2="-8" y2="-13" />
                  <line x1="0" y1="0" x2="9" y2="-14" />
                  <line x1="0" y1="0" x2="-14" y2="-6" />
                  <line x1="0" y1="0" x2="14" y2="-5" />
                  <line x1="0" y1="0" x2="2" y2="-17" />
                  <circle cx="0" cy="0" r="3" fill="#3a2a0a" stroke="none" />
                </g>
                <g transform="translate(60, 498)" strokeWidth="1.2">
                  <line x1="0" y1="0" x2="-7" y2="-11" />
                  <line x1="0" y1="0" x2="8" y2="-12" />
                  <line x1="0" y1="0" x2="-12" y2="-5" />
                  <line x1="0" y1="0" x2="11" y2="-6" />
                  <circle cx="0" cy="0" r="2.5" fill="#3a2a0a" stroke="none" />
                </g>
                <g transform="translate(392, 665)" strokeWidth="1.5">
                  <line x1="0" y1="0" x2="-8" y2="-14" />
                  <line x1="0" y1="0" x2="6" y2="-15" />
                  <line x1="0" y1="0" x2="-13" y2="-7" />
                  <line x1="0" y1="0" x2="12" y2="-8" />
                  <circle cx="0" cy="0" r="3" fill="#3a2a0a" stroke="none" />
                </g>
              </g>

              <g filter="url(#groundShadow)">
                <path d="M -20 120 C 90 65 250 65 370 135 C 405 195 405 275 340 315 C 270 355 130 370 110 428 C 90 486 225 542 360 567 C 400 585 235 658 -20 682"
                      stroke="#b28d57" strokeWidth="58" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                <path d="M -20 120 C 90 65 250 65 370 135 C 405 195 405 275 340 315 C 270 355 130 370 110 428 C 90 486 225 542 360 567 C 400 585 235 658 -20 682"
                      stroke="#d4ac75" strokeWidth="46" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="1" />
                <path d="M -20 120 C 90 65 250 65 370 135 C 405 195 405 275 340 315 C 270 355 130 370 110 428 C 90 486 225 542 360 567 C 400 585 235 658 -20 682"
                      stroke="#c09861" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
              </g>

              <g filter="url(#blackShadow)">

                <g transform="translate(100, 265) rotate(-12)">
                  <g transform="translate(0, 0)">
                    <rect x="-18" y="-13" width="36" height="26" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                  <g transform="translate(38, 7)">
                    <rect x="-18" y="-13" width="36" height="26" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                  <g transform="translate(-5, 22)">
                    <ellipse cx="-12" cy="0" rx="9" ry="5" fill="#8B7355" stroke="#5a4a30" strokeWidth="1" />
                    <ellipse cx="0"   cy="0" rx="9" ry="5" fill="#8B7355" stroke="#5a4a30" strokeWidth="1" />
                    <ellipse cx="12"  cy="0" rx="9" ry="5" fill="#8B7355" stroke="#5a4a30" strokeWidth="1" />
                    <ellipse cx="-6"  cy="-6" rx="9" ry="5" fill="#7a6345" stroke="#5a4a30" strokeWidth="1" />
                    <ellipse cx="6"   cy="-6" rx="9" ry="5" fill="#7a6345" stroke="#5a4a30" strokeWidth="1" />
                  </g>
                  <g transform="translate(62, -6)">
                    <rect x="-5" y="-14" width="10" height="22" rx="3" fill="#2d2d2d" stroke="#111" strokeWidth="1" />
                    <line x1="-5" y1="-6" x2="5" y2="-6" stroke="#555" strokeWidth="1" />
                    <line x1="-5" y1="2" x2="5" y2="2" stroke="#555" strokeWidth="1" />
                    <circle cx="0" cy="-14" r="3" fill="#1a1a1a" stroke="#555" strokeWidth="0.5" />
                    <rect x="7" y="-11" width="8" height="18" rx="2.5" fill="#8B0000" stroke="#111" strokeWidth="1" />
                    <line x1="7" y1="-4" x2="15" y2="-4" stroke="#600" strokeWidth="0.8" />
                    <line x1="7" y1="4" x2="15" y2="4" stroke="#600" strokeWidth="0.8" />
                  </g>
                  <g transform="translate(-28, -22)">
                    <line x1="0" y1="0" x2="0" y2="-28" stroke="#888" strokeWidth="1.5" />
                    <polygon points="0,-28 14,-23 0,-18" fill="#4b5320" />
                  </g>
                </g>

                <g transform="translate(200, 188) rotate(5)">
                  <rect x="-2" y="-25" width="4" height="50" fill="#64748b" />
                  <line x1="-2" y1="-25" x2="20" y2="0" stroke="#111" strokeWidth="1.5" />
                  <rect x="18" y="-4" width="5" height="8" fill="#475569" stroke="#111" />
                  <path d="M -8 -32 Q -4 -36 0 -32 Q 4 -36 8 -32 Q 12 -36 16 -32 L 16 -25 L -8 -25 Z" fill="#d4d4d8" stroke="#71717a" strokeWidth="1" />
                  <circle cx="4" cy="-29" r="3" fill="#3f3f46" />
                  <g transform="translate(-28, 12)">
                    <ellipse cx="0"  cy="0" rx="8" ry="5" fill="#8B7355" stroke="#5a4a30" strokeWidth="0.8" />
                    <ellipse cx="10" cy="0" rx="8" ry="5" fill="#8B7355" stroke="#5a4a30" strokeWidth="0.8" />
                    <ellipse cx="5"  cy="-5" rx="7" ry="4" fill="#7a6345" stroke="#5a4a30" strokeWidth="0.8" />
                  </g>
                  <g transform="translate(22, 12)">
                    <ellipse cx="0"  cy="0" rx="8" ry="5" fill="#8B7355" stroke="#5a4a30" strokeWidth="0.8" />
                    <ellipse cx="10" cy="0" rx="8" ry="5" fill="#8B7355" stroke="#5a4a30" strokeWidth="0.8" />
                    <ellipse cx="5"  cy="-5" rx="7" ry="4" fill="#7a6345" stroke="#5a4a30" strokeWidth="0.8" />
                  </g>
                </g>

                <g transform="translate(405, 356)">
                  <line x1="-10" y1="30" x2="-5" y2="-10" stroke="#5a4a30" strokeWidth="2.5" />
                  <line x1="10"  y1="30" x2="5"  y2="-10" stroke="#5a4a30" strokeWidth="2.5" />
                  <line x1="-10" y1="30" x2="5"  y2="-10" stroke="#5a4a30" strokeWidth="1.5" opacity="0.5" />
                  <line x1="10"  y1="30" x2="-5" y2="-10" stroke="#5a4a30" strokeWidth="1.5" opacity="0.5" />
                  <rect x="-14" y="-18" width="28" height="12" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5" />
                  <line x1="-14" y1="-18" x2="-14" y2="-28" stroke="#3a4018" strokeWidth="1.5" />
                  <line x1="14"  y1="-18" x2="14"  y2="-28" stroke="#3a4018" strokeWidth="1.5" />
                  <line x1="-14" y1="-28" x2="14"  y2="-28" stroke="#3a4018" strokeWidth="1.5" />
                  <circle cx="0" cy="-24" r="4" fill="#334155" stroke="#64748b" strokeWidth="1" />
                  <polygon points="-3,-20 3,-20 8,4 -8,4" fill="#fef08a" opacity="0.15" />
                </g>

                <g transform="translate(352, 62) rotate(15)">
                  <g transform="translate(0, 0)">
                    <rect x="-18" y="-13" width="36" height="26" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                  <g transform="translate(-36, -16)">
                    <rect x="-18" y="-13" width="36" height="26" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                  <g transform="translate(-46, 18)">
                    <rect x="0" y="-8" width="14" height="10" fill="#3d4a1a" stroke="#2b3011" strokeWidth="1" rx="1" />
                    <line x1="0" y1="-3" x2="14" y2="-3" stroke="#2b3011" strokeWidth="0.8" />
                    <rect x="16" y="-6" width="12" height="8" fill="#3d4a1a" stroke="#2b3011" strokeWidth="1" rx="1" />
                    <line x1="16" y1="-2" x2="28" y2="-2" stroke="#2b3011" strokeWidth="0.8" />
                  </g>
                  <g transform="translate(20, -28)">
                    <line x1="0" y1="0" x2="0" y2="-24" stroke="#888" strokeWidth="1.5" />
                    <polygon points="0,-24 12,-20 0,-16" fill="#4b5320" />
                  </g>
                </g>

                <g transform="translate(290, 716)">
                  <rect x="-28" y="-18" width="56" height="36" fill="#3e451b" rx="4" stroke="#2b3011" strokeWidth="2"/>
                  <line x1="-28" y1="-8" x2="28" y2="-8" stroke="#2b3011" strokeWidth="2" />
                  <line x1="-28" y1="8" x2="28" y2="8" stroke="#2b3011" strokeWidth="2" />
                  <line x1="0" y1="-18" x2="0" y2="-12" stroke="#6b7240" strokeWidth="1.5" strokeDasharray="3 2" />
                  <g transform="translate(-42, 26) rotate(-20)">
                    <path d="M-16,-3 L20,0 L-16,3 Z" fill="#64748b" stroke="#111" strokeWidth="1" />
                    <path d="M-4,-16 L8,0 L-4,16 Z" fill="#475569" stroke="#111" strokeWidth="1" />
                    <circle cx="8" cy="0" r="2.5" fill="#0ea5e9" stroke="#111" strokeWidth="1" />
                  </g>
                  <g transform="translate(22, 44) rotate(-35)">
                    <path d="M-16,-3 L20,0 L-16,3 Z" fill="#64748b" stroke="#111" strokeWidth="1" />
                    <path d="M-4,-16 L8,0 L-4,16 Z" fill="#475569" stroke="#111" strokeWidth="1" />
                    <circle cx="8" cy="0" r="2.5" fill="#0ea5e9" stroke="#111" strokeWidth="1" />
                  </g>
                  <g transform="translate(38, -6)">
                    <rect x="-5" y="-12" width="10" height="18" rx="3" fill="#2d2d2d" stroke="#111" strokeWidth="1" />
                    <line x1="-5" y1="-4" x2="5" y2="-4" stroke="#555" strokeWidth="1" />
                    <rect x="7" y="-10" width="9" height="16" rx="2.5" fill="#8B0000" stroke="#111" strokeWidth="1" />
                  </g>
                </g>

                <g transform="translate(38, 228) rotate(18)" opacity="0.7">
                  <rect x="-18" y="-9" width="36" height="18" rx="3" fill="#3a3020" stroke="#111" strokeWidth="1.5" />
                  <rect x="-14" y="-7" width="20" height="14" rx="2" fill="#2a2018" stroke="#111" strokeWidth="1" />
                  <rect x="-10" y="-9" width="8" height="4" rx="1" fill="#111" />
                  <rect x="-10" y="5" width="8" height="4" rx="1" fill="#111" />
                  <rect x="8" y="-9" width="6" height="4" rx="1" fill="#111" />
                  <rect x="8" y="5" width="6" height="4" rx="1" fill="#111" />
                  <rect x="12" y="-6" width="6" height="12" rx="1" fill="#1a1008" />
                  <line x1="-4" y1="-9" x2="2" y2="9" stroke="#5a3010" strokeWidth="1.5" opacity="0.6" />
                  <line x1="6" y1="-9" x2="0" y2="9" stroke="#5a3010" strokeWidth="1" opacity="0.4" />
                </g>

              </g>

              <circle cx="0" cy="120" r="30" fill="#f97316" opacity="0.05" filter="url(#neonGlow)" />
              <line x1="0" y1="90" x2="0" y2="150" stroke="#f97316" strokeWidth="4" filter="url(#neonGlow)" />
              <line x1="-12" y1="90" x2="-12" y2="150" stroke="#f97316" strokeWidth="2" opacity="0.4" />

              <circle cx="0" cy="682" r="30" fill="#f97316" opacity="0.05" filter="url(#neonGlow)" />
              <line x1="0" y1="652" x2="0" y2="712" stroke="#f97316" strokeWidth="4" filter="url(#neonGlow)" />
              <line x1="-12" y1="652" x2="-12" y2="712" stroke="#f97316" strokeWidth="2" opacity="0.4" />

              {gameState.enemies.map(enemy => (
                <g key={enemy.id} transform={`translate(${enemy.x}, ${enemy.y}) rotate(${enemy.rotation || 0})`}>
                  
                  {(() => {
                    const ratio = enemy.hp / enemy.maxHp;
                    const hpColor = ratio > 0.6 ? '#22c55e' : ratio > 0.3 ? '#facc15' : '#ef4444';
                    return (
                      <g transform={`rotate(${-(enemy.rotation || 0)}) translate(-15, -25)`}>
                        <rect width="30" height="4" fill="#111" rx="2" />
                        <rect width={30 * ratio} height="4" fill={hpColor} rx="2" />
                      </g>
                    );
                  })()}

                  {enemy.type === 'jeep' && (
                    <motion.g 
                      initial={{ y: 0 }}
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.5, repeat: Infinity }}
                      filter="url(#unitShadow)"
                    >
                      <rect x="-16" y="-12" width="32" height="24" rx="4" fill="url(#camoJungle)" stroke="#111" strokeWidth="1" />
                      <rect x="-12" y="-10" width="24" height="20" rx="3" fill="url(#camoDesert)" opacity="0.6" stroke="#111" strokeWidth="0.5" />
                      <rect x="0" y="-8" width="8" height="16" fill="url(#glass)" stroke="#fff" strokeWidth="0.5" opacity="0.8" />
                      <rect x="-12" y="-16" width="10" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />
                      <rect x="-12" y="10" width="10" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />
                      <rect x="6" y="-16" width="8" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />
                      <rect x="6" y="10" width="8" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />
                      <circle cx="16" cy="-8" r="2" fill="#ffedd5" filter="url(#neonGlow)" />
                      <circle cx="16" cy="8" r="2" fill="#ffedd5" filter="url(#neonGlow)" />
                      <polygon points="17,-8 40,-16 40,0" fill="#fff" opacity="0.1" />
                      <polygon points="17,8 40,0 40,16" fill="#fff" opacity="0.1" />
                    </motion.g>
                  )}

                  {enemy.type === 'tank' && (
                    <g filter="url(#unitShadow)">
                      <rect x="-22" y="-18" width="44" height="10" rx="2" fill="url(#metal)" stroke="#000" strokeWidth="1" />
                      <rect x="-22" y="8" width="44" height="10" rx="2" fill="url(#metal)" stroke="#000" strokeWidth="1" />
                      <path d="M -16 -12 L 14 -12 L 20 -4 L 20 4 L 14 12 L -16 12 Z" fill="url(#camoDesert)" stroke="#1c291f" strokeWidth="1.5" />
                      <rect x="-14" y="-8" width="8" height="16" fill="#1a2e21" stroke="#111" strokeWidth="0.5" />
                      <line x1="-12" y1="-6" x2="-12" y2="6" stroke="#000" strokeWidth="1" />
                      <line x1="-10" y1="-6" x2="-10" y2="6" stroke="#000" strokeWidth="1" />
                      <line x1="-8" y1="-6" x2="-8" y2="6" stroke="#000" strokeWidth="1" />
                      <circle cx="2" cy="0" r="12" fill="url(#camoJungle)" stroke="#000" strokeWidth="1.5" />
                      <circle cx="2" cy="0" r="6" fill="#111" opacity="0.8" />
                      <rect x="8" y="-3" width="28" height="6" fill="url(#metal)" stroke="#000" strokeWidth="1" />
                      <rect x="34" y="-4" width="6" height="8" fill="#111" />
                      <line x1="8" y1="0" x2="34" y2="0" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
                    </g>
                  )}

                  {enemy.type === 'apc' && (
                    <g filter="url(#unitShadow)">
                      <rect x="-16" y="-14" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="0" y="-14" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="16" y="-14" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="-16" y="8" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="0" y="8" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="16" y="8" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <path d="M -22 -10 L 22 -10 L 26 -4 L 26 4 L 22 10 L -22 10 Z" fill="url(#camoUrban)" stroke="#111" strokeWidth="1.5" />
                      <rect x="-14" y="-6" width="20" height="12" fill="url(#metal)" opacity="0.8" stroke="#111" strokeWidth="0.5" />
                      <circle cx="-4" cy="0" r="4" fill="#111" stroke="#333" />
                      <circle cx="8" cy="0" r="4" fill="#111" stroke="#333" />
                      <circle cx="16" cy="0" r="5" fill="#222" stroke="#111" strokeWidth="1" />
                      <rect x="16" y="-1" width="12" height="2" fill="url(#metal)" stroke="#000" strokeWidth="0.5" />
                    </g>
                  )}

                  {enemy.type === 'squad' && (
                    <g filter="url(#blackShadow)">
                      <g transform="translate(6, 6)">
                        <circle cx="0" cy="0" r="4.5" fill="url(#camoJungle)" stroke="#111" strokeWidth="1" />
                        <rect x="2" y="-1" width="12" height="2" fill="#111" />
                        <circle cx="1" cy="0" r="2.5" fill="#000" />
                      </g>
                      <g transform="translate(-5, -5)">
                        <circle cx="0" cy="0" r="4.5" fill="url(#camoJungle)" stroke="#111" strokeWidth="1" />
                        <rect x="2" y="-1" width="10" height="2" fill="#111" />
                        <circle cx="1" cy="0" r="2.5" fill="#000" />
                      </g>
                      <g transform="translate(-8, 8)">
                        <circle cx="0" cy="0" r="4.5" fill="url(#camoJungle)" stroke="#111" strokeWidth="1" />
                        <rect x="2" y="-1" width="10" height="2" fill="#111" />
                        <circle cx="1" cy="0" r="2.5" fill="#000" />
                      </g>
                    </g>
                  )}

                  {enemy.type === 'buggy' && (
                    <motion.g 
                      initial={{ y: 0 }}
                      animate={{ y: [0, -2, 0] }} 
                      transition={{ duration: 0.3, repeat: Infinity }}
                      filter="url(#unitShadow)"
                    >
                      <rect x="-10" y="-10" width="10" height="5" rx="2" fill="#111" stroke="#000" />
                      <rect x="8" y="-10" width="10" height="5" rx="2" fill="#111" stroke="#000" />
                      <rect x="-10" y="5" width="10" height="5" rx="2" fill="#111" stroke="#000" />
                      <rect x="8" y="5" width="10" height="5" rx="2" fill="#111" stroke="#000" />
                      <path d="M -12 -5 L 12 -4 L 14 0 L 12 4 L -12 5 Z" fill="#b45309" stroke="#111" strokeWidth="1" />
                      <path d="M -6 -4 L 6 -4 L 6 4 L -6 4 Z" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                      <line x1="-6" y1="-4" x2="6" y2="4" stroke="#e2e8f0" strokeWidth="1" />
                      <line x1="-6" y1="4" x2="6" y2="-4" stroke="#e2e8f0" strokeWidth="1" />
                      <rect x="-14" y="-3" width="4" height="6" fill="url(#metal)" stroke="#111" />
                      <circle cx="0" cy="0" r="3" fill="#111" />
                      <circle cx="0" cy="0" r="1.5" fill="#ef4444" />
                    </motion.g>
                  )}

                  {enemy.type === 'heavy_tank' && (
                    <g filter="url(#unitShadow)">
                      <rect x="-26" y="-22" width="52" height="12" rx="3" fill="url(#metal)" stroke="#111" strokeWidth="1.5" />
                      <rect x="-26" y="10" width="52" height="12" rx="3" fill="url(#metal)" stroke="#111" strokeWidth="1.5" />
                      <rect x="-18" y="-23" width="36" height="46" fill="#111" />
                      <path d="M -22 -16 L 20 -16 L 30 -8 L 30 8 L 20 16 L -22 16 Z" fill="url(#camoDesert)" stroke="#111" strokeWidth="2" />
                      <rect x="-16" y="-10" width="12" height="20" fill="url(#metal)" opacity="0.6" stroke="#111" />
                      <rect x="-2" y="-10" width="18" height="20" fill="url(#camoUrban)" rx="2" stroke="#111" />
                      <circle cx="4" cy="0" r="18" fill="url(#camoJungle)" stroke="#111" strokeWidth="2" />
                      <circle cx="4" cy="0" r="10" fill="#111" opacity="0.7" />
                      <rect x="20" y="-7" width="36" height="5" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      <rect x="20" y="2" width="36" height="5" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      <rect x="52" y="-8" width="8" height="7" fill="#111" />
                      <rect x="52" y="1" width="8" height="7" fill="#111" />
                    </g>
                  )}

                  {enemy.type === 'emp_drone' && (
                    <motion.g 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      filter="url(#unitShadow)"
                    >
                      <circle cx="0" cy="0" r="18" fill="#3b82f6" fillOpacity="0.15" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" filter="url(#neonGlow)" />
                      <path d="M -10 0 L 0 -10 L 10 0 L 0 10 Z" fill="url(#metal)" stroke="#818cf8" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="5" fill="#1e293b" />
                      <circle cx="0" cy="0" r="2" fill="#fff" filter="url(#neonGlow)" />
                      <circle cx="-10" cy="-10" r="4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
                      <circle cx="10" cy="-10" r="4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
                      <circle cx="-10" cy="10" r="4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
                      <circle cx="10" cy="10" r="4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
                    </motion.g>
                  )}
                  
                  {enemy.type === 'jet' && (
                    <motion.g 
                      initial={{ scale: 1.2 }}
                      animate={{ scale: [1.2, 1.3, 1.2] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                      filter="url(#unitShadow)"
                    >
                      <path d="M -15 -14 L -5 0 L -15 14 Z" fill="url(#metal)" stroke="#111" strokeWidth="0.5" />
                      <path d="M -10 -25 L 8 0 L -10 25 Z" fill="url(#camoUrban)" stroke="#111" strokeWidth="1" />
                      <path d="M -5 -5 L 24 0 L -5 5 Z" fill="url(#metal)" stroke="#111" strokeWidth="0.5" />
                      <ellipse cx="6" cy="0" rx="6" ry="2" fill="url(#glass)" />
                      <circle cx="-12" cy="-8" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                      <circle cx="-12" cy="8" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                      <polygon points="-14,-8 -24,-10 -24,-6" fill="#f97316" opacity="0.8" filter="url(#neonGlow)" />
                      <polygon points="-14,8 -24,6 -24,10" fill="#f97316" opacity="0.8" filter="url(#neonGlow)" />
                    </motion.g>
                  )}

                  {enemy.type === 'stealth_heli' && (
                    <motion.g
                      initial={{ scale: 1.1 }}
                      animate={{ scale: [1.1, 1.15, 1.1], opacity: [0.45, 0.55, 0.45] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      filter="url(#unitShadow)"
                    >
                      <path d="M -14 -6 L 18 -5 L 24 0 L 18 5 L -14 6 Z" fill="#0f172a" stroke="#000" strokeWidth="1.5" />
                      <path d="M 8 -3 L 18 -2 L 18 2 L 8 3 Z" fill="url(#glass)" opacity="0.8" />
                      <rect x="-28" y="-1.5" width="14" height="3" fill="#1e293b" />
                      <path d="M -28 -6 L -24 -1.5 L -28 3 Z" fill="#0f172a" stroke="#000" strokeWidth="0.5" />
                      <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}>
                         <circle cx="0" cy="0" r="20" fill="#fff" opacity="0.1" />
                         <path d="M -20 -2 L 20 -2 L 20 2 L -20 2 Z" fill="#fff" opacity="0.3" filter="url(#neonGlow)" />
                         <path d="M -2 -20 L 2 -20 L 2 20 L -2 20 Z" fill="#fff" opacity="0.3" filter="url(#neonGlow)" />
                      </motion.g>
                      <circle cx="0" cy="0" r="2" fill="#111" />
                    </motion.g>
                  )}

                  {enemy.type === 'bomber' && (
                    <motion.g 
                      initial={{ scale: 1.3 }}
                      animate={{ scale: [1.3, 1.4, 1.3] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      filter="url(#unitShadow)"
                    >
                      <polygon points="-24,-6 24,0 -24,6" fill="#1e293b" stroke="#111" strokeWidth="1.5" />
                      <polygon points="-5,0 -15,-30 8,0 -15,30" fill="url(#camoJungle)" stroke="#111" strokeWidth="1.5" />
                      <ellipse cx="12" cy="0" rx="4" ry="2" fill="url(#glass)" />
                      <circle cx="12" cy="0" r="2" fill="#ef4444" opacity="0.5" filter="url(#neonGlow)" />
                      <line x1="-15" y1="-15" x2="-35" y2="-15" stroke="#fff" opacity="0.3" strokeWidth="2" />
                      <line x1="-15" y1="15" x2="-35" y2="15" stroke="#fff" opacity="0.3" strokeWidth="2" />
                    </motion.g>
                  )}

                  {enemy.type === 'motorcycle' && (
                    <g filter="url(#unitShadow)">
                      <rect x="-8" y="-3" width="16" height="6" rx="2" fill="#111" />
                      <rect x="-4" y="-3" width="8" height="6" fill="url(#metal)" />
                      <circle cx="-6" cy="0" r="3.5" fill="#111" stroke="#333" strokeWidth="1" />
                      <circle cx="6" cy="0" r="3.5" fill="#111" stroke="#333" strokeWidth="1" />
                      <path d="M -2 -2 L 4 -2 L 2 -4 Z" fill="#10b981" />
                      <circle cx="8" cy="0" r="1.5" fill="#fde047" filter="url(#neonGlow)" />
                      <polygon points="9,-4 25,-12 25,12 9,4" fill="#fef08a" opacity="0.2" />
                      <circle cx="-2" cy="0" r="2" fill="#111" />
                    </g>
                  )}

                  {enemy.type === 'medic_truck' && (
                    <g filter="url(#unitShadow)">
                      <rect x="-14" y="-10" width="8" height="4" rx="1" fill="#111" />
                      <rect x="8" y="-10" width="8" height="4" rx="1" fill="#111" />
                      <rect x="-14" y="6" width="8" height="4" rx="1" fill="#111" />
                      <rect x="8" y="6" width="8" height="4" rx="1" fill="#111" />
                      <rect x="-16" y="-8" width="32" height="16" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
                      <rect x="8" y="-6" width="6" height="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
                      <rect x="10" y="-4" width="3" height="8" fill="url(#glass)" />
                      <circle cx="-4" cy="0" r="5" fill="#fff" stroke="#e2e8f0" />
                      <rect x="-5.5" y="-3" width="3" height="6" fill="#ef4444" />
                      <rect x="-7" y="-1.5" width="6" height="3" fill="#ef4444" />
                      <circle cx="-4" cy="0" r="20" fill="#22c55e" opacity="0.1" className="animate-ping" />
                    </g>
                  )}

                  {enemy.type === 'mech' && (
                    <motion.g
                      initial={{ y: 0 }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      filter="url(#unitShadow)"
                    >
                      <motion.circle
                        cx="0" cy="0" r="50"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        animate={{ r: [44, 56, 44], opacity: [0.5, 0.15, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <circle cx="0" cy="0" r="40" fill="#ef4444" fillOpacity="0.06" />
                      <path d="M 0 0 L -8 -12 L -14 -12" fill="none" stroke="url(#metal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 0 0 L -8 12 L -14 12" fill="none" stroke="url(#metal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 0 0 L 10 -12 L 16 -12" fill="none" stroke="url(#camoUrban)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 0 0 L 10 12 L 16 12" fill="none" stroke="url(#camoUrban)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="-14" y="-14" width="28" height="28" rx="4" fill="url(#camoUrban)" stroke="#111" strokeWidth="2" />
                      <circle cx="0" cy="0" r="8" fill="#1e293b" />
                      <circle cx="0" cy="0" r="4" fill="#0ea5e9" filter="url(#neonGlow)" className="animate-pulse" />
                      <rect x="8" y="-6" width="8" height="12" rx="2" fill="url(#glass)" stroke="#111" />
                      <rect x="14" y="-18" width="20" height="6" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      <rect x="14" y="12" width="20" height="6" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      <line x1="34" y1="-15" x2="60" y2="-15" stroke="#ef4444" strokeWidth="0.5" opacity="0.6" />
                      <line x1="34" y1="15" x2="60" y2="15" stroke="#ef4444" strokeWidth="0.5" opacity="0.6" />
                    </motion.g>
                  )}

                </g>
              ))}

              {gameState.projectiles.map(proj => {
                 const angle = Math.atan2(proj.targetY - proj.y, proj.targetX - proj.x) * (180 / Math.PI);
                 return (
                  <g key={proj.id} transform={`translate(${proj.x}, ${proj.y}) rotate(${angle})`}>
                    {proj.towerType === 'mitrailleuse' && (
                      <rect x="-7" y="-1.5" width="14" height="3" rx="1.5" fill="#f97316" filter="url(#neonGlow)" />
                    )}
                    {proj.towerType === 'canon' && (
                      <>
                        <rect x="-10" y="-2.5" width="10" height="5" rx="1" fill="#1d4ed8" />
                        <circle cx="3" cy="0" r="5" fill="#3b82f6" filter="url(#neonGlow)" />
                      </>
                    )}
                    {proj.towerType === 'mortier' && (
                      <>
                        <circle cx="0" cy="0" r="7" fill="#f59e0b" filter="url(#neonGlow)" opacity="0.9" />
                        <circle cx="0" cy="0" r="3" fill="#1c0a00" />
                      </>
                    )}
                    {proj.towerType === 'dca' && (
                      <>
                        <rect x="-12" y="-1" width="10" height="2" rx="1" fill="#06b6d4" opacity="0.5" />
                        <rect x="-2" y="-1.5" width="14" height="3" rx="1.5" fill="#06b6d4" filter="url(#neonGlow)" />
                      </>
                    )}
                    {proj.towerType === 'missile' && (
                      <>
                        <rect x="-14" y="-1" width="10" height="2" rx="1" fill="#f97316" opacity="0.4" />
                        <rect x="-4" y="-2.5" width="14" height="5" rx="2" fill="#7f1d1d" />
                        <polygon points="10,-3 16,0 10,3" fill="#ef4444" filter="url(#neonGlow)" />
                      </>
                    )}
                  </g>
                 );
              })}
              
              {selectedTurretId && gameState.turrets[selectedTurretId] && (() => {
                const t = gameState.turrets[selectedTurretId];
                return (
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r={t.range}
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1"
                    strokeDasharray="6 4"
                    pointerEvents="none"
                  />
                );
              })()}

              {selectedTower && hoveredSlotId && !gameState.turrets[hoveredSlotId] && (() => {
                const slot = TURRET_SLOTS.find(s => s.id === hoveredSlotId);
                if (!slot) return null;
                const range = TOWER_CONFIGS[selectedTower].range;
                return (
                  <circle
                    cx={slot.x}
                    cy={slot.y}
                    r={range}
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    pointerEvents="none"
                  />
                );
              })()}

              {selectedTower && TURRET_SLOTS.filter(s => !gameState.turrets[s.id] && s.id !== hoveredSlotId).map(slot => (
                <circle
                  key={`ghost-${slot.id}`}
                  cx={slot.x}
                  cy={slot.y}
                  r={TOWER_CONFIGS[selectedTower].range}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  pointerEvents="none"
                />
              ))}

              <g className="pointer-events-auto">
                {TURRET_SLOTS.map(slot => {
                  const turret = gameState.turrets[slot.id];
                  let rotation = 0;
                  if (turret && turret.targetId) {
                    const target = gameState.enemies.find(e => e.id === turret.targetId);
                    if (target) {
                      rotation = Math.atan2(target.y - turret.y, target.x - turret.x) * (180 / Math.PI);
                    }
                  }

                  return (
                    <g
                      key={slot.id}
                      onMouseEnter={() => setHoveredSlotId(slot.id)}
                      onMouseLeave={() => setHoveredSlotId(null)}
                    >
                      <TurretSlot
                        x={slot.x}
                        y={slot.y}
                        type={turret ? turret.type : 'build'}
                        level={turret?.level}
                        rotation={rotation}
                        disabledUntil={turret?.disabledUntil}
                        selected={selectedTurretId === slot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!turret) {
                            if (selectedTower) {
                              buildTurret(slot.id, slot.x, slot.y, selectedTower);
                            }
                            setSelectedTurretId(null);
                          } else {
                            setSelectedTurretId(slot.id);
                            setSelectedTower(null);
                          }
                        }}
                      />
                    </g>
                  );
                })}
              </g>

              {gameState.activeAirstrikes && gameState.activeAirstrikes.map(strike => (
                <motion.g 
                  key={strike.id}
                  initial={{ x: -200 }}
                  animate={{ x: 1200 }}
                  transition={{ duration: 3.5, ease: "linear" }}
                >
                  <g transform="translate(0, 100) scale(1.5)" style={{ filter: 'drop-shadow(0px 40px 20px rgba(0,0,0,0.6))' }}>
                     <polygon points="-20,-5 20,0 -20,5" fill="#1c1917" stroke="#111" strokeWidth="1" />
                     <polygon points="-5,0 -25,-35 5,0 -25,35" fill="#292524" stroke="#111" strokeWidth="1" />
                     <circle cx="10" cy="0" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                     <line x1="-20" y1="-3" x2="-80" y2="-3" stroke="white" strokeWidth="1" opacity="0.3" />
                     <line x1="-20" y1="3" x2="-80" y2="3" stroke="white" strokeWidth="1" opacity="0.3" />
                  </g>
                  <g transform="translate(-100, 300) scale(1.5)" style={{ filter: 'drop-shadow(0px 40px 20px rgba(0,0,0,0.6))' }}>
                     <polygon points="-20,-5 20,0 -20,5" fill="#1c1917" stroke="#111" strokeWidth="1" />
                     <polygon points="-5,0 -25,-35 5,0 -25,35" fill="#292524" stroke="#111" strokeWidth="1" />
                     <circle cx="10" cy="0" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                     <line x1="-20" y1="-3" x2="-80" y2="-3" stroke="white" strokeWidth="1" opacity="0.3" />
                     <line x1="-20" y1="3" x2="-80" y2="3" stroke="white" strokeWidth="1" opacity="0.3" />
                  </g>
                  <g transform="translate(-150, 500) scale(1.5)" style={{ filter: 'drop-shadow(0px 40px 20px rgba(0,0,0,0.6))' }}>
                     <polygon points="-20,-5 20,0 -20,5" fill="#1c1917" stroke="#111" strokeWidth="1" />
                     <polygon points="-5,0 -25,-35 5,0 -25,35" fill="#292524" stroke="#111" strokeWidth="1" />
                     <circle cx="10" cy="0" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                     <line x1="-20" y1="-3" x2="-80" y2="-3" stroke="white" strokeWidth="1" opacity="0.3" />
                     <line x1="-20" y1="3" x2="-80" y2="3" stroke="white" strokeWidth="1" opacity="0.3" />
                  </g>
                </motion.g>
              ))}
              
              {gameState.activeAirstrikes && gameState.activeAirstrikes.length > 0 && (
                 <motion.rect
                   initial={{ opacity: 0 }}
                   animate={{ opacity: [0, 0.4, 0.1, 0.6, 0] }}
                   transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.6, 1], ease: "easeInOut", delay: 0.5 }}
                   x="0" y="0" width="420" height="780" fill="#f97316" style={{ mixBlendMode: 'color-dodge' }} pointerEvents="none"
                 />
              )}

            </svg>


            <div className="absolute inset-0 pointer-events-none">
              <motion.div 
                 animate={{ opacity: [0, 0.8, 0], y: [0, -20] }}
                 transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                 className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_12px_#fb923c]"
              ></motion.div>
              <motion.div 
                 animate={{ opacity: [0, 0.8, 0], y: [0, -30] }}
                 transition={{ repeat: Infinity, duration: 5, delay: 2 }}
                 className="absolute top-[70%] left-[40%] w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_12px_#fb923c]"
              ></motion.div>
              <motion.div 
                 animate={{ opacity: [0, 0.8, 0], y: [0, -15] }}
                 transition={{ repeat: Infinity, duration: 3.5, delay: 0 }}
                 className="absolute top-[50%] right-[30%] w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_12px_#fb923c]"
              ></motion.div>
            </div>
        </div>
    )
}

function TurretSlot({ x, y, type, level, rotation = 0, disabledUntil = 0, selected = false, onClick }: { key?: string, x: number; y: number; type: 'build' | TowerType; level?: number, rotation?: number, disabledUntil?: number, selected?: boolean, onClick?: (e: any) => void }) {
  if (type === 'build') {
    return (
      <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer group">
         <circle cx="0" cy="0" r="24" fill="#ffffff" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-50 group-hover:opacity-100 group-hover:fill-[#3b82f6] group-hover:fill-opacity-30 transition-all" />
         <circle cx="0" cy="0" r="14" fill="none" stroke="#2563eb" strokeWidth="1" className="opacity-40 group-hover:opacity-100" />
         <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="#1d4ed8" strokeWidth="2" className="opacity-70 group-hover:opacity-100" />
         <circle cx="0" cy="0" r="3" fill="#1d4ed8" className="opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-transform" />
         <text x="0" y="36" textAnchor="middle" fill="#1d4ed8" fontSize="9" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest bg-white/50 px-1 rounded">DÉPLOYER</text>
      </g>
    )
  }

  let accentColor = "#ef4444";
  if (type === 'mitrailleuse') accentColor = "#f97316";
  else if (type === 'canon') accentColor = "#3b82f6";
  else if (type === 'mortier') accentColor = "#f59e0b";
  else if (type === 'dca') accentColor = "#06b6d4";

  const isDisabled = disabledUntil > performance.now();
  const showGlow = selected || isDisabled;

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer group">
      {showGlow && (
        <circle cx="0" cy="0" r="26" fill={isDisabled ? "#3b82f6" : accentColor} fillOpacity="0.25" className="animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" filter="url(#neonGlow)" />
      )}

      {selected && (
        <g>
          <circle cx="0" cy="0" r="28" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[spin_4s_linear_infinite] opacity-80" />
          <circle cx="0" cy="0" r="30" fill="none" stroke={accentColor} strokeWidth="1" className="opacity-40" />
        </g>
      )}

      {(level || 1) >= 2 && (
        <circle cx="0" cy="0" r="16" fill="none" stroke={accentColor} strokeWidth="3" className="opacity-20 animate-pulse" />
      )}
      {(level || 1) >= 3 && (
        <g className="animate-[spin_4s_linear_infinite]">
          <circle cx="0" cy="0" r="22" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="4 8" className="opacity-40" />
          <circle cx="0" cy="0" r="24" fill="none" stroke={accentColor} strokeWidth="0.5" strokeDasharray="2 4" className="opacity-30" />
        </g>
      )}
      {(level || 1) >= 4 && (
        <g className="animate-[spin_3s_linear_reverse_infinite]">
           <circle cx="0" cy="0" r="18" fill="none" stroke={accentColor} strokeWidth="2" strokeDasharray="1 6" className="opacity-60" />
        </g>
      )}
      {(level || 1) >= 5 && (
         <circle cx="0" cy="0" r="30" fill={accentColor} className="opacity-10 animate-ping" />
      )}

      <rect x="-18" y="-18" width="36" height="36" rx="6" fill="#2d160c" stroke={accentColor} strokeWidth={selected ? "2.5" : "1.5"} className={`drop-shadow-xl opacity-90 group-hover:opacity-100 transition-all ${(level || 1) >= 3 ? "shadow-[0_0_15px_currentColor]" : ""}`} style={{ color: accentColor }} />
      <circle cx="0" cy="0" r="14" fill="#030704" stroke="#111" strokeWidth="1" />
      
      {(level || 1) > 1 && (
        <g transform={`translate(0, 15)`} className="opacity-90">
          <rect x={-8 - (((level || 1)-1) * 3)} y="-2" width={16 + (((level || 1)-1) * 6)} height="4" rx="2" fill="#000" opacity="0.6" />
          {[...Array((level || 1) - 1)].map((_, i, arr) => {
            const numStars = arr.length;
            const xOffset = numStars === 1 ? 0 : -4 * (numStars - 1) + (i * 8);
            return (
              <polygon key={i} points="0,-1 1,1 -1,1" transform={`translate(${xOffset}, 0) scale(1.5)`} fill="#fbbf24" />
            )
          })}
        </g>
      )}

      <motion.g 
        animate={{ rotate: rotation }} 
        transition={{ duration: 0.1, ease: "linear" }} 
        style={{ transformOrigin: '0px 0px' }}
      >
        {type === 'mitrailleuse' && (
           <g>
             <rect x="0" y="-5" width="18" height="3" fill="#111" stroke="#222" strokeWidth="1" />
             <rect x="0" y="2" width="18" height="3" fill="#111" stroke="#222" strokeWidth="1" />
             <circle cx="0" cy="0" r="9" fill="#1a2e21" stroke={accentColor} strokeWidth="2" />
           </g>
        )}
        {type === 'canon' && (
           <g>
             <rect x="0" y="-4" width="22" height="8" fill="#0a1220" stroke="#111" strokeWidth="1" />
             <rect x="18" y="-5" width="6" height="10" fill="#030710" stroke={accentColor} strokeWidth="1" />
             <circle cx="0" cy="0" r="11" fill="#102030" stroke={accentColor} strokeWidth="2" />
             <rect x="-6" y="-8" width="4" height="16" fill="#1a2030" rx="1" />
           </g>
        )}
        {type === 'mortier' && (
           <g>
             <circle cx="0" cy="0" r="12" fill="#451a03" stroke={accentColor} strokeWidth="2" />
             <circle cx="0" cy="0" r="6" fill="#000" />
             <rect x="-14" y="-2" width="28" height="4" fill="#78350f" opacity="0.8" />
             <rect x="-2" y="-14" width="4" height="28" fill="#78350f" opacity="0.8" />
             <circle cx="0" cy="0" r="2" fill={accentColor} opacity="0.7" />
           </g>
        )}
        {type === 'missile' && (
           <g>
             <rect x="-8" y="-10" width="16" height="20" rx="2" fill="#450a0a" stroke={accentColor} strokeWidth="1.5" />
             <rect x="-5" y="-8" width="4" height="6" fill="#7f1d1d" />
             <rect x="1" y="-8" width="4" height="6" fill="#7f1d1d" />
             <rect x="-5" y="2" width="4" height="6" fill="#7f1d1d" />
             <rect x="1" y="2" width="4" height="6" fill="#7f1d1d" />
           </g>
        )}
        {type === 'dca' && (
           <g>
             <circle cx="0" cy="0" r="10" fill="#083344" stroke={accentColor} strokeWidth="2" />
             <rect x="2" y="-16" width="3" height="20" fill="#164e63" stroke="#000" strokeWidth="1" />
             <rect x="2" y="-16" width="1" height="6" fill="#67e8f9" />
             <rect x="-5" y="-16" width="3" height="20" fill="#164e63" stroke="#000" strokeWidth="1" />
             <rect x="-5" y="-16" width="1" height="6" fill="#67e8f9" />
           </g>
        )}
      </motion.g>

      <rect x="-11" y="-32" width="22" height="12" rx="2" fill="#000" stroke={accentColor} strokeWidth="0.5" className="opacity-80 drop-shadow-md" />
      <text x="0" y="-23" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">L{level}</text>

      {isDisabled && (
        <g>
          <circle cx="0" cy="0" r="16" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
          <path d="M -10 -10 L 10 10 M -10 10 L 10 -10" stroke="#60a5fa" strokeWidth="3" opacity="0.8" />
        </g>
      )}
    </g>
  );
}
