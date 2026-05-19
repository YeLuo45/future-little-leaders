/**
 * V84 Knowledge Tree Store
 * 知识树系统状态管理
 * 学科知识图谱、学习路径、节点解锁、成长可视化
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'

// Storage keys
const KNOWLEDGE_TREE_DATA_KEY = 'knowledge_tree_data'
const KNOWLEDGE_PROGRESS_KEY = 'knowledge_progress'

// 学科分类
export const SUBJECT_CATEGORIES = {
  MATH: 'math',
  CHINESE: 'chinese',
  ENGLISH: 'english',
  SCIENCE: 'science',
  ART: 'art',
  MUSIC: 'music'
}

// 节点状态
export const NODE_STATUS = {
  LOCKED: 'locked',       // 未解锁
  AVAILABLE: 'available', // 可学习
  IN_PROGRESS: 'in_progress', // 学习中
  COMPLETED: 'completed'  // 已完成
}

// 默认知识树数据
const DEFAULT_KNOWLEDGE_TREES = [
  {
    id: 'math',
    name: '数学',
    icon: '🔢',
    color: '#4A90D9',
    description: '数学思维与逻辑训练',
    nodes: [
      { id: 'math_1', name: '数与运算', tier: 0, prerequisiteIds: '[]', difficulty: 1, points: 10 },
      { id: 'math_2', name: '加减法基础', tier: 1, prerequisiteIds: '["math_1"]', difficulty: 1, points: 15 },
      { id: 'math_3', name: '加减法进阶', tier: 2, prerequisiteIds: '["math_2"]', difficulty: 2, points: 20 },
      { id: 'math_4', name: '乘法入门', tier: 2, prerequisiteIds: '["math_2"]', difficulty: 2, points: 20 },
      { id: 'math_5', name: '除法基础', tier: 3, prerequisiteIds: '["math_3", "math_4"]', difficulty: 2, points: 25 },
      { id: 'math_6', name: '分数基础', tier: 4, prerequisiteIds: '["math_5"]', difficulty: 3, points: 30 },
      { id: 'math_7', name: '几何认知', tier: 1, prerequisiteIds: '["math_1"]', difficulty: 1, points: 15 },
      { id: 'math_8', name: '图形与空间', tier: 2, prerequisiteIds: '["math_7"]', difficulty: 2, points: 20 }
    ]
  },
  {
    id: 'chinese',
    name: '语文',
    icon: '📖',
    color: '#F59E0B',
    description: '语言表达与阅读理解',
    nodes: [
      { id: 'chinese_1', name: '识字基础', tier: 0, prerequisiteIds: '[]', difficulty: 1, points: 10 },
      { id: 'chinese_2', name: '拼音学习', tier: 1, prerequisiteIds: '["chinese_1"]', difficulty: 1, points: 15 },
      { id: 'chinese_3', name: '组词造句', tier: 2, prerequisiteIds: '["chinese_2"]', difficulty: 2, points: 20 },
      { id: 'chinese_4', name: '阅读理解', tier: 3, prerequisiteIds: '["chinese_3"]', difficulty: 2, points: 25 },
      { id: 'chinese_5', name: '看图写话', tier: 2, prerequisiteIds: '["chinese_3"]', difficulty: 2, points: 20 },
      { id: 'chinese_6', name: '日记写作', tier: 4, prerequisiteIds: '["chinese_4", "chinese_5"]', difficulty: 3, points: 30 }
    ]
  },
  {
    id: 'english',
    name: '英语',
    icon: '🔤',
    color: '#10B981',
    description: '听说读写基础训练',
    nodes: [
      { id: 'english_1', name: '字母认知', tier: 0, prerequisiteIds: '[]', difficulty: 1, points: 10 },
      { id: 'english_2', name: '自然拼读', tier: 1, prerequisiteIds: '["english_1"]', difficulty: 1, points: 15 },
      { id: 'english_3', name: '基础词汇', tier: 2, prerequisiteIds: '["english_2"]', difficulty: 2, points: 20 },
      { id: 'english_4', name: '日常口语', tier: 3, prerequisiteIds: '["english_3"]', difficulty: 2, points: 25 },
      { id: 'english_5', name: '简单对话', tier: 3, prerequisiteIds: '["english_3"]', difficulty: 2, points: 25 },
      { id: 'english_6', name: '阅读入门', tier: 4, prerequisiteIds: '["english_4", "english_5"]', difficulty: 3, points: 30 }
    ]
  },
  {
    id: 'science',
    name: '科学',
    icon: '🔬',
    color: '#8B5CF6',
    description: '探索自然与科学实验',
    nodes: [
      { id: 'science_1', name: '自然认知', tier: 0, prerequisiteIds: '[]', difficulty: 1, points: 10 },
      { id: 'science_2', name: '植物生长', tier: 1, prerequisiteIds: '["science_1"]', difficulty: 1, points: 15 },
      { id: 'science_3', name: '动物世界', tier: 1, prerequisiteIds: '["science_1"]', difficulty: 1, points: 15 },
      { id: 'science_4', name: '天文启蒙', tier: 2, prerequisiteIds: '["science_2", "science_3"]', difficulty: 2, points: 20 },
      { id: 'science_5', name: '物理认知', tier: 2, prerequisiteIds: '["science_2", "science_3"]', difficulty: 2, points: 20 },
      { id: 'science_6', name: '科学实验', tier: 3, prerequisiteIds: '["science_4", "science_5"]', difficulty: 3, points: 30 }
    ]
  }
]

export const useKnowledgeTreeStore = defineStore('knowledgeTree', () => {
  // ============ 状态 ============
  const knowledgeTrees = ref([])  // 知识树列表
  const currentTreeId = ref(null)  // 当前选中的树ID
  const currentTreeNodes = ref([])  // 当前树的节点
  const nodeProgress = ref({})  // 节点进度 { nodeId: { status, progress, completedAt } }
  const isLoading = ref(false)

  // 获取宝宝Store
  const babyStore = useBabyStore()

  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)

  // 当前树信息
  const currentTree = computed(() => {
    return knowledgeTrees.value.find(t => t.id === currentTreeId.value) || null
  })

  // ============ 初始化 ============
  const init = () => {
    loadKnowledgeTrees()
    loadProgress()
  }

  // 加载知识树数据
  const loadKnowledgeTrees = () => {
    try {
      const stored = uni.getStorageSync(KNOWLEDGE_TREE_DATA_KEY)
      if (stored) {
        knowledgeTrees.value = JSON.parse(stored)
      } else {
        // 使用默认数据
        knowledgeTrees.value = DEFAULT_KNOWLEDGE_TREES
        saveKnowledgeTrees()
      }
      
      // 默认选中第一个树
      if (!currentTreeId.value && knowledgeTrees.value.length > 0) {
        selectTree(knowledgeTrees.value[0].id)
      }
    } catch (e) {
      console.error('[KnowledgeTreeStore] 加载知识树失败:', e)
      knowledgeTrees.value = DEFAULT_KNOWLEDGE_TREES
    }
  }

  // 保存知识树数据
  const saveKnowledgeTrees = () => {
    uni.setStorageSync(KNOWLEDGE_TREE_DATA_KEY, JSON.stringify(knowledgeTrees.value))
  }

  // 加载进度数据
  const loadProgress = () => {
    if (!currentBabyId.value) return
    
    try {
      const stored = uni.getStorageSync(`${KNOWLEDGE_PROGRESS_KEY}_${currentBabyId.value}`)
      if (stored) {
        nodeProgress.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('[KnowledgeTreeStore] 加载进度失败:', e)
      nodeProgress.value = {}
    }
  }

  // 保存进度数据
  const saveProgress = () => {
    if (!currentBabyId.value) return
    uni.setStorageSync(`${KNOWLEDGE_PROGRESS_KEY}_${currentBabyId.value}`, JSON.stringify(nodeProgress.value))
  }

  // ============ 树操作 ============
  const selectTree = (treeId) => {
    currentTreeId.value = treeId
    const tree = knowledgeTrees.value.find(t => t.id === treeId)
    currentTreeNodes.value = tree ? tree.nodes : []
  }

  // ============ 节点操作 ============
  const getNodeStatus = (nodeId) => {
    const progress = nodeProgress.value[nodeId]
    if (!progress) return NODE_STATUS.LOCKED
    return progress.status || NODE_STATUS.LOCKED
  }

  const getNodeProgress = (nodeId) => {
    const progress = nodeProgress.value[nodeId]
    return progress ? (progress.progress || 0) : 0
  }

  const getNodeDetails = (nodeId) => {
    for (const tree of knowledgeTrees.value) {
      const node = tree.nodes.find(n => n.id === nodeId)
      if (node) {
        const progress = nodeProgress.value[nodeId] || {}
        return {
          ...node,
          status: progress.status || NODE_STATUS.LOCKED,
          progress: progress.progress || 0,
          completedAt: progress.completedAt || null
        }
      }
    }
    return null
  }

  // 检查节点是否可解锁
  const isNodeAvailable = (nodeId) => {
    for (const tree of knowledgeTrees.value) {
      const node = tree.nodes.find(n => n.id === nodeId)
      if (node) {
        const prereqs = JSON.parse(node.prerequisiteIds || '[]')
        // 如果没有前置条件，则可解锁
        if (prereqs.length === 0) return true
        // 检查所有前置节点是否已完成
        return prereqs.every(prereqId => {
          const status = getNodeStatus(prereqId)
          return status === NODE_STATUS.COMPLETED
        })
      }
    }
    return false
  }

  // 解锁节点（开始学习）
  const unlockNode = (nodeId) => {
    if (!isNodeAvailable(nodeId)) return false
    
    const currentStatus = getNodeStatus(nodeId)
    if (currentStatus === NODE_STATUS.COMPLETED) return false
    
    nodeProgress.value[nodeId] = {
      status: NODE_STATUS.IN_PROGRESS,
      progress: 0,
      startedAt: new Date().toISOString(),
      completedAt: null
    }
    saveProgress()
    return true
  }

  // 更新节点进度
  const updateNodeProgress = (nodeId, progress) => {
    const node = getNodeDetails(nodeId)
    if (!node) return false
    
    const newProgress = Math.min(100, Math.max(0, progress))
    
    if (node.status === NODE_STATUS.COMPLETED) return false
    
    if (!nodeProgress.value[nodeId]) {
      nodeProgress.value[nodeId] = {
        status: NODE_STATUS.IN_PROGRESS,
        progress: 0,
        startedAt: new Date().toISOString(),
        completedAt: null
      }
    }
    
    nodeProgress.value[nodeId].progress = newProgress
    
    // 达到100%则完成
    if (newProgress >= 100) {
      nodeProgress.value[nodeId].status = NODE_STATUS.COMPLETED
      nodeProgress.value[nodeId].completedAt = new Date().toISOString()
    }
    
    saveProgress()
    return true
  }

  // 完成节点学习
  const completeNode = (nodeId) => {
    return updateNodeProgress(nodeId, 100)
  }

  // ============ 学习路径 ============
  const getLearningPath = (treeId) => {
    const tree = knowledgeTrees.value.find(t => t.id === treeId)
    if (!tree) return []
    
    const path = []
    
    // 按层级排序节点
    const sortedNodes = [...tree.nodes].sort((a, b) => a.tier - b.tier)
    
    for (const node of sortedNodes) {
      const status = getNodeStatus(node.id)
      path.push({
        ...node,
        status,
        isNext: status === NODE_STATUS.AVAILABLE || (status === NODE_STATUS.LOCKED && isNodeAvailable(node.id))
      })
    }
    
    return path
  }

  // 获取下一个可学习的节点
  const getNextAvailableNode = (treeId) => {
    const tree = knowledgeTrees.value.find(t => t.id === treeId)
    if (!tree) return null
    
    for (const node of tree.nodes) {
      const status = getNodeStatus(node.id)
      if (status === NODE_STATUS.AVAILABLE || (status === NODE_STATUS.LOCKED && isNodeAvailable(node.id))) {
        return node
      }
    }
    return null
  }

  // ============ 进度统计 ============
  const getTreeProgress = (treeId) => {
    const tree = knowledgeTrees.value.find(t => t.id === treeId)
    if (!tree) return { completed: 0, total: 0, percent: 0 }
    
    const total = tree.nodes.length
    let completed = 0
    
    for (const node of tree.nodes) {
      if (getNodeStatus(node.id) === NODE_STATUS.COMPLETED) {
        completed++
      }
    }
    
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  // 总体进度
  const totalProgress = computed(() => {
    let totalCompleted = 0
    let totalNodes = 0
    
    for (const tree of knowledgeTrees.value) {
      totalNodes += tree.nodes.length
      for (const node of tree.nodes) {
        if (getNodeStatus(node.id) === NODE_STATUS.COMPLETED) {
          totalCompleted++
        }
      }
    }
    
    return {
      completed: totalCompleted,
      total: totalNodes,
      percent: totalNodes > 0 ? Math.round((totalCompleted / totalNodes) * 100) : 0
    }
  })

  // 获取已解锁节点数
  const unlockedCount = computed(() => {
    let count = 0
    for (const nodeId of Object.keys(nodeProgress.value)) {
      const status = nodeProgress.value[nodeId].status
      if (status === NODE_STATUS.IN_PROGRESS || status === NODE_STATUS.COMPLETED) {
        count++
      }
    }
    return count
  })

  // 切换宝宝时重新加载
  const onBabyChange = (babyId) => {
    loadProgress()
  }

  // ============ 暴露 ============
  return {
    // 状态
    knowledgeTrees,
    currentTreeId,
    currentTreeNodes,
    nodeProgress,
    isLoading,
    
    // 计算属性
    currentTree,
    currentBabyId,
    totalProgress,
    unlockedCount,
    
    // 方法
    init,
    selectTree,
    getNodeStatus,
    getNodeProgress,
    getNodeDetails,
    isNodeAvailable,
    unlockNode,
    updateNodeProgress,
    completeNode,
    getLearningPath,
    getNextAvailableNode,
    getTreeProgress,
    onBabyChange
  }
})
