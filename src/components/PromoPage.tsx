// PromoPage.tsx
import React, { useState, useEffect } from 'react';
import { Play, ArrowLeft, Film, MonitorPlay, Crosshair, Zap } from 'lucide-react';
import { CinematicTrailer } from './CinematicTrailer';
import { WarTrailer } from './WarTrailer';

// ─── Экран предзагрузки WarTrailer ────────────────────────────────────────────
const WarPreloader = ({ onReady }: { onReady: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING COMBAT SYSTEMS');
  const [done, setDone] = useState(false);

  const steps = [
    { at: 0,    text: 'INITIALIZING COMBAT SYSTEMS' },
    { at: 20,   text: 'LOADING EQUATION ENGINE' },
    { at: 45,   text: 'COMPILING LaTeX RENDERER' },
    { at: 70,   text: 'WARMING UP FRAMER-MOTION' },
    { at: 90,   text: 'ARENA READY' },
  ];

  useEffect(() => {
    // Плавно гоним прогресс от 0 до 100 за ~1.8с
    const start = Date.now();
    const duration = 1800;
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      // Меняем статус по порогам
      const step = [...steps].reverse().find(s => pct >= s.at);
      if (step) setStatusText(step.text);

      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        // Короткая пауза на "100%" — потом переходим
        setTimeout(() => {
          setDone(true);
          setTimeout(onReady, 400);
        }, 300);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onReady]);

  return (
    <div
      style={{
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        opacity: done ? 0 : 1,
        transform: done ? 'scale(1.04)' : 'scale(1)',
      }}
      className="fixed inset-0 z-[9998] bg-[#020617] flex flex-col items-center justify-center select-none"
    >
      {/* Сканлайны */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Угловые рамки HUD */}
      {[
        'top-6 left-6 border-t-2 border-l-2',
        'top-6 right-6 border-t-2 border-r-2',
        'bottom-6 left-6 border-b-2 border-l-2',
        'bottom-6 right-6 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-10 h-10 border-white/20 ${cls}`} />
      ))}

      {/* Иконка */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <Zap
            className="w-9 h-9 text-red-400"
            style={{ filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' }}
          />
        </div>
        {/* Пульсирующее кольцо */}
        <div
          className="absolute inset-0 rounded-2xl border border-red-500/40 animate-ping"
          style={{ animationDuration: '1.4s' }}
        />
      </div>

      {/* Заголовок */}
      <div className="text-center mb-10 px-4">
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] mb-2">
          Math is War — Action Cut
        </p>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
          Подготовка арены
        </h2>
      </div>

      {/* Прогресс-бар */}
      <div className="w-72 md:w-96 space-y-3">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #ef4444, #f97316)',
              boxShadow: '0 0 12px rgba(239,68,68,0.7)',
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span
            className="font-mono text-[10px] uppercase tracking-widest text-slate-500"
            style={{ transition: 'all 0.3s ease' }}
          >
            {statusText}
          </span>
          <span className="font-mono text-sm font-black text-red-400">
            {progress}%
          </span>
        </div>
      </div>

      {/* WarTrailer монтируется здесь — невидимо, но реально в DOM */}
      {/* KaTeX + framer-motion прогреваются прямо сейчас */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
      >
        <WarTrailer onClose={() => {}} onAction={() => {}} />
      </div>
    </div>
  );
};

// ─── Главный компонент ────────────────────────────────────────────────────────
export function PromoPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  // 'idle' | 'preloading' | 'ready'
  const [warState, setWarState] = useState<'idle' | 'preloading' | 'ready'>('idle');

  const handleWarClick = () => {
    if (warState === 'ready') {
      setPlaying('war');
    } else {
      setWarState('preloading');
    }
  };

  if (playing === 'cinematic') {
    return (
      <CinematicTrailer
        onClose={() => setPlaying(null)}
        onAction={() => (window.location.href = '/')}
      />
    );
  }

  if (playing === 'war') {
    return (
      <WarTrailer
        onClose={() => { setPlaying(null); setWarState('ready'); }}
        onAction={() => (window.location.href = '/')}
      />
    );
  }

  const promos = [
    {
      id: 'cinematic',
      title: 'Официальный Трейлер v1.0',
      description: 'Эпичный кинематографичный тизер платформы. История от скуки до Алмазного ранга.',
      duration: '0:29',
      icon: Film,
      disabled: false,
      style: {
        glow: 'from-cyan-500/40 to-blue-600/40',
        iconBg: 'bg-cyan-500/20 border-cyan-500/40',
        text: 'text-cyan-400',
      },
    },
    {
      id: 'war',
      title: 'Math is War (Action Cut)',
      description: 'Динамичный тактический промо-ролик. Интеллект — это сила. Выживает умнейший.',
      duration: '0:16',
      icon: Crosshair,
      disabled: false,
      style: {
        glow: 'from-red-500/40 to-orange-600/40',
        iconBg: 'bg-red-500/20 border-red-500/40',
        text: 'text-red-400',
      },
    },
    {
      id: 'gameplay',
      title: 'Геймплей (Скоро)',
      description: 'Чистый геймплей PvP арены, турниров и прокачки суриката.',
      duration: 'TBA',
      icon: MonitorPlay,
      disabled: true,
      style: {
        glow: 'from-slate-500/20 to-slate-600/20',
        iconBg: 'bg-slate-800 border-slate-700',
        text: 'text-slate-500',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 relative overflow-y-auto">

      {/* Экран предзагрузки — монтируется при клике */}
      {warState === 'preloading' && (
        <WarPreloader onReady={() => { setWarState('ready'); setPlaying('war'); }} />
      )}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <Film className="w-3 h-3" /> Media Archive
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 drop-shadow-lg">
              Промо-материалы
            </h1>
            <p className="text-slate-400 text-lg">Выберите ролик для просмотра</p>
          </div>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors font-bold text-sm shadow-lg w-full md:w-auto"
          >
            <ArrowLeft className="w-4 h-4" /> На главную
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((promo) => {
            const Icon = promo.icon;
            const isWarLoading = promo.id === 'war' && warState === 'preloading';
            return (
              <div
                key={promo.id}
                onClick={() => {
                  if (promo.disabled) return;
                  if (promo.id === 'war') { handleWarClick(); return; }
                  setPlaying(promo.id);
                }}
                className={`relative group rounded-3xl p-1 transition-all duration-500 ${
                  promo.disabled
                    ? 'opacity-60 grayscale cursor-not-allowed'
                    : 'cursor-pointer hover:scale-[1.03] hover:-translate-y-2'
                }`}
              >
                {!promo.disabled && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${promo.style.glow} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                )}
                <div className="relative h-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-[1.4rem] p-6 md:p-8 flex flex-col justify-between overflow-hidden z-10 shadow-2xl">
                  <div className="mb-8 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${promo.style.iconBg}`}>
                      <Icon className={`w-8 h-8 ${promo.style.text}`} />
                    </div>
                    <h3 className="text-2xl font-black mb-3 leading-tight">{promo.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{promo.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-800/80 relative z-10">
                    <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                      {promo.duration}
                    </span>
                    {!promo.disabled && (
                      <div className={`flex items-center gap-2 font-bold text-sm transition-transform duration-300 group-hover:translate-x-2 ${promo.style.text}`}>
                        {isWarLoading ? (
                          <>
                            Загрузка
                            <span className="flex gap-0.5">
                              {[0, 1, 2].map(i => (
                                <span
                                  key={i}
                                  className="w-1 h-1 rounded-full bg-current animate-bounce"
                                  style={{ animationDelay: `${i * 0.15}s` }}
                                />
                              ))}
                            </span>
                          </>
                        ) : (
                          <>Смотреть <Play className="w-4 h-4 fill-current" /></>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}