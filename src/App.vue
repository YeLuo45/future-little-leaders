<script>
export default {
  // 当应用初始化完成时触发（全局只触发一次）
  onLaunch: function () {
    console.log('App Launch');
    
    // 初始化全局事件代理
    this.setupGlobalEventProxy();
  },
  // 当应用启动，或从后台进入前台显示时触发
  onShow: function () {
    console.log('App Show')
  },
  // 当应用从前台进入后台时触发
  onHide: function () {
    console.log('App Hide')
  },
  
  // 全局分享配置
  onShareAppMessage(res) {
    // 获取当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route;
    
    // 如果当前页面已经实现了自己的分享，则使用页面的分享配置
    if (currentPage.$vm && currentPage.$vm.onShareAppMessage) {
      return;
    }
    
    // 默认分享配置
    return {
      title: '亲子任务宝 - 驱动宝宝更好的成长',
      path: '/pages/index/index',
      imageUrl: '/static/logo/share-logo.png'
    }
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    // 获取当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    // 如果当前页面已经实现了自己的分享到朋友圈，则使用页面的配置
    if (currentPage.$vm && currentPage.$vm.onShareTimeline) {
      return;
    }
    
    // 默认朋友圈分享配置
    return {
      title: '亲子任务宝 - 记录宝宝的每一步成长',
      query: '',
      imageUrl: '/static/logo/share-logo.png'
    }
  },
  
  methods: {
    // 设置全局事件代理，增强跨页面通信
    setupGlobalEventProxy() {
      // 存储原始的uni.$emit方法
      const originalEmit = uni.$emit;
      
      // 重写uni.$emit方法，添加日志并确保事件广播更可靠
      uni.$emit = function(eventName, ...args) {
        // 为特定事件添加更详细的日志
        if (eventName === 'babyChanged') {
          const data = args[0];
          const babyId = typeof data === 'object' ? data.babyId : data;
          const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';
          const timestamp = typeof data === 'object' ? data.timestamp : Date.now();
          
          console.log(`%c[全局事件] 触发宝宝切换: ${eventName}`, 'color:red;font-weight:bold');
          console.log(`%c[全局事件] 来源页面: ${source}, 宝宝ID: ${babyId}, 时间戳: ${timestamp}`, 'color:red');
          
          try {
            // 同步保存到本地存储
            uni.setStorageSync('currentBabyId', babyId);
            console.log(`%c[全局事件] 已同步宝宝ID到存储: ${babyId}`, 'color:green;font-weight:bold');
            
            // 记录事件发送前的时间
            const startTime = Date.now();
            console.log(`%c[全局事件] 开始广播事件, 时间: ${new Date(startTime).toLocaleTimeString()}`, 'color:blue');
            
            // 使用setTimeout确保事件在下一个事件循环处理，增加可靠性
            setTimeout(() => {
              // 调用原始emit方法
              console.log(`%c[全局事件] 广播延迟: ${Date.now() - startTime}ms`, 'color:orange');
              originalEmit.apply(uni, [eventName, ...args]);
              console.log(`%c[全局事件] 事件广播完成`, 'color:green');
            }, 50);
          } catch (e) {
            console.error('[全局事件] 宝宝切换事件处理错误:', e);
          }
        } else if (eventName === 'refreshBabyList' || eventName === 'refreshTaskList') {
          // 其他重要事件也添加日志
          console.log(`%c[全局事件] 触发: ${eventName}`, 'color:blue', args[0]);
          originalEmit.apply(uni, [eventName, ...args]);
        } else {
          // 其他事件正常处理
          originalEmit.apply(uni, [eventName, ...args]);
        }
      };
      
      // 增强原始的uni.$on方法，添加事件监听日志
      const originalOn = uni.$on;
      uni.$on = function(eventName, callback) {
        if (eventName === 'babyChanged') {
          console.log(`%c[全局事件] 添加宝宝切换事件监听器`, 'color:purple');
          // 包装回调函数，添加日志
          const wrappedCallback = function(data) {
            const babyId = typeof data === 'object' ? data.babyId : data;
            const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';
            console.log(`%c[全局事件] 接收宝宝切换事件, 来源: ${source}, 宝宝ID: ${babyId}`, 'color:purple');
            // 调用原始回调
            callback(data);
          };
          // 使用包装后的回调
          return originalOn.call(uni, eventName, wrappedCallback);
        } else {
          // 其他事件正常处理
          return originalOn.apply(uni, [eventName, callback]);
        }
      };
      
      console.log('%c[全局事件] 事件代理增强初始化完成', 'color:green;font-weight:bold');
    }
  }
}
</script>

<style>
	/* 导入公共样式 */
	@import './common/styles/common.css';
	
	/* 全局样式，所有页面都会应用这些样式 */
	@import './static/iconfont.css';

	page {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
	}

	/* 通用样式 */
	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
	}

	.flex-center {
		justify-content: center;
		align-items: center;
	}

	.text-center {
		text-align: center;
	}
</style>
