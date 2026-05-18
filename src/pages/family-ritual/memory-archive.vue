<!-- 回忆存档页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">回忆存档</text>
      <view class="nav-right" @tap="showAddMemory">
        <text class="icon">+</text>
      </view>
    </view>

    <!-- 时间线视图 -->
    <view class="timeline-section">
      <text class="section-title">📸 家庭回忆</text>
      
      <view v-if="memoryTimeline.length > 0" class="timeline">
        <view 
          v-for="(memories, dateKey) in groupedMemories" 
          :key="dateKey" 
          class="timeline-group"
        >
          <view class="timeline-date">
            <text class="date-label">{{ formatDateKey(dateKey) }}</text>
          </view>
          
          <view 
            v-for="memory in memories" 
            :key="memory.id" 
            class="memory-card"
            :class="'type-' + memory.type"
          >
            <view class="memory-header">
              <text class="memory-icon">{{ getTypeIcon(memory.type) }}</text>
              <view class="memory-title-area">
                <text class="memory-title">{{ memory.title }}</text>
                <text class="memory-time">{{ formatTime(memory.createdAt) }}</text>
              </view>
              <view class="memory-actions" @tap="showMemoryOptions(memory.id)">
                <text class="more-icon">⋮</text>
              </view>
            </view>

            <view class="memory-content">
              <text v-if="memory.type === 'text'" class="memory-text">{{ memory.content }}</text>
              <image 
                v-else-if="memory.type === 'photo'" 
                class="memory-image"
                :src="memory.content"
                mode="aspectFill"
              />
              <video 
                v-else-if="memory.type === 'video'" 
                class="memory-video"
                :src="memory.content"
              />
            </view>

            <view class="memory-footer">
              <view class="memory-tags">
                <text 
                  v-for="tag in memory.tags" 
                  :key="tag" 
                  class="tag"
                >#{{ tag }}</text>
              </view>
              <text class="ai-desc">{{ memory.aiDescription }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-icon">📸</text>
        <text class="empty-text">暂无回忆</text>
        <text class="empty-hint">点击右上角 + 记录第一个家庭时刻</text>
      </view>
    </view>

    <!-- 标签筛选 -->
    <view class="filter-section" v-if="allTags.length > 0">
      <text class="filter-label">🏷️ 按标签筛选</text>
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tags">
          <view 
            class="filter-tag" 
            :class="{ active: selectedTag === '' }"
            @tap="selectedTag = ''"
          >全部</view>
          <view 
            v-for="tag in allTags" 
            :key="tag" 
            class="filter-tag"
            :class="{ active: selectedTag === tag }"
            @tap="selectedTag = tag"
          >#{{ tag }}</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFamilyRitualStore } from '@/stores/familyRitualStore.js'

export default {
  setup() {
    const ritualStore = useFamilyRitualStore()
    const selectedTag = ref('')

    onMounted(() => {
      ritualStore.init()
    })

    const memoryTimeline = computed(() => {
      if (!selectedTag.value) {
        return ritualStore.memoryTimeline
      }
      return ritualStore.getMemoriesByTag(selectedTag.value)
    })

    const groupedMemories = computed(() => {
      const groups = {}
      memoryTimeline.value.forEach(memory => {
        const dateKey = memory.createdAt.split('T')[0]
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(memory)
      })
      return groups
    })

    const allTags = computed(() => {
      const tags = new Set()
      ritualStore.memories.forEach(m => {
        m.tags?.forEach(t => tags.add(t))
      })
      return Array.from(tags)
    })

    const getTypeIcon = (type) => {
      const icons = { photo: '📷', video: '🎬', text: '📝' }
      return icons[type] || '📝'
    }

    const formatDateKey = (dateKey) => {
      const date = new Date(dateKey)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (dateKey === today.toISOString().split('T')[0]) return '今天'
      if (dateKey === yesterday.toISOString().split('T')[0]) return '昨天'
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    const formatTime = (isoString) => {
      const date = new Date(isoString)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    const showAddMemory = () => {
      uni.showActionSheet({
        itemList: ['📝 文字记录', '📷 添加照片', '🎬 添加视频'],
        success: (res) => {
          const types = ['text', 'photo', 'video']
          const type = types[res.tapIndex]
          
          if (type === 'text') {
            uni.showModal({
              title: '记录回忆',
              editable: true,
              placeholderText: '写下这一刻...',
              success: (modalRes) => {
                if (modalRes.content?.trim()) {
                  ritualStore.addMemory(
                    '文字回忆',
                    'text',
                    modalRes.content.trim(),
                    [],
                    { auto: true }
                  )
                  uni.showToast({ title: '已保存', icon: 'success' })
                }
              }
            })
          } else {
            uni.chooseMedia({
              count: 1,
              mediaType: [type === 'photo' ? 'image' : 'video'],
              success: (res) => {
                const tempFile = res.tempFiles[0]
                ritualStore.addMemory(
                  type === 'photo' ? '家庭照片' : '家庭视频',
                  type,
                  tempFile.tempFilePath || tempFile.url,
                  [],
                  { size: tempFile.size }
                )
                uni.showToast({ title: '已保存', icon: 'success' })
              }
            })
          }
        }
      })
    }

    const showMemoryOptions = (memoryId) => {
      uni.showActionSheet({
        itemList: ['📤 导出分享', '🗑️ 删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            exportMemory(memoryId)
          } else if (res.tapIndex === 1) {
            deleteMemory(memoryId)
          }
        }
      })
    }

    const exportMemory = (memoryId) => {
      const memory = ritualStore.memories.find(m => m.id === memoryId)
      if (!memory) return
      
      const { exportMemoryAsText } = require('@/services/familyRitualService.js')
      const text = exportMemoryAsText(memory)
      
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
        }
      })
    }

    const deleteMemory = (memoryId) => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条回忆吗？',
        success: (res) => {
          if (res.confirm) {
            ritualStore.deleteMemory(memoryId)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    return {
      selectedTag,
      memoryTimeline,
      groupedMemories,
      allTags,
      getTypeIcon,
      formatDateKey,
      formatTime,
      showAddMemory,
      showMemoryOptions,
      exportMemory,
      deleteMemory,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 60px 16px 16px;
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.nav-left .icon, .nav-right .icon {
  font-size: 24px;
  color: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.nav-right {
  width: 40px;
  text-align: center;
}

.timeline-section {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: block;
}

.timeline-group {
  margin-bottom: 20px;
}

.timeline-date {
  margin-bottom: 8px;
}

.date-label {
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

.memory-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.memory-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.memory-icon {
  font-size: 24px;
  margin-right: 10px;
}

.memory-title-area {
  flex: 1;
}

.memory-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
}

.memory-time {
  font-size: 11px;
  color: #999;
}

.more-icon {
  font-size: 20px;
  color: #999;
  padding: 4px 8px;
}

.memory-content {
  margin-bottom: 12px;
}

.memory-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.memory-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

.memory-video {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

.memory-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.memory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  font-size: 12px;
  color: #667eea;
  background: #e8e8ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.ai-desc {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

.filter-section {
  padding: 0 16px 16px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: 8px;
}

.filter-tag {
  display: inline-block;
  padding: 6px 12px;
  background: #fff;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
}

.filter-tag.active {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  color: #fff;
}
</style>
