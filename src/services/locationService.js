/**
 * 地理位置服务
 * 提供获取位置、附近孩子发现等功能
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
 * 计算两点之间的距离（基于 Haversine 公式）
 * @param {number} lat1 - 纬度1
 * @param {number} lon1 - 经度1
 * @param {number} lat2 - 纬度2
 * @param {number} lon2 - 经度2
 * @returns {number} - 距离（米）
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 格式化距离
 * @param {number} meters - 距离（米）
 * @returns {string}
 */
const formatDistance = (meters) => {
  if (meters < 1000) {
    return Math.round(meters) + 'm'
  } else {
    return (meters / 1000).toFixed(1) + 'km'
  }
}

/**
 * 生成唯一 ID
 * @returns {string}
 */
const generateId = () => {
  return 'loc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

export const locationService = {
  /**
   * 当前位置
   */
  currentLocation: null,

  /**
   * 初始化位置服务
   */
  async init() {
    initDb()
    await this.createLocationTable()
  },

  /**
   * 创建位置记录表
   * @returns {boolean}
   */
  async createLocationTable() {
    initDb()
    if (!db) return false

    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLES.LOCATION_RECORDS} (
        id TEXT PRIMARY KEY,
        baby_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        altitude REAL,
        speed REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
    return db.execute(sql)
  },

  /**
   * 请求获取当前位置
   * @param {Object} options - 选项
   * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
   */
  async getLocation(options = {}) {
    const defaultOptions = {
      type: 'gcj02',
      geocode: false
    }

    const requestOptions = { ...defaultOptions, ...options }

    // #ifdef H5
    try {
      const location = await wxJssdk.getLocation()
      this.currentLocation = location
      return location
    } catch (err) {
      console.error('[locationService] H5 getLocation failed:', err)
      throw err
    }
    // #endif

    // #ifdef MP-WEIXIN
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: requestOptions.type,
        success: (res) => {
          const location = {
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy,
            altitude: res.altitude,
            speed: res.speed
          }
          this.currentLocation = location
          resolve(location)
        },
        fail: (err) => {
          console.error('[locationService] MP-WEIXIN getLocation failed:', err)
          reject(err)
        }
      })
    })
    // #endif

    // #ifndef H5 && !MP-WEIXIN
    // Mock 模式
    const mockLocation = {
      latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
      longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
      accuracy: 100
    }
    this.currentLocation = mockLocation
    return mockLocation
    // #endif
  },

  /**
   * 检查位置权限
   * @returns {Promise<boolean>}
   */
  async checkLocationPermission() {
    // #ifdef MP-WEIXIN
    return new Promise((resolve) => {
      uni.getSetting({
        success: (res) => {
          const isAuthorized = res.authSetting['scope.userLocation'] === true
          resolve(isAuthorized)
        },
        fail: () => resolve(false)
      })
    })
    // #endif

    // #ifdef H5
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
          resolve(result.state === 'granted')
        }).catch(() => resolve(false))
      } else {
        resolve(false)
      }
    })
    // #endif

    return false
  },

  /**
   * 请求位置权限
   * @returns {Promise<boolean>}
   */
  async requestLocationPermission() {
    // #ifdef MP-WEIXIN
    return new Promise((resolve) => {
      uni.authorize({
        scope: 'scope.userLocation',
        success: () => resolve(true),
        fail: () => resolve(false)
      })
    })
    // #endif

    // #ifdef H5
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { enableHighAccuracy: true }
        )
      } else {
        resolve(false)
      }
    })
    // #endif

    return false
  },

  /**
   * 保存用户位置
   * @param {string} babyId - 宝宝 ID
   * @param {Object} location - 位置信息
   * @returns {Promise<boolean>}
   */
  async saveLocation(babyId, location) {
    initDb()
    if (!db) return false

    const now = new Date().toISOString()
    const sql = `
      INSERT INTO ${TABLES.LOCATION_RECORDS} (id, baby_id, latitude, longitude, accuracy, altitude, speed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    return db.execute(sql, [
      generateId(),
      babyId,
      location.latitude,
      location.longitude,
      location.accuracy || null,
      location.altitude || null,
      location.speed || null,
      now,
      now
    ])
  },

  /**
   * 获取用户位置历史
   * @param {string} babyId - 宝宝 ID
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>}
   */
  async getLocationHistory(babyId, limit = 10) {
    initDb()
    if (!db) return []

    const sql = `
      SELECT * FROM ${TABLES.LOCATION_RECORDS}
      WHERE baby_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `
    const result = await db.query(sql, [babyId, limit])
    return result || []
  },

  /**
   * 获取附近的孩子列表
   * @param {Object} options - 选项
   * @param {number} options.radius - 搜索半径（米），默认 5000
   * @param {number} options.limit - 返回数量限制，默认 50
   * @returns {Promise<Array>}
   */
  async getNearbyKids(options = {}) {
    const defaultOptions = {
      radius: 5000,
      limit: 50
    }

    const searchOptions = { ...defaultOptions, ...options }

    // 首先获取当前位置
    let currentLoc
    try {
      currentLoc = await this.getLocation()
    } catch (err) {
      console.error('[locationService] Failed to get current location:', err)
      throw new Error('无法获取当前位置')
    }

    // 从数据库获取所有已保存的位置记录
    initDb()
    if (!db) {
      // Mock 数据
      return this.getMockNearbyKids(currentLoc, searchOptions.radius)
    }

    const sql = `SELECT * FROM ${TABLES.LOCATION_RECORDS} ORDER BY created_at DESC`
    const allLocations = await db.query(sql)

    if (!allLocations || allLocations.length === 0) {
      return this.getMockNearbyKids(currentLoc, searchOptions.radius)
    }

    // 计算每个位置与当前的距离
    const nearbyKids = []
    const seenBabyIds = new Set()

    for (const loc of allLocations) {
      if (seenBabyIds.has(loc.baby_id)) continue

      const distance = calculateDistance(
        currentLoc.latitude,
        currentLoc.longitude,
        loc.latitude,
        loc.longitude
      )

      if (distance <= searchOptions.radius) {
        nearbyKids.push({
          id: loc.baby_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance,
          formattedDistance: formatDistance(distance),
          lastSeen: loc.created_at
        })
        seenBabyIds.add(loc.baby_id)
      }
    }

    // 按距离排序
    nearbyKids.sort((a, b) => a.distance - b.distance)

    // 限制返回数量
    return nearbyKids.slice(0, searchOptions.limit)
  },

  /**
   * 获取 Mock 附近孩子数据
   * @param {Object} currentLoc - 当前位置
   * @param {number} radius - 搜索半径
   * @returns {Array}
   */
  getMockNearbyKids(currentLoc, radius) {
    // 生成一些随机位置作为 Mock 数据
    const mockKids = [
      { id: 'mock_1', name: '小明', emoji: '👦', age: 8 },
      { id: 'mock_2', name: '小红', emoji: '👧', age: 7 },
      { id: 'mock_3', name: '小华', emoji: '🧒', age: 9 },
      { id: 'mock_4', name: '小丽', emoji: '👧', age: 6 },
      { id: 'mock_5', name: '小强', emoji: '👦', age: 8 }
    ]

    const now = new Date()
    return mockKids.map((kid, index) => {
      // 随机生成附近的位置
      const angle = (index / mockKids.length) * 2 * Math.PI
      const distance = Math.random() * radius * 0.8 + radius * 0.1
      
      // 简单的偏移计算
      const latOffset = (distance / 111000) * Math.cos(angle)
      const lonOffset = (distance / (111000 * Math.cos(currentLoc.latitude * Math.PI / 180))) * Math.sin(angle)

      return {
        ...kid,
        latitude: currentLoc.latitude + latOffset,
        longitude: currentLoc.longitude + lonOffset,
        distance,
        formattedDistance: formatDistance(distance),
        lastSeen: new Date(now.getTime() - Math.random() * 3600000 * 24).toISOString()
      }
    }).sort((a, b) => a.distance - b.distance)
  },

  /**
   * 获取两个位置之间的距离
   * @param {Object} loc1 - 位置1
   * @param {Object} loc2 - 位置2
   * @returns {number} - 距离（米）
   */
  getDistance(loc1, loc2) {
    return calculateDistance(
      loc1.latitude,
      loc1.longitude,
      loc2.latitude,
      loc2.longitude
    )
  },

  /**
   * 格式化距离
   * @param {number} meters - 距离（米）
   * @returns {string}
   */
  formatDistance(meters) {
    return formatDistance(meters)
  },

  /**
   * 打开位置地图
   * @param {Object} location - 位置信息
   */
  openLocation(location) {
    const defaultLocation = {
      latitude: 39.9042,
      longitude: 116.4074,
      name: '位置',
      address: ''
    }

    const loc = { ...defaultLocation, ...location }

    // #ifdef H5
    wxJssdk.openLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      name: loc.name,
      address: loc.address,
      scale: 15
    })
    // #endif

    // #ifdef MP-WEIXIN
    wxMiniProgram.openLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      name: loc.name,
      address: loc.address,
      scale: 15
    })
    // #endif

    // #ifndef H5 && !MP-WEIXIN
    console.warn('[locationService] openLocation not supported')
    // #endif
  },

  /**
   * 选择图片（用于头像等）
   * @param {number} count - 选择数量
   * @returns {Promise<string[]>}
   */
  async chooseImage(count = 1) {
    // #ifdef H5
    return wxJssdk.chooseImage(count)
    // #endif

    // #ifdef MP-WEIXIN
    return wxMiniProgram.chooseImage(count)
    // #endif

    // #ifndef H5 && !MP-WEIXIN
    return []
    // #endif
  },

  /**
   * 预览图片
   * @param {string[]} urls - 图片 URL 数组
   * @param {number} current - 当前索引
   */
  previewImage(urls, current = 0) {
    // #ifdef H5
    wxJssdk.previewImage(urls, current)
    // #endif

    // #ifdef MP-WEIXIN
    wxMiniProgram.previewImage(urls, current)
    // #endif
  }
}

export default locationService
