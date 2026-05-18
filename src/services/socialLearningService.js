/**
 * V47 Social Learning Service
 * 社交学习圈服务 - 学习小组、同伴辅导、知识分享、社交挑战
 */

// 存储键
const STUDY_GROUPS_KEY = 'study_groups'
const PEER_TUTORING_KEY = 'peer_tutoring'
const KNOWLEDGE_SHARING_KEY = 'knowledge_sharing'
const SOCIAL_CHALLENGES_KEY = 'social_challenges'
const GROUP_POINTS_KEY = 'group_points'

// ============================================================================
// 学习小组 (Study Groups)
// ============================================================================

/**
 * 获取所有学习小组
 */
export const getStudyGroups = () => {
  try {
    const data = uni.getStorageSync(STUDY_GROUPS_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getStudyGroups error:', e)
  }
  return getDefaultStudyGroups()
}

/**
 * 默认学习小组数据
 */
export const getDefaultStudyGroups = () => [
  {
    id: 'group_1',
    name: '阅读小能手',
    description: '热爱阅读的小伙伴们一起分享好书',
    subject: '阅读',
    memberCount: 5,
    maxMembers: 10,
    leaderId: 'user_001',
    leaderName: '小明',
    coverImage: '',
    tags: ['阅读', '文学'],
    totalPoints: 1250,
    rank: 1,
    createdAt: Date.now() - 86400000 * 30,
    isJoined: false
  },
  {
    id: 'group_2',
    name: '数学探险队',
    description: '一起探索数学的奥秘',
    subject: '数学',
    memberCount: 8,
    maxMembers: 10,
    leaderId: 'user_002',
    leaderName: '小红',
    coverImage: '',
    tags: ['数学', '逻辑'],
    totalPoints: 1080,
    rank: 2,
    createdAt: Date.now() - 86400000 * 20,
    isJoined: false
  },
  {
    id: 'group_3',
    name: '英语角',
    description: '开口说英语，趣味学语言',
    subject: '英语',
    memberCount: 6,
    maxMembers: 12,
    leaderId: 'user_003',
    leaderName: '小华',
    coverImage: '',
    tags: ['英语', '口语'],
    totalPoints: 960,
    rank: 3,
    createdAt: Date.now() - 86400000 * 15,
    isJoined: false
  }
]

/**
 * 创建学习小组
 */
export const createStudyGroup = (groupData) => {
  const groups = getStudyGroups()
  const newGroup = {
    id: 'group_' + Date.now(),
    name: groupData.name || '新建小组',
    description: groupData.description || '',
    subject: groupData.subject || '综合',
    memberCount: 1,
    maxMembers: groupData.maxMembers || 10,
    leaderId: groupData.leaderId || 'current_user',
    leaderName: groupData.leaderName || '我',
    coverImage: groupData.coverImage || '',
    tags: groupData.tags || [],
    totalPoints: 0,
    rank: groups.length + 1,
    createdAt: Date.now(),
    isJoined: true,
    members: [
      {
        id: 'current_user',
        name: groupData.leaderName || '我',
        role: 'leader',
        joinTime: Date.now(),
        contribution: 0
      }
    ]
  }
  groups.unshift(newGroup)
  saveStudyGroups(groups)
  return newGroup
}

/**
 * 加入学习小组
 */
export const joinStudyGroup = (groupId) => {
  const groups = getStudyGroups()
  const group = groups.find(g => g.id === groupId)
  if (group && group.memberCount < group.maxMembers) {
    if (!group.members) group.members = []
    group.members.push({
      id: 'current_user',
      name: '我',
      role: 'member',
      joinTime: Date.now(),
      contribution: 0
    })
    group.memberCount++
    group.isJoined = true
    saveStudyGroups(groups)
    return true
  }
  return false
}

/**
 * 退出学习小组
 */
export const leaveStudyGroup = (groupId) => {
  const groups = getStudyGroups()
  const group = groups.find(g => g.id === groupId)
  if (group) {
    if (!group.members) group.members = []
    group.members = group.members.filter(m => m.id !== 'current_user')
    group.memberCount--
    group.isJoined = false
    saveStudyGroups(groups)
    return true
  }
  return false
}

/**
 * 保存学习小组
 */
const saveStudyGroups = (groups) => {
  uni.setStorageSync(STUDY_GROUPS_KEY, JSON.stringify(groups))
}

// ============================================================================
// 小组讨论区 (Group Discussion)
// ============================================================================

/**
 * 获取小组讨论
 */
export const getGroupDiscussions = (groupId) => {
  const key = `group_discussions_${groupId}`
  try {
    const data = uni.getStorageSync(key)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getGroupDiscussions error:', e)
  }
  return []
}

/**
 * 发布讨论
 */
export const postDiscussion = (groupId, content, images = []) => {
  const discussions = getGroupDiscussions(groupId)
  const newPost = {
    id: 'disc_' + Date.now(),
    groupId,
    authorId: 'current_user',
    authorName: '我',
    content,
    images,
    likes: 0,
    comments: [],
    createdAt: Date.now()
  }
  discussions.unshift(newPost)
  uni.setStorageSync(`group_discussions_${groupId}`, JSON.stringify(discussions))
  return newPost
}

/**
 * 点赞讨论
 */
export const likeDiscussion = (groupId, discussionId) => {
  const discussions = getGroupDiscussions(groupId)
  const post = discussions.find(d => d.id === discussionId)
  if (post) {
    post.likes++
    uni.setStorageSync(`group_discussions_${groupId}`, JSON.stringify(discussions))
  }
}

/**
 * 评论讨论
 */
export const commentDiscussion = (groupId, discussionId, comment) => {
  const discussions = getGroupDiscussions(groupId)
  const post = discussions.find(d => d.id === discussionId)
  if (post) {
    post.comments.push({
      id: 'cmt_' + Date.now(),
      authorId: 'current_user',
      authorName: '我',
      content: comment,
      createdAt: Date.now()
    })
    uni.setStorageSync(`group_discussions_${groupId}`, JSON.stringify(discussions))
  }
}

// ============================================================================
// 小组任务 (Group Tasks)
// ============================================================================

/**
 * 获取小组任务
 */
export const getGroupTasks = (groupId) => {
  const key = `group_tasks_${groupId}`
  try {
    const data = uni.getStorageSync(key)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getGroupTasks error:', e)
  }
  return getDefaultGroupTasks(groupId)
}

/**
 * 默认小组任务
 */
export const getDefaultGroupTasks = (groupId) => [
  {
    id: 'task_1',
    groupId,
    title: '本周阅读打卡',
    description: '每天阅读30分钟并打卡',
    points: 50,
    deadline: Date.now() + 86400000 * 7,
    status: 'pending',
    assignedTo: []
  },
  {
    id: 'task_2',
    groupId,
    title: '知识点分享',
    description: '选择一个知识点录制讲解视频',
    points: 100,
    deadline: Date.now() + 86400000 * 14,
    status: 'pending',
    assignedTo: []
  }
]

/**
 * 领取任务
 */
export const claimGroupTask = (groupId, taskId) => {
  const tasks = getGroupTasks(groupId)
  const task = tasks.find(t => t.id === taskId)
  if (task) {
    task.assignedTo.push('current_user')
    uni.setStorageSync(`group_tasks_${groupId}`, JSON.stringify(tasks))
    return true
  }
  return false
}

/**
 * 完成任务
 */
export const completeGroupTask = (groupId, taskId) => {
  const tasks = getGroupTasks(groupId)
  const task = tasks.find(t => t.id === taskId)
  if (task) {
    task.status = 'completed'
    uni.setStorageSync(`group_tasks_${groupId}`, JSON.stringify(tasks))
    return task.points
  }
  return 0
}

// ============================================================================
// 同伴辅导 (Peer Tutoring)
// ============================================================================

/**
 * 获取同伴答疑列表
 */
export const getPeerQuestions = () => {
  try {
    const data = uni.getStorageSync(PEER_TUTORING_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getPeerQuestions error:', e)
  }
  return getDefaultPeerQuestions()
}

/**
 * 默认同伴答疑
 */
export const getDefaultPeerQuestions = () => [
  {
    id: 'q_1',
    subject: '数学',
    title: '这道应用题怎么做？',
    content: '小明有12个苹果，给了小红一半后又买了3个，现在有多少个？',
    images: [],
    authorId: 'user_101',
    authorName: '小亮',
    solved: false,
    answers: [
      {
        id: 'a_1',
        content: '12 ÷ 2 = 6，6 + 3 = 9，所以现在有9个苹果',
        authorId: 'user_102',
        authorName: '小华',
        isAccepted: false,
        likes: 5,
        createdAt: Date.now() - 3600000
      }
    ],
    createdAt: Date.now() - 86400000,
    tags: ['应用题', '数学']
  },
  {
    id: 'q_2',
    subject: '英语',
    title: '这个单词怎么读？',
    content: '"necessary" 这个单词怎么发音？有什么记忆方法吗？',
    images: [],
    authorId: 'user_103',
    authorName: '小丽',
    solved: true,
    answers: [
      {
        id: 'a_2',
        content: '发音是 [ˈnesəsəri]，可以记成 "尼塞斯瑞" ~ 记忆方法：必须有外套(necessary谐音)',
        authorId: 'user_104',
        authorName: '小强',
        isAccepted: true,
        likes: 12,
        createdAt: Date.now() - 7200000
      }
    ],
    createdAt: Date.now() - 172800000,
    tags: ['单词', '发音']
  }
]

/**
 * 发布同伴问题
 */
export const postPeerQuestion = (data) => {
  const questions = getPeerQuestions()
  const newQuestion = {
    id: 'q_' + Date.now(),
    subject: data.subject || '综合',
    title: data.title || '',
    content: data.content || '',
    images: data.images || [],
    authorId: 'current_user',
    authorName: '我',
    solved: false,
    answers: [],
    createdAt: Date.now(),
    tags: data.tags || []
  }
  questions.unshift(newQuestion)
  uni.setStorageSync(PEER_TUTORING_KEY, JSON.stringify(questions))
  return newQuestion
}

/**
 * 回答同伴问题
 */
export const answerPeerQuestion = (questionId, content) => {
  const questions = getPeerQuestions()
  const question = questions.find(q => q.id === questionId)
  if (question) {
    question.answers.push({
      id: 'a_' + Date.now(),
      content,
      authorId: 'current_user',
      authorName: '我',
      isAccepted: false,
      likes: 0,
      createdAt: Date.now()
    })
    uni.setStorageSync(PEER_TUTORING_KEY, JSON.stringify(questions))
    return true
  }
  return false
}

/**
 * 采纳回答
 */
export const acceptAnswer = (questionId, answerId) => {
  const questions = getPeerQuestions()
  const question = questions.find(q => q.id === questionId)
  if (question) {
    question.answers.forEach(a => a.isAccepted = false)
    const answer = question.answers.find(a => a.id === answerId)
    if (answer) {
      answer.isAccepted = true
      question.solved = true
    }
    uni.setStorageSync(PEER_TUTORING_KEY, JSON.stringify(questions))
    return true
  }
  return false
}

/**
 * 点赞回答
 */
export const likeAnswer = (questionId, answerId) => {
  const questions = getPeerQuestions()
  const question = questions.find(q => q.id === questionId)
  if (question) {
    const answer = question.answers.find(a => a.id === answerId)
    if (answer) {
      answer.likes++
      uni.setStorageSync(PEER_TUTORING_KEY, JSON.stringify(questions))
    }
  }
}

// ============================================================================
// 知识点讲解 (Knowledge Explanation)
// ============================================================================

/**
 * 获取知识点列表
 */
export const getKnowledgeExplanations = () => {
  try {
    const data = uni.getStorageSync('knowledge_explanations')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getKnowledgeExplanations error:', e)
  }
  return getDefaultExplanations()
}

/**
 * 默认知识点
 */
export const getDefaultExplanations = () => [
  {
    id: 'exp_1',
    subject: '数学',
    topic: '分数加减法',
    title: '分数加减其实很简单',
    content: '同分母分数相加减，分母不变，分子相加减。异分母分数要先通分哦！',
    authorId: 'user_201',
    authorName: '数学小老师',
    views: 156,
    likes: 45,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'exp_2',
    subject: '英语',
    topic: '一般过去时',
    title: '一文搞懂一般过去时',
    content: '一般过去时表示过去发生的动作或存在的状态。动词要变成过去式哦！',
    authorId: 'user_202',
    authorName: '英语达人',
    views: 203,
    likes: 67,
    createdAt: Date.now() - 86400000 * 5
  }
]

/**
 * 发布知识点讲解
 */
export const postKnowledgeExplanation = (data) => {
  const explanations = getKnowledgeExplanations()
  const newExp = {
    id: 'exp_' + Date.now(),
    subject: data.subject || '综合',
    topic: data.topic || '',
    title: data.title || '',
    content: data.content || '',
    authorId: 'current_user',
    authorName: '我',
    views: 0,
    likes: 0,
    createdAt: Date.now()
  }
  explanations.unshift(newExp)
  uni.setStorageSync('knowledge_explanations', JSON.stringify(explanations))
  return newExp
}

// ============================================================================
// 知识分享 (Knowledge Sharing)
// ============================================================================

/**
 * 获取分享列表
 */
export const getSharingPosts = () => {
  try {
    const data = uni.getStorageSync(KNOWLEDGE_SHARING_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getSharingPosts error:', e)
  }
  return getDefaultSharingPosts()
}

/**
 * 默认分享
 */
export const getDefaultSharingPosts = () => [
  {
    id: 'share_1',
    type: 'note',
    title: '我的数学笔记：简便运算技巧',
    content: '分享一些我在数学学习中总结的简便运算技巧...',
    authorId: 'user_301',
    authorName: '小数学家',
    subject: '数学',
    tags: ['笔记', '技巧'],
    likes: 89,
    views: 234,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'share_2',
    type: 'resource',
    title: '推荐一个好用的英语学习App',
    content: '最近发现一款特别好用的英语学习App，适合小学生...',
    authorId: 'user_302',
    authorName: '英语爱好者',
    subject: '英语',
    tags: ['资源', 'App推荐'],
    likes: 56,
    views: 178,
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'share_3',
    type: 'experience',
    title: '我的学习方法分享',
    content: '坚持每天早起晨读半小时，英语进步真的很快！',
    authorId: 'user_303',
    authorName: '学习标兵',
    subject: '综合',
    tags: ['学习方法', '经验'],
    likes: 120,
    views: 345,
    createdAt: Date.now() - 86400000 * 1
  }
]

/**
 * 发布分享
 */
export const postSharing = (data) => {
  const posts = getSharingPosts()
  const newPost = {
    id: 'share_' + Date.now(),
    type: data.type || 'experience',
    title: data.title || '',
    content: data.content || '',
    authorId: 'current_user',
    authorName: '我',
    subject: data.subject || '综合',
    tags: data.tags || [],
    likes: 0,
    views: 0,
    createdAt: Date.now()
  }
  posts.unshift(newPost)
  uni.setStorageSync(KNOWLEDGE_SHARING_KEY, JSON.stringify(posts))
  return newPost
}

/**
 * 点赞分享
 */
export const likeSharing = (postId) => {
  const posts = getSharingPosts()
  const post = posts.find(p => p.id === postId)
  if (post) {
    post.likes++
    uni.setStorageSync(KNOWLEDGE_SHARING_KEY, JSON.stringify(posts))
  }
}

// ============================================================================
// 社交挑战 (Social Challenges)
// ============================================================================

/**
 * 获取社交挑战
 */
export const getSocialChallenges = () => {
  try {
    const data = uni.getStorageSync(SOCIAL_CHALLENGES_KEY)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getSocialChallenges error:', e)
  }
  return getDefaultSocialChallenges()
}

/**
 * 默认社交挑战
 */
export const getDefaultSocialChallenges = () => [
  {
    id: 'challenge_1',
    type: 'team',
    title: '学习小组挑战赛',
    description: '组成学习小组，共同完成学习任务',
    target: '完成5个小组任务',
    current: 2,
    goal: 5,
    points: 200,
    participants: 15,
    deadline: Date.now() + 86400000 * 14,
    status: 'active'
  },
  {
    id: 'challenge_2',
    type: 'competition',
    title: '知识竞答大赛',
    description: '跨组知识竞答，赢取丰厚奖励',
    target: '答题正确率90%以上',
    current: 0,
    goal: 1,
    points: 300,
    participants: 42,
    deadline: Date.now() + 86400000 * 7,
    status: 'active'
  },
  {
    id: 'challenge_3',
    type: 'collaboration',
    title: '互助学习周',
    description: '帮助他人解答问题，获得互助积分',
    target: '帮助解答3个问题',
    current: 1,
    goal: 3,
    points: 150,
    participants: 28,
    deadline: Date.now() + 86400000 * 10,
    status: 'active'
  }
]

/**
 * 参与挑战
 */
export const joinChallenge = (challengeId) => {
  const challenges = getSocialChallenges()
  const challenge = challenges.find(c => c.id === challengeId)
  if (challenge) {
    challenge.participants++
    uni.setStorageSync(SOCIAL_CHALLENGES_KEY, JSON.stringify(challenges))
    return true
  }
  return false
}

/**
 * 更新挑战进度
 */
export const updateChallengeProgress = (challengeId, progress) => {
  const challenges = getSocialChallenges()
  const challenge = challenges.find(c => c.id === challengeId)
  if (challenge) {
    challenge.current = progress
    uni.setStorageSync(SOCIAL_CHALLENGES_KEY, JSON.stringify(challenges))
    return true
  }
  return false
}

// ============================================================================
// 积分排行榜 (Leaderboard)
// ============================================================================

/**
 * 获取积分排行榜
 */
export const getGroupLeaderboard = () => {
  const groups = getStudyGroups()
  return groups.sort((a, b) => b.totalPoints - a.totalPoints).map((g, i) => ({
    ...g,
    rank: i + 1
  }))
}

/**
 * 获取用户贡献积分
 */
export const getUserContribution = (groupId) => {
  const key = `user_contribution_${groupId}`
  try {
    const data = uni.getStorageSync(key)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('getUserContribution error:', e)
  }
  return { points: 0, tasksCompleted: 0, discussionsPosted: 0 }
}

/**
 * 增加用户贡献积分
 */
export const addUserContribution = (groupId, points, type = 'task') => {
  const key = `user_contribution_${groupId}`
  const contribution = getUserContribution(groupId)
  contribution.points += points
  if (type === 'task') contribution.tasksCompleted++
  if (type === 'discussion') contribution.discussionsPosted++
  uni.setStorageSync(key, JSON.stringify(contribution))
  return contribution
}

export default {
  // 学习小组
  getStudyGroups,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  // 讨论区
  getGroupDiscussions,
  postDiscussion,
  likeDiscussion,
  commentDiscussion,
  // 小组任务
  getGroupTasks,
  claimGroupTask,
  completeGroupTask,
  // 同伴辅导
  getPeerQuestions,
  postPeerQuestion,
  answerPeerQuestion,
  acceptAnswer,
  likeAnswer,
  // 知识点
  getKnowledgeExplanations,
  postKnowledgeExplanation,
  // 知识分享
  getSharingPosts,
  postSharing,
  likeSharing,
  // 社交挑战
  getSocialChallenges,
  joinChallenge,
  updateChallengeProgress,
  // 排行榜
  getGroupLeaderboard,
  getUserContribution,
  addUserContribution
}
