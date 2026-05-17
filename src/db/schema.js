/**
 * V4 Database Schema Definition
 * All tables include updatedAt field for LWW (Last-Write-Wins) sync
 */

export const TABLES = {
  FAMILY_MEMBERS: 'family_members',
  BABIES: 'babies',
  TASKS: 'tasks',
  CHECKINS: 'checkins',
  ACHIEVEMENTS: 'achievements',
  POINTS: 'points',
  CHANGE_LOG: 'change_log',
  FLOWS: 'flows'
}

export const SCHEMA = `
-- 家庭成员表
CREATE TABLE IF NOT EXISTS ${TABLES.FAMILY_MEMBERS} (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 宝宝表
CREATE TABLE IF NOT EXISTS ${TABLES.BABIES} (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birthdate TEXT NOT NULL,
  avatar TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 任务表
CREATE TABLE IF NOT EXISTS ${TABLES.TASKS} (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT NOT NULL,
  type TEXT NOT NULL,
  recurringType TEXT,
  weekdays TEXT,
  monthDays TEXT,
  customStartTime TEXT,
  customEndTime TEXT,
  total INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ongoing',
  babyId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (babyId) REFERENCES ${TABLES.BABIES}(id)
);

-- 签到表
CREATE TABLE IF NOT EXISTS ${TABLES.CHECKINS} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  taskId TEXT NOT NULL,
  checkinTime TEXT NOT NULL,
  photo TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (babyId) REFERENCES ${TABLES.BABIES}(id),
  FOREIGN KEY (taskId) REFERENCES ${TABLES.TASKS}(id)
);

-- 成就表
CREATE TABLE IF NOT EXISTS ${TABLES.ACHIEVEMENTS} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  achievementType TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlockedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (babyId) REFERENCES ${TABLES.BABIES}(id)
);

-- 积分表
CREATE TABLE IF NOT EXISTS ${TABLES.POINTS} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (babyId) REFERENCES ${TABLES.BABIES}(id)
);

-- 变更日志表 (用于离线同步)
CREATE TABLE IF NOT EXISTS ${TABLES.CHANGE_LOG} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tableName TEXT NOT NULL,
  rowId TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  synced INTEGER DEFAULT 0
);

-- 流程模板表 (V5 新增)
CREATE TABLE IF NOT EXISTS ${TABLES.FLOWS} (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_change_log_synced ON ${TABLES.CHANGE_LOG}(synced);
CREATE INDEX IF NOT EXISTS idx_babies_updated ON ${TABLES.BABIES}(updatedAt);
CREATE INDEX IF NOT EXISTS idx_tasks_updated ON ${TABLES.TASKS}(updatedAt);
CREATE INDEX IF NOT EXISTS idx_checkins_updated ON ${TABLES.CHECKINS}(updatedAt);
CREATE INDEX IF NOT EXISTS idx_points_updated ON ${TABLES.POINTS}(updatedAt);
`

export const TABLE_NAMES = Object.values(TABLES)