/**
 * V4 Sync API Module
 * API封装 for sync operations
 */

// Mock API base URL - in production this would be a real server
const API_BASE = '/api/sync'

/**
 * Push local changes to server
 * @param {array} changes - Array of change log entries
 * @returns {Promise<{success: boolean, syncedIds?: array, error?: string}>}
 */
export async function pushChanges(changes) {
  try {
    const response = await fetch(`${API_BASE}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ changes }),
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('[V4] Push successful:', data)
    return { success: true, syncedIds: data.syncedIds || [] }
  } catch (e) {
    // Network failure - silent ignore per spec
    console.log('[V4] Push failed (will retry):', e.message)
    return { success: false, error: e.message }
  }
}

/**
 * Pull changes from server since a timestamp
 * @param {string} since - ISO timestamp to pull changes since
 * @returns {Promise<{success: boolean, changes?: array, serverTs?: string, error?: string}>}
 */
export async function pullChanges(since) {
  try {
    const response = await fetch(`${API_BASE}/pull?since=${encodeURIComponent(since)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('[V4] Pull successful:', data)
    return { 
      success: true, 
      changes: data.changes || [],
      serverTs: data.serverTs || new Date().toISOString()
    }
  } catch (e) {
    // Network failure - silent ignore per spec
    console.log('[V4] Pull failed (will retry):', e.message)
    return { success: false, error: e.message }
  }
}

/**
 * Full sync - push local and pull remote simultaneously
 * Used when connection is first established
 * @param {array} changes - Array of change log entries
 * @param {string} since - ISO timestamp
 * @returns {Promise<{success: boolean, pushed?: object, pulled?: object}>}
 */
export async function fullSync(changes, since) {
  try {
    const response = await fetch(`${API_BASE}/full`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ changes, since }),
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('[V4] Full sync successful:', data)
    return { 
      success: true, 
      pushed: data.pushed || { syncedIds: [] },
      pulled: data.pulled || { changes: [], serverTs: new Date().toISOString() }
    }
  } catch (e) {
    console.log('[V4] Full sync failed (will retry):', e.message)
    return { success: false, error: e.message }
  }
}