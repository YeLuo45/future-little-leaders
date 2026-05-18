<template>
  <view class="marketplace-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="icon-back">←</text>
      </view>
      <view class="nav-title">
        <text>插件市场</text>
      </view>
      <view class="nav-right">
        <text class="icon-search" @tap="showSearch = true">🔍</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view v-if="showSearch" class="search-bar">
      <input 
        v-model="searchKeyword" 
        class="search-input" 
        placeholder="搜索插件..."
        @confirm="handleSearch"
      />
      <text class="search-cancel" @tap="cancelSearch">取消</text>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-tabs" scroll-x>
      <view 
        v-for="tab in categoryTabs" 
        :key="tab.id"
        :class="['tab-item', { active: currentCategory === tab.id }]"
        @tap="switchCategory(tab.id)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </scroll-view>

    <!-- 精选推荐 -->
    <view v-if="!searchKeyword && currentCategory === 'all'" class="section">
      <view class="section-header">
        <text class="section-title">精选推荐</text>
        <text class="section-more" @tap="viewMore('featured')">更多 ></text>
      </view>
      <scroll-view class="featured-scroll" scroll-x>
        <view 
          v-for="plugin in featuredPlugins" 
          :key="plugin.id"
          class="featured-card"
          @tap="goToPluginDetail(plugin)"
        >
          <image 
            class="featured-image" 
            :src="plugin.icon || '/static/default-plugin.png'" 
            mode="aspectFill"
          />
          <view class="featured-info">
            <text class="featured-name">{{ plugin.name }}</text>
            <view class="featured-rating">
              <text class="stars">★★★★★</text>
              <text class="rating-text">{{ plugin.rating }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 插件列表 -->
    <scroll-view class="plugin-list" scroll-y @scrolltolower="loadMore">
      <view class="list-header">
        <text class="list-title">{{ currentCategoryName }}</text>
        <text class="list-count">{{ filteredPlugins.length }} 个插件</text>
      </view>

      <view 
        v-for="plugin in filteredPlugins" 
        :key="plugin.id"
        class="plugin-card"
        @tap="goToPluginDetail(plugin)"
      >
        <image 
          class="plugin-icon" 
          :src="plugin.icon || '/static/default-plugin.png'" 
          mode="aspectFill"
        />
        <view class="plugin-info">
          <view class="plugin-header">
            <text class="plugin-name">{{ plugin.name }}</text>
            <view v-if="isInstalled(plugin.id)" class="plugin-badge installed">
              <text>已安装</text>
            </view>
            <view v-else-if="isBuiltIn(plugin.id)" class="plugin-badge builtin">
              <text>内置</text>
            </view>
          </view>
          <text class="plugin-desc">{{ plugin.description }}</text>
          <view class="plugin-meta">
            <text class="meta-item">⭐ {{ plugin.rating }}</text>
            <text class="meta-item">{{ plugin.size }}</text>
            <text class="meta-item">📥 {{ formatDownloads(plugin.downloads) }}</text>
          </view>
        </view>
        <view class="plugin-action">
          <button 
            v-if="isInstalled(plugin.id)"
            :class="['action-btn', isEnabled(plugin.id) ? 'enabled' : 'disabled-btn']"
            @tap.stop="togglePlugin(plugin)"
          >
            {{ isEnabled(plugin.id) ? '禁用' : '启用' }}
          </button>
          <button 
            v-else
            class="action-btn install"
            @tap.stop="quickInstall(plugin)"
          >
            安装
          </button>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="noMoreData" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 底部 Tab -->
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-item', { active: currentTab === tab.id }]"
        @tap="switchTab(tab.id)"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-text">{{ tab.name }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getAllPlugins, 
  getPluginsByType, 
  searchPlugins,
  getMarketplaceFeatured,
  isPluginInstalled,
  isPluginEnabled,
  installPlugin,
  enablePlugin,
  disablePlugin
} from '@/services/pluginManager.js';

import { useThemeStore } from '@/stores/themeStore.js';

export default {
  data() {
    return {
      showSearch: false,
      searchKeyword: '',
      currentCategory: 'all',
      currentTab: 'marketplace',
      loading: false,
      noMoreData: false,
      currentPage: 1,
      pageSize: 20,
      tabs: [
        { id: 'marketplace', name: '市场', icon: '🛒' },
        { id: 'installed', name: '已安装', icon: '📦' },
        { id: 'themes', name: '主题', icon: '🎨' }
      ],
      categoryTabs: [
        { id: 'all', name: '全部' },
        { id: 'feature', name: '功能插件' },
        { id: 'theme', name: '主题' },
        { id: 'widget', name: '小组件' }
      ],
      allPluginsList: [],
      featuredPlugins: [],
      themeStore: null
    };
  },
  computed: {
    currentCategoryName() {
      const tab = this.categoryTabs.find(t => t.id === this.currentCategory);
      return tab ? tab.name : '全部';
    },
    filteredPlugins() {
      if (this.searchKeyword) {
        return searchPlugins(this.searchKeyword, this.currentCategory === 'all' ? null : this.currentCategory);
      }
      
      if (this.currentCategory === 'all') {
        return this.allPluginsList;
      }
      
      return getPluginsByType(this.currentCategory);
    }
  },
  onLoad() {
    this.initData();
  },
  methods: {
    initData() {
      // 初始化主题商店
      this.themeStore = useThemeStore();
      this.themeStore.initTheme();
      
      // 加载插件数据
      this.loadPlugins();
      this.loadFeatured();
    },
    loadPlugins() {
      const plugins = getAllPlugins();
      this.allPluginsList = Object.values(plugins);
    },
    loadFeatured() {
      this.featuredPlugins = getMarketplaceFeatured();
    },
    handleSearch() {
      if (this.searchKeyword.trim()) {
        // 搜索结果已在 computed 中处理
      }
    },
    cancelSearch() {
      this.showSearch = false;
      this.searchKeyword = '';
    },
    switchCategory(categoryId) {
      this.currentCategory = categoryId;
      this.currentPage = 1;
      this.noMoreData = false;
    },
    switchTab(tabId) {
      if (tabId === 'themes') {
        // 切换到主题商店
        uni.navigateTo({
          url: '/pages/marketplace/theme-store'
        });
        return;
      }
      if (tabId === 'installed') {
        // 切换到已安装列表
        uni.navigateTo({
          url: '/pages/marketplace/plugin-manager'
        });
        return;
      }
      this.currentTab = tabId;
    },
    goBack() {
      uni.navigateBack();
    },
    goToPluginDetail(plugin) {
      uni.navigateTo({
        url: `/pages/marketplace/plugin-detail?id=${plugin.id}`
      });
    },
    isInstalled(pluginId) {
      return isPluginInstalled(pluginId);
    },
    isBuiltIn(pluginId) {
      return plugin.builtIn || false;
    },
    isEnabled(pluginId) {
      return isPluginEnabled(pluginId);
    },
    async togglePlugin(plugin) {
      if (this.isEnabled(plugin.id)) {
        disablePlugin(plugin.id);
        uni.showToast({ title: '已禁用', icon: 'none' });
      } else {
        enablePlugin(plugin.id);
        uni.showToast({ title: '已启用', icon: 'none' });
      }
      this.$forceUpdate();
    },
    async quickInstall(plugin) {
      uni.showLoading({ title: '安装中...' });
      const result = await installPlugin(plugin);
      uni.hideLoading();
      
      if (result.success) {
        uni.showToast({ title: '安装成功', icon: 'success' });
        this.loadPlugins();
        this.loadFeatured();
      } else {
        uni.showToast({ title: result.message, icon: 'none' });
      }
    },
    formatDownloads(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toString();
    },
    loadMore() {
      if (this.noMoreData || this.loading) return;
      
      this.loading = true;
      this.currentPage++;
      
      // 模拟加载更多
      setTimeout(() => {
        this.loading = false;
        if (this.currentPage >= 3) {
          this.noMoreData = true;
        }
      }, 500);
    },
    viewMore(type) {
      if (type === 'featured') {
        this.currentCategory = 'all';
      }
    }
  }
};
</script>

<style scoped>
.marketplace-page {
  min-height: 100vh;
  background-color: var(--bg-main, #f5f5f5);
  padding-bottom: 120rpx;
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

.icon-search {
  font-size: 36rpx;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: var(--bg-card, #ffffff);
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 30rpx;
  background-color: var(--bg-input, #f0f0f0);
  border-radius: 36rpx;
  font-size: 28rpx;
}

.search-cancel {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: var(--primary-color, #4a3aff);
}

/* 分类标签 */
.category-tabs {
  white-space: nowrap;
  padding: 20rpx 30rpx;
  background-color: var(--bg-card, #ffffff);
}

.tab-item {
  display: inline-block;
  padding: 16rpx 32rpx;
  margin-right: 20rpx;
  font-size: 28rpx;
  color: var(--text-secondary, #666666);
  background-color: var(--bg-input, #f0f0f0);
  border-radius: 30rpx;
}

.tab-item.active {
  color: #ffffff;
  background-color: var(--primary-color, #4a3aff);
}

/* 精选推荐 */
.section {
  padding: 30rpx;
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

.featured-scroll {
  white-space: nowrap;
}

.featured-card {
  display: inline-block;
  width: 280rpx;
  margin-right: 20rpx;
  background-color: var(--bg-card, #ffffff);
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.featured-image {
  width: 280rpx;
  height: 200rpx;
  background-color: var(--bg-input, #f0f0f0);
}

.featured-info {
  padding: 20rpx;
}

.featured-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-bottom: 10rpx;
}

.featured-rating {
  display: flex;
  align-items: center;
}

.stars {
  font-size: 22rpx;
  color: #ffaa00;
  margin-right: 8rpx;
}

.rating-text {
  font-size: 24rpx;
  color: var(--text-secondary, #666666);
}

/* 插件列表 */
.plugin-list {
  padding: 0 30rpx;
  height: calc(100vh - 600rpx);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
}

.list-count {
  font-size: 26rpx;
  color: var(--text-tertiary, #999999);
}

.plugin-card {
  display: flex;
  padding: 24rpx;
  margin-bottom: 20rpx;
  background-color: var(--bg-card, #ffffff);
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.plugin-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background-color: var(--bg-input, #f0f0f0);
  margin-right: 20rpx;
  flex-shrink: 0;
}

.plugin-info {
  flex: 1;
  min-width: 0;
}

.plugin-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.plugin-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main, #333333);
  margin-right: 12rpx;
}

.plugin-badge {
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  border-radius: 8rpx;
}

.plugin-badge.installed {
  background-color: #e8f5e9;
  color: #4caf50;
}

.plugin-badge.builtin {
  background-color: #e3f2fd;
  color: #2196f3;
}

.plugin-desc {
  font-size: 26rpx;
  color: var(--text-secondary, #666666);
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plugin-meta {
  display: flex;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
  margin-right: 20rpx;
}

.plugin-action {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
}

.action-btn {
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  border-radius: 30rpx;
  border: none;
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
}

.action-btn.enabled {
  background-color: var(--bg-input, #f0f0f0);
  color: var(--text-secondary, #666666);
}

.action-btn.disabled-btn {
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
}

.action-btn.install {
  background-color: var(--primary-color, #4a3aff);
  color: #ffffff;
}

/* 底部加载 */
.loading-more,
.no-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: var(--text-tertiary, #999999);
}

/* 底部 Tab */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 100rpx;
  background-color: var(--bg-card, #ffffff);
  border-top: 1px solid var(--border-color, #e0e0e0);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 6rpx;
}

.tab-text {
  font-size: 24rpx;
  color: var(--text-tertiary, #999999);
}

.tab-item.active .tab-text {
  color: var(--primary-color, #4a3aff);
}
</style>
