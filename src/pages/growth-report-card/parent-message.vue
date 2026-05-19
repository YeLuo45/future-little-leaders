<!--
  V87 Parent Message Edit Page
  家长寄语编辑页面
-->
<template>
  <view class="parent-message-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">家长寄语</text>
      <view class="nav-right" @click="saveMessage">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <scroll-view class="message-scroll" scroll-y>
      <!-- 宝宝信息 -->
      <view class="baby-info-card">
        <text class="baby-emoji">{{ baby?.emoji || '👶' }}</text>
        <view class="baby-detail">
          <text class="baby-name">{{ baby?.name || '宝宝' }}</text>
          <text class="semester-text">{{ formatSemester(semester) }}</text>
        </view>
      </view>

      <!-- 鼓励留言 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-icon">💗</text>
          <text class="section-title">鼓励留言</text>
        </view>
        <textarea
          class="message-input"
          v-model="encouragement"
          placeholder="写下对孩子的鼓励和认可..."
          maxlength="300"
        />
        <text class="char-count">{{ encouragement.length }}/300</text>
      </view>

      <!-- 期望设定 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-icon">🎯</text>
          <text class="section-title">期望设定</text>
        </view>
        <view class="expectations-list">
          <view
            v-for="(exp, index) in expectations"
            :key="index"
            class="expectation-item"
          >
            <text class="exp-number">{{ index + 1 }}</text>
            <textarea
              class="exp-input"
              v-model="expectations[index]"
              placeholder="描述期望..."
              maxlength="100"
            />
            <text class="exp-remove" @click="removeExpectation(index)">×</text>
          </view>
        </view>
        <view class="add-expectation" @click="addExpectation" v-if="expectations.length < 5">
          <text class="add-icon">+</text>
          <text class="add-text">添加期望</text>
        </view>
      </view>

      <!-- 预设模板 -->
      <view class="section-card templates-section">
        <view class="section-header">
          <text class="section-icon">📋</text>
          <text class="section-title">快捷模板</text>
        </view>
        <view class="template-list">
          <view
            class="template-item"
            v-for="template in templates"
            :key="template.id"
            @click="applyTemplate(template)"
          >
            <text class="template-icon">{{ template.icon }}</text>
            <text class="template-title">{{ template.title }}</text>
          </view>
        </view>
      </view>

      <!-- 寄语预览 -->
      <view class="section-card preview-section" v-if="encouragement || expectations.length > 0">
        <view class="section-header">
          <text class="section-icon">👁️</text>
          <text class="section-title">寄语预览</text>
        </view>
        <view class="preview-card">
          <view class="preview-header">
            <text class="preview-emoji">💌</text>
            <text class="preview-title">家长寄语</text>
          </view>
          <view class="preview-content">
            <view class="preview-section" v-if="encouragement">
              <text class="preview-label">鼓励留言</text>
              <text class="preview-text">{{ encouragement }}</text>
            </view>
            <view class="preview-section" v-if="expectations.length > 0">
              <text class="preview-label">期望设定</text>
              <view class="preview-expectations">
                <view
                  v-for="(exp, index) in expectations.filter(e => e.trim())"
                  :key="index"
                  class="preview-exp-item"
                >
                  <text class="preview-exp-bullet">•</text>
                  <text class="preview-exp-text">{{ exp }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="preview-footer">
            <text class="preview-date">{{ formatDate }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGrowthReportCardStore } from '@/stores/growthReportCardStore.js'
import growthReportCardService from '@/services/growthReportCardService.js'

export default {
  setup() {
    const store = useGrowthReportCardStore()

    // 页面状态
    const cardId = ref('')
    const babyId = ref('')
    const semester = ref('')
    const baby = ref(null)

    // 表单数据
    const encouragement = ref('')
    const expectations = ref([])

    // 预设模板
    const templates = [
      {
        id: 1,
        icon: '🌟',
        title: '肯定鼓励',
        encouragement: '亲爱的宝贝，这学期你的努力妈妈/爸爸都看在眼里，你是最棒的！继续保持哦~',
        expectations: ['继续保持好奇心', '学会管理时间']
      },
      {
        id: 2,
        icon: '💪',
        title: '成长激励',
        encouragement: '看到你一点一滴的进步，我们感到非常欣慰和骄傲！加油！',
        expectations: ['提高专注力', '加强体育锻炼']
      },
      {
        id: 3,
        icon: '📚',
        title: '学习期望',
        encouragement: '学习是一场马拉松，坚持就是胜利！爸爸妈妈相信你一定能做到！',
        expectations: ['养成阅读习惯', '认真完成作业']
      },
      {
        id: 4,
        icon: '❤️',
        title: '情感支持',
        encouragement: '无论成绩如何，你都是我们最爱的宝贝。健康快乐成长最重要！',
        expectations: ['学会表达情感', '多与家人沟通']
      }
    ]

    // 格式化日期
    const formatDate = computed(() => {
      const now = new Date()
      return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
    })

    // 初始化
    onMounted(() => {
      // 获取页面参数
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage.options || {}

      cardId.value = options.cardId || ''
      babyId.value = options.babyId || ''
      semester.value = options.semester || store.currentSemester

      // 获取宝宝信息
      try {
        const babyStore = require('@/stores/babyStore').useBabyStore()
        baby.value = babyStore.babies.find(b => b.id === babyId.value)
      } catch (e) {
        console.error('[ParentMessage] Load baby failed:', e)
      }

      // 加载已有寄语
      if (cardId.value) {
        const existingMessage = store.getParentMessageByCardId(cardId.value)
        if (existingMessage) {
          encouragement.value = existingMessage.encouragement || ''
          expectations.value = existingMessage.expectations || []
        }
      }
    })

    // 格式化学期
    const formatSemester = (sem) => {
      return growthReportCardService.formatSemester(sem)
    }

    // 添加期望
    const addExpectation = () => {
      if (expectations.value.length < 5) {
        expectations.value.push('')
      }
    }

    // 移除期望
    const removeExpectation = (index) => {
      expectations.value.splice(index, 1)
    }

    // 应用模板
    const applyTemplate = (template) => {
      encouragement.value = template.encouragement
      expectations.value = [...template.expectations]
    }

    // 保存寄语
    const saveMessage = () => {
      if (!cardId.value) {
        uni.showToast({ title: '请先创建报告卡', icon: 'none' })
        return
      }

      const message = store.saveParentMessage({
        cardId: cardId.value,
        babyId: babyId.value,
        encouragement: encouragement.value,
        expectations: expectations.value.filter(e => e.trim())
      })

      uni.showToast({ title: '保存成功', icon: 'success' })
      uni.$emit('growthReportCard:updated')
      setTimeout(() => {
        goBack()
      }, 1000)
    }

    // 返回
    const goBack = () => {
      uni.navigateBack()
    }

    return {
      // 状态
      cardId,
      babyId,
      semester,
      baby,
      encouragement,
      expectations,
      templates,
      formatDate,

      // 方法
      formatSemester,
      addExpectation,
      removeExpectation,
      applyTemplate,
      saveMessage,
      goBack
    }
  }
}
</script>

<style scoped>
.parent-message-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 20px 15px;
  background: linear-gradient(135deg, #EB2F96 0%, #F53F81 100%);
  color: #fff;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

.save-btn {
  font-size: 14px;
  color: #fff;
}

.message-scroll {
  height: calc(100vh - 75px);
}

/* 宝宝信息卡片 */
.baby-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.baby-emoji {
  font-size: 40px;
}

.baby-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.baby-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.semester-text {
  font-size: 13px;
  color: #999;
}

/* 通用卡片 */
.section-card {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* 留言输入 */
.message-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background: #f9f9f9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 11px;
  color: #999;
  margin-top: 5px;
}

/* 期望列表 */
.expectations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expectation-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.exp-number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #667eea;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 10px;
}

.exp-input {
  flex: 1;
  padding: 10px 12px;
  background: #f9f9f9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  min-height: 40px;
}

.exp-remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 8px;
}

.add-expectation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 10px;
}

.add-icon {
  font-size: 18px;
  color: #667eea;
}

.add-text {
  font-size: 14px;
  color: #667eea;
}

/* 模板列表 */
.template-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.template-icon {
  font-size: 20px;
}

.template-title {
  font-size: 13px;
  color: #333;
}

/* 预览卡片 */
.preview-card {
  background: linear-gradient(135deg, #FFF9F9 0%, #FFF0F5 100%);
  border: 1px solid rgba(235, 47, 150, 0.2);
  border-radius: 12px;
  padding: 15px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(235, 47, 150, 0.3);
}

.preview-emoji {
  font-size: 20px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #EB2F96;
}

.preview-content {
  margin-bottom: 10px;
}

.preview-section {
  margin-bottom: 12px;
}

.preview-section:last-child {
  margin-bottom: 0;
}

.preview-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.preview-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.preview-expectations {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-exp-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.preview-exp-bullet {
  color: #EB2F96;
  font-weight: 600;
}

.preview-exp-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.preview-footer {
  text-align: right;
  padding-top: 8px;
  border-top: 1px dashed rgba(235, 47, 150, 0.3);
}

.preview-date {
  font-size: 11px;
  color: #999;
}

.bottom-space {
  height: 40px;
}
</style>
