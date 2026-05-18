/**
 * V23 Gamification 服务
 * 包含 Seasonal Challenge、Badge Evolution、Leaderboard 相关服务
 */

// 存储键
const SEASONAL_CHALLENGES_KEY = 'seasonal_challenges'
const USER_BADGES_KEY = 'user_badges'
const BADGE_EVOLUTION_KEY = 'badge_evolution'
const LEADERBOARD_KEY = 'seasonal_leaderboard'
const USER_SEASONAL_PROGRESS_KEY = 'user_seasonal_progress'

// 赛季主题配置
export const SEASON_THEMES = {
  spring: { id: 'spring', name: '春节', icon: '🧧', color: '#FF6B6B', months: [1, 2] },
  summer: { id: 'summer', name: '暑假', icon: '☀️', color: '#4ECDC4', months: [7, 8] },
  autumn: { id: 'autumn', name: '国庆', icon: '🍂', color: '#FFA94D', months: [9, 10] },
  winter: { id: 'winter', name: '寒假', icon: '❄️', color: '#74C0FC', months: [12, 1] }
}

// 徽章等级配置
export const BADGE_TIERS = {
  bronze: { id: 'bronze', name: '青铜', color: '#CD7F32', pointsMultiplier: 1.0 },
  silver: { id: 'silver', name: '白银', color: '#C0C0C0', pointsMultiplier: 1.2 },
  gold: { id: 'gold', name: '黄金', color: '#FFD700', pointsMultiplier: 1.5 },
  diamond: { id: 'diamond', name: '钻石', color: '#B9F2FF', pointsMultiplier: 2.0 }
}

// 获取当前赛季
export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1
  for (const key in SEASON_THEMES) {
    if (SEASON_THEMES[key].months.includes(month)) {
      return SEASON_THEMES[key]
    }
  }
  return SEASON_THEMES.spring // 默认春节
}

// 获取赛季时间范围
export const getSeasonDateRange = (season) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  let startDate, endDate
  if (season.months[0] > month) {
    // 赛季在明年
    startDate = new Date(year - 1, season.months[0] - 1, 1)
    endDate = new Date(year - 1, season.months[1], 0)
  } else {
    startDate = new Date(year, season.months[0] - 1, 1)
    endDate = new Date(year, season.months[1], 0)
  }
  
  return { startDate, endDate }
}

// 模拟赛季任务数据
export const getSeasonalChallenges = () => {
  const season = getCurrentSeason()
  const { startDate, endDate } = getSeasonDateRange(season)
  
  const challenges = [
    {
      id: 'sc_task_1',
      seasonId: season.id,
      title: '每日任务达人',
      description: '每天完成3个任务',
      icon: '📋',
      type: 'daily_task',
      target: 3,
      progress: 0,
      pointsReward: 100,
      badgeReward: { id: 'badge_daily_master', name: '每日大师', tier: 'bronze' },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'ongoing'
    },
    {
      id: 'sc_task_2',
      seasonId: season.id,
      title: '积分冲刺',
      description: '赛季内累计获得500积分',
      icon: '⭐',
      type: 'points_earn',
      target: 500,
      progress: 0,
      pointsReward: 200,
      badgeReward: { id: 'badge_point_rusher', name: '积分冲刺者', tier: 'silver' },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'ongoing'
    },
    {
      id: 'sc_task_3',
      seasonId: season.id,
      title: '坚持不懈',
      description: '连续完成7天任务不断签',
      icon: '🔥',
      type: 'streak',
      target: 7,
      progress: 0,
      pointsReward: 150,
      badgeReward: { id: 'badge_perseverance', name: '坚持不懈', tier: 'bronze' },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'ongoing'
    },
    {
      id: 'sc_task_4',
      seasonId: season.id,
      title: '家庭协作',
      description: '完成5个家庭任务',
      icon: '👨‍👩‍👧',
      type: 'family_task',
      target: 5,
      progress: 0,
      pointsReward: 180,
      badgeReward: { id: 'badge_family_star', name: '家庭之星', tier: 'silver' },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'ongoing'
    },
    {
      id: 'sc_task_5',
      seasonId: season.id,
      title: '成就收集者',
      description: '解锁10个成就',
      icon: '🏆',
      type: 'achievement_unlock',
      target: 10,
      progress: 0,
      pointsReward: 300,
      badgeReward: { id: 'badge_collector', name: '收藏家', tier: 'gold' },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'ongoing',
      isExclusive: true
    }
  ]
  
  return challenges
}

// 获取徽章列表
export const getBadgeList = () => {
  return [
    // 任务类徽章
    { id: 'badge_task_starter', name: '任务新手', description: '完成第一个任务', icon: '📝', tier: 'bronze', category: 'task', evolutionStage: 1 },
    { id: 'badge_task_master', name: '任务大师', description: '累计完成100个任务', icon: '📋', tier: 'silver', category: 'task', evolutionStage: 2, evolutionTarget: 100 },
    { id: 'badge_task_legend', name: '任务传奇', description: '累计完成500个任务', icon: '🏅', tier: 'gold', category: 'task', evolutionStage: 3, evolutionTarget: 500 },
    { id: 'badge_task_god', name: '任务之神', description: '累计完成1000个任务', icon: '👑', tier: 'diamond', category: 'task', evolutionStage: 4, evolutionTarget: 1000 },
    
    // 坚持类徽章
    { id: 'badge_streak_3', name: '初露头角', description: '连续3天完成任务', icon: '🌱', tier: 'bronze', category: 'streak', evolutionStage: 1 },
    { id: 'badge_streak_7', name: '坚持不懈', description: '连续7天完成任务', icon: '🔥', tier: 'silver', category: 'streak', evolutionStage: 2, evolutionTarget: 7 },
    { id: 'badge_streak_30', name: '月度之星', description: '连续30天完成任务', icon: '⭐', tier: 'gold', category: 'streak', evolutionStage: 3, evolutionTarget: 30 },
    { id: 'badge_streak_100', name: '坚持传奇', description: '连续100天完成任务', icon: '💫', tier: 'diamond', category: 'streak', evolutionStage: 4, evolutionTarget: 100 },
    
    // 积分类徽章
    { id: 'badge_points_100', name: '小试牛刀', description: '累计获得100积分', icon: '💰', tier: 'bronze', category: 'points', evolutionStage: 1 },
    { id: 'badge_points_500', name: '财富新贵', description: '累计获得500积分', icon: '💎', tier: 'silver', category: 'points', evolutionStage: 2, evolutionTarget: 500 },
    { id: 'badge_points_1000', name: '积分大户', description: '累计获得1000积分', icon: '💸', tier: 'gold', category: 'points', evolutionStage: 3, evolutionTarget: 1000 },
    { id: 'badge_points_5000', name: '积分传奇', description: '累计获得5000积分', icon: '🤑', tier: 'diamond', category: 'points', evolutionStage: 4, evolutionTarget: 5000 },
    
    // 赛季专属徽章
    { id: 'badge_spring_2024', name: '2024春节徽章', description: '2024春节限定', icon: '🧧', tier: 'gold', category: 'seasonal', evolutionStage: 1, isExclusive: true },
    { id: 'badge_summer_2024', name: '2024暑假徽章', description: '2024暑假限定', icon: '☀️', tier: 'gold', category: 'seasonal', evolutionStage: 1, isExclusive: true },
    { id: 'badge_autumn_2024', name: '2024国庆徽章', description: '2024国庆限定', icon: '🍂', tier: 'gold', category: 'seasonal', evolutionStage: 1, isExclusive: true },
    { id: 'badge_winter_2024', name: '2024寒假徽章', description: '2024寒假限定', icon: '❄️', tier: 'gold', category: 'seasonal', evolutionStage: 1, isExclusive: true },
    
    // 家庭类徽章
    { id: 'badge_family_1', name: '家庭新成员', description: '加入第一个家庭', icon: '🏠', tier: 'bronze', category: 'family', evolutionStage: 1 },
    { id: 'badge_family_star', name: '家庭之星', description: '成为家庭积分第一名', icon: '🌟', tier: 'silver', category: 'family', evolutionStage: 2 },
    { id: 'badge_family_legend', name: '家庭传奇', description: '家庭累计积分突破10000', icon: '👨‍👩‍👧‍👦', tier: 'gold', category: 'family', evolutionStage: 3 },
    
    // 成就类徽章
    { id: 'badge_achievement_10', name: '成就猎人', description: '解锁10个成就', icon: '🎯', tier: 'silver', category: 'achievement', evolutionStage: 1 },
    { id: 'badge_achievement_50', name: '成就大师', description: '解锁50个成就', icon: '🏆', tier: 'gold', category: 'achievement', evolutionStage: 2 },
    { id: 'badge_achievement_100', name: '成就传奇', description: '解锁100个成就', icon: '🥇', tier: 'diamond', category: 'achievement', evolutionStage: 3 }
  ]
}

// 获取用户徽章数据
export const getUserBadges = () => {
  try {
    const stored = uni.getStorageSync(USER_BADGES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (e) {
    console.error('获取用户徽章失败:', e)
    return {}
  }
}

// 保存用户徽章数据
export const saveUserBadges = (badges) => {
  uni.setStorageSync(USER_BADGES_KEY, JSON.stringify(badges))
}

// 更新徽章进化
export const updateBadgeEvolution = (badgeId, newTier) => {
  const userBadges = getUserBadges()
  if (!userBadges[badgeId]) {
    userBadges[badgeId] = { unlocked: false, tier: 'bronze', evolvedAt: null }
  }
  userBadges[badgeId].tier = newTier
  userBadges[badgeId].evolvedAt = new Date().toISOString()
  if (!userBadges[badgeId].unlocked) {
    userBadges[badgeId].unlocked = true
    userBadges[badgeId].unlockedAt = new Date().toISOString()
  }
  saveUserBadges(userBadges)
  return userBadges[badgeId]
}

// 解锁徽章
export const unlockBadge = (badgeId, tier = 'bronze') => {
  const userBadges = getUserBadges()
  userBadges[badgeId] = {
    unlocked: true,
    tier,
    unlockedAt: new Date().toISOString(),
    evolvedAt: null
  }
  saveUserBadges(userBadges)
  return userBadges[badgeId]
}

// 获取徽章进化所需碎片
export const getBadgeFragmentsRequired = (currentTier) => {
  const fragmentsMap = {
    bronze: 0,
    silver: 10,
    gold: 25,
    diamond: 50
  }
  return fragmentsMap[currentTier] || 0
}

// 获取用户碎片数量
export const getUserFragments = () => {
  try {
    const stored = uni.getStorageSync('user_fragments')
    return stored ? parseInt(stored) : 0
  } catch (e) {
    return 0
  }
}

// 添加碎片
export const addFragments = (count) => {
  const current = getUserFragments()
  uni.setStorageSync('user_fragments', (current + count).toString())
  return current + count
}

// 模拟排行榜数据
export const getSeasonalLeaderboard = (scope = 'global') => {
  // 模拟数据
  const mockData = {
    global: [
      { rank: 1, childId: 'user_001', childName: '小明', avatar: '🧒', points: 2580, score: 95.5, change: 2 },
      { rank: 2, childId: 'user_002', childName: '小红', avatar: '👧', points: 2450, score: 92.3, change: -1 },
      { rank: 3, childId: 'user_003', childName: '小华', avatar: '👦', points: 2380, score: 89.7, change: 1 },
      { rank: 4, childId: 'user_004', childName: '小丽', avatar: '👧', points: 2250, score: 86.2, change: -2 },
      { rank: 5, childId: 'user_005', childName: '小强', avatar: '👦', points: 2100, score: 82.1, change: 0 },
      { rank: 6, childId: 'user_006', childName: '小美', avatar: '👧', points: 1980, score: 78.5, change: 1 },
      { rank: 7, childId: 'user_007', childName: '小杰', avatar: '👦', points: 1850, score: 75.3, change: -1 },
      { rank: 8, childId: 'user_008', childName: '小雨', avatar: '👧', points: 1720, score: 71.8, change: 0 },
      { rank: 9, childId: 'user_009', childName: '小风', avatar: '👦', points: 1600, score: 68.4, change: 2 },
      { rank: 10, childId: 'user_010', childName: '小云', avatar: '👧', points: 1480, score: 65.2, change: -1 }
    ],
    class: [
      { rank: 1, childId: 'user_011', childName: '小东', avatar: '👦', points: 1280, score: 88.5, change: 1 },
      { rank: 2, childId: 'user_012', childName: '小西', avatar: '👧', points: 1150, score: 82.3, change: -1 },
      { rank: 3, childId: 'user_013', childName: '小南', avatar: '👦', points: 1080, score: 79.7, change: 0 },
      { rank: 4, childId: 'user_014', childName: '小北', avatar: '👧', points: 950, score: 76.2, change: 1 }
    ],
    friend: [
      { rank: 1, childId: 'user_015', childName: '乐乐', avatar: '🧒', points: 880, score: 85.5, change: 0 },
      { rank: 2, childId: 'user_016', childName: '豆豆', avatar: '👧', points: 750, score: 78.3, change: 1 },
      { rank: 3, childId: 'user_017', childName: '球球', avatar: '👦', points: 680, score: 72.7, change: -1 }
    ]
  }
  
  return mockData[scope] || mockData.global
}

// 获取历史赛季
export const getHistoricalSeasons = () => {
  return [
    { id: 'spring_2024', name: '2024春节', icon: '🧧', status: 'finished', rewards: [] },
    { id: 'summer_2024', name: '2024暑假', icon: '☀️', status: 'finished', rewards: [] },
    { id: 'autumn_2024', name: '2024国庆', icon: '🍂', status: 'finished', rewards: [] },
    { id: 'winter_2024', name: '2024寒假', icon: '❄️', status: 'finished', rewards: [] }
  ]
}

// 获取赛季奖励
export const getSeasonRewards = () => {
  return {
    1: { points: 500, badge: 'badge_season_gold_1', title: '赛季冠军' },
    2: { points: 300, badge: 'badge_season_silver_1', title: '亚军' },
    3: { points: 200, badge: 'badge_season_bronze_1', title: '季军' },
    top10: { points: 100, badge: null, title: 'Top 10' },
    top50: { points: 50, badge: null, title: 'Top 50' },
    participant: { points: 20, badge: null, title: '参与者' }
  }
}

export default {
  SEASON_THEMES,
  BADGE_TIERS,
  getCurrentSeason,
  getSeasonDateRange,
  getSeasonalChallenges,
  getBadgeList,
  getUserBadges,
  saveUserBadges,
  updateBadgeEvolution,
  unlockBadge,
  getBadgeFragmentsRequired,
  getUserFragments,
  addFragments,
  getSeasonalLeaderboard,
  getHistoricalSeasons,
  getSeasonRewards
}
