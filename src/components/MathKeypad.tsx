import { Delete } from 'lucide-react';

type MathKeypadProps = {
  onKeyPress: (symbol: string) => void;
  onBackspace: () => void;
};

export function MathKeypad({ onKeyPress, onBackspace }: MathKeypadProps) {
  const keys = [
    { label: '√', value: '√' },
    { label: '^', value: '^' },
    { label: '°', value: '°' },
    { label: 'π', value: 'π' },
    { label: '!', value: '!' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '.', value: '.' },
    { label: '/', value: '/' },
    { label: '-', value: '-' }, // Минус (важно для отрицательных чисел)
  ];

  return (
    <div className="grid grid-cols-6 gap-2 mb-4">
      {keys.map((key) => (
        <button
          key={key.label}
          type="button" // Важно, чтобы не отправлялась форма
          onClick={() => onKeyPress(key.value)}
          className="bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500/50 text-cyan-300 font-mono text-lg font-bold py-2 rounded-lg transition-all active:scale-95"
        >
          {key.label}
        </button>
      ))}
      {/* Кнопка стирания */}
      <button
        type="button"
        onClick={onBackspace}
        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center rounded-lg transition-all active:scale-95 col-span-2"
      >
        <Delete className="w-5 h-5" />
      </button>
    </div>
  );
}