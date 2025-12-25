import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Zap, Target, X, Crown, Medal, Star, Swords } from 'lucide-react';
import { getRank } from '../lib/gameLogic';

export function Leaderboard({ onClose }: { onClose: () => void }) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaders() {
      const { data, error } = await supabase.rpc('get_leaderboard');
      
      if (error) console.error('Ошибка рейтинга:', error);
      if (data) setLeaders(data);
      
      setLoading(false);
    }
    loadLeaders();
  }, []);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return {
        border: 'border-amber-400/50',
        bg: 'bg-amber-900/10',
        text: 'text-amber-400',
        icon: <Crown className="w-5 h-5 md:w-8 md:h-8 text-amber-400 fill-current animate-bounce" />,
        shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]'
      };
      case 1: return {
        border: 'border-slate-300/50',
        bg: 'bg-slate-800/30',
        text: 'text-slate-300',
        icon: <Medal className="w-5 h-5 md:w-8 md:h-8 text-slate-300" />,
        shadow: ''
      };
      case 2: return {
        border: 'border-orange-700/50',
        bg: 'bg-orange-900/10',
        text: 'text-orange-500',
        icon: <Medal className="w-5 h-5 md:w-8 md:h-8 text-orange-600" />,
        shadow: ''
      };
      default: return {
        border: 'border-slate-800',
        bg: 'bg-slate-900/50',
        text: 'text-slate-500',
        icon: <span className="font-mono font-bold text-sm md:text-xl text-slate-600">#{index + 1}</span>,
        shadow: ''
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center p-2 md:p-4 animate-in fade-in zoom-in duration-300">
      
      <div className="w-full max-w-3xl bg-slate-900/90 border border-amber-500/20 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        {/* ШАПКА */}
        <div className="p-5 md:p-8 pb-4 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="p-2 md:p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl md:rounded-2xl shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6 md:w-10 md:h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">Рейтинг</h2>
              <p className="text-slate-400 text-[10px] md:text-sm font-mono uppercase tracking-widest mt-1">Топ лучших агентов</p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 md:p-3 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* СПИСОК */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 pt-2 space-y-2 md:space-y-4 custom-scrollbar relative z-10">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
               <div className="animate-spin"><Trophy className="w-8 h-8 opacity-20"/></div>
               <span className="text-xs font-mono">ЗАГРУЗКА...</span>
             </div>
          ) : leaders.map((player, index) => {
            const rankInfo = getRank(player.clearance_level, player.is_admin);
            const style = getRankStyle(index);
            
            return (
              <div 
                key={index}
                className={`
                  relative flex items-center gap-3 md:gap-6 p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-300
                  ${style.bg} ${style.border} ${style.shadow}
                  hover:bg-slate-800
                `}
              >
                {/* 1. МЕСТО */}
                <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center shrink-0">
                  {style.icon}
                </div>

                {/* 2. ИНФО */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 md:gap-3 mb-0.5 md:mb-1">
                    <span className={`font-bold text-sm md:text-xl truncate ${index < 3 ? 'text-white' : 'text-slate-300'}`}>
                      {player.username}
                    </span>
                    {index < 3 && <Star className="w-3 h-3 md:w-5 md:h-5 text-amber-400 fill-current animate-pulse shrink-0" />}
                    {player.is_admin && <Crown className="w-3 h-3 md:w-5 md:h-5 text-amber-500 shrink-0" />}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* НА МОБИЛКЕ: Обрезаем (truncate). НА ПК: Показываем полностью (max-w-none) */}
                    <span className={`
                      text-[9px] md:text-xs font-bold px-1.5 md:px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 ${rankInfo.color} uppercase tracking-wider 
                      truncate max-w-[100px] md:max-w-none
                    `}>
                      {rankInfo.title}
                    </span>
                    <span className="text-[9px] md:text-xs text-slate-500 font-mono hidden xs:inline">LVL {player.clearance_level}</span>
                  </div>
                </div>

                {/* 3. СТАТИСТИКА */}
                <div className="flex flex-col items-end gap-1 md:gap-2 shrink-0">
                  
                  {/* RATING */}
                  <div className="text-right">
                    <div className="text-[8px] md:text-[10px] text-slate-500 font-mono uppercase leading-none mb-0.5 md:mb-1">Rating</div>
                    <div className={`font-black font-mono text-base md:text-2xl leading-none ${style.text}`}>
                      {player.global_score}
                    </div>
                  </div>

                  {/* ПОКАЗАТЕЛИ (На ПК показываем всё, на мобилке только MP) */}
                  <div className="flex items-center gap-1 md:gap-3">
                    
                    {/* MP */}
                    <div className="flex items-center gap-1 bg-red-500/10 px-1.5 md:px-2 py-0.5 rounded text-red-400 border border-red-500/20" title="PvP Рейтинг">
                      <Swords className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-sm font-mono font-bold">{player.mmr}</span>
                    </div>

                    {/* EXP */}
                    <div className="hidden sm:flex items-center gap-1 bg-cyan-500/10 px-1.5 md:px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/20" title="Всего задач">
                      <Zap className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                      <span className="text-[10px] md:text-sm font-mono font-bold">{player.total_experiments}</span>
                    </div>
                    
                    {/* ACC */}
                    <div className="hidden sm:flex items-center gap-1 bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/20" title="Точность">
                      <Target className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-sm font-mono font-bold">{Number(player.success_rate).toFixed(0)}%</span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* ФУТЕР */}
        <div className="p-3 md:p-5 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[8px] md:text-xs text-slate-500 font-mono">
            RATING = MP + (EXP × 5) + (ACC% × 2)
          </p>
        </div>

      </div>
    </div>
  );
}