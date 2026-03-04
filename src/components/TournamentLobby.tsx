import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TournamentBracket } from './TournamentBracket';
import { Users, Loader, Trophy, Crown, ScanFace } from 'lucide-react';

type Props = {
  tournamentId: string;
};

export function TournamentLobby({ tournamentId }: Props) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Загружаем текущие данные
    async function loadLobby() {
      const { data: tData } = await supabase
        .from('tournaments')
        .select('status')
        .eq('id', tournamentId)
        .single();
      
      if (tData) setStatus(tData.status as any);

      const { data: pData } = await supabase
        .from('tournament_participants')
        .select('user_id, profiles(username, mmr)')
        .eq('tournament_id', tournamentId);
        
      if (pData) setParticipants(pData);
      setLoading(false);
    }
    loadLobby();

    // 2. ПОДПИСКА НА REALTIME (Мгновенное появление игроков и старт)
    const channel = supabase
      .channel(`lobby-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tournaments', filter: `id=eq.${tournamentId}` },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${tournamentId}` },
        () => {
          // Если кто-то зашел/вышел, просто перезапрашиваем список
          supabase
            .from('tournament_participants')
            .select('user_id, profiles(username, mmr)')
            .eq('tournament_id', tournamentId)
            .then(({ data }) => {
              if (data) setParticipants(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  // Если турнир уже стартовал — показываем сетку (Bracket)
  if (status === 'active' || status === 'finished') {
    return (
      <div className="h-full p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in zoom-in duration-500">
        <TournamentBracket 
          tournamentId={tournamentId} 
          onEnterMatch={(duelId) => {
            // При входе в матч, меняем URL или State, но так как у нас есть App.tsx, 
            // мы можем просто форсировать подписку. 
            // Но чтобы было гладко:
            window.location.reload(); // App.tsx сам подхватит duelId при загрузке
          }} 
        />
      </div>
    );
  }

  // Экран ожидания лобби
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Фоновое свечение */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center relative z-10 mb-10">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/50 animate-ping" />
            <Trophy className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider mb-2">
            Турнирное Лобби
          </h1>
          <p className="text-cyan-400 flex items-center justify-center gap-2 font-mono">
            <Loader className="w-4 h-4 animate-spin" />
            Ожидание запуска организатором...
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Users className="w-5 h-5 text-slate-400" />
              Участники
            </div>
            <div className="px-3 py-1 bg-slate-900 rounded-lg text-cyan-400 font-mono font-bold border border-slate-700">
              {participants.length} ИГРОКОВ
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">Загрузка списка...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {participants.map((p) => {
                const isMe = p.user_id === user?.id;
                return (
                  <div 
                    key={p.user_id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isMe 
                        ? 'bg-cyan-900/30 border-cyan-500/50 text-white' 
                        : 'bg-slate-900/50 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                      <ScanFace className={`w-4 h-4 ${isMe ? 'text-cyan-400' : 'text-slate-500'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate text-sm flex items-center gap-1">
                        {p.profiles?.username} 
                        {isMe && <span className="text-[9px] bg-cyan-600 text-white px-1.5 py-0.5 rounded">ВЫ</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.profiles?.mmr} MP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}