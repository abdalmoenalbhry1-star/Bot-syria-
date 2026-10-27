import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, User } from 'lucide-react';
import { UserProfile, AppLanguage } from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';

interface UserProfileBannerProps {
  user: UserProfile;
  onEditProfile?: () => void;
  language?: AppLanguage;
}

export const UserProfileBanner: React.FC<UserProfileBannerProps> = ({
  user,
  onEditProfile,
  language = 'ar',
}) => {
  const [copied, setCopied] = useState(false);
  const t = getTranslation(language);
  const isArabic = language === 'ar';

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      dir="ltr"
      className="w-full glass-panel rounded-2xl p-2.5 px-3 flex items-center justify-between border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden"
    >
      {/* User Info (Avatar + Name + ID) on LEFT */}
      <div className="flex items-center gap-3">
        {/* Glowing Profile Avatar */}
        <div
          onClick={onEditProfile}
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-500 to-sky-400 p-[2px] shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer hover:scale-105 transition-transform shrink-0"
        >
          <div className="w-full h-full rounded-full bg-[#071322] flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-cyan-300" />
            )}
          </div>
        </div>

        {/* Name and ID */}
        <div className="flex flex-col text-left">
          <div dir={isArabic ? 'rtl' : 'ltr'} className="flex items-center gap-1.5 text-right">
            <span className="font-bold text-base text-white tracking-wide">
              {t.welcomeUser} {user.name} 👋
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-cyan-200/90 font-mono tracking-wider font-semibold">
              {t.userId}: {user.id}
            </span>
            <button
              onClick={handleCopyId}
              aria-label={t.copy}
              title={t.copy}
              className="text-cyan-400/80 hover:text-cyan-200 transition-colors p-0.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {copied && <span className="text-[10px] text-emerald-400 font-medium">{t.copied}</span>}
          </div>
        </div>
      </div>

      {/* Online Status Badge on RIGHT */}
      <div className="flex items-center gap-2">
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#092b38]/90 border border-cyan-400/50 text-cyan-300 text-xs font-semibold shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.userOnline}</span>
        </div>
      </div>
    </div>
  );
};
