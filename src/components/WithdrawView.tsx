import React, { useState } from 'react';
import {
  PaymentProvider,
  WithdrawalTransaction,
  AppLanguage,
} from '../types/index.ts';
import { WITHDRAWAL_METHODS } from '../utils/mockData.ts';
import {
  validateWithdrawalRequest,
  formatSyrianPound,
  isExpiredAfter6Hours,
  getRemainingTimeString,
} from '../utils/rules.ts';
import { getTranslation } from '../utils/translations.ts';
import {
  Wallet,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Send,
  Timer,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WithdrawViewProps {
  currentBalance: number;
  transactions: WithdrawalTransaction[];
  minWithdrawal?: number;
  onWithdrawSuccess: (tx: WithdrawalTransaction) => void;
  onBack: () => void;
  language?: AppLanguage;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  currentBalance,
  transactions,
  minWithdrawal = 10000,
  onWithdrawSuccess,
  onBack,
  language = 'ar',
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('syriatel_cash');
  const [amountStr, setAmountStr] = useState<string>('25000');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('عبد المعين البحري');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'withdraw' | 'history'>('withdraw');
  const [lastReceipt, setLastReceipt] = useState<WithdrawalTransaction | null>(null);

  const t = getTranslation(language);
  const isArabic = language === 'ar';

  const currentMethod =
    WITHDRAWAL_METHODS.find((m) => m.id === selectedProvider) || WITHDRAWAL_METHODS[0];

  const visibleTransactions = transactions.filter((tx) => {
    if (tx.status === 'pending') return true;
    if (tx.status === 'completed') {
      return !isExpiredAfter6Hours(tx.approvedAt);
    }
    return true;
  });

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
    setErrorMsg(null);
  };

  const handleProcessWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const amountNum = Number(amountStr);

    const validation = validateWithdrawalRequest({
      amount: amountNum,
      currentBalance,
      minAmount: minWithdrawal,
      accountNumber,
      provider: selectedProvider,
    });

    if (!validation.valid) {
      setErrorMsg(validation.error || (isArabic ? 'بيانات السحب غير صحيحة' : 'Invalid withdrawal details'));
      return;
    }

    const refNum = `SYR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: WithdrawalTransaction = {
      id: `tx-${Date.now()}`,
      amount: amountNum,
      method: selectedProvider,
      accountNumber,
      fullName,
      date: new Date().toLocaleTimeString(isArabic ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      referenceNumber: refNum,
      createdAt: Date.now(),
    };

    onWithdrawSuccess(newTx);
    setLastReceipt(newTx);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.55 },
    });
  };

  const getProviderIcon = (id: PaymentProvider) => {
    if (id === 'syriatel_cash') {
      return <Smartphone className="w-5 h-5 text-teal-400" />;
    }
    return <Wallet className="w-5 h-5 text-cyan-400" />;
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
          <span className="text-base font-extrabold text-white">{t.withdrawTitle}</span>
          <Wallet className="w-5 h-5 text-teal-400" />
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#09182d] rounded-2xl border border-cyan-500/30">
        <button
          onClick={() => setActiveSubTab('withdraw')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'withdraw'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(13,148,136,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {isArabic ? 'طلب سحب جديد' : 'New Withdrawal'}
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'history'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(13,148,136,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>
            {isArabic ? 'سجل السحوبات' : 'History'} ({visibleTransactions.length})
          </span>
        </button>
      </div>

      {/* SUCCESS RECEIPT MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border-2 border-teal-400/80 shadow-[0_0_35px_rgba(13,148,136,0.4)] text-right relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">
                    {isArabic ? 'تم رفع طلب السحب بنجاح' : 'Withdrawal Request Submitted'}
                  </h4>
                  <span className="text-[11px] text-teal-300 font-mono">
                    {isArabic ? 'رقم الإشعار:' : 'Ref ID:'} {lastReceipt.referenceNumber}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-400/60 text-amber-300 text-xs font-bold">
                {t.statusPending}
              </span>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-[#061426] border border-teal-500/30 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isArabic ? 'المبلغ المطلوب:' : 'Amount:'}</span>
                <span className="font-black text-lg text-teal-400 font-mono">
                  {formatSyrianPound(lastReceipt.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isArabic ? 'طريقة الاستلام:' : 'Method:'}</span>
                <span className="text-white font-bold">
                  {lastReceipt.method === 'syriatel_cash' ? t.providerSyriatel : t.providerSham}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t.accountOrPhoneLabel}</span>
                <span className="font-mono text-cyan-300 font-bold">{lastReceipt.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isArabic ? 'رسوم التحويل:' : 'Transfer Fee:'}</span>
                <span className="text-emerald-400 font-bold">0% ({isArabic ? 'مجاني بالكامل' : 'Free'})</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300/90 leading-relaxed text-right bg-teal-950/30 p-2.5 rounded-xl border border-teal-500/20">
              {isArabic
                ? 'يبقى طلب السحب مسجلاً لديك في هذه الصفحة، وبمجرد تدقيقه وموافقة الإدارة يتم التحويل، ويختفي تلقائياً بعد 6 ساعات من الإنجاز.'
                : 'Your withdrawal request will be processed by the admin and auto-clears 6 hours post-approval.'}
            </p>

            <button
              onClick={() => {
                setLastReceipt(null);
                setActiveSubTab('history');
              }}
              className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(13,148,136,0.4)]"
            >
              {isArabic ? 'متابعة إلى سجل السحوبات' : 'Go to Withdrawal History'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: WITHDRAW FORM */}
      {activeSubTab === 'withdraw' && (
        <form onSubmit={handleProcessWithdraw} className="flex flex-col gap-4">
          {/* Balance card */}
          <div className="glass-panel rounded-3xl p-4 border border-teal-500/30 bg-gradient-to-br from-[#07242e] to-[#041117] flex items-center justify-between">
            <div className="flex flex-col text-right">
              <span className="text-xs text-teal-300 font-bold">{t.currentBalanceLabel}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white font-mono">
                  {currentBalance.toLocaleString('en-US')}
                </span>
                <span className="text-sm font-bold text-teal-400">{t.syp}</span>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.zeroFeeBadge}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2 text-right">
            <label className="text-xs font-bold text-slate-200">{t.selectProvider}</label>
            <div className="grid grid-cols-2 gap-2.5">
              {WITHDRAWAL_METHODS.map((method) => {
                const isSelected = selectedProvider === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => {
                      setSelectedProvider(method.id);
                      setErrorMsg(null);
                    }}
                    className={`cursor-pointer rounded-2xl p-3 border transition-all flex flex-col justify-between gap-2 text-right ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#092b38] to-[#051821] border-teal-400 shadow-[0_0_15px_rgba(13,148,136,0.3)] ring-1 ring-teal-400'
                        : 'bg-[#061626] border-cyan-500/20 hover:border-cyan-500/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-500/40 flex items-center justify-center">
                        {getProviderIcon(method.id)}
                      </div>
                      {method.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 font-bold">
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-black text-xs text-white block">
                        {method.id === 'syriatel_cash' ? t.providerSyriatel : t.providerSham}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount input */}
          <div className="glass-panel rounded-2xl p-4 border border-teal-500/30 flex flex-col gap-3 text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{t.enterAmountLabel}</span>
              <span className="text-[10px] text-teal-300 font-mono font-bold">
                {t.minWithdrawAlert}: {minWithdrawal.toLocaleString('en-US')} {t.syp}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={minWithdrawal}
                max={currentBalance}
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full p-3.5 pl-14 rounded-2xl bg-[#061220] border border-teal-500/40 text-white font-mono text-xl font-bold focus:outline-none focus:border-teal-400 text-right"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-400">
                {t.syp}
              </span>
            </div>

            {/* Quick Amount suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {[10000, 25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="px-2.5 py-1 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-300 hover:text-white text-xs font-mono font-bold shrink-0 transition-colors"
                >
                  +{amt.toLocaleString('en-US')}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuickAmount(currentBalance)}
                className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 hover:text-white text-xs font-bold shrink-0 transition-colors"
              >
                {isArabic ? 'كامل الرصيد' : 'All Balance'}
              </button>
            </div>
          </div>

          {/* Account Number Input */}
          <div className="glass-panel rounded-2xl p-4 border border-teal-500/30 flex flex-col gap-2.5 text-right">
            <label className="text-xs font-bold text-slate-200">{t.accountOrPhoneLabel}</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={
                selectedProvider === 'syriatel_cash'
                  ? t.placeholderSyriatel
                  : t.placeholderSham
              }
              className="p-3.5 rounded-2xl bg-[#061220] border border-teal-500/40 text-white font-mono text-xs font-bold focus:outline-none focus:border-teal-400 text-right"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-sm shadow-[0_0_25px_rgba(13,148,136,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 -rotate-45" />
            <span>{t.confirmWithdrawButton}</span>
          </button>
        </form>
      )}

      {/* TAB 2: WITHDRAWAL HISTORY */}
      {activeSubTab === 'history' && (
        <div className="flex flex-col gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-[11px] text-teal-200 text-right flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{t.requestDisappearsNotice}</span>
          </div>

          {visibleTransactions.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
              {t.noWithdrawalsYet}
            </div>
          ) : (
            visibleTransactions.map((tx) => (
              <div
                key={tx.id}
                className="glass-panel rounded-2xl p-4 border border-teal-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                    {getProviderIcon(tx.method)}
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-xs text-white">
                      {tx.method === 'syriatel_cash' ? t.providerSyriatel : t.providerSham}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {tx.accountNumber} • {tx.date}
                    </span>
                    {tx.approvedAt && (
                      <span className="text-[10px] text-cyan-300 font-mono">
                        {getRemainingTimeString(tx.approvedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-black text-sm text-teal-400 font-mono">
                    {formatSyrianPound(tx.amount)}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 ${
                      tx.status === 'completed'
                        ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950 border border-amber-500/40 text-amber-300 flex items-center gap-1'
                    }`}
                  >
                    {tx.status === 'completed' ? (
                      t.statusCompleted
                    ) : (
                      <>
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>{t.statusPending}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
