<!-- 文章卡片组件 -->
<template>
  <view class="article-card" :class="{ 'card-enter': isEnter }" @click="handleClick">
    <view class="card-header">
      <view class="article-icon">📖</view>
      <view class="article-info">
        <text class="article-title">{{ article.title }}</text>
        <view class="article-tags">
          <text class="tag category">{{ article.category }}</text>
          <text class="tag dimension">{{ article.dimension }}</text>
        </view>
      </view>
    </view>
    <text class="article-summary">{{ article.summary }}</text>
    <view class="card-footer">
      <text class="article-meta">{{ article.date }}</text>
      <text class="article-meta">约{{ article.readTime }}分钟</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  article: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: '文章标题',
      summary: '文章摘要...',
      category: '0-3岁',
      dimension: '语言能力',
      date: '2024-01-01',
      readTime: 5
    })
  }
})

const emit = defineEmits(['click'])

const isEnter = ref(false)

onMounted(() => {
  setTimeout(() => {
    isEnter.value = true
  }, 50)
})

function handleClick() {
  emit('click', props.article)
}
</script>

<style scoped>
.article-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(37, 99, 235, 0.06);
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.article-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
  display: block;
  margin-bottom: 8rpx;
}

.article-tags {
  display: flex;
  gap: 10rpx;
}

.tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.tag.category {
  background: #DBEAFE;
  color: #2563EB;
}

.tag.dimension {
  background: #FEF3C7;
  color: #D97706;
}

.article-summary {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.5;
  display: block;
  margin-bottom: 16rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
}

.article-meta {
  font-size: 22rpx;
  color: #9CA3AF;
}
</style>
