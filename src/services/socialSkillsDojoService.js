/**
 * V91 Social Skills Dojo Service
 * 社交技能道场服务层
 * 社交情景模拟、对话练习、社交成就系统
 */

// ==================== 常量定义 ====================

// 社交情景类型
export const SOCIAL_SCENARIO_TYPE = {
  SELF_INTRO: 'self_intro',           // 自我介绍
  MAKE_FRIENDS: 'make_friends',       // 交朋友
  CONFLICT_HANDLING: 'conflict_handling' // 冲突处理
}

// 社交情景状态
export const SCENARIO_STATUS = {
  LOCKED: 'locked',     // 未解锁
  AVAILABLE: 'available', // 可用
  COMPLETED: 'completed' // 已完成
}

// 对话角色
export const DIALOGUE_ROLE = {
  USER: 'user',         // 用户
  AI_PARTNER: 'ai_partner' // AI伙伴
}

// 评分等级
export const RATING_LEVEL = {
  EXCELLENT: 'excellent',   // 优秀
  GOOD: 'good',             // 良好
  NEEDS_PRACTICE: 'needs_practice' // 需要练习
}

// 成就类型
export const ACHIEVEMENT_TYPE = {
  BADGE: 'badge',           // 徽章
  TITLE: 'title',           // 称号
  POINTS: 'points'          // 积分
}

// 技能类型
export const SKILL_TYPE = {
  COMMUNICATION: 'communication',   // 沟通能力
  EMPATHY: 'empathy',               // 同理心
  CONFLICT_RESOLUTION: 'conflict_resolution', // 冲突解决
  LEADERSHIP: 'leadership',         // 领导力
  TEAMWORK: 'teamwork'              // 团队协作
}

// localStorage keys
const SOCIAL_SCENARIOS_KEY = 'social_scenarios'
const SOCIAL_PRACTICE_RECORDS_KEY = 'social_practice_records'
const SOCIAL_ACHIEVEMENTS_KEY = 'social_achievements'
const SOCIAL_SKILLS_PROGRESS_KEY = 'social_skills_progress'

// ==================== 辅助函数 ====================

function generateId(prefix = 'ssd') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

function now() {
  return new Date().toISOString()
}

function getDateStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ==================== 内置社交情景数据 ====================

const BUILT_IN_SCENARIOS = [
  {
    id: 'scenario_1',
    title: '🌟 初次见面',
    description: '学习如何在班级里向新同学介绍自己，留下美好的第一印象',
    type: SOCIAL_SCENARIO_TYPE.SELF_INTRO,
    icon: '👋',
    difficulty: 1,
    ageRange: '4-8',
    estimatedTime: '5分钟',
    coverColor: '#4facfe',
    status: SCENARIO_STATUS.AVAILABLE,
    requiredSkills: [SKILL_TYPE.COMMUNICATION],
    skillsGained: { [SKILL_TYPE.COMMUNICATION]: 10 },
    rewards: { points: 50, badgeId: 'first_intro' },
    dialogueCount: 3,
    tips: [
      '保持微笑，展现友好态度',
      '清晰地报出自己的名字',
      '可以说说自己的兴趣爱好'
    ],
    createdAt: now()
  },
  {
    id: 'scenario_2',
    title: '🤝 交新朋友',
    description: '学习如何主动与同龄孩子交流，建立新的友谊',
    type: SOCIAL_SCENARIO_TYPE.MAKE_FRIENDS,
    icon: '😊',
    difficulty: 2,
    ageRange: '5-10',
    estimatedTime: '8分钟',
    coverColor: '#43e97b',
    status: SCENARIO_STATUS.AVAILABLE,
    requiredSkills: [SKILL_TYPE.COMMUNICATION, SKILL_TYPE.EMPATHY],
    skillsGained: { [SKILL_TYPE.COMMUNICATION]: 15, [SKILL_TYPE.EMPATHY]: 10 },
    rewards: { points: 80, badgeId: 'friend_maker' },
    dialogueCount: 5,
    tips: [
      '找到共同兴趣更容易成为朋友',
      '学会倾听对方说话',
      '真诚地表达自己的想法'
    ],
    createdAt: now()
  },
  {
    id: 'scenario_3',
    title: '💬 小组讨论',
    description: '在小组活动中表达自己的观点，同时尊重他人的意见',
    type: SOCIAL_SCENARIO_TYPE.MAKE_FRIENDS,
    icon: '🗣️',
    difficulty: 2,
    ageRange: '6-12',
    estimatedTime: '10分钟',
    coverColor: '#667eea',
    status: SCENARIO_STATUS.AVAILABLE,
    requiredSkills: [SKILL_TYPE.COMMUNICATION, SKILL_TYPE.TEAMWORK],
    skillsGained: { [SKILL_TYPE.COMMUNICATION]: 15, [SKILL_TYPE.TEAMWORK]: 15 },
    rewards: { points: 100, badgeId: 'team_player' },
    dialogueCount: 6,
    tips: [
      '轮流发言，不要打断别人',
      '尊重不同的观点',
      '学会用"我觉得..."表达意见'
    ],
    createdAt: now()
  },
  {
    id: 'scenario_4',
    title: '😤 处理冲突',
    description: '学习如何在与同伴发生分歧时冷静处理，找到双赢的解决方案',
    type: SOCIAL_SCENARIO_TYPE.CONFLICT_HANDLING,
    icon: '✋',
    difficulty: 3,
    ageRange: '6-12',
    estimatedTime: '12分钟',
    coverColor: '#f093fb',
    status: SCENARIO_STATUS.AVAILABLE,
    requiredSkills: [SKILL_TYPE.CONFLICT_RESOLUTION, SKILL_TYPE.EMPATHY],
    skillsGained: { [SKILL_TYPE.CONFLICT_RESOLUTION]: 20, [SKILL_TYPE.EMPATHY]: 15 },
    rewards: { points: 120, badgeId: 'peace_maker' },
    dialogueCount: 7,
    tips: [
      '先冷静下来，再表达感受',
      '试着理解对方的立场',
      '寻找共同的解决方法'
    ],
    createdAt: now()
  },
  {
    id: 'scenario_5',
    title: '👑 领袖气质',
    description: '学习如何在团队活动中发挥领导作用，带领小伙伴一起完成任务',
    type: SOCIAL_SCENARIO_TYPE.MAKE_FRIENDS,
    icon: '⭐',
    difficulty: 3,
    ageRange: '7-14',
    estimatedTime: '15分钟',
    coverColor: '#ffd700',
    status: SCENARIO_STATUS.AVAILABLE,
    requiredSkills: [SKILL_TYPE.LEADERSHIP, SKILL_TYPE.COMMUNICATION],
    skillsGained: { [SKILL_TYPE.LEADERSHIP]: 25, [SKILL_TYPE.COMMUNICATION]: 15 },
    rewards: { points: 150, badgeId: 'little_leader' },
    dialogueCount: 8,
    tips: [
      '明确任务目标',
      '合理分配任务，发挥每个人特长',
      '鼓励团队成员，给予肯定'
    ],
    createdAt: now()
  }
]

// 内置对话数据
const BUILT_IN_DIALOGUES = {
  'scenario_1': [
    {
      id: 'd_1_1',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '你好！我叫小明，你叫什么名字呀？',
      emotion: 'friendly',
      hint: '友好地打招呼，介绍自己'
    },
    {
      id: 'd_1_2',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '你好，我叫[名字]，很高兴认识你！', score: 100, feedback: '太棒了！自信又友好！' },
        { text: '我叫[名字]', score: 70, feedback: '不错，但可以更热情一些' },
        { text: '(不说话)", score: 30, feedback: '尝试主动开口吧，自信一点！' }
      ],
      expectedKeywords: ['名字', '认识']
    },
    {
      id: 'd_1_3',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '太好了！[名字]，你平时喜欢玩什么呀？',
      emotion: 'curious',
      hint: '分享自己的兴趣爱好'
    },
    {
      id: 'd_1_4',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我喜欢踢足球和画画，你呢？', score: 100, feedback: '完美！既分享了爱好又反问了对方！' },
        { text: '我喜欢玩乐高', score: 80, feedback: '很好，但可以试着问问对方的爱好' },
        { text: '没什么特别喜欢的', score: 40, feedback: '试着想想自己的兴趣爱好吧！' }
      ],
      expectedKeywords: ['喜欢', '兴趣']
    },
    {
      id: 'd_1_5',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '哇，我也喜欢踢球！我们一起玩吧！',
      emotion: 'excited',
      hint: '回应对方的热情提议'
    }
  ],
  'scenario_2': [
    {
      id: 'd_2_1',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '(看到你走近，抬起头看了看你)',
      emotion: 'neutral',
      hint: '主动打招呼，打破沉默'
    },
    {
      id: 'd_2_2',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '嗨！我注意到你也在玩乐高，我也超喜欢！', score: 100, feedback: '太棒了！找到了共同话题！' },
        { text: '你好', score: 60, feedback: '不错，但可以试着找到共同话题' },
        { text: '(站在旁边不说话)', score: 20, feedback: '勇敢迈出第一步，主动开口吧！' }
      ],
      expectedKeywords: ['乐高', '喜欢', '玩']
    },
    {
      id: 'd_2_3',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '真的吗？你喜欢什么类型的？',
      emotion: 'interested',
      hint: '继续聊共同话题，展现兴趣'
    },
    {
      id: 'd_2_4',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我最喜欢城市系列，可以建整个城市！你呢？', score: 100, feedback: '太棒了！分享自己的同时又反问了！' },
        { text: '城市系列很有趣', score: 75, feedback: '很好，但可以多说说自己的看法' },
        { text: '还行吧', score: 40, feedback: '试着表达得更热情一些！' }
      ],
      expectedKeywords: ['城市', '系列']
    },
    {
      id: 'd_2_5',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '我们可以一起搭一个更大的城市！',
      emotion: 'happy',
      hint: '提出一起玩的邀请'
    },
    {
      id: 'd_2_6',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '好呀！我们可以分工合作，你负责道路，我负责建筑！', score: 100, feedback: '太棒了！展现了领导力和团队精神！' },
        { text: '好的！', score: 70, feedback: '很好，但可以更积极地参与规划' },
        { text: '我不确定', score: 30, feedback: '勇敢一点，这是一个交到好朋友的机会！' }
      ],
      expectedKeywords: ['合作', '分工']
    }
  ],
  'scenario_3': [
    {
      id: 'd_3_1',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '(小组讨论：关于如何布置班级植物角）大家有什么想法吗？',
      emotion: 'thinking',
      hint: '积极参与讨论'
    },
    {
      id: 'd_3_2',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我觉得可以按种类分类摆放，这样看起来更整齐，也方便大家观察。', score: 100, feedback: '太棒了！观点清晰，有理有据！' },
        { text: '我觉得应该放在窗台上', score: 70, feedback: '不错，但可以补充一下理由' },
        { text: '(不说话)', score: 20, feedback: '大胆说出你的想法吧！' }
      ],
      expectedKeywords: ['觉得', '分类', '整齐']
    },
    {
      id: 'd_3_3',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '小华说要放在窗台上，小明说按种类分类。大家觉得呢？',
      emotion: 'discussing',
      hint: '倾听并回应他人的观点'
    },
    {
      id: 'd_3_4',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我觉得小明的想法很好，既美观又实用。不过窗台的光照确实更好，可以结合一下。', score: 100, feedback: '太棒了！既肯定了别人，又提出了改进建议！' },
        { text: '小明的想法比较好', score: 80, feedback: '很好，但可以也听听其他人的意见' },
        { text: '小明的想法不行', score: 40, feedback: '可以换个更委婉的方式表达不同意见' }
      ],
      expectedKeywords: ['想法', '觉得', '结合']
    },
    {
      id: 'd_3_5',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '小芳建议结合两种方案，既放在窗台又分类摆放。大家同意吗？',
      emotion: 'summarizing',
      hint: '达成共识'
    },
    {
      id: 'd_3_6',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我同意！这样既能保证光照，又能整齐美观。大家还可以轮流照顾植物。', score: 100, feedback: '完美！展现了团队协作和领袖气质！' },
        { text: '同意', score: 70, feedback: '很好，可以在同意的基础上补充想法' },
        { text: '随便', score: 30, feedback: '试着积极一点参与，表达你的观点' }
      ],
      expectedKeywords: ['同意', '轮流', '照顾']
    }
  ],
  'scenario_4': [
    {
      id: 'd_4_1',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '(玩玩具时）这是我先拿到的！给我！',
      emotion: 'angry',
      hint: '保持冷静，不要激动'
    },
    {
      id: 'd_4_2',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我看到你很想玩这个，但我们需要轮流玩。你先玩五分钟，然后换我好吗？', score: 100, feedback: '太棒了！既理解了对方感受，又提出了公平解决方案！' },
        { text: '不行，我也想玩！', score: 30, feedback: '这样会让冲突升级，试着冷静沟通' },
        { text: '(把玩具藏到身后)', score: 20, feedback: '这样不能让问题解决，试试用语言沟通' }
      ],
      expectedKeywords: ['轮流', '理解', '公平']
    },
    {
      id: 'd_4_3',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '五分钟太久了！我现在就想玩！',
      emotion: 'frustrated',
      hint: '理解对方感受，继续沟通'
    },
    {
      id: 'd_4_4',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我理解你真的很想玩，我也很想。那我们石头剪刀布决定谁先玩怎么样？', score: 100, feedback: '太棒了！用游戏方式化解冲突，很有创意！' },
        { text: '那我们一人玩一分钟', score: 80, feedback: '很好，提出了具体的解决方案' },
        { text: '你每次都这样！', score: 30, feedback: '这样会让对方更生气，试着对事不对人' }
      ],
      expectedKeywords: ['理解', '石头剪刀布', '轮流']
    },
    {
      id: 'd_4_5',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '好吧！石头剪刀布...我赢了！先玩！',
      emotion: 'happy',
      hint: '接受结果，愉快玩耍'
    },
    {
      id: 'd_4_6',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '恭喜你！那我等你玩完，我们一起玩肯定更有趣！', score: 100, feedback: '太棒了！真诚祝福对方，展现了宽广的胸怀！' },
        { text: '好吧，你要守信用哦', score: 70, feedback: '不错，但可以更友好一点' },
        { text: '不公平！再来一次！', score: 20, feedback: '输了也要接受，这样才大气' }
      ],
      expectedKeywords: ['恭喜', '一起', '守信用']
    },
    {
      id: 'd_4_7',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '时间到了！给你，记得我们一起玩的约定哦！',
      emotion: 'friendly',
      hint: '信守承诺'
    }
  ],
  'scenario_5': [
    {
      id: 'd_5_1',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '(老师让大家分组完成科学实验项目）谁想当组长？',
      emotion: 'waiting',
      hint: '勇于承担领导责任'
    },
    {
      id: 'd_5_2',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我想试试！我来当组长，我会带领大家一起完成任务的！', score: 100, feedback: '太棒了！展现了领导力和自信心！' },
        { text: '我可以试试当组长', score: 80, feedback: '不错，但可以更自信一点' },
        { text: '(不举手)', score: 30, feedback: '勇敢承担责任是成长的重要一步！' }
      ],
      expectedKeywords: ['组长', '带领', '任务']
    },
    {
      id: 'd_5_3',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '好！那我们来讨论一下如何分工吧。',
      emotion: 'cooperative',
      hint: '合理分配任务'
    },
    {
      id: 'd_5_4',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '我觉得小红善于观察，可以负责记录数据；小明动手能力强，可以做实验；我来协调和整理结果。', score: 100, feedback: '完美！充分发挥了每个人的特长！' },
        { text: '我们各做一部分吧', score: 70, feedback: '不错，但可以更具体地分工' },
        { text: '你们自己选想做什么', score: 40, feedback: '作为组长，需要更主动地协调' }
      ],
      expectedKeywords: ['负责', '记录', '协调']
    },
    {
      id: 'd_5_5',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '(实验过程中）小红不小心把试剂洒了一点，有点慌',
      emotion: 'worried',
      hint: '鼓励队友，保持团队凝聚力'
    },
    {
      id: 'd_5_6',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '没关系，这只是小意外！我们一起清理，然后继续。我记得这个实验多加或少加一点试剂影响不大。', score: 100, feedback: '太棒了！稳定了团队情绪，展现了应变能力！' },
        { text: '没关系，我们小心点就好', score: 80, feedback: '很好，但可以更积极地安抚队友' },
        { text: '你怎么这么不小心！', score: 30, feedback: '这样会让队友更紧张，作为组长要多鼓励' }
      ],
      expectedKeywords: ['没关系', '清理', '继续']
    },
    {
      id: 'd_5_7',
      role: DIALOGUE_ROLE.AI_PARTNER,
      content: '(实验成功完成）太好了！我们是第一名！',
      emotion: 'excited',
      hint: '肯定团队成员的贡献'
    },
    {
      id: 'd_5_8',
      role: DIALOGUE_ROLE.USER,
      content: '',
      options: [
        { text: '大家都很棒！小红记录得很仔细，小明的操作很规范，我们配合得太好了！', score: 100, feedback: '完美！肯定了每个队员的贡献，是优秀的领导者！' },
        { text: '还不错', score: 60, feedback: '可以更多地肯定队友的付出' },
        { text: '主要是我领导得好', score: 30, feedback: '作为组长，团队的胜利是大家一起努力的结果' }
      ],
      expectedKeywords: ['很棒', '感谢', '配合']
    }
  ]
}

// 内置社交成就
const BUILT_IN_ACHIEVEMENTS = [
  {
    id: 'ach_1',
    badgeId: 'first_intro',
    name: '初次见面',
    description: '完成第一个自我介绍情景',
    icon: '🌟',
    type: ACHIEVEMENT_TYPE.BADGE,
    requirement: { scenarioType: SOCIAL_SCENARIO_TYPE.SELF_INTRO, minScore: 60 },
    rarity: 'common'
  },
  {
    id: 'ach_2',
    badgeId: 'friend_maker',
    name: '交友达人',
    description: '完成3次交新朋友情景',
    icon: '🤝',
    type: ACHIEVEMENT_TYPE.BADGE,
    requirement: { scenarioType: SOCIAL_SCENARIO_TYPE.MAKE_FRIENDS, completeCount: 3 },
    rarity: 'rare'
  },
  {
    id: 'ach_3',
    badgeId: 'peace_maker',
    name: '和平使者',
    description: '完成冲突处理情景并获得80分以上',
    icon: '🕊️',
    type: ACHIEVEMENT_TYPE.BADGE,
    requirement: { scenarioType: SOCIAL_SCENARIO_TYPE.CONFLICT_HANDLING, minScore: 80 },
    rarity: 'epic'
  },
  {
    id: 'ach_4',
    badgeId: 'team_player',
    name: '团队之星',
    description: '在小组讨论中获得90分以上',
    icon: '⭐',
    type: ACHIEVEMENT_TYPE.BADGE,
    requirement: { scenarioType: 'group_discussion', minScore: 90 },
    rarity: 'rare'
  },
  {
    id: 'ach_5',
    badgeId: 'little_leader',
    name: '小领袖',
    description: '完成领导力情景并获得90分以上',
    icon: '👑',
    type: ACHIEVEMENT_TYPE.BADGE,
    requirement: { scenarioId: 'scenario_5', minScore: 90 },
    rarity: 'legendary'
  },
  {
    id: 'ach_6',
    badgeId: 'social_master',
    name: '社交大师',
    description: '累计获得500社交积分',
    icon: '🎓',
    type: ACHIEVEMENT_TYPE.TITLE,
    requirement: { totalPoints: 500 },
    rarity: 'legendary'
  },
  {
    id: 'ach_7',
    badgeId: 'empathy_expert',
    name: '同理心专家',
    description: '同理心技能达到满级',
    icon: '❤️',
    type: ACHIEVEMENT_TYPE.BADGE,
    requirement: { skillLevel: SKILL_TYPE.EMPATHY, maxLevel: true },
    rarity: 'epic'
  },
  {
    id: 'ach_8',
    badgeId: 'conflict_resolver',
    name: '冲突化解师',
    description: '成功化解5次冲突情景',
    icon: '⚖️',
    type: ACHIEVEMENT_TYPE.BADGE,
    requirement: { scenarioType: SOCIAL_SCENARIO_TYPE.CONFLICT_HANDLING, completeCount: 5 },
    rarity: 'rare'
  }
]

// ==================== 存储操作函数 ====================

function getScenarios() {
  try {
    const data = uni.getStorageSync(SOCIAL_SCENARIOS_KEY)
    if (!data) {
      uni.setStorageSync(SOCIAL_SCENARIOS_KEY, JSON.stringify(BUILT_IN_SCENARIOS))
      return BUILT_IN_SCENARIOS
    }
    return JSON.parse(data)
  } catch (e) {
    return BUILT_IN_SCENARIOS
  }
}

function saveScenarios(scenarios) {
  uni.setStorageSync(SOCIAL_SCENARIOS_KEY, JSON.stringify(scenarios))
}

function getPracticeRecords() {
  try {
    const data = uni.getStorageSync(SOCIAL_PRACTICE_RECORDS_KEY)
    if (!data) {
      uni.setStorageSync(SOCIAL_PRACTICE_RECORDS_KEY, JSON.stringify([]))
      return []
    }
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

function savePracticeRecords(records) {
  uni.setStorageSync(SOCIAL_PRACTICE_RECORDS_KEY, JSON.stringify(records))
}

function getAchievements() {
  try {
    const data = uni.getStorageSync(SOCIAL_ACHIEVEMENTS_KEY)
    if (!data) {
      uni.setStorageSync(SOCIAL_ACHIEVEMENTS_KEY, JSON.stringify(BUILT_IN_ACHIEVEMENTS))
      return BUILT_IN_ACHIEVEMENTS
    }
    return JSON.parse(data)
  } catch (e) {
    return BUILT_IN_ACHIEVEMENTS
  }
}

function saveAchievements(achievements) {
  uni.setStorageSync(SOCIAL_ACHIEVEMENTS_KEY, JSON.stringify(achievements))
}

function getSkillsProgress() {
  try {
    const data = uni.getStorageSync(SOCIAL_SKILLS_PROGRESS_KEY)
    if (!data) {
      const defaultProgress = {}
      Object.values(SKILL_TYPE).forEach(skill => {
        defaultProgress[skill] = {
          level: 1,
          exp: 0,
          totalExp: 0
        }
      })
      uni.setStorageSync(SOCIAL_SKILLS_PROGRESS_KEY, JSON.stringify(defaultProgress))
      return defaultProgress
    }
    return JSON.parse(data)
  } catch (e) {
    return {}
  }
}

function saveSkillsProgress(progress) {
  uni.setStorageSync(SOCIAL_SKILLS_PROGRESS_KEY, JSON.stringify(progress))
}

// ==================== 情景函数 ====================

/**
 * 获取所有社交情景
 */
export function getScenariosList(filter = {}) {
  let scenarios = getScenarios()
  
  if (filter.type) {
    scenarios = scenarios.filter(s => s.type === filter.type)
  }
  if (filter.status) {
    scenarios = scenarios.filter(s => s.status === filter.status)
  }
  if (filter.difficulty) {
    scenarios = scenarios.filter(s => s.difficulty === filter.difficulty)
  }
  
  return scenarios.sort((a, b) => a.difficulty - b.difficulty)
}

/**
 * 获取情景详情
 */
export function getScenarioById(scenarioId) {
  const scenarios = getScenarios()
  return scenarios.find(s => s.id === scenarioId) || null
}

/**
 * 获取情景的对话数据
 */
export function getScenarioDialogues(scenarioId) {
  return BUILT_IN_DIALOGUES[scenarioId] || []
}

/**
 * 解锁情景
 */
export function unlockScenario(scenarioId) {
  const scenarios = getScenarios()
  const index = scenarios.findIndex(s => s.id === scenarioId)
  if (index === -1) return null
  
  scenarios[index].status = SCENARIO_STATUS.AVAILABLE
  saveScenarios(scenarios)
  return scenarios[index]
}

// ==================== 练习记录函数 ====================

/**
 * 创建练习记录
 */
export function createPracticeRecord(babyId, scenarioId, recordData) {
  const records = getPracticeRecords()
  
  const newRecord = {
    id: generateId('prac'),
    babyId,
    scenarioId,
    score: recordData.score || 0,
    rating: recordData.rating || RATING_LEVEL.NEEDS_PRACTICE,
    dialogueResults: recordData.dialogueResults || [],
    skillsGained: recordData.skillsGained || {},
    pointsEarned: recordData.pointsEarned || 0,
    completedAt: now(),
    createdAt: now()
  }
  
  records.push(newRecord)
  savePracticeRecords(records)
  
  return newRecord
}

/**
 * 获取宝宝的练习记录
 */
export function getBabyPracticeRecords(babyId, filter = {}) {
  let records = getPracticeRecords().filter(r => r.babyId === babyId)
  
  if (filter.scenarioId) {
    records = records.filter(r => r.scenarioId === filter.scenarioId)
  }
  if (filter.scenarioType) {
    const scenarios = getScenarios()
    const scenarioIds = scenarios
      .filter(s => s.type === filter.scenarioType)
      .map(s => s.id)
    records = records.filter(r => scenarioIds.includes(r.scenarioId))
  }
  
  return records.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
}

/**
 * 获取宝宝在某个情景的最佳成绩
 */
export function getBabyBestScore(babyId, scenarioId) {
  const records = getPracticeRecords().filter(
    r => r.babyId === babyId && r.scenarioId === scenarioId
  )
  
  if (records.length === 0) return null
  
  return Math.max(...records.map(r => r.score))
}

/**
 * 获取宝宝的总社交积分
 */
export function getBabyTotalSocialPoints(babyId) {
  const records = getPracticeRecords().filter(r => r.babyId === babyId)
  return records.reduce((sum, r) => sum + (r.pointsEarned || 0), 0)
}

/**
 * 获取宝宝的成就
 */
export function getBabyAchievements(babyId) {
  const achievements = getAchievements()
  const records = getBabyPracticeRecords(babyId)
  const skillsProgress = getSkillsProgress()
  
  const earnedAchievements = []
  
  achievements.forEach(ach => {
    let earned = false
    let earnedAt = null
    
    if (ach.requirement.scenarioType) {
      const scenarioRecords = records.filter(r => {
        const scenario = getScenarioById(r.scenarioId)
        return scenario && scenario.type === ach.requirement.scenarioType
      })
      
      if (ach.requirement.minScore) {
        earned = scenarioRecords.some(r => r.score >= ach.requirement.minScore)
      } else if (ach.requirement.completeCount) {
        earned = scenarioRecords.length >= ach.requirement.completeCount
      }
    } else if (ach.requirement.totalPoints) {
      const totalPoints = getBabyTotalSocialPoints(babyId)
      earned = totalPoints >= ach.requirement.totalPoints
    } else if (ach.requirement.skillLevel && ach.requirement.maxLevel) {
      const skillProgress = skillsProgress[ach.requirement.skillLevel]
      earned = skillProgress && skillProgress.level >= 10
    } else if (ach.requirement.scenarioId && ach.requirement.minScore) {
      earned = records.some(
        r => r.scenarioId === ach.requirement.scenarioId && r.score >= ach.requirement.minScore
      )
    }
    
    if (earned) {
      const record = records.find(r => {
        if (ach.requirement.scenarioId) return r.scenarioId === ach.requirement.scenarioId
        if (ach.requirement.scenarioType) {
          const scenario = getScenarioById(r.scenarioId)
          return scenario && scenario.type === ach.requirement.scenarioType
        }
        return false
      })
      earnedAt = record?.completedAt
      earnedAchievements.push({
        ...ach,
        earnedAt,
        earned: true
      })
    } else {
      earnedAchievements.push({
        ...ach,
        earnedAt: null,
        earned: false
      })
    }
  })
  
  return earnedAchievements
}

/**
 * 计算评分等级
 */
export function calculateRating(score) {
  if (score >= 90) return RATING_LEVEL.EXCELLENT
  if (score >= 70) return RATING_LEVEL.GOOD
  return RATING_LEVEL.NEEDS_PRACTICE
}

/**
 * 提交对话练习答案
 */
export function submitDialogueAnswer(babyId, scenarioId, dialogueId, selectedOption, score) {
  // 记录会在完成整个情景后统一保存
  return {
    dialogueId,
    selectedOption,
    score
  }
}

/**
 * 完成情景练习
 */
export function completeScenarioPractice(babyId, scenarioId, dialogueResults) {
  const scenario = getScenarioById(scenarioId)
  if (!scenario) return null
  
  // 计算总分
  const totalScore = dialogueResults.reduce((sum, r) => sum + r.score, 0)
  const avgScore = Math.round(totalScore / dialogueResults.length)
  const rating = calculateRating(avgScore)
  
  // 计算技能提升
  const skillsGained = {}
  if (scenario.skillsGained) {
    Object.entries(scenario.skillsGained).forEach(([skill, baseExp]) => {
      const multiplier = avgScore >= 90 ? 1.5 : avgScore >= 70 ? 1.0 : 0.5
      skillsGained[skill] = Math.round(baseExp * multiplier)
    })
  }
  
  // 更新技能进度
  const skillsProgress = getSkillsProgress()
  Object.entries(skillsGained).forEach(([skill, exp]) => {
    if (!skillsProgress[skill]) {
      skillsProgress[skill] = { level: 1, exp: 0, totalExp: 0 }
    }
    skillsProgress[skill].exp += exp
    skillsProgress[skill].totalExp += exp
    
    // 升级逻辑：每100经验升一级，最高10级
    while (skillsProgress[skill].exp >= 100 && skillsProgress[skill].level < 10) {
      skillsProgress[skill].exp -= 100
      skillsProgress[skill].level++
    }
  })
  saveSkillsProgress(skillsProgress)
  
  // 计算积分奖励
  const pointsMultiplier = rating === RATING_LEVEL.EXCELLENT ? 1.5 : rating === RATING_LEVEL.GOOD ? 1.0 : 0.5
  const pointsEarned = Math.round((scenario.rewards?.points || 50) * pointsMultiplier)
  
  // 创建练习记录
  const record = createPracticeRecord(babyId, scenarioId, {
    score: avgScore,
    rating,
    dialogueResults,
    skillsGained,
    pointsEarned
  })
  
  return {
    record,
    skillsGained,
    pointsEarned,
    rating
  }
}

// ==================== 技能进度函数 ====================

/**
 * 获取宝宝技能进度
 */
export function getBabySkillsProgress(babyId) {
  return getSkillsProgress()
}

/**
 * 获取技能等级信息
 */
export function getSkillLevelInfo(skillType) {
  const progress = getSkillsProgress()
  const skillProgress = progress[skillType] || { level: 1, exp: 0, totalExp: 0 }
  
  const levelNames = {
    1: '初学者',
    2: '入门',
    3: '进阶',
    4: '熟练',
    5: '精通',
    6: '专家',
    7: '大师',
    8: '宗师',
    9: '传奇',
    10: '完美'
  }
  
  return {
    level: skillProgress.level,
    exp: skillProgress.exp,
    totalExp: skillProgress.totalExp,
    name: levelNames[skillProgress.level] || '初学者',
    nextLevelExp: skillProgress.level >= 10 ? null : 100,
    progressPercent: skillProgress.level >= 10 ? 100 : (skillProgress.exp / 100) * 100
  }
}

export default {
  SOCIAL_SCENARIO_TYPE,
  SCENARIO_STATUS,
  DIALOGUE_ROLE,
  RATING_LEVEL,
  ACHIEVEMENT_TYPE,
  SKILL_TYPE,
  getScenariosList,
  getScenarioById,
  getScenarioDialogues,
  unlockScenario,
  createPracticeRecord,
  getBabyPracticeRecords,
  getBabyBestScore,
  getBabyTotalSocialPoints,
  getBabyAchievements,
  calculateRating,
  submitDialogueAnswer,
  completeScenarioPractice,
  getBabySkillsProgress,
  getSkillLevelInfo
}
