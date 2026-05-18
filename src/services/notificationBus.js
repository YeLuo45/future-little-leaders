// src/services/notificationBus.js
// V21 通知总线 — 可插拔通知渠道架构（Nanobot Plugin System 风格）

/**
 * NotificationBus — 统一通知分发总线
 * 
 * 支持插件化通知渠道：
 * - AppNotificationPlugin: 应用内推送
 * - SMSPlugin: 短信通知
 * - EmailPlugin: 邮件通知
 *
 * 使用方式：
 *   import NotificationBus from './services/notificationBus'
 *   NotificationBus.send({ type: 'task_incomplete', babyId: 'xxx', content: '...' })
 */

// ============================================================================
// Plugin Interfaces
// ============================================================================

/**
 * 通知插件基类
 */
class BaseNotificationPlugin {
  constructor(name) {
    this.name = name
    this.enabled = false
  }

  /**
   * 发送通知
   * @param {object} notification - 通知对象
   * @returns {Promise<boolean>} - 是否发送成功
   */
  async send(notification) {
    throw new Error('Plugin must implement send()')
  }

  /**
   * 启用插件
   */
  enable() {
    this.enabled = true
    console.log(`[NotificationBus] Plugin ${this.name} enabled`)
  }

  /**
   * 禁用插件
   */
  disable() {
    this.enabled = false
    console.log(`[NotificationBus] Plugin ${this.name} disabled`)
  }
}

// ============================================================================
// App Notification Plugin
// ============================================================================

class AppNotificationPlugin extends BaseNotificationPlugin {
  constructor() {
    super('AppNotification')
  }

  async send(notification) {
    if (!this.enabled) {
      console.log(`[NotificationBus] AppNotification skipped (disabled)`)
      return false
    }

    try {
      // 触发应用内通知
      uni.$emit('collab:notification', notification)
      
      // 显示 toast 提示
      uni.showToast({
        title: notification.title || '新通知',
        icon: 'none',
        duration: 2000
      })

      console.log(`[NotificationBus] AppNotification sent:`, notification.title)
      return true
    } catch (e) {
      console.error('[NotificationBus] AppNotification failed:', e)
      return false
    }
  }
}

// ============================================================================
// SMS Plugin
// ============================================================================

class SMSPlugin extends BaseNotificationPlugin {
  constructor() {
    super('SMS')
  }

  async send(notification) {
    if (!this.enabled) {
      console.log(`[NotificationBus] SMS skipped (disabled)`)
      return false
    }

    try {
      // Mock: 实际项目中调用短信网关 API
      console.log(`[NotificationBus] SMS sent to ${notification.phone || '138****8888'}:`, notification.content)
      
      // 模拟发送延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return true
    } catch (e) {
      console.error('[NotificationBus] SMS failed:', e)
      return false
    }
  }
}

// ============================================================================
// Email Plugin
// ============================================================================

class EmailPlugin extends BaseNotificationPlugin {
  constructor() {
    super('Email')
  }

  async send(notification) {
    if (!this.enabled) {
      console.log(`[NotificationBus] Email skipped (disabled)`)
      return false
    }

    try {
      // Mock: 实际项目中调用邮件发送 API
      console.log(`[NotificationBus] Email sent to ${notification.email || 'parent@example.com'}:`, notification.title)
      
      // 模拟发送延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return true
    } catch (e) {
      console.error('[NotificationBus] Email failed:', e)
      return false
    }
  }
}

// ============================================================================
// NotificationBus
// ============================================================================

const NotificationBus = {
  // 已注册的插件
  plugins: {
    app: new AppNotificationPlugin(),
    sms: new SMSPlugin(),
    email: new EmailPlugin()
  },

  // 插件配置
  channelConfig: {
    app: true,
    sms: false,
    email: false
  },

  /**
   * 初始化通知总线
   */
  init() {
    // 从本地存储加载插件配置
    try {
      const config = uni.getStorageSync('notification_plugin_config')
      if (config) {
        this.channelConfig = JSON.parse(config)
        // 应用配置到插件
        Object.keys(this.channelConfig).forEach(channel => {
          if (this.plugins[channel]) {
            if (this.channelConfig[channel]) {
              this.plugins[channel].enable()
            } else {
              this.plugins[channel].disable()
            }
          }
        })
      }
    } catch (e) {
      console.error('[NotificationBus] Load config failed:', e)
    }
    
    console.log('[NotificationBus] Initialized with channels:', Object.keys(this.plugins).join(', '))
  },

  /**
   * 保存插件配置
   */
  saveConfig() {
    try {
      uni.setStorageSync('notification_plugin_config', JSON.stringify(this.channelConfig))
    } catch (e) {
      console.error('[NotificationBus] Save config failed:', e)
    }
  },

  /**
   * 启用/禁用渠道
   * @param {string} channel - 渠道名称 (app/sms/email)
   * @param {boolean} enabled - 是否启用
   */
  setChannelEnabled(channel, enabled) {
    if (this.plugins[channel]) {
      this.channelConfig[channel] = enabled
      if (enabled) {
        this.plugins[channel].enable()
      } else {
        this.plugins[channel].disable()
      }
      this.saveConfig()
    }
  },

  /**
   * 检查渠道是否启用
   * @param {string} channel
   */
  isChannelEnabled(channel) {
    return this.channelConfig[channel] ?? false
  },

  /**
   * 获取所有渠道状态
   */
  getChannelStatus() {
    return {
      app: this.channelConfig.app,
      sms: this.channelConfig.sms,
      email: this.channelConfig.email
    }
  },

  /**
   * 发送通知到所有启用的渠道
   * @param {object} notification - 通知对象
   *   - type: 通知类型
   *   - title: 通知标题
   *   - content: 通知内容
   *   - babyId: 宝宝ID
   *   - data: 附加数据
   */
  async send(notification) {
    const results = {}
    
    for (const [channel, plugin] of Object.entries(this.plugins)) {
      if (this.channelConfig[channel]) {
        try {
          results[channel] = await plugin.send(notification)
        } catch (e) {
          results[channel] = false
          console.error(`[NotificationBus] ${channel} send failed:`, e)
        }
      }
    }

    // 触发发送完成事件
    uni.$emit('notificationBus:sent', { notification, results })
    
    console.log('[NotificationBus] Send results:', results)
    return results
  },

  /**
   * 发送任务未完成提醒
   */
  async sendTaskIncompleteReminder(babyId, babyName, taskTitle) {
    return this.send({
      type: 'task_incomplete',
      title: '任务未完成提醒',
      content: `「${babyName}」的任务「${taskTitle}」还未完成，请及时督促。`,
      babyId,
      data: { taskTitle, babyName }
    })
  },

  /**
   * 发送升级提醒
   */
  async sendEscalationReminder(babyId, babyName, taskTitle) {
    return this.send({
      type: 'escalation',
      title: '任务连续未完成',
      content: `「${babyName}」的任务「${taskTitle}」已连续3天未完成，请教师关注。`,
      babyId,
      data: { taskTitle, babyName, escalation: true }
    })
  },

  /**
   * 发送成就达成通知
   */
  async sendAchievementNotification(babyId, babyName, achievementName) {
    return this.send({
      type: 'achievement',
      title: '🎉 成就达成',
      content: `恭喜！「${babyName}」达成了「${achievementName}」！`,
      babyId,
      data: { achievementName, babyName }
    })
  },

  /**
   * 班级动态通知
   */
  async sendClassFeedNotification(feed) {
    return this.send({
      type: 'class_feed',
      title: feed.title,
      content: feed.content,
      babyId: null,
      data: { feedId: feed.id, feedType: feed.type }
    })
  },

  /**
   * 聊天新消息通知
   */
  async sendChatNotification(teacherId, teacherName, message) {
    return this.send({
      type: 'chat_message',
      title: `来自${teacherName}的消息`,
      content: message,
      teacherId,
      data: { teacherName }
    })
  }
}

// 初始化
NotificationBus.init()

export default NotificationBus
