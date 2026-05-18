/**
 * V30 Reputation Score Store
 * Manages reputation scoring for fair play
 * Base score: 100, Range: 0-200
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore'

// Reputation levels
export const REPUTATION_LEVELS = {
  EXCELLENT: 'excellent',   // 160-200
  GOOD: 'good',             // 120-159
  NORMAL: 'normal',         // 80-119
  SUSPICIOUS: 'suspicious', // 40-79
  VIOLATION: 'violation'    // 0-39
}

// Reputation change reasons
export const REPUTATION_REASONS = {
  HONEST_TASK: 'honest_task',         // +5 Completing tasks honestly
  REPORT_VIOLATION: 'report_violation', // +10 Reporting violations
  SCORE_FARMING: 'score_farming',          // -20 Score farming
  FAKE_CHECKIN: 'fake_checkin',       // -15 Fake check-in
  ANOMALY_DETECTED: 'anomaly_detected' // -10 Anomaly detected
}

// Storage key
const REPUTATION_KEY = 'reputation_scores'

/**
 * Get reputation data for all babies
 */
function getReputationData() {
  try {
    const stored = uni.getStorageSync(REPUTATION_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save reputation data
 */
function saveReputationData(data) {
  try {
    uni.setStorageSync(REPUTATION_KEY, JSON.stringify(data))
  } catch {
    console.warn('[V30] Failed to save reputation data')
  }
}

export const useReputationStore = defineStore('reputation', () => {
  const babyStore = useBabyStore()
  
  // State
  const reputationData = ref(getReputationData())
  
  // Get reputation for a baby
  function getReputation(babyId) {
    return reputationData.value[babyId] || {
      score: 100,
      level: REPUTATION_LEVELS.NORMAL,
      history: [],
      badges: [],
      lastUpdated: null
    }
  }
  
  // Calculate reputation level from score
  function calculateLevel(score) {
    if (score >= 160) return REPUTATION_LEVELS.EXCELLENT
    if (score >= 120) return REPUTATION_LEVELS.GOOD
    if (score >= 80) return REPUTATION_LEVELS.NORMAL
    if (score >= 40) return REPUTATION_LEVELS.SUSPICIOUS
    return REPUTATION_LEVELS.VIOLATION
  }
  
  // Update reputation score
  function updateReputation(babyId, change, reason, details = {}) {
    const data = reputationData.value[babyId] || {
      score: 100,
      level: REPUTATION_LEVELS.NORMAL,
      history: [],
      badges: [],
      lastUpdated: null
    }
    
    // Apply change with bounds (0-200)
    const oldScore = data.score
    data.score = Math.max(0, Math.min(200, data.score + change))
    data.level = calculateLevel(data.score)
    data.lastUpdated = Date.now()
    
    // Record history
    data.history.push({
      change,
      reason,
      details,
      timestamp: Date.now(),
      scoreBefore: oldScore,
      scoreAfter: data.score
    })
    
    // Keep only last 50 history entries
    if (data.history.length > 50) {
      data.history = data.history.slice(-50)
    }
    
    // Save
    reputationData.value[babyId] = data
    saveReputationData(reputationData.value)
    
    console.log('[V30] Reputation updated for', babyId, ':', oldScore, '->', data.score, 'reason:', reason)
    
    return data
  }
  
  // Computed: current baby's reputation
  const currentBabyReputation = computed(() => {
    const babyId = babyStore.currentBabyId
    return getReputation(babyId)
  })
  
  // Get reputation level display text
  function getLevelText(level) {
    const texts = {
      [REPUTATION_LEVELS.EXCELLENT]: '优秀',
      [REPUTATION_LEVELS.GOOD]: '良好',
      [REPUTATION_LEVELS.NORMAL]: '一般',
      [REPUTATION_LEVELS.SUSPICIOUS]: '可疑',
      [REPUTATION_LEVELS.VIOLATION]: '违规'
    }
    return texts[level] || '未知'
  }
  
  // Get level color
  function getLevelColor(level) {
    const colors = {
      [REPUTATION_LEVELS.EXCELLENT]: '#52c41a', // Green
      [REPUTATION_LEVELS.GOOD]: '#1890ff',      // Blue
      [REPUTATION_LEVELS.NORMAL]: '#faad14',    // Yellow
      [REPUTATION_LEVELS.SUSPICIOUS]: '#fa8c16', // Orange
      [REPUTATION_LEVELS.VIOLATION]: '#f5222d'  // Red
    }
    return colors[level] || '#999999'
  }
  
  // Add badge to baby
  function addBadge(babyId, badge) {
    const data = reputationData.value[babyId]
    if (data) {
      data.badges.push({
        ...badge,
        earnedAt: Date.now()
      })
      reputationData.value[babyId] = data
      saveReputationData(reputationData.value)
    }
  }
  
  // Reset reputation to default
  function resetReputation(babyId) {
    reputationData.value[babyId] = {
      score: 100,
      level: REPUTATION_LEVELS.NORMAL,
      history: [],
      badges: [],
      lastUpdated: Date.now()
    }
    saveReputationData(reputationData.value)
    console.log('[V30] Reputation reset for baby:', babyId)
  }
  
  // Get reputation trend (last N changes)
  function getReputationTrend(babyId, count = 10) {
    const data = getReputation(babyId)
    return data.history.slice(-count)
  }
  
  // Get reputation rank among all babies
  function getReputationRank(babyId) {
    const allData = reputationData.value
    const sorted = Object.entries(allData)
      .sort((a, b) => b[1].score - a[1].score)
    
    const index = sorted.findIndex(([id]) => id === babyId)
    return index >= 0 ? index + 1 : null
  }
  
  // Check if reputation is frozen (score too low)
  function isReputationFrozen(babyId) {
    const data = getReputation(babyId)
    return data.score < 40 // Frozen below suspicious threshold
  }
  
  // Get score breakdown for display
  function getScoreBreakdown(babyId) {
    const data = getReputation(babyId)
    const breakdown = {
      baseScore: 100,
      bonuses: [],
      penalties: [],
      total: data.score
    }
    
    data.history.slice(-20).forEach(entry => {
      if (entry.change > 0) {
        breakdown.bonuses.push({
          reason: entry.reason,
          change: entry.change,
          timestamp: entry.timestamp
        })
      } else {
        breakdown.penalties.push({
          reason: entry.reason,
          change: entry.change,
          timestamp: entry.timestamp
        })
      }
    })
    
    return breakdown
  }
  
  return {
    // State
    reputationData,
    // Getters
    currentBabyReputation,
    // Methods
    getReputation,
    updateReputation,
    calculateLevel,
    getLevelText,
    getLevelColor,
    addBadge,
    resetReputation,
    getReputationTrend,
    getReputationRank,
    isReputationFrozen,
    getScoreBreakdown,
    REPUTATION_LEVELS,
    REPUTATION_REASONS
  }
})
