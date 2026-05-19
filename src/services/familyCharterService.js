/**
 * V76 Family Charter Service
 * 家庭宪章系统服务层
 * 家庭价值观、家规共创、家庭会议、冲突解决机制
 */

import { getLocalUserBaby } from '@/utils/babyUtils'

// ============================================================================
// Types & Constants
// ============================================================================

// 价值观类别
export const VALUE_CATEGORY = {
  RESPECT: 'respect',         // 尊重
  RESPONSIBILITY: 'responsibility', // 责任
  KINDNESS: 'kindness',       // 善良
  COURAGE: 'courage',         // 勇气
  HONESTY: 'honesty',         // 诚实
  COOPERATION: 'cooperation'  // 合作
}

export const VALUE_CATEGORY_INFO = {
  [VALUE_CATEGORY.RESPECT]: { label: '尊重', icon: '🤝', color: '#722ED1', description: '尊重自己、他人和环境' },
  [VALUE_CATEGORY.RESPONSIBILITY]: { label: '责任', icon: '🎯', color: '#1890FF', description: '对自己的行为负责' },
  [VALUE_CATEGORY.KINDNESS]: { label: '善良', icon: '💖', color: '#EB2F96', description: '关爱他人，乐于助人' },
  [VALUE_CATEGORY.COURAGE]: { label: '勇气', icon: '🦁', color: '#FA8C16', description: '勇敢面对挑战' },
  [VALUE_CATEGORY.HONESTY]: { label: '诚实', icon: '💎', color: '#52C41A', description: '诚实守信，说真话' },
  [VALUE_CATEGORY.COOPERATION]: { label: '合作', icon: '🤝', color: '#13C2C2', description: '善于与他人合作' }
}

// 规则类别
export const RULE_CATEGORY = {
  DAILY_LIFE: 'daily_life',   // 日常生活
  LEARNING: 'learning',       // 学习
  BEHAVIOR: 'behavior',       // 行为规范
  SOCIAL: 'social'            // 社交
}

export const RULE_CATEGORY_INFO = {
  [RULE_CATEGORY.DAILY_LIFE]: { label: '日常生活', icon: '🏠', color: '#1890FF' },
  [RULE_CATEGORY.LEARNING]: { label: '学习', icon: '📚', color: '#52C41A' },
  [RULE_CATEGORY.BEHAVIOR]: { label: '行为规范', icon: '⚖️', color: '#FA8C16' },
  [RULE_CATEGORY.SOCIAL]: { label: '社交', icon: '👨‍👩‍👧', color: '#722ED1' }
}

// 奖惩类型
export const REWARD_PUNISHMENT_TYPE = {
  REWARD: 'reward',
  PUNISHMENT: 'punishment'
}

// 会议状态
export const MEETING_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  FINISHED: 'finished'
}

// 议题状态
export const AGENDA_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISCUSSED: 'discussed'
}

// 冲突解决状态
export const CONFLICT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved'
}

// localStorage keys
const FAMILY_VALUES_KEY = 'family_charter_values'
const FAMILY_RULES_KEY = 'family_charter_rules'
const FAMILY_MEETINGS_KEY = 'family_charter_meetings'
const FAMILY_CONFLICTS_KEY = 'family_charter_conflicts'
const FAMILY_CHARTER_CONFIG_KEY = 'family_charter_config'

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_VALUES = [
  { id: 'v1', text: '互相尊重', category: VALUE_CATEGORY.RESPECT, votes: 0, createdBy: 'system', status: 'active' },
  { id: 'v2', text: '勇于承担', category: VALUE_CATEGORY.RESPONSIBILITY, votes: 0, createdBy: 'system', status: 'active' },
  { id: 'v3', text: '善良助人', category: VALUE_CATEGORY.KINDNESS, votes: 0, createdBy: 'system', status: 'active' }
]

const DEFAULT_RULES = [
  { id: 'r1', text: '每天按时起床睡觉', category: RULE_CATEGORY.DAILY_LIFE, rewardPoints: 5, punishmentPoints: 3, status: 'active' },
  { id: 'r2', text: '完成作业后才能玩游戏', category: RULE_CATEGORY.LEARNING, rewardPoints: 10, punishmentPoints: 5, status: 'active' }
]

const DEFAULT_CONFIG = {
  votingEnabled: true,
  meetingReminder: true,
  conflictResolutionEnabled: true,
  familyMembers: []
}

// ============================================================================
// Service Class
// ============================================================================

class FamilyCharterService {
  constructor() {
    this.values = []
    this.rules = []
    this.meetings = []
    this.conflicts = []
    this.config = { ...DEFAULT_CONFIG }
  }

  // ============================================================================
  // 初始化
  // ============================================================================

  init() {
    this.loadValues()
    this.loadRules()
    this.loadMeetings()
    this.loadConflicts()
    this.loadConfig()
  }

  // ============================================================================
  // 家庭价值观
  // ============================================================================

  loadValues() {
    try {
      const stored = uni.getStorageSync(FAMILY_VALUES_KEY)
      this.values = stored ? JSON.parse(stored) : [...DEFAULT_VALUES]
    } catch (e) {
      console.error('加载家庭价值观失败:', e)
      this.values = [...DEFAULT_VALUES]
    }
  }

  saveValues() {
    uni.setStorageSync(FAMILY_VALUES_KEY, JSON.stringify(this.values))
  }

  getValues() {
    if (this.values.length === 0) {
      this.loadValues()
    }
    return this.values
  }

  getActiveValues() {
    return this.values.filter(v => v.status === 'active')
  }

  getValuesByCategory(category) {
    return this.values.filter(v => v.category === category && v.status === 'active')
  }

  addValue(text, category, createdBy) {
    const value = {
      id: 'val_' + Date.now(),
      text,
      category,
      votes: 0,
      votedBy: [],
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    this.values.push(value)
    this.saveValues()
    return value
  }

  voteValue(valueId, voterId) {
    const value = this.values.find(v => v.id === valueId)
    if (!value) return null

    if (!value.votedBy) value.votedBy = []
    if (value.votedBy.includes(voterId)) {
      // 取消投票
      value.votedBy = value.votedBy.filter(id => id !== voterId)
      value.votes = Math.max(0, value.votes - 1)
    } else {
      // 投票
      value.votedBy.push(voterId)
      value.votes++
    }
    this.saveValues()
    return value
  }

  deleteValue(valueId) {
    const index = this.values.findIndex(v => v.id === valueId)
    if (index !== -1) {
      this.values.splice(index, 1)
      this.saveValues()
      return true
    }
    return false
  }

  // ============================================================================
  // 家规
  // ============================================================================

  loadRules() {
    try {
      const stored = uni.getStorageSync(FAMILY_RULES_KEY)
      this.rules = stored ? JSON.parse(stored) : [...DEFAULT_RULES]
    } catch (e) {
      console.error('加载家规失败:', e)
      this.rules = [...DEFAULT_RULES]
    }
  }

  saveRules() {
    uni.setStorageSync(FAMILY_RULES_KEY, JSON.stringify(this.rules))
  }

  getRules() {
    if (this.rules.length === 0) {
      this.loadRules()
    }
    return this.rules
  }

  getActiveRules() {
    return this.rules.filter(r => r.status === 'active')
  }

  getRulesByCategory(category) {
    return this.rules.filter(r => r.category === category && r.status === 'active')
  }

  addRule(text, category, rewardPoints, punishmentPoints, createdBy) {
    const rule = {
      id: 'rule_' + Date.now(),
      text,
      category,
      rewardPoints: rewardPoints || 0,
      punishmentPoints: punishmentPoints || 0,
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'active',
      violationCount: 0
    }
    this.rules.push(rule)
    this.saveRules()
    return rule
  }

  updateRule(ruleId, updates) {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      Object.assign(rule, updates)
      this.saveRules()
      return rule
    }
    return null
  }

  deleteRule(ruleId) {
    const index = this.rules.findIndex(r => r.id === ruleId)
    if (index !== -1) {
      this.rules.splice(index, 1)
      this.saveRules()
      return true
    }
    return false
  }

  recordViolation(ruleId) {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.violationCount = (rule.violationCount || 0) + 1
      this.saveRules()
      return rule
    }
    return null
  }

  // ============================================================================
  // 家庭会议
  // ============================================================================

  loadMeetings() {
    try {
      const stored = uni.getStorageSync(FAMILY_MEETINGS_KEY)
      this.meetings = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载家庭会议失败:', e)
      this.meetings = []
    }
  }

  saveMeetings() {
    uni.setStorageSync(FAMILY_MEETINGS_KEY, JSON.stringify(this.meetings))
  }

  getMeetings() {
    if (this.meetings.length === 0) {
      this.loadMeetings()
    }
    return this.meetings
  }

  getUpcomingMeetings() {
    const now = new Date().toISOString()
    return this.meetings.filter(m => m.status === MEETING_STATUS.UPCOMING && m.scheduledTime > now)
  }

  getOngoingMeetings() {
    return this.meetings.filter(m => m.status === MEETING_STATUS.ONGOING)
  }

  getFinishedMeetings() {
    return this.meetings.filter(m => m.status === MEETING_STATUS.FINISHED)
  }

  createMeeting(title, scheduledTime, agenda, participantIds, createdBy) {
    const meeting = {
      id: 'meeting_' + Date.now(),
      title,
      scheduledTime,
      agenda: agenda || [],
      participantIds,
      createdBy,
      createdAt: new Date().toISOString(),
      status: MEETING_STATUS.UPCOMING,
      minutes: null,
      decisions: []
    }
    this.meetings.push(meeting)
    this.saveMeetings()
    return meeting
  }

  startMeeting(meetingId) {
    const meeting = this.meetings.find(m => m.id === meetingId)
    if (meeting && meeting.status === MEETING_STATUS.UPCOMING) {
      meeting.status = MEETING_STATUS.ONGOING
      meeting.startTime = new Date().toISOString()
      this.saveMeetings()
      return meeting
    }
    return null
  }

  endMeeting(meetingId, minutes, decisions) {
    const meeting = this.meetings.find(m => m.id === meetingId)
    if (meeting && meeting.status === MEETING_STATUS.ONGOING) {
      meeting.status = MEETING_STATUS.FINISHED
      meeting.endTime = new Date().toISOString()
      meeting.minutes = minutes
      meeting.decisions = decisions || []
      this.saveMeetings()
      return meeting
    }
    return null
  }

  addAgendaItem(meetingId, item) {
    const meeting = this.meetings.find(m => m.id === meetingId)
    if (meeting) {
      const agendaItem = {
        id: 'agenda_' + Date.now(),
        title: item.title,
        description: item.description || '',
        proposer: item.proposer,
        status: AGENDA_STATUS.PENDING,
        votes: { for: 0, against: 0, abstain: 0 },
        votedBy: [],
        createdAt: new Date().toISOString()
      }
      meeting.agenda.push(agendaItem)
      this.saveMeetings()
      return agendaItem
    }
    return null
  }

  voteAgendaItem(meetingId, agendaItemId, voterId, vote) {
    const meeting = this.meetings.find(m => m.id === meetingId)
    if (!meeting) return null

    const item = meeting.agenda.find(a => a.id === agendaItemId)
    if (!item) return null

    if (!item.votedBy) item.votedBy = []

    // 检查是否已投票
    const existingVoteIndex = item.votedBy.findIndex(v => v.voterId === voterId)
    if (existingVoteIndex !== -1) {
      // 移除旧投票
      const oldVote = item.votedBy[existingVoteIndex].vote
      if (oldVote === 'for') item.votes.for--
      else if (oldVote === 'against') item.votes.against--
      else if (oldVote === 'abstain') item.votes.abstain--
    }

    // 添加新投票
    if (existingVoteIndex !== -1) {
      item.votedBy[existingVoteIndex].vote = vote
    } else {
      item.votedBy.push({ voterId, vote })
    }

    if (vote === 'for') item.votes.for++
    else if (vote === 'against') item.votes.against++
    else if (vote === 'abstain') item.votes.abstain++

    // 更新状态
    const totalParticipants = meeting.participantIds.length
    if (item.votes.for > totalParticipants / 2) {
      item.status = AGENDA_STATUS.APPROVED
    } else if (item.votes.against > totalParticipants / 2) {
      item.status = AGENDA_STATUS.REJECTED
    }

    this.saveMeetings()
    return item
  }

  // ============================================================================
  // 冲突解决
  // ============================================================================

  loadConflicts() {
    try {
      const stored = uni.getStorageSync(FAMILY_CONFLICTS_KEY)
      this.conflicts = stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('加载冲突记录失败:', e)
      this.conflicts = []
    }
  }

  saveConflicts() {
    uni.setStorageSync(FAMILY_CONFLICTS_KEY, JSON.stringify(this.conflicts))
  }

  getConflicts() {
    return this.conflicts
  }

  getActiveConflicts() {
    return this.conflicts.filter(c => c.status !== CONFLICT_STATUS.RESOLVED)
  }

  createConflict(title, description, parties, createdBy) {
    const conflict = {
      id: 'conflict_' + Date.now(),
      title,
      description,
      parties,
      createdBy,
      createdAt: new Date().toISOString(),
      status: CONFLICT_STATUS.OPEN,
      resolution: null,
      steps: [{
        id: 'step_1',
        action: 'created',
        description: '冲突已创建',
        takenBy: createdBy,
        timestamp: new Date().toISOString()
      }]
    }
    this.conflicts.push(conflict)
    this.saveConflicts()
    return conflict
  }

  updateConflictStatus(conflictId, status, resolution) {
    const conflict = this.conflicts.find(c => c.id === conflictId)
    if (conflict) {
      conflict.status = status
      if (resolution) {
        conflict.resolution = resolution
      }
      this.saveConflicts()
      return conflict
    }
    return null
  }

  addConflictResolutionStep(conflictId, action, description, takenBy) {
    const conflict = this.conflicts.find(c => c.id === conflictId)
    if (conflict) {
      conflict.steps.push({
        id: 'step_' + (conflict.steps.length + 1),
        action,
        description,
        takenBy,
        timestamp: new Date().toISOString()
      })
      this.saveConflicts()
      return conflict
    }
    return null
  }

  // ============================================================================
  // 配置
  // ============================================================================

  loadConfig() {
    try {
      const stored = uni.getStorageSync(FAMILY_CHARTER_CONFIG_KEY)
      this.config = stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : { ...DEFAULT_CONFIG }
    } catch (e) {
      console.error('加载家庭宪章配置失败:', e)
      this.config = { ...DEFAULT_CONFIG }
    }
  }

  saveConfig() {
    uni.setStorageSync(FAMILY_CHARTER_CONFIG_KEY, JSON.stringify(this.config))
  }

  getConfig() {
    return this.config
  }

  updateConfig(updates) {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
    return this.config
  }

  // ============================================================================
  // 统计
  // ============================================================================

  getStatistics() {
    return {
      valuesCount: this.getActiveValues().length,
      rulesCount: this.getActiveRules().length,
      meetingsCount: this.meetings.length,
      upcomingMeetingsCount: this.getUpcomingMeetings().length,
      finishedMeetingsCount: this.getFinishedMeetings().length,
      activeConflictsCount: this.getActiveConflicts().length,
      totalValueVotes: this.getActiveValues().reduce((sum, v) => sum + v.votes, 0),
      totalRuleViolations: this.getActiveRules().reduce((sum, r) => sum + (r.violationCount || 0), 0)
    }
  }

  // ============================================================================
  // 重置
  // ============================================================================

  resetData() {
    this.values = [...DEFAULT_VALUES]
    this.rules = [...DEFAULT_RULES]
    this.meetings = []
    this.conflicts = []
    this.config = { ...DEFAULT_CONFIG }
    this.saveValues()
    this.saveRules()
    this.saveMeetings()
    this.saveConflicts()
    this.saveConfig()
    return true
  }
}

// 导出单例
const familyCharterService = new FamilyCharterService()
export default familyCharterService
