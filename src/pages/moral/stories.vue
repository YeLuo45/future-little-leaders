<template>
  <view class="moral-stories-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">品德故事</text>
      <view class="nav-right"></view>
    </view>

    <!-- 标签筛选 -->
    <view class="filter-tabs">
      <view 
        class="tab-item" 
        :class="{ active: selectedType === null }"
        @tap="filterByType(null)"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        :class="{ active: selectedType === 'historical' }"
        @tap="filterByType('historical')"
      >
        历史人物
      </view>
      <view 
        class="tab-item" 
        :class="{ active: selectedType === 'fable' }"
        @tap="filterByType('fable')"
      >
        寓言故事
      </view>
      <view 
        class="tab-item" 
        :class="{ active: selectedType === 'hero' }"
        @tap="filterByType('hero')"
      >
        英雄故事
      </view>
      <view 
        class="tab-item" 
        :class="{ active: selectedType === 'life' }"
        @tap="filterByType('life')"
      >
        生活故事
      </view>
    </view>

    <!-- 故事列表 -->
    <scroll-view class="story-list" scroll-y>
      <view class="story-card" v-for="story in filteredStories" :key="story.id" @tap="viewStory(story)">
        <view class="story-icon">
          <text class="icon-text">{{ getStoryIcon(story.type) }}</text>
        </view>
        <view class="story-info">
          <text class="story-title">{{ story.title }}</text>
          <text class="story-desc">{{ story.description }}</text>
          <view class="story-tags">
            <text class="tag" v-for="value in story.values" :key="value" :style="{ backgroundColor: getValueColor(value) }">
              {{ getValueEmoji(value) }} {{ value }}
            </text>
          </view>
        </view>
        <view class="story-meta">
          <text class="duration">{{ story.duration }}分钟</text>
          <text class="age">{{ story.ageRange }}岁</text>
        </view>
      </view>
    </scroll-view>

    <!-- 人物传记入口 -->
    <view class="section-header" @tap="showBios = !showBios">
      <text class="section-title">品格人物传记</text>
      <text class="toggle-icon">{{ showBios ? '▼' : '▶' }}</text>
    </view>

    <view class="bio-section" v-if="showBios">
      <view class="bio-card" v-for="bio in characterBios" :key="bio.id" @tap="viewBio(bio)">
        <text class="bio-avatar">{{ bio.avatar }}</text>
        <view class="bio-info">
          <text class="bio-name">{{ bio.name }}</text>
          <text class="bio-dynasty">{{ bio.dynasty }}</text>
          <text class="bio-desc">{{ bio.description }}</text>
        </view>
      </view>
    </view>

    <!-- 故事详情弹窗 -->
    <uni-popup ref="storyPopup" type="bottom" class="story-popup">
      <view class="popup-content" v-if="currentStory">
        <view class="popup-header">
          <text class="popup-title">{{ currentStory.title }}</text>
          <text class="close-btn" @tap="closeStoryPopup">×</text>
        </view>
        <scroll-view class="popup-body" scroll-y>
          <view class="story-content">
            <text class="content-text">{{ currentStory.content }}</text>
          </view>
          <view class="story-values">
            <text class="values-title">涉及价值观：</text>
            <view class="values-list">
              <text 
                class="value-badge" 
                v-for="value in currentStory.values" 
                :key="value"
                :style="{ backgroundColor: getValueColor(value) }"
              >
                {{ getValueEmoji(value) }} {{ value }}
              </text>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { useMoralEducationStore } from '@/stores/moralEducationStore.js'
import { VALUE_EMOJIS, VALUE_COLORS, STORY_TYPES } from '@/services/moralEducationService.js'

export default {
  data() {
    return {
      selectedType: null,
      showBios: false,
      currentStory: null
    }
  },
  computed: {
    filteredStories() {
      if (!this.selectedType) {
        return this.store.stories
      }
      return this.store.stories.filter(s => s.type === this.selectedType)
    },
    characterBios() {
      return this.store.characterBios
    }
  },
  onLoad() {
    this.store.loadStories()
    this.store.loadCharacterBios()
  },
  methods: {
    store() {
      return useMoralEducationStore()
    },
    goBack() {
      uni.navigateBack()
    },
    filterByType(type) {
      this.selectedType = type
      this.store.loadStories(type)
    },
    viewStory(story) {
      this.currentStory = story
      this.$refs.storyPopup.open()
    },
    viewBio(bio) {
      uni.navigateTo({
        url: `/pages/moral/bio-detail?name=${encodeURIComponent(bio.name)}`
      })
    },
    closeStoryPopup() {
      this.$refs.storyPopup.close()
    },
    getStoryIcon(type) {
      const icons = {
        [STORY_TYPES.HISTORICAL]: '📜',
        [STORY_TYPES.FABLE]: '🐰',
        [STORY_TYPES.HERO]: '🦸',
        [STORY_TYPES.LIFE]: '🌱'
      }
      return icons[type] || '📖'
    },
    getValueEmoji(value) {
      return VALUE_EMOJIS[value] || '⭐'
    },
    getValueColor(value) {
      return VALUE_COLORS[value] || '#999999'
    }
  }
}
</script>

<style scoped>
.moral-stories-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
}

.back-btn, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn .icon {
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.filter-tabs {
  display: flex;
  padding: 20rpx;
  background-color: #ffffff;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 30rpx;
  flex-shrink: 0;
}

.tab-item.active {
  color: #ffffff;
  background-color: #8477fa;
}

.story-list {
  height: calc(100vh - 400rpx);
  padding: 20rpx;
}

.story-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.story-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: #f0f0f0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 48rpx;
}

.story-info {
  flex: 1;
  margin-left: 20rpx;
}

.story-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.story-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.story-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  font-size: 22rpx;
  color: #ffffff;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-right: 8rpx;
  margin-bottom: 4rpx;
}

.story-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.duration, .age {
  font-size: 24rpx;
  color: #999;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background-color: #ffffff;
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.toggle-icon {
  font-size: 28rpx;
  color: #999;
}

.bio-section {
  padding: 20rpx;
}

.bio-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.bio-avatar {
  font-size: 64rpx;
  width: 100rpx;
  text-align: center;
  flex-shrink: 0;
}

.bio-info {
  flex: 1;
  margin-left: 20rpx;
}

.bio-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.bio-dynasty {
  font-size: 24rpx;
  color: #8477fa;
  display: block;
  margin-bottom: 8rpx;
}

.bio-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.story-popup .popup-content {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.popup-body {
  max-height: 60vh;
  padding: 30rpx;
}

.story-content {
  margin-bottom: 30rpx;
}

.content-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
}

.story-values {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.values-title {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
}

.values-list {
  display: flex;
  flex-wrap: wrap;
}

.value-badge {
  font-size: 24rpx;
  color: #ffffff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-right: 12rpx;
  margin-bottom: 8rpx;
}
</style>
