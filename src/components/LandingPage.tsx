import { useState } from 'react';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Trophy, 
  Mail, 
  Check, 
  Share2, 
  Brain, 
  Lock, 
  Swords 
} from 'lucide-react';
import Squares from './Squares';

type Props = {
  onStartDemo: () => void;
  onLogin: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
};

export function LandingPage({ onStartDemo, onLogin, onOpenLegal }: Props) {
  // Состояние для анимации копирования почты
  const [copied, setCopied] = useState(false);

  // Обработка клика по почте
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('support@mathlabpvp.org');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.location.href = 'mailto:support@mathlabpvp.org';
  };

  // Обработка кнопки "Поделиться" (Маркетинг)
  const handleShare = async () => {
    const shareData = {
      title: 'MathLab PvP',
      text: 'Го пвп по математике? Кто проиграет - тот платит за колу! 🥤🤓', 
      url: 'https://mathlabpvp.org',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText('https://mathlabpvp.org');
        alert('Ссылка скопирована! Отправь её в чат класса.');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center text-white font-sans selection:bg-cyan-500/30">
      
      {/* === ФОН === */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Squares 
          speed={0.3} 
          squareSize={50}
          direction='diagonal'
          borderColor='#334155'
          hoverFillColor='#22d3ee'
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 z-0 pointer-events-none" />

      {/* === КОНТЕНТ === */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center w-full flex flex-col min-h-screen justify-center">
        
        <div className="flex-1 flex flex-col justify-center pt-20">
          
          {/* БЕЙДЖИК ВЕРСИИ */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/30 mb-8 animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-md mx-auto">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-bold tracking-widest uppercase">MathLab PvP v1.0</span>
          </div>

          {/* ЗАГОЛОВОК */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 drop-shadow-2xl">
            Подготовка к ЕНТ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">нового поколения</span>
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Тренируйся решать задачи бесплатно или войди, чтобы сразиться с друзьями на PvP-арене.
          </p>

          {/* === КНОПКИ ДЕЙСТВИЯ === */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            
            {/* Кнопка ДЕМО (Доступна всем) */}
            <button 
              onClick={onStartDemo}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-cyan-50 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              <Brain className="w-5 h-5 text-slate-600 group-hover:text-cyan-600 transition-colors" />
              <span>Решать задачи</span>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-1">Без входа</span>
            </button>
            
            {/* Кнопка ВХОД (Для ПВП) */}
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 border border-cyan-400/20"
            >
              <Swords className="w-5 h-5" />
              <span>PvP Битва</span>
              <Lock className="w-4 h-4 text-cyan-200 opacity-70 ml-1" />
            </button>
          </div>

          {/* КНОПКА ПОДЕЛИТЬСЯ */}
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
             <button 
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors border-b border-cyan-400/30 hover:border-cyan-300 pb-0.5 text-sm"
             >
               <Share2 className="w-4 h-4" />
               Позвать одноклассников (Share)
             </button>
          </div>

          {/* === СЕТКА ВОЗМОЖНОСТЕЙ === */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-in fade-in duration-1000 delay-500">
            
            {/* Карточка 1: Обучение (Доступно) */}
            <div 
                onClick={onStartDemo}
                className="group cursor-pointer p-6 bg-slate-800/40 border border-emerald-500/30 rounded-2xl backdrop-blur-md hover:bg-slate-800/60 transition-all hover:border-emerald-500/60 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-500/20 px-3 py-1 rounded-bl-lg text-xs font-bold text-emerald-400 border-l border-b border-emerald-500/20">
                БЕСПЛАТНО
              </div>
              <Brain className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2 text-emerald-100">Тренажер ЕНТ</h3>
              <p className="text-slate-400 text-sm">Решай задачи по темам без ограничений. Просто нажми и начни учиться.</p>
            </div>

            {/* Карточка 2: PvP (Нужен вход) */}
            <div 
                onClick={onLogin}
                className="group cursor-pointer p-6 bg-slate-800/40 border border-cyan-500/30 rounded-2xl backdrop-blur-md hover:bg-slate-800/60 transition-all hover:border-cyan-500/60 relative"
            >
              <div className="absolute top-0 right-0 bg-slate-700/50 px-3 py-1 rounded-bl-lg text-xs font-bold text-cyan-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> ВХОД
              </div>
              <Swords className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2 text-cyan-100">PvP Дуэли</h3>
              <p className="text-slate-400 text-sm">Создай комнату, кинь ссылку другу и узнай, кто из вас гений, а кто гуманитарий.</p>
            </div>

            {/* Карточка 3: Турниры (Нужен вход) */}
            <div 
                onClick={onLogin}
                className="group cursor-pointer p-6 bg-slate-800/40 border border-amber-500/30 rounded-2xl backdrop-blur-md hover:bg-slate-800/60 transition-all hover:border-amber-500/60 relative"
            >
              <div className="absolute top-0 right-0 bg-slate-700/50 px-3 py-1 rounded-bl-lg text-xs font-bold text-amber-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> ВХОД
              </div>
              <Trophy className="w-8 h-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2 text-amber-100">Лига Чемпионов</h3>
              <p className="text-slate-400 text-sm">Участвуй в сезонных турнирах, поднимай рейтинг и получай уникальные скины.</p>
            </div>

          </div>
        </div>

        {/* === ФУТЕР === */}
        <div className="mt-12 mb-6 pt-6 border-t border-slate-800/60 w-full animate-in fade-in delay-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-col md:flex-row items-center gap-4 text-slate-500 text-sm">
              <p>© {new Date().getFullYear()} MathLab PvP</p>
              
              <div className="flex gap-4 text-xs font-medium">
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-cyan-400 transition-colors underline decoration-slate-700 underline-offset-4">
                  Политика
                </button>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-amber-400 transition-colors underline decoration-slate-700 underline-offset-4">
                  Условия
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleEmailClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400 transition-all border border-transparent hover:border-slate-700 text-sm text-slate-400 group"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-emerald-400">Скопировано!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-mono">support@mathlabpvp.org</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}