<template>
  <view class="family-legacy-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">🏛️ 家族传承</text>
      <text class="subtitle">记录家族历史，传承家训文化</text>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'history' }"
        @click="currentTab = 'history'"
      >
        <text class="tab-icon">📜</text>
        <text class="tab-text">历史</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'tree' }"
        @click="currentTab = 'tree'"
      >
        <text class="tab-icon">🌳</text>
        <text class="tab-text">家族树</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'legacy' }"
        @click="currentTab = 'legacy'"
      >
        <text class="tab-icon">📜</text>
        <text class="tab-text">家训</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'honors' }"
        @click="currentTab = 'honors'"
      >
        <text class="tab-icon">🏆</text>
        <text class="tab-text">荣誉</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-value">{{ store.statistics.memberCount || 0 }}</text>
        <text class="stat-label">家族成员</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ store.statistics.activeLegacyCount || 0 }}</text>
        <text class="stat-label">家训</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ store.statistics.honorCount || 0 }}</text>
        <text class="stat-label">荣誉</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ store.statistics.storyCount || 0 }}</text>
        <text class="stat-label">故事</text>
      </view>
    </view>

    <!-- 家族历史 Tab -->
    <view class="tab-content" v-if="currentTab === 'history'">
      <view class="section-header">
        <text class="section-title">家族历史</text>
        <view class="add-btn" @click="openAddHistoryModal">
          <text>➕ 记录</text>
        </view>
      </view>

      <!-- 历史列表 -->
      <view class="history-list" v-if="store.histories.length > 0">
        <view
          v-for="history in sortedHistories"
          :key="history.id"
          class="history-item"
          @click="viewHistory(history)"
        >
          <view class="history-icon">
            <text>{{ getHistoryIcon(history.type) }}</text>
          </view>
          <view class="history-content">
            <text class="history-title">{{ history.title }}</text>
            <text class="history-desc" v-if="history.description">{{ history.description }}</text>
            <text class="history-date">{{ formatDate(history.createdAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📜</text>
        <text class="empty-text">暂无家族历史</text>
        <text class="empty-hint">记录家族的重要时刻</text>
      </view>
    </view>

    <!-- 家族树 Tab -->
    <view class="tab-content" v-if="currentTab === 'tree'">
      <view class="section-header">
        <text class="section-title">家族树</text>
        <view class="add-btn" @click="openAddMemberModal">
          <text>➕ 添加成员</text>
        </view>
      </view>

      <!-- 家族树视图 -->
      <view class="tree-view" v-if="store.familyTree.members?.length > 0">
        <view class="tree-root" v-if="rootMember" @click="viewMember(rootMember)">
          <view class="tree-node root">
            <text class="node-avatar">{{ rootMember.avatar || '👤' }}</text>
            <text class="node-name">{{ rootMember.name }}</text>
            <text class="node-generation">{{ getGenerationLabel(rootMember.generation) }}</text>
          </view>
          <!-- 子节点 -->
          <view class="tree-children" v-if="childMembers.length > 0">
            <view
              v-for="child in childMembers"
              :key="child.id"
              class="tree-node child"
              @click.stop="viewMember(child)"
            >
              <text class="node-avatar">{{ child.avatar || '👤' }}</text>
              <text class="node-name">{{ child.name }}</text>
              <text class="node-generation">{{ getGenerationLabel(child.generation) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 成员列表 -->
      <view class="member-list" v-if="store.familyTree.members?.length > 0">
        <view
          v-for="member in store.familyTree.members"
          :key="member.id"
          class="member-item"
          @click="viewMember(member)"
        >
          <text class="member-avatar">{{ member.avatar || '👤' }}</text>
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-generation">{{ getGenerationLabel(member.generation) }}</text>
          </view>
          <text class="member-birth">{{ member.birthYear || '未知' }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">🌳</text>
        <text class="empty-text">暂无家族树</text>
        <text class="empty-hint">添加家族成员开始构建</text>
      </view>
    </view>

    <!-- 家训 Tab -->
    <view class="tab-content" v-if="currentTab === 'legacy'">
      <view class="section-header">
        <text class="section-title">家训传承</text>
        <view class="add-btn" @click="openAddLegacyModal">
          <text>➕ 添加家训</text>
        </view>
      </view>

      <!-- 家训列表 -->
      <view class="legacy-list" v-if="store.legacies.length > 0">
        <view
          v-for="legacy in store.legacies"
          :key="legacy.id"
          class="legacy-item"
          :class="{ passed: legacy.passedDown }"
          @click="viewLegacy(legacy)"
        >
          <view class="legacy-header">
            <text class="legacy-icon">{{ legacy.icon || '📜' }}</text>
            <text class="legacy-title">{{ legacy.title }}</text>
            <view class="legacy-badge" v-if="legacy.passedDown">
              <text>已传承</text>
            </view>
          </view>
          <text class="legacy-content">{{ legacy.content }}</text>
          <view class="legacy-footer">
            <text class="legacy-category">{{ legacy.category || '一般' }}</text>
            <text class="legacy-date">{{ formatDate(legacy.createdAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📜</text>
        <text class="empty-text">暂无家训</text>
        <text class="empty-hint">添加第一条家训</text>
      </view>
    </view>

    <!-- 荣誉 Tab -->
    <view class="tab-content" v-if="currentTab === 'honors'">
      <view class="section-header">
        <text class="section-title">家族荣誉</text>
        <view class="add-btn" @click="openAddHonorModal">
          <text>➕ 添加荣誉</text>
        </view>
      </view>

      <!-- 荣誉列表 -->
      <view class="honors-list" v-if="store.honors.length > 0">
        <view
          v-for="honor in store.honors"
          :key="honor.id"
          class="honor-item"
          @click="viewHonor(honor)"
        >
          <view class="honor-icon" :style="{ background: getHonorColor(honor.type) }">
            <text>{{ getHonorIcon(honor.type) }}</text>
          </view>
          <view class="honor-content">
            <text class="honor-title">{{ honor.title }}</text>
            <text class="honor-desc" v-if="honor.description">{{ honor.description }}</text>
            <text class="honor-date">{{ formatDate(honor.earnedAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">🏆</text>
        <text class="empty-text">暂无荣誉</text>
        <text class="empty-hint">记录家族的荣耀时刻</text>
      </view>
    </view>

    <!-- 添加历史记录弹窗 -->
    <view class="modal" v-if="showHistoryModal" @click="closeHistoryModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">记录家族历史</text>

        <view class="form-item">
          <text class="form-label">标题</text>
          <input class="form-input" v-model="historyForm.title" placeholder="输入事件标题" />
        </view>

        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea class="form-textarea" v-model="historyForm.description" placeholder="描述这个重要时刻" />
        </view>

        <view class="form-item">
          <text class="form-label">类型</text>
          <view class="category-grid">
            <view
              v-for="cat in historyCategories"
              :key="cat.key"
              class="category-item"
              :class="{ active: historyForm.type === cat.key }"
              @click="historyForm.type = cat.key"
            >
              <text class="category-icon">{{ cat.icon }}</text>
              <text class="category-name">{{ cat.name }}</text>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeHistoryModal">取消</view>
          <view class="submit-btn" @click="submitHistory">保存</view>
        </view>
      </view>
    </view>

    <!-- 添加成员弹窗 -->
    <view class="modal" v-if="showMemberModal" @click="closeMemberModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加家族成员</text>

        <view class="form-item">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="memberForm.name" placeholder="输入成员姓名" />
        </view>

        <view class="form-item">
          <text class="form-label">头像</text>
          <input class="form-input" v-model="memberForm.avatar" placeholder="输入头像emoji" />
        </view>

        <view class="form-item">
          <text class="form-label">代际</text>
          <view class="category-grid">
            <view
              v-for="gen in generationOptions"
              :key="gen.value"
              class="category-item"
              :class="{ active: memberForm.generation === gen.value }"
              @click="memberForm.generation = gen.value"
            >
              <text class="category-icon">{{ gen.icon }}</text>
              <text class="category-name">{{ gen.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">出生年份</text>
          <input class="form-input" v-model="memberForm.birthYear" placeholder="输入出生年份" type="number" />
        </view>

        <view class="form-item">
          <text class="form-label">简介</text>
          <textarea class="form-textarea" v-model="memberForm.bio" placeholder="简要介绍" />
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeMemberModal">取消</view>
          <view class="submit-btn" @click="submitMember">保存</view>
        </view>
      </view>
    </view>

    <!-- 添加家训弹窗 -->
    <view class="modal" v-if="showLegacyModal" @click="closeLegacyModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加家训</text>

        <view class="form-item">
          <text class="form-label">标题</text>
          <input class="form-input" v-model="legacyForm.title" placeholder="输入家训标题" />
        </view>

        <view class="form-item">
          <text class="form-label">内容</text>
          <textarea class="form-textarea" v-model="legacyForm.content" placeholder="输入家训内容" />
        </view>

        <view class="form-item">
          <text class="form-label">图标</text>
          <input class="form-input" v-model="legacyForm.icon" placeholder="输入图标emoji" />
        </view>

        <view class="form-item">
          <text class="form-label">类别</text>
          <view class="category-grid">
            <view
              v-for="cat in legacyCategories"
              :key="cat.key"
              class="category-item"
              :class="{ active: legacyForm.category === cat.key }"
              @click="legacyForm.category = cat.key"
            >
              <text class="category-icon">{{ cat.icon }}</text>
              <text class="category-name">{{ cat.name }}</text>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeLegacyModal">取消</view>
          <view class="submit-btn" @click="submitLegacy">保存</view>
        </view>
      </view>
    </view>

    <!-- 添加荣誉弹窗 -->
    <view class="modal" v-if="showHonorModal" @click="closeHonorModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加荣誉</text>

        <view class="form-item">
          <text class="form-label">标题</text>
          <input class="form-input" v-model="honorForm.title" placeholder="输入荣誉名称" />
        </view>

        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea class="form-textarea" v-model="honorForm.description" placeholder="描述这个荣誉" />
        </view>

        <view class="form-item">
          <text class="form-label">类型</text>
          <view class="category-grid">
            <view
              v-for="type in honorTypes"
              :key="type.key"
              class="category-item"
              :class="{ active: honorForm.type === type.key }"
              @click="honorForm.type = type.key"
            >
              <text class="category-icon">{{ type.icon }}</text>
              <text class="category-name">{{ type.name }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">获得日期</text>
          <picker mode="date" :value="honorForm.earnedAt" @change="onHonorDateChange">
            <view class="picker-value">{{ honorForm.earnedAt || '选择日期' }}</view>
          </picker>
        </view>

        <view class="form-actions">
          <view class="cancel-btn" @click="closeHonorModal">取消</view>
          <view class="submit-btn" @click="submitHonor">保存</view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view class="modal" v-if="showDetailModal" @click="closeDetailModal">
      <view class="modal-content detail" @click.stop>
        <text class="modal-title">{{ selectedItem?.title }}</text>
        <text class="detail-desc" v-if="selectedItem?.description">{{ selectedItem.description }}</text>
        <text class="detail-date">{{ formatDate(selectedItem?.createdAt || selectedItem?.earnedAt) }}</text>
        <view class="detail-actions">
          <view class="action-btn delete" @click="confirmDelete">
            <text>🗑️ 删除</text>
          </view>
        </view>
        <view class="close-btn" @click="closeDetailModal">✕</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFamilyLegacyStore } from '../../stores/familyLegacyStore.js'
import familyLegacyService from '../../services/familyLegacyService.js'

const store = useFamilyLegacyStore()

// 当前标签页
const currentTab = ref('history')

// 弹窗状态
const showHistoryModal = ref(false)
const showMemberModal = ref(false)
const showLegacyModal = ref(false)
const showHonorModal = ref(false)
const showDetailModal = ref(false)

// 选中项
const selectedItem = ref(null)
const selectedType = ref('')

// 表单数据
const historyForm = ref({ title: '', description: '', type: 'milestone' })
const memberForm = ref({ name: '', avatar: '', generation: 3, birthYear: '', bio: '' })
const legacyForm = ref({ title: '', content: '', icon: '📜', category: 'wisdom' })
const honorForm = ref({ title: '', description: '', type: 'achievement', earnedAt: '' })

// 常量选项
const historyCategories = [
  { key: 'milestone', name: '里程碑', icon: '🎯' },
  { key: 'story', name: '故事', icon: '📖' },
  { key: 'tradition', name: '传统', icon: '🎊' },
  { key: 'other', name: '其他', icon: '📝' }
]

const generationOptions = [
  { value: 1, label: '曾祖父母', icon: '👴' },
  { value: 2, label: '祖父母', icon: '👴' },
  { value: 3, label: '父母', icon: '👨' },
  { value: 4, label: '子女', icon: '👦' },
  { value: 5, label: '孙子女', icon: '👶' }
]

const legacyCategories = [
  { key: 'wisdom', name: '智慧', icon: '💡' },
  { key: 'moral', name: '品德', icon: '❤️' },
  { key: 'health', name: '健康', icon: '💪' },
  { key: 'harmony', name: '和睦', icon: '🤝' }
]

const honorTypes = [
  { key: 'achievement', name: '成就', icon: '🏆' },
  { key: 'milestone', name: '里程碑', icon: '🎯' },
  { key: 'legacy', name: '传承', icon: '📜' },
  { key: 'story', name: '故事', icon: '📖' }
]

// 计算属性
const sortedHistories = computed(() => {
  return [...store.histories].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

const rootMember = computed(() => {
  const { rootId, members } = store.familyTree
  if (!rootId) return members[0] || null
  return members.find(m => m.id === rootId) || null
})

const childMembers = computed(() => {
  const { rootId, members } = store.familyTree
  if (!rootId) return []
  return members.filter(m => 
    m.id !== rootId && m.relations?.some(r => r.relatedId === rootId)
  )
})

// 方法
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getHistoryIcon = (type) => {
  const cat = historyCategories.find(c => c.key === type)
  return cat?.icon || '📝'
}

const getGenerationLabel = (level) => {
  const info = familyLegacyService.GENERATION_INFO[level]
  return info?.label || '未知'
}

const getHonorIcon = (type) => {
  const info = familyLegacyService.HONOR_INFO[type]
  return info?.icon || '🏆'
}

const getHonorColor = (type) => {
  const info = familyLegacyService.HONOR_INFO[type]
  return info?.color || '#FFD700'
}

// 打开弹窗
const openAddHistoryModal = () => {
  historyForm.value = { title: '', description: '', type: 'milestone' }
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
}

const openAddMemberModal = () => {
  memberForm.value = { name: '', avatar: '', generation: 3, birthYear: '', bio: '' }
  showMemberModal.value = true
}

const closeMemberModal = () => {
  showMemberModal.value = false
}

const openAddLegacyModal = () => {
  legacyForm.value = { title: '', content: '', icon: '📜', category: 'wisdom' }
  showLegacyModal.value = true
}

const closeLegacyModal = () => {
  showLegacyModal.value = false
}

const openAddHonorModal = () => {
  honorForm.value = { title: '', description: '', type: 'achievement', earnedAt: '' }
  showHonorModal.value = true
}

const closeHonorModal = () => {
  showHonorModal.value = false
}

// 提交表单
const submitHistory = () => {
  if (!historyForm.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  store.addHistory(historyForm.value)
  uni.showToast({ title: '保存成功', icon: 'success' })
  closeHistoryModal()
}

const submitMember = () => {
  if (!memberForm.value.name.trim()) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  store.addMember(memberForm.value)
  uni.showToast({ title: '保存成功', icon: 'success' })
  closeMemberModal()
}

const submitLegacy = () => {
  if (!legacyForm.value.title.trim() || !legacyForm.value.content.trim()) {
    uni.showToast({ title: '请输入标题和内容', icon: 'none' })
    return
  }
  store.addLegacy(legacyForm.value)
  uni.showToast({ title: '保存成功', icon: 'success' })
  closeLegacyModal()
}

const submitHonor = () => {
  if (!honorForm.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  store.addHonor(honorForm.value)
  uni.showToast({ title: '保存成功', icon: 'success' })
  closeHonorModal()
}

const onHonorDateChange = (e) => {
  honorForm.value.earnedAt = e.detail.value
}

// 查看详情
const viewHistory = (history) => {
  selectedItem.value = history
  selectedType.value = 'history'
  showDetailModal.value = true
}

const viewMember = (member) => {
  selectedItem.value = member
  selectedType.value = 'member'
  showDetailModal.value = true
}

const viewLegacy = (legacy) => {
  selectedItem.value = legacy
  selectedType.value = 'legacy'
  showDetailModal.value = true
}

const viewHonor = (honor) => {
  selectedItem.value = honor
  selectedType.value = 'honor'
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedItem.value = null
}

const confirmDelete = () => {
  if (!selectedItem.value) return
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除吗？',
    success: (res) => {
      if (res.confirm) {
        switch (selectedType.value) {
          case 'history':
            store.removeHistory(selectedItem.value.id)
            break
          case 'member':
            store.removeMember(selectedItem.value.id)
            break
          case 'legacy':
            store.removeLegacy(selectedItem.value.id)
            break
          case 'honor':
            store.removeHonor(selectedItem.value.id)
            break
        }
        closeDetailModal()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

// 初始化
store.init()
</script>

<style scoped>
.family-legacy-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  color: #fff;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
  margin-top: 8rpx;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
}

.tab-icon {
  font-size: 36rpx;
}

.tab-text {
  font-size: 22rpx;
  margin-top: 6rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #667eea;
  font-weight: bold;
}

.stats-cards {
  display: flex;
  padding: 20rpx;
  gap: 12rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.stat-label {
  font-size: 20rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.tab-content {
  padding: 0 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.history-list,
.legacy-list,
.honors-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.history-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.history-content {
  flex: 1;
}

.history-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.history-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}

.history-date {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.legacy-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.legacy-item.passed {
  opacity: 0.7;
  background: #f9f9f9;
}

.legacy-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.legacy-icon {
  font-size: 32rpx;
}

.legacy-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.legacy-badge {
  background: #52c41a;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
}

.legacy-content {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-top: 12rpx;
  line-height: 1.5;
}

.legacy-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
}

.legacy-category {
  font-size: 22rpx;
  color: #999;
}

.legacy-date {
  font-size: 22rpx;
  color: #999;
}

.honor-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.honor-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.honor-content {
  flex: 1;
}

.honor-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.honor-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 8rpx;
}

.honor-date {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.tree-view {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.tree-node.root {
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  width: 140rpx;
  height: 140rpx;
  justify-content: center;
  margin: 0 auto;
}

.node-avatar {
  font-size: 48rpx;
}

.node-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.node-generation {
  font-size: 20rpx;
  color: #999;
}

.tree-children {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
  justify-content: center;
}

.tree-node.child {
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  width: 120rpx;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.member-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.member-avatar {
  font-size: 40rpx;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.member-generation {
  font-size: 22rpx;
  color: #999;
}

.member-birth {
  font-size: 24rpx;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-top: 20rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.detail {
  position: relative;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.form-input {
  border: 1px solid #eee;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-textarea {
  border: 1px solid #eee;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  width: 100%;
  min-height: 120rpx;
  box-sizing: border-box;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  min-width: 100rpx;
}

.category-item.active {
  background: #667eea;
  color: #fff;
}

.category-icon {
  font-size: 28rpx;
}

.category-name {
  font-size: 20rpx;
  margin-top: 6rpx;
}

.picker-value {
  border: 1px solid #eee;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.cancel-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
}

.submit-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #fff;
}

.detail-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-top: 16rpx;
  line-height: 1.5;
}

.detail-date {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 16rpx;
}

.detail-actions {
  margin-top: 30rpx;
}

.action-btn {
  display: inline-block;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-right: 12rpx;
  background: #f5f5f5;
}

.action-btn.delete {
  background: #fff1f0;
  color: #ff4d4f;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 50rpx;
  height: 50rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
}
</style>
