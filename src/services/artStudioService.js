/**
 * V49 Creative Arts Studio Service
 * 创意艺术工作室 - 绘画/音乐/舞蹈/戏剧等艺术创作，记录孩子艺术成长轨迹，与成就系统联动奖励
 */

// Storage keys
const ART_WORKS_KEY = 'art_works'
const ART_CHALLENGES_KEY = 'art_challenges'
const ART_POINTS_KEY = 'art_points'
const ART_ACHIEVEMENTS_KEY = 'art_achievements'

// ============================================================================
// 艺术类型定义
// ============================================================================

export const ART_TYPES = {
  drawing: { id: 'drawing', name: '绘画', icon: '🎨', color: '#FF6B6B', pointsPerHour: 10 },
  music: { id: 'music', name: '音乐', icon: '🎵', color: '#4ECDC4', pointsPerHour: 12 },
  dance: { id: 'dance', name: '舞蹈', icon: '💃', color: '#FFB6C1', pointsPerHour: 15 },
  drama: { id: 'drama', name: '戏剧', icon: '🎭', color: '#DDA0DD', pointsPerHour: 12 },
  craft: { id: 'craft', name: '手工', icon: '✂️', color: '#96CEB4', pointsPerHour: 8 },
  photography: { id: 'photography', name: '摄影', icon: '📷', color: '#45B7D1', pointsPerHour: 10 }
}

export const ART_MATERIALS = {
  drawing: ['水彩笔', '蜡笔', '铅笔', '马克笔', '油画棒', '手指画'],
  music: ['钢琴', '吉他', '架子鼓', '小提琴', '声乐', '奥尔夫乐器'],
  dance: ['芭蕾', '街舞', '民族舞', '现代舞', '拉丁舞'],
  drama: ['台词', '表演', '配音', '木偶戏', '皮影戏'],
  craft: ['折纸', '黏土', '剪纸', '编织', '陶艺'],
  photography: ['风景', '人物', '静物', '微距', '创意']
}

// ============================================================================
// 绘画工具定义
// ============================================================================

export const DRAWING_TOOLS = {
  brush: { id: 'brush', name: '画笔', icon: '🖌️' },
  crayon: { id: 'crayon', name: '蜡笔', icon: '🖍️' },
  pencil: { id: 'pencil', name: '铅笔', icon: '✏️' },
  marker: { id: 'marker', name: '马克笔', icon: '🖊️' },
  eraser: { id: 'eraser', name: '橡皮', icon: '🧽' }
}

export const DRAWING_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF',
  '#9B59B6', '#E74C3C', '#2ECC71', '#3498DB', '#F39C12',
  '#1ABC9C', '#E91E63', '#8B4513', '#000000', '#FFFFFF'
]

// ============================================================================
// 音乐节拍定义
// ============================================================================

export const MUSIC_TEMPOS = {
  slow: { id: 'slow', name: '慢速', bpm: 60, multiplier: 0.8 },
  moderate: { id: 'moderate', name: '中速', bpm: 90, multiplier: 1.0 },
  fast: { id: 'fast', name: '快速', bpm: 120, multiplier: 1.2 },
  veryFast: { id: 'veryFast', name: '快速', bpm: 150, multiplier: 1.5 }
}

export const MUSIC_INSTRUMENTS = [
  { id: 'piano', name: '钢琴', icon: '🎹' },
  { id: 'guitar', name: '吉他', icon: '🎸' },
  { id: 'drum', name: '架子鼓', icon: '🥁' },
  { id: 'violin', name: '小提琴', icon: '🎻' },
  { id: 'flute', name: '长笛', icon: '🎵' },
  { id: 'voice', name: '声乐', icon: '🎤' }
]

// ============================================================================
// 艺术挑战主题
// ============================================================================

export const getArtChallenges = () => {
  try {
    const data = uni.getStorageSync(ART_CHALLENGES_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getArtChallenges error:', e)
  }
  return getDefaultArtChallenges()
}

export const getDefaultArtChallenges = () => [
  {
    id: 'challenge_1',
    title: '春天主题绘画',
    description: '用画笔描绘你心中的春天景色',
    type: 'drawing',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    status: 'active',
    participantCount: 128,
    maxParticipants: 200,
    points: 50,
    requiredWork: '一幅春天的绘画作品',
    isJoined: false,
    progress: 0
  },
  {
    id: 'challenge_2',
    title: '节奏大师',
    description: '创作一段30秒的节奏音乐',
    type: 'music',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'active',
    participantCount: 86,
    maxParticipants: 150,
    points: 40,
    requiredWork: '一段30秒的节奏创作',
    isJoined: true,
    progress: 60
  },
  {
    id: 'challenge_3',
    title: '我的第一次舞蹈表演',
    description: '录制一段15秒的舞蹈视频',
    type: 'dance',
    startDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    status: 'active',
    participantCount: 64,
    maxParticipants: 100,
    points: 45,
    requiredWork: '一段15秒的舞蹈表演',
    isJoined: false,
    progress: 0
  }
]

export const joinArtChallenge = (challengeId) => {
  try {
    const challenges = getArtChallenges()
    const challenge = challenges.find(c => c.id === challengeId)
    if (challenge && challenge.participantCount < challenge.maxParticipants) {
      challenge.participantCount++
      challenge.isJoined = true
      uni.setStorageSync(ART_CHALLENGES_KEY, JSON.stringify(challenges))
      return true
    }
    return false
  } catch (e) {
    console.error('joinArtChallenge error:', e)
    return false
  }
}

export const updateChallengeProgress = (challengeId, progress) => {
  try {
    const challenges = getArtChallenges()
    const challenge = challenges.find(c => c.id === challengeId)
    if (challenge) {
      challenge.progress = Math.min(100, progress)
      uni.setStorageSync(ART_CHALLENGES_KEY, JSON.stringify(challenges))
      return true
    }
    return false
  } catch (e) {
    console.error('updateChallengeProgress error:', e)
    return false
  }
}

// ============================================================================
// 艺术作品管理
// ============================================================================

export const getArtWorks = () => {
  try {
    const data = uni.getStorageSync(ART_WORKS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getArtWorks error:', e)
  }
  return getDefaultArtWorks()
}

export const getDefaultArtWorks = () => [
  {
    id: 'work_1',
    type: 'drawing',
    title: '我的小花园',
    description: '用蜡笔画的花园，有花朵和蝴蝶',
    imageData: '', // Base64 encoded image
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration: 45, // 分钟
    points: 8,
    isFavorite: true,
    shareCount: 5,
    commentCount: 3,
    tags: ['花园', '春天', '植物'],
    challengeId: null,
    feedback: '色彩运用很棒，继续加油！'
  },
  {
    id: 'work_2',
    type: 'music',
    title: '小星星变奏曲',
    description: '用钢琴弹奏的小星星变奏',
    audioData: '', // Audio file reference
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    duration: 30,
    points: 12,
    isFavorite: false,
    shareCount: 12,
    commentCount: 7,
    tags: ['钢琴', '古典', '儿童'],
    challengeId: null,
    feedback: '节奏稳定，音色优美！'
  },
  {
    id: 'work_3',
    type: 'dance',
    title: '趣味舞蹈',
    description: '和妈妈一起跳的亲子舞蹈',
    videoData: '', // Video file reference
    thumbnail: '',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    duration: 60,
    points: 15,
    isFavorite: true,
    shareCount: 25,
    commentCount: 15,
    tags: ['亲子', '趣味', '舞蹈'],
    challengeId: 'challenge_3',
    feedback: '表演很有感染力！'
  }
]

export const saveArtWork = (workData) => {
  try {
    const works = getArtWorks()
    const artType = ART_TYPES[workData.type] || ART_TYPES.drawing
    
    // 计算积分
    const duration = workData.duration || 30
    const points = Math.round(duration * artType.pointsPerHour / 60)
    
    const newWork = {
      id: 'work_' + Date.now(),
      type: workData.type || 'drawing',
      title: workData.title || artType.name + '作品',
      description: workData.description || '',
      imageData: workData.imageData || '', // For drawing
      audioData: workData.audioData || '', // For music
      videoData: workData.videoData || '', // For dance/drama
      thumbnail: workData.thumbnail || '',
      createdAt: new Date().toISOString(),
      duration: duration,
      points: points,
      isFavorite: false,
      shareCount: 0,
      commentCount: 0,
      tags: workData.tags || [],
      challengeId: workData.challengeId || null,
      feedback: '',
      aiSuggestions: generateAiSuggestions(workData.type)
    }
    
    works.unshift(newWork)
    uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(works))
    
    // 更新艺术积分
    updateArtPoints(points)
    
    return newWork
  } catch (e) {
    console.error('saveArtWork error:', e)
    return null
  }
}

export const deleteArtWork = (workId) => {
  try {
    const works = getArtWorks()
    const filtered = works.filter(w => w.id !== workId)
    uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('deleteArtWork error:', e)
    return false
  }
}

export const toggleFavorite = (workId) => {
  try {
    const works = getArtWorks()
    const work = works.find(w => w.id === workId)
    if (work) {
      work.isFavorite = !work.isFavorite
      uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(works))
      return work.isFavorite
    }
    return false
  } catch (e) {
    console.error('toggleFavorite error:', e)
    return false
  }
}

export const shareArtWork = (workId) => {
  try {
    const works = getArtWorks()
    const work = works.find(w => w.id === workId)
    if (work) {
      work.shareCount++
      uni.setStorageSync(ART_WORKS_KEY, JSON.stringify(works))
      // 增加分享积分
      updateArtPoints(2)
      return true
    }
    return false
  } catch (e) {
    console.error('shareArtWork error:', e)
    return false
  }
}

// ============================================================================
// 艺术积分系统
// ============================================================================

export const getArtPoints = () => {
  try {
    const data = uni.getStorageSync(ART_POINTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getArtPoints error:', e)
  }
  return {
    totalPoints: 156,
    level: 3,
    totalWorks: 12,
    totalHours: 8,
    achievements: [],
    weeklyGoal: 50,
    weeklyProgress: 35,
    streak: { current: 5, longest: 12 }
  }
}

export const updateArtPoints = (points) => {
  try {
    const data = getArtPoints()
    data.totalPoints += points
    data.totalWorks++
    
    // 计算等级 (每100积分升一级)
    data.level = Math.floor(data.totalPoints / 100) + 1
    
    // 计算累计创作时长 (估算)
    data.totalHours = Math.round(data.totalWorks * 0.5)
    
    // 更新周进度
    data.weeklyProgress += points
    
    uni.setStorageSync(ART_POINTS_KEY, JSON.stringify(data))
    return data
  } catch (e) {
    console.error('updateArtPoints error:', e)
    return null
  }
}

export const getWeeklyArtStats = () => {
  const works = getArtWorks()
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  
  const weekWorks = works.filter(w => new Date(w.createdAt) >= weekAgo)
  
  return {
    worksCount: weekWorks.length,
    totalPoints: weekWorks.reduce((sum, w) => sum + w.points, 0),
    byType: {
      drawing: weekWorks.filter(w => w.type === 'drawing').length,
      music: weekWorks.filter(w => w.type === 'music').length,
      dance: weekWorks.filter(w => w.type === 'dance').length,
      drama: weekWorks.filter(w => w.type === 'drama').length,
      craft: weekWorks.filter(w => w.type === 'craft').length,
      photography: weekWorks.filter(w => w.type === 'photography').length
    }
  }
}

// ============================================================================
// AI 评价和建议
// ============================================================================

export const generateAiSuggestions = (artType) => {
  const suggestions = {
    drawing: [
      '可以尝试使用对比色来增强画面冲击力',
      '注意近大远小的透视关系',
      '多观察生活中的事物，细节会让作品更生动',
      '可以学习一下光影的表现技巧'
    ],
    music: [
      '注意节奏的稳定性',
      '可以尝试不同的音色变化',
      '多听经典作品培养乐感',
      '多练习音阶和琶音'
    ],
    dance: [
      '动作可以更有表现力',
      '注意身体姿态的优雅',
      '多练习基本功',
      '表情可以更自然一些'
    ],
    drama: [
      '台词需要更有感情',
      '肢体语言可以更丰富',
      '多观察生活中的表演',
      '注意舞台走位'
    ],
    craft: [
      '注意细节的处理',
      '配色可以更大胆',
      '多尝试不同材料',
      '构图需要更完整'
    ],
    photography: [
      '注意光线的运用',
      '尝试不同的角度',
      '构图可以更有创意',
      '多学习摄影技巧'
    ]
  }
  
  const typeSuggestions = suggestions[artType] || suggestions.drawing
  // 随机返回1-2条建议
  const count = Math.random() > 0.5 ? 2 : 1
  const shuffled = typeSuggestions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// ============================================================================
// 创作时间线
// ============================================================================

export const getArtTimeline = () => {
  const works = getArtWorks()
  const challenges = getArtChallenges()
  
  const timeline = []
  
  // 添加作品到时间线
  works.forEach(work => {
    timeline.push({
      id: work.id,
      type: 'work',
      artType: work.type,
      title: work.title,
      date: work.createdAt,
      points: work.points,
      data: work
    })
  })
  
  // 添加挑战到时间线
  challenges.forEach(challenge => {
    timeline.push({
      id: challenge.id,
      type: 'challenge',
      artType: challenge.type,
      title: challenge.title,
      date: challenge.startDate,
      points: challenge.points,
      data: challenge
    })
  })
  
  // 按日期排序
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return timeline.slice(0, 20)
}

// ============================================================================
// 成就系统
// ============================================================================

export const getArtAchievements = () => {
  try {
    const data = uni.getStorageSync(ART_ACHIEVEMENTS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getArtAchievements error:', e)
  }
  return [
    { id: 'first_brush', name: '初次创作', description: '完成第一幅绘画作品', icon: '🎨', isUnlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'music_starter', name: '音乐启蒙', description: '完成第一段音乐创作', icon: '🎵', isUnlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'dance_star', name: '舞蹈之星', description: '完成第一次舞蹈表演', icon: '💃', isUnlocked: false, unlockedAt: null },
    { id: 'art_master', name: '艺术大师', description: '累计获得500艺术积分', icon: '🏆', isUnlocked: false, unlockedAt: null },
    { id: 'week_streak', name: '坚持一周', description: '连续7天进行艺术创作', icon: '🔥', isUnlocked: false, unlockedAt: null }
  ]
}

export const checkAndUnlockAchievements = () => {
  const points = getArtPoints()
  const works = getArtWorks()
  const achievements = getArtAchievements()
  const challenges = getArtChallenges()
  
  let changed = false
  
  // 检查艺术大师
  const artMaster = achievements.find(a => a.id === 'art_master')
  if (!artMaster.isUnlocked && points.totalPoints >= 500) {
    artMaster.isUnlocked = true
    artMaster.unlockedAt = new Date().toISOString()
    changed = true
  }
  
  // 检查舞蹈之星
  const danceStar = achievements.find(a => a.id === 'dance_star')
  if (!danceStar.isUnlocked && works.some(w => w.type === 'dance')) {
    danceStar.isUnlocked = true
    danceStar.unlockedAt = new Date().toISOString()
    changed = true
  }
  
  // 检查坚持一周
  const weekStreak = achievements.find(a => a.id === 'week_streak')
  if (!weekStreak.isUnlocked && points.streak.current >= 7) {
    weekStreak.isUnlocked = true
    weekStreak.unlockedAt = new Date().toISOString()
    changed = true
  }
  
  if (changed) {
    uni.setStorageSync(ART_ACHIEVEMENTS_KEY, JSON.stringify(achievements))
  }
  
  return achievements.filter(a => a.isUnlocked)
}

// ============================================================================
// 导出服务
// ============================================================================

export default {
  // 艺术类型
  ART_TYPES,
  ART_MATERIALS,
  
  // 绘画工具
  DRAWING_TOOLS,
  DRAWING_COLORS,
  
  // 音乐工具
  MUSIC_TEMPOS,
  MUSIC_INSTRUMENTS,
  
  // 作品管理
  getArtWorks,
  saveArtWork,
  deleteArtWork,
  toggleFavorite,
  shareArtWork,
  
  // 挑战管理
  getArtChallenges,
  joinArtChallenge,
  updateChallengeProgress,
  
  // 积分系统
  getArtPoints,
  getWeeklyArtStats,
  
  // AI 建议
  generateAiSuggestions,
  
  // 时间线
  getArtTimeline,
  
  // 成就
  getArtAchievements,
  checkAndUnlockAchievements
}
