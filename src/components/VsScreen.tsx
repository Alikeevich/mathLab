import { useEffect, useState, useMemo } from 'react';
import { Profile } from '../lib/supabase';
import { getPvPRank } from '../lib/gameLogic';
import { PlayerCard } from './card-skins/PlayerCard';
import { usePvPStats } from '../hooks/usePvPStats';

type Props = {
  player: Profile;
  opponentName: string;
  opponentMMR: number;
  onComplete: () => void;
};

export function VsScreen({ player, opponentName, opponentMMR, onComplete }: Props) {
  const [stage, setStage] = useState<'enter' | 'idle' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('idle'), 80);
    const t2 = setTimeout(() => setStage('exit'), 3200);
    const t3 = setTimeout(onComplete, 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const myStats  = usePvPStats(player.id);
  const oWinRate = useMemo(() => Math.round(Math.min(95, Math.max(35, 50 + Math.random() * 25))), []);
  const oMatches = useMemo(() => Math.floor(Math.random() * 80 + 10), []);

  const pRank  = getPvPRank(player.mmr || 1000);
  const oRank  = getPvPRank(opponentMMR);
  const mySkin = (player as any).equipped_card_skin || (player.is_premium ? 'electric' : 'default');

  const visible = stage !== 'enter';

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] overflow-hidden flex items-center justify-center">

      {/* Фон */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, #0f172a 0%, #020617 70%)' }} />
        <div className="absolute inset-x-0 top-0 h-1/2 opacity-25"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e3a5f 0%, transparent 70%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-25"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, #3b0f0f 0%, transparent 70%)' }} />
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(148,163,184,0.2), transparent)' }} />
      </div>

      {/* Стек карточек — масштабируется под экран */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          // Уменьшаем весь стек если экран маленький
          transform: 'scale(min(1, calc((100dvh - 40px) / 860px)))',
          transformOrigin: 'center center',
        }}
      >

        {/* Карточка ИГРОКА — въезжает сверху */}
        <div style={{
          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
          transform:  visible ? 'translateY(0)' : 'translateY(-130%)',
          opacity:    visible ? 1 : 0,
        }}>
          <PlayerCard
            isOpponent={false}
            name={player.username}
            mmr={player.mmr || 1000}
            rank={pRank}
            winRate={myStats.winRate}
            matchesPlayed={myStats.matchesPlayed}
            skin={mySkin}
            stage="idle"
          />
        </div>

        {/* VS Badge */}
        <div className="relative z-20 flex-shrink-0 -my-4" style={{
          transition: 'transform 0.4s ease-out 0.1s, opacity 0.4s ease-out 0.1s',
          transform:  visible ? 'scale(1)' : 'scale(0)',
          opacity:    visible ? 1 : 0,
        }}>
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.15)' }}>
            <span className="text-black font-black text-2xl italic -ml-0.5">VS</span>
          </div>
          {/* Лучи */}
          <div className="absolute top-1/2 -translate-y-1/2 right-full w-20 h-px mr-1" style={{
            background: 'linear-gradient(to left, rgba(255,255,255,0.35), transparent)',
            opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease-out 0.3s',
          }} />
          <div className="absolute top-1/2 -translate-y-1/2 left-full w-20 h-px ml-1" style={{
            background: 'linear-gradient(to right, rgba(255,255,255,0.35), transparent)',
            opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease-out 0.3s',
          }} />
        </div>

        {/* Карточка СОПЕРНИКА — въезжает снизу */}
        <div style={{
          transition: 'transform 0.5s ease-out 0.05s, opacity 0.5s ease-out 0.05s',
          transform:  visible ? 'translateY(0)' : 'translateY(130%)',
          opacity:    visible ? 1 : 0,
        }}>
          <PlayerCard
            isOpponent={true}
            name={opponentName}
            mmr={opponentMMR}
            rank={oRank}
            winRate={oWinRate}
            matchesPlayed={oMatches}
            skin="electric"
            stage="idle"
          />
        </div>

      </div>

      {/* Fade-out оверлей */}
      <div className="absolute inset-0 bg-black pointer-events-none z-30"
        style={{
          opacity:    stage === 'exit' ? 1 : 0,
          transition: 'opacity 0.5s ease-in',
        }}
      />
    </div>
  );
}