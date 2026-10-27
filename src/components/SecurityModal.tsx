import React from 'react';
import { ShieldCheck, X, Lock, CheckCircle, Smartphone } from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface SecurityModalProps {
  user: UserProfile;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-5 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col gap-4 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white">حماية وأمان الحساب</span>
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-white">حساب معتمد وموثق 100%</span>
            <span className="text-[11px] text-amber-200/80 mt-0.5">
              مرتبط رسمياً برقم تيليغرام المعتمد: {user.id}
            </span>
          </div>
        </div>

        {/* Security Checklist */}
        <div className="flex flex-col gap-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#081525] border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>الربط المشفر مع تيليغرام</span>
            </div>
            <span className="text-emerald-400 font-bold font-mono">نشط</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#081525] border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>حماية تحويلات سيريتل وشام كاش</span>
            </div>
            <span className="text-emerald-400 font-bold font-mono">256-bit SSL</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#081525] border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>مكافحة الحسابات الوهمية</span>
            </div>
            <span className="text-emerald-400 font-bold">مفعل</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          جميع بيانات التحويل وأرقام الهواتف السورية محمية وخاضعة لسياسة الخصوصية الصارمة لبوت سوريا.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
        >
          فهمت ذلك، إغلاق
        </button>
      </div>
    </div>
  );
};
