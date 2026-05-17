/**
 * V4 SQLite Schema — 离线优先数据层
 * 表结构定义（类 Drizzle 风格）
 */

export const TABLES = {
  family_members: 'family_members',
  babies: 'babies',
  tasks: 'tasks',
  checkins: 'checkins',
  achievements: 'achievements',
  points: 'points',
  change_log: 'change_log',
}

// Schema definitions
export const SCHEMA = {
  [TABLES.family_members]: `
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      isOwner INTEGER DEFAULT 0,
      isEncrypted INTEGER DEFAULT 0
    )
  `,

  [TABLES.babies]: `
    CREATE TABLE IF NOT EXISTS babies (
      id TEXT PRIMARY KEY,
      memberId TEXT NOT NULL,
      name TEXT NOT NULL,
      gender TEXT DEFAULT '',
      birthdate TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      isEncrypted INTEGER DEFAULT 0
    )
  `,

  [TABLES.tasks]: `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      babyId TEXT NOT NULL,
      memberId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT DEFAULT 'general',
      frequency TEXT DEFAULT 'once',
      isFamilyShared INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      isEncrypted INTEGER DEFAULT 0
    )
  `,

  [TABLES.checkins]: `
    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      babyId TEXT NOT NULL,
      memberId TEXT NOT NULL,
      completedAt TEXT NOT NULL,
      note TEXT DEFAULT '',
      isEncrypted INTEGER DEFAULT 0
    )
  `,

  [TABLES.achievements]: `
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      babyId TEXT NOT NULL,
      achievementId TEXT NOT NULL,
      unlockedAt TEXT NOT NULL,
      isEncrypted INTEGER DEFAULT 0
    )
  `,

  [TABLES.points]: `
    CREATE TABLE IF NOT EXISTS points (
      id TEXT PRIMARY KEY,
      babyId TEXT NOT NULL,
      total INTEGER DEFAULT 0,
      updatedAt TEXT NOT NULL,
      isEncrypted INTEGER DEFAULT 0
    )
  `,

  [TABLES.change_log]: `
    CREATE TABLE IF NOT EXISTS change_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      row_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    )
  `,
}

// 索引定义
export const INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_change_log_synced ON change_log(synced)`,
  `CREATE INDEX IF NOT EXISTS idx_change_log_timestamp ON change_log(timestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_babyId ON tasks(babyId)`,
  `CREATE INDEX IF NOT EXISTS idx_checkins_taskId ON checkins(taskId)`,
  `CREATE INDEX IF NOT EXISTS idx_babies_memberId ON babies(memberId)`,
]

// 迁移专用：旧 localStorage 键名 → 表名 映射
export const LEGACY_KEYS = {
  family_members: 'family_members',
  babies: 'babies',
  tasks: 'tasks',
  checkins: 'checkins',
  achievements: 'achievements',
  points: 'points',
}