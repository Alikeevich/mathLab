import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Swords, Copy, Check, Loader, UserPlus, Hash, ArrowRight, Users } from 'lucide-react';

const PVP_MODULE_ID = '00000000-0000-0000-0000-000000000001';

type Props = {
  onClose: () => void;
  onDuelReady: (duelId: string) => void;
};

export function FriendlyDuelModal({ onClose, onDuelReady }: Props) {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<'create' | 'join'>('create');

  // Create tab
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [waitingOpponent, setWaitingOpponent] = useState(false);
  const channelRef = useRef<any>(null);

  // Join tab
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  // ── Создать дуэль ────────────────────────────────────────
  async function handleCreate() {
    if (!user) return;
    setCreating(true);
    try {
      const { data: probs } = await supabase
        .from('problems')
        .select('id')
        .eq('module_id', PVP_MODULE_ID);

      const shuffled = (probs ?? [])
        .sort(() => 0.5 - Math.random())
        .slice(0, 10)
        .map((p: any) => p.id);

      const { data, error } = await supabase.rpc('create_friendly_duel', {
        creator_uuid: user.id,
        prob_ids: shuffled,
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      setInviteCode(data.invite_code);
      setDuelId(data.id);
      setWaitingOpponent(true);

      // Подписываемся на дуэль — ждём когда player2 присоединится
      channelRef.current = supabase
        .channel(`friendly-wait-${data.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${data.id}`,
        }, (payload) => {
          if (payload.new.status === 'active' && payload.new.player2_id) {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            onDuelReady(data.id);
          }
        })
        .subscribe();
    } catch (err: any) {
      alert('Ошибка: ' + (err.message || 'Не удалось создать дуэль'));
    } finally {
      setCreating(false);
    }
  }

  async function copyCode() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function cancelDuel() {
    if (duelId) {
      await supabase.from('duels').delete().eq('id', duelId);
    }
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    setInviteCode(null);
    setDuelId(null);
    setWaitingOpponent(false);
  }

  // ── Войти в дуэль ────────────────────────────────────────
  async function handleJoin() {
    if (!user || joinCode.length < 6) return;
    setJoining(true);
    setJoinError('');
    try {
      const { data, error } = await supabase.rpc('join_friendly_duel', {
        joiner_uuid: user.id,
        code: joinCode.trim().toUpperCase(),
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);
      onDuelReady(data.id);
    } catch (err: any) {
      setJoinError(err.message || 'Не удалось войти');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white font-bold">Дружеский матч</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Без рейтинга
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {(['create', 'join'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setJoinError(''); }}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                tab === t
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'create' ? '⚡ Создать' : '🔗 Войти по коду'}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* ── CREATE ─────────────────────────────────────── */}
          {tab === 'create' && (
            <div className="space-y-4">
              {!waitingOpponent ? (
                <>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Создай дуэль — получишь код. Отправь другу, он вводит его и матч начинается. <span className="text-emerald-400 font-semibold">MMR не меняется.</span>
                  </p>
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                  >
                    {creating
                      ? <><Loader className="w-4 h-4 animate-spin" /> Создаём...</>
                      : <><Swords className="w-4 h-4" /> Создать дуэль</>}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm text-center">Отправь этот код другу:</p>

                  {/* Code display */}
                  <div className="relative">
                    <div className="bg-slate-800 border-2 border-emerald-500/40 rounded-2xl p-5 text-center">
                      <div className="text-4xl font-black font-mono tracking-[0.3em] text-emerald-400 select-all">
                        {inviteCode}
                      </div>
                    </div>
                    <button
                      onClick={copyCode}
                      className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
                      title="Скопировать"
                    >
                      {copied
                        ? <Check className="w-4 h-4 text-emerald-400" />
                        : <Copy className="w-4 h-4 text-slate-300" />}
                    </button>
                  </div>

                  {/* Waiting indicator */}
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <Loader className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Ждём соперника...</span>
                  </div>

                  <button
                    onClick={cancelDuel}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white font-semibold rounded-xl text-sm transition-all"
                  >
                    Отменить
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── JOIN ───────────────────────────────────────── */}
          {tab === 'join' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Введи 6-значный код от друга чтобы начать матч.
              </p>

              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                    setJoinError('');
                  }}
                  placeholder="ABCD12"
                  className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-white font-mono font-bold text-lg tracking-widest text-center outline-none transition-colors placeholder:text-slate-600 placeholder:font-normal placeholder:tracking-normal"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {joinError && (
                <p className="text-red-400 text-sm text-center">{joinError}</p>
              )}

              <button
                onClick={handleJoin}
                disabled={joining || joinCode.length < 6}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                {joining
                  ? <><Loader className="w-4 h-4 animate-spin" /> Подключаемся...</>
                  : <><ArrowRight className="w-4 h-4" /> Войти в матч</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}