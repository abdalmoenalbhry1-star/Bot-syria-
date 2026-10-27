import React, { useState } from 'react';
import { KeyRound, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Gift, Timer } from 'lucide-react';
import { PromoCodeItem, AppLanguage } from '../types/index.ts';
import { validateDynamicPromoCode, isExpiredAfter6Hours, getRemainingTimeString } from '../utils/rules.ts';
import { getTranslation } from '../utils/translations.ts';
import confetti from 'canvas-confetti';

interface RedeemedRecord {
  code: string;
  reward: number;
  redeemedAt: number;
}

interface PromoCodeModalProps {
  promoCodes: PromoCodeItem[];
  redeemedRecords: RedeemedRecord[];
  onRedeemSuccess: (reward: number, codeKey: string) => void;
  onBack: () => void;
  language?: AppLanguage;
}

export const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  promoCodes,
  redeemedRecords,
  onRedeemSuccess,
  onBack,
  language = 'ar',
}) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const t = getTranslation(language);
  const isArabic = language === 'ar';

  // Active redeemed records within 6 hours (after 6 hours they disappear!)
  const activeRedeemed = redeemedRecords.filter((r) => !isExpiredAfter6Hours(r.redeemedAt));
  const redeemedCodeKeys = activeRedeemed.map((r) => r.code.toUpperCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateDynamicPromoCode(code, promoCodes, redeemedCodeKeys);

    if (result.valid && result.promoItem) {
      setMessage({ text: result.message, type: 'success' });
      onRedeemSuccess(result.reward, result.promoItem.code);
      setCode('');
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.5 },
      });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

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
          <span className="text-base font-extrabold text-white">{t.promoTitle}</span>
          <KeyRound className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Hero Promo Box */}
      <div className="glass-panel rounded-3xl p-5 border border-amber-500/40 relative overflow-hidden bg-gradient-to-br from-[#261605] via-[#140e06] to-[#0a0703]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-right">
            <span className="text-xs text-amber-300 font-bold">{t.promoTitle}</span>
            <span className="text-lg font-black text-white mt-0.5">
              {isArabic ? 'شحن رصيد إضافي فوري' : 'Instant Additional Credit'}
            </span>
            <p className="text-xs text-amber-200/80 mt-1 max-w-[240px] leading-relaxed">
              {t.promoSubtitle}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Gift className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Input Code Form */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-4 border border-amber-500/30 flex flex-col gap-3 text-right"
      >
        <label className="text-xs font-bold text-slate-200">
          {isArabic ? 'أدخل كود الهدية (البرومو كود):' : 'Enter Promo Code:'}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setMessage(null);
            }}
            placeholder={t.inputPromoPlaceholder}
            className="flex-1 p-3.5 rounded-xl bg-[#09101b] border border-amber-500/40 text-white font-mono text-center tracking-widest text-sm font-bold focus:outline-none focus:border-amber-400 uppercase placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal placeholder:text-xs"
          />
          <button
            type="submit"
            className="py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isArabic ? 'تفعيل' : 'Redeem'}</span>
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200 ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="text-[11px] text-amber-200/70 flex items-center gap-1.5 pt-1 border-t border-amber-500/20">
          <Timer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{t.promoDisappearNotice}</span>
        </div>
      </form>

      {/* Activated Promo Codes Record (Disappears 6 hours after redemption) */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300 text-right px-1">
          {isArabic ? 'الأكواد المفعلة في حسابك مؤخراً' : 'Recently Claimed Codes'} ({activeRedeemed.length})
        </span>

        {activeRedeemed.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center text-slate-400 text-xs">
            {isArabic ? 'لم تقم بتفعيل أي كود خلال الساعات الـ 6 الماضية.' : 'No codes claimed in the last 6 hours.'}
          </div>
        ) : (
          activeRedeemed.map((record, idx) => (
            <div
              key={`${record.code}-${idx}`}
              className="glass-panel rounded-2xl p-3.5 border border-amber-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-mono font-bold text-white text-xs">{record.code}</span>
                  <span className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                    {getRemainingTimeString(record.redeemedAt)}
                  </span>
                </div>
              </div>

              <span className="text-xs font-black text-amber-400 font-mono">
                +{record.reward.toLocaleString('en-US')} {t.syp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
