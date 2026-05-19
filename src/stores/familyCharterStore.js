/**
 * V76 Family Charter Store
 * 家庭宪章系统状态管理
 * 家庭价值观、家规共创、家庭会议、冲突解决机制
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import familyCharterService from '@/services/familyCharterService.js'
import { useBabyStore } from './babyStore.js'
import { usePointsStore } from './pointsStore.js'

export const useFamilyCharterStore = defineStore('familyCharter', () => {
  // ==================== 状态 ====================

  // 家庭价值观
  const values = ref([])

  // 家规
  const rules = ref([])

  // 家庭会议
  const meetings = ref([])

  // 冲突记录
  const conflicts = ref([])

  // 配置
  const config = ref({
    votingEnabled: true,
    meetingReminder: true,
    conflictResolutionEnabled: true,
    familyMembers: []
  })

  // 当前选中
  const currentMeeting = ref(null)
  const currentConflict = ref(null)

  // Store 引用
  let babyStore = null
  let pointsStore = null

  // ==================== 初始化 ====================

  const init = () => {
    familyCharterService.init()
    loadValues()
    loadRules()
    loadMeetings()
    loadConflicts()
    loadConfig()
  }

  // ==================== 计算属性 ====================

  // 活跃的价值观
  const activeValues = computed(() => values.value.filter(v => v.status === 'active'))

  // 活跃的家规
  const activeRules = computed(() => rules.value.filter(r => r.status === 'active'))

  // 即将到来的会议
  const upcomingMeetings = computed(() => {
    const now = new Date().toISOString()
    return meetings.value.filter(m => m.status === 'upcoming' && m.scheduledTime > now)
  })

  // 进行中的会议
  const ongoingMeetings = computed(() => {
    return meetings.value.filter(m => m.status === 'ongoing')
  })

  // 已结束的会议
  const finishedMeetings = computed(() => {
    return meetings.value.filter(m => m.status === 'finished')
  })

  // 未解决的冲突
  const activeConflicts = computed(() => {
    return conflicts.value.filter(c => c.status !== 'resolved')
  })

  // 统计信息
  const statistics = computed(() => familyCharterService.getStatistics())

  // 按类别分组的价值观
  const valuesByCategory = computed(() => {
    const grouped = {}
    activeValues.value.forEach(value => {
      if (!grouped[value.category]) {
        grouped[value.category] = []
      }
      grouped[value.category].push(value)
    })
    return grouped
  })

  // 按类别分组的家规
  const rulesByCategory = computed(() => {
    const grouped = {}
    activeRules.value.forEach(rule => {
      if (!grouped[rule.category]) {
        grouped[rule.category] = []
      }
      grouped[rule.category].push(rule)
    })
    return grouped
  })

  // ==================== 加载方法 ====================

  const loadValues = () => {
    values.value = familyCharterService.getValues()
  }

  const loadRules = () => {
    rules.value = familyCharterService.getRules()
  }

  const loadMeetings = () => {
    meetings.value = familyCharterService.getMeetings()
  }

  const loadConflicts = () => {
    conflicts.value = familyCharterService.getConflicts()
  }

  const loadConfig = () => {
    config.value = familyCharterService.getConfig()
  }

  // ==================== 价值观操作 ====================

  // 获取所有价值观
  const getAllValues = () => {
    return values.value
  }

  // 按类别获取价值观
  const getValuesByCategory = (category) => {
    return values.value.filter(v => v.category === category && v.status === 'active')
  }

  // 添加价值观
  const addValue = (text, category, createdBy) => {
    const value = familyCharterService.addValue(text, category, createdBy)
    loadValues()
    return value
  }

  // 投票价值观
  const voteValue = (valueId, voterId) => {
    const result = familyCharterService.voteValue(valueId, voterId)
    loadValues()
    return result
  }

  // 删除价值观
  const deleteValue = (valueId) => {
    const result = familyCharterService.deleteValue(valueId)
    loadValues()
    return result
  }

  // ==================== 家规操作 ====================

  // 获取所有家规
  const getAllRules = () => {
    return rules.value
  }

  // 按类别获取家规
  const getRulesByCategory = (category) => {
    return rules.value.filter(r => r.category === category && r.status === 'active')
  }

  // 添加家规
  const addRule = (text, category, rewardPoints, punishmentPoints, createdBy) => {
    const rule = familyCharterService.addRule(text, category, rewardPoints, punishmentPoints, createdBy)
    loadRules()
    return rule
  }

  // 更新家规
  const updateRule = (ruleId, updates) => {
    const rule = familyCharterService.updateRule(ruleId, updates)
    loadRules()
    return rule
  }

  // 删除家规
  const deleteRule = (ruleId) => {
    const result = familyCharterService.deleteRule(ruleId)
    loadRules()
    return result
  }

  // 记录违规
  const recordViolation = (ruleId) => {
    const rule = familyCharterService.recordViolation(ruleId)
    loadRules()
    return rule
  }

  // 奖励遵守
  const rewardCompliance = (ruleId, childId) => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule || !childId) return false

    if (!pointsStore) {
      try {
        pointsStore = usePointsStore()
      } catch (e) {
        console.error('PointsStore 初始化失败:', e)
        return false
      }
    }

    if (rule.rewardPoints > 0) {
      pointsStore.addBabyPoints(childId, rule.rewardPoints, `遵守家规奖励: ${rule.text}`)
    }
    return true
  }

  // 惩罚违规
  const punishViolation = (ruleId, childId) => {
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule || !childId) return false

    if (!pointsStore) {
      try {
        pointsStore = usePointsStore()
      } catch (e) {
        console.error('PointsStore 初始化失败:', e)
        return false
      }
    }

    if (rule.punishmentPoints > 0) {
      pointsStore.deductBabyPoints(childId, rule.punishmentPoints, `违反家规: ${rule.text}`)
    }
    recordViolation(ruleId)
    return true
  }

  // ==================== 家庭会议操作 ====================

  // 获取所有会议
  const getAllMeetings = () => {
    return meetings.value
  }

  // 创建会议
  const createMeeting = (title, scheduledTime, participantIds, createdBy) => {
    const meeting = familyCharterService.createMeeting(title, scheduledTime, [], participantIds, createdBy)
    loadMeetings()
    return meeting
  }

  // 开始会议
  const startMeeting = (meetingId) => {
    const meeting = familyCharterService.startMeeting(meetingId)
    loadMeetings()
    return meeting
  }

  // 结束会议
  const endMeeting = (meetingId, minutes, decisions) => {
    const meeting = familyCharterService.endMeeting(meetingId, minutes, decisions)
    loadMeetings()
    return meeting
  }

  // 选择当前会议
  const selectMeeting = (meeting) => {
    currentMeeting.value = meeting
  }

  // 获取当前会议
  const getCurrentMeeting = () => {
    return currentMeeting.value
  }

  // 添加议题
  const addAgendaItem = (meetingId, item) => {
    const agendaItem = familyCharterService.addAgendaItem(meetingId, item)
    loadMeetings()
    return agendaItem
  }

  // 投票议题
  const voteAgendaItem = (meetingId, agendaItemId, voterId, vote) => {
    const item = familyCharterService.voteAgendaItem(meetingId, agendaItemId, voterId, vote)
    loadMeetings()
    return item
  }

  // 获取会议议程
  const getMeetingAgenda = (meetingId) => {
    const meeting = meetings.value.find(m => m.id === meetingId)
    return meeting ? meeting.agenda : []
  }

  // ==================== 冲突解决操作 ====================

  // 获取所有冲突
  const getAllConflicts = () => {
    return conflicts.value
  }

  // 创建冲突
  const createConflict = (title, description, parties, createdBy) => {
    const conflict = familyCharterService.createConflict(title, description, parties, createdBy)
    loadConflicts()
    return conflict
  }

  // 选择当前冲突
  const selectConflict = (conflict) => {
    currentConflict.value = conflict
  }

  // 获取当前冲突
  const getCurrentConflict = () => {
    return currentConflict.value
  }

  // 更新冲突状态
  const updateConflictStatus = (conflictId, status, resolution) => {
    const conflict = familyCharterService.updateConflictStatus(conflictId, status, resolution)
    loadConflicts()
    return conflict
  }

  // 添加冲突解决步骤
  const addConflictResolutionStep = (conflictId, action, description, takenBy) => {
    const conflict = familyCharterService.addConflictResolutionStep(conflictId, action, description, takenBy)
    loadConflicts()
    return conflict
  }

  // 解决冲突
  const resolveConflict = (conflictId, resolution) => {
    return updateConflictStatus(conflictId, 'resolved', resolution)
  }

  // ==================== 配置操作 ====================

  // 获取配置
  const getConfig = () => {
    return config.value
  }

  // 更新配置
  const updateConfig = (updates) => {
    config.value = familyCharterService.updateConfig(updates)
    return config.value
  }

  // ==================== 统计 ====================

  // 获取统计
  const getStatistics = () => {
    return familyCharterService.getStatistics()
  }

  // ==================== 重置 ====================

  // 重置数据
  const resetData = () => {
    const success = familyCharterService.resetData()
    if (success) {
      loadValues()
      loadRules()
      loadMeetings()
      loadConflicts()
      loadConfig()
    }
    return success
  }

  // ==================== 导出 ====================

  return {
    // 状态
    values,
    rules,
    meetings,
    conflicts,
    config,
    currentMeeting,
    currentConflict,

    // 计算属性
    activeValues,
    activeRules,
    upcomingMeetings,
    ongoingMeetings,
    finishedMeetings,
    activeConflicts,
    statistics,
    valuesByCategory,
    rulesByCategory,

    // 方法 - 初始化
    init,

    // 方法 - 价值观
    getAllValues,
    getValuesByCategory,
    addValue,
    voteValue,
    deleteValue,

    // 方法 - 家规
    getAllRules,
    getRulesByCategory,
    addRule,
    updateRule,
    deleteRule,
    recordViolation,
    rewardCompliance,
    punishViolation,

    // 方法 - 会议
    getAllMeetings,
    createMeeting,
    startMeeting,
    endMeeting,
    selectMeeting,
    getCurrentMeeting,
    addAgendaItem,
    voteAgendaItem,
    getMeetingAgenda,

    // 方法 - 冲突
    getAllConflicts,
    createConflict,
    selectConflict,
    getCurrentConflict,
    updateConflictStatus,
    addConflictResolutionStep,
    resolveConflict,

    // 方法 - 配置
    getConfig,
    updateConfig,

    // 方法 - 统计
    getStatistics,

    // 方法 - 重置
    resetData
  }
})
