<!-- 家长成长学院首页 -->
<template>
  <view class="academy-home">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">家长成长学院</text>
      <view class="nav-right"></view>
    </view>

    <!-- 学习进度卡片 -->
    <LearningProgress :stats="store.learningStats" />

    <!-- 快捷入口 -->
    <view class="quick-entry">
      <view class="entry-card" @tap="navigateTo('knowledge')">
        <view class="entry-icon" style="background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);">
          <text>📚</text>
        </view>
        <view class="entry-info">
          <text class="entry-title">知识库</text>
          <text class="entry-desc">分龄养育指南</text>
        </view>
        <text class="entry-arrow">›</text>
      </view>

      <view class="entry-card" @tap="navigateTo('courses')">
        <view class="entry-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);">
          <text>🎬</text>
        </view>
        <view class="entry-info">
          <text class="entry-title">视频课程</text>
          <text class="entry-desc">专家精品课</text>
        </view>
        <text class="entry-arrow">›</text>
      </view>

      <view class="entry-card" @tap="navigateTo('qa')">
        <view class="entry-icon" style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%);">
          <text>💬</text>
        </view>
        <view class="entry-info">
          <text class="entry-title">专家问答</text>
          <text class="entry-desc">一对一解答</text>
        </view>
        <text class="entry-arrow">›</text>
      </view>
    </view>

    <!-- 推荐文章 -->
    <view class="section">
      <view class="section-header" @tap="navigateTo('knowledge')">
        <text class="section-title">推荐阅读</text>
        <text class="section-more">查看全部 ›</text>
      </view>

      <view class="article-list">
        <ArticleCard
          v-for="(article, index) in recommendedArticles"
          :key="article.id"
          :article="article"
          :style="{ animationDelay: `${index * 100}ms` }"
          @click="goToArticle(article.id)"
        />
      </view>
    </view>

    <!-- 热门课程 -->
    <view class="section">
      <view class="section-header" @tap="navigateTo('courses')">
        <text class="section-title">热门课程</text>
        <text class="section-more">查看全部 ›</text>
      </view>

      <scroll-view scroll-x class="course-scroll">
        <view class="course-list">
          <CourseCard
            v-for="(course, index) in popularCourses"
            :key="course.id"
            :course="course"
            :style="{ animationDelay: `${index * 100}ms` }"
            @click="goToCourse(course.id)"
          />
        </view>
      </scroll-view>
    </view>

    <!-- 热门问答 -->
    <view class="section">
      <view class="section-header" @tap="navigateTo('qa')">
        <text class="section-title">热门问答</text>
        <text class="section-more">查看全部 ›</text>
      </view>

      <view class="qa-list">
        <view
          v-for="(question, index) in popularQuestions"
          :key="question.id"
          class="qa-item"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <view class="qa-category-tag" :class="question.category">
            {{ question.category }}
          </view>
          <text class="qa-title">{{ question.title }}</text>
          <view class="qa-meta">
            <text class="qa-expert">👤 {{ question.expert }}</text>
            <text class="qa-date">{{ question.answerDate }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAcademyStore } from '@/stores/academyStore.js'
import LearningProgress from '@/components/academy/LearningProgress.vue'
import ArticleCard from '@/components/academy/ArticleCard.vue'
import CourseCard from '@/components/academy/CourseCard.vue'

const store = useAcademyStore()

const recommendedArticles = computed(() => store.articles.slice(0, 3))
const popularCourses = computed(() => store.courses.slice(0, 4))
const popularQuestions = computed(() => store.questions.slice(0, 3))

onMounted(async () => {
  await Promise.all([
    store.loadArticles(),
    store.loadCourses(),
    store.loadQuestions()
  ])
})

function goBack() {
  uni.navigateBack()
}

function navigateTo(section) {
  const routes = {
    knowledge: '/pages/academy/article',
    courses: '/pages/academy/course',
    qa: '/pages/academy/qa'
  }
  uni.navigateTo({ url: routes[section] })
}

function goToArticle(id) {
  uni.navigateTo({ url: `/pages/academy/article?id=${id}` })
}

function goToCourse(id) {
  uni.navigateTo({ url: `/pages/academy/course?id=${id}` })
}
</script>

<style scoped>
.academy-home {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E5E7EB;
}

.nav-left, .nav-right {
  width: 80rpx;
}

.icon {
  font-size: 40rpx;
  color: #1F2937;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
}

.quick-entry {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.entry-card {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.entry-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  flex-shrink: 0;
}

.entry-info {
  flex: 1;
  margin-left: 24rpx;
}

.entry-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 6rpx;
}

.entry-desc {
  font-size: 24rpx;
  color: #6B7280;
}

.entry-arrow {
  font-size: 40rpx;
  color: #9CA3AF;
}

.section {
  padding: 24rpx 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1F2937;
}

.section-more {
  font-size: 26rpx;
  color: #6B7280;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.course-scroll {
  width: 100%;
  white-space: nowrap;
}

.course-list {
  display: inline-flex;
  gap: 20rpx;
  padding-right: 32rpx;
}

.qa-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.qa-item {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.qa-category-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.qa-category-tag.发育 {
  background: #FEF3C7;
  color: #D97706;
}

.qa-category-tag.心理 {
  background: #DBEAFE;
  color: #2563EB;
}

.qa-category-tag.教育 {
  background: #D1FAE5;
  color: #059669;
}

.qa-category-tag.营养 {
  background: #FEE2E2;
  color: #DC2626;
}

.qa-title {
  font-size: 28rpx;
  color: #1F2937;
  line-height: 1.5;
  display: block;
  margin-bottom: 12rpx;
}

.qa-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qa-expert, .qa-date {
  font-size: 22rpx;
  color: #6B7280;
}
</style>
