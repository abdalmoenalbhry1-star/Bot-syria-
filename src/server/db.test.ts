import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDb,
  createSubmission,
  getAllSubmissions,
  getUserSubmissions,
  getSubmissionById,
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
