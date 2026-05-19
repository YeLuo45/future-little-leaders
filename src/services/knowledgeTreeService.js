/**
 * V84 Knowledge Tree Service
 * 知识树服务层
 * 处理知识树相关业务逻辑
 */

import { SUBJECT_CATEGORIES, NODE_STATUS } from '../stores/knowledgeTreeStore.js'

// Storage keys
const LEARNING_HISTORY_KEY = 'knowledge_learning_history'
const NODE_RECORDS_KEY = 'knowledge_node_records'

// ============ 学习历史 ============

/**
 * 记录学习活动
 * @param {string} nodeId - 节点ID
 * @param {string} babyId - 宝宝ID
 * @param {object} data - 学习数据
 */
export const recordLearningActivity = (nodeId, babyId, data = {}) => {
  const history = getLearningHistory(babyId)
  
  const record = {
    id: `learn_${Date.now()}`,
    nodeId,
    babyId,
    timestamp: new Date().toISOString(),
    type: data.type || 'browse',  // browse, practice, quiz, complete
    duration: data.duration || 0,  // 学习时长（分钟）
    score: data.score || null,     // 练习/测验得分
    ...data
  }
  
  history.unshift(record)
  
  // 只保留最近500条
  if (history.length > 500) {
    uni.setStorageSync(`${LEARNING_HISTORY_KEY}_${babyId}`, JSON.stringify(history.slice(0, 500)))
  } else {
    uni.setStorageSync(`${LEARNING_HISTORY_KEY}_${babyId}`, JSON.stringify(history))
  }
  
  return record
}

/**
 * 获取学习历史
 * @param {string} babyId - 宝宝ID
 * @param {number} limit - 返回条数
 */
export const getLearningHistory = (babyId, limit = 50) => {
  try {
    const stored = uni.getStorageSync(`${LEARNING_HISTORY_KEY}_${babyId}`)
    if (!stored) return []
    
    const history = JSON.parse(stored)
    return limit ? history.slice(0, limit) : history
  } catch (e) {
    console.error('[KnowledgeTreeService] 获取学习历史失败:', e)
    return []
  }
}

/**
 * 获取节点学习记录
 * @param {string} nodeId - 节点ID
 * @param {string} babyId - 宝宝ID
 */
export const getNodeRecords = (nodeId, babyId) => {
  try {
    const stored = uni.getStorageSync(`${NODE_RECORDS_KEY}_${babyId}`)
    if (!stored) return []
    
    const records = JSON.parse(stored)
    return records.filter(r => r.nodeId === nodeId)
  } catch (e) {
    console.error('[KnowledgeTreeService] 获取节点记录失败:', e)
    return []
  }
}

/**
 * 添加节点记录
 * @param {string} nodeId - 节点ID
 * @param {string} babyId - 宝宝ID
 * @param {object} record - 记录数据
 */
export const addNodeRecord = (nodeId, babyId, record) => {
  try {
    const stored = uni.getStorageSync(`${NODE_RECORDS_KEY}_${babyId}`)
    const records = stored ? JSON.parse(stored) : []
    
    const newRecord = {
      id: `record_${Date.now()}`,
      nodeId,
      babyId,
      createdAt: new Date().toISOString(),
      ...record
    }
    
    records.unshift(newRecord)
    uni.setStorageSync(`${NODE_RECORDS_KEY}_${babyId}`, JSON.stringify(records))
    
    return newRecord
  } catch (e) {
    console.error('[KnowledgeTreeService] 添加节点记录失败:', e)
    return null
  }
}

// ============ 学习统计 ============

/**
 * 获取今日学习统计
 * @param {string} babyId - 宝宝ID
 */
export const getTodayLearningStats = (babyId) => {
  const history = getLearningHistory(babyId, 200)
  const today = new Date().toISOString().split('T')[0]
  
  const todayRecords = history.filter(r => r.timestamp.startsWith(today))
  
  return {
    totalMinutes: todayRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
    sessionCount: todayRecords.length,
    completedNodes: todayRecords.filter(r => r.type === 'complete').length
  }
}

/**
 * 获取本周学习统计
 * @param {string} babyId - 宝宝ID
 */
export const getWeekLearningStats = (babyId) => {
  const history = getLearningHistory(babyId, 500)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  
  const weekRecords = history.filter(r => {
    const recordDate = new Date(r.timestamp)
    return recordDate >= weekStart
  })
  
  // 按天统计
  const dailyStats = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dailyStats[dateStr] = { minutes: 0, count: 0, completed: 0 }
  }
  
  weekRecords.forEach(r => {
    const dateStr = r.timestamp.split('T')[0]
    if (dailyStats[dateStr]) {
      dailyStats[dateStr].minutes += r.duration || 0
      dailyStats[dateStr].count++
      if (r.type === 'complete') {
        dailyStats[dateStr].completed++
      }
    }
  })
  
  return {
    dailyStats,
    totalMinutes: weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
    totalSessions: weekRecords.length,
    completedNodes: weekRecords.filter(r => r.type === 'complete').length
  }
}

// ============ 节点学习内容 ============

/**
 * 获取节点学习内容
 * @param {string} nodeId - 节点ID
 */
export const getNodeLearningContent = (nodeId) => {
  // 根据节点ID返回对应的学习内容
  const contentMap = {
    // 数学
    math_1: {
      title: '数与运算',
      type: 'concept',
      description: '认识数字1-10，学习简单的计数',
      resources: [
        { type: 'video', title: '数字认知动画', duration: 5 },
        { type: 'game', title: '数水果游戏', duration: 10 },
        { type: 'practice', title: '数字连线练习', duration: 5 }
      ]
    },
    math_2: {
      title: '加减法基础',
      type: 'concept',
      description: '学习10以内的加减法运算',
      resources: [
        { type: 'video', title: '加法的含义', duration: 5 },
        { type: 'video', title: '减法的含义', duration: 5 },
        { type: 'game', title: '水果计算游戏', duration: 10 },
        { type: 'practice', title: '口算练习', duration: 10 }
      ]
    },
    // 语文
    chinese_1: {
      title: '识字基础',
      type: 'concept',
      description: '认识常用汉字100个',
      resources: [
        { type: 'video', title: '象形字的故事', duration: 10 },
        { type: 'game', title: '字卡配对', duration: 10 },
        { type: 'practice', title: '描红练习', duration: 15 }
      ]
    },
    // 英语
    english_1: {
      title: '字母认知',
      type: 'concept',
      description: '认识26个英语字母',
      resources: [
        { type: 'video', title: '字母歌', duration: 3 },
        { type: 'game', title: '字母钓鱼', duration: 10 },
        { type: 'practice', title: '字母描红', duration: 10 }
      ]
    },
    // 科学
    science_1: {
      title: '自然认知',
      type: 'concept',
      description: '认识自然界的基本事物',
      resources: [
        { type: 'video', title: '神奇的大自然', duration: 10 },
        { type: 'game', title: '自然探索', duration: 15 },
        { type: 'practice', title: '观察日记', duration: 10 }
      ]
    }
  }
  
  return contentMap[nodeId] || {
    title: '学习内容',
    type: 'general',
    description: '该节点的学习内容',
    resources: [
      { type: 'video', title: '趣味动画', duration: 5 },
      { type: 'game', title: '互动游戏', duration: 10 },
      { type: 'practice', title: '练习巩固', duration: 10 }
    ]
  }
}

/**
 * 获取推荐学习节点
 * @param {array} trees - 知识树列表
 * @param {object} progress - 节点进度
 */
export const getRecommendedNodes = (trees, progress) => {
  const recommendations = []
  
  for (const tree of trees) {
    for (const node of tree.nodes) {
      const nodeProgress = progress[node.id]
      
      // 跳过已完成的
      if (nodeProgress?.status === NODE_STATUS.COMPLETED) continue
      
      // 计算优先级
      let priority = 0
      
      // 可用的节点优先级最高
      if (!nodeProgress || nodeProgress.status === NODE_STATUS.LOCKED) {
        const prereqs = JSON.parse(node.prerequisiteIds || '[]')
        const allPrereqCompleted = prereqs.every(prereqId => 
          progress[prereqId]?.status === NODE_STATUS.COMPLETED
        )
        if (allPrereqCompleted) {
          priority = 3
        }
      }
      
      // 进行中的节点次之
      if (nodeProgress?.status === NODE_STATUS.IN_PROGRESS) {
        priority = 2
      }
      
      // 有进度的节点
      if (nodeProgress?.progress > 0 && nodeProgress?.progress < 100) {
        priority = 1
      }
      
      if (priority > 0) {
        recommendations.push({
          ...node,
          treeId: tree.id,
          treeName: tree.name,
          treeColor: tree.color,
          priority,
          progress: nodeProgress?.progress || 0
        })
      }
    }
  }
  
  // 按优先级和难度排序
  return recommendations.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.difficulty - b.difficulty
  })
}

// ============ 导出 ============

export default {
  // 学习历史
  recordLearningActivity,
  getLearningHistory,
  getNodeRecords,
  addNodeRecord,
  
  // 学习统计
  getTodayLearningStats,
  getWeekLearningStats,
  
  // 学习内容
  getNodeLearningContent,
  getRecommendedNodes
}
