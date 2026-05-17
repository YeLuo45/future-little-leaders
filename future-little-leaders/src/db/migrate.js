/**
 * V4 数据迁移 — localStorage → SQLite
 * 启动时检测旧数据并迁移
 */

import { LEGACY_KEYS } from './schema.js'
import { insert } from './sqlite.js'

const LEGACY_POINTS_KEY = 'points'
const LEGACY_ACHIEVEMENTS_KEY = 'achievements'

/**
 * 从 localStorage 读取并解析 JSON
 */
function loadFromLS(key) {
  try {
    const raw = uni.getStorageSync(key)
    if (!raw) return null
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (e) {
    console.warn(`[V4][Migrate] 读取 ${key} 失败:`, e)
    return null
  }
}

/**
 * 迁移单张表的数据
 */
function migrateTable(tableName, legacyKey) {
  const data = loadFromLS(legacyKey)
  if (!data || !data.length) {
    console.log(`[V4][Migrate] ${tableName}: 无数据，跳过`)
    return 0
  }

  let count = 0
  for (const row of data) {
    // 确保每条记录有 updatedAt
    if (!row.updatedAt) {
      row.updatedAt = row.createdAt || new Date().toISOString()
    }
    try {
      insert(tableName, row)
      count++
    } catch (e) {
      console.warn(`[V4][Migrate] 插入 ${tableName} 失败:`, e.message)
    }
  }
  console.log(`[V4][Migrate] ${tableName}: 迁移 ${count} 条`)
  return count
}

/**
 * 执行完整迁移
 * @returns {object} 迁移统计
 */
export function migrate() {
  console.log('[V4][Migrate] 开始迁移 localStorage → SQLite...')

  const stats = {}

  // 迁移各表
  for (const [tableName, legacyKey] of Object.entries(LEGACY_KEYS)) {
    stats[tableName] = migrateTable(tableName, legacyKey)
  }

  // points（可能存储结构不同，尝试兼容）
  const pointsData = loadFromLS(LEGACY_POINTS_KEY)
  if (pointsData && pointsData.length) {
    // points 可能是 { babyId: total } 格式，需要转换
    const db = require('./sqlite.js').getDb()
    // 保持向后兼容逻辑
    console.log('[V4][Migrate] points: 格式待确认，跳过自动迁移')
  }

  // achievements
  const achData = loadFromLS(LEGACY_ACHIEVEMENTS_KEY)
  if (achData && achData.length) {
    console.log(`[V4][Migrate] achievements: ${achData.length} 条`)
  }

  console.log('[V4][Migrate] 迁移完成:', stats)
  return stats
}

/**
 * 检查是否需要迁移（存在旧数据且 SQLite 为空）
 * @param {Function} queryAll - 查询函数
 */
export function needsMigration(queryAll) {
  // 如果 SQLite 中已有数据，说明已完成迁移
  const existing = queryAll('family_members')
  if (existing && existing.length > 0) {
    console.log('[V4][Migrate] SQLite 已存在数据，跳过迁移')
    return false
  }

  // 检查 localStorage 是否有旧数据
  for (const key of Object.values(LEGACY_KEYS)) {
    const raw = uni.getStorageSync(key)
    if (raw) {
      console.log(`[V4][Migrate] 检测到 localStorage 旧数据: ${key}`)
      return true
    }
  }
  return false
}

/**
 * 迁移完成后清除 localStorage 旧数据
 */
export function clearLegacyData() {
  console.log('[V4][Migrate] 清除 localStorage 旧数据...')
  for (const key of Object.values(LEGACY_KEYS)) {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.warn(`[V4][Migrate] 清除 ${key} 失败:`, e)
    }
  }
  // 额外清除可能存在的键
  const extraKeys = [LEGACY_POINTS_KEY, LEGACY_ACHIEVEMENTS_KEY, 'currentBabyId', 'family_invite_codes']
  for (const k of extraKeys) {
    try {
      uni.removeStorageSync(k)
    } catch (e) { /* ignore */ }
  }
  console.log('[V4][Migrate] localStorage 清理完成')
}