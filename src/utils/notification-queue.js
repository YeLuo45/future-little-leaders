/**
 * Notification Queue - 离线推送通知队列
 * V24 Offline-First PWA - 网络恢复后自动发送
 */

const QUEUE_KEY = 'notification_queue';
const PERMISSION_KEY = 'notification_permission';

/**
 * 检查通知权限状态
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[NotifQueue] 浏览器不支持 Notification');
    return 'unsupported';
  }
  return Notification.permission; // 'granted' | 'denied' | 'default'
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[NotifQueue] 浏览器不支持 Notification');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(PERMISSION_KEY, permission);
    console.log(`[NotifQueue] 权限申请结果: ${permission}`);
    return permission;
  } catch (e) {
    console.error('[NotifQueue] 权限申请失败:', e);
    return 'denied';
  }
}

/**
 * 检查是否已授权
 */
export function isNotificationEnabled() {
  return getNotificationPermission() === 'granted';
}

/**
 * 发送即时通知（仅在线时）
 * @param {string} title - 通知标题
 * @param {object} options - 通知选项
 */
export function showNotification(title, options = {}) {
  if (!isNotificationEnabled()) {
    console.warn('[NotifQueue] 通知未授权，保存到队列');
    enqueueNotification({ title, ...options });
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/static/logo/avatar.png',
      badge: '/static/logo/avatar.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) options.onClick();
    };

    notification.onclose = () => {
      if (options.onClose) options.onClose();
    };

    return notification;
  } catch (e) {
    console.error('[NotifQueue] 发送通知失败:', e);
    return null;
  }
}

/**
 * 获取通知队列
 */
function getQueue() {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[NotifQueue] 读取队列失败:', e);
    return [];
  }
}

/**
 * 保存通知队列
 */
function saveQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (e) {
    console.error('[NotifQueue] 保存队列失败:', e);
    return false;
  }
}

/**
 * 添加通知到队列（离线时自动调用）
 * @param {object} notification - 通知数据
 */
export function enqueueNotification(notification) {
  const queue = getQueue();
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: notification.title,
    body: notification.body || '',
    icon: notification.icon || '/static/logo/avatar.png',
    tag: notification.tag || '',
    data: notification.data || {},
    timestamp: Date.now(),
    status: 'pending'
  };

  queue.push(item);
  
  if (saveQueue(queue)) {
    console.log(`[NotifQueue] 入队: ${item.title}`);
    return item.id;
  }
  return null;
}

/**
 * 移除通知
 */
export function dequeueNotification(id) {
  const queue = getQueue();
  const filtered = queue.filter(item => item.id !== id);
  return saveQueue(filtered);
}

/**
 * 获取待发送通知
 */
export function getPendingNotifications() {
  return getQueue().filter(item => item.status === 'pending');
}

/**
 * 获取队列大小
 */
export function getNotificationQueueSize() {
  return getQueue().length;
}

/**
 * 清空队列
 */
export function clearNotificationQueue() {
  localStorage.removeItem(QUEUE_KEY);
  console.log('[NotifQueue] 队列已清空');
}

/**
 * 处理通知队列（网络恢复时调用）
 */
export async function processNotificationQueue() {
  const queue = getQueue();
  const pending = queue.filter(item => item.status === 'pending');

  if (pending.length === 0) {
    console.log('[NotifQueue] 无待发送通知');
    return 0;
  }

  if (!isNotificationEnabled()) {
    console.warn('[NotifQueue] 通知未授权，无法发送队列中的通知');
    return 0;
  }

  console.log(`[NotifQueue] 开始处理 ${pending.length} 个通知`);

  let sent = 0;

  for (const item of pending) {
    try {
      const notification = new Notification(item.title, {
        body: item.body,
        icon: item.icon,
        tag: item.tag,
        data: item.data
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (item.data && item.data.onClick) {
          item.data.onClick();
        }
      };

      item.status = 'sent';
      item.sentTime = Date.now();
      sent++;

      // 短暂延迟避免频率过快
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      console.error(`[NotifQueue] 发送失败: ${item.id}`, e);
      item.status = 'failed';
      item.error = e.message;
    }

    saveQueue(queue);
  }

  // 清理已发送的通知（保留最近 50 条记录）
  if (queue.length > 50) {
    const recent = queue.slice(-50);
    saveQueue(recent);
  }

  console.log(`[NotifQueue] 发送完成: ${sent}/${pending.length}`);
  return sent;
}

/**
 * 网络状态变化监听 - 自动处理队列
 */
export function listenForNetworkAndProcess() {
  const handler = async (isOnline) => {
    if (isOnline) {
      console.log('[NotifQueue] 网络恢复，检查通知队列');
      await processNotificationQueue();
    }
  };

  window.addEventListener('online', () => handler(true));
  window.addEventListener('offline', () => handler(false));

  // 初始检查
  if (navigator.onLine) {
    processNotificationQueue();
  }

  return () => {
    window.removeEventListener('online', () => handler(true));
    window.removeEventListener('offline', () => handler(false));
  };
}

/**
 * 创建定时提醒通知
 * @param {string} title - 标题
 * @param {string} body - 内容
 * @param {number} delay - 延迟毫秒
 */
export function scheduleNotification(title, body, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      showNotification(title, { body });
      resolve();
    }, delay);
  });
}

/**
 * 创建周期性提醒
 * @param {string} title - 标题
 * @param {string} body - 内容
 * @param {number} intervalMs - 间隔毫秒
 */
export function createIntervalNotification(title, body, intervalMs) {
  const intervalId = setInterval(() => {
    showNotification(title, { body });
  }, intervalMs);

  return () => clearInterval(intervalId);
}

export default {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationEnabled,
  showNotification,
  enqueueNotification,
  dequeueNotification,
  getPendingNotifications,
  getNotificationQueueSize,
  clearNotificationQueue,
  processNotificationQueue,
  listenForNetworkAndProcess,
  scheduleNotification,
  createIntervalNotification
};
