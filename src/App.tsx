/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TabType,
  UserProfile,
  TaskItem,
  WithdrawalTransaction,
  NotificationItem,
  ReferralUser,
  SupportTicket,
  PromoCodeItem,
  SystemConfig,
  AppLanguage,
  AppTheme,
} from './types/index.ts';
import {
  INITIAL_USER,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_REFERRALS,
  INITIAL_PROMO_CODES,
  INITIAL_TICKETS,
  DEFAULT_SYSTEM_CONFIG,
} from './utils/mockData.ts';
import { Header } from './components/Header.tsx';
import { UserProfileBanner } from './components/UserProfileBanner.tsx';
import { HeroBalanceCard } from './components/HeroBalanceCard.tsx';
import { StatsGrid } from './components/StatsGrid.tsx';
import { EarningActionList } from './components/EarningActionList.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { TasksView } from './components/TasksView.tsx';
import { WithdrawView } from './components/WithdrawView.tsx';
import { ReferralsView } from './components/ReferralsView.tsx';
import { PromoCodeModal } from './components/PromoCodeModal.tsx';
import { SupportView } from './components/SupportView.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { ThreeDotsMenuModal } from './components/ThreeDotsMenuModal.tsx';
import { SplashAndCaptcha } from './components/SplashAndCaptcha.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { BotLogo } from './components/BotLogo.tsx';
import {
  Sparkles,
  Wrench,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const STORAGE_KEYS = {
  USER: 'bot_syria_user_v3',
  TASKS: 'bot_syria_tasks_v3',
  TRANSACTIONS: 'bot_syria_txs_v3',
  NOTIFICATIONS: 'bot_syria_notifs_v3',
  REFERRALS: 'bot_syria_referrals_v3',
  REDEEMED_CODES: 'bot_syria_redeemed_records_v3',
  TICKETS: 'bot_syria_tickets_v3',
  PROMO_CODES: 'bot_syria_promocodes_v3',
  SYSTEM_CONFIG: 'bot_syria_config_v3',
};

interface RedeemedRecord {
  code: string;
  reward: number;
  redeemedAt: number;
}

export default function App() {
  // Initialize state with persistent storage
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USER;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TASKS;
  });

  const [transactions, setTransactions] = useState<WithdrawalTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [referrals, setReferrals] = useState<ReferralUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REFERRALS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TICKETS;
  });

  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROMO_CODES;
  });

  const [redeemedRecords, setRedeemedRecords] = useState<RedeemedRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REDEEMED_CODES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SYSTEM_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Splash & 24h Captcha verification states
  const [isVerifiedSession, setIsVerifiedSession] = useState(false);
  const [forceShowCaptcha, setForceShowCaptcha] = useState(false);

  // Language & Theme states
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('bot_syria_lang') as AppLanguage) || 'ar';
  });
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('bot_syria_theme') as AppTheme) || 'dark';
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
    } catch (e) {
      console.error(e);
    }
  }, [referrals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(promoCodes));
    } catch (e) {
      console.error(e);
    }
  }, [promoCodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REDEEMED_CODES, JSON.stringify(redeemedRecords));
    } catch (e) {
      console.error(e);
    }
  }, [redeemedRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(systemConfig));
    } catch (e) {
      console.error(e);
    }
  }, [systemConfig]);

  // Sync user balance from server SQLite database
  const refreshUserBalance = () => {
    if (!user.id) return;
    fetch(`/api/user/balance?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.balance === 'number') {
          setUser((prev) => ({
            ...prev,
            balance: data.balance,
            todayEarnings: data.todayEarnings ?? prev.todayEarnings,
          }));
        }
      })
      .catch((err) => console.error('Failed to sync user balance from server:', err));
  };

  // Sync tasks and balance from server SQLite database
  useEffect(() => {
    refreshUserBalance();
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tasks) && data.tasks.length > 0) {
          setTasks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const fresh = data.tasks.filter((t: TaskItem) => !existingIds.has(t.id));
            return fresh.length > 0 ? [...prev, ...fresh] : prev;
          });
        }
      })
      .catch((err) => console.error('Failed to sync tasks from server:', err));
  }, [user.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Proof Submission Handler: task immediately disappears from available list!
  const handleSubmitProof = (taskId: string, proofImage: string, proofNote?: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'pending_review',
            proofImage,
            proofNote: proofNote || '',
            submittedAt: timestamp,
            seatsLeft: Math.max(0, t.seatsLeft - 1),
          };
        }
        return t;
      })
    );

    const targetTask = tasks.find((t) => t.id === taskId);
    const taskTitle = targetTask?.title || 'المهمة';
    const reward = targetTask?.reward || 1500;

    // Persist proof submission in backend SQLite database
    fetch('/api/tasks/submit-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        userName: user.name,
        taskId,
        taskTitle,
        reward,
        proofImage,
        proofNote,
      }),
    }).catch((err) => console.error('Failed to send proof to server:', err));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'تم إرسال إثبات المهمة بنجاح 📋',
        message: `تم استلام صورة الإثبات لمهمة (${taskTitle}) وأُحيلت لقسم التدقيق. اختفت المهمة من القائمة المتاحة بانتظار الاعتماد.`,
        date: 'الآن',
        read: false,
        type: 'task',
      },
      ...prev,
    ]);

    showToast('تم إرسال الإثبات بنجاح! اختفت المهمة من القائمة المتاحة بانتظار موافقة الإدارة 🛡️');
  };

  // Admin Approval: User gets points + approval timestamp (expires after 6 hours)
  const handleAdminApproveProof = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'approved',
              approvedAt: Date.now(),
            }
          : t
      )
    );

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + targetTask.reward,
      todayEarnings: prev.todayEarnings + targetTask.reward,
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'تمت موافقة الإدارة وإضافة النقاط! 🎉',
        message: `تهانينا! اعتمدت الإدارة إثبات مهمتك (${targetTask.title}) وحصلت على +${targetTask.reward.toLocaleString('en-US')} ل.س.`,
        date: 'الآن',
        read: false,
        type: 'bonus',
      },
      ...prev,
    ]);

    showToast(`تمت الموافقة! أُضيفت +${targetTask.reward.toLocaleString('en-US')} ل.س لرصيدك بنجاح ⚡`);
    refreshUserBalance();
  };

  // Admin Rejection: Task returns back to available list + restore seat
  const handleAdminRejectProof = (taskId: string, reason?: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'available',
            rejectionReason: reason || 'يرجى إعادة المحاولة ورفع إثبات واضح',
            proofImage: undefined,
            proofNote: undefined,
            seatsLeft: t.seatsLeft + 1,
          };
        }
        return t;
      })
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'إشعار من الإدارة: رفض الإثبات ⚠️',
        message: `تم رفض إثبات مهمة (${targetTask.title}). السبب: ${reason || 'يرجى مراجعة التعليمات'}. عادت المهمة لقائمتك المتاحة.`,
        date: 'الآن',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);

    showToast('رفضت الإدارة الإثبات، وعادت المهمة للظهور في قائمتك المتاحة للمحاولة مجدداً.');
  };

  // Admin Approvall of Withdrawal: stays 6 hours then auto-disappears
  const handleApproveWithdrawal = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              status: 'completed',
              approvedAt: Date.now(),
            }
          : tx
      )
    );
    showToast('تم تأكيد صرف الحوالة بنجاح (ستبقى في السجل لمدة 6 ساعات ثم تختفي تلقائياً)');
  };

  // Admin Rejection of Withdrawal: refunds user balance
  const handleRejectWithdrawal = (txId: string) => {
    const target = transactions.find((t) => t.id === txId);
    if (!target) return;

    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + target.amount,
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'إلغاء طلب السحب واسترجاع الرصيد ⚠️',
        message: `تم إلغاء طلب السحب بقيمة ${target.amount.toLocaleString('en-US')} ل.س وإعادة كامل المبلغ لرصيدك في البوت.`,
        date: 'الآن',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);

    showToast('تم رفض طلب السحب واستعادة الرصيد بالكامل إلى حساب المستخدم.');
  };

  // User submits a support ticket
  const handleSubmitTicket = (phone: string, complaint: string, imageUrl?: string) => {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      userId: user.id,
      phone,
      complaint,
      imageUrl,
      createdAt: Date.now(),
      status: 'pending',
    };

    setTickets((prev) => [newTicket, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'تم استلام الشكوى لدى الدعم الفني 🎧',
        message: 'تم إرسال شكواك بنجاح وسيقوم فريق الدعم بالرد عليها مباشرة تحت الشكوى.',
        date: 'الآن',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);

    showToast('تم استلام شكواك بنجاح! سيتم الرد تحت تذكرتك مباشرة 🎧');
  };

  // Admin replies to a ticket
  const handleReplyTicket = (ticketId: string, replyText: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'replied',
              replyText,
              repliedAt: Date.now(),
            }
          : t
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'وصلك رد من الدعم الفني 💬',
        message: `تم الرد على استفسارك/شكواك: "${replyText.slice(0, 45)}..."، افتح صفحة الدعم الفني للمشاهدة.`,
        date: 'الآن',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);

    showToast('تم إرسال الرد للمستخدم بنجاح (سيختفي الرد مع التذكرة بعد 6 ساعات تلقائياً)');
  };

  // Create promo code with max allowed users limit
  const handleCreatePromoCode = (code: string, reward: number, maxUses = 50) => {
    const newPromo: PromoCodeItem = {
      id: `promo-${Date.now()}`,
      code: code.toUpperCase().trim(),
      reward,
      maxUses: Number(maxUses) > 0 ? Number(maxUses) : 50,
      usedCount: 0,
      claimedUserIds: [],
      createdAt: Date.now(),
    };
    setPromoCodes((prev) => [newPromo, ...prev]);
    showToast(`تم إنشاء البرومو كود (${code}) بمكافأة ${reward.toLocaleString('en-US')} ل.س لـ ${newPromo.maxUses} مستفيد بنجاح!`);
  };

  // Delete promo code
  const handleDeletePromoCode = (codeId: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== codeId));
    showToast('تم حذف البرومو كود من النظام بنجاح.');
  };

  // Delete support ticket (from admin panel)
  const handleDeleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    showToast('تم حذف الشكوى من النظام بنجاح.');
  };

  // Add task by admin
  const handleAddTask = (newTask: Partial<TaskItem>) => {
    const total = newTask.totalSeats || 50;
    const task: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'مهمة جديدة',
      description: newTask.description || '',
      reward: newTask.reward || 1000,
      category: newTask.category || 'telegram',
      icon: newTask.icon || 'send',
      actionUrl: newTask.actionUrl || '',
      status: 'available',
      seatsLeft: total,
      totalSeats: total,
      badge: newTask.badge,
    };
    setTasks((prev) => [task, ...prev]);
    showToast('تمت إضافة المهمة بنجاح وأصبحت متاحة لجميع المستخدمين ⚡');
  };

  // Delete task by admin
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('تم حذف المهمة من النظام بنجاح.');
  };

  // Credit user by ID
  const handleCreditUserById = (targetId: string, amount: number): boolean => {
    if (targetId.trim() === user.id.trim()) {
      setUser((prev) => ({
        ...prev,
        balance: prev.balance + amount,
        todayEarnings: prev.todayEarnings + amount,
      }));
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'شحن رصيد من الإدارة ⚡',
          message: `تم شحن رصيد حسابك بمبلغ +${amount.toLocaleString('en-US')} ل.س مباشرة من قبل الإدارة.`,
          date: 'الآن',
          read: false,
          type: 'bonus',
        },
        ...prev,
      ]);
    }
    showToast(`تم شحن ${amount.toLocaleString('en-US')} ل.س للمستخدم ذو الأيدي [${targetId}] بنجاح 💎`);
    return true;
  };

  // Send broadcast notification
  const handleSendNotification = (title: string, message: string) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title,
        message,
        date: 'الآن',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);
    showToast('تم بث الإشعار بنجاح لجميع المستخدمين 📢');
  };

  // Update system config (including maintenance toggle)
  const handleUpdateSystemConfig = (updated: Partial<SystemConfig>) => {
    setSystemConfig((prev) => {
      const next = { ...prev, ...updated };
      if (updated.botMaintenance !== undefined) {
        if (updated.botMaintenance) {
          showToast('تم تفعيل وضع الصيانة وإيقاف البوت عند كافة المستخدمين 🛑');
        } else {
          showToast('تم تشغيل البوت وإلغاء وضع الصيانة! المستخدمون يدخلون تلقائياً الآن ✅');
        }
      }
      return next;
    });
  };

  // Withdrawal success handler
  const handleWithdrawSuccess = (tx: WithdrawalTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - tx.amount),
    }));
    showToast(`تم إرسال طلب السحب بقيمة ${tx.amount.toLocaleString('en-US')} ل.س بنجاح!`);
  };

  // Promo code redemption success handler: expires after 6 hours
  const handleRedeemSuccess = (reward: number, codeKey: string) => {
    const record: RedeemedRecord = {
      code: codeKey,
      reward,
      redeemedAt: Date.now(),
    };
    setRedeemedRecords((prev) => [record, ...prev]);

    // Update promo item used count and check if completed
    setPromoCodes((prev) =>
      prev.map((p) => {
        if (p.code.toUpperCase() === codeKey.toUpperCase()) {
          const newUsed = (p.usedCount || 0) + 1;
          return {
            ...p,
            usedCount: newUsed,
            claimedUserIds: [...(p.claimedUserIds || []), user.id],
            isRedeemed: p.maxUses ? newUsed >= p.maxUses : true,
            redeemedAt: Date.now(),
          };
        }
        return p;
      })
    );

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + reward,
      todayEarnings: prev.todayEarnings + reward,
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'تفعيل برومو كود بنجاح! 🎁',
        message: `تم شحن رصيدك بمبلغ +${reward.toLocaleString('en-US')} ل.س عبر الكود (${codeKey}).`,
        date: 'الآن',
        read: false,
        type: 'bonus',
      },
      ...prev,
    ]);

    showToast(`تم شحن رصيدك بنجاح بمبلغ +${reward.toLocaleString('en-US')} ل.س! 🎁`);
  };

  const handleResetData = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setTasks(INITIAL_TASKS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReferrals(INITIAL_REFERRALS);
    setTickets(INITIAL_TICKETS);
    setPromoCodes(INITIAL_PROMO_CODES);
    setRedeemedRecords([]);
    setSystemConfig(DEFAULT_SYSTEM_CONFIG);
    setShowMenuModal(false);
    showToast('تمت إعادة ضبط البيانات للحالة الافتراضية.');
  };

  const handleSimulateReferral = (verified: boolean) => {
    const randomNames = ['طارق الشامي', 'نور حلب', 'وسيم اللاذقية', 'رامي حمص', 'مايا درعا', 'عمر دمشق'];
    const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const newRefId = `ref-${Date.now()}`;
    const newReferral: ReferralUser = {
      id: newRefId,
      name: chosenName,
      date: 'الآن',
      bonus: systemConfig.referralReward,
      status: verified ? 'active' : 'pending',
      captchaVerified: verified,
    };

    setReferrals((prev) => [newReferral, ...prev]);

    if (verified) {
      setUser((prev) => ({
        ...prev,
        referralsCount: prev.referralsCount + 1,
        referralsEarned: prev.referralsEarned + systemConfig.referralReward,
        balance: prev.balance + systemConfig.referralReward,
        todayEarnings: prev.todayEarnings + systemConfig.referralReward,
      }));
      showToast(`انضم صديق جديد (${chosenName}) واجتاز الكابتشا! +${systemConfig.referralReward.toLocaleString('en-US')} ل.س`);
    } else {
      showToast(`انضم صديق جديد (${chosenName}) وهو بانتظار اجتياز الكابتشا لتأكيد المكافأة`);
    }
  };

  // Check if admin is currently authenticated in session
  const hasAdminSession =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('bot_syria_admin_auth') === 'true';

  // The admin user ID is exempt from maintenance mode
  const isAdminUser =
    user.id === '8419854444' ||
    user.id === systemConfig.adminId ||
    hasAdminSession;

  // Available tasks: status === 'available' AND seatsLeft > 0
  const availableTasksCount = tasks.filter(
    (t) => t.status === 'available' && t.seatsLeft > 0
  ).length;

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const balanceK = `${Math.round(user.balance / 1000)}K`;

  // MAINTENANCE MODE BARRIER:
  // If botMaintenance is true AND current user is NOT the admin ID 8419854444
  if (systemConfig.botMaintenance && !isAdminUser) {
    const isEn = language === 'en';
    return (
      <div className="min-h-screen bg-[#040913] text-white flex flex-col items-center justify-center p-6 text-center relative select-none antialiased">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-sm flex flex-col items-center gap-5 p-7 rounded-3xl bg-[#091728] border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative">
          <div className="relative">
            <BotLogo size={84} />
            <div className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-amber-500 text-black shadow-lg">
              <Wrench className="w-5 h-5 animate-spin" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {isEn ? 'Maintenance & Update Mode' : 'وضع الصيانة والتحديث'}
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              {isEn ? 'Bot Under Maintenance' : 'البوت في حالة صيانة'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mt-1">
              {systemConfig.maintenanceMessage}
            </p>
          </div>

          {/* Automatic Resume Live Status */}
          <div className={`w-full p-3.5 rounded-2xl bg-[#050f1e] border border-cyan-500/20 flex items-center gap-3 ${isEn ? 'text-left' : 'text-right'}`}>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <RotateCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-cyan-200">
                {isEn ? 'Live connection checking...' : 'فحص تلقائي مستمر للاتصال...'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isEn
                  ? 'When maintenance ends, you will automatically enter without clicking anything.'
                  : 'عند انتهاء الصيانة ستدخل إلى حسابك تلقائياً دون الحاجة للنقر على أي زر.'}
              </span>
            </div>
          </div>

          {/* Discreet Admin Login Trigger */}
          <button
            onClick={() => setShowAdminPanel(true)}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors mt-2"
          >
            <Lock className="w-3 h-3" />
            <span>
              {isEn ? 'Admin Sign In (Manager Only)' : 'تسجيل دخول الإدارة (خاص بالمدير)'}
            </span>
          </button>
        </div>

        {/* Admin Modal from Maintenance Screen */}
        {showAdminPanel && (
          <AdminPanel
            tasks={tasks}
            transactions={transactions}
            tickets={tickets}
            promoCodes={promoCodes}
            user={user}
            systemConfig={systemConfig}
            onApproveProof={handleAdminApproveProof}
            onRejectProof={handleAdminRejectProof}
            onApproveWithdrawal={handleApproveWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            onReplyTicket={handleReplyTicket}
            onDeleteTicket={handleDeleteTicket}
            onUpdateSystemConfig={handleUpdateSystemConfig}
            onSendNotification={handleSendNotification}
            onCreditUserById={handleCreditUserById}
            onCreatePromoCode={handleCreatePromoCode}
            onDeletePromoCode={handleDeletePromoCode}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onClose={() => setShowAdminPanel(false)}
            language={language}
          />
        )}
      </div>
    );
  }

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen ${
        theme === 'light' ? 'light-mode bg-[#f1f5f9] text-slate-900' : 'bg-[#050b14] text-white'
      } flex flex-col items-center justify-start antialiased relative selection:bg-cyan-500/30`}
    >
      {/* Splash Screen & 24-Hour Captcha Verification */}
      {!isVerifiedSession && (
        <SplashAndCaptcha
          onVerificationComplete={() => {
            setIsVerifiedSession(true);
            setForceShowCaptcha(false);
          }}
          forceShowCaptcha={forceShowCaptcha}
          language={language}
        />
      )}

      {/* Ambient background light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-cyan-900/15 via-blue-900/10 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-4 py-2.5 rounded-2xl bg-[#09223a]/95 border border-cyan-400 text-cyan-200 text-xs font-bold shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm text-right">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col px-3.5 pt-3 pb-24 relative">
        {/* Top Header */}
        <Header
          unreadCount={unreadNotifsCount}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenMenu={() => setShowMenuModal(true)}
          onOpenSecurity={() => setShowAdminPanel(true)}
          language={language}
        />

        {/* View Switcher */}
        {activeTab === 'home' && (
          <main className="w-full flex flex-col gap-3 mt-2">
            {/* User Profile Banner */}
            <UserProfileBanner
              user={user}
              onEditProfile={() => setShowMenuModal(true)}
              language={language}
            />

            {/* Glowing Hero Balance Card */}
            <HeroBalanceCard
              balance={user.balance}
              todayEarnings={user.todayEarnings}
              onGoToTasks={() => setActiveTab('tasks')}
              onGoToWithdraw={() => setActiveTab('withdraw')}
              language={language}
            />

            {/* 4 Stats Cards Grid */}
            <StatsGrid
              balanceFormatted={balanceK}
              referralsCount={user.referralsCount}
              availableTasksCount={availableTasksCount}
              botStatusText={systemConfig.botMaintenance ? 'صيانة الإدارة' : undefined}
              onCardClick={(type) => {
                if (type === 'balance' || type === 'status') setActiveTab('withdraw');
                if (type === 'referrals') setActiveTab('referrals');
                if (type === 'tasks') setActiveTab('tasks');
              }}
              language={language}
            />

            {/* Action Cards List */}
            <EarningActionList
              availableTasksCount={availableTasksCount}
              onSelectAction={(tab) => setActiveTab(tab)}
              onViewAll={() => setActiveTab('tasks')}
              language={language}
            />
          </main>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onSubmitProof={handleSubmitProof}
            onBack={() => setActiveTab('home')}
            language={language}
          />
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <WithdrawView
            currentBalance={user.balance}
            transactions={transactions}
            minWithdrawal={systemConfig.minWithdrawal}
            onWithdrawSuccess={handleWithdrawSuccess}
            onBack={() => setActiveTab('home')}
            language={language}
          />
        )}

        {/* Referrals Tab - Top 10 Leaderboard & dynamic referralReward */}
        {activeTab === 'referrals' && (
          <ReferralsView
            user={user}
            referrals={referrals}
            referralReward={systemConfig.referralReward}
            onBack={() => setActiveTab('home')}
            language={language}
          />
        )}

        {/* Promo Code Tab */}
        {activeTab === 'promocode' && (
          <PromoCodeModal
            promoCodes={promoCodes}
            redeemedRecords={redeemedRecords}
            onRedeemSuccess={handleRedeemSuccess}
            onBack={() => setActiveTab('home')}
            language={language}
          />
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <SupportView
            tickets={tickets}
            onSubmitTicket={handleSubmitTicket}
            onBack={() => setActiveTab('home')}
            language={language}
          />
        )}
      </div>

      {/* Bottom Floating Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        tasksBadgeCount={availableTasksCount}
        language={language}
      />

      {/* Modals */}
      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          }}
          language={language}
        />
      )}

      {/* 3-Dots Menu & Settings Modal (Language, Bot Usage Guide, Day/Night Lighting) */}
      {showMenuModal && (
        <ThreeDotsMenuModal
          language={language}
          theme={theme}
          onLanguageChange={(lang) => {
            setLanguage(lang);
            try {
              localStorage.setItem('bot_syria_lang', lang);
            } catch (e) {
              console.error(e);
            }
            showToast(lang === 'ar' ? 'تم تحويل لغة البوت إلى العربية' : 'Language switched to English');
          }}
          onThemeChange={(newTheme) => {
            setTheme(newTheme);
            try {
              localStorage.setItem('bot_syria_theme', newTheme);
            } catch (e) {
              console.error(e);
            }
            showToast(newTheme === 'dark' ? 'تم تفعيل الوضع الليلي' : 'Day mode activated');
          }}
          onClose={() => setShowMenuModal(false)}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          tasks={tasks}
          transactions={transactions}
          tickets={tickets}
          promoCodes={promoCodes}
          user={user}
          systemConfig={systemConfig}
          onApproveProof={handleAdminApproveProof}
          onRejectProof={handleAdminRejectProof}
          onApproveWithdrawal={handleApproveWithdrawal}
          onRejectWithdrawal={handleRejectWithdrawal}
          onReplyTicket={handleReplyTicket}
          onDeleteTicket={handleDeleteTicket}
          onUpdateSystemConfig={handleUpdateSystemConfig}
          onSendNotification={handleSendNotification}
          onCreditUserById={handleCreditUserById}
          onCreatePromoCode={handleCreatePromoCode}
          onDeletePromoCode={handleDeletePromoCode}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onClose={() => setShowAdminPanel(false)}
          language={language}
        />
      )}
    </div>
  );
}
