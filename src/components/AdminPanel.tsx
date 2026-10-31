import React, { useState, useEffect } from 'react';
import {
  TaskItem,
  TaskSubmission,
  WithdrawalTransaction,
  UserProfile,
  SupportTicket,
  PromoCodeItem,
  SystemConfig,
  AppLanguage,
} from '../types/index.ts';
import { getTranslation } from '../utils/translations.ts';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  ArrowRight,
  ClipboardCheck,
  Wallet,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Headphones,
  BarChart3,
  Sliders,
  Bell,
  CreditCard,
  Tag,
  Power,
  PowerOff,
  Send,
  Phone,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPanelProps {
  tasks: TaskItem[];
  transactions: WithdrawalTransaction[];
  tickets: SupportTicket[];
  promoCodes: PromoCodeItem[];
  user: UserProfile;
  systemConfig: SystemConfig;
  onApproveProof: (taskId: string) => void;
  onRejectProof: (taskId: string, reason?: string) => void;
  onApproveWithdrawal: (txId: string) => void;
  onRejectWithdrawal: (txId: string) => void;
  onReplyTicket: (ticketId: string, replyText: string) => void;
  onDeleteTicket: (ticketId: string) => void;
  onUpdateSystemConfig: (updated: Partial<SystemConfig>) => void;
  onSendNotification: (title: string, message: string) => void;
  onCreditUserById: (targetId: string, amount: number) => boolean;
  onCreatePromoCode: (code: string, reward: number, maxUses?: number) => void;
  onDeletePromoCode: (codeId: string) => void;
  onAddTask: (newTask: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
  language?: AppLanguage;
}

const ADMIN_PASSWORD_CORRECT = '201000';
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 60;

type AdminSection =
  | 'proofs'
  | 'withdrawals'
  | 'support'
  | 'stats'
  | 'settings'
  | 'notify'
  | 'credit'
  | 'promo'
  | 'add_task'
  | 'delete_task'
  | 'bot_control';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tasks,
  transactions,
  tickets,
  promoCodes,
  user,
  systemConfig,
  onApproveProof,
  onRejectProof,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onReplyTicket,
  onDeleteTicket,
  onUpdateSystemConfig,
  onSendNotification,
  onCreditUserById,
  onCreatePromoCode,
  onDeletePromoCode,
  onAddTask,
  onDeleteTask,
  onClose,
  language = 'ar',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bot_syria_admin_auth') === 'true';
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminSection>('proofs');

  // Forms state
  // Reply ticket
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Values config
  const [minWithdrawalVal, setMinWithdrawalVal] = useState(systemConfig.minWithdrawal);
  const [referralRewardVal, setReferralRewardVal] = useState(systemConfig.referralReward);

  // Broadcast Notification
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // Credit user by ID
  const [targetUserId, setTargetUserId] = useState(user.id);
  const [creditAmount, setCreditAmount] = useState(10000);

  // Promo code
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoReward, setNewPromoReward] = useState(5000);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState(50); // مكان كم شخص بينفذ الكود

  // Add Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState(1500);
  const [taskSeats, setTaskSeats] = useState(50);
  const [taskUrl, setTaskUrl] = useState('');
  const [taskBadge, setTaskBadge] = useState('مهمة رسمية');

  // Feedback banner
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  // Real task submissions from SQLite database (Phase 1)
  const [dbSubmissions, setDbSubmissions] = useState<TaskSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setIsLoadingSubmissions(true);
      const res = await fetch('/api/admin/submissions?status=pending', {
        headers: {
          'x-admin-password': ADMIN_PASSWORD_CORRECT,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          setDbSubmissions(data.submissions);
        }
      }
    } catch (err) {
      console.error('Error fetching submissions from database:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // Auto-refresh task submissions every 5 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
      const interval = setInterval(fetchSubmissions, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const showFeedback = (msg: string) => {
    setAdminFeedback(msg);
    setTimeout(() => setAdminFeedback(null), 3000);
  };

  // Processing state for atomic approve/reject calls
  const [processingSubId, setProcessingSubId] = useState<string | null>(null);
  const [rejectReasonInputs, setRejectReasonInputs] = useState<Record<string, string>>({});

  const handleApproveSubmission = async (sub: TaskSubmission) => {
    if (processingSubId) return;
    setProcessingSubId(sub.id);
    try {
      const res = await fetch(`/api/admin/submissions/${sub.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': ADMIN_PASSWORD_CORRECT,
        },
        body: JSON.stringify({ adminId: user.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbSubmissions((prev) => prev.filter((item) => item.id !== sub.id));
        showFeedback(
          `تمت الموافقة بنجاح! صُرفت +${Number(data.creditedAmount || sub.reward).toLocaleString(
            'en-US'
          )} ل.س لرصيد المستخدم [${sub.userId}] وتوثقت في السجل المالي.`
        );
        onApproveProof(sub.taskId || sub.id);
      } else {
        showFeedback(`تنبيه: ${data.error || 'تعذر اعتماد الإثبات'}`);
      }
    } catch (err) {
      console.error('Failed to approve submission on server:', err);
      showFeedback('حدث خطأ في الاتصال بالخادم أثناء الاعتماد');
    } finally {
      setProcessingSubId(null);
    }
  };

  const handleRejectSubmission = async (sub: TaskSubmission) => {
    if (processingSubId) return;
    setProcessingSubId(sub.id);
    const reason =
      rejectReasonInputs[sub.id]?.trim() || 'الصورة غير واضحة أو لم يتم استيفاء شروط المهمة';
    try {
      const res = await fetch(`/api/admin/submissions/${sub.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': ADMIN_PASSWORD_CORRECT,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbSubmissions((prev) => prev.filter((item) => item.id !== sub.id));
        showFeedback(`تم رفض الإثبات للمستخدم [${sub.userId}] وحفظ سبب الرفض في قاعدة البيانات.`);
        onRejectProof(sub.taskId || sub.id, reason);
      } else {
        showFeedback(`تنبيه: ${data.error || 'تعذر رفض الإثبات'}`);
      }
    } catch (err) {
      console.error('Failed to reject submission on server:', err);
      showFeedback('حدث خطأ في الاتصال بالخادم أثناء الرفض');
    } finally {
      setProcessingSubId(null);
    }
  };

  // Lockout countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLockedOut && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutTimer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    if (passwordInput.trim() === ADMIN_PASSWORD_CORRECT) {
      setIsAuthenticated(true);
      sessionStorage.setItem('bot_syria_admin_auth', 'true');
      setErrorMessage(null);
      setPasswordInput('');
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLockedOut(true);
        setLockoutTimer(LOCKOUT_SECONDS);
        setErrorMessage(`تم حظر محاولات الدخول مؤقتاً لمدة ${LOCKOUT_SECONDS} ثانية.`);
      } else {
        setErrorMessage(
          `كلمة المرور غير صحيحة! (المحاولات المتبقية: ${MAX_ATTEMPTS - newAttempts})`
        );
      }
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bot_syria_admin_auth');
    onClose();
  };

  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSystemConfig({
      minWithdrawal: Number(minWithdrawalVal),
      referralReward: Number(referralRewardVal),
    });
    showFeedback('تم حفظ القيم والمتغيرات الجديدة بنجاح!');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    onSendNotification(notifTitle.trim(), notifMessage.trim());
    setNotifTitle('');
    setNotifMessage('');
    showFeedback('تم بث الإشعار بنجاح لكافة المستخدمين!');
  };

  const handleCreditUser = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onCreditUserById(targetUserId.trim(), Number(creditAmount));
    if (success) {
      showFeedback(`تمت إضافة ${creditAmount.toLocaleString('en-US')} ل.س للمستخدم ID: ${targetUserId}`);
    } else {
      setErrorMessage('تعذر العثور على المستخدم أو إتمام العملية.');
    }
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const maxUses = Number(newPromoMaxUses) > 0 ? Number(newPromoMaxUses) : 50;
    onCreatePromoCode(newPromoCode.trim(), Number(newPromoReward), maxUses);
    const codeName = newPromoCode.trim().toUpperCase();
    setNewPromoCode('');
    showFeedback(`تم إنشاء البرومو كود (${codeName}) لـ ${maxUses} مستفيد بنجاح!`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      description: taskDesc.trim() || 'مهمة جديدة مضافة من لوحة تحكم الإدارة.',
      reward: Number(taskReward),
      category: 'telegram',
      icon: 'telegram',
      actionUrl: taskUrl.trim() || 'https://t.me/BotSyria_Official',
      status: 'available',
      seatsLeft: Number(taskSeats),
      totalSeats: Number(taskSeats),
      badge: taskBadge.trim() || 'جديد',
    });
    setTaskTitle('');
    setTaskDesc('');
    setTaskUrl('');
    showFeedback('تمت إضافة المهمة ونشرها بنجاح!');
  };

  const pendingProofs = tasks.filter((t) => t.status === 'pending_review');
  const pendingWithdrawals = transactions.filter((tx) => tx.status === 'pending');
  const pendingTickets = tickets.filter((tk) => tk.status === 'pending');

  const isManager = user.id.trim() === systemConfig.adminId.trim();
  const t = getTranslation(language);
  const isArabic = language === 'ar';

  // 1. IF CURRENT USER IS NOT THE MANAGER ID: SHOW STRICT "الحماية داخل البوت قوية" SCREEN
  if (!isManager) {
    return (
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 bg-[#040811]/95 backdrop-blur-md text-white flex flex-col items-center justify-center p-4 selection:bg-rose-500/30"
      >
        <div className="absolute top-1/4 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border-2 border-rose-500/60 shadow-[0_0_40px_rgba(244,63,94,0.3)] flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Fortress Shield Icon */}
          <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)] mb-4">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>

          <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[11px] font-black tracking-wide uppercase">
            {t.securityDeniedBadge}
          </span>

          <h2 className="text-2xl font-black text-white mt-3 tracking-wide">
            {t.securityDeniedTitle}
          </h2>

          <div className="w-full mt-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs leading-relaxed text-right flex flex-col gap-2">
            <p className="font-bold text-white text-center">
              {t.securityDeniedMsg}
            </p>
            <p className="text-[11px] text-slate-300 leading-normal text-center">
              {t.securityOnlyManager}
              <br />
              <strong className="text-amber-400 font-mono text-sm block text-center mt-1">
                ID: {systemConfig.adminId}
              </strong>
            </p>
            <div className="pt-2 border-t border-rose-500/30 text-[10px] text-slate-400 text-center">
              {t.securityCurrentId} <span className="font-mono text-rose-300 font-bold">{user.id}</span>
              <br />
              {t.securityProtectedNote}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{t.returnToBot}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. IF MANAGER ID: SHOW ULTRA-SECURE PASSWORD LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 bg-[#040811] text-white flex flex-col items-center justify-center p-4 selection:bg-rose-500/30"
      >
        <div className="absolute top-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold mb-1">
            ✓ {isArabic ? `تم التعرف على معرف المدير: ${user.id}` : `Manager ID verified: ${user.id}`}
          </div>

          <h2 className="text-xl font-black text-white tracking-wide">{t.adminCentralGateway}</h2>
          <span className="text-xs text-amber-300/90 font-bold mt-0.5">
            {t.enterAdminPassword}
          </span>

          <div className="mt-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed text-right flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              {isArabic
                ? 'كلمة مرور الإدارة محمية بنظام تشفير محلي. محاولات التخمين مقيدة بـ 3 محاولات خاطئة فقط قبل تفعيل الحظر الأمني التلقائي لمدة 60 ثانية.'
                : 'Admin password is encrypted. Brute-force guessing is restricted to 3 attempts before a 60-second automatic security lockout.'}
            </span>
          </div>

          <form onSubmit={handleLogin} className="w-full mt-4 flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage(null);
                }}
                disabled={isLockedOut}
                placeholder={isArabic ? 'أدخل كلمة مرور الإدارة...' : 'Enter admin password...'}
                className="w-full p-3.5 pr-4 pl-11 rounded-2xl bg-[#071322] border-2 border-amber-500/40 text-white font-mono text-center tracking-widest text-base font-bold focus:outline-none focus:border-amber-400 placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 text-right">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isLockedOut && (
              <div className="text-xs text-rose-400 font-bold font-mono">
                {isArabic ? `يرجى الانتظار: ${lockoutTimer} ثانية` : `Please wait: ${lockoutTimer}s`}
              </div>
            )}

            <button
              type="submit"
              disabled={isLockedOut || !passwordInput}
              className="w-full mt-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isArabic ? 'تأكيد تسجيل الدخول' : 'Confirm Admin Sign In'}</span>
            </button>
          </form>

          <button
            onClick={onClose}
            className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>{isArabic ? 'إلغاء والعودة للرئيسية' : 'Cancel & Back to Home'}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
    );
  }

  // NAVIGATION BAR ITEMS REQUESTED BY USER:
  // الاثباتات، السحوبات، الدعم الفني، الإحصائيات، تعديل القيم، ارسال اشعار، اضافة رصيد بالايدي، برومو كود، اضافة مهمة، حذف مهمة، إيقاف وتشغيل البوت
  const navTabs: { id: AdminSection; label: string; badge?: number; icon: any }[] = [
    { id: 'proofs', label: 'الإثباتات', badge: dbSubmissions.length, icon: ClipboardCheck },
    { id: 'withdrawals', label: 'السحوبات', badge: pendingWithdrawals.length, icon: Wallet },
    { id: 'support', label: 'الدعم الفني', badge: pendingTickets.length, icon: Headphones },
    { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings', label: 'تعديل القيم', icon: Sliders },
    { id: 'notify', label: 'إرسال إشعار', icon: Bell },
    { id: 'credit', label: 'إضافة رصيد بالأيدي', icon: CreditCard },
    { id: 'promo', label: 'برومو كود', icon: Tag },
    { id: 'add_task', label: 'إضافة مهمة', icon: Plus },
    { id: 'delete_task', label: 'حذف مهمة', icon: Trash2 },
    { id: 'bot_control', label: 'إيقاف / تشغيل البوت', icon: Power },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#050b14] text-white flex flex-col overflow-y-auto selection:bg-cyan-500/30">
      {/* Top Admin Header */}
      <div className="w-full bg-[#071526] border-b border-cyan-500/30 p-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:text-white text-xs font-bold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-2 text-right">
          <div className="flex flex-col">
            <span className="font-black text-sm text-white flex items-center gap-1.5">
              <span>لوحة الإدارة المركزية</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400/60 text-[10px] text-emerald-300 font-bold">
                المدير العام
              </span>
            </span>
            <span className="text-[10px] text-cyan-300 font-mono">ID: {systemConfig.adminId}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Admin Horizontal Scrollable Tabs */}
      <div className="w-full bg-[#071220] border-b border-cyan-500/20 px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'bg-[#09182a] text-slate-400 hover:text-white border border-cyan-500/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col gap-4 pb-24 text-right">
        {/* Feedback message */}
        {adminFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{adminFeedback}</span>
          </div>
        )}

        {/* 1. الإثباتات الحقيقية من قاعدة البيانات (Task Submissions from Database) */}
        {activeTab === 'proofs' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">
                  إثباتات المهام الحقيقية في قاعدة البيانات ({dbSubmissions.length})
                </span>
                <button
                  type="button"
                  onClick={fetchSubmissions}
                  disabled={isLoadingSubmissions}
                  className="px-2 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:text-white text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                  title="تحديث فوري من قاعدة البيانات"
                >
                  <RotateCcw className={`w-3 h-3 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                  <span>تحديث</span>
                </button>
              </div>
              <span className="text-[11px] text-cyan-300 font-mono">
                {isLoadingSubmissions ? 'جارٍ المزامنة...' : 'تحديث تلقائي مستمر ⚡'}
              </span>
            </div>

            {dbSubmissions.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <ClipboardCheck className="w-8 h-8 text-slate-600 mb-1" />
                <span>
                  {isLoadingSubmissions
                    ? 'جارٍ فحص قاعدة البيانات ومزامنة الإثباتات...'
                    : 'لا توجد إثباتات معلقة في جدول task_submissions حالياً.'}
                </span>
                <span className="text-[10px] text-slate-500">
                  أي مستخدم يرفع إثباتاً من التطبيق سيظهر هنا فوراً وتلقائياً.
                </span>
              </div>
            ) : (
              dbSubmissions.map((sub) => {
                const formattedTime = new Date(sub.createdAt).toLocaleTimeString('ar-SY', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const formattedDate = new Date(sub.createdAt).toLocaleDateString('ar-SY', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={sub.id}
                    className="glass-panel rounded-2xl p-4 border border-amber-500/40 flex flex-col gap-3 shadow-lg hover:border-amber-400 transition-all"
                  >
                    {/* Header: User ID & Task Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 text-right">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-white">{sub.taskTitle}</span>
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-400/50 text-[11px] text-cyan-300 font-mono font-bold">
                            معرف المستخدم: {sub.userId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <span>
                            <strong>اسم الحساب:</strong> {sub.userName || `مستخدم [${sub.userId}]`}
                          </span>
                          <span>•</span>
                          <span className="text-amber-300 font-mono font-bold">
                            المكافأة: +{sub.reward.toLocaleString('en-US')} ل.س
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>وقت الإرسال: {formattedDate} - {formattedTime}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-400/60 text-amber-300 text-[10px] font-bold shrink-0">
                        قيد التدقيق
                      </span>
                    </div>

                    {/* Proof Image */}
                    {sub.proofImage && (
                      <div className="rounded-xl border border-cyan-500/30 overflow-hidden bg-black/80 p-2 flex flex-col items-center">
                        <img
                          src={sub.proofImage}
                          alt="Submitted proof screenshot"
                          className="w-full max-h-56 object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {/* User Note */}
                    {sub.proofNote ? (
                      <div className="p-2.5 rounded-xl bg-[#071626] border border-cyan-500/30 text-xs text-slate-200">
                        <strong className="text-cyan-300">ملاحظة المستخدم:</strong> {sub.proofNote}
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-[#071626]/40 border border-slate-700/30 text-[11px] text-slate-400">
                        <em>لا توجد ملاحظة إضافية مرفقة مع الإثبات</em>
                      </div>
                    )}

                    {/* Inline Custom Rejection Reason Input */}
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#05101c] border border-cyan-500/20">
                      <span className="text-[10px] text-slate-400 shrink-0 font-bold">سبب الرفض (عند الرفض):</span>
                      <input
                        type="text"
                        placeholder="الصورة غير واضحة، لم يتم الانضمام، إلخ..."
                        value={rejectReasonInputs[sub.id] || ''}
                        onChange={(e) =>
                          setRejectReasonInputs({
                            ...rejectReasonInputs,
                            [sub.id]: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>

                    {/* Action buttons with atomic server execution */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20">
                      <button
                        type="button"
                        disabled={processingSubId === sub.id}
                        onClick={() => handleApproveSubmission(sub)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
                      >
                        <CheckCircle2 className={`w-4 h-4 ${processingSubId === sub.id ? 'animate-spin' : ''}`} />
                        <span>{processingSubId === sub.id ? 'جارٍ الاعتماد بالخادم...' : 'موافقة ومنح النقاط'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={processingSubId === sub.id}
                        onClick={() => handleRejectSubmission(sub)}
                        className="py-2.5 px-3 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 text-rose-300 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
                      >
                        <XCircle className={`w-4 h-4 ${processingSubId === sub.id ? 'animate-spin' : ''}`} />
                        <span>{processingSubId === sub.id ? 'جارٍ تسجيل الرفض...' : 'رفض وإعادة المهمة'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. السحوبات (Withdrawals) */}
        {activeTab === 'withdrawals' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                طلبات السحب المعلقة بانتظار الموافقة ({pendingWithdrawals.length})
              </span>
              <span className="text-[11px] text-teal-300">قبول/رفض = يختفي الطلب فوراً من الصفحة</span>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
                لا توجد طلبات سحب معلقة حالياً — تم البت في كافة العمليات بنجاح!
              </div>
            ) : (
              pendingWithdrawals.map((tx) => (
                <div key={tx.id} className="glass-panel rounded-2xl p-3.5 border border-teal-500/30 flex items-center justify-between">
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-xs text-white">
                      {tx.amount.toLocaleString('en-US')} ل.س ({tx.method === 'syriatel_cash' ? 'سيريتل كاش' : 'شام كاش'})
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono mt-0.5">
                      الرقم: {tx.accountNumber} • الاسم: {tx.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      المرجع: {tx.referenceNumber} • {tx.date}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-400 text-amber-300">
                      طلب سحب معلق
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        onClick={() => {
                          onApproveWithdrawal(tx.id);
                          showFeedback('تمت الموافقة على السحب وصرف الحوالة (اختفى الطلب من القائمة فوراً)!');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black shadow-sm active:scale-95 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>قبول وصرف</span>
                      </button>
                      <button
                        onClick={() => {
                          onRejectWithdrawal(tx.id);
                          showFeedback('تم رفض طلب السحب واستعادة الرصيد للمستخدم (اختفى الطلب فوراً)!');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-500/60 text-rose-300 text-[11px] font-black active:scale-95 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>رفض</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. الدعم الفني (Support Tickets) */}
        {activeTab === 'support' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                شكاوى واستفسارات المستخدمين الواردة ({pendingTickets.length})
              </span>
              <span className="text-[11px] text-cyan-300">الرد أو الحذف = تختفي الشكوى من هنا فوراً</span>
            </div>

            {pendingTickets.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
                لا توجد شكاوى واردة بانتظار الرد حالياً — صندوق الدعم فارغ ونظيف!
              </div>
            ) : (
              pendingTickets.map((tk) => (
                <div key={tk.id} className="glass-panel rounded-2xl p-4 border border-cyan-500/30 flex flex-col gap-2.5 text-right">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>رقم هاتف المستخدم: {tk.phone}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(tk.createdAt).toLocaleString('ar-SY')} • ID: {tk.userId}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-400 text-amber-300">
                      بانتظار الرد
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/20 text-xs text-white leading-relaxed">
                    <strong className="text-cyan-300">نص الشكوى:</strong> {tk.complaint}
                  </div>

                  {tk.imageUrl && (
                    <div className="rounded-xl border border-cyan-500/30 overflow-hidden bg-black/60 p-2">
                      <img src={tk.imageUrl} alt="Proof" className="max-h-40 object-contain rounded-lg mx-auto" />
                    </div>
                  )}

                  {/* Reply Input Box (when toggled for this ticket) */}
                  {replyTicketId === tk.id && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-cyan-500/20 animate-in fade-in duration-150">
                      <textarea
                        rows={3}
                        autoFocus
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="اكتب رد الإدارة الرسمي هنا (سيظهر للمستخدم مباشرة تحت الشكوى بصفحة الدعم)..."
                        className="p-3 rounded-xl bg-[#081525] border border-cyan-500/40 text-white text-xs resize-none focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTicketId(null);
                            setReplyContent('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!replyContent.trim()) return;
                            onReplyTicket(tk.id, replyContent.trim());
                            setReplyContent('');
                            setReplyTicketId(null);
                            showFeedback('تم إرسال الرد للمستخدم واختفت الشكوى من الإدارة فوراً!');
                          }}
                          className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5 -rotate-45" />
                          <span>إرسال الرد وإخفاء الشكوى فوراً</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Two Buttons: Reply and Delete */}
                  {replyTicketId !== tk.id && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTicketId(tk.id);
                          setReplyContent('');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Send className="w-3.5 h-3.5 -rotate-45" />
                        <span>الرد على الشكوى</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTicket(tk.id);
                          showFeedback('تم حذف الشكوى واختفت من الصفحة فوراً!');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الشكوى</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {/* 4. الإحصائيات (Stats) */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-200">
              إحصائيات النظام والعمليات الميدانية
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* عدد المستخدمين */}
              <div className="glass-panel rounded-2xl p-4 border border-cyan-500/40 text-right bg-gradient-to-br from-[#07172b] to-[#040e1b] flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    نشط الآن
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-slate-300 font-bold block">عدد المستخدمين</span>
                  <span className="text-2xl font-black text-white mt-1 block font-mono">
                    1 <span className="text-xs font-normal text-slate-400 font-sans">مستخدم مسجل</span>
                  </span>
                </div>
              </div>

              {/* عدد طلبات السحب للمستخدمين */}
              <div className="glass-panel rounded-2xl p-4 border border-teal-500/40 text-right bg-gradient-to-br from-[#061e22] to-[#040e1b] flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                    إجمالي الحوالات
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-slate-300 font-bold block">عدد طلبات السحب للمستخدمين</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
                    {transactions.length} <span className="text-xs font-normal text-slate-400 font-sans">طلب سحب</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. تعديل القيم (Settings) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSystemConfig} className="glass-panel rounded-2xl p-4 border border-cyan-500/30 flex flex-col gap-3.5 text-right">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="font-bold text-sm text-white">تعديل المتغيرات والقيم العامة للبوت</span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-400/40 font-bold">
                ⚡ تعديل فوري ومباشر
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-bold">الحد الأدنى للسحب (ل.س):</label>
              <input
                type="number"
                value={minWithdrawalVal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinWithdrawalVal(val);
                  onUpdateSystemConfig({ minWithdrawal: val });
                }}
                className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400">أي مستخدم يحاول السحب بمبلغ أقل من هذا سيتم رفض طلبه تلقائياً.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-bold">مكافأة الإحالة الواحدة (ل.س):</label>
              <input
                type="number"
                value={referralRewardVal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setReferralRewardVal(val);
                  onUpdateSystemConfig({ referralReward: val });
                }}
                className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400">المبلغ الذي يُضاف للمستخدم عن كل صديق يقوم بدعوته للبوت.</span>
            </div>

            <button
              type="submit"
              className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs mt-1 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد وحفظ التعديلات فوراً</span>
            </button>
          </form>
        )}

        {/* 6. إرسال إشعار (Broadcast Notification) */}
        {activeTab === 'notify' && (
          <form onSubmit={handleSendBroadcast} className="glass-panel rounded-2xl p-4 border border-cyan-500/30 flex flex-col gap-3 text-right">
            <span className="font-bold text-sm text-white">إرسال إشعار عام لكافة المستخدمين</span>
            <input
              type="text"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="عنوان الإشعار (مثال: عروض نهاية الأسبوع 🎁)"
              className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white text-xs"
            />
            <textarea
              rows={3}
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="نص الإشعار الترويجي أو التنبيه..."
              className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white text-xs resize-none"
            />
            <button type="submit" className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5">
              <Send className="w-3.5 h-3.5 -rotate-45" />
              <span>إرسال الإشعار فوراً</span>
            </button>
          </form>
        )}

        {/* 7. إضافة رصيد بالأيدي (Credit user by ID) */}
        {activeTab === 'credit' && (
          <form onSubmit={handleCreditUser} className="glass-panel rounded-2xl p-4 border border-cyan-500/30 flex flex-col gap-3 text-right">
            <span className="font-bold text-sm text-white">إضافة رصيد لحساب محدد عبر ID</span>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">معرّف المستخدم (User ID):</label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="أدخل الـ ID الخاص بالمستخدم..."
                className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">المبلغ المراد شحنه (ل.س):</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white font-mono text-xs"
              />
            </div>
            <button type="submit" className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs">
              تأكيد الشحن الفوري
            </button>
          </form>
        )}

        {/* 8. برومو كود (Promo Code Management with Max Users input) */}
        {activeTab === 'promo' && (
          <div className="flex flex-col gap-3.5 text-right">
            <form onSubmit={handleCreatePromo} className="glass-panel rounded-2xl p-4 border border-rose-500/40 flex flex-col gap-2.5">
              <span className="font-bold text-sm text-white">إنشاء كود ترويجي جديد</span>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300 font-bold">رمز البرومو كود:</label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  placeholder="رمز الكود (مثال: FREE10K أو SYRIA2026)"
                  className="p-2.5 rounded-xl bg-[#07172b] border border-rose-500/30 text-white uppercase font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-300 font-bold">المكافأة (ل.س):</label>
                  <input
                    type="number"
                    value={newPromoReward}
                    onChange={(e) => setNewPromoReward(Number(e.target.value))}
                    placeholder="المكافأة (ل.س)"
                    className="p-2.5 rounded-xl bg-[#07172b] border border-rose-500/30 text-white font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-amber-300 font-bold">مكان كم شخص ينفذ الكود:</label>
                  <input
                    type="number"
                    min="1"
                    value={newPromoMaxUses}
                    onChange={(e) => setNewPromoMaxUses(Number(e.target.value))}
                    placeholder="الحد الأقصى للمستفيدين (مثال: 50)"
                    className="p-2.5 rounded-xl bg-[#07172b] border border-amber-500/40 text-amber-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-400">
                بمجرد وصول عدد المستفيدين إلى الرقم المحدد أعلاه، تنتهي مقاعد الكود ولا يعود بإمكان أي شخص تفعيله.
              </span>

              <button type="submit" className="py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-bold text-xs mt-1 shadow-md active:scale-95">
                حفظ ونشر الكود بالمقاعد المحددة
              </button>
            </form>

            <span className="text-xs font-bold text-slate-300">الأكواد المنشأة حالياً ({promoCodes.length})</span>
            {promoCodes.length === 0 ? (
              <div className="glass-panel rounded-2xl p-6 text-center text-slate-400 text-xs">
                لا توجد أكواد منشأة بعد. أنشئ أول كود أعلاه مع تحديد عدد المستفيدين!
              </div>
            ) : (
              promoCodes.map((p) => (
                <div key={p.id} className="glass-panel rounded-2xl p-3 border border-rose-500/20 flex items-center justify-between">
                  <div className="flex flex-col text-right">
                    <span className="font-mono font-bold text-white text-xs">{p.code}</span>
                    <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                      +{p.reward.toLocaleString('en-US')} ل.س
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono mt-0.5">
                      المستفيدون: {p.usedCount || 0} من أصل {p.maxUses || 50} شخص
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onDeletePromoCode(p.id);
                      showFeedback(`تم حذف الكود ${p.code}`);
                    }}
                    className="p-2 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 9. إضافة مهمة (Add Task with designated Seats & Points sections) */}
        {activeTab === 'add_task' && (
          <form onSubmit={handleCreateTask} className="glass-panel rounded-2xl p-4 border border-cyan-400/50 flex flex-col gap-3 text-right">
            <span className="font-bold text-sm text-white">إضافة ونشر مهمة جديدة للمستخدمين</span>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-300 font-bold">عنوان المهمة:</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="عنوان المهمة (مثال: الانضمام لقناة تيليغرام...)"
                className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-300 font-bold">وصف المهمة وشروط الإثبات المطلوبة:</label>
              <textarea
                rows={2}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="اكتب للمستخدم ماذا يفعل وما نوع لقطة الشاشة المطلوبة..."
                className="p-3 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white text-xs resize-none"
              />
            </div>

            {/* DESIGNATED SEATS AND POINTS PLACES REQUESTED BY USER */}
            <div className="p-3 rounded-2xl bg-[#08182b] border border-cyan-500/30 flex flex-col gap-3">
              {/* مكان المقاعد */}
              <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#040e1b] border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>📍 مكان المقاعد (عدد المقاعد المتاحة للمهمة):</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold font-mono">الحد الأقصى</span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={taskSeats}
                  onChange={(e) => setTaskSeats(Number(e.target.value))}
                  placeholder="أدخل عدد المقاعد المتاحة هنا (مثال: 50)"
                  className="p-2.5 rounded-xl bg-[#07172b] border border-amber-500/50 text-amber-300 font-bold text-xs font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-400 leading-tight">
                  هنا مكان المقاعد: عند إرسال الإثبات ينقص المقعد تلقائياً، وإذا أصبحت المقاعد 0 تختفي المهمة تلقائياً من صفحة المستخدمين.
                </span>
              </div>

              {/* مكان النقاط */}
              <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#040e1b] border border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>💎 مكان النقاط (قيمة المكافأة بالليرة السورية):</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">ل.س</span>
                </div>
                <input
                  type="number"
                  min="100"
                  value={taskReward}
                  onChange={(e) => setTaskReward(Number(e.target.value))}
                  placeholder="أدخل قيمة النقاط/المكافأة هنا (مثال: 2500)"
                  className="p-2.5 rounded-xl bg-[#07172b] border border-emerald-500/50 text-emerald-300 font-bold text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-slate-400 leading-tight">
                  هنا مكان النقاط: كم ليرة سورية ستضاف مباشرة لمحفظة المستخدم فور موافقتك على صورة الإثبات من لوحة الإدارة.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-300 font-bold">رابط المهمة (تيليغرام أو موقع خارجي):</label>
              <input
                type="text"
                value={taskUrl}
                onChange={(e) => setTaskUrl(e.target.value)}
                placeholder="رابط المهمة (مثال: https://t.me/...)"
                className="p-2.5 rounded-xl bg-[#07172b] border border-cyan-500/30 text-white text-xs text-left font-mono"
              />
            </div>

            <button type="submit" className="py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-black text-xs mt-1 shadow-lg active:scale-98">
              نشر المهمة الآن في قائمة المهام
            </button>
          </form>
        )}

        {/* 10. حذف مهمة (Delete Task) */}
        {activeTab === 'delete_task' && (
          <div className="flex flex-col gap-2.5 text-right">
            <span className="text-xs font-bold text-slate-200">حذف المهام من النظام ({tasks.length})</span>
            {tasks.length === 0 ? (
              <div className="glass-panel rounded-2xl p-6 text-center text-slate-400 text-xs">
                لا توجد مهام لحذفها.
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="glass-panel rounded-2xl p-3 border border-rose-500/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-white">{task.title}</span>
                    <span className="text-[10px] text-cyan-300 font-mono">
                      +{task.reward.toLocaleString('en-US')} ل.س • المقاعد: {task.seatsLeft}/{task.totalSeats}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onDeleteTask(task.id);
                      showFeedback(`تم حذف مهمة: ${task.title}`);
                    }}
                    className="p-2 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 11. إيقاف البوت وتشغيل البوت (Bot Maintenance Mode) */}
        {activeTab === 'bot_control' && (
          <div className="glass-panel rounded-2xl p-5 border border-amber-500/40 flex flex-col gap-4 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${systemConfig.botMaintenance ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'}`}>
                  {systemConfig.botMaintenance ? <PowerOff className="w-6 h-6" /> : <Power className="w-6 h-6" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white">حالة تشغيل البوت للمستخدمين</span>
                  <span className={`text-xs font-bold ${systemConfig.botMaintenance ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {systemConfig.botMaintenance ? '● البوت في حالة صيانة (متوقف عند الجميع عدا المدير)' : '● البوت نشط ويعمل بشكل طبيعي'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#07172b] p-3 rounded-xl border border-cyan-500/20">
              🛡️ <strong>نظام التحكم الحصري:</strong> عند الضغط على "إيقاف البوت"، تظهر شاشة صيانة لكافة المستخدمين وتمنعهم من الدخول، بينما تظل أنت (المدير ID: {systemConfig.adminId}) قادراً على تصفح النظام بالكامل والتحكم به. وعند الضغط على "تشغيل البوت"، يدخل كافة المستخدمين تلقائياً دون الحاجة للنقر على أي زر.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  onUpdateSystemConfig({ botMaintenance: false });
                  showFeedback('تم تشغيل البوت وإلغاء الصيانة! سيدخل المستخدمون تلقائياً.');
                }}
                disabled={!systemConfig.botMaintenance}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Power className="w-4 h-4" />
                <span>تشغيل البوت (فك الصيانة)</span>
              </button>

              <button
                onClick={() => {
                  onUpdateSystemConfig({ botMaintenance: true });
                  showFeedback('تم تفعيل وضع الصيانة! توقف البوت عند الجميع باستثنائك.');
                }}
                disabled={systemConfig.botMaintenance}
                className="py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <PowerOff className="w-4 h-4" />
                <span>إيقاف البوت (وضع الصيانة)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
