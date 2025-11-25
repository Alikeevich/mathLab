// src/lib/gameLogic.ts

export type Rank = {
  title: string;
  minLevel: number;
  icon: string; // Название иконки Lucide
  description: string;
  color: string;
};

export const RANKS: Rank[] = [
  { 
    title: "Подопытный", 
    minLevel: 0, 
    icon: "dna", 
    description: "Доступ ограничен. Разрешены только базовые операции.", 
    color: "text-slate-400" 
  },
  { 
    title: "Лаборант", 
    minLevel: 1, 
    icon: "flask-conical", 
    description: "Получен доступ к реактивам класса B.", 
    color: "text-cyan-400" 
  },
  { 
    title: "Младший Научный Сотрудник", 
    minLevel: 3, 
    icon: "microscope", 
    description: "Доверенное лицо. Доступ к сложным вычислениям.", 
    color: "text-blue-400" 
  },
  { 
    title: "Ведущий Инженер", 
    minLevel: 5, 
    icon: "cpu", 
    description: "Полный контроль над системами.", 
    color: "text-purple-400" 
  },
  { 
    title: "Архитектор Реальности", 
    minLevel: 10, 
    icon: "crown", 
    description: "Легендарный статус. Вы видите матрицу.", 
    color: "text-amber-400" 
  }
];

export function getRank(level: number): Rank {
  // Ищем ранг, подходящий под уровень (от большего к меньшему)
  return [...RANKS].reverse().find(r => level >= r.minLevel) || RANKS[0];
}

export function getLevelProgress(totalExperiments: number): number {
  // Допустим, каждый уровень это 10 задач.
  // 24 задачи = 2 уровень, 4 задачи в прогрессе (40%)
  return (totalExperiments % 10) * 10;
}

export function getPvPRank(mmr: number): string {
  if (mmr < 1100) return "Новичок";      // 1000 - база
  if (mmr < 1300) return "Боец";         // Выиграл 4-10 игр
  if (mmr < 1600) return "Гладиатор";    // Серьезный игрок
  if (mmr < 2000) return "Мастер";       // Олимпиадник
  return "Легенда";                      // Монстр
}

export function getPvPColor(mmr: number): string {
  if (mmr < 1100) return "text-slate-400";
  if (mmr < 1300) return "text-green-400";
  if (mmr < 1600) return "text-blue-400";
  if (mmr < 2000) return "text-purple-400";
  return "text-amber-400";
}