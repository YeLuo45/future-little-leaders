<template>
  <view class="plugin-manager-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="nav-title">
        <text>插件管理</text>
      </view>
      <view class="nav-right">
        <text class="icon-add" @tap="goToMarketplace">市场</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="stat-card">
        <text class="stat-num">{{ installedCount }}</text>
        <text class="stat-label">已安装</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ enabledCount }}</text>
        <text class="stat-label">已启用</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ builtInCount }}</text>
        <text class="stat-label">内置</text>
      </view>
    </view>

    <!-- 已安装插件列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">我的插件</text>
        <text class="section-hint">点击插件进入详情</text>
      </view>

      <view v-if="installedPlugins.length > 0" class="plugin-list">
        <view 
          v-for="plugin in installedPlugins" 
          :key="plugin.id"
          :class="['plugin-item', { disabled: !isEnabled(plugin.id) }]"
          @tap="goToDetail(plugin)"
        >
          <image 
            class="plugin-icon" 
            :src="plugin.icon || '/static/default-plugin.png'" 
            mode="aspectFill"
          />
          <view class="plugin-info">
            <view class="plugin-name-row">
              <text class="plugin-name">{{ plugin.name }}</text>
              <view v-if="plugin.builtIn" class="builtin-tag">内置</view>
            </view>
            <text class="plugin-version">v{{ plugin.version }}</text>
            <text class="plugin-desc">{{ plugin.description }}</text>
          </view>
          <view class="plugin-toggle">
            <switch 
              :checked="isEnabled(plugin.id)"
              :disabled="plugin.builtIn"
              @change="togglePlugin(plugin.id)"
              color="#4a3aff"
            />
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无已安装插件</text>
        <button class="empty-btn" @tap="goToMarketplace">去市场发现</button>
      </view>
    </view>

    <!-- 插件设置 -->
    <view v-if="hasEnabledPlugins" class="section">
      <view class="section-header">
        <text class="section-title">快速设置</text>
      </view>
      <view class="quick-settings">
        <view class="setting-row" @tap="openGlobalSettings">
          <text class="setting-icon">⚙️</text>
          <text class="setting-text">全局插件设置</text>
          <text class="setting-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="footer-hint">
      <text>💡 内置插件无法卸载，但可以禁用以提升性能</text>
    </view>
  </view>
</template>

<script>
import { 
  getAllPlugins,
  getEnabledPluginIds,
  isPluginEnabled,
  enablePlugin,
  disablePlugin,
  uninstallPlugin
} from '@/services/pluginManager.js';

export default {
  data() {
    return {
      allPlugins: {},
      enabledPluginIds: [],
      refreshing: false
    };
  },
  computed: {
    installedPlugins() {
      return Object.values(this.allPlugins);
    },
    installedCount() {
      return this.installedPlugins.length;
    },
    enabledCount() {
      return this.enabledPluginIds.length;
    },
    builtInCount() {
      return this.installedPlugins.filter(p => p.builtIn).length;
    },
    hasEnabledPlugins() {
      return this.enabledCount > 0;
    }
  },
  onLoad() {
    this.loadPlugins();
  },
  onShow() {
    this.refreshData();
  },
  methods: {
    loadPlugins() {
      this.allPlugins = getAllPlugins();
      this.enabledPluginIds = getEnabledPluginIds();
    },
    refreshData() {
      this.loadPlugins();
    },
    isEnabled(pluginId) {
      return isPluginEnabled(pluginId);
    },
    togglePlugin(pluginId) {
      const plugin = this.allPlugins[pluginId];
      if (!plugin) return;
      
      if (plugin.builtIn) {
        uni.showToast({ title: '内置插件无法禁用', icon: 'none' });
        return;
      }
      
      if (this.isEnabled(pluginId)) {
        disablePlugin(pluginId);
        uni.showToast({ title: '已禁用', icon: 'none' });
      } else {
        enablePlugin(pluginId);
        uni.showToast({ title: '已启用', icon: 'none' });
      }
      
      this.enabledPluginIds = getEnabledPluginIds();
    },
    confirmUninstall(plugin) {
      if (plugin.builtIn) {
        uni.showToast({ title: '内置插件无法卸载', icon: 'none' });
        return;
      }
      
      uni.showModal({
        title: '确认卸载',
        content: `确定要卸载「${plugin.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.uninstallPlugin(plugin.id);
          }
        }
      });
    },
    uninstallPlugin(pluginId) {
      const result = uninstallPlugin(pluginId);
      if (result.success) {
        uni.showToast({ title: '已卸载', icon: 'success' });
        this.loadPlugins();
      } else {
        uni.showToast({ title: result.message, icon: 'none' });
      }
    },
    goToDetail(plugin) {
      uni.navigateTo({
        url: `/pages/marketplace/plugin-detail?id=${plugin.id}`
      });
    },
    goToMarketplace() {
      uni.navigateTo({
        url: '/pages/marketplace/marketplace'
      });
    },
    openGlobalSettings() {
      uni.showToast({ title: '全局设置开发中', icon: 'none' });
    },
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.plugin-manager-page {
  min-height: 100vh;
  background-color: var(--bg-main, #f5f5f5);
  padding-bottom: 40rpx;
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

.icon-add {
  font-size: 28rpx;
  color: var(--primary-color, #4a3aff);
}

/* 统计卡片 */
.stats-overview {
  display: flex;
  padding: 30rpx;
  background-color: var(--bg-card, #ffffff);
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--primary-color, #4a3aff);
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
}

/* 插件列表区块 */
.section {
  padding: 30rpx;
  background-color: var(--bg-card, #ffffff);
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
}

.section-hint {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
}

/* 插件项 */
.plugin-list {
  margin-top: 10rpx;
}

.plugin-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: var(--bg-input, #f5f5f5);
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.plugin-item.disabled {
  opacity: 0.6;
}

.plugin-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  background-color: var(--bg-card, #ffffff);
  margin-right: 20rpx;
  flex-shrink: 0;
}

.plugin-info {
  flex: 1;
  min-width: 0;
}

.plugin-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.plugin-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-right: 12rpx;
}

.builtin-tag {
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  background-color: #e3f2fd;
  color: #2196f3;
  border-radius: 8rpx;
}

.plugin-version {
  display: block;
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
  margin-bottom: 8rpx;
}

.plugin-desc {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary, #666666);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plugin-toggle {
  margin-left: 20rpx;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  display: block;
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: var(--text-tertiary, #999999);
  margin-bottom: 30rpx;
}

.empty-btn {
  display: inline-block;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
  border-radius: 40rpx;
  border: none;
}

/* 快速设置 */
.quick-settings {
  background-color: var(--bg-input, #f5f5f5);
  border-radius: 12rpx;
}

.setting-row {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
}

.setting-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.setting-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-main, #333333);
}

.setting-arrow {
  font-size: 28rpx;
  color: var(--text-tertiary, #999999);
}

/* 底部提示 */
.footer-hint {
  text-align: center;
  padding: 30rpx;
}

.footer-hint text {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
}
</style>
