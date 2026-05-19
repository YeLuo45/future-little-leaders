// Badge Service - Achievement Badge System
const BADGE_CATEGORIES = ['学习', '运动', '社交', '创造', '品德', '领导力']
const BADGE_RARITIES = ['普通', '稀有', '史诗', '传说']

const BADGE_LIBRARY = [
  // 学习类
  { id: 'study-streak-7', name: '学习达人', category: '学习', rarity: '普通', description: '连续7天完成学习任务', icon: '📚', condition: 'streak', value: 7 },
  { id: 'study-streak-30', name: '学习标兵', category: '学习', rarity: '稀有', description: '连续30天完成学习任务', icon: '🎓', condition: 'streak', value: 30 },
  { id: 'math-master', name: '数学大师', category: '学习', rarity: '史诗', description: '数学游戏通关100次', icon: '🧮', condition: 'mathWins', value: 100 },
  { id: 'reading-legend', name: '阅读传奇', category: '学习', rarity: '传说', description: '阅读100本书籍', icon: '📖', condition: 'booksRead', value: 100 },
  // 运动类
  { id: 'sport-starter', name: '运动起步', category: '运动', rarity: '普通', description: '完成10次运动任务', icon: '🏃', condition: 'sportTasks', value: 10 },
  { id: 'sport-warrior', name: '运动健将', category: '运动', rarity: '稀有', description: '完成50次运动任务', icon: '🏆', condition: 'sportTasks', value: 50 },
  { id: 'marathon-kid', name: '小马拉松', category: '运动', rarity: '史诗', description: '累计运动时长超过10小时', icon: '🏅', condition: 'sportHours', value: 10 },
  // 社交类
  { id: 'social-butterfly', name: '社交达人', category: '社交', rarity: '普通', description: '添加5个好友', icon: '🤝', condition: 'friends', value: 5 },
  { id: 'helper', name: '小助手', category: '社交', rarity: '稀有', description: '帮助他人10次', icon: '💪', condition: 'helps', value: 10 },
  // 创造类
  { id: 'art-novice', name: '小画家', category: '创造', rarity: '普通', description: '完成5幅绘画作品', icon: '🎨', condition: 'artworks', value: 5 },
  { id: 'creator-master', name: '创作大师', category: '创造', rarity: '史诗', description: '完成50篇创作作品', icon: '✨', condition: 'creations', value: 50 },
  // 品德类
  { id: 'honesty-star', name: '诚实之星', category: '品德', rarity: '稀有', description: '坚持诚实记录100天', icon: '⭐', condition: 'honesty', value: 100 },
  { id: 'kindness-angel', name: '善良天使', category: '品德', rarity: '史诗', description: '累计帮助他人100次', icon: '👼', condition: 'kindness', value: 100 },
  // 领导力类
  { id: 'leader-rookie', name: '领导力起步', category: '领导力', rarity: '普通', description: '担任小组长完成任务', icon: '📋', condition: 'leadTasks', value: 1 },
  { id: 'team-captain', name: '团队领袖', category: '领导力', rarity: '稀有', description: '领导团队完成10个任务', icon: '🎖️', condition: 'leadTasks', value: 10 },
]

const BADGE_REWARDS = {
  '普通': 10,
  '稀有': 50,
  '史诗': 200,
  '传说': 1000
}

export function getBadgeLibrary() {
  return BADGE_LIBRARY
}

export function getBadgesByCategory(category) {
  return BADGE_LIBRARY.filter(b => b.category === category)
}

export function getBadgesByRarity(rarity) {
  return BADGE_LIBRARY.filter(b => b.rarity === rarity)
}

export function getBadgeById(id) {
  return BADGE_LIBRARY.find(b => b.id === id) || null
}

export function getBadgeReward(rarity) {
  return BADGE_REWARDS[rarity] || 0
}

export function getEarnedBadges(badgeData) {
  if (!badgeData) return []
  return BADGE_LIBRARY.filter(badge => badgeData[badge.id]?.earned)
}

export function getUnearnedBadges(badgeData) {
  if (!badgeData) return [...BADGE_LIBRARY]
  return BADGE_LIBRARY.filter(badge => !badgeData[badge.id]?.earned)
}

export function getBadgeProgress(badge, badgeData) {
  if (!badge || !badgeData) return 0
  const earned = badgeData[badge.id]
  if (!earned) return 0
  if (earned.progress !== undefined) return Math.min(earned.progress, badge.value)
  return badge.value
}

export function checkBadgeUnlock(badgeId, stats) {
  const badge = getBadgeById(badgeId)
  if (!badge) return false
  const { condition, value } = badge
  const current = stats[condition] || 0
  return current >= value
}

export function initBadgeData() {
  const data = {}
  BADGE_LIBRARY.forEach(badge => {
    data[badge.id] = { earned: false, earnedAt: null, progress: 0 }
  })
  return data
}
