/**
 * App Initializer - 统一初始化入口
 * 确保 V4 离线优先系统正确初始化后再挂载 App
 */
import { initV4 } from '@/v4.js'

let appReady = false

/**
 * 统一初始化顺序
 * 1. initSQLite (V4 基础)
 * 2. initV4 (加密 + 同步引擎)
 * 3. 创建 Pinia store
 * 4. 挂载 App
 *
 * @param {object} options
 * @param {Function} options.createApp - Vue app 创建函数
 * @param {Function} options.onReady - App 就绪回调
 */
export async function initApp(options = {}) {
  try {
    // 1. 初始化 V4 离线同步系统
    console.log('[Init] Starting V4 initialization...')
    const v4Result = await initV4()

    if (!v4Result.success) {
      console.warn('[Init] V4 init failed:', v4Result.error)
      // 降级处理：继续启动（离线优先）
    } else {
      console.log('[Init] V4 initialized successfully')
    }

    // 2. 创建 Vue app
    const { createApp } = options
    if (createApp) {
      const { app, pinia } = createApp()
      app.use(pinia)
    }

    appReady = true

    if (options.onReady) {
      options.onReady()
    }

    return { success: true }
  } catch (err) {
    console.error('[Init] Fatal error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 检查 App 是否已就绪
 */
export function isAppReady() {
  return appReady
}