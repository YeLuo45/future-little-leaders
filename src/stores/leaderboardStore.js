import { defineStore } from 'pinia'
import { ref } from 'vue'
import { query } from '@/db/sqlite.js'
import { TABLES } from '@/db/schema.js'
import { useBabyStore } from './babyStore.js'
import { usePointsStore } from './pointsStore.js'

/**
 * V12 排行榜数据聚合Store
 * 管理宝宝积分排行、家庭内排行等
 */
export const useLeaderboardStore = defineStore('leaderboard', () => {
  // 状态
  const globalLeaderboard = ref([])
  const familyLeaderboard = ref([])
  const isLoaded = ref(false)

  // 宝宝Store
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()

  /**
   * 获取所有宝宝的积分排行（全局）
   * @returns {array} 排行列表，按总积分降序
   */
  const getLeaderboard = (familyId = null) => {
    try {
      // 获取所有宝宝
      const babies = babyStore.babies

      // 过滤家庭（如果指定了familyId）
      let targetBabies = babies
      if (familyId) {
        // familyId 暂时未使用，因为当前宝宝数据没有 familyId 字段
        // 这里按所有宝宝排行
        targetBabies = babies
      }

      // 聚合每个宝宝的积分
      const leaderboardData = targetBabies.map(baby => {
        const totalPoints = pointsStore.getBabyPoints(baby.id)
        return {
          babyId: baby.id,
          babyName: baby.name,
          babyAvatar: baby.avatar || babyStore.getDefaultAvatar(baby.id),
          totalPoints,
          rank: 0
        }
      })

      // 按积分降序排序
      leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints)

      // 设置排名
      leaderboardData.forEach((item, index) => {
        item.rank = index + 1
      })

      globalLeaderboard.value = leaderboardData
      return leaderboardData
    } catch (e) {
      console.error('[V12] 获取排行榜失败:', e)
      return []
    }
  }

  /**
   * 获取家庭内所有宝宝的排行
   * @param {string} familyId - 家庭ID（暂未使用）
   * @returns {array} 家庭内排行列表
   */
  const getFamilyLeaderboard = (familyId = null) => {
    // 家庭排行就是全局排行（因为当前数据模型没有多家庭支持）
    return getLeaderboard(familyId)
  }

  /**
   * 获取当前宝宝的排名
   * @param {string} babyId - 宝宝ID
   * @returns {number} 排名（从1开始），未找到返回0
   */
  const getBabyRank = (babyId) => {
    const leaderboard = globalLeaderboard.value.length > 0
      ? globalLeaderboard.value
      : getLeaderboard()

    const entry = leaderboard.find(item => item.babyId === babyId)
    return entry ? entry.rank : 0
  }

  /**
   * 获取排行前三名
   * @returns {array} 前三名宝宝数据
   */
  const getTopThree = () => {
    const leaderboard = globalLeaderboard.value.length > 0
      ? globalLeaderboard.value
      : getLeaderboard()

    return leaderboard.slice(0, 3)
  }

  /**
   * 获取当前宝宝在家庭中的排名百分比
   * @param {string} babyId - 宝宝ID
   * @returns {string} 百分比字符串，如 "Top 20%"
   */
  const getBabyPercentile = (babyId) => {
    const leaderboard = globalLeaderboard.value.length > 0
      ? globalLeaderboard.value
      : getLeaderboard()

    if (leaderboard.length === 0) return ''

    const rank = getBabyRank(babyId)
    if (rank === 0) return ''

    const percentile = Math.round((1 - rank / leaderboard.length) * 100)
    return `Top ${percentile}%`
  }

  /**
   * 刷新排行榜数据
   */
  const refresh = () => {
    getLeaderboard()
  }

  /**
   * 初始化
   */
  const init = () => {
    if (!isLoaded.value) {
      getLeaderboard()
      isLoaded.value = true
    }
  }

  return {
    // 状态
    globalLeaderboard,
    familyLeaderboard,
    isLoaded,

    // 方法
    getLeaderboard,
    getFamilyLeaderboard,
    getBabyRank,
    getTopThree,
    getBabyPercentile,
    refresh,
    init
  }
})

export default useLeaderboardStore
