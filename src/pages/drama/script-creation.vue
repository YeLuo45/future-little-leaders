<template>
  <view class="script-creation-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">剧本创作</text>
      <view class="nav-right">
        <text class="save-btn" @tap="saveScript">保存</text>
      </view>
    </view>

    <!-- 剧本列表/编辑区 -->
    <view v-if="!isEditing" class="script-list-area">
      <view class="create-new-section">
        <view class="create-btn" @tap="startNewScript">
          <text class="create-icon">✏️</text>
          <text class="create-text">创建新剧本</text>
        </view>
      </view>

      <view class="script-list">
        <view class="list-header">
          <text class="list-title">我的剧本</text>
          <text class="script-count">{{ scripts.length }}个</text>
        </view>

        <view 
          v-for="script in scripts" 
          :key="script.id"
          class="script-card"
          @tap="editScript(script)"
        >
          <view class="script-info">
            <text class="script-title">{{ script.title || '未命名剧本' }}</text>
            <text class="script-meta">
              {{ script.dialogues?.length || 0 }}段对白 · 
              {{ formatDate(script.updatedAt || script.createdAt) }}
            </text>
          </view>
          <view class="script-actions">
            <view class="action-icon" @tap.stop="duplicateScript(script)">
              <text>📋</text>
            </view>
            <view class="action-icon" @tap.stop="deleteScript(script)">
              <text>🗑️</text>
            </view>
          </view>
        </view>

        <view v-if="scripts.length === 0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无剧本</text>
          <text class="empty-hint">开始创作你的第一个剧本吧！</text>
        </view>
      </view>
    </view>

    <!-- 剧本编辑区 -->
    <view v-else class="script-edit-area">
      <!-- 基本信息 -->
      <view class="info-section">
        <view class="input-group">
          <text class="input-label">剧本标题</text>
          <input 
            class="input-field"
            v-model="editingForm.title"
            placeholder="输入剧本标题"
            placeholder-class="placeholder"
          />
        </view>

        <view class="input-group">
          <text class="input-label">剧本描述</text>
          <textarea
            class="textarea-field"
            v-model="editingForm.description"
            placeholder="描述你的故事..."
            placeholder-class="placeholder"
            :rows="3"
          />
        </view>
      </view>

      <!-- 角色选择 -->
      <view class="character-section">
        <text class="section-title">选择角色</text>
        <view class="character-chips">
          <view 
            v-for="char in availableCharacters" 
            :key="char.id"
            :class="['character-chip', { selected: isCharacterSelected(char.id) }]"
            @tap="toggleCharacter(char.id)"
          >
            <text class="chip-icon">{{ getRoleIcon(char.role) }}</text>
            <text class="chip-name">{{ char.name }}</text>
          </view>
        </view>
      </view>

      <!-- 对白列表 -->
      <view class="dialogue-section">
        <view class="dialogue-header">
          <text class="section-title">对白列表</text>
          <view class="add-dialogue-btn" @tap="showAddDialogue">
            <text>➕ 添加对白</text>
          </view>
        </view>

        <view class="dialogue-list">
          <view 
            v-for="(dialogue, index) in editingForm.dialogues" 
            :key="dialogue.id"
            class="dialogue-card"
          >
            <view class="dialogue-order">
              <text>{{ index + 1 }}</text>
            </view>
            <view class="dialogue-content">
              <view class="dialogue-speaker">
                <text class="speaker-label">角色:</text>
                <text class="speaker-name">{{ getCharacterName(dialogue.characterId) }}</text>
              </view>
              <text class="dialogue-text">{{ dialogue.text }}</text>
              <view class="dialogue-emotion" v-if="dialogue.emotion">
                <text>表情: {{ getEmotionLabel(dialogue.emotion) }}</text>
              </view>
            </view>
            <view class="dialogue-actions">
              <view class="action-btn" @tap="editDialogue(dialogue, index)">
                <text>✏️</text>
              </view>
              <view class="action-btn" @tap="removeDialogueByIndex(index)">
                <text>🗑️</text>
              </view>
            </view>
          </view>

          <view v-if="editingForm.dialogues.length === 0" class="empty-dialogue">
            <text>暂无对白，点击上方按钮添加</text>
          </view>
        </view>
      </view>

      <!-- 预览按钮 -->
      <view class="preview-section">
        <view class="preview-btn" @tap="previewScript">
          <text>👁️ 预览剧本</text>
        </view>
      </view>
    </view>

    <!-- 添加对白弹窗 -->
    <view v-if="showDialogueModal" class="modal-overlay" @tap="closeDialogueModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingDialogueIndex !== null ? '编辑对白' : '添加对白' }}</text>
          <text class="modal-close" @tap="closeDialogueModal">×</text>
        </view>

        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">选择角色</text>
            <view class="character-select-grid">
              <view 
                v-for="charId in editingForm.characterIds" 
                :key="charId"
                :class="['char-select-item', { selected: dialogueForm.characterId === charId }]"
                @tap="dialogueForm.characterId = charId"
              >
                <text>{{ getCharacterName(charId) }}</text>
              </view>
            </view>
          </view>

          <view class="input-group">
            <text class="input-label">对白内容</text>
            <textarea
              class="textarea-field"
              v-model="dialogueForm.text"
              placeholder="输入角色的对白..."
              placeholder-class="placeholder"
              :rows="4"
            />
          </view>

          <view class="input-group">
            <text class="input-label">表情（可选）</text>
            <view class="emotion-select-grid">
              <view 
                v-for="emotion in availableEmotions" 
                :key="emotion.key"
                :class="['emotion-item', { selected: dialogueForm.emotion === emotion.key }]"
                @tap="dialogueForm.emotion = emotion.key"
              >
                <text>{{ emotion.icon }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <view class="modal-btn cancel" @tap="closeDialogueModal">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @tap="saveDialogue">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDramaStore } from '@/stores/dramaStore'

const dramaStore = useDramaStore()

const isEditing = ref(false)
const editingDialogueIndex = ref(null)
const showDialogueModal = ref(false)

const editingForm = reactive({
  id: null,
  title: '',
  description: '',
  characterIds: [],
  dialogues: []
})

const dialogueForm = reactive({
  characterId: '',
  text: '',
  emotion: ''
})

const availableCharacters = computed(() => dramaStore.unlockedCharacters)
const scripts = computed(() => dramaStore.scripts)

const availableEmotions = [
  { key: 'happy', icon: '😊' },
  { key: 'sad', icon: '😢' },
  { key: 'surprised', icon: '😲' },
  { key: 'angry', icon: '😠' },
  { key: 'scared', icon: '😨' },
  { key: 'thinking', icon: '🤔' },
  { key: 'excited', icon: '🤩' },
  { key: 'calm', icon: '😌' }
]

const getRoleIcon = (role) => {
  const roleInfo = dramaStore.getRoleInfo()
  return roleInfo[role]?.icon || '🎭'
}

const getCharacterName = (charId) => {
  const char = availableCharacters.value.find(c => c.id === charId)
  return char?.name || '未知'
}

const getEmotionLabel = (emotion) => {
  const item = availableEmotions.find(e => e.key === emotion)
  return item ? `${item.icon} ${emotion}` : emotion
}

const isCharacterSelected = (charId) => {
  return editingForm.characterIds.includes(charId)
}

const toggleCharacter = (charId) => {
  const index = editingForm.characterIds.indexOf(charId)
  if (index === -1) {
    editingForm.characterIds.push(charId)
  } else {
    editingForm.characterIds.splice(index, 1)
  }
}

const startNewScript = () => {
  editingForm.id = null
  editingForm.title = ''
  editingForm.description = ''
  editingForm.characterIds = []
  editingForm.dialogues = []
  isEditing.value = true
  dramaStore.startNewScript()
}

const editScript = (script) => {
  Object.assign(editingForm, {
    id: script.id,
    title: script.title,
    description: script.description,
    characterIds: [...script.characterIds],
    dialogues: [...script.dialogues]
  })
  dramaStore.selectScript(script)
  isEditing.value = true
}

const duplicateScript = (script) => {
  dramaStore.createScript({
    title: script.title + ' (副本)',
    description: script.description,
    characterIds: [...script.characterIds],
    dialogues: script.dialogues.map(d => ({ ...d }))
  })
  uni.showToast({ title: '已复制剧本', icon: 'success' })
}

const deleteScript = (script) => {
  uni.showModal({
    title: '删除剧本',
    content: '确定要删除这个剧本吗？',
    success: (res) => {
      if (res.confirm) {
        dramaStore.deleteScriptById(script.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const showAddDialogue = () => {
  if (editingForm.characterIds.length === 0) {
    uni.showToast({ title: '请先选择角色', icon: 'none' })
    return
  }
  editingDialogueIndex.value = null
  dialogueForm.characterId = editingForm.characterIds[0]
  dialogueForm.text = ''
  dialogueForm.emotion = ''
  showDialogueModal.value = true
}

const editDialogue = (dialogue, index) => {
  editingDialogueIndex.value = index
  dialogueForm.characterId = dialogue.characterId
  dialogueForm.text = dialogue.text
  dialogueForm.emotion = dialogue.emotion || ''
  showDialogueModal.value = true
}

const saveDialogue = () => {
  if (!dialogueForm.text.trim()) {
    uni.showToast({ title: '请输入对白内容', icon: 'none' })
    return
  }

  const newDialogue = {
    id: editingDialogueIndex.value !== null 
      ? editingForm.dialogues[editingDialogueIndex.value].id 
      : `dlg_${Date.now()}`,
    characterId: dialogueForm.characterId,
    text: dialogueForm.text,
    emotion: dialogueForm.emotion
  }

  if (editingDialogueIndex.value !== null) {
    editingForm.dialogues[editingDialogueIndex.value] = newDialogue
  } else {
    editingForm.dialogues.push(newDialogue)
  }

  closeDialogueModal()
}

const removeDialogueByIndex = (index) => {
  editingForm.dialogues.splice(index, 1)
}

const closeDialogueModal = () => {
  showDialogueModal.value = false
  editingDialogueIndex.value = null
}

const previewScript = () => {
  if (!editingForm.title) {
    uni.showToast({ title: '请输入剧本标题', icon: 'none' })
    return
  }
  uni.showToast({ title: '预览功能开发中', icon: 'none' })
}

const saveScript = () => {
  if (!editingForm.title.trim()) {
    uni.showToast({ title: '请输入剧本标题', icon: 'none' })
    return
  }

  dramaStore.updateEditingScript({
    title: editingForm.title,
    description: editingForm.description,
    characterIds: editingForm.characterIds,
    dialogues: editingForm.dialogues
  })

  const result = dramaStore.saveScript()
  if (result) {
    uni.showToast({ title: '保存成功', icon: 'success' })
    isEditing.value = false
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const goBack = () => {
  if (isEditing.value) {
    uni.showModal({
      title: '提示',
      content: '是否保存当前编辑？',
      success: (res) => {
        if (res.confirm) {
          saveScript()
        }
        isEditing.value = false
        dramaStore.cancelEditing()
      }
    })
  } else {
    uni.navigateBack()
  }
}

onMounted(() => {
  dramaStore.loadCharacters()
  dramaStore.loadScripts()
})
</script>

<style scoped>
.script-creation-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding-bottom: 120rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}

.nav-back {
  width: 60rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #ffffff;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-right {
  display: flex;
  align-items: center;
}

.save-btn {
  font-size: 28rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
}

/* Script List Area */
.script-list-area {
  padding: 30rpx 40rpx;
}

.create-new-section {
  margin-bottom: 30rpx;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: rgba(168, 85, 247, 0.2);
  border: 2rpx dashed rgba(168, 85, 247, 0.5);
  border-radius: 20rpx;
  padding: 30rpx;
}

.create-icon {
  font-size: 36rpx;
}

.create-text {
  font-size: 28rpx;
  color: #a855f7;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.script-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.script-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.script-info {
  flex: 1;
}

.script-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
  display: block;
}

.script-meta {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
}

.script-actions {
  display: flex;
  gap: 16rpx;
}

.action-icon {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

/* Script Edit Area */
.script-edit-area {
  padding: 30rpx 40rpx;
}

.info-section {
  margin-bottom: 30rpx;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12rpx;
  display: block;
}

.input-field {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.textarea-field {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.6;
}

.placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.character-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  display: block;
}

.character-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.character-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid transparent;
  border-radius: 30rpx;
}

.character-chip.selected {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
}

.chip-icon {
  font-size: 28rpx;
}

.chip-name {
  font-size: 24rpx;
  color: #ffffff;
}

/* Dialogue Section */
.dialogue-section {
  margin-bottom: 30rpx;
}

.dialogue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.add-dialogue-btn {
  font-size: 24rpx;
  color: #a855f7;
}

.dialogue-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.dialogue-card {
  display: flex;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 20rpx;
}

.dialogue-order {
  width: 50rpx;
  height: 50rpx;
  background: rgba(168, 85, 247, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #ffffff;
  flex-shrink: 0;
}

.dialogue-content {
  flex: 1;
}

.dialogue-speaker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.speaker-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
}

.speaker-name {
  font-size: 22rpx;
  color: #a855f7;
}

.dialogue-text {
  font-size: 26rpx;
  color: #ffffff;
  line-height: 1.5;
  margin-bottom: 8rpx;
}

.dialogue-emotion {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
}

.dialogue-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.action-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.empty-dialogue {
  text-align: center;
  padding: 40rpx;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
}

.preview-section {
  margin-top: 20rpx;
}

.preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #ffffff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.modal-content {
  width: 100%;
  background: #1a1a2e;
  border-radius: 40rpx 40rpx 0 0;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.modal-close {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.6);
}

.modal-body {
  padding: 30rpx 40rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.character-select-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.char-select-item {
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.char-select-item.selected {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
}

.emotion-select-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.emotion-item {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid transparent;
  border-radius: 50%;
  font-size: 36rpx;
}

.emotion-item.selected {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  color: #ffffff;
}

.modal-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}
</style>
