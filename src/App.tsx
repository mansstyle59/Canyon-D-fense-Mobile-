import { useState, useEffect } from 'react';
import { Play, Pause, Crosshair, Zap, Target, Flame, Rocket, AlertTriangle, Plane, X, DollarSign, Trash2, RotateCcw, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TOWER_CONFIGS, TOWER_SPECIALIZATIONS } from './constants';
import { GameBoard } from './components/GameBoard';
import { TowerType } from './types';
import { triggerHaptic } from './utils/haptics';

import { useGameEngine } from './hooks/useGameEngine';

export default function App() {
  const { gameState, buildTurret, upgradeTurret, sellTurret, togglePause, startWave, callAirstrike, setTargetPriority, resetGame, startGame } = useGameEngine();
  const { money, lives, level, wave, maxWaves, status, waveActive, lastAirstrikeTime, mode, gameTime } = gameState;
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
  const [deploymentInfoHidden, setDeploymentInfoHidden] = useState(false);
  const [selectedTurretId, setSelectedTurretId] = useState<string | null>(null);
  const [sellConfirmId, setSellConfirmId] = useState<string | null>(null);
  const [isAirstrikeMode, setIsAirstrikeMode] = useState(false);
  const [ordersDismissed, setOrdersDismissed] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showSellConfirm, setShowSellConfirm] = useState(false);

  // Close upgrade panel when clicking elsewhere or after certain actions
  useEffect(() => {
    if (selectedTurretId) {
      setShowSellConfirm(false);
    }
  }, [selectedTurretId]);

  const handleSell = () => {
    if (showSellConfirm && selectedTurretId) {
      sellTurret(selectedTurretId);
      setSelectedTurretId(null);
      setShowSellConfirm(false);
      triggerHaptic('medium');
    } else {
      setShowSellConfirm(true);
      triggerHaptic('light');
    }
  };

  const getRefundValue = (turretId: string) => {
    const turret = gameState.turrets[turretId];
    if (!turret) return 0;
    const baseConfig = TOWER_CONFIGS[turret.type];
    let totalValue = baseConfig.cost;
    for (let i = 1; i < turret.level; i++) {
        const isSpec = i === 3;
        totalValue += Math.floor(baseConfig.cost * Math.pow(1.5, i) * (isSpec ? 1.5 : 1));
    }
    return Math.floor(totalValue * 0.6);
  };

  const formatMoney = (val: number) => Math.floor(val).toLocaleString('en-US');

  const TOWER_COLORS: Record<TowerType, { accent: string; text: string; glow: string; hex: string; light: string }> = {
    mitrailleuse: { accent: 'green-600', text: 'text-green-600', glow: 'rgba(22,163,74,0.2)', hex: '#16a34a', light: 'text-green-600' },
    canon: { accent: 'orange-700', text: 'text-orange-700', glow: 'rgba(194,65,12,0.2)', hex: '#c2410c', light: 'text-orange-700' },
    mortier: { accent: 'red-600', text: 'text-red-600', glow: 'rgba(220,38,38,0.2)', hex: '#dc2626', light: 'text-red-600' },
    missile: { accent: 'pink-600', text: 'text-pink-600', glow: 'rgba(219,39,119,0.2)', hex: '#db2677', light: 'text-pink-600' },
    dca: { accent: 'cyan-700', text: 'text-cyan-700', glow: 'rgba(14,116,144,0.2)', hex: '#0e7490', light: 'text-cyan-700' },
    plasma: { accent: 'purple-600', text: 'text-purple-600', glow: 'rgba(147,51,234,0.2)', hex: '#9333ea', light: 'text-purple-600' },
  };

  const airstrikes = gameState.activeAirstrikes;
  const airstrikeAvailable = wave >= 3;
  const airstrikeCooldown = Math.max(0, 90000 - (Date.now() - lastAirstrikeTime));
  const airstrikeReady = airstrikeAvailable && airstrikeCooldown <= 0 && status === 'playing';

  useEffect(() => {
    setSellConfirmId(null);
  }, [selectedTurretId]);

  return (
    <div className="relative h-screen w-screen bg-[#020202] overflow-hidden text-[#e8dcc4] font-mono select-none flex items-center justify-center">
      {/* High-fidelity Tactical Handheld Display shell for desktops, native full screen on mobile devices */}
      <div className="relative w-full h-full md:max-w-[460px] md:h-[94%] md:rounded-[44px] md:border-[14px] md:border-[#1e1d1b] md:shadow-[0_0_100px_rgba(0,0,0,0.95)] bg-[#09090b] overflow-hidden flex flex-col md:my-auto my-0">
        
        {/* Simulated smartphone/military tablet notch bar for aesthetics on desktop */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-[#1e1d1b] rounded-b-xl z-[450] items-center justify-center gap-3 px-4 border-b border-white/5 shadow-md">
          <div className="w-12 h-1 bg-[#101012] rounded-full"></div>
          <div className="w-2 h-2 bg-[#0d0e11] rounded-full border border-blue-900/40 flex items-center justify-center shrink-0">
            <div className="w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${waveActive ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-ping'}`} style={{ animationDuration: '2.5s' }}></div>
          </div>
        </div>

        {/* Cinematic Effects */}
        <div className="absolute inset-0 tactical-scanlines z-10 opacity-[0.02] pointer-events-none"></div>
        <div className="absolute inset-0 tactical-vignette z-20 pointer-events-none"></div>
        
        {/* Global Cinematic Overlay (Vignette & Ambient Gradient Blend) */}
        <div className="fixed inset-0 pointer-events-none z-[35] opacity-[0.05] bg-black"></div>
        
        {/* Background Map Layer */}
        <div className="absolute top-16 md:top-20 bottom-32 md:bottom-40 left-0 right-0 z-0">
          <GameBoard 
             gameState={gameState} 
             buildTurret={buildTurret} 
             selectedTower={selectedTower}
             setSelectedTower={setSelectedTower} 
             selectedTurretId={selectedTurretId}
             setSelectedTurretId={setSelectedTurretId}
             isAirstrikeMode={isAirstrikeMode}
             setIsAirstrikeMode={setIsAirstrikeMode}
             onCallAirstrike={callAirstrike}
          />
        </div>

      {/* HUD Overlays */}
      <AnimatePresence>
        {status === 'menu' && (
          <motion.div 
            key="menu-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0c0a09] z-[300] flex items-center justify-center p-4 md:p-8 pointer-events-auto overflow-y-auto no-scrollbar"
          >
             <div className="absolute inset-0 tactical-scanlines opacity-[0.05]"></div>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1),transparent_70%)]"></div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               className="max-w-5xl w-full flex flex-col items-center py-8 md:py-0"
             >
                <div className="mb-6 md:mb-12 text-center">
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full mb-3 md:mb-4"
                  >
                    <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.3em] text-orange-500 font-bold">Protocol v4.5</span>
                  </motion.div>
                  <h1 className="text-5xl md:text-9xl font-black text-white leading-none uppercase tracking-tighter mb-2 md:mb-4">
                    WAR<span className="text-orange-600">ZONE</span>
                  </h1>
                  <p className="text-white/30 text-[8px] md:text-sm font-mono uppercase tracking-[0.2em] md:tracking-[0.3em]">Signature tactique détectée</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl px-2 md:px-0">
                  {/* Campaign */}
                  <button 
                    onClick={() => startGame('campaign')}
                    className="group bg-zinc-900/50 backdrop-blur-md p-5 md:p-10 rounded-3xl md:rounded-[2rem] border border-white/5 hover:border-orange-500/40 transition-all hover:bg-orange-500/[0.05] text-left relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:opacity-20 transition-opacity rotate-12">
                      <Target className="w-16 h-16 md:w-24 md:h-24 text-white" />
                    </div>
                    <div className="p-2.5 md:p-3 bg-orange-500/20 rounded-xl md:rounded-2xl w-fit mb-4 md:mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                      <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-wider mb-1 md:mb-2">CAMPAGNE</h3>
                    <p className="text-[10px] md:text-xs text-white/50 leading-relaxed font-medium mb-6 md:mb-8 max-w-[200px]">15 secteurs hostiles à libérer.</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-orange-500"></div>
                      </div>
                      <span className="text-[8px] font-mono text-orange-500 font-bold uppercase">Secteur 1</span>
                    </div>
                  </button>

                  {/* Survival */}
                  <button 
                    onClick={() => startGame('survival')}
                    className="group bg-zinc-900/50 backdrop-blur-md p-5 md:p-10 rounded-3xl md:rounded-[2rem] border border-white/5 hover:border-red-500/40 transition-all hover:bg-red-500/[0.05] text-left relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:opacity-20 transition-opacity -rotate-12">
                      <Flame className="w-16 h-16 md:w-24 md:h-24 text-white" />
                    </div>
                    <div className="p-2.5 md:p-3 bg-red-500/20 rounded-xl md:rounded-2xl w-fit mb-4 md:mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <Flame className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-wider mb-1 md:mb-2">SURVIE</h3>
                    <p className="text-[10px] md:text-xs text-white/50 leading-relaxed font-medium mb-6 md:mb-8 max-w-[200px]">Vagues infinies, menace croissante.</p>
                    <div className="text-[8px] font-mono text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl w-full text-center border border-red-500/10">
                      DIFFICULTÉ : ∞
                    </div>
                  </button>

                  {/* Time Attack */}
                  <button 
                    onClick={() => startGame('time_attack')}
                    className="group bg-zinc-900/50 backdrop-blur-md p-5 md:p-10 rounded-3xl md:rounded-[2rem] border border-white/5 hover:border-blue-500/40 transition-all hover:bg-blue-500/[0.05] text-left relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-16 h-16 md:w-24 md:h-24 text-white" />
                    </div>
                    <div className="p-2.5 md:p-3 bg-blue-500/20 rounded-xl md:rounded-2xl w-fit mb-4 md:mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-wider mb-1 md:mb-2">BLITZ</h3>
                    <p className="text-[10px] md:text-xs text-white/50 leading-relaxed font-medium mb-6 md:mb-8 max-w-[200px]">Engagement de 5 minutes chrono.</p>
                    <div className="flex items-center justify-between text-[8px] md:text-[10px] font-mono text-blue-400 font-bold uppercase bg-blue-500/10 p-2 md:p-3 rounded-lg md:rounded-xl border border-blue-500/10">
                      <span>05:00</span>
                      <Shield className="w-3 h-3" />
                    </div>
                  </button>
                </div>

                <div className="mt-8 md:mt-16 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-4 md:gap-6 opacity-30">
                    <div className="w-8 md:w-12 h-[1px] bg-white"></div>
                    <p className="text-[7px] md:text-[10px] font-mono uppercase tracking-[0.5em] text-white">Opérationnel</p>
                    <div className="w-8 md:w-12 h-[1px] bg-white"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                  </div>
                </div>
             </motion.div>
          </motion.div>
        )}

        {status === 'paused' && (
          <motion.div 
            key="pause-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md z-[80] flex items-center justify-center pointer-events-auto"
          >
             <div className="absolute inset-0 tactical-scanlines opacity-[0.05]"></div>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               className="relative bg-[#0c0a09] border border-orange-500/20 p-12 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] text-center flex flex-col items-center max-w-md w-full"
             >
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-orange-500/40"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-orange-500/40"></div>
                
                <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20 mb-8 relative">
                   <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping opacity-20"></div>
                   <Pause className="w-10 h-10 text-orange-500" />
                </div>
                
                <h2 className="text-5xl font-black text-white uppercase tracking-[0.2em] mb-2">SYSTEM HALT</h2>
                <p className="text-[10px] font-mono text-orange-500/60 uppercase tracking-[0.4em] mb-12">Engagement Tactique Suspendu • Secteur {level}</p>
                
                <div className="flex flex-col gap-4 w-full">
                  <button 
                    onClick={() => {
                      togglePause();
                      triggerHaptic('light');
                    }}
                    className="group relative w-full py-5 bg-orange-600 text-white font-black uppercase tracking-[0.3em] transition-all hover:bg-orange-500 active:scale-95 shadow-[0_10px_40px_rgba(249,115,22,0.4)] rounded-xl border border-white/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    Reprendre l'Opération
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => window.location.reload()}
                      className="py-3 bg-white/5 text-white/60 font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/10 hover:text-white rounded-xl border border-white/5 text-[9px]"
                    >
                      Redémarrer Secteur
                    </button>
                    <button 
                      onClick={() => {
                        if (resetConfirm) {
                          resetGame();
                          setResetConfirm(false);
                        } else {
                          setResetConfirm(true);
                        }
                      }}
                      className={`py-3 font-bold uppercase tracking-[0.2em] transition-all rounded-xl border text-[9px] ${
                        resetConfirm 
                          ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                          : 'bg-red-900/20 text-red-500/40 border-red-900/30 hover:bg-red-900/40 hover:text-red-400'
                      }`}
                    >
                      {resetConfirm ? 'CONFIRMER' : 'Menu / Reset'}
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-between items-center opacity-30">
                  <span className="text-[7px] font-mono uppercase tracking-widest">Protocol: Defense-Grid</span>
                  <span className="text-[7px] font-mono">NODE_{level}_STATUS_OK</span>
                </div>
             </motion.div>
          </motion.div>
        )}

        {status === 'game_over' && (
          <motion.div 
            key="gameover-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0c0a09]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 pointer-events-auto"
          >
             <div className="absolute inset-0 tactical-scanlines opacity-[0.05]"></div>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative z-10 w-full max-w-lg bg-zinc-950/40 border border-red-500/30 p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_100px_rgba(255,0,0,0.1)] overflow-hidden flex flex-col items-center text-center"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_20px_#ef4444]"></div>
                
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }} 
                  transition={{ duration: 0.1, repeat: 3, repeatDelay: 2 }}
                  className="mb-6 md:mb-8"
                >
                  <AlertTriangle className="w-12 h-12 md:w-20 md:h-20 text-red-600" />
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-[0.1em] uppercase">
                  {mode === 'survival' ? 'FIN DE MISSION' : 'PERTE TOTALE'}
                </h1>
                <p className="text-[9px] md:text-[10px] font-mono text-red-500/60 uppercase tracking-[0.4em] mb-8 md:mb-12 leading-relaxed">
                  {mode === 'survival' ? `Record de Défense : Vague ${wave}` : `Périmètre Compromis • Liaison Secteur ${level} Perdue`}
                </p>
                
                <div className="w-full space-y-3 md:space-y-4 mb-8 md:mb-12">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2 text-left">
                     <span className="text-[7px] md:text-[8px] font-mono text-white/40 uppercase tracking-widest">Résistance Finale</span>
                     <span className="text-xs md:text-sm font-bold text-white">Vague {wave} {mode !== 'survival' && `sur ${maxWaves}`}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2 text-left">
                     <span className="text-[7px] md:text-[8px] font-mono text-white/40 uppercase tracking-widest">État du Secteur</span>
                     <span className="text-xs md:text-sm font-bold text-red-500">COMPROMIS</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full relative z-10">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="group relative w-full py-4 md:py-5 bg-red-700 text-white font-black uppercase tracking-[0.4em] transition-all hover:bg-red-600 active:scale-95 shadow-[0_15px_40px_rgba(220,38,38,0.3)] rounded-2xl border border-white/20 font-sans text-xs md:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_3s_infinite]"></div>
                    Réessayer
                  </button>
                  
                  <button onClick={() => resetGame()} className="py-2 text-[8px] text-white/40 hover:text-white uppercase tracking-widest transition-all font-mono">
                    Retour Menu Principal
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}

        {status === 'victory' && (
          <motion.div 
            key="victory-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0c0a09]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 pointer-events-auto"
          >
             <div className="absolute inset-0 tactical-scanlines opacity-[0.05]"></div>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative z-10 w-full max-w-lg bg-zinc-950/40 border border-green-500/30 p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_100px_rgba(34,197,94,0.1)] overflow-hidden flex flex-col items-center text-center"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-600 to-transparent shadow-[0_0_20px_#22c55e]"></div>
                
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="mb-6 md:mb-8"
                >
                  <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl border-2 md:border-4 border-green-500 flex items-center justify-center p-3 md:p-4 text-green-500 bg-green-500/10">
                    <Target className="w-full h-full" />
                  </div>
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-[0.1em] uppercase">
                  {mode === 'time_attack' ? 'OBJECTIF ATTEINT' : 'ZONE SÉCURISÉE'}
                </h1>
                <p className="text-[9px] md:text-[10px] font-mono text-green-500/60 uppercase tracking-[0.4em] mb-8 md:mb-12 leading-relaxed">
                  {mode === 'time_attack' ? `Félicitations • Kills et Efficacité validés` : `Secteur ${level} Nettoyé • Menace Neutralisée`}
                </p>
                
                <div className="w-full space-y-3 md:space-y-4 mb-8 md:mb-12">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2 text-left">
                     <span className="text-[7px] md:text-[8px] font-mono text-white/40 uppercase tracking-widest">Statut Mission</span>
                     <span className="text-xs md:text-sm font-bold text-green-400">{mode === 'time_attack' ? 'TEMPS ÉCOULÉ' : 'SÉCURISÉ'}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2 text-left">
                     <span className="text-[7px] md:text-[8px] font-mono text-white/40 uppercase tracking-widest">Performance</span>
                     <span className="text-xs md:text-sm font-bold text-white uppercase">Efficacité Optimale</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full relative z-10">
                  {mode === 'campaign' ? (
                    <button 
                      onClick={() => {
                        localStorage.removeItem('canyon_defense_session');
                        localStorage.setItem('defense_level', String(level + 1));
                        window.location.reload();
                      }} 
                      className="group relative w-full py-4 md:py-5 bg-green-700 text-white font-black uppercase tracking-[0.4em] transition-all hover:bg-green-600 active:scale-95 shadow-[0_15px_40px_rgba(34,197,94,0.3)] rounded-2xl border border-white/20 overflow-hidden font-sans text-xs md:text-base"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_3s_infinite]"></div>
                      Secteur Suivant
                    </button>
                  ) : (
                    <button 
                      onClick={() => resetGame()} 
                      className="group relative w-full py-4 md:py-5 bg-zinc-800 text-white font-black uppercase tracking-[0.4em] transition-all hover:bg-zinc-700 active:scale-95 rounded-2xl border border-white/20 overflow-hidden font-sans text-xs md:text-base"
                    >
                      Menu Principal
                    </button>
                  )}
                </div>
             </motion.div>
          </motion.div>
        )}

        {showBriefing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0c0a09] z-[200] flex flex-col items-center justify-start p-4 md:p-8 pointer-events-auto overflow-y-auto no-scrollbar"
          >
             <div className="absolute inset-0 tactical-scanlines opacity-[0.05] pointer-events-none"></div>
             <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full my-auto py-6">
                <div className="flex items-center gap-4 mb-12">
                   <div className="w-12 h-1 bg-orange-600"></div>
                   <h2 className="text-sm md:text-xl font-mono text-orange-500 uppercase tracking-[0.5em] font-black">Briefing Tactique Initial</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                   <div className="space-y-8">
                      <div>
                         <h1 className="text-4xl md:text-7xl font-black text-white leading-none uppercase mb-4 tracking-tighter">PROTOCOLE <br/> <span className="text-orange-600">SENTINELLE</span></h1>
                         <p className="text-white/40 text-sm md:text-base leading-relaxed font-medium">
                            Commandant, les forces d'invasion ont franchi le périmètre extérieur. Votre mission est de fortifier ce secteur stratégique à l'aide de la grille de défense modulaire.
                         </p>
                      </div>

                      <div className="flex flex-col gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 border-dashed">
                         <div className="flex gap-4 items-start">
                            <div className="p-2 bg-orange-500/20 rounded-lg"><Crosshair className="w-5 h-5 text-orange-500"/></div>
                            <div>
                               <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">DÉPENSES TACTIQUES</h4>
                               <p className="text-[10px] text-white/40 leading-tight">Gérez vos crédits avec précision. Chaque tourelle détruite par l'ennemi est une perte pour l'effort de guerre.</p>
                            </div>
                         </div>
                         <div className="flex gap-4 items-start">
                            <div className="p-2 bg-orange-500/20 rounded-lg"><Target className="w-5 h-5 text-orange-500"/></div>
                            <div>
                               <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">ÉLÉVATION DE NIVEAU</h4>
                               <p className="text-[10px] text-white/40 leading-tight">Améliorez vos défenses au niveau 3 pour débloquer des spécialisations dévastatrices.</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Play className="w-20 h-20 text-white" />
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 border-b border-white/10 pb-4">Objectifs Sectoriels</h3>
                      <ul className="space-y-4 font-mono text-[9px] md:text-[10px] text-white/60">
                         <li className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                           <span>SÉCURISER LE CANYON : VAGUES 01-{maxWaves}</span>
                         </li>
                         <li className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                           <span>PRÉSERVER L'INTÉGRITÉ : MIN 1 PV</span>
                         </li>
                         <li className="flex items-center gap-3 opacity-30">
                           <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                           <span>LOGISTIQUE : FRAPPES AÉRIENNES DISPONIBLES V.3</span>
                         </li>
                      </ul>

                      <button onClick={() => { setShowBriefing(false); triggerHaptic('heavy'); }} className="w-full mt-12 py-5 bg-white text-black font-black uppercase tracking-[0.4em] transition-all hover:bg-orange-500 hover:text-white rounded-2xl group-hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 font-sans">
                        Autoriser le Déploiement
                      </button>
                      <p className="mt-4 text-center text-[7px] font-mono text-white/20 uppercase tracking-widest">En signant, vous acceptez les risques liés au combat en secteur rouge</p>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP LEFT HUD: Stats */}
      <div className="absolute top-2 left-2 md:top-3 md:left-4 z-40 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-1 pointer-events-auto"
        >
          <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl px-2.5 py-1.5 md:px-3 md:py-2 flex items-center gap-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            {/* Sector */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="flex flex-col">
                <span className="text-[6px] text-white/40 uppercase tracking-widest font-black leading-none">SEC</span>
                <span className="text-xs font-black font-mono text-white mt-0.5 leading-none">{level}</span>
              </div>
            </div>

            <div className="w-px h-5 bg-white/10"></div>

            {/* PV */}
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${lives <= 2 ? 'bg-red-500 animate-pulse' : 'bg-red-500'}`}></div>
              <div className="flex flex-col">
                <span className="text-[6px] text-white/40 uppercase tracking-widest font-black leading-none">PV</span>
                <span className={`text-xs font-black font-mono mt-0.5 leading-none ${lives <= 2 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>{lives}</span>
              </div>
            </div>

            <div className="w-px h-5 bg-white/10"></div>

            {/* Wave */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-[6px] text-white/40 uppercase tracking-widest font-black leading-none">WAV</span>
                <span className="text-xs font-black font-mono text-white mt-0.5 leading-none">
                  {wave}<span className="text-white/20 text-[8px] font-normal">/{maxWaves}</span>
                </span>
              </div>
            </div>

            <div className="w-px h-5 bg-white/10"></div>

            {/* Credits */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-[6px] text-white/40 uppercase tracking-widest font-black leading-none">C$</span>
                <span className="text-xs font-black font-mono text-yellow-500 mt-0.5 leading-none">${formatMoney(money)}</span>
              </div>
            </div>
          </div>

          {/* Active status / modifier underlay */}
          <div className="flex items-center gap-1">
             <div className="bg-zinc-950/80 backdrop-blur-sm border border-white/5 px-2 py-0.5 rounded-full flex items-center gap-1 opacity-70">
                <div className={`w-1 h-1 rounded-full ${waveActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                <span className="text-[6px] font-mono uppercase tracking-[0.1em] text-white/70">{waveActive ? 'Combat' : 'Préparation'}</span>
             </div>
             
             {gameState.activeModifier && (
               <div className="bg-orange-500/15 backdrop-blur-sm border border-orange-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                 <AlertTriangle className="w-1.5 h-1.5 text-orange-500 animate-pulse" />
                 <span className="text-[6px] font-mono uppercase tracking-[0.1em] text-orange-400 font-bold">{gameState.activeModifier.name}</span>
               </div>
             )}
          </div>
        </motion.div>
      </div>

      {/* TOP RIGHT HUD: Controls */}
      <div className="absolute top-1.5 right-2 md:top-4 md:right-6 z-40 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-row-reverse items-center gap-2 md:gap-3 pointer-events-auto"
        >
          {!showBriefing && (
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-1 md:p-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 md:gap-2">
              <button 
                onClick={() => {
                  togglePause();
                  triggerHaptic('light');
                }} 
                disabled={status === 'game_over' || status === 'victory'}
                className={`group flex items-center justify-center rounded-xl h-10 w-10 md:h-12 md:w-12 transition-all active:scale-95 border ${status === 'playing' ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white/80' : 'bg-green-600/20 hover:bg-green-600/40 border-green-500/30 text-green-400'}`}
                title={status === 'playing' ? 'Pause' : 'Reprendre'}
              >
                {status === 'playing' ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6 opacity-60 group-hover:opacity-100" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current animate-pulse" />
                )}
              </button>

              <button 
                onClick={() => {
                  if (resetConfirm) {
                    resetGame();
                    setResetConfirm(false);
                  } else {
                    setResetConfirm(true);
                  }
                }}
                onMouseLeave={() => setResetConfirm(false)}
                className={`group flex items-center justify-center rounded-xl h-10 w-10 md:h-12 md:w-12 transition-all active:scale-95 border ${
                  resetConfirm 
                    ? 'bg-red-600 border-red-400 text-white' 
                    : 'bg-red-900/20 border-red-500/20 text-red-500/60 hover:bg-red-900/40 hover:text-red-400'
                }`}
                title="Réinitialiser"
              >
                <RotateCcw className={`w-5 h-5 md:w-6 md:h-6 ${resetConfirm ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Arsenal Bar (Bottom) */}
      <div className={`absolute bottom-0 md:bottom-6 left-0 right-0 flex flex-col items-center justify-center z-40 pointer-events-none px-2 md:px-4 space-y-3 md:space-y-4 transition-all duration-700 delay-300 ${showBriefing ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'}`}>
        <div className="w-full max-w-5xl flex flex-col items-center">
          
          {/* Wave Control: Pulsing Start Button for Mobile */}
          {!waveActive && status === 'playing' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-4 pointer-events-auto"
            >
              <button 
                onClick={() => {
                  startWave();
                  triggerHaptic('heavy');
                }}
                className="bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs md:text-sm tracking-[0.4em] py-3 px-8 md:py-4 md:px-10 rounded-full shadow-[0_0_40px_rgba(249,115,22,0.4)] border border-white/20 animate-pulse transition-all active:scale-95"
              >
                Engager la Vague {wave}
              </button>
            </motion.div>
          )}

          {/* Contextual Action Overlay (Upgrades & Info) */}
          <div className="w-full flex justify-between items-end mb-2 md:mb-4 px-2 h-0 overflow-visible">
            <div className="flex-1 pointer-events-auto flex justify-start">
              <AnimatePresence mode="wait">
                {selectedTower ? (
                  <motion.div 
                    key="deployment-info"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-zinc-900/98 backdrop-blur-3xl border p-2 md:p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full max-w-[280px] md:max-w-sm relative overflow-hidden text-zinc-100"
                    style={{
                      borderColor: `${TOWER_COLORS[selectedTower].hex}55`,
                      boxShadow: `0 10px 35px ${TOWER_COLORS[selectedTower].glow}`
                    }}
                  >
                    {!deploymentInfoHidden ? (
                      <>
                        <div className="absolute top-0 right-0 p-2">
                          <button 
                            onClick={() => setDeploymentInfoHidden(true)} 
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white flex items-center gap-1"
                            title="Masquer le texte"
                          >
                            <span className="text-[8px] font-mono tracking-tighter">RÉDUIRE</span>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: `${TOWER_COLORS[selectedTower].hex}33`, color: TOWER_COLORS[selectedTower].hex }}>
                            {selectedTower === 'mitrailleuse' && <Crosshair className="w-4 h-4" />}
                            {selectedTower === 'canon' && <Target className="w-4 h-4" />}
                            {selectedTower === 'mortier' && <Flame className="w-4 h-4" />}
                            {selectedTower === 'missile' && <Rocket className="w-4 h-4" />}
                            {selectedTower === 'dca' && <Plane className="w-4 h-4" />}
                            {selectedTower === 'plasma' && <Zap className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] block leading-none" style={{ color: TOWER_COLORS[selectedTower].hex }}>Ordre de Déploiement</span>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{TOWER_CONFIGS[selectedTower].name}</h4>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-medium mb-3">
                          {TOWER_CONFIGS[selectedTower].desc}. Cliquez sur un emplacement libre pour déployer.
                        </p>
                        <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/10 pt-2">
                           <span className="text-white/30 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: TOWER_COLORS[selectedTower].hex }}></div>
                             Acquisition cible...
                           </span>
                           <button 
                             onClick={() => setSelectedTower(null)} 
                             className="hover:text-white transition-colors font-bold"
                             style={{ color: TOWER_COLORS[selectedTower].hex }}
                           >
                             ANNULER
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: TOWER_COLORS[selectedTower].hex }}></div>
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Pose de {TOWER_CONFIGS[selectedTower].name}...</span>
                        </div>
                        <button 
                          onClick={() => setDeploymentInfoHidden(false)}
                          className="text-[8px] font-mono text-white/40 hover:text-white underline underline-offset-4"
                        >
                          DÉTAILS
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : selectedTurretId && gameState.turrets[selectedTurretId] ? (
                  <motion.div 
                    key="turret-details"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-zinc-900/98 backdrop-blur-3xl border p-3 md:p-5 rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] w-full max-w-[320px] md:max-w-none md:min-w-[320px] relative overflow-hidden text-zinc-100"
                    style={{
                      borderColor: `${TOWER_COLORS[gameState.turrets[selectedTurretId].type].hex}55`,
                      boxShadow: `0 15px 45px ${TOWER_COLORS[gameState.turrets[selectedTurretId].type].glow}`
                    }}
                  >
                    {/* Tactical Frame Decor */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>

                    {(() => {
                      const turret = gameState.turrets[selectedTurretId];
                      const config = TOWER_CONFIGS[turret.type];
                      const theme = TOWER_COLORS[turret.type];
                      const specialization = turret.specialization ? TOWER_SPECIALIZATIONS[turret.type][turret.specialization] : null;
                      
                      const isMaxLevel = turret.level >= 5;
                      const upgradeCost = isMaxLevel ? 0 : Math.floor(config.cost * Math.pow(1.5, turret.level) * (turret.level === 3 ? 1.5 : 1));
                      const canAffordUpgrade = !isMaxLevel && money >= upgradeCost;
                      
                      // Calculate refund for display
                      let totalValue = config.cost;
                      for (let i = 1; i < turret.level; i++) {
                        const isSpec = i === 3;
                        totalValue += Math.floor(config.cost * Math.pow(1.5, i) * (isSpec ? 1.5 : 1));
                      }
                      const refund = Math.floor(totalValue * 0.6);

                      const specsAvailable = turret.level === 3 && !turret.specialization;
                      const availableSpecs = TOWER_SPECIALIZATIONS[turret.type] || {};

                      return (
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]`} style={{ color: theme.hex, backgroundColor: theme.hex }}></span>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                                  {specialization ? specialization.name : config.name}
                                </h3>
                              </div>
                              <div className="flex gap-2">
                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-mono text-white/40 uppercase tracking-widest border border-white/5">
                                  {isMaxLevel ? 'MAX' : `Niv. ${turret.level}`}
                                </span>
                                {turret.specialization && (
                                   <span className="bg-orange-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono text-orange-400 uppercase tracking-widest border border-orange-500/20">Elite</span>
                                )}
                              </div>
                            </div>
                            <button onClick={() => setSelectedTurretId(null)} className="text-white/20 hover:text-white transition-colors">
                              <Crosshair className="w-4 h-4 rotate-45" />
                            </button>
                          </div>

                          {/* Technical Diagnostics - 3 Columns with Live Stat Upgrades */}
                          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                                                    {/* Dégâts */}
                            <div className="bg-white/[0.02] border border-white/5 p-1.5 rounded-lg relative overflow-hidden text-zinc-300">
                               <div className="absolute top-0 right-0 w-0.5 h-full bg-red-600/20"></div>
                               <span className="text-white/35 uppercase text-[6px] tracking-widest block mb-1">Dégâts</span>
                               <div className="flex flex-col">
                                 <span className="text-white/95 text-xs font-bold leading-none">{Math.floor(turret.damage)}</span>
                                 {!specsAvailable && !isMaxLevel && (
                                   <span className="text-green-400 text-[8px] font-black mt-0.5 leading-none">
                                     ➔ {Math.floor(turret.damage * 1.4)}
                                   </span>
                                 )}
                               </div>
                            </div>

                            {/* Portée */}
                            <div className="bg-white/[0.02] border border-white/5 p-1.5 rounded-lg relative overflow-hidden text-zinc-300">
                               <div className="absolute top-0 right-0 w-0.5 h-full bg-blue-600/20"></div>
                               <span className="text-white/35 uppercase text-[6px] tracking-widest block mb-1">Portée</span>
                               <div className="flex flex-col">
                                 <span className="text-white/95 text-xs font-bold leading-none">{Math.floor(turret.range)}m</span>
                                 {!specsAvailable && !isMaxLevel && (
                                   <span className="text-green-400 text-[8px] font-black mt-0.5 leading-none">
                                     ➔ {Math.floor(turret.range * 1.1)}m
                                   </span>
                                 )}
                               </div>
                            </div>

                            {/* Cadence */}
                            <div className="bg-white/[0.02] border border-white/5 p-1.5 rounded-lg relative overflow-hidden text-zinc-300">
                               <div className="absolute top-0 right-0 w-0.5 h-full bg-cyan-600/20"></div>
                               <span className="text-white/35 uppercase text-[6px] tracking-widest block mb-1">Cadence</span>
                               <div className="flex flex-col">
                                 <span className="text-white/95 text-xs font-bold leading-none">{turret.fireRate.toFixed(1)}/s</span>
                                 {!specsAvailable && !isMaxLevel && (
                                   <span className="text-green-400 text-[8px] font-black mt-0.5 leading-none">
                                     ➔ {(turret.fireRate * 1.1).toFixed(1)}/s
                                   </span>
                                 )}
                               </div>
                            </div>
                          </div>

                          {/* Target Priority Selector */}
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">Priorité d'acquisition</span>
                                <button 
                                  onClick={() => {
                                    if (sellConfirmId === selectedTurretId) {
                                      sellTurret(selectedTurretId);
                                      setSelectedTurretId(null);
                                      setSellConfirmId(null);
                                    } else {
                                      setSellConfirmId(selectedTurretId);
                                      triggerHaptic('warning');
                                    }
                                  }}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-bold uppercase transition-all border ${
                                    sellConfirmId === selectedTurretId
                                      ? 'bg-red-600 text-white border-red-500 animate-pulse'
                                      : 'bg-red-900/10 text-red-500/60 border-red-900/20 hover:bg-red-900/30 hover:text-red-400'
                                  }`}
                                >
                                  <DollarSign className="w-2.5 h-2.5" />
                                  {sellConfirmId === selectedTurretId ? 'Confirmer Vente' : `Vendre [$${formatMoney(refund)}]`}
                                </button>
                            </div>
                            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 snap-x scroll-smooth">
                              {(['first', 'last', 'strong', 'weak', 'armored', 'stealth', 'fast'] as const).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => setTargetPriority(selectedTurretId, p)}
                                  className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all border shrink-0 snap-start ${
                                    turret.targetPriority === p 
                                      ? 'bg-orange-600 text-white border-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                                      : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white/80'
                                  }`}
                                >
                                  {p === 'first' ? 'Tête' : p === 'last' ? 'Fin' : p === 'strong' ? 'Fort' : p === 'weak' ? 'Faible' : p === 'armored' ? 'Blindé' : p === 'stealth' ? 'Furtif' : 'Rapide'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {specsAvailable ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-[7px] font-mono text-orange-500 uppercase tracking-widest text-center mb-1">UNITÉ D'ÉLITE : CHOISISSEZ UNE SPÉCIALISATION</span>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(availableSpecs).map(([key, spec]) => (
                                  <button
                                    key={key}
                                    onClick={() => upgradeTurret(selectedTurretId, key)}
                                    disabled={!canAffordUpgrade || status !== 'playing'}
                                    className={`flex flex-col p-2 rounded border transition-all text-left ${
                                      canAffordUpgrade ? 'border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/20' : 'border-white/5 opacity-40 grayscale'
                                    }`}
                                  >
                                    <span className="text-[8px] font-black uppercase text-orange-400 mb-1">{spec.name}</span>
                                    <span className="text-[7px] text-white/50 leading-tight">{spec.desc}</span>
                                    <span className="text-[8px] font-mono text-orange-500 mt-2">${formatMoney(upgradeCost)}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => upgradeTurret(selectedTurretId)}
                              disabled={!canAffordUpgrade || status !== 'playing'}
                              className={`w-full py-3 rounded text-[10px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden flex items-center justify-center gap-3 border ${
                                canAffordUpgrade && status === 'playing'
                                  ? 'bg-white text-black border-white hover:bg-orange-600 hover:border-orange-600 hover:text-white shadow-md'
                                  : 'bg-transparent text-white/20 border-white/10 cursor-not-allowed'
                              }`}
                            >
                              {isMaxLevel ? 'NIVEAU MAX ATTEINT' : canAffordUpgrade ? `Améliorer [ $${formatMoney(upgradeCost)} ]` : 'Fonds Insuffisants'}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex items-center justify-between mt-3 gap-2">
                       <button
                         onClick={handleSell}
                         className={`flex-1 h-9 md:h-10 rounded-lg font-bold text-[10px] md:text-xs transition-all flex items-center justify-center gap-1 md:gap-2 ${
                           showSellConfirm 
                             ? 'bg-red-600 animate-pulse text-white' 
                             : 'bg-red-900/40 text-red-400 hover:bg-red-900/60'
                         }`}
                       >
                         {showSellConfirm ? (
                           <>
                             <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                             <span className="text-white">DÉSASSEMBLER (+${getRefundValue(selectedTurretId)})</span>
                           </>
                         ) : (
                           <>
                             <Trash2 className="w-3 h-3 md:w-4 md:h-4 opacity-70" />
                             <span>VENDRE</span>
                           </>
                         )}
                       </button>

                       {showSellConfirm && (
                         <button 
                           onClick={() => setShowSellConfirm(false)}
                           className="px-3 h-9 md:h-10 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                         >
                            <span className="text-[10px] text-white/60">ANNULER</span>
                         </button>
                       )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 flex justify-end pointer-events-auto">
            </div>
          </div>

          {/* Main Arsenal Console */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.6 }}
            className="relative bg-zinc-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-t-3xl md:rounded-2xl p-1.5 md:p-4 pointer-events-auto w-full flex items-center gap-2 md:gap-4 overflow-hidden text-white"
          >
            {/* Tactical Scanlines */}
            <div className="absolute inset-0 tactical-scanlines opacity-[0.03] pointer-events-none"></div>
            
            {/* Turret Selection Row (Touch Optimized Scroll) */}
            <div className="flex-1 flex items-center gap-1.5 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0 scroll-smooth snap-x">
              {Object.entries(TOWER_CONFIGS).map(([key, config]) => {
                const type = key as TowerType;
                const isSelected = selectedTower === type;
                const canAfford = money >= config.cost;
                
                return (
                  <motion.button
                    key={key}
                    whileTap={canAfford ? { scale: 0.92 } : {}}
                    onClick={() => {
                      if (canAfford) {
                        setSelectedTower(isSelected ? null : type);
                        setDeploymentInfoHidden(false);
                        setSelectedTurretId(null);
                        triggerHaptic('medium');
                      } else {
                        triggerHaptic('error');
                      }
                    }}
                    className={`group relative min-w-[64px] md:min-w-[95px] h-14 md:h-24 rounded-xl md:rounded-2xl flex flex-col items-center justify-between p-1 md:p-3 transition-all snap-start ${
                      isSelected 
                        ? 'border-2' 
                        : canAfford 
                          ? 'bg-white/[0.03] border-white/10 border hover:bg-white/[0.08] active:bg-white/10' 
                          : 'bg-transparent border-white/5 border opacity-30 grayscale'
                    }`}
                    style={isSelected ? {
                      borderColor: TOWER_COLORS[type].hex,
                      backgroundColor: `${TOWER_COLORS[type].hex}22`,
                      boxShadow: `0 0 20px ${TOWER_COLORS[type].glow}`
                    } : {}}
                  >
                    <div className={`${isSelected ? '' : canAfford ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600'}`}
                         style={isSelected ? { color: TOWER_COLORS[type].hex } : {}}>
                      {type === 'mitrailleuse' && <Crosshair className="w-4 h-4 md:w-7 md:h-7" />}
                      {type === 'canon' && <Target className="w-4 h-4 md:w-7 md:h-7" />}
                      {type === 'mortier' && <Flame className="w-4 h-4 md:w-7 md:h-7" />}
                      {type === 'missile' && <Rocket className="w-4 h-4 md:w-7 md:h-7" />}
                      {type === 'dca' && <Plane className="w-4 h-4 md:w-7 md:h-7" />}
                      {type === 'plasma' && <Zap className="w-4 h-4 md:w-7 md:h-7" />}
                    </div>

                    <div className="w-full text-center">
                      <div className={`text-[5px] md:text-[8px] font-black uppercase tracking-[0.1em] truncate mb-0 md:mb-1 ${isSelected ? 'text-white' : 'text-white/40'}`}>
                        {config.name}
                      </div>
                      <div className={`text-[7px] md:text-[10px] font-mono font-black ${canAfford ? 'text-yellow-500' : 'text-red-500/60'}`}>
                        ${formatMoney(config.cost)}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Action Panel (Optimized for thumb on right) */}
            <div className="flex items-center gap-1.5 md:gap-4 pl-1.5 md:pl-4 border-l border-white/10 shrink-0">
               <motion.button
                whileTap={airstrikeReady ? { scale: 0.92 } : {}}
                onClick={() => {
                  if (airstrikeReady) {
                    setIsAirstrikeMode(!isAirstrikeMode);
                    setSelectedTower(null);
                    setSelectedTurretId(null);
                    triggerHaptic('heavy');
                  }
                }}
                className={`relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl transition-all flex items-center justify-center ${
                  isAirstrikeMode
                    ? 'bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-white'
                    : airstrikeReady
                      ? 'bg-zinc-800 border-red-600/50 border-2 hover:bg-zinc-700 active:scale-95'
                      : 'bg-zinc-950 border border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col items-center">
                  {isAirstrikeMode ? <X className="w-5 h-5 text-white" /> : <Rocket className={`w-5 h-5 ${airstrikeReady ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />}
                  {!isAirstrikeMode && airstrikeReady && <span className="text-[5px] md:text-[6px] font-black text-red-500 mt-0.5">PRÊT</span>}
                  {!isAirstrikeMode && !airstrikeReady && airstrikeAvailable && (
                    <span className="text-[7px] md:text-[8px] font-mono font-bold text-zinc-500">{Math.ceil(airstrikeCooldown/1000)}s</span>
                  )}
                </div>
              </motion.button>

              <AnimatePresence>
                  {!waveActive && status === 'playing' && (
                    <motion.button 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        startWave();
                        triggerHaptic('heavy');
                      }}
                      className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-orange-600 shadow-[0_10px_30px_rgba(249,115,22,0.4)] flex flex-col items-center justify-center gap-0.5 md:gap-1 border border-orange-400 active:bg-orange-500"
                    >
                      <Play className="w-5 h-5 md:w-10 md:h-10 fill-white" />
                      <span className="text-[5px] md:text-[8px] font-black uppercase tracking-widest text-white">START</span>
                    </motion.button>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>

          {/* Sub-Console Status */}
          <div className="w-full mt-2 flex justify-between items-center px-4 opacity-40">
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 bg-white rounded-full"></div>
                   <span className="text-[7px] font-mono uppercase tracking-[0.3em] text-white">ID: THX-1138</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 bg-white rounded-full"></div>
                   <span className="text-[7px] font-mono uppercase tracking-[0.3em] text-white">OS: TACTICAL-V.9</span>
                </div>
             </div>
             <motion.div 
               animate={{ opacity: [0.2, 1, 0.2] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="text-[7px] font-mono text-orange-500 uppercase tracking-[0.3em] font-bold"
             >
                {waveActive ? 'Flux de données en temps réel - Engagement actif' : 'En attente d\'engagement tactique'}
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
