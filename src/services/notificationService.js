/**
 * NotificationService — 协作通知系统
 *
 * 统一的通知持久化和推送服务。
 * 所有协作事件（任务分配/审核/积分/成就）通过这里发送。
 *
 * Storage: uni.getStorageSync/setStorageSync, key='collab_notifications'
 *
 * 使用方式：
 *   const NotificationService = require('./notificationService');
 *   NotificationService.sendTaskAssigned(childId, title, points);
 */

'use strict';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'collab_notifications';

// Notification type definitions
const NotificationType = {
  TASK_ASSIGNED: 'task_assigned',       // 新任务分配
  TASK_APPROVED: 'task_approved',         // 任务审核通过
  TASK_REJECTED: 'task_rejected',         // 任务被打回
  TASK_RESUBMITTED: 'task_resubmitted',   // 任务重新提交
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked', // 成就解锁
  POINTS_EARNED: 'points_earned',         // 积分到账
};

const TypeLabels = {
  [NotificationType.TASK_ASSIGNED]: '📋 新任务',
  [NotificationType.TASK_APPROVED]: '✅ 任务通过',
  [NotificationType.TASK_REJECTED]: '❌ 任务打回',
  [NotificationType.TASK_RESUBMITTED]: '🔄 重新提交',
  [NotificationType.ACHIEVEMENT_UNLOCKED]: '🎉 成就解锁',
  [NotificationType.POINTS_EARNED]: '🔥 积分到账',
};

// ============================================================================
// Storage
// ============================================================================

function loadNotifications() {
  try {
    const stored = uni.getStorageSync(STORAGE_KEY);
    if (!stored) return [];
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[NotificationService] Load failed:', e);
    return [];
  }
}

function saveNotifications(list) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('[NotificationService] Save failed:', e);
  }
}

function generateId() {
  return 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// ============================================================================
// NotificationService
// ============================================================================

const NotificationService = {

  NotificationType,

  /**
   * 发送通知
   * @param {object} notification - { type, recipientId, title, content, data }
   */
  send(notification) {
    const n = {
      id: generateId(),
      type: notification.type || 'unknown',
      recipientId: notification.recipientId,
      title: notification.title || '',
      content: notification.content || '',
      data: notification.data || null,
      createdAt: Date.now(),
      read: false,
    };
    const list = loadNotifications();
    list.unshift(n); // 最新通知在前
    saveNotifications(list);
    // 实时事件推送
    uni.$emit('collab:notification', n);
    // 通知数变化事件
    uni.$emit('notification:updated', { recipientId: n.recipientId });
    console.log('[NotificationService] 发送通知:', n.type, n.recipientId, n.content);
    return n;
  },

  /**
   * 获取未读通知数
   * @param {string} recipientId
   */
  getUnreadCount(recipientId) {
    if (!recipientId) return 0;
    return loadNotifications().filter(n => n.recipientId === recipientId && !n.read).length;
  },

  /**
   * 获取通知列表
   * @param {string} recipientId
   * @param {number} limit
   */
  getNotifications(recipientId, limit = 50) {
    if (!recipientId) return [];
    return loadNotifications()
      .filter(n => n.recipientId === recipientId)
      .slice(0, limit);
  },

  /**
   * 获取所有通知（含家庭广播）
   * @param {string} recipientId
   * @param {number} limit
   */
  getAllNotifications(recipientId, limit = 50) {
    if (!recipientId) return [];
    return loadNotifications()
      .filter(n => n.recipientId === recipientId || n.recipientId === 'family_broadcast')
      .slice(0, limit);
  },

  /**
   * 标记单条已读
   * @param {string} notificationId
   */
  markRead(notificationId) {
    const list = loadNotifications();
    const n = list.find(x => x.id === notificationId);
    if (n) {
      n.read = true;
      saveNotifications(list);
      uni.$emit('notification:updated', { recipientId: n.recipientId });
    }
  },

  /**
   * 全部已读
   * @param {string} recipientId
   */
  markAllRead(recipientId) {
    const list = loadNotifications();
    let changed = false;
    list.forEach(n => {
      if (n.recipientId === recipientId && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) {
      saveNotifications(list);
      uni.$emit('notification:updated', { recipientId });
    }
  },

  /**
   * 删除单条通知
   * @param {string} notificationId
   */
  deleteNotification(notificationId) {
    const list = loadNotifications();
    const n = list.find(x => x.id === notificationId);
    const filtered = list.filter(x => x.id !== notificationId);
    saveNotifications(filtered);
    if (n) {
      uni.$emit('notification:updated', { recipientId: n.recipientId });
    }
  },

  /**
   * 清空所有通知
   * @param {string} recipientId
   */
  clearAll(recipientId) {
    const list = loadNotifications().filter(n => n.recipientId !== recipientId);
    saveNotifications(list);
    uni.$emit('notification:updated', { recipientId });
  },

  // ==========================================================================
  // Convenience send methods
  // ==========================================================================

  /**
   * 任务分配通知（发给孩子）
   */
  sendTaskAssigned(childId, taskTitle, points, taskId) {
    return this.send({
      type: NotificationType.TASK_ASSIGNED,
      recipientId: childId,
      title: '新任务',
      content: `任务「${taskTitle}」，奖励${points}积分`,
      data: { taskId, taskTitle, points },
    });
  },

  /**
   * 任务审核通过通知（发给孩子）
   */
  sendTaskApproved(childId, taskTitle, points, taskId) {
    return this.send({
      type: NotificationType.TASK_APPROVED,
      recipientId: childId,
      title: '任务通过',
      content: `任务「${taskTitle}」审核通过，+${points}积分已到账`,
      data: { taskId, taskTitle, points },
    });
  },

  /**
   * 任务打回通知（发给孩子）
   */
  sendTaskRejected(childId, taskTitle, reason, taskId) {
    return this.send({
      type: NotificationType.TASK_REJECTED,
      recipientId: childId,
      title: '任务打回',
      content: `任务「${taskTitle}」被打回：${reason}`,
      data: { taskId, taskTitle, reason },
    });
  },

  /**
   * 任务重新提交通知（发给家长）
   */
  sendTaskResubmitted(parentId, taskTitle, childId, childName) {
    return this.send({
      type: NotificationType.TASK_RESUBMITTED,
      recipientId: parentId || 'family_broadcast',
      title: '任务重新提交',
      content: `${childName}重新提交了任务「${taskTitle}」，请审核`,
      data: { childId, taskTitle },
    });
  },

  /**
   * 成就解锁通知（发给双方）
   */
  sendAchievementUnlocked(childId, childName, achievementName, achievementIcon) {
    // 给孩子发
    this.send({
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      recipientId: childId,
      title: '成就解锁',
      content: `🎉 你解锁了「${achievementName}」`,
      data: { achievementName, achievementIcon },
    });
    // 给家长广播
    this.send({
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      recipientId: 'family_broadcast',
      title: '成就解锁',
      content: `🎉 ${childName}解锁了「${achievementName}」`,
      data: { childId, childName, achievementName, achievementIcon },
    });
  },

  /**
   * 积分到账通知（发给孩子）
   */
  sendPointsEarned(childId, points, reason) {
    return this.send({
      type: NotificationType.POINTS_EARNED,
      recipientId: childId,
      title: '积分到账',
      content: `+${points}积分到账（${reason}）`,
      data: { points, reason },
    });
  },

  // ==========================================================================
  // Utils
  // ==========================================================================

  /**
   * 格式化时间显示
   */
  formatTime(createdAt) {
    if (!createdAt) return '';
    const now = Date.now();
    const diff = now - createdAt;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    const d = new Date(createdAt);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  },

  /**
   * 获取通知类型标签
   */
  getTypeLabel(type) {
    return TypeLabels[type] || type;
  },
};

module.exports = NotificationService;
