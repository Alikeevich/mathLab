import React, { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, ChevronRight, Target, 
  Activity, Trophy, Swords, Crown, ArrowUp
} from 'lucide-react';

type Props = {
  onClose: () => void;
  onAction: () => void;
};

// ============================================================================
// 1. ГЛОБАЛЬНЫЕ СТИЛИ И ЭФФЕКТЫ (КИНОШНАЯ КАМЕРА)
// ============================================================================
const GlobalStyles = () => (
  <style>{`
    .film-grain {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
    }
    
    .vignette-heavy {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.95) 100%);
      pointer-events: none;
      z-index: 9998;
    }

    /* Мягкое "дыхание" камеры для атмосферы */
    @keyframes camera-breathe {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    .anim-breathe {
      animation: camera-breathe 8s ease-in-out infinite;
    }
  `}</style>
);

// Фоновые частицы (мягкие)
const CinematicParticles = () => {
  const[particles, setParticles] = useState<any[]>([]);
  
  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 10 + 10,
      blur: Math.random() * 4 + 1,
      char: Math.random() > 0.5 ? '+' : '×'
    }));
    setParticles(p);
  },[]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: `${p.y}vh`, x: `${p.x}vw`, opacity: 0 }}
          animate={{ 
            y:[`${p.y}vh`, `${p.y - 20}vh`],
            opacity: [0, 0.3, 0],
            rotate: [0, 90]
          }}
          transition={{ duration: p.speed, repeat: Infinity, ease: "linear" }}
          className="absolute text-cyan-500 font-bold mix-blend-screen"
          style={{ fontSize: `${p.size}rem`, filter: `blur(${p.blur}px)` }}
        >
          {p.char}
        </motion.div>
      ))}
    </div>
  );
};

// Аватар Суриката (с защитой от кривых размеров)
const MeerkatAvatar = ({ src, reverse = false, size = "md" }: { src: string, reverse?: boolean, size?: "md" | "lg" }) => {
  const sizeClasses = size === "lg" ? "w-40 h-40 md:w-56 md:h-56" : "w-32 h-32 md:w-40 md:h-40";
  
  return (
    <motion.div 
      animate={{ y:[0, -8, 0], scale: reverse ? [-1, 1] : [1, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`relative ${sizeClasses} flex-shrink-0 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]`}
    >
      <img 
        src={src} 
        alt="Companion" 
        className="w-full h-full object-contain filter contrast-125 brightness-90"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback&backgroundColor=transparent';
        }}
      />
    </motion.div>
  );
};

// Текст с киношным фокусом
const CinematicText = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ filter: "blur(20px)", opacity: 0, scale: 1.05 }}
    animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
    transition={{ duration: 1.5, delay, cubicBezier:[0.19, 1, 0.22, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================================================
// 2. СЦЕНЫ ТРЕЙЛЕРА (Железобетонная верстка и плавные тайминги)
// ============================================================================

// СЦЕНА 1: Завязка (Медленная, атмосферная)
const SceneIntro = forwardRef<HTMLDivElement, any>((props, ref) => (
  <motion.div 
    ref={ref} 
    exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }} 
    transition={{ duration: 1.5 }} 
    className="absolute inset-0 bg-[#020617] flex items-center justify-center anim-breathe"
  >
    <CinematicParticles />
    <div className="text-center px-6 relative z-10 max-w-5xl mx-auto">
      <CinematicText delay={0.5} className="text-2xl md:text-4xl font-black text-slate-400 tracking-[0.3em] uppercase mb-6">
        Они думали, это просто цифры
      </CinematicText>
      <CinematicText delay={2.0} className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-2xl">
        Но на Арене <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Побеждает Скорость</span>
      </CinematicText>
    </div>
  </motion.div>
));

// СЦЕНА 2: Матчмейкинг (Чистый радар, без скачков)
const SceneMatchmaking = forwardRef<HTMLDivElement, any>((props, ref) => (
  <motion.div 
    ref={ref} 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0, filter: "blur(10px)" }} 
    transition={{ duration: 1 }}
    className="absolute inset-0 bg-[#020617] flex flex-col items-center justify-center"
  >
    <div className="relative z-10 text-center flex flex-col items-center w-full max-w-2xl px-4">
      
      {/* Радар */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 mb-10 flex items-center justify-center">
        <motion.div animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 border border-cyan-500 rounded-full" />
        <motion.div animate={{ scale:[1, 1.8], opacity: [0.8, 0] }} transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 border-2 border-cyan-400 rounded-full" />
        <div className="w-20 h-20 bg-cyan-950/80 rounded-full border border-cyan-400 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.5)]">
          <Activity className="w-10 h-10 text-cyan-400" />
        </div>
      </div>
      
      <motion.h2 animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-3xl md:text-5xl font-black text-white tracking-[0.3em] uppercase mb-2">
        Поиск соперника
      </motion.h2>
      <div className="text-cyan-500/80 font-mono text-lg tracking-widest">ESTIMATED TIME: 0:02</div>

      {/* Найденная цель (Появляется плавно, не ломая верстку) */}
      <div className="h-32 mt-8 flex items-end justify-center w-full">
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.8, type: "spring" }}
            className="bg-red-950/60 border border-red-500/50 px-8 py-4 rounded-2xl backdrop-blur-xl flex items-center gap-6 w-full max-w-md shadow-[0_0_40px_rgba(239,68,68,0.2)]"
          >
            <div className="w-14 h-14 bg-red-500/20 rounded-full flex-shrink-0 flex items-center justify-center border border-red-500">
              <Shield className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-left flex-1">
              <div className="text-red-500 font-black tracking-widest text-xs mb-1 uppercase">Target Locked</div>
              <div className="text-white font-black text-2xl truncate">FAKER_MATH</div>
              <div className="text-slate-400 font-mono text-xs mt-1">GRANDMASTER • 2800 MP</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
));

// СЦЕНА 3: Экран VS (Жесткая Grid-верстка, ничего не наезжает)
const SceneVS = forwardRef<HTMLDivElement, any>((props, ref) => (
  <motion.div 
    ref={ref} 
    initial={{ opacity: 0, filter: "blur(20px)" }} 
    animate={{ opacity: 1, filter: "blur(0px)" }} 
    exit={{ scale: 1.2, opacity: 0, filter: "blur(20px)" }} 
    transition={{ duration: 1.2 }}
    className="absolute inset-0 bg-[#020617] flex items-center justify-center overflow-hidden"
  >
    {/* Разделенный фон */}
    <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-cyan-950/60 to-transparent" />
    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-red-950/60 to-transparent" />

    {/* Сетка 3 колонок: Игрок | VS | Оппонент */}
    <div className="w-full max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 items-center gap-8 relative z-10">
      
      {/* Игрок */}
      <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.3, type: "spring" }} className="flex flex-col items-center text-center">
        <MeerkatAvatar src="/meerkat-hero.png" size="lg" />
        <div className="mt-6">
          <div className="text-cyan-400 font-black tracking-widest text-lg md:text-xl mb-1 uppercase">Challenger</div>
          <div className="text-5xl md:text-7xl font-black text-white leading-none">GUEST</div>
        </div>
      </motion.div>

      {/* Значок VS */}
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.8, type: "spring", bounce: 0.5 }} className="flex justify-center items-center py-8 md:py-0">
        <div className="text-[6rem] md:text-[10rem] font-black italic text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] relative">
          <span className="absolute -left-2 -top-2 text-cyan-500 opacity-60 mix-blend-screen">VS</span>
          <span className="absolute left-2 top-2 text-red-500 opacity-60 mix-blend-screen">VS</span>
          VS
        </div>
      </motion.div>

      {/* Оппонент */}
      <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.5, type: "spring" }} className="flex flex-col items-center text-center">
        <MeerkatAvatar src="/meerkat-evil.png" reverse size="lg" />
        <div className="mt-6">
          <div className="text-red-500 font-black tracking-widest text-lg md:text-xl mb-1 uppercase">Grandmaster</div>
          <div className="text-5xl md:text-7xl font-black text-white leading-none">FAKER_MATH</div>
        </div>
      </motion.div>

    </div>
  </motion.div>
));

// СЦЕНА 4: Геймплей (Логичный сценарий, понятный UI)
const SceneGameplay = forwardRef<HTMLDivElement, any>((props, ref) => {
  const [gameState, setGameState] = useState({
    me: 0,
    opp: 0,
    task: "14 × 15",
    combo: "",
    isSlowMo: false
  });

  // Внутренняя режиссура геймплея (длится ~8 секунд)
  useEffect(() => {
    // 0-2s: Оппонент вырывается вперед
    const t1 = setTimeout(() => setGameState(s => ({ ...s, opp: 1, task: "128 ÷ 4" })), 1500);
    const t2 = setTimeout(() => setGameState(s => ({ ...s, opp: 2, task: "256 - 64" })), 3000);
    
    // 4s+: Игрок входит в "Поток" (Слоу-мо) и разваливает
    const t3 = setTimeout(() => setGameState(s => ({ ...s, isSlowMo: true, me: 1, task: "13 × 13", combo: "GOOD!" })), 4500);
    const t4 = setTimeout(() => setGameState(s => ({ ...s, me: 2, task: "45 + 89", combo: "COMBO x2" })), 5800);
    const t5 = setTimeout(() => setGameState(s => ({ ...s, me: 3, task: "FINISH HIM", combo: "GODLIKE!" })), 7000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  },[]);

  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ filter: "blur(20px)", opacity: 0, scale: 1.1 }} 
      transition={{ duration: 1 }} 
      className="absolute inset-0 flex items-center justify-center bg-[#020617]"
    >
      {/* Эффект слоу-мо (Потока) */}
      <AnimatePresence>
        {gameState.isSlowMo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-cyan-950/30 z-0 mix-blend-screen" />
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden relative z-10 flex flex-col mx-4">
        
        {/* Хедер (Чистый Flexbox) */}
        <div className="bg-slate-800 p-4 md:p-6 flex justify-between items-center border-b border-slate-700">
          <div className="flex-1 flex items-center gap-4">
            <div className="hidden md:block w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500 bg-slate-900">
              <img src="/meerkat-hero.png" alt="me" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-cyan-400 font-black text-sm md:text-xl uppercase">YOU</div>
              <div className="text-3xl md:text-5xl font-black text-white">{gameState.me}</div>
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <div className="text-slate-500 font-mono text-sm md:text-lg mb-1">TIMER</div>
            <div className={`text-3xl md:text-5xl font-black ${gameState.isSlowMo ? 'text-cyan-400' : 'text-white'}`}>
              45
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end gap-4 text-right">
            <div>
              <div className="text-red-500 font-black text-sm md:text-xl uppercase">FAKER_MATH</div>
              <div className="text-3xl md:text-5xl font-black text-white">{gameState.opp}</div>
            </div>
            <div className="hidden md:block w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 bg-slate-900">
              <img src="/meerkat-evil.png" alt="opp" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Прогресс бары */}
        <div className="h-2 md:h-3 bg-slate-950 w-full flex relative">
          <motion.div className="h-full bg-cyan-500 absolute left-0 top-0 bottom-0" animate={{ width: `${(gameState.me / 3) * 100}%` }} transition={{ duration: 0.5, type: "spring" }} />
          <motion.div className="h-full bg-red-500 absolute right-0 top-0 bottom-0" animate={{ width: `${(gameState.opp / 3) * 100}%` }} transition={{ duration: 0.5, type: "spring" }} />
        </div>

        {/* Зона Задачи */}
        <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center relative min-h-[300px] md:min-h-[400px]">
          
          <div className="text-slate-500 font-mono tracking-widest text-sm md:text-lg mb-4 uppercase">Текущая задача</div>
          
          <motion.div 
            key={gameState.task}
            initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }} 
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", damping: 15 }}
            className={`text-5xl md:text-[6rem] font-black text-white font-mono bg-slate-800/80 px-8 py-6 md:px-16 md:py-10 rounded-3xl border ${gameState.isSlowMo ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'border-slate-700'}`}
          >
            {gameState.task}
          </motion.div>

          {/* Комбо-текст */}
          <AnimatePresence>
            {gameState.combo && (
              <motion.div 
                key={gameState.combo}
                initial={{ opacity: 0, y: 50, scale: 0.5 }} 
                animate={{ opacity: 1, y: -40, scale: 1.2 }} 
                exit={{ opacity: 0 }}
                className="absolute text-4xl md:text-6xl font-black text-amber-400 italic drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] z-50 pointer-events-none"
              >
                {gameState.combo}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
});

// СЦЕНА 5: Победа и Лидерборд (Понятный подъем по рангам)
const SceneVictoryLeaderboard = forwardRef<HTMLDivElement, any>((props, ref) => {
  const [rank, setRank] = useState(154);
  
  // Имитация подъема в рейтинге
  useEffect(() => {
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setRank(prev => {
          if (prev <= 1) { clearInterval(interval); return 1; }
          return prev - 5; // Быстро, но читаемо
        });
      }, 50);
      return () => clearInterval(interval);
    }, 1500); // Ждем полторы секунды перед взлетом
    return () => clearTimeout(t);
  },[]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }} className="absolute inset-0 bg-[#020617] flex items-center justify-center overflow-hidden">
      
      {/* Флеш-эффект в начале победы */}
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 bg-white z-50 pointer-events-none" />

      <div className="flex flex-col md:flex-row w-full max-w-7xl px-4 md:px-8 gap-8 md:gap-16 relative z-10 items-center justify-center">
        
        {/* Левая часть: Победа */}
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full">
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15, delay: 0.5 }}>
            <Trophy className="w-24 h-24 md:w-32 md:h-32 text-yellow-400 mb-6 drop-shadow-[0_0_50px_rgba(250,204,21,0.6)]" />
          </motion.div>
          <h1 className="text-6xl md:text-[8rem] font-black text-white italic tracking-tighter leading-none mb-6 drop-shadow-2xl">
            VICTORY
          </h1>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="inline-flex items-center gap-4 bg-emerald-950/80 border border-emerald-500/50 px-8 py-4 rounded-2xl backdrop-blur-md">
            <ArrowUp className="w-8 h-8 text-emerald-400" />
            <div className="text-3xl md:text-5xl font-black text-emerald-400">+50 MP</div>
          </motion.div>
        </div>

        {/* Правая часть: Лидерборд (Жестко зафиксированный) */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5, type: "spring" }}
          className="w-full md:w-[450px] bg-slate-900/90 border border-slate-700 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex-shrink-0"
        >
          <div className="text-xl font-black text-white uppercase tracking-widest mb-6 border-b border-slate-700 pb-4 flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-400" /> Global Top
          </div>
          
          <div className="space-y-4">
            {/* Игрок 1 */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${rank === 1 ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-800/50 border-transparent'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${rank === 1 ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-white'}`}>1</div>
                <div className={`font-black text-lg md:text-xl truncate ${rank === 1 ? 'text-cyan-400' : 'text-white'}`}>{rank === 1 ? 'GUEST' : 'FAKER_MATH'}</div>
              </div>
            </div>
            {/* Игрок 2 */}
            <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-800/50 border-transparent">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-black">2</div>
                <div className="font-black text-lg md:text-xl text-white truncate">{rank <= 2 && rank > 1 ? 'GUEST' : 'ALGEBRA_GOD'}</div>
              </div>
            </div>
          </div>
          
          {/* Динамический блок текущего ранга */}
          {rank > 2 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="bg-cyan-950 border border-cyan-500/50 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-cyan-500 text-slate-900 rounded-full flex items-center justify-center font-black">{rank}</div>
                  <div className="font-black text-lg md:text-xl text-cyan-400">GUEST</div>
                </div>
                <ArrowUp className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
});

// СЦЕНА 6: Финальный CTA (Тот, что тебе понравился)
const SceneCTA = forwardRef<HTMLDivElement, { onAction: () => void }>(({ onAction }, ref) => (
  <motion.div ref={ref} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617] z-[500] px-4">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.15),_transparent_70%)] pointer-events-none" />
    
    <motion.div initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="relative z-10 text-center max-w-4xl">
      
      <div className="flex justify-center mb-10">
         <MeerkatAvatar src="/meerkat-hero.png" size="md" />
      </div>
      
      <h1 className="text-5xl md:text-[6rem] font-black text-white leading-[0.9] tracking-tighter mb-8 drop-shadow-2xl uppercase">
        Арена <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400">Ждет тебя</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
        Хватит смотреть трейлеры. Создай аккаунт, тренируй компаньона и докажи, что ты лучший в математическом PvP.
      </p>

      <motion.button 
        whileHover={{ scale: 1.05, boxShadow: "0px 0px 60px rgba(6,182,212,0.6)" }}
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
        className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 md:px-14 md:py-6 bg-white text-slate-950 font-black text-xl md:text-2xl uppercase tracking-widest rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
        <Swords className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500" />
        <span>Ворваться в Игру</span>
      </motion.button>
    </motion.div>
  </motion.div>
));

// ============================================================================
// 3. ГЛАВНЫЙ КОНТРОЛЛЕР (МЕДЛЕННАЯ, ЧИТАЕМАЯ РЕЖИССУРА)
// ============================================================================
export function CinematicTrailer({ onClose, onAction }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Увеличенные тайминги для комфортного восприятия (Итого ~28 секунд)
    const timeline =[
      { p: 0, t: 0 },       // Завязка (Медленный фокус)
      { p: 1, t: 5000 },    // Матчмейкинг (Радар)
      { p: 2, t: 10000 },   // VS Экран (Кто против кого)
      { p: 3, t: 14000 },   // Геймплей (Напряжение, мы проигрываем)
      { p: 4, t: 22000 },   // Победа и Лидерборд
      { p: 5, t: 28000 },   // Финал (CTA)
    ];

    const timeouts = timeline.map(s => setTimeout(() => setPhase(s.p), s.t));
    return () => timeouts.forEach(clearTimeout);
  },[]);

  const handleFinish = () => {
    onClose();
    onAction();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden font-sans">
      <GlobalStyles />
      <div className="film-grain" />
      <div className="vignette-heavy" />

      {/* Рендер сцен с гарантией от крашей (forwardRef + AnimatePresence) */}
      <AnimatePresence mode="wait">
        {phase === 0 && <SceneIntro key="intro" />}
        {phase === 1 && <SceneMatchmaking key="match" />}
        {phase === 2 && <SceneVS key="vs" />}
        {phase === 3 && <SceneGameplay key="game" />}
        {phase === 4 && <SceneVictoryLeaderboard key="vic" />}
        {phase === 5 && <SceneCTA key="cta" onAction={handleFinish} />}
      </AnimatePresence>
    </div>
  );
}