import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getDb,
  getAllSubmissions,
  getUserSubmissions,
  createSubmission,
  getAllTasks,
  approveTaskSubmission,
  rejectTaskSubmission,
  getUserBalance,
  getRewardLedger,
} from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '201000';
const ADMIN_ID = process.env.ADMIN_ID || '8419854444';

async function startServer() {
  const app = express();

  // Parse JSON payloads (support base64 proof images up to 10MB)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize SQLite database
  await getDb();

  // API Routes

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'BOT SYRIA API',
      database: 'SQLite (sql.js)',
      timestamp: Date.now(),
    });
  });

  // Get all tasks from database
  app.get('/api/tasks', async (_req: Request, res: Response) => {
    try {
      const tasks = await getAllTasks();
      res.json({ success: true, tasks });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
    }
  });

  // Submit a task proof from user
  app.post('/api/tasks/submit-proof', async (req: Request, res: Response) => {
    try {
      const { userId, userName, taskId, taskTitle, reward, proofImage, proofNote } = req.body;

      if (!userId || !taskId || !proofImage) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, taskId, or proofImage',
        });
      }

      const submission = await createSubmission({
        userId: String(userId),
        userName: userName ? String(userName) : undefined,
        taskId: String(taskId),
        taskTitle: String(taskTitle || 'مهمة رسمية'),
        reward: Number(reward) || 1500,
        proofImage: String(proofImage),
        proofNote: proofNote ? String(proofNote) : '',
      });

      res.status(201).json({
        success: true,
        message: 'تم إرسال الإثبات بنجاح وهو قيد مراجعة الإدارة',
        submission,
      });
    } catch (err) {
      console.error('Error submitting task proof:', err);
      res.status(500).json({ success: false, error: 'Failed to save submission' });
    }
  });

  // Get submissions for a specific user
  app.get('/api/tasks/user-submissions', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
      }

      const submissions = await getUserSubmissions(userId);
      res.json({ success: true, submissions });
    } catch (err) {
      console.error('Error fetching user submissions:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
    }
  });

  // Admin middleware helper
  const verifyAdmin = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers['x-admin-password'] || req.headers['authorization'];
    const queryPass = req.query.admin_password as string;

    const provided = (authHeader || queryPass || '')
      .toString()
      .replace('Bearer ', '')
      .trim();

    if (provided === ADMIN_PASSWORD) {
      return next();
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required',
    });
  };

  // Get all real task submissions for admin panel
  app.get('/api/admin/submissions', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const submissions = await getAllSubmissions(status);

      res.json({
        success: true,
        count: submissions.length,
        submissions: submissions.map((s) => ({
          id: s.id,
          userId: s.user_id,
          userName: s.user_name || `المستخدم [${s.user_id}]`,
          taskId: s.task_id,
          taskTitle: s.task_title,
          reward: s.reward,
          proofImage: s.proof_image,
          proofNote: s.proof_note,
          status: s.status,
          createdAt: s.created_at,
          reviewedAt: s.reviewed_at,
          rejectionReason: s.rejection_reason,
        })),
      });
    } catch (err) {
      console.error('Error fetching admin submissions:', err);
      res.status(500).json({ success: false, error: 'Failed to load task submissions' });
    }
  });

  // Admin approve task submission (Phase 2)
  app.post('/api/admin/submissions/:id/approve', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const submissionId = req.params.id;
      const adminUserId = (req.body.adminId || req.headers['x-admin-id'] || ADMIN_ID).toString();

      const result = await approveTaskSubmission(submissionId, adminUserId);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'تعذر اعتماد الإثبات',
        });
      }

      res.json({
        success: true,
        message: 'تم اعتماد الإثبات وصرف المكافأة بنجاح في قاعدة البيانات',
        creditedAmount: result.creditedAmount,
        newBalance: result.newBalance,
        userId: result.userId,
        submission: result.submission,
      });
    } catch (err: any) {
      console.error('Error approving submission:', err);
      res.status(500).json({ success: false, error: 'حدث خطأ في الخادم أثناء اعتماد الإثبات' });
    }
  });

  // Admin reject task submission (Phase 2)
  app.post('/api/admin/submissions/:id/reject', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const submissionId = req.params.id;
      const reason = req.body.reason ? String(req.body.reason) : 'الصورة غير واضحة أو لم يتم استيفاء شروط المهمة';

      const result = await rejectTaskSubmission(submissionId, reason);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'تعذر رفض الإثبات',
        });
      }

      res.json({
        success: true,
        message: 'تم رفض الإثبات وحفظ سبب الرفض بنجاح',
        submission: result.submission,
      });
    } catch (err: any) {
      console.error('Error rejecting submission:', err);
      res.status(500).json({ success: false, error: 'حدث خطأ في الخادم أثناء رفض الإثبات' });
    }
  });

  // Get user balance directly from database
  app.get('/api/user/balance', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
      }

      const bal = await getUserBalance(userId);
      res.json({
        success: true,
        userId,
        balance: bal?.balance || 0,
        todayEarnings: bal?.todayEarnings || 0,
      });
    } catch (err) {
      console.error('Error fetching user balance:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch balance' });
    }
  });

  // Get reward ledger (audit trail)
  app.get('/api/admin/ledger', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const ledger = await getRewardLedger(userId);
      res.json({ success: true, count: ledger.length, ledger });
    } catch (err) {
      console.error('Error fetching reward ledger:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch ledger' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOT SYRIA Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[BOT SYRIA Server] Fatal startup error:', err);
  process.exit(1);
});
