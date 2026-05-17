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
  FLOWS: 'flows',
  SKILL_TREES: 'skill_trees',
  SKILL_NODES: 'skill_nodes',
  SKILL_NODE_STATS: 'skill_node_stats'
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

-- 技能树表 (V6 新增)
CREATE TABLE IF NOT EXISTS ${TABLES.SKILL_TREES} (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 技能节点表 (V6 新增)
CREATE TABLE IF NOT EXISTS ${TABLES.SKILL_NODES} (
  id TEXT PRIMARY KEY,
  treeId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tier INTEGER DEFAULT 0,
  prerequisiteIds TEXT,
  conditionType TEXT NOT NULL,
  conditionCount INTEGER DEFAULT 1,
  conditionTag TEXT,
  comparator TEXT DEFAULT '>=',
  pointsReward INTEGER DEFAULT 0,
  badge TEXT,
  unlockTag TEXT,
  autoUnlock INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (treeId) REFERENCES ${TABLES.SKILL_TREES}(id)
);

-- 技能节点统计表 (V6 新增)
CREATE TABLE IF NOT EXISTS ${TABLES.SKILL_NODE_STATS} (
  id TEXT PRIMARY KEY,
  nodeId TEXT NOT NULL,
  babyId TEXT NOT NULL,
  currentProgress INTEGER DEFAULT 0,
  bestProgress INTEGER DEFAULT 0,
  attemptCount INTEGER DEFAULT 0,
  unlockAttemptTimestamps TEXT,
  unlockedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (nodeId) REFERENCES ${TABLES.SKILL_NODES}(id),
  FOREIGN KEY (babyId) REFERENCES ${TABLES.BABIES}(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_change_log_synced ON ${TABLES.CHANGE_LOG}(synced);
CREATE INDEX IF NOT EXISTS idx_babies_updated ON ${TABLES.BABIES}(updatedAt);
CREATE INDEX IF NOT EXISTS idx_tasks_updated ON ${TABLES.TASKS}(updatedAt);
CREATE INDEX IF NOT EXISTS idx_checkins_updated ON ${TABLES.CHECKINS}(updatedAt);
CREATE INDEX IF NOT EXISTS idx_points_updated ON ${TABLES.POINTS}(updatedAt);
CREATE INDEX IF NOT EXISTS idx_skill_nodes_tree ON ${TABLES.SKILL_NODES}(treeId);
CREATE INDEX IF NOT EXISTS idx_skill_node_stats_baby ON ${TABLES.SKILL_NODE_STATS}(babyId);
CREATE INDEX IF NOT EXISTS idx_skill_node_stats_node ON ${TABLES.SKILL_NODE_STATS}(nodeId);
`

export const TABLE_NAMES = Object.values(TABLES)