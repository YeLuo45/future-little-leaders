/**
 * V4 同步引擎 — Delta Sync 实现
 * 参考 thunderbolt-design PowerSync 风格
 */

import { getUnsynced, markSynced, getLastSyncTimestamp } from './changeLog.js'

let timer = null

/**
 * 轻量级同步引擎
 * push 模式：本地 change log → 服务器
 * pull 模式：从服务器拉取 delta → 合并到本地
 */
class SyncEngine {
  constructor() {
    this.baseUrl = ''  // 初始化时设置
    this.enabled = false
    this.intervalMs = 30000  // 默认 30s
    this.lastSync = null
    this.syncing = false
    this.onSyncEnd = null  // 回调
    this.onError = null
  }

  /**
   * 配置同步服务端点
   * @param {string} url - 例如 https://my-worker.workers.dev
   */
  configure(url) {
    this.baseUrl = url.replace(/\/$/, '')
  }

  /**
   * 启动定时同步
   * @param {number} [intervalMs] - 轮询间隔，默认 30000ms
   */
  start(intervalMs) {
    if (timer) this.stop()
    this.enabled = true
    this.intervalMs = intervalMs || this.intervalMs
    console.log(`[V4][Sync] 启动定时同步，间隔 ${this.intervalMs}ms`)
    timer = setInterval(() => this.sync(), this.intervalMs)
    // 立即执行一次
    this.sync()
  }

  /** 停止同步 */
  stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    this.enabled = false
    console.log('[V4][Sync] 已停止')
  }

  /**
   * 执行一次完整的同步（push + pull）
   * @returns {Promise<{pushed: number, pulled: number}>}
   */
  async sync() {
    if (this.syncing) {
      console.log('[V4][Sync] 同步中，跳过')
      return { pushed: 0, pulled: 0 }
    }
    if (!this.enabled) {
      console.log('[V4][Sync] 未启用，跳过')
      return { pushed: 0, pulled: 0 }
    }
    if (!this.baseUrl) {
      console.log('[V4][Sync] 未配置 baseUrl，跳过')
      return { pushed: 0, pulled: 0 }
    }

    this.syncing = true
    let pushed = 0
    let pulled = 0

    try {
      // Step 1: push 本地变更
      pushed = await this._push()
      // Step 2: pull 远程变更
      pulled = await this._pull()
      this.lastSync = new Date().toISOString()
      console.log(`[V4][Sync] 完成: pushed=${pushed} pulled=${pulled}`)
    } catch (e) {
      console.warn('[V4][Sync] 同步异常:', e.message)
      if (this.onError) this.onError(e)
    } finally {
      this.syncing = false
      if (this.onSyncEnd) this.onSyncEnd({ pushed, pulled })
    }

    return { pushed, pulled }
  }

  /**
   * Push 本地 change log 到服务器
   */
  async _push() {
    const changes = getUnsynced()
    if (!changes.length) return 0

    console.log(`[V4][Sync] 推送 ${changes.length} 条变更`)

    try {
      const res = await fetch(`${this.baseUrl}/api/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.acknowledged && Array.isArray(data.acknowledged)) {
        markSynced(data.acknowledged)
        return data.acknowledged.length
      }
      return 0
    } catch (e) {
      // 网络失败静默忽略
      console.warn(`[V4][Sync] Push 失败（静默）: ${e.message}`)
      return 0
    }
  }

  /**
   * 从服务器拉取 delta
   */
  async _pull() {
    const since = getLastSyncTimestamp() || '1970-01-01T00:00:00.000Z'
    let pulled = 0

    try {
      const res = await fetch(`${this.baseUrl}/api/sync/pull?since=${encodeURIComponent(since)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (data.changes && Array.isArray(data.changes)) {
        pulled = data.changes.length
        for (const change of data.changes) {
          await this._applyRemoteChange(change)
        }
        console.log(`[V4][Sync] 拉取并应用 ${pulled} 条变更`)
      }
    } catch (e) {
      console.warn(`[V4][Sync] Pull 失败（静默）: ${e.message}`)
    }

    return pulled
  }

  /**
   * 应用远程变更（Last-Write-Wins）
   * @param {object} change - { table, rowId, operation, payload, timestamp }
   */
  async _applyRemoteChange(change) {
    const { table, row_id: rowId, operation, payload, timestamp } = change

    // 动态导入 sqlite helpers 避免循环
    const { queryById, insert, update, remove } = await import('../db/sqlite.js')

    try {
      if (operation === 'delete') {
        remove(table, rowId)
        return
      }

      const existing = queryById(table, rowId)

      if (operation === 'insert') {
        if (!existing) {
          insert(table, { ...payload, updatedAt: timestamp })
        } else {
          // 已存在则 LWW
          const existingTs = existing.updatedAt || ''
          if (timestamp > existingTs) {
            update(table, rowId, { ...payload, updatedAt: timestamp })
          }
        }
      } else if (operation === 'update') {
        if (!existing) {
          // update 不存在的记录 → upsert
          insert(table, { ...payload, updatedAt: timestamp })
        } else {
          const existingTs = existing.updatedAt || ''
          if (timestamp > existingTs) {
            update(table, rowId, { ...payload, updatedAt: timestamp })
          }
        }
      }
    } catch (e) {
      console.error(`[V4][Sync] 应用变更失败 ${table}/${rowId}:`, e.message)
    }
  }
}

// 单例导出
export const syncEngine = new SyncEngine()
export default syncEngine