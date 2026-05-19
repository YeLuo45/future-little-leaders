<template>
  <view class="social-dojo-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <text class="page-title">🎭 社交技能道场</text>
        <text class="page-subtitle">情景模拟，对话练习，成为社交小达人</text>
      </view>
      <view class="stats-badge" @tap="switchTab('achievements')">
        <text class="stats-icon">⭐</text>
        <text class="stats-value">{{ store.totalSocialPoints }}</text>
      </view>
    </view>

    <!-- Tab导航 -->
    <view class="tab-bar">
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'scenarios'}"
        @tap="switchTab('scenarios')"
      >
        情景
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'skills'}"
        @tap="switchTab('skills')"
      >
        技能
      </view>
      <view 
        class="tab" 
        :class="{active: store.currentTab === 'achievements'}"
        @tap="switchTab('achievements')"
      >
        成就
      </view>
    </view>

    <!-- 情景列表 -->
    <view class="content" v-if="store.currentTab === 'scenarios'">
      <!-- 类型筛选 -->
      <view class="filter-section">
        <scroll-view class="filter-scroll" scroll-x>
          <view 
            class="filter-chip" 
            :class="{active: !store.filterType}"
            @tap="store.setFilterType('')"
          >
            全部
          </view>
          <view 
            v-for="type in store.scenarioTypeOptions" 
            :key="type.value"
            class="filter-chip"
            :class="{active: store.filterType === type.value}"
            @tap="store.setFilterType(type.value)"
          >
            {{ type.icon }} {{ type.label.replace(/^[^\s]+\s/, '') }}
          </view>
        </scroll-view>
      </view>

      <!-- 情景卡片 -->
      <view class="scenario-list">
        <view 
          v-for="scenario in store.scenarios" 
          :key="scenario.id"
          class="scenario-card"
          :class="{completed: store.isScenarioCompleted(scenario.id)}"
          @tap="viewScenario(scenario)"
        >
          <view class="scenario-header">
            <view class="scenario-icon" :style="{backgroundColor: scenario.coverColor}">
              <text>{{ scenario.icon }}</text>
            </view>
            <view class="scenario-info">
              <text class="scenario-title">{{ scenario.title }}</text>
              <text class="scenario-type">{{ store.getScenarioTypeName(scenario.type) }}</text>
            </view>
            <view class="scenario-difficulty" :style="{color: store.getDifficultyLabel(scenario.difficulty).color}">
              {{ store.getDifficultyLabel(scenario.difficulty).text }}
            </view>
          </view>
          
          <text class="scenario-desc">{{ scenario.description }}</text>
          
          <view class="scenario-footer">
            <view class="scenario-meta">
              <text class="meta-item">⏱️ {{ scenario.estimatedTime }}</text>
              <text class="meta-item">👶 {{ scenario.ageRange }}岁</text>
            </view>
            <view class="scenario-status" v-if="store.isScenarioCompleted(scenario.id)">
              <text class="completed-tag">✓ 已完成</text>
              <text class="best-score" v-if="store.getScenarioBestScore(scenario.id)">
                最佳: {{ store.getScenarioBestScore(scenario.id) }}分
              </text>
            </view>
            <view class="scenario-action" v-else>
              <text class="start-tag">开始练习</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="store.scenarios.length === 0">
          <text class="empty-icon">🎭</text>
          <text class="empty-text">暂无社交情景</text>
          <text class="empty-hint">即将推出更多有趣的社交情景</text>
        </view>
      </view>
    </view>

    <!-- 技能页面 -->
    <view class="content" v-if="store.currentTab === 'skills'">
      <!-- 技能总览 -->
      <view class="skills-overview">
        <view class="overview-card">
          <text class="overview-title">社交技能等级</text>
          <view class="skills-grid">
            <view 
              v-for="skill in store.skillsList" 
              :key="skill.type"
              class="skill-item"
            >
              <view class="skill-icon-wrapper">
                <text class="skill-icon">{{ store.getSkillIcon(skill.type) }}</text>
                <view class="skill-level-badge">{{ skill.level }}</view>
              </view>
              <text class="skill-name">{{ store.getSkillName(skill.type) }}</text>
              <view class="skill-progress-bar">
                <view 
                  class="skill-progress-fill" 
                  :style="{width: skill.progressPercent + '%'}"
                ></view>
              </view>
              <text class="skill-exp">{{ skill.exp }}/100 经验</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 技能说明 -->
      <view class="skill-intro-section">
        <text class="section-title">💡 技能说明</text>
        <view class="skill-intro-list">
          <view class="skill-intro-item">
            <text class="intro-icon">💬</text>
            <view class="intro-content">
              <text class="intro-title">沟通能力</text>
              <text class="intro-desc">清晰表达自己的想法，理解他人的意图</text>
            </view>
          </view>
          <view class="skill-intro-item">
            <text class="intro-icon">❤️</text>
            <view class="intro-content">
              <text class="intro-title">同理心</text>
              <text class="intro-desc">理解并感受他人的情绪和处境</text>
            </view>
          </view>
          <view class="skill-intro-item">
            <text class="intro-icon">⚖️</text>
            <view class="intro-content">
              <text class="intro-title">冲突解决</text>
              <text class="intro-desc">妥善处理分歧，找到双赢方案</text>
            </view>
          </view>
          <view class="skill-intro-item">
            <text class="intro-icon">👑</text>
            <view class="intro-content">
              <text class="intro-title">领导力</text>
              <text class="intro-desc">带领团队达成目标，协调各方</text>
            </view>
          </view>
          <view class="skill-intro-item">
            <text class="intro-icon">🤝</text>
            <view class="intro-content">
              <text class="intro-title">团队协作</text>
              <text class="intro-desc">与他人配合，发挥团队力量</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 成就页面 -->
    <view class="content" v-if="store.currentTab === 'achievements'">
      <!-- 成就统计 -->
      <view class="achievement-overview">
        <view class="overview-card">
          <text class="overview-label">已获得成就</text>
          <text class="overview-value">{{ store.earnedAchievements.length }} / {{ store.achievements.length }}</text>
        </view>
      </view>

      <!-- 成就列表 -->
      <view class="achievement-section">
        <text class="section-title">🏆 我的成就</text>
        
        <!-- 已获得 -->
        <view class="achievement-grid" v-if="store.earnedAchievements.length > 0">
          <view 
            v-for="achievement in store.earnedAchievements" 
            :key="achievement.badgeId"
            class="achievement-card earned"
          >
            <view class="achievement-icon-wrapper" :style="{borderColor: store.getAchievementRarityStyle(achievement.rarity).color}">
              <text class="achievement-icon">{{ achievement.icon }}</text>
            </view>
            <text class="achievement-name">{{ achievement.name }}</text>
            <text class="achievement-desc">{{ achievement.description }}</text>
            <view class="achievement-rarity" :style="{color: store.getAchievementRarityStyle(achievement.rarity).color}">
              {{ store.getAchievementRarityStyle(achievement.rarity).label }}
            </view>
          </view>
        </view>

        <!-- 未获得 -->
        <view class="achievement-grid" v-if="store.unearnedAchievements.length > 0">
          <view 
            v-for="achievement in store.unearnedAchievements" 
            :key="achievement.badgeId"
            class="achievement-card locked"
          >
            <view class="achievement-icon-wrapper locked">
              <text class="achievement-icon">🔒</text>
            </view>
            <text class="achievement-name">{{ achievement.name }}</text>
            <text class="achievement-desc">{{ achievement.description }}</text>
            <view class="achievement-rarity" :style="{color: store.getAchievementRarityStyle(achievement.rarity).color}">
              {{ store.getAchievementRarityStyle(achievement.rarity).label }}
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="store.achievements.length === 0">
          <text class="empty-icon">🏆</text>
          <text class="empty-text">还没有成就</text>
          <text class="empty-hint">完成社交情景练习来获得成就</text>
        </view>
      </view>
    </view>

    <!-- 情景详情弹窗 -->
    <view class="modal-overlay" v-if="showScenarioModal" @tap="closeScenarioModal">
      <view class="modal-content scenario-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedScenario?.title }}</text>
          <view class="close-btn" @tap="closeScenarioModal">✕</view>
        </view>
        
        <scroll-view class="modal-body" scroll-y>
          <view class="scenario-detail-icon" :style="{backgroundColor: selectedScenario?.coverColor}">
            <text class="icon-text">{{ selectedScenario?.icon }}</text>
          </view>
          
          <view class="scenario-detail-info">
            <view class="info-row">
              <text class="info-label">类型</text>
              <text class="info-value">{{ store.getScenarioTypeName(selectedScenario?.type) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">难度</text>
              <text class="info-value" :style="{color: store.getDifficultyLabel(selectedScenario?.difficulty)?.color}">
                {{ store.getDifficultyLabel(selectedScenario?.difficulty)?.text }}
              </text>
            </view>
            <view class="info-row">
              <text class="info-label">时长</text>
              <text class="info-value">{{ selectedScenario?.estimatedTime }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">年龄</text>
              <text class="info-value">{{ selectedScenario?.ageRange }}岁</text>
            </view>
          </view>
          
          <text class="scenario-detail-desc">{{ selectedScenario?.description }}</text>
          
          <view class="scenario-tips">
            <text class="tips-title">💡 练习提示</text>
            <view 
              v-for="(tip, index) in selectedScenario?.tips" 
              :key="index"
              class="tip-item"
            >
              <text class="tip-number">{{ index + 1 }}</text>
              <text class="tip-text">{{ tip }}</text>
            </view>
          </view>
          
          <view class="scenario-rewards">
            <text class="rewards-title">🎁 完成后可获得</text>
            <view class="rewards-row">
              <text class="reward-item">⭐ {{ selectedScenario?.rewards?.points || 50 }} 积分</text>
              <text class="reward-item">🏅 徽章</text>
            </view>
          </view>
          
          <view class="scenario-stats" v-if="store.getScenarioCompleteCount(selectedScenario?.id) > 0">
            <text class="stats-title">📊 历史成绩</text>
            <view class="stats-row">
              <text class="stat-item">完成次数: {{ store.getScenarioCompleteCount(selectedScenario?.id) }}</text>
              <text class="stat-item">最高分: {{ store.getScenarioBestScore(selectedScenario?.id) }}</text>
              <text class="stat-item">平均分: {{ store.getScenarioAvgScore(selectedScenario?.id) }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeScenarioModal">关闭</view>
          <view class="btn btn-primary" @tap="startPractice">开始练习</view>
        </view>
      </view>
    </view>

    <!-- 练习弹窗 -->
    <view class="modal-overlay" v-if="showPracticeModal" @tap.stop>
      <view class="modal-content practice-modal">
        <view class="practice-header">
          <view class="practice-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{width: store.practiceProgress + '%'}"
              ></view>
            </view>
            <text class="progress-text">{{ store.practiceProgress }}%</text>
          </view>
          <view class="close-btn" @tap="exitPractice">✕</view>
        </view>
        
        <!-- 练习结果 -->
        <view class="practice-result" v-if="store.practiceResult">
          <text class="result-icon">{{ getResultIcon() }}</text>
          <text class="result-title">{{ getResultTitle() }}</text>
          <text class="result-score">得分: {{ store.practiceResult.record?.score }}</text>
          <text class="result-rating" :style="{color: store.getRatingName(store.practiceResult.rating)?.color}">
            {{ store.getRatingName(store.practiceResult.rating)?.text }}
          </text>
          
          <view class="result-skills">
            <text class="skills-title">技能提升</text>
            <view class="skills-chips">
              <view 
                v-for="(exp, skill) in store.practiceResult.skillsGained" 
                :key="skill"
                class="skill-chip"
              >
                {{ store.getSkillIcon(skill) }} {{ store.getSkillName(skill) }} +{{ exp }}
              </view>
            </view>
          </view>
          
          <view class="result-points">
            <text class="points-label">获得积分</text>
            <text class="points-value">+{{ store.practiceResult.pointsEarned }}</text>
          </view>
          
          <view class="result-actions">
            <view class="btn btn-cancel" @tap="replayPractice">再练一次</view>
            <view class="btn btn-primary" @tap="closePracticeModal">完成</view>
          </view>
        </view>
        
        <!-- 对话界面 -->
        <view class="practice-content" v-else>
          <view class="dialogue-container">
            <!-- AI对话 -->
            <view 
              v-if="store.currentDialogue?.role === 'ai_partner'" 
              class="dialogue-item ai-dialogue"
            >
              <view class="ai-avatar">
                <text>🤖</text>
              </view>
              <view class="dialogue-bubble">
                <text class="dialogue-content">{{ store.currentDialogue?.content }}</text>
              </view>
            </view>
            
            <!-- 用户选项 -->
            <view 
              v-if="store.currentDialogue?.role === 'user'" 
              class="dialogue-item user-dialogue"
            >
              <view class="dialogue-bubble options-bubble">
                <text class="options-hint">{{ store.currentDialogue?.hint }}</text>
                <view 
                  v-for="(option, index) in store.currentDialogue?.options" 
                  :key="index"
                  class="option-item"
                  :class="{selected: selectedOptionIndex === index}"
                  @tap="selectOption(index)"
                >
                  <text class="option-letter">{{ String.fromCharCode(65 + index) }}</text>
                  <text class="option-text">{{ option.text }}</text>
                </view>
                <view class="submit-btn-wrapper" v-if="selectedOptionIndex !== null">
                  <view class="btn btn-primary submit-btn" @tap="submitOption">
                    <text>提交答案</text>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 反馈显示 -->
            <view 
              v-if="showFeedback && lastResult" 
              class="dialogue-item feedback-dialogue"
            >
              <view class="feedback-bubble" :class="lastResult.score >= 70 ? 'good' : 'improve'">
                <text class="feedback-text">{{ lastResult.feedback }}</text>
                <text class="feedback-score">+{{ lastResult.score }}分</text>
              </view>
            </view>
          </view>
          
          <!-- 底部导航 -->
          <view class="practice-footer" v-if="selectedOptionIndex !== null && !showFeedback">
            <view class="btn btn-primary next-btn" @tap="confirmAndNext">
              <text>下一题</text>
            </view>
          </view>
          <view class="practice-footer" v-else-if="!showFeedback && lastResult">
            <view class="btn btn-primary next-btn" @tap="moveToNext">
              <text>继续</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSocialSkillsDojoStore } from '@/stores/socialSkillsDojoStore.js'

export default {
  data() {
    return {
      showScenarioModal: false,
      showPracticeModal: false,
      selectedScenario: null,
      selectedOptionIndex: null,
      showFeedback: false,
      lastResult: null
    }
  },
  
  computed: {
    store() {
      return useSocialSkillsDojoStore()
    }
  },
  
  onLoad() {
    this.store.init()
  },
  
  onShow() {
    this.store.loadAllData()
  },
  
  methods: {
    switchTab(tab) {
      this.store.switchTab(tab)
    },
    
    viewScenario(scenario) {
      this.selectedScenario = scenario
      this.showScenarioModal = true
    },
    
    closeScenarioModal() {
      this.showScenarioModal = false
      this.selectedScenario = null
    },
    
    startPractice() {
      if (!this.store.currentBabyId) {
        uni.showToast({ title: '请先选择宝宝', icon: 'none' })
        return
      }
      
      if (this.selectedScenario) {
        const success = this.store.startPractice(this.selectedScenario.id)
        if (success) {
          this.closeScenarioModal()
          this.showPracticeModal = true
          this.selectedOptionIndex = null
          this.showFeedback = false
          this.lastResult = null
        }
      }
    },
    
    selectOption(index) {
      this.selectedOptionIndex = index
    },
    
    submitOption() {
      if (this.selectedOptionIndex === null) return
      
      const result = this.store.submitAnswer(this.selectedOptionIndex)
      if (result) {
        this.lastResult = result
        this.showFeedback = true
      }
    },
    
    confirmAndNext() {
      // 用户已看到反馈，点击继续
      this.showFeedback = false
      this.selectedOptionIndex = null
      
      const hasNext = this.store.nextDialogue()
      if (!hasNext) {
        // 完成练习
        this.store.finishPractice()
      }
    },
    
    moveToNext() {
      this.showFeedback = false
      this.selectedOptionIndex = null
      
      const hasNext = this.store.nextDialogue()
      if (!hasNext) {
        this.store.finishPractice()
      }
    },
    
    exitPractice() {
      uni.showModal({
        title: '退出练习',
        content: '确定要退出当前练习吗？进度将不会保存',
        success: (res) => {
          if (res.confirm) {
            this.store.resetPractice()
            this.showPracticeModal = false
            this.selectedOptionIndex = null
            this.showFeedback = false
            this.lastResult = null
          }
        }
      })
    },
    
    replayPractice() {
      this.store.resetPractice()
      if (this.selectedScenario) {
        this.store.startPractice(this.selectedScenario.id)
      }
      this.selectedOptionIndex = null
      this.showFeedback = false
      this.lastResult = null
    },
    
    closePracticeModal() {
      this.store.resetPractice()
      this.showPracticeModal = false
      this.selectedOptionIndex = null
      this.showFeedback = false
      this.lastResult = null
    },
    
    getResultIcon() {
      if (!this.store.practiceResult) return '⭐'
      const rating = this.store.practiceResult.rating
      if (rating === 'excellent') return '🌟'
      if (rating === 'good') return '👍'
      return '💪'
    },
    
    getResultTitle() {
      if (!this.store.practiceResult) return ''
      const rating = this.store.practiceResult.rating
      if (rating === 'excellent') return '太棒了！'
      if (rating === 'good') return '做得不错！'
      return '继续加油！'
    }
  }
}
</script>

<style scoped>
.social-dojo-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.stats-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-icon {
  font-size: 16px;
}

.stats-value {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

.tab-bar {
  display: flex;
  background: #ffffff;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  color: #666;
  position: relative;
}

.tab.active {
  color: #667eea;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #667eea;
  border-radius: 2px;
}

.content {
  padding: 16px;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-chip {
  display: inline-block;
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  margin-right: 10px;
  border: 1px solid #eee;
}

.filter-chip.active {
  background: #667eea;
  color: #ffffff;
  border-color: #667eea;
}

.scenario-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scenario-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.scenario-card.completed {
  border: 2px solid #07c160;
}

.scenario-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.scenario-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
}

.scenario-info {
  flex: 1;
}

.scenario-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: block;
}

.scenario-type {
  font-size: 12px;
  color: #999;
}

.scenario-difficulty {
  font-size: 13px;
  font-weight: 600;
}

.scenario-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.scenario-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scenario-meta {
  display: flex;
  gap: 12px;
}

.meta-item {
  font-size: 12px;
  color: #999;
}

.scenario-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.completed-tag {
  font-size: 12px;
  color: #07c160;
}

.best-score {
  font-size: 12px;
  color: #999;
}

.scenario-action {
  background: #667eea;
  padding: 6px 14px;
  border-radius: 16px;
}

.start-tag {
  font-size: 12px;
  color: #ffffff;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

/* 技能页面 */
.skills-overview {
  margin-bottom: 20px;
}

.overview-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
}

.overview-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16px;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.skill-item {
  text-align: center;
}

.skill-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.skill-icon {
  font-size: 32px;
}

.skill-level-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #667eea;
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 6px;
}

.skill-progress-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin-bottom: 4px;
}

.skill-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
}

.skill-exp {
  font-size: 11px;
  color: #999;
}

.skill-intro-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16px;
}

.skill-intro-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-intro-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.intro-icon {
  font-size: 24px;
}

.intro-content {
  flex: 1;
}

.intro-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.intro-desc {
  font-size: 13px;
  color: #666;
}

/* 成就页面 */
.achievement-overview {
  margin-bottom: 20px;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.overview-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 4px;
}

.overview-value {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
}

.achievement-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.achievement-card {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.achievement-card.earned {
  background: #f0f7ff;
  border: 1px solid #667eea;
}

.achievement-card.locked {
  opacity: 0.6;
}

.achievement-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.achievement-icon-wrapper.locked {
  border-color: #ccc;
}

.achievement-icon {
  font-size: 28px;
}

.achievement-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 11px;
  color: #666;
  display: block;
  margin-bottom: 6px;
  line-height: 1.4;
}

.achievement-rarity {
  font-size: 11px;
  font-weight: 600;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.scenario-modal {
  max-width: 420px;
}

.practice-modal {
  height: 90vh;
  max-width: 420px;
  border-radius: 24px 24px 0 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.btn {
  flex: 1;
  padding: 14px 0;
  border-radius: 12px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

/* 情景详情 */
.scenario-detail-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.icon-text {
  font-size: 40px;
}

.scenario-detail-info {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.info-label {
  font-size: 14px;
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.scenario-detail-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 16px;
}

.scenario-tips {
  background: #fff9e6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.tips-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.tip-number {
  width: 20px;
  height: 20px;
  background: #ffd700;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.scenario-rewards {
  background: #f0f7ff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.rewards-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.rewards-row {
  display: flex;
  gap: 16px;
}

.reward-item {
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

.scenario-stats {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
}

.stats-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-item {
  font-size: 13px;
  color: #666;
}

/* 练习弹窗 */
.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.practice-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 16px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  color: #999;
}

.practice-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dialogue-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.dialogue-item {
  margin-bottom: 16px;
}

.ai-dialogue {
  display: flex;
  gap: 10px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  background: #f0f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.dialogue-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
}

.ai-dialogue .dialogue-bubble {
  background: #f5f5f5;
}

.user-dialogue {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.options-bubble {
  background: #ffffff;
  border: 2px solid #667eea;
  width: 100%;
}

.options-hint {
  font-size: 13px;
  color: #999;
  display: block;
  margin-bottom: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #f8f8f8;
  border-radius: 10px;
  margin-bottom: 8px;
  border: 2px solid transparent;
}

.option-item.selected {
  background: #f0f7ff;
  border-color: #667eea;
}

.option-letter {
  width: 22px;
  height: 22px;
  background: #667eea;
  color: #ffffff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.submit-btn-wrapper {
  margin-top: 12px;
}

.submit-btn {
  padding: 10px 24px;
  border-radius: 20px;
}

.feedback-dialogue {
  display: flex;
  justify-content: center;
}

.feedback-bubble {
  padding: 12px 20px;
  border-radius: 16px;
  text-align: center;
}

.feedback-bubble.good {
  background: #e8f5e9;
  border: 1px solid #07c160;
}

.feedback-bubble.improve {
  background: #fff3e0;
  border: 1px solid #ff9500;
}

.feedback-text {
  font-size: 14px;
  color: #333;
  display: block;
}

.feedback-score {
  font-size: 13px;
  font-weight: bold;
  color: #07c160;
  display: block;
  margin-top: 4px;
}

.practice-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.next-btn {
  padding: 14px;
  border-radius: 12px;
}

/* 练习结果 */
.practice-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.result-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 16px;
}

.result-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.result-score {
  font-size: 18px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.result-rating {
  font-size: 16px;
  font-weight: 600;
  display: block;
  margin-bottom: 24px;
}

.result-skills {
  width: 100%;
  margin-bottom: 20px;
}

.skills-title {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 10px;
}

.skills-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.skill-chip {
  background: #f0f7ff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  color: #667eea;
}

.result-points {
  margin-bottom: 30px;
}

.points-label {
  font-size: 14px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.points-value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
}

.result-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.result-actions .btn {
  flex: 1;
}
</style>
