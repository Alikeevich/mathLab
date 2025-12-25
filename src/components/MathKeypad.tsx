import { Delete } from 'lucide-react';

type MathKeypadProps = {
  onKeyPress: (symbol: string) => void;
  onBackspace: () => void;
};

export function MathKeypad({ onKeyPress, onBackspace }: MathKeypadProps) {
  const keys = [
    // 1. ТРИГОНОМЕТРИЯ
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
    { label: 'cot', value: 'cot(' },
    
    // 2. СЛОЖНЫЕ ФУНКЦИИ
    // Вставляет log_ чтобы пользователь дописал основание, например log_2(8)
    { label: 'logₐ', value: 'log_' }, 
    { label: '√', value: '√' },
    { label: '^', value: '^' },
    { label: 'π', value: 'π' },

    // 3. СПЕЦСИМВОЛЫ (Мои предложения)
    { label: '°', value: '°' },  // Градусы
    { label: '±', value: '±' },  // Плюс-минус (для уравнений)
    { label: '∞', value: '∞' },  // Бесконечность (для интервалов)
    { label: '∅', value: '∅' },  // Пустое множество (нет решений)
  ];

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
      {keys.map((key) => (
        <button
          key={key.label}
          type="button"
          onClick={() => onKeyPress(key.value)}
          className="bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500/50 text-cyan-300 font-mono text-base md:text-lg font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-slate-900/20"
        >
          {key.label}
        </button>
      ))}
      
      {/* Кнопка удаления (занимает место как обычная кнопка, но красная) */}
      <button
        type="button"
        onClick={onBackspace}
        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-lg"
      >
        <Delete className="w-6 h-6" />
      </button>
    </div>
  );
}