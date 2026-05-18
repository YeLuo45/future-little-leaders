<template>
  <view class="theme-store-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="nav-title">
        <text>主题商店</text>
      </view>
      <view class="nav-right">
        <text class="icon-customize" @tap="showCustomTheme">自定义</text>
      </view>
    </view>

    <!-- 当前使用主题 -->
    <view class="current-theme-section">
      <text class="section-label">当前使用</text>
      <view class="current-theme-card">
        <view 
          class="theme-preview current" 
          :style="previewStyle(currentTheme)"
        >
          <view class="preview-header"></view>
          <view class="preview-content"></view>
        </view>
        <view class="theme-info">
          <text class="theme-name">{{ currentTheme.name }}</text>
          <text class="theme-type">{{ currentTheme.type === 'built-in' ? '内置' : '自定义' }}</text>
        </view>
        <view class="in-use-badge">
          <text>使用中</text>
        </view>
      </view>
    </view>

    <!-- 内置主题 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">内置主题</text>
      </view>
      <view class="theme-grid">
        <view 
          v-for="theme in builtInThemes" 
          :key="theme.id"
          :class="['theme-card', { active: currentThemeId === theme.id }]"
          @tap="applyTheme(theme.id)"
        >
          <view 
            class="theme-preview" 
            :style="previewStyle(theme)"
          >
            <view class="preview-header"></view>
            <view class="preview-content"></view>
          </view>
          <text class="theme-name">{{ theme.name }}</text>
          <view v-if="currentThemeId === theme.id" class="active-indicator">
            <text>✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 自定义主题 -->
    <view v-if="customThemes.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">已安装主题</text>
      </view>
      <view class="theme-grid">
        <view 
          v-for="theme in customThemes" 
          :key="theme.id"
          :class="['theme-card', { active: currentThemeId === theme.id }]"
          @tap="applyTheme(theme.id)"
        >
          <view 
            class="theme-preview" 
            :style="previewStyle(theme)"
          >
            <view class="preview-header"></view>
            <view class="preview-content"></view>
          </view>
          <text class="theme-name">{{ theme.name }}</text>
          <view v-if="currentThemeId === theme.id" class="active-indicator">
            <text>✓</text>
          </view>
          <view v-else class="uninstall-btn" @tap.stop="confirmUninstall(theme)">
            <text>×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主题推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐主题</text>
        <text class="section-more" @tap="viewMoreThemes">更多 ></text>
      </view>
      <view class="recommend-list">
        <view 
          v-for="theme in recommendedThemes" 
          :key="theme.id"
          class="recommend-card"
          @tap="previewAndInstall(theme)"
        >
          <image 
            class="recommend-preview" 
            :src="theme.preview || '/static/themes/default.png'" 
            mode="aspectFill"
          />
          <view class="recommend-info">
            <text class="recommend-name">{{ theme.name }}</text>
            <text class="recommend-desc">{{ theme.description }}</text>
          </view>
          <button class="install-btn" @tap.stop="quickInstall(theme)">安装</button>
        </view>
      </view>
    </view>

    <!-- 自定义主题提示 -->
    <view class="custom-hint">
      <text class="hint-icon">💡</text>
      <text class="hint-text">想创建专属主题？点击右上角「自定义」打造独特风格！</text>
    </view>
  </view>
</template>

<script>
import { useThemeStore, BUILT_IN_THEMES } from '@/stores/themeStore.js';

export default {
  data() {
    return {
      themeStore: null,
      currentThemeId: 'light',
      currentTheme: null,
      customThemes: []
    };
  },
  computed: {
    builtInThemes() {
      return Object.values(BUILT_IN_THEMES);
    },
    recommendedThemes() {
      // 推荐的主题（不包括已安装和当前的）
      const allThemeIds = [
        ...Object.keys(BUILT_IN_THEMES),
        ...this.customThemes.map(t => t.id)
      ];
      
      return [
        {
          id: 'cartoon',
          name: '卡通乐园',
          description: '明亮活泼的卡通风格，适合儿童',
          preview: '/static/themes/cartoon-preview.png',
          variables: {
            '--primary-color': '#ff6b9d',
            '--bg-main': '#fff9f0',
            '--text-main': '#4a3a5c'
          }
        },
        {
          id: 'festival',
          name: '节日庆典',
          description: '红金配色，节日气氛浓厚',
          preview: '/static/themes/festival-preview.png',
          variables: {
            '--primary-color': '#e53935',
            '--bg-main': '#fff8f0',
            '--text-main': '#3d3d3d'
          }
        },
        {
          id: 'ocean',
          name: '海洋蓝',
          description: '清新自然的海洋风格',
          preview: '/static/themes/ocean-preview.png',
          variables: {
            '--primary-color': '#0288d1',
            '--bg-main': '#f0f8ff',
            '--text-main': '#1a3a4a'
          }
        }
      ].filter(t => !allThemeIds.includes(t.id));
    }
  },
  onLoad() {
    this.initThemeStore();
  },
  onShow() {
    this.refreshThemes();
  },
  methods: {
    initThemeStore() {
      this.themeStore = useThemeStore();
      this.themeStore.initTheme();
      this.currentThemeId = this.themeStore.state.currentThemeId;
      this.currentTheme = this.themeStore.currentTheme;
    },
    refreshThemes() {
      if (this.themeStore) {
        this.customThemes = this.themeStore.customThemesList;
        this.currentThemeId = this.themeStore.state.currentThemeId;
        this.currentTheme = this.themeStore.currentTheme;
      }
    },
    previewStyle(theme) {
      const vars = theme.variables || {};
      return {
        '--preview-primary': vars['--primary-color'] || '#4a3aff',
        '--preview-bg': vars['--bg-main'] || '#f5f5f5',
        '--preview-text': vars['--text-main'] || '#333333'
      };
    },
    applyTheme(themeId) {
      if (this.themeStore.setTheme(themeId)) {
        this.currentThemeId = themeId;
        this.currentTheme = this.themeStore.currentTheme;
        uni.showToast({ title: '主题已切换', icon: 'success' });
      }
    },
    confirmUninstall(theme) {
      uni.showModal({
        title: '确认卸载',
        content: `确定要卸载主题「${theme.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.uninstallTheme(theme.id);
          }
        }
      });
    },
    uninstallTheme(themeId) {
      if (this.themeStore.uninstallTheme(themeId)) {
        this.refreshThemes();
        uni.showToast({ title: '已卸载', icon: 'success' });
      }
    },
    previewAndInstall(theme) {
      // 先预览效果
      this.applyTheme(theme.id);
      
      // 延迟安装确认
      setTimeout(() => {
        uni.showModal({
          title: '安装主题',
          content: `确定要安装「${theme.name}」主题吗？`,
          success: (res) => {
            if (res.confirm) {
              this.installTheme(theme);
            } else {
              // 恢复原主题
              this.applyTheme(this.themeStore.state.currentThemeId);
            }
          }
        });
      }, 300);
    },
    quickInstall(theme) {
      this.installTheme(theme);
    },
    installTheme(themeData) {
      if (this.themeStore.installTheme(themeData)) {
        this.refreshThemes();
        uni.showToast({ title: '安装成功', icon: 'success' });
      }
    },
    showCustomTheme() {
      uni.showToast({ title: '自定义主题开发中', icon: 'none' });
    },
    viewMoreThemes() {
      uni.showToast({ title: '更多主题即将上线', icon: 'none' });
    },
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.theme-store-page {
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

.icon-customize {
  font-size: 28rpx;
  color: var(--primary-color, #4a3aff);
}

/* 当前主题 */
.current-theme-section {
  padding: 30rpx;
  background-color: var(--bg-card, #ffffff);
}

.section-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
  margin-bottom: 16rpx;
}

.current-theme-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: var(--bg-input, #f5f5f5);
  border-radius: 16rpx;
}

.theme-preview {
  width: 100rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background-color: var(--preview-bg, #f5f5f5);
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border-color, #e0e0e0);
}

.theme-preview.current {
  border-color: var(--primary-color, #4a3aff);
  border-width: 3rpx;
}

.preview-header {
  height: 40rpx;
  background-color: var(--preview-primary, #4a3aff);
}

.preview-content {
  height: 100rpx;
  background: linear-gradient(to bottom, var(--preview-bg, #f5f5f5), var(--preview-text, #333333) 50%);
  opacity: 0.3;
}

.theme-info {
  flex: 1;
  margin-left: 20rpx;
}

.theme-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-bottom: 8rpx;
}

.theme-type {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
}

.in-use-badge {
  padding: 8rpx 20rpx;
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
  font-size: 24rpx;
  border-radius: 20rpx;
}

/* 通用区块 */
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

.section-more {
  font-size: 26rpx;
  color: var(--text-tertiary, #999999);
}

/* 主题网格 */
.theme-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.theme-card {
  position: relative;
  width: calc(33.333% - 20rpx);
  margin: 0 10rpx 20rpx;
  text-align: center;
}

.theme-card.active .theme-preview {
  border-color: var(--primary-color, #4a3aff);
  border-width: 3rpx;
}

.theme-card .theme-name {
  display: block;
  font-size: 26rpx;
  color: var(--text-main, #333333);
  margin-top: 12rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.uninstall-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background-color: var(--danger-color, #ff5252);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

/* 推荐列表 */
.recommend-list {
  margin-top: 10rpx;
}

.recommend-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: var(--bg-input, #f5f5f5);
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.recommend-preview {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  background-color: var(--bg-input, #e0e0e0);
}

.recommend-info {
  flex: 1;
  margin-left: 20rpx;
}

.recommend-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-bottom: 8rpx;
}

.recommend-desc {
  font-size: 24rpx;
  color: var(--text-secondary, #666666);
}

.install-btn {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
  border-radius: 30rpx;
  border: none;
}

/* 提示 */
.custom-hint {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  margin: 20rpx 30rpx;
  background-color: #fff9e6;
  border-radius: 12rpx;
}

.hint-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.hint-text {
  flex: 1;
  font-size: 26rpx;
  color: #8a6000;
}
</style>
