import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';
import { TournamentBracket } from './TournamentBracket';
import {
  Users, Play, Trophy, X, Crown, Copy, Loader, RefreshCw,
  Trash2, AlertTriangle, Eye, Swords, Shuffle, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SpectatorModal } from './SpectatorModal';

export function TournamentAdmin({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();

  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string>('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [activeDuels, setActiveDuels] = useState<any[]>([]);
  const [status, setStatus] = useState('waiting');
  const [format, setFormat] = useState<'bracket' | 'teams'>('bracket');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [spectatingDuelId, setSpectatingDuelId] = useState<string | null>(null);

  // ── Инициализация ────────────────────────────────────────
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    async function initTournament() {
      if (!user) return;

      const { data: existing } = await supabase
        .from('tournaments')
        .select('*')
        .eq('created_by', user.id)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        const t = existing[0];
        setTournamentId(t.id);
        setJoinCode(t.code);
        setStatus(t.status);
        setFormat(t.format || 'bracket');
        fetchParticipants(t.id);
        if (t.status === 'active') fetchActiveDuels(t.id);

        channel = supabase.channel('admin-participants')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${t.id}` },
            () => fetchParticipants(t.id))
          .subscribe();
        return;
      }

      // Чистим старые и создаём новый
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      await supabase.from('tournaments').delete()
        .eq('created_by', user.id).eq('status', 'waiting').lt('created_at', oneHourAgo);
      await supabase.rpc('cleanup_stale_tournaments');

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const { data, error } = await supabase
        .from('tournaments').insert({ created_by: user.id, code, format: 'bracket' })
        .select().single();

      if (error) { alert('Не удалось создать турнир'); return; }

      if (data) {
        setTournamentId(data.id);
        setJoinCode(code);
        channel = supabase.channel('admin-participants')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${data.id}` },
            () => fetchParticipants(data.id))
          .subscribe();
      }
    }

    initTournament();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [user]);

  // Подписка на дуэли при активном турнире
  useEffect(() => {
    let ch: RealtimeChannel | null = null;
    if (tournamentId && status === 'active') {
      fetchActiveDuels(tournamentId);
      ch = supabase.channel(`admin-duels-${tournamentId}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'duels', filter: `tournament_id=eq.${tournamentId}` },
          () => fetchActiveDuels(tournamentId))
        .subscribe();
    }
    return () => { if (ch) supabase.removeChannel(ch); };
  }, [tournamentId, status]);

  async function fetchParticipants(tId: string) {
    setLoading(true);
    const { data } = await supabase
      .from('tournament_participants')
      .select('*, profiles(username, mmr, clearance_level)')
      .eq('tournament_id', tId);
    if (data) setParticipants(data);
    setLoading(false);
  }

  async function fetchActiveDuels(tId?: string) {
    const id = tId || tournamentId;
    if (!id) return;
    const { data } = await supabase
      .from('duels')
      .select(`id, status, player1_score, player2_score, round,
        p1:profiles!duels_player1_id_fkey(username),
        p2:profiles!duels_player2_id_fkey(username)`)
      .eq('tournament_id', id)
      .eq('status', 'active')
      .order('round', { ascending: false });
    if (data) setActiveDuels(data);
  }

  // ── Переключить формат ───────────────────────────────────
  const toggleFormat = async () => {
    if (!tournamentId) return;
    const newFmt = format === 'bracket' ? 'teams' : 'bracket';
    await supabase.from('tournaments').update({ format: newFmt }).eq('id', tournamentId);
    setFormat(newFmt);
  };

  // ── Назначить команду участнику ──────────────────────────
  const setTeam = async (participantId: string, team: 1 | 2) => {
    await supabase
      .from('tournament_participants')
      .update({ team })
      .eq('id', participantId);
    if (tournamentId) fetchParticipants(tournamentId);
  };

  // ── Авто-разбивка на команды ─────────────────────────────
  const autoAssignTeams = async () => {
    if (!tournamentId) return;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    for (let i = 0; i < shuffled.length; i++) {
      await supabase
        .from('tournament_participants')
        .update({ team: i < half ? 1 : 2 })
        .eq('id', shuffled[i].id);
    }
    fetchParticipants(tournamentId);
  };

  // ── Старт ────────────────────────────────────────────────
  async function startTournament() {
    if (!tournamentId || participants.length < 2) {
      alert('Нужно минимум 2 участника!');
      return;
    }
    if (format === 'teams') {
      const t1 = participants.filter(p => p.team === 1).length;
      const t2 = participants.filter(p => p.team === 2).length;
      if (t1 === 0 || t2 === 0) {
        alert('Для командного формата нужно назначить обе команды!');
        return;
      }
    }
    setStarting(true);
    try {
      const { error } = await supabase.rpc('start_tournament_engine', { t_id: tournamentId });
      if (error) throw error;
      setStatus('active');
    } catch (err: any) {
      console.error(err);
      alert('Ошибка: ' + (err.message || 'Не удалось запустить турнир'));
    } finally {
      setStarting(false);
    }
  }

  async function destroyTournament() {
    if (tournamentId) {
      await supabase.from('tournaments').delete().eq('id', tournamentId);
      onClose();
    }
  }

  const joinLink = `${window.location.origin}/?t=${joinCode}`;
  const team1Count = participants.filter(p => p.team === 1).length;
  const team2Count = participants.filter(p => p.team === 2).length;

  return (
    <>
      {spectatingDuelId && (
        <SpectatorModal duelId={spectatingDuelId} onClose={() => setSpectatingDuelId(null)} />
      )}

      {showConfirmClose && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Закрыть лобби?</h3>
              <p className="text-slate-400 text-sm">
                Турнир ещё не начался. Комната будет уничтожена, участники отключены.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirmClose(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold">
                Отмена
              </button>
              <button onClick={destroyTournament}
                className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">

        {/* Шапка */}
        <div className="p-6 border-b border-cyan-500/20 flex justify-between items-center bg-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Панель Учителя</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Управление турниром</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowConfirmClose(true)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-colors"
              title="Распустить турнир">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={() => status === 'active' || status === 'finished' ? onClose() : setShowConfirmClose(true)}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* ── Левая колонка ── */}
          <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col bg-slate-800/50 overflow-y-auto shrink-0">

            {status === 'waiting' ? (
              <div className="flex flex-col items-center justify-center flex-1 py-6">
                {/* QR */}
                <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] mb-6">
                  <QRCode value={joinLink} size={180} />
                </div>

                <div className="flex flex-col items-center gap-1 mb-6">
                  <span className="text-slate-400 text-sm uppercase tracking-wider">Код доступа</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(joinCode)}
                    className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 transition-transform flex items-center gap-3 cursor-pointer group"
                  >
                    {joinCode}
                    <Copy className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                </div>

                {/* Формат */}
                <div className="w-full bg-slate-900 rounded-xl p-4 mb-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-semibold text-sm">Формат</span>
                    <button onClick={toggleFormat}
                      className="flex items-center gap-2 text-sm font-bold transition-colors">
                      {format === 'bracket' ? (
                        <>
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400">Олимпийский</span>
                          <ToggleLeft className="w-5 h-5 text-slate-500" />
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400">Стенка на стенку</span>
                          <ToggleRight className="w-5 h-5 text-purple-400" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {format === 'bracket'
                      ? 'Плей-офф сетка, победитель проходит дальше'
                      : 'Две команды А и Б, каждый дерётся 1-на-1'}
                  </p>
                </div>

                {/* Кнопка старта */}
                <button
                  disabled={participants.length < 2 || starting ||
                    (format === 'teams' && (team1Count === 0 || team2Count === 0))}
                  onClick={startTournament}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
                >
                  {starting
                    ? <><Loader className="w-5 h-5 animate-spin" /> ЗАПУСК...</>
                    : <><Play className="w-5 h-5 fill-current" /> НАЧАТЬ БИТВУ</>
                  }
                </button>

                {format === 'teams' && (team1Count === 0 || team2Count === 0) && participants.length > 0 && (
                  <p className="text-amber-400 text-xs text-center mt-2">
                    ⚠ Назначьте игроков в обе команды
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-2 text-center">
                  Минимум 2 участника для старта
                </p>
              </div>
            ) : (
              // Активные матчи
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4 text-white font-bold animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  ПРЯМОЙ ЭФИР ({activeDuels.length})
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {activeDuels.map((duel) => (
                    <div key={duel.id} onClick={() => setSpectatingDuelId(duel.id)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-mono">
                          <span className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400 border border-slate-700">R{duel.round}</span>
                          <span className="flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                            <Eye className="w-3 h-3" /> Watch
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-white truncate max-w-[80px]">{duel.p1?.username || '???'}</div>
                          <div className="text-sm font-mono font-black text-slate-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                            {duel.player1_score} : {duel.player2_score}
                          </div>
                          <div className="font-bold text-white truncate max-w-[80px] text-right">{duel.p2?.username || '???'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeDuels.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                      <Swords className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Нет активных матчей</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Правая колонка ── */}
          <div className="flex-1 p-8 bg-slate-900 overflow-y-auto">

            {status === 'active' || status === 'finished' ? (
              <div className="h-full min-h-[500px]">
                {tournamentId && (
                  <TournamentBracket
                    tournamentId={tournamentId}
                    onEnterMatch={() => {}}
                    isTeacher={true}
                  />
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Участники</h3>
                    {format === 'teams' && (
                      <div className="flex gap-2 text-xs font-mono">
                        <span className="bg-cyan-900/40 text-cyan-400 border border-cyan-700 px-2 py-0.5 rounded-full">
                          А: {team1Count}
                        </span>
                        <span className="bg-red-900/40 text-red-400 border border-red-700 px-2 py-0.5 rounded-full">
                          Б: {team2Count}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {format === 'teams' && participants.length > 1 && (
                      <button onClick={autoAssignTeams}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-800/30 hover:bg-purple-800/50 border border-purple-700 text-purple-300 rounded-lg text-sm font-semibold transition-colors"
                        title="Авто-разбивка на команды">
                        <Shuffle className="w-4 h-4" /> Авто
                      </button>
                    )}
                    <button onClick={() => tournamentId && fetchParticipants(tournamentId)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 font-mono text-sm">
                      {participants.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {participants.map((p) => {
                    const username = p.profiles?.username || 'Неизвестный';
                    const mmr = p.profiles?.mmr || '???';
                    const lvl = p.profiles?.clearance_level ?? 0;
                    const letter = username[0]?.toUpperCase() || '?';
                    const currentTeam = p.team as 1 | 2 | null;

                    return (
                      <div key={p.id}
                        className={`group p-4 border rounded-xl flex items-center gap-4 transition-all hover:-translate-y-0.5 ${
                          currentTeam === 1
                            ? 'bg-cyan-950/30 border-cyan-700/50'
                            : currentTeam === 2
                              ? 'bg-red-950/30 border-red-700/50'
                              : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 ${
                          currentTeam === 1
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-700'
                            : currentTeam === 2
                              ? 'bg-gradient-to-br from-red-600 to-rose-700'
                              : 'bg-gradient-to-br from-slate-600 to-slate-700'
                        }`}>
                          {letter}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                            {username}
                          </div>
                          <div className="text-xs text-slate-400 flex gap-2">
                            <span>{mmr} MP</span>
                            <span>•</span>
                            <span>LVL {lvl}</span>
                          </div>
                        </div>

                        {/* Командный переключатель (только для teams формата) */}
                        {format === 'teams' && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => setTeam(p.id, 1)}
                              className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                                currentTeam === 1
                                  ? 'bg-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                                  : 'bg-slate-700 text-slate-400 hover:bg-cyan-900 hover:text-cyan-300'
                              }`}
                            >A</button>
                            <button
                              onClick={() => setTeam(p.id, 2)}
                              className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                                currentTeam === 2
                                  ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                  : 'bg-slate-700 text-slate-400 hover:bg-red-900 hover:text-red-300'
                              }`}
                            >Б</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {participants.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                    <Loader className="w-10 h-10 mb-4 animate-spin opacity-50" />
                    <p>Ожидание подключения учеников...</p>
                    <p className="text-xs mt-2">Попросите их ввести код или сканировать QR</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}