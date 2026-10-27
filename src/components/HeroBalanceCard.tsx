import React from 'react';
import { Wallet, ListTodo, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { SyrianCoinBadge } from './SyrianCoinBadge.tsx';
import { AppLanguage } from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';

interface HeroBalanceCardProps {
  balance: number;
  todayEarnings: number;
  onGoToTasks: () => void;
  onGoToWithdraw: () => void;
  language?: AppLanguage;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  balance,
  todayEarnings,
  onGoToTasks,
  onGoToWithdraw,
  language = 'ar',
}) => {
  const t = getTranslation(language);
  const isArabic = language === 'ar';

  return (
    <div
      dir="ltr"
      className="w-full relative rounded-3xl p-5 border border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.22)] overflow-hidden bg-gradient-to-br from-[#0c2447]/90 via-[#07172e]/95 to-[#050f20]/95 backdrop-blur-xl"
    >
      {/* Ambient background light bursts */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section: Wallet Icon + Balance Info on LEFT | Syrian Coin Badge on RIGHT */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        {/* Left: Wallet icon + Balance */}
        <div className="flex items-start gap-3.5">
          {/* Glowing Wallet Square Icon */}
          <div className="w-13 h-13 rounded-2xl bg-[#093554]/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] mt-1 shrink-0">
            <Wallet className="w-7 h-7" />
          </div>

          {/* Balance Text */}
          <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col text-right">
            <span className="text-cyan-200/80 text-xs font-semibold">{t.currentBalance}</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {balance.toLocaleString('en-US')}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                {t.syp}
              </span>
            </div>

            {/* Today's gain pill */}
            <div className="flex items-center gap-1 mt-1 text-emerald-400 font-bold text-xs">
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isArabic
                  ? `اليوم +${todayEarnings.toLocaleString('en-US')} ل.س`
                  : `Today +${todayEarnings.toLocaleString('en-US')} SYP`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Syrian 3D Flag Coin Badge */}
        <div className="shrink-0 flex items-center justify-center">
          <SyrianCoinBadge size={92} />
        </div>
      </div>

      {/* Bottom Action Buttons:
          LEFT: "سحب الأرباح" (Green/Teal)
          RIGHT: "الذهاب إلى المهام" (Blue/Cyan)
      */}
      <div className="grid grid-cols-2 gap-3 mt-5 relative z-10">
        {/* Left: Withdraw Button (Teal / Emerald gradient) */}
        <button
          onClick={onGoToWithdraw}
          dir={isArabic ? 'rtl' : 'ltr'}
          className="group relative flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gradient-to-r from-[#0d9488] to-[#059669] hover:from-[#14b8a6] hover:to-[#10b981] text-white font-bold text-sm shadow-[0_0_20px_rgba(13,148,136,0.4)] border border-teal-300/40 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span>{t.withdrawAction}</span>
          </div>
          {isArabic ? (
            <ChevronLeft className="w-4 h-4 text-white/80 group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
          )}
        </button>

        {/* Right: Go to Tasks Button (Electric Cyan / Royal Blue gradient) */}
        <button
          onClick={onGoToTasks}
          dir={isArabic ? 'rtl' : 'ltr'}
          className="group relative flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#00b4d8] hover:from-[#0369a1] hover:to-[#0096c7] text-white font-bold text-sm shadow-[0_0_20px_rgba(2,132,199,0.4)] border border-cyan-300/40 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-white" />
            </div>
            <span>{t.navTasks}</span>
          </div>
          {isArabic ? (
            <ChevronLeft className="w-4 h-4 text-white/80 group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};
