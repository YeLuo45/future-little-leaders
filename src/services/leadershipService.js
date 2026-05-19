/**
 * V75 Leadership Challenge Service
 * 领导力挑战系统服务层
 */

import { getLocalUserBaby } from '@/utils/babyUtils'

// ============================================================================
// Types & Constants
// ============================================================================

// 领导力属性
export const LEADERSHIP_STATS = {
  INFLUENCE: 'influence',     // 影响力
  DECISION: 'decision',       // 决策力
  COMMUNICATION: 'communication' // 沟通力
}

export const STATS_INFO = {
  [LEADERSHIP_STATS.INFLUENCE]: { label: '影响力', icon: '👑', color: '#FFD700', description: '带领和影响团队成员的能力' },
  [LEADERSHIP_STATS.DECISION]: { label: '决策力', icon: '🎯', color: '#1890FF', description: '在关键时刻做出正确决定的能力' },
  [LEADERSHIP_STATS.COMMUNICATION]: { label: '沟通力', icon: '💬', color: '#52C41A', description: '清晰表达和有效倾听的能力' }
}

// 角色类型
export const ROLE_TYPE = {
  LEADER: 'leader',           // 队长
  DEPUTY: 'deputy',          // 副队长
  GROUP_LEADER: 'group_leader' // 组长
}

export const ROLE_INFO = {
  [ROLE_TYPE.LEADER]: { label: '队长', icon: '⭐', color: '#FFD700', description: '团队的核心领导者' },
  [ROLE_TYPE.DEPUTY]: { label: '副队长', icon: '🌟', color: '#1890FF', description: '协助队长管理团队' },
  [ROLE_TYPE.GROUP_LEADER]: { label: '组长', icon: '✨', color: '#52C41A', description: '带领小组完成任务' }
}

// 任务难度
export const QUEST_DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
}

export const QUEST_DIFFICULTY_INFO = {
  [QUEST_DIFFICULTY.EASY]: { label: '简单', color: '#52C41A', stars: 1, points: 10 },
  [QUEST_DIFFICULTY.MEDIUM]: { label: '中等', color: '#FA8C16', stars: 2, points: 20 },
  [QUEST_DIFFICULTY.HARD]: { label: '困难', color: '#F5222D', stars: 3, points: 30 }
}

// 场景类型
export const SCENARIO_TYPE = {
  CONFLICT: 'conflict',           // 冲突解决
  TEAM_BUILDING: 'team_building',  // 团队建设
  DECISION_MAKING: 'decision_making', // 决策场景
  CRISIS: 'crisis'                // 危机处理
}

export const SCENARIO_TYPE_INFO = {
  [SCENARIO_TYPE.CONFLICT]: { label: '冲突解决', icon: '🤝', color: '#722ED1', description: '调解团队内部矛盾' },
  [SCENARIO_TYPE.TEAM_BUILDING]: { label: '团队建设', icon: '🎪', color: '#1890FF', description: '增强团队凝聚力' },
  [SCENARIO_TYPE.DECISION_MAKING]: { label: '决策场景', icon: '⚖️', color: '#FA8C16', description: '做出关键决策' },
  [SCENARIO_TYPE.CRISIS]: { label: '危机处理', icon: '🚨', color: '#F5222D', description: '应对突发状况' }
}

// localStorage keys
const LEADERSHIP_STATS_KEY = 'leadership_stats'
const LEADERSHIP_QUESTS_KEY = 'leadership_quests'
const LEADERSHIP_SCENARIOS_KEY = 'leadership_scenarios'
const LEADERSHIP_HISTORY_KEY = 'leadership_history'

// ============================================================================
// Mock Data: Leadership Quests
// ============================================================================

const MOCK_QUESTS = [
  {
    id: 'quest_1',
    title: '团队目标设定',
    description: '作为队长，带领团队设定并分解本周目标，培养目标管理能力',
    difficulty: QUEST_DIFFICULTY.EASY,
    role: ROLE_TYPE.LEADER,
    objectives: [
      '明确团队总体目标',
      '分解任务到个人',
      '制定完成时间表'
    ],
    rewards: { points: 10, influence: 2, decision: 1, communication: 1 }
  },
  {
    id: 'quest_2',
    title: '分工协调',
    description: '合理分配任务，让每个队员都能发挥特长',
    difficulty: QUEST_DIFFICULTY.MEDIUM,
    role: ROLE_TYPE.LEADER,
    objectives: [
      '了解队员特长',
      '合理分配任务',
      '确保任务进度'
    ],
    rewards: { points: 20, influence: 3, decision: 2, communication: 2 }
  },
  {
    id: 'quest_3',
    title: '冲突调解',
    description: '两位队员发生争执，需要你出面调解',
    difficulty: QUEST_DIFFICULTY.MEDIUM,
    role: ROLE_TYPE.DEPUTY,
    objectives: [
      '倾听双方诉求',
      '找到共同点',
      '提出解决方案'
    ],
    rewards: { points: 20, influence: 2, decision: 3, communication: 3 }
  },
  {
    id: 'quest_4',
    title: '紧急决策',
    description: '团队任务遇到突发问题，需要立即做出决策',
    difficulty: QUEST_DIFFICULTY.HARD,
    role: ROLE_TYPE.LEADER,
    objectives: [
      '分析问题原因',
      '评估可行方案',
      '果断做出决策'
    ],
    rewards: { points: 30, influence: 3, decision: 4, communication: 2 }
  },
  {
    id: 'quest_5',
    title: '新人引导',
    description: '新成员加入团队，需要帮助他融入集体',
    difficulty: QUEST_DIFFICULTY.EASY,
    role: ROLE_TYPE.GROUP_LEADER,
    objectives: [
      '介绍团队文化',
      '安排适合的任务',
      '给予鼓励支持'
    ],
    rewards: { points: 10, influence: 1, decision: 1, communication: 3 }
  },
  {
    id: 'quest_6',
    title: '团队激励',
    description: '团队士气低落，需要想办法提振信心',
    difficulty: QUEST_DIFFICULTY.HARD,
    role: ROLE_TYPE.LEADER,
    objectives: [
      '分析士气低原因',
      '制定激励方案',
      '实施并跟踪效果'
    ],
    rewards: { points: 30, influence: 4, decision: 2, communication: 3 }
  }
]

// ============================================================================
// Mock Data: Role Play Scenarios
// ============================================================================

const MOCK_SCENARIOS = [
  {
    id: 'scenario_1',
    title: '操场上的争吵',
    description: '小明和小红在玩游戏时发生争吵，都认为自己应该先玩。',
    type: SCENARIO_TYPE.CONFLICT,
    role: ROLE_TYPE.GROUP_LEADER,
    context: '你正在和几个同学一起玩游戏，你是小组长。',
    situation: '小明说："我先来的，应该我先玩！"小红说："可是说好大家一起玩的，不能你一个人决定！"',
    options: [
      {
        id: 'opt_1',
        text: '让大家轮流玩，每个人都有机会',
        effect: { influence: 1, decision: 1, communication: 2 },
        result: '你提出轮流玩的建议，大家都同意了，矛盾化解。'
      },
      {
        id: 'opt_2',
        text: '让老师来评判谁对谁错',
        effect: { influence: 0, decision: 0, communication: 0 },
        result: '虽然问题解决了，但同学们觉得你不够独立。'
      },
      {
        id: 'opt_3',
        text: '制定游戏规则，让大家共同遵守',
        effect: { influence: 2, decision: 2, communication: 1 },
        result: '你组织大家制定了规则，团队合作更顺畅了。'
      }
    ]
  },
  {
    id: 'scenario_2',
    title: '班级活动策划',
    description: '班级要组织一次户外活动，需要有人来牵头。',
    type: SCENARIO_TYPE.TEAM_BUILDING,
    role: ROLE_TYPE.LEADER,
    context: '班主任说班级需要组织一次户外活动，正在寻找负责人。',
    situation: '同学们意见不一，有的想去公园，有的想去博物馆，还有的想组织体育比赛。',
    options: [
      {
        id: 'opt_1',
        text: '组织投票，让大家一起决定',
        effect: { influence: 2, decision: 1, communication: 2 },
        result: '通过民主投票选出了目的地，大家都很满意。'
      },
      {
        id: 'opt_2',
        text: '自己决定去哪里，不浪费时间讨论',
        effect: { influence: -1, decision: 1, communication: 0 },
        result: '虽然效率提高了，但部分同学有抵触情绪。'
      },
      {
        id: 'opt_3',
        text: '先收集意见，再综合考虑做出最佳选择',
        effect: { influence: 2, decision: 3, communication: 2 },
        result: '你充分考虑了各种因素，做出兼顾多数人意愿的决定。'
      }
    ]
  },
  {
    id: 'scenario_3',
    title: '比赛前夕',
    description: '明天就是重要的比赛，但主力队员突然生病了。',
    type: SCENARIO_TYPE.DECISION_MAKING,
    role: ROLE_TYPE.LEADER,
    context: '你是足球比赛的队长，明天就要比赛了。',
    situation: '主力前锋小华突然发烧不能参加比赛，替补队员经验不足。',
    options: [
      {
        id: 'opt_1',
        text: '调整战术，让替补顶上去，给她鼓励',
        effect: { influence: 2, decision: 2, communication: 2 },
        result: '虽然比赛输了，但替补队员得到了成长，团队凝聚力增强。'
      },
      {
        id: 'opt_2',
        text: '请求推迟比赛',
        effect: { influence: 0, decision: -1, communication: 1 },
        result: '比赛没有推迟，对方觉得你不够坚强。'
      },
      {
        id: 'opt_3',
        text: '鼓舞士气，重新分工，相信团队',
        effect: { influence: 3, decision: 2, communication: 3 },
        result: '团队在你的激励下表现出色，比赛取得好成绩！'
      }
    ]
  },
  {
    id: 'scenario_4',
    title: '突发状况',
    description: '秋游时下雨了，原计划全部打乱。',
    type: SCENARIO_TYPE.CRISIS,
    role: ROLE_TYPE.DEPUTY,
    context: '你和小伙伴们去秋游，你是副队长。',
    situation: '突然下起大雨，大家都没带伞，原定的野餐和游戏都无法进行，有人开始抱怨。',
    options: [
      {
        id: 'opt_1',
        text: '找地方避雨，安抚大家情绪，另想办法',
        effect: { influence: 2, decision: 2, communication: 3 },
        result: '你带领大家找到凉亭避雨，还组织了讲故事游戏，氛围很好。'
      },
      {
        id: 'opt_2',
        text: '责怪组织者没有看天气预报',
        effect: { influence: -2, decision: 0, communication: 0 },
        result: '团队士气更加低落，大家不欢而散。'
      },
      {
        id: 'opt_3',
        text: '提议室内活动，把秋游变成探索之旅',
        effect: { influence: 3, decision: 3, communication: 2 },
        result: '你的创意让秋游变得更有意义，大家都很感激你！'
      }
    ]
  }
]

// ============================================================================
// Helper Functions
// ============================================================================

const getDefaultStats = () => ({
  influence: 0,
  decision: 0,
  communication: 0,
  totalPoints: 0,
  completedQuests: 0,
  completedScenarios: 0,
  level: 1,
  experience: 0,
  history: []
})

const loadStats = () => {
  try {
    const saved = uni.getStorageSync(LEADERSHIP_STATS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load leadership stats:', e)
  }
  return getDefaultStats()
}

const saveStats = (stats) => {
  try {
    uni.setStorageSync(LEADERSHIP_STATS_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error('Failed to save leadership stats:', e)
  }
}

const loadQuests = () => {
  try {
    const saved = uni.getStorageSync(LEADERSHIP_QUESTS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load quests:', e)
  }
  return {}
}

const saveQuests = (quests) => {
  try {
    uni.setStorageSync(LEADERSHIP_QUESTS_KEY, JSON.stringify(quests))
  } catch (e) {
    console.error('Failed to save quests:', e)
  }
}

const loadScenarios = () => {
  try {
    const saved = uni.getStorageSync(LEADERSHIP_SCENARIOS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load scenarios:', e)
  }
  return {}
}

const saveScenarios = (scenarios) => {
  try {
    uni.setStorageSync(LEADERSHIP_SCENARIOS_KEY, JSON.stringify(scenarios))
  } catch (e) {
    console.error('Failed to save scenarios:', e)
  }
}

// ============================================================================
// Service API
// ============================================================================

const leadershipService = {
  // ==================== 数据获取 ====================

  /**
   * 获取领导力属性信息
   */
  getStatsInfo() {
    return STATS_INFO
  },

  /**
   * 获取角色类型信息
   */
  getRoleInfo() {
    return ROLE_INFO
  },

  /**
   * 获取任务难度信息
   */
  getDifficultyInfo() {
    return QUEST_DIFFICULTY_INFO
  },

  /**
   * 获取场景类型信息
   */
  getScenarioTypeInfo() {
    return SCENARIO_TYPE_INFO
  },

  /**
   * 获取用户领导力数据
   */
  getUserStats() {
    return loadStats()
  },

  /**
   * 获取所有任务
   */
  getQuests() {
    return MOCK_QUESTS
  },

  /**
   * 获取任务进度
   */
  getQuestProgress() {
    const stats = loadStats()
    const questProgress = stats.completedQuests || 0
    return {
      completed: questProgress,
      total: MOCK_QUESTS.length,
      percentage: Math.round((questProgress / MOCK_QUESTS.length) * 100)
    }
  },

  /**
   * 获取任务
   */
  getQuest(questId) {
    return MOCK_QUESTS.find(q => q.id === questId)
  },

  /**
   * 获取已完成的任务
   */
  getCompletedQuests() {
    const quests = loadQuests()
    return MOCK_QUESTS.filter(q => quests[q.id]?.completed)
  },

  /**
   * 获取所有角色扮演场景
   */
  getScenarios() {
    return MOCK_SCENARIOS
  },

  /**
   * 获取场景进度
   */
  getScenarioProgress() {
    const stats = loadStats()
    const scenarioProgress = stats.completedScenarios || 0
    return {
      completed: scenarioProgress,
      total: MOCK_SCENARIOS.length,
      percentage: Math.round((scenarioProgress / MOCK_SCENARIOS.length) * 100)
    }
  },

  /**
   * 获取场景
   */
  getScenario(scenarioId) {
    return MOCK_SCENARIOS.find(s => s.id === scenarioId)
  },

  /**
   * 获取已完成的场景
   */
  getCompletedScenarios() {
    const scenarios = loadScenarios()
    return MOCK_SCENARIOS.filter(s => scenarios[s.id]?.completed)
  },

  /**
   * 获取成长轨迹
   */
  getGrowthTrail() {
    const stats = loadStats()
    return stats.history || []
  },

  // ==================== 任务操作 ====================

  /**
   * 接受任务
   */
  acceptQuest(questId) {
    const quests = loadQuests()
    if (!quests[questId]) {
      quests[questId] = { accepted: true, completed: false, startedAt: Date.now() }
      saveQuests(quests)
    }
    return quests[questId]
  },

  /**
   * 完成任务
   */
  completeQuest(questId, result = {}) {
    const quest = MOCK_QUESTS.find(q => q.id === questId)
    if (!quest) return null

    const stats = loadStats()
    const quests = loadQuests()

    // 更新任务状态
    quests[questId] = {
      ...quests[questId],
      completed: true,
      completedAt: Date.now(),
      result
    }
    saveQuests(quests)

    // 计算奖励
    const rewards = quest.rewards
    const oldLevel = stats.level

    // 更新属性
    stats.influence += rewards.influence
    stats.decision += rewards.decision
    stats.communication += rewards.communication
    stats.totalPoints += rewards.points
    stats.completedQuests = (stats.completedQuests || 0) + 1

    // 经验值和等级
    stats.experience += rewards.points
    const expForNextLevel = stats.level * 50
    if (stats.experience >= expForNextLevel) {
      stats.level += 1
      stats.experience -= expForNextLevel
    }

    // 添加历史记录
    stats.history = stats.history || []
    stats.history.unshift({
      type: 'quest',
      id: questId,
      title: quest.title,
      rewards,
      timestamp: Date.now()
    })

    // 只保留最近50条记录
    if (stats.history.length > 50) {
      stats.history = stats.history.slice(0, 50)
    }

    saveStats(stats)

    return {
      rewards,
      oldLevel,
      newLevel: stats.level,
      leveledUp: stats.level > oldLevel
    }
  },

  /**
   * 放弃任务
   */
  abandonQuest(questId) {
    const quests = loadQuests()
    if (quests[questId]) {
      delete quests[questId]
      saveQuests(quests)
    }
    return true
  },

  // ==================== 场景操作 ====================

  /**
   * 开始场景
   */
  startScenario(scenarioId) {
    const scenarios = loadScenarios()
    if (!scenarios[scenarioId]) {
      scenarios[scenarioId] = { started: true, startedAt: Date.now() }
      saveScenarios(scenarios)
    }
    return scenarios[scenarioId]
  },

  /**
   * 完成场景
   */
  completeScenario(scenarioId, optionId) {
    const scenario = MOCK_SCENARIOS.find(s => s.id === scenarioId)
    if (!scenario) return null

    const selectedOption = scenario.options.find(o => o.id === optionId)
    if (!selectedOption) return null

    const stats = loadStats()
    const scenarios = loadScenarios()

    // 更新场景状态
    scenarios[scenarioId] = {
      ...scenarios[scenarioId],
      completed: true,
      completedAt: Date.now(),
      optionId,
      effect: selectedOption.effect
    }
    saveScenarios(scenarios)

    // 计算奖励
    const effect = selectedOption.effect
    const oldLevel = stats.level

    // 更新属性
    stats.influence += effect.influence
    stats.decision += effect.decision
    stats.communication += effect.communication
    stats.totalPoints += (effect.influence + effect.decision + effect.communication) * 2
    stats.completedScenarios = (stats.completedScenarios || 0) + 1

    // 经验值和等级
    stats.experience += effect.influence + effect.decision + effect.communication
    const expForNextLevel = stats.level * 50
    if (stats.experience >= expForNextLevel) {
      stats.level += 1
      stats.experience -= expForNextLevel
    }

    // 添加历史记录
    stats.history = stats.history || []
    stats.history.unshift({
      type: 'scenario',
      id: scenarioId,
      title: scenario.title,
      optionText: selectedOption.text,
      effect,
      result: selectedOption.result,
      timestamp: Date.now()
    })

    // 只保留最近50条记录
    if (stats.history.length > 50) {
      stats.history = stats.history.slice(0, 50)
    }

    saveStats(stats)

    return {
      effect,
      result: selectedOption.result,
      oldLevel,
      newLevel: stats.level,
      leveledUp: stats.level > oldLevel
    }
  },

  // ==================== 工具方法 ====================

  /**
   * 获取领导力总评分
   */
  getTotalScore() {
    const stats = loadStats()
    return stats.influence + stats.decision + stats.communication
  },

  /**
   * 获取等级称号
   */
  getLevelTitle(level) {
    const titles = [
      '新手leader',
      '小队长',
      '中队长',
      '大队长',
      '领袖萌芽',
      '未来领袖',
      '小领袖',
      '领导之星',
      '领袖达人',
      '卓越领袖'
    ]
    const index = Math.min(Math.floor((level - 1) / 5), titles.length - 1)
    return titles[index]
  },

  /**
   * 重置数据
   */
  resetData() {
    uni.removeStorageSync(LEADERSHIP_STATS_KEY)
    uni.removeStorageSync(LEADERSHIP_QUESTS_KEY)
    uni.removeStorageSync(LEADERSHIP_SCENARIOS_KEY)
    uni.removeStorageSync(LEADERSHIP_HISTORY_KEY)
    return true
  }
}

export default leadershipService
