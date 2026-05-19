/**
 * V78 Peer Coaching Service
 * 同伴辅导系统服务层
 * 学习伙伴匹配、同伴答疑、互评反馈
 */

// ============================================================================
// Types & Constants
// ============================================================================

// 伙伴匹配状态
export const MATCH_STATUS = {
  PENDING: 'pending',     // 待匹配
  MATCHED: 'matched',     // 已匹配
  UNMATCHED: 'unmatched'  // 未匹配
}

// 技能领域
export const SKILL_CATEGORY = {
  MATH: 'math',               // 数学
  LANGUAGE: 'language',       // 语言
  SCIENCE: 'science',         // 科学
  ART: 'art',                 // 艺术
  MUSIC: 'music',             // 音乐
  SPORTS: 'sports',           // 运动
  CODING: 'coding',           // 编程
  READING: 'reading',         // 阅读
  WRITING: 'writing',         // 写作
  CRITICAL_THINKING: 'critical_thinking' // 批判性思维
}

export const SKILL_INFO = {
  [SKILL_CATEGORY.MATH]: { label: '数学', icon: '🔢', color: '#1890FF' },
  [SKILL_CATEGORY.LANGUAGE]: { label: '语言', icon: '🗣️', color: '#52C41A' },
  [SKILL_CATEGORY.SCIENCE]: { label: '科学', icon: '🔬', color: '#722ED1' },
  [SKILL_CATEGORY.ART]: { label: '艺术', icon: '🎨', color: '#F5222D' },
  [SKILL_CATEGORY.MUSIC]: { label: '音乐', icon: '🎵', color: '#FA8C16' },
  [SKILL_CATEGORY.SPORTS]: { label: '运动', icon: '⚽', color: '#13C2C2' },
  [SKILL_CATEGORY.CODING]: { label: '编程', icon: '💻', color: '#1890FF' },
  [SKILL_CATEGORY.READING]: { label: '阅读', icon: '📚', color: '#52C41A' },
  [SKILL_CATEGORY.WRITING]: { label: '写作', icon: '✏️', color: '#FAAD14' },
  [SKILL_CATEGORY.CRITICAL_THINKING]: { label: '批判性思维', icon: '🧠', color: '#EB2F96' }
}

// 匹配类型
export const MATCH_TYPE = {
  SKILL_COMPLEMENT: 'skill_complement',   // 技能互补
  INTEREST_MATCH: 'interest_match',       // 兴趣匹配
  RANDOM: 'random'                        // 随机匹配
}

// 问题状态
export const QUESTION_STATUS = {
  OPEN: 'open',           // 开放中
  ANSWERED: 'answered',    // 已采纳
  CLOSED: 'closed'        // 已关闭
}

// 反馈类型
export const FEEDBACK_TYPE = {
  PROGRESS: 'progress',       // 学习进度
  ENCOURAGEMENT: 'encouragement' // 鼓励留言
}

// 反馈方向
export const FEEDBACK_DIRECTION = {
  TO_BUDDY: 'to_buddy',       // 给伙伴
  FROM_BUDDY: 'from_buddy'    // 来自伙伴
}

// localStorage keys
const BUDDY_MATCHES_KEY = 'peer_coaching_buddy_matches'
const QUESTIONS_KEY = 'peer_coaching_questions'
const ANSWERS_KEY = 'peer_coaching_answers'
const FEEDBACKS_KEY = 'peer_coaching_feedbacks'

// ============================================================================
// Helper Functions
// ============================================================================

const generateId = () => {
  return 'pc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const getLocalData = (key, defaultValue = []) => {
  try {
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (e) {
    console.error('[PeerCoachingService] Failed to get local data:', e)
    return defaultValue
  }
}

const setLocalData = (key, data) => {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
  } catch (e) {
    console.error('[PeerCoachingService] Failed to set local data:', e)
  }
}

// ============================================================================
// Buddy Match Functions
// ============================================================================

/**
 * 获取所有学习伙伴匹配
 */
const getBuddyMatches = () => {
  return getLocalData(BUDDY_MATCHES_KEY, [])
}

/**
 * 获取当前用户的匹配信息
 */
const getCurrentUserMatch = () => {
  const matches = getBuddyMatches()
  // 模拟当前用户ID
  const currentUserId = uni.getStorageSync('user_id') || 'user_001'
  return matches.find(m => m.userId === currentUserId || m.partnerId === currentUserId)
}

/**
 * 创建学习伙伴匹配
 */
const createBuddyMatch = (data) => {
  const match = {
    id: generateId(),
    userId: data.userId || 'user_001',
    userName: data.userName || '我',
    userAvatar: data.userAvatar || '😊',
    userSkills: data.userSkills || [],           // 用户的技能（可教）
    userInterests: data.userInterests || [],     // 用户的兴趣
    partnerId: data.partnerId || null,
    partnerName: data.partnerName || null,
    partnerAvatar: data.partnerAvatar || null,
    partnerSkills: data.partnerSkills || [],     // 伙伴的技能（可教）
    partnerInterests: data.partnerInterests || [],
    matchType: data.matchType || MATCH_TYPE.SKILL_COMPLEMENT,
    status: data.partnerId ? MATCH_STATUS.MATCHED : MATCH_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const matches = getBuddyMatches()
  matches.push(match)
  setLocalData(BUDDY_MATCHES_KEY, matches)
  
  return match
}

/**
 * 更新学习伙伴匹配
 */
const updateBuddyMatch = (id, data) => {
  const matches = getBuddyMatches()
  const index = matches.findIndex(m => m.id === id)
  
  if (index !== -1) {
    matches[index] = {
      ...matches[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    setLocalData(BUDDY_MATCHES_KEY, matches)
    return matches[index]
  }
  
  return null
}

/**
 * 匹配学习伙伴（基于技能互补或兴趣）
 */
const findAndMatchBuddy = (userProfile) => {
  const matches = getBuddyMatches()
  
  // 模拟：查找技能互补的伙伴
  // 用户的弱项 = 伙伴的强项
  const userWeakSkills = userProfile.weakSkills || []
  const userStrongSkills = userProfile.strongSkills || []
  
  for (const match of matches) {
    if (match.id === userProfile.id) continue
    if (match.status === MATCH_STATUS.MATCHED) continue
    
    // 检查技能互补
    const canTeachUser = match.partnerSkills?.some(s => userWeakSkills.includes(s))
    const userCanTeach = userStrongSkills.some(s => match.partnerSkills?.includes(s))
    
    if (canTeachUser && userCanTeach) {
      // 找到匹配
      const updated = updateBuddyMatch(match.id, {
        partnerId: userProfile.userId,
        partnerName: userProfile.userName,
        partnerAvatar: userProfile.userAvatar,
        partnerSkills: userProfile.strongSkills,
        partnerInterests: userProfile.interests,
        status: MATCH_STATUS.MATCHED
      })
      
      updateBuddyMatch(userProfile.id, {
        partnerId: match.userId,
        partnerName: match.userName,
        partnerAvatar: match.userAvatar,
        partnerSkills: match.userSkills,
        partnerInterests: match.userInterests,
        status: MATCH_STATUS.MATCHED
      })
      
      return updated
    }
  }
  
  return null
}

/**
 * 获取推荐的伙伴列表
 */
const getRecommendedBuddies = () => {
  const matches = getBuddyMatches()
  const currentUserId = uni.getStorageSync('user_id') || 'user_001'
  
  return matches
    .filter(m => m.userId !== currentUserId && m.status !== MATCH_STATUS.MATCHED)
    .slice(0, 10)
    .map(m => ({
      id: m.id,
      name: m.userName,
      avatar: m.userAvatar,
      skills: m.userSkills,
      interests: m.userInterests,
      matchType: m.matchType
    }))
}

// ============================================================================
// Question Functions
// ============================================================================

/**
 * 获取所有问题
 */
const getQuestions = () => {
  return getLocalData(QUESTIONS_KEY, [])
}

/**
 * 获取我的问题
 */
const getMyQuestions = () => {
  const questions = getQuestions()
  const currentUserId = uni.getStorageSync('user_id') || 'user_001'
  return questions.filter(q => q.authorId === currentUserId)
}

/**
 * 获取伙伴的问题
 */
const getBuddyQuestions = () => {
  const questions = getQuestions()
  const match = getCurrentUserMatch()
  if (!match || !match.partnerId) return []
  
  return questions.filter(q => q.authorId === match.partnerId && q.status !== QUESTION_STATUS.CLOSED)
}

/**
 * 获取问题详情
 */
const getQuestionById = (id) => {
  const questions = getQuestions()
  return questions.find(q => q.id === id)
}

/**
 * 发布问题
 */
const postQuestion = (data) => {
  const question = {
    id: generateId(),
    authorId: data.authorId || 'user_001',
    authorName: data.authorName || '我',
    authorAvatar: data.authorAvatar || '😊',
    title: data.title || '',
    content: data.content || '',
    category: data.category || SKILL_CATEGORY.MATH,
    tags: data.tags || [],
    status: QUESTION_STATUS.OPEN,
    acceptedAnswerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const questions = getQuestions()
  questions.push(question)
  setLocalData(QUESTIONS_KEY, questions)
  
  return question
}

/**
 * 更新问题状态
 */
const updateQuestion = (id, data) => {
  const questions = getQuestions()
  const index = questions.findIndex(q => q.id === id)
  
  if (index !== -1) {
    questions[index] = {
      ...questions[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    setLocalData(QUESTIONS_KEY, questions)
    return questions[index]
  }
  
  return null
}

/**
 * 采纳答案
 */
const acceptAnswer = (questionId, answerId) => {
  return updateQuestion(questionId, {
    status: QUESTION_STATUS.ANSWERED,
    acceptedAnswerId: answerId
  })
}

/**
 * 关闭问题
 */
const closeQuestion = (id) => {
  return updateQuestion(id, { status: QUESTION_STATUS.CLOSED })
}

// ============================================================================
// Answer Functions
// ============================================================================

/**
 * 获取所有答案
 */
const getAnswers = () => {
  return getLocalData(ANSWERS_KEY, [])
}

/**
 * 获取问题的答案
 */
const getAnswersByQuestion = (questionId) => {
  const answers = getAnswers()
  return answers.filter(a => a.questionId === questionId)
}

/**
 * 添加答案
 */
const addAnswer = (data) => {
  const answer = {
    id: generateId(),
    questionId: data.questionId,
    authorId: data.authorId || 'user_001',
    authorName: data.authorName || '我',
    authorAvatar: data.authorAvatar || '😊',
    content: data.content || '',
    isAccepted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const answers = getAnswers()
  answers.push(answer)
  setLocalData(ANSWERS_KEY, answers)
  
  return answer
}

/**
 * 更新答案
 */
const updateAnswer = (id, data) => {
  const answers = getAnswers()
  const index = answers.findIndex(a => a.id === id)
  
  if (index !== -1) {
    answers[index] = {
      ...answers[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    setLocalData(ANSWERS_KEY, answers)
    return answers[index]
  }
  
  return null
}

// ============================================================================
// Feedback Functions
// ============================================================================

/**
 * 获取所有反馈
 */
const getFeedbacks = () => {
  return getLocalData(FEEDBACKS_KEY, [])
}

/**
 * 获取我的反馈（我发给伙伴的）
 */
const getMyFeedbacks = () => {
  const feedbacks = getFeedbacks()
  const currentUserId = uni.getStorageSync('user_id') || 'user_001'
  return feedbacks.filter(f => f.fromId === currentUserId)
}

/**
 * 获取伙伴给我的反馈
 */
const getBuddyFeedbacks = () => {
  const feedbacks = getFeedbacks()
  const match = getCurrentUserMatch()
  if (!match || !match.partnerId) return []
  
  const currentUserId = uni.getStorageSync('user_id') || 'user_001'
  return feedbacks.filter(f => f.fromId === match.partnerId && f.toId === currentUserId)
}

/**
 * 发送反馈
 */
const sendFeedback = (data) => {
  const feedback = {
    id: generateId(),
    fromId: data.fromId || 'user_001',
    fromName: data.fromName || '我',
    fromAvatar: data.fromAvatar || '😊',
    toId: data.toId || '',
    toName: data.toName || '',
    type: data.type || FEEDBACK_TYPE.PROGRESS,
    content: data.content || '',
    rating: data.rating || 5,  // 1-5 星
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const feedbacks = getFeedbacks()
  feedbacks.push(feedback)
  setLocalData(FEEDBACKS_KEY, feedbacks)
  
  return feedback
}

/**
 * 更新反馈
 */
const updateFeedback = (id, data) => {
  const feedbacks = getFeedbacks()
  const index = feedbacks.findIndex(f => f.id === id)
  
  if (index !== -1) {
    feedbacks[index] = {
      ...feedbacks[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    setLocalData(FEEDBACKS_KEY, feedbacks)
    return feedbacks[index]
  }
  
  return null
}

/**
 * 获取反馈统计
 */
const getFeedbackStats = () => {
  const myFeedbacks = getMyFeedbacks()
  const buddyFeedbacks = getBuddyFeedbacks()
  
  const avgRating = buddyFeedbacks.length > 0
    ? buddyFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / buddyFeedbacks.length
    : 0
  
  return {
    sentCount: myFeedbacks.length,
    receivedCount: buddyFeedbacks.length,
    avgRating: Math.round(avgRating * 10) / 10,
    progressCount: buddyFeedbacks.filter(f => f.type === FEEDBACK_TYPE.PROGRESS).length,
    encouragementCount: buddyFeedbacks.filter(f => f.type === FEEDBACK_TYPE.ENCOURAGEMENT).length
  }
}

// ============================================================================
// Initialization
// ============================================================================

const init = () => {
  // 确保本地存储有基础数据
  if (!uni.getStorageSync(BUDDY_MATCHES_KEY)) {
    // 创建示例匹配数据
    const sampleMatches = [
      {
        id: 'pc_sample_001',
        userId: 'user_001',
        userName: '小明',
        userAvatar: '😊',
        userSkills: [SKILL_CATEGORY.MATH, SKILL_CATEGORY.CODING],
        userInterests: [SKILL_CATEGORY.SCIENCE, SKILL_CATEGORY.SPORTS],
        partnerId: 'user_002',
        partnerName: '小红',
        partnerAvatar: '🤗',
        partnerSkills: [SKILL_CATEGORY.READING, SKILL_CATEGORY.WRITING],
        partnerInterests: [SKILL_CATEGORY.ART, SKILL_CATEGORY.MUSIC],
        matchType: MATCH_TYPE.SKILL_COMPLEMENT,
        status: MATCH_STATUS.MATCHED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    setLocalData(BUDDY_MATCHES_KEY, sampleMatches)
  }
  
  if (!uni.getStorageSync(QUESTIONS_KEY)) {
    setLocalData(QUESTIONS_KEY, [])
  }
  
  if (!uni.getStorageSync(ANSWERS_KEY)) {
    setLocalData(ANSWERS_KEY, [])
  }
  
  if (!uni.getStorageSync(FEEDBACKS_KEY)) {
    setLocalData(FEEDBACKS_KEY, [])
  }
}

// ============================================================================
// Export
// ============================================================================

const peerCoachingService = {
  // Constants
  MATCH_STATUS,
  SKILL_CATEGORY,
  SKILL_INFO,
  MATCH_TYPE,
  QUESTION_STATUS,
  FEEDBACK_TYPE,
  FEEDBACK_DIRECTION,
  
  // Init
  init,
  
  // Buddy Match
  getBuddyMatches,
  getCurrentUserMatch,
  createBuddyMatch,
  updateBuddyMatch,
  findAndMatchBuddy,
  getRecommendedBuddies,
  
  // Question
  getQuestions,
  getMyQuestions,
  getBuddyQuestions,
  getQuestionById,
  postQuestion,
  updateQuestion,
  acceptAnswer,
  closeQuestion,
  
  // Answer
  getAnswers,
  getAnswersByQuestion,
  addAnswer,
  updateAnswer,
  
  // Feedback
  getFeedbacks,
  getMyFeedbacks,
  getBuddyFeedbacks,
  sendFeedback,
  updateFeedback,
  getFeedbackStats
}

export default peerCoachingService
