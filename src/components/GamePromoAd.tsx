import React, { useState, useEffect } from 'react';
import { Play, Zap, Brain, Trophy, Shield, ArrowRight, Sparkles, X, Target } from 'lucide-react';

export function GamePromoAd({ onClose }: { onClose?: () => void }) {
  const[step, setStep] = useState<'intro' | 'playing' | 'result'>('intro');
  const[timeLeft, setTimeLeft] = useState(10);
  const [isHovered, setIsHovered] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  // Мини-игра: Задача
  const mathProblem = { q: "7 × 8 + 14", a: 70, options: [60, 70, 84] };

  // Таймер для мини-игры
  useEffect(() => {
    let timer: any;
    if (step === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && step === 'playing') {
      handleAnswer(0); // Время вышло = проигрыш
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleStart = () => {
    setStep('playing');
    setTimeLeft(10);
  };

  const handleAnswer = (answer: number) => {
    if (answer === mathProblem.a) {
      setResult('win');
    } else {
      setResult('lose');
    }
    setStep('result');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-hidden font-sans">
      
      {/* Анимированный фон (Плавающие элементы) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-red-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        {/* Математические символы на фоне */}
        <div className="absolute top-1/4 left-10 text-cyan-500/20 text-6xl font-black rotate-12 animate-[bounce_4s_infinite]">+</div>
        <div className="absolute bottom-1/4 right-20 text-red-500/20 text-8xl font-black -rotate-12 animate-[bounce_5s_infinite] delay-700">÷</div>
        <div className="absolute top-1/2 right-1/4 text-emerald-500/20 text-5xl font-black rotate-45 animate-[bounce_6s_infinite] delay-300">×</div>
      </div>

      <div className="relative z-10 w-full max-w-4xl p-4 md:p-8 flex items-center justify-center h-full">
        
        {/* Закрыть рекламу */}
        {onClose && (
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all border border-slate-700 backdrop-blur-sm z-50">
            <X className="w-6 h-6" />
          </button>
        )}

        {/* === ШАГ 1: ИНТРО (Крючок) === */}
        <div className={`transition-all duration-700 ease-in-out absolute w-full max-w-lg ${step === 'intro' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-center transform transition-transform duration-500 hover:scale-[1.02]">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-4 h-4" />
              Новый уровень обучения
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight mb-4 leading-tight">
              ДУМАЙ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">БЫСТРЕЕ.</span><br/>
              ПОБЕЖДАЙ <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">РЕАЛЬНЫХ</span> ИГРОКОВ.
            </h1>
            
            <p className="text-slate-400 mb-8 text-lg">
              Прокачай свой мозг в динамичных PvP дуэлях. Решай задачи, повышай MMR, забирай титулы.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <Brain className="w-6 h-6 text-cyan-400 mb-2" />
                <span className="text-xs text-slate-300 font-bold uppercase">Нейро-рост</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <Zap className="w-6 h-6 text-red-400 mb-2" />
                <span className="text-xs text-slate-300 font-bold uppercase">PvP Арена</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <Trophy className="w-6 h-6 text-amber-400 mb-2" />
                <span className="text-xs text-slate-300 font-bold uppercase">Рейтинг</span>
              </div>
            </div>

            <button 
              onClick={handleStart}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-black text-white text-xl overflow-hidden group shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] active:scale-95"
            >
              <div className={`absolute inset-0 bg-white/20 transform transition-transform duration-500 ${isHovered ? 'translate-x-0' : '-translate-x-full'}`} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Сыграть пробный матч <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* === ШАГ 2: МИНИ-ИГРА (Интерактив) === */}
        <div className={`transition-all duration-700 ease-in-out absolute w-full max-w-lg ${step === 'playing' ? 'opacity-100 translate-y-0 scale-100 delay-300' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Хедер "Игры" */}
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                  <span className="text-cyan-400 font-bold">ТЫ</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Гость</div>
                  <div className="text-cyan-400 text-xs text-left">700 MP</div>
                </div>
              </div>
              
              <div className="text-2xl font-black text-white italic">VS</div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-white font-bold text-sm">AI Boss</div>
                  <div className="text-red-400 text-xs text-right">1500 MP</div>
                </div>
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </div>

            {/* Игровое поле */}
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 ${timeLeft < 4 ? 'text-red-500 border-red-500 animate-pulse' : 'text-cyan-400 border-cyan-500'}`}>
                  {timeLeft}
                </div>
              </div>

              <div className="text-slate-400 text-sm mb-2 uppercase tracking-widest font-bold">Реши быстрее соперника</div>
              <div className="text-5xl font-black text-white mb-10 tracking-wider bg-slate-800/50 py-6 rounded-2xl border border-slate-700 shadow-inner">
                {mathProblem.q} = ?
              </div>

              <div className="grid grid-cols-3 gap-4">
                {mathProblem.options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="py-4 bg-slate-800 hover:bg-cyan-600 text-white text-2xl font-bold rounded-xl transition-all border border-slate-700 hover:border-cyan-400 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar (таймер) */}
            <div className="h-2 bg-slate-800 w-full">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 4 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* === ШАГ 3: РЕЗУЛЬТАТ (Call to Action) === */}
        <div className={`transition-all duration-700 ease-in-out absolute w-full max-w-lg ${step === 'result' ? 'opacity-100 translate-y-0 scale-100 delay-300' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
           <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl p-10 text-center shadow-2xl">
              
              {result === 'win' ? (
                <>
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/50 animate-[bounce_2s_infinite]">
                    <Trophy className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h2 className="text-4xl font-black text-white italic mb-2">ГЕНИАЛЬНО!</h2>
                  <p className="text-emerald-400 font-bold text-xl mb-6">+25 Рейтинга</p>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    Твоя скорость впечатляет. Ты готов бросить вызов реальным игрокам и войти в глобальный Топ-100.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                    <Target className="w-12 h-12 text-red-400" />
                  </div>
                  <h2 className="text-4xl font-black text-white italic mb-2">ПОРАЖЕНИЕ</h2>
                  <p className="text-red-400 font-bold text-xl mb-6">AI оказался быстрее</p>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    Ничего страшного! Зарегистрируйся, пройди тренировку в Реакторе и вернись на Арену за реваншем.
                  </p>
                </>
              )}

              <button 
                onClick={() => {
                  if(onClose) onClose(); // Либо тут можно сделать redirect на /register
                  window.location.reload(); 
                }}
                className={`w-full py-4 rounded-2xl font-black text-white text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${result === 'win' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30' : 'bg-red-600 hover:bg-red-500 shadow-red-500/30'}`}
              >
                <Play className="w-5 h-5 fill-current" />
                НАЧАТЬ ПОЛНУЮ ИГРУ
              </button>
              
              <button onClick={() => setStep('intro')} className="mt-4 text-slate-500 text-sm hover:text-white transition-colors">
                Попробовать еще раз
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}