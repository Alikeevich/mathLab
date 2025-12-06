import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';
import { TournamentBracket } from './TournamentBracket';
import { Users, Play, Crown, Copy, Loader, RefreshCw, X, Trash2, AlertTriangle } from 'lucide-react';

export function TournamentAdmin({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string>('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [status, setStatus] = useState('waiting');
  const [loading, setLoading] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false); // Модалка подтверждения

  // 1. Инициализация (Создание + Чистка)
  useEffect(() => {
    async function initTournament() {
      if (!user) return;

      // АВТО-ЧИСТКА: Удаляем старые зависшие турниры этого учителя перед созданием нового
      // Чтобы не плодить мусор
      await supabase.from('tournaments').delete()
        .eq('created_by', user.id)
        .eq('status', 'waiting'); // Удаляем только те, что не начались

      // Также вызываем глобальную чистку мусора (старее 24 часов)
      await supabase.rpc('cleanup_stale_tournaments');

      // Создаем новый
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const { data } = await supabase
        .from('tournaments')
        .insert({ created_by: user.id, code })
        .select()
        .single();
        
      if (data) {
        setTournamentId(data.id);
        setJoinCode(code);
        
        const channel = supabase
          .channel('admin-participants')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${data.id}` }, 
          () => { fetchParticipants(data.id); }) 
          .subscribe();
          
        return () => { supabase.removeChannel(channel); };
      }
    }
    initTournament();
  }, []);

  async function fetchParticipants(tId: string) {
    const targetId = tId || tournamentId;
    if (!targetId) return;

    setLoading(true);
    const { data } = await supabase
      .from('tournament_participants')
      .select('*, profiles(username, mmr, clearance_level)')
      .eq('tournament_id', targetId);
    
    if (data) setParticipants(data);
    setLoading(false);
  }

  // 2. СТАРТ
  async function startTournament() {
    if (!tournamentId || participants.length < 2) {
      alert("Нужно минимум 2 участника для старта!");
      return;
    }

    try {
      // Вызываем мощную функцию на сервере
      const { error } = await supabase.rpc('start_tournament_engine', { t_id: tournamentId });
      
      if (error) {
        console.error('Ошибка старта:', error);
        alert('Ошибка при запуске турнира. Проверьте консоль.');
      } else {
        // Успех! Статус обновится сам через Realtime
        setStatus('active'); 
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 3. УНИЧТОЖЕНИЕ ТУРНИРА (Красная кнопка)
  async function destroyTournament() {
    if (tournamentId) {
      // Благодаря ON DELETE CASCADE в SQL, удаление турнира удалит ВСЕХ участников и ВСЕ матчи.
      // База будет чиста.
      await supabase.from('tournaments').delete().eq('id', tournamentId);
      onClose();
    }
  }

  // Обработчик закрытия крестиком
  const handleCloseAttempt = () => {
    if (status === 'active' || status === 'finished') {
      // Если турнир идет - просто закрываем окно (сворачиваем), но не удаляем
      onClose();
    } else {
      // Если мы в лобби - спрашиваем, удалить ли комнату
      setShowConfirmClose(true);
    }
  };

  const joinLink = `${window.location.origin}/?t=${joinCode}`;

  return (
    <>
      {/* МОДАЛКА ПОДТВЕРЖДЕНИЯ ВЫХОДА */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Закрыть лобби?</h3>
              <p className="text-slate-400 text-sm">
                Турнир еще не начался. Если вы выйдете, комната будет уничтожена, а участники отключены.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={destroyTournament}
                className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ОСНОВНОЕ ОКНО */}
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Шапка */}
        <div className="p-6 border-b border-cyan-500/20 flex justify-between items-center bg-slate-800">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Панель Учителя</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Управление турниром</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Кнопка принудительного удаления (Мусорка) */}
             <button 
               onClick={() => setShowConfirmClose(true)}
               className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-colors"
               title="Распустить турнир"
             >
               <Trash2 className="w-5 h-5" />
             </button>
             
             <button onClick={handleCloseAttempt} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
               <X className="w-6 h-6 text-slate-400 hover:text-white" />
             </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* ЛЕВАЯ КОЛОНКА (QR) - Скрываем, если турнир идет */}
          {status === 'waiting' && (
            <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col items-center justify-center bg-slate-800/50">
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] mb-8">
                <QRCode value={joinLink} size={220} />
              </div>
              
              <div className="flex flex-col items-center gap-2 mb-8">
                <span className="text-slate-400 text-sm uppercase tracking-wider">Код доступа</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(joinCode)}
                  className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 transition-transform flex items-center gap-4 cursor-pointer group"
                  title="Нажми чтобы скопировать"
                >
                  {joinCode}
                  <Copy className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              </div>
              
              <button 
                disabled={participants.length < 2}
                onClick={startTournament}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20"
              >
                <Play className="w-6 h-6 fill-current" /> НАЧАТЬ БИТВУ
              </button>
              <p className="text-slate-500 text-xs mt-3 text-center">Нужно минимум 2 участника</p>
            </div>
          )}

          {/* ПРАВАЯ КОЛОНКА (СПИСОК ИЛИ СЕТКА) */}
          <div className="flex-1 p-8 bg-slate-900 overflow-y-auto">
            
            {status === 'active' || status === 'finished' ? (
               <div className="h-full">
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
                    <h3 className="text-xl font-bold text-white">Список участников</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => tournamentId && fetchParticipants(tournamentId)}
                       className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                       title="Обновить список"
                     >
                       <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                     </button>

                     <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 font-mono text-sm">
                       Всего: {participants.length}
                     </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {participants.map((p) => {
                    const username = p.profiles?.username || 'Неизвестный';
                    const mmr = p.profiles?.mmr || '???';
                    const lvl = p.profiles?.clearance_level ?? 0;
                    const letter = username[0]?.toUpperCase() || '?';

                    return (
                      <div key={p.id} className="group p-4 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl flex items-center gap-4 transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {letter}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">
                            {username}
                          </div>
                          <div className="text-xs text-slate-400 flex gap-2">
                            <span>{mmr} MP</span>
                            <span>•</span>
                            <span>LVL {lvl}</span>
                          </div>
                        </div>
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