<!-- Widget配置页面 - 小部件设置与嵌入 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">小部件设置</text>
      <view class="nav-right"></view>
    </view>

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="activeTab = tab.key"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- iOS Widget设置 -->
    <view v-if="activeTab === 'ios'" class="tab-content">
      <view class="section">
        <view class="section-title">iOS Widget</view>
        <view class="section-desc">
          iOS 14+ 支持桌面小组件，请在主屏幕长按添加「今日任务」小组件
        </view>
        
        <view class="info-card">
          <view class="info-row">
            <text class="info-label">支持尺寸</text>
            <text class="info-value">小/中/大</text>
          </view>
          <view class="info-row">
            <text class="info-label">刷新频率</text>
            <text class="info-value">15分钟</text>
          </view>
          <view class="info-row">
            <text class="info-label">快捷操作</text>
            <text class="info-value">打卡/查看任务</text>
          </view>
        </view>

        <view class="action-btn primary" @tap="generateIOSCode">
          生成嵌入代码
        </view>
      </view>
    </view>

    <!-- Android Widget设置 -->
    <view v-if="activeTab === 'android'" class="tab-content">
      <view class="section">
        <view class="section-title">Android Widget</view>
        <view class="section-desc">
          Android 桌面小组件，支持不同尺寸的快捷操作
        </view>
        
        <view class="info-card">
          <view class="info-row">
            <text class="info-label">最小尺寸</text>
            <text class="info-value">2x2</text>
          </view>
          <view class="info-row">
            <text class="info-label">支持尺寸</text>
            <text class="info-value">2x2/4x2/4x3</text>
          </view>
          <view class="info-row">
            <text class="info-label">更新方式</text>
            <text class="info-value">定时+手动</text>
          </view>
        </view>

        <view class="action-btn primary" @tap="generateAndroidCode">
          生成嵌入代码
        </view>
      </view>
    </view>

    <!-- Web Widget设置 -->
    <view v-if="activeTab === 'web'" class="tab-content">
      <view class="section">
        <view class="section-title">Web Widget</view>
        <view class="section-desc">
          可嵌入到任何网页的小组件件，支持主题和尺寸配置
        </view>
        
        <!-- 尺寸选择 -->
        <view class="form-group">
          <text class="form-label">组件尺寸</text>
          <view class="size-options">
            <view
              v-for="size in sizeOptions"
              :key="size.value"
              class="size-option"
              :class="{ active: webConfig.size === size.value }"
              @tap="webConfig.size = size.value"
            >
              <text class="size-name">{{ size.label }}</text>
              <text class="size-desc">{{ size.desc }}</text>
            </view>
          </view>
        </view>

        <!-- 主题选择 -->
        <view class="form-group">
          <text class="form-label">外观主题</text>
          <view class="theme-options">
            <view
              class="theme-option"
              :class="{ active: webConfig.theme === 'light' }"
              @tap="webConfig.theme = 'light'"
            >
              <view class="theme-preview light-preview">
                <view class="preview-header"></view>
                <view class="preview-body"></view>
              </view>
              <text>浅色</text>
            </view>
            <view
              class="theme-option"
              :class="{ active: webConfig.theme === 'dark' }"
              @tap="webConfig.theme = 'dark'"
            >
              <view class="theme-preview dark-preview">
                <view class="preview-header"></view>
                <view class="preview-body"></view>
              </view>
              <text>深色</text>
            </view>
          </view>
        </view>

        <!-- 显示选项 -->
        <view class="form-group">
          <text class="form-label">显示选项</text>
          <view class="switch-row">
            <text>显示头部</text>
            <switch
              :checked="webConfig.showHeader"
              @change="webConfig.showHeader = $event.detail.value"
            />
          </view>
          <view class="switch-row">
            <text>显示底部按钮</text>
            <switch
              :checked="webConfig.showFooter"
              @change="webConfig.showFooter = $event.detail.value"
            />
          </view>
        </view>

        <!-- 宝宝选择 -->
        <view class="form-group">
          <text class="form-label">关联宝宝</text>
          <picker
            :range="babies"
            range-key="name"
            @change="onBabyChange"
            :value="currentBabyIndex"
          >
            <view class="picker-value">
              {{ currentBabyName || '请选择宝宝' }}
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <!-- 预览 -->
        <view class="form-group">
          <text class="form-label">预览效果</text>
          <view class="preview-container">
            <view 
              class="preview-widget"
              :class="webConfig.theme"
              :style="previewStyle"
            >
              <view v-if="webConfig.showHeader" class="preview-header">
                <text>🌟 {{ currentBabyName || '宝宝' }}</text>
                <text>🔥 {{ widgetData.totalPoints }}积分</text>
              </view>
              <view class="preview-body">
                <view class="preview-progress">
                  <view class="progress-bar">
                    <view 
                      class="progress-fill"
                      :style="{ width: progressPercent + '%' }"
                    ></view>
                  </view>
                  <text class="progress-text">
                    已完成 {{ widgetData.completedCount }}/{{ widgetData.tasks.length }}
                  </text>
                </view>
                <view 
                  v-for="task in widgetData.tasks.slice(0, 3)"
                  :key="task.id"
                  class="preview-task"
                  :class="{ completed: task.completed }"
                >
                  <text class="task-icon">{{ getCategoryIcon(task.category) }}</text>
                  <view class="task-info">
                    <text class="task-title">{{ task.title }}</text>
                    <text class="task-points">+{{ task.rewardPoints }}积分</text>
                  </view>
                  <view class="task-check">{{ task.completed ? '✓' : '' }}</view>
                </view>
              </view>
              <view v-if="webConfig.showFooter" class="preview-footer">
                <view class="btn primary">快速打卡</view>
                <view class="btn secondary">查看全部</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 嵌入代码 -->
        <view class="form-group">
          <text class="form-label">嵌入代码</text>
          <view class="code-block" @tap="copyCode">
            <text class="code-text">{{ embedCode }}</text>
          </view>
          <view class="action-btn" @tap="copyCode">
            {{ copyText }}
          </view>
        </view>
      </view>
    </view>

    <!-- 小程序Widget设置 -->
    <view v-if="activeTab === 'miniapp'" class="tab-content">
      <view class="section">
        <view class="section-title">小程序生态</view>
        <view class="section-desc">
          微信/支付宝小程序版本，扫码即可使用
        </view>
        
        <view class="miniapp-list">
          <view class="miniapp-item">
            <text class="miniapp-icon">💼</text>
            <view class="miniapp-info">
              <text class="miniapp-name">微信小程序</text>
              <text class="miniapp-desc">微信内扫码使用</text>
            </view>
            <view class="action-btn small" @tap="showWechatQR">
              获取码
            </view>
          </view>
          <view class="miniapp-item">
            <text class="miniapp-icon">💳</text>
            <view class="miniapp-info">
              <text class="miniapp-name">支付宝小程序</text>
              <text class="miniapp-desc">支付宝内扫码使用</text>
            </view>
            <view class="action-btn small" @tap="showAlipayQR">
              获取码
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Toast提示 -->
    <view v-if="showToast" class="toast">
      <text>{{ toastMessage }}</text>
    </view>
  </view>
</template>

<script>
/**
 * Widget配置页面
 * 支持iOS/Android/Web Widget配置和小程序入口
 */
export default {
  data() {
    return {
      // Tab配置
      activeTab: 'web',
      tabs: [
        { key: 'web', label: 'Web组件' },
        { key: 'ios', label: 'iOS' },
        { key: 'android', label: 'Android' },
        { key: 'miniapp', label: '小程序' }
      ],
      
      // Web Widget配置
      webConfig: {
        size: 'standard',
        theme: 'light',
        showHeader: true,
        showFooter: true,
        babyId: null
      },
      
      // 尺寸选项
      sizeOptions: [
        { value: 'compact', label: '紧凑', desc: '280×200' },
        { value: 'standard', label: '标准', desc: '320×400' },
        { value: 'large', label: '大屏', desc: '400×500' }
      ],
      
      // 宝宝列表
      babies: [
        { id: '1', name: '小明' },
        { id: '2', name: '小红' }
      ],
      currentBabyIndex: 0,
      
      // Widget数据
      widgetData: {
        babyName: '小明',
        totalPoints: 100,
        completedCount: 2,
        tasks: [
          { id: '1', title: '完成数学作业', category: 'study', rewardPoints: 10, completed: false },
          { id: '2', title: '户外运动30分钟', category: 'exercise', rewardPoints: 15, completed: true },
          { id: '3', title: '整理房间', category: 'habit', rewardPoints: 5, completed: true }
        ]
      },
      
      // UI状态
      copyText: '复制代码',
      showToast: false,
      toastMessage: ''
    };
  },
  
  computed: {
    currentBabyName() {
      return this.babies[this.currentBabyIndex]?.name || '';
    },
    
    progressPercent() {
      const total = this.widgetData.tasks.length;
      if (total === 0) return 0;
      return Math.round(this.widgetData.completedCount / total * 100);
    },
    
    previewStyle() {
      const sizes = {
        compact: { width: '280px', height: '200px' },
        standard: { width: '320px', height: '400px' },
        large: { width: '400px', height: '500px' }
      };
      return sizes[this.webConfig.size] || sizes.standard;
    },
    
    embedCode() {
      const code = `<!-- Little Leaders Widget -->
<div id="little-leaders-widget-container" style="position: fixed; right: 20px; bottom: 20px; z-index: 999999;"></div>

<script>
(function() {
  var widget = document.createElement('little-leaders-web-widget');
  widget.setAttribute('size', '${this.webConfig.size}');
  widget.setAttribute('theme', '${this.webConfig.theme}');
  widget.setAttribute('show-header', '${this.webConfig.showHeader}');
  widget.setAttribute('show-footer', '${this.webConfig.showFooter}');
  ${this.webConfig.babyId ? `widget.setAttribute('baby-id', '${this.webConfig.babyId}');` : ''}
  
  var container = document.getElementById('little-leaders-widget-container');
  (container || document.body).appendChild(widget);
  
  widget.addEventListener('little-leaders:task-checkin', function(e) {
    console.log('Task checkin:', e.detail);
  });
  
  widget.addEventListener('little-leaders:quick-checkin', function(e) {
    console.log('Quick checkin:', e.detail);
  });
})();
<\/script>`;
      return code;
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    onBabyChange(e) {
      this.currentBabyIndex = e.detail.value;
      this.webConfig.babyId = this.babies[this.currentBabyIndex]?.id;
      this.widgetData.babyName = this.babies[this.currentBabyIndex]?.name;
    },
    
    getCategoryIcon(category) {
      const icons = {
        study: '📚',
        exercise: '🏃',
        habit: '✨'
      };
      return icons[category] || '📝';
    },
    
    generateIOSCode() {
      this.showToastMessage('iOS Widget代码已复制');
    },
    
    generateAndroidCode() {
      this.showToastMessage('Android Widget代码已复制');
    },
    
    copyCode() {
      // #ifdef H5
      uni.setClipboardData({
        data: this.embedCode,
        success: () => {
          this.copyText = '已复制!';
          setTimeout(() => {
            this.copyText = '复制代码';
          }, 2000);
        }
      });
      // #endif
    },
    
    showWechatQR() {
      uni.previewImage({
        urls: ['/static/qr-wechat.png'],
        current: 0
      });
    },
    
    showAlipayQR() {
      uni.previewImage({
        urls: ['/static/qr-alipay.png'],
        current: 0
      });
    },
    
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 2000);
    }
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
}

.nav-left, .nav-right {
  width: 60px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
}

.icon {
  font-size: 18px;
}

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #2196F3;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: #2196F3;
  border-radius: 1px;
}

.tab-content {
  padding: 16px;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.info-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 10px;
}

.size-options {
  display: flex;
  gap: 10px;
}

.size-option {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
  border: 2px solid transparent;
}

.size-option.active {
  border-color: #2196F3;
  background: #E3F2FD;
}

.size-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.size-desc {
  font-size: 12px;
  color: #666;
}

.theme-options {
  display: flex;
  gap: 16px;
}

.theme-option {
  flex: 1;
  text-align: center;
  cursor: pointer;
}

.theme-option.active .theme-preview {
  border-color: #2196F3;
}

.theme-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  border: 2px solid #ddd;
  overflow: hidden;
  margin-bottom: 8px;
}

.light-preview {
  background: #fff;
}

.dark-preview {
  background: #1E1E1E;
}

.preview-header {
  height: 24px;
  background: #2196F3;
}

.dark-preview .preview-header {
  background: #333;
}

.preview-body {
  height: 56px;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.switch-row:last-child {
  border-bottom: none;
}

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.arrow {
  color: #999;
  font-size: 12px;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: auto;
}

.preview-widget {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.preview-widget.light {
  background: #fff;
  border: 1px solid #E0E0E0;
}

.preview-widget.dark {
  background: #1E1E1E;
  border: 1px solid #333;
}

.preview-widget .preview-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: 12px;
  color: #fff;
}

.preview-widget.dark .preview-header {
  background: #333;
}

.preview-widget .preview-body {
  flex: 1;
  padding: 12px;
}

.preview-progress {
  margin-bottom: 12px;
}

.progress-bar {
  height: 6px;
  background: #E0E0E0;
  border-radius: 3px;
}

.preview-widget.dark .progress-bar {
  background: #333;
}

.progress-fill {
  height: 100%;
  background: #2196F3;
  border-radius: 3px;
}

.progress-text {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}

.preview-widget.dark .progress-text {
  color: #999;
}

.preview-task {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 6px;
}

.preview-widget.dark .preview-task {
  background: #2D2D2D;
}

.preview-task.completed {
  opacity: 0.7;
}

.task-icon {
  font-size: 18px;
  margin-right: 8px;
}

.task-info {
  flex: 1;
}

.task-title {
  display: block;
  font-size: 12px;
}

.task-points {
  font-size: 10px;
  color: #FF9800;
}

.task-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.preview-task.completed .task-check {
  background: #4CAF50;
  color: #fff;
}

.preview-footer {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #eee;
}

.preview-widget.dark .preview-footer {
  border-top-color: #333;
}

.btn {
  flex: 1;
  padding: 8px;
  text-align: center;
  border-radius: 6px;
  font-size: 12px;
}

.btn.primary {
  background: #2196F3;
  color: #fff;
}

.btn.secondary {
  background: transparent;
  border: 1px solid #2196F3;
  color: #2196F3;
}

.code-block {
  background: #1E1E1E;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.code-text {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #A5D6A7;
  white-space: pre-wrap;
  word-break: break-all;
}

.action-btn {
  text-align: center;
  padding: 12px;
  background: #2196F3;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
}

.action-btn.primary {
  background: #2196F3;
}

.action-btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.miniapp-list {
  margin-top: 16px;
}

.miniapp-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.miniapp-icon {
  font-size: 32px;
  margin-right: 12px;
}

.miniapp-info {
  flex: 1;
}

.miniapp-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.miniapp-desc {
  font-size: 12px;
  color: #666;
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  z-index: 9999;
}
</style>
