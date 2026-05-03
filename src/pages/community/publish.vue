<template>
  <view class="page-container" :class="{'dark-mode': isDarkMode}">
    <!-- 顶部导航栏 -->
    <view class="header" :class="{'dark-mode': isDarkMode}">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">发布文章</view>
      <view class="publish-btn" @tap="publishArticle">发布</view>
    </view>
    
    <!-- 发布内容表单 -->
    <view class="publish-form" :class="{'dark-mode': isDarkMode}">
      <!-- 标题输入 -->
      <view class="form-item">
        <input 
          class="title-input" 
          :class="{'dark-mode': isDarkMode}"
          v-model="article.title"
          placeholder="请输入标题（5-30字）"
          maxlength="30"
        />
      </view>
      
      <!-- 分类选择 -->
      <view class="form-item">
        <view class="category-selector" @tap="showCategoryPicker">
          <text class="category-label" :class="{'dark-mode': isDarkMode}">选择分类</text>
          <view class="selected-category" :class="{'dark-mode': isDarkMode}">
            {{ getCategoryName(article.category) }}
            <text class="arrow-icon">▼</text>
          </view>
        </view>
      </view>
      
      <!-- 内容输入 -->
      <view class="form-item">
        <textarea 
          class="content-input" 
          :class="{'dark-mode': isDarkMode}"
          v-model="article.content"
          placeholder="分享您的经验和心得..."
          maxlength="2000"
        ></textarea>
        <view class="word-count" :class="{'dark-mode': isDarkMode}">
          {{article.content.length}}/2000
        </view>
      </view>
      
      <!-- 图片上传 -->
      <view class="form-item">
        <view class="image-upload-title" :class="{'dark-mode': isDarkMode}">添加图片</view>
        <view class="image-list">
          <view class="image-item" v-for="(image, index) in article.images" :key="index">
            <image :src="image" mode="aspectFill"></image>
            <view class="delete-btn" @tap.stop="deleteImage(index)">×</view>
          </view>
          <view class="add-image-btn" @tap="chooseImage" v-if="article.images.length < 9">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 分类选择弹出层 -->
    <view class="mask" v-if="showCategory" @tap="hideCategoryPicker"></view>
    <view class="category-popup" :class="{'dark-mode': isDarkMode, 'show': showCategory}">
      <view class="popup-header">
        <text>选择分类</text>
        <text class="close-btn" @tap="hideCategoryPicker">×</text>
      </view>
      <view class="category-list">
        <view 
          class="category-item" 
          :class="[article.category === category.id ? 'active' : '', {'dark-mode': isDarkMode}]" 
          v-for="category in categories" 
          :key="category.id"
          @tap="selectCategory(category.id)"
        >
          <text>{{category.name}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
  data() {
    return {
      isDarkMode: false,
      article: {
        title: '',
        category: '',
        content: '',
        images: []
      },
      showCategory: false,
      categories: [
        { id: 'parenting', name: '育儿经验' },
        { id: 'education', name: '教育方法' },
        { id: 'nutrition', name: '营养健康' },
        { id: 'games', name: '亲子游戏' },
        { id: 'psychology', name: '儿童心理' },
        { id: 'books', name: '阅读推荐' }
      ]
    }
  },
  onLoad() {
    // 获取当前主题模式
    this.isDarkMode = isDarkTheme();
  },
  onShow() {
    // 每次显示页面时更新主题状态
    this.isDarkMode = isDarkTheme();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 显示分类选择器
    showCategoryPicker() {
      this.showCategory = true;
    },
    
    // 隐藏分类选择器
    hideCategoryPicker() {
      this.showCategory = false;
    },
    
    // 选择分类
    selectCategory(categoryId) {
      this.article.category = categoryId;
      this.hideCategoryPicker();
    },
    
    // 获取分类名称
    getCategoryName(categoryId) {
      if (!categoryId) return '请选择分类';
      const category = this.categories.find(item => item.id === categoryId);
      return category ? category.name : '请选择分类';
    },
    
    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.article.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 合并图片数组
          this.article.images = [...this.article.images, ...res.tempFilePaths];
        }
      });
    },
    
    // 删除图片
    deleteImage(index) {
      this.article.images.splice(index, 1);
    },
    
    // 发布文章
    publishArticle() {
      // 表单验证
      if (!this.article.title.trim()) {
        uni.showToast({
          title: '请输入文章标题',
          icon: 'none'
        });
        return;
      }
      
      if (!this.article.category) {
        uni.showToast({
          title: '请选择文章分类',
          icon: 'none'
        });
        return;
      }
      
      if (!this.article.content.trim()) {
        uni.showToast({
          title: '请输入文章内容',
          icon: 'none'
        });
        return;
      }
      
      // 准备要保存的文章数据
      const articleData = {
        id: Date.now(), // 使用时间戳作为临时ID
        title: this.article.title.trim(),
        brief: this.article.content.substring(0, 50) + (this.article.content.length > 50 ? '...' : ''),
        category: this.article.category,
        content: this.article.content,
        images: this.article.images,
        comments: 0,
        likes: 0,
        createTime: new Date().toISOString(),
        icon: this.getRandomIcon(),
        authorName: '我' // 添加作者名称
      };
      
      // 获取已有主题列表
      const topicList = uni.getStorageSync('communityTopics') || [];
      
      // 添加新主题到列表开头
      topicList.unshift(articleData);
      
      // 保存更新后的主题列表
      uni.setStorageSync('communityTopics', topicList);
      
      // 提示发布成功
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      });
      
      // 延迟返回社区页面
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    },
    
    // 获取随机图标
    getRandomIcon() {
      const icons = ['📚', '🎮', '🥦', '🧠', '📖', '🌙', '👶', '🍼', '🧸', '🎯'];
      return icons[Math.floor(Math.random() * icons.length)];
    }
  }
}
</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.page-container.dark-mode {
  background-color: #121212;
}

.header {
  height: 90rpx;
  background-color: #8477fa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(132, 119, 250, 0.2);
}

.header.dark-mode {
  background-color: #5e52c9;
  box-shadow: 0 4rpx 12rpx rgba(94, 82, 201, 0.3);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

.back-icon {
  font-size: 36rpx;
  font-weight: bold;
}

.header-title {
  font-size: 34rpx;
  font-weight: bold;
}

.publish-btn {
  font-size: 30rpx;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
}

.publish-btn:active {
  background-color: rgba(255, 255, 255, 0.5);
}

.publish-form {
  flex: 1;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
  position: relative;
}

.title-input {
  width: 100%;
  height: 90rpx;
  background-color: white;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.title-input.dark-mode {
  background-color: #1f1f1f;
  color: #e0e0e0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.category-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 90rpx;
  background-color: white;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.category-selector.dark-mode {
  background-color: #1f1f1f;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.category-label {
  color: #333;
}

.category-label.dark-mode {
  color: #e0e0e0;
}

.selected-category {
  display: flex;
  align-items: center;
  color: #8477fa;
  font-weight: 500;
}

.selected-category.dark-mode {
  color: #9f8eff;
}

.arrow-icon {
  font-size: 24rpx;
  margin-left: 10rpx;
}

.content-input {
  width: 100%;
  height: 400rpx;
  background-color: white;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.content-input.dark-mode {
  background-color: #1f1f1f;
  color: #e0e0e0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.word-count {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.word-count.dark-mode {
  color: #777;
}

.image-upload-title {
  margin-bottom: 20rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.image-upload-title.dark-mode {
  color: #e0e0e0;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.image-item image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 50rpx;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 25rpx;
}

.add-image-btn {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .add-image-btn {
  background-color: #1f1f1f;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.add-icon {
  font-size: 60rpx;
  color: #8477fa;
}

.dark-mode .add-icon {
  color: #9f8eff;
}

/* 分类选择弹出层 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.category-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
  z-index: 101;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.category-popup.show {
  transform: translateY(0);
}

.category-popup.dark-mode {
  background-color: #1a1a1a;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 32rpx;
  font-weight: bold;
}

.dark-mode .popup-header {
  border-bottom-color: #333;
}

.close-btn {
  font-size: 40rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-list {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.category-item {
  padding: 25rpx 20rpx;
  font-size: 30rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item.active {
  color: #8477fa;
  font-weight: 500;
}

.dark-mode .category-item {
  color: #e0e0e0;
  border-bottom-color: #333;
}

.dark-mode .category-item.active {
  color: #9f8eff;
}
</style> 