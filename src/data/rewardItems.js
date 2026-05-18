/**
 * V12 积分商城虚拟商品数据
 * 30+ 虚拟商品，分为 6 个分类
 */

export const CATEGORIES = {
  MEDAL: 'medal',       // 勋章
  TITLE: 'title',       // 称号
  AVATAR_FRAME: 'avatar_frame', // 头像框
  BACKGROUND: 'background',      // 背景
  EMOJI: 'emoji',       // 表情包
  BADGE: 'badge'        // 徽章
}

export const CATEGORY_NAMES = {
  [CATEGORIES.MEDAL]: '勋章',
  [CATEGORIES.TITLE]: '称号',
  [CATEGORIES.AVATAR_FRAME]: '头像框',
  [CATEGORIES.BACKGROUND]: '背景',
  [CATEGORIES.EMOJI]: '表情包',
  [CATEGORIES.BADGE]: '徽章'
}

export const CATEGORY_ICONS = {
  [CATEGORIES.MEDAL]: '🏅',
  [CATEGORIES.TITLE]: '👑',
  [CATEGORIES.AVATAR_FRAME]: '🖼️',
  [CATEGORIES.BACKGROUND]: '🎨',
  [CATEGORIES.EMOJI]: '😀',
  [CATEGORIES.BADGE]: '🎖️'
}

/**
 * 30+ 虚拟商品预设数据
 */
export const DEFAULT_REWARD_ITEMS = [
  // ========== 勋章类 (10个) - 50-200积分 ==========
  {
    id: 'medal-sports-01',
    name: '运动达人勋章',
    description: '连续完成7天运动任务获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 100,
    stock: -1,
    icon: '🏅',
    active: true
  },
  {
    id: 'medal-reading-01',
    name: '阅读之星勋章',
    description: '累计阅读30天获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 150,
    stock: -1,
    icon: '📚',
    active: true
  },
  {
    id: 'medal-earlybird-01',
    name: '早起冠军勋章',
    description: '连续14天在8点前起床获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 120,
    stock: -1,
    icon: '🌅',
    active: true
  },
  {
    id: 'medal-clean-01',
    name: '整洁小能手勋章',
    description: '连续完成7天整理任务获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 80,
    stock: -1,
    icon: '🧹',
    active: true
  },
  {
    id: 'medal-math-01',
    name: '数学小天才勋章',
    description: '完成全部数学任务获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 200,
    stock: -1,
    icon: '🧮',
    active: true
  },
  {
    id: 'medal-art-01',
    name: '艺术小达人勋章',
    description: '完成10次绘画或手工任务获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 150,
    stock: -1,
    icon: '🎨',
    active: true
  },
  {
    id: 'medal-music-01',
    name: '音乐小天使勋章',
    description: '连续练习乐器14天获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 180,
    stock: -1,
    icon: '🎵',
    active: true
  },
  {
    id: 'medal-kindness-01',
    name: '助人为乐勋章',
    description: '累计帮助他人10次获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 120,
    stock: -1,
    icon: '🤝',
    active: true
  },
  {
    id: 'medal-stamina-01',
    name: '坚持不懈勋章',
    description: '连续完成任务30天获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 200,
    stock: -1,
    icon: '💪',
    active: true
  },
  {
    id: 'medal-champion-01',
    name: '全能冠军勋章',
    description: '同时获得5种不同勋章获得',
    category: CATEGORIES.MEDAL,
    pointsCost: 300,
    stock: -1,
    icon: '🏆',
    active: true
  },

  // ========== 称号类 (5个) - 30-100积分 ==========
  {
    id: 'title-scholar-01',
    name: '小小学者',
    description: '累计获得100积分即可获得',
    category: CATEGORIES.TITLE,
    pointsCost: 50,
    stock: -1,
    icon: '🎓',
    active: true
  },
  {
    id: 'title-athlete-01',
    name: '运动健将',
    description: '累计运动积分达200获得',
    category: CATEGORIES.TITLE,
    pointsCost: 80,
    stock: -1,
    icon: '⚽',
    active: true
  },
  {
    id: 'title-star-01',
    name: '学习之星',
    description: '累计学习积分达300获得',
    category: CATEGORIES.TITLE,
    pointsCost: 100,
    stock: -1,
    icon: '⭐',
    active: true
  },
  {
    id: 'title-helper-01',
    name: '勤劳小帮手',
    description: '完成家务任务20次获得',
    category: CATEGORIES.TITLE,
    pointsCost: 60,
    stock: -1,
    icon: '🌟',
    active: true
  },
  {
    id: 'title-master-01',
    name: '技能小大师',
    description: '解锁全部技能树节点获得',
    category: CATEGORIES.TITLE,
    pointsCost: 150,
    stock: -1,
    icon: '👑',
    active: true
  },

  // ========== 头像框类 (5个) - 100-300积分 ==========
  {
    id: 'frame-crown-01',
    name: '金色皇冠头像框',
    description: '尊贵的金色皇冠头像框',
    category: CATEGORIES.AVATAR_FRAME,
    pointsCost: 200,
    stock: -1,
    icon: '👑',
    active: true
  },
  {
    id: 'frame-rainbow-01',
    name: '彩虹光环头像框',
    description: '七彩彩虹环绕的头像框',
    category: CATEGORIES.AVATAR_FRAME,
    pointsCost: 180,
    stock: -1,
    icon: '🌈',
    active: true
  },
  {
    id: 'frame-star-01',
    name: '星光闪烁头像框',
    description: '闪烁星星的头像框',
    category: CATEGORIES.AVATAR_FRAME,
    pointsCost: 150,
    stock: -1,
    icon: '✨',
    active: true
  },
  {
    id: 'frame-heart-01',
    name: '爱心环绕头像框',
    description: '粉红爱心环绕的头像框',
    category: CATEGORIES.AVATAR_FRAME,
    pointsCost: 120,
    stock: -1,
    icon: '💖',
    active: true
  },
  {
    id: 'frame-fire-01',
    name: '烈焰战神头像框',
    description: '火焰纹章头像框，强者专属',
    category: CATEGORIES.AVATAR_FRAME,
    pointsCost: 300,
    stock: -1,
    icon: '🔥',
    active: true
  },

  // ========== 背景类 (5个) - 80-200积分 ==========
  {
    id: 'bg-space-01',
    name: '梦幻星空背景',
    description: '璀璨星空梦幻背景',
    category: CATEGORIES.BACKGROUND,
    pointsCost: 150,
    stock: -1,
    icon: '🌌',
    active: true
  },
  {
    id: 'bg-ocean-01',
    name: '蔚蓝海洋背景',
    description: '清凉夏日海洋背景',
    category: CATEGORIES.BACKGROUND,
    pointsCost: 150,
    stock: -1,
    icon: '🌊',
    active: true
  },
  {
    id: 'bg-forest-01',
    name: '清新森林背景',
    description: '绿意盎然森林背景',
    category: CATEGORIES.BACKGROUND,
    pointsCost: 120,
    stock: -1,
    icon: '🌲',
    active: true
  },
  {
    id: 'bg-sunset-01',
    name: '浪漫晚霞背景',
    description: '温暖浪漫晚霞背景',
    category: CATEGORIES.BACKGROUND,
    pointsCost: 100,
    stock: -1,
    icon: '🌅',
    active: true
  },
  {
    id: 'bg-sakura-01',
    name: '粉色樱花背景',
    description: '浪漫樱花飘落背景',
    category: CATEGORIES.BACKGROUND,
    pointsCost: 200,
    stock: -1,
    icon: '🌸',
    active: true
  },

  // ========== 表情包类 (5个) - 20积分 ==========
  {
    id: 'emoji-happy-01',
    name: '开心大笑表情包',
    description: '😄 开心大笑系列表情',
    category: CATEGORIES.EMOJI,
    pointsCost: 20,
    stock: -1,
    icon: '😄',
    active: true
  },
  {
    id: 'emoji-love-01',
    name: '爱心满满表情包',
    description: '❤️ 爱心系列表情',
    category: CATEGORIES.EMOJI,
    pointsCost: 20,
    stock: -1,
    icon: '❤️',
    active: true
  },
  {
    id: 'emoji-star-01',
    name: '星星眼表情包',
    description: '🤩 星星眼系列表情',
    category: CATEGORIES.EMOJI,
    pointsCost: 20,
    stock: -1,
    icon: '🤩',
    active: true
  },
  {
    id: 'emoji-cool-01',
    name: '酷帅表情包',
    description: '😎 酷帅系列表情',
    category: CATEGORIES.EMOJI,
    pointsCost: 20,
    stock: -1,
    icon: '😎',
    active: true
  },
  {
    id: 'emoji-proud-01',
    name: '骄傲叉腰表情包',
    description: '😤 骄傲叉腰系列表情',
    category: CATEGORIES.EMOJI,
    pointsCost: 20,
    stock: -1,
    icon: '😤',
    active: true
  },

  // ========== 徽章类 (5个) - 50-150积分 ==========
  {
    id: 'badge-newbie-01',
    name: '新手徽章',
    description: '首次完成任务获得',
    category: CATEGORIES.BADGE,
    pointsCost: 50,
    stock: -1,
    icon: '🎫',
    active: true
  },
  {
    id: 'badge-weekstreak-01',
    name: '7天连续徽章',
    description: '连续签到7天获得',
    category: CATEGORIES.BADGE,
    pointsCost: 80,
    stock: -1,
    icon: '📅',
    active: true
  },
  {
    id: 'badge-monthstreak-01',
    name: '30天连续徽章',
    description: '连续签到30天获得',
    category: CATEGORIES.BADGE,
    pointsCost: 150,
    stock: -1,
    icon: '🏅',
    active: true
  },
  {
    id: 'badge-firstexchange-01',
    name: '首次兑换徽章',
    description: '首次在积分商城兑换商品获得',
    category: CATEGORIES.BADGE,
    pointsCost: 50,
    stock: -1,
    icon: '🎁',
    active: true
  },
  {
    id: 'badge-top10-01',
    name: '排行榜达人徽章',
    description: '进入家庭积分排行榜前10获得',
    category: CATEGORIES.BADGE,
    pointsCost: 120,
    stock: -1,
    icon: '🎖️',
    active: true
  }
]

export default DEFAULT_REWARD_ITEMS
