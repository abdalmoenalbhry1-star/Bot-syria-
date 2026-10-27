import React from 'react';
import { Coins, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import { AppLanguage } from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';

interface StatsGridProps {
  balanceFormatted: string; // e.g. "25K"
  referralsCount: number;
  availableTasksCount: number;
  botStatusText?: string;
  language?: AppLanguage;
  onCardClick?: (type: 'balance' | 'referrals' | 'tasks' | 'status') => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  balanceFormatted,
  referralsCount,
  availableTasksCount,
  botStatusText,
  language = 'ar',
  onCardClick,
}) => {
  const t = getTranslation(language);
  const isArabic = language === 'ar';

  return (
    <div dir="ltr" className="w-full grid grid-cols-4 gap-2 sm:gap-3 select-none">
      {/* Stat 1 (Left): Current Balance (25K) */}
      <div
        onClick={() => onCardClick?.('balance')}
        className="glass-panel-interactive rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer border border-cyan-500/25 relative overflow-hidden"
      >
        <div className="w-9 h-9 rounded-full bg-[#083344] border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] mb-1.5">
          <Coins className="w-4.5 h-4.5" />
        </div>
        <span className="text-base sm:text-lg font-black text-white leading-tight font-mono">
          {balanceFormatted}
        </span>
        <span className="text-[11px] text-cyan-200/80 font-medium leading-none mt-0.5 truncate max-w-full">
          {t.balanceCardTitle}
        </span>
        <span className="text-[10px] text-teal-400 font-bold mt-0.5">{t.syp}</span>
      </div>

      {/* Stat 2: Referrals (0) */}
      <div
        onClick={() => onCardClick?.('referrals')}
        className="glass-panel-interactive rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer border border-purple-500/25 relative overflow-hidden"
      >
        <div className="w-9 h-9 rounded-full bg-[#2e1065] border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)] mb-1.5">
          <Users className="w-4.5 h-4.5" />
        </div>
        <span className="text-base sm:text-lg font-black text-white leading-tight font-mono">
          {referralsCount}
        </span>
        <span className="text-[11px] text-cyan-200/80 font-medium leading-none mt-0.5 truncate max-w-full">
          {t.referralsCardTitle}
        </span>
        <span className="text-[10px] text-purple-400 font-bold mt-0.5">{t.friendCountUnit}</span>
      </div>

      {/* Stat 3: Available Daily Tasks (2) */}
      <div
        onClick={() => onCardClick?.('tasks')}
        className="glass-panel-interactive rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer border border-sky-500/25 relative overflow-hidden"
      >
        <div className="w-9 h-9 rounded-full bg-[#0c4a6e] border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.3)] mb-1.5">
          <ClipboardCheck className="w-4.5 h-4.5" />
        </div>
        <span className="text-base sm:text-lg font-black text-white leading-tight font-mono">
          {availableTasksCount}
        </span>
        <span className="text-[11px] text-cyan-200/80 font-medium leading-none mt-0.5 truncate max-w-full">
          {t.tasksCardTitle}
        </span>
        <span className="text-[10px] text-cyan-400 font-bold mt-0.5">{t.taskCountUnit}</span>
      </div>

      {/* Stat 4 (Right): Bot Status */}
      <div
        onClick={() => onCardClick?.('status')}
        className="glass-panel-interactive rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer border border-emerald-500/25 relative overflow-hidden"
      >
        <div className="w-9 h-9 rounded-full bg-[#064e3b] border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] mb-1.5">
          <TrendingUp className="w-4.5 h-4.5" />
        </div>
        <span className="text-base sm:text-lg font-black text-emerald-400 leading-tight">
          100%
        </span>
        <span className="text-[11px] text-cyan-200/80 font-medium leading-none mt-0.5 truncate max-w-full">
          {t.botStatusCardTitle}
        </span>
        <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
          {botStatusText || t.activeOnline}
        </span>
      </div>
    </div>
  );
};
