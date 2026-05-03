<!-- 任务模板选择器 -->
<template>
  <view class="template-picker-overlay" @tap="closePicker" v-if="showPicker">
    <view class="template-picker-container" @tap.stop>
      <!-- 标题栏 -->
      <view class="picker-header">
        <text class="picker-title">选择任务模板</text>
        <view class="close-btn" @tap="closePicker">×</view>
      </view>

      <!-- 搜索框 -->
      <view class="search-section">
        <input 
          class="search-input" 
          v-model="searchQuery" 
          placeholder="搜索模板..."
          placeholder-class="search-placeholder"
        />
      </view>

      <!-- 分类标签 -->
      <view class="category-tabs">
        <view 
          v-for="(category, index) in categories" 
          :key="index"
          class="category-tab"
          :class="{ 'active': selectedCategory === index }"
          @tap="selectedCategory = index"
        >
          {{ category.name }}
        </view>
      </view>

      <!-- 模板列表 -->
      <scroll-view scroll-y class="template-list">
        <!-- 分类标题 -->
        <view class="section-title">
          {{ currentCategoryName }}模板
        </view>
        
        <!-- 模板卡片列表 -->
        <view class="template-cards">
          <view 
            v-for="template in filteredTemplates" 
            :key="template.id"
            class="template-card"
            @tap="selectTemplate(template)"
          >
            <view class="template-icon">{{ template.icon || '📋' }}</view>
            <view class="template-info">
              <text class="template-title">{{ template.title }}</text>
              <text class="template-desc">{{ template.description }}</text>
              <view class="template-meta">
                <text class="template-points">+{{ template.points }}积分</text>
                <view class="template-tags">
                  <text v-for="tag in template.tags" :key="tag" class="template-tag">{{ tag }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 无搜索结果 -->
        <view v-if="filteredTemplates.length === 0" class="empty-tip">
          <text>暂无相关模板</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useTaskTemplateStore } from '@/stores/taskTemplateStore'

export default {
  name: 'TemplatePicker',
  
  setup(props, { emit }) {
    const templateStore = useTaskTemplateStore()
    
    // 显示状态
    const showPicker = ref(false)
    
    // 搜索关键词
    const searchQuery = ref('')
    
    // 当前选中的分类索引
    const selectedCategory = ref(0)
    
    // 分类列表
    const categories = [
      { name: '学习', tags: ['学习'] },
      { name: '运动', tags: ['运动'] },
      { name: '生活习惯', tags: ['生活习惯'] },
      { name: '社交', tags: ['社交'] },
      { name: '才艺', tags: ['才艺'] },
      { name: '全部', tags: [] }
    ]
    
    // 当前分类名称
    const currentCategoryName = computed(() => categories[selectedCategory.value].name)
    
    // 筛选后的模板列表
    const filteredTemplates = computed(() => {
      let templates = templateStore.allTemplates
      
      // 按分类筛选
      const categoryTags = categories[selectedCategory.value].tags
      if (categoryTags.length > 0) {
        templates = templates.filter(t => 
          t.tags.some(tag => categoryTags.includes(tag))
        )
      }
      
      // 按搜索关键词筛选
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        templates = templates.filter(t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      return templates
    })
    
    // 打开选择器
    const openPicker = () => {
      showPicker.value = true
      searchQuery.value = ''
      selectedCategory.value = 0
    }
    
    // 关闭选择器
    const closePicker = () => {
      showPicker.value = false
    }
    
    // 选择模板
    const selectTemplate = (template) => {
      emit('select', template)
      closePicker()
    }
    
    // 初始化store
    templateStore.init()
    
    return {
      showPicker,
      searchQuery,
      selectedCategory,
      categories,
      currentCategoryName,
      filteredTemplates,
      openPicker,
      closePicker,
      selectTemplate
    }
  }
}
</script>

<style scoped>
.template-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.template-picker-container {
  width: 100%;
  height: 75vh;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #eee;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 56rpx;
  text-align: center;
  font-size: 48rpx;
  color: #999;
}

.search-section {
  padding: 20rpx 30rpx;
}

.search-input {
  width: 100%;
  height: 72rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.search-placeholder {
  color: #999;
}

.category-tabs {
  display: flex;
  padding: 0 20rpx 20rpx;
  gap: 16rpx;
  overflow-x: auto;
}

.category-tab {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.category-tab.active {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: #fff;
}

.template-list {
  flex: 1;
  padding: 0 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.template-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.template-card {
  display: flex;
  padding: 24rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
  transition: all 0.3s;
}

.template-card:active {
  background-color: #f0f0f0;
  transform: scale(0.98);
}

.template-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.template-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.template-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.template-points {
  font-size: 24rpx;
  color: #8B5CF6;
  font-weight: bold;
}

.template-tags {
  display: flex;
  gap: 8rpx;
}

.template-tag {
  font-size: 20rpx;
  color: #666;
  background-color: #e8e8e8;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.empty-tip {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
