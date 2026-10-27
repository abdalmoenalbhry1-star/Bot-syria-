import {
  UserProfile,
  TaskItem,
  WithdrawalMethod,
  WithdrawalTransaction,
  NotificationItem,
  ReferralUser,
  SupportTicket,
  PromoCodeItem,
  SystemConfig,
} from '../types/index.ts';

export const INITIAL_USER: UserProfile = {
  name: 'عبد المعين البحري',
  id: '8419854444',
  telegramUsername: 'abdalmoen_bh',
  balance: 25000,
  todayEarnings: 2500,
  referralsCount: 0,
  referralsEarned: 0,
  referralCode: 'SYR-8419',
  isVerified: true,
  city: 'دمشق',
};

// All fake tasks removed as requested ("شيل كل المهام الوهمية انا بحط لاعاد انت تحط")
export const INITIAL_TASKS: TaskItem[] = [];

// Only Syriatel Cash and Sham Cash as requested ("خلي طريقتين للسحب شام كاش وسيرياتيل كاش")
export const WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  {
    id: 'syriatel_cash',
    name: 'سيريتل كاش (Syriatel Cash)',
    nameEn: 'Syriatel Cash',
    icon: 'smartphone',
    minAmount: 10000,
    feePercentage: 0,
    accountPlaceholder: 'رقم سيريتل كاش (مثال: 0988123456)',
    accountLabel: 'رقم هاتف حساب سيريتل كاش',
    note: 'تحويل فوري ومباشر إلى حساب سيريتل كاش خلال دقائق بدون أي عمولات.',
    badge: 'سحب فوري',
  },
  {
    id: 'sham_cash',
    name: 'شام كاش (Sham Cash)',
    nameEn: 'Sham Cash',
    icon: 'wallet',
    minAmount: 10000,
    feePercentage: 0,
    accountPlaceholder: 'رقم المحفظة أو الموبايل (مثال: SHAM-789012 أو 09xxxxxxxx)',
    accountLabel: 'رقم حساب أو محفظة شام كاش',
    note: 'تحويل مباشر وسلس بدون رسوم إضافية عبر محفظة شام كاش السورية.',
    badge: 'عمولة 0%',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'مرحباً بك في بوت سوريا 🇸🇾',
    message: 'تم تفعيل حسابك بنجاح. أهلاً بك في منصة الربح والمهام اليومية.',
    date: 'الآن',
    read: false,
    type: 'system',
  },
];

// Fake transactions removed as requested ("تشيل السحب الوهمي الي انت حاطوا")
export const INITIAL_TRANSACTIONS: WithdrawalTransaction[] = [];

// Fake referrals removed as requested ("شيلل كل الاحالات الوهمية")
export const INITIAL_REFERRALS: ReferralUser[] = [];

// Fake promo codes removed as requested ("شيل كل الأكواد الوهمية")
export const INITIAL_PROMO_CODES: PromoCodeItem[] = [];

// Initial support tickets list
export const INITIAL_TICKETS: SupportTicket[] = [];

// Initial system configuration
export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  botMaintenance: false,
  minWithdrawal: 10000,
  referralReward: 1500,
  adminId: '8419854444',
  maintenanceMessage: 'البوت في حالة صيانة وتحديث دوري لتحسين الأداء وتأمين التحويلات. سنعود للعمل قريباً!',
};
