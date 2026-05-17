/**
 * FamilyGrowthContext — 家庭成长数据统一视图
 *
 * 单例数据聚合层，按需从各 store/service 聚合数据，一次计算多处消费。
 * 解决仪表盘/成长报告跨模块数据重复计算问题。
 *
 * 使用方式：
 *   const { getChildGrowth } = require('./FamilyGrowthContext');
 *   const growth = getChildGrowth('baby_123');
 */

'use strict';

// ============================================================================
// Storage Helpers
// ============================================================================

function loadBabiesFromStorage() {
  try {
    const stored = uni.getStorageSync('babies') || '[]';
    return typeof stored === 'string' ? JSON.parse(stored) : stored;
  } catch (e) {
    return [];
  }
}

function loadFlowsFromStorage() {
  try {
    const stored = uni.getStorageSync('task_flows') || '[]';
    return typeof stored === 'string' ? JSON.parse(stored) : stored;
  } catch (e) {
    return [];
  }
}

function loadPointsFromStorage() {
  try {
    const stored = uni.getStorageSync('points_records') || '[]';
    return typeof stored === 'string' ? JSON.parse(stored) : stored;
  } catch (e) {
    return [];
  }
}

function loadAchievementsFromStorage() {
  try {
    const stored = uni.getStorageSync('baby_achievements') || '{}';
    return typeof stored === 'string' ? JSON.parse(stored) : stored;
  } catch (e) {
    return {};
  }
}

// ============================================================================
// Date Helpers
// ============================================================================

function getWeekAgo() {
  return Date.now() - 7 * 24 * 3600 * 1000;
}

function getDayStart(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function formatDateShort(date) {
  const d = new Date(date);
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

function isSameDay(ts1, ts2) {
  return getDayStart(ts1) === getDayStart(ts2);
}

// ============================================================================
// Core Context
// ============================================================================

/**
 * FamilyGrowthContext — 统一数据上下文
 */
const FamilyGrowthContext = {

  // ---------------------------------------------------------------------------
  // Family-level data
  // ---------------------------------------------------------------------------

  /**
   * 获取家庭成员列表
   */
  getFamilyMembers() {
    return loadBabiesFromStorage();
  },

  /**
   * 获取宝宝档案
   */
  getChildProfile(childId) {
    const babies = loadBabiesFromStorage();
    return babies.find(b => b.id === childId) || null;
  },

  // ---------------------------------------------------------------------------
  // Child growth data — 一次性聚合，避免多处重复计算
  // ---------------------------------------------------------------------------

  /**
   * 获取孩子的完整成长数据
   * @param {string} childId
   * @returns {object}
   */
  getChildGrowth(childId) {
    return {
      profile: this.getChildProfile(childId),
      points: this.getPointsSummary(childId),
      tasks: this.getTasksSummary(childId),
      achievements: this.getAchievementsSummary(childId),
      timeline: this.getWeeklyTimeline(childId),
    };
  },

  // ---------------------------------------------------------------------------
  // Points
  // ---------------------------------------------------------------------------

  /**
   * 积分汇总
   */
  getPointsSummary(childId) {
    const records = loadPointsFromStorage().filter(r => r.babyId === childId);
    const weekAgo = getWeekAgo();
    const weeklyRecords = records.filter(r => r.type === 'income' && r.createdAt > weekAgo);

    const total = records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.points, 0);

    const weeklyEarned = weeklyRecords.reduce((sum, r) => sum + r.points, 0);

    const recentRecords = records
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 10);

    return {
      total,
      weeklyEarned,
      recentRecords,
    };
  },

  // ---------------------------------------------------------------------------
  // Tasks (from collaboration flows)
  // ---------------------------------------------------------------------------

  /**
   * 任务汇总
   */
  getTasksSummary(childId) {
    const flows = loadFlowsFromStorage().filter(f => f.childId === childId);
    const now = Date.now();
    const weekAgo = getWeekAgo();

    const byState = {};
    flows.forEach(f => {
      byState[f.state] = (byState[f.state] || 0) + 1;
    });

    const weekCompleted = flows.filter(f =>
      (f.state === 'approved' || f.state === 'rewarded') &&
      f.approvedAt > weekAgo
    ).length;

    return {
      total: flows.length,
      byState,
      weekCompleted,
      pending: (byState['pending_approval'] || 0),
      inProgress: (byState['assigned'] || 0) + (byState['in_progress'] || 0),
    };
  },

  /**
   * 获取孩子的所有流转
   */
  getChildFlows(childId) {
    return loadFlowsFromStorage().filter(f => f.childId === childId);
  },

  /**
   * 获取所有待审核流转（家长视角）
   */
  getPendingApprovalFlows() {
    return loadFlowsFromStorage().filter(f => f.state === 'pending_approval');
  },

  // ---------------------------------------------------------------------------
  // Achievements
  // ---------------------------------------------------------------------------

  /**
   * 成就汇总
   */
  getAchievementsSummary(childId) {
    const babyAchs = loadAchievementsFromStorage()[childId] || [];

    // Achievement definitions (from hardcoded ACHIEVEMENTS in achievementStore)
    const ACHIEVEMENT_DEFS = [
      { id: 'first_task', name: '初出茅庐', description: '完成第1个任务', icon: '🌟', reward: 10 },
      { id: 'streak_7days', name: '小小坚持家', description: '连续7天完成任务', icon: '📅', reward: 50 },
      { id: 'points_500', name: '累积达人', description: '累计获得500积分', icon: '💰', reward: 100 },
      { id: 'first_exchange', name: '首次兑换', description: '第一次商城兑换', icon: '🎁', reward: 20 },
      { id: 'full_week', name: '全勤周', description: '一周7天不间断', icon: '🏆', reward: 80 },
    ];

    const unlocked = babyAchs.filter(a => a.unlocked).map(a => {
      const def = ACHIEVEMENT_DEFS.find(d => d.id === a.id) || {};
      return { ...def, ...a, unlocked: true };
    });

    const inProgress = ACHIEVEMENT_DEFS
      .filter(def => !babyAchs.find(a => a.id === def.id && a.unlocked))
      .map(def => ({ ...def, unlocked: false, progress: 0, target: 1 }));

    return {
      unlocked,
      inProgress,
      totalCount: ACHIEVEMENT_DEFS.length,
      unlockedCount: unlocked.length,
    };
  },

  // ---------------------------------------------------------------------------
  // Timeline (for charts)
  // ---------------------------------------------------------------------------

  /**
   * 获取最近7天每日完成任务数（用于折线图）
   */
  getWeeklyTimeline(childId) {
    const flows = loadFlowsFromStorage().filter(f =>
      f.childId === childId &&
      (f.state === 'approved' || f.state === 'rewarded')
    );

    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dayStart = getDayStart(d);
      const dayEnd = dayStart + 24 * 3600 * 1000;

      const count = flows.filter(f =>
        f.approvedAt >= dayStart && f.approvedAt < dayEnd
      ).length;

      days.push({
        date: formatDateShort(d),
        count,
      });
    }

    return days;
  },

  /**
   * 获取本周积分折线图
   */
  getWeeklyPointsTimeline(childId) {
    const records = loadPointsFromStorage().filter(r =>
      r.babyId === childId && r.type === 'income'
    );

    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dayStart = getDayStart(d);
      const dayEnd = dayStart + 24 * 3600 * 1000;

      const earned = records
        .filter(r => r.createdAt >= dayStart && r.createdAt < dayEnd)
        .reduce((sum, r) => sum + r.points, 0);

      days.push({
        date: formatDateShort(d),
        points: earned,
      });
    }

    return days;
  },

  // ---------------------------------------------------------------------------
  // Family dashboard aggregation
  // ---------------------------------------------------------------------------

  /**
   * 获取家庭仪表盘汇总数据
   * @param {string} childId — 当前选中宝宝
   */
  getDashboardStats(childId) {
    const flows = this.getChildFlows(childId);
    const tasks = this.getTasksSummary(childId);
    const points = this.getPointsSummary(childId);
    const achievements = this.getAchievementsSummary(childId);
    const timeline = this.getWeeklyTimeline(childId);

    // 连续天数：统计 rewarded flows 中有多少个不同的自然日
    const rewardedFlows = flows.filter(f =>
      f.state === 'approved' || f.state === 'rewarded'
    );
    const uniqueDays = new Set(
      rewardedFlows
        .map(f => getDayStart(f.approvedAt))
        .filter(ts => ts > 0)
    );

    return {
      // 本周完成
      weekCompleted: tasks.weekCompleted,
      // 待审核
      pendingCount: tasks.pending,
      // 进行中
      inProgressCount: tasks.inProgress,
      // 已获积分
      totalPoints: points.total,
      weeklyEarned: points.weeklyEarned,
      // 成就
      achievementCount: achievements.unlockedCount,
      totalAchievements: achievements.totalCount,
      // 连续天数
      continuousDays: uniqueDays.size,
      // 折线图
      timeline,
      // 本周积分
      weeklyPointsTimeline: this.getWeeklyPointsTimeline(childId),
    };
  },
};

// ============================================================================
// Export
// ============================================================================

module.exports = FamilyGrowthContext;

// ============================================================================
// V10 Dashboard Stats V2
// ============================================================================

/**
 * Get V2 dashboard stats for a baby (enhanced with SQLite queries)
 * @param {string} babyId
 * @returns {object}
 */
function getDashboardStatsV2(babyId) {
  // Dynamic import to avoid circular dependency issues
  let dbModule;
  try {
    dbModule = require('../db/sqlite.js')
  } catch (e) {
    console.warn('[V10] SQLite module not available:', e.message)
  }
  
  const hasDb = dbModule && dbModule.getDatabase && dbModule.getDatabase()
  
  // Fallback to original stats if DB not available
  if (!hasDb) {
    return FamilyGrowthContext.getDashboardStats(babyId)
  }
  
  const {
    getPointsBalance,
    getWeeklyEarned,
    getWeeklySpent,
    getPointsHistory7d,
    getCheckinStats7d,
    getSkillTreeStats,
    getAchievementProgress,
    getCachedAISummary
  } = dbModule
  
  // Get V1 stats for compatibility
  const v1Stats = FamilyGrowthContext.getDashboardStats(babyId)
  
  // Fetch V2 stats from SQLite
  const pointsBalance = getPointsBalance(babyId) || v1Stats.totalPoints
  const weeklyEarned = getWeeklyEarned(babyId) || v1Stats.weeklyEarned
  const weeklySpent = getWeeklySpent(babyId) || 0
  const pointsHistory7d = getPointsHistory7d(babyId) || []
  const taskTrend7d = getCheckinStats7d(babyId) || []
  const skillTreeProgress = getSkillTreeStats(babyId) || {}
  const achievementProgress = getAchievementProgress(babyId) || { unlocked: 0, total: 5 }
  const aiSummary = getCachedAISummary(babyId) || null
  
  return {
    // Points
    pointsBalance,
    weeklyEarned,
    weeklySpent,
    pointsHistory7d,
    
    // Tasks
    taskTrend7d,
    weekCompleted: v1Stats.weekCompleted,
    pendingCount: v1Stats.pendingCount,
    
    // Skill Tree (V6)
    skillTreeProgress,
    
    // Achievements
    achievementProgress,
    
    // AI Summary (V9)
    aiSummary,
    
    // Legacy support
    totalPoints: pointsBalance,
    timeline: taskTrend7d,
    continuousDays: v1Stats.continuousDays,
    weeklyPointsTimeline: pointsHistory7d
  }
}

// Export for use in components
module.exports.getDashboardStatsV2 = getDashboardStatsV2
