/**
 * Business rules and validation helpers for BOT SYRIA
 */
import { PromoCodeItem } from '../types/index.ts';

export const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function isExpiredAfter6Hours(timestamp?: number): boolean {
  if (!timestamp) return false;
  return Date.now() - timestamp > SIX_HOURS_MS;
}

export function getRemainingTimeString(timestamp?: number): string {
  if (!timestamp) return '';
  const elapsed = Date.now() - timestamp;
  const remaining = SIX_HOURS_MS - elapsed;
  if (remaining <= 0) return 'منتهية الصلاحية';
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return `يختفي خلال ${hours} س و ${minutes} د`;
}

export function validateDynamicPromoCode(
  inputCode: string,
  promoCodes: PromoCodeItem[],
  alreadyRedeemedCodes: string[]
): { valid: boolean; reward: number; message: string; promoItem?: PromoCodeItem } {
  const normalized = inputCode.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, reward: 0, message: 'يرجى إدخال كود الهدية أولاً' };
  }

  if (alreadyRedeemedCodes.includes(normalized)) {
    return { valid: false, reward: 0, message: 'لقد استخدمت هذا الكود الترويجي مسبقاً!' };
  }

  const found = promoCodes.find((p) => p.code.toUpperCase() === normalized);
  if (!found) {
    return { valid: false, reward: 0, message: 'كود غير صحيح أو لم يتم إنشاؤه من الإدارة بعد' };
  }

  if (found.isRedeemed && isExpiredAfter6Hours(found.redeemedAt)) {
    return { valid: false, reward: 0, message: 'انتهت صلاحية هذا الكود (أكثر من 6 ساعات)' };
  }

  // Check max allowed users limit
  if (found.maxUses !== undefined && found.maxUses > 0 && (found.usedCount || 0) >= found.maxUses) {
    return {
      valid: false,
      reward: 0,
      message: `عذراً! اكتمل الحد الأقصى للمستفيدين (${found.maxUses} أشخاص) وانتهت مقاعد هذا الكود الترويجي`,
    };
  }

  return {
    valid: true,
    reward: found.reward,
    message: `تهانينا! تم تفعيل الكود بنجاح وحصلت على ${found.reward.toLocaleString('en-US')} ل.س`,
    promoItem: found,
  };
}

export function validateWithdrawalRequest(params: {
  amount: number;
  currentBalance: number;
  minAmount: number;
  accountNumber: string;
  provider: 'syriatel_cash' | 'sham_cash';
}): { valid: boolean; error?: string; fee: number; netAmount: number } {
  const { amount, currentBalance, minAmount, accountNumber, provider } = params;

  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'يرجى إدخال مبلغ سحب صالح', fee: 0, netAmount: 0 };
  }

  if (amount < minAmount) {
    return {
      valid: false,
      error: `الحد الأدنى للسحب هو ${minAmount.toLocaleString('en-US')} ل.س`,
      fee: 0,
      netAmount: 0,
    };
  }

  if (amount > currentBalance) {
    return {
      valid: false,
      error: 'رصيدك الحالي غير كافٍ لإتمام عملية السحب هذه',
      fee: 0,
      netAmount: 0,
    };
  }

  const cleanAcc = accountNumber.trim();
  if (!cleanAcc) {
    return { valid: false, error: 'يرجى إدخال رقم الحساب أو الهاتف لاستلام الحوالة', fee: 0, netAmount: 0 };
  }

  // Syrian phone validation for Syriatel Cash
  if (provider === 'syriatel_cash') {
    const phoneDigits = cleanAcc.replace(/\s+/g, '');
    if (!/^09\d{8}$/.test(phoneDigits)) {
      return {
        valid: false,
        error: 'يرجى إدخال رقم هاتف سيريتل كاش صحيح مكون من 10 أرقام (مثال: 0988123456)',
        fee: 0,
        netAmount: 0,
      };
    }
  }

  // Sham Cash validation: phone number or account number starting with SHAM
  if (provider === 'sham_cash') {
    const clean = cleanAcc.replace(/\s+/g, '');
    const isPhone = /^09\d{8}$/.test(clean);
    const isShamId = /^SHAM[-_]?\w+$/i.test(clean) || clean.length >= 6;
    if (!isPhone && !isShamId) {
      return {
        valid: false,
        error: 'يرجى إدخال رقم حساب شام كاش صحيح (مثال: SHAM-123456 أو رقم الموبايل 09xxxxxxxx)',
        fee: 0,
        netAmount: 0,
      };
    }
  }

  // 0% fees on Syriatel Cash / Sham Cash promotion
  const fee = 0;
  const netAmount = amount - fee;

  return { valid: true, fee, netAmount };
}

export function formatSyrianPound(amount: number): string {
  return `${amount.toLocaleString('en-US')} ل.س`;
}

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function isCaptchaRequired(lastVerifiedTimestamp?: number | null): boolean {
  if (!lastVerifiedTimestamp) return true;
  return Date.now() - lastVerifiedTimestamp > TWENTY_FOUR_HOURS_MS;
}

export function getCaptchaRemainingTime(lastVerifiedTimestamp?: number | null): string {
  if (!lastVerifiedTimestamp) return 'مطلوب التحقق الآن';
  const elapsed = Date.now() - lastVerifiedTimestamp;
  const remaining = TWENTY_FOUR_HOURS_MS - elapsed;
  if (remaining <= 0) return 'منتهي الصلاحية - مطلوب التحقق';
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return `صالح لمدة ${hours} س و ${minutes} د`;
}

export function isManagerAuthorized(userId: string, adminId = '8419854444'): boolean {
  return userId.trim() === adminId.trim();
}

export function calculateReferralBonus(referralsCount: number, rewardPerInvite = 1500): number {
  return referralsCount * rewardPerInvite;
}

export function calculateVerifiedReferrals(
  referrals: Array<{ bonus: number; captchaVerified?: boolean }>,
  currentRewardPerInvite: number
) {
  let verifiedCount = 0;
  let pendingCount = 0;
  let verifiedEarnings = 0;
  let pendingEarnings = 0;

  for (const ref of referrals) {
    const reward = ref.bonus || currentRewardPerInvite;
    if (ref.captchaVerified) {
      verifiedCount++;
      verifiedEarnings += reward;
    } else {
      pendingCount++;
      pendingEarnings += reward;
    }
  }

  return { verifiedCount, pendingCount, verifiedEarnings, pendingEarnings };
}
