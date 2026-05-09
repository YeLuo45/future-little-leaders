/**
 * SchedulerService — 周期性任务调度引擎
 *
 * 在 App 启动时检查所有启用的循环任务模板，
 * 判定是否需要触发，创建 TaskFlow 并发送通知。
 *
 * Storage: localStorage key='recurring_templates'
 *
 * 使用方式：
 *   const { SchedulerService } = require('./schedulerService');
 *   SchedulerService.checkAndTrigger();
 *   SchedulerService.checkPendingApprovals();
 */

'use strict';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'recurring_templates';
const PENDING_DEADLINE_DAYS = 3; // 待审核超时天数

// ============================================================================
// Storage Helpers
// ============================================================================

function loadTemplates() {
  try {
    const stored = uni.getStorageSync(STORAGE_KEY) || '[]';
    return typeof stored === 'string' ? JSON.parse(stored) : stored;
  } catch (e) {
    return [];
  }
}

function saveTemplates(list) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('[SchedulerService] Save failed:', e);
  }
}

function generateId(prefix = 'tpl') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================================
// Cycle Detection
// ============================================================================

/**
 * 判断当前时间是否应该触发某个模板
 */
function shouldTrigger(template, now = new Date()) {
  if (!template || !template.enabled) return false;

  const cycle = template.cycle;
  const day = now.getDay();           // 0=周日, 1=周一...
  const date = now.getDate();          // 1-31
  const todayStart = getTodayStart(now);

  // 今天是否已触发过
  const lastTriggered = template.lastTriggered || 0;
  if (lastTriggered >= todayStart) return false;

  switch (cycle) {
    case 'daily':
      return isAtTriggerTime(now, template.timeOfDay);

    case 'weekdays':
      return day >= 1 && day <= 5 && isAtTriggerTime(now, template.timeOfDay);

    case 'weekly': {
      const weekdays = template.weekdays || [];
      const hitDay = weekdays.includes(day);
      return hitDay && isAtTriggerTime(now, template.timeOfDay);
    }

    case 'monthly':
      return date === 1 && isAtTriggerTime(now, template.timeOfDay);

    default:
      return false;
  }
}

function getTodayStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function isAtTriggerTime(now, timeOfDay) {
  if (!timeOfDay) return true; // 无时间限制，见 App 就触发
  const [h, m] = timeOfDay.split(':').map(Number);
  const triggerMin = h * 60 + m;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // 容忍±10分钟内触发
  return Math.abs(nowMin - triggerMin) <= 10;
}

// ============================================================================
// RecurringTemplate Management
// ============================================================================

const SchedulerService = {
  /**
   * 创建循环任务模板
   */
  createTemplate({ title, description, babyId, rewardPoints, cycle, weekdays, timeOfDay, auditDeadline }) {
    const templates = loadTemplates();
    const template = {
      id: generateId('rpl'),
      title,
      description: description || '',
      babyId,
      rewardPoints: rewardPoints || 0,
      cycle: cycle || 'daily',
      weekdays: weekdays || [],
      timeOfDay: timeOfDay || null,
      auditDeadline: auditDeadline || 3,
      enabled: true,
      createdAt: Date.now(),
      lastTriggered: 0,
    };
    templates.push(template);
    saveTemplates(templates);
    console.log('[SchedulerService] Created template:', template.title, template.id);
    return template;
  },

  /**
   * 获取所有模板
   */
  getTemplates() {
    return loadTemplates();
  },

  /**
   * 获取某宝宝的模板
   */
  getTemplatesByBaby(babyId) {
    return loadTemplates().filter(t => t.babyId === babyId);
  },

  /**
   * 启用/禁用模板
   */
  setTemplateEnabled(templateId, enabled) {
    const templates = loadTemplates();
    const t = templates.find(x => x.id === templateId);
    if (t) {
      t.enabled = enabled;
      saveTemplates(templates);
    }
  },

  /**
   * 删除模板
   */
  deleteTemplate(templateId) {
    const templates = loadTemplates().filter(t => t.id !== templateId);
    saveTemplates(templates);
  },

  /**
   * 更新 lastTriggered
   */
  touchLastTriggered(templateId) {
    const templates = loadTemplates();
    const t = templates.find(x => x.id === templateId);
    if (t) {
      t.lastTriggered = Date.now();
      saveTemplates(templates);
    }
  },

  // ==========================================================================
  // Core scheduling logic
  // ==========================================================================

  /**
   * 检查所有模板，触发到期的
   * 调用方式：App.vue onLaunch 时
   */
  checkAndTrigger() {
    let triggered = 0;
    try {
      const templates = loadTemplates().filter(t => t.enabled);
      const now = new Date();

      templates.forEach(t => {
        if (shouldTrigger(t, now)) {
          this._triggerTemplate(t);
          triggered++;
        }
      });

      if (triggered > 0) {
        console.log(`[SchedulerService] checkAndTrigger: ${triggered} templates triggered`);
      }
    } catch (e) {
      console.error('[SchedulerService] checkAndTrigger error:', e);
    }
    return triggered;
  },

  /**
   * 触发单个模板
   */
  _triggerTemplate(template) {
    try {
      const { createTaskFlow } = require('./collaborationService');

      const flow = createTaskFlow({
        taskId: `recurring_${template.id}_${Date.now()}`,
        taskTitle: template.title,
        childId: template.babyId,
        rewardPoints: template.rewardPoints,
        description: template.description,
        isRecurring: true,
      });

      // 更新触发时间
      this.touchLastTriggered(template.id);

      // 发送通知（通过 collaborationService 会自动发）
      console.log('[SchedulerService] Triggered:', template.title, '->', template.babyId);

      return flow;
    } catch (e) {
      console.error('[SchedulerService] _triggerTemplate error:', e);
      return null;
    }
  },

  /**
   * 检查待审核超时的任务，发送提醒通知
   */
  checkPendingApprovals() {
    try {
      const { getTaskFlows } = require('./collaborationService');
      const flows = getTaskFlows().filter(f => f.state === 'pending_approval');
      const now = Date.now();
      const deadlineMs = PENDING_DEADLINE_DAYS * 24 * 3600 * 1000;

      const overdue = flows.filter(f => {
        const age = now - (f.completedAt || 0);
        return age > deadlineMs;
      });

      if (overdue.length === 0) return 0;

      // 发送提醒（只发一次，用 localStorage 记录已提醒的 flowId）
      const notifiedKey = 'pending_reminder_notified';
      const notified = JSON.parse(uni.getStorageSync(notifiedKey) || '[]');
      const notifiedSet = new Set(notified);

      let sent = 0;
      overdue.forEach(f => {
        if (!notifiedSet.has(f.id)) {
          try {
            const { NotificationService } = require('./notificationService');
            NotificationService.send({
              type: 'audit_reminder',
              recipientId: 'family_broadcast',
              title: '审核提醒',
              content: `任务「${f.taskTitle}」已等待审核超过${PENDING_DEADLINE_DAYS}天，请尽快处理`,
              data: { flowId: f.id },
            });
            notified.push(f.id);
            sent++;
          } catch (e) {
            // notificationService 可能未加载
          }
        }
      });

      if (sent > 0) {
        uni.setStorageSync(notifiedKey, JSON.stringify(notified));
        console.log(`[SchedulerService] Sent ${sent} audit reminders`);
      }

      return sent;
    } catch (e) {
      console.error('[SchedulerService] checkPendingApprovals error:', e);
      return 0;
    }
  },

  // ==========================================================================
  // Templates CRUD helpers
  // ==========================================================================

  /**
   * 获取可读的周期描述
   */
  getCycleLabel(cycle, weekdays) {
    switch (cycle) {
      case 'daily': return '每天';
      case 'weekdays': return '工作日';
      case 'weekly': return `每周${(weekdays || []).map(d => '周' + '日一二三四五六'[d]).join('')}`;
      case 'monthly': return '每月1日';
      default: return cycle;
    }
  },

  /**
   * 获取当前宝宝的下次触发时间（描述）
   */
  getNextTriggerDescription(template) {
    if (!template.enabled) return '已暂停';
    // 简化：下次触发时间基于周期推算（实际以 checkAndTrigger 的 isAtTriggerTime 为准）
    const cycle = template.cycle;
    const weekdays = template.weekdays || [];
    const now = new Date();

    switch (cycle) {
      case 'daily':
        return '每天 ' + (template.timeOfDay || '任意时间');
      case 'weekdays':
        return '工作日 ' + (template.timeOfDay || '任意时间');
      case 'weekly': {
        if (weekdays.length === 0) return '每周';
        const nextDay = weekdays.find(d => d > now.getDay()) || weekdays[0];
        return `每周${'日一二三四五六'[nextDay]} ${template.timeOfDay || ''}`;
      }
      case 'monthly':
        return `每月1日 ${template.timeOfDay || ''}`;
      default:
        return cycle;
    }
  },
};

module.exports = SchedulerService;