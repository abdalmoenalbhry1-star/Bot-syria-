import React from 'react';
import { NotificationItem, AppLanguage } from '../types/index.ts';
import { Bell, X, CheckCheck, Gift, Wallet, Sparkles, Info } from 'lucide-react';
import { getTranslation } from '../utils/translations.ts';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  language?: AppLanguage;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  language = 'ar',
}) => {
  const t = getTranslation(language);
  const isArabic = language === 'ar';

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'bonus':
        return <Gift className="w-4 h-4 text-rose-400" />;
      case 'payout':
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'task':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md glass-panel rounded-3xl p-5 border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col gap-4 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-white">{t.notifications}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-100 font-bold"
          >
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            <span>{t.markAllRead}</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {unreadCount} {isArabic ? 'غير مقروءة' : 'unread'}
          </span>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all text-right flex items-start gap-3 ${
                  item.read
                    ? 'bg-[#061222]/80 border-slate-800 text-slate-300'
                    : 'bg-[#092038] border-cyan-500/40 text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  </div>
                  <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
