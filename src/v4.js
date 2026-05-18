/**
 * V4 Offline Sync Entry Point
 * 初始化离线优先 + 多设备同步系统
 */
import { initDatabase } from '@/db/sqlite.js'
import { initCrypto } from '@/crypto/cryptoManager.js'
import { initSyncEngine } from '@/sync/engine.js'

let initialized = false

/**
 * Initialize V4 offline sync system
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function initV4() {
  if (initialized) {
    return { success: true, cached: true }
  }

  try {
    // Step 1: Initialize SQLite database
    await initDatabase()

    // Step 2: Initialize encryption
    await initCrypto()

    // Step 3: Initialize sync engine
    await initSyncEngine()

    initialized = true
    return { success: true }
  } catch (err) {
    console.error('[V4] Init failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Export V4 data for backup/transfer
 * @returns {Promise<object>}
 */
export async function exportV4Data() {
  const { exportDatabase } = await import('@/db/sqlite.js')
  return exportDatabase()
}

/**
 * Trigger manual sync
 * @returns {Promise<void>}
 */
export async function triggerSync() {
  const { syncEngine } = await import('@/sync/engine.js')
  return syncEngine.syncNow()
}

export { syncEngine } from '@/sync/engine.js'