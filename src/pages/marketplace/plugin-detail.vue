<template>
  <view class="plugin-detail-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="nav-title">
        <text>插件详情</text>
      </view>
      <view class="nav-right">
        <text class="icon-share" @tap="sharePlugin">分享</text>
      </view>
    </view>

    <!-- 插件信息头部 -->
    <view class="plugin-header">
      <image 
        class="plugin-icon" 
        :src="plugin?.icon || '/static/default-plugin.png'" 
        mode="aspectFill"
      />
      <view class="plugin-title-section">
        <view class="plugin-title-row">
          <text class="plugin-name">{{ plugin?.name }}</text>
          <view v-if="isInstalled" class="status-badge installed">
            <text>{{ plugin.builtIn ? '内置' : '已安装' }}</text>
          </view>
        </view>
        <text class="plugin-author">by {{ plugin?.author }}</text>
        <view class="plugin-rating">
          <text class="stars">★★★★★</text>
          <text class="rating-value">{{ plugin?.rating }}</text>
          <text class="review-count">({{ plugin?.reviewCount }}条评价)</text>
        </view>
      </view>
    </view>

    <!-- 插件统计 -->
    <view class="plugin-stats">
      <view class="stat-item">
        <text class="stat-value">{{ formatDownloads(plugin?.downloads) }}</text>
        <text class="stat-label">下载</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ plugin?.size }}</text>
        <text class="stat-label">大小</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">v{{ plugin?.version }}</text>
        <text class="stat-label">版本</text>
      </view>
    </view>

    <!-- 截图预览 -->
    <view v-if="plugin?.screenshots?.length" class="section screenshots-section">
      <text class="section-title">截图预览</text>
      <scroll-view class="screenshots-scroll" scroll-x>
        <image 
          v-for="(shot, idx) in plugin.screenshots" 
          :key="idx"
          class="screenshot-img"
          :src="shot"
          mode="aspectFill"
          @tap="previewImage(shot)"
        />
      </scroll-view>
    </view>

    <!-- 插件描述 -->
    <view class="section description-section">
      <text class="section-title">插件介绍</text>
      <text class="description-text">{{ plugin?.description }}</text>
    </view>

    <!-- 插件功能 -->
    <view class="section features-section">
      <text class="section-title">功能特点</text>
      <view class="feature-list">
        <view v-for="(feature, idx) in pluginFeatures" :key="idx" class="feature-item">
          <text class="feature-icon">✓</text>
          <text class="feature-text">{{ feature }}</text>
        </view>
      </view>
    </view>

    <!-- 插件设置 (仅已安装的插件) -->
    <view v-if="isInstalled && hasSettings" class="section settings-section">
      <text class="section-title">插件设置</text>
      <view class="settings-list">
        <view class="setting-item" @tap="openSettings">
          <text class="setting-label">偏好设置</text>
          <text class="setting-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-left">
        <button 
          v-if="isInstalled && !plugin?.builtIn"
          :class="['action-btn', 'uninstall', isEnabled ? 'enabled' : '']"
          @tap="togglePlugin"
        >
          {{ isEnabled ? '禁用插件' : '启用插件' }}
        </button>
      </view>
      <view class="action-right">
        <button 
          v-if="isInstalled && !plugin?.builtIn"
          class="action-btn uninstall-full"
          @tap="confirmUninstall"
        >
          卸载
        </button>
        <button 
          v-else-if="!isInstalled"
          class="action-btn install"
          :disabled="installing"
          @tap="installPlugin"
        >
          {{ installing ? '安装中...' : '安装插件' }}
        </button>
        <button 
          v-else-if="isInstalled && plugin?.builtIn"
          class="action-btn builtin"
          disabled
        >
          内置插件
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getPlugin,
  isPluginInstalled,
  isPluginEnabled,
  installPlugin,
  uninstallPlugin,
  enablePlugin,
  disablePlugin,
  getPluginSettings
} from '@/services/pluginManager.js';

export default {
  data() {
    return {
      pluginId: '',
      plugin: null,
      installing: false,
      uninstalling: false
    };
  },
  computed: {
    isInstalled() {
      return isPluginInstalled(this.pluginId);
    },
    isEnabled() {
      return isPluginEnabled(this.pluginId);
    },
    hasSettings() {
      // 根据插件类型判断是否有设置
      return this.plugin?.type === 'feature';
    },
    pluginFeatures() {
      // 模拟功能列表
      const features = {
        'math-game': ['口算练习', '数学游戏', '进度追踪', '成就系统'],
        'drawing-board': ['自由绘画', '颜色选择', '画笔工具', '作品保存'],
        'music-player': ['音乐播放', '定时关闭', '播放列表', '睡眠模式'],
        'reading-record': ['阅读记录', '书籍管理', '阅读统计', '推荐书单']
      };
      return features[this.pluginId] || ['功能模块化', '按需加载', '主题适配'];
    }
  },
  onLoad(options) {
    if (options.id) {
      this.pluginId = options.id;
      this.loadPlugin();
    }
  },
  methods: {
    loadPlugin() {
      this.plugin = getPlugin(this.pluginId);
      if (!this.plugin) {
        uni.showToast({ title: '插件不存在', icon: 'none' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    goBack() {
      uni.navigateBack();
    },
    sharePlugin() {
      uni.showToast({ title: '分享功能', icon: 'none' });
    },
    formatDownloads(num) {
      if (!num) return '0';
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toString();
    },
    previewImage(url) {
      uni.previewImage({
        urls: this.plugin?.screenshots || [url],
        current: url
      });
    },
    async installPlugin() {
      if (!this.plugin) return;
      
      this.installing = true;
      uni.showLoading({ title: '安装中...' });
      
      try {
        const result = await installPlugin(this.plugin);
        uni.hideLoading();
        
        if (result.success) {
          uni.showToast({ title: '安装成功', icon: 'success' });
          this.$forceUpdate();
        } else {
          uni.showToast({ title: result.message, icon: 'none' });
        }
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '安装失败', icon: 'none' });
      } finally {
        this.installing = false;
      }
    },
    confirmUninstall() {
      uni.showModal({
        title: '确认卸载',
        content: `确定要卸载 "${this.plugin?.name}" 吗？`,
        success: (res) => {
          if (res.confirm) {
            this.uninstallPlugin();
          }
        }
      });
    },
    async uninstallPlugin() {
      this.uninstalling = true;
      const result = uninstallPlugin(this.pluginId);
      
      if (result.success) {
        uni.showToast({ title: '已卸载', icon: 'success' });
        this.$forceUpdate();
      } else {
        uni.showToast({ title: result.message, icon: 'none' });
      }
      
      this.uninstalling = false;
    },
    togglePlugin() {
      if (this.isEnabled) {
        disablePlugin(this.pluginId);
        uni.showToast({ title: '已禁用', icon: 'none' });
      } else {
        enablePlugin(this.pluginId);
        uni.showToast({ title: '已启用', icon: 'none' });
      }
      this.$forceUpdate();
    },
    openSettings() {
      const settings = getPluginSettings(this.pluginId);
      uni.showToast({ title: '设置页面开发中', icon: 'none' });
    }
  }
};
</script>

<style scoped>
.plugin-detail-page {
  min-height: 100vh;
  background-color: var(--bg-main, #f5f5f5);
  padding-bottom: 140rpx;
}

/* 导航栏 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: var(--bg-card, #ffffff);
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.nav-back,
.nav-right {
  width: 80rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
}

.icon-back {
  font-size: 40rpx;
  color: var(--text-main, #333333);
}

.icon-share {
  font-size: 28rpx;
  color: var(--primary-color, #4a3aff);
}

/* 插件头部 */
.plugin-header {
  display: flex;
  padding: 40rpx 30rpx;
  background-color: var(--bg-card, #ffffff);
}

.plugin-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
  background-color: var(--bg-input, #f0f0f0);
  margin-right: 30rpx;
  flex-shrink: 0;
}

.plugin-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.plugin-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.plugin-name {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-main, #333333);
  margin-right: 16rpx;
}

.status-badge {
  padding: 6rpx 16rpx;
  font-size: 22rpx;
  border-radius: 8rpx;
}

.status-badge.installed {
  background-color: #e8f5e9;
  color: #4caf50;
}

.plugin-author {
  font-size: 26rpx;
  color: var(--text-tertiary, #999999);
  margin-bottom: 12rpx;
}

.plugin-rating {
  display: flex;
  align-items: center;
}

.stars {
  font-size: 24rpx;
  color: #ffaa00;
  margin-right: 8rpx;
}

.rating-value {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-right: 8rpx;
}

.review-count {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
}

/* 统计信息 */
.plugin-stats {
  display: flex;
  padding: 30rpx;
  background-color: var(--bg-card, #ffffff);
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
}

/* 通用区块 */
.section {
  padding: 30rpx;
  background-color: var(--bg-card, #ffffff);
  margin-top: 20rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-bottom: 20rpx;
}

/* 截图 */
.screenshots-scroll {
  white-space: nowrap;
}

.screenshot-img {
  display: inline-block;
  width: 300rpx;
  height: 500rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  background-color: var(--bg-input, #f0f0f0);
}

/* 描述 */
.description-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: var(--text-secondary, #666666);
}

/* 功能特点 */
.feature-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.feature-icon {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background-color: #e8f5e9;
  color: #4caf50;
  border-radius: 50%;
  margin-right: 16rpx;
  font-size: 24rpx;
}

.feature-text {
  font-size: 28rpx;
  color: var(--text-secondary, #666666);
}

/* 设置 */
.settings-list {
  background-color: var(--bg-input, #f5f5f5);
  border-radius: 12rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
}

.setting-label {
  font-size: 28rpx;
  color: var(--text-main, #333333);
}

.setting-arrow {
  font-size: 28rpx;
  color: var(--text-tertiary, #999999);
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: var(--bg-card, #ffffff);
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.action-left,
.action-right {
  flex: 1;
  display: flex;
}

.action-right {
  justify-content: flex-end;
}

.action-btn {
  padding: 24rpx 48rpx;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  background-color: var(--bg-input, #f0f0f0);
  color: var(--text-secondary, #666666);
}

.action-btn.install {
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
}

.action-btn.uninstall {
  background-color: var(--bg-input, #f0f0f0);
  color: var(--text-secondary, #666666);
}

.action-btn.uninstall-full {
  background-color: #ff5252;
  color: #ffffff;
  margin-left: 20rpx;
}

.action-btn.enabled {
  background-color: #fff3e0;
  color: #ff9800;
}

.action-btn.builtin {
  background-color: #e3f2fd;
  color: #2196f3;
}

.action-btn[disabled] {
  opacity: 0.6;
}
</style>
