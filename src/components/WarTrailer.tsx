// src/components/WarTrailer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Timer, CheckCircle2, Target, Skull } from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

type Props = {
  onClose: () => void;
  onAction: () => void;
};

// ============================================================================
// СТИЛИ: 3D-Арена, Пульс и Голливуд
// ============================================================================
const WarStyles = () => (
  <style>{`
    /* Цветокоррекция */
    .epic-color-grade { filter: contrast(1.2) saturate(1.1) brightness(0.9) sepia(0.05); }
    .film-grain-overlay {
      position: absolute; inset: 0; pointer-events: none; z-index: 9997; opacity: 0.08;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
    .cinematic-tint {
      position: absolute; inset: 0; pointer-events: none; z-index: 9998;
      background: linear-gradient(135deg, rgba(2, 40, 60, 0.4) 0%, rgba(80, 15, 0, 0.4) 100%);
      mix-blend-mode: soft-light;
    }

    /* Виньетка и сканлайны */
    .war-vignette { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, transparent 15%, rgba(0,0,0,0.99) 100%); z-index: 100; pointer-events: none; }
    .tactical-scanlines { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 50%); background-size: 100% 4px; z-index: 99; opacity: 0.3; pointer-events: none; }
    
    /* Heartbeat (Пульс) */
    @keyframes heartbeat {
      0% { transform: scale(1); opacity: 0.1; }
      15% { transform: scale(1.15); opacity: 0.3; }
      30% { transform: scale(1); opacity: 0.1; }
      45% { transform: scale(1.15); opacity: 0.4; box-shadow: inset 0 0 100px rgba(239,68,68,0.5); }
      100% { transform: scale(1); opacity: 0.1; }
    }
    .bg-heartbeat { animation: heartbeat 1.2s ease-in-out infinite; }

    /* Разрезание текста для манифеста */
    .text-clip-reveal {
      background: linear-gradient(90deg, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `}</style>
);

const SubtleMathRain = ({ density = 6 }: { density?: number }) => {
  const equations =["\\int e^{-x^2} dx", "\\nabla \\times \\mathbf{E}", "A = U \\Sigma V^T", "\\phi = \\frac{1+\\sqrt{5}}{2}"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.07] z-0">
      {Array.from({ length: density }).map((_, i) => (
        <motion.div key={i}
          initial={{ y: -50, x: Math.random() * 100 + "vw", opacity: 0, scale: 0.5 + Math.random() }}
          animate={{ y: "115vh", opacity: [0, 1, 0] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: i * 0.7, ease: 'linear' }}
          className="absolute text-cyan-200 font-bold blur-[1px]"
        ><Latex>{`$${equations[i % equations.length]}$`}</Latex></motion.div>
      ))}
    </div>
  );
};

const TacticalHUD = () => (
  <div className="absolute inset-0 pointer-events-none z-[90] opacity-30 text-white font-mono text-[10px] uppercase">
    <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
      <span className="flex items-center gap-2 text-red-500 font-bold"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> RECORDING</span>
      <span className="text-cyan-500/80">LATENCY: 12ms</span>
    </div>
    <div className="absolute bottom-10 left-10 opacity-40">SYS.VER: 9.4.2 // MATHLAB_ENGINE</div>
    <div className="absolute bottom-10 right-10 flex gap-1">
      {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-cyan-500" style={{ opacity: i * 0.2 }} />)}
    </div>
  </div>
);

const ArenaKeypad = ({ pressedKey, combo }: { pressedKey: string | null; combo?: number }) => {
  const rows = [['7','8','9','÷'],['4','5','6','×'],['1','2','3','−'],['±','0','.','+']];
  return (
    <div className="bg-slate-950 border-t border-slate-800 p-4 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      <div className="flex justify-between items-center px-2 py-2 mb-2 border-b border-slate-800/50">
        <div className="text-slate-500 font-bold text-[10px] tracking-[0.2em]">COMBO <span className="text-cyan-400 font-black text-sm">{combo ?? 0}</span></div>
        <div className="text-cyan-500 font-bold text-[10px] tracking-[0.2em]">OVERRIDE</div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {rows.flat().map(k => (
          <div key={k} className={`h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-all duration-75 ${
            pressedKey === k ? 'bg-cyan-400 text-black scale-90 shadow-[0_0_20px_rgba(34,211,238,0.8)]' :
            ['÷','×','−','+'].includes(k) ? 'bg-slate-900 text-cyan-500 border border-slate-800' : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}>{k}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-12 flex-[1.5] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500">abc</div>
        <div className={`h-12 flex-[3.5] rounded-xl flex items-center justify-center font-black tracking-widest transition-all duration-[50ms] ${
          pressedKey === 'ENTER' ? 'bg-white text-black scale-95 shadow-[0_0_40px_rgba(255,255,255,1)]' : 'bg-red-600 text-white border border-red-500'
        }`}>EXECUTE</div>
      </div>
    </div>
  );
};

// ============================================================================
// АКТЫ
// ============================================================================

const Act1_Manifesto = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 3200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div key="act1" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.6 }} className="absolute inset-0 bg-black flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-slate-500 font-mono text-sm uppercase tracking-[0.3em]">
          Forget the textbooks
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, filter: 'blur(20px)' }} 
          animate={{ opacity: 1, filter: 'blur(0px)' }} 
          transition={{ delay: 0.6, duration: 1, ease: "easeOut" }} 
          className="text-4xl md:text-6xl font-black text-clip-reveal uppercase leading-tight tracking-tight"
        >
          Knowledge is <br/>no longer a test.
        </motion.h1>

        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 1.6, duration: 0.5, type: "spring", bounce: 0.5 }} 
          className="text-5xl md:text-7xl font-black text-red-500 uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
        >
          It's a weapon.
        </motion.h2>
      </div>
    </motion.div>
  );
};

const Act2_Factions = ({ onComplete }: { onComplete: () => void }) => {
  const [index, setIndex] = useState(0);
  const words =["ALGEBRA", "CALCULUS", "GEOMETRY", "STATISTICS", "TOPOLOGY", "PVP ENABLED"];

  useEffect(() => {
    let cancelled = false;
    const tick = (i: number) => {
      if (cancelled) return;
      if (i >= words.length - 1) {
        setIndex(words.length - 1);
        setTimeout(() => { if (!cancelled) onComplete(); }, 400);
        return;
      }
      setTimeout(() => { setIndex(i + 1); tick(i + 1); }, 120); // Очень быстрая нарезка
    };
    tick(0);
    return () => { cancelled = true; };
  }, [onComplete]);

  return (
    <motion.div key="act2" className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <TacticalHUD />
      <SubtleMathRain density={15} />
      <motion.div 
        key={index}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.1 }}
        className={`text-6xl md:text-[9rem] font-black uppercase tracking-tighter ${index === words.length - 1 ? 'text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]' : 'text-white'}`}
      >
        {words[index]}
      </motion.div>
    </motion.div>
  );
};

const Act3_WarArena = ({ onComplete }: { onComplete: () => void }) => {
  const [battlePhase, setBattlePhase] = useState(0);
  const [combo, setCombo] = useState(0);
  const[pressedKey, setPressedKey] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('00:01.89'); // Стартуем с критической 1 секунды
  const stoppedRef = useRef(false);

  // Хореография 
  useEffect(() => {
    const triggerHit = (c: number, p: number, k: string) => { setCombo(c); setBattlePhase(p); setPressedKey(k); };

    const sequence =[
      { t: 600,  action: () => setBattlePhase(1) },
      { t: 1200, action: () => triggerHit(1, 2, '2') },
      { t: 1350, action: () => setPressedKey(null) },
      { t: 1800, action: () => { 
          // SLOW-MO MOMENT (Время замирает перед энтером)
          setBattlePhase(3); 
          document.body.style.filter = "brightness(0.6)"; 
      }},
      { t: 2300, action: () => { 
          // УДАР!
          document.body.style.filter = "none";
          triggerHit(2, 4, 'ENTER'); 
          stoppedRef.current = true; // Тормозим таймер!
      }},
      { t: 2450, action: () => { setPressedKey(null); setBattlePhase(5); } },
      { t: 3800, action: onComplete }
    ];

    const timeouts = sequence.map(s => setTimeout(s.action, s.t));
    return () => { timeouts.forEach(clearTimeout); document.body.style.filter = "none"; };
  },[onComplete]);

  // Экстремальный миллисекундный таймер
  useEffect(() => {
    let rafId: number;
    const startMs = Date.now();
    const startValue = 1890; // Меньше 2 секунд для накала (MATCH POINT)

    const updateTimer = () => {
      if (stoppedRef.current) return;
      const elapsed = Date.now() - startMs;
      const current = Math.max(0, startValue - elapsed);
      const secs = Math.floor(current / 1000);
      const ms = Math.floor((current % 1000) / 10);
      setTimeLeft(`00:0${secs}.${ms.toString().padStart(2, '0')}`);
      if (current > 0) rafId = requestAnimationFrame(updateTimer);
    };
    rafId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(rafId);
  },[]);

  // 3D Камера: Наклон арены, который "выпрямляется" во время удара
  const arena3DStyle = battlePhase < 4 
    ? { transform: "perspective(1200px) rotateX(8deg) rotateY(-4deg) scale(0.95)" }
    : { transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)", transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)" };

  return (
    <motion.div key="act3" exit={{ opacity: 0 }} className="absolute inset-0 bg-[#020617] flex items-center justify-center overflow-hidden">
      
      {/* Кровавый пульсирующий фон (Match Point) */}
      <div className="absolute inset-0 bg-heartbeat z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.9)_100%)] z-10 pointer-events-none" />

      {/* Арена (3D-контейнер) */}
      <div className="relative z-20 flex items-center justify-center w-full h-full" style={{ perspective: "1500px" }}>
        <div 
          className="relative w-[380px] max-w-[92vw] h-[720px] max-h-[90vh] bg-slate-950 rounded-[2rem] border border-slate-800 shadow-[0_40px_100px_rgba(220,38,38,0.15)] overflow-hidden flex flex-col will-change-transform" 
          style={arena3DStyle}
        >
          {/* Header */}
          <div className="bg-gradient-to-b from-red-950/40 to-slate-950 border-b border-red-900/50 pt-10 pb-4 px-6 flex justify-between items-center relative z-20">
            <div className="flex flex-col">
              <span className="text-cyan-500 font-black uppercase tracking-widest text-[10px] mb-1">YOU</span>
              <span className="text-3xl font-black text-white">14</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse mb-1">Match Point</div>
              <div className={`text-2xl font-mono font-black flex items-center gap-1 ${battlePhase >= 5 ? 'text-white' : 'text-red-500'}`}>
                <Timer className="w-5 h-5" /> {timeLeft}
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-red-500 font-black uppercase tracking-widest text-[10px] mb-1 flex items-center gap-1 justify-end">
                <Skull className="w-3 h-3"/> BOSS
              </span>
              <span className="text-3xl font-black text-white">14</span>
            </div>
          </div>

          <div className="flex h-1 bg-slate-900 w-full relative z-20">
            <motion.div className="bg-cyan-500 w-[95%]" />
            <motion.div className="bg-red-500 w-[95%] ml-auto" />
          </div>

          {/* Задача */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-20">
            <div className={`w-full p-8 rounded-3xl text-center transition-colors duration-300 ${battlePhase >= 3 ? 'bg-red-950/30 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-slate-900/50 border border-slate-800'}`}>
              <div className="text-4xl md:text-5xl font-medium text-white drop-shadow-md">
                <Latex>{"$$\\int_0^{\\pi} \\sin^2(x) dx$$"}</Latex>
              </div>
            </div>

            {/* Инпут */}
            <div className={`w-full h-16 mt-6 border rounded-xl flex items-center justify-center text-4xl font-mono font-black transition-all ${battlePhase >= 4 ? 'bg-white border-white text-black shadow-[0_0_40px_rgba(255,255,255,0.8)] scale-105' : 'bg-slate-950 border-slate-700 text-white'}`}>
              {battlePhase >= 2 ? <span>2</span> : <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.3 }}>_</motion.span>}
            </div>
          </div>

          <ArenaKeypad pressedKey={pressedKey} combo={combo} />

          {/* УДАР (FLAWLESS EXECUTION) */}
          <AnimatePresence>
            {battlePhase >= 5 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
              >
                {/* Эффект линзы (Свечение по центру) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-white/20 blur-[60px] rounded-full" />
                
                <motion.div 
                  initial={{ scale: 2, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ type: "spring", damping: 12, stiffness: 150 }}
                  className="flex flex-col items-center relative z-10"
                >
                  <Target className="w-24 h-24 text-white mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,1)]" />
                  <div className="text-3xl md:text-4xl font-black text-white uppercase tracking-[0.2em] text-center leading-tight">
                    Flawless<br/>Execution
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Act4_PremiumFinale = ({ onAction, onClose }: { onAction: () => void; onClose: () => void }) => {
  return (
    <motion.div key="act4" className="absolute inset-0 bg-[#000000] flex flex-col items-center justify-center z-[200] overflow-hidden">
      
      {/* Дорогой фоновый засвет */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 0.3, scale: 1 }} 
        transition={{ duration: 4, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[radial-gradient(circle,_rgba(220,38,38,0.4)_0%,_transparent_70%)] pointer-events-none"
      />

      <div className="relative z-40 flex flex-col items-center justify-center w-full px-4">
        
        {/* Главный логотип плавно выезжает из темноты */}
        <motion.div 
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }} 
          className="flex flex-col items-center w-full"
        >
          {/* Свип-блик по тексту */}
          <div className="relative overflow-hidden p-4">
            <h1 className="text-6xl md:text-[9rem] font-black text-white uppercase tracking-tighter leading-none w-full text-center drop-shadow-2xl">
              MATHLAB
            </h1>
            <motion.div 
              initial={{ left: "-100%" }}
              animate={{ left: "200%" }}
              transition={{ delay: 1.5, duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12"
            />
          </div>
          
          <div className="flex items-center gap-6 mt-2">
             <div className="h-[1px] w-12 md:w-24 bg-red-600" />
             <p className="text-xl md:text-3xl font-black text-red-500 uppercase tracking-[0.4em]">
               PvP Arena
             </p>
             <div className="h-[1px] w-12 md:w-24 bg-red-600" />
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.8, type: "spring", bounce: 0.5 }}
            whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { onClose(); onAction(); }}
            className="mt-16 px-12 py-5 border-2 border-white/20 hover:border-white text-white font-bold text-sm md:text-lg uppercase tracking-widest flex items-center gap-3 transition-colors"
          >
            <Swords className="w-5 h-5" /> Prove Your Rank
          </motion.button>

        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ С ЦВЕТОКОРРЕКЦИЕЙ
// ============================================================================
export function WarTrailer({ onClose, onAction }: Props) {
  const[phase, setPhase] = useState<number>(1);
  const gotoPhase = (p: number) => setPhase(p);

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden font-sans select-none epic-color-grade">
      <WarStyles />
      <div className="cinematic-tint" />
      <div className="film-grain-overlay" />
      <div className="war-vignette" />
      <div className="tactical-scanlines" />

      {/* Прогресс-бар фильма */}
      <div className="absolute top-0 left-0 h-1 bg-slate-900 w-full z-[10000]">
        <motion.div
          className="h-full bg-red-600"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 11, ease: 'linear' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 1 && <Act1_Manifesto onComplete={() => gotoPhase(2)} />}
        {phase === 2 && <Act2_Factions onComplete={() => gotoPhase(3)} />}
        {phase === 3 && <Act3_WarArena onComplete={() => gotoPhase(4)} />}
        {phase === 4 && <Act4_PremiumFinale onAction={onAction} onClose={onClose} />}
      </AnimatePresence>
    </div>
  );
}