export type TabType = 'home' | 'tasks' | 'referrals' | 'withdraw' | 'support' | 'promocode';

export interface UserProfile {
  name: string;
  id: string;
  telegramUsername?: string;
  balance: number; // In Syrian Pounds (ل.س)
  todayEarnings: number;
  referralsCount: number;
  referralsEarned: number;
  referralCode: string;
  isVerified: boolean;
  avatarUrl?: string;
  city?: string;
}

export type TaskStatus = 'available' | 'pending_review' | 'approved' | 'rejected';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  reward: number; // SYP
  category: 'telegram' | 'daily' | 'quiz' | 'partner';
  icon: string;
  actionUrl?: string;
  status: TaskStatus;
  isCompleted?: boolean;
  badge?: string;
  seatsLeft: number;
  totalSeats: number;
  proofImage?: string;
  proofNote?: string;
  submittedAt?: string;
  rejectionReason?: string;
  approvedAt?: number; // timestamp in ms; expires after 6 hours from approval
}

export interface TaskSubmission {
  id: string;
  userId: string;
  userName?: string;
  taskId: string;
  taskTitle: string;
  reward: number;
  proofImage: string;
  proofNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number | null;
  rejectionReason?: string | null;
}

export type PaymentProvider = 'syriatel_cash' | 'sham_cash';

export interface WithdrawalMethod {
  id: PaymentProvider;
  name: string;
  nameEn: string;
  icon: string;
  minAmount: number;
  feePercentage: number;
  accountPlaceholder: string;
  accountLabel: string;
  note: string;
  badge?: string;
}

export interface WithdrawalTransaction {
  id: string;
  amount: number;
  method: PaymentProvider;
  accountNumber: string;
  fullName: string;
  date: string;
  status: 'pending' | 'completed' | 'processing';
  referenceNumber: string;
  createdAt: number;
  approvedAt?: number; // timestamp in ms; disappears 6 hours after approval
}

export interface SupportTicket {
  id: string;
  userId: string;
  phone: string;
  complaint: string;
  imageUrl?: string;
  createdAt: number;
  status: 'pending' | 'replied';
  replyText?: string;
  repliedAt?: number; // timestamp in ms; disappears 6 hours after reply
}

export interface PromoCodeItem {
  id: string;
  code: string;
  reward: number;
  maxUses: number; // كم شخص يمكنه تنفيذ واستخدام هذا الكود
  usedCount: number; // كم شخص استخدم الكود حتى الآن
  claimedUserIds?: string[];
  createdAt: number;
  redeemedAt?: number; // timestamp in ms when redeemed; disappears 6 hours after redemption
  isRedeemed?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'bonus' | 'payout' | 'task' | 'system';
}

export interface ReferralUser {
  id: string;
  name: string;
  date: string;
  bonus: number;
  status: 'active' | 'pending';
  captchaVerified?: boolean;
}

export type AppLanguage = 'ar' | 'en';
export type AppTheme = 'dark' | 'light';

export interface SystemConfig {
  botMaintenance: boolean;
  minWithdrawal: number;
  referralReward: number;
  adminId: string;
  maintenanceMessage: string;
}
