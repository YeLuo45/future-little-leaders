/**
 * V4 离线优先 — 统一初始化入口
 * main.js 最早调用此模块启动整个离线数据层
 */

import { initDatabase, queryAll, exportDatabase } from './db/sqlite.js'
import { migrate, needsMigration, clearLegacyData } from './db/migrate.js'
import { syncEngine } from './sync/engine.js'

let initialized = false

/**
 * 初始化 V4 数据层
 * @param {object} options
 * @param {string} [options.syncUrl] - 同步服务端 URL
 * @param {number} [options.syncInterval] - 同步间隔 ms，默认 30000
 * @param {boolean} [options.encrypted] - 是否启用加密（默认 false）
 * @returns {Promise<void>}
 */
export async function initV4(options = {}) {
  if (initialized) {
    console.log('[V4] 已初始化，跳过')
    return
  }

  console.log('[V4] 启动离线数据层...')

  // Step 1: 初始化 SQLite
  await initDatabase()

  // Step 2: 检测并执行迁移
  if (needsMigration(queryAll)) {
    migrate()
    // 迁移后等待一下确保数据落盘
    await new Promise(r => setTimeout(r, 100))
    // 清除旧 localStorage 数据
    clearLegacyData()
  }

  // Step 3: 启动同步引擎（如果配置了 URL）
  if (options.syncUrl) {
    syncEngine.configure(options.syncUrl)
    if (options.syncInterval) {
      syncEngine.start(options.syncInterval)
    } else {
      syncEngine.start(30000)  // 默认 30s
    }
    console.log(`[V4] 同步引擎已启动: ${options.syncUrl}`)
  } else {
    console.log('[V4] 未配置 syncUrl，离线模式运行')
  }

  initialized = true
  console.log('[V4] 离线数据层初始化完成')
}

/**
 * 导出当前数据库（用于持久化到 IndexedDB）
 * @returns {Uint8Array|null}
 */
export function exportV4Data() {
  return exportDatabase()
}

/**
 * 停止同步引擎
 */
export function stopSync() {
  syncEngine.stop()
}

/**
 * 手动触发一次同步
 * @returns {Promise<{pushed: number, pulled: number}>}
 */
export async function triggerSync() {
  return syncEngine.sync()
}

/**
 * 检查初始化状态
 */
export function isV4Initialized() {
  return initialized
}

export default {
  initV4,
  exportV4Data,
  stopSync,
  triggerSync,
  isV4Initialized,
}