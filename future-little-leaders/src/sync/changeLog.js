/**
 * V4 变更日志 — change_log 表写入
 * 每次数据变更记录一条 log，用于 delta sync
 */

import { insert, raw } from '../db/sqlite.js'
import { TABLES } from '../db/schema.js'

const LOG_TABLE = TABLES.change_log

/**
 * 追加变更日志
 * @param {string} table - 表名
 * @param {string} rowId - 行 ID
 * @param {string} operation - 'insert' | 'update' | 'delete'
 * @param {object} payload - 变更的数据（JSON 序列化）
 */
export function appendLog(table, rowId, operation, payload) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    table_name: table,
    row_id: rowId,
    operation,
    payload: JSON.stringify(payload),
    timestamp,
    synced: 0,
  }
  try {
    insert(LOG_TABLE, logEntry)
    console.log(`[V4][ChangeLog] ${operation} ${table}/${rowId} @ ${timestamp}`)
  } catch (e) {
    console.error('[V4][ChangeLog] 写入失败:', e.message)
  }
}

/**
 * 获取所有未同步的变更
 * @returns {object[]}
 */
export function getUnsynced() {
  const result = raw(`SELECT * FROM ${LOG_TABLE} WHERE synced = 0 ORDER BY id ASC`)
  if (!result || !result.length) return []
  return result[0].values.map(row => {
    const obj = {}
    result[0].columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    // 解析 payload
    if (obj.payload) {
      try { obj.payload = JSON.parse(obj.payload) } catch (e) { /* keep as string */ }
    }
    return obj
  })
}

/**
 * 标记指定 ID 的 log 为已同步
 * @param {number[]} ids - change_log 的主键 ID 数组
 */
export function markSynced(ids) {
  if (!ids || !ids.length) return
  const placeholders = ids.map(() => '?').join(',')
  raw(`UPDATE ${LOG_TABLE} SET synced = 1 WHERE id IN (${placeholders})`, ids)
  console.log(`[V4][ChangeLog] 标记 ${ids.length} 条已同步`)
}

/**
 * 获取上次同步时间戳（最后一条已同步记录的 timestamp）
 * @returns {string|null}
 */
export function getLastSyncTimestamp() {
  const result = raw(`SELECT timestamp FROM ${LOG_TABLE} WHERE synced = 1 ORDER BY id DESC LIMIT 1`)
  if (!result || !result.length || !result[0].values.length) return null
  return result[0].values[0][0]
}

/**
 * 清除指定时间点之前的已同步旧日志（定期清理）
 * @param {string} beforeTs - ISO 时间戳
 */
export function pruneSyncedBefore(beforeTs) {
  raw(`DELETE FROM ${LOG_TABLE} WHERE synced = 1 AND timestamp < ?`, [beforeTs])
}

/**
 * 变更计数器（用于调试和指标）
 */
export function getStats() {
  const result = raw(`
    SELECT synced, COUNT(*) as count
    FROM ${LOG_TABLE}
    GROUP BY synced
  `)
  if (!result || !result.length) return { synced: 0, unsynced: 0 }
  const stats = { synced: 0, unsynced: 0 }
  result[0].values.forEach(([synced, count]) => {
    if (synced === 1) stats.synced = count
    else stats.unsynced = count
  })
  return stats
}