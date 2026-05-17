/**
 * V4 Change Log Module
 * Records all write operations for sync
 */

import { raw } from '../db/sqlite.js'
import { TABLES } from '../db/schema.js'

/**
 * Append a change log entry
 * @param {string} table - Table name
 * @param {string} rowId - Row ID that was changed
 * @param {string} operation - 'insert', 'update', or 'delete'
 * @param {object} payload - The data that was changed
 */
export function appendLog(table, rowId, operation, payload) {
  const timestamp = new Date().toISOString()
  
  raw(
    `INSERT INTO ${TABLES.CHANGE_LOG} (tableName, rowId, operation, payload, timestamp, synced) VALUES (?, ?, ?, ?, ?, 0)`,
    [table, rowId, operation, JSON.stringify(payload), timestamp]
  )
  
  console.log(`[V4] Change logged: ${operation} on ${table}/${rowId}`)
}

/**
 * Get all unsynced change logs
 * @returns {array} - Array of unsynced change log entries
 */
export function getUnsynced() {
  const results = raw(
    `SELECT * FROM ${TABLES.CHANGE_LOG} WHERE synced = 0 ORDER BY timestamp ASC`
  )
  return results || []
}

/**
 * Mark change logs as synced
 * @param {array} ids - Array of change log IDs to mark as synced
 */
export function markSynced(ids) {
  if (!ids || !ids.length) return
  
  const placeholders = ids.map(() => '?').join(',')
  raw(
    `UPDATE ${TABLES.CHANGE_LOG} SET synced = 1 WHERE id IN (${placeholders})`,
    ids
  )
  
  console.log(`[V4] Marked ${ids.length} changes as synced`)
}

/**
 * Clear synced change logs older than a certain date
 * @param {string} beforeDate - ISO date string
 */
export function clearOldSyncedLogs(beforeDate) {
  raw(
    `DELETE FROM ${TABLES.CHANGE_LOG} WHERE synced = 1 AND timestamp < ?`,
    [beforeDate]
  )
  console.log(`[V4] Cleared old synced logs before ${beforeDate}`)
}

/**
 * Get count of unsynced changes
 * @returns {number}
 */
export function getUnsyncedCount() {
  const results = raw(`SELECT COUNT(*) as count FROM ${TABLES.CHANGE_LOG} WHERE synced = 0`)
  return results && results[0] ? results[0].count : 0
}