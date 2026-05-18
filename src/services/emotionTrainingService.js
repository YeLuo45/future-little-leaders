// src/services/emotionTrainingService.js
// V44 Emotional Intelligence Training Service
// 情绪智力训练服务

import { useBabyStore } from '@/stores/babyStore.js'
import { getDatabase, insert, query } from '@/db/sqlite.js'

// ==================== 常量定义 ====================

// 情绪类型
export const EMOTION_TYPES = {
  HAPPY: 'happy',           // 开心
  SAD: 'sad',               // 伤心
  ANGRY: 'angry',           // 生气
  SCARED: 'scared',         // 害怕
  SURPRISED: 'surprised',   // 惊讶
  DISGUSTED: 'disgusted',   // 厌恶
  ANXIOUS: 'anxious',       // 焦虑
  CALM: 'calm',             // 平静
  GRATEFUL: 'grateful',     // 感恩
  PROUD: 'proud'            // 自豪
}

// 情绪分类
export const EMOTION_CATEGORIES = {
  POSITIVE: 'positive',     // 正面情绪
  NEGATIVE: 'negative',     // 负面情绪
  NEUTRAL: 'neutral'        // 中性情绪
}

// 情绪表情映射
export const EMOTION_EMOJIS = {
  [EMOTION_TYPES.HAPPY]: '😊',
  [EMOTION_TYPES.SAD]: '😢',
  [EMOTION_TYPES.ANGRY]: '😠',
  [EMOTION_TYPES.SCARED]: '😨',
  [EMOTION_TYPES.SURPRISED]: '😲',
  [EMOTION_TYPES.DISGUSTED]: '😒',
  [EMOTION_TYPES.ANXIOUS]: '😰',
  [EMOTION_TYPES.CALM]: '😌',
  [EMOTION_TYPES.GRATEFUL]: '🙏',
  [EMOTION_TYPES.PROUD]: '😎'
}

// 情绪颜色映射
export const EMOTION_COLORS = {
  [EMOTION_TYPES.HAPPY]: '#FFD93D',
  [EMOTION_TYPES.SAD]: '#6C9BCF',
  [EMOTION_TYPES.ANGRY]: '#FF6B6B',
  [EMOTION_TYPES.SCARED]: '#9B59B6',
  [EMOTION_TYPES.SURPRISED]: '#F39C12',
  [EMOTION_TYPES.DISGUSTED]: '#27AE60',
  [EMOTION_TYPES.ANXIOUS]: '#E74C3C',
  [EMOTION_TYPES.CALM]: '#1ABC9C',
  [EMOTION_TYPES.GRATEFUL]: '#3498DB',
  [EMOTION_TYPES.PROUD]: '#F1C40F'
}

// 情绪训练类型
export const TRAINING_TYPES = {
  RECOGNITION: 'recognition',     // 情绪识别
  EXPRESSION: 'expression',        // 情绪表达
  REGULATION: 'regulation',       // 情绪调节
  RELAXATION: 'relaxation'        // 放松练习
}

// 放松练习类型
export const RELAXATION_TYPES = {
  BREATHING: 'breathing',          // 深呼吸
  VISUALIZATION: 'visualization',  // 形象化
  BODY_SCAN: 'body_scan',         // 身体扫描
  STRETCHING: 'stretching'         // 伸展运动
}

// ==================== 数据库表 ====================

export const EMOTION_TABLES = {
  EMOTION_JOURNALS: 'emotion_journals',
  EMOTION_RECORDS: 'emotion_records',
  EMOTION_TRAINING_PROGRESS: 'emotion_training_progress',
  RELAXATION_SESSIONS: 'relaxation_sessions'
}

// ==================== 辅助函数 ====================

/**
 * 生成唯一ID
 */
function generateId() {
  return 'em_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取当前时间戳
 */
function now() {
  return new Date().toISOString()
}

/**
 * 获取情绪分类
 */
function getEmotionCategory(emotionType) {
  const positiveEmotions = [EMOTION_TYPES.HAPPY, EMOTION_TYPES.CALM, EMOTION_TYPES.GRATEFUL, EMOTION_TYPES.PROUD]
  const negativeEmotions = [EMOTION_TYPES.SAD, EMOTION_TYPES.ANGRY, EMOTION_TYPES.SCARED, EMOTION_TYPES.DISGUSTED, EMOTION_TYPES.ANXIOUS]
  
  if (positiveEmotions.includes(emotionType)) return EMOTION_CATEGORIES.POSITIVE
  if (negativeEmotions.includes(emotionType)) return EMOTION_CATEGORIES.NEGATIVE
  return EMOTION_CATEGORIES.NEUTRAL
}

/**
 * 获取情绪强度等级 (1-5)
 */
function getEmotionIntensity(score) {
  if (score >= 80) return 5
  if (score >= 60) return 4
  if (score >= 40) return 3
  if (score >= 20) return 2
  return 1
}

/**
 * 识别情绪场景数据
 */
const EMOTION_SCENARIOS = [
  {
    id: 'scenario_1',
    title: '收到礼物',
    description: '小朋友过生日，收到了期待已久的礼物',
    emotion: EMOTION_TYPES.HAPPY,
    options: [EMOTION_TYPES.HAPPY, EMOTION_TYPES.SURPRISED, EMOTION_TYPES.CALM],
    difficulty: 1
  },
  {
    id: 'scenario_2',
    title: '失去心爱玩具',
    description: '不小心弄丢了最喜欢的玩具汽车',
    emotion: EMOTION_TYPES.SAD,
    options: [EMOTION_TYPES.SAD, EMOTION_TYPES.ANGRY, EMOTION_TYPES.ANXIOUS],
    difficulty: 1
  },
  {
    id: 'scenario_3',
    title: '被欺负',
    description: '有小朋友抢走了你的绘本还推了你一下',
    emotion: EMOTION_TYPES.ANGRY,
    options: [EMOTION_TYPES.ANGRY, EMOTION_TYPES.SCARED, EMOTION_TYPES.SAD],
    difficulty: 2
  },
  {
    id: 'scenario_4',
    title: '打雷闪电',
    description: '晚上睡觉时突然电闪雷鸣',
    emotion: EMOTION_TYPES.SCARED,
    options: [EMOTION_TYPES.SCARED, EMOTION_TYPES.ANXIOUS, EMOTION_TYPES.SURPRISED],
    difficulty: 2
  },
  {
    id: 'scenario_5',
    title: '意外惊喜',
    description: '爸爸妈妈突然带你去游乐园玩',
    emotion: EMOTION_TYPES.SURPRISED,
    options: [EMOTION_TYPES.SURPRISED, EMOTION_TYPES.HAPPY, EMOTION_TYPES.PROUD],
    difficulty: 1
  },
  {
    id: 'scenario_6',
    title: '吃到不喜欢的东西',
    description: '午餐有不喜欢的青菜，味道怪怪的',
    emotion: EMOTION_TYPES.DISGUSTED,
    options: [EMOTION_TYPES.DISGUSTED, EMOTION_TYPES.SAD, EMOTION_TYPES.ANGRY],
    difficulty: 2
  },
  {
    id: 'scenario_7',
    title: '考试紧张',
    description: '明天要考试，感觉心里很不安',
    emotion: EMOTION_TYPES.ANXIOUS,
    options: [EMOTION_TYPES.ANXIOUS, EMOTION_TYPES.SCARED, EMOTION_TYPES.CALM],
    difficulty: 3
  },
  {
    id: 'scenario_8',
    title: '帮助别人',
    description: '扶起摔倒的小伙伴，帮助他回到座位',
    emotion: EMOTION_TYPES.GRATEFUL,
    options: [EMOTION_TYPES.GRATEFUL, EMOTION_TYPES.PROUD, EMOTION_TYPES.HAPPY],
    difficulty: 2
  },
  {
    id: 'scenario_9',
    title: '学会骑车',
    description: '终于不用辅助轮自己骑自行车了',
    emotion: EMOTION_TYPES.PROUD,
    options: [EMOTION_TYPES.PROUD, EMOTION_TYPES.HAPPY, EMOTION_TYPES.SURPRISED],
    difficulty: 2
  },
  {
    id: 'scenario_10',
    title: '花园休息',
    description: '在花园的摇椅上听着鸟叫发呆',
    emotion: EMOTION_TYPES.CALM,
    options: [EMOTION_TYPES.CALM, EMOTION_TYPES.HAPPY, EMOTION_TYPES.GRATEFUL],
    difficulty: 1
  }
]

/**
 * 情绪词汇数据
 */
const EMOTION_VOCABULARY = {
  [EMOTION_TYPES.HAPPY]: {
    words: ['开心', '快乐', '高兴', '愉快', '欢乐', '喜悦', '欢笑', '快乐极了'],
    description: '愉快、高兴的情绪，通常伴随微笑'
  },
  [EMOTION_TYPES.SAD]: {
    words: ['伤心', '难过', '悲伤', '沮丧', '失落', '忧郁', '痛苦', '郁闷'],
    description: '不愉快、难过的情绪，通常伴随哭泣或叹气'
  },
  [EMOTION_TYPES.ANGRY]: {
    words: ['生气', '愤怒', '气愤', '恼火', '发火', '暴躁', '恼怒', '大怒'],
    description: '强烈不满的情绪，可能想大喊或扔东西'
  },
  [EMOTION_TYPES.SCARED]: {
    words: ['害怕', '恐惧', '畏惧', '惊恐', '胆怯', '惊慌', '不安', '心慌'],
    description: '面对危险或威胁时的紧张情绪'
  },
  [EMOTION_TYPES.SURPRISED]: {
    words: ['惊讶', '吃惊', '意外', '诧异', '震惊', '意外', '惊奇', '惊喜'],
    description: '突然遇到意外情况时的反应'
  },
  [EMOTION_TYPES.DISGUSTED]: {
    words: ['厌恶', '讨厌', '反感', '嫌弃', '腻烦', '作呕', '厌烦', '排斥'],
    description: '对不喜欢事物的反感和排斥'
  },
  [EMOTION_TYPES.ANXIOUS]: {
    words: ['焦虑', '担心', '不安', '紧张', '忧虑', '惶恐', '着急', '忧虑不安'],
    description: '对未来不确定事件的担忧'
  },
  [EMOTION_TYPES.CALM]: {
    words: ['平静', '安宁', '镇定', '放松', '舒缓', '宁静', '安心', '轻松'],
    description: '平和、安静的内心状态'
  },
  [EMOTION_TYPES.GRATEFUL]: {
    words: ['感激', '感恩', '感谢', '谢意', '感动', '温馨', '暖心', '谢谢'],
    description: '对他人帮助的感激之情'
  },
  [EMOTION_TYPES.PROUD]: {
    words: ['自豪', '骄傲', '得意', '光荣', '荣耀', '成就感', '自信', '满足'],
    description: '对自己或他人成就的积极感受'
  }
}

/**
 * 放松练习数据
 */
const RELAXATION_EXERCISES = {
  [RELAXATION_TYPES.BREATHING]: [
    {
      id: 'breath_1',
      title: '腹式呼吸',
      description: '通过深呼吸让身体放松',
      duration: 60,
      steps: [
        '找一个舒服的姿势坐着或躺着',
        '将一只手放在胸口，另一只放在腹部',
        '用鼻子慢慢吸气，感觉腹部慢慢鼓起',
        '用嘴巴慢慢呼气，感觉腹部慢慢下降',
        '保持呼吸节奏：吸气4秒，屏气2秒，呼气6秒',
        '重复5-10次'
      ],
      tip: '每天练习3-5分钟，可以帮助平复情绪'
    },
    {
      id: 'breath_2',
      title: '4-7-8呼吸法',
      description: '帮助入睡和减轻焦虑',
      duration: 90,
      steps: [
        '舌头抵住上颚，牙齿轻咬',
        '用嘴巴完全呼气，发出"呼"的声音',
        '用鼻子吸气，数到4',
        '屏住呼吸，数到7',
        '用嘴巴呼气，数到8',
        '重复3-4次'
      ],
      tip: '睡前练习可以帮助入睡'
    },
    {
      id: 'breath_3',
      title: '盒式呼吸',
      description: '平衡呼吸，稳定情绪',
      duration: 60,
      steps: [
        '坐直身体，放松肩膀',
        '用鼻子吸气，数到4',
        '屏住呼吸，数到4',
        '用鼻子呼气，数到4',
        '屏住呼吸，数到4',
        '重复5-6次'
      ],
      tip: '考试前或紧张时练习很有帮助'
    }
  ],
  [RELAXATION_TYPES.VISUALIZATION]: [
    {
      id: 'visual_1',
      title: '快乐海滩',
      description: '想象自己在一个美丽放松的地方',
      duration: 120,
      steps: [
        '闭上眼睛，深呼吸3次',
        '想象自己躺在温暖的沙滩上',
        '阳光温柔地照在身上',
        '听着海浪轻轻拍打岸边的声音',
        '感受微风轻拂脸庞',
        '想象沙子的温暖质感',
        '你感到非常放松和舒适',
        '慢慢睁开眼睛，回到现实'
      ],
      tip: '可以选择任何让你感到平静的地方'
    },
    {
      id: 'visual_2',
      title: '森林漫步',
      description: '在想象中走进宁静的森林',
      duration: 120,
      steps: [
        '深呼吸，放松身体',
        '想象自己站在森林入口',
        '看到两旁高大翠绿的树木',
        '听到小鸟在枝头歌唱',
        '脚下是柔软湿润的落叶',
        '闻到泥土和树叶的清新气息',
        '感受到大自然的力量和宁静',
        '沿着小路慢慢走，享受这份平和'
      ],
      tip: '想象越具体越真实，效果越好'
    }
  ],
  [RELAXATION_TYPES.BODY_SCAN]: [
    {
      id: 'body_1',
      title: '从头到脚放松',
      description: '逐个放松身体各部位',
      duration: 180,
      steps: [
        '平躺或坐在舒适的椅子上',
        '深呼吸3次，放松全身',
        '先放松额头和头皮',
        '放松眼睛和脸颊',
        '放松下巴和颈部',
        '放松肩膀，向下垂落',
        '放松手臂和手掌',
        '放松胸部和背部',
        '放松腹部',
        '放松臀部和腿部',
        '放松双脚',
        '感受全身的放松感'
      ],
      tip: '每天睡前练习可以帮助改善睡眠'
    }
  ],
  [RELAXATION_TYPES.STRETCHING]: [
    {
      id: 'stretch_1',
      title: '颈部伸展',
      description: '放松紧张的颈肩部位',
      duration: 60,
      steps: [
        '坐直或站直',
        '慢慢将头向右侧倾，右耳靠右肩',
        '保持15秒，感受左侧拉伸',
        '回到中间',
        '慢慢将头向左侧倾，左耳靠左肩',
        '保持15秒，感受右侧拉伸',
        '重复2-3次'
      ],
      tip: '做作业累了可以随时练习'
    },
    {
      id: 'stretch_2',
      title: '手臂伸展',
      description: '释放手臂和肩膀的紧张',
      duration: 60,
      steps: [
        '双手交叉举过头顶',
        '掌心向上，尽量伸直',
        '向上拉伸，感觉全身拉长',
        '保持15秒',
        '放下手臂，放松',
        '重复3次'
      ],
      tip: '生气时做这个动作可以释放负面情绪'
    }
  ]
}

// ==================== 服务函数 ====================

/**
 * 创建情绪日记
 * @param {Object} journalData - 日记数据
 * @returns {Object} 创建的日记
 */
export function createEmotionJournal(journalData) {
  const babyStore = useBabyStore()
  const babyId = babyStore.currentBabyId
  
  if (!babyId) {
    throw new Error('请先选择宝宝')
  }
  
  const journal = {
    id: generateId(),
    babyId,
    emotion: journalData.emotion,
    intensity: journalData.intensity || 3,
    title: journalData.title || getEmotionTitle(journalData.emotion),
    content: journalData.content || '',
    triggers: JSON.stringify(journalData.triggers || []),
    thoughts: journalData.thoughts || '',
    behavior: journalData.behavior || '',
    regulationMethod: journalData.regulationMethod || '',
    category: getEmotionCategory(journalData.emotion),
    weather: journalData.weather || '',
    sleep: journalData.sleep || '',
    createdAt: now(),
    updatedAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(EMOTION_TABLES.EMOTION_JOURNALS, journal)
  }
  
  return journal
}

/**
 * 获取情绪日记标题
 */
function getEmotionTitle(emotionType) {
  const titles = {
    [EMOTION_TYPES.HAPPY]: '开心的一天',
    [EMOTION_TYPES.SAD]: '有点难过',
    [EMOTION_TYPES.ANGRY]: '生气的时候',
    [EMOTION_TYPES.SCARED]: '害怕的经历',
    [EMOTION_TYPES.SURPRISED]: '意外的惊喜',
    [EMOTION_TYPES.DISGUSTED]: '不喜欢的感觉',
    [EMOTION_TYPES.ANXIOUS]: '担心的事情',
    [EMOTION_TYPES.CALM]: '平静的时光',
    [EMOTION_TYPES.GRATEFUL]: '感恩的心',
    [EMOTION_TYPES.PROUD]: '自豪的时刻'
  }
  return titles[emotionType] || '今日心情'
}

/**
 * 获取宝宝的情绪日记列表
 * @param {string} babyId
 * @param {Object} options - 查询选项
 * @returns {Array}
 */
export function getEmotionJournals(babyId, options = {}) {
  const db = getDatabase()
  if (!db) return []
  
  let sql = `SELECT * FROM ${EMOTION_TABLES.EMOTION_JOURNALS} WHERE babyId = '${babyId}'`
  
  if (options.emotion) {
    sql += ` AND emotion = '${options.emotion}'`
  }
  
  if (options.startDate) {
    sql += ` AND createdAt >= '${options.startDate}'`
  }
  
  if (options.endDate) {
    sql += ` AND createdAt <= '${options.endDate}'`
  }
  
  sql += ' ORDER BY createdAt DESC'
  
  if (options.limit) {
    sql += ` LIMIT ${options.limit}`
  }
  
  try {
    const result = db.exec(sql)
    if (result.length === 0) return []
    
    return result[0].values.map(row => {
      const columns = result[0].columns
      const obj = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      // 解析JSON字段
      if (obj.triggers) {
        obj.triggers = JSON.parse(obj.triggers)
      }
      return obj
    })
  } catch (e) {
    console.error('getEmotionJournals error:', e)
    return []
  }
}

/**
 * 获取情绪识别训练题目
 * @param {number} difficulty - 难度等级 1-3
 * @returns {Array}
 */
export function getRecognitionExercises(difficulty = 1) {
  return EMOTION_SCENARIOS.filter(s => s.difficulty <= difficulty)
}

/**
 * 获取随机情绪识别题目
 * @param {number} count - 题目数量
 * @param {number} difficulty - 难度等级
 * @returns {Array}
 */
export function getRandomRecognitionExercises(count = 5, difficulty = 1) {
  const filtered = EMOTION_SCENARIOS.filter(s => s.difficulty <= difficulty)
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * 获取情绪词汇
 * @param {string} emotionType - 情绪类型
 * @returns {Object}
 */
export function getEmotionVocabulary(emotionType) {
  return EMOTION_VOCABULARY[emotionType] || null
}

/**
 * 获取所有情绪词汇
 * @returns {Object}
 */
export function getAllEmotionVocabulary() {
  return EMOTION_VOCABULARY
}

/**
 * 获取情绪统计
 * @param {string} babyId
 * @param {string} period - 统计周期 'week' | 'month'
 * @returns {Object}
 */
export function getEmotionStatistics(babyId, period = 'week') {
  const db = getDatabase()
  if (!db) return null
  
  let startDate = new Date()
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7)
  } else {
    startDate.setMonth(startDate.getMonth() - 1)
  }
  
  const sql = `
    SELECT emotion, COUNT(*) as count, AVG(intensity) as avgIntensity
    FROM ${EMOTION_TABLES.EMOTION_JOURNALS}
    WHERE babyId = '${babyId}' AND createdAt >= '${startDate.toISOString()}'
    GROUP BY emotion
  `
  
  try {
    const result = db.exec(sql)
    if (result.length === 0) return null
    
    const stats = {
      total: 0,
      byEmotion: {},
      avgIntensity: 0,
      dominantEmotion: null,
      positiveRatio: 0,
      negativeRatio: 0
    }
    
    let totalIntensity = 0
    let positiveCount = 0
    let negativeCount = 0
    
    result[0].values.forEach(row => {
      const emotion = row[0]
      const count = row[1]
      const avgIntensity = row[2]
      
      stats.byEmotion[emotion] = { count, avgIntensity }
      stats.total += count
      totalIntensity += avgIntensity * count
      
      const category = getEmotionCategory(emotion)
      if (category === EMOTION_CATEGORIES.POSITIVE) {
        positiveCount += count
      } else if (category === EMOTION_CATEGORIES.NEGATIVE) {
        negativeCount += count
      }
    })
    
    if (stats.total > 0) {
      stats.avgIntensity = totalIntensity / stats.total
      stats.positiveRatio = positiveCount / stats.total
      stats.negativeRatio = negativeCount / stats.total
      
      // 找出最常见的情绪
      let maxCount = 0
      Object.entries(stats.byEmotion).forEach(([emotion, data]) => {
        if (data.count > maxCount) {
          maxCount = data.count
          stats.dominantEmotion = emotion
        }
      })
    }
    
    return stats
  } catch (e) {
    console.error('getEmotionStatistics error:', e)
    return null
  }
}

/**
 * 记录情绪训练进度
 * @param {string} babyId
 * @param {string} trainingType - 训练类型
 * @param {Object} result - 训练结果
 * @returns {Object}
 */
export function recordTrainingProgress(babyId, trainingType, result) {
  const progress = {
    id: generateId(),
    babyId,
    trainingType,
    score: result.score || 0,
    correctCount: result.correctCount || 0,
    totalCount: result.totalCount || 0,
    duration: result.duration || 0,
    completedAt: now(),
    createdAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(EMOTION_TABLES.EMOTION_TRAINING_PROGRESS, progress)
  }
  
  return progress
}

/**
 * 获取训练进度
 * @param {string} babyId
 * @param {string} trainingType - 训练类型
 * @returns {Array}
 */
export function getTrainingProgress(babyId, trainingType) {
  const db = getDatabase()
  if (!db) return []
  
  const sql = `
    SELECT * FROM ${EMOTION_TABLES.EMOTION_TRAINING_PROGRESS}
    WHERE babyId = '${babyId}' AND trainingType = '${trainingType}'
    ORDER BY completedAt DESC
    LIMIT 10
  `
  
  try {
    const result = db.exec(sql)
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
    console.error('getTrainingProgress error:', e)
    return []
  }
}

/**
 * 获取放松练习
 * @param {string} type - 放松类型
 * @returns {Array}
 */
export function getRelaxationExercises(type = null) {
  if (type) {
    return RELAXATION_EXERCISES[type] || []
  }
  // 返回所有类型的第一个练习
  const exercises = []
  Object.values(RELAXATION_EXERCISES).forEach(exerciseList => {
    if (exerciseList.length > 0) {
      exercises.push(exerciseList[0])
    }
  })
  return exercises
}

/**
 * 记录放松练习会话
 * @param {string} babyId
 * @param {Object} sessionData - 会话数据
 * @returns {Object}
 */
export function recordRelaxationSession(babyId, sessionData) {
  const session = {
    id: generateId(),
    babyId,
    exerciseId: sessionData.exerciseId,
    exerciseType: sessionData.exerciseType,
    duration: sessionData.duration,
    completed: sessionData.completed || false,
    feedback: sessionData.feedback || '',
    completedAt: now(),
    createdAt: now()
  }
  
  const db = getDatabase()
  if (db) {
    insert(EMOTION_TABLES.RELAXATION_SESSIONS, session)
  }
  
  return session
}

/**
 * 获取放松练习历史
 * @param {string} babyId
 * @param {number} limit - 限制数量
 * @returns {Array}
 */
export function getRelaxationHistory(babyId, limit = 10) {
  const db = getDatabase()
  if (!db) return []
  
  const sql = `
    SELECT * FROM ${EMOTION_TABLES.RELAXATION_SESSIONS}
    WHERE babyId = '${babyId}'
    ORDER BY completedAt DESC
    LIMIT ${limit}
  `
  
  try {
    const result = db.exec(sql)
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
    console.error('getRelaxationHistory error:', e)
    return []
  }
}

/**
 * 获取放松练习统计
 * @param {string} babyId
 * @returns {Object}
 */
export function getRelaxationStats(babyId) {
  const db = getDatabase()
  if (!db) return null
  
  const sql = `
    SELECT 
      COUNT(*) as totalSessions,
      SUM(duration) as totalDuration,
      AVG(duration) as avgDuration,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedSessions
    FROM ${EMOTION_TABLES.RELAXATION_SESSIONS}
    WHERE babyId = '${babyId}'
  `
  
  try {
    const result = db.exec(sql)
    if (result.length === 0) return null
    
    const row = result[0].values[0]
    return {
      totalSessions: row[0] || 0,
      totalDuration: row[1] || 0,
      avgDuration: Math.round(row[2] || 0),
      completedSessions: row[3] || 0
    }
  } catch (e) {
    console.error('getRelaxationStats error:', e)
    return null
  }
}

/**
 * 情绪调节建议
 * @param {string} emotionType - 情绪类型
 * @returns {Array}
 */
export function getRegulationSuggestions(emotionType) {
  const suggestions = {
    [EMOTION_TYPES.HAPPY]: [
      '和家人朋友分享你的快乐',
      '把开心的时刻记在心里',
      '做一些让自己开心的事情'
    ],
    [EMOTION_TYPES.SAD]: [
      '找信任的人说说心里话',
      '做一些喜欢的事情转移注意力',
      '允许自己难过，但不要太久',
      '听一些温柔的音乐'
    ],
    [EMOTION_TYPES.ANGRY]: [
      '深呼吸，慢慢数到10',
      '离开让你生气的地方',
      '做一些运动释放能量',
      '把生气的原因写下来'
    ],
    [EMOTION_TYPES.SCARED]: [
      '告诉大人你害怕什么',
      '想象自己是一个勇敢的人',
      '做一些放松练习',
      '靠近让你感到安全的人'
    ],
    [EMOTION_TYPES.SURPRISED]: [
      '先冷静下来',
      '了解发生了什么事',
      '根据情况做出反应'
    ],
    [EMOTION_TYPES.DISGUSTED]: [
      '离开让你不舒服的地方',
      '用深呼吸让自己平静',
      '尝试接受新事物'
    ],
    [EMOTION_TYPES.ANXIOUS]: [
      '把担心的事情告诉家人',
      '做放松练习或深呼吸',
      '一步一步解决让你担心的事',
      '相信自己有能力面对'
    ],
    [EMOTION_TYPES.CALM]: [
      '珍惜这份平静',
      '做一些有意义的事情',
      '和家人一起享受时光'
    ],
    [EMOTION_TYPES.GRATEFUL]: [
      '对帮助你的人说谢谢',
      '记住帮助你的人',
      '长大后也去帮助别人'
    ],
    [EMOTION_TYPES.PROUD]: [
      '为自己感到高兴',
      '继续努力做得更好',
      '和家人分享你的成就'
    ]
  }
  
  return suggestions[emotionType] || []
}

export default {
  EMOTION_TYPES,
  EMOTION_CATEGORIES,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
  TRAINING_TYPES,
  RELAXATION_TYPES,
  EMOTION_TABLES,
  createEmotionJournal,
  getEmotionJournals,
  getRecognitionExercises,
  getRandomRecognitionExercises,
  getEmotionVocabulary,
  getAllEmotionVocabulary,
  getEmotionStatistics,
  recordTrainingProgress,
  getTrainingProgress,
  getRelaxationExercises,
  recordRelaxationSession,
  getRelaxationHistory,
  getRelaxationStats,
  getRegulationSuggestions
}
