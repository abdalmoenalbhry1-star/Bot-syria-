import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDb,
  createSubmission,
  getAllSubmissions,
  getUserSubmissions,
  getSubmissionById,
  approveTaskSubmission,
  rejectTaskSubmission,
  getUserBalance,
  getRewardLedger,
} from './db.ts';

test('Database creates and persists task submissions', async () => {
  const db = await getDb();
  assert.ok(db, 'Database instance should be initialized');

  const testUserId = `user-${Date.now()}`;
  const submission = await createSubmission({
    userId: testUserId,
    userName: 'المشترك السوري',
    taskId: 'task-tg-1',
    taskTitle: 'الاشتراك في قناة بوت سوريا',
    reward: 2500,
    proofImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    proofNote: 'تم الاشتراك بنجاح وهذا إثبات الشاشة',
  });

  assert.ok(submission.id, 'Submission must have a generated ID');
  assert.equal(submission.user_id, testUserId);
  assert.equal(submission.reward, 2500);
  assert.equal(submission.status, 'pending');
  assert.equal(submission.proof_note, 'تم الاشتراك بنجاح وهذا إثبات الشاشة');

  // Verify retrieval
  const retrieved = await getSubmissionById(submission.id);
  assert.ok(retrieved, 'Submission must be retrievable by ID');
  assert.equal(retrieved?.user_id, testUserId);
  assert.equal(retrieved?.task_title, 'الاشتراك في قناة بوت سوريا');

  // Verify user submissions
  const userSubs = await getUserSubmissions(testUserId);
  assert.equal(userSubs.length, 1);
  assert.equal(userSubs[0].id, submission.id);

  // Verify admin pending filter
  const allPending = await getAllSubmissions('pending');
  const found = allPending.find((s) => s.id === submission.id);
  assert.ok(found, 'New submission must appear in pending submissions list');
});

test('Phase 2: Task approval credits user balance and records in reward_ledger', async () => {
  const testUserId = `user-p2-${Date.now()}`;
  const submission = await createSubmission({
    userId: testUserId,
    userName: 'المستخدم الفائز',
    taskId: 'task-tg-1',
    taskTitle: 'الاشتراك في قناة بوت سوريا الرسمية',
    reward: 2500,
    proofImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    proofNote: 'تم التنفيذ والمتابعة',
  });

  // Approve submission
  const approveResult = await approveTaskSubmission(submission.id, '8419854444');
  assert.equal(approveResult.success, true, 'Approval should succeed');
  assert.equal(approveResult.creditedAmount, 2500, 'Should credit authoritative task reward');

  // Verify user balance updated in SQLite
  const userBal = await getUserBalance(testUserId);
  assert.ok(userBal, 'User should have a record in users table');
  assert.equal(userBal.balance, 2500, 'Balance must equal credited reward');
  assert.equal(userBal.todayEarnings, 2500, 'Today earnings must equal credited reward');

  // Verify reward ledger record
  const ledger = await getRewardLedger(testUserId);
  assert.equal(ledger.length, 1, 'There should be exactly 1 reward ledger entry');
  assert.equal(ledger[0].amount, 2500);
  assert.equal(ledger[0].reference_id, submission.id);
  assert.equal(ledger[0].type, 'task_reward');

  // Verify submission status changed to approved
  const updatedSub = await getSubmissionById(submission.id);
  assert.equal(updatedSub?.status, 'approved');
  assert.ok(updatedSub?.reviewed_at, 'Reviewed at timestamp must be set');
});

test('Phase 2: Prevents duplicate rewards even if approval request repeats', async () => {
  const testUserId = `user-dup-${Date.now()}`;
  const submission = await createSubmission({
    userId: testUserId,
    userName: 'مستخدم محاولة التكرار',
    taskId: 'task-tg-1',
    taskTitle: 'الاشتراك في قناة بوت سوريا الرسمية',
    reward: 2500,
    proofImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  });

  // First approval
  const firstApproval = await approveTaskSubmission(submission.id, '8419854444');
  assert.equal(firstApproval.success, true);
  const balanceAfterFirst = firstApproval.newBalance;

  // Second approval attempt (Duplicate)
  const duplicateApproval = await approveTaskSubmission(submission.id, '8419854444');
  assert.equal(duplicateApproval.success, false, 'Duplicate approval must fail');
  assert.match(duplicateApproval.error || '', /مسبقاً/, 'Error message must state already processed');

  // Verify balance did not change on duplicate attempt
  const bal = await getUserBalance(testUserId);
  assert.equal(bal?.balance, balanceAfterFirst, 'Balance must remain unchanged after duplicate attempt');

  // Verify exactly 1 ledger record exists
  const ledger = await getRewardLedger(testUserId);
  assert.equal(ledger.length, 1, 'Must not create a duplicate ledger entry');
});

test('Phase 2: Task rejection records reason and restores task seats', async () => {
  const testUserId = `user-rej-${Date.now()}`;
  const submission = await createSubmission({
    userId: testUserId,
    userName: 'مستخدم مرفوض',
    taskId: 'task-tg-1',
    taskTitle: 'الاشتراك في قناة بوت سوريا الرسمية',
    reward: 2500,
    proofImage: 'data:image/png;base64,invalid',
    proofNote: 'صورة غير واضحة',
  });

  const rejectionReason = 'لقطة الشاشة لا تظهر الاشتراك في القناة';
  const rejectResult = await rejectTaskSubmission(submission.id, rejectionReason);
  assert.equal(rejectResult.success, true, 'Rejection should succeed');

  const updatedSub = await getSubmissionById(submission.id);
  assert.equal(updatedSub?.status, 'rejected');
  assert.equal(updatedSub?.rejection_reason, rejectionReason);

  // Verify no balance was credited
  const bal = await getUserBalance(testUserId);
  assert.equal(bal?.balance || 0, 0, 'No balance should be credited for rejected submission');

  // Attempting to approve after rejection must fail
  const approveAfterReject = await approveTaskSubmission(submission.id, '8419854444');
  assert.equal(approveAfterReject.success, false, 'Cannot approve an already rejected submission');
});

test('Phase 2: Security check blocks admin from self-approving own submission', async () => {
  const adminId = '8419854444';
  const submission = await createSubmission({
    userId: adminId,
    userName: 'المدير نفسه',
    taskId: 'task-tg-1',
    taskTitle: 'الاشتراك في قناة بوت سوريا',
    reward: 2500,
    proofImage: 'data:image/png;base64,valid',
  });

  const selfApprove = await approveTaskSubmission(submission.id, adminId);
  assert.equal(selfApprove.success, false, 'Self-approval must be blocked');
  assert.match(selfApprove.error || '', /لا يمكن للمدير/);
});

test('Phase 2: Server uses authoritative task reward instead of untrusted client reward', async () => {
  const testUserId = `user-spoof-${Date.now()}`;
  // Client attempts to spoof 9999999 SYP reward
  const spoofedSubmission = await createSubmission({
    userId: testUserId,
    userName: 'مستخدم محاولة تزييف المبلغ',
    taskId: 'task-tg-1', // task-tg-1 has actual reward 2500 in tasks table
    taskTitle: 'الاشتراك في قناة بوت سوريا الرسمية',
    reward: 9999999, // FAKE client reward
    proofImage: 'data:image/png;base64,valid',
  });

  const result = await approveTaskSubmission(spoofedSubmission.id, '8419854444');
  assert.equal(result.success, true);
  // Authoritative reward must be 2500, NOT 9999999
  assert.equal(result.creditedAmount, 2500, 'Server must enforce authoritative task reward');

  const bal = await getUserBalance(testUserId);
  assert.equal(bal?.balance, 2500, 'Server must credit only the authoritative reward');
});
