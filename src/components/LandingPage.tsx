import { ArrowRight, Zap, Shield, Trophy } from 'lucide-react';

type Props = {
  onStartDemo: () => void;
  onLogin: () => void;
};

export function LandingPage({ onStartDemo, onLogin }: Props) {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center text-white font-sans selection:bg-cyan-500/30">
      
      {/* Фон */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        
        {/* Логотип / Бейдж */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/30 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-bold tracking-widest uppercase">MathLab PvP v1.0</span>
        </div>

        {/* Заголовок */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Подготовка к ЕНТ <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">нового поколения</span>
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          Забудь про скучные учебники. Прокачивай своего персонажа, сражайся с друзьями на PvP-арене и участвуй в школьных турнирах.
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <button 
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-cyan-50 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            Попробовать Демо <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onLogin}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white font-bold rounded-xl text-lg transition-all hover:bg-slate-750"
          >
            Войти в аккаунт
          </button>
        </div>

        {/* Фичи */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-in fade-in duration-1000 delay-500">
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">PvP Битвы</h3>
            <p className="text-slate-400 text-sm">Вызывай друзей на дуэль и докажи, кто лучше знает математику.</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm">
            <Zap className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">Живой Питомец</h3>
            <p className="text-slate-400 text-sm">Найди суриката, ухаживай за ним и получай подсказки в решении.</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm">
            <Shield className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">Турниры</h3>
            <p className="text-slate-400 text-sm">Участвуй в классных и школьных турнирах с реальной сеткой.</p>
          </div>
        </div>

      </div>
    </div>
  );
}