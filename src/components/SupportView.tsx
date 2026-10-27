import React, { useState } from 'react';
import { SupportTicket, AppLanguage } from '../types/index.ts';
import { isExpiredAfter6Hours, getRemainingTimeString } from '../utils/rules.ts';
import { getTranslation } from '../utils/translations.ts';
import {
  Headphones,
  Send,
  ArrowRight,
  Upload,
  Image,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Timer,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SupportViewProps {
  tickets: SupportTicket[];
  onSubmitTicket: (phone: string, complaint: string, imageUrl?: string) => void;
  onBack: () => void;
  language?: AppLanguage;
}

export const SupportView: React.FC<SupportViewProps> = ({
  tickets,
  onSubmitTicket,
  onBack,
  language = 'ar',
}) => {
  const [complaintText, setComplaintText] = useState('');
  const [phone, setPhone] = useState('09');
  const [imageFile, setImageFile] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const t = getTranslation(language);
  const isArabic = language === 'ar';

  const visibleTickets = tickets.filter((tk) => {
    if (tk.status === 'pending') return true;
    if (tk.status === 'replied') {
      return !isExpiredAfter6Hours(tk.repliedAt);
    }
    return true;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!complaintText.trim()) {
      setErrorMsg(isArabic ? 'يرجى كتابة نص الشكوى أو المشكلة' : 'Please write your complaint details');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg(isArabic ? 'يرجى إدخال رقم هاتف صحيح للمتابعة' : 'Please enter a valid phone number');
      return;
    }

    onSubmitTicket(cleanPhone, complaintText.trim(), imageFile);
    setComplaintText('');
    setPhone('09');
    setImageFile('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
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
          <span className="text-base font-extrabold text-white">{t.supportTitle}</span>
          <Headphones className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="glass-panel rounded-3xl p-4 border border-blue-500/30 bg-gradient-to-br from-[#0c2340] to-[#061324] flex items-center justify-between">
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-blue-300">{t.supportTitle}</span>
          <span className="text-base font-black text-white mt-0.5">
            {isArabic ? 'خدمة المشتركين والشكاوى الفورية' : 'Instant Customer Helpdesk'}
          </span>
          <p className="text-xs text-slate-300 mt-1 max-w-[260px] leading-relaxed">
            {t.supportSubtitle}
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <Headphones className="w-7 h-7" />
        </div>
      </div>

      {/* Complaint Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-4 border border-blue-500/30 flex flex-col gap-3.5 text-right"
      >
        <span className="font-extrabold text-sm text-white border-b border-blue-500/20 pb-2">
          {isArabic ? 'إرسال شكوى أو استفسار جديد' : 'Submit a Complaint / Inquiry'}
        </span>

        {/* 1. Complaint Text (Mandatory) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span>{t.complaintTextLabel}</span>
            <span className="text-[10px] text-rose-400 font-bold">
              {isArabic ? '* إجباري' : '* Mandatory'}
            </span>
          </label>
          <textarea
            rows={3}
            value={complaintText}
            onChange={(e) => {
              setComplaintText(e.target.value);
              setErrorMsg(null);
            }}
            placeholder={t.complaintPlaceholder}
            className="w-full p-3 rounded-2xl bg-[#071322] border border-blue-500/30 text-white text-xs font-medium focus:outline-none focus:border-blue-400 placeholder:text-slate-500 text-right resize-none"
          />
        </div>

        {/* 2. Phone Number (Mandatory) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span>{t.phoneLabel}</span>
            <span className="text-[10px] text-rose-400 font-bold">
              {isArabic ? '* إجباري' : '* Mandatory'}
            </span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={t.phonePlaceholder}
              className="w-full p-3 pl-10 rounded-2xl bg-[#071322] border border-blue-500/30 text-white font-mono text-xs font-bold focus:outline-none focus:border-blue-400 placeholder:text-slate-500 text-right"
            />
            <Phone className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 3. Image Upload (Optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span>{t.imageOptionalLabel}</span>
            <span className="text-[10px] text-slate-400">
              {isArabic ? '(اختياري)' : '(Optional)'}
            </span>
          </label>

          {imageFile ? (
            <div className="relative rounded-2xl border border-blue-400/50 overflow-hidden bg-black/40 p-2 flex items-center gap-3">
              <img
                src={imageFile}
                alt="Complaint attachment"
                className="w-16 h-12 object-cover rounded-xl border border-blue-400/40 shrink-0"
              />
              <span className="text-xs text-emerald-400 font-bold flex-1 text-right">
                ✓ {isArabic ? 'تم إرفاق الصورة' : 'Image attached'}
              </span>
              <button
                type="button"
                onClick={() => setImageFile('')}
                className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="w-full py-3 px-3 rounded-2xl border-2 border-dashed border-blue-500/30 hover:border-blue-400 bg-[#071322]/80 flex items-center justify-center gap-2 cursor-pointer transition-colors text-slate-300 text-xs font-bold">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{t.chooseSupportImage}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 text-right">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {submittedSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 text-right animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              {isArabic
                ? 'تم إرسال شكواك بنجاح! ستظهر لك الردود مباشرة أسفل الشكوى هنا.'
                : 'Complaint submitted successfully! Support replies will appear below.'}
            </span>
          </div>
        )}

        {/* 4. Send Complaint Button */}
        <button
          type="submit"
          className="w-full mt-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4 -rotate-45" />
          <span>{t.submitComplaintButton}</span>
        </button>
      </form>

      {/* PREVIOUS COMPLAINTS & REPLIES */}
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-slate-400">
            {t.ticketDisappearsNotice}
          </span>
          <span className="text-xs font-bold text-slate-200 text-right">
            {t.myComplaintsTitle} ({visibleTickets.length})
          </span>
        </div>

        {visibleTickets.length === 0 ? (
          <div className="glass-panel rounded-2xl p-7 text-center text-slate-400 text-xs">
            {t.noComplaintsYet}
          </div>
        ) : (
          visibleTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="glass-panel rounded-2xl p-4 border border-blue-500/30 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-white font-bold">{ticket.phone}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ticket.createdAt).toLocaleTimeString(isArabic ? 'ar-SY' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    ticket.status === 'replied'
                      ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950 border border-amber-500/40 text-amber-300 flex items-center gap-1'
                  }`}
                >
                  {ticket.status === 'replied' ? (
                    isArabic ? '✓ تم الرد' : '✓ Replied'
                  ) : (
                    <>
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>{isArabic ? 'بانتظار الرد' : 'Waiting for Reply'}</span>
                    </>
                  )}
                </span>
              </div>

              {/* The complaint body */}
              <p className="text-xs text-slate-200 bg-[#061220] p-3 rounded-xl border border-blue-500/20 leading-relaxed text-right">
                {ticket.complaint}
              </p>

              {/* Attached image if any */}
              {ticket.imageUrl && (
                <div className="p-1 rounded-xl bg-black/40 border border-cyan-500/20 max-w-[200px]">
                  <img
                    src={ticket.imageUrl}
                    alt="Complaint Proof"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* OFFICIAL ADMIN REPLY (Directly underneath complaint) */}
              {ticket.status === 'replied' && ticket.replyText && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#06241a] to-[#02140d] border border-emerald-500/50 flex flex-col gap-1.5 text-right">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{t.replyFromAdmin}</span>
                    </div>
                    {ticket.repliedAt && (
                      <span className="text-[10px] text-cyan-300 font-mono">
                        {getRemainingTimeString(ticket.repliedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed pt-1">
                    {ticket.replyText}
                  </p>
                </div>
              )}

              {/* Waiting status if not replied */}
              {ticket.status === 'pending' && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2 text-right">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.waitingAdminReply}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
