/**
 * Service Worker - V24 Offline-First PWA
 * 预缓存 + 增量更新 + 离线回退
 */

const CACHE_VERSION = 'v24';
const PRECACHE_NAME = `precache-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// 预缓存的关键资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/logo/avatar.png',
  '/static/iconfont.css'
];

/**
 * 安装事件 - 预缓存关键资源
 */
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then((cache) => {
        console.log('[SW] 预缓存开启');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] 预缓存完成');
        // 立即激活
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] 预缓存失败:', err);
      })
  );
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // 删除旧版本缓存
              return name.startsWith('precache-') || name.startsWith('dynamic-');
            })
            .filter((name) => {
              return name !== PRECACHE_NAME && name !== DYNAMIC_CACHE_NAME;
            })
            .map((name) => {
              console.log('[SW] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] 激活完成');
        // 立即接管所有页面
        return self.clients.claim();
      })
  );
});

/**
 * 请求拦截 - Cache First + Network Fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 仅处理同源和特定跨域请求
  if (url.origin !== location.origin && !url.hostname.includes('sealoshzh.site')) {
    return;
  }

  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过 chrome-extension 等特殊请求
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 返回缓存，同时更新缓存（增量更新策略）
          event.waitUntil(
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  const responseClone = networkResponse.clone();
                  caches.open(DYNAMIC_CACHE_NAME)
                    .then((cache) => cache.put(request, responseClone));
                }
              })
              .catch(() => {
                // 网络失败，忽略
              })
          );
          return cachedResponse;
        }

        // 缓存未命中，尝试网络
        return fetch(request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // 缓存新资源
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));

            return networkResponse;
          })
          .catch(() => {
            // 网络失败，返回离线页面
            console.log('[SW] 网络失败，返回离线页面');
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

/**
 * 后台同步事件 - 离线队列同步
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] 后台同步:', event.tag);
  
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

/**
 * 同步离线队列
 */
async function syncOfflineQueue() {
  try {
    // 获取所有客户端窗口
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      // 发送同步消息
      client.postMessage({
        type: 'SYNC_OFFLINE_QUEUE',
        timestamp: Date.now()
      });
    }
    
    console.log('[SW] 同步消息已发送');
  } catch (err) {
    console.error('[SW] 同步失败:', err);
  }
}

/**
 * Push 通知事件
 */
self.addEventListener('push', (event) => {
  console.log('[SW] 收到推送:', event);
  
  if (!event.data) {
    console.log('[SW] 无推送数据');
    return;
  }

  const data = event.data.json();
  
  const options = {
    body: data.body || '',
    icon: data.icon || '/static/logo/avatar.png',
    badge: data.badge || '/static/logo/avatar.png',
    tag: data.tag || 'default',
    data: data.data || {},
    vibrate: [100, 50, 100],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '亲子任务宝', options)
  );
});

/**
 * 通知点击事件
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知点击:', event.notification.tag);
  
  event.notification.close();

  const data = event.notification.data || {};

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 尝试聚焦已有窗口
        for (const client of clientList) {
          if (client.url.includes('future-little-leaders') && 'focus' in client) {
            return client.focus();
          }
        }
        // 没有窗口则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(data.url || '/');
        }
      })
  );
});

/**
 * 消息监听 - 接收主线程消息
 */
self.addEventListener('message', (event) => {
  console.log('[SW] 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    });
  }
});

/**
 * 定期同步（如果支持）
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] 定期同步数据');
  // 可以在这里实现定期同步逻辑
}

console.log('[SW] Service Worker 加载完成', CACHE_VERSION);
