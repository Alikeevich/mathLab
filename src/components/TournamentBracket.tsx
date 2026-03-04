import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Swords, Crown, Shield, Loader, Users } from 'lucide-react';

type BracketProps = {
  tournamentId: string;
  onEnterMatch: (duelId: string) => void;
  isTeacher?: boolean;
};

export function TournamentBracket({ tournamentId, onEnterMatch, isTeacher = false }: BracketProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [duels, setDuels] = useState<any[]>([]);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [rounds, setRounds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const sub = supabase
      .channel(`bracket-${tournamentId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'duels', filter: `tournament_id=eq.${tournamentId}` },
        () => fetchData())
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tournaments', filter: `id=eq.${tournamentId}` },
        () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  async function fetchData() {
    const { data: tData } = await supabase
      .from('tournaments').select('*').eq('id', tournamentId).single();
    setTournamentInfo(tData);

    const { data: dData } = await supabase
      .from('duels')
      .select(`*, p1:profiles!duels_player1_id_fkey(username), p2:profiles!duels_player2_id_fkey(username)`)
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true });

    if (dData) {
      setDuels(dData);
      const uniqueRounds = Array.from(new Set(dData.map(d => d.round))).sort((a, b) => a - b);
      setRounds(uniqueRounds);
    }
    setLoading(false);
  }

  const myActiveDuel = duels.find(d =>
    d.status === 'active' &&
    (d.player1_id === user?.id || d.player2_id === user?.id)
  );

  const finalDuel = duels.length > 0
    ? duels.filter(d => d.round === Math.max(...rounds)).find(d => d.winner_id)
    : null;

  const championName = finalDuel
    ? (finalDuel.winner_id === finalDuel.player1_id
        ? finalDuel.p1?.username
        : finalDuel.p2?.username)
    : '???';

  if (loading) return (
    <div className="flex justify-center p-10">
      <Loader className="animate-spin text-cyan-400 w-10 h-10" />
    </div>
  );

  // ── КОМАНДНЫЙ ФОРМАТ ──────────────────────────────────────
  if (tournamentInfo?.format === 'teams') {
    return <TeamsBracket
      duels={duels}
      tournamentInfo={tournamentInfo}
      myActiveDuel={myActiveDuel}
      onEnterMatch={onEnterMatch}
      isTeacher={isTeacher}
      userId={user?.id}
      t={t}
    />;
  }

  // ── ОЛИМПИЙСКИЙ ФОРМАТ ────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">

      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white uppercase tracking-widest">{t('tournaments.bracket_title')}</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {t('tournaments.round')}{' '}
          <span className="text-white">{tournamentInfo?.current_round}</span>
        </div>
      </div>

      {!isTeacher && myActiveDuel && (
        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/30 flex justify-between items-center animate-pulse">
          <div className="text-emerald-400 font-bold text-sm md:text-base">
            {t('tournaments.match_ready')} {myActiveDuel.round}
          </div>
          <button
            onClick={() => onEnterMatch(myActiveDuel.id)}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span className="hidden md:inline">{t('tournaments.go_to_battle')}</span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-x-auto p-6 flex gap-8">
        {rounds.length === 0 && (
          <div className="text-slate-500 m-auto">{t('tournaments.generating_bracket')}</div>
        )}

        {rounds.map((round) => (
          <div key={round} className="min-w-[240px] flex flex-col gap-4">
            <div className="text-center text-cyan-500 font-bold font-mono text-sm uppercase mb-2 bg-cyan-900/20 py-1 rounded">
              {t('tournaments.round')} {round}
            </div>

            {duels.filter(d => d.round === round).map((duel) => {
              const isMyDuel = duel.player1_id === user?.id || duel.player2_id === user?.id;
              const name1 = duel.p1?.username || t('tournaments.waiting_player');
              const name2 = duel.player2_id ? (duel.p2?.username || t('tournaments.waiting_player')) : '---';

              return (
                <div key={duel.id}
                  className={`relative p-3 rounded-xl border-2 flex flex-col gap-2 transition-all ${
                    isMyDuel ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  <div className={`flex justify-between items-center px-2 py-1 rounded ${
                    duel.winner_id === duel.player1_id ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300'
                  }`}>
                    <span className="font-bold truncate text-sm">{name1}</span>
                    {duel.winner_id === duel.player1_id && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                  </div>

                  {/* Score в середине */}
                  {(duel.status === 'finished' || duel.player1_score > 0 || duel.player2_score > 0) && (
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                      <span className="text-white font-bold">{duel.player1_score ?? 0}</span>
                      <span>:</span>
                      <span className="text-white font-bold">{duel.player2_score ?? 0}</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-700 w-full" />

                  <div className={`flex justify-between items-center px-2 py-1 rounded ${
                    duel.winner_id === duel.player2_id ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300'
                  }`}>
                    <span className="font-bold truncate text-sm">{name2}</span>
                    {duel.winner_id === duel.player2_id && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                  </div>

                  {/* Статус-индикатор */}
                  <div className="absolute -top-2 -right-2">
                    {duel.status === 'active' && !duel.winner_id && (
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                    )}
                    {(duel.status === 'finished' || duel.winner_id) && (
                      <div className="bg-slate-700 rounded-full p-1 border border-slate-600">
                        <Shield className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {tournamentInfo?.status === 'finished' && finalDuel && (
          <div className="min-w-[200px] flex flex-col justify-center items-center animate-in zoom-in duration-500 border-l-2 border-slate-700 pl-8 border-dashed">
            <Trophy className="w-16 h-16 text-yellow-400 mb-4 drop-shadow-lg animate-bounce" />
            <div className="text-yellow-400 font-black text-2xl uppercase tracking-widest">
              {t('tournaments.winner')}
            </div>
            <div className="text-white font-bold text-xl mt-2 bg-slate-800 px-6 py-2 rounded-xl border border-yellow-500/50">
              {championName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Командный брекет ─────────────────────────────────────────
function TeamsBracket({ duels, tournamentInfo, myActiveDuel, onEnterMatch, isTeacher, userId, t }: {
  duels: any[];
  tournamentInfo: any;
  myActiveDuel: any;
  onEnterMatch: (id: string) => void;
  isTeacher: boolean;
  userId?: string;
  t: any;
}) {
  const team1Wins = duels.filter(d => d.status === 'finished' && d.winner_id === d.player1_id).length;
  const team2Wins = duels.filter(d => d.status === 'finished' && d.winner_id === d.player2_id).length;
  const totalFinished = duels.filter(d => d.status === 'finished').length;
  const totalMatches = duels.length;
  const isFinished = tournamentInfo?.status === 'finished';

  let winningTeam: 1 | 2 | null = null;
  if (isFinished || totalFinished === totalMatches) {
    if (team1Wins > team2Wins) winningTeam = 1;
    else if (team2Wins > team1Wins) winningTeam = 2;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">

      {/* Шапка */}
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white uppercase tracking-widest">Стенка на стенку</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {totalFinished}/{totalMatches} матчей
          </div>
        </div>

        {/* Счёт команд */}
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className={`text-center p-3 rounded-xl border-2 transition-all ${
            winningTeam === 1 ? 'border-amber-400 bg-amber-500/10' :
            team1Wins > team2Wins ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 bg-slate-800'
          }`}>
            <div className={`text-xs font-bold uppercase mb-1 ${
              winningTeam === 1 ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {winningTeam === 1 && '🏆 '} Команда А
            </div>
            <div className="text-4xl font-black text-white">{team1Wins}</div>
            <div className="text-xs text-slate-500 mt-1">побед</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-black text-slate-500">VS</div>
            {isFinished && (
              <div className="text-xs text-slate-400 mt-1">
                {winningTeam ? `Команда ${winningTeam === 1 ? 'А' : 'Б'} победила!` : 'Ничья!'}
              </div>
            )}
          </div>

          <div className={`text-center p-3 rounded-xl border-2 transition-all ${
            winningTeam === 2 ? 'border-amber-400 bg-amber-500/10' :
            team2Wins > team1Wins ? 'border-red-500 bg-red-500/10' : 'border-slate-600 bg-slate-800'
          }`}>
            <div className={`text-xs font-bold uppercase mb-1 ${
              winningTeam === 2 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {winningTeam === 2 && '🏆 '} Команда Б
            </div>
            <div className="text-4xl font-black text-white">{team2Wins}</div>
            <div className="text-xs text-slate-500 mt-1">побед</div>
          </div>
        </div>
      </div>

      {/* Кнопка входа для своего матча */}
      {!isTeacher && myActiveDuel && (
        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/30 flex justify-between items-center animate-pulse">
          <div className="text-emerald-400 font-bold text-sm">Твой матч готов!</div>
          <button
            onClick={() => onEnterMatch(myActiveDuel.id)}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg flex items-center gap-2"
          >
            <Swords className="w-4 h-4" /> В бой!
          </button>
        </div>
      )}

      {/* Список матчей */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {duels.map((duel) => {
          const isMyDuel = duel.player1_id === userId || duel.player2_id === userId;
          const name1 = duel.p1?.username || '?';
          const name2 = duel.p2?.username || '?';
          const finished = duel.status === 'finished';
          const p1won = duel.winner_id === duel.player1_id;
          const p2won = duel.winner_id === duel.player2_id;

          return (
            <div key={duel.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isMyDuel ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-slate-700/50 bg-slate-800/50'
              }`}
            >
              {/* Команда А */}
              <div className={`flex-1 text-right font-bold text-sm truncate ${
                p1won ? 'text-amber-300' : finished ? 'text-slate-500' : 'text-slate-200'
              }`}>
                {name1}
                {p1won && ' 👑'}
              </div>

              {/* Счёт */}
              <div className="flex items-center gap-2 flex-shrink-0 font-mono font-black">
                <span className={`text-lg w-6 text-center ${p1won ? 'text-white' : 'text-slate-500'}`}>
                  {duel.player1_score ?? 0}
                </span>
                <span className="text-slate-600 text-sm">:</span>
                <span className={`text-lg w-6 text-center ${p2won ? 'text-white' : 'text-slate-500'}`}>
                  {duel.player2_score ?? 0}
                </span>
              </div>

              {/* Команда Б */}
              <div className={`flex-1 text-left font-bold text-sm truncate ${
                p2won ? 'text-amber-300' : finished ? 'text-slate-500' : 'text-slate-200'
              }`}>
                {p2won && '👑 '}
                {name2}
              </div>

              {/* Статус */}
              <div className="flex-shrink-0">
                {!finished ? (
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                ) : (
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
            </div>
          );
        })}

        {duels.length === 0 && (
          <div className="text-slate-500 text-center py-10">{t('tournaments.generating_bracket')}</div>
        )}
      </div>

      {/* Итог турнира */}
      {isFinished && winningTeam && (
        <div className="p-4 border-t border-slate-700 bg-slate-800 flex items-center justify-center gap-3 animate-in slide-in-from-bottom duration-500">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span className="text-amber-400 font-black text-lg uppercase">
            Команда {winningTeam === 1 ? 'А' : 'Б'} победила!
          </span>
          <Trophy className="w-6 h-6 text-amber-400" />
        </div>
      )}
    </div>
  );
}