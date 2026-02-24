import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, User, Trophy, MonitorPlay, Home, Bell, Zap, GraduationCap } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Profile, supabase } from '../lib/supabase';
import { getRank, getLevelProgress } from '../lib/gameLogic';
import { NotificationsModal } from './NotificationsModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { OnlineCounter } from './OnlineCounter'; // <--- ИМПОРТ

type Props = {
  user: SupabaseUser | null;
  profile: Profile | null;
  onBackToMap: () => void;
  onShowCompanion: () => void;
  onShowArchive: () => void;
  onShowLeaderboard: () => void;
  onShowDashboard: () => void;
  onExitGuest: () => void;
  onShowAuth: () => void;
};

export function Header({ 
  user, profile, onBackToMap, 
  onShowCompanion, onShowArchive, onShowLeaderboard, onShowDashboard,
  onExitGuest, onShowAuth 
}: Props) {
  const { t } = useTranslation();

  const currentRank = profile ? getRank(profile.clearance_level, profile.role) : { title: t('header.guest'), color: 'text-slate-400' };
  const progressPercent = profile ? getLevelProgress(profile.total_experiments) : 0;

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    checkUnread();

    const channel = supabase
      .channel('header-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
      () => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <>
      <header className="relative border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-3 md:px-8 py-2 md:py-3 flex items-center justify-between gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
          
          {/* ЛОГОТИП + СЧЕТЧИК (Слева) */}
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={onBackToMap} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 border border-cyan-500/30 bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                 <img 
                   src="/logo.png" 
                   alt="MathLab" 
                   className="w-full h-full object-cover"
                   onError={(e) => { 
                     e.currentTarget.style.display='none'; 
                   }}
                 />
              </div>

              <div className="hidden sm:block text-left">
                <h1 className="text-xl font-bold text-white leading-tight">MathLab</h1>
                <p className="text-cyan-400/60 text-xs font-mono">PvP Arena</p>
              </div>
            </button>

            {/* СЧЕТЧИК ОНЛАЙНА */}
            <div className="hidden xs:block">
               <OnlineCounter />
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ (КНОПКИ) */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            
            {/* Переключатель языка */}
            <LanguageSwitcher />

            {user ? (
              <>
                  <button 
                    onClick={() => { setShowNotifications(true); setUnreadCount(0); }}
                    className="relative p-2 md:p-2.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all group"
                  >
                    <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 flex h-2.5 w-2.5 md:h-3 md:w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {profile?.companion_name && (
                    <button 
                      onClick={onShowCompanion}
                      className="relative group p-1 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors"
                      title={`Домик ${profile.companion_name}`}
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                        <img 
                          src="/meerkat/avatar.png" 
                          alt="Pet" 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                          onError={(e) => { e.currentTarget.style.display='none'; }}
                        />
                      </div>
                      {profile.companion_hunger < 30 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 border-2 border-slate-900 rounded-full animate-ping" />
                      )}
                    </button>
                  )}

                  <button onClick={onShowArchive} className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors group hidden sm:block" title={t('header.archive')}>
                    <MonitorPlay className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </button>

                  <button onClick={onShowLeaderboard} className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors group hidden sm:block" title={t('header.leaderboard')}>
                    <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </button>

                  {/* КНОПКА ПРОФИЛЯ */}
                  <button onClick={onShowDashboard} className="flex items-center gap-2 pl-2 border-l border-slate-700/50 ml-1">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold uppercase ${currentRank?.color}`}>
                          {currentRank?.title.split(' ')[0]}
                        </span>
                        
                        {profile?.is_premium && profile.role !== 'teacher' && (
                          <div className="bg-amber-500/20 p-0.5 rounded border border-amber-500/50" title="Premium">
                            <Zap className="w-2 h-2 md:w-2.5 md:h-2.5 text-amber-400 fill-current" />
                          </div>
                        )}
                        {profile?.role === 'teacher' && (
                          <div className="bg-cyan-500/20 p-0.5 rounded border border-cyan-500/50" title="Teacher">
                            <GraduationCap className="w-2 h-2 md:w-2.5 md:h-2.5 text-cyan-400" />
                          </div>
                        )}
                      </div>

                      <span className="hidden md:block text-white font-medium text-sm leading-none max-w-[80px] truncate">{profile?.username}</span>
                      <div className="w-8 md:w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5 md:mt-1">
                        <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                    <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                        <User className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                    </div>
                  </button>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <button onClick={onExitGuest} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors" title={t('header.home_title')}>
                  <Home className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button onClick={onShowAuth} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-cyan-900/20 text-xs md:text-sm">
                  {t('header.login_btn')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </>
  );
}