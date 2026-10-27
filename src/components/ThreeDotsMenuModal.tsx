import React, { useState } from 'react';
import {
  X,
  Globe,
  Sun,
  Moon,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Wallet,
  Users,
  Tag,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { AppLanguage, AppTheme } from '../types/index.ts';

interface ThreeDotsMenuModalProps {
  language: AppLanguage;
  theme: AppTheme;
  onLanguageChange: (lang: AppLanguage) => void;
  onThemeChange: (theme: AppTheme) => void;
  onClose: () => void;
}

export const ThreeDotsMenuModal: React.FC<ThreeDotsMenuModalProps> = ({
  language,
  theme,
  onLanguageChange,
  onThemeChange,
  onClose,
}) => {
  // Guide accordion active section
  const [openGuideKey, setOpenGuideKey] = useState<string | null>('tasks');

  const toggleGuide = (key: string) => {
    setOpenGuideKey(openGuideKey === key ? null : key);
  };

  const isArabic = language === 'ar';

  const guideItems = [
    {
      id: 'tasks',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      title: isArabic ? '1. طريقة كسب الليرات من المهام اليومية' : '1. Earning SYP from Daily Tasks',
      content: isArabic
        ? 'انتقل إلى تبويب "المهام"، اختر أي مهمة متاحة (مثل الاشتراك في قناة تيليغرام أو التفاعل)، نفذ المطلوب وارفع لقطة شاشة كإثبات. يتم تدقيق الإثبات من الإدارة وتضاف الليرات فوراً لرصيدك، وتختفي المهمة المكتملة تلقائياً بعد 6 ساعات.'
        : 'Go to the "Tasks" tab, select an available task (like joining a Telegram channel), complete it, and upload a screenshot proof. The admin reviews and approves your proof, adding SYP directly to your balance.',
    },
    {
      id: 'withdraw',
      icon: <Wallet className="w-4 h-4 text-emerald-400" />,
      title: isArabic ? '2. السحب الفوري عبر سيريتل كاش وشام كاش' : '2. Instant Cashout via Syriatel & Sham Cash',
      content: isArabic
        ? 'يمكنك سحب أرباحك في أي وقت بمجرد وصولك للحد الأدنى (10,000 ل.س). اختر طريقة الدفع المفضلة لديك: سيريتل كاش أو شام كاش، واكتب المبلغ ورقم حسابك بدقة. التحويل مباشر بدون أي عمولات (0%)، ويختفي طلب السحب تلقائياً بعد 6 ساعات من موافقة الإدارة.'
        : 'Withdraw your balance anytime once you reach the minimum payout. Choose Syriatel Cash or Sham Cash, enter your custom amount and phone/account number. Payouts have 0% fees and auto-expire 6 hours post-approval.',
    },
    {
      id: 'referrals',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      title: isArabic ? '3. نظام الإحالات وحماية الكابتشا ضد الغش' : '3. Referrals & Anti-Cheat Captcha Protection',
      content: isArabic
        ? 'انسخ رابطك الخاص وشاركه عبر تيليغرام أو واتساب. لحماية النظام ومنع الحسابات الوهمية، يشترط اجتياز الصديق المدعو لاختبار الكابتشا البشري اليومي بنجاح حتى تضاف المكافأة لرصيدك فوراً وبشكل نزيه ومضمون.'
        : 'Share your personal referral link via Telegram or WhatsApp. To protect against fake accounts and multi-bot abuse, invited friends must pass the 24-hour Human Captcha verification for rewards to be credited.',
    },
    {
      id: 'promo',
      icon: <Tag className="w-4 h-4 text-amber-400" />,
      title: isArabic ? '4. تفعيل أكواد الهدايا (برومو كود)' : '4. Redeeming Gift Promo Codes',
      content: isArabic
        ? 'تقوم الإدارة بنشر أكواد ترويجية دورية محدودة بعدد مقاعد معين. اكتب الكود واضغط تفعيل للحصول على مكافأة نقدية فورية. كل كود يُفعّل يختفي بعد 6 ساعات لضمان تنظيم العروض.'
        : 'Admin publishes limited-capacity promo codes regularly. Enter the code and redeem for instant SYP cash. Redeemed codes auto-clear after 6 hours.',
    },
    {
      id: 'support',
      icon: <Headphones className="w-4 h-4 text-blue-400" />,
      title: isArabic ? '5. الدعم الفني وحل المشاكل' : '5. Technical Support & Complaint Handling',
      content: isArabic
        ? 'إذا واجهت أي استفسار، أرسل شكواك عبر تبويب الدعم الفني مع رقم هاتفك وصورة توضيحية. يرد فريق الدعم مباشرة أسفل الشكوى، وتختفي الشكوى مع الرد تلقائياً بعد 6 ساعات من الحل.'
        : 'Submit your ticket with phone number and optional screenshot. Support replies directly under your ticket, auto-clearing after 6 hours from reply.',
    },
  ];

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-cyan-500/30"
    >
      <div className="w-full max-w-md glass-panel rounded-3xl p-5 border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.3)] flex flex-col gap-4 text-right max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="font-extrabold text-base text-white">
                {isArabic ? 'خيارات وإعدادات البوت' : 'Bot Options & Settings'}
              </span>
              <span className="text-[11px] text-cyan-300">
                {isArabic ? 'التحكم باللغة، الإضاءة، ودليل الاستخدام' : 'Language, theme and guide'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Language Toggle: Arabic <-> English */}
        <div className="p-3.5 rounded-2xl bg-[#07172b] border border-cyan-500/30 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{isArabic ? 'تغيير اللغة (Language):' : 'Language Switcher:'}</span>
            </div>
            <span className="text-[10px] text-cyan-200/80">
              {isArabic ? 'عربي / English' : 'Arabic / English'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => onLanguageChange('ar')}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                language === 'ar'
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-300'
                  : 'bg-[#091524] text-slate-400 hover:text-white border border-cyan-500/20'
              }`}
            >
              <span>🇸🇾 العربية (العربية)</span>
              {language === 'ar' && <Check className="w-3.5 h-3.5 text-white" />}
            </button>

            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                language === 'en'
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-300'
                  : 'bg-[#091524] text-slate-400 hover:text-white border border-cyan-500/20'
              }`}
            >
              <span>🇬🇧 English</span>
              {language === 'en' && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
        </div>

        {/* 2. Theme Toggle: Night (Dark) <-> Day (Light) */}
        <div className="p-3.5 rounded-2xl bg-[#07172b] border border-cyan-500/30 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {isArabic
                  ? 'تغيير الإضاءة (من ليلي إلى نهاري):'
                  : 'Theme Mode (Night / Day):'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {theme === 'dark' ? (isArabic ? 'الوضع الليلي' : 'Night Mode') : (isArabic ? 'الوضع النهاري' : 'Day Mode')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-400'
                  : 'bg-[#091524] text-slate-400 hover:text-white border border-cyan-500/20'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isArabic ? 'وضع ليلي (Dark)' : 'Night Mode'}</span>
            </button>

            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-300'
                  : 'bg-[#091524] text-slate-400 hover:text-white border border-cyan-500/20'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>{isArabic ? 'وضع نهاري (Light)' : 'Day Mode'}</span>
            </button>
          </div>
        </div>

        {/* 3. Guide on Bot Usage (شرح عن استخدام البوت) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-cyan-300 font-bold">
              {isArabic ? 'دليل مبسط وواضح' : 'Simple Step-by-Step'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <span>{isArabic ? 'شرح عن استخدام البوت:' : 'How to Use the Bot:'}</span>
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {guideItems.map((item) => {
              const isOpen = openGuideKey === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-cyan-500/20 bg-[#061426] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleGuide(item.id)}
                    className="w-full p-3 flex items-center justify-between text-right hover:bg-cyan-950/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{item.title}</span>
                      <div className="p-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                        {item.icon}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-3 pt-0 border-t border-cyan-500/10 text-right">
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-[#030a14]/60 p-2.5 rounded-xl border border-cyan-500/10">
                        {item.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isArabic ? 'إغلاق ومتابعة استخدام البوت' : 'Close and Continue'}</span>
        </button>
      </div>
    </div>
  );
};
