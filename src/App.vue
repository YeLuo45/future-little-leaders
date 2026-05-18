<script>
export default {
  onLaunch: function () {
    console.log('App Launch');
    this.setupGlobalEventProxy();
    this.initAchievementStore();
    this.initScheduler();
    this.initOfflineFirst();
  },

  initAchievementStore: function() {
    setTimeout(() => {
      const { useAchievementStore } = require('@/stores/achievementStore.js');
      const achievementStore = useAchievementStore();
      achievementStore.init();
      console.log('[成就系统] 初始化完成');
    }, 100);
  },

  initScheduler: function() {
    setTimeout(() => {
      try {
        const { SchedulerService } = require('@/services/schedulerService.js');
        SchedulerService.checkAndTrigger();
        SchedulerService.checkPendingApprovals();
        console.log('[调度系统] 初始化完成');
      } catch (e) {
        console.warn('[调度系统] 初始化跳过:', e.message);
      }
    }, 500);
  },

  // V24: 初始化离线优先功能
  initOfflineFirst: function() {
    setTimeout(() => {
      this.registerServiceWorker();
      this.initOfflineQueue();
      this.initNotificationQueue();
      this.initPWAPrompt();
    }, 1000);
  },

  // V24: 注册 Service Worker
  registerServiceWorker: function() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      import('@/utils/sw-register.js').then(({ registerServiceWorker }) => {
        registerServiceWorker().then((registration) => {
          if (registration) {
            console.log('[V24 PWA] Service Worker 注册成功');
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
                console.log('[V24 PWA] 收到 SW 同步指令');
                this.processOfflineQueue();
              }
            });
          }
        }).catch((err) => {
          console.error('[V24 PWA] Service Worker 注册失败:', err);
        });
      });
    }
  },

  // V24: 初始化离线队列
  initOfflineQueue: function() {
    if (typeof navigator !== 'undefined') {
      import('@/utils/offline-queue.js').then(({ listenNetworkStatus }) => {
        this._unlistenNetwork = listenNetworkStatus((isOnline) => {
          if (isOnline) {
            console.log('[V24] 网络恢复，开始同步离线数据');
            this.processOfflineQueue();
          } else {
            console.log('[V24] 网络断开');
          }
        });
        console.log('[V24] 离线队列初始化完成');
      });
    }
  },

  // V24: 处理离线队列
  processOfflineQueue: function() {
    if (typeof navigator !== 'undefined') {
      import('@/utils/offline-queue.js').then(({ markAllSynced }) => {
        markAllSynced();
        console.log('[V24] 离线队列处理完成');
      });
    }
  },

  // V24: 初始化通知队列
  initNotificationQueue: function() {
    if (typeof window !== 'undefined') {
      import('@/utils/notification-queue.js').then(({ listenForNetworkAndProcess, requestNotificationPermission }) => {
        this._unlistenNotif = listenForNetworkAndProcess();
        requestNotificationPermission();
        console.log('[V24] 通知队列初始化完成');
      });
    }
  },

  // V24: PWA 安装提示
  initPWAPrompt: function() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[V24 PWA] 安装提示可用');
        this._deferredPrompt = e;
        uni.$emit('pwa-install-available', { platform: 'h5', timestamp: Date.now() });
      });
      window.addEventListener('appinstalled', () => {
        console.log('[V24 PWA] 应用已安装');
        this._deferredPrompt = null;
        uni.$emit('pwa-install-completed', { timestamp: Date.now() });
      });
    }
  },

  // V24: 触发 PWA 安装
  triggerPWAPrompt: function() {
    if (typeof window !== 'undefined' && this._deferredPrompt) {
      this._deferredPrompt.prompt();
      this._deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[V24 PWA] 用户同意安装');
        } else {
          console.log('[V24 PWA] 用户取消安装');
        }
        this._deferredPrompt = null;
      });
    }
  },

  onShow: function () {
    console.log('App Show');
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.processOfflineQueue();
    }
  },

  onHide: function () {
    console.log('App Hide');
  },

  onShareAppMessage(res) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage.$vm && currentPage.$vm.onShareAppMessage) return;
    return {
      title: '亲子任务宝 - 驱动宝宝更好的成长',
      path: '/pages/index/index',
      imageUrl: '/static/logo/share-logo.png'
    };
  },

  onShareTimeline() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage.$vm && currentPage.$vm.onShareTimeline) return;
    return {
      title: '亲子任务宝 - 记录宝宝的每一步成长',
      query: '',
      imageUrl: '/static/logo/share-logo.png'
    };
  },

  methods: {
    setupGlobalEventProxy() {
      const originalEmit = uni.$emit;
      uni.$emit = function(eventName, ...args) {
        if (eventName === 'babyChanged') {
          const data = args[0];
          const babyId = typeof data === 'object' ? data.babyId : data;
          const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';
          console.log(`%c[全局事件] 触发宝宝切换: ${eventName}`, 'color:red;font-weight:bold');
          console.log(`%c[全局事件] 来源页面: ${source}, 宝宝ID: ${babyId}`, 'color:red');
          try {
            uni.setStorageSync('currentBabyId', babyId);
            const startTime = Date.now();
            setTimeout(() => {
              originalEmit.apply(uni, [eventName, ...args]);
            }, 50);
          } catch (e) {
            console.error('[全局事件] 宝宝切换事件处理错误:', e);
          }
        } else if (eventName === 'refreshBabyList' || eventName === 'refreshTaskList') {
          originalEmit.apply(uni, [eventName, ...args]);
        } else {
          originalEmit.apply(uni, [eventName, ...args]);
        }
      };
      const originalOn = uni.$on;
      uni.$on = function(eventName, callback) {
        if (eventName === 'babyChanged') {
          const wrappedCallback = function(data) {
            callback(data);
          };
          return originalOn.call(uni, eventName, wrappedCallback);
        }
        return originalOn.apply(uni, [eventName, callback]);
      };
      console.log('%c[全局事件] 事件代理增强初始化完成', 'color:green;font-weight:bold');
    }
  }
}
</script>

<style>
@import './common/styles/common.css';
@import './styles/high-contrast.css';
@import './static/iconfont.css';
page {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
}
.flex-row { display: flex; flex-direction: row; }
.flex-column { display: flex; flex-direction: column; }
.flex-center { justify-content: center; align-items: center; }
.text-center { text-align: center; }
</style>
