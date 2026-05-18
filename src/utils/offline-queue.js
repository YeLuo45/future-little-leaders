/**
 * Offline Queue - 离线操作队列
 * V24 Offline-First PWA - 无网络也能用
 */

const QUEUE_KEY = 'offline_change_log';
const MAX_QUEUE_SIZE = 100;

/**
 * 生成唯一 ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取队列
 */
export function getQueue() {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[OfflineQueue] 读取队列失败:', e);
    return [];
  }
}

/**
 * 保存队列
 */
function saveQueue(queue) {
  try {
    // 限制队列大小
    if (queue.length > MAX_QUEUE_SIZE) {
      queue = queue.slice(-MAX_QUEUE_SIZE);
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (e) {
    console.error('[OfflineQueue] 保存队列失败:', e);
    return false;
  }
}

/**
 * 添加操作到队列
 * @param {string} type - 操作类型: 'task' | 'checkin' | 'points' | 'achievement'
 * @param {string} action - 操作动作: 'create' | 'update' | 'delete'
 * @param {object} data - 操作数据
 */
export function enqueue(type, action, data) {
  const queue = getQueue();
  const item = {
    id: generateId(),
    type,
    action,
    data,
    timestamp: Date.now(),
    status: 'pending' // pending | syncing | synced | failed
  };

  queue.push(item);
  
  if (saveQueue(queue)) {
    console.log(`[OfflineQueue] 入队: ${type}/${action}`, item.id);
    return item.id;
  }
  return null;
}

/**
 * 从队列中移除项目
 * @param {string} id - 项目 ID
 */
export function dequeue(id) {
  const queue = getQueue();
  const filtered = queue.filter(item => item.id !== id);
  return saveQueue(filtered);
}

/**
 * 获取所有待同步项目
 */
export function getPendingItems() {
  return getQueue().filter(item => item.status === 'pending');
}

/**
 * 获取队列大小
 */
export function getQueueSize() {
  return getQueue().length;
}

/**
 * 清空队列
 */
export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
  console.log('[OfflineQueue] 队列已清空');
}

/**
 * 更新项目状态
 * @param {string} id - 项目 ID
 * @param {string} status - 新状态
 */
export function updateItemStatus(id, status) {
  const queue = getQueue();
  const item = queue.find(i => i.id === id);
  if (item) {
    item.status = status;
    item.syncTime = status === 'synced' ? Date.now() : undefined;
    saveQueue(queue);
  }
}

/**
 * 标记所有项目为已同步
 */
export function markAllSynced() {
  const queue = getQueue();
  queue.forEach(item => {
    if (item.status === 'pending' || item.status === 'syncing') {
      item.status = 'synced';
      item.syncTime = Date.now();
    }
  });
  saveQueue(queue);
}

/**
 * 获取变更日志摘要
 */
export function getQueueSummary() {
  const queue = getQueue();
  const pending = queue.filter(i => i.status === 'pending');
  
  const summary = {
    total: queue.length,
    pending: pending.length,
    byType: {},
    oldestTimestamp: null,
    newestTimestamp: null
  };

  pending.forEach(item => {
    const key = `${item.type}/${item.action}`;
    summary.byType[key] = (summary.byType[key] || 0) + 1;
    
    if (!summary.oldestTimestamp || item.timestamp < summary.oldestTimestamp) {
      summary.oldestTimestamp = item.timestamp;
    }
    if (!summary.newestTimestamp || item.timestamp > summary.newestTimestamp) {
      summary.newestTimestamp = item.timestamp;
    }
  });

  return summary;
}

/**
 * 检查是否需要网络恢复后同步
 */
export function needsSync() {
  return getPendingItems().length > 0;
}

/**
 * 网络状态变化监听
 */
export function listenNetworkStatus(callback) {
  const handler = () => {
    const isOnline = navigator.onLine;
    console.log(`[OfflineQueue] 网络状态: ${isOnline ? '在线' : '离线'}`);
    callback(isOnline);
  };

  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);

  // 返回取消监听函数
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}

/**
 * 执行同步（需要配合后端 API）
 * @param {function} syncFn - 同步函数，接收一个 item，返回 Promise
 */
export async function processQueue(syncFn) {
  const queue = getQueue();
  const pending = queue.filter(item => item.status === 'pending');
  
  if (pending.length === 0) {
    console.log('[OfflineQueue] 无待同步项');
    return { success: 0, failed: 0 };
  }

  console.log(`[OfflineQueue] 开始处理 ${pending.length} 个待同步项`);

  let success = 0;
  let failed = 0;

  for (const item of pending) {
    item.status = 'syncing';
    saveQueue(queue);

    try {
      await syncFn(item);
      item.status = 'synced';
      item.syncTime = Date.now();
      success++;
      console.log(`[OfflineQueue] 同步成功: ${item.id}`);
    } catch (e) {
      item.status = 'failed';
      item.error = e.message;
      failed++;
      console.error(`[OfflineQueue] 同步失败: ${item.id}`, e);
    }

    saveQueue(queue);
  }

  return { success, failed };
}

export default {
  enqueue,
  dequeue,
  getPendingItems,
  getQueueSize,
  clearQueue,
  updateItemStatus,
  markAllSynced,
  getQueueSummary,
  needsSync,
  listenNetworkStatus,
  processQueue
};
