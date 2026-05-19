// src/services/safetyService.js
// V63 Safety Education Service
// 安全教育服务

import { useBabyStore } from '@/stores/babyStore.js'
import { getDatabase, insert, query } from '@/db/sqlite.js'

// ==================== 常量定义 ====================

// 安全教育分类
export const SAFETY_CATEGORIES = {
  ONLINE: 'online',           // 网络安全
  CAMPUS: 'campus',           // 校园安全
  HOME: 'home',               // 家庭安全
  FIRST_AID: 'first_aid'      // 急救知识
}

// 安全知识分类
export const SAFETY_TYPES = {
  // 网络安全
  ONLINE_KNOWLEDGE: 'online_knowledge',     // 网络安全知识
  PRIVACY_PROTECTION: 'privacy_protection', // 隐私保护
  ONLINE_LITERACY: 'online_literacy',       // 网络素养
  
  // 校园安全
  CAMPUS_RULES: 'campus_rules',           // 校园安全守则
  EMERGENCY_ESCAPE: 'emergency_escape',   // 应急逃生
  SELF_PROTECTION: 'self_protection',     // 自我保护
  
  // 家庭安全
  HOME_CHECK: 'home_check',               // 家庭安全检查
  ELECTRICAL_SAFETY: 'electrical_safety', // 用电安全
  STRANGER_RESPONSE: 'stranger_response', // 陌生人应对
  
  // 急救知识
  FIRST_AID_KNOWLEDGE: 'first_aid_knowledge', // 急救知识
  EMERGENCY_HANDLING: 'emergency_handling',  // 应急处理
  SAFETY_DRILL: 'safety_drill'               // 安全演练
}

// 难度等级
export const DIFFICULTY_LEVELS = {
  EASY: 1,     // 简单
  MEDIUM: 2,   // 中等
  HARD: 3     // 困难
}

// ==================== 数据库表 ====================

export const SAFETY_TABLES = {
  SAFETY_PROGRESS: 'safety_progress',
  SAFETY_RECORDS: 'safety_records',
  SAFETY_QUIZ_SCORES: 'safety_quiz_scores'
}

// ==================== 辅助函数 ====================

function generateId() {
  return 'safe_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function now() {
  return new Date().toISOString()
}

// ==================== 安全知识数据 ====================

/**
 * 网络安全知识数据
 */
const ONLINE_SAFETY_KNOWLEDGE = [
  {
    id: 'online_1',
    title: '密码安全',
    category: SAFETY_TYPES.ONLINE_KNOWLEDGE,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '密码是保护我们网络账号的重要钥匙。一个好的密码应该包含字母、数字和特殊符号，长度至少8位。不要使用生日、姓名等容易被猜到的信息作为密码。每个账号最好使用不同的密码，定期更换密码可以更好地保护账户安全。',
    tips: ['密码要保密，不要告诉任何人', '不要在公共电脑上保存密码', '使用字母+数字+符号的组合'],
    points: 10
  },
  {
    id: 'online_2',
    title: '保护个人信息',
    category: SAFETY_TYPES.PRIVACY_PROTECTION,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '个人信息包括姓名、地址、电话、学校名称等。在网上不要随意填写这些信息，更不要告诉网上认识的陌生人。有些坏人可能会伪装成朋友来骗取你的信息。记住：真正的朋友不会问你索要敏感个人信息。',
    tips: ['不在网上公开姓名和地址', '谨慎填写注册信息', '警惕陌生人的询问'],
    points: 10
  },
  {
    id: 'online_3',
    title: '识别网络诈骗',
    category: SAFETY_TYPES.ONLINE_LITERACY,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    content: '网络诈骗有很多种形式：假冒网站、虚假中奖信息、冒充熟人借钱等。遇到可疑信息要告诉家长或老师。记住：天上不会掉馅饼，任何让你感觉不对劲的事情都要谨慎对待。',
    tips: ['不明链接不要点击', '中奖信息要核实', '遇到问题找父母老师'],
    points: 15
  },
  {
    id: 'online_4',
    title: '网络言行规范',
    category: SAFETY_TYPES.ONLINE_LITERACY,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '网络是一个公共空间，我们的言行会影响他人。在网上聊天、发帖时要文明礼貌，不说脏话、不人身攻击、不传播谣言。做一个有素质的网络小公民，让网络世界更美好。',
    tips: ['文明上网，不骂人不说脏话', '不传播未经证实的信息', '尊重他人的观点和隐私'],
    points: 10
  },
  {
    id: 'online_5',
    title: '网络沉迷预防',
    category: SAFETY_TYPES.ONLINE_KNOWLEDGE,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    content: '长时间沉迷网络游戏、短视频会伤害身体健康，影响学习和生活。我们要学会控制上网时间，每天不超过1小时。多参加户外活动，和朋友面对面交流，让生活更加丰富多彩。',
    tips: ['控制每天上网时间', '多进行户外运动', '培养其他兴趣爱好'],
    points: 15
  },
  {
    id: 'online_6',
    title: '网络欺凌应对',
    category: SAFETY_TYPES.SELF_PROTECTION,
    difficulty: DIFFICULTY_LEVELS.HARD,
    content: '如果在网上遇到有人嘲笑你、侮辱你或传播你的隐私照片视频，这就是网络欺凌。不要回复攻击者，保存证据并告诉家长和老师。记住：这不是你的错，你值得被尊重。',
    tips: ['不要回复恶意消息', '保存聊天记录作为证据', '及时告诉信任的大人'],
    points: 20
  }
]

/**
 * 校园安全知识数据
 */
const CAMPUS_SAFETY_KNOWLEDGE = [
  {
    id: 'campus_1',
    title: '课间安全',
    category: SAFETY_TYPES.CAMPUS_RULES,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '课间休息时不要在走廊、楼梯追逐打闹。上下楼梯靠右走，不要推挤。如果被推倒，要用手护住头部。教室内不要奔跑，以免撞到桌角受伤。保持秩序，安全游戏。',
    tips: ['走廊楼梯不追逐', '上下楼梯靠右行', '安全游戏不推挤'],
    points: 10
  },
  {
    id: 'campus_2',
    title: '体育课安全',
    category: SAFETY_TYPES.CAMPUS_RULES,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '上体育课要穿运动服和运动鞋，做热身运动再开始活动。听从老师指挥，使用器械要小心。如果身体不舒服要及时告诉老师，不要勉强自己。',
    tips: ['运动前要热身', '听从老师指挥', '身体不适要报告'],
    points: 10
  },
  {
    id: 'campus_3',
    title: '火灾逃生',
    category: SAFETY_TYPES.EMERGENCY_ESCAPE,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    content: '如果发生火灾，要保持冷静，用湿毛巾捂住口鼻，弯腰快步离开现场。不要乘坐电梯，走楼梯逃生。如果身上着火，就地打滚灭火。到达安全地带后拨打119报警。',
    tips: ['湿毛巾捂住口鼻', '弯腰快步走楼梯', '不乘电梯不返回'],
    points: 15
  },
  {
    id: 'campus_4',
    title: '地震应对',
    category: SAFETY_TYPES.EMERGENCY_ESCAPE,
    difficulty: DIFFICULTY_LEVELS.HARD,
    content: '地震发生时，如果在教室要躲在课桌下，双手抓住桌腿。如果在操场要远离建筑物和电线杆，待在空旷处。地震停止后有序撤离，不要拥挤推搡。',
    tips: ['教室躲桌下抓桌腿', '操场远离建筑物', '有序撤离不推挤'],
    points: 20
  },
  {
    id: 'campus_5',
    title: '校园欺凌应对',
    category: SAFETY_TYPES.SELF_PROTECTION,
    difficulty: DIFFICULTY_LEVELS.HARD,
    content: '遇到校园欺凌不要沉默，要勇敢说"不"。如果被打或被欺负，要及时跑开并告诉老师或家长。记住：这不是你的错，你有权保护自己。',
    tips: ['勇敢说"不"', '及时跑开求助', '不要默默忍受'],
    points: 20
  },
  {
    id: 'campus_6',
    title: '实验室安全',
    category: SAFETY_TYPES.CAMPUS_RULES,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    content: '在科学实验室要听从老师指导，不随意触碰化学药品和实验器材。使用刀剪等工具要小心，放学后检查水、电、气是否关闭。',
    tips: ['听从老师指导', '不随意触碰药品', '离开前检查水电'],
    points: 15
  }
]

/**
 * 家庭安全知识数据
 */
const HOME_SAFETY_KNOWLEDGE = [
  {
    id: 'home_1',
    title: '用电安全',
    category: SAFETY_TYPES.ELECTRICAL_SAFETY,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '不要用湿手触摸电器开关和插座，不要在插座附近放置水杯。发现电线破损要及时告诉家长。不要用金属物品插入插座，小朋友不要自己换灯泡。',
    tips: ['湿手不碰电器', '远离带电物品', '发现问题告诉家长'],
    points: 10
  },
  {
    id: 'home_2',
    title: '陌生人应对',
    category: SAFETY_TYPES.STRANGER_RESPONSE,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    content: '如果有陌生人敲门或搭话，不要开门，不要跟他走。无论对方说是爸妈朋友、送礼物还是有紧急情况，都要先给爸妈打电话确认。记住：真正的亲人不会让你保守秘密。',
    tips: ['不给陌生人开门', '不和陌生人走', '有疑问先问父母'],
    points: 15
  },
  {
    id: 'home_3',
    title: '厨房安全',
    category: SAFETY_TYPES.HOME_CHECK,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    content: '厨房里有火、有刀、有热水，小朋友尽量不要独自进入。微波炉加热液体要小心会突然喷溅。燃气灶附近不要放置易燃物品。',
    tips: ['不独自进厨房', '远离燃气灶和刀具', '微波炉加热要小心'],
    points: 15
  },
  {
    id: 'home_4',
    title: '阳台窗户安全',
    category: SAFETY_TYPES.HOME_CHECK,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '不要攀爬阳台栏杆，不要把头探出窗外。窗户要安装防护网。不要在窗台边玩耍，以免跌落。远离高层建筑的采光井和天井。',
    tips: ['不攀爬栏杆', '安装防护网', '窗边不玩耍'],
    points: 10
  },
  {
    id: 'home_5',
    title: '药品安全',
    category: SAFETY_TYPES.HOME_CHECK,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '药品不是糖果，不要随意服用。不要咬破胶囊或药片。化学品（洗洁精、杀虫剂等）也不能吃。如果不小心吃了不明物品，要立刻告诉家长并就医。',
    tips: ['药品不是糖果', '不明物品不入口', '误服立刻告诉家长'],
    points: 10
  },
  {
    id: 'home_6',
    title: '电梯安全',
    category: SAFETY_TYPES.HOME_CHECK,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '乘坐电梯要在家长陪同下进行，不在电梯里蹦跳、扒门。如果电梯故障被困，要使用紧急呼叫按钮，耐心等待救援，不要自行撬门。',
    tips: ['家长陪同乘坐', '电梯内不蹦跳', '被困按呼叫按钮'],
    points: 10
  }
]

/**
 * 急救知识数据
 */
const FIRST_AID_KNOWLEDGE = [
  {
    id: 'first_aid_1',
    title: '流鼻血处理',
    category: SAFETY_TYPES.FIRST_AID_KNOWLEDGE,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '流鼻血时不要仰头，以免血液流入气管。正确做法是：头部稍微前倾，用拇指和食指捏住鼻翼，持续按压5-10分钟。可以用冰敷额头帮助止血。',
    tips: ['头部前倾不仰头', '按压鼻翼5-10分钟', '冰敷额头帮助止血'],
    points: 10
  },
  {
    id: 'first_aid_2',
    title: '烫伤处理',
    category: SAFETY_TYPES.FIRST_AID_KNOWLEDGE,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '被烫伤后要立刻用冷水冲洗伤处，持续15-20分钟。不要涂抹牙膏、酱油等偏方。不要撕破烫出的水泡。用干净纱布轻轻覆盖后送医。',
    tips: ['冷水冲洗15-20分钟', '不涂牙膏酱油', '不撕水泡送医'],
    points: 10
  },
  {
    id: 'first_aid_3',
    title: '割伤处理',
    category: SAFETY_TYPES.FIRST_AID_KNOWLEDGE,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '小割伤要先用清水冲洗伤口，然后用碘伏消毒。如果伤口较小可以贴创可贴，如果伤口较大要用干净纱布加压止血后送医。',
    tips: ['清水冲洗伤口', '碘伏消毒', '大伤口要送医'],
    points: 10
  },
  {
    id: 'first_aid_4',
    title: '噎住急救（海姆立克）',
    category: SAFETY_TYPES.EMERGENCY_HANDLING,
    difficulty: DIFFICULTY_LEVELS.HARD,
    content: '如果吃东西被噎住，要立刻咳嗽尝试咳出。如果咳不出，站在对方身后，一手握拳放在肚脐上方，另一手握住拳头，向内向上快速冲击。如果对方失去意识要进行心肺复苏。',
    tips: ['首先尝试咳嗽', '海姆立克急救法', '失去意识做心肺复苏'],
    points: 20
  },
  {
    id: 'first_aid_5',
    title: '中暑处理',
    category: SAFETY_TYPES.EMERGENCY_HANDLING,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    content: '天热时如果出现头晕、恶心、出汗过多等症状，可能是中暑了。要立刻到阴凉处休息，脱掉多余衣服，喝淡盐水。用湿毛巾敷额头和腋下降温。',
    tips: ['移到阴凉处', '喝淡盐水', '湿毛巾物理降温'],
    points: 15
  },
  {
    id: 'first_aid_6',
    title: '昆虫叮咬',
    category: SAFETY_TYPES.FIRST_AID_KNOWLEDGE,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '被蜜蜂蛰伤要先用卡片刮出毒刺，不要挤。用肥皂水清洗，冷敷消肿。如果出现过敏反应（呼吸困难、全身红肿）要立刻就医。',
    tips: ['卡片刮出毒刺', '肥皂水清洗', '过敏要立刻就医'],
    points: 10
  },
  {
    id: 'first_aid_7',
    title: '扭伤处理',
    category: SAFETY_TYPES.FIRST_AID_KNOWLEDGE,
    difficulty: DIFFICULTY_LEVELS.EASY,
    content: '扭伤后要立刻停止活动，抬高受伤部位。24小时内冰敷，每次15-20分钟，每小时一次。不要热敷或按摩。用弹性绷带加压包扎。',
    tips: ['立刻停止活动', '24小时内冰敷', '抬高受伤部位'],
    points: 10
  },
  {
    id: 'first_aid_8',
    title: '心肺复苏基础',
    category: SAFETY_TYPES.SAFETY_DRILL,
    difficulty: DIFFICULTY_LEVELS.HARD,
    content: '如果有人溺水或心脏骤停，要立刻呼救并拨打120。进行胸外按压：双手重叠，按压两乳头连线中点，每分钟100-120次，深度约5厘米。配合人工呼吸效果更好。',
    tips: ['立刻呼救120', '胸外按压100-120次/分', '配合人工呼吸'],
    points: 25
  }
]

// 全部安全知识数据
const ALL_SAFETY_KNOWLEDGE = [
  ...ONLINE_SAFETY_KNOWLEDGE,
  ...CAMPUS_SAFETY_KNOWLEDGE,
  ...HOME_SAFETY_KNOWLEDGE,
  ...FIRST_AID_KNOWLEDGE
]

// ==================== 服务函数 ====================

/**
 * 获取安全知识列表
 * @param {string} category - 分类
 * @returns {Array}
 */
export function getSafetyKnowledge(category = null) {
  if (!category) {
    return ALL_SAFETY_KNOWLEDGE
  }
  return ALL_SAFETY_KNOWLEDGE.filter(item => item.category === category)
}

/**
 * 按分类获取安全知识
 * @param {string} category - SAFETY_CATEGORIES
 * @returns {Array}
 */
export function getSafetyKnowledgeByCategory(category) {
  const categoryMap = {
    [SAFETY_CATEGORIES.ONLINE]: [
      SAFETY_TYPES.ONLINE_KNOWLEDGE,
      SAFETY_TYPES.PRIVACY_PROTECTION,
      SAFETY_TYPES.ONLINE_LITERACY
    ],
    [SAFETY_CATEGORIES.CAMPUS]: [
      SAFETY_TYPES.CAMPUS_RULES,
      SAFETY_TYPES.EMERGENCY_ESCAPE,
      SAFETY_TYPES.SELF_PROTECTION
    ],
    [SAFETY_CATEGORIES.HOME]: [
      SAFETY_TYPES.HOME_CHECK,
      SAFETY_TYPES.ELECTRICAL_SAFETY,
      SAFETY_TYPES.STRANGER_RESPONSE
    ],
    [SAFETY_CATEGORIES.FIRST_AID]: [
      SAFETY_TYPES.FIRST_AID_KNOWLEDGE,
      SAFETY_TYPES.EMERGENCY_HANDLING,
      SAFETY_TYPES.SAFETY_DRILL
    ]
  }
  
  const types = categoryMap[category] || []
  return ALL_SAFETY_KNOWLEDGE.filter(item => types.includes(item.category))
}

/**
 * 获取单个安全知识
 * @param {string} id
 * @returns {Object|null}
 */
export function getSafetyKnowledgeById(id) {
  return ALL_SAFETY_KNOWLEDGE.find(item => item.id === id) || null
}

/**
 * 获取安全知识分类统计
 * @param {string} babyId
 * @returns {Object}
 */
export function getSafetyStats(babyId) {
  const db = getDatabase()
  const stats = {
    total: ALL_SAFETY_KNOWLEDGE.length,
    learned: 0,
    byCategory: {
      [SAFETY_CATEGORIES.ONLINE]: { total: 0, learned: 0 },
      [SAFETY_CATEGORIES.CAMPUS]: { total: 0, learned: 0 },
      [SAFETY_CATEGORIES.HOME]: { total: 0, learned: 0 },
      [SAFETY_CATEGORIES.FIRST_AID]: { total: 0, learned: 0 }
    },
    totalPoints: 0,
    earnedPoints: 0
  }
  
  // 按分类统计总数
  getSafetyKnowledgeByCategory(SAFETY_CATEGORIES.ONLINE).forEach(item => {
    stats.byCategory[SAFETY_CATEGORIES.ONLINE].total++
    stats.totalPoints += item.points
  })
  getSafetyKnowledgeByCategory(SAFETY_CATEGORIES.CAMPUS).forEach(item => {
    stats.byCategory[SAFETY_CATEGORIES.CAMPUS].total++
    stats.totalPoints += item.points
  })
  getSafetyKnowledgeByCategory(SAFETY_CATEGORIES.HOME).forEach(item => {
    stats.byCategory[SAFETY_CATEGORIES.HOME].total++
    stats.totalPoints += item.points
  })
  getSafetyKnowledgeByCategory(SAFETY_CATEGORIES.FIRST_AID).forEach(item => {
    stats.byCategory[SAFETY_CATEGORIES.FIRST_AID].total++
    stats.totalPoints += item.points
  })
  
  if (db) {
    try {
      const result = db.exec(`SELECT * FROM ${SAFETY_TABLES.SAFETY_PROGRESS} WHERE babyId = '${babyId}'`)
      if (result.length > 0) {
        result[0].values.forEach(row => {
          const columns = result[0].columns
          const record = {}
          columns.forEach((col, idx) => {
            record[col] = row[idx]
          })
          
          stats.learned++
          stats.earnedPoints += record.points || 0
          
          // 分类统计
          const knowledge = getSafetyKnowledgeById(record.knowledgeId)
          if (knowledge) {
            const cat = getCategoryByType(knowledge.category)
            if (cat && stats.byCategory[cat]) {
              stats.byCategory[cat].learned++
            }
          }
        })
      }
    } catch (e) {
      console.error('Error getting safety stats:', e)
    }
  }
  
  return stats
}

/**
 * 根据知识类型获取分类
 */
function getCategoryByType(type) {
  const typeMap = {}
  ;[SAFETY_TYPES.ONLINE_KNOWLEDGE, SAFETY_TYPES.PRIVACY_PROTECTION, SAFETY_TYPES.ONLINE_LITERACY].forEach(t => typeMap[t] = SAFETY_CATEGORIES.ONLINE)
  ;[SAFETY_TYPES.CAMPUS_RULES, SAFETY_TYPES.EMERGENCY_ESCAPE, SAFETY_TYPES.SELF_PROTECTION].forEach(t => typeMap[t] = SAFETY_CATEGORIES.CAMPUS)
  ;[SAFETY_TYPES.HOME_CHECK, SAFETY_TYPES.ELECTRICAL_SAFETY, SAFETY_TYPES.STRANGER_RESPONSE].forEach(t => typeMap[t] = SAFETY_CATEGORIES.HOME)
  ;[SAFETY_TYPES.FIRST_AID_KNOWLEDGE, SAFETY_TYPES.EMERGENCY_HANDLING, SAFETY_TYPES.SAFETY_DRILL].forEach(t => typeMap[t] = SAFETY_CATEGORIES.FIRST_AID)
  return typeMap[type]
}

/**
 * 标记安全知识为已学习
 * @param {string} babyId
 * @param {string} knowledgeId
 * @returns {Object}
 */
export function markSafetyKnowledgeLearned(babyId, knowledgeId) {
  const knowledge = getSafetyKnowledgeById(knowledgeId)
  if (!knowledge) {
    throw new Error('安全知识不存在')
  }
  
  const record = {
    id: generateId(),
    babyId,
    knowledgeId,
    category: knowledge.category,
    points: knowledge.points,
    learnedAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    try {
      // 检查是否已学习
      const existing = db.exec(`SELECT * FROM ${SAFETY_TABLES.SAFETY_PROGRESS} WHERE babyId = '${babyId}' AND knowledgeId = '${knowledgeId}'`)
      if (existing.length > 0 && existing[0].values.length > 0) {
        return record // 已存在，返回已有记录
      }
      insert(SAFETY_TABLES.SAFETY_PROGRESS, record)
    } catch (e) {
      console.error('Error marking learned:', e)
    }
  }
  
  return record
}

/**
 * 检查知识是否已学习
 * @param {string} babyId
 * @param {string} knowledgeId
 * @returns {boolean}
 */
export function isKnowledgeLearned(babyId, knowledgeId) {
  const db = getDatabase()
  if (!db) return false
  
  try {
    const result = db.exec(`SELECT * FROM ${SAFETY_TABLES.SAFETY_PROGRESS} WHERE babyId = '${babyId}' AND knowledgeId = '${knowledgeId}'`)
    return result.length > 0 && result[0].values.length > 0
  } catch (e) {
    return false
  }
}

/**
 * 获取已学习的安全知识ID列表
 * @param {string} babyId
 * @returns {Array}
 */
export function getLearnedKnowledgeIds(babyId) {
  const db = getDatabase()
  if (!db) return []
  
  try {
    const result = db.exec(`SELECT knowledgeId FROM ${SAFETY_TABLES.SAFETY_PROGRESS} WHERE babyId = '${babyId}'`)
    if (result.length === 0) return []
    return result[0].values.map(row => row[0])
  } catch (e) {
    return []
  }
}

/**
 * 获取安全知识测试题目
 * @param {string} category
 * @param {number} count
 * @returns {Array}
 */
export function getSafetyQuizQuestions(category = null, count = 5) {
  const knowledge = getSafetyKnowledge(category)
  
  // 随机选择知识生成题目
  const shuffled = [...knowledge].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))
  
  return selected.map(item => ({
    id: item.id,
    question: `关于"${item.title}"，以下说法正确的是？`,
    options: [
      { text: item.tips[0], correct: true },
      { text: `错误的做法是${item.tips[0]}`, correct: false },
      { text: '不知道', correct: false }
    ],
    correctAnswer: 0,
    knowledgeId: item.id,
    points: item.points
  }))
}

/**
 * 保存安全知识测试成绩
 * @param {string} babyId
 * @param {Object} scoreData
 * @returns {Object}
 */
export function saveSafetyQuizScore(babyId, scoreData) {
  const record = {
    id: generateId(),
    babyId,
    category: scoreData.category || null,
    score: scoreData.score,
    totalQuestions: scoreData.totalQuestions,
    correctAnswers: scoreData.correctAnswers,
    points: scoreData.points,
    completedAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(SAFETY_TABLES.SAFETY_QUIZ_SCORES, record)
  }
  
  return record
}

/**
 * 获取安全quiz历史
 * @param {string} babyId
 * @param {number} limit
 * @returns {Array}
 */
export function getSafetyQuizHistory(babyId, limit = 10) {
  const db = getDatabase()
  if (!db) return []
  
  try {
    const result = db.exec(`SELECT * FROM ${SAFETY_TABLES.SAFETY_QUIZ_SCORES} WHERE babyId = '${babyId}' ORDER BY completedAt DESC LIMIT ${limit}`)
    if (result.length === 0) return []
    
    return result[0].values.map(row => {
      const columns = result[0].columns
      const obj = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      return obj
    })
  } catch (e) {
    return []
  }
}

// 导出所有知识数据供页面使用
export const SAFETY_KNOWLEDGE_DATA = {
  [SAFETY_CATEGORIES.ONLINE]: ONLINE_SAFETY_KNOWLEDGE,
  [SAFETY_CATEGORIES.CAMPUS]: CAMPUS_SAFETY_KNOWLEDGE,
  [SAFETY_CATEGORIES.HOME]: HOME_SAFETY_KNOWLEDGE,
  [SAFETY_CATEGORIES.FIRST_AID]: FIRST_AID_KNOWLEDGE
}

// 导出分类信息
export const CATEGORY_INFO = {
  [SAFETY_CATEGORIES.ONLINE]: {
    name: '网络安全',
    icon: '💻',
    color: '#3498DB',
    description: '学习网络安全知识，保护自己'
  },
  [SAFETY_CATEGORIES.CAMPUS]: {
    name: '校园安全',
    icon: '🏫',
    color: '#27AE60',
    description: '校园安全守则，应急逃生知识'
  },
  [SAFETY_CATEGORIES.HOME]: {
    name: '家庭安全',
    icon: '🏠',
    color: '#E74C3C',
    description: '家庭安全检查，用电安全'
  },
  [SAFETY_CATEGORIES.FIRST_AID]: {
    name: '急救知识',
    icon: '🏥',
    color: '#9B59B6',
    description: '急救知识学习，自我保护'
  }
}
