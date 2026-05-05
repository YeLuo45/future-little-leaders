import { defineStore } from 'pinia'

const FAVORITES_KEY = 'favorites_data'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: {} // { [productId]: { addedAt: timestamp } }
  }),

  getters: {
    /**
     * 获取所有收藏的商品ID列表
     */
    favoriteIds: (state) => Object.keys(state.favorites),

    /**
     * 检查商品是否已收藏
     */
    isFavorited: (state) => (productId) => {
      return !!state.favorites[productId]
    },

    /**
     * 获取收藏数量
     */
    count: (state) => Object.keys(state.favorites).length,

    /**
     * 获取收藏商品ID列表（按时间倒序）
     */
    sortedFavoriteIds: (state) => {
      return Object.entries(state.favorites)
        .sort((a, b) => new Date(b[1].addedAt) - new Date(a[1].addedAt))
        .map(([id]) => id)
    }
  },

  actions: {
    /**
     * 初始化加载收藏数据
     */
    init() {
      try {
        const stored = uni.getStorageSync(FAVORITES_KEY)
        if (stored) {
          this.favorites = typeof stored === 'string' ? JSON.parse(stored) : stored
        }
      } catch (e) {
        console.error('[FavoritesStore] 加载收藏数据失败:', e)
        this.favorites = {}
      }
    },

    /**
     * 添加收藏
     */
    addFavorite(productId) {
      if (!productId) return
      this.favorites[productId] = {
        addedAt: new Date().toISOString()
      }
      this.saveToStorage()
    },

    /**
     * 取消收藏
     */
    removeFavorite(productId) {
      if (!productId) return
      delete this.favorites[productId]
      this.saveToStorage()
    },

    /**
     * 切换收藏状态
     */
    toggleFavorite(productId) {
      if (this.isFavorited(productId)) {
        this.removeFavorite(productId)
        return false
      } else {
        this.addFavorite(productId)
        return true
      }
    },

    /**
     * 获取收藏列表
     */
    getFavorites() {
      return this.sortedFavoriteIds.map(id => ({
        productId: id,
        ...this.favorites[id]
      }))
    },

    /**
     * 清空所有收藏
     */
    clearAll() {
      this.favorites = {}
      this.saveToStorage()
    },

    /**
     * 保存到本地存储
     */
    saveToStorage() {
      try {
        uni.setStorageSync(FAVORITES_KEY, this.favorites)
      } catch (e) {
        console.error('[FavoritesStore] 保存收藏数据失败:', e)
      }
    }
  }
})
