import { useEffect, useState } from 'react';
import { supabase, Sector } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Brain,
  GitBranch,
  Activity,
  Zap,
  Radio,
  Cpu,
  Box,
  Lock,
  ChevronRight,
  Swords // <--- Добавляем импорт Мечей (или используй Zap, если Swords нет)
} from 'lucide-react';

// Словарь иконок. Добавили 'swords' в конец списка.
const iconMap: Record<string, any> = {
  brain: Brain,
  'git-branch': GitBranch,
  activity: Activity,
  zap: Zap,
  radio: Radio,
  cpu: Cpu,
  box: Box,
  swords: Swords, // <--- ВАЖНО: Связываем строку из базы с компонентом
  // Если иконки Swords нет и будет ошибка, замени Swords на Zap вот так:
  // swords: Zap 
};

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500 to-green-500',
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  orange: 'from-orange-500 to-amber-500',
  red: 'from-red-500 to-rose-500',
  cyan: 'from-cyan-500 to-teal-500',
  pink: 'from-pink-500 to-fuchsia-500',
};

const glowMap: Record<string, string> = {
  emerald: 'shadow-emerald-500/50',
  blue: 'shadow-blue-500/50',
  purple: 'shadow-purple-500/50',
  orange: 'shadow-orange-500/50',
  red: 'shadow-red-500/50',
  cyan: 'shadow-cyan-500/50',
  pink: 'shadow-pink-500/50',
};

type LabMapProps = {
  onSectorSelect: (sector: Sector) => void;
};

export function LabMap({ onSectorSelect }: LabMapProps) {
  const { profile } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    loadSectors();
  }, []);

  async function loadSectors() {
    const { data } = await supabase
      .from('sectors')
      .select('*')
      .neq('id', 99) // <--- СКРЫВАЕМ PvP СЕКТОР С КАРТЫ (он у нас отдельной кнопкой)
      .order('id');

    if (data) {
      setSectors(data);
    }
  }

  const isUnlocked = (sector: Sector) => {
    return (profile?.clearance_level ?? 0) >= sector.required_clearance;
  };

  return (
    <div className="w-full h-full overflow-y-auto p-8 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <div className="px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 font-mono text-sm">
                CLEARANCE LEVEL: {profile?.clearance_level ?? 0}
              </span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Архитектура Научного Центра
          </h1>
          <p className="text-cyan-300/60 text-lg">
            Выберите сектор для начала исследований
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => {
            // Если иконка не найдена, используем Zap как заглушку, чтобы не было краша
            const Icon = iconMap[sector.icon] || Zap;
            
            const unlocked = isUnlocked(sector);
            const gradient = colorMap[sector.color] || 'from-slate-500 to-slate-600';
            const glow = glowMap[sector.color] || 'shadow-slate-500/50';

            return (
              <button
                key={sector.id}
                onClick={() => unlocked && onSectorSelect(sector)}
                disabled={!unlocked}
                className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 ${
                  unlocked
                    ? `bg-slate-800/50 backdrop-blur-sm bord