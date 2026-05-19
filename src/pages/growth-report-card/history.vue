<!--
  V87 Growth Report Card History Page
  成长报告卡历史记录页面
-->
<template>
  <view class="history-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">历史报告</text>
      <view class="nav-right"></view>
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

    <scroll-view class="history-scroll" scroll-y>
      <!-- 报告卡列表 -->
      <view class="report-list" v-if="reportCards.length > 0">
        <view
          v-for="card in reportCards"
          :key="card.id"
          class="report-card"
          :class="{ published: card.status === 'published', draft: card.status === 'draft' }"
          @click="viewReportCard(card)"
        >
          <view class="card-header">
            <view class="card-info">
              <text class="card-semester">{{ formatSemester(card.semester) }}</text>
              <view class="card-status" :class="card.status">
                {{ card.status === 'published' ? '已发布' : '草稿' }}
              </view>
            </view>
            <text class="card-date">{{ formatDate(card.generatedAt) }}</text>
          </view>

          <view class="card-body">
            <!-- 综合评分 -->
            <view class="card-score">
              <view class="score-circle-small" :class="getScoreClass(card.overallScore)">
                <text class="score-num">{{ card.overallScore }}</text>
              </view>
              <text class="score-label">综合评价</text>
            </view>

            <!-- 雷达图缩略图 -->
            <view class="card-radar-preview">
              <canvas
                :canvas-id="'radar-' + card.id"
                :id="'radar-' + card.id"
                class="mini-radar-canvas"
              ></canvas>
            </view>

            <!-- 维度得分 -->
            <view class="card-dimensions">
              <view
                v-for="(score, dim) in getTopDimensions(card.dimensionScores)"
                :key="dim"
                class="dim-chip"
                :style="{ borderColor: ABILITY_INFO[dim]?.color || '#999' }"
              >
                <text class="dim-chip-icon">{{ ABILITY_INFO[dim]?.icon }}</text>
                <text class="dim-chip-score">{{ score }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="card-actions" @click.stop>
            <view
              class="action-btn"
              v-if="card.status === 'draft'"
              @click="publishCard(card)"
            >
              <text>发布</text>
            </view>
            <view class="action-btn" @click="editCard(card)">
              <text>编辑</text>
            </view>
            <view class="action-btn danger" @click="deleteCard(card)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📋</text>
        <text class="empty-title">暂无历史报告</text>
        <text class="empty-desc">开始生成第一份成长报告卡吧！</text>
        <button class="btn btn-primary" @click="createNewReport">生成报告</button>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGrowthReportCardStore } from '@/stores/growthReportCardStore.js'
import growthReportCardService, { ABILITY_INFO, ABILITY_DIMENSION } from '@/services/growthReportCardService.js'

export default {
  setup() {
    const store = useGrowthReportCardStore()

    // 状态
    const babies = ref([])
    const currentBabyId = ref('')
    const reportCards = ref([])

    // 初始化
    onMounted(() => {
      store.init()
      loadBabies()

      // 绘制雷达图
      nextTick(() => {
        setTimeout(() => {
          drawAllMiniRadar()
        }, 100)
      })
    })

    // 加载宝宝列表
    const loadBabies = () => {
      try {
        const babyStore = require('@/stores/babyStore').useBabyStore()
        babies.value = babyStore.babies || []
        const storedId = uni.getStorageSync('currentBabyId')
        currentBabyId.value = storedId || (babies.value[0]?.id || '')
        loadReportCards()
      } catch (e) {
        console.error('[History] Load babies failed:', e)
      }
    }

    // 加载报告卡列表
    const loadReportCards = () => {
      reportCards.value = store.getReportCardsByBabyId(currentBabyId.value)
      nextTick(() => {
        drawAllMiniRadar()
      })
    }

    // 切换宝宝
    const switchBaby = (babyId) => {
      currentBabyId.value = babyId
      uni.setStorageSync('currentBabyId', babyId)
      loadReportCards()
    }

    // 格式化学期
    const formatSemester = (semester) => {
      return growthReportCardService.formatSemester(semester)
    }

    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    // 获取评分样式类
    const getScoreClass = (score) => {
      if (score >= 4) return 'excellent'
      if (score >= 3) return 'good'
      return 'normal'
    }

    // 获取最高维度
    const getTopDimensions = (dimensionScores) => {
      if (!dimensionScores) return {}
      const entries = Object.entries(dimensionScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
      return Object.fromEntries(entries)
    }

    // 绘制所有迷你雷达图
    const drawAllMiniRadar = () => {
      reportCards.value.forEach(card => {
        drawMiniRadar(card)
      })
    }

    // 绘制迷你雷达图
    const drawMiniRadar = (card) => {
      const canvasId = 'radar-' + card.id
      const query = uni.createSelectorQuery()
      query.select('#' + canvasId).boundingClientRect(rect => {
        if (!rect) return

        const ctx = uni.createCanvasContext(canvasId)
        const width = rect.width
        const height = rect.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 2 - 5

        // 清空画布
        ctx.clearRect(0, 0, width, height)

        // 获取数据
        const data = Object.entries(card.dimensionScores || {}).map(([dim, value]) => ({
          label: ABILITY_INFO[dim]?.label || dim,
          color: ABILITY_INFO[dim]?.color || '#667eea',
          value,
          maxValue: 5
        }))

        if (data.length === 0) return

        const sides = data.length
        const angleStep = Math.PI * 2 / sides

        // 绘制背景网格
        for (let level = 1; level <= 3; level++) {
          const levelRadius = radius * (level / 3)
          ctx.beginPath()
          for (let i = 0; i <= sides; i++) {
            const angle = i * angleStep - Math.PI / 2
            const x = centerX + Math.cos(angle) * levelRadius
            const y = centerY + Math.sin(angle) * levelRadius
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.strokeStyle = '#eee'
          ctx.lineWidth = 0.5
          ctx.stroke()
        }

        // 绘制数据区域
        ctx.beginPath()
        for (let i = 0; i < sides; i++) {
          const value = data[i].value
          const maxValue = data[i].maxValue
          const levelRadius = radius * (value / maxValue)
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + Math.cos(angle) * levelRadius
          const y = centerY + Math.sin(angle) * levelRadius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fillStyle = 'rgba(102, 126, 234, 0.2)'
        ctx.fill()
        ctx.strokeStyle = '#667eea'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.draw()
      }).exec()
    }

    // 查看报告卡
    const viewReportCard = (card) => {
      uni.navigateTo({
        url: `/pages/growth-report-card/index?babyId=${card.babyId}&semester=${card.semester}`
      })
    }

    // 编辑报告卡
    const editCard = (card) => {
      uni.navigateTo({
        url: `/pages/growth-report-card/edit?babyId=${card.babyId}&semester=${card.semester}`
      })
    }

    // 发布报告卡
    const publishCard = (card) => {
      uni.showModal({
        title: '确认发布',
        content: '发布后报告卡将无法修改，确定要发布吗？',
        success: (res) => {
          if (res.confirm) {
            store.saveReportCard({
              ...card,
              status: 'published'
            })
            uni.showToast({ title: '发布成功', icon: 'success' })
            loadReportCards()
          }
        }
      })
    }

    // 删除报告卡
    const deleteCard = (card) => {
      uni.showModal({
        title: '确认删除',
        content: '删除后数据将无法恢复，确定要删除吗？',
        success: (res) => {
          if (res.confirm) {
            store.deleteReportCard(card.id)
            uni.showToast({ title: '删除成功', icon: 'success' })
            loadReportCards()
          }
        }
      })
    }

    // 创建新报告
    const createNewReport = () => {
      uni.navigateTo({
        url: `/pages/growth-report-card/edit?babyId=${currentBabyId.value}&semester=${store.currentSemester}`
      })
    }

    // 返回
    const goBack = () => {
      uni.navigateBack()
    }

    // 监听宝宝切换
    uni.$on('baby:switched', (babyId) => {
      currentBabyId.value = babyId
      loadReportCards()
    })

    // 监听报告卡更新
    uni.$on('growthReportCard:updated', () => {
      loadReportCards()
    })

    return {
      // 状态
      babies,
      currentBabyId,
      reportCards,

      // 方法
      switchBaby,
      formatSemester,
      formatDate,
      getScoreClass,
      getTopDimensions,
      drawAllMiniRadar,
      viewReportCard,
      editCard,
      publishCard,
      deleteCard,
      createNewReport,
      goBack,

      // 常量
      ABILITY_INFO
    }
  }
}
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 20px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

/* 宝宝选择器 */
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

/* 滚动区域 */
.history-scroll {
  height: calc(100vh - 140px);
  padding: 15px;
}

/* 报告卡列表 */
.report-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.report-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.report-card.published {
  border-left: 4px solid #667eea;
}

.report-card.draft {
  border-left: 4px solid #FA8C16;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-semester {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.card-status.published {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.card-status.draft {
  background: rgba(250, 140, 22, 0.1);
  color: #FA8C16;
}

.card-date {
  font-size: 12px;
  color: #999;
}

.card-body {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
}

.card-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-circle-small {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.score-circle-small.excellent {
  background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
}

.score-circle-small.good {
  background: linear-gradient(135deg, #FA8C16 0%, #FFC53D 100%);
}

.score-num {
  font-size: 20px;
  font-weight: 700;
}

.score-label {
  font-size: 10px;
  color: #999;
}

.card-radar-preview {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.mini-radar-canvas {
  width: 80px;
  height: 80px;
}

.card-dimensions {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dim-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  background: rgba(0,0,0,0.03);
  border: 1px solid;
  border-radius: 12px;
}

.dim-chip-icon {
  font-size: 12px;
}

.dim-chip-score {
  font-size: 11px;
  font-weight: 600;
  color: #333;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  padding: 8px 0;
  text-align: center;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
}

.action-btn.danger {
  background: rgba(245, 34, 45, 0.1);
  color: #F5222D;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.empty-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-desc {
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 30px;
  border-radius: 8px;
  font-size: 14px;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.bottom-space {
  height: 20px;
}
</style>
