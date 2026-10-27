import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDynamicPromoCode,
  validateWithdrawalRequest,
  formatSyrianPound,
  calculateReferralBonus,
  isExpiredAfter6Hours,
  SIX_HOURS_MS,
  isCaptchaRequired,
  isManagerAuthorized,
  calculateVerifiedReferrals,
  TWENTY_FOUR_HOURS_MS,
} from './rules.ts';
import { PromoCodeItem } from '../types/index.ts';

test('validateDynamicPromoCode accepts admin created valid promo codes', () => {
  const promoCodes: PromoCodeItem[] = [
    { id: '1', code: 'SYRIA2026', reward: 5000, maxUses: 50, usedCount: 0, createdAt: Date.now() },
  ];
  const result = validateDynamicPromoCode('SYRIA2026', promoCodes, []);
  assert.equal(result.valid, true);
  assert.equal(result.reward, 5000);
});

test('validateDynamicPromoCode is case-insensitive and trims whitespace', () => {
  const promoCodes: PromoCodeItem[] = [
    { id: '1', code: 'SHAM5K', reward: 5000, maxUses: 50, usedCount: 0, createdAt: Date.now() },
  ];
  const result = validateDynamicPromoCode('  sham5k  ', promoCodes, []);
  assert.equal(result.valid, true);
  assert.equal(result.reward, 5000);
});

test('validateDynamicPromoCode rejects duplicate usage', () => {
  const promoCodes: PromoCodeItem[] = [
    { id: '1', code: 'BONUS10', reward: 10000, maxUses: 50, usedCount: 0, createdAt: Date.now() },
  ];
  const result = validateDynamicPromoCode('BONUS10', promoCodes, ['BONUS10']);
  assert.equal(result.valid, false);
  assert.match(result.message, /مسبقاً/);
});

test('validateDynamicPromoCode rejects when max users limit reached', () => {
  const promoCodes: PromoCodeItem[] = [
    { id: '1', code: 'LIMITED', reward: 1000, maxUses: 5, usedCount: 5, createdAt: Date.now() },
  ];
  const result = validateDynamicPromoCode('LIMITED', promoCodes, []);
  assert.equal(result.valid, false);
  assert.match(result.message, /اكتمل الحد الأقصى للمستفيدين/);
});

test('isExpiredAfter6Hours calculates expiry properly', () => {
  const sevenHoursAgo = Date.now() - 7 * 60 * 60 * 1000;
  const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;
  assert.equal(isExpiredAfter6Hours(sevenHoursAgo), true);
  assert.equal(isExpiredAfter6Hours(oneHourAgo), false);
});

test('validateWithdrawalRequest checks minimum amount', () => {
  const result = validateWithdrawalRequest({
    amount: 5000,
    currentBalance: 25000,
    minAmount: 10000,
    accountNumber: '0988123456',
    provider: 'syriatel_cash',
  });
  assert.equal(result.valid, false);
  assert.match(result.error!, /الحد الأدنى/);
});

test('validateWithdrawalRequest checks valid Syrian phone number for Syriatel Cash', () => {
  const invalidPhone = validateWithdrawalRequest({
    amount: 15000,
    currentBalance: 25000,
    minAmount: 10000,
    accountNumber: '12345',
    provider: 'syriatel_cash',
  });
  assert.equal(invalidPhone.valid, false);

  const validPhone = validateWithdrawalRequest({
    amount: 15000,
    currentBalance: 25000,
    minAmount: 10000,
    accountNumber: '0933123456',
    provider: 'syriatel_cash',
  });
  assert.equal(validPhone.valid, true);
  assert.equal(validPhone.netAmount, 15000);
});

test('formatSyrianPound outputs formatted currency string', () => {
  assert.equal(formatSyrianPound(25000), '25,000 ل.س');
});

test('isCaptchaRequired verifies 24-hour expiration rule', () => {
  assert.equal(isCaptchaRequired(null), true);
  assert.equal(isCaptchaRequired(undefined), true);

  const twentyFiveHoursAgo = Date.now() - (TWENTY_FOUR_HOURS_MS + 3600000);
  const twoHoursAgo = Date.now() - 2 * 3600000;

  assert.equal(isCaptchaRequired(twentyFiveHoursAgo), true);
  assert.equal(isCaptchaRequired(twoHoursAgo), false);
});

test('isManagerAuthorized strictly allows only manager ID 8419854444', () => {
  assert.equal(isManagerAuthorized('8419854444'), true);
  assert.equal(isManagerAuthorized('  8419854444  '), true);
  assert.equal(isManagerAuthorized('1092834712'), false);
  assert.equal(isManagerAuthorized('9999999999'), false);
});

test('calculateVerifiedReferrals credits only captcha-verified referrals', () => {
  const mockRefs = [
    { bonus: 5000, captchaVerified: true },
    { bonus: 5000, captchaVerified: false },
    { bonus: 5000, captchaVerified: true },
  ];
  const stats = calculateVerifiedReferrals(mockRefs, 5000);
  assert.equal(stats.verifiedCount, 2);
  assert.equal(stats.pendingCount, 1);
  assert.equal(stats.verifiedEarnings, 10000);
  assert.equal(stats.pendingEarnings, 5000);
});
