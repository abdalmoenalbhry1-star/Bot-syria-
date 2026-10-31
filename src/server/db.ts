import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

export interface DbTaskSubmission {
  id: string;
  user_id: string;
  user_name: string;
  task_id: string;
  task_title: string;
  reward: number;
  proof_image: string;
  proof_note: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: number;
  reviewed_at: number | null;
  rejection_reason: string | null;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'database.sqlite');
let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Failed to read existing DB file, creating a fresh instance:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  initSchema(dbInstance);
  saveDb();
  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      telegram_username TEXT,
      balance INTEGER NOT NULL DEFAULT 0,
      today_earnings INTEGER NOT NULL DEFAULT 0,
      referrals_count INTEGER NOT NULL DEFAULT 0,
      referrals_earned INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT,
      referred_by TEXT,
      is_verified INTEGER NOT NULL DEFAULT 1,
      city TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      reward INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'telegram',
      icon TEXT NOT NULL DEFAULT 'telegram',
      action_url TEXT,
      seats_left INTEGER NOT NULL,
      total_seats INTEGER NOT NULL,
      badge TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      task_id TEXT NOT NULL,
      task_title TEXT NOT NULL,
      reward INTEGER NOT NULL,
      proof_image TEXT NOT NULL,
      proof_note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      reviewed_at INTEGER,
      rejection_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS reward_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reference_id TEXT,
      description TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      method TEXT NOT NULL,
      account_number TEXT NOT NULL,
      full_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      reviewed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default admin and sample tasks if empty
  seedInitialData(db);
}

function seedInitialData(db: Database) {
  // Check tasks
  const taskCountRes = db.exec('SELECT COUNT(*) as cnt FROM tasks;');
  const taskCount = taskCountRes[0]?.values[0]?.[0] as number || 0;

  if (taskCount === 0) {
    const initialTasks = [
      {
        id: 'task-tg-1',
        title: 'الاشتراك في قناة بوت سوريا الرسمية',
        description: 'انضم للقناة الرسمية على تلغرام وابقَ مطلعاً على أحدث الأخبار وإثباتات السحب.',
        reward: 2500,
        category: 'telegram',
        icon: 'telegram',
        action_url: 'https://t.me/BotSyria_Official',
        seats_left: 450,
        total_seats: 500,
        badge: 'مهمة مميزة',
        status: 'available',
        created_at: Date.now(),
      },
      {
        id: 'task-tg-2',
        title: 'متابعة قناة إثباتات السحب والتحويلات',
        description: 'اشترك في قناة نشر إشعارات دفع سيريتل كاش وشام كاش الفورية للمشتركين.',
        reward: 1500,
        category: 'telegram',
        icon: 'telegram',
        action_url: 'https://t.me/BotSyria_Proofs',
        seats_left: 280,
        total_seats: 300,
        badge: 'سريعة ومضمونة',
        status: 'available',
        created_at: Date.now(),
      },
      {
        id: 'task-tg-3',
        title: 'التفاعل مع منشور المسابقة الكبرى بالليرات',
        description: 'ضع تفاعل على المنشور المثبت في القناة وارفع لقطة شاشة توضح تفاعلك.',
        reward: 1000,
        category: 'daily',
        icon: 'star',
        action_url: 'https://t.me/BotSyria_Official',
        seats_left: 190,
        total_seats: 200,
        badge: 'يومي',
        status: 'available',
        created_at: Date.now(),
      },
    ];

    for (const t of initialTasks) {
      db.run(
        `INSERT INTO tasks (id, title, description, reward, category, icon, action_url, seats_left, total_seats, badge, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.title, t.description, t.reward, t.category, t.icon, t.action_url, t.seats_left, t.total_seats, t.badge, t.status, t.created_at]
      );
    }
  }

  // Ensure default admin user exists
  const adminRes = db.exec("SELECT COUNT(*) as cnt FROM users WHERE id = '8419854444';");
  const adminExists = (adminRes[0]?.values[0]?.[0] as number) > 0;
  if (!adminExists) {
    db.run(
      `INSERT INTO users (id, name, telegram_username, balance, today_earnings, referrals_count, referrals_earned, referral_code, is_verified, city, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['8419854444', 'عبد المعين البحري (المدير)', 'abdalmoen_bh', 25000, 2500, 0, 0, 'SYR-8419', 1, 'دمشق', Date.now()]
    );
  }
}

// ----------------- Task Submissions Queries -----------------

export async function getAllSubmissions(status?: string): Promise<DbTaskSubmission[]> {
  const db = await getDb();
  let query = 'SELECT * FROM task_submissions';
  const params: any[] = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  if (params.length > 0) stmt.bind(params);

  const results: DbTaskSubmission[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as DbTaskSubmission);
  }
  stmt.free();
  return results;
}

export async function getUserSubmissions(userId: string): Promise<DbTaskSubmission[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM task_submissions WHERE user_id = ? ORDER BY created_at DESC');
  stmt.bind([userId]);

  const results: DbTaskSubmission[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as DbTaskSubmission);
  }
  stmt.free();
  return results;
}

export async function createSubmission(data: {
  userId: string;
  userName?: string;
  taskId: string;
  taskTitle: string;
  reward: number;
  proofImage: string;
  proofNote?: string;
}): Promise<DbTaskSubmission> {
  const db = await getDb();
  const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  db.run(
    `INSERT INTO task_submissions (id, user_id, user_name, task_id, task_title, reward, proof_image, proof_note, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      id,
      data.userId,
      data.userName || `مستخدم ${data.userId}`,
      data.taskId,
      data.taskTitle,
      data.reward,
      data.proofImage,
      data.proofNote || '',
      now,
    ]
  );

  saveDb();

  return {
    id,
    user_id: data.userId,
    user_name: data.userName || `مستخدم ${data.userId}`,
    task_id: data.taskId,
    task_title: data.taskTitle,
    reward: data.reward,
    proof_image: data.proofImage,
    proof_note: data.proofNote || '',
    status: 'pending',
    created_at: now,
    reviewed_at: null,
    rejection_reason: null,
  };
}

export async function getSubmissionById(id: string): Promise<DbTaskSubmission | null> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM task_submissions WHERE id = ? LIMIT 1');
  stmt.bind([id]);

  let result: DbTaskSubmission | null = null;
  if (stmt.step()) {
    result = stmt.getAsObject() as unknown as DbTaskSubmission;
  }
  stmt.free();
  return result;
}

export async function getAllTasks(): Promise<any[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id,
      title: row.title,
      description: row.description,
      reward: row.reward,
      category: row.category,
      icon: row.icon,
      actionUrl: row.action_url,
      seatsLeft: row.seats_left,
      totalSeats: row.total_seats,
      badge: row.badge,
      status: row.status,
    });
  }
  stmt.free();
  return results;
}
