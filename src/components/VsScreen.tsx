import { useEffect, useState, useMemo } from 'react';
import { Profile } from '../lib/supabase';
import { getPvPRank } from '../lib/gameLogic';
import { usePvPStats } from '../hooks/usePvPStats';

type Props = {
  player: Profile;
  opponentName: string;
  opponentMMR: number;
  onComplete: () => void;
};

// Цвета и стили по скину (упрощённо для VS экрана)
function getSkinAccent(skin: string, isOpponent: boolean) {
  if (!isOpponent) {
    const map: Record<string, { color: string; glow: string; dim: string }> = {
      electric: { color: '#22d3ee', glow: 'rgba(6,182,212,0.4)',   dim: '#083344' },
      fire:     { color: '#f97316', glow: 'rgba(249,115,22,0.4)',  dim: '#431407' },
      gold:     { color: '#facc15', glow: 'rgba(250,204,21,0.4)',  dim: '#422006' },
      ice:      { color: '#7dd3fc', glow: 'rgba(125,211,252,0.4)', dim: '#082f49' },
      shadow:   { color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)',  dim: '#2e1065' },
      neon:     { color: '#4ade80', glow: 'rgba(74,222,128,0.4)',  dim: '#052e16' },
      plasma:   { color: '#e879f9', glow: 'rgba(232,121,249,0.4)', dim: '#4a044e' },
    };
    return map[skin] ?? { color: '#22d3ee', glow: 'rgba(6,182,212,0.35)', dim: '#083344' };
  }
  return { color: '#ef4444', glow: 'rgba(239,68,68,0.4)', dim: '#450a0a' };
}

type HalfProps = {
  name: string;
  mmr: number;
  rank: any;
  winRate: number;
  matchesPlayed: number;
  isOpponent: boolean;
  skin?: string;
  entered: boolean;
};

function PlayerHalf({ name, mmr, rank, winRate, matchesPlayed, isOpponent, skin = 'default', entered }: HalfProps) {
  const accent = getSkinAccent(skin, isOpponent);

  // Slide direction
  const translateStart = isOpponent ? 'translateX(100%)' : 'translateX(-100%)';

  return (
    <div
      className="relative flex-1 flex flex-col overflow-hidden"
      style={{
        background: isOpponent
          ? `linear-gradient(${isOpponent ? '225deg' : '135deg'}, ${accent.dim} 0%, #020617 60%)`
          : `linear-gradient(135deg, ${accent.dim} 0%, #020617 60%)`,
        transform: entered ? 'translateX(0)' : translateStart,
        transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Угловой свет */}
      <div className="absolute pointer-events-none"
        style={{
          [isOpponent ? 'top' : 'top']: 0,
          [isOpponent ? 'right' : 'left']: 0,
          width: '60%',
          height: '50%',
          background: `radial-gradient(ellipse at ${isOpponent ? '100% 0%' : '0% 0%'}, ${accent.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Вертикальная полоска-акцент на внешнем крае */}
      <div className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          [isOpponent ? 'right' : 'left']: 0,
          width: 3,
          background: `linear-gradient(180deg, transparent, ${accent.color}, transparent)`,
        }}
      />

      {/* Лейбл YOU / OPP */}
      <div
        className="absolute top-5 pointer-events-none"
        style={{ [isOpponent ? 'right' : 'left']: 16 }}
      >
        <span
          className="text-[9px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border"
          style={{
            color: accent.color,
            borderColor: `${accent.color}40`,
            background: `${accent.color}12`,
          }}
        >
          {isOpponent ? 'OPPONENT' : 'YOU'}
        </span>
      </div>

      {/* Основной контент — центр */}
      <div
        className="flex-1 flex flex-col justify-center gap-3 px-6 py-10"
        style={{ alignItems: isOpponent ? 'flex-end' : 'flex-start' }}
      >
        {/* Ранг иконка + название */}
        <div
          className="flex items-center gap-2"
          style={{ flexDirection: isOpponent ? 'row-reverse' : 'row' }}
        >
          <span className="text-3xl drop-shadow-lg">{rank.icon}</span>
          <span
            className="text-xs font-black uppercase tracking-[0.2em]"
            style={{ color: accent.color }}
          >
            {rank.shortName ?? rank.fullName}
          </span>
        </div>

        {/* Имя */}
        <h2
          className="font-black text-white leading-none"
          style={{
            fontSize: 'clamp(1.4rem, 5vw, 2.4rem)',
            textShadow: `0 0 30px ${accent.glow}`,
            textAlign: isOpponent ? 'right' : 'left',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {name}
        </h2>

        {/* MMR */}
        <div
          className="flex items-baseline gap-1.5"
          style={{ flexDirection: isOpponent ? 'row-reverse' : 'row' }}
        >
          <span
            className="text-3xl font-black font-mono"
            style={{ color: accent.color, textShadow: `0 0 20px ${accent.glow}` }}
          >
            {mmr}
          </span>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">MP</span>
        </div>

        {/* Мини-статы */}
        <div
          className="flex items-center gap-3 mt-1"
          style={{ flexDirection: isOpponent ? 'row-reverse' : 'row' }}
        >
          <div className="text-center">
            <div className="text-white font-black text-sm font-mono">{winRate}%</div>
            <div className="text-slate-600 text-[9px] uppercase tracking-widest">Win</div>
          </div>
          <div className="w-px h-6 bg-slate-700" />
          <div className="text-center">
            <div className="text-white font-black text-sm font-mono">{matchesPlayed}</div>
            <div className="text-slate-600 text-[9px] uppercase tracking-widest">Matches</div>
          </div>
        </div>
      </div>

      {/* Нижний акцент */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{ background: `linear-gradient(${isOpponent ? '270deg' : '90deg'}, transparent, ${accent.color}60)` }}
      />
    </div>
  );
}

export function VsScreen({ player, opponentName, opponentMMR, onComplete }: Props) {
  const [entered, setEntered]   = useState(false);
  const [vsVisible, setVsVisible] = useState(false);
  const [exiting, setExiting]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setEntered(true),   80);
    const t2 = setTimeout(() => setVsVisible(true), 500);
    const t3 = setTimeout(() => setExiting(true),   3200);
    const t4 = setTimeout(onComplete,               3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const myStats  = usePvPStats(player.id);
  const oWinRate = useMemo(() => Math.round(Math.min(95, Math.max(35, 50 + Math.random() * 25))), []);
  const oMatches = useMemo(() => Math.floor(Math.random() * 80 + 10), []);

  const pRank  = getPvPRank(player.mmr || 1000);
  const oRank  = getPvPRank(opponentMMR);
  const mySkin = player.is_premium ? (player.equipped_card_skin || 'electric') : 'default';

  const isEntered = entered && !exiting;

  return (
    <>
      <style>{`
        @keyframes vs-pop {
          0%   { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: translate(-50%, -50%) scale(1.15) rotate(2deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes vs-exit {
          to { transform: translate(-50%, -50%) scale(0) rotate(10deg); opacity: 0; }
        }
        .vs-badge-enter { animation: vs-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .vs-badge-exit  { animation: vs-exit 0.3s ease-in forwards; }
      `}</style>

      <div
        className="fixed inset-0 z-[200] flex overflow-hidden"
        style={{
          background: '#020617',
          opacity: exiting ? 0 : 1,
          transition: exiting ? 'opacity 0.5s ease-in' : undefined,
        }}
      >
        {/* Центральная разделительная линия */}
        <div className="absolute left-1/2 top-0 bottom-0 pointer-events-none"
          style={{ width: 1, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)', transform: 'translateX(-50%)' }}
        />

        {/* Игрок (левая половина) */}
        <PlayerHalf
          name={player.username}
          mmr={player.mmr || 1000}
          rank={pRank}
          winRate={myStats.winRate}
          matchesPlayed={myStats.matchesPlayed}
          isOpponent={false}
          skin={mySkin}
          entered={isEntered}
        />

        {/* Соперник (правая половина) */}
        <PlayerHalf
          name={opponentName}
          mmr={opponentMMR}
          rank={oRank}
          winRate={oWinRate}
          matchesPlayed={oMatches}
          isOpponent={true}
          skin="electric"
          entered={isEntered}
        />

        {/* VS бейдж — поверх центра */}
        {vsVisible && (
          <div
            className={`absolute z-30 pointer-events-none ${exiting ? 'vs-badge-exit' : 'vs-badge-enter'}`}
            style={{ left: '50%', top: '50%' }}
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
              style={{
                background: '#fff',
                boxShadow: '0 0 0 3px #0f172a, 0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.15)',
              }}
            >
              <span className="text-black font-black text-2xl md:text-3xl italic tracking-tighter">VS</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}