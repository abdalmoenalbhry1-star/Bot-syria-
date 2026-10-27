import React, { useState } from 'react';
import { UserProfile, ReferralUser, AppLanguage } from '../types/index.ts';
import {
  Users,
  Copy,
  Check,
  Send,
  ArrowRight,
  Trophy,
  Share2,
  Medal,
  Award,
  Crown,
  Sparkles,
} from 'lucide-react';
import { getTranslation } from '../utils/translations.ts';

interface ReferralsViewProps {
  user: UserProfile;
  referrals: ReferralUser[];
  referralReward: number; // Dynamically passed from systemConfig.referralReward!
  language?: AppLanguage;
  onBack: () => void;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({
  user,
  referrals,
  referralReward,
  language = 'ar',
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const t = getTranslation(language);
  const isArabic = language === 'ar';
  const referralLink = `https://t.me/BotSyria_bot?start=${user.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      isArabic
        ? `اشترك الآن في بوت سوريا واربح ${referralReward.toLocaleString('en-US')} ل.س وسحب فوري عبر سيريتل كاش وشام كاش!\nرابط الانضمام الخاص بي:`
        : `Join Bot Syria now and earn ${referralReward.toLocaleString('en-US')} SYP with instant payout via Syriatel & Sham Cash!\nMy invite link:`
    );
    const url = encodeURIComponent(referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      isArabic
        ? `مرحباً! سجّل في بوت سوريا الرسمي للربح بالليرة السورية واحصل على مكافأة ${referralReward.toLocaleString('en-US')} ل.س مع سحب فوري عبر سيريتل كاش أو شام كاش عبر رابطي الخاص:\n${referralLink}`
        : `Hello! Register on Bot Syria to earn Syrian Pounds with instant payout via Syriatel or Sham Cash using my referral link:\n${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  // Build Top 10 Referrals Leaderboard STRICTLY from real data with zero fake items as requested
  // If the user has made referrals, they appear in the leaderboard
  const realLeaderboardEntries: Array<{
    rank: number;
    name: string;
    id: string;
    count: number;
    earnings: number;
    isCurrentUser: boolean;
  }> = [];

  const effectiveUserCount = user.referralsCount || referrals.length;
  if (effectiveUserCount > 0) {
    realLeaderboardEntries.push({
      rank: 1,
      name: user.name,
      id: user.id,
      count: effectiveUserCount,
      earnings: effectiveUserCount * referralReward,
      isCurrentUser: true,
    });
  }

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full flex flex-col gap-4 pb-24 text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold transition-colors"
        >
          {isArabic ? <ArrowRight className="w-4 h-4" /> : null}
          <span>{t.backToHome}</span>
          {!isArabic ? <ArrowRight className="w-4 h-4 rotate-180" /> : null}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white">{t.referralsTitle}</span>
          <Users className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* Hero Referral Promo Card with DYNAMIC VALUE from Admin */}
      <div className="glass-panel rounded-3xl p-5 border border-purple-500/40 relative overflow-hidden bg-gradient-to-br from-[#241042] via-[#140b2b] to-[#07091a]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.referralBonusPerInvite}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-white font-mono">
                +{referralReward.toLocaleString('en-US')}
              </span>
              <span className="text-xl font-extrabold text-purple-400">{t.syp}</span>
            </div>
            <p className="text-xs text-purple-200/90 mt-1 max-w-[250px] leading-relaxed">
              {t.referralDescription}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        {/* 3 Stats Overview (Reflecting Dynamic Rate & Real Counts) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-purple-500/20 text-center">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
            <span className="text-[11px] text-slate-400 block">{t.totalInvited}</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono">
              {effectiveUserCount}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
            <span className="text-[11px] text-slate-400 block">{t.totalReferralEarnings}</span>
            <span className="text-sm font-black text-purple-300 mt-0.5 block font-mono">
              {(effectiveUserCount * referralReward).toLocaleString('en-US')} {t.syp}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
            <span className="text-[11px] text-slate-400 block">{t.commissionRate}</span>
            <span className="text-xs font-black text-emerald-400 mt-0.5 block font-mono">
              100%
            </span>
          </div>
        </div>
      </div>

      {/* Share Your Link Section */}
      <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 flex flex-col gap-3 text-right">
        <label className="text-xs font-bold text-slate-200">{t.yourReferralLink}</label>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.copied : t.copy}</span>
          </button>
          <div className="flex-1 p-2.5 rounded-xl bg-[#061222] border border-cyan-500/30 font-mono text-xs text-cyan-300 truncate text-left select-all">
            {referralLink}
          </div>
        </div>

        {/* Action Share Buttons: Telegram and WhatsApp */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={handleShareTelegram}
            className="py-2.5 px-3 rounded-xl bg-[#0088cc] hover:bg-[#0099e6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,136,204,0.4)] transition-all active:scale-95"
          >
            <Send className="w-4 h-4 -rotate-45" />
            <span>{t.shareViaTelegram}</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(37,211,102,0.4)] transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareViaWhatsApp}</span>
          </button>
        </div>
      </div>

      {/* Top 10 Referrals Leaderboard Table (جدول أعلى عشر أشخاص عملو إحالات - بدون وهمي) */}
      <div className="flex flex-col gap-2.5 mt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.top10Subtitle}</span>
          </span>
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
            <span>{t.top10LeaderboardTitle}</span>
            <Medal className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {realLeaderboardEntries.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center text-slate-400 text-xs border border-purple-500/20 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1">
              <Award className="w-6 h-6" />
            </div>
            <p className="max-w-xs leading-relaxed text-slate-300">
              {t.noLeaderboardYet}
            </p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-purple-500/30 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#0b162c] text-purple-300 font-bold border-b border-purple-500/20 text-[11px]">
                    <th className="py-3 px-3 text-center w-12">{t.rankHeader}</th>
                    <th className="py-3 px-3">{t.userHeader}</th>
                    <th className="py-3 px-3 text-center">{t.invitesHeader}</th>
                    <th className="py-3 px-3 text-left">{t.earningsHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {realLeaderboardEntries.slice(0, 10).map((entry) => {
                    const isFirst = entry.rank === 1;
                    const isSecond = entry.rank === 2;
                    const isThird = entry.rank === 3;

                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          entry.isCurrentUser
                            ? 'bg-purple-950/40 font-bold text-white'
                            : 'hover:bg-[#071324] text-slate-200'
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3 px-3 text-center">
                          {isFirst ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                              1
                            </span>
                          ) : isSecond ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs">
                              2
                            </span>
                          ) : isThird ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs">
                              3
                            </span>
                          ) : (
                            <span className="font-mono text-slate-400 font-bold">
                              {entry.rank}
                            </span>
                          )}
                        </td>

                        {/* User Name & ID */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/50 text-purple-200 text-[10px]">
                                {t.youBadge}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({entry.id})
                            </span>
                          </div>
                        </td>

                        {/* Invites Count */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-purple-300">
                          {entry.count}
                        </td>

                        {/* Total Earnings */}
                        <td className="py-3 px-3 text-left font-mono font-black text-emerald-400">
                          +{entry.earnings.toLocaleString('en-US')} {t.syp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
