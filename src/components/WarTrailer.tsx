import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Crosshair, Target, ShieldAlert, Zap, Skull,
  Terminal, Activity, ChevronRight, Swords, Target as Cross
} from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

type Props = { onClose: () => void; onAction: () => void };

// ============================================================================
// 1. СТИЛИ + ЭПИЧНЫЙ ДОЖДЬ ИЗ ФОРМУЛ (ВОЕННЫЙ ВАРИАНТ)
// ============================================================================
const WarStyles = () => (
  <style>{`
    .war-vignette { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, transparent 15%, rgba(0,0,0,0.98) 100%); z-index: 100; pointer-events: none; }
    .tactical-scanlines { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(255,0,0,0.15) 50%); background-size: 100% 4px; z-index: 99; opacity: 0.7; }
    .camera-shake { animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both infinite; }
    .impact-flash { animation: impact 0.15s forwards; }
    @keyframes shake { 0%,100%{transform:translate(0,0) rotate(0)} 20%{transform:translate(-4px,3px) rotate(-1.5deg)} 40%{transform:translate(5px,-3px) rotate(1deg)} 60%{transform:translate(-3px,4px) rotate(-0.5deg)} 80%{transform:translate(3px,-2px) rotate(1deg)} }
    @keyframes impact { 0%{opacity:0.9; transform:scale(1.3)} 100%{opacity:0; transform:scale(2)} }
    .glitch { animation: glitch 0.2s linear infinite; }
    @keyframes glitch { 0%{transform:translate(0)} 20%{transform:translate(-3px,3px)} 40%{transform:translate(3px,-3px)} 60%{transform:translate(-2px,2px)} 80%{transform:translate(2px,-2px)} 100%{transform:translate(0)} }
  `}</style>
);

// ЭПИЧНЫЙ ВОЕННЫЙ ДОЖДЬ ИЗ ФОРМУЛ (красный + взрывы)
const WarMathRain = () => {
  const equations = [
    "\\int e^{2x} dx", "e^{i\\pi}+1=0", "\\nabla \\times E = -\\partial B/\\partial t",
    "\\sum 1/n^2 = \\pi^2/6", "A = U \\Sigma V^T", "\\Delta x \\Delta p \\geq \\hbar/2",
    "\\int_{-\\infty}^{\\infty} e^{-x^2} dx", "\\sin^2 x + \\cos^2 x = 1", "F = ma",
    "x = -b \\pm \\sqrt{b^2-4ac}", "\\lim (1+1/n)^n = e", "\\phi = (1+\\sqrt{5})/2"
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {equations.map((eq, i) => (
        <motion.div
          key={i}
          initial={{ y: -200, x: Math.random() * 100 + "vw", rotate: Math.random() * 40 - 20 }}
          animate={{ y: "110vh", rotate: Math.random() * 60 - 30 }}
          transition={{ duration: 1.8 + Math.random() * 2.5, repeat: Infinity, delay: i * 0.12, ease: "linear" }}
          className="absolute text-red-400 font-black text-3xl md:text-6xl drop-shadow-[0_0_20px_#ef4444] mix-blend-screen"
        >
          <Latex>{`$${eq}$`}</Latex>
        </motion.div>
      ))}
    </div>
  );
};

// Тактический HUD (оставил твой, только чуть ярче)
const TacticalHUD = () => (
  <div className="absolute inset-0 pointer-events-none z-[90] text-white/70 font-mono text-xs uppercase tracking-widest">
    <div className="absolute top-6 left-6 border border-red-600/70 w-20 h-20" />
    <div className="absolute top-6 right-6 border border-red-600/70 w-20 h-20" />
    <div className="absolute bottom-6 left-6 border border-red-600/70 w-20 h-20" />
    <div className="absolute bottom-6 right-6 border border-red-600/70 w-20 h-20" />
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-6 text-red-500">
      <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> LIVE FEED</span>
      <span>ENCRYPTED • 1080P</span>
    </div>
    <Cross className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-10" />
  </div>
);

// ============================================================================
// СЦЕНЫ (улучшенные)
// ============================================================================
const Act1_Intro = () => (
  <motion.div key="act1" exit={{ opacity: 0 }} className="absolute inset-0 bg-black flex items-center justify-center">
    <TacticalHUD />
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 2 }} className="text-center px-6">
      <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
        IN A WORLD<br />WHERE <span className="text-red-600">MATH</span><br />IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">WAR</span>
      </h1>
    </motion.div>
  </motion.div>
);

const Act2_Factions = () => {
  const [index, setIndex] = useState(0);
  const factions = [ /* твой массив оставил */ 
    { name: "ЛОГИКА", color: "text-emerald-500", bg: "bg-emerald-950" },
    { name: "АЛГЕБРА", color: "text-blue-500", bg: "bg-blue-950" },
    { name: "МАТ. АНАЛИЗ", color: "text-cyan-500", bg: "bg-cyan-950" },
    { name: "ГЕОМЕТРИЯ", color: "text-pink-500", bg: "bg-pink-950" },
    { name: "КОМБИНАТОРИКА", color: "text-amber-500", bg: "bg-amber-950" },
    { name: "ТРИГОНОМЕТРИЯ", color: "text-red-500", bg: "bg-red-950" },
    { name: "СИСТЕМА", color: "text-white", bg: "bg-red-950", strobe: true }
  ];

  useEffect(() => {
    const int = setInterval(() => setIndex(i => (i + 1) % factions.length), 160);
    return () => clearInterval(int);
  }, []);

  const cur = factions[index];

  return (
    <motion.div key="act2" className={`absolute inset-0 flex items-center justify-center ${cur.bg} overflow-hidden ${cur.strobe ? 'strobe-flash' : ''}`}>
      <TacticalHUD />
      <WarMathRain />
      <motion.h2
        key={index}
        initial={{ scale: 2, filter: "blur(20px)" }}
        animate={{ scale: 1, filter: "blur(0)" }}
        className={`text-[7rem] md:text-[10rem] font-black uppercase tracking-[-0.07em] ${cur.color} drop-shadow-[0_0_60px_currentColor] glitch`}
      >
        {cur.name}
      </motion.h2>
    </motion.div>
  );
};

const Act3_WarArena = () => {
  const [hpYou, setHpYou] = useState(20);
  const [hpEnemy, setHpEnemy] = useState(20);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const times = [800, 1600, 2400, 3100, 3900];
    times.forEach((t, i) => setTimeout(() => {
      setPhase(i + 1);
      if (i % 2 === 0) setHpEnemy(p => Math.max(0, p - 3));
      else setHpYou(p => Math.max(0, p - 2));
    }, t));
  }, []);

  return (
    <motion.div key="act3" exit={{ opacity: 0 }} className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center">
      <TacticalHUD />
      <WarMathRain />
      <div className={`relative w-full max-w-6xl h-[85vh] flex flex-col ${phase >= 2 ? 'camera-shake' : ''}`}>

        {/* Хедер + HP бары */}
        <div className="flex justify-between px-8 pt-8">
          <div className="text-left">
            <div className="text-cyan-400 font-mono text-sm">SQUAD ALPHA</div>
            <div className="text-6xl font-black text-white tabular-nums">{hpYou}</div>
            <div className="h-2 bg-cyan-500 w-64 mt-2 rounded" style={{ width: `${hpYou * 5}%` }} />
          </div>
          <div className="text-right">
            <div className="text-red-500 font-mono text-sm">HOSTILE TARGET</div>
            <div className="text-6xl font-black text-white tabular-nums">{hpEnemy}</div>
            <div className="h-2 bg-red-500 w-64 mt-2 rounded ml-auto" style={{ width: `${hpEnemy * 5}%` }} />
          </div>
        </div>

        {/* Центральная зона боя */}
        <div className="flex-1 flex items-center justify-center relative">
          <motion.div
            animate={phase >= 3 ? { scale: [1, 1.15, 1] } : {}}
            className="bg-zinc-950 border-4 border-red-600 px-16 py-10 text-center relative"
          >
            <div className="text-7xl font-black text-white"><Latex>{"$\\int e^{2x} dx$"}</Latex></div>
            {phase >= 4 && <div className="absolute inset-0 bg-red-600/30 impact-flash" />}
          </motion.div>

          {/* FATAL HIT */}
          <AnimatePresence>
            {phase >= 5 && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.4, rotate: 10 }}
                exit={{ opacity: 0 }}
                className="absolute text-[14rem] font-black text-red-600 tracking-[-0.1em] drop-shadow-[0_0_120px_#dc2626] pointer-events-none"
              >
                FATAL!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Act4_Blackout = () => (
  <motion.div key="act4" className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
    <WarMathRain />
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="text-8xl font-black text-red-600 tracking-widest mb-6">THE SMARTEST</div>
      <div className="text-8xl font-black text-white tracking-widest">SURVIVE.</div>
    </motion.div>
  </motion.div>
);

const Act5_Outro = ({ onAction }: { onAction: () => void }) => (
  <motion.div key="act5" className="absolute inset-0 bg-black flex flex-col items-center justify-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle,#dc262680_10%,transparent_70%)]" />
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="mb-12">
      <div className="w-40 h-40 rounded-full border-[8px] border-red-600 p-3 shadow-[0_0_120px_#dc2626] bg-black">
        <img src="/meerkat-logo.png" className="w-full h-full object-contain" alt="Logo" />
      </div>
    </motion.div>
    <h1 className="text-8xl font-black text-white tracking-tighter mb-8">MATHLAB <span className="text-red-600">PVP</span></h1>
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAction}
      className="px-14 py-6 bg-red-600 hover:bg-red-700 text-3xl font-black uppercase tracking-widest rounded-2xl flex items-center gap-5 shadow-[0_0_60px_#dc2626]"
    >
      <Swords className="w-10 h-10" /> ВСТУПИТЬ В БОЙ
    </motion.button>
  </motion.div>
);

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================================
export function WarTrailer({ onClose, onAction }: Props) {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const timeline = [
      { p: 1, t: 0 },
      { p: 2, t: 2800 },
      { p: 3, t: 6200 },
      { p: 4, t: 10800 },
      { p: 5, t: 13800 }
    ];
    const timeouts = timeline.map(s => setTimeout(() => setPhase(s.p), s.t));
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden select-none">
      <WarStyles />
      <div className="war-vignette" />
      <div className="tactical-scanlines" />

      <div className="absolute top-0 left-0 h-1 bg-red-950 w-full z-[10000]">
        <motion.div className="h-full bg-red-600" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 16.5, ease: "linear" }} />
      </div>

      <AnimatePresence mode="wait">
        {phase === 1 && <Act1_Intro />}
        {phase === 2 && <Act2_Factions />}
        {phase === 3 && <Act3_WarArena />}
        {phase === 4 && <Act4_Blackout />}
        {phase === 5 && <Act5_Outro onAction={() => { onClose(); onAction(); }} />}
      </AnimatePresence>
    </div>
  );
}