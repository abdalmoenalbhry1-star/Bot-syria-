import React from 'react';
import {
  ClipboardCheck,
  Users,
  Wallet,
  KeyRound,
  Headphones,
  ChevronRight,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { TabType, AppLanguage } from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';

interface EarningActionListProps {
  availableTasksCount: number;
  onSelectAction: (tab: TabType) => void;
  onViewAll?: () => void;
  language?: AppLanguage;
}

export const EarningActionList: React.FC<EarningActionListProps> = ({
  availableTasksCount,
  onSelectAction,
  onViewAll,
  language = 'ar',
}) => {
  const t = getTranslation(language);
  const isArabic = language === 'ar';

  return (
    <div className="w-full flex flex-col gap-2.5 mt-2">
      {/* Section Header */}
      <div dir="ltr" className="flex items-center justify-between px-1 mb-0.5">
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-cyan-300 hover:text-white text-xs font-semibold transition-colors"
        >
          {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : null}
          <span>{t.viewAll}</span>
          {!isArabic ? <ChevronRight className="w-3.5 h-3.5" /> : null}
        </button>

        <div className="flex items-center gap-1.5 text-white font-bold text-base">
          <span>{t.quickActionsTitle}</span>
          <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
        </div>
      </div>

      {/* Item 1: Daily Tasks */}
      <div
        dir="ltr"
        onClick={() => onSelectAction('tasks')}
        className="glass-panel-interactive rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-cyan-500/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#0ea5e9] flex items-center justify-center text-white shadow-[0_0_12px_rgba(14,165,233,0.4)] shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>

          <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col text-right">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">{t.actionDailyTasks}</span>
              {availableTasksCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-[10px] text-cyan-300 font-semibold font-mono">
                  {availableTasksCount} {t.taskCountUnit}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-300/80 mt-0.5">
              {t.actionDailyTasksDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-cyan-400/80 group-hover:text-cyan-300">
          {isArabic ? (
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          ) : (
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          )}
        </div>
      </div>

      {/* Item 2: Referrals */}
      <div
        dir="ltr"
        onClick={() => onSelectAction('referrals')}
        className="glass-panel-interactive rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-purple-500/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] shrink-0">
            <Users className="w-6 h-6" />
          </div>

          <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col text-right">
            <span className="font-bold text-sm sm:text-base text-white">{t.actionReferrals}</span>
            <span className="text-xs text-slate-300/80 mt-0.5">
              {t.actionReferralsDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-purple-400/80 group-hover:text-purple-300">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Item 3: Withdraw Earnings */}
      <div
        dir="ltr"
        onClick={() => onSelectAction('withdraw')}
        className="glass-panel-interactive rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-amber-500/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0d9488] to-[#10b981] flex items-center justify-center text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>

          <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col text-right">
            <span className="font-bold text-sm sm:text-base text-white">{t.actionWithdraw}</span>
            <span className="text-xs text-slate-300/80 mt-0.5">
              {t.actionWithdrawDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-emerald-400/80 group-hover:text-emerald-300">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Item 4: Promo Code */}
      <div
        dir="ltr"
        onClick={() => onSelectAction('promocode')}
        className="glass-panel-interactive rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-rose-500/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_12px_rgba(244,63,94,0.4)] shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>

          <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col text-right">
            <span className="font-bold text-sm sm:text-base text-white">{t.actionPromo}</span>
            <span className="text-xs text-slate-300/80 mt-0.5">
              {t.actionPromoDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-rose-400/80 group-hover:text-rose-300">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Item 5: Technical Support */}
      <div
        dir="ltr"
        onClick={() => onSelectAction('support')}
        className="glass-panel-interactive rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-cyan-500/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#06b6d4] flex items-center justify-center text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] shrink-0">
            <Headphones className="w-6 h-6" />
          </div>

          <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col text-right">
            <span className="font-bold text-sm sm:text-base text-white">{t.actionSupport}</span>
            <span className="text-xs text-slate-300/80 mt-0.5">
              {t.actionSupportDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-cyan-400/80 group-hover:text-cyan-300">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
