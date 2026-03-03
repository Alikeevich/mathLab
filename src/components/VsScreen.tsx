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
    const t1 = setTimeout(() => setStage('idle'), 100);
    const t2 = setTimeout(() => setStage('exit'), 3500);
    const t3 = setTimeout(onComplete, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const myStats  = usePvPStats(player.id);
  const oWinRate = useMemo(() => Math.round(Math.min(95, Math.max(35, 50 + Math.random() * 25))), []);
  const oMatches = useMemo(() => Math.floor(Math.random() * 80 + 10), []);

  const pRank  = getPvPRank(player.mmr || 1000);
  const oRank  = getPvPRank(opponentMMR);
  const mySkin = player.is_premium ? 'electric' : 'default';

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1e293b_0%,_#020617_100%)]" />

      <div className="relative z-10 w-full flex items-center justify-center">
        {/* На мобиле — горизонтально со scale, на десктопе — нормально */}
        <div className="flex flex-row items-center justify-center gap-3 md:gap-16 w-full px-2 md:px-8
                        scale-[0.58] sm:scale-[0.72] md:scale-100 origin-center">

          {/* Карточка игрока */}
          <PlayerCard
            isOpponent={false}
            name={player.username}
            mmr={player.mmr || 1000}
            rank={pRank}
            winRate={myStats.winRate}
            matchesPlayed={myStats.matchesPlayed}
            skin={mySkin}
            stage={stage}
          />

          {/* VS Бейдж */}
          <div className={`
            shrink-0 w-20 h-20 bg-white rounded-full flex items-center justify-center
            shadow-[0_0_40px_rgba(255,255,255,0.3)] z-20
            transition-[transform,opacity] duration-500 ease-out
            ${stage === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
            ${stage === 'exit'  ? 'scale-0 opacity-0' : ''}
          `}>
            <span className="text-black font-black text-3xl italic -ml-1">VS</span>
          </div>

          {/* Карточка соперника */}
          <PlayerCard
            isOpponent={true}
            name={opponentName}
            mmr={opponentMMR}
            rank={oRank}
            winRate={oWinRate}
            matchesPlayed={oMatches}
            skin="electric"
            stage={stage}
          />
        </div>
      </div>
    </div>
  );
}