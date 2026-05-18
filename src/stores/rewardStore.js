import { defineStore } from 'pinia'
import { ref } from 'vue'
import { query, insert, getById } from '@/db/sqlite.js'
import { TABLES } from '@/db/schema.js'
import { DEFAULT_REWARD_ITEMS, CATEGORIES, CATEGORY_NAMES, CATEGORY_ICONS } from '@/data/rewardItems.js'

/**
 * V12 积分商城商品管理Store
 * 管理积分商城虚拟商品
 */
export const useRewardStore = defineStore('reward', () => {
  // 状态
  const rewardItems = ref([])
  const isLoaded = ref(false)

  /**
   * 初始化商品数据
   * 从 SQLite reward_items 表加载，无数据则写入预设商品
   */
  const init = async () => {
    if (isLoaded.value) return

    try {
      // 从 SQLite 加载商品
      const items = query(TABLES.REWARD_ITEMS, { orderBy: 'category ASC, pointsCost ASC' })

      if (items.length === 0) {
        // 无数据，写入预设商品
        console.log('[V12] 初始化积分商城预设商品...')
        await seedDefaultItems()
        // 重新加载
        rewardItems.value = query(TABLES.REWARD_ITEMS, { orderBy: 'category ASC, pointsCost ASC' })
      } else {
        rewardItems.value = items
      }

      isLoaded.value = true
      console.log(`[V12] 加载 ${rewardItems.value.length} 个积分商城商品`)
    } catch (e) {
      console.error('[V12] 初始化积分商城失败:', e)
      // 降级使用内存预设数据
      rewardItems.value = DEFAULT_REWARD_ITEMS
      isLoaded.value = true
    }
  }

  /**
   * 写入预设商品到数据库
   */
  const seedDefaultItems = async () => {
    const now = new Date().toISOString()
    for (const item of DEFAULT_REWARD_ITEMS) {
      insert(TABLES.REWARD_ITEMS, {
        ...item,
        active: item.active ? 1 : 0,
        createdAt: now,
        updatedAt: now
      })
    }
  }

  /**
   * 按分类筛选商品
   * @param {string} category - 分类名称，null 或空表示全部
   * @returns {array} 筛选后的商品列表
   */
  const getItemsByCategory = (category) => {
    if (!category || category === 'all') {
      return rewardItems.value.filter(item => item.active === 1 || item.active === true)
    }
    return rewardItems.value.filter(item =>
      (item.active === 1 || item.active === true) &&
      item.category === category
    )
  }

  /**
   * 获取单个商品
   * @param {string} id - 商品ID
   * @returns {object|null} 商品对象
   */
  const getItemById = (id) => {
    const item = rewardItems.value.find(item => item.id === id)
    if (item) return item
    // 尝试从数据库获取
    return getById(TABLES.REWARD_ITEMS, id)
  }

  /**
   * 获取所有分类
   */
  const getCategories = () => {
    return Object.values(CATEGORIES)
  }

  /**
   * 获取分类信息
   */
  const getCategoryInfo = (category) => {
    return {
      id: category,
      name: CATEGORY_NAMES[category] || category,
      icon: CATEGORY_ICONS[category] || '📦'
    }
  }

  /**
   * 获取所有启用的分类列表
   */
  const getActiveCategories = () => {
    const categories = Object.values(CATEGORIES)
    return categories.map(cat => getCategoryInfo(cat))
  }

  /**
   * 刷新商品列表（从数据库重新加载）
   */
  const refresh = () => {
    rewardItems.value = query(TABLES.REWARD_ITEMS, { orderBy: 'category ASC, pointsCost ASC' })
  }

  return {
    // 状态
    rewardItems,
    isLoaded,

    // 方法
    init,
    getItemsByCategory,
    getItemById,
    getCategories,
    getCategoryInfo,
    getActiveCategories,
    refresh
  }
})

export default useRewardStore
