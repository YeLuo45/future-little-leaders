<!--
  V87 Growth Report Card Edit Page
  成长报告卡编辑页面
-->
<template>
  <view class="edit-page-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">{{ isNew ? '生成报告' : '编辑报告' }}</text>
      <view class="nav-right" @click="saveReport">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <scroll-view class="edit-scroll" scroll-y>
      <!-- 基本信息 -->
      <view class="section-card">
        <view class="section-title">基本信息</view>
        <view class="info-row">
          <text class="info-label">宝宝</text>
          <text class="info-value">{{ baby?.name || '未知' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">学期</text>
          <text class="info-value">{{ formatSemester(semester) }}</text>
        </view>
      </view>

      <!-- 综合评分 -->
      <view class="section-card">
        <view class="section-title">综合评分</view>
        <view class="score-selector">
          <view
            v-for="score in [1, 2, 3, 4, 5]"
            :key="score"
            class="score-star"
            :class="{ active: overallScore >= score }"
            @click="setOverallScore(score)"
          >
            <text class="star-icon">{{ overallScore >= score ? '★' : '☆' }}</text>
          </view>
        </view>
        <text class="score-desc">{{ scoreDescriptions[overallScore - 1] }}</text>
      </view>

      <!-- 能力维度评分 -->
      <view class="section-card">
        <view class="section-title">能力维度评分</view>
        <view class="dimension-input-list">
          <view
            v-for="(info, dim) in ABILITY_INFO"
            :key="dim"
            class="dimension-input-item"
          >
            <view class="dim-header">
              <text class="dim-icon">{{ info.icon }}</text>
              <text class="dim-label">{{ info.label }}</text>
            </view>
            <view class="dim-slider-wrap">
              <slider
                :value="dimensionScores[dim] || 3"
                min="1"
                max="5"
                step="0.5"
                activeColor="#667eea"
                backgroundColor="#e0e0e0"
                block-size="18"
                @change="(e) => setDimensionScore(dim, e.detail.value)"
              />
              <text class="dim-value">{{ dimensionScores[dim] || 3 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 学期总结 -->
      <view class="section-card">
        <view class="section-title">学期总结</view>
        <textarea
          class="summary-input"
          v-model="summary"
          placeholder="请输入学期总结..."
          maxlength="500"
        />
        <text class="char-count">{{ summary.length }}/500</text>
      </view>

      <!-- 亮点 -->
      <view class="section-card">
        <view class="section-title">亮点</view>
        <view class="tag-input-list">
          <view
            v-for="(tag, index) in highlights"
            :key="index"
            class="tag-item"
          >
            <text>{{ tag }}</text>
            <text class="tag-remove" @click="removeHighlight(index)">×</text>
          </view>
          <input
            class="tag-add-input"
            v-model="newHighlight"
            placeholder="添加亮点..."
            @confirm="addHighlight"
          />
        </view>
      </view>

      <!-- 待提升 -->
      <view class="section-card">
        <view class="section-title">待提升</view>
        <view class="tag-input-list">
          <view
            v-for="(tag, index) in improvements"
            :key="index"
            class="tag-item improvement"
          >
            <text>{{ tag }}</text>
            <text class="tag-remove" @click="removeImprovement(index)">×</text>
          </view>
          <input
            class="tag-add-input"
            v-model="newImprovement"
            placeholder="添加待提升项..."
            @confirm="addImprovement"
          />
        </view>
      </view>

      <!-- 预览雷达图 -->
      <view class="section-card">
        <view class="section-title">预览雷达图</view>
        <view class="preview-radar">
          <canvas
            canvas-id="previewRadarCanvas"
            id="previewRadarCanvas"
            class="radar-canvas"
          ></canvas>
        </view>
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

    // 页面状态
    const babyId = ref('')
    const semester = ref('')
    const baby = ref(null)
    const isNew = ref(true)

    // 表单数据
    const overallScore = ref(3)
    const dimensionScores = ref({})
    const summary = ref('')
    const highlights = ref([])
    const improvements = ref([])
    const newHighlight = ref('')
    const newImprovement = ref('')

    // 评分描述
    const scoreDescriptions = [
      '需要多加努力',
      '表现一般',
      '表现良好',
      '表现优秀',
      '表现卓越'
    ]

    // 初始化
    onMounted(() => {
      // 获取页面参数
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage.options || {}

      babyId.value = options.babyId || ''
      semester.value = options.semester || store.currentSemester

      // 获取宝宝信息
      try {
        const babyStore = require('@/stores/babyStore').useBabyStore()
        baby.value = babyStore.babies.find(b => b.id === babyId.value)
      } catch (e) {
        console.error('[Edit] Load baby failed:', e)
      }

      // 加载已有报告卡或初始化新数据
      const existingCard = store.getReportCardBySemester(semester.value)
      if (existingCard && existingCard.babyId === babyId.value) {
        isNew.value = false
        overallScore.value = existingCard.overallScore || 3
        dimensionScores.value = existingCard.dimensionScores || {}
        summary.value = existingCard.summary || ''
        highlights.value = existingCard.highlights || []
        improvements.value = existingCard.improvements || []
      } else {
        // 初始化默认评分
        Object.keys(ABILITY_DIMENSION).forEach(dim => {
          dimensionScores.value[dim] = 3
        })
      }

      // 绘制预览雷达图
      nextTick(() => {
        drawPreviewRadar()
      })
    })

    // 设置综合评分
    const setOverallScore = (score) => {
      overallScore.value = score
    }

    // 设置维度评分
    const setDimensionScore = (dim, value) => {
      dimensionScores.value[dim] = value
      nextTick(() => {
        drawPreviewRadar()
      })
    }

    // 添加亮点
    const addHighlight = () => {
      if (newHighlight.value.trim()) {
        highlights.value.push(newHighlight.value.trim())
        newHighlight.value = ''
      }
    }

    // 移除亮点
    const removeHighlight = (index) => {
      highlights.value.splice(index, 1)
    }

    // 添加待提升
    const addImprovement = () => {
      if (newImprovement.value.trim()) {
        improvements.value.push(newImprovement.value.trim())
        newImprovement.value = ''
      }
    }

    // 移除待提升
    const removeImprovement = (index) => {
      improvements.value.splice(index, 1)
    }

    // 格式化学期
    const formatSemester = (sem) => {
      return growthReportCardService.formatSemester(sem)
    }

    // 绘制预览雷达图
    const drawPreviewRadar = () => {
      const ctx = uni.createCanvasContext('previewRadarCanvas')
      const query = uni.createSelectorQuery()
      query.select('.preview-radar').boundingClientRect(rect => {
        if (!rect) return
        const width = rect.width
        const height = 250
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 2 - 30

        // 清空画布
        ctx.clearRect(0, 0, width, height)

        // 获取数据
        const data = Object.entries(dimensionScores.value).map(([dim, value]) => ({
          label: ABILITY_INFO[dim]?.label || dim,
          icon: ABILITY_INFO[dim]?.icon || '📌',
          color: ABILITY_INFO[dim]?.color || '#667eea',
          value,
          maxValue: 5
        }))

        const sides = data.length
        const angleStep = Math.PI * 2 / sides

        // 绘制网格
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
          ctx.stroke()
        }

        // 绘制轴线和标签
        for (let i = 0; i < sides; i++) {
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x, y)
          ctx.strokeStyle = '#ddd'
          ctx.stroke()

          // 标签
          const labelRadius = radius + 20
          const labelX = centerX + Math.cos(angle) * labelRadius
          const labelY = centerY + Math.sin(angle) * labelRadius
          ctx.fillStyle = '#666'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(data[i].label, labelX, labelY)
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
        ctx.fillStyle = 'rgba(102, 126, 234, 0.3)'
        ctx.fill()
        ctx.strokeStyle = '#667eea'
        ctx.lineWidth = 2
        ctx.stroke()

        // 绘制数据点
        for (let i = 0; i < sides; i++) {
          const value = data[i].value
          const maxValue = data[i].maxValue
          const levelRadius = radius * (value / maxValue)
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + Math.cos(angle) * levelRadius
          const y = centerY + Math.sin(angle) * levelRadius

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = data[i].color
          ctx.fill()
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        ctx.draw()
      }).exec()
    }

    // 保存报告卡
    const saveReport = () => {
      const card = store.saveReportCard({
        babyId: babyId.value,
        semester: semester.value,
        overallScore: overallScore.value,
        dimensionScores: dimensionScores.value,
        summary: summary.value,
        highlights: highlights.value,
        improvements: improvements.value,
        status: 'draft'
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
      babyId,
      semester,
      baby,
      isNew,
      overallScore,
      dimensionScores,
      summary,
      highlights,
      improvements,
      newHighlight,
      newImprovement,
      scoreDescriptions,

      // 方法
      setOverallScore,
      setDimensionScore,
      addHighlight,
      removeHighlight,
      addImprovement,
      removeImprovement,
      formatSemester,
      drawPreviewRadar,
      saveReport,
      goBack,

      // 常量
      ABILITY_INFO
    }
  }
}
</script>

<style scoped>
.edit-page-container {
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

.save-btn {
  font-size: 14px;
  color: #fff;
}

.edit-scroll {
  height: calc(100vh - 75px);
}

.section-card {
  background: #fff;
  margin: 15px;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
}

/* 评分选择 */
.score-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.score-star {
  font-size: 36px;
  color: #ddd;
  transition: color 0.2s;
}

.score-star.active {
  color: #FFC53D;
}

.score-desc {
  display: block;
  text-align: center;
  font-size: 13px;
  color: #666;
}

/* 维度评分 */
.dimension-input-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dimension-input-item {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}

.dim-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dim-icon {
  font-size: 18px;
}

.dim-label {
  font-size: 14px;
  color: #333;
}

.dim-slider-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dim-slider-wrap slider {
  flex: 1;
}

.dim-value {
  width: 30px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  text-align: right;
}

/* 总结输入 */
.summary-input {
  width: 100%;
  min-height: 120px;
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

/* 标签输入 */
.tag-input-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(82, 196, 26, 0.1);
  color: #52C41A;
  border-radius: 16px;
  font-size: 13px;
}

.tag-item.improvement {
  background: rgba(250, 140, 22, 0.1);
  color: #FA8C16;
}

.tag-remove {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.6;
}

.tag-add-input {
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 13px;
  min-width: 100px;
}

/* 雷达图预览 */
.preview-radar {
  width: 100%;
}

.radar-canvas {
  width: 100%;
  height: 250px;
}

.bottom-space {
  height: 40px;
}
</style>
