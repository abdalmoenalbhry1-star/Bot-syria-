import React, { useState, useEffect } from 'react';
import { BotLogo } from './BotLogo.tsx';
import { ShieldCheck, RefreshCw, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { isCaptchaRequired, TWENTY_FOUR_HOURS_MS } from '../utils/rules.ts';
import { AppLanguage } from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';

interface SplashAndCaptchaProps {
  onVerificationComplete: () => void;
  forceShowCaptcha?: boolean;
  language?: AppLanguage;
}

const CAPTCHA_STORAGE_KEY = 'bot_syria_last_captcha_time_v1';

export const SplashAndCaptcha: React.FC<SplashAndCaptchaProps> = ({
  onVerificationComplete,
  forceShowCaptcha = false,
  language = 'ar',
}) => {
  const [phase, setPhase] = useState<'splash' | 'captcha'>('splash');
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [inputVal, setInputVal] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const t = getTranslation(language);
  const isArabic = language === 'ar';

  // Generate a random 4-digit security code
  const generateNewCaptcha = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(randomDigits);
    setInputVal('');
    setHasError(false);
  };

  useEffect(() => {
    generateNewCaptcha();

    // Check if 24h verification is still active
    const lastVerifiedStr = localStorage.getItem(CAPTCHA_STORAGE_KEY);
    const lastVerified = lastVerifiedStr ? Number(lastVerifiedStr) : null;
    const needsCaptcha = forceShowCaptcha || isCaptchaRequired(lastVerified);

    // Keep splash visible for 1.6 seconds for branding experience
    const timer = setTimeout(() => {
      if (needsCaptcha) {
        setPhase('captcha');
      } else {
        onVerificationComplete();
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [forceShowCaptcha]);

  // Handle immediate input verification as user types: "ولما يكتب الحل فورا بيفوت اذا صحيح"
  const handleInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setInputVal(cleaned);
    setHasError(false);

    if (cleaned.length === 4) {
      if (cleaned === captchaCode) {
        setIsSuccess(true);
        try {
          localStorage.setItem(CAPTCHA_STORAGE_KEY, Date.now().toString());
        } catch (e) {
          console.error(e);
        }

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        // Instant access
        setTimeout(() => {
          onVerificationComplete();
        }, 500);
      } else {
        setHasError(true);
      }
    }
  };

  // Phase 1: Splash Screen with Bot Logo
  if (phase === 'splash') {
    return (
      <div className="fixed inset-0 z-50 bg-[#040811] text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500/30">
        {/* Glow ambient background */}
        <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute w-60 h-60 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-90 duration-500">
          {/* Official Bot Logo */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-3xl blur-lg opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
            <div className="relative p-3 bg-[#071322] border-2 border-cyan-400/60 rounded-3xl shadow-[0_0_35px_rgba(6,182,212,0.5)]">
              <BotLogo size={96} />
            </div>
          </div>

          {/* Title */}
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center gap-2 text-3xl font-black tracking-wider">
              <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">BOT</span>
              <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">SYRIA</span>
            </div>
            <span className="text-sm font-semibold text-cyan-200/90 mt-1 tracking-wide">
              {t.slogan}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-400 mt-3 max-w-xs leading-relaxed">
            {isArabic
              ? 'المنصة الأولى المعتمدة للربح بالليرة السورية والسحب الفوري عبر سيريتل كاش وشام كاش'
              : 'The leading platform for Syrian Pound rewards with instant payouts via Syriatel & Sham Cash'}
          </p>

          {/* Animated loading bar */}
          <div className="w-48 h-1.5 bg-[#0b1b2d] rounded-full mt-8 overflow-hidden relative border border-cyan-500/30">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-300 w-full animate-[shimmer_1.5s_infinite] rounded-full" />
          </div>

          <span className="text-[11px] text-cyan-300/80 font-mono mt-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
            <span>{isArabic ? 'جاري تهيئة النظام والأمان...' : 'Initializing system security...'}</span>
          </span>
        </div>
      </div>
    );
  }

  // Phase 2: 24-Hour Captcha Verification
  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#040811]/95 backdrop-blur-md text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30"
    >
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-white">{t.humanVerificationTitle}</h2>
        <span className="text-xs text-cyan-300 font-bold mt-1">
          {t.humanVerificationSubtitle}
        </span>

        <p className="text-[11px] text-slate-300 mt-2 max-w-xs leading-relaxed">
          {t.captchaDesc}
        </p>

        {/* Captcha Box */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-[#030914] border-2 border-cyan-500/40 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Anti-bot noise lines */}
          <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:8px_8px]" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

          {/* Code Digits */}
          <div className="flex items-center justify-center gap-3 select-none py-1">
            {captchaCode.split('').map((digit, i) => (
              <span
                key={i}
                className="text-3xl font-black font-mono tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] inline-block transform"
                style={{
                  transform: `rotate(${((i % 2 === 0 ? 1 : -1) * (i * 3 + 2))}deg)`,
                }}
              >
                {digit}
              </span>
            ))}
          </div>

          {/* Refresh Captcha Button */}
          <button
            type="button"
            onClick={generateNewCaptcha}
            className="mt-2 text-[11px] text-cyan-400/90 hover:text-cyan-200 flex items-center gap-1 font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.refreshCode}</span>
          </button>
        </div>

        {/* Input: Types solution -> instant verification */}
        <div className="w-full mt-4 flex flex-col gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoFocus
            value={inputVal}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t.captchaPlaceholder}
            className={`w-full p-3.5 rounded-2xl bg-[#071322] border-2 text-center text-xl font-mono font-bold tracking-widest focus:outline-none transition-all placeholder:text-slate-500 placeholder:text-xs placeholder:font-sans placeholder:tracking-normal ${
              isSuccess
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30'
                : hasError
                ? 'border-rose-500 text-rose-300 bg-rose-950/30'
                : 'border-cyan-500/50 text-white focus:border-cyan-400'
            }`}
          />

          {/* Live Status indicator */}
          {isSuccess && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.captchaSuccessMsg}</span>
            </div>
          )}

          {hasError && (
            <span className="text-xs text-rose-400 font-bold animate-in fade-in">
              {t.captchaErrorMsg}
            </span>
          )}

          {!isSuccess && !hasError && (
            <span className="text-[11px] text-slate-400">
              {t.captchaInstantNote}
            </span>
          )}
        </div>

        {/* Security protection footer note */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 text-[10px] text-cyan-200/70 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {isArabic
              ? 'هذا الفحص يحمي رصيدك ويضمن تفعيل مكافآت الإحالة الحقيقية فقط.'
              : 'This verification protects your account and ensures authentic referral rewards.'}
          </span>
        </div>
      </div>
    </div>
  );
};
