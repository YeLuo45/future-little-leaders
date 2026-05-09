/**
 * 成就触发引擎
 * 根据用户行为事件检查并触发成就解锁
 */

import { useAchievementStore } from '../stores/achievementStore'
import { useBabyStore } from '../stores/babyStore'

// 成就定义映射 (用于触发引擎)
const ACHIEVEMENT_TRIGGERS = {
  first_task: {
    id: 'first_task',
    name: '初出茅庐',
    description: '完成第1个任务',
    points: 10,
    check: (context) => context.taskCompleted >= 1
  },
  streak_7days: {
    id: 'streak_7days',
    name: '小小坚持家',
    description: '连续7天完成任务',
    points: 50,
    check: (context) => context.streakDays >= 7
  },
  points_500: {
    id: 'points_500',
    name: '累积达人',
    description: '累计500积分',
    points: 100,
    check: (context) => context.totalPoints >= 500
  },
  first_exchange: {
    id: 'first_exchange',
    name: '首次兑换',
    description: '首次商城兑换',
    points: 20,
    check: (context) => context.exchangeCount >= 1
  },
  full_week: {
    id: 'full_week',
    name: '全勤周',
    description: '一周7天不间断',
    points: 80,
    check: (context) => context.continuousDays >= 7
  }
}

/**
 * 成就触发钩子
 */
export const useAchievementTrigger = () => {
  const achievementStore = useAchievementStore()
  const babyStore = useBabyStore()

  /**
   * 检查并触发成就解锁
   * @param {string} childId - 孩子ID (等同于babyId)
   * @param {object} context - 触发上下文
   * @param {number} context.taskCompleted - 完成的任务数
   * @param {number} context.streakDays - 连续完成任务天数
   * @param {number} context.totalPoints - 累计积分
   * @param {number} context.exchangeCount - 兑换次数
   * @param {number} context.continuousDays - 连续天数(全勤)
   * @returns {array} 已解锁的成就列表
   */
  const checkAchievements = (childId, context = {}) => {
    if (!childId) {
      console.warn('checkAchievements: childId is required')
      return []
    }

    const unlockedAchievements = []

    // 遍历所有触发器进行检查
    for (const key in ACHIEVEMENT_TRIGGERS) {
      const trigger = ACHIEVEMENT_TRIGGERS[key]
      
      // 检查是否已解锁
      if (achievementStore.isUnlocked(childId, trigger.id)) {
        continue
      }

      // 检查触发条件
      if (trigger.check(context)) {
        const achievement = achievementStore.unlockAchievement(childId, trigger.id)
        if (achievement) {
          unlockedAchievements.push({
            ...achievement,
            triggerPoints: trigger.points
          })
        }
      }
    }

    return unlockedAchievements
  }

  /**
   * 任务完成时调用
   * @param {string} childId - 孩子ID
   * @returns {array} 已解锁的成就列表
   */
  const onTaskComplete = (childId) => {
    if (!childId) return []

    const context = {
      taskCompleted: achievementStore.taskCountByBaby[childId] || 0,
      streakDays: achievementStore.streakByBaby[childId]?.count || 0,
      totalPoints: achievementStore.totalPointsByBaby[childId] || 0,
      exchangeCount: achievementStore.exchangeCountByBaby[childId] || 0,
      continuousDays: achievementStore.streakByBaby[childId]?.count || 0
    }

    return checkAchievements(childId, context)
  }

  /**
   * 积分变化时调用
   * @param {string} childId - 孩子ID
   * @param {number} pointsEarned - 新增积分
   * @returns {array} 已解锁的成就列表
   */
  const onPointsChange = (childId, pointsEarned = 0) => {
    if (!childId) return []

    const context = {
      taskCompleted: achievementStore.taskCountByBaby[childId] || 0,
      streakDays: achievementStore.streakByBaby[childId]?.count || 0,
      totalPoints: achievementStore.totalPointsByBaby[childId] || 0,
      exchangeCount: achievementStore.exchangeCountByBaby[childId] || 0,
      continuousDays: achievementStore.streakByBaby[childId]?.count || 0
    }

    return checkAchievements(childId, context)
  }

  /**
   * 兑换成功时调用
   * @param {string} childId - 孩子ID
   * @returns {array} 已解锁的成就列表
   */
  const onExchange = (childId) => {
    if (!childId) return []

    const context = {
      taskCompleted: achievementStore.taskCountByBaby[childId] || 0,
      streakDays: achievementStore.streakByBaby[childId]?.count || 0,
      totalPoints: achievementStore.totalPointsByBaby[childId] || 0,
      exchangeCount: (achievementStore.exchangeCountByBaby[childId] || 0) + 1,
      continuousDays: achievementStore.streakByBaby[childId]?.count || 0
    }

    return checkAchievements(childId, context)
  }

  /**
   * 打卡签到时调用
   * @param {string} childId - 孩子ID
   * @returns {array} 已解锁的成就列表
   */
  const onCheckIn = (childId) => {
    if (!childId) return []

    const context = {
      taskCompleted: achievementStore.taskCountByBaby[childId] || 0,
      streakDays: achievementStore.streakByBaby[childId]?.count || 0,
      totalPoints: achievementStore.totalPointsByBaby[childId] || 0,
      exchangeCount: achievementStore.exchangeCountByBaby[childId] || 0,
      continuousDays: achievementStore.streakByBaby[childId]?.count || 0
    }

    return checkAchievements(childId, context)
  }

  return {
    checkAchievements,
    onTaskComplete,
    onPointsChange,
    onExchange,
    onCheckIn
  }
}

export default useAchievementTrigger
