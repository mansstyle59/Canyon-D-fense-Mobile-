import { useState } from 'react';
import { Play, Pause, Crosshair, Zap, Target, Flame, Rocket, AlertTriangle, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TOWER_CONFIGS } from './constants';
import { GameBoard } from './components/GameBoard';
import { TowerType } from './types';

import { useGameEngine } from './hooks/useGameEngine';

export default function App() {
  const { gameState, buildTurret, upgradeTurret, togglePause, startWave, callAirstrike } = useGameEngine();
  const { money, lives, level, wave, maxWaves, status, waveActive, lastAirstrikeTime } = gameState;
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
  const [selectedTurretId, setSelectedTurretId] = useState<string | null>(null);

  const formatMoney = (val: number) => Math.floor(val).toLocaleString('en-US');

  const airstrikeAvailable = wave >= 5;
  const airstrikeCooldown = Math.max(0, 20000 - (Date.now() - lastAirstrikeTime));
  const airstrikeReady = airstrikeAvailable && airstrikeCooldown <= 0 && status === 'playing';

  return (
    <div className="relative h-screen w-screen bg-[#e6dcc3] overflow-hidden text-stone-900 font-sans select-none">
      {/* Background Map Layer */}
      <div className="absolute top-16 md:top-24 bottom-36 md:bottom-44 left-0 right-0 z-0 border-y border-[#3a352a]/50">
        <GameBoard 
           gameState={gameState} 
           buildTurret={buildTurret} 
           selectedTower={selectedTower}
           setSelectedTower={setSelectedTower} 
           selectedTurretId={selectedTurretId}
           setSelectedTurretId={setSelectedTurretId}
        />
      </div>

      {/* Floating HUD (Top) */}
      <AnimatePresence>
        {status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-900/40 backdrop-blur-sm z-50 flex items-center justify-center flex-col pointer-events-auto"
          >
             <h1 className="text-6xl font-bold text-red-500 mb-4 tracking-widest uppercase" style={{ textShadow: '0 0 40px red'}}>Mission Échouée</h1>
             <p className="text-xl text-red-200">Le noyau a été compromis.</p>
             <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 rounded font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(220,38,38,0.5)]">Recommencer le Niveau {level}</button>
             
             {level > 1 && (
                <button onClick={() => {
                  localStorage.setItem('defense_level', '1');
                  window.location.reload();
                }} className="mt-4 px-4 py-2 text-sm text-red-300/60 hover:text-red-200 border border-red-400/20 hover:border-red-400/50 rounded uppercase tracking-widest transition-colors">Retourner au Niveau 1</button>
             )}
          </motion.div>
        )}
        {status === 'victory' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-orange-900/40 backdrop-blur-sm z-50 flex items-center justify-center flex-col pointer-events-auto"
          >
             <h1 className="text-6xl font-bold text-orange-400 mb-4 tracking-widest uppercase" style={{ textShadow: '0 0 40px #f97316'}}>Victoire</h1>
             <p className="text-xl text-orange-200">Le niveau {level} est sécurisé.</p>
             <button onClick={() => {
               localStorage.setItem('defense_level', String(level + 1));
               window.location.reload();
             }} className="mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(234,88,12,0.5)]">Niveau Suivant</button>
             
             {level > 1 && (
                <button onClick={() => {
                  localStorage.setItem('defense_level', '1');
                  window.location.reload();
                }} className="mt-4 px-4 py-2 text-sm text-orange-300/60 hover:text-orange-200 border border-orange-400/20 hover:border-orange-400/50 rounded uppercase tracking-widest transition-colors">Recommencer Niveau 1</button>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-2 left-4 right-4 md:top-6 md:left-8 md:right-8 flex items-start justify-between z-40 pointer-events-none">
        
        {/* Top Left: Stats */}
        <div className="flex gap-2 md:gap-4 pointer-events-auto">
          <div className="bg-[#fcf7e8]/90 backdrop-blur-xl border border-[#d4c3a3] rounded-xl px-4 py-2 md:px-6 md:py-3 flex items-center gap-3 md:gap-6 shadow-xl">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-[#a16223] font-bold opacity-80 mb-0.5 md:mb-1">Niveau</span>
              <span className="text-sm md:text-xl font-mono tracking-tighter leading-none text-stone-800">{level}</span>
            </div>
            <div className="w-px h-6 md:h-8 bg-[#d4c3a3]"></div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-green-700 font-bold opacity-80 mb-0.5 md:mb-1">Vague</span>
              <span className="text-sm md:text-xl font-mono tracking-tighter leading-none text-stone-800">{wave} <span className="text-stone-500 text-xs md:text-sm">/ {maxWaves}</span></span>
            </div>
            <div className="w-px h-6 md:h-8 bg-[#d4c3a3]"></div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-red-700 font-bold opacity-80 mb-0.5 md:mb-1">Vies</span>
              <span className="text-sm md:text-xl font-mono tracking-tighter leading-none text-red-700">{lives}</span>
            </div>
            <div className="w-px h-6 md:h-8 bg-[#d4c3a3]"></div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-[#a16223] font-bold opacity-80 mb-0.5 md:mb-1">Fonds</span>
              <span className="text-sm md:text-xl font-mono text-stone-800 leading-none">${formatMoney(money)}</span>
            </div>
          </div>
        </div>

        {/* Top Right: Core & Controls */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          {!waveActive && status === 'playing' && (
            <button 
              onClick={startWave}
              className="group relative overflow-hidden bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-4 py-2 md:px-5 md:py-2.5 shadow-[0_0_20px_rgba(234,88,12,0.4)] border border-orange-400/50 transition-transform active:scale-95 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-white/20 to-orange-400/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white" />
              <span className="uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] drop-shadow-md">Lancer Vague</span>
            </button>
          )}

          <div className="bg-[#fcf7e8]/90 backdrop-blur-xl border border-[#d4c3a3] p-1 md:p-1.5 rounded-xl shadow-xl">
            <button 
              onClick={togglePause} 
              disabled={status === 'game_over' || status === 'victory'}
              className={`group flex items-center justify-center rounded-lg px-4 py-2 md:px-5 md:py-2.5 transition-all active:scale-95 border ${status === 'playing' ? 'bg-[#eee6d3] hover:bg-[#e0d5ba] border-[#cbb790] text-stone-800' : 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800 shadow-sm'}`}
            >
              {status === 'playing' ? (
                <div className="flex items-center gap-2">
                  <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                  <span className="uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px]">Pause</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                  <span className="uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px]">Reprendre</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Arsenal Bar (Bottom) */}
      <div className="absolute bottom-2 md:bottom-8 left-0 right-0 flex flex-col items-center justify-center z-40 pointer-events-none px-2 space-y-2">
        <div className="w-full max-w-max flex flex-col items-center">
          {/* Top of the menu actions (or Upgrade Panel) */}
          <div className="w-full flex justify-between items-end mb-2 px-2">
            <div className="flex-1 pointer-events-auto flex justify-start">
              {/* Upgrade Panel */}
              <AnimatePresence>
                {selectedTurretId && gameState.turrets[selectedTurretId] ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-[#1c1a17]/95 backdrop-blur-md border-[2px] border-[#3a352a] p-3 md:p-4 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] min-w-[200px] md:min-w-[240px] relative overflow-hidden"
                  >
                    {/* Tactical lines */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#fb923c] to-transparent opacity-30"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#fb923c]"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#fb923c]"></div>

                    {(() => {
                      const turret = gameState.turrets[selectedTurretId];
                      const config = TOWER_CONFIGS[turret.type];
                      const upgradeCost = Math.floor(config.cost * Math.pow(1.5, turret.level));
                      const canAffordUpgrade = money >= upgradeCost;
                      const nextDamage = Math.floor(turret.damage * 1.4);
                      const nextRange = Math.floor(turret.range * 1.1);
                      const nextFireRate = parseFloat((turret.fireRate * 1.1).toFixed(2));
                      
                      return (
                        <div className="flex flex-col gap-2 md:gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xs md:text-sm font-bold text-orange-500 uppercase tracking-widest drop-shadow-[0_0_2px_rgba(249,115,22,0.8)]">{config.name} <span className="text-[#e8dcc4]">LVL {turret.level}</span></h3>
                              <p className="text-[9px] md:text-[10px] text-orange-500/50 uppercase tracking-widest font-mono">Panel d'Amélioration</p>
                              <p className="text-[9px] font-medium text-[#e8dcc4] mt-1 leading-snug">{config.desc}</p>
                              <div className="flex items-center gap-2 text-[8px] font-mono text-[#a38580] mt-1 uppercase tracking-wider">
                                <span>Cibles: {config.targetsAir && config.targetsGround ? 'SOL/AIR' : config.targetsAir ? 'AIR' : 'SOL'}</span>
                                {config.armorPiercing && <span className="text-orange-500">PERCE-BLINDAGE</span>}
                              </div>
                            </div>
                            <button onClick={() => setSelectedTurretId(null)} className="text-[#a38580] hover:text-red-400 p-1 bg-black/30 rounded border border-white/5">
                              ✕
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1 md:gap-2 text-[10px] md:text-xs">
                            <div className="flex flex-col bg-[#0a0907] rounded p-1.5 border border-[#3a352a] shadow-inner">
                              <span className="text-[#d4c3a3] text-[7px] md:text-[8px] tracking-widest uppercase mb-1">Dégâts</span>
                              <div className="flex items-center gap-0.5 md:gap-1">
                                <span className="font-mono text-white/80">{turret.damage}</span>
                                <span className="text-orange-500 font-bold text-[8px] md:text-xs mx-0.5">→</span>
                                <span className="font-mono text-[#a3e635] drop-shadow-[0_0_2px_rgba(163,230,53,0.5)] font-bold">{nextDamage}</span>
                              </div>
                            </div>
                            <div className="flex flex-col bg-[#0a0907] rounded p-1.5 border border-[#3a352a] shadow-inner">
                              <span className="text-[#d4c3a3] text-[7px] md:text-[8px] tracking-widest uppercase mb-1">Portée</span>
                              <div className="flex items-center gap-0.5 md:gap-1">
                                <span className="font-mono text-white/80">{turret.range}</span>
                                <span className="text-orange-500 font-bold text-[8px] md:text-xs mx-0.5">→</span>
                                <span className="font-mono text-[#a3e635] drop-shadow-[0_0_2px_rgba(163,230,53,0.5)] font-bold">{nextRange}</span>
                              </div>
                            </div>
                            <div className="flex flex-col bg-[#0a0907] rounded p-1.5 border border-[#3a352a] shadow-inner">
                              <span className="text-[#d4c3a3] text-[7px] md:text-[8px] tracking-widest uppercase mb-1">Cadence</span>
                              <div className="flex items-center gap-0.5 md:gap-1">
                                <span className="font-mono text-white/80">{turret.fireRate}</span>
                                <span className="text-orange-500 font-bold text-[8px] md:text-xs mx-0.5">→</span>
                                <span className="font-mono text-[#a3e635] drop-shadow-[0_0_2px_rgba(163,230,53,0.5)] font-bold">{nextFireRate}</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => upgradeTurret(selectedTurretId)}
                            disabled={!canAffordUpgrade || status !== 'playing'}
                            className={`w-full py-1.5 md:py-2 mt-1 rounded font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all ${canAffordUpgrade && status === 'playing' ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)] border border-orange-500' : 'bg-black/40 text-white/30 border border-white/5 cursor-not-allowed'}`}
                          >
                            UPGRADE [ ${formatMoney(upgradeCost)} ]
                          </button>
                        </div>
                      );
                    })()}
                  </motion.div>
                ) : !selectedTower ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-1.5 bg-[#1c1a17]/95 backdrop-blur-md border border-[#3a352a] px-4 py-2.5 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.5)] max-w-[300px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-sm animate-pulse shadow-[0_0_8px_#f97316]"></div>
                      <span className="text-[9px] md:text-[10px] text-orange-400 font-bold uppercase tracking-widest font-mono">EN ATTENTE D'ORDRES</span>
                    </div>
                    <ul className="text-[9px] text-[#a38580] space-y-1 mt-1 font-medium list-disc list-inside">
                      <li>Sélectionnez un armement pour le déployer</li>
                      <li>Touchez une tourelle pour l'améliorer</li>
                      <li>Blindages: Les armes non perce-blindage perdent 70% de dégâts.</li>
                      <li>Antiaérien: Seules les DCA / Missiles touchent les volants.</li>
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            
            <div className="flex-shrink-0 mx-4 max-w-[300px]">
              {selectedTower && (
                <div className="bg-[#1c1a17]/95 backdrop-blur border border-[#3a352a] rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#3a352a] flex items-center gap-2 bg-[#2a261f]">
                    <div className="w-1.5 h-1.5 bg-[#a3e635] rounded-sm animate-pulse shadow-[0_0_5px_rgba(163,230,53,0.8)]"></div>
                    <span className="text-[#a3e635] font-mono text-[9px] md:text-[10px] tracking-widest uppercase font-bold drop-shadow-[0_0_2px_rgba(163,230,53,0.5)]">
                      SÉLECTIONNEZ UNE ZONE
                    </span>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[10px] md:text-[11px] text-[#e8dcc4] font-medium leading-relaxed">
                      {TOWER_CONFIGS[selectedTower].desc}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[9px] font-mono text-[#a38580] uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        Cibles: {TOWER_CONFIGS[selectedTower].targetsAir && TOWER_CONFIGS[selectedTower].targetsGround ? 'SOL/AIR' : TOWER_CONFIGS[selectedTower].targetsAir ? 'AIR' : 'SOL'}
                      </span>
                      {TOWER_CONFIGS[selectedTower].armorPiercing && (
                        <span className="flex items-center gap-1 text-orange-400">
                          PERCE-BLINDAGE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1"></div>
          </div>

          <div className="flex flex-col relative bg-[#1c1a17]/95 backdrop-blur-md border-[2px] border-[#3a352a] shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl p-3 md:p-4 pointer-events-auto max-w-full mx-auto w-max mb-2 md:mb-6">
            {/* Tactical Decor Lines */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#fb923c] to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#fb923c] to-transparent opacity-30"></div>
            
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-orange-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-orange-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-orange-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-orange-500 rounded-br-lg"></div>

            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2a241c] border border-[#4a4031] px-6 py-1 rounded flex items-center gap-2 shadow-lg">
               <div className="w-1.5 h-1.5 bg-orange-500 rounded-sm animate-pulse shadow-[0_0_10px_#f97316]"></div>
               <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8dcc4] font-mono">Déploiement Stratégique</span>
               <div className="w-1.5 h-1.5 bg-orange-500 rounded-sm animate-pulse shadow-[0_0_10px_#f97316]"></div>
            </div>
            
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-4 overflow-x-auto px-2 pb-2 scrollbar-hide">
            {Object.entries(TOWER_CONFIGS).map(([key, config]) => {
            const type = key as TowerType;
            const isSelected = selectedTower === type;
            const canAfford = money >= config.cost;

            return (
              <motion.button
                key={key}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                onClick={() => {
                  if (canAfford) {
                    setSelectedTower(isSelected ? null : type);
                    setSelectedTurretId(null);
                  }
                }}
                className={`group relative w-16 h-20 md:w-24 md:h-[6.5rem] rounded bg-gradient-to-b flex flex-col items-center justify-between p-1.5 transition-all flex-shrink-0 overflow-hidden ${
                  isSelected 
                      ? 'from-[#3a2814] to-[#1a1105] border-[1.5px] border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] z-10 -translate-y-1' 
                      : canAfford
                        ? 'from-[#2a2620] to-[#14120e] border border-[#4a4031] hover:border-orange-400/50 hover:from-[#322c23] shadow-lg'
                        : 'from-[#1a1815] to-[#0a0907] border border-[#2a241c] opacity-60 cursor-not-allowed grayscale-[0.5]'
                }`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none"></div>

                {/* Top: Icon Container */}
                <div className={`relative mt-1 w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center z-10 transition-colors ${isSelected ? 'bg-orange-950/50 shadow-[inset_0_0_10px_rgba(249,115,22,0.2)]' : 'bg-black/60 group-hover:bg-black/40'}`}>
                  <div className="flex items-center justify-center">
                    {type === 'mitrailleuse' && <Crosshair className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />}
                    {type === 'canon' && <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.8)]" />}
                    {type === 'mortier' && <Flame className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />}
                    {type === 'missile' && <Rocket className="w-3.5 h-3.5 md:w-5 md:h-5 text-pink-400 drop-shadow-[0_0_5px_rgba(244,114,182,0.8)]" />}
                    {type === 'dca' && <Target className="w-3.5 h-3.5 md:w-5 md:h-5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />}
                  </div>
                </div>
                
                {/* Bottom: Name & Cost */}
                <div className="flex flex-col items-center w-full relative z-10 mt-auto mb-0.5">
                  <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest mb-1 truncate w-full text-center ${isSelected ? 'text-orange-400 drop-shadow-[0_0_2px_rgba(249,115,22,0.8)]' : 'text-[#d4c3a3] group-hover:text-white'}`}>{config.name.split(' ')[0]}</span>
                  <div className={`flex items-center justify-center w-full px-1 py-[3px] rounded block text-[8px] md:text-[10px] font-mono tracking-wider font-bold ${isSelected ? 'bg-orange-600 text-white shadow-[0_2px_5px_rgba(0,0,0,0.5)]' : canAfford ? 'text-[#a3e635] bg-[#142e14] border border-[#2e5c2e]' : 'text-red-600 bg-[#2e1414] border border-[#5c2e2e]'}`}>
                    ${formatMoney(config.cost)}
                  </div>
                </div>

                {/* Target Indicators */}
                <div className="absolute top-1 left-1 flex flex-col gap-0.5 opacity-70">
                   {config.targetsAir && (
                     <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_3px_rgba(34,211,238,0.8)]" title="Cible Aérienne">
                     </div>
                   )}
                   {config.targetsGround && (
                     <div className="w-1 h-1 bg-orange-400 rounded-sm shadow-[0_0_3px_rgba(251,146,60,0.8)]" title="Cible Terrestre">
                     </div>
                   )}
                </div>
                {config.armorPiercing && (
                  <div className="absolute top-1 right-1 opacity-70">
                    <div className="w-0 h-0 border-l-[2.5px] border-r-[2.5px] border-b-[3px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]" title="Perce-Armure"></div>
                  </div>
                )}
              </motion.button>
            );
          })}
            
            <div className="w-[1.5px] h-16 md:h-20 bg-gradient-to-b from-transparent via-[#4a4031] to-transparent mx-1 md:mx-3"></div>

             {/* Airstrike Special Ability */}
             <motion.button
                whileTap={airstrikeReady ? { scale: 0.95 } : {}}
                onClick={() => {
                  if (airstrikeReady) {
                    callAirstrike();
                  }
                }}
                className={`group relative w-16 h-20 md:w-24 md:h-[6.5rem] rounded bg-gradient-to-b flex flex-col items-center justify-between p-1.5 transition-all flex-shrink-0 overflow-hidden ${
                  airstrikeReady
                    ? 'from-[#3a1a14] to-[#1a0a05] border-[1.5px] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'from-[#1a0f0d] to-[#0a0504] border border-[#3a1c17] opacity-60 cursor-not-allowed grayscale-[0.3]'
                }`}
              >
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none"></div>

                {!airstrikeAvailable && (
                  <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center backdrop-blur-[1px]">
                     <span className="text-[9px] md:text-[10px] font-bold text-red-600 border border-red-900 bg-black/80 px-2 py-0.5 rounded -rotate-[20deg] block uppercase font-mono shadow-[0_0_10px_rgba(220,38,38,0.3)] tracking-widest">Vague 5</span>
                  </div>
                )}
                
                {/* Top: Icon */}
                <div className={`relative mt-1 w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center z-10 transition-colors ${airstrikeReady ? 'bg-red-950/50 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' : 'bg-black/60'}`}>
                  <div className="flex items-center justify-center relative">
                     <Plane className={`w-3.5 h-3.5 md:w-5 md:h-5 ${airstrikeReady ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]' : 'text-stone-500'}`} />
                  </div>
                </div>
                
                {/* Bottom: Name & Cooldown */}
                <div className="flex flex-col items-center w-full relative z-10 mt-auto mb-0.5">
                  <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest mb-1 truncate w-full text-center ${airstrikeReady ? 'text-red-400 drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]' : 'text-[#a38580]'}`}>FRAPPE</span>
                  <div className={`flex items-center justify-center w-full px-1 py-[3px] rounded block text-[8px] md:text-[10px] font-mono tracking-wider font-bold ${airstrikeReady ? 'text-white bg-red-600 shadow-[0_2px_5px_rgba(0,0,0,0.5)]' : 'text-[#a38580] bg-[#2a1310] border border-[#5c2a23]'}`}>
                    {airstrikeReady ? 'PRÊT' : airstrikeAvailable ? `${Math.ceil(airstrikeCooldown/1000)}s` : 'VERR'}
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
