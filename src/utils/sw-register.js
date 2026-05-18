/**
 * Service Worker Registration - V24 Offline-First PWA
 * 使用原生 Service Worker API，无额外依赖
 */

const SW_VERSION = 'v24';
const SW_PATH = './service-worker.js';

/**
 * 检查浏览器是否支持 Service Worker
 */
export function isServiceWorkerSupported() {
  return 'serviceWorker' in navigator;
}

/**
 * 注册 Service Worker
 */
export async function registerServiceWorker() {
  if (!isServiceWorkerSupported()) {
    console.warn('[SW] Service Worker 不支持，跳过注册');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: './'
    });

    console.log(`[SW] 注册成功，版本: ${SW_VERSION}`, registration.scope);

    // 监听安装事件
    registration.addEventListener('install', (event) => {
      console.log('[SW] 安装中...', event);
    });

    // 监听激活事件
    registration.addEventListener('activate', (event) => {
      console.log('[SW] 已激活', event);
      // 立即接管所有页面
      event.waitUntil(clients.claim());
    });

    // 监听更新事件
    registration.addEventListener('updatefound', (event) => {
      console.log('[SW] 发现新版本', event);
    });

    // 监听 Controller 变化
    navigator.serviceWorker.addEventListener('controllerchange', (event) => {
      console.log('[SW] Controller 变化，重新加载页面');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('[SW] 注册失败:', error);
    return null;
  }
}

/**
 * 注销 Service Worker
 */
export async function unregisterServiceWorker() {
  if (!isServiceWorkerSupported()) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
    console.log('[SW] 已注销');
  }
}

/**
 * 检查更新
 */
export async function checkForUpdates() {
  if (!isServiceWorkerSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
    console.log('[SW] 检查更新完成');
  }
}

/**
 * 获取 SW 状态
 */
export function getSWStatus(registration) {
  if (!registration) return 'inactive';
  
  if (registration.active && registration.active.state === 'activated') {
    return 'activated';
  }
  if (registration.installing) return 'installing';
  if (registration.waiting) return 'waiting';
  return 'inactive';
}

export default {
  isServiceWorkerSupported,
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdates,
  getSWStatus
};
