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
  SKILL_NODE_STATS: 'skill_node_stats',
  // V7 Notification tables
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  // V9 AI Summary Cache
  AI_SUMMARY_CACHE: 'ai_summary_cache',
  // V12 Reward Shop tables
  REWARD_ITEMS: 'reward_items',
  EXCHANGE_RECORDS: 'exchange_records',
  // V15 Social tables
  FRIENDS: 'friends',
  POINT_GIFTS: 'point_gifts',
  TEAM_TASKS: 'team_tasks',
  TEAM_MEMBERS: 'team_members',
  CHALLENGES: 'challenges',
  CHALLENGE_PARTICIPANTS: 'challenge_participants',
  // V16 WX tables
  SHARE_RECORDS: 'share_records',
  LOCATION_RECORDS: 'location_records',
  // V43 Learning Path tables
  LEARNING_PATHS: 'learning_paths',
  ASSESSMENTS: 'assessments',
  LEARNING_GOALS: 'learning_goals',
  COURSE_PROGRESS: 'course_progress'
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

-- V7 通知表
CREATE TABLE IF NOT EXISTS ${TABLES.NOTIFICATIONS} (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  type TEXT NOT NULL,
  recipientId TEXT NOT NULL,
  senderId TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data TEXT,
  priority TEXT DEFAULT 'normal',
  read INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  expiresAt TEXT,
  synced INTEGER DEFAULT 0
);

-- V7 通知偏好设置表
CREATE TABLE IF NOT EXISTS ${TABLES.NOTIFICATION_PREFERENCES} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  channel TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  quietHoursStart TEXT,
  quietHoursEnd TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(babyId, channel)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON ${TABLES.NOTIFICATIONS}(recipientId, read);
CREATE INDEX IF NOT EXISTS idx_notifications_synced ON ${TABLES.NOTIFICATIONS}(synced);

-- V9 AI Summary Cache 表
CREATE TABLE IF NOT EXISTS ${TABLES.AI_SUMMARY_CACHE} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  period TEXT NOT NULL,
  summary TEXT,
  strengths TEXT,
  suggestions TEXT,
  highlights TEXT,
  generatedAt TEXT NOT NULL,
  UNIQUE(babyId, period)
);

CREATE INDEX IF NOT EXISTS idx_ai_summary_baby ON ${TABLES.AI_SUMMARY_CACHE}(babyId, period);

-- V12 积分商城商品表
CREATE TABLE IF NOT EXISTS ${TABLES.REWARD_ITEMS} (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  pointsCost INTEGER NOT NULL,
  stock INTEGER DEFAULT -1,
  icon TEXT,
  active INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- V12 积分商城兑换记录表
CREATE TABLE IF NOT EXISTS ${TABLES.EXCHANGE_RECORDS} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  rewardItemId TEXT NOT NULL,
  rewardItemName TEXT NOT NULL,
  rewardItemIcon TEXT,
  pointsCost INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  exchangedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reward_items_category ON ${TABLES.REWARD_ITEMS}(category);
CREATE INDEX IF NOT EXISTS idx_reward_items_active ON ${TABLES.REWARD_ITEMS}(active);
CREATE INDEX IF NOT EXISTS idx_exchange_records_baby ON ${TABLES.EXCHANGE_RECORDS}(babyId);
CREATE INDEX IF NOT EXISTS idx_exchange_records_exchanged ON ${TABLES.EXCHANGE_RECORDS}(exchangedAt DESC);

-- V15 社交功能表
-- 好友表
CREATE TABLE IF NOT EXISTS ${TABLES.FRIENDS} (
  id TEXT PRIMARY KEY,
  owner_baby_id TEXT NOT NULL,
  friend_baby_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 积分赠送表
CREATE TABLE IF NOT EXISTS ${TABLES.POINT_GIFTS} (
  id TEXT PRIMARY KEY,
  from_baby_id TEXT NOT NULL,
  to_baby_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 组队任务表
CREATE TABLE IF NOT EXISTS ${TABLES.TEAM_TASKS} (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_points INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'recruiting',
  start_date TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 组队成员表
CREATE TABLE IF NOT EXISTS ${TABLES.TEAM_MEMBERS} (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  contribution INTEGER DEFAULT 0,
  joined_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES ${TABLES.TEAM_TASKS}(id)
);

-- 挑战表
CREATE TABLE IF NOT EXISTS ${TABLES.CHALLENGES} (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 挑战参与者表
CREATE TABLE IF NOT EXISTS ${TABLES.CHALLENGE_PARTICIPANTS} (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  current_value INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  joined_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (challenge_id) REFERENCES ${TABLES.CHALLENGES}(id)
);

-- 社交功能索引
CREATE INDEX IF NOT EXISTS idx_friends_owner ON ${TABLES.FRIENDS}(owner_baby_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON ${TABLES.FRIENDS}(friend_baby_id);
CREATE INDEX IF NOT EXISTS idx_point_gifts_from ON ${TABLES.POINT_GIFTS}(from_baby_id);
CREATE INDEX IF NOT EXISTS idx_point_gifts_to ON ${TABLES.POINT_GIFTS}(to_baby_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON ${TABLES.TEAM_MEMBERS}(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_baby ON ${TABLES.TEAM_MEMBERS}(baby_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON ${TABLES.CHALLENGE_PARTICIPANTS}(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_baby ON ${TABLES.CHALLENGE_PARTICIPANTS}(baby_id);

-- V16 微信功能表
-- 分享记录表
CREATE TABLE IF NOT EXISTS ${TABLES.SHARE_RECORDS} (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  share_type TEXT NOT NULL,
  card_template TEXT,
  card_data TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 位置记录表
CREATE TABLE IF NOT EXISTS ${TABLES.LOCATION_RECORDS} (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  accuracy REAL,
  altitude REAL,
  speed REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 微信功能索引
CREATE INDEX IF NOT EXISTS idx_share_records_user ON ${TABLES.SHARE_RECORDS}(user_id);
CREATE INDEX IF NOT EXISTS idx_share_records_baby ON ${TABLES.SHARE_RECORDS}(baby_id);
CREATE INDEX IF NOT EXISTS idx_location_records_baby ON ${TABLES.LOCATION_RECORDS}(baby_id);
CREATE INDEX IF NOT EXISTS idx_location_records_created ON ${TABLES.LOCATION_RECORDS}(created_at);

-- V43 学习路径表
CREATE TABLE IF NOT EXISTS ${TABLES.ASSESSMENTS} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  scores TEXT,
  radarData TEXT,
  overallLevel TEXT,
  strongAreas TEXT,
  weakAreas TEXT,
  completedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ${TABLES.LEARNING_PATHS} (
  id TEXT PRIMARY KEY,
  babyId TEXT NOT NULL,
  assessment TEXT,
  goals TEXT,
  recommendedCourses TEXT,
  weakAreas TEXT,
  strongAreas TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ${TABLES.LEARNING_GOALS} (
  id TEXT PRIMARY KEY,
  goalId TEXT NOT NULL,
  babyId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  dimensionIds TEXT,
  targetScore INTEGER DEFAULT 0,
  currentScore INTEGER DEFAULT 0,
  deadline TEXT,
  completed INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ${TABLES.COURSE_PROGRESS} (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  babyId TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessments_baby ON ${TABLES.ASSESSMENTS}(babyId);
CREATE INDEX IF NOT EXISTS idx_learning_paths_baby ON ${TABLES.LEARNING_PATHS}(babyId);
CREATE INDEX IF NOT EXISTS idx_learning_goals_baby ON ${TABLES.LEARNING_GOALS}(babyId);
CREATE INDEX IF NOT EXISTS idx_course_progress_baby ON ${TABLES.COURSE_PROGRESS}(babyId);
`

export const TABLE_NAMES = Object.values(TABLES)
