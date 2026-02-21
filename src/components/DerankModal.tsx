import React, { useEffect, useState, useRef } from 'react';
import { PvPRank, getDivisionRoman } from '../lib/PvPRankSystem';
import { Trophy, TrendingUp, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  newRank: PvPRank;
  oldMMR: number;
  newMMR: number;
  onClose: () => void;
}

export function RankUpModal({ newRank, oldMMR, newMMR, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [mmrDisplayed, setMmrDisplayed] = useState(oldMMR);
  const animRef = useRef<number>();
  const mmrGain = newMMR - oldMMR;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 60);

    const t2 = setTimeout(() => {
      const startTime = performance.now();
      const duration = 1300;
      const tick = (now: number) => {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setMmrDisplayed(Math.round(oldMMR + (newMMR - oldMMR) * eased));
        if (p < 1) animRef.current = requestAnimationFrame(tick);
        else setMmrDisplayed(newMMR);
      };
      animRef.current = requestAnimationFrame(tick);
    }, 500);

    const t3 = setTimeout(() => {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.45 }, colors: [newRank.gradientFrom, newRank.gradientTo, '#fff', '#fbbf24'] });
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.5, x: 0.2 }, colors: [newRank.gradientFrom, '#fff'] });
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.5, x: 0.8 }, colors: [newRank.gradientTo, '#fff'] });
      }, 300);
    }, 400);

    const t4 = setTimeout(handleClose, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-400 ${visible ? 'bg-black/88 backdrop-blur-xl' : 'bg-black/0'}`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-20 animate-pulse"
          style={{ background: `radial-gradient(circle, ${newRank.gradientFrom} 0%, ${newRank.gradientTo} 60%, transparent 100%)` }} />
      </div>

      <div
        className={`relative max-w-sm w-full z-10 transition-all duration-500 ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 -z-10 scale-95"
          style={{ background: `linear-gradient(135deg, ${newRank.gradientFrom}, ${newRank.gradientTo})` }} />

        <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border"
          style={{ borderColor: `${newRank.gradientFrom}45` }}>

          <div className="relative h-[2px] overflow-hidden">
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent, ${newRank.gradientFrom}, ${newRank.gradientTo}, ${newRank.gradientFrom}, transparent)` }} />
            <div className="absolute top-0 bottom-0 w-1/3 animate-shimmer-line"
              style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)` }} />
          </div>

          <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-10"
            style={{ background: `linear-gradient(180deg, ${newRank.gradientFrom}, transparent)` }} />

          <button onClick={handleClose} className="absolute top-3 right-3 z-20 p-1.5 bg-slate-800/70 hover:bg-slate-700 rounded-full border border-slate-700/60 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>

          <div className="relative p-7 pt-6 text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ borderColor: `${newRank.gradientFrom}40`, color: newRank.gradientFrom, backgroundColor: `${newRank.gradientFrom}10` }}>
              <Sparkles className="w-3 h-3" /> Повышение ранга
            </div>

            <div className="relative flex justify-center">
              <div className="absolute inset-0 m-auto w-36 h-36 rounded-full border-2 animate-ping opacity-15" style={{ borderColor: newRank.gradientFrom }} />
              <div className="absolute inset-0 m-auto w-32 h-32 rounded-full border animate-ping opacity-10" style={{ borderColor: newRank.gradientTo, animationDelay: '0.3s' }} />
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl animate-rank-float"
                style={{ background: `linear-gradient(135deg, ${newRank.gradientFrom}, ${newRank.gradientTo})`, boxShadow: `0 0 50px ${newRank.gradientFrom}80, 0 0 100px ${newRank.gradientFrom}25` }}>
                {newRank.icon}
              </div>
            </div>

            <div>
              <div className={`text-4xl font-black uppercase tracking-wider drop-shadow-lg ${newRank.color}`}>
                {newRank.tier === 'master' || newRank.tier === 'grandmaster' ? newRank.fullName : newRank.tier.toUpperCase()}
              </div>
              {newRank.division > 0 && <div className={`text-2xl font-bold mt-0.5 opacity-75 ${newRank.color}`}>{getDivisionRoman(newRank.division)}</div>}
              <p className="text-slate-500 text-xs italic mt-2">"{newRank.description}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Рейтинг</span>
                </div>
                <div className="text-2xl font-black text-white font-mono tabular-nums">{mmrDisplayed}</div>
              </div>
              <div className="rounded-2xl p-3 border" style={{ background: `${newRank.gradientFrom}10`, borderColor: `${newRank.gradientFrom}25` }}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: newRank.gradientFrom }} />
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: `${newRank.gradientFrom}90` }}>Прирост</span>
                </div>
                <div className="text-2xl font-black font-mono" style={{ color: newRank.gradientFrom }}>+{mmrGain}</div>
              </div>
            </div>

            <button onClick={handleClose} className="w-full py-3.5 rounded-xl font-bold text-white text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${newRank.gradientFrom}, ${newRank.gradientTo})` }}>
              Продолжить
            </button>
          </div>

          <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${newRank.gradientTo}, ${newRank.gradientFrom}, transparent)` }} />
        </div>
      </div>

      <style>{`
        @keyframes rank-float { 0%,100%{transform:translateY(0)rotate(-1.5deg)}50%{transform:translateY(-10px)rotate(1.5deg)} }
        .animate-rank-float{animation:rank-float 3s ease-in-out infinite}
        @keyframes shimmer-line{0%{left:-40%}100%{left:140%}}
        .animate-shimmer-line{animation:shimmer-line 2s ease-in-out infinite}
      `}</style>
    </div>
  );
}