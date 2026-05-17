import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'
import {
  initSkillTrees,
  getAllSkillTrees,
  getNodesByTree,
  getSkillNode,
  getOrCreateNodeStats,
  updateNodeProgress,
  isNodeUnlocked,
  isNodeAvailable,
  adjustThreshold,
  recordUnlockAttempt
} from '../db/sqlite.js'

/**
 * V6 技能树 Store
 * 管理技能树数据、节点状态、进度追踪
 */
export const useSkillTreeStore = defineStore('skillTree', () => {
  // 状态
  const skillTrees = ref([])        // 所有技能树
  const currentTreeId = ref('knowledge') // 当前选中的树
  const currentTreeNodes = ref([])   // 当前树的节点
  const nodeStatsMap = ref({})      // 节点统计数据 { nodeId: stats }
  const isInitialized = ref(false)
  
  // 获取宝宝Store
  const babyStore = useBabyStore()
  
  // 计算属性
  // 当前宝宝ID
  const currentBabyId = computed(() => babyStore.currentBabyId)
  
  // 当前树信息
  const currentTree = computed(() => {
    return skillTrees.value.find(t => t.id === currentTreeId.value) || null
  })
  
  // 获取节点状态
  const getNodeStatus = (nodeId) => {
    if (!currentBabyId.value) return 'locked'
    
    const stats = nodeStatsMap.value[nodeId]
    if (!stats) return 'locked'
    if (stats.unlockedAt) return 'unlocked'
    
    // 检查前置条件
    const node = getSkillNode(nodeId)
    if (!node) return 'locked'
    
    const prereqs = JSON.parse(node.prerequisiteIds || '[]')
    if (prereqs.length === 0) return 'available'
    
    // 检查前置节点是否都已解锁
    for (const prereqId of prereqs) {
      if (!isNodeUnlocked(prereqId, currentBabyId.value)) {
        return 'locked'
      }
    }
    
    return 'available'
  }
  
  // 获取节点进度
  const getNodeProgress = (nodeId) => {
    const stats = nodeStatsMap.value[nodeId]
    return stats ? stats.currentProgress : 0
  }
  
  // 获取节点详情
  const getNodeDetails = (nodeId) => {
    const node = getSkillNode(nodeId)
    if (!node) return null
    
    const stats = nodeStatsMap.value[nodeId]
    const status = getNodeStatus(nodeId)
    
    return {
      ...node,
      status,
      currentProgress: stats?.currentProgress || 0,
      bestProgress: stats?.bestProgress || 0,
      unlockedAt: stats?.unlockedAt || null,
      attemptCount: stats?.attemptCount || 0,
      progressPercent: node.conditionCount > 0
        ? Math.min(100, Math.round((stats?.currentProgress || 0) / node.conditionCount * 100))
        : 0
    }
  }
  
  // 方法
  // 初始化技能树
  const init = () => {
    if (isInitialized.value) return
    
    // Initialize skill trees and nodes
    initSkillTrees()
    
    // Load all skill trees
    skillTrees.value = getAllSkillTrees()
    
    isInitialized.value = true
    
    // Load stats for current baby
    if (currentBabyId.value) {
      loadBabyStats(currentBabyId.value)
    }
  }
  
  // 切换技能树
  const selectTree = (treeId) => {
    currentTreeId.value = treeId
    currentTreeNodes.value = getNodesByTree(treeId)
  }
  
  // 加载宝宝的节点统计数据
  const loadBabyStats = (babyId) => {
    if (!babyId) return
    
    const { getBabyNodeStats } = require('../db/sqlite.js')
    const stats = getBabyNodeStats(babyId)
    
    nodeStatsMap.value = {}
    for (const s of stats) {
      nodeStatsMap.value[s.nodeId] = s
    }
    
    // Ensure stats for all current tree nodes exist
    if (currentTreeNodes.value.length > 0) {
      for (const node of currentTreeNodes.value) {
        if (!nodeStatsMap.value[node.id]) {
          getOrCreateNodeStats(node.id, babyId)
          nodeStatsMap.value[node.id] = getOrCreateNodeStats(node.id, babyId)
        }
      }
    }
  }
  
  // 任务完成时调用 - 更新相关节点进度
  const onTaskComplete = (babyId, taskTags = []) => {
    if (!babyId) return
    
    const results = []
    
    // 获取所有节点
    for (const tree of skillTrees.value) {
      const nodes = getNodesByTree(tree.id)
      
      for (const node of nodes) {
        // 检查标签匹配
        if (taskTags.length > 0 && node.conditionTag) {
          if (!taskTags.includes(node.conditionTag)) {
            continue
          }
        }
        
        // 只处理 task_complete 类型的节点
        if (node.conditionType !== 'task_complete') continue
        
        const status = getNodeStatus(node.id)
        if (status === 'unlocked') continue  // 已解锁的跳过
        
        // 更新进度
        const result = updateNodeProgress(node.id, babyId, 1)
        
        // 刷新本地缓存
        nodeStatsMap.value[node.id] = getOrCreateNodeStats(node.id, babyId)
        
        if (result.unlocked) {
          results.push({
            nodeId: node.id,
            node,
            points: node.pointsReward
          })
        }
      }
    }
    
    return results
  }
  
  // 连续打卡时调用 - 用于 streak 类型节点
  const onStreakUpdate = (babyId, streakDays, tag) => {
    if (!babyId || !tag) return
    
    const results = []
    
    for (const tree of skillTrees.value) {
      const nodes = getNodesByTree(tree.id)
      
      for (const node of nodes) {
        if (node.conditionType !== 'streak') continue
        if (node.conditionTag !== tag) continue
        
        const status = getNodeStatus(node.id)
        if (status === 'unlocked') continue
        
        // 直接更新到目标进度
        const result = updateNodeProgress(node.id, babyId, streakDays)
        nodeStatsMap.value[node.id] = getOrCreateNodeStats(node.id, babyId)
        
        if (result.unlocked) {
          results.push({
            nodeId: node.id,
            node,
            points: node.pointsReward
          })
        }
      }
    }
    
    return results
  }
  
  // 打卡时调用 - 用于 checkin_count 类型节点
  const onCheckin = (babyId, taskId, taskTags = []) => {
    // 复用 onTaskComplete 逻辑，因为打卡也是一种任务完成
    return onTaskComplete(babyId, taskTags)
  }
  
  // 解锁尝试（失败记录）
  const onUnlockAttemptFailed = (nodeId, babyId) => {
    if (!nodeId || !babyId) return
    
    recordUnlockAttempt(nodeId, babyId)
    
    // 检查是否需要调整阈值
    const adjustResult = adjustThreshold(nodeId, babyId)
    
    // 刷新缓存
    nodeStatsMap.value[nodeId] = getOrCreateNodeStats(nodeId, babyId)
    
    return adjustResult
  }
  
  // 切换宝宝时重新加载
  const onBabyChange = (babyId) => {
    loadBabyStats(babyId)
  }
  
  // 获取树的总进度
  const getTreeProgress = (treeId) => {
    const nodes = getNodesByTree(treeId)
    if (!nodes.length) return { unlocked: 0, total: 0, percent: 0 }
    
    let unlocked = 0
    for (const node of nodes) {
      if (isNodeUnlocked(node.id, currentBabyId.value)) {
        unlocked++
      }
    }
    
    return {
      unlocked,
      total: nodes.length,
      percent: Math.round(unlocked / nodes.length * 100)
    }
  }
  
  // 获取总体解锁进度
  const totalProgress = computed(() => {
    let totalUnlocked = 0
    let totalNodes = 0
    
    for (const tree of skillTrees.value) {
      const progress = getTreeProgress(tree.id)
      totalUnlocked += progress.unlocked
      totalNodes += progress.total
    }
    
    return {
      unlocked: totalUnlocked,
      total: totalNodes,
      percent: totalNodes > 0 ? Math.round(totalUnlocked / totalNodes * 100) : 0
    }
  })
  
  return {
    // 状态
    skillTrees,
    currentTreeId,
    currentTreeNodes,
    nodeStatsMap,
    isInitialized,
    
    // 计算属性
    currentTree,
    currentBabyId,
    totalProgress,
    
    // 方法
    init,
    selectTree,
    loadBabyStats,
    onTaskComplete,
    onStreakUpdate,
    onCheckin,
    onUnlockAttemptFailed,
    onBabyChange,
    getNodeStatus,
    getNodeProgress,
    getNodeDetails,
    getTreeProgress
  }
})