import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Loader, Shield, RefreshCw, Clock, Trophy, Zap } from 'lucide-react';
import { TournamentBracket } from './TournamentBracket';
import { TournamentPlay } from './TournamentPlay';
import { ReconnectModal } from './ReconnectModal';

type LobbyProps = {
  tournamentId: string;
};

export function TournamentLobby({ tournamentId }: LobbyProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [participants, setParticipants] = useState<any[]>([]);
  const [tournamentCode, setTournamentCode] = useState<string>('');
  const [status, setStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [activeDuelId, setActiveDuelId] = useState<string | null>(null);

  // BYE: игрок проходит автоматически в этом раунде
  const [isByeRound, setIsByeRound] = useState(false);

  // После матча — ждёт пока учитель нажмёт "Следующий раунд"
  const [waitingForNextRound, setWaitingForNextRound] = useState(false);

  const [showReconnect, setShowReconnect] = useState(false);
  const [reconnectTournamentId, setReconnectTournamentId] = useState<string | null>(null);
  const [reconnectDuelId, setReconnectDuelId] = useState<string | null>(null);
  const [hasCheckedReconnect, setHasCheckedReconnect] = useState(false);

  const duelCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRoundRef = useRef<number>(1);

  // ── Проверка: есть ли активная дуэль или BYE в этом раунде ──
  const checkForActiveDuel = useCallback(async () => {
    if (!user) return;
    if (duelCheckTimerRef.current) clearTimeout(duelCheckTimerRef.current);
    duelCheckTimerRef.current = setTimeout(async () => {
      // 1. Ищем активный матч
      const { data: activeDuel } = await supabase
        .from('duels')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('status', 'active')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .maybeSingle();

      if (activeDuel?.id) {
        setIsByeRound(false);
        setWaitingForNextRound(false);
        setActiveDuelId(activeDuel.id);
        return;
      }

      // 2. Ищем BYE в текущем раунде (player2_id IS NULL, winner_id = user)
      const { data: tInfo } = await supabase
        .from('tournaments')
        .select('current_round')
        .eq('id', tournamentId)
        .single();

      const round = tInfo?.current_round ?? 1;

      const { data: byeDuel } = await supabase
        .from('duels')
        .select('id, winner_id, player2_id')
        .eq('tournament_id', tournamentId)
        .eq('round', round)
        .eq('player1_id', user.id)
        .is('player2_id', null)
        .maybeSingle();

      if (byeDuel && byeDuel.winner_id === user.id) {
        setIsByeRound(true);
        setActiveDuelId(null);
      }
    }, 300);
  }, [tournamentId, user]);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from('tournament_participants')
      .select('*, profiles(username, mmr, clearance_level)')
      .eq('tournament_id', tournamentId);
    if (data) setParticipants(data);
  }, [tournamentId]);

  // ── Init ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    async function init() {
      // Проверяем реконнект к другому турниру
      const savedTId = sessionStorage.getItem('reconnecting_tournament');
      const savedDuelId = sessionStorage.getItem('active_duel_id');

      if (savedTId && savedTId !== tournamentId) {
        setReconnectTournamentId(savedTId);
        setShowReconnect(true);
        setHasCheckedReconnect(true);
        return;
      }
      if (savedDuelId) {
        sessionStorage.removeItem('active_duel_id');
        const { data: duel } = await supabase
          .from('duels')
          .select('id, status, tournament_id')
          .eq('id', savedDuelId)
          .maybeSingle();
        if (duel && duel.status === 'active' && duel.tournament_id === tournamentId) {
          setReconnectDuelId(savedDuelId);
          setShowReconnect(true);
          setHasCheckedReconnect(true);
          return;
        }
      }

      sessionStorage.removeItem('reconnecting_tournament');
      setHasCheckedReconnect(true);

      // Загружаем инфо о турнире
      const { data: tData } = await supabase
        .from('tournaments')
        .select('code, status, current_round')
        .eq('id', tournamentId)
        .single();

      if (tData) {
        setTournamentCode(tData.code);
        setStatus(tData.status);
        setCurrentRound(tData.current_round ?? 1);
        prevRoundRef.current = tData.current_round ?? 1;
        if (tData.status === 'active') checkForActiveDuel();
      }

      await fetchParticipants();
    }

    init();
  }, [tournamentId, user, checkForActiveDuel, fetchParticipants]);

  // ── Realtime подписки ────────────────────────────────────────
  useEffect(() => {
    if (!user || !hasCheckedReconnect) return;

    const tourSub = supabase
      .channel(`tour-status-${tournamentId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tournaments', filter: `id=eq.${tournamentId}` },
        (payload) => {
          const t = payload.new as any;
          setStatus(t.status);
          const newRound = t.current_round ?? 1;
          setCurrentRound(newRound);

          // Учитель нажал "Следующий раунд" — сбрасываем ожидание и ищем новый матч
          if (newRound > prevRoundRef.current) {
            prevRoundRef.current = newRound;
            setWaitingForNextRound(false);
            setIsByeRound(false);
            setActiveDuelId(null);
            // Небольшая задержка — дуэли могли только что создаться
            setTimeout(() => checkForActiveDuel(), 800);
          }
        })
      .subscribe();

    const partSub = supabase
      .channel(`tour-parts-${tournamentId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${tournamentId}` },
        () => fetchParticipants())
      .subscribe();

    const duelSub = supabase
      .channel(`tour-duels-${tournamentId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'duels', filter: `tournament_id=eq.${tournamentId}` },
        () => {
          // Не делаем checkForActiveDuel если ждём следующего раунда
          if (!waitingForNextRound) checkForActiveDuel();
        })
      .subscribe();

    return () => {
      if (duelCheckTimerRef.current) clearTimeout(duelCheckTimerRef.current);
      supabase.removeChannel(tourSub);
      supabase.removeChannel(partSub);
      supabase.removeChannel(duelSub);
    };
  }, [tournamentId, user, hasCheckedReconnect, checkForActiveDuel, fetchParticipants, waitingForNextRound]);

  // ── Реконнект ────────────────────────────────────────────────
  if (showReconnect) {
    return (
      <ReconnectModal
        onReconnect={() => {
          setShowReconnect(false);
          if (reconnectDuelId) {
            setActiveDuelId(reconnectDuelId);
          } else if (reconnectTournamentId) {
            sessionStorage.setItem('reconnecting_tournament', reconnectTournamentId);
            window.location.href = `/?t=${reconnectTournamentId}`;
          }
        }}
        onCancel={async () => {
          sessionStorage.removeItem('reconnecting_tournament');
          sessionStorage.removeItem('active_duel_id');
          setShowReconnect(false);
          setHasCheckedReconnect(true);
          checkForActiveDuel();
        }}
      />
    );
  }

  // ── Идёт матч ────────────────────────────────────────────────
  if (activeDuelId) {
    return (
      <TournamentPlay
        duelId={activeDuelId}
        onFinished={() => {
          setActiveDuelId(null);
          // После матча — ждём пока учитель нажмёт "Следующий раунд"
          setWaitingForNextRound(true);
          setIsByeRound(false);
          fetchParticipants();
        }}
      />
    );
  }

  // ── Турнир завершён ──────────────────────────────────────────
  if (status === 'finished') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
        <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce" />
        <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest">Турнир завершён!</h2>
        <div className="w-full max-w-2xl">
          <TournamentBracket tournamentId={tournamentId} onEnterMatch={() => {}} isTeacher={false} />
        </div>
      </div>
    );
  }

  // ── BYE: автоматический проход ───────────────────────────────
  if (status === 'active' && isByeRound) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* BYE-баннер */}
        <div className="mx-4 mt-4 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-4 animate-in fade-in duration-500">
          <div className="p-3 bg-emerald-500/20 rounded-xl flex-shrink-0">
            <Zap className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="text-emerald-400 font-black text-lg">Автоматический проход!</div>
            <div className="text-slate-300 text-sm mt-0.5">
              В этом раунде нет соперника — ты проходишь дальше. Жди начала следующего раунда.
            </div>
          </div>
        </div>

        {/* Ожидание следующего раунда */}
        <div className="mx-4 mt-3 p-4 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400 animate-pulse flex-shrink-0" />
          <span className="text-slate-400 text-sm">Ожидание следующего раунда от учителя...</span>
        </div>

        {/* Сетка */}
        <div className="flex-1 mt-4 px-4 pb-4 overflow-hidden">
          <TournamentBracket tournamentId={tournamentId} onEnterMatch={() => {}} isTeacher={false} />
        </div>
      </div>
    );
  }

  // ── Ожидание следующего раунда после матча ───────────────────
  if (status === 'active' && waitingForNextRound) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Баннер ожидания */}
        <div className="mx-4 mt-4 p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center gap-4 animate-in fade-in duration-500">
          <div className="p-3 bg-cyan-500/20 rounded-xl flex-shrink-0">
            <Clock className="w-7 h-7 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="text-cyan-400 font-black text-lg">Раунд {currentRound} завершён</div>
            <div className="text-slate-300 text-sm mt-0.5">
              Ожидай — учитель запустит следующий раунд
            </div>
          </div>
        </div>

        {/* Сетка */}
        <div className="flex-1 mt-4 px-4 pb-4 overflow-hidden">
          <TournamentBracket tournamentId={tournamentId} onEnterMatch={() => {}} isTeacher={false} />
        </div>
      </div>
    );
  }

  // ── Ожидание старта ──────────────────────────────────────────
  if (status === 'waiting') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center">
            <Loader className="w-10 h-10 text-cyan-400 animate-spin" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">{t('tournaments.waiting_host')}</h2>
          <p className="text-slate-400 text-sm">Код турнира: <span className="text-cyan-400 font-mono font-bold text-lg">{tournamentCode}</span></p>
        </div>

        <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm font-medium">{t('tournaments.participants')}: {participants.length}</span>
            <button onClick={fetchParticipants} className="ml-auto p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-600/50 flex items-center justify-center text-xs font-bold text-cyan-300">
                  {(p.profiles?.username || '?')[0].toUpperCase()}
                </div>
                <span className="text-slate-200 text-sm font-medium">{p.profiles?.username || 'Неизвестный'}</span>
                <span className="ml-auto text-xs text-slate-500 font-mono">{p.profiles?.mmr ?? '—'} MP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Активный турнир: лобби / ожидание своего матча ──────────
  return (
    <div className="w-full h-full flex flex-col">
      {/* Баннер: ожидание своего матча */}
      <div className="mx-4 mt-4 p-4 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <span className="text-slate-300 text-sm">{t('tournaments.wait_other_matches')}</span>
      </div>

      {/* Сетка турнира */}
      <div className="flex-1 mt-4 px-4 pb-4 overflow-hidden">
        <TournamentBracket
          tournamentId={tournamentId}
          onEnterMatch={(duelId) => setActiveDuelId(duelId)}
          isTeacher={false}
        />
      </div>
    </div>
  );
}