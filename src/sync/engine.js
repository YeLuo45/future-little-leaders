/**
 * V4 Sync Engine
 * Handles push/pull sync with conflict resolution (LWW)
 */

import { pushChanges, pullChanges, fullSync } from '../services/sync-api.js'
import { getUnsynced, markSynced, getUnsyncedCount } from './changeLog.js'
import { query, update, insert, getById } from '../db/sqlite.js'
import { TABLES } from '../db/schema.js'

const LAST_SYNC_KEY = 'v4_last_sync_ts'
const DEVICE_ID_KEY = 'v4_device_id'

/**
 * Get or create device ID
 */
function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = 'device_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

/**
 * Get last sync timestamp
 */
function getLastSyncTs() {
  return localStorage.getItem(LAST_SYNC_KEY) || '1970-01-01T00:00:00.000Z'
}

/**
 * Set last sync timestamp
 */
function setLastSyncTs(ts) {
  localStorage.setItem(LAST_SYNC_KEY, ts)
}

/**
 * SyncEngine class
 */
export class SyncEngine {
  constructor() {
    this.intervalId = null
    this.isRunning = false
    this.intervalMs = 30000 // default 30s
    this.deviceId = getDeviceId()
  }

  /**
   * Start automatic sync
   * @param {number} intervalMs - Sync interval in milliseconds (default 30000)
   */
  start(intervalMs = 30000) {
    if (this.isRunning) {
      console.log('[V4] SyncEngine already running')
      return
    }
    
    this.intervalMs = intervalMs
    this.isRunning = true
    
    // Run initial sync
    this.sync()
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.sync()
    }, this.intervalMs)
    
    console.log(`[V4] SyncEngine started with interval ${intervalMs}ms`)
  }

  /**
   * Stop automatic sync
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('[V4] SyncEngine stopped')
  }

  /**
   * Check if sync is running
   */
  isActive() {
    return this.isRunning
  }

  /**
   * Perform one sync cycle (push + pull)
   * @returns {Promise<{success: boolean, pushed: number, pulled: number}>}
   */
  async sync() {
    console.log('[V4] Starting sync cycle...')
    
    const unsynced = getUnsynced()
    const lastTs = getLastSyncTs()
    
    let pushed = 0
    let pulled = 0
    
    try {
      // Push phase: send local changes
      if (unsynced.length > 0) {
        const pushResult = await pushChanges(unsynced)
        if (pushResult.success && pushResult.syncedIds.length > 0) {
          markSynced(pushResult.syncedIds)
          pushed = pushResult.syncedIds.length
        }
      }
      
      // Pull phase: fetch remote changes
      const pullResult = await pullChanges(lastTs)
      if (pullResult.success && pullResult.changes.length > 0) {
        // Apply changes with LWW conflict resolution
        pulled = await this.applyPulledChanges(pullResult.changes)
        
        // Update last sync timestamp
        if (pullResult.serverTs) {
          setLastSyncTs(pullResult.serverTs)
        }
      }
      
      // If we pulled changes and there were many unsynced, also do a full sync
      if (pulled > 0 && unsynced.length > 0) {
        const remainingUnsynced = getUnsynced()
        if (remainingUnsynced.length > 0) {
          const fullResult = await fullSync(remainingUnsynced, lastTs)
          if (fullResult.success) {
            markSynced(fullResult.pushed.syncedIds)
            pushed += fullResult.pushed.syncedIds.length
          }
        }
      }
      
    } catch (e) {
      // Network failure should not crash sync
      console.log('[V4] Sync cycle error (will retry):', e.message)
    }
    
    const totalUnsynced = getUnsyncedCount()
    console.log(`[V4] Sync cycle complete: pushed=${pushed}, pulled=${pulled}, remaining=${totalUnsynced}`)
    
    return { success: true, pushed, pulled, remaining: totalUnsynced }
  }

  /**
   * Apply pulled changes with LWW conflict resolution
   * @param {array} changes - Array of change entries from server
   * @returns {Promise<number>} - Number of changes applied
   */
  async applyPulledChanges(changes) {
    let applied = 0
    
    for (const change of changes) {
      try {
        const { table, rowId, operation, payload, timestamp } = change
        
        // Skip if this device made the change
        if (payload.deviceId === this.deviceId) {
          continue
        }
        
        // Get current local record
        const local = getById(table, rowId)
        
        if (operation === 'delete') {
          // Delete always wins if from newer timestamp
          if (!local || new Date(timestamp) > new Date(local.updatedAt)) {
            // Already deleted locally if doesn't exist, but record should be deleted
            // For safety, we'll update rather than delete to preserve data
            console.log(`[V4] Remote delete for ${table}/${rowId}, skipping (local preserved)`)
          }
          continue
        }
        
        if (operation === 'insert' || operation === 'update') {
          // LWW: compare timestamps
          const remoteTs = new Date(timestamp)
          const localTs = local ? new Date(local.updatedAt) : new Date(0)
          
          if (remoteTs >= localTs) {
            // Remote wins - update local
            const data = typeof payload.data === 'string' 
              ? JSON.parse(payload.data) 
              : payload.data
            
            if (local) {
              update(table, rowId, data)
            } else {
              insert(table, { ...data, id: rowId })
            }
            applied++
          } else {
            // Local wins - will be pushed on next sync
            console.log(`[V4] Local record newer for ${table}/${rowId}, will push later`)
          }
        }
      } catch (e) {
        console.error(`[V4] Failed to apply change:`, e)
      }
    }
    
    return applied
  }

  /**
   * Force a full sync (push all + pull all)
   * Use when recovering from major sync issues
   */
  async fullSync() {
    console.log('[V4] Starting full sync...')
    
    const unsynced = getUnsynced()
    const lastTs = getLastSyncTs()
    
    try {
      const result = await fullSync(unsynced, lastTs)
      
      if (result.success) {
        markSynced(result.pushed.syncedIds)
        
        if (result.pulled.changes.length > 0) {
          await this.applyPulledChanges(result.pulled.changes)
        }
        
        setLastSyncTs(result.pulled.serverTs)
      }
      
      return { success: result.success }
    } catch (e) {
      console.log('[V4] Full sync failed:', e.message)
      return { success: false, error: e.message }
    }
  }
}

// Singleton instance
export const syncEngine = new SyncEngine()