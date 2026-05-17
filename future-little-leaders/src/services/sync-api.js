/**
 * V4 同步 API 封装
 * 网络失败静默处理，不阻塞 UI
 */

const DEFAULT_BASE_URL = 'https://placeholder.workers.dev'  // 部署后替换

let baseUrl = DEFAULT_BASE_URL

/**
 * 配置 API 地址
 */
export function configure(url) {
  baseUrl = url.replace(/\/$/, '')
}

/**
 * Push 本地变更到服务器
 * @param {object[]} changes - change_log 条目
 * @returns {Promise<{acknowledged: number[]}|null>}
 */
export async function pushChanges(changes) {
  try {
    const res = await fetch(`${baseUrl}/api/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn(`[V4][API] pushChanges 失败（静默）: ${e.message}`)
    return null
  }
}

/**
 * 从服务器拉取 delta
 * @param {string} since - 上次同步时间戳 ISO
 * @returns {Promise<{changes: object[]}|null>}
 */
export async function pullChanges(since) {
  try {
    const res = await fetch(`${baseUrl}/api/sync/pull?since=${encodeURIComponent(since)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn(`[V4][API] pullChanges 失败（静默）: ${e.message}`)
    return null
  }
}

/**
 * 全量下载（首次同步用）
 * @returns {Promise<object[]|null>}
 */
export async function fetchFull() {
  try {
    const res = await fetch(`${baseUrl}/api/sync/full`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn(`[V4][API] fetchFull 失败（静默）: ${e.message}`)
    return null
  }
}

export default { configure, pushChanges, pullChanges, fetchFull }