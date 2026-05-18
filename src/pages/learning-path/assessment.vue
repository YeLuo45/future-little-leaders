<template>
  <view class="assessment-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">{{ isBreakthrough ? '专项突破' : '能力评估' }}</text>
        <text class="page-subtitle">{{ isBreakthrough ? targetDimensionName : '了解孩子的能力水平' }}</text>
      </view>
      <view class="step-indicator">
        <view 
          v-for="i in totalSteps" 
          :key="i"
          class="step-dot"
          :class="{active: currentStep >= i, current: currentStep === i}"
        ></view>
      </view>
    </view>

    <!-- 步骤1: 选择评估维度 -->
    <view class="step-content" v-if="currentStep === 1 && !isBreakthrough">
      <view class="step-title">
        <text class="step-num">1</text>
        <text class="step-label">选择评估维度</text>
      </view>
      <view class="dimension-grid">
        <view 
          v-for="dim in dimensions" 
          :key="dim.id"
          class="dimension-card"
          :class="{selected: selectedDimensions.includes(dim.id)}"
          :style="{borderColor: selectedDimensions.includes(dim.id) ? dim.color : '#eee'}"
          @tap="toggleDimension(dim.id)"
        >
          <text class="dim-emoji">{{ dim.emoji }}</text>
          <text class="dim-name">{{ dim.name }}</text>
          <text class="dim-desc">{{ dim.description }}</text>
          <view class="dim-check" v-if="selectedDimensions.includes(dim.id)">✓</view>
        </view>
      </view>
      <view class="action-row">
        <button 
          class="primary-btn" 
          :disabled="selectedDimensions.length === 0"
          @tap="startAssessment"
        >
          开始评估 ({{ selectedDimensions.length }})
        </button>
      </view>
    </view>

    <!-- 步骤2: 评估题目 -->
    <view class="step-content" v-if="currentStep === 2">
      <view class="step-title">
        <text class="step-num">2</text>
        <text class="step-label">完成评估测试</text>
      </view>
      
      <view class="question-card">
        <view class="question-header">
          <text class="question-index">第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</text>
          <view class="dimension-tag" :style="{backgroundColor: currentQuestionDim?.color}">
            {{ currentQuestionDim?.emoji }}
          </view>
        </view>
        <text class="question-text">{{ currentQuestionData?.title || '加载中...' }}</text>
        
        <view class="options-list" v-if="currentQuestionData?.options">
          <view 
            v-for="(option, idx) in currentQuestionData.options" 
            :key="idx"
            class="option-item"
            :class="{selected: selectedAnswer === idx}"
            @tap="selectAnswer(idx)"
          >
            <view class="option-letter">{{ String.fromCharCode(65 + idx) }}</view>
            <text class="option-text">{{ option }}</text>
          </view>
        </view>
        
        <view class="answer-input" v-else>
          <input 
            type="text" 
            v-model="textAnswer" 
            placeholder="请输入答案"
            class="answer-field"
          />
        </view>
      </view>
      
      <view class="action-row">
        <button 
          class="secondary-btn" 
          v-if="currentQuestion > 0"
          @tap="prevQuestion"
        >
          上一题
        </button>
        <button 
          class="primary-btn"
          :disabled="selectedAnswer === null && !textAnswer"
          @tap="nextQuestion"
        >
          {{ currentQuestion < totalQuestions - 1 ? '下一题' : '完成评估' }}
        </button>
      </view>
      
      <!-- 进度条 -->
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: ((currentQuestion + 1) / totalQuestions * 100) + '%'}"></view>
      </view>
    </view>

    <!-- 步骤3: 结果展示 -->
    <view class="step-content" v-if="currentStep === 3">
      <view class="step-title">
        <text class="step-num">3</text>
        <text class="step-label">评估结果</text>
      </view>
      
      <!-- 雷达图 -->
      <view class="result-radar">
        <canvas canvas-id="resultRadar" id="resultRadar" class="radar-canvas"></canvas>
      </view>
      
      <!-- 各项得分 -->
      <view class="scores-list">
        <view 
          v-for="score in assessmentResult?.scores" 
          :key="score.dimension"
          class="score-item"
        >
          <view class="score-header">
            <text class="score-emoji">{{ getDimensionEmoji(score.dimension) }}</text>
            <text class="score-name">{{ getDimensionName(score.dimension) }}</text>
            <text class="score-value">{{ score.score }}分</text>
          </view>
          <view class="score-bar">
            <view 
              class="score-fill"
              :style="{
                width: score.score + '%',
                backgroundColor: getDimensionColor(score.dimension)
              }"
            ></view>
          </view>
          <view class="level-badge">
            <text>Lv.{{ score.level }}</text>
          </view>
        </view>
      </view>
      
      <!-- 总体评价 -->
      <view class="overall-comment">
        <text class="comment-title">{{ overallCommentTitle }}</text>
        <text class="comment-text">{{ overallComment }}</text>
      </view>
      
      <view class="action-row">
        <button class="primary-btn" @tap="generatePath">
          {{ hasExistingPath ? '更新学习路径' : '生成学习路径' }}
        </button>
        <button class="secondary-btn" @tap="retakeAssessment">重新评估</button>
      </view>
    </view>

    <!-- 步骤4: 学习路径生成中 -->
    <view class="step-content" v-if="currentStep === 4">
      <view class="generating">
        <view class="gen-icon">🎓</view>
        <text class="gen-title">正在生成学习路径...</text>
        <text class="gen-desc">根据评估结果为您定制个性化方案</text>
        <view class="loading-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
    </view>

    <!-- 步骤5: 学习路径完成 -->
    <view class="step-content" v-if="currentStep === 5">
      <view class="path-complete">
        <view class="complete-icon">✅</view>
        <text class="complete-title">学习路径已生成!</text>
        
        <view class="path-summary">
          <view class="summary-item">
            <text class="sum-num">{{ store.currentPath?.goals?.length || 0 }}</text>
            <text class="sum-label">学习目标</text>
          </view>
          <view class="summary-item">
            <text class="sum-num">{{ store.currentPath?.recommendedCourses?.length || 0 }}</text>
            <text class="sum-label">推荐课程</text>
          </view>
          <view class="summary-item">
            <text class="sum-num">{{ store.weakDimensions?.length || 0 }}</text>
            <text class="sum-label">薄弱领域</text>
          </view>
        </view>
        
        <button class="primary-btn" @tap="viewPath">查看学习路径</button>
        <button class="text-btn" @tap="backToHome">返回首页</button>
      </view>
    </view>
  </view>
</template>

<script>
import { useLearningPathStore } from '@/stores/learningPathStore.js'
import { DIMENSION_CONFIG, ABILITY_DIMENSIONS } from '@/services/learningPathService.js'

export default {
  data() {
    return {
      currentStep: 1,
      totalSteps: 4,
      selectedDimensions: [],
      currentQuestion: 0,
      totalQuestions: 10,
      selectedAnswer: null,
      textAnswer: '',
      questions: [],
      answers: {},
      assessmentResult: null,
      isBreakthrough: false,
      targetDimension: null
    }
  },
  
  onLoad(options) {
    this.store = useLearningPathStore()
    this.dimensions = Object.values(DIMENSION_CONFIG)
    
    if (options.dimension) {
      this.isBreakthrough = true
      this.targetDimension = options.dimension
      this.selectedDimensions = [options.dimension]
      this.startAssessment()
    }
    
    if (options.mode === 'breakthrough' && options.dimension) {
      this.isBreakthrough = true
      this.targetDimension = options.dimension
      this.selectedDimensions = [options.dimension]
      uni.setNavigationBarTitle({ title: '专项突破' })
    }
  },
  
  computed: {
    currentQuestionData() {
      return this.questions[this.currentQuestion] || null
    },
    
    currentQuestionDim() {
      const q = this.currentQuestionData
      if (!q) return null
      return DIMENSION_CONFIG[q.dimension]
    },
    
    targetDimensionName() {
      return DIMENSION_CONFIG[this.targetDimension]?.name || ''
    },
    
    hasExistingPath() {
      return this.store.hasLearningPath
    },
    
    overallCommentTitle() {
      const level = this.assessmentResult?.overallLevel
      const map = {
        advanced: '🎉 太棒了！',
        intermediate: '👍 表现不错',
        beginner: '💪 继续努力',
        starter: '🌱 起步阶段'
      }
      return map[level] || '🌱 起步阶段'
    },
    
    overallComment() {
      const scores = this.assessmentResult?.scores || []
      const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      if (avg >= 85) return '孩子的综合能力非常出色，在多个维度都表现优秀。继续挑战更高难度，将会更上一层楼！'
      if (avg >= 70) return '孩子的综合能力良好，有自己的优势领域。建议针对薄弱环节加强训练，实现均衡发展。'
      if (avg >= 50) return '孩子正处于学习成长的关键期，需要系统的训练来提升各项能力。跟着学习路径一起进步吧！'
      return '每个孩子都有自己的学习节奏。通过持续的练习和适当的学习路径，孩子一定能取得明显进步。'
    }
  },
  
  methods: {
    toggleDimension(dimId) {
      const idx = this.selectedDimensions.indexOf(dimId)
      if (idx === -1) {
        this.selectedDimensions.push(dimId)
      } else {
        this.selectedDimensions.splice(idx, 1)
      }
    },
    
    startAssessment() {
      // 生成题目
      this.questions = this.generateQuestions()
      this.totalQuestions = this.questions.length
      this.currentQuestion = 0
      this.selectedAnswer = null
      this.textAnswer = ''
      this.currentStep = 2
    },
    
    generateQuestions() {
      const questions = []
      const dims = this.selectedDimensions
      const qPerDim = Math.ceil(10 / dims.length)
      
      for (const dim of dims) {
        for (let i = 0; i < qPerDim && questions.length < 10; i++) {
          questions.push({
            id: questions.length,
            dimension: dim,
            title: this.generateQuestionTitle(dim, i),
            options: this.generateQuestionOptions(dim, i),
            difficulty: Math.floor(i / 3) + 1
          })
        }
      }
      
      return questions.slice(0, 10)
    },
    
    generateQuestionTitle(dimension, index) {
      const templates = {
        [ABILITY_DIMENSIONS.LANGUAGE]: [
          '以下哪个是"马"字的正确拼音？',
          '请选择意思与"开心"相同的词语',
          '哪个字是"日"字旁的？',
          '请选出正确的笔画顺序',
          '哪个词语用于形容天气很好？'
        ],
        [ABILITY_DIMENSIONS.MATH]: [
          '3 + 5 = ?',
          '比8小的最大数字是？',
          '下面哪个是双数？',
          '15 - 7 = ?',
          '一双手有几根手指？'
        ],
        [ABILITY_DIMENSIONS.LOGIC]: [
          '找规律: 2, 4, 6, ?',
          '以下哪个与其他三个不同类？',
          '所有的猫都是动物，小花是猫，所以？',
          '排队问题: 小明排第5，后面有3人，共有几人？',
          '哪个杯子最高？'
        ],
        [ABILITY_DIMENSIONS.SOCIAL]: [
          '遇到陌生人询问家庭住址，应该？',
          '向别人借东西应该说？',
          '以下哪种行为是正确的？',
          '和朋友发生矛盾时应该？',
          '什么情况下需要说"谢谢"？'
        ],
        [ABILITY_DIMENSIONS.MOTOR]: [
          '用左手拿起杯子，这是什么动作？',
          '双脚跳比单脚跳更？',
          '系鞋带需要用到什么能力？',
          '哪种运动需要更好的平衡感？',
          '穿衣服属于什么技能？'
        ]
      }
      
      const dimTemplates = templates[dimension] || templates[ABILITY_DIMENSIONS.MATH]
      return dimTemplates[index % dimTemplates.length]
    },
    
    generateQuestionOptions(dimension, index) {
      const options = {
        [ABILITY_DIMENSIONS.LANGUAGE]: [
          ['mǎ', 'mā', 'má', 'mà'],
          ['高兴', '难过', '生气', '害怕'],
          ['河', '机', '明', '打'],
          ['从上到下', '从下到上', '从左到右', '从右到左'],
          ['晴朗', '阴沉', '下雨', '刮风']
        ],
        [ABILITY_DIMENSIONS.MATH]: [
          ['6', '7', '8', '9'],
          ['6', '7', '8', '9'],
          ['1', '3', '5', '7'],
          ['6', '7', '8', '9'],
          ['8', '9', '10', '12']
        ],
        [ABILITY_DIMENSIONS.LOGIC]: [
          ['5', '7', '8', '10'],
          ['苹果', '香蕉', '橙子', '番茄'],
          ['小花是动物', '小花不是动物', '无法确定', '小花是狗'],
          ['7人', '8人', '9人', '10人'],
          ['矮的', '细的', '粗的', '无法判断']
        ],
        [ABILITY_DIMENSIONS.SOCIAL]: [
          ['告诉他', '拒绝并告诉家长', '带他去', '和他一起去'],
          ['给我', '我要', '请借给我', '快点给我'],
          ['插队', '排队', '推挤', '无所谓'],
          ['打架', '冷战', '沟通解决', '告诉老师'],
          ['接受帮助时', '被嘲笑时', '生气时', '无聊时']
        ],
        [ABILITY_DIMENSIONS.MOTOR]: [
          ['精细动作', '大动作', '平衡', '力量'],
          ['简单', '稳定', '困难', '危险'],
          ['专注', '耐心', '细心', '以上都是'],
          ['跑步', '游泳', '单脚站', '踢球'],
          ['大动作', '精细动作', '平衡', '力量']
        ]
      }
      
      const dimOptions = options[dimension] || options[ABILITY_DIMENSIONS.MATH]
      return dimOptions[index % dimOptions.length]
    },
    
    selectAnswer(idx) {
      this.selectedAnswer = idx
    },
    
    prevQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--
        this.selectedAnswer = this.answers[this.currentQuestion] ?? null
      }
    },
    
    nextQuestion() {
      // 保存答案
      if (this.selectedAnswer !== null) {
        this.answers[this.currentQuestion] = this.selectedAnswer
      }
      
      if (this.currentQuestion < this.totalQuestions - 1) {
        this.currentQuestion++
        this.selectedAnswer = null
        this.textAnswer = ''
      } else {
        this.finishAssessment()
      }
    },
    
    finishAssessment() {
      // 计算得分
      const scores = []
      const dimScores = {}
      
      for (const dim of this.selectedDimensions) {
        dimScores[dim] = { score: 0, count: 0 }
      }
      
      // 模拟评分逻辑
      for (let i = 0; i < this.questions.length; i++) {
        const q = this.questions[i]
        const userAnswer = this.answers[i]
        
        // 模拟70-95%的正确率
        const isCorrect = userAnswer !== undefined && Math.random() > 0.2
        if (isCorrect) {
          dimScores[q.dimension].score += 20
        }
        dimScores[q.dimension].count++
      }
      
      for (const dim of this.selectedDimensions) {
        const maxScore = dimScores[dim].count * 20
        const rawScore = dimScores[dim].score
        const normalizedScore = Math.round((rawScore / maxScore) * 100)
        const finalScore = Math.min(100, Math.max(30, normalizedScore + Math.floor(Math.random() * 30)))
        
        scores.push({
          dimension: dim,
          score: finalScore,
          level: 1,
          lastUpdated: new Date().toISOString()
        })
      }
      
      // 如果是突破模式，只更新单个维度
      if (this.isBreakthrough && this.assessmentResult) {
        const existingScores = [...this.assessmentResult.scores]
        const dimIndex = existingScores.findIndex(s => s.dimension === this.targetDimension)
        if (dimIndex !== -1) {
          existingScores[dimIndex] = scores[0]
          this.assessmentResult.scores = existingScores
        }
        
        // 重新计算等级和强弱项
        this.recalculateAssessment()
      } else {
        this.assessmentResult = this.store.doAssessment(scores)
      }
      
      this.currentStep = 3
    },
    
    recalculateAssessment() {
      if (!this.assessmentResult) return
      
      const scores = this.assessmentResult.scores
      for (const score of scores) {
        if (score.score >= 90) score.level = 5
        else if (score.score >= 75) score.level = 4
        else if (score.score >= 60) score.level = 3
        else if (score.score >= 40) score.level = 2
        else score.level = 1
      }
      
      const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      if (avgScore >= 85) this.assessmentResult.overallLevel = 'advanced'
      else if (avgScore >= 70) this.assessmentResult.overallLevel = 'intermediate'
      else if (avgScore >= 50) this.assessmentResult.overallLevel = 'beginner'
      else this.assessmentResult.overallLevel = 'starter'
      
      // 重新分析强弱项
      const sorted = [...scores].sort((a, b) => b.score - a.score)
      const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      this.assessmentResult.strongAreas = sorted.filter(s => s.score > avg + 10).map(s => s.dimension)
      this.assessmentResult.weakAreas = sorted.filter(s => s.score < avg - 10).map(s => s.dimension)
      this.assessmentResult.radarData = scores.map(s => ({
        dimension: s.dimension,
        score: s.score,
        level: s.level,
        maxScore: 100
      }))
    },
    
    generatePath() {
      this.currentStep = 4
      
      setTimeout(() => {
        if (!this.store.hasLearningPath) {
          this.store.initDemo()
        }
        this.currentStep = 5
      }, 1500)
    },
    
    retakeAssessment() {
      this.currentStep = 1
      this.selectedDimensions = []
      this.questions = []
      this.answers = {}
      this.assessmentResult = null
      this.isBreakthrough = false
      this.targetDimension = null
    },
    
    viewPath() {
      uni.navigateTo({
        url: '/pages/learning-path/path-overview'
      })
    },
    
    backToHome() {
      uni.navigateBack()
    },
    
    getDimensionColor(dim) {
      return DIMENSION_CONFIG[dim]?.color || '#999'
    },
    
    getDimensionName(dim) {
      return DIMENSION_CONFIG[dim]?.name || dim
    },
    
    getDimensionEmoji(dim) {
      return DIMENSION_CONFIG[dim]?.emoji || '📚'
    }
  }
}
</script>

<style scoped>
.assessment-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 30px;
  color: #fff;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  display: block;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.8;
  display: block;
  margin-top: 4px;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transition: all 0.3s;
}

.step-dot.active {
  background: rgba(255,255,255,0.7);
}

.step-dot.current {
  width: 24px;
  border-radius: 4px;
  background: #fff;
}

.step-content {
  padding: 20px;
}

.step-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.step-num {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
}

.step-label {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.dimension-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 2px solid #eee;
  position: relative;
  transition: all 0.3s;
}

.dimension-card.selected {
  background: #f8f8ff;
}

.dim-emoji {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.dim-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.dim-desc {
  font-size: 11px;
  color: #999;
  display: block;
}

.dim-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: #52c41a;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
}

.action-row {
  margin-top: 30px;
  display: flex;
  gap: 12px;
}

.primary-btn {
  flex: 1;
  height: 48px;
  line-height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 24px;
  font-size: 16px;
  border: none;
}

.primary-btn[disabled] {
  opacity: 0.5;
}

.secondary-btn {
  flex: 1;
  height: 48px;
  line-height: 48px;
  background: #fff;
  color: #667eea;
  border-radius: 24px;
  font-size: 16px;
  border: 2px solid #667eea;
}

.text-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  margin-top: 12px;
}

.question-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-index {
  font-size: 14px;
  color: #999;
}

.dimension-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.question-text {
  font-size: 18px;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 20px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.option-item.selected {
  border-color: #667eea;
  background: #f0f0ff;
}

.option-letter {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: #eee;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
}

.option-item.selected .option-letter {
  background: #667eea;
  color: #fff;
}

.option-text {
  font-size: 16px;
  color: #333;
}

.answer-input {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.answer-field {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.progress-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin-top: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.result-radar {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.radar-canvas {
  width: 200px;
  height: 200px;
}

.scores-list {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.score-item {
  margin-bottom: 16px;
  position: relative;
}

.score-item:last-child {
  margin-bottom: 0;
}

.score-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.score-emoji {
  font-size: 18px;
  margin-right: 8px;
}

.score-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.score-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.score-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.level-badge {
  position: absolute;
  right: 0;
  top: 24px;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  color: #666;
}

.overall-comment {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.comment-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.comment-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.generating {
  background: #fff;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
}

.gen-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.gen-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.gen-desc {
  font-size: 14px;
  color: #999;
  display: block;
  margin-bottom: 30px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.path-complete {
  background: #fff;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
}

.complete-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.complete-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30px;
}

.path-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.summary-item {
  text-align: center;
}

.sum-num {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.sum-label {
  font-size: 12px;
  color: #999;
}
</style>
