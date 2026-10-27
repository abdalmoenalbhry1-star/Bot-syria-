import React from 'react';
import { BotLogo } from './BotLogo.tsx';
import { Bell, MoreVertical, ShieldAlert } from 'lucide-react';
import { AppLanguage } from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenMenu: () => void; // 3-Dots merged with Settings
  onOpenSecurity: () => void;
  unreadCount?: number;
  language?: AppLanguage;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenMenu,
  onOpenSecurity,
  unreadCount = 2,
  language = 'ar',
}) => {
  const t = getTranslation(language);
  const isArabic = language === 'ar';

  return (
    <header dir="ltr" className="w-full flex items-center justify-between py-2 px-1 select-none">
      {/* Brand & Falcon Emblem on Left */}
      <div className="flex items-center gap-3">
        <BotLogo size={52} />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 tracking-wider font-extrabold text-2xl">
            <span className="text-white">BOT</span>
            <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
              SYRIA
            </span>
          </div>
          <span
            dir={isArabic ? 'rtl' : 'ltr'}
            className="text-[11px] font-semibold text-cyan-200/90 tracking-wide -mt-1 text-right"
          >
            {t.slogan}
          </span>
        </div>
      </div>

      {/* Action Buttons Group on Right */}
      <div className="flex items-center gap-1.5">
        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          aria-label={t.notifications}
          title={t.notifications}
          className="relative w-10 h-10 rounded-2xl bg-[#0b192c]/90 border border-cyan-500/30 flex items-center justify-center text-cyan-300 hover:border-cyan-400 hover:text-white transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-95"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#0b192c] animate-pulse" />
          )}
        </button>

        {/* 3-dots Menu merged with Settings (تغيير اللغة، شرح البوت، تغيير الإضاءة) */}
        <button
          onClick={onOpenMenu}
          aria-label={t.settingsAndOptions}
          className="w-10 h-10 rounded-2xl bg-[#0b192c]/90 border border-cyan-500/30 flex items-center justify-center text-cyan-300 hover:border-cyan-400 hover:text-white transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-95"
          title={t.settingsAndOptions}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Security Shield */}
        <button
          onClick={onOpenSecurity}
          aria-label={t.securityShield}
          className="w-10 h-10 rounded-2xl bg-[#1b1912]/90 border border-amber-500/50 flex items-center justify-center text-amber-400 hover:border-amber-400 hover:text-amber-200 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] active:scale-95"
          title={t.securityShield}
        >
          <ShieldAlert className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
