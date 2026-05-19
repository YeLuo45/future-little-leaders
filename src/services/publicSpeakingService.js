/**
 * V74 Public Speaking Service
 * 演讲与口才系统 - 演讲模板、练习、挑战
 */

const STORAGE_KEY = 'public_speaking_data'

// 演讲模板分类
export const SPEECH_CATEGORIES = {
  SELF_INTRO: { id: 'self_intro', name: '自我介绍', icon: '👋', description: '学习如何介绍自己' },
  STORY_TELLING: { id: 'story_telling', name: '故事分享', icon: '📖', description: '讲述精彩故事' },
  OPINION: { id: 'opinion', name: '观点表达', icon: '💡', description: '清晰表达你的想法' }
}

// 演讲模板
const SPEECH_TEMPLATES = [
  // 自我介绍类
  {
    id: 'self_intro_beginner',
    category: 'self_intro',
    title: '简单自我介绍',
    difficulty: 'beginner',
    duration: 60,
    structure: [
      { part: '开场', content: '大家好，我是[name]，很高兴认识大家！' },
      { part: '基本信息', content: '我今年[age]岁，来自[city]。' },
      { part: '兴趣爱好', content: '我喜欢[hobby]，因为[hobby_reason]。' },
      { part: '结束语', content: '希望能和大家成为朋友，谢谢！' }
    ],
    tips: [
      '保持微笑，眼神交流',
      '语速适中，不要太快',
      '声音洪亮，吐字清晰'
    ],
    scoreCriteria: {
      clarity: 30,
      confidence: 30,
      structure: 20,
      content: 20
    }
  },
  {
    id: 'self_intro_advanced',
    category: 'self_intro',
    title: '详细自我介绍',
    difficulty: 'intermediate',
    duration: 120,
    structure: [
      { part: '开场', content: '尊敬的老师、同学们，大家好！' },
      { part: '姓名来历', content: '我叫[name]，[name_meaning]。' },
      { part: '成长经历', content: '我来自[city]，曾经[experience]。' },
      { part: '兴趣爱好', content: '我热爱[hobby]，曾经[achievement]。' },
      { part: '未来展望', content: '未来我想[future_goal]。' },
      { part: '结束语', content: '很高兴能在这里分享自己，期待和大家交流！' }
    ],
    tips: [
      '适当停顿，强调重点',
      '用具体事例支撑内容',
      '展现个人特色和亮点'
    ],
    scoreCriteria: {
      clarity: 25,
      confidence: 25,
      structure: 25,
      content: 25
    }
  },
  // 故事分享类
  {
    id: 'story_favorite_book',
    category: 'story_telling',
    title: '分享最喜欢的书',
    difficulty: 'beginner',
    duration: 90,
    structure: [
      { part: '引入', content: '今天我想分享一本对我影响很深的书——《[book_name]》。' },
      { part: '书籍介绍', content: '这本书的作者是[author]，讲述了[summary]。' },
      { part: '感动时刻', content: '最让我感动的是[ touching_moment]，因为[reason]。' },
      { part: '收获感悟', content: '读完之后，我明白了[lesson]。' },
      { part: '推荐理由', content: '我推荐大家读这本书，因为[recommendation]。' }
    ],
    tips: [
      '讲述时注重视觉辅助',
      '模仿书中角色的语气',
      '适当停顿制造悬念'
    ],
    scoreCriteria: {
      clarity: 20,
      expression: 25,
      engagement: 25,
      content: 30
    }
  },
  {
    id: 'story_memories',
    category: 'story_telling',
    title: '难忘的回忆',
    difficulty: 'intermediate',
    duration: 120,
    structure: [
      { part: '设置场景', content: '那是[time]，地点在[place]，我至今记忆犹新。' },
      { part: '发生了什么', content: '那天，我经历了一件特别的事[event]。' },
      { part: '当时感受', content: '当时我的心情是[feeling]，因为[reason]。' },
      { part: '学到什么', content: '这件事让我学会了[lesson]。' },
      { part: '总结感悟', content: '直到现在，这件事仍然激励着我[inspiration]。' }
    ],
    tips: [
      '用生动的语言描述细节',
      '表达真实的情感',
      '首尾呼应'
    ],
    scoreCriteria: {
      clarity: 20,
      expression: 25,
      engagement: 25,
      content: 30
    }
  },
  // 观点表达类
  {
    id: 'opinion_why_read',
    category: 'opinion',
    title: '为什么要多读书',
    difficulty: 'beginner',
    duration: 90,
    structure: [
      { part: '提出观点', content: '我认为每个人都应该多读书。' },
      { part: '理由一', content: '首先，读书可以增长知识，让我们了解更大的世界。' },
      { part: '理由二', content: '其次，读书能开阔视野，让我们看到不同的观点。' },
      { part: '理由三', content: '最后，读书可以提升表达能力，让沟通更顺畅。' },
      { part: '总结', content: '总之，读书对我们的成长有太多好处，让我们一起多读书吧！' }
    ],
    tips: [
      '观点要明确清晰',
      '理由要充分有说服力',
      '使用"首先、其次、最后"等连接词'
    ],
    scoreCriteria: {
      clarity: 30,
      logic: 30,
      expression: 20,
      content: 20
    }
  },
  {
    id: 'opinion_protect_env',
    category: 'opinion',
    title: '保护环境从我做起',
    difficulty: 'intermediate',
    duration: 120,
    structure: [
      { part: '现象引入', content: '最近，我注意到[environmental_issue]，这让我很担忧。' },
      { part: '问题分析', content: '造成这个问题的原因是[causes]，如果不解决会[consequences]。' },
      { part: '解决方案', content: '我们可以从以下几个方面做起：第一[action1]，第二[action2]，第三[action3]。' },
      { part: '个人行动', content: '我自己已经开始[personal_action]，感觉[effect]。' },
      { part: '号召结尾', content: '保护环境是每个人的责任，让我们一起行动吧！' }
    ],
    tips: [
      '用具体数据支撑观点',
      '分析问题要全面',
      '解决方案要可行'
    ],
    scoreCriteria: {
      clarity: 25,
      logic: 30,
      expression: 20,
      content: 25
    }
  }
]

// 演讲挑战
const SPEECH_CHALLENGES = [
  {
    id: 'challenge_60s',
    title: '60秒自我介绍',
    description: '在60秒内完成一个简洁有力的自我介绍',
    type: 'timed',
    duration: 60,
    category: 'self_intro',
    difficulty: 'beginner',
    rewards: {
      points: 20,
      badge: 'quick_intro'
    },
    requirements: {
      minDuration: 50,
      maxDuration: 70
    }
  },
  {
    id: 'challenge_story_90s',
    title: '90秒故事讲述',
    description: '用90秒讲述一个完整的小故事',
    type: 'timed',
    duration: 90,
    category: 'story_telling',
    difficulty: 'intermediate',
    rewards: {
      points: 30,
      badge: 'storyteller'
    },
    requirements: {
      minDuration: 80,
      maxDuration: 100,
      hasBeginning: true,
      hasMiddle: true,
      hasEnd: true
    }
  },
  {
    id: 'challenge_opinion_2min',
    title: '2分钟观点演讲',
    description: '围绕一个话题发表自己的观点',
    type: 'timed',
    duration: 120,
    category: 'opinion',
    difficulty: 'intermediate',
    rewards: {
      points: 40,
      badge: 'opinion_leader'
    },
    requirements: {
      minDuration: 110,
      maxDuration: 130,
      hasPoint: true,
      hasReasons: true,
      hasConclusion: true
    }
  },
  {
    id: 'challenge_impromptu',
    title: '即兴演讲挑战',
    description: '随机抽取话题，进行即兴演讲',
    type: 'impromptu',
    duration: 60,
    category: 'all',
    difficulty: 'advanced',
    rewards: {
      points: 50,
      badge: 'impromptu_master'
    },
    impromptuTopics: [
      '如果我能改变世界的一件事',
      '我最敬佩的人',
      '未来我想成为的人',
      '对我最重要的事',
      '我最快乐的时刻'
    ],
    requirements: {
      minDuration: 45,
      maxDuration: 75
    }
  },
  {
    id: 'challenge_team_debate',
    title: '小小辩论赛',
    description: '和队友一起进行观点对抗',
    type: 'debate',
    duration: 180,
    category: 'opinion',
    difficulty: 'advanced',
    rewards: {
      points: 60,
      badge: 'debate_champion'
    },
    debateTopics: [
      '学习重要还是玩耍重要',
      '城市生活好还是乡村生活好',
      '书本知识重要还是实践重要'
    ],
    requirements: {
      hasOpening: true,
      hasArguments: true,
      hasClosing: true
    }
  }
]

// 语速训练数据
const PACING_TRAINING = {
  slow: { wpm: 80, description: '慢速 - 适合重要内容强调', ideal: '用于表达关键点和情感' },
  moderate: { wpm: 120, description: '中速 - 日常对话节奏', ideal: '适合一般性叙述' },
  fast: { wpm: 160, description: '快速 - 适合激情演讲', ideal: '用于营造紧张感和兴奋感' }
}

// 停顿训练
const PAUSE_TRAINING = {
  shortPause: { duration: 0.5, description: '短停顿 - 逗号级别', usage: '简短思考或换气' },
  mediumPause: { duration: 1, description: '中等停顿 - 句号级别', usage: '一个意思说完，等待消化' },
  longPause: { duration: 2, description: '长停顿 - 段落级别', usage: '制造悬念或强调重点' }
}

// 默认数据
const getDefaultData = () => ({
  // 已完成的演讲练习
  completedPractices: [],
  // 演讲挑战记录
  challengeRecords: [],
  // 录音回放记录
  recordings: [],
  // 用户积分
  totalPoints: 0,
  // 连续练习天数
  streakDays: 0,
  // 累计练习时长(秒)
  totalPracticeTime: 0,
  // 演讲能力评分
  abilityScores: {
    clarity: 0,        // 清晰度
    confidence: 0,     // 自信度
    expression: 0,     // 表达力
    structure: 0       // 结构化
  }
})

// 服务类
class PublicSpeakingService {
  constructor() {
    this.data = this.loadData()
  }

  // 加载数据
  loadData() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      if (stored) {
        return { ...getDefaultData(), ...stored }
      }
    } catch (e) {
      console.warn('Failed to load public speaking data:', e)
    }
    return getDefaultData()
  }

  // 保存数据
  saveData() {
    try {
      uni.setStorageSync(STORAGE_KEY, this.data)
    } catch (e) {
      console.warn('Failed to save public speaking data:', e)
    }
  }

  // 获取所有模板
  getTemplates() {
    return SPEECH_TEMPLATES
  }

  // 按分类获取模板
  getTemplatesByCategory(category) {
    return SPEECH_TEMPLATES.filter(t => t.category === category)
  }

  // 获取单个模板
  getTemplate(templateId) {
    return SPEECH_TEMPLATES.find(t => t.id === templateId)
  }

  // 获取所有分类
  getCategories() {
    return Object.values(SPEECH_CATEGORIES)
  }

  // 获取演讲挑战
  getChallenges() {
    return SPEECH_CHALLENGES
  }

  // 获取特定分类的挑战
  getChallengesByCategory(category) {
    return SPEECH_CHALLENGES.filter(c => c.category === category || c.category === 'all')
  }

  // 获取单个挑战
  getChallenge(challengeId) {
    return SPEECH_CHALLENGES.find(c => c.id === challengeId)
  }

  // 获取语速训练数据
  getPacingTraining() {
    return PACING_TRAINING
  }

  // 获取停顿训练数据
  getPauseTraining() {
    return PAUSE_TRAINING
  }

  // 获取用户统计数据
  getUserStats() {
    return {
      totalPoints: this.data.totalPoints,
      streakDays: this.data.streakDays,
      totalPracticeTime: this.data.totalPracticeTime,
      abilityScores: this.data.abilityScores,
      completedCount: this.data.completedPractices.length,
      challengeCount: this.data.challengeRecords.length
    }
  }

  // 完成演讲练习
  completePractice(templateId, score, practiceData) {
    const practice = {
      id: Date.now().toString(),
      templateId,
      score,
      practiceData,
      completedAt: new Date().toISOString()
    }

    this.data.completedPractices.push(practice)
    this.data.totalPoints += Math.floor(score / 10)
    this.data.totalPracticeTime += practiceData.duration || 60

    // 更新能力评分
    if (practiceData.clarity !== undefined) {
      this.data.abilityScores.clarity = Math.round(
        (this.data.abilityScores.clarity * 0.7 + practiceData.clarity * 0.3)
      )
    }
    if (practiceData.confidence !== undefined) {
      this.data.abilityScores.confidence = Math.round(
        (this.data.abilityScores.confidence * 0.7 + practiceData.confidence * 0.3)
      )
    }
    if (practiceData.expression !== undefined) {
      this.data.abilityScores.expression = Math.round(
        (this.data.abilityScores.expression * 0.7 + practiceData.expression * 0.3)
      )
    }
    if (practiceData.structure !== undefined) {
      this.data.abilityScores.structure = Math.round(
        (this.data.abilityScores.structure * 0.7 + practiceData.structure * 0.3)
      )
    }

    this.saveData()
    return practice
  }

  // 完成挑战
  completeChallenge(challengeId, score, challengeData) {
    const challenge = this.getChallenge(challengeId)
    if (!challenge) return null

    const record = {
      id: Date.now().toString(),
      challengeId,
      score,
      challengeData,
      completedAt: new Date().toISOString(),
      rewards: challenge.rewards
    }

    this.data.challengeRecords.push(record)
    this.data.totalPoints += challenge.rewards.points
    this.data.totalPracticeTime += challenge.duration

    this.saveData()
    return record
  }

  // 获取已完成练习
  getCompletedPractices() {
    return this.data.completedPractices.sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    )
  }

  // 获取挑战记录
  getChallengeRecords() {
    return this.data.challengeRecords.sort((a, b) =>
      new Date(b.completedAt) - new Date(a.completedAt)
    )
  }

  // 获取练习进度
  getProgress() {
    const total = SPEECH_TEMPLATES.length
    const completed = this.data.completedPractices.length
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  // 获取挑战进度
  getChallengeProgress() {
    const total = SPEECH_CHALLENGES.length
    const completed = this.data.challengeRecords.length
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  // 保存录音
  saveRecording(recordingData) {
    const recording = {
      id: Date.now().toString(),
      ...recordingData,
      createdAt: new Date().toISOString()
    }
    this.data.recordings.push(recording)
    this.saveData()
    return recording
  }

  // 获取录音列表
  getRecordings() {
    return this.data.recordings.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  }

  // 删除录音
  deleteRecording(recordingId) {
    const index = this.data.recordings.findIndex(r => r.id === recordingId)
    if (index > -1) {
      this.data.recordings.splice(index, 1)
      this.saveData()
      return true
    }
    return false
  }

  // 重置数据
  resetData() {
    this.data = getDefaultData()
    this.saveData()
  }
}

export default new PublicSpeakingService()
