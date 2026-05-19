<!--
  V87 Growth Report Card Page
  成长报告卡页面
  综合素质报告、学期总结、能力雷达图、家长寄语
-->
<template>
  <view class="growth-report-card-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">成长报告卡</text>
      <view class="nav-right" @click="goToHistory">
        <text class="icon">📋</text>
      </view>
    </view>

    <!-- 宝宝切换器 -->
    <view class="baby-selector" v-if="babies.length > 1">
      <view
        v-for="baby in babies"
        :key="baby.id"
        class="baby-chip"
        :class="{ active: currentBabyId === baby.id }"
        @click="switchBaby(baby.id)"
      >
        <text class="baby-emoji">{{ baby.emoji || '👶' }}</text>
        <text class="baby-name">{{ baby.name }}</text>
      </view>
    </view>

    <!-- 学期选择器 -->
    <view class="semester-selector">
      <view class="semester-tabs">
        <view
          v-for="sem in availableSemesters"
          :key="sem.value"
          class="semester-tab"
          :class="{ active: currentSemester === sem.value }"
          @click="selectSemester(sem.value)"
        >
          <text class="semester-label">{{ sem.label }}</text>
        </view>
      </view>
      <view class="semester-date-range">
        <text>{{ formatSemesterDateRange(currentSemester) }}</text>
      </view>
    </view>

    <!-- 报告卡主体 -->
    <scroll-view class="main-scroll" scroll-y @scrolltolower="loadMore">
      <!-- 综合素质报告 -->
      <view class="section-card overall-report">
        <view class="section-header">
          <text class="section-icon">📊</text>
          <text class="section-title">综合素质报告</text>
        </view>

        <!-- 综合评分 -->
        <view class="overall-score-section">
          <view class="score-circle" :class="scoreClass">
            <text class="score-value">{{ currentCard?.overallScore || 0 }}</text>
            <text class="score-unit">/ 5</text>
          </view>
          <view class="score-label">
            <text class="score-title">综合评价</text>
            <text class="score-desc">{{ scoreDescription }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="btn btn-primary" @click="editReportCard">
            {{ currentCard ? '编辑报告' : '生成报告' }}
          </button>
          <button class="btn btn-secondary" @click="publishReportCard" v-if="currentCard?.status === 'draft'">
            发布报告
          </button>
        </view>
      </view>

      <!-- 能力雷达图 -->
      <view class="section-card ability-radar">
        <view class="section-header">
          <text class="section-icon">🎯</text>
          <text class="section-title">能力雷达图</text>
        </view>

        <!-- 雷达图 -->
        <view class="radar-chart-container">
          <canvas
            canvas-id="abilityRadarCanvas"
            id="abilityRadarCanvas"
            class="radar-canvas"
            @touchstart="onCanvasTouch"
          ></canvas>
          <view class="radar-legend">
            <view
              v-for="item in radarData"
              :key="item.dimension"
              class="legend-item"
              @click="showDimensionDetail(item)"
            >
              <view class="legend-color" :style="{ background: item.color }"></view>
              <text class="legend-label">{{ item.label }}</text>
              <text class="legend-value">{{ item.value }}分</text>
            </view>
          </view>
        </view>

        <!-- 多维度分析 -->
        <view class="dimension-list">
          <view
            v-for="(item, index) in radarData"
            :key="item.dimension"
            class="dimension-item"
            :class="{ improved: progressData?.dimensionProgress?.[item.dimension]?.improved }"
            @click="showDimensionDetail(item)"
          >
            <view class="dimension-rank">{{ index + 1 }}</view>
            <view class="dimension-icon" :style="{ background: item.color }">
              <text>{{ item.icon }}</text>
            </view>
            <view class="dimension-info">
              <text class="dimension-name">{{ item.label }}</text>
              <view class="dimension-bar-wrap">
                <view
                  class="dimension-bar"
                  :style="{
                    width: (item.value / item.maxValue * 100) + '%',
                    background: item.color
                  }"
                ></view>
              </view>
            </view>
            <view class="dimension-score">
              <text class="score-num">{{ item.value }}</text>
              <text class="score-max">/{{ item.maxValue }}</text>
            </view>
            <view class="dimension-change" v-if="progressData?.dimensionProgress?.[item.dimension]">
              <text :class="progressData.dimensionProgress[item.dimension].improved ? 'up' : 'down'">
                {{ progressData.dimensionProgress[item.dimension].improved ? '↑' : '↓' }}
                {{ Math.abs(progressData.dimensionProgress[item.dimension].change) }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 学期对比 -->
      <view class="section-card semester-compare" v-if="semesterComparison.length > 1">
        <view class="section-header">
          <text class="section-icon">📈</text>
          <text class="section-title">学期对比</text>
        </view>

        <view class="compare-chart">
          <view
            v-for="(item, index) in semesterComparison"
            :key="item.semester"
            class="compare-item"
          >
            <view class="compare-semester">{{ formatSemesterShort(item.semester) }}</view>
            <view class="compare-bar-wrap">
              <view
                class="compare-bar"
                :style="{
                  height: (item.overallScore / 5 * 100) + '%',
                  background: index === semesterComparison.length - 1 ? '#667eea' : '#ccc'
                }"
              ></view>
            </view>
            <view class="compare-score">{{ item.overallScore }}</view>
          </view>
        </view>
      </view>

      <!-- 学期总结 -->
      <view class="section-card semester-summary" v-if="currentCard?.summary">
        <view class="section-header">
          <text class="section-icon">📝</text>
          <text class="section-title">学期总结</text>
        </view>
        <view class="summary-content">
          <text>{{ currentCard.summary }}</text>
        </view>

        <!-- 亮点 -->
        <view class="summary-section" v-if="currentCard.highlights?.length">
          <view class="summary-label">
            <text class="label-icon">🌟</text>
            <text>亮点</text>
          </view>
          <view class="highlights-list">
            <view
              v-for="(item, index) in currentCard.highlights"
              :key="index"
              class="highlight-tag"
            >
              <text>{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 待提升 -->
        <view class="summary-section" v-if="currentCard.improvements?.length">
          <view class="summary-label">
            <text class="label-icon">📝</text>
            <text>待提升</text>
          </view>
          <view class="improvements-list">
            <view
              v-for="(item, index) in currentCard.improvements"
              :key="index"
              class="improvement-tag"
            >
              <text>{{ item }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 家长寄语 -->
      <view class="section-card parent-message">
        <view class="section-header">
          <text class="section-icon">💌</text>
          <text class="section-title">家长寄语</text>
          <view class="edit-btn" @click="editParentMessage" v-if="currentCard">
            <text>{{ currentCard.parentMessage ? '编辑' : '添加' }}</text>
          </view>
        </view>

        <view v-if="currentCard?.parentMessage" class="message-content">
          <!-- 鼓励留言 -->
          <view class="message-section" v-if="currentCard.parentMessage.encouragement">
            <view class="message-label">鼓励留言</view>
            <text class="message-text">{{ currentCard.parentMessage.encouragement }}</text>
          </view>

          <!-- 期望设定 -->
          <view class="message-section" v-if="currentCard.parentMessage.expectations?.length">
            <view class="message-label">期望设定</view>
            <view class="expectations-list">
              <view
                v-for="(exp, index) in currentCard.parentMessage.expectations"
                :key="index"
                class="expectation-item"
              >
                <text class="exp-bullet">•</text>
                <text class="exp-text">{{ exp }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-message">
          <text class="empty-hint">点击添加家长寄语，记录对孩子的期望和鼓励</text>
          <button class="btn btn-outline" @click="editParentMessage">添加寄语</button>
        </view>
      </view>

      <!-- 进步追踪 -->
      <view class="section-card progress-tracker" v-if="progressData">
        <view class="section-header">
          <text class="section-icon">🚀</text>
          <text class="section-title">进步追踪</text>
        </view>

        <view class="progress-summary">
          <view class="progress-item">
            <text class="progress-label">较上学期</text>
            <text class="progress-value" :class="progressData.overallProgress.change >= 0 ? 'positive' : 'negative'">
              {{ progressData.overallProgress.change >= 0 ? '+' : '' }}{{ progressData.overallProgress.change }}
            </text>
          </view>
          <view class="progress-item">
            <text class="progress-label">当前学期</text>
            <text class="progress-value">{{ progressData.overallProgress.current }}</text>
          </view>
          <view class="progress-item">
            <text class="progress-label">上学期</text>
            <text class="progress-value">{{ progressData.overallProgress.previous }}</text>
          </view>
        </view>

        <view class="progress-details">
          <view
            v-for="(prog, dim) in progressData.dimensionProgress"
            :key="dim"
            class="progress-dim-item"
            :class="{ improved: prog.improved }"
          >
            <text class="dim-icon">{{ ABILITY_INFO[dim]?.icon }}</text>
            <text class="dim-name">{{ ABILITY_INFO[dim]?.label }}</text>
            <text class="dim-change" :class="prog.improved ? 'up' : 'down'">
              {{ prog.improved ? '↑' : '↓' }}{{ Math.abs(prog.change) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGrowthReportCardStore } from '@/stores/growthReportCardStore.js'
import growthReportCardService, { ABILITY_INFO, ABILITY_DIMENSION } from '@/services/growthReportCardService.js'

export default {
  setup() {
    const store = useGrowthReportCardStore()

    // 状态
    const babies = ref([])
    const currentBabyId = ref('')
    const currentSemester = ref('')
    const currentCard = ref(null)
    const radarData = ref([])
    const semesterComparison = ref([])
    const progressData = ref(null)
    const radarCanvasWidth = ref(300)
    const radarCanvasHeight = ref(300)

    // 可用学期
    const availableSemesters = computed(() => {
      const current = store.currentSemester
      const semesters = []
      for (let i = 0; i < 4; i++) {
        const [year, num] = current.split('-').map(Number)
        const targetYear = year - Math.floor((parseInt(num) + i - 1) / 2)
        const targetNum = ((num - 1 - i + 2) % 2) + 1
        const sem = `${targetYear}-${targetNum}`
        semesters.unshift({
          value: sem,
          label: growthReportCardService.formatSemester(sem)
        })
      }
      return semesters
    })

    // 评分描述
    const scoreDescription = computed(() => {
      const score = currentCard.value?.overallScore || 0
      if (score >= 4.5) return '表现卓越'
      if (score >= 4) return '表现优秀'
      if (score >= 3.5) return '表现良好'
      if (score >= 3) return '表现一般'
      if (score >= 2) return '需要努力'
      return '加油提升'
    })

    // 评分样式类
    const scoreClass = computed(() => {
      const score = currentCard.value?.overallScore || 0
      if (score >= 4) return 'excellent'
      if (score >= 3) return 'good'
      return 'normal'
    })

    // 初始化
    onMounted(() => {
      store.init()
      loadBabies()
      currentSemester.value = store.currentSemester

      // 获取canvas尺寸
      nextTick(() => {
        const query = uni.createSelectorQuery()
        query.select('.radar-canvas').boundingClientRect(rect => {
          if (rect) {
            radarCanvasWidth.value = rect.width
            radarCanvasHeight.value = rect.height
            drawRadarChart()
          }
        }).exec()
      })
    })

    // 加载宝宝列表
    const loadBabies = () => {
      try {
        const babyStore = require('@/stores/babyStore').useBabyStore()
        babies.value = babyStore.babies || []
        const storedId = uni.getStorageSync('currentBabyId')
        currentBabyId.value = storedId || (babies.value[0]?.id || '')
        loadReportCardData()
      } catch (e) {
        console.error('[GrowthReportCard] Load babies failed:', e)
      }
    }

    // 加载报告卡数据
    const loadReportCardData = () => {
      if (!currentBabyId.value) return

      // 加载报告卡
      currentCard.value = store.getReportCardBySemester(currentSemester.value)
      if (!currentCard.value) {
        // 尝试获取该宝宝最近的报告卡
        const cards = store.getReportCardsByBabyId(currentBabyId.value)
        if (cards.length > 0) {
          currentCard.value = cards[0]
          currentSemester.value = cards[0].semester
        }
      }

      // 加载雷达图数据
      radarData.value = store.getRadarDataByBaby(currentBabyId.value)

      // 加载学期对比
      store.loadSemesterComparison(currentBabyId.value)
      semesterComparison.value = store.semesterComparison

      // 加载进步数据
      store.loadProgressData(currentBabyId.value)
      progressData.value = store.progressData

      // 重绘雷达图
      nextTick(() => {
        drawRadarChart()
      })
    }

    // 切换宝宝
    const switchBaby = (babyId) => {
      currentBabyId.value = babyId
      uni.setStorageSync('currentBabyId', babyId)
      loadReportCardData()
    }

    // 选择学期
    const selectSemester = (semester) => {
      currentSemester.value = semester
      loadReportCardData()
    }

    // 格式化学期日期范围
    const formatSemesterDateRange = (semester) => {
      if (!semester) return ''
      const range = growthReportCardService.getSemesterDateRange(semester)
      return `${range.startDate} ~ ${range.endDate}`
    }

    // 简短格式化学期
    const formatSemesterShort = (semester) => {
      if (!semester) return ''
      const [year, num] = semester.split('-')
      return `${year}年${num === '1' ? '秋' : '春'}`
    }

    // 绘制雷达图
    const drawRadarChart = () => {
      if (!radarData.value || radarData.value.length === 0) return

      const ctx = uni.createCanvasContext('abilityRadarCanvas')
      const width = radarCanvasWidth.value
      const height = radarCanvasHeight.value
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 40

      // 清空画布
      ctx.clearRect(0, 0, width, height)

      // 绘制背景多边形（网格）
      const sides = radarData.value.length
      const angleStep = Math.PI * 2 / sides

      // 绘制3层网格
      for (let level = 1; level <= 3; level++) {
        const levelRadius = radius * (level / 3)
        ctx.beginPath()
        for (let i = 0; i <= sides; i++) {
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + Math.cos(angle) * levelRadius
          const y = centerY + Math.sin(angle) * levelRadius
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.strokeStyle = '#eee'
        ctx.stroke()
      }

      // 绘制轴线
      for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = '#ddd'
        ctx.stroke()

        // 绘制标签
        const labelRadius = radius + 25
        const labelX = centerX + Math.cos(angle) * labelRadius
        const labelY = centerY + Math.sin(angle) * labelRadius
        ctx.fillStyle = '#666'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(radarData.value[i].label, labelX, labelY)
      }

      // 绘制数据区域
      ctx.beginPath()
      for (let i = 0; i < sides; i++) {
        const value = radarData.value[i].value
        const maxValue = radarData.value[i].maxValue || 5
        const levelRadius = radius * (value / maxValue)
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * levelRadius
        const y = centerY + Math.sin(angle) * levelRadius
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(102, 126, 234, 0.3)'
      ctx.fill()
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 2
      ctx.stroke()

      // 绘制数据点
      for (let i = 0; i < sides; i++) {
        const value = radarData.value[i].value
        const maxValue = radarData.value[i].maxValue || 5
        const levelRadius = radius * (value / maxValue)
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * levelRadius
        const y = centerY + Math.sin(angle) * levelRadius
        const color = radarData.value[i].color

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.draw()
    }

    // Canvas触摸事件
    const onCanvasTouch = (e) => {
      // 可以实现点击检测数据点
    }

    // 显示维度详情
    const showDimensionDetail = (item) => {
      uni.showModal({
        title: item.label,
        content: `当前得分：${item.value}/${item.maxValue}\n维度：${item.label}\n图标：${item.icon}`,
        showCancel: false
      })
    }

    // 编辑报告卡
    const editReportCard = () => {
      uni.navigateTo({
        url: `/pages/growth-report-card/edit?babyId=${currentBabyId.value}&semester=${currentSemester.value}`
      })
    }

    // 发布报告卡
    const publishReportCard = () => {
      if (!currentCard.value) return
      store.saveReportCard({
        ...currentCard.value,
        status: 'published'
      })
      uni.showToast({ title: '发布成功', icon: 'success' })
      loadReportCardData()
    }

    // 编辑家长寄语
    const editParentMessage = () => {
      if (!currentCard.value) {
        // 先生成报告卡
        uni.showModal({
          title: '提示',
          content: '请先生成报告卡',
          showCancel: false
        })
        return
      }
      uni.navigateTo({
        url: `/pages/growth-report-card/parent-message?cardId=${currentCard.value.id}&babyId=${currentBabyId.value}`
      })
    }

    // 跳转到历史记录
    const goToHistory = () => {
      uni.navigateTo({
        url: `/pages/growth-report-card/history?babyId=${currentBabyId.value}`
      })
    }

    // 返回
    const goBack = () => {
      uni.navigateBack()
    }

    // 加载更多
    const loadMore = () => {
      // 可以实现分页加载
    }

    // 监听宝宝切换
    uni.$on('baby:switched', (babyId) => {
      currentBabyId.value = babyId
      loadReportCardData()
    })

    // 监听报告卡更新
    uni.$on('growthReportCard:updated', () => {
      loadReportCardData()
    })

    // 销毁时清理
    onUnmounted(() => {
      uni.$off('baby:switched')
      uni.$off('growthReportCard:updated')
    })

    return {
      // 状态
      babies,
      currentBabyId,
      currentSemester,
      currentCard,
      radarData,
      semesterComparison,
      progressData,
      availableSemesters,
      scoreDescription,
      scoreClass,

      // 方法
      switchBaby,
      selectSemester,
      formatSemesterDateRange,
      formatSemesterShort,
      drawRadarChart,
      onCanvasTouch,
      showDimensionDetail,
      editReportCard,
      publishReportCard,
      editParentMessage,
      goToHistory,
      goBack,
      loadMore,

      // 常量
      ABILITY_INFO
    }
  }
}
</script>

<style scoped>
.growth-report-card-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 20px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.nav-left .icon,
.nav-right .icon {
  font-size: 20px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

.baby-selector {
  display: flex;
  gap: 10px;
  padding: 15px;
  overflow-x: auto;
  background: #fff;
}

.baby-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.baby-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.baby-emoji {
  font-size: 16px;
}

.baby-name {
  font-size: 14px;
}

.semester-selector {
  background: #fff;
  padding: 0 15px 15px;
}

.semester-tabs {
  display: flex;
  gap: 8px;
}

.semester-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-radius: 8px;
  background: #f0f0f0;
}

.semester-tab.active {
  background: #667eea;
  color: #fff;
}

.semester-label {
  font-size: 12px;
}

.semester-date-range {
  text-align: center;
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

.main-scroll {
  height: calc(100vh - 200px);
}

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
  margin-bottom: 15px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  margin-left: auto;
  font-size: 12px;
  color: #667eea;
}

/* 综合素质报告 */
.overall-score-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.score-circle.excellent {
  background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
}

.score-circle.good {
  background: linear-gradient(135deg, #FA8C16 0%, #FFC53D 100%);
}

.score-value {
  font-size: 28px;
  font-weight: 700;
}

.score-unit {
  font-size: 12px;
  opacity: 0.8;
}

.score-label {
  flex: 1;
}

.score-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.score-desc {
  display: block;
  font-size: 13px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-outline {
  background: transparent;
  border: 1px solid #667eea;
  color: #667eea;
}

/* 雷达图 */
.radar-chart-container {
  margin-bottom: 15px;
}

.radar-canvas {
  width: 100%;
  height: 280px;
}

.radar-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #f9f9f9;
  border-radius: 6px;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  flex: 1;
  font-size: 12px;
  color: #666;
}

.legend-value {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

/* 维度列表 */
.dimension-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.dimension-item.improved {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%);
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.dimension-rank {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ddd;
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dimension-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.dimension-info {
  flex: 1;
}

.dimension-name {
  display: block;
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.dimension-bar-wrap {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.dimension-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.dimension-score {
  text-align: right;
}

.score-num {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.score-max {
  font-size: 11px;
  color: #999;
}

.dimension-change {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.dimension-change .up {
  color: #52C41A;
  background: rgba(82, 196, 26, 0.1);
}

.dimension-change .down {
  color: #F5222D;
  background: rgba(245, 34, 45, 0.1);
}

/* 学期对比 */
.compare-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 120px;
  padding: 10px 0;
}

.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.compare-semester {
  font-size: 11px;
  color: #666;
}

.compare-bar-wrap {
  width: 30px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.compare-bar {
  width: 100%;
  border-radius: 4px;
  transition: height 0.3s;
}

.compare-score {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 学期总结 */
.summary-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 15px;
}

.summary-section {
  margin-top: 10px;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.label-icon {
  font-size: 14px;
}

.highlights-list,
.improvements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.highlight-tag {
  padding: 6px 12px;
  background: rgba(82, 196, 26, 0.1);
  color: #52C41A;
  border-radius: 16px;
  font-size: 12px;
}

.improvement-tag {
  padding: 6px 12px;
  background: rgba(250, 140, 22, 0.1);
  color: #FA8C16;
  border-radius: 16px;
  font-size: 12px;
}

/* 家长寄语 */
.empty-message {
  text-align: center;
  padding: 20px 0;
}

.empty-hint {
  display: block;
  font-size: 13px;
  color: #999;
  margin-bottom: 15px;
}

.message-section {
  margin-bottom: 15px;
}

.message-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.message-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.expectations-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.expectation-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.exp-bullet {
  color: #667eea;
  font-weight: 600;
}

.exp-text {
  flex: 1;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 进步追踪 */
.progress-summary {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
}

.progress-item {
  text-align: center;
}

.progress-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.progress-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.progress-value.positive {
  color: #52C41A;
}

.progress-value.negative {
  color: #F5222D;
}

.progress-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.progress-dim-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f9f9f9;
  border-radius: 6px;
}

.progress-dim-item.improved {
  background: rgba(82, 196, 26, 0.05);
}

.dim-icon {
  font-size: 16px;
}

.dim-name {
  flex: 1;
  font-size: 12px;
  color: #333;
}

.dim-change {
  font-size: 12px;
  font-weight: 600;
}

.dim-change.up {
  color: #52C41A;
}

.dim-change.down {
  color: #F5222D;
}

.bottom-space {
  height: 20px;
}
</style>
