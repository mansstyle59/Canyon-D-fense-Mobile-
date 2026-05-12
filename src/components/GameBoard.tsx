
import { motion } from 'motion/react';
import { GameState, TowerType, Enemy } from '../types';

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
      { id: '1', x: 60, y: 50 },     // Top left (Base 3 at 140, 50)
      { id: '2', x: 340, y: 50 },    // Top middle (moved left of Checkpoint at 480, 80)
      { id: '3', x: 550, y: 60 },    // Top middle-right (between Checkpoint and Base 2 at 680, 90)
      { id: '4', x: 780, y: 50 },    // Top right (moved further right from Base 2)
      { id: '5', x: 960, y: 220 },   // Far right (moved up)
      { id: '6', x: 960, y: 380 },   // Far right bottom
      { id: '7', x: 720, y: 260 },   // Inner right curve
      { id: '8', x: 580, y: 300 },   // Center
      { id: '9', x: 420, y: 260 },   // Center left
      { id: '10', x: 280, y: 160 },  // Left (moved up to avoid Base 1 at 180, 250)
      { id: '11', x: 80, y: 280 },   // Far left curve
      { id: '12', x: 120, y: 380 },  // Above bottom road left
      { id: '13', x: 320, y: 380 },  // Above bottom road middle-left
      { id: '14', x: 520, y: 580 },  // Below bottom road middle
      { id: '15', x: 700, y: 560 },  // Below bottom road right (moved to avoid Airfield planes at 800, 540)
    ];

    return (
        <div className="relative w-full h-full bg-[#1b1712] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a241c] via-[#1b1712] to-[#0a0806] overflow-hidden flex items-center justify-center touch-none select-none" onClick={() => { setSelectedTower(null); setSelectedTurretId(null); }}>
            
            {/* SVG Interactive Ground Layer */}
            <svg 
              className="w-full h-full max-w-full max-h-full pointer-events-none relative z-10" 
              viewBox="0 0 1024 608"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Definitions for glows */}
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
                
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />
                </pattern>
                
                {/* Camouflage Patterns for Units */}
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
                {/* Topographical Line Patterns */}
                <path id="topo1" d="M -100 200 Q 150 150 400 300 T 800 100 T 1100 400" fill="none" stroke="rgba(249, 115, 22, 0.1)" strokeWidth="1.5" />
                <path id="topo2" d="M -100 250 Q 150 200 400 350 T 800 150 T 1100 450" fill="none" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1" />
                <path id="topo3" d="M -100 300 Q 150 250 400 400 T 800 200 T 1100 500" fill="none" stroke="rgba(249, 115, 22, 0.06)" strokeWidth="0.5" />
                
                <path id="topo4" d="M -100 450 Q 200 600 500 500 T 1100 700" fill="none" stroke="rgba(249, 115, 22, 0.1)" strokeWidth="1.5" />
                <path id="topo5" d="M -100 500 Q 200 650 500 550 T 1100 750" fill="none" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1" />
              </defs>

              <rect x="0" y="0" width="1024" height="608" fill="url(#grid)" />
              
              <use href="#topo1" />
              <use href="#topo2" />
              <use href="#topo3" />
              <use href="#topo4" />
              <use href="#topo5" />

              <g filter="url(#groundShadow)">
                {/* Sand Border Base */}
                <path d="M -50 120 C 200 120 250 80 450 150 S 850 200 850 350 S 650 500 450 450 S 150 580 -50 500" 
                      stroke="#b28d57" strokeWidth="94" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                {/* Sand Road */}
                <path d="M -50 120 C 200 120 250 80 450 150 S 850 200 850 350 S 650 500 450 450 S 150 580 -50 500" 
                      stroke="#d4ac75" strokeWidth="80" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="1" />
                {/* Dirt Tracks */}
                <path d="M -50 120 C 200 120 250 80 450 150 S 850 200 850 350 S 650 500 450 450 S 150 580 -50 500" 
                      stroke="#c09861" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
              </g>

              {/* Army Base Camps & Decor */}
              <g filter="url(#blackShadow)">
                {/* Base Camp 1 (Near start) */}
                <g transform="translate(180, 250) rotate(-15)">
                  {/* Tent 1 */}
                  <g transform="translate(0, 0)">
                    <rect x="-20" y="-15" width="40" height="30" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                    <path d="M -10 -8 Q 0 -2 -5 5 T -10 10" fill="#3a4018" opacity="0.6"/>
                    <path d="M 5 10 Q 8 2 12 -5" fill="#3a4018" opacity="0.5"/>
                  </g>
                  {/* Tent 2 */}
                  <g transform="translate(50, 10)">
                    <rect x="-20" y="-15" width="40" height="30" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                    <path d="M -12 8 Q -3 2 -8 -5 T -12 -12" fill="#3a4018" opacity="0.6"/>
                  </g>
                </g>
                
                {/* Checkpoint Barricade */}
                <g transform="translate(480, 80) rotate(5)">
                  <rect x="-2" y="-30" width="4" height="60" fill="#64748b" />
                  <line x1="-2" y1="-30" x2="25" y2="0" stroke="#111" strokeWidth="1.5" />
                  <rect x="22" y="-4" width="6" height="8" fill="#475569" stroke="#111" />
                  {/* Sandbags */}
                  <path d="M -10 -40 Q -5 -45 0 -40 Q 5 -45 10 -40 Q 15 -45 20 -40 L 20 -30 L -10 -30 Z" fill="#d4d4d8" stroke="#71717a" strokeWidth="1" />
                  <circle cx="5" cy="-35" r="4" fill="#3f3f46" />
                </g>

                {/* Base Camp 2 (Top right) */}
                <g transform="translate(680, 90) rotate(30)">
                  <g transform="translate(0, 0)">
                    <rect x="-20" y="-15" width="40" height="30" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                  <g transform="translate(-45, -20)">
                    <rect x="-20" y="-15" width="40" height="30" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                  <g transform="translate(0, -50)">
                    <rect x="-20" y="-15" width="40" height="30" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                </g>

                {/* Base Camp 3 (Top Left) */}
                <g transform="translate(140, 50) rotate(5)">
                  <g transform="translate(0, 0)">
                    <rect x="-20" y="-15" width="40" height="30" fill="#4b5320" rx="2" stroke="#2b3011" strokeWidth="1.5"/>
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#2b3011" strokeWidth="2" />
                    <circle cx="0" cy="0" r="1.5" fill="#2b3011" />
                  </g>
                  {/* Parked Vehicles */}
                  <g transform="translate(50, -10) rotate(-10)">
                    <rect x="-15" y="-8" width="30" height="16" rx="2" fill="#324a38" stroke="#111" />
                    <rect x="-8" y="-6" width="20" height="12" fill="#223326" />
                  </g>
                  <g transform="translate(90, 0) rotate(-5)">
                    <rect x="-15" y="-8" width="30" height="16" rx="2" fill="#324a38" stroke="#111" />
                    <rect x="-8" y="-6" width="20" height="12" fill="#223326" />
                  </g>
                </g>

                {/* Base Camp 4 (Bottom Right Airfield) */}
                <g transform="translate(860, 500)">
                  <g transform="translate(0, -40)">
                    <rect x="-30" y="-20" width="60" height="40" fill="#3e451b" rx="4" stroke="#2b3011" strokeWidth="2"/>
                    <line x1="-30" y1="-10" x2="30" y2="-10" stroke="#2b3011" strokeWidth="2" />
                    <line x1="-30" y1="10" x2="30" y2="10" stroke="#2b3011" strokeWidth="2" />
                  </g>
                  {/* Grounded Planes */}
                  <g transform="translate(-60, 40) rotate(-15)">
                    <path d="M-20,-4 L25,0 L-20,4 Z" fill="#64748b" stroke="#111" strokeWidth="1" />
                    <path d="M-5,-20 L10,0 L-5,20 Z" fill="#475569" stroke="#111" strokeWidth="1" />
                    <circle cx="10" cy="0" r="3" fill="#0ea5e9" stroke="#111" strokeWidth="1" />
                  </g>
                  <g transform="translate(30, 60) rotate(-40)">
                    <path d="M-20,-4 L25,0 L-20,4 Z" fill="#64748b" stroke="#111" strokeWidth="1" />
                    <path d="M-5,-20 L10,0 L-5,20 Z" fill="#475569" stroke="#111" strokeWidth="1" />
                    <circle cx="10" cy="0" r="3" fill="#0ea5e9" stroke="#111" strokeWidth="1" />
                  </g>
                </g>
              </g>

              {/* Glowing Entry / Exit Portals */}
              <circle cx="0" cy="120" r="40" fill="#f97316" opacity="0.05" filter="url(#neonGlow)" />
              <line x1="0" y1="70" x2="0" y2="170" stroke="#f97316" strokeWidth="4" filter="url(#neonGlow)" />
              <line x1="-15" y1="70" x2="-15" y2="170" stroke="#f97316" strokeWidth="2" opacity="0.4" />
              
              <circle cx="0" cy="500" r="40" fill="#f97316" opacity="0.05" filter="url(#neonGlow)" />
              <line x1="0" y1="450" x2="0" y2="550" stroke="#f97316" strokeWidth="4" filter="url(#neonGlow)" />
              <line x1="-15" y1="450" x2="-15" y2="550" stroke="#f97316" strokeWidth="2" opacity="0.4" />

              {/* Render Enemies */}
              {gameState.enemies.map(enemy => (
                <g key={enemy.id} transform={`translate(${enemy.x}, ${enemy.y}) rotate(${enemy.rotation || 0})`}>
                  
                  {/* Health Bar */}
                  <g transform={`rotate(${-(enemy.rotation || 0)}) translate(-15, -25)`}>
                    <rect width="30" height="4" fill="#111" rx="2" />
                    <rect width={30 * (enemy.hp / enemy.maxHp)} height="4" fill="#f97316" rx="2" />
                  </g>

                  {/* Enemy Visuals based on Type */}
                  {enemy.type === 'jeep' && (
                    <motion.g 
                      initial={{ y: 0 }}
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.5, repeat: Infinity }}
                      filter="url(#unitShadow)"
                    >
                      {/* Detailed Jeep Body with camo */}
                      <rect x="-16" y="-12" width="32" height="24" rx="4" fill="url(#camoJungle)" stroke="#111" strokeWidth="1" />
                      {/* Inner darker section */}
                      <rect x="-12" y="-10" width="24" height="20" rx="3" fill="url(#camoDesert)" opacity="0.6" stroke="#111" strokeWidth="0.5" />
                      
                      {/* Windshield */}
                      <rect x="0" y="-8" width="8" height="16" fill="url(#glass)" stroke="#fff" strokeWidth="0.5" opacity="0.8" />
                      
                      {/* Wheels */}
                      <rect x="-12" y="-16" width="10" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />
                      <rect x="-12" y="10" width="10" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />
                      <rect x="6" y="-16" width="8" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />
                      <rect x="6" y="10" width="8" height="6" rx="2" fill="#111" stroke="#000" strokeWidth="1" />

                      {/* Headlights */}
                      <circle cx="16" cy="-8" r="2" fill="#ffedd5" filter="url(#neonGlow)" />
                      <circle cx="16" cy="8" r="2" fill="#ffedd5" filter="url(#neonGlow)" />
                      {/* Light beams */}
                      <polygon points="17,-8 40,-16 40,0" fill="#fff" opacity="0.1" />
                      <polygon points="17,8 40,0 40,16" fill="#fff" opacity="0.1" />
                    </motion.g>
                  )}

                  {enemy.type === 'tank' && (
                    <g filter="url(#unitShadow)">
                      {/* Treads */}
                      <rect x="-22" y="-18" width="44" height="10" rx="2" fill="url(#metal)" stroke="#000" strokeWidth="1" />
                      <rect x="-22" y="8" width="44" height="10" rx="2" fill="url(#metal)" stroke="#000" strokeWidth="1" />
                      
                      {/* Main Body */}
                      <path d="M -16 -12 L 14 -12 L 20 -4 L 20 4 L 14 12 L -16 12 Z" fill="url(#camoDesert)" stroke="#1c291f" strokeWidth="1.5" />
                      
                      {/* Engine Details */}
                      <rect x="-14" y="-8" width="8" height="16" fill="#1a2e21" stroke="#111" strokeWidth="0.5" />
                      <line x1="-12" y1="-6" x2="-12" y2="6" stroke="#000" strokeWidth="1" />
                      <line x1="-10" y1="-6" x2="-10" y2="6" stroke="#000" strokeWidth="1" />
                      <line x1="-8" y1="-6" x2="-8" y2="6" stroke="#000" strokeWidth="1" />

                      {/* Turret Base */}
                      <circle cx="2" cy="0" r="12" fill="url(#camoJungle)" stroke="#000" strokeWidth="1.5" />
                      <circle cx="2" cy="0" r="6" fill="#111" opacity="0.8" />

                      {/* Cannon */}
                      <rect x="8" y="-3" width="28" height="6" fill="url(#metal)" stroke="#000" strokeWidth="1" />
                      <rect x="34" y="-4" width="6" height="8" fill="#111" />
                      <line x1="8" y1="0" x2="34" y2="0" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
                    </g>
                  )}

                  {enemy.type === 'apc' && (
                    <g filter="url(#unitShadow)">
                      {/* Wheels - 6 wheeled */}
                      <rect x="-16" y="-14" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="0" y="-14" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="16" y="-14" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      
                      <rect x="-16" y="8" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="0" y="8" width="8" height="6" rx="2" fill="#111" stroke="#000" />
                      <rect x="16" y="8" width="8" height="6" rx="2" fill="#111" stroke="#000" />

                      {/* Armored Body */}
                      <path d="M -22 -10 L 22 -10 L 26 -4 L 26 4 L 22 10 L -22 10 Z" fill="url(#camoUrban)" stroke="#111" strokeWidth="1.5" />
                      
                      {/* Hatches and Details */}
                      <rect x="-14" y="-6" width="20" height="12" fill="url(#metal)" opacity="0.8" stroke="#111" strokeWidth="0.5" />
                      <circle cx="-4" cy="0" r="4" fill="#111" stroke="#333" />
                      <circle cx="8" cy="0" r="4" fill="#111" stroke="#333" />
                      
                      {/* Turret */}
                      <circle cx="16" cy="0" r="5" fill="#222" stroke="#111" strokeWidth="1" />
                      <rect x="16" y="-1" width="12" height="2" fill="url(#metal)" stroke="#000" strokeWidth="0.5" />
                    </g>
                  )}

                  {enemy.type === 'squad' && (
                    <g filter="url(#blackShadow)">
                      {/* Solider 1 */}
                      <g transform="translate(6, 6)">
                        <circle cx="0" cy="0" r="4.5" fill="url(#camoJungle)" stroke="#111" strokeWidth="1" />
                        <rect x="2" y="-1" width="12" height="2" fill="#111" />
                        <circle cx="1" cy="0" r="2.5" fill="#000" />
                      </g>
                      {/* Solider 2 */}
                      <g transform="translate(-5, -5)">
                        <circle cx="0" cy="0" r="4.5" fill="url(#camoJungle)" stroke="#111" strokeWidth="1" />
                        <rect x="2" y="-1" width="10" height="2" fill="#111" />
                        <circle cx="1" cy="0" r="2.5" fill="#000" />
                      </g>
                      {/* Solider 3 */}
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
                      {/* Big Wheels */}
                      <rect x="-10" y="-10" width="10" height="5" rx="2" fill="#111" stroke="#000" />
                      <rect x="8" y="-10" width="10" height="5" rx="2" fill="#111" stroke="#000" />
                      <rect x="-10" y="5" width="10" height="5" rx="2" fill="#111" stroke="#000" />
                      <rect x="8" y="5" width="10" height="5" rx="2" fill="#111" stroke="#000" />

                      {/* Frame */}
                      <path d="M -12 -5 L 12 -4 L 14 0 L 12 4 L -12 5 Z" fill="#b45309" stroke="#111" strokeWidth="1" />
                      
                      {/* Roll Cage */}
                      <path d="M -6 -4 L 6 -4 L 6 4 L -6 4 Z" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                      <line x1="-6" y1="-4" x2="6" y2="4" stroke="#e2e8f0" strokeWidth="1" />
                      <line x1="-6" y1="4" x2="6" y2="-4" stroke="#e2e8f0" strokeWidth="1" />

                      {/* Engine */}
                      <rect x="-14" y="-3" width="4" height="6" fill="url(#metal)" stroke="#111" />
                      
                      {/* Driver */}
                      <circle cx="0" cy="0" r="3" fill="#111" />
                      <circle cx="0" cy="0" r="1.5" fill="#ef4444" />
                    </motion.g>
                  )}

                  {enemy.type === 'heavy_tank' && (
                    <g filter="url(#unitShadow)">
                      {/* Quad Treads */}
                      <rect x="-26" y="-22" width="52" height="12" rx="3" fill="url(#metal)" stroke="#111" strokeWidth="1.5" />
                      <rect x="-26" y="10" width="52" height="12" rx="3" fill="url(#metal)" stroke="#111" strokeWidth="1.5" />
                      <rect x="-18" y="-23" width="36" height="46" fill="#111" />

                      {/* Main Chassis */}
                      <path d="M -22 -16 L 20 -16 L 30 -8 L 30 8 L 20 16 L -22 16 Z" fill="url(#camoDesert)" stroke="#111" strokeWidth="2" />
                      {/* Details & Panels */}
                      <rect x="-16" y="-10" width="12" height="20" fill="url(#metal)" opacity="0.6" stroke="#111" />
                      <rect x="-2" y="-10" width="18" height="20" fill="url(#camoUrban)" rx="2" stroke="#111" />

                      {/* Massive Turret */}
                      <circle cx="4" cy="0" r="18" fill="url(#camoJungle)" stroke="#111" strokeWidth="2" />
                      <circle cx="4" cy="0" r="10" fill="#111" opacity="0.7" />
                      
                      {/* Dual Cannons */}
                      <rect x="20" y="-7" width="36" height="5" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      <rect x="20" y="2" width="36" height="5" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      
                      {/* Muzzles */}
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
                      {/* Rotors */}
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
                      {/* Jet fighter shape */}
                      <path d="M -15 -14 L -5 0 L -15 14 Z" fill="url(#metal)" stroke="#111" strokeWidth="0.5" />
                      <path d="M -10 -25 L 8 0 L -10 25 Z" fill="url(#camoUrban)" stroke="#111" strokeWidth="1" />
                      <path d="M -5 -5 L 24 0 L -5 5 Z" fill="url(#metal)" stroke="#111" strokeWidth="0.5" />
                      {/* Cockpit */}
                      <ellipse cx="6" cy="0" rx="6" ry="2" fill="url(#glass)" />
                      {/* Engine Exhaust */}
                      <circle cx="-12" cy="-8" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                      <circle cx="-12" cy="8" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                      <polygon points="-14,-8 -24,-10 -24,-6" fill="#f97316" opacity="0.8" filter="url(#neonGlow)" />
                      <polygon points="-14,8 -24,6 -24,10" fill="#f97316" opacity="0.8" filter="url(#neonGlow)" />
                    </motion.g>
                  )}

                  {enemy.type === 'stealth_heli' && (
                    <motion.g 
                      initial={{ scale: 1.1 }}
                      animate={{ scale: [1.1, 1.15, 1.1] }} 
                      transition={{ duration: 0.5, repeat: Infinity }}
                      filter="url(#unitShadow)"
                      className="opacity-90"
                    >
                      {/* Body */}
                      <path d="M -14 -6 L 18 -5 L 24 0 L 18 5 L -14 6 Z" fill="#0f172a" stroke="#000" strokeWidth="1.5" />
                      {/* Cockpit */}
                      <path d="M 8 -3 L 18 -2 L 18 2 L 8 3 Z" fill="url(#glass)" opacity="0.8" />
                      {/* Tail */}
                      <rect x="-28" y="-1.5" width="14" height="3" fill="#1e293b" />
                      <path d="M -28 -6 L -24 -1.5 L -28 3 Z" fill="#0f172a" stroke="#000" strokeWidth="0.5" />
                      {/* Rotors */}
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
                      {/* Fuselage */}
                      <polygon points="-24,-6 24,0 -24,6" fill="#1e293b" stroke="#111" strokeWidth="1.5" />
                      {/* Enormous wings */}
                      <polygon points="-5,0 -15,-30 8,0 -15,30" fill="url(#camoJungle)" stroke="#111" strokeWidth="1.5" />
                      {/* Cockpit */}
                      <ellipse cx="12" cy="0" rx="4" ry="2" fill="url(#glass)" />
                      <circle cx="12" cy="0" r="2" fill="#ef4444" opacity="0.5" filter="url(#neonGlow)" />
                      {/* Jet trails */}
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
                      {/* Headlight */}
                      <circle cx="8" cy="0" r="1.5" fill="#fde047" filter="url(#neonGlow)" />
                      <polygon points="9,-4 25,-12 25,12 9,4" fill="#fef08a" opacity="0.2" />
                      <circle cx="-2" cy="0" r="2" fill="#111" />
                    </g>
                  )}

                  {enemy.type === 'medic_truck' && (
                    <g filter="url(#unitShadow)">
                      {/* Wheels */}
                      <rect x="-14" y="-10" width="8" height="4" rx="1" fill="#111" />
                      <rect x="8" y="-10" width="8" height="4" rx="1" fill="#111" />
                      <rect x="-14" y="6" width="8" height="4" rx="1" fill="#111" />
                      <rect x="8" y="6" width="8" height="4" rx="1" fill="#111" />
                      
                      {/* Body */}
                      <rect x="-16" y="-8" width="32" height="16" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
                      {/* Cab */}
                      <rect x="8" y="-6" width="6" height="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
                      <rect x="10" y="-4" width="3" height="8" fill="url(#glass)" />
                      
                      {/* Red cross on top */}
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
                      {/* Mech Legs */}
                      <path d="M 0 0 L -8 -12 L -14 -12" fill="none" stroke="url(#metal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 0 0 L -8 12 L -14 12" fill="none" stroke="url(#metal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 0 0 L 10 -12 L 16 -12" fill="none" stroke="url(#camoUrban)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 0 0 L 10 12 L 16 12" fill="none" stroke="url(#camoUrban)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Mech Torso */}
                      <rect x="-14" y="-14" width="28" height="28" rx="4" fill="url(#camoUrban)" stroke="#111" strokeWidth="2" />
                      
                      {/* Reactor Core */}
                      <circle cx="0" cy="0" r="8" fill="#1e293b" />
                      <circle cx="0" cy="0" r="4" fill="#0ea5e9" filter="url(#neonGlow)" className="animate-pulse" />
                      
                      {/* Cockpit */}
                      <rect x="8" y="-6" width="8" height="12" rx="2" fill="url(#glass)" stroke="#111" />
                      
                      {/* Heavy Cannons */}
                      <rect x="14" y="-18" width="20" height="6" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      <rect x="14" y="12" width="20" height="6" fill="url(#metal)" stroke="#111" strokeWidth="1" />
                      
                      {/* Laser sights */}
                      <line x1="34" y1="-15" x2="60" y2="-15" stroke="#ef4444" strokeWidth="0.5" opacity="0.6" />
                      <line x1="34" y1="15" x2="60" y2="15" stroke="#ef4444" strokeWidth="0.5" opacity="0.6" />
                    </motion.g>
                  )}

                </g>
              ))}

              {/* Render Projectiles */}
              {gameState.projectiles.map(proj => {
                 let projColor = "#fff";
                 if (proj.towerType === 'mitrailleuse') projColor = "#f97316"; // Green
                 else if (proj.towerType === 'canon') projColor = "#3b82f6"; // Blue
                 else if (proj.towerType === 'mortier') projColor = "#f97316"; // Orange
                 else if (proj.towerType === 'dca') projColor = "#06b6d4"; // Cyan
                 else projColor = "#ef4444"; // Red

                 return (
                  <g key={proj.id} transform={`translate(${proj.x}, ${proj.y})`}>
                     <circle cx="0" cy="0" r="3" fill={projColor} filter="url(#neonGlow)" />
                     <motion.circle 
                       initial={{ r: 0, opacity: 1 }}
                       animate={{ r: 10, opacity: 0 }}
                       transition={{ duration: 0.3 }}
                       fill={projColor} 
                     />
                  </g>
                 );
              })}
              
              {/* Range ring for selected turret */}
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

              {/* Perfectly Aligned Turret Placements inside SVG coordinate space */}
              {/* Allow clicking on these elements since the svg itself ignores pointer events */}
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
                    <TurretSlot 
                      key={slot.id} 
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
                  )
                })}
              </g>

              {/* Render Airstrikes */}
              {gameState.activeAirstrikes && gameState.activeAirstrikes.map(strike => (
                <motion.g 
                  key={strike.id}
                  initial={{ x: -200 }}
                  animate={{ x: 1200 }}
                  transition={{ duration: 3.5, ease: "linear" }}
                >
                  {/* Bomber 1 */}
                  <g transform="translate(0, 100) scale(1.5)" style={{ filter: 'drop-shadow(0px 40px 20px rgba(0,0,0,0.6))' }}>
                     {/* Fuselage */}
                     <polygon points="-20,-5 20,0 -20,5" fill="#1c1917" stroke="#111" strokeWidth="1" />
                     {/* Wings */}
                     <polygon points="-5,0 -25,-35 5,0 -25,35" fill="#292524" stroke="#111" strokeWidth="1" />
                     <circle cx="10" cy="0" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                     
                     {/* Trail */}
                     <line x1="-20" y1="-3" x2="-80" y2="-3" stroke="white" strokeWidth="1" opacity="0.3" />
                     <line x1="-20" y1="3" x2="-80" y2="3" stroke="white" strokeWidth="1" opacity="0.3" />
                  </g>
                  {/* Bomber 2 */}
                  <g transform="translate(-100, 300) scale(1.5)" style={{ filter: 'drop-shadow(0px 40px 20px rgba(0,0,0,0.6))' }}>
                     <polygon points="-20,-5 20,0 -20,5" fill="#1c1917" stroke="#111" strokeWidth="1" />
                     <polygon points="-5,0 -25,-35 5,0 -25,35" fill="#292524" stroke="#111" strokeWidth="1" />
                     <circle cx="10" cy="0" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                     <line x1="-20" y1="-3" x2="-80" y2="-3" stroke="white" strokeWidth="1" opacity="0.3" />
                     <line x1="-20" y1="3" x2="-80" y2="3" stroke="white" strokeWidth="1" opacity="0.3" />
                  </g>
                  {/* Bomber 3 */}
                  <g transform="translate(-150, 500) scale(1.5)" style={{ filter: 'drop-shadow(0px 40px 20px rgba(0,0,0,0.6))' }}>
                     <polygon points="-20,-5 20,0 -20,5" fill="#1c1917" stroke="#111" strokeWidth="1" />
                     <polygon points="-5,0 -25,-35 5,0 -25,35" fill="#292524" stroke="#111" strokeWidth="1" />
                     <circle cx="10" cy="0" r="2" fill="#ef4444" filter="url(#neonGlow)" />
                     <line x1="-20" y1="-3" x2="-80" y2="-3" stroke="white" strokeWidth="1" opacity="0.3" />
                     <line x1="-20" y1="3" x2="-80" y2="3" stroke="white" strokeWidth="1" opacity="0.3" />
                  </g>
                  {/* Giant explosion effect logic would be cool but we can just add a full screen flash animation */}
                </motion.g>
              ))}
              
              {gameState.activeAirstrikes && gameState.activeAirstrikes.length > 0 && (
                 <motion.rect
                   initial={{ opacity: 0 }}
                   animate={{ opacity: [0, 0.4, 0.1, 0.6, 0] }}
                   transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.6, 1], ease: "easeInOut", delay: 0.5 }}
                   x="0" y="0" width="1000" height="700" fill="#f97316" style={{ mixBlendMode: 'color-dodge' }} pointerEvents="none"
                 />
              )}

            </svg>


            {/* Particles / Lights over the map */}
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
         {/* Build Slot Graphics */}
         <circle cx="0" cy="0" r="24" fill="#ffffff" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-50 group-hover:opacity-100 group-hover:fill-[#3b82f6] group-hover:fill-opacity-30 transition-all" />
         <circle cx="0" cy="0" r="14" fill="none" stroke="#2563eb" strokeWidth="1" className="opacity-40 group-hover:opacity-100" />
         <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="#1d4ed8" strokeWidth="2" className="opacity-70 group-hover:opacity-100" />
         <circle cx="0" cy="0" r="3" fill="#1d4ed8" className="opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-transform" />
         <text x="0" y="36" textAnchor="middle" fill="#1d4ed8" fontSize="9" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest bg-white/50 px-1 rounded">DÉPLOYER</text>
      </g>
    )
  }

  // Built Turret
  let accentColor = "#ef4444";
  if (type === 'mitrailleuse') accentColor = "#f97316";
  else if (type === 'canon') accentColor = "#3b82f6";
  else if (type === 'mortier') accentColor = "#f97316";
  else if (type === 'dca') accentColor = "#06b6d4";

  const isDisabled = disabledUntil > performance.now();
  const showGlow = selected || isDisabled;

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer group">
      {/* Subtle Pulsing Glow Effect */}
      {showGlow && (
        <circle cx="0" cy="0" r="26" fill={isDisabled ? "#3b82f6" : accentColor} fillOpacity="0.25" className="animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" filter="url(#neonGlow)" />
      )}

      {/* Platform/Base */}
      {selected && (
        <g>
          <circle cx="0" cy="0" r="28" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[spin_4s_linear_infinite] opacity-80" />
          <circle cx="0" cy="0" r="30" fill="none" stroke={accentColor} strokeWidth="1" className="opacity-40" />
        </g>
      )}

      {/* Upgrade Visual Effects */}
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
      
      {/* Level Indicator Stars/Chevrons */}
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

      {/* Turret Body (Point towards target, default 0 or constantly rotating) */}
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
             <circle cx="0" cy="0" r="12" fill="#431407" stroke={accentColor} strokeWidth="2" />
             <circle cx="0" cy="0" r="6" fill="#000" />
             <rect x="-14" y="-2" width="28" height="4" fill="#111" />
             <rect x="-2" y="-14" width="4" height="28" fill="#111" />
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

      {/* Level indicator */}
      <rect x="-11" y="-32" width="22" height="12" rx="2" fill="#000" stroke={accentColor} strokeWidth="0.5" className="opacity-80 drop-shadow-md" />
      <text x="0" y="-23" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">L{level}</text>

      {/* Disabled / EMP status overlay */}
      {isDisabled && (
        <g>
          <circle cx="0" cy="0" r="16" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
          <path d="M -10 -10 L 10 10 M -10 10 L 10 -10" stroke="#60a5fa" strokeWidth="3" opacity="0.8" />
        </g>
      )}
    </g>
  );
}
