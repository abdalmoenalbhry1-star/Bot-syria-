import React from 'react';
import { Home, CheckSquare, Users, Wallet, Headphones, KeyRound } from 'lucide-react';
import { TabType, AppLanguage } from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tasksBadgeCount?: number;
  language?: AppLanguage;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  tasksBadgeCount = 0,
  language = 'ar',
}) => {
  const t = getTranslation(language);

  const tabs = [
    { id: 'home' as TabType, label: t.navHome, icon: Home },
    { id: 'tasks' as TabType, label: t.navTasks, icon: CheckSquare, badge: tasksBadgeCount },
    { id: 'referrals' as TabType, label: t.navReferrals, icon: Users },
    { id: 'withdraw' as TabType, label: t.navWithdraw, icon: Wallet },
    { id: 'support' as TabType, label: t.navSupport, icon: Headphones },
    { id: 'promocode' as TabType, label: t.navPromo, icon: KeyRound },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none max-w-lg mx-auto">
      <nav
        dir="ltr"
        aria-label="Bottom Navigation"
        className="pointer-events-auto w-full rounded-3xl bg-[#081528]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] p-2 flex items-center justify-around"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 min-w-[50px] transition-all duration-200 select-none ${
                isActive ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''
                  }`}
                />

                {/* Badge (e.g. for available tasks) */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-cyan-500 text-[#050b14] text-[10px] font-black flex items-center justify-center ring-2 ring-[#081528]">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                  isActive ? 'text-cyan-300 font-extrabold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5 shadow-[0_0_6px_rgba(6,182,212,1)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
