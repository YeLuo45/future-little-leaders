/**
 * Conflict Resolver - 数据同步冲突解决策略
 */

/**
 * Last-Write-Wins 策略：比较 updatedAt 时间戳，保留较新的版本
 * @param {object} local - 本地版本
 * @param {object} remote - 远程版本
 * @returns {object} 胜出的版本
 */
export function resolveConflictLWW(local, remote) {
  const localTime = new Date(local.updatedAt || 0).getTime()
  const remoteTime = new Date(remote.updatedAt || 0).getTime()
  return localTime >= remoteTime ? local : remote
}

/**
 * 字段级合并：遍历冲突字段，保留两边的最新值
 * @param {object} local - 本地版本
 * @param {object} remote - 远程版本
 * @param {string[]} conflictFields - 冲突字段列表
 * @returns {object} 合并后的版本
 */
export function resolveConflictMerge(local, remote, conflictFields) {
  const result = { ...remote }

  for (const field of conflictFields) {
    const localFieldTime = new Date(local[`${field}UpdatedAt`] || local.updatedAt || 0).getTime()
    const remoteFieldTime = new Date(remote[`${field}UpdatedAt`] || remote.updatedAt || 0).getTime()
    if (localFieldTime > remoteFieldTime) {
      result[field] = local[field]
    }
  }

  result.updatedAt = new Date().toISOString()
  return result
}

/**
 * 统一入口：根据策略解决冲突
 * @param {object} local - 本地版本
 * @param {object} remote - 远程版本
 * @param {string} strategy - 'lww' | 'merge' | 'local' | 'remote'
 * @param {string[]} conflictFields - merge 策略时需要
 * @returns {object} 解决后的版本
 */
export function resolveConflict(local, remote, strategy = 'lww', conflictFields = []) {
  switch (strategy) {
    case 'lww':
      return resolveConflictLWW(local, remote)
    case 'merge':
      return resolveConflictMerge(local, remote, conflictFields)
    case 'local':
      return local
    case 'remote':
      return remote
    default:
      return resolveConflictLWW(local, remote)
  }
}

/**
 * 批量解决冲突（用于同步引擎）
 * @param {Array} conflicts - [{local, remote, entityType, entityId}]
 * @param {string} defaultStrategy - 默认策略
 * @returns {Array} 解决结果 [{entityType, entityId, resolution}]
 */
export function resolveBatchConflicts(conflicts, defaultStrategy = 'lww') {
  return conflicts.map(({ local, remote, entityType, entityId }) => {
    const winner = resolveConflict(local, remote, defaultStrategy)
    return { entityType, entityId, resolution: winner }
  })
}