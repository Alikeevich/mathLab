import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Timer, CheckCircle2
} from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

type Props = {
  onClose: () => void;
  onAction: () => void;
};

// ============================================================================
// СТИЛИ
// ============================================================================
const WarStyles = () => (
  <style>{`
    .war-vignette { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, transparent 15%, rgba(0,0,0,0.95) 100%); z-index: 100; pointer-events: none; }
    .tactical-scanlines { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%); background-size: 100% 4px; z-index: 99; opacity: 0.6; }
    .camera-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both infinite; }
    @keyframes shake { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-2px,2px) rotate(-1deg)} 50%{transform:translate(2px,-1px) rotate(1deg)} 75%{transform:translate(-1px,-2px) rotate(0)} }
    .strobe-flash { animation: strobe 0.06s steps(1) infinite; }
    @keyframes strobe { 0% { opacity: 1 } 50% { opacity: 0.2 } 100% { opacity: 1 } }
  `}</style>
);

// НЕПРИМЕТНЫЙ МАТ ДОЖДЬ (только в Act 2)
const SubtleMathRain = () => {
  const equations = [
    "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
    "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
    "e^{i\\pi} + 1 = 0",
    "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}",
    "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
    "A = U \\Sigma V^T",
    "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
    "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-18 z-0">
      {equations.map((eq, i) => (
        <motion.div
          key={i}
          initial={{ y: -100, x: Math.random() * 100 + "vw", opacity: 0 }}
          animate={{ y: "110vh", opacity: [0, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: i * 0.6, ease: "linear" }}
          className="absolute text-cyan-400 font-bold text-xl md:text-4xl"
          style={{ left: `${Math.random() * 80}vw` }}
        >
          <Latex>{`$${eq}$`}</Latex>
        </motion.div>
      ))}
    </div>
  );
};

// Тактический HUD
const TacticalHUD = () => (
  <div className="absolute inset-0 pointer-events-none z-[90] opacity-30 text-white font-mono text-[10px] uppercase">
    <div className="absolute top-8 left-8 border-t-2 border-l-2 border-white w-16 h-16" />
    <div className="absolute top-8 right-8 border-t-2 border-r-2 border-white w-16 h-16" />
    <div className="absolute bottom-8 left-8 border-b-2 border-l-2 border-white w-16 h-16" />
    <div className="absolute bottom-8 right-8 border-b-2 border-r-2 border-white w-16 h-16" />
    <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-4">
      <span className="flex items-center gap-1 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> REC</span>
      <span>HQ-LINK: SECURE</span>
      <span>1080P/60FPS</span>
    </div>
  </div>
);

// Клавиатура (из первой кинематики)
const MockKeypad = ({ pressedKey }: { pressedKey: string | null }) => {
  const rows = [['7','8','9','÷'],['4','5','6','×'],['1','2','3','−'],['±','0','.','+']];
  return (
    <div className="bg-slate-900 border-t border-slate-800 p-2 pb-4 relative z-20">
      <div className="flex justify-between items-center px-2 py-2 mb-2 border-b border-slate-800/50">
        <div className="text-slate-400 font-bold text-sm">123</div>
        <div className="text-cyan-500 font-bold text-sm">ENTER</div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {rows.flat().map(k => {
          const isPressed = pressedKey === k;
          return (
            <div key={k} className={`h-10 md:h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-all duration-75 ${
              isPressed ? 'bg-cyan-400 text-slate-900 scale-90 shadow-[0_0_30px_rgba(34,211,238,0.8)]' :
              ['÷','×','−','+'].includes(k) ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'bg-slate-800 text-white border border-slate-700'
            }`}>
              {k}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <div className="h-10 md:h-12 flex-[1.5] bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-sm font-bold text-slate-400">abc</div>
        <div className={`h-10 md:h-12 flex-[3.5] rounded-xl flex items-center justify-center font-bold transition-all duration-75 ${
          pressedKey === 'ENTER' ? 'bg-emerald-400 text-slate-900 scale-95 shadow-[0_0_40px_rgba(52,211,153,1)]' : 'bg-cyan-600 text-white'
        }`}>
          ENTER
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// СЦЕНЫ
// ============================================================================

// Act1_Intro теперь раскрывает сначала "In a world" затем отдельной линией "where intelligence is a power"
const Act1_Intro = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    // авто-завершение: покажем первую фразу, затем вторую, затем резкий blackout и сигнализируем completion
    const t1 = setTimeout(() => {/* first line fully visible */}, 900);
    const t2 = setTimeout(() => {/* second line */}, 1700);
    const t3 = setTimeout(() => {
      // быстрый blackout — небольшой fade
      onComplete();
    }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div key="act1" exit={{ opacity: 0 }} className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      <TacticalHUD />
      <div className="text-center px-4">
        <motion.h1
          initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.96 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="text-4xl md:text-6xl font-serif text-white tracking-[0.2em] uppercase leading-relaxed"
        >
          In a world
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 1.0, duration: 0.6, ease: 'easeOut' }}
          className="text-xl md:text-2xl font-serif text-slate-300 mt-6"
        >
          where <span className="text-white font-black">intelligence</span> is <span className="text-red-600 font-black">power</span>
        </motion.h2>
      </div>
    </motion.div>
  );
};

// Act2_Factions: больше фракций, быстрее перелистывание и ускорение по мере прогресса
const Act2_Factions = () => {
  const [index, setIndex] = useState(0);

  const factions = [
    { name: "ЛОГИКА", color: "text-emerald-400", bg: "bg-emerald-950", sub: "SYS_01: BASE_OPERATIONS" },
    { name: "АЛГЕБРА", color: "text-blue-400", bg: "bg-blue-950", sub: "SYS_02: VARIABLE_WARFARE" },
    { name: "МАТ. АНАЛИЗ", color: "text-cyan-400", bg: "bg-cyan-950", sub: "SYS_03: LIMIT_BREAK" },
    { name: "ГЕОМЕТРИЯ", color: "text-pink-400", bg: "bg-pink-950", sub: "SYS_04: SPATIAL_TACTICS" },
    { name: "КОМБИНАТОРИКА", color: "text-amber-400", bg: "bg-amber-950", sub: "SYS_05: CHAOS_THEORY" },
    { name: "ТРИГОНОМЕТРИЯ", color: "text-red-400", bg: "bg-red-950", sub: "SYS_06: WAVE_ASSAULT" },
    { name: "СТАТИСТИКА", color: "text-violet-400", bg: "bg-violet-950", sub: "SYS_07: PROB_STRIKE" },
    { name: "КОМПЬЮТЕРКА", color: "text-sky-400", bg: "bg-sky-950", sub: "SYS_08: ALGO_ASSAULT" },
    { name: "КРИПТОГРАФИЯ", color: "text-lime-400", bg: "bg-lime-950", sub: "SYS_09: CIPHER_WAR" },
    { name: "ДИФФУРЫ", color: "text-amber-300", bg: "bg-amber-900", sub: "SYS_10: FLOW_CONTROL" },
    { name: "ТОПОГРАФИЯ", color: "text-rose-300", bg: "bg-rose-900", sub: "SYS_11: MAP_DOMINION" },
    { name: "СИСТЕМА", color: "text-white", bg: "bg-white", sub: "ALL SYSTEMS CRITICAL", strobe: true }
  ];

  // начальная задержка (ms) — уменьшится с каждой карточки
  const startDelay = 160;

  useEffect(() => {
    let cancelled = false;

    const tick = (i: number) => {
      if (cancelled) return;
      if (i >= factions.length - 1) return setIndex(factions.length - 1);

      // ускорение: чем больше i — тем меньше задержка
      const delay = Math.max(40, Math.round(startDelay - i * 10));

      setTimeout(() => {
        setIndex(prev => Math.min(prev + 1, factions.length - 1));
        tick(i + 1);
      }, delay);
    };

    tick(0);
    return () => { cancelled = true; };
  }, []);

  const current = factions[index];
  const delayForAnim = Math.max(0.06, Math.min(0.25, (Math.max(40, 160 - index * 10) / 1000) * 0.9));

  return (
    <motion.div key="act2" className={`absolute inset-0 flex flex-col items-center justify-center ${current.strobe ? 'strobe-flash' : current.bg}`}>
      <TacticalHUD />
      <SubtleMathRain />
      <div className="relative z-10 text-center w-full px-4">
        <div className="flex justify-between px-6 md:px-32 absolute top-10 w-full text-slate-500 font-mono text-xs md:text-sm">
          <span>{current.sub}</span>
          <span>[ FILE {index + 1}/{factions.length} ]</span>
        </div>

        <motion.h2
          key={index}
          initial={{ scale: 1.6, filter: 'blur(10px)', opacity: 0 }}
          animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
          transition={{ duration: delayForAnim, ease: 'linear' }}
          className={`text-6xl md:text-[8rem] font-black uppercase tracking-tighter ${current.color} drop-shadow-[0_0_30px_currentColor]`}
        >
          {current.name}
        </motion.h2>
      </div>
    </motion.div>
  );
};

const Act3_WarArena = () => {
  const [battlePhase, setBattlePhase] = useState(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [matchTimer, setMatchTimer] = useState(3);

  useEffect(() => {
    const t1 = setTimeout(() => setBattlePhase(1), 800);
    const t2 = setTimeout(() => { setBattlePhase(2); setPressedKey('4'); }, 2200);
    const t3 = setTimeout(() => setPressedKey(null), 2350);
    const t4 = setTimeout(() => { setBattlePhase(3); setPressedKey('ENTER'); }, 3000);
    const t5 = setTimeout(() => { setPressedKey(null); setBattlePhase(4); }, 3150);
    const t6 = setTimeout(() => setBattlePhase(5), 3300);

    const countdown = setInterval(() => setMatchTimer(p => Math.max(p - 1, 0)), 1000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
      clearInterval(countdown);
    };
  }, []);

  return (
    <motion.div key="act3" exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 bg-[#020617] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.1),_transparent_60%)]" />
      <motion.div className="relative w-[340px] max-w-[95vw] h-[680px] max-h-[85vh] bg-slate-950 rounded-[3rem] border-[10px] border-slate-800 shadow-[0_0_100px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col z-20">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50 shadow-inner" />

        <div className="bg-slate-900 border-b border-slate-800 pt-12 pb-4 px-4 flex justify-between items-center shadow-lg relative z-20">
          <div className="flex flex-col">
            <span className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">YOU</span>
            <span className="text-3xl font-black text-white">15</span>
          </div>
          <motion.div
            animate={battlePhase >= 1 && battlePhase < 5 ? { color: ["#fff", "#ef4444", "#fff"], scale: [1, 1.1, 1] } : {}}
            className="text-2xl font-mono font-black text-white flex items-center gap-1"
          >
            <Timer className="w-5 h-5" /> 00:0{matchTimer}
          </motion.div>
          <div className="flex flex-col text-right">
            <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">BOSS</span>
            <span className="text-3xl font-black text-white">14</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-20">
          <motion.div className="bg-slate-800/90 border-2 border-slate-700 w-full p-8 rounded-3xl text-center shadow-xl mb-6">
            <div className="text-4xl font-black text-white"><Latex>{"$\\sqrt{16} = ?$"}</Latex></div>
          </motion.div>
          <div className="w-full h-16 bg-slate-900 border border-cyan-500/50 rounded-xl flex items-center justify-center text-4xl font-mono font-bold text-cyan-400">
            {battlePhase >= 2 && <span>4</span>}
            {battlePhase < 5 && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>_</motion.span>}
          </div>
        </div>

        <MockKeypad pressedKey={pressedKey} />

        <AnimatePresence>
          {battlePhase >= 5 && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-32 h-32 text-emerald-400 mb-6 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]" />
              <h2 className="text-5xl font-black text-emerald-400 italic">ВЕРНО!</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const Act4_Blackout = () => (
  <motion.div key="act4" className="absolute inset-0 bg-black flex items-center justify-center z-[200]">
    <motion.h1
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="text-4xl md:text-6xl font-serif italic text-white tracking-widest"
    >
      The smartest survive.
    </motion.h1>
  </motion.div>
);

const Act5_Outro = ({ onAction, onClose }: { onAction: () => void; onClose: () => void }) => (
  <motion.div key="act5" className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[200]">
    <div className="flex flex-col items-center text-center relative z-20">
      <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-red-600 p-2 shadow-[0_0_80px_rgba(220,38,38,0.6)] bg-slate-900 overflow-hidden mb-6">
        <img src="/meerkat-logo.png" className="w-full h-full object-contain filter grayscale contrast-125" alt="Logo" />
      </div>
      <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-10">
        MATHLAB <span className="text-red-600">PVP</span>
      </h1>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { onClose(); onAction(); }}
        className="px-10 py-5 bg-red-600 text-white font-black text-xl md:text-3xl uppercase tracking-widest rounded-xl flex items-center gap-4"
      >
        <Swords className="w-8 h-8" /> ВСТУПИТЬ В БОЙ
      </motion.button>
    </div>
  </motion.div>
);

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================================
export function WarTrailer({ onClose, onAction }: Props) {
  const [phase, setPhase] = useState<number>(1);

  useEffect(() => {
    // остальные фазы — дублируем обычный таймлайн, но фаза 2 теперь запускается когда Act1 вызовет onComplete
    const timeline = [
      // фаза 1: intro управляется Act1 и вызывает setPhase(2) через callback
      { p: 3, t: 4200 }, // Act3 после показа фракций
      { p: 4, t: 7600 },
      { p: 5, t: 9800 }
    ];

    const timeouts = timeline.map(s => setTimeout(() => setPhase(s.p), s.t));
    return () => timeouts.forEach(clearTimeout);
  }, []);

  // callback для Act1 — сразу переводим на фазу 2 (быстрый blackout анимация внутри Act1)
  const handleIntroComplete = () => {
    // small delay to allow a clean blackout snap
    setPhase(2);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden font-sans select-none">
      <WarStyles />
      <div className="war-vignette" />
      <div className="tactical-scanlines" />

      <div className="absolute top-0 left-0 h-1 bg-slate-900 w-full z-[10000]">
        <motion.div
          className="h-full bg-red-600"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 10, ease: "linear" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 1 && <Act1_Intro onComplete={handleIntroComplete} />}
        {phase === 2 && <Act2_Factions />}
        {phase === 3 && <Act3_WarArena />}
        {phase === 4 && <Act4_Blackout />}
        {phase === 5 && <Act5_Outro onAction={onAction} onClose={onClose} />}
      </AnimatePresence>
    </div>
  );
}
