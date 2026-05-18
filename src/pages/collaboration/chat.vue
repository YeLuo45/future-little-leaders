<!-- V21 Chat — 家校聊天页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">{{ currentTeacherName || '选择教师' }}</text>
      <view class="nav-right">
        <text class="icon" @tap="showTeacherList = !showTeacherList">👥</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar" v-if="showTabBar">
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'chat' }"
        @tap="activeTab = 'chat'"
      >
        <text class="tab-text">聊天</text>
      </view>
      <view 
        class="tab-item"
        :class="{ active: activeTab === 'reminder' }"
        @tap="activeTab = 'reminder'"
      >
        <text class="tab-text">提醒配置</text>
      </view>
    </view>

    <!-- 聊天区域 -->
    <view class="chat-area" v-if="activeTab === 'chat'">
      <!-- 教师选择提示 -->
      <view class="teacher-prompt" v-if="!activeTeacherId">
        <text class="prompt-icon">👈</text>
        <text class="prompt-text">请先选择一位教师开始聊天</text>
      </view>

      <!-- 消息列表 -->
      <scroll-view 
        scroll-y 
        class="message-list" 
        :scroll-top="scrollTop"
        :scroll-into-view="scrollIntoView"
        v-else
      >
        <view class="messages-wrapper">
          <ChatBubble
            v-for="msg in chatMessages"
            :key="msg.id"
            :message="msg"
            :avatar="getTeacherAvatar(msg.teacherId)"
          />
        </view>
        <view id="scroll-bottom"></view>
      </scroll-view>

      <!-- 输入区域 -->
      <view class="input-area" v-if="activeTeacherId">
        <view class="input-tools">
          <text class="tool-icon" @tap="switchInputType('text')">📝</text>
          <text class="tool-icon" @tap="switchInputType('image')">🖼️</text>
          <text class="tool-icon" @tap="switchInputType('voice')">🎤</text>
        </view>
        
        <!-- 文本输入 -->
        <view class="text-input-wrapper" v-if="inputType === 'text'">
          <input 
            type="text"
            class="text-input"
            v-model="inputText"
            placeholder="输入消息..."
            @confirm="sendTextMessage"
          />
          <button class="send-btn" @tap="sendTextMessage" :disabled="!inputText.trim()">发送</button>
        </view>

        <!-- 语音输入 -->
        <view class="voice-input-wrapper" v-if="inputType === 'voice'">
          <button 
            class="voice-btn"
            :class="{ recording: isRecording }"
            @touchstart="startRecord"
            @touchend="endRecord"
          >
            <text class="voice-icon">🎤</text>
            <text class="voice-text">{{ isRecording ? '松开发送' : '按住说话' }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 提醒配置区域 -->
    <view class="reminder-area" v-if="activeTab === 'reminder'">
      <scroll-view scroll-y class="reminder-scroll">
        <!-- 智能提醒配置 -->
        <ReminderConfig
          :modelValue="reminderConfig"
          @change="onReminderChange"
        />

        <!-- 通知渠道 -->
        <view class="plugin-section">
          <NotificationPlugin
            :modelValue="pluginConfig"
            @change="onPluginChange"
          />
        </view>

        <!-- 测试区域 -->
        <view class="test-buttons">
          <button class="test-btn" @tap="testTaskIncomplete">测试任务未完成</button>
          <button class="test-btn" @tap="testEscalation">测试升级提醒</button>
          <button class="test-btn" @tap="testAchievement">测试成就提醒</button>
        </view>
      </scroll-view>
    </view>

    <!-- 教师选择列表 -->
    <view class="teacher-list-overlay" v-if="showTeacherList" @tap="showTeacherList = false">
      <view class="teacher-list" @tap.stop>
        <view class="list-header">
          <text class="list-title">选择教师</text>
        </view>
        <view 
          class="teacher-item"
          v-for="teacher in allTeachers"
          :key="teacher.id"
          @tap="selectTeacher(teacher)"
        >
          <image class="teacher-avatar" :src="teacher.avatar || '/static/default-avatar.png'" />
          <view class="teacher-info">
            <text class="teacher-name">{{ teacher.name }}</text>
            <text class="teacher-class">{{ getTeacherClass(teacher.classId) }}</text>
          </view>
          <text class="unread-badge" v-if="getUnreadCount(teacher.id) > 0">
            {{ getUnreadCount(teacher.id) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useCollaborationStore } from '@/stores/collaborationStore'
import NotificationBus from '@/services/notificationBus'
import ChatBubble from '@/components/collaboration/ChatBubble.vue'
import ReminderConfig from '@/components/collaboration/ReminderConfig.vue'
import NotificationPlugin from '@/components/collaboration/NotificationPlugin.vue'

export default {
  components: { ChatBubble, ReminderConfig, NotificationPlugin },
  setup() {
    const store = useCollaborationStore()

    // State
    const activeTab = ref('chat')
    const showTabBar = ref(false)
    const inputText = ref('')
    const inputType = ref('text')
    const isRecording = ref(false)
    const scrollTop = ref(0)
    const scrollIntoView = ref('')
    const showTeacherList = ref(false)
    const reminderConfig = ref(store.reminderConfig)
    const pluginConfig = ref(NotificationBus.getChannelStatus())

    // Computed
    const allTeachers = computed(() => store.teachers)
    const activeTeacherId = computed(() => store.activeTeacherId)
    const chatMessages = computed(() => store.activeChatMessages)
    const currentTeacherName = computed(() => {
      if (!activeTeacherId.value) return ''
      const teacher = store.teachers.find(t => t.id === activeTeacherId.value)
      return teacher?.name || ''
    })

    // Watch for new messages
    watch(() => store.activeChatMessages.length, () => {
      nextTick(() => {
        scrollIntoView.value = 'scroll-bottom'
      })
    })

    // Listen for new messages
    onMounted(() => {
      uni.$on('collab:newMessage', (msg) => {
        if (msg.teacherId === activeTeacherId.value) {
          nextTick(() => {
            scrollIntoView.value = 'scroll-bottom'
          })
        }
      })
    })

    // Methods
    const getTeacherAvatar = (teacherId) => {
      const teacher = store.teachers.find(t => t.id === teacherId)
      return teacher?.avatar || ''
    }

    const getTeacherClass = (classId) => {
      const cls = store.classes.find(c => c.id === classId)
      return cls?.name || ''
    }

    const getUnreadCount = (teacherId) => {
      const msgs = store.chatConversations[teacherId] || []
      return msgs.filter(m => !m.read && m.role !== 'me').length
    }

    const selectTeacher = (teacher) => {
      store.selectTeacher(teacher.id)
      showTeacherList.value = false
      activeTab.value = 'chat'
      nextTick(() => {
        scrollIntoView.value = 'scroll-bottom'
      })
    }

    const sendTextMessage = () => {
      if (!inputText.value.trim()) return
      store.sendMessage(inputText.value, 'text')
      inputText.value = ''
    }

    const switchInputType = (type) => {
      inputType.value = type
    }

    const startRecord = () => {
      isRecording.value = true
      // Mock: 开始录音
      uni.showToast({ title: '开始录音', icon: 'none' })
    }

    const endRecord = () => {
      isRecording.value = false
      // Mock: 结束录音并发送
      store.sendMessage('语音消息', 'voice')
      uni.showToast({ title: '语音已发送', icon: 'success' })
    }

    const goBack = () => {
      uni.navigateBack()
    }

    const onReminderChange = ({ type, channel, enabled }) => {
      store.updateReminderChannel(type, channel, enabled)
    }

    const onPluginChange = ({ channel, enabled }) => {
      NotificationBus.setChannelEnabled(channel, enabled)
      pluginConfig.value = NotificationBus.getChannelStatus()
    }

    const testTaskIncomplete = async () => {
      await NotificationBus.sendTaskIncompleteReminder(
        store.currentBabyId,
        '小明',
        '整理书包'
      )
      uni.showToast({ title: '已发送任务未完成提醒', icon: 'success' })
    }

    const testEscalation = async () => {
      await NotificationBus.sendEscalationReminder(
        store.currentBabyId,
        '小明',
        '整理书包'
      )
      uni.showToast({ title: '已发送升级提醒', icon: 'success' })
    }

    const testAchievement = async () => {
      await NotificationBus.sendAchievementNotification(
        store.currentBabyId,
        '小明',
        '勤劳小蜜蜂'
      )
      uni.showToast({ title: '已发送成就通知', icon: 'success' })
    }

    // Check URL params for tab
    onMounted(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage?.options || {}
      
      if (options.tab === 'reminder') {
        showTabBar.value = true
        activeTab.value = 'reminder'
      } else {
        showTabBar.value = false
      }
    })

    return {
      activeTab,
      showTabBar,
      inputText,
      inputType,
      isRecording,
      scrollTop,
      scrollIntoView,
      showTeacherList,
      reminderConfig,
      pluginConfig,
      allTeachers,
      activeTeacherId,
      chatMessages,
      currentTeacherName,
      getTeacherAvatar,
      getTeacherClass,
      getUnreadCount,
      selectTeacher,
      sendTextMessage,
      switchInputType,
      startRecord,
      endRecord,
      goBack,
      onReminderChange,
      onPluginChange,
      testTaskIncomplete,
      testEscalation,
      testAchievement
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F0FDF4;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.nav-left, .nav-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 40rpx;
  color: #333;
}

.tab-bar {
  display: flex;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.tab-item {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
}

.tab-item.active {
  border-bottom: 4rpx solid #059669;
}

.tab-text {
  font-size: 28rpx;
  color: #999;
}

.tab-item.active .tab-text {
  color: #059669;
  font-weight: 500;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.teacher-prompt {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx;
}

.prompt-icon {
  font-size: 60rpx;
  margin-bottom: 24rpx;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-10rpx); }
}

.prompt-text {
  font-size: 28rpx;
  color: #999;
}

.message-list {
  flex: 1;
  min-height: 0;
}

.messages-wrapper {
  padding: 24rpx 0;
}

.input-area {
  background: #FFFFFF;
  border-top: 1rpx solid #F0F0F0;
  padding: 16rpx 24rpx;
}

.input-tools {
  display: flex;
  gap: 32rpx;
  margin-bottom: 16rpx;
}

.tool-icon {
  font-size: 48rpx;
}

.text-input-wrapper {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.text-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: #F5F5F5;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  background: #059669;
  color: #FFFFFF;
  border-radius: 36rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.send-btn[disabled] {
  background: #CCCCCC;
}

.voice-input-wrapper {
  display: flex;
  justify-content: center;
}

.voice-btn {
  width: 100%;
  height: 80rpx;
  background: #F0FDF4;
  border: 2rpx solid #059669;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin: 0;
}

.voice-btn.recording {
  background: #059669;
}

.voice-icon {
  font-size: 36rpx;
}

.voice-text {
  font-size: 28rpx;
  color: #059669;
}

.voice-btn.recording .voice-text {
  color: #FFFFFF;
}

.reminder-area {
  flex: 1;
  overflow: hidden;
}

.reminder-scroll {
  height: 100%;
  padding: 24rpx;
}

.plugin-section {
  margin-top: 24rpx;
}

.test-buttons {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.test-btn {
  background: #FFFFFF;
  border: 1rpx solid #E8E8E8;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  margin: 0;
}

.teacher-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.teacher-list {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;
}

.list-header {
  padding: 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.teacher-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.teacher-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f0f0f0;
  margin-right: 20rpx;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.teacher-class {
  font-size: 24rpx;
  color: #999;
}

.unread-badge {
  background: #F5222D;
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  min-width: 32rpx;
  text-align: center;
}
</style>
