// src/stores/achievementStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// localStorage keys
const ACHIEVEMENTS_KEY = 'achievements'
const ACHIEVEMENT_NOTIFICATIONS_KEY = 'achievement_notifications'

// 成就定义（18个成就）
const ACHIEVEMENT_DEFINITIONS = [
  // 坚持类
  { id: 'streak_7', name: '初出茅庐', description: '连续打卡7天', icon: '🏆', category: 'streak', condition: { type: 'streak', value: 7 }, points: 50 },
  { id: 'streak_30', name: '持之以恒', description: '连续打卡30天', icon: '💪', category: 'streak', condition: { type: 'streak', value: 30 }, points: 150 },
  { id: 'streak_100', name: '百年树人', description: '连续打卡100天', icon: '👑', category: 'streak', condition: { type: 'streak', value: 100 }, points: 500 },

  // 数量类
  { id: 'tasks_100', name: '小试牛刀', description: '累计完成任务100次', icon: '📝', category: 'count', condition: { type: 'tasks_completed', value: 100 }, points: 100 },
  { id: 'tasks_500', name: '熟能生巧', description: '累计完成任务500次', icon: '🎯', category: 'count', condition: { type: 'tasks_completed', value: 500 }, points: 300 },
  { id: 'points_1000', name: '积少成多', description: '累计获得1000积分', icon: '💎', category: 'count', condition: { type: 'points_earned', value: 1000 }, points: 80 },
  { id: 'points_5000', name: '富甲一方', description: '累计获得5000积分', icon: '🪙', category: 'count', condition: { type: 'points_earned', value: 5000 }, points: 200 },
  { id: 'points_10000', name: '富可敌国', description: '累计获得10000积分', icon: '💰', category: 'count', condition: { type: 'points_earned', value: 10000 }, points: 500 },

  // 收集类
  { id: 'tags_all', name: '全能标签', description: '使用过所有任务标签', icon: '🏷️', category: 'collect', condition: { type: 'tags_unlocked', value: 'all' }, points: 120 },
  { id: 'first_exchange', name: '初次兑换', description: '完成首次商品兑换', icon: '🎁', category: 'collect', condition: { type: 'exchanges_count', value: 1 }, points: 60 },

  // 特殊类
  { id: 'first_baby', name: '喜添新丁', description: '添加第一个宝宝', icon: '👶', category: 'special', condition: { type: 'babies_count', value: 1 }, points: 30 },
  { id: 'level_10', name: '小有成就', description: '宝宝达到10级', icon: '⭐', category: 'special', condition: { type: 'baby_level', value: 10 }, points: 100 },
  { id: 'level_50', name: '卓尔不凡', description: '宝宝达到50级', icon: '🌈', category: 'special', condition: { type: 'baby_level', value: 50 }, points: 300 },
  { id: 'perfect_week', name: '完美一周', description: '一周内每天完成任务', icon: '🌟', category: 'special', condition: { type: 'perfect_week', value: true }, points: 80 },
  { id: 'first_template', name: '模板达人', description: '使用模板创建任务', icon: '📋', category: 'special', condition: { type: 'template_used', value: true }, points: 40 },
  { id: 'babies_2', name: '双喜临门', description: '添加第二个宝宝', icon: '👫', category: 'special', condition: { type: 'babies_count', value: 2 }, points: 80 },
  { id: 'streak_7_all', name: '全员坚持', description: '所有宝宝都连续打卡7天', icon: '👨‍👩‍👧‍👦', category: 'streak', condition: { type: 'all_babies_streak', value: 7 }, points: 200 },
  { id: 'community_first', name: '社区之星', description: '发布第一篇社区动态', icon: '📢', category: 'special', condition: { type: 'posts_count', value: 1 }, points: 50 },
]

export const useAchievementStore = defineStore('achievement', () => {
  const unlockedAchievements = ref([])  // 已解锁成就列表
  const pendingNotifications = ref([])  // 待显示的通知队列

  // 初始化
  const init = () => {
    try {
      const stored = uni.getStorageSync(ACHIEVEMENTS_KEY)
      unlockedAchievements.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      unlockedAchievements.value = []
    }

    try {
      const notifications = uni.getStorageSync(ACHIEVEMENT_NOTIFICATIONS_KEY)
      pendingNotifications.value = notifications ? JSON.parse(notifications) : []
    } catch (e) {
      pendingNotifications.value = []
    }
  }

  // 检查是否已解锁
  const isUnlocked = (achievementId) => {
    return unlockedAchievements.value.some(a => a.id === achievementId)
  }

  // 解锁成就
  const unlock = (achievementId, customPoints) => {
    if (isUnlocked(achievementId)) return false

    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId)
    if (!achievement) return false

    const points = customPoints !== undefined ? customPoints : achievement.points

    unlockedAchievements.value.push({
      id: achievementId,
      unlockedAt: new Date().toISOString(),
      pointsAwarded: points
    })

    save()

    // 添加到通知队列
    pendingNotifications.value.push({
      id: achievementId,
      name: achievement.name,
      icon: achievement.icon,
      description: achievement.description,
      points: points
    })
    saveNotifications()

    return true
  }

  // 弹出通知
  const popNotification = () => {
    const notification = pendingNotifications.value.shift()
    saveNotifications()
    return notification
  }

  // 计算属性
  const unlockedCount = computed(() => unlockedAchievements.value.length)
  const totalCount = ACHIEVEMENT_DEFINITIONS.length

  // 获取已解锁成就列表
  const unlockedList = computed(() => {
    return ACHIEVEMENT_DEFINITIONS.filter(a => isUnlocked(a.id)).map(a => {
      const unlocked = unlockedAchievements.value.find(u => u.id === a.id)
      return {
        ...a,
        unlockedAt: unlocked?.unlockedAt,
        pointsAwarded: unlocked?.pointsAwarded
      }
    })
  })

  // 获取未解锁成就列表
  const lockedList = computed(() => {
    return ACHIEVEMENT_DEFINITIONS.filter(a => !isUnlocked(a.id))
  })

  // 保存到 localStorage
  const save = () => {
    uni.setStorageSync(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements.value))
  }

  // 保存通知到 localStorage
  const saveNotifications = () => {
    uni.setStorageSync(ACHIEVEMENT_NOTIFICATIONS_KEY, JSON.stringify(pendingNotifications.value))
  }

  // 检查所有条件并解锁
  const checkAndUnlock = (stats) => {
    if (!stats) return

    // streak_7: 连续打卡7天
    if (stats.currentStreak >= 7 && !isUnlocked('streak_7')) {
      unlock('streak_7')
    }

    // streak_30: 连续打卡30天
    if (stats.currentStreak >= 30 && !isUnlocked('streak_30')) {
      unlock('streak_30')
    }

    // streak_100: 连续打卡100天
    if (stats.currentStreak >= 100 && !isUnlocked('streak_100')) {
      unlock('streak_100')
    }

    // tasks_100: 完成任务100次
    if (stats.tasksCompleted >= 100 && !isUnlocked('tasks_100')) {
      unlock('tasks_100')
    }

    // tasks_500: 完成任务500次
    if (stats.tasksCompleted >= 500 && !isUnlocked('tasks_500')) {
      unlock('tasks_500')
    }

    // points_1000: 累计获得1000积分
    if (stats.pointsEarned >= 1000 && !isUnlocked('points_1000')) {
      unlock('points_1000')
    }

    // points_5000: 累计获得5000积分
    if (stats.pointsEarned >= 5000 && !isUnlocked('points_5000')) {
      unlock('points_5000')
    }

    // points_10000: 累计获得10000积分
    if (stats.pointsEarned >= 10000 && !isUnlocked('points_10000')) {
      unlock('points_10000')
    }

    // first_baby: 添加第一个宝宝
    if (stats.babiesCount >= 1 && !isUnlocked('first_baby')) {
      unlock('first_baby')
    }

    // babies_2: 添加第二个宝宝
    if (stats.babiesCount >= 2 && !isUnlocked('babies_2')) {
      unlock('babies_2')
    }

    // level_10: 宝宝达到10级
    if (stats.babyLevel >= 10 && !isUnlocked('level_10')) {
      unlock('level_10')
    }

    // level_50: 宝宝达到50级
    if (stats.babyLevel >= 50 && !isUnlocked('level_50')) {
      unlock('level_50')
    }

    // perfect_week: 一周内每天完成任务
    if (stats.perfectWeek === true && !isUnlocked('perfect_week')) {
      unlock('perfect_week')
    }

    // first_template: 使用模板创建任务
    if (stats.templateUsed === true && !isUnlocked('first_template')) {
      unlock('first_template')
    }

    // first_exchange: 完成首次商品兑换
    if (stats.exchangesCount >= 1 && !isUnlocked('first_exchange')) {
      unlock('first_exchange')
    }

    // community_first: 发布第一篇社区动态
    if (stats.postsCount >= 1 && !isUnlocked('community_first')) {
      unlock('community_first')
    }
  }

  return {
    ACHIEVEMENT_DEFINITIONS,
    unlockedAchievements,
    pendingNotifications,
    init,
    isUnlocked,
    unlock,
    popNotification,
    unlockedCount,
    totalCount,
    unlockedList,
    lockedList,
    checkAndUnlock
  }
})
