/**
 * V56 Subscription & Rewards Service
 * VIP Subscription, Points Mall, Task Bounties, Limited Rewards
 */

import { getDatabase, insert, query, update } from '@/db/sqlite.js'
import { TABLES } from '@/db/schema.js'
import { usePointsStore } from '@/stores/pointsStore.js'

// ============ VIP Subscription ============

/**
 * VIP Subscription Plans
 */
export const VIP_PLANS = {
  MONTHLY: {
    id: 'vip_monthly',
    name: '月度VIP',
    nameEn: 'Monthly VIP',
    duration: 30, // days
    price: 30, // CNY
    points: 500,
    features: [
      'exclusive_tasks',
      'vip_skins',
      'vip_badges',
      'priority_support',
      'ad_free'
    ]
  },
  YEARLY: {
    id: 'vip_yearly',
    name: '年度VIP',
    nameEn: 'Yearly VIP',
    duration: 365, // days
    price: 299, // CNY
    points: 6000,
    features: [
      'exclusive_tasks',
      'vip_skins',
      'vip_badges',
      'priority_support',
      'ad_free',
      'early_access',
      'extra_rewards'
    ]
  }
}

/**
 * VIP Privileges
 */
export const VIP_PRIVILEGES = {
  exclusive_tasks: {
    id: 'exclusive_tasks',
    name: '专属任务',
    icon: '📋',
    description: '解锁VIP专属成长任务'
  },
  vip_skins: {
    id: 'vip_skins',
    name: 'VIP皮肤',
    icon: '👑',
    description: '解锁限定头像框和主题'
  },
  vip_badges: {
    id: 'vip_badges',
    name: 'VIP徽章',
    icon: '🏅',
    description: '展示尊贵VIP标识'
  },
  priority_support: {
    id: 'priority_support',
    name: '优先客服',
    icon: '🎧',
    description: '7x24小时优先客服支持'
  },
  ad_free: {
    id: 'ad_free',
    name: '无广告',
    icon: '🚫',
    description: '全程无广告体验'
  },
  early_access: {
    id: 'early_access',
    name: '抢先体验',
    icon: '🚀',
    description: '新功能抢先体验'
  },
  extra_rewards: {
    id: 'extra_rewards',
    name: '双倍奖励',
    icon: '💎',
    description: '任务奖励双倍积分'
  }
}

/**
 * Subscribe to VIP
 * @param {string} babyId - Baby ID
 * @param {string} planId - Plan ID (vip_monthly or vip_yearly)
 * @returns {Promise<{success: boolean, message: string, subscription?: object}>}
 */
export async function subscribeVIP(babyId, planId) {
  if (!babyId || !planId) {
    return { success: false, message: '参数错误' }
  }

  const plan = VIP_PLANS[planId.toUpperCase()]
  if (!plan) {
    return { success: false, message: '不存在的订阅套餐' }
  }

  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000)

    const subscription = {
      id: `vip_${babyId}_${Date.now()}`,
      babyId,
      planId: plan.id,
      planName: plan.name,
      startAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      autoRenew: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    // Check if already subscribed
    const existing = query(TABLES.VIP_SUBSCRIPTIONS, {
      where: { babyId, status: 'active' }
    })

    let finalSubscription = subscription

    if (existing.length > 0) {
      // Extend existing subscription
      const existingSub = existing[0]
      const existingExpiry = new Date(existingSub.expiresAt)
      const newExpiry = new Date(existingExpiry.getTime() + plan.duration * 24 * 60 * 60 * 1000)

      update(TABLES.VIP_SUBSCRIPTIONS, existingSub.id, {
        planId: plan.id,
        planName: plan.name,
        expiresAt: newExpiry.toISOString(),
        updatedAt: now.toISOString()
      })

      finalSubscription = { ...existingSub, expiresAt: newExpiry.toISOString() }
    } else {
      // Create new subscription
      insert(TABLES.VIP_SUBSCRIPTIONS, subscription)
    }

    // Give bonus points
    const pointsStore = usePointsStore()
    pointsStore.addPoints(babyId, plan.points, `订阅${plan.name}赠送`)

    console.log(`[V56] ${babyId} 订阅 ${plan.name} 成功，到期时间: ${finalSubscription.expiresAt}`)

    return {
      success: true,
      message: '订阅成功',
      subscription: finalSubscription
    }
  } catch (e) {
    console.error('[V56] VIP订阅失败:', e)
    return { success: false, message: '订阅失败，请重试' }
  }
}

/**
 * Check if baby has active VIP
 * @param {string} babyId
 * @returns {boolean}
 */
export function isVIPActive(babyId) {
  if (!babyId) return false

  try {
    const subs = query(TABLES.VIP_SUBSCRIPTIONS, {
      where: { babyId, status: 'active' }
    })

    if (subs.length === 0) return false

    const sub = subs[0]
    const expiresAt = new Date(sub.expiresAt)
    return expiresAt > new Date()
  } catch (e) {
    console.error('[V56] 检查VIP状态失败:', e)
    return false
  }
}

/**
 * Get VIP subscription info
 * @param {string} babyId
 * @returns {object|null}
 */
export function getVIPSubscription(babyId) {
  if (!babyId) return null

  try {
    const subs = query(TABLES.VIP_SUBSCRIPTIONS, {
      where: { babyId, status: 'active' }
    })

    if (subs.length === 0) return null

    const sub = subs[0]
    const expiresAt = new Date(sub.expiresAt)
    const isActive = expiresAt > new Date()

    return {
      ...sub,
      isActive,
      daysLeft: isActive ? Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : 0
    }
  } catch (e) {
    console.error('[V56] 获取VIP订阅信息失败:', e)
    return null
  }
}

/**
 * Cancel VIP subscription
 * @param {string} babyId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function cancelVIP(babyId) {
  if (!babyId) return { success: false, message: '参数错误' }

  try {
    const subs = query(TABLES.VIP_SUBSCRIPTIONS, {
      where: { babyId, status: 'active' }
    })

    if (subs.length === 0) {
      return { success: false, message: '无有效订阅' }
    }

    update(TABLES.VIP_SUBSCRIPTIONS, subs[0].id, {
      autoRenew: false,
      updatedAt: new Date().toISOString()
    })

    return { success: true, message: '已取消自动续费' }
  } catch (e) {
    console.error('[V56] 取消VIP订阅失败:', e)
    return { success: false, message: '操作失败，请重试' }
  }
}

// ============ Task Bounties ============

/**
 * Bounty Task Types
 */
export const BOUNTY_TYPES = {
  HIGH_POINTS: {
    id: 'high_points',
    name: '高积分任务',
    icon: '💰',
    multiplier: 3
  },
  LIMITED_TIME: {
    id: 'limited_time',
    name: '限时挑战',
    icon: '⏰',
    multiplier: 2
  },
  SPECIAL: {
    id: 'special',
    name: '特殊悬赏',
    icon: '🎯',
    multiplier: 5
  }
}

/**
 * Get available bounty tasks
 * @param {string} babyId
 * @returns {array}
 */
export function getBountyTasks(babyId) {
  if (!babyId) return []

  try {
    const tasks = query(TABLES.BOUNTY_TASKS, {
      where: { status: 'available' },
      orderBy: 'points DESC'
    })

    // Filter by time limit
    const now = new Date()
    return tasks.filter(task => {
      if (!task.expiresAt) return true
      return new Date(task.expiresAt) > now
    })
  } catch (e) {
    console.error('[V56] 获取悬赏任务失败:', e)
    return []
  }
}

/**
 * Claim bounty task
 * @param {string} babyId
 * @param {string} taskId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function claimBounty(babyId, taskId) {
  if (!babyId || !taskId) {
    return { success: false, message: '参数错误' }
  }

  try {
    const tasks = query(TABLES.BOUNTY_TASKS, {
      where: { id: taskId, status: 'available' }
    })

    if (tasks.length === 0) {
      return { success: false, message: '任务不存在或已领取' }
    }

    const task = tasks[0]

    // Check expiry
    if (task.expiresAt && new Date(task.expiresAt) < new Date()) {
      return { success: false, message: '任务已过期' }
    }

    // Check if already claimed by this baby
    const claims = query(TABLES.BOUNTY_CLAIMS, {
      where: { taskId, babyId }
    })

    if (claims.length > 0) {
      return { success: false, message: '已领取过此任务' }
    }

    // Create claim record
    const claim = {
      id: `claim_${Date.now()}_${babyId}`,
      taskId,
      babyId,
      claimedAt: new Date().toISOString(),
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    insert(TABLES.BOUNTY_CLAIMS, claim)

    // Update task claimant count
    update(TABLES.BOUNTY_TASKS, taskId, {
      claimantCount: (task.claimantCount || 0) + 1,
      updatedAt: new Date().toISOString()
    })

    return { success: true, message: '领取成功' }
  } catch (e) {
    console.error('[V56] 领取悬赏任务失败:', e)
    return { success: false, message: '领取失败，请重试' }
  }
}

/**
 * Complete bounty task
 * @param {string} babyId
 * @param {string} taskId
 * @returns {Promise<{success: boolean, message: string, points?: number}>}
 */
export async function completeBounty(babyId, taskId) {
  if (!babyId || !taskId) {
    return { success: false, message: '参数错误' }
  }

  try {
    const claims = query(TABLES.BOUNTY_CLAIMS, {
      where: { taskId, babyId, status: 'in_progress' }
    })

    if (claims.length === 0) {
      return { success: false, message: '未领取此任务' }
    }

    const tasks = query(TABLES.BOUNTY_TASKS, {
      where: { id: taskId }
    })

    if (tasks.length === 0) {
      return { success: false, message: '任务不存在' }
    }

    const task = tasks[0]
    const claim = claims[0]

    // Calculate VIP bonus
    const vipBonus = isVIPActive(babyId) ? 2 : 1
    const finalPoints = task.points * vipBonus

    // Update claim status
    update(TABLES.BOUNTY_CLAIMS, claim.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Add points
    const pointsStore = usePointsStore()
    pointsStore.addPoints(babyId, finalPoints, `完成悬赏任务: ${task.title}`)

    // Update task completion count
    update(TABLES.BOUNTY_TASKS, taskId, {
      completionCount: (task.completionCount || 0) + 1,
      updatedAt: new Date().toISOString()
    })

    return {
      success: true,
      message: `任务完成！获得 ${finalPoints} 积分`,
      points: finalPoints
    }
  } catch (e) {
    console.error('[V56] 完成悬赏任务失败:', e)
    return { success: false, message: '操作失败，请重试' }
  }
}

/**
 * Get baby's bounty claims
 * @param {string} babyId
 * @returns {array}
 */
export function getBountyClaims(babyId) {
  if (!babyId) return []

  try {
    return query(TABLES.BOUNTY_CLAIMS, {
      where: { babyId },
      orderBy: 'claimedAt DESC'
    })
  } catch (e) {
    console.error('[V56] 获取悬赏记录失败:', e)
    return []
  }
}

// ============ Limited Rewards ============

/**
 * Limited Reward Types
 */
export const LIMITED_REWARD_TYPES = {
  FESTIVAL_GIFT: {
    id: 'festival_gift',
    name: '节日礼包',
    icon: '🎁'
  },
  CONTINUOUS_SUBSCRIPTION: {
    id: 'continuous_subscription',
    name: '连续订阅',
    icon: '📅'
  },
  SPECIAL_EVENT: {
    id: 'special_event',
    name: '特惠活动',
    icon: '🔥'
  }
}

/**
 * Get active limited rewards
 * @param {string} babyId
 * @returns {array}
 */
export function getActiveLimitedRewards(babyId) {
  if (!babyId) return []

  try {
    const rewards = query(TABLES.LIMITED_REWARDS, {
      where: { status: 'active' },
      orderBy: 'endAt ASC'
    })

    const now = new Date()
    return rewards.filter(reward => {
      if (!reward.startAt || !reward.endAt) return true
      const start = new Date(reward.startAt)
      const end = new Date(reward.endAt)
      return start <= now && now <= end
    })
  } catch (e) {
    console.error('[V56] 获取限时奖励失败:', e)
    return []
  }
}

/**
 * Claim limited reward
 * @param {string} babyId
 * @param {string} rewardId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function claimLimitedReward(babyId, rewardId) {
  if (!babyId || !rewardId) {
    return { success: false, message: '参数错误' }
  }

  try {
    const rewards = query(TABLES.LIMITED_REWARDS, {
      where: { id: rewardId, status: 'active' }
    })

    if (rewards.length === 0) {
      return { success: false, message: '奖励不存在' }
    }

    const reward = rewards[0]

    // Check time window
    const now = new Date()
    if (reward.startAt && new Date(reward.startAt) > now) {
      return { success: false, message: '活动尚未开始' }
    }
    if (reward.endAt && new Date(reward.endAt) < now) {
      return { success: false, message: '活动已结束' }
    }

    // Check if already claimed
    const claims = query(TABLES.LIMITED_REWARD_CLAIMS, {
      where: { rewardId, babyId }
    })

    if (claims.length > 0) {
      return { success: false, message: '已领取过此奖励' }
    }

    // Create claim record
    const claim = {
      id: `lr_claim_${Date.now()}_${babyId}`,
      rewardId,
      babyId,
      claimedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    insert(TABLES.LIMITED_REWARD_CLAIMS, claim)

    // Give reward
    const pointsStore = usePointsStore()
    pointsStore.addPoints(babyId, reward.points, `领取${reward.name}`)

    return {
      success: true,
      message: `领取成功！获得 ${reward.points} 积分`
    }
  } catch (e) {
    console.error('[V56] 领取限时奖励失败:', e)
    return { success: false, message: '领取失败，请重试' }
  }
}

export default {
  // VIP
  VIP_PLANS,
  VIP_PRIVILEGES,
  subscribeVIP,
  isVIPActive,
  getVIPSubscription,
  cancelVIP,

  // Bounties
  BOUNTY_TYPES,
  getBountyTasks,
  claimBounty,
  completeBounty,
  getBountyClaims,

  // Limited Rewards
  LIMITED_REWARD_TYPES,
  getActiveLimitedRewards,
  claimLimitedReward
}
