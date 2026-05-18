/**
 * 微信分享服务
 * 提供微信分享配置、分享到朋友、分享到朋友圈等功能
 */

import { TABLES } from '../db/schema'

// #ifdef H5
import wxJssdk from '../utils/wx-jssdk.js'
// #endif

// #ifdef MP-WEIXIN
import wxMiniProgram from '../utils/wx-jssdk.js'
// #endif

let db = null

const initDb = () => {
  if (!db && typeof uni !== 'undefined') {
    const SQLiteDB = require('../db/sqlite').SQLiteDB
    db = SQLiteDB.getInstance()
  }
}

/**
 * 生成唯一 ID
 * @returns {string}
 */
const generateId = () => {
  return 'share_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期
 * @returns {string}
 */
const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化时间
 * @param {Date|string} date - 日期
 * @returns {string}
 */
const formatDateTime = (date) => {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)} ${hours}:${minutes}`
}

export const wxService = {
  /**
   * 初始化分享服务
   * @param {Object} options - 初始化选项
   */
  async init(options = {}) {
    initDb()
    
    // #ifdef H5
    await wxJssdk.init(options)
    // #endif
    
    // 创建分享记录表
    await this.createShareTable()
  },

  /**
   * 创建分享记录表
   * @returns {boolean}
   */
  async createShareTable() {
    initDb()
    if (!db) return false

    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLES.SHARE_RECORDS} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        baby_id TEXT NOT NULL,
        share_type TEXT NOT NULL,
        card_template TEXT,
        card_data TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
    return db.execute(sql)
  },

  /**
   * 获取分享信息
   * @param {string} shareId - 分享记录 ID
   * @returns {Promise<Object|null>}
   */
  async getShareInfo(shareId) {
    initDb()
    if (!db) return null

    const sql = `SELECT * FROM ${TABLES.SHARE_RECORDS} WHERE id = ?`
    const result = await db.query(sql, [shareId])
    return result && result.length > 0 ? result[0] : null
  },

  /**
   * 保存分享记录
   * @param {Object} shareData - 分享数据
   * @returns {Promise<boolean>}
   */
  async saveShareRecord(shareData) {
    initDb()
    if (!db) return false

    const sql = `
      INSERT INTO ${TABLES.SHARE_RECORDS} (id, user_id, baby_id, share_type, card_template, card_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    const now = new Date().toISOString()
    return db.execute(sql, [
      shareData.id || generateId(),
      shareData.user_id || '',
      shareData.baby_id || '',
      shareData.share_type || 'card',
      shareData.card_template || 'default',
      JSON.stringify(shareData.card_data || {}),
      now,
      now
    ])
  },

  /**
   * 获取用户分享记录列表
   * @param {string} userId - 用户 ID
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>}
   */
  async getShareHistory(userId, limit = 20) {
    initDb()
    if (!db) return []

    const sql = `
      SELECT * FROM ${TABLES.SHARE_RECORDS}
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `
    const result = await db.query(sql, [userId, limit])
    return result || []
  },

  /**
   * 删除分享记录
   * @param {string} shareId - 分享记录 ID
   * @returns {Promise<boolean>}
   */
  async deleteShareRecord(shareId) {
    initDb()
    if (!db) return false

    const sql = `DELETE FROM ${TABLES.SHARE_RECORDS} WHERE id = ?`
    return db.execute(sql, [shareId])
  },

  /**
   * 分享给朋友
   * @param {Object} options - 分享选项
   * @param {string} options.title - 分享标题
   * @param {string} options.desc - 分享描述
   * @param {string} options.path - 分享路径
   * @param {string} options.imageUrl - 分享图片
   * @param {Object} options.extra - 额外数据
   * @returns {Promise<boolean>}
   */
  async shareToFriend(options = {}) {
    const defaultOptions = {
      title: 'future-little-leaders',
      desc: '快来看看我的成长记录吧！',
      path: '/pages/index/index',
      imageUrl: '',
      extra: {}
    }

    const shareOptions = { ...defaultOptions, ...options }

    // #ifdef H5
    wxJssdk.shareToFriend({
      title: shareOptions.title,
      desc: shareOptions.desc,
      link: shareOptions.path,
      imgUrl: shareOptions.imageUrl,
      success: () => {
        this.onShareSuccess('friend', shareOptions.extra)
      }
    })
    // #endif

    // #ifdef MP-WEIXIN
    wxMiniProgram.shareToFriend({
      title: shareOptions.title,
      path: shareOptions.path,
      imageUrl: shareOptions.imageUrl
    })
    this.onShareSuccess('friend', shareOptions.extra)
    // #endif

    return true
  },

  /**
   * 分享到朋友圈
   * @param {Object} options - 分享选项
   * @param {string} options.title - 分享标题
   * @param {string} options.query - 查询参数
   * @param {string} options.imageUrl - 分享图片
   * @param {Object} options.extra - 额外数据
   * @returns {Promise<boolean>}
   */
  async shareToTimeline(options = {}) {
    const defaultOptions = {
      title: 'future-little-leaders',
      query: '',
      imageUrl: '',
      extra: {}
    }

    const shareOptions = { ...defaultOptions, ...options }

    // #ifdef H5
    wxJssdk.shareToTimeline({
      title: shareOptions.title,
      link: window.location.href + (shareOptions.query ? '?' + shareOptions.query : ''),
      imgUrl: shareOptions.imageUrl,
      success: () => {
        this.onShareSuccess('timeline', shareOptions.extra)
      }
    })
    // #endif

    // #ifdef MP-WEIXIN
    wxMiniProgram.shareToTimeline({
      title: shareOptions.title,
      query: shareOptions.query,
      imageUrl: shareOptions.imageUrl
    })
    this.onShareSuccess('timeline', shareOptions.extra)
    // #endif

    return true
  },

  /**
   * 分享成功回调
   * @param {string} type - 分享类型
   * @param {Object} extra - 额外数据
   */
  onShareSuccess(type, extra = {}) {
    console.log(`[wxService] Share to ${type} success`, extra)
    
    // 触发全局事件
    if (typeof uni !== 'undefined') {
      uni.$emit('wx-share-success', { type, ...extra })
    }
  },

  /**
   * 生成分享卡片数据
   * @param {Object} babyData - 宝宝数据
   * @param {Object} achievements - 成就数据
   * @param {string} template - 模板名称
   * @returns {Object}
   */
  generateCardData(babyData, achievements, template = 'default') {
    const now = new Date()
    
    return {
      id: generateId(),
      baby_id: babyData?.id || '',
      baby_name: babyData?.name || '小小领袖',
      baby_avatar: babyData?.avatar || '',
      baby_emoji: babyData?.emoji || '👶',
      achievements: achievements || [],
      achievement_count: achievements?.length || 0,
      total_points: babyData?.total_points || 0,
      level: babyData?.level || 1,
      template,
      created_at: formatDateTime(now),
      date: formatDate(now),
      time: formatDateTime(now)
    }
  },

  /**
   * 获取分享卡片模板列表
   * @returns {Array}
   */
  getCardTemplates() {
    return [
      {
        id: 'default',
        name: '默认模板',
        thumbnail: '/static/templates/card-default.png',
        primaryColor: '#8477fa',
        backgroundColor: '#f5f5f5'
      },
      {
        id: 'gradient',
        name: '渐变模板',
        thumbnail: '/static/templates/card-gradient.png',
        primaryColor: '#667eea',
        backgroundColor: '#764ba2'
      },
      {
        id: 'star',
        name: '星星模板',
        thumbnail: '/static/templates/card-star.png',
        primaryColor: '#f093fb',
        backgroundColor: '#f5576c'
      },
      {
        id: 'nature',
        name: '自然模板',
        thumbnail: '/static/templates/card-nature.png',
        primaryColor: '#38f9d7',
        backgroundColor: '#43e97b'
      }
    ]
  },

  /**
   * 初始化微信分享配置 (仅 H5)
   * @param {Object} config - JSSDK 配置
   */
  async initJSSDK(config) {
    // #ifdef H5
    await wxJssdk.init(config)
    // #endif
    
    // #ifndef H5
    console.warn('[wxService] initJSSDK is only available on H5')
    // #endif
  },

  /**
   * 检查是否支持分享到朋友圈
   * @returns {Promise<boolean>}
   */
  async checkShareTimelineSupport() {
    // #ifdef H5
    try {
      return await wxJssdk.checkJsApi('updateTimelineShareData')
    } catch {
      return false
    }
    // #endif
    
    // #ifdef MP-WEIXIN
    return true
    // #endif
    
    return false
  }
}

export default wxService
