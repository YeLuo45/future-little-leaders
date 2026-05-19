/**
 * V95 World Culture Service
 * 世界文化探索服务层
 * 环球文化之旅、各国风土人情、文化体验活动
 */

// ==================== 常量定义 ====================

// 文化探索类型
export const CULTURE_TYPE = {
  JOURNEY: 'journey',           // 环球文化之旅
  CUSTOMS: 'customs',            // 风土人情
  ACTIVITIES: 'activities'      // 文化体验活动
}

// 子类型 - 环球文化之旅
export const JOURNEY_TYPE = {
  WORLD_TRIP: 'world_trip',     // 环球文化之旅
  COUNTRY_EXPLORE: 'country_explore', // 国家探索
  CULTURE_ROUTE: 'culture_route' // 文化路线
}

// 子类型 - 风土人情
export const CUSTOMS_TYPE = {
  LOCAL_CUSTOMS: 'local_customs', // 风土人情
  FESTIVAL: 'festival',          // 节日庆典
  TRADITION: 'tradition'         // 传统习俗
}

// 子类型 - 文化体验活动
export const ACTIVITIES_TYPE = {
  CULTURAL_ACTIVITY: 'cultural_activity', // 文化体验活动
  HANDICRAFT: 'handicraft',        // 手工制作
  FOOD_EXPLORE: 'food_explore'     // 美食探索
}

// 难度级别
export const DIFFICULTY_LEVEL = {
  EASY: 'easy',         // 简单
  MEDIUM: 'medium',     // 中等
  HARD: 'hard'          // 困难
}

// 探索状态
export const EXPLORE_STATUS = {
  AVAILABLE: 'available',   // 可探索
  IN_PROGRESS: 'in_progress', // 进行中
  COMPLETED: 'completed'     // 已完成
}

// 奖励类型
export const CULTURE_REWARD_TYPE = {
  POINTS: 'points',           // 积分
  BADGE: 'badge',             // 徽章
  STAMP: 'stamp'              // 印章
}

// localStorage keys
const CULTURES_KEY = 'world_cultures'
const EXPLORATIONS_KEY = 'world_culture_explorations'
const STAMPS_KEY = 'world_culture_stamps'
const COMPLETED_ACTIVITIES_KEY = 'world_culture_completed'

// ==================== 辅助函数 ====================

function generateId(prefix = 'wculture') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

function now() {
  return new Date().toISOString()
}

// ==================== 内置文化数据 ====================

const BUILT_IN_CULTURES = [
  // 环球文化之旅 - 国家探索
  {
    id: 'country_china',
    name: '🇨🇳 中国',
    type: CULTURE_TYPE.JOURNEY,
    subType: JOURNEY_TYPE.COUNTRY_EXPLORE,
    description: '中华文明，上下五千年。探索中国传统文化、四大发明、丝绸之路。',
    coverImage: '/static/images/culture/china.jpg',
    difficulty: DIFFICULTY_LEVEL.EASY,
    points: 50,
    badge: '中国探索家',
    tags: ['亚洲', '文明古国', '传统文化'],
    facts: [
      { title: '长城', description: '中国古代伟大的防御工程，全长2万余公里' },
      { title: '四大发明', description: '造纸术、印刷术、火药、指南针' },
      { title: '丝绸之路', description: '连接东西方贸易与文化的古老商路' }
    ],
    activities: ['Chinese Calligraphy', 'Paper Cutting', 'Chinese Knot'],
    createdAt: now()
  },
  {
    id: 'country_japan',
    name: '🇯🇵 日本',
    type: CULTURE_TYPE.JOURNEY,
    subType: JOURNEY_TYPE.COUNTRY_EXPLORE,
    description: '和风文化，精致的传统与现代科技的完美融合。',
    coverImage: '/static/images/culture/japan.jpg',
    difficulty: DIFFICULTY_LEVEL.MEDIUM,
    points: 60,
    badge: '日本文化达人',
    tags: ['亚洲', '和风', '科技'],
    facts: [
      { title: '樱花', description: '日本国花，象征武士道精神' },
      { title: '茶道', description: '日本传统茶艺，讲究一期一会' },
      { title: '忍者', description: '日本古代特殊职业，擅长伪装与暗杀' }
    ],
    activities: ['Origami', 'Tea Ceremony', 'Kimono Experience'],
    createdAt: now()
  },
  {
    id: 'country_france',
    name: '🇫🇷 法国',
    type: CULTURE_TYPE.JOURNEY,
    subType: JOURNEY_TYPE.COUNTRY_EXPLORE,
    description: '浪漫之都，艺术与时尚的殿堂。探索法国的艺术、美食与建筑。',
    coverImage: '/static/images/culture/france.jpg',
    difficulty: DIFFICULTY_LEVEL.MEDIUM,
    points: 70,
    badge: '法国文化专家',
    tags: ['欧洲', '浪漫', '艺术'],
    facts: [
      { title: '埃菲尔铁塔', description: '巴黎地标，高324米' },
      { title: '卢浮宫', description: '世界最大的艺术博物馆' },
      { title: '马卡龙', description: '法国经典甜点，精致美味' }
    ],
    activities: ['French Pastry', 'Art Museum Tour', 'French Dance'],
    createdAt: now()
  },
  {
    id: 'country_egypt',
    name: '🇪🇬 埃及',
    type: CULTURE_TYPE.JOURNEY,
    subType: JOURNEY_TYPE.COUNTRY_EXPLORE,
    description: '古埃及文明，金字塔与狮身人面像的神秘世界。',
    coverImage: '/static/images/culture/egypt.jpg',
    difficulty: DIFFICULTY_LEVEL.HARD,
    points: 80,
    badge: '埃及学徒',
    tags: ['非洲', '古文明', '神秘'],
    facts: [
      { title: '金字塔', description: '古代法老的陵墓，世界七大奇迹之一' },
      { title: '狮身人面像', description: '斯芬克斯，守护金字塔的神秘雕像' },
      { title: '尼罗河', description: '埃及母亲河，世界上最长的河流' }
    ],
    activities: ['Hieroglyph Writing', 'Mummy Story', 'Pyramid Building'],
    createdAt: now()
  },
  // 环球文化之旅 - 文化路线
  {
    id: 'route_silkroad',
    name: '🛤️ 丝绸之路',
    type: CULTURE_TYPE.JOURNEY,
    subType: JOURNEY_TYPE.CULTURE_ROUTE,
    description: '穿越千年，探寻连接东西方的古老商路。',
    coverImage: '/static/images/culture/silkroad.jpg',
    difficulty: DIFFICULTY_LEVEL.HARD,
    points: 100,
    badge: '丝路探险家',
    tags: ['历史', '贸易', '文明交汇'],
    facts: [
      { title: '敦煌莫高窟', description: '佛教艺术宝库，壁画精美绝伦' },
      { title: '新疆大巴扎', description: '充满异域风情的传统集市' },
      { title: '长安城', description: '唐朝首都，丝绸之路的起点' }
    ],
    activities: ['Silk Painting', 'Camel Riding', 'Spice Trade'],
    createdAt: now()
  },
  // 风土人情 - 节日庆典
  {
    id: 'festival_chinese_newyear',
    name: '🎊 春节',
    type: CULTURE_TYPE.CUSTOMS,
    subType: CUSTOMS_TYPE.FESTIVAL,
    description: '中国最重要的传统节日，阖家团圆，辞旧迎新。',
    coverImage: '/static/images/culture/chinese-newyear.jpg',
    difficulty: DIFFICULTY_LEVEL.EASY,
    points: 40,
    badge: '春节通',
    tags: ['中国', '传统节日', '团圆'],
    facts: [
      { title: '贴春联', description: '春节期间的传统习俗，祈求好运' },
      { title: '放鞭炮', description: '驱赶年兽，迎接新年' },
      { title: '发红包', description: '长辈给晚辈压岁钱，寓意平安' }
    ],
    activities: ['Paper Cutting', 'Red Envelope Art', 'Lantern Making'],
    createdAt: now()
  },
  {
    id: 'festival_diwali',
    name: '🪔 排灯节',
    type: CULTURE_TYPE.CUSTOMS,
    subType: CUSTOMS_TYPE.FESTIVAL,
    description: '印度光明节，庆祝光明战胜黑暗，正义战胜邪恶。',
    coverImage: '/static/images/culture/diwali.jpg',
    difficulty: DIFFICULTY_LEVEL.MEDIUM,
    points: 50,
    badge: '印度文化爱好者',
    tags: ['印度', '光明节', '灯节'],
    facts: [
      { title: '点灯', description: '用蜡烛和油灯照亮房屋，迎接幸运' },
      { title: ' Rangoli', description: '用彩色粉末绘制地板图案' },
      { title: '烟花', description: '庆祝活动的重要组成部分' }
    ],
    activities: ['Diya Making', 'Rangoli Art', 'Sweets Tasting'],
    createdAt: now()
  },
  // 风土人情 - 传统习俗
  {
    id: 'customs_japanese',
    name: '🎌 日本礼仪',
    type: CULTURE_TYPE.CUSTOMS,
    subType: CUSTOMS_TYPE.TRADITION,
    description: '日本传统礼仪文化，鞠躬、礼貌用语、茶道精神。',
    coverImage: '/static/images/culture/japanese-customs.jpg',
    difficulty: DIFFICULTY_LEVEL.MEDIUM,
    points: 55,
    badge: '礼仪达人',
    tags: ['日本', '礼仪', '传统'],
    facts: [
      { title: '鞠躬', description: '日本最基本的礼仪，不同角度代表不同含义' },
      { title: '不打扰别人', description: '在公共场合保持安静，不造成困扰' },
      { title: '拖鞋文化', description: '进入室内需要换拖鞋' }
    ],
    activities: ['Bow Practice', 'Tea Ceremony', 'Gift Wrapping'],
    createdAt: now()
  },
  // 文化体验活动 - 手工制作
  {
    id: 'handicraft_calligraphy',
    name: '✍️ 书法艺术',
    type: CULTURE_TYPE.ACTIVITIES,
    subType: ACTIVITIES_TYPE.HANDICRAFT,
    description: '学习中国传统书法，用毛笔书写汉字之美。',
    coverImage: '/static/images/culture/calligraphy.jpg',
    difficulty: DIFFICULTY_LEVEL.EASY,
    points: 30,
    badge: '书法小能手',
    tags: ['中国', '书法', '艺术'],
    facts: [
      { title: '文房四宝', description: '笔、墨、纸、砚，书法必备工具' },
      { title: '楷书', description: '规整端正，是最常见的书法字体' },
      { title: '毛笔', description: '用动物毛制成，柔软而有弹性' }
    ],
    activities: ['Brush Writing', 'Ink Grinding', 'Scroll Making'],
    createdAt: now()
  },
  {
    id: 'handicraft_origami',
    name: '📦 折纸艺术',
    type: CULTURE_TYPE.ACTIVITIES,
    subType: ACTIVITIES_TYPE.HANDICRAFT,
    description: '日本传统折纸艺术，一张纸变化出各种形状。',
    coverImage: '/static/images/culture/origami.jpg',
    difficulty: DIFFICULTY_LEVEL.EASY,
    points: 25,
    badge: '折纸大师',
    tags: ['日本', '手工', '创意'],
    facts: [
      { title: '千纸鹤', description: '象征和平与祝福的传统折纸' },
      { title: '和纸', description: '日本传统纸张，质地坚韧' },
      { title: '折纸数学', description: '现代折纸与数学结合' }
    ],
    activities: ['Crane Folding', 'Box Folding', 'Decoration Making'],
    createdAt: now()
  },
  // 文化体验活动 - 美食探索
  {
    id: 'food_pizza',
    name: '🍕 意大利披萨',
    type: CULTURE_TYPE.ACTIVITIES,
    subType: ACTIVITIES_TYPE.FOOD_EXPLORE,
    description: '探索意大利披萨的起源与制作，玛格丽特的传说。',
    coverImage: '/static/images/culture/pizza.jpg',
    difficulty: DIFFICULTY_LEVEL.EASY,
    points: 35,
    badge: '披萨小厨神',
    tags: ['意大利', '美食', '烹饪'],
    facts: [
      { title: '玛格丽特披萨', description: '以意大利王后命名的经典披萨' },
      { title: '那不勒斯', description: '披萨的发源地' },
      { title: '番茄酱', description: '意大利披萨的重要配料' }
    ],
    activities: ['Dough Making', 'Topping Practice', 'Oven Baking'],
    createdAt: now()
  },
  {
    id: 'food_sushi',
    name: '🍣 日本寿司',
    type: CULTURE_TYPE.ACTIVITIES,
    subType: ACTIVITIES_TYPE.FOOD_EXPLORE,
    description: '学习日本寿司文化，了解寿司的种类与礼仪。',
    coverImage: '/static/images/culture/sushi.jpg',
    difficulty: DIFFICULTY_LEVEL.MEDIUM,
    points: 45,
    badge: '寿司达人',
    tags: ['日本', '美食', '海鲜'],
    facts: [
      { title: '握寿司', description: '师傅用手捏制的经典寿司' },
      { title: '新鲜食材', description: '寿司讲究食材的新鲜度' },
      { title: '酱油与芥末', description: '寿司的标准搭配调料' }
    ],
    activities: ['Rice Shaping', 'Fish Cutting', 'Roll Making'],
    createdAt: now()
  }
]

// ==================== 服务类 ====================

class WorldCultureService {
  constructor() {
    this._initData()
  }

  // 初始化数据
  _initData() {
    try {
      const stored = uni.getStorageSync(CULTURES_KEY)
      if (!stored) {
        uni.setStorageSync(CULTURES_KEY, JSON.stringify(BUILT_IN_CULTURES))
      }
    } catch (e) {
      console.error('Failed to init world culture data:', e)
    }
  }

  // 获取所有文化数据
  getAllCultures() {
    try {
      const stored = uni.getStorageSync(CULTURES_KEY)
      return stored ? JSON.parse(stored) : BUILT_IN_CULTURES
    } catch (e) {
      console.error('Failed to get cultures:', e)
      return BUILT_IN_CULTURES
    }
  }

  // 按类型获取文化数据
  getCulturesByType(type) {
    const cultures = this.getAllCultures()
    return cultures.filter(c => c.type === type)
  }

  // 按子类型获取文化数据
  getCulturesBySubType(subType) {
    const cultures = this.getAllCultures()
    return cultures.filter(c => c.subType === subType)
  }

  // 获取单个文化数据
  getCultureById(id) {
    const cultures = this.getAllCultures()
    return cultures.find(c => c.id === id)
  }

  // 获取探索记录
  getExplorations(babyId) {
    try {
      const stored = uni.getStorageSync(`${EXPLORATIONS_KEY}_${babyId}`)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Failed to get explorations:', e)
      return []
    }
  }

  // 保存探索记录
  saveExploration(babyId, exploration) {
    try {
      const explorations = this.getExplorations(babyId)
      const index = explorations.findIndex(e => e.id === exploration.id)
      if (index >= 0) {
        explorations[index] = exploration
      } else {
        explorations.push(exploration)
      }
      uni.setStorageSync(`${EXPLORATIONS_KEY}_${babyId}`, JSON.stringify(explorations))
      return true
    } catch (e) {
      console.error('Failed to save exploration:', e)
      return false
    }
  }

  // 开始探索
  startExploration(babyId, cultureId) {
    const exploration = {
      id: generateId('explore'),
      babyId,
      cultureId,
      status: EXPLORE_STATUS.IN_PROGRESS,
      startedAt: now(),
      completedAt: null,
      progress: 0
    }
    this.saveExploration(babyId, exploration)
    return exploration
  }

  // 完成探索
  completeExploration(babyId, cultureId) {
    const explorations = this.getExplorations(babyId)
    const exploration = explorations.find(e => e.cultureId === cultureId)
    if (exploration) {
      exploration.status = EXPLORE_STATUS.COMPLETED
      exploration.completedAt = now()
      exploration.progress = 100
      this.saveExploration(babyId, exploration)
    }
    return exploration
  }

  // 获取印章
  getStamps(babyId) {
    try {
      const stored = uni.getStorageSync(`${STAMPS_KEY}_${babyId}`)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Failed to get stamps:', e)
      return []
    }
  }

  // 收集印章
  collectStamp(babyId, cultureId) {
    try {
      const stamps = this.getStamps(babyId)
      const culture = this.getCultureById(cultureId)
      if (!culture) return null

      const stamp = {
        id: generateId('stamp'),
        babyId,
        cultureId,
        cultureName: culture.name,
        badge: culture.badge,
        points: culture.points,
        collectedAt: now()
      }
      stamps.push(stamp)
      uni.setStorageSync(`${STAMPS_KEY}_${babyId}`, JSON.stringify(stamps))
      return stamp
    } catch (e) {
      console.error('Failed to collect stamp:', e)
      return null
    }
  }

  // 获取已完成活动
  getCompletedActivities(babyId) {
    try {
      const stored = uni.getStorageSync(`${COMPLETED_ACTIVITIES_KEY}_${babyId}`)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Failed to get completed activities:', e)
      return []
    }
  }

  // 完成活动
  completeActivity(babyId, cultureId, activityName) {
    try {
      const completed = this.getCompletedActivities(babyId)
      const culture = this.getCultureById(cultureId)
      const entry = {
        id: generateId('completed'),
        babyId,
        cultureId,
        activityName,
        cultureName: culture?.name || '',
        completedAt: now()
      }
      completed.push(entry)
      uni.setStorageSync(`${COMPLETED_ACTIVITIES_KEY}_${babyId}`, JSON.stringify(completed))
      return entry
    } catch (e) {
      console.error('Failed to complete activity:', e)
      return null
    }
  }

  // 获取统计信息
  getStatistics(babyId) {
    const cultures = this.getAllCultures()
    const explorations = this.getExplorations(babyId)
    const stamps = this.getStamps(babyId)
    const completedActivities = this.getCompletedActivities(babyId)

    const completedCount = explorations.filter(e => e.status === EXPLORE_STATUS.COMPLETED).length
    const totalPoints = stamps.reduce((sum, s) => sum + (s.points || 0), 0)

    return {
      totalCultures: cultures.length,
      completedCultures: completedCount,
      totalStamps: stamps.length,
      totalActivities: completedActivities.length,
      totalPoints,
      explorationRate: cultures.length > 0 ? Math.round((completedCount / cultures.length) * 100) : 0
    }
  }
}

// 导出单例
const worldCultureService = new WorldCultureService()
export default worldCultureService

// 导出常量
export {
  CULTURE_TYPE,
  JOURNEY_TYPE,
  CUSTOMS_TYPE,
  ACTIVITIES_TYPE,
  DIFFICULTY_LEVEL,
  EXPLORE_STATUS,
  CULTURE_REWARD_TYPE
}
